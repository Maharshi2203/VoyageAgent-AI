import { EmailDeliveryStatus, EmailLog, EmailEventType } from '../../types';
import { getEmailProvider, EmailProvider, SendEmailOptions } from './emailProvider';
import { databaseService } from '../databaseService';

export interface EnqueueEmailJob {
  userId: string;
  recipientEmail: string;
  recipientName: string;
  eventType: EmailEventType;
  subject: string;
  htmlBody: string;
  textBody?: string;
  relatedTripId?: string;
  relatedBookingId?: string;
}

class EmailQueueService {
  private queue: Array<{
    job: EnqueueEmailJob;
    logId: string;
    attempts: number;
    maxAttempts: number;
  }> = [];

  private isProcessing = false;
  private provider: EmailProvider = getEmailProvider();

  constructor() {
    // Check if there are any pending queue jobs on initialization
    this.processQueue();
  }

  /**
   * Set a custom provider if dynamically swapped (e.g., in settings).
   */
  public setProvider(provider: EmailProvider) {
    this.provider = provider;
  }

  /**
   * Enqueue a new email task.
   * Creates an initial EmailLog with status 'QUEUED' and triggers background worker.
   */
  public async enqueue(job: EnqueueEmailJob): Promise<string> {
    const logId = `elog_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const maxAttempts = 3;

    const initialLog: EmailLog = {
      id: logId,
      userId: job.userId,
      recipientEmail: job.recipientEmail,
      recipientName: job.recipientName,
      eventType: job.eventType,
      subject: job.subject,
      htmlBody: job.htmlBody,
      textBody: job.textBody,
      relatedTripId: job.relatedTripId,
      relatedBookingId: job.relatedBookingId,
      status: 'QUEUED',
      attempts: 0,
      maxAttempts,
      createdAt: new Date().toISOString()
    };

    // Save initial log to database
    await databaseService.addEmailLog(initialLog);

    this.queue.push({
      job,
      logId,
      attempts: 0,
      maxAttempts
    });

    // Fire processing in the next microtask (non-blocking)
    setTimeout(() => this.processQueue(), 0);

    return logId;
  }

  /**
   * Process the background queue items one by one.
   */
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    try {
      while (this.queue.length > 0) {
        const item = this.queue.shift();
        if (!item) break;

        await this.processItem(item);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process an individual email job with retry logic.
   */
  private async processItem(item: {
    job: EnqueueEmailJob;
    logId: string;
    attempts: number;
    maxAttempts: number;
  }) {
    item.attempts += 1;

    // Update log status to SENDING
    await databaseService.updateEmailLog(item.logId, {
      status: 'SENDING',
      attempts: item.attempts
    });

    const options: SendEmailOptions = {
      to: item.job.recipientEmail,
      toName: item.job.recipientName,
      subject: item.job.subject,
      html: item.job.htmlBody,
      text: item.job.textBody
    };

    try {
      const result = await this.provider.send(options);

      if (result.success) {
        // Mark as SENT / DELIVERED
        await databaseService.updateEmailLog(item.logId, {
          status: 'SENT',
          providerMessageId: result.messageId,
          sentAt: new Date().toISOString(),
          deliveredAt: result.deliveredAt || new Date().toISOString(),
          attempts: item.attempts,
          error: undefined
        });
      } else {
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (err: any) {
      const errorMessage = err?.message || String(err);
      console.warn(`[EmailQueue] Attempt ${item.attempts}/${item.maxAttempts} failed for log ${item.logId}:`, errorMessage);

      if (item.attempts < item.maxAttempts) {
        // Exponential backoff: 300ms, 900ms, 2700ms
        const delay = Math.pow(3, item.attempts) * 100;
        await new Promise(res => setTimeout(res, delay));
        
        // Re-insert into front of the queue
        this.queue.unshift(item);
      } else {
        // Max retries reached: Mark as FAILED
        await databaseService.updateEmailLog(item.logId, {
          status: 'FAILED',
          attempts: item.attempts,
          error: errorMessage
        });
      }
    }
  }

  /**
   * Check queue depth.
   */
  public getPendingCount(): number {
    return this.queue.length;
  }
}

export const emailQueue = new EmailQueueService();

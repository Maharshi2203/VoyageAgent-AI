export interface SendEmailOptions {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
  headers?: Record<string, string>;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  provider: 'gmail_smtp' | 'resend' | 'dev_console' | 'mock';
  error?: string;
  deliveredAt?: string;
  note?: string;
}

export interface EmailProvider {
  name: string;
  send(options: SendEmailOptions): Promise<EmailSendResult>;
  verifyConnection?(): Promise<boolean>;
}

/**
 * Universal Real-Time Email Provider.
 * Integrates with the backend /api/send-email endpoint to dispatch real emails
 * to Gmail inboxes via Gmail SMTP or Resend REST API.
 * Safely mirrors every dispatched email into the in-app Email Center for inspection.
 */
export class UniversalEmailProvider implements EmailProvider {
  name = 'universal';

  async send(options: SendEmailOptions): Promise<EmailSendResult> {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Try sending via backend /api/send-email (Gmail SMTP or Resend)
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text || options.subject,
          from: options.from
        })
      });

      if (response.ok) {
        const result = await response.json();

        if (result.success) {
          // Record in localStorage for in-app viewing as well
          this.recordInLocalInbox({
            id: result.messageId || messageId,
            to: options.to,
            toName: options.toName,
            from: options.from || 'VoyageAgent AI <notifications@voyageagent.ai>',
            subject: options.subject,
            html: options.html,
            text: options.text,
            sentAt: new Date().toISOString(),
            provider: result.provider || 'gmail_smtp'
          });

          console.group(`%c📧 [REAL-TIME EMAIL DELIVERED TO GMAIL: ${options.to}]`, 'color: #10b981; font-weight: bold;');
          console.log(`Provider: ${result.provider}`);
          console.log(`Subject: ${options.subject}`);
          console.log(`Message ID: ${result.messageId}`);
          console.groupEnd();

          return {
            success: true,
            provider: result.provider || 'gmail_smtp',
            messageId: result.messageId,
            deliveredAt: result.deliveredAt || new Date().toISOString()
          };
        } else if (result.requiresConfig) {
          console.info(`%cℹ [Live Email Delivery Notice]`, 'color: #F59E0B; font-weight: bold;');
          console.info(`To deliver real emails directly into your Gmail account, add your Gmail credentials or Resend API key to .env.local:\nGMAIL_USER=your_email@gmail.com\nGMAIL_APP_PASSWORD=your_16_char_app_password\nOR\nVITE_RESEND_API_KEY=re_...`);
        }
      }
    } catch (apiErr) {
      console.warn('[UniversalEmailProvider] Backend email dispatch warning:', apiErr);
    }

    // 2. Direct client-side Resend API fallback if VITE_RESEND_API_KEY is available
    const resendApiKey = typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_RESEND_API_KEY || import.meta.env.RESEND_API_KEY)
      : undefined;

    if (resendApiKey && resendApiKey.trim().length > 8) {
      try {
        const configuredFrom = (import.meta.env.VITE_EMAIL_FROM || '').trim();
        const fromAddress = configuredFrom.includes('@resend.dev') 
          ? configuredFrom 
          : (configuredFrom && !configuredFrom.includes('voyageagent.ai') 
              ? configuredFrom 
              : 'VoyageAgent AI <onboarding@resend.dev>');

        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey.trim()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [options.to],
            subject: options.subject,
            html: options.html,
            text: options.text || options.subject
          })
        });

        const resendData = await resendRes.json();
        if (resendRes.ok) {
          this.recordInLocalInbox({
            id: resendData.id,
            to: options.to,
            toName: options.toName,
            from: fromAddress,
            subject: options.subject,
            html: options.html,
            text: options.text,
            sentAt: new Date().toISOString(),
            provider: 'resend'
          });

          return {
            success: true,
            provider: 'resend',
            messageId: resendData.id,
            deliveredAt: new Date().toISOString()
          };
        }
      } catch (clientResendErr) {
        console.warn('[UniversalEmailProvider] Direct Resend API call failed:', clientResendErr);
      }
    }

    // 3. Fallback: Save to in-app Email Center
    this.recordInLocalInbox({
      id: messageId,
      to: options.to,
      toName: options.toName,
      from: options.from || 'VoyageAgent AI <notifications@voyageagent.ai>',
      subject: options.subject,
      html: options.html,
      text: options.text,
      sentAt: new Date().toISOString(),
      provider: 'dev_console'
    });

    return {
      success: true,
      messageId,
      provider: 'dev_console',
      deliveredAt: new Date().toISOString(),
      note: 'Stored in local Email Center. Add GMAIL_USER & GMAIL_APP_PASSWORD in .env.local to send to Gmail inbox.'
    };
  }

  private recordInLocalInbox(record: any) {
    try {
      const devInboxKey = 'voyage_email_inbox';
      const existingRaw = localStorage.getItem(devInboxKey);
      const inbox = existingRaw ? JSON.parse(existingRaw) : [];
      inbox.unshift(record);
      if (inbox.length > 100) inbox.length = 100;
      localStorage.setItem(devInboxKey, JSON.stringify(inbox));

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('voyage_email_sent', { detail: record }));
      }
    } catch (e) {
      console.warn('Could not record to local inbox:', e);
    }
  }
}

let activeProviderInstance: EmailProvider = new UniversalEmailProvider();

export function getEmailProvider(): EmailProvider {
  return activeProviderInstance;
}

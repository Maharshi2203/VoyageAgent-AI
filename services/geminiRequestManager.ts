/**
 * GeminiRequestManager
 * =====================
 * Central manager for all Gemini API calls.
 *
 * Features:
 *  - Serial queue (max 1 concurrent request – respects free-tier RPM limits)
 *  - In-flight deduplication via pending-promise map
 *  - LRU-style response cache with 10-minute TTL
 *  - Automatic retry with exponential backoff on 429
 *  - AbortController per request
 *  - Structured console logging
 *  - User-friendly error messages
 */

import { GoogleGenAI } from '@google/genai';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GeminiRequestOptions {
  model: string;
  contents: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config?: Record<string, any>;
  /** Override cache key. Defaults to a hash of model+contents+config. */
  cacheKey?: string;
  /** AbortSignal from the caller to cancel this request. */
  signal?: AbortSignal;
}

interface CacheEntry {
  value: string;
  expiresAt: number;
}

interface QueueItem {
  options: GeminiRequestOptions;
  resolve: (value: string) => void;
  reject: (reason: unknown) => void;
  abortController: AbortController;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CACHE_TTL_MS  = 10 * 60 * 1000; // 10 minutes
const MAX_RETRIES   = 3;
const BASE_DELAY_MS = 5_000;           // minimum wait between retries (ms)

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildCacheKey(opts: GeminiRequestOptions): string {
  if (opts.cacheKey) return opts.cacheKey;
  const raw = `${opts.model}::${opts.contents}::${JSON.stringify(opts.config ?? {})}`;
  let h = 0;
  for (let i = 0; i < raw.length; i++) { h = (h << 5) - h + raw.charCodeAt(i); h |= 0; }
  return `gm_${Math.abs(h)}`;
}

function parseRetryDelayMs(error: unknown): number {
  try {
    const msg   = error instanceof Error ? error.message : String(error);
    const start = msg.indexOf('{');
    if (start === -1) return BASE_DELAY_MS;
    const json  = JSON.parse(msg.substring(start));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const info  = (json?.error?.details as any[])?.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (d: any) => d['@type']?.includes('RetryInfo'),
    );
    if (info?.retryDelay) {
      return Math.ceil(parseFloat(info.retryDelay)) * 1000;
    }
  } catch { /* ignore */ }
  return BASE_DELAY_MS;
}

function is429(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED');
}

/**
 * Returns true when the daily free-tier quota is exhausted.
 * Per-day violations cannot be resolved by waiting 60s — retrying is pointless.
 */
function isDailyQuotaExhausted(error: unknown): boolean {
  try {
    const msg   = error instanceof Error ? error.message : String(error);
    const start = msg.indexOf('{');
    if (start === -1) return false;
    const json       = JSON.parse(msg.substring(start));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const violations = (json?.error?.details as any[])?.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (d: any) => d['@type']?.includes('QuotaFailure'),
    )?.violations ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return violations.some((v: any) =>
      typeof v.quotaId === 'string' && v.quotaId.toLowerCase().includes('perday'),
    );
  } catch {
    return false;
  }
}

/** Convert a raw API error to a human-readable message. */
export function friendlyErrorMessage(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.includes('PERMISSION_DENIED') || msg.includes('403'))
    return 'API key permission denied. Check your API key in .env.local.';
  if (msg.includes('API_KEY_INVALID') || msg.includes('401'))
    return 'Invalid API key. Replace it with a valid Gemini API key.';
  if (is429(error)) {
    if (isDailyQuotaExhausted(error))
      return '🚫 Daily free-tier quota exhausted for this API key. Please wait until tomorrow (quota resets at midnight PT), or add a new API key from a different Google account in .env.local.';
    const secs = Math.ceil(parseRetryDelayMs(error) / 1000);
    return `⏳ Rate limit hit. Retrying automatically in ~${secs}s…`;
  }
  if (msg.includes('503') || msg.includes('UNAVAILABLE'))
    return 'Gemini service is temporarily unavailable. Please try again shortly.';
  if (msg.includes('NetworkError') || msg.includes('Failed to fetch'))
    return 'Network connection lost. Please check your internet connection.';
  if (msg.includes('AbortError') || msg.includes('cancelled'))
    return 'Request was cancelled.';
  return `Unexpected error: ${msg.slice(0, 120)}`;
}

// ─── GeminiRequestManager ─────────────────────────────────────────────────────

/** Collect all API keys from env: VITE_GEMINI_API_KEY, VITE_GEMINI_API_KEY_2, … */
function loadApiKeys(): string[] {
  const env = (import.meta as { env: Record<string, string> }).env;
  const keys: string[] = [];
  const primary = env.VITE_GEMINI_API_KEY;
  if (primary) keys.push(primary);
  for (let i = 2; i <= 10; i++) {
    const k = env[`VITE_GEMINI_API_KEY_${i}`];
    if (k) keys.push(k);
  }
  return keys;
}

class GeminiRequestManager {
  private keys: string[];
  private keyIndex = 0;
  private ai: GoogleGenAI;
  private exhaustedKeys = new Set<string>();
  private cache    = new Map<string, CacheEntry>();
  private pending  = new Map<string, Promise<string>>();
  private queue: QueueItem[] = [];
  private busy     = false;

  constructor() {
    this.keys = loadApiKeys();
    if (this.keys.length === 0) {
      console.warn('[GeminiRM] No API keys found. Set VITE_GEMINI_API_KEY in .env.local.');
      this.keys = [''];
    }
    this.ai = new GoogleGenAI({ apiKey: this.keys[0] });
    console.debug(`[GeminiRM] Loaded ${this.keys.length} API key(s).`);
  }

  /** Rotate to the next non-exhausted key. Returns true if a new key is available. */
  private rotateKey(): boolean {
    const exhausted = this.keys[this.keyIndex];
    this.exhaustedKeys.add(exhausted);
    const nextIndex = this.keys.findIndex((k, i) => i !== this.keyIndex && !this.exhaustedKeys.has(k));
    if (nextIndex === -1) {
      console.error('[GeminiRM] All API keys have exhausted their daily quota.');
      return false;
    }
    this.keyIndex = nextIndex;
    this.ai = new GoogleGenAI({ apiKey: this.keys[this.keyIndex] });
    console.warn(`[GeminiRM] Daily quota hit – rotated to API key #${this.keyIndex + 1}.`);
    return true;
  }

  // ── Public ──────────────────────────────────────────────────────────────────

  async request(opts: GeminiRequestOptions): Promise<string> {
    const key = buildCacheKey(opts);

    // 1. Cache hit
    const hit = this.cache.get(key);
    if (hit && hit.expiresAt > Date.now()) {
      this.log('CACHE HIT', key);
      return hit.value;
    }

    // 2. In-flight deduplication
    const inflight = this.pending.get(key);
    if (inflight) {
      this.log('DEDUP', key);
      return inflight;
    }

    // 3. Create abort controller, merge caller's signal
    const ctrl = new AbortController();
    opts.signal?.addEventListener('abort', () => ctrl.abort(), { once: true });

    // 4. Enqueue
    const promise = new Promise<string>((resolve, reject) => {
      this.queue.push({ options: opts, resolve, reject, abortController: ctrl });
    });

    this.pending.set(key, promise);
    promise.finally(() => this.pending.delete(key));

    this.log('QUEUED', key, `queue depth: ${this.queue.length}`);
    this.drain();
    return promise;
  }

  /** Cancel all queued and in-flight requests. */
  cancelAll(): void {
    for (const item of this.queue) {
      item.abortController.abort();
      item.reject(new Error('cancelled'));
    }
    this.queue = [];
    this.log('CANCEL_ALL', '*');
  }

  clearCache(): void { this.cache.clear(); }

  // ── Private ─────────────────────────────────────────────────────────────────

  private async drain(): Promise<void> {
    if (this.busy || this.queue.length === 0) return;
    this.busy = true;
    try {
      while (this.queue.length > 0) {
        const item = this.queue.shift()!;
        if (item.abortController.signal.aborted) {
          item.reject(new Error('cancelled'));
          continue;
        }
        await this.execute(item, 1);
      }
    } catch (unexpectedErr) {
      // Safety net: execute() should never throw (it calls item.reject internally),
      // but if it somehow does, log it and keep the drain loop alive.
      console.error('[GeminiRM] Unexpected drain error:', unexpectedErr);
    } finally {
      this.busy = false;
      // If items were added while we were processing, resume.
      if (this.queue.length > 0) this.drain().catch(() => {});
    }
  }

  private async execute(item: QueueItem, attempt: number): Promise<void> {
    const key = buildCacheKey(item.options);
    const t0  = Date.now();
    try {
      if (item.abortController.signal.aborted) throw new Error('cancelled');

      const resp = await this.ai.models.generateContent({
        model:    item.options.model,
        contents: item.options.contents,
        ...(item.options.config ? { config: item.options.config } : {}),
      });

      const text = resp.text ?? '';
      this.cache.set(key, { value: text, expiresAt: Date.now() + CACHE_TTL_MS });
      this.log('SUCCESS', key, `${Date.now() - t0}ms, attempt ${attempt}`);
      item.resolve(text);

    } catch (err) {
      const daily = isDailyQuotaExhausted(err);

      // Daily quota exhausted → try rotating to the next API key
      if (is429(err) && daily) {
        this.log('DAILY_LIMIT', key, `Key #${this.keyIndex + 1} exhausted – attempting key rotation`);
        if (this.rotateKey()) {
          // Retry the same request with the new key
          await this.execute(item, attempt);
          return;
        }
        // No more keys available
        this.log('NO_KEYS', key, 'All API keys exhausted');
        item.reject(err);
        return;
      }

      // Rate limit (429 but not daily) → exponential backoff retry
      if (is429(err) && attempt <= MAX_RETRIES) {
        const delay = parseRetryDelayMs(err) * attempt;
        this.log('RETRY', key, `attempt ${attempt}/${MAX_RETRIES}, wait ${Math.ceil(delay / 1000)}s`);
        console.warn(`[GeminiRM] 429 – retrying in ${Math.ceil(delay / 1000)}s (attempt ${attempt}/${MAX_RETRIES})`);

        try {
          await this.sleep(delay, item.abortController.signal);
        } catch {
          item.reject(new Error('cancelled during retry wait'));
          return;
        }
        await this.execute(item, attempt + 1);
      } else {
        this.log('ERROR', key, String(err).slice(0, 120));
        item.reject(err);
      }
    }
  }

  private sleep(ms: number, signal: AbortSignal): Promise<void> {
    return new Promise((res, rej) => {
      const t = setTimeout(res, ms);
      signal.addEventListener('abort', () => { clearTimeout(t); rej(new Error('cancelled')); }, { once: true });
    });
  }

  private log(status: string, key: string, extra?: string): void {
    console.debug(`[GeminiRM] ${status.padEnd(11)} key=${key}${extra ? ` | ${extra}` : ''}`);
  }
}

// Singleton — shared across the entire app
export const geminiRM = new GeminiRequestManager();

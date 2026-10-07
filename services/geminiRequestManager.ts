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
  /** Cache key fixed at enqueue time, so a model switch does not change it. */
  key: string;
  /** Models already attempted for this request with the current API key. */
  triedModels: Set<string>;
  /** The model the caller asked for – tried first again after a key rotation. */
  firstModel: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CACHE_TTL_MS  = 10 * 60 * 1000; // 10 minutes
const MAX_RETRIES   = 3;
const BASE_DELAY_MS = 5_000;           // minimum wait between retries (ms)
const OVERLOAD_DELAY_MS = 2_000;       // first wait after a 503, doubled each attempt
const REQUEST_TIMEOUT_MS = 40_000;     // give up on a hung request and move on

/**
 * Tried in order when the requested model is overloaded, out of quota or hangs.
 * Free-tier limits (per minute and per day) are per model, so switching is
 * faster than waiting.
 */
const FALLBACK_MODELS = ['gemini-3.5-flash', 'gemini-3.5-flash-lite'];

/** Models that reject thinkingConfig (learned at runtime from a 400). */
const NO_THINKING_CONFIG = new Set<string>();

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

/** Transient server-side overload (503) – safe to retry after a short wait. */
function isOverloaded(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('overloaded');
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
  if (msg.includes('404') || msg.includes('no longer available'))
    return 'The requested Gemini model is no longer available. Switched to gemini-3.6-flash.';
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

// ─── OpenAI fallback ──────────────────────────────────────────────────────────

const OPENAI_ENV     = (import.meta as { env: Record<string, string> }).env;
const OPENAI_API_KEY = OPENAI_ENV.VITE_OPENAI_API_KEY || '';
const OPENAI_MODEL   = OPENAI_ENV.VITE_OPENAI_MODEL || 'gpt-4o-mini';

/** Gemini schemas use upper-case type names ("OBJECT"); JSON Schema wants lower-case. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toJsonSchema(schema: any): any {
  if (Array.isArray(schema)) return schema.map(toJsonSchema);
  if (!schema || typeof schema !== 'object') return schema;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(schema)) {
    out[k] = k === 'type' && typeof v === 'string' ? v.toLowerCase() : toJsonSchema(v);
  }
  return out;
}

/** Run a Gemini-shaped request against OpenAI chat completions and return the text. */
async function requestOpenAI(opts: GeminiRequestOptions, signal: AbortSignal): Promise<string> {
  const wantsJson = opts.config?.responseMimeType === 'application/json';
  const schema    = opts.config?.responseSchema ? toJsonSchema(opts.config.responseSchema) : null;
  // OpenAI's JSON mode only allows a top-level object, so arrays go through as plain text.
  const jsonMode  = schema?.type === 'object';

  const system: string[] = [];
  if (wantsJson) system.push('Respond with raw JSON only – no markdown, no code fences, no commentary.');
  if (schema)    system.push(`The JSON must match this JSON Schema exactly:\n${JSON.stringify(schema)}`);

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        ...(system.length ? [{ role: 'system', content: system.join('\n\n') }] : []),
        { role: 'user', content: opts.contents },
      ],
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
    signal,
  });

  if (!res.ok) {
    throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }

  const data = await res.json();
  const text: string = data?.choices?.[0]?.message?.content ?? '';
  // Strip a ```json … ``` wrapper if the model added one anyway
  return wantsJson ? text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '') : text;
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
      this.queue.push({
        options: opts, resolve, reject, abortController: ctrl,
        key, triedModels: new Set(), firstModel: opts.model,
      });
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
    const key = item.key;
    const t0  = Date.now();
    const model = item.options.model;
    item.triedModels.add(model);

    // Thinking roughly triples response time for these prompts, so it is off
    // unless the caller asks for it.
    const thinkingOff = !item.options.config?.thinkingConfig && !NO_THINKING_CONFIG.has(model);

    // Abort the HTTP call on caller cancel or when it hangs past the timeout.
    const http = new AbortController();
    const onCancel = () => http.abort();
    item.abortController.signal.addEventListener('abort', onCancel, { once: true });
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; http.abort(); }, REQUEST_TIMEOUT_MS);

    try {
      if (item.abortController.signal.aborted) throw new Error('cancelled');

      const resp = await this.ai.models.generateContent({
        model,
        contents: item.options.contents,
        config: {
          ...(item.options.config ?? {}),
          ...(thinkingOff ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
          abortSignal: http.signal,
        },
      });

      const text = resp.text ?? '';
      this.cache.set(key, { value: text, expiresAt: Date.now() + CACHE_TTL_MS });
      this.log('SUCCESS', key, `${Date.now() - t0}ms, ${model}, attempt ${attempt}`);
      item.resolve(text);

    } catch (rawErr) {
      if (item.abortController.signal.aborted) {
        item.reject(new Error('cancelled'));
        return;
      }
      const err = timedOut
        ? new Error(`503 UNAVAILABLE: ${model} did not respond within ${REQUEST_TIMEOUT_MS / 1000}s`)
        : rawErr;
      const msg = err instanceof Error ? err.message : String(err);

      // This model does not accept thinkingConfig → remember that and retry without it
      if (thinkingOff && (msg.includes('400') || msg.includes('INVALID_ARGUMENT'))) {
        NO_THINKING_CONFIG.add(model);
        await this.execute(item, attempt);
        return;
      }

      // Overloaded, hung or out of quota → switch model instead of waiting
      if (isOverloaded(err) || is429(err)) {
        const next = FALLBACK_MODELS.find((m) => !item.triedModels.has(m));
        if (next) {
          this.log('FALLBACK', key, `${model} busy – switching to ${next}`);
          console.warn(`[GeminiRM] ${model} is busy – switching to ${next}.`);
          item.options.model = next;
          await this.execute(item, attempt);
          return;
        }
      }

      const is404 = msg.includes('404') || msg.includes('no longer available') || msg.includes('NOT_FOUND');

      // Model retired/unavailable (404) -> Fall back to active model gemini-3.6-flash
      if (is404 && item.options.model !== 'gemini-3.6-flash') {
        this.log('FALLBACK', key, `Model ${item.options.model} returned 404. Retrying with gemini-3.6-flash`);
        console.warn(`[GeminiRM] Model ${item.options.model} is deprecated/unavailable. Falling back to gemini-3.6-flash.`);
        item.options.model = 'gemini-3.6-flash';
        await this.execute(item, attempt);
        return;
      }

      const daily = isDailyQuotaExhausted(err);

      // Daily quota exhausted → try rotating to the next API key
      if (is429(err) && daily) {
        this.log('DAILY_LIMIT', key, `Key #${this.keyIndex + 1} exhausted – attempting key rotation`);
        if (this.rotateKey()) {
          // Retry the same request with the new key, starting from the first model again
          item.triedModels.clear();
          item.options.model = item.firstModel;
          await this.execute(item, attempt);
          return;
        }
        // No more keys available
        this.log('NO_KEYS', key, 'All API keys exhausted');
        await this.fallbackOrReject(item, err);
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
      } else if (isOverloaded(err) && attempt <= MAX_RETRIES) {
        // Server overloaded (503) → short exponential backoff: 2s, 4s, 8s
        const delay = OVERLOAD_DELAY_MS * 2 ** (attempt - 1);
        this.log('RETRY', key, `503 overloaded, attempt ${attempt}/${MAX_RETRIES}, wait ${delay / 1000}s`);
        console.warn(`[GeminiRM] 503 – retrying in ${delay / 1000}s (attempt ${attempt}/${MAX_RETRIES})`);

        try {
          await this.sleep(delay, item.abortController.signal);
        } catch {
          item.reject(new Error('cancelled during retry wait'));
          return;
        }
        await this.execute(item, attempt + 1);
      } else {
        this.log('ERROR', key, String(err).slice(0, 120));
        await this.fallbackOrReject(item, err);
      }
    } finally {
      clearTimeout(timer);
      item.abortController.signal.removeEventListener('abort', onCancel);
    }
  }

  /**
   * Last resort once Gemini has failed for good: answer the same request with
   * OpenAI (if VITE_OPENAI_API_KEY is set). Rejects with the original Gemini
   * error when no fallback is configured or the fallback fails too.
   */
  private async fallbackOrReject(item: QueueItem, geminiErr: unknown): Promise<void> {
    const key = item.key;
    if (!OPENAI_API_KEY || item.abortController.signal.aborted) {
      item.reject(geminiErr);
      return;
    }

    const t0 = Date.now();
    this.log('FALLBACK', key, `Gemini failed – retrying with OpenAI ${OPENAI_MODEL}`);
    console.warn(`[GeminiRM] Gemini failed – falling back to OpenAI (${OPENAI_MODEL}).`);
    try {
      const text = await requestOpenAI(item.options, item.abortController.signal);
      this.cache.set(key, { value: text, expiresAt: Date.now() + CACHE_TTL_MS });
      this.log('SUCCESS', key, `${Date.now() - t0}ms via OpenAI fallback`);
      item.resolve(text);
    } catch (openAiErr) {
      console.error('[GeminiRM] OpenAI fallback failed:', openAiErr);
      item.reject(geminiErr);
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

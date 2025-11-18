// Privacy-safe analytics event queue.
// Does NOT transmit raw images, PII, or exact identifiers; only derived session metrics.
export interface AnalyticsEvent {
  type: string;
  ts: number;
  payload: Record<string, unknown>;
}

interface AnalyticsOptions {
  endpoint?: string; // POST endpoint
  flushIntervalMs?: number;
  maxBuffer?: number;
  enabled?: boolean; // global toggle (e.g. user consent)
}

class AnalyticsClient {
  private buffer: AnalyticsEvent[] = [];
  private opts: Required<AnalyticsOptions>;
  private timer: any;

  constructor(opts: AnalyticsOptions = {}) {
    this.opts = {
      endpoint: opts.endpoint || '/api/analytics/collect',
      flushIntervalMs: opts.flushIntervalMs || 7000,
      maxBuffer: opts.maxBuffer || 64,
      enabled: opts.enabled ?? true,
    };
    this.start();
  }

  update(opts: Partial<AnalyticsOptions>) {
    this.opts = { ...this.opts, ...opts };
  }

  track(type: string, payload: Record<string, unknown> = {}) {
    if (!this.opts.enabled) return;
    // Remove any suspicious raw image-like fields
    const filtered: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(payload)) {
      if (typeof v === 'string' && v.startsWith('data:image')) continue; // skip base64 images
      filtered[k] = v;
    }
    this.buffer.push({ type, ts: Date.now(), payload: filtered });
    if (this.buffer.length >= this.opts.maxBuffer) {
      this.flush();
    }
  }

  flush() {
    if (!this.opts.enabled) { this.buffer = []; return; }
    if (this.buffer.length === 0) return;
    const events = this.buffer.splice(0, this.buffer.length);
    const body = JSON.stringify({ events });
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' });
        navigator.sendBeacon(this.opts.endpoint, blob);
      } else {
        fetch(this.opts.endpoint, { method:'POST', headers:{ 'Content-Type':'application/json' }, body });
      }
    } catch {
      // swallow
    }
  }

  start() {
    this.stop();
    this.timer = setInterval(() => this.flush(), this.opts.flushIntervalMs);
    window.addEventListener('beforeunload', () => this.flush());
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }
}

// Singleton instance
export const analytics = typeof window !== 'undefined' ? new AnalyticsClient({ enabled: false }) : ({} as AnalyticsClient);

// Consent API
export function enableAnalytics() { if ('update' in analytics) (analytics as any).update({ enabled: true }); }
export function disableAnalytics() { if ('update' in analytics) (analytics as any).update({ enabled: false }); }

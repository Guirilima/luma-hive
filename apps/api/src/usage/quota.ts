import { Provider, Settings } from '../../../../packages/domain/src/models';
import { ProviderQuota, QuotaWindow, UsagePeriod } from '../../../../packages/domain/src/usage';
import { capture, launch, resolveExecutable, stopProcess } from '../providers/process';

type Node = Record<string, any>;
const number = (n: unknown): number | null =>
  typeof n === 'number' && Number.isFinite(n) ? n : null;
const percent = (n: unknown) => {
  const v = number(n);
  return v == null ? null : Math.max(0, Math.min(100, v));
};
const date = (value: unknown): string | null => {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  const parsed = new Date(typeof value === 'number' ? value * 1000 : value);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : null;
};
const period = (minutes: number | null): UsagePeriod | 'other' =>
  minutes === 10080
    ? 'week'
    : minutes != null && minutes >= 40320 && minutes <= 44640
      ? 'month'
      : 'other';

function codexLimits(executable: string): Promise<Node> {
  return new Promise((resolve, reject) => {
    const child = launch(executable, ['app-server', '--listen', 'stdio://']);
    let buffer = '',
      finished = false;
    const finish = (error?: Error, result?: Node) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      child.stdin.end();
      stopProcess(child);
      error ? reject(error) : resolve(result!);
    };
    const timer = setTimeout(() => finish(Error('timeout')), 12000);
    child.stdin.on('error', (e) => finish(e));
    child.on('error', (e) => finish(e));
    child.on('close', () => finish(Error('unavailable')));
    child.stderr.on('data', () => {});
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      buffer += chunk;
      if (buffer.length > 1024 * 1024) return finish(Error('unavailable'));
      let cut: number;
      while ((cut = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, cut);
        buffer = buffer.slice(cut + 1);
        let msg: Node;
        try {
          msg = JSON.parse(line);
        } catch {
          continue;
        }
        if (finished || ![1, 2].includes(msg.id)) continue;
        if (msg.error) return finish(Error(String(msg.error.message || 'unavailable')));
        if (msg.id === 1) {
          child.stdin.write(JSON.stringify({ method: 'initialized', params: {} }) + '\n');
          child.stdin.write(
            JSON.stringify({ id: 2, method: 'account/rateLimits/read', params: {} }) + '\n',
          );
        } else finish(undefined, msg.result);
      }
    });
    child.stdin.write(
      JSON.stringify({
        id: 1,
        method: 'initialize',
        params: {
          clientInfo: { name: 'luma_usage', version: '0.1.0' },
          capabilities: { experimentalApi: true },
        },
      }) + '\n',
    );
  });
}

export function codexWindows(raw: Node): QuotaWindow[] {
  const buckets =
    raw?.rateLimitsByLimitId && typeof raw.rateLimitsByLimitId === 'object'
      ? Object.entries(raw.rateLimitsByLimitId)
      : raw?.rateLimits
        ? [['codex', raw.rateLimits]]
        : [];
  const windows: QuotaWindow[] = [];
  for (const [key, value] of buckets) {
    const bucket = value as Node;
    if (!bucket || typeof bucket !== 'object') continue;
    for (const slot of ['primary', 'secondary']) {
      const w = bucket[slot];
      if (!w || typeof w !== 'object') continue;
      const minutes = number(w.windowDurationMins),
        used = percent(w.usedPercent);
      windows.push({
        id: String(key) + ':' + slot,
        group: String(bucket.limitName || bucket.limitId || key),
        period: period(minutes),
        durationMinutes: minutes,
        remainingPercent: used == null ? null : 100 - used,
        remainingAmount: null,
        resetsAt: date(w.resetsAt),
      });
    }
  }
  return windows;
}
export function antigravityWindows(raw: Node): QuotaWindow[] {
  // /usage is a built-in command, never a model prompt. Reject other response shapes.
  if (raw?.command?.name !== 'usage' || !Array.isArray(raw.command?.data?.groups))
    throw Error('unavailable');
  const windows: QuotaWindow[] = [];
  for (const group of raw.command.data.groups) {
    for (const b of Array.isArray(group.buckets) ? group.buckets : []) {
      const fraction = number(b.remaining_fraction);
      const minutes = b.window === 'weekly' ? 10080 : b.window === '5h' ? 300 : null;
      windows.push({
        id: String(b.id || windows.length),
        group: String(group.name || 'Antigravity'),
        period: b.window === 'monthly' ? 'month' : period(minutes),
        durationMinutes: minutes,
        remainingPercent: fraction == null ? null : percent(fraction * 100),
        remainingAmount: number(b.remaining_amount),
        resetsAt: date(b.reset_time),
      });
    }
  }
  return windows;
}

export class QuotaService {
  private cache = new Map<string, ProviderQuota>();
  private pending = new Map<string, Promise<ProviderQuota>>();
  private key(provider: Provider, settings: Settings | null) {
    return provider + ':' + (settings?.providers[provider]?.path || '');
  }
  peek(provider: Provider, settings: Settings | null): ProviderQuota {
    return (
      this.cache.get(this.key(provider, settings)) || {
        status: provider === 'devin' ? 'unsupported' : 'not-checked',
        checkedAt: null,
        windows: [],
        ...(provider === 'devin' ? { reason: 'unsupported' as const } : {}),
      }
    );
  }
  async read(provider: Provider, settings: Settings | null): Promise<ProviderQuota> {
    const key = this.key(provider, settings),
      cached = this.cache.get(key);
    if (cached?.checkedAt && Date.now() - Date.parse(cached.checkedAt) < 30000) return cached;
    if (this.pending.has(key)) return this.pending.get(key)!;
    const task = this.fetch(provider, settings)
      .then((value) => {
        this.cache.set(key, value);
        return value;
      })
      .finally(() => this.pending.delete(key));
    this.pending.set(key, task);
    return task;
  }
  private async fetch(provider: Provider, settings: Settings | null): Promise<ProviderQuota> {
    const checkedAt = new Date().toISOString();
    try {
      const bin =
        settings?.providers[provider]?.path ||
        process.env['LUMA_' + provider.toUpperCase() + '_BIN'] ||
        { codex: 'codex', devin: 'devin', antigravity: 'agy' }[provider];
      const executable = await resolveExecutable(bin);
      if (!executable) return { status: 'not-installed', checkedAt, windows: [] };
      // Installed Devin CLI exposes text responses, but no supported account-quota command.
      if (provider === 'devin')
        return { status: 'unsupported', checkedAt, windows: [], reason: 'unsupported' };
      const windows =
        provider === 'codex'
          ? codexWindows(await codexLimits(executable))
          : antigravityWindows(
              JSON.parse(
                await capture(
                  executable,
                  ['-p', '/usage', '--output-format', 'json', '--print-timeout', '10s'],
                  14000,
                ),
              ),
            );
      return {
        status: windows.length ? 'available' : 'unsupported',
        checkedAt: new Date().toISOString(),
        windows,
      };
    } catch (error) {
      const text = String(error);
      return {
        status: 'error',
        checkedAt: new Date().toISOString(),
        windows: [],
        reason: /auth|login|logged|unauthorized|signed/i.test(text)
          ? 'auth'
          : /timed out|timeout/i.test(text)
            ? 'timeout'
            : 'unavailable',
      };
    }
  }
}

import { PROVIDERS, Run } from '../../../../packages/domain/src/models';
import { UsageSnapshot, UsageTotals } from '../../../../packages/domain/src/usage';
import { WorkspaceRepository } from '../storage/workspace.repository';
import { QuotaService } from './quota';

function token(usage: Record<string, number>, keys: string[]): number | null {
  for (const key of keys) {
    const value = usage[key];
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return value;
  }
  return null;
}
export function summarize(runs: Run[]): UsageTotals {
  const totals: UsageTotals = {
    runs: runs.length,
    reportedRuns: 0,
    unreportedRuns: 0,
    inputTokens: null,
    outputTokens: null,
    cachedTokens: null,
    totalTokens: runs.length ? null : 0,
  };
  const add = (
    key: 'inputTokens' | 'outputTokens' | 'cachedTokens' | 'totalTokens',
    value: number | null,
  ) => {
    if (value != null) totals[key] = (totals[key] || 0) + value;
  };
  for (const run of runs) {
    const usage = run.result?.usage;
    if (!usage) {
      totals.unreportedRuns++;
      continue;
    }
    const input = token(usage, ['input_tokens', 'prompt_tokens', 'inputTokens']),
      output = token(usage, ['output_tokens', 'completion_tokens', 'outputTokens']),
      total = token(usage, ['total_tokens', 'totalTokens']);
    if (input == null && output == null && total == null) {
      totals.unreportedRuns++;
      continue;
    }
    totals.reportedRuns++;
    add('inputTokens', input);
    add('outputTokens', output);
    add(
      'cachedTokens',
      token(usage, [
        'cached_input_tokens',
        'cache_read_tokens',
        'cache_read_input_tokens',
        'cached_tokens',
      ]),
    );
    // Cached tokens are a subset of input, not an additional charge to the total.
    add('totalTokens', total ?? (input != null && output != null ? input + output : null));
  }
  return totals;
}
export class UsageService {
  private quotas = new QuotaService();
  constructor(private readonly repository: WorkspaceRepository) {}
  async snapshot(refresh: boolean): Promise<UsageSnapshot> {
    const now = new Date(),
      week = new Date(now),
      month = new Date(now);
    week.setHours(0, 0, 0, 0);
    week.setDate(week.getDate() - ((week.getDay() + 6) % 7));
    month.setHours(0, 0, 0, 0);
    month.setDate(1);
    const settings = this.repository.read().workspace?.settings || null;
    // Read all runs in the month; the history endpoint intentionally limits its list to 300.
    const runs = this.repository.usageRuns(Math.min(week.getTime(), month.getTime()));
    const providers = await Promise.all(
      PROVIDERS.map(async (provider) => ({
        provider,
        local: {
          week: summarize(
            runs.filter(
              (r) => r.provider === provider && Date.parse(r.startedAt) >= week.getTime(),
            ),
          ),
          month: summarize(
            runs.filter(
              (r) => r.provider === provider && Date.parse(r.startedAt) >= month.getTime(),
            ),
          ),
        },
        quota: refresh
          ? await this.quotas.read(provider, settings)
          : this.quotas.peek(provider, settings),
      })),
    );
    return {
      ok: true,
      generatedAt: now.toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      periods: {
        week: { from: week.toISOString(), to: now.toISOString() },
        month: { from: month.toISOString(), to: now.toISOString() },
      },
      providers,
    };
  }
}

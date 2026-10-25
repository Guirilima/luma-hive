import { Provider } from './models';

export type UsagePeriod = 'week' | 'month';
export interface UsageTotals {
  runs: number;
  reportedRuns: number;
  unreportedRuns: number;
  inputTokens: number | null;
  outputTokens: number | null;
  cachedTokens: number | null;
  totalTokens: number | null;
}
export interface QuotaWindow {
  id: string;
  group: string;
  period: UsagePeriod | 'other';
  durationMinutes: number | null;
  remainingPercent: number | null;
  remainingAmount: number | null;
  resetsAt: string | null;
}
export type QuotaStatus = 'available' | 'not-checked' | 'not-installed' | 'unsupported' | 'error';
export interface ProviderQuota {
  status: QuotaStatus;
  checkedAt: string | null;
  windows: QuotaWindow[];
  reason?: 'auth' | 'timeout' | 'unavailable' | 'unsupported';
}
export interface ProviderUsage {
  provider: Provider;
  local: Record<UsagePeriod, UsageTotals>;
  quota: ProviderQuota;
}
export interface UsageSnapshot {
  ok: true;
  generatedAt: string;
  timezone: string;
  periods: Record<UsagePeriod, { from: string; to: string }>;
  providers: ProviderUsage[];
}

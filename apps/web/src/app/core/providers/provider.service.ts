import { Injectable, inject, signal } from '@angular/core';
import { Provider, Health, Model, PROVIDERS, Effort } from '@domain/models';
import { ApiService } from '../api/api.service';
import { WorkspaceStore } from '../workspace/workspace.store';
import { allowedEfforts } from '@domain/model-selection';
@Injectable({ providedIn: 'root' })
export class ProviderService {
  private readonly api = inject(ApiService);
  private readonly store = inject(WorkspaceStore);
  readonly health = signal<Partial<Record<Provider, Health>>>({});
  readonly catalogs = signal<Partial<Record<Provider, Model[]>>>({});
  readonly errors = signal<Partial<Record<Provider, string>>>({});
  readonly busy = signal<Partial<Record<Provider, boolean>>>({});
  async check(
    provider: Provider,
    path = this.store.settings()?.providers[provider].path || '',
  ): Promise<void> {
    this.busy.update((v) => ({ ...v, [provider]: true }));
    try {
      const health = await this.api.health(provider, path);
      this.health.update((v) => ({ ...v, [provider]: health }));
      if (health.executable && !health.runtimeError) await this.load(provider, path);
      else this.errors.update((v) => ({ ...v, [provider]: health.runtimeError || '' }));
    } catch (e) {
      this.errors.update((v) => ({ ...v, [provider]: (e as Error).message }));
    } finally {
      this.busy.update((v) => ({ ...v, [provider]: false }));
    }
  }
  async all(): Promise<void> {
    await Promise.allSettled(PROVIDERS.map((p) => this.check(p)));
  }
  async load(
    provider: Provider,
    path = this.store.settings()?.providers[provider].path || '',
    refresh = false,
  ): Promise<void> {
    try {
      const result = await this.api.models(provider, path, refresh);
      this.catalogs.update((v) => ({
        ...v,
        [provider]: result.models.map((m) => ({
          ...m,
          isDefault: result.defaultModel ? m.id === result.defaultModel : m.isDefault,
        })),
      }));
      this.errors.update((v) => ({ ...v, [provider]: '' }));
    } catch (e) {
      this.errors.update((v) => ({ ...v, [provider]: (e as Error).message }));
    }
  }
  efforts(provider: Provider, model: string): Effort[] {
    return allowedEfforts(provider, model, this.catalogs()[provider] || []);
  }
}

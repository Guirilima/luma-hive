import { Injectable, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { WorkspaceStore } from '../workspace/workspace.store';
import { AttentionItem, DurableOperation } from '@domain/workflow';
@Injectable({ providedIn: 'root' })
export class WorkflowService implements OnDestroy {
  readonly api = inject(ApiService);
  readonly store = inject(WorkspaceStore);
  readonly operations = signal<DurableOperation[]>([]);
  readonly items = signal<AttentionItem[]>([]);
  readonly error = signal('');
  readonly current = computed(
    () =>
      this.operations().find(
        (o) =>
          o.projectId === this.store.project()?.id &&
          (!['completed', 'cancelled'].includes(o.state) ||
            o.stages.some((s) => s.state === 'uncertain')),
      ) || null,
  );
  private readonly ready = computed(() => !this.store.loading() && !!this.store.workspace());
  private epoch = 0;
  accept(operation: DurableOperation): void {
    this.epoch++;
    this.operations.update((rows) => [operation, ...rows.filter((o) => o.id !== operation.id)]);
  }
  private inflight: Promise<void> | null = null;
  private destroyed = false;
  private readonly timer = setInterval(() => {
    if (this.ready() && document.visibilityState === 'visible') void this.refresh();
  }, 2000);
  constructor() {
    effect(() => {
      if (this.ready()) void this.refresh();
    });
  }
  ngOnDestroy() {
    this.destroyed = true;
    clearInterval(this.timer);
  }
  refresh(): Promise<void> {
    if (!this.ready()) return Promise.resolve();
    if (this.inflight) return this.inflight;
    this.inflight = this.load().finally(() => {
      this.inflight = null;
    });
    return this.inflight;
  }
  private async load() {
    const epoch = this.epoch;
    try {
      const [ops, attention] = await Promise.all([this.api.operations(), this.api.attention(true)]);
      if (this.destroyed) return;
      if (epoch === this.epoch) this.operations.set(ops.operations);
      this.items.set(attention.items);
      this.error.set('');
      if (
        ops.operations.some((o) => !['completed', 'cancelled'].includes(o.state)) ||
        ops.operations.length
      )
        await this.store.synchronize();
    } catch {
      if (!this.destroyed) this.error.set('workflow.connectionError');
    }
  }
  async action(op: DurableOperation, action: string, acknowledge = false) {
    const { operation } = await this.api.operationAction(
      op.id,
      action,
      acknowledge,
      op.stages[op.current]?.id,
    );
    this.accept(operation);
    await this.store.synchronize();
    await this.refresh();
    return operation;
  }
}

import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkflowService } from '../../core/workflow/workflow.service';
import { WorkspaceStore } from '../../core/workspace/workspace.store';
import { DialogService } from '../../core/ui/dialog.service';
import { I18nService, TranslatePipe } from '../../core/i18n/i18n.service';
import { DurableOperation } from '@domain/workflow';
@Component({
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './recovery.component.html',
  styleUrl: './workflow.css',
})
export class RecoveryComponent {
  readonly workflow = inject(WorkflowService);
  readonly store = inject(WorkspaceStore);
  readonly i18n = inject(I18nService);
  readonly dialogs = inject(DialogService);
  readonly router = inject(Router);
  readonly project = signal('');
  readonly selected = signal(inject(ActivatedRoute).snapshot.queryParamMap.get('operation') || '');
  readonly retryAcknowledged = signal(false);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly operations = computed(() =>
    this.workflow.operations().filter((o) => !this.project() || o.projectId === this.project()),
  );
  readonly current = computed(
    () => this.operations().find((o) => o.id === this.selected()) || this.operations()[0] || null,
  );
  private readonly retryTarget = computed(() => {
    const op = this.current(),
      stage = op?.stages[op.current];
    return op?.id + ':' + stage?.id + ':' + stage?.state;
  });
  constructor() {
    effect(() => {
      this.retryTarget();
      this.retryAcknowledged.set(false);
    });
  }
  name(id: string) {
    return this.store.workspace()?.projects.find((p) => p.id === id)?.name || id;
  }
  agent(id: string) {
    return this.store.agent(id)?.name || id;
  }
  confirmed(op: DurableOperation) {
    return op.stages.filter((s) => s.state === 'confirmed').length;
  }
  select(id: string) {
    this.selected.set(id);
    this.retryAcknowledged.set(false);
    this.error.set('');
  }
  async act(action: string) {
    const op = this.current();
    if (!op) return;
    if (
      action === 'cancel' &&
      !(await this.dialogs.ask(
        this.i18n.text('recovery.cancelConfirm'),
        this.i18n.text('recovery.title'),
        this.i18n.text('recovery.cancel'),
        true,
      ))
    )
      return;
    this.busy.set(true);
    this.error.set('');
    try {
      await this.store.flush();
      if (this.store.conflict()) return;
      await this.workflow.action(op, action, this.retryAcknowledged());
      this.retryAcknowledged.set(false);
    } catch (e) {
      this.error.set(this.i18n.text((e as Error).message));
    } finally {
      this.busy.set(false);
    }
  }
  inspect(id: string) {
    void this.router.navigate(['/observability'], { queryParams: { run: id } });
  }
}

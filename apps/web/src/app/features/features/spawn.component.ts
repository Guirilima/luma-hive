import { TranslatePipe } from '../../core/i18n/i18n.service';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { dependenciesReady, projectGaps } from '@domain/workspace';
import { WorkspaceStore } from '../../core/workspace/workspace.store';
import { ExecutionService } from '../../core/execution/execution.service';
import { DialogService } from '../../core/ui/dialog.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { IconComponent } from '../../shared/icon.component';
import { ModalComponent } from '../../shared/modal.component';
@Component({
  selector: 'luma-spawn',
  standalone: true,
  imports: [TranslatePipe, IconComponent, FormsModule, ModalComponent],
  templateUrl: './spawn.component.html',
})
export class SpawnComponent {
  readonly store = inject(WorkspaceStore);
  readonly execution = inject(ExecutionService);
  readonly dialogs = inject(DialogService);
  readonly i18n = inject(I18nService);
  readonly agentId = this.dialogs.current()?.id || this.store.selectedId();
  featureId = this.features()[0]?.id || '';
  constructor() {
    const gaps = projectGaps(this.store.project()!);
    if (gaps.length || !this.features().length)
      queueMicrotask(() => {
        this.store.error.set(
          gaps.length
            ? 'Complete e salve todos os campos do projeto antes de executar.'
            : 'Não há feature disponível para spawn. Adicione uma ou revise as dependências.',
        );
        this.dialogs.close();
      });
  }
  features() {
    const project = this.store.project()!;
    return project.features.filter(
      (f) => !['review', 'done', 'running'].includes(f.status) && dependenciesReady(f, project),
    );
  }
  async start(): Promise<void> {
    if (!this.featureId || this.execution.busy()) return;
    const gaps = projectGaps(this.store.project()!);
    if (gaps.length) {
      this.store.error.set(
        this.i18n.text('error.required') + ' ' + gaps.map((g) => this.i18n.text(g)).join(', '),
      );
      return;
    }
    this.store.change((w) => {
      const f = w.projects
        .find((p) => p.id === w.projectId)!
        .features.find((f) => f.id === this.featureId)!;
      f.route = [this.agentId];
      f.briefs = [];
      f.step = 0;
      f.status = 'ready';
    });
    this.dialogs.close();
    this.execution.room.open();
    this.execution.room.append(
      'Spawn individual de ' +
        this.store.agent(this.agentId)?.name +
        ' para ' +
        this.store.feature(this.featureId)?.key +
        '. Sem comandante: a sessão é só dele.',
      { kind: 'system' },
    );
    await this.execution.run([this.featureId]);
  }
}

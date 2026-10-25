import { FEATURE_SCOPES } from '@domain/workspace';
import { Component, inject, signal, viewChildren } from '@angular/core';
import { MarkdownEditorComponent } from '../../shared/markdown-editor.component';
import { FormsModule } from '@angular/forms';
import { Feature } from '@domain/models';
import { IconComponent } from '../../shared/icon.component';
import { FeatureConversationComponent } from './feature-conversation.component';
import { ROLES } from '@domain/catalog';
import { makeFeature } from '@domain/workspace';
import { WorkspaceStore } from '../../core/workspace/workspace.store';
import { ExecutionService } from '../../core/execution/execution.service';
import { DialogService } from '../../core/ui/dialog.service';
import { ModalComponent } from '../../shared/modal.component';
@Component({
  selector: 'luma-feature-editor',
  standalone: true,
  imports: [
    IconComponent,
    FeatureConversationComponent,
    MarkdownEditorComponent,
    FormsModule,
    ModalComponent,
  ],
  templateUrl: './feature-editor.component.html',
})
export class FeatureEditorComponent {
  readonly store = inject(WorkspaceStore);
  readonly execution = inject(ExecutionService);
  readonly dialogs = inject(DialogService);
  readonly existing = this.store.feature(this.dialogs.current()?.id || '');
  draft: Feature = structuredClone(
    this.dialogs.current()?.data?.feature ||
      this.existing ||
      makeFeature(
        Math.max(
          0,
          ...this.store.project()!.features.map((f) => Number(f.key.replace(/\D/g, '')) || 0),
        ) + 1,
        {
          sprintId: this.dialogs.current()?.field || this.store.project()!.sprints[0].id,
          dependencies: [this.store.project()!.features.find((f) => f.setup)!.id],
        },
      ),
  );
  readonly proposalUndo = signal(this.dialogs.current()?.data?.featureUndo || null);
  undoProposal(): void {
    const previous = this.proposalUndo();
    if (previous) {
      this.draft = structuredClone(previous);
      this.proposalUndo.set(null);
    }
  }
  readonly fields = ['description', 'criteria', 'tasks'] as const;
  readonly editors = viewChildren(MarkdownEditorComponent);
  revealField(field: string): void {
    if (field === 'title')
      document.getElementById('featureTitle')?.scrollIntoView({ block: 'nearest' });
    else
      this.editors()
        .find((editor) => editor.field() === field)
        ?.reveal();
  }
  readonly scopeLabel = (s: string) => FEATURE_SCOPES[s] || s;
  fieldLabel(s: string): string {
    return (
      (
        { description: 'ESCOPO', criteria: 'CRITÉRIOS DE ACEITAÇÃO', tasks: 'TAREFAS' } as Record<
          string,
          string
        >
      )[s] || s
    );
  }
  pad(n: number): string {
    return String(n).padStart(2, '0');
  }
  dependencyNames(): string {
    return this.draft.dependencies
      .map((id) => this.store.feature(id)?.key || '')
      .filter(Boolean)
      .join(', ');
  }
  readonly scopes = Object.keys(FEATURE_SCOPES);
  cowrite(): void {
    this.dialogs.open('chat', undefined, 'cowrite', this.draft.id, {
      feature: structuredClone(this.draft),
      featureUndo: this.proposalUndo() || undefined,
    });
  }
  addAgent(id: string): void {
    if (id && !this.draft.route.includes(id)) {
      this.draft.route.push(id);
      this.draft.briefs.push('');
    }
  }
  removeAgent(i: number): void {
    this.draft.route.splice(i, 1);
    this.draft.briefs.splice(i, 1);
  }
  up(i: number): void {
    [this.draft.route[i], this.draft.route[i - 1]] = [this.draft.route[i - 1], this.draft.route[i]];
    [this.draft.briefs[i], this.draft.briefs[i - 1]] = [
      this.draft.briefs[i - 1],
      this.draft.briefs[i],
    ];
  }
  toggleDep(id: string): void {
    this.draft.dependencies = this.draft.dependencies.includes(id)
      ? this.draft.dependencies.filter((d) => d !== id)
      : [...this.draft.dependencies, id];
  }
  save(): void {
    if (this.execution.busy() || !this.draft.title.trim()) return;
    if (!this.draft.criteria.trim()) {
      this.store.error.set('Defina critérios de aceitação verificáveis.');
      document.getElementById('featureCriteria')?.focus();
      return;
    }
    this.draft.route = [];
    this.draft.briefs = [];
    this.draft.currentAgentId = null;
    this.draft.step = 0;
    this.draft.status = 'backlog';
    if (this.existing && ['done', 'review'].includes(this.existing.status))
      this.draft.status = this.existing.status;
    if (this.store.saveFeature(this.draft)) {
      this.dialogs.revealSprint.set(this.draft.sprintId);
      this.dialogs.notify('Feature salva. Distribua o plano para atribuir os especialistas.');
      this.dialogs.close();
    }
  }
  async remove(): Promise<void> {
    const blocked = this.store
      .project()!
      .features.filter((f) => f.dependencies.includes(this.draft.id));
    if (blocked.length) {
      this.store.error.set(
        'Remova primeiro as dependências em: ' + blocked.map((f) => f.key).join(', ') + '.',
      );
      return;
    }
    if (
      this.draft.setup ||
      !(await this.dialogs.ask(
        'Excluir ' +
          this.draft.key +
          ' / ' +
          this.draft.title +
          '? Essa ação remove o escopo e os registros de entrega desta feature.',
        'EXCLUIR FEATURE',
        'Excluir feature',
        true,
      ))
    )
      return;
    this.store.change((w) => {
      const p = w.projects.find((p) => p.id === w.projectId)!;
      p.features = p.features.filter((f) => f.id !== this.draft.id);
      for (const f of p.features)
        f.dependencies = f.dependencies.filter((id) => id !== this.draft.id);
    });
    this.dialogs.close();
  }
}

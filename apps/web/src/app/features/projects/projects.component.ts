import { UiLabelPipe } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/i18n.service';
import { PortraitService } from '../../core/appearance/portrait.service';
import { FEATURE_SCOPES } from '@domain/workspace';
import { projectExport, zipFiles, slug } from '@domain/exports';
import { Component, inject, signal, computed, effect, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Project, STATUSES, FeatureStatus, Sprint, uuid } from '@domain/models';
import { portrait, ROLES } from '@domain/catalog';
import { projectGaps } from '@domain/workspace';
import { ProjectFormComponent, TeamsCtaComponent } from './project-form.component';
import { ReviewComponent } from '../features/review.component';
import { PlanComponent } from '../features/plan.component';
import { renderMarkdown } from '../../shared/markdown';
import { Router } from '@angular/router';
import { WorkspaceStore } from '../../core/workspace/workspace.store';
import { ExecutionService } from '../../core/execution/execution.service';
import { DialogService, download } from '../../core/ui/dialog.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { IconComponent } from '../../shared/icon.component';
import { ModalComponent } from '../../shared/modal.component';

@Component({
  standalone: true,
  imports: [
    UiLabelPipe,
    TranslatePipe,
    ProjectFormComponent,
    TeamsCtaComponent,
    ReviewComponent,
    PlanComponent,
    ModalComponent,
    FormsModule,
    IconComponent,
  ],
  templateUrl: './projects.component.html',
})
export class ProjectsComponent {
  readonly router = inject(Router);
  readonly portrait = inject(PortraitService).source;
  readonly render = renderMarkdown;
  readonly store = inject(WorkspaceStore);
  readonly execution = inject(ExecutionService);
  readonly dialogs = inject(DialogService);

  readonly documentDraft = signal<Project | null>(null);
  readonly productFields = ['vision', 'scopeIn', 'scopeOut', 'glossary'] as const;
  readonly documentFields = [
    'name',
    'squadId',
    'commanderId',
    'agentIds',
    'adrs',
    'briefing',
    'vision',
    'scopeIn',
    'scopeOut',
    'glossary',
    'architecture',
  ] as const;
  private savedDocs = '';

  readonly search = signal('');
  readonly board = signal(false);
  readonly statuses = STATUSES;
  readonly sprintDraft = signal<Sprint | null>(null);
  readonly collapsed = signal<Record<string, boolean>>({});
  readonly reviewId = signal('');
  readonly Math = Math;
  readonly boardStatuses = ['backlog', 'ready', 'running', 'review', 'done'];
  done(p: Project): number {
    return p.features.filter((f) => f.status === 'done').length;
  }
  gaps(): string[] {
    return projectGaps(this.store.project()!).map((k) => this.i18n.text(k));
  }
  readonly i18n = inject(I18nService);
  readonly isSprint = (id: string) => (s: Sprint) => s.id === id;
  currentSprint() {
    return this.store
      .project()
      ?.sprints.find((s) => this.sprintFeatures(s.id).some((f) => f.status !== 'done'));
  }
  isOpen(id: string): boolean {
    return !!this.search() || this.collapsed()[id] === false;
  }
  visibleSprint(id: string) {
    return this.filtered().filter((f) => f.sprintId === id);
  }
  boardFeatures(status: string) {
    return this.filtered().filter((f) =>
      status === 'backlog' ? ['backlog', 'blocked'].includes(f.status) : f.status === status,
    );
  }
  boardLabel(status: string): string {
    return (
      (
        {
          backlog: this.i18n.text('dashboard.to-do'),
          ready: this.i18n.text('dashboard.ready'),
          running: this.i18n.text('projects.running'),
          review: this.i18n.text('ui.human-review-325'),
          done: this.i18n.text('ui.completed'),
        } as Record<string, string>
      )[status] || status
    );
  }
  statusLabel(status: string): string {
    return (
      (
        {
          backlog: this.i18n.text('dashboard.to-do'),
          ready: this.i18n.text('ui.ready'),
          blocked: this.i18n.text('ui.blocked'),
          running: this.i18n.text('projects.running'),
          review: this.i18n.text('ui.human-review-325'),
          done: this.i18n.text('ui.done'),
        } as Record<string, string>
      )[status] || status
    );
  }
  scopeLabel(scope: string): string {
    return FEATURE_SCOPES[scope] || scope;
  }
  sprintExists(id: string): boolean {
    return !!this.store.project()?.sprints.some((s) => s.id === id);
  }
  sprintCode(id: string): string {
    return 'S' + this.pad(1 + this.store.project()!.sprints.findIndex((s) => s.id === id));
  }
  briefing(): void {
    document.getElementById('opsBriefing')?.scrollIntoView();
    document.getElementById('projectBriefing')?.focus();
  }
  openMeeting(field?: string): void {
    this.dialogs.open('meeting', undefined, undefined, field, {
      project: structuredClone(this.documentDraft()!),
    });
  }
  runCurrent(): void {
    this.execution.startCurrent();
  }
  removeProject(): void {
    if (this.store.workspace()!.projects.length < 2) {
      this.store.error.set(
        this.i18n.text('ui.keep-at-least-one-project-create-another-before-deletin'),
      );
      return;
    }
    this.dialogs
      .ask(
        'Excluir ' +
          this.store.project()!.name +
          ', suas features e transmissões? Os perfis dos agentes permanecerão no workspace, e a pasta projects/' +
          this.store.project()!.folder +
          ' fica no disco com o que já foi implementado.',
        this.i18n.text('ui.delete-project'),
        this.i18n.text('ui.delete-project-330'),
        true,
      )
      .then((ok) => {
        if (ok)
          this.store.change((w) => {
            w.projects = w.projects.filter((p) => p.id !== w.projectId);
            w.projectId = w.projects[0].id;
          });
      });
  }

  readonly filtered = computed(
    () =>
      this.store
        .project()
        ?.features.filter((f) =>
          (f.key + ' ' + f.title).toLowerCase().includes(this.search().toLowerCase()),
        ) || [],
  );

  readonly agentName = (id: string) => this.store.agent(id)?.name || id;

  constructor() {
    effect(() => {
      const id = this.dialogs.revealSprint();
      if (id) {
        this.dialogs.revealSprint.set('');
        this.collapsed.update((value) => ({ ...value, [id]: false }));
      }
    });
    effect(() => {
      const plan = this.execution.plan();
      if (plan && this.execution.planOrigin() === 'distribution')
        setTimeout(
          () => document.getElementById('opsPlan')?.scrollIntoView({ block: 'start' }),
          50,
        );
    });
    effect(() => {
      const draft = this.dialogs.projectDraft();
      if (draft) {
        this.documentDraft.set(structuredClone(draft));
        this.savedDocs = this.docFingerprint(draft);
        this.dialogs.projectDraft.set(null);
      }
    });
    effect(() => {
      const action = this.dialogs.projectAction();
      if (action) {
        this.dialogs.projectAction.set(null);
        if (action.kind === 'newAdr') {
          const d = untracked(() => this.documentDraft() || this.store.project());
          if (d) {
            const next = structuredClone(d);
            next.adrs.push({
              id: uuid('adr'),
              title: '',
              status: 'Proposto',
              date: new Date().toISOString().slice(0, 10),
              content: '## Contexto\n\n## Decisão\n\n## Consequências\n',
            });
            this.documentDraft.set(next);
          }
        }
        setTimeout(() => {
          if (action.kind === 'documents') {
            const rows = [
              ...document.querySelectorAll<HTMLDetailsElement>(
                '#projectForm details[data-doc-row]',
              ),
            ];
            for (const row of rows) {
              row.open = true;
              row.classList.add('fe-updated');
              setTimeout(() => row.classList.remove('fe-updated'), 1800);
            }
            document.querySelector('[data-doc-row=briefing]')?.scrollIntoView({ block: 'nearest' });
            return;
          }
          const row = document.querySelector<HTMLDetailsElement>('[data-doc-row=architecture]');
          if (row) {
            row.open = true;
            row.scrollIntoView({ block: 'start' });
          }
        }, 100);
      }
    });
    effect(() => {
      const id = this.dialogs.reviewFeature();
      if (id) {
        this.reviewId.set(id);
        this.dialogs.reviewFeature.set('');
        setTimeout(() => document.getElementById('opsFeatures')?.scrollIntoView(), 50);
      }
    });
    effect(() => {
      const project = this.store.project();
      if (!project) return;
      const draft = untracked(() => this.documentDraft());
      if (!draft || draft.id !== project.id || this.docFingerprint(draft) === this.savedDocs) {
        this.documentDraft.set(structuredClone(project));
        this.savedDocs = this.docFingerprint(project);
      }
    });
  }

  pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  squadName(squadId?: string): string {
    if (!squadId) return this.i18n.text('ui.no-squad');
    return this.store.workspace()?.squads?.find((s) => s.id === squadId)?.name || 'SQUAD';
  }

  private docFingerprint(project: Project): string {
    return JSON.stringify(this.documentFields.map((field) => project[field]));
  }

  saveDocuments(): void {
    const draft = this.documentDraft();
    if (!draft || this.store.projectLocked()) return;
    if (!draft.name.trim()) {
      this.store.error.set(this.i18n.text('ui.enter-the-project-name'));
      document.getElementById('projectName')?.focus();
      return;
    }
    draft.name = draft.name.trim();
    if (
      this.store.change((w) => {
        const p = w.projects.find((p) => p.id === draft.id)!;
        Object.assign(
          p,
          structuredClone(
            Object.fromEntries(this.documentFields.map((field) => [field, draft[field]])),
          ),
        );
      })
    ) {
      this.savedDocs = this.docFingerprint(draft);
      this.dialogs.notify(this.i18n.text('ui.project-saved'));
    }
  }

  resetDocuments(): void {
    const p = this.store.project();
    if (p) {
      this.documentDraft.set(structuredClone(p));
      this.savedDocs = this.docFingerprint(p);
    }
  }

  sprintFeatures(id: string) {
    return this.store.project()?.features.filter((f) => f.sprintId === id) || [];
  }

  sprintRunning(id: string): boolean {
    return (
      this.execution.busy() && this.store.feature(this.execution.currentFeature())?.sprintId === id
    );
  }
  sprintReviews(id: string): number {
    return this.sprintFeatures(id).filter((f) => f.status === 'review').length;
  }
  sprintDone(id: string): number {
    return this.sprintFeatures(id).filter((f) => f.status === 'done').length;
  }

  openFeature(id: string): void {
    const f = this.store.feature(id);
    if (f) {
      if (['done', 'review', 'running'].includes(f.status)) this.reviewId.set(id);
      else this.dialogs.open('feature', id);
    }
  }

  async removeFeature(id: string): Promise<void> {
    const f = this.store.feature(id);
    const blocked = this.store.project()!.features.filter((f) => f.dependencies.includes(id));
    if (blocked.length) {
      this.store.error.set(
        'Remova primeiro as dependências em: ' + blocked.map((f) => f.key).join(', ') + '.',
      );
      return;
    }
    if (
      !f ||
      f.setup ||
      this.store.projectLocked() ||
      !(await this.dialogs.ask(
        'Excluir ' +
          f.key +
          ' / ' +
          f.title +
          '? Essa ação remove o escopo e os registros de entrega desta feature.',
        this.i18n.text('ui.delete-feature'),
        this.i18n.text('features.delete-feature'),
        true,
      ))
    )
      return;
    this.store.change((w) => {
      const p = w.projects.find((p) => p.id === w.projectId)!;
      p.features = p.features.filter((item) => item.id !== id);
      for (const item of p.features) item.dependencies = item.dependencies.filter((d) => d !== id);
    });
  }

  async switchProject(id: string): Promise<void> {
    if (
      this.documentDraft() &&
      this.docFingerprint(this.documentDraft()!) !== this.savedDocs &&
      !(await this.dialogs.ask(this.i18n.text('ui.discard-unsaved-documents')))
    )
      return;
    this.store.switchProject(id);
  }

  newSprint(): void {
    if (this.store.projectLocked()) return;
    if (this.store.project()!.sprints.length >= 50) {
      this.store.error.set('Limite de 50 sprints.');
      return;
    }
    this.sprintDraft.set({
      id: uuid('sprint'),
      name: 'Sprint ' + String(this.store.project()!.sprints.length + 1).padStart(2, '0'),
      goal: '',
    });
  }

  editSprint(id: string): void {
    const s = this.store.project()?.sprints.find((s) => s.id === id);
    if (s) this.sprintDraft.set(structuredClone(s));
  }

  saveSprint(): void {
    const s = this.sprintDraft();
    if (!s || !s.name.trim() || this.store.projectLocked()) return;
    this.store.change((w) => {
      const p = w.projects.find((p) => p.id === w.projectId)!,
        i = p.sprints.findIndex((x) => x.id === s.id);
      if (i < 0) p.sprints.push(s);
      else p.sprints[i] = s;
    });
    this.collapsed.update((v) => ({ ...v, [s.id]: false }));
    this.dialogs.notify(this.i18n.text('ui.sprint-saved'));
    this.sprintDraft.set(null);
  }

  async removeSprint(id: string): Promise<void> {
    const p = this.store.project()!;
    if (this.store.projectLocked() || p.sprints.length <= 1) return;
    if (p.features.some((f) => f.sprintId === id)) {
      this.store.error.set(
        this.i18n.text('ui.move-or-delete-the-features-before-deleting-the-sprint'),
      );
      return;
    }
    if (
      await this.dialogs.ask(
        'Excluir sprint vazia?',
        this.i18n.text('ui.delete-sprint'),
        this.i18n.text('ui.delete-sprint-338'),
        true,
      )
    )
      this.store.change((w) => {
        const p = w.projects.find((p) => p.id === w.projectId)!;
        p.sprints = p.sprints.filter((s) => s.id !== id);
      });
  }

  toggleSprint(id: string): void {
    this.collapsed.update((v) => ({ ...v, [id]: this.isOpen(id) }));
  }

  transfer(e: DragEvent, sprintId: string, beforeId?: string): void {
    e.preventDefault();
    e.stopPropagation();
    if (this.store.projectLocked()) return;
    const id = e.dataTransfer?.getData('text/plain');
    this.store.change((w) => {
      const p = w.projects.find((p) => p.id === w.projectId)!,
        f = p.features.find((f) => f.id === id);
      if (!f || f.setup || f.status === 'running') return;
      f.sprintId = sprintId;
      if (beforeId) {
        const at = p.features.findIndex((f) => f.id === beforeId);
        if (at > 0) {
          p.features = p.features.filter((x) => x.id !== f.id);
          p.features.splice(
            p.features.findIndex((f) => f.id === beforeId),
            0,
            f,
          );
        }
      }
    });
  }

  newFeature(sprintId: string): void {
    this.dialogs.open('feature', undefined, undefined, sprintId);
  }

  progress(project: Project): number {
    return (
      (100 * project.features.filter((f) => f.status === 'done').length) /
      Math.max(1, project.features.length)
    );
  }

  exportProject(): void {
    const p = this.store.project()!;
    download(
      slug(p.name) + '.zip',
      zipFiles(projectExport(this.store.workspace()!, p)),
      'application/zip',
    );
  }

  drag(e: DragEvent, id: string): void {
    e.dataTransfer?.setData('text/plain', id);
  }

  drop(e: DragEvent, status: FeatureStatus): void {
    e.preventDefault();
    if (this.execution.busy() || ['running', 'done', 'review'].includes(status)) return;
    const id = e.dataTransfer?.getData('text/plain');
    this.store.change((w) => {
      const f = w.projects.find((p) => p.id === w.projectId)?.features.find((f) => f.id === id);
      if (f && !['running', 'done', 'review'].includes(f.status)) f.status = status;
    });
  }
}

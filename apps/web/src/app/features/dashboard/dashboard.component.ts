import { UiLabelPipe } from '../../core/i18n/i18n.service';
import { PortraitService } from '../../core/appearance/portrait.service';
import { dependenciesReady } from '@domain/workspace';
import { SquadCardComponent } from '../projects/project-form.component';
import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { portrait } from '@domain/catalog';
import { Agent, Project, Squad, Feature } from '@domain/models';
import { WorkspaceStore } from '../../core/workspace/workspace.store';
import { ExecutionService } from '../../core/execution/execution.service';
import { DialogService } from '../../core/ui/dialog.service';
import { TranslatePipe, I18nService } from '../../core/i18n/i18n.service';
import { IconComponent } from '../../shared/icon.component';

@Component({
  standalone: true,
  imports: [UiLabelPipe, TranslatePipe, SquadCardComponent, IconComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  currentSprint() {
    const p = this.store.project();
    return (
      p?.sprints.find((s) => p.features.some((f) => f.sprintId === s.id && f.status !== 'done')) ||
      p?.sprints.at(-1)
    );
  }
  sprintFeatures() {
    const id = this.currentSprint()?.id;
    return this.store.project()?.features.filter((f) => f.sprintId === id) || [];
  }
  ready(): boolean {
    const p = this.store.project();
    return (
      !!p &&
      this.sprintFeatures().some(
        (f) => f.status === 'ready' && f.route.length && dependenciesReady(f, p),
      )
    );
  }
  canPlan(): boolean {
    return !this.ready() && this.sprintFeatures().some((f) => f.status === 'backlog');
  }
  idleNote(): string {
    const fs = this.sprintFeatures();
    return this.ready()
      ? this.i18n.text('ui.features-ready-to-start')
      : this.canPlan()
        ? this.i18n.text('ui.distribute-features-to-prepare-the-plan')
        : fs.length && fs.every((f) => f.status === 'done')
          ? this.i18n.text('ui.all-sprints-completed')
          : this.i18n.text('ui.awaiting-review-or-dependencies');
  }
  runAction(): void {
    if (this.ready() || this.canPlan()) this.execution.startCurrent();
    else
      void this.router
        .navigateByUrl('/projects')
        .then(() => setTimeout(() => document.getElementById('opsFeatures')?.scrollIntoView(), 50));
  }
  readonly store = inject(WorkspaceStore);
  readonly execution = inject(ExecutionService);
  readonly dialogs = inject(DialogService);
  readonly i18n = inject(I18nService);
  readonly portrait = inject(PortraitService).source;
  readonly router = inject(Router);

  readonly today = computed(() => {
    const locale = this.i18n.locale() || 'pt-BR';
    const text = new Date().toLocaleDateString(locale, {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    });
    return text.toUpperCase();
  });

  readonly reviews = computed(() => {
    return (
      this.store
        .workspace()
        ?.projects.flatMap((p) =>
          p.features
            .filter((f) => f.status === 'review')
            .map((feature) => ({ feature, projectId: p.id })),
        ) || []
    );
  });

  readonly reviewCount = computed(() => this.reviews().length);

  readonly activity = computed(() => {
    const projects = this.store.workspace()?.projects || [];
    return projects
      .flatMap((p) => (p.logs || []).map((l) => ({ p, l })))
      .sort((a, b) => (b.l.at || '').localeCompare(a.l.at || ''))
      .slice(0, 14);
  });

  pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  clock(at: string): string {
    if (!at) return '';
    const d = new Date(at);
    if (isNaN(d.getTime())) return at.slice(11, 19);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  }

  // Estatísticas de features para o card da operação
  aFazer(p: Project): number {
    return p.features.filter((f) => f.status === 'backlog' || f.status === 'blocked').length;
  }

  prontas(p: Project): number {
    return p.features.filter((f) => f.status === 'ready').length;
  }

  rodando(p: Project): number {
    return p.features.filter((f) => f.status === 'running').length;
  }

  revisao(p: Project): number {
    return p.features.filter((f) => f.status === 'review').length;
  }

  feitas(p: Project): number {
    return p.features.filter((f) => f.status === 'done').length;
  }

  progress(p: Project): number {
    const total = p.features.length;
    if (!total) return 0;
    return Math.round((this.feitas(p) / total) * 100);
  }

  squadAgents(project: Project): Agent[] {
    const squad = this.store.workspace()?.squads.find((s) => s.id === project.squadId);
    if (!squad) return [];
    return squad.agentIds
      .map((id) => this.store.agent(id))
      .filter((a): a is Agent => !!a)
      .slice(0, 6);
  }

  // Squad helpers para visualização estilo SquadCode
  squadCommander(q: Squad): Agent | undefined {
    return this.store.agent(q.commanderId);
  }

  squadAdr(q: Squad): Agent | undefined {
    return this.store.agent(q.adrId);
  }

  squadPrd(q: Squad): Agent | undefined {
    return this.store.agent(q.prdId);
  }

  squadOps(q: Squad): Agent[] {
    return (q.operatorIds || []).map((id) => this.store.agent(id)).filter((a): a is Agent => !!a);
  }

  squadProjectsCount(q: Squad): number {
    return (this.store.workspace()?.projects || []).filter((p) => p.squadId === q.id).length;
  }

  // Navegação
  openProject(id: string): void {
    this.store.switchProject(id);
    void this.router.navigateByUrl('/projects');
  }

  openSquad(id: string): void {
    this.store.switchProject(id);
    void this.router.navigateByUrl('/squad');
  }

  openTeams(id: string): void {
    this.store.switchProject(id);
    void this.router.navigateByUrl('/projects').then(() => this.dialogs.open('meeting'));
  }

  projectName(id: string): string {
    return this.store.workspace()?.projects.find((p) => p.id === id)?.name || '';
  }

  agentName(id: string | null | undefined): string {
    if (!id) return 'SISTEMA';
    return this.store.agent(id)?.name || 'SISTEMA';
  }

  review(projectId: string, id: string): void {
    this.store.switchProject(projectId);
    this.dialogs.open('review', id);
  }
}

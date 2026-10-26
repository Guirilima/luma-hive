import { Injectable, computed, inject, signal } from '@angular/core';
import {
  Agent,
  Feature,
  Project,
  Squad,
  Workspace,
  WorkspaceEnvelope,
  Locale,
  uuid,
  timestamp,
} from '@domain/models';
import {
  createWorkspace,
  makeProject,
  normalizeWorkspace,
  refreshBlocked,
  ensureSetup,
  squadMembers,
  assignDesks,
} from '@domain/workspace';
import { makeAgent } from '@domain/catalog';
import { ApiService } from '../api/api.service';
import { I18nService } from '../i18n/i18n.service';
@Injectable({ providedIn: 'root' })
export class WorkspaceStore {
  private readonly api = inject(ApiService);
  private readonly i18n = inject(I18nService);
  readonly workspace = signal<Workspace | null>(null);
  readonly loading = signal(true);
  readonly path = signal('');
  readonly error = signal('');
  readonly conflict = signal(false);
  readonly saving = signal(false);
  readonly selectedId = signal('');
  readonly revision = signal('');
  readonly pending = signal(false);
  readonly project = computed(
    () => this.workspace()?.projects.find((p) => p.id === this.workspace()?.projectId) || null,
  );
  readonly agents = computed(() => this.workspace()?.agents || []);
  readonly team = computed(() =>
    (this.project()?.agentIds || []).map((id) => this.agent(id)).filter((a): a is Agent => !!a),
  );
  readonly selected = computed(
    () => this.team().find((a) => a.id === this.selectedId()) || this.team()[0] || null,
  );
  readonly settings = computed(() => this.workspace()?.settings || null);
  readonly projectLocked = signal(false);
  private timer: ReturnType<typeof setTimeout> | null = null;
  private chain = Promise.resolve();
  private epoch = 0;
  providerLabel(agentId?: string | null): string {
    return (
      this.agent(agentId || this.project()?.commanderId || '')?.provider || 'codex'
    ).toUpperCase();
  }
  async initialize(): Promise<void> {
    try {
      await this.api.connect();
      await this.reload();
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.loading.set(false);
    }
  }
  private accept(envelope: WorkspaceEnvelope): void {
    this.path.set(envelope.path);
    this.revision.set(envelope.rev);
    if (envelope.workspace) {
      const workspace = normalizeWorkspace(envelope.workspace);
      this.workspace.set(workspace);
      this.i18n.set(workspace.settings.locale);
      this.selectedId.set(this.project()?.commanderId || workspace.agents[0]?.id || '');
    } else this.workspace.set(null);
  }
  async reload(): Promise<void> {
    if (this.timer) clearTimeout(this.timer);
    await this.chain;
    this.accept(await this.api.workspace());
    this.pending.set(false);
    this.error.set('');
    this.conflict.set(false);
  }
  async create(name: string, example = false): Promise<void> {
    try {
      const workspace = createWorkspace(name.trim() || 'Operation', example);
      workspace.settings.locale = this.i18n.locale();
      this.accept(await this.api.create(workspace));
    } catch (e) {
      this.report(e);
    }
  }
  change(mutator: (workspace: Workspace) => void): boolean {
    if (!this.workspace() || this.conflict()) return false;
    try {
      const workspace = structuredClone(this.workspace()!);
      mutator(workspace);
      if (JSON.stringify(workspace) === JSON.stringify(this.workspace())) return true;
      this.workspace.set(normalizeWorkspace(workspace));
      this.epoch++;
      this.pending.set(true);
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        void this.flush();
      }, 400);
      return true;
    } catch (e) {
      this.report(e);
      return false;
    }
  }
  flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.chain = this.chain.then(async () => {
      if (!this.pending() || !this.workspace() || this.conflict()) return;
      this.saving.set(true);
      const workspace = structuredClone(this.workspace()!),
        epoch = this.epoch;
      try {
        const result = await this.api.save(workspace, this.revision());
        this.revision.set(result.rev);
        if (epoch === this.epoch) this.pending.set(false);
        this.error.set('');
      } catch (e) {
        this.report(e);
      } finally {
        this.saving.set(false);
      }
    });
    return this.chain;
  }
  async synchronize(): Promise<void> {
    if (this.pending() || this.saving() || this.conflict()) return;
    const epoch = this.epoch,
      result = await this.api.workspace();
    if (
      epoch !== this.epoch ||
      this.pending() ||
      this.saving() ||
      this.conflict() ||
      result.rev === this.revision()
    )
      return;
    this.workspace.set(result.workspace ? normalizeWorkspace(result.workspace) : null);
    this.revision.set(result.rev);
    this.path.set(result.path);
    if (result.workspace) this.i18n.set(result.workspace.settings.locale);
  }
  report(error: unknown): void {
    const e = error as Error & { status?: number };
    this.error.set(
      /^(recovery|memory|attention|permissions)\./.test(e.message || '')
        ? this.i18n.text(e.message)
        : e.message || String(error),
    );
    if (e.status === 409) this.conflict.set(true);
  }
  setLocale(locale: Locale): void {
    this.i18n.set(locale);
    this.change((w) => {
      w.settings.locale = locale;
    });
  }
  switchProject(id: string): void {
    if (this.projectLocked() && id !== this.project()?.id) {
      this.error.set(this.i18n.text('error.running'));
      return;
    }
    this.change((w) => {
      w.projectId = id;
    });
    this.selectedId.set(this.project()?.commanderId || this.team()[0]?.id || '');
  }
  agent(id: string): Agent | undefined {
    return this.agents().find((a) => a.id === id);
  }
  feature(id: string): Feature | undefined {
    return this.project()?.features.find((f) => f.id === id);
  }
  squadComplete(s: Squad): boolean {
    return (
      this.agent(s.commanderId)?.role === 'commander' &&
      this.agent(s.adrId)?.role === 'architect' &&
      this.agent(s.prdId)?.role === 'po' &&
      s.operatorIds.length > 0
    );
  }
  saveAgent(agent: Agent, joinSquadId?: string): boolean {
    return this.change((w) => {
      const index = w.agents.findIndex((a) => a.id === agent.id);
      if (index < 0) w.agents.push(agent);
      else w.agents[index] = agent;
      const squad = w.squads.find((s) => s.id === joinSquadId);
      if (index < 0 && squad) {
        if (agent.role !== 'commander') squad.operatorIds.push(agent.id);
        this.syncSquad(w, squad);
      }
      for (const p of w.projects) assignDesks(w.agents.filter((a) => p.agentIds.includes(a.id)));
    });
  }
  addPreset(role: string, name: string): void {
    this.saveAgent(makeAgent(role, name));
  }
  deleteAgent(id: string): void {
    this.change((w) => {
      w.agents = w.agents.filter((a) => a.id !== id);
      for (const s of w.squads) {
        for (const key of ['commanderId', 'adrId', 'prdId'] as const)
          if (s[key] === id) s[key] = '';
        s.operatorIds = s.operatorIds.filter((a) => a !== id);
        this.syncSquad(w, s);
      }
      for (const p of w.projects) {
        p.agentIds = p.agentIds.filter((a) => a !== id);
        for (const f of p.features) {
          if (!['done', 'review'].includes(f.status) && f.route.includes(id)) {
            f.route = [];
            f.briefs = [];
            f.step = 0;
            f.currentAgentId = null;
            f.status = 'backlog';
          }
        }
      }
      for (const a of w.agents) {
        if (a.linkId === id) a.linkId = '';
        if (a.nextId === id) a.nextId = '';
      }
    });
  }
  private syncSquad(w: Workspace, s: Squad): void {
    s.agentIds = squadMembers(s);
    for (const p of w.projects.filter((p) => p.squadId === s.id)) {
      p.agentIds = [...s.agentIds];
      p.commanderId = s.commanderId;
      for (const f of p.features) {
        if (['done', 'review'].includes(f.status)) continue;
        if (f.route.some((id) => !p.agentIds.includes(id))) {
          f.route = [];
          f.briefs = [];
          f.step = 0;
          f.currentAgentId = null;
          f.status = 'backlog';
        }
        if (f.briefs.length !== f.route.length) f.briefs = [];
      }
    }
  }
  saveSquad(squad: Squad, newAgents: Agent[] = []): boolean {
    return this.change((w) => {
      for (const agent of newAgents)
        if (!w.agents.some((a) => a.id === agent.id)) w.agents.push(agent);
      const index = w.squads.findIndex((s) => s.id === squad.id);
      if (index < 0) w.squads.push(squad);
      else w.squads[index] = squad;
      this.syncSquad(w, squad);
      for (const p of w.projects) assignDesks(w.agents.filter((a) => p.agentIds.includes(a.id)));
    });
  }
  saveProject(project: Project): boolean {
    return this.change((w) => {
      const squad = w.squads.find((s) => s.id === project.squadId);
      if (!squad || !this.squadComplete(squad)) throw Error(this.i18n.text('project.noSquad'));
      project.agentIds = [...squad.agentIds];
      project.commanderId = squad.commanderId;
      ensureSetup(project);
      const index = w.projects.findIndex((p) => p.id === project.id);
      if (index < 0) w.projects.push(project);
      else w.projects[index] = project;
      w.projectId = project.id;
    });
  }
  newProject(name: string, squadId: string): Project {
    return makeProject(
      name,
      this.workspace()!.squads.find((s) => s.id === squadId)!,
      this.workspace()!.projects.length + 1,
    );
  }
  saveFeature(feature: Feature): boolean {
    return this.change((w) => {
      const p = w.projects.find((p) => p.id === w.projectId)!,
        index = p.features.findIndex((f) => f.id === feature.id);
      if (index < 0) p.features.push(feature);
      else p.features[index] = feature;
      ensureSetup(p);
      refreshBlocked(p);
    });
  }
  review(featureId: string, approve: boolean, feedback = ''): void {
    this.change((w) => {
      const p = w.projects.find((p) => p.id === w.projectId)!,
        f = p.features.find((f) => f.id === featureId)!;
      if (f.status !== 'review') return;
      f.status = approve ? 'done' : 'ready';
      f.step = 0;
      f.currentAgentId = null;
      if (feedback)
        f.context = [f.context, 'Review feedback: ' + feedback].filter(Boolean).join('\n\n');
      refreshBlocked(p);
      p.logs.push({
        id: uuid('log'),
        at: timestamp(),
        agentId: null,
        type: 'review',
        message: f.key + ' ' + (approve ? '✓' : '↩') + (feedback ? ' · ' + feedback : ''),
        simulated: w.settings.mode === 'demo',
      });
    });
  }
  log(
    message: string,
    type = 'system',
    agentId: string | null = null,
    projectId = this.project()?.id,
  ): void {
    this.change((w) => {
      w.projects
        .find((p) => p.id === projectId)
        ?.logs.push({
          id: uuid('log'),
          at: timestamp(),
          agentId,
          type,
          message,
          simulated: w.settings.mode === 'demo',
        });
    });
  }
  async import(raw: unknown): Promise<void> {
    const workspace = normalizeWorkspace(raw, true);
    if (!this.workspace()) {
      this.accept(await this.api.create(workspace));
      return;
    }
    this.change((w) => Object.assign(w, workspace));
    await this.flush();
    this.i18n.set(workspace.settings.locale);
  }
  async restore(id: string): Promise<void> {
    const { workspace } = await this.api.snapshot(id);
    await this.import(workspace);
  }
}

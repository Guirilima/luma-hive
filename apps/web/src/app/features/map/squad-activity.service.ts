import { pendingQuestions } from '@domain/workflow';
import { I18nService } from '../../core/i18n/i18n.service';
import { Injectable, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { Agent, Run } from '@domain/models';
import { AgentTrace, RunTrace, projectRunTrace } from '@domain/observability';
import { ApiService } from '../../core/api/api.service';
import { ExecutionService } from '../../core/execution/execution.service';
import { WorkspaceStore } from '../../core/workspace/workspace.store';
export type SquadState = 'working' | 'idle' | 'waiting' | 'paused';
export interface SquadConsultation {
  node: AgentTrace;
  depth: number;
  runId: string;
  activity: string;
}
export interface SquadMemberActivity {
  agent: Agent;
  state: SquadState;
  reason: string;
  activity: string;
  runId: string;
  consultations: SquadConsultation[];
  activeConsultations: number;
}
/** Read-only projection of the current workspace and CLI telemetry. Never starts a run. */
@Injectable()
export class SquadActivityService implements OnDestroy {
  private readonly i18n = inject(I18nService);
  private readonly store = inject(WorkspaceStore);
  private readonly api = inject(ApiService);
  private readonly execution = inject(ExecutionService);
  readonly enabled = signal(false);
  readonly stale = signal(false);
  private readonly traces = signal<RunTrace[]>([]);
  private readonly clock = signal(Date.now());
  private projectId = '';
  private version = 0;
  private destroyed = false;
  private fetching = false;
  private readonly timer = setInterval(() => {
    if (this.enabled() && document.visibilityState === 'visible') void this.refresh();
  }, 3000);
  constructor() {
    effect(() => {
      const id = this.enabled() ? this.store.project()?.id || '' : '';
      this.version++;
      this.projectId = id;
      this.traces.set([]);
      this.stale.set(false);
      if (id) void this.refresh();
    });
  }
  ngOnDestroy() {
    this.destroyed = true;
    this.version++;
    clearInterval(this.timer);
  }
  private async refresh() {
    if (this.fetching || !this.projectId) return;
    const id = this.projectId,
      version = this.version;
    this.fetching = true;
    this.clock.set(Date.now());
    try {
      const { runs } = await this.api.runs(id);
      if (this.destroyed || version !== this.version) return;
      const members = new Set(this.store.team().map((a) => a.id));
      const latest = new Set<string>();
      const selected = runs.filter((r) => {
        if (r.projectId !== id) return false;
        if (r.status === 'running') {
          latest.add(r.agentId);
          return true;
        }
        if (!members.has(r.agentId) || latest.has(r.agentId)) return false;
        latest.add(r.agentId);
        return true;
      });
      const cached = new Map(this.traces().map((t) => [t.run.id, t]));
      const result = await Promise.allSettled(
        selected.map((run) => {
          const previous = cached.get(run.id);
          return previous &&
            run.status !== 'running' &&
            previous.run.status === run.status &&
            previous.run.endedAt === run.endedAt
            ? Promise.resolve(previous)
            : this.api.runTrace(run.id);
        }),
      );
      if (this.destroyed || version !== this.version) return;
      this.stale.set(result.some((r) => r.status === 'rejected'));
      this.traces.set(
        result.flatMap((r, i) =>
          r.status === 'fulfilled'
            ? [r.value]
            : cached.has(selected[i].id)
              ? [cached.get(selected[i].id)!]
              : [],
        ),
      );
    } catch {
      if (!this.destroyed && version === this.version) this.stale.set(true);
    } finally {
      this.fetching = false;
    }
  }
  private readonly live = computed(() => {
    const ex = this.execution,
      project = this.store.project();
    if (!project || !(ex.interacting() || ex.planning()) || !ex.currentAgent()) return null;
    const feature = this.store.feature(ex.currentFeature()),
      events = ex.events();
    const existing = this.traces().find((t) => t.run.id === ex.currentRun());
    const run: Run = {
      ...existing?.run,
      id: ex.currentRun() || 'local-active',
      projectId: project.id,
      agentId: ex.currentAgent(),
      agentName: this.store.agent(ex.currentAgent())?.name,
      provider: this.store.agent(ex.currentAgent())?.provider || 'codex',
      kind: ex.currentKind(),
      featureId: feature?.id || '',
      featureName: feature?.title,
      featureKey: feature?.key,
      status: 'running',
      startedAt: existing?.run.startedAt || events[0]?.at || new Date(this.clock()).toISOString(),
      endedAt: null,
      result: null,
    };
    const merged = new Map((existing?.timeline || []).map((e) => [e.event.seq, e.event]));
    events.forEach((e) => merged.set(e.seq, e));
    return projectRunTrace(run, [...merged.values()], this.clock());
  });
  private readonly currentTraces = computed(() => {
    const live = this.live();
    return live
      ? [
          live,
          ...this.traces().filter(
            (t) =>
              t.run.id !== live.run.id &&
              !(live.run.id === 'local-active' && t.run.agentId === live.run.agentId),
          ),
        ]
      : this.traces();
  });
  private clean(text: string) {
    return text
      .replace(/[*_#>|]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 160);
  }
  private activity(trace: RunTrace, node: AgentTrace) {
    const events = trace.timeline.filter((e) => e.agentTraceId === node.id).map((e) => e.event);
    const done = new Set(events.filter((e) => e.type === 'tool-result').map((e) => e.callId));
    const tool = [...events].reverse().find((e) => e.type === 'tool' && !done.has(e.callId));
    if (node.state === 'running') {
      const child = trace.agents.find((a) => a.parentId === node.id && a.state === 'running');
      if (child) {
        const name = this.store.agent(child.agentId || '')?.name || child.name;
        return this.i18n.text('squadActivity.consultingWith').replace('{agent}', name);
      }
      if (tool) return this.i18n.text('squadActivity.usingTool').replace('{tool}', tool.name || '');
    }
    const last = [...events].reverse().find((e) => e.type === 'text' && e.text?.trim());
    return this.clean(
      node.state === 'running' ? last?.text || node.task : node.result || last?.text || node.task,
    );
  }
  readonly members = computed<SquadMemberActivity[]>(() => {
    const project = this.store.project(),
      ex = this.execution,
      traces = this.currentTraces();
    if (!project) return [];
    const questions = new Map<string, string>();
    for (const { message } of pendingQuestions(this.store.workspace()!, project.id))
      if (message.agentId) questions.set(message.agentId, this.clean(message.text));
    return this.store.team().map((agent) => {
      const owned = traces.filter((t) => t.run.agentId === agent.id),
        running = owned.find((t) => t.run.status === 'running'),
        latest = running || owned[0];
      const consultations: SquadConsultation[] = [];
      for (const trace of owned.filter((t) => t.run.status === 'running' || t === latest)) {
        const append = (id: string, depth: number, seen = new Set<string>()) => {
          if (seen.has(id)) return;
          seen.add(id);
          for (const node of trace.agents.filter((n) => n.parentId === id)) {
            const catalog = this.store
              .agents()
              .find((a) => a.id === node.agentId || a.name === node.name);
            consultations.push({
              node: catalog ? { ...node, agentId: catalog.id, name: catalog.name } : node,
              depth,
              runId: trace.run.id,
              activity: this.activity(trace, node),
            });
            append(node.id, depth + 1, seen);
          }
        };
        append(trace.run.id, 0);
      }
      const helping = traces
        .flatMap((t) => t.agents.slice(1))
        .find((n) => (n.agentId === agent.id || n.name === agent.name) && n.state === 'running');
      let state: SquadState = running || helping ? 'working' : 'idle';
      let reason = helping
        ? 'squadActivity.consulting'
        : running
          ? 'squadActivity.executing'
          : 'squadActivity.available';
      const current = agent.id === ex.currentAgent();
      if (current && ex.busy() && ex.paused()) {
        state = running || ex.interacting() ? 'working' : 'paused';
        reason = running || ex.interacting() ? 'squadActivity.pausing' : 'squadActivity.paused';
      }
      if (state === 'idle' && agent.id === project.commanderId && ex.planning()) {
        state = 'working';
        reason = 'squadActivity.planning';
      }
      const approval =
        agent.id === project.commanderId &&
        (!!ex.plan() ||
          [...(this.store.workspace()?.chats[project.id + ':operation'] || [])]
            .reverse()
            .find((m) => m.plan)?.plan?.status === 'awaiting');
      const review = project.features.find(
        (f) => f.status === 'review' && (f.currentAgentId || f.route.at(-1)) === agent.id,
      );
      const failed =
        latest?.run.status === 'failed' &&
        (!latest.run.featureId || this.store.feature(latest.run.featureId)?.status !== 'done');
      if (state === 'idle' && (approval || questions.has(agent.id) || review || failed)) {
        state = 'waiting';
        reason = approval
          ? 'squadActivity.approval'
          : questions.has(agent.id)
            ? 'squadActivity.question'
            : review
              ? 'squadActivity.review'
              : 'squadActivity.failed';
      }
      let activity = latest ? this.activity(latest, latest.agents[0]) : '';
      if (state === 'waiting') {
        if (reason === 'squadActivity.question') activity = questions.get(agent.id)!;
        if (review && reason === 'squadActivity.review')
          activity = review.key + ' · ' + review.title;
      }
      return {
        agent,
        state,
        reason,
        activity,
        runId: latest?.run.id || '',
        consultations,
        activeConsultations: consultations.filter((c) => c.node.state === 'running').length,
      };
    });
  });
  readonly counts = computed(() => {
    const members = this.members();
    return {
      all: members.length,
      working: members.filter((m) => m.state === 'working').length,
      idle: members.filter((m) => m.state === 'idle').length,
      waiting: members.filter((m) => m.state === 'waiting').length,
      paused: members.filter((m) => m.state === 'paused').length,
      helpers: members.reduce((n, m) => n + m.activeConsultations, 0),
    };
  });
}

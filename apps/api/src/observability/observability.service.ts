import { WorkspaceRepository } from '../storage/workspace.repository';
import type { Run, Workspace } from '../../../../packages/domain/src/models';
import {
  ConsumptionGroup,
  ObservationFilters,
  ObservationSnapshot,
  RunTrace,
  measureTokens,
  addTokens,
  projectRunTrace,
} from '../../../../packages/domain/src/observability';
import { requireValue } from '../shared/errors';
const UNASSIGNED = '__unassigned';
export class ObservabilityService {
  constructor(private readonly repository: WorkspaceRepository) {}
  private hydrate(run: Run, workspace: Workspace | null): Run {
    const p = workspace?.projects.find((p) => p.id === run.projectId),
      f = p?.features.find((f) => f.id === run.featureId),
      s = p?.sprints.find((s) => s.id === f?.sprintId);
    return {
      ...run,
      agentName:
        run.agentName || workspace?.agents.find((a) => a.id === run.agentId)?.name || run.agentId,
      projectName: run.projectName || p?.name,
      featureName: run.featureName || f?.title,
      featureKey: run.featureKey || f?.key,
      sprintId: run.sprintId || s?.id,
      sprintName: run.sprintName || s?.name,
    };
  }
  trace(id: string): RunTrace {
    const run = this.repository.run(id);
    requireValue(run, 'Run not found', 404);
    const workspace = this.repository.read().workspace,
      events = this.repository.events(id),
      hydrated = this.hydrate(run!, workspace);
    hydrated.model =
      events.find((e) => e.type === 'init' && e.model)?.model ||
      events.find((e) => e.type === 'start')?.model ||
      hydrated.model ||
      undefined;
    const trace = projectRunTrace(hydrated, events);
    for (const n of trace.agents) {
      const a = workspace?.agents.find((a) => a.id === n.agentId || a.name === n.name);
      if (a) {
        n.agentId = a.id;
        n.name = a.name;
      }
    }
    return trace;
  }
  snapshot(filters: ObservationFilters, offset = 0, limit = 50): ObservationSnapshot {
    const now = new Date(),
      from = new Date(now),
      workspace = this.repository.read().workspace;
    if (filters.period === 'all') from.setTime(0);
    else {
      from.setHours(0, 0, 0, 0);
      if (filters.period === 'week') from.setDate(from.getDate() - ((from.getDay() + 6) % 7));
      else from.setDate(1);
    }
    const runs = this.repository
      .observationRuns(from.getTime(), filters.projectId || '')
      .map((r) => this.hydrate(r, workspace));
    const rows = runs.map((run) => {
      const events = this.repository.events(run.id);
      run.model =
        events.find((e) => e.type === 'init' && e.model)?.model ||
        events.find((e) => e.type === 'start')?.model ||
        run.model ||
        undefined;
      return projectRunTrace(run, events);
    });
    const option = (pairs: [string, string][]) =>
      [...new Map(pairs).entries()]
        .map(([id, label]) => ({ id, label }))
        .sort((a, b) => a.label.localeCompare(b.label));
    const selected = rows.filter(
      ({ run, agents }) =>
        (!filters.sprintId || (run.sprintId || UNASSIGNED) === filters.sprintId) &&
        (!filters.provider || run.provider === filters.provider) &&
        (!filters.model || (run.model || UNASSIGNED) === filters.model) &&
        (!filters.agentId ||
          run.agentId === filters.agentId ||
          agents.some((n) => n.agentId === filters.agentId)),
    );
    const group = (id: string, label: string): ConsumptionGroup => ({
      id,
      label,
      runs: 0,
      failed: 0,
      reported: 0,
      unreported: 0,
      tokens: { input: null, output: null, cached: null, total: null },
      durationMs: 0,
      subagents: 0,
    });
    const maps = {
      agent: new Map<string, ConsumptionGroup>(),
      feature: new Map<string, ConsumptionGroup>(),
      sprint: new Map<string, ConsumptionGroup>(),
      model: new Map<string, ConsumptionGroup>(),
      provider: new Map<string, ConsumptionGroup>(),
      subagent: new Map<string, ConsumptionGroup>(),
    };
    const totals = group('total', 'total');
    const add = (g: ConsumptionGroup, trace: RunTrace) => {
      const t = measureTokens(trace.run.result?.usage);
      g.runs++;
      g.failed += trace.run.status === 'failed' ? 1 : 0;
      if (t.total !== null || t.input !== null || t.output !== null) g.reported++;
      else g.unreported++;
      g.tokens = addTokens(g.tokens, t);
      g.durationMs += trace.agents[0].durationMs;
      g.subagents += trace.agents.length - 1;
    };
    for (const trace of selected) {
      const r = trace.run;
      add(totals, trace);
      const dimensions = {
        agent: [r.agentId, r.agentName || r.agentId],
        feature: [
          r.featureId || UNASSIGNED,
          r.featureName
            ? `${r.featureKey || ''} ${r.featureName}`.trim()
            : r.featureId || 'obs.unassigned',
        ],
        sprint: [r.sprintId || UNASSIGNED, r.sprintName || 'obs.unassigned'],
        model: [r.model || UNASSIGNED, r.model || 'obs.defaultModel'],
        provider: [r.provider, r.provider],
      };
      for (const [axis, [id, label]] of Object.entries(dimensions)) {
        const map = maps[axis as keyof typeof dimensions];
        if (!map.has(id)) map.set(id, group(id, label));
        add(map.get(id)!, trace);
      }
      for (const child of trace.agents.slice(1)) {
        const a = workspace?.agents.find((a) => a.id === child.agentId);
        const id = child.agentId || '__temporary';
        const g = maps.subagent.get(id) || group(id, a?.name || child.agentId || 'obs.temporary');
        g.runs++;
        g.failed += child.state === 'failed' ? 1 : 0;
        g.durationMs += child.durationMs;
        g.tokens = addTokens(g.tokens, child.tokens);
        if (
          child.tokens.total !== null ||
          child.tokens.input !== null ||
          child.tokens.output !== null
        )
          g.reported++;
        else g.unreported++;
        maps.subagent.set(id, g);
      }
    }
    return {
      generatedAt: now.toISOString(),
      totalRuns: selected.length,
      shownRuns: selected.slice(offset, offset + limit).length,
      offset,
      limit,
      runs: selected
        .slice(offset, offset + limit)
        .map((r) => ({ ...r.run, result: r.run.result ? { ...r.run.result, text: '' } : null })),
      totals,
      groups: Object.fromEntries(
        Object.entries(maps).map(([k, map]) => [
          k,
          [...map.values()].sort((a, b) => (b.tokens.total ?? -1) - (a.tokens.total ?? -1)),
        ]),
      ) as ObservationSnapshot['groups'],
      options: {
        projects: option((workspace?.projects || []).map((p) => [p.id, p.name])),
        sprints: option(
          rows.map(({ run: r }) => [r.sprintId || UNASSIGNED, r.sprintName || 'obs.unassigned']),
        ),
        agents: option(
          rows.flatMap((t) =>
            t.agents
              .filter((a) => a.agentId)
              .map(
                (a) =>
                  [
                    a.agentId!,
                    workspace?.agents.find((n) => n.id === a.agentId)?.name || a.name,
                  ] as [string, string],
              ),
          ),
        ),
        models: option(
          rows.map(({ run: r }) => [r.model || UNASSIGNED, r.model || 'obs.defaultModel']),
        ),
      },
    };
  }
}

import type { Run, RunEvent, Provider } from './models';

export interface TokenMeasure {
  input: number | null;
  output: number | null;
  cached: number | null;
  total: number | null;
}
export interface Delegation {
  id: string;
  parentId?: string;
  agentId?: string;
  name?: string;
  sessionId?: string;
  state: 'running' | 'done' | 'failed' | 'cancelled';
  task?: string;
  model?: string;
}
export interface AgentTrace {
  id: string;
  parentId: string | null;
  agentId: string | null;
  name: string;
  task: string;
  sessionId: string | null;
  model: string | null;
  provider: Provider;
  state: 'running' | 'done' | 'failed' | 'cancelled' | 'interrupted' | 'unknown';
  startedAt: string;
  endedAt: string | null;
  durationMs: number;
  tokens: TokenMeasure;
  usageScope: 'self' | 'inclusive' | 'unknown';
  result: string;
  tools: number | null;
  eventCount: number;
}
export interface TraceEntry {
  event: RunEvent;
  agentTraceId: string;
  delegationId?: string;
}
export interface RunTrace {
  run: Run;
  agents: AgentTrace[];
  timeline: TraceEntry[];
  partial: boolean;
}
export type ObservationPeriod = 'week' | 'month' | 'all';
export interface ObservationFilters {
  projectId?: string;
  sprintId?: string;
  agentId?: string;
  provider?: string;
  model?: string;
  period?: ObservationPeriod;
}
export interface ConsumptionGroup {
  id: string;
  label: string;
  runs: number;
  failed: number;
  reported: number;
  unreported: number;
  tokens: TokenMeasure;
  durationMs: number;
  subagents: number;
}
export interface ObservationSnapshot {
  generatedAt: string;
  totalRuns: number;
  shownRuns: number;
  offset: number;
  limit: number;
  runs: Run[];
  groups: Record<
    'agent' | 'feature' | 'sprint' | 'model' | 'provider' | 'subagent',
    ConsumptionGroup[]
  >;
  totals: ConsumptionGroup;
  options: Record<'projects' | 'sprints' | 'agents' | 'models', { id: string; label: string }[]>;
}
const emptyTokens = (): TokenMeasure => ({ input: null, output: null, cached: null, total: null });
export function measureTokens(usage: Record<string, number> | null | undefined): TokenMeasure {
  const number = (...keys: string[]) => {
    for (const key of keys) {
      const n = usage?.[key];
      if (typeof n === 'number' && Number.isFinite(n) && n >= 0) return n;
    }
    return null;
  };
  const input = number('input_tokens', 'prompt_tokens', 'inputTokens'),
    output = number('output_tokens', 'completion_tokens', 'outputTokens');
  return {
    input,
    output,
    cached: number(
      'cached_input_tokens',
      'cache_read_tokens',
      'cache_read_input_tokens',
      'cached_tokens',
    ),
    total:
      number('total_tokens', 'totalTokens') ??
      (input !== null && output !== null ? input + output : null),
  };
}
export function addTokens(left: TokenMeasure, right: TokenMeasure): TokenMeasure {
  return Object.fromEntries(
    Object.keys(left).map((k) => {
      const key = k as keyof TokenMeasure;
      return [
        key,
        left[key] === null && right[key] === null ? null : (left[key] ?? 0) + (right[key] ?? 0),
      ];
    }),
  ) as unknown as TokenMeasure;
}
const text = (v: unknown): string => (typeof v === 'string' ? v : '');
export function isDelegationTool(name = ''): boolean {
  return ['Agent', 'Task', 'spawn_agent', 'invoke_subagent', 'run_subagent'].includes(name);
}
/** Pure projection: old stored tool events remain readable; no invented helper/token activity. */
export function projectRunTrace(run: Run, events: RunEvent[], now = Date.now()): RunTrace {
  const nodes = new Map<string, AgentTrace>();
  const root: AgentTrace = {
    id: run.id,
    parentId: null,
    agentId: run.agentId,
    name: run.agentName || run.agentId,
    task: run.featureName || run.kind,
    sessionId: run.result?.sessionId || null,
    model: run.model || null,
    provider: run.provider,
    state: run.status,
    startedAt: run.startedAt,
    endedAt: run.endedAt,
    durationMs: 0,
    tokens: measureTokens(run.result?.usage),
    usageScope: 'unknown',
    result: run.result?.text || '',
    tools: 0,
    eventCount: 0,
  };
  nodes.set(root.id, root);
  const entries: TraceEntry[] = [],
    seen = new Set<number>();
  const ensure = (id: string, parent: string, at: string): AgentTrace => {
    let n = nodes.get(id);
    if (!n) {
      n = {
        id,
        parentId: parent === id ? root.id : parent,
        agentId: null,
        name: id,
        task: '',
        sessionId: null,
        model: null,
        provider: run.provider,
        state: 'running',
        startedAt: at,
        endedAt: null,
        durationMs: 0,
        tokens: emptyTokens(),
        usageScope: 'unknown',
        result: '',
        tools: 0,
        eventCount: 0,
      };
      nodes.set(id, n);
    }
    return n;
  };
  for (const event of [...events].sort((a, b) => a.seq - b.seq)) {
    if (seen.has(event.seq)) continue;
    seen.add(event.seq);
    const owner = event.activityId || root.id;
    const agent = owner === root.id ? root : ensure(owner, root.id, event.at);
    if (event.sourceAgentName) agent.name = event.sourceAgentName;
    if (event.sourceAgentId) agent.agentId = event.sourceAgentId;
    if (event.sourceSessionId) agent.sessionId = event.sourceSessionId;
    const input = (event.input && typeof event.input === 'object' ? event.input : {}) as Record<
      string,
      unknown
    >;
    const legacy: Delegation | null =
      isDelegationTool(event.name) && event.callId
        ? {
            id: 'call:' + event.callId,
            parentId: owner,
            agentId: text(
              input['subagent_type'] ||
                input['agent_name'] ||
                input['AgentName'] ||
                input['TypeName'] ||
                input['agent_type'] ||
                input['name'],
            ).replace(/^luma-/, ''),
            name: text(
              input['description'] ||
                input['Description'] ||
                input['task_name'] ||
                input['agent_name'] ||
                input['AgentName'] ||
                input['TypeName'] ||
                input['subagent_type'] ||
                input['name'],
            ),
            task: text(
              input['prompt'] ||
                input['Prompt'] ||
                input['task'] ||
                input['Task'] ||
                input['description'],
            ),
            state: event.error
              ? ('failed' as const)
              : event.type === 'tool-result'
                ? ('done' as const)
                : ('running' as const),
          }
        : null;
    const delegation = event.delegation || legacy;
    let delegated: string | undefined;
    if (
      delegation &&
      (event.type === 'tool' || event.type === 'tool-result' || event.type === 'agent')
    ) {
      delegated = delegation.id;
      const n = ensure(delegation.id, delegation.parentId || owner, event.at);
      if (delegation.parentId && delegation.parentId !== n.id) n.parentId = delegation.parentId;
      if (delegation.agentId) n.agentId = delegation.agentId.replace(/^luma-/, '');
      if (delegation.name) n.name = delegation.name.replace(/^luma-/, '');
      if (delegation.task) n.task = delegation.task;
      if (delegation.model) n.model = delegation.model;
      if (delegation.sessionId) n.sessionId = delegation.sessionId;
      if (delegation.state !== 'running' && event.text !== 'Waiting for colleague response') {
        n.state = delegation.state;
        n.endedAt = event.at;
        n.result = event.text || n.result;
      }
      if (event.usage) {
        n.tokens = measureTokens(event.usage);
        n.usageScope = event.usageScope || 'unknown';
      }
    }
    if (event.type === 'init' && owner === root.id) {
      root.sessionId = event.sessionId || root.sessionId;
      root.model = event.model || root.model;
    }
    if (event.type === 'start' && owner === root.id) root.model = event.model || root.model;
    if (event.type === 'tool') agent.tools = (agent.tools || 0) + 1;
    agent.eventCount++;
    if (owner !== root.id && event.usage && !delegation) {
      agent.tokens = measureTokens(event.usage);
      agent.usageScope = event.usageScope || 'unknown';
    }
    if (owner !== root.id && event.type === 'text') agent.result += event.text || '';
    entries.push({ event, agentTraceId: owner, delegationId: delegated });
  }
  for (const n of nodes.values()) {
    if (n.parentId && !nodes.has(n.parentId)) n.parentId = root.id;
    // Defend against malformed native ancestry so the tree always remains traversable.
    const chain = new Set([n.id]);
    let parent = n.parentId;
    while (parent) {
      if (chain.has(parent)) {
        n.parentId = root.id;
        break;
      }
      chain.add(parent);
      parent = nodes.get(parent)?.parentId || null;
    }
    if (n !== root && n.state === 'running' && run.status !== 'running') {
      n.state = run.status === 'done' ? 'unknown' : 'interrupted';
      n.endedAt = run.endedAt;
    }
    if ((n !== root && !n.eventCount) || (n === root && run.provider === 'devin')) n.tools = null;
    n.durationMs = Math.max(0, (Date.parse(n.endedAt || '') || now) - Date.parse(n.startedAt));
  }
  return {
    run,
    agents: [...nodes.values()],
    timeline: entries,
    partial:
      run.provider === 'devin' ||
      events.length === 0 ||
      [...nodes.values()].some((n) => n.parentId && (!n.eventCount || n.state === 'unknown')),
  };
}

import type { RunEvent, Provider } from '../../../../packages/domain/src/models';
type Event = Omit<RunEvent, 'seq' | 'at'>;
/** Add source ancestry only when the provider actually emits a child identifier. */
export function providerTelemetry(provider: Provider) {
  const sessions = new Map<string, string>(),
    messages = new Map<string, string>(),
    toolEvents = new Set<string>();
  let rootSession = '';
  return {
    scope(raw: any): string | undefined {
      if (
        provider === 'codex' &&
        raw.type === 'thread.started' &&
        !rootSession &&
        !raw.parent_tool_use_id
      )
        rootSession = raw.thread_id || '';
      const call = raw.parent_tool_use_id ?? raw.parent_call_id ?? raw.subagent?.parent_call_id;
      if (call !== undefined && call !== null && String(call) !== '') return 'call:' + String(call);
      const session = raw.thread_id || raw.subagent_id || raw.subagent?.id;
      return session && session !== rootSession ? sessions.get(session) : undefined;
    },
    decorate(raw: any, events: Event[], scope?: string): Event[] {
      const item = raw.item;
      if (provider === 'codex' && item?.type === 'collab_tool_call' && item.tool === 'spawn_agent')
        for (const id of item.receiver_thread_ids || []) sessions.set(id, 'call:' + item.id);
      return events.map((event) => ({
        ...event,
        ...(scope
          ? {
              activityId: scope,
              sourceSessionId: raw.thread_id || raw.subagent_id,
              sourceAgentName: raw.subagent?.name,
            }
          : {}),
        ...(event.type === 'tool' && raw.step_update?.tool_info?.usage
          ? { usage: raw.step_update.tool_info.usage }
          : {}),
      }));
    },
    child(raw: any, id: string): Event[] {
      const common = {
        activityId: id,
        sourceSessionId: raw.thread_id || raw.subagent_id,
        sourceAgentName: raw.subagent?.name,
      };
      const item = raw.item || {},
        step = raw.step_update;
      const delegated: Event[] = [];
      if (item.type === 'collab_tool_call' && item.tool === 'spawn_agent') {
        for (const session of item.receiver_thread_ids || [])
          sessions.set(session, 'call:' + item.id);
        const key = id + ':spawn:' + item.id;
        if (!toolEvents.has(key)) {
          toolEvents.add(key);
          delegated.push({
            ...common,
            type: 'tool',
            callId: item.id,
            name: 'Agent',
            input: {
              subagent_type: item.agent_type,
              prompt: item.prompt,
              description: item.description,
            },
          });
        }
        if (raw.type !== 'item.completed') return delegated;
      }
      if (item.type === 'collab_tool_call' && raw.type === 'item.completed') {
        const out: Event[] = delegated;
        for (const [session, state] of Object.entries(item.agents_states || {}) as [
          string,
          any,
        ][]) {
          const activity = sessions.get(session);
          if (activity && ['completed', 'errored', 'failed'].includes(state.status))
            out.push({
              ...common,
              type: 'agent',
              activityId: activity,
              delegation: { id: activity, state: state.status === 'completed' ? 'done' : 'failed' },
              text: state.message || state.error,
            });
        }
        return out;
      }
      if (
        raw.type === 'turn.completed' ||
        raw.type === 'turn.failed' ||
        raw.event === 'subagent.completed' ||
        raw.event === 'subagent.failed'
      )
        return [
          {
            ...common,
            type: 'agent',
            usage: raw.usage || raw.result?.usage || null,
            usageScope: 'unknown',
            delegation: {
              id,
              state:
                raw.event === 'subagent.failed' || raw.type === 'turn.failed' ? 'failed' : 'done',
              model: raw.model,
            },
            text: raw.result?.response || raw.error?.message,
          },
        ];
      if (item.type === 'agent_message') {
        const full = String(item.text || ''),
          key = id + ':' + item.id,
          previous = messages.get(key) || '';
        messages.set(key, full);
        const text = full.startsWith(previous) ? full.slice(previous.length) : full;
        return text ? [{ ...common, type: 'text', text }] : [];
      }
      if (step?.step_type === 'agent_response')
        return step.text_delta ? [{ ...common, type: 'text', text: step.text_delta }] : [];
      if (
        step?.step_type === 'tool' ||
        ['command_execution', 'file_change', 'mcp_tool_call', 'web_search'].includes(item.type)
      ) {
        const info = step?.tool_info || {},
          callId = String(step?.step_index ?? item.id ?? '');
        const done =
          ['DONE', 'ERROR', 'FAILED', 'CANCELED', 'CANCELLED'].includes(step?.state) ||
          raw.type === 'item.completed';
        const key = id + ':' + callId + ':' + String(done);
        if (toolEvents.has(key)) return [];
        toolEvents.add(key);
        return [
          {
            ...common,
            type: done ? 'tool-result' : 'tool',
            callId,
            name: info.name || step?.tool_name || item.type,
            input: info.parameters || item.command || item.arguments,
            text: done
              ? String(info.output || info.error?.message || item.aggregated_output || '')
              : undefined,
            error:
              !!info.error ||
              (step && step.state !== 'ACTIVE' && step.state !== 'DONE') ||
              item.status === 'failed',
          },
        ];
      }
      return [];
    },
  };
}

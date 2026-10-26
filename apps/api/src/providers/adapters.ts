import { providerTelemetry } from './telemetry';
import fs from 'node:fs/promises';
import path from 'node:path';
import { RunRequest, RunEvent } from '../../../../packages/domain/src/models';
export interface PreparedRun {
  args: string[];
  input: string;
  cleanup: string[];
}
export interface RawResult {
  text: string;
  error: boolean;
  usage: Record<string, number> | null;
  sessionId: string | null;
}
export interface Decoder {
  readonly complete: boolean;
  feed(chunk: string): Omit<RunEvent, 'seq' | 'at'>[];
  finish(): RawResult | null;
}
const model = (value: string | undefined) => (value && value !== 'inherit' ? value : '');
const instruction = (r: RunRequest, scope: string) =>
  [
    '<instrucoes-do-agente>',
    scope,
    r.systemPrompt,
    'Work only in this operation folder and authorized additional directories. Do not load instructions from the enclosing Luma Hive application. Deliver for human review. Never claim tests passed unless executed.',
    r.options.agents && Object.keys(r.options.agents).length
      ? 'Available colleagues:\n' +
        Object.entries(r.options.agents)
          .map(([key, a]) => 'luma-' + key + ': ' + a.description)
          .join('\n') +
        '\nIf a focused consultation is needed, use ' +
        (r.provider === 'codex'
          ? 'spawn_agent with agent_type matching the luma-* name'
          : r.provider === 'devin'
            ? 'run_subagent'
            : 'invoke_subagent') +
        '. Wait for and summarize the response. Do not delegate your entire assigned stage.'
      : '',
    '</instrucoes-do-agente>',
    r.prompt,
  ].join('\n\n');
const toolMap: Record<string, string> = {
  Read: 'read',
  Glob: 'glob',
  Grep: 'grep',
  Edit: 'edit',
  Write: 'write',
  Bash: 'exec',
  WebFetch: 'web_fetch',
  WebSearch: 'web_search',
};
const agyTools: Record<string, string> = {
  Read: 'view_file',
  Glob: 'find_by_name',
  Grep: 'grep_search',
  Edit: 'replace_file_content',
  Write: 'write_to_file',
  Bash: 'run_command',
};
export async function prepare(
  r: RunRequest,
  cwd: string,
  temp: string,
  id: string,
): Promise<PreparedRun> {
  const entries = (await fs.readdir(cwd, { withFileTypes: true }))
    .filter((entry) => !entry.name.startsWith('.') && entry.name !== 'node_modules')
    .slice(0, 60)
    .map((entry) => entry.name + (entry.isDirectory() ? '/' : ''));
  const scope = [
    '# Authoritative operation filesystem scope',
    'Your working directory and ONLY authorized filesystem root is: ' + cwd,
    ...(r.options.addDirs || []).map((dir) => 'Explicitly authorized additional root: ' + dir),
    'Top-level application entries at launch: ' +
      (entries.join(', ') || 'NONE. This operation folder has no application files yet.'),
    'Briefing, ADRs and handoffs below are supplied as message context. They do not prove that source files exist on disk.',
    'Effective tools for THIS agent: ' +
      ((r.options.tools || []).join(', ') || 'NONE. Answer using the supplied context only.'),
    !(r.options.tools || []).some((t) => ['Edit', 'Write', 'NotebookEdit'].includes(t))
      ? 'This agent is NOT authorized to write or edit files, including documentation. Return specifications and evidence in your response. If Bash is allowed, use it only for authorized inspection and validation; do not use commands or colleagues to bypass your editing restrictions.'
      : '',
    'The server coordinator owns handoffs. Do not invoke the next specialist to implement their future stage. Focused colleague consultations are for advice within your CURRENT stage and effective permissions; return your result and let the coordinator advance.',
    'Never search, list or read parent/sibling folders, the Luma Hive host application, previews, backups or unrelated node_modules to locate missing operation files.',
    'If no code exists here, report the missing setup as a blocker. If this stage is explicitly authorized to create the base, create it only here using the allowed tools. Otherwise stop and ask for setup. Do not infer completed implementation from demo statuses.',
    ['read-only', 'plan'].includes(r.options.permissionMode || '')
      ? 'This run is READ ONLY: inspection inside the authorized folder is allowed, but implementation and file changes are not. Report this limitation when asked to implement; never seek a different folder or workaround.'
      : '',
  ]
    .filter(Boolean)
    .join('\n');
  const o = r.options,
    args: string[] = [],
    cleanup: string[] = [],
    text = instruction(r, scope);
  await fs.mkdir(temp, { recursive: true });
  if (r.provider === 'codex') {
    args.push(
      '-a',
      'never',
      'exec',
      '--json',
      '--color',
      'never',
      '--sandbox',
      o.permissionMode === 'read-only' ||
        (o.tools && !o.tools.some((t) => ['Edit', 'Write', 'Bash', 'NotebookEdit'].includes(t)))
        ? 'read-only'
        : 'workspace-write',
      '--cd',
      cwd,
      '-c',
      'project_root_markers=[".git"]',
    );
    if (model(o.model)) args.push('--model', model(o.model));
    if (o.effort) args.push('-c', `model_reasoning_effort=${JSON.stringify(o.effort)}`);
    for (const dir of o.addDirs || []) args.push('--add-dir', dir);
    if (o.tools?.length === 0)
      args.push('--disable', 'shell_tool', '-c', 'agents.enabled=false', '-c', 'mcp_servers={}');
    if (o.agents && o.tools?.length !== 0) {
      const dir = path.join(cwd, '.codex/agents');
      await fs.mkdir(dir, { recursive: true });
      for (const [key, a] of Object.entries(o.agents)) {
        const file = path.join(dir, 'luma-' + key + '.toml');
        await fs.writeFile(
          file,
          [
            `name = ${JSON.stringify('luma-' + key)}`,
            `description = ${JSON.stringify(a.description)}`,
            `developer_instructions = ${JSON.stringify(a.prompt)}`,
            `sandbox_mode = ${JSON.stringify(o.permissionMode === 'read-only' || !a.tools.some((t) => ['Edit', 'Write', 'Bash', 'NotebookEdit'].includes(t)) ? 'read-only' : 'workspace-write')}`,
            ...(model(a.model) ? [`model = ${JSON.stringify(model(a.model))}`] : []),
            ...(a.effort ? [`model_reasoning_effort = ${JSON.stringify(a.effort)}`] : []),
          ].join('\n'),
        );
      }
      args.push('-c', 'agents.enabled=true');
    }
    args.push('-');
    return { args, input: text, cleanup };
  }
  if (o.addDirs?.length) throw Error('Additional directories are only supported by Codex');
  if (r.provider === 'devin') {
    const file = path.join(temp, id + '.prompt.md');
    await fs.writeFile(file, text);
    cleanup.push(file);
    const readonly = ['read-only', 'plan'].includes(o.permissionMode || '');
    args.push(
      '-p',
      '--respect-workspace-trust=false',
      '--permission-mode',
      readonly || o.tools?.length === 0 ? 'auto' : o.permissionMode || 'accept-edits',
    );
    if (readonly || o.tools?.length === 0) {
      const file = path.join(temp, id + '.config.json');
      await fs.writeFile(
        file,
        JSON.stringify({
          permissions: {
            deny: [
              'edit',
              'write',
              'exec',
              'web_fetch',
              'web_search',
              'run_subagent',
              'read_subagent',
              'mcp__*',
              ...(o.tools?.length === 0 ? ['read', 'glob', 'grep', 'list_directory'] : []),
            ],
          },
          subagents_enabled: false,
          auto_update: false,
          read_config_from: {
            agents_standard: false,
            cursor: false,
            windsurf: false,
            claude: false,
            copilot: false,
            opencode: false,
            zed: false,
          },
        }),
      );
      cleanup.push(file);
      args.push('--config', file);
    }
    if (o.agents && !readonly && o.tools?.length) {
      const dir = path.join(cwd, '.devin/agents');
      await fs.mkdir(dir, { recursive: true });
      for (const [key, a] of Object.entries(o.agents)) {
        const name = 'luma-' + key;
        await fs.writeFile(
          path.join(dir, name + '.md'),
          `---\nname: ${JSON.stringify(name)}\ndescription: ${JSON.stringify(a.description)}\nallowed-tools: ${JSON.stringify(a.tools.map((t) => toolMap[t]).filter(Boolean))}\n${model(a.model) ? 'model: ' + JSON.stringify(model(a.model)) + '\n' : ''}---\n\n${a.prompt}`,
        );
      }
    }
    if (model(o.model)) args.push('--model', model(o.model));
    args.push('--prompt-file', file);
    return { args, input: '', cleanup };
  }
  const directory = path.join(cwd, '.agents/agents'),
    name = 'luma-main-' + id;
  await fs.mkdir(directory, { recursive: true });
  const readonly = ['read-only', 'plan'].includes(o.permissionMode || ''),
    tools = (o.tools || [])
      .filter((t) => !readonly || ['Read', 'Glob', 'Grep'].includes(t))
      .map((t) => agyTools[t])
      .filter(Boolean);
  if (o.agents && !readonly && tools.length) {
    for (const [key, a] of Object.entries(o.agents)) {
      await fs.writeFile(
        path.join(directory, 'luma-' + key + '.md'),
        `---\nname: ${JSON.stringify('luma-' + key)}\ndescription: ${JSON.stringify(a.description)}\nmainAgent: false\nsubagent: true\nmodel: inherit\ncommandExecutionPolicy: sandbox\ntools: ${JSON.stringify(
          a.tools
            .filter((t) => (o.tools || []).includes(t))
            .map((t) => agyTools[t])
            .filter(Boolean),
        )}\n---\n\n${a.prompt}`,
      );
    }
    tools.push('invoke_subagent');
  }
  const file = path.join(directory, name + '.md');
  await fs.writeFile(
    file,
    `---\nname: ${JSON.stringify(name)}\ndescription: "Luma Hive operation"\nmainAgent: true\nsubagent: false\nmodel: inherit\ncommandExecutionPolicy: sandbox\ntools: ${JSON.stringify(tools)}\n---\n\n${scope}\n\n${r.systemPrompt}`,
  );
  cleanup.push(file);
  args.push(
    '--input-format',
    'stream-json',
    '--output-format',
    'stream-json',
    '--agent',
    name,
    '--mode',
    o.permissionMode === 'plan' && tools.length
      ? 'plan'
      : o.permissionMode === 'auto'
        ? 'auto'
        : 'accept-edits',
    '--print-timeout',
    (o.timeoutSec || 900) + 's',
  );
  if (o.permissionMode === 'unattended') args.push('--dangerously-skip-permissions');
  if (o.permissionMode !== 'plan' || !tools.length) args.push('--disable-slash-commands');
  if (model(o.model)) args.push('--model', model(o.model));
  if (o.effort) args.push('--effort', o.effort);
  return {
    args,
    input: JSON.stringify({ event: 'user', message: { content: text } }) + '\n',
    cleanup,
  };
}
export function createDecoder(provider: RunRequest['provider']): Decoder {
  let buffer = '',
    answer = '',
    sessionId: string | null = null,
    usage: Record<string, number> | null = null,
    completed = false,
    error = false;
  const messages = new Map<string, string>(),
    seen = new Set<string>();
  const toolResults = new Set<string>(),
    colleagueCalls = new Map<string, string>();
  const consumeRaw = (event: any): Omit<RunEvent, 'seq' | 'at'>[] => {
    if (provider === 'codex') {
      if (event.type === 'thread.started') {
        sessionId = event.thread_id;
        return [{ type: 'init', sessionId }];
      }
      if (event.type === 'turn.completed') {
        usage = event.usage || null;
        completed = true;
      }
      if (['turn.failed', 'error'].includes(event.type)) {
        error = true;
        completed = true;
        answer = event.error?.message || event.message || 'CLI failed';
      }
      const item = event.item;
      if (!item) return [];
      if (item.type === 'agent_message') {
        const previous = messages.get(item.id) || '',
          text = item.text || '',
          delta = text.startsWith(previous) ? text.slice(previous.length) : text;
        messages.set(item.id, text);
        if (event.type === 'item.completed') answer = text;
        return delta ? [{ type: 'text', text: delta }] : [];
      }
      if (
        [
          'command_execution',
          'file_change',
          'mcp_tool_call',
          'web_search',
          'collab_tool_call',
        ].includes(item.type)
      ) {
        let name = item.type,
          input =
            item.command ||
            item.changes ||
            item.arguments ||
            item.query ||
            item.prompt ||
            item.tool;
        if (item.type === 'collab_tool_call' && item.tool === 'spawn_agent') {
          name = 'Agent';
          input = {
            subagent_type: item.agent_type,
            description: 'Codex consultation',
            prompt: item.prompt,
          };
          for (const thread of item.receiver_thread_ids || []) colleagueCalls.set(thread, item.id);
        } else if (item.type === 'collab_tool_call') name = item.tool;
        const out: Omit<RunEvent, 'seq' | 'at'>[] = [];
        if (!seen.has(item.id)) {
          seen.add(item.id);
          out.push({ type: 'tool', name, input, callId: item.id });
        }
        if (event.type === 'item.completed' && !toolResults.has(item.id)) {
          toolResults.add(item.id);
          const failed =
            item.status === 'failed' || (item.exit_code != null && item.exit_code !== 0);
          out.push({
            type: 'tool-result',
            name,
            callId: item.id,
            error: failed,
            text:
              item.tool === 'spawn_agent' && !failed
                ? 'Waiting for colleague response'
                : item.aggregated_output ||
                  item.error?.message ||
                  JSON.stringify(item.result || item.changes || item.agents_states || ''),
          });
          for (const [thread, state] of Object.entries(item.agents_states || {}) as [
            string,
            { status: string; message?: string; error?: string },
          ][]) {
            const callId = colleagueCalls.get(thread);
            if (callId && ['completed', 'errored', 'failed'].includes(state.status)) {
              out.push({
                type: 'tool-result',
                name: 'Agent',
                callId,
                error: state.status !== 'completed',
                text: state.message || state.error || 'Colleague consultation completed',
              });
              colleagueCalls.delete(thread);
            }
          }
        }
        return out;
      }
    } else {
      if (event.event === 'init') {
        sessionId = event.conversation_id;
        return [
          {
            type: 'init',
            sessionId,
            model: typeof event.init?.model === 'string' ? event.init.model : undefined,
          },
        ];
      }
      if (event.event === 'result') {
        const result = event.result || {};
        completed = true;
        error = result.status !== 'SUCCESS' || !!result.denied_actions?.length;
        answer =
          result.error ||
          (result.denied_actions?.length
            ? 'Denied actions: ' + JSON.stringify(result.denied_actions) + '\n'
            : '') + (result.response || '');
        sessionId = result.conversation_id || sessionId;
        usage = result.usage || null;
      }
      const step = event.step_update;
      if (step?.step_type === 'agent_response') {
        const text = step.text_delta || '';
        answer += text;
        return text ? [{ type: 'text', text }] : [];
      }
      if (step?.step_type === 'tool') {
        const id = String(step.step_index),
          info = step.tool_info || {},
          out: Omit<RunEvent, 'seq' | 'at'>[] = [];
        if (!seen.has(id)) {
          seen.add(id);
          out.push({
            type: 'tool',
            name: info.name || step.tool_name,
            input: info.parameters,
            callId: id,
          });
        }
        if (
          ['DONE', 'ERROR', 'FAILED', 'CANCELED', 'CANCELLED'].includes(step.state) &&
          !toolResults.has(id)
        ) {
          toolResults.add(id);
          out.push({
            type: 'tool-result',
            name: info.name || step.tool_name,
            callId: id,
            text:
              typeof info.output === 'string'
                ? info.output
                : JSON.stringify(info.output || info.error?.message || ''),
            error: !!info.error || step.state !== 'DONE',
          });
        }
        return out;
      }
    }
    return [];
  };
  const telemetry = providerTelemetry(provider);
  const consume = (event: any): Omit<RunEvent, 'seq' | 'at'>[] => {
    const scope = telemetry.scope(event);
    return scope ? telemetry.child(event, scope) : telemetry.decorate(event, consumeRaw(event));
  };
  const feed = (chunk: string) => {
    if (provider === 'devin') {
      const text = chunk.replace(/\x1b\[[0-9;?]*[ -/]*[@-~]|\x1b\][^\x07]*\x07/g, '');
      answer += text;
      return text ? [{ type: 'text' as const, text }] : [];
    }
    buffer += chunk;
    if (buffer.length > 4 * 1024 * 1024) throw Error('CLI event exceeded buffer limit');
    const out: Omit<RunEvent, 'seq' | 'at'>[] = [];
    let cut: number;
    while ((cut = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, cut);
      buffer = buffer.slice(cut + 1);
      try {
        out.push(...consume(JSON.parse(line)));
      } catch {
        if (line.trim()) out.push({ type: 'stderr', text: line.slice(0, 4000) });
      }
    }
    return out;
  };
  return {
    get complete() {
      return completed;
    },
    feed,
    finish() {
      if (buffer.trim()) {
        try {
          consume(JSON.parse(buffer));
        } catch {}
      }
      return provider === 'devin' || completed
        ? { text: answer.trim(), error, usage, sessionId }
        : null;
    },
  };
}

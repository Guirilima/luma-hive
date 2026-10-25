import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFile, ChildProcessWithoutNullStreams } from 'node:child_process';
import { promisify } from 'node:util';
import { ServerResponse } from 'node:http';
import {
  Run,
  RunRequest,
  RunEvent,
  PROVIDERS,
  timestamp,
  uuid,
} from '../../../../packages/domain/src/models';
import { WorkspaceRepository } from '../storage/workspace.repository';
import { prepare, createDecoder } from '../providers/adapters';
import { launch, resolveExecutable, stopProcess } from '../providers/process';
import { HttpError, requireValue } from '../shared/errors';
import { projectGaps } from '../../../../packages/domain/src/workspace';
const exec = promisify(execFile);
export class RunService {
  readonly active = new Map<
    string,
    {
      run: Run;
      child: ChildProcessWithoutNullStreams;
      clients: Set<ServerResponse>;
      cancelled: boolean;
      timer: NodeJS.Timeout;
    }
  >();
  concurrency = 2;
  private pending = 0;
  constructor(
    private readonly repository: WorkspaceRepository,
    private readonly projectsDir: string,
  ) {}
  async start(request: RunRequest): Promise<Run> {
    if (this.active.size + this.pending >= this.concurrency)
      throw new HttpError(429, 'Concurrent run limit reached');
    this.pending++;
    try {
      return await this.startReserved(request);
    } finally {
      this.pending--;
    }
  }
  private async startReserved(request: RunRequest): Promise<Run> {
    requireValue(PROVIDERS.includes(request.provider), 'Invalid provider');
    requireValue(
      typeof request.prompt === 'string' && request.prompt.trim() && request.prompt.length < 400000,
      'Invalid prompt',
    );
    request.options = request.options || {};
    if (this.active.size >= this.concurrency)
      throw new HttpError(429, 'Concurrent run limit reached');
    const workspace = this.repository.read().workspace;
    requireValue(workspace, 'Create a workspace first', 409);
    const project = workspace!.projects.find((p) => p.id === request.projectId);
    requireValue(project && project.folder === request.project, 'Invalid operation');
    if (['step', 'plan', 'spawn'].includes(request.kind))
      requireValue(
        projectGaps(project!).length === 0,
        'Complete the briefing, product documents and ADRs before execution',
      );
    requireValue(
      workspace!.agents.some((a) => a.id === request.agentId && project!.agentIds.includes(a.id)),
      'Agent is not part of this operation',
    );
    requireValue(
      /^[a-z0-9][a-z0-9-]{0,79}$/.test(request.project) &&
        !/^(con|prn|aux|nul|com\d|lpt\d)$/i.test(request.project),
      'Invalid project folder',
    );
    const permissions = {
      codex: ['workspace-write', 'read-only'],
      devin: ['auto', 'accept-edits', 'smart', 'dangerous', 'read-only', 'plan'],
      antigravity: ['accept-edits', 'read-only', 'plan'],
    };
    requireValue(
      permissions[request.provider].includes(
        request.options.permissionMode || permissions[request.provider][0],
      ),
      'Invalid permission mode',
    );
    requireValue(
      !request.options.model ||
        /^[A-Za-z0-9][A-Za-z0-9._\-\[\]]{0,79}$/.test(request.options.model),
      'Invalid model',
    );
    requireValue(
      !request.options.effort ||
        [
          'low',
          'medium',
          'high',
          'xhigh',
          'max',
          ...(request.provider === 'codex' ? ['ultra'] : []),
        ].includes(request.options.effort),
      'Invalid effort',
    );
    for (const key of Object.keys(request.options.agents || {}))
      requireValue(/^[A-Za-z0-9_-]{1,70}$/.test(key), 'Invalid colleague identifier');
    const defaults = { codex: 'codex', devin: 'devin', antigravity: 'agy' },
      executable = await resolveExecutable(
        request.options.executable ||
          process.env['LUMA_' + request.provider.toUpperCase() + '_BIN'] ||
          defaults[request.provider],
      );
    requireValue(executable, 'CLI executable not found', 503);
    const cwd = path.join(this.projectsDir, request.project);
    await fs.mkdir(cwd, { recursive: true });
    const actual = await fs.realpath(cwd),
      base = await fs.realpath(this.projectsDir);
    requireValue(actual.startsWith(base + path.sep), 'Project must stay inside projects directory');
    try {
      await fs.access(path.join(cwd, '.git'));
    } catch {
      await exec('git', ['init', '-q'], { cwd, windowsHide: true, timeout: 10000 });
    }
    const id = uuid('run'),
      temp = await fs.mkdtemp(path.join(os.tmpdir(), 'luma-hive-'));
    let prepared;
    try {
      prepared = await prepare(request, cwd, temp, id);
    } catch (e) {
      await fs.rm(temp, { recursive: true, force: true });
      throw e;
    }
    const child = launch(executable!, prepared.args, cwd),
      decoder = createDecoder(request.provider);
    const run: Run = {
      id,
      provider: request.provider,
      projectId: request.projectId,
      agentId: request.agentId,
      featureId: request.featureId || '',
      kind: request.kind,
      status: 'running',
      startedAt: timestamp(),
      endedAt: null,
      result: null,
    };
    this.repository.insertRun(run);
    let seq = 0,
      tail = '',
      timeout = false,
      finished = false;
    const emit = (event: Omit<RunEvent, 'seq' | 'at'>) => {
      const payload = { ...event, seq: ++seq, at: timestamp() };
      this.repository.event(id, payload);
      for (const client of this.active.get(id)?.clients || [])
        client.write(`id: ${seq}\ndata: ${JSON.stringify(payload)}\n\n`);
      return payload;
    };
    const timer = setTimeout(
      () => {
        timeout = true;
        stopProcess(child);
      },
      Math.max(10, Math.min(7200, Number(request.options.timeoutSec) || 900)) * 1000,
    );
    this.active.set(id, { run, child, clients: new Set(), cancelled: false, timer });
    emit({
      type: 'start',
      text: request.provider,
      provider: request.provider,
      command: { executable: executable!, args: prepared.args, cwd, pid: child.pid },
      model: request.options.model || '',
      permissionMode: request.options.permissionMode || '',
    });
    child.stdin.on('error', () => {});
    child.stdin.end(prepared.input);
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      try {
        for (const event of decoder.feed(chunk)) emit(event);
      } catch (e) {
        tail = String(e);
        stopProcess(child);
      }
    });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk) => {
      tail = (tail + chunk).slice(-4000);
      emit({ type: 'stderr', text: chunk.slice(0, 4000) });
    });
    child.on('error', (e) => {
      tail = e.message;
      finish(-1);
    });
    child.on('close', (code) => finish(code));
    const finish = (code: number | null) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      const entry = this.active.get(id),
        result = decoder.finish(),
        error = !!entry?.cancelled || timeout || code !== 0 || !result || result.error;
      run.status = entry?.cancelled ? 'cancelled' : error ? 'failed' : 'done';
      run.endedAt = timestamp();
      run.result = emit({
        type: 'result',
        error,
        text: entry?.cancelled
          ? 'Run cancelled'
          : timeout
            ? 'Time limit exceeded'
            : error
              ? result?.error
                ? result.text
                : tail || 'CLI closed without a result'
              : result?.text || '',
        usage: result?.usage || null,
        sessionId: result?.sessionId || null,
        durationMs: Date.now() - Date.parse(run.startedAt),
        costUsd: null,
      });
      this.repository.updateRun(run);
      for (const client of entry?.clients || []) client.end();
      this.active.delete(id);
      for (const file of prepared.cleanup) void fs.rm(file, { force: true });
      void fs.rm(temp, { recursive: true, force: true });
    };
    return run;
  }
  cancel(id: string): void {
    const active = this.active.get(id);
    if (active) {
      active.cancelled = true;
      stopProcess(active.child);
    }
  }
  events(id: string, response: ServerResponse, after = 0): void {
    requireValue(this.repository.run(id), 'Run not found', 404);
    response.writeHead(200, {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-store',
      connection: 'keep-alive',
    });
    response.write(': connected\n\n');
    for (const event of this.repository.events(id, after))
      response.write(`id: ${event.seq}\ndata: ${JSON.stringify(event)}\n\n`);
    const active = this.active.get(id);
    if (!active) {
      response.end();
      return;
    }
    active.clients.add(response);
    const ping = setInterval(() => response.write(': ping\n\n'), 15000);
    response.on('close', () => {
      clearInterval(ping);
      active.clients.delete(response);
    });
  }
  shutdown(): void {
    for (const id of this.active.keys()) this.cancel(id);
  }
}

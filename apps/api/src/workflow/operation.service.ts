import { recordedProcessAlive } from '../providers/process';
import { WorkspaceRepository } from '../storage/workspace.repository';
import { RunService } from '../runs/run.service';
import { requireValue } from '../shared/errors';
import { DurableOperation, Checkpoint } from '../../../../packages/domain/src/workflow';
import {
  Run,
  RunRequest,
  Workspace,
  Project,
  uuid,
  timestamp,
} from '../../../../packages/domain/src/models';
import { dependenciesReady, projectGaps } from '../../../../packages/domain/src/workspace';
import {
  stagePrompt,
  calledAgentInstructions,
} from '../../../../packages/domain/src/stage-prompts';
import { agentInstructions } from '../../../../packages/domain/src/exports';
import { message } from './i18n';
const terminal = (o: DurableOperation) => ['completed', 'cancelled'].includes(o.state);
export class OperationService {
  private readonly locks = new Set<string>();
  private stopped = false;
  private readonly timer: ReturnType<typeof setInterval>;
  constructor(
    private readonly repo: WorkspaceRepository,
    private readonly runs: RunService,
  ) {
    this.recover();
    this.timer = setInterval(() => void this.tick(), 350);
    this.timer.unref();
  }
  list(projectId = '') {
    return this.repo.records<DurableOperation>('operations', projectId);
  }
  get(id: string) {
    const op = this.list().find((o) => o.id === id);
    requireValue(op, 'recovery.notFound', 404);
    return op!;
  }
  hasOpen(projectId: string) {
    return this.list(projectId).some(
      (o) => !terminal(o) || o.stages.some((s) => s.state === 'uncertain'),
    );
  }
  validateWorkspaceUpdate(input: Workspace) {
    const current = this.repo.read().workspace;
    for (const op of this.list().filter(
      (o) => !terminal(o) || o.stages.some((s) => s.state === 'uncertain'),
    )) {
      const before = current?.projects.find((p) => p.id === op.projectId),
        after = input?.projects?.find((p) => p.id === op.projectId);
      requireValue(before && after && before.folder === after.folder, 'recovery.locked', 409);
      for (const id of Object.keys(op.routes)) {
        if (op.stages.filter((s) => s.featureId === id).every((s) => s.state === 'confirmed'))
          continue;
        const a = before!.features.find((f) => f.id === id),
          b = after!.features.find((f) => f.id === id);
        requireValue(
          a &&
            b &&
            JSON.stringify([a.route, a.step, a.outputs, a.currentAgentId]) ===
              JSON.stringify([b.route, b.step, b.outputs, b.currentAgentId]) &&
            (a.status === b.status ||
              (['ready', 'blocked'].includes(a.status) &&
                ['ready', 'blocked'].includes(b.status) &&
                b.status === (dependenciesReady(b, after!) ? 'ready' : 'blocked'))),
          'recovery.locked',
          409,
        );
      }
    }
  }
  start(input: any): DurableOperation {
    const w = this.repo.read().workspace,
      p = w?.projects.find((p) => p.id === input.projectId);
    requireValue(p && w?.settings.mode === 'live', 'recovery.liveOnly');
    requireValue(input.approved === true, 'recovery.approvalRequired');
    requireValue(!this.hasOpen(p!.id), 'recovery.alreadyOpen', 409);
    requireValue(projectGaps(p!).length === 0, 'recovery.documentsRequired');
    requireValue(
      Array.isArray(input.featureIds) &&
        input.featureIds.length > 0 &&
        input.featureIds.length <= 500 &&
        new Set(input.featureIds).size === input.featureIds.length,
      'recovery.invalidPlan',
    );
    const routes: Record<string, string[]> = {},
      stages: Checkpoint[] = [];
    for (const id of input.featureIds) {
      const f = p!.features.find((f) => f.id === id);
      requireValue(f && !['done', 'review', 'running'].includes(f.status), 'recovery.invalidPlan');
      requireValue(
        f!.route.length > 0 &&
          f!.route.every((id) => p!.agentIds.includes(id) && w!.agents.some((a) => a.id === id)),
        'recovery.invalidPlan',
      );
      requireValue(
        Number.isInteger(f!.step) && f!.step >= 0 && f!.step <= f!.route.length,
        'recovery.invalidPlan',
      );
      routes[id] = [...f!.route];
      for (let i = f!.step; i < f!.route.length; i++)
        stages.push({
          id: uuid('checkpoint'),
          featureId: id,
          featureKey: f!.key,
          agentId: f!.route[i],
          index: i,
          runStart: f!.outputs.length,
          state: 'pending',
          runId: null,
          confirmedAt: null,
          attempts: [],
        });
    }
    requireValue(stages.length > 0, 'recovery.invalidPlan');
    const at = timestamp();
    const selections: DurableOperation['selections'] = {};
    for (const id of new Set(stages.map((s) => s.agentId))) {
      const a = w!.agents.find((a) => a.id === id)!,
        v = input.selections?.[id];
      selections[id] = {
        model:
          typeof v?.model === 'string'
            ? v.model
            : w!.settings.providers[a.provider].model || (a.model === 'inherit' ? '' : a.model),
        effort: v?.effort || '',
      };
    }
    const op: DurableOperation = {
      id: uuid('operation'),
      projectId: p!.id,
      state: 'running',
      createdAt: at,
      updatedAt: at,
      approvedAt: at,
      current: 0,
      reason: '',
      detail: '',
      stages,
      routes,
      selections,
      audit: [{ at, action: 'approved' }],
    };
    this.repo.putRecord('operations', op);
    void this.tick();
    return op;
  }
  async action(
    id: string,
    action: string,
    acknowledge = false,
    stageId?: string,
  ): Promise<DurableOperation> {
    const op = this.get(id);
    requireValue(!this.locks.has(id) || ['pause', 'cancel'].includes(action), 'recovery.busy', 409);
    const stage = op.stages[op.current];
    if (action === 'pause') {
      requireValue(['running', 'pausing'].includes(op.state), 'recovery.invalidAction');
      op.state = stage && ['running', 'launching'].includes(stage.state) ? 'pausing' : 'paused';
    } else if (action === 'resume') {
      requireValue(
        ['paused', 'blocked', 'interrupted'].includes(op.state),
        'recovery.invalidAction',
      );
      requireValue(
        !op.stages.some((s) => ['failed', 'uncertain'].includes(s.state)),
        'recovery.retryRequired',
      );
      op.state = 'running';
      op.reason = '';
      op.detail = '';
    } else if (action === 'retry') {
      requireValue(
        acknowledge === true &&
          stage &&
          stage.id === stageId &&
          ['failed', 'uncertain'].includes(stage.state),
        'recovery.confirmRetry',
      );
      requireValue(!this.runs.active.has(stage.runId || ''), 'recovery.busy', 409);
      const previous = stage.runId ? this.repo.run(stage.runId) : null;
      const pid = previous
        ? this.repo.events(previous.id).find((e) => e.type === 'start')?.command?.pid
        : undefined;
      if (previous && pid)
        requireValue(
          !(await recordedProcessAlive(pid, previous.startedAt)),
          'recovery.previousProcessAlive',
          409,
        );
      requireValue(this.get(id).updatedAt === op.updatedAt, 'recovery.busy', 409);
      stage.state = 'pending';
      stage.runId = null;
      op.state = 'paused';
      op.reason = '';
      op.detail = '';
    } else if (action === 'cancel') {
      requireValue(!terminal(op), 'recovery.invalidAction');
      op.state = 'cancelled';
      op.reason = 'recovery.cancelled';
      if (stage && ['running', 'launching'].includes(stage.state)) {
        stage.state = 'uncertain';
        if (stage.runId) this.runs.cancel(stage.runId);
      }
      this.commit(op, (w, p) => {
        const f = p.features.find((f) => f.id === stage?.featureId);
        if (f && f.status === 'running') {
          f.status = 'ready';
          f.currentAgentId = null;
        }
        this.chat(w, p, 'recovery.cancelled');
      });
    } else requireValue(false, 'recovery.invalidAction');
    op.updatedAt = timestamp();
    op.audit.push({ at: op.updatedAt, action, stageId: stage?.id });
    if (action !== 'cancel')
      this.commit(op, (w, p) =>
        this.chat(
          w,
          p,
          action === 'pause'
            ? op.state === 'pausing'
              ? 'recovery.pauseRequested'
              : 'recovery.pauseRecorded'
            : action === 'resume'
              ? 'recovery.resumeRecorded'
              : 'recovery.retryPrepared',
        ),
      );
    else this.repo.putRecord('operations', op);
    return op;
  }
  private commit(op: DurableOperation, fn: (w: Workspace, p: Project) => void) {
    this.repo.transaction(() => {
      const env = this.repo.read(),
        w = env.workspace,
        p = w?.projects.find((p) => p.id === op.projectId);
      requireValue(w && p, 'recovery.projectMissing', 409);
      fn(w!, p!);
      this.repo.save(w, env.rev, false, 'Execution checkpoint');
      op.updatedAt = timestamp();
      this.repo.putRecord('operations', op);
    });
  }
  private chat(
    w: Workspace,
    p: Project,
    key: string,
    args: Record<string, string> = {},
    agentId?: string,
    runId?: string,
  ) {
    const k = p.id + ':operation';
    w.chats[k] = [
      ...(w.chats[k] || []),
      {
        id: uuid('room'),
        at: timestamp(),
        role: agentId ? ('assistant' as const) : ('system' as const),
        kind: 'checkpoint',
        text: message(key, w.settings.locale, args),
        agentId,
        runId,
        simulated: false,
      },
    ].slice(-500);
  }
  private confirm(op: DurableOperation, stage: Checkpoint, run: Run) {
    this.commit(op, (w, p) => {
      const f = p.features.find((f) => f.id === stage.featureId);
      requireValue(
        f && JSON.stringify(f.route) === JSON.stringify(op.routes[f.id]),
        'recovery.planChanged',
        409,
      );
      if (!f!.outputs.some((o) => o.runId === run.id)) {
        f!.outputs.push({
          agentId: run.agentId,
          at: run.endedAt || timestamp(),
          text: run.result?.text || '',
          simulated: false,
          runId: run.id,
          usage: run.result?.usage,
          durationMs: run.result?.durationMs,
          sessionId: run.result?.sessionId,
        });
        const k = p.id + ':operation';
        w.chats[k] = [
          ...(w.chats[k] || []),
          {
            id: uuid('room'),
            at: timestamp(),
            role: 'assistant' as const,
            kind: 'result',
            agentId: run.agentId,
            featureId: f!.id,
            runId: run.id,
            text: run.result?.text || '',
            simulated: false,
            activities: this.repo
              .events(run.id)
              .filter((e) => ['tool', 'tool-result'].includes(e.type))
              .slice(-200),
          },
        ].slice(-500);
      }
      f!.step = Math.max(f!.step, stage.index + 1);
      f!.currentAgentId = null;
      stage.state = 'confirmed';
      stage.confirmedAt = run.endedAt || timestamp();
      const attempt = stage.attempts.find((a) => a.runId === run.id);
      if (attempt) attempt.state = 'confirmed';
      if (f!.step >= f!.route.length) {
        f!.status = 'review';
        this.chat(w, p, 'recovery.deliveryReview', { feature: f!.key }, p.commanderId);
      } else f!.status = 'running';
      op.audit.push({ at: timestamp(), action: 'confirmed', stageId: stage.id });
      op.current++;
      op.nextAt = new Date(Date.now() + w.settings.stepMs).toISOString();
      if (op.current >= op.stages.length) {
        op.state = 'completed';
        this.chat(w, p, 'recovery.completed');
      } else if (op.state === 'pausing') op.state = 'paused';
    });
  }
  private recover() {
    for (const op of this.list().filter((o) => !terminal(o))) {
      const stage = op.stages[op.current];
      if (stage && ['running', 'launching'].includes(stage.state)) {
        const r = this.repo.operationRuns(op.id).find((r) => r.checkpointId === stage.id);
        if (r) stage.runId = r.id;
        if (r?.status === 'done' && r.result && !r.result.error) {
          try {
            this.confirm(op, stage, r);
          } catch {
            stage.state = 'uncertain';
          }
        } else {
          stage.state = 'uncertain';
          if (stage.attempts.at(-1)) stage.attempts.at(-1)!.state = 'uncertain';
        }
      }
      if (op.state !== 'completed') {
        op.state = 'interrupted';
        op.reason = 'recovery.serverRestarted';
        op.audit.push({ at: timestamp(), action: 'interrupted', stageId: stage?.id });
      }
      op.updatedAt = timestamp();
      this.repo.putRecord('operations', op);
    }
  }
  private async tick() {
    if (this.stopped) return;
    for (const candidate of this.list().filter((o) => ['running', 'pausing'].includes(o.state))) {
      if (this.locks.has(candidate.id)) continue;
      this.locks.add(candidate.id);
      try {
        await this.advance(this.get(candidate.id));
      } catch (e) {
        const op = this.get(candidate.id);
        if (!terminal(op)) {
          op.state = 'blocked';
          op.reason = (e as Error).message.startsWith('recovery.')
            ? (e as Error).message
            : 'recovery.launchFailed';
          op.detail = (e as Error).message;
          op.updatedAt = timestamp();
          this.repo.putRecord('operations', op);
        }
      } finally {
        this.locks.delete(candidate.id);
      }
    }
  }
  private async advance(op: DurableOperation) {
    const stage = op.stages[op.current];
    if (!stage) {
      op.state = 'completed';
      op.updatedAt = timestamp();
      this.repo.putRecord('operations', op);
      return;
    }
    if (stage.state === 'running') {
      const run = stage.runId ? this.repo.run(stage.runId) : null;
      if (!run || run.status === 'running') return;
      if (run.status === 'done' && run.result && !run.result.error) {
        this.confirm(op, stage, run);
        return;
      }
      stage.state = 'failed';
      const attempt = stage.attempts.find((a) => a.runId === run.id);
      if (attempt) attempt.state = 'failed';
      op.state = 'interrupted';
      op.reason = 'recovery.stageFailed';
      op.detail = run.result?.text || '';
      this.commit(op, (_w, p) => {
        const f = p.features.find((f) => f.id === stage.featureId);
        if (f) {
          f.status = 'ready';
          f.currentAgentId = null;
        }
      });
      return;
    }
    if (op.state === 'pausing') {
      op.state = 'paused';
      op.updatedAt = timestamp();
      this.repo.putRecord('operations', op);
      return;
    }
    if (op.nextAt && Date.now() < Date.parse(op.nextAt)) return;
    requireValue(stage.state === 'pending', 'recovery.retryRequired');
    const env = this.repo.read(),
      w = env.workspace,
      p = w?.projects.find((p) => p.id === op.projectId),
      f = p?.features.find((f) => f.id === stage.featureId),
      agent = w?.agents.find((a) => a.id === stage.agentId);
    requireValue(
      w && p && f && agent && p.agentIds.includes(agent.id),
      'recovery.planChanged',
      409,
    );
    requireValue(
      JSON.stringify(f!.route) === JSON.stringify(op.routes[f!.id]) && f!.step === stage.index,
      'recovery.planChanged',
      409,
    );
    requireValue(w!.settings.mode === 'live', 'recovery.liveOnly');
    requireValue(dependenciesReady(f!, p!), 'recovery.dependencies');
    if (this.runs.availableSlots <= 0) return;
    const team = w!.agents.filter((a) => p!.agentIds.includes(a.id)),
      cfg = w!.settings.providers[agent!.provider],
      selection = op.selections[agent!.id];
    const request: RunRequest = {
      operationId: op.id,
      checkpointId: stage.id,
      projectId: p!.id,
      project: p!.folder,
      featureId: f!.id,
      agentId: agent!.id,
      provider: agent!.provider,
      kind: 'step',
      prompt: stagePrompt(p!, f!, agent!, team, stage.runStart),
      systemPrompt:
        agentInstructions(agent!) +
        `\n\nReply in ${w!.settings.locale}.\nProduct vision:\n${p!.vision}\nArchitecture:\n${p!.architecture}\nADRs:\n${p!.adrs.map((a) => a.title + '\n' + a.content).join('\n\n')}`,
      options: {
        executable: cfg.path || undefined,
        model: selection?.model || undefined,
        effort: selection?.effort || undefined,
        permissionMode: cfg.permission,
        timeoutSec: w!.settings.timeoutSec,
        tools: agent!.tools,
        addDirs: agent!.provider === 'codex' ? w!.settings.addDirs : [],
        agents: Object.fromEntries(
          team
            .filter((a) => a.id !== agent!.id && a.provider === agent!.provider)
            .map((a) => [
              a.id,
              {
                description: a.name + ': ' + a.description,
                prompt: agentInstructions(a) + '\n\n' + calledAgentInstructions,
                tools: a.tools,
                model: a.model === 'inherit' ? undefined : a.model,
                effort: a.effort || undefined,
              },
            ]),
        ),
      },
    };
    stage.state = 'launching';
    this.commit(op, (workspace, project) => {
      const feat = project.features.find((f) => f.id === stage.featureId)!;
      feat.status = 'running';
      feat.currentAgentId = stage.agentId;
      if (stage.index > 0 && !project.handoffs.some((h) => h.checkpointId === stage.id)) {
        const from = op.routes[feat.id][stage.index - 1],
          previous = [...feat.outputs].reverse().find((o) => o.agentId === from && !o.error);
        project.handoffs.push({
          id: uuid('handoff'),
          checkpointId: stage.id,
          at: timestamp(),
          from,
          to: stage.agentId,
          featureId: feat.id,
          context: previous?.text.slice(-10000) || '',
          manual: false,
          simulated: false,
        });
        const key = project.id + ':operation';
        workspace.chats[key] = [
          ...(workspace.chats[key] || []),
          {
            id: uuid('room'),
            at: timestamp(),
            role: 'system' as const,
            kind: 'handoff',
            agentId: from,
            from,
            to: stage.agentId,
            featureId: feat.id,
            text: previous?.text || '',
            runId: previous?.runId,
            simulated: false,
          },
        ].slice(-500);
      }
      this.chat(
        workspace,
        project,
        'recovery.stageStarted',
        { agent: agent!.name, feature: feat.key, step: String(stage.index + 1) },
        stage.agentId,
      );
    });
    try {
      const run = await this.runs.start(request);
      const fresh = this.get(op.id);
      if (this.stopped || terminal(fresh)) {
        this.runs.cancel(run.id);
        return;
      }
      op.state = fresh.state;
      op.audit = fresh.audit;
      stage.runId = run.id;
      stage.state = 'running';
      stage.attempts.push({ runId: run.id, at: run.startedAt, state: 'running' });
      op.updatedAt = timestamp();
      this.repo.putRecord('operations', op);
    } catch (e) {
      const fresh = this.get(op.id);
      if (this.stopped || terminal(fresh)) return;
      op.audit = fresh.audit;
      stage.state = 'pending';
      op.state = 'blocked';
      op.reason = 'recovery.launchFailed';
      op.detail = (e as Error).message;
      this.commit(op, (_w, project) => {
        const feat = project.features.find((f) => f.id === stage.featureId);
        if (feat) {
          feat.status = 'ready';
          feat.currentAgentId = null;
        }
      });
    }
  }
  shutdown() {
    if (this.stopped) return;
    this.stopped = true;
    clearInterval(this.timer);
    for (const op of this.list().filter((o) => !terminal(o))) {
      const s = op.stages[op.current];
      if (s && ['launching', 'running'].includes(s.state)) {
        s.state = 'uncertain';
        if (s.runId) this.runs.cancel(s.runId);
      }
      op.state = 'interrupted';
      op.reason = 'recovery.serverRestarted';
      op.updatedAt = timestamp();
      this.repo.putRecord('operations', op);
    }
  }
}

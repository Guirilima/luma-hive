import { stagePrompt, calledAgentInstructions } from './stage-prompts';
import { ConversationTurn, conversationIdentity } from './conversation-prompts';
import {
  PlanItem,
  defaultPlan,
  sprintPlanPrompt,
  readSprintPlan,
  planningSpeech,
} from './sprint-plan';
export type { PlanItem } from './sprint-plan';
import { agentInstructions } from '@domain/exports';
import { RoomService } from './room.service';
import { Injectable, computed, inject, signal, effect } from '@angular/core';
import {
  Agent,
  Feature,
  Output,
  Project,
  RunEvent,
  RunRequest,
  uuid,
  timestamp,
} from '@domain/models';
import { dependenciesReady, refreshBlocked, projectGaps, featureRoute } from '@domain/workspace';
import { resolveAgentSelection } from '@domain/model-selection';
import { ApiService } from '../api/api.service';
import { WorkspaceStore } from '../workspace/workspace.store';
import { ProviderService } from '../providers/provider.service';
import { I18nService } from '../i18n/i18n.service';
@Injectable({ providedIn: 'root' })
export class ExecutionService {
  readonly room = inject(RoomService);
  private readonly api = inject(ApiService);
  readonly store = inject(WorkspaceStore);
  private readonly providers = inject(ProviderService);
  private readonly i18n = inject(I18nService);
  readonly busy = signal(false);
  readonly paused = signal(false);
  readonly planning = signal(false);
  readonly plan = signal<PlanItem[] | null>(null);
  readonly planOrigin = signal<'distribution' | 'execution'>('distribution');
  readonly planSource = signal<'commander' | 'default' | 'demo'>('default');
  readonly planLabel = signal('');
  readonly currentKind = signal('');
  readonly planValidCount = computed(
    () => this.plan()?.filter((item) => item.route.length && !item.missing?.length).length || 0,
  );
  distribute(featureId?: string, sprintId?: string): void {
    if (this.busy() || this.planning() || this.interacting()) return;
    const p = this.store.project();
    if (!p) return;
    const commander = this.store.agent(p.commanderId);
    if (!commander || commander.role !== 'commander') {
      this.store.error.set('A squad da operação precisa de um comandante.');
      return;
    }
    if (!p.briefing.trim()) {
      this.store.error.set('Escreva o briefing antes de distribuir features.');
      return;
    }
    const features = p.features.filter(
      (f) =>
        !['done', 'review', 'running'].includes(f.status) &&
        (!featureId || f.id === featureId) &&
        (!sprintId || f.sprintId === sprintId),
    );
    if (!features.length) {
      this.store.error.set('Não há features pendentes de distribuição. Revise as entregas.');
      return;
    }
    this.planOrigin.set('distribution');
    this.plan.set(
      features.map((f) => ({ featureId: f.id, ...featureRoute(f, this.store.team()), briefs: [] })),
    );
  }
  readonly currentFeature = signal('');
  readonly currentAgent = signal('');
  readonly currentRun = signal('');
  readonly latestRunId = signal('');
  readonly sessionRunIds = signal<string[]>([]);
  readonly events = signal<RunEvent[]>([]);
  readonly label = signal('');
  readonly busyAgents = computed(() => {
    if (!this.currentAgent()) return [];
    const active = new Set([this.currentAgent()]),
      calls = new Map<string, string>();
    for (const event of this.events()) {
      if (
        event.type === 'tool' &&
        ['Agent', 'invoke_subagent', 'run_subagent'].includes(event.name || '')
      ) {
        const input = event.input as Record<string, unknown> | undefined,
          name = String(
            input?.['subagent_type'] || input?.['agent_name'] || input?.['name'] || '',
          ).replace(/^luma-/, '');
        const agent = this.store
          .team()
          .find((a) => a.id === name || a.name.toLowerCase() === name.toLowerCase());
        if (agent && event.callId) calls.set(event.callId, agent.id);
      }
      if (
        event.type === 'tool-result' &&
        event.callId &&
        event.text !== 'Waiting for colleague response'
      )
        calls.delete(event.callId);
    }
    for (const id of calls.values()) active.add(id);
    return [...active];
  });
  readonly interacting = signal(false);
  private generation = 0;
  private requestAbort: (() => void) | null = null;
  constructor() {
    effect(() => {
      this.store.projectLocked.set(
        this.busy() ||
          this.planning() ||
          this.interacting() ||
          (this.planOrigin() === 'execution' && !!this.plan()),
      );
    });
  }
  private route(f: Feature, p: Project): string[] {
    if (f.route.length) {
      if (f.route.some((id) => !p.agentIds.includes(id) || !this.store.agent(id)))
        throw Error('A rota contém um agente indisponível. Redistribua a feature.');
      return [...f.route];
    }
    const result = featureRoute(f, this.store.team());
    if (result.missing.length)
      throw Error(
        this.i18n.text('run.missing') +
          ' ' +
          result.missing.map((role) => this.i18n.text('role.' + role)).join(', '),
      );
    return result.route;
  }
  togglePause(): void {
    if (!this.busy()) return;
    const pausing = !this.paused();
    this.paused.set(pausing);
    const text = pausing
      ? this.interacting()
        ? 'Pausa pedida: o agente termina a etapa em andamento e a squad para.'
        : 'Execução pausada pelo operador.'
      : 'Execução retomada.';
    this.room.append(text, { kind: 'system' });
    this.store.log(text, 'system');
  }
  operationDirectory(): string {
    const start = [...this.events()].reverse().find((e) => e.type === 'start' && e.command);
    return start?.command?.cwd || 'projects/' + (this.store.project()?.folder || '');
  }
  startCurrent(): void {
    if (this.busy()) {
      this.togglePause();
      return;
    }
    if (this.planning()) {
      this.room.open();
      return;
    }
    if (this.interacting()) return;
    if (this.planOrigin() === 'execution' && this.plan()) {
      void this.approvePlan();
      return;
    }
    const p = this.store.project();
    if (!p) return;
    const sprint =
      p.sprints.find((s) => p.features.some((f) => f.sprintId === s.id && f.status !== 'done')) ||
      p.sprints.at(-1);
    if (!sprint) {
      this.store.error.set('Crie uma sprint antes de executar.');
      return;
    }
    void this.preparePlan(undefined, sprint.id);
  }
  async preparePlan(featureId?: string, sprintId?: string): Promise<void> {
    if (this.busy() || this.planning() || this.interacting()) return;
    const project = this.store.project();
    if (!project) return;
    const gaps = projectGaps(project);
    if (gaps.length) {
      this.store.error.set(
        this.i18n.text('error.required') + ' ' + gaps.map((key) => this.i18n.text(key)).join(', '),
      );
      return;
    }
    const features = project.features.filter(
      (f) =>
        !['done', 'review', 'running'].includes(f.status) &&
        (!featureId || f.id === featureId) &&
        (!sprintId || f.sprintId === sprintId),
    );
    if (!features.length) {
      this.store.error.set('Não há features pendentes. Revise as entregas.');
      return;
    }
    if (!features.some((f) => dependenciesReady(f, project))) {
      const pending = features[0].dependencies
        .filter((id) => project.features.find((f) => f.id === id)?.status !== 'done')
        .map((id) => project.features.find((f) => f.id === id)?.key);
      this.store.error.set('Aguarda ' + pending.join(', ') + '.');
      return;
    }
    this.planOrigin.set('execution');
    this.room.open();
    const label = featureId
      ? features[0].key
      : project.sprints.find((s) => s.id === sprintId)?.name || project.name;
    this.planLabel.set(label);
    this.events.set([]);
    const started = this.i18n
      .text(featureId ? 'run.featureStarted' : 'run.sprintStarted')
      .replace('{label}', label);
    const planningNote = this.i18n
      .text('run.planningFeatures')
      .replace('{count}', String(features.length))
      .replace('{plural}', features.length === 1 ? '' : 's')
      .replace('{keys}', features.map((f) => f.key).join(', '));
    this.room.append(started + '. ' + planningNote, { kind: 'system' });
    this.planning.set(true);
    const token = ++this.generation;
    try {
      const live = this.store.settings()?.mode === 'live';
      let plan = defaultPlan(features, this.store.team()),
        speech = '';
      this.planSource.set(live ? 'commander' : 'demo');
      try {
        const commander = this.store.agent(project.commanderId);
        if (live && commander) {
          const answer = await this.execute(
            commander,
            'plan',
            sprintPlanPrompt(project, features, this.store.team(), label),
            undefined,
            true,
          );
          if (token !== this.generation) return;
          if (answer.error) throw Error(answer.text);
          speech = planningSpeech(answer.text);
          const parsed = readSprintPlan(answer.text, features, this.store.team());
          if (!parsed) throw Error('Resposta sem um plano válido.');
          plan = parsed.items;
          speech = parsed.text;
        }
      } catch (error) {
        if (token !== this.generation) return;
        this.planSource.set(live ? 'default' : 'demo');
        this.room.append(
          'O comandante não conseguiu planejar (' +
            (error as Error).message.slice(0, 220) +
            '). Usei a distribuição padrão da squad.',
          { kind: 'system' },
        );
      }
      if (token !== this.generation) return;
      const valid = plan.filter((item) => item.route.length && !item.missing?.length);
      if (!valid.length) {
        this.room.append(
          'Nenhuma feature tem especialistas na squad para montar uma rota. Complete a squad no Squad Studio.',
          { kind: 'system' },
        );
        return;
      }
      if (!speech && !live)
        speech =
          'Plano pronto para ' +
          label +
          ': ' +
          valid.length +
          ' de ' +
          plan.length +
          ' features com rota. Confere as instruções e aprova que eu solto a squad.';
      if (speech)
        this.room.append(speech, { role: 'assistant', kind: 'chat', agentId: project.commanderId });
      this.plan.set(plan);
      this.room.append('', {
        kind: 'plan',
        plan: {
          items: structuredClone(plan),
          status: 'awaiting',
          source: this.planSource(),
          label,
        },
      });
    } catch (e) {
      this.store.report(e);
    } finally {
      if (token === this.generation) {
        this.planning.set(false);
        if (!this.busy() && !this.interacting()) this.currentAgent.set('');
      }
    }
  }
  cancelPlan(): void {
    this.room.resolvePlan('cancelled');
    this.plan.set(null);
  }
  async approvePlan(start = true): Promise<void> {
    if (this.interacting()) return;
    const plan = this.plan()?.filter((item) => item.route.length && !item.missing?.length);
    if (!plan?.length) return;
    this.store.change((w) => {
      const p = w.projects.find((p) => p.id === w.projectId)!;
      for (const item of plan) {
        const f = p.features.find((f) => f.id === item.featureId)!;
        f.route = item.route;
        f.briefs = item.briefs;
        f.step = 0;
        f.currentAgentId = null;
        f.status = dependenciesReady(f, p) ? 'ready' : 'blocked';
      }
      refreshBlocked(p);
    });
    if (this.planOrigin() === 'execution') this.room.resolvePlan('approved');
    this.plan.set(null);
    if (this.planOrigin() === 'execution')
      this.room.append('Aprovado. Podem executar.', { role: 'user', kind: 'chat' });
    else this.room.append(this.i18n.text('feature.planApprove'), { kind: 'system' });
    if (start) await this.run(plan.map((i) => i.featureId));
  }
  async run(ids: string[]): Promise<void> {
    if (this.busy() || this.interacting()) return;
    this.busy.set(true);
    this.paused.set(false);
    const generation = ++this.generation,
      pid = this.store.project()!.id;
    try {
      for (const featureId of ids) {
        if (generation !== this.generation) break;
        while (this.paused() && generation === this.generation)
          await new Promise((r) => setTimeout(r, 200));
        const p = this.store.project(),
          f = p?.features.find((f) => f.id === featureId);
        if (!p || p.id !== pid || !f || !dependenciesReady(f, p)) continue;
        const route = this.route(f, p),
          startStep = Math.min(f.step || 0, route.length);
        if (!route.length) throw Error('No agent route available');
        this.currentFeature.set(f.id);
        this.label.set(f.key + ' / ' + f.title);
        this.store.change((w) => {
          const feature = w.projects
            .find((p) => p.id === pid)!
            .features.find((x) => x.id === f.id)!;
          feature.status = 'running';
          feature.route = route;
          feature.step = startStep;
        });
        const first = this.store.agent(route[startStep]);
        if (first && startStep === 0)
          this.room.append(
            first.name +
              ', a ' +
              f.key +
              ' (' +
              f.title +
              ') começa com você. Rota: ' +
              route.map((id) => this.store.agent(id)?.name).join(' > ') +
              '.',
            { role: 'assistant', kind: 'chat', agentId: p.commanderId, featureId: f.id },
            pid,
          );
        const runStart = f.outputs.length;
        let previous: Agent | undefined;
        for (let step = startStep; step < route.length; step++) {
          if (generation !== this.generation) break;
          const agent = this.store.agent(route[step]);
          if (!agent) continue;
          if (previous) {
            this.store.change((w) => {
              const p = w.projects.find((p) => p.id === pid)!;
              const feature = p.features.find((f) => f.id === featureId)!;
              p.handoffs.push({
                id: uuid('handoff'),
                at: timestamp(),
                from: previous!.id,
                to: agent.id,
                featureId,
                context: feature.outputs.at(-1)?.text.slice(-10000) || '',
                manual: false,
                simulated: w.settings.mode === 'demo',
              });
            });
            this.room.append(
              this.store.feature(f.id)?.outputs.at(-1)?.text || '',
              {
                kind: 'handoff',
                agentId: previous.id,
                from: previous.id,
                to: agent.id,
                featureId: f.id,
              },
              pid,
            );
          }
          this.currentAgent.set(agent.id);
          this.store.change((w) => {
            const feature = w.projects
              .find((p) => p.id === pid)!
              .features.find((x) => x.id === f.id)!;
            feature.currentAgentId = agent.id;
            feature.step = step;
          });
          const latest = this.store.project()!.features.find((x) => x.id === f.id)!;
          const prompt = stagePrompt(
            this.store.project()!,
            latest,
            agent,
            this.store.team(),
            runStart,
          );
          this.room.append(
            (previous
              ? 'Peguei a ' + f.key + ' com ' + previous.name + '.'
              : 'Começando a ' + f.key + '.') +
              ' Minha parte: ' +
              (f.briefs[step] || agent.description),
            { agentId: agent.id, featureId: f.id, kind: 'step' },
            pid,
          );
          // A completed stage passes the baton immediately; pausing gates the next CLI call.
          while (this.paused() && generation === this.generation)
            await new Promise((r) => setTimeout(r, 200));
          if (generation !== this.generation) break;
          const result = await this.execute(agent, 'step', prompt, f.id);
          if (generation !== this.generation) break;
          this.store.change((w) => {
            const project = w.projects.find((p) => p.id === pid)!,
              feature = project.features.find((f) => f.id === featureId)!;
            feature.outputs.push(result);
            if (!result.error) feature.step = step + 1;
          });
          this.room.append(
            result.text,
            {
              role: 'assistant',
              agentId: agent.id,
              featureId: f.id,
              kind: result.error ? 'error' : 'result',
              activities: this.events().filter(
                (e) => e.type === 'tool' || e.type === 'tool-result',
              ),
              runId: result.runId,
              simulated: result.simulated,
            },
            pid,
          );
          if (result.error) throw Error(result.text);
          previous = agent;
          await new Promise((r) => setTimeout(r, this.store.settings()?.stepMs || 1800));
        }
        if (generation === this.generation) {
          this.store.change((w) => {
            const f = w.projects
              .find((p) => p.id === pid)!
              .features.find((f) => f.id === featureId)!;
            f.status = 'review';
            f.currentAgentId = null;
          });
          this.room.append(
            f.key +
              ' fechou a rota. A entrega está com você para revisão; aprovar libera quem depende dela.',
            { role: 'assistant', kind: 'chat', agentId: p.commanderId, featureId: f.id },
            pid,
          );
          this.room.append(
            this.i18n.text('run.waiting') + ' · ' + f.key,
            { kind: 'review', featureId: f.id },
            pid,
          );
          this.store.log(this.i18n.text('run.waiting') + ' · ' + f.key, 'review', null, pid);
        }
      }
    } catch (e) {
      this.store.report(e);
      this.store.change((w) => {
        const f = w.projects
          .find((p) => p.id === pid)
          ?.features.find((f) => f.id === this.currentFeature());
        if (f) {
          f.status = 'ready';
          f.step = 0;
          f.currentAgentId = null;
        }
      });
    } finally {
      if (generation === this.generation) {
        this.busy.set(false);
        this.currentFeature.set('');
        this.currentAgent.set('');
        this.currentRun.set('');
      }
      await this.store.flush();
    }
  }
  async execute(
    agent: Agent,
    kind: string,
    prompt: string,
    featureId?: string,
    readOnly = false,
    conversation?: ConversationTurn,
  ): Promise<Output> {
    if (this.interacting()) throw Error('Another agent interaction is running');
    this.interacting.set(true);
    try {
      return await this.executeInternal(agent, kind, prompt, featureId, readOnly, conversation);
    } finally {
      this.interacting.set(false);
      this.currentRun.set('');
      this.requestAbort = null;
      if (!this.busy() && !this.planning()) this.currentAgent.set('');
    }
  }
  private async executeInternal(
    agent: Agent,
    kind: string,
    prompt: string,
    featureId?: string,
    readOnly = false,
    conversation?: ConversationTurn,
  ): Promise<Output> {
    const settings = this.store.settings()!,
      project = conversation?.project || this.store.project()!,
      generation = this.generation,
      started = Date.now(),
      simulated = settings.mode === 'demo';
    this.events.set([]);
    this.currentKind.set(kind);
    this.currentAgent.set(agent.id);
    if (simulated) {
      await new Promise((r) => setTimeout(r, 500));
      const f = featureId ? this.store.feature(featureId) : null;
      const descriptions: Record<string, string> = {
        po: 'Escopo e critérios organizados para o handoff de requisitos.',
        architect:
          'Contratos e fronteiras de componentes organizados para orientar a implementação.',
        backend: 'Plano de API, validações e persistência preparado.',
        frontend: 'Estados de interface e pontos de integração organizados.',
        qa: 'Checklist de verificação preparado para revisão humana.',
        commander: 'Briefing decomposto em responsabilidades para o squad.',
      };
      const text =
        '[SIMULAÇÃO / SEM CÓDIGO EXECUTADO]\n' +
        (descriptions[agent.role] || 'Parte da especialidade organizada para o próximo agente.') +
        '\n\nFeature: ' +
        (f?.title || 'Conversa') +
        '\nCriterios: ' +
        (f?.criteria || '') +
        '\n\nEste é um registro ilustrativo. Nenhum arquivo foi escrito, teste executado ou resultado real verificado.';
      this.events.set([
        { seq: 1, at: timestamp(), type: 'text', text },
        { seq: 2, at: timestamp(), type: 'result', text, error: false },
      ]);
      return {
        agentId: agent.id,
        at: timestamp(),
        text,
        simulated: true,
        durationMs: Date.now() - started,
      };
    }
    const config = settings.providers[agent.provider],
      { model, effort } = resolveAgentSelection(
        agent,
        settings,
        this.providers.catalogs()[agent.provider] || [],
      );
    const colleagues = Object.fromEntries(
      this.store
        .team()
        .filter((a) => a.id !== agent.id && a.provider === agent.provider)
        .map((a) => [
          a.id,
          {
            description: a.name + ': ' + a.description,
            prompt: agentInstructions(a) + '\n\n' + calledAgentInstructions,
            tools: a.tools,
            model: a.model !== 'inherit' ? a.model : undefined,
            effort: a.effort || undefined,
          },
        ]),
    );
    const request: RunRequest = {
      provider: agent.provider,
      projectId: project.id,
      project: project.folder,
      agentId: agent.id,
      featureId,
      kind,
      prompt,
      systemPrompt: conversation
        ? [
            conversationIdentity(agent, conversation.greeting),
            conversation.systemPrompt,
            `Reply in ${this.i18n.locale()}.`,
          ].join('\n\n')
        : [
            agentInstructions(agent),
            `Reply in ${this.i18n.locale()}.`,
            `Project briefing:\n${project.briefing}\nProduct vision:\n${project.vision}\nArchitecture:\n${project.architecture}\nADRs:\n${project.adrs.map((a) => a.title + '\n' + a.content).join('\n\n')}`,
          ].join('\n\n'),
      options: {
        executable: config.path || undefined,
        model: model || undefined,
        effort: effort || undefined,
        permissionMode: readOnly ? 'read-only' : config.permission,
        timeoutSec: settings.timeoutSec,
        tools: readOnly ? [] : agent.tools,
        addDirs: agent.provider === 'codex' ? settings.addDirs : [],
        agents: readOnly ? undefined : colleagues,
      },
    };
    await this.store.flush();
    if (this.store.conflict()) throw Error(this.i18n.text('error.conflict'));
    const { run } = await this.api.start(request);
    if (generation !== this.generation) {
      await this.api.cancel(run.id);
      return {
        agentId: agent.id,
        at: timestamp(),
        text: 'Run cancelled',
        simulated: false,
        error: true,
        runId: run.id,
        durationMs: Date.now() - started,
      };
    }
    this.currentRun.set(run.id);
    this.latestRunId.set(run.id);
    this.sessionRunIds.update((ids) => [...new Set([...ids, run.id])]);
    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (event: RunEvent) => {
        if (settled) return;
        settled = true;
        this.requestAbort = null;
        resolve({
          agentId: agent.id,
          at: timestamp(),
          text: event.text || '',
          simulated: false,
          error: event.error,
          usage: event.usage,
          costUsd: event.costUsd,
          durationMs: event.durationMs,
          sessionId: event.sessionId,
          runId: run.id,
        });
      };
      const unsubscribe = this.api.subscribe(
        run.id,
        (event) => {
          this.events.update((v) => [...v, event].slice(-2000));
          if (event.type === 'result') finish(event);
        },
        () => {
          void this.api
            .run(run.id)
            .then(({ run, events }) => {
              this.events.set(events);
              if (run.result) finish(run.result);
              else reject(Error('Connection to running CLI lost'));
            })
            .catch(reject);
        },
      );
      this.requestAbort = () => {
        unsubscribe();
        finish({ seq: 0, at: timestamp(), type: 'result', text: 'Run cancelled', error: true });
      };
    });
  }
  async stop(): Promise<void> {
    const wasOperation = this.busy() || this.planning() || !!this.plan();
    const wasPlanning = this.planning() || !!this.plan();
    const feature = this.store.feature(this.currentFeature());
    if (wasOperation)
      this.room.append(
        wasPlanning
          ? 'Plano cancelado. Nenhuma feature foi alterada.'
          : 'Operação encerrada pelo operador.' +
              (feature ? ' A ' + feature.key + ' voltou para Prontas.' : ''),
        { kind: 'system' },
      );
    this.room.resolvePlan('cancelled');
    this.generation++;
    this.plan.set(null);
    this.planning.set(false);
    this.paused.set(false);
    const id = this.currentRun();
    if (id) await this.api.cancel(id);
    this.requestAbort?.();
    this.requestAbort = null;
    this.store.change((w) => {
      for (const p of w.projects)
        for (const f of p.features)
          if (f.status === 'running') {
            f.status = 'ready';
            f.step = 0;
            f.currentAgentId = null;
          }
    });
    this.busy.set(false);
    this.currentAgent.set('');
    this.currentFeature.set('');
    this.currentRun.set('');
  }
  async recover(): Promise<void> {
    const { runs } = await this.api.runs(this.store.project()?.id);
    const run = runs.find(
      (r) =>
        r.kind === 'step' &&
        r.featureId &&
        (r.status === 'running' ||
          (this.store.feature(r.featureId)?.status === 'running' &&
            !this.store.feature(r.featureId)?.outputs.some((o) => o.runId === r.id))),
    );
    if (!run) {
      this.store.change((w) => {
        for (const p of w.projects)
          for (const f of p.features)
            if (f.status === 'running') {
              f.currentAgentId = null;
              f.status = f.step >= f.route.length && f.outputs.length ? 'review' : 'ready';
            }
      });
      return;
    }
    this.busy.set(true);
    this.currentRun.set(run.id);
    this.latestRunId.set(run.id);
    this.sessionRunIds.update((ids) => [...new Set([...ids, run.id])]);
    this.currentFeature.set(run.featureId);
    this.currentAgent.set(run.agentId);
    this.label.set(this.store.feature(run.featureId)?.title || run.id);
    const finish = (event: RunEvent) => {
      this.store.change((w) => {
        const p = w.projects.find((p) => p.id === run.projectId),
          f = p?.features.find((f) => f.id === run.featureId);
        if (!f) return;
        if (!f.outputs.some((o) => o.runId === run.id)) {
          f.outputs.push({
            agentId: run.agentId,
            at: event.at,
            text: event.text || '',
            simulated: false,
            error: event.error,
            usage: event.usage,
            durationMs: event.durationMs,
            runId: run.id,
          });
          if (!event.error) f.step++;
        }
        f.currentAgentId = null;
        f.status = event.error ? 'ready' : f.step >= f.route.length ? 'review' : 'ready';
      });
      this.busy.set(false);
      this.currentRun.set('');
      this.currentFeature.set('');
      this.currentAgent.set('');
      this.requestAbort = null;
      void this.store.flush();
    };
    if (run.result) {
      finish(run.result);
      return;
    }
    const unsubscribe = this.api.subscribe(
      run.id,
      (event) => {
        this.events.update((v) => [...v, event]);
        if (event.type === 'result') finish(event);
      },
      () => {
        void this.api
          .run(run.id)
          .then((r) => {
            if (r.run.result) finish(r.run.result);
            else this.store.error.set('Connection lost. Open the console or stop the run.');
          })
          .catch((e) => this.store.report(e));
      },
    );
    this.requestAbort = () => {
      unsubscribe();
      finish({ seq: 0, type: 'result', at: timestamp(), text: 'Run cancelled', error: true });
    };
  }
}

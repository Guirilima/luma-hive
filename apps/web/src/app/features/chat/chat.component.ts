import { phoneTurn, conversationRound } from '../../core/execution/conversation-prompts';
import { agentReply, replyOptions } from '../../shared/agent-reply';
import { chatReceipt } from '../../shared/agent-reply';
import { ChatScrollState } from '../../shared/chat-scroll';
import { Component, inject, signal, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Agent, ChatMessage, ChatChoice, uuid, timestamp } from '@domain/models';
import { portrait, ROLES } from '@domain/catalog';
import { makeFeature } from '@domain/workspace';
import { WorkspaceStore } from '../../core/workspace/workspace.store';
import { ExecutionService } from '../../core/execution/execution.service';
import { DialogService } from '../../core/ui/dialog.service';
import { IconComponent } from '../../shared/icon.component';
import { ModalComponent } from '../../shared/modal.component';
import { renderMarkdown } from '../../shared/markdown';
@Component({
  selector: 'luma-chat',
  standalone: true,
  imports: [FormsModule, IconComponent, ModalComponent],
  templateUrl: './chat.component.html',
})
export class ChatComponent implements OnDestroy {
  readonly store = inject(WorkspaceStore);
  readonly execution = inject(ExecutionService);
  readonly dialogs = inject(DialogService);
  readonly router = inject(Router);
  readonly portrait = portrait;
  readonly render = renderMarkdown;
  readonly working = signal(false);
  readonly agentId = this.dialogs.current()?.id || this.store.selectedId();
  readonly greeting = this.agent()?.hellos?.[0] || 'Oi! Me conta o que você precisa.';
  readonly clock = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  message = '';
  private disposed = false;
  private generation = 0;
  private queue: string[] = [];
  private creating = false;
  private focus: { feature?: string; adr?: string } | null = null;
  constructor() {
    const last = this.messages().at(-1);
    if (!last?.options?.length || last.used)
      this.say(
        this.messages().length
          ? 'Oi de novo! Seguimos por onde?'
          : this.live()
            ? 'Se quiser, começa por um destes atalhos, ou é só me escrever 🙂'
            : 'Se ajudar, começa por um destes atalhos:',
        this.menu(),
      );
    setTimeout(() => this.scroll(), 0);
  }
  agent(): Agent | undefined {
    return this.store.agent(this.agentId);
  }
  live(): boolean {
    return this.store.settings()?.mode === 'live';
  }
  role(): string {
    return this.agent()?.specialty || ROLES[this.agent()?.role || 'custom']?.label || '';
  }
  key(): string {
    return this.store.project()!.id + ':agent:' + this.agentId;
  }
  messages(): ChatMessage[] {
    return this.store.workspace()?.chats[this.key()] || [];
  }
  model(): string {
    const a = this.agent(),
      global = a ? this.store.settings()?.providers[a.provider].model : '';
    return global || (!a?.model || a.model === 'inherit' ? 'PADRÃO' : a.model);
  }
  menu(): ChatChoice[] {
    const role = this.agent()?.role,
      items =
        role === 'commander'
          ? [
              ['status', 'Status da operação'],
              ['distribute', 'Distribuir features'],
              ['run', 'Iniciar operação'],
              ['reviews', 'Revisões pendentes'],
            ]
          : role === 'po'
            ? [
                ['ask', 'Tirar uma dúvida'],
                ['edit', 'Editar uma feature'],
                ['create', 'Criar nova feature'],
              ]
            : role === 'architect'
              ? [
                  ['ask', 'Tirar uma dúvida'],
                  ['adrs', 'Ver ADRs do projeto'],
                  ['adr-new', 'Registrar um ADR'],
                  ['review', 'Revisar uma feature'],
                ]
              : [
                  ['mine', 'Minhas features'],
                  ['spawn', 'Spawn individual'],
                  ['ask', 'Tirar uma dúvida técnica'],
                ];
    return [...items, ...(this.live() ? [['free', 'Falar livremente']] : [])]
      .filter(([id]) => this.live() || !['ask', 'free', 'review'].includes(id))
      .map(([id, label]) => ({
        id,
        label:
          id === 'reviews' && this.store.project()?.features.some((f) => f.status === 'review')
            ? label +
              ' (' +
              this.store.project()!.features.filter((f) => f.status === 'review').length +
              ')'
            : label,
      }));
  }
  private append(
    role: ChatMessage['role'],
    text: string,
    extra: Partial<ChatMessage> = {},
  ): string {
    const id = uuid('message'),
      key = this.key();
    this.store.change((w) => {
      w.chats[key] = [
        ...(w.chats[key] || []),
        { id, at: timestamp(), role, text, simulated: false, ...extra },
      ].slice(-300);
    });
    this.scroll(role === 'user');
    return id;
  }
  private say(
    text: string,
    options: ChatChoice[] = [{ id: 'menu', label: 'Voltar ao menu' }],
    list?: ChatChoice[],
  ): void {
    this.append('assistant', text, { agentId: this.agentId, options, list });
  }
  readonly chatScroll = new ChatScrollState();
  readonly readMessage = signal('');
  receipt(): string {
    return chatReceipt(this.messages(), this.readMessage());
  }
  private scroll(force = false): void {
    this.chatScroll.afterChange('.ac-screen .fe-msgs', force);
  }
  private async go(text: string, action: () => void): Promise<void> {
    this.say(text, []);
    await new Promise((r) => setTimeout(r, this.store.settings()?.motion ? 450 : 0));
    if (!this.disposed) action();
  }
  async choose(messageId: string, opt: ChatChoice): Promise<void> {
    if (this.working()) return;
    const message = this.messages().find((m) => m.id === messageId);
    if (!message || message.used) return;
    this.store.change((w) => {
      const m = w.chats[this.key()]?.find((m) => m.id === messageId);
      if (m) m.used = true;
    });
    if (opt.id === 'answer') {
      this.message = opt.label;
      await this.send();
      return;
    }
    this.append('user', opt.label);
    const p = this.store.project()!;
    switch (opt.id) {
      case 'menu':
        this.creating = false;
        this.focus = null;
        this.say('Beleza, os atalhos estão aqui de novo.', this.menu());
        break;
      case 'status': {
        const names: Record<string, string> = {
          done: 'concluídas',
          review: 'em revisão',
          running: 'em execução',
          ready: 'prontas',
          blocked: 'bloqueadas',
          backlog: 'a fazer',
        };
        const counts = Object.entries(names)
          .map(([status, label]) => ({
            n: p.features.filter((f) => f.status === status).length,
            label,
          }))
          .filter((c) => c.n)
          .map((c) => c.n + ' ' + c.label);
        this.say(p.name + ': ' + counts.join(', ') + '.', [
          { id: 'distribute', label: 'Distribuir features' },
          { id: 'run', label: 'Executar sprint atual' },
          ...(p.features.some((f) => f.status === 'review')
            ? [{ id: 'reviews', label: 'Revisões pendentes' }]
            : []),
          { id: 'menu', label: 'Voltar ao menu' },
        ]);
        break;
      }
      case 'distribute':
        if (!p.briefing.trim()) {
          this.say(
            'Preciso do briefing antes de distribuir. Escreva o contexto da operação e me chame de novo.',
            [
              { id: 'open-briefing', label: 'Abrir briefing' },
              { id: 'menu', label: 'Voltar ao menu' },
            ],
          );
          break;
        }
        await this.go('Vou montar o plano de distribuição.', () => {
          this.dialogs.close();
          void this.router.navigateByUrl('/projects').then(() => {
            this.execution.distribute();
            setTimeout(() => document.getElementById('opsPlan')?.scrollIntoView(), 40);
          });
        });
        break;
      case 'run':
        if (this.execution.busy()) {
          this.say(
            'A operação já está em andamento. Acompanhe pelo mapa e pelo registro de transmissões.',
          );
          break;
        }
        await this.go('Vou montar o plano da sprint atual para você aprovar.', () => {
          this.dialogs.close();
          const s = p.sprints.find((s) =>
            p.features.some((f) => f.sprintId === s.id && f.status !== 'done'),
          );
          void this.execution.preparePlan(undefined, s?.id);
        });
        break;
      case 'edit':
      case 'reviews':
      case 'mine':
      case 'review': {
        const features = p.features.filter((f) =>
          opt.id === 'edit'
            ? !['done', 'review', 'running'].includes(f.status)
            : opt.id === 'reviews'
              ? f.status === 'review'
              : opt.id === 'mine'
                ? f.route.includes(this.agentId)
                : f.status !== 'done',
        );
        this.say(
          features.length
            ? opt.id === 'edit'
              ? 'Qual feature você quer editar?'
              : opt.id === 'reviews'
                ? 'Estas entregas aguardam sua revisão.'
                : 'Estas são as features da operação.'
            : 'Não há features para esta opção agora.',
          [
            { id: 'menu', label: 'Voltar ao menu' },
            ...(!features.length && opt.id === 'mine'
              ? [{ id: 'spawn', label: 'Spawn individual' }]
              : []),
            ...(!features.length && opt.id === 'edit'
              ? [{ id: 'create', label: 'Criar nova feature' }]
              : []),
          ],
          features.map((f) => ({
            id:
              opt.id === 'review'
                ? 'review-pick'
                : opt.id === 'mine'
                  ? 'mine-pick'
                  : opt.id === 'reviews'
                    ? 'review-open'
                    : 'feature-pick',
            arg: f.id,
            label: f.key + ' · ' + f.title,
            key: f.key,
            title: f.title,
            tag: this.status(f.status),
            tone: f.status,
          })),
        );
        break;
      }
      case 'mine-pick': {
        const f = this.store.feature(opt.arg || '');
        if (!f) {
          this.say('Não encontrei esse item. Ele pode ter sido removido.');
          break;
        }
        const index = f.route.indexOf(this.agentId),
          previous = this.store.agent(f.route[index - 1]);
        this.say(
          'A ' +
            f.key +
            ' (' +
            f.title +
            ') está ' +
            this.status(f.status).toLowerCase() +
            ', com prioridade ' +
            f.priority +
            '. Eu entro na etapa ' +
            (index + 1) +
            ' de ' +
            f.route.length +
            (previous ? ', depois de ' + previous.name : '') +
            '.\n\n' +
            f.description.slice(0, 320),
          [
            { id: 'feature-open', arg: f.id, label: 'Abrir feature' },
            ...(this.live() ? [{ id: 'feature-ask', arg: f.id, label: 'Falar sobre ela' }] : []),
            { id: 'spawn', label: 'Spawn individual' },
            { id: 'menu', label: 'Voltar ao menu' },
          ],
        );
        break;
      }
      case 'feature-ask':
        this.focus = { feature: opt.arg };
        this.say(
          'Pode mandar: o que você quer saber da ' + this.store.feature(opt.arg || '')?.key + '?',
        );
        break;
      case 'review-open':
        await this.go('Abrindo a feature para revisão.', () => {
          this.dialogs.close();
          void this.router
            .navigateByUrl('/projects')
            .then(() => this.dialogs.reviewFeature.set(opt.arg || ''));
        });
        break;
      case 'feature-open':
      case 'feature-pick':
        await this.go('Abrindo a feature no projeto.', () => {
          const f = this.store.feature(opt.arg || '');
          if (f)
            this.dialogs.open(
              ['done', 'review', 'running'].includes(f.status) ? 'review' : 'feature',
              f.id,
            );
        });
        break;
      case 'create':
        if (!this.live()) {
          await this.go('Abrindo o editor para uma nova feature.', () =>
            this.dialogs.open('feature'),
          );
          break;
        }
        this.creating = true;
        this.say(
          'Me conta a ideia da feature em uma frase. Eu abro o editor e já começo a escrever com você.',
          [
            { id: 'create-blank', label: 'Abrir editor em branco' },
            { id: 'menu', label: 'Voltar ao menu' },
          ],
        );
        break;
      case 'create-blank':
        await this.go('Abrindo o editor em branco.', () => this.dialogs.open('feature'));
        break;
      case 'adrs':
        this.say(
          p.adrs.length
            ? 'Estas são as decisões registradas. Qual você quer ver?'
            : 'Ainda não há ADRs registrados neste projeto.',
          [
            { id: 'adr-new', label: 'Registrar um ADR' },
            { id: 'menu', label: 'Voltar ao menu' },
          ],
          p.adrs.map((a, i) => ({
            id: 'adr-pick',
            arg: a.id,
            label: a.title,
            key: 'ADR-' + String(i + 1).padStart(3, '0'),
            title: a.title,
            tag: a.status,
            tone: 'adr',
          })),
        );
        break;
      case 'adr-pick': {
        const a = p.adrs.find((a) => a.id === opt.arg);
        if (a)
          this.say(
            'ADR-' +
              String(p.adrs.indexOf(a) + 1).padStart(3, '0') +
              ': ' +
              a.title +
              ' (' +
              a.status +
              ').\n\n' +
              a.content.slice(0, 900),
            [
              { id: 'adr-open', arg: a.id, label: 'Abrir no projeto' },
              ...(this.live()
                ? [{ id: 'adr-ask', arg: a.id, label: 'Perguntar sobre este ADR' }]
                : []),
              { id: 'menu', label: 'Voltar ao menu' },
            ],
          );
        break;
      }
      case 'adr-ask':
        this.focus = { adr: opt.arg };
        this.say('Pode mandar a pergunta sobre esse ADR.');
        break;
      case 'open-briefing':
        await this.go('Abrindo o briefing da operação.', () => {
          this.dialogs.close();
          void this.router
            .navigateByUrl('/projects')
            .then(() =>
              setTimeout(() => document.getElementById('opsBriefing')?.scrollIntoView(), 40),
            );
        });
        break;
      case 'adr-open':
      case 'adr-new':
        await this.go('Abrindo as decisões de arquitetura do projeto.', () => {
          this.dialogs.close();
          void this.router.navigateByUrl('/projects').then(() => {
            this.dialogs.projectAction.set({ kind: opt.id === 'adr-new' ? 'newAdr' : 'adrs' });
          });
        });
        break;
      case 'spawn':
        await this.go('Abrindo o spawn individual.', () =>
          this.dialogs.open('spawn', this.agentId),
        );
        break;
      case 'ask':
      case 'free':
        this.focus = null;
        this.say(
          opt.id === 'free'
            ? 'Manda. Estou ouvindo.'
            : 'Pode perguntar! Vou considerar o contexto da operação.',
        );
        setTimeout(
          () => document.querySelector<HTMLTextAreaElement>('.ac-screen textarea')?.focus(),
          0,
        );
        break;
      case 'review-pick':
        this.focus = { feature: opt.arg };
        this.message =
          'Revise a arquitetura da feature ' + this.store.feature(opt.arg || '')?.title;
        await this.send();
        break;
    }
  }
  status(s: string): string {
    return (
      (
        {
          done: 'Concluída',
          review: 'Revisão humana',
          running: 'Em execução',
          ready: 'Pronta',
          backlog: 'A fazer',
          blocked: 'Bloqueada',
        } as Record<string, string>
      )[s] || s
    );
  }
  enter(e: Event): void {
    if (!(e as KeyboardEvent).shiftKey) {
      e.preventDefault();
      void this.send();
    }
  }
  async send(): Promise<void> {
    const text = this.message.trim();
    if (!text || !this.agent() || !this.live()) return;
    this.message = '';
    this.append('user', text);
    if (this.creating) {
      this.creating = false;
      const draft = makeFeature(
        Math.max(...this.store.project()!.features.map((f) => Number(f.key.slice(1)) || 0)) + 1,
        { title: text.slice(0, 120), sprintId: this.store.project()!.sprints[0].id },
      );
      this.dialogs.open('feature', undefined, undefined, undefined, {
        feature: draft,
        featurePrompt: text,
      });
      return;
    }
    this.queue.push(text);
    await this.flushQueue();
  }
  private async flushQueue(): Promise<void> {
    if (this.working() || this.disposed) return;
    this.working.set(true);
    const generation = ++this.generation;
    try {
      while (this.queue.length && !this.disposed && generation === this.generation) {
        const pending = this.queue.splice(0);
        const context = conversationRound(this.messages(), pending),
          project = this.store.project()!;
        const turn = phoneTurn(
          this.agent()!,
          project,
          this.store.team(),
          this.store.workspace()!.squads.find((q) => q.id === project.squadId),
          context.history,
          pending,
          this.greeting,
          {
            feature: this.focus?.feature
              ? this.store.feature(this.focus.feature) || undefined
              : undefined,
            adr: project.adrs.find((a) => a.id === this.focus?.adr),
          },
        );
        this.readMessage.set(
          this.messages()
            .filter((m) => m.role === 'user')
            .at(-1)?.id || '',
        );
        const result = await this.executeTurn(
          this.agent()!,
          'chat',
          turn.prompt,
          undefined,
          true,
          turn,
        );
        if (this.disposed || generation !== this.generation) break;
        if (result.error) throw Error(result.text);
        const parsed = agentReply(result.text),
          options = replyOptions(parsed.data);
        const ask = Array.isArray(parsed.data['ask']) ? parsed.data['ask'][0] : parsed.data['ask'];
        // Technical JSON is visible when it is the answer, rather than a question command.
        const prose = options.length ? parsed.text : result.text;
        const reply =
          prose +
          (options.length && ask?.question && !prose.includes(ask.question)
            ? '\n\n' + ask.question
            : '');
        this.append('assistant', reply, {
          agentId: this.agentId,
          options: [...(options || []), { id: 'menu', label: 'Voltar ao menu' }],
          runId: result.runId,
          simulated: result.simulated,
        });
      }
    } catch (e) {
      if (!this.disposed && generation === this.generation)
        this.append('system', 'Não consegui responder: ' + (e as Error).message, {
          kind: 'error',
          retry:
            this.messages()
              .filter((m) => m.role === 'user')
              .at(-1)?.text || '',
        });
    } finally {
      if (generation === this.generation) {
        this.working.set(false);
        if (this.queue.length && !this.disposed) void this.flushQueue();
      }
    }
  }
  retry(m: ChatMessage): void {
    const text = m.retry;
    if (!text || this.working() || this.execution.busy()) return;
    this.store.change((w) => {
      w.chats[this.key()] = (w.chats[this.key()] || []).filter((row) => row.id !== m.id);
    });
    this.queue.push(text);
    void this.flushQueue();
  }
  stream(): string {
    return this.execution
      .events()
      .filter((e) => e.type === 'text')
      .map((e) => e.text || '')
      .join('');
  }
  private activeTurn: ReturnType<ExecutionService['execute']> | null = null;
  private async executeTurn(...args: Parameters<ExecutionService['execute']>) {
    const turn = this.execution.execute(...args);
    this.activeTurn = turn;
    try {
      return await turn;
    } finally {
      if (this.activeTurn === turn) this.activeTurn = null;
    }
  }
  async stop(): Promise<void> {
    const turn = this.activeTurn;
    this.generation++;
    await this.execution.stop();
    await turn?.catch(() => undefined);
    this.working.set(false);
    if (this.queue.length && !this.disposed) void this.flushQueue();
  }
  close(): void {
    if (this.working()) void this.execution.stop();
    this.dialogs.close();
  }
  ngOnDestroy(): void {
    this.store.change((w) => {
      for (const m of w.chats[this.key()] || []) {
        delete m.retry;
        if (m.options?.length || m.list?.length) m.used = true;
      }
    });
    this.chatScroll.dispose();
    this.disposed = true;
    if (this.working()) void this.execution.stop();
  }
}

import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/i18n.service';
import { PortraitService } from '../../core/appearance/portrait.service';
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
  imports: [TranslatePipe, FormsModule, IconComponent, ModalComponent],
  templateUrl: './chat.component.html',
})
export class ChatComponent implements OnDestroy {
  readonly i18n = inject(I18nService);
  readonly store = inject(WorkspaceStore);
  readonly execution = inject(ExecutionService);
  readonly dialogs = inject(DialogService);
  readonly router = inject(Router);
  readonly portrait = inject(PortraitService).source;
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
    return global || (!a?.model || a.model === 'inherit' ? this.i18n.text('ui.default') : a.model);
  }
  menu(): ChatChoice[] {
    const role = this.agent()?.role,
      items =
        role === 'commander'
          ? [
              ['status', this.i18n.text('chat.status')],
              ['distribute', this.i18n.text('projects.distribute-features')],
              ['run', this.i18n.text('ui.start-operation')],
              ['reviews', this.i18n.text('ui.pending-reviews')],
            ]
          : role === 'po'
            ? [
                ['ask', this.i18n.text('ui.ask-a-question')],
                ['edit', this.i18n.text('ui.edit-a-feature')],
                ['create', this.i18n.text('ui.create-new-feature')],
              ]
            : role === 'architect'
              ? [
                  ['ask', this.i18n.text('ui.ask-a-question')],
                  ['adrs', this.i18n.text('ui.view-project-adrs')],
                  ['adr-new', this.i18n.text('ui.record-an-adr')],
                  ['review', this.i18n.text('ui.review-a-feature')],
                ]
              : [
                  ['mine', this.i18n.text('ui.my-features')],
                  ['spawn', this.i18n.text('run.individual')],
                  ['ask', this.i18n.text('ui.ask-a-technical-question')],
                ];
    return [...items, ...(this.live() ? [['free', this.i18n.text('ui.free-conversation')]] : [])]
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
    options: ChatChoice[] = [{ id: 'menu', label: this.i18n.text('ui.back-to-menu') }],
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
        this.say(this.i18n.text('ui.the-shortcuts-are-here-again'), this.menu());
        break;
      case 'status': {
        const names: Record<string, string> = {
          done: this.i18n.text('ui.completed-182'),
          review: this.i18n.text('ui.in-review'),
          running: this.i18n.text('ui.running'),
          ready: 'prontas',
          blocked: 'bloqueadas',
          backlog: this.i18n.text('ui.to-do'),
        };
        const counts = Object.entries(names)
          .map(([status, label]) => ({
            n: p.features.filter((f) => f.status === status).length,
            label,
          }))
          .filter((c) => c.n)
          .map((c) => c.n + ' ' + c.label);
        this.say(p.name + ': ' + counts.join(', ') + '.', [
          { id: 'distribute', label: this.i18n.text('projects.distribute-features') },
          { id: 'run', label: this.i18n.text('ui.run-current-sprint') },
          ...(p.features.some((f) => f.status === 'review')
            ? [{ id: 'reviews', label: this.i18n.text('ui.pending-reviews') }]
            : []),
          { id: 'menu', label: this.i18n.text('ui.back-to-menu') },
        ]);
        break;
      }
      case 'distribute':
        if (!p.briefing.trim()) {
          this.say(this.i18n.text('ui.i-need-the-briefing-before-distributing-write-the-opera'), [
            { id: 'open-briefing', label: this.i18n.text('ui.open-briefing') },
            { id: 'menu', label: this.i18n.text('ui.back-to-menu') },
          ]);
          break;
        }
        await this.go(this.i18n.text('ui.i-will-prepare-the-distribution-plan'), () => {
          this.dialogs.close();
          void this.router.navigateByUrl('/projects').then(() => {
            this.execution.distribute();
            setTimeout(() => document.getElementById('opsPlan')?.scrollIntoView(), 40);
          });
        });
        break;
      case 'run':
        if (this.execution.busy()) {
          this.say(this.i18n.text('ui.the-operation-is-already-running-follow-it-on-the-map-a'));
          break;
        }
        await this.go(
          this.i18n.text('ui.i-will-prepare-the-current-sprint-s-plan-for-your-appro'),
          () => {
            this.dialogs.close();
            const s = p.sprints.find((s) =>
              p.features.some((f) => f.sprintId === s.id && f.status !== 'done'),
            );
            void this.execution.preparePlan(undefined, s?.id);
          },
        );
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
              ? this.i18n.text('ui.which-feature-would-you-like-to-edit')
              : opt.id === 'reviews'
                ? this.i18n.text('ui.these-deliveries-await-your-review')
                : this.i18n.text('ui.these-are-the-operation-s-features')
            : this.i18n.text('ui.no-features-available-for-this-option-right-now'),
          [
            { id: 'menu', label: this.i18n.text('ui.back-to-menu') },
            ...(!features.length && opt.id === 'mine'
              ? [{ id: 'spawn', label: this.i18n.text('run.individual') }]
              : []),
            ...(!features.length && opt.id === 'edit'
              ? [{ id: 'create', label: this.i18n.text('ui.create-new-feature') }]
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
          this.say(this.i18n.text('ui.i-could-not-find-this-item-it-may-have-been-removed'));
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
            { id: 'feature-open', arg: f.id, label: this.i18n.text('ui.open-feature') },
            ...(this.live()
              ? [{ id: 'feature-ask', arg: f.id, label: this.i18n.text('ui.talk-about-it') }]
              : []),
            { id: 'spawn', label: this.i18n.text('run.individual') },
            { id: 'menu', label: this.i18n.text('ui.back-to-menu') },
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
        await this.go(this.i18n.text('ui.opening-the-feature-for-review'), () => {
          this.dialogs.close();
          void this.router
            .navigateByUrl('/projects')
            .then(() => this.dialogs.reviewFeature.set(opt.arg || ''));
        });
        break;
      case 'feature-open':
      case 'feature-pick':
        await this.go(this.i18n.text('ui.opening-the-feature-in-the-project'), () => {
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
          await this.go(this.i18n.text('ui.opening-the-new-feature-editor'), () =>
            this.dialogs.open('feature'),
          );
          break;
        }
        this.creating = true;
        this.say(this.i18n.text('ui.tell-me-the-feature-idea-in-one-sentence-i-will-open-th'), [
          { id: 'create-blank', label: this.i18n.text('ui.open-blank-editor') },
          { id: 'menu', label: this.i18n.text('ui.back-to-menu') },
        ]);
        break;
      case 'create-blank':
        await this.go(this.i18n.text('ui.opening-the-blank-editor'), () =>
          this.dialogs.open('feature'),
        );
        break;
      case 'adrs':
        this.say(
          p.adrs.length
            ? this.i18n.text('ui.these-are-the-recorded-decisions-which-would-you-like-t')
            : this.i18n.text('ui.no-adrs-recorded-in-this-project-yet'),
          [
            { id: 'adr-new', label: this.i18n.text('ui.record-an-adr') },
            { id: 'menu', label: this.i18n.text('ui.back-to-menu') },
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
              { id: 'adr-open', arg: a.id, label: this.i18n.text('ui.open-in-project') },
              ...(this.live()
                ? [{ id: 'adr-ask', arg: a.id, label: this.i18n.text('ui.ask-about-this-adr') }]
                : []),
              { id: 'menu', label: this.i18n.text('ui.back-to-menu') },
            ],
          );
        break;
      }
      case 'adr-ask':
        this.focus = { adr: opt.arg };
        this.say(this.i18n.text('ui.go-ahead-and-ask-about-this-adr'));
        break;
      case 'open-briefing':
        await this.go(this.i18n.text('ui.opening-the-operation-briefing'), () => {
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
        await this.go(this.i18n.text('ui.opening-project-architecture-decisions'), () => {
          this.dialogs.close();
          void this.router.navigateByUrl('/projects').then(() => {
            this.dialogs.projectAction.set({ kind: opt.id === 'adr-new' ? 'newAdr' : 'adrs' });
          });
        });
        break;
      case 'spawn':
        await this.go(this.i18n.text('ui.opening-individual-spawn'), () =>
          this.dialogs.open('spawn', this.agentId),
        );
        break;
      case 'ask':
      case 'free':
        this.focus = null;
        this.say(
          opt.id === 'free'
            ? this.i18n.text('ui.go-ahead-i-m-listening')
            : this.i18n.text('ui.ask-away-i-will-consider-the-operation-context'),
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
          done: this.i18n.text('status.done'),
          review: this.i18n.text('ui.human-review'),
          running: this.i18n.text('status.running'),
          ready: this.i18n.text('status.ready'),
          backlog: this.i18n.text('status.backlog'),
          blocked: this.i18n.text('status.blocked'),
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
          options: [...(options || []), { id: 'menu', label: this.i18n.text('ui.back-to-menu') }],
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

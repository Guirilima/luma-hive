import { featureTurn, conversationRound } from '../../core/execution/conversation-prompts';
import { chatReceipt } from '../../shared/agent-reply';
import { ChatScrollState } from '../../shared/chat-scroll';
import { agentReply, replyLines, replyOptions } from '../../shared/agent-reply';
import { Component, inject, input, signal, output, OnDestroy, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Feature, ChatMessage, uuid, timestamp } from '@domain/models';
import { portrait } from '@domain/catalog';
import { WorkspaceStore } from '../../core/workspace/workspace.store';
import { ExecutionService } from '../../core/execution/execution.service';
import { renderMarkdown } from '../../shared/markdown';
@Component({
  selector: 'luma-feature-conversation',
  standalone: true,
  imports: [FormsModule],
  host: { style: 'display:contents' },
  template: `
    <aside
      class="fe-chat"
      [attr.aria-label]="'Conversa com ' + (agent()?.name || 'SEM AGENTE PRD')"
    >
      <header class="fe-chat-head">
        @if (agent(); as a) {
          <img [src]="portrait(a)" alt="" />
        }
        <div>
          <div class="fe-chat-id">
            <strong>{{ agent()?.name || 'SEM AGENTE PRD' }}</strong>
            <span class="fe-model">{{ model() }}</span>
            <span class="fe-effort">▥ {{ agent()?.effort || 'PADRÃO' }}</span>
          </div>
          <small>CO-ESCRITA · RECONHECEDOR PRD</small>
        </div>
      </header>
      <div class="fe-msgs" id="feMsgs" aria-live="polite" (scroll)="chatScroll.onScroll($event)">
        <div class="fe-time">Hoje {{ time }}</div>
        <div class="fe-row agent">
          <div class="fe-bubble agent">
            {{
              agent()?.hellos?.[0] ||
                'Oi! Me conta o que precisa ser entregue, que eu ajudo a detalhar.'
            }}
          </div>
        </div>
        @for (m of messages(); track m.id) {
          <div
            [class]="
              'fe-row ' + (m.role === 'user' ? 'user' : m.role === 'system' ? 'system' : 'agent')
            "
          >
            @if (m.role === 'system') {
              <p class="fe-note" [class.error]="m.kind === 'error' || !!m.retry">
                {{ m.text }}
                @if (m.retry) {
                  <button type="button" class="link-button fe-retry" (click)="retry(m)">
                    Tentar de novo
                  </button>
                }
              </p>
            } @else {
              <div [class]="'fe-bubble ' + (m.role === 'user' ? 'user' : 'agent') + ' tail'">
                <div class="fe-bubble-md" [innerHTML]="render(m.text)"></div>
              </div>
              @if (m.retry) {
                <button type="button" class="link-button fe-retry" (click)="retry(m)">
                  Tentar novamente
                </button>
              }
              @if (m.options?.length && !m.used) {
                <div class="fe-options ac-options">
                  @for (opt of m.options; track $index) {
                    <button
                      type="button"
                      class="fe-option ac-opt"
                      (click)="answer(m.id, opt.label)"
                      [disabled]="working()"
                    >
                      {{ opt.label }}
                    </button>
                  }
                </div>
              }
              @if (m.updated?.length) {
                <div class="fe-foot">
                  <span class="fe-edits">
                    @for (field of m.updated; track field) {
                      <button
                        type="button"
                        class="fe-field-chip"
                        (click)="fieldRequested.emit(field)"
                      >
                        {{ fieldLabel(field) }}
                      </button>
                    }
                    @if (undoByMessage()[m.id]) {
                      <button type="button" class="link-button" (click)="undo(m.id)">
                        Desfazer
                      </button>
                    } @else {
                      <em>desfeito</em>
                    }
                  </span>
                </div>
              }
            }
          </div>
        }
        @if (working()) {
          <div class="fe-row agent">
            <div class="fe-bubble agent fe-typing">
              @if (stream()) {
                <div class="fe-bubble-md" [innerHTML]="render(stream())"></div>
              } @else {
                <i></i>
                <i></i>
                <i></i>
              }
            </div>
            <button type="button" class="link-button" (click)="stop()">Parar</button>
          </div>
        }
        @if (receipt(); as text) {
          <div class="fe-receipt">{{ text }}</div>
        }
      </div>
      <button
        type="button"
        class="fe-jump"
        [hidden]="!chatScroll.unread()"
        (click)="chatScroll.jump('.fe-layout .fe-msgs')"
      >
        Nova mensagem ↓
      </button>
      @if (store.settings()?.mode === 'live' && agent()) {
        <div class="fe-compose">
          <div class="fe-suggest" [hidden]="hasUserMessages()">
            @for (item of quick; track item[0]) {
              <button type="button" (click)="quickSend(item[1])">{{ item[0] }}</button>
            }
          </div>
          <div class="fe-pill">
            <textarea
              id="feChatInput"
              [(ngModel)]="message"
              (keydown.enter)="enter($event)"
              rows="1"
              maxlength="4000"
              [placeholder]="'Mensagem para ' + agent()?.name"
              [attr.aria-label]="'Mensagem para ' + agent()?.name"
            ></textarea>
            <button
              type="button"
              class="fe-send"
              (click)="send()"
              [disabled]="!message.trim()"
              aria-label="Enviar"
            >
              <svg viewBox="0 0 24 24"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" /></svg>
            </button>
          </div>
        </div>
      } @else {
        <div class="fe-compose offline">
          <p class="fe-note">
            A conversa usa o CLI pelo bridge. Inicie a aplicação com a execução ligada. O formulário
            funciona normalmente sem ele.
          </p>
        </div>
      }
    </aside>
  `,
})
export class FeatureConversationComponent implements OnDestroy {
  readonly initialMessage = input('');
  private booted = false;
  constructor() {
    effect(() => {
      const message = this.initialMessage();
      if (message && !this.booted) {
        this.booted = true;
        setTimeout(() => {
          if (!this.disposed) this.quickSend(message);
        }, 0);
      }
    });
  }
  readonly draft = input.required<Feature>();
  readonly changed = output<void>();
  readonly fieldRequested = output<string>();
  readonly chatScroll = new ChatScrollState();
  readonly readMessage = signal('');
  receipt(): string {
    return chatReceipt(this.messages(), this.readMessage());
  }
  fieldLabel(field: string): string {
    return (
      (
        {
          title: 'Título',
          description: 'Escopo',
          criteria: 'Critérios',
          tasks: 'Tarefas',
        } as Record<string, string>
      )[field] || field
    );
  }
  readonly store = inject(WorkspaceStore);
  readonly execution = inject(ExecutionService);
  readonly portrait = portrait;
  readonly render = renderMarkdown;
  readonly working = signal(false);
  readonly undoByMessage = signal<Record<string, Partial<Feature>>>({});
  readonly time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  private disposed = false;
  message = '';
  readonly quick = [
    ['Escrever do zero', 'Me ajude a escrever esta feature do zero.'],
    ['Melhorar critérios', 'Sugira critérios de aceitação verificáveis.'],
    ['Quebrar em tarefas', 'Quebre a feature em tarefas pequenas.'],
  ];
  agent() {
    const q = this.store.workspace()?.squads.find((q) => q.id === this.store.project()?.squadId);
    return this.store.agent(q?.prdId || '');
  }
  model(): string {
    const m = this.agent()?.model;
    return !m || m === 'inherit' ? 'PADRÃO' : m;
  }
  key(): string {
    return this.store.project()!.id + ':feature:' + this.draft().id;
  }
  messages(): ChatMessage[] {
    return this.store.workspace()?.chats[this.key()] || [];
  }
  append(role: ChatMessage['role'], text: string): string {
    const id = uuid('message'),
      key = this.key();
    this.store.change((w) => {
      w.chats[key] = [
        ...(w.chats[key] || []),
        {
          id,
          role,
          text,
          agentId: this.agent()?.id,
          at: timestamp(),
          simulated: this.store.settings()?.mode === 'demo',
        },
      ];
    });
    this.chatScroll.afterChange('.fe-layout .fe-msgs', role === 'user');
    return id;
  }
  enter(e: Event): void {
    if (!(e as KeyboardEvent).shiftKey) {
      e.preventDefault();
      void this.send();
    }
  }
  quickSend(text: string): void {
    this.message = text;
    void this.send();
  }
  private pending: string[] = [];
  private generation = 0;
  hasUserMessages(): boolean {
    return this.messages().some((m) => m.role === 'user');
  }
  stream(): string {
    return this.execution
      .events()
      .filter((e) => e.type === 'text')
      .map((e) => e.text || '')
      .join('')
      .split('```')[0];
  }
  async send(): Promise<void> {
    if (
      this.execution.busy() ||
      !this.message.trim() ||
      !this.agent() ||
      this.store.settings()?.mode !== 'live'
    )
      return;
    const text = this.message.trim();
    this.message = '';
    this.append('user', text);
    this.pending.push(text);
    await this.flushQueue();
  }
  private async flushQueue(): Promise<void> {
    if (this.working() || this.disposed) return;
    let text = '';
    this.working.set(true);
    const generation = ++this.generation;
    try {
      while (this.pending.length && !this.disposed && generation === this.generation) {
        const pending = this.pending.splice(0);
        text = pending.join('\n');
        const context = conversationRound(this.messages(), pending);
        const turn = featureTurn(
          this.agent()!,
          this.store.project()!,
          this.draft(),
          context.history,
          pending,
        );
        this.readMessage.set(
          this.messages()
            .filter((m) => m.role === 'user')
            .at(-1)?.id || '',
        );
        const result = await this.executeTurn(
          this.agent()!,
          'cowrite',
          turn.prompt,
          undefined,
          true,
          turn,
        );
        if (this.disposed || generation !== this.generation) return;
        if (result.error) throw Error(result.text);
        const parsed = agentReply(result.text),
          proposal = parsed.data['proposal'] || parsed.data['fields'] || parsed.data,
          ask = Array.isArray(parsed.data['ask']) ? parsed.data['ask'][0] : parsed.data['ask'];
        if (typeof proposal.scope === 'string' && !proposal.description)
          proposal.description = proposal.scope;
        const reply =
          parsed.text +
          (ask?.question && !parsed.text.includes(ask.question) ? '\n\n' + ask.question : '');
        const id = this.append('assistant', reply);
        this.store.change((w) => {
          const m = w.chats[this.key()]!.find((m) => m.id === id)!;
          m.options = replyOptions(parsed.data);
        });
        const before: Partial<Feature> = {};
        let updated = false;
        for (const key of ['title', 'description', 'criteria', 'tasks'] as const) {
          const value = proposal[key];
          if (
            typeof value === 'string' ||
            (['criteria', 'tasks'].includes(key) && Array.isArray(value))
          ) {
            before[key] = this.draft()[key];
            this.draft()[key] = Array.isArray(value)
              ? value
                  .map(
                    (v) =>
                      (key === 'tasks' ? '- [ ] ' : '- ') +
                      String(v).replace(/^(?:[-*]|\d+[.)])\s+/, ''),
                  )
                  .join('\n')
              : value;
            updated = true;
          }
        }
        if (updated) {
          this.undoByMessage.update((v) => ({ ...v, [id]: before }));
          this.store.change((w) => {
            const m = w.chats[this.key()]?.find((m) => m.id === id);
            if (m) m.updated = Object.keys(before);
          });
          this.changed.emit();
        }
      }
    } catch (e) {
      if (!this.disposed && generation === this.generation) {
        const id = this.append('system', 'Não consegui responder: ' + (e as Error).message);
        this.store.change((w) => {
          const m = w.chats[this.key()]!.find((m) => m.id === id)!;
          m.retry = text;
          m.kind = 'error';
        });
      }
    } finally {
      if (generation === this.generation) {
        this.working.set(false);
        if (this.pending.length && !this.disposed) void this.flushQueue();
      }
    }
  }
  retry(m: ChatMessage): void {
    const text = m.retry;
    if (!text || this.working() || this.execution.busy()) return;
    this.store.change((w) => {
      w.chats[this.key()] = (w.chats[this.key()] || []).filter((row) => row.id !== m.id);
    });
    this.pending.push(text);
    void this.flushQueue();
  }
  answer(id: string, text: string): void {
    this.store.change((w) => {
      const m = w.chats[this.key()]?.find((m) => m.id === id);
      if (m) m.used = true;
    });
    this.quickSend(text);
  }
  undo(id: string): void {
    const before = this.undoByMessage()[id];
    if (before) {
      Object.assign(this.draft(), structuredClone(before));
      this.undoByMessage.update((v) => {
        const next = { ...v };
        delete next[id];
        return next;
      });
      this.changed.emit();
    }
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
    if (this.pending.length && !this.disposed) void this.flushQueue();
  }
  ngOnDestroy(): void {
    this.store.change((w) => {
      for (const m of w.chats[this.key()] || []) {
        delete m.retry;
      }
    });
    this.chatScroll.dispose();
    this.disposed = true;
    if (this.working()) void this.execution.stop();
  }
}

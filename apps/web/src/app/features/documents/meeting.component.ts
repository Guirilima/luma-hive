import { UiLabelPipe } from '../../core/i18n/i18n.service';
import { PortraitService } from '../../core/appearance/portrait.service';
import {
  meetingTurn,
  conversationRound,
  MeetingGuest,
  MeetingReply,
  ownedDocuments,
  meetingAliases,
} from '../../core/execution/conversation-prompts';
import { chatReceipt } from '../../shared/agent-reply';
import { ChatScrollState } from '../../shared/chat-scroll';
import { agentReply, replyLines, replyOptions } from '../../shared/agent-reply';
import {
  Component,
  inject,
  signal,
  OnDestroy,
  ElementRef,
  viewChild,
  viewChildren,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Agent, ChatMessage, Project, Adr, uuid, timestamp } from '@domain/models';
import { portrait, ROLES } from '@domain/catalog';
import { WorkspaceStore } from '../../core/workspace/workspace.store';
import { ExecutionService } from '../../core/execution/execution.service';
import { DialogService } from '../../core/ui/dialog.service';
import { TranslatePipe, I18nService } from '../../core/i18n/i18n.service';
import { IconComponent } from '../../shared/icon.component';
import { MarkdownEditorComponent } from '../../shared/markdown-editor.component';
import { renderMarkdown } from '../../shared/markdown';

type DocumentField = 'briefing' | 'vision' | 'scopeIn' | 'scopeOut' | 'glossary' | 'architecture';

@Component({
  selector: 'luma-meeting',
  standalone: true,
  imports: [UiLabelPipe, MarkdownEditorComponent, FormsModule, TranslatePipe, IconComponent],
  templateUrl: './meeting.component.html',
})
export class MeetingComponent implements OnDestroy {
  readonly store = inject(WorkspaceStore);
  readonly execution = inject(ExecutionService);
  readonly dialogs = inject(DialogService);
  readonly i18n = inject(I18nService);
  readonly portrait = inject(PortraitService).source;
  readonly render = renderMarkdown;
  renderMessage(text: string): string {
    const entries = this.store
      .team()
      .flatMap((a) => meetingAliases(a).map((name) => ({ name, agent: a })))
      .sort((a, b) => b.name.length - a.name.length);
    if (!entries.length) return renderMarkdown(text);
    const re = new RegExp(
      '@(' +
        entries.map((e) => e.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') +
        ')(?![\\p{L}\\p{N}])',
      'giu',
    );
    let code = 0;
    return renderMarkdown(text)
      .split(/(<[^>]+>)/)
      .map((part) => {
        if (part.startsWith('<')) {
          if (/^<(code|pre)\b/i.test(part)) code++;
          else if (/^<\/(code|pre)>/i.test(part)) code = Math.max(0, code - 1);
          return part;
        }
        if (code) return part;
        return part.replace(re, (match, name: string) => {
          const agent = entries.find((e) => e.name.toLowerCase() === name.toLowerCase())?.agent;
          return agent
            ? '<a class="at-mention" href="#mention=' +
                encodeURIComponent(agent.id) +
                '">' +
                match +
                '</a>'
            : match;
        });
      })
      .join('');
  }
  messageClick(event: MouseEvent): void {
    const link = (event.target as HTMLElement).closest('a.at-mention');
    if (!link) return;
    event.preventDefault();
    const href = link.getAttribute('href') || '';
    if (!href.startsWith('#mention=')) return;
    const agent = this.store.agent(decodeURIComponent(href.slice(9)));
    if (agent) this.mention(agent.name);
  }
  readonly working = signal(false);
  readonly proposal = signal<Record<string, unknown> | null>(null);
  readonly tab = signal<'chat' | 'docs'>('chat');
  readonly sharing = signal<string | null>(null);
  readonly guests = signal<string[]>([]);
  readonly speaker = signal('');
  readonly confirmLeave = signal(false);
  readonly elapsed = signal(0);
  readonly fields = [
    'briefing',
    'vision',
    'scopeIn',
    'scopeOut',
    'glossary',
    'architecture',
  ] as const;
  draft: Project = structuredClone(this.dialogs.current()?.data?.project || this.store.project()!);
  private original = JSON.stringify(this.draft);
  private undoDraft: Partial<Project> | null = null;
  private generation = 0;
  private timer = setInterval(() => this.elapsed.update((v) => v + 1), 1000);
  readonly composer = viewChild<ElementRef<HTMLTextAreaElement>>('composer');
  readonly undoByMessage = signal<Record<string, Partial<Project>>>({});
  readonly chatScroll = new ChatScrollState();
  readonly readMessage = signal('');
  receipt(): string {
    return chatReceipt(this.messages(), this.readMessage());
  }
  readonly editors = viewChildren(MarkdownEditorComponent);
  fieldLabel(field: string): string {
    return (
      (
        {
          briefing: this.i18n.text('project.briefing'),
          vision: this.i18n.text('ui.vision'),
          scopeIn: 'Escopo',
          scopeOut: this.i18n.text('project.scopeOut'),
          glossary: this.i18n.text('project.glossary'),
          architecture: this.i18n.text('role.architect'),
          adrs: 'ADRs',
        } as Record<string, string>
      )[field] || field
    );
  }
  readonly proposalMessage = signal('');
  readonly sideWidth = signal(this.store.settings()?.teamsChat || 0);
  readonly mentionIndex = signal(0);
  readonly undoAvailable = signal(false);
  readonly openingTime = new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  readonly agenda = [
    { key: 'briefing', label: 'BRIEFING' },
    { key: 'vision', label: 'VISÃO' },
    { key: 'scopeIn', label: 'ESCOPO' },
    { key: 'glossary', label: 'GLOSSÁRIO' },
    { key: 'architecture', label: 'ARQUITETURA' },
  ];
  readonly adrStatuses = ['Proposto', 'Aceito', 'Rejeitado', 'Substituído'];
  private disposed = false;
  private resizeCleanup: (() => void) | null = null;
  constructor() {
    if (!this.messages().length) {
      for (const a of this.members())
        this.append(
          'assistant',
          a.hellos?.[0] || 'Oi! Vamos trabalhar nos documentos juntos.',
          a.id,
        );
      const missing = this.agenda
        .filter((a) => !this.agendaDone(a.key))
        .map((a) => a.label.toLowerCase());
      const done = this.agenda
        .filter((a) => this.agendaDone(a.key))
        .map((a) => a.label.toLowerCase());
      const list = (values: string[]) =>
        values.length > 1
          ? values.slice(0, -1).join(', ') + ' e ' + values.at(-1)
          : values[0] || '';
      this.append(
        'assistant',
        !missing.length
          ? 'Os documentos já estão preenchidos. Querem revisar algum ponto antes de salvar? É só dizer por onde começamos.'
          : !done.length
            ? 'A pauta de hoje é ' +
              list(missing) +
              '. Vou conduzindo e chamo cada um na hora certa. Para começar: que problema esse produto resolve e para quem?'
            : 'Já temos ' +
              list(done) +
              '. Falta ' +
              list(missing) +
              '. Seguimos por aí ou você quer revisar algo do que já está escrito?',
        this.currentCommander()?.id,
      );
    }
    setTimeout(() => this.scrollMessages(), 0);
  }
  pad(n: number): string {
    return String(n).padStart(3, '0');
  }
  agendaDone(key: string): boolean {
    return key === 'scopeIn'
      ? !!this.draft.scopeIn.trim() && !!this.draft.scopeOut.trim()
      : key === 'architecture'
        ? !!this.draft.architecture.trim() &&
          this.draft.adrs.length > 0 &&
          this.draft.adrs.every((a) => !!a.title.trim() && !!a.content.trim())
        : !!String(this.draft[key as DocumentField] || '').trim();
  }
  openDocument(key: string): void {
    this.tab.set('docs');
    setTimeout(() => {
      if (key === 'adrs')
        document.querySelector('.at-docs .doc-adrs')?.scrollIntoView({ block: 'nearest' });
      else
        this.editors()
          .find((editor) => editor.field() === key)
          ?.reveal();
    }, 0);
  }
  scrollMessages(force = false): void {
    if (!this.disposed) this.chatScroll.afterChange('.at-chat .fe-msgs', force);
  }
  readonly mentionDismissed = signal(false);
  mentionChanged(): void {
    this.mentionDismissed.set(false);
    this.mentionIndex.set(0);
  }
  mentionQuery(): { q: string; start: number } | null {
    if (this.mentionDismissed()) return null;
    const input = this.composer()?.nativeElement;
    const upto = this.message.slice(0, input?.selectionStart ?? this.message.length);
    const m = upto.match(/(?:^|\s)@([\p{L}\p{N}-]*)$/u);
    return m ? { q: m[1].toLowerCase(), start: upto.length - m[1].length - 1 } : null;
  }

  mentionHere(): Agent[] {
    const q = this.mentionQuery();
    if (!q) return [];
    return this.members().filter(
      (a) =>
        !q.q ||
        meetingAliases(a).some((name) => name.toLowerCase().startsWith(q.q)) ||
        (a.role && a.role.toLowerCase().startsWith(q.q)) ||
        (a.specialty && a.specialty.toLowerCase().startsWith(q.q)),
    );
  }

  mentionInvite(): Agent[] {
    const q = this.mentionQuery();
    if (!q) return [];
    return this.pool().filter(
      (a) =>
        !q.q ||
        meetingAliases(a).some((name) => name.toLowerCase().startsWith(q.q)) ||
        (a.role && a.role.toLowerCase().startsWith(q.q)) ||
        (a.specialty && a.specialty.toLowerCase().startsWith(q.q)),
    );
  }

  allMentions(): Agent[] {
    return [...this.mentionHere(), ...this.mentionInvite()];
  }

  roleBadgeTag(a: Agent): string {
    if (this.guests().includes(a.id)) return this.i18n.text('documents.guest');
    if (a.role === 'commander') return 'COMANDANTE';
    if (a.role === 'po') return this.i18n.text('ui.prd-analyst');
    if (a.role === 'architect') return this.i18n.text('ui.adr-analyst');
    const r = ROLES[a.role];
    return (r?.label || a.specialty || a.role).toUpperCase();
  }

  plateRoleTag(a: Agent): string {
    const q = this.store.workspace()?.squads.find((s) => s.id === this.store.project()?.squadId);
    if (a.id === q?.commanderId) return 'COMANDANTE · ORGANIZADOR';
    if (a.role === 'po') return this.i18n.text('ui.prd-analyst');
    if (a.role === 'architect') return this.i18n.text('ui.adr-analyst');
    return a.specialty || ROLES[a.role]?.label || a.role;
  }

  pickMention(name: string): void {
    const q = this.mentionQuery();
    const input = this.composer()?.nativeElement;
    const end = input?.selectionStart ?? this.message.length;
    const ins = `@${name} `;
    if (q) {
      this.message = this.message.slice(0, q.start) + ins + this.message.slice(end);
      const pos = q.start + ins.length;
      setTimeout(() => {
        if (input) {
          input.focus();
          input.setSelectionRange(pos, pos);
        }
      }, 0);
    } else {
      this.message += ins;
    }
    this.mentionIndex.set(0);
  }

  targetLine(): string {
    const val = this.message;
    const members = this.members();
    const pool = this.pool();
    const cmd = this.currentCommander();

    const calling = pool.filter((a) =>
      new RegExp(
        '(?:^|\\s)@' + a.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\p{L}\\p{N}-])',
        'iu',
      ).test(val),
    );
    const tagged = members.filter((a) =>
      new RegExp(
        '(?:^|\\s)@' + a.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\p{L}\\p{N}-])',
        'iu',
      ).test(val),
    );

    if (calling.length || tagged.length) {
      const parts: string[] = [];
      for (const a of calling) {
        parts.push(`<b>@${a.name}</b> <span>entra na chamada</span>`);
      }
      for (const a of tagged) {
        parts.push(`<b>@${a.name}</b>`);
      }
      return 'Para ' + parts.join(' ');
    }

    const previous = this.messages()
      .filter((m) => m.role !== 'system')
      .at(-1);
    const asked =
      previous?.role === 'assistant' && previous.options?.length
        ? members.find((a) => a.id === previous.agentId)
        : undefined;
    if (asked)
      return (
        'Para <b>@' +
        asked.name +
        '</b> <span>' +
        (asked.id === cmd?.id
          ? this.i18n.text('ui.leads-the-meeting')
          : this.i18n.text('ui.answers-their-question')) +
        '</span>'
      );
    if (cmd) {
      return `Para <b>@${cmd.name}</b> <span>conduz a reunião</span>`;
    }
    return '';
  }

  composerKey(e: KeyboardEvent): void {
    const all = this.allMentions();
    if (all.length && ['ArrowDown', 'ArrowUp', 'Enter', 'Tab', 'Escape'].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === 'Escape') {
        this.mentionDismissed.set(true);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        this.pickMention(all[this.mentionIndex() % all.length].name);
      } else {
        this.mentionIndex.update(
          (v) => (v + (e.key === 'ArrowDown' ? 1 : -1) + all.length) % all.length,
        );
      }
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void this.send();
    }
  }
  resizeStart(e: PointerEvent): void {
    if (e.button !== 0) return;
    e.preventDefault();
    const start = e.clientX,
      width =
        this.sideWidth() || document.getElementById('atSide')?.getBoundingClientRect().width || 384;
    const move = (v: PointerEvent) =>
      this.sideWidth.set(Math.max(300, Math.min(innerWidth * 0.6, width + start - v.clientX)));
    const up = () => {
      this.store.change((w) => (w.settings.teamsChat = this.sideWidth()));
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      this.resizeCleanup = null;
    };
    this.resizeCleanup = up;
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }
  resetWidth(): void {
    this.sideWidth.set(0);
    this.store.change((w) => (w.settings.teamsChat = 0));
  }
  resizeKey(e: KeyboardEvent): void {
    const values: Record<string, number> = {
      ArrowLeft: this.sideWidth() + 24,
      ArrowRight: this.sideWidth() - 24,
      Home: 300,
      End: Math.round(innerWidth * 0.6),
    };
    if (values[e.key] != null) {
      e.preventDefault();
      this.sideWidth.set(Math.max(300, Math.min(innerWidth * 0.6, values[e.key])));
      this.store.change((w) => (w.settings.teamsChat = this.sideWidth()));
    }
  }
  addAdr(): void {
    this.draft.adrs.push({
      id: uuid('adr'),
      title: '',
      status: 'Proposto',
      date: timestamp().slice(0, 10),
      content: '## Contexto\n\n## Decisão\n\n## Consequências\n',
    });
  }
  removeAdr(id: string): void {
    this.draft.adrs = this.draft.adrs.filter((a) => a.id !== id);
  }
  applyProposal(): void {
    const proposal = this.proposal();
    if (!proposal) return;
    this.undoDraft = {};
    for (const field of this.fields)
      if (typeof proposal[field] === 'string') this.undoDraft[field] = this.draft[field];
    if (Array.isArray(proposal['adrs'])) this.undoDraft.adrs = structuredClone(this.draft.adrs);
    for (const field of this.fields)
      if (typeof proposal[field] === 'string') this.draft[field] = proposal[field] as string;
    if (Array.isArray(proposal['adrs']))
      for (const raw of (proposal['adrs'] as (Adr & { ref?: string })[]).slice(0, 50)) {
        const n = Number(raw.ref?.match(/\d+/)?.[0] || 0),
          current =
            n > 0 ? this.draft.adrs[n - 1] : this.draft.adrs.find((a) => raw.id && a.id === raw.id);
        if (current) {
          if (raw.title) current.title = raw.title;
          if (raw.content) current.content = raw.content;
          if (this.adrStatuses.includes(raw.status)) current.status = raw.status;
        } else if (raw.title && this.draft.adrs.length < 50)
          this.draft.adrs.push({
            ...raw,
            id: raw.id || uuid('adr'),
            status: this.adrStatuses.includes(raw.status) ? raw.status : 'Proposto',
            date: raw.date || timestamp().slice(0, 10),
          });
      }
    this.proposal.set(null);
    this.undoAvailable.set(true);
  }
  undoMessage(id: string): void {
    const draft = this.undoByMessage()[id];
    if (draft) {
      Object.assign(this.draft, structuredClone(draft));
      this.undoByMessage.update((v) => {
        const next = { ...v };
        delete next[id];
        return next;
      });
    }
  }
  undoProposal(): void {
    if (this.undoDraft) {
      Object.assign(this.draft, structuredClone(this.undoDraft));
      this.undoDraft = null;
      this.undoAvailable.set(false);
    }
  }
  message = '';
  target = 'all';

  currentCommander(): Agent | undefined {
    const p = this.store.project()!;
    const q = this.store.workspace()!.squads.find((s) => s.id === p.squadId);
    return q?.commanderId ? this.store.agent(q.commanderId) : undefined;
  }

  roleBadge(agent: Agent): string {
    const p = this.store.project()!;
    const q = this.store.workspace()!.squads.find((s) => s.id === p.squadId);
    if (agent.id === q?.commanderId) return 'COMANDANTE · ORGANIZADOR';
    return agent.role === 'po'
      ? this.i18n.text('ui.prd-analyst')
      : agent.role === 'architect'
        ? this.i18n.text('ui.adr-analyst')
        : this.i18n.text('role.' + agent.role);
  }

  agentState(id: string): string {
    if (this.working() && this.speaker() === id) return this.stream() ? 'speaking' : 'thinking';
    return 'idle';
  }

  getAgent(id: string | null | undefined): Agent | undefined {
    return id ? this.store.agent(id) : undefined;
  }

  completedDocs(): number {
    return this.agenda.filter((a) => this.agendaDone(a.key)).length;
  }

  meetingDate(): string {
    const now = new Date();
    return (
      now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) +
      ' ' +
      String(now.getHours()).padStart(2, '0') +
      ':' +
      String(now.getMinutes()).padStart(2, '0')
    );
  }

  members(): Agent[] {
    const p = this.store.project()!,
      q = this.store.workspace()!.squads.find((s) => s.id === p.squadId);
    return [
      ...new Set(
        [q?.commanderId, q?.prdId, q?.adrId, ...this.guests()].filter((id): id is string => !!id),
      ),
    ]
      .map((id) => this.store.agent(id))
      .filter((a): a is Agent => !!a);
  }

  pool(): Agent[] {
    return this.store.team().filter((a) => !this.members().some((m) => m.id === a.id));
  }

  key(): string {
    return this.store.project()!.id + ':meeting';
  }

  messages(): ChatMessage[] {
    return this.store.workspace()?.chats[this.key()] || [];
  }

  senderName(msg: ChatMessage): string {
    return msg.role === 'user'
      ? this.i18n.text('documents.you')
      : this.store.agent(msg.agentId || '')?.name || 'AGENTE';
  }

  senderAgent(msg: ChatMessage): Agent | undefined {
    return msg.agentId ? this.store.agent(msg.agentId) : undefined;
  }

  msgTime(msg: ChatMessage): string {
    return msg.at
      ? new Date(msg.at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : '';
  }

  clock(): string {
    return (
      String(Math.floor(this.elapsed() / 60)).padStart(2, '0') +
      ':' +
      String(this.elapsed() % 60).padStart(2, '0')
    );
  }

  mention(agentName: string): void {
    this.message +=
      (this.message.endsWith(' ') || !this.message ? '' : ' ') + '@' + agentName + ' ';
    this.composer()?.nativeElement.focus();
  }

  join(id: string, by = this.i18n.text('documents.you'), reason = ''): boolean {
    if (!id || this.members().some((a) => a.id === id) || this.guests().length >= 3) return false;
    this.guestDetails[id] = { by, reason };
    this.guests.update((v) => [...v, id]);
    this.append(
      'system',
      by +
        ' chamou ' +
        this.store.agent(id)?.name +
        ' para a reunião.' +
        (reason ? ' ' + reason : '') +
        ' ' +
        this.store.agent(id)?.name +
        ' entrou na chamada.',
    );
    return true;
  }
  private removeGuest(id: string): void {
    if (!this.guests().includes(id)) return;
    delete this.guestDetails[id];
    this.guests.update((v) => v.filter((x) => x !== id));
    this.append('system', this.store.agent(id)?.name + ' saiu da reunião.');
  }
  leaveGuest(id: string): void {
    if (!this.working()) this.removeGuest(id);
  }

  private append(role: ChatMessage['role'], text: string, agentId?: string): void {
    const key = this.key();
    this.store.change((w) => {
      w.chats[key] = [
        ...(w.chats[key] || []),
        {
          id: uuid('message'),
          at: timestamp(),
          role,
          text,
          agentId,
          simulated: w.settings.mode === 'demo',
        },
      ].slice(-300);
    });
    this.scrollMessages(role === 'user');
  }

  onEnter(e: Event): void {
    const ke = e as KeyboardEvent;
    if (!ke.shiftKey) {
      ke.preventDefault();
      void this.send();
    }
  }

  retry(m: ChatMessage): void {
    const text = m.retry;
    if (!text || this.working() || this.execution.busy()) return;
    this.store.change((w) => {
      w.chats[this.key()] = (w.chats[this.key()] || []).filter((row) => row.id !== m.id);
    });
    this.queued.push(text);
    void this.flushQueue();
  }
  quickSend(text: string): void {
    this.message = text;
    void this.send();
  }

  private queued: string[] = [];
  private guestDetails: Record<string, MeetingGuest> = {};
  answer(id: string, label: string): void {
    const m = this.messages().find((m) => m.id === id);
    if (m?.used) return;
    this.store.change((w) => {
      const msg = w.chats[this.key()]?.find((m) => m.id === id);
      if (msg) msg.used = true;
    });
    this.quickSend(label);
  }
  async send(): Promise<void> {
    const text = this.message.trim();
    if (!text || this.execution.busy()) return;
    if (this.store.settings()?.mode !== 'live') {
      this.dialogs.notify(this.i18n.text('ui.connect-the-cli-with-execution-enabled-to-chat'));
      return;
    }
    this.message = '';
    this.append('user', text);
    this.queued.push(text);
    await this.flushQueue();
  }
  private async flushQueue(): Promise<void> {
    if (this.working() || this.disposed) return;
    let text = '';
    this.working.set(true);
    const generation = ++this.generation;
    try {
      while (this.queued.length && generation === this.generation) {
        const pending = this.queued.splice(0);
        text = pending.join('\n');
        const context = conversationRound(this.messages(), pending);
        const round: MeetingReply[] = [];
        const mentioned = this.store
          .team()
          .filter((a) =>
            meetingAliases(a).some((n) =>
              new RegExp(
                '@' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\p{L}\\p{N}-])',
                'iu',
              ).test(text),
            ),
          );
        const called = mentioned.filter(
          (a) =>
            !this.members().some((m) => m.id === a.id) &&
            this.join(a.id, this.i18n.text('documents.you'), text),
        );
        const named = this.members().filter(
          (a) => mentioned.some((m) => m.id === a.id) && !called.includes(a),
        );
        const previous = context.history.filter((m) => m.role !== 'system').at(-1);
        const asked =
          previous?.role === 'assistant' && previous.options?.length
            ? this.members().find((a) => a.id === previous.agentId)
            : undefined;
        const initial =
          called.length || named.length
            ? [...called, ...named]
            : [asked || this.currentCommander()].filter((a): a is Agent => !!a);
        const crew = [...initial],
          seen = new Set<string>(),
          waiting = new Set<string>();
        let limit = 3;
        for (
          let turnIndex = 0;
          turnIndex < crew.length && turnIndex < limit && generation === this.generation;
          turnIndex++
        ) {
          const agent = crew[turnIndex];
          if (seen.has(agent.id)) continue;
          seen.add(agent.id);
          this.speaker.set(agent.id);
          this.sharing.set(null);
          this.undoDraft = null;
          this.readMessage.set(
            this.messages()
              .filter((m) => m.role === 'user')
              .at(-1)?.id || '',
          );
          const turn = meetingTurn({
            agent,
            project: this.draft,
            squad: this.store.workspace()!.squads.find((q) => q.id === this.draft.squadId),
            team: this.store.team(),
            members: this.members(),
            guests: this.guestDetails,
            history: context.history,
            pending,
            round,
          });
          const result = await this.executeTurn(agent, 'doc', turn.prompt, undefined, true, turn);
          if (generation !== this.generation) break;
          if (result.error) throw Error(result.text);
          const parsed = agentReply(result.text),
            data = parsed.data,
            proposal = data['proposal'] || data['fields'] || data;
          const guest = this.guests().includes(agent.id);
          if (!guest) {
            const owned = ownedDocuments(agent, this.members());
            const updates: Record<string, unknown> = {};
            for (const key of owned)
              if (key in proposal)
                updates[key] = ['scopeIn', 'scopeOut', 'glossary'].includes(key)
                  ? replyLines(proposal[key])
                  : proposal[key];
            if (Object.keys(updates).length) {
              this.proposal.set(updates);
              this.applyProposal();
              const field = this.fields.find((f) => f in updates);
              if (field) this.sharing.set(field);
            }
          }
          const options = replyOptions(data),
            ask = Array.isArray(data['ask']) ? data['ask'][0] : data['ask'];
          this.append(
            'assistant',
            parsed.text +
              (ask?.question && !parsed.text.includes(ask.question) ? '\n\n' + ask.question : ''),
            agent.id,
          );
          const id = this.messages().at(-1)!.id;
          round.push({
            agent,
            text: this.messages().at(-1)!.text,
            updated: Object.keys(this.undoDraft || {}),
          });
          this.store.change((w) => {
            const msg = w.chats[this.key()]!.find((m) => m.id === id)!;
            msg.options = options;
            msg.runId = result.runId;
            msg.simulated = result.simulated;
          });
          if (this.undoDraft) {
            this.undoByMessage.update((v) => ({ ...v, [id]: structuredClone(this.undoDraft!) }));
            this.store.change((w) => {
              const m = w.chats[this.key()]?.find((m) => m.id === id);
              if (m) m.updated = Object.keys(this.undoDraft!);
            });
          }
          if (guest) {
            if (options.length) waiting.add(agent.id);
            else this.removeGuest(agent.id);
          } else {
            const invite = data['invite']
              ? Array.isArray(data['invite'])
                ? data['invite']
                : [data['invite']]
              : [];
            let at = turnIndex + 1;
            for (const item of invite.slice(0, 2)) {
              const name = String(
                typeof item === 'string' ? item : item.agent || item.name || item.codename || '',
              )
                .trim()
                .replace(/^@/, '')
                .toUpperCase();
              const colleague = this.pool().find((a) => a.name.toUpperCase() === name);
              const reason = String(
                typeof item === 'string' ? '' : item.reason || item.motivo || item.task || '',
              )
                .trim()
                .slice(0, 200);
              if (colleague && this.join(colleague.id, agent.name, reason)) {
                crew.splice(at++, 0, colleague);
                limit++;
              }
            }
            const next = String(Array.isArray(data['next']) ? data['next'][0] : data['next'] || '')
              .trim()
              .replace(/^@/, '')
              .toUpperCase();
            const colleague = this.members().find((a) => a.name.toUpperCase() === next);
            if (colleague && !crew.some((a) => a.id === colleague.id)) crew.push(colleague);
          }
        }
        for (const id of [...this.guests()])
          if (!waiting.has(id) || !seen.has(id)) this.removeGuest(id);
      }
    } catch (e) {
      if (generation === this.generation) {
        for (const id of [...this.guests()]) this.removeGuest(id);
        this.append('system', 'Não consegui responder: ' + (e as Error).message);
        this.store.change((w) => {
          const m = w.chats[this.key()]?.at(-1);
          if (m) {
            m.retry = text;
            m.kind = 'error';
          }
        });
      }
    } finally {
      if (generation === this.generation) {
        this.working.set(false);
        this.speaker.set('');
        if (this.queued.length && !this.disposed) void this.flushQueue();
      }
    }
  }

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
  shareContent(): string {
    const key = this.sharing();
    if (!key) return '';
    const proposal = this.proposal();
    return typeof proposal?.[key] === 'string'
      ? (proposal[key] as string)
      : this.fields.includes(key as DocumentField)
        ? (this.draft as any)[key]
        : '';
  }

  save(leave = false): void {
    if (this.working()) return;
    if (
      this.store.change((w) => {
        const p = w.projects.find((p) => p.id === this.draft.id)!;
        for (const key of this.fields) p[key] = this.draft[key];
        p.adrs = structuredClone(this.draft.adrs);
      })
    ) {
      this.original = JSON.stringify(this.draft);
      this.dialogs.projectDraft.set(structuredClone(this.draft));
      this.dialogs.projectAction.set({ kind: 'documents' });
      this.dialogs.notify(this.i18n.text('ui.documents-saved-to-project'));
      this.confirmLeave.set(false);
      if (leave) this.dialogs.close();
    }
  }

  forceLeave(): void {
    this.confirmLeave.set(false);
    this.dialogs.close();
  }

  close(): void {
    if (this.working()) {
      this.confirmLeave.set(true);
      return;
    }
    if (JSON.stringify(this.draft) !== this.original || this.proposal()) {
      this.confirmLeave.set(true);
      return;
    }
    this.dialogs.close();
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
    for (const id of [...this.guests()]) this.removeGuest(id);
    this.working.set(false);
    this.speaker.set('');
    if (this.queued.length && !this.disposed) void this.flushQueue();
  }

  discard(): void {
    if (!this.working()) this.dialogs.close();
  }

  ngOnDestroy(): void {
    this.store.change((w) => {
      for (const m of w.chats[this.key()] || []) {
        delete m.retry;
      }
    });
    this.chatScroll.dispose();
    this.disposed = true;
    this.resizeCleanup?.();
    if (this.working()) void this.execution.stop();
    clearInterval(this.timer);
    this.generation++;
  }
}

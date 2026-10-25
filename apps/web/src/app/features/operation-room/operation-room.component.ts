import { UiLabelPipe } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/i18n.service';
import { PortraitService } from '../../core/appearance/portrait.service';
import { planningSpeech } from '../../core/execution/sprint-plan';
import { Component, inject, signal, effect, viewChild, ElementRef, computed } from '@angular/core';
import { Router } from '@angular/router';
import { PlanComponent } from '../features/plan.component';
import { renderMarkdown } from '../../shared/markdown';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../core/execution/room.service';
import { ExecutionService } from '../../core/execution/execution.service';
import { WorkspaceStore } from '../../core/workspace/workspace.store';
import { DialogService, download } from '../../core/ui/dialog.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { IconComponent } from '../../shared/icon.component';
import { portrait, ROLES } from '@domain/catalog';
@Component({
  selector: 'luma-operation-room',
  standalone: true,
  imports: [UiLabelPipe, TranslatePipe, PlanComponent, FormsModule, IconComponent],
  templateUrl: './operation-room.component.html',
})
export class OperationRoomComponent {
  readonly room = inject(RoomService);
  readonly router = inject(Router);
  readonly render = renderMarkdown;
  renderRunMessage(text: string): string {
    return this.render(
      text.startsWith('Denied actions:') ? this.i18n.text('error.permissionDenied') : text,
    );
  }

  readonly toggle = (v: boolean) => !v;
  clock(at: string): string {
    return new Date(at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  readonly store = inject(WorkspaceStore);
  readonly execution = inject(ExecutionService);
  readonly dialogs = inject(DialogService);
  readonly i18n = inject(I18nService);
  readonly portrait = inject(PortraitService).source;
  readonly feed = viewChild<ElementRef<HTMLElement>>('feed');
  readonly working = signal(false);
  readonly width = this.room.width;
  readonly stream = computed(() => {
    if (
      !this.execution.interacting() ||
      !['plan', 'step', 'spawn', 'room'].includes(this.execution.currentKind())
    )
      return '';
    const text = this.execution
      .events()
      .filter((e) => e.type === 'text')
      .map((e) => e.text || '')
      .join('');
    return this.execution.currentKind() === 'plan' ? planningSpeech(text) : text;
  });
  message = '';
  agentId = '';
  constructor() {
    effect(() => {
      this.room.messages();
      this.stream();
      const feed = this.feed()?.nativeElement;
      if (feed && feed.scrollHeight - feed.scrollTop - feed.clientHeight < 160)
        queueMicrotask(() => (feed.scrollTop = feed.scrollHeight));
    });
  }
  tools() {
    return this.execution
      .events()
      .filter((e) => e.type === 'tool' || e.type === 'tool-result')
      .slice(-20);
  }
  format(value: unknown): string {
    return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  }
  roleLabel(id: string): string {
    const a = this.store.agent(id);
    return a?.specialty || (a ? ROLES[a.role]?.label : '') || '';
  }
  crewStatus(id: string): { tone: string; label: string } {
    const p = this.store.project(),
      f = this.store.feature(this.execution.currentFeature());
    if (
      id === p?.commanderId &&
      (this.execution.planning() ||
        (this.execution.plan() && this.execution.planOrigin() === 'execution'))
    )
      return {
        tone: 'plan',
        label: this.execution.planning()
          ? this.i18n.text('ui.preparing-the-plan')
          : this.i18n.text('ui.awaiting-approval-304'),
      };
    if (
      this.execution.busy() &&
      this.execution.busyAgents().includes(id) &&
      id !== this.execution.currentAgent()
    )
      return { tone: 'call', label: this.i18n.text('ui.answering-a-call') };
    if (this.execution.busy() && id === this.execution.currentAgent())
      return this.execution.paused()
        ? {
            tone: 'queue',
            label: this.execution.interacting()
              ? this.i18n.text('ui.pausing-after-the-stage')
              : 'pausado',
          }
        : { tone: 'baton', label: this.i18n.text('ui.holding-the-baton') };
    const i = f?.route.indexOf(id) ?? -1;
    if (f && i > f.step) return { tone: 'queue', label: this.i18n.text('ui.queued') };
    if (f && i >= 0 && i <= f.step) return { tone: 'done', label: 'entregou' };
    if (id === p?.commanderId && this.execution.busy())
      return { tone: 'plan', label: 'coordenando' };
    return { tone: 'idle', label: 'livre' };
  }
  status(): string {
    if (this.execution.planning()) return this.i18n.text('ui.commander-preparing-the-plan');
    if (this.execution.plan() && this.execution.planOrigin() === 'execution')
      return this.i18n.text('ui.plan-awaits-your-approval');
    if (!this.execution.busy())
      return this.room.messages().length
        ? this.i18n.text('ui.no-run-in-progress')
        : this.i18n.text('ui.no-runs-yet');
    if (this.execution.paused())
      return this.execution.interacting() ? this.i18n.text('ui.pausing-after-stage') : 'PAUSADA';
    const f = this.store.feature(this.execution.currentFeature()),
      a = this.store.agent(this.execution.currentAgent());
    return f && a
      ? f.key + ' / ETAPA ' + (f.step + 1) + ' DE ' + f.route.length + ' / ' + a.name
      : this.i18n.text('ui.selecting-the-next-feature');
  }
  async send(): Promise<void> {
    if (
      !this.message.trim() ||
      this.working() ||
      this.execution.busy() ||
      this.execution.planning() ||
      this.execution.interacting()
    )
      return;
    const text = this.message.trim();
    const mentioned = this.store
      .team()
      .find((a) => text.toLowerCase().includes('@' + a.name.toLowerCase()));
    const agent = mentioned || this.store.agent(this.agentId || this.store.project()!.commanderId);
    if (!agent) return;
    this.message = '';
    this.room.append(text, { role: 'user', kind: 'chat' });
    this.working.set(true);
    try {
      const context = this.room
        .messages()
        .slice(-30)
        .map((m) => (this.store.agent(m.agentId || '')?.name || m.role) + ': ' + m.text)
        .join('\n\n');
      const result = await this.execution.execute(
        agent,
        'room',
        `Participate in the operation room. Answer the user's latest request in context. Discuss progress, blockers and next actions. Do not edit files or mark deliveries complete.\n${context}`,
        undefined,
        true,
      );
      if (result.error) throw Error(result.text);
      this.room.append(result.text, {
        role: 'assistant',
        agentId: agent.id,
        kind: 'chat',
        runId: result.runId,
        simulated: result.simulated,
      });
    } catch (e) {
      this.store.report(e);
    } finally {
      this.working.set(false);
    }
  }
  export(): void {
    download('luma-hive-operation-chat.json', JSON.stringify(this.room.messages(), null, 2));
  }
  async clear(): Promise<void> {
    if (!this.execution.busy() && (await this.dialogs.ask(this.i18n.text('chat.clear'))))
      this.room.clear();
  }
  resetWidth(): void {
    this.width.set(380);
    this.store.change((w) => (w.settings.opsChat = 0));
  }
  resizeKey(e: KeyboardEvent): void {
    const values: Record<string, number> = {
      ArrowLeft: this.width() - 24,
      ArrowRight: this.width() + 24,
      Home: 300,
      End: innerWidth * 0.6,
    };
    if (values[e.key] != null) {
      e.preventDefault();
      this.width.set(Math.round(Math.max(300, Math.min(innerWidth * 0.6, values[e.key]))));
      this.store.change((w) => (w.settings.opsChat = this.width()));
    }
  }
  resize(e: PointerEvent): void {
    const start = e.clientX,
      w = this.width(),
      element = e.currentTarget as HTMLElement;
    element.setPointerCapture(e.pointerId);
    const move = (next: PointerEvent) =>
      this.width.set(Math.max(300, Math.min(innerWidth * 0.65, w + next.clientX - start)));
    const end = () => {
      this.store.change((w) => (w.settings.opsChat = this.width()));
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerup', end);
      element.removeEventListener('pointercancel', end);
    };
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerup', end);
    element.addEventListener('pointercancel', end);
  }
}

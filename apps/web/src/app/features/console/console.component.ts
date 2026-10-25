import { TranslatePipe } from '../../core/i18n/i18n.service';
import { FormsModule } from '@angular/forms';
import { Component, inject, signal, effect, ElementRef, viewChild } from '@angular/core';
import { ApiService } from '../../core/api/api.service';
import { WorkspaceStore } from '../../core/workspace/workspace.store';
import { ExecutionService } from '../../core/execution/execution.service';
import { DialogService, download } from '../../core/ui/dialog.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { IconComponent } from '../../shared/icon.component';
import { ModalComponent } from '../../shared/modal.component';
import { Run, RunEvent } from '@domain/models';
@Component({
  selector: 'luma-console',
  standalone: true,
  imports: [TranslatePipe, IconComponent, FormsModule, ModalComponent],
  templateUrl: './console.component.html',
})
export class ConsoleComponent {
  private readonly api = inject(ApiService);
  readonly store = inject(WorkspaceStore);
  readonly execution = inject(ExecutionService);
  readonly dialogs = inject(DialogService);
  readonly i18n = inject(I18nService);
  readonly logsOnly = this.dialogs.current()?.tab === 'logs';
  readonly logFilter = signal('');
  readonly showHistory = signal(false);
  readonly filters = [
    { key: '', label: 'Todos' },
    { key: 'agent', label: 'dashboard.agents' },
    { key: 'plan', label: 'Plano' },
    { key: 'handoff', label: 'Handoffs' },
    { key: 'review', label: 'ui.reviews' },
  ];
  clock(at: string): string {
    return new Date(at).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
  readonly lines = viewChild<ElementRef<HTMLElement>>('lines');
  readonly selectedRun = signal<Run | null>(null);
  logs() {
    return [...(this.store.project()?.logs || [])]
      .reverse()
      .filter((log) => !this.logFilter() || log.type === this.logFilter());
  }
  exportLogs(): void {
    download(
      'luma-hive-transmissions.json',
      JSON.stringify(this.store.project()?.logs || [], null, 2),
    );
  }
  readonly history = signal<Run[]>([]);
  readonly replay = signal<RunEvent[] | null>(null);
  constructor() {
    effect(() => {
      const id = this.execution.latestRunId();
      void this.refresh(id);
    });
    effect(() => {
      this.execution.events();
      this.replay();
      this.selectedRun();
      const element = this.lines()?.nativeElement;
      const stick =
        !element || element.scrollHeight - element.scrollTop - element.clientHeight < 100;
      if (stick)
        queueMicrotask(() => {
          const el = this.lines()?.nativeElement;
          if (el) el.scrollTop = el.scrollHeight;
        });
    });
  }
  private async refresh(preferred = ''): Promise<void> {
    try {
      const { runs } = await this.api.runs(this.store.project()?.id);
      this.history.set(runs);
      const eligible = this.sessionRuns();
      const current =
        eligible.find((r) => r.id === preferred) || (!this.selectedRun() ? eligible[0] : undefined);
      if (current && !this.showHistory()) await this.open(current.id);
    } catch (e) {
      this.store.report(e);
    }
  }
  sessionRuns(): Run[] {
    return this.history().filter(
      (r) =>
        this.execution.sessionRunIds().includes(r.id) &&
        ['plan', 'step', 'spawn', 'room'].includes(r.kind),
    );
  }
  displayStatus(): string {
    const result = this.visibleEvents().find((e) => e.type === 'result');
    return result
      ? result.error
        ? /cancel/i.test(result.text || '')
          ? 'CANCELLED'
          : 'FAILED'
        : 'DONE'
      : (this.selectedRun()?.status || 'running').toUpperCase();
  }
  sessionId(): string {
    return (
      this.visibleEvents().find((e) => e.type === 'init' && e.sessionId)?.sessionId ||
      this.visibleEvents().find((e) => e.type === 'result')?.sessionId ||
      this.selectedRun()?.result?.sessionId ||
      ''
    );
  }
  consoleLines(): RunEvent[] {
    const rows: RunEvent[] = [];
    for (const event of this.visibleEvents()) {
      const last = rows.at(-1);
      if (event.type === 'text' && last?.type === 'text')
        last.text = (last.text || '') + (event.text || '');
      else rows.push({ ...event });
    }
    return rows;
  }
  lineKind(event: RunEvent): string {
    if (event.error) return 'error';
    return (
      (
        { start: 'cmd', init: 'sys', result: 'ok', stderr: 'dim', 'tool-result': 'text' } as Record<
          string,
          string
        >
      )[event.type] || event.type
    );
  }
  lineText(event: RunEvent): string {
    if (event.type === 'start' && event.command) {
      const c = event.command;
      return (
        '$ ' +
        c.executable +
        ' ' +
        c.args.map((a) => (/\s/.test(a) ? JSON.stringify(a) : a)).join(' ') +
        '\n  cwd: ' +
        c.cwd +
        ' / pid ' +
        (c.pid || '?') +
        '\n  provedor: ' +
        (event.provider || event.text) +
        ' / modelo ' +
        (event.model || 'padrão') +
        ' / permissão ' +
        (event.permissionMode || 'padrão')
      );
    }
    if (event.type === 'init')
      return 'sessão ' + (event.sessionId || '?') + (event.model ? ' / modelo ' + event.model : '');
    if (event.type === 'result') {
      if (event.error) return 'FALHOU: ' + event.text;
      return (
        'CONCLUÍDO em ' +
        (event.durationMs ? Math.round(event.durationMs / 1000) + 's' : '?') +
        (event.usage
          ? ' / ' +
            (event.usage['input_tokens'] || 0) +
            ' tokens de entrada · ' +
            (event.usage['output_tokens'] || 0) +
            ' de saída'
          : ' / custo não informado')
      );
    }
    if (event.type === 'tool')
      return (event.name || '') + (event.input ? '  ' + this.format(event.input) : '');
    return event.text || event.name || this.format(event.input);
  }
  visibleEvents(): RunEvent[] {
    const selected = this.selectedRun();
    if (selected)
      return selected.id === this.execution.latestRunId()
        ? this.execution.events()
        : this.replay() || [];
    return this.sessionRuns().some((r) => r.id === this.execution.latestRunId())
      ? this.execution.events()
      : [];
  }
  format(value: unknown): string {
    return value ? JSON.stringify(value, null, 2) : '';
  }
  async open(id: string): Promise<void> {
    try {
      const result = await this.api.run(id);
      this.selectedRun.set(result.run);
      this.replay.set(result.events);
    } catch (e) {
      this.store.report(e);
    }
  }
}

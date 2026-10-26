import {
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
  OnDestroy,
  ElementRef,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import type {
  AgentTrace,
  ObservationSnapshot,
  ObservationFilters,
  RunTrace,
  TraceEntry,
  ConsumptionGroup,
} from '@domain/observability';
import { ApiService } from '../../core/api/api.service';
import { WorkspaceStore } from '../../core/workspace/workspace.store';
import { I18nService, TranslatePipe } from '../../core/i18n/i18n.service';
import { PortraitService } from '../../core/appearance/portrait.service';
import { DialogService, download } from '../../core/ui/dialog.service';
import { IconComponent } from '../../shared/icon.component';

@Component({
  standalone: true,
  imports: [FormsModule, TranslatePipe, IconComponent],
  templateUrl: './observability.component.html',
  styleUrl: './observability.component.css',
})
export class ObservabilityComponent implements OnDestroy {
  readonly store = inject(WorkspaceStore);
  readonly i18n = inject(I18nService);
  readonly portraits = inject(PortraitService);
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly dialogs = inject(DialogService);
  readonly snapshot = signal<ObservationSnapshot | null>(null);
  readonly trace = signal<RunTrace | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly selectedRun = signal(this.route.snapshot.queryParamMap.get('run') || '');
  readonly selectedAgent = signal('');
  readonly selectedEvent = signal<number | null>(null);
  readonly kind = signal('');
  readonly search = signal('');
  readonly tab = signal(
    this.route.snapshot.queryParamMap.get('tab') === 'consumption' ? 'consumption' : 'execution',
  );
  readonly group = signal<keyof ObservationSnapshot['groups']>('agent');
  readonly offset = signal(0);
  readonly filters = signal<ObservationFilters>({
    projectId: this.store.project()?.id || '',
    period: this.selectedRun() ? 'all' : 'month',
  });
  readonly following = signal(true);
  private readonly timelineElement = viewChild<ElementRef<HTMLElement>>('timelineElement');
  private request = 0;
  private selection = 0;
  private destroyed = false;
  private readonly timer = setInterval(() => {
    if (document.visibilityState === 'visible' && !this.loading()) void this.refresh();
  }, 4000);
  readonly filterKeys = ['sprintId', 'agentId', 'provider', 'model'] as const;
  readonly kinds = ['', 'text', 'tool', 'tool-result', 'agent', 'result', 'stderr', 'errors'];
  readonly axes = ['agent', 'feature', 'sprint', 'model', 'provider', 'subagent'] as const;
  constructor() {
    this.dialogs.close();
    this.route.queryParamMap.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe((params) => {
      const run = params.get('run') || '';
      this.tab.set(params.get('tab') === 'consumption' ? 'consumption' : 'execution');
      if (run && run !== this.selectedRun()) {
        this.selectedRun.set(run);
        this.filters.update((f) => ({ ...f, period: 'all' }));
        void this.openRun(run);
      }
    });
    effect(() => {
      this.filters();
      this.offset();
      void this.refresh();
    });
  }
  ngOnDestroy() {
    this.destroyed = true;
    this.request++;
    this.selection++;
    clearInterval(this.timer);
  }
  filter(key: keyof ObservationFilters, value: string) {
    this.selection++;
    this.selectedRun.set('');
    this.trace.set(null);
    this.selectedAgent.set('');
    this.selectedEvent.set(null);
    this.offset.set(0);
    this.filters.update((f) => ({
      ...f,
      [key]: value,
      ...(key === 'projectId' ? { sprintId: '', agentId: '', model: '' } : {}),
    }));
  }
  async refresh() {
    const generation = ++this.request;
    this.loading.set(true);
    try {
      const result = await this.api.observations(this.filters(), this.offset());
      if (this.destroyed || generation !== this.request) return;
      this.snapshot.set(result);
      this.error.set('');
      const id = this.selectedRun() || result.runs[0]?.id;
      if (id) await this.openRun(id, false);
      else {
        this.trace.set(null);
        this.selectedRun.set('');
      }
    } catch (e) {
      if (!this.destroyed && generation === this.request) this.error.set((e as Error).message);
    } finally {
      if (!this.destroyed && generation === this.request) this.loading.set(false);
    }
  }
  async openRun(id: string, reset = true) {
    const selection = ++this.selection;
    this.selectedRun.set(id);
    if (reset) {
      this.trace.set(null);
      this.selectedAgent.set('');
      this.selectedEvent.set(null);
      this.kind.set('');
      this.search.set('');
      this.following.set(true);
    }
    try {
      const trace = await this.api.runTrace(id);
      if (this.destroyed || selection !== this.selection || this.selectedRun() !== id) return;
      this.trace.set(trace);
      if (!trace.agents.some((a) => a.id === this.selectedAgent()))
        this.selectedAgent.set(trace.run.id);
      if (this.following())
        requestAnimationFrame(() => {
          const el = this.timelineElement()?.nativeElement;
          if (el) el.scrollTop = el.scrollHeight;
        });
    } catch (e) {
      if (selection === this.selection) this.error.set((e as Error).message);
    }
  }
  chooseAgent(id: string) {
    this.selectedAgent.set(id);
    this.selectedEvent.set(null);
  }
  readonly tree = computed(() => {
    const trace = this.trace();
    if (!trace) return [];
    const out: { agent: AgentTrace; depth: number }[] = [],
      seen = new Set<string>();
    const add = (id: string, depth: number) => {
      const a = trace.agents.find((a) => a.id === id);
      if (!a || seen.has(id)) return;
      seen.add(id);
      out.push({ agent: a, depth });
      for (const child of trace.agents.filter((a) => a.parentId === id)) add(child.id, depth + 1);
    };
    add(trace.run.id, 0);
    return out;
  });
  readonly selected = computed(
    () => this.trace()?.agents.find((a) => a.id === this.selectedAgent()) || null,
  );
  readonly entries = computed(() => {
    const trace = this.trace();
    if (!trace) return [];
    const allowed = new Set<string>();
    const include = (id: string) => {
      if (allowed.has(id)) return;
      allowed.add(id);
      trace.agents.filter((a) => a.parentId === id).forEach((a) => include(a.id));
    };
    include(this.selectedAgent() || trace.run.id);
    return trace.timeline.filter(
      (e) =>
        (allowed.has(e.agentTraceId) || allowed.has(e.delegationId || '')) &&
        (!this.kind() ||
          (this.kind() === 'errors'
            ? e.event.error || e.event.type === 'stderr'
            : e.event.type === this.kind())) &&
        (!this.search() ||
          (this.eventText(e) + ' ' + JSON.stringify(e.event.input || '') + ' ' + this.eventOwner(e))
            .toLocaleLowerCase()
            .includes(this.search().toLocaleLowerCase())),
    );
  });
  readonly detail = computed(
    () => this.trace()?.timeline.find((e) => e.event.seq === this.selectedEvent()) || null,
  );
  readonly groups = computed(() => this.snapshot()?.groups[this.group()] || []);
  label(value: string) {
    return value.startsWith('obs.') ? this.i18n.text(value) : value;
  }
  number(n: number | null | undefined) {
    return n === null || n === undefined
      ? '—'
      : new Intl.NumberFormat(this.i18n.locale()).format(n);
  }
  duration(ms: number | null | undefined) {
    if (ms === null || ms === undefined) return '—';
    if (ms < 1000)
      return (
        new Intl.NumberFormat(this.i18n.locale(), { maximumFractionDigits: 1 }).format(ms / 1000) +
        's'
      );
    const s = Math.floor(ms / 1000);
    return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
  }
  date(at: string) {
    return new Date(at).toLocaleString(this.i18n.locale(), {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
  eventText(entry: TraceEntry) {
    const e = entry.event;
    return (
      [e.name, e.text].filter(Boolean).join(' · ') ||
      (e.type === 'start' ? e.command?.args.join(' ') : '') ||
      e.type
    );
  }
  eventOwner(entry: TraceEntry) {
    return this.trace()?.agents.find((a) => a.id === entry.agentTraceId)?.name || '—';
  }
  details(entry: TraceEntry) {
    return JSON.stringify(entry.event, null, 2);
  }
  percent(row: ConsumptionGroup) {
    const max = Math.max(1, ...this.groups().map((g) => g.tokens.total || 0));
    return Math.max(0, (100 * (row.tokens.total || 0)) / max);
  }
  page(direction: number) {
    this.offset.update((v) => Math.max(0, v + direction * 50));
    this.selectedRun.set('');
    this.trace.set(null);
  }
  export() {
    const trace = this.trace();
    if (trace) download('luma-trace-' + trace.run.id + '.json', JSON.stringify(trace, null, 2));
  }
  retry() {
    void this.refresh();
  }
}

import { Router } from '@angular/router';
import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { UsagePeriod, UsageSnapshot, QuotaWindow } from '@domain/usage';
import { ApiService } from '../../core/api/api.service';
import { I18nService, TranslatePipe } from '../../core/i18n/i18n.service';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'luma-usage',
  standalone: true,
  imports: [IconComponent, TranslatePipe],
  templateUrl: './usage.component.html',
  styleUrl: './usage.component.css',
})
export class UsageComponent {
  private readonly router = inject(Router);
  observe(): void {
    this.closePreview();
    this.panel()?.nativeElement.close();
    this.opened.set(false);
    void this.router.navigate(['/observability'], { queryParams: { tab: 'consumption' } });
  }

  readonly i18n = inject(I18nService);
  private readonly api = inject(ApiService);
  private readonly panel = viewChild<ElementRef<HTMLDialogElement>>('panel');
  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly preview = viewChild<ElementRef<HTMLElement>>('preview');
  readonly previewOpened = signal(false);
  readonly opened = signal(false);
  readonly loading = signal(false);
  readonly error = signal(false);
  readonly snapshot = signal<UsageSnapshot | null>(null);
  readonly period = signal<UsagePeriod>('week');
  readonly total = computed(() => {
    const rows = this.snapshot()?.providers.map((p) => p.local[this.period()]) || [];
    return {
      tokens: rows.some((r) => r.totalTokens != null)
        ? rows.reduce((sum, r) => sum + (r.totalTokens || 0), 0)
        : null,
      runs: rows.reduce((sum, r) => sum + r.runs, 0),
      missing: rows.reduce((sum, r) => sum + r.unreportedRuns, 0),
    };
  });
  open(): void {
    if (this.preview()?.nativeElement.matches(':popover-open')) return;
    this.positionPreview();
    void this.refresh();
  }
  previewToggled(): void {
    const preview = this.preview()?.nativeElement,
      open = preview?.matches(':popover-open') || false;
    this.previewOpened.set(open);
    if (open) preview?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
  }
  closePreview(): void {
    this.preview()?.nativeElement.hidePopover();
  }
  openDetails(): void {
    this.closePreview();
    this.opened.set(true);
    this.panel()?.nativeElement.showModal();
  }
  @HostListener('window:resize') positionPreview(): void {
    const rect = this.trigger()?.nativeElement.getBoundingClientRect(),
      preview = this.preview()?.nativeElement;
    if (!rect || !preview) return;
    const width = Math.min(340, innerWidth - 24);
    preview.style.setProperty(
      '--preview-left',
      Math.max(12, Math.min(rect.right - width, innerWidth - width - 12)) + 'px',
    );
    preview.style.setProperty(
      '--preview-top',
      Math.max(12, Math.min(rect.bottom + 10, innerHeight - 150)) + 'px',
    );
  }
  compactTokens(value: number | null): string {
    return value == null
      ? '—'
      : new Intl.NumberFormat(this.i18n.locale(), {
          notation: 'compact',
          maximumFractionDigits: 1,
        }).format(value);
  }
  quotaGroups(windows: QuotaWindow[]): { name: string; windows: QuotaWindow[] }[] {
    const groups = new Map<string, QuotaWindow[]>();
    for (const w of windows) groups.set(w.group, [...(groups.get(w.group) || []), w]);
    return [...groups].map(([name, windows]) => ({
      name,
      windows: [...windows].sort(
        (a, b) => (a.durationMinutes ?? Infinity) - (b.durationMinutes ?? Infinity),
      ),
    }));
  }
  shortWindow(window: QuotaWindow): string {
    return window.period === 'week'
      ? '7d'
      : window.period === 'month'
        ? this.i18n.text('usage.month')
        : this.windowLabel(window);
  }
  close(): void {
    this.panel()?.nativeElement.close();
  }
  closed(): void {
    this.opened.set(false);
    this.trigger()?.nativeElement.focus();
  }
  backdrop(event: MouseEvent): void {
    if (event.target === this.panel()?.nativeElement) this.close();
  }
  async refresh(): Promise<void> {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set(false);
    try {
      // Local counts render first; account quota lookups can take a few seconds.
      this.snapshot.set(await this.api.usage());
      this.snapshot.set(await this.api.usage(true));
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }
  number(value: number | null): string {
    return value == null ? '—' : new Intl.NumberFormat(this.i18n.locale()).format(value);
  }
  percent(value: number | null): string {
    return value == null
      ? '—'
      : new Intl.NumberFormat(this.i18n.locale(), { maximumFractionDigits: 1 }).format(value) + '%';
  }
  date(value: string | null): string {
    return value ? this.i18n.date(value) : '—';
  }
  range(): string {
    const range = this.snapshot()?.periods[this.period()];
    const fmt = new Intl.DateTimeFormat(this.i18n.locale(), { day: '2-digit', month: 'short' });
    return range ? fmt.format(new Date(range.from)) + ' – ' + fmt.format(new Date(range.to)) : '';
  }
  windowLabel(window: QuotaWindow): string {
    if (window.period !== 'other') return this.i18n.text('usage.' + window.period);
    if (window.durationMinutes == null) return this.i18n.text('usage.otherWindow');
    const minutes = window.durationMinutes;
    return minutes % 60 === 0 ? minutes / 60 + ' h' : minutes + ' min';
  }
  weekly(windows: QuotaWindow[]): QuotaWindow[] {
    return windows.filter((w) => w.period === 'week');
  }
  monthly(windows: QuotaWindow[]): QuotaWindow[] {
    return windows.filter((w) => w.period === 'month');
  }
}

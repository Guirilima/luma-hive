import { AttentionTriggerComponent } from './features/workflow/attention.component';
import { AppearanceService } from './core/appearance/appearance.service';
import { UsageComponent } from './features/usage/usage.component';
import {
  Component,
  inject,
  signal,
  computed,
  HostListener,
  effect,
  afterEveryRender,
} from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WorkspaceStore } from './core/workspace/workspace.store';
import { ExecutionService } from './core/execution/execution.service';
import { ProviderService } from './core/providers/provider.service';
import { ApiService } from './core/api/api.service';
import { DialogService, download } from './core/ui/dialog.service';
import { DialogHostComponent } from './core/ui/dialog-host.component';
import { I18nService, TranslatePipe } from './core/i18n/i18n.service';
import { IconComponent } from './shared/icon.component';
import { OperationRoomComponent } from './features/operation-room/operation-room.component';
import { RoomService } from './core/execution/room.service';
import { MapComponent } from './features/map/map.component';
import { Locale, Provider, PROVIDERS } from '@domain/models';
@Component({
  selector: 'luma-root',
  host: { '[class.reduce-motion]': 'store.settings()?.motion === false' },
  standalone: true,
  imports: [
    UsageComponent,
    AttentionTriggerComponent,
    MapComponent,
    OperationRoomComponent,
    RouterOutlet,
    RouterLink,
    FormsModule,
    TranslatePipe,
    DialogHostComponent,
    IconComponent,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  pad(n: number): string {
    return String(n).padStart(2, '0');
  }
  readonly connectedProviders = computed(() =>
    PROVIDERS.filter((provider) => {
      const health = this.providers.health()[provider];
      return !!health?.version && !health.runtimeError;
    }),
  );
  connectorName(provider: Provider): string {
    return { codex: 'Codex', devin: 'Devin', antigravity: 'Antigravity' }[provider];
  }
  connectorShort(provider: Provider): string {
    return { codex: 'CDX', devin: 'DVN', antigravity: 'AGY' }[provider];
  }
  connectorTitle(provider: Provider): string {
    return (
      this.connectorName(provider) +
      ' CLI · ' +
      this.providers.health()[provider]?.version +
      ' · ' +
      this.i18n.text('connectors.detectedHint') +
      (this.activeProvider() === provider ? ' · ' + this.i18n.text('connectors.currentAgent') : '')
    );
  }
  cliVersion(): string {
    return (
      this.providers.health()[this.activeProvider()]?.version?.replace(/^codex-cli\s*/i, '') ||
      'VERIFICANDO'
    );
  }
  activeProvider() {
    return (
      this.store.agent(this.execution.currentAgent() || this.store.project()?.commanderId || '')
        ?.provider || 'codex'
    );
  }
  readonly appearance = inject(AppearanceService);
  readonly room = inject(RoomService);
  readonly doneFeature = (f: { status: string }) => f.status === 'done';
  readonly store = inject(WorkspaceStore);
  readonly execution = inject(ExecutionService);
  readonly providers = inject(ProviderService);
  readonly setupProviders = ['codex', 'devin', 'antigravity'] as const;
  readonly dialogs = inject(DialogService);
  readonly i18n = inject(I18nService);
  readonly router = inject(Router);
  private readonly api = inject(ApiService);
  operationName = '';
  navStep(direction: -1 | 1): void {
    if (this.dialogs.current()?.kind === 'squad') this.dialogs.close();
    const current = this.views.findIndex((v) => v.path === this.router.url.split('?')[0]);
    const next = (current + direction + this.views.length) % this.views.length;
    this.goView(this.views[next].path);
  }
  readonly progress = computed(() => {
    const features = this.store.project()?.features || [];
    return features.length
      ? Math.round((features.filter((f) => f.status === 'done').length / features.length) * 100)
      : 0;
  });
  readonly views = [
    { path: '/dashboard', key: 'nav.dashboard' },
    { path: '/projects', key: 'nav.projects' },
    { path: '/squad', key: 'nav.squad' },
    { path: '/handoffs', key: 'nav.handoffs' },
    { path: '/observability', key: 'nav.observability' },
    { path: '/recovery', key: 'recovery.title' },
    { path: '/memory', key: 'memory.nav' },
  ];
  private errorTimer: ReturnType<typeof setTimeout> | null = null;
  constructor() {
    let lastNav = '';
    afterEveryRender(() => {
      const path = this.router.url.split('?')[0];
      if (path === lastNav) return;
      const active = document.querySelector<HTMLElement>('.topbar .mode-nav a.active');
      if (!active) return;
      lastNav = path;
      active.scrollIntoView({ inline: 'nearest', block: 'nearest' });
    });
    effect(() =>
      document.body.classList.toggle('reduce-motion', this.store.settings()?.motion === false),
    );
    effect(() => {
      const error = this.store.error();
      if (this.errorTimer) clearTimeout(this.errorTimer);
      if (error && !this.store.conflict())
        this.errorTimer = setTimeout(() => {
          if (this.store.error() === error) this.store.error.set('');
        }, 5500);
    });
    void this.store.initialize().then(() => {
      void this.providers.all();
      if (this.store.workspace()) {
        void this.api.request('POST', '/api/config', {
          concurrency: this.store.settings()!.concurrency,
        });
        void this.execution.recover().catch((e) => this.store.report(e));
      }
    });
  }
  locale(locale: Locale): void {
    this.store.setLocale(locale);
  }
  readonly localBackup = computed(() => {
    try {
      const saved =
        localStorage.getItem('luma-workspace') ||
        localStorage.getItem('squad-workspace') ||
        localStorage.getItem('squad-code.network.v2');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  restoreLocal(): void {
    const copy = this.localBackup();
    if (copy) {
      void this.store.import(copy);
    }
  }
  testRuntimes(): void {
    void this.providers.all();
  }
  exportLocal(): void {
    download('luma-hive-local-copy.json', JSON.stringify(this.store.workspace(), null, 2));
  }
  async import(e: Event): Promise<void> {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      await this.store.import(JSON.parse(await file.text()));
      void this.providers.all();
    } catch (error) {
      this.store.report(error);
    }
  }
  navigate(event: MouseEvent, path: string): void {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    if (!this.store.workspace()) return;
    if (this.dialogs.current()?.kind === 'squad') this.dialogs.close();
    this.goView(path);
  }
  private goView(path: string): void {
    if (
      path === '/squad' &&
      this.store.workspace()!.projects.length > 1 &&
      !this.store.projectLocked()
    )
      this.dialogs.open('operation-picker');
    else void this.router.navigateByUrl(path);
  }
  guardNav(e: MouseEvent): void {
    if (!this.store.workspace()) e.preventDefault();
    if (this.dialogs.current()?.kind === 'squad') this.dialogs.close();
  }
  @HostListener('document:keydown', ['$event']) keys(e: KeyboardEvent): void {
    if (
      (e.target as HTMLElement).closest('input,textarea,select,[contenteditable]') ||
      e.ctrlKey ||
      e.metaKey ||
      e.altKey
    )
      return;
    if (
      document.querySelector('.sq-pop') &&
      (!this.dialogs.current() || this.dialogs.current()?.kind === 'squad')
    )
      return;
    if (e.key === 'Escape') {
      if (this.dialogs.current()?.kind === 'squad') return;
      this.dialogs.close();
      this.execution.cancelPlan();
      return;
    }
    if (this.dialogs.current() && this.dialogs.current()?.kind !== 'squad') return;
    const key = e.key.toLowerCase();
    if (key === 'a') {
      this.dialogs.open('agent');
      e.preventDefault();
    }
    if (key === 'b') {
      void this.router.navigateByUrl('/projects').then(() =>
        setTimeout(() => {
          document.getElementById('opsBriefing')?.scrollIntoView();
          document.getElementById('projectBriefing')?.focus();
        }, 50),
      );
      e.preventDefault();
    }
    if (key === 'f') {
      void this.router
        .navigateByUrl('/projects')
        .then(() => setTimeout(() => document.getElementById('opsFeatures')?.scrollIntoView(), 50));
      e.preventDefault();
    }
    if (key === 'g') this.dialogs.open('squad', this.store.project()?.squadId);
    if (key === 'l') this.dialogs.open('console', undefined, 'logs');
    if (key === 'c') this.dialogs.open('console');
    if (key === ' ' && !(e.target as HTMLElement).closest('button')) {
      e.preventDefault();
      this.execution.startCurrent();
    }
    if (key === '?') this.dialogs.open('help');
    if (key === 'q' || key === 'e') {
      if (this.dialogs.current()?.kind === 'squad') this.dialogs.close();
      const current = this.views.findIndex((v) => v.path === this.router.url.split('?')[0]),
        next = (current + (key === 'q' ? -1 : 1) + this.views.length) % this.views.length;
      this.goView(this.views[next].path);
      e.preventDefault();
    }
  }
  @HostListener('window:resize') alignNavigation(): void {
    requestAnimationFrame(() =>
      document
        .querySelector<HTMLElement>('.topbar .mode-nav a.active')
        ?.scrollIntoView({ inline: 'nearest', block: 'nearest' }),
    );
  }
  @HostListener('window:beforeunload', ['$event']) unload(e: BeforeUnloadEvent): void {
    if (this.store.pending() || (this.execution.busy() && !this.execution.workflow.current())) {
      e.preventDefault();
      e.returnValue = '';
    }
  }
}

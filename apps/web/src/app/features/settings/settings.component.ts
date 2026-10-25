import { Router } from '@angular/router';
import { ROLES } from '@domain/catalog';
import { resolveAgentSelection } from '@domain/model-selection';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { createWorkspace } from '@domain/workspace';
import { IconComponent } from '../../shared/icon.component';
import { Settings, Provider, PROVIDERS, Locale } from '@domain/models';
import { WorkspaceStore } from '../../core/workspace/workspace.store';
import { ApiService } from '../../core/api/api.service';
import { ProviderService } from '../../core/providers/provider.service';
import { ExecutionService } from '../../core/execution/execution.service';
import { DialogService, download } from '../../core/ui/dialog.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { ModalComponent } from '../../shared/modal.component';
@Component({
  selector: 'luma-settings',
  standalone: true,
  imports: [IconComponent, FormsModule, ModalComponent],
  templateUrl: './settings.component.html',
})
export class SettingsComponent {
  readonly store = inject(WorkspaceStore);
  private readonly router = inject(Router);
  readonly providers = inject(ProviderService);
  readonly execution = inject(ExecutionService);
  readonly dialogs = inject(DialogService);
  readonly i18n = inject(I18nService);
  private readonly api = inject(ApiService);
  readonly tabs = ['workspace', 'execution', ...PROVIDERS, 'config'];
  readonly providerKeys = PROVIDERS;
  readonly efforts = ['low', 'medium', 'high', 'xhigh', 'max', 'ultra'];
  readonly toggles = [
    {
      key: 'motion',
      title: 'Movimento e transmissões',
      description:
        'Animações de interface, marcadores ativos e pacotes nas rotas. Respeita a preferência de movimento reduzido do sistema.',
      aria: 'Ativar movimento',
    },
    {
      key: 'quality',
      title: 'Gráficos da cidade em alta qualidade',
      description:
        'Sombras suaves, oclusão de ambiente e brilho na cidade hexagonal. Desligue em computadores mais lentos; em quadros lentos a qualidade também cai sozinha.',
      aria: 'Gráficos da cidade em alta qualidade',
    },
    {
      key: 'cityShape',
      title: 'Cidade em modo planeta',
      description:
        'A cidade hexagonal vira um planeta 3D: arraste para girar o planeta e ver os agentes do outro lado. Precisa de WebGL.',
      aria: 'Cidade em modo planeta',
    },
  ];
  tabLabel(key: string): string {
    return (
      (
        { workspace: 'WORKSPACE', execution: 'EXECUÇÃO', config: 'CONFIGURAÇÃO CODEX' } as Record<
          string,
          string
        >
      )[key] || key.toUpperCase() + ' CLI'
    );
  }
  permissionLabel(key: string): string {
    return (
      (
        {
          'workspace-write': 'Permitir alterações na pasta do projeto',
          'read-only': 'Somente leitura',
          'accept-edits': 'Aceitar edições',
          plan: 'Planejar sem editar',
        } as Record<string, string>
      )[key] || key
    );
  }
  providerDescription(provider: Provider): string {
    return provider === 'codex'
      ? 'Cada etapa roda codex exec --json com as instruções do agente e a tarefa enviadas por stdin. O Codex CLI usa sua autenticação local. As execuções consomem os limites da sua conta ou créditos de API. Não há teto de custo em USD por etapa.'
      : provider === 'devin'
        ? 'Cada etapa de um agente Devin roda devin -p --prompt-file … na pasta da operação, com o modelo do perfil do agente e a permissão acima. O Devin CLI usa sua autenticação local; o app não altera suas credenciais. Colegas da squad viram subagentes em projects/<operação>/.devin/agents/. O Devin CLI não oferece níveis de esforço nem limite de custo por etapa nesta integração.'
        : 'Cada etapa roda agy.exe com saída JSON na pasta da operação. A autenticação e as regras de aprovação locais do Antigravity são respeitadas. Colegas usam perfis em .agents/agents/. Tempo limite e simultaneidade vêm da aba Execução.';
  }
  toggleValue(key: string): boolean {
    return key === 'motion'
      ? this.draft.motion
      : key === 'quality'
        ? this.draft.quality === 'high'
        : this.draft.cityShape === 'planet';
  }
  toggleSetting(key: string): void {
    if (key === 'motion') this.draft.motion = !this.draft.motion;
    else if (key === 'quality') this.draft.quality = this.draft.quality === 'high' ? 'low' : 'high';
    else this.draft.cityShape = this.draft.cityShape === 'planet' ? 'flat' : 'planet';
    this.store.change((w) => {
      w.settings.motion = this.draft.motion;
      w.settings.quality = this.draft.quality;
      w.settings.cityShape = this.draft.cityShape;
    });
  }
  setLocale(locale: Locale): void {
    this.draft.locale = locale;
    this.store.setLocale(locale);
  }
  async reset(): Promise<void> {
    if (
      await this.dialogs.ask(
        'Remover as alterações deste workspace e restaurar o exemplo Atlas Commerce?',
        'REINICIAR WORKSPACE',
        'Reiniciar',
        true,
      )
    ) {
      await this.store.import(createWorkspace('Atlas Commerce', true));
      this.dialogs.close();
      await this.router.navigateByUrl('/squad');
      this.dialogs.mapHomeRequested.update((n) => n + 1);
    }
  }

  readonly tab = signal(this.dialogs.current()?.tab || 'workspace');
  draft: Settings = structuredClone(this.store.settings()!);
  directories = this.draft.addDirs.join(', ');
  readonly snapshots = signal<{ id: string; createdAt: string; label: string }[]>([]);
  readonly permissions = {
    codex: ['workspace-write', 'read-only'],
    devin: ['auto', 'accept-edits', 'smart', 'dangerous', 'read-only', 'plan'],
    antigravity: ['accept-edits', 'read-only', 'plan'],
  };
  constructor() {
    void this.versions();
  }
  previewAgent = this.store.project()?.commanderId || '';
  previewShell = 'powershell';
  roleShort(role: string): string {
    return ROLES[role]?.short || role;
  }
  commandPreview(cli: Provider): string {
    const a = this.store.agent(this.previewAgent) || this.store.team()[0];
    if (!a) return '# Nenhum agente no squad.';
    const cfg = this.draft.providers[cli],
      selection = resolveAgentSelection(
        { ...a, provider: cli },
        this.draft,
        this.providers.catalogs()[cli] || [],
      ),
      ps = this.previewShell === 'powershell',
      join = ps ? String.fromCharCode(96) : '\\',
      quote = (v: string) =>
        "'" + v.replaceAll("'", ps ? "''" : String.fromCharCode(39, 34, 39, 34, 39)) + "'",
      base = this.providers.health()[cli]?.projectsDir || 'projects',
      dir = (base.replace(/[\\/]+$/, '') + '/' + this.store.project()?.folder).replaceAll(
        '\\',
        '/',
      ),
      file = './prompt-da-etapa.md',
      exe = cfg.path || { codex: 'codex', devin: 'devin', antigravity: 'agy' }[cli];
    const args: string[] = [];
    if (cli === 'codex') {
      args.push(
        '-a never',
        'exec',
        '--json',
        '--color never',
        '--sandbox ' +
          (cfg.permission === 'read-only' ||
          !a.tools.some((t) => ['Edit', 'Write', 'Bash', 'NotebookEdit'].includes(t))
            ? 'read-only'
            : 'workspace-write'),
        '--cd ' + quote(dir),
        '-c ' + quote('project_root_markers=[".git"]'),
      );
      if (selection.model) args.push('--model ' + quote(selection.model));
      if (selection.effort)
        args.push('-c ' + quote('model_reasoning_effort=' + JSON.stringify(selection.effort)));
      for (const dir of this.directories
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean))
        args.push('--add-dir ' + quote(dir));
      args.push('-');
    } else if (cli === 'devin') {
      args.push(
        '-p',
        '--respect-workspace-trust=false',
        '--permission-mode ' +
          (['read-only', 'plan'].includes(cfg.permission) ? 'auto' : cfg.permission),
      );
      if (selection.model) args.push('--model ' + quote(selection.model));
      args.push('--prompt-file ' + quote(file));
    } else {
      args.push(
        '--input-format stream-json',
        '--output-format stream-json',
        '--agent luma-main-<run-id>',
        '--mode ' + (cfg.permission === 'plan' ? 'plan' : 'accept-edits'),
        '--print-timeout ' + this.draft.timeoutSec + 's',
      );
      if (selection.model) args.push('--model ' + quote(selection.model));
      if (selection.effort) args.push('--effort ' + selection.effort);
    }
    const preface =
      '# ' +
      a.name +
      ' / ' +
      this.roleShort(a.role) +
      ' / ' +
      cli.toUpperCase() +
      ' / limite ' +
      this.draft.timeoutSec +
      's\ncd ' +
      quote(dir) +
      '\n';
    const stdin =
      cli === 'codex'
        ? ps
          ? 'Get-Content ' + quote(file) + ' -Raw | '
          : 'cat ' + quote(file) + ' | '
        : '';
    return (
      preface +
      stdin +
      (ps ? '& ' : '') +
      quote(exe) +
      ' ' +
      join +
      '\n  ' +
      args.join(' ' + join + '\n  ')
    );
  }
  async copyCommand(cli: Provider): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.commandPreview(cli));
      this.dialogs.notify('Comando copiado.');
    } catch {
      this.dialogs.notify('Selecione o texto da prévia para copiar.');
    }
  }
  provider(): Provider {
    return (PROVIDERS.includes(this.tab() as Provider) ? this.tab() : 'codex') as Provider;
  }
  previewLocale(locale: Locale): void {
    this.i18n.set(locale);
  }
  modelChanged(): void {
    const config = this.draft.providers[this.provider()];
    if (!this.providers.efforts(this.provider(), config.model).includes(config.effort))
      config.effort = '';
  }
  customModel(): boolean {
    const config = this.draft.providers[this.provider()];
    return (
      !!config.model &&
      !(this.providers.catalogs()[this.provider()] || []).some((m) => m.id === config.model)
    );
  }
  check(): void {
    void this.providers.check(this.provider(), this.draft.providers[this.provider()].path);
  }
  async versions(): Promise<void> {
    try {
      const result = await this.api.snapshots();
      this.snapshots.set(result.snapshots);
    } catch (e) {
      this.store.report(e);
    }
  }
  async save(): Promise<void> {
    if (this.execution.busy()) return;
    this.draft.addDirs = this.directories
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (
      this.store.change((w) => {
        w.settings = this.draft;
      })
    ) {
      this.i18n.set(this.draft.locale);
      try {
        await this.api.request('POST', '/api/config', { concurrency: this.draft.concurrency });
        await this.store.flush();
        // Keep the saved provider tab open, as in the reference application.
      } catch (e) {
        this.store.report(e);
      }
    }
  }
  cancel(): void {
    this.i18n.set(this.store.settings()!.locale);
    this.dialogs.close();
  }
  export(): void {
    download('luma-hive-workspace.json', JSON.stringify(this.store.workspace(), null, 2));
  }
  async import(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || this.execution.busy()) return;
    try {
      const data = JSON.parse(await file.text());
      if (
        !(await this.dialogs.ask(
          'Substituir os dados atuais pelo workspace importado? A versão atual fica nas versões salvas.',
          'RESTAURAR WORKSPACE',
          'Restaurar backup',
        ))
      )
        return;
      await this.store.import(data);
      this.dialogs.close();
    } catch (e) {
      this.store.report(e);
    }
  }
  async restore(id: string): Promise<void> {
    if (await this.dialogs.ask(this.i18n.text('settings.restoreConfirm'))) {
      try {
        await this.store.restore(id);
        this.dialogs.close();
      } catch (e) {
        this.store.report(e);
      }
    }
  }
}

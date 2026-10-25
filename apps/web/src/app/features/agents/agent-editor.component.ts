import ui from '@domain/interface-catalog.json';
import { ConventionPickerComponent } from './convention-picker.component';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { agentExport } from '@domain/exports';
import { Agent, TOOLS, Provider, Squad, uuid, timestamp } from '@domain/models';
import {
  ROLES,
  PRESETS,
  PORTRAITS,
  ICONS,
  CONVENTION_FAMILIES,
  CONVENTION_SUBSETS,
  makeAgent,
  conventionFamily,
  defaultConventions,
  portrait,
} from '@domain/catalog';
import { WorkspaceStore } from '../../core/workspace/workspace.store';
import { ProviderService } from '../../core/providers/provider.service';
import { ExecutionService } from '../../core/execution/execution.service';
import { DialogService, download } from '../../core/ui/dialog.service';
import { TranslatePipe, I18nService } from '../../core/i18n/i18n.service';
import { renderMarkdown } from '../../shared/markdown';
import { ModalComponent } from '../../shared/modal.component';
import { IconComponent } from '../../shared/icon.component';
import { OFFICE_SLOTS, officeSlot } from '../map/renderers/office-layout';
@Component({
  selector: 'luma-agent-editor',
  standalone: true,
  imports: [ConventionPickerComponent, FormsModule, TranslatePipe, ModalComponent, IconComponent],
  templateUrl: './agent-editor.component.html',
})
export class AgentEditorComponent {
  readonly store = inject(WorkspaceStore);
  readonly providers = inject(ProviderService);
  readonly execution = inject(ExecutionService);
  readonly dialogs = inject(DialogService);
  readonly i18n = inject(I18nService);
  private previousRole = '';
  private conventionUndo: { base: string; template: string } | null = null;
  readonly render = renderMarkdown;
  readonly existing = this.store.agent(this.dialogs.current()?.id || '');
  draft: Agent = structuredClone(
    this.existing || makeAgent(this.dialogs.current()?.data?.recruitRole || 'backend'),
  );
  hellos = this.draft.hellos.join('\n');
  readonly tab = signal(this.dialogs.current()?.tab || 'identity');
  readonly rolesInfo = ROLES;
  readonly isNew = signal(!this.existing);
  readonly look = signal<'photo' | 'icon' | null>(null);
  readonly subsetPicker = signal(false);
  readonly toggle = (v: boolean) => !v;
  subsetQuery = '';
  templateName = '';
  readonly panes = [
    { key: 'identity', label: 'IDENTIDADE' },
    { key: 'instructions', label: 'INSTRUÇÕES' },
    { key: 'tools', label: 'FERRAMENTAS' },
    { key: 'advanced', label: 'DIRETRIZES' },
    { key: 'squads', label: 'SQUADS' },
  ];
  readonly efforts = ['', 'low', 'medium', 'high', 'xhigh', 'max', 'ultra'] as const;
  readonly toolInfo: Record<string, string> = {
    Read: 'Leitura de arquivos',
    Glob: 'Busca por arquivos',
    Grep: 'Busca por conteúdo',
    Edit: 'Edição de arquivos',
    Write: 'Criação de arquivos',
    Bash: 'Comandos de terminal',
    WebFetch: 'Buscar páginas web',
    WebSearch: 'Pesquisa na web',
    NotebookEdit: 'Editar notebooks',
  };
  helloLines(): string[] {
    return this.hellos.split('\n');
  }
  setHello(i: number, text: string): void {
    const lines = this.helloLines();
    lines[i] = text;
    this.hellos = lines.join('\n');
  }
  addHello(): void {
    if (this.helloLines().length < 8) this.hellos += '\n';
  }
  removeHello(i: number): void {
    this.hellos = this.helloLines()
      .filter((_, n) => n !== i)
      .join('\n');
  }
  autoPortrait(): string {
    return portrait({ ...this.draft, image: '' });
  }
  resetPrompt(): void {
    this.draft.prompt = makeAgent(this.draft.role, this.draft.name).prompt;
  }
  familyLabel(): string {
    return (
      (CONVENTION_FAMILIES as Record<string, { label: string }>)[
        this.draft.conventions.family
      ]?.label.toUpperCase() || ''
    );
  }
  memberships(): Squad[] {
    return this.store.workspace()?.squads.filter((s) => s.agentIds.includes(this.draft.id)) || [];
  }
  membership(q: Squad): string {
    return q.commanderId === this.draft.id
      ? 'Comandante'
      : q.adrId === this.draft.id
        ? 'Reconhecedor ADR'
        : q.prdId === this.draft.id
          ? 'Reconhecedor PRD'
          : 'Operador';
  }
  matchingSubsets() {
    const list = [
      ...this.subsets,
      ...(this.store
        .workspace()
        ?.conventionLibrary.subsets.map((s) => ({ ...s, key: 'lib:' + s.id })) || []),
    ];
    return list.filter((s) =>
      (s.name + ' ' + s.content).toLowerCase().includes(this.subsetQuery.toLowerCase()),
    );
  }
  close(): void {
    if (this.look()) this.look.set(null);
    else this.dialogs.close();
  }
  duplicate(): void {
    const source = this.store.agent(this.draft.id);
    if (!source) return;
    const draft = structuredClone(source);
    draft.id = uuid('agent');
    let n = 2;
    while (
      this.store
        .agents()
        .some((a) => a.name === source.name.slice(0, 26) + '-' + String(n).padStart(2, '0'))
    )
      n++;
    draft.name = source.name.slice(0, 26) + '-' + String(n).padStart(2, '0');
    draft.template = '';
    draft.desk = '';
    draft.image = source.image || portrait(source);
    if (this.store.saveAgent(draft)) {
      if (source.role !== 'commander')
        this.store.change((w) => {
          const list = w.squads.filter((q) => q.agentIds.includes(source.id));
          for (const q of list.length ? list : w.squads.filter((q) => q.id === w.projectId)) {
            q.operatorIds.push(draft.id);
            q.agentIds.push(draft.id);
            for (const p of w.projects.filter((p) => p.squadId === q.id))
              p.agentIds = [...q.agentIds];
          }
        });
      this.dialogs.open('agent', draft.id);
    }
  }

  deskRoom(): string {
    const code = officeSlot(this.draft.desk)?.room;
    return (
      (
        {
          CMD: 'SALA DE COMANDO',
          REC: 'RECONHECIMENTO',
          A: 'OPEN SPACE A',
          B: 'OPEN SPACE B',
          C: 'OPEN SPACE C',
          LAB: 'LAB',
          R: 'SALA DE REUNIÃO',
        } as Record<string, string>
      )[code || ''] || ''
    );
  }
  readonly roles = Object.keys(ROLES);
  readonly tools = TOOLS;
  readonly stages = ['discovery', 'identity', 'prompt', 'validation', 'ready'];
  readonly desks = OFFICE_SLOTS.filter(
    (s) =>
      !this.store.team().some((a) => a.id !== this.draft.id && officeSlot(a.desk)?.id === s.id),
  );
  readonly families = Object.keys(CONVENTION_FAMILIES);
  readonly subsets = CONVENTION_SUBSETS;
  readonly photos = Object.entries(PORTRAITS);
  photoLabel(key: string): string {
    return this.rolesInfo[key]?.label || (ui.portraitLabels as Record<string, string>)[key] || key;
  }
  photoShort(key: string): string {
    return this.rolesInfo[key]?.short || this.photoLabel(key);
  }
  readonly icons = ui.icons;
  readonly iconLabels = ui.labels as Record<string, string>;
  readonly generalIcons = ui.icons.filter((k) => !ui.tech.includes(k));
  readonly techIcons = ui.icons.filter((k) => ui.tech.includes(k));
  usedSubsets(): string[] {
    return this.draft.conventions.subsets.map((s) => s.source || 'custom');
  }
  closeSubsetPicker(): void {
    this.subsetPicker.set(false);
    setTimeout(() => document.querySelector<HTMLElement>('.conv-sub-head button')?.focus(), 0);
  }
  pickSubset(src: string): void {
    this.subsetPicker.set(false);
    setTimeout(
      () =>
        document
          .querySelector<HTMLElement>(
            '.conv-subset:last-child textarea,.conv-subset:last-child input',
          )
          ?.focus(),
      0,
    );
    if (src === 'custom') {
      this.draft.conventions.subsets.push({
        id: uuid('conv'),
        name: 'Subset',
        content: '',
        source: 'custom',
      });
      return;
    }
    this.addSubset(src.replace(/^builtin:/, ''));
  }
  readonly portrait = portrait;
  constructor() {
    if (!this.existing) {
      this.draft.productionStage = 'discovery';
      this.draft.name = '';
      this.draft.template = '';
    }
    this.previousRole = this.draft.role;
    const target = this.dialogs.current()?.data?.target;
    if (!this.existing && target) {
      if (target.desk) this.draft.desk = target.desk;
      if (target.hex) this.draft.hex = target.hex;
    }

    void this.providers.check(this.draft.provider);
  }
  syncConventions(): void {
    const family = conventionFamily(this.draft);
    if (family === this.draft.conventions.family) return;
    const untouched =
      !this.draft.conventions.base.trim() ||
      Object.values(CONVENTION_FAMILIES).some((f) =>
        f.templates.some((t) => t.content === this.draft.conventions.base),
      );
    if (untouched) this.draft.conventions = defaultConventions(this.draft);
    else this.draft.conventions.family = family;
  }
  roleChanged(): void {
    const previous = makeAgent(this.previousRole, this.draft.name),
      next = makeAgent(this.draft.role, this.draft.name);
    for (const key of ['description', 'prompt'] as const)
      if (this.draft[key] === previous[key]) this.draft[key] = next[key];
    if (this.draft.conventions.base === previous.conventions.base)
      this.draft.conventions = next.conventions;
    this.previousRole = this.draft.role;
    this.syncConventions();
  }
  rollName(): void {
    const names = PRESETS.filter(
      (p) =>
        p.role === this.draft.role &&
        !this.store.agents().some((a) => a.id !== this.draft.id && a.name === p.name),
    ).map((p) => p.name);
    this.draft.name =
      names[Math.floor(Math.random() * names.length)] ||
      this.draft.name + ' ' + Math.floor(10 + Math.random() * 89);
  }
  finalConventions(): string {
    return [
      this.draft.conventions.base,
      ...this.draft.conventions.subsets.map((s) => '## ' + s.name + '\n' + s.content),
    ].join('\n\n');
  }
  undoConventions(): void {
    if (this.conventionUndo) {
      this.draft.conventions.base = this.conventionUndo.base;
      this.draft.conventions.template = this.conventionUndo.template;
      this.conventionUndo = null;
    }
  }
  canUndoConventions(): boolean {
    return !!this.conventionUndo;
  }
  deleteTemplate(): void {
    const key = this.draft.conventions.template;
    if (!key.startsWith('lib:')) return;
    this.store.change((w) => {
      w.conventionLibrary.templates = w.conventionLibrary.templates.filter(
        (t) => t.id !== key.slice(4),
      );
    });
    this.dialogs.notify('Template excluído da biblioteca. O texto do agente foi preservado.');
  }
  deleteLibrarySubset(id: string): void {
    this.store.change((w) => {
      w.conventionLibrary.subsets = w.conventionLibrary.subsets.filter((s) => s.id !== id);
    });
    this.dialogs.notify('Subset excluído da biblioteca. Os agentes que usam esse texto não mudam.');
  }
  templateSelection(): string {
    const selected = this.templates().find((t) => t.key === this.draft.conventions.template);
    return selected && selected.content === this.draft.conventions.base ? selected.key : '__custom';
  }
  selectTemplate(key: string): void {
    if (key === '__custom') return;
    this.draft.conventions.template = key;
    this.chooseTemplate();
  }
  providerChanged(provider: Provider): void {
    this.draft.model = 'inherit';
    this.draft.effort = '';
    void this.providers.check(provider);
  }
  modelChanged(): void {
    if (!this.providers.efforts(this.draft.provider, this.draft.model).includes(this.draft.effort))
      this.draft.effort = '';
  }
  customModel(): boolean {
    return (
      this.draft.model !== 'inherit' &&
      !(this.providers.catalogs()[this.draft.provider] || []).some((m) => m.id === this.draft.model)
    );
  }
  toggleTool(tool: string): void {
    this.draft.tools = this.draft.tools.includes(tool)
      ? this.draft.tools.filter((t) => t !== tool)
      : [...this.draft.tools, tool];
  }
  templates(): { key: string; name: string; content: string }[] {
    return [
      ...((
        CONVENTION_FAMILIES as Record<
          string,
          { templates: { key: string; name: string; content: string }[] }
        >
      )[this.draft.conventions.family]?.templates || []),
      ...(this.store
        .workspace()
        ?.conventionLibrary.templates.filter((t) => t.family === this.draft.conventions.family)
        .map((t) => ({ key: 'lib:' + t.id, name: t.name, content: t.content })) || []),
    ];
  }
  chooseFamily(): void {
    this.draft.conventions.template = this.templates()[0]?.key || '';
    this.chooseTemplate();
  }
  chooseTemplate(): void {
    this.conventionUndo = {
      base: this.draft.conventions.base,
      template: this.draft.conventions.template,
    };
    this.draft.conventions.base =
      this.templates().find((t) => t.key === this.draft.conventions.template)?.content || '';
  }
  addSubset(key: string): void {
    if (this.draft.conventions.subsets.length >= 20) {
      this.store.error.set('Limite de 20 subsets por agente.');
      return;
    }
    const subset = key.startsWith('lib:')
      ? this.store.workspace()?.conventionLibrary.subsets.find((s) => s.id === key.slice(4))
      : this.subsets.find((s) => s.key === key);
    if (subset && !this.draft.conventions.subsets.some((s) => s.id === key))
      this.draft.conventions.subsets.push({
        id: key,
        name: subset.name,
        content: subset.content,
        source: key.startsWith('lib:') ? key : 'builtin:' + key,
      });
  }
  saveTemplate(): void {
    if (!this.draft.conventions.base.trim()) return;
    const name = this.templateName.trim() || 'Guia de ' + (this.draft.name || 'AGENTE');
    if (this.store.workspace()!.conventionLibrary.templates.length >= 60) {
      this.store.error.set('Limite de 60 templates na biblioteca.');
      return;
    }
    const entry = {
      id: uuid('template'),
      name,
      family: this.draft.conventions.family,
      content: this.draft.conventions.base,
      createdAt: timestamp(),
    };
    this.store.change((w) => {
      w.conventionLibrary.templates.push(entry);
    });
    this.draft.conventions.template = 'lib:' + entry.id;
    this.templateName = '';
    this.dialogs.notify('Template salvo na biblioteca.');
  }
  saveSubset(index: number): void {
    const subset = this.draft.conventions.subsets[index];
    if (!subset) return;
    if (!subset.name.trim() || !subset.content.trim()) {
      this.store.error.set('Preencha o nome e o conteúdo do subset.');
      return;
    }
    this.store.change((w) => {
      w.conventionLibrary.subsets.push({
        id: uuid('subset'),
        name: subset.name,
        content: subset.content,
        createdAt: timestamp(),
      });
    });
  }
  async upload(e: Event): Promise<void> {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file || file.size > 600000) return;
    this.draft.image = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  canReset(): boolean {
    return [...PRESETS, ...Object.entries(ROLES).map(([role, r]) => ({ role, name: r.name }))].some(
      (p) => p.name === this.draft.template || p.name === this.draft.name,
    );
  }
  reset(): void {
    const preset = PRESETS.find((p) => p.name === this.draft.template);
    const fresh = makeAgent(
      preset?.role || this.draft.role,
      this.draft.template || ROLES[this.draft.role]?.name,
    );
    this.draft = {
      ...fresh,
      name: this.draft.template ? fresh.name : this.draft.name,
      provider: this.draft.provider,
      id: this.draft.id,
      productionStage: this.draft.productionStage,
      linkId: this.draft.linkId,
      nextId: this.draft.nextId,
      desk: this.draft.desk,
      hex: this.draft.hex,
    };
    this.hellos = this.draft.hellos.join('\n');
  }
  save(): void {
    if (this.execution.busy()) return;
    const held = this.memberships().filter((q) =>
      q.commanderId === this.draft.id
        ? this.draft.role !== 'commander'
        : q.adrId === this.draft.id
          ? this.draft.role !== 'architect'
          : q.prdId === this.draft.id
            ? this.draft.role !== 'po'
            : this.draft.role === 'commander',
    );
    if (held.length) {
      this.store.error.set(
        'Troque o agente dessa posição no Squad Studio antes de mudar a especialidade.',
      );
      this.tab.set('identity');
      return;
    }
    if (
      this.store
        .agents()
        .some(
          (a) =>
            a.id !== this.draft.id && a.name.toUpperCase() === this.draft.name.trim().toUpperCase(),
        )
    ) {
      this.store.error.set('Esse codinome já está em uso.');
      return;
    }
    if (this.draft.role === 'custom' && !this.draft.specialty.trim()) {
      this.store.error.set('Informe o título da especialidade.');
      return;
    }
    if (!this.draft.name.trim() || !this.draft.prompt.trim()) {
      this.store.error.set(this.i18n.text('error.required'));
      return;
    }
    let id = this.draft.linkId;
    const visited = new Set([this.draft.id]);
    while (id) {
      if (visited.has(id)) {
        this.store.error.set('Agent reporting cycle');
        return;
      }
      visited.add(id);
      id = this.store.agent(id)?.linkId || '';
    }
    this.draft.hellos = this.hellos.split('\n').filter(Boolean).slice(0, 10);
    this.draft.name = this.draft.name.trim().toUpperCase();
    if (
      this.store.saveAgent(
        this.draft,
        this.dialogs.current()?.data?.target ? this.store.project()?.squadId : undefined,
      )
    ) {
      const slot = this.dialogs.current()?.data?.squadSlot;
      if (slot) this.dialogs.recruited.set({ id: this.draft.id, squadId: slot.squadId });
      this.store.selectedId.set(this.draft.id);
      this.dialogs.notify('Agente salvo.');
      this.dialogs.close();
    }
  }
  async remove(): Promise<void> {
    const held = this.memberships().filter((q) =>
      [q.commanderId, q.adrId, q.prdId].includes(this.draft.id),
    );
    if (held.length) {
      this.store.error.set(
        this.draft.name +
          ' ocupa uma posição de comando ou reconhecimento. Troque essa posição no Squad Studio antes de excluir.',
      );
      return;
    }
    if (
      await this.dialogs.ask(
        this.i18n.text('agent.deleteConfirm'),
        'EXCLUIR AGENTE',
        'Excluir agente',
        true,
      )
    ) {
      this.store.deleteAgent(this.draft.id);
      this.dialogs.close();
    }
  }
  exportAgent(): void {
    const file = agentExport(this.draft);
    download(file.name, file.data, 'text/plain;charset=utf-8');
  }
}

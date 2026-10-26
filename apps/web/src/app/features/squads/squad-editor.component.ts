import { UiLabelPipe } from '../../core/i18n/i18n.service';
import { PortraitService } from '../../core/appearance/portrait.service';
import catalog from '@domain/catalog.json';
import { Component, inject, signal, HostListener, effect, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Squad, Agent, uuid, timestamp } from '@domain/models';
import { portrait, makeAgent, PRESETS, CATEGORIES, ROLES } from '@domain/catalog';
import { squadMembers } from '@domain/workspace';
import { WorkspaceStore } from '../../core/workspace/workspace.store';
import { DialogService } from '../../core/ui/dialog.service';
import { ExecutionService } from '../../core/execution/execution.service';
import { TranslatePipe, I18nService } from '../../core/i18n/i18n.service';
import { IconComponent } from '../../shared/icon.component';
import { SquadCardComponent } from '../projects/project-form.component';
@Component({
  selector: 'luma-squad-editor',
  standalone: true,
  imports: [UiLabelPipe, SquadCardComponent, IconComponent, FormsModule, TranslatePipe],
  templateUrl: './squad-editor.component.html',
})
export class SquadEditorComponent implements OnDestroy {
  private pickClick: { key: string; at: number; timer: ReturnType<typeof setTimeout> } | null =
    null;
  private clearPickClick(): void {
    if (this.pickClick) clearTimeout(this.pickClick.timer);
    this.pickClick = null;
  }
  private pointerPick(key: string, select: () => void, confirm: () => void): void {
    if (this.pickClick?.key === key && performance.now() - this.pickClick.at < 400) {
      this.clearPickClick();
      select();
      confirm();
      return;
    }
    this.clearPickClick();
    this.pickClick = {
      key,
      at: performance.now(),
      timer: setTimeout(() => {
        this.pickClick = null;
        if (this.pick()) select();
      }, 230),
    };
  }
  clickChoice(item: Agent): void {
    this.pointerPick(
      item.id,
      () => this.cursor.set(item.id),
      () => this.choose(item),
    );
  }
  clickCategory(key: string): void {
    this.pointerPick(
      'category:' + key,
      () => this.categoryCursor.set(key),
      () => this.setCategory(key),
    );
  }
  closePick(): void {
    this.clearPickClick();
    this.pick.set(null);
  }
  ngOnDestroy(): void {
    this.clearPickClick();
  }
  readonly store = inject(WorkspaceStore);
  readonly roles = ROLES;
  readonly Math = Math;
  readonly categoryCursor = signal('');
  pad(n: number): string {
    return String(n).padStart(2, '0');
  }
  operations() {
    return this.store.workspace()?.projects.filter((p) => p.squadId === this.draft.id) || [];
  }
  dirty(): boolean {
    const q = this.existing;
    return (
      !q ||
      JSON.stringify([
        q.name,
        q.commanderId,
        q.adrId,
        q.prdId,
        q.specialistIds || [],
        q.operatorIds,
      ]) !==
        JSON.stringify([
          this.draft.name,
          this.draft.commanderId,
          this.draft.adrId,
          this.draft.prdId,
          this.draft.specialistIds || [],
          this.draft.operatorIds,
        ])
    );
  }
  allDraftMembers(): Agent[] {
    const ids = [
      this.draft.commanderId,
      this.draft.adrId,
      this.draft.prdId,
      ...(this.draft.specialistIds || []),
      ...this.draft.operatorIds,
    ].filter(Boolean);
    return [...new Set(ids)].map((id) => this.agent(id)).filter((a): a is Agent => !!a);
  }
  qaCount(): number {
    return this.allDraftMembers().filter((a) => a.role === 'qa').length;
  }
  docsCount(): number {
    return this.allDraftMembers().filter((a) => a.role === 'docs').length;
  }
  recommendationMet(): boolean {
    return this.qaCount() >= 1 && this.docsCount() >= 1;
  }
  recommendationText(): string {
    const q = this.qaCount();
    const d = this.docsCount();
    if (q >= 1 && d >= 1) return this.i18n.text('squad.recommendationMet');
    if (q === 0 && d === 0) return this.i18n.text('squad.missingBoth');
    if (q === 0) return this.i18n.text('squad.missingQa');
    return this.i18n.text('squad.missingDocs');
  }
  recommendationTooltip(): string {
    return `${this.i18n.text('squad.recommendedComposition')}: ${this.i18n.text('squad.coverageQa')} ${this.qaCount()}/1, ${this.i18n.text('squad.coverageDocs')} ${this.docsCount()}/1 — ${this.recommendationText()}`;
  }
  missing(): string[] {
    const out = [];
    if (!this.draft.name.trim()) out.push('nome');
    if (!this.draft.commanderId) out.push('comandante');
    if (!this.draft.adrId) out.push('ADR');
    if (!this.draft.prdId) out.push('PRD');
    if (!this.draft.operatorIds.length) out.push('operador');
    return out;
  }
  cancelNew(): void {
    this.dialogs.pendingOperation.set('');
    const q = this.store.workspace()?.squads[0];
    if (q) this.selectSquad(q.id);
  }
  categoryMode(): boolean {
    return this.pick()?.slot === 'op' && !this.category;
  }
  selectedCategory() {
    return this.categories.find((c) => c.key === this.categoryCursor()) || this.categories[0];
  }
  categoryIcon(key: string): string {
    return CATEGORIES.find((c) => c.key === key)?.icon || 'sparkle';
  }
  categoryChips(key: string): string[] {
    return (CATEGORIES.find((c) => c.key === key)?.presets || []).map((p, i) =>
      i === 0
        ? this.i18n.text('ui.generalist')
        : ('specialty' in p ? p.specialty : '') || ROLES[p.role].label,
    );
  }
  categoryCount(key: string): number {
    const c = CATEGORIES.find((c) => c.key === key);
    return c
      ? c.presets.length +
          this.store
            .agents()
            .filter(
              (a) =>
                c.roles.includes(a.role) &&
                !this.taken(a.id) &&
                !c.presets.some((p) => p.name === a.name),
            ).length
      : 0;
  }
  currentPickId(): string {
    const p = this.pick();
    if (!p) return '';
    if (p.slot === 'commander') return this.draft.commanderId;
    if (p.slot === 'adr') return this.draft.adrId;
    if (p.slot === 'prd') return this.draft.prdId;
    if (p.slot === 'specialist') return (this.draft.specialistIds || [])[p.index] || '';
    return this.draft.operatorIds[p.index] || '';
  }
  currentCategory(): string {
    const role = this.agent(this.currentPickId())?.role;
    if (!role) return '';
    return CATEGORIES.find((c) => c.roles.includes(role))?.key || '';
  }
  setCategory(key: string): void {
    this.category = key;
    if (this.currentCategory() === key && this.currentPickId()) {
      this.cursor.set(this.currentPickId());
    } else {
      this.cursor.set(this.choices()[0]?.id || '');
    }
  }
  backCategory(): void {
    this.clearPickClick();
    this.categoryCursor.set(this.category);
    this.category = '';
    this.cursor.set('');
  }
  choiceTag(): string {
    const a = this.choice();
    if (!a || a.id === '__custom__') return this.i18n.text('shell.new-agent');
    const generalist = CATEGORIES.find((c) => c.key === this.category)?.presets[0]?.name === a.name;
    return (
      (generalist ? 'GENERALISTA · ' : '') +
      (this.taken(a.id)
        ? this.i18n.text('ui.already-in-this-squad')
        : this.store.agent(a.id)
          ? this.i18n.text('ui.in-workspace')
          : 'PRÉ-PRONTO')
    );
  }
  choiceRole(): string {
    const a = this.choice(),
      category = CATEGORIES.find((c) => c.key === this.category);
    if (!a) return '';
    if (a.id === '__custom__')
      return category ? category.label + ' / novo agente' : this.pickerTitle();
    if (category?.presets[0]?.name === a.name) return 'GENERALISTA / ' + ROLES[a.role].label;
    return ROLES[a.role].label + (a.specialty ? ' / ' + a.specialty : '');
  }
  conventionLabel(): string {
    const c = this.choice()?.conventions;
    if (!c) return '';
    const family = (
      catalog.conventionFamilies as Record<
        string,
        { templates: { key: string; name: string; content: string }[] }
      >
    )[c.family];
    const template = c.template.startsWith('lib:')
      ? this.store
          .workspace()
          ?.conventionLibrary.templates.find((t) => 'lib:' + t.id === c.template)
      : family?.templates.find((t) => t.key === c.template);
    const name = template
      ? template.name + (template.content !== c.base ? ' (editado)' : '')
      : c.base.trim()
        ? 'Personalizado'
        : this.i18n.text('ui.no-guide');
    return (
      name +
      (c.subsets.length
        ? ' + ' + c.subsets.length + ' subset' + (c.subsets.length > 1 ? 's' : '')
        : '')
    );
  }
  confirmLabel(): string {
    const item = this.choice();
    return this.categoryMode()
      ? this.i18n.text('ui.view-agents')
      : item?.id === '__custom__'
        ? this.i18n.text('ui.create-custom')
        : item && this.taken(item.id)
          ? this.i18n.text('ui.already-in-squad')
          : item?.id === this.currentPickId()
            ? this.i18n.text('squad.keepAgent')
            : this.i18n.text('squad.chooseAgent');
  }
  pickerTitle(): string {
    const p = this.pick();
    return p?.slot === 'op'
      ? (p.index < 0 ? this.i18n.text('ui.new-operator') : 'OPERADOR') +
          ' / ' +
          (CATEGORIES.find((c) => c.key === this.category)?.label.toUpperCase() || 'ESPECIALIDADE')
      : p?.slot === 'specialist'
        ? this.i18n.text(p.index < 0 ? 'squad.newArchitect' : 'squad.specialistArchitect')
        : p?.slot === 'commander'
          ? 'COMANDANTE'
          : p?.slot === 'adr'
            ? this.i18n.text('ui.adr-analyst')
            : this.i18n.text('ui.prd-analyst');
  }
  categoryDescription(): string {
    const c = this.selectedCategory();
    const chips = this.categoryChips(c.key);
    return c.description + (chips.length ? ' Opções: ' + chips.join(', ') + '.' : '');
  }
  pickerIndex(): number {
    if (this.categoryMode()) {
      return Math.max(
        0,
        this.categories.findIndex((c) => c.key === this.selectedCategory()?.key),
      );
    }
    const current = this.choice();
    return Math.max(
      0,
      this.choices().findIndex((a) => a.id === current?.id),
    );
  }
  stripTransform(): string {
    const step = this.categoryMode() ? 180 : 102,
      width = this.categoryMode() ? 85 : 46;
    return `translateX(-${this.pickerIndex() * step + width}px)`;
  }
  moveCursor(dir: number): void {
    this.clearPickClick();
    if (this.categoryMode()) {
      const list = this.categories;
      this.categoryCursor.set(list[(this.pickerIndex() + dir + list.length) % list.length].key);
    } else {
      const list = this.choices();
      const next = list[(this.pickerIndex() + dir + list.length) % list.length];
      this.cursor.set(next?.id || '');
    }
  }
  confirmPick(): void {
    if (this.categoryMode()) {
      this.setCategory(this.selectedCategory()?.key || '');
    } else {
      const item = this.choice();
      if (item) this.choose(item);
    }
  }
  readonly router = inject(Router);
  readonly dialogs = inject(DialogService);
  readonly execution = inject(ExecutionService);
  readonly i18n = inject(I18nService);
  get existing(): Squad | undefined {
    return this.store.workspace()?.squads.find((s) => s.id === this.draft?.id);
  }
  private newAgents: Agent[] = [];
  readonly pick = signal<{
    slot: 'commander' | 'adr' | 'prd' | 'specialist' | 'op';
    index: number;
  } | null>(null);
  readonly cursor = signal('');
  get categories() {
    return CATEGORIES.filter(
      (c) =>
        c.presets.length ||
        this.store
          .agents()
          .some(
            (a) =>
              c.roles.includes(a.role) &&
              !this.taken(a.id) &&
              !c.presets.some((p) => p.name === a.name),
          ),
    );
  }
  readonly photos = signal(this.store.settings()?.squadNodes === 'photo');
  query = '';
  category = '';
  draft: Squad = structuredClone(
    this.store
      .workspace()
      ?.squads.find(
        (s) =>
          s.id ===
          (this.dialogs.current()?.id ||
            (this.dialogs.pendingOperation() || this.dialogs.current()?.tab === 'new'
              ? '__new__'
              : this.store.project()?.squadId)),
      ) || {
      id: uuid('squad'),
      name: '',
      commanderId: '',
      adrId: '',
      prdId: '',
      operatorIds: [],
      agentIds: [],
      createdAt: timestamp(),
    },
  );
  readonly portrait = inject(PortraitService).source;
  readonly presets = PRESETS;
  readonly presetAgents = PRESETS.map((p) => makeAgent(p.role, p.name));
  constructor() {
    effect(() => {
      const result = this.dialogs.recruited();
      if (result && result.squadId === this.draft.id) {
        const a = this.store.agent(result.id);
        if (a) this.choose(a);
        this.dialogs.recruited.set(null);
      }
    });
  }
  openDetails(): void {
    const item = this.choice();
    if (!item || item.id === '__custom__' || this.store.projectLocked()) return;
    let agent = this.store.agent(item.id) || this.store.agents().find((a) => a.name === item.name);
    if (!agent) {
      if (!this.store.saveAgent(item)) return;
      agent = this.store.agent(item.id);
      this.newAgents = this.newAgents.filter((a) => a.id !== item.id);
    }
    if (agent) this.dialogs.open('agent', agent.id, 'instructions');
  }
  openCustom(): void {
    const position = this.pick();
    if (!position) return;
    const category = this.categories.find((c) => c.key === this.category),
      role =
        position.slot === 'commander'
          ? 'commander'
          : position.slot === 'adr'
            ? 'architect'
            : position.slot === 'prd'
              ? 'po'
              : category?.roles.find((r) => r !== 'architect') || 'backend';
    this.dialogs.open('agent', undefined, undefined, undefined, {
      recruitRole: role,
      squadSlot: { squadId: this.draft.id, slot: position.slot, index: position.index },
    });
  }
  roleAgents(role: string) {
    return this.store.agents().filter((a) => a.role === role);
  }
  operators() {
    return this.store.agents().filter((a) => a.role !== 'commander');
  }
  toggle(id: string): void {
    this.draft.operatorIds = this.draft.operatorIds.includes(id)
      ? this.draft.operatorIds.filter((a) => a !== id)
      : [...this.draft.operatorIds, id];
  }
  agent(id: string): Agent | undefined {
    return (
      this.store.agent(id) ||
      this.newAgents.find((a) => a.id === id) ||
      this.presetAgents.find((a) => a.id === id) ||
      this.store.agents().find((a) => a.name === id)
    );
  }
  slotAgent(slot: string): Agent | undefined {
    return this.agent(slot === 'adr' ? this.draft.adrId : this.draft.prdId);
  }
  complete(): boolean {
    return (
      this.agent(this.draft.commanderId)?.role === 'commander' &&
      this.agent(this.draft.adrId)?.role === 'architect' &&
      this.agent(this.draft.prdId)?.role === 'po' &&
      this.draft.operatorIds.length > 0
    );
  }
  togglePhotos(): void {
    this.photos.set(!this.photos());
    this.store.change((w) => {
      w.settings.squadNodes = this.photos() ? 'photo' : 'icon';
    });
  }
  selectSquad(id: string): void {
    this.clearPickClick();
    const squad = this.store.workspace()?.squads.find((s) => s.id === id);
    if (squad) {
      this.draft = structuredClone(squad);
      this.newAgents = [];
      this.closePick();
    }
  }
  newSquad(): void {
    this.clearPickClick();
    if (this.store.projectLocked() || this.store.workspace()!.squads.length >= 30) return;
    this.draft = {
      id: uuid('squad'),
      name: '',
      commanderId: '',
      adrId: '',
      prdId: '',
      operatorIds: [],
      agentIds: [],
      createdAt: timestamp(),
    };
    this.newAgents = [];
    this.closePick();
  }
  openPick(slot: 'commander' | 'adr' | 'prd' | 'specialist' | 'op', index = -1): void {
    this.clearPickClick();
    this.pick.set({ slot, index });
    this.query = '';
    const currentId = this.currentPickId();
    const currentAgent = this.agent(currentId);
    if (currentAgent) {
      const cat = this.currentCategory();
      this.category = cat;
      this.categoryCursor.set(cat || this.categories[0]?.key || '');
      this.cursor.set(currentAgent.id);
    } else {
      this.category = '';
      this.categoryCursor.set(this.categories[0]?.key || '');
      this.cursor.set('');
    }
    setTimeout(() => document.querySelector<HTMLElement>('.sq-strip')?.focus(), 0);
  }
  taken(id: string): boolean {
    const position = this.pick();
    const current =
      position?.slot === 'op'
        ? this.draft.operatorIds[position.index]
        : position?.slot === 'commander'
          ? this.draft.commanderId
          : position?.slot === 'adr'
            ? this.draft.adrId
            : position?.slot === 'prd'
              ? this.draft.prdId
              : position?.slot === 'specialist'
                ? (this.draft.specialistIds || [])[position.index]
                : '';
    return (
      id !== current &&
      [
        this.draft.commanderId,
        this.draft.adrId,
        this.draft.prdId,
        ...(this.draft.specialistIds || []),
        ...this.draft.operatorIds,
      ].includes(id)
    );
  }
  choices(): Agent[] {
    const position = this.pick();
    if (!position) return [];
    const role =
      position.slot === 'commander'
        ? 'commander'
        : position.slot === 'adr' || position.slot === 'specialist'
          ? 'architect'
          : position.slot === 'prd'
            ? 'po'
            : '';
    const pool = [...this.store.agents(), ...this.newAgents];
    const definition =
      position.slot === 'op'
        ? CATEGORIES.find((c) => c.key === this.category)?.presets || []
        : position.slot === 'specialist'
          ? CATEGORIES.find((c) => c.key === 'architecture')?.presets || catalog.presets.adr
          : catalog.presets[position.slot];
    const names = new Set(definition.map((p) => p.name));
    const fits = (a: Agent) =>
      (role ? a.role === role : a.role !== 'commander') &&
      (!this.category || CATEGORIES.find((c) => c.key === this.category)?.roles.includes(a.role));
    const choices: Agent[] = [];
    const currentA = this.agent(this.currentPickId());
    if (currentA && fits(currentA)) {
      choices.push(currentA);
    }
    definition.forEach((preset, index) => {
      const a =
        pool.find((a) => a.name === preset.name) ||
        this.presetAgents.find((a) => a.name === preset.name);
      if (a && fits(a) && (!this.taken(a.id) || (position.slot === 'op' && index === 0))) {
        if (!choices.some((c) => c.id === a.id)) {
          choices.push(a);
        }
      }
    });
    choices.push(
      ...pool.filter(
        (a) =>
          !names.has(a.name) && fits(a) && !this.taken(a.id) && !choices.some((c) => c.id === a.id),
      ),
    );
    return [
      ...choices,
      {
        ...makeAgent(role || 'backend'),
        id: '__custom__',
        name: 'CUSTOMIZADO',
        icon: 'sparkle',
        description: this.i18n.text('ui.create-an-agent-from-scratch-in-the-studio-codename-spe'),
        prompt: '',
        specialty: this.i18n.text('shell.new-agent'),
      },
    ];
  }
  choice(): Agent | undefined {
    const list = this.choices();
    const cur = this.cursor();
    return list.find((a) => a.id === cur) || list.find((a) => a.name === cur) || list[0];
  }
  choose(item: Agent): void {
    this.clearPickClick();
    if (item.id === '__custom__') {
      this.openCustom();
      return;
    }
    const position = this.pick();
    if (!position || this.taken(item.id) || this.store.projectLocked()) return;
    let agent =
      this.store.agents().find((a) => a.id === item.id) ||
      this.store.agents().find((a) => a.name === item.name) ||
      this.newAgents.find((a) => a.id === item.id) ||
      this.newAgents.find((a) => a.name === item.name);
    if (!agent) {
      agent = item;
      this.newAgents.push(agent);
    }
    if (position.slot === 'commander') this.draft.commanderId = agent.id;
    else if (position.slot === 'adr') this.draft.adrId = agent.id;
    else if (position.slot === 'prd') this.draft.prdId = agent.id;
    else if (position.slot === 'specialist') {
      if (!this.draft.specialistIds) this.draft.specialistIds = [];
      if (position.index >= 0) this.draft.specialistIds[position.index] = agent.id;
      else this.draft.specialistIds.push(agent.id);
    } else if (position.index >= 0) this.draft.operatorIds[position.index] = agent.id;
    else this.draft.operatorIds.push(agent.id);
    this.draft.operatorIds = [...new Set(this.draft.operatorIds)].filter(
      (id) =>
        ![
          this.draft.commanderId,
          this.draft.adrId,
          this.draft.prdId,
          ...(this.draft.specialistIds || []),
        ].includes(id),
    );
    if (this.draft.specialistIds) {
      this.draft.specialistIds = [...new Set(this.draft.specialistIds)].filter(
        (id) => ![this.draft.commanderId, this.draft.adrId, this.draft.prdId].includes(id),
      );
    }
    this.closePick();
  }
  removePosition(position: { slot: string; index: number }): void {
    if (position.slot === 'specialist' && position.index >= 0 && this.draft.specialistIds) {
      this.draft.specialistIds.splice(position.index, 1);
    } else if (position.slot === 'op' && position.index >= 0) {
      this.draft.operatorIds.splice(position.index, 1);
    }
    this.closePick();
  }
  @HostListener('document:keydown', ['$event']) pickerDocumentKeys(event: KeyboardEvent): void {
    if (
      this.pick() &&
      this.dialogs.current()?.kind !== 'agent' &&
      !event.defaultPrevented &&
      !(event.target as HTMLElement).closest('input,textarea,select')
    )
      this.pickKeys(event);
  }
  pickKeys(event: KeyboardEvent): void {
    if (this.dialogs.current()?.kind === 'agent') return;
    if (event.key === 'Escape') {
      event.stopPropagation();
      event.preventDefault();
      this.closePick();
      return;
    }
    if (event.key === 'Backspace' && this.pick()?.slot === 'op' && this.category) {
      event.preventDefault();
      event.stopPropagation();
      this.backCategory();
      return;
    }
    if (event.key === 'Enter' && (event.target as HTMLElement).closest('button:not(.sq-item)'))
      return;
    if (['ArrowLeft', 'ArrowRight', 'Enter'].includes(event.key)) {
      event.preventDefault();
      event.stopPropagation();
      if (event.key === 'Enter') this.confirmPick();
      else this.moveCursor(event.key === 'ArrowLeft' ? -1 : 1);
    }
  }

  used(): boolean {
    return !!this.store.workspace()?.projects.some((p) => p.squadId === this.draft.id);
  }
  save(): void {
    if (!this.draft.name.trim() || !this.complete()) {
      this.store.error.set(this.i18n.text('error.required'));
      return;
    }
    if (
      this.store
        .workspace()
        ?.squads.some(
          (q) =>
            q.id !== this.draft.id && q.name.toUpperCase() === this.draft.name.trim().toUpperCase(),
        )
    ) {
      this.store.error.set(this.i18n.text('ui.a-squad-with-this-name-already-exists'));
      return;
    }
    this.draft.name = this.draft.name.toUpperCase();
    this.draft.agentIds = squadMembers(this.draft);
    const operation = this.dialogs.pendingOperation();
    if (
      operation &&
      (!this.draft.commanderId ||
        !this.draft.adrId ||
        !this.draft.prdId ||
        !this.draft.operatorIds.length)
    ) {
      this.store.error.set(
        this.i18n.text('ui.complete-commander-adr-prd-and-at-least-one-operator'),
      );
      return;
    }
    if (this.store.saveSquad(this.draft, this.newAgents)) {
      if (operation) {
        const p = this.store.newProject(operation, this.draft.id);
        if (!this.store.saveProject(p)) return;
        void this.router.navigateByUrl('/projects');
        this.dialogs.close();
      }
    }
  }
  async remove(): Promise<void> {
    if (this.used()) {
      this.store.error.set(
        this.i18n.text('ui.this-squad-is-used-by-an-operation-assign-another-squad'),
      );
      return;
    }
    if (
      !(await this.dialogs.ask(
        this.i18n.text('squad.deleteConfirm'),
        this.i18n.text('ui.delete-squad'),
        this.i18n.text('ui.delete-squad-387'),
        true,
      ))
    )
      return;
    this.store.change((w) => {
      w.squads = w.squads.filter((s) => s.id !== this.draft.id);
    });
    const next = this.store.workspace()?.squads[0];
    if (next) this.selectSquad(next.id);
    else this.newSquad();
  }
}

import { I18nService } from '../../core/i18n/i18n.service';
import { UiLabelPipe } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/i18n.service';
import { PortraitService } from '../../core/appearance/portrait.service';
import { Component, input, output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Agent, Project, Squad, uuid, timestamp, RunAndValidateInstructions } from '@domain/models';
import { portrait } from '@domain/catalog';
import { WorkspaceStore } from '../../core/workspace/workspace.store';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'luma-squad-card',
  standalone: true,
  imports: [TranslatePipe, IconComponent],
  host: { style: 'display:contents' },
  template: `
    <span class="squad-card-top">
      <i class="sq-chip lead"><luma-icon name="crown" /></i>
      <span class="grow">
        <strong>{{ squad().name }}</strong>
        <small>
          <luma-icon name="crown" />
          {{ store.agent(squad().commanderId)?.name || ('ui.no-commander' | t) }}
        </small>
      </span>
    </span>
    <span class="sq-chain">
      <i class="sq-chip adr"><luma-icon [name]="store.agent(squad().adrId)?.icon || 'layers'" /></i>
      <i class="sq-chip prd"><luma-icon [name]="store.agent(squad().prdId)?.icon || 'file'" /></i>
      <span class="sq-chain-sep"></span>
      @for (id of squad().operatorIds.slice(0, 6); track id) {
        <i class="sq-chip"><luma-icon [name]="store.agent(id)?.icon || 'code'" /></i>
      }
      @if (squad().operatorIds.length > 6) {
        <em>+{{ squad().operatorIds.length - 6 }}</em>
      }
    </span>
    <span class="squad-card-meta">
      1 CMD · 2 REC · {{ squad().operatorIds.length }} OPS · {{ operations() }}
      {{ operations() === 1 ? ('ui.operation-expr-99' | t) : ('dashboard.operations-161' | t) }}
    </span>
  `,
})
export class SquadCardComponent {
  readonly squad = input.required<Squad>();
  readonly store = inject(WorkspaceStore);
  operations(): number {
    return (
      this.store.workspace()?.projects.filter((p) => p.squadId === this.squad().id).length || 0
    );
  }
}

@Component({
  selector: 'luma-teams-cta',
  standalone: true,
  imports: [TranslatePipe, IconComponent],
  host: { style: 'display:contents' },
  template: `
    <button
      type="button"
      class="at-cta"
      (click)="opened.emit()"
      [title]="'projects.online-squad-meeting-to-co-write-documents' | t"
    >
      <span class="at-cta-faces">
        @for (a of members(); track a.id) {
          <img [src]="portrait(a)" alt="" />
        }
      </span>
      <span>
        <b>
          <luma-icon name="video" />
          Agent Teams
        </b>
        <small>{{ 'ui.kickoff-with' | t }} {{ memberNames() }}</small>
      </span>
    </button>
  `,
})
export class TeamsCtaComponent {
  readonly i18n = inject(I18nService);
  memberNames(): string {
    return new Intl.ListFormat(this.i18n.locale(), { style: 'long', type: 'conjunction' }).format(
      this.members().map((a) => a.name),
    );
  }
  readonly squadId = input('');
  readonly opened = output<void>();
  readonly store = inject(WorkspaceStore);
  readonly portrait = inject(PortraitService).source;
  readonly name = (a: Agent) => a.name;
  members(): Agent[] {
    const q = this.store.workspace()?.squads.find((q) => q.id === this.squadId());
    return [q?.commanderId, q?.prdId, q?.adrId]
      .map((id) => this.store.agent(id || ''))
      .filter((a): a is Agent => !!a);
  }
}

@Component({
  selector: 'luma-project-form',
  standalone: true,
  imports: [UiLabelPipe, TranslatePipe, FormsModule, IconComponent, SquadCardComponent],
  host: { style: 'display:contents' },
  template: `
    <div class="form-grid">
      <div class="field full">
        <label for="projectName">{{ 'projects.project-name' | t }}</label>
        <input
          id="projectName"
          name="name"
          [(ngModel)]="draft().name"
          [ngModelOptions]="standalone"
          maxlength="70"
          [placeholder]="'projects.e-g-atlas-commerce' | t"
        />
      </div>
      <div class="field full" data-doc-row="briefing">
        <div class="doc-label-row">
          <label for="projectBriefing">{{ 'projects.project-briefing' | t }}</label>
          <button
            type="button"
            class="ops-doc-agent group"
            (click)="meeting.emit('briefing')"
            [title]="'projects.co-write-the-briefing-in-agent-teams' | t"
          >
            @for (a of members(); track a.id) {
              <img [src]="portrait(a)" [alt]="a.name" />
            }
          </button>
        </div>
        <textarea
          id="projectBriefing"
          name="briefing"
          [(ngModel)]="draft().briefing"
          [ngModelOptions]="standalone"
          maxlength="20000"
          style="min-height:150px"
          [placeholder]="'projects.goal-users-scope-constraints-and-definition-of-done' | t"
        ></textarea>
      </div>
      <div class="field full">
        <span class="label">{{ 'projects.operation-squad' | t }}</span>
        <div class="squad-pick-grid">
          @for (q of store.workspace()?.squads; track q.id) {
            <label class="squad-pick" [class.incomplete]="!store.squadComplete(q)">
              <input
                type="radio"
                name="squadId"
                [value]="q.id"
                [checked]="draft().squadId === q.id"
                [disabled]="!store.squadComplete(q)"
                (change)="choose(q)"
              />
              <span class="squad-card"><luma-squad-card [squad]="q" /></span>
            </label>
          }
        </div>
        <span class="hint">
          {{ 'projects.required-the-operation-uses-the-entire-squad-commander-ana' | t }}
        </span>
      </div>
      <div class="field full">
        <span class="label">{{ 'projects.project-documentation' | t }}</span>
        <span class="hint">
          {{ 'documents.goes-to' | t }}
          <code>docs/project/</code>
          {{ 'common.and' | t }}
          <code>docs/architecture/</code>
          {{ 'projects.when-exporting-for-codex-cli' | t }}
          <code>docs/standards/</code>
          {{ 'projects.comes-from-squad-agent-guidelines-and' | t }}
          <code>docs/features/</code>
          {{ 'projects.from-operation-features-click-the-portraits-to-open' | t }}
          <b>Agent Teams</b>
          {{ 'projects.an-online-meeting-with-the-commander-prd-and-adr-analysts-' | t }}
        </span>
        <div class="ops-docs">
          @for (row of rows; track row.key) {
            <details class="ops-doc" [attr.data-doc-row]="row.key">
              <summary>
                <span>{{ row.title | uiLabel }}</span>
                <small>{{ row.path }}</small>
                <span class="ops-doc-badges">
                  <em class="ops-doc-state" [class.on]="filled(row.key)">
                    {{ filled(row.key) ? ('ui.filled' | t) : ('ui.empty' | t) }}
                  </em>
                  @if (row.key === 'architecture' && draft().adrs.length) {
                    <em class="ops-doc-state on">
                      {{ draft().adrs.length }} ADR{{ draft().adrs.length > 1 ? 'S' : '' }}
                    </em>
                  }
                </span>
                @if (row.key !== 'runAndValidate') {
                  <button
                    class="ops-doc-agent group"
                    type="button"
                    (click)="
                      $event.preventDefault(); $event.stopPropagation(); meeting.emit(row.key)
                    "
                    [attr.aria-label]="('ui.co-write' | t) + (row.title | uiLabel)"
                  >
                    @for (a of members(); track a.id) {
                      <img [src]="portrait(a)" [alt]="a.name" />
                    }
                  </button>
                }
              </summary>
              <div class="ops-doc-body">
                @if (row.key === 'scope') {
                  <div class="form-grid">
                    <div class="field">
                      <label for="projectScopeIn">{{ 'projects.in-scope-one-per-line' | t }}</label>
                      <textarea
                        id="projectScopeIn"
                        name="scopeIn"
                        [(ngModel)]="draft().scopeIn"
                        [ngModelOptions]="standalone"
                        maxlength="8000"
                      ></textarea>
                    </div>
                    <div class="field">
                      <label for="projectScopeOut">
                        {{ 'projects.out-of-scope-one-per-line' | t }}
                      </label>
                      <textarea
                        id="projectScopeOut"
                        name="scopeOut"
                        [(ngModel)]="draft().scopeOut"
                        [ngModelOptions]="standalone"
                        maxlength="8000"
                      ></textarea>
                    </div>
                  </div>
                } @else if (row.key === 'architecture') {
                  <label class="label" for="projectArchitecture">
                    {{ 'projects.overview' | t }}
                  </label>
                  <textarea
                    id="projectArchitecture"
                    name="architecture"
                    [(ngModel)]="draft().architecture"
                    [ngModelOptions]="standalone"
                    maxlength="12000"
                  ></textarea>
                  <span class="label adr-label">
                    {{ 'documents.architecture-decisions-adr' | t }}
                  </span>
                  <div class="adr-list" id="adrList">
                    @for (adr of draft().adrs; track adr.id) {
                      <div class="adr-block">
                        <div class="adr-head">
                          <span class="adr-num">ADR-{{ pad($index + 1) }}</span>
                          <input
                            name="adrTitle"
                            [(ngModel)]="adr.title"
                            [ngModelOptions]="standalone"
                            maxlength="120"
                            [attr.aria-label]="'documents.adr-title' | t"
                          />
                          <select
                            name="adrStatus"
                            [(ngModel)]="adr.status"
                            [ngModelOptions]="standalone"
                            [attr.aria-label]="'projects.adr-status' | t"
                          >
                            @for (status of adrStatuses; track status) {
                              <option [value]="status">{{ status | uiLabel }}</option>
                            }
                          </select>
                          <button
                            type="button"
                            class="icon-button small"
                            (click)="removeAdr(adr.id)"
                            [attr.aria-label]="'documents.remove-adr' | t"
                          >
                            <luma-icon name="trash" />
                          </button>
                        </div>
                        <textarea
                          class="code"
                          name="adrContent"
                          [(ngModel)]="adr.content"
                          [ngModelOptions]="standalone"
                          maxlength="12000"
                          [attr.aria-label]="'documents.context-decision-and-consequences' | t"
                        ></textarea>
                      </div>
                    }
                  </div>
                  <button type="button" class="btn ghost sm" (click)="addAdr()">
                    <luma-icon name="plus" />
                    {{ 'documents.add-adr' | t }}
                  </button>
                } @else if (row.key === 'vision') {
                  <textarea
                    name="vision"
                    [(ngModel)]="draft().vision"
                    [ngModelOptions]="standalone"
                    maxlength="8000"
                    [attr.aria-label]="'project.vision' | t"
                  ></textarea>
                } @else if (row.key === 'runAndValidate') {
                  <p class="hint">
                    {{ 'delivery.runAndValidateDesc' | t }}
                  </p>
                  <div class="field full">
                    <label for="rvInstructions">{{ 'delivery.runAndValidate' | t }}</label>
                    <textarea
                      id="rvInstructions"
                      class="code"
                      name="rvInstructions"
                      [(ngModel)]="runAndValidate().instructions"
                      [ngModelOptions]="standalone"
                      rows="14"
                      maxlength="20000"
                      [placeholder]="'delivery.runAndValidatePlaceholder' | t"
                    ></textarea>
                  </div>
                  <div class="field">
                    <label for="rvDocAgent">{{ 'delivery.documenter' | t }}</label>
                    <select
                      id="rvDocAgent"
                      name="rvDocAgent"
                      [(ngModel)]="draft().documenterId"
                      [ngModelOptions]="standalone"
                    >
                      <option value="">{{ 'ui.choose-agent' | t }}</option>
                      @for (agent of documenters(); track agent.id) {
                        <option [value]="agent.id">
                          {{ agent.name }} ({{ agent.specialty || agent.role }})
                        </option>
                      }
                    </select>
                  </div>
                } @else {
                  <textarea
                    name="glossary"
                    [(ngModel)]="draft().glossary"
                    [ngModelOptions]="standalone"
                    maxlength="8000"
                    [attr.aria-label]="'project.glossary' | t"
                  ></textarea>
                }
              </div>
            </details>
          }
        </div>
      </div>
    </div>
  `,
})
export class ProjectFormComponent {
  readonly draft = input.required<Project>();
  readonly meeting = output<string>();
  readonly store = inject(WorkspaceStore);
  readonly portrait = inject(PortraitService).source;
  readonly standalone = { standalone: true };
  readonly rows = [
    { key: 'vision', title: 'ui.product-vision', path: 'docs/project/product-vision.md' },
    { key: 'scope', title: 'ESCOPO', path: 'docs/project/scope.md' },
    { key: 'glossary', title: 'GLOSSÁRIO', path: 'docs/project/glossary.md' },
    { key: 'architecture', title: 'ARQUITETURA', path: 'docs/architecture/' },
    { key: 'runAndValidate', title: 'delivery.runAndValidate', path: 'docs/run-and-validate.md' },
  ];
  pad(n: number): string {
    return String(n).padStart(3, '0');
  }
  readonly adrStatuses = ['Proposto', 'Aceito', 'Rejeitado', 'Substituído'];
  filled(key: string): boolean {
    const d = this.draft();
    if (key === 'scope') return !!(d.scopeIn + d.scopeOut).trim();
    if (key === 'runAndValidate') {
      const rv = d.runAndValidate;
      return !!(rv && (rv.instructions?.trim() || rv.startCommands || rv.url));
    }
    return !!d[key as 'vision' | 'glossary' | 'architecture']?.trim();
  }
  runAndValidate(): RunAndValidateInstructions {
    return (this.draft().runAndValidate ??= { folder: this.draft().folder || '' });
  }
  documenters(): Agent[] {
    const squad = this.store.workspace()?.squads.find((squad) => squad.id === this.draft().squadId);
    return (squad?.agentIds || [])
      .map((id) => this.store.agent(id))
      .filter((agent): agent is Agent => !!agent && agent.role === 'docs');
  }
  members(): Agent[] {
    const q = this.store.workspace()?.squads.find((q) => q.id === this.draft().squadId);
    return [q?.commanderId, q?.prdId, q?.adrId]
      .map((id) => this.store.agent(id || ''))
      .filter((a): a is Agent => !!a);
  }
  choose(q: Squad): void {
    Object.assign(this.draft(), {
      squadId: q.id,
      commanderId: q.commanderId,
      agentIds: [...q.agentIds],
    });
  }
  addAdr(): void {
    this.draft().adrs.push({
      id: uuid('adr'),
      title: '',
      status: 'Proposto',
      date: timestamp().slice(0, 10),
      content: '## Contexto\n\n\n## Decisão\n\n\n## Consequências\n',
    });
  }
  removeAdr(id: string): void {
    this.draft().adrs = this.draft().adrs.filter((a) => a.id !== id);
  }
}

import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CONVENTION_FAMILIES, CONVENTION_SUBSETS } from '@domain/catalog';
import ui from '@domain/interface-catalog.json';
import { ConventionEntry } from '@domain/models';
import { IconComponent } from '../../shared/icon.component';
@Component({
  selector: 'luma-convention-picker',
  standalone: true,
  imports: [FormsModule, IconComponent],
  host: { style: 'display:contents' },
  template: `
    <div class="conv-picker">
      <div class="conv-search">
        <span class="conv-search-field">
          <luma-icon name="search" />
          <input
            id="convSearch"
            type="search"
            autocomplete="off"
            spellcheck="false"
            [(ngModel)]="query"
            [ngModelOptions]="{ standalone: true }"
            (ngModelChange)="cursor.set(0)"
            (keydown)="keys($event)"
            placeholder="Pesquise por tema: testes, segurança, git, acessibilidade..."
            aria-label="Pesquisar subsets por tema"
            aria-controls="convResults"
          />
        </span>
        <div class="conv-themes" role="group" aria-label="Temas">
          @for (g of groups; track g.key) {
            <button
              type="button"
              class="conv-theme"
              [class.active]="theme() === g.key"
              [attr.aria-pressed]="theme() === g.key"
              (click)="setTheme(g.key)"
            >
              <luma-icon [name]="g.icon" />
              {{ g.label }}
            </button>
          }
          @if (library().length) {
            <button
              type="button"
              class="conv-theme"
              [class.active]="theme() === 'lib'"
              (click)="setTheme('lib')"
            >
              <luma-icon name="star" />
              Minha biblioteca
            </button>
          }
        </div>
        <div class="conv-results" id="convResults" role="listbox" aria-label="Subsets">
          @for (group of sections(); track group.key) {
            <div class="conv-rgroup">
              <div class="conv-rhead">
                <luma-icon [name]="group.icon" />
                <span>{{ group.label }}</span>
                <em>{{ pad(group.items.length) }}</em>
              </div>
              @for (item of group.items; track item.src) {
                <div
                  class="conv-row"
                  [class.used]="used().includes(item.src)"
                  [class.active]="flat()[cursor()] === item.src"
                >
                  <button
                    type="button"
                    role="option"
                    [disabled]="used().includes(item.src)"
                    (click)="selected.emit(item.src)"
                  >
                    <span class="conv-row-icon"><luma-icon [name]="item.icon" /></span>
                    <span class="conv-row-text">
                      <strong>{{ item.name }}</strong>
                      <small>
                        {{ used().includes(item.src) ? 'Já adicionado a este agente' : item.desc }}
                      </small>
                    </span>
                    <luma-icon [name]="used().includes(item.src) ? 'check' : 'plus'" />
                  </button>
                  @if (item.lib) {
                    <button
                      class="conv-row-del"
                      type="button"
                      (click)="deleted.emit(item.src.slice(4))"
                      [attr.aria-label]="'Excluir ' + item.name + ' da biblioteca'"
                    >
                      <luma-icon name="trash" />
                    </button>
                  }
                </div>
              }
            </div>
          } @empty {
            <p class="hint conv-empty">Nenhum subset encontrado para esse tema.</p>
          }
          <div class="conv-rgroup">
            <div class="conv-row" [class.active]="flat()[cursor()] === 'custom'">
              <button type="button" role="option" (click)="selected.emit('custom')">
                <span class="conv-row-icon"><luma-icon name="edit" /></span>
                <span class="conv-row-text">
                  <strong>Subset em branco</strong>
                  <small>Escreva suas próprias regras.</small>
                </span>
                <luma-icon name="plus" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ConventionPickerComponent {
  readonly family = input('general');
  readonly library = input<ConventionEntry[]>([]);
  readonly used = input<string[]>([]);
  readonly selected = output<string>();
  readonly deleted = output<string>();
  readonly closed = output<void>();
  readonly groups = ui.groups;
  readonly theme = signal('');
  readonly cursor = signal(0);
  query = '';
  private norm(s: string): string {
    return s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
  pad(n: number): string {
    return String(n).padStart(2, '0');
  }
  setTheme(key: string): void {
    this.theme.set(this.theme() === key ? '' : key);
    this.cursor.set(0);
    document.getElementById('convSearch')?.focus();
  }
  sections() {
    const words = this.norm(this.query).trim().split(/\s+/).filter(Boolean),
      theme = this.theme(),
      match = (s: { name: string; desc?: string; tags?: string }, key: string) =>
        !theme || key === theme
          ? words.every((w) =>
              this.norm(
                s.name +
                  ' ' +
                  (s.desc || '') +
                  ' ' +
                  (s.tags || '') +
                  ' ' +
                  (this.groups.find((g) => g.key === key)?.label || ''),
              ).includes(w),
            )
          : false;
    const sections: {
      key: string;
      label: string;
      icon: string;
      items: { src: string; name: string; icon: string; desc: string; lib: boolean }[];
    }[] = [];
    const row = (s: (typeof CONVENTION_SUBSETS)[number]) => ({
      src: 'builtin:' + s.key,
      name: s.name,
      icon: s.icon,
      desc: s.desc,
      lib: false,
    });
    const suggest = (CONVENTION_FAMILIES as Record<string, any>)[this.family()]?.suggest || [];
    if (!words.length && !theme && suggest.length)
      sections.push({
        key: 'suggest',
        label: 'Sugeridos para este agente',
        icon: 'sparkle',
        items: suggest
          .map((key: string) => CONVENTION_SUBSETS.find((s) => s.key === key))
          .filter(Boolean)
          .map(row),
      });
    for (const g of this.groups) {
      const items = CONVENTION_SUBSETS.filter((s) => s.group === g.key && match(s, g.key)).map(row);
      if (items.length) sections.push({ ...g, items });
    }
    const lib = this.library().filter((s) =>
      match({ name: s.name, desc: s.content.slice(0, 400), tags: 'minha biblioteca' }, 'lib'),
    );
    if (lib.length)
      sections.push({
        key: 'lib',
        label: 'Minha biblioteca',
        icon: 'star',
        items: lib.map((s) => ({
          src: 'lib:' + s.id,
          name: s.name,
          icon: 'star',
          desc: s.content.replace(/\s+/g, ' ').slice(0, 90),
          lib: true,
        })),
      });
    return sections;
  }
  flat(): string[] {
    return [
      ...this.sections()
        .flatMap((g) => g.items.map((s) => s.src))
        .filter((src) => !this.used().includes(src)),
      'custom',
    ];
  }
  keys(e: KeyboardEvent): void {
    const flat = this.flat();
    if (['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === 'Enter') this.selected.emit(flat[this.cursor() % flat.length]);
      else
        this.cursor.update(
          (v) => (v + (e.key === 'ArrowDown' ? 1 : -1) + flat.length) % flat.length,
        );
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this.closed.emit();
    }
  }
}

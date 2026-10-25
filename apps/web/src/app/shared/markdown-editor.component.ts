import { I18nService } from '../core/i18n/i18n.service';
import {
  Component,
  model,
  input,
  signal,
  viewChild,
  ElementRef,
  effect,
  inject,
} from '@angular/core';
import { TranslatePipe } from '../core/i18n/i18n.service';
import { renderMarkdown } from './markdown';
@Component({
  selector: 'luma-markdown-editor',
  standalone: true,
  imports: [TranslatePipe],
  host: { style: 'display:contents' },
  template: `
    <section
      class="fe-md"
      [class.collapsed]="collapsed()"
      [class.editing]="mode() === 'edit'"
      [attr.data-field]="field()"
    >
      <header class="fe-md-head">
        <button
          type="button"
          class="fe-md-toggle"
          (click)="collapsed.set(!collapsed())"
          [attr.aria-expanded]="!collapsed()"
        >
          <span class="fe-chev"></span>
          {{ label() | t }}
          <small>{{ definition().hint }}</small>
        </button>
        <em class="fe-md-count">{{ count() }}</em>
        <div class="fe-md-modes" role="group">
          <button type="button" [class.on]="mode() === 'preview'" (click)="mode.set('preview')">
            {{ 'shell.view' | t }}
          </button>
          <button type="button" [class.on]="mode() === 'edit'" (click)="edit()">
            {{ 'action.edit' | t }}
          </button>
        </div>
      </header>
      <div class="fe-md-body">
        <div class="fe-md-tools" [hidden]="mode() !== 'edit' || listField()">
          @for (tool of tools; track tool.name) {
            <button
              type="button"
              [disabled]="disabled()"
              (click)="insert(tool.before, tool.after)"
              [title]="tool.title"
              [attr.aria-label]="tool.title"
            >
              {{ tool.name }}
            </button>
          }
        </div>
        <div
          class="conv-md fe-md-view"
          [hidden]="mode() !== 'preview'"
          role="button"
          tabindex="0"
          (click)="edit()"
          (keydown.enter)="edit()"
          [attr.aria-label]="('action.edit' | t) + (label() | t)"
          [innerHTML]="preview()"
        ></div>
        <textarea
          #area
          class="fe-area"
          [hidden]="mode() !== 'edit'"
          rows="1"
          [attr.maxlength]="
            field() === 'briefing' ? 20000 : field() === 'architecture' ? 12000 : 8000
          "
          [attr.id]="definition().id"
          [attr.name]="field() || null"
          [value]="value()"
          [disabled]="disabled()"
          [attr.aria-label]="label() | t"
          [placeholder]="definition().placeholder"
          (input)="value.set($any($event.target).value)"
          (keydown)="keys($event)"
          (focusout)="blur($event)"
          spellcheck="false"
        ></textarea>
      </div>
    </section>
  `,
})
export class MarkdownEditorComponent {
  readonly i18n = inject(I18nService);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  reveal(): void {
    this.collapsed.set(false);
    requestAnimationFrame(() => {
      const section = this.element.nativeElement.querySelector<HTMLElement>('.fe-md');
      if (!section) return;
      section.scrollIntoView({ block: 'nearest' });
      section.classList.remove('fe-updated');
      void section.offsetWidth;
      section.classList.add('fe-updated');
      setTimeout(() => section.classList.remove('fe-updated'), 1400);
    });
  }
  readonly value = model('');
  readonly label = input('');
  readonly field = input('');
  readonly rows = input(3);
  readonly disabled = input(false);
  readonly mode = signal<'edit' | 'preview'>('preview');
  readonly collapsed = signal(false);
  readonly area = viewChild<ElementRef<HTMLTextAreaElement>>('area');
  readonly render = renderMarkdown;
  listField(): boolean {
    return ['scopeIn', 'scopeOut', 'glossary'].includes(this.field());
  }
  preview(): string {
    const escape = (text: string) =>
      text.replace(
        /[&<>"']/g,
        (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
      );
    if (!this.value().trim()) {
      const empty: Record<string, string> = {
        description: this.i18n.text('ui.click-to-write-the-feature-scope'),
        criteria: this.i18n.text('ui.click-to-write-acceptance-criteria'),
        tasks: this.i18n.text('ui.click-to-break-the-feature-into-tasks'),
        briefing: this.i18n.text('ui.click-to-write-the-project-briefing'),
        vision: this.i18n.text('ui.click-to-write-the-product-vision'),
        scopeIn: this.i18n.text('ui.click-to-list-what-the-operation-delivers'),
        scopeOut: this.i18n.text('ui.click-to-list-what-is-out-of-scope'),
        glossary: this.i18n.text('ui.click-to-write-domain-terms'),
        architecture: this.i18n.text('ui.click-to-write-the-architecture-overview'),
      };
      return (
        '<p class="fe-md-empty">' +
        escape(this.i18n.label(empty[this.field()] || this.definition().empty)) +
        '</p>'
      );
    }
    if (!this.listField()) return renderMarkdown(this.value());
    const items = this.value()
      .split('\n')
      .map((line) => line.trim().replace(/^(?:[-*•]|\d+[.)])\s+/, ''))
      .filter(Boolean);
    return (
      '<ul>' +
      items
        .map((line) => {
          const term =
            this.field() === 'glossary' && line.match(/^(.+?)\s*(?::|—|–|\s-\s)\s*(.+)$/);
          return (
            '<li>' +
            (term ? '<b>' + escape(term[1]) + '</b>: ' + escape(term[2]) : escape(line)) +
            '</li>'
          );
        })
        .join('') +
      '</ul>'
    );
  }
  private initialized = false;
  readonly tools = [
    { name: 'B', title: 'Negrito (Ctrl+B)', before: '**', after: '**' },
    { name: 'I', title: 'ui.italic-ctrl-i', before: '*', after: '*' },
    { name: 'H', title: 'ui.subheading', before: '### ', after: '' },
    { name: '•', title: 'feature.list', before: '- ', after: '' },
    { name: '☐', title: 'Checklist', before: '- [ ] ', after: '' },
    { name: '</>', title: 'project.code', before: '`', after: '`' },
  ];
  constructor() {
    effect(() => {
      const value = this.value();
      if (!this.initialized) {
        this.initialized = true;
        this.mode.set(value.trim() ? 'preview' : 'edit');
      }
    });
    effect(() => {
      this.value();
      this.mode();
      const area = this.area()?.nativeElement;
      if (area)
        queueMicrotask(() => {
          if (!area.isConnected || area.hidden) return;
          area.style.height = 'auto';
          area.style.height = Math.max(84, area.scrollHeight + 2) + 'px';
        });
    });
  }
  definition(): { id: string | null; hint: string; placeholder: string; empty: string } {
    const f = this.field();
    const defs: Record<string, [string, string, string]> = {
      description: [
        'featureDescription',
        this.i18n.text('ui.what-must-be-delivered'),
        this.i18n.text('ui.context-expected-behavior-and-feature-boundaries'),
      ],
      criteria: [
        'featureCriteria',
        this.i18n.text('ui.verifiable-list'),
        this.i18n.text('ui.given-when-then'),
      ],
      tasks: [
        'featureTasks',
        'checklist',
        '- [ ] Criar tabela products\n- [ ] Endpoint GET /products com paginação',
      ],
      briefing: [
        'docBriefing',
        this.i18n.text('ui.goal-users-constraints-and-done'),
        this.i18n.text('projects.goal-users-scope-constraints-and-definition-of-done'),
      ],
      vision: [
        'docVision',
        this.i18n.text('ui.for-whom-problem-and-value'),
        this.i18n.text('ui.audience-problem-value-proposition-differentiators-and-'),
      ],
      scopeIn: [
        'docScopeIn',
        this.i18n.text('ui.one-item-per-line'),
        'Catálogo com busca e filtros\nCheckout com pagamento em sandbox',
      ],
      scopeOut: [
        'docScopeOut',
        this.i18n.text('ui.one-item-per-line'),
        'Pagamentos reais\nAplicativo mobile nativo',
      ],
      glossary: [
        'docGlossary',
        this.i18n.text('ui.term-definition-one-per-line'),
        this.i18n.text('ui.sku-unique-code-identifying-a-product'),
      ],
      architecture: [
        'docArchitecture',
        this.i18n.text('ui.overview-components-data-and-integrations'),
        this.i18n.text('ui.components-integrations-data-environments-and-technical'),
      ],
    };
    const def = defs[f];
    return {
      id: def?.[0] || null,
      hint: def?.[1] || '',
      placeholder: def?.[2] || '',
      empty: this.i18n.text('ui.click-to-write'),
    };
  }
  count(): string {
    const text = this.value().trim();
    if (!text) return 'vazio';
    const f = this.field();
    if (['description', 'briefing', 'vision', 'architecture'].includes(f)) {
      const n = text.split(/\s+/).length;
      return n + ' palavra' + (n === 1 ? '' : 's');
    }
    if (this.listField()) {
      const n = text.split('\n').filter((line) => line.trim()).length;
      return (
        n +
        ' ' +
        (this.field() === 'glossary' ? (n === 1 ? 'termo' : 'termos') : n === 1 ? 'item' : 'itens')
      );
    }
    const lines = text.split('\n').filter((l) => l.trim() && !/^#{1,6}\s/.test(l.trim())),
      n = lines.filter((l) => /^\s*(?:[-*•]|\d+[.)])\s+/.test(l)).length || lines.length;
    const label =
      f === 'tasks'
        ? 'tarefa'
        : f === 'criteria'
          ? this.i18n.text('ui.criterion')
          : f === 'glossary'
            ? 'termo'
            : 'item';
    return n + ' ' + label + (n === 1 ? '' : 's');
  }
  edit(): void {
    this.collapsed.set(false);
    this.mode.set('edit');
    setTimeout(() => {
      const area = this.area()?.nativeElement;
      if (area?.isConnected && !area.hidden) area.focus();
    }, 0);
  }
  blur(event: FocusEvent): void {
    const area = event.currentTarget as HTMLElement;
    if (
      this.value().trim() &&
      !area.closest('.fe-md')?.contains(event.relatedTarget as Node | null)
    )
      this.mode.set('preview');
  }
  keys(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this.mode.set('preview');
      const section = this.area()?.nativeElement.closest('.fe-md');
      setTimeout(() => section?.querySelector<HTMLElement>('.fe-md-view')?.focus(), 0);
      return;
    }
    if ((e.ctrlKey || e.metaKey) && ['b', 'i'].includes(e.key.toLowerCase())) {
      e.preventDefault();
      const tool = this.tools[e.key.toLowerCase() === 'b' ? 0 : 1];
      this.insert(tool.before, tool.after);
    }
  }
  insert(before: string, after: string): void {
    const el = this.area()?.nativeElement;
    if (!el || this.disabled()) return;
    const start = el.selectionStart,
      end = el.selectionEnd,
      current = el.value;
    let next: string, from: number, to: number;
    if (after) {
      const selected = current.slice(start, end);
      const around =
        current.slice(start - before.length, start) === before &&
        current.slice(end, end + after.length) === after;
      const inside =
        selected.length > before.length + after.length &&
        selected.startsWith(before) &&
        selected.endsWith(after);
      if (around) {
        next =
          current.slice(0, start - before.length) + selected + current.slice(end + after.length);
        from = start - before.length;
        to = end - before.length;
      } else if (inside) {
        const text = selected.slice(before.length, -after.length);
        next = current.slice(0, start) + text + current.slice(end);
        from = start;
        to = start + text.length;
      } else {
        const text = selected || 'texto';
        next = current.slice(0, start) + before + text + after + current.slice(end);
        from = start + before.length;
        to = from + text.length;
      }
    } else {
      const lineStart = current.lastIndexOf('\n', start - 1) + 1;
      const newline = current.indexOf('\n', end),
        lineEnd = newline < 0 ? current.length : newline;
      const lines = current.slice(lineStart, lineEnd).split('\n');
      const remove = lines.every((line) => line.startsWith(before));
      const block = lines
        .map((line) =>
          remove
            ? line.slice(before.length)
            : before + line.replace(/^(?:#{1,6}\s+|[-*]\s+(?:\[[ xX]\]\s+)?)/, ''),
        )
        .join('\n');
      next = current.slice(0, lineStart) + block + current.slice(lineEnd);
      from = lineStart;
      to = lineStart + block.length;
    }
    el.value = next;
    this.value.set(next);
    setTimeout(() => {
      if (!el.isConnected || el.hidden) return;
      el.focus();
      el.setSelectionRange(from, to);
    }, 0);
  }
}

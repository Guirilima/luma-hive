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
            Visualizar
          </button>
          <button type="button" [class.on]="mode() === 'edit'" (click)="edit()">Editar</button>
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
          [attr.aria-label]="'Editar ' + (label() | t)"
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
        description: 'Clique para escrever o escopo da feature.',
        criteria: 'Clique para escrever os critérios de aceitação.',
        tasks: 'Clique para quebrar a feature em tarefas.',
        briefing: 'Clique para escrever o briefing do projeto.',
        vision: 'Clique para escrever a visão do produto.',
        scopeIn: 'Clique para listar o que a operação entrega.',
        scopeOut: 'Clique para listar o que fica de fora.',
        glossary: 'Clique para escrever os termos do domínio.',
        architecture: 'Clique para escrever a visão geral da arquitetura.',
      };
      return (
        '<p class="fe-md-empty">' + escape(empty[this.field()] || this.definition().empty) + '</p>'
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
    { name: 'I', title: 'Itálico (Ctrl+I)', before: '*', after: '*' },
    { name: 'H', title: 'Subtítulo', before: '### ', after: '' },
    { name: '•', title: 'Lista', before: '- ', after: '' },
    { name: '☐', title: 'Checklist', before: '- [ ] ', after: '' },
    { name: '</>', title: 'Código', before: '`', after: '`' },
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
        'o que deve ser entregue',
        'Contexto, comportamento esperado e limites da feature.',
      ],
      criteria: ['featureCriteria', 'lista verificável', '- Dado… quando… então…'],
      tasks: [
        'featureTasks',
        'checklist',
        '- [ ] Criar tabela products\n- [ ] Endpoint GET /products com paginação',
      ],
      briefing: [
        'docBriefing',
        'objetivo, usuários, restrições e pronto',
        'Objetivo, usuários, escopo, restrições e definição de pronto.',
      ],
      vision: [
        'docVision',
        'para quem, problema e valor',
        'Para quem é, que problema resolve, proposta de valor, diferenciais e metas.',
      ],
      scopeIn: [
        'docScopeIn',
        'um item por linha',
        'Catálogo com busca e filtros\nCheckout com pagamento em sandbox',
      ],
      scopeOut: ['docScopeOut', 'um item por linha', 'Pagamentos reais\nAplicativo mobile nativo'],
      glossary: [
        'docGlossary',
        'termo: definição, um por linha',
        'SKU: código único que identifica um produto',
      ],
      architecture: [
        'docArchitecture',
        'visão geral: componentes, dados e integrações',
        'Componentes, integrações, dados, ambientes e restrições técnicas.',
      ],
    };
    const def = defs[f];
    return {
      id: def?.[0] || null,
      hint: def?.[1] || '',
      placeholder: def?.[2] || '',
      empty: 'Clique para escrever.',
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
          ? 'critério'
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

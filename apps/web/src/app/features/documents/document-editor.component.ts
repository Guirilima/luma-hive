import { UiLabelPipe } from '../../core/i18n/i18n.service';
import { Component, inject, signal } from '@angular/core';
import { MarkdownEditorComponent } from '../../shared/markdown-editor.component';
import { FormsModule } from '@angular/forms';
import { Adr, Project, uuid } from '@domain/models';
import { WorkspaceStore } from '../../core/workspace/workspace.store';
import { ExecutionService } from '../../core/execution/execution.service';
import { DialogService, download } from '../../core/ui/dialog.service';
import { TranslatePipe } from '../../core/i18n/i18n.service';
import { ModalComponent } from '../../shared/modal.component';
@Component({
  selector: 'luma-document-editor',
  standalone: true,
  imports: [UiLabelPipe, MarkdownEditorComponent, FormsModule, TranslatePipe, ModalComponent],
  templateUrl: './document-editor.component.html',
})
export class DocumentEditorComponent {
  readonly store = inject(WorkspaceStore);
  readonly dialogs = inject(DialogService);
  readonly execution = inject(ExecutionService);
  readonly isAdr = this.dialogs.current()?.tab === 'adr';
  readonly field = (this.dialogs.current()?.field || 'briefing') as
    'briefing' | 'vision' | 'scopeIn' | 'scopeOut' | 'glossary' | 'architecture';
  readonly existingAdr = this.store
    .project()
    ?.adrs.find((a) => a.id === this.dialogs.current()?.id);
  adr: Adr = structuredClone(
    this.existingAdr || {
      id: uuid('adr'),
      title: '',
      status: 'Proposto',
      date: new Date().toISOString().slice(0, 10),
      content: '',
    },
  );
  content = this.isAdr ? this.adr.content : this.store.project()![this.field];
  agentId = this.isAdr
    ? this.store.project()?.agentIds.find((id) => this.store.agent(id)?.role === 'architect') ||
      this.store.selectedId()
    : this.store.project()?.agentIds.find((id) => this.store.agent(id)?.role === 'po') ||
      this.store.selectedId();
  readonly working = signal(false);
  readonly response = signal('');
  async generate(): Promise<void> {
    const agent = this.store.agent(this.agentId);
    if (!agent) return;
    this.working.set(true);
    try {
      const result = await this.execution.execute(
        agent,
        'doc',
        `Draft ${this.isAdr ? 'an architecture decision record: ' + this.adr.title : this.field} based on this operation. Return Markdown only, state assumptions and open questions. Existing text:\n${this.content}`,
        undefined,
        true,
      );
      if (result.error) throw Error(result.text);
      this.response.set(result.text);
    } catch (e) {
      this.store.report(e);
    } finally {
      this.working.set(false);
      this.execution.currentAgent.set('');
    }
  }
  save(): void {
    if (this.isAdr && !this.adr.title.trim()) return;
    this.store.change((w) => {
      const p = w.projects.find((p) => p.id === w.projectId)!;
      if (this.isAdr) {
        this.adr.content = this.content;
        const i = p.adrs.findIndex((a) => a.id === this.adr.id);
        if (i < 0) p.adrs.push(this.adr);
        else p.adrs[i] = this.adr;
      } else p[this.field] = this.content;
    });
    this.dialogs.close();
  }
  remove(): void {
    this.store.change((w) => {
      const p = w.projects.find((p) => p.id === w.projectId)!;
      p.adrs = p.adrs.filter((a) => a.id !== this.adr.id);
    });
    this.dialogs.close();
  }
  export(): void {
    download(
      (this.isAdr ? 'ADR-' + this.adr.title : this.field) + '.md',
      this.content,
      'text/markdown',
    );
  }
}

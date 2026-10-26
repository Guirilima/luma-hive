import { Router } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/i18n.service';
import { Component, inject, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Feature } from '@domain/models';
import { ROLES } from '@domain/catalog';
import { IconComponent } from '../../shared/icon.component';
import { FormsModule } from '@angular/forms';
import { WorkspaceStore } from '../../core/workspace/workspace.store';
import { DialogService, download } from '../../core/ui/dialog.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { ModalComponent } from '../../shared/modal.component';
@Component({
  selector: 'luma-review',
  standalone: true,
  imports: [TranslatePipe, NgTemplateOutlet, IconComponent, FormsModule, ModalComponent],
  templateUrl: './review.component.html',
})
export class ReviewComponent {
  private readonly router = inject(Router);
  remember(runId: string): void {
    this.dialogs.close();
    void this.router.navigate(['/memory'], {
      queryParams: { project: this.store.project()?.id, sourceKind: 'run', sourceRef: runId },
    });
  }
  readonly store = inject(WorkspaceStore);
  readonly dialogs = inject(DialogService);
  readonly i18n = inject(I18nService);
  feedback = '';
  readonly featureId = input('');
  readonly inline = input(false);
  readonly closed = output<void>();
  readonly Math = Math;
  close(): void {
    if (this.inline()) this.closed.emit();
    else this.dialogs.close();
  }
  clock(at: string): string {
    return new Date(at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  real(f: Feature): boolean {
    return f.outputs.some((o) => !o.simulated);
  }
  scope(s: string): string {
    return s === 'fullstack'
      ? 'Full stack'
      : s === 'setup'
        ? this.i18n.text('ui.project-setup')
        : ROLES[s]?.label || s;
  }
  status(s: string): string {
    return this.i18n.text('status.' + s).toUpperCase();
  }
  feature() {
    return this.store.feature(this.featureId() || this.dialogs.current()?.id || '');
  }
  async review(approve: boolean): Promise<void> {
    this.store.review(this.feature()!.id, approve, this.feedback);
    await this.store.flush();
    if (!this.store.pending() && !this.store.conflict()) this.close();
  }
  format(value: unknown): string {
    return JSON.stringify(value, null, 2);
  }
  export(): void {
    const f = this.feature()!;
    download(
      f.key + '.md',
      `# ${f.key} — ${f.title}\n\n${f.outputs.map((o) => `## ${this.store.agent(o.agentId)?.name} (${o.simulated ? 'DEMO' : 'CLI'})\n\n${o.text}`).join('\n\n')}`,
      'text/markdown',
    );
  }
}

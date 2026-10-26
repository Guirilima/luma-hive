import { UiLabelPipe } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/i18n.service';
import { ROLES } from '@domain/catalog';
import { IconComponent } from '../../shared/icon.component';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { dependenciesReady } from '@domain/workspace';
import { uuid, timestamp } from '@domain/models';
import { WorkspaceStore } from '../../core/workspace/workspace.store';
import { DialogService } from '../../core/ui/dialog.service';
import { ModalComponent } from '../../shared/modal.component';
@Component({
  selector: 'luma-handoff-editor',
  standalone: true,
  imports: [UiLabelPipe, TranslatePipe, IconComponent, FormsModule, ModalComponent],
  templateUrl: './handoff-editor.component.html',
})
export class HandoffEditorComponent {
  readonly store = inject(WorkspaceStore);
  readonly router = inject(Router);
  readonly dialogs = inject(DialogService);
  from = this.store.selectedId();
  to =
    this.store.agent(this.from)?.nextId ||
    this.store.team().find((a) => a.id !== this.from)?.id ||
    '';
  featureId = this.candidates()[0]?.id || '';
  candidates() {
    return (
      this.store
        .project()
        ?.features.filter((f) => !['done', 'review', 'running'].includes(f.status)) || []
    );
  }
  roleLabel(a: { role: string; specialty: string }): string {
    return a.specialty || ROLES[a.role]?.label || a.role;
  }
  context = '';
  save(): void {
    if (
      !this.from ||
      !this.to ||
      this.from === this.to ||
      !this.candidates().some((f) => f.id === this.featureId) ||
      !this.context.trim() ||
      this.store.projectLocked()
    )
      return;
    this.store.change((w) => {
      const p = w.projects.find((p) => p.id === w.projectId)!,
        f = p.features.find((f) => f.id === this.featureId)!;
      f.route = [this.from, this.to];
      f.briefs = [];
      f.context = this.context;
      f.step = 0;
      f.currentAgentId = null;
      f.status = dependenciesReady(f, p) ? 'ready' : 'blocked';
      w.projects
        .find((p) => p.id === w.projectId)!
        .handoffs.push({
          id: uuid('handoff'),
          at: timestamp(),
          from: this.from,
          to: this.to,
          featureId: this.featureId,
          context: this.context,
          manual: true,
          simulated: w.settings.mode === 'demo',
        });
    });
    this.store.selectedId.set(this.to);
    void this.router.navigateByUrl('/handoffs');
    this.dialogs.close();
  }
}

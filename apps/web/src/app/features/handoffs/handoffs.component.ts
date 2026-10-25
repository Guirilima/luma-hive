import { IconComponent } from '../../shared/icon.component';
import { ModalComponent } from '../../shared/modal.component';
import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorkspaceStore } from '../../core/workspace/workspace.store';
import { DialogService, download } from '../../core/ui/dialog.service';
import { I18nService } from '../../core/i18n/i18n.service';
@Component({
  standalone: true,
  imports: [IconComponent, ModalComponent, FormsModule],
  templateUrl: './handoffs.component.html',
})
export class HandoffsComponent {
  clock(at: string): string {
    return new Date(at).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
  readonly store = inject(WorkspaceStore);
  readonly dialogs = inject(DialogService);
  readonly showHistory = this.dialogs.handoffHistory;
  readonly i18n = inject(I18nService);
  exportLogs(): void {
    download(
      'luma-hive-transmissions.json',
      JSON.stringify(this.store.project()?.logs || [], null, 2),
    );
  }
  readonly filter = signal('');
  readonly handoffs = computed(() => [...(this.store.project()?.handoffs || [])].reverse());
  readonly logs = computed(() =>
    [...(this.store.project()?.logs || [])]
      .reverse()
      .filter((l) => !this.filter() || l.type === this.filter()),
  );
}

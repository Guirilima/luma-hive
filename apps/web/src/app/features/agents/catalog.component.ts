import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PRESETS, CATEGORIES, portrait, makeAgent } from '@domain/catalog';
import { WorkspaceStore } from '../../core/workspace/workspace.store';
import { DialogService } from '../../core/ui/dialog.service';
import { TranslatePipe } from '../../core/i18n/i18n.service';
import { ModalComponent } from '../../shared/modal.component';
@Component({
  selector: 'luma-catalog',
  standalone: true,
  imports: [FormsModule, TranslatePipe, ModalComponent],
  templateUrl: './catalog.component.html',
})
export class CatalogComponent {
  readonly store = inject(WorkspaceStore);
  readonly dialogs = inject(DialogService);
  readonly role = signal('');
  search = '';
  readonly categories = CATEGORIES;
  readonly presets = PRESETS;
  items(): typeof PRESETS {
    return this.presets.filter(
      (p, i, all) =>
        all.findIndex((v) => v.name === p.name) === i &&
        p.name.toLowerCase().includes(this.search.toLowerCase()) &&
        (!this.role() || CATEGORIES.find((c) => c.key === this.role())?.roles.includes(p.role)),
    );
  }
  image(p: (typeof PRESETS)[number]): string {
    return portrait(makeAgent(p.role, p.name));
  }
  add(p: (typeof PRESETS)[number]): void {
    this.store.addPreset(p.role, p.name);
    this.dialogs.close();
  }
}

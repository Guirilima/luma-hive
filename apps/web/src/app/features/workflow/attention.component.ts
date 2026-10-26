import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkflowService } from '../../core/workflow/workflow.service';
import { WorkspaceStore } from '../../core/workspace/workspace.store';
import { DialogService } from '../../core/ui/dialog.service';
import { RoomService } from '../../core/execution/room.service';
import { I18nService, TranslatePipe } from '../../core/i18n/i18n.service';
import { AttentionItem } from '@domain/workflow';
import { IconComponent } from '../../shared/icon.component';
@Component({
  selector: 'luma-attention-trigger',
  standalone: true,
  imports: [TranslatePipe, IconComponent],
  template: `
    <button
      type="button"
      class="attention-trigger"
      (click)="router.navigateByUrl('/attention')"
      [attr.aria-label]="('attention.title' | t) + ' · ' + count()"
      [title]="'attention.title' | t"
    >
      <luma-icon name="info" />
      <span>{{ count() }}</span>
    </button>
  `,
  styles: `
    .attention-trigger {
      display: flex;
      align-items: center;
      gap: 5px;
      min-width: 38px;
      height: 34px;
      padding: 6px;
      border: 1px solid var(--line);
      background: var(--panel);
      color: var(--cyan);
      cursor: pointer;
      font: 11px var(--sans);
    }
    .attention-trigger .icon {
      width: 15px;
      height: 15px;
    }
    :host-context(html[data-interface-theme='pixel']) .attention-trigger {
      border: 2px solid var(--pixel-border);
      box-shadow: var(--pixel-frame);
      color: var(--pixel-gold);
    }
  `,
})
export class AttentionTriggerComponent {
  readonly workflow = inject(WorkflowService);
  readonly router = inject(Router);
  readonly count = computed(() => this.workflow.items().filter((i) => !i.acknowledgedAt).length);
}
@Component({
  standalone: true,
  imports: [FormsModule, TranslatePipe, IconComponent],
  templateUrl: './attention.component.html',
  styleUrl: './workflow.css',
})
export class AttentionComponent {
  readonly workflow = inject(WorkflowService);
  readonly store = inject(WorkspaceStore);
  readonly i18n = inject(I18nService);
  readonly dialogs = inject(DialogService);
  readonly room = inject(RoomService);
  readonly router = inject(Router);
  readonly project = signal('');
  readonly kind = signal('');
  readonly acknowledged = signal(false);
  readonly busy = signal('');
  readonly kinds = [
    'question',
    'approval',
    'review',
    'permission',
    'failure',
    'blocked',
    'recovery',
    'memory',
  ];
  readonly items = computed(() =>
    this.workflow
      .items()
      .filter(
        (i) =>
          (!this.project() || i.projectId === this.project()) &&
          (!this.kind() || i.kind === this.kind()) &&
          (this.acknowledged() || !i.acknowledgedAt),
      ),
  );
  text(text: string) {
    return /^(attention|recovery)\./.test(text) ? this.i18n.text(text) : text;
  }
  async open(item: AttentionItem) {
    if (item.kind === 'memory') {
      await this.router.navigate(['/memory'], {
        queryParams: { project: item.projectId, entry: item.memoryId },
      });
      return;
    }
    if (item.operationId) {
      await this.router.navigate(['/recovery'], { queryParams: { operation: item.operationId } });
      return;
    }
    if (item.runId) {
      await this.router.navigate(['/observability'], { queryParams: { run: item.runId } });
      return;
    }
    await this.store.flush();
    await this.store.synchronize();
    this.store.switchProject(item.projectId);
    if (this.store.project()?.id !== item.projectId) return;
    if (item.kind === 'question') {
      if (item.chatKey?.endsWith(':meeting')) this.dialogs.open('meeting');
      else if (item.chatKey?.includes(':agent:')) this.dialogs.open('chat', item.agentId);
      else this.room.open();
    } else if (item.kind === 'approval') this.room.open();
    else if (item.kind === 'review') this.dialogs.open('review', item.featureId);
    else this.dialogs.open('feature', item.featureId);
  }
  configure(item: AttentionItem) {
    if (item.provider) this.dialogs.open('settings', undefined, item.provider);
  }
  async acknowledge(item: AttentionItem) {
    this.busy.set(item.id);
    try {
      await this.workflow.api.acknowledgeAttention(item.id);
      await this.workflow.refresh();
    } catch (e) {
      this.store.report(e);
    } finally {
      this.busy.set('');
    }
  }
}

import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { ChatMessage, uuid, timestamp } from '@domain/models';
import { Router } from '@angular/router';
import { WorkspaceStore } from '../workspace/workspace.store';
@Injectable({ providedIn: 'root' })
export class RoomService {
  readonly store = inject(WorkspaceStore);
  private readonly router = inject(Router);
  readonly width = signal(380);
  private previousWidth: number | undefined;
  constructor() {
    effect(() => {
      const width = this.store.settings()?.opsChat || 380;
      if (width !== this.previousWidth) {
        this.previousWidth = width;
        this.width.set(width);
      }
    });
  }
  readonly opened = signal(false);
  readonly minimized = signal(false);
  readonly messages = computed(() => this.store.workspace()?.chats[this.key()] || []);
  key(projectId = this.store.project()?.id): string {
    return projectId + ':operation';
  }
  open(): void {
    if (this.store.settings()?.layout === 'city-3d')
      this.store.change((w) => (w.settings.layout = 'office-3d'));
    void this.router.navigateByUrl('/squad');
    this.opened.set(true);
    this.minimized.set(false);
  }
  append(
    text: string,
    options: Partial<ChatMessage> = {},
    projectId = this.store.project()?.id,
  ): string {
    const message: ChatMessage = {
      id: uuid('room'),
      role: 'system',
      text,
      at: timestamp(),
      simulated: this.store.settings()?.mode === 'demo',
      ...options,
    };
    this.store.change((w) => {
      const key = this.key(projectId);
      w.chats[key] = [...(w.chats[key] || []), message].slice(-500);
    });
    return message.id;
  }
  resolvePlan(status: 'approved' | 'cancelled'): void {
    this.store.change((w) => {
      const m = [...(w.chats[this.key()] || [])]
        .reverse()
        .find((m) => m.plan?.status === 'awaiting');
      if (m?.plan) m.plan.status = status;
    });
  }
  clear(): void {
    this.store.change((w) => {
      w.chats[this.key()] = [];
    });
  }
}

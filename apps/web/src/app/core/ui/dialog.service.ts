import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Feature, Project } from '@domain/models';
export type DialogKind =
  | 'operation-picker'
  | 'agent'
  | 'project'
  | 'feature'
  | 'squad'
  | 'settings'
  | 'chat'
  | 'console'
  | 'handoff'
  | 'help'
  | 'review'
  | 'doc'
  | 'catalog'
  | 'meeting'
  | 'spawn'
  | 'room';
export interface Dialog {
  kind: DialogKind;
  id?: string;
  tab?: string;
  field?: string;
  data?: {
    target?: { desk?: string; hex?: { q: number; r: number } };
    recruitRole?: string;
    squadSlot?: { squadId: string; slot: string; index: number };
    featurePrompt?: string;
    feature?: Feature;
    project?: Project;
    featureUndo?: Feature;
  };
}
@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly router = inject(Router);
  readonly current = signal<Dialog | null>(null);
  readonly recruited = signal<{ id: string; squadId: string } | null>(null);
  readonly pendingOperation = signal('');
  readonly handoffHistory = signal(false);
  readonly reviewFeature = signal('');
  readonly revealSprint = signal('');
  readonly mapHomeRequested = signal(0);
  readonly projectAction = signal<{ kind: 'newAdr' | 'adrs' | 'documents' } | null>(null);
  readonly projectDraft = signal<Project | null>(null);
  readonly notification = signal('');
  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  notify(message: string): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.notification.set(message);
    this.toastTimer = setTimeout(() => this.notification.set(''), 5500);
  }
  readonly confirmation = signal<{
    message: string;
    title: string;
    label: string;
    danger: boolean;
    resolve: (value: boolean) => void;
  } | null>(null);
  ask(
    message: string,
    title = 'CONFIRMAR AÇÃO',
    label = 'Confirmar',
    danger = false,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmation()?.resolve(false);
      this.confirmation.set({ message, title, label, danger, resolve });
    });
  }
  answer(value: boolean): void {
    const current = this.confirmation();
    this.confirmation.set(null);
    current?.resolve(value);
  }
  private returnFocus: HTMLElement | null = null;
  open(kind: DialogKind, id?: string, tab?: string, field?: string, data?: Dialog['data']): void {
    this.returnFocus = document.activeElement as HTMLElement;
    this.current.set({ kind, id, tab, field, data });
    if (kind === 'squad') void this.router.navigateByUrl('/squads');
  }
  close(): void {
    if (this.current()?.kind === 'squad') this.pendingOperation.set('');
    this.current.set(null);
    this.returnFocus?.focus();
  }
}
export function download(name: string, text: string | Uint8Array, type = 'application/json'): void {
  const url = URL.createObjectURL(
      new Blob([typeof text === 'string' ? text : new Uint8Array(text).buffer], { type }),
    ),
    a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

import { signal } from '@angular/core';

/** Keeps the reader's position while replies arrive; user messages can follow the bottom. */
export class ChatScrollState {
  readonly unread = signal(false);
  private pinned = true;
  private frame = 0;
  private disposed = false;
  onScroll(event: Event): void {
    const box = event.currentTarget as HTMLElement;
    this.pinned = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
    if (this.pinned) this.unread.set(false);
  }
  afterChange(selector: string, force = false): void {
    if (this.disposed) return;
    if (force) {
      this.pinned = true;
      this.unread.set(false);
    }
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => {
      if (this.disposed) return;
      const box = document.querySelector<HTMLElement>(selector);
      if (!box) return;
      if (this.pinned) {
        box.scrollTop = box.scrollHeight;
        this.unread.set(false);
      } else this.unread.set(true);
    });
  }
  jump(selector: string): void {
    this.afterChange(selector, true);
  }
  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
  }
}

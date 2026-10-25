import { Component, ElementRef, AfterViewInit, input, output, inject } from '@angular/core';
import { IconComponent } from './icon.component';
import { TranslatePipe } from '../core/i18n/i18n.service';
@Component({
  selector: 'luma-modal',
  standalone: true,
  imports: [TranslatePipe, IconComponent],
  templateUrl: './modal.component.html',
})
export class ModalComponent implements AfterViewInit {
  readonly title = input('');
  readonly subtitle = input('LUMA HIVE / WORKSPACE');
  readonly modalClass = input('');
  readonly closed = output<void>();
  readonly headingId = 'modal-title-' + crypto.randomUUID();
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  ngAfterViewInit(): void {
    queueMicrotask(() => {
      const root = this.element.nativeElement;
      const visible = (selector: string) =>
        [...root.querySelectorAll<HTMLElement>(selector)].find(
          (el) =>
            !el.hasAttribute('disabled') &&
            el.getClientRects().length > 0 &&
            getComputedStyle(el).visibility !== 'hidden',
        );
      const focus =
        visible('[autofocus]') ||
        visible('.modal-body input:not([type=hidden]),.modal-body textarea,.modal-body select') ||
        visible('.modal-footer button') ||
        visible('button');
      focus?.focus();
    });
  }
  outside(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('overlay')) this.closed.emit();
  }
  keys(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.stopPropagation();
      this.closed.emit();
    }
    if (e.key !== 'Tab') return;
    const elements = [
      ...this.element.nativeElement.querySelectorAll<HTMLElement>(
        'button,input,select,textarea,[tabindex="0"]',
      ),
    ].filter((el) => !el.hasAttribute('disabled') && el.getClientRects().length > 0);
    const first = elements[0],
      last = elements.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  }
}

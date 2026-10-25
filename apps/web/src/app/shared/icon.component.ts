import { Component, input, computed, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ICONS } from '@domain/catalog';
@Component({
  selector: 'luma-icon',
  standalone: true,
  template:
    '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" [innerHTML]="markup()"></svg>',
  styles: ':host{display:contents}',
})
export class IconComponent {
  readonly name = input('target');
  private readonly sanitizer = inject(DomSanitizer);
  readonly markup = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(
      Object.hasOwn(ICONS, this.name()) ? ICONS[this.name()] : ICONS['target'],
    ),
  );
}

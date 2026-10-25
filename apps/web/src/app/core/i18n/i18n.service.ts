import { Injectable, signal, Pipe, PipeTransform, inject } from '@angular/core';
import { Locale, LOCALES } from '@domain/models';
import { MESSAGES } from './messages';
@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly locale = signal<Locale>('pt-BR');
  set(locale: Locale): void {
    if (LOCALES.includes(locale)) {
      this.locale.set(locale);
      document.documentElement.lang = locale;
    }
  }
  text(key: string): string {
    return MESSAGES[this.locale()][key] || MESSAGES['pt-BR'][key] || key;
  }
  date(value: string): string {
    return new Date(value).toLocaleString(this.locale());
  }
}
@Pipe({ name: 't', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);
  transform(key: string): string {
    return this.i18n.text(key);
  }
}

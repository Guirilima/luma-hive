import { Injectable, signal, Pipe, PipeTransform, inject } from '@angular/core';
import { Locale, LOCALES } from '@domain/models';
import { LABELS, LANGUAGE_OPTIONS } from './labels';
import { MESSAGES } from './messages';
const SOURCE_LABEL_IDS = new Map(
  Object.entries(LABELS).flatMap(
    ([id, values]) =>
      [
        [id, id],
        [values['pt-BR'], id],
      ] as [string, string][],
  ),
);
@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly languages = LANGUAGE_OPTIONS;
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
  /** For labels originating in shared catalogs, never arbitrary user content. */
  label(value: string | null | undefined): string {
    if (!value) return '';
    if (value.startsWith('Denied actions:')) return this.text('error.permissionDenied');
    const normalized = value.replace(/\s+/g, ' ').trim();
    const key = SOURCE_LABEL_IDS.get(normalized);
    return key ? this.text(key) : value;
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

@Pipe({ name: 'uiLabel', standalone: true, pure: false })
export class UiLabelPipe implements PipeTransform {
  private readonly i18n = inject(I18nService);
  transform(value: string | null | undefined): string {
    return this.i18n.label(value);
  }
}

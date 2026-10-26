import { LABELS } from '../../../web/src/app/core/i18n/labels';
import type { Locale } from '../../../../packages/domain/src/models';
export function message(key: string, locale: Locale, args: Record<string, string> = {}): string {
  let text = (LABELS as Record<string, Record<Locale, string>>)[key]?.[locale] || key;
  for (const [name, value] of Object.entries(args)) text = text.replaceAll('{' + name + '}', value);
  return text;
}

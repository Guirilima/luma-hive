import { Locale, LOCALES } from '@domain/models';
import { LABELS } from './labels';
export { LABELS } from './labels';
export const MESSAGES = Object.fromEntries(
  LOCALES.map((locale) => [
    locale,
    Object.fromEntries(Object.entries(LABELS).map(([id, values]) => [id, values[locale]])),
  ]),
) as Record<Locale, Record<string, string>>;

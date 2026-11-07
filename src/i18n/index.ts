import type { Language } from '../types';
import { en, type StringKey } from './en';
import { partial } from './partial';

export type { StringKey };

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  bn: 'বাংলা',
  tl: 'Tagalog',
  ht: 'Kreyòl',
  pt: 'Português',
  ne: 'नेपाली',
  fr: 'Français',
};

/** Translate a UI string; falls back to English for any missing key. `{name}` placeholders are filled from vars. */
export function translate(lang: Language, key: StringKey, vars?: Record<string, string | number>): string {
  let s = partial[lang]?.[key] ?? en[key];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}

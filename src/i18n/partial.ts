import type { Language } from '../types';
import type { StringKey } from './en';

// Non-English UI strings. Missing keys fall back to English.
// Translations are filled in milestone 7 and need review by native speakers.
export const partial: Partial<Record<Language, Partial<Record<StringKey, string>>>> = {};

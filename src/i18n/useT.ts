import { useCallback } from 'react';
import { useProfile } from '../store/ProfileProvider';
import type { Language } from '../types';
import { translate, type StringKey } from './index';

export function useT(override?: Language) {
  const { profile } = useProfile();
  const lang = override ?? profile?.language ?? 'en';
  return useCallback(
    (key: StringKey, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang],
  );
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Profile } from '../types';

const KEY = 'reliefroute.profile.v1';

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  saveProfile: (p: Profile) => Promise<void>;
  clearProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileState | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setProfile(JSON.parse(raw) as Profile);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = useCallback(async (p: Profile) => {
    const next = { ...p, updatedAt: new Date().toISOString() };
    setProfile(next);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  }, []);

  const clearProfile = useCallback(async () => {
    setProfile(null);
    await AsyncStorage.removeItem(KEY);
  }, []);

  const value = useMemo(
    () => ({ profile, loading, saveProfile, clearProfile }),
    [profile, loading, saveProfile, clearProfile],
  );
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileState {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}

/** For screens that only render once onboarding is complete. */
export function useRequiredProfile(): Profile {
  const { profile } = useProfile();
  if (!profile) throw new Error('Profile required');
  return profile;
}

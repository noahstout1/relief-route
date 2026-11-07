import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import type { CountryData } from '../types';
import { parseGdacs, type DisasterAlert } from './alertParser';

const GDACS = 'https://www.gdacs.org/gdacsapi/api/events/geteventlist';
const LOOKBACK_DAYS = 21;
const cacheKey = (code: string) => `reliefroute.alerts.${code}`;

interface Cached {
  fetchedAt: string;
  alerts: DisasterAlert[];
}

async function getJson(url: string, timeoutMs = 15000): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json' } });
    if (res.status === 204) return { features: [] }; // GDACS: no events
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

const ymd = (d: Date) => d.toISOString().slice(0, 10);

/** Events in the country (GDACS `country` takes ISO2) plus current cyclones nearby offshore.
 *  Note: adding TS to eventlist makes GDACS return 204 for everything — keep it out. */
export async function fetchAlerts(country: CountryData): Promise<DisasterAlert[]> {
  const to = new Date();
  const from = new Date(to.getTime() - LOOKBACK_DAYS * 86400_000);
  const search =
    `${GDACS}/SEARCH?eventlist=TC;FL;EQ&alertlevel=Green;Orange;Red` +
    `&fromdate=${ymd(from)}&todate=${ymd(to)}&country=${country.code}`;
  const nearbyCyclones = `${GDACS}/MAP?eventtype=TC`;

  const [a, b] = await Promise.allSettled([getJson(search), getJson(nearbyCyclones)]);
  if (a.status === 'rejected' && b.status === 'rejected') throw a.reason;
  const features = [a, b].flatMap((r) =>
    r.status === 'fulfilled' ? ((r.value as { features?: unknown[] })?.features ?? []) : [],
  );
  return parseGdacs({ features }, country);
}

export interface AlertsState {
  alerts: DisasterAlert[];
  fetchedAt?: string;
  loading: boolean;
  offline: boolean; // true when showing cached data because the network failed
  refresh: () => void;
}

export function useAlerts(country: CountryData): AlertsState {
  const [alerts, setAlerts] = useState<DisasterAlert[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    const key = cacheKey(country.code);
    setLoading(true);
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(key);
        if (raw && alive) {
          const c = JSON.parse(raw) as Cached;
          setAlerts(c.alerts);
          setFetchedAt(c.fetchedAt);
        }
      } catch {}
      try {
        const fresh = await fetchAlerts(country);
        const c: Cached = { fetchedAt: new Date().toISOString(), alerts: fresh };
        if (!alive) return;
        setAlerts(fresh);
        setFetchedAt(c.fetchedAt);
        setOffline(false);
        AsyncStorage.setItem(key, JSON.stringify(c)).catch(() => {});
      } catch {
        if (alive) setOffline(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [country, tick]);

  const refresh = useCallback(() => setTick((x) => x + 1), []);
  return { alerts, fetchedAt, loading, offline, refresh };
}

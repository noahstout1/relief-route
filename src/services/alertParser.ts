// Pure parsing of GDACS GeoJSON event lists. No React / network here so it is easy to test.
import { distanceKm } from '../engine/geo';
import type { CountryData, HazardType } from '../types';

export type AlertLevel = 'Green' | 'Orange' | 'Red';

export interface DisasterAlert {
  id: string;
  hazard: HazardType;
  title: string;
  level: AlertLevel;
  current: boolean;
  from: string;
  to: string;
  url?: string;
  severity?: string;
  lat: number;
  lon: number;
  /** km from the nearest district centroid in the user's country */
  distanceKm: number;
  affectsCountry: boolean;
}

const TYPE_MAP: Record<string, HazardType> = { TC: 'cyclone', FL: 'flood', EQ: 'earthquake', TS: 'tsunami' };

/** How far away an event in a neighbouring country can be and still be shown. */
export const NEARBY_KM: Record<HazardType, number> = {
  cyclone: 1000,
  flood: 150,
  earthquake: 300,
  landslide: 100,
  tsunami: 2000,
};

interface GdacsFeature {
  geometry?: { type: string; coordinates: number[] };
  properties?: {
    eventtype?: string;
    eventid?: number;
    episodeid?: number;
    name?: string;
    alertlevel?: string;
    iscurrent?: string | boolean;
    fromdate?: string;
    todate?: string;
    url?: { report?: string };
    severitydata?: { severitytext?: string };
    affectedcountries?: { iso2?: string }[];
  };
}

export function parseGdacs(json: unknown, country: CountryData): DisasterAlert[] {
  const features = (json as { features?: GdacsFeature[] } | null)?.features;
  if (!Array.isArray(features)) return [];
  const byId = new Map<string, DisasterAlert>();

  for (const f of features) {
    const p = f.properties;
    const hazard = p?.eventtype ? TYPE_MAP[p.eventtype] : undefined;
    if (!p || !hazard || f.geometry?.type !== 'Point') continue;
    const [lon, lat] = f.geometry.coordinates;
    if (typeof lat !== 'number' || typeof lon !== 'number') continue;

    const affectsCountry = (p.affectedcountries ?? []).some((c) => c.iso2 === country.code);
    const dist = Math.min(...country.districts.map((d) => distanceKm({ lat, lon }, d)));
    if (!affectsCountry && dist > NEARBY_KM[hazard]) continue;

    const level = (['Green', 'Orange', 'Red'].includes(p.alertlevel ?? '') ? p.alertlevel : 'Green') as AlertLevel;
    const id = `${p.eventtype}-${p.eventid}`;
    const alert: DisasterAlert = {
      id,
      hazard,
      title: p.name ?? `${hazard} event`,
      level,
      current: p.iscurrent === true || p.iscurrent === 'true',
      from: p.fromdate ?? '',
      to: p.todate ?? '',
      url: p.url?.report,
      severity: p.severitydata?.severitytext,
      lat,
      lon,
      distanceKm: dist,
      affectsCountry,
    };
    // GDACS can return one feature per episode; keep the latest.
    const prev = byId.get(id);
    if (!prev || alert.to > prev.to) byId.set(id, alert);
  }

  const rank = { Red: 0, Orange: 1, Green: 2 };
  return [...byId.values()].sort(
    (a, b) => Number(b.current) - Number(a.current) || rank[a.level] - rank[b.level] || b.to.localeCompare(a.to),
  );
}

/** The most serious current Orange/Red alert, if any — drives the home-screen banner. */
export function topAlert(alerts: DisasterAlert[]): DisasterAlert | undefined {
  return alerts.find((a) => a.current && a.level !== 'Green');
}

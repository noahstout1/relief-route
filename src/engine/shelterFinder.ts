import type { CountryData, Flag, HazardType, LatLon, Shelter, ShelterFeature } from '../types';
import { distanceKm } from './geo';

export interface RankedShelter {
  shelter: Shelter;
  distanceKm: number;
  missing: ShelterFeature[]; // features this household needs that the shelter lacks
}

/** Penalty, in km-equivalents, for each needed feature a shelter lacks. */
const MISSING_PENALTY_KM = 15;

export function neededFeatures(flags: Set<Flag>): ShelterFeature[] {
  const out: ShelterFeature[] = [];
  if (flags.has('mobility')) out.push('wheelchair');
  if (flags.has('power_dependent')) out.push('power');
  if (flags.has('power_dependent') || flags.has('pregnant') || flags.has('medication')) out.push('medical');
  if (flags.has('pets')) out.push('pets');
  if (flags.has('livestock')) out.push('livestock');
  return out;
}

export function findShelters(
  country: CountryData,
  origin: LatLon,
  flags: Set<Flag>,
  opts: { hazard?: HazardType; suitableOnly?: boolean; limit?: number; maxKm?: number } = {},
): RankedShelter[] {
  const needs = neededFeatures(flags);
  const ranked = country.shelters
    .filter((s) => !opts.hazard || s.hazards.includes(opts.hazard))
    .map((shelter) => ({
      shelter,
      distanceKm: distanceKm(origin, shelter),
      missing: needs.filter((n) => !shelter.features.includes(n)),
    }))
    .filter((r) => !opts.suitableOnly || r.missing.length === 0)
    .filter((r) => opts.maxKm === undefined || r.distanceKm <= opts.maxKm)
    .sort((a, b) => a.distanceKm + a.missing.length * MISSING_PENALTY_KM - (b.distanceKm + b.missing.length * MISSING_PENALTY_KM));
  return opts.limit ? ranked.slice(0, opts.limit) : ranked;
}

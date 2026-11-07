import type { Condition, District, Flag, Profile } from '../types';

export function householdSize(p: Profile): number {
  const h = p.household;
  return h.adults + h.children + h.infants + h.elderly;
}

/** Turn a profile + its district into a set of facts used for matching guidance, shelters and programs. */
export function deriveFlags(p: Profile, district?: District): Set<Flag> {
  const f = new Set<Flag>();
  const h = p.household;
  const home = p.home;
  const size = householdSize(p);

  if (h.children > 0) f.add('children');
  if (h.infants > 0) f.add('infants');
  if (h.elderly > 0) f.add('elderly');
  if (h.pregnant) f.add('pregnant');
  if (h.mobilityImpaired) f.add('mobility');
  if (h.needsMedication) f.add('medication');
  if (h.powerDependent) f.add('power_dependent');
  if (h.pets) f.add('pets');
  if (h.livestock) f.add('livestock');
  if (size >= 6) f.add('large_household');
  if (size === 1) f.add('lives_alone');

  if (['mud', 'tin', 'tent', 'wood'].includes(home.homeType)) f.add('weak_home');
  f.add(home.floors > 1 ? 'multi_floor' : 'single_floor');
  if (home.nearCoast) f.add('coastal');
  if (home.nearRiver) f.add('near_river');
  if (home.onSlope) f.add('slope');
  f.add(home.hasVehicle ? 'vehicle' : 'no_vehicle');

  if (district?.floodProne) f.add('flood_prone');
  if (district?.landslideProne) f.add('landslide_prone');
  if (district?.seismic === 'high') f.add('seismic_high');

  return f;
}

export function matches(cond: Condition | undefined, flags: Set<Flag>): boolean {
  if (!cond) return true;
  if (cond.all && !cond.all.every((x) => flags.has(x))) return false;
  if (cond.any && cond.any.length > 0 && !cond.any.some((x) => flags.has(x))) return false;
  if (cond.none && cond.none.some((x) => flags.has(x))) return false;
  return true;
}

export const VULNERABLE: Flag[] = ['infants', 'elderly', 'mobility', 'pregnant', 'power_dependent'];

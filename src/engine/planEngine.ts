import type {
  Agency,
  CountryData,
  DecisionLevel,
  Flag,
  GuidanceAction,
  GuidanceData,
  HazardType,
  KitItem,
  LatLon,
  Phase,
  Profile,
  ReliefProgram,
} from '../types';
import { deriveFlags, matches, VULNERABLE } from './flags';
import { findShelters, type RankedShelter } from './shelterFinder';

export interface Decision {
  level: DecisionLevel;
  score: number;
  reasons: string[];
}

export interface Plan {
  hazard: HazardType;
  decision: Decision;
  phases: { phase: Phase; actions: GuidanceAction[] }[];
  kit: KitItem[];
  shelters: RankedShelter[];
  agencies: Agency[];
  programs: ReliefProgram[];
  flags: Set<Flag>;
  origin: LatLon;
}

const PHASE_ORDER: Phase[] = ['prepare', 'evacuate', 'during', 'after'];

type Rule = { flag: Flag | Flag[]; points: number; reason: string };

/** Per-hazard risk rules. A rule with a flag array scores if ANY flag is present. */
const RULES: Record<HazardType, { rules: Rule[]; evacuateAt: number; readyAt: number; lowRisk: string }> = {
  cyclone: {
    rules: [
      { flag: 'coastal', points: 3, reason: 'You live near the coast, where storm surge (sea flooding) is the deadliest danger.' },
      { flag: 'weak_home', points: 3, reason: 'Your house type may not survive cyclone winds.' },
      { flag: 'flood_prone', points: 1, reason: 'Your area floods easily in heavy rain.' },
      { flag: VULNERABLE, points: 1, reason: 'Someone in your family needs extra time or help to move.' },
    ],
    evacuateAt: 4,
    readyAt: 2,
    lowRisk: 'Your home is relatively strong and away from the coast. Prepare, stay indoors, and follow official warnings.',
  },
  flood: {
    rules: [
      { flag: 'near_river', points: 2, reason: 'You live near a river or canal that can overflow quickly.' },
      { flag: 'flood_prone', points: 2, reason: 'Your district is flood-prone.' },
      { flag: 'single_floor', points: 1, reason: 'Your home has only one floor — there is no higher place to go.' },
      { flag: 'weak_home', points: 1, reason: 'Your house may be damaged by standing water.' },
      { flag: VULNERABLE, points: 1, reason: 'Someone in your family needs extra time or help to move.' },
    ],
    evacuateAt: 5,
    readyAt: 3,
    lowRisk: 'Your flood risk looks low. Keep food and documents high and follow official warnings.',
  },
  earthquake: {
    rules: [
      { flag: 'weak_home', points: 2, reason: 'Your house type is more likely to be damaged in strong shaking.' },
      { flag: 'seismic_high', points: 1, reason: 'Your area has high earthquake risk.' },
      { flag: 'slope', points: 1, reason: 'Hillside homes face landslides after earthquakes.' },
      { flag: 'coastal', points: 1, reason: 'Strong earthquakes near the coast can cause a tsunami.' },
    ],
    evacuateAt: 3,
    readyAt: 2,
    lowRisk: 'There is no warning before an earthquake. Practise Drop, Cover, Hold On and know your nearest open space.',
  },
  landslide: {
    rules: [
      { flag: 'slope', points: 3, reason: 'Your home is on or below a slope.' },
      { flag: 'landslide_prone', points: 2, reason: 'Landslides have happened in your district.' },
      { flag: 'weak_home', points: 1, reason: 'Your house may not resist moving earth.' },
      { flag: VULNERABLE, points: 1, reason: 'Someone in your family needs extra time or help to move.' },
    ],
    evacuateAt: 4,
    readyAt: 2,
    lowRisk: 'Your home is not on a slope. Avoid steep roads and river banks during heavy rain.',
  },
  tsunami: {
    rules: [{ flag: 'coastal', points: 5, reason: 'You live near the coast. A tsunami can arrive within minutes.' }],
    evacuateAt: 5,
    readyAt: 5,
    lowRisk: 'You are not near the coast, so tsunami risk is low. Stay away from beaches after strong earthquakes.',
  },
};

export function decide(hazard: HazardType, flags: Set<Flag>, profile?: Profile): Decision {
  const cfg = RULES[hazard];
  let score = 0;
  const reasons: string[] = [];
  for (const r of cfg.rules) {
    const list = Array.isArray(r.flag) ? r.flag : [r.flag];
    if (list.some((f) => flags.has(f))) {
      score += r.points;
      reasons.push(r.reason);
    }
  }
  // Unreinforced brick is a particular earthquake risk even though it is fine in wind.
  if (hazard === 'earthquake' && profile?.home.homeType === 'brick' && !flags.has('weak_home')) {
    score += 1;
    reasons.push('Brick houses without steel reinforcement can crack or collapse in strong shaking.');
  }
  const level: DecisionLevel = score >= cfg.evacuateAt ? 'evacuate' : score >= cfg.readyAt ? 'get_ready' : 'stay';
  if (reasons.length === 0) reasons.push(cfg.lowRisk);
  return { level, score, reasons };
}

const AGENCY_ORDER: Agency['kind'][] = ['warning', 'government', 'red_cross', 'un', 'ngo'];

export function buildPlan(profile: Profile, country: CountryData, guidance: GuidanceData, hazard: HazardType): Plan {
  const district = country.districts.find((d) => d.id === profile.home.districtId);
  const flags = deriveFlags(profile, district);
  const origin: LatLon = profile.location ?? district ?? country.districts[0];

  const actions = guidance.actions
    .filter((a) => (a.hazard === 'any' || a.hazard === hazard) && matches(a.when, flags))
    .sort((a, b) => a.priority - b.priority || (a.hazard === 'any' ? 1 : 0) - (b.hazard === 'any' ? 1 : 0));

  const phases = PHASE_ORDER.map((phase) => ({ phase, actions: actions.filter((a) => a.phase === phase) })).filter(
    (p) => p.actions.length > 0,
  );

  const kit = guidance.kit.filter((k) => (!k.hazard || k.hazard.includes(hazard)) && matches(k.when, flags));

  const agencies = country.agencies
    .filter((a) => !a.hazards || a.hazards.includes(hazard))
    .sort((a, b) => AGENCY_ORDER.indexOf(a.kind) - AGENCY_ORDER.indexOf(b.kind));

  const programs = country.programs.filter((p) => matches(p.eligibility, flags));

  return {
    hazard,
    decision: decide(hazard, flags, profile),
    phases,
    kit,
    shelters: findShelters(country, origin, flags, { hazard, limit: 3 }),
    agencies,
    programs,
    flags,
    origin,
  };
}

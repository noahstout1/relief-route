import { COUNTRIES, COUNTRY_LIST, GUIDANCE } from '../../data';
import { defaultProfile } from '../../store/defaults';
import type { Profile } from '../../types';
import { deriveFlags, matches } from '../flags';
import { distanceKm } from '../geo';
import { buildPlan, decide } from '../planEngine';
import { findShelters } from '../shelterFinder';

function profile(patch: { country?: Profile['countryCode']; household?: Partial<Profile['household']>; home?: Partial<Profile['home']> }): Profile {
  const p = defaultProfile(patch.country ?? 'BD');
  return { ...p, household: { ...p.household, ...patch.household }, home: { ...p.home, ...patch.home } };
}

describe('geo', () => {
  it('computes great-circle distance', () => {
    // Dhaka → Chattogram is roughly 215 km as the crow flies
    const d = distanceKm({ lat: 23.81, lon: 90.41 }, { lat: 22.36, lon: 91.78 });
    expect(d).toBeGreaterThan(200);
    expect(d).toBeLessThan(230);
  });
});

describe('flags', () => {
  it('derives household and home flags', () => {
    const p = profile({ household: { infants: 1, elderly: 1 }, home: { districtId: 'bd-coxs', homeType: 'mud', nearCoast: true } });
    const f = deriveFlags(p, COUNTRIES.BD.districts.find((d) => d.id === 'bd-coxs'));
    expect([...f]).toEqual(expect.arrayContaining(['infants', 'elderly', 'weak_home', 'coastal', 'flood_prone', 'single_floor']));
    expect(f.has('lives_alone')).toBe(false);
  });

  it('matches all / any / none conditions', () => {
    const f = new Set(['coastal', 'infants'] as const);
    expect(matches({ any: ['infants', 'elderly'] }, f as never)).toBe(true);
    expect(matches({ all: ['coastal', 'elderly'] }, f as never)).toBe(false);
    expect(matches({ none: ['coastal'] }, f as never)).toBe(false);
    expect(matches(undefined, f as never)).toBe(true);
  });
});

describe('decision', () => {
  it('tells a coastal family in a mud house with a baby and grandparent to evacuate for a cyclone', () => {
    const p = profile({ household: { adults: 2, infants: 1, elderly: 1 }, home: { districtId: 'bd-coxs', homeType: 'mud', nearCoast: true } });
    const plan = buildPlan(p, COUNTRIES.BD, GUIDANCE, 'cyclone');
    expect(plan.decision.level).toBe('evacuate');
    const ids = plan.phases.flatMap((ph) => ph.actions.map((a) => a.id));
    expect(ids).toEqual(expect.arrayContaining(['cy-weak-leave', 'cy-coastal-surge', 'cy-early', 'any-kids-id', 'any-infant']));
    expect(plan.kit.map((k) => k.id)).toEqual(expect.arrayContaining(['k-baby', 'k-elder']));
  });

  it('tells an inland concrete multi-storey household it can stay for a flood', () => {
    const p = profile({ country: 'NP', home: { districtId: 'np-ktm', homeType: 'concrete', floors: 3, nearCoast: false } });
    const d = decide('flood', deriveFlags(p, COUNTRIES.NP.districts[0]));
    expect(d.level).toBe('stay');
    expect(d.reasons.length).toBeGreaterThan(0);
  });

  it('flags unreinforced brick as an earthquake risk', () => {
    const p = profile({ country: 'NP', home: { districtId: 'np-ktm', homeType: 'brick' } });
    const plan = buildPlan(p, COUNTRIES.NP, GUIDANCE, 'earthquake');
    expect(plan.decision.level).toBe('get_ready');
    expect(plan.decision.reasons.join(' ')).toMatch(/Brick/);
  });

  it('never tells inland households to evacuate for a tsunami', () => {
    const p = profile({ country: 'NP', home: { districtId: 'np-ktm', nearCoast: false } });
    expect(buildPlan(p, COUNTRIES.NP, GUIDANCE, 'tsunami').decision.level).toBe('stay');
  });

  it('includes wheelchair-specific earthquake guidance only when needed', () => {
    const base = profile({ country: 'HT', home: { districtId: 'ht-pap' } });
    const withChair = profile({ country: 'HT', household: { mobilityImpaired: true }, home: { districtId: 'ht-pap' } });
    const ids = (p: Profile) => buildPlan(p, COUNTRIES.HT, GUIDANCE, 'earthquake').phases.flatMap((ph) => ph.actions.map((a) => a.id));
    expect(ids(base)).not.toContain('eq-mobility');
    expect(ids(withChair)).toContain('eq-mobility');
    expect(ids(base)).toContain('eq-during');
  });
});

describe('shelters', () => {
  it('prefers a slightly farther shelter that meets medical + wheelchair needs', () => {
    const p = profile({ household: { mobilityImpaired: true, powerDependent: true }, home: { districtId: 'bd-coxs' } });
    const flags = deriveFlags(p);
    const origin = COUNTRIES.BD.districts.find((d) => d.id === 'bd-coxs')!;
    const [best] = findShelters(COUNTRIES.BD, origin, flags, { hazard: 'cyclone' });
    expect(best.shelter.id).toBe('bd-s2');
    expect(best.missing).toEqual([]);
  });

  it('reports missing features instead of hiding far-better-located shelters', () => {
    const p = profile({ household: { mobilityImpaired: true }, home: { districtId: 'bd-ctg' } });
    const origin = COUNTRIES.BD.districts.find((d) => d.id === 'bd-ctg')!;
    const [best] = findShelters(COUNTRIES.BD, origin, deriveFlags(p), { hazard: 'cyclone' });
    expect(best.shelter.id).toBe('bd-s3');
    expect(best.missing).toEqual(['wheelchair']);
    expect(findShelters(COUNTRIES.BD, origin, deriveFlags(p), { hazard: 'cyclone', suitableOnly: true })[0].missing).toEqual([]);
  });

  it('only returns shelters suitable for the hazard', () => {
    const origin = COUNTRIES.BD.districts[0];
    const res = findShelters(COUNTRIES.BD, origin, new Set(), { hazard: 'earthquake' });
    expect(res.length).toBeGreaterThan(0);
    for (const r of res) expect(r.shelter.hazards).toContain('earthquake');
  });

  it('suggests only programs the household is eligible for', () => {
    const plain = profile({ home: { homeType: 'concrete' } });
    const vulnerable = profile({ household: { infants: 1, livestock: true }, home: { homeType: 'tin' } });
    const ids = (p: Profile) => buildPlan(p, COUNTRIES.BD, GUIDANCE, 'flood').programs.map((x) => x.id);
    expect(ids(plain)).toEqual(['bd-gr']);
    expect(ids(vulnerable)).toEqual(expect.arrayContaining(['bd-gr', 'bd-housing', 'bd-bdrcs-cash', 'bd-livestock']));
  });
});

describe('data integrity', () => {
  it.each(COUNTRY_LIST.map((c) => [c.code, c] as const))('%s has consistent references', (_code, c) => {
    const districtIds = new Set(c.districts.map((d) => d.id));
    expect(c.districts.length).toBeGreaterThan(0);
    for (const s of c.shelters) {
      expect(districtIds.has(s.districtId)).toBe(true);
      expect(Math.abs(s.lat)).toBeLessThanOrEqual(90);
      expect(Math.abs(s.lon)).toBeLessThanOrEqual(180);
    }
    const ids = [...c.shelters, ...c.agencies, ...c.programs, ...c.districts].map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
    // every country hazard should have at least one shelter
    for (const h of c.hazards.filter((h) => h !== 'tsunami')) {
      expect(c.shelters.some((s) => s.hazards.includes(h))).toBe(true);
    }
  });

  it('has unique guidance ids', () => {
    const ids = [...GUIDANCE.actions, ...GUIDANCE.kit].map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

import { COUNTRIES } from '../../data';
import { parseGdacs, topAlert } from '../alertParser';

const feature = (over: Record<string, unknown>, coords: [number, number]) => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates: coords },
  properties: {
    eventtype: 'TC',
    eventid: 1,
    name: 'Tropical Cyclone TEST',
    alertlevel: 'Green',
    iscurrent: 'true',
    fromdate: '2026-11-01T00:00:00',
    todate: '2026-11-02T00:00:00',
    affectedcountries: [],
    ...over,
  },
});

describe('parseGdacs', () => {
  it('keeps events in the country and nearby cyclones, drops far-away ones', () => {
    const json = {
      features: [
        feature({ eventid: 1, eventtype: 'EQ', name: 'Earthquake in Philippines', affectedcountries: [{ iso2: 'PH' }] }, [125.1, 5.3]),
        feature({ eventid: 2, name: 'Offshore cyclone' }, [130, 12]), // ~550 km east of Leyte
        feature({ eventid: 3, eventtype: 'FL', name: 'Flood in Brazil', affectedcountries: [{ iso2: 'BR' }] }, [-47, -15]),
        feature({ eventid: 4, eventtype: 'XX', name: 'Unknown type' }, [125, 11]),
      ],
    };
    const out = parseGdacs(json, COUNTRIES.PH);
    expect(out.map((a) => a.title).sort()).toEqual(['Earthquake in Philippines', 'Offshore cyclone']);
    expect(out.find((a) => a.title === 'Offshore cyclone')!.affectsCountry).toBe(false);
  });

  it('dedupes episodes, keeping the latest', () => {
    const json = {
      features: [
        feature({ episodeid: 1, alertlevel: 'Green', todate: '2026-11-01T00:00:00', affectedcountries: [{ iso2: 'BD' }] }, [91, 21]),
        feature({ episodeid: 2, alertlevel: 'Red', todate: '2026-11-03T00:00:00', affectedcountries: [{ iso2: 'BD' }] }, [91, 21]),
      ],
    };
    const out = parseGdacs(json, COUNTRIES.BD);
    expect(out).toHaveLength(1);
    expect(out[0].level).toBe('Red');
    expect(topAlert(out)?.hazard).toBe('cyclone');
  });

  it('handles empty / malformed responses', () => {
    expect(parseGdacs(null, COUNTRIES.BD)).toEqual([]);
    expect(parseGdacs({}, COUNTRIES.BD)).toEqual([]);
    expect(topAlert([])).toBeUndefined();
  });
});

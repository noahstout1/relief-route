import { getLocales } from 'expo-localization';
import type { CountryCode, Language, Profile } from '../types';
import { COUNTRIES } from '../data';

const SUPPORTED: Language[] = ['en', 'bn', 'tl', 'ht', 'pt', 'ne', 'fr'];
const REGION_TO_COUNTRY: Record<string, CountryCode> = { BD: 'BD', PH: 'PH', HT: 'HT', MZ: 'MZ', NP: 'NP' };

/** Best guess at language + country from the phone's settings; safe to call in tests. */
export function deviceDefaults(): { language: Language; countryCode?: CountryCode } {
  try {
    const loc = getLocales()[0];
    const lang = (loc?.languageCode ?? 'en') as Language;
    return {
      language: SUPPORTED.includes(lang) ? lang : 'en',
      countryCode: loc?.regionCode ? REGION_TO_COUNTRY[loc.regionCode] : undefined,
    };
  } catch {
    return { language: 'en' };
  }
}

export function defaultProfile(countryCode: CountryCode = 'BD', language: Language = 'en'): Profile {
  const country = COUNTRIES[countryCode];
  return {
    countryCode,
    language,
    household: {
      adults: 1,
      children: 0,
      infants: 0,
      elderly: 0,
      pregnant: false,
      mobilityImpaired: false,
      needsMedication: false,
      powerDependent: false,
      pets: false,
      livestock: false,
    },
    home: {
      districtId: country.districts[0].id,
      homeType: 'brick',
      floors: 1,
      nearRiver: false,
      nearCoast: country.districts[0].coastal,
      onSlope: false,
      hasVehicle: false,
    },
    emergencyContacts: [],
    updatedAt: new Date().toISOString(),
  };
}

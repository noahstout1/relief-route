import type { CountryCode, CountryData, District, GuidanceData } from '../types';
import bd from './countries/bd.json';
import ht from './countries/ht.json';
import mz from './countries/mz.json';
import np from './countries/np.json';
import ph from './countries/ph.json';
import guidanceJson from './guidance.json';

export const COUNTRIES: Record<CountryCode, CountryData> = {
  BD: bd as CountryData,
  PH: ph as CountryData,
  HT: ht as CountryData,
  MZ: mz as CountryData,
  NP: np as CountryData,
};

export const COUNTRY_LIST: CountryData[] = Object.values(COUNTRIES);

export const GUIDANCE = guidanceJson as GuidanceData;

export function getCountry(code: CountryCode): CountryData {
  return COUNTRIES[code];
}

export function getDistrict(code: CountryCode, districtId: string): District | undefined {
  return COUNTRIES[code]?.districts.find((d) => d.id === districtId);
}

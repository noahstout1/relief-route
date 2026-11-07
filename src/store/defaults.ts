import type { CountryCode, Profile } from '../types';
import { COUNTRIES } from '../data';

export function defaultProfile(countryCode: CountryCode = 'BD'): Profile {
  const country = COUNTRIES[countryCode];
  return {
    countryCode,
    language: 'en',
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

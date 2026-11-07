// Shared domain types for ReliefRoute. Keep this file free of React/RN imports.

export type HazardType = 'cyclone' | 'flood' | 'earthquake' | 'landslide' | 'tsunami';

export type HomeType = 'concrete' | 'brick' | 'wood' | 'mud' | 'tin' | 'tent';

export type CountryCode = 'BD' | 'PH' | 'HT' | 'MZ' | 'NP';

export type Language = 'en' | 'bn' | 'tl' | 'ht' | 'pt' | 'ne' | 'fr';

/** Derived facts about a person's situation, used to match guidance, shelters and programs. */
export type Flag =
  | 'children'
  | 'infants'
  | 'elderly'
  | 'pregnant'
  | 'mobility'
  | 'medication'
  | 'power_dependent'
  | 'pets'
  | 'livestock'
  | 'large_household'
  | 'weak_home'
  | 'single_floor'
  | 'multi_floor'
  | 'coastal'
  | 'flood_prone'
  | 'near_river'
  | 'slope'
  | 'landslide_prone'
  | 'seismic_high'
  | 'vehicle'
  | 'no_vehicle'
  | 'lives_alone';

/** A rule on flags. All listed `all` flags must be present, at least one `any`, and no `none`. */
export interface Condition {
  all?: Flag[];
  any?: Flag[];
  none?: Flag[];
}

export interface Household {
  adults: number;
  children: number; // ages 2–17
  infants: number; // under 2
  elderly: number; // 65+
  pregnant: boolean;
  mobilityImpaired: boolean;
  needsMedication: boolean;
  powerDependent: boolean; // oxygen, dialysis, other powered medical devices
  pets: boolean;
  livestock: boolean;
}

export interface Home {
  districtId: string;
  homeType: HomeType;
  floors: number;
  nearRiver: boolean;
  nearCoast: boolean;
  onSlope: boolean;
  hasVehicle: boolean;
}

export interface EmergencyContact {
  name: string;
  phone: string;
}

export interface LatLon {
  lat: number;
  lon: number;
}

export interface Profile {
  name?: string;
  countryCode: CountryCode;
  language: Language;
  household: Household;
  home: Home;
  emergencyContacts: EmergencyContact[];
  location?: LatLon; // optional GPS fix; falls back to district centroid
  updatedAt: string;
}

export interface District extends LatLon {
  id: string;
  name: string;
  region: string;
  coastal: boolean;
  floodProne: boolean;
  landslideProne: boolean;
  seismic: 'high' | 'moderate' | 'low';
}

export type ShelterFeature =
  | 'wheelchair'
  | 'medical'
  | 'pets'
  | 'livestock'
  | 'women_space'
  | 'water'
  | 'power';

export interface Shelter extends LatLon {
  id: string;
  name: string;
  districtId: string;
  kind: 'cyclone_shelter' | 'school' | 'evacuation_center' | 'open_space' | 'community_hall';
  capacity?: number;
  features: ShelterFeature[];
  hazards: HazardType[]; // hazards this site is suitable for
  verified: boolean; // false = sample/seed entry; must be checked with local authorities
  phone?: string;
}

export interface Agency {
  id: string;
  name: string;
  shortName?: string;
  kind: 'government' | 'red_cross' | 'un' | 'ngo' | 'warning';
  description: string;
  phone?: string;
  website?: string;
  hazards?: HazardType[]; // if set, most relevant for these hazards
}

export interface ReliefProgram {
  id: string;
  name: string;
  provider: string;
  description: string;
  howToApply: string;
  eligibility: Condition; // empty = open to everyone affected
  phone?: string;
  website?: string;
}

export interface EmergencyNumbers {
  general?: string;
  police?: string;
  ambulance?: string;
  fire?: string;
  disaster?: string;
}

export interface CountryData {
  code: CountryCode;
  name: string;
  flag: string;
  languages: Language[];
  lastVerified: string;
  hazards: HazardType[];
  emergencyNumbers: EmergencyNumbers;
  warningSystem?: string; // how official warnings are communicated locally
  agencies: Agency[];
  programs: ReliefProgram[];
  districts: District[];
  shelters: Shelter[];
}

export type Phase = 'prepare' | 'evacuate' | 'during' | 'after';

export interface GuidanceAction {
  id: string;
  hazard: HazardType | 'any';
  phase: Phase;
  priority: 1 | 2 | 3; // 1 = most urgent
  title: string;
  detail: string;
  when?: Condition;
}

export interface KitItem {
  id: string;
  label: string;
  hazard?: HazardType[];
  when?: Condition;
}

export interface GuidanceData {
  actions: GuidanceAction[];
  kit: KitItem[];
}

export type DecisionLevel = 'evacuate' | 'get_ready' | 'stay';

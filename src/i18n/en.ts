export const en = {
  appName: 'ReliefRoute',
  tagline: 'Know where to go and what to do when disaster strikes.',
  next: 'Next',
  back: 'Back',
  save: 'Save',
  finish: 'Create my plan',
  yes: 'Yes',
  no: 'No',

  // onboarding
  stepWhere: 'Where do you live?',
  stepHousehold: 'Who lives with you?',
  stepHome: 'About your home',
  stepContacts: 'Emergency contacts',
  country: 'Country',
  district: 'District / area',
  language: 'Language',
  useGps: 'Use my current location',
  gpsSet: 'Location saved',
  gpsDenied: 'Location permission denied. We will use your district instead.',
  adults: 'Adults (18–64)',
  children: 'Children (2–17)',
  infants: 'Babies (under 2)',
  elderly: 'Older people (65+)',
  pregnant: 'Someone is pregnant',
  mobility: 'Someone cannot walk far or uses a wheelchair',
  medication: 'Someone needs daily medicine',
  powerDependent: 'Someone needs powered medical equipment',
  pets: 'We have pets',
  livestock: 'We have livestock (cows, goats, chickens…)',
  homeType: 'What is your house made of?',
  floors: 'Number of floors',
  nearRiver: 'Near a river or canal',
  nearCoast: 'Near the sea / coast',
  onSlope: 'On or below a hillside',
  hasVehicle: 'We have a vehicle (car, motorbike, boat)',
  contactName: 'Name',
  contactPhone: 'Phone',
  addContact: 'Add contact',
  privacyNote: 'Your information stays on this phone. It is never uploaded.',

  // home types
  home_concrete: 'Concrete',
  home_brick: 'Brick',
  home_wood: 'Wood',
  home_mud: 'Mud / earth',
  home_tin: 'Tin / sheet metal',
  home_tent: 'Tent / tarpaulin',

  // tabs
  tabHome: 'Home',
  tabPlan: 'My plan',
  tabHelp: 'Get help',
  tabProfile: 'Profile',

  // hazards
  hz_cyclone: 'Cyclone / typhoon',
  hz_flood: 'Flood',
  hz_earthquake: 'Earthquake',
  hz_landslide: 'Landslide',
  hz_tsunami: 'Tsunami',

  // decision
  dec_evacuate: 'Evacuate',
  dec_get_ready: 'Get ready to leave',
  dec_stay: 'Stay and prepare',
  whyThis: 'Why',

  // phases
  ph_prepare: 'Prepare now',
  ph_evacuate: 'When a warning comes',
  ph_during: 'During',
  ph_after: 'After',

  // plan
  chooseHazard: 'Choose a disaster',
  yourShelter: 'Your best shelter',
  goBag: 'Go-bag checklist',
  programsForYou: 'Programs for you',
  howToApply: 'How to apply',
  noShelter: 'No suitable shelter in our data for this area. Ask your local authority.',
  kmAway: '{km} km away',
  missing: 'Missing: {list}',
  directions: 'Directions',
  call: 'Call',

  // home
  greeting: 'Your area: {district}',
  liveAlerts: 'Disaster alerts',
  noAlerts: 'No active alerts found for {country}.',
  offlineAlerts: 'Offline — showing alerts saved {time}.',
  alertsUnavailable: 'Alerts unavailable offline. Your plan still works.',
  whatToDo: 'What should I do?',
  emergencyNumbers: 'Emergency numbers',
  warningSystem: 'How warnings work here',

  // help
  shelters: 'Shelters near you',
  agencies: 'Agencies and organisations',
  website: 'Website',
  sampleData: 'Sample data — confirm shelter locations with local authorities.',
  dataVerified: 'Data last reviewed {date}',
  filterSuitable: 'Only show shelters suitable for my family',

  // profile
  editProfile: 'Edit profile',
  resetProfile: 'Delete my data',
  resetConfirm: 'This deletes your profile from this phone.',
  householdSummary: '{n} people',
};

export type StringKey = keyof typeof en;

# ReliefRoute

**Know where to go and what to do when disaster strikes.**

ReliefRoute is an offline-first mobile app (React Native / Expo) that helps people in disaster-prone,
under-resourced countries prepare for and respond to natural disasters — cyclones, floods, earthquakes,
landslides. It connects people with government disaster agencies and relief programs, and builds a
personalized plan from their household and home.

## Features (v1)
- Personalized profile: country, district, household members & needs, home type and exposure
- Clear decision for each hazard: evacuate or shelter in place, with a prioritized checklist
- Nearest suitable shelter (accessibility, medical, pets), tap-to-call hotlines, open directions
- Government agencies and relief programs you may be eligible for
- Live disaster alerts (GDACS, ReliefWeb) when online, cached for offline use
- Seed data: Bangladesh, Philippines, Haiti, Mozambique, Nepal

> ⚠️ Shelter and contact data in this repository is sample/seed data. Always follow instructions
> from your local authorities.

## How personalization works
1. Your profile (household + home + district) is turned into *flags* — e.g. `infants`, `mobility`, `weak_home`, `coastal`, `flood_prone`.
2. Per-hazard risk rules score those flags into a decision: **Evacuate**, **Get ready to leave**, or **Stay and prepare**, with the reasons shown.
3. Guidance actions, go-bag items and relief programs are filtered by the same flags.
4. Shelters are ranked by distance plus a penalty for each feature your family needs that the shelter lacks (wheelchair access, medical care, power, pets, livestock).

Your data never leaves the phone.

## Run it
```bash
npm install
npx expo start
```
Scan the QR code with Expo Go, or press `w` for web.

## Test
```bash
npm test
npm run typecheck
```

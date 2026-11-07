# ReliefRoute — project memory

@AGENTS.md

## What this is
A React Native (Expo) app for disaster relief in under-resourced countries. It connects people to
government disaster agencies and relief programs, and gives each person a **personalized action plan**
for a natural disaster based on their household (children, elderly, disability, pregnancy, medical
needs, pets/livestock) and their home (district, building type, floor, flood/coastal exposure).

Design priorities, in order:
1. **Offline-first.** Everything except live alerts must work with no network (bundled JSON data).
2. **Low-end Android phones.** Few dependencies, no heavy maps SDK, small bundle.
3. **Clarity under stress.** Big text, one clear decision ("Evacuate now" / "Stay and prepare"), icons, plain language.
4. **Trustworthy data.** Every dataset carries `lastVerified`; sample shelters are flagged as needing local verification.

## Stack
- Expo SDK 58, React Native 0.88, TypeScript (strict), Expo Router (routes in `src/app/`)
- AsyncStorage for profile + cached alerts; expo-location (optional GPS); expo-linking (calls, maps)
- Jest via `jest-expo` for unit tests
- Repo: https://github.com/noahstout1/relief-route (public)

## Commands
Node was installed via winget; in a fresh PowerShell, refresh PATH first:
`$env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")`
(Git Bash: `export PATH="/c/Program Files/nodejs:$PATH"`)

```
npm install
npx expo start          # dev server (press w for web, or scan QR with Expo Go)
npm test                # jest
npm run typecheck       # tsc --noEmit
npx expo install <pkg>  # always use this to add deps
```

## Layout
```
src/app/            routes only (expo-router)
  _layout.tsx       root stack; redirects to onboarding if no profile
  onboarding/       country/district → household → home → review
  (tabs)/           index (alerts + decision), plan, help (shelters/agencies), profile
src/data/           bundled offline data (countries/*.json, guidance.json)
src/engine/         pure logic: planEngine.ts, shelterFinder.ts (unit tested)
src/services/       alerts.ts (GDACS + ReliefWeb, cached)
src/store/          ProfileProvider (context + AsyncStorage)
src/components/     shared UI
src/i18n/           tiny t() helper + string tables
src/types.ts        shared types
```

## Conventions
- Keep engine code pure (no React / RN imports) so it is easy to test.
- Guidance is data-driven: add actions in `src/data/guidance.json`, not in components.
- Adding a country = add `src/data/countries/<iso2>.json` and register it in `src/data/index.ts`.
- Commit and push to GitHub after each feature milestone.

## Status / roadmap
- [x] 1. Scaffold Expo app + CLAUDE.md + README
- [x] 2. Types + offline seed data (5 countries) + guidance templates
- [x] 3. Profile store (AsyncStorage) + 4-step onboarding + editable Profile tab
- [x] 4. Plan engine (flags → risk rules → decision, guidance, kit, shelters, programs) + 18 Jest tests + Plan tab
- [x] 5. Help tab: tap-to-call emergency numbers, ranked shelters w/ suitability filter, agencies, directions
- [x] 6. Live GDACS alerts (country + nearby offshore cyclones), AsyncStorage cache, Home tab with urgent banner
- [ ] 7. i18n + accessibility polish

## Decisions log
- 2026-11-07: Expo + TS chosen; bundled offline data + live GDACS/ReliefWeb alerts; seed countries
  Bangladesh (BD), Philippines (PH), Haiti (HT), Mozambique (MZ), Nepal (NP). No backend in v1.
- 2026-11-07: Reordered milestones 2/3 — data layer landed before onboarding because the country/district
  pickers depend on it. Phone numbers only included where well-known; others left blank rather than guessed.
  All shelters are `verified: false` sample entries with approximate coordinates.
- 2026-11-07: Shelter ranking = distance + 15 km penalty per missing needed feature (wheelchair, power,
  medical, pets, livestock). A nearby shelter lacking a feature can still rank first; the UI shows what is
  missing rather than hiding it. Risk rules live in `RULES` in `src/engine/planEngine.ts`.
- 2026-11-07: Live alerts use GDACS only. GDACS SEARCH `country=` takes ISO2 (ISO3 → 204), and including
  `TS` in `eventlist` returns 204 for everything. ReliefWeb API v2 now requires a pre-approved `appname`
  (403 otherwise) — not integrated yet; request one at https://apidoc.reliefweb.int/parameters#appname.

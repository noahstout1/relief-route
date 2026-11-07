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
- [ ] 2. Types, profile store, onboarding flow
- [ ] 3. Country seed data + guidance templates
- [ ] 4. Plan engine + tests + Plan tab
- [ ] 5. Help tab (shelters, agencies, tap-to-call, directions)
- [ ] 6. Live alerts service + Home tab, offline caching
- [ ] 7. i18n + accessibility polish

## Decisions log
- 2026-11-07: Expo + TS chosen; bundled offline data + live GDACS/ReliefWeb alerts; seed countries
  Bangladesh (BD), Philippines (PH), Haiti (HT), Mozambique (MZ), Nepal (NP). No backend in v1.

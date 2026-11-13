# Verification report — Stage 4 NASA data package follow-through

Date: 2026-11-13 UTC
Base revision: `a836ba7f2868de44294065887ff4a46cf7f94452`
Scope: user-supplied NASA data package integrity, runtime data use, Data Lab status accuracy, build and full browser regression.

## Evidence categories

| Category | Result |
|---|---|
| User-supplied source package | Archive SHA-256: `c99feb4c4d381d37910ed501829d791d0d98e20ec94003c71da2f2f0de16e4c3`. All 24 manifest checksums matched. This verifies package integrity, not origin transactions. |
| DONKI | Preserved user-supplied raw JSON: CME 125, GST 3, IPS 11, HSS 11, and SEP valid empty result. FLR is missing; package records HTTP 404 (api.nasa.gov path) and 503 (CCMC). The app uses a 60-record partial snapshot; effects are educational rules. |
| NASA Images API | Preserved raw query response and five results, shown in the NASA Data Lab with nasa_id, title, description, date, preview and official details URL. The package reports HTTP 200; executor independently checked file hashes and result structure, not the origin transaction. PIA13720 remains a separate static Photojournal image. |
| LRO / LOLA | Three user-supplied ODE query/CSV/PDS3-label regions. Candidate coordinates and relative topography are used in the site-planning comparison. Slope values are derived from sparse points and independently recomputed, not official LOLA slope fields. Site outcomes remain educational mappings. |
| Mock-only | DONKI API/cache/failure-flow tests use mocked fetch. They do not establish live NASA network access. |
| Browser automation | Full desktop Chromium + iPhone-sized mobile Chromium suite: **76 passed, 8 skipped, 0 failed** (84 total; 30.2 minutes), using `/usr/bin/chromium`. Emulation is not physical Safari/iOS or Android testing. |
| Physical hardware | User can test iPhone/iPad; no result has yet been supplied for the updated preview. Android also remains untested. |
| Licensing | User said rights authority is unknown; project-wide `LICENSE` remains pending and grants no license. |

## Commands and outcomes

```text
npm run check:nasa-data
npm run build
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test -- --reporter=line
git diff --check
```

- `npm run check:nasa-data`: passed; validates supplied package hashes, snapshot, image catalog, LOLA points and game-score effects. Its fetch-flow tests are mock fixtures.
- `npm run build`: passed; Vite output includes a 989.56 kB JavaScript bundle. Vite reports the 989.56 kB chunk above its 900 kB advisory threshold; the Three.js `Clock` deprecation appears in browser logs. Neither blocks build or tests.
- Full Playwright suite: **76 passed, 8 skipped, 0 failed**. It covers desktop and phone-sized Chromium, welcome through lesson one, lesson activities, retry, prepared-state finale/certificate, persistence, language, 375×812 / 768×1024 / 1024×768 layouts, touch, camera bounds, guidance, assembly, repair, science, communications, gravity, and 200% text. Eight skips are project-configured platform cases.
- `git diff --check`: passed after code/data updates. Re-run after final report edits and before commit.

## Flow and device-test boundary

No single uninterrupted fresh-storage walkthrough through all six lessons, finale, mission log and certificate was completed. Existing tests cover the welcome-to-first-lesson path and individual lessons; the finale/certificate test begins from a prepared final-mission state. Physical iPhone/iPad Safari and Android browser behavior remains unverified. Do not report those as complete.

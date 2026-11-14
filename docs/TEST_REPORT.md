# Current board-only verification — 2026-11-14

This section supersedes the route/test interpretation below for the current urgent 3D-board rebuild. The dated 2026-11-13 full-suite results are historical evidence for the previous six-course route; they are not evidence that the removed route still works.

| Check | Current result | Boundary |
|---|---|---|
| Board-only Playwright (`npm test`) | 4 passed | Chromium desktop + mobile emulation; end-to-end board, physical drags/taps, certificate, reload, language, responsive viewports. |
| NASA data checks | Passed on supplied archive and mocked importer cases | Package SHA-256s and included NASA response files checked locally; no fresh NASA HTTP request was made. |
| Production build | Passed | Vite reports a 1,030.09 kB minified JS chunk above the 900 kB advisory threshold. Non-blocking warning; splitting remains open. |
| Legacy full-suite attempt | Not passed | The first incompatible old-route tests failed (assembly expected an old workshop mode; audio test expected the hidden legacy settings gear); one responsive run was interrupted; 116 remaining cases were not run. The legacy suite is available via `npm run test:legacy` for diagnosis, but this board-only replacement does not claim legacy-route coverage. |
| Physical iPhone/iPad/Android | Not verified | Only browser emulation is evidenced; hardware/Safari testing remains outstanding. |
| Rights / LICENSE | Pending | User stated rights ownership is unknown; no project-wide license was selected. |

Current screenshot evidence is in `docs/ui-evidence/board-only-desktop-1280.png` and `docs/ui-evidence/board-only-mobile-375.png`.

# Verification report — Judge review implementation follow-through

Date: 2026-11-13 UTC
Source base: `b4171594a3e981937647d05640e14fe02dc45a53`
Scope: review-package mission-board route, lesson activities, data-claim accuracy, clean-storage completion, build and full browser regression.

## Evidence categories

| Category | Result |
|---|---|
| User-supplied source package | Archive SHA-256: `c99feb4c4d381d37910ed501829d791d0d98e20ec94003c71da2f2f0de16e4c3`. All 24 manifest checksums matched. This verifies package integrity, not origin transactions. |
| DONKI | Preserved user-supplied raw JSON: CME 125, GST 3, IPS 11, HSS 11, and SEP valid empty result. FLR is missing; package records HTTP 404 (api.nasa.gov path) and 503 (CCMC). The app uses a 60-record partial snapshot; effects are educational rules. |
| NASA Images API | Preserved raw query response and five results, shown in the NASA Data Lab with nasa_id, title, description, date, preview and official details URL. The package reports HTTP 200; executor independently checked file hashes and result structure, not the origin transaction. PIA13720 remains a separate static Photojournal image. |
| LRO / LOLA | Three user-supplied ODE query/CSV/PDS3-label regions. Candidate coordinates and relative topography are used in the site-planning comparison. Slope values are derived from sparse points and independently recomputed, not official LOLA slope fields. Site outcomes remain educational mappings. |
| Mock-only | DONKI API/cache/failure-flow tests use mocked fetch. They do not establish live NASA network access. |
| Browser automation | Full desktop Chromium + phone-sized mobile Chromium suite: **92 passed, 8 skipped, 0 failed** (100 total; 36.1 minutes), using `/usr/bin/chromium`. Includes a clean-storage run through six mission turns to the certificate. Emulation is not physical Safari/iOS or Android testing. |
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
- `npm run build`: passed; Vite output is 1,016.50 kB JS (293.33 kB gzip), above its 900 kB advisory threshold. This is non-blocking; code splitting remains a performance follow-up.
- Full Playwright suite: **92 passed, 8 skipped, 0 failed** (100 total; 36.1 minutes). The full suite covers desktop and phone-sized Chromium; welcome, six-turn mission board, lesson activities, retry, persistence, language, 375×812 / 768×1024 / 1024×768 layouts, touch, camera bounds, guidance, assembly, repair, science, communications, gravity, 200% text, finale, learning record and certificate. Eight skips are project-configured platform cases; see the Playwright test source/config for conditions.
- `npm run check:nasa-data`: passed on the user-supplied files and importer fixtures. This did not make live NASA requests.
- `git diff --check`: passed before final report edits; rerun after edits and before commit.

## Flow and device-test boundary

A clean-storage desktop Chromium end-to-end test completed the welcome, six mission turns, finale, learning record and certificate, with seven mission records persisted. The full suite separately covers responsive and device-emulated paths. Physical iPhone/iPad Safari and Android browser behavior remains unverified; do not report those as complete. Game outcomes from NASA source data are educational abstractions; source facts and simulations remain distinct in the UI and documentation.

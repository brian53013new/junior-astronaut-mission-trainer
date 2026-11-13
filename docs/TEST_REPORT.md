# Stage 3 implementation and verification report

Date: 2026-11-13 UTC
Base revision: `ff2701e64e52f36e65b0ae617fdc74ff86bb9155`
Scope: source/provenance accuracy, use of verified classroom references, curriculum source cards, game checks, browser tests and private preview.

## Evidence categories

| Category | Result |
|---|---|
| Genuine NASA source/data evidence | BVAD Rev. 2 water reference and NASA lunar surface-gravity reference are in local source data and drive the documented classroom calculations; the PIA13720 static illumination image appears in the observation lesson. See `NASA_REFERENCES.md`. |
| Mock-only | DONKI feed validation, raw-body/hash retention, partial failures/cache rules and NASA Images API response parsing use fixtures in `npm run check:nasa-data`. These do not establish NASA connectivity. |
| NASA network access | No DONKI JSON, Images API result or LOLA row-level measurements were received. Requests were blocked before the origin server; no HTTP status is claimed. |
| Browser automation | Full post-change desktop Chromium + iPhone-sized mobile Chromium suite: **76 passed, 8 skipped, 0 failed** (84 total; 29.2 minutes). Chromium was `/usr/bin/chromium`. The 8 skips are project-specific device/platform conditions, not failures. Chromium emulation is not a physical-device result. |
| Physical hardware | iPhone, iPad and Android hardware have not been tested in this session. |
| Licensing | Dependency inventory is recorded; the project-wide original-work license and some image redistribution rights remain pending. See `LICENSE` and `NASA_REFERENCES.md`. |

## Commands and final outcomes

The following commands were run after the last source change:

```text
npm run check:nasa-data
npm run build
npm test
git diff --check
```

Results:

- `npm run check:nasa-data`: passed. This command uses mock responses; the separate data checks also verify that runtime JSON and the public-copy JSON remain identical.
- `npm run build`: passed. Vite emitted a **975.27 kB minified JavaScript chunk** warning against the 900 kB advisory threshold. This is non-blocking: the current app loads the shared Three.js engine and the procedural game in a single initial bundle. It is not a compile/build error, but it remains a startup-size/performance optimization task, especially for low-memory phones.
- `CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test`: passed, 76/84; 8 expected project-specific skips; zero failures. Full desktop and mobile projects ran. The initial default-path attempt could not start Chromium; the full successful run used the discovered system Chromium path.
- `git diff --check`: passed on the final tracked and untracked source/document changes prepared for commit.

The checks do not claim live NASA access. A Vite warning about `THREE.Clock` deprecation appears in browser logs; it did not fail tests/build and remains a code-maintenance item.

## Flow and device-test boundary

The test suite covers a clean-storage NOVA welcome through the first lesson on desktop and mobile, individual course activities, retries, the finale and game certificate from a prepared final-mission state, persistence/reload, language, responsive 375×812, 768×1024 and 1024×768 viewports, touch input, camera boundaries, text size and settings. It is **not** a single uninterrupted clean-storage playthrough through all six lessons, finale, mission log and certificate. Physical browser testing is not performed by Playwright device emulation.

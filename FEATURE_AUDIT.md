# Junior Astronaut Mission Trainer — implementation audit

Status describes behavior in this checkout, not visual ambition. Existing saves must remain usable.

- [x] First-visit 3D welcome room, NOVA introduction, practice button/dial/switch and hatch; desktop/mobile emulation has exercised the first lesson.
- [x] Existing six lessons, finale, progress persistence, resource simulation and locally generated certificate; individual lesson paths were tested from saved states.
- [x] Touch selection, focused devices and drag handling exist; repeated welcome and console swipes were tested in Chromium phone/tablet emulation. Full physical-device coverage is still required.
- [x] Default-on camera zoom, independently saved display settings, paper-edge page turning, and text sizing from 100% to 200% are implemented. Text scale updates the learning paper, device callouts, console canvases, and interface; text-surface pinch is routed separately from empty-space camera zoom. Mobile Chromium verified 200% selection and persistence, but dense 200% layouts still need visual clipping review.
- [x] Rotating 360° seated cabin, side workstations, rear book, rotation-aware focus presets and enclosed walls. Desktop and phone emulations exercise rotation and the rear book; some equipment remains on the forward desk.
- [ ] Guidance uses an object-attached 3D locator and dashed tether, animated control cues and off-screen/occluded-target arrows. Occlusion is estimated with ray tests; all-scene and real-device review remain outstanding.
- [ ] Every interactive control verified individually for touch focus, drag, exit and save/progress behavior.
- [ ] A 3D engineering bay now allows dragging three distinct components to their ports, returning a misaligned component, and activating the probe. The bay has framed lunar observation ports, wall-mounted tool storage, and separate parts, tools, and diagnostic stations; this structural extension passed build and interaction regression tests, but its final visual composition still needs device review. Movement is constrained to the workbench plane; Held parts can rotate on three axes with Q/E, W/S and Z/X; a two-finger twist and vertical movement rotate on two axes. Solar deployment, battery insertion and antenna alignment require distinct interactions. Translation remains constrained to the workbench plane.
- [ ] Separate 3D assembly and repair workbenches have an enclosed connecting passage and support component placement and circuit repair. Dedicated science and communications rooms are now reachable from their respective controls; they are not yet connected by walkable passages. The assembly-to-repair transition is guided camera travel, not unrestricted walking.
- [ ] The communications activity uses antenna alignment and physical signal keys; the science room asks players to aim at a simulated crater before scanning. Distinct hands-on assessments throughout every course are still incomplete, and existing written questions remain.
- [ ] A single uninterrupted tested playthrough from welcome through all six lessons and finale; actual phone/iPad, audio and educator/child testing remain outstanding.

- [x] Planning board has illustrative 3D terrain, simulated site trade-offs and terrain / sunlight / route view controls. These are game models, not measured site data.
- [x] Time dial has a separate numeric readout and a single release-triggered visual pulse; repeated advance and event-stop behavior is covered by existing clock tests.

- [x] The training book has a separate rear pedestal; hit volumes do not intersect console controls and a measured gap remains to the rear wall.
- [ ] The six lessons and finale now introduce a life analogy, concept and device purpose before the activity and a result/reflection afterwards. Assessments still contain fixed written questions and require further hands-on redesign.

- [x] The cockpit work surface is a continuous extruded shape with a seat opening and supporting rails. Engineering, repair, science and communications room envelopes contain their adaptive cameras; visual review and all equipment clearances remain to be checked.
- [ ] The engineering bay includes interactive component information, tool guidance and diagnostics tied to current assembly state. It does not yet support reusable module upgrades in later lessons, unrestricted walking, or a mechanical arm.
- [ ] The off-screen indicator is a directional arrow and the world marker has a downward pointer. Arrow-to-world-marker transition passed desktop and mobile tests; per-device operation cues and all occlusion cases still need broader validation.
- [ ] The craft stick maps horizontal and vertical drags to separate axes and has damped return; axis calibration and control feel have not been independently verified.
- [ ] The engineering bay windows and two-axis stick received code/build validation but have not been visually reviewed on an actual device.

## AI report follow-through — 2026-11-12

- [x] Lobby “Skip arrival” now enters the same first-time 3D welcome room and bypasses only its opening arrival animation; returning learners enter their saved cabin/lesson. Desktop and mobile Chromium browser checks cover the button path.
- [x] Lobby language and text-size labels are localized; the accessible size selector retains the saved 100/150/200% choice.
- [x] The existing unused HTML WelcomeFlow was replaced with a seven-step accessible alternative using `outpost-welcome-3d-step`, the same progress key as the 3D tutorial. The learner can switch from lobby or from the 3D room and return to the saved step. Desktop and mobile Chromium checks cover switching both ways.
- [x] The existing mobile ReadingPanel is now wired to the same `Journey`, `MissionEngine` state and save methods as the 3D paper. Page turn, prediction/clue/reflection, answer and next-question callbacks share progress; the 3D paper is hidden only while the compact HTML study sheet is active. Mobile Chromium verified reading, saved page state and 200% text without horizontal overflow.
- [x] Restored the previously force-hidden `#coach`; it now appears outside lobby/intro/quiz states and is suppressed while Settings is open. The mobile NOVA subtitle keeps a reserved avatar gutter at large text sizes.
- [x] Added a user-facing source/provenance and Space Apps preparation panel, available in Settings and after completion. It states whether a NASA snapshot is actually loaded, lists the LRO illumination map and reference sources, stores checklist progress locally and exports JSON without submitting it.
- [ ] Bundled DONKI snapshot remains empty. Gate 2 tried both official DONKI roots, all six feed types and 7/30/90-day ranges; the proxy tunnel rejected requests before origin HTTP responses. NASA Images API and LRO/LOLA probes were likewise blocked. No real NASA event, image API item, or terrain values were added. Do not describe the build as using a live/historical DONKI event or Images API result. The LRO illumination image remains a separately sourced static NASA Science image.
- [ ] No physical iPhone/iPad/Android device test, complete playthrough of every lesson, educator/child usability session or external challenge submission was performed in this work.

### Verification note — 2026-11-12

- `npm run build` passes. The only build warning is the minified JavaScript bundle at about 940 kB, above Vite's 900 kB advisory threshold.
- `git diff --check` passes.
- Curriculum, paper, core mission, offline-cache and DONKI import checks pass.
- The full Playwright run previously completed all 38 desktop Chromium tests. After mobile-specific repairs, focused mobile assembly, finale, paper-turn, reading-panel and target-marker tests pass. The end-to-end mobile welcome-to-first-lesson test was interrupted during the longer assembly activation segment, so it is not counted as passing; the complete suite has not been rerun after the mobile fixes.
- Browser verification used desktop and emulated mobile Chromium only. It does not establish physical iPhone, iPad, or Android behavior.


### Gate 2 follow-up — 2026-11-13

- [x] DONKI requests now use `Promise.allSettled`; validated events from successful feeds survive individual feed failures. Partial results are labeled `partial`; empty/invalid/network-failure responses do not overwrite a validated browser cache. The importer retains successful raw feed bodies, HTTP statuses and SHA-256 hashes in a provenance manifest; the NASA Data Lab can export those bodies and hashes when a real request succeeds. The NASA Images API result shape now includes the actual query URL and retrieval time. Automated tests use mocked fetch and prove control flow only.
- [x] Flight lesson now provides an interactive mass-to-weight comparison using the cited lunar surface-gravity value and saves the learner's calculation locally. It explicitly distinguishes the learning calculation from the non-integrated illustrative orbit.
- [ ] No direct NASA JSON or Images API result could be fetched in this environment. Both DONKI hosts were tested across 7/30/90-day ranges; the proxy rejected the tunnel before origin HTTP status. LRO/LOLA row data remains unavailable. Request evidence is in `public/data/nasa/api-access-audit.json`; empty fallback remains empty.
- [x] Full Playwright suite completed on desktop Chromium and emulated iPhone Chromium: 75 passed, 8 project-specific skips, 1 failed. The sole failure was a test-flow defect: after intentionally choosing a wrong answer, the desktop test selected another answer before activating the in-game “Try again” control. The test now follows that control and its full desktop welcome-to-first-lesson/save-reload case passes in a focused rerun. The full suite has not yet been rerun after this test-only correction, so the combined run is not reported as fully green.
- [x] The clock test passed in both desktop and mobile Chromium in the full run. Gravity calculation, the 3 viewport settings/persistence cases (375×812, 768×1024, 1024×768), touch tap, page turning, ring rotation, camera boundary and lesson activity tests passed in the emulated projects.
- [ ] Physical iPhone, iPad and Android devices were not tested. The Playwright projects are desktop Chromium and iPhone-sized mobile Chromium emulation only. The test suites exercise individual lessons and a welcome-to-first-lesson path; they do not form one uninterrupted fresh-storage run through all six lessons and the certificate.

## Stage 3 — source-driven records, compliance and final automated run — 2026-11-13

- [x] Runtime water and lunar-gravity values now read the checked-in files under `src/data/nasa/`; matching public source files remain under `public/data/nasa/`. `npm run check:nasa-data` asserts both copies match and confirms BVAD water consumption drives the five-point daily baseline while 1.624 m/s² drives the saved mass-to-weight lesson calculation. These are official reference data, not an official NASA mission model.
- [x] Per-lesson source cards were added for assembly, communications, repair and finale; planning and flight already display NASA data references, and observation displays the static PIA13720 image/source. All cards explain the use and science/game limitation. `NASA_REFERENCES.md` lists each NASA source, checked date, use, terms and in-game status.
- [x] `public/data/third-party/dependency-license-inventory.json` inventories all 68 locked npm packages. It records metadata that was available locally and flags absent optional platform-package metadata rather than assuming a license. Scene art/audio/text generation and font sourcing are documented.
- [ ] Project-wide original-work license is not assigned. `LICENSE` records that rights-holder authorization is pending. NASA image redistribution clearance for third-party restrictions and missing optional dependency license metadata also require review.
- [ ] DONKI raw JSON, NASA Images API query results and LRO/LOLA row-level elevation/slope values remain unavailable. No snapshot or measurements were fabricated. The PDS catalog metadata is not a measurement dataset.
- [x] `npm run check:nasa-data` and DONKI importer fixture checks pass. They validate parsing, cache behavior, partial status, provenance handling and references using mocks; they do not verify NASA network access.
- [x] Full `CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test`: 76 passed, 8 project-defined skips, 0 failed (desktop + iPhone-sized mobile Chromium emulation; 84 total). Includes responsive dimensions 375×812, 768×1024 and 1024×768, retries, per-course activities, finale/certificate state, saved reload, language, touch, camera, guide arrows, assembly, repair, science, signal, gravity and 200% text.
- [ ] A single uninterrupted clean-storage run through all six lessons, finale, mission log and certificate was not performed. The tests exercise welcome-to-first-lesson and individual lesson paths plus finale/certificate from a prepared state. Physical iPhone, iPad and Android validation was not performed.
- [x] `npm run build` passes. Vite reports one 975.27 kB minified initial chunk over its 900 kB advisory; this is non-blocking and remains a startup-performance optimization item. Browser logs also include a Three.js `Clock` deprecation warning.
- [x] The website remains an independent bilingual 3D lunar-base education game for the NASA Space Apps Challenge “Build a Junior Astronaut Mission Trainer”; its resource changes and alerts are simulations, not NASA mission or safety advice.

## Stage 4 package follow-through — 2026-11-13

This section supersedes earlier Gate 2 bullets that described the NASA snapshot as empty or Lola values as unavailable. The user supplied a data package, and the original payload plus 24-entry checksum list are retained at `public/data/nasa/user-submitted-package/`.

- [x] Local checksum verification: all 24 package SHA-256 entries matched. This confirms supplied-file integrity only; the executor did not independently repeat NASA-origin transactions.
- [x] DONKI: raw CME (125), GST (3), HSS (11), IPS (11), and valid empty SEP responses preserved with request metadata, reported status and raw-body SHA-256. FLR remains unavailable (reported mirror HTTP 404 and CCMC HTTP 503); normalized 60-record partial snapshot loads in the game. Event resource changes remain educational rules.
- [x] NASA Images API: preserved raw query response and five normalized result cards. NASA Data Lab shows API IDs, title, description, date, preview and detail page. PIA13720 remains a separate static Photojournal image.
- [x] LOLA RDR: three CSV/label/query regions and derived records retained. Candidate point coordinates and relative topography are exposed; sparse-point slopes were independently recomputed from the supplied data. The displayed score affects the planning scenario but is an educational mapping, not an official slope product or safety assessment.
- [x] Site-planning board displays the selected point's coordinate, relative topography, estimated slope, comparison score and explicit limitations. Power/science effects depend on the comparison score; water surcharges and sunlight/route views remain simulations.
- [x] Course content report now describes the implemented sequence and evidence limits in both languages: `docs/course-content-report.md`.
- [ ] Rights holder is unconfirmed; no project-wide license is granted. User explicitly said authority is uncertain.
- [ ] Physical iPhone/iPad test is still pending user execution. Browser emulation is not hardware verification.
- [ ] One uninterrupted clean-storage six-lesson-to-certificate run remains unverified.

### Stage 4 final verification — 2026-11-13

- [x] User data package integrity: all 24 listed SHA-256 digests matched the attached package manifest. This is not independent confirmation of NASA-origin HTTP transactions.
- [x] Runtime data: DONKI 60-record partial snapshot (CME/GST/IPS/HSS plus empty SEP; FLR unavailable), five user-supplied NASA Images API result records, and three LOLA RDR-derived candidate point records. Their limits and impacts are described in `docs/nasa-data-audit.md`.
- [x] `npm run check:nasa-data`, `npm run build`, `git diff --check` passed. Build JS bundle is 989.56 kB; browser logs retain the non-blocking Three.js Clock deprecation notice.
- [x] Full desktop/mobile Chromium suite after data/UI changes: 76 passed, 8 configured skips, 0 failed (84 total, 30.2 minutes). iPhone-sized Chromium is emulation, not iPhone/iPad Safari hardware.
- [ ] No single uninterrupted clean-storage run through all six lessons, finale, mission log, and certificate was performed; lesson coverage is split across existing activity tests.
- [ ] User has not yet returned iPhone/iPad results for the updated private preview. Android physical device is also untested.
- [ ] Rights holder authority is unknown per user; project-wide license remains pending and `LICENSE` grants no rights.

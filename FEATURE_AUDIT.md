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
- [ ] Bundled DONKI snapshot remains empty. A direct NASA API fetch attempt from this environment failed to connect, and no `NASA_API_KEY` is configured. Do not describe the build as using a historical or live NASA DONKI event. The LRO illumination image is the only bundled NASA dataset currently used in the lesson.
- [ ] No physical iPhone/iPad/Android device test, complete playthrough of every lesson, educator/child usability session or external challenge submission was performed in this work.

### Verification note — 2026-11-12

- `npm run build` passes. The only build warning is the minified JavaScript bundle at about 940 kB, above Vite's 900 kB advisory threshold.
- `git diff --check` passes.
- Curriculum, paper, core mission, offline-cache and DONKI import checks pass.
- The full Playwright run previously completed all 38 desktop Chromium tests. After mobile-specific repairs, focused mobile assembly, finale, paper-turn, reading-panel and target-marker tests pass. The end-to-end mobile welcome-to-first-lesson test was interrupted during the longer assembly activation segment, so it is not counted as passing; the complete suite has not been rerun after the mobile fixes.
- Browser verification used desktop and emulated mobile Chromium only. It does not establish physical iPhone, iPad, or Android behavior.

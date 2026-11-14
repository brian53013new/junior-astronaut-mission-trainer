# Outpost Control — single-board rebuild

**Revision:** 2026-11-14  
**Purpose:** Implement the supplied “3D Board Only Rebuild” package. This is a product and test note, not a claim of NASA endorsement or certification.

## Production route

The home screen presents the project disclosure, start, replay-board-guide, language, sources and settings. Start opens a single persistent 3D mission board directly; replaying the guide reuses the existing board save and changes only its tutorial step. The ordinary flow has five short turns and ends with the mission record/certificate panel:

1. **Site:** drag the habitat token onto one of three LOLA point pads. The selected coordinates, relative topography and package-derived slope are shown; an educational comparison rule updates the mission state.
2. **Event and communications:** physically drag the antenna gimbal. At alignment, choose to protect reserve or continue transmission. A saved user-provided DONKI event is context only; the consequence is labeled an educational rule.
3. **Evidence:** select a physical board tile to classify the claim “a shadow proves water ice.” The intended answer is an inference; an image shadow does not measure ice.
4. **Repair:** select the physical backup-power connector and life-support port. The cable geometry updates when connected; the resource change is disclosed as a game abstraction.
5. **Integrated priorities:** choose two or more of energy, water and communications. The resource result, five turn records, source IDs and certificate state are stored locally.

A five-step, skippable/replayable board guide now directs the player to (1) drag the habitat token, (2) open a physical source card, (3) find a child-sized clue before seeing the raw source details, then install the solar-array module, rotate the physical antenna and watch its readout, and (5) confirm a choice. The clue action saves which source the learner inspected and advances NOVA's guide. The source card asks the child to select which clue connects to the task. A first miss gives a broad direction; a second miss names the relevant field without penalizing the learner. Dates, coordinates, event IDs, units, URLs, provenance and limitations reveal only after the correct clue is selected. The guide is saved in the same board state, is not a second route, and can be replayed from the home screen or board footer without clearing mission choices. NOVA’s short line changes with the guide step and task turn. A compact task panel provides keyboard/touch alternatives, summaries and expandable source and limitation details. The operational board is scene geometry in the shared Three.js scene; the DOM layer is for readable instructions, resources, settings, source details and accessible alternatives.

## Input and layout changes

- The start action enters the board directly. The former WelcomeFlow is not imported or instantiated; no welcome-room, intro-skip, course-selector or lesson-selector element is in the rendered DOM. A separate dormant legacy WelcomeRoom implementation and old course modules still exist in source, but no production button or route can enter them; complete source deletion remains tracked as cleanup.
- Old course/room control handlers are ignored while the board is active, so a legacy control cannot also rotate the camera or execute an unrelated action.
- Physical controls use raycasting against the board's own interaction meshes. The habitat token, solar-array module and antenna use pointer capture for drag; classification tiles and repair connectors use selection/tap. The mobile canvas now projects interaction points through its own CSS bounds; touch-sized DOM source and repair controls remain available when HUD overlays cover desk targets.
- The HUD task surface is pointer-transparent except for actual links, buttons, summaries and inputs. This fixes the hit-area blocker where the task panel rectangle intercepted antenna drag despite having transparent areas.
- Old wall monitors, desk controls, paper, legacy desk furniture and the NOVA mesh are hidden while the board is active; the ring camera overlay is removed. The board has a dedicated camera view, then restores the previous console view when leaving board mode. The board table includes a continuous frame, edge rails and visible support legs.
- Phone/tablet CSS uses safe insets, one-column resource indicators, bounded task card height, and no horizontal page overflow. All controls keep touch-sized targets.
- Empty-space mouse movement produces a bounded, damped board parallax of at most about four degrees; pointer movement over a physical control does not move the board, dragging pauses parallax, canvas exit recenters it, and reduced-motion preference disables it.
- The rear-right 3D mission display has a separate expanded transparent raycast surface, so the physical screen no longer competes with the observation tiles for hit priority. Click/tap raycast and a keyboard-focusable screen action enter the same focus state; the camera dollies toward the display and the current source drawer opens. Closing or pressing Escape returns to overview without mutating phase, site, or resources.

## Data and provenance shown in play

- **LOLA:** three supplied PDS query-window points with coordinates and relative topography. Their slope estimates come from a package method over sparse records, not an official LOLA slope field. The board displays that restriction.
- **DONKI:** imported partial snapshot; CME, GST, HSS and IPS records are present; SEP was a successful empty response; FLR was not obtained. Runtime details show the selected event identifier, retrieval time and package status. Resource mapping is educational only.
- **NASA Images API:** saved API catalog result ID/date and API query record are distinguishable from PIA13720. PIA13720 remains a separate static NASA Science Photojournal image; neither darkness nor API metadata proves ice.
- **BVAD:** water reference remains the checked document scenario (Table 4-20, printed page 72). Repair costs and power rewards are game rules.
- Package checksum validation verifies the supplied archive bytes against its manifest; it does not independently repeat or certify the source HTTP transactions.

Source details are accessible from each turn. The project remains an independent educational game and has no NASA endorsement, certification, safety, operational or radiation-prediction claim.

## Verification performed

Automated Playwright board-only E2E in Chromium browser emulation:

- Fresh storage → tutorial habitat drag → child source-clue choices → solar-array drag/snap assembly → tutorial antenna rotation → site confirmation → physical antenna drag to at least 52% → event choice → physical evidence-tile selection → repair-port connection (physical scene hit plus touch-sized task controls) → two finale priorities → completion → certificate → reload restores certificate.
- The same complete sequence passed in desktop Chromium and iPhone-sized/mobile Chromium emulation.
- Responsive check passed at 375×812, 768×1024 and 1024×768 with no horizontal document overflow.
- Language toggle changed the board copy and persisted across reload.
- Right-rear display raycast returned `screen` in desktop and phone-sized viewport tests; click moved the actual game camera into the focus pose, and close/Escape smoothly moved it back while phase, site and resources remained unchanged.
- Keyboard Enter/Escape follows the same focus and return state. `prefers-reduced-motion` left parallax at neutral while keeping screen focus active.
- No uncaught browser page errors in the end-to-end run.
- Current desktop and 375×812 visual evidence is included in `docs/ui-evidence/board-only-desktop-1280.png` and `docs/ui-evidence/board-only-mobile-375.png`.

These are browser-emulation results only. A real iPhone/iPad Safari test remains pending; no Android device test is claimed. The current board-only Playwright acceptance tests cover desktop and iPhone-sized Chromium emulation, including home-screen replay preserving a saved site/record; the latest result is recorded in the test report. A full legacy-suite attempt did not pass: two old-route expectations failed, one test was interrupted, and 116 cases were not run. See `docs/TEST_REPORT.md`; no full legacy-suite pass is claimed. Requirements and evidence from both user-supplied board/teaching packages are mapped in [`docs/existing-feature-matrix.md`](existing-feature-matrix.md), including explicit gaps that are not part of this production route.

## Still open

- The long six-lesson implementation and its old tests remain in the repository as dormant legacy code. Normal startup enters the board-only flow. The legacy suite is not green because it still assumes retired routes; it needs separate archival or migration if those tests must remain runnable.
- The user has not authorized project-wide code/content licensing; the existing pending-rights notice remains.
- Physical iPhone/iPad interaction, Safari, Android and independent network re-fetching of supplied NASA transactions remain unverified.
- Bundle-size advisory remains non-blocking; code splitting was not part of the board-only interaction fix.

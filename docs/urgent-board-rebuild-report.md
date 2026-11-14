# Outpost Control — single-board rebuild

**Revision:** 2026-11-14  
**Purpose:** Implement the supplied “3D Board Only Rebuild” package. This is a product and test note, not a claim of NASA endorsement or certification.

## Production route

The home screen now presents the project disclosure, language, sources, settings and one start action. Start opens a single persistent 3D mission board directly. The ordinary flow has five short turns and ends with the mission record/certificate panel:

1. **Site:** drag the habitat token onto one of three LOLA point pads. The selected coordinates, relative topography and package-derived slope are shown; an educational comparison rule updates the mission state.
2. **Event and communications:** physically drag the antenna gimbal. At alignment, choose to protect reserve or continue transmission. A saved user-provided DONKI event is context only; the consequence is labeled an educational rule.
3. **Evidence:** select a physical board tile to classify the claim “a shadow proves water ice.” The intended answer is an inference; an image shadow does not measure ice.
4. **Repair:** select the physical backup-power connector and life-support port. The cable geometry updates when connected; the resource change is disclosed as a game abstraction.
5. **Integrated priorities:** choose two or more of energy, water and communications. The resource result, five turn records, source IDs and certificate state are stored locally.

NOVA gives a short contextual line at each turn. A compact task panel provides keyboard/touch alternatives, summaries and the expandable source and limitation details. The operational board is scene geometry in the shared Three.js scene; the DOM layer is for readable instructions, resources, settings, source details and accessible alternatives.

## Input and layout changes

- The start action no longer gates the game behind the WelcomeRoom, long intro sequence, text tutorial or course selector. The board directly owns the default route.
- Old course/room control handlers are ignored while the board is active, so a legacy control cannot also rotate the camera or execute an unrelated action.
- Physical controls use raycasting against the board's own interaction meshes. The habitat token and antenna use pointer capture for drag; classification tiles and repair connectors use selection/tap. DOM buttons remain alternatives.
- The HUD task surface is pointer-transparent except for actual links, buttons, summaries and inputs. This fixes the hit-area blocker where the task panel rectangle intercepted antenna drag despite having transparent areas.
- Old wall monitors, desk controls, paper, legacy desk furniture and the NOVA mesh are hidden while the board is active; the ring camera overlay is removed. The board has a dedicated camera view, then restores the previous console view when leaving board mode. The board table includes a continuous frame, edge rails and visible support legs.
- Phone/tablet CSS uses safe insets, one-column resource indicators, bounded task card height, and no horizontal page overflow. All controls keep touch-sized targets.

## Data and provenance shown in play

- **LOLA:** three supplied PDS query-window points with coordinates and relative topography. Their slope estimates come from a package method over sparse records, not an official LOLA slope field. The board displays that restriction.
- **DONKI:** imported partial snapshot; CME, GST, HSS and IPS records are present; SEP was a successful empty response; FLR was not obtained. Runtime details show the selected event identifier, retrieval time and package status. Resource mapping is educational only.
- **NASA Images API:** saved API catalog result ID/date and API query record are distinguishable from PIA13720. PIA13720 remains a separate static NASA Science Photojournal image; neither darkness nor API metadata proves ice.
- **BVAD:** water reference remains the checked document scenario (Table 4-20, printed page 72). Repair costs and power rewards are game rules.
- Package checksum validation verifies the supplied archive bytes against its manifest; it does not independently repeat or certify the source HTTP transactions.

Source details are accessible from each turn. The project remains an independent educational game and has no NASA endorsement, certification, safety, operational or radiation-prediction claim.

## Verification performed

Automated Playwright board-only E2E in Chromium browser emulation:

- Fresh storage → physical habitat drag → site confirmation → physical antenna drag to at least 52% → event choice → physical evidence-tile selection → physical repair-port connection → two finale priorities → completion → certificate → reload restores certificate.
- The same complete sequence passed in desktop Chromium and iPhone-sized/mobile Chromium emulation.
- Responsive check passed at 375×812, 768×1024 and 1024×768 with no horizontal document overflow.
- Language toggle changed the board copy and persisted across reload.
- No uncaught browser page errors in the end-to-end run.
- Current desktop and 375×812 visual evidence is included in `docs/ui-evidence/`.

These are browser-emulation results only. A real iPhone/iPad Safari test remains pending; no Android device test is claimed. The four current board-only Playwright cases passed. A full legacy-suite attempt did not pass: two old-route expectations failed, one test was interrupted, and 116 cases were not run. See `docs/TEST_REPORT.md`; no full legacy-suite pass is claimed.

## Still open

- The long six-lesson implementation and its old tests remain in the repository as dormant legacy code. Normal startup enters the board-only flow. The legacy suite is not green because it still assumes retired routes; it needs separate archival or migration if those tests must remain runnable.
- The user has not authorized project-wide code/content licensing; the existing pending-rights notice remains.
- Physical iPhone/iPad interaction, Safari, Android and independent network re-fetching of supplied NASA transactions remain unverified.
- Bundle-size advisory remains non-blocking; code splitting was not part of the board-only interaction fix.

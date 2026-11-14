# Lunar Mission Table · short-form course and interaction report

Status: implemented in source; mission-table browser tests and a new-storage end-to-end run passed in desktop Chromium and mobile Chromium emulation on 2026-11-13. This verifies browser simulation only; physical iPhone/iPad Safari is still awaiting user device testing. The application presents this route after the 3D welcome room for ordinary production visits. The earlier paper curriculum remains available through **Full lessons**. This is an independent bilingual educational simulation associated with NASA Space Apps Challenge “Build a Junior Astronaut Mission Trainer”; it is not a NASA product, mission tool, or safety guide.

## Shared interaction loop

Each round places one child-friendly scenario, a short science explanation, a primary action and a source card on the Lunar Mission Table. NOVA frames the question; the player operates a 3D task room or a responsive evidence/control activity; the action is saved in `outpost-mission-board-v1`; the status rails reflect game-rule consequences. Source cards separate measured NASA fields, contextual facts, derived estimates and invented game rules. No learner name, birth date, address, face, voice or other direct identifier is requested.

## Route

| Turn | Story and NOVA | Player operation and visible result | Evidence and limits |
|---|---|---|---|
| 1 · Probe assembly | “What parts would you pack to power a lamp, radio and fan?” NOVA asks how a helper can get energy, observe and send discoveries. | Enter the 3D engineering lab. Inspect the parts, pick them up, orient, align and seat solar panel, battery and antenna modules; activate the probe. The existing lab boot animation and simulated power/shielding change remain in use. | NASA spacecraft systems are context. Fitting, reliability and resource changes are educational rules, not a lunar-probe specification. |
| 2 · Site planning | A camp site trades level ground against view and access. NOVA asks what matters most instead of naming a “correct” site. | Compare and select one of three records. Coordinates and relative topography are product fields; the displayed point-comparison score updates simulated power/science rails. | User supplied LOLA RDR points. Slope is a sparse-point local estimate, not an official LOLA slope product. These points are not landing-site recommendations. Sunlight, ice, communications, hazard and safety are not inferred. |
| 3 · Gravity and resources | NOVA asks whether one backpack has the same weight on Earth and the Moon. | Adjust payload mass and power priority. A live classroom calculator displays Earth and lunar weights using W=m·g; the power selection changes the mission table rail. | NASA lunar surface gravity 1.624 m/s²; Earth standard gravity is a comparison constant. The orbit model is illustrative, not an orbit or trajectory solver. |
| 4 · Communications | A far-away message takes time. NOVA compares a spacecraft link with sending a message to a distant friend. | Enter the 3D communications station; drag-align the antenna, observe/replay the signal sequence, decode it and transmit. Game data/power rails change. | DONKI snapshot is user-supplied and partial. Event type/date are task context only. Effects are invented educational simulation, not dose, health impact, warning or prediction. If no usable event is loaded, the UI says educational simulation. |
| 5 · Science observation | A shadow is a clue, not proof of water. NOVA asks what was seen, inferred and what evidence is still missing. | Classify the claim and enter the 3D observatory. Aim the instrument and scan the terrain; the scan adds an observation record. | Bundled static NASA Science Photojournal PIA13720 is distinct from five saved NASA Images API results. Illumination and search metadata do not measure ice. |
| 6 · Diagnose and repair | A flickering light prompts a check of shared power before replacing a part. | Enter repair lab, trace the fault, connect the affected circuit and run activation. Water/power status rails show the game consequence. | BVAD Rev. 2 Table 4-20 printed p. 72 supplies a 3.2 kg/crew-member-day transit water scenario; 0.64 kg per point is a game conversion. Repair cost and recovery are not NASA maintenance quantities. |
| Finale · Outpost decision | NOVA asks how to prioritize before the next delivery. | Choose at least two priorities among life-support reserve, water recovery and communications backup. Each selected priority changes the simulated status rail. The board generates a local mission record and certificate view. | The final outcome is an educational decision model. It is not a real lunar-base safety recommendation or a full systems simulator. The report lists the evidence/limits on each round; no unsourced value is converted into a NASA fact. |

## Re-entry, state and optional material

Board round, chosen point, mass/power control values and action log are saved in local storage. Closing a 3D room returns the player to the current board round; successful operation advances one turn. Data evidence is supplied to the board only after mission-data loading completes. Full lessons retain the existing paper pages, reflections and retryable quizzes, but are not required to reach the board certificate.

## Implementation map

- `src/game/MissionBoard.ts`: round definitions, NOVA prompts, evidence cards, responsive controls, save/restore, learning records, status changes and certificate view.
- `src/game/mission-board.css`: large-screen and narrow-screen mission table, accessible controls, scroll behavior and system colors.
- `src/game/Game.ts`: welcome-to-board routing, existing 3D room launch/return integration, language updates and data handoff.
- `src/game/NASADataProvider.ts`: source data access and gravity comparison used by evidence/action controls.
- `src/game/ProjectInfoPanel.ts`: Data Lab source language aligned with the supplied LOLA records and limitations.

## Current verification limits

Production build success proves type-check and bundling only. It does not verify uninterrupted completion, physical iPhone/iPad/Android behavior, or origin transactions for the supplied NASA package. Those results must be recorded separately after the corresponding tests are run.

## Verification record (2026-11-13)

- `tests/mission-board.spec.ts`: 16/16 passed across desktop Chromium and mobile Chromium device emulation, including the uninterrupted fresh-storage route through certificate. Browser emulation is not physical Safari validation.
- Dedicated regressions cover the observation evidence control and scan, communications return to the mission table, finale-choice activation, target viewport widths (375×812, 768×1024, 1024×768) and Normal/Large/Extra large UI text.
- `npm run check:nasa-data`: passed using the user-supplied package and local fixtures; this is not a new NASA network query.
- `npm run build`: passed. Vite still reports the existing ~1 MB application bundle warning; `THREE.Clock` reports a deprecation warning in browser tests.
- The full legacy Playwright suite after the final code changes remains a separate acceptance item until its final run is recorded. Physical iPhone/iPad testing remains pending user results.

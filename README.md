# Outpost Control · Junior Astronaut Mission Trainer

Outpost Control is a bilingual educational mission-management game presented as a first-person 3D lunar operations desk. Players stay seated at the console and operate physical controls with the mouse; there is no avatar walking or map traversal. Mouse movement gently shifts the viewpoint. Hover over a control to move to its bounded focus position. Move the pointer away or press Escape to return. The in-scene procedure screen explains the control and its current availability.

## Run locally

```bash
npm install
npm run dev
```

The game runs in a desktop or mobile browser. Mouse input is the primary control; narrow viewports use a wider camera and reduced rendering cost. Language can be switched between English and Traditional Chinese from the upper-right switch.

## Mission loop

The current scenario is a lunar south-pole outpost over 12 sols. Each sol allows one successful subsystem command. The physical desk includes controls for mission planning, spacecraft checkout, power, communications, navigation, science observations, data analysis, water recovery, food growth, event review, event response, and the mission clock. The switch pauses or resumes the clock; advance moves one sol, while clicking the skip dial moves up to three sols. Drag the skip dial right for accelerated time and left to stop it. Acceleration stops at an event so the crew response can be chosen first.

Drag the power slider to trade water for power; drag the habitat token across three teaching sites to choose a lunar base location, the spacecraft lever to test thrust, and the navigation marker to choose a route and its fuel cost. The science dial adjusts observation intensity horizontally and aim vertically. Drag the analysis marker to compare synthetic teaching samples. Power, water/oxygen, food, crew condition, propellant, shielding, and science data interact. System prerequisites, resource costs, one-command-per-sol locking, and a short action cooldown prevent repeated clicks from charging twice. Events and daily life-support use change the resource state. The mission ends with a debrief that summarizes resource margins, science records, and the decision trade-offs.

The first-visit guide highlights the next available device and walks through supplies, planning, spacecraft checkout, communications, event choices, navigation and a first observation. GUIDE opens a separate training mission and restores the current mission on completion or skip. Tutorial progress is stored in this browser.

## Lunar base site training

The plan device is a three-site lunar teaching board. Drag the habitat token to a bright ridge, balanced rim, or shadow edge and release to commit. The sites affect daily electricity and water consumption; the shadow site also gives a simplified science bonus. The trade-offs and numbers are invented game rules, not measured NASA site conditions. The categories of sunlight, water, temperature and communications are inspired by NASA's [LRO Educator Resource Kit](https://science.nasa.gov/wp-content/uploads/2024/01/lro-educator-resource-kit.pdf), especially its lunar south-pole site-selection activity. Real ice availability varies and needs verification. Site selection and resource rules work without a network; a later data integration still needs scientific and schema review.

## Assembly and fault tracing

In the in-world centre monitor, choose **ASSEMBLE**, then drag the three-dimensional panel, tank and shield models to their matching purposes. When all parts are fitted, activate the finished unit to spend one command and 4 power for 10 shielding. On the left monitor, choose **REPAIR** and drag each power, water, or data line to its correct system. Activating the repaired circuit uses one command and 3 water as a simplified cooling cost and restores 12 power. Wrong matches can be retried; both rewards are limited to once per mission. These effects are invented educational rules, not NASA-certified engineering outcomes. Each panel has a return control. Both activities are offline.

## NOVA, the cabin and signal training

NOVA is a procedurally modelled 3D helper with floating motion, animated arms and blinking eyes. It travels near the active tutorial control and types a short bilingual instruction. It reacts to mission actions and events. Its chirps, feedback and quiet procedural music use Web Audio and start after a player gesture; volume and mute are on the right monitor. No recorded voice, third-party music or paid audio service is used.

Move the mouse for gentle parallax. Hold and drag the **right mouse button** to rotate the seated view; press **R** to return forward. Escape closes a close-up. The cabin has control, science, maintenance, and rear living/hatch areas in one room; these are not separate navigable rooms. The central monitor's **SIGNAL** game shows a four-symbol sequence, then asks the player to repeat it. Completing the fictional signal and transmitting costs 3 power for 10 data, once per mission. It is not a NASA encoding or observation.

## Opening, sound and study room

The lobby opens with a locally modelled starfield and habitat. Choose **Begin Adventure** to enter; **Skip Intro** immediately advances the background arrival animation. Browser audio starts after an interaction. Lobby sliders and the right in-world monitor control separate music, effects and NOVA-voice levels. Synthesized lesson motifs, filtered cabin ambience and distinct mechanical interaction sounds accompany the electronic NOVA syllables; music quiets while NOVA speaks. No external music service or recorded voice is used. Room changes use a brief soft white transition (disabled when reduced motion is requested).

NOVA follows the camera view while its readable subtitle stays within the screen; click the subtitle skip control or press Space to finish displaying a message. In the study room, the paper lies flat and the camera uses a fixed overhead view. Every lesson has a short illustrated knowledge page before its paper question. These educational descriptions are not real-time forecasts or mission instructions.

## The Junior Astronaut journey

The lobby is the prologue, followed by six lessons (assembly, mission planning, flight, communications, observation, and repair) and a final integrated mission. NOVA introduces each lesson and points to the relevant controls or in-world screen. The three-dimensional assembly pieces use a monitor-based matching interaction; flight includes a draggable lunar orbit ring; communications uses a fictional signal pattern; repair requires matching circuits. These are educational simulations, not flight-qualified procedures. Mission planning uses the existing lunar site token and simplified resource costs.

A first-time welcome introduces NOVA, a clearly labelled practice sequence and a six-lesson mission map; returning players resume their existing progress. Each lesson presents three introductory pages with a question, one concept and a saved prediction before an activity. A fourth page recalls that prediction and invites reflection, followed by three questions with feedback and retries. The original longer material remains available under “Want to know more?”. The light-and-shadow activity and radio travel times are illustrations, not measurements. The observation exercise separates a visible dark area from the unsupported claim that it contains ice. Some matching and sequence questions still ask learners to select a prewritten answer rather than freely sorting pieces. The final mission requires water recycling, observation and a simulated alert response. The certificate is a game souvenir, not a NASA credential. The mission log saves answers, retries and an optional reflection locally; it cannot establish whether a child truly understands a concept.

A clearly labelled fictional training reserve is available when power, water or food falls below 18. It raises power and water to at least 45 and food to 36, at most once per simulated day; it cannot be used while paused or during an unresolved event. This is a game-accessibility mechanism, not an actual NASA resupply model. New reading choices and reflections are saved in the existing browser progress record; older snapshots skip an added post-activity reflection when already in an existing quiz rather than being reset.


### Image and scientific sources

- NASA/GSFC/Arizona State University, [South Pole Illumination Map, PIA13720](https://science.nasa.gov/photojournal/south-pole-illumination-map/), accessed 2026-11-06; source image: https://assets.science.nasa.gov/dynamicimage/assets/science/psd/photojournal/pia/pia13/pia13720/PIA13720.jpg?crop=faces%2Cfocalpoint&fit=clip&h=1214&w=1214 . The locally bundled image shows an LRO illumination map in lesson five's study notes. Brighter and darker areas convey illumination history, not measurements of water ice. NASA content generally permits educational reuse subject to its [media usage guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/); the credited ASU collaboration is retained and no endorsement is implied.
- [NASA Moon Base FAQ](https://www.nasa.gov/moon-base-frequently-asked-questions/), accessed 2026-11-06: site selection and the role of power, life support and communications in the learning text.
- [NASA LRO educator resource kit](https://science.nasa.gov/wp-content/uploads/2024/01/lro-educator-resource-kit.pdf), [NASA ECLSS overview](https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/), [NASA Moon Water and Ices](https://science.nasa.gov/moon/moon-water-and-ices/), and [NASA radiation protection](https://science.nasa.gov/science-research/heliophysics/how-nasa-will-protect-astronauts-from-space-radiation-at-the-moon/), consulted 2026-11-06: site selection, water recycling, the uncertainty of ice clues, and shielding.

The challenge and NASA reference links are provided for context; recheck current challenge dates and submission requirements before entering. The image and NASA educational resources are historical material; resource costs, failure scenarios and route mechanics are fictional teaching simplifications.

## Cross-device controls

Use the left and right arrow keys or A and D to move sideways in the welcome room, control desk, and study room. On the control desk, moving sideways closes an open equipment close-up first. In the welcome room, W/S or the up/down arrows move forward and backward; touch users can use the on-screen directional controls. Text inputs keep their normal keyboard behavior.

The gear in the upper-right corner opens sound, language, text-size, motion and camera controls. Camera zoom is on by default and supports a mouse wheel, two-finger pinch, and the zoom buttons; it can be disabled in settings. Use Reset view to return to the standard view. Text scaling is independent of camera zoom. On touch input, the navigation strip offers workspace movement, return, and a Find goal shortcut. Selected adjustable equipment gets a larger slider; the time control advances on confirmation at 100 and then resets. Workshop parts and sockets can be selected in two taps. The mobile-accessible paper presents the same saved reading and quiz state with larger controls. An optional seven-step text welcome follows the same persisted 3D tutorial step, and can return to that exact point. The data/source and Space Apps preparation panel is reachable in Settings and from the final mission record; checklist entries are local and exportable, not submitted automatically. Desktop, tablet and phone behavior still requires hands-on device validation.

## NASA data status

The adapter and dated snapshot contract are ready, while the bundled snapshot is intentionally empty. The game therefore uses clearly labeled offline education cases today. It does not require a live NASA request to play. After one successful online load and service-worker installation, the application shell and last saved snapshot are cached for later offline use in the same browser; actual browser/offline behavior still needs device verification. On 13–14 November, retrieve a dated snapshot using the command in the integration guide after setting `NASA_API_KEY` in the local shell; the key is never written to the snapshot or browser. The script validates the response and preserves the offline file if retrieval fails or returns no records. See [NASA data integration](docs/nasa-data-integration.md).

DONKI solar-weather records are not lunar surface dose measurements or crew-safety forecasts. The game must not turn them into a NASA-certified risk score. Any shelter costs or crew-condition changes remain clearly labeled educational rules. Outpost Control is not a NASA product, an operational forecast, a crewed-mission decision tool, or a NASA-certified model.

## Project structure

- `src/game/ConsoleRoom.ts` builds the procedural 3D room, physical console controls, displays, lighting, and pointer-raycast targets.
- `src/game/MissionEngine.ts` contains mission state, system costs, sol progression, event choices, and action cooldowns.
- `src/game/TutorialGuide.ts` determines the next actionable tutorial step; `src/game/FocusPreset.ts` provides bounded camera destinations.
- `src/game/NASADataProvider.ts` validates the dated snapshot and supplies the offline fallback.
- `src/game/language.ts` contains English and Traditional Chinese interface and scenario text.
- `docs/nasa-data-integration.md` explains the official snapshot workflow and science limitations.

Scene geometry, HUD artwork, and the paper texture are generated locally with Three.js and canvas; the interface uses system fonts and has no external image, font, audio, or paid API dependency.

## Checks

```bash
npm run build
node --experimental-transform-types scripts/check-curriculum.mjs
node --experimental-transform-types scripts/check-quiz-paper.mjs
node --experimental-transform-types scripts/check-core.mjs
node scripts/check-offline-cache.mjs
node scripts/check-donki-import.mjs
npm test
```

The browser checks cover physical-control clicks, per-sol command locking, event progression and response, language switching, and viewport fit. Playwright requires Chromium to be installed in the environment.

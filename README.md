# Outpost Control — Junior Astronaut Mission Trainer

Outpost Control is a **bilingual (English / Traditional Chinese) 3D lunar-base education game** created for the NASA Space Apps Challenge **“Build a Junior Astronaut Mission Trainer.”** The production flow is now one compact 3D mission board: learners compare LOLA point data, adjust a physical antenna, reason from lunar imagery, connect a repair circuit, then make integrated outpost priorities.

The home screen leads directly to the single 3D board (about 10 minutes) with no welcome-room gate, course selector, or alternate lesson route. NOVA provides short contextual coaching and each turn offers physical board interaction, a brief readable task panel, result feedback and source/limitations details. See [the board-only rebuild report](docs/urgent-board-rebuild-report.md) for implemented interactions and verification. Legacy lesson classes remain in the repository pending cleanup, but the production start path does not route into them.

**This is an independent educational game, not a NASA product, NASA-certified trainer, operational mission simulator, radiation-dose forecast, or lunar-base safety tool.** Game values and consequences are classroom simulations. Only the references and datasets explicitly marked as used below are represented as NASA material. See [NASA_REFERENCES.md](NASA_REFERENCES.md), [data audit](docs/nasa-data-audit.md), and [test report](docs/TEST_REPORT.md).

## Current NASA data status

NASA material currently used in the game:

- A static **NASA Science Photojournal** LRO south-pole illumination image (PIA13720) in the observation lesson. It is not an Images API result; lighting is not a direct measurement of ice.
- NASA BVAD Rev. 2 Table 4-20 water-consumption reference values. The Transit Vehicle value (3.2 kg per crew-member-day) is converted to the game’s daily water baseline using a clearly identified educational scale. These values now come from the checked-in JSON data file used by the game logic.
- NASA’s lunar surface-gravity reference (1.624 m/s²) drives the lesson’s mass-to-weight comparison. The learner’s comparison is saved locally. It does not calculate an orbit or trajectory.

**Imported from the user-provided package:** preserved raw DONKI responses for CME/GST/HSS/IPS and a valid empty SEP response (FLR was not obtained), five NASA Images API results, and three LOLA RDR representative points with relative topography and locally derived slope estimates. All 24 package SHA-256 entries validated locally. This executor did not repeat the origin requests; acquisition metadata and limits are retained with the package. Game effects and terrain scores are educational abstractions, not mission or safety predictions.

## Run locally

```bash
npm install
npm run dev
```

The project uses Three.js for the shared 3D scene. Mouse, keyboard and touch controls are available in the browser; touch-friendly interaction and the accessible study panel are implemented, but physical iPhone, iPad and Android devices have not been verified for this release. English and Traditional Chinese can be selected in settings.

## Learning journey and game effects

| Stage | Learner activity | Data/fact and actual effect | Limitation |
|---|---|---|---|
| 1 · Site | Drag the habitat token to one of three LOLA candidate pads and compare measured coordinates/topography plus package-derived slope | Chosen point and educational score enter the mission state | Candidate points are not NASA landing recommendations; slope is derived from sparse returned observations and the score is an educational rule |
| 2 · Event and communication | Drag the physical antenna gimbal to align it, then protect reserve or continue the data transmission | Choice changes simulated power and data; event record/date is shown when a verified supplied DONKI record is available | DONKI snapshot is user-supplied, partial, and not independently re-requested here; game effects are not dose, forecast or safety prediction |
| 3 · Observation evidence | Select a 3D classification tile for the claim that an image shadow proves water ice | Evidence classification updates the mission record | Image metadata does not establish ice; PIA13720 is a distinct static Photojournal source |
| 4 · Repair | Select the backup power plug and connect it to the life-support port | Repair completion updates simulated power and water | BVAD supplies a context baseline only; the repair cost and circuit behavior are educational abstractions |
| 5 · Integrated finale | Choose at least two mission priorities and resolve the board | Resource outcomes, five decisions, provenance IDs and certificate state persist locally | It is a short educational challenge, not a complete mission simulator or full six-course NASA curriculum |

The five turns provide a shorter judge-ready activity rather than the former lesson-by-lesson curriculum. The longer course implementation has not been deleted, but it is not on the normal home-to-game route; further removal and regression cleanup are tracked in `FEATURE_AUDIT.md`.

## Controls and accessibility

- Drag the habitat token, gimbal antenna and point/click the evidence and repair ports; DOM buttons remain as accessible alternatives. No hover is required.
- Mouse wheel, pinch and on-screen controls adjust camera zoom by default. Text size is independent and supports 100%, 150% and 200% settings.
- The settings panel offers language, audio, reduced motion, text size, camera zoom and reset view. NOVA subtitles and mission state are retained in the browser save.
- The local final record contains course answers, retries, reflections and actions. It is a game record, not proof of learning or an official certificate.
- The game does not request or upload a learner’s name, birth date, address, face or voice. Progress and course answers are stored locally. Do not include minors’ personal details in any external submission or shared screenshot.

## Sources, media, libraries and licensing

NASA and external references, actual in-game use, query/verification dates, terms, bundled media credits, code dependencies and outstanding rights questions are listed in [NASA_REFERENCES.md](NASA_REFERENCES.md). The only bundled external image is PIA13720 with NASA/GSFC/Arizona State University credit. Scene geometry, HUD art, the study-paper texture and sounds are generated locally; audio uses browser Web Audio, and text uses operating-system fonts. No recorded voice, external music, external font or paid API is bundled.

**The repository does not yet have an authorized project-wide OSI license.** `LICENSE` records that rights-holder confirmation is pending. The presence of public NASA material or open-source dependencies does not grant a license to the project’s original code/content or to every third-party asset.

## NASA data acquisition and tests

```bash
npm run check:nasa-data
npm run build
npm test
git diff --check
```

Mock-based ingestion checks verify validation and failure handling; they do not prove NASA connectivity. The current test report separates mock checks, genuine source evidence, browser emulation and physical-device gaps. Review [docs/nasa-data-integration.md](docs/nasa-data-integration.md) before acquiring a snapshot. Never turn a DONKI event type into a real radiation dose, health prediction or safety instruction.

The current single-board flow, source boundaries and test evidence are summarized in [docs/urgent-board-rebuild-report.md](docs/urgent-board-rebuild-report.md). Earlier course reports document the archived learning sequence. The raw user-provided NASA package and original checksums are preserved under `public/data/nasa/user-submitted-package/`.

## Project map

- `src/game/Game.ts`, `MissionEngine.ts`: scene coordination and game-state transitions.
- `src/game/Curriculum.ts`, `Journey.ts`, `LearningActivities.ts`, `ReadingPanel.ts`: bilingual lessons, persisted progress and assessments.
- `src/game/NASADataProvider.ts`: validated DONKI/Images API adapters, offline fallback and classroom source registry.
- `public/data/nasa/`: provenance, water/gravity references, raw NASA package evidence, LOLA point records and API-access audit.
- `NASA_REFERENCES.md`: source, media, package and rights inventory.
- `FEATURE_AUDIT.md`: implemented behavior, test evidence and open feature gaps.

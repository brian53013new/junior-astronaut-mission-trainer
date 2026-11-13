# Outpost Control — Junior Astronaut Mission Trainer

Outpost Control is a **bilingual (English / Traditional Chinese) 3D lunar-base education game** created for the NASA Space Apps Challenge **“Build a Junior Astronaut Mission Trainer.”** Learners join NOVA to assemble a probe, compare illustrative lunar sites, plan a flight, align a communication link, inspect lunar imagery, repair a system, and make resource choices in an integrated outpost mission.

**This is an independent educational game, not a NASA product, NASA-certified trainer, operational mission simulator, radiation-dose forecast, or lunar-base safety tool.** Game values and consequences are classroom simulations. Only the references and datasets explicitly marked as used below are represented as NASA material. See [NASA_REFERENCES.md](NASA_REFERENCES.md), [data audit](docs/nasa-data-audit.md), and [test report](docs/TEST_REPORT.md).

## Current NASA data status

NASA material currently used in the game:

- A static **NASA Science Photojournal** LRO south-pole illumination image (PIA13720) in the observation lesson. It is not an Images API result; lighting is not a direct measurement of ice.
- NASA BVAD Rev. 2 Table 4-20 water-consumption reference values. The Transit Vehicle value (3.2 kg per crew-member-day) is converted to the game’s daily water baseline using a clearly identified educational scale. These values now come from the checked-in JSON data file used by the game logic.
- NASA’s lunar surface-gravity reference (1.624 m/s²) drives the lesson’s mass-to-weight comparison. The learner’s comparison is saved locally. It does not calculate an orbit or trajectory.

**Not obtained or imported:** there is no real DONKI JSON snapshot, no NASA Images API query result, and no row-level LOLA elevation/slope dataset. The site profiles and offline event scenarios are explicitly educational examples. In this environment, DONKI, NASA Images API and direct PDS data requests were blocked before an origin response; no NASA HTTP status or raw API body was received. The blank DONKI snapshot must remain blank until a genuine response is retrieved and verified.

## Run locally

```bash
npm install
npm run dev
```

The project uses Three.js for the shared 3D scene. Mouse, keyboard and touch controls are available in the browser; touch-friendly interaction and the accessible study panel are implemented, but physical iPhone, iPad and Android devices have not been verified for this release. English and Traditional Chinese can be selected in settings.

## Learning journey and game effects

| Stage | Learner activity | Data/fact and actual effect | Limitation |
|---|---|---|---|
| NOVA welcome | Explore the 3D practice room; try a button, dial, switch, book and hatch | Saved tutorial step and transition into the cabin | Not an unrestricted walkable base |
| 1 · Probe assembly | Identify, rotate, fit and activate probe modules | Module choices and assembly alter simulated readiness, power and shielding | NASA spacecraft-system pages are references; fitting/reward values are game rules |
| 2 · Site and energy | Move a site token and trade power against water needs | BVAD’s 3.2 kg water reference drives a 5-point daily baseline (3.2 ÷ 0.64); this changes mission water over time | Three site profiles, scores and surcharges are fictional, not LOLA measurements |
| 3 · Flight | Adjust an illustrative orbit ring; compare an object’s weight on Earth and Moon | 1.624 m/s² drives the lunar weight calculation; the result is saved as a learning record | The visible ring and route costs are not a physical orbit or flight calculation |
| 4 · Communications | Align an antenna and repeat a signal pattern | Completion changes simulated communications/data state | NASA DSN material is course context; no real DONKI event is loaded and the pattern is not NASA encoding |
| 5 · Observation | Aim, scan and compare visible evidence with inference | Static PIA13720 image is observed; scan/data yield is simulated | Image brightness indicates illumination, not water abundance |
| 6 · Repair | Inspect labels, match lines and retest | The repair task changes simulated water and power | Circuit and repair costs are not actual ECLSS procedures or NASA repair data |
| Finale | Recycle water, observe and respond to a simulated alert | Multiple choices change saved mission resources and learning records | Alert, shelter and shielding effects are fictional; they do not advise crew safety |

Each lesson includes a life analogy, concept introduction, device activity, result/reflection and questions with feedback and retry. The questions still include multiple choice and matching; the entire curriculum has not been converted to open-ended physical challenges. Per-lesson NASA reference cards are shown in the study panel where applicable, with factual context separated from game effects.

## Controls and accessibility

- Arrow keys or A/D move between seated work zones; in the welcome room W/S or up/down also move forward/backward.
- Drag actual sliders, knobs, map tokens and assembly components; buttons are activated by tapping/clicking. Touch input does not require hover.
- Mouse wheel, pinch and on-screen controls adjust camera zoom by default. Text size is independent and supports 100%, 150% and 200% settings.
- The settings panel offers language, audio, reduced motion, text size, camera zoom and reset view. NOVA subtitles and mission state are retained in the browser save.
- The local final record contains course answers, retries, reflections and actions. It is a game record, not proof of learning or an official certificate.

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

The implemented bilingual lesson sequence and its evidence limits are summarized in [docs/course-content-report.md](docs/course-content-report.md).

## Project map

- `src/game/Game.ts`, `MissionEngine.ts`: scene coordination and game-state transitions.
- `src/game/Curriculum.ts`, `Journey.ts`, `LearningActivities.ts`, `ReadingPanel.ts`: bilingual lessons, persisted progress and assessments.
- `src/game/NASADataProvider.ts`: validated DONKI/Images API adapters, offline fallback and classroom source registry.
- `public/data/nasa/`: provenance, water/gravity references, empty LOLA record and API-access audit.
- `NASA_REFERENCES.md`: source, media, package and rights inventory.
- `FEATURE_AUDIT.md`: implemented behavior, test evidence and open feature gaps.

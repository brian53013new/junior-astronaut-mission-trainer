# Junior Astronaut Mission Trainer — Course Content Report

Date: 2026-11-13
Source revision: `a836ba7f2868de44294065887ff4a46cf7f94452`

The required short-form route is now the six-turn Lunar Mission Table described in [`mission-board-course-report.md`](mission-board-course-report.md) and implemented by `src/game/MissionBoard.ts`. The earlier paper-led `Journey` route remains available as optional full lessons; this document records that curriculum. It is not a claim that every lesson is NASA-data driven. The game is an independent bilingual educational simulation, not a NASA product or mission tool. It stores lesson choices and action summaries locally; it is not intended to collect a learner's name, birth date, address, face, voice, or other direct personal identifier.

## Shared lesson rhythm

Each lesson is framed as a child-friendly everyday question, introduces a science idea, asks the learner to make a prediction, bridges to a 3D device task, invites reflection, and ends with a retryable knowledge check. NOVA provides the in-game guidance and learning explanations. Sources are shown beside the relevant lesson material. NASA facts are separated from game-created values and simplified effects.

## Lesson sequence

### 1. Build a probe

- **NOVA / everyday entry:** A lunar base needs clues, so the learner helps build a robotic explorer. The analogy compares each part to useful bicycle equipment.
- **Learning focus:** Solar panels supply electricity; batteries store energy; antennas send data; instruments collect observations; shielding has a protective role.
- **Player activity:** Predict what happens when a camera has no power, inspect and assemble probe parts, activate the probe, and reflect on power and protection.
- **Outcome / record:** The assembly action and answer attempts are saved in the learning record. The lesson explanation connects power to other systems.
- **Source and limits:** NASA spacecraft systems provide background context. Part selection, fitting, and success values are game rules; the referenced Aura spacecraft is not a lunar probe specification.

### 2. Plan the mission site

- **NOVA / everyday entry:** Choose where to camp when power, water, and safety all matter.
- **Learning focus:** Sunlight can support solar generation; some cold shadows may preserve ice, but darkness alone is not evidence of water. A real site decision must consider more than one factor.
- **Player activity:** Predict which area favors solar panels, compare three LOLA RDR representative points, move/select a base marker, then explain one reason and one caution.
- **Outcome / record:** Site choice and reflection are recorded. The simulated water baseline affects the game resource calculation.
- **Source and limits:** NASA Moon Base Systems is contextual reference. BVAD Rev. 2 Table 4-20, printed page 72, provides the packaged Transit Vehicle water baseline (3.2 kg per crew-member-day); division by 0.64 kg per game point is an educational conversion. Coordinates and relative topography come from supplied LOLA RDR rows. Slope is a package-derived sparse-point estimate, not an official product. Sunlight and resource modifiers remain illustrative; the point comparison score is an educational mapping, not a safety assessment.

### 3. Into space

- **NOVA / everyday entry:** A thrown ball falls because gravity continues to pull it.
- **Learning focus:** Gravity and forward motion both matter to orbit. Mass is not weight; weight depends on local gravitational acceleration.
- **Player activity:** Predict whether gravity acts on an orbiting satellite, use the flight control/model, and compare the same mass under Earth and lunar surface gravity.
- **Outcome / record:** The calculator uses weight = mass × acceleration and saves the learner's comparison. Route and fuel changes remain simplified game results.
- **Source and limits:** NASA's Moon by the Numbers reference provides 1.624 m/s², used by the calculation. The displayed orbit ring is a teaching model, not a real orbit or flight planner.

### 4. Talk to Earth

- **NOVA / everyday entry:** A message to a far-away friend takes time; a spacecraft signal also needs time to travel.
- **Learning focus:** Radio waves are electromagnetic waves and can propagate through vacuum; sound requires a medium. Distance affects signal travel time.
- **Player activity:** Predict signal delay, operate the communications exercise and transmit a pattern, then explain why a distant reply is not immediate.
- **Outcome / record:** Communication actions and quiz attempts are saved; any resource or event effects are explicitly simulation rules.
- **Source and limits:** NASA Space Place / DSN material provides context. A user-supplied, hash-checked partial DONKI snapshot is available to the short-form mission board as event context. The game does not convert event types into radiation dose, health risk or a forecast. The legacy signal pattern is not NASA encoding.

### 5. Be a space scientist

- **NOVA / everyday entry:** A detective compares clues instead of treating one clue as a complete answer.
- **Learning focus:** Separate observation (“the map shows a dark area”) from inference (“there may be ice”) and identify what further evidence is needed.
- **Player activity:** Adjust an observation instrument, compare visual clues, state what is seen, and decide whether a conclusion needs more evidence.
- **Outcome / record:** Instrument actions, clues, and quiz attempts are recorded. Displayed signal strength is a game simulation.
- **Source and limits:** The existing PIA13720 asset is a separate NASA Science Photojournal static image, not an Images API result. Five user-supplied NASA Images API result records are also bundled and shown in the Data Lab / short-form evidence card. Neither search metadata nor illumination directly measures ice; no dark patch is presented as proof of water.

### 6. Emergency repair

- **NOVA / everyday entry:** If a lamp does not light, inspect its switch and power before replacing parts at random.
- **Learning focus:** A shared symptom can have several causes. Observe, form a hypothesis, inspect a system, repair, then verify the result. Systems and supplies can affect one another.
- **Player activity:** Diagnose a simulated fault, inspect the labeled connection paths, choose/connect the likely system, and verify recovery.
- **Outcome / record:** Diagnosis actions, repairs, and quiz attempts are recorded. The repair may change simulated resources.
- **Source and limits:** The verified water reference can inform resource context. The current “water spent to restore power” effect is game balancing, not a NASA maintenance baseline. No unsupported oxygen, food, energy, or waste values are introduced.

### Finale: Junior commander

- **NOVA / everyday entry:** Caring for a small home means considering people, power, water, food, and equipment together.
- **Learning focus:** Decisions involve connected systems, evidence, uncertainty, and trade-offs.
- **Player activity:** Review base status, choose a priority, recycle water, observe again, and respond to a simulated alert.
- **Outcome / record:** Choices affect the game state and are summarized for the mission record/certificate flow.
- **Source and limits:** Previously used science references may appear in the final source summary. The alert, resource changes, and response consequences are educational abstractions. A user-supplied DONKI partial snapshot and LOLA-derived comparison data are available in this build. Finale resource/event consequences remain game rules and are not a full operational model.

## Completion and evidence limits

The legacy route implements predictions, actions, reflections, retryable quizzes, and per-lesson records. The short-form board has its own persistent round and action records. A complete uninterrupted fresh-storage journey through every room, finale, mission record, and certificate remains a required verification item; component tests or isolated lesson tests do not prove that path.

## Data protection note

The course records gameplay progress and answers locally for learning feedback. This project report documents no collection of children's direct identifiers, faces, or voices. Recheck that statement if analytics, accounts, uploads, camera, or microphone features are added.

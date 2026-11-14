# Lunar Mission Table — UI design and implementation report

Updated: 2026-11-14

## Design intent

The uploaded UI brief asks for a board-led mission journey rather than a generic stack of lesson cards. The board is the primary navigation surface after the NOVA welcome sequence. It keeps the current learning question, evidence provenance, the six mission nodes, outpost resource state, and NOVA’s short instruction in one persistent composition. It remains a browser UI layered over the game’s existing 3D scene; the board map is a 2D mission-planning graphic and does not claim to be a 3D lunar terrain model.

## Visual system

| Token | Use | Value |
|---|---|---|
| Space | page background | `#0B1320` |
| Panel blue | mission panels and working surfaces | `#16283A` |
| Warm white | primary text | `#E9EEF2` |
| Amber | active task and teaching focus | `#F4B942` |
| Ice cyan | source links, data and interactive focus | `#66D9EF` |
| Mint | completed state and crew-safety rail | `#66E3A2` |
| Alert coral | reserved alert state | `#FF6B5F` |

The active node has an amber perimeter and explicit status text. Completed nodes use mint, data-ready nodes use cyan, and locked nodes are dimmed but stay keyboard-focusable so a child can inspect the sequence. The system uses square-cornered panels, visible dividers, a limited palette and a space-map texture. It avoids decorative neon and redundant nested gold frames.

## Information architecture

1. **Header:** project identity and Settings, Sources, Lessons controls.
2. **Current question:** active turn, child-readable prompt and approximate duration.
3. **Evidence tray:** relevant NASA references or saved dataset records. Each tile gives an authenticity tag, context, source link and limitation. Tiles can be selected and attached using a large button, or dragged to the current task/node.
4. **Mission map:** six nodes arranged around the outpost, linked by a route. Desktop/tablet show the whole board. Narrow screens show the active node plus a horizontal six-step strip.
5. **Resource rails:** power, water, crew safety and recorded data are read directly from `MissionEngine`; the board no longer keeps a competing copy of those values.
6. **Active task:** a room launch or a specific decision, with source and limitation details.
7. **NOVA strip:** current next step, live feedback, cancel/return controls, and a persistent mobile-safe footer.
8. **Mission record/certificate:** saved turn records and certificate action after the finale.

## Mission and evidence mapping

| Turn | Evidence required | Player action and game consequence | Source boundary |
|---|---|---|---|
| Probe assembly | Spacecraft systems reference | Fit three modules and complete startup in the engineering bay; consume 4 power and add 10 shielding points | NASA spacecraft information is context; parts and reward are educational game rules. |
| Lunar site planning | Three supplied LOLA RDR representative samples | Compare recorded coordinates, relative topography and locally derived slope; selected point changes simulated data and power | Slope is derived from sparse points, not an official LOLA slope product. Score is not landing safety. |
| Gravity and payload | NASA Moon gravity reference | Adjust payload mass and power priority; compute Earth/Moon weight with `weight = mass × gravity`, then commit load choice to MissionEngine | 1.624 m/s² is a reference value; no orbital or flight-path solver is represented. |
| Communications and event context | User-supplied partial DONKI snapshot | Align antenna, decode and transmit in the communications room; successful transmit changes simulated power and data | DONKI is a partial supplied snapshot, not a live query here; event effects are not radiation dose or hazard predictions. |
| Observation and evidence | Five supplied NASA Images API records; PIA13720 separately identified | Classify the “shadow proves ice” statement as inference before scanning in the observatory | Shadow/illumination is not direct water-ice evidence. A correct response unlocks the task; incorrect responses explain and allow retry. |
| Repair and life support | BVAD water reference and NASA ECLSS context | Diagnose and repair the 3D circuit in the repair bay; repair reward/cost changes the resource state | BVAD water reference has a scenario; repair costs and resource rewards are educational abstractions. |
| Finale | NASA Moon Base FAQ context and prior turn evidence | Select at least two outpost priorities; saved choices affect power, water, data and crew-safety rails | All decision deltas are invented game rules, not mission safety advice. |

Only factual context that was actually obtained and bundled is described as NASA data. The board labels supplied DONKI and Images API records as user-supplied, the LOLA values as supplied RDR samples with derived local slope, and fallback simulation as educational. It does not claim a live connection or NASA endorsement.

## Input and accessibility behavior

- Mouse, touch and pen share Pointer Events for evidence tiles. Pointer capture keeps a drag associated with its tile. A missed drop gives an explicit failure message; Escape cancels. The selectable-tile plus “Attach selected evidence” route avoids requiring precision dragging.
- Dragging evidence previews the drop target and only the current mission accepts the required tile.
- Locked nodes are focusable and report why the active task must be completed first. Arrow keys move focus across visible nodes; Enter activates; Escape exits the board or cancels a transfer.
- Buttons, route stops, checkboxes and range sliders use at least 44 CSS-pixel minimum touch areas. Focus rings are visible and high contrast.
- Settings reuse the existing language and text-size settings. The board uses a scalable root font and wraps labels. Room camera zoom and text size remain separate controls.
- Motion respects the site's existing reduced-motion preference; no flashing cue is used.

## Responsive behavior

- At 1000 CSS px and above, the evidence tray, mission map and resource rail use a three-column layout.
- Tablet widths use evidence and map columns with a full-width resource rail.
- At 760 CSS px and below, the active mission node is shown first, followed by route stops, resource rails, horizontally scrollable evidence cards and task controls. The NOVA strip remains at the bottom and observes safe-area insets.
- The board itself scrolls vertically; evidence cards scroll horizontally. The document is checked for horizontal overflow at 375×812, 768×1024 and 1024×768.

## Files

- `src/game/MissionBoard.ts` — board state, evidence, task routing, drag/drop, records and accessible UI.
- `src/game/mission-board.css` — palette, layout, status states, breakpoints and reduced-motion rules.
- `src/game/MissionEngine.ts` — canonical resource-changing training decisions.
- `src/game/Game.ts` — board-to-room wiring and canonical engine state.
- `tests/mission-board.spec.ts`, `tests/mission-board-ui-acceptance.spec.ts` — mission-flow and UI acceptance coverage.

# Lunar Mission Table — UI acceptance report

Updated: 2026-11-14

## Status definitions

- **Browser-emulated:** automated Chromium at the named viewport/device profile.
- **Physical device:** actual iPhone, iPad, or Android hardware and its native browser. No physical-device run is recorded in this report.
- **NASA data:** bundled user-supplied official-source response files with locally checked provenance. This is not a fresh live request by this run.

## Acceptance matrix

| Requirement | Result | Evidence |
|---|---|---|
| Evidence tray names authenticity, source and limits | Pass in browser | `MissionBoard.ts` cards and expanded source details; bundled records remain attributed to user package. |
| Drag tile to active node and unlock task | Pass in desktop Chromium | `evidence can be dragged…` acceptance test writes the expected tile ID to board storage and enables the Engineering lab action. |
| Select tile and attach without drag | Pass in desktop Chromium | Fresh mission and full journey tests exercise the one-tap selection plus attach action. |
| Invalid/wrong-node tile placement | Implemented; drag cancel/failure path present | Current handler checks mission ID and evidence ID; Escape/cancel and missed-drop messages are implemented. No dedicated automated wrong-node drag case yet. |
| Six mission nodes with visible progress | Pass in desktop and mobile Chromium | Mission-board suite exercises sequential flow; responsive board shows current node and numbered route strip. |
| Power, water and crew safety match game | Pass in full journey | Rails read the live `MissionEngine.state`; site, flight, room and finale choices pass through engine mutations. |
| Wrong observation classification can be retried | Pass in desktop and mobile Chromium emulation | Incorrect choices now show why and keep the room action locked; correct `Inference` unlocks it. |
| Keyboard focus and arrow navigation | Pass in desktop Chromium | Acceptance test focuses a node, advances with ArrowRight, then uses Escape and the return dock. |
| Text sizes 100%, 150% and 200% at target viewports | Pass in Chromium emulation | Existing mission-board viewport test checks 375×812, 768×1024 and 1024×768 at Normal/Large/Extra large settings. |
| Horizontal overflow at target viewports | Pass in Chromium emulation | Four screenshot tests assert document and board widths stay within viewport. |
| Phone touch interaction | Pass in mobile Chromium emulation | `touch selection and attach fallback` uses a touch-profile tap and verifies task unlock. Physical Safari remains unverified. |
| Physical iPhone/iPad/Android | Not verified | Requires a real-device run on the private preview; do not infer from emulation. |
| Source links opened in a browser | Not rechecked in this UI pass | Each card retains its official source URL, but link navigation is not part of the present automated suite. |
| Full new-storage route through certificate | Pass in desktop Chromium | The fresh-storage journey reaches all six 3D task rooms, records the finale and opens the certificate. |

## Visual evidence

Screenshots were captured from the Chromium-rendered mission board with fresh local storage and English interface copy:

- [Desktop 1280×720](ui-evidence/desktop-1280x720.png)
- [Phone portrait 375×812](ui-evidence/phone-portrait-375x812.png)
- [Tablet portrait 768×1024](ui-evidence/tablet-768x1024.png)
- [Tablet landscape 1024×768](ui-evidence/tablet-landscape-1024x768.png)

Screenshots are browser renders, not photographs of physical hardware.

## Verification record

- `npm run build`: passed. Vite reports one existing non-blocking bundle-size warning: the main JavaScript chunk is approximately 1.04 MB minified, above the configured 900 kB advisory threshold.
- `npm run check:nasa-data`: passed. Its own output states supplied NASA package data and mock API/cache/failure fixtures were checked; it does not certify a live NASA query.
- `git diff --check`: passed after implementation and report updates.
- Full Playwright suite (`CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test`): 106 passed, 10 configured skips, 0 failed, 116 total, desktop and mobile Chromium emulation; 37.2 minutes.
- Mission-board desktop suite: 8/8 passed.
- Mission-board plus UI acceptance mobile suite: 15 passed, 1 configured skip.
- New UI acceptance tests verify drag/drop unlock, touch selection fallback, keyboard navigation, retry explanation, and four viewport widths.
- Initial Playwright invocation without `CHROMIUM_EXECUTABLE_PATH` failed because the bundled Playwright Chromium binary is absent. System Chromium at `/usr/bin/chromium` was used for the complete rerun.

## Known limitations and next verification

1. The mission table is a responsive DOM layer over the existing game, not a new 3D lunar-table mesh. Its map visualizes the six-turn route; actual room interactions stay in the existing 3D scenes.
2. Mobile-browser emulation does not establish iPhone/iPad Safari hardware behavior. A physical check remains outstanding.
3. NASA files in the game were supplied in the project's data archive; this pass verifies them locally and does not perform a new NASA network retrieval.
4. The Vite build reports a non-blocking 900 kB advisory: the main JS chunk is about 1.04 MB minified; no code-splitting change was made in this UI pass.

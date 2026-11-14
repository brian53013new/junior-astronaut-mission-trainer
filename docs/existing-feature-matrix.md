# Existing feature recovery matrix — 2026-11-14

This matrix combines the board-only rebuild package with the teaching and 3D-interaction follow-up. Status refers to the current production board path, not dormant legacy scenes.

| Prior capability / requirement | Current production implementation | Evidence and limits |
|---|---|---|
| Home screen and start | Start opens the single persistent mission board. The former welcome/lesson DOM route is absent from the rendered production path. | `tests/board-only-rebuild.spec.ts`; old room/course source remains dormant and old route tests are not part of the active suite. |
| Guide replay without wiping the mission | Home and board actions restart the guide step only; existing site, completed turns, records and resources remain saved. | “lobby replay” E2E inspects the stored board after replay. |
| Child learning progression | Four short actions: place a habitat, open a source card, find one clue, rotate antenna, then confirm a choice. Full URL, provenance and limitation are progressively disclosed after the clue action. | “fresh save” E2E verifies source clue action and guide step change. The guide is a concise board tutorial, not the previous multi-room onboarding campaign. |
| NASA source facts and limits | LOLA, DONKI, Images API and BVAD cards show a child-level prompt, a data clue, provenance, official link and limitations. Events and effects remain identified as educational context/rules. | Board source drawer, `docs/nasa-data-audit.md`, `NASA_REFERENCES.md`; no claim that all lesson systems consume live NASA feeds. |
| Physical board interactions | Real 3D habitat placement, source-card selection, antenna drag, observation classification, repair-port connection and mission display hit target; accessible DOM controls offer alternatives. | Fresh-save E2E reaches the certificate; touch is represented by mobile Chromium emulation only. |
| Mouse camera parallax | Board-only yaw/pitch parallax is damped and clamped to a small angle, runs only over empty board space, pauses while dragging and returns neutral on canvas exit. | `board remains...` and reduced-motion E2E. The production board interaction is a bounded local parallax, not free-look camera orbit. |
| Mission screen focus and return | The rear-right physical 3D display has an expanded invisible hit surface for practical touch, plus a keyboard-focusable screen action. Open focuses the camera and opens the current source drawer; close/Escape returns to overview without changing board state. | Desktop and mobile browser E2E verifies actual ray hit, focus/return and preserved phase/site/resources; keyboard Enter/Escape is exercised. |
| Reduced motion | `prefers-reduced-motion` suppresses board parallax while keeping screen focus usable. | Reduced-motion E2E on desktop and mobile browser projects. |
| Language and responsive layout | Board copy switches English/Traditional Chinese and persists; current viewport check covers 375×812, 768×1024 and 1024×768 without horizontal overflow. | Browser-emulation suite; physical iOS/iPadOS and Android remain unverified. |
| Previous six-lesson campaign, workshop rooms and NOVA dialogue tree | Not in the current production start route. Legacy classes and tests remain in source as dormant code. | Explicitly open cleanup/migration work; no claim of full old-campaign restoration. |
| Full 360° console, physical room traversal, full assembly/service workshops | Replaced for the production path by the focused single-board experience; the current board is a desk-scale mission surface, not the previously requested walkable multi-room base. | Out of scope for this board-only build; do not report as implemented. |

## Acceptance record

The current automated suite is the board-only Playwright suite. It is not a substitute for physical device checks. A green mobile Chromium project establishes browser-emulation evidence only; Safari touch hit-testing, real iPad/iPhone safe areas and hardware performance still need a real-device pass.

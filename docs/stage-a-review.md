# Outpost Control — Stage A review draft

**Status: incomplete.** This document and the local changes are a reviewable handoff, not a verified interactive preview or a pull request.

## Requested outcome

Upgrade the existing first-person lunar command-desk game with a usable bilingual tutorial, bounded equipment focus, legible in-world screens, distinct physical controls, connected mission systems, and a clearly labeled NASA-data/offline architecture. The player remains at the console; the game is an educational simulation.

## Current local work

- The guide selects the next actionable system, highlights it, records tutorial progress and mission state, and offers a separate replay session that restores the current mission afterward.
- Device focus uses a bounded destination and a pointer-preserving orientation. Escape or moving away returns to the desk view.
- Physical controls include draggable power, thrust, mission-priority cards, route, science intensity/aim, and synthetic data-comparison controls; the time switch, accelerated clock, and event choices operate the mission model.
- The three 3D screens and text are enlarged. Environment and shielding information appear in the scene. Readability and pointer hit targets have **not** been verified in a browser.
- A validated NASA snapshot loader, historical-source attribution, offline teaching fallback, and service-worker cache logic are present. No NASA observation has been loaded into this build.

## Evidence collected

- `npm run build`: passed for the local working tree.
- `node --experimental-transform-types scripts/check-core.mjs`: passed model checks for the tutorial path, mixed offline events, gesture values, resource trade-offs, focus geometry, duplicate input, clock/events, and snapshot restoration/validation.
- `node scripts/check-offline-cache.mjs`: passed a simulated cache/network-failure check. This is not a real browser offline test.
- `node scripts/check-donki-import.mjs`: passed a mocked import check; no live NASA data or API key was used.
- Browser walkthrough, real-device performance, visual readability, camera behavior during pointer interaction, actual service-worker installation, and accessibility: **not verified** in this environment.

At preparation time the existing owner-controlled Sites URL pointed to the earlier published version. The current deployment result must be checked separately; this document alone is not evidence of an interactive preview. No GitHub branch or pull request was created for this handoff. The only configured remote is the private Sites source repository; a matching GitHub repository was not found among the searched installations.

## Proposed PR for review

**Title:** Improve lunar-console training, device controls, and offline fallback

**Description:** Replace the short orientation with a resumable first-observation guide and isolated replay; bound device focus; add distinct desk interactions tied to mission costs and outcomes; and prepare a validated historical NASA snapshot and offline fallback. Verify actual desktop and mobile operation, text readability, guide completion, focus stability, and offline installation before release. The bundled observations remain synthetic educational cases and are not NASA-certified mission predictions.

**Validation recorded:** build and local model/mock checks above. **Required before release:** real browser walkthrough and the correct private interactive Sites preview for this exact source state, plus source/license review and any applicable challenge submission checks.

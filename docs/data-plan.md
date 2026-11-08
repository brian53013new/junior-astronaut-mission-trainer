# NASA data plan — current status

Checked 2026-11-04. NASA and CCMC public documentation links were reviewed. No event record has yet been downloaded into this project, and the game does not currently use NASA observations.

| Candidate source | What it contains | How it could inform play | Limitations / status |
|---|---|---|---|
| [NASA CCMC DONKI](https://ccmc.gsfc.nasa.gov/tools/DONKI/) | Space-weather event records and analyses, including solar flares, solar energetic particle events and CMEs; public web service API | A cited historical event can trigger a “review shelter / maintain systems” decision, with event type and time shown in the mission log | DONKI says near-real-time data/simulations are prototype/research information and provides no direct lunar crew dose in the cited event record. No numeric dose claims. Candidate only; not wired in. |
| [NASA Open APIs](https://api.nasa.gov/) | Catalog of NASA APIs; individual APIs have separate fields and limits | General discovery entry point; only use if a relevant dataset is found | API key policy varies; no API is currently wired in. |

## Integration contract

`src/game/NASADataProvider.ts` loads and validates the dated snapshot at `public/data/nasa-event-snapshot.json`, with built-in educational scenarios as fallback. `scripts/fetch-donki-snapshot.mjs` prepares an attributed SEP snapshot without saving the API key; no NASA event has been retrieved for this project yet. The snapshot must retain the source URL, retrieval time, event identifier, and model limitation. The UI identifies a loaded NASA snapshot as a snapshot rather than a live feed; see `docs/nasa-data-integration.md` for the remaining source and review steps.

Any conversion from event metadata to a simplified game consequence needs a short published rule, clearly labeled “educational simplified model.” Do not describe it as NASA-derived dose, a NASA risk factor, or a prediction of actual mission safety. If the API is unavailable, load the cited local snapshot so the whole mission remains playable offline.

## Official guidance reviewed

- [DONKI overview and rules/disclaimer](https://ccmc.gsfc.nasa.gov/tools/DONKI/): events include FLR, SEP and CME; the service describes analysis/observations and near-real-time model outputs, and asks users to observe its rules of the road. DONKI is not an endorsement of products using its data.
- [DONKI guide](https://ccmc.gsfc.nasa.gov/DONKI/guide/): official user guide and links to API reference, data reference, rules and disclaimers.
- [DONKI event search](https://ccmc.gsfc.nasa.gov/DONKI/guide/events/): shows event-specific fields; for example, CME has speed/location/angle attributes and SEP has observing location. These are not lunar crew-dose fields.
- [NASA API authentication and limits](https://api.nasa.gov/assets/html/authentication.html): users can explore without a key; default registered-key quota is documented as 1,000 requests/hour, while DEMO_KEY is much more limited. The game should avoid requiring a key in the browser and should rely on a cited local snapshot for the hackathon demo.

All pages accessed 2026-11-04. These sources are candidates only; first compare them with the challenge page’s own NASA Data and Resources tabs when available.

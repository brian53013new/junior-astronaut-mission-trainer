# NASA data audit — current package integration

Audit date: 2026-11-13. This is an independent educational game associated with **Build a Junior Astronaut Mission Trainer**, not a NASA product, endorsement, mission tool, or safety recommendation.

## Board-only runtime display update — 2026-11-14

The five-turn board now exposes phase-specific source details in its expandable source cards. The cards display the selected DONKI record and reported retrieval date/status, the LOLA package's three row-level points and package verification note, NASA Images API result/query metadata including its stored response hash, and BVAD table/page/retrieval details. They also retain the science and simulation limitations below. The package hashes were verified locally; the executor did not independently re-request NASA source transactions. The five-turn flow does not convert event intensity to radiation dose or imply ice from shadows.

## Acquisition and integrity

The user supplied `NASA_Outpost_Control_Data_Package_2026-11-13 (1).zip` (archive SHA-256 `c99feb4c4d381d37910ed501829d791d0d98e20ec94003c71da2f2f0de16e4c3`). It was extracted without path traversal; all 24 listed SHA-256 digests matched. The package, source manifest and checksum list are preserved at `public/data/nasa/user-submitted-package/`; raw response/product files are also stored under `public/data/nasa/raw/` for runtime and citations. Hash agreement establishes file integrity against the supplied manifest; this executor did not independently repeat the source HTTP requests.

## DONKI

- Preserved JSON responses and reported HTTP 200: CME (125), GST (3), HSS (11), IPS (11), SEP (valid empty array). FLR was not obtained: the package records HTTP 404 from the tested `api.nasa.gov` path and HTTP 503 from CCMC.
- Original JSON bodies are kept under `public/data/nasa/raw/donki/`. Their request URLs, package retrieval UTC, reported status, SHA-256 and counts are recorded in `public/data/nasa-event-snapshot.json`. A 60-record normalized subset is loaded by the game, retaining at least one event per non-empty feed. Snapshot status is partial because FLR failed; SEP is empty but successful.
- Each event is mission context. Its simulated power effect is educational and is not a dose, impact coefficient, forecast, health effect or safety warning.

## NASA Images API

- The preserved raw response at `public/data/nasa/raw/images-api/lunar-south-pole_page-1.json` corresponds to the package query URL and reported HTTP 200. Five result records are in `image-catalog.json` and appear in the NASA Data Lab with NASA ID, title, description, date, preview and official detail page.
- PIA13720 remains a separate static NASA Science Photojournal image and is not labeled as an Images API result. Image search metadata does not establish ice, water abundance, or item-specific redistribution rights.

## LRO / LOLA

- Three user-provided ODE query JSON files, selected topography CSVs and PDS3 labels are preserved under `public/data/nasa/raw/lola/`; the original package (including its derived candidate file and method) is also retained.
- Three representative points are recorded in `lunar-sites.json`, with east longitude, planetocentric latitude, topography relative to the 1,737.4 km lunar mean radius (meters), observation time, shot number, product/query references and point counts. Product labels identify LOLA RDR, PDS3, units, and product creation dates; they do not state an archive release number.
- Displayed slope is a package-derived least-squares local estimate from sparse valid RDR shots, not an official LOLA slope field. This audit independently repeated the fit about each query-window center and reproduced the supplied slopes to four decimals.
- Site selection now uses relative topography and derived slope in a labeled educational comparison score; score-to-power/science effects are invented mappings. Sunlight, ice, communication visibility, landing suitability and safety are not inferred from these three point records.

## Other NASA facts already used

- BVAD Rev. 2 Table 4-20, printed page 72: Transit Vehicle total water consumption 3.2 kg/crew-member-day; converted at 0.64 kg/game point (an educational scale).
- NASA lunar surface gravity 1.624 m/s² drives the classroom mass-to-weight calculation. The orbit ring is still illustrative.
- PIA13720 static image remains identified separately.

## Runtime and fallback behavior

1. The bundled DONKI snapshot loads during story setup; valid records map to explicitly fictional game rules.
2. The Data Lab still supports explicit live queries. Live and imported snapshot evidence remain distinct. A partial live query preserves successes and names failed feeds; invalid/empty responses cannot overwrite a valid cache.
3. NASA Images API saved records are visible from the local catalog even when live egress fails; an explicit search can still refresh them.
4. LOLA measured point fields and slope estimates appear on the site readout. The map's sunlight and route modes and all consequences remain educational illustrations.

## Remaining limits

- No FLR JSON was provided.
- Supplied HTTP statuses and acquisition times are attributed to the user's package; the executor independently verified file hashes and content shape, not the origin transactions.
- No official LOLA slope product was supplied; slope is package-derived and sparse. No point is a NASA-designated landing site.
- BVAD oxygen, food, energy, waste, backup and repair quantities are not added without separately verified page/unit/context.
- Mock tests remain mock tests. Local checks validate package snapshots and hash metadata, but are not fresh live API requests.

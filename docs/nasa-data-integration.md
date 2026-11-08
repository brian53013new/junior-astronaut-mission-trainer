# NASA event snapshot integration

## Current behavior

The browser loads `/data/nasa-event-snapshot.json` once at startup, validates its schema, and falls back to the bundled education cases if the request fails, the file is empty, or validation fails. In production, a service worker is designed to cache the application shell and the last retrieved snapshot after a successful first online load; a saved snapshot retains its retrieval date and is historical, not a live feed. First use, updates, and new data retrieval require network access. Actual device-level offline behavior has not yet been verified. The current snapshot is deliberately empty and marked `EDUCATIONAL-FALLBACK`; it contains no NASA measurements.

## 13–14 November collection procedure

1. Check the official DONKI API guide and service status: <https://ccmc.gsfc.nasa.gov/DONKI/guide/> and <https://ccmc.gsfc.nasa.gov/tools/DONKI/>. As of 2026-11-04, DONKI documents its API under `https://ccmc.gsfc.nasa.gov/DONKI-API/get/`; the September 2026 migration says the API schema and payloads remain unchanged.
2. Retrieve a small dated range of relevant events using NASA's documented endpoint and a NASA API key kept outside the browser bundle. For SEP training cases, set `NASA_API_KEY` privately in the local shell, then run `node scripts/fetch-donki-snapshot.mjs 2026-11-13 2026-11-14`. The script records the request without the key, retrieval time, and event IDs, and preserves the existing fallback file on error or an empty response. Re-check current rate limits and key requirements on the official guide on the day of retrieval.
3. Verify each returned record against the source response. Select only records that help teach the event concept. Do not present a DONKI event as a lunar surface dose, crew exposure measurement, warning, or forecast.
4. Review the generated records and limitations against the source response, then run `npm run build`, the local checks in the README, and the browser tests. Keep the education fallback available. Bump the cache version in `public/sw.js` when publishing a changed application shell, then verify offline operation on the device before judging. NASA notes that old `kauai.ccmc.gsfc.nasa.gov/DONKI/` event links can be changed to `ccmc.gsfc.nasa.gov/DONKI/` without changing the remaining path.

## Snapshot contract

`schemaVersion` must be `1`. `provenance` contains `mode`, `dataset`, `sourceUrl`, `retrievedAt`, `recordId`, and `limitations`. Each record contains:

```json
{
  "id": "donki-sep-source-event-id",
  "kind": "NASA",
  "titleKey": "SEP event · 2026-11-13",
  "noteKey": "nasaMapping",
  "sourceUrl": "https://ccmc.gsfc.nasa.gov/DONKI-API/get/SEP?...",
  "retrievedAt": "2026-11-13T12:00:00Z",
  "effects": {},
  "mappingDisclosure": "This observation triggers an educational shelter decision. It does not quantify lunar surface dose or mission safety. Any resource or crew-condition changes are invented training rules."
}
```

For NASA records, keep `effects` empty unless a separately documented teaching rule is intentionally being demonstrated. If an invented response outcome is used, label it in the event text as an educational model and explain its limitation; never imply that NASA supplied or certified the game coefficient. A real snapshot may change event selection and scientific context, while event-response costs remain an explicitly simplified classroom model.

## Scientific limits and source record

DONKI is a space-weather event database with observed, analysis, and model product quality varying by event type; its guide cautions that it is a research/prototype resource and does not endorse third-party use. Its event records are not a lunar surface crew dose model. This game is educational and is not a NASA product, a crewed mission decision tool, an operational forecast, or a NASA-certified risk model.

Official references checked 2026-11-05:

- NASA Community Coordinated Modeling Center, DONKI service and migration notice: <https://ccmc.gsfc.nasa.gov/tools/DONKI/>.
- NASA Community Coordinated Modeling Center, September 2026 API migration and legacy link mapping: <https://ccmc.gsfc.nasa.gov/news/major-updates/>.
- NASA Community Coordinated Modeling Center, DONKI API guide: <https://ccmc.gsfc.nasa.gov/DONKI/guide/>.
- NASA Community Coordinated Modeling Center, event definitions: <https://ccmc.gsfc.nasa.gov/DONKI/guide/events/>.
- NASA Open APIs: <https://api.nasa.gov/>.

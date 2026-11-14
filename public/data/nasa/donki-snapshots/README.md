# DONKI snapshots

There are no verified DONKI event snapshots in this folder yet. The executor's outbound request to the official API was blocked by its network proxy before NASA returned JSON. Do not populate this directory with hand-written or mocked events and label them NASA data.

Use `node scripts/fetch-donki-snapshot.mjs YYYY-MM-DD YYYY-MM-DD` from a network that can reach `https://ccmc.gsfc.nasa.gov/DONKI-API/get/`. The importer validates all six event types, keeps official event links and observation timestamps, strips API keys if an upstream link unexpectedly contains one, and will not replace a saved snapshot with an empty or invalid result.

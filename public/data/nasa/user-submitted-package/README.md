# Outpost Control — NASA Official Data Package

Package date: 2026-11-13 (Asia/Taipei)

This ZIP contains official NASA API/PDS responses that can be reviewed and, if accepted, imported into the Outpost Control educational game.

## Included

### DONKI JSON

Raw JSON responses for the official NASA Open APIs DONKI endpoint, queried for `2026-10-01` through `2026-11-13`:

- CME: 125 records
- GST: 3 records
- HSS: 11 records
- IPS: 11 records
- SEP: 0 records, valid empty JSON array

The FLR request was attempted but was not obtained in this package: the NASA API mirror returned HTTP 404 for the tested route and the CCMC route returned a connection timeout/503. This failure is recorded in `raw/donki/FLR_attempt_2026-10-01_2026-11-13.txt`.

### NASA Images API JSON

`raw/images-api/lunar-south-pole_page-1.json` is the raw response from:

`https://images-api.nasa.gov/search?q=lunar%20south%20pole&media_type=image&page_size=5`

It contains five returned items and reports 162 total hits. The response includes NASA ID, title, description, date, keywords, and image links.

### LOLA candidate points

The raw CSV and PDS label files were produced by the official PDS Geosciences Node LOLA RDR GDS query tool. Three small south-pole query windows were used at 0E, 90E and 180E. Each raw query returned valid LOLA topography points.

`derived/lola-candidate-points.json` and `.csv` contain one representative point per query window, its coordinates, LOLA relative topography, radius from the lunar center using the label's 1737.4 km mean-radius reference, and a derived local slope estimate.

Important: the slope is **not** an official LOLA slope field. It is a least-squares planar estimate calculated from all valid topography points returned in the corresponding query window. These are data-derived educational candidate points, not NASA-designated landing sites or safety recommendations.

## Official references

- NASA Open APIs: https://api.nasa.gov/
- CCMC DONKI: https://ccmc.gsfc.nasa.gov/tools/DONKI/
- NASA PDS LRO LOLA: https://pds-geosciences.wustl.edu/missions/lro/lola.htm
- NASA PDS LOLA RDR Query Tool: https://oderest.rsl.wustl.edu/GDSWeb/GDSLOLARDR.html
- ODE REST documentation: https://oderest.rsl.wustl.edu/ODE_REST_V2.1.6.pdf
- NASA Images API documentation: https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf

## Import caution

Before importing into the game, verify the JSON, the PDS labels, the query windows, and the derived-slope method. The game must display the distinction between official measurements and package-derived estimates.

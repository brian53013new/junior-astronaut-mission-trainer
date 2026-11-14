# LOLA candidate-point derivation

The raw files under `raw/lola/` are official outputs from the NASA Planetary Data System Geosciences Node's LOLA RDR GDS query tool. The PDS label defines `TOPOGRAPHY` as the planetary radius minus the lunar average radius of 1737.4 km, in meters.

For each of the three 0.01° latitude × 0.1° longitude query windows:

1. Parse only valid rows returned by the official query output.
2. Convert longitude and latitude differences to local east/north meters using a spherical radius of 1,737,400 m and the query-window center latitude.
3. Fit `topography = a × east + b × north + c` by least squares.
4. Report `atan(sqrt(a²+b²))` in degrees as `estimatedLocalSlopeDeg`.
5. Select the raw point nearest the center of the query window as the representative candidate coordinate and topography value.

The slope is a package-derived local estimate from sparse LOLA RDR observations. It is not an official NASA slope product, a certified landing-site assessment, or a safety recommendation. The game must preserve this distinction.

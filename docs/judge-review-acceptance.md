# Judge review package acceptance record

Date: 2026-11-13. This record distinguishes implemented work from device and publishing checks that still need independent evidence.

## Data and claims

- [x] User-supplied NASA package retained under `public/data/nasa/user-submitted-package/`; 24 listed SHA-256 entries checked locally.
- [x] DONKI is identified as a user-supplied partial snapshot (CME, GST, HSS, IPS and valid empty SEP; FLR unavailable); this run did not repeat requests to NASA.
- [x] NASA Images API catalog contains five user-supplied response records; catalog evidence is distinct from the static PIA13720 Photojournal image.
- [x] Three LOLA RDR sample locations affect educational comparison. The local slope is derived from sparse points, not an official LOLA slope product, site certification or safety evaluation.
- [x] BVAD water scenario and 1.624 m/s² lunar-gravity reference feed the game's educational calculations; game costs and the orbit model are not mission engineering calculations.
- [x] Data validation says what was checked locally and avoids claiming a fresh NASA HTTP transaction.

## Mission-table route

- [x] A six-turn bilingual mission table is the first route after welcome; the legacy full curriculum remains accessible.
- [x] Assembly, communications, observation and repair rounds enter their 3D work rooms; site selection, mass/gravity comparison, evidence classification and finale make recorded choices.
- [x] A clean-storage desktop Chromium run reached the certificate and saved seven mission records.
- [x] Board suite passed 16/16 across desktop and mobile Chromium emulation, including course entry, site/gravity results, communications return, observation scan, finale, and responsive text checks.
- [x] Browser-emulated overflow checks cover 375×812, 768×1024 and 1024×768 at Normal, Large and Extra large text settings.
- [ ] Physical iPhone and iPad Safari results: not yet supplied. Mobile Chromium emulation is not a substitute.
- [x] Full Playwright suite after the latest gameplay changes: 92 passed, 8 configured skips, 0 failed (100 total; desktop and mobile Chromium emulation, 36.1 minutes).

## Submission readiness

- [x] Project Tab English copy, slide outline and 30-/60–90-second demo scripts prepared in [`submission-kit.md`](submission-kit.md).
- [x] Public language avoids NASA endorsement, NASA certification, live API and safety-prediction claims.
- [ ] A project-wide OSI license is intentionally not selected; original rights-holder authority is uncertain, as the user stated.
- [ ] Public demo / public source release: not approved or enabled. The hosted preview remains private to its owner.
- [ ] Final public contest submission is not ready while rights clearance and physical-device review remain open.

## Latest code checks

See [`TEST_REPORT.md`](TEST_REPORT.md) for the full results. The NASA data command uses supplied files and fixture-based importer tests; do not call it a live NASA network test. The production bundle emits a 1,016.50 kB chunk-size advisory; it does not currently block a successful build.

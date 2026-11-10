# Junior Astronaut Mission Trainer — implementation audit

Status describes behavior in this checkout, not visual ambition. Existing saves must remain usable.

- [x] First-visit 3D welcome room, NOVA introduction, practice button/dial/switch and hatch; desktop/mobile emulation has exercised the first lesson.
- [x] Existing six lessons, finale, progress persistence, resource simulation and locally generated certificate; individual lesson paths were tested from saved states.
- [x] Touch selection, focused devices and drag handling exist; repeated welcome and console swipes were tested in Chromium phone/tablet emulation. Full physical-device coverage is still required.
- [x] Default-on zoom, independently saved settings and paper-edge page turning exist.
- [x] Rotating 360° seated cabin, side workstations, rear book, rotation-aware focus presets and enclosed walls. Desktop and phone emulations exercise rotation and the rear book; some equipment remains on the forward desk.
- [ ] Guidance uses a breathing elliptical 3D cue and off-screen/occluded-target arrows. The occlusion estimate uses ray tests; shape-specific contours and all-scene review remain outstanding.
- [ ] Every interactive control verified individually for touch focus, drag, exit and save/progress behavior.
- [ ] A 3D engineering bay now allows dragging three distinct components to their ports, returning a misaligned component, and activating the probe. Movement is constrained to the workbench plane; free rotation and different installation mechanics remain outstanding.
- [ ] Separate 3D assembly and repair workbenches are available through the existing monitors. A 3D repair activity connects plugs to matching ports. Physical connected corridors and dedicated science/communications rooms remain outstanding.
- [ ] Distinct hands-on assessments and learning progression throughout every course; existing written questions remain.
- [ ] A single uninterrupted tested playthrough from welcome through all six lessons and finale; actual phone/iPad, audio and educator/child testing remain outstanding.

- [x] Planning board has illustrative 3D terrain, simulated site trade-offs and terrain / sunlight / route view controls. These are game models, not measured site data.
- [x] Time dial has a separate numeric readout and a single release-triggered visual pulse; repeated advance and event-stop behavior is covered by existing clock tests.

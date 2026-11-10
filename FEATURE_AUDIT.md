# Junior Astronaut Mission Trainer — implementation audit

Status describes behavior in this checkout, not visual ambition. Existing saves must remain usable.

- [x] First-visit 3D welcome room, NOVA introduction, practice button/dial/switch and hatch; desktop/mobile emulation has exercised the first lesson.
- [x] Existing six lessons, finale, progress persistence, resource simulation and locally generated certificate; individual lesson paths were tested from saved states.
- [x] Touch selection, focused devices and drag handling exist; repeated welcome and console swipes were tested in Chromium phone/tablet emulation. Full physical-device coverage is still required.
- [x] Default-on zoom, independently saved settings and paper-edge page turning exist.
- [x] Rotating 360° seated cabin, side workstations, rear book, rotation-aware focus presets and enclosed walls. Desktop and phone emulations exercise rotation and the rear book; some equipment remains on the forward desk.
- [ ] Guidance uses an object-attached 3D locator and dashed tether, animated control cues and off-screen/occluded-target arrows. Occlusion is estimated with ray tests; all-scene and real-device review remain outstanding.
- [ ] Every interactive control verified individually for touch focus, drag, exit and save/progress behavior.
- [ ] A 3D engineering bay now allows dragging three distinct components to their ports, returning a misaligned component, and activating the probe. Movement is constrained to the workbench plane; Held parts can rotate on three axes with Q/E, W/S and Z/X; a two-finger twist and vertical movement rotate on two axes. Solar deployment, battery insertion and antenna alignment require distinct interactions. Translation remains constrained to the workbench plane.
- [ ] Separate 3D assembly and repair workbenches have an enclosed connecting passage and support component placement and circuit repair. Dedicated science and communications rooms are now reachable from their respective controls; they are not yet connected by walkable passages. The assembly-to-repair transition is guided camera travel, not unrestricted walking.
- [ ] The communications activity uses antenna alignment and physical signal keys; the science room asks players to aim at a simulated crater before scanning. Distinct hands-on assessments throughout every course are still incomplete, and existing written questions remain.
- [ ] A single uninterrupted tested playthrough from welcome through all six lessons and finale; actual phone/iPad, audio and educator/child testing remain outstanding.

- [x] Planning board has illustrative 3D terrain, simulated site trade-offs and terrain / sunlight / route view controls. These are game models, not measured site data.
- [x] Time dial has a separate numeric readout and a single release-triggered visual pulse; repeated advance and event-stop behavior is covered by existing clock tests.

- [x] The training book has a separate rear pedestal; hit volumes do not intersect console controls and a measured gap remains to the rear wall.
- [ ] The six lessons and finale now introduce a life analogy, concept and device purpose before the activity and a result/reflection afterwards. Assessments still contain fixed written questions and require further hands-on redesign.

- [ ] The cockpit has a continuous annular bridging surface, rails and supports; engineering, repair, science and communications room envelopes now contain their adaptive cameras. Visual review and all control clearances remain to be checked.
- [ ] The engineering bay includes interactive component information, tool guidance and diagnostics tied to current assembly state. It does not yet support reusable module upgrades in later lessons, unrestricted walking, or a mechanical arm.
- [ ] The off-screen indicator is a larger dashed directional arrow and the world marker has a downward pointer. Per-device operation cues and occlusion behavior still need broader validation.

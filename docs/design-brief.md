# Design brief — Outpost Control

**Player promise:** Sit at a lunar outpost command console and keep the crew supplied by choosing which interdependent system to maintain each cycle.

**Audience:** Junior learners; exact age band is pending confirmation.

**Primary verb:** Operate physical console devices with the mouse. **Secondary verbs:** Drag controls to configure a decision, inspect status, read event feedback, and review the mission log.

**View and feel:** A single seated command-room viewpoint. The 3D console, desk, paper, live status displays and lunar window give spatial context. Mouse position adds mild parallax; it does not move a character or explore a map.

**Loop:** Review reserves and the next objective → operate a system control or drag a setting → inspect the cost and feedback → advance the mission clock → respond when an event occurs → continue toward an observation and a debrief.

**Systems:** Mission planning, spacecraft checkout, power, communications, navigation, observation, analysis, water/oxygen, food, crew health, shielding, environment, and time. Choices trade time/action capacity and one resource against another. A mission ends at sol 12 after any pending event is resolved, or when crew health reaches zero.

**Data boundary:** The current build uses explicitly labeled, offline educational scenarios. The event record contract holds an ID, event title, explanation, source, source URL, and resource effects. A NASA data adapter should preserve the raw NASA record and attribution metadata, then apply a separately documented education-only mapping. Missing network access must use a dated, cited offline snapshot.

**Non-goals:** Character movement, exploration, combat, multi-level progression, real-time mission control, real crew dose prediction, or claims of NASA endorsement.

**Acceptance checks:** The player can complete the guided first observation using physical controls; the mission can progress to a debrief; actions show costs and effects; resource and event consequences are understandable; the 3D scene remains the primary interaction surface. Browser interaction, display legibility, mobile behavior, and full guided completion remain to be verified on a supported preview.

**Open decisions:** Age range; game title; exact NASA source to use after official challenge resources are reviewed; whether NASA events are selected historically or refreshed live. Proposed date for supplying/confirming the dataset: November 13–14, 2026.

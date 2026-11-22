# AURORA · Scope & verification

Four connected zones: village, forest, sanctuary, aurora. The fourth zone is gated by the first boss, and the three new sigils gate the three-phase Echo of the Void. All zones use the same state object, collision logic, camera, A* pathfinder, combat, menus and RPG save key.

**New original Canvas content:** procedural cached Aurora landscape, star islands, elevated causeway, astral geometry and bespoke vector final boss with wing panels and an animated corona.

**Controls:** WASD/arrows to move, click to pathfind, Space attack, Shift dodge, K parry, Q solar flower, F guardian, E interact, I inventory, J journal, M map, P/Esc menu. Existing touch and initial gamepad controls remain.

**Local verification:** 30/30 narrative and interaction checks, 22/22 save robustness and accessibility checks. The tests use headless Chromium via `page.set_content` and simulated `localStorage`. Direct navigation to `file://` was rejected by the test environment, and physical-device validation is still pending.

**Boundaries:** This is not a deployment and makes no changes to OHANA's root entrypoint. The repository intentionally excludes the full historic MIRAI HTML and any potentially personal career data. The existing RPG save slot is backward-compatible with its v1 format. It must not be merged into `main` as a published game without explicit integration review.

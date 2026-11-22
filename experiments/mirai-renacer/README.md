# MIRAI XXIII · RENACER | Extended engine experiment

An isolated, editable action-RPG engine experiment adapted from MIRAI XXIII. This directory is intentionally **not wired into OHANA's production entrypoint**. Kilo's existing OHANA chapters, CI, save data, multiplayer and official releases remain untouched.

## What changed

- A* with octile heuristic, closed set, diagonal corner-squeeze protection, and blocked target rejection.
- Strict allowlist and bounds for version-1 RPG save imports; the original `mirai_reborn_rpg_1` key is retained. Import applies coordinates before saving.
- Safe spawn fallback for positions embedded in obstacles.
- Three optional world-memory collectibles, two additional chests, experience/shard rewards and a new achievement.
- Deterministic low-overdraw fireflies, clearer windups and a brighter kinetic trail, honoring reduced motion.
- One animation frame loop per launch, gamepad menu toggling while paused, correct visibility/blur lifecycle.
- Keyboard focus trapping and restoration in menus; forced death/respawn choice.
- Portrait touch controls no longer overlay the ability dock; landscape-specific compact presentation.

## Scope and provenance

The complete self-contained HTML, original artwork, employment dashboard and large binaries are **not** committed here. The user retains the HTML and distributable ZIP as separate deliverables. This avoids publishing potentially personal career information into an otherwise public repository. The engine source does not retrieve, import or mutate employment records.

This is an **experimental source snapshot**, not a claim that MIRAI and OHANA engines are unified. It does not modify `main` unless this PR is deliberately merged.

## Verification

Syntax: `node --check codigo/mirai_reborn.js`.

Contracts: `node --test tests/contract.test.mjs`.

Local Chromium with a simulated storage backing and HTML document injection: **18/18 checks** of boot, movement, menu focus, persistence, routes and world transitions. Chromium in the test environment blocked direct `file://` and local HTTP navigation; native double-click loading and real controller/mobile hardware remain **unverified**.

## Next integration work

Decouple career access from host DOM selectors through a callback, migrate legacy MIRAI chapters to the same engine one by one, port directional art/animation with measured performance, and run E2E tests on a local desktop browser using a packaged build.

# OHANA release consolidation | 2026-10-28

Baseline: main at `6c23e0aa6f1df139744ed7ba8c2cddd52c5598ad`.

## Verified signals
- Main OHANA CI and Pages: passing on baseline.
- The latest quality workflow was **not demonstrated passing** on that baseline. A successful Pages run is not proof of browser, visual or full-campaign acceptance.
- Separate multiplayer repository last checked at `ba313b2` (2026-10-07), CI and Pages passing. Do not treat it as the source of truth for newer multiplayer work in this repository.
- PR #442 (Yomi V617) at `96ba737`: OHANA CI, quality and V500/V501 acceptance runs failed. Do not merge or publish.

## Blocking PR #442 issues discovered by source review
1. `systems/yomi-encounters-v617.js` imports `./yomi-boss.js`, but the proposed PR adds `yomi-boss-v617.js`. The imported path exists, but points to the legacy boss and yields the wrong boss ID and arena for V617; it must be aligned before integration.
2. `systems/yomi-trail-v617.js` contains a stub update function, so bit collection, resonance and trap removal are not implemented.
3. Its README explicitly requests wiring render/update functions and chapter imports. Merely adding files is **not** playable integration.
4. The replacement room terrain changes three gaps, hazards and enemy placements. Test real traversal, recovery, seal progression, boss encounter and existing save keys before enabling it.
5. Validate boss collision/damage cooldowns, phase progression and reduced-motion mode in a browser before changing the game loop.

## Acceptance gates
- `npm ci && npm test && npm run release:check`.
- `quality` successful on **the exact PR head**, including browser, visual and release gate jobs.
- Gameplay verification: all ten hero entry routes, obstacles, one complete normal campaign, death/retry, persistence across reload and final reward.
- Offline service-worker migration: both fresh installation and upgrade with old caches; no missing resources after removal of scene bitmaps.
- Mobile/desktop: no clipped menus, no dead controls, reduced-motion behavior and readable HUD.
- Multiplayer: local co-op/versus with disconnection, room isolation, retry and persistence. Do not trigger paid external services during validation.
- Confirm the deployed revision matches the tested SHA; successful deployment must not be reported as gameplay acceptance.

## Integration policy
Keep experimental character PRs and snapshots out of `main` until individually green. Use a separate review branch; merge only after acceptance. Preserve save data and existing player progress. No force pushes, deletions or automatic production changes.

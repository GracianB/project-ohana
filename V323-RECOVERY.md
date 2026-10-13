# OHANA · V323 recovery and release guard (13 October 2026)

## What was recovered
- `systems/abilities.js` was reduced from the full V322 module (3,693 lines) to an incomplete 70-line stub in the V323 direct commits. The file had lost exports that `game.js` imports, including `useAbility`, `drawProjectile`, `drawSlash` and `drawBolt`.
- `PROGRESS.md` had been replaced with a literal placeholder.
- Both files were restored byte-for-byte from V322 main commit `51b7f78a39fd84c01ccda7ce002737d0198ea384`. Fix commits: `e22edb98b059d8556cc7982343b0fbad239659b2` and `038b24a15bcc6bc814a7cbdc718d0191d044774e`.
- The invalid `V323-phase1.patch` had a non-numeric `@@ -XXX` hunk and the accompanying document incorrectly invited applying it. Both are removed in the verification PR; Git history retains them for review.
- `V323-PLAN.md` is a **proposal only**, not an implementation or a completed milestone. The recovered `main` retains V322 gameplay.

## Remaining work
- Issue #318 is still open. Original initial U impacts, Dino Colossus, Yomi execution and Cuerno dream must not be removed without an equivalent fully tested design.
- Do not reapply the removed V323 patch or claim phase 1 implemented.
- `tests/v323-critical-recovery.test.js` checks exports, placeholders, and the existing supreme contracts until a purpose-built U authority patch with explicit acceptance tests replaces them.
- The test suite and real two-device multiplayer must be verified before any new combat change is merged.
- No Netlify deployment was requested or performed by this recovery.

## Validation
The GitHub PR must run the standard `quality.yml` suite (unit, browser, multiplayer, visual and release) before merge. A successful repository content recovery is not by itself proof that the public game or network mode has been tested.

Do not reset `main` or remove the legitimate V316–V322 character, family duet, multiplayer and cache improvements.

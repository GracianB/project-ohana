# V700 · First playable vertical slice: the Pulso OHANA

Implementation status: **candidate in the V700 branch, not a public release**.

Rescue one of Michi's five jellyfish in the bioluminescent forest and the world answers: real, collision-backed coral ledges rise in an optional path above its existing sacred bridge. Every subsequent jellyfish unlocks another authored segment, with reactive light and low-motion rendering.

The transformation is a projection of already earned, saved `world1.stations[].done` identifiers. No new progress keys, hidden XP, artificial seal grants, mutated room templates, or incompatible OHANA 636 saves. Death, reload and repeat physics ticks reconstruct the same world; Stitcho and all other original heroes are untouched.

Technical seams: `worlds/ohana-pulse.js` is the deterministic collision plan and visual layer. `systems/cat-chapter.js` synchronizes physical platforms during actual gameplay; `game.js` paints them after terrain and exposes a read-only test snapshot. The existing night light field expands as stations awaken. The module is content-addressed in the service worker, while the public release stays 636 until the complete V700 is genuinely ready.

Verification: `tests/v700-michi-pulse.test.js` (included in `npm test`), full `quality`, `OHANA CI`, V511 movement, V600 campaign, V625 Michi visuals and offline release check. This slice alone does not prove the ten hero Pulsos, human playtest quality, multiplayer on real networks or the full V700 roadmap.

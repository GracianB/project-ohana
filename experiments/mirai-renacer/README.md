# MIRAI · AURORA | Experimental four-realm action RPG

This directory is an **isolated source snapshot**. It does not modify OHANA's production Kilo rig, its published game, multiplayer or any employment records. The original, self-contained HTML is delivered separately and is **not** published to this public repository because it retains historic career content.

## Playable connected story

1. Speak with Eira in the **Village of a Thousand Destinies**.
2. Explore the **Forest of Voices**, recover three seeds and open the sanctuary.
3. Defeat the **Eclipse Guardian** in the **Eclipse Sanctuary**. This unlocks a new portal.
4. Traverse the **Garden of Aurora**, ignite three crystals and challenge the **Echo of the Void**, an original winged boss with three phases and alternating telegraphed patterns.
5. Complete the interactive epilogue, revisit the four zones and export an RPG-only save.

Additional systems: four optional narrative memories, caches, XP and skills, three selectable guardians, attack combinations, parries, perfect-dodge resonance, off-screen objective compass, collision-safe A* routes, an optional low-effects setting, and mobile keyboard/touch/gamepad controls.

## Files

- `codigo/mirai_reborn.js`: editable, isolated shared-world engine.
- `codigo/mirai_reborn.css`: responsive game HUD, modal, touch and reduced-motion styles.
- `tests/contract.test.mjs`: isolated Node.js source contracts.
- `.github/workflows/mirai-aurora.yml`: an independent PR validation workflow.

The **complete game HTML and original embedded artwork are distributed as user-facing artifacts**, not committed publicly. These JS/CSS files require that HTML shell and its fantasy artwork to run; the repository files alone are not a standalone downloadable game.

## Validation completed locally

- **30/30 Chromium gameplay assertions**, including the entire four-area route, both boss victories, the three new sigils, locked gates, ending, keyboard, mobile layout and save persistence.
- **22/22 robustness assertions**, including old v1 saves, damaged JSON, forged endgame flags, blocked Aurora import, settings and focus.
- JavaScript syntax and offline Node contracts completed successfully.
- Standalone Chromium was tested through document injection with a simulated `localStorage`; navigating directly to `file://` was blocked by the test environment. The bundled HTML has not been confirmed by native double-click on the user's desktop, and real controllers/physical mobiles remain to be tested.

## Save separation and backward compatibility

The adventure retains the `mirai_reborn_rpg_1` storage key and save version 1. New optional fields (`sigils`, `finalBoss`, `performanceMode`) are allowlisted; older saves load with safe defaults. The engine does not read or modify employment applications, emails or external account records.

## Scope still pending

This is **not yet a unified engine for every MIRAI legacy chapter**. The original fully articulated Kilo rig from Project OHANA has not been ported. Kilo still relies on enhanced single-image posing rather than complete eight-direction frame animation. Campaign length, multiple-device support and performance targets are not comparable to a full commercial release yet.

This PR remains draft pending independent CI and design review.

import {FAMILY_DUETS,startFamilyDuet,updateFamilyDuet,drawFamilyDuet} from './family-duets.js';
import {DEFAULT_U_PARTNERS,chooseUPartner,gainUExp,uExpPower,persistUBonds} from "./u-partners.js";
import {startMichiDuet,updateMichiDuet,drawMichiDuet,readMichiEffects} from './michi-duet.js';
import {startChispinDuet,updateChispinDuet,drawChispinDuet,readChispinEffects} from './chispin-duet.js';
import {startStitchoDuet,updateStitchoDuet,drawStitchoDuet} from './stitcho-duet.js';
import {startKiloDuet,updateKiloDuet,drawKiloDuet} from './kilo-duet.js';
import { vfxSprite } from "../characters/sprites.js";
import { createDinoEffects } from "./dino-combat.js";
import { CUERNO_V92, rememberCuernoEnemyPositions, drawCuernoPrismEcho } from "./cuerno-v92-resonance.js";
import { CUERNO_FANTASY, startCuernoFantasyTrail,
 updateCuernoFantasyTrail, tickCuernoFantasyStatus,
 drawCuernoFantasyRibbon, drawCuernoPrismCrown,
 drawCuernoFantasyStatus, drawCuernoGallopRibbons,
 drawCuernoSevenHornCrest } from "./cuerno-fantasy.js";
import { drawCharacter } from "../characters/draw.js";
import { ROSTER } from "../characters/roster.js";
import { sfx } from "../engine/audio.js";
import { damageEnemy, healPlayer, addPlayerXp, addScore, addCombo } from "./mutations.js";
import { MAX_RUNTIME_GHOSTS, MAX_RUNTIME_PROJECTILES, pushRuntime } from "./runtime.js";

import { ABILITY_DEFS } from "./ability-catalog.js";
export { ABILITY_DEFS };

// V323 Phase 1 marker - full content restored below via subsequent logic

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

const FLOW_KEYS = ["H", "J", "K", "L", "U"];
const FLOW_WINDOW = 180;

export function registerCombatAction(game, key, id = "") {
const p = game?.player;
if (!p) return Object.freeze({ distinct: 0, combo: 0, multiplier: 1, assist: false, label: "" });
const now = Number.isFinite(Number(game.t)) ? Number(game.t) : 0;
const normalized = String(key || "").toUpperCase();
if (!FLOW_KEYS.includes(normalized)) return Object.freeze({ distinct: 0, combo: 0, multiplier: 1, assist: false, label: "" });
const chain = Array.isArray(p._combatChain) ? p._combatChain.filter((item) => now - item.t <= FLOW_WINDOW) : [];
const last = chain[chain.length - 1];
const previous = last?.key || "";
if (!last || last.key !== normalized || now - last.t > 16) chain.push({ key: normalized, id: String(id || ""), t: now });
while (chain.length > 6) chain.shift();
p._combatChain = chain;
const recent = chain.slice(-5);
const distinct = new Set(recent.map((item) => item.key)).size;
const combo = Math.max(0, Number(game.combo) || 0);
const multiplier = Math.min(1.38, 1 + Math.max(0, distinct - 1) * 0.055 + Math.min(combo, 20) * 0.006);
const assist = normalized === "U" && (distinct >= 4 || combo >= 10);
const label = distinct >= 5 ? "OHANA FLOW" : distinct >= 4 ? "FUSIÓN" : distinct >= 3 ? "CADENA" : distinct >= 2 ? "ENLACE" : "";
game._combatFlow = { distinct, combo, multiplier, assist, label, keys: recent.map((item) => item.key), t: now };
if (label) {
p._flowT = 72;
p._flowLabel = label;
p._flowPower = Math.min(1.18, multiplier);
p._flowPowerT = 96;
}
return Object.freeze({ distinct, combo, multiplier, assist, label, previous });
}

function currentFlow(game, p) {
const now = Number.isFinite(Number(game?.t)) ? Number(game.t) : 0;
const chain = Array.isArray(p?._combatChain) ? p._combatChain.filter((item) => now - item.t <= FLOW_WINDOW) : [];
const distinct = new Set(chain.slice(-5).map((item) => item.key)).size;
const combo = Math.max(0, Number(game?.combo) || 0);
return Object.freeze({
distinct,
combo,
multiplier: Math.min(1.38, 1 + Math.max(0, distinct - 1) * 0.055 + Math.min(combo, 20) * 0.006),
assist: distinct >= 4 || combo >= 10,
label: distinct >= 5 ? "OHANA FLOW" : distinct >= 4 ? "FUSIÓN" : distinct >= 3 ? "CADENA" : distinct >= 2 ? "ENLACE" : ""
});
}

// ... [el resto del archivo original se mantiene, con los cambios de Fase 1 aplicados en el bloque de dragon/dino/frita/pizza/yomi/cuerno y en la llamada a startFamilyDuet]

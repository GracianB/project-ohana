import { MAX_RUNTIME_ENEMIES, MAX_RUNTIME_PROJECTILES, MAX_RUNTIME_GHOSTS,
  MAX_RUNTIME_ORBS, MAX_RUNTIME_SAFE, compactRuntimeList, boundedFinite } from "./runtime.js";

export function sanitizeRuntimeState(game) {
game.t = boundedFinite(game.t, 0, 0, MAX_RUNTIME_SAFE);
game.score = boundedFinite(game.score, 0, 0, MAX_RUNTIME_SAFE);
game.kills = Math.floor(boundedFinite(game.kills, 0, 0, MAX_RUNTIME_SAFE));
game.combo = Math.floor(boundedFinite(game.combo, 0, 0, 999));
game.comboT = Math.floor(boundedFinite(game.comboT, 0, 0, 600));
game.shake = boundedFinite(game.shake, 0, 0, 32);
game.hitstop = Math.floor(boundedFinite(game.hitstop, 0, 0, 8));
game.flash = Math.floor(boundedFinite(game.flash, 0, 0, 120));
game.fading = Math.floor(boundedFinite(game.fading, 0, 0, 120));
if (typeof game.rng !== "function") game.rng = Math.random;

const p = game.player;
if (p) {
p.x = boundedFinite(p.x, game.spawn?.x ?? 180, -2048, game.worldW + 2048);
p.y = boundedFinite(p.y, game.spawn?.y ?? 500, -2048, game.worldH + 2048);
p.w = boundedFinite(p.w, 32, 1, 256);
p.h = boundedFinite(p.h, 32, 1, 256);
p.vx = boundedFinite(p.vx, 0, -40, 40);
p.vy = boundedFinite(p.vy, 0, -40, 40);
p.maxHealth = boundedFinite(p.maxHealth, 100, 1, 100000);
p.health = boundedFinite(p.health, p.dead ? 0 : p.maxHealth, 0, p.maxHealth);
p.xp = boundedFinite(p.xp, 0, 0, MAX_RUNTIME_SAFE);
p.evo = Math.floor(boundedFinite(p.evo, 0, 0, 4));
p.invuln = Math.floor(boundedFinite(p.invuln, 0, 0, 600));
p.coyote = Math.floor(boundedFinite(p.coyote, 0, 0, 60));
p.buffer = Math.floor(boundedFinite(p.buffer, 0, 0, 60));
p.dash = Math.floor(boundedFinite(p.dash, 0, 0, 120));
p.melee = Math.floor(boundedFinite(p.melee, 0, 0, 120));
}

compactRuntimeList(game.enemies, MAX_RUNTIME_ENEMIES);
for (const e of game.enemies) {
e.x = boundedFinite(e.x, 0, -2048, game.worldW + 2048);
e.y = boundedFinite(e.y, 0, -2048, game.worldH + 2048);
e.w = boundedFinite(e.w, 32, 1, 512);
e.h = boundedFinite(e.h, 32, 1, 512);
e.vx = boundedFinite(e.vx, 0, -40, 40);
e.vy = boundedFinite(e.vy, 0, -40, 40);
e.max = boundedFinite(e.max, 1, 1, 100000);
e.hp = boundedFinite(e.hp, 0, 0, e.max);
e.invuln = Math.floor(boundedFinite(e.invuln, 0, 0, 600));
e.stun = Math.floor(boundedFinite(e.stun, 0, 0, 120));
e.dying = Math.floor(boundedFinite(e.dying, 0, 0, 240));
}

compactRuntimeList(game.projectiles, MAX_RUNTIME_PROJECTILES);
for (const pr of game.projectiles) {
pr.x = boundedFinite(pr.x, 0, -4096, game.worldW + 4096);
pr.y = boundedFinite(pr.y, 0, -4096, game.worldH + 4096);
pr.w = boundedFinite(pr.w, 8, 1, 256);
pr.h = boundedFinite(pr.h, 8, 1, 256);
pr.vx = boundedFinite(pr.vx, 0, -60, 60);
pr.vy = boundedFinite(pr.vy, 0, -60, 60);
pr.life = Math.floor(boundedFinite(pr.life, 0, 0, 600));
pr.dmg = boundedFinite(pr.dmg, 0, 0, 100000);
}

compactRuntimeList(game.ghosts, MAX_RUNTIME_GHOSTS);
for (const g of game.ghosts) {
g.x = boundedFinite(g.x, 0, -4096, game.worldW + 4096);
g.y = boundedFinite(g.y, 0, -4096, game.worldH + 4096);
g.w = boundedFinite(g.w, 32, 1, 256);
g.h = boundedFinite(g.h, 32, 1, 256);
g.life = Math.floor(boundedFinite(g.life, 0, 0, 120));
}

compactRuntimeList(game.orbs, MAX_RUNTIME_ORBS);
for (const o of game.orbs) {
o.x = boundedFinite(o.x, 0, -4096, game.worldW + 4096);
o.y = boundedFinite(o.y, 0, -4096, game.worldH + 4096);
o.r = boundedFinite(o.r, 9, 1, 128);
}

game.cam.x = boundedFinite(game.cam?.x, 0, -4096, game.worldW + 4096);
game.cam.y = boundedFinite(game.cam?.y, 0, -4096, game.worldH + 4096);
}


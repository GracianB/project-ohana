import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createDinoEffects } from "../systems/dino-combat.js";
import { DINO_ACTING_TUNING } from "../characters/art/dino.js";
import { ABILITY_DEFS, supremeOf } from "../systems/abilities.js";

function harness() {
  const created = [], hits = [], blasts = [];
  const cx = e => e.x + (e.w || 0) / 2, cy = e => e.y + (e.h || 0) / 2;
  const canHit = e => !!e && e.hp > 0 && !e.dying;
  const api = createDinoEffects({
    cx, cy, canHit,
    nearestEnemy: (g, x, y, range, skip) =>
      (g.enemies || []).filter(e => canHit(e) && !(skip && skip.has(e)))
        .sort((a,b) => Math.hypot(cx(a)-x,cy(a)-y)-Math.hypot(cx(b)-x,cy(b)-y))
        .find(e => Math.hypot(cx(e)-x,cy(e)-y) < range) || null,
    solidAt: () => null, inView: () => true,
    circleHit: (x,y,r,e) => Math.hypot(Math.max(e.x,Math.min(x,e.x+e.w))-x,
      Math.max(e.y,Math.min(y,e.y+e.h))-y) <= r,
    hitEnemy: (g,e,dmg) => { e.hp -= dmg; hits.push(e); return true; },
    boom: (g,x,y,color) => blasts.push(color),
    add: f => { created.push(f); return f; },
    clamp: (v,a,b) => Math.max(a,Math.min(b,v)),
  });
  return { api, created, hits, blasts };
}

test("Dino V75 J really follows a moving enemy with one bounded hit", () => {
  const h = harness();
  const enemy = { x: 172, y: 30, w: 25, h: 25, hp: 500 };
  const g = { enemies: [enemy], worldW: 1600, worldH: 900 };
  const f = { x: 25, y: 30, vx: 8, vy: -1, radius: 10, face: 1, evo: 2,
    life: 95, delay: 0, target: null, age: 0, trail: [], color: "#9aedd8", dmg: 20 };
  let alive = true;
  for (let i = 0; i < 65 && alive; i++) {
    f.age++; enemy.y = 30 + Math.sin(i * .1) * 8;
    alive = h.api.update.dinoSpit(g, f);
    assert.ok(f.trail.length <= 7, "Unbounded trail history");
  }
  assert.equal(alive, false, "Projectile never arrived");
  assert.ok(enemy.hp < 500, "Guidance did not hit the moving target");
  assert.equal(h.hits.length, 1, "Repeated damage from one slime");
  assert.ok(h.created.some(v => v.kind === "dinoSplat"), "Missing comedy splat");
});

test("Dino V75 L spawns limited distinct mint meteors while preserving ground quake", () => {
  const h = harness();
  const g = { enemies: [{ x: 340, y: 290, w: 32, h: 32, hp: 500 }],
    cam: { x: 0, y: 0 }, worldW: 1600 };
  const player = { x: 100, y: 240, w: 32, h: 48 };
  const f = { kind: "dinoSkyfall", n: 7, i: 0, next: 0, evo: 4,
    face: 1, origin: 120, dmg: 36, radius: 62 };
  for (let i = 0; i < 130 && f.i < 7; i++) h.api.update.dinoSkyfall(g,f,player);
  const meteors = h.created.filter(e => e.kind === "meteor");
  const warnings = h.created.filter(e => e.kind === "dinoWarning");
  assert.equal(meteors.length, 7);
  assert.equal(warnings.length, 7);
  assert.ok(meteors.every(m => m.dino === true && m.vy > 0 && m.R === 62));
  assert.ok(meteors.every(m => Number.isFinite(m.x) && Number.isFinite(m.y)));
  assert.equal(ABILITY_DEFS.meteor.name, "Lluvia de meteoros", "Dragon must remain intact");
  assert.equal(supremeOf("dino").id, "titan", "U remains reserved");
});

test("Dino V75 has 100 actual form-specific art tuning values, all used by its renderer", () => {
  const art = fs.readFileSync("characters/art/dino.js","utf8");
  const keys = Object.keys(DINO_ACTING_TUNING);
  assert.equal(keys.length, 20);
  let adjustments = 0;
  for (const key of keys) {
    const vals = DINO_ACTING_TUNING[key];
    assert.equal(vals.length, 5, key + " must cover five evolutions");
    assert.ok(vals.every(v => Number.isFinite(v) && v > 0 && v < 2), key + " calibration outside safe envelope");
    assert.ok(new Set(vals).size >= 3, key + " not meaningfully evolving");
    assert.match(art, new RegExp("T\\." + key + "\\[f\\]"), key + " unused");
    adjustments += vals.length;
  }
  assert.equal(adjustments, 100);
  assert.match(art, /pose\.move === "dino-roll"/);
  assert.match(art, /ctx\.rotate\(\(\(Number\(pose\.phase\)/);
  assert.doesNotMatch(art,/Math\.random|requestAnimationFrame|setTimeout/);
});

test("Dino V75 isolated FX keeps shared engine size and combat budgets", () => {
  const shared = fs.readFileSync("systems/abilities.js","utf8");
  const module = fs.readFileSync("systems/dino-combat.js","utf8");
  assert.ok(shared.length < 135000, "Shared renderer budget broken");
  assert.ok(module.length < 8500, "Dino animation module budget broken");
  assert.match(shared, /createDinoEffects/);
  assert.match(module, /dinoSpit/);
  assert.match(module, /dinoSkyfall/);
});

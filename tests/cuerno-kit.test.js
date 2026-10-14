import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCuernoKit, castCuerno, updateCuerno, drawCuerno, cuernoDamage, cuernoForm } from "../systems/cuerno-kit.js";

const mk = (evo = 0) => ({ id: "cuerno", x: 100, y: 100, w: 22, h: 26, facing: 1, evo });
const foe = (x, o = {}) => ({ x, y: 100, w: 24, h: 24, hp: 999, ...o });

test("cuerno-kit: J K L F M definidos con aviso", () => {
  const kit = getCuernoKit();
  for (const k of ["J", "K", "L", "F", "M"]) assert.ok(kit[k].warn >= 5, k);
});

test("cuerno-kit: nada golpea durante el aviso", () => {
  for (const key of ["J", "K", "L", "M"]) {
    const p = mk(2), e = foe(150), g = { enemies: [e] };
    const hits = [];
    assert.equal(castCuerno(key, p, g, { dmg: 10 }), true);
    for (let f = 0; f < 80; f++) { updateCuerno(g, p, { hit: (_, en, d) => hits.push(f) }); }
    assert.ok(hits.length >= 1, key + " no golpeó");
    assert.ok(hits[0] >= getCuernoKit()[key].warn - 1, key + " golpeó sin aviso");
  }
});

test("cuerno-kit: escalas de daño reutilizan abilities.js", () => {
  assert.equal(cuernoDamage("J", mk(0)), 19);
  assert.equal(cuernoDamage("L", mk(0)), 25);
  assert.equal(cuernoDamage("F", mk(4)), 0);
  assert.equal(cuernoForm(mk(4)), 5);
  assert.ok(cuernoDamage("L", mk(4)) > cuernoDamage("L", mk(0)));
});

test("cuerno-kit: sueño duerme menos al jefe y no daña", () => {
  const p = mk(1), a = foe(140), b = foe(140, { boss: true }), g = { enemies: [a, b] };
  castCuerno("F", p, g);
  for (let f = 0; f < 60; f++) updateCuerno(g, p);
  assert.ok(a.sleep > 0); assert.ok(!b.sleep); assert.equal(a.hp, 999);
});

test("cuerno-kit: cooldown y solo cuerno", () => {
  const p = mk(), g = { enemies: [] };
  assert.equal(castCuerno("K", p, g), true);
  assert.equal(castCuerno("K", p, g), false);
  assert.equal(castCuerno("K", { ...mk(), id: "kilo" }, g), false);
});

test("cuerno-kit: sin gradientes ni Math.random", () => {
  const src = readFileSync(new URL("../systems/cuerno-kit.js", import.meta.url), "utf8");
  assert.ok(!/create(Linear|Radial|Conic)Gradient|Math\.random/.test(src));
  const calls = [];
  const ctx = new Proxy({}, { get: (_, k) => (typeof k === "string" && /^[a-z]/.test(k) && !["globalAlpha","lineWidth","strokeStyle","fillStyle","font","textAlign","lineDashOffset"].includes(k)) ? (...a) => calls.push(k) : undefined, set: () => true });
  const p = mk(3); castCuerno("L", p, { enemies: [] });
  drawCuerno(ctx, p, { x: 0, y: 0 }, 1);
  assert.ok(calls.length > 0 && !calls.some((c) => /Gradient/.test(c)));
});

import { CUERNO_TRAIL_MAX, CUERNO_TRAIL_LIFE, cuernoTrailCount, cuernoTrailSegments, trailTickDamage, cornadaActive } from "../systems/cuerno-kit.js";
function runK(evo, frames, enemies = [], hit) {
  const p = mk(evo), g = { enemies };
  castCuerno("K", p, g);
  const counts = [];
  for (let f = 0; f < frames; f++) { updateCuerno(g, p, hit ? { hit } : {}); p.x += p.vx || 0; counts.push(cuernoTrailCount(p)); }
  return { p, counts };
}
test("estela K: no aparece durante el aviso", () => {
  const { counts } = runK(0, getCuernoKit().K.warn);
  assert.ok(counts.every((c) => c === 0));
});
test("estela K: tope 40 sin nuevas asignaciones", () => {
  const p = mk(4), g = { enemies: [] };
  const segs = cuernoTrailSegments((castCuerno("K", p, g), p));
  for (let n = 0; n < 6; n++) { p._cuernoKit.cd.K = 0; castCuerno("K", p, g); for (let f = 0; f < 90; f++) { updateCuerno(g, p); p.x += p.vx; } }
  assert.equal(cuernoTrailSegments(p), segs); assert.equal(segs.length, CUERNO_TRAIL_MAX);
  assert.ok(cuernoTrailCount(p) <= CUERNO_TRAIL_MAX);
});
test("estela K: vive ~180 f", () => {
  const { counts } = runK(1, 400);
  const lastSpawn = getCuernoKit().K.warn + cornadaActive(2);
  assert.ok(counts[lastSpawn + CUERNO_TRAIL_LIFE - 10] > 0);
  assert.equal(counts[lastSpawn + CUERNO_TRAIL_LIFE + 5], 0);
});
test("estela K: daño por tick = rainbow/6 con cooldown 20 f, y crece con la forma", () => {
  const p0 = mk(0);
  assert.equal(trailTickDamage(p0), cuernoDamage("L", p0) / 6);
  assert.ok(trailTickDamage(mk(4)) > trailTickDamage(p0));
  assert.ok(cornadaActive(5) > cornadaActive(1));
  assert.ok(Math.max(...runK(4, 200).counts) > Math.max(...runK(0, 200).counts));
  // enemigo quieto detrás del punto de salida
  const e = foe(140, { y: 110, h: 20 });
  const ticks = [];
  runK(0, 260, [e], (g, en, d, o) => { if (o.trail) ticks.push(d); });
  assert.ok(ticks.length >= 2);
  assert.ok(ticks.length <= Math.ceil(CUERNO_TRAIL_LIFE / 20) + 1);
  for (const d of ticks) assert.equal(d, 25 / 6);
});
test("estela K: gancho opcional de efectos", () => {
  const got = []; const p = mk(0);
  const g = { enemies: [], cuernoFx: {}, cuernoFxApi: { emitCuernoTrail: (fx, s) => got.push(s) } };
  castCuerno("K", p, g); for (let f = 0; f < 60; f++) updateCuerno(g, p);
  assert.ok(got.length > 0 && got.every((s) => s.life === 180 && s.form === 1 && Number.isFinite(s.x + s.y)));
  // con el cuerno-fx real de Chispín
  const q = mk(2), g2 = { enemies: [], cuernoFx: { list: [], seed: 0 } };
  castCuerno("K", q, g2); for (let f = 0; f < 60; f++) updateCuerno(g2, q);
  assert.ok(g2.cuernoFx.trail.length > 0);
});

import { lanceSlopes, cuernoEvoMods } from "../systems/cuerno-kit.js";
test("evo Dino: J extra por forma (0,0,1,1,2) con mismo daño y aviso", () => {
  assert.deepEqual([1, 2, 3, 4, 5].map((f) => lanceSlopes(f).length - 1), [0, 0, 1, 1, 2]);
  const p = mk(4), foes = [foe(160), foe(160, { y: 100 + 0.14 * 200 }), foe(160, { y: 100 - 0.14 * 200 })];
  const g = { enemies: foes }, hits = [];
  castCuerno("J", p, g);
  for (let f = 0; f < 40; f++) updateCuerno(g, p, { hit: (_, e, d) => hits.push({ f, d }) });
  assert.ok(hits.length >= 3);
  assert.ok(hits.every((h) => h.d === cuernoDamage("J", p) && h.f >= getCuernoKit().J.warn - 1));
});
test("evo Dino: trailStars solo en forma 5", () => {
  assert.equal(cuernoEvoMods(5).trailStars, true); assert.equal(cuernoEvoMods(4).trailStars, false);
  for (const [evo, want] of [[4, true], [3, false]]) {
    const got = [], p = mk(evo), g = { enemies: [], cuernoFx: {}, cuernoFxApi: { emitCuernoTrail: (fx, s) => got.push(s) } };
    castCuerno("K", p, g); for (let f = 0; f < 70; f++) updateCuerno(g, p);
    assert.ok(got.length && got.every((s) => s.stars === want));
  }
});

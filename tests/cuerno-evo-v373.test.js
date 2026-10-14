import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as M from "../systems/cuerno-evo-v373.js";

function mockCtx() {
  const calls = { grad: 0, text: [] };
  return new Proxy({}, {
    get(o, k) {
      if (k === "__calls") return calls;
      if (/^create(Linear|Radial|Conic)Gradient$/.test(k)) return () => { calls.grad++; return { addColorStop() {} }; };
      if (k === "fillText") return (s) => calls.text.push(String(s));
      if (k === "measureText") return () => ({ width: 10 });
      if (k in o) return o[k];
      return () => {};
    },
    set(o, k, v) { o[k] = v; return true; },
  });
}

test("cuerno V373: mods monótonos en formas 1-5 y sin daño extra", () => {
  const nums = (m) => [m.J.extra, m.J.pierce, m.K.trailLen, m.K.trailW, m.L.dist, m.F.radius];
  for (let f = 1; f < 5; f++) {
    const a = nums(M.cuernoFormMods(f)), b = nums(M.cuernoFormMods(f + 1));
    a.forEach((v, i) => assert.ok(b[i] >= v, `forma ${f + 1} campo ${i}`));
    const ua = M.cuernoFormMods(f).unlock, ub = M.cuernoFormMods(f + 1).unlock;
    for (const k of Object.keys(ua)) assert.ok(!ua[k] || ub[k]);
  }
  for (let f = 1; f <= 5; f++) {
    const m = M.cuernoFormMods(f);
    assert.equal(m.dmgMul, 1);
    assert.deepEqual([m.K.trailLen, m.K.trailW, m.L.dist, m.F.radius], [1, 1, 1, 1]);
  }
  assert.deepEqual([1, 2, 3, 4, 5].map((f) => [M.cuernoFormMods(f).J.extra, M.cuernoFormMods(f).J.pierce]), [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2]]);
  assert.equal(M.cuernoFormMods(3).unlock.rainbowJump, true);
  assert.equal(M.cuernoFormMods(5).unlock.trailStars, true);
});

test("cuerno V373: intro/muerte/victoria/estallido dibujan sin gradientes", () => {
  const ctx = mockCtx();
  for (const t of [0, 0.4, 0.9, 1.2, 1.6, 2]) M.drawCuernoIntro(ctx, 640, 360, t, 5);
  for (let f = 1; f <= 5; f++) for (const t of [0, 0.3, 0.8, 1.3, 1.8]) { M.drawCuernoDeath(ctx, 100, 200, t, f); M.drawCuernoVictory(ctx, 100, 200, t, f); }
  M.drawCuernoBurst(ctx, { x: 0, y: 0, life: 20, form: 5 });
  assert.equal(ctx.__calls.grad, 0);
  assert.ok(M.CUERNO_INTRO_DURATION >= 1.5 && M.CUERNO_INTRO_DURATION <= 2.5);
});

test("cuerno V373: cura pequeña, con tope, una vez por evolución y respeta pausa", () => {
  M.resetCuernoEvoV373();
  const p = { x: 0, y: 0, w: 20, h: 30, evo: 2, health: 50, maxHealth: 400 };
  const g = { player: p, paused: true };
  assert.equal(M.cuernoEvolveBurst(g, p).healed.length, 0);
  g.paused = false;
  M.cuernoEvolveBurst(g, p);
  assert.equal(p.health, 70);                       // 8 % = 32 → tope 20
  M.cuernoEvolveBurst(g, p);
  assert.equal(p.health, 70);                       // misma evolución: no repite
  p.evo = 3; p.health = 395;
  M.cuernoEvolveBurst(g, p);
  assert.equal(p.health, 400);                      // nunca supera el máximo
  const off = { ...p, evo: 4, health: 10 };
  M.cuernoEvolveBurst({ player: off }, off, { enabled: false });
  assert.equal(off.health, 10);
});

test("cuerno V373: fuente sin GOD ni Math.random", () => {
  const src = readFileSync(new URL("../systems/cuerno-evo-v373.js", import.meta.url), "utf8");
  assert.ok(!/GOD/.test(src));
  assert.ok(!/Math\.random/.test(src));
});

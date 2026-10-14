import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { updateStitchoFoe, updateStitchoWebs, STITCHO_AI } from "../engine/foes/stitcho-ai.js";

const foe = (kind, x, y, o = {}) => ({ kind, x, y, w: 30, h: 26, hp: 10, max: 10, vx: 0, vy: 0, ...o });
const world = (enemies, p = {}) => ({ player: { x: 300, y: 300, w: 24, h: 30, vx: 0, vy: 0, ...p }, enemies, worldW: 2000, worldH: 1000 });
const run = (e, g, n) => { const log = []; for (let i = 0; i < n; i++) { updateStitchoFoe(e, g, 1); log.push({ tel: !!e.telegraph, lunge: e.lunge > 0 || !!e.diving, x: e.x, y: e.y, vx: e.vx }); } return log; };
const firstAttackHasWarn = (log) => { const a = log.findIndex((f) => f.lunge); return a > 0 && log.slice(0, a).filter((f) => f.tel).length >= STITCHO_AI.warn - 1; };

test("V372 IA: avispa y otros kinds no se gestionan", () => {
  const g = world([]);
  assert.equal(updateStitchoFoe(foe("avispa", 0, 0), g), false);
  assert.equal(updateStitchoFoe(foe("abeja", 0, 0, { variant: "avispa" }), g), false);
  assert.equal(updateStitchoFoe(foe("cucaracho", 0, 0), g), false);
});
test("V372 IA: todo ataque lleva aviso previo (abeja, libélula, murciélago)", () => {
  for (const k of ["abeja", "libelula", "murcielago"]) {
    const e = foe(k, 230, 260), g = world([e]);
    assert.ok(firstAttackHasWarn(run(e, g, 140)), k);
  }
});
test("V372 IA: libélula hace zigzag con parada seca", () => {
  const e = foe("libelula", 150, 300), g = world([e]);
  const log = run(e, g, 160);
  assert.ok(log.some((f, i) => i > 40 && f.vx === 0 && log[i - 1].vx !== 0), "parada seca");
  const ys = log.filter((f) => f.lunge).map((f) => f.y); assert.ok(Math.max(...ys) - Math.min(...ys) > 10, "cambia altura");
});
test("V372 IA: abejas cercanas se enfadan al morir una; avispa no", () => {
  const a = foe("abeja", 200, 200), b = foe("abeja", 260, 200), w = foe("avispa", 240, 200), g = world([a, b, w]);
  run(a, g, 2); run(b, g, 2);
  a.hp = 0; updateStitchoFoe(a, g, 1); updateStitchoFoe(w, g, 1);
  assert.equal(b._sai.angry, STITCHO_AI.angryT); assert.equal(w._sai, undefined);
});
test("V372 IA: araña cuelga, avisa, teje máx 3 telas que frenan sin daño", () => {
  const e = foe("arana", 290, 100), g = world([e]);
  const hp0 = g.player.hp;
  for (let i = 0; i < 1200; i++) { updateStitchoFoe(e, g, 1); }
  assert.ok(g._stitchoWebs.length >= 1 && g._stitchoWebs.length <= STITCHO_AI.webMax);
  assert.ok(e.y > 100, "baja por el hilo");
  const w = g._stitchoWebs[0]; Object.assign(g.player, { x: w.x, y: w.y, vx: 10 });
  updateStitchoWebs(g);
  assert.ok(g.player.vx < 10 && g.player._webSlowT > 0); assert.equal(g.player.hp, hp0);
});
test("V372 IA: murciélago duerme lejos y despierta por proximidad", () => {
  const e = foe("murcielago", 1200, 100), g = world([e]);
  run(e, g, 30); assert.equal(e.x, 1200); assert.equal(e.telegraph, undefined);
  g.player.x = 1210; g.player.y = 180; run(e, g, 2); assert.equal(e.telegraph, true);
});
test("V372 IA: pausa congela; no toca vida ni daño; sin gradientes", () => {
  const e = foe("abeja", 200, 200), g = world([e]); g.paused = true; run(e, g, 50);
  assert.equal(e.x, 200); assert.equal(e.hp, 10);
  const src = fs.readFileSync("engine/foes/stitcho-ai.js", "utf8");
  assert.doesNotMatch(src, /Gradient/); assert.doesNotMatch(src, /\.(hp|dmg|damage|contactDmg)\s*[-+*]?=[^=]/);
});

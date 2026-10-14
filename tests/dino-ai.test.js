import test from "node:test";
import assert from "node:assert/strict";
import { updateDinoFoeAI, updateDinoHazards, onDinoFoeDeath, resetDinoFoeAI, dinoPuddles, dinoSparks, DINO_AI_TUNING } from "../engine/foes/dino-ai.js";

const G = (extra = {}) => ({ worldW: 2000, paused: false, fx: { emit() {} }, player: { x: 500, y: 400, w: 24, h: 40, hp: 100 }, ...extra });
const foe = (kind, o = {}) => ({ kind, x: 490, y: 400, w: 30, h: 24, vx: 0, vy: 0, hp: 20, max: 20, ...o });

test("dino-ai: ignora otros kinds y bichos muertos", () => {
  assert.equal(updateDinoFoeAI(foe("rana"), G()), false);
  assert.equal(updateDinoFoeAI(foe("ufo", { hp: 0 }), G()), false);
});

test("dino-ai: en pausa no cambia nada", () => {
  const e = foe("escoria"); const before = JSON.stringify(e);
  assert.equal(updateDinoFoeAI(e, G({ paused: true }), 1, { t: 1 }), true);
  assert.equal(JSON.stringify(e), before);
});

test("dino-ai: escoria telegrafía y deja charco que daña ≤ contacto, sin tocar su vida", () => {
  resetDinoFoeAI();
  const g = G(), e = foe("escoria"); let hurt = [];
  updateDinoFoeAI(e, g, 1, { t: 0, target: g.player, contactDmg: 9 });
  assert.equal(e.telegraph, true);
  for (let i = 0; i < DINO_AI_TUNING.escoria.wind; i++) updateDinoFoeAI(e, g, 1, { t: i, target: g.player, contactDmg: 9 });
  assert.equal(dinoPuddles.length, 1);
  g.player.y = dinoPuddles[0].y - g.player.h;
  g.player.x = dinoPuddles[0].x + 4;
  for (let i = 0; i < 200; i++) updateDinoHazards(g, (n) => hurt.push(n));
  assert.ok(hurt.length >= 1 && hurt.every((n) => n <= 9));
  assert.equal(dinoPuddles.length, 0);
  assert.equal(e.hp, 20);
});

test("dino-ai: ufo abduce sin daño y suelta con empuje en tiempo acotado", () => {
  const g = G(), e = foe("ufo", { y: 300, baseY: 300 }); const p = g.player; p.y = 360; p.hp = 100;
  let i = 0;
  for (; i < 400 && !(e.dinoLift > 0); i++) { p.x = e.x; p.y = e.y + 60; updateDinoFoeAI(e, g, 1, { t: i, target: p }); }
  assert.ok(e.dinoLift > 0, "debería abducir");
  let n = 0;
  while (e.dinoLift > 0 && n < 100) { updateDinoFoeAI(e, g, 1, { t: n, target: p }); n++; assert.ok(p.y >= e.y + e.h + 6 - 0.01); }
  assert.ok(n <= DINO_AI_TUNING.ufo.lift + 1);
  assert.equal(p.hp, 100);
  assert.equal(p.dinoAbducted, 0);
  assert.ok(Math.abs(p.vx) >= DINO_AI_TUNING.ufo.push);
});

test("dino-ai: brasita suelta 2 chispas visuales una sola vez", () => {
  resetDinoFoeAI();
  const e = foe("brasita", { hp: 0 });
  assert.equal(onDinoFoeDeath(e), true);
  assert.equal(onDinoFoeDeath(e), false);
  assert.equal(dinoSparks.length, 2);
  for (let i = 0; i < 60; i++) updateDinoHazards(G(), () => {});
  assert.equal(dinoSparks.length, 0);
});

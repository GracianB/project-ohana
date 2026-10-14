import test from "node:test";
import assert from "node:assert/strict";
import { updateMichiFoeAI, MICHI_AI_IDS } from "../engine/foes/michi-ai.js";

const P = () => ({ x: 160, y: 100, w: 24, h: 30, vx: 0, vy: 0 });
test("michi-ai: no hace nada en pausa ni con otros kinds", () => {
  const e = { kind: "rana", x: 100, y: 100, w: 34, h: 28, grounded: true, hp: 24 };
  assert.equal(updateMichiFoeAI(e, { paused: true }, 0, P()), false);
  assert.equal(updateMichiFoeAI({ kind: "pez" }, {}, 0, P()), false);
  assert.deepEqual(MICHI_AI_IDS, ["rana", "planta", "gaviota"]);
});
test("michi-ai: rana avisa antes del lengüetazo y solo tira del jugador, sin daño", () => {
  const e = { kind: "rana", x: 120, y: 100, w: 34, h: 28, grounded: true, hp: 24, max: 24 }, p = P(), hp0 = 50; p.health = hp0;
  const g = { enemies: [e], projectiles: [] };
  updateMichiFoeAI(e, g, 0, p);
  assert.equal(e.telegraph, true); assert.ok(e.tongueWind > 0);
  for (let i = 0; i < 40; i++) updateMichiFoeAI(e, g, i, p);
  assert.ok(e.tongueHit); assert.ok(p.vx < 0); assert.equal(p.health, hp0); assert.equal(e.hp, 24);
});
test("michi-ai: planta enterrada marca burrowed, curva el ácido existente y deja charco 1 s", () => {
  const e = { kind: "planta", x: 100, y: 100, w: 34, h: 48, up: true, plantWind: 1, hp: 36 };
  const g = { projectiles: [] }, p = P();
  updateMichiFoeAI(e, g, 0, p);
  e.plantWind = 0; const pr = { x: 110, y: 108, w: 10, h: 10, vx: 2.9, vy: -1.2, life: 80, owner: "enemy", color: "#7dca5a", dmg: 9 }; g.projectiles.push(pr);
  updateMichiFoeAI(e, g, 1, p);
  assert.ok(pr._michiAcid); assert.ok(pr.vy < -3); assert.equal(pr.dmg, 9); assert.equal(g.projectiles.length, 1);
  for (let i = 2; i < 80 && pr.life > 0; i++) { pr.x += pr.vx; pr.y += pr.vy; updateMichiFoeAI(e, g, i, p); }
  assert.equal(e.puddles.length, 1); assert.ok(e.puddles[0].t <= 60);
  e.up = false; updateMichiFoeAI(e, g, 200, p); assert.equal(e.burrowed, true);
});
test("michi-ai: gaviota grazna en el aviso y roba/devuelve cristal solo con contador", () => {
  const e = { kind: "gaviota", x: 150, y: 100, w: 40, h: 28, hp: 22, telegraph: true };
  const g = { crystals: 3 }, p = P();
  updateMichiFoeAI(e, g, 0, p); assert.equal(e.squawk, true);
  e.telegraph = false; e.diving = 10; e.x = p.x - 8; e.y = p.y;
  updateMichiFoeAI(e, g, 1, p); assert.equal(e.stolen, 1); assert.equal(g.crystals, 2);
  e.hp = 15; updateMichiFoeAI(e, g, 2, p); assert.equal(e.stolen, 0); assert.equal(g.crystals, 3);
  const e2 = { kind: "gaviota", x: p.x - 8, y: p.y, w: 40, h: 28, hp: 22, diving: 10 }; const g2 = {};
  updateMichiFoeAI(e2, g2, 0, p); assert.ok(!e2.stolen);
});

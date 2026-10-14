import test from "node:test";
import assert from "node:assert/strict";
import { updateChispinFoeAI, chispinFoeBlocks } from "../engine/foes/chispin-ai.js";
const g = { enemies: [] }, P = { x: 400, y: 300 };
test("pez avisa antes del dash y queda aturdido", () => {
  const e = { kind: "pez", x: 100, y: 300, vx: 4.4, dashSwim: 18 };
  updateChispinFoeAI(e, g, 0, P); assert.equal(e.telegraph, true); assert.equal(e.dashSwim, 0);
  for (let i = 0; i < 14; i++) updateChispinFoeAI(e, g, i, P);
  assert.equal(e.dashSwim, 18); e.dashSwim = 0; updateChispinFoeAI(e, g, 20, P); assert.ok(e.dazed > 0);
});
test("medusa anillo, anguila escondida, pausa no hace nada", () => {
  const m = { kind: "medusa", y: 0, pulsezap: 20 }; updateChispinFoeAI(m, g, 0, P); assert.ok(m.ringT > 0);
  const a = { kind: "anguila", vx: 1, zapCd: 90 }; updateChispinFoeAI(a, g, 0, P); assert.equal(a.hidden, true);
  assert.equal(updateChispinFoeAI({ kind: "pez" }, { paused: true }, 0, P), false);
});
test("cangrejo bloquea de frente, no desde arriba ni por detrás", () => {
  const c = { kind: "cangrejo", x: 100, w: 40, vx: 0, claws: true };
  updateChispinFoeAI(c, g, 0, P);
  assert.equal(chispinFoeBlocks(c, 300, false), true);
  assert.equal(chispinFoeBlocks(c, 300, true), false);
  assert.equal(chispinFoeBlocks(c, 0, false), false);
});
test("no añade proyectiles", () => {
  const gg = { enemies: [], projectiles: [] };
  for (const k of ["pez","medusa","anguila","cangrejo"]) updateChispinFoeAI({ kind: k, x: 0, y: 0, vx: 0 }, gg, 0, P);
  assert.equal(gg.projectiles.length, 0);
});

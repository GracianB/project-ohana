import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { drawMichiFoe, michiFoeTier, michiFoePose, MICHI_FOE_KINDS } from "../engine/foes/michi-foes.js";

function stubCtx() {
  return new Proxy({}, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => { o[k] = v; return true; } });
}
test("michi-foes: dibuja rana/planta/gaviota en todos los estados y deja pasar el resto", () => {
  const states = [{}, { hopWind: 10 }, { vy: -5 }, { _hitT: 6 }, { up: false }, { up: true, plantWind: 8, aimDx: 50, aimDy: -10 }, { diving: 12, vx: 2, vy: 4 }, { telegraph: true }];
  for (const kind of MICHI_FOE_KINDS) for (const s of states) assert.equal(drawMichiFoe(stubCtx(), { kind, x: 0, y: 0, w: 34, h: 30, max: 30, ...s }, 50), true);
  assert.equal(drawMichiFoe(stubCtx(), { kind: "cangrejo" }, 0), false);
  assert.equal(drawMichiFoe(stubCtx(), { kind: "rana", boss: true }, 0), false);
});
test("michi-foes: variante por dureza sale del HP sin cambiarlo", () => {
  const e = { kind: "rana", max: 24 + 2 * 12, hp: 48 };
  assert.equal(michiFoeTier(e), 2);
  assert.equal(e.max, 48); assert.equal(e.hp, 48);
  assert.equal(michiFoePose({ kind: "gaviota", diving: 5 }), "attack");
  assert.equal(michiFoePose({ kind: "planta", up: false }), "hidden");
});
test("michi-foes: sin gradientes por frame", () => {
  const src = readFileSync(new URL("../engine/foes/michi-foes.js", import.meta.url), "utf8");
  assert.doesNotMatch(src, /create(Linear|Radial)Gradient/);
});

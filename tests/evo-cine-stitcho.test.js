import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { drawEvoCine, EVO_CINE_DURATION, EVO_CINE_UNITS, FORM_NAMES, evoCinePhase, hash01 } from "../systems/evo-cine/stitcho.js";

function mockCtx() {
  const c = { grad: 0, calls: 0 };
  const P = typeof Path2D !== "undefined";
  const o = { c, measureText: () => ({ width: 10 }), createLinearGradient() { c.grad++; return { addColorStop() {} }; }, createRadialGradient() { c.grad++; return { addColorStop() {} }; }, createConicGradient() { c.grad++; return { addColorStop() {} }; } };
  void P;
  return new Proxy(o, { get(t, k) { if (k in t) return t[k]; return () => { c.calls++; }; }, set(t, k, v) { t[k] = v; return true; } });
}
test("evo-cine Stitcho: exports y duración en segundos (3,5–4,5 s)", () => {
  assert.equal(typeof drawEvoCine, "function");
  assert.equal(EVO_CINE_UNITS, "seconds");
  assert.equal(FORM_NAMES.length, 5);
  assert.ok(EVO_CINE_DURATION >= 3.5 && EVO_CINE_DURATION <= 4.5);
  assert.deepEqual([evoCinePhase(.5), evoCinePhase(2), evoCinePhase(3.5)], ["carga", "transformacion", "presentacion"]);
});
test("evo-cine Stitcho: dibuja todas las fases y formas sin lanzar y sin gradientes", () => {
  globalThis.Path2D ??= class { moveTo() {} lineTo() {} bezierCurveTo() {} quadraticCurveTo() {} closePath() {} ellipse() {} arc() {} rect() {} };
  for (let from = 1; from < 5; from++) for (let t = 0; t <= EVO_CINE_DURATION; t += 0.1) {
    const ctx = mockCtx();
    assert.doesNotThrow(() => drawEvoCine(ctx, 640, 360, t, from, from + 1));
    assert.equal(ctx.c.grad, 0, `gradiente creado en t=${t.toFixed(1)} ${from}->${from + 1}`);
    assert.ok(ctx.c.calls > 10);
  }
});
test("evo-cine Stitcho: determinista y sin Math.random", () => {
  assert.equal(hash01(3, 7), hash01(3, 7));
  assert.doesNotMatch(fs.readFileSync("systems/evo-cine/stitcho.js", "utf8"), /Math\.random/);
});

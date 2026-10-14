import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as dino from "../systems/evo-cine/dino.js";
import * as dragon from "../systems/evo-cine/dragon.js";

function mockCtx() {
  const calls = { grad: 0, text: [] };
  const ctx = new Proxy({}, {
    get(o, k) {
      if (k === "__calls") return calls;
      if (k === "createLinearGradient" || k === "createRadialGradient" || k === "createConicGradient") return () => { calls.grad++; return { addColorStop() {} }; };
      if (k === "fillText") return (s) => calls.text.push(String(s));
      if (k === "measureText") return () => ({ width: 10 });
      if (k in o) return o[k];
      return () => {};
    },
    set(o, k, v) { o[k] = v; return true; },
  });
  return ctx;
}
const MODS = { dino, dragon };
for (const [id, m] of Object.entries(MODS)) {
  test(`${id} evo-cine: duración ~4 s y nombres de forma`, () => {
    assert.ok(m.EVO_CINE_DURATION >= 3.5 && m.EVO_CINE_DURATION <= 4.5);
    assert.equal(m.FORM_NAMES.length, 5);
  });
  test(`${id} evo-cine: dibuja en varios t sin errores ni gradientes por frame`, () => {
    const ctx = mockCtx();
    for (const t of [0, 0.5, 1.2, 1.6, 2, 2.5, 2.9, 3.5, 4]) m.drawEvoCine(ctx, 640, 360, t, 4, 5);
    assert.equal(ctx.__calls.grad, 0);
    const txt = ctx.__calls.text.join(" ");
    assert.ok(txt.includes("Forma 4 → 5"));
    assert.ok(txt.includes(id === "dino" ? "Dino Coloso" : "Dragón Celestial"));
    assert.ok(!/GOD/.test(txt));
  });
  test(`${id} evo-cine: fuente sin GOD ni Math.random`, () => {
    const src = readFileSync(new URL(`../systems/evo-cine/${id}.js`, import.meta.url), "utf8");
    assert.ok(!/GOD/.test(src));
    assert.ok(!/Math\.random/.test(src));
  });
}

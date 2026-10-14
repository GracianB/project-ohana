import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { drawEvoCine, EVO_CINE_DURATION, EVO_CINE_PHASES, evoCinePhase, KILO_FORM_NAMES as NAMES } from "../systems/evo-cine/kilo.js";
import { ROSTER } from "../characters/roster.js";

function mockCtx() {
  const calls = { grad: 0, text: [], save: 0, restore: 0 };
  return new Proxy({ calls }, {
    get(o, k) {
      if (k in o) return o[k];
      if (k === "createRadialGradient" || k === "createLinearGradient") return () => { calls.grad++; return { addColorStop() {} }; };
      if (k === "fillText") return (s) => calls.text.push(String(s));
      if (k === "save") return () => calls.save++;
      if (k === "restore") return () => calls.restore++;
      return () => {};
    },
    set(o, k, v) { o[k] = v; return true; },
  });
}

test("evo-cine kilo: duración 3.5-4.5 s (t en segundos) y 3 fases contiguas", () => {
  assert.ok(EVO_CINE_DURATION >= 3.5 && EVO_CINE_DURATION <= 4.5);
  assert.equal(EVO_CINE_PHASES.charge[1], EVO_CINE_PHASES.transform[0]);
  assert.equal(EVO_CINE_PHASES.transform[1], EVO_CINE_PHASES.reveal[0]);
  assert.equal(EVO_CINE_PHASES.reveal[1], EVO_CINE_DURATION);
  assert.deepEqual(["carga", "transformacion", "presentacion"], [0.1, 2, 3.9].map(evoCinePhase));
});

test("evo-cine kilo: todas las transiciones dibujan forma origen y destino y presentan el nombre", () => {
  for (let from = 0; from < 4; from++) {
    const drawn = [], ctx = mockCtx();
    for (let t = 0; t <= EVO_CINE_DURATION; t += 0.1) drawEvoCine(ctx, 640, 360, t, from + 1, from + 2, { drawActor: (c, p) => drawn.push(p.evo) });
    assert.ok(drawn.includes(from) && drawn.includes(from + 1));
    assert.equal(ctx.calls.save, ctx.calls.restore);
    assert.ok(ctx.calls.text.some((s) => s.includes(NAMES[from + 1].toUpperCase())));
    assert.ok(ctx.calls.text.includes("Forma " + (from + 2) + " de 5"), "texto Forma X de 5 en convención 1..5");
  }
  assert.deepEqual([...NAMES], ROSTER.find((r) => r.id === "kilo").evoNames);
});

test("evo-cine kilo: nombres de forma, entradas raras, sin gradientes por frame", () => {
  const ctx = mockCtx();
  for (let i = 0; i < 120; i++) drawEvoCine(ctx, 320, 200, i / 30, NAMES[1], NAMES[2], { drawActor() {} });
  assert.ok(ctx.calls.grad <= 1, "halo cacheado por contexto");
  assert.equal(drawEvoCine(ctx, 0, 0, 1, 0, 1), "none");
  assert.equal(drawEvoCine(mockCtx(), 100, 100, NaN, 0, 99, { drawActor() {} }), "carga");
  assert.equal(drawEvoCine(mockCtx(), 100, 100, 99, 0, 1, { drawActor: () => { throw new Error("x"); } }), "presentacion");
  const src = readFileSync(new URL("../systems/evo-cine/kilo.js", import.meta.url), "utf8");
  assert.doesNotMatch(src, /\.createLinearGradient\(|GOD/);
});

test("evo-cine: convención 1..5 y nombres equivalentes", () => {
  const run = (a, b) => { const drawn = [], ctx = mockCtx(); for (let t = 0; t <= EVO_CINE_DURATION; t += 0.1) drawEvoCine(ctx, 320, 200, t, a, b, { drawActor: (c, p) => drawn.push(p.evo) }); return { drawn: [...new Set(drawn)].sort().join(), text: ctx.calls.text.join("|") }; };
  assert.deepEqual(run(1, 2), run(NAMES[0], NAMES[1]));
  assert.deepEqual(run(4, 5), run(NAMES[3], NAMES[4]));
  assert.match(run(4, 5).text, /Forma 5 de 5/);
  assert.match(run(1, 2).text, /Forma 2 de 5/);
  assert.equal(run(1, 2).drawn, "0,1", "forma 1 = índice interno 0");
});

test("evo-cine: con el drawCharacter real no se crean gradientes nativos tras el primer frame", () => {
  const ctx = mockCtx();
  drawEvoCine(ctx, 480, 270, 0.1, 1, 2);
  const first = ctx.calls.grad;
  assert.ok(first <= 1, "primer frame: como mucho el halo cacheado");
  for (let i = 1; i < 120; i++) drawEvoCine(ctx, 480, 270, i / 30, 1 + (i % 4), 2 + (i % 4));
  assert.equal(ctx.calls.grad, first, "0 gradientes nuevos en 119 frames");
});

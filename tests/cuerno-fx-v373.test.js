import test from "node:test";
import assert from "node:assert/strict";
import { emitCuernoTrail, CUERNO_TRAIL_MAX, cuernoDoubleJump, CUERNO_ARC_LIFE, createCuernoFx, emitCuernoFx, updateCuernoFx, drawCuernoFx, CUERNO_FX_MAX } from "../systems/cuerno-fx.js";
const mock = () => { const c = { grad: 0 }; return [new Proxy({}, { get: (o, k) => k === "createLinearGradient" || k === "createRadialGradient" ? () => { c.grad++; return { addColorStop() {} }; } : (k in o ? o[k] : () => {}), set: (o, k, v) => (o[k] = v, true) }), c]; };
test("estela al correr y nada parado", () => {
  const fx = createCuernoFx();
  for (let t = 0; t < 20; t++) updateCuernoFx(fx, { x: 0, y: 0, w: 20, h: 20, vx: 0 }, t);
  assert.equal(fx.list.length, 0);
  for (let t = 0; t < 20; t++) updateCuernoFx(fx, { x: 0, y: 0, w: 20, h: 20, vx: 3, form: 4 }, t);
  assert.ok(fx.list.some((q) => q.type === "trail") && fx.list.some((q) => q.type === "star"));
});
test("tope de partículas, pausa y sin gradientes", () => {
  const fx = createCuernoFx();
  for (let i = 0; i < 100; i++) emitCuernoFx(fx, "spark", 0, 0, { form: 5 });
  assert.ok(fx.list.length <= CUERNO_FX_MAX);
  const n = fx.list.length; updateCuernoFx(fx, null, 0, true); assert.equal(fx.list.length, n);
  emitCuernoFx(fx, "note", 0, 0); emitCuernoFx(fx, "star", 0, 0);
  const [ctx, c] = mock(); drawCuernoFx(ctx, fx); assert.equal(c.grad, 0);
});
test("todo muere", () => {
  const fx = createCuernoFx(); emitCuernoFx(fx, "note", 0, 0); emitCuernoFx(fx, "star", 0, 0);
  for (let t = 0; t < 80; t++) updateCuernoFx(fx, null, t); assert.equal(fx.list.length, 0);
});
test("arcoíris del doble salto dura 1 s y se dibuja sin gradientes", () => {
  const fx = createCuernoFx(); cuernoDoubleJump(fx, { x: 0, y: 0, w: 20, h: 20, form: 3 });
  assert.ok(fx.arc); const [ctx, c] = mock(); drawCuernoFx(ctx, fx); assert.equal(c.grad, 0);
  for (let t = 0; t < CUERNO_ARC_LIFE; t++) updateCuernoFx(fx, null, t); assert.equal(fx.arc, null);
});
test("rastro K: tope 40, confeti al acabar, sin gradientes", () => {
  const fx = createCuernoFx();
  for (let i = 0; i < 60; i++) emitCuernoTrail(fx, { x: i * 10, y: 100, form: 5, life: 180 });
  assert.equal(fx.trail.length, CUERNO_TRAIL_MAX);
  const [ctx, c] = mock(); drawCuernoFx(ctx, fx); assert.equal(c.grad, 0);
  for (let t = 0; t < 181; t++) updateCuernoFx(fx, null, t);
  assert.equal(fx.trail.length, 0); assert.ok(fx.list.some((q) => q.type === "spark"));
});

test("runtime evo 0..4 maps to FX forms 1..5 without falling one form behind", () => {
 for (let evo=0;evo<5;evo++) {
  const fx=createCuernoFx(),p={x:0,y:0,w:20,h:20,vx:3,evo};
  cuernoDoubleJump(fx,p);assert.equal(fx.arc.form,evo+1);
  updateCuernoFx(fx,p,0);assert.ok(fx.list.every(q=>q.form===evo+1));
 }
});

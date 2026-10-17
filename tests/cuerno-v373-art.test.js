import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import art, { cuernoV373StarAlign, cuernoTrailOrigin, drawCuernoV373, CUERNO_V373_ANIMS, CUERNO_V373_NAMES } from "../characters/art/cuerno-v373.js";
function mock() {
  const b = { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9, grad: 0 }; let m = [1, 0, 0, 1, 0, 0]; const st = [];
  const pt = (x, y) => { const X = m[0] * x + m[2] * y + m[4], Y = m[1] * x + m[3] * y + m[5]; if (!Number.isFinite(X) || !Number.isFinite(Y)) throw new Error("NaN"); b.x0 = Math.min(b.x0, X); b.x1 = Math.max(b.x1, X); b.y0 = Math.min(b.y0, Y); b.y1 = Math.max(b.y1, Y); };
  const mul = (a, c) => [a[0]*c[0]+a[2]*c[1], a[1]*c[0]+a[3]*c[1], a[0]*c[2]+a[2]*c[3], a[1]*c[2]+a[3]*c[3], a[0]*c[4]+a[2]*c[5]+a[4], a[1]*c[4]+a[3]*c[5]+a[5]];
  const ctx = new Proxy({}, { get(o, k) {
    if (k in o) return o[k];
    if (k === "save") return () => st.push(m);
    if (k === "restore") return () => { m = st.pop() || m; };
    if (k === "translate") return (x, y) => { m = mul(m, [1, 0, 0, 1, x, y]); };
    if (k === "scale") return (x, y) => { m = mul(m, [x, 0, 0, y, 0, 0]); };
    if (k === "rotate") return (a) => { m = mul(m, [Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0]); };
    if (k === "createLinearGradient" || k === "createRadialGradient") return () => { b.grad++; return { addColorStop() {} }; };
    if (k === "moveTo" || k === "lineTo") return pt;
    if (k === "quadraticCurveTo") return (a, c, x, y) => { pt(a, c); pt(x, y); };
    if (k === "arc") return (x, y, r) => { pt(x - r, y - r); pt(x + r, y + r); };
    if (k === "ellipse") return (x, y, rx, ry) => { const r = Math.max(rx, ry); pt(x - r, y - r); pt(x + r, y + r); };
    return () => {};
  }, set(o, k, v) { o[k] = v; return true; } });
  return { ctx, b };
}
test("exports", () => {
  assert.equal(art.id, "cuerno"); assert.equal(typeof art.draw, "function"); assert.equal(typeof drawCuernoV373, "function");
  assert.deepEqual([...CUERNO_V373_ANIMS], ["idle", "walk", "jump", "attack", "death", "trail"]); assert.equal(CUERNO_V373_NAMES.length, 5);
  assert.doesNotMatch(fs.readFileSync(new URL("../characters/art/cuerno-v373.js", import.meta.url), "utf8"), /Math\.random\s*\(/);
  for (const n of CUERNO_V373_NAMES) assert.doesNotMatch(n, /\bGOD\b/);
});
test("every form x anim draws, no gradients", () => {
  for (let f = 1; f <= 5; f++) for (const a of CUERNO_V373_ANIMS) for (const t of [0, 13, 57]) {
    const { ctx, b } = mock(); drawCuernoV373(ctx, 0, 0, { form: f, anim: a, t }); assert.equal(b.grad, 0);
  }
  for (const state of ["idle", "run", "jump", "fall", "attack", "hurt", "dead", "victory"]) for (let form = 0; form < 5; form++) { const { ctx, b } = mock(); art.draw(ctx, { state, form, t: 9, atk: .5 }, {}); assert.equal(b.grad, 0); }
});
test("silhouettes grow and differ by form", () => {
  const box = [1, 2, 3, 4, 5].map(form => { const { ctx, b } = mock(); drawCuernoV373(ctx, 0, 0, { form, anim: "idle", t: 0 }); return b; });
  for (let i = 1; i < 5; i++) { assert.ok(box[i].y1 - box[i].y0 > box[i - 1].y1 - box[i - 1].y0, "taller " + i); assert.ok(box[i].x1-box[i].x0>20,"readable silhouette "+i); }
});
test("deterministic", () => {
  const r = () => { const { ctx, b } = mock(); drawCuernoV373(ctx, 0, 0, { form: 5, anim: "walk", t: 21 }); return JSON.stringify(b); };
  assert.equal(r(), r());
});
test("trail origin behind hindquarters, mirrors with facing", () => {
  for (let form = 1; form <= 5; form++) { const r = cuernoTrailOrigin(100, 200, { form }), l = cuernoTrailOrigin(100, 200, { form, facing: -1 });
    assert.ok(r.x < 100 && l.x > 100 && r.y < 200 && Math.abs((100 - r.x) - (l.x - 100)) < 1e-9); }
  assert.ok(cuernoTrailOrigin(0, 0, { form: 1, scale: 2 }).x === 2 * cuernoTrailOrigin(0, 0, { form: 1 }).x);
});
test("death pose never goes below the ground line (y=0)", () => {
  for (let form = 1; form <= 5; form++) for (const t of [0, 13, 57, 100, 231]) {
    const { ctx, b } = mock(); drawCuernoV373(ctx, 0, 0, { form, anim: "death", t }); assert.ok(b.y1 <= 0.01, `form ${form} t ${t}: ${b.y1}`);
  }
});
test("victory surprise: form 5 stars align ~1 s then orbit again", () => {
  assert.equal(cuernoV373StarAlign(0), 0); assert.equal(cuernoV373StarAlign(50), 1); assert.equal(cuernoV373StarAlign(150), 0);
  assert.ok(cuernoV373StarAlign(10) > 0 && cuernoV373StarAlign(10) < 1 && cuernoV373StarAlign(90) > 0 && cuernoV373StarAlign(90) < 1);
  let n = 0; for (let k = 0; k < 240; k++) if (cuernoV373StarAlign(k) === 1) n++; assert.ok(n >= 55 && n <= 65);
  const top = (t) => { const { ctx, b } = mock(); drawCuernoV373(ctx, 0, 0, { form: 5, anim: "victory", t }); assert.equal(b.grad, 0); return b.y0; };
  assert.ok(top(50) < top(150) - 3, "constellation rises above horn"); assert.equal(top(50), top(50));
});

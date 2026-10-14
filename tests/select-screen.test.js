import test from "node:test";
import assert from "node:assert/strict";
import { selectStats, drawSelectCard, drawSelectScreen, statsHTML, mountSelectScreen, SELECT_STAT_KEYS } from "../systems/select-screen.js";
import { ROSTER } from "../characters/roster.js";
import { difficulty } from "../characters/signature.js";

const mockCtx = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : String(k).startsWith("create") ? () => { throw new Error("sin gradientes"); } : () => {}), set: (o, k, v) => { o[k] = v; return true; } });

test("select-screen: stats derivadas del roster real (forma 0 y final) y de difficulty()", () => {
  const s = selectStats(ROSTER);
  assert.equal(Object.keys(s).length, ROSTER.length);
  for (const c of ROSTER) {
    for (const [k, , field] of SELECT_STAT_KEYS) {
      assert.equal(s[c.id][k].base, c.forms[0][field]);
      assert.equal(s[c.id][k].final, c.forms.at(-1)[field]);
      assert.ok(s[c.id][k].b >= 0 && s[c.id][k].f <= 1);
    }
    assert.equal(s[c.id].dificultad.value, difficulty(c.id));
  }
  for (const [k] of SELECT_STAT_KEYS) assert.ok(ROSTER.some((c) => s[c.id][k].f === 1), "normalizado: " + k);
});

test("select-screen: tarjetas idle/hover/selected y pantalla completa sin gradientes", () => {
  const stats = selectStats(ROSTER), seen = [];
  for (const state of ["idle", "hover", "selected"]) for (const t of [0, .3, 1.7]) drawSelectCard(mockCtx(), 200, 280, t, ROSTER[0], stats.kilo, state, t, { drawActor: (c, p) => seen.push(p._poseOverride + p.evo) });
  assert.ok(seen.includes("idle1") && seen.includes("run1") && seen.includes("victory4"));
  drawSelectScreen(mockCtx(), 1000, 600, 1, ROSTER, { selectedId: "kilo", hoverId: "frita", drawActor() {} });
});

test("select-screen: barras HTML y montaje DOM idempotente que no captura input", () => {
  const html = statsHTML(selectStats(ROSTER).kilo);
  assert.match(html, /Vida/); assert.match(html, /Dificultad/); assert.match(html, /data-w="\d+"/);
  const listeners = [];
  const mkEl = (id) => ({ dataset: { id }, style: { setProperty() {} }, classList: { add() {}, remove() {} }, querySelector: () => null, querySelectorAll: () => [], insertAdjacentHTML(_, h) { this.html = h; }, addEventListener: (ev) => listeners.push(ev), removeEventListener() {} });
  const cards = ROSTER.map((c) => mkEl(c.id));
  const grid = { querySelectorAll: (sel) => (sel.includes("ss-stats") ? [] : cards), querySelector: () => null };
  const doc = { getElementById: () => null, createElement: () => ({}), head: { appendChild() {} } };
  const win = { addEventListener: (ev) => listeners.push(ev), removeEventListener() {}, requestAnimationFrame: () => 0 };
  const un = mountSelectScreen({ grid, roster: ROSTER, doc, win });
  assert.equal(mountSelectScreen({ grid, roster: ROSTER, doc, win }), un);
  assert.ok(cards.every((c) => /ss-stats/.test(c.html)));
  assert.ok(!listeners.some((ev) => /key|click|pointerdown|touch/.test(ev)));
  un();
  assert.equal(typeof mountSelectScreen({}), "function");
});

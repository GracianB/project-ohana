import test from "node:test";
import assert from "node:assert/strict";
import { drawWorld1MoonJelly } from "../systems/world1-play.js";

function recordingCanvas() {
  const stats = { calls: {}, paints: new Set(), saveDepth: 0, badCoordinates: 0, gradients: 0 };
  const values = { globalAlpha: 1, lineWidth: 1, fillStyle: "#000", strokeStyle: "#000" };
  const ctx = new Proxy(values, {
    get(obj, prop) {
      if (prop in obj) return obj[prop];
      if (prop === "createLinearGradient" || prop === "createRadialGradient") return () => { stats.gradients++; return {addColorStop() {}}; };
      return (...args) => {
        stats.calls[prop] = (stats.calls[prop] || 0) + 1;
        if (args.some((x) => typeof x === "number" && !Number.isFinite(x))) stats.badCoordinates++;
        if (prop === "save") stats.saveDepth++;
        if (prop === "restore") stats.saveDepth--;
      };
    },
    set(obj, prop, val) {
      obj[prop] = val;
      if (prop === "fillStyle" || prop === "strokeStyle") stats.paints.add(val);
      return true;
    }
  });
  return { ctx, stats, values };
}

test("Michi World 1: five lunar jellies are individually authored, finite Canvas drawings", () => {
  const distinct = new Set();
  for (let id = 0; id < 5; id++) for (const done of [false, true]) {
    const {ctx, stats, values} = recordingCanvas();
    assert.doesNotThrow(() => drawWorld1MoonJelly(ctx, { x: 220, y: 145, id, done }, 85));
    assert.equal(stats.saveDepth, 0, "Canvas state must be balanced");
    assert.equal(stats.gradients, 0, "no per-frame gradients");
    assert.equal(stats.badCoordinates, 0, "no non-finite geometry");
    assert.ok(stats.calls.bezierCurveTo >= 7, "organic dome and animated tentacles");
    assert.ok(stats.calls.quadraticCurveTo >= 8, "cat ears, eyes and face required");
    assert.ok(stats.calls.ellipse >= (done ? 5 : 3), "real facial anatomy");
    assert.equal(values.globalAlpha, 1, "Canvas should restore its input opacity");
    const colors = [...stats.paints].filter(c => typeof c === "string").sort();
    if (done) distinct.add(colors.join("|"));
  }
  assert.equal(distinct.size, 5, "each jelly should have a unique moon palette");
});

test("Michi World 1: resting/awake/reduced-motion conditions never produce invalid geometry", () => {
  for (const done of [false, true]) for (const reduced of [false, true]) for (const frame of [-30, 0, 5, 45, 180, 100000]) {
    const {ctx, stats} = recordingCanvas();
    drawWorld1MoonJelly(ctx, {x: -80, y: 600, id: 4, done}, frame, reduced);
    assert.equal(stats.badCoordinates, 0);
    assert.equal(stats.saveDepth, 0);
    assert.ok((stats.calls.stroke || 0) >= 10);
  }
});

import test from "node:test";
import assert from "node:assert/strict";
import Dino from "../characters/art/dino.js";

function render(form, state = "idle", overrides = {}) {
  const trace = [];
  let saves = 0, restores = 0;
  const ctx = new Proxy({
    globalAlpha: 1,
    save() { saves++; },
    restore() { restores++; },
    createLinearGradient() { return { addColorStop() {} }; },
  }, {
    get(obj, key) { return key in obj ? obj[key] : () => {}; },
    set(obj, key, value) { obj[key] = value; return true; },
  });
  const validate = (type, points) => {
    assert.ok(points.every(p => Array.isArray(p) && p.length >= 2 &&
      Number.isFinite(p[0]) && Number.isFinite(p[1])), "Invalid " + type + " geometry");
    trace.push({ type, count: points.length });
  };
  const R = {
    INK: "#243725", LINE: 2,
    darken: color => color, lighten: color => color,
    alpha: color => color, volume: () => "#80c084",
    blob: (_ctx, points) => validate("blob", points),
    poly: (_ctx, points) => validate("poly", points),
    swingLimb: (_ctx, x, y, len, angle) => [x + Math.sin(angle) * len, y + Math.cos(angle) * len],
    ellipse() {}, eye() {}, blush() {}, shine() {},
    star() {}, sparkle() {}, halo() {},
  };
  const pose = {
    form, t: 77, state, move: "", breath: 0.2, sway: 0.1,
    bounce: 0, phase: 1.4, flourish: 0, flourishN: 0,
    atk: 0.5, cast: 0.45, castSlot: 2,
    ...overrides,
  };
  Dino.draw(ctx, pose, R);
  assert.equal(saves, restores, "Unbalanced canvas transforms: form " + form + "/" + state);
  assert.ok(trace.length > 0, "Missing geometry: form " + form + "/" + state);
  return trace;
}

test("Dino V74 maintains all five original evolutions and action states", () => {
  for (let form = 0; form < 5; form++) {
    for (const state of ["idle", "run", "jump", "fall", "attack", "cast", "hurt", "wall", "dead", "victory"]) {
      const opts = state === "cast" ? { castSlot: form % 3 } : {};
      assert.deepEqual(render(form, state, opts), render(form, state, opts),
        "Non-deterministic shape: " + form + "/" + state);
    }
    for (let gesture = 0; gesture < 3; gesture++) render(form, "idle", { flourish: 0.45, flourishN: gesture });
  }
});

test("Dino V74 tail is an anatomical, ornamented silhouette rather than hidden stickers", () => {
  assert.equal(render(0).some(x => x.type === "blob" && x.count === 19), false,
    "Egg hatchling must keep its original short baby tail");
  for (let form = 1; form <= 4; form++) {
    const shapes = render(form);
    const tail = shapes.findIndex(x => x.type === "blob" && x.count === 19);
    assert.ok(tail >= 0, "Missing living tail in evolution " + form);
    if (form === 2) {
      const plate = shapes.findIndex(x => x.type === "blob" && x.count === 5);
      assert.ok(plate > tail, "Dorsal armor is being obscured by skin");
    }
    if (form === 4) {
      const crystal = shapes.findIndex(x => x.type === "poly" && x.count === 5);
      assert.ok(crystal > tail, "Aurora crystals must be drawn on the outside");
    }
  }
  for (const state of ["run", "jump", "attack", "victory", "dead"]) {
    render(2, state);
    render(4, state);
  }
});


test("Dino V76 K is a genuinely circular armoured creature at all five stages", () => {
 for (let form = 0; form < 5; form++) {
   const shapes = render(form, "run", { move: "dino-roll", phase: 3.2 });
   assert.ok(shapes.filter(shape => shape.type === "poly" && shape.count === 3).length >= 9,
     "Spinning sphere needs nine actual outer spikes at form " + form);
   assert.ok(shapes.length >= 9, "Rolled silhouette must remain drawn at form " + form);
   assert.deepEqual(shapes, render(form, "run", { move: "dino-roll", phase: 3.2 }),
     "Rolling must be deterministic at form " + form);
 }
});

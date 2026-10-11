import test from "node:test";
import assert from "node:assert/strict";
import { pizzaMomentum } from "../characters/art/pizza.js";

test("Pizza has a cheese landing accent when it touches solid ground", () => {
  assert.deepEqual(pizzaMomentum({ state: "idle", land: .9 }), {
    land: .9, run: 0, turn: 0, brake: 0,
  });
  assert.equal(pizzaMomentum({ state: "idle", land: .01 }), null);
});

test("Pizza has elastic turning and accordion braking only while running", () => {
  assert.deepEqual(pizzaMomentum({
    state: "run", speed: .8, turnPulse: .7, brake: .5,
  }), { land: 0, run: .8, turn: .7, brake: .5 });
  assert.equal(pizzaMomentum({ state: "idle", turnPulse: 1, brake: 1 }), null);
});

test("The bounce special effect is not drawn a second time", () => {
  assert.equal(pizzaMomentum({ state: "run", move: "bounce", speed: 1, land: 1 }), null);
  for (const state of ["hurt", "dead"]) {
    assert.equal(pizzaMomentum({ state, speed: 1, land: 1 }), null);
  }
});

test("Out-of-range motion remains bounded and independent of abilities", () => {
  assert.deepEqual(pizzaMomentum({
    state: "run", speed: 2, turnPulse: Infinity, brake: -.7, land: 10,
  }), { land: 1, run: 1, turn: 0, brake: 0 });
  assert.equal(pizzaMomentum({ state: "run", speed: NaN, land: NaN, brake: NaN }), null);
});

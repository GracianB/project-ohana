import test from "node:test";
import assert from "node:assert/strict";
import { dragonMomentum } from "../characters/art/dragon.js";

test("Dragon lands with localized wing airflow", () => {
  assert.deepEqual(dragonMomentum({ state: "idle", land: .7 }), {
    landing: .7, run: 0, turn: 0, brake: 0,
  });
  assert.equal(dragonMomentum({ state: "idle", land: 0 }), null);
});

test("Dragon turns with embers and brakes with counterwind", () => {
  assert.deepEqual(dragonMomentum({
    state: "run", land: 0, speed: .8, turnPulse: .65, brake: .3,
  }), { landing: 0, run: .8, turn: .65, brake: .3 });
  assert.equal(dragonMomentum({ state: "idle", turnPulse: 1, brake: 1 }), null);
});

test("Flight, damage and death do not reuse grounded effects", () => {
  for (const state of ["hurt", "dead"]) {
    assert.equal(dragonMomentum({ state, speed: 1, land: 1 }), null);
  }
  assert.equal(dragonMomentum({ state: "glide", move: "fly", land: 1 }), null);
});

test("Dragon visual signals clamp invalid rig values", () => {
  assert.deepEqual(dragonMomentum({
    state: "run", land: 4, speed: Infinity, turnPulse: -.4, brake: .5,
  }), { landing: 1, run: 0, turn: 0, brake: .5 });
  assert.equal(dragonMomentum({ state: "run", land: NaN, speed: NaN }), null);
});

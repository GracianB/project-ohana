import test from "node:test";
import assert from "node:assert/strict";
import { fritaFootwork } from "../characters/art/frita.js";

test("Frita landings have a local signature independent of combat", () => {
  assert.deepEqual(fritaFootwork({ state: "idle", land: .8 }), {
    landing: .8, turn: 0, brake: 0, running: 0,
  });
  assert.equal(fritaFootwork({ state: "idle", land: 0 }), null);
  assert.equal(fritaFootwork({ state: "jump", land: 0 }), null);
});

test("Ketchup turns and salt braking only appear while running", () => {
  assert.deepEqual(fritaFootwork({
    state: "run", land: 0, turnPulse: .7, brake: .5, speed: .8,
  }), { landing: 0, turn: .7, brake: .5, running: .8 });
  assert.equal(fritaFootwork({ state: "idle", turnPulse: 1, brake: 1 }), null);
  assert.equal(fritaFootwork({ state: "run", speed: .1 }), null);
});

test("Visual crumbs do not appear while sliding, hurt or dead", () => {
  for (const state of ["hurt", "dead"]) {
    assert.equal(fritaFootwork({ state, speed: 1, land: 1, brake: 1 }), null);
  }
  assert.equal(fritaFootwork({
    state: "run", move: "slide", speed: 1, turnPulse: 1, land: 1,
  }), null);
});

test("Visual state clamps malformed animation values safely", () => {
  const fx = fritaFootwork({ state: "run", speed: 30, land: 2, brake: Infinity, turnPulse: -.7 });
  assert.deepEqual(fx, { landing: 1, turn: 0, brake: 0, running: 1 });
  assert.equal(fritaFootwork({ state: "run", speed: NaN, land: NaN, brake: NaN }), null);
});

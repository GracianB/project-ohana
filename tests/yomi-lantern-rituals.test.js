import test from "node:test";
import assert from "node:assert/strict";
import { yomiRitualState } from "../characters/art/yomi.js";

test("Yomi has four distinct deterministic idle rituals, not an extra gameplay ability", () => {
  const names = new Set();
  for (let n = 0; n < 4; n++) {
    const input = Object.freeze({ state: "idle", form: 4, flourish: 0.5, flourishN: n });
    const first = yomiRitualState(input);
    assert.deepEqual(first, yomiRitualState(input));
    assert.equal(first.scene, n);
    assert.equal(first.phase, .5);
    assert.equal(first.alpha, 1);
    names.add(first.scene);
  }
  assert.equal(names.size, 4);
});

test("Ritual is hidden when moving, attacking, casting, hurt or dead", () => {
  for (const state of ["run", "jump", "fall", "glide", "attack", "cast", "hurt", "dead", "victory"]) {
    assert.equal(yomiRitualState({ state, flourish: .5, flourishN: 2 }), null, state);
  }
  for (const value of [0, 1, NaN, Infinity, -Infinity, -1, undefined]) {
    assert.equal(yomiRitualState({ state: "idle", flourish: value }), null);
  }
});

test("Ritual fades gently and handles negative or invalid counters", () => {
  assert.ok(yomiRitualState({ state: "idle", flourish: .02, flourishN: -1 }).alpha < .2);
  assert.ok(yomiRitualState({ state: "idle", flourish: .98, flourishN: 7 }).alpha < .2);
  assert.equal(yomiRitualState({ state: "idle", flourish: .5, flourishN: -1 }).scene, 3);
  assert.equal(yomiRitualState({ state: "idle", flourish: .5, flourishN: "invalid" }).scene, 0);
});

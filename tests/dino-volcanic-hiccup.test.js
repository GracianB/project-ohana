import test from "node:test";
import assert from "node:assert/strict";
import { dinoHiccupState } from "../characters/art/dino.js";

test("Dino's fourth flourish has an ordered inhale, hiccup and recovery", () => {
  const state = (flourish) => dinoHiccupState({
    state: "idle", move: null, flourishN: 3, flourish,
  });
  const early=state(.22), middle=state(.52), late=state(.85);
  assert.ok(early.prepare > 0 && early.sneeze < .05);
  assert.ok(middle.sneeze > .8);
  assert.ok(late.settle > .5 && late.sneeze < .05);
  assert.deepEqual(state(.52), state(.52));
  assert.ok(Object.isFrozen(state(.52)));
});

test("Dino's three original idle gestures remain distinct", () => {
  for (let n = 0; n < 3; n++) {
    assert.equal(dinoHiccupState({ state:"idle", flourish:.5, flourishN:n }), null);
  }
  assert.ok(dinoHiccupState({ state:"idle", flourish:.5, flourishN:7 }));
  assert.ok(dinoHiccupState({ state:"idle", flourish:.5, flourishN:-1 }));
});

test("Hiccup cannot appear during combat, roll, hurt, death or charge", () => {
  for(const state of ["run","jump","fall","attack","cast","hurt","dead","victory"]){
    assert.equal(dinoHiccupState({ state, flourish:.5, flourishN:3 }), null);
  }
  for(const move of ["pound","charge"]){
    assert.equal(dinoHiccupState({ state:"idle", move, flourish:.5, flourishN:3 }), null);
  }
  for(const flourish of [0,1,NaN,Infinity,-1]){
    assert.equal(dinoHiccupState({ state:"idle", flourish, flourishN:3 }), null);
  }
});

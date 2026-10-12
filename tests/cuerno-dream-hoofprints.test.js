import test from "node:test";
import assert from "node:assert/strict";
import { cuernoFootstepState } from "../characters/art/cuerno.js";

test("Only evolved Cuerno receives visual footstep and landing marks", () => {
  for(const form of [1,2,3,4]){
    const state=cuernoFootstepState({ state:"idle", land:.8 }, form);
    assert.equal(state.form,form);
    assert.equal(state.land,.8);
    assert.ok(Object.isFrozen(state));
  }
  assert.equal(cuernoFootstepState({ state:"idle", land:1 }, 0),null);
});

test("Cuerno hooves respond to gallop, turn and brake with bounded force", () => {
  assert.deepEqual(cuernoFootstepState({
    state:"run", speed:.75, turnPulse:.6, brake:.45,
  }, 3),{ form:3, land:0, turn:.6, brake:.45, speed:.75 });
  assert.equal(cuernoFootstepState({ state:"run", speed:.15 }, 3),null);
  assert.equal(cuernoFootstepState({ state:"idle", turnPulse:1, brake:1 }, 3),null);
});

test("Reduced motion and midair/Cast/Hurt/Dead do not create footprints", () => {
  const p={state:"run",speed:1,land:1,turnPulse:1};
  assert.equal(cuernoFootstepState({...p,reduceMotion:true},4),null);
  assert.equal(cuernoFootstepState({...p,air:true},4),null);
  for(const state of ["jump","fall","glide","cast","attack","hurt","dead","victory"]){
    assert.equal(cuernoFootstepState({...p,state},4),null);
  }
});

test("Malformed pose fields are safe and cannot run away",()=>{
  assert.deepEqual(cuernoFootstepState({
    state:"run", speed:20, land:Infinity, brake:-4, turnPulse:.3,
  },19),{form:4,land:0,turn:.3,brake:0,speed:1});
  assert.equal(cuernoFootstepState({state:"run",speed:NaN,land:NaN,brake:NaN},3),null);
});

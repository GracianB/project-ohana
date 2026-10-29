import test from 'node:test';
import assert from 'node:assert/strict';
import cat from '../characters/art/cat.js';
import {poseFingerprint} from '../characters/draw.js';

const STATES = ['idle','run','jump','fall','glide','wall','attack','cast','hurt','victory','dead'];
const BASE = Object.freeze({t:73,phase:1.3,speed:1,atk:.5,cast:.5,castSlot:0,look:Object.freeze({x:.25,y:0}),michiSeed:42});
const GEOMETRY = new Set(['translate','rotate','scale','transform','setTransform','moveTo','lineTo','bezierCurveTo','quadraticCurveTo','ellipse','arc','rect','fillRect']);

// A recording context models Canvas state reads and save/restore. In particular,
// tentacle alpha multiplication must read a real alpha, rather than a fake method.
function render(pose) {
  const ops = [], geometry = [], stack = [];
  let state = {globalAlpha:1,lineWidth:1,fillStyle:'#000000',strokeStyle:'#000000',lineCap:'butt',lineJoin:'miter'};
  const ctx = new Proxy({}, {
    get: (_, key) => {
      if (key in state) return state[key];
      return (...args) => {
        for (const n of args) if (typeof n === 'number') assert.ok(Number.isFinite(n), `${key} received ${n}`);
        if (key === 'ellipse') assert.ok(args[2] >= 0 && args[3] >= 0, 'ellipse radii');
        if (key === 'arc') assert.ok(args[2] >= 0, 'arc radius');
        if (key === 'save') stack.push({...state});
        if (key === 'restore') { assert.ok(stack.length, 'restore without save'); state = stack.pop(); }
        assert.notEqual(key, 'drawImage', 'the five forms stay vector artwork');
        ops.push([key,...args]);
        if (GEOMETRY.has(key)) geometry.push([key,...args]);
      };
    },
    set: (_, key, value) => {
      if (typeof value === 'number') assert.ok(Number.isFinite(value), `${key} received ${value}`);
      if (key === 'globalAlpha') assert.ok(value >= 0 && value <= 1, 'Canvas alpha remains in range');
      if (key === 'lineWidth') assert.ok(value > 0, 'positive line width');
      state[key] = value; ops.push(['set',key,value]); return true;
    }
  });
  cat.draw(ctx, pose, {});
  assert.equal(stack.length, 0, 'the art restores all Canvas state');
  assert.ok(geometry.length > 100, 'actual character geometry was rendered');
  return {ops,geometry};
}
function sameDrawing(actual, expected, label) {
  const index = actual.findIndex((op, i) => JSON.stringify(op) !== JSON.stringify(expected[i]));
  if (index >= 0) assert.deepEqual(actual[index], expected[index], `${label}, Canvas operation ${index}`);
  assert.equal(actual.length, expected.length, `${label}, Canvas operation count`);
}
function freezePose(pose) {
  for (const value of Object.values(pose)) if (value && typeof value === 'object') Object.freeze(value);
  return Object.freeze(pose);
}

for (let form = 0; form < 5; form++) {
  test(`Michi form ${form}: all actions render without changing frozen game inputs`, () => {
    for (const state of STATES) {
      const pose = freezePose({...BASE,form,state,look:{x:.25,y:0},michiWelcome:{inspect:.2,groom:.1,purr:.1},health:71,xp:145,x:321,y:456});
      const before = JSON.stringify(pose);
      assert.doesNotThrow(() => render(pose), state);
      assert.equal(JSON.stringify(pose), before, state);
    }
  });
  test(`Michi form ${form}: corrupt clocks, phases and gaze never reach Canvas`, () => {
    for (const state of STATES) for (const bad of [NaN,Infinity,-Infinity]) {
      const cases = [
        {t:bad},{phase:bad},{atk:bad},{cast:bad},{land:bad},{bounce:bad},
        {bodyTilt:bad},{hurt:bad},{flourish:bad},{look:{x:bad,y:bad}},
        {t:bad,phase:bad,atk:bad,cast:bad,land:bad,bounce:bad,bodyTilt:bad,hurt:bad,look:{x:bad,y:bad}}
      ];
      for (const fault of cases) assert.doesNotThrow(() => render({...BASE,form,state,...fault}), `${state}: ${Object.keys(fault).join(',')}`);
    }
  });
  test(`Michi form ${form}: reduced motion freezes pose clocks and action progress`, () => {
    for (const state of STATES) for (const power of [0,1,2,3,4,5]) {
      const a = {...BASE,form,state,reduceMotion:true,michiPowerIndex:power,t:10,phase:.1,atk:.15,cast:.2,land:.8};
      const b = {...a,t:911,phase:4.8,atk:.82,cast:.87,land:.1};
      sameDrawing(render(a).ops, render(b).ops, `${state}, power ${power}`);
    }
  });
  test(`Michi form ${form}: state and power performances have distinct articulated geometry`, () => {
    const states = STATES.map(state => JSON.stringify(render({...BASE,form,state}).geometry));
    assert.equal(new Set(states).size, STATES.length, 'movement, action, hurt and celebration cannot share a static drawing');
    const powers = [0,1,2,3,4,5].map(michiPowerIndex => JSON.stringify(render({...BASE,form,state:'cast',michiPowerIndex}).geometry));
    assert.equal(new Set(powers).size, 6, 'J/K/L/I/P/U must have separate body performances');
    const early = render({...BASE,form,state:'attack',atk:.1}).geometry;
    const peak = render({...BASE,form,state:'attack',atk:.5}).geometry;
    assert.notDeepEqual(early, peak, 'attack progress moves anatomy');
  });
}

test('the presentation cache distinguishes Michi power gestures and horizontal gaze',()=>{
 const pose={form:3,state:'cast',t:73,phase:1,cast:.5,castSlot:0,reduceMotion:true,look:{x:0,y:0}};
 const keys=[0,1,2,3,4,5].map(michiPowerIndex=>poseFingerprint({...pose,michiPowerIndex}));
 assert.equal(new Set(keys).size,6,'different powers at the same clock cannot reuse the previous pose');
 assert.notEqual(poseFingerprint({...pose,look:{x:-1,y:0}}),poseFingerprint({...pose,look:{x:1,y:0}}));
});

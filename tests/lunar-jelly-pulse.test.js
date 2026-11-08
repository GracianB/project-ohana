import test from 'node:test';
import assert from 'node:assert/strict';
import {lunarJellyPulse} from '../systems/cat-chapter-art-v609.js';

test('lunar jelly swim pulse stays finite through contraction and recovery',()=>{
  const values=Array.from({length:1001},(_,n)=>lunarJellyPulse(n/10));
  assert.ok(values.every(Number.isFinite),'Canvas gradients cannot receive NaN coordinates');
  assert.ok(Math.max(...values)>0.12,'swimming contraction remains visible');
  assert.ok(Math.min(...values)<-0.07,'negative half-cycle must animate safely');
  assert.equal(lunarJellyPulse(NaN),0,'invalid animation time must not crash rendering');
  assert.equal(lunarJellyPulse(Infinity),0);
});

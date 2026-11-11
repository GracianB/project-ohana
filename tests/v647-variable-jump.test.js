import test from 'node:test';
import assert from 'node:assert/strict';
import {heroJumpCut} from '../systems/player-movement.js';
test('V647: short hop for early Michi differs from a sustained jump',()=>{
 const p={id:'cat',evo:0,_jumpHoldTicks:0};
 assert.equal(heroJumpCut(p),.47);
 p._jumpHoldTicks=16;assert.ok(heroJumpCut(p)>.47&&heroJumpCut(p)<=.55);
});
test('V647: Dino is weighted and all other heroes retain legacy cut',()=>{
 assert.ok(heroJumpCut({id:'dino',_jumpHoldTicks:0})<.55);
 for(const id of ['kilo','stitcho','chispin','cuerno','dragon','frita','pizza','yomi'])assert.equal(heroJumpCut({id}),.55);
 assert.equal(heroJumpCut({id:'cat',evo:4}),.55);
});
test('V647: malformed hold counts never increase jump energy',()=>{
 for(const n of [Infinity,NaN,-1,999]){
  const cut=heroJumpCut({id:'cat',evo:0,_jumpHoldTicks:n});
  assert.ok(cut>=.47&&cut<=.55);
 }
});

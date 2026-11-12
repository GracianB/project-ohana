import test from 'node:test';
import assert from 'node:assert/strict';
import {heroLandingImpact} from '../systems/player-movement.js';
test('V650: only physical fast falls create the character impact',()=>{
 assert.equal(heroLandingImpact({id:'dino'},6.9,false),null);
 assert.ok(heroLandingImpact({id:'dino'},10,false)?.count>=4);
 assert.ok(heroLandingImpact({id:'cat'},9,false)?.count>=4);
});
test('V650: Kilo and other unchanged hero kits have zero new landing effect',()=>{
 for(const id of ['kilo','stitcho','chispin','cuerno','dragon','frita','pizza','yomi'])
  assert.equal(heroLandingImpact({id},15,false),null);
});
test('V650: low-motion, NaN and runaway velocities remain safe',()=>{
 assert.equal(heroLandingImpact({id:'cat'},NaN,false),null);
 for(const id of ['cat','dino']){
  const reduced=heroLandingImpact({id},1000,true);
  assert.equal(reduced.count,2);
  assert.ok(heroLandingImpact({id},1000,false).count<=20);
 }
});

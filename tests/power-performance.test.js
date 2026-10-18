import test from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER} from '../characters/roster.js';
import {applyPowerPerformance} from '../characters/power-performance.js';
test('new powers anticipate, release and recover without changing gameplay bodies',()=>{
 for(const hero of ROSTER)for(const index of [4,5]){
  const p={id:hero.id,x:100,y:120,w:30,h:40,_powerPerformance:{index,start:10}};
  const before=JSON.stringify(p);for(const [age,beat] of [[5,'anticipation'],[15,'release'],[35,'recovery']]){
   const pose=applyPowerPerformance({state:'idle',air:false},p,10+age);assert.equal(pose.powerBeat,beat);assert.ok(Number.isFinite(pose.bodyTilt));assert.ok(pose.squash<=.18);
  }assert.equal(JSON.stringify(p),before);
  assert.equal(applyPowerPerformance({state:'idle'},p,100).powerBeat,undefined);
 }
});
test('hurt, death and reduced motion retain readable stable poses',()=>{
 const p={id:'dragon',_powerPerformance:{index:5,start:0}};
 assert.equal(applyPowerPerformance({state:'hurt'},p,15).state,'hurt');p.dead=true;
 assert.equal(applyPowerPerformance({state:'dead'},p,15).state,'dead');p.dead=false;
 const pose=applyPowerPerformance({state:'idle',reduceMotion:true},p,15);assert.equal(pose.powerLift,0);assert.equal(pose.bodyTilt,undefined);
});

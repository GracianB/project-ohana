import test from 'node:test';
import assert from 'node:assert/strict';
import {startFamilyDuet,updateFamilyDuet,readFamilyDuet,familyDuetPose} from '../systems/family-duets.js';
import {guestPerformance} from '../systems/u-duet-direction-v315.js';

test('Surprise encore lasts six seconds, waves goodbye and adds no combat beats',()=>{
 const game={player:{id:'dragon',x:200,y:200,w:30,h:40,evo:2,facing:1,uSurprise:true},roomId:'hub',enemies:[]};
 assert.ok(startFamilyDuet(game,1,[],'cat'));
 let hits=0;game._familyDuet.age=102;
 for(let age=102;age<360;age++){
  const state=readFamilyDuet(game._familyDuet);
  assert.ok(state);const pose=familyDuetPose(state);
  assert.ok(Number.isFinite(pose.allyX));assert.ok(pose.alpha>0);
  assert.equal(pose.guest.phase,age>=301?'farewell':'encore');
  assert.equal(pose.guest.impact,false);
  updateFamilyDuet(game,()=>{hits++;return true;});
 }
 assert.equal(hits,0);assert.equal(readFamilyDuet(game._familyDuet),null);
 updateFamilyDuet(game,()=>{hits++;});assert.equal(game._familyDuet,null);
});
test('Extended surprise state is bounded; normal guests keep their two-second contract',()=>{
 const state={hero:'dragon',ally:'cat',x:200,y:300,evo:1,facing:1,age:240};
 assert.equal(readFamilyDuet(state),null);assert.equal(guestPerformance(state,'cat'),null);
 assert.ok(readFamilyDuet({...state,surprise:true}));
 assert.equal(readFamilyDuet({...state,age:360,surprise:true}),null);
 assert.equal(guestPerformance({...state,age:360,surprise:true},'cat'),null);
});

import test from 'node:test';import assert from 'node:assert/strict';
import {startStitchoDuet,updateStitchoDuet,readStitchoDuet,stitchoDuetPose} from '../systems/stitcho-duet.js';
import {capturePeerEffects,applyPeerEffects,advancePeerEffects} from '../systems/coop-peer-effects.js';
const game=()=>({player:{id:'stitcho',x:100,y:200,w:24,h:30,evo:4,facing:1,vx:0,vy:0},roomId:'hub',enemies:[],projectiles:[]});
test('V302 all forms preserve player control and terminate the storm after 120 ticks',()=>{
 for(let evo=0;evo<5;evo++){const g=game();g.player.evo=evo;startStitchoDuet(g);
  for(let i=0;i<121;i++)updateStitchoDuet(g,()=>true);
  assert.equal(g.player.x,100);assert.equal(g.player.vx,0);assert.equal(g.player.vy,0);assert.equal(g._stitchoDuet,null);assert.equal(g.player._stitchoDuetT,0);
 }
});
test('V302 chaos hits once, thunder strikes three times, and remote enemies are excluded',()=>{
 const g=game(),near={x:110,y:200,w:24,h:24,hp:1000},far={x:1000,y:200,w:24,h:24,hp:1000};g.enemies=[near,far];const hits=[];
 startStitchoDuet(g);for(let i=0;i<30;i++)updateStitchoDuet(g,(_g,e,d)=>{hits.push(e);e.hp-=d;return true;});assert.equal(hits.length,0);
 for(let i=0;i<95;i++)updateStitchoDuet(g,(_g,e,d)=>{hits.push(e);e.hp-=d;return true;});assert.equal(hits.length,4);assert.ok(hits.every(e=>e===near));assert.equal(far.hp,1000);
});
test('V302 death cancels the storm and snapshot validation rejects invalid bolts',()=>{
 const g=game();startStitchoDuet(g);g.player.dead=true;updateStitchoDuet(g,()=>true);assert.equal(g._stitchoDuet,null);
 const s={x:10,y:20,evo:4,age:45,facing:1,bolts:[{x:30,y:40,life:8}]};assert.equal(stitchoDuetPose(s).beat,'storm');assert.ok(readStitchoDuet(s));
 assert.equal(readStitchoDuet({...s,bolts:[{x:Infinity,y:20,life:8}]}),null);assert.equal(readStitchoDuet({...s,age:120}),null);
});
test('V302 storm replicas retain visible bolts and never gain damaging state',()=>{
 const g=game(),peer=game();startStitchoDuet(g);g._stitchoDuet.age=45;g._stitchoDuet.bolts=[{x:160,y:200,life:8}];
 const frame=capturePeerEffects(g,1,'storm');assert.equal(applyPeerEffects(peer,frame),true);assert.equal(peer.coopPeerEffects.stitchoDuet.power,undefined);assert.equal(peer._stitchoDuet,undefined);
 advancePeerEffects(peer);assert.equal(peer.coopPeerEffects.stitchoDuet.age,46);assert.equal(peer.coopPeerEffects.stitchoDuet.bolts[0].life,7);
 assert.equal(applyPeerEffects(peer,{...frame,frameNo:2,stitchoDuet:{...frame.stitchoDuet,evo:100}}),false);
});

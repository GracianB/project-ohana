import test from 'node:test';
import assert from 'node:assert/strict';
import {
 enterStitchoTrail,interactStitchoTrail,stitchoTrailPrompt,updateStitchoTrail,
 STITCHO_BEACONS,STITCHO_FRAGMENTS,STITCHO_GATES,STITCHO_PADS,stitchoAbility,
 stitchoTrailSnapshot
} from '../systems/stitcho-trail.js';
import {STITCHO_BOSS_ID} from '../systems/stitcho-boss.js';
const fixture=(hero='stitcho',saved=[],cleared=[])=>{
 let saves=0,spawns=0;
 const g={roomId:'hub',t:0,platforms:[],enemies:[],cam:{x:0,y:0},worldW:4200,
  player:{id:hero,x:0,y:0,w:30,h:40,xp:0,invuln:0,grounded:false},
  secrets:{hub:[...saved]},clearedEncounters:{hub:[...cleared]},score:0,
  spawnStitchoBoss(){spawns++;return true;},save(){saves++;},nums:{add(){}}
 };
 enterStitchoTrail(g);
 const at=(x,y)=>{g.player.x=x-15;g.player.y=y-20;};
 const pickup=(i)=>{const shard=STITCHO_FRAGMENTS[i];at(shard.x,shard.y);updateStitchoTrail(g);};
 return {g,at,pickup,get saves(){return saves;},get spawns(){return spawns;}};
};
test('Stitcho adds four moving rails, three springs and three safe-warning-live gates',()=>{
 const f=fixture();
 assert.equal(f.g.stitchoTrail.lifts.length,4);
 assert.equal(f.g.platforms.length,4);
 assert.equal(STITCHO_PADS.length,3);
 assert.equal(STITCHO_GATES.length,3);
 assert.equal(fixture('kilo').g.stitchoTrail,null);
 const online=fixture();online.g.personalAdventureSolo=false;enterStitchoTrail(online.g);
 assert.equal(online.g.stitchoTrail,null);
});
test('three signal acts require four energy shards and unlock the 480-HP boss encounter',()=>{
 const f=fixture();
 f.at(STITCHO_BEACONS[0].x,STITCHO_BEACONS[0].y);
 assert.match(stitchoTrailPrompt(f.g),/activar/);
 assert.equal(interactStitchoTrail(f.g),true);assert.equal(f.g.stitchoTrail.index,1);
 f.at(STITCHO_BEACONS[1].x,STITCHO_BEACONS[1].y);
 assert.match(stitchoTrailPrompt(f.g),/2 fragmentos/);
 assert.equal(interactStitchoTrail(f.g),true);assert.equal(f.g.stitchoTrail.index,1);
 f.pickup(0);f.pickup(1);f.at(STITCHO_BEACONS[1].x,STITCHO_BEACONS[1].y);
 assert.equal(interactStitchoTrail(f.g),true);assert.equal(f.g.stitchoTrail.index,2);
 f.pickup(2);f.pickup(3);f.at(STITCHO_BEACONS[2].x,STITCHO_BEACONS[2].y);
 assert.equal(interactStitchoTrail(f.g),true);
 assert.equal(stitchoTrailSnapshot(f.g).complete,true);
 updateStitchoTrail(f.g);updateStitchoTrail(f.g);assert.equal(f.spawns,1);
 assert.equal(f.g.stitchoTrail.shards,4);
 assert.equal(f.g.score,1405);assert.equal(f.g.player.xp,80);
 assert.equal(f.g.secrets.hub.filter(x=>x==='stitcho-trail-v1').length,1);
 assert.ok(f.saves>=7);
 const restored=fixture('stitcho',f.g.secrets.hub);
 assert.equal(restored.g.stitchoTrail.complete,true);
 assert.equal(restored.g.stitchoTrail.shards,4);
 assert.equal(restored.g.stitchoTrail.index,3);
 assert.equal(interactStitchoTrail(restored.g),false);
});
test('three native J/K/L casts unlock unique mastery once and J disrupts hazards',()=>{
 const f=fixture();
 f.at(STITCHO_GATES[0].x,1100);
 for(const index of [0,1,2])assert.equal(stitchoAbility(f.g,f.g.player,index),true);
 assert.equal(f.g.stitchoTrail.signatureComplete,true);
 assert.ok(f.g.stitchoTrail.gateSilencedUntil[0]>0);
 assert.equal(f.g.score,250);assert.equal(f.g.player.xp,35);
 for(const index of [0,1,2])stitchoAbility(f.g,f.g.player,index);
 assert.equal(f.g.score,250);
});
test('completed boss and blocked progression do not duplicate prizes',()=>{
 const f=fixture('stitcho',['stitcho-trail-v1',...STITCHO_BEACONS.map(x=>x.id)],[STITCHO_BOSS_ID]);
 assert.equal(f.g.stitchoTrail.complete,true);
 assert.equal(f.g.stitchoTrail.cleared,true);
 updateStitchoTrail(f.g);
 assert.equal(f.spawns,0);
 assert.equal(interactStitchoTrail(f.g),false);
});

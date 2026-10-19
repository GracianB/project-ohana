import test from 'node:test';
import assert from 'node:assert/strict';
import {enterStitchoTrail,interactStitchoTrail,stitchoTrailPrompt,STITCHO_BEACONS,stitchoTrailSnapshot} from '../systems/stitcho-trail.js';
const fixture=(hero='stitcho',saved=[])=>{
 let saves=0;
 const g={roomId:'hub',player:{id:hero,x:0,y:0,w:30,h:40,xp:0},secrets:{hub:[...saved]},score:0,save(){saves++;},nums:{add(){}}};
 enterStitchoTrail(g);return {g,get saves(){return saves;}};
};
test('Stitcho has a real three-step ordered playable trail and one persistent reward',()=>{
 const f=fixture();assert.equal(f.g.stitchoTrail.index,0);
 for(let i=0;i<3;i++){
  const b=STITCHO_BEACONS[i];f.g.player.x=b.x-15;f.g.player.y=b.y-20;
  assert.match(stitchoTrailPrompt(f.g),/activar/);
  assert.equal(interactStitchoTrail(f.g),true);
  assert.equal(stitchoTrailSnapshot(f.g).index,i+1);
 }
 assert.equal(f.g.score,600);assert.equal(f.g.player.xp,30);
 assert.equal(f.saves,1);assert.equal(interactStitchoTrail(f.g),false);
 assert.equal(f.g.secrets.hub.filter(x=>x==='stitcho-trail-v1').length,1);
 const resumed=fixture('stitcho',f.g.secrets.hub);
 assert.equal(resumed.g.stitchoTrail.complete,true);
 assert.equal(interactStitchoTrail(resumed.g),false);
});
test('Stitcho trail cannot be completed out of order or by Kilo',()=>{
 const f=fixture();const last=STITCHO_BEACONS.at(-1);
 f.g.player.x=last.x-15;f.g.player.y=last.y-20;
 assert.equal(interactStitchoTrail(f.g),false);
 assert.equal(f.g.stitchoTrail.index,0);
 const other=fixture('kilo');assert.equal(other.g.stitchoTrail,null);
});

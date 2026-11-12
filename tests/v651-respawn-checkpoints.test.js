import test from 'node:test';
import assert from 'node:assert/strict';
import {WORLD1_ROOMS,WORLD1_FLOOR} from '../systems/world1-rooms.js';
import {enterWorld1,restoreWorld1DeathCheckpoint} from '../systems/world1-play.js';
function game(done=[]){
 const room=WORLD1_ROOMS['w1-cat'];
 return {roomId:room.id,roomDef:{...room,expedition:null},world1Seals:[],
  world1Stations:done.length?{'w1-cat':done}: {},world1Visited:{},reduceMotion:true,
  worldW:room.width,platforms:room.plats.map(p=>({x:p[0],y:p[1],w:p[2],h:p[3]})),score:0,
  player:{id:'cat',evo:0,x:200,y:WORLD1_FLOOR-42,w:32,h:42,vx:0,vy:0,grounded:true,health:100,maxHealth:100,xp:0},
  nums:{add(){}},fx:{emit(){}},save(){}};
}
test('V651: saved Michi rescue creates collision platforms before any gameplay update',()=>{
 const g=game([0,1]);
 const before=g.platforms.length;
 enterWorld1(g);
 assert.equal(g.world1.stations.filter(s=>s.done).length,2);
 assert.ok(g.platforms.length>before);
 assert.ok(g.platforms.some(p=>p._ohanaPulse));
 assert.equal(g.score,0);assert.deepEqual(g.world1Seals,[]);
});
test('V651: a restored death checkpoint rebuilds the same route immediately',()=>{
 const g=game();enterWorld1(g);
 assert.equal(g.platforms.some(p=>p._ohanaPulse),false);
 const checkpoint={room:'w1-cat',hero:'cat',kind:'medusas',completed:[0,1],scored:[0,1]};
 assert.equal(restoreWorld1DeathCheckpoint(g,checkpoint),true);
 const first=g.platforms.filter(p=>p._ohanaPulse).map(p=>[p.x,p.y,p.w,p.h]);
 assert.ok(first.length>0);assert.equal(g.score,0);
 assert.equal(restoreWorld1DeathCheckpoint(g,checkpoint),true);
 assert.deepEqual(g.platforms.filter(p=>p._ohanaPulse).map(p=>[p.x,p.y,p.w,p.h]),first);
});
test('V651: disallow forged cross-room checkpoint without modifying collisions',()=>{
 const g=game();enterWorld1(g);
 const old=g.platforms.length;
 assert.equal(restoreWorld1DeathCheckpoint(g,{room:'w1-dino',hero:'dino',kind:'medusas',completed:[0]}),false);
 assert.equal(g.platforms.length,old);
});

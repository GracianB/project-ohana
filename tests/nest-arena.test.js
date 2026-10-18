import test from 'node:test';
import assert from 'node:assert/strict';
import {createBossNido,exposeNestQueen,updateBossNido} from '../systems/boss-nido.js';
import {updateNestArena,nestArenaSnapshot} from '../systems/nest-arena.js';
function game(phase=2){return {roomId:'boss',worldW:3360,worldH:1260,player:{x:300,y:1094,w:30,h:40,facing:1,melee:0},
 boss:{...createBossNido(),introT:0,phase,x:700,y:1004},platforms:[{x:0,y:1134,w:3360,h:126}],projectiles:[],fx:{emit(){}},nums:{add(){}}};}
const tick=(g,n,helpers={})=>{for(let i=0;i<n;i++)updateNestArena(g,helpers);};
test('the queen lands on the authored arena floor instead of sinking below it',()=>{
 const g=game(1);g.boss.introT=72;
 updateBossNido(g.boss,g,{ROOM_W:3360,ROOM_H:1260,t:1,reduceMotion:true});
 assert.equal(g.boss.y+g.boss.h,1134);
});
test('phase one and the entrance never produce falling hazards',()=>{
 const g=game(1);tick(g,600);assert.equal(g.nestArena.feathers.length,0);g.boss.phase=2;g.boss.introT=50;tick(g,500);assert.equal(g.nestArena.feathers.length,0);
});
test('a volley announces fixed columns before falling and leaves gaps',()=>{
 const g=game();tick(g,150);const s=nestArenaSnapshot(g);assert.equal(s.feathers.length,2);assert.ok(s.feathers.every(f=>f.phase==='warning'));
 const positions=s.feathers.map(f=>f.x);g.player.x=1200;let hurt=0;tick(g,63,{hurt(){hurt++;}});assert.equal(hurt,0);
 assert.deepEqual(g.nestArena.feathers.map(f=>f.x),positions);assert.ok(Math.abs(positions[0]-positions[1])>=180);
});
test('melee returns a feather and three successful returns expose the queen',()=>{
 const g=game();tick(g,1);g.player.melee=7;let hits=0;
 for(let i=0;i<3;i++){
  g.nestArena.feathers=[{x:340,y:1110,floor:1134,phase:'fall',life:100}];
  tick(g,1);assert.equal(g.nestArena.feathers[0].phase,'return');
  tick(g,40,{hit(_g,boss,n){hits++;boss.hp-=n;return true;}});
 }
 assert.equal(hits,3);assert.equal(g.nestArena.returned,3);assert.equal(g.boss.mode,'recovery');assert.equal(g.boss.vulnerable,true);assert.equal(g.boss.recoveryT,78);
});
test('player shots can return feathers, warnings cannot be hit, and ashes can be jumped',()=>{
 const g=game();tick(g,1);g.nestArena.feathers=[{x:340,y:1110,floor:1134,phase:'warning',left:30,life:100}];g.player.melee=7;tick(g,1);assert.equal(g.nestArena.feathers[0].phase,'warning');
 g.nestArena.feathers[0].phase='fall';g.player.melee=0;g.projectiles=[{x:337,y:1107,w:6,h:6,owner:'player',life:60}];tick(g,1);assert.equal(g.projectiles[0].life,0);assert.equal(g.nestArena.feathers[0].phase,'return');
 g.nestArena.feathers=[{x:315,y:1122,floor:1134,phase:'ember',life:60}];g.player.y=990;let hits=0;tick(g,1,{hurt(){hits++;}});assert.equal(hits,0);
 g.player.y=1094;tick(g,1,{hurt(){hits++;}});assert.equal(hits,1);
});
test('death, room exits and phase changes clear hazards',()=>{
 const g=game();tick(g,150);g.boss.phase=3;tick(g,1);assert.equal(g.nestArena.feathers.length,0);tick(g,150);assert.equal(g.nestArena.feathers.length,3);
 g.player.dead=true;tick(g,1);assert.equal(g.nestArena,null);g.player.dead=false;g.roomId='hub';tick(g,1);assert.equal(g.nestArena,null);
 assert.equal(exposeNestQueen({...g.boss,introT:20},g),false);assert.equal(exposeNestQueen({...g.boss,hp:0},g),false);
});

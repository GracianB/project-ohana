import test from 'node:test';
import assert from 'node:assert/strict';
import {ROOMS} from '../systems/map.js';
import {enterAdventure,interactAdventure,updateAdventure,adventureSnapshot,adventurePrompt} from '../systems/room-adventures.js';
function game(roomId='hub'){
 const g={roomId,worldH:1260,player:{id:'kilo',x:0,y:0,w:30,h:40,evo:2,xp:0},score:0,enemies:[],fx:{emit(){}},nums:{add(){}},
  platforms:ROOMS[roomId].plats.map(([x,y,w,h])=>({x,y,w,h}))};
 const a=enterAdventure(g);if(a){g.player.x=a.x-15;g.player.y=a.y-40;}return g;
}
const ticks=(g,n)=>{for(let i=0;i<n;i++)updateAdventure(g);};
test('nine real rooms have grounded interactive challenges; boss arena stays clear',()=>{
 for(const id of Object.keys(ROOMS)){const g=game(id),a=g.adventure;if(id==='boss'){assert.equal(a,null);continue;}
 assert.ok(g.platforms.some(p=>p.h>40&&a.x>=p.x&&a.x<=p.x+p.w&&a.y===p.y),id);
 assert.match(adventurePrompt(g),/^E · /);assert.ok(a.path.length>=3);assert.ok(a.duration>=2400);}
});
test('race requires ordered world-space rings and rewards only once per run',()=>{
 const g=game();assert.equal(interactAdventure(g),true);const path=g.adventure.path;
 const last=path.at(-1);g.player.x=last.x-15;g.player.y=last.y-20;ticks(g,1);assert.equal(g.adventure.index,0);
 for(const r of path){g.player.x=r.x-15;g.player.y=r.y-20;ticks(g,1);}
 assert.equal(g.adventure.phase,'won');assert.ok(g.player.xp>0);const xp=g.player.xp;ticks(g,100);assert.equal(g.player.xp,xp);
 enterAdventure(g);assert.equal(g.adventure.phase,'won');assert.equal(interactAdventure(g),false);
});
test('timed race can be retried without paying a reward for failure',()=>{
 const g=game();interactAdventure(g);g.adventure.left=1;ticks(g,1);assert.equal(g.adventure.phase,'ready');assert.equal(g.player.xp,0);
 assert.equal(interactAdventure(g),true);assert.equal(g.adventure.index,0);
});
test('ambush warns before spawning, includes two waves and an elite guardian',()=>{
 const g=game('beach');interactAdventure(g);assert.equal(g.adventure.phase,'warning');assert.equal(g.enemies.length,0);
 ticks(g,60);assert.equal(g.enemies.length,0);ticks(g,100);assert.equal(g.adventure.phase,'fighting');assert.ok(g.enemies.length>=2);assert.ok(g.enemies.every(e=>!e.canSplit));
 g.enemies.forEach(e=>e.hp=0);ticks(g,1);assert.equal(g.adventure.wave,1);assert.equal(g.adventure.phase,'warning');
 ticks(g,130);assert.ok(g.enemies.some(e=>e.hp>0&&e.elite));assert.equal(g.player.xp,0);
 g.enemies.forEach(e=>e.hp=0);ticks(g,1);assert.equal(g.adventure.phase,'won');assert.equal(adventureSnapshot(g).medals,1);
});
test('death removes the optional wave and never awards a phantom completion',()=>{
 const g=game('lab');const regular={hp:200};g.enemies.push(regular);interactAdventure(g);ticks(g,140);assert.ok(g.enemies.length>1);
 g.player.dead=true;ticks(g,1);assert.deepEqual(g.enemies,[regular]);assert.equal(g.adventure.phase,'ready');assert.equal(g.player.xp,0);
});
test('a new character run does not inherit medals from the previous player',()=>{
 const g=game();g.adventureMedals.hub=true;g.player={...g.player};enterAdventure(g);assert.equal(g.adventure.phase,'ready');
});

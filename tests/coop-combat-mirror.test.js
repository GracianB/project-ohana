import test from "node:test";
import assert from "node:assert/strict";
import {captureCombatFrame,applyCombatFrame} from "../systems/coop-combat-mirror.js";

test("host sends room-scoped bounded enemy and projectile combat state",()=>{
 const game={roomId:"hub",enemies:[{spawnIndex:0,kind:"toro",x:100,y:200,vx:3,vy:1,hp:15,telegraph:true}],projectiles:[
 {owner:"enemy",x:120,y:200,w:10,h:10,vx:4,vy:0,life:30,dmg:5,color:"#ff7733"},
 {owner:"player",x:2,y:3,life:40}]};
 const f=captureCombatFrame(game,7);
 assert.equal(f.roomId,"hub");assert.equal(f.frameNo,7);assert.equal(f.enemies[0].flags.telegraph,true);
 assert.equal(f.bullets.length,1);assert.equal(f.bullets[0].owner,"enemy");
});
test("guest matches spawn identity, mirrors attacks and never creates untrusted enemies",()=>{
 const game={roomId:"hub",enemies:[{spawnIndex:0,kind:"toro",x:0,y:0,hp:40,max:40}],coopRemoteEnemyBullets:[]};
 const f=captureCombatFrame({roomId:"hub",enemies:[{spawnIndex:0,kind:"toro",x:100,y:0,hp:19,telegraph:true}],
 projectiles:[{owner:"enemy",x:40,y:50,w:8,h:8,life:15}]},8);
 assert.equal(applyCombatFrame(game,f),true);
 assert.equal(game.enemies[0].x,60);assert.equal(game.enemies[0].hp,19);
 assert.equal(game.enemies[0].telegraph,true);assert.equal(game.coopRemoteEnemyBullets.length,1);
 assert.equal(applyCombatFrame(game,{...f,roomId:"boss"}),false);
 assert.equal(game.enemies.length,1);
});
test("rejects oversized combat frames and mismatched enemy kinds",()=>{
 const e={spawnIndex:0,kind:"toro",x:0,y:0,hp:25,max:25};
 const game={roomId:"hub",enemies:[e]};
 assert.equal(applyCombatFrame(game,{roomId:"hub",enemies:Array(41).fill({}),bullets:[]}),false);
 assert.equal(applyCombatFrame(game,{roomId:"hub",enemies:[{index:0,kind:"other",boss:false,x:500,y:500,hp:0}],bullets:[]}),true);
 assert.equal(e.hp,25);assert.equal(e.x,0);
});
test("online client retains direct host-authority and stale fallback boundaries",async()=>{
 const source=(await import("node:fs")).readFileSync(new URL("../systems/online-coop.js",import.meta.url),"utf8");
 assert.match(source,/this\.direct\.sendEvent\("combat",captureCombatFrame/);
 assert.match(source,/this\.remoteWorld===game\.roomId/);
 assert.match(source,/performance\.now\(\)-this\.lastCombatReceivedAt<750/);
});

test("event channel accepts bounded combat frames without loosening other events",async()=>{
 const rtc=(await import("node:fs")).readFileSync(new URL("../systems/coop-v108-direct.js",import.meta.url),"utf8");
 assert.match(rtc,/e\.data\.length>12000/);
 assert.match(rtc,/msg\.kind==="combat"\|\|e\.data\.length<=900/);
 assert.match(rtc,/kind==="combat"\?12000:900/);
 const source=(await import("node:fs")).readFileSync(new URL("../game.js",import.meta.url),"utf8");
 assert.match(source,/onlineCoop\.hasFreshCombat\(game\)/);
});

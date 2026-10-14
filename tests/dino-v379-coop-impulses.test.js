import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {forwardCoopAbilityHit,readDinoImpact,applyDinoImpact} from "../systems/coop-ability-hits.js";

test("V379: only Dino can report physics metadata, with bounded numeric fields",()=>{
 const events=[];const enemy={x:100,y:150,w:30,h:40,id:"foe",kind:"slime",_coopSyncId:22,_coopVisit:2};
 const coop={enabled:true,snapshot:{phase:"playing"},currentPlayer:()=>({slot:1}),
    signal:(_g,kind,payload)=>{events.push({kind,payload});return Promise.resolve(true);}};
 const g={player:{id:"dino"}};
 assert.equal(forwardCoopAbilityHit(g,coop,enemy,110,{stun:62,kx:15,ky:-12}),true);
 assert.equal(events[0].kind,"hit");
 assert.deepEqual(events[0].payload.dinoImpact,{stun:62,kx:15,ky:-12});
 g.player.id="dragon";
 assert.equal(forwardCoopAbilityHit(g,coop,enemy,110,{stun:62,kx:15,ky:-12}),true);
 assert.equal(events[1].payload.dinoImpact,undefined);
 g.player.id="dino";
 assert.equal(forwardCoopAbilityHit(g,coop,enemy,110,{stun:Infinity,kx:3,ky:-5}),true);
 assert.equal(events[2].payload.dinoImpact,undefined);
 assert.deepEqual(readDinoImpact({stun:900,kx:-55,ky:-100}),{stun:62,kx:-16,ky:-16});
 assert.equal(readDinoImpact({stun:"62",kx:3,ky:-3}),null);
 assert.equal(readDinoImpact({stun:62,kx:3,ky:NaN}),null);
});
test("V379: receiving guest Dino's Colossus restores actual stun and knockback",()=>{
 const slime={hp:100,boss:false,stun:0,vx:0,vy:0};
 assert.equal(applyDinoImpact(slime,{stun:62,kx:15,ky:-12}),true);
 assert.equal(slime.stun,62);
 assert.equal(slime.vx,15);
 assert.equal(slime.vy,-12);
 assert.equal(applyDinoImpact(slime,{stun:20,kx:-6,ky:-6}),true);
 assert.equal(slime.stun,62,"later small hits never erase longer control");
 const boss={hp:500,boss:true,stun:0,vx:0,vy:0};
 assert.equal(applyDinoImpact(boss,{stun:62,kx:15,ky:-12}),true);
 assert.equal(boss.stun,6);
 assert.ok(Math.abs(boss.vx-.64)<1e-9,"boss impulse clamps to 8 then attenuates");
 assert.equal(boss.vy,0,"boss is not launched vertically");
 assert.equal(applyDinoImpact(boss,{stun:Infinity,kx:3,ky:-1}),false);
 assert.equal(boss.stun,6);
});
test("V379: host only accepts real Dino peer and clamps values after enemy identity check",()=>{
 const game=fs.readFileSync("game.js","utf8");
 const abilities=fs.readFileSync("systems/abilities.js","utf8");
 const coop=fs.readFileSync("systems/online-coop.js","utf8");
 assert.match(game,/onAbilityHit=\(enemy,damage,options\)/);
 assert.match(abilities,/g\.onAbilityHit\?\.\(e,d,o\)/);
 assert.match(coop,/payload\.characterId==="dino"&&this\.remote\?\.characterId==="dino"/);
 assert.match(coop,/applyDinoImpact\(target,dinoImpact\)/);
 assert.match(coop,/enemy\._coopSyncId===payload\.targetSyncId/);
});

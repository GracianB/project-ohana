import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {DUO_ALTARS,DUO_HOLD_MS,duoPlateState,progressDuoRitual} from "../multiplayer/duo-altars.js";
import {drawDuoAltars} from "../systems/duo-altar-art.js";
const mk=(x,id,room="beach")=>({id,x,y:1070,health:80,maxHealth:100,connected:true,worldRoomId:room,lastSeenAt:1000});
test("Contest: all ten worlds have two distinct reachable floor plates",()=>{
 assert.equal(Object.keys(DUO_ALTARS).length,10);
 for(const [id,altar] of Object.entries(DUO_ALTARS)){
  assert.ok(altar.pads.length===2&&altar.pads[1]-altar.pads[0]>=250,id);
  assert.ok(altar.pads.every(x=>x>=250&&x<=900),id);
 }
});
test("Contest: proximity requires two separate healthy connected players in same biome",()=>{
 const a=mk(350,"a"),b=mk(700,"b");
 assert.equal(duoPlateState([a,b],"beach",1000).ready,true);
 assert.equal(duoPlateState([b,a],"beach",1000).ready,true);
 assert.equal(duoPlateState([a,{...b,x:350}],"beach",1000).ready,false);
 assert.equal(duoPlateState([a,{...b,worldRoomId:"jungle"}],"beach",1000).ready,false);
 assert.equal(duoPlateState([a,{...b,lastSeenAt:-2000}],"beach",1000).ready,false);
 assert.equal(duoPlateState([a,{...b,health:0}],"beach",1000).ready,false);
});
test("Contest: 1.2 s simultaneous hold, reset on leaving, one reward per room",()=>{
 const room={players:[mk(350,"a"),mk(700,"b")]};
 assert.equal(progressDuoRitual(room,"beach",1000).status,"charging");
 assert.equal(progressDuoRitual(room,"beach",1000+DUO_HOLD_MS-1).status,"charging");
 room.players[1].x=900;
 assert.equal(progressDuoRitual(room,"beach",1000+DUO_HOLD_MS).status,"waiting");
 room.players[1].x=700;
 room.players[0].lastSeenAt=3000;room.players[1].lastSeenAt=3000;
 assert.equal(progressDuoRitual(room,"beach",3000).status,"charging");
 assert.equal(progressDuoRitual(room,"beach",3000+DUO_HOLD_MS).status,"lit");
 assert.equal(progressDuoRitual(room,"beach",4000).status,"already");
 assert.ok(room.duoAltars.beach);
});
test("Contest: deterministic canvas and reduced motion draw both plates",()=>{
 const ops=[];const ctx=new Proxy({},{
  get(o,k){if(k in o)return o[k];return(...args)=>ops.push([k,...args]);},
  set(o,k,v){o[k]=v;return true;}
 });
 drawDuoAltars(ctx,{roomId:"beach",player:{x:350,y:1070,health:80},cam:{x:0,y:0}},{
  playerId:"remote",x:700,y:1070,health:80,worldRoomId:"beach",
 },{duoAltars:{}},0,true);
 assert.equal(ops.filter(x=>x[0]==="ellipse").length,2);
 assert.equal(ops.filter(x=>x[0]==="save").length,3);
 assert.equal(ops.filter(x=>x[0]==="restore").length,3);
});
test("Contest: server and original engine use the same verified ritual contract",()=>{
 const server=fs.readFileSync("netlify/lib/room-service.mjs","utf8");
 const client=fs.readFileSync("systems/online-coop.js","utf8");
 const sw=fs.readFileSync("sw.js","utf8");
 assert.match(server,/progressDuoRitual\(state, requestedRoom, now\(\)\)/);
 assert.match(server,/signalKind === "duo" \? null : player.id/);
 assert.match(client,/duoPlateState\(\[local,peer\]/);
 assert.match(client,/signal\(game,"duo"/);
 assert.ok(sw.includes('"./multiplayer/duo-altars.js"'));
 assert.match(sw,/systems\/duo-altar-art\.js\?v=/);
});

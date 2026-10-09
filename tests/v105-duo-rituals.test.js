import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { DUO_ALTARS, DUO_CUES, DUO_HOLD_MS, duoPlateState, duoRitualProgress } from "../multiplayer/duo-altars.js";
import { createRoomService } from "../netlify/lib/room-service.mjs";
import { drawDuoAltars } from "../systems/duo-altar-art.js";

class MemoryStore {
  entries=new Map();counter=0;
  async getWithMetadata(key){const entry=this.entries.get(key);return entry?{data:structuredClone(entry.data),etag:entry.etag}:null;}
  async setJSON(key,value,options={}){
    const old=this.entries.get(key);
    if(options.onlyIfNew&&old||options.onlyIfMatch&&(!old||old.etag!==options.onlyIfMatch))return {modified:false};
    const etag='"'+(++this.counter)+'"';
    this.entries.set(key,{data:structuredClone(value),etag});
    return {modified:true,etag};
  }
}
function setup(){
 let time=1_800_000_000_000,cred=0;
 const svc=createRoomService(new MemoryStore(),{
  now:()=>time,makeCode:()=>"HKU225",makeCredential:()=>"token-"+(++cred)
 });
 return {svc,now:()=>time,advance:(ms)=>{time+=ms;}};
}
async function makePlayers(svc){
 const h=await svc.create(),g=await svc.join(h.roomId);
 await svc.choose(h.roomId,h.identity,"kilo");
 await svc.choose(h.roomId,g.identity,"cat");
 await svc.ready(h.roomId,h.identity);
 await svc.ready(h.roomId,g.identity);
 return {host:h,guest:g,roomId:h.roomId,sequence:new Map([[h.identity.playerId,0],[g.identity.playerId,0]])};
}
function actionID(room,identity,kind){
 const next=(room.sequence.get(identity.playerId)||0)+1;
 room.sequence.set(identity.playerId,next);
 return {sequence:next,actionId:"v105:"+identity.playerId+":"+kind+":"+next};
}
async function move(svc,room,identity,roomId,x){
 return svc.move(room.roomId,identity,{mode:"engine",positionX:x,positionY:1070,
 worldRoomId:roomId,health:80,maxHealth:100,...actionID(room,identity,"move")});
}
async function signal(svc,room,identity,roomId){
 return svc.signal(room.roomId,identity,{signalKind:"duo",payload:{roomId},...actionID(room,identity,"duo")});
}
test("V105 · 10 independent sanctuary identities, both plates and fresh humans required",()=>{
 const rooms=Object.keys(DUO_ALTARS);
 assert.equal(rooms.length,10);
 assert.deepEqual(Object.keys(DUO_CUES),rooms);
 assert.equal(new Set(Object.values(DUO_CUES)).size,10);
 for(const roomId of rooms){
   const [a,b]=DUO_ALTARS[roomId].pads,t=123450;
   const player=(id,x)=>({id,x,y:1070,health:90,connected:true,worldRoomId:roomId,lastSeenAt:t});
   assert.equal(duoPlateState([player("1",a)],roomId,t)?.ready,false,roomId+" alone");
   assert.equal(duoPlateState([player("1",a),player("2",b)],roomId,t)?.ready,true,roomId+" duo");
   assert.equal(duoPlateState([player("1",b),player("2",a)],roomId,t)?.ready,true,roomId+" reversed");
   assert.equal(duoPlateState([player("1",a),player("2",b)],roomId,t+3000)?.ready,false,roomId+" stale");
   assert.equal(duoPlateState([player("1",a),{...player("2",b),lastSeenAt:t+3000}],roomId,t)?.ready,false,"future timestamps do not count");
   assert.equal(duoPlateState([player("1",a),{...player("2",b),health:0}],roomId,t)?.ready,false,"no dead player");
 }
});

test("V105 · all ten sanctuary charges persist, reward once and never accept a lone player",async()=>{
 const {svc,advance}=setup(),party=await makePlayers(svc);
 let completed=0;
 for(const [roomId,altar] of Object.entries(DUO_ALTARS)){
  const [a,b]=altar.pads;
  await move(svc,party,party.host.identity,roomId,a);
  const one=await signal(svc,party,party.host.identity,roomId);
  assert.equal(!!one.duoAltars?.[roomId],false,roomId+" cannot solo");
  await move(svc,party,party.guest.identity,roomId,b);
  const charging=await signal(svc,party,party.host.identity,roomId);
  assert.equal(charging.duoCharge?.roomId,roomId,"charge is visible to both clients");
  assert.equal(charging.duoCharge.durationMs,DUO_HOLD_MS);
  advance(DUO_HOLD_MS+80);
  const lit=await signal(svc,party,party.guest.identity,roomId);
  assert.ok(lit.duoAltars?.[roomId],roomId+" should light after continuous hold");
  assert.equal(lit.duoCharge,null,"no stale progress bar after completion");
  assert.equal(lit.combat.events.filter(e=>e.signalKind==="duo-lit"&&e.payload.roomId===roomId).length,1);
  const replay=await signal(svc,party,party.host.identity,roomId);
  assert.equal(replay.combat.events.filter(e=>e.signalKind==="duo-lit"&&e.payload.roomId===roomId).length,1,"reward not farmable");
  completed++;
 }
 const end=await svc.poll(party.roomId,party.host.identity);
 assert.equal(Object.keys(end.duoAltars).length,completed);
 assert.equal(completed,10);
});
test("V105 · interrupted charges reset on movement or disconnect, never resume for free",async()=>{
 const {svc,advance}=setup(),party=await makePlayers(svc);
 const roomId="beach",pads=DUO_ALTARS[roomId].pads;
 await move(svc,party,party.host.identity,roomId,pads[0]);
 await move(svc,party,party.guest.identity,roomId,pads[1]);
 const charge=await signal(svc,party,party.host.identity,roomId);
 assert.ok(charge.duoCharge?.startedAt);
 advance(600);
 const steppedOff=await move(svc,party,party.guest.identity,roomId,pads[1]+200);
 assert.equal(steppedOff.duoCharge,null);
 advance(800);
 await move(svc,party,party.guest.identity,roomId,pads[1]);
 const restarted=await signal(svc,party,party.host.identity,roomId);
 assert.equal(restarted.duoAltars.beach,undefined);
 assert.ok(restarted.duoCharge.startedAt>charge.duoCharge.startedAt);
 advance(350);
 const early=await signal(svc,party,party.guest.identity,roomId);
 assert.equal(early.duoAltars.beach,undefined);
 await svc.disconnect(party.roomId,party.guest.identity);
 const view=await svc.poll(party.roomId,party.host.identity);
 assert.equal(view.duoCharge,null,"disconnect must interrupt both-plate ritual");
 const resumed=await svc.join(party.roomId,party.guest.identity);
 assert.equal(resumed.phase,"playing");
 const again=await signal(svc,party,party.host.identity,roomId);
 assert.equal(again.duoAltars.beach,undefined);
 assert.ok(again.duoCharge);
});
test("V105 · sanctuary progress is computed only when both real players remain fresh",()=>{
 const t=3000, roomId="jungle",[a,b]=DUO_ALTARS[roomId].pads;
 const pair=[{x:a,y:1070,health:100,connected:true,worldRoomId:roomId,lastSeenAt:t},
             {x:b,y:1070,health:80,connected:true,worldRoomId:roomId,lastSeenAt:t}];
 const room={players:pair,duoAltars:{},duoChannel:{roomId,startedAt:t-400}};
 const v=duoRitualProgress(room,t);
 assert.equal(v.roomId,roomId);
 assert.equal(v.elapsedMs,400);
 assert.equal(v.durationMs,DUO_HOLD_MS);
 assert.ok(v.ratio>0&&v.ratio<1);
 assert.equal(duoRitualProgress({...room,duoAltars:{jungle:t}},t),null);
 assert.equal(duoRitualProgress({...room,players:[pair[0]]},t),null);
});
test("V105 · visual ceremony renders without gameplay side effects",()=>{
 const calls=[];
 const ctx=new Proxy({save(){},restore(){}},{get:(obj,key)=>obj[key]||((...args)=>calls.push(String(key))),set:(obj,key,value)=>{obj[key]=value;return true;}});
 const room="hub",[a,b]=DUO_ALTARS[room].pads;
 const game={roomId:room,player:{x:a,y:1070,health:100},cam:{x:0,y:0},viewW:1000};
 const remote={playerId:"p2",x:b,y:1070,health:100,worldRoomId:room};
 drawDuoAltars(ctx,game,remote,{duoAltars:{},duoCharge:{roomId:room,startedAt:Date.now()-320,durationMs:DUO_HOLD_MS}},15,false);
 assert.ok(calls.includes("fillRect"),"charge must be visible");
 assert.ok(calls.includes("fillText"),"clues must be legible");
 drawDuoAltars(ctx,game,remote,{duoAltars:{hub:Date.now()},duoCharge:null},15,true);
});
test("V105 · release preserves existing album and online protocol, not another multiplayer campaign",()=>{
 const server=fs.readFileSync("netlify/lib/room-service.mjs","utf8");
 const client=fs.readFileSync("systems/online-coop.js","utf8");
 const art=fs.readFileSync("systems/duo-altar-art.js","utf8");
 assert.match(server,/duoCharge: room.duoChannel/);
 assert.match(server,/state.duoChannel = null/);
 assert.match(client,/drawDuoAltars\(ctx,game/);
 assert.match(art,/DUO_CUES/);
 assert.match(art,/MANTENED AMBAS PLACAS/);
 assert.match(fs.readFileSync("systems/v1002-festival.js","utf8"),/ohana-festival-v1002/);
});

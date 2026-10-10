import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { menuPaintAllowed,menuPaintAllowedInDocument } from "../systems/menu-visibility.js";
import { shouldFollowPeerRoom } from "../systems/coop-v107-room-follow.js";
import { createRoomService } from "../netlify/lib/room-service.mjs";

class Store {
 entries=new Map(); i=0;
 async getWithMetadata(key){const e=this.entries.get(key);return e?{data:structuredClone(e.data),etag:e.etag}:null;}
 async setJSON(key,data,opts={}) {
  const old=this.entries.get(key);
  if(opts.onlyIfNew&&old||opts.onlyIfMatch&&(!old||old.etag!==opts.onlyIfMatch))return {modified:false};
  const etag=String(++this.i);
  this.entries.set(key,{data:structuredClone(data),etag});
  return {modified:true,etag};
 }
}
test("V107: menu never burns GPU beneath opening, start cinematic or background tabs",()=>{
 assert.equal(menuPaintAllowed(),true);
 for(const key of ["playing","introPending","introPlaying","startIntro","hidden"])
  assert.equal(menuPaintAllowed({[key]:true}),false,key);
 const doc=(names=[],startIntro=false)=>({body:{classList:{contains:s=>names.includes(s)}},visibilityState:"visible",querySelector:s=>s==="#start-intro.show"&&startIntro?{}:null});
 assert.equal(menuPaintAllowedInDocument(doc(["intro-pending"])),false);
 assert.equal(menuPaintAllowedInDocument(doc(["intro-playing"])),false);
 assert.equal(menuPaintAllowedInDocument(doc([],true)),false);
 assert.equal(menuPaintAllowedInDocument(doc()),true);
 const title=fs.readFileSync("systems/title.js","utf8");
 const background=fs.readFileSync("systems/title-fx.js","utf8");
 assert.match(title,/if \(!menuPaintAllowedInDocument\(document\)\)/);
 assert.match(background,/if\(!menuPaintAllowedInDocument\(document\)\)/);
 assert.match(title,/MutationObserver/);
 assert.match(background,/MutationObserver/);
});
test("V107: a stale partner room never teleports us backward",()=>{
 assert.equal(shouldFollowPeerRoom("hub","hub","beach",2000,1000),false,"peer was already in hub");
 assert.equal(shouldFollowPeerRoom("hub","beach","hub",2000,1000),true,"new peer travel is valid");
 assert.equal(shouldFollowPeerRoom("hub","beach","hub",1100,2000),false,"local transition grace prevents boomerang");
 assert.equal(shouldFollowPeerRoom("","beach","hub",2000,1000),false,"no startup forced travel");
 assert.equal(shouldFollowPeerRoom("hub","beach","beach",2000,1000),false);
 const code=fs.readFileSync("systems/online-coop.js","utf8");
 assert.match(code,/event\.signalKind !== "room" && event\.payload\?\.roomId !== game\.roomId/);
 assert.match(code,/shouldFollowPeerRoom\(previousPeerRoom,remoteWorld,game\.roomId/);
 assert.match(code,/localRoomGraceUntil=performance\.now\(\)\+1200/);
});
test("V107: Netlify stores zero HP and x=0 without resurrecting or misplacing peers",async()=>{
 let t=1_800_000_000_000,credentials=0;
 const service=createRoomService(new Store(),{now:()=>t,makeCode:()=>"HKU234",makeCredential:()=>"secret-"+(++credentials)});
 const host=await service.create(),guest=await service.join(host.roomId);
 await service.choose(host.roomId,host.identity,"kilo");
 await service.choose(host.roomId,guest.identity,"cat");
 await service.ready(host.roomId,host.identity);
 await service.ready(host.roomId,guest.identity);
 const move=(identity,seq,p)=>service.move(host.roomId,identity,{mode:"engine",actionId:"v107:"+identity.playerId+":"+seq,sequence:seq,worldRoomId:"hub",...p});
 let first=await move(host.identity,1,{positionX:410,positionY:980,health:30,maxHealth:100});
 let second=await move(host.identity,2,{positionX:0,positionY:0,health:0,maxHealth:100});
 let you=second.players.find(p=>p.isYou);
 assert.equal(you.x,0);assert.equal(you.y,0);assert.equal(you.health,0);
 assert.equal(you.maxHealth,100);
 let other=await service.poll(host.roomId,guest.identity);
 let peer=other.players.find(p=>!p.isYou);
 assert.deepEqual([peer.x,peer.y,peer.health],[0,0,0],"the other player sees the authoritative death");
 const invalid=await move(host.identity,3,{positionX:"not-a-number",positionY:Infinity,health:NaN});
 you=invalid.players.find(p=>p.isYou);
 assert.deepEqual([you.x,you.y,you.health],[0,0,0],"invalid values cannot reset position or resurrect a dead hero");
});
test("V107: offline graph and original save/protocol remain intact",()=>{
 const sw=fs.readFileSync("sw.js","utf8"),page=fs.readFileSync("index.html","utf8");
 const coop=fs.readFileSync("systems/online-coop.js","utf8");
 assert.match(sw,/const VERSION = "ohana-314"/);
 assert.match(page,/ohana-314/);
 assert.match(sw,/systems\/menu-visibility\.js\?v=/);
 assert.match(sw,/systems\/coop-v107-room-follow\.js\?v=/);
 assert.match(coop,/showNetworkHealth\(\)/);
 assert.match(coop,/ONLINE · RECONECTANDO/);
 assert.match(fs.readFileSync("systems/v1002-festival.js","utf8"),/ohana-festival-v1002/);
});

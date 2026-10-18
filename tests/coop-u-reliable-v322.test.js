import test from "node:test";
import assert from "node:assert/strict";
import {capturePeerEffects,applyPeerEffects,sendPeerEffectsWithReliableDuet,captureFamilyDuetRelay}
 from "../systems/coop-peer-effects.js";

const heroes=["dragon","dino","frita","pizza","yomi","cuerno"];
const capture=(hero,frameNo=1)=>capturePeerEffects({
 roomId:"hub",_familyDuet:{hero,age:0,evo:2,x:240,y:350,facing:1},
 projectiles:[],slashes:[],bolts:[]},frameNo,"scene-v322");
function transport(quick=true,durable=true){
 const sent=[];
 return {active:true,sent,
  sendLatest(kind,payload){sent.push({mode:"fast",kind,payload});return quick;},
  sendEvent(kind,payload){sent.push({mode:"reliable",kind,payload});return durable;}
 };
}
test("V322 · six real U beginnings use both WebRTC paths only when forced",()=>{
 for(const hero of heroes){
  const f=capture(hero),wire=transport();
  assert.ok(f.familyDuet&&f.familyDuet.hero===hero);
  assert.equal(sendPeerEffectsWithReliableDuet(wire,f,true),true);
  assert.deepEqual(wire.sent.map(x=>x.mode),["fast","reliable"]);
  assert.ok(wire.sent.every(x=>x.kind==="effects"&&x.payload===f));
  assert.ok(JSON.stringify(f).length<=8500);
 }
});
test("V322 · loss of unreliable poses cannot erase a reliable U handshake",()=>{
 const f=capture("dragon");
 const wire=transport(false,true);
 assert.equal(sendPeerEffectsWithReliableDuet(wire,f,true),true);
 const packet=wire.sent.find(x=>x.mode==="reliable").payload;
 const receiver={roomId:"hub",coopPeerEffects:null,enemies:[{hp:150}]};
 assert.equal(applyPeerEffects(receiver,packet),true);
 assert.equal(receiver.coopPeerEffects.familyDuet.hero,"dragon");
 assert.equal(receiver.enemies[0].hp,150,"peer visual snapshots never cause damage");
 assert.equal(applyPeerEffects(receiver,f),false,"same scope/frameNo must not replay");
 assert.equal(receiver.enemies[0].hp,150);
});
test("V322 · normal snapshots remain lightweight; no new reliable traffic",()=>{
 const normal=capturePeerEffects({roomId:"hub",projectiles:[],slashes:[],bolts:[]},1,"scope-v322");
 const alt=transport();
 assert.equal(sendPeerEffectsWithReliableDuet(alt,normal,true),true);
 assert.equal(alt.sent.length,1,"no U = no reliable backup");
 const frame=capture("dino");
 const wire=transport();
 assert.equal(sendPeerEffectsWithReliableDuet(wire,frame,false),true);
 assert.equal(wire.sent.length,1,"periodic U frames stay disposable");
});
test("V322 · failed RTC routes are handled without fake delivery",()=>{
 const f=capture("pizza");
 assert.equal(sendPeerEffectsWithReliableDuet(null,f,true),false);
 assert.equal(sendPeerEffectsWithReliableDuet({active:false},f,true),false);
 assert.equal(sendPeerEffectsWithReliableDuet(transport(false,false),f,true),false);
 assert.equal(sendPeerEffectsWithReliableDuet(transport(true,false),f,true),true);
 assert.equal(sendPeerEffectsWithReliableDuet(transport(false,true),f,true),true);
 assert.equal(sendPeerEffectsWithReliableDuet(transport(true,true),{protocol:1},true),false);
});


test("V322 · only successful durable sends acknowledge the U; quick successes still require retry",()=>{
 const f=capture("dino");
 let acknowledged=0;
 const quickOnly=transport(true,false);
 assert.equal(sendPeerEffectsWithReliableDuet(quickOnly,f,true,()=>acknowledged++),true);
 assert.equal(acknowledged,0,"the unreliable lane must not mark U delivered");
 assert.deepEqual(quickOnly.sent.map(x=>x.mode),["fast","reliable"]);
 const retry=transport(false,true);
 assert.equal(sendPeerEffectsWithReliableDuet(retry,f,true,()=>acknowledged++),true);
 assert.equal(acknowledged,1,"first ordered acknowledgment occurs once");
 const noExtra=transport();
 assert.equal(sendPeerEffectsWithReliableDuet(noExtra,f,false,()=>acknowledged++),true);
 assert.equal(acknowledged,1,"periodic fast snapshots never generate another ordered event");
 assert.deepEqual(noExtra.sent.map(x=>x.mode),["fast"]);
});


test("V322 · six authenticated U relays are compact, validated and deal zero damage",()=>{
 for(const hero of heroes){
  const game={roomId:"hub",_familyDuet:{hero,age:2,evo:4,x:240,y:350,facing:1}};
  const frame=captureFamilyDuetRelay(game,5,"valid-v322");
  assert.ok(frame?.familyDuet,hero);
  assert.equal(frame.familyDuet.hero,hero);
  assert.ok(JSON.stringify({action:"ability",slot:3,characterId:hero,duetStart:frame}).length<=1800);
  const receiver={roomId:"hub",coopPeerEffects:null,enemies:[{hp:222}]};
  assert.equal(applyPeerEffects(receiver,frame),true);
  assert.equal(receiver.enemies[0].hp,222);
  assert.equal(applyPeerEffects(receiver,frame),false,"server and direct cannot play twice");
 }
 assert.equal(captureFamilyDuetRelay({roomId:"hub"},1,"valid"),null);
 assert.equal(captureFamilyDuetRelay({roomId:"hub",_familyDuet:{hero:"dino",age:0,evo:1,x:1,y:1,facing:1}},0,"valid"),null);
});
test("V322 · family U fallback from authenticated action checks exact peer identity",async()=>{
 const {onlineCoop}=await import("../systems/online-coop.js");
 const peer=onlineCoop,old={remote:peer.remote,seenActionEvents:peer.seenActionEvents,
  lastPeerEffectsAt:peer.lastPeerEffectsAt,_relayDuetHoldUntil:peer._relayDuetHoldUntil};
 const host={roomId:"hub",coopPeerEffects:null,enemies:[{hp:315}]};
 const frame=captureFamilyDuetRelay({roomId:"hub",_familyDuet:{
   hero:"dragon",age:4,evo:2,x:240,y:350,facing:1}},20,"u-relay-v322");
 try{
  peer.remote={characterId:"dragon",playerId:"guest"};
  peer.seenActionEvents=new Set();
  assert.equal(peer.applyPeerAction(host,{action:"ability",slot:3,
   characterId:"dragon",syncId:"v322-hit",duetStart:frame}),true);
  assert.equal(host.coopPeerEffects.familyDuet.hero,"dragon");
  assert.equal(host.enemies[0].hp,315,"relayed U never deals damage");
  assert.ok(peer._relayDuetHoldUntil>peer.lastPeerEffectsAt);
  assert.equal(peer.applyPeerAction(host,{action:"ability",slot:3,
   characterId:"dragon",syncId:"v322-hit",duetStart:frame}),false,"dedupe");
  host.coopPeerEffects=null;
  assert.equal(peer.applyPeerAction(host,{action:"ability",slot:3,
   characterId:"dino",syncId:"v322-forged",duetStart:frame}),false);
  assert.equal(host.coopPeerEffects,null,"wrong actor cannot inject U");
  assert.equal(peer.applyPeerAction(host,{action:"ability",slot:3,
   characterId:"dragon",syncId:"v322-wrong-slot",duetStart:frame}),true);
  assert.equal(host.coopPeerEffects,null,"no U echo without matching slot");
 }finally{Object.assign(peer,old);}
});

test("V448 · native Chispin J/K/L visual trio survives loss of latest WebRTC frame",()=>{
 const g={roomId:"hub",chispinAbilityFx:[
  {kind:"chain",life:28,pts:[{x:4,y:5},{x:7,y:8}],dmg:999},
  {kind:"trail",life:40,x1:10,y1:11,x2:20,y2:21,hit:{target:"untrusted"}},
  {kind:"storm",life:210,x:30,y:40,next:12,bolts:[],dmg:999}],
  projectiles:[],slashes:[],bolts:[]};
 const frame=capturePeerEffects(g,1,"combo-v448");
 assert.deepEqual(frame.chispinFx.map(e=>e.kind),["chain","trail","storm"]);
 const link=transport(false,true);
 assert.equal(sendPeerEffectsWithReliableDuet(link,frame,true),true);
 assert.deepEqual(link.sent.map(x=>x.mode),["fast","reliable"]);
 const client={roomId:"hub",coopPeerEffects:null,enemies:[{hp:180}]};
 assert.equal(applyPeerEffects(client,link.sent[1].payload),true);
 assert.deepEqual(client.coopPeerEffects.chispinFx.map(e=>e.kind),["chain","trail","storm"]);
 assert.equal(client.enemies[0].hp,180);
 assert.ok(client.coopPeerEffects.chispinFx.every(e=>e.dmg===undefined&&e.hit===undefined));
 const periodic=transport();
 assert.equal(sendPeerEffectsWithReliableDuet(periodic,frame,false),true);
 assert.deepEqual(periodic.sent.map(x=>x.mode),["fast"],"5 Hz frames remain cheap");
 const partial=transport();
 assert.equal(sendPeerEffectsWithReliableDuet(partial,{...frame,chispinFx:frame.chispinFx.slice(0,2)},true),true);
 assert.deepEqual(partial.sent.map(x=>x.mode),["fast"],"ordinary casts do not spam reliable channel");
});

test("V449 · real Michi J/K/L FX survive a dropped quick WebRTC frame without transferring damage",()=>{
 const g={roomId:"hub",michiAbilityFx:[
  {kind:"yarn",life:60,x:100,y:110,vx:12,vy:0,dmg:75},
  {kind:"purr",life:45,R:112,dmg:250},
  {kind:"wisp",life:80,x:155,y:160,vx:-1,vy:2,target:{hp:25}}],
  projectiles:[],slashes:[],bolts:[]};
 const frame=capturePeerEffects(g,11,"cat-v449");
 assert.deepEqual(frame.michiFx.map(f=>f.kind),["yarn","purr","wisp"]);
 const wire=transport(false,true);
 assert.equal(sendPeerEffectsWithReliableDuet(wire,frame,true),true);
 assert.deepEqual(wire.sent.map(e=>e.mode),["fast","reliable"]);
 const client={roomId:"hub",coopPeerEffects:null,enemies:[{hp:220}]};
 assert.equal(applyPeerEffects(client,wire.sent[1].payload),true);
 assert.deepEqual(client.coopPeerEffects.michiFx.map(f=>f.kind),["yarn","purr","wisp"]);
 assert.equal(client.enemies[0].hp,220);
 assert.ok(client.coopPeerEffects.michiFx.every(f=>f.dmg===undefined&&f.target===undefined));
 const ordinary=transport();
 sendPeerEffectsWithReliableDuet(ordinary,frame,false);
 assert.deepEqual(ordinary.sent.map(e=>e.mode),["fast"]);
 const partial=transport();
 sendPeerEffectsWithReliableDuet(partial,{...frame,michiFx:frame.michiFx.slice(0,2)},true);
 assert.deepEqual(partial.sent.map(e=>e.mode),["fast"]);
});

test("V450 · later fast snapshots never erase a still-live real cosmetic trio",()=>{
 for(const variant of ["michi","chispin"]){
  const initial={
   roomId:"hub",projectiles:[],slashes:[],bolts:[],
   ...(variant==="michi"?{michiAbilityFx:[
    {kind:"yarn",life:30,x:10,y:20,vx:0,vy:0},
    {kind:"purr",life:30,R:80},
    {kind:"wisp",life:30,x:20,y:30,vx:1,vy:-1}]}:{
    chispinAbilityFx:[
      {kind:"chain",life:30,pts:[{x:1,y:2},{x:3,y:4}]},
      {kind:"trail",life:30,x1:1,y1:2,x2:3,y2:4},
      {kind:"storm",life:30,x:20,y:30,bolts:[]}]
   })
  };
  const rx={roomId:"hub",enemies:[{hp:500}],coopPeerEffects:null};
  assert.equal(applyPeerEffects(rx,capturePeerEffects(initial,1,"valid-v450")),true);
  const field=variant==="michi"?"michiFx":"chispinFx";
  assert.equal(rx.coopPeerEffects[field].length,3);
  const later=capturePeerEffects({roomId:"hub",projectiles:[],slashes:[],bolts:[]},2,"valid-v450");
  assert.equal(applyPeerEffects(rx,later),true);
  assert.equal(rx.coopPeerEffects[field].length,3,"reliable burst survives one quick empty snapshot");
  for(let i=0;i<30;i++)advancePeerEffects(rx);
  assert.equal(rx.coopPeerEffects[field].length,0,"FX expire instead of becoming permanent");
  assert.equal(applyPeerEffects(rx,{...later,frameNo:3}),true);
  assert.equal(rx.coopPeerEffects[field].length,0,"expired FX never resurrect");
  assert.equal(rx.enemies[0].hp,500,"cosmetics never damage the peer");
  assert.equal(applyPeerEffects(rx,{...later,scope:"new-room-epoch",frameNo:1}),true);
  assert.equal(rx.coopPeerEffects[field].length,0,"new session cannot inherit old FX");
 }
});

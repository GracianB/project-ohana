import test from "node:test";
import assert from "node:assert/strict";
import {capturePeerEffects,applyPeerEffects,sendPeerEffectsWithReliableDuet}
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

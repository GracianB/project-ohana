import test from 'node:test';
import assert from 'node:assert/strict';
import {sendPeerEffectsWithReliableDuet} from '../systems/coop-peer-effects.js';

const scope='v452-epoch';
function packet(n,kind='combo'){
 return {protocol:2,scope,roomId:'hub',frameNo:n,
  chispinFx:kind==='combo'?
   [{kind:'chain',life:28},{kind:'trail',life:42},{kind:'storm',life:200}]:[],
  michiFx:[],familyDuet:null};
}
function wire(){
 const packets=[],client={active:true,blocked:1,packets,
  sendLatest(_kind,frame){packets.push({type:'fast',number:frame.frameNo});return true},
  sendEvent(_kind,frame){packets.push({type:'durable',number:frame.frameNo});
   if(client.blocked-- >0)return false;return true}};
 return client;
}
test('V452: retry the precise complete J/K/L burst after a transient event buffer refusal',()=>{
 const c=wire();
 assert.equal(sendPeerEffectsWithReliableDuet(c,packet(10),true),true,'fast channel still accepts');
 assert.deepEqual(c.packets.map(p=>p.type),['fast','durable']);
 assert.equal(sendPeerEffectsWithReliableDuet(c,packet(11,'empty'),false),true);
 assert.deepEqual(c.packets.map(p=>p.type),['fast','durable','fast','durable']);
 assert.equal(c.packets.at(-1).number,10,'retries original complete snapshot, not empty newest');
 assert.equal(sendPeerEffectsWithReliableDuet(c,packet(12,'empty'),false),true);
 assert.equal(c.packets.filter(p=>p.type==='durable').length,2,'successful retry never repeats');
});
test('V452: no retries across rooms, sessions, or more than eight newer frames',()=>{
 for(const subsequent of [{...packet(11,'empty'),scope:'new-session'},
  {...packet(11,'empty'),roomId:'jungle'},packet(25,'empty')]){
  const c=wire();sendPeerEffectsWithReliableDuet(c,packet(10),true);
  sendPeerEffectsWithReliableDuet(c,subsequent,false);
  assert.equal(c.packets.filter(p=>p.type==='durable').length,1);
 }
});
test('V452: periodic and partial cosmetic packets stay on low-cost latest channel',()=>{
 const c=wire();sendPeerEffectsWithReliableDuet(c,packet(20),false);
 sendPeerEffectsWithReliableDuet(c,{...packet(21),chispinFx:packet(21).chispinFx.slice(0,2)},true);
 assert.deepEqual(c.packets.map(p=>p.type),['fast','fast']);
});

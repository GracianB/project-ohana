import test from 'node:test';
import assert from 'node:assert/strict';
import {onlineCoop} from '../systems/online-coop.js';
import {capturePeerEffects} from '../systems/coop-peer-effects.js';

const fx={
 chispinAbilityFx:[
  {kind:'chain',life:30,pts:[{x:110,y:110},{x:140,y:140}]},
  {kind:'trail',life:30,x1:110,y1:110,x2:140,y2:140},
  {kind:'storm',life:45,x:140,y:140,bolts:[]}
 ],projectiles:[],slashes:[],bolts:[],roomId:'hub'
};
function receiver(){
 const acks=[];
 const peer={enabled:true,remote:{playerId:'host'},direct:{
  sendEvent(kind,payload){acks.push({kind,payload});return true;}
 },visualReceipts:[],lastPeerEffectsAt:0};
 return {peer,acks,game:{roomId:'hub',coopPeerEffects:null}};
}
test('verified remote Chispin trio creates short-lived delivery receipt and acks exactly once',()=>{
 const {peer,acks,game}=receiver(),packet=capturePeerEffects(fx,17,'epoch-x');
 assert.equal(packet.chispinFx.length,3);
 onlineCoop.receiveDirectEvent.call(peer,game,{kind:'effects',payload:packet});
 assert.deepEqual(peer.visualReceipts[0].effects.map(f=>f.kind),['chain','trail','storm']);
 assert.equal(peer.visualReceipts[0].hero,'chispin');
 assert.equal(acks.length,1);
 assert.deepEqual(acks[0],{kind:'state',payload:{state:'fx-ack',scope:'epoch-x',frameNo:17}});
 onlineCoop.receiveDirectEvent.call(peer,game,{kind:'effects',payload:packet});
 assert.equal(peer.visualReceipts.length,1,'retransmit must not duplicate a visual');
 assert.equal(acks.length,2,'duplicate can still be re-acknowledged after lost ACK');
});
test('invalid, wrong-room or incomplete peer FX must not create receipts or acknowledgments',()=>{
 const invalid=[{...capturePeerEffects(fx,18,'epoch-y'),roomId:'beach'},
  {...capturePeerEffects(fx,19,'epoch-y'),chispinFx:[fx.chispinAbilityFx[0]]},
  {...capturePeerEffects(fx,0,'epoch-y')}];
 const {peer,acks,game}=receiver();
 for(const packet of invalid)onlineCoop.receiveDirectEvent.call(peer,game,{kind:'effects',payload:packet});
 assert.equal(peer.visualReceipts.length,0);
 assert.equal(acks.length,0);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {onlineCoop} from '../systems/online-coop.js';

function fixture(){
 const calls=[],wire={
  active:true,allowReliable:false,sendEvent(kind,frame){
   calls.push({lane:'reliable',kind,frame});return this.allowReliable;
  },
  sendLatest(kind,frame){calls.push({lane:'quick',kind,frame});return true;}
 };
 const peer={direct:wire,remoteWorld:'hub',combatEpoch:'session-restore',
  effectSequence:0,lastEffectsSentAt:0,pendingVisualCombo:null,enabled:true,remote:{playerId:'guest'}};
 const game={roomId:'hub',michiAbilityFx:[
  {kind:'yarn',life:60,x:100,y:110,vx:2,vy:0},
  {kind:'purr',life:50,R:110},
  {kind:'wisp',life:55,x:115,y:120,vx:1,vy:0}],
  projectiles:[],slashes:[],bolts:[]};
 return {peer,wire,game,calls,send(force=false){
  return onlineCoop.sendPeerEffects.call(peer,game,force);
 }};
}
test('Michi reliable three-key combo retries after SCTP congestion with the same undamaged snapshot',()=>{
 const f=fixture();
 assert.equal(f.send(true),false,'a fast packet alone does not acknowledge a trio');
 assert.ok(f.peer.pendingVisualCombo,'pending reliable combo retained');
 const saved=f.peer.pendingVisualCombo.frame;
 f.peer.lastEffectsSentAt=-Infinity; // advance past the five-hertz retry budget
 assert.equal(f.send(false),false,'a failed ordered channel must not pretend success');
 f.wire.allowReliable=true;
 f.peer.lastEffectsSentAt=-Infinity;
 assert.equal(f.send(false),true,'normal next frame retries an authentic ordered event');
 assert.equal(f.peer.pendingVisualCombo?.frame,saved,'send success needs remote acknowledgment');
 const delivered=f.calls.findLast(x=>x.lane==='reliable').frame;
 assert.equal(delivered,saved,'the same full combo is retried, never reconstructed after expiry');
 assert.deepEqual(delivered.michiFx.map(f=>f.kind),['yarn','purr','wisp']);
 assert.ok(delivered.michiFx.every(f=>f.dmg===undefined&&f.target===undefined));
 const acks=[];
 const receiver={enabled:true,remote:{playerId:'host'},direct:{
   sendEvent(kind,payload){acks.push({kind,payload});return true;}
 }};
 const remoteGame={roomId:'hub',coopPeerEffects:null};
 onlineCoop.receiveDirectEvent.call(receiver,remoteGame,{kind:'effects',payload:delivered});
 assert.deepEqual(remoteGame.coopPeerEffects?.michiFx.map(x=>x.kind),['yarn','purr','wisp']);
 assert.deepEqual(acks.map(a=>a.kind),['state']);
 assert.equal(acks[0].payload.state,'fx-ack');
 onlineCoop.receiveDirectEvent.call(f.peer,f.game,{kind:'state',payload:acks[0].payload});
 assert.equal(f.peer.pendingVisualCombo,null,'peer visual acknowledgment, not send return, clears queue');
});
test('queued combo cannot cross room, combat epoch or peer link',()=>{
 for(const changed of ['room','epoch','link']){
  const f=fixture();f.send(true);f.wire.allowReliable=true;
  if(changed==='room')f.game.roomId='beach';
  if(changed==='epoch')f.peer.combatEpoch='new-session';
  if(changed==='link')f.peer.direct={...f.wire,active:true};
  const previous=f.peer.pendingVisualCombo.frame;
  f.peer.lastEffectsSentAt=-Infinity;
  f.send(false);
  assert.equal(f.peer.pendingVisualCombo,null,changed);
  assert.equal(f.calls.filter(x=>x.lane==='reliable'&&x.frame===previous).length,1,
   changed+' must not replay the old reliable snapshot');
 }
});

test('forged and wrong-session visual receipts cannot clear the pending burst',()=>{
 const f=fixture();f.wire.allowReliable=true;f.send(true);
 const stored=f.peer.pendingVisualCombo;
 assert.ok(stored);
 for(const payload of [
  {state:'fx-ack',scope:'wrong-epoch',frameNo:stored.frame.frameNo},
  {state:'fx-ack',scope:stored.scope,frameNo:stored.frame.frameNo+1},
  {state:'fx-ack',scope:stored.scope,frameNo:-1}
 ]){
  onlineCoop.receiveDirectEvent.call(f.peer,f.game,{kind:'state',payload});
  assert.equal(f.peer.pendingVisualCombo,stored);
 }
});

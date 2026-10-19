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
  effectSequence:0,lastEffectsSentAt:0,pendingVisualCombo:null};
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
 assert.equal(f.send(false),false,'a failed ordered channel must not pretend success');
 f.wire.allowReliable=true;
 assert.equal(f.send(false),true,'normal next frame retries an authentic ordered event');
 assert.equal(f.peer.pendingVisualCombo,null);
 const delivered=f.calls.findLast(x=>x.lane==='reliable').frame;
 assert.equal(delivered,saved,'the same full combo is retried, never reconstructed after expiry');
 assert.deepEqual(delivered.michiFx.map(f=>f.kind),['yarn','purr','wisp']);
 assert.ok(delivered.michiFx.every(f=>f.dmg===undefined&&f.target===undefined));
});
test('queued combo cannot cross room, combat epoch or peer link',()=>{
 for(const changed of ['room','epoch','link']){
  const f=fixture();f.send(true);f.wire.allowReliable=true;
  if(changed==='room')f.game.roomId='beach';
  if(changed==='epoch')f.peer.combatEpoch='new-session';
  if(changed==='link')f.peer.direct={...f.wire,active:true};
  const previous=f.peer.pendingVisualCombo.frame;
  f.send(false);
  assert.equal(f.peer.pendingVisualCombo,null,changed);
  assert.equal(f.calls.filter(x=>x.lane==='reliable'&&x.frame===previous).length,1,
   changed+' must not replay the old reliable snapshot');
 }
});

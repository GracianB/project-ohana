import test from 'node:test';
import assert from 'node:assert/strict';
import {onlineCoop} from '../systems/online-coop.js';

function fixture({hard=true,active=false,connectedAt=15000,lastHardCloseRepairAt=0,
  lobby=false,initiator=true}={}){
 let started=0,closed=0;
 const link={available:true,initiator,active,closed:hard,
  poseChannel:{readyState:hard?'closed':active?'open':'connecting'},
  eventChannel:{readyState:hard?'closed':active?'open':'connecting'},
  close(){closed++;}
 };
 const peer={enabled:true,remote:{playerId:'remote'},snapshot:{phase:lobby?'lobby':'playing'},
  direct:link,directRetryAt:99000,directConnectedAt:connectedAt,
  lastHardCloseRepairAt,lastDirectPoseAt:0,directRetries:0,directAttempted:true,
  setupDirect(){started++;}};
 return {peer,link,get started(){return started;},get closed(){return closed;}};
}
test('hard-closed active WebRTC peer reconnects promptly even before normal 16-second backoff',()=>{
 const f=fixture();
 assert.equal(onlineCoop.repairDirect.call(f.peer,{},18000),true);
 assert.equal(f.started,1);
 assert.equal(f.closed,1);
 assert.equal(f.peer.direct,null);
 assert.equal(f.peer.lastHardCloseRepairAt,18000);
});
test('no reconnect storm during soft lag, intro, answerer or early debounce',()=>{
 for(const setup of [
  {hard:false},{connectedAt:17500},{lastHardCloseRepairAt:16500},
  {lobby:true},{initiator:false},{active:true,hard:false}
 ]){
  const f=fixture(setup);
  assert.equal(onlineCoop.repairDirect.call(f.peer,{},18000),false);
  assert.equal(f.closed,0);
  assert.equal(f.started,0);
 }
});
test('a fast retry does not change the original rtcCanRetry backoff policy',async()=>{
 const {rtcCanRetry,rtcReconnectDelay}=await import('../systems/coop-v109-recovery.js');
 assert.equal(rtcReconnectDelay(0),16000);
 assert.equal(rtcCanRetry({now:18000,at:99000,peer:true,connected:false}),false);
 assert.equal(rtcCanRetry({now:99000,at:99000,peer:true,connected:false}),true);
});

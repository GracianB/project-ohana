import test from 'node:test';
import assert from 'node:assert/strict';
import {createRoomService} from '../netlify/lib/room-service.mjs';
class MemoryStore{
 data=new Map();version=0;
 async getWithMetadata(key){const e=this.data.get(key);return e?{data:structuredClone(e.data),etag:e.etag}:null;}
 async setJSON(key,value,opt={}){const current=this.data.get(key);if(opt.onlyIfNew&&current||opt.onlyIfMatch&&(!current||current.etag!==opt.onlyIfMatch))return {modified:false};
  const e={data:structuredClone(value),etag:String(++this.version)};this.data.set(key,e);return {modified:true,etag:e.etag};}
}
function harness(){
 let now=1_850_000_000_000;const store=new MemoryStore(),service=createRoomService(store,{now:()=>now,makeCode:()=> 'QWERTY',makeCredential:()=> 'safe-token'});
 return {store,service,advance:(n)=>now+=n};
}
async function team(h,mode='adventure'){
 const host=await h.service.create(mode),guest=await h.service.join(host.roomId);
 await h.service.choose(host.roomId,host.identity,'dino');
 await h.service.choose(host.roomId,guest.identity,'cat');
 await h.service.ready(host.roomId,host.identity);
 await h.service.ready(host.roomId,guest.identity);
 return {host,guest,code:host.roomId};
}
const proposal=(from,to)=>({decision:'propose',destination:to});
test('V604 server: authentic travel approval changes both room IDs atomically',async()=>{
 const h=harness(),t=await team(h);
 const room=h.store.data.get('room:'+t.code).data;
 assert.deepEqual(room.players.map(p=>p.worldRoomId),['w1-kilo','w1-kilo']);
 const started=await h.service.travel(t.code,t.host.identity,proposal('w1-kilo','w1-stitcho'));
 assert.equal(started.travel.status,'pending');
 assert.deepEqual(started.travel.accepted,[t.host.identity.playerId]);
 assert.deepEqual(started.players.map(p=>p.worldRoomId),['w1-kilo','w1-kilo']);
 const result=await h.service.travel(t.code,t.guest.identity,{decision:'accept',voteId:started.travel.id});
 assert.equal(result.travel,null);assert.equal(result.lastTravel.to,'w1-stitcho');
 assert.deepEqual(result.players.map(p=>p.worldRoomId),['w1-stitcho','w1-stitcho']);
 assert.equal(result.players[0].x,420);assert.equal(result.players[1].x,550);
 const inspected=await h.service.poll(t.code,t.host.identity);
 assert.equal(inspected.lastTravel.id,result.lastTravel.id);
});
test('V604 server: forged location and remote signals cannot cross without both approvals',async()=>{
 const h=harness(),t=await team(h);
 await assert.rejects(h.service.move(t.code,t.host.identity,{sequence:1,actionId:'move:1',mode:'engine',positionX:5000,positionY:1000,worldRoomId:'w1-dragon'}),e=>e.code==='TRAVEL_CONSENT_REQUIRED');
 await assert.rejects(h.service.signal(t.code,t.host.identity,{sequence:2,actionId:'sig:2',signalKind:'room',payload:{roomId:'w1-dragon'}}),e=>e.code==='TRAVEL_CONSENT_REQUIRED');
 const state=await h.service.poll(t.code,t.host.identity);
 assert.deepEqual(state.players.map(p=>p.worldRoomId),['w1-kilo','w1-kilo']);
});
test('V604 server: rejection, unauthorized votes, invalid routes and expiry do not move players',async()=>{
 const h=harness(),t=await team(h);
 await assert.rejects(h.service.travel(t.code,t.host.identity,proposal('w1-kilo','w1-dragon')),e=>e.code==='TRAVEL_DESTINATION_INVALID');
 const started=await h.service.travel(t.code,t.host.identity,proposal('w1-kilo','w1-stitcho'));
 const rejected=await h.service.travel(t.code,t.guest.identity,{decision:'reject',voteId:started.travel.id});
 assert.equal(rejected.travel,null);
 assert.equal(rejected.travelClosed.reason,'rejected');
 assert.deepEqual(rejected.players.map(p=>p.worldRoomId),['w1-kilo','w1-kilo']);
 const second=await h.service.travel(t.code,t.host.identity,proposal('w1-kilo','w1-stitcho'));
 // Keep both sessions alive while the 25-second vote timeout elapses.
 for(let i=0;i<3;i++){h.advance(9000);await h.service.poll(t.code,t.host.identity);await h.service.poll(t.code,t.guest.identity);}
 const expired=await h.service.travel(t.code,t.guest.identity,{decision:'accept',voteId:second.travel.id}).catch(e=>e);
 assert.equal(expired.code,'TRAVEL_STALE');
 const post=await h.service.poll(t.code,t.guest.identity);
 assert.equal(post.travel,null);assert.equal(post.travelClosed.reason,'expired');
 assert.deepEqual(post.players.map(p=>p.worldRoomId),['w1-kilo','w1-kilo']);
});
test('V604 server: legacy multiplayer remains untouched; unpublished VS fails closed',async()=>{
 const h=harness(),classic=await h.service.create();assert.equal(classic.mode,'classic');
 assert.equal(classic.players[0].worldRoomId,'hub');
 await assert.rejects(h.service.create('versus'),e=>e.code==='MODE_NOT_READY');
});

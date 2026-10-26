import test from 'node:test';
import assert from 'node:assert/strict';
import {createRoomService} from '../netlify/lib/room-service.mjs';
import {LocalRoomStore} from '../tools/local-multiplayer-server.mjs';
import {adventureCamp,adventureRoleAllowed} from '../multiplayer/adventure-roles.js';
async function team(){let time=100000;const service=createRoomService(new LocalRoomStore(),{now:()=>time});const h=await service.create('adventure'),g=await service.join(h.roomId);await service.choose(h.roomId,h.identity,'dino');await service.choose(h.roomId,g.identity,'stitcho');await service.ready(h.roomId,h.identity);await service.ready(h.roomId,g.identity);return{service,h,g,advance:n=>time+=n};}
const pose=(sequence,overrides={})=>({mode:'engine',worldRoomId:'w1-kilo',positionX:420,positionY:1094,sequence,actionId:'move:'+sequence,health:71,maxHealth:140,evolution:0,experience:12,grounded:true,...overrides});
test('relevo uses only a chapter owner or the chosen hero and only at authored camps',()=>{
 assert.equal(adventureRoleAllowed({characterId:'dino'},'w1-kilo','kilo'),true);assert.equal(adventureRoleAllowed({characterId:'kilo',homeCharacterId:'dino'},'w1-kilo','dino'),true);assert.equal(adventureRoleAllowed({characterId:'dino'},'w1-kilo','yomi'),false);
 assert.equal(adventureCamp('w1-kilo',420,1094),true);assert.equal(adventureCamp('w1-kilo',2400,1094),false);assert.equal(adventureCamp('w1-kilo',2400,1094,{stations:{'w1-kilo':[0]}}),true);assert.equal(adventureCamp('w1-kilo',420,400),false);
});
test('relevo preserves both heroes health and progress; stale movement cannot overwrite it',async()=>{
 const t=await team(),{service,h}=t;await service.move(h.roomId,h.identity,pose(1));let state=await service.role(h.roomId,h.identity,'kilo');let p=state.players.find(p=>p.isYou);assert.equal(p.characterId,'kilo');assert.equal(p.evolution,0);assert.equal(p.homeCharacterId,'dino');assert.equal(p.roleEpoch,1);
 await assert.rejects(service.move(h.roomId,h.identity,pose(2)),e=>e.code==='ROLE_CHANGED');
 await service.move(h.roomId,h.identity,pose(2,{characterId:'kilo',roleEpoch:1,health:32,maxHealth:80,experience:20}));
 t.advance(1300);state=await service.role(h.roomId,h.identity,'dino',1);p=state.players.find(p=>p.isYou);assert.equal(p.health,71);assert.equal(p.experience,12);assert.equal(p.roleEpoch,2);
 t.advance(1300);await assert.rejects(service.role(h.roomId,h.identity,'kilo',0),e=>e.code==='ROLE_CHANGED');state=await service.role(h.roomId,h.identity,'kilo',2);p=state.players.find(p=>p.isYou);assert.equal(p.health,32);assert.equal(p.experience,20);assert.equal(p.roleEpoch,3);
 const repeat=await service.role(h.roomId,h.identity,'kilo');assert.equal(repeat.players.find(p=>p.isYou).roleEpoch,3);
});
test('relevo rejects another roster hero, a mid-route swap, dead heroes and invalid credentials',async()=>{
 const {service,h}=await team();await assert.rejects(service.role(h.roomId,h.identity,'pizza'),e=>e.code==='ROLE_INVALID');await service.move(h.roomId,h.identity,pose(1,{positionX:7000}));await assert.rejects(service.role(h.roomId,h.identity,'kilo'),e=>e.code==='CAMP_REQUIRED');await service.move(h.roomId,h.identity,pose(2,{health:0}));await assert.rejects(service.role(h.roomId,h.identity,'kilo'),e=>e.code==='ROLE_UNAVAILABLE');await assert.rejects(service.role(h.roomId,{...h.identity,token:'wrong'},'kilo'),e=>e.code==='INVALID_SESSION');
});

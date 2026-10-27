import test from 'node:test';
import assert from 'node:assert/strict';
import {mergeAdventureProgress,applyAdventureProgress,adventureRoomProgress,createAdventureStorage} from '../multiplayer/adventure-progress.js';
import {WORLD1_ROOMS} from '../systems/world1-rooms.js';
import {enterWorld1,awardSeal} from '../systems/world1-play.js';
import {enterExpedition} from '../systems/chapter-expedition-v2.js';
import {createRoomService} from '../netlify/lib/room-service.mjs';
import {shouldSendPosition,networkPacing} from '../systems/coop-v103-pacing.js';
import {LocalRoomStore} from '../tools/local-multiplayer-server.mjs';
const roomId='w1-kilo',room=WORLD1_ROOMS[roomId];
const fixture=(hero='kilo')=>({onlineAdventure:true,roomId:'w1-'+hero,roomDef:WORLD1_ROOMS['w1-'+hero],player:{id:hero,x:0,y:1000,w:30,h:40,health:70,xp:0,evo:0},world1Seals:[],secrets:{},expeditionStorage:createAdventureStorage()});
test('shared puzzle progress is authored, room scoped, monotonic and idempotent',()=>{
 const p={roomId,stations:[0,0,999],secrets:['w1-kilo-v2-trial-0','w1-cat-v2-trial-1'],encounters:['w1-kilo-drummer-v1'],sealed:true};
 const one=mergeAdventureProgress(null,p,{roomId});assert.deepEqual(one.stations[roomId],[0]);assert.deepEqual(one.secrets[roomId],['w1-kilo-v2-trial-0']);assert.deepEqual(one.encounters[roomId],[]);assert.deepEqual(one.seals,[]);
 assert.deepEqual(mergeAdventureProgress(one,{...p,stations:[]},{roomId}),one);assert.deepEqual(mergeAdventureProgress(one,p,{roomId:'w1-cat'}),one);
 assert.equal(JSON.stringify(mergeAdventureProgress(one,p,{roomId})),JSON.stringify(one));
});
test('Kilo requires four authored instruments and the real host guardian receipt, without a removed Act II gate',()=>{
 assert.equal(room.expedition,null);
 const p={roomId,stations:room.seal.stations.map(s=>s.id),secrets:[],encounters:['w1-kilo-tambor-v1'],sealed:true};
 assert.deepEqual(mergeAdventureProgress(null,p,{roomId}).seals,[]);
 assert.deepEqual(mergeAdventureProgress(null,{...p,stations:p.stations.slice(1)},{roomId,host:true}).seals,[]);
 assert.deepEqual(mergeAdventureProgress(null,{...p,encounters:[]},{roomId,host:true}).seals,[]);
 assert.deepEqual(mergeAdventureProgress(null,{...p,encounters:['w1-kilo-fake']},{roomId,host:true}).seals,[]);
 assert.deepEqual(mergeAdventureProgress(null,p,{roomId,host:true}).seals,['kilo']);
});
test('the other nine chapters retain their authored discovery requirements and host-only seals',()=>{
 for(const r of Object.values(WORLD1_ROOMS).filter(r=>r.hero&&r.hero!=='kilo')){
  assert.equal(r.expedition.nodes.length,3,r.hero);
  const id=r.id,p={roomId:id,stations:r.seal.stations.filter(s=>s.kind!=='oven').map(s=>s.id),secrets:r.expedition.nodes.map(n=>n.id),encounters:[id+'-guardian-v1'],sealed:true};
  assert.deepEqual(mergeAdventureProgress(null,p,{roomId:id}).seals,[],r.hero+' guest cannot seal');
  assert.deepEqual(mergeAdventureProgress(null,{...p,secrets:p.secrets.slice(1)},{roomId:id,host:true}).seals,[],r.hero+' requires every discovery');
  assert.deepEqual(mergeAdventureProgress(null,p,{roomId:id,host:true}).seals,[r.hero]);
 }
});
test('applying shared objectives preserves identity, health and rewards through retries',()=>{
 const g=fixture();enterWorld1(g);const progress=mergeAdventureProgress(null,{roomId,stations:[0],secrets:['w1-kilo-v2-trial-0']},{roomId});
 for(let i=0;i<3;i++)assert.equal(applyAdventureProgress(g,progress),true);
 assert.equal(g.world1.stations[0].done,true);assert.equal(g.world1.stations[0]._scored,true);assert.equal(g.player.health,70);assert.equal(g.player.xp,0);assert.equal(g.score,undefined);assert.equal(g.player.id,'kilo');assert.equal(g.expedition,null);
 assert.deepEqual(g.secrets[roomId],['w1-kilo-v2-trial-0'],'previously earned optional receipts are retained');
 enterWorld1(g);assert.equal(g.world1.stations[0].done,true);assert.equal(g.expedition,null);
 g.onlineAdventure=false;assert.equal(applyAdventureProgress(g,progress),false);
});
test('cooperative discoveries use disposable storage instead of the solo expedition profile',()=>{
 const a=fixture('stitcho'),b=fixture('stitcho'),id=a.roomId,r=a.roomDef;a.expeditionStorage.setItem('ohana-expeditions-v2',JSON.stringify({[id]:[r.expedition.nodes[0].id]}));enterExpedition(a);enterExpedition(b);assert.equal(a.expedition.done.length,1);assert.equal(b.expedition.done.length,0);
 const kilo=fixture();enterExpedition(kilo);assert.equal(kilo.expedition,null,'Kilo does not fabricate removed discoveries or storage');
});
test('both authenticated players contribute objectives; guest cannot manufacture boss or seal receipts',async()=>{
 const service=createRoomService(new LocalRoomStore());const h=await service.create('adventure'),g=await service.join(h.roomId);await service.choose(h.roomId,h.identity,'kilo');await service.choose(h.roomId,g.identity,'stitcho');await service.ready(h.roomId,h.identity);await service.ready(h.roomId,g.identity);
 const pose={mode:'engine',worldRoomId:roomId,positionX:2400,positionY:1090,sequence:1,actionId:'guest:one',adventureProgress:{roomId,stations:[0],encounters:['w1-kilo-fake'],sealed:true}};
 const published=await service.move(h.roomId,g.identity,pose);assert.deepEqual(published.adventureProgress.stations[roomId],[0]);assert.deepEqual(published.adventureProgress.encounters[roomId],[]);assert.deepEqual(published.adventureProgress.seals,[]);
 const host=await service.poll(h.roomId,h.identity);assert.deepEqual(host.adventureProgress.stations[roomId],[0]);
 const stale=await service.move(h.roomId,g.identity,pose);assert.equal(stale.replayed,true);assert.deepEqual(stale.adventureProgress,host.adventureProgress);
 await assert.rejects(service.move(h.roomId,{...g.identity,token:'wrong'},{...pose,sequence:2}),e=>e.code==='INVALID_SESSION');
 const solved=await service.move(h.roomId,g.identity,{...pose,sequence:2,actionId:'guest:instruments',adventureProgress:{roomId,stations:room.seal.stations.map(s=>s.id),encounters:['w1-kilo-tambor-v1'],sealed:true}});
 assert.equal(solved.adventureProgress.stations[roomId].length,4);
 assert.deepEqual(solved.adventureProgress.encounters[roomId],[]);
 assert.deepEqual(solved.adventureProgress.seals,[],'even all guest instruments cannot replace the host guardian receipt');
 const receipt={...pose,sequence:1,actionId:'host:guardian',adventureProgress:{roomId,stations:[],encounters:['w1-kilo-tambor-v1'],sealed:true}};
 const cleared=await service.move(h.roomId,h.identity,receipt);
 assert.deepEqual(cleared.adventureProgress.seals,['kilo'],'the real authenticated host receipt completes the new route without removed discoveries');
 const repeated=await service.move(h.roomId,h.identity,receipt);
 assert.equal(repeated.replayed,true);assert.deepEqual(repeated.adventureProgress.seals,['kilo']);
});

test('objective updates respect pacing and do not wait for an idle heartbeat',()=>{
 const before={positionX:0,positionY:0,adventureProgress:{roomId,stations:[]}},after={...before,adventureProgress:{roomId,stations:[0]}};
 assert.equal(shouldSendPosition(before,after,100,networkPacing()),false);assert.equal(shouldSendPosition(before,after,400,networkPacing()),true);assert.equal(shouldSendPosition(after,structuredClone(after),400,networkPacing()),false);
});
test('a guest cannot independently issue a seal before the host receipt',()=>{
 const g=fixture();enterWorld1(g);g.coopAuthority=false;assert.equal(awardSeal(g),false);assert.deepEqual(g.world1Seals,[]);
 let scenes=0;g.onWorld1Beat=kind=>{if(kind==='seal')scenes++;};const p={stations:{},secrets:{},encounters:{},seals:['kilo']};applyAdventureProgress(g,p);applyAdventureProgress(g,p);assert.equal(scenes,1);assert.equal(g.player.health,70);assert.equal(g.player.xp,0);
});

test('new adventure parties start baby without legacy combat XP or synthetic enemies',async()=>{
 const service=createRoomService(new LocalRoomStore()),h=await service.create('adventure'),g=await service.join(h.roomId);await service.choose(h.roomId,h.identity,'kilo');await service.choose(h.roomId,g.identity,'dino');await service.ready(h.roomId,h.identity);const s=await service.ready(h.roomId,g.identity);
 assert.equal(s.engineMode,true);assert.deepEqual(s.players.map(p=>[p.evolution,p.experience]),[[0,0],[0,0]]);assert.deepEqual(s.players.map(p=>p.health),[80,140]);assert.deepEqual(s.combat.enemies,[]);assert.equal(s.combat.scene,null);assert.equal(s.combat.boss,null);
});

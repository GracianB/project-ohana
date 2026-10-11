import test from 'node:test';
import assert from 'node:assert/strict';
import {captureCombatFrame,applyCombatFrame,advanceMirroredEnemies,mirroredProjectileHits,sharedEnemyTarget} from '../systems/coop-combat-mirror.js';
import {capturePeerEffects,applyPeerEffects,advancePeerEffects} from '../systems/coop-peer-effects.js';
import {DirectPeerLink} from '../systems/coop-v108-direct.js';
const enemy=()=>({kind:'cucaracho',spawnIndex:0,x:100,y:200,w:24,h:24,vx:2,vy:0,hp:20,max:20});
const host=()=>({roomId:'hub',coopRoomVisit:1,enemies:[enemy()],projectiles:[]});
const guest=()=>({roomId:'hub',enemies:[],projectiles:[],createCoopEnemy:s=>({...enemy(),kind:s.kind})});
test('V290 rejects a whole corrupt frame without partially moving enemies',()=>{
 const h=host(),g=guest(),f=captureCombatFrame(h,1,'session');assert.equal(applyCombatFrame(g,f),true);
 const before=structuredClone(g.enemies);f.frameNo=2;f.enemies[0].x=800;f.enemies.push({...f.enemies[0],id:2,hp:NaN});
 assert.equal(applyCombatFrame(g,f),false);assert.deepEqual(g.enemies,before);
});
test('V291 stable identity survives array shifts and rejects old visits',()=>{
 const h=host(),g=guest();h.enemies.push({...enemy(),spawnIndex:1,x:300});
 applyCombatFrame(g,captureCombatFrame(h,1,'session'));const survivor=g.enemies[1];h.enemies.shift();
 applyCombatFrame(g,captureCombatFrame(h,2,'session'));assert.equal(g.enemies[0],survivor);
 const old=captureCombatFrame(h,3,'session');h.coopRoomVisit=2;applyCombatFrame(g,captureCombatFrame(h,4,'session'));
 assert.equal(applyCombatFrame(g,old),false);
});
test('V292 full frames reconcile births, transformation and removal',()=>{
 const h=host(),g=guest();applyCombatFrame(g,captureCombatFrame(h,1,'s'));const old=g.enemies[0];
 h.enemies[0].kind='phosquito';applyCombatFrame(g,captureCombatFrame(h,2,'s'));
 assert.notEqual(g.enemies[0],old);assert.equal(g.enemies[0].kind,'phosquito');
 h.enemies=[];applyCombatFrame(g,captureCombatFrame(h,3,'s'));assert.equal(g.enemies.length,0);
});
test('V293 prediction freezes after twelve simulation ticks',()=>{
 const h=host(),g=guest();applyCombatFrame(g,captureCombatFrame(h,1,'s'));
 for(let i=0;i<40;i++)advanceMirroredEnemies(g,100);
 assert.equal(g.enemies[0].x,124);assert.equal(advanceMirroredEnemies(g,800),false);
});
test('V294 consumed projectile cannot damage again after the next snapshot',()=>{
 const h=host(),g=guest();h.projectiles=[{owner:'enemy',x:0,y:0,w:8,h:8,vx:0,vy:0,life:100,dmg:5}];
 g.player={x:0,y:0,w:24,h:24,invuln:0};let damage=0;
 applyCombatFrame(g,captureCombatFrame(h,1,'s'));mirroredProjectileHits(g,n=>damage+=n);
 applyCombatFrame(g,captureCombatFrame(h,2,'s'));mirroredProjectileHits(g,n=>damage+=n);assert.equal(damage,5);
});
test('V295 replicas preserve real effects but never enter damaging projectile arrays',()=>{
 const h=host(),g=guest();h.projectiles=[{owner:'player',x:20,y:30,w:8,h:8,vx:4,vy:0,life:60,shape:'auroraLance',dmg:900}];
 const frame=capturePeerEffects(h,1,'s');assert.equal(applyPeerEffects(g,frame),true);advancePeerEffects(g);
 assert.equal(g.coopPeerEffects.projectiles[0].x,24);assert.equal(g.coopPeerEffects.projectiles[0].shape,'auroraLance');
 assert.equal(g.projectiles.length,0);assert.equal(g.coopPeerEffects.projectiles[0].dmg,undefined);
 assert.equal(applyPeerEffects(g,frame),false);
});
test('V297 targets the closer living teammate and keeps local ties',()=>{
 const e={x:0,y:0},local={x:100,y:0},peer={x:20,y:0};assert.equal(sharedEnemyTarget(e,local,peer),peer);
 peer.dead=true;assert.equal(sharedEnemyTarget(e,local,peer),local);
 peer.dead=false;peer.x=100;assert.equal(sharedEnemyTarget(e,local,peer),local);
});
test('V298 snapshot datagrams stop at backpressure without queuing reliable actions',()=>{
 const sent=[],link=Object.create(DirectPeerLink.prototype);link.closed=false;link.ready=true;
 link.poseChannel={readyState:'open',bufferedAmount:0,send:m=>sent.push(JSON.parse(m))};link.eventChannel={readyState:'open'};
 assert.equal(link.sendLatest('combat',{frameNo:1}),true);assert.equal(sent[0].t,'world');
 link.poseChannel.bufferedAmount=12001;assert.equal(link.sendLatest('combat',{}),false);
 assert.equal(link.sendLatest('hit',{}),false);assert.equal(sent.length,1);
});

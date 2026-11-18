import test from'node:test';import assert from'node:assert/strict';
import{QUIMERA_PRESSURE as C,updateQuimeraPressure,collectQuimeraStars,quimeraPressureState}from'../systems/quimera-pressure.js';
import{createFusionBoss,drawFusionAttackTelegraphs,drawFusionProjectiles,FUSION_ATTACKS}from'../systems/fusion-boss.js';
import{WORLD1_ARENA as A,WORLD1_FLOOR as F}from'../systems/world1-rooms.js';
import{finaleEnemy,validFinaleEnemy,applyAdventureFinale}from'../multiplayer/adventure-finale.js';
function scene(phase=1){const boss=createFusionBoss(660);boss.phase=phase;boss._fusion.mode='rest';const player={id:'kilo',x:9000,y:F-48,w:32,h:48,health:100,maxHealth:150,xp:17,evo:1,grounded:true};return{roomId:'w1-final',boss,player,enemies:[boss],quimeraArena:{}};}
const tick=(g,n=1,helpers={})=>{for(let i=0;i<n;i++)updateQuimeraPressure(g.boss,g,helpers);};
test('reinforcements have an alive cap and a finite quota across all four phases',()=>{
 const g=scene();for(let phase=1;phase<=4;phase++){g.boss.phase=phase;for(let i=0;i<650;i++){tick(g);const q=g.boss._fusion.pressure;assert.ok(q.minions.length<=2);for(const m of q.minions)m.hp=0;}assert.equal(g.boss._fusion.pressure.spawned,C.phaseQuota[phase]);}assert.equal(g.boss._fusion.pressure.serial,8);assert.ok(g.boss._fusion.pressure.stars.length<=6);
});
test('spawn portals warn for 72 ticks and never appear on top of a boundary player',()=>{
 const g=scene();g.player.x=A.right-40;tick(g,120);const m=g.boss._fusion.pressure.minions[0];assert.ok(Math.abs(m.x-g.player.x)>=280);assert.equal(m.mode,'spawn');assert.equal(m.clock,71);const hits=[];tick(g,70,{hurtPlayer:(...a)=>hits.push(a)});assert.equal(m.mode,'spawn');assert.equal(hits.length,0);tick(g);assert.equal(m.mode,'wait');
});
test('hunter windup locks a target and a dash can hit only once',()=>{
 const g=scene();tick(g,120);const q=g.boss._fusion.pressure,m=q.minions[0];m.mode='wind';m.clock=42;m.x=g.player.x-80;m.target={x:g.player.x+16,y:g.player.y+24};const hits=[];tick(g,41,{hurtPlayer:(...a)=>hits.push(a)});assert.equal(hits.length,0);tick(g,22,{hurtPlayer:(...a)=>hits.push(a)});assert.equal(hits.length,1);
});
test('phase transitions suspend summons and defeat clears every summon and support star',()=>{
 const g=scene();tick(g,120);const old=g.boss._fusion.pressure.minions[0];g.boss.phase=2;g.boss._fusion.mode='special';tick(g,100);assert.equal(old.hp,0);assert.equal(g.boss._fusion.pressure.minions.length,0);g.boss.hp=0;tick(g);assert.equal(g.boss._fusion.pressure.stars.length,0);
});
test('a defeated summon drops exactly one star, with bounded pool and lifetime',()=>{
 const g=scene();tick(g,120);const q=g.boss._fusion.pressure,m=q.minions[0],before=q.starSerial;m.hp=0;tick(g,3);assert.equal(q.starSerial,before+1);assert.equal(q.minions.length,0);tick(g,1000);assert.equal(q.stars.length,0);
});
test('support stars heal once, respect maximum health and clear at most two ordinary nearby shots',()=>{
 const g=scene();tick(g);const q=g.boss._fusion.pressure;q.stars=[{id:77,x:g.player.x+16,y:g.player.y+24,life:10,age:0}];g.player.health=147;g.boss._fusion.shots=['orb','fire','node','beam','meteor'].map((k,i)=>({k,x:g.player.x+16+i,y:g.player.y+24,life:50}));
 assert.equal(collectQuimeraStars(g),1);assert.equal(g.player.health,150);assert.equal(g.player.invuln,18);assert.equal(g.boss._fusion.shots.filter(s=>s.life===0).length,2);assert.equal(g.boss._fusion.shots[3].life,50);assert.equal(g.boss._fusion.shots[4].life,50);assert.equal(collectQuimeraStars(g),0);assert.equal(g.player.xp,17);assert.equal(g.player.evo,1);
});
test('guests collect their own star once and never advance host-owned spawn decisions',()=>{
 const g=scene();tick(g);g.onlineAdventure=true;g.coopAuthority=false;const q=g.boss._fusion.pressure,before=q.t;q.stars=[{id:8,x:g.player.x+16,y:g.player.y+24,life:20}];tick(g,50);assert.equal(q.t,before);assert.equal(q.spawned,0);assert.equal(g.player.health,108);
});
test('finale snapshots keep targetable summons as the same objects the guest renders',()=>{
 const g=scene();tick(g,120);const boss=finaleEnemy(g.boss);assert.ok(validFinaleEnemy(boss));const peer={onlineAdventure:true,coopAuthority:false,roomId:'w1-final',player:{id:'kilo'},enemies:[]};applyAdventureFinale(peer,{found:[],phase:'complete',hero:null,boss,guardian:null,shots:[],revision:1},{players:[]});assert.equal(peer.enemies.length,2);assert.equal(peer.enemies[1],peer.boss._fusion.pressure.minions[0]);assert.ok(Number.isSafeInteger(peer.enemies[1]._coopSyncId));
});
test('Quimera warning and attack renderers never stroke guide wires, rings or perimeter rails',()=>{
 const grad={addColorStop(){}};let fills=0;const c=new Proxy({globalAlpha:1,stroke(){throw Error('guide-line stroke');},fill(){fills++;},createRadialGradient:()=>grad,createLinearGradient:()=>grad},{get:(o,k)=>k in o?o[k]:()=>{}});
 for(const attack of Object.keys(FUSION_ATTACKS)){const e=createFusionBoss();Object.assign(e._fusion,{mode:'warn',attack,marks:attack==='red'?[{x:9000,y:1000}]:[9000],target:{x:9000,y:1050},clock:20,warnMax:72});drawFusionAttackTelegraphs(c,e,{x:0,y:0},40);}
 for(const k of['bolt','geyser','beam','orb','ring','wave','fire','meteor','jelly','wheel','node','echo'])drawFusionProjectiles(c,{shots:[{k,x:9000,y:1000,r:30,life:k==='bolt'?17:40,liveFor:50,band:F-130,age:20}]},{x:0,y:0},30);
 assert.ok(fills>100);
});

test('summon hit invulnerability expires so subsequent native attacks can defeat it',()=>{
 const g=scene();tick(g,120);const m=g.boss._fusion.pressure.minions[0];m.invuln=8;tick(g,8);assert.equal(m.invuln,0);
});

import{onlineCoop}from'../systems/online-coop.js';
test('cooperative hits resolve the summon ID at the host and remain in its next boss snapshot',()=>{
 const g=scene();g.onlineAdventure=true;g.coopAuthority=true;tick(g,120);const m=g.boss._fusion.pressure.minions[0],before=m.hp,c=new onlineCoop.constructor();assert.equal(c.applyRemoteHit(g,{targetSyncId:m._coopSyncId,targetVisit:m._coopVisit,kind:m.kind,x:m.x,y:m.y,damage:12}),true);assert.equal(m.hp,before-12);assert.equal(finaleEnemy(g.boss)._fusion.pressure.minions[0].hp,before-12);
});

test('summon snapshots exclude transient ability attachments and circular engine references',()=>{
 const g=scene();tick(g,120);const m=g.boss._fusion.pressure.minions[0];m.abilityOwner=g;m.circular=m;const snapshot=finaleEnemy(g.boss);assert.ok(validFinaleEnemy(snapshot));assert.equal(snapshot._fusion.pressure.minions[0].abilityOwner,undefined);assert.equal(snapshot._fusion.pressure.minions[0].circular,undefined);assert.equal(snapshot._fusion.pressure.minions[0].hp,m.hp);
});

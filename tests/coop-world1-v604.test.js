import test from'node:test';import assert from'node:assert/strict';import{captureCombatFrame,validCombatFrame,applyCombatFrame}from'../systems/coop-combat-mirror.js';import{safeDirectPose}from'../systems/coop-v108-direct.js';import{WORLD1_ORDER}from'../systems/world1-rooms.js';
test('World 1 rooms carry real peer poses and enemy state through both transports',()=>{
 for(const roomId of [...WORLD1_ORDER.map(h=>'w1-'+h),'w1-final']){const source={roomId,enemies:[{spawnIndex:0,kind:'rana',x:9000,y:1000,w:46,h:58,hp:55,max:100,telegraph:true}],projectiles:[],coopRoomVisit:1};const f=captureCombatFrame(source,1,'one');assert.equal(validCombatFrame(f),true,roomId);const guest={roomId,enemies:[{...source.enemies[0],hp:100}],projectiles:[]};assert.equal(applyCombatFrame(guest,f),true);assert.equal(guest.enemies[0].hp,55);assert.equal(safeDirectPose({t:'pose',seq:1,x:9000,y:1000,room:roomId}).x,9000);}
 assert.equal(safeDirectPose({t:'pose',seq:1,x:14000,y:1000,room:'w1-final'}),null);assert.equal(validCombatFrame({protocol:2,scope:'one',visit:0,frameNo:1,full:true,roomId:'w1-fake',enemies:[],bullets:[]}),false);
});

test('large chapter frames retain the guardian and nearest threats with stable spawn identities',()=>{
 const enemies=Array.from({length:35},(_,i)=>({kind:'rana',x:i*350,y:1000,w:46,h:58,hp:50,max:50,campaignRole:'jumper'}));
 enemies.push({kind:'rana',miniBoss:true,x:12000,y:1000,w:100,h:100,hp:500,max:500});
 const frame=captureCombatFrame({roomId:'w1-kilo',enemies,player:{x:11000,y:1000},coopRemote:{x:10000,y:1000}},1,'s');
 assert.equal(frame.full,false);assert.ok(frame.enemies.some(e=>e.index===35));assert.ok(frame.enemies.some(e=>e.index===31));assert.equal(frame.enemies.find(e=>e.index===31).flags.campaignRole,'jumper');assert.equal(validCombatFrame(frame),true);assert.ok(JSON.stringify(frame).length<=11200);
});

import {damageEnemy} from '../systems/mutations.js';
test('a guest can damage an open chapter guardian and loses that opening when the host closes it',()=>{
 const enemy={spawnIndex:0,kind:'rana',x:9000,y:1000,w:100,h:100,hp:500,max:500,damageTakenScale:1,damageWindowRemaining:18,miniBoss:true,_drummer:{phase:'rest',timer:60,aim:1}},host={roomId:'w1-kilo',enemies:[enemy],projectiles:[]},guest={roomId:'w1-kilo',enemies:[{...enemy,damageTakenScale:0,damageWindowRemaining:0}],projectiles:[]};
 assert.equal(applyCombatFrame(guest,captureCombatFrame(host,1,'one')),true);assert.equal(guest.enemies[0]._drummer.phase,'rest');assert.equal(damageEnemy(guest.enemies[0],90),true);assert.equal(guest.enemies[0].hp,482);assert.equal(guest.enemies[0].damageWindowRemaining,0);enemy.damageTakenScale=0;enemy.damageWindowRemaining=0;enemy._drummer.phase='warn';applyCombatFrame(guest,captureCombatFrame(host,2,'one'));assert.equal(guest.enemies[0]._drummer.phase,'warn');assert.equal(damageEnemy(guest.enemies[0],90),false);assert.equal(guest.enemies[0].hp,500);
});

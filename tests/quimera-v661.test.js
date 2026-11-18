import test from'node:test';import assert from'node:assert/strict';
import{QUIMERA_ANCHORS,QUIMERA_ROUTES,interactQuimeraArena,updateQuimeraArena}from'../systems/quimera-arena.js';
import{collectQuimeraStars,updateQuimeraPressure}from'../systems/quimera-pressure.js';
import{createFusionBoss}from'../systems/fusion-boss.js';import{quimeraArticulation}from'../systems/quimera-art.js';import{eclipseLife}from'../systems/quimera-eclipse.js';import{WORLD1_FLOOR as F}from'../systems/world1-rooms.js';
function game(phase=1){const boss=createFusionBoss();boss.phase=phase;boss._fusion.mode='rest';return{roomId:'w1-final',boss,enemies:[boss],player:{x:7650-16,y:F-48,w:32,h:48,health:100,maxHealth:150,xp:13,evo:1,vy:0,grounded:true},platforms:[],secrets:{},quimeraArena:null};}
test('three prisms have distinct combat effects and preserve all authored moon paths',()=>{
 const g=game();for(const q of QUIMERA_ANCHORS){g.player.x=q.x-16;if(q.role==='pulse')g.boss._fusion.shots=Array.from({length:7},(_,i)=>({k:i===6?'beam':'orb',x:q.x+i,y:F-80,life:60}));assert.ok(interactQuimeraArena(g));if(q.role==='shield')assert.equal(g.quimeraArena.shield,180);if(q.role==='pulse'){assert.equal(g.boss._fusion.shots.filter(s=>s.life===0).length,4);assert.equal(g.boss._fusion.shots[6].life,60);}if(q.role==='wind'){assert.equal(g.player.vy,-11.8);assert.equal(g.player.grounded,false);assert.equal(g.quimeraArena.wind,240);}}updateQuimeraArena(g);assert.equal(g.platforms.filter(p=>p.quimeraStep).length,9);assert.equal(g.platforms.length,9+QUIMERA_ROUTES.length);assert.equal(g.player.xp,13);
});
test('support stars can be collected by small and tall bodies, not only by their centres',()=>{
 for(const h of[26,48,110,190]){const g=game();g.player.h=h;g.player.y=F-h;updateQuimeraPressure(g.boss,g);g.boss._fusion.pressure.stars=[{id:33,x:g.player.x+16,y:F-38,life:40}];assert.equal(collectQuimeraStars(g),1,'height '+h);assert.equal(g.player.health,108);}
});
test('three stars grant one temporary constellation guard without XP or stacked shields',()=>{
 const g=game();updateQuimeraArena(g);updateQuimeraPressure(g.boss,g);const q=g.boss._fusion.pressure;for(let i=0;i<3;i++){q.stars=[{id:100+i,x:g.player.x+16,y:F-24,life:40}];collectQuimeraStars(g);}assert.equal(g._quimeraStarPocket.chain,0);assert.equal(g.quimeraArena.shield,90);assert.equal(g.player.xp,13);g.quimeraArena.shield=180;for(let i=0;i<3;i++){q.stars=[{id:200+i,x:g.player.x+16,y:F-24,life:40}];collectQuimeraStars(g);}assert.equal(g.quimeraArena.shield,180);
});
test('later hunters leap to a bounded locked destination and finish on the real floor',()=>{
 const g=game(3);for(let i=0;i<80;i++)updateQuimeraPressure(g.boss,g);const q=g.boss._fusion.pressure,m=q.minions[0];m.kind='eclipse-hunter';m.mode='wind';m.clock=1;m.target={x:m.x+900,y:F-100};updateQuimeraPressure(g.boss,g);assert.equal(m.mode,'leap');assert.ok(Math.abs(m.leapTo-m.leapFrom)<=330);g.player.x-=1000;let highest=F;for(let i=0;i<26;i++){updateQuimeraPressure(g.boss,g);highest=Math.min(highest,m.y);}assert.ok(highest<F-m.h-100);assert.equal(m.y,F-m.h);assert.equal(m.mode,'wait');
});
test('later watchers release a capped two-shot spread toward their locked target',()=>{
 const g=game(3);for(let i=0;i<80;i++)updateQuimeraPressure(g.boss,g);const m=g.boss._fusion.pressure.minions[0];m.kind='eclipse-watcher';m.mode='wind';m.clock=1;m.target={x:9000,y:1050};g.player.x=7400;updateQuimeraPressure(g.boss,g);assert.equal(g.boss._fusion.shots.length,2);assert.ok(g.boss._fusion.shots.every(s=>Number.isFinite(s.vx)&&Number.isFinite(s.vy)));assert.notEqual(g.boss._fusion.shots[0].vy,g.boss._fusion.shots[1].vy);
});
test('eclipse warning gaze follows the locked target and recovery responds to the player',()=>{
 const g=game();g.boss._fusion.mode='warn';g.boss._fusion.target={x:300,y:400};const o={boss:g.boss,x:500,y:300,radius:180,player:{x:700,y:500,w:30,h:40},reduce:true};assert.equal(eclipseLife(o).lookX,eclipseLife({...o,player:{...o.player,x:1000}}).lookX);g.boss._fusion.mode='rest';assert.notEqual(eclipseLife(o).lookX,eclipseLife({...o,player:{...o.player,x:1000}}).lookX);
});
test('Quimera articulates its emitting organ with finite motion and no combat mutation',()=>{
 const e=createFusionBoss();e._fusion={mode:'warn',attack:'terremoto',clock:20,warnMax:78};const before=JSON.stringify(e),a=quimeraArticulation(e,20),b=quimeraArticulation({...e,_fusion:{...e._fusion,attack:'plasma'}},20);assert.notEqual(a.arm,b.arm);assert.ok(Object.values(a).every(Number.isFinite));assert.deepEqual(quimeraArticulation(e,20,true),quimeraArticulation(e,800,true));assert.equal(JSON.stringify(e),before);
});

test('guest pulses remember consumed projectile IDs before the next host frame can restore them',()=>{
 const g=game();g.onlineAdventure=true;g.coopAuthority=false;g.boss._coopSyncId=9;g.player.x=9400-16;g.boss._fusion.shots=Array.from({length:5},(_,i)=>({id:i+1,k:'orb',x:9400+i,y:F-80,life:60}));interactQuimeraArena(g);assert.equal(g._coopFinalConsumed.size,4);assert.ok(g._coopFinalConsumed.has('q:9:1'));assert.equal(g.boss._fusion.shots[4].life,60);
});

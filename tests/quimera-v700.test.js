import test from'node:test';import assert from'node:assert/strict';
import{QUIMERA_ANCHORS,QUIMERA_ROUTES,updateQuimeraArena,interactQuimeraArena,quimeraArenaNavigation}from'../systems/quimera-arena.js';
import{createFusionBoss,updateFusionBoss}from'../systems/fusion-boss.js';
import{updateQuimeraPressure,collectQuimeraStars}from'../systems/quimera-pressure.js';
import{finaleEnemy}from'../multiplayer/adventure-finale.js';
import{quimeraSupportText,world1BossHealthLayout,updateWorld1BossDirector,createWorld1BossDirector}from'../systems/world1-boss.js';
import{WORLD1_FLOOR as F}from'../systems/world1-rooms.js';
function scene(phase=1){const boss=createFusionBoss();boss.phase=phase;boss._fusion.mode='rest';boss._fusion.rest=999;return{roomId:'w1-final',boss,enemies:[boss],platforms:[],secrets:{},player:{x:7600,y:F-48,w:32,h:48,health:40,maxHealth:100,xp:13,evo:1,vy:2,grounded:true}};}
test('V700 upper routes are bounded, repeatable, and connected by short reachable gaps',()=>{
 const g=scene();for(let i=0;i<5;i++)updateQuimeraArena(g);assert.equal(g.platforms.length,12);assert.equal(new Set(g.platforms.map(p=>p.quimeraRoute)).size,12);
 for(const section of[0,1]){const route=QUIMERA_ROUTES.filter(p=>p.quimeraRoute.startsWith('sky-'+section));assert.equal(route.length,6);for(let i=1;i<route.length;i++){assert.ok(route[i].x-(route[i-1].x+route[i-1].w)<=130);assert.ok(Math.abs(route[i].y-route[i-1].y)<=50);}assert.ok(route.every(p=>p.y<F-200&&p.y>=F-300));}
 g.roomId='w1-cat';g.platforms=[];updateQuimeraArena(g);assert.equal(g.platforms.length,0);
});
test('V700 wind boost is exclusive to its authored current, with ground control preserved',()=>{
 const g=scene();for(const q of QUIMERA_ANCHORS){g.player.x=q.x-16;interactQuimeraArena(g);}for(const q of QUIMERA_ANCHORS){g.player.x=q.x+q.dir*260-16;g.player.y=F-170;g.player.grounded=false;g.player.vy=2;updateQuimeraArena(g);assert.equal(g.player.vy,q.role==='wind'?-5.1:-3.7);}g.player.grounded=true;g.player.vy=2;updateQuimeraArena(g);assert.equal(g.player.vy,2);
});
test('V700 pulse reports its actual capped cleanup and excludes protected special attacks',()=>{
 const g=scene();g.player.x=9400-16;g.boss._fusion.shots=[...Array.from({length:5},()=>({k:'orb',x:9400,y:F-70,life:30})),{k:'beam',x:9400,y:F-70,life:30}];interactQuimeraArena(g);assert.equal(g.quimeraArena.pulseCleared,4);assert.match(g.quimeraArena.message.text,/4 ecos/);assert.equal(g.boss._fusion.shots.at(-1).life,30);
});
test('V700 navigation prioritizes ready unopened prisms and does not activate them',()=>{
 const g=scene();updateQuimeraArena(g);g.secrets['w1-final']=['w1-final-eclipse-west'];g.quimeraArena.cooldowns.heart=400;assert.equal(quimeraArenaNavigation(g).id,'east');assert.equal(g.platforms.filter(p=>p.quimeraStep).length,0);g.boss.hp=0;assert.equal(quimeraArenaNavigation(g),null);
});
test('V700 personal star attraction preserves shared positions, grants healing once and no growth',()=>{
 const g=scene();updateQuimeraArena(g);updateQuimeraPressure(g.boss,g);const s={id:77,x:g.player.x+g.player.w+55,y:F-28,age:50,life:300};g.boss._fusion.pressure.stars=[s];const before=JSON.stringify(s);
 for(let i=0;i<30;i++)collectQuimeraStars(g);assert.equal(JSON.stringify(s),before);assert.ok(g._quimeraStarPocket.taken.has(77));assert.equal(g.player.health,48);assert.equal(g.player.xp,13);assert.equal(g.player.evo,1);assert.equal(g._quimeraStarPocket.lures.size,0);
});
test('V700 personal star attraction respects a solid obstruction and clears expired lures',()=>{
 const g=scene();updateQuimeraPressure(g.boss,g);const s={id:88,x:g.player.x+g.player.w+55,y:F-28,age:50,life:300};g.boss._fusion.pressure.stars=[s];g.platforms=[{x:g.player.x+40,y:F-70,w:20,h:70}];for(let i=0;i<40;i++)collectQuimeraStars(g);assert.ok(!g._quimeraStarPocket.taken.has(88));assert.equal(g._quimeraStarPocket.lures.size,0);g._quimeraStarPocket.lures.set(91,{x:0,y:0});collectQuimeraStars(g);assert.equal(g._quimeraStarPocket.lures.size,0);
});
test('V700 watcher holds firing range, retreats nearby, and carries leap warnings through snapshots',()=>{
 const g=scene(3);for(let i=0;i<80;i++)updateQuimeraPressure(g.boss,g);const m=g.boss._fusion.pressure.minions[0];Object.assign(m,{kind:'eclipse-watcher',mode:'wait',cooldown:999,x:g.player.x+250});updateQuimeraPressure(g.boss,g);assert.equal(m.vx,0);m.x=g.player.x+80;updateQuimeraPressure(g.boss,g);assert.ok(m.vx>0);m.x=g.player.x+450;updateQuimeraPressure(g.boss,g);assert.ok(m.vx<0);assert.equal(finaleEnemy(g.boss)._fusion.pressure.minions[0].leapWarn,true);
});
test('V700 recovery meter matches actual recovery duration and mercy warning includes its extra time',()=>{
 const g=scene();Object.assign(g.boss._fusion,{mode:'attack',clock:1,attack:'plasma'});updateFusionBoss(g.boss,g);assert.equal(g.boss._fusion.mode,'rest');assert.equal(g.boss._fusion.restMax,g.boss._fusion.rest);
 g.world1Boss=createWorld1BossDirector(g.boss);g.player.health=1;Object.assign(g.boss._fusion,{mode:'warn',attack:'rayos',clock:78,warnMax:78});updateWorld1BossDirector(g);assert.equal(g.boss._fusion.clock,100);assert.equal(g.boss._fusion.warnMax,100);
});
test('V700 compact HUD clears touch controls and support accessibility reports state without countdown spam',()=>{
 const g=scene();updateQuimeraArena(g);g.quimeraArena.shield=90;g._quimeraStarPocket={chain:2};const a=quimeraSupportText(g);g.quimeraArena.shield=1;assert.equal(quimeraSupportText(g),a);assert.match(a,/Escudo.*2 de 3/);for(const h of[568,700,844]){const p=world1BossHealthLayout(320,h);assert.ok(p.by+60<h-200);}
});

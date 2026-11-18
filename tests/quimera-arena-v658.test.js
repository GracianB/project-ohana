import test from'node:test';import assert from'node:assert/strict';
import{QUIMERA_ANCHORS as anchors,updateQuimeraArena,interactQuimeraArena,quimeraArenaPrompt,absorbQuimeraArenaHit}from'../systems/quimera-arena.js';
import{ECLIPSE_ECHOES,eclipseLife}from'../systems/quimera-eclipse.js';
import{packSave,unpackSave}from'../systems/save.js';
import{adventureRoomProgress,mergeAdventureProgress,applyAdventureProgress}from'../multiplayer/adventure-progress.js';
import{WORLD1_FLOOR as F,WORLD1_ROOMS}from'../systems/world1-rooms.js';
function scene(){return{roomId:'w1-final',roomDef:WORLD1_ROOMS['w1-final'],player:{id:'kilo',x:anchors[0].x-16,y:F-48,w:32,h:48,vy:2,grounded:true,xp:17,evo:1},boss:{_fusionBoss:true,hp:2800,_fusion:{mode:'rest'}},world1Boss:{grace:0},platforms:[],secrets:{},save(){this.saves=(this.saves||0)+1;}};}
test('three prisms build nine real steps without duplicate platforms or growth rewards',()=>{
 const g=scene(),before={...g.player};for(const q of anchors){g.player.x=q.x-16;assert.equal(interactQuimeraArena(g),true);}for(let i=0;i<10;i++)updateQuimeraArena(g);
 assert.equal(g.platforms.length,9);assert.equal(g.quimeraArena.awakened.length,3);assert.equal(g.saves,3);assert.equal(g.player.xp,before.xp);assert.equal(g.player.evo,before.evo);assert.equal(g.boss.hp,2800);
});
test('prism shield absorbs exactly one hit, has cooldown and grants brief grace',()=>{
 const g=scene();updateQuimeraArena(g);assert.match(quimeraArenaPrompt(g),/^E/);interactQuimeraArena(g);assert.match(quimeraArenaPrompt(g),/recarga/);assert.equal(absorbQuimeraArenaHit(g,12),true);assert.equal(absorbQuimeraArenaHit(g,12),false);assert.equal(g.world1Boss.grace,20);interactQuimeraArena(g);assert.equal(g.quimeraArena.shield,0);
 for(let i=0;i<600;i++)updateQuimeraArena(g);interactQuimeraArena(g);assert.ok(g.quimeraArena.shield>0);
});
test('saved moon paths survive real save serialization while shields remain transient',()=>{
 const g=scene();interactQuimeraArena(g);const restored=scene();restored.secrets=unpackSave(packSave(g,{snapshot:()=>({})}),'kilo').secrets;updateQuimeraArena(restored);assert.equal(restored.platforms.length,3);assert.equal(restored.quimeraArena.shield,0);
});
test('air current assists airborne entry and never takes ground control',()=>{
 const g=scene();interactQuimeraArena(g);g.player.x=anchors[0].x+260-16;updateQuimeraArena(g);assert.equal(g.player.vy,2);g.player.grounded=false;g.player.y=F-170;updateQuimeraArena(g);assert.equal(g.player.vy,-3.7);
});
test('prisms cannot activate in another room or before the boss introduction ends',()=>{
 const g=scene();g.roomId='w1-kilo';assert.equal(interactQuimeraArena(g),false);updateQuimeraArena(g);assert.equal(g.platforms.length,0);g.roomId='w1-final';g.boss._fusion.mode='intro';assert.equal(interactQuimeraArena(g),false);
});
test('cooperative prism progress shares only authored paths, never boss defeat or seals',()=>{
 const g=scene();interactQuimeraArena(g);const payload=adventureRoomProgress(g);payload.secrets.push('w1-final-boss-defeated');payload.sealed=true;const progress=mergeAdventureProgress(null,payload,{roomId:'w1-final',host:false});assert.deepEqual(progress.seals,[]);assert.deepEqual(progress.secrets['w1-final'],['w1-final-eclipse-west']);const peer=scene();peer.onlineAdventure=true;applyAdventureProgress(peer,progress);updateQuimeraArena(peer);assert.equal(peer.platforms.length,3);assert.equal(peer.quimeraArena.shield,0);
});
test('fifty echoes represent five presences per hero; eclipse follows the player and freezes decorative time',()=>{
 assert.equal(ECLIPSE_ECHOES.length,50);assert.equal(new Set(ECLIPSE_ECHOES.map(e=>e.id)).size,50);for(const hero of new Set(ECLIPSE_ECHOES.map(e=>e.hero)))assert.equal(ECLIPSE_ECHOES.filter(e=>e.hero===hero).length,5);
 const o={phase:4,x:200,y:200,radius:150,boss:scene().boss,player:{x:300,y:320,w:32,h:48},reduce:true};assert.deepEqual(eclipseLife({...o,time:0}),eclipseLife({...o,time:900}));assert.ok(eclipseLife(o).lookX>0);assert.ok(eclipseLife({...o,player:{...o.player,x:0}}).lookX<0);
});

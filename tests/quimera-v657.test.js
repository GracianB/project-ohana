import test from 'node:test';import assert from 'node:assert/strict';
import{createFusionBoss,updateFusionBoss,updateFusionProjectilesOnly}from'../systems/fusion-boss.js';
import{WORLD1_FLOOR as F}from'../systems/world1-rooms.js';
function scene(){const boss=createFusionBoss(657);boss._fusion.mode='rest';boss._fusion.rest=999;const player={x:boss.x-300,y:F-48,w:32,h:48,grounded:true};return{boss,player};}
test('Quimera sounds announce one preparation and one release, never every frame',()=>{
 const g=scene(),b=g.boss._fusion,sounds=[];b.rest=1;b.deck=['plasma'];b.deckPhase=1;
 for(let i=0;i<90;i++)updateFusionBoss(g.boss,g,{beep:s=>sounds.push(s)});
 assert.deepEqual(sounds,['whoosh','plasma']);
});
test('Quimera impact particles are bounded and expire without dealing damage',()=>{
 const g=scene(),b=g.boss._fusion,hits=[];
 b.shots=Array.from({length:90},(_,id)=>({id,k:'orb',x:g.player.x+16,y:g.player.y+24,r:14,vx:0,vy:0,life:80,dmg:1,col:'#aabbcc'}));
 updateFusionProjectilesOnly(g.boss,g,d=>hits.push(d));assert.equal(b.fx.length,32);assert.equal(b.shots.length,0);assert.equal(hits.length,90);
 for(let i=0;i<30;i++)updateFusionProjectilesOnly(g.boss,g,d=>hits.push(d));assert.equal(b.fx.length,0);assert.equal(hits.length,90);
});
test('phase transitions and defeat clear decorative bursts together with hazards',()=>{
 for(const hp of[1800,0]){const g=scene(),b=g.boss._fusion;b.fx=[{x:1,y:2,age:0}];b.shots=[{k:'orb',x:1,y:2,r:1,vx:0,vy:0,life:1}];g.boss.hp=hp;updateFusionBoss(g.boss,g);assert.deepEqual(b.fx,[]);assert.deepEqual(b.shots,[]);}
});

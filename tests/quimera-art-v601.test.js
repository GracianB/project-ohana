import test from 'node:test';import assert from 'node:assert/strict';
import {quimeraPose}from '../systems/quimera-art.js';
import{drawWorld1BossOverlay,createWorld1BossDirector,updateWorld1BossDirector}from '../systems/world1-boss.js';
test('Quimera metamorphoses preserve combat geometry and reduced motion',()=>{
 const e={phase:1,hp:100,x:1,y:2,w:230,h:290,_fusion:{mode:'rest',clock:10}};const before=JSON.stringify(e);
 assert.deepEqual(quimeraPose(e,10,true),quimeraPose(e,99,true));quimeraPose(e,12);assert.equal(JSON.stringify(e),before);
 const phases=[1,2,3,4].map(phase=>quimeraPose({...e,phase},12));assert.deepEqual(phases.map(p=>p.spread),[0,1/3,2/3,1]);
 for(const mode of ['attack','charge','leap','special'])assert.equal(quimeraPose({...e,_fusion:{mode}},12).strike,1);
});
test('the Quimera director relinquishes every overlay to the final films',()=>{
 const ctx=new Proxy({},{get(){throw Error('stale boss overlay attempted to paint');}});
 drawWorld1BossOverlay(ctx,{world1Cine:{id:'ending'}},1000,700);
 drawWorld1BossOverlay(ctx,{world1Boss:{done:true}},1000,700);
 const boss={hp:0,_fusionBoss:true,_fusion:{shots:[]},x:0,y:0,w:230,h:290};const g={boss,world1Boss:createWorld1BossDirector(boss)};g.world1Boss.special={};g.world1Boss.card={};g.world1Boss.hitFlash=3;
 updateWorld1BossDirector(g);assert.equal(g.world1Boss.special,null);assert.equal(g.world1Boss.card,null);assert.equal(g.world1Boss.hitFlash,0);
});

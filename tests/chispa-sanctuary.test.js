import test from 'node:test';import assert from 'node:assert/strict';
import {ROSTER} from '../characters/roster.js';
import {useAbility,updateAbilityFx,clearAbilityFx} from '../systems/abilities.js';
import {chispaKit,chispaMarked,chispaStormTarget} from '../systems/chispa-kit.js';
import {chispaAssistBeat} from '../systems/chispa-stagecraft.js';
import {chispaSpriteMotion} from '../characters/art/chispa-sprite.js';
import {startStitchoDuet,updateStitchoDuet,readStitchoDuet} from '../systems/stitcho-duet.js';
import {capturePeerEffects,applyPeerEffects,advancePeerEffects} from '../systems/coop-peer-effects.js';
function fixture(evo=4){
 const d=ROSTER.find(r=>r.id==='chispin'),f=d.forms[evo];
 return {player:{...d,...f,evo,x:100,y:300,facing:1,vx:0,vy:0,health:f.hp,maxHealth:f.hp,cds:{},cdDur:{}},
 t:100,roomId:'hub',cam:{x:0,y:0},enemies:[{x:230,y:300,w:24,h:30,hp:10000,max:10000}],platforms:[{x:0,y:360,w:1000,h:40}],
 projectiles:[],ghosts:[],slashes:[],bolts:[],fx:{emit(){}},nums:{add(){}},rng:()=>.5};
}
test('J marks real hits for 150 simulation ticks across every evolution',()=>{
 for(let evo=0;evo<5;evo++){
  clearAbilityFx();const g=fixture(evo);assert.equal(useAbility(g,0),true);
  const e=g.enemies[0];assert.ok(e.hp<10000);assert.equal(e._chispaMarkUntil,250);
  assert.ok(chispaMarked(e,249));assert.equal(chispaMarked(e,250),false);
  assert.ok(chispaKit(evo).targets<=5);
 }clearAbilityFx();
});
test('L prioritizes an in-range mark and consumes its bonus, allowing integer damage rounding',()=>{
 const near={x:50,y:50,w:20,h:20,hp:100},marked={x:500,y:50,w:20,h:20,hp:100,_chispaMarkUntil:200};
 assert.equal(chispaStormTarget([near,marked],0,50,100),marked);
 assert.equal(chispaStormTarget([near,marked],0,50,200),near);
 assert.equal(chispaStormTarget([{...marked,x:900}],0,50,100),null);
 const damage=[];
 for(const mark of [false,true]){
  clearAbilityFx();const g=fixture(),e=g.enemies[0];e.x=125;if(mark)e._chispaMarkUntil=250;
  assert.equal(useAbility(g,2),true);
  for(let i=0;i<12;i++){g.t++;updateAbilityFx(g);}
  damage.push(10000-e.hp);if(mark)assert.equal(e._chispaMarkUntil,0);
 }assert.ok(damage[0]>0);assert.ok(Math.abs(damage[1]-damage[0]*1.2)<=1);clearAbilityFx();
});
test('Recasting replaces the sanctuary instead of stacking autonomous damage',()=>{
 clearAbilityFx();const g=fixture();useAbility(g,2);g.t+=1000;g.player.cds={};
 assert.equal(useAbility(g,2),true);updateAbilityFx(g);
 assert.equal(g.chispinAbilityFx.filter(f=>f.kind==='storm').length,1);clearAbilityFx();
});
test('Surprise Chispa performs for six seconds but cannot strike after frame 90',()=>{
 const g=fixture();g.player.id='stitcho';g.player.uSurprise=true;
 startStitchoDuet(g);let hits=0;const hit=()=>{hits++;return true;};
 for(let i=0;i<102;i++)updateStitchoDuet(g,hit);const before=hits;
 for(let i=102;i<359;i++)updateStitchoDuet(g,hit);
 assert.equal(hits,before);assert.ok(readStitchoDuet(g._stitchoDuet));
 const peer={roomId:'hub'};assert.ok(applyPeerEffects(peer,capturePeerEffects(g,1,'chispa')));
 advancePeerEffects(peer);assert.equal(peer.coopPeerEffects.stitchoDuet,null);
 updateStitchoDuet(g,hit);updateStitchoDuet(g,hit);assert.equal(g._stitchoDuet,null);
});
test('Animation respects anatomy and reduced motion; assistant phases are explicit',()=>{
 for(let form=0;form<5;form++)for(const state of ['idle','run','attack','cast','hurt']){
  for(const t of [0,20,50,100]){
   const m=chispaSpriteMotion({form,state,t,phase:t*.2,atk:.5,cast:.5});
   assert.ok(Object.values(m).every(Number.isFinite));assert.ok(m.sx>.9&&m.sx<1.1);
   assert.deepEqual(chispaSpriteMotion({form,state,t,reduceMotion:true}),{x:0,y:0,rotation:0,sx:1,sy:1});
  }
 }
 assert.equal(chispaAssistBeat({age:10}).stage,'arrival');
 assert.equal(chispaAssistBeat({age:26}).stage,'ritual');
 assert.equal(chispaAssistBeat({age:66}).impact,true);
 assert.equal(chispaAssistBeat({age:160}).stage,'encore');
 assert.equal(chispaAssistBeat({age:320}).stage,'farewell');
});

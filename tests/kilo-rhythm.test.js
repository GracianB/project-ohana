import test from 'node:test';
import assert from 'node:assert/strict';
import {earnKiloPetal,kiloPetals,spendKiloPetals} from '../systems/kilo-rhythm.js';
globalThis.window=globalThis; globalThis.addEventListener ||= ()=>{};
const {useAbility,clearAbilityFx,updateAbilityFx}=await import('../systems/abilities.js');
function game(evo=0){return {player:{id:'kilo',evo,x:100,y:200,w:24,h:34,facing:1,health:30,maxHealth:100,abilities:['ukulele','hula','ohana'],cds:{},cdDur:{},xp:0,vx:0,vy:0},enemies:[],projectiles:[],ghosts:[],platforms:[],roomId:'hub',worldW:1600,worldH:900,cam:{x:0,y:0},t:0,score:0,reduceMotion:true,fx:{emit(){}},nums:{add(){}}};}
test('petals reward distinct successful attacks, cap at three and expire safely',()=>{
 const g=game(),attack={};
 assert.equal(earnKiloPetal(g,attack),true); assert.equal(earnKiloPetal(g,attack),false);
 for(let i=0;i<8;i++)earnKiloPetal(g,{});
 assert.equal(kiloPetals(g),3);g.t=241;assert.equal(kiloPetals(g),0);
 earnKiloPetal(g,{});g.roomId='next';assert.equal(kiloPetals(g),0);
 earnKiloPetal(g,{});g.player.dead=true;assert.equal(kiloPetals(g),0);
});
test('K spends petals once, expands real geometry and cooldown cannot consume new petals',()=>{
 for(let evo=0;evo<5;evo++){
  clearAbilityFx(); const g=game(evo);for(let i=0;i<3;i++)earnKiloPetal(g,{});
  assert.equal(useAbility(g,1),true);assert.equal(kiloPetals(g),0);updateAbilityFx(g);
  assert.equal(g.kiloAbilityFx.find(f=>f.kind==='hula').r,70+evo*6);
  earnKiloPetal(g,{});assert.equal(useAbility(g,1),false);assert.equal(kiloPetals(g),1);
 }
 clearAbilityFx();
});
test('J earns one petal per volley even with many notes and targets',()=>{
 clearAbilityFx();const g=game(4);
 g.enemies=Array.from({length:4},()=>({x:130,y:190,w:50,h:50,hp:1000,max:1000}));
 useAbility(g,0);assert.equal(kiloPetals(g),0);
 for(let i=0;i<8;i++){g.t++;updateAbilityFx(g);}
 assert.equal(kiloPetals(g),1);clearAbilityFx();assert.equal(kiloPetals(g),0);
});
test('L remains local, consumes petals and never repeatedly damages a target',()=>{
 clearAbilityFx(); const g=game(4);for(let i=0;i<3;i++)earnKiloPetal(g,{});
 const near={x:200,y:200,w:24,h:24,hp:1000},far={x:1300,y:200,w:24,h:24,hp:1000};g.enemies=[near,far];
 const hits=[];g.onAbilityHit=e=>hits.push(e);useAbility(g,2);
 assert.equal(kiloPetals(g),0);assert.equal(g.player.health,91);
 for(let i=0;i<50;i++){g.t++;updateAbilityFx(g);}
 assert.equal(hits.filter(e=>e===near).length,1);assert.equal(far.hp,1000);
 assert.equal(spendKiloPetals(g),0);clearAbilityFx();
});

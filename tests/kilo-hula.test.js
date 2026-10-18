import test from 'node:test';
import assert from 'node:assert/strict';
import {kiloHulaPose} from '../characters/art/lilo.js';
import {earnKiloPetal,kiloPetals} from '../systems/kilo-rhythm.js';
globalThis.window=globalThis;globalThis.addEventListener ||= ()=>{};
const {useAbility,updateAbilityFx,clearAbilityFx}=await import('../systems/abilities.js');
function game(evo=0){return {player:{id:'kilo',evo,x:100,y:200,w:24,h:34,facing:1,health:30,maxHealth:100,abilities:['ukulele','hula','ohana'],cds:{},cdDur:{},xp:0,vx:0,vy:0},enemies:[],projectiles:[],ghosts:[],platforms:[],roomId:'hub',worldW:1600,worldH:900,cam:{x:0,y:0},t:0,score:0,fx:{emit(){}},nums:{add(){}}};}
test('hula has opposite weight transfers, grounded steps, finite five-form poses and still reduced motion',()=>{
 for(let f=0;f<5;f++){
  assert.ok(kiloHulaPose(.4,f).hip>0);assert.ok(kiloHulaPose(1.2,f).hip<0);
  assert.deepEqual(kiloHulaPose(0,f,true),kiloHulaPose(2.3,f,true));
  for(const t of [0,.4,.8,1.2,1.6,NaN,Infinity]){
   const b=kiloHulaPose(t,f);assert.ok(Object.values(b).flat().every(Number.isFinite));
   assert.ok(Math.abs(b.hip)<=6&&b.step>=0&&b.heel>=0);
  }
 }
});
test('dance strikes on four beats only, reflects immediately and rewards one opening parry',()=>{
 for(let evo=1;evo<5;evo++){
  clearAbilityFx();const g=game(evo),near={x:110,y:200,w:24,h:24,hp:1000},far={x:900,y:200,w:24,h:24,hp:1000};
  g.enemies=[near,far];for(let i=0;i<3;i++)earnKiloPetal(g,{});
  g.projectiles=Array.from({length:3},()=>({x:110,y:210,w:6,h:6,vx:-4,vy:0,life:100,owner:'enemy'}));
  const hits=[];g.onAbilityHit=()=>hits.push(g.t);useAbility(g,1);
  for(let i=1;i<=96;i++){g.t=i;updateAbilityFx(g);if(i===1){assert.equal(kiloPetals(g),1);assert.ok(g.projectiles.every(p=>p.owner==='player'&&p.vx===4));}}
  assert.deepEqual(hits,[24,48,72,96]);assert.equal(far.hp,1000);assert.equal(g.kiloAbilityFx.length,0);
 }
 clearAbilityFx();
});

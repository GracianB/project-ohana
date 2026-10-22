import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {useAbility,updateAbilityFx,clearAbilityFx,abilityPreMove} from '../systems/abilities.js';
import {MICHI_L_SHOTS,michiLaunchFrame,michiShotAnchors,drawMichiTailShot} from '../systems/michi-tail-shots.js';
import {michiLaunchKick} from '../characters/michi-anatomy.js';

const game=evo=>({player:{id:'cat',abilities:['yarn','purr','ninetails'],x:100,y:260,w:28,h:34,facing:1,evo,speed:5,jumpPower:12,grounded:true,vy:0,vx:0,health:90,maxHealth:200,cds:{},cdDur:{},dead:false,xp:0,michiSeed:7},
 enemies:[{x:420,y:260,w:34,h:40,hp:5000,max:5000,kind:'cucaracho',dying:false,invuln:0,vx:0,vy:0,stun:0,flash:0,evo:0}],
 projectiles:[],ghosts:[],platforms:[{x:0,y:300,w:900,h:40}],cam:{x:0,y:0},worldW:1600,worldH:900,t:0,reduceMotion:true,shake:0,flash:0,nums:{add(){}},fx:{emit(){}}});

test('V462 L fires one shot per tentacle: 7 for the Medusa, 5 for the Dragón, 9 for the Guardian',()=>{
 assert.deepEqual([...MICHI_L_SHOTS],[3,4,7,5,9]);
 for(const evo of [2,3,4]){
  clearAbilityFx();const g=game(evo);assert.ok(useAbility(g,2));g.t++;updateAbilityFx(g);
  const wisps=(g.michiAbilityFx||[]).filter(f=>f.kind==='wisp'&&f.tail);
  assert.equal(wisps.length,MICHI_L_SHOTS[evo],'evo '+evo);
 }
 clearAbilityFx();
});

test('V462 L shots launch from tentacle tips in a ripple and the tentacles whip on cue',()=>{
 const n=9,frames=[...Array(n)].map((_,i)=>michiLaunchFrame(i,n));
 assert.ok(frames.every((f,i)=>!i||f>frames[i-1]),'staggered launch');assert.ok(frames.at(-1)<=26,'inside the 26-frame cast pose');
 for(let i=0;i<n;i++){const peak=michiLaunchKick(i,n,(frames[i]+4.5)/26);assert.ok(peak>.9,'tentacle '+i+' whips as its shot leaves');
  assert.ok(michiLaunchKick(i,n,(frames[i]-3)/26)<0,'coils back first');}
 const p={x:100,y:200,w:28,h:34,facing:-1};
 for(let f=0;f<5;f++){const a=michiShotAnchors(p,f);assert.equal(a.length,MICHI_L_SHOTS[f]);assert.ok(a.every(q=>[q.x,q.y,q.ang].every(Number.isFinite)));}
});

test('V462 L keeps total damage and still hits',()=>{
 clearAbilityFx();const g=game(4);useAbility(g,2);
 for(let i=0;i<80;i++){g.t++;abilityPreMove(g,{left:false,right:false,jump:false});updateAbilityFx(g);}
 assert.ok(g.enemies[0].hp<5000);clearAbilityFx();
});

test('V462 L wake is transparent layered alpha: no gradients, no additive blend, no RNG',()=>{
 const log={grad:0,comp:[],alpha:[]};
 const ctx=new Proxy({globalAlpha:1},{get(t,k){if(k==='createLinearGradient'||k==='createRadialGradient')return()=>{log.grad++;return{addColorStop(){}}};if(k in t)return t[k];return()=>{};},
  set(t,k,v){if(k==='globalCompositeOperation')log.comp.push(v);if(k==='globalAlpha')log.alpha.push(v);t[k]=v;return true;}});
 for(let form=0;form<5;form++)for(const delay of [0,3]){
  const trail=[...Array(20)].map((_,i)=>({x:i*6,y:Math.sin(i*.4)*8}));
  drawMichiTailShot(ctx,{x:126,y:0,vx:6,vy:1,trail,form,idx:1,age:30,delay,delay0:5,color:'#9fe8ff',accent:'#ffe6a8'},{x:0,y:0},30);
 }
 assert.equal(log.grad,0);assert.ok(!log.comp.includes('lighter'));
 assert.ok(Math.min(...log.alpha)<.2,'wake has see-through layers');
 const src=readFileSync(new URL('../systems/michi-tail-shots.js',import.meta.url),'utf8');
 assert.doesNotMatch(src,/Math\.random|create(Linear|Radial)Gradient/);
});

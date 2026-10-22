import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import kilo from '../characters/art/lilo.js';
import {R} from '../characters/rig.js';

// V462 regression: in the companion panel Kilo's idle arms folded into a "C"
// hook over the dress (hand only ~73% of arm reach from the shoulder) and the
// back-slung ukulele floated beside her with no strap.
const ctx=()=>new Proxy({globalAlpha:1,lineWidth:1},{get(t,k){
 if(k in t)return t[k];
 if(k==='createLinearGradient'||k==='createRadialGradient')return()=>({addColorStop(){}});
 if(k==='measureText')return()=>({width:10});
 return()=>{};},set(t,k,v){t[k]=v;return true;}});
function arms(form,state='idle',t=40,extra={}){
 const limbs=[],strokes=[];
 const spy={...R,limb:(c,...a)=>{limbs.push(a);return R.limb(c,...a);}};
 const c=ctx();
 kilo.draw(c,{state,t,phase:t*.2,form,breath:0,sway:0,look:{x:0,y:0},speed:0,flourish:0,atk:0,cast:0,castSlot:-1,...extra},spy);
 // Arms are the IK limbs rooted at the shoulders x=4 (front) and x=-5 (back).
 return limbs.filter(a=>a[0]===4||a[0]===-5).map(([x1,y1,cx,cy,x3,y3])=>{
  const chord=Math.hypot(x3-x1,y3-y1),mx=(x1+x3)/2,my=(y1+y3)/2;
  return {front:x1===4,elbowX:cx-mx,bulge:Math.hypot(cx-mx,cy-my)/Math.max(1,chord),hand:[x3,y3],shoulder:[x1,y1]};
 });
}

test('V462 Kilo idle arms hang naturally in every form (no C-hook elbow)',()=>{
 for(let f=0;f<5;f++){
  const a=arms(f);
  const front=a.find(x=>x.front),back=a.find(x=>!x.front);
  assert.ok(front&&back,'both arms drawn F'+f);
  for(const arm of [front,back]){
   assert.ok(arm.bulge<.62,`F${f} elbow bulge ${arm.bulge.toFixed(2)} folds the arm into a hook`);
   assert.ok(arm.hand[1]>arm.shoulder[1]+8,'hand hangs below the shoulder');
  }
  assert.ok(front.hand[0]>front.shoulder[0]+4,'front hand clears the dress, F'+f);
  assert.ok(back.hand[0]<back.shoulder[0]-4,'back hand peeks out behind, F'+f);
 }
});

test('V462 Kilo arms stay connected and finite across all states',()=>{
 for(let f=0;f<5;f++)for(const st of ['idle','run','jump','fall','attack','cast','hurt','victory'])for(const t of [12,40,97]){
  const a=arms(f,st,t);
  if(f===0&&st==='run')continue; // baby Kilo crawls on all fours (separate rig)
  assert.ok(a.length>=1,`${st} F${f} draws arms`);
  for(const x of a)assert.ok([...x.hand,x.bulge].every(Number.isFinite));
 }
});

test('V462 back-slung ukulele hangs from a strap',()=>{
 const src=readFileSync(new URL('../characters/art/lilo.js',import.meta.url),'utf8');
 assert.match(src,/if \(r\.uke === "back"\) kiloUkeStrap\(/);
 assert.doesNotMatch(src.slice(src.indexOf('export function kiloUkeStrap')),/create(Linear|Radial)Gradient|Math\.random/);
});

test('V462 panel ukulele pose: strumming hand on the sound hole, elbow out in front',()=>{
 for(let f=1;f<5;f++)for(const time of [2.4,3.5,5.2,7]){
  const front=arms(f,'idle',Math.floor(time*60),{kiloPerformance:{kind:'relic',time}}).find(a=>a.front);
  assert.ok(front,'front arm F'+f);
  assert.ok(front.hand[0]<12,'hand strums on the uke body, not floating at x=19');
  assert.ok(front.elbowX>0,'elbow points forward, no C-loop across the chest F'+f);
 }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {legJoint,tailPoints,drawCatMouth,drawFairyWing,drawCatLeg} from '../characters/michi-anatomy.js';
import {ROSTER} from '../characters/roster.js';
import cat from '../characters/art/cat.js';

function rec(){
 const log={grad:0,ops:{},fills:new Set()};
 const c=new Proxy({globalAlpha:1,lineWidth:1},{get(t,k){
  if(k==='createLinearGradient'||k==='createRadialGradient')return()=>{log.grad++;return{addColorStop(){}};};
  if(k in t)return t[k];
  return(...a)=>{log.ops[k]=(log.ops[k]||0)+1;};
 },set(t,k,v){if(k==='fillStyle')log.fills.add(String(v));t[k]=v;return true;}});
 return {c,log};
}
const pose=(state,t,form,extra={})=>({state,t,phase:t*.2,form,cast:.5,atk:.5,castSlot:2,look:{x:.3,y:0},speed:1,flourish:0,michiSeed:42,...extra});
const src=readFileSync(new URL('../characters/art/cat.js',import.meta.url),'utf8');

test('V462 two-bone legs keep bone lengths and bend the requested way',()=>{
 for(const [hip,paw] of [[[0,0],[4,18]],[[10,-30],[18,1]],[[0,0],[30,0]]]){
  const k=legJoint(hip,paw,12,12,-1);
  assert.ok(Math.abs(Math.hypot(k[0]-hip[0],k[1]-hip[1])-12)<1e-6,'upper bone length');
  const far=Math.hypot(paw[0]-hip[0],paw[1]-hip[1])<24;
  if(far)assert.ok(Math.abs(Math.hypot(paw[0]-k[0],paw[1]-k[1])-12)<1e-3,'lower bone length');
 }
 const a=legJoint([0,0],[0,20],12,12,1),b=legJoint([0,0],[0,20],12,12,-1);
 assert.ok(Math.sign(a[0])!==Math.sign(b[0]),'knee vs hock bend opposite');
});

test('V462 tails: fixed root, follow-through tip, frozen with reduced motion',()=>{
 const o={x:-14,y:-24,len:50,dir:-2.95,curl:.75};
 const a=tailPoints({...o,t:10}),b=tailPoints({...o,t:60});
 assert.deepEqual(a[0],b[0]);assert.notDeepEqual(a.at(-1),b.at(-1));
 assert.deepEqual(tailPoints({...o,t:10,still:true}),tailPoints({...o,t:900,still:true}));
 let len=0;for(let i=1;i<a.length;i++)len+=Math.hypot(a[i][0]-a[i-1][0],a[i][1]-a[i-1][1]);
 assert.ok(Math.abs(len-50)<.5,'tail keeps its length while swishing');
});

test('V462 cat mouth opens with tongue and fangs; closed mouth still reads as ω',()=>{
 const closed=rec(),open=rec();
 drawCatMouth(closed.c,{open:0});drawCatMouth(open.c,{open:1,fangs:true});
 assert.ok(!closed.log.fills.has('#ff8fb3'));assert.ok(open.log.fills.has('#ff8fb3')&&open.log.fills.has('#fffaf0'));
 assert.ok(closed.log.ops.quadraticCurveTo>=4,'ω lips');
});

test('V462 F1 is the Hada Felina: wings, antennae, flower crown, wand-tail — distinct from the kitten',()=>{
 const p=ROSTER.find(x=>x.id==='cat');
 assert.equal(p.forms[1].name,'Hada Felina');assert.equal(p.evoNames[1],'Hada Felina');
 for(const key of ['FAIRY CAT','drawFairyWing','Antennae','Flower crown','Wand-tail','Pixie dust'])assert.ok(src.includes(key),key);
 const ops=f=>{const r=rec();cat.draw(r.c,pose('idle',60,f),{});return r.log;};
 const kitten=ops(0),fairy=ops(1);
 const curves=o=>(o.ops.bezierCurveTo||0)+(o.ops.quadraticCurveTo||0)+(o.ops.ellipse||0);
 assert.ok(curves(fairy)>curves(kitten)+10,'fairy wings add a new silhouette');
 assert.ok([...fairy.fills].filter(x=>!kitten.fills.has(x)).length>=6,'fairy palette differs from kitten');
 // Wing beat: airborne flaps faster than idle hover.
 const wing=t=>{const tr=[];const c=new Proxy({},{get:(_,k)=>k==='scale'||k==='rotate'?(...a)=>tr.push(a.map(v=>v.toFixed(3)).join()):()=>{},set:()=>true});
  drawFairyWing(c,{x:0,y:0,side:1,size:60,open:1,flap:Math.sin(t*.3)});return tr.join('|');};
 assert.notEqual(wing(3),wing(8),'wings beat');
});

test('Fourth-form moon hare opens its mouth on attack',()=>{
 const idle=rec(),atk=rec();
 cat.draw(idle.c,pose('idle',30,3),{});cat.draw(atk.c,pose('attack',30,3),{});
 assert.ok(atk.log.fills.has('#2a0f2e')&&atk.log.fills.has('#ff7fae'),'open roar with tongue');

});

test('V462 every form x state renders gradient-free with articulated legs',()=>{
 for(let f=0;f<5;f++)for(const st of ['idle','run','jump','fall','glide','wall','attack','cast','hurt','victory','dead'])for(const reduceMotion of [false,true]){
  const r=rec();assert.doesNotThrow(()=>cat.draw(r.c,pose(st,77,f,{reduceMotion}),{}),f+'/'+st);
  assert.equal(r.log.grad,0);
 }
 assert.ok(src.split('drawCatLeg(').length>=4,'remaining feline forms retain articulated legs');
 assert.doesNotMatch(readFileSync(new URL('../characters/michi-anatomy.js',import.meta.url),'utf8'),/Math\.random|create(Linear|Radial)Gradient/);
});

test('Moon hare replaces the serpent while preserving the fourth evolution slot',()=>{
 assert.match(src,/if\(f===3\).*MOON HARE/);
 assert.equal(ROSTER.find(x=>x.id==='cat').forms[3].name,'Conejornio Lunar');
 const a=rec();cat.draw(a.c,pose('run',30,3),{});assert.equal(a.log.grad,0);
});

test('V462 fairy wisp-lights are seeded and orbit the Hada Felina',()=>{
 assert.match(src,/Wisp-lights: three seeded fairy fireflies/);
 const fills=s=>{const r=rec();cat.draw(r.c,pose('idle',60,1,{michiSeed:s}),{});return [...r.log.fills].sort().join();};
 assert.equal(fills(7),fills(7),'deterministic per seed');
});

test('V462 polish: lilac cat legs — haunches over the body on F0/F3, dancer legs on F1, paws scale up',()=>{
 const f0=src.slice(src.indexOf('MOON KITTEN'),src.indexOf('FAIRY CAT'));
 assert.ok(f0.indexOf("oval(0,-21,21,18")<f0.indexOf('drawCatHaunch('),'F0 hind legs drawn over the body, not hidden behind it');
 assert.match(src,/drawMoonHare\(ctx,pose\)/,'fourth form uses its own rabbit anatomy');
 assert.match(src.slice(src.indexOf('FAIRY CAT')),/pawS:1\.25/);
 for(const f of [0,1,3]){const a=rec(),b=rec();cat.draw(a.c,pose('run',10,f),{});cat.draw(b.c,pose('run',30,f),{});assert.equal(a.log.grad,0);}
});

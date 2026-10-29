import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {moonHarePose,hareLegJoint,drawMoonHare,moonHareFace} from '../characters/michi-moon-hare.js';
import cat from '../characters/art/cat.js';
import {ROSTER} from '../characters/roster.js';

function record(p){
 const ops=[];const c=new Proxy({},{get:(_,k)=>k==='createLinearGradient'?((...args)=>{ops.push([k,...args]);return{addColorStop(...stops){ops.push(['addColorStop',...stops]);}};}):(...args)=>{for(const a of args)if(typeof a==='number')assert.ok(Number.isFinite(a),k);ops.push([k,...args]);},set:(_,k,v)=>{ops.push(['set',k,v]);return true;}});
 drawMoonHare(c,p);return JSON.parse(JSON.stringify(ops));
}
test('rabbit hock preserves both bones at valid reaches and never yields nonfinite joints',()=>{
 for(const paw of[{x:0,y:7},{x:-15,y:2},{x:8,y:-12}]){
  const hip={x:-22,y:-23},j=hareLegJoint(hip,paw,18,20);
  assert.ok(Math.abs(Math.hypot(j.x-hip.x,j.y-hip.y)-18)<.001);
  assert.ok(Math.abs(Math.hypot(j.x-paw.x,j.y-paw.y)-20)<.001);
 }
 for(const paw of[{x:-22,y:-23},{x:10000,y:-10000}]){const j=hareLegJoint({x:-22,y:-23},paw,18,20);assert.ok(Number.isFinite(j.x)&&Number.isFinite(j.y));}
});
test('all rabbit actions and six power performances have distinct articulated poses',()=>{
 const signatures=new Set();for(const state of['idle','run','jump','fall','glide','wall','attack','cast','hurt','victory','dead']){
  const p={state,t:73,phase:1.1,atk:.5,cast:.5,castSlot:0};const sig=JSON.stringify(record(p));assert.ok(!signatures.has(sig),state);signatures.add(sig);
 }
 const powers=new Set();for(let index=0;index<6;index++)powers.add(JSON.stringify(record({state:'cast',t:73,cast:.5,michiPowerIndex:index})));
 assert.equal(powers.size,6,'J/K/L/I/P/U cannot share one generic cast drawing');
 const early=moonHarePose({state:'attack',atk:.1}),peak=moonHarePose({state:'attack',atk:.5});assert.ok(peak.frontX>early.frontX);
});
test('reduced motion freezes every action and malformed clocks never reach Canvas',()=>{
 for(const state of['idle','run','jump','fall','glide','wall','attack','cast','hurt','victory','dead']){
  assert.deepEqual(record({state,t:10,phase:1,atk:.2,cast:.2,reduceMotion:true}),record({state,t:200,phase:5,atk:.8,cast:.8,reduceMotion:true}),state);
  assert.doesNotThrow(()=>record({state,t:Infinity,phase:NaN,atk:NaN,cast:Infinity,land:NaN,look:{x:Infinity}}));
 }
});
test('rabbit renderer keeps body vectors pure; its eyes use the shared hero iris renderer',()=>{
 const pose=Object.freeze({state:'run',t:44,phase:1,speed:1,look:Object.freeze({x:1,y:0})});assert.doesNotThrow(()=>record(pose));
 const src=fs.readFileSync(new URL('../characters/michi-moon-hare.js',import.meta.url),'utf8');assert.doesNotMatch(src,/create(?:Linear|Radial)Gradient|shadowBlur|drawImage|Math\.random|localStorage/);
 const def=ROSTER.find(x=>x.id==='cat');assert.equal(def.forms[3].name,'Conejornio Lunar');assert.equal(def.forms[3].w,36);assert.equal(def.forms[3].h,34);
});
// V625 explicitly reopens the artwork of all five forms. The old trace hashes
// are retained as historical evidence, not as a freeze on the user's redesign.
test('the rabbit nose belongs between two eyes on the same facial plane',()=>{
 for(const state of ['idle','run','jump','attack','cast','hurt','victory']){
  const face=moonHareFace({state,t:73});
  assert.ok(face.far.x<face.nose.x&&face.nose.x<face.near.x,'a frontal pair must not accompany a profile snout');
  assert.ok(Math.abs(face.far.y-face.near.y)<2,'eyes follow one brow plane');
  assert.ok(face.nose.y>face.near.y&&face.nose.y>face.far.y,'nose belongs below the brow');
  assert.ok(face.far.rx<face.near.rx,'far eye foreshortens in a three-quarter view');
 }
 assert.equal(moonHareFace({state:'hurt'}).closed,true);
});

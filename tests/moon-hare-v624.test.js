import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import {moonHarePose,hareLegJoint,drawMoonHare} from '../characters/michi-moon-hare.js';
import cat from '../characters/art/cat.js';
import {ROSTER} from '../characters/roster.js';

function record(p){
 const ops=[];const c=new Proxy({},{get:(_,k)=>(...args)=>{for(const a of args)if(typeof a==='number')assert.ok(Number.isFinite(a),k);ops.push([k,...args]);},set:(_,k,v)=>{ops.push(['set',k,v]);return true;}});
 drawMoonHare(c,p);return ops;
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
test('rabbit renderer is pure and uses no gradients, blur, raster assets or world mutations',()=>{
 const pose=Object.freeze({state:'run',t:44,phase:1,speed:1,look:Object.freeze({x:1,y:0})});assert.doesNotThrow(()=>record(pose));
 const src=fs.readFileSync(new URL('../characters/michi-moon-hare.js',import.meta.url),'utf8');assert.doesNotMatch(src,/create(?:Linear|Radial)Gradient|shadowBlur|drawImage|Math\.random|localStorage/);
 const def=ROSTER.find(x=>x.id==='cat');assert.equal(def.forms[3].name,'Conejornio Lunar');assert.equal(def.forms[3].w,36);assert.equal(def.forms[3].h,34);
});
test('the three accepted fairy, medusa and Eclipse forms retain the exact V623 Canvas drawing traces',()=>{
 const baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/michi-other-forms-v623.json',import.meta.url),'utf8'));
 for(const [key,expected]of Object.entries(baseline).filter(([key])=>!key.startsWith("0/"))){
  const [f,state]=key.split('/'),ops=[];const c=new Proxy({},{get:(_,k)=>(...a)=>ops.push([k,...a]),set:(_,k,v)=>{ops.push(['set',k,v]);return true;}});
  cat.draw(c,{form:Number(f),state,t:73,phase:2.3,speed:1,cast:.45,atk:.5,castSlot:1,look:{x:.3,y:0},michiSeed:42},{});
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(ops)).digest('hex'),expected,key);
 }
});

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import Cuerno,{cuernoLegPose,cuernoManePose,cuernoTailPose,cuernoWingPose}
 from "../characters/art/cuerno.js";

const noop=()=>{};
function trace(form,state,phase=1.5,reduceMotion=false){
 const out={limbs:[],saves:0,restores:0};
 const ctx=new Proxy({},{get(o,key){
  if(key==="save")return()=>out.saves++;
  if(key==="restore")return()=>out.restores++;
  if(key in o)return o[key];
  return (...args)=>{for(const v of args)if(typeof v==="number")
   assert.ok(Number.isFinite(v),key+" nonfinite");};
 },set(o,k,v){o[k]=v;return true}});
 const R={limb:(_, ...args)=>{out.limbs.push(args);
  for(const n of args.slice(0,7))assert.ok(Number.isFinite(n));},
  eye:noop,mouth:noop,blush:noop,sparkle:noop};
 Cuerno.draw(ctx,{form,state,phase,t:185,speed:1,bounce:0,
  air:state==="jump",reduceMotion,cast:state==="cast"?.5:0,
  castSlot:3,flourish:0},R);
 assert.equal(out.saves,out.restores,"unbalanced Canvas state");
 return out;
}
test("V78 canon: two horn babies without legs and three four-legged equine forms",()=>{
 for(const form of [0,1,2,3,4])for(const state of
  ["idle","run","jump","cast","victory","hurt","dead"]){
  const a=trace(form,state);
  assert.equal(a.limbs.length,form<2?0:4,form+"/"+state);
  assert.deepEqual(a,trace(form,state));
 }
 for(const form of [2,3,4]){
  const running=trace(form,"run",.4).limbs.map(x=>x.slice(2,6));
  const later=trace(form,"run",2.4).limbs.map(x=>x.slice(2,6));
  const idle=trace(form,"idle",.4).limbs.map(x=>x.slice(2,6));
  assert.notDeepEqual(running,later,"gallop frozen");
  assert.notDeepEqual(running,idle,"no stride while running");
  assert.notDeepEqual(trace(form,"jump",.4).limbs,idle,"flight has no tucked hooves");
 }
});
test("V78 gait poses are bounded, predictable and safe in every state",()=>{
 for(const form of [2,3,4])for(const state of ["idle","run","jump","hurt","dead"])
 for(const phase of [-1e8,-12,0,.4,3,1e8,NaN])for(const far of [false,true]){
  const pose={state,phase,speed:999,air:state==="jump"};
  const p=cuernoLegPose(pose,form,300,Math.PI/3,far);
  assert.deepEqual(p,cuernoLegPose(pose,form,300,Math.PI/3,far));
  assert.ok(Object.values(p).every(Number.isFinite));
  assert.ok(Math.abs(p.reach)<=16);
  assert.ok(p.tuck>=0&&p.tuck<=15);
  assert.ok(p.hoofLift>=0&&p.hoofLift<=7);
  if(state==="hurt"||state==="dead")
   assert.deepEqual(p,{reach:0,tuck:0,kneeLift:0,hoofLift:0});
 }
 const art=fs.readFileSync("characters/art/cuerno.js","utf8");
 assert.doesNotMatch(art,/Math\.random|requestAnimationFrame|setInterval|new Image\(/);
});
test("V78 reactive locks, tail and wings respect reduced motion",()=>{
 for(const form of [2,3,4])for(const i of [0,1,2,3,4,5,6]){
  const idle=cuernoManePose({state:"idle"},form,100,i);
  const run=cuernoManePose({state:"run",phase:1,speed:1},form,100,i);
  const air=cuernoManePose({state:"jump",air:true},form,100,i);
  assert.ok([idle,run,air].every(n=>Number.isFinite(n)&&Math.abs(n)<=9));
  assert.notEqual(idle,run);
  assert.notEqual(idle,air);
  assert.equal(cuernoManePose({state:"run",reduceMotion:true},form,100,i),0);
 }
 for(const form of [3,4]){
  const w=cuernoWingPose({state:"jump",air:true,reduceMotion:true},form,100);
  assert.equal(w.open,1);assert.equal(w.flap,0);assert.equal(w.hinge,0);
 }
 for(const form of [2,3,4]){
  const t=cuernoTailPose({state:"idle",reduceMotion:true},form,100);
  assert.equal(t.swing,0);assert.equal(t.lift,0);
  assert.deepEqual(trace(form,"run",1,true),trace(form,"run",1,true));
 }
});

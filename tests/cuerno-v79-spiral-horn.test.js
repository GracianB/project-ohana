import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import Cuerno from "../characters/art/cuerno.js";

const src=fs.readFileSync("characters/art/cuerno.js","utf8");
const horn=src.split("function horn(ctx, len, color, wobble) {")[1]?.split("// F0 Cuernín:")[0]||"";
const noop=()=>{};
function sample(form,state){
 const calls={bezier:0,clip:0,saves:0,restores:0,limbs:0};
 const ctx=new Proxy({},{get(o,k){
  if(k==="save")return()=>calls.saves++;
  if(k==="restore")return()=>calls.restores++;
  if(k==="clip")return()=>calls.clip++;
  if(k==="bezierCurveTo")return(...args)=>{
   calls.bezier++;assert.ok(args.every(Number.isFinite));};
  if(k in o)return o[k];
  return (...args)=>{for(const v of args)if(typeof v==="number")
   assert.ok(Number.isFinite(v),k+" nonfinite");};
 },set(o,k,v){o[k]=v;return true}});
 const R={limb:()=>calls.limbs++,eye:noop,mouth:noop,blush:noop,sparkle:noop};
 Cuerno.draw(ctx,{form,state,t:220,phase:1.4,speed:.9,bounce:0,
   air:state==="jump",cast:state==="cast"?.55:0,castSlot:0},R);
 assert.equal(calls.saves,calls.restores);
 return calls;
}
test("V79 replaces the former lightning zigzag with a clipped equine horn",()=>{
 assert.match(horn,/bezierCurveTo/);
 assert.match(horn,/clip\(\)/);
 assert.match(horn,/height\*\.74/);
 assert.doesNotMatch(horn,/const side = i % 2|lineTo\(side \*/);
 for(const form of [2,3])for(const state of ["idle","run","jump","cast","victory","hurt","dead"]){
  const t=sample(form,state);
  assert.ok(t.bezier>12,"facial silhouette lost "+form+"/"+state);
  assert.ok(t.clip>=1,"spiral doesn't stay inside horn "+form+"/"+state);
  assert.equal(t.limbs,4);
  assert.deepEqual(t,sample(form,state));
 }
});
test("V79 watches system reduced-motion preference without timers or altering Dino",()=>{
 assert.match(src,/window\.matchMedia\("\(prefers-reduced-motion: reduce\)"\)/);
 assert.match(src,/CUERNO_MOTION_MEDIA\?\.matches/);
 assert.doesNotMatch(horn,/Math\.random|setInterval|new Image\(/);
 assert.deepEqual([sample(0,"idle").limbs,sample(1,"idle").limbs,
   sample(2,"idle").limbs,sample(3,"idle").limbs,sample(4,"idle").limbs],
   [0,0,4,4,4]);
});

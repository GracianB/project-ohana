import test from "node:test";
import assert from "node:assert/strict";
import Cuerno,{cuernoBalanceAnatomy,cuernoLegPose,cuernoWingPose,
 cuernoRitualBody,CUERNO_VISUAL_H} from "../characters/art/cuerno.js";
import {R} from "../characters/rig.js";
import {ROSTER} from "../characters/roster.js";
import {FAMILY_DUETS,FAMILY_DUET_LENGTH,FAMILY_DUET_BEATS} from "../systems/family-duets.js";
import {optionsForUPartner} from "../systems/u-partners.js";
class PathMock{moveTo(){}lineTo(){}bezierCurveTo(){}quadraticCurveTo(){}arc(){}ellipse(){}rect(){}closePath(){}addPath(){}}
globalThis.Path2D ||= PathMock;
const pose=(form,state="idle",extra={})=>({form,state,t:128,phase:1.2,speed:0,
 air:false,vy:0,land:0,brake:0,turnPulse:0,sway:0,bounce:0,breath:.2,
 look:{x:1,y:0},blink:0,atk:0,cast:0,castSlot:-1,hurt:0,
 flourish:0,flourishN:0,...extra});
function render(p){
 const data={globalAlpha:1,globalCompositeOperation:"source-over",fillStyle:"#fff",
 strokeStyle:"#fff",lineWidth:1,lineCap:"butt",lineJoin:"miter",font:"10px sans-serif",
 textAlign:"start",textBaseline:"alphabetic",shadowColor:"#000",shadowBlur:0,
 filter:"none",lineDashOffset:0};
 const methods=new Set(["arc","arcTo","beginPath","bezierCurveTo","clip",
 "closePath","ellipse","fill","fillRect","getLineDash","setLineDash",
 "isPointInPath","isPointInStroke","lineTo","measureText","moveTo",
 "quadraticCurveTo","restore","rotate","roundRect","save","scale",
 "stroke","strokeRect","translate","createLinearGradient","createRadialGradient"]);
 let stack=0,paints=0;const trace=[];
 const ctx=new Proxy(data,{get(o,k){if(k in o)return o[k];assert.ok(methods.has(k),"unknown Canvas op "+String(k));
 return (...args)=>{
  for(const v of args)if(typeof v==="number")assert.ok(Number.isFinite(v));
  if(k==="save")stack++;if(k==="restore")assert.ok(--stack>=0);
  if(k==="fill"||k==="stroke")paints++;
  if(["arc","ellipse","translate","rotate","scale","moveTo","lineTo",
   "bezierCurveTo","quadraticCurveTo"].includes(k))
   trace.push([k,...args.map(n=>typeof n==="number"?+n.toFixed(4):n)]);
  if(k==="getLineDash")return [];
  if(k==="measureText")return {width:0};
  if(k==="isPointInPath"||k==="isPointInStroke")return false;
  if(k==="createLinearGradient"||k==="createRadialGradient")
   return {addColorStop(x){assert.ok(Number.isFinite(x));}};
 };},set(o,k,v){assert.ok(k in o,"ctx property "+String(k));
 if(typeof v==="number")assert.ok(Number.isFinite(v));o[k]=v;return true;}});
 const before=JSON.stringify(p);Cuerno.draw(ctx,p,R);
 assert.equal(stack,0,"unbalanced Canvas stack");
 assert.equal(JSON.stringify(p),before,"art mutated the rig");
 assert.ok(paints>20&&trace.length>80&&trace.length<10000,"unbounded geometry");
 return JSON.stringify(trace);
}
test("V327 F0 horn and F1 orb gain balance without inventing hooves",()=>{
 for(const f of [0,1]){
  const base=cuernoBalanceAnatomy(pose(f,"run",{speed:1}),f);
  const turn=cuernoBalanceAnatomy(pose(f,"run",{speed:1,turnPulse:.85,brake:.9}),f);
  const landed=cuernoBalanceAnatomy(pose(f,"idle",{land:.9}),f);
  assert.equal(base.foreBrace,0);assert.equal(base.hindBrace,0);
  assert.equal(turn.foreBrace,0);assert.equal(turn.hindBrace,0);
  assert.ok(turn.brace>base.brace&&turn.hornTilt!==base.hornTilt);
  assert.ok(landed.lift>0);
  if(f===1)assert.ok(landed.sphereSquash>0);
  else assert.equal(landed.sphereSquash,0);
  assert.ok(Object.isFrozen(turn));
  assert.deepEqual(turn,cuernoBalanceAnatomy({...pose(f,"run",{speed:1,turnPulse:.85,brake:.9}),t:999999},f));
 }
});
test("V327 all four hoof trajectories brace with real weight distribution",()=>{
 for(const f of [2,3,4]){
  const clear=pose(f,"run",{speed:1,phase:1.3});
  const stop=pose(f,"run",{speed:1,phase:1.3,brake:.9,turnPulse:.8});
  const b=cuernoBalanceAnatomy(stop,f);
  assert.ok(b.foreBrace>b.hindBrace&&b.foreBrace>0);
  for(const clock of [Math.PI*.04,Math.PI*.55,Math.PI*1.04,Math.PI*1.74]){
   for(const far of [true,false]){
    const before=cuernoLegPose(clear,f,128,clock,far);
    const after=cuernoLegPose(stop,f,128,clock,far);
    assert.notDeepEqual(before,after);
    for(const v of Object.values(after))assert.ok(Number.isFinite(v));
   }
  }
  if(f>=3){
   assert.ok(cuernoWingPose(stop,f,128).open<cuernoWingPose(clear,f,128).open);
  }
  assert.equal(cuernoBalanceAnatomy(pose(f,"cast",{castSlot:3,cast:.5,brake:1}),f).brace,0);
  assert.equal(cuernoBalanceAnatomy(pose(f,"dead",{land:1}),f).settle,0);
 }
});
test("V327 five distinct real Canvas silhouettes and J/K/L/U survive all forms",()=>{
 const hero=ROSTER.find(x=>x.id==="cuerno");
 assert.equal(hero.forms.length,5);
 assert.deepEqual(CUERNO_VISUAL_H,[118,92,91,86,82]);
 const silhouettes=new Set();
 for(let f=0;f<5;f++){
  silhouettes.add(render(pose(f)));
  assert.notEqual(render(pose(f,"run",{speed:1})),
    render(pose(f,"run",{speed:1,brake:.9,turnPulse:.9})));
  assert.notEqual(render(pose(f)),render(pose(f,"idle",{land:.8})));
  const l=render(pose(f,"cast",{castSlot:2,cast:.56}));
  const u=render(pose(f,"cast",{castSlot:3,cast:.56}));
  assert.notEqual(l,u,"L/U must differ");
  for(const state of ["run","jump","fall","hurt","dead","victory"]){
   const p=pose(f,state);
   assert.equal(render(p),render(p));
  }
  for(const slot of [0,1,2,3])render(pose(f,"cast",{castSlot:slot,cast:.56,reduceMotion:true}));
 }
 assert.equal(silhouettes.size,5);
});
test("V327 retains Cuerno+Kilo, Ohana L, nine partners and original U ritual",()=>{
 assert.equal(FAMILY_DUETS.cuerno.ally,"kilo");
 assert.equal(FAMILY_DUETS.cuerno.borrowedL,"ohana");
 assert.equal(FAMILY_DUET_LENGTH,120);
 assert.deepEqual(FAMILY_DUET_BEATS,[42,66,90]);
 assert.equal(optionsForUPartner("cuerno").length,9);
 assert.ok(cuernoRitualBody(pose(4,"cast",{castSlot:3,cast:.56}),4).greet>.9);
});

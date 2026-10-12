import test from "node:test";
import assert from "node:assert/strict";
import Pizza,{pizzaOvenActing,pizzaMomentum} from "../characters/art/pizza.js";
import {R} from "../characters/rig.js";
import {ROSTER} from "../characters/roster.js";
import {FAMILY_DUETS,FAMILY_DUET_LENGTH,FAMILY_DUET_BEATS,familyDuetChoreography} from "../systems/family-duets.js";
import {optionsForUPartner} from "../systems/u-partners.js";
class PathMock{moveTo(){}lineTo(){}bezierCurveTo(){}quadraticCurveTo(){}arc(){}ellipse(){}rect(){}closePath(){}addPath(){}}
globalThis.Path2D ||= PathMock;
const pose=(form,state="idle",extra={})=>({form,state,t:126,phase:1.7,speed:0,vy:0,air:false,
 land:0,atk:0,cast:0,castSlot:-1,hurt:0,blink:0,nineLives:0,look:{x:1,y:0},
 sway:.1,bounce:.1,breath:.3,flourish:0,flourishN:0,evoT:0,squash:0,stretch:0,
 bodyTilt:0,headTilt:0,turnPulse:0,brake:0,impact:0,...extra});
function draw(p){
 const defaults={globalAlpha:1,globalCompositeOperation:"source-over",fillStyle:"#fff",strokeStyle:"#fff",
  lineWidth:1,lineCap:"butt",lineJoin:"miter",font:"10px sans-serif",
  textAlign:"start",textBaseline:"alphabetic",shadowColor:"#000",shadowBlur:0,filter:"none",lineDashOffset:0};
 const methods=new Set(["arc","arcTo","beginPath","bezierCurveTo","clip","closePath","ellipse",
  "fill","fillRect","getLineDash","setLineDash","isPointInPath","isPointInStroke","lineTo",
  "measureText","moveTo","quadraticCurveTo","restore","rotate","roundRect","save","scale",
  "stroke","strokeRect","translate","createLinearGradient","createRadialGradient"]);
 let level=0,drawn=0;const trace=[];
 const ctx=new Proxy(defaults,{
  get(o,k){if(k in o)return o[k];assert.ok(methods.has(k),"unknown ctx method "+String(k));
   return (...args)=>{
    for(const v of args)if(typeof v==="number")assert.ok(Number.isFinite(v),"non-finite "+String(k));
    if(k==="save")level++;if(k==="restore"){level--;assert.ok(level>=0);}
    if(k==="stroke"||k==="fill")drawn++;
    if(["arc","ellipse","rotate","scale","translate","lineTo","moveTo","bezierCurveTo","quadraticCurveTo"].includes(k))
      trace.push([k,...args.map(v=>typeof v==="number"?Number(v.toFixed(4)):v)]);
    if(k==="createLinearGradient"||k==="createRadialGradient")return {addColorStop(x){assert.ok(Number.isFinite(x)&&x>=0&&x<=1);}};
    if(k==="getLineDash")return [];
    if(k==="measureText")return {width:0};
    if(k==="isPointInPath"||k==="isPointInStroke")return false;
   };
  },
  set(o,k,v){assert.ok(k in o,"unknown ctx property "+String(k));
    if(typeof v==="number")assert.ok(Number.isFinite(v));
    o[k]=v;return true;}
 });
 const copy=JSON.stringify(p);Pizza.draw(ctx,p,R);
 assert.equal(level,0,"Canvas leak");assert.equal(JSON.stringify(p),copy,"rig pose mutation");
 assert.ok(drawn>25&&trace.length>70&&trace.length<6000,"invalid art density "+drawn+" "+trace.length);
 return JSON.stringify(trace);
}
test("V319 oven L visibly compresses, expands and recovers with no clock dependency",()=>{
 for(const form of [0,1,2,3,4]){
  const t=k=>pizzaOvenActing(pose(form,"cast",{castSlot:2,cast:k}));
  const a=t(.3),b=t(.6),c=t(1);
  assert.ok(a.load>.8&&a.burst<.01);
  assert.ok(b.burst>.99&&b.load<.01);
  assert.ok(c.recovery===1&&c.burst<.01);
  assert.ok(a.squash>1&&a.stretch<1);
  assert.ok(b.squash<1&&b.stretch>1);
  assert.ok(Object.isFrozen(a));
  assert.deepEqual(t(.6),pizzaOvenActing(pose(form,"cast",{castSlot:2,cast:.6,t:99999})));
  assert.equal(pizzaOvenActing(pose(form,"attack",{castSlot:2,cast:.6})),null);
 }
});
test("V319 5 distinct real Canvas silhouettes and H/J/K/L/U physical gestures",()=>{
 assert.equal(ROSTER.find(c=>c.id==="pizza").forms.length,5);
 assert.equal(ROSTER.find(c=>c.id==="pizza").abilities[2],"oven");
 const silhouettes=new Set();
 for(let form=0;form<5;form++){
   silhouettes.add(draw(pose(form)));
   const Learly=draw(pose(form,"cast",{castSlot:2,cast:.3}));
   const Lhit=draw(pose(form,"cast",{castSlot:2,cast:.6}));
   const Llate=draw(pose(form,"cast",{castSlot:2,cast:1}));
   const U=draw(pose(form,"cast",{castSlot:3,cast:.6}));
   const J=draw(pose(form,"cast",{castSlot:0,cast:.6}));
   const K=draw(pose(form,"cast",{castSlot:1,cast:.6}));
   const H=draw(pose(form,"attack",{atk:.6}));
   assert.notEqual(Learly,Lhit);assert.notEqual(Lhit,Llate);assert.notEqual(Lhit,U);
   assert.equal(new Set([H,J,K,Lhit,U]).size,5,"H/J/K/L/U anatomy distinct F"+form);
   for(const state of ["run","jump","fall","glide","hurt","dead","victory"])
     assert.equal(draw(pose(form,state)),draw(pose(form,state)),"deterministic "+state);
   const action=pizzaOvenActing(pose(form,"cast",{castSlot:3,cast:.6}));
   assert.ok(action.offer>.99);
   assert.equal(pizzaOvenActing(pose(form,"cast",{castSlot:2,cast:.6})).offer,0);
 }
 assert.equal(silhouettes.size,5);
});
test("V319 Pizza + Yomi's maw remains 120 ticks with free choice of nine allies",()=>{
 assert.equal(FAMILY_DUETS.pizza.ally,"yomi");
 assert.equal(FAMILY_DUETS.pizza.borrowedL,"maw");
 assert.equal(FAMILY_DUET_LENGTH,120);
 assert.deepEqual(FAMILY_DUET_BEATS,[42,66,90]);
 const options=optionsForUPartner("pizza");
 assert.equal(options.length,9);
 for(const option of options)for(const age of [0,24,42,66,90,118]){
  const frame=familyDuetChoreography({hero:"pizza",ally:option.id,
   x:160,y:240,age,evo:4,facing:1,bondRank:3},true);
  assert.equal(frame.ally,option.id);
  assert.equal(frame.borrowedL,option.borrowedL);
  assert.ok(Number.isFinite(frame.allyX)&&Number.isFinite(frame.allyY));
 }
});

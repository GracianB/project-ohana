import test from "node:test";
import assert from "node:assert/strict";
import Yomi,{yomiCastActing,yomiRitualState} from "../characters/art/yomi.js";
import {R} from "../characters/rig.js";
import {ROSTER} from "../characters/roster.js";
import {FAMILY_DUETS,FAMILY_DUET_LENGTH,FAMILY_DUET_BEATS,familyDuetChoreography} from "../systems/family-duets.js";
import {optionsForUPartner} from "../systems/u-partners.js";
class PathMock{moveTo(){}lineTo(){}bezierCurveTo(){}quadraticCurveTo(){}arc(){}ellipse(){}rect(){}closePath(){}addPath(){}}
globalThis.Path2D ||= PathMock;
const pose=(form,state="idle",extra={})=>({form,state,t:120,phase:1.7,speed:0,vy:0,
 land:0,atk:0,cast:0,castSlot:-1,hurt:0,blink:0,
 sway:.1,bounce:.1,breath:.3,look:{x:1,y:0},flourish:0,flourishN:0,
 turnPulse:0,brake:0,...extra});
function render(p){
 const values={globalAlpha:1,globalCompositeOperation:"source-over",fillStyle:"#fff",strokeStyle:"#fff",
   lineWidth:1,lineCap:"butt",lineJoin:"miter",font:"10px sans-serif",textAlign:"start",
   textBaseline:"alphabetic",shadowColor:"#000",shadowBlur:0,filter:"none",lineDashOffset:0};
 const methods=new Set(["arc","arcTo","beginPath","bezierCurveTo","clip","closePath","ellipse",
  "fill","fillRect","getLineDash","setLineDash","isPointInPath","isPointInStroke","lineTo",
  "measureText","moveTo","quadraticCurveTo","restore","rotate","roundRect","save","scale",
  "stroke","strokeRect","translate","createLinearGradient","createRadialGradient"]);
 let depth=0,count=0;const trace=[];
 const ctx=new Proxy(values,{
  get(o,key){if(key in o)return o[key];assert.ok(methods.has(key),"unknown "+String(key));
   return (...args)=>{
    for(const n of args)if(typeof n==="number")assert.ok(Number.isFinite(n),"invalid "+String(key));
    if(key==="save")depth++;if(key==="restore"){depth--;assert.ok(depth>=0);}
    if(key==="fill"||key==="stroke")count++;
    if(["arc","ellipse","moveTo","lineTo","translate","rotate","scale","bezierCurveTo","quadraticCurveTo"].includes(key))
      trace.push([key,...args.map(x=>typeof x==="number"?Number(x.toFixed(4)):x)]);
    if(key==="createLinearGradient"||key==="createRadialGradient")return {addColorStop(x){assert.ok(Number.isFinite(x));}};
    if(key==="measureText")return {width:0};
    if(key==="getLineDash")return [];
    if(key==="isPointInPath"||key==="isPointInStroke")return false;
   };
  },
  set(o,k,v){assert.ok(k in o,"unknown canvas property "+String(k));if(typeof v==="number")assert.ok(Number.isFinite(v));o[k]=v;return true;}
 });
 const frozen=JSON.stringify(p);Yomi.draw(ctx,p,R);
 assert.equal(depth,0,"unbalanced Canvas state");
 assert.equal(JSON.stringify(p),frozen,"renderer wrote pose");
 assert.ok(count>18&&trace.length>35&&trace.length<4000,"missing or unbounded real Canvas art");
 return JSON.stringify(trace);
}
test("V320 Yomi L maw and U lantern greeting have distinct pure acting",()=>{
 for(const f of [0,1,2,3,4]){
  const at=(slot,k)=>yomiCastActing(pose(f,"cast",{castSlot:slot,cast:k}));
  const ready=at(2,.3),bite=at(2,.57),recover=at(2,1);
  assert.ok(ready.load>.8&&ready.release<.01);
  assert.ok(bite.release>.99&&bite.load<.01);
  assert.ok(bite.maw>.85&&ready.maw<.15);
  assert.equal(recover.maw,0);
  assert.ok(at(3,.57).aurora>.99);
  assert.equal(at(2,.57).aurora,0);
  assert.notDeepEqual(at(3,.57),at(2,.57));
  assert.ok(Object.isFrozen(bite));
  assert.deepEqual(bite,yomiCastActing(pose(f,"cast",{castSlot:2,cast:.57,t:8000})));
 }
 assert.equal(yomiCastActing({state:"hurt",castSlot:2,cast:.5}),null);
 assert.equal(yomiCastActing({state:"cast",castSlot:99,cast:.5}),null);
});
test("V320 reduced motion retains static ritual stages, not disappearing character",()=>{
 for(let scene=0;scene<4;scene++){
  const p=pose(4,"idle",{flourishN:scene,flourish:.5,reduceMotion:true});
  const x=yomiRitualState(p);
  assert.ok(Object.isFrozen(x));
  assert.equal(x.reduced,true);
  assert.equal(x.scene,scene);
  assert.equal(x.phase,.5);
  assert.equal(x.alpha,1);
  assert.equal(yomiRitualState({...p,state:"hurt"}),null);
  assert.deepEqual(x,yomiRitualState({...p,t:30000}));
 }
});
test("V320 real Canvas: five silhouettes, J/K/L/U and reduced ritual are finite",()=>{
 assert.equal(ROSTER.find(x=>x.id==="yomi").forms.length,5);
 assert.equal(ROSTER.find(x=>x.id==="yomi").abilities[2],"maw");
 const forms=new Set();
 for(let form=0;form<5;form++){
  forms.add(render(pose(form)));
  const H=render(pose(form,"attack",{atk:.5}));
  const J=render(pose(form,"cast",{castSlot:0,cast:.5}));
  const K=render(pose(form,"cast",{castSlot:1,cast:.5}));
  const LA=render(pose(form,"cast",{castSlot:2,cast:.3}));
  const LB=render(pose(form,"cast",{castSlot:2,cast:.57}));
  const U=render(pose(form,"cast",{castSlot:3,cast:.57}));
  assert.notEqual(LA,LB,"maw telegraphs bite");
  assert.notEqual(LB,U,"U rainbow greeting not a second bite");
  assert.equal(new Set([H,J,K,LB,U]).size,5,"distinct action silhouettes F"+form);
  for(const st of ["run","jump","fall","glide","hurt","dead","victory"]){
   const p=pose(form,st,{land:0.2});
   assert.equal(render(p),render(p),"determinism "+st);
  }
  for(let scene=0;scene<4;scene++)render(pose(form,"idle",{flourish:.5,flourishN:scene,reduceMotion:true}));
 }
 assert.equal(forms.size,5);
});
test("V320 Cuerno rainbow borrowed L, 120-tick U, all nine choices preserved",()=>{
 assert.equal(FAMILY_DUETS.yomi.ally,"cuerno");
 assert.equal(FAMILY_DUETS.yomi.borrowedL,"rainbow");
 assert.equal(FAMILY_DUET_LENGTH,120);
 assert.deepEqual(FAMILY_DUET_BEATS,[42,66,90]);
 const options=optionsForUPartner("yomi");
 assert.equal(options.length,9);
 for(const opt of options)for(const age of [0,25,42,66,90,118]){
  const frame=familyDuetChoreography({hero:"yomi",ally:opt.id,x:220,y:300,
    age,evo:4,facing:1,bondRank:3},true);
  assert.equal(frame.ally,opt.id);assert.equal(frame.borrowedL,opt.borrowedL);
  assert.ok(Number.isFinite(frame.allyX)&&Number.isFinite(frame.allyY));
 }
});

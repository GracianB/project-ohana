import test from "node:test";
import assert from "node:assert/strict";
import Frita,{fritaBodyFollowThrough,fritaCookingActing} from "../characters/art/frita.js";
import {R} from "../characters/rig.js";
import {ROSTER} from "../characters/roster.js";
import {FAMILY_DUETS,FAMILY_DUET_BEATS,FAMILY_DUET_LENGTH} from "../systems/family-duets.js";
import {optionsForUPartner} from "../systems/u-partners.js";
class PathMock{moveTo(){}lineTo(){}bezierCurveTo(){}quadraticCurveTo(){}arc(){}ellipse(){}rect(){}closePath(){}addPath(){}}
globalThis.Path2D ||= PathMock;
const pose=(form,state="idle",extra={})=>({form,state,t:155,phase:1.1,speed:.9,
 land:0,turnPulse:0,brake:0,air:false,vy:0,sway:0,bounce:0,breath:.2,
 look:{x:1,y:0},hurt:0,blink:0,atk:0,cast:0,castSlot:-1,
 flourish:0,flourishN:0,evoT:0,...extra});
function render(p){
 const props={globalAlpha:1,globalCompositeOperation:"source-over",fillStyle:"#fff",
 strokeStyle:"#fff",lineWidth:1,lineCap:"butt",lineJoin:"miter",font:"10px sans-serif",
 textAlign:"start",textBaseline:"alphabetic",shadowColor:"#000",shadowBlur:0,
 filter:"none",lineDashOffset:0};
 const ops=new Set(["arc","arcTo","beginPath","bezierCurveTo","clip","closePath",
 "ellipse","fill","fillRect","getLineDash","setLineDash","isPointInPath",
 "isPointInStroke","lineTo","measureText","moveTo","quadraticCurveTo",
 "restore","rotate","roundRect","save","scale","stroke","strokeRect",
 "translate","createLinearGradient","createRadialGradient"]);
 let stack=0,drawn=0;const trace=[];
 const ctx=new Proxy(props,{
 get(o,k){if(k in o)return o[k];assert.ok(ops.has(k),"unknown op "+String(k));
 return (...args)=>{
  for(const v of args)if(typeof v==="number")assert.ok(Number.isFinite(v));
  if(k==="save")stack++;if(k==="restore")assert.ok(--stack>=0);
  if(k==="fill"||k==="stroke")drawn++;
  if(["ellipse","arc","moveTo","lineTo","bezierCurveTo","quadraticCurveTo","translate","rotate","scale"].includes(k))
    trace.push([k,...args.map(x=>typeof x==="number"?+x.toFixed(3):x)]);
  if(k==="createLinearGradient"||k==="createRadialGradient")return {addColorStop(x){assert.ok(Number.isFinite(x));}};
  if(k==="measureText")return {width:0};
  if(k==="getLineDash")return [];
  if(k==="isPointInPath"||k==="isPointInStroke")return false;
 };},
 set(o,k,v){assert.ok(k in o);if(typeof v==="number")assert.ok(Number.isFinite(v));o[k]=v;return true;}
 });
 const before=JSON.stringify(p);Frita.draw(ctx,p,R);
 assert.equal(stack,0);assert.equal(JSON.stringify(p),before);
 assert.ok(drawn>30&&trace.length>80&&trace.length<9500);
 return JSON.stringify(trace);
}
test("V324 five-weight body poses load shoes and counterturn the fry instead of just debris",()=>{
 for(let f=0;f<5;f++){
  const normal=fritaBodyFollowThrough(pose(f,"run",{speed:1,brake:0,turnPulse:0}),f);
  const turn=fritaBodyFollowThrough(pose(f,"run",{speed:1,brake:.8,turnPulse:.7}),f);
  const land=fritaBodyFollowThrough(pose(f,"idle",{land:.9}),f);
  assert.ok(Object.isFrozen(turn));
  assert.ok(turn.brace>normal.brace);
  assert.ok(turn.capeLag>normal.capeLag);
  assert.ok(turn.lean!==normal.lean);
  assert.ok(land.frontKnee>0&&land.rearKnee>0);
  assert.ok(land.settle>0);
  for(const v of Object.values(turn))assert.ok(Number.isFinite(v));
  assert.deepEqual(turn,fritaBodyFollowThrough({...pose(f,"run",{speed:1,brake:.8,turnPulse:.7}),t:999999},f));
 }
});
test("V324 safe states do not leave body follow-through running through hurt, slide or U",()=>{
 for(const state of ["hurt","dead","cast"]){
  const x=fritaBodyFollowThrough(pose(4,state,{land:1,brake:1,turnPulse:1,castSlot:3,cast:.55}),4);
  assert.equal(x.settle,0);assert.equal(x.lag,0);assert.equal(x.capeLag,0);
 }
 const slide=fritaBodyFollowThrough(pose(2,"run",{move:"slide",land:1,brake:1}),2);
 assert.equal(slide.brace,0);assert.equal(slide.capeLag,0);
 const broken=fritaBodyFollowThrough(pose(2,"run",{speed:Infinity,land:NaN,brake:-2,turnPulse:Infinity}),2);
 for(const val of Object.values(broken))assert.ok(Number.isFinite(val));
});
test("V324 all five Canvas bodies react physically to braking and landings; U has an actual offered fry",()=>{
 const chars=ROSTER.find(c=>c.id==="frita");
 assert.equal(chars.forms.length,5);
 assert.deepEqual(chars.abilities,["salt","ketchup","fryer"]);
 for(let f=0;f<5;f++){
  const base=render(pose(f,"run",{speed:1,phase:1.1}));
  const braking=render(pose(f,"run",{speed:1,phase:1.1,brake:.9,turnPulse:.8}));
  const idle=render(pose(f,"idle"));
  const landed=render(pose(f,"idle",{land:.9}));
  assert.notEqual(base,braking,"visible physical braking F"+f);
  assert.notEqual(idle,landed,"visible landing compression F"+f);
  const u0=render(pose(f,"cast",{castSlot:3,cast:.29}));
  const u1=render(pose(f,"cast",{castSlot:3,cast:.56}));
  assert.notEqual(u0,u1,"visible food handoff F"+f);
  for(const slot of [0,1,2,3])render(pose(f,"cast",{castSlot:slot,cast:.6,reduceMotion:true}));
  for(const state of ["attack","run","jump","fall","glide","hurt","dead","victory"]){
   const frame=pose(f,state,{atk:.5});
   assert.equal(render(frame),render(frame));
  }
 }
});
test("V324 original fryer L, Pizza's borrowed oven and all nine U partners remain",()=>{
 assert.equal(FAMILY_DUETS.frita.ally,"pizza");
 assert.equal(FAMILY_DUETS.frita.borrowedL,"oven");
 assert.deepEqual(FAMILY_DUET_BEATS,[42,66,90]);
 assert.equal(FAMILY_DUET_LENGTH,120);
 assert.equal(optionsForUPartner("frita").length,9);
 assert.ok(fritaCookingActing(pose(4,"cast",{castSlot:2,cast:.55})).jump<0);
 assert.ok(fritaCookingActing(pose(4,"cast",{castSlot:3,cast:.55})).offer>.9);
});

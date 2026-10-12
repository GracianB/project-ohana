import test from "node:test";
import assert from "node:assert/strict";
import Pizza,{pizzaDoughFollowThrough,pizzaOvenActing} from "../characters/art/pizza.js";
import {R} from "../characters/rig.js";
import {ROSTER} from "../characters/roster.js";
import {FAMILY_DUETS,FAMILY_DUET_LENGTH,FAMILY_DUET_BEATS} from "../systems/family-duets.js";
import {optionsForUPartner} from "../systems/u-partners.js";
class PathMock {moveTo(){}lineTo(){}bezierCurveTo(){}quadraticCurveTo(){}arc(){}ellipse(){}rect(){}closePath(){}addPath(){}}
globalThis.Path2D ||= PathMock;
const pose=(form,state="idle",extra={})=>({form,state,t:140,phase:1.2,speed:1,
 land:0,turnPulse:0,brake:0,air:false,vy:0,sway:.1,bounce:.1,breath:.3,
 look:{x:1,y:0},atk:0,cast:0,castSlot:-1,hurt:0,flourish:0,flourishN:0,...extra});
function paint(p){
 const state={globalAlpha:1,globalCompositeOperation:"source-over",fillStyle:"#fff",
 strokeStyle:"#fff",lineWidth:1,lineCap:"butt",lineJoin:"miter",font:"10px sans-serif",
 textAlign:"start",textBaseline:"alphabetic",shadowColor:"#000",shadowBlur:0,
 filter:"none",lineDashOffset:0};
 const methods=new Set(["arc","arcTo","beginPath","bezierCurveTo","clip","closePath",
 "ellipse","fill","fillRect","getLineDash","setLineDash","isPointInPath",
 "isPointInStroke","lineTo","measureText","moveTo","quadraticCurveTo",
 "restore","rotate","roundRect","save","scale","stroke","strokeRect",
 "translate","createLinearGradient","createRadialGradient"]);
 let level=0,count=0;const trace=[];
 const ctx=new Proxy(state,{get(o,k){if(k in o)return o[k];assert.ok(methods.has(k),"unknown op "+String(k));
 return (...args)=>{
  for(const v of args)if(typeof v==="number")assert.ok(Number.isFinite(v));
  if(k==="save")level++;if(k==="restore")assert.ok(--level>=0);
  if(k==="fill"||k==="stroke")count++;
  if(["ellipse","arc","rotate","scale","translate","moveTo","lineTo","bezierCurveTo","quadraticCurveTo"].includes(k))
    trace.push([k,...args.map(a=>typeof a==="number"?+a.toFixed(3):a)]);
  if(k==="createLinearGradient"||k==="createRadialGradient")
   return {addColorStop(x){assert.ok(Number.isFinite(x));}};
  if(k==="measureText")return {width:0};
  if(k==="getLineDash")return [];
  if(k==="isPointInPath"||k==="isPointInStroke")return false;
 };},
 set(o,k,v){assert.ok(k in o);if(typeof v==="number")assert.ok(Number.isFinite(v));o[k]=v;return true;}});
 const before=JSON.stringify(p);Pizza.draw(ctx,p,R);
 assert.equal(level,0);assert.equal(JSON.stringify(p),before);
 assert.ok(count>30&&trace.length>90&&trace.length<9000);
 return JSON.stringify(trace);
}
test("V325 all five dough weights respond to planted brakes, turn and landing",()=>{
 for(let f=0;f<5;f++){
  const idle=pizzaDoughFollowThrough(pose(f),f);
  const stop=pizzaDoughFollowThrough(pose(f,"run",{brake:.9,turnPulse:.7}),f);
  const land=pizzaDoughFollowThrough(pose(f,"idle",{land:1}),f);
  assert.ok(stop.drag>0&&stop.widen>idle.widen&&stop.cheese>0);
  assert.ok(land.stomp>0&&land.widen>1&&land.tall<1);
  assert.ok(land.frontKnee>0&&land.backKnee>0);
  assert.ok(Object.isFrozen(stop));
  assert.deepEqual(stop,pizzaDoughFollowThrough({...pose(f,"run",{brake:.9,turnPulse:.7}),t:999999},f));
  for(const value of Object.values(stop))assert.ok(Number.isFinite(value));
 }
});
test("V325 active casts and hurt/dead/bounce cannot introduce unrelated dough motion",()=>{
 for(const state of ["hurt","dead","cast","attack"]){
  const frame=pizzaDoughFollowThrough(pose(4,state,{land:1,brake:1,turnPulse:1}),4);
  assert.equal(frame.drag,0);assert.equal(frame.stomp,0);
 }
 assert.equal(pizzaDoughFollowThrough(pose(4,"run",{move:"bounce",brake:1,turnPulse:1}),4).drag,0);
 const malformed=pizzaDoughFollowThrough(pose(4,"run",{land:NaN,brake:Infinity,turnPulse:-1,speed:Infinity}),4);
 for(const value of Object.values(malformed))assert.ok(Number.isFinite(value));
});
test("V325 five Canvas silhouettes show actual knee and mozzarella deformation",()=>{
 const hero=ROSTER.find(x=>x.id==="pizza");
 assert.equal(hero.forms.length,5);
 assert.deepEqual(hero.abilities,["pepperoni","cheese","oven"]);
 const silhouettes=new Set();
 for(let f=0;f<5;f++){
  silhouettes.add(paint(pose(f)));
  assert.notEqual(paint(pose(f,"run",{speed:1})),
    paint(pose(f,"run",{speed:1,brake:.9,turnPulse:.9})),"braking body F"+f);
  assert.notEqual(paint(pose(f)),paint(pose(f,"idle",{land:.9})),"landing F"+f);
  assert.notEqual(paint(pose(f,"cast",{castSlot:3,cast:.3})),
    paint(pose(f,"cast",{castSlot:3,cast:.56})),"U hand-off F"+f);
  for(const state of ["idle","run","jump","fall","hurt","dead","victory"]){
   const x=pose(f,state);assert.equal(paint(x),paint(x));
  }
  for(const slot of [0,1,2,3])paint(pose(f,"cast",{castSlot:slot,cast:.56,reduceMotion:true}));
 }
 assert.equal(silhouettes.size,5);
});
test("V325 keeps Yomi maw as Pizza's borrowed L, 120 ticks and nine partners",()=>{
 assert.equal(FAMILY_DUETS.pizza.ally,"yomi");
 assert.equal(FAMILY_DUETS.pizza.borrowedL,"maw");
 assert.equal(FAMILY_DUET_LENGTH,120);
 assert.deepEqual(FAMILY_DUET_BEATS,[42,66,90]);
 assert.equal(optionsForUPartner("pizza").length,9);
 assert.ok(pizzaOvenActing(pose(4,"cast",{castSlot:3,cast:.56})).offer>.9);
});

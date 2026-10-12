import test from "node:test";
import assert from "node:assert/strict";
import Yomi,{yomiLanternBody,yomiCastActing,yomiRitualState} from "../characters/art/yomi.js";
import {R} from "../characters/rig.js";
import {ROSTER} from "../characters/roster.js";
import {FAMILY_DUETS,FAMILY_DUET_BEATS,FAMILY_DUET_LENGTH} from "../systems/family-duets.js";
import {optionsForUPartner} from "../systems/u-partners.js";
class PathMock{moveTo(){}lineTo(){}bezierCurveTo(){}quadraticCurveTo(){}arc(){}ellipse(){}rect(){}closePath(){}addPath(){}}
globalThis.Path2D ||= PathMock;
const pose=(form,state="idle",extra={})=>({form,state,t:145,phase:1.2,speed:.9,vy:0,
 air:false,land:0,turnPulse:0,brake:0,sway:.1,bounce:.2,breath:.3,blink:0,
 look:{x:1,y:0},cast:0,castSlot:-1,atk:0,hurt:0,flourish:0,flourishN:0,...extra});
function render(p){
 const data={globalAlpha:1,globalCompositeOperation:"source-over",fillStyle:"#fff",
 strokeStyle:"#fff",lineWidth:1,lineCap:"butt",lineJoin:"miter",font:"10px sans-serif",
 textAlign:"start",textBaseline:"alphabetic",shadowColor:"#000",shadowBlur:0,
 filter:"none",lineDashOffset:0};
 const methods=new Set(["arc","arcTo","beginPath","bezierCurveTo","clip","closePath","ellipse",
 "fill","fillRect","getLineDash","setLineDash","isPointInPath","isPointInStroke",
 "lineTo","measureText","moveTo","quadraticCurveTo","restore","rotate",
 "roundRect","save","scale","stroke","strokeRect","translate",
 "createLinearGradient","createRadialGradient"]);
 let stack=0,drawn=0;const trace=[];
 const ctx=new Proxy(data,{get(o,k){if(k in o)return o[k];assert.ok(methods.has(k),"canvas op "+String(k));
 return (...args)=>{
  for(const v of args)if(typeof v==="number")assert.ok(Number.isFinite(v),"nonfinite "+String(k));
  if(k==="save")stack++;if(k==="restore")assert.ok(--stack>=0);
  if(k==="stroke"||k==="fill")drawn++;
  if(["arc","ellipse","translate","rotate","scale","moveTo","lineTo",
   "bezierCurveTo","quadraticCurveTo"].includes(k))
   trace.push([k,...args.map(n=>typeof n==="number"?+n.toFixed(4):n)]);
  if(k==="getLineDash")return [];if(k==="measureText")return {width:0};
  if(k==="isPointInPath"||k==="isPointInStroke")return false;
  if(k==="createLinearGradient"||k==="createRadialGradient")return {addColorStop(x){assert.ok(Number.isFinite(x));}};
 };},set(o,k,v){assert.ok(k in o,"ctx property "+String(k));
 if(typeof v==="number")assert.ok(Number.isFinite(v));o[k]=v;return true;}});
 const orig=JSON.stringify(p);Yomi.draw(ctx,p,R);
 assert.equal(stack,0);assert.equal(JSON.stringify(p),orig);
 assert.ok(drawn>15&&trace.length>60&&trace.length<6000);
 return JSON.stringify(trace);
}
test("V326 anchored lantern form compresses, brakes and keeps a physical U",()=>{
 for(let form=0;form<5;form++){
  const idle=yomiLanternBody(pose(form),form);
  const brake=yomiLanternBody(pose(form,"run",{brake:.8,turnPulse:.6}),form);
  const land=yomiLanternBody(pose(form,"idle",{land:.9}),form);
  const maw=yomiLanternBody(pose(form,"cast",{castSlot:2,cast:.31}),form);
  const u=yomiLanternBody(pose(form,"cast",{castSlot:3,cast:.56}),form);
  assert.ok(brake.brace>idle.brace);
  assert.ok(land.width>1&&land.height<1);
  assert.ok(maw.width>1);
  assert.ok(u.heart>.9&&u.flameLift>3);
  assert.equal(yomiLanternBody(pose(form,"dead",{land:1,brake:1}),form).settle,0);
  assert.ok(Object.isFrozen(brake));
  assert.deepEqual(u,yomiLanternBody({...pose(form,"cast",{castSlot:3,cast:.56}),t:90000},form));
  for(const x of Object.values(u))assert.ok(Number.isFinite(x));
 }
});
test("V326 five actual painted guardians show attached sleeves and staged J/K/L/U",()=>{
 const hero=ROSTER.find(x=>x.id==="yomi");
 assert.equal(hero.forms.length,5);
 assert.deepEqual(hero.abilities,["ofuda","sleeve","maw"]);
 const silhouettes=new Set();
 for(let form=0;form<5;form++){
  silhouettes.add(render(pose(form)));
  assert.notEqual(render(pose(form)),render(pose(form,"idle",{land:.8})),"physical landing "+form);
  assert.notEqual(render(pose(form,"run",{brake:0})),render(pose(form,"run",{brake:1,turnPulse:.8})));
  const j=render(pose(form,"cast",{castSlot:0,cast:.56}));
  const k=render(pose(form,"cast",{castSlot:1,cast:.56}));
  const l=render(pose(form,"cast",{castSlot:2,cast:.56}));
  const u=render(pose(form,"cast",{castSlot:3,cast:.56}));
  assert.equal(new Set([j,k,l,u]).size,4);
  assert.notEqual(render(pose(form,"cast",{castSlot:3,cast:.31})),u);
  for(const state of ["run","jump","fall","glide","hurt","dead","victory"])
   assert.equal(render(pose(form,state)),render(pose(form,state)));
  for(const slot of [0,1,2,3])render(pose(form,"cast",{castSlot:slot,cast:.56,reduceMotion:true}));
 }
 assert.equal(silhouettes.size,5);
});
test("V326 Yomi rituals and Cuerno's borrowed rainbow remain supported",()=>{
 assert.equal(FAMILY_DUETS.yomi.ally,"cuerno");
 assert.equal(FAMILY_DUETS.yomi.borrowedL,"rainbow");
 assert.equal(FAMILY_DUET_LENGTH,120);
 assert.deepEqual(FAMILY_DUET_BEATS,[42,66,90]);
 assert.equal(optionsForUPartner("yomi").length,9);
 assert.ok(yomiCastActing(pose(4,"cast",{castSlot:3,cast:.56})).aurora>.9);
 assert.equal(yomiRitualState(pose(4,"idle",{flourish:.5,flourishN:2,reduceMotion:true})),null);
});

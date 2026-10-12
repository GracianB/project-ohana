import test from "node:test";
import assert from "node:assert/strict";
import Michi,{michiCastActing,michiBodyMechanics,MICHI_VISUAL_H} from "../characters/art/cat.js";
import {R} from "../characters/rig.js";
import {ROSTER} from "../characters/roster.js";
import {startMichiDuet,updateMichiDuet,readMichiDuet} from "../systems/michi-duet.js";
import {optionsForUPartner} from "../systems/u-partners.js";
class PathMock {moveTo(){}lineTo(){}bezierCurveTo(){}quadraticCurveTo(){}arc(){}ellipse(){}rect(){}closePath(){}addPath(){}}
globalThis.Path2D ||= PathMock;
const pose=(form,state="idle",extra={})=>({
 form,state,t:120,phase:1.5,speed:.8,vy:0,air:false,land:0,atk:0,cast:0,
 castSlot:-1,hurt:0,blink:0,nineLives:0,flourish:0,flourishN:0,
 sway:0,bounce:0,breath:.2,look:{x:1,y:0},bodyTilt:0,
 turnPulse:0,brake:0,reduceMotion:false,...extra
});
function render(p){
 const defaults={globalAlpha:1,globalCompositeOperation:"source-over",
 fillStyle:"#fff",strokeStyle:"#fff",lineWidth:1,lineCap:"butt",
 lineJoin:"miter",font:"10px sans-serif",textAlign:"start",
 textBaseline:"alphabetic",shadowColor:"#000",shadowBlur:0,
 filter:"none",lineDashOffset:0};
 const supported=new Set(["arc","arcTo","beginPath","bezierCurveTo","clip",
 "closePath","ellipse","fill","fillRect","getLineDash","setLineDash",
 "isPointInPath","isPointInStroke","lineTo","measureText","moveTo",
 "quadraticCurveTo","restore","rotate","roundRect","save","scale",
 "stroke","strokeRect","translate","createLinearGradient","createRadialGradient"]);
 let depth=0,paint=0;const strokes=[];
 const ctx=new Proxy(defaults,{
 get(o,k){if(k in o)return o[k];
  assert.ok(supported.has(k),"unknown Canvas method "+String(k));
  return (...args)=>{
   for(const a of args)if(typeof a==="number")assert.ok(Number.isFinite(a),
    "non-finite "+String(k)+" "+String(a));
   if(k==="save")depth++;
   if(k==="restore")assert.ok(--depth>=0,"save/restore underflow");
   if(k==="stroke"||k==="fill")paint++;
   if(["arc","ellipse","rotate","translate","scale","lineTo","moveTo",
      "bezierCurveTo","quadraticCurveTo"].includes(k))
     strokes.push([k,...args.map(a=>typeof a==="number"?+a.toFixed(4):a)]);
   if(k==="getLineDash")return [];
   if(k==="measureText")return {width:0};
   if(k==="isPointInStroke"||k==="isPointInPath")return false;
   if(k==="createLinearGradient"||k==="createRadialGradient")
    return {addColorStop(x){assert.ok(Number.isFinite(x));}};
  };
 },
 set(o,k,v){assert.ok(k in o,"Canvas property "+String(k));
  if(typeof v==="number")assert.ok(Number.isFinite(v));o[k]=v;return true;}
 });
 const snapshot=JSON.stringify(p);
 Michi.draw(ctx,p,R);
 assert.equal(depth,0,"unbalanced Canvas save/restore");
 assert.equal(JSON.stringify(p),snapshot,"art mutated authoritative pose");
 assert.ok(paint>20&&strokes.length>50&&strokes.length<8000,
 "missing or unbounded vector anatomy: "+paint+"/"+strokes.length);
 return JSON.stringify(strokes);
}
test("V323 four different physical J/K/L/U casts have loading, contact and recovery",()=>{
 for(const slot of [0,1,2,3]){
  const at=k=>michiCastActing(pose(4,"cast",{castSlot:slot,cast:k}));
  const load=at(.29),hit=at(.56),end=at(1);
  assert.ok(load.load>.8&&load.release<.01);
  assert.ok(hit.release>.99&&hit.load<.01);
  assert.equal(end.recovery,1);
  assert.equal(end.release,0);
  assert.ok(Object.isFrozen(hit));
  assert.deepEqual(hit,michiCastActing(pose(4,"cast",{castSlot:slot,cast:.56,t:999999})),
    "body cast does not depend on wall clock");
  assert.equal(hit.greet,slot===3?hit.release:0);
  assert.ok(Number.isFinite(hit.paw)&&Number.isFinite(hit.tailRoot));
 }
 assert.equal(michiCastActing(pose(4,"hurt",{castSlot:2,cast:.56})),null);
 assert.equal(michiCastActing(pose(4,"cast",{castSlot:4,cast:.56})),null);
 assert.notDeepEqual(michiCastActing(pose(4,"cast",{castSlot:2,cast:.56})),
   michiCastActing(pose(4,"cast",{castSlot:3,cast:.56})));
});
test("V323 feline gait braces in turns and landing, limits inputs and reduces motion",()=>{
 const running=michiBodyMechanics(pose(1,"run",{speed:1,phase:Math.PI/2}));
 const backward=michiBodyMechanics(pose(1,"run",{speed:1,phase:-Math.PI/2}));
 assert.ok(running.stride>.99&&backward.stride<-.99);
 assert.notEqual(running.forePaw,backward.forePaw);
 assert.ok(michiBodyMechanics(pose(1,"run",{brake:.8,turnPulse:.7})).brake>.7);
 assert.ok(michiBodyMechanics(pose(1,"idle",{land:.9})).squash>.14);
 assert.ok(michiBodyMechanics(pose(4,"cast",{castSlot:1,cast:.56})).breath>.05);
 assert.equal(michiBodyMechanics(pose(1,"idle",{reduceMotion:true})).breath,0);
 assert.ok(Object.isFrozen(running));
 for(const state of ["idle","run","jump","fall","hurt","dead","cast"]){
  const p=pose(3,state,{t:Infinity,speed:Infinity,land:NaN,brake:Infinity,turnPulse:NaN,castSlot:2,cast:Infinity});
  for(const n of Object.values(michiBodyMechanics(p)))assert.ok(Number.isFinite(n));
 }
});
test("V323 all five genuine silhouettes have joined limbs and distinct H/J/K/L/U",()=>{
 const hero=ROSTER.find(x=>x.id==="cat");
 assert.deepEqual(MICHI_VISUAL_H,[60,72,84,94,106]);
 assert.equal(hero.forms.length,5);
 assert.deepEqual(hero.abilities,["yarn","purr","ninetails"]);
 const idle=new Set();
 for(let f=0;f<5;f++){
  idle.add(render(pose(f)));
  const attacks=[
   render(pose(f,"attack",{atk:.55})),
   ...[0,1,2,3].map(slot=>render(pose(f,"cast",{castSlot:slot,cast:.56})))
  ];
  assert.equal(new Set(attacks).size,5,"distinct H/J/K/L/U F"+f);
  for(const slot of [0,1,2,3]){
   const early=render(pose(f,"cast",{castSlot:slot,cast:.29}));
   const hit=render(pose(f,"cast",{castSlot:slot,cast:.56}));
   const late=render(pose(f,"cast",{castSlot:slot,cast:1}));
   assert.notEqual(early,hit,"body load/contact F"+f+" slot"+slot);
   assert.notEqual(hit,late,"body recovery F"+f+" slot"+slot);
  }
  for(const state of ["run","jump","fall","wall","glide","hurt","dead","victory"]){
   const p=pose(f,state,{land:.75,turnPulse:.5,brake:.4});
   assert.equal(render(p),render(p),"deterministic "+state+" F"+f);
  }
  render(pose(f,"cast",{castSlot:2,cast:.56,reduceMotion:true}));
  render(pose(f,"cast",{castSlot:3,cast:.56,reduceMotion:true}));
  for(const age of [0,12,28,44,70,100,114])
   render(pose(f,"idle",{michiDuetAge:age,reduceMotion:true}));
 }
 assert.equal(idle.size,5);
});
test("V323 the U remains Michi+Dragon, local and exactly 120 ticks",()=>{
 const g={player:{id:"cat",x:100,y:200,w:24,h:30,evo:4,facing:1,vx:3,vy:-2},roomId:"hub",enemies:[]};
 assert.ok(startMichiDuet(g));assert.ok(readMichiDuet(g._michiDuet));
 for(let tick=0;tick<121;tick++)updateMichiDuet(g,()=>true);
 assert.equal(g._michiDuet,null);
 assert.equal(g.player.x,100);assert.equal(g.player.vx,3);assert.equal(g.player.vy,-2);
 assert.equal(optionsForUPartner("cat").length,9);
});

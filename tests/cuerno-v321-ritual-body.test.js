import test from "node:test";
import assert from "node:assert/strict";
import Cuerno,{cuernoRitualBody,cuernoWingPose,cuernoLegPose,cuernoMagicPose,CUERNO_VISUAL_H} from "../characters/art/cuerno.js";
import {R} from "../characters/rig.js";
import {ROSTER} from "../characters/roster.js";
import {FAMILY_DUETS,FAMILY_DUET_LENGTH,FAMILY_DUET_BEATS,familyDuetChoreography} from "../systems/family-duets.js";
import {optionsForUPartner} from "../systems/u-partners.js";
class PathMock{moveTo(){}lineTo(){}bezierCurveTo(){}quadraticCurveTo(){}arc(){}ellipse(){}rect(){}closePath(){}addPath(){}}
globalThis.Path2D ||= PathMock;
const pose=(form,state="idle",extra={})=>({form,state,t:140,phase:1.7,speed:0,vy:0,air:false,
 land:0,atk:0,cast:0,castSlot:-1,hurt:0,blink:0,nineLives:0,flourish:0,flourishN:0,
 sway:.1,bounce:.1,breath:.3,look:{x:1,y:0},turnPulse:0,brake:0,...extra});
function render(p) {
 const data={globalAlpha:1,globalCompositeOperation:"source-over",fillStyle:"#fff",strokeStyle:"#fff",
 lineWidth:1,lineCap:"butt",lineJoin:"miter",font:"10px sans-serif",textAlign:"start",
 textBaseline:"alphabetic",shadowColor:"#000",shadowBlur:0,filter:"none",lineDashOffset:0};
 const methods=new Set(["arc","arcTo","beginPath","bezierCurveTo","clip","closePath","ellipse","fill",
 "fillRect","getLineDash","setLineDash","isPointInPath","isPointInStroke","lineTo","measureText",
 "moveTo","quadraticCurveTo","restore","rotate","roundRect","save","scale","stroke","strokeRect",
 "translate","createLinearGradient","createRadialGradient"]);
 let stack=0,paints=0;const geometry=[];
 const ctx=new Proxy(data,{
   get(o,k){if(k in o)return o[k];assert.ok(methods.has(k),"unknown canvas op "+String(k));
    return (...args)=>{
     for(const v of args)if(typeof v==="number")assert.ok(Number.isFinite(v),"nonfinite "+String(k));
     if(k==="save")stack++;if(k==="restore"){stack--;assert.ok(stack>=0);}
     if(k==="fill"||k==="stroke")paints++;
     if(["arc","ellipse","rotate","translate","scale","moveTo","lineTo","bezierCurveTo","quadraticCurveTo"].includes(k))
       geometry.push([k,...args.map(x=>typeof x==="number"?Number(x.toFixed(4)):x)]);
     if(k==="createLinearGradient"||k==="createRadialGradient")return {addColorStop(x){assert.ok(Number.isFinite(x));}};
     if(k==="measureText")return {width:0};
     if(k==="getLineDash")return [];
     if(k==="isPointInPath"||k==="isPointInStroke")return false;
    };
   },
   set(o,k,v){assert.ok(k in o,"unknown ctx property "+String(k));if(typeof v==="number")assert.ok(Number.isFinite(v));o[k]=v;return true;}
 });
 const snapshot=JSON.stringify(p);Cuerno.draw(ctx,p,R);
 assert.equal(stack,0,"unbalanced canvas stack");
 assert.equal(JSON.stringify(p),snapshot,"art must not mutate rig state");
 assert.ok(paints>15&&geometry.length>35&&geometry.length<7000,"bounded vector art missing: "+paints+" / "+geometry.length);
 return JSON.stringify(geometry);
}
test("V321 L rainbow and U Ohana create distinct form-safe bodily anticipation",()=>{
 for(let form=0;form<5;form++){
  const at=(slot,k)=>cuernoRitualBody(pose(form,"cast",{castSlot:slot,cast:k}),form);
  const charge=at(2,.31),hit=at(2,.57),recover=at(2,1),u=at(3,.57);
  assert.ok(charge.load>.8&&charge.release<.01);
  assert.ok(hit.release>.99&&hit.load<.01);
  assert.equal(recover.recovery,1);
  assert.ok(Math.abs(recover.lift)<1e-9);
  assert.ok(charge.tilt<0&&hit.tilt>0);
  assert.ok(hit.lift<0&&u.lift<0);
  assert.equal(hit.greet,0);
  assert.ok(u.greet>.99);
  assert.notDeepEqual(hit,u,"different L and U postures");
  assert.ok(Object.isFrozen(hit));
  assert.deepEqual(hit,cuernoRitualBody(pose(form,"cast",{castSlot:2,cast:.57,t:90000}),form));
 }
 assert.equal(cuernoRitualBody({state:"hurt",castSlot:2,cast:.5},4),null);
 assert.equal(cuernoRitualBody({state:"cast",castSlot:0,cast:.5},4),null);
});
test("V321 equine forms brace through hooves and open wings after preparation",()=>{
 for(const form of [2,3,4]){
  const lo=pose(form,"cast",{castSlot:2,cast:.01,reduceMotion:true});
  const charge=pose(form,"cast",{castSlot:2,cast:.31,reduceMotion:true});
  const hit=pose(form,"cast",{castSlot:2,cast:.57,reduceMotion:true});
  const foot0=cuernoLegPose(lo,form,0,0,false);
  const foot1=cuernoLegPose(charge,form,0,0,false);
  assert.ok(foot1.kneeLift>foot0.kneeLift);
  assert.ok(foot1.hoofLift>foot0.hoofLift);
  if(form>=3){
    const wing0=cuernoWingPose(lo,form,0);
    const wing1=cuernoWingPose(hit,form,0);
    assert.ok(wing1.open>wing0.open);
    assert.ok(wing0.open<.35,"no full rainbow wing before action");
  }
 }
});
test("V321 all five real Canvas evolution silhouettes and full H/J/K/L/U states",()=>{
 assert.equal(ROSTER.find(x=>x.id==="cuerno").forms.length,5);
 assert.equal(ROSTER.find(x=>x.id==="cuerno").abilities[2],"rainbow");
 assert.deepEqual(CUERNO_VISUAL_H,[118,92,91,86,82]);
 const forms=new Set();
 for(let f=0;f<5;f++){
  forms.add(render(pose(f)));
  const L0=render(pose(f,"cast",{castSlot:2,cast:.31}));
  const L1=render(pose(f,"cast",{castSlot:2,cast:.57}));
  const U=render(pose(f,"cast",{castSlot:3,cast:.57}));
  assert.notEqual(L0,L1,"rainbow has body windup/contact F"+f);
  assert.notEqual(L1,U,"Ohana U cannot copy rainbow L");
  const actions=["attack","run","jump","fall","hurt","dead","victory"];
  for(const state of actions)assert.equal(render(pose(f,state)),render(pose(f,state)),"determinism "+state);
  for(const slot of [0,1,2,3])render(pose(f,"cast",{castSlot:slot,cast:.55,reduceMotion:true}));
 }
 assert.equal(forms.size,5,"horn baby, pearl face, foal, stellar and black Aurora stay distinct");
});
test("V321 Kilo's borrowed Ohana L, 120 ticks, rank3 and all alternative friends",()=>{
 assert.equal(FAMILY_DUETS.cuerno.ally,"kilo");
 assert.equal(FAMILY_DUETS.cuerno.borrowedL,"ohana");
 assert.equal(FAMILY_DUET_LENGTH,120);
 assert.deepEqual(FAMILY_DUET_BEATS,[42,66,90]);
 const opts=optionsForUPartner("cuerno");
 assert.equal(opts.length,9);
 for(const option of opts)for(const age of [0,24,42,66,90,118]){
  const frame=familyDuetChoreography({hero:"cuerno",ally:option.id,x:200,y:250,
   age,evo:4,facing:1,bondRank:3},true);
  assert.equal(frame.ally,option.id);
  assert.equal(frame.borrowedL,option.borrowedL);
  assert.ok(Number.isFinite(frame.allyX)&&Number.isFinite(frame.allyY));
 }
});

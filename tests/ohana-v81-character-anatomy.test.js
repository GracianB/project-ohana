import test from "node:test";
import assert from "node:assert/strict";
import Cuerno from "../characters/art/cuerno.js";
import Dino,{dinoNeckBridgePoints} from "../characters/art/dino.js";

function canvasAudit(){
 const hits=[],trace=[];
 const ctx=new Proxy({globalAlpha:1,saveDepth:0,maxDepth:0}, {
  get(o,k){
   if(k in o)return o[k];
   if(k==="save")return()=>{o.saveDepth++;o.maxDepth=Math.max(o.saveDepth,o.maxDepth);};
   if(k==="restore")return()=>{o.saveDepth--;assert.ok(o.saveDepth>=0,"Extra canvas restore");};
   if(k==="createRadialGradient"||k==="createLinearGradient")return()=>({addColorStop(){}});
   return (...args)=>{
    if(["moveTo","lineTo","arc","ellipse","quadraticCurveTo","bezierCurveTo","translate","rotate"].includes(k)){
      for(const v of args)if(typeof v==="number")assert.ok(Number.isFinite(v),k+" with NaN/Infinity");
      if(k==="ellipse")assert.ok(args[2]>=0&&args[3]>=0,"Negative radii");
      trace.push([k,...args.map(v=>typeof v==="number"?Number(v.toFixed(3)):v)]);
    }
   };
  },
  set(o,k,v){o[k]=v;return true;}
 });
 const R=new Proxy({
  INK:"#243725",LINE:3,
  lighten:c=>c,darken:c=>c,alpha:c=>c,volume:()=>"#9cc",
  swingLimb:(ctx,x,y,len,angle)=>[x+Math.sin(angle)*len,y+Math.cos(angle)*len],
  limb:(ctx,x,y,kx,ky,hx,hy)=>{hits.push(["limb",x,y,hx,hy]);},
  eye:(ctx,x,y,r,pose,opt)=>{hits.push(["eye",x,y,opt?.mood||""]);},
  mouth:(ctx,x,y,r,mood)=>{hits.push(["mouth",x,y,mood]);},
  sparkle:(ctx,x,y,r)=>{hits.push(["sparkle",x,y,r]);},
  blob:(ctx,points,color,options)=>{hits.push(["blob",points,color,options]);},
 },{get(o,k){return k in o?o[k]:()=>{}}});
 return {ctx,R,hits,trace,verify(){assert.equal(ctx.saveDepth,0,"Canvas save/restore leak");}};
}
function basicPose(form,state="idle",opts={}){
 return {form,state,t:115,phase:1.8,speed:.75,land:.35,bounce:.20,
   breath:.13,sway:.1,turnPulse:.22,brake:.14,look:{x:1,y:0},
   cast:0,castSlot:-1,atk:0,flourish:0,flourishN:0,...opts};
}

test("V81 Cuerno's five evolution renderers preserve U instead of showing hurt during the protected cast",()=>{
 for(let form=0;form<5;form++){
  const input={cast:.62,castSlot:3};
  const cast=canvasAudit(),protectedPose=canvasAudit();
  Cuerno.draw(cast.ctx,basicPose(form,"cast",input),cast.R);
  Cuerno.draw(protectedPose.ctx,basicPose(form,"hurt",input),protectedPose.R);
  cast.verify();protectedPose.verify();
  assert.deepEqual(protectedPose.trace,cast.trace,
    "Cuerno form "+form+": protected U must render the actual cast animation");
  assert.deepEqual(protectedPose.hits,cast.hits,
    "Cuerno form "+form+": protected U must preserve eyes and horn magic");
  const realPain=canvasAudit();
  Cuerno.draw(realPain.ctx,basicPose(form,"hurt",{cast:0,castSlot:3}),realPain.R);
  realPain.verify();
  assert.notDeepEqual(realPain.hits,cast.hits,
    "Cuerno form "+form+": real hurt without U must stay different");
 }
});

test("V81 Cuerno's equine forms connect all four legs and wings with finite soft joints",()=>{
 for(const form of [2,3,4]){
  for(const state of ["idle","run","jump","fall","cast","victory","hurt","dead"]){
   const a=canvasAudit();
   Cuerno.draw(a.ctx,basicPose(form,state,{
      air:state==="jump"||state==="fall",phase:3.5,
      cast:state==="cast"?.48:0,castSlot:state==="cast"?2:-1
    }),a.R);
   a.verify();
   assert.equal(a.hits.filter(h=>h[0]==="limb").length,4,
     "Cuerno F"+form+" must retain four fully articulated legs in "+state);
   const joints=a.trace.filter(t=>t[0]==="ellipse"&&Math.abs(t[3]-6.6)<.001);
   assert.equal(joints.length,2,
     "Both near leg sockets must blend with torso, F"+form+"/"+state);
   if(form>=3){
    const wingRoot=a.trace.filter(t=>t[0]==="bezierCurveTo"&&Math.abs(t[1]-(-8+(form===3?-6:0)))<.001);
    assert.ok(wingRoot.length>=1,"Forward wing socket missing F"+form);
   }
  }
 }
});

test("V81 Dino five forms keep finite neck anatomy across gestures and avoid a detached head",()=>{
 const dims=[
  {hw:31,hh:26,bw:17,bh:24},
  {hw:25,hh:19,bw:16,bh:24},
  {hw:25,hh:19,bw:17,bh:27},
  {hw:27,hh:20,bw:21,bh:30},
  {hw:26,hh:20,bw:20,bh:31}
 ];
 for(let form=1;form<=4;form++){
  const P=dims[form];
  for(const x of [-1000,0,22,1e9,NaN]){
   for(const y of [-1000,-35,Infinity]){
    const bridge=dinoNeckBridgePoints(P,x,y);
    assert.equal(bridge.length,5);
    for(const [px,py] of bridge){
      assert.ok(Number.isFinite(px)&&Number.isFinite(py));
      assert.ok(Math.abs(px)<P.bw*3&&Math.abs(py)<P.bh*4);
    }
   }
  }
  for(const state of ["idle","run","jump","fall","cast","attack","hurt","dead"]){
   const a=canvasAudit();
   Dino.draw(a.ctx,basicPose(form,state,{
     cast:state==="cast"?.56:0,castSlot:state==="cast"?3:-1
   }),a.R);
   a.verify();
   const bridge=a.hits.filter(h=>h[0]==="blob"&&h[1]?.length===5&&h[2]&&h[3]?.line===false);
   assert.equal(bridge.length,1,"Dino F"+form+" neck bridge missing in "+state);
   assert.ok(bridge[0][1].every(p=>p.every(Number.isFinite)));
  }
 }
 const hatchling=canvasAudit();
 Dino.draw(hatchling.ctx,basicPose(0),hatchling.R);hatchling.verify();
 assert.equal(hatchling.hits.filter(h=>h[0]==="blob"&&h[1]?.length===5&&h[3]?.line===false).length,0,
   "F0 must stay an egg, not grow an adult neck");
});

test("V81 both characters maintain all five evolution stages without changing physical stats",async()=>{
 const {ROSTER}=await import("../characters/roster.js");
 const d=ROSTER.find(e=>e.id==="dino"),c=ROSTER.find(e=>e.id==="cuerno");
 assert.equal(d.forms.length,5);assert.equal(c.forms.length,5);
 for(const hero of [c,d]){
   for(const f of hero.forms){
     assert.ok(Number(f.w)>0&&Number(f.h)>0);
     assert.ok(Number(f.speed)>0&&Number(f.jump)>0);
   }
 }
});

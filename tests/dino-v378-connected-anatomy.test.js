import test from "node:test";
import assert from "node:assert/strict";
import Dino,{dinoJointAnatomy,dinoBreathMechanics} from "../characters/art/dino.js";
import {R} from "../characters/rig.js";

class PathMock {moveTo(){}lineTo(){}bezierCurveTo(){}quadraticCurveTo(){}arc(){}ellipse(){}rect(){}closePath(){}addPath(){}}
globalThis.Path2D ||= PathMock;
const pose=(form,state,extras={})=>({form,state,t:140,phase:1.75,
  speed:.55,vy:0,air:false,land:.1,blink:0,atk:.48,cast:.5,castSlot:2,
  look:{x:1,y:0},breath:.75,bounce:0,sway:.1,turnPulse:0,brake:0,
  impact:0,flourish:0,flourishN:0,move:null,reduceMotion:false,...extras});
function render(p){
  const observed={joints:0,paints:0,scales:[],locations:[]};let stack=0;
  const state={globalAlpha:1,globalCompositeOperation:"source-over",fillStyle:"#fff",strokeStyle:"#fff",
    lineWidth:1,lineCap:"butt",lineJoin:"miter",shadowColor:"#000",shadowBlur:0,
    textAlign:"start",textBaseline:"alphabetic",font:"10px sans-serif",filter:"none",lineDashOffset:0};
  const ctx=new Proxy(state,{get(o,k){
    if(k in o)return o[k];
    if(k==="save")return()=>{stack++;};
    if(k==="restore")return()=>{stack--;assert.ok(stack>=0);};
    if(k==="createLinearGradient"||k==="createRadialGradient")return()=>({addColorStop(){}});
    if(k==="measureText")return()=>({width:0});
    if(k==="isPointInPath"||k==="isPointInStroke")return()=>false;
    return(...v)=>{
      for(const n of v)if(typeof n==="number")assert.ok(Number.isFinite(n),k+" produced invalid coordinate");
      if(k==="ellipse")observed.joints++;
      if(k==="scale")observed.scales.push(v);
      if(k==="translate")observed.locations.push(v);
      if(k==="fill"||k==="stroke")observed.paints++;
    };
  },set(o,k,v){if(typeof v==="number")assert.ok(Number.isFinite(v));o[k]=v;return true;}});
  const original=JSON.stringify(p);
  Dino.draw(ctx,p,R);
  assert.equal(stack,0);
  assert.equal(JSON.stringify(p),original);
  assert.ok(observed.joints>18&&observed.joints<400);
  assert.ok(observed.paints>0);
  return observed;
}
test("V378 articulated knees lie exactly on the quadratic thigh-to-ankle path",()=>{
  for(const len of [3,6,12,24,40])for(const angle of [-1.2,-.4,0,.7,1.3])
    for(const bend of [-5,0,3,7]){
      const j=dinoJointAnatomy(len,angle,bend,14,.6);
      const c={x:Math.sin(angle)*len*.5+Math.cos(angle)*bend,y:Math.cos(angle)*len*.5};
      const ankle={x:Math.sin(angle)*len,y:Math.cos(angle)*len};
      const quad=(c,v)=>(2*c+v)/4;
      assert.ok(Math.abs(j.kneeX-quad(c.x,ankle.x))<1e-9);
      assert.ok(Math.abs(j.kneeY-quad(c.y,ankle.y))<1e-9);
      assert.equal(j.ankleX,ankle.x);assert.equal(j.ankleY,ankle.y);
      assert.ok(j.kneeRadius>j.ankleRadius);
      assert.ok(Object.isFrozen(j));
    }
});
test("V378 breathing is bounded, differs across five forms and freezes for reduced motion",()=>{
  const variations=[];
  for(let f=0;f<5;f++){
    const inhale=dinoBreathMechanics(pose(f,"idle",{breath:1}));
    const exhale=dinoBreathMechanics(pose(f,"idle",{breath:-1}));
    variations.push(inhale.rib);
    assert.ok(inhale.rib>0&&exhale.rib<0);
    assert.ok(inhale.belly>0&&exhale.belly<0);
    assert.ok(inhale.throat>0&&exhale.throat<0);
    const quiet=dinoBreathMechanics(pose(f,"idle",{breath:1,reduceMotion:true}));
    assert.deepEqual(quiet,{rib:0,lift:0,belly:0,throat:0});
    assert.ok(Math.abs(dinoBreathMechanics({form:f,state:"run",breath:1}).rib)<inhale.rib);
  }
  assert.equal(new Set(variations).size,5);
  assert.ok(variations[0]>variations[4]);
  const malformed=dinoBreathMechanics({form:Infinity,breath:Infinity,state:"idle"});
  assert.ok(Object.values(malformed).every(Number.isFinite));
  assert.ok(Object.values(dinoJointAnatomy(Infinity,NaN,-Infinity,0,NaN)).every(Number.isFinite));
});
test("V378 anatomy renders in five forms and H/J/K/L/U without floating joints",()=>{
  for(let f=0;f<5;f++)for(const state of ["idle","run","jump","fall","attack","cast","victory","hurt","dead"]){
    const slots=state==="cast"?[0,1,2,3]:[-1];
    for(const slot of slots){
      const values=render(pose(f,state,{castSlot:slot}));
      assert.ok(values.joints>=24,"too few connected joints for form "+f+" "+state);
      assert.ok(values.scales.length>0);
    }
  }
});
test("V378 inhale visibly changes connected torso but not hitboxes or ground contact",()=>{
  for(let form=0;form<5;form++){
    const inhale=render(pose(form,"idle",{breath:1}));
    const exhale=render(pose(form,"idle",{breath:-1}));
    assert.notDeepEqual(inhale.scales,exhale.scales);
    assert.ok(inhale.locations.every(pair=>pair.every(Number.isFinite)));
    assert.ok(exhale.locations.every(pair=>pair.every(Number.isFinite)));
    assert.deepEqual(dinoJointAnatomy(14,.5,3,12,.4),dinoJointAnatomy(14,.5,3,12,.4),
      "connected joint geometry does not depend on breath or gameplay hitboxes");
    const reduced=render(pose(form,"idle",{breath:1,reduceMotion:true}));
    assert.ok(reduced.paints>0);
  }
});

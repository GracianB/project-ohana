import test from "node:test";
import assert from "node:assert/strict";
import dragon, { dragonBodyActing } from "../characters/art/dragon.js";
import { R } from "../characters/rig.js";
import { ROSTER } from "../characters/roster.js";

// Real Canvas vector commands with finite arguments, balanced stack and observable geometry.
class PathMock {
  moveTo() {} lineTo() {} bezierCurveTo() {} quadraticCurveTo() {}
  arc() {} ellipse() {} rect() {} closePath() {} addPath() {}
}
function canvas(label) {
  const values = {
    globalAlpha:1,globalCompositeOperation:"source-over",fillStyle:"#fff",strokeStyle:"#fff",
    lineWidth:1,lineCap:"butt",lineJoin:"miter",font:"10px sans-serif",
    textAlign:"start",textBaseline:"alphabetic",shadowColor:"#000",shadowBlur:0,
    filter:"none",lineDashOffset:0,
  };
  const trace=[],stats={depth:0,paint:0};
  const methods=new Set([
    "arc","arcTo","beginPath","bezierCurveTo","clip","closePath","ellipse","fill","fillRect",
    "getLineDash","setLineDash","isPointInPath","isPointInStroke","lineTo","measureText","moveTo",
    "quadraticCurveTo","restore","rotate","roundRect","save","scale","stroke",
    "strokeRect","translate","createLinearGradient","createRadialGradient",
  ]);
  const ctx=new Proxy(values,{
    get(o,key){
      if(key in o)return o[key];
      if(!methods.has(key))throw Error(label+": unknown canvas operation "+String(key));
      return (...args)=>{
        for(const x of args)if(typeof x==="number")assert.ok(Number.isFinite(x),label+": "+key+" received nonfinite value");
        if(key==="save")stats.depth++;
        if(key==="restore"){stats.depth--;assert.ok(stats.depth>=0,label+": excess restore");}
        if(key==="stroke"||key==="fill")stats.paint++;
        if(["translate","rotate","scale","ellipse","arc","moveTo","lineTo","bezierCurveTo","quadraticCurveTo"].includes(key))
          trace.push([key,...args.map(x=>typeof x==="number"?Number(x.toFixed(5)):x)]);
        if(key==="createLinearGradient"||key==="createRadialGradient")return {addColorStop(k){assert.ok(Number.isFinite(k)&&k>=0&&k<=1);}};
        if(key==="getLineDash")return [];
        if(key==="measureText")return {width:0};
        return key==="isPointInPath"||key==="isPointInStroke"?false:undefined;
      };
    },
    set(o,key,val){
      assert.ok(key in o,label+": unknown canvas property "+String(key));
      if(typeof val==="number")assert.ok(Number.isFinite(val),label+": invalid "+String(key));
      o[key]=val;return true;
    }
  });
  return {ctx,trace,stats};
}
const standard={
  state:"idle",move:null,t:100,phase:1.4,speed:0,vy:0,air:false,land:0,
  atk:0,cast:0,castSlot:-1,hurt:0,blink:0,look:{x:1,y:0},
  sway:.1,bounce:.1,breath:.35,flourish:0,flourishN:0,
  anticipation:0,impact:0,turnPulse:0,brake:0,
};
function render(form,overrides={}){
  const label="dragon F"+form+" "+JSON.stringify(overrides);
  const o=canvas(label);
  dragon.draw(o.ctx,{...standard,form,...overrides},R);
  assert.equal(o.stats.depth,0,label+": unbalanced canvas state");
  assert.ok(o.stats.paint>100,label+": missing physical artwork");
  assert.ok(o.trace.length>120,label+": insufficient vector geometry");
  return JSON.stringify(o.trace);
}

test("V316 Dragon body reads existing rig signals without mutating gameplay state",()=>{
  const p={state:"run",land:.8,turnPulse:.6,brake:.9,speed:.8};
  const untouched=structuredClone(p),motion=dragonBodyActing(p);
  assert.deepEqual(p,untouched);
  assert.deepEqual([motion.landing,motion.turn,motion.brake],[.8,.6,.9]);
  assert.equal(motion.flight,false);
  assert.deepEqual([dragonBodyActing({state:"hurt",land:1}).landing,
    dragonBodyActing({state:"dead",land:1}).landing],[0,0]);
  assert.equal(dragonBodyActing({state:"glide",vy:-.8}).climb,.8);
  assert.equal(dragonBodyActing({state:"glide",vy:.7}).climb,-.7);
  assert.equal(dragonBodyActing({state:"idle",land:Infinity}).landing,0);
  assert.equal(dragonBodyActing({state:"run",brake:NaN}).brake,0);
});

test("V316 Meteor L has separate crouch, launch and recovery body beats",()=>{
  const pose=cast=>dragonBodyActing({state:"cast",castSlot:2,cast});
  assert.ok(pose(.18).meteorGather>.4);
  assert.equal(pose(.18).meteorRelease,0);
  assert.ok(pose(.44).meteorRelease>.75);
  assert.ok(pose(.44).meteorGather<.15);
  assert.equal(pose(1).meteorRelease,0);
  assert.equal(pose(1).meteorGather,0);
  assert.equal(dragonBodyActing({state:"cast",castSlot:1,cast:.44}).meteorRelease,0);
});

test("V316 five evolutions retain five distinct vector silhouettes",()=>{
  globalThis.Path2D=PathMock;
  const roster=ROSTER.find(hero=>hero.id==="dragon");
  assert.equal(roster.forms.length,5);
  assert.equal(roster.abilities[2],"meteor");
  assert.equal(ROSTER.find(hero=>hero.id==="dino").abilities[2],"quake");
  const silhouettes=new Set();
  for(let f=0;f<5;f++)silhouettes.add(render(f));
  assert.equal(silhouettes.size,5);
});

test("V316 live body geometry changes for landing, turning, braking, climb and meteor, across all forms",()=>{
  globalThis.Path2D=PathMock;
  for(let form=0;form<5;form++){
    const baseline=render(form);
    assert.notEqual(render(form,{state:"idle",land:.95}),baseline,"landing must change real geometry F"+form);
    const running=render(form,{state:"run",speed:.8});
    assert.notEqual(render(form,{state:"run",speed:.8,turnPulse:1}),running,"turn must act F"+form);
    assert.notEqual(render(form,{state:"run",speed:.8,brake:1}),running,"brake must act F"+form);
    assert.notEqual(render(form,{state:"glide",vy:-.9,air:true}),render(form,{state:"glide",vy:.9,air:true}),"wing pitch F"+form);
    assert.notEqual(render(form,{state:"cast",castSlot:2,cast:.18}),render(form,{state:"cast",castSlot:2,cast:.44}),"meteor wind-up F"+form);
    for(const scene of [
      {state:"jump",vy:-1},{state:"fall",vy:1},{state:"attack",atk:.4},
      {state:"cast",castSlot:0,cast:.4},{state:"cast",castSlot:1,cast:.4},
      {state:"cast",castSlot:2,cast:.85},{state:"hurt"},
      {state:"victory"},{state:"glide",vy:.2,reduceMotion:true}
    ]) {
      const first=render(form,scene);
      assert.equal(render(form,scene),first,"non-deterministic geometry F"+form+" "+scene.state);
    }
  }
});

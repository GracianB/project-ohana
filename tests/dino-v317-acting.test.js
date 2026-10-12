import test from "node:test";
import assert from "node:assert/strict";
import Dino, {dinoQuakeActing} from "../characters/art/dino.js";
import {R} from "../characters/rig.js";
import {ROSTER} from "../characters/roster.js";
import {FAMILY_DUETS,FAMILY_DUET_LENGTH,FAMILY_DUET_BEATS,familyDuetChoreography} from "../systems/family-duets.js";

class PathMock{
  moveTo(){} lineTo(){} bezierCurveTo(){} quadraticCurveTo(){}
  arc(){} ellipse(){} rect(){} closePath(){} addPath(){}
}
globalThis.Path2D ||= PathMock;
function pose(form,state="idle",additional={}) {
  return {form,state,t:120,phase:1.64,speed:0,vy:0,
    air:false,land:0,sway:.1,bounce:.1,breath:.35,look:{x:1,y:0},
    atk:0,cast:0,castSlot:-1,flourish:0,flourishN:0,
    impact:0,turnPulse:0,brake:0,...additional};
}
function scene(form,state,additional={}){
  const p=pose(form,state,additional),snapshot=JSON.stringify(p);
  const values={
    globalAlpha:1,globalCompositeOperation:"source-over",fillStyle:"#fff",strokeStyle:"#fff",
    lineWidth:1,lineCap:"butt",lineJoin:"miter",font:"10px sans-serif",
    textAlign:"start",textBaseline:"alphabetic",shadowColor:"#000",shadowBlur:0,
    filter:"none",lineDashOffset:0
  };
  const methods=new Set([
    "arc","arcTo","beginPath","bezierCurveTo","clip","closePath","ellipse","fill","fillRect",
    "getLineDash","setLineDash","isPointInPath","isPointInStroke","lineTo","measureText","moveTo",
    "quadraticCurveTo","restore","rotate","roundRect","save","scale","stroke","strokeRect",
    "translate","createLinearGradient","createRadialGradient"
  ]);
  let depth=0,paints=0;const geometry=[];
  const ctx=new Proxy(values,{
    get(o,key){
      if(key in o)return o[key];
      assert.ok(methods.has(key),"unexpected Canvas API "+String(key));
      return (...args)=>{
        for(const v of args)if(typeof v==="number")assert.ok(Number.isFinite(v),"non-finite "+key+" "+v);
        if(key==="save")depth++;
        if(key==="restore"){depth--;assert.ok(depth>=0,"extra Canvas restore");}
        if(key==="stroke"||key==="fill")paints++;
        if(["rotate","translate","scale","ellipse","arc","moveTo","bezierCurveTo","lineTo","quadraticCurveTo"].includes(key))
          geometry.push([key,...args.map(v=>typeof v==="number"?Number(v.toFixed(4)):v)]);
        if(key==="createLinearGradient"||key==="createRadialGradient")return {addColorStop(a){assert.ok(Number.isFinite(a)&&a>=0&&a<=1);}};
        if(key==="measureText")return {width:0};
        if(key==="getLineDash")return [];
        if(key==="isPointInPath"||key==="isPointInStroke")return false;
      };
    },
    set(o,key,v){
      assert.ok(key in o,"unexpected Canvas property "+String(key));
      if(typeof v==="number")assert.ok(Number.isFinite(v),"non-finite property "+String(key));
      o[key]=v;return true;
    }
  });
  Dino.draw(ctx,p,R);
  assert.equal(depth,0,"Canvas stack leak form "+form+" state "+state);
  assert.equal(JSON.stringify(p),snapshot,"art mutated rig pose");
  assert.ok(paints>70,"missing live vector drawing");
  assert.ok(geometry.length>100&&geometry.length<4000,"geometry missing or unbounded");
  return JSON.stringify(geometry);
}
test("V317 Dino's true quake is five-stage physical load/impact/recovery",()=>{
  for(let form=0;form<5;form++){
    const at=k=>dinoQuakeActing(pose(form,"cast",{castSlot:2,cast:k}));
    const ready=at(.32),impact=at(.60),rest=at(.98);
    assert.ok(Object.isFrozen(ready),"immutable pose descriptor");
    assert.equal(ready.form,form);
    assert.ok(ready.load>.8&&ready.slam<.02,"leg brace before stomp");
    assert.ok(impact.slam>.9&&impact.load<.02,"ground strike at contact");
    assert.ok(rest.recovery>.99&&rest.slam<.01&&rest.load<.01,"feet recover");
    assert.ok(ready.hip<0&&impact.hip>0,"weight travels from raised to grounded");
    assert.ok(ready.head<0&&impact.head>0,"skull anticipates then recoils");
    assert.ok(impact.recoil>.9);
    assert.equal(dinoQuakeActing(pose(form,"cast",{castSlot:1,cast:.5})),null);
  }
  assert.ok(dinoQuakeActing(pose(4,"cast",{castSlot:2,cast:.6})).mass>
    dinoQuakeActing(pose(0,"cast",{castSlot:2,cast:.6})).mass,
    "Colossus is heavier than hatchling without changing the collision box");
});
test("V317 quake cannot inherit invalid values, timers or gameplay writes",()=>{
  for(const value of [NaN,Infinity,-Infinity,-20,23]){
    const src=pose(value,"cast",{castSlot:2,cast:value});
    const original=JSON.stringify(src),shape=dinoQuakeActing(src);
    assert.equal(JSON.stringify(src),original);
    for(const [name,n] of Object.entries(shape)) assert.ok(Number.isFinite(n),name);
    assert.ok(shape.form>=0&&shape.form<=4);
    assert.ok(shape.load>=0&&shape.load<=1&&shape.slam>=0&&shape.slam<=1);
  }
  assert.deepEqual(dinoQuakeActing(pose(4,"cast",{castSlot:2,cast:.5,t:4000})),
    dinoQuakeActing(pose(4,"cast",{castSlot:2,cast:.5,t:4})),
    "seismic posture must depend on action progress, not wall-clock time");
});
test("V317 real Canvas: baby and elder have distinct full silhouettes and J/K/L/U beats",()=>{
  const forms=ROSTER.find(c=>c.id==="dino").forms;
  assert.equal(forms.length,5);
  assert.equal(ROSTER.find(c=>c.id==="dino").abilities[2],"quake");
  const silhouettes=new Set();
  for(let form=0;form<5;form++){
    silhouettes.add(scene(form,"idle"));
    const phases=[
      {state:"run",speed:.9,phase:3.2},
      {state:"jump",vy:-.85},
      {state:"fall",vy:.85},
      {state:"attack",atk:.42},
      {state:"cast",castSlot:0,cast:.18},
      {state:"cast",castSlot:0,cast:.48},
      {state:"cast",castSlot:1,cast:.45},
      {state:"cast",castSlot:2,cast:.32},
      {state:"cast",castSlot:2,cast:.6},
      {state:"cast",castSlot:2,cast:.98},
      {state:"cast",castSlot:3,cast:.45},
      {state:"hurt"},{state:"dead"},{state:"victory"}
    ];
    const rendered=phases.map(({state,...rest})=>scene(form,state,rest));
    assert.notEqual(rendered[4],rendered[5],"spit inhale/exit must change anatomy");
    assert.notEqual(rendered[7],rendered[8],"quake load/slam must change anatomy");
    assert.notEqual(rendered[8],rendered[9],"quake slam/recovery must change anatomy");
    assert.notEqual(rendered[6],rendered[8],"K charge and L quake differ");
    assert.notEqual(rendered[8],rendered[10],"quake and Colossus U remain distinct");
    assert.equal(new Set(rendered).size,rendered.length,"every action should have identifiable anatomy F"+form);
    assert.equal(scene(form,"cast",{castSlot:2,cast:.6}),
      scene(form,"cast",{castSlot:2,cast:.6}),"deterministic renderer");
  }
  assert.equal(silhouettes.size,5,"baby, juvenile, crested, rex, final must not be scaled duplicates");
});
test("V317 U stays paired with Frita's actual fryer, three finite beats and 120 ticks",()=>{
  const u=FAMILY_DUETS.dino;
  assert.equal(u.ally,"frita");
  assert.equal(u.borrowedL,"fryer");
  assert.equal(FAMILY_DUET_LENGTH,120);
  assert.deepEqual(FAMILY_DUET_BEATS,[42,66,90]);
  const stages=new Set();
  for(let form=0;form<5;form++)for(const rank of [1,2,3]){
    for(const age of [1,22,34,41,42,66,90,108,118]){
      const frame=familyDuetChoreography({hero:"dino",x:200,y:250,
        age,evo:form,facing:1,bondRank:rank},true);
      assert.equal(frame.ally,"frita");
      assert.equal(frame.borrowedL,"fryer");
      assert.equal(frame.bondRank,rank);
      assert.ok(Number.isFinite(frame.allyX)&&Number.isFinite(frame.allyY));
      stages.add(frame.stage);
    }
  }
  assert.deepEqual([...stages].sort(),["arrival","borrowed-L","exchange","farewell"].sort());
});

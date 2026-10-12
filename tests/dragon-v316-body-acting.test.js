import test from "node:test";
import assert from "node:assert/strict";
import dragon, {dragonBodyLanguage,dragonMomentum} from "../characters/art/dragon.js";
import {R} from "../characters/rig.js";

class PathMock {
  moveTo() {} lineTo() {} bezierCurveTo() {} quadraticCurveTo() {}
  arc() {} ellipse() {} rect() {} closePath() {} addPath() {}
}
globalThis.Path2D ||= PathMock;

const base=(form,state,extra={})=>({
  form,state,t:148,phase:1.5,speed:0,vy:0,air:false,land:0,
  atk:0,cast:0,castSlot:-1,hurt:0,blink:0,nineLives:0,
  look:{x:1,y:0},sway:.1,bounce:.1,breath:.25,
  flourish:0,flourishN:0,evoT:0,squash:0,stretch:0,
  bodyTilt:0,headTilt:0,turnPulse:0,brake:0,secondary:0,...extra
});

function render(pose){
  const state={globalAlpha:1,globalCompositeOperation:"source-over",
    fillStyle:"#fff",strokeStyle:"#fff",lineWidth:1,
    lineCap:"butt",lineJoin:"miter",font:"10px sans-serif",textAlign:"start",
    textBaseline:"alphabetic",shadowColor:"#000",shadowBlur:0,
    filter:"none",lineDashOffset:0};
  const calls=[];let depth=0;
  const available=new Set(["arc","arcTo","beginPath","bezierCurveTo","clip",
    "closePath","ellipse","fill","fillRect","getLineDash","setLineDash",
    "isPointInPath","isPointInStroke","lineTo","measureText","moveTo",
    "quadraticCurveTo","restore","rotate","roundRect","save","scale",
    "stroke","strokeRect","translate","createLinearGradient","createRadialGradient"]);
  const ctx=new Proxy(state,{
    get(o,key){
      if(key in o)return o[key];
      if(!available.has(key))throw Error("Unexpected Canvas call "+String(key));
      return (...args)=>{
        for(const arg of args) if(typeof arg==="number")
          assert.ok(Number.isFinite(arg),"Non-finite "+key);
        if(key==="save")depth++;
        if(key==="restore"){depth--;assert.ok(depth>=0,"Unbalanced restore");}
        if(["rotate","translate","ellipse","arc","lineTo","bezierCurveTo",
          "quadraticCurveTo","scale","fill","stroke"].includes(key))
          calls.push([key,...args]);
        if(key==="createRadialGradient"||key==="createLinearGradient")
          return {addColorStop(offset){assert.ok(Number.isFinite(offset)&&offset>=0&&offset<=1);}};
        if(key==="measureText")return {width:0};
        if(key==="getLineDash")return [];
        if(key==="isPointInPath"||key==="isPointInStroke")return false;
      };
    },
    set(o,key,value){
      assert.ok(key in o,"Unknown Canvas property "+String(key));
      if(typeof value==="number")assert.ok(Number.isFinite(value),"Non-finite property "+key);
      o[key]=value;return true;
    }
  });
  const original=JSON.stringify(pose);
  dragon.draw(ctx,pose,R);
  assert.equal(depth,0,"Canvas save/restore must balance");
  assert.equal(JSON.stringify(pose),original,"renderer must never alter the pose");
  assert.ok(calls.length>50,"Actual vector rendering must produce anatomy");
  assert.ok(calls.length<3500,"Unbounded vector drawing");
  return JSON.stringify(calls.filter(x=>x[0]==="rotate"||x[0]==="translate"||x[0]==="ellipse").slice(0,250));
}

test("V316: five forms have distinct wing/body anatomy in real Canvas",()=>{
  const anatomy=[];
  for(let form=0;form<5;form++){
    const p=base(form,"glide",{air:true,vy:-.4});
    anatomy.push(render(p));
    assert.ok(dragonBodyLanguage(p).wingFar<=.5);
  }
  assert.equal(new Set(anatomy).size,5);
});

test("V316: grounded landing, brake and reversal all change the actual rendered pose",()=>{
  for(let form=0;form<5;form++){
    const neutral=base(form,"idle");
    const landing=base(form,"idle",{land:.86});
    assert.notEqual(render(neutral),render(landing),"Landing must compress the body");
    const run=base(form,"run",{speed:.8,phase:2});
    const brake=base(form,"run",{speed:.8,phase:2,brake:.86});
    const turn=base(form,"run",{speed:.8,phase:2,turnPulse:.8});
    assert.notEqual(render(run),render(brake),"Braking must move wings and feet");
    assert.notEqual(render(run),render(turn),"Reversal must counter-rotate the wings");
    assert.notEqual(render(brake),render(turn),"Braking and turning are not one generic FX");
    assert.ok(dragonBodyLanguage(brake).wing<dragonBodyLanguage(run).wing);
    assert.ok(dragonBodyLanguage(turn).lean>dragonBodyLanguage(run).lean);
  }
});

test("V316: H and all three ability slots use different windup/strike/recovery anatomy",()=>{
  const poses=[];
  for(let form=0;form<5;form++){
    const h=base(form,"attack",{atk:.44}),j=base(form,"cast",{castSlot:0,cast:.43});
    const k=base(form,"cast",{castSlot:1,cast:.43});
    const l=base(form,"cast",{castSlot:2,cast:.43});
    for(const p of [h,j,k,l])render(p);
    const samples=[h,j,k,l].map(p=>dragonBodyLanguage(p));
    assert.equal(new Set(samples.map(s=>JSON.stringify(s))).size,4);
    poses.push(...samples);
    const windup=dragonBodyLanguage(base(form,"cast",{castSlot:2,cast:.16}));
    const contact=dragonBodyLanguage(base(form,"cast",{castSlot:2,cast:.5}));
    const recovery=dragonBodyLanguage(base(form,"cast",{castSlot:2,cast:.98}));
    assert.ok(contact.head<windup.head,"Meteor roar bends the head at contact");
    assert.ok(Math.abs(recovery.head)<.02,"Meteor roar actually recovers");
  }
  assert.equal(poses.length,20);
});

test("V316: launch, fall, glide and victory have distinct silhouettes from baby to legend",()=>{
  for(let form=0;form<5;form++){
    const states=[
      base(form,"jump",{air:true,vy:-.8}),
      base(form,"fall",{air:true,vy:.8}),
      base(form,"glide",{air:true,vy:-.2}),
      base(form,"victory")
    ];
    const signatures=states.map(render);
    assert.equal(new Set(signatures).size,4);
    assert.equal(new Set(states.map(s=>JSON.stringify(dragonBodyLanguage(s)))).size,4);
  }
});

test("V316: no state mutation, no new damage, finite posture values, accessibility",()=>{
  for(let form=0;form<5;form++){
    assert.equal(dragonBodyLanguage(base(form,"idle")),null);
    for(const state of ["hurt","dead","wall"])
      assert.equal(dragonBodyLanguage(base(form,state,{land:1,brake:1})),null);
    for(const state of ["idle","run","glide","cast","attack","victory"]){
      const input=base(form,state,{t:0,land:3,speed:Infinity,
        brake:NaN,turnPulse:-999,vy:Infinity,cast:-10,atk:Infinity,
        reduceMotion:true});
      const before=JSON.stringify(input);
      const result=dragonBodyLanguage(input);
      assert.equal(JSON.stringify(input),before);
      if(result){
        assert.ok(Object.isFrozen(result));
        for(const n of Object.values(result))assert.ok(Number.isFinite(n)&&Math.abs(n)<=2);
        const distant=dragonBodyLanguage({...input,t:9000000});
        assert.deepEqual(result,distant,"reduced motion cannot rely on clock time");
      }
    }
  }
  assert.deepEqual(dragonMomentum({state:"idle",land:.7}),{
    landing:.7,run:0,turn:0,brake:0
  },"V305 landing API must remain compatible");
});

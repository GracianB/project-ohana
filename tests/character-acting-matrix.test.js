import test from "node:test";
import assert from "node:assert/strict";
import { ART } from "../characters/art/index.js";
import { ROSTER } from "../characters/roster.js";
import { R } from "../characters/rig.js";

// This matrix exercises the actual vector renderers, not string/regex markers.
// It must remain separate from gameplay physics, hitboxes and ability execution.
class PathMock {
  moveTo() {} lineTo() {} bezierCurveTo() {} quadraticCurveTo() {}
  arc() {} ellipse() {} rect() {} closePath() {}
  addPath() {}
}

const states = [
  { name:"rest", state:"idle" },
  ...[0,1,2,3].map(n=>({name:"flourish-"+n,state:"idle",flourish:.52,flourishN:n})),
  { name:"running", state:"run",speed:.88,phase:2.5,turnPulse:.7,brake:.4 },
  { name:"landing", state:"idle",land:.85 },
  { name:"jump", state:"jump",air:true,vy:-.85 },
  { name:"fall", state:"fall",air:true,vy:.85 },
  { name:"glide", state:"glide",air:true,vy:.2 },
  { name:"attack", state:"attack",atk:.48 },
  ...[0,1,2,3].map(slot=>({name:"cast-"+slot,state:"cast",castSlot:slot,cast:.46})),
  { name:"hurt", state:"hurt",hurt:.6 },
  { name:"wall", state:"wall",air:true },
  { name:"victory",state:"victory" },
  { name:"dead",state:"dead" },
];

function makeContext(label){
  const state={
    globalAlpha:1,globalCompositeOperation:"source-over",fillStyle:"#fff",strokeStyle:"#fff",
    lineWidth:1,lineCap:"butt",lineJoin:"miter",font:"10px sans-serif",
    textAlign:"start",textBaseline:"alphabetic",shadowColor:"#000",shadowBlur:0,filter:"none",
  };
  const stats={depth:0,highest:0,paths:0,paint:0,geometry:0};
  const available=new Set([
    "arc","arcTo","beginPath","bezierCurveTo","clip","closePath","ellipse","fill","fillRect",
    "getLineDash","setLineDash","isPointInPath","isPointInStroke","lineTo","measureText","moveTo",
    "quadraticCurveTo","restore","rotate","roundRect","save","scale","stroke",
    "strokeRect","translate","createLinearGradient","createRadialGradient",
  ]);
  const methods={};
  const validate=(name,args)=>{
    for(const arg of args)if(typeof arg==="number"){
      assert.ok(Number.isFinite(arg),label+": nonfinite "+name+"("+args.join(", ")+")");
    }
  };
  for(const method of available){
    methods[method]=(...args)=>{
      validate(method,args);
      if(method==="save"){stats.depth++;stats.highest=Math.max(stats.highest,stats.depth);}
      if(method==="restore"){stats.depth--;assert.ok(stats.depth>=0,label+": unmatched restore");}
      if(["beginPath","moveTo","lineTo","ellipse","arc","bezierCurveTo","quadraticCurveTo"].includes(method))stats.paths++;
      if(["fill","fillRect","stroke","strokeRect"].includes(method))stats.paint++;
      if(["ellipse","arc","bezierCurveTo","quadraticCurveTo","translate","scale"].includes(method))stats.geometry++;
      if(method==="createLinearGradient"||method==="createRadialGradient")return {addColorStop(offset){assert.ok(Number.isFinite(offset)&&offset>=0&&offset<=1,label+": invalid gradient offset");}};
      if(method==="measureText")return {width:0};
      if(method==="getLineDash")return [];
      if(method==="setLineDash") {
        assert.ok(Array.isArray(args[0]),label+": dash must be array");
        for(const n of args[0])assert.ok(Number.isFinite(n)&&n>=0,label+": invalid dash length");
        return;
      }
      if(method==="isPointInPath"||method==="isPointInStroke")return false;
      return undefined;
    };
  }
  return {ctx:new Proxy(state,{
    get(o,key){if(key in o)return o[key];if(key in methods)return methods[key];throw new Error(label+": unknown canvas API "+String(key));},
    set(o,key,val){if(!(key in o))throw new Error(label+": unknown canvas property "+String(key));
      if(typeof val==="number")assert.ok(Number.isFinite(val),label+": nonfinite "+String(key));
      o[key]=val;return true;}
  }),stats};
}
function pose(form,spec){
  return {
    state:"idle",move:null,form,t:144,phase:1.6,speed:0,vy:0,air:false,land:0,
    atk:0,cast:0,castSlot:-1,hurt:0,blink:0,nineLives:0,
    look:{x:1,y:0},sway:.12,bounce:.1,breath:.4,flourish:0,flourishN:0,
    evoT:0,squash:0,stretch:0,bodyTilt:0,headTilt:0,
    armSwing:0,legSwing:0,anticipation:0,impact:0,turnPulse:0,brake:0,
    secondary:0,...spec
  };
}

test("OHANA · 10 heroes × 5 evolutions × 19 acting states render with finite geometry",()=>{
  globalThis.Path2D=PathMock;
  assert.equal(ROSTER.length,10);
  let audited=0;
  const failures=[];
  for(const hero of ROSTER) {
    assert.ok(ART[hero.id],hero.id+": missing renderer");
    for(let form=0;form<5;form++){
      for(const scene of states){
        const label=hero.id+" F"+form+" "+scene.name;
        const {ctx,stats}=makeContext(label);
        try{
          ART[hero.id].draw(ctx,pose(form,scene),R);
          assert.equal(stats.depth,0,label+": leaked Canvas state");
          assert.ok(stats.paint>0,label+": character was not painted");
          assert.ok(stats.geometry>0,label+": character has no geometry");
        }catch(error){failures.push(label+": "+error.message);}
        audited++;
      }
    }
  }
  assert.deepEqual(failures,[],failures.slice(0,12).join("\n"));
  assert.equal(audited,ROSTER.length*5*states.length);
});

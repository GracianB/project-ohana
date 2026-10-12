import test from "node:test";
import assert from "node:assert/strict";
import Frita,{fritaCookingActing,fritaFootwork} from "../characters/art/frita.js";
import {R} from "../characters/rig.js";
import {ROSTER} from "../characters/roster.js";
import {FAMILY_DUETS,FAMILY_DUET_LENGTH,FAMILY_DUET_BEATS,familyDuetChoreography} from "../systems/family-duets.js";
import {optionsForUPartner} from "../systems/u-partners.js";

class PathMock {
  moveTo(){} lineTo(){} bezierCurveTo(){} quadraticCurveTo(){}
  ellipse(){} arc(){} closePath(){} rect(){} addPath(){}
}
globalThis.Path2D ||= PathMock;
const sample=(form,state="idle",extra={})=>({
  form,state,t:148,phase:1.4,speed:0,vy:0,air:false,land:0,
  atk:0,cast:0,castSlot:-1,hurt:0,blink:0,nineLives:0,
  look:{x:1,y:0},sway:.1,bounce:.1,breath:.3,flourish:0,flourishN:0,
  evoT:0,squash:0,stretch:0,bodyTilt:0,headTilt:0,
  armSwing:0,legSwing:0,anticipation:0,impact:0,secondary:0,
  turnPulse:0,brake:0,...extra
});
function render(p){
  const state={
    globalAlpha:1,globalCompositeOperation:"source-over",fillStyle:"#fff",strokeStyle:"#fff",
    lineWidth:1,lineCap:"butt",lineJoin:"miter",font:"10px sans-serif",textAlign:"start",
    textBaseline:"alphabetic",shadowColor:"#000",shadowBlur:0,filter:"none",lineDashOffset:0
  };
  const available=new Set(["arc","arcTo","beginPath","bezierCurveTo","clip","closePath","ellipse",
    "fill","fillRect","getLineDash","setLineDash","isPointInPath","isPointInStroke","lineTo",
    "measureText","moveTo","quadraticCurveTo","restore","rotate","roundRect","save","scale",
    "stroke","strokeRect","translate","createLinearGradient","createRadialGradient"]);
  let stack=0,paints=0;const traces=[];
  const ctx=new Proxy(state,{
    get(o,key) {
      if(key in o)return o[key];
      assert.ok(available.has(key),"unrecognized Canvas method "+String(key));
      return (...args)=>{
        for(const v of args)if(typeof v==="number")assert.ok(Number.isFinite(v),"nonfinite "+key+" "+String(v));
        if(key==="save")stack++;
        if(key==="restore"){stack--;assert.ok(stack>=0);}
        if(key==="fill"||key==="stroke"||key==="fillRect")paints++;
        if(["rotate","translate","scale","ellipse","arc","moveTo","lineTo","bezierCurveTo","quadraticCurveTo"].includes(key))
          traces.push([key,...args.map(v=>typeof v==="number"?Number(v.toFixed(4)):v)]);
        if(key==="createLinearGradient"||key==="createRadialGradient")return {addColorStop(stop){assert.ok(Number.isFinite(stop)&&stop>=0&&stop<=1);}};
        if(key==="getLineDash")return [];
        if(key==="measureText")return {width:0};
        if(key==="isPointInPath"||key==="isPointInStroke")return false;
      };
    },
    set(o,k,v){
      assert.ok(k in o,"unknown canvas property "+String(k));
      if(typeof v==="number")assert.ok(Number.isFinite(v),"nonfinite property "+String(k));
      o[k]=v;return true;
    }
  });
  const before=JSON.stringify(p);
  Frita.draw(ctx,p,R);
  assert.equal(JSON.stringify(p),before,"art must not mutate authoritative pose");
  assert.equal(stack,0,"leaked Canvas save()");
  assert.ok(paints>25&&traces.length>70&&traces.length<10000,"vector artwork missing or unbounded, paint="+paints+" geometry="+traces.length);
  return JSON.stringify(traces);
}
test("V318 Frita J salt and K ketchup have pressure and release, independent of wall time",()=>{
  for(const slot of [0,1]){
    const at=k=>fritaCookingActing(sample(2,"cast",{castSlot:slot,cast:k}));
    const early=at(.2),burst=at(.5),late=at(1);
    assert.ok(early.load>.3&&early.serve<.01);
    assert.ok(burst.serve>.99&&burst.load<.01);
    assert.equal(late.serve,0);
    assert.equal(late.recovery,1);
    assert.deepEqual(burst,fritaCookingActing(sample(2,"cast",{castSlot:slot,cast:.5,t:90000})));
    assert.ok(Object.isFrozen(burst));
    assert.equal(burst.squeeze,slot===1?burst.serve:0);
  }
});
test("V318 L fryer stages crouch, pop and settle; U handoff is not fryer L",()=>{
  for(const form of [0,1,2,3,4]){
    const s=(slot,k)=>fritaCookingActing(sample(form,"cast",{castSlot:slot,cast:k}));
    assert.ok(s(2,.2).crouch>1);
    assert.ok(s(2,.5).jump<-11);
    assert.ok(Math.abs(s(2,1).jump)<1e-9);
    assert.equal(s(3,.5).offer,1);
    assert.equal(s(2,.5).offer,0);
    assert.ok(s(3,.5).jump>s(2,.5).jump);
    assert.ok(Math.abs(s(3,1).offer)<1e-9);
    assert.equal(fritaCookingActing(sample(form,"hurt",{castSlot:2,cast:.5})),null);
    assert.deepEqual(s(2,.5),s(2,.5));
  }
});
test("V318 all five actual forms have finite Canvas geometry with distinct H/J/K/L/U",()=>{
  const hero=ROSTER.find(x=>x.id==="frita");
  assert.equal(hero.forms.length,5);
  assert.deepEqual(hero.abilities,["salt","ketchup","fryer"]);
  const portraits=new Set();
  for(let form=0;form<5;form++){
    portraits.add(render(sample(form)));
    const h=render(sample(form,"attack",{atk:.46}));
    const j0=render(sample(form,"cast",{castSlot:0,cast:.2}));
    const j1=render(sample(form,"cast",{castSlot:0,cast:.5}));
    const k0=render(sample(form,"cast",{castSlot:1,cast:.2}));
    const k1=render(sample(form,"cast",{castSlot:1,cast:.5}));
    const l0=render(sample(form,"cast",{castSlot:2,cast:.2}));
    const l1=render(sample(form,"cast",{castSlot:2,cast:.5}));
    const u=render(sample(form,"cast",{castSlot:3,cast:.5}));
    assert.notEqual(j0,j1,"J must draw distinguishable pressure/release");
    assert.notEqual(k0,k1,"K must animate squeeze during cast");
    assert.notEqual(l0,l1,"L must load then pop");
    assert.notEqual(l1,u,"U handoff cannot be a repeat of oil geyser");
    assert.equal(new Set([h,j1,k1,l1,u]).size,5,"H/J/K/L/U need distinct anatomies");
    for(const p of [
      sample(form,"run",{speed:.8,phase:3}),
      sample(form,"run",{move:"slide",speed:.8}),
      sample(form,"jump",{vy:-.8}),
      sample(form,"fall",{vy:.8}),
      sample(form,"hurt",{hurt:.7}),
      sample(form,"dead"),
      sample(form,"victory"),
      sample(form,"idle",{land:.9,turnPulse:.7,brake:.7}),
    ])assert.equal(render(p),render(p),"render must remain deterministic");
  }
  assert.equal(portraits.size,5,"baby, capped, ketchup, crispy and centella must differ");
});
test("V318 preserves all nine selectable partners and Pizza oven U choreography",()=>{
  assert.equal(FAMILY_DUETS.frita.ally,"pizza");
  assert.equal(FAMILY_DUETS.frita.borrowedL,"oven");
  assert.equal(FAMILY_DUET_LENGTH,120);
  assert.deepEqual(FAMILY_DUET_BEATS,[42,66,90]);
  const choices=optionsForUPartner("frita");
  assert.equal(choices.length,9);
  for(const choice of choices) {
    for(const age of [0,25,42,66,90,115]){
      const result=familyDuetChoreography({hero:"frita",ally:choice.id,x:200,y:300,
        age,evo:4,facing:1,bondRank:3},true);
      assert.equal(result.ally,choice.id);
      assert.equal(result.borrowedL,choice.borrowedL);
      assert.ok(Number.isFinite(result.allyX)&&Number.isFinite(result.allyY));
    }
  }
});

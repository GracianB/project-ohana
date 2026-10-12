import test from "node:test";
import assert from "node:assert/strict";
import Dino, {dinoGroundBrace,dinoHiccupState,dinoHiccupSilhouette,dinoSecondaryMotion} from "../characters/art/dino.js";
import {R} from "../characters/rig.js";
import {ROSTER} from "../characters/roster.js";
import {FAMILY_DUETS,FAMILY_DUET_LENGTH,FAMILY_DUET_BEATS,
  familyDuetDefinition,familyDuetChoreography,familyDuetStrike} from "../systems/family-duets.js";
import {optionsForUPartner} from "../systems/u-partners.js";
class PathMock {
  moveTo(){}lineTo(){}bezierCurveTo(){}quadraticCurveTo(){}
  arc(){}ellipse(){}rect(){}closePath(){}addPath(){}
}
globalThis.Path2D ||= PathMock;

const pose=(form,state,props={})=>({
  form,state,t:140,phase:1.9,speed:0,vy:0,air:false,land:0,blink:0,
  atk:0,cast:0,castSlot:-1,look:{x:1,y:0},breath:.3,
  bounce:.12,sway:.2,turnPulse:0,brake:0,impact:0,
  flourish:0,flourishN:0,move:null,reduceMotion:false,...props
});
function draw(input) {
  let depth=0,paint=0;const ellipses=[],moves=[];
  const state={globalAlpha:1,globalCompositeOperation:"source-over",fillStyle:"#fff",
    strokeStyle:"#fff",lineWidth:1,lineCap:"butt",lineJoin:"miter",
    shadowColor:"#000",shadowBlur:0,textAlign:"start",textBaseline:"alphabetic",
    font:"10px sans-serif",filter:"none",lineDashOffset:0};
  const ctx=new Proxy(state,{
    get(obj,key){
      if(key in obj)return obj[key];
      if(key==="save")return()=>{depth++;};
      if(key==="restore")return()=>{depth--;assert.ok(depth>=0);};
      if(key==="createLinearGradient"||key==="createRadialGradient")
        return(...args)=>{assert.ok(args.every(Number.isFinite));return{addColorStop(t){assert.ok(t>=0&&t<=1);}};};
      if(key==="measureText")return()=>({width:0});
      if(key==="getLineDash")return()=>([]);
      if(key==="isPointInPath"||key==="isPointInStroke")return()=>false;
      return(...args)=>{
        for(const v of args)if(typeof v==="number")
          assert.ok(Number.isFinite(v),"Canvas "+String(key)+" contains nonfinite "+v);
        if(key==="ellipse")ellipses.push(args);
        if(key==="translate"||key==="rotate")moves.push([key,...args]);
        if(key==="fill"||key==="stroke")paint++;
      };
    },
    set(obj,key,value){
      assert.ok(key in obj,"Unknown canvas property: "+String(key));
      if(typeof value==="number")assert.ok(Number.isFinite(value));
      obj[key]=value;return true;
    }
  });
  const old=JSON.stringify(input);
  Dino.draw(ctx,input,R);
  assert.equal(depth,0);
  assert.equal(JSON.stringify(input),old,"Dino art must not mutate the rig pose");
  assert.ok(paint>0);
  assert.ok(ellipses.length>12);
  assert.ok(ellipses.length<400);
  // Toe dots: small ellipses with a distinctive 1.3:1 aspect ratio.
  const toe=ellipses.filter(e=>e[2]>=1.1&&e[2]<=2.8&&Math.abs(e[3]/e[2]-.1/.13)<.002)
    .map(e=>[...e.slice(0,4)]);
  assert.ok(toe.length>=6,"Five forms must retain two planted three-claw feet");
  return {toe,ellipses,moves};
}

test("Dino V317: five weights plant different toes on L rather than extra hitboxes",()=>{
  const magnitudes=[];
  for(let form=0;form<5;form++){
    const quiet=dinoGroundBrace(pose(form,"idle"));
    const windup=dinoGroundBrace(pose(form,"cast",{castSlot:2,cast:.24}));
    const hit=dinoGroundBrace(pose(form,"cast",{castSlot:2,cast:.52}));
    const recovery=dinoGroundBrace(pose(form,"cast",{castSlot:2,cast:.98}));
    assert.ok(windup.front>quiet.front&&windup.rear>quiet.rear);
    assert.ok(hit.front>quiet.front);
    assert.ok(recovery.front<.05&&recovery.rear<.05);
    assert.ok(Object.isFrozen(hit));
    const unweighted=draw(pose(form,"cast",{castSlot:2,cast:0}));
    const weighted=draw(pose(form,"cast",{castSlot:2,cast:.52}));
    assert.notDeepEqual(weighted.toe,unweighted.toe);
    magnitudes.push(hit.front);
  }
  assert.equal(new Set(magnitudes).size,5,"Hatchling and legend cannot share the same foot spread");
});

test("Dino V317: H/J/K/L/U are five distinct contact-foot stances",()=>{
  for(let form=0;form<5;form++){
    const items=[
      pose(form,"attack",{atk:.5}),
      ...[0,1,2,3].map(slot=>pose(form,"cast",{castSlot:slot,cast:.5}))
    ];
    const braces=items.map(dinoGroundBrace);
    assert.equal(new Set(braces.map(v=>JSON.stringify(v))).size,5);
    const renders=items.map(x=>draw(x).toe);
    assert.equal(new Set(renders.map(v=>JSON.stringify(v))).size,5);
    assert.ok(braces[3].front>braces[2].front,"L quake wider than K charge");
    assert.ok(braces[4].rear>braces[2].rear,"U colossus rooted");
  }
});

test("Dino V317: landing, hard brake, direction reversal and hatchling differ in foot anatomy",()=>{
  for(let form=0;form<5;form++){
    const plain=pose(form,"idle");
    const landing=pose(form,"idle",{land:.91});
    const run=pose(form,"run",{speed:.9});
    const brake=pose(form,"run",{speed:.9,brake:.86});
    const reverse=pose(form,"run",{speed:.9,turnPulse:.89});
    assert.notDeepEqual(draw(plain).toe,draw(landing).toe);
    assert.notDeepEqual(draw(run).toe,draw(brake).toe);
    assert.notDeepEqual(draw(run).toe,draw(reverse).toe);
    assert.notDeepEqual(dinoGroundBrace(brake),dinoGroundBrace(reverse));
    const guard=dinoSecondaryMotion(landing);
    assert.ok(guard.hipDrop>0,"V79 original weighted hips remain active");
  }
});

test("Dino V317: reduced-motion hiccup tells a story with fixed postures, no steam",()=>{
  for(let form=0;form<5;form++){
    const early=pose(form,"idle",{flourish:.22,flourishN:3,reduceMotion:true});
    const hipo=pose(form,"idle",{flourish:.52,flourishN:3,reduceMotion:true});
    const relief=pose(form,"idle",{flourish:.85,flourishN:3,reduceMotion:true});
    const steps=[early,hipo,relief].map(dinoHiccupSilhouette);
    for(const p of [early,hipo,relief])assert.equal(dinoHiccupState(p),null,
      "Original cosmetic FX contract must be suppressed in reduced motion");
    assert.deepEqual(steps.map(v=>[v.prepare,v.sneeze,v.settle]),[[1,0,0],[0,1,0],[0,0,1]]);
    assert.ok(steps.every(v=>v.reduced && Object.isFrozen(v)));
    const visual=[early,hipo,relief].map(x=>draw(x).moves);
    assert.equal(new Set(visual.map(x=>JSON.stringify(x))).size,3);
    for(const state of [early,hipo,relief])
      assert.deepEqual(dinoHiccupSilhouette({...state,t:987654}),dinoHiccupSilhouette(state));
  }
  assert.equal(dinoHiccupSilhouette({state:"cast",flourish:.52,flourishN:3,reduceMotion:true}),null);
  assert.equal(dinoHiccupSilhouette({state:"hurt",flourish:.52,flourishN:3,reduceMotion:true}),null);
});

test("Dino V317: no new toes in hurt/dead/rolling; reject NaN and hostile values",()=>{
  for(let form of [-20,0,2,4,99]){
    for(const state of ["hurt","dead","wall"]){
      assert.deepEqual(dinoGroundBrace(pose(form,state,{land:1,brake:1})),{front:0,rear:0});
    }
    for(const state of ["idle","run","jump","fall","attack","cast","victory"]){
      const p=pose(form,state,{castSlot:2,land:Infinity,brake:NaN,turnPulse:-400,
        atk:Infinity,cast:-10,reduceMotion:true});
      const copy=JSON.stringify(p),v=dinoGroundBrace(p);
      assert.equal(JSON.stringify(p),copy);
      assert.ok(Object.isFrozen(v));
      assert.ok(Object.values(v).every(n=>Number.isFinite(n)&&n>=0&&n<=1));
      assert.deepEqual(dinoGroundBrace({...p,t:19999}),v);
    }
  }
  assert.deepEqual(dinoGroundBrace(pose(4,"run",{move:"dino-roll",land:1})),{front:0,rear:0});
});

test("Dino V317: Frita lends the fryer, and U keeps 120 ticks and nine selectable partners",()=>{
  assert.equal(ROSTER.find(x=>x.id==="dino").abilities[2],"quake");
  assert.equal(ROSTER.find(x=>x.id==="frita").abilities[2],"fryer");
  assert.equal(FAMILY_DUETS.dino.ally,"frita");
  assert.equal(FAMILY_DUETS.dino.borrowedL,"fryer");
  assert.equal(FAMILY_DUET_LENGTH,120);
  assert.deepEqual(FAMILY_DUET_BEATS,[42,66,90]);
  const options=optionsForUPartner("dino");
  assert.equal(options.length,9);
  for(const option of options)for(let form=0;form<5;form++)for(let rank=1;rank<=3;rank++){
    const s={hero:"dino",ally:option.id,x:500,y:320,evo:form,age:66,facing:1,bondRank:rank};
    const d=familyDuetDefinition(s),p=familyDuetChoreography(s,true);
    assert.equal(d.borrowedL,option.borrowedL);
    assert.equal(p.ally,option.id);assert.equal(p.bondRank,rank);
    assert.ok(Number.isFinite(p.allyX)&&Number.isFinite(p.allyY));
  }
  for(let form=0;form<5;form++){
    const s={hero:"dino",x:500,y:320,evo:form,age:42,facing:1};
    const on={x:500+34-10,y:320-36,w:20,h:20},off={...on,x:1700};
    assert.equal(familyDuetStrike(s,0,on),true);
    assert.equal(familyDuetStrike(s,0,off),false);
  }
});

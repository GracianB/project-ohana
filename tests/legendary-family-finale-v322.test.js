import test from "node:test";
import assert from "node:assert/strict";
import {ROSTER} from "../characters/roster.js";
import {optionsForUPartner} from "../systems/u-partners.js";
import {FAMILY_DUETS,FAMILY_DUET_BEATS,FAMILY_DUET_LENGTH,
  legendaryDuetMoment,drawFamilyDuet,familyDuetChoreography,
  familyDuetStrike} from "../systems/family-duets.js";

const heroes=["dragon","dino","frita","pizza","yomi","cuerno"];
const expected=["egg","sprout","snack","slice","lantern","flowers"];
const frame=(hero,age,form=2,bondRank=3,ally=FAMILY_DUETS[hero].ally)=>({
  hero,ally,age,evo:form,bondRank,x:250,y:320,facing:1
});

function stage(s,t=0,reduced=false){
  const calls=[],actors=[];let depth=0;
  const state={globalAlpha:1,strokeStyle:"#fff",fillStyle:"#fff",lineWidth:1,
    font:"12px sans-serif",textAlign:"center",lineJoin:"round",lineCap:"round"};
  const ctx=new Proxy(state,{
    get(target,key){
      if(key in target)return target[key];
      if(key==="save")return()=>{depth++;calls.push(["save"]);};
      if(key==="restore")return()=>{depth--;assert.ok(depth>=0);calls.push(["restore"]);};
      if(key==="setLineDash")return values=>{
        assert.ok(values.every(Number.isFinite));calls.push(["dash",...values]);};
      if(key==="getLineDash")return()=>[];
      return(...args)=>{
        for(const a of args)if(typeof a==="number")assert.ok(Number.isFinite(a),String(key)+" nonfinite");
        calls.push([key,...args.map(a=>typeof a==="number"?Number(a.toFixed(3)):a)]);
      };
    },
    set(target,key,v){if(typeof v==="number")assert.ok(Number.isFinite(v));target[key]=v;return true;}
  });
  const copy=JSON.stringify(s);
  assert.equal(drawFamilyDuet(ctx,s,{x:0,y:0},t,(_ctx,actor)=>actors.push(actor),ROSTER,reduced),true);
  assert.equal(depth,0,"unbalanced Canvas stack");
  assert.equal(JSON.stringify(s),copy,"render must not mutate duet");
  assert.equal(actors.length,1);
  assert.ok(calls.length<1000,"unbounded drawing");
  return {calls,actor:actors[0]};
}
test("V322 · 6 canonical pairs have 6 unique real level-3 prop silhouettes in 5 evolutions",()=>{
  for(let f=0;f<5;f++){
    const shapes=[];
    for(let i=0;i<heroes.length;i++){
      const hero=heroes[i],s=frame(hero,27,f);
      const moment=legendaryDuetMoment(s);
      assert.equal(moment.kind,expected[i]);
      assert.equal(moment.stage,"gag");
      assert.equal(moment.hero,hero);
      assert.ok(Object.isFrozen(moment));
      assert.ok(Number.isFinite(moment.x)&&Number.isFinite(moment.y));
      const {calls,actor}=stage(s,55);
      assert.equal(actor.id,FAMILY_DUETS[hero].ally);
      assert.equal(actor._poseOverride,moment.guestPose);
      shapes.push(JSON.stringify(calls.filter(c=>["ellipse","rect","fillRect","quadraticCurveTo","lineTo"].includes(c[0]))));
    }
    assert.equal(new Set(shapes).size,6,"six bodies and six gags must not be colored copies");
  }
});
test("V322 · each rank-3 duet has four chapters, no extra impacts or range changes",()=>{
  assert.equal(FAMILY_DUET_LENGTH,120);
  assert.deepEqual([...FAMILY_DUET_BEATS],[42,66,90]);
  for(const hero of heroes)for(let f=0;f<5;f++){
    assert.equal(legendaryDuetMoment(frame(hero,8,f)),null);
    assert.equal(legendaryDuetMoment(frame(hero,18,f)).stage,"gag");
    assert.equal(legendaryDuetMoment(frame(hero,42,f)).stage,"borrowed-L");
    assert.equal(legendaryDuetMoment(frame(hero,111,f)).stage,"farewell");
    for(const beat of FAMILY_DUET_BEATS){
      assert.equal(familyDuetChoreography(frame(hero,beat,f)).impact,true);
      const near={x:250+45,y:320-29,w:20,h:20};
      const far={x:11000,y:320,w:20,h:20};
      assert.equal(familyDuetStrike(frame(hero,beat,f),FAMILY_DUET_BEATS.indexOf(beat),far),false);
      // The added doodles are NOT used for the hit test.
      assert.equal(familyDuetStrike(frame(hero,beat,f),FAMILY_DUET_BEATS.indexOf(beat),near),
        familyDuetStrike(frame(hero,beat,f,1),FAMILY_DUET_BEATS.indexOf(beat),near));
    }
  }
});
test("V322 · ranks 1-2 stay unchanged; all other 9 partners remain selectable",()=>{
  for(const hero of heroes){
    const choices=optionsForUPartner(hero);
    assert.equal(choices.length,9);
    for(const rank of [1,2]){
      const s=frame(hero,27,2,rank);
      assert.equal(legendaryDuetMoment(s),null);
      const {actor}=stage(s);
      assert.equal(actor._poseOverride,"idle");
    }
    for(const ally of choices.map(o=>o.id)){
      const input=frame(hero,27,2,3,ally);
      assert.equal(familyDuetChoreography(input).ally,ally);
      if(ally!==FAMILY_DUETS[hero].ally){
        assert.equal(legendaryDuetMoment(input),null);
        stage(input);
      }
    }
  }
});
test("V322 · level-3 accessibility draws identical static poses independent of clock",()=>{
  for(const hero of heroes)for(let f=0;f<5;f++)for(const age of [21,27,42,66,90,110]){
    const s=frame(hero,age,f);
    const a=stage(s,5,true),b=stage(s,925,true);
    assert.deepEqual(a,b,"reduced motion cannot depend on render clock "+hero);
    assert.equal(legendaryDuetMoment(s,true).still,true);
    for(const n of [0,1,2])assert.deepEqual(legendaryDuetMoment(s,true),legendaryDuetMoment(s,true));
  }
});
test("V322 · reject invalid peer props, including fake rank-3, without animation",()=>{
  for(const hero of heroes){
    for(const data of [{age:-1},{age:120},{bondRank:4},{bondRank:0},
      {evo:5},{facing:0},{x:Infinity},{y:NaN},{ally:"dragon",hero:"dragon"}]){
      const s={...frame(hero,27),...data};
      assert.equal(legendaryDuetMoment(s),null,JSON.stringify(data));
    }
  }
});

import {poseFingerprint} from "../characters/draw.js";
test("V322 · cached Canvas frame is invalidated by brake/turn and reduced motion",()=>{
 const base={state:"run",form:3,phase:2,speed:.8,vy:0,turnPulse:0,brake:0,
  anticipation:0,land:0,reduceMotion:false,castSlot:-1,look:{x:1,y:0}};
 const same={...base};assert.equal(poseFingerprint(base),poseFingerprint(same));
 for(const changed of [
  {brake:.75},{turnPulse:.83},{anticipation:.5},{reduceMotion:true}
 ]){
  assert.notEqual(poseFingerprint(base),poseFingerprint({...base,...changed}));
 }
});

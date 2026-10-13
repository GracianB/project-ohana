import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {STITCHO_WELCOME_BEATS,stitchoWelcomeBeat,drawStitchoWelcomeFX} from "../systems/intro-stitcho-stage.js";
import {stitchoWelcomeRig,stitchoFootwork} from "../characters/art/stitch.js";
import {STITCHO_VISUAL_H} from "../characters/art/stitcho.js";
import {poseFingerprint} from "../characters/draw.js";
import {WELCOME_CAST_ORDER,welcomeCastSpot,welcomeActorFit} from "../systems/intro-cast-fit.js";

test("V351 five Stitcho alien comedy acts and exact deterministic fourteen-second repeat",()=>{
 const frames=[[0,"idle"],[.42,"scout"],[.86,"taunt"],[1.27,"curl"],[1.97,"shock"],[2.68,"swagger"],[3.5,"idle"]];
 assert.equal(Object.keys(STITCHO_WELCOME_BEATS).length,5);
 for(const a of Object.values(STITCHO_WELCOME_BEATS))
  assert.ok(a.length===4&&a.every(Number.isFinite)&&a.every((v,i)=>!i||v>a[i-1]));
 for(const [t,phase] of frames){
  const b=stitchoWelcomeBeat(t);
  assert.equal(b.phase,phase,"frame "+t);
  assert.deepEqual(stitchoWelcomeBeat(t+14),b);
  for(const k of ["scout","taunt","curl","shock","swagger","antenna","tail","glow"])
   assert.ok(Number.isFinite(b[k])&&b[k]>=0&&b[k]<=1,k+" bound");
 }
});

test("V351 reduced motion is stationary and never emits front effects",()=>{
 for(const t of [0,.42,.86,1.27,1.97,2.68,14,NaN,Infinity]){
  const b=stitchoWelcomeBeat(t,true);
  assert.equal(b.phase,"idle");assert.equal(b.reduced,true);
  for(const key of ["scout","taunt","curl","shock","swagger","antenna","tail"])
   assert.equal(b[key],0);
  for(let form=0;form<5;form++){
   const rig=stitchoWelcomeRig({state:"idle",stitchoWelcome:b},form);
   assert.equal(rig.active,false);
   assert.equal(rig.head,0);assert.equal(rig.lift,0);assert.equal(rig.tail,0);
  }
 }
});

test("V351 Stitcho's real form-specific anatomy remains stable in all five evolutions",()=>{
 assert.deepEqual([...STITCHO_VISUAL_H],[64,72,80,88,96]);
 assert.equal(typeof stitchoFootwork,"function");
 assert.equal(WELCOME_CAST_ORDER.filter(x=>x==="stitcho").length,1);
 for(let f=0;f<5;f++){
  for(const t of [.42,.86,1.27,1.97,2.68]){
   const rig=stitchoWelcomeRig({state:"idle",stitchoWelcome:stitchoWelcomeBeat(t)},f);
   assert.equal(rig.active,true);
   for(const [key,value] of Object.entries(rig))
    if(typeof value==="number")assert.ok(Number.isFinite(value)&&Math.abs(value)<5,key+" "+f);
  }
  const baby=stitchoWelcomeRig({state:"idle",stitchoWelcome:stitchoWelcomeBeat(.86)},0);
  const grown=stitchoWelcomeRig({state:"idle",stitchoWelcome:stitchoWelcomeBeat(.86)},1);
  assert.ok(Math.abs(baby.armA)<Math.abs(grown.armA),"egg paws shorter than grown hands");
  assert.equal(stitchoWelcomeRig({state:"hurt",stitchoWelcome:stitchoWelcomeBeat(1.97)},f).active,false);
  assert.equal(stitchoWelcomeRig({state:"cast",stitchoWelcome:stitchoWelcomeBeat(.86)},f).active,false);
 }
 for(const width of [360,759,760,1366,1920]){
  const spot=welcomeCastSpot("stitcho",width,720,106);
  const fit=welcomeActorFit({width:73,height:117,centerOffsetX:5},106,spot.slotWidth);
  assert.ok(fit.paintedWidth<=spot.slotWidth*.88+1e-6);
  assert.ok(fit.paintedHeight<=106+1e-6);
 }
});

test("V351 only local finite FX: no gameplay attack sparks or entire-screen flash",()=>{
 const calls=[],g={addColorStop(...a){calls.push(["stop",...a]);}};
 const ctx=new Proxy({},{
  get(o,k){if(k in o)return o[k];
   if(k==="createRadialGradient")return (...a)=>{calls.push(["gradient",...a]);return g;};
   return (...a)=>{calls.push([k,...a]);};
  },
  set(o,k,v){o[k]=v;return true;}
 });
 for(const [t,shape] of [[.42,"arc"],[.86,"lineTo"],[1.27,"arc"],[1.97,"lineTo"],[2.68,"lineTo"]]){
  const start=calls.length;
  drawStitchoWelcomeFX(ctx,200,400,100,t,stitchoWelcomeBeat(t),"front");
  const batch=calls.slice(start);
  assert.equal(batch[0]?.[0],"save");assert.equal(batch.at(-1)?.[0],"restore");
  assert.ok(batch.some(c=>c[0]===shape),"missing "+shape+" for "+t);
  assert.ok(batch.flat().filter(x=>typeof x==="number").every(Number.isFinite));
  assert.ok(batch.filter(c=>["arc","ellipse","moveTo","lineTo"].includes(c[0]))
   .flat().filter(x=>typeof x==="number").every(x=>Math.abs(x)<650),"stage remains local");
 }
 const prior=calls.length;
 drawStitchoWelcomeFX(ctx,200,400,100,1.97,stitchoWelcomeBeat(1.97,true),"front");
 assert.deepEqual(calls.slice(prior).map(x=>x[0]),["save","restore"]);
 drawStitchoWelcomeFX(ctx,200,400,100,.86,stitchoWelcomeBeat(.86),"back");
 assert.ok(calls.slice(prior).some(x=>x[0]==="gradient"));
});

test("V351 pose cache differentiates all five nondecorative performances",()=>{
 const pose={state:"idle",form:4,stitchoWelcome:stitchoWelcomeBeat(.42)};
 const key=poseFingerprint(pose);
 for(const t of [.86,1.27,1.97,2.68])
  assert.notEqual(key,poseFingerprint({...pose,stitchoWelcome:stitchoWelcomeBeat(t)}));
 assert.notEqual(key,poseFingerprint({...pose,stitchoWelcome:null}));
 assert.equal(key,poseFingerprint(pose));
});

test("V351 uses actual stitch.js and keeps egg, spikes, visor, pack, rings, existing families",()=>{
 const art=readFileSync(new URL("../characters/art/stitch.js",import.meta.url),"utf8");
 const wrapper=readFileSync(new URL("../characters/art/stitcho.js",import.meta.url),"utf8");
 const intro=readFileSync(new URL("../systems/intro.js",import.meta.url),"utf8");
 const draw=readFileSync(new URL("../characters/draw.js",import.meta.url),"utf8");
 assert.match(wrapper,/export \{ default \} from "\.\/stitch\.js"/);
 for(const part of ["function drawHead(","function drawBiped(","function drawGallop(",
  "function drawBall(","function tailPart(","function rings(","function jetpack(",
  "function shoulderPlate(","function faceFor(","function stitchoFootwork("])
  assert.ok(art.includes(part),"real anatomy removed "+part);
 assert.match(art,/const welcome=stitchoWelcomeRig\(pose,f\)/);
 assert.match(art,/const ringY = .*f===4/);
 assert.match(intro,/stitchoWelcomeBeat\(loop,reduce\)/);
 assert.match(intro,/stitchoWelcome:stitchoBeat/);
 assert.match(draw,/pose\.stitchoWelcome=p\._introStitcho/);
 assert.match(draw,/pose\.stitchoWelcome\?\.shock/);
 assert.match(intro,/actor\("chispin"/);
 for(const id of ["dragon","dino","frita","pizza","yomi","cuerno","kilo"])
  assert.match(intro,new RegExp(id+"Welcome:"+id+"Beat"));
});

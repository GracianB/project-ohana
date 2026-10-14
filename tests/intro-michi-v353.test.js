import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {MICHI_WELCOME_BEATS,michiWelcomeBeat,drawMichiWelcomeFX} from "../systems/intro-michi-stage.js";
import {michiWelcomeRig,michiFootwork,MICHI_VISUAL_H} from "../characters/art/cat.js";
import {poseFingerprint} from "../characters/draw.js";
import {WELCOME_CAST_ORDER,welcomeCastSpot,welcomeActorFit} from "../systems/intro-cast-fit.js";

test("V353 Michi judges the family through five complete repeating theatrical acts",()=>{
 const frames=[[.1,"idle"],[3.32,"inspect"],[3.78,"sideeye"],
  [4.2,"groom"],[4.65,"flick"],[5.14,"purr"],[5.7,"idle"]];
 assert.equal(Object.keys(MICHI_WELCOME_BEATS).length,5);
 for(const beats of Object.values(MICHI_WELCOME_BEATS))
  assert.ok(beats.length===4&&beats.every(Number.isFinite)&&beats.every((x,i)=>!i||x>beats[i-1]));
 for(const [t,phase] of frames){
  const beat=michiWelcomeBeat(t);
  assert.equal(beat.phase,phase,"frame "+t);
  assert.deepEqual(michiWelcomeBeat(t+14),beat,"exact loop "+t);
  for(const k of ["inspect","sideeye","groom","flick","purr","ear","tail","wing","halo"])
   assert.ok(Number.isFinite(beat[k])&&beat[k]>=0&&beat[k]<=1,k+" bounds");
 }
});

test("V353 reduced-motion Michi is motionless but keeps all original silhouette features",()=>{
 for(const t of [0,3.32,3.78,4.2,4.65,5.14,14,NaN,Infinity]){
  const beat=michiWelcomeBeat(t,true);
  assert.equal(beat.phase,"idle");assert.equal(beat.reduced,true);
  for(const k of ["inspect","sideeye","groom","flick","purr","ear","tail","wing"])
   assert.equal(beat[k],0);
  for(let form=0;form<5;form++){
   const r=michiWelcomeRig({state:"idle",michiWelcome:beat},form);
   assert.equal(r.active,false);assert.equal(r.wing,0);assert.equal(r.head,0);
  }
 }
});

test("V353 original five cat evolutionary silhouettes and real wing root remain safe",()=>{
 assert.deepEqual(MICHI_VISUAL_H,[60,72,84,94,106]);
 assert.equal(typeof michiFootwork,"function");
 assert.equal(WELCOME_CAST_ORDER.filter(id=>id==="cat").length,1);
 for(let form=0;form<5;form++){
  for(const t of [3.32,3.78,4.2,4.65,5.14]){
   const v=michiWelcomeRig({state:"idle",michiWelcome:michiWelcomeBeat(t)},form);
   assert.equal(v.active,true);
   for(const [key,value] of Object.entries(v))
    if(typeof value==="number")assert.ok(Number.isFinite(value)&&Math.abs(value)<5,key+" form "+form);
   if(form<4)assert.equal(v.wing,0,"no fake wings in kitten, cat, cloud or lunar cat");
  }
  assert.equal(michiWelcomeRig({state:"hurt",michiWelcome:michiWelcomeBeat(4.2)},form).active,false);
  assert.equal(michiWelcomeRig({state:"cast",michiWelcome:michiWelcomeBeat(4.65)},form).active,false);
  assert.equal(michiWelcomeRig({state:"run",michiWelcome:michiWelcomeBeat(5.14)},form).active,false);
 }
 assert.ok(michiWelcomeRig({state:"idle",michiWelcome:michiWelcomeBeat(5.14)},4).wing>.35);
 const babe=michiWelcomeRig({state:"idle",michiWelcome:michiWelcomeBeat(4.2)},0);
 const adult=michiWelcomeRig({state:"idle",michiWelcome:michiWelcomeBeat(4.2)},1);
 assert.ok(Math.abs(babe.arm)<Math.abs(adult.arm),"baby kitten keeps its small paw performance");
 for(const width of [360,759,760,1280,1920]){
  const slot=welcomeCastSpot("cat",width,720,106);
  const fit=welcomeActorFit({width:91,height:113,centerOffsetX:3},106,slot.slotWidth);
  assert.ok(fit.paintedWidth<=slot.slotWidth*.88+1e-6);
  assert.ok(fit.paintedHeight<=106+1e-6);
 }
});

test("V353 Michi FX are local, finite and suppressed in accessibility mode",()=>{
 const calls=[],gradient={addColorStop(...a){calls.push(["stop",...a]);}};
 const ctx=new Proxy({},{
  get(o,k){if(k in o)return o[k];
   if(k==="createRadialGradient")return (...a)=>{calls.push(["gradient",...a]);return gradient;};
   return (...a)=>{calls.push([k,...a]);};
  },set(o,k,v){o[k]=v;return true;}
 });
 for(const [t,shape] of [[3.32,"arc"],[3.78,"lineTo"],[4.2,"arc"],[4.65,"arc"],[5.14,"lineTo"]]){
  const start=calls.length;
  drawMichiWelcomeFX(ctx,200,400,100,t,michiWelcomeBeat(t),"front");
  const part=calls.slice(start);
  assert.equal(part[0]?.[0],"save");assert.equal(part.at(-1)?.[0],"restore");
  assert.ok(part.some(a=>a[0]===shape),"michi beat effect "+t);
  assert.ok(part.flat().filter(x=>typeof x==="number").every(Number.isFinite));
  assert.ok(part.filter(a=>["arc","ellipse","lineTo","moveTo"].includes(a[0]))
   .flat().filter(x=>typeof x==="number").every(x=>Math.abs(x)<700),"local geometry");
 }
 const start=calls.length;
 drawMichiWelcomeFX(ctx,200,400,100,4.65,michiWelcomeBeat(4.65,true),"front");
 assert.deepEqual(calls.slice(start).map(x=>x[0]),["save","restore"]);
 drawMichiWelcomeFX(ctx,200,400,100,4.65,michiWelcomeBeat(4.65),"back");
 assert.ok(calls.slice(start).some(a=>a[0]==="gradient"));
});

test("V353 cached Canvas fingerprints redraw actual eye, tail and feather changes",()=>{
 const pose={state:"idle",form:4,michiWelcome:michiWelcomeBeat(3.32)};
 const original=poseFingerprint(pose);
 for(const t of [3.78,4.2,4.65,5.14])
  assert.notEqual(original,poseFingerprint({...pose,michiWelcome:michiWelcomeBeat(t)}));
 assert.notEqual(original,poseFingerprint({...pose,michiWelcome:null}));
 assert.equal(original,poseFingerprint(pose));
});

test("V353 authentic cat.js drawing, baby-to-guardian anatomy and eight existing actors preserved",()=>{
 const art=readFileSync(new URL("../characters/art/cat.js",import.meta.url),"utf8");
 const intro=readFileSync(new URL("../systems/intro.js",import.meta.url),"utf8");
 const draw=readFileSync(new URL("../characters/draw.js",import.meta.url),"utf8");
 for(const part of ["function solve(","function drawMichiPortrait(","function moonSoul("])
    assert.ok(art.includes(part),"cat anatomy missing "+part);
 assert.match(art,/const welcome=michiWelcomeRig\(safe,f\)/);
 assert.match(art,/if\(f===4\)/);
 assert.match(art,/const count=f===4\?3:f===3\?2:1/);
 assert.match(intro,/michiWelcomeBeat\(loop,reduce\)/);
 assert.match(intro,/michiWelcome:michiBeat/);
 assert.match(draw,/pose\.michiWelcome=p\._introMichi/);
 assert.match(draw,/pose\.michiWelcome\?\.purr/);
 for(const id of ["dragon","dino","frita","pizza","yomi","cuerno","kilo","stitcho","chispin"])
  assert.match(intro,new RegExp(id+"Welcome:"+id+"Beat"));
});

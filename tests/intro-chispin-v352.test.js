import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CHISPIN_WELCOME_BEATS,chispinWelcomeBeat,drawChispinWelcomeFX} from "../systems/intro-chispin-stage.js";
import {chispinWelcomeRig,chispinFootwork} from "../characters/art/pikachu.js";
import {CHISPIN_VISUAL_H} from "../characters/art/chispin.js";
import {poseFingerprint} from "../characters/draw.js";
import {WELCOME_CAST_ORDER,welcomeCastSpot,welcomeActorFit} from "../systems/intro-cast-fit.js";

test("V352 Chispin tells five distinct real 14-second mini-storm beats",()=>{
 const frames=[[.01,"idle"],[.42,"sniff"],[.90,"prank"],[1.72,"charge"],[2.35,"hiccup"],[2.97,"cloud"],[3.7,"idle"]];
 assert.equal(Object.keys(CHISPIN_WELCOME_BEATS).length,5);
 for(const times of Object.values(CHISPIN_WELCOME_BEATS))
  assert.ok(times.length===4&&times.every(Number.isFinite)&&times.every((x,i)=>!i||x>times[i-1]));
 for(const [t,phase] of frames){
  const w=chispinWelcomeBeat(t);
  assert.equal(w.phase,phase,"time "+t);
  assert.deepEqual(chispinWelcomeBeat(t+14),w);
  for(const k of ["sniff","prank","charge","hiccup","cloud","ear","coil","gills","halo"])
   assert.ok(Number.isFinite(w[k])&&w[k]>=0&&w[k]<=1,k+" bounds");
 }
});

test("V352 reduced motion disables body animation and forward effects without altering forms",()=>{
 for(const t of [0,.42,.9,1.72,2.35,2.97,14,NaN,Infinity]){
  const w=chispinWelcomeBeat(t,true);
  assert.equal(w.phase,"idle");assert.equal(w.reduced,true);
  for(const k of ["sniff","prank","charge","hiccup","cloud","ear","coil","gills"])
   assert.equal(w[k],0);
  for(let form=0;form<5;form++){
   const rig=chispinWelcomeRig({state:"idle",chispinWelcome:w},form);
   assert.equal(rig.active,false);
   assert.equal(rig.ear,0);assert.equal(rig.tail,0);assert.equal(rig.lift,0);
  }
 }
});

test("V352 all five real Chispin anatomies retain distinct connected gestures",()=>{
 assert.deepEqual(CHISPIN_VISUAL_H,[55,70,85,102,120]);
 assert.equal(typeof chispinFootwork,"function");
 assert.equal(WELCOME_CAST_ORDER.filter(id=>id==="chispin").length,1);
 for(let form=0;form<5;form++){
  for(const t of [.42,.9,1.72,2.35,2.97]){
   const v=chispinWelcomeRig({state:"idle",chispinWelcome:chispinWelcomeBeat(t)},form);
   assert.equal(v.active,true);
   for(const [key,value] of Object.entries(v))
    if(typeof value==="number")assert.ok(Number.isFinite(value)&&Math.abs(value)<5,key+" form "+form);
  }
  for(const state of ["hurt","cast","dead","run"]){
   assert.equal(chispinWelcomeRig({state,chispinWelcome:chispinWelcomeBeat(1.72)},form).active,false);
  }
 }
 assert.ok(Math.abs(chispinWelcomeRig({state:"idle",chispinWelcome:chispinWelcomeBeat(1.72)},0).armA)<
   Math.abs(chispinWelcomeRig({state:"idle",chispinWelcome:chispinWelcomeBeat(1.72)},2).armA),"small baby arms");
 assert.ok(Math.abs(chispinWelcomeRig({state:"idle",chispinWelcome:chispinWelcomeBeat(1.72)},3).armA)<
   Math.abs(chispinWelcomeRig({state:"idle",chispinWelcome:chispinWelcomeBeat(1.72)},2).armA),"cloud giant slower");
 for(const width of [360,759,760,1280,1920]){
  const slot=welcomeCastSpot("chispin",width,720,106);
  const f=welcomeActorFit({width:79,height:112,centerOffsetX:3},106,slot.slotWidth);
  assert.ok(f.paintedWidth<=slot.slotWidth*.88+1e-6);
  assert.ok(f.paintedHeight<=106+1e-6);
 }
});

test("V352 physical-effect cues are finite and local without projectiles",()=>{
 const calls=[],gradient={addColorStop(...a){calls.push(["stop",...a]);}};
 const ctx=new Proxy({},{
  get(o,k){if(k in o)return o[k];
   if(k==="createRadialGradient")return (...args)=>{calls.push(["gradient",...args]);return gradient;};
   return (...args)=>{calls.push([k,...args]);};
  },set(o,k,v){o[k]=v;return true;}
 });
 for(const [t,shape] of [[.42,"arc"],[.90,"lineTo"],[1.72,"lineTo"],[2.35,"lineTo"],[2.97,"arc"]]){
  const start=calls.length;
  drawChispinWelcomeFX(ctx,200,400,100,t,chispinWelcomeBeat(t),"front");
  const part=calls.slice(start);
  assert.equal(part[0]?.[0],"save");assert.equal(part.at(-1)?.[0],"restore");
  assert.ok(part.some(a=>a[0]===shape),"stage effect "+t);
  assert.ok(part.flat().filter(x=>typeof x==="number").every(Number.isFinite));
  assert.ok(part.filter(a=>["arc","ellipse","lineTo","moveTo"].includes(a[0]))
   .flat().filter(x=>typeof x==="number").every(x=>Math.abs(x)<700),"local geometry");
 }
 const start=calls.length;
 drawChispinWelcomeFX(ctx,200,400,100,2.35,chispinWelcomeBeat(2.35,true),"front");
 assert.deepEqual(calls.slice(start).map(x=>x[0]),["save","restore"]);
 drawChispinWelcomeFX(ctx,200,400,100,1.72,chispinWelcomeBeat(1.72),"back");
 assert.ok(calls.slice(start).some(a=>a[0]==="gradient"));
});

test("V352 Chispin original presentCanvas redraws each facial, spring and cloud beat",()=>{
 const pose={state:"idle",form:4,chispinWelcome:chispinWelcomeBeat(.42)};
 const key=poseFingerprint(pose);
 for(const t of [.9,1.72,2.35,2.97])
  assert.notEqual(key,poseFingerprint({...pose,chispinWelcome:chispinWelcomeBeat(t)}));
 assert.notEqual(key,poseFingerprint({...pose,chispinWelcome:null}));
 assert.equal(key,poseFingerprint(pose));
});

test("V352 no substituted drawing, no gameplay rewrite and seven earlier personalities preserved",()=>{
 const art=readFileSync(new URL("../characters/art/pikachu.js",import.meta.url),"utf8");
 const wrapper=readFileSync(new URL("../characters/art/chispin.js",import.meta.url),"utf8");
 const intro=readFileSync(new URL("../systems/intro.js",import.meta.url),"utf8");
 const draw=readFileSync(new URL("../characters/draw.js",import.meta.url),"utf8");
 for(const component of ["function springTail(","function gill(","function figure(",
  "function opts(","function stormSoul(","function paw(","function footOval(",
  "function drawChispinFootwork(","function cloud(","function bolt("])
  assert.ok(art.includes(component),"do not remove original "+component);
 assert.match(wrapper,/export \{default\} from "\.\/chispa\.js"/);
 assert.match(art,/const welcome=chispinWelcomeRig\(pose,f\)/);
 assert.match(art,/o\.mouthSpark=0;o\.skyBolt=0;o\.whip=0/);
 assert.match(intro,/chispinWelcomeBeat\(loop,reduce\)/);
 assert.match(intro,/chispinWelcome:chispinBeat/);
 assert.match(intro,/actor\("stitcho"/);
 assert.match(draw,/pose\.chispinWelcome=p\._introChispin/);
 assert.match(draw,/pose\.chispinWelcome\?\.charge/);
 for(const id of ["dragon","dino","frita","pizza","yomi","cuerno","kilo","stitcho"])
  assert.match(intro,new RegExp(id+"Welcome:"+id+"Beat"));
});

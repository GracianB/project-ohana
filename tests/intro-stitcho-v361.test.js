import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {stitchoWelcomeBeat,STITCHO_FAMILY_REACTIONS} from "../systems/intro-stitcho-stage.js";
import {stitchoWelcomeRig,stitchoFootwork} from "../characters/art/stitch.js";
import {poseFingerprint} from "../characters/draw.js";

const pose=(t,form=0)=>({state:"idle",form,stitchoWelcome:stitchoWelcomeBeat(t)});
const SCENES=[["dragon",3.70],["chase",5.72],["yomi",8.45],["dino",12.2]];

test("V361 Stitcho lives through 14 seconds in five real and distinct forms",()=>{
 for(let f=0;f<5;f++){
  const frames=[0,.42,.86,1.27,2.68,3.7,5.72,8.45,11,12.2,13.9]
   .map(t=>stitchoWelcomeRig(pose(t,f),f));
  assert.ok(frames.every(x=>x.active),"not a frozen sprite after the first prank, F"+f);
  assert.ok(new Set(frames.map(x=>x.torsoX.toFixed(4))).size>=4,
    "egg shell/chest never stops breathing for F"+f);
  for(const x of frames){
   assert.ok(x.torsoX>=.91&&x.torsoX<=1.09);
   assert.ok(x.torsoY>=.93&&x.torsoY<=1.08);
   for(const value of Object.values(x)){
    if(typeof value==="number")assert.ok(Number.isFinite(value)&&Math.abs(value)<8);
   }
  }
 }
 const baby=stitchoWelcomeRig(pose(.875,0),0);
 const cosmic=stitchoWelcomeRig(pose(.875,4),4);
 assert.ok(Math.abs(baby.torsoX-1)>Math.abs(cosmic.torsoX-1),
  "living egg breathes more than Nebula");
 assert.ok(Math.abs(baby.torsoX-stitchoWelcomeRig(pose(2.625,0),0).torsoX)>.11,
  "visibly opening and closing egg shell, not minuscule movement");
});

test("V361 4 film-wide expressions notice Dragon, snack chase, Yomi and Dino",()=>{
 assert.equal(Object.keys(STITCHO_FAMILY_REACTIONS).length,4);
 for(const [name,t] of SCENES){
  const b=stitchoWelcomeBeat(t);
  assert.equal(b.phase,"idle","no battle attack injected");
  assert.ok(b[name]>.72,name+" cue must be visible");
  assert.deepEqual(b,stitchoWelcomeBeat(t+14),"exact loop");
  const egg=stitchoWelcomeRig(pose(t,0),0),grown=stitchoWelcomeRig(pose(t,3),3);
  assert.ok(Math.abs(egg.head)>.035,"actual head responds");
  assert.ok(Math.abs(egg.armA)>.10,"egg's original tiny front paw moves");
  assert.ok(Math.abs(egg.armA)<Math.abs(grown.armA),"baby paws not adult claws");
  assert.ok(Math.abs(grown.ear)>.04,"real connected ear");
  for(const other of SCENES.map(x=>x[0]).filter(x=>x!==name))
   assert.equal(b[other],0,"one named family story at a time");
 }
 for(const row of Object.values(STITCHO_FAMILY_REACTIONS))
  assert.ok(row.length===4&&row.every((v,i)=>Number.isFinite(v)&&(!i||v>row[i-1])));
});

test("V361 anatomy is attached: real antenna, ears, eyes, arms, hips and planted feet",()=>{
 const art=readFileSync(new URL("../characters/art/stitch.js",import.meta.url),"utf8");
 for(const fn of ["function drawHead(","function antenna(","function earFin(",
  "function leg(","function arm(","function drawBiped(","function drawGallop(",
  "function drawBall(","function shoulderPlate(","function tailPart(",
  "function jetpack(","function rings(","function stitchoFootwork("])
  assert.ok(art.includes(fn),"native original artwork missing: "+fn);
 assert.match(art,/if\(welcome\.active\)ctx\.scale\(welcome\.torsoX,welcome\.torsoY\)/);
 assert.match(art,/const upper = \(fn\) =>/);
 assert.match(art,/ctx\.translate\(0,hy\)/);
 assert.match(art,/const shF = S\.egg/);
 assert.match(art,/const shB = S\.egg/);
 assert.match(art,/face\.earFlick\+=living\.ear/);
 assert.match(art,/face\.ant="tuck"/);
 assert.match(art,/if \(S\.tech\) shoulderPlate/);
 assert.match(art,/if \(f === 4\) rings\(/);
 assert.equal(typeof stitchoFootwork,"function");
});

test("V361 egg paws stay tiny; F2 spikes, F3 visor and F4 cosmic rings remain form-specific",()=>{
 const art=readFileSync(new URL("../characters/art/stitch.js",import.meta.url),"utf8");
 assert.match(art,/egg: true, hx: 1/);
 assert.match(art,/spikes: true, bigClaw: true/);
 assert.match(art,/tech: true/);
 assert.match(art,/final: true/);
 assert.match(art,/if \(S\.egg\) \{/);
 assert.match(art,/if \(S\.spikes\) \{/);
 assert.match(art,/if \(S\.tech\) \{/);
 assert.match(art,/if\(S\.final\)\{/);
 assert.match(art,/const baby=f===0\?\.56:1/);
 assert.match(art,/f >= 2 && st === "run"/);
 assert.match(art,/pose\.move === "roll"/);
 assert.match(art,/pose\.move === "chaos"/);
});

test("V361 reduced-motion, damage and the real J/K/L/U never inherit welcome gestures",()=>{
 for(const t of [0,.42,1.27,3.7,5.72,8.45,12.2,13.9,NaN,Infinity]){
  const beat=stitchoWelcomeBeat(t,true);
  assert.equal(beat.phase,"idle");
  for(const name of ["dragon","chase","yomi","dino"])assert.equal(beat[name],0);
  const r=stitchoWelcomeRig({state:"idle",stitchoWelcome:beat},4);
  assert.equal(r.active,false);assert.equal(r.torsoX,1);assert.equal(r.torsoY,1);
 }
 for(const state of ["run","jump","fall","glide","attack","cast","wall","hurt","dead","victory"]){
  const r=stitchoWelcomeRig({state,stitchoWelcome:stitchoWelcomeBeat(3.7)},4);
  assert.equal(r.active,false,"combat state "+state);
  assert.equal(r.armA,0);assert.equal(r.armB,0);
 }
 assert.equal(stitchoWelcomeRig({state:"idle"},0).active,false);
 assert.equal(stitchoWelcomeRig({state:"idle",reduceMotion:true,stitchoWelcome:stitchoWelcomeBeat(5.72)},0).active,false);
});

test("V361 cache changes for quiet antenna breathing and four expressions, all ten actors survive",()=>{
 const key=t=>poseFingerprint(pose(t,4));
 assert.notEqual(key(.875),key(2.625),"same old sprite cannot be cached");
 for(const [t,off] of [[3.70,3.1],[5.72,4.6],[8.45,7.3],[12.2,11]])
  assert.notEqual(key(t),key(off));
 assert.deepEqual(stitchoWelcomeBeat(0),stitchoWelcomeBeat(14));
 assert.deepEqual(stitchoWelcomeRig(pose(0),0),stitchoWelcomeRig(pose(14),0));
 const intro=readFileSync(new URL("../systems/intro.js",import.meta.url),"utf8");
 const draw=readFileSync(new URL("../characters/draw.js",import.meta.url),"utf8");
 assert.match(intro,/stitchoFamilyReaction/);
 assert.match(intro,/stitchoWelcome:stitchoBeat/);
 assert.match(draw,/pose\.stitchoWelcome\?\.breath/);
 for(const name of ["dragon","dino","frita","pizza","yomi","cuerno","kilo","chispin","michi"])
  assert.ok(intro.includes(name+"Welcome:"),"missing colleague "+name);
});

import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {kiloWelcomeBeat,KILO_FAMILY_REACTIONS} from "../systems/intro-kilo-stage.js";
import {kiloWelcomeRig,kiloFootwork} from "../characters/art/lilo.js";
import {poseFingerprint} from "../characters/draw.js";
const pose=(t,form=0)=>({state:"idle",form,kiloWelcome:kiloWelcomeBeat(t)});

test("V360 Kilo plays four more family scenes, each in a separate 14-second cue",()=>{
 const samples=[["dragon",3.67],["chase",5.72],["yomi",8.45],["dino",12.2]];
 assert.equal(Object.keys(KILO_FAMILY_REACTIONS).length,4);
 for(const [name,t] of samples){
  const beat=kiloWelcomeBeat(t);
  assert.equal(beat.phase,"idle","supporting reactions never become a spell/attack");
  assert.ok(beat[name]>.75,"Kilo must notice "+name);
  assert.deepEqual(kiloWelcomeBeat(t+14),beat,"exact 14s loop "+name);
  const rig=kiloWelcomeRig(pose(t,2),2);
  assert.ok(rig.active&&Math.abs(rig.head)>.05);
  assert.ok(Math.abs(rig.lift)>.2);
  for(const [other] of samples.filter(x=>x[0]!==name))
   assert.equal(beat[other],0,"no two family reactions accidentally overlap");
 }
 for(const row of Object.values(KILO_FAMILY_REACTIONS))
  assert.ok(row.length===4&&row.every((n,i)=>Number.isFinite(n)&&(!i||n>row[i-1])));
});

test("V360 Kilo has true five-form chest breathing even between song beats",()=>{
 for(let f=0;f<5;f++){
  const samples=[0,.875,2.625,3.7,4.88,6.5,8.45,10,12.2,13.91];
  const frames=samples.map(t=>kiloWelcomeRig(pose(t,f),f));
  assert.ok(frames.every(x=>x.active),"original living rig F"+f);
  assert.ok(new Set(frames.map(x=>x.ribX.toFixed(4))).size>=4,
    "no freeze after two seconds in F"+f);
  for(const x of frames){
   assert.ok(x.ribX>=.91&&x.ribX<=1.09);
   assert.ok(x.ribY>=.93&&x.ribY<=1.07);
   assert.ok(x.hair>=0&&x.hair<=1);
   if(f<4)assert.equal(x.wing,0,"angel wings belong ONLY to F4");
   for(const val of Object.values(x))
    if(typeof val==="number")assert.ok(Number.isFinite(val)&&Math.abs(val)<7);
  }
 }
 const baby=kiloWelcomeRig(pose(.875,0),0);
 const royal=kiloWelcomeRig(pose(.875,3),3);
 assert.ok(Math.abs(baby.ribX-1)>Math.abs(royal.ribX-1),
    "baby tummy must read stronger than Super Kilo's corset");
 assert.ok(Math.abs(baby.ribX-kiloWelcomeRig(pose(2.625,0),0).ribX)>.095);
});

test("V360 original IK arms and both ukulele hands remain rooted to the same breathing torso",()=>{
 const art=readFileSync(new URL("../characters/art/lilo.js",import.meta.url),"utf8");
 const names=["function ik(","function solve(","function ponytail(","function wings(",
   "function torso(","function uke(","function cape(","function dressPath(",
   "function head(","function drawCrawl(","function drawKiloFootwork("];
 for(const n of names)assert.ok(art.includes(n),"original artwork was replaced: "+n);
 assert.match(art,/if\(life\.active\)ctx\.scale\(life\.ribX,life\.ribY\)/);
 assert.match(art,/ctx\.translate\(r\.hipX, hipY\)/);
 assert.match(art,/const e = ik\(ctx, R, 4, sy \+ 3, r\.handF\[0\]/);
 assert.match(art,/ik\(ctx, R, -5, sy \+ 3, r\.handB\[0\]/);
 assert.match(art,/r\.handB=\[xF\+al\*\.78,sy\+\.5\]/);
 assert.match(art,/r\.handF=\[xF\+1,sy\+al\*\.60\+welcome\.chase\*1\.8\]/);
 assert.match(art,/if\(reaction>\.35 && f!==3 && f>=1 && welcome\.chase>\.30\)/);
 assert.match(art,/if \(f === 3\) \{\s*const hb = r\.staffUp/);
 assert.match(art,/if \(f === 4 && !dead\) wings/);
 assert.equal(typeof kiloFootwork,"function");
});

test("V360 authentic clothes, ponytail, baby pacifier, F3 staff and F4 angel wing are not lost",()=>{
 const art=readFileSync(new URL("../characters/art/lilo.js",import.meta.url),"utf8");
 assert.match(art,/if \(f === 0\) \{/);
 assert.match(art,/if \(f === 2\) \{/);
 assert.match(art,/if \(f === 4\) hemY/);
 assert.doesNotMatch(art,/if \(f === 3\) cape\(ctx/,"fourth form no longer hides behind a cape");
 assert.match(art,/if \(f === 3\) \{\s*const hb/);
 assert.match(art,/if \(f === 4 && !dead\) wings/);
 assert.match(art,/r\.paci = false/);
 assert.match(art,/ponytail\(ctx, R, pose, f, d\.hr, r\)/);
 assert.match(art,/if\(welcome\.active\)\{/);
});

test("V360 reduced-motion stills and gameplay J/K/L/U never inherit acting",()=>{
 for(const t of [0,.7,3.67,5.72,8.45,12.2,13.8,14,Infinity,NaN]){
  const b=kiloWelcomeBeat(t,true);
  for(const key of ["dragon","chase","yomi","dino"])assert.equal(b[key],0);
  const r=kiloWelcomeRig({state:"idle",kiloWelcome:b},4);
  assert.equal(r.active,false);
  assert.equal(r.ribX,1);assert.equal(r.ribY,1);assert.equal(r.wing,0);
 }
 for(const state of ["run","jump","glide","attack","cast","hurt","dead","victory"]){
  const a=kiloWelcomeRig({state,kiloWelcome:kiloWelcomeBeat(3.67)},4);
  assert.equal(a.active,false,"canonical Kilo state is untouchable: "+state);
  assert.equal(a.armFront,0);assert.equal(a.armBack,0);
 }
 assert.equal(kiloWelcomeRig({state:"idle"},4).active,false);
 assert.equal(kiloWelcomeRig({state:"idle",reduceMotion:true,kiloWelcome:kiloWelcomeBeat(.71)},4).active,false);
});

test("V360 Kilo quiet diaphragm and four new cues invalidate actual painting cache",()=>{
 const key=t=>poseFingerprint(pose(t,4));
 assert.notEqual(key(.875),key(2.625),"idle body must be redrawn");
 for(const [t,off] of [[3.67,2.96],[5.72,4.7],[8.45,7.35],[12.2,11.15]])
  assert.notEqual(key(t),key(off));
 assert.deepEqual(kiloWelcomeBeat(0),kiloWelcomeBeat(14));
 assert.deepEqual(kiloWelcomeRig(pose(0,0),0),kiloWelcomeRig(pose(14,0),0));
});

test("V360 real intro keeps all other nine independent characters and no combat effects",()=>{
 const intro=readFileSync(new URL("../systems/intro.js",import.meta.url),"utf8");
 const draw=readFileSync(new URL("../characters/draw.js",import.meta.url),"utf8");
 assert.match(intro,/kiloWelcome:kiloBeat/);
 assert.match(intro,/kiloFamilyReaction/);
 assert.match(draw,/pose\.kiloWelcome\?\.breath/);
 for(const n of ["dragon","dino","frita","pizza","yomi","cuerno","stitcho","chispin","michi"])
  assert.ok(intro.includes(n+"Welcome:"),"existing star must not vanish: "+n);
 assert.doesNotMatch(intro,/kiloBeat\.dragon[^;]*damage\(/);
});

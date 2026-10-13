import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {cuernoWelcomeBeat,CUERNO_FAMILY_REACTIONS} from "../systems/intro-cuerno-stage.js";
import {cuernoWelcomeAnatomy,cuernoSoulBeat,cuernoRitualBody} from "../characters/art/cuerno.js";
import {poseFingerprint} from "../characters/draw.js";
const pose=(t,f=0)=>({state:"idle",form:f,cuernoWelcome:cuernoWelcomeBeat(t)});

test("V359 five Cuerno anatomies breathe without replacing a horn by a horse",()=>{
 for(let f=0;f<5;f++){
  const frames=[0,.5,1.08,2.6,3.7,7.25,8.43,9.8,12.0,13.9]
   .map(t=>cuernoWelcomeAnatomy(pose(t,f),f));
  assert.ok(frames.every(a=>a.active),"connected native rig "+f);
  assert.ok(new Set(frames.map(a=>a.bodyX.toFixed(4))).size>=4,"not frozen");
  for(const a of frames){
   assert.ok(a.bodyX>.90&&a.bodyX<1.1);
   assert.ok(a.bodyY>.92&&a.bodyY<1.09);
   for(const val of Object.values(a))if(typeof val==="number")assert.ok(Number.isFinite(val)&&Math.abs(val)<9);
   if(f<2){
    assert.equal(a.hoof,0,"F0/F1 NEVER gain hooves");
    assert.equal(a.wing,0,"F0/F1 NEVER gain wings");
    assert.equal(a.mane,0,"F0/F1 NEVER gain a horse mane");
    assert.equal(a.tail,0,"F0/F1 NEVER gain a horse tail");
   }
   if(f===2)assert.equal(a.wing,0,"foal has no wings");
  }
 }
 const baby=cuernoWelcomeAnatomy(pose(.5,0),0);
 const mature=cuernoWelcomeAnatomy(pose(.5,4),4);
 assert.ok(Math.abs(baby.bodyX-1)>Math.abs(mature.bodyX-1),
  "sentient newborn horn breathes more than mature unicorn");
});

test("V359 musical horn, dragon sneeze and Yomi lantern encounters are physically distinct",()=>{
 const scenes=[["melody",1.08],["dragon",3.7],["yomi",8.43]];
 assert.equal(Object.keys(CUERNO_FAMILY_REACTIONS).length,3);
 for(const [key,t] of scenes){
  const b=cuernoWelcomeBeat(t);
  assert.equal(b.phase,"idle");
  assert.ok(b[key]>.65,key+" should read");
  assert.deepEqual(cuernoWelcomeBeat(t+14),b);
  const f3=cuernoWelcomeAnatomy(pose(t,3),3);
  assert.ok(Math.abs(f3.tilt)>.02);
  assert.ok(Math.abs(f3.lift)>.20);
  for(const other of scenes.map(x=>x[0]).filter(x=>x!==key))
   assert.equal(b[other],0,"no overlap between family scenes");
 }
 for(const span of Object.values(CUERNO_FAMILY_REACTIONS))
  assert.ok(span.length===4&&span.every((x,i)=>Number.isFinite(x)&&(!i||x>span[i-1])));
});

test("V359 form dispatch preserves the real horn, orb, four-hoof foal and two winged adult rigs",()=>{
 const s=readFileSync(new URL("../characters/art/cuerno.js",import.meta.url),"utf8");
 for(const line of ["function drawLivingHorn(","function drawFirstBody(",
   "function drawRainbowFoal(","function drawStellarUnicorn(","function drawAuroraUnicorn(",
   "drawRootedTail(","cuernoLegPose(","cuernoWingPose(",
   "if (f === 0) { drawLivingHorn(","if (f === 1) { drawFirstBody(",
   "if (f === 2) { drawRainbowFoal(","if (f === 3) { drawStellarUnicorn("])
  assert.ok(s.includes(line),"cannot substitute form with old generic sprite "+line);
 assert.equal((s.match(/if\(intro\.active\)ctx\.scale\(intro\.bodyX,intro\.bodyY\)/g)||[]).length,5);
 const overlayOnly=s.slice(s.indexOf("function drawCuernoOverlays("),s.indexOf("function drawLivingHorn("));
 assert.ok(!overlayOnly.includes("if(intro.active)"),"form-only anatomy cannot leak into overlays");
 assert.match(s,/The F0 baby is only a sentient horn/);
 assert.match(s,/F1 · Destello: a SINGLE spherical face/);
 assert.match(s,/F2 · First foal body, precisely FOUR articulated legs/);
 assert.equal(typeof cuernoSoulBeat,"function");
 assert.equal(typeof cuernoRitualBody,"function");
});

test("V359 genuine accessibility and combat isolation: no new magic, wings or legs",()=>{
 for(const t of [0,.5,1.08,3.7,8.43,10.2,Infinity,NaN]){
  const b=cuernoWelcomeBeat(t,true),a=cuernoWelcomeAnatomy({state:"idle",cuernoWelcome:b},4);
  assert.equal(b.melody,0);assert.equal(b.dragon,0);assert.equal(b.yomi,0);
  assert.equal(a.active,false);assert.equal(a.bodyX,1);assert.equal(a.bodyY,1);
 }
 for(const state of ["dead","hurt","attack","cast","run","jump","glide","victory"]){
  const a=cuernoWelcomeAnatomy({state,cuernoWelcome:cuernoWelcomeBeat(3.7)},4);
  assert.equal(a.active,false);
  assert.equal(a.hoof,0);assert.equal(a.wing,0);
 }
 assert.equal(cuernoWelcomeAnatomy({state:"idle"},0).active,false);
 assert.equal(cuernoWelcomeAnatomy({state:"idle",reduceMotion:true,cuernoWelcome:cuernoWelcomeBeat(1.08)},0).active,false);
});

test("V359 every family scene and slow native respiration invalidates pose cache",()=>{
 const key=t=>poseFingerprint(pose(t,4));
 assert.notEqual(key(.5),key(2.3));
 for(const [now,old] of [[1.08,.2],[3.7,3.1],[8.43,7.6]])
  assert.notEqual(key(now),key(old));
 assert.deepEqual(cuernoWelcomeBeat(0),cuernoWelcomeBeat(14));
 assert.deepEqual(cuernoWelcomeAnatomy(pose(0),0),cuernoWelcomeAnatomy(pose(14),0));
});

test("V359 the nine other intros and genuine original Cuerno Canvas are preserved",()=>{
 const intro=readFileSync(new URL("../systems/intro.js",import.meta.url),"utf8");
 const draw=readFileSync(new URL("../characters/draw.js",import.meta.url),"utf8");
 assert.match(intro,/cuernoFamilyReaction/);
 assert.match(intro,/cuernoWelcome:cuernoBeat/);
 assert.match(draw,/pose\.cuernoWelcome\?\.dragon/);
 assert.match(draw,/pose\.cuernoWelcome\?\.breath/);
 for(const name of ["dragon","dino","frita","pizza","yomi","kilo","stitcho","chispin","michi"])
  assert.ok(intro.includes(name+"Welcome:"),"missing original "+name);
});

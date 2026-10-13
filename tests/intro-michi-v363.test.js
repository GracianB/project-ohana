import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {michiWelcomeBeat,MICHI_FAMILY_REACTIONS} from "../systems/intro-michi-stage.js";
import {michiWelcomeRig,michiFootwork} from "../characters/art/cat.js";
import {poseFingerprint} from "../characters/draw.js";
const pose=(t,form=0)=>({state:"idle",form,michiWelcome:michiWelcomeBeat(t)});
const FAMILY=[["melody",1.0],["spark",2.08],["chase",6.0],["yomi",8.45],["dino",12.2]];

test("V363 Michi original five forms continue breathing between her five theatrical acts",()=>{
 for(let f=0;f<5;f++){
  const frames=[0,.7,1.0,2.08,3.32,4.2,5.14,6.0,8.45,10.0,12.2,13.9]
    .map(t=>michiWelcomeRig(pose(t,f),f));
  assert.ok(frames.every(frame=>frame.active),"live cat F"+f);
  assert.ok(new Set(frames.map(x=>x.torsoX.toFixed(4))).size>=4,
    "the native torso cannot freeze at F"+f);
  for(const frame of frames){
   assert.ok(frame.torsoX>=.9&&frame.torsoX<=1.1);
   assert.ok(frame.torsoY>=.92&&frame.torsoY<=1.08);
   if(f!==4)assert.equal(frame.wing,0,"feathers belong ONLY to Michi Eclipse");
   for(const v of Object.values(frame))if(typeof v==="number")
     assert.ok(Number.isFinite(v)&&Math.abs(v)<7);
  }
 }
 const baby=michiWelcomeRig(pose(.7,0),0),guardian=michiWelcomeRig(pose(.7,4),4);
 assert.ok(Math.abs(baby.torsoX-1)>Math.abs(guardian.torsoX-1),
   "Michito belly more expressive than Eclipse armored torso");
 assert.ok(Math.abs(baby.torsoX-michiWelcomeRig(pose(2.1,0),0).torsoX)>.10);
});

test("V363 five family responses: music, sparks, food chase, lantern and dino",()=>{
 assert.equal(Object.keys(MICHI_FAMILY_REACTIONS).length,5);
 for(const [name,t] of FAMILY){
  const b=michiWelcomeBeat(t);
  assert.equal(b.phase,"idle","do not transform cat's response into gameplay cast");
  assert.ok(b[name]>.60,name+" reaction should clearly read");
  assert.deepEqual(b,michiWelcomeBeat(t+14),"true fourteen second looping");
  const rig=michiWelcomeRig(pose(t,1),1);
  assert.ok(Math.abs(rig.arm)>.05,"original front paw moves");
  assert.ok(Math.abs(rig.tail)>.09,"tail root attached to body");
  for(const [other] of FAMILY.filter(x=>x[0]!==name))
    assert.equal(b[other],0,"no cross-character reaction overlap");
 }
 for(const keys of Object.values(MICHI_FAMILY_REACTIONS))
  assert.ok(keys.length===4&&keys.every((x,i)=>Number.isFinite(x)&&(!i||x>keys[i-1])));
});

test("V363 cat paws, hip, ears, whiskers, tails and F4 feathers remain rooted in the native rig",()=>{
 const src=readFileSync(new URL("../characters/art/cat.js",import.meta.url),"utf8");
 for(const fn of ["function drawBaby(","function drawCat(","function drawCloud(",
  "function drawMoon(","function drawGod(","function ear(","function tail(",
  "function legs(","function arm(","function feather(","function face(",
  "function solve(","function draw("])
  assert.ok(src.includes(fn),"real canonical body erased: "+fn);
 assert.match(src,/const welcome=michiWelcomeRig\(safe,f\)/);
 assert.match(src,/if\(welcome\.active\)ctx\.scale\(welcome\.torsoX,welcome\.torsoY\)/);
 assert.match(src,/r\.michiHaunch=welcome\.haunch/);
 assert.match(src,/r\.michiPaw=welcome\.paw/);
 assert.match(src,/R\.swingLimb\(ctx, -17, -34, 7,/);
 assert.match(src,/R\.swingLimb\(ctx, 19, -33, 9,/);
 assert.match(src,/R\.swingLimb\(ctx, hx - 9, -L - 2/);
 assert.match(src,/R\.swingLimb\(ctx, x, y, L, r\.arm-/);
 assert.match(src,/const flap = Math\.sin\(r\.t \* 0\.18\)/);
 assert.match(src,/feather\(ctx, -1/);
 assert.match(src,/if \(f === 2\) drawCloud/);
 assert.match(src,/else drawGod/);
 assert.equal(typeof michiFootwork,"function");
});

test("V363 F0 baby, F1 cat, F2 floating cloud, F3 moon and F4 Eclipse remain distinguishable",()=>{
 const src=readFileSync(new URL("../characters/art/cat.js",import.meta.url),"utf8");
 const forms=["drawBaby(ctx, R, safe, r, c)","drawCat(ctx, R, safe, r, c)",
  "drawCloud(ctx, R, safe, r, c)","drawMoon(ctx, R, safe, r, c)",
  "drawGod(ctx, R, safe, r, c)"];
 for(const form of forms)assert.ok(src.includes(form),form+" missing");
 assert.match(src,/const expansion=\[\.072,\.059,\.042,\.037,\.034\]\[f\]/);
 assert.match(src,/wing:f===4\?/);
 assert.match(src,/const puffs = \[\[/);
 assert.match(src,/const sway = Math\.sin\(r\.t \* 0\.1\)/);
 assert.match(src,/if \(r\.slot === 2\) \{/);
 assert.doesNotMatch(src,/FULL_CONTENT_PLACEHOLDER/);
});

test("V363 stage motion is disabled for low-motion and all canonical player states",()=>{
 for(const t of [0,1,2.08,4.2,6,8.45,12.2,13.9,Infinity,NaN]){
  const b=michiWelcomeBeat(t,true);
  for(const [name] of FAMILY)assert.equal(b[name],0);
  const rig=michiWelcomeRig({state:"idle",michiWelcome:b},4);
  assert.equal(rig.active,false);assert.equal(rig.torsoX,1);assert.equal(rig.torsoY,1);
 }
 for(const state of ["run","attack","cast","jump","fall","glide","hurt","dead","victory","wall"]){
  const rig=michiWelcomeRig({state,michiWelcome:michiWelcomeBeat(2.08)},4);
  assert.equal(rig.active,false,"combat stays canonical: "+state);
  assert.equal(rig.wing,0);assert.equal(rig.arm,0);
 }
 assert.equal(michiWelcomeRig({state:"idle"},0).active,false);
 assert.equal(michiWelcomeRig({state:"idle",reduceMotion:true,michiWelcome:michiWelcomeBeat(6)},4).active,false);
});

test("V363 full cast survives; painting cache changes for actual body between effects",()=>{
 const key=t=>poseFingerprint(pose(t,4));
 assert.notEqual(key(.7),key(2.1));
 for(const [t,earlier] of [[1,.2],[2.08,1.5],[6,5.52],[8.45,7.4],[12.2,11.2]])
  assert.notEqual(key(t),key(earlier));
 assert.deepEqual(michiWelcomeBeat(0),michiWelcomeBeat(14));
 assert.deepEqual(michiWelcomeRig(pose(0,0),0),michiWelcomeRig(pose(14,0),0));
 const intro=readFileSync(new URL("../systems/intro.js",import.meta.url),"utf8");
 const draw=readFileSync(new URL("../characters/draw.js",import.meta.url),"utf8");
 assert.match(intro,/michiFamilyReaction/);
 assert.match(intro,/michiWelcome:michiBeat/);
 assert.match(draw,/pose\.michiWelcome\?\.breath/);
 for(const other of ["dragon","dino","frita","pizza","yomi","cuerno","kilo","stitcho","chispin"])
  assert.ok(intro.includes(other+"Welcome:"),"original co-star missing "+other);
});

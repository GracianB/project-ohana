import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {chispinWelcomeBeat,CHISPIN_FAMILY_REACTIONS} from "../systems/intro-chispin-stage.js";
import {chispinWelcomeRig,chispinFootwork} from "../characters/art/pikachu.js";
import {poseFingerprint} from "../characters/draw.js";
const pose=(t,form=0)=>({state:"idle",form,chispinWelcome:chispinWelcomeBeat(t)});
const REACTIONS=[["dragon",3.72],["chase",5.75],["yomi",8.5],["dino",12.2]];

test("V362 original Chispin lives all fourteen seconds in each of the five true evolutionary bodies",()=>{
 for(let f=0;f<5;f++){
  const frames=[0,.875,1.72,2.625,3.72,5.75,8.5,10,12.2,13.92].map(t=>
    chispinWelcomeRig(pose(t,f),f));
  assert.ok(frames.every(x=>x.active),"do not freeze Chispin F"+f);
  assert.ok(new Set(frames.map(x=>x.torsoX.toFixed(4))).size>=4,"real spring chest moves, F"+f);
  for(const x of frames){
   assert.ok(x.torsoX>=.91&&x.torsoX<=1.09);
   assert.ok(x.torsoY>=.93&&x.torsoY<=1.08);
   for(const value of Object.values(x))if(typeof value==="number")
    assert.ok(Number.isFinite(value)&&Math.abs(value)<6);
  }
 }
 const child=chispinWelcomeRig(pose(.875,0),0);
 const grown=chispinWelcomeRig(pose(.875,4),4);
 assert.ok(Math.abs(child.torsoX-1)>Math.abs(grown.torsoX-1),
  "the baby spring belly must expand more than F4");
 assert.ok(Math.abs(child.torsoX-chispinWelcomeRig(pose(2.625,0),0).torsoX)>.12);
});

test("V362 independent family comedy makes physical ear, gill and spring-tail gestures",()=>{
 assert.equal(Object.keys(CHISPIN_FAMILY_REACTIONS).length,4);
 for(const [name,t] of REACTIONS){
  const b=chispinWelcomeBeat(t);
  assert.equal(b.phase,"idle","a family response must not cast a spell");
  assert.ok(b[name]>.72,name+" appreciable at peak");
  assert.deepEqual(b,chispinWelcomeBeat(t+14),"exact loop");
  const rig=chispinWelcomeRig(pose(t,3),3);
  assert.ok(Math.abs(rig.head)>.045,"head really reacts");
  assert.ok(Math.abs(rig.armA)>.2,"paws connected to real shoulders");
  assert.ok(Math.abs(rig.coil)>.1,"spring tail reacts without attack");
  for(const [other] of REACTIONS.filter(x=>x[0]!==name))
   assert.equal(b[other],0,"do not overlap different character stories");
 }
 for(const times of Object.values(CHISPIN_FAMILY_REACTIONS))
  assert.ok(times.length===4&&times.every((n,i)=>Number.isFinite(n)&&(!i||n>times[i-1])));
});

test("V362 real ears, axillas, cheek gills, planted paws and battery tail are in same Canvas",()=>{
 const art=readFileSync(new URL("../characters/art/pikachu.js",import.meta.url),"utf8");
 for(const part of ["function gill(","function springTail(","function ear(",
   "function paw(","function footOval(","function figure(","function opts(",
   "function draw(","function chispinFootwork("])
  assert.ok(art.includes(part),"original part deleted "+part);
 assert.match(art,/const life=chispinWelcomeRig\(pose,f\)/);
 assert.match(art,/if\(life\.active\)ctx\.scale\(life\.torsoX,life\.torsoY\)/);
 assert.match(art,/const tailBase = \[S\.bx - S\.brx \* 0\.85/);
 assert.match(art,/const shB = \[S\.bx - S\.brx \* 0\.15/);
 assert.match(art,/const shF = \[S\.bx \+ S\.brx \* 0\.4/);
 assert.match(art,/ear\(ctx, R, -hr \* 0\.3/);
 assert.match(art,/paw\(ctx, R, shF\[0\]/);
 assert.match(art,/R\.eye\(ctx, -hr \* 0\.02/);
 assert.equal(typeof chispinFootwork,"function");
});

test("V362 F3 cloud conductor and F4 aurora crown never appear on baby body",()=>{
 const art=readFileSync(new URL("../characters/art/pikachu.js",import.meta.url),"utf8");
 assert.match(art,/if \(S\.clouds\) for \(let i = 0/);
 assert.match(art,/if \(S\.final\) \{/);
 assert.match(art,/if \(S\.crest\) \{/);
 assert.match(art,/if \(f === 2\) \{/);
 assert.match(art,/const cy = S\.by - 4/);
 assert.match(art,/export default \{ id: "chispin", draw \}/);
 const wrapper=readFileSync(new URL("../characters/art/chispin.js",import.meta.url),"utf8");
 assert.match(wrapper,/from "\.\/pikachu\.js"/);
 assert.ok(art.length>25000,"do not replace with new generic miniature sprite");
});

test("V362 reduced motion disables new gestures, no combat, U or network side effects",()=>{
 for(const t of [0,.875,3.72,5.75,8.5,12.2,13.9,NaN,Infinity]){
  const b=chispinWelcomeBeat(t,true);
  for(const [k] of REACTIONS)assert.equal(b[k],0);
  const rig=chispinWelcomeRig({state:"idle",chispinWelcome:b},4);
  assert.equal(rig.active,false);assert.equal(rig.torsoX,1);assert.equal(rig.torsoY,1);
 }
 for(const state of ["run","jump","glide","fall","attack","cast","wall","hurt","dead","victory"]){
  const rig=chispinWelcomeRig({state,chispinWelcome:chispinWelcomeBeat(3.72)},4);
  assert.equal(rig.active,false,state+" keeps original J/K/L/U");
  assert.equal(rig.armA,0);
 }
 assert.equal(chispinWelcomeRig({state:"idle"},0).active,false);
 assert.equal(chispinWelcomeRig({state:"idle",reduceMotion:true,chispinWelcome:chispinWelcomeBeat(5.75)},0).active,false);
});

test("V362 pose cache, ten original actors and deterministic 14s continuity survive",()=>{
 const fp=t=>poseFingerprint(pose(t,4));
 assert.notEqual(fp(.875),fp(2.625),"quiet breathing rerenders body");
 for(const [t,earlier] of [[3.72,3.0],[5.75,4.5],[8.5,7.2],[12.2,11]])
  assert.notEqual(fp(t),fp(earlier));
 assert.deepEqual(chispinWelcomeBeat(0),chispinWelcomeBeat(14));
 assert.deepEqual(chispinWelcomeRig(pose(0),0),chispinWelcomeRig(pose(14),0));
 const intro=readFileSync(new URL("../systems/intro.js",import.meta.url),"utf8");
 const draw=readFileSync(new URL("../characters/draw.js",import.meta.url),"utf8");
 assert.match(intro,/chispinFamilyReaction/);
 assert.match(intro,/chispinWelcome:chispinBeat/);
 assert.match(draw,/pose\.chispinWelcome\?\.breath/);
 for(const name of ["dragon","dino","frita","pizza","yomi","cuerno","kilo","stitcho","michi"])
  assert.ok(intro.includes(name+"Welcome:"),"all nine other families preserved: "+name);
});

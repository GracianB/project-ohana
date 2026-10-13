import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fritaWelcomeBeat,FRITA_FAMILY_REACTIONS} from "../systems/intro-frita-stage.js";
import {fritaWelcomeAnatomy,fritaFootwork} from "../characters/art/frita.js";
import {poseFingerprint} from "../characters/draw.js";
const pose=(t,f=0)=>({state:"idle",form:f,fritaWelcome:fritaWelcomeBeat(t)});
test("V356 Frita's original fry spine breathes all fourteen seconds, in five distinct forms",()=>{
 for(let f=0;f<5;f++){
  const body=[0,.7,2.1,3.64,4.55,6.75,8.45,11.2,13.9]
   .map(t=>fritaWelcomeAnatomy(pose(t,f),f));
  assert.ok(body.every(b=>b.active));
  assert.ok(new Set(body.map(b=>b.spine.toFixed(4))).size>=4,"fry is not rigid "+f);
  for(const frame of body)for(const value of Object.values(frame))
   if(typeof value==="number")assert.ok(Number.isFinite(value)&&Math.abs(value)<8);
 }
 assert.ok(Math.abs(fritaWelcomeAnatomy(pose(.7,0),0).spine)>
  Math.abs(fritaWelcomeAnatomy(pose(.7,4),4).spine),
  "young soft fry flexes more than adult golden one");
 assert.equal(typeof fritaFootwork,"function");
});
test("V356 chef watches Kilo, Dragon and Yomi without triggering any attack",()=>{
 assert.equal(Object.keys(FRITA_FAMILY_REACTIONS).length,3);
 const frames=[["music",.89],["fire",3.67],["spirit",8.43]];
 for(const [name,time] of frames){
  const b=fritaWelcomeBeat(time);
  assert.equal(b.phase,"idle","body acting must not overwrite the chef chase");
  assert.ok(b[name]>.65,name+" family reaction visible");
  assert.deepEqual(fritaWelcomeBeat(time+14),b);
  const rig=fritaWelcomeAnatomy(pose(time,3),3);
  assert.ok(Math.abs(rig.armFront)>.25&&Math.abs(rig.face)>.04);
  for(const other of frames.map(x=>x[0]).filter(x=>x!==name))
   assert.equal(b[other],0,"family reactions do not overlap");
 }
 for(const row of Object.values(FRITA_FAMILY_REACTIONS))
  assert.ok(row.length===4&&row.every((v,i)=>Number.isFinite(v)&&(!i||v>row[i-1])));
});
test("V356 props stay in the actual articulated hand, no disembodied utensils",()=>{
 const art=readFileSync(new URL("../characters/art/frita.js",import.meta.url),"utf8");
 for(const name of ["function spine(","function thinLimb(","function flexArm(",
  "function capeShape(","function fork(","function saltShaker(","function ketchupBottle(",
  "function leg(","function params(","function draw("])
  assert.ok(art.includes(name),"missing real chef anatomy "+name);
 assert.match(art,/const life=fritaWelcomeAnatomy\(pose,f\)/);
 assert.match(art,/const \[hx, hy\] = handF/);
 assert.match(art,/fork\(ctx, R, hx, hy/);
 assert.match(art,/saltShaker\(ctx, R, hx, hy/);
 assert.match(art,/ketchupBottle\(ctx, R, hx \+ 4, hy/);
 assert.match(art,/P\.item=f>=2\?"forkUp":"salt"/);
 assert.match(art,/const shQ = at\(sp,/);
});
test("V356 reduced motion and real combat never inherit the idle chef's acting",()=>{
 for(const t of [0,.89,3.67,8.43,13.9,Infinity,NaN]){
  const b=fritaWelcomeBeat(t,true);
  assert.equal(b.music,0);assert.equal(b.fire,0);assert.equal(b.spirit,0);
  assert.equal(fritaWelcomeAnatomy({state:"idle",fritaWelcome:b},4).active,false);
 }
 for(const state of ["hurt","dead","run","attack","cast","jump","fall"]){
  const r=fritaWelcomeAnatomy({state,fritaWelcome:fritaWelcomeBeat(.89)},4);
  assert.equal(r.active,false);
  assert.equal(r.spine,0);assert.equal(r.cape,0);
 }
 assert.equal(fritaWelcomeAnatomy({state:"idle",reduceMotion:true,fritaWelcome:fritaWelcomeBeat(8.43)},0).active,false);
 assert.equal(fritaWelcomeAnatomy({state:"idle"},0).active,false);
});
test("V356 cache and 14s looping remain smooth through quiet and dramatic scenes",()=>{
 const key=t=>poseFingerprint(pose(t,4));
 assert.notEqual(key(.7),key(2.1),"real spine redraws with calm breath");
 for(const [a,b] of [[.89,.3],[3.67,3.1],[8.43,7.9]])
  assert.notEqual(key(a),key(b));
 assert.deepEqual(fritaWelcomeBeat(0),fritaWelcomeBeat(14));
 assert.deepEqual(fritaWelcomeAnatomy(pose(0,0),0),fritaWelcomeAnatomy(pose(14,0),0));
});
test("V356 preserves real ten-member cast and Frita's prior chase director",()=>{
 const intro=readFileSync(new URL("../systems/intro.js",import.meta.url),"utf8");
 const draw=readFileSync(new URL("../characters/draw.js",import.meta.url),"utf8");
 assert.match(intro,/fritaFamilyReaction/);
 assert.match(intro,/fritaWelcome:fritaBeat/);
 assert.match(draw,/pose\.fritaWelcome\?\.spirit/);
 for(const signal of ["dragon","dino","pizza","yomi","cuerno","kilo","stitcho","chispin","michi"])
  assert.ok(intro.includes(signal+"Welcome:"),"family actor removed "+signal);
});

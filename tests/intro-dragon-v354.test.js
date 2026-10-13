import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dragonWelcomeBeat,DRAGON_FAMILY_REACTIONS} from "../systems/intro-dragon-stage.js";
import {dragonWelcomeAnatomy} from "../characters/art/dragon.js";
import {poseFingerprint} from "../characters/draw.js";

const ACTS=[["chase",5.7],["ghost",8.49],["dino",12.20]];
const makePose=(time,form=0)=>({state:"idle",form,dragonWelcome:dragonWelcomeBeat(time)});

test("V354 Dragón maintains body-led life throughout the quiet eleven seconds",()=>{
 const samples=[0,.7,2.1,5.7,8.49,12.2,13.9];
 for(let f=0;f<5;f++){
  const poses=samples.map(t=>dragonWelcomeAnatomy(makePose(t,f),f));
  assert.ok(poses.every(a=>a.active),"one living rig for form "+f);
  assert.ok(new Set(poses.map(a=>a.bodyX.toFixed(4))).size>=3,
    "five-form diaphragm should expand visibly while idle");
  assert.ok(poses.every(a=>a.bodyX>=.92&&a.bodyX<=1.08&&a.bodyY>=.92&&a.bodyY<=1.08),
    "all chest geometry stays connected and bounded");
  assert.ok(poses.flatMap(a=>Object.values(a)).filter(x=>typeof x==="number").every(Number.isFinite));
 }
 const babyHigh=dragonWelcomeAnatomy(makePose(.7,0),0);
 const adultHigh=dragonWelcomeAnatomy(makePose(.7,4),4);
 assert.ok(Math.abs(babyHigh.bodyX-1)>Math.abs(adultHigh.bodyX-1),
  "baby inflates the round belly more, adult breathes through grown sternum");
 assert.ok(Math.abs(babyHigh.bob)>.7);
});

test("V354 Dragón reacts to Frita's chase, Yomi's ghost, and Dino's stomp independently",()=>{
 assert.equal(Object.keys(DRAGON_FAMILY_REACTIONS).length,3);
 for(const [name,points] of Object.entries(DRAGON_FAMILY_REACTIONS))
  assert.ok(points.length===4&&points.every((x,i)=>Number.isFinite(x)&&(!i||x>points[i-1])),name);
 for(const [name,time] of ACTS){
  const b=dragonWelcomeBeat(time);
  assert.equal(b.phase,"idle","after-scenes must not corrupt the named sneeze film");
  assert.ok(b[name]>.65,name+" should be obvious at "+time);
  assert.deepEqual(dragonWelcomeBeat(time+14),b,"exact 14 second loop");
  const anatomy=dragonWelcomeAnatomy(makePose(time,3),3);
  assert.ok(anatomy.active&&Math.abs(anatomy.head)>.04);
  assert.ok(Math.abs(anatomy.tail)>.10);
  for(const other of ACTS.map(x=>x[0]).filter(x=>x!==name))
   assert.equal(b[other],0,"family reactions should not fire simultaneously");
 }
});

test("V354 quiet opening and looping boundary remain seamless",()=>{
 const b0=dragonWelcomeBeat(0),bend=dragonWelcomeBeat(14);
 assert.deepEqual(b0,bend);
 for(const form of [0,1,2,3,4]){
  const a=dragonWelcomeAnatomy(makePose(0,form),form);
  const z=dragonWelcomeAnatomy(makePose(14,form),form);
  assert.deepEqual(a,z,"no discontinuity on 14-second cycle");
 }
 const breath=(t)=>dragonWelcomeAnatomy(makePose(t,4),4).bodyX;
 assert.ok(Math.abs(breath(.70)-breath(2.10))>.06,
  "actual growing torso must read at least six percent apart at peak-to-peak");
});

test("V354 accessibility and gameplay never receive family-only anatomy",()=>{
 for(const t of [0,.7,3.52,5.7,8.49,12.2,NaN,Infinity]){
  const b=dragonWelcomeBeat(t,true);
  for(const x of ["chase","ghost","dino"])assert.equal(b[x],0);
  assert.equal(dragonWelcomeAnatomy({state:"idle",dragonWelcome:b},4).active,false);
 }
 for(const state of ["dead","hurt","run","cast","attack","glide","jump"]){
  const b=dragonWelcomeAnatomy({state,dragonWelcome:dragonWelcomeBeat(8.49)},4);
  assert.equal(b.active,false,state+" must remain canonical");
  assert.equal(b.bodyX,1);assert.equal(b.bodyY,1);
 }
 assert.equal(dragonWelcomeAnatomy({state:"idle"},0).active,false);
 assert.equal(dragonWelcomeAnatomy({state:"idle",reduceMotion:true,dragonWelcome:dragonWelcomeBeat(.7)},0).active,false);
});

test("V354 independent Dragon actor cache changes at family beats and at quiet breathing peaks",()=>{
 const key=(t)=>poseFingerprint(makePose(t,4));
 assert.notEqual(key(.7),key(2.10),"quiet breathing must never freeze");
 for(const [name,t] of ACTS){
  assert.notEqual(key(t-.65),key(t),name+" visible updates must bypass sprite cache");
 }
 assert.notEqual(key(5.7),key(8.49));
});

test("V354 respects connected original canvas wings and feet, preserves other nine stage actors",()=>{
 const art=readFileSync(new URL("../characters/art/dragon.js",import.meta.url),"utf8");
 const intro=readFileSync(new URL("../systems/intro.js",import.meta.url),"utf8");
 const draw=readFileSync(new URL("../characters/draw.js",import.meta.url),"utf8");
 assert.match(art,/export function dragonWelcomeAnatomy/);
 assert.match(art,/if\(life.active\)ctx.scale\(life.bodyX,life.bodyY\)/);
 assert.match(art,/R\.swingLimb\(ctx, -4, hipY/);
 assert.match(art,/const wingX = f === 0/);
 assert.match(intro,/dragonFamilyReaction/);
 assert.match(draw,/pose\.dragonWelcome\?\.ghost/);
 assert.match(draw,/pose\.dragonWelcome\?\.breath/);
 for(const [id,signal] of [["dino","dino"],["kilo","kilo"],["stitcho","stitcho"],["chispin","chispin"],["cat","michi"],["frita","frita"],["pizza","pizza"],["yomi","yomi"],["cuerno","cuerno"]])
  assert.ok(intro.includes(signal+"Welcome:"),"another acting hero removed: "+id);
 assert.doesNotMatch(art,/FULL_CONTENT_PLACEHOLDER|PLACEHOLDER_WILL_BE_REPLACED/);
});

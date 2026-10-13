import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {pizzaWelcomeBeat,PIZZA_FAMILY_REACTIONS} from "../systems/intro-pizza-stage.js";
import {pizzaWelcomeAnatomy,pizzaMomentum} from "../characters/art/pizza.js";
import {poseFingerprint} from "../characters/draw.js";
const pose=(t,f=0)=>({state:"idle",form:f,pizzaWelcome:pizzaWelcomeBeat(t)});

test("V357 Pizza is a living dough body in F0 through F4, even in the quiet scenes",()=>{
 for(let f=0;f<5;f++){
  const frames=[0,.9,2.48,3.5,5.1,7.4,9.3,12.2,13.9]
   .map(t=>pizzaWelcomeAnatomy(pose(t,f),f));
  assert.ok(frames.every(x=>x.active),"original art "+f);
  assert.ok(new Set(frames.map(x=>x.x.toFixed(4))).size>=4,
    "frozen dough "+f);
  for(const body of frames){
   assert.ok(body.x>=.90&&body.x<=1.10);
   assert.ok(body.y>=.90&&body.y<=1.10);
   for(const value of Object.values(body))
    if(typeof value==="number")assert.ok(Number.isFinite(value)&&Math.abs(value)<4.0);
  }
 }
 const baby=pizzaWelcomeAnatomy(pose(.9,0),0);
 const mature=pizzaWelcomeAnatomy(pose(.9,4),4);
 assert.ok(Math.abs(baby.x-1)>Math.abs(mature.x-1),"small dough flexes more");
 assert.equal(typeof pizzaMomentum,"function");
});

test("V357 Pizza notices Kilo, Chispín and Dino independently of its own chase",()=>{
 const scenes=[["melody",.95],["spark",2.48],["dino",12.19]];
 assert.equal(Object.keys(PIZZA_FAMILY_REACTIONS).length,3);
 for(const [name,time] of scenes){
  const beat=pizzaWelcomeBeat(time);
  assert.equal(beat.phase,"idle");
  assert.ok(beat[name]>.65,name+" should animate the real slice");
  assert.deepEqual(beat,pizzaWelcomeBeat(time+14));
  const body=pizzaWelcomeAnatomy(pose(time,3),3);
  assert.ok(Math.abs(body.armFront)>.24);
  assert.ok(Math.abs(body.roll)>.03);
  for(const other of scenes.map(x=>x[0]).filter(x=>x!==name))
   assert.equal(beat[other],0);
 }
 for(const times of Object.values(PIZZA_FAMILY_REACTIONS))
  assert.ok(times.length===4&&times.every((n,i)=>Number.isFinite(n)&&(!i||n>times[i-1])));
});

test("V357 deformation shares one transform with original cheese, crust, real arms and shoes",()=>{
 const art=readFileSync(new URL("../characters/art/pizza.js",import.meta.url),"utf8");
 for(const name of ["function slicePath(","function cheeseString(","function crust(",
  "function draw(","function params(","function drawLeg","function drawArm"])
  assert.ok(art.includes(name),"canonical Pizza anatomy "+name);
 assert.match(art,/const life=pizzaWelcomeAnatomy\(pose,f\)/);
 assert.match(art,/ctx\.scale\(P\.sx, P\.sy\)/);
 assert.match(art,/R\.swingLimb\(ctx, sx, sy/);
 assert.match(art,/R\.limb\(ctx, x, tipY - 4/);
 assert.match(art,/cheeseString\(/);
 assert.match(art,/const \[x, y\] = uv\(F, tipY/);
 assert.match(art,/P\.strings=Math\.max\(P\.strings,life\.cheese\)/);
});

test("V357 reduced motion and nonintro actions remain original, no extra powers",()=>{
 for(const t of [0,.95,2.48,5.1,12.19,NaN,Infinity]){
  const b=pizzaWelcomeBeat(t,true);
  assert.equal(b.melody,0);assert.equal(b.spark,0);assert.equal(b.dino,0);
  assert.equal(pizzaWelcomeAnatomy({state:"idle",pizzaWelcome:b},4).active,false);
 }
 for(const state of ["hurt","dead","run","cast","attack","jump","fall"]){
  const body=pizzaWelcomeAnatomy({state,pizzaWelcome:pizzaWelcomeBeat(.95)},4);
  assert.equal(body.active,false);assert.equal(body.x,1);assert.equal(body.y,1);
 }
 assert.equal(pizzaWelcomeAnatomy({state:"idle",reduceMotion:true,pizzaWelcome:pizzaWelcomeBeat(2.48)},0).active,false);
 assert.equal(pizzaWelcomeAnatomy({state:"idle"},0).active,false);
});

test("V357 Canvas cache redraws quiet breathing and family replies in exact loop",()=>{
 const key=t=>poseFingerprint(pose(t,3));
 assert.notEqual(key(.9),key(2.1));
 for(const [a,b] of [[.95,.20],[2.48,1.8],[12.19,11.4]])
  assert.notEqual(key(a),key(b));
 assert.deepEqual(pizzaWelcomeBeat(0),pizzaWelcomeBeat(14));
 assert.deepEqual(pizzaWelcomeAnatomy(pose(0,0),0),pizzaWelcomeAnatomy(pose(14,0),0));
});

test("V357 keeps ten individual stage actors and Frita chase independently",()=>{
 const intro=readFileSync(new URL("../systems/intro.js",import.meta.url),"utf8");
 const draw=readFileSync(new URL("../characters/draw.js",import.meta.url),"utf8");
 assert.match(intro,/pizzaFamilyReaction/);
 assert.match(intro,/pizzaWelcome:pizzaBeat/);
 assert.match(intro,/fritaWelcome:fritaBeat/);
 assert.match(draw,/pose\.pizzaWelcome\?\.breath/);
 for(const signal of ["dragon","dino","frita","yomi","cuerno","kilo","stitcho","chispin","michi"])
  assert.ok(intro.includes(signal+"Welcome:"));
});

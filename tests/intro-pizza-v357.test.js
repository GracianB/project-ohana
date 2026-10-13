import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {pizzaWelcomeBeat,PIZZA_FAMILY_REACTIONS} from "../systems/intro-pizza-stage.js";
import {pizzaWelcomeAnatomy,pizzaMomentum} from "../characters/art/pizza.js";
import {poseFingerprint} from "../characters/draw.js";
const pose=(t,form=0)=>({state:"idle",form,pizzaWelcome:pizzaWelcomeBeat(t)});

test("V357 Pizza has five genuine elastic dough bodies and moves throughout fourteen seconds",()=>{
 const samples=[0,.7,1.12,2.1,3.7,5.4,8.50,11.0,13.95];
 for(let f=0;f<5;f++){
  const parts=samples.map(t=>pizzaWelcomeAnatomy(pose(t,f),f));
  assert.ok(parts.every(x=>x.active),"original elastic rig in F"+f);
  assert.ok(new Set(parts.map(x=>x.sx.toFixed(4))).size>=4,"no frozen slice "+f);
  for(const frame of parts){
   assert.ok(frame.sx>.88&&frame.sx<1.12);
   assert.ok(frame.sy>.88&&frame.sy<1.12);
   for(const x of Object.values(frame))
    if(typeof x==="number")assert.ok(Number.isFinite(x)&&Math.abs(x)<4);
  }
 }
 const small=pizzaWelcomeAnatomy(pose(.7,0),0);
 const big=pizzaWelcomeAnatomy(pose(.7,4),4);
 assert.ok(Math.abs(small.sx-1)>Math.abs(big.sx-1),"fresh young dough expands more");
 assert.equal(typeof pizzaMomentum,"function");
});

test("V357 Pizza responds to ukulele, fire sneeze and lantern with three distinct original-body poses",()=>{
 const beats=[["melody",1.12],["dragon",3.7],["yomi",8.5]];
 assert.equal(Object.keys(PIZZA_FAMILY_REACTIONS).length,3);
 for(const [name,time] of beats){
  const b=pizzaWelcomeBeat(time);
  assert.equal(b.phase,"idle");
  assert.ok(b[name]>.65,name+" appreciable in stage");
  assert.deepEqual(pizzaWelcomeBeat(time+14),b);
  const a=pizzaWelcomeAnatomy(pose(time,3),3);
  assert.ok(Math.abs(a.armFront)>.25);
  assert.ok(Math.abs(a.crust)>.07);
  assert.ok(Math.abs(a.roll)>.035);
  for(const other of beats.map(x=>x[0]).filter(x=>x!==name))
   assert.equal(b[other],0,name+" must not steal "+other);
 }
 for(const span of Object.values(PIZZA_FAMILY_REACTIONS))
  assert.ok(span.length===4&&span.every((v,i)=>Number.isFinite(v)&&(!i||v>span[i-1])));
});

test("V357 cheese, topping, crust, hands and shoes still share the genuine slice space",()=>{
 const art=readFileSync(new URL("../characters/art/pizza.js",import.meta.url),"utf8");
 for(const key of ["function slicePath(","function cheeseString(","function crust(",
  "function faceDraw(","function draw(","const drawArm = (","const drawLeg = (",
  "TOPS[f].forEach","function topping(","function drip(",
  "function chefHat(","function orbit("])
  assert.ok(art.includes(key),"real anatomy absent "+key);
 assert.match(art,/const life=pizzaWelcomeAnatomy\(pose,f\)/);
 assert.match(art,/P\.crustNod=life\.crust/);
 assert.match(art,/ctx\.rotate\(pose\.sway \* 0\.045 \+ \(P\.crustNod\|\|0\)\*\.16\)/);
 assert.match(art,/if \(P\.sx !== 1 \|\| P\.sy !== 1\) ctx\.scale\(P\.sx, P\.sy\)/);
 assert.match(art,/cheeseString\(/);
 assert.match(art,/const \[x, y\] = uv\(F, tipY/);
 assert.match(art,/ctx\.clip\(\)/);
 assert.match(art,/R\.ellipse\(ctx, ex \+ 2\.2, ey - 1\.8/);
});

test("V357 the pizza oven, casts, wall, flight and damage never receive stage deformation",()=>{
 for(const t of [0,1.12,3.7,8.5,13.95,Infinity,NaN]){
  const reduced=pizzaWelcomeBeat(t,true);
  assert.equal(reduced.melody,0);assert.equal(reduced.dragon,0);
  assert.equal(reduced.yomi,0);
  assert.equal(pizzaWelcomeAnatomy({state:"idle",pizzaWelcome:reduced},4).active,false);
 }
 for(const state of ["dead","hurt","run","jump","fall","glide","attack","cast","wall"]){
  const x=pizzaWelcomeAnatomy({state,pizzaWelcome:pizzaWelcomeBeat(3.7)},4);
  assert.equal(x.active,false);
  assert.equal(x.sx,1);assert.equal(x.sy,1);assert.equal(x.armFront,0);
 }
 assert.equal(pizzaWelcomeAnatomy({state:"idle"},0).active,false);
 assert.equal(pizzaWelcomeAnatomy({state:"idle",reduceMotion:true,pizzaWelcome:pizzaWelcomeBeat(1.12)},1).active,false);
});

test("V357 actual painting cache redraws connected dough between scenes, exact 14s loop",()=>{
 const k=t=>poseFingerprint(pose(t,4));
 assert.notEqual(k(.7),k(2.1),"diaphragm must not freeze in the caching layer");
 for(const [t,prev] of [[1.12,.2],[3.7,3.1],[8.5,7.9]])
  assert.notEqual(k(t),k(prev),"family acting needs new frame");
 assert.deepEqual(pizzaWelcomeBeat(14),pizzaWelcomeBeat(0));
 assert.deepEqual(pizzaWelcomeAnatomy(pose(14),0),pizzaWelcomeAnatomy(pose(0),0));
});

test("V357 all other actors and their independent performances survive Pizza's second pass",()=>{
 const intro=readFileSync(new URL("../systems/intro.js",import.meta.url),"utf8");
 const draw=readFileSync(new URL("../characters/draw.js",import.meta.url),"utf8");
 assert.match(intro,/pizzaFamilyReaction/);
 assert.match(intro,/pizzaWelcome:pizzaBeat/);
 assert.match(draw,/pose\.pizzaWelcome\?\.yomi/);
 for(const name of ["dragon","dino","frita","yomi","cuerno","kilo","stitcho","chispin","michi"])
  assert.ok(intro.includes(name+"Welcome:"),name+" stage has been deleted");
});

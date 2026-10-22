import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {yomiWelcomeBeat,YOMI_FAMILY_REACTIONS} from "../systems/intro-yomi-stage.js";
import {yomiWelcomeAnatomy,yomiCastActing,yomiRitualState} from "../characters/art/yomi.js";
import {poseFingerprint} from "../characters/draw.js";
const pose=(t,f=0)=>({state:"idle",form:f,yomiWelcome:yomiWelcomeBeat(t)});

test("V358 Yomi's original paper-lantern ribs breathe in all five distinct silhouettes",()=>{
 for(let f=0;f<5;f++){
  const frames=[0,.8,1.02,2.16,3.9,7.8,8.25,10.2,12.2,13.9]
   .map(t=>yomiWelcomeAnatomy(pose(t,f),f));
  assert.ok(frames.every(x=>x.active),"live native lantern "+f);
  assert.ok(new Set(frames.map(x=>x.expandX.toFixed(4))).size>=4,
   "paper body never freezes even during another character's scene "+f);
  for(const x of frames){
   assert.ok(x.expandX>.9&&x.expandX<1.1);
   assert.ok(x.expandY>.92&&x.expandY<1.08);
   for(const n of Object.values(x))if(typeof n==="number")
    assert.ok(Number.isFinite(n)&&Math.abs(n)<5,"finite origami motion");
  }
 }
 const baby=yomiWelcomeAnatomy(pose(.8,0),0);
 const lunar=yomiWelcomeAnatomy(pose(.8,4),4);
 assert.ok(Math.abs(baby.expandX-1)>Math.abs(lunar.expandX-1),
  "F0 seed breathes wider than final lunar guardian");
});

test("V358 Yomi acknowledges ukulele, Chispin shock and Dino's stomp without an invisible spell",()=>{
 const acts=[["melody",1.02],["spark",2.16],["dino",12.20]];
 assert.equal(Object.keys(YOMI_FAMILY_REACTIONS).length,3);
 for(const [name,t] of acts){
  const b=yomiWelcomeBeat(t);
  assert.equal(b.phase,"idle","no extra fake cast state");
  assert.ok(b[name]>.62,name+" visible");
  assert.deepEqual(yomiWelcomeBeat(t+14),b);
  const original=yomiWelcomeAnatomy(pose(t,3),3);
  assert.ok(Math.abs(original.sleeveFront)>.25,"shoulders actually act");
  assert.ok(Math.abs(original.ribbon)>.25,"paper ribbon attached");
  assert.ok(Math.abs(original.rise)>.45,"lantern has weight");
  for(const other of acts.map(x=>x[0]).filter(x=>x!==name))
    assert.equal(b[other],0,"separate family encounter");
 }
 for(const row of Object.values(YOMI_FAMILY_REACTIONS))
  assert.ok(row.length===4&&row.every((v,i)=>Number.isFinite(v)&&(!i||v>row[i-1])));
});

test("Yomi IA keeps five form silhouettes, floating hands and the chest core",()=>{
 const art=readFileSync(new URL("../characters/art/yomi.js",import.meta.url),"utf8");
 for(const shape of ["YOMI_FORMS","function drawHand(","function drawCore(","function drawWing(",
   "function drawCape(","function drawSatellites(","function drawRingHalf(","drawYomiRitual(ctx,p,f",
   "ctx.scale(life.expandX,life.expandY)","life.sleeveFront","life.sleeveBack"])
  assert.ok(art.includes(shape),"Yomi IA body lost "+shape);
 assert.match(art,/const life=yomiWelcomeAnatomy\(p,f\)/);
 assert.equal(typeof yomiCastActing,"function");
 assert.equal(typeof yomiRitualState,"function");
});

test("V358 no phantom motion in low-motion mode or gameplay J/K/L/U",()=>{
 for(const t of [0,1.02,2.16,7.8,12.2,14,NaN,Infinity]){
  const b=yomiWelcomeBeat(t,true);
  for(const key of ["melody","spark","dino"])assert.equal(b[key],0);
  assert.equal(yomiWelcomeAnatomy({state:"idle",yomiWelcome:b},4).active,false);
 }
 for(const state of ["cast","attack","run","glide","jump","fall","hurt","dead","victory"]){
  const x=yomiWelcomeAnatomy({state,yomiWelcome:yomiWelcomeBeat(1.02)},4);
  assert.equal(x.active,false);
  assert.equal(x.expandX,1);assert.equal(x.expandY,1);
 }
 assert.equal(yomiWelcomeAnatomy({state:"idle",reduceMotion:true,yomiWelcome:yomiWelcomeBeat(2.16)},0).active,false);
 assert.equal(yomiWelcomeAnatomy({state:"idle"},0).active,false);
});

test("V358 Canvas cache sees lantern diaphragm and three connected family moments",()=>{
 const key=t=>poseFingerprint(pose(t,4));
 assert.notEqual(key(.8),key(2.6));
 for(const [a,b] of [[1.02,.2],[2.16,1.5],[12.20,11.1]])
  assert.notEqual(key(a),key(b));
 assert.deepEqual(yomiWelcomeBeat(0),yomiWelcomeBeat(14));
 assert.deepEqual(yomiWelcomeAnatomy(pose(0),0),yomiWelcomeAnatomy(pose(14),0));
});

test("V358 Yomi never vanishes, and the other nine families remain in the same intro",()=>{
 const intro=readFileSync(new URL("../systems/intro.js",import.meta.url),"utf8");
 const draw=readFileSync(new URL("../characters/draw.js",import.meta.url),"utf8");
 assert.match(intro,/yomiWelcomeAlwaysVisible="true"/);
 assert.match(intro,/yomiFamilyReaction/);
 assert.match(intro,/yomiWelcome:yomiBeat/);
 assert.match(draw,/pose\.yomiWelcome\?\.spark/);
 assert.match(draw,/pose\.yomiWelcome\?\.breath/);
 for(const family of ["dragon","dino","frita","pizza","cuerno","kilo","stitcho","chispin","michi"])
  assert.ok(intro.includes(family+"Welcome:"),family+" must remain individually directed");
});

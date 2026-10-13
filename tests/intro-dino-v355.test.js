import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dinoWelcomeBeat,DINO_FAMILY_REACTIONS} from "../systems/intro-dino-stage.js";
import {dinoWelcomeAnatomy,dinoNeckBridgePoints} from "../characters/art/dino.js";
import {poseFingerprint} from "../characters/draw.js";
const pose=(t,f=0)=>({state:"idle",form:f,dinoWelcome:dinoWelcomeBeat(t)});

test("V355 Dino remains anatomically alive in all five forms across fourteen seconds",()=>{
 for(let form=0;form<5;form++){
  const a=[0,.875,2.625,4.7,8.8,11.1,12.3,13.9]
   .map(t=>dinoWelcomeAnatomy(pose(t,form),form));
  assert.ok(a.every(x=>x.active),"animated original rig "+form);
  assert.ok(new Set(a.map(x=>x.thoraxX.toFixed(4))).size>=3,"body never freezes");
  for(const x of a){
   assert.ok(x.thoraxX>=.92&&x.thoraxX<=1.08);
   assert.ok(x.thoraxY>=.94&&x.thoraxY<=1.06);
   for(const v of Object.values(x))if(typeof v==="number")assert.ok(Number.isFinite(v));
  }
 }
 const baby=dinoWelcomeAnatomy(pose(.875,0),0);
 const colossus=dinoWelcomeAnatomy(pose(.875,4),4);
 assert.ok(baby.thoraxX>colossus.thoraxX,"rounded baby belly, restrained grown thorax");
 assert.ok(Math.abs(colossus.thoraxX-dinoWelcomeAnatomy(pose(2.625,4),4).thoraxX)>.075);
});

test("V355 Dino notices ukulele, Dragon sneeze and snack chase without stealing their actions",()=>{
 assert.equal(Object.keys(DINO_FAMILY_REACTIONS).length,3);
 const beats=[["melody",.90],["dragon",3.64],["chase",5.83]];
 for(const [name,time] of beats){
  const b=dinoWelcomeBeat(time);
  assert.equal(b.phase,"idle",name+" lives in a quiet between-scene");
  assert.ok(b[name]>.6,name+" is visible");
  assert.deepEqual(dinoWelcomeBeat(time+14),b,"precisely looping");
  const anatomy=dinoWelcomeAnatomy(pose(time,3),3);
  assert.ok(Math.abs(anatomy.head)>.04);
  assert.ok(Math.abs(anatomy.neckX)>.5,"neck stays attached to moving skull");
  for(const other of beats.map(x=>x[0]).filter(x=>x!==name))
   assert.equal(b[other],0,"reaction independently timed");
 }
 for(const a of Object.values(DINO_FAMILY_REACTIONS))
  assert.ok(a.length===4&&a.every((v,i)=>Number.isFinite(v)&&(!i||v>a[i-1])));
});

test("V355 egg and Colossus retain true neck bridge and non-floating planted feet",()=>{
 const art=readFileSync(new URL("../characters/art/dino.js",import.meta.url),"utf8");
 assert.match(art,/function dinoNeckBridgePoints\(/);
 assert.match(art,/const junction=dinoNeckBridgePoints\(P,headX,headY\)/);
 assert.match(art,/if\(stageLife.active\)ctx.scale\(stageLife.thoraxX,stageLife.thoraxY\)/);
 assert.match(art,/const hipY = -legRoot \+ bob/);
 assert.match(art,/leg\(ctx, R, -5, hipY/);
 assert.match(art,/leg\(ctx, R, 6, hipY/);
 assert.match(art,/softenDinoJoint\(ctx,6,hipY/);
 assert.match(art,/drawRolledDino\(/);
 assert.match(art,/dinoHiccupState\(/);
 assert.match(art,/P\.legL \* lenF/);
 assert.equal(typeof dinoNeckBridgePoints,"function");
});

test("V355 Dino family acting is inert in the real game, low-motion and defensive states",()=>{
 for(const t of [0,.9,3.64,5.83,11.8,NaN,Infinity]){
  const b=dinoWelcomeBeat(t,true);
  assert.equal(b.melody,0);assert.equal(b.dragon,0);assert.equal(b.chase,0);
  assert.equal(dinoWelcomeAnatomy({state:"idle",dinoWelcome:b},4).active,false);
 }
 for(const state of ["hurt","dead","run","attack","cast","jump","fall"]){
  assert.equal(dinoWelcomeAnatomy({state,dinoWelcome:dinoWelcomeBeat(.9)},4).active,false);
 }
 for(const move of ["dino-roll","charge","pound"]){
  assert.equal(dinoWelcomeAnatomy({state:"idle",move,dinoWelcome:dinoWelcomeBeat(.9)},4).active,false);
 }
 assert.equal(dinoWelcomeAnatomy({state:"idle",reduceMotion:true,dinoWelcome:dinoWelcomeBeat(.9)},0).active,false);
 assert.equal(dinoWelcomeAnatomy({state:"idle"},0).thoraxX,1);
});

test("V355 Dino render cache differentiates quiet breathing and all three family reactions",()=>{
 const key=t=>poseFingerprint(pose(t,4));
 assert.notEqual(key(.875),key(2.625),"synchronized thorax must not freeze in cache");
 for(const [at,earlier] of [[.9,.2],[3.64,3.1],[5.83,5.1]])
  assert.notEqual(key(at),key(earlier));
 assert.deepEqual(dinoWelcomeBeat(0),dinoWelcomeBeat(14));
 assert.deepEqual(dinoWelcomeAnatomy(pose(0,0),0),dinoWelcomeAnatomy(pose(14,0),0));
});

test("V355 stage-only Dino preserves nine other original families",()=>{
 const intro=readFileSync(new URL("../systems/intro.js",import.meta.url),"utf8");
 const draw=readFileSync(new URL("../characters/draw.js",import.meta.url),"utf8");
 assert.match(intro,/dinoFamilyReaction/);
 assert.match(intro,/dinoWelcome:dinoBeat/);
 assert.match(draw,/pose\.dinoWelcome\?\.melody/);
 for(const [id,signal] of [["dragon","dragon"],["frita","frita"],["pizza","pizza"],["yomi","yomi"],["cuerno","cuerno"],["kilo","kilo"],["stitcho","stitcho"],["chispin","chispin"],["cat","michi"]])
  assert.ok(intro.includes(signal+"Welcome:"),"original stage actor missing "+id);
});

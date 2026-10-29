import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {michiWelcomeBeat,MICHI_FAMILY_REACTIONS} from "../systems/intro-michi-stage.js";
import cat,{michiWelcomeRig,michiFootwork} from "../characters/art/cat.js";
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

test("V457 five distinct mythic silhouettes retain the welcome rig and game collision contract",()=>{
 const src=readFileSync(new URL("../characters/art/cat.js",import.meta.url),"utf8");
 assert.match(src,/drawMichiMythic\(ctx,safe,r,f\)/);
 for(const form of [0,1,2,3,4])
   assert.match(src,new RegExp("if\\(f==="+form+"\\)\\{"),"Michi F"+form+" must have its own drawing path");
 // V625 reauthors the drawings; identity is checked from their real geometry,
 // rather than frozen English comments about the removed renderer.
 const signatures=[];
 for(let form=0;form<5;form++){
  const ops=[],ctx=new Proxy({globalAlpha:1},{get:(o,k)=>k in o?o[k]:(...a)=>ops.push([k,...a]),set:(o,k,v)=>(o[k]=v,true)});
  cat.draw(ctx,{form,state:'idle',t:73,look:{x:.3,y:0}},{});signatures.push(JSON.stringify(ops));
 }
 assert.equal(new Set(signatures).size,5,'five anatomical silhouettes');
 assert.doesNotMatch(src,/if \(f===0\) drawMichiPortrait/,"F0 must not fall back to the previous cat art");
 assert.match(src,/const welcome=michiWelcomeRig\(safe,f\)/);
 assert.match(src,/if\(welcome\.active\)ctx\.scale/);
 assert.equal(typeof michiFootwork,"function");
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

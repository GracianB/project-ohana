import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {kiloWelcomeBeat,KILO_WELCOME_BEATS,drawKiloWelcomeFX} from "../systems/intro-kilo-stage.js";
import {kiloWelcomeRig,kiloFootwork} from "../characters/art/lilo.js";
import {KILO_VISUAL_H} from "../characters/art/kilo.js";
import {poseFingerprint} from "../characters/draw.js";
import {WELCOME_CAST_ORDER,welcomeCastSpot,welcomeActorFit} from "../systems/intro-cast-fit.js";

test("V350 Kilo plays five musical beats with an exact 14-second repeating loop",()=>{
 const frames=[[.03,"idle"],[.33,"listen"],[.71,"strum"],
   [1.09,"bloom"],[1.47,"surprise"],[1.87,"finale"],[2.6,"idle"]];
 for(const [time,phase] of frames){
  const b=kiloWelcomeBeat(time);
  assert.equal(b.phase,phase,"stage "+time);
  assert.deepEqual(kiloWelcomeBeat(time+14),b,"music must loop");
  for(const key of ["listen","strum","bloom","surprise","finale","breath","petals","wing","glow"])
    assert.ok(b[key]>=0&&b[key]<=1,key+" finite bounds");
 }
 assert.equal(Object.keys(KILO_WELCOME_BEATS).length,5);
 for(const row of Object.values(KILO_WELCOME_BEATS))
   assert.ok(row.length===4&&row.every(Number.isFinite)&&row.every((x,i)=>!i||x>row[i-1]));
 assert.ok(kiloWelcomeBeat(1.09).bloom>.9);
});

test("V350 Kilo reduced-motion welcome keeps original face, hands and instrument still",()=>{
 for(const time of [0,.33,.71,1.09,1.47,1.87,14,NaN,Infinity]){
  const b=kiloWelcomeBeat(time,true);
  assert.equal(b.phase,"idle");
  for(const k of ["listen","strum","bloom","surprise","petals","wing"])
   assert.equal(b[k],0);
  assert.equal(b.finale,.2);
  const rig=kiloWelcomeRig({state:"idle",kiloWelcome:b},4);
  assert.equal(rig.lift,0);assert.equal(rig.wing,0);
  assert.equal(rig.head,0);assert.equal(rig.hair,0);
  assert.equal(b.reduced,true);
 }
});

test("V350 Kilo effects have local finite geometry, no invisible combat notes",()=>{
 const calls=[],gradient={addColorStop(...a){calls.push(["stop",...a]);}};
 const ctx=new Proxy({},{
  get(obj,key){if(key in obj)return obj[key];
   if(key==="createRadialGradient")return (...args)=>{calls.push(["gradient",...args]);return gradient;};
   return (...args)=>{calls.push([key,...args]);};
  },set(obj,key,value){obj[key]=value;return true;}
 });
 for(const [time,layer,shape] of [[.33,"front","arc"],[.71,"front","ellipse"],
  [1.09,"front","ellipse"],[1.47,"front","lineTo"],
  [1.87,"front","lineTo"],[1.09,"back","gradient"]]){
  const from=calls.length;
  drawKiloWelcomeFX(ctx,200,400,100,time,kiloWelcomeBeat(time),layer);
  const drawn=calls.slice(from);
  assert.equal(drawn[0]?.[0],"save");
  assert.equal(drawn.at(-1)?.[0],"restore");
  assert.ok(drawn.some(c=>c[0]===shape),"expected "+shape+" at "+time);
  assert.ok(drawn.flat().filter(v=>typeof v==="number").every(Number.isFinite));
  assert.ok(drawn.filter(c=>c[0]==="ellipse").flat().filter(v=>typeof v==="number")
   .every(v=>Math.abs(v)<900),"flower orbit stays on Kilo's stage");
 }
 const from=calls.length;
 drawKiloWelcomeFX(ctx,200,400,100,1.09,kiloWelcomeBeat(1.09,true),"front");
 assert.deepEqual(calls.slice(from).map(c=>c[0]),["save","restore"]);
});

test("V350 all five evolutionary silhouettes retain their personal clothing and supported wings",()=>{
 assert.deepEqual([...KILO_VISUAL_H],[60,72,82,92,104]);
 assert.equal(WELCOME_CAST_ORDER.filter(id=>id==="kilo").length,1);
 assert.equal(typeof kiloFootwork,"function");
 for(let form=0;form<5;form++){
  const rig=kiloWelcomeRig({state:"idle",kiloWelcome:kiloWelcomeBeat(1.87)},form);
  assert.ok(Number.isFinite(rig.tilt)&&Number.isFinite(rig.lift));
  assert.ok(rig.hair>=0&&rig.hair<=1);
  if(form<4)assert.equal(rig.wing,0,"no angel wings before final form");
  else assert.ok(rig.wing>.15,"original final angel wings should respond to music");
  assert.equal(kiloWelcomeRig({state:"hurt",kiloWelcome:kiloWelcomeBeat(.71)},form).strum,0);
 }
 for(const width of [360,759,760,1280,1654]){
  const p=welcomeCastSpot("kilo",width,720,106);
  const fit=welcomeActorFit({width:58,height:98,centerOffsetX:4},106,p.slotWidth);
  assert.ok(fit.paintedWidth<=p.slotWidth*.88+1e-6);
  assert.ok(fit.paintedHeight<=106+1e-6);
 }
});

test("V350 painting cache changes with Kilo body, expression and rhythm",()=>{
 const pose={state:"idle",form:0,kiloWelcome:kiloWelcomeBeat(.33)};
 const key=poseFingerprint(pose);
 for(const t of [.71,1.09,1.47,1.87])
  assert.notEqual(key,poseFingerprint({...pose,kiloWelcome:kiloWelcomeBeat(t)}));
 assert.notEqual(key,poseFingerprint({...pose,kiloWelcome:null}));
 assert.equal(key,poseFingerprint(pose));
});

test("V350 Kilo uses real lilo.js inverse-kinematics and preserves six prior heroes",()=>{
 const art=readFileSync(new URL("../characters/art/lilo.js",import.meta.url),"utf8");
 const kilo=readFileSync(new URL("../characters/art/kilo.js",import.meta.url),"utf8");
 const intro=readFileSync(new URL("../systems/intro.js",import.meta.url),"utf8");
 const draw=readFileSync(new URL("../characters/draw.js",import.meta.url),"utf8");
 for(const name of ["function ik(","function solve(","function ponytail(","function wings(",
   "function head(","function torso(","function uke(","function cape(",
   "function drawCrawl(","function drawKiloFootwork("])
  assert.ok(art.includes(name),"do not erase Kilo rig "+name);
 assert.match(kilo,/export \{ default \} from "\.\/lilo\.js"/);
 assert.match(art,/const welcome=kiloWelcomeRig\(pose,f\)/);
 assert.match(art,/r\.handF\[0\]\+=listen/);
 assert.match(art,/r\.handB\[0\]-=listen/);
 assert.match(art,/r\.uke="play"/);
 assert.match(art,/const flap = Math\.min\(1\.25/);
 assert.match(intro,/kiloWelcomeBeat\(loop,reduce\)/);
 assert.match(intro,/kiloWelcome:kiloBeat/);
 assert.match(intro,/drawKiloWelcomeFX\(ctx,kilo\.x,kilo\.foot/);
 assert.match(draw,/pose\.kiloWelcome=p\._introKilo/);
 assert.match(draw,/pose\.kiloWelcome\?\.strum/);
 for(const pair of [["dragon","dragon"],["dino","dino"],["frita","frita"],
   ["pizza","pizza"],["yomi","yomi"],["cuerno","cuerno"]])
  assert.match(intro,new RegExp(pair[0]+"Welcome:"+pair[1]+"Beat"));
 assert.doesNotMatch(art,/PLACEHOLDER_WILL_BE_REPLACED|FULL_CONTENT_PLACEHOLDER/);
});

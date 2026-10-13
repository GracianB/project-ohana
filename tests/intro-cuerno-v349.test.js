import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {cuernoWelcomeBeat,CUERNO_WELCOME_BEATS,drawCuernoWelcomeFX} from "../systems/intro-cuerno-stage.js";
import {poseFingerprint} from "../characters/draw.js";
import {WELCOME_CAST_ORDER,welcomeCastSpot,welcomeActorFit} from "../systems/intro-cast-fit.js";
import {cuernoWelcomeAnatomy,cuernoTailPose,cuernoWingPose,cuernoLegPose,cuernoManePose,cuernoRitualBody,cuernoMagicPose} from "../characters/art/cuerno.js";

test("V349 Cuerno has five individual beats, repeatable after 14 seconds",()=>{
 const frames=[[.5,"idle"],[9.44,"wonder"],[9.81,"tiptoe"],
  [10.13,"aurora"],[10.46,"surprise"],[10.84,"bow"],[11.6,"idle"]];
 for(const [at,phase] of frames){
  const b=cuernoWelcomeBeat(at);
  assert.equal(b.phase,phase,"beat "+at);
  assert.deepEqual(cuernoWelcomeBeat(at+14),b,"Cuerno intro loops");
  for(const key of ["wonder","tiptoe","aurora","surprise","bow","breath","wing","glow"])
   assert.ok(b[key]>=0&&b[key]<=1,key+" range");
  for(const key of ["mane","tail"])assert.ok(b[key]>=-1&&b[key]<=1);
 }
 for(const points of Object.values(CUERNO_WELCOME_BEATS))
  assert.ok(points.length===4&&points.every(Number.isFinite)&&points.every((v,i)=>!i||v>points[i-1]));
 assert.equal(Object.keys(CUERNO_WELCOME_BEATS).length,5);
 assert.ok(cuernoWelcomeBeat(10.13).aurora>.95);
});

test("V349 reduced motion remains a calm original horn, with no flashing seven-color ring",()=>{
 for(const at of [0,9.44,9.81,10.13,10.46,10.84,14,Infinity,NaN]){
  const b=cuernoWelcomeBeat(at,true);
  assert.equal(b.phase,"idle");
  for(const k of ["wonder","tiptoe","aurora","surprise","mane","wing","tail"])
   assert.equal(b[k],0);
  assert.equal(b.bow,.2);assert.equal(b.reduced,true);
 }
});

test("V349 stage visuals are actor-local finite geometry with state restoration",()=>{
 const calls=[],gradient={addColorStop(...a){calls.push(["stop",...a]);}};
 const ctx=new Proxy({},{
  get(obj,key){if(key in obj)return obj[key];
   if(key==="createRadialGradient")return (...a)=>{calls.push(["gradient",...a]);return gradient;};
   return (...a)=>{calls.push([key,...a]);};
  },set(obj,key,v){obj[key]=v;return true;}
 });
 for(const [at,layer,shape] of [
  [9.44,"front","arc"],[9.81,"front","ellipse"],[10.13,"front","arc"],
  [10.46,"front","lineTo"],[10.84,"front","lineTo"],[10.13,"back","gradient"]
 ]){
  const start=calls.length;
  drawCuernoWelcomeFX(ctx,245,430,100,at,cuernoWelcomeBeat(at),layer);
  const drawn=calls.slice(start);
  assert.equal(drawn[0]?.[0],"save");
  assert.equal(drawn.at(-1)?.[0],"restore");
  assert.ok(drawn.some(c=>c[0]===shape),"Cuerno FX "+shape+" "+at);
  assert.ok(drawn.flat().filter(x=>typeof x==="number").every(Number.isFinite));
  assert.ok(drawn.filter(c=>c[0]==="ellipse").flat().filter(x=>typeof x==="number")
   .every(x=>Math.abs(x)<900),"aurora never room-wide");
 }
 const start=calls.length;
 drawCuernoWelcomeFX(ctx,245,430,100,10.13,cuernoWelcomeBeat(10.13,true),"front");
 assert.deepEqual(calls.slice(start).map(c=>c[0]),["save","restore"]);
});

test("V349 each canon form has only its own anatomy, not an instant full unicorn",()=>{
 for(let form=0;form<5;form++){
  const at=cuernoWelcomeBeat(10.13);
  const pose={state:"idle",form,cuernoWelcome:at,t:60,speed:0};
  const a=cuernoWelcomeAnatomy(pose,form);
  assert.ok(Number.isFinite(a.tilt)&&Number.isFinite(a.lift));
  assert.ok(a.glow>=0&&a.glow<=1);
  if(form<2){
   assert.equal(a.hoof,0,"living horn/orb cannot invent legs");
   assert.equal(a.mane,0,"no full horse mane on baby");
   assert.equal(a.tail,0,"no equine tail on baby");
   assert.equal(a.wing,0,"no early wings");
  }else{
   assert.ok(a.mane>0&&a.tail>0);
   assert.ok(Number.isFinite(cuernoTailPose(pose,form,60).swing));
   assert.ok(Number.isFinite(cuernoManePose(pose,form,60,2)));
   assert.ok(Number.isFinite(cuernoLegPose(pose,form,60,0,false).hoofLift));
  }
  if(form>=3)assert.ok(cuernoWingPose(pose,form,60).open>.23);
  else assert.equal(a.wing,0);
  assert.ok(cuernoWelcomeAnatomy({state:"idle"},form).lift===0);
  assert.ok(cuernoWelcomeAnatomy({state:"hurt",cuernoWelcome:at},form).glow===0);
 }
});

test("V349 retains five Cuerno evolution dispatches and J/K/L/U ritual contracts",()=>{
 assert.equal(WELCOME_CAST_ORDER.filter(x=>x==="cuerno").length,1);
 for(let form=0;form<5;form++){
  for(const slot of [2,3]){
   const ritual=cuernoRitualBody({state:"cast",castSlot:slot,cast:.47},form);
   assert.ok(ritual&&Number.isFinite(ritual.tilt));
   assert.equal(ritual.form,form);
  }
  for(const slot of [0,1,2,3]){
   const magic=cuernoMagicPose({state:"cast",castSlot:slot,cast:.5},form);
   assert.ok(magic&&magic.slot===slot);
  }
 }
 for(const width of [360,759,760,1280,1654]){
  const p=welcomeCastSpot("cuerno",width,720,106);
  const fit=welcomeActorFit({width:56,height:94,centerOffsetX:0},106,p.slotWidth);
  assert.ok(fit.paintedWidth<=p.slotWidth*.88+1e-6);
  assert.ok(fit.paintedHeight<=106+1e-6);
 }
 const art=readFileSync(new URL("../characters/art/cuerno.js",import.meta.url),"utf8");
 const intro=readFileSync(new URL("../systems/intro.js",import.meta.url),"utf8");
 const draw=readFileSync(new URL("../characters/draw.js",import.meta.url),"utf8");
 for(const symbol of ["drawLivingHorn","drawFirstBody","drawRainbowFoal",
    "drawStellarUnicorn","drawAuroraUnicorn","drawRootedTail","drawWingScapula",
    "blendLegRoots","cuernoRitualBody","cuernoMagicPose"])
  assert.ok(art.includes(symbol),"Cuerno canon must preserve "+symbol);
 assert.match(art,/const intro=cuernoWelcomeAnatomy\(pose,4\)/);
 assert.match(intro,/cuernoWelcomeBeat\(loop,reduce\)/);
 assert.match(intro,/cuernoWelcome:cuernoBeat/);
 assert.match(intro,/drawCuernoWelcomeFX\(ctx,cuerno\.x/);
 assert.match(draw,/pose\.cuernoWelcome=p\._introCuerno/);
 assert.match(intro,/yomiWelcome:yomiBeat/);
 assert.match(intro,/pizzaWelcome:pizzaBeat/);
 assert.match(intro,/fritaWelcome:fritaBeat/);
 assert.match(intro,/dragonWelcome:dragonBeat/);
 assert.match(intro,/dinoWelcome:dinoBeat/);
 assert.doesNotMatch(art,/FULL_CONTENT_PLACEHOLDER|PLACEHOLDER_WILL_BE_REPLACED/);
});

test("V349 Cuerno welcome gestures invalidate the cached original painter",()=>{
 const pose={state:"idle",form:0,cuernoWelcome:cuernoWelcomeBeat(9.44)};
 const fingerprint=poseFingerprint(pose);
 for(const at of [9.81,10.13,10.46,10.84])
  assert.notEqual(fingerprint,poseFingerprint({...pose,cuernoWelcome:cuernoWelcomeBeat(at)}));
 assert.notEqual(fingerprint,poseFingerprint({...pose,cuernoWelcome:null}));
 assert.equal(fingerprint,poseFingerprint(pose));
});

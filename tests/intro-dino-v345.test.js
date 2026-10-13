import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dinoWelcomeBeat,DINO_WELCOME_BEATS,drawDinoWelcomeFX} from "../systems/intro-dino-stage.js";
import {poseFingerprint} from "../characters/draw.js";
import {WELCOME_CAST_ORDER,welcomeCastSpot,welcomeActorFit} from "../systems/intro-cast-fit.js";
import {dinoGroundBrace,dinoSecondaryMotion,dinoHiccupState,DINO_ACTING_TUNING} from "../characters/art/dino.js";

test("V345 Dino has authored curiosity, bracing, planted stomp, surprise and delight",()=>{
 const samples=[[.7,"idle"],[10.80,"curious"],[11.40,"brace"],
   [11.80,"stomp"],[12.19,"startled"],[12.79,"delighted"],[13.75,"idle"]];
 for(const [at,expected] of samples){
   const beat=dinoWelcomeBeat(at);
   assert.equal(beat.phase,expected,"beat at "+at);
   assert.deepEqual(dinoWelcomeBeat(at+14),beat,"fourteen-second cycle repeats");
   for(const key of ["curious","brace","stomp","startled","delighted","breath","glow"])
     assert.ok(beat[key]>=0&&beat[key]<=1,key+" bounds");
   assert.ok(beat.tail>=-1&&beat.tail<=1);
 }
 assert.equal(Object.keys(DINO_WELCOME_BEATS).length,5);
 for(const row of Object.values(DINO_WELCOME_BEATS))
   assert.ok(row.length===4&&row.every(Number.isFinite)&&
     row.every((v,i)=>i===0||v>row[i-1]));
 assert.ok(dinoWelcomeBeat(11.80).stomp>.95);
 assert.ok(dinoWelcomeBeat(12.19).startled>.95);
});

test("V345 Dino reduced motion retains static personality, no animated quake",()=>{
 for(const t of [0,10.8,11.8,12.2,13.1,14,NaN,Infinity]){
   const b=dinoWelcomeBeat(t,true);
   assert.equal(b.phase,"idle");
   assert.equal(b.stomp,0);
   assert.equal(b.curious,0);
   assert.equal(b.brace,0);
   assert.equal(b.startled,0);
   assert.equal(b.tail,0);
   assert.equal(b.delighted,.20);
   assert.equal(b.reduced,true);
 }
});

test("V345 Dino scene particles are local finite Canvas geometry with balanced save/restore",()=>{
 const calls=[],gradient={addColorStop(...a){calls.push(["stop",...a]);}};
 const ctx=new Proxy({},{
   get(obj,key){
     if(key in obj)return obj[key];
     if(key==="createRadialGradient")return (...a)=>{calls.push(["gradient",...a]);return gradient;};
     return (...a)=>{calls.push([key,...a]);};
   },
   set(obj,key,value){obj[key]=value;return true;}
 });
 const checks=[
  [10.8,"front","stroke"],[11.4,"front","quadraticCurveTo"],
  [11.8,"front","ellipse"],[12.2,"front","lineTo"],
  [12.79,"front","lineTo"],[11.8,"back","gradient"]
 ];
 for(const [time,layer,shape] of checks){
   const pos=calls.length;
   drawDinoWelcomeFX(ctx,160,270,96,time,dinoWelcomeBeat(time),layer);
   const drawn=calls.slice(pos);
   assert.equal(drawn[0]?.[0],"save");
   assert.equal(drawn.at(-1)?.[0],"restore");
   assert.ok(drawn.some(c=>c[0]===shape),"missing "+shape+" for "+time);
   assert.ok(drawn.flat().filter(v=>typeof v==="number").every(Number.isFinite));
   const coords=drawn.filter(c=>c[0]==="ellipse").flat().filter(x=>typeof x==="number");
   assert.ok(coords.every(x=>Math.abs(x)<650),"stomp stays on its actor, not map-wide");
 }
 const previous=calls.length;
 drawDinoWelcomeFX(ctx,160,270,96,11.8,dinoWelcomeBeat(11.8,true),"front");
 assert.deepEqual(calls.slice(previous).map(c=>c[0]),["save","restore"],
   "reduced-motion Dino produces no animated ground-shock");
});

test("V345 painting cache differentiates Dino's individual phases",()=>{
 const base={state:"idle",form:0,dinoWelcome:dinoWelcomeBeat(10.8)};
 const a=poseFingerprint(base);
 const b=poseFingerprint({...base,dinoWelcome:dinoWelcomeBeat(11.8)});
 const c=poseFingerprint({...base,dinoWelcome:dinoWelcomeBeat(12.79)});
 assert.notEqual(a,b);assert.notEqual(b,c);
 assert.equal(poseFingerprint(base),a);
 assert.notEqual(a,poseFingerprint({...base,dinoWelcome:null}));
});

test("V345 preserves all five Dino evolutions, hipo, bracing and visual bounding",()=>{
 assert.equal(WELCOME_CAST_ORDER.filter(id=>id==="dino").length,1);
 assert.equal(DINO_ACTING_TUNING.breath.length,5);
 for(let form=0;form<5;form++){
   const mock={form,state:"idle",t:100,land:.5,breath:.3};
   const brace=dinoGroundBrace(mock);
   const lag=dinoSecondaryMotion(mock);
   assert.ok(Number.isFinite(brace.front)&&Number.isFinite(brace.rear));
   assert.ok(Number.isFinite(lag.tailCounter)&&Number.isFinite(lag.headFollow));
   const spot=welcomeCastSpot("dino",form%2?380:1654,720,100);
   const fit=welcomeActorFit({width:95,height:88,centerOffsetX:3},108,spot.slotWidth);
   assert.ok(fit.paintedWidth<=spot.slotWidth*.88+1e-6);
   assert.ok(fit.paintedHeight<=108+1e-6);
 }
 assert.equal(typeof dinoHiccupState,"function");
 const intro=readFileSync(new URL("../systems/intro.js",import.meta.url),"utf8");
 const draw=readFileSync(new URL("../characters/draw.js",import.meta.url),"utf8");
 const art=readFileSync(new URL("../characters/art/dino.js",import.meta.url),"utf8");
 assert.match(intro,/dinoWelcomeBeat\(loop,reduce\)/);
 assert.match(intro,/drawDinoWelcomeFX\(ctx,dino\.x,dino\.foot\+2,dinoHeight,t,dinoBeat,"back"\)/);
 assert.match(intro,/dinoWelcome:dinoBeat/);
 assert.match(draw,/pose\.dinoWelcome=p\._introDino/);
 assert.match(draw,/pose\.dinoWelcome\?\.stomp/);
 assert.match(art,/const welcome=pose\.dinoWelcome/);
 assert.match(art,/function draw\(ctx, pose, R\)/);
 assert.match(art,/dinoNeckBridgePoints/);
 assert.match(art,/dinoHiccupState/);
 assert.doesNotMatch(art,/FULL_CONTENT_PLACEHOLDER|PLACEHOLDER_WILL_BE_REPLACED/);
});

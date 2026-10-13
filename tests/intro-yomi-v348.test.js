import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {yomiWelcomeBeat,YOMI_WELCOME_BEATS,drawYomiWelcomeFX} from "../systems/intro-yomi-stage.js";
import {poseFingerprint} from "../characters/draw.js";
import {WELCOME_CAST_ORDER,welcomeCastSpot,welcomeActorFit} from "../systems/intro-cast-fit.js";
import {yomiCastActing,yomiRitualState} from "../characters/art/yomi.js";

test("V348 Yomi has five readable lantern moments on the original 14s loop",()=>{
 const frames=[[.7,"idle"],[7.49,"listen"],[7.85,"gather"],
   [8.23,"reveal"],[8.62,"startle"],[9.05,"bow"],[10,"idle"]];
 for(const [at,phase] of frames){
   const b=yomiWelcomeBeat(at);
   assert.equal(b.phase,phase,"Yomi phase at "+at);
   assert.deepEqual(yomiWelcomeBeat(at+14),b,"Yomi loops without discontinuity");
   for(const key of ["listen","gather","reveal","startle","bow","breath","halo"])
     assert.ok(b[key]>=0&&b[key]<=1,key+" finite and bounded");
   assert.ok(b.ribbon>=-1&&b.ribbon<=1);
 }
 assert.equal(Object.keys(YOMI_WELCOME_BEATS).length,5);
 for(const points of Object.values(YOMI_WELCOME_BEATS))
   assert.ok(points.length===4&&points.every(Number.isFinite)&&
     points.every((v,i)=>!i||v>points[i-1]));
 assert.ok(yomiWelcomeBeat(8.23).reveal>.95);
});

test("V348 Yomi reduced motion remains visible, with no curtain, strobe or projectiles",()=>{
 for(const at of [0,7.49,7.85,8.23,8.62,9.05,14,NaN,Infinity]){
   const b=yomiWelcomeBeat(at,true);
   assert.equal(b.phase,"idle");
   assert.equal(b.listen,0);assert.equal(b.gather,0);
   assert.equal(b.reveal,0);assert.equal(b.startle,0);
   assert.equal(b.ribbon,0);assert.equal(b.bow,.2);
   assert.equal(b.reduced,true);
 }
});

test("V348 Yomi lantern scene effects remain strictly local and save Canvas state",()=>{
 const calls=[],gradient={addColorStop(...args){calls.push(["stop",...args]);}};
 const ctx=new Proxy({},{
  get(obj,key){
   if(key in obj)return obj[key];
   if(key==="createRadialGradient")return (...args)=>{calls.push(["gradient",...args]);return gradient;};
   return (...args)=>{calls.push([key,...args]);};
  },set(obj,key,value){obj[key]=value;return true;}
 });
 for(const [at,layer,shape] of [
   [7.49,"front","arc"],[7.85,"front","ellipse"],
   [8.23,"front","quadraticCurveTo"],[8.62,"front","lineTo"],
   [9.05,"front","lineTo"],[8.23,"back","gradient"]
 ]){
  const before=calls.length;
  drawYomiWelcomeFX(ctx,290,450,98,at,yomiWelcomeBeat(at),layer);
  const drawn=calls.slice(before);
  assert.equal(drawn[0]?.[0],"save");
  assert.equal(drawn.at(-1)?.[0],"restore");
  assert.ok(drawn.some(c=>c[0]===shape),"missing "+shape+" at "+at);
  assert.ok(drawn.flat().filter(x=>typeof x==="number").every(Number.isFinite));
  const ellipseCoords=drawn.filter(c=>c[0]==="ellipse").flat().filter(x=>typeof x==="number");
  assert.ok(ellipseCoords.every(x=>Math.abs(x)<900),"lantern spark stays local");
 }
 const start=calls.length;
 drawYomiWelcomeFX(ctx,290,450,98,8.23,yomiWelcomeBeat(8.23,true),"front");
 assert.deepEqual(calls.slice(start).map(c=>c[0]),["save","restore"]);
});

test("V348 Yomi real Canvas cache keys change with ribbon, sleeves and face",()=>{
 const base={state:"idle",form:0,yomiWelcome:yomiWelcomeBeat(7.49)};
 const a=poseFingerprint(base);
 for(const time of [7.85,8.23,8.62,9.05])
   assert.notEqual(a,poseFingerprint({...base,yomiWelcome:yomiWelcomeBeat(time)}));
 assert.notEqual(a,poseFingerprint({...base,yomiWelcome:null}));
 assert.equal(a,poseFingerprint(base));
});

test("V348 all five Yomi forms and four J/K/L/U ritual poses survive without becoming invisible",()=>{
 assert.equal(WELCOME_CAST_ORDER.filter(id=>id==="yomi").length,1);
 for(const width of [360,759,760,1280,1654]){
   const slot=welcomeCastSpot("yomi",width,720,100);
   const fit=welcomeActorFit({width:100,height:105,centerOffsetX:0},103,slot.slotWidth);
   assert.ok(fit.paintedHeight<=103+1e-6);
   assert.ok(fit.paintedWidth<=slot.slotWidth*.88+1e-6);
 }
 for(let slot=0;slot<4;slot++){
   const ritual=yomiCastActing({state:"cast",castSlot:slot,cast:.46});
   assert.ok(ritual&&Number.isFinite(ritual.tilt)&&Number.isFinite(ritual.rise));
   assert.ok(ritual.release>=0&&ritual.load>=0);
 }
 assert.equal(typeof yomiRitualState,"function");
 const art=readFileSync(new URL("../characters/art/yomi.js",import.meta.url),"utf8");
 const intro=readFileSync(new URL("../systems/intro.js",import.meta.url),"utf8");
 const draw=readFileSync(new URL("../characters/draw.js",import.meta.url),"utf8");
 assert.match(art,/const welcome=p\.yomiWelcome/);
 assert.match(art,/const stageTilt=/);
 assert.match(art,/const welcomeSleeve=/);
 assert.match(art,/yomiCastActing\(p\)/);
 assert.match(art,/drawYomiRitual\(ctx,p/);
 assert.match(art,/const PAL=\[/);
 assert.match(intro,/yomiWelcomeBeat\(loop,reduce\)/);
 assert.match(intro,/yomiWelcome:yomiBeat/);
 assert.match(intro,/yomiWelcomeAlwaysVisible="true"/);
 assert.match(intro,/facing:-1,alpha:1,pose:"idle",yomiWelcome:yomiBeat/);
 assert.match(intro,/pizzaWelcome:pizzaBeat/);
 assert.match(intro,/fritaWelcome:fritaBeat/);
 assert.match(intro,/dragonWelcome:dragonBeat/);
 assert.match(intro,/dinoWelcome:dinoBeat/);
 assert.doesNotMatch(intro,/actor\("yomi"[^;]*alpha:\.78\+\.22\*yomiIn/);
 assert.match(draw,/pose\.yomiWelcome=p\._introYomi/);
 assert.match(draw,/pose\.yomiWelcome\?\.reveal/);
 assert.doesNotMatch(art,/FULL_CONTENT_PLACEHOLDER|PLACEHOLDER_WILL_BE_REPLACED/);
});

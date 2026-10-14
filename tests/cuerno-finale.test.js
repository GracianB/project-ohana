import test from "node:test";
import assert from "node:assert/strict";
import {castCuerno,updateCuerno,CUERNO_KIT,cuernoTrailCount} from "../systems/cuerno-kit.js";
import {createCuernoFx,updateCuernoFx,CUERNO_FX_MAX} from "../systems/cuerno-fx.js";
import {drawRainbowPuff,drawCuernoDream,cuernoPuffPose,cuernoDreamStage} from "../characters/cuerno-stagecraft.js";
import {startCuernoDuo,drawCuernoPlay,resetCuernoPlay} from "../systems/cuerno-play-v373.js";
import {cuernoHornOrigin,cuernoTrailOrigin} from "../characters/art/cuerno-v373.js";
import {CUERNO_VISUAL_H} from "../characters/art/cuerno.js";
import {ROSTER} from "../characters/roster.js";
const player=(evo=0,facing=1)=>({id:"cuerno",evo,facing,x:100,y:200,w:22,h:26,vx:0,vy:0,grounded:true});
test("Cuerno K: preparation is silent, burst is once, origins mirror real anatomy",()=>{
 for(let evo=0;evo<5;evo++)for(const facing of [-1,1]){
  const p=player(evo,facing),messages=[],fx=createCuernoFx(),g={player:p,enemies:[],cuernoFx:fx,nums:{add:(...args)=>messages.push(args)}};
  castCuerno("K",p,g);
  for(let i=0;i<CUERNO_KIT.K.warn;i++)updateCuerno(g,p);
  assert.equal(messages.length,0);assert.equal(fx.trail.length,0);
  for(let i=0;i<12;i++)updateCuerno(g,p);
  assert.equal(messages.filter(a=>a.includes("¡PRRRF!")).length,1);
  assert.ok(fx.list.some(q=>q.type==="puff"&&q.vx*facing<0));
  const origin=cuernoTrailOrigin(p.x+p.w/2,p.y+p.h,{form:evo+1,facing,scale:CUERNO_VISUAL_H[evo]/100});
  assert.equal(fx.trail[0].x,origin.x);assert.equal(fx.trail[0].y,origin.y);
  const horn=cuernoHornOrigin(0,0,{form:evo+1,facing});assert.ok(horn.x*facing>0&&horn.y<0);
 }
});
test("Cuerno K: pause freezes, death cancels damage, reduced motion skips drifting clouds",()=>{
 const p=player(4),fx=createCuernoFx(),g={player:p,enemies:[],cuernoFx:fx,reduceMotion:true};castCuerno("K",p,g);
 g.paused=true;updateCuerno(g,p);assert.equal(p._cuernoKit.acts[0].t,0);
 g.paused=false;for(let i=0;i<40;i++)updateCuerno(g,p);
 assert.ok(cuernoTrailCount(p)>0);assert.ok(!fx.list.some(q=>q.type==="puff"));
 p.dead=true;updateCuerno(g,p);assert.equal(p._cuernoKit,undefined);
 for(let i=0;i<250;i++)updateCuernoFx(fx,null,i);
 assert.equal(fx.trail.length,0);assert.equal(fx.list.length,0);assert.ok(fx.list.length<=CUERNO_FX_MAX);
});
function canvas(){let depth=0;const alphas=[];return new Proxy({globalAlpha:1,done(){assert.equal(depth,0)}},{get(o,k){
 if(k in o)return o[k];if(k==="save")return()=>{depth++;alphas.push(o.globalAlpha)};
 if(k==="restore")return()=>{assert.ok(depth>0);depth--;o.globalAlpha=alphas.pop()};
 if(k.startsWith("create"))return()=>{throw Error("gradient")};
 return(...args)=>{for(const v of args)if(typeof v==="number")assert.ok(Number.isFinite(v));};
},set(o,k,v){o[k]=v;return true}})}
test("Cuerno finale: bounded clouds and aurora draw every stage without gradients or Canvas leaks",()=>{
 assert.deepEqual([0,.3,.6,.9].map(cuernoDreamStage),["susurro","aurora","abrazo","despedida"]);
 for(let form=1;form<=5;form++)for(const reduced of [true,false])for(const k of [0,.1,.5,.9,1]){
  const p=cuernoPuffPose(k,form,reduced);assert.ok(p.radius<=26&&p.alpha>=0&&p.alpha<=1);
  const ctx=canvas();drawRainbowPuff(ctx,100,100,k,{form,reduced});drawCuernoDream(ctx,100,100,120,k,{form,reduced});ctx.done();assert.equal(ctx.globalAlpha,1);
 }
});
test("Cuerno U: selected ally is respected, generic duet never receives a duplicate actor",()=>{
 for(const ally of ["kilo","cat","yomi"]){resetCuernoPlay();const p=player(2);p.uPartner=ally;const g={player:p,cam:{x:0,y:0}};startCuernoDuo(g);
  const seen=[];drawCuernoPlay(canvas(),g,12,(_,a)=>seen.push(a.id),ROSTER);assert.deepEqual(seen,[ally]);
  g._familyDuet={hero:"cuerno",ally};drawCuernoPlay(canvas(),g,12,(_,a)=>seen.push(a.id),ROSTER);assert.deepEqual(seen,[ally]);
 }resetCuernoPlay();
});

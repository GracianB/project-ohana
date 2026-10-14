import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {createDinoEffects} from "../systems/dino-combat.js";
import {drawDinoFossilForecast} from "../systems/dino-stagecraft.js";
import {dinoQuakeRange,drawDinoQuake} from "../systems/dino-quake-u.js";
import {readDinoEffects,drawDinoPeerEffects} from "../systems/dino-coop-effects.js";

const run=(quiet=false)=>{
  const fields=[],hits=[],hero={id:"dino",x:100,y:260,w:36,h:40,evo:4,dead:false,facing:1};
  const enemy={x:380,y:260,w:24,h:40,hp:100000,vx:0};
  const g={player:hero,roomId:"hub",enemies:[enemy],reduceMotion:quiet,
    cam:{x:0,y:-400},worldW:1600,worldH:950,
    nums:{add(){}},fx:{emit(){}},shake:0};
  const cx=e=>e.x+e.w/2,cy=e=>e.y+e.h/2;
  const fns=createDinoEffects({
    cx,cy,canHit:e=>e.hp>0,inView:()=>true,
    circleHit:(x,y,r,e)=>Math.hypot(cx(e)-x,cy(e)-y)<=r+Math.max(e.w,e.h)/2,
    hitEnemy:(game,e,dmg,opts)=>{e.hp-=dmg;hits.push({dmg,opts});return true;},
    add:f=>{fields.push(f);return f;},boom(){},
    nearestEnemy:()=>enemy,solidAt:()=>false,groundBelow:()=>300,
    clamp:(x,a,b)=>Math.max(a,Math.min(b,x))
  });
  const field=fns.castUltimate(g,hero,[enemy],110,"#c8f04a");
  for(let i=0;i<260;i++)fns.update.dinoColossus(g,field,hero);
  return {g,fns,field,fields,hits,enemy};
};

test("V379: accessibility never changes U projectile count, cadence, targeting or damage",()=>{
 const normal=run(false),quiet=run(true);
 const rocks=h=>h.fields.filter(f=>f.kind==="dinoFossil");
 const marks=h=>h.fields.filter(f=>f.kind==="dinoFossilMark");
 assert.equal(rocks(normal).length,8);
 assert.equal(rocks(quiet).length,8);
 assert.deepEqual(rocks(normal).map(f=>[f.x,f.y,f.vx,f.vy,f.dmg,f.R]),
                  rocks(quiet).map(f=>[f.x,f.y,f.vx,f.vy,f.dmg,f.R]));
 assert.deepEqual(normal.hits.map(x=>x.dmg),quiet.hits.map(x=>x.dmg));
 assert.deepEqual(marks(normal).map(f=>[f.life,f.r]),
                  marks(quiet).map(f=>[f.life,f.r]));
 assert.ok(quiet.g.shake<=normal.g.shake);
});
test("V379: high-camera fossil warning survives beyond 48 ticks until the real collision",()=>{
 const h=run(false);
 const f=h.fields.find(x=>x.kind==="dinoFossil"),mark=h.fields.find(x=>x.kind==="dinoFossilMark");
 assert.ok(mark.life>48,"tall camera must not cap the warning at 48");
 assert.equal(mark.fossil,f);
 assert.equal(mark.r,f.R,"announced radius and damage radius match");
 for(let i=0;i<48;i++){
   assert.equal(h.fns.update.dinoFossil(h.g,f),true,"stone still falling");
   assert.equal(h.fns.update.dinoFossilMark(h.g,mark),true,"warning must remain");
 }
 let finished=false;
 for(let i=0;i<85;i++){
   const alive=h.fns.update.dinoFossil(h.g,f);
   if(!alive){f.dead=true;finished=true;break;}
   assert.equal(h.fns.update.dinoFossilMark(h.g,mark),true);
 }
 assert.equal(finished,true);
 assert.equal(h.fns.update.dinoFossilMark(h.g,mark),false,"marker clears on blast");
});
test("V379: host fossil forecast and quake use real circular footprints",()=>{
 const f={x:150,y:280,life:50,max:70,r:72,evo:4};
 const arcs=[];
 const ctx=new Proxy({globalAlpha:1},{get(o,k){if(k in o)return o[k];return(...args)=>{
   if(k==="arc")arcs.push(args);
   for(const a of args)if(typeof a==="number")assert.ok(Number.isFinite(a));
 }},set(o,k,v){o[k]=v;return true;}});
 drawDinoFossilForecast(ctx,f,{x:0,y:0},0,true);
 assert.ok(arcs.some(a=>a[2]===72));
 arcs.length=0;
 drawDinoQuake(ctx,{x:150,y:280,evo:4,max:260,life:240,nextPulse:8,waves:[],rings:[]},
   {x:0,y:0},50,{y:240,h:40});
 assert.ok(arcs.some(a=>a[2]===dinoQuakeRange(4)));
 const peer=readDinoEffects([{kind:"dinoFossilMark",x:150,y:280,life:50,max:70,r:72},
 {kind:"dinoColossus",x:150,y:280,life:240,max:260,evo:4,warmup:0,launchRadius:300}]);
 assert.equal(peer[0].r,72);
 arcs.length=0;
 drawDinoPeerEffects(ctx,peer,{},50,true);
 assert.ok(arcs.some(a=>a[2]===72));
 assert.ok(arcs.some(a=>a[2]===dinoQuakeRange(4)));
});
test("V379: source code contains one fixed gameplay cadence and explicit warning link",()=>{
 const c=fs.readFileSync("systems/dino-combat.js","utf8");
 assert.match(c,/const maxStones=Math\.min\(8,4\+f\.evo\)/);
 assert.match(c,/f\.nextFossil=25/);
 assert.match(c,/r:blastRadius,life:frames,max:frames,fossil/);
 assert.doesNotMatch(c,/maxStones=g\.reduceMotion\?/);
 assert.doesNotMatch(c,/nextFossil=g\.reduceMotion\?/);
});

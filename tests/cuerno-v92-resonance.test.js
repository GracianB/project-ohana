import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {cuernoSweptRibbonTouches,rememberCuernoEnemyPositions,
 drawCuernoPrismEcho,CUERNO_V92} from "../systems/cuerno-v92-resonance.js";
import {ROSTER} from "../characters/roster.js";
import {useAbility,abilityPreMove,updateAbilityFx,drawAbilityFx,clearAbilityFx} from "../systems/abilities.js";

function spy(){
 const events=[],state={depth:0,globalAlpha:1};
 const ctx=new Proxy(state,{get(o,k){
   if(k==="save")return()=>{o.depth++;events.push(["save"])};
   if(k==="restore")return()=>{o.depth--;events.push(["restore"])};
   if(k in o)return o[k];
   if(k==="createLinearGradient"||k==="createRadialGradient")
     return()=>({addColorStop(){}});
   return(...args)=>{
     for(const n of args)if(typeof n==="number")assert.ok(Number.isFinite(n),k+" nonfinite");
     events.push([k,...args]);
   };
 },set(o,k,v){o[k]=v;return true;}});
 return {ctx,events,verify(){assert.equal(state.depth,0,"Canvas stack leak");}};
}
function fixture(){
 const hero=ROSTER.find(c=>c.id==="cuerno");
 const p={id:"cuerno",evo:4,abilities:hero.abilities,
 x:90,y:210,w:32,h:44,facing:1,speed:9.8,jumpPower:18,
 vx:0,vy:0,grounded:true,cds:{},cdDur:{},health:100,maxHealth:198,xp:0};
 const messages=[];
 const g={player:p,t:0,platforms:[],worldW:3500,worldH:1000,
 projectiles:[],enemies:[],ghosts:[],cam:{x:0,y:0},
 fx:{emit(){}},nums:{add(...args){messages.push(args)}},
 reduceMotion:true,shake:0,flash:0,combo:0};
 return {p,g,messages};
}
function tick(g){
 g.t++;
 abilityPreMove(g,{left:false,right:false,jump:false});
 g.player.x+=g.player.vx;
 updateAbilityFx(g);
}

test("V92 swept path detects a high-speed vertical crossing without teleport false positives",()=>{
 const points=[{x:60,y:150},{x:210,y:150},{x:340,y:150}];
 const enemy={x:165,y:215,w:20,h:20};
 assert.equal(cuernoSweptRibbonTouches(points,enemy,{x:165,y:65}),true);
 assert.equal(cuernoSweptRibbonTouches(points,enemy,{x:165,y:0}),false,
  "Long teleport must not generate a fantasy poison hit");
 assert.equal(cuernoSweptRibbonTouches(points,enemy,{x:600,y:230}),false);
 assert.equal(cuernoSweptRibbonTouches(points,enemy,{x:165,y:215}),false);
 assert.equal(cuernoSweptRibbonTouches(points,enemy,{x:NaN,y:40}),false);
 assert.equal(cuernoSweptRibbonTouches([],enemy,{x:165,y:65}),false);
 assert.ok(Object.isFrozen(CUERNO_V92));
});

test("V92 live K lane poisons an enemy that traverses between game frames",()=>{
 clearAbilityFx();const {g,p}=fixture();
 assert.equal(useAbility(g,1),true);
 for(let i=0;i<29;i++)tick(g);
 const path=p._cuernoFantasyActiveTrail?.points||[];
 assert.ok(path.length>=4,"K needs a sampled visible lane");
 const x=path.at(-3).x;
 const enemy={x,y:135,w:22,h:28,hp:175,max:175,stun:0};
 g.enemies.push(enemy);
 tick(g); // Remember previous enemy position while path is active.
 assert.equal(enemy._cuernoFantasyPrevY,135);
 enemy.y=268; // end is outside the ~242px persistent path, crossed in between
 tick(g);
 assert.ok(enemy._cuernoFantasyUntil>g.t,
   "Moving enemy crossed K lane without landing an enchantment");
 assert.equal(enemy.hp,175,"Fantasy damage must be periodic");
 for(let i=0;i<35;i++)tick(g);
 assert.ok(enemy.hp<175,"Fantasy damage tick never arrived");
 assert.equal(g.combo,0,"Poison ticks cannot farm combos");
 clearAbilityFx();
});

test("V92 K followed by L triggers a bounded seven-horn echo with no bonus damage",()=>{
 clearAbilityFx();const {g,p,messages}=fixture();
 assert.equal(useAbility(g,1),true);
 for(let i=0;i<27;i++)tick(g);
 const lane=p._cuernoFantasyActiveTrail?.points||[];
 assert.ok(lane.length>=4);
 const enemy={x:lane.at(-2).x,y:p.y+15,w:28,h:30,hp:550,max:550,stun:0};
 g.enemies.push(enemy);
 tick(g);
 assert.ok(enemy._cuernoFantasyUntil>g.t,"K did not enchant L target");
 assert.equal(useAbility(g,2),true,"L unavailable for K→L combo");
 for(let i=0;i<55;i++){
   tick(g);
   if(messages.some(m=>String(m[2]).includes("PRISMA")))break;
 }
 assert.ok(messages.some(m=>String(m[2]).includes("PRISMA")),
   "K→L combo did not announce prismatic resonance");
 assert.ok(enemy.stun>=25,"Prismatic resonance did not visibly stagger the target");
 const canvas=spy();drawAbilityFx(canvas.ctx,g,g.t);canvas.verify();
 assert.ok(canvas.events.some(e=>e[0]==="bezierCurveTo"),
   "There should be a seven-horn echo in flight");
 clearAbilityFx();
});

test("V92 seven-petal prism echoes are finite, bounded and honor reduced motion",()=>{
 const frames=[28,20,12,4,0];
 for(const life of frames){
   const a=spy(),b=spy();
   const f={x:120,y:155,life,max:28};
   drawCuernoPrismEcho(a.ctx,f,{x:10,y:20},100,true);
   drawCuernoPrismEcho(b.ctx,f,{x:10,y:20},500,true);
   a.verify();b.verify();
   assert.deepEqual(a.events,b.events,"Reduced-motion echo still depends on time");
   assert.ok(a.events.filter(x=>x[0]==="bezierCurveTo").length<=14,
     "Prismatic echo must have a fixed seven-horn budget");
   if(life===20)assert.equal(a.events.filter(x=>x[0]==="bezierCurveTo").length,14);
   if(life===0)assert.equal(a.events.length,0);
 }
});

test("V92 enemy previous-position bookkeeping is finite and deterministic",()=>{
 const enemies=[{x:12,y:23},{x:44,y:-9},null,{x:Infinity,y:4}];
 rememberCuernoEnemyPositions(enemies);
 assert.equal(enemies[0]._cuernoFantasyPrevX,12);
 assert.equal(enemies[1]._cuernoFantasyPrevY,-9);
 assert.equal(enemies[3]._cuernoFantasyPrevX,undefined);
 enemies[0].x=47;rememberCuernoEnemyPositions(enemies);
 assert.equal(enemies[0]._cuernoFantasyPrevX,47);
});

test("V92 new module cached offline, no Dino or shared physics changes",()=>{
 const sw=fs.readFileSync("sw.js","utf8");
 const html=fs.readFileSync("index.html","utf8");
 const abilities=fs.readFileSync("systems/abilities.js","utf8");
 assert.match(sw,/const VERSION = "ohana-29[2-9]"/);
 assert.ok(sw.includes("systems/cuerno-v92-resonance.js?v="));
 assert.match(html,/ohana-292/);
 assert.ok(abilities.length<135000,"Shared ability code budget exceeded");
 assert.match(abilities,/cuernoPrismEcho/);
 assert.match(fs.readFileSync("characters/art/dino.js","utf8"),/dinoAirbornePose/);
});

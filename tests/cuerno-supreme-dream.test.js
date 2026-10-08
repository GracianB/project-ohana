import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {useAbility,updateAbilityFx,clearAbilityFx,drawAuroraDreamTargets} from "../systems/abilities.js";
import {ROSTER} from "../characters/roster.js";
const abilities=fs.readFileSync("systems/abilities.js","utf8");
const cinema=fs.readFileSync("systems/supreme-cinema.js","utf8");
const visual=fs.readFileSync("tests/browser/visual-regression.mjs","utf8");
function enemy(x,attrs={}){return{x,y:230,w:25,h:35,hp:190,maxHp:190,stun:0,
 dying:false,invuln:0,vx:0,vy:0,...attrs};}
function world(enemies=[]){
 const def=ROSTER.find(x=>x.id==="cuerno");
 const p={id:"cuerno",name:"Cuerno",abilities:def.abilities,evo:4,x:100,y:230,w:32,h:44,
 facing:1,health:80,maxHealth:190,jumpPower:18.6,speed:9.6,cds:{},cdDur:{},vx:0,vy:0,xp:0};
 return{player:p,enemies,projectiles:[],ghosts:[],platforms:[],
 cam:{x:0,y:0},worldW:1600,worldH:900,t:0,nums:{add(){}},fx:{emit(){}},
 shake:0,flash:0,score:0,reduceMotion:true};
}
function step(g,n){for(let i=0;i<n;i++){g.t++;updateAbilityFx(g);}}
test("V71 U remembers only initial onscreen ordinary enemies",()=>{
 clearAbilityFx();
 const seen=enemy(170),boss=enemy(270,{boss:true,hp:5000,maxHp:5000});
 const beyond=enemy(2200),g=world([seen,boss,beyond]);
 assert.equal(useAbility(g,3),true);
 assert.equal(g._auroraDreamTargets,1);
 assert.equal(boss._auroraSleepT,undefined);
 assert.equal(beyond._auroraSleepT,undefined);
 const newcomer=enemy(230,{hp:140,maxHp:140});g.enemies.push(newcomer);
 step(g,26);
 assert.ok(seen.hp<190&&seen.hp>0);
 assert.equal(newcomer.hp,140,"late arrival hit by old dream");
 assert.equal(newcomer.stun,0);
 step(g,124);
 assert.equal(seen.hp,0);
 assert.equal(boss.hp,5000);
 assert.equal(boss.stun,0);
 assert.equal(beyond.hp,190);
 assert.equal(newcomer.hp,140);
 clearAbilityFx();
});
test("V71 original sleepers remain targeted after camera scrolls",()=>{
 clearAbilityFx();
 const chosen=enemy(210),g=world([chosen]);
 assert.equal(useAbility(g,3),true);
 g.cam.x=1200;
 step(g,150);
 assert.equal(chosen.hp,0,"victim wrongly released when camera moves");
 clearAbilityFx();
});
test("V71 Canvas creates a bespoke individual rainbow dream, never for bosses",()=>{
 const stats={save:0,restore:0,ellipse:0,arc:0,curve:0,letters:0};
 const ctx=new Proxy({},{
  get(o,k){if(k==="save")return()=>stats.save++;
   if(k==="restore")return()=>stats.restore++;
   if(k==="ellipse")return()=>stats.ellipse++;
   if(k==="arc")return()=>stats.arc++;
   if(k==="quadraticCurveTo")return()=>stats.curve++;
   if(k==="fillText")return()=>stats.letters++;
   if(k in o)return o[k];return()=>{};},
  set(o,k,v){o[k]=v;return true}
 });
 const normal=enemy(180),boss=enemy(340,{boss:true}),off=enemy(2000);
 const g=world([normal,boss,off]);
 drawAuroraDreamTargets(ctx,{life:105,max:150,x:120,y:245,dreamTargets:[normal,boss,off]},g.cam,30,g);
 assert.equal(stats.save,stats.restore);
 assert.equal(stats.ellipse,3,"three rainbow crescents only on the normal enemy");
 assert.equal(stats.letters,1);
 assert.ok(stats.curve>=3);
 assert.ok(stats.arc>=1);
});
test("V71 reduced motion and true sleeper count are connected to film",()=>{
 assert.match(abilities,/const fade=Math\.min\(1,f\.life\/16,\(f\.max-f\.life\)\/12\),reduced=!!g\.reduceMotion/);
 assert.match(abilities,/dreamTargets: p\.id === "cuerno" \? dreamTargets : null/);
 assert.match(abilities,/for\(const e of f\.dreamTargets\|\|\[\]\) if\(canHit\(e\)&&!e\.boss\)/);
 assert.match(cinema,/el\.dataset\.dreamTargets=def\.id==="cuerno"/);
 assert.match(cinema,/drawStory\(ctx,def\.id,k,t,cx,cy,target,color,detail\.dreamTargets,reduce\)/);
 assert.match(visual,/09q-cuerno: U cinema missing real sleeper count/);
 assert.doesNotMatch(abilities.split("export function drawAuroraDreamTargets(")[1].split("const DRW =")[0],
  /Math\.random|new Image|setTimeout|setInterval|requestAnimationFrame/);
});

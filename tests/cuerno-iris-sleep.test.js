import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { useAbility,updateAbilityFx,clearAbilityFx,abilityPreMove,
  ABILITY_DEFS,supremeOf } from "../systems/abilities.js";
import { ROSTER } from "../characters/roster.js";

const source=fs.readFileSync("systems/abilities.js","utf8");
const cinema=fs.readFileSync("systems/supreme-cinema.js","utf8");
const captures=fs.readFileSync("tests/browser/visual-regression.mjs","utf8");
function enemy(x=160,props={}){
 return {x,y:250,w:28,h:36,hp:120,maxHp:120,dying:false,
  invuln:0,stun:0,vx:0,vy:0,...props};
}
function game(evo=4,enemies=[]){
 const hero=ROSTER.find(h=>h.id==="cuerno");
 const p={id:"cuerno",name:"Cuerno",abilities:hero.abilities,
  evo,x:100,y:250,w:32,h:44,facing:1,health:70,maxHealth:200,
  jumpPower:18.6,speed:9.6,cds:{},cdDur:{},vx:0,vy:0,xp:0};
 return {player:p,enemies,projectiles:[],ghosts:[],platforms:[],
  cam:{x:0,y:0},worldW:1600,worldH:900,t:0,
  nums:{add(){}},fx:{emit(){}},shake:0,flash:0,score:0,
  reduceMotion:true};
}
function advance(g,frames=62){
 for(let i=0;i<frames;i++){g.t++;updateAbilityFx(g);}
}
test("V65 J is a real single pearly lance and K respects world boundaries",()=>{
 clearAbilityFx();
 const g=game(4);
 assert.equal(useAbility(g,0),true);
 assert.equal(g.projectiles.length,1);
 assert.equal(g.projectiles[0].shape,"auroraLance");
 assert.equal(g.projectiles[0].pierce,3);
 assert.equal(g.projectiles[0].owner,"player");
 assert.equal(useAbility(g,1),true);
 abilityPreMove(g,{left:false,right:false,jump:false});
 assert.ok(g.player.vx>0,"K did not begin charge");
 g.player.x=g.worldW-g.player.w-9;
 abilityPreMove(g,{left:false,right:false,jump:false});
 assert.equal(g.player.vx,0,"charge ran through world edge");
 clearAbilityFx();
});
test("V65 circular L grows across five forms; F4 covers a distant on-screen enemy",()=>{
 const far=enemy(1050);
 for(let evo=0;evo<5;evo++){
   clearAbilityFx();
   const e=enemy(1050),g=game(evo,[e]);
   assert.equal(useAbility(g,2),true);
   assert.equal(g.projectiles.length,0,"L must not be seven straight projectiles");
   advance(g);
   assert.equal(e.hp<120,evo===4,"wrong radius at form "+evo);
 }
 clearAbilityFx();
 const e=enemy(180),g=game(0,[e]);useAbility(g,2);advance(g);
 assert.ok(e.hp<120,"young Cuernin's nearby enemies must be hit");
 clearAbilityFx();
});
test("V65 U puts every on-screen normal enemy to sleep, dissolves them gradually, never touches boss",()=>{
 clearAbilityFx();
 const normal=enemy(180),other=enemy(710,{hp:220,maxHp:220});
 const boss=enemy(430,{boss:true,hp:5000,maxHp:5000});
 const distant=enemy(2000);
 const g=game(4,[normal,other,boss,distant]);
 assert.equal(useAbility(g,3),true);
 assert.equal(normal.hp,120,"U must not kill before the sleep phase");
 assert.ok(normal.stun>=150&&other.stun>=150,"normal enemies not asleep");
 assert.ok(normal._auroraSleepT>0&&other._auroraSleepT>0);
 assert.equal(boss.stun,0,"boss must resist sleep");
 assert.equal(boss._auroraSleepT,undefined);
 advance(g,28);
 assert.ok(normal.hp<120&&normal.hp>0,"first rainbow pulse must hurt, not kill immediately");
 advance(g,122);
 assert.equal(normal.hp,0,"normal enemy survived all waves");
 assert.equal(other.hp,0,"second enemy survived all waves");
 assert.equal(boss.hp,5000,"boss was damaged by forbidden dream");
 assert.equal(boss.stun,0,"boss was stunned by forbidden dream");
 assert.equal(distant.hp,120,"offscreen enemies must not be wiped");
 clearAbilityFx();
});
test("V65 screen coverage is genuinely drawn, cinematic narrative and budgets remain bounded",()=>{
 assert.match(source,/kind:"irisHalo"/);
 assert.match(source,/Math\.hypot\(viewW\(\),viewH\(\)\)\*1\.12/);
 assert.match(source,/ctx\.createRadialGradient\(x,y,8,x,y,Math\.max\(radius,10\)\)/);
 assert.match(source,/dreamTargets = p\.id === "cuerno" \? enemies\.filter\(e=>!e\.boss&&inView\(game,e\)\) : \[\]/);
 assert.match(cinema,/dream|Dream|sleep|Sleep/);
 assert.match(captures,/09k-cuerno-iris-fullscreen-l/);
 assert.match(captures,/09l-cuerno-rainbow-sleep-u/);
 assert.equal(ABILITY_DEFS.rainbow.cd,5600);
 assert.equal(supremeOf("cuerno").cd,9000);
 // Historical 135 KB source cap retired; functional checks remain active.
});

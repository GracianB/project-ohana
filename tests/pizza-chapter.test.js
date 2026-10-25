// Act I isolated; V2 expansion gate is covered by v2-adventure tests and the real full campaign.
import test from 'node:test';import assert from 'node:assert/strict';
import {WORLD1_ROOMS} from '../systems/world1-rooms.js';
import {pizzaOvens,notePizzaBake,pizzaBaked,PIZZA_ROUTE_TICKS} from '../systems/pizza-chapter.js';
import {nextChapterGrowth,NEXT_CHAPTERS,NEXT_ARENA} from '../systems/chapters-lunar-prism-embers.js';
import {enterWorld1,updateWorld1,awardSeal} from '../systems/world1-play.js';
import {createPizzaBoss,updatePizzaBoss} from '../systems/pizza-boss.js';
import {packSave,unpackSave} from '../systems/save.js';
const game=()=>{const r=WORLD1_ROOMS['w1-pizza'],g={roomId:r.id,roomDef:{...r,expedition:null},player:{id:'pizza',x:1900,y:1094,w:40,h:40,xp:0,evo:0},world1Seals:[],save(){}};enterWorld1(g);return g;};
test('Pizza first bake persists once and deliveries unlock relay ovens and all forms',()=>{
 const g=game();assert.equal(pizzaOvens(g).length,1);notePizzaBake(g);assert.equal(g.player.xp,55);assert.equal(pizzaBaked(g),true);
 const guests=g.world1.stations.filter(s=>s.kind==='guest');for(const [i,s] of guests.entries()){s.done=true;assert.equal(nextChapterGrowth(g),[140,260,420][i]);assert.equal(pizzaOvens(g).length,Math.min(3,i+2));}
 assert.equal(awardSeal(g),false);g.clearedEncounters={'w1-pizza':[NEXT_CHAPTERS.pizza.bossId]};updateWorld1(g);assert.equal(g.world1.sealed,true);
 const saved=unpackSave(packSave(g),'pizza');assert.ok(saved.secrets['w1-pizza'].includes('w1-pizza-first-bake-v1'));assert.ok(saved.clearedEncounters['w1-pizza'].includes(NEXT_CHAPTERS.pizza.bossId));
});
test('Pizza cold retry uses the unlocked local oven, does not erase previous deliveries or award repeated bake XP',()=>{
 const g=game();g.world1.stations.find(s=>s.id===1).done=true;g.player.x=4300;updateWorld1(g);assert.equal(g.world1.carry,'pizza');assert.equal(g.world1.pizzaUntil-g.world1.tick,PIZZA_ROUTE_TICKS);
 g.player.x=4700;g.world1.tick=g.world1.pizzaUntil;updateWorld1(g);assert.equal(g.world1.carry,null);assert.ok(g.world1.stations.find(s=>s.id===1).done);
 g.player.x=4300;g.player.xp=180;updateWorld1(g);assert.equal(g.world1.carry,'pizza');assert.equal(g.player.xp,180);
});
test('Pizza Chef keeps historical defaults and the chapter has protected windows and four real patterns',()=>{
 const maker=(x,y)=>({x,y,invuln:0,stun:0}),legacy=createPizzaBoss(maker);assert.equal(legacy.hp,480);assert.equal(legacy.roomId,'hub');
 const e=createPizzaBoss(maker,()=>.5,{arena:NEXT_ARENA,roomId:'w1-pizza',x:8750,chapter:'pizza',encounterId:NEXT_CHAPTERS.pizza.bossId}),g={player:{x:8500,y:1040,w:40,h:94,evo:4},cam:{x:8200},viewW:1200,projectiles:[]},seen=new Set();
 for(let i=0;i<1500;i++){updatePizzaBoss(e,g,()=>{});if(e._magmaChef.phase==='attack')seen.add(e._magmaChef.attack);assert.equal(e.y+e.h,1134);assert.ok(e.x>=8260&&e.x+e.w<=9320);assert.equal(e.damageTakenScale,e._magmaChef.phase==='rest'?1:0);}
 assert.deepEqual([...seen].sort(),[0,1,2,3]);assert.ok(e._magmaChef.attacksExecuted>=4);
});

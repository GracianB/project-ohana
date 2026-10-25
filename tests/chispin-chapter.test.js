import test from 'node:test';import assert from 'node:assert/strict';
import {WORLD1_ROOMS} from '../systems/world1-rooms.js';
import {enterWorld1,updateWorld1,awardSeal} from '../systems/world1-play.js';
import {CHISPIN_CHAPTER_BOSS_ID,CHISPIN_CHAPTER_ARENA,chispinGrowth,chispinChapterAbility,chispinGateState,updateChispinChapter} from '../systems/chispin-chapter.js';
import {createChispinBoss,updateChispinBoss} from '../systems/chispin-boss.js';
import {damageEnemy} from '../systems/mutations.js';
const make=()=>{const g={roomDef:WORLD1_ROOMS['w1-chispin'],world1Seals:[],player:{id:'chispin',xp:0,evo:0,x:0,y:1094,w:30,h:40},save(){}};enterWorld1(g);return g;};
test('four permanent antenna connections earn all forms but need a real Titan defeat for a new seal',()=>{
 const g=make();for(let i=0;i<4;i++){g.world1.stations[i].done=true;assert.equal(chispinGrowth(g),[55,140,260,420][i]);}
 assert.equal(awardSeal(g),false);g.clearedEncounters={'w1-chispin':[CHISPIN_CHAPTER_BOSS_ID]};updateWorld1(g);assert.equal(g.world1.sealed,true);
 g.player.xp=0;enterWorld1(g);assert.equal(g.player.xp,420,'legitimate sealed saves recover earned growth');
});
test('electrical arcs have honest open/warning/active windows and accepted J cuts one temporarily',()=>{
 const g=make();g.player.x=2860;let hits=0;
 for(const [tick,state] of [[0,'open'],[90,'warn'],[120,'active']]){g.world1.tick=tick;assert.equal(chispinGateState(g,0),state);updateChispinChapter(g,()=>hits++);}
 assert.equal(hits,1);chispinChapterAbility(g,g.player,0);assert.equal(chispinGateState(g,0),'silenced');updateChispinChapter(g,()=>hits++);assert.equal(hits,1);
 g.world1.tick=400;assert.equal(chispinGateState(g,0),'active');
});
test('chapter Titan keeps the legacy encounter intact and locks storm targets before launch',()=>{
 const maker=(x,y)=>({x,y,stun:0,invuln:0});
 const e=createChispinBoss(maker,()=>.5,{roomId:'w1-chispin',encounterId:CHISPIN_CHAPTER_BOSS_ID,x:8750,arena:CHISPIN_CHAPTER_ARENA});
 assert.equal(e.hp,640);const legacy=createChispinBoss(maker);assert.equal(legacy.hp,480);assert.equal(legacy.roomId,'hub');
 const g={player:{x:8500,y:1050,w:36,h:70,evo:4},cam:{x:8200},viewW:1200,projectiles:[]};
 e._titan.phase='rest';e._titan.clock=1;e._titan.attack=3;updateChispinBoss(e,g,()=>{});
 const targets=[...e._titan.stormX];g.player.x=9050;
 for(let i=0;i<80&&!g.projectiles.length;i++)updateChispinBoss(e,g,()=>{});
 assert.deepEqual(g.projectiles.map(p=>p.x+9),targets,'warning columns and projectile centres are the same locked positions');
 e._titan.phase='attack';e._titan.clock=1;updateChispinBoss(e,g,()=>{});damageEnemy(e,9999);assert.equal(e.hp,480);assert.equal(damageEnemy(e,9999),false);
});

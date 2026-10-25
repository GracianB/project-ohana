import test from 'node:test';import assert from 'node:assert/strict';
import {WORLD1_ROOMS} from '../systems/world1-rooms.js';
import {enterWorld1,updateWorld1,awardSeal} from '../systems/world1-play.js';
import {NEXT_CHAPTERS,NEXT_ARENA,nextChapterGrowth,nextChapterAbility,updateNextChapter,mirrorRestored} from '../systems/chapters-lunar-prism-embers.js';
import {createMichiBoss,updateMichiBoss} from '../systems/michi-boss.js';
import {createCuernoBoss,updateCuernoBoss} from '../systems/cuerno-boss.js';
import {createDragonBoss,updateDragonBoss} from '../systems/dragon-boss.js';
import {damageEnemy} from '../systems/mutations.js';
import {packSave,unpackSave} from '../systems/save.js';
const make=hero=>{const r=WORLD1_ROOMS['w1-'+hero],g={roomId:r.id,roomDef:r,world1Seals:[],world1Visited:{},player:{id:hero,x:970,y:1094,w:40,h:40,xp:0,evo:0,facing:1,health:100},save(){}};enterWorld1(g);return g;};
test('the next three chapters earn their final XP, require their boss, and preserve legacy seals',()=>{
 for(const hero of ['cat','cuerno','dragon']){
  const g=make(hero);if(hero==='cuerno')nextChapterAbility(g,g.player,0);
  for(const s of g.world1.stations){s.done=true;nextChapterGrowth(g);}assert.equal(g.player.xp,420);
  assert.equal(awardSeal(g),false);g.clearedEncounters={[g.roomId]:[NEXT_CHAPTERS[hero].bossId]};updateWorld1(g);assert.equal(g.world1.sealed,true);
  g.player.xp=0;enterWorld1(g);assert.equal(g.player.xp,420);
 }
});
test('Michi earned medusas become unique supports, never duplicate on updates or reload',()=>{
 const g=make('cat');g.world1.stations[0].done=true;updateNextChapter(g);updateNextChapter(g);
 assert.equal(g.platforms.filter(p=>p._michiBridge===0).length,1);assert.equal(g.platforms[0].y,g.world1.stations[0].y+26);
});
test('Cuerno J mirror persists through a real save round trip and cannot pay again',()=>{
 const g=make('cuerno');nextChapterAbility(g,g.player,0);assert.equal(mirrorRestored(g),true);assert.equal(g.player.xp,55);assert.equal(g.score,150);
 nextChapterAbility(g,g.player,0);assert.equal(g.score,150);
 const restored=unpackSave(packSave(g),'cuerno');assert.ok(restored.secrets['w1-cuerno'].includes('w1-cuerno-dawn-mirror-v1'));
});
test('Dragon fire lights only a nearby forward brazier and thermal lift requires deliberate airborne entry',()=>{
 const g=make('dragon'),s=g.world1.stations[0];g.player.x=s.x-80;nextChapterAbility(g,g.player,0);updateWorld1(g);assert.equal(s.done,true);
 const next=g.world1.stations[1];g.player.x=next.x+50;nextChapterAbility(g,g.player,0);assert.ok(!next.flameUntil);
 Object.assign(g.player,{x:3030,y:1050,evo:1,vy:4,grounded:true});updateNextChapter(g);assert.equal(g.player.vy,4);
 g.player.grounded=false;updateNextChapter(g);assert.ok(g.player.vy<4);
});
test('all three chapter bosses retain legacy defaults, obey new arenas and require actual attack cycles',()=>{
 for(const [hero,create,update] of [['cat',createMichiBoss,updateMichiBoss],['cuerno',createCuernoBoss,updateCuernoBoss],['dragon',createDragonBoss,updateDragonBoss]]){
  const maker=(x,y)=>({x,y,stun:0,invuln:0});const legacy=create(maker);assert.equal(legacy.hp,480);assert.equal(legacy.roomId,'hub');
  const e=create(maker,()=>.5,{roomId:'w1-'+hero,x:8750,arena:NEXT_ARENA,chapter:hero,encounterId:NEXT_CHAPTERS[hero].bossId});
  const g={player:{x:8500,y:1000,w:40,h:60,evo:4},cam:{x:8200},viewW:1200,projectiles:[]};const patterns=new Set();
  for(let i=0;i<1600;i++){update(e,g,()=>{});const b=e[NEXT_CHAPTERS[hero].state];if(b.phase==='warn')patterns.add(b.attack);assert.ok(e.x>=8260&&e.x+e.w<=9320);assert.equal(e.y+e.h,1134);}
  assert.deepEqual([...patterns].sort(),[0,1,2,3]);
  const b=e[NEXT_CHAPTERS[hero].state];b.phase='attack';b.clock=1;update(e,g,()=>{});damageEnemy(e,9999);assert.equal(e.hp,480);assert.equal(damageEnemy(e,9999),false);
 }
});

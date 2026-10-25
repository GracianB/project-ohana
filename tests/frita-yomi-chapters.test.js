// Act I isolated; V2 expansion gate is covered by v2-adventure tests and the real full campaign.
import test from 'node:test';import assert from 'node:assert/strict';
import {WORLD1_ROOMS} from '../systems/world1-rooms.js';
import {enterWorld1,updateWorld1,awardSeal} from '../systems/world1-play.js';
import {nextChapterGrowth,NEXT_CHAPTERS,NEXT_ARENA} from '../systems/chapters-lunar-prism-embers.js';
import {fritaVentState,noteFritaLaunch,fritaLaunched,yomiNodeState,fryerAstralAbility} from '../systems/frita-yomi-chapters.js';
import {createFritaBoss,updateFritaBoss} from '../systems/frita-boss.js';
import {createYomiBoss,updateYomiBoss} from '../systems/yomi-boss.js';
import {packSave,unpackSave} from '../systems/save.js';
const make=hero=>{const r=WORLD1_ROOMS['w1-'+hero],g={roomId:r.id,roomDef:{...r,expedition:null},player:{id:hero,x:2100,y:1094,w:40,h:40,xp:0,evo:0,facing:1,vx:0,vy:0},save(){}};enterWorld1(g);return g;};
test('Frita launch and three saved prizes guarantee all forms, with one correction per launch',()=>{
 const g=make('frita'),w=g.world1,p=g.player,s=w.stations[0];noteFritaLaunch(g,s);assert.equal(p.xp,55);assert.equal(fritaLaunched(g),true);
 w.launchedGeyser=s.id;p.grounded=false;p.vy=8;fryerAstralAbility(g,p,0);assert.equal(w.fritaAirCorrections,1);assert.equal(p.vy,-4);fryerAstralAbility(g,p,0);assert.equal(w.fritaAirCorrections,1);
 for(const [i,st] of w.stations.entries()){st.done=true;assert.equal(nextChapterGrowth(g),[140,260,420][i]);}
 assert.ok(unpackSave(packSave(g),'frita').secrets['w1-frita'].includes('w1-frita-first-launch-v1'));
});
test('Frita vent states are deterministic and inactive pads do not launch a grounded player',()=>{
 const g=make('frita'),s=g.world1.stations[0];assert.equal(fritaVentState(0,s),'ready');assert.equal(fritaVentState(120,s),'cooldown');assert.equal(fritaVentState(160,s),'warn');
 Object.assign(g.player,{x:s.x-20,grounded:true,vy:0});g.world1.tick=120;updateWorld1(g);assert.equal(g.player.vy,0);
 g.world1.tick=0;updateWorld1(g);assert.equal(g.player.vy,-s.force);assert.equal(g.player.grounded,false);
});
test('Yomi J extends only a live nearby terminal, preserving a finite window without remote completion',()=>{
 const g=make('yomi'),s=g.world1.stations[0];g.player.x=s.x-100;g.world1.tick=100;assert.equal(yomiNodeState(g,s),'wait');fryerAstralAbility(g,g.player,0);assert.equal(g.world1.yomiWindows,undefined);
 g.world1.tick=50;fryerAstralAbility(g,g.player,0);assert.equal(g.world1.yomiWindows[0],125);assert.equal(s.done,false);
 g.world1.tick=90;assert.equal(yomiNodeState(g,s),'live');g.world1.tick=126;assert.equal(yomiNodeState(g,s),'wait');
});
test('both chapters require their real boss and preserve old seals after reload',()=>{
 for(const hero of ['frita','yomi']){const g=make(hero);if(hero==='frita')noteFritaLaunch(g,g.world1.stations[0]);for(const s of g.world1.stations)s.done=true;nextChapterGrowth(g);assert.equal(g.player.xp,420);assert.equal(awardSeal(g),false);g.clearedEncounters={[g.roomId]:[NEXT_CHAPTERS[hero].bossId]};updateWorld1(g);assert.equal(g.world1.sealed,true);g.player.xp=0;enterWorld1(g);assert.equal(g.player.xp,420);}
});
test('Frita and Yomi bosses retain hub defaults and execute four protected chapter patterns',()=>{
 for(const [hero,create,update] of [['frita',createFritaBoss,updateFritaBoss],['yomi',createYomiBoss,updateYomiBoss]]){const maker=(x,y)=>({x,y,invuln:0,stun:0}),old=create(maker);assert.equal(old.hp,480);assert.equal(old.roomId,'hub');
 const e=create(maker,()=>.5,{roomId:'w1-'+hero,x:8750,chapter:hero,encounterId:NEXT_CHAPTERS[hero].bossId,arena:NEXT_ARENA}),g={player:{x:8500,y:1050,w:40,h:84,evo:4},cam:{x:8200},viewW:1200,projectiles:[]},seen=new Set();
 for(let i=0;i<1500;i++){update(e,g,()=>{});const b=e[NEXT_CHAPTERS[hero].state];if(b.phase==='attack')seen.add(b.attack);assert.equal(e.y+e.h,1134);assert.ok(e.x>=8260&&e.x+e.w<=9320);assert.equal(e.damageTakenScale,b.phase==='rest'?1:0);}assert.deepEqual([...seen].sort(),[0,1,2,3]);}
});

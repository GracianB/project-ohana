import test from 'node:test';import assert from 'node:assert/strict';
import {dinoLanding,trackDinoAir,dinoChapterAbility} from '../systems/dino-chapter.js';
import {WORLD1_ROOMS} from '../systems/world1-rooms.js';
import {enterWorld1,updateWorld1,awardSeal} from '../systems/world1-play.js';
import {nextChapterGrowth,NEXT_CHAPTERS,NEXT_ARENA} from '../systems/chapters-lunar-prism-embers.js';
import {createDinoBoss,updateDinoBoss} from '../systems/dino-boss.js';
import {updateCampaignEnemy} from '../systems/campaign-enemies.js';
import {packSave,unpackSave} from '../systems/save.js';
const game=()=>{const r=WORLD1_ROOMS['w1-dino'],g={roomId:r.id,roomDef:r,player:{id:'dino',x:2400,y:1094,w:40,h:40,grounded:true,evo:0,xp:0},score:0,save(){}};enterWorld1(g);return g;};
test('Dino rejects shallow landings and an earned impact opens nearby shields only',()=>{
 const g=game(),s=g.world1.stations[3],foe={x:s.x,w:40,hp:50,stun:0,_shieldFacing:1,_campaign:{active:0,wind:20}},boss={...foe,miniBoss:true};g.enemies=[foe,boss];
 g.world1.dinoPeak=s.y-s.dropHeight+1;assert.equal(dinoLanding(g,s),false);assert.equal(foe._shieldFacing,1);
 g.world1.dinoPeak=s.y-s.dropHeight;assert.equal(dinoLanding(g,s),true);assert.equal(foe._shieldFacing,0);assert.equal(foe._campaign.active,45);assert.equal(boss._shieldFacing,1);
 Object.assign(foe,{campaignRole:'shield',y:1094,h:40,vy:0,invuln:0});Object.assign(g,{cam:{x:s.x-500,y:400},worldW:9600,worldH:1400,platforms:[{x:0,y:1134,w:9600,h:200}],projectiles:[]});g.player.x=s.x+60;
 updateCampaignEnemy(foe,g,()=>{});assert.equal(foe._shieldFacing,0);assert.equal(foe._guardBreak,44);
});
test('Dino K dives only when airborne in its chapter; peak tracks the complete jump',()=>{
 const g=game();dinoChapterAbility(g,g.player,1);assert.equal(g.world1.dinoDives,undefined);
 Object.assign(g.player,{grounded:false,y:900,vy:-2,vx:8});trackDinoAir(g);g.player.y=1000;trackDinoAir(g);assert.equal(g.world1.dinoPeak,940);
 dinoChapterAbility(g,g.player,1);assert.equal(g.player.vy,13);assert.equal(g.world1.dinoDives,1);
 g.roomDef={};g.player.vy=-2;dinoChapterAbility(g,g.player,1);assert.equal(g.player.vy,-2);
});
test('Dino four saved plates guarantee all forms, but only the real Colossus defeat earns a new seal',()=>{
 const g=game();assert.equal(g.world1.stations.length,4);
 for(const [i,s] of g.world1.stations.entries()){s.done=true;assert.equal(nextChapterGrowth(g),[55,140,260,420][i]);}
 assert.equal(awardSeal(g),false);g.clearedEncounters={'w1-dino':[NEXT_CHAPTERS.dino.bossId]};updateWorld1(g);assert.equal(g.world1.sealed,true);
 const save=unpackSave(packSave(g),'dino');assert.ok(save.world1Seals.includes('dino'));assert.ok(save.clearedEncounters['w1-dino'].includes(NEXT_CHAPTERS.dino.bossId));
});
test('Dino Colossus preserves hub defaults and executes every protected chapter pattern before damage windows',()=>{
 const make=(x,y)=>({x,y,invuln:0,stun:0}),legacy=createDinoBoss(make);assert.equal(legacy.hp,480);assert.equal(legacy.roomId,'hub');
 const e=createDinoBoss(make,()=>.5,{arena:NEXT_ARENA,roomId:'w1-dino',x:8750,chapter:'dino',encounterId:NEXT_CHAPTERS.dino.bossId});
 const g={player:{x:8500,y:1050,w:40,h:84,evo:4},cam:{x:8200},viewW:1200,projectiles:[]},patterns=new Set();
 for(let i=0;i<1400;i++){updateDinoBoss(e,g,()=>{});const b=e._stoneColossus;if(b.phase==='attack')patterns.add(b.attack);assert.equal(e.y+e.h,1134);assert.ok(e.x>=8260&&e.x+e.w<=9320);assert.equal(e.damageTakenScale,b.phase==='rest'?1:0);}
 assert.deepEqual([...patterns].sort(),[0,1,2,3]);assert.ok(e._stoneColossus.attacksExecuted>=4);assert.ok(g.projectiles.length>0);
});

test('landing on a high ledge above a plate cannot wake the fossil underneath',()=>{
 const g=game(),s=g.world1.stations[0];g.player.x=s.x-20;
 g.world1.wasGrounded=false;g.world1.prevVy=10;g.world1.dinoPeak=s.y-300;
 Object.assign(g.player,{grounded:true,vy:0,y:s.y-140-g.player.h});updateWorld1(g);assert.equal(s.done,false);
 g.world1.wasGrounded=false;g.world1.prevVy=10;g.world1.dinoPeak=s.y-300;
 g.player.y=s.y-g.player.h;updateWorld1(g);assert.equal(s.done,true);
});

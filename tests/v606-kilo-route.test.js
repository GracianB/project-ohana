import test from 'node:test';
import assert from 'node:assert/strict';
import {WORLD1_ROOMS} from '../systems/world1-rooms.js';
import {enterWorld1,updateWorld1,kiloChapterAbility,interactKiloInstrument,world1NextObjective} from '../systems/world1-play.js';
import {kiloUnlockedForm} from '../systems/kilo-encounters-v606.js';
import {kiloComboStatus} from '../systems/kilo-combo.js';
import {updateCampaignEnemy} from '../systems/campaign-enemies.js';
function fixture(){const room=WORLD1_ROOMS['w1-kilo'];const g={roomId:room.id,roomDef:room,world1Seals:[],world1Visited:{},world1Stations:{},enemies:[],projectiles:[],player:{id:'kilo',x:0,y:1094,w:28,h:40,xp:0,evo:0,health:80,maxHealth:80,vx:0,grounded:true},nums:{add(){}},fx:{emit(){}},save(){}};enterWorld1(g);return g;}
function at(g,i,air=false){const s=g.world1.stations[i];Object.assign(g.player,{x:s.x-14,y:s.y-40,grounded:!air});return s;}
function cast(g,i){g.player._cast={slot:i,t:(g.world1.tick||0)};return kiloChapterAbility(g,g.player,i);}
test('the first chapter has five anatomy-compatible species and a guardian at the end of its full route',()=>{
 const r=WORLD1_ROOMS['w1-kilo'];assert.equal(r.foes.length,19);assert.equal(new Set(r.foes.map(f=>f[2])).size,5);
 for(const f of r.foes.filter(f=>!f[4].special)){assert.equal(f[4].role,{cucaracho:'pursuer',planta:'gunner',rana:'jumper',cangrejo:'shield',avispa:'flyer'}[f[2]]);assert.equal(!!f[4].flightBand,f[2]==='avispa');}
 assert.ok(r.foes.find(f=>f[4].special)[0]>r.width*.85);assert.equal(r.expedition,null,'there is no extra generic three-item gate after the guardian');
 assert.ok(r.seal.stations[3].x>r.width*.8);assert.ok(r.orbs.filter(o=>o[0]<2400).length*4<55,'the welcome gems cannot grant the first evolution');
});
test('gems cannot bypass a lesson and standing on instruments never completes them',()=>{
 const g=fixture();g.player.xp=420;assert.equal(kiloUnlockedForm(g),0);const first=at(g,0);
 for(let i=0;i<200;i++)updateWorld1(g);assert.equal(first.done,false);
 interactKiloInstrument(g);assert.equal(first.done,true);assert.equal(kiloUnlockedForm(g),1);assert.equal(g.player.xp,420,'earned exploration XP is retained');
});
test('four instruments teach distinct real actions; casts cannot be counted repeatedly',()=>{
 const g=fixture();at(g,0);interactKiloInstrument(g);assert.equal(g.player.xp,55);g.player.evo=1;
 const bamboo=at(g,1);cast(g,0);kiloChapterAbility(g,g.player,0);assert.equal(bamboo.tones,1,'same physical cast counts once');cast(g,0);assert.equal(bamboo.done,false);cast(g,0);assert.equal(bamboo.done,true);assert.equal(g.player.xp,140);g.player.evo=2;
 const harp=at(g,2);cast(g,0);assert.equal(harp.done,false,'standing under the harp is not the aerial lesson');g.player.grounded=false;cast(g,0);assert.equal(harp.done,true);assert.equal(g.player.xp,260);g.player.evo=3;
 const hibiscus=at(g,3);for(let i=0;i<3;i++)cast(g,0);assert.equal(hibiscus.done,false);assert.equal(kiloComboStatus(g).ready,true,'the instrument can prepare the real remate even if foes were already defeated');cast(g,4);assert.equal(hibiscus.done,true);assert.equal(kiloUnlockedForm(g),4);assert.equal(g.player.xp,420);
 assert.equal(world1NextObjective(g).label,'Tambor del Claro');
});
test('an earned instrument survives a reload without paying its milestone again',()=>{
 const g=fixture();at(g,0);interactKiloInstrument(g);const score=g.score;g.player.xp=82;enterWorld1(g);assert.equal(g.world1.stations[0].done,true);assert.equal(g.score,score);assert.equal(g.player.xp,82);assert.equal(kiloUnlockedForm(g),1);
});
test('a committed seed volley is not cancelled by repeated light hits',()=>{
 const r=WORLD1_ROOMS['w1-kilo'],g={roomId:r.id,roomDef:r,worldW:14400,worldH:1260,cam:{x:0,y:600},viewW:1280,viewH:720,platforms:[{x:0,y:1134,w:14400,h:126}],player:{id:'kilo',x:300,y:1094,w:28,h:40,vx:0},projectiles:[],enemies:[],combatDifficulty:{windup:1,cooldown:1,pace:1,lead:19}};
 const e={x:650,y:1076,w:46,h:58,hp:100,campaignRole:'gunner',kind:'planta',roomPersona:{kiloEncounter:true,anchorFloor:1134,leash:{left:500,right:800}},vx:0,vy:0,grounded:true,_campaign:{age:0,wind:3,cd:0,active:0,aim:-1,volley:[{vx:-5,vy:0}]}};g.enemies=[e];
 for(let i=0;i<3;i++){e.stun=12;updateCampaignEnemy(e,g,()=>{});}assert.equal(g.projectiles.length,1);assert.equal(g.projectiles[0].vx,-5);assert.equal(e.x,650,'a rooted plant does not skate across the room');
});

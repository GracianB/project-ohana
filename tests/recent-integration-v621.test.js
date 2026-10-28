import test from 'node:test';import assert from 'node:assert/strict';
import {updateCampaignEnemy} from '../systems/campaign-enemies.js';
import {prepareChapterBossV2} from '../systems/chapter-boss-v2.js';
import {chapterBossFinish,NEXT_CHAPTERS} from '../systems/chapters-lunar-prism-embers.js';
import {damageEnemy} from '../systems/mutations.js';
test('authored airborne gunners keep their flight band while ordinary ground gunners fall',()=>{
 const make=air=>({x:200,y:700,w:40,h:40,hp:100,vy:0,campaignRole:'gunner',roomPersona:air?{flightBand:{top:550,bottom:900}}:{}});
 const g={player:{x:500,y:950,w:30,h:50,vx:0},cam:{x:0,y:0},viewW:1280,viewH:1200,worldW:14400,worldH:1260,platforms:[{x:0,y:1134,w:14400,h:126}],projectiles:[],enemies:[],fx:{emit(){}}};
 const air=make(true),ground=make(false);for(let i=0;i<100;i++){updateCampaignEnemy(air,g,()=>{});updateCampaignEnemy(ground,g,()=>{});}
 assert.ok(air.y>=550&&air.y+air.h<=900);assert.equal(ground.y+ground.h,1134);
});
test('all seven native chapter recoveries keep their spent damage budget when the shared wrapper sees the transition',()=>{
 for(const [hero,def]of Object.entries(NEXT_CHAPTERS)){
  const b={phase:'attack',clock:60,attack:0},e={miniBoss:true,roomId:'w1-'+hero,_growthChapter:hero,[def.state]:b,hp:640,max:640,x:8750,y:950,w:160,h:180},g={player:{x:8400,y:1050,w:40,h:80,vx:0},projectiles:[]};
  prepareChapterBossV2(e,g);b.phase='rest';chapterBossFinish(e,g,b,'attack');
  assert.equal(e.damageWindowRemaining,160);damageEnemy(e,70);assert.equal(e.damageWindowRemaining,90);
  prepareChapterBossV2(e,g);assert.equal(e.damageWindowRemaining,90,hero+' recovery must not refill on the next frame');
  damageEnemy(e,1000);assert.equal(e.damageWindowRemaining,0);prepareChapterBossV2(e,g);assert.equal(e.damageWindowRemaining,0);
 }
});

test('Dino fossil landings use the shared save/reward path and keep a clear plunge shaft',async()=>{
 const {WORLD1_ROOMS}=await import('../systems/world1-rooms.js');
 const {enterWorld1,updateWorld1}=await import('../systems/world1-play.js');
 const r=WORLD1_ROOMS['w1-dino'],station=r.seal.stations[0];
 for(const s of r.seal.stations)assert.equal(r.plats.some(p=>p[3]<=40&&p[0]<s.x+90&&p[0]+p[2]>s.x-90),false,'fossil descent cannot land on an intervening shelf');
 for(const s of r.seal.stations){
  assert.ok(r.plats.some(p=>p[1]===s.y&&p[3]>40&&p[0]<=s.x-70&&p[0]+p[2]>=s.x+70),'every fossil has a solid landing zone');
  assert.equal(r.hazards.some(h=>h.x<s.x+70&&h.x+h.w>s.x-70),false,'fossils cannot sit inside a hazard');
 }
 const g={roomId:r.id,roomDef:r,world1Seals:[],world1Visited:{},world1Stations:{},clearedEncounters:{},secrets:{},enemies:[],projectiles:[],player:{id:'dino',evo:0,x:station.x-20,y:1094,w:40,h:40,health:100,maxHealth:100,xp:0,vx:0,vy:0,grounded:true},fx:{emit(){}},nums:{add(){}},save(){}};
 enterWorld1(g);Object.assign(g.world1,{wasGrounded:false,prevVy:13,dinoPeak:station.y-station.dropHeight-30});
 updateWorld1(g,()=>{});assert.equal(g.world1.stations[0].done,true);assert.ok(g.world1Stations[r.id].includes(station.id));const score=g.score;
 updateWorld1(g,()=>{});assert.equal(g.score,score);enterWorld1(g);assert.equal(g.world1.stations[0].done,true,'reload retains the physically completed fossil');
});

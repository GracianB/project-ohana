import test from 'node:test';
import assert from 'node:assert/strict';
import {ROOMS} from '../systems/map.js';
import {roomAlbumPlacements} from '../systems/room-album.js';
import {HERO_COLLECTIONS,enterHeroCollection,takeHeroCollectionItem,heroCollectionSnapshot} from '../systems/hero-collections.js';
import {createChispinRoom,CHISPIN_SECTORS} from '../systems/chispin-room.js';
import {enterChispinStorm,updateChispinStorm,interactChispinStorm,chispinStormPrompt,
 chispinStormAbility,CHISPIN_RELAYS,CHISPIN_SHARDS,CHISPIN_GATES,CHISPIN_SPRINGS,chispinStormSnapshot}
 from '../systems/chispin-storm.js';
import {createChispinBoss,updateChispinBoss,CHISPIN_BOSS_ID,CHISPIN_BOSS,CHISPIN_PATTERNS}
 from '../systems/chispin-boss.js';

const make=(saved=[],defeated=false)=>{
 let writes=0,spawns=0;
 const g={roomId:'hub',roomDef:createChispinRoom(ROOMS.hub),personalAdventureSolo:true,
  player:{id:'chispin',x:0,y:0,w:30,h:40,xp:0,invuln:0,grounded:false,cds:{}},
  platforms:[],secrets:{hub:saved.slice()},clearedEncounters:{hub:defeated?[CHISPIN_BOSS_ID]:[]},
  cam:{x:0,y:0},score:0,t:0,
  save(){writes++;},nums:{add(){}},fx:{emit(){}},spawnChispinBoss(){spawns++;return true;}
 };
 enterChispinStorm(g);
 const at=(x,y)=>{g.player.x=x-15;g.player.y=y-20;};
 const pickup=i=>{const f=CHISPIN_SHARDS[i];at(f.x,f.y);updateChispinStorm(g);};
 return {g,at,pickup,get writes(){return writes;},get spawns(){return spawns;}};
};
test('four authored sectors, ten custom foes, five rails and 100 personal pickups leave the shared hub untouched',()=>{
 const before=JSON.stringify(ROOMS.hub),room=createChispinRoom(ROOMS.hub);
 assert.equal(room.name,'Islas del Relámpago');assert.equal(room.foes.length,10);
 assert.equal(CHISPIN_SECTORS.length,4);assert.ok(room.plats.length>=22);
 assert.equal(room.hazards.length,2);assert.equal(JSON.stringify(ROOMS.hub),before);
 assert.equal(HERO_COLLECTIONS.chispin.room,'hub');
 const f=make();assert.equal(f.g.chispinStorm.lifts.length,5);
 assert.equal(f.g.platforms.length,5);assert.equal(CHISPIN_GATES.length,3);
 assert.equal(CHISPIN_SPRINGS.length,3);
 assert.equal(roomAlbumPlacements(room).length,100);
 const c={roomId:'hub',roomDef:room,personalAdventureSolo:true,player:{id:'chispin',w:30,h:40},
  secrets:{hub:[]},roomAlbumItems:[]};
 enterHeroCollection(c);assert.equal(heroCollectionSnapshot(c).total,100);
 assert.equal(takeHeroCollectionItem(c,0),true);
});
test('three real lightning relays require five shards and permanently unlock boss',()=>{
 const f=make(),s=f.g.chispinStorm;
 assert.equal(s.index,0);f.at(CHISPIN_RELAYS[0].x,CHISPIN_RELAYS[0].y);
 assert.match(chispinStormPrompt(f.g),/activar/);assert.equal(interactChispinStorm(f.g),true);
 f.at(CHISPIN_RELAYS[1].x,CHISPIN_RELAYS[1].y);
 assert.match(chispinStormPrompt(f.g),/2 fragmentos/);
 assert.equal(interactChispinStorm(f.g),true);assert.equal(s.index,1);
 f.pickup(0);f.pickup(1);f.at(CHISPIN_RELAYS[1].x,CHISPIN_RELAYS[1].y);
 assert.equal(interactChispinStorm(f.g),true);
 for(let i=2;i<=4;i++)f.pickup(i);
 f.at(CHISPIN_RELAYS[2].x,CHISPIN_RELAYS[2].y);
 assert.equal(interactChispinStorm(f.g),true);
 assert.equal(chispinStormSnapshot(f.g).index,3);
 updateChispinStorm(f.g);updateChispinStorm(f.g);
 assert.equal(f.spawns,1);assert.equal(f.g.player.xp,120);
 const recovered=make(f.g.secrets.hub);
 assert.equal(recovered.g.chispinStorm.complete,true);
 assert.equal(recovered.g.chispinStorm.shards,5);
 assert.equal(interactChispinStorm(recovered.g),false);
 const won=make(f.g.secrets.hub,true);
 assert.equal(won.g.chispinStorm.defeated,true);updateChispinStorm(won.g);assert.equal(won.spawns,0);
});
test('J interrupts a nearby electrical gate and the J/K/L mastery reward cannot duplicate',()=>{
 const f=make(),p=f.g.player;
 f.at(CHISPIN_GATES[0].x,1070);for(let k=0;k<3;k++)assert.equal(chispinStormAbility(f.g,p,k),true);
 assert.equal(f.g.chispinStorm.signatureComplete,true);
 assert.ok(f.g.chispinStorm.gateSilencedUntil[0]>0);
 const score=f.g.score;for(let k=0;k<3;k++)chispinStormAbility(f.g,p,k);
 assert.equal(f.g.score,score);
 assert.equal(f.g.secrets.hub.filter(x=>x==='hub-chispin-constellation-v1').length,1);
 assert.equal(make([],false).g.chispinStorm.shards,0);
 assert.equal(({roomId:'hub',player:{id:'kilo'},platforms:[],secrets:{hub:[]}}.chispinStorm??null),null);
});
test('Tempest Eye cycles four telegraphed patterns and all three phases with permanent encounter ID',()=>{
 const e=createChispinBoss((x,y,kind)=>({x,y,kind,w:40,h:40,hp:80,max:80}),()=>.5);
 const g={player:{x:3550,y:1040,w:30,h:44},cam:{x:3100,y:0},viewW:1200,projectiles:[],nums:{add(){}}};
 assert.equal(e.max,520);assert.equal(e._encounterSaveId,CHISPIN_BOSS_ID);
 assert.equal(CHISPIN_PATTERNS.length,4);
 const patterns=new Set();
 for(let i=0;i<1600;i++){
  updateChispinBoss(e,g,()=>{});if(e._tempest.phase==='warn')patterns.add(e._tempest.attack);
  assert.ok(e.x>=CHISPIN_BOSS.left&&e.x+e.w<=CHISPIN_BOSS.right);
 }
 assert.deepEqual([...patterns].sort(),[0,1,2,3]);
 assert.ok(g.projectiles.length>0);
 e.hp=310;updateChispinBoss(e,g,()=>{});assert.equal(e._tempest.tier,2);
 e.hp=80;updateChispinBoss(e,g,()=>{});assert.equal(e._tempest.tier,3);
});

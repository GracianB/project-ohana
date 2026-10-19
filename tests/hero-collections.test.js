import test from 'node:test';
import assert from 'node:assert/strict';
import {ROOMS} from '../systems/map.js';
import {ROSTER} from '../characters/roster.js';
import {createStitchoRoom} from '../systems/stitcho-room.js';
import {HERO_COLLECTIONS,enterHeroCollection,takeHeroCollectionItem,heroCollectionSnapshot,updateHeroCollection} from '../systems/hero-collections.js';
import {roomAlbumPlacements} from '../systems/room-album.js';

test('every character owns a distinct 100-item personal album with specific trophy',()=>{
 assert.deepEqual(new Set(Object.keys(HERO_COLLECTIONS)),new Set(ROSTER.map(hero=>hero.id)));
 assert.equal(new Set(Object.values(HERO_COLLECTIONS).map(info=>info.title)).size,10);
 assert.equal(new Set(Object.values(HERO_COLLECTIONS).map(info=>info.bonus)).size,10);
 for(const hero of ROSTER){
  const info=HERO_COLLECTIONS[hero.id],room=hero.id==='stitcho'?createStitchoRoom(ROOMS.hub):ROOMS[info.room];
  assert.ok(room);
  const places=roomAlbumPlacements(room);
  assert.equal(places.length,100);
  assert.equal(new Set(places.map(p=>p.id)).size,100);
  const g={roomId:info.room,roomDef:room,player:{id:hero.id,x:0,y:0,w:24,h:30},secrets:{},roomAlbumItems:places};
  enterHeroCollection(g);
  assert.equal(heroCollectionSnapshot(g)?.total,100);
  assert.equal(g.roomAlbumItems.length,100,'legacy album placements remain available for the cinematic and old saves');
 }
});
test('Stitcho stage geometry is authored but never mutates canonical hub or Kilo',()=>{
 const baseline=JSON.stringify(ROOMS.hub);
 const x=createStitchoRoom(ROOMS.hub);
 assert.equal(x.id,'hub');
 assert.equal(x.world,4);
 assert.equal(x.name,'Archipiélago del Caos');
 assert.equal(x.sectors.length,4);
 assert.equal(x.checkpoints.length,4);
 assert.equal(x.foes.length,10);
 assert.equal(x.foes.some(e=>e[4]?.name==='Guardia del núcleo'),true);
 assert.ok(x.plats.length>=20);
 assert.ok(x.hazards.every(h=>h.type==='death'&&h.w<=100));
 assert.equal(JSON.stringify(ROOMS.hub),baseline,'Kilo and multiplayer geometry must stay intact');
});
test('100 personal discoveries grant a one-time unique effect and survive checkpoint reload',()=>{
 let writes=0;
 const p={id:'stitcho',x:0,y:0,w:24,h:30,health:40,maxHealth:100,invuln:0,xp:0};
 const g={roomId:'hub',roomDef:createStitchoRoom(ROOMS.hub),personalAdventureSolo:true,
  roomAlbums:{hub:{found:[],relic:false}},roomAlbumItems:[1],secrets:{hub:[]},
  player:p,score:0,nums:{add(){}},fx:{emit(){}},save(){writes++;},shake:0,flash:0};
 enterHeroCollection(g);
 for(let i=0;i<99;i++){assert.equal(takeHeroCollectionItem(g,i),true);assert.equal(takeHeroCollectionItem(g,i),false);}
 assert.equal(heroCollectionSnapshot(g).complete,false);
 assert.equal(takeHeroCollectionItem(g,99),true);
 assert.equal(heroCollectionSnapshot(g).complete,true);
 assert.equal(p._heroHundredBonus,'CORAZÓN GALÁCTICO');
 assert.equal(p.health,100);assert.ok(p.invuln>=120);
 assert.equal(p.xp,150);assert.equal(g.score,2400);
 assert.equal(g.secrets.hub.filter(x=>x==='hero-100:stitcho:complete').length,1);
 assert.equal(takeHeroCollectionItem(g,99),false);
 assert.ok(writes>=100);
 const clone={roomId:'hub',roomDef:g.roomDef,personalAdventureSolo:true,
  player:{id:'stitcho',x:0,y:0,w:24,h:30},secrets:{hub:[...g.secrets.hub]},roomAlbumItems:[]};
 enterHeroCollection(clone);
 assert.deepEqual(heroCollectionSnapshot(clone),{hero:'stitcho',room:'hub',count:100,total:100,complete:true,reward:'CORAZÓN GALÁCTICO',scene:0});
 assert.equal(clone.player._heroHundredBonus,'CORAZÓN GALÁCTICO');
});
test('a different hero cannot inherit Kilo relic or Stitcho discoveries',()=>{
 const g={roomId:'hub',roomDef:ROOMS.hub,player:{id:'kilo',x:0,y:0,w:20,h:30},roomAlbumItems:[],
  secrets:{hub:[]},roomAlbums:{hub:{found:Array.from({length:100},(_,i)=>i),relic:true}}};
 enterHeroCollection(g);
 assert.equal(heroCollectionSnapshot(g).complete,true);
 g.player.id='stitcho';g.roomDef=createStitchoRoom(ROOMS.hub);
 enterHeroCollection(g);
 assert.equal(heroCollectionSnapshot(g).count,0);
 assert.equal(heroCollectionSnapshot(g).complete,false);
 g.personalAdventureSolo=false;enterHeroCollection(g);assert.equal(g.heroCollection,null);
});

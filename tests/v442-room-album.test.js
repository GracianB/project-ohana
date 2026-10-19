import test from 'node:test';import assert from 'node:assert/strict';
import {ROOMS} from '../systems/map.js';import {ROSTER} from '../characters/roster.js';
import {cleanRoomAlbums,mergeRoomAlbums,roomAlbumPlacements,enterRoomAlbum,takeRoomItem,claimRoomRelic,tickRelicScene} from '../systems/room-album.js';
import {packSave,unpackSave} from '../systems/save.js';import {simulateJump} from '../systems/jump-audit.js';
import {enterKiloGrove,updateKiloGrove} from '../systems/kilo-grove.js';
test('Every room has 100 stable supported collectibles, including 30 high-route items',()=>{
 for(const room of Object.values(ROOMS)){const items=roomAlbumPlacements(room);assert.equal(items.length,100);assert.equal(items.filter(i=>i.challenge).length,30);assert.equal(new Set(items.map(i=>i.id)).size,100);assert.deepEqual(items,roomAlbumPlacements(room));
  for(const i of items){assert.ok(room.plats.some(p=>i.x>=p[0]&&i.x<=p[0]+p[2]&&i.y<p[1]&&i.y>=p[1]-72),`${room.id} ${i.id}`);assert.ok(i.y>48);assert.ok(!room.hazards.some(h=>i.x>h.x&&i.x<h.x+h.w&&i.y>h.y));}
 }
});
test('Albums survive save/resume, preserve all 100 ids and sanitize hostile data',()=>{
 const raw={hub:{found:[...Array(100).keys(),-1,100,'1',0],relic:true},fake:{found:[1]}};assert.equal(cleanRoomAlbums(raw).hub.found.length,100);assert.equal(cleanRoomAlbums(raw).fake,undefined);
 const g={player:{id:'kilo',evo:2},roomId:'hub',roomAlbums:raw};assert.deepEqual(unpackSave(packSave(g),'kilo').roomAlbums,cleanRoomAlbums(raw));
 assert.deepEqual(mergeRoomAlbums({hub:{found:[1],relic:false}},{hub:{found:[2],relic:false}}).hub.found,[1,2]);
 assert.equal(cleanRoomAlbums({hub:{found:[1],relic:true}}).hub.relic,false);
});
test('Relic needs 100 unique finds and freezes the world for exactly 600 ticks once',()=>{
 const g={roomId:'hub',roomDef:ROOMS.hub,roomAlbums:{},player:{id:'cat'}};enterRoomAlbum(g);assert.equal(claimRoomRelic(g),false);
 for(let i=0;i<100;i++){assert.equal(takeRoomItem(g,i),true);assert.equal(takeRoomItem(g,i),false);}
 assert.equal(claimRoomRelic(g),true);assert.equal(g.roomAlbums.hub.relic,true);assert.equal(claimRoomRelic(g),false);
 for(let i=0;i<599;i++)assert.equal(tickRelicScene(g),true);assert.ok(g.relicScene);tickRelicScene(g);assert.equal(g.relicScene,null);assert.equal(g.score,1000);
});
test('Ten rooms contain at least 32 named enemies and all eight added combat roles',()=>{
 for(const room of Object.values(ROOMS)){assert.ok(room.foes.length>=32);assert.ok(room.foes.every(f=>f[4]?.name));assert.equal(new Set(room.foes.map(f=>f[4].role).filter(Boolean)).size,8);}
});
test('Claro has lethal pits, baby-accessible crossings and reversible crumbling ledges',()=>{
 assert.equal(ROOMS.hub.hazards.length,2);for(const h of ROOMS.hub.hazards){assert.equal(h.type,'death');for(const hero of ROSTER)assert.ok(simulateJump(hero.forms[0],{gap:h.w*1.2,landing:600}).landed,hero.id);}
 const g={roomId:'hub',t:0,platforms:ROOMS.hub.plats.map(([x,y,w,h])=>({x,y,w,h})),player:{x:700,y:852,w:20,h:28,grounded:true}};enterKiloGrove(g);const f=g.kiloGrove.fragile[0];assert.ok(f);for(let i=0;i<45;i++)updateKiloGrove(g);assert.equal(f.platform.w,0);for(let i=0;i<240;i++)updateKiloGrove(g);assert.equal(f.platform.w,f.w);
});

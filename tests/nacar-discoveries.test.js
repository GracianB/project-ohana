import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildNacarRoom} from '../systems/nacar-room.js';
import {interactNacar,nacarPrompt,nacarDiscovered,updateNacarChapter,activeNacarRoute,swimNacar,nacarBossPattern} from '../systems/nacar-chapter.js';
import {packSave,unpackSave} from '../systems/save.js';

function setup(){
 const roomDef=buildNacarRoom();
 const g={roomDef,roomId:roomDef.id,player:{id:'nacar',x:0,y:0,w:24,h:28,xp:0,health:40,maxHealth:100},world1:{tick:0,stations:roomDef.seal.stations}};
 const move=id=>{
  const d=roomDef.discoveries.find(d=>d.id===id);
  Object.assign(g.player,{x:d.x-g.player.w/2,y:d.y-g.player.h/2});
  return d;
 };
 return {g,move};
}

test('wreck echoes unlock a reusable two-way route without completing pearls',()=>{
 const {g,move}=setup();
 move('shortcut-west');assert.equal(nacarPrompt(g),null);
 move('log');interactNacar(g);assert.equal(nacarDiscovered(g,'log'),false);
 for(const id of ['bell','log','lantern','conch']){move(id);assert.ok(interactNacar(g));assert.ok(nacarDiscovered(g,id));}
 g.secrets=unpackSave(packSave(g)).secrets;
 for(const id of ['shortcut-west','shortcut-east']){
  const d=move(id);assert.ok(interactNacar(g));
  assert.equal(g.player.x+g.player.w/2,d.toX);
  assert.equal(g.player.y+g.player.h/2,d.toY);
 }
 assert.equal(g.player.xp,0);
 assert.equal(g.world1.stations.some(s=>s.done),false);
});

test('foam refuge saves only after helping and cannot heal twice',()=>{
 const {g,move}=setup();
 g.player.health=100;move('refuge-west');interactNacar(g);
 assert.equal(nacarDiscovered(g,'refuge-west'),false);
 g.player.health=40;interactNacar(g);
 assert.equal(g.player.health,75);
 g.secrets=unpackSave(packSave(g)).secrets;
 interactNacar(g);assert.equal(g.player.health,75);
 g.onlineAdventure=true;move('refuge-east');assert.equal(nacarPrompt(g),null);
});

test('the return from Nácar keeps Michi’s saved form after reopening the game',()=>{
 const {g}=setup();
 g._aquariumMichi={evo:2,xp:240,hp:36};
 const raw=packSave(g);
 assert.deepEqual(unpackSave(raw).aquariumReturn,g._aquariumMichi);
 assert.equal(unpackSave({...raw,roomId:'w1-cat'}).aquariumReturn,null);
 assert.equal(unpackSave({...raw,aquariumReturn:{evo:99,xp:240,hp:36}}).aquariumReturn,null);
});

test('route progression requires rings in order and saves its medal without granting a pearl',()=>{
 const {g}=setup();
 const route=g.roomDef.swimRoutes[0];
 const place=(x,y)=>Object.assign(g.player,{x:x-g.player.w/2,y:y-g.player.h/2});
 place(route.x,route.y);assert.ok(interactNacar(g));
 place(...route.rings[1]);g.world1.tick++;updateNacarChapter(g);
 assert.equal(activeNacarRoute(g).run.ring,0);
 for(const ring of route.rings){place(...ring);g.world1.tick+=55;updateNacarChapter(g);}
 assert.equal(activeNacarRoute(g),null);
 assert.ok(nacarDiscovered(g,'course-kelp-gold'));
 assert.equal(g.world1.stations.some(s=>s.done),false);
 assert.ok(unpackSave(packSave(g)).secrets['w1-nacar'].includes('w1-nacar-discovery-course-kelp-gold'));
 place(route.x,route.y);interactNacar(g);
 g.world1.tick+=route.limit;updateNacarChapter(g);
 assert.equal(activeNacarRoute(g),null);
});

test('neutral swimming settles and Compass drifts less than Aurora',()=>{
 const {g}=setup();
 const p=g.player;
 p.vy=6;
 for(let i=0;i<40;i++)swimNacar(g,p,false,false);
 assert.equal(p.vy,0);
 Object.assign(p,{x:3530,y:1200,evo:2,vy:0});
 swimNacar(g,p,false,false);
 const compass=p.vy;
 Object.assign(p,{evo:3,vy:0});
 swimNacar(g,p,false,false);
 assert.ok(Math.abs(compass)<Math.abs(p.vy));
 for(let i=0;i<50;i++)swimNacar(g,p,true,false);
 assert.ok(p.vy<0&&p.vy>=-9);
});

test('the late-stage sweep leaves two adjacent lanes clear',()=>{
 const e={x:9500,y:1430,w:130,h:135,_nacarBoss:{attack:3,tier:3,tx:9200,ty:1405}};
 const shots=nacarBossPattern(e);
 assert.equal(shots.length,6);
 assert.ok(shots.every(s=>s.x===8840&&s.angle===0));
 assert.ok(shots.every(s=>s.y!==1405&&s.y!==1510));
 e._nacarBoss.tx=9800;
 assert.ok(nacarBossPattern(e).every(s=>s.x===10480&&s.angle===Math.PI));
});

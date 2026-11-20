import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildNacarRoom} from '../systems/nacar-room.js';
import {interactNacar,nacarPrompt,nacarDiscovered,updateNacarChapter,activeNacarRoute,swimNacar,nacarBossPattern,anemonePressure,createNacarBoss,updateNacarBoss} from '../systems/nacar-chapter.js';
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

test('rendering sees the same current that pushes Nácar, including reversals',()=>{
 const {g}=setup(),p=g.player,{id,area}=g.roomDef.tides[0];
 Object.assign(p,{x:area.x+10,y:area.y+10,evo:3,vy:0});
 swimNacar(g,p,false,false);
 const push=p.vy;
 assert.ok(push>0);
 assert.equal(p._nacarCurrent,push);
 assert.equal(p._nacarStroke,0);
 p.vy=0;
 g._nacarCurrents={[id]:true};
 swimNacar(g,p,false,true);
 assert.equal(p._nacarStroke,1);
 assert.equal(p._nacarCurrent,-push);
 assert.ok(p.vy<5.8*.26);
 Object.assign(p,{x:0,y:300,vy:0});
 swimNacar(g,p,true,false);
 assert.equal(p._nacarCurrent,0);
 assert.equal(p._nacarStroke,-1);
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

test('Anemone locks its attack on entering the arena and cancels from a retreat',()=>{
 const {g}=setup();
 g.world1.stations.forEach(s=>{s.done=true;});
 g.projectiles=[];
 const boss=createNacarBoss(()=>({}),()=>.5);
 const p=g.player;
 Object.assign(p,{x:900,y:1200});
 for(let i=0;i<140;i++)updateNacarBoss(boss,g);
 assert.equal(boss._nacarBoss.active,false);
 assert.equal(g.projectiles.length,0);
 Object.assign(p,{x:9300,y:1300});
 for(let i=0;i<34;i++)updateNacarBoss(boss,g);
 const locked=boss._nacarBoss.tx;
 p.x=9700;
 for(let i=0;i<65;i++)updateNacarBoss(boss,g);
 assert.equal(boss._nacarBoss.tx,locked);
 assert.ok(g.projectiles.every(s=>s.anemone&&s.life>0));
 assert.ok(g.projectiles.length);
 p.x=8200;updateNacarBoss(boss,g);
 assert.ok(g.projectiles.every(s=>s.life===0&&s.dmg===0));
 assert.equal(boss._nacarBoss.active,false);
});

test('double pressure uses both announced safe lanes and hits only once per wave',()=>{
 const {g}=setup();
 g.world1.stations.forEach(s=>{s.done=true;});
 g.projectiles=[];
 const e=createNacarBoss(()=>({}),()=>.5);
 const p=g.player,b=e._nacarBoss;
 Object.assign(p,{x:9520,y:1126}); // centre within upper lane
 Object.assign(b,{active:true,phase:'attack',attack:4,ty:1520,clock:105,tier:3});
 const hits=[];
 const hurt=amount=>hits.push(amount);
 assert.equal(anemonePressure(e).safeY,1140);
 updateNacarBoss(e,g,hurt);
 assert.deepEqual(hits,[]);
 while(b.clock>19)updateNacarBoss(e,g,hurt);
 assert.equal(anemonePressure(e).safeY,1530);
 updateNacarBoss(e,g,hurt);
 assert.deepEqual(hits,[19]);
 for(let i=0;i<18;i++)updateNacarBoss(e,g,hurt);
 assert.deepEqual(hits,[19]);
 assert.equal(b.phase,'rest');
 assert.equal(e.damageWindowRemaining,b.openDamage);
});

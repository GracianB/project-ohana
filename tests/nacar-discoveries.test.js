import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildNacarRoom} from '../systems/nacar-room.js';
import {interactNacar,nacarPrompt,nacarDiscovered} from '../systems/nacar-chapter.js';
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

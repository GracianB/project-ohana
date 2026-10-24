import test from 'node:test';
import assert from 'node:assert/strict';
import {WORLD1_ROOMS} from '../systems/world1-rooms.js';
import {loadWorld1Collect,enterWorld1Collect,takeWorld1Item,world1AlbumView,world1AlbumKey,toggleWorld1Album} from '../systems/world1-collect.js';
import {Festival} from '../systems/v1002-festival.js';
function setup(storage=new Map()){
 const floats=[],beats=[];
 const g={roomId:'w1-kilo',roomDef:WORLD1_ROOMS['w1-kilo'],score:0,
  player:{x:0,y:0,w:32,health:40,maxHealth:100},nums:{add(...args){floats.push(args);}},
  onWorld1Beat(...args){beats.push(args);},save(){},
  personalCollectionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)}};
 loadWorld1Collect(g);enterWorld1Collect(g);return {g,floats,beats,storage};
}
test('earned memories keep score, page healing and persistence without a floating counter for every item',()=>{
 const {g,floats,beats,storage}=setup();
 for(let id=0;id<10;id++)assert.equal(takeWorld1Item(g,id),true);
 assert.equal(g.score,100);assert.equal(g.player.health,50);
 assert.equal(floats.length,1);assert.match(floats[0][2],/PRIMER RECUERDO/);
 assert.equal(beats.filter(([kind])=>kind==='album-page').length,1);
 assert.equal(takeWorld1Item(g,9),false);assert.equal(g.player.health,50);
 const restored=setup(storage).g, view=world1AlbumView(restored);
 assert.equal(view.count,10);assert.equal(view.complete,true);
 assert.ok(view.cards.every(c=>c.found));assert.equal(view.relic,null);
});
test('all 100 real memory IDs remain browsable across ten pages, with one relic and no form gate',()=>{
 const {g,beats}=setup();
 for(let id=0;id<100;id++)takeWorld1Item(g,id);
 assert.equal(g.score,1000);assert.equal(beats.filter(([kind])=>kind==='album-relic').length,1);
 toggleWorld1Album(g,true);const seen=[];
 for(let page=0;page<10;page++){
  const view=world1AlbumView(g);assert.equal(view.page,page);assert.ok(view.relic);
  assert.equal(view.cards.length,10);seen.push(...view.cards.map(c=>c.id));
  assert.equal(world1AlbumKey(g,'ArrowRight'),true);
 }
 assert.deepEqual(seen,Array.from({length:100},(_,i)=>i));
 assert.equal(world1AlbumView(g).page,0);assert.equal(world1AlbumKey(g,'Tab'),false);
 assert.equal(world1AlbumKey(g,'Escape'),true);assert.equal(g.world1CollectUI.open,false);
});
test('the campaign album entry routes to the same collection instead of the legacy gallery',()=>{
 const oldGame=Festival.game,oldOpen=Festival.openWorld1Album;let calls=0;
 try{
  Festival.game={running:true,roomDef:WORLD1_ROOMS['w1-kilo']};
  Festival.openWorld1Album=()=>{calls++;};Festival.open();assert.equal(calls,1);
 }finally{Festival.game=oldGame;Festival.openWorld1Album=oldOpen;}
});

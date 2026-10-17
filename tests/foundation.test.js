import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveBody } from '../engine/collide.js';
import { createSaveStore } from '../systems/save.js';
import { sanitizeRuntimeState } from '../systems/runtime-state.js';

test('diagonal near misses do not create phantom wall or floor contacts', () => {
  for (const [start, end, platform] of [
    [[0,0], [100,100], {x:80,y:0,w:30,h:30}],
    [[100,0], [0,100], {x:0,y:0,w:30,h:30}],
    [[0,100], [100,0], {x:80,y:90,w:30,h:30}],
    [[0,0], [100,100], {x:0,y:80,w:30,h:30}],
  ]) {
    const body = {x:end[0], y:end[1], w:10, h:10, vx:end[0]-start[0], vy:end[1]-start[1]};
    const result = resolveBody(body, [platform], {prevX:start[0], prevY:start[1]});
    assert.deepEqual(result, {grounded:false,hitX:0,hitY:0});
    assert.deepEqual([body.x,body.y], end);
  }
});

test('fast movement hits the correct wall, floor and ceiling face', () => {
  const block = {x:80,y:80,w:100,h:100};
  for (const [start,end,expected,contact] of [
    [[0,100],[200,100],[70,100],[-1,0]],
    [[220,100],[0,100],[180,100],[1,0]],
    [[100,0],[100,200],[100,70],[0,1]],
    [[100,220],[100,0],[100,180],[0,-1]],
    [[50,0],[100,100],[100,70],[0,1]],
  ]) {
    const body = {x:end[0],y:end[1],w:10,h:10,vx:end[0]-start[0],vy:end[1]-start[1]};
    const result = resolveBody(body,[block],{prevX:start[0],prevY:start[1]});
    assert.deepEqual([body.x,body.y],expected);
    assert.deepEqual([result.hitX,result.hitY],contact);
  }
});

function checkpoint(xp) {
  return {roomId:'hub', player:{id:'kilo',xp,evo:0,health:100}};
}
function memory() {
  const data = new Map();
  return {data,getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)};
}

test('a failed primary write recovers the newest staged checkpoint after reopening', () => {
  const storage = memory();
  assert.equal(createSaveStore(storage).write(checkpoint(10)),true);
  const failing = {...storage,setItem:(key,value)=>{
    if(key==='ohana') throw Error('quota');
    storage.setItem(key,value);
  }};
  assert.equal(createSaveStore(failing).write(checkpoint(55)),false);
  assert.equal(createSaveStore(storage).read('kilo').xp,55);
  assert.equal(createSaveStore(storage).read('dino'),null);
  assert.equal(createSaveStore(storage).write(checkpoint(80)),true);
  assert.equal(createSaveStore(storage).read('kilo').xp,80);
  assert.equal(storage.data.has('ohana.tmp'),false);
});

test('legacy primary, stale staging, corrupt and unsupported saves recover safely', () => {
  const storage=memory();
  const put=(key,value)=>storage.setItem(key,JSON.stringify(value));
  put('ohana',{v:2,id:'lilo',xp:10});
  const store=createSaveStore(storage);
  assert.equal(store.read('kilo').xp,10);
  store.write(checkpoint(55));
  put('ohana.tmp',{v:2,id:'kilo',xp:1,revision:0});
  assert.equal(store.read('kilo').xp,55);
  put('ohana.tmp',{v:999,id:'kilo',xp:99,revision:999});
  assert.equal(store.read('kilo').xp,55);
  put('ohana',{v:999,id:'kilo'});
  put('ohana.tmp',{v:2,id:'kilo',xp:80,revision:2});
  assert.equal(store.read('kilo').xp,80);
  storage.setItem('ohana','{broken');
  assert.equal(store.read('kilo').xp,80);
});

test('runtime boundary sanitizes corrupt entities without changing valid state', () => {
  const game={t:1,score:NaN,kills:-1,worldW:2240,worldH:1260,cam:{x:0,y:0},
    player:{x:100,y:100,w:32,h:32,vx:Infinity,vy:3,maxHealth:100,health:200,xp:55,evo:1},
    enemies:[null,{x:1,y:2,hp:Infinity,max:10}],projectiles:[],ghosts:[],orbs:[]};
  sanitizeRuntimeState(game);
  assert.equal(game.score,0);
  assert.equal(game.kills,0);
  assert.equal(game.player.vx,0);
  assert.equal(game.player.health,100);
  assert.equal(game.player.xp,55);
  assert.equal(game.player.vy,3);
  assert.equal(game.enemies.length,1);
  assert.equal(game.enemies[0].hp,0);
  const snapshot=JSON.stringify(game);
  sanitizeRuntimeState(game);
  assert.equal(JSON.stringify(game),snapshot);
});


test('starting a new game clears both committed and staged checkpoints', () => {
  const storage=memory(), store=createSaveStore(storage);
  store.write(checkpoint(10));
  storage.setItem('ohana.tmp',JSON.stringify({v:2,id:'kilo',xp:55,revision:2}));
  assert.equal(store.clear(),true);
  assert.equal(store.readRaw(),null);
  assert.equal(storage.data.size,0);
  assert.equal(createSaveStore(()=>{throw Error('blocked');}).clear(),false);
});

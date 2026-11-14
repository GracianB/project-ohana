import test from 'node:test';
import assert from 'node:assert/strict';
import {WORLD1_ROOMS} from '../systems/world1-rooms.js';
import {authorCatEncounters,CAT_JELLIES_V609} from '../systems/cat-encounters-v609.js';
import {catGrowth,catObjective,MICHI_CHAPTER_ARENA} from '../systems/cat-chapter.js';
import {drawCatCreature,drawCatMoonJelly,drawCatCrystalBridge,drawCatTrap,drawCatAtmosphere,drawCatStardust,drawCatBossArena,drawCatPearl,drawCatUpdraft} from '../systems/cat-chapter-art-v609.js';
import {updateCatChapter} from '../systems/cat-chapter.js';


const legacyRoom=authorCatEncounters(structuredClone(WORLD1_ROOMS['w1-cat']));delete legacyRoom.michiSanctuary;
test('V609 Cat room: single authored route of 14400 with lunar crystal terraces, pits and traps', () => {
 const room = legacyRoom;
 assert.equal(room.catEncounterVersion, 609);
 assert.equal(room.width, 14400);
 assert.ok(room.plats?.length >= 25, 'must combine ground terraces and crystal bridges');
 assert.ok(room.plats.some(p => p[0] === 9600 && p[2] === 4800 && p[1] === 1134), 'must preserve continuous ground for V2 adventure');
 assert.ok(room.hazards?.length >= 3, 'must feature three deep astral fog pits');
 assert.ok(room.catTraps?.length >= 3, 'must feature three veil spider web traps');
});

test('V609 Cat stations: five sacred lunar jellyfish in ascending air layers', () => {
 const room = legacyRoom;
 const stations = room.seal.stations;
 assert.equal(stations.length, 5);

 // Check canonical positions
 assert.equal(stations[0].x, 1680);
 assert.equal(stations[1].x, 3360);
 assert.equal(stations[2].x, 5040);
 assert.equal(stations[3].x, 6720);
 assert.equal(stations[4].x, 8100);

 for (let i = 0; i < 5; i++) {
  assert.equal(stations[i].id, i);
  assert.equal(stations[i].kind, 'jelly');
  assert.ok(stations[i].name, 'jelly must have a named title');
  assert.ok(stations[i].y < 1134, 'all jellies are suspended in the air');
 }
});

test('V609 Cat fauna ecology: 5 species with structured roles and escalation', () => {
 const room = legacyRoom;
 const foes = room.foes;
 assert.ok(foes.length >= 18, 'must contain authored lunar creatures');

 const kinds = new Set(foes.map(f => f[2]));
 for (const expected of ['medusa', 'phosquito', 'ufo', 'murcielago', 'arana']) {
  assert.ok(kinds.has(expected), `missing expected species ${expected}`);
 }

 // HP escalates from early Act 0 to pre-boss
 const hps = foes.map(f => f[4].chapterHP).filter(Number.isFinite);
 assert.ok(Math.min(...hps) <= 55, 'first encounters should be accessible for kitten form');
 assert.ok(Math.max(...hps) >= 140, 'pre-boss sentinels must present serious resistance');

 // Every creature needs homeX and leash bounds
 for (const f of foes) {
  assert.ok(f[4].homeX != null, 'every creature needs a home position');
  assert.ok(f[4].leash != null, 'every creature needs a leash range');
 }
});

test('V609 Cat objective and progression: guides to jellies then to Oráculo Medusaluna', () => {
 const g = {
  roomDef: legacyRoom,
  world1: {
   stations: legacyRoom.seal.stations.map(s => ({ ...s, done: false })),
   sealed: false
  },
  player: { id: 'cat', xp: 0, evo: 0 }
 };

 assert.equal(catGrowth(g), 0);
 assert.equal(catObjective(g), null, 'objective is not boss until all 5 jellies are done');

 for (let i = 0; i < 4; i++) {
  g.world1.stations[i].done = true;
  assert.equal(catGrowth(g), [55, 140, 260, 260][i]);
 }

 // 5th jelly unlocks max form
 g.world1.stations[4].done = true;
 assert.equal(catGrowth(g), 420);

 const bossObj = catObjective(g);
 assert.ok(bossObj != null);
 assert.equal(bossObj.x, 8750);
 assert.match(bossObj.label, /Oráculo Medusaluna/);
});

test('V609 Cat vector art renderers: fauna and moon jelly callable without errors', () => {
 const dummyCtx = {
  save() {}, restore() {}, translate() {}, scale() {}, rotate() {},
  beginPath() {}, closePath() {}, moveTo() {}, lineTo() {}, bezierCurveTo() {}, quadraticCurveTo() {},
  rect() {}, roundRect() {}, arc() {}, ellipse() {}, fill() {}, stroke() {},
  strokeRect() {}, fillRect() {}, fillText() {}, createLinearGradient() { return { addColorStop() {} }; },
  createRadialGradient() { return { addColorStop() {} }; }
 };

 // Creature
 const dummyFoe = {
  roomId: 'w1-cat',
  kind: 'medusa',
  campaignRole: 'flyer',
  roomPersona: { catEncounter: true },
  x: 1000, y: 1000, w: 56, h: 56, vx: 1,
  _campaign: { wind: 0, active: 0, aim: 1 }
 };
 assert.equal(drawCatCreature(dummyCtx, dummyFoe, { x: 0, y: 0 }, 100), true);

 // Moon jelly and crystal bridge
 const dummyStation = { id: 0, x: 1680, y: 914, done: false };
 drawCatMoonJelly(dummyCtx, dummyStation, { x: 0, y: 0 }, 100);
 dummyStation.done = true;
 drawCatMoonJelly(dummyCtx, dummyStation, { x: 0, y: 0 }, 100);
 drawCatCrystalBridge(dummyCtx, dummyStation, { x: 0, y: 0 }, 100);

 // Astral traps, atmosphere and stardust
 drawCatTrap(dummyCtx, { x: 2740, y: 1064, w: 90, h: 70 }, { x: 0, y: 0 }, 100);
 drawCatAtmosphere(dummyCtx, { viewW: 1280 }, { x: 0, y: 0 }, 100);
 drawCatStardust(dummyCtx, { x: 1000, y: 1000, w: 40, h: 40, vx: 4, grounded: true }, { x: 0, y: 0 }, 100);

 // Boss arena, pearls and updrafts
 drawCatBossArena(dummyCtx, { viewW: 1280 }, { x: 8200, y: 0 }, 100);
 drawCatPearl(dummyCtx, { id: 0, x: 1050, y: 874, r: 10 }, { x: 1000, y: 800 }, 100);
 drawCatUpdraft(dummyCtx, { id: 'up-1', x: 2200, y: 954, w: 180, h: 260 }, { x: 2100, y: 900 }, 100);
});

test('V609 Cat room: pearls and abyssal updrafts are present and interact with player', () => {
 const room = legacyRoom;
 assert.ok(room.catPearls?.length >= 10, 'must contain collectible Selenite Pearls');
 assert.ok(room.catUpdrafts?.length >= 3, 'must contain updrafts over the 3 pits');

 const g = {
  roomDef: room,
  world1: {
   stations: room.seal.stations.map(s => ({ ...s, done: false })),
   catPearlsTaken: []
  },
  player: { id: 'cat', x: 1050, y: 1134 - 260, w: 30, h: 30, vy: 4, health: 50, grounded: false }
 };

 // Touching a pearl collects it and heals player
 updateCatChapter(g);
 assert.ok(g.world1.catPearlsTaken.includes(0));
 assert.ok(g.player.health > 50);

 // Updraft lifts falling player
 g.player.x = 1880;
 g.player.y = 1134 - 200;
 g.player.vy = 8;
 updateCatChapter(g);
 assert.ok(g.player.vy < 0, 'updraft must propel player upwards');
});


test('V609 Michi: a full lunar jelly swim cycle never feeds NaN into Canvas',()=>{
 const gradient=(...args)=>{
  assert.ok(args.every(Number.isFinite),'nonfinite Canvas gradient '+JSON.stringify(args));
  return {addColorStop(offset){assert.ok(Number.isFinite(offset));}};
 };
 let grads=0;
 const ctx=new Proxy({},{
  get(_target,key){
   if(key==='createLinearGradient'||key==='createRadialGradient')
    return (...args)=>{grads++;return gradient(...args);};
   if(typeof key==='symbol')return undefined;
   return (...args)=>{
    for(const v of args)if(typeof v==='number')
     assert.ok(Number.isFinite(v),'nonfinite Canvas command '+String(key));
   };
  },
  set(){return true;}
 });
 const e={roomId:'w1-cat',roomPersona:{catEncounter:true},kind:'medusa',
  campaignRole:'flyer',x:1790,y:990,w:56,h:56,vx:0,
  hp:55,max:55,invuln:0,stun:0,facing:1,spawnIndex:6,
  _campaign:{wind:0,active:0,aim:1}};
 for(let t=0;t<=300;t+=2){
  assert.equal(drawCatCreature(ctx,e,{x:1400,y:600},t,false),true);
  assert.equal(drawCatCreature(ctx,e,{x:1400,y:600},t,true),true);
 }
 assert.ok(grads>400,'renders repeated real translucent bell gradients');
});

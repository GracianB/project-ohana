import test from 'node:test';
import assert from 'node:assert/strict';
import {WORLD1_ROOMS} from '../systems/world1-rooms.js';
import {CAT_JELLIES_V609} from '../systems/cat-encounters-v609.js';
import {catGrowth,catObjective,MICHI_CHAPTER_ARENA} from '../systems/cat-chapter.js';
import {drawCatCreature,drawCatMoonJelly} from '../systems/cat-chapter-art-v609.js';

test('V609 Cat room: single authored route of 14400 with lunar crystal terraces', () => {
 const room = WORLD1_ROOMS['w1-cat'];
 assert.equal(room.catEncounterVersion, 609);
 assert.equal(room.width, 14400);
 assert.ok(room.plats?.length >= 25, 'must combine ground terraces and crystal bridges');
 assert.ok(room.plats.some(p => p[0] === 9600 && p[2] === 4800 && p[1] === 1134), 'must preserve continuous ground for V2 adventure');
});

test('V609 Cat stations: five sacred lunar jellyfish in ascending air layers', () => {
 const room = WORLD1_ROOMS['w1-cat'];
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
 const room = WORLD1_ROOMS['w1-cat'];
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
  roomDef: WORLD1_ROOMS['w1-cat'],
  world1: {
   stations: WORLD1_ROOMS['w1-cat'].seal.stations.map(s => ({ ...s, done: false })),
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

 // Moon jelly
 const dummyStation = { id: 0, x: 1680, y: 914, done: false };
 drawCatMoonJelly(dummyCtx, dummyStation, { x: 0, y: 0 }, 100);
 dummyStation.done = true;
 drawCatMoonJelly(dummyCtx, dummyStation, { x: 0, y: 0 }, 100);
});

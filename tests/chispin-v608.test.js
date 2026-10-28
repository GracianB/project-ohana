import test from 'node:test';
import assert from 'node:assert/strict';
import {WORLD1_ROOMS} from '../systems/world1-rooms.js';
import {CHISPIN_ANTENNAS_V608} from '../systems/chispin-encounters-v608.js';
import {chispinGrowth,chispinObjective,CHISPIN_CHAPTER_GATES,CHISPIN_CHAPTER_ARENA} from '../systems/chispin-chapter.js';
import {drawChispinCreature,drawChispinRod,drawChispinArcGate} from '../systems/chispin-chapter-art-v608.js';

test('V608 Chispin room: single authored route of 14400 with sanctuary terraces', () => {
 const room = WORLD1_ROOMS['w1-chispin'];
 assert.equal(room.chispinEncounterVersion, 608);
 assert.equal(room.width, 14400);
 assert.ok(room.terraces?.length >= 8, 'must feature authored sanctuary terraces and ramps');
 assert.ok(room.plats?.length >= 25, 'must combine ground terraces and marble catwalks');
 assert.ok(room.plats.some(p => p[0] === 9600 && p[2] === 4800 && p[1] === 1134), 'must preserve continuous ground for V2 adventure');
});

test('V608 Chispin antennas and gates: four storm spires and three high-voltage gates', () => {
 const room = WORLD1_ROOMS['w1-chispin'];
 const stations = room.seal.stations;
 assert.equal(stations.length, 4);

 // Check canonical positions
 assert.equal(stations[0].x, 2160);
 assert.equal(stations[1].x, 3760);
 assert.equal(stations[2].x, 5360);
 assert.equal(stations[3].x, 7280);

 for (let i = 0; i < 4; i++) {
  assert.equal(stations[i].id, i);
  assert.equal(stations[i].kind, 'rod');
  assert.ok(stations[i].name, 'antenna must have a named title');
 }

 // Gates
 assert.equal(CHISPIN_CHAPTER_GATES.length, 3);
 assert.deepEqual(CHISPIN_CHAPTER_GATES.map(g => g.x), [2860, 4460, 6260]);
});

test('V608 Chispin fauna ecology: 5 species with structured roles and escalation', () => {
 const room = WORLD1_ROOMS['w1-chispin'];
 const foes = room.foes;
 assert.ok(foes.length >= 18, 'must contain authored sanctuary creatures');

 const kinds = new Set(foes.map(f => f[2]));
 for (const expected of ['gaviota', 'murcielago', 'phosquito', 'rana', 'avispa']) {
  assert.ok(kinds.has(expected), `missing expected species ${expected}`);
 }

 // HP escalates from early Act 0 to pre-boss
 const hps = foes.map(f => f[4].chapterHP).filter(Number.isFinite);
 assert.ok(Math.min(...hps) <= 55, 'first encounters should be accessible for baby form');
 assert.ok(Math.max(...hps) >= 150, 'pre-boss sentinels must present serious resistance');

 // Every creature needs homeX and leash bounds
 for (const f of foes) {
  assert.ok(f[4].homeX != null, 'every creature needs a home position');
  assert.ok(f[4].leash != null, 'every creature needs a leash range');
 }
});

test('V608 Chispin objective and progression: guides to antennas then to Titán de Trueno', () => {
 const g = {
  roomDef: WORLD1_ROOMS['w1-chispin'],
  world1: {
   stations: WORLD1_ROOMS['w1-chispin'].seal.stations.map(s => ({ ...s, done: false })),
   sealed: false
  },
  player: { id: 'chispin', xp: 0, evo: 0 }
 };

 assert.equal(chispinGrowth(g), 0);
 assert.equal(chispinObjective(g), null, 'objective is not boss until all 4 antennas are done');

 for (let i = 0; i < 4; i++) {
  g.world1.stations[i].done = true;
  assert.equal(chispinGrowth(g), [55, 140, 260, 420][i]);
 }

 const bossObj = chispinObjective(g);
 assert.ok(bossObj != null);
 assert.equal(bossObj.x, 8750);
 assert.match(bossObj.label, /Titán de Trueno/);
});

test('V608 Chispin vector art renderers: fauna, antenna and gate functions callable without errors', () => {
 const dummyCtx = {
  save() {}, restore() {}, translate() {}, scale() {}, rotate() {},
  beginPath() {}, closePath() {}, moveTo() {}, lineTo() {}, bezierCurveTo() {}, quadraticCurveTo() {},
  rect() {}, roundRect() {}, arc() {}, ellipse() {}, fill() {}, stroke() {},
  strokeRect() {}, fillRect() {}, fillText() {}, createLinearGradient() { return { addColorStop() {} }; },
  createRadialGradient() { return { addColorStop() {} }; }
 };

 // Creature
 const dummyFoe = {
  roomId: 'w1-chispin',
  kind: 'gaviota',
  campaignRole: 'flyer',
  roomPersona: { chispinEncounter: true },
  x: 1000, y: 1000, w: 56, h: 56, vx: 1,
  _campaign: { wind: 0, active: 0, aim: 1 }
 };
 assert.equal(drawChispinCreature(dummyCtx, dummyFoe, { x: 0, y: 0 }, 100), true);

 // Rod
 const dummyStation = { id: 0, x: 2160, y: 1134, done: false };
 drawChispinRod(dummyCtx, dummyStation, { x: 0, y: 0 }, 100);
 dummyStation.done = true;
 drawChispinRod(dummyCtx, dummyStation, { x: 0, y: 0 }, 100);

 // Gate
 const dummyGate = { x: 2860, y: 1134, w: 56, h: 180 };
 drawChispinArcGate(dummyCtx, dummyGate, 'open', { x: 0, y: 0 }, 100);
 drawChispinArcGate(dummyCtx, dummyGate, 'active', { x: 0, y: 0 }, 100);
});

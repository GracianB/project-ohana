import test from 'node:test';
import assert from 'node:assert/strict';
import {WORLD1_ROOMS} from '../systems/world1-rooms.js';
import {STITCHO_WORKSHOPS,STITCHO_ARENA_V607,STITCHO_RAIL_V607,stitchoUnlockedForm,stitchoGrowthWaiting} from '../systems/stitcho-encounters-v607.js';
import {stitchoObjective} from '../systems/stitcho-chapter.js';

test('V607 Stitcho room: single authored route of 14400 with shipyard terraces', () => {
 const room = WORLD1_ROOMS['w1-stitcho'];
 assert.equal(room.stitchoEncounterVersion, 607);
 assert.equal(room.width, 14400);
 assert.ok(room.terraces?.length >= 8, 'must feature authored shipyard terraces and ramps');
 assert.ok(room.plats?.length >= 25, 'must combine ground terraces and crane/container shelves');
});

test('V607 Stitcho workshops: three progressive repair lessons', () => {
 const room = WORLD1_ROOMS['w1-stitcho'];
 const stations = room.seal.stations;
 assert.equal(stations.length, 3);

 // Station 0: Motor (x: 2400)
 assert.equal(stations[0].id, 0);
 assert.equal(stations[0].kind, 'part');
 assert.equal(stations[0].x, 2400);
 assert.equal(stations[0].target.x, 2920);
 assert.match(stations[0].action, /E o J/);

 // Station 1: Plasma (x: 5800)
 assert.equal(stations[1].id, 1);
 assert.equal(stations[1].kind, 'part');
 assert.equal(stations[1].x, 5800);
 assert.equal(stations[1].target.x, 6320);

 // Station 2: Nav (x: 9600)
 assert.equal(stations[2].id, 2);
 assert.equal(stations[2].kind, 'part');
 assert.equal(stations[2].x, 9600);
 assert.equal(stations[2].target.x, 10120);
});

test('V607 Stitcho fauna ecology: 5 species with structured roles and escalation', () => {
 const room = WORLD1_ROOMS['w1-stitcho'];
 const foes = room.foes;
 assert.ok(foes.length >= 18, 'must contain at least 18 authored encounter creatures');

 const kinds = new Set(foes.map(f => f[2]));
 for (const expected of ['cucaracho', 'arana', 'phosquito', 'ufo', 'murcielago']) {
  assert.ok(kinds.has(expected), `missing expected species ${expected}`);
 }

 // HP escalates from ~48 in Act 1 to 158 in Act 4
 const hps = foes.map(f => f[4].chapterHP).filter(Number.isFinite);
 assert.ok(Math.min(...hps) <= 55, 'first encounters should be accessible for baby form');
 assert.ok(Math.max(...hps) >= 150, 'pre-boss sentinels must present serious resistance');

 // Every foe must have home range and leash
 for (const f of foes) {
  assert.ok(f[4].homeX != null, 'every creature needs a home position');
  assert.ok(f[4].leash != null, 'every creature needs a leash range');
 }
});

test('V607 Stitcho unlocked form: derived cleanly from station count', () => {
 const g = {
  roomDef: {stitchoEncounterVersion: 607},
  player: {evo: 0},
  world1: {stations: [{done: false}, {done: false}, {done: false}]}
 };
 assert.equal(stitchoUnlockedForm(g), 0);
 assert.equal(stitchoGrowthWaiting(g), true, 'capped at current unlocked form 0');

 g.world1.stations[0].done = true;
 assert.equal(stitchoUnlockedForm(g), 1);
 assert.equal(stitchoGrowthWaiting(g), false, 'can now grow to form 1');

 g.world1.stations[1].done = true;
 assert.equal(stitchoUnlockedForm(g), 2);

 g.world1.stations[2].done = true;
 assert.equal(stitchoUnlockedForm(g), 3);

 // Sealed chapter grants form 4
 g.world1.sealed = true;
 assert.equal(stitchoUnlockedForm(g), 4);
});

test('V607 Stitcho objective: guides to rail then to Núcleo Glitch in V607 arena', () => {
 const room = WORLD1_ROOMS['w1-stitcho'];
 const g = {
  roomDef: room,
  secrets: {},
  world1: {stations: [{done: true}, {done: false}, {done: false}]}
 };

 // After first station, points to rail
 const objRail = stitchoObjective(g);
 assert.match(objRail.label, /Raíl/);
 assert.equal(objRail.x, STITCHO_RAIL_V607.left - 50);

 // When all stations done, points to boss arena
 g.secrets['w1-stitcho'] = [STITCHO_RAIL_V607.id];
 g.world1.stations = [{done: true}, {done: true}, {done: true}];
 const objBoss = stitchoObjective(g);
 assert.match(objBoss.label, /Núcleo Glitch/);
 const expectedBossX = Math.round((STITCHO_ARENA_V607.left + STITCHO_ARENA_V607.right) / 2);
 assert.equal(objBoss.x, expectedBossX);
});

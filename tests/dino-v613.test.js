// V613 — Test de validación integral: Valle Fósil de Dino, fauna prehistórica,
// placas fósiles ancestrales, mini-boss Coloso de Piedra y sistema de resonancia.
import test from 'node:test';
import assert from 'node:assert/strict';
import {WORLD1_ROOMS} from '../systems/world1-rooms.js';
import {authorDinoEncounters, DINO_PLATES_V613} from '../systems/dino-encounters-v613.js';
import {drawDinoCreature, drawDinoPlateV613, drawDinoGeyser, drawDinoAtmosphere} from '../systems/dino-chapter-art-v613.js';
import {DINO_CHAPTER_BOSS_ID, DINO_CHAPTER_ARENA, dinoGrowth, dinoChapterReady} from '../systems/dino-chapter.js';
import {drawDinoBossSignals, createDinoBoss} from '../systems/dino-boss.js';

function mockCtx() {
 const log = [];
 const fn = () => {};
 const grad = { addColorStop: fn };
 return new Proxy({}, {
  get(target, prop) {
   if (prop === 'createLinearGradient' || prop === 'createRadialGradient') return () => grad;
   if (prop === 'measureText') return () => ({ width: 40 });
   return fn;
  }
 });
}

test('dino-v613: ruta 14400px y suelo expedición intacto', () => {
 const r = WORLD1_ROOMS['w1-dino'];
 assert.equal(r.width, 14400);
 assert.equal(r.dinoEncounterVersion, 613);
 assert.ok(r.plats.some(p => p[0] === 9600 && p[2] === 4800 && p[1] === 1134));
});

test('dino-v613: tres abismos de fango prehistórico', () => {
 const r = WORLD1_ROOMS['w1-dino'];
 assert.equal(r.hazards.length, 3);
 for (const h of r.hazards) {
  assert.equal(h.type, 'death');
  assert.equal(h.heroEscape, 'dino');
 }
});

test('dino-v613: cuatro placas fósiles ancestrales con dropHeight creciente', () => {
 const r = WORLD1_ROOMS['w1-dino'];
 assert.equal(r.seal.stations.length, 4);
 const heights = r.seal.stations.map(s => s.dropHeight);
 assert.deepEqual(heights, [40, 80, 120, 180]);
 for (const [i, s] of r.seal.stations.entries()) {
  assert.equal(s.kind, 'fossil');
  assert.equal(s.order, i);
 }
});

test('dino-v613: cast 5 especies con roles canónicos', () => {
 const r = WORLD1_ROOMS['w1-dino'];
 const kinds = new Set(r.foes.map(f => f[2]));
 for (const k of ['cucaracho', 'rana', 'cangrejo', 'libelula', 'abeja']) {
  assert.ok(kinds.has(k), 'falta especie ' + k);
 }
 const authored = r.foes.filter(f => f[4]?.dinoEncounter);
 assert.ok(authored.length >= 18);
});

test('dino-v613: enemigos en x > 900 y x < 8100', () => {
 const r = WORLD1_ROOMS['w1-dino'];
 const authored = r.foes.filter(f => f[4]?.dinoEncounter && f[4]?.stage < 4);
 for (const f of authored) {
  assert.ok(f[0] > 900, 'enemigo demasiado cerca del spawn: ' + f[0]);
  assert.ok(f[0] < 8100, 'enemigo dentro de la arena: ' + f[0]);
 }
});

test('dino-v613: al menos 20 orbes de esencia fósil', () => {
 const r = WORLD1_ROOMS['w1-dino'];
 assert.ok(r.orbs.length >= 20, 'orbes: ' + r.orbs.length);
});

test('dino-v613: DINO_CHAPTER_BOSS_ID y DINO_CHAPTER_ARENA', () => {
 assert.equal(typeof DINO_CHAPTER_BOSS_ID, 'string');
 assert.equal(DINO_CHAPTER_ARENA.left, 8260);
 assert.equal(DINO_CHAPTER_ARENA.right, 9320);
 assert.equal(DINO_CHAPTER_ARENA.hp, 640);
});

test('dino-v613: dinoGrowth respeta XP_NEED canónico', () => {
 const g = {
  roomDef: { id: 'w1-dino', growthChapter: 'dino' },
  player: { xp: 0 },
  world1: { stations: DINO_PLATES_V613.map(b => ({ ...b, done: false })) }
 };
 assert.equal(dinoGrowth(g), 0);
 g.world1.stations[0].done = true;
 assert.equal(dinoGrowth(g), 55);
 g.world1.stations[1].done = true;
 assert.equal(dinoGrowth(g), 140);
 g.world1.stations[2].done = true;
 assert.equal(dinoGrowth(g), 260);
 g.world1.stations[3].done = true;
 assert.equal(dinoGrowth(g), 420);
});

test('dino-v613: drawDinoPlateV613 no lanza excepciones', () => {
 const ctx = mockCtx();
 const plate = { ...DINO_PLATES_V613[0], done: false };
 assert.doesNotThrow(() => drawDinoPlateV613(ctx, plate, { x: 0, y: 0 }, 10, false));
 plate.done = true;
 assert.doesNotThrow(() => drawDinoPlateV613(ctx, plate, { x: 0, y: 0 }, 20, false));
});

test('dino-v613: drawDinoGeyser no lanza excepciones', () => {
 const ctx = mockCtx();
 const geyser = { x: 2000, y: 1134, w: 100, h: 300 };
 assert.doesNotThrow(() => drawDinoGeyser(ctx, geyser, { x: 0, y: 0 }, 15, false));
});

test('dino-v613: drawDinoAtmosphere no lanza excepciones', () => {
 const ctx = mockCtx();
 assert.doesNotThrow(() => drawDinoAtmosphere(ctx, { viewW: 1280, viewH: 720 }, { x: 1000, y: 500 }, 30, false));
});

test('dino-v613: drawDinoCreature cubre las 5 especies', () => {
 const ctx = mockCtx();
 for (const kind of ['cucaracho', 'rana', 'cangrejo', 'libelula', 'abeja']) {
  const e = { x: 100, y: 200, w: 40, h: 40, kind, roomId: 'w1-dino', facing: 1, invuln: 0, stun: 0 };
  assert.equal(drawDinoCreature(ctx, e, { x: 0, y: 0 }, 10, false), true, 'debe dibujar ' + kind);
 }
});

test('dino-v613: dinoChapterReady fuera de sala dino', () => {
 assert.equal(dinoChapterReady({ roomDef: { id: 'w1-kilo' } }), true);
});

test('dino-v613: drawDinoBossSignals no lanza excepciones', () => {
 const ctx = mockCtx();
 const make = (x, y) => ({ x, y, invuln: 0, stun: 0 });
 const boss = createDinoBoss(make);
 for (const phase of ['intro', 'rest', 'warn', 'attack']) {
  boss._stoneColossus.phase = phase;
  for (let attack = 0; attack < 4; attack++) {
   boss._stoneColossus.attack = attack;
   assert.doesNotThrow(() => drawDinoBossSignals(ctx, boss, { x: 0, y: 0 }, 10, false));
  }
 }
});

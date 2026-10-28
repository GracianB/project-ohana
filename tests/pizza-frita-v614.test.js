// pizza-frita-v614.test.js — Validación integrada del dúo junk food V614/V615.
// Cubre: rutas 14400px, fauna 5 especies, HUD holográfico, orbes, abismos, drawing sin excepción.
import test from 'node:test';
import assert from 'node:assert/strict';
import { WORLD1_ROOMS } from '../systems/world1-rooms.js';
import { authorFritaEncounters } from '../systems/frita-encounters-v614.js';
import { authorPizzaEncounters } from '../systems/pizza-encounters-v615.js';
import { drawFritaBoss, drawFritaBossSignals, createFritaBoss, updateFritaBoss } from '../systems/frita-boss.js';
import { drawPizzaBoss, drawPizzaBossSignals, createPizzaBoss, updatePizzaBoss } from '../systems/pizza-boss.js';
import { drawFritaCreature } from '../systems/frita-chapter-art-v614.js';
import { drawPizzaCreature } from '../systems/pizza-chapter-art-v615.js';
import { drawPizzaOvenV615, drawPizzaGuestV615, drawPizzaAtmosphere } from '../systems/pizza-chapter-art-v615.js';
import { NEXT_CHAPTERS, NEXT_ARENA } from '../systems/chapters-lunar-prism-embers.js';

// ── Canvas stub ──────────────────────────────────────────────────────────────
function makeCtx() {
 const noop = () => ({});
 const noopArr = () => ({ addColorStop: () => {} });
 return new Proxy({}, {
  get(t, k) {
   if (k === 'save' || k === 'restore' || k === 'beginPath' || k === 'closePath' ||
       k === 'fill' || k === 'stroke' || k === 'clip' || k === 'setLineDash') return () => {};
   if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => noopArr();
   if (k === 'fillRect' || k === 'strokeRect' || k === 'rect' || k === 'moveTo' ||
       k === 'lineTo' || k === 'arc' || k === 'ellipse' || k === 'bezierCurveTo' ||
       k === 'quadraticCurveTo' || k === 'translate' || k === 'scale' || k === 'rotate' ||
       k === 'fillText' || k === 'strokeText' || k === 'roundRect') return () => {};
   if (k === 'textAlign' || k === 'font' || k === 'lineWidth' || k === 'lineCap' ||
       k === 'lineJoin' || k === 'globalAlpha' || k === 'fillStyle' || k === 'strokeStyle') return;
   return (t[k] !== undefined) ? t[k] : () => {};
  },
  set() { return true; }
 });
}

const ctx = makeCtx();
const cam = { x: 0, y: 0 };
const FLOOR = 1134;

// ── 1. Frita V614: ruta 14400px, contiene piso v2 ────────────────────────────
test('Frita V614: ruta 14400px, 3 abismos, 25 orbes, piso v2 incluido', () => {
 const room = WORLD1_ROOMS['w1-frita'];
 assert.equal(room.width, 14400, 'ruta 14400px');
 assert.ok(room.plats.some(p => p[0] === 9600 && p[2] === 4800 && p[1] === FLOOR), 'piso v2 [9600,1134,4800] presente');
 assert.equal(room.hazards?.filter(h => h.type === 'death').length, 3, '3 abismos de aceite');
 assert.equal(room.orbs.length, 25, '25 orbes de esencia dorada');
});

// ── 2. Frita V614: 5 especies de fauna presentes ─────────────────────────────
test('Frita V614: foes cubren las 5 especies culinarias', () => {
 const room = WORLD1_ROOMS['w1-frita'];
 const kinds = new Set(room.foes.filter(f => !f[3]).map(f => f[2]));
 for (const k of ['cangrejo', 'gaviota', 'brasita', 'rana', 'cucaracho']) {
  assert.ok(kinds.has(k), `especie "${k}" presente`);
 }
 assert.ok(room.foes.filter(f => !f[3]).length >= 18, '>=18 enemigos authored');
});

// ── 3. Frita V614: corredores de géiser limpios ───────────────────────────────
test('Frita V614: no hay plataformas obstruyendo los pasillos de lanzamiento', () => {
 const room = WORLD1_ROOMS['w1-frita'];
 const vents = room.seal.stations.filter(s => s.kind === 'geyser');
 for (const vent of vents) {
  if (!vent.prize) continue;
  for (const [px, py, pw] of room.plats) {
   if (py >= FLOOR || py <= FLOOR - 590) continue;
   const corridorOverlap = px < Math.max(vent.x, vent.prize.x) + 94 &&
                           px + pw > Math.min(vent.x, vent.prize.x) - 94;
   assert.ok(!corridorOverlap,
    `Plataforma [${px},${py},${pw}] bloquea pasillo géiser id=${vent.id}`);
  }
 }
});

// ── 4. Frita Boss HUD: no lanza excepción, 3 especies de señal ───────────────
test('Frita Boss: drawFritaBossSignals no lanza excepción en todas las fases', () => {
 const maker = (x, y) => ({ x, y, invuln: 0, stun: 0 });
 const e = createFritaBoss(maker, () => .5, {
  roomId: 'w1-frita', x: 8750, chapter: 'frita',
  encounterId: NEXT_CHAPTERS.frita.bossId, arena: NEXT_ARENA
 });
 const g = { player: { x: 8400, y: 1050, w: 40, h: 84, evo: 4 }, cam, viewW: 1200, projectiles: [] };

 for (const phase of ['intro', 'rest', 'warn', 'attack']) {
  e._crispyKing.phase = phase;
  e._crispyKing.attack = 0;
  assert.doesNotThrow(() => drawFritaBossSignals(ctx, e, cam, 42, false), `fase ${phase}`);
 }
 assert.doesNotThrow(() => drawFritaBoss(ctx, e, cam, 42, false), 'drawFritaBoss completo');
});

// ── 5. Pizza V615: ruta 14400px, 3 abismos, 25 orbes, piso v2 ────────────────
test('Pizza V615: ruta 14400px, 3 abismos marinara, 25 orbes, piso v2 incluido', () => {
 const room = WORLD1_ROOMS['w1-pizza'];
 assert.equal(room.width, 14400, 'ruta 14400px');
 assert.ok(room.plats.some(p => p[0] === 9600 && p[2] === 4800 && p[1] === FLOOR), 'piso v2 [9600,1134,4800] presente');
 assert.equal(room.hazards?.filter(h => h.type === 'death').length, 3, '3 abismos de salsa');
 assert.equal(room.orbs.length, 25, '25 orbes de albahaca');
});

// ── 6. Pizza V615: 5 especies de fauna presentes ─────────────────────────────
test('Pizza V615: foes cubren las 5 especies culinarias', () => {
 const room = WORLD1_ROOMS['w1-pizza'];
 const kinds = new Set(room.foes.filter(f => !f[3]).map(f => f[2]));
 for (const k of ['pez', 'cangrejo', 'anguila', 'medusa', 'gaviota']) {
  assert.ok(kinds.has(k), `especie "${k}" presente`);
 }
 assert.ok(room.foes.filter(f => !f[3]).length >= 18, '>=18 enemigos authored');
});

// ── 7. Pizza Boss HUD: no lanza excepción ────────────────────────────────────
test('Pizza Boss: drawPizzaBossSignals no lanza excepción en todas las fases', () => {
 const maker = (x, y) => ({ x, y, invuln: 0, stun: 0 });
 const e = createPizzaBoss(maker, () => .5, {
  roomId: 'w1-pizza', x: 8750, chapter: 'pizza',
  encounterId: NEXT_CHAPTERS.pizza.bossId, arena: NEXT_ARENA
 });

 for (const phase of ['intro', 'rest', 'warn', 'attack']) {
  e._magmaChef.phase = phase;
  e._magmaChef.attack = 0;
  assert.doesNotThrow(() => drawPizzaBossSignals(ctx, e, cam, 42, false), `fase ${phase}`);
 }
 assert.doesNotThrow(() => drawPizzaBoss(ctx, e, cam, 42, false), 'drawPizzaBoss completo');
});

// ── 8. Frita art: las 5 especies dibujan sin excepción ───────────────────────
test('Frita chapter art: todas las 5 especies dibujan sin excepción', () => {
 for (const kind of ['cangrejo', 'gaviota', 'brasita', 'rana', 'cucaracho']) {
  const e = { x: 100, y: 1094, w: 40, h: 40, roomId: 'w1-frita', kind, facing: 1, spawnIndex: 0, invuln: 0, stun: 0, vy: 0 };
  assert.doesNotThrow(() => drawFritaCreature(ctx, e, cam, 10, false), `kind=${kind}`);
 }
});

// ── 9. Pizza chapter art: las 5 especies dibujan sin excepción ───────────────
test('Pizza chapter art: todas las 5 especies dibujan sin excepción', () => {
 for (const kind of ['pez', 'cangrejo', 'anguila', 'medusa', 'gaviota']) {
  const e = { x: 100, y: 1094, w: 40, h: 40, roomId: 'w1-pizza', kind, facing: 1, spawnIndex: 0, invuln: 0, stun: 0, vy: 0 };
  assert.doesNotThrow(() => drawPizzaCreature(ctx, e, cam, 10, false), `kind=${kind}`);
 }
});

// ── 10. Pizza V615 art: oven / guest / atmosphere sin excepción ──────────────
test('Pizza V615 art: oven, guest y atmosphere dibujan sin excepción', () => {
 const oven = { x: 1920, y: 1134, kind: 'oven', id: 0 };
 assert.doesNotThrow(() => drawPizzaOvenV615(ctx, oven, cam, false, 20, false), 'oven base');
 assert.doesNotThrow(() => drawPizzaOvenV615(ctx, oven, cam, true, 20, false), 'oven relay');

 for (const id of [1, 2, 3]) {
  const guest = { x: 4000 + id * 1600, y: 1134, kind: 'guest', id };
  assert.doesNotThrow(() => drawPizzaGuestV615(ctx, guest, cam, false, 20, false), `guest id=${id} espera`);
  assert.doesNotThrow(() => drawPizzaGuestV615(ctx, guest, cam, true, 20, false), `guest id=${id} servido`);
 }

 const g = { roomDef: { hero: 'pizza' }, viewW: 1200, viewH: 700 };
 assert.doesNotThrow(() => drawPizzaAtmosphere(ctx, g, cam, 10, false), 'atmosphere');
});

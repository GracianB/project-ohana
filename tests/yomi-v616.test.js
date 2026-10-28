// yomi-v616.test.js — Validación integral del capítulo final de Mundo 1: Observatorio Astral de Yomi (V616).
import test from 'node:test';
import assert from 'node:assert/strict';
import { WORLD1_ROOMS } from '../systems/world1-rooms.js';
import { authorYomiEncounters } from '../systems/yomi-encounters-v616.js';
import { drawYomiBoss, drawYomiBossSignals, createYomiBoss, updateYomiBoss } from '../systems/yomi-boss.js';
import { drawYomiCreature, drawYomiTerminalV616, drawYomiAtmosphere } from '../systems/yomi-chapter-art-v616.js';
import { NEXT_CHAPTERS, NEXT_ARENA } from '../systems/chapters-lunar-prism-embers.js';

// ── Mock de Canvas liviano y a prueba de errores ─────────────────────────────
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

// ── 1. Geometría y Contratos de Expedición ───────────────────────────────────
test('Yomi V616: ruta 14400px, 3 abismos de vacío astral, 25 orbes y piso v2', () => {
 const room = WORLD1_ROOMS['w1-yomi'];
 assert.equal(room.width, 14400, 'ruta 14400px');
 assert.ok(room.plats.some(p => p[0] === 9600 && p[2] === 4800 && p[1] === FLOOR), 'piso expedición v2');
 assert.equal(room.hazards?.filter(h => h.type === 'death').length, 3, '3 abismos de vacío astral');
 assert.equal(room.orbs.length, 25, '25 orbes de constelación cuántica');
});

// ── 2. Nodos Astrales de Sincronía ───────────────────────────────────────────
test('Yomi V616: cuatro terminales cuánticos con fases crecientes', () => {
 const room = WORLD1_ROOMS['w1-yomi'];
 const stations = room.seal.stations;
 assert.equal(stations.length, 4, '4 estaciones');
 assert.ok(stations.every(s => s.kind === 'node'), 'todas son de tipo node');
 assert.deepEqual(stations.map(s => s.id), [0, 1, 2, 3]);
 assert.deepEqual(stations.map(s => s.x), [2400, 4000, 5600, 7200]);
});

// ── 3. Fauna y Cast: 5 Especies Cuánticas ────────────────────────────────────
test('Yomi V616: 5 especies de fauna astral presentes y >= 18 enemigos authored', () => {
 const room = WORLD1_ROOMS['w1-yomi'];
 const kinds = new Set(room.foes.filter(f => !f[3]).map(f => f[2]));
 for (const k of ['ufo', 'phosquito', 'brasita', 'medusa', 'murcielago']) {
  assert.ok(kinds.has(k), `especie "${k}" presente`);
 }
 assert.ok(room.foes.filter(f => !f[3]).length >= 18, '>=18 enemigos authored');
});

// ── 4. Boss Custodio del Observatorio: Señales Holográficas HUD ──────────────
test('Yomi V616 Boss: drawYomiBossSignals no lanza excepción en todas las fases', () => {
 const maker = (x, y) => ({ x, y, invuln: 0, stun: 0 });
 const e = createYomiBoss(maker, () => .5, {
  roomId: 'w1-yomi', x: 8750, chapter: 'yomi',
  encounterId: NEXT_CHAPTERS.yomi.bossId, arena: NEXT_ARENA
 });

 for (const phase of ['intro', 'rest', 'warn', 'attack']) {
  e._spiritGuide.phase = phase;
  e._spiritGuide.attack = 0;
  assert.doesNotThrow(() => drawYomiBossSignals(ctx, e, cam, 42, false), `fase ${phase}`);
 }
 assert.doesNotThrow(() => drawYomiBoss(ctx, e, cam, 42, false), 'drawYomiBoss completo');
});

// ── 5. Fauna Art: las 5 especies dibujan sin excepciones ─────────────────────
test('Yomi V616 art: todas las 5 especies de fauna dibujan sin excepción', () => {
 for (const kind of ['ufo', 'phosquito', 'brasita', 'medusa', 'murcielago']) {
  const e = { x: 100, y: 1094, w: 40, h: 40, roomId: 'w1-yomi', kind, facing: 1, spawnIndex: 0, invuln: 0, stun: 0, vy: 0 };
  assert.doesNotThrow(() => drawYomiCreature(ctx, e, cam, 10, false), `kind=${kind}`);
 }
});

// ── 6. Terminal y Atmósfera V616 dibujan sin excepciones ────────────────────
test('Yomi V616 art: terminal cuántico en todos sus estados y atmósfera', () => {
 const g = { world1: { tick: 100, yomiWindows: {} }, roomDef: { hero: 'yomi' }, viewW: 1200, viewH: 700 };

 // Terminal en estado normal, advertencia y completado
 for (const id of [0, 1, 2, 3]) {
  const s = { id, x: 2400 + id * 1600, y: 1134, kind: 'node', phase: id * 23 };
  assert.doesNotThrow(() => drawYomiTerminalV616(ctx, g, s, cam, false, 20, false), `nodo id=${id} activo`);
  assert.doesNotThrow(() => drawYomiTerminalV616(ctx, g, s, cam, true, 20, false), `nodo id=${id} completado`);
 }

 assert.doesNotThrow(() => drawYomiAtmosphere(ctx, g, cam, 10, false), 'atmósfera de constelaciones');
});

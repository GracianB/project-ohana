import test from 'node:test';
import assert from 'node:assert/strict';

// Dino (Fase 6)
import {createDinoRoom} from '../systems/dino-room.js';
import {enterDinoTrail,dinoTrailSnapshot,DINO_BEACONS,DINO_FOSSILS,DINO_GEYSERS} from '../systems/dino-trail.js';
import {createDinoBoss,updateDinoBoss,DINO_BOSS_ID,DINO_BOSS} from '../systems/dino-boss.js';
import {drawDinoCraterBackdrop} from '../worlds/dino-crater.js';

// Frita (Fase 7)
import {createFritaRoom} from '../systems/frita-room.js';
import {enterFritaTrail,fritaTrailSnapshot,FRITA_BEACONS,FRITA_CRISPS,FRITA_SPRINGS} from '../systems/frita-trail.js';
import {createFritaBoss,updateFritaBoss,FRITA_BOSS_ID,FRITA_BOSS} from '../systems/frita-boss.js';
import {drawFritaMarketBackdrop} from '../worlds/frita-market.js';

// Pizza (Fase 8)
import {createPizzaRoom} from '../systems/pizza-room.js';
import {enterPizzaTrail,pizzaTrailSnapshot,PIZZA_BEACONS,PIZZA_GEMS,PIZZA_LAUNCHERS} from '../systems/pizza-trail.js';
import {createPizzaBoss,updatePizzaBoss,PIZZA_BOSS_ID,PIZZA_BOSS} from '../systems/pizza-boss.js';
import {drawPizzaOvensBackdrop} from '../worlds/pizza-ovens.js';

// Yomi (Fase 9)
import {createYomiRoom} from '../systems/yomi-room.js';
import {enterYomiTrail,yomiTrailSnapshot,YOMI_BEACONS,YOMI_SOULS,YOMI_DRAFTS} from '../systems/yomi-trail.js';
import {createYomiBoss,updateYomiBoss,YOMI_BOSS_ID,YOMI_BOSS} from '../systems/yomi-boss.js';
import {drawYomiObservatoryBackdrop} from '../worlds/yomi-observatory.js';

// Cuerno (Fase 10)
import {createCuernoRoom} from '../systems/cuerno-room.js';
import {enterCuernoTrail,cuernoTrailSnapshot,CUERNO_BEACONS,CUERNO_SHARDS,CUERNO_CRYSTALS} from '../systems/cuerno-trail.js';
import {createCuernoBoss,updateCuernoBoss,CUERNO_BOSS_ID,CUERNO_BOSS} from '../systems/cuerno-boss.js';
import {drawCuernoForestBackdrop} from '../worlds/cuerno-forest.js';

import {HERO_COLLECTIONS} from '../systems/hero-collections.js';

// ─── Shared dummy ctx ─────────────────────────────────────────────────────────
function makeDummyCtx() {
  let commands = 0;
  return {
    _commands: () => commands,
    save: () => {}, restore: () => {},
    beginPath: () => {}, closePath: () => {},
    moveTo: () => { commands++; }, lineTo: () => { commands++; },
    stroke: () => { commands++; }, fill: () => { commands++; },
    arc: () => { commands++; }, fillRect: () => { commands++; },
    strokeRect: () => { commands++; }, quadraticCurveTo: () => { commands++; },
    bezierCurveTo: () => { commands++; },
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
    scale: () => {}, translate: () => {}, rotate: () => {},
    set fillStyle(v) {}, set strokeStyle(v) {}, set lineWidth(v) {},
    set globalAlpha(v) {}, set font(v) {}, set textAlign(v) {},
    fillText: () => { commands++; }, clip: () => {}, rect: () => { commands++; }
  };
}

function makeDummyFoe(x, y, kind, room, idx) {
  return {
    x, y, kind, roomId: room, hp: 100, max: 100, w: 32, h: 32,
    invuln: 0, sleep: 0, dead: false, facing: 1, vx: 0, vy: 0
  };
}

function makeTrailGame(playerId) {
  return {
    roomId: 'hub',
    player: { id: playerId, x: 230, y: 1100, w: 24, h: 30, dead: false },
    personalAdventureSolo: true,
    platforms: [],
    secrets: { hub: [] },
    clearedEncounters: { hub: [] },
    t: 0
  };
}

// ═══════════════════════════════════════════════════════════════
// DINO (Fase 6)
// ═══════════════════════════════════════════════════════════════

test('Dino V1: Room generates 4 sectors, 14 orbs, 10 foes, 2 hazards', () => {
  const base = { id: 'hub', doors: {}, plats: [], foes: [] };
  const r = createDinoRoom(base);
  assert.ok(r.name, 'Room must have a name');
  assert.equal(r.sectors.length, 4, 'Must have 4 sectors');
  assert.equal(r.checkpoints.length, 4, 'Must have 4 checkpoints');
  assert.equal(r.orbs.length, 14, 'Must have 14 orbs');
  assert.equal(r.foes.length, 10, 'Must have 10 foes');
  assert.equal(r.hazards.length, 2, 'Must have 2 hazards');
  assert.equal(r.hazards[0].heroEscape, 'dino', 'Hazard escape must be dino');
  assert.equal(HERO_COLLECTIONS.dino.room, 'hub');
  assert.equal(HERO_COLLECTIONS.dino.bonus, 'GUARDIÁN ANTIGUO');
});

test('Dino V1: Trail system mounts 4 lifts, 3 beacons, 8 fossils', () => {
  const g = makeTrailGame('dino');
  enterDinoTrail(g);
  assert.ok(g.dinoTrail, 'dinoTrail must mount');
  assert.equal(g.dinoTrail.lifts.length, 4, 'Must have 4 lifts');
  assert.equal(DINO_BEACONS.length, 3, 'Must have 3 beacons');
  assert.equal(DINO_FOSSILS.length, 8, 'Must have 8 fossils');
  assert.ok(DINO_GEYSERS.length >= 3, 'Must have geysers');
  const snap = dinoTrailSnapshot(g);
  assert.ok(snap, 'Snapshot must return truthy');
});

test('Dino V1: Coloso de Piedra creates with 480 HP and 3 tiers', () => {
  const boss = createDinoBoss(makeDummyFoe);
  assert.ok(boss._dinoBoss, '_dinoBoss flag must be set');
  assert.equal(boss._encounterSaveId, DINO_BOSS_ID);
  assert.equal(boss.max, 480);
  assert.equal(boss._stoneColossus.tier, 1);

  boss.hp = 200;
  const g = {
    player: { x: 3400, y: 1100, w: 30, h: 40, dead: false },
    cam: { x: 3000, y: 500 }, viewW: 1200, projectiles: []
  };
  updateDinoBoss(boss, g, () => {});
  assert.equal(boss._stoneColossus.tier, 2);

  boss.hp = 80;
  updateDinoBoss(boss, g, () => {});
  assert.equal(boss._stoneColossus.tier, 3);
});

test('Dino V1: Crater backdrop renders procedural vector paths', () => {
  const ctx = makeDummyCtx();
  drawDinoCraterBackdrop(ctx, { x: 500, y: 300 }, 60, 1600, 1000, false);
  assert.ok(ctx._commands() > 20, 'Must draw procedural paths');
});

// ═══════════════════════════════════════════════════════════════
// FRITA (Fase 7)
// ═══════════════════════════════════════════════════════════════

test('Frita V1: Room generates 4 sectors, 14 orbs, 10 foes, 2 hazards', () => {
  const base = { id: 'hub', doors: {}, plats: [], foes: [] };
  const r = createFritaRoom(base);
  assert.ok(r.name, 'Room must have a name');
  assert.equal(r.sectors.length, 4);
  assert.equal(r.checkpoints.length, 4);
  assert.equal(r.orbs.length, 14);
  assert.equal(r.foes.length, 10);
  assert.equal(r.hazards.length, 2);
  assert.equal(r.hazards[0].heroEscape, 'frita');
  assert.equal(HERO_COLLECTIONS.frita.room, 'hub');
  assert.equal(HERO_COLLECTIONS.frita.bonus, 'BANQUETE DORADO');
});

test('Frita V1: Trail system mounts 4 lifts, 3 beacons, 8 crisps', () => {
  const g = makeTrailGame('frita');
  enterFritaTrail(g);
  assert.ok(g.fritaTrail, 'fritaTrail must mount');
  assert.equal(g.fritaTrail.lifts.length, 4);
  assert.equal(FRITA_BEACONS.length, 3);
  assert.equal(FRITA_CRISPS.length, 8);
  assert.ok(FRITA_SPRINGS.length >= 3);
  const snap = fritaTrailSnapshot(g);
  assert.ok(snap);
});

test('Frita V1: Rey Crujiente creates with 480 HP and 3 tiers', () => {
  const boss = createFritaBoss(makeDummyFoe);
  assert.ok(boss._fritaBoss);
  assert.equal(boss._encounterSaveId, FRITA_BOSS_ID);
  assert.equal(boss.max, 480);
  assert.equal(boss._crispyKing.tier, 1);

  boss.hp = 200;
  const g = {
    player: { x: 3400, y: 1100, w: 30, h: 40, dead: false },
    cam: { x: 3000, y: 500 }, viewW: 1200, projectiles: []
  };
  updateFritaBoss(boss, g, () => {});
  assert.equal(boss._crispyKing.tier, 2);

  boss.hp = 80;
  updateFritaBoss(boss, g, () => {});
  assert.equal(boss._crispyKing.tier, 3);
});

test('Frita V1: Market backdrop renders procedural vector paths', () => {
  const ctx = makeDummyCtx();
  drawFritaMarketBackdrop(ctx, { x: 500, y: 300 }, 60, 1600, 1000, false);
  assert.ok(ctx._commands() > 20);
});

// ═══════════════════════════════════════════════════════════════
// PIZZA (Fase 8)
// ═══════════════════════════════════════════════════════════════

test('Pizza V1: Room generates 4 sectors, 14 orbs, 10 foes, 2 hazards', () => {
  const base = { id: 'hub', doors: {}, plats: [], foes: [] };
  const r = createPizzaRoom(base);
  assert.ok(r.name);
  assert.equal(r.sectors.length, 4);
  assert.equal(r.checkpoints.length, 4);
  assert.equal(r.orbs.length, 14);
  assert.equal(r.foes.length, 10);
  assert.equal(r.hazards.length, 2);
  assert.equal(r.hazards[0].heroEscape, 'pizza');
  assert.equal(HERO_COLLECTIONS.pizza.room, 'hub');
  assert.equal(HERO_COLLECTIONS.pizza.bonus, 'HORNO ESTELAR');
});

test('Pizza V1: Trail system mounts 4 lifts, 3 beacons, 8 gems', () => {
  const g = makeTrailGame('pizza');
  enterPizzaTrail(g);
  assert.ok(g.pizzaTrail);
  assert.equal(g.pizzaTrail.lifts.length, 4);
  assert.equal(PIZZA_BEACONS.length, 3);
  assert.equal(PIZZA_GEMS.length, 8);
  assert.ok(PIZZA_LAUNCHERS.length >= 3);
  const snap = pizzaTrailSnapshot(g);
  assert.ok(snap);
});

test('Pizza V1: Chef Magmático creates with 480 HP and 3 tiers', () => {
  const boss = createPizzaBoss(makeDummyFoe);
  assert.ok(boss._pizzaBoss);
  assert.equal(boss._encounterSaveId, PIZZA_BOSS_ID);
  assert.equal(boss.max, 480);
  assert.equal(boss._magmaChef.tier, 1);

  boss.hp = 200;
  const g = {
    player: { x: 3400, y: 1100, w: 30, h: 40, dead: false },
    cam: { x: 3000, y: 500 }, viewW: 1200, projectiles: []
  };
  updatePizzaBoss(boss, g, () => {});
  assert.equal(boss._magmaChef.tier, 2);

  boss.hp = 80;
  updatePizzaBoss(boss, g, () => {});
  assert.equal(boss._magmaChef.tier, 3);
});

test('Pizza V1: Oven backdrop renders procedural vector paths', () => {
  const ctx = makeDummyCtx();
  drawPizzaOvensBackdrop(ctx, { x: 500, y: 300 }, 60, 1600, 1000, false);
  assert.ok(ctx._commands() > 20);
});

// ═══════════════════════════════════════════════════════════════
// YOMI (Fase 9)
// ═══════════════════════════════════════════════════════════════

test('Yomi V1: Room generates 4 sectors, 14 orbs, 10 foes, 2 hazards', () => {
  const base = { id: 'hub', doors: {}, plats: [], foes: [] };
  const r = createYomiRoom(base);
  assert.ok(r.name);
  assert.equal(r.sectors.length, 4);
  assert.equal(r.checkpoints.length, 4);
  assert.equal(r.orbs.length, 14);
  assert.equal(r.foes.length, 10);
  assert.equal(r.hazards.length, 2);
  assert.equal(r.hazards[0].heroEscape, 'yomi');
  assert.equal(HERO_COLLECTIONS.yomi.room, 'hub');
  assert.equal(HERO_COLLECTIONS.yomi.bonus, 'CONSTELACIÓN ETERNA');
});

test('Yomi V1: Trail system mounts 4 lifts, 3 beacons, 8 lanterns', () => {
  const g = makeTrailGame('yomi');
  enterYomiTrail(g);
  assert.ok(g.yomiTrail);
  assert.equal(g.yomiTrail.lifts.length, 4);
  assert.equal(YOMI_BEACONS.length, 3);
  assert.equal(YOMI_SOULS.length, 8);
  assert.ok(YOMI_DRAFTS.length >= 3);
  const snap = yomiTrailSnapshot(g);
  assert.ok(snap);
});

test('Yomi V1: Guía del Más Allá creates with 480 HP and 3 tiers', () => {
  const boss = createYomiBoss(makeDummyFoe);
  assert.ok(boss._yomiBoss);
  assert.equal(boss._encounterSaveId, YOMI_BOSS_ID);
  assert.equal(boss.max, 480);
  assert.equal(boss._spiritGuide.tier, 1);

  boss.hp = 200;
  const g = {
    player: { x: 3400, y: 1100, w: 30, h: 40, dead: false },
    cam: { x: 3000, y: 500 }, viewW: 1200, projectiles: []
  };
  updateYomiBoss(boss, g, () => {});
  assert.equal(boss._spiritGuide.tier, 2);

  boss.hp = 80;
  updateYomiBoss(boss, g, () => {});
  assert.equal(boss._spiritGuide.tier, 3);
});

test('Yomi V1: Observatory backdrop renders procedural vector paths', () => {
  const ctx = makeDummyCtx();
  drawYomiObservatoryBackdrop(ctx, { x: 500, y: 300 }, 60, 1600, 1000, false);
  assert.ok(ctx._commands() > 20);
});

// ═══════════════════════════════════════════════════════════════
// CUERNO (Fase 10)
// ═══════════════════════════════════════════════════════════════

test('Cuerno V1: Room generates 4 sectors, 14 orbs, 10 foes, 2 hazards', () => {
  const base = { id: 'hub', doors: {}, plats: [], foes: [] };
  const r = createCuernoRoom(base);
  assert.ok(r.name);
  assert.equal(r.sectors.length, 4);
  assert.equal(r.checkpoints.length, 4);
  assert.equal(r.orbs.length, 14);
  assert.equal(r.foes.length, 10);
  assert.equal(r.hazards.length, 2);
  assert.equal(r.hazards[0].heroEscape, 'cuerno');
  assert.equal(HERO_COLLECTIONS.cuerno.room, 'hub');
  assert.equal(HERO_COLLECTIONS.cuerno.bonus, 'AURORA VIVA');
});

test('Cuerno V1: Trail system mounts 4 lifts, 3 beacons, 8 prism shards', () => {
  const g = makeTrailGame('cuerno');
  enterCuernoTrail(g);
  assert.ok(g.cuernoTrail);
  assert.equal(g.cuernoTrail.lifts.length, 4);
  assert.equal(CUERNO_BEACONS.length, 3);
  assert.equal(CUERNO_SHARDS.length, 8);
  assert.ok(CUERNO_CRYSTALS.length >= 3);
  const snap = cuernoTrailSnapshot(g);
  assert.ok(snap);
});

test('Cuerno V1: Bestia Prisma creates with 480 HP and 3 tiers', () => {
  const boss = createCuernoBoss(makeDummyFoe);
  assert.ok(boss._cuernoBoss);
  assert.equal(boss._encounterSaveId, CUERNO_BOSS_ID);
  assert.equal(boss.max, 480);
  assert.equal(boss._prismBeast.tier, 1);

  boss.hp = 200;
  const g = {
    player: { x: 3400, y: 1100, w: 30, h: 40, dead: false },
    cam: { x: 3000, y: 500 }, viewW: 1200, projectiles: []
  };
  updateCuernoBoss(boss, g, () => {});
  assert.equal(boss._prismBeast.tier, 2);

  boss.hp = 80;
  updateCuernoBoss(boss, g, () => {});
  assert.equal(boss._prismBeast.tier, 3);
});

test('Cuerno V1: Forest backdrop renders procedural vector paths', () => {
  const ctx = makeDummyCtx();
  drawCuernoForestBackdrop(ctx, { x: 500, y: 300 }, 60, 1600, 1000, false);
  assert.ok(ctx._commands() > 20);
});

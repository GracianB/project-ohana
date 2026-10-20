import test from 'node:test';
import assert from 'node:assert/strict';
import {createDragonRoom} from '../systems/dragon-room.js';
import {enterDragonTrail,updateDragonTrail,dragonTrailSnapshot,DRAGON_BEACONS,DRAGON_EMBERS,DRAGON_UPDRAFTS} from '../systems/dragon-trail.js';
import {createDragonBoss,updateDragonBoss,DRAGON_BOSS_ID,DRAGON_BOSS} from '../systems/dragon-boss.js';
import {HERO_COLLECTIONS} from '../systems/hero-collections.js';
import {ROSTER} from '../characters/roster.js';
import {drawDragonCalderaBackdrop} from '../worlds/dragon-caldera.js';

test('Dragon V1: 5 forms include pure vector Canvas metadata and active roster entry', () => {
  const def = ROSTER.find(r => r.id === 'dragon');
  assert.ok(def, 'Dragón must exist in active roster');
  assert.equal(def.forms.length, 5, 'Must have exactly 5 forms');
  assert.equal(def.forms[0].name, 'Dragoncito');
  assert.equal(def.forms[1].name, 'Dragón');
  assert.equal(def.forms[2].name, 'Dragón Alado');
  assert.equal(def.forms[3].name, 'Dragón Real');
  assert.equal(def.forms[4].name, 'Dragón Celestial');
  assert.equal(def.evoNames[4], 'Dragón Celestial');
  assert.equal(def.passive.id, 'glide');
});

test('Dragon V1: Room generation creates 4 sectors, hazards and correct entities', () => {
  const base = { id: 'hub', doors: {}, plats: [], foes: [] };
  const r = createDragonRoom(base);
  assert.equal(r.name, 'Cordillera de las Brasas');
  assert.equal(r.world, 7);
  assert.equal(r.sectors.length, 4);
  assert.equal(r.checkpoints.length, 4);
  assert.equal(r.orbs.length, 14);
  assert.equal(r.foes.length, 10);
  assert.equal(r.hazards.length, 2);
  assert.equal(r.hazards[0].label, 'MAGMA MORTAL');
  assert.equal(r.hazards[0].heroEscape, 'dragon');
});

test('Dragon V1: Trail system mounts 4 lifts, 3 beacons, 8 embers and updrafts', () => {
  const g = {
    roomId: 'hub',
    player: { id: 'dragon', x: 230, y: 1100, w: 24, h: 30, dead: false },
    personalAdventureSolo: true,
    platforms: [],
    secrets: { hub: [] },
    clearedEncounters: { hub: [] }
  };
  enterDragonTrail(g);
  assert.ok(g.dragonTrail, 'dragonTrail must be mounted');
  assert.equal(g.dragonTrail.lifts.length, 4);
  assert.equal(DRAGON_BEACONS.length, 3);
  assert.equal(DRAGON_EMBERS.length, 8);
  assert.equal(DRAGON_UPDRAFTS.length, 3);

  // Collection bonus is Dragón Celestial in hub room
  assert.equal(HERO_COLLECTIONS.dragon.bonus, 'DRAGÓN CELESTIAL');
  assert.equal(HERO_COLLECTIONS.dragon.room, 'hub');
});

test('Dragon V1: Guardián del Núcleo Ígneo mini boss creates with 480 HP and 3 tiers', () => {
  const dummyMakeFoe = (x, y, kind, room, idx) => ({
    x, y, kind, roomId: room, hp: 100, max: 100, w: 32, h: 32,
    invuln: 0, sleep: 0, dead: false, facing: 1, vx: 0, vy: 0
  });
  const boss = createDragonBoss(dummyMakeFoe);
  assert.ok(boss._dragonBoss);
  assert.equal(boss._encounterSaveId, DRAGON_BOSS_ID);
  assert.equal(boss.hp, DRAGON_BOSS.hp);
  assert.equal(boss.max, 480);
  assert.equal(boss._igneousDragon.tier, 1);

  // Tier updates with HP reduction
  boss.hp = 200;
  const g = {
    player: { x: 3300, y: 1100, w: 30, h: 40, dead: false },
    cam: { x: 3000, y: 500 },
    viewW: 1200,
    projectiles: []
  };
  updateDragonBoss(boss, g, () => {});
  assert.equal(boss._igneousDragon.tier, 2);

  boss.hp = 80;
  updateDragonBoss(boss, g, () => {});
  assert.equal(boss._igneousDragon.tier, 3);
});

test('Dragon V1: Procedural vector canvas backdrop renders without throwing', () => {
  let commands = 0;
  const dummyCtx = {
    save: () => {},
    restore: () => {},
    beginPath: () => {},
    closePath: () => {},
    moveTo: () => { commands++; },
    lineTo: () => { commands++; },
    stroke: () => { commands++; },
    fill: () => { commands++; },
    arc: () => { commands++; },
    fillRect: () => { commands++; },
    strokeRect: () => { commands++; },
    quadraticCurveTo: () => { commands++; },
    bezierCurveTo: () => { commands++; },
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
    scale: () => {},
    translate: () => {},
    rotate: () => {},
    set fillStyle(v) {},
    set strokeStyle(v) {},
    set lineWidth(v) {},
    set globalAlpha(v) {},
    set font(v) {},
    set textAlign(v) {},
    fillText: () => { commands++; }
  };
  drawDragonCalderaBackdrop(dummyCtx, { x: 500, y: 300 }, 60, 1600, 1000, false);
  assert.ok(commands > 20, 'Backdrop must draw procedural vector paths');
});

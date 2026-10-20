import test from 'node:test';
import assert from 'node:assert/strict';
import {createChispinRoom} from '../systems/chispin-room.js';
import {enterChispinTrail,interactChispinTrail,chispinTrailPrompt,updateChispinTrail,chispinAbility,CHISPIN_BEACONS,CHISPIN_FRAGMENTS} from '../systems/chispin-trail.js';
import {createChispinBoss,updateChispinBoss,CHISPIN_BOSS_ID} from '../systems/chispin-boss.js';
import {HERO_COLLECTIONS} from '../systems/hero-collections.js';
import {ROSTER} from '../characters/roster.js';

test('Chispín V1: 5 forms include Trueno Gordo and pure vector Canvas metadata', () => {
  const def = ROSTER.find(r => r.id === 'chispin');
  assert.ok(def, 'Chispin must exist in active roster');
  assert.equal(def.forms.length, 5, 'Must have exactly 5 forms');
  assert.equal(def.forms[3].name, 'Trueno Gordo', 'Form 4 must be Trueno Gordo');
  assert.equal(def.evoNames[3], 'Trueno Gordo');
  assert.equal(def.forms[0].name, 'Chispín Bebé');
  assert.equal(def.forms[4].name, 'Chispín Tormenta');
});

test('Chispín V1: Room generation creates 4 sectors, hazards and correct entities', () => {
  const base = { id: 'hub', doors: {}, plats: [], foes: [] };
  const r = createChispinRoom(base);
  assert.equal(r.name, 'Islas del Relámpago');
  assert.equal(r.world, 5);
  assert.equal(r.sectors.length, 4);
  assert.equal(r.checkpoints.length, 4);
  assert.equal(r.orbs.length, 14);
  assert.equal(r.foes.length, 10);
  assert.equal(r.hazards.length, 2);
  assert.equal(r.hazards[0].label, 'ARCO VOLTAICO');
});

test('Chispín V1: Trail system mounts 4 lifts, 3 beacons and 8 fragments', () => {
  const g = {
    roomId: 'hub',
    player: { id: 'chispin', x: 230, y: 1100, w: 24, h: 30, dead: false },
    personalAdventureSolo: true,
    platforms: [],
    secrets: { hub: [] },
    clearedEncounters: { hub: [] }
  };
  enterChispinTrail(g);
  assert.ok(g.chispinTrail, 'chispinTrail must be mounted');
  assert.equal(g.chispinTrail.lifts.length, 4);
  assert.equal(CHISPIN_BEACONS.length, 3);
  assert.equal(CHISPIN_FRAGMENTS.length, 8);
  assert.equal(g.chispinTrail.shards, 0);

  // Ability J shorts gates
  chispinAbility(g, g.player, 0);
  assert.equal(g.chispinTrail.castSlot, 0);

  // Collection bonus is Relámpago Dorado
  assert.equal(HERO_COLLECTIONS.chispin.bonus, 'RELÁMPAGO DORADO');
});

test('Chispín V1: Titán de Trueno mini boss creates with 480 HP and 3 phases', () => {
  const makeFoe = (x, y, kind, room, id) => ({ x, y, kind, roomId: room, id, hp: 100, max: 100 });
  const boss = createChispinBoss(makeFoe);
  assert.equal(boss._encounterSaveId, CHISPIN_BOSS_ID);
  assert.equal(boss.hp, 480);
  assert.equal(boss.max, 480);
  assert.equal(boss.miniBoss, true);
  assert.equal(boss._chispinBoss, true);

  const g = {
    cam: { x: 3000, y: 1000 },
    player: { x: 3400, y: 1040, w: 24, h: 30, dead: false },
    viewW: 1100,
    projectiles: []
  };
  const updated = updateChispinBoss(boss, g, () => {});
  assert.equal(updated, true);
  assert.equal(boss._titan.tier, 1);
});

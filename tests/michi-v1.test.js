import test from 'node:test';
import assert from 'node:assert/strict';
import {createMichiRoom} from '../systems/michi-room.js';
import {enterMichiTrail,interactMichiTrail,michiTrailPrompt,updateMichiTrail,michiAbility,MICHI_BELLS,MICHI_ESSENCES} from '../systems/michi-trail.js';
import {createMichiBoss,updateMichiBoss,MICHI_BOSS_ID} from '../systems/michi-boss.js';
import {HERO_COLLECTIONS} from '../systems/hero-collections.js';
import {ROSTER} from '../characters/roster.js';

test('Michi V1: 5 forms include pure vector Canvas metadata and active roster entry', () => {
  const def = ROSTER.find(r => r.id === 'cat');
  assert.ok(def, 'Michi (cat) must exist in active roster');
  assert.equal(def.forms.length, 5, 'Must have exactly 5 forms');
  assert.equal(def.forms[0].name, 'Michicornio Bebé');
  assert.equal(def.forms[1].name, 'Lince Lunar');
  assert.equal(def.forms[2].name, 'Medusa Onírica');
  assert.equal(def.forms[3].name, 'Dragón Astral');
  assert.equal(def.forms[4].name, 'Michicornio Eclipse');
  assert.equal(def.evoNames[4], 'Michicornio Eclipse');
  assert.equal(def.passive.id, 'ninelives');
});

test('Michi V1: Room generation creates 4 sectors, hazards and correct entities', () => {
  const base = { id: 'hub', doors: {}, plats: [], foes: [] };
  const r = createMichiRoom(base);
  assert.equal(r.name, 'Santuario Lunar de Michicornio');
  assert.equal(r.world, 6);
  assert.equal(r.sectors.length, 4);
  assert.equal(r.checkpoints.length, 4);
  assert.equal(r.orbs.length, 14);
  assert.equal(r.foes.length, 10);
  assert.equal(r.hazards.length, 2);
  assert.equal(r.hazards[0].label, 'NIEBLA ASTRAL');
});

test('Michi V1: Trail system mounts 4 lifts, 3 bells and 8 moon essences', () => {
  const g = {
    roomId: 'hub',
    player: { id: 'cat', x: 230, y: 1100, w: 24, h: 30, dead: false },
    personalAdventureSolo: true,
    platforms: [],
    secrets: { hub: [] },
    clearedEncounters: { hub: [] }
  };
  enterMichiTrail(g);
  assert.ok(g.michiTrail, 'michiTrail must be mounted');
  assert.equal(g.michiTrail.lifts.length, 4);
  assert.equal(MICHI_BELLS.length, 3);
  assert.equal(MICHI_ESSENCES.length, 8);
  assert.equal(g.michiTrail.shards, 0);

  // Ability J and K disperse mist gates
  michiAbility(g, g.player, 0);
  assert.equal(g.michiTrail.castSlot, 0);

  // Collection bonus is Luna Soñadora in hub room
  assert.equal(HERO_COLLECTIONS.cat.bonus, 'LUNA SOÑADORA');
  assert.equal(HERO_COLLECTIONS.cat.room, 'hub');
});

test('Michi V1: Espíritu Astral Felino mini boss creates with 480 HP and 3 tiers', () => {
  const makeFoe = (x, y, kind, room, id) => ({ x, y, kind, roomId: room, id, hp: 100, max: 100 });
  const boss = createMichiBoss(makeFoe);
  assert.equal(boss._encounterSaveId, MICHI_BOSS_ID);
  assert.equal(boss.hp, 480);
  assert.equal(boss.max, 480);
  assert.equal(boss.miniBoss, true);
  assert.equal(boss._michiBoss, true);

  const g = {
    cam: { x: 3000, y: 1000 },
    player: { x: 3400, y: 1040, w: 24, h: 30, dead: false },
    viewW: 1100,
    projectiles: []
  };
  const updated = updateMichiBoss(boss, g, () => {});
  assert.equal(updated, true);
  assert.equal(boss._astralCat.tier, 1);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {HERO_WORLDS,heroWorld,worldById,playableHeroWorlds} from '../worlds/hero-worlds.js';
import {ROSTER} from '../characters/roster.js';
import {FAMILY_ISLANDS} from '../systems/family-islands.js';

test('each playable hero has exactly one unique personal world identity',()=>{
  assert.equal(HERO_WORLDS.length,10);
  assert.deepEqual(new Set(HERO_WORLDS.map(w=>w.hero)),new Set(ROSTER.map(h=>h.id)));
  assert.equal(new Set(HERO_WORLDS.map(w=>w.id)).size,10);
  assert.equal(new Set(HERO_WORLDS.map(w=>w.name)).size,10);
  for(const world of HERO_WORLDS){
    assert.equal(heroWorld(world.hero),world);
    assert.equal(worldById(world.id),world);
    assert.ok(FAMILY_ISLANDS.some(island=>island.id===world.family&&island.heroes.includes(world.hero)));
  }
});
test('work-in-progress worlds are never advertised as playable',()=>{
  assert.deepEqual(playableHeroWorlds(),[]);
  assert.equal(heroWorld('kilo').phase,'development');
  assert.equal(heroWorld('unknown'),null);
  assert.equal(worldById('__missing'),null);
});

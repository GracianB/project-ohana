import test from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER} from '../characters/roster.js';
import {WORLD1_ORDER} from '../systems/world1-rooms.js';
import {FINAL_PORTALS, FINAL_HEART, finalMirrorCharge} from '../systems/final-portal-mirrors.js';

test('V618: every World 1 hero is reflected exactly once by the canonical roster', () => {
  assert.equal(FINAL_PORTALS.length, 10);
  assert.deepEqual(FINAL_PORTALS.map(portal => portal.hero), WORLD1_ORDER);
  assert.deepEqual(new Set(FINAL_PORTALS.map(portal => portal.hero)), new Set(ROSTER.map(hero => hero.id)));
  for (const portal of FINAL_PORTALS) {
    assert.ok(portal.rx > 0 && portal.ry > 0);
    assert.ok(Number.isFinite(portal.x) && Number.isFinite(portal.y));
  }
  assert.ok(FINAL_HEART.x > FINAL_PORTALS.at(-1).x, 'the heart follows the procession');
});

test('V618: heart charge grows as genuine mirror positions are reached and never modifies player state', () => {
  const hero = Object.freeze({x: 0, w: 36, y: 1094, h: 40, xp: 100});
  assert.equal(finalMirrorCharge(FINAL_PORTALS, null), 0);
  assert.equal(finalMirrorCharge(FINAL_PORTALS, hero), 0);
  const values = [500,900,1460,2580,3700,4820,5940,6500]
    .map(x => finalMirrorCharge(FINAL_PORTALS, {x,w:36}));
  assert.ok(values.every((value,i) => value >= 0 && value <= 1 && (!i || value >= values[i-1])));
  assert.ok(values[1] > 0 && values[2] > values[1]);
  assert.equal(values.at(-1), 1);
  assert.equal(hero.xp, 100, 'the visualization cannot award fictional XP');
});

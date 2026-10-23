import test from 'node:test';
import assert from 'node:assert/strict';
import { WORLD1_ROOMS } from '../systems/world1-rooms.js';
import { PIZZA_TICKS } from '../systems/world1-play.js';
import { ROSTER } from '../characters/roster.js';

// Regression: the last pizza customer must be reachable with the real
// first-form hero movement speed. A perfectly straight 25-second run left
// nearly no budget for acceleration, obstacles, enemy pressure or braking.
test('Pizza final guest has a fair physical walking-time budget', () => {
  const room = WORLD1_ROOMS['w1-pizza'];
  const stations = room.seal.stations;
  const oven = stations.find(s => s.kind === 'oven');
  const guests = stations.filter(s => s.kind === 'guest').sort((a,b) => a.x - b.x);
  const kilo = ROSTER.find(hero => hero.id === 'kilo');
  assert.ok(oven && kilo, 'physical oven and base hero must exist');
  assert.deepEqual(guests.map(s => s.id), [1, 2, 3]);
  const firstFormSpeed = kilo.forms[0].speed;
  assert.ok(firstFormSpeed > 0);
  const travelTicks = Math.ceil((guests[2].x - oven.x) / firstFormSpeed);
  assert.ok(PIZZA_TICKS >= Math.ceil(travelTicks * 1.25),
    'Final oven-to-guest trip needs >=25% margin at normal walking speed: '
    + JSON.stringify({ travelTicks, timer: PIZZA_TICKS, speed: firstFormSpeed }));
  assert.ok(PIZZA_TICKS <= 45 * 60, 'timed delivery should still be a challenge');
});

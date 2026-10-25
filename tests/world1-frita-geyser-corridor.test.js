import assert from 'node:assert/strict';
import { test } from 'node:test';
import { WORLD1_FLOOR, WORLD1_ROOMS } from '../systems/world1-rooms.js';

test('Frita keeps all three geyser launch corridors clear of overhead platforms', () => {
  const room = WORLD1_ROOMS['w1-frita'];
  const vents = room.seal.stations.filter(st => st.kind === 'geyser');
  assert.equal(vents.length, 3);
  for (const vent of vents) {
    assert.notEqual(vent.prize.x,vent.x,'the route requires lateral steering');
    assert.ok(vent.force*vent.force>=WORLD1_FLOOR-vent.prize.y,'launch can reach prize height with gravity .5');
    for (const [x,y,w] of room.plats.slice(1)) {
      const corridorOverlap = x < Math.max(vent.x,vent.prize.x) + 94 && x + w > Math.min(vent.x,vent.prize.x) - 94;
      const overhead = y > WORLD1_FLOOR - 590 && y < WORLD1_FLOOR;
      assert.ok(!(corridorOverlap && overhead), 'Blocking platform in geyser '+vent.id+' corridor at y='+y);
    }
  }
});

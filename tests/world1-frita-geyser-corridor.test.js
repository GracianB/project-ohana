import assert from 'node:assert/strict';
import { test } from 'node:test';
import { WORLD1_FLOOR, WORLD1_ROOMS } from '../systems/world1-rooms.js';

test('Frita keeps all three geyser launch corridors clear of overhead platforms', () => {
  const room = WORLD1_ROOMS['w1-frita'];
  const vents = room.seal.stations.filter(st => st.kind === 'geyser');
  assert.equal(vents.length, 3);
  for (const vent of vents) {
    assert.equal(vent.prize.x, vent.x);
    assert.equal(vent.prize.y, WORLD1_FLOOR - 470);
    for (const [x,y,w] of room.plats.slice(1)) {
      const corridorOverlap = x < vent.x + 94 && x + w > vent.x - 94;
      const overhead = y > WORLD1_FLOOR - 590 && y < WORLD1_FLOOR;
      assert.ok(!(corridorOverlap && overhead), 'Blocking platform in geyser '+vent.id+' corridor at y='+y);
    }
  }
});

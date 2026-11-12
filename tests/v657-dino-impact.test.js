import test from 'node:test';
import assert from 'node:assert/strict';
import { dinoChapterAbility, updateDinoDive } from '../systems/dino-chapter.js';

const makeGame = () => {
 const player = { id: 'dino', x: 100, y: 100, w: 40, h: 60, grounded: false, vy: 0, vx: 8, evo: 0 };
 const stations = [
  { id: 0, x: 120, y: 160, done: false },
  { id: 1, x: 120, y: 160, done: true },
  { id: 2, x: 600, y: 160, done: false }
 ];
 return { player, roomId: 'w1-dino', roomDef: { dinoChapter: true },
  world1: { tick: 12, stations, wasGrounded: false },
  enemies: [], nums: { add() {} }, fx: { emit() {} } };
};

test('V657 grounded Dino impact cues only nearby dormant fossil terrain without granting progress', () => {
 const g = makeGame();
 dinoChapterAbility(g, g.player, 1);
 assert.ok(g.world1.dinoDiveArmed);
 g.player.grounded = true;
 updateDinoDive(g);
 assert.equal(g.world1.dinoQuakes, 1);
 assert.equal(g.world1.stations[0].quakeCueUntil, 42);
 assert.equal(g.world1.stations[1].quakeCueUntil, undefined);
 assert.equal(g.world1.stations[2].quakeCueUntil, undefined);
 assert.equal(g.world1.stations[0].done, false);
 assert.equal(g.world1.dinoDiveArmed, null);
 updateDinoDive(g);
 assert.equal(g.world1.dinoQuakes, 1, 'landing is consumed exactly once');
});

test('V657 an interrupted dive never activates terrain feedback', () => {
 const g = makeGame();
 dinoChapterAbility(g, g.player, 1);
 g.player.dead = true;
 updateDinoDive(g);
 assert.equal(g.world1.dinoDiveArmed, null);
 assert.equal(g.world1.stations[0].quakeCueUntil, undefined);
 assert.equal(g.world1.dinoQuakes, undefined);
});

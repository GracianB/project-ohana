import test from 'node:test';
import assert from 'node:assert/strict';
import { WORLD1_ROOMS } from '../systems/world1-rooms.js';
import { enterWorld1, updateWorld1, world1CanLeave, awardSeal } from '../systems/world1-play.js';

function createStitchoRun() {
  const room = WORLD1_ROOMS['w1-stitcho'];
  let saved = 0;
  const beats = [];
  const game = {
    roomId: room.id,
    roomDef: room,
    world1Visited: {},
    world1Seals: [],
    player: { x: 0, y: 0, w: 28, h: 40, vx: 0, vy: 0, grounded: true, maxHealth: 100, health: 75, xp: 0 },
    nums: { add() {} },
    fx: { emit() {} },
    onWorld1Beat(kind, hero) { beats.push([kind, hero]); },
    save() { saved++; }
  };
  enterWorld1(game);
  const standNear = (x, y) => {
    const p = game.player;
    p.x = x - p.w / 2;
    p.y = y - p.h / 2;
    p.vx = 0;
    p.vy = 0;
    p.grounded = true;
  };
  return { game, room, beats, standNear, get saved() { return saved; } };
}

test('World 1 Stitcho: first repair piece uses numeric zero and can be delivered', () => {
  const run = createStitchoRun();
  const { game, standNear } = run;
  const part = game.world1.stations[0];
  assert.equal(part.id, 0, 'first piece must retain its canonical ID');
  assert.equal(world1CanLeave(game, 'right'), false, 'seal initially locks the exit');

  standNear(part.x, part.y - 30);
  updateWorld1(game);
  assert.equal(game.world1.carry, 0, 'piece 0 must be picked up');

  // Staying at the pickup point must not discard or re-pick the held piece.
  updateWorld1(game);
  assert.equal(game.world1.carry, 0);
  assert.equal(part.done, false);

  standNear(part.target.x, part.target.y - 30);
  updateWorld1(game);
  assert.equal(part.done, true, 'piece 0 must reach its own workshop');
  assert.equal(game.world1.carry, null, 'hands free after delivery');
  assert.equal(game.world1Snapshot?.sealed ?? game.world1.sealed, false);
});

test('World 1 Stitcho: all three deliveries awaken exactly one seal and unlock east', () => {
  const run = createStitchoRun();
  const { game, standNear } = run;
  assert.equal(game.world1.stations.length, 3);
  for (const part of game.world1.stations) {
    standNear(part.x, part.y - 30);
    updateWorld1(game);
    assert.equal(game.world1.carry, part.id, 'must carry part ' + part.id);

    standNear(part.target.x, part.target.y - 30);
    updateWorld1(game);
    assert.equal(part.done, true, 'must deliver part ' + part.id);
    assert.equal(game.world1.carry, null);
  }

  assert.equal(game.world1.sealed, true);
  assert.deepEqual(game.world1Seals, ['stitcho']);
  assert.equal(world1CanLeave(game, 'right'), true, 'east opens after all repairs');
  assert.equal(game.player.health, 100, 'seal reward heals but cannot overfill');
  assert.equal(game.player.xp, 3);
  assert.equal(run.saved, 3, 'each delivered part must be saved once');
  assert.equal(run.beats.filter(([kind]) => kind === 'seal').length, 1);
  assert.equal(awardSeal(game), false, 'the reward cannot be claimed twice');
  assert.equal(run.saved, 3);
});

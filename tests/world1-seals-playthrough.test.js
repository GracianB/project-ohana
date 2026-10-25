import {yomiNodeState} from '../systems/frita-yomi-chapters.js';
import {nextChapterAbility,NEXT_CHAPTERS} from '../systems/chapters-lunar-prism-embers.js';
// Mundo 1: regression tests run the production seal state machine in all ten rooms.
// The tests validate puzzle actions and state, not a simulated browser playthrough.
import test from "node:test";
import assert from "node:assert/strict";
import { WORLD1_ORDER, WORLD1_ROOMS, WORLD1_FLOOR, WORLD1_SEALS, world1DoorOpen, world1SealsComplete } from "../systems/world1-rooms.js";
import { enterWorld1, updateWorld1, awardSeal, world1CanLeave, world1Snapshot, nodeLive } from "../systems/world1-play.js";

function setup(hero) {
  const room = WORLD1_ROOMS["w1-" + hero];
  assert.ok(room, "missing room for " + hero);
  let saves = 0;
  const events = [];
  const game = {
    roomId: room.id, roomDef: room, reduceMotion: true,
    // This suite isolates station actions; guardian gating has its own tests.
    clearedEncounters: hero==='kilo'?{'w1-kilo':['w1-kilo-tambor-v1']}:{},
    world1Seals: [], world1Visited: {}, score: 0, projectiles: [],
    player: { x: 0, y: WORLD1_FLOOR - 40, w: 28, h: 40, vx: 0, vy: 0, grounded: true, jumps: 0, health: 70, maxHealth: 100, xp: 0 },
    nums: { add() {} }, fx: { emit() {} },
    onWorld1Beat: (type, id) => events.push([type, id]),
    save: () => { saves++; }
  };
  enterWorld1(game);
  function stand(x) {
    const p = game.player;
    p.x = x - p.w / 2; p.y = WORLD1_FLOOR - p.h;
    p.vx = p.vy = 0; p.grounded = true; p.melee = 0;
  }
  const tick = () => updateWorld1(game);
  return { game, room, stand, tick, events, get saves() { return saves; } };
}

function assertSealed(run, hero) {
  const { game, room, events } = run;
  const total = WORLD1_SEALS[room.seal.kind].count;
  assert.equal(world1Snapshot(game).done, total, hero + " completed stations");
  assert.equal(world1Snapshot(game).sealed, true, hero + " seal state");
  assert.deepEqual(game.world1Seals, [hero], hero + " global seal inventory");
  assert.equal(world1CanLeave(game, "right"), true, hero + " must unlock east");
  assert.equal(game.score, 150 * (total+(['stitcho','cuerno'].includes(hero)?1:0)), hero + " grants points once per station");
  assert.equal(game.player.health, 95, hero + " heals on completion");
  assert.equal(game.player.xp, ['kilo','stitcho','chispin','cat','cuerno','dragon','dino','pizza','frita','yomi'].includes(hero)?423:3, hero + " rewards experience");
  assert.equal(run.saves, total+(['stitcho','cuerno','pizza','frita'].includes(hero)?2:['chispin','cat','dragon','dino','yomi'].includes(hero)?1:0), hero + " saves each completed objective once");
  assert.equal(events.filter((e) => e[0] === "seal").length, 1);
  assert.equal(awardSeal(game), false, "seal cannot be claimed again");
  run.tick();
  assert.equal(run.saves, total+(['stitcho','cuerno','pizza','frita'].includes(hero)?2:['chispin','cat','dragon','dino','yomi'].includes(hero)?1:0), "no extra save after completion");
}

test("World 1: exactly ten distinct seal mechanics, stations, and east gates", () => {
  assert.equal(WORLD1_ORDER.length, 10);
  const kinds = new Set();
  for (const hero of WORLD1_ORDER) {
    const room = WORLD1_ROOMS["w1-" + hero];
    kinds.add(room.seal.kind);
    assert.equal(room.seal.stations.filter((s) => s.kind !== "oven").length, WORLD1_SEALS[room.seal.kind].count);
    assert.equal(world1DoorOpen(room.id, "right", { seals: [] }), false);
    assert.equal(world1DoorOpen(room.id, "right", { seals: [hero] }), true);
  }
  assert.equal(kinds.size, 10);
  assert.equal(world1SealsComplete(WORLD1_ORDER.slice(0, 9)), false);
  assert.equal(world1SealsComplete(WORLD1_ORDER), true);
  assert.equal(world1DoorOpen("w1-final", "right", { won: false }), false);
  assert.equal(world1DoorOpen("w1-final", "right", { won: true }), true);
});

test("Kilo: serenade requires 45 stationary beats on each flower", () => {
  const run = setup("kilo"), { game, stand, tick } = run;
  assert.equal(world1CanLeave(game, "right"), false);
  for (const s of game.world1.stations) {
    stand(s.x);
    game.player.vx = 2;
    for (let n = 0; n < 45; n++) tick();
    assert.equal(s.done, false, "walking over a flower is not a stationary serenade");
    game.player.vx = 0;
    for (let n = 0; n < 44; n++) tick();
    assert.equal(s.done, false, "must hold the full interval");
    tick();
    assert.equal(s.done, true);
  }
  assertSealed(run, "kilo");
});

test("Stitcho: part zero and the remaining pieces reach their own workshops", () => {
  const run = setup("stitcho"), { game, stand, tick } = run;
  assert.equal(game.world1.stations[0].id, 0);
  for (const s of game.world1.stations) {
    if(s.id===1){game.player.id='stitcho';game.player._abilMove='roll';for(let x=2940;x<=3340;x+=10){stand(x);tick();}game.player._abilMove=null;}
    stand(s.x); tick();
    assert.equal(game.world1.carry, s.id);
    stand(s.target.x); tick();
    assert.equal(s.done, true);
    assert.equal(game.world1.carry, null);
  }
  assert.equal(game.world1.sealed,false);
  game.clearedEncounters={'w1-stitcho':['w1-stitcho-glitch-v1']};tick();
  assertSealed(run, "stitcho");
});

test("Chispín: each connected antenna stays lit, accepts any order and cannot farm score", () => {
  const run = setup("chispin"), { game, stand, tick } = run;
  const rods = game.world1.stations;
  stand(rods[2].x); tick();
  assert.equal(rods[2].done, true, "a real contact connects the antenna");
  stand(0);
  for (let i=0;i<1200;i++) tick();
  assert.equal(rods[2].done, true, "waiting never erases an earned connection");
  stand(rods[2].x); tick();assert.equal(game.score,150,"repeat contact is not rewarded twice");
  for (const s of [rods[0],rods[3],rods[1]]) { stand(s.x); tick(); }
  assert.equal(game.world1.sealed,false,"antennas do not grant a Titan victory");
  game.clearedEncounters={"w1-chispin":["w1-chispin-titan-v1"]};tick();
  assertSealed(run, "chispin");
});

test("Michi: a grounded touch is insufficient; jumping wakes all five lunar jellyfish", () => {
  const run = setup("cat"), { game, stand, tick } = run;
  const jelly = game.world1.stations;
  stand(jelly[0].x); tick();
  assert.equal(jelly[0].done, false);
  for (const s of jelly) {
    const p = game.player;
    p.x = s.x - p.w / 2; p.y = s.y - p.h / 2;
    p.grounded = false; p.vy = -4;
    tick();
    assert.equal(s.done, true);
  }
  assert.equal(game.world1.sealed,false,'objectives cannot fabricate a boss win');
  game.clearedEncounters={'w1-cat':[NEXT_CHAPTERS.cat.bossId]};tick();
  assertSealed(run, "cat");
});

test("Cuerno: prisms are solved I → II → III on a forward-only route", () => {
  const run = setup("cuerno"), { game, stand, tick } = run;
  game.player.id='cuerno';stand(1000);nextChapterAbility(game,game.player,0);
  const prisms = [...game.world1.stations].sort((a, b) => a.order - b.order);
  assert.deepEqual(prisms.map((s) => s.order), [0, 1, 2]);
  assert.ok(prisms[0].x < prisms[1].x && prisms[1].x < prisms[2].x, "no forced backtracking");
  stand(prisms[1].x); tick();
  assert.equal(prisms[1].done, false, "must activate I first");
  for (const s of prisms) { stand(s.x); tick(); assert.equal(s.done, true); }
  assert.equal(game.world1.sealed,false,'objectives cannot fabricate a boss win');
  game.clearedEncounters={'w1-cuerno':[NEXT_CHAPTERS.cuerno.bossId]};tick();
  assertSealed(run, "cuerno");
});

test("Dragón: lit braziers require a player strike", () => {
  const run = setup("dragon"), { game, stand, tick } = run;
  for (const s of game.world1.stations) {
    stand(s.x); tick();
    assert.equal(s.done, false, "proximity alone should not light a brazier");
    game.player.melee = 8; tick();
    assert.equal(s.done, true);
  }
  assert.equal(game.world1.sealed,false,'objectives cannot fabricate a boss win');
  game.clearedEncounters={'w1-dragon':[NEXT_CHAPTERS.dragon.bossId]};tick();
  assertSealed(run, "dragon");
});

test("Dino: a downward landing, not walking, wakes each fossil", () => {
  const run = setup("dino"), { game, stand, tick } = run;
  for (const s of game.world1.stations) {
    stand(s.x); tick();
    assert.equal(s.done, false);
    game.player.y=s.y-game.player.h-s.dropHeight-10; game.player.grounded = false; game.player.vy = 9; tick();
    game.player.y=s.y-game.player.h;game.player.grounded = true; game.player.vy = 0; tick();
    assert.equal(s.done, true);
  }
  assert.equal(game.world1.sealed,false);game.clearedEncounters={"w1-dino":[NEXT_CHAPTERS.dino.bossId]};tick();
  assertSealed(run, "dino");
});

test("Frita: a geyser launches the player high enough to reach each golden prize", () => {
  const run = setup("frita"), { game, stand, tick } = run;
  for (const s of game.world1.stations) {
    game.world1.tick=(180-s.id*55)%180;stand(s.x); tick();
    assert.equal(game.player.grounded, false, "geyser must launch player");
    assert.equal(game.player.vy, -s.force);
    for (let frame = 0; frame < 80 && !s.done; frame++) {
      const p = game.player;
      p.x+=Math.max(-4,Math.min(4,s.prize.x-p.x-p.w/2));p.y += p.vy;
      p.vy = Math.min(14, p.vy + 0.5); // game.js gravity
      tick();
    }
    assert.equal(s.done, true, "prize should be in the geyser trajectory");
  }
  assert.equal(game.world1.sealed,false);game.clearedEncounters={"w1-frita":[NEXT_CHAPTERS.frita.bossId]};tick();
  assertSealed(run, "frita");
});

test("Pizza: hot delivery expires, resets at the oven and rewards all three customers", () => {
  const run = setup("pizza"), { game, stand, tick } = run;
  const oven = game.world1.stations.find((s) => s.kind === "oven");
  const guests = game.world1.stations.filter((s) => s.kind === "guest");
  stand(oven.x); tick();
  assert.equal(game.world1.carry, "pizza");
  game.world1.tick = game.world1.pizzaUntil;
  stand(oven.x - 200); tick();
  assert.equal(game.world1.carry, null, "expired pizza is removed");
  for (const guest of guests) {
    stand(oven.x); tick();
    assert.equal(game.world1.carry, "pizza");
    stand(guest.x); tick();
    assert.equal(guest.done, true);
    assert.equal(game.world1.carry, null);
  }
  assert.equal(game.world1.sealed,false);game.clearedEncounters={"w1-pizza":[NEXT_CHAPTERS.pizza.bossId]};tick();
  assertSealed(run, "pizza");
});

test("Yomi: only nodes in their green phase synchronize", () => {
  const run = setup("yomi"), { game, stand, tick } = run;
  for (const s of game.world1.stations) {
    stand(s.x);
    const dark = (70 - s.phase + 180) % 180;
    game.world1.tick = dark - 1;
    game.world1.tick=dark;assert.equal(yomiNodeState(game,s),'wait');game.world1.tick=dark-1;
    tick();
    assert.equal(s.done, false);
    const green = (180 - s.phase) % 180;
    game.world1.tick = green - 1;
    game.world1.tick=green;assert.equal(yomiNodeState(game,s),'live');game.world1.tick=green-1;
    tick();
    assert.equal(s.done, true);
  }
  assert.equal(game.world1.sealed,false);game.clearedEncounters={"w1-yomi":[NEXT_CHAPTERS.yomi.bossId]};tick();
  assertSealed(run, "yomi");
});

test("World 1: re-entering a sealed room preserves the solved state without duplicate payout", () => {
  const run = setup("kilo"), { game, tick } = run;
  game.world1Seals = ["kilo"];
  enterWorld1(game);
  assert.ok(game.world1.stations.every((s) => s.done));
  assert.equal(game.world1.sealed, true);
  tick();
  assert.equal(game.score, 0);
  assert.equal(run.saves, 0);
  assert.equal(world1CanLeave(game, "right"), true);
});

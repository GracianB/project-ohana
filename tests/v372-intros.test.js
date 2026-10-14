import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { planWelcomeFantasy, activeFantasy, FANTASY_SLOTS, FANTASY_EVENTS, fantasyCamera } from "../systems/intro-fantasy.js";
import { ENDING_SIGNATURES, endingSignature, duoBeat } from "../systems/ending-duo.js";

const CAST = ["kilo","stitcho","chispin","cat","dragon","dino","frita","pizza","yomi","cuerno"];

test("V372 welcome: rhythm is fixed, only the wonders vary per run", () => {
  const seen = new Set();
  for (let seed = 1; seed <= 60; seed++) {
    const plan = planWelcomeFantasy(seed);
    assert.equal(plan.beats.length, 3);
    assert.equal(new Set(plan.beats.map(b => b.kind)).size, 3, "no wonder repeats in one run");
    plan.beats.forEach((b, i) => {
      assert.equal(b.start, FANTASY_SLOTS[i].start);
      assert.equal(b.end, FANTASY_SLOTS[i].end);
      assert.ok(FANTASY_EVENTS.includes(b.kind));
      assert.ok(CAST.includes(b.reactor));
      assert.ok(b.line.length > 3);
    });
    seen.add(plan.beats.map(b => b.kind).join());
  }
  assert.ok(seen.size > 20, "runs must actually differ");
  assert.deepEqual(planWelcomeFantasy(7), planWelcomeFantasy(7), "seeded runs are reproducible");
  // Slots never overlap the shared Frita/Pizza chase (4.25–7.15 s).
  for (const s of FANTASY_SLOTS) assert.ok(s.end <= 4.25 || s.start >= 7.15);
  assert.equal(activeFantasy(planWelcomeFantasy(3), 5.5), null);
});

test("V372 welcome: Stitcho camera theft never moves the camera under reduced motion", () => {
  for (let seed = 1; seed < 200; seed++) {
    const plan = planWelcomeFantasy(seed);
    const beat = plan.beats.find(b => b.kind === "cameraThief");
    if (!beat) continue;
    assert.equal(beat.reactor, "stitcho");
    const active = { beat, k: 0.5 };
    assert.equal(fantasyCamera(active, true), null);
    const cam = fantasyCamera(active, false);
    assert.ok(Math.abs(cam.rotate) < 0.05 && cam.zoom <= 1.08);
    return;
  }
  assert.fail("cameraThief never planned");
});

test("V372 ending: every hero has its own signature and the U partner shares the stage", () => {
  const motifs = new Set();
  for (const id of CAST) {
    const sig = endingSignature(id);
    assert.ok(ENDING_SIGNATURES[id], id);
    motifs.add(sig.motif);
  }
  assert.equal(motifs.size, 10, "ten distinct finishing motifs");
  const still = duoBeat(0, true);
  assert.equal(still.still, true);
  assert.equal(still.combo, 1);
  const mid = duoBeat(1.0, false);
  assert.ok(mid.partnerIn > 0 && mid.partnerIn < 1);
  const ending = fs.readFileSync("systems/ending.js", "utf8");
  assert.match(ending, /chooseUPartner\(hero\.id,detail\.uPartner\)/);
  assert.match(ending, /dataset\.endingPartner/);
  assert.match(fs.readFileSync("game.js", "utf8"), /uPartner: p\?\.uPartner \|\| null/);
});

test("V372 performance: intro/ending never build static gradients per frame", () => {
  const intro = fs.readFileSync("systems/intro.js", "utf8");
  const fantasy = fs.readFileSync("systems/intro-fantasy.js", "utf8") + fs.readFileSync("systems/ending-duo.js", "utf8");
  assert.doesNotMatch(fantasy.replace(/\/\/.*$/gm, ""), /create(Linear|Radial|Conic)Gradient|shadowBlur/);
  assert.match(intro, /paintBackdrop\(bctx,W,H,floor\)/);
  assert.match(intro, /cachedGradient\(ctx,"welcome-vignette:/);
  assert.match(intro, /classList\.contains\("playing"\)/, "hidden welcome stops painting once the game runs");
  assert.match(fs.readFileSync("systems/ending.js", "utf8"), /cachedGradient\(ctx,"end-bg:/);
});

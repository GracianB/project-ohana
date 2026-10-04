import test from "node:test";
import assert from "node:assert/strict";
import { computePose, enhancePose, motionProfile, MOTION_PROFILES } from "../characters/rig.js";

const basePlayer = {
  grounded: true,
  vx: 0,
  vy: 0,
  speed: 5,
  evo: 2,
  facing: 1,
};

test("los 10 personajes tienen perfiles cinéticos propios", () => {
  const ids = ["kilo","stitcho","chispin","cat","dragon","dino","frita","pizza","yomi","cuerno"];
  assert.equal(Object.keys(MOTION_PROFILES).length, 10);
  for (const id of ids) {
    const profile = motionProfile({ id });
    assert.equal(profile, MOTION_PROFILES[id]);
    for (const key of ["pace","sway","bounce","weight","attack","impact","jump","cast","dash"]) {
      assert.ok(Number.isFinite(profile[key]), id + ":" + key);
      assert.ok(profile[key] > 0, id + ":" + key);
    }
  }
});

test("aliases heredados usan el perfil del personaje canónico", () => {
  assert.equal(motionProfile({ id: "lilo" }), MOTION_PROFILES.kilo);
  assert.equal(motionProfile({ id: "stitch" }), MOTION_PROFILES.stitcho);
  assert.equal(motionProfile({ id: "pikachu" }), MOTION_PROFILES.chispin);
  assert.equal(motionProfile({ id: "michi" }), MOTION_PROFILES.cat);
});

test("la mejora de pose conserva el estado base y aumenta el lenguaje corporal", () => {
  const run = enhancePose({
    ...computePose({ ...basePlayer, vx: 4.5 }, 10, { rng: () => 0 }),
  }, { ...basePlayer, id: "chispin", vx: 4.5, facing: 1 });

  const heavy = enhancePose({
    ...computePose({ ...basePlayer, vx: 4.5 }, 10, { rng: () => 0 }),
  }, { ...basePlayer, id: "dino", vx: 4.5, facing: 1 });

  assert.equal(run.state, "run");
  assert.equal(heavy.state, "run");
  assert.ok(Math.abs(run.legSwing) > Math.abs(heavy.legSwing));
  assert.ok(run.motionPace > heavy.motionPace);
  assert.ok(run.motionWeight < heavy.motionWeight);
  assert.ok(run.sway !== heavy.sway);
});

test("ataque añade anticipación e impacto diferenciados por peso", () => {
  const actor = { ...basePlayer, id: "dino", melee: 8 };
  computePose(actor, 0, { rng: () => 0 });
  actor.melee = 7;
  const early = enhancePose(computePose(actor, 1, { rng: () => 0 }), actor);
  actor.melee = 4;
  const impact = enhancePose(computePose(actor, 2, { rng: () => 0 }), actor);

  assert.ok(early.anticipation > 0);
  assert.ok(impact.impact > 0);
  assert.ok(Math.abs(impact.bodyTilt) > 0);
  assert.ok(impact.squash >= 0);
  assert.ok(impact.stretch >= 0);
});

test("dash hace inclinar y estirar al personaje según su identidad", () => {
  const actor = { ...basePlayer, id: "chispin", dash: 8, facing: 1 };
  const pose = enhancePose(computePose(actor, 10, { rng: () => 0 }), actor);
  assert.ok(pose.bodyTilt > 0);
  assert.ok(pose.stretch > 0);
});

test("el casteo genera una pose corporal propia", () => {
  const actor = {
    ...basePlayer,
    id: "yomi",
    _cast: { slot: 2, id: "maw", t: 0, form: 2 },
  };
  const pose = enhancePose(computePose(actor, 10, { rng: () => 0 }), actor);
  assert.equal(pose.state, "cast");
  assert.equal(pose.castSlot, 2);
  assert.ok(Math.abs(pose.headTilt) > 0 || Math.abs(pose.bodyTilt) > 0);
});

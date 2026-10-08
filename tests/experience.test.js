import test from "node:test";
import assert from "node:assert/strict";
import {
  ExperienceDirector,
  experienceRank,
} from "../systems/experience.js";
import { evolutionTiming } from "../systems/evolution-timing.js";

test("experience ranks escalate coherently", () => {
  assert.equal(experienceRank(0), "READY");
  assert.equal(experienceRank(2), "RITMO");
  assert.equal(experienceRank(4), "FLOW");
  assert.equal(experienceRank(8), "DOMINIO");
  assert.equal(experienceRank(13), "RÁFAGA");
  assert.equal(experienceRank(1, true), "RÁFAGA");
});

test("experience director remains safe without DOM", () => {
  const fx = new ExperienceDirector();

  fx.hit(
    { color: "#fff", facing: 1 },
    { boss: false },
    { damage: 34, crit: true }
  );

  assert.ok(fx.state.impact > 0);
  assert.ok(fx.state.shock > 0);
  assert.equal(fx.state.crit, true);

  fx.hurt({ facing: 1 }, 20);

  assert.ok(fx.state.hurt >= 0);
  assert.equal(fx.state.flowT, 0);
});

test("experience zoom stays bounded", () => {
  const fx = new ExperienceDirector();

  fx.state.impact = 10;
  fx.state.shock = 10;
  fx.state.evo = 10;
  fx.state.finalEvo = true;

  const zoom = fx.zoomPulse({ reduceMotion: false });

  assert.ok(zoom >= 1);
  assert.ok(zoom <= 1.065);
});

test("reduced motion disables cinematic zoom amplification", () => {
  const fx = new ExperienceDirector();

  fx.state.impact = 1;
  fx.state.shock = 1;
  fx.state.evo = 1;

  assert.equal(
    fx.zoomPulse({ reduceMotion: true }),
    1
  );
});


test("evolution cinema has a bounded return-to-game timeline", () => {
  const normal = evolutionTiming({ reduced: false, finalForm: false });
  const final = evolutionTiming({ reduced: false, finalForm: true });
  const reduced = evolutionTiming({ reduced: true, finalForm: true });

  assert.ok(normal.end <= 2.2);
  assert.ok(final.end >= 5 && final.end <= 5.6);
  assert.ok(final.out - final.reveal >= 1.8);
  assert.ok(reduced.end <= 1.5);
  assert.ok(normal.flash <= normal.reveal);
  assert.ok(normal.reveal < normal.out);
  assert.ok(normal.out < normal.end);
  assert.ok(final.reveal < final.out);
  assert.ok(final.out < final.end);
});

import test from "node:test";
import assert from "node:assert/strict";
import { computePose, enhancePose, motionProfile, MOTION_PROFILES } from "../characters/rig.js";
import { BASIC_ATTACK_SIGNATURES, ABILITY_VISUAL_SIGNATURES } from "../characters/draw.js";
import { EVOLUTION_STAGES, EVOLUTION_COMBAT_STAGES, EVOLUTION_SIGNATURES, EVOLUTION_FINAL_DESIGNS, EVOLUTION_STAGE_COPY, EVOLUTION_MESSAGES, evolutionKey, evolutionProfile, evolutionMessage, applyEvolutionPose, drawEvolutionCinemaFX, drawEvolutionDesignFX, drawEvolutionSilhouetteFX, drawEvolutionCombatFX } from "../characters/evolution.js";

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

test("cambio de dirección produce un pulso visual de giro y frenada", () => {
  const actor = { ...basePlayer, id: "cat", vx: 4.5 };
  computePose(actor, 10, { rng: () => 0 });
  actor.vx = -4.5;
  const turn = enhancePose(computePose(actor, 11, { rng: () => 0 }), actor);
  assert.ok(turn.turnPulse > 0);
  actor.vx = -1.0;
  const brake = enhancePose(computePose(actor, 12, { rng: () => 0 }), actor);
  assert.ok(brake.brake > 0);
});

test("las 40 transiciones de evolución tienen mensaje y escalera narrativa", () => {
  const ids = ["kilo","stitcho","chispin","cat","dragon","dino","frita","pizza","yomi","cuerno"];
  assert.equal(EVOLUTION_STAGE_COPY.length, 5);
  assert.equal(Object.keys(EVOLUTION_MESSAGES).length, 10);

  for (const id of ids) {
    const lines = [];
    for (let evo = 1; evo < 5; evo++) {
      const m = evolutionMessage(id, evo);
      assert.equal(m.stage, evo);
      assert.ok(m.kicker);
      assert.ok(m.label);
      assert.ok(m.tone);
      assert.ok(m.line);
      lines.push(m.line);
    }
    assert.equal(new Set(lines).size, 4, id + ":message uniqueness");
  }
});
 
test("los 10 golpes básicos y las 30 habilidades tienen firmas visuales estables", () => {
  assert.equal(Object.keys(BASIC_ATTACK_SIGNATURES).length, 10);
  assert.equal(Object.values(BASIC_ATTACK_SIGNATURES).length, new Set(Object.values(BASIC_ATTACK_SIGNATURES)).size);
  assert.equal(Object.keys(ABILITY_VISUAL_SIGNATURES).length, 30);
  assert.equal(Object.values(ABILITY_VISUAL_SIGNATURES).length, new Set(Object.values(ABILITY_VISUAL_SIGNATURES)).size);
  for (const kind of Object.values(BASIC_ATTACK_SIGNATURES)) assert.ok(kind);
  for (const kind of Object.values(ABILITY_VISUAL_SIGNATURES)) assert.ok(kind);
});


test("las 5 formas tienen identidad visual y cinética propia para los 10 personajes", () => {
  const ids = ["kilo","stitcho","chispin","cat","dragon","dino","frita","pizza","yomi","cuerno"];
  assert.equal(EVOLUTION_STAGES.length, 5);
  assert.equal(EVOLUTION_SIGNATURES.length, 50);
  assert.equal(new Set(EVOLUTION_SIGNATURES).size, 50);

  for (const id of ids) {
    const keys = [];
    const poses = [];
    for (let evo = 0; evo < 5; evo++) {
      keys.push(evolutionKey(id, evo));
      const pose = applyEvolutionPose({
        state: "run",
        form: evo,
        t: 40,
        speed: 0.9,
        air: false,
        land: 0,
        bodyTilt: 0,
        headTilt: 0,
        armSwing: 1,
        legSwing: -1,
        sway: 1,
        bounce: 1,
        stretch: 0,
        squash: 0,
        anticipation: 0,
        impact: 0,
      }, { id, evo });
      poses.push(pose);
      assert.equal(pose.evolutionSignature, keys[evo]);
      assert.ok(pose.evolutionScaleX > 0);
      assert.ok(pose.evolutionScaleY > 0);
    }

    assert.equal(new Set(keys).size, 5);
    assert.ok(poses[0].evolutionScaleX < poses[1].evolutionScaleX);
    assert.ok(poses[1].evolutionScaleX < poses[2].evolutionScaleX);
    assert.ok(poses[2].evolutionScaleX < poses[3].evolutionScaleX);
    assert.ok(poses[3].evolutionScaleX < poses[4].evolutionScaleX);
    assert.ok(poses[0].evolutionScaleY < poses[4].evolutionScaleY);
  }
});

test("los estilos de evolución conservan una separación fuerte entre bebé, alta y forma final", () => {
  for (const id of ["kilo","stitcho","chispin","cat","dragon","dino","frita","pizza","yomi","cuerno"]) {
    const baby = applyEvolutionPose({ state:"idle", form:0, t:0, bodyTilt:0, headTilt:0, armSwing:0, legSwing:0, sway:1, bounce:1, stretch:0, squash:0 }, { id, evo:0 });
    const high = applyEvolutionPose({ state:"idle", form:3, t:0, bodyTilt:0, headTilt:0, armSwing:0, legSwing:0, sway:1, bounce:1, stretch:0, squash:0 }, { id, evo:3 });
    const final = applyEvolutionPose({ state:"idle", form:4, t:0, bodyTilt:0, headTilt:0, armSwing:0, legSwing:0, sway:1, bounce:1, stretch:0, squash:0 }, { id, evo:4 });

    assert.ok(Math.abs(high.bodyTilt) >= Math.abs(baby.bodyTilt));
    assert.ok(Math.abs(final.bodyTilt) >= Math.abs(high.bodyTilt));
    assert.ok(final.evolutionPulse === 0);
  }
});


test("la progresión de evolución también escala la lectura del combate sin tocar la lógica", () => {
  assert.equal(EVOLUTION_COMBAT_STAGES.length, 5);
  for (const id of ["kilo","stitcho","chispin","cat","dragon","dino","frita","pizza","yomi","cuerno"]) {
    const profiles = EVOLUTION_COMBAT_STAGES.map((stage, evo) => evolutionProfile({ id, evo }));
    for (const p of profiles) {
      for (const key of ["attack","cast","impact","trail","glow","density","snap"]) {
        assert.ok(Number.isFinite(p.combat[key]), id + ":e" + p.evo + ":" + key);
        assert.ok(p.combat[key] > 0, id + ":e" + p.evo + ":" + key);
      }
    }
    assert.ok(profiles[0].combat.attack < profiles[4].combat.attack, id + ":attack");
    assert.ok(profiles[0].combat.cast < profiles[4].combat.cast, id + ":cast");
    assert.ok(profiles[0].combat.impact < profiles[4].combat.impact, id + ":impact");
    assert.ok(profiles[0].combat.glow < profiles[4].combat.glow, id + ":glow");
  }
});



test("la etapa final usa diseño por personaje y se nombra como forma final", () => {
  assert.equal(EVOLUTION_STAGES[4].name, "final");
  const ids = ["kilo","stitcho","chispin","cat","dragon","dino","frita","pizza","yomi","cuerno"];
  const motifs = ids.map((id) => evolutionProfile({ id, evo: 4 }).finalDesign.motif);
  assert.equal(new Set(motifs).size, ids.length);
  for (const id of ids) {
    assert.ok(evolutionProfile({ id, evo: 4 }).finalDesign.span > 0, id);
  }
});
test("la identidad de personaje modula combate sin colapsar las cinco etapas", () => {
  const ids = ["kilo","stitcho","chispin","cat","dragon","dino","frita","pizza","yomi","cuerno"];
  const e2 = ids.map((id) => evolutionProfile({ id, evo: 2 }).combat.attack);
  assert.equal(new Set(e2).size, ids.length);
  const e4 = ids.map((id) => evolutionProfile({ id, evo: 4 }).combat.cast);
  assert.equal(new Set(e4).size, ids.length);
});


function makeEvolutionCinemaContext() {
  return {
    globalAlpha: 1,
    globalCompositeOperation: "source-over",
    strokeStyle: "#fff",
    fillStyle: "#fff",
    lineWidth: 1,
    lineCap: "round",
    lineJoin: "round",
    save() {}, restore() {}, translate() {}, rotate() {},
    beginPath() {}, closePath() {}, moveTo() {}, lineTo() {},
    ellipse() {}, arc() {}, quadraticCurveTo() {}, fill() {}, stroke() {}, fillRect() {}, rect() {},
  };
}

test("la cinemática de evolución puede dibujar las 50 firmas por héroe y etapa", () => {
  assert.equal(typeof drawEvolutionCinemaFX, "function");
  assert.equal(typeof drawEvolutionDesignFX, "function");
  assert.equal(typeof drawEvolutionSilhouetteFX, "function");
  assert.equal(typeof drawEvolutionCombatFX, "function");
  assert.equal(Object.keys(EVOLUTION_FINAL_DESIGNS).length, 10);
  const ctx = makeEvolutionCinemaContext();
  const ids = ["kilo","stitcho","chispin","cat","dragon","dino","frita","pizza","yomi","cuerno"];

  for (const id of ids) {
    for (let evo = 0; evo < 5; evo++) {
      assert.doesNotThrow(() => drawEvolutionCinemaFX(
        ctx, id, evo, 640, 300, 100, 60, "#ffd84a", 1
      ), id + ":cinema:e" + evo);
      assert.doesNotThrow(() => drawEvolutionDesignFX(
        ctx, { id, evo }, 80, { form: evo, state: "idle" }, 60
      ), id + ":design:e" + evo);
    }
  }
});


test("las formas 2-4 tienen siluetas finales distintas y FX de combate dibujables", () => {
  const ids = ["kilo","stitcho","chispin","cat","dragon","dino","frita","pizza","yomi","cuerno"];
  const ctx = makeEvolutionCinemaContext();
  const silhouettes = ids.map((id) => evolutionProfile({ id, evo: 4 }).finalDesign.silhouette);
  assert.equal(new Set(silhouettes).size, 10);
  for (const id of ids) {
    for (let evo = 2; evo < 5; evo++) {
      assert.doesNotThrow(() => drawEvolutionSilhouetteFX(
        ctx, { id, color: "#ffffff", evo }, 100, { form: evo, state: "idle" }, 60, false
      ), id + ":silhouette:e" + evo);
      assert.doesNotThrow(() => drawEvolutionCombatFX(
        ctx, { id, color: "#ffffff", evo }, 100,
        { form: evo, state: "attack", atk: 0.8, impact: 0.9 }, 60
      ), id + ":combat:e" + evo);
    }
  }
});

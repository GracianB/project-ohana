import test from "node:test";
import assert from "node:assert/strict";
import { R, computePose, MOTION_PROFILES } from "../characters/rig.js";
import { ART } from "../characters/art/index.js";
import { ROSTER } from "../characters/roster.js";

class MockPath2D {
  moveTo() {}
  lineTo() {}
  bezierCurveTo() {}
  quadraticCurveTo() {}
  arc() {}
  ellipse() {}
  rect() {}
  closePath() {}
}

function gradient() {
  return { addColorStop() {} };
}

function makeCanvasContext() {
  const state = {
    globalAlpha: 1, globalCompositeOperation: "source-over",
    fillStyle: "#000", strokeStyle: "#000", lineWidth: 1,
    lineCap: "butt", lineJoin: "miter", font: "10px sans-serif",
    textAlign: "start", textBaseline: "alphabetic",
    shadowColor: "#000", shadowBlur: 0, filter: "none",
  };
  const methods = new Set([
    "arc", "arcTo", "beginPath", "bezierCurveTo", "clip", "closePath",
    "createLinearGradient", "createRadialGradient", "ellipse", "fill",
    "fillRect", "getLineDash", "isPointInPath", "isPointInStroke",
    "lineTo", "measureText", "moveTo", "quadraticCurveTo", "restore",
    "rotate", "roundRect", "save", "scale", "stroke", "strokeRect", "translate",
  ]);
  return new Proxy(state, {
    get(target, prop) {
      if (prop === "createLinearGradient" || prop === "createRadialGradient") return gradient;
      if (prop === "measureText") return () => ({ width: 0 });
      if (prop === "getLineDash") return () => [];
      if (prop === "isPointInPath" || prop === "isPointInStroke") return () => false;
      if (prop in target) return target[prop];
      if (methods.has(prop)) return () => {};
      throw new Error("Canvas API no declarada en smoke mock: " + String(prop));
    },
    set(target, prop, value) {
      if (!(prop in target)) throw new Error("Canvas state no declarada en smoke mock: " + String(prop));
      target[prop] = value;
      return true;
    },
  });
}

function poseFor(id, form) {
  const p = {
    id,
    characterId: id,
    form,
    grounded: true,
    vx: 0,
    vy: 0,
    speed: 5,
    color: "#fff",
    x: 0,
    y: 0,
    w: 30,
    h: 40,
    evo: form,
    health: 100,
    maxHealth: 100,
    melee: 0,
    invuln: 0,
    _rig: {
      sway: 0, swayV: 0, bounce: 0, bounceV: 0, blinkAt: 90,
      blinkT: 0, idleT: 0, flourishT: -1, flourishN: 0,
      atkMax: 0, phase: 0, land: 0, wasAir: false, lastT: 59,
    },
  };
  return computePose(p, 60, { rng: () => 0 });
}

test("smoke test: cada personaje activo ejecuta sus 5 renderers vectoriales", async () => {
  globalThis.Path2D = MockPath2D;
  const ctx = makeCanvasContext();
  const failures = [];

  for (const character of ROSTER) {
    const art = ART[character.id];
    assert.ok(art, `falta ART para ${character.id}`);

    for (let form = 0; form < 5; form++) {
      const pose = poseFor(character.id, form);
      try {
        art.draw(ctx, pose, R);
      } catch (error) {
        failures.push({
          character: character.id,
          form,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  assert.deepEqual(failures, []);
  assert.equal(ROSTER.length, 10);
  assert.ok(ROSTER.every((character) => character.forms.length === 5));
});


test("hero presence: los 10 personajes tienen perfil de movimiento completo", () => {
  const ids = Object.keys(MOTION_PROFILES);
  assert.equal(ids.length, 10);

  for (const [id, profile] of Object.entries(MOTION_PROFILES)) {
    assert.ok(profile.pace > 0, id);
    assert.ok(profile.sway > 0, id);
    assert.ok(profile.bounce > 0, id);
    assert.ok(profile.weight > 0, id);
    assert.ok(profile.attack > 0, id);
    assert.ok(profile.impact > 0, id);
    assert.ok(profile.jump > 0, id);
    assert.ok(profile.cast > 0, id);
    assert.ok(profile.dash > 0, id);
  }
});

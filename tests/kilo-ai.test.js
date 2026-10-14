import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { updateKiloFoeAI, kiloAiType, KILO_AI_KINDS, KILO_AI } from "../engine/foes/kilo-ai.js";

const player = () => ({ x: 600, y: 600, w: 24, h: 34, dead: false });
function sim(enemies, frames, opts = {}) {
  const game = { worldW: 3000, enemies, player: opts.player || player(), t: 0 };
  const log = enemies.map(() => []);
  for (let f = 0; f < frames; f++) {
    game.t = f;
    enemies.forEach((e, i) => {
      opts.before?.(e, f);
      const handled = updateKiloFoeAI(e, game, 1, { t: f, target: game.player, canCommit: true });
      assert.equal(handled, true);
      e.x += e.vx || 0; e.y += e.vy || 0;
      if (e.kind === "cucaracho") e.y = 640;
      log[i].push({ tele: !!e.telegraph, atk: (e.lunge || 0) > 0 || (e.diving || 0) > 0, x: e.x, y: e.y, hiding: !!e.hiding, charging: e.charging || 0 });
    });
  }
  return { game, log };
}
function attacksAreTelegraphed(log) {
  let starts = 0;
  for (let i = 1; i < log.length; i++) if (log[i].atk && !log[i - 1].atk) { starts++; assert.equal(log[i - 1].tele, true, "ataque sin aviso en frame " + i); }
  return starts;
}

test("kilo-ai: solo gestiona sus 4 bichos (avispa = abeja con variant)", () => {
  assert.deepEqual([...KILO_AI_KINDS], ["cucaracho", "mosquito", "phosquito", "avispa"]);
  assert.equal(kiloAiType({ kind: "abeja", variant: "avispa" }), "avispa");
  assert.equal(kiloAiType({ kind: "abeja" }), null);
  assert.equal(kiloAiType({ kind: "rana" }), null);
  assert.equal(kiloAiType({ kind: "cucaracho", evo: 2 }), null);
  assert.equal(kiloAiType({ kind: "mosquito", boss: true }), null);
  assert.equal(updateKiloFoeAI({ kind: "rana", hp: 5 }, { enemies: [] }), false);
  assert.equal(updateKiloFoeAI({ kind: "mosquito", hp: 0 }, { enemies: [] }), false);
});

test("kilo-ai: nunca cambia vida ni crea campos de daño", () => {
  const es = [
    { kind: "cucaracho", x: 300, y: 640, w: 30, h: 18, vx: 1, vy: 0, hp: 40, max: 40, evo: 0 },
    { kind: "mosquito", x: 500, y: 450, w: 40, h: 34, vx: 1, vy: 0, hp: 28, max: 28 },
    { kind: "phosquito", x: 520, y: 470, w: 32, h: 26, vx: 1, vy: 0, hp: 38, max: 38 },
    { kind: "abeja", variant: "avispa", x: 700, y: 480, w: 42, h: 48, vx: 0, vy: 0, hp: 40, max: 40, cd: 5 },
  ];
  sim(es, 400);
  for (const e of es) { assert.equal(e.hp, e.max); assert.equal("dmg" in e, false); assert.equal("contactDmg" in e, false); }
});

test("cucaracho: zigzag con quiebros y huye a esconderse al recibir golpe", () => {
  const e = { kind: "cucaracho", x: 100, y: 640, w: 30, h: 18, vx: 1, vy: 0, hp: 40, max: 40, evo: 0, lungeCd: 9999 };
  const { log } = sim([e], 200, { player: { x: 2000, y: 640, w: 24, h: 34 } });
  const dirs = log[0].map((s, i) => i ? Math.sign(s.x - log[0][i - 1].x) : 0);
  assert.ok(dirs.includes(1) && dirs.includes(-1), "debe cambiar de sentido (zigzag)");
  assert.ok(log[0].at(-1).x > 100, "aun así avanza hacia el jugador");
  const p = { x: 400, y: 640, w: 24, h: 34 };
  const r = { kind: "cucaracho", x: 360, y: 640, w: 30, h: 18, vx: 1, vy: 0, hp: 40, max: 40, evo: 0, lungeCd: 9999 };
  const out = sim([r], 30, { player: p, before: (en, f) => { if (f === 2) en.hp -= 5; } });
  assert.ok(out.log[0][5].hiding, "se esconde tras el golpe");
  assert.ok(out.log[0][20].x < 360, "huye alejándose del jugador");
  r.hp = r.max; // restaurar para no ensuciar
});

test("cucaracho: la embestida siempre llega con aviso", () => {
  const e = { kind: "cucaracho", x: 520, y: 640, w: 30, h: 18, vx: 1, vy: 0, hp: 40, max: 40, evo: 1, lungeCd: 0 };
  const { log } = sim([e], 300);
  assert.ok(attacksAreTelegraphed(log[0]) >= 1);
});

test("mosquito: orbita al jugador y pica en picado tras aviso", () => {
  const p = player();
  const e = { kind: "mosquito", x: 300, y: 450, w: 40, h: 34, vx: 0, vy: 0, hp: 28, max: 28, diveCd: 9999 };
  const { log } = sim([e], 360, { player: p });
  const d = log[0].slice(120).map((s) => Math.hypot(s.x + 20 - 612, s.y + 17 - 547));
  assert.ok(Math.max(...d) < 260 && Math.min(...d) > 30, "zumba alrededor del jugador");
  const xs = log[0].slice(120).map((s) => Math.sign(s.x + 20 - 612));
  assert.ok(xs.includes(1) && xs.includes(-1), "pasa a ambos lados");
  e.diveCd = 0;
  const atk = sim([e], 300, { player: p });
  assert.ok(attacksAreTelegraphed(atk.log[0]) >= 1, "pica al menos una vez");
});

test("phosquito: se agrupa con otros phosquitos y avisa antes de picar", () => {
  const swarm = Array.from({ length: 5 }, (_, i) => ({ kind: "phosquito", x: 200 + i * 60, y: 400 + (i % 2) * 70, w: 32, h: 26, vx: (i % 2 ? 1 : -1) * 2, vy: 0, hp: 30, max: 30, diveCd: 9999 }));
  const spread = () => { const xs = swarm.map((e) => e.x), ys = swarm.map((e) => e.y); return Math.max(...xs) - Math.min(...xs) + Math.max(...ys) - Math.min(...ys); };
  const s0 = spread();
  sim(swarm, 120, { player: { x: 2600, y: 700, w: 24, h: 34 } });
  assert.ok(spread() < s0, "el grupo se cohesiona");
  assert.ok(swarm.every((e) => e.flock >= 1));
  const pairs = swarm.flatMap((a, i) => swarm.slice(i + 1).map((b) => Math.hypot(a.x - b.x, a.y - b.y)));
  assert.ok(Math.min(...pairs) > 8, "sin apilarse unos encima de otros");
  swarm.forEach((e) => { e.diveCd = 0; e.x = 560; });
  const { log } = sim([swarm[0]], 200);
  assert.ok(attacksAreTelegraphed(log[0]) >= 1);
});

test("avispa: picada doble con aviso antes de cada picada y luego se retira", () => {
  const p = player();
  const e = { kind: "abeja", variant: "avispa", x: 760, y: 480, w: 42, h: 48, vx: 0, vy: 0, hp: 40, max: 40, cd: 1 };
  const { log } = sim([e], KILO_AI.wasp.wind + KILO_AI.wasp.rewind + KILO_AI.wasp.sting * 2 + KILO_AI.wasp.retreat + 4, { player: p });
  assert.equal(attacksAreTelegraphed(log[0]), 2, "exactamente dos picadas");
  assert.ok(log[0].some((s) => s.charging > 0), "charging activo: dmgFor mantiene su daño de picada");
  const end = log[0].at(-1), retreatStart = log[0][KILO_AI.wasp.wind + KILO_AI.wasp.rewind + KILO_AI.wasp.sting * 2 + 1];
  assert.ok(Math.abs(end.x - (p.x + 12)) > Math.abs(retreatStart.x - (p.x + 12)) || end.y < retreatStart.y, "se retira tras la segunda picada");
});

test("kilo-ai: aturdido no decide; sin gradientes ni hp en el código", () => {
  const e = { kind: "mosquito", x: 0, y: 0, w: 40, h: 34, vx: 0, vy: 0, hp: 9, max: 9, stun: 20, telegraph: true, wind: 5 };
  assert.equal(updateKiloFoeAI(e, { enemies: [e], player: player() }), true);
  assert.equal(e.telegraph, false);
  const src = readFileSync(new URL("../engine/foes/kilo-ai.js", import.meta.url), "utf8");
  assert.doesNotMatch(src, /create(Linear|Radial)Gradient/);
  assert.doesNotMatch(src, /\.(hp|max)\s*[-+*/]?=(?!=)/);
});

function bossRng(e) {
  return typeof e?._rng === "function" ? e._rng() : Math.random();
}

import { chooseBossPattern, bossCombatProfile, recoveryFrames, chainGap, patternLabel } from "./boss-combat.js";

/**
 * Reina del Nido — director de combate por rutinas.
 * API: createBossNido() · updateBossNido(e, game, helpers)
 */

const CONFIG = {
  MAX_HP: 1600,
  WIDTH: 110,
  HEIGHT: 130,
  FLOOR_OFFSET: 90,
  SPAWN_X: 740,
  SPAWN_Y: 680,
  PHASE_THRESHOLDS: { PHASE_2: 0.66, PHASE_3: 0.33 },
  PERCH: 100,
};

export function createBossNido() {
  const max = CONFIG.MAX_HP;
  return {
    x: CONFIG.SPAWN_X,
    y: CONFIG.SPAWN_Y,
    w: CONFIG.WIDTH,
    h: CONFIG.HEIGHT,
    vx: 1.2,
    vy: 0,
    hp: max,
    max,
    kind: "boss",
    color: "#c02848",
    boss: true,
    phase: 1,
    mode: "idle",
    wind: 0,
    windMax: 0,
    attackCd: 70,
    telegraph: false,
    teleKind: "",
    facing: -1,
    airborne: false,
    slam: 0,
    slamHang: 0,
    dying: 0,
    dyingMax: 120,
    contactDmg: 22,
    shoot: 0,
    hoverY: 480,
    chargeLeft: 0,
    swoopLeft: 0,
    spitLeft: 0,
    shockT: 0,
    shockR: 0,
    shockX: 0,
    shockY: 0,
    intro: true,
    introT: 72,
    introMax: 72,
    introDrop: 700,
    phaseAnnounced: { 2: false, 3: false },
    bossFxSeed: 0,
    spawnCd: 0,
    bob: 0,
    flash: 0,
    invuln: 0,
    perch: 0,
    pattern: [],
    patternStep: -1,
    patternIndex: -1,
    chainDelay: 0,
    recoveryT: 0,
    recoveryMax: 0,
    vulnerable: false,
    lastAttack: "",
  };
}

export function updateBossNido(e, game, helpers) {
  e._rng = typeof helpers?.rng === "function" ? helpers.rng : Math.random;
  const {
    t = 0,
    hurtPlayer,
    showNotification,
    makeFoe,
    ROOM_W = 1200,
    ROOM_H = 800,
    reduceMotion = false,
    beep,
  } = helpers;

  const p = game?.player;
  if (!p || e.fell) return;

  const cx = e.x + e.w / 2;
  const cy = e.y + e.h / 2;
  const floorY = ROOM_H - CONFIG.FLOOR_OFFSET - e.h;

  if (e.introT > 0) {
    handleIntro(e, game, helpers, cx, floorY);
    return;
  }
  e.intro = false;

  checkPhaseTransitions(e, game, helpers, cx, cy);
  e.facing = Math.sign((p.x + p.w / 2) - cx) || e.facing || -1;
  e.bob = (e.bob || 0) + 1;

  if (e.shockT > 0) updateShockwave(e, p, ROOM_H, hurtPlayer);
  if (e.spawnCd > 0) e.spawnCd--;

  switch (e.mode) {
    case "windup": updateWindup(e, game, helpers, cx, floorY); break;
    case "charge": updateCharge(e, game, floorY); break;
    case "swoop": updateSwoop(e, game, floorY, cx, cy); break;
    case "slam": updateSlam(e, game, helpers, cx, floorY); break;
    case "spit": updateSpit(e, game, floorY); break;
    case "chain": updateChain(e, game, helpers); break;
    case "recovery": updateRecovery(e, game, helpers, floorY); break;
    default: updateIdle(e, game, helpers, cx, cy, reduceMotion, t, floorY); break;
  }

  if (e.phase >= 3 && e.spawnCd <= 0 && bossRng(e) < 0.012) {
    spawnMinion(e, game, makeFoe, showNotification, cx, reduceMotion);
  }

  applyBoundsAndClamp(e, ROOM_W, ROOM_H, floorY);
}

function emitParticles(game, x, y, opts, reduceMotion) {
  if (!game?.fx?.emit) return;
  const count = opts.count || 8;
  game.fx.emit(x, y, { ...opts, count: reduceMotion ? Math.max(2, Math.floor(count / 3)) : count });
}
function addGhost(game, ghostData) {
  if (Array.isArray(game.ghosts)) game.ghosts.push(ghostData);
}
function safeBeep(beep, soundName) {
  if (typeof beep === "function") { try { beep(soundName); } catch (_) {} }
}
function land(e, frames) {
  e.airborne = false;
  e.perch = Math.max(e.perch || 0, frames || CONFIG.PERCH);
  e.vy = 0;
}
function resetAttackState(e) {
  e.mode = "idle";
  e.telegraph = false;
  e.teleKind = "";
  e.wind = 0;
  e.windMax = 0;
  e.chargeLeft = 0;
  e.swoopLeft = 0;
  e.spitLeft = 0;
  e.slam = 0;
  e.slamHang = 0;
  e.pattern = [];
  e.patternStep = -1;
  e.patternIndex = -1;
  e.chainDelay = 0;
  e.recoveryT = 0;
  e.recoveryMax = 0;
  e.vulnerable = false;
  e.lastAttack = "";
  e.patternLabel = "";
  e.vx = (e.vx || 0) * 0.3;
  land(e, 70);
}

function handleIntro(e, game, helpers, cx, floorY) {
  const { reduceMotion, beep, showNotification } = helpers;
  const landAt = e.introMax - 22;
  const roarAt = 26;
  e.introT--;
  const done = e.introMax - e.introT;
  e.introDrop = done < 22 ? 280 * Math.pow(1 - done / 22, 2) : 0;
  e.vx = 0;
  e.vy = 0;
  e.telegraph = false;
  e.invuln = 2;
  e.contactDmg = 0;
  e.airborne = false;
  e.y = floorY;
  if (e.introT === landAt) {
    game.shake = Math.max(game.shake || 0, reduceMotion ? 6 : 26);
    game.flash = Math.max(game.flash || 0, 10);
    emitParticles(game, cx, e.y + e.h, { color: "#c89070", count: 30, size: 6, up: 1.4, speed: 5 }, reduceMotion);
    game.bossFx?.landing?.(cx, e.y + e.h, e.phase, 130);
    game.bossFx?.intro?.(cx, e.y + e.h);
    emitParticles(game, cx, e.y + e.h, { color: "#ffcf6a", count: 14, size: 3, up: 2.5, speed: 4, star: true }, reduceMotion);
    safeBeep(beep, "pound");
  }
  if (e.introT === roarAt) {
    game.shake = Math.max(game.shake || 0, reduceMotion ? 4 : 18);
    safeBeep(beep, "boss");
  }
  if (e.introT === 0) {
    e.contactDmg = 22;
    e.attackCd = 50;
    land(e, 40);
    if (showNotification) showNotification("REINA DEL NIDO", "Mira el suelo. Espera el brillo rojo.", "sala");
  }
}

function checkPhaseTransitions(e, game, helpers, cx, cy) {
  const { reduceMotion, beep, showNotification } = helpers;
  const ratio = e.hp / Math.max(1, e.max);
  if (ratio <= CONFIG.PHASE_THRESHOLDS.PHASE_3 && e.phase < 3) {
    e.phase = 3;
    e.color = "#ff1040";
    e.pattern = [];
    e.patternStep = -1;
    e.patternIndex = -1;
    e.contactDmg = 25;
    resetAttackState(e);
    e.attackCd = 40;
    if (!e.phaseAnnounced[3]) {
      e.phaseAnnounced[3] = true;
      game.flash = Math.max(game.flash || 0, 14);
      game.shake = Math.max(game.shake || 0, 20);
      emitParticles(game, cx, cy, { color: "#ff2040", count: 28, size: 5.5, up: 2.4, star: true }, reduceMotion);
      game.bossFx?.phaseTransition?.(cx, cy, 3);
      if (showNotification) showNotification("FASE FINAL", "Se posa. El vuelo es el ataque.", "hurt");
      safeBeep(beep, "hurt");
    }
  } else if (ratio <= CONFIG.PHASE_THRESHOLDS.PHASE_2 && e.phase < 2) {
    e.phase = 2;
    e.color = "#ff2848";
    e.pattern = [];
    e.patternStep = -1;
    e.patternIndex = -1;
    e.contactDmg = 23;
    resetAttackState(e);
    e.attackCd = 50;
    if (!e.phaseAnnounced[2]) {
      e.phaseAnnounced[2] = true;
      game.flash = Math.max(game.flash || 0, 12);
      game.shake = Math.max(game.shake || 0, 16);
      emitParticles(game, cx, cy, { color: "#ff2848", count: 24, size: 5, up: 2.2, star: true }, reduceMotion);
      game.bossFx?.phaseTransition?.(cx, cy, 2);
      if (showNotification) showNotification("FASE 2", "Abre las alas, pero vuelve al nido.", "hurt");
      safeBeep(beep, "hurt");
    }
  }
}

function updateShockwave(e, p, ROOM_H, hurtPlayer) {
  e.shockT--;
  e.shockR += e.phase >= 3 ? 7 : 5;
  const px = p.x + p.w / 2;
  const nearGround = (p.y + p.h) > (ROOM_H - 140);
  const dist = Math.hypot(px - e.shockX, (p.y + p.h) - e.shockY);
  if (nearGround && dist < e.shockR && dist > (e.shockR - 28) && typeof hurtPlayer === "function") {
    hurtPlayer(e.phase >= 3 ? 16 : 12, e.phase >= 3 ? "-16" : "-12");
  }
}

function updateWindup(e, game, helpers, cx, floorY) {
  const { t, reduceMotion } = helpers;
  e.vx *= 0.82;
  if (e.teleKind === "swoop" || e.teleKind === "slam") {
    e.airborne = true;
    e.hoverY = floorY - (e.phase >= 3 ? 150 : 110);
    e.vy = (e.hoverY - e.y) * 0.08;
  } else {
    e.airborne = false;
    e.vy = 0;
    e.y += (floorY - e.y) * 0.2;
  }
  e.wind++;
  e.telegraph = true;
  if (e.teleKind === "charge" && t % 4 === 0) {
    emitParticles(game, cx + e.facing * 40, e.y + e.h, { color: "#ff4040", count: 3, size: 2.5, up: 0.4, speed: 1.6 }, reduceMotion);
  }
  if (e.wind >= e.windMax) {
    e.telegraph = false;
    e.wind = 0;
    beginAttack(e, game, helpers, floorY);
  }
}

function updateCharge(e, game, floorY) {
  const t = game.t || 0;
  e.airborne = false;
  e.chargeLeft--;
  e.vx = e.facing * (e.phase >= 3 ? 9.5 : e.phase === 2 ? 8.2 : 7.2);
  e.vy = 0;
  e.y += (floorY - e.y) * 0.35;
  if (t % 2 === 0) addGhost(game, { x: e.x, y: e.y, w: e.w, h: e.h, life: 8, color: e.phase >= 3 ? "#ff1040" : "#f36" });
  if (e.chargeLeft <= 0) {
    finishBossAttack(e, game, e.phase >= 3 ? 5 : e.phase === 2 ? 8 : 10);
  }
}

function updateSwoop(e, game, floorY, cx, cy) {
  const t = game.t || 0;
  const reduceMotion = game.reduceMotion || false;
  e.airborne = true;
  e.swoopLeft--;
  if (e.swoopLeft < 10) { e.vx *= 0.9; e.vy *= 0.85; }
  if (t % 2 === 0) {
    addGhost(game, { x: e.x, y: e.y, w: e.w, h: e.h, life: 10, color: "#ff6080" });
    emitParticles(game, cx, cy + 20, { color: "#ff6a8a", count: 2, size: 2.2, up: 0.3, speed: 1.4 }, reduceMotion);
  }
  if (e.swoopLeft <= 0 || e.y >= floorY - 8) {
    e.y = Math.min(e.y, floorY);
    finishBossAttack(e, game, e.phase >= 3 ? 4 : 7);
    if (e.y >= floorY - 8) {
      game.shake = Math.max(game.shake || 0, 8);
      emitParticles(game, cx, e.y + e.h, { color: "#f84", count: 12, size: 3.5, up: 1.6 }, reduceMotion);
      game.bossFx?.landing?.(cx, e.y + e.h, e.phase, e.phase >= 3 ? 190 : 145);
    }
  }
}

function updateSlam(e, game, helpers, cx, floorY) {
  const { hurtPlayer, reduceMotion } = helpers;
  const p = game.player;
  e.airborne = true;
  if (e.slam === 1) {
    e.vy = -11;
    e.vx *= 0.5;
    e.slam = 2;
    e.slamHang = 18;
  } else if (e.slam === 2) {
    e.slamHang--;
    e.vy = -0.2;
    e.vx = (p.x - e.x) * 0.04;
    if (e.slamHang <= 0) {
      e.slam = 3;
      e.vy = e.phase >= 3 ? 16 : 13;
      e.vx = 0;
    }
  } else if (e.slam === 3 && e.y >= floorY - 4) {
    e.y = floorY;
    e.vy = 0;
    e.slam = 0;
    finishBossAttack(e, game, e.phase >= 3 ? 5 : 8);
    game.shake = Math.max(game.shake || 0, e.phase >= 3 ? 18 : 12);
    game.flash = Math.max(game.flash || 0, e.phase >= 3 ? 8 : 4);
    emitParticles(game, cx, e.y + e.h, { color: "#ff8040", count: 18, size: 4.5, up: 2.2 }, reduceMotion);
    if (e.phase >= 3 || bossRng(e) < 0.55) {
      e.shockT = 22;
      e.shockR = 40;
      e.shockX = cx;
      e.shockY = e.y + e.h;
    }
    if (Math.abs((p.x + p.w / 2) - cx) < 150 && (p.y + p.h) > e.y && typeof hurtPlayer === "function") {
      hurtPlayer(e.phase >= 3 ? 18 : 14, e.phase >= 3 ? "-18" : "-14");
    }
  }
}

function updateSpit(e, game, floorY) {
  e.vx *= 0.7;
  e.airborne = false;
  e.vy = 0;
  e.y += (floorY - e.y) * 0.25;
  e.spitLeft--;
  if (e.spitLeft <= 0) {
    finishBossAttack(e, game, e.phase >= 3 ? 5 : e.phase === 2 ? 8 : 10);
  }
}


function finishBossAttack(e, game, delay = 6) {
  e.lastAttack = e.teleKind || e.mode || "";
  const next = Array.isArray(e.pattern) ? e.pattern.length : 0;
  if (e.patternStep >= 0 && e.patternStep < next - 1) {
    e.patternStep++;
    e.chainDelay = delay;
    e.mode = "chain";
    e.telegraph = false;
    e.teleKind = e.pattern[e.patternStep];
    e.vx *= 0.25;
    e.vy = 0;
    return;
  }
  e.pattern = [];
  e.patternStep = -1;
  e.telegraph = false;
  e.teleKind = "";
  e.mode = "recovery";
  e.recoveryMax = recoveryFrames(e.phase);
  e.recoveryT = e.recoveryMax;
  e.vulnerable = true;
  e.invuln = 0;
  e.patternLabel = "";
  e.vx *= 0.12;
  land(e, 1);
  if (game?.bossFx?.recovery) game.bossFx.recovery(e.x + e.w / 2, e.y + e.h / 2, e.phase);
}

function updateChain(e, game, helpers) {
  e.chainDelay--;
  e.telegraph = e.chainDelay <= Math.max(1, chainGap(e.phase) - 3);
  if (e.chainDelay <= 0) {
    const floorY = (helpers.ROOM_H || 800) - CONFIG.FLOOR_OFFSET - e.h;
    e.wind = 0;
    e.windMax = Math.max(12, Math.round(({ charge: 28, slam: 34, swoop: 32, spit: 22 }[e.teleKind] || 22) * 0.72));
    e.vx = 0;
    beginChainedWindup(e, e.teleKind, floorY);
  }
}

function beginChainedWindup(e, kind, floorY) {
  e.mode = "windup";
  e.teleKind = kind;
  e.telegraph = true;
  e.wind = 0;
  e.windMax = Math.max(10, Math.round(({ charge: 28, slam: 34, swoop: 32, spit: 22 }[kind] || 22) * 0.72));
  e.vx *= 0.3;
  if (kind === "swoop" || kind === "slam") {
    e.airborne = true;
    e.hoverY = floorY - (e.phase >= 3 ? 150 : 110);
  }
}

function updateRecovery(e, game, helpers, floorY) {
  e.vx *= 0.72;
  e.vy = 0;
  e.y += (floorY - e.y) * 0.25;
  e.airborne = false;
  e.telegraph = false;
  e.vulnerable = true;
  e.recoveryT--;
  if (e.recoveryT <= 0) {
    e.recoveryT = 0;
    e.recoveryMax = 0;
    e.vulnerable = false;
    e.mode = "idle";
    e.attackCd = e.phase >= 3 ? 26 : e.phase === 2 ? 38 : 52;
    e.invuln = 0;
    land(e, CONFIG.PERCH);
    game?.bossFx?.recoveryEnd?.(e.x + e.w / 2, e.y + e.h / 2, e.phase);
  }
}

function updateIdle(e, game, helpers, cx, cy, reduceMotion, t, floorY) {
  const p = game.player;
  e._lastPlayer = p ? { x: p.x, y: p.y, w: p.w, h: p.h } : null;
  if (e.perch > 0) e.perch--;
  const grounded = e.phase < 3 || e.perch > 0;
  if (grounded) {
    e.airborne = false;
    e.vy = 0;
    e.y += (floorY - e.y) * 0.18;
    const aggro = e.phase >= 3 ? 0.1 : 0.08;
    e.vx += Math.sign((p.x - e.x) || 1) * aggro;
    e.vx = Math.max(-3.4, Math.min(3.4, e.vx));
    if (e.phase === 1 && t % 100 === 0 && Math.abs(e.vy) < 0.5) e.vy = -6.5;
  } else {
    e.airborne = true;
    e.hoverY = floorY - 100;
    const targetY = e.hoverY + Math.sin(e.bob * 0.08) * 16;
    e.vy = (targetY - e.y) * 0.08;
    e.vx += Math.sign((p.x - e.x) || 1) * 0.1;
    e.vx = Math.max(-3.6, Math.min(3.6, e.vx));
  }
  if (e.phase >= 3 && !reduceMotion && t % 8 === 0) {
    emitParticles(game, cx + (bossRng(e) - 0.5) * 60, cy, { color: "#ffe66a", count: 2, size: 2, up: 1.2, star: true }, reduceMotion);
  }
  e.attackCd--;
  if (e.attackCd <= 0 && e.perch <= 0) pickAttack(e);
}

function pickAttack(e) {
  const p = e._lastPlayer || null;
  const cx = e.x + e.w / 2;
  const px = p ? p.x + p.w / 2 : cx;
  const py = p ? p.y + p.h / 2 : e.y + e.h / 2;
  const pattern = chooseBossPattern(
    e.phase,
    e.patternIndex,
    bossRng.bind(null, e),
    { distance: Math.abs(px - cx), vertical: py - (e.y + e.h / 2) }
  );
  e.pattern = pattern;
  const profiles = bossCombatProfile(e.phase);
  e.patternIndex = profiles.patterns.findIndex((candidate) => candidate.length === pattern.length && candidate.every((kind, i) => kind === pattern[i]));
  e.patternStep = 0;
  e.teleKind = pattern[0] || "charge";
  e.lastAttack = "";
  e.patternLabel = patternLabel(pattern);
  startWindup(e, e.teleKind);
}


function startWindup(e, kind) {
  e.mode = "windup";
  e.teleKind = kind;
  e.telegraph = true;
  e.wind = 0;
  e.windMax = { charge: 28, slam: 34, swoop: 32, spit: 22 }[kind] || 22;
  e.vx *= 0.4;
}

function beginAttack(e, game, helpers, floorY) {
  const { reduceMotion } = helpers;
  const p = game.player;
  const cx = e.x + e.w / 2;
  const cy = e.y + e.h / 2;
  const kind = e.teleKind;
  const dmg = e.phase >= 3 ? 16 : 15;
  game.bossFx?.attackRelease?.(cx, cy, kind, e.phase, e.facing);
  if (kind === "charge") {
    e.mode = "charge";
    e.chargeLeft = e.phase >= 3 ? 28 : 24;
    e.airborne = false;
    e.y = floorY;
    emitParticles(game, cx, e.y + e.h, { color: "#ff3030", count: 10, size: 3, up: 0.8 }, reduceMotion);
    return;
  }
  if (kind === "swoop") {
    e.mode = "swoop";
    e.airborne = true;
    e.swoopLeft = e.phase >= 3 ? 36 : 40;
    const aimX = (p.x + p.w / 2) - cx;
    const aimY = (p.y + p.h / 2) - cy;
    const len = Math.hypot(aimX, aimY) || 1;
    const spd = e.phase >= 3 ? 11 : 9.2;
    e.vx = (aimX / len) * spd;
    e.vy = Math.max(3.5, (aimY / len) * spd);
    emitParticles(game, cx, cy, { color: "#ff6080", count: 8, size: 3, up: 1 }, reduceMotion);
    return;
  }
  if (kind === "slam") {
    e.mode = "slam";
    e.slam = 1;
    e.airborne = true;
    emitParticles(game, cx, cy, { color: "#ff8040", count: 8, size: 3.5, up: 1.5 }, reduceMotion);
    return;
  }
  e.mode = "spit";
  e.spitLeft = 12;
  e.airborne = false;
  const aim = Math.sign((p.x + p.w / 2) - cx) || 1;
  const shots = e.phase === 1 ? (2 + (bossRng(e) < 0.5 ? 1 : 0)) : 5;
  const baseSpeed = e.phase >= 3 ? 5.2 : 4.4;
  if (Array.isArray(game.projectiles)) {
    for (let s = 0; s < shots; s++) {
      const spread = (s - (shots - 1) / 2) * (e.phase === 1 ? 1.35 : 1.55);
      game.projectiles.push({
        x: cx - 8, y: cy - 6, vx: aim * baseSpeed, vy: spread,
        w: 16, h: 12, life: 85, dmg, color: e.phase >= 3 ? "#ff4060" : "#ff5a6a", owner: "enemy",
      });
    }
  }
  emitParticles(game, cx + aim * 30, cy, { color: "#ff5a6a", count: 6, size: 2.8, up: 0.6 }, reduceMotion);
}

function spawnMinion(e, game, makeFoe, showNotification, cx, reduceMotion) {
  if (typeof makeFoe !== "function" || !Array.isArray(game.enemies)) return;
  const babies = game.enemies.filter((x) => x.kind === "phosquito" && x.baby && x.hp > 0).length;
  if (babies < 2) {
    e.spawnCd = 160;
    const baby = makeFoe(cx, e.y - 20, "phosquito", "boss", 0, { baby: true });
    if (baby) {
      baby.hp = Math.max(10, Math.round((baby.hp || 20) * 0.85));
      baby.max = baby.hp;
      game.enemies.push(baby);
      emitParticles(game, cx, e.y, { color: "#6ad0a8", count: 10, size: 3, up: 1.4 }, reduceMotion);
      game.bossFx?.spawn?.(cx, e.y, e.phase);
      if (showNotification) showNotification("CRÍA", "Un phosquito nace del nido.", "sala");
    }
  }
}

function applyBoundsAndClamp(e, ROOM_W, ROOM_H, floorY) {
  e.x = Math.max(40, Math.min(e.x, ROOM_W - e.w - 40));
  if (!e.airborne) {
    e.y = floorY;
    e.vy = 0;
  }
  e.y = Math.max(80, Math.min(e.y, floorY));
}
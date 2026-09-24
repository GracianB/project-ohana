/**
 * Reina del Nido — jefe final con 3 fases, telegraphs y silueta procedural.
 * API: createBossNido() · updateBossNido(e, game, helpers)
 */
export function createBossNido() {
  const max = 1600;
  return {
    x: 740,
    y: 680,
    w: 110,
    h: 130,
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
    spawnCd: 0,
    bob: 0,
    flash: 0,
  };
}

/**
 * @param {object} e boss enemy
 * @param {object} game
 * @param {{ t:number, hurtPlayer:Function, showNotification:Function, makeFoe:Function, ROOM_W:number, ROOM_H:number, reduceMotion:boolean, beep?:Function }} helpers
 */
export function updateBossNido(e, game, helpers) {
  const {
    t,
    hurtPlayer,
    showNotification,
    makeFoe,
    ROOM_W,
    ROOM_H,
    reduceMotion,
    beep,
  } = helpers;
  const p = game.player;
  if (!p || e.fell) return;

  const cx = e.x + e.w / 2;
  const cy = e.y + e.h / 2;
  const floorY = ROOM_H - 90 - e.h; // ~680 on default ROOM_H
  const rm = !!reduceMotion;
  const emit = (x, y, opts) => {
    if (!game.fx) return;
    const count = opts.count || 8;
    game.fx.emit(x, y, {
      ...opts,
      count: rm ? Math.max(2, Math.floor(count / 3)) : count,
    });
  };

  // --- entrada cinematográfica: cae del cielo, aterriza y ruge ---
  if (e.introT > 0) {
    const landAt = e.introMax - 22, roarAt = 26;
    e.introT--;
    const done = e.introMax - e.introT;
    e.introDrop = done < 22 ? 280 * Math.pow(1 - done / 22, 2) : 0;
    e.vx = 0; e.vy = 0; e.telegraph = false; e.invuln = 2; e.contactDmg = 0;
    if (e.introT === landAt) {
      game.shake = Math.max(game.shake || 0, rm ? 6 : 26);
      game.flash = Math.max(game.flash || 0, 10);
      emit(cx, e.y + e.h, { color: "#c89070", count: 30, size: 6, up: 1.4, speed: 5 });
      emit(cx, e.y + e.h, { color: "#ffcf6a", count: 14, size: 3, up: 2.5, speed: 4, star: true });
      if (beep) try { beep("pound"); } catch (_) {}
    }
    if (e.introT === roarAt) {
      game.shake = Math.max(game.shake || 0, rm ? 4 : 18);
      if (beep) try { beep("boss"); } catch (_) {}
    }
    if (e.introT === 0) {
      e.contactDmg = 22;
      e.attackCd = 50;
      showNotification("REINA DEL NIDO", "Mira el suelo. Espera el brillo rojo.", "sala");
    }
    return;
  }
  e.intro = false;

  // --- phase transitions ---
  const ratio = e.hp / Math.max(1, e.max);
  if (ratio <= 0.33 && e.phase < 3) {
    e.phase = 3;
    e.color = "#ff1040";
    e.contactDmg = 25;
    e.airborne = true;
    e.mode = "idle";
    e.telegraph = false;
    e.attackCd = 40;
    if (!e.phaseAnnounced[3]) {
      e.phaseAnnounced[3] = true;
      game.flash = Math.max(game.flash || 0, 14);
      game.shake = Math.max(game.shake || 0, 20);
      emit(cx, cy, { color: "#ff2040", count: 28, size: 5.5, up: 2.4, star: true });
      emit(cx, cy, { color: "#ffe66a", count: 16, size: 3.5, up: 2, star: true });
      showNotification("FASE FINAL", "El Nido enloquece.", "hurt");
      if (beep) try { beep("hurt"); } catch (_) {}
    }
  } else if (ratio <= 0.66 && e.phase < 2) {
    e.phase = 2;
    e.color = "#ff2848";
    e.contactDmg = 23;
    e.airborne = true;
    e.mode = "idle";
    e.telegraph = false;
    e.attackCd = 50;
    e.hoverY = 460;
    if (!e.phaseAnnounced[2]) {
      e.phaseAnnounced[2] = true;
      game.flash = Math.max(game.flash || 0, 12);
      game.shake = Math.max(game.shake || 0, 16);
      emit(cx, cy, { color: "#ff2848", count: 24, size: 5, up: 2.2, star: true });
      showNotification("FASE 2", "Despliega alas. Cuidado arriba.", "hurt");
      if (beep) try { beep("hurt"); } catch (_) {}
    }
  }

  e.facing = Math.sign((p.x + p.w / 2) - cx) || e.facing || -1;
  e.bob = (e.bob || 0) + 1;

  // shockwave residual (fase 3 slam)
  if (e.shockT > 0) {
    e.shockT--;
    e.shockR += e.phase >= 3 ? 7 : 5;
    const px = p.x + p.w / 2;
    const nearGround = p.y + p.h > ROOM_H - 140;
    const dist = Math.hypot(px - e.shockX, (p.y + p.h) - e.shockY);
    if (nearGround && dist < e.shockR && dist > e.shockR - 28) {
      hurtPlayer(e.phase >= 3 ? 16 : 12, e.phase >= 3 ? "-16" : "-12");
    }
  }

  if (e.spawnCd > 0) e.spawnCd--;

  // --- state machine ---
  if (e.mode === "windup") {
    e.vx *= 0.82;
    if (e.airborne) {
      e.vy = (e.hoverY - e.y) * 0.06;
    } else {
      e.vy = Math.min(e.vy, 0);
    }
    e.wind++;
    e.telegraph = true;
    // pulse dust during charge telegraph
    if (e.teleKind === "charge" && t % 4 === 0) {
      emit(cx + e.facing * 40, e.y + e.h, { color: "#ff4040", count: 3, size: 2.5, up: 0.4, speed: 1.6 });
    }
    if (e.wind >= e.windMax) {
      e.telegraph = false;
      e.wind = 0;
      beginAttack(e, game, helpers, emit);
    }
    return afterMoveClamp(e, ROOM_W, ROOM_H, floorY);
  }

  if (e.mode === "charge") {
    e.airborne = false;
    e.chargeLeft--;
    e.vx = e.facing * (e.phase >= 3 ? 9.5 : e.phase === 2 ? 8.2 : 7.2);
    e.vy = 0;
    if (t % 2 === 0) {
      game.ghosts.push({
        x: e.x, y: e.y, w: e.w, h: e.h,
        life: 8,
        color: e.phase >= 3 ? "#ff1040" : "#f36",
      });
    }
    if (e.chargeLeft <= 0) {
      e.mode = "idle";
      e.vx *= 0.3;
      e.attackCd = e.phase >= 3 ? 45 : e.phase === 2 ? 55 : 70;
    }
    return afterMoveClamp(e, ROOM_W, ROOM_H, floorY);
  }

  if (e.mode === "swoop") {
    e.airborne = true;
    e.swoopLeft--;
    // diagonal dive already set vx/vy at start; ease out near end
    if (e.swoopLeft < 10) {
      e.vx *= 0.9;
      e.vy *= 0.85;
    }
    if (t % 2 === 0) {
      game.ghosts.push({
        x: e.x, y: e.y, w: e.w, h: e.h,
        life: 10,
        color: "#ff6080",
      });
      emit(cx, cy + 20, { color: "#ff6a8a", count: 2, size: 2.2, up: 0.3, speed: 1.4 });
    }
    if (e.swoopLeft <= 0 || e.y >= floorY - 8) {
      e.mode = "idle";
      e.vx *= 0.4;
      e.vy = -2;
      e.attackCd = e.phase >= 3 ? 38 : 48;
      if (e.y >= floorY - 8) {
        e.y = floorY;
        game.shake = Math.max(game.shake || 0, 8);
        emit(cx, e.y + e.h, { color: "#f84", count: 12, size: 3.5, up: 1.6 });
      }
    }
    return afterMoveClamp(e, ROOM_W, ROOM_H, floorY);
  }

  if (e.mode === "slam") {
    e.airborne = true;
    if (e.slam === 1) {
      // rising
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
    } else if (e.slam === 3) {
      if (e.y >= floorY - 4) {
        e.y = floorY;
        e.vy = 0;
        e.mode = "idle";
        e.slam = 0;
        e.airborne = e.phase >= 2;
        e.attackCd = e.phase >= 3 ? 50 : 65;
        game.shake = Math.max(game.shake || 0, e.phase >= 3 ? 18 : 12);
        game.flash = Math.max(game.flash || 0, e.phase >= 3 ? 8 : 4);
        emit(cx, e.y + e.h, { color: "#ff8040", count: 18, size: 4.5, up: 2.2 });
        if (e.phase >= 3 || Math.random() < 0.55) {
          e.shockT = 22;
          e.shockR = 40;
          e.shockX = cx;
          e.shockY = e.y + e.h;
        }
        // contact slam AOE
        if (Math.abs((p.x + p.w / 2) - cx) < 150 && p.y + p.h > e.y) {
          hurtPlayer(e.phase >= 3 ? 18 : 14, e.phase >= 3 ? "-18" : "-14");
        }
      }
    }
    return afterMoveClamp(e, ROOM_W, ROOM_H, floorY);
  }

  if (e.mode === "spit") {
    e.vx *= 0.7;
    if (e.airborne) e.vy = (e.hoverY - e.y) * 0.05;
    e.spitLeft--;
    if (e.spitLeft <= 0) {
      e.mode = "idle";
      e.attackCd = e.phase >= 3 ? 40 : e.phase === 2 ? 50 : 60;
    }
    return afterMoveClamp(e, ROOM_W, ROOM_H, floorY);
  }

  // --- idle / patrol ---
  e.mode = "idle";
  e.telegraph = false;
  e.teleKind = "";

  if (e.phase === 1) {
    e.airborne = false;
    const aggro = 0.08;
    e.vx += Math.sign((p.x - e.x) || 1) * aggro;
    e.vx = Math.max(-3.2, Math.min(3.2, e.vx));
    // small hop occasionally
    if (t % 100 === 0 && Math.abs(e.vy) < 0.5) e.vy = -6.5;
  } else {
    e.airborne = true;
    const targetY = e.hoverY + Math.sin(e.bob * 0.08) * 28;
    e.vy = (targetY - e.y) * 0.08;
    e.vx += Math.sign((p.x - e.x) || 1) * (e.phase >= 3 ? 0.14 : 0.1);
    e.vx = Math.max(-4.8, Math.min(4.8, e.vx));
    if (e.phase >= 2 && t % 3 === 0) {
      game.ghosts.push({
        x: e.x, y: e.y, w: e.w, h: e.h,
        life: 7,
        color: e.phase >= 3 ? "#ff1040" : "#ff4868",
      });
    }
  }

  if (e.phase >= 3 && !rm && t % 8 === 0) {
    emit(cx + (Math.random() - 0.5) * 60, cy, { color: "#ffe66a", count: 2, size: 2, up: 1.2, star: true });
  }

  e.attackCd--;
  if (e.attackCd <= 0) {
    pickAttack(e, game, helpers);
  }

  // fase 3: refuerzos phosquito baby (máx 2)
  if (e.phase >= 3 && e.spawnCd <= 0 && Math.random() < 0.012) {
    const babies = game.enemies.filter((x) => x.kind === "phosquito" && x.baby && x.hp > 0).length;
    if (babies < 2) {
      e.spawnCd = 160;
      const baby = makeFoe(cx, e.y - 20, "phosquito", "boss", 0, { baby: true });
      baby.hp = Math.max(10, Math.round(baby.hp * 0.85));
      baby.max = baby.hp;
      game.enemies.push(baby);
      emit(cx, e.y, { color: "#6ad0a8", count: 10, size: 3, up: 1.4 });
      showNotification("CRÍA", "Un phosquito nace del nido.", "sala");
    }
  }

  return afterMoveClamp(e, ROOM_W, ROOM_H, floorY);
}

function afterMoveClamp(e, ROOM_W, ROOM_H, floorY) {
  e.x = Math.max(40, Math.min(e.x, ROOM_W - e.w - 40));
  if (!e.airborne && e.y > floorY) e.y = floorY;
  e.y = Math.max(80, Math.min(e.y, ROOM_H - 90 - e.h));
}

function pickAttack(e, game, helpers) {
  const phase = e.phase;
  let roll = Math.random();
  let kind;
  if (phase === 1) {
    kind = roll < 0.55 ? "charge" : "spit";
  } else if (phase === 2) {
    if (roll < 0.35) kind = "swoop";
    else if (roll < 0.65) kind = "spit";
    else if (roll < 0.85) kind = "slam";
    else kind = "charge";
  } else {
    if (roll < 0.3) kind = "swoop";
    else if (roll < 0.55) kind = "slam";
    else if (roll < 0.78) kind = "spit";
    else kind = "charge";
  }
  startWindup(e, kind);
}

function startWindup(e, kind) {
  e.mode = "windup";
  e.teleKind = kind;
  e.telegraph = true;
  e.wind = 0;
  if (kind === "charge") e.windMax = 28;
  else if (kind === "slam") e.windMax = 34;
  else if (kind === "swoop") e.windMax = 32;
  else e.windMax = 22; // spit
  e.vx *= 0.4;
}

function beginAttack(e, game, helpers, emit) {
  const p = game.player;
  const cx = e.x + e.w / 2;
  const cy = e.y + e.h / 2;
  const kind = e.teleKind;
  const dmg = e.phase >= 3 ? 16 : 15;

  if (kind === "charge") {
    e.mode = "charge";
    e.chargeLeft = e.phase >= 3 ? 28 : 24;
    e.airborne = false;
    emit(cx, e.y + e.h, { color: "#ff3030", count: 10, size: 3, up: 0.8 });
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
    emit(cx, cy, { color: "#ff6080", count: 8, size: 3, up: 1 });
    return;
  }

  if (kind === "slam") {
    e.mode = "slam";
    e.slam = 1;
    e.airborne = true;
    emit(cx, cy, { color: "#ff8040", count: 8, size: 3.5, up: 1.5 });
    return;
  }

  // spit / abanico
  e.mode = "spit";
  e.spitLeft = 12;
  const aim = Math.sign((p.x + p.w / 2) - cx) || 1;
  const shots = e.phase === 1 ? (2 + (Math.random() < 0.5 ? 1 : 0)) : e.phase === 2 ? 5 : 5;
  const baseSpeed = e.phase >= 3 ? 5.2 : 4.4;
  for (let s = 0; s < shots; s++) {
    const spread = e.phase === 1
      ? (s - (shots - 1) / 2) * 1.35
      : (s - (shots - 1) / 2) * 1.55;
    game.projectiles.push({
      x: cx - 8,
      y: cy - 6,
      vx: aim * baseSpeed,
      vy: spread,
      w: 16,
      h: 12,
      life: 85,
      dmg,
      color: e.phase >= 3 ? "#ff4060" : "#ff5a6a",
      owner: "enemy",
    });
  }
  emit(cx + aim * 30, cy, { color: "#ff5a6a", count: 6, size: 2.8, up: 0.6 });
}

/**
 * Reina del Nido — Jefe final con 3 fases, avisos de ataque (telegraphs) y ataques patrones.
 * API: createBossNido() · updateBossNido(e, game, helpers)
 */

// Constantes globales para facilitar el balanceo del juego
const CONFIG = {
  MAX_HP: 1600,
  WIDTH: 110,
  HEIGHT: 130,
  FLOOR_OFFSET: 90, // Distancia del suelo respecto al borde inferior (ROOM_H)
  SPAWN_X: 740,
  SPAWN_Y: 680,
  PHASE_THRESHOLDS: {
    PHASE_2: 0.66,
    PHASE_3: 0.33,
  },
};

/**
 * Crea la entidad base del jefe "Reina del Nido" con sus propiedades iniciales.
 * @returns {object} Estado inicial del jefe.
 */
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
    mode: "idle", // Estados: "idle" | "windup" | "charge" | "swoop" | "slam" | "spit"
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
    spawnCd: 0,
    bob: 0,
    flash: 0,
    invuln: 0,
  };
}

/**
 * Bucle principal de actualización de la Reina del Nido.
 * 
 * @param {object} e - Entidad del jefe.
 * @param {object} game - Estado global del juego (jugador, efectos, proyectiles, etc.).
 * @param {object} helpers - Funciones auxiliares y datos de la sala.
 */
export function updateBossNido(e, game, helpers) {
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

  // --- 1. Secuencia de entrada (Intro) ---
  if (e.introT > 0) {
    handleIntro(e, game, helpers, cx, floorY);
    return;
  }
  e.intro = false;

  // --- 2. Transiciones de fase ---
  checkPhaseTransitions(e, game, helpers, cx, cy);

  // Determinar dirección en la que mira el jefe
  e.facing = Math.sign((p.x + p.w / 2) - cx) || e.facing || -1;
  e.bob = (e.bob || 0) + 1;

  // --- 3. Procesar onda expansiva (Slam residual) ---
  if (e.shockT > 0) {
    updateShockwave(e, p, ROOM_H, hurtPlayer);
  }

  if (e.spawnCd > 0) e.spawnCd--;

  // --- 4. Máquina de estados de comportamiento ---
  switch (e.mode) {
    case "windup":
      updateWindup(e, game, helpers, cx);
      break;

    case "charge":
      updateCharge(e, game);
      break;

    case "swoop":
      updateSwoop(e, game, floorY, cx, cy);
      break;

    case "slam":
      updateSlam(e, game, helpers, cx, floorY);
      break;

    case "spit":
      updateSpit(e);
      break;

    case "idle":
    default:
      updateIdle(e, game, helpers, cx, cy, reduceMotion, t);
      break;
  }

  // --- 5. Invocación de refuerzos (Fase 3) ---
  if (e.phase >= 3 && e.spawnCd <= 0 && Math.random() < 0.012) {
    spawnMinion(e, game, makeFoe, showNotification, cx, reduceMotion);
  }

  // --- 6. Aplicar física y límites del escenario ---
  applyBoundsAndClamp(e, ROOM_W, ROOM_H, floorY);
}

// ==========================================
// FUNCIONES AUXILIARES Y LÓGICA DE ESTADOS
// ==========================================

/** Emite partículas comprobando las opciones de accesibilidad */
function emitParticles(game, x, y, opts, reduceMotion) {
  if (!game?.fx?.emit) return;
  const count = opts.count || 8;
  game.fx.emit(x, y, {
    ...opts,
    count: reduceMotion ? Math.max(2, Math.floor(count / 3)) : count,
  });
}

/** Añade un efecto fantasma si existe la lista */
function addGhost(game, ghostData) {
  if (Array.isArray(game.ghosts)) {
    game.ghosts.push(ghostData);
  }
}

/** Reproducción segura de sonidos */
function safeBeep(beep, soundName) {
  if (typeof beep === "function") {
    try { beep(soundName); } catch (_) {}
  }
}

/** Restablece los contadores para prevenir bloqueos de animaciones al cambiar de fase */
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
  e.vx = (e.vx || 0) * 0.3;
}

/** Controla la caída inicial y rugido */
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

  if (e.introT === landAt) {
    game.shake = Math.max(game.shake || 0, reduceMotion ? 6 : 26);
    game.flash = Math.max(game.flash || 0, 10);
    emitParticles(game, cx, e.y + e.h, { color: "#c89070", count: 30, size: 6, up: 1.4, speed: 5 }, reduceMotion);
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
    if (showNotification) {
      showNotification("REINA DEL NIDO", "Mira el suelo. Espera el brillo rojo.", "sala");
    }
  }
}

/** Evalúa la vida actual del jefe y activa la Fase 2 o Fase 3 */
function checkPhaseTransitions(e, game, helpers, cx, cy) {
  const { reduceMotion, beep, showNotification } = helpers;
  const ratio = e.hp / Math.max(1, e.max);

  if (ratio <= CONFIG.PHASE_THRESHOLDS.PHASE_3 && e.phase < 3) {
    e.phase = 3;
    e.color = "#ff1040";
    e.contactDmg = 25;
    e.airborne = true;
    resetAttackState(e);
    e.attackCd = 40;

    if (!e.phaseAnnounced[3]) {
      e.phaseAnnounced[3] = true;
      game.flash = Math.max(game.flash || 0, 14);
      game.shake = Math.max(game.shake || 0, 20);
      emitParticles(game, cx, cy, { color: "#ff2040", count: 28, size: 5.5, up: 2.4, star: true }, reduceMotion);
      emitParticles(game, cx, cy, { color: "#ffe66a", count: 16, size: 3.5, up: 2, star: true }, reduceMotion);
      if (showNotification) showNotification("FASE FINAL", "El Nido enloquece.", "hurt");
      safeBeep(beep, "hurt");
    }
  } else if (ratio <= CONFIG.PHASE_THRESHOLDS.PHASE_2 && e.phase < 2) {
    e.phase = 2;
    e.color = "#ff2848";
    e.contactDmg = 23;
    e.airborne = true;
    resetAttackState(e);
    e.attackCd = 50;
    e.hoverY = 460;

    if (!e.phaseAnnounced[2]) {
      e.phaseAnnounced[2] = true;
      game.flash = Math.max(game.flash || 0, 12);
      game.shake = Math.max(game.shake || 0, 16);
      emitParticles(game, cx, cy, { color: "#ff2848", count: 24, size: 5, up: 2.2, star: true }, reduceMotion);
      if (showNotification) showNotification("FASE 2", "Despliega alas. Cuidado arriba.", "hurt");
      safeBeep(beep, "hurt");
    }
  }
}

/** Calcula el impacto de la onda de choque sobre el jugador */
function updateShockwave(e, p, ROOM_H, hurtPlayer) {
  e.shockT--;
  e.shockR += e.phase >= 3 ? 7 : 5;
  const px = p.x + p.w / 2;
  const nearGround = (p.y + p.h) > (ROOM_H - 140);
  const dist = Math.hypot(px - e.shockX, (p.y + p.h) - e.shockY);

  if (nearGround && dist < e.shockR && dist > (e.shockR - 28)) {
    if (typeof hurtPlayer === "function") {
      hurtPlayer(e.phase >= 3 ? 16 : 12, e.phase >= 3 ? "-16" : "-12");
    }
  }
}

/** Tiempo de preparación previa a la ejecución de cada ataque */
function updateWindup(e, game, helpers, cx) {
  const { t, reduceMotion } = helpers;
  e.vx *= 0.82;
  if (e.airborne) {
    e.vy = (e.hoverY - e.y) * 0.06;
  } else {
    e.vy = Math.min(e.vy, 0);
  }
  e.wind++;
  e.telegraph = true;

  if (e.teleKind === "charge" && t % 4 === 0) {
    emitParticles(game, cx + e.facing * 40, e.y + e.h, {
      color: "#ff4040", count: 3, size: 2.5, up: 0.4, speed: 1.6
    }, reduceMotion);
  }

  if (e.wind >= e.windMax) {
    e.telegraph = false;
    e.wind = 0;
    beginAttack(e, game, helpers);
  }
}

/** Estado de ataque: Carga horizontal rápida */
function updateCharge(e, game) {
  const t = game.t || 0;
  e.airborne = false;
  e.chargeLeft--;
  e.vx = e.facing * (e.phase >= 3 ? 9.5 : e.phase === 2 ? 8.2 : 7.2);
  e.vy = 0;

  if (t % 2 === 0) {
    addGhost(game, {
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
}

/** Estado de ataque: Caída en picado en ángulo */
function updateSwoop(e, game, floorY, cx, cy) {
  const t = game.t || 0;
  const reduceMotion = game.reduceMotion || false;
  e.airborne = true;
  e.swoopLeft--;

  if (e.swoopLeft < 10) {
    e.vx *= 0.9;
    e.vy *= 0.85;
  }

  if (t % 2 === 0) {
    addGhost(game, {
      x: e.x, y: e.y, w: e.w, h: e.h,
      life: 10,
      color: "#ff6080",
    });
    emitParticles(game, cx, cy + 20, { color: "#ff6a8a", count: 2, size: 2.2, up: 0.3, speed: 1.4 }, reduceMotion);
  }

  if (e.swoopLeft <= 0 || e.y >= floorY - 8) {
    e.mode = "idle";
    e.vx *= 0.4;
    e.vy = -2;
    e.attackCd = e.phase >= 3 ? 38 : 48;

    if (e.y >= floorY - 8) {
      e.y = floorY;
      game.shake = Math.max(game.shake || 0, 8);
      emitParticles(game, cx, e.y + e.h, { color: "#f84", count: 12, size: 3.5, up: 1.6 }, reduceMotion);
    }
  }
}

/** Estado de ataque: Salto y golpe contra el suelo */
function updateSlam(e, game, helpers, cx, floorY) {
  const { hurtPlayer, reduceMotion } = helpers;
  const p = game.player;
  e.airborne = true;

  if (e.slam === 1) {
    // Elevación
    e.vy = -11;
    e.vx *= 0.5;
    e.slam = 2;
    e.slamHang = 18;
  } else if (e.slam === 2) {
    // Suspensión aérea / Persecución horizontal
    e.slamHang--;
    e.vy = -0.2;
    e.vx = (p.x - e.x) * 0.04;
    if (e.slamHang <= 0) {
      e.slam = 3;
      e.vy = e.phase >= 3 ? 16 : 13;
      e.vx = 0;
    }
  } else if (e.slam === 3) {
    // Caída
    if (e.y >= floorY - 4) {
      e.y = floorY;
      e.vy = 0;
      e.mode = "idle";
      e.slam = 0;
      e.airborne = e.phase >= 2;
      e.attackCd = e.phase >= 3 ? 50 : 65;

      game.shake = Math.max(game.shake || 0, e.phase >= 3 ? 18 : 12);
      game.flash = Math.max(game.flash || 0, e.phase >= 3 ? 8 : 4);
      emitParticles(game, cx, e.y + e.h, { color: "#ff8040", count: 18, size: 4.5, up: 2.2 }, reduceMotion);

      if (e.phase >= 3 || Math.random() < 0.55) {
        e.shockT = 22;
        e.shockR = 40;
        e.shockX = cx;
        e.shockY = e.y + e.h;
      }

      // Daño por contacto directo en zona de impacto
      if (Math.abs((p.x + p.w / 2) - cx) < 150 && (p.y + p.h) > e.y) {
        if (typeof hurtPlayer === "function") {
          hurtPlayer(e.phase >= 3 ? 18 : 14, e.phase >= 3 ? "-18" : "-14");
        }
      }
    }
  }
}

/** Estado de ataque: Recuperación post-disparo */
function updateSpit(e) {
  e.vx *= 0.7;
  if (e.airborne) e.vy = (e.hoverY - e.y) * 0.05;
  e.spitLeft--;
  if (e.spitLeft <= 0) {
    e.mode = "idle";
    e.attackCd = e.phase >= 3 ? 40 : e.phase === 2 ? 50 : 60;
  }
}

/** Patrón de movimiento por defecto y temporización del siguiente ataque */
function updateIdle(e, game, helpers, cx, cy, reduceMotion, t) {
  const p = game.player;

  if (e.phase === 1) {
    e.airborne = false;
    const aggro = 0.08;
    e.vx += Math.sign((p.x - e.x) || 1) * aggro;
    e.vx = Math.max(-3.2, Math.min(3.2, e.vx));
    if (t % 100 === 0 && Math.abs(e.vy) < 0.5) e.vy = -6.5;
  } else {
    e.airborne = true;
    const targetY = e.hoverY + Math.sin(e.bob * 0.08) * 28;
    e.vy = (targetY - e.y) * 0.08;
    e.vx += Math.sign((p.x - e.x) || 1) * (e.phase >= 3 ? 0.14 : 0.1);
    e.vx = Math.max(-4.8, Math.min(4.8, e.vx));

    if (e.phase >= 2 && t % 3 === 0) {
      addGhost(game, {
        x: e.x, y: e.y, w: e.w, h: e.h,
        life: 7,
        color: e.phase >= 3 ? "#ff1040" : "#ff4868",
      });
    }
  }

  if (e.phase >= 3 && !reduceMotion && t % 8 === 0) {
    emitParticles(game, cx + (Math.random() - 0.5) * 60, cy, {
      color: "#ffe66a", count: 2, size: 2, up: 1.2, star: true
    }, reduceMotion);
  }

  e.attackCd--;
  if (e.attackCd <= 0) {
    pickAttack(e);
  }
}

/** Selección aleatoria ponderada de ataques según la fase */
function pickAttack(e) {
  const roll = Math.random();
  let kind = "charge";

  if (e.phase === 1) {
    kind = roll < 0.55 ? "charge" : "spit";
  } else if (e.phase === 2) {
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

/** Asigna los parámetros de inicio de anticipación */
function startWindup(e, kind) {
  e.mode = "windup";
  e.teleKind = kind;
  e.telegraph = true;
  e.wind = 0;

  const windupDurations = {
    charge: 28,
    slam: 34,
    swoop: 32,
    spit: 22,
  };

  e.windMax = windupDurations[kind] || 22;
  e.vx *= 0.4;
}

/** Ejecuta los efectos iniciales e instanciación del ataque */
function beginAttack(e, game, helpers) {
  const { reduceMotion } = helpers;
  const p = game.player;
  const cx = e.x + e.w / 2;
  const cy = e.y + e.h / 2;
  const kind = e.teleKind;
  const dmg = e.phase >= 3 ? 16 : 15;

  if (kind === "charge") {
    e.mode = "charge";
    e.chargeLeft = e.phase >= 3 ? 28 : 24;
    e.airborne = false;
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

  // Generación de disparos múltiples (Spit)
  e.mode = "spit";
  e.spitLeft = 12;
  const aim = Math.sign((p.x + p.w / 2) - cx) || 1;
  const shots = e.phase === 1 ? (2 + (Math.random() < 0.5 ? 1 : 0)) : 5;
  const baseSpeed = e.phase >= 3 ? 5.2 : 4.4;

  if (Array.isArray(game.projectiles)) {
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
  }
  emitParticles(game, cx + aim * 30, cy, { color: "#ff5a6a", count: 6, size: 2.8, up: 0.6 }, reduceMotion);
}

/** Manejo del spawn de enemigos adicionales durante la Fase 3 */
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
      if (showNotification) {
        showNotification("CRÍA", "Un phosquito nace del nido.", "sala");
      }
    }
  }
}

/** Restringe las coordenadas de la entidad a los límites transitables de la habitación */
function applyBoundsAndClamp(e, ROOM_W, ROOM_H, floorY) {
  e.x = Math.max(40, Math.min(e.x, ROOM_W - e.w - 40));
  if (!e.airborne && e.y > floorY) {
    e.y = floorY;
  }
  e.y = Math.max(80, Math.min(e.y, ROOM_H - CONFIG.FLOOR_OFFSET - e.h));
}

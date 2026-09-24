// ============================================================================
// FOES · fábrica. Un kind = un return. game.js solo importa.
// HP escala con `hard` de la sala. Fallback: cucaracho.
// ============================================================================

export const ROOM_HARD = { hub: 0, beach: 1, cave: 1, ridge: 1, lab: 2, space: 2, jungle: 2, volcano: 3, reef: 2 };

export function isAirFoe(e) {
  return e.kind === "phosquito" || e.kind === "mosquito" || e.kind === "medusa"
    || e.kind === "pez" || e.kind === "libelula" || e.kind === "avispa" || e.kind === "abeja"
    || e.kind === "anguila" || e.kind === "gaviota" || e.kind === "murcielago"
    || e.kind === "brasita" || e.kind === "ufo"
    || (e.boss && e.airborne);
}

export function applyElite(e) {
  if (!e || e.elite) return e;
  e.elite = true;
  e.hp = Math.round(e.hp * 1.75);
  e.max = e.hp;
  e.w = Math.round(e.w * 1.1);
  e.h = Math.round(e.h * 1.1);
  // Tint saturado / dorado para que se note en juego
  e.color = e.color || "#ffd24a";
  e.eliteTint = "#ffd24a";
  return e;
}

export function makeFoe(x, y, kind, roomId, i, opts) {
  const hard = ROOM_HARD[roomId] || 1;
  const baby = !!(opts && opts.baby);
  if (kind === "phosquito") {
    const hp = baby ? 14 : 24 + hard * 14;
    return {
      x, y: 620 + (i % 3) * 24, w: baby ? 22 : 32, h: baby ? 18 : 26,
      vx: (i % 2 ? 1 : -1) * (1.8 + hard * 0.28),
      vy: -0.6, hp, max: hp, kind, color: "#6ad0a8",
      boss: false, shoot: 0, canSplit: !baby && hard >= 1 && Math.random() < 0.55, split: false, baby,
      diveCd: 50 + i * 10, diving: false, telegraph: false,
    };
  }
  if (kind === "mosquito") {
    const hp = baby ? 12 : 18 + hard * 10;
    const spawnY = Math.max(400, Math.min(520, (y || 460) + (i % 3) * 20));
    return {
      x, y: spawnY, w: baby ? 28 : 40, h: baby ? 22 : 34,
      vx: (i % 2 ? 1 : -1) * (2.4 + hard * 0.35),
      vy: -0.8, hp, max: hp, kind: "mosquito", color: "#ff6a4a",
      boss: false, shoot: 0, baby, diveCd: 40 + i * 12, diving: false, telegraph: false, spiral: 0,
    };
  }
  if (kind === "libelula") {
    const hp = 16 + hard * 8;
    const spawnY = Math.max(400, Math.min(520, (y || 460) + (i % 3) * 24));
    return {
      x, y: spawnY, w: 40, h: 42,
      vx: (i % 2 ? 1 : -1) * (2.2 + hard * 0.3),
      vy: -0.4, hp, max: hp, kind: "libelula", color: "#4aba7a",
      boss: false, shoot: 0, dart: 40 + i * 15, bob: Math.random() * 6.28,
      telegraph: false, wind: 0, darting: false, baseY: spawnY,
    };
  }
  if (kind === "abeja" || kind === "avispa") {
    const hp = 28 + hard * 12;
    const spawnY = Math.max(400, Math.min(520, (y || 460) + (i % 2) * 28));
    return {
      x, y: spawnY, w: 42, h: 48,
      vx: (i % 2 ? 1 : -1) * 1.4, vy: 0, hp, max: hp, kind: "abeja", color: "#f0c020",
      boss: false, shoot: 0, telegraph: false, wind: 0, diving: 0, charging: 0, cd: 40 + i * 18,
      bob: Math.random() * 6.28, baseY: spawnY,
    };
  }
  if (kind === "pez") {
    const hp = 22 + hard * 10;
    const by = Math.max(280, Math.min(560, y || 380));
    return {
      x, y: by, w: 28, h: 18,
      vx: (i % 2 ? 1 : -1) * (1.1 + hard * 0.2),
      vy: 0, hp, max: hp, kind: "pez", color: "#3aa8d8",
      boss: false, shoot: 0, bob: Math.random() * 6.28, baseY: by,
      dashSwim: 0, dashCd: 50 + i * 20,
    };
  }
  if (kind === "planta") {
    const hp = 36 + hard * 18;
    return {
      x, y, w: 34, h: 48, vx: 0, vy: 0, hp, max: hp, kind, color: "#e23b3d",
      boss: false, shoot: 0, rooted: true, up: true, hide: 40 + i * 20, plant: true,
    };
  }
  if (kind === "medusa") {
    const hp = baby ? 20 : 32 + hard * 12;
    return {
      x, y: y || 340, w: 30, h: 34, vx: (i % 2 ? 1 : -1) * 0.5, vy: 0,
      hp, max: hp, kind: "medusa", color: "#ff8ad0",
      boss: false, shoot: 0, bob: Math.random() * 6.28, baseY: (y || 340), dropsOrb: true,
      zapCd: 60 + i * 25, pulsezap: 0, telegraph: false,
    };
  }
  if (kind === "anguila") {
    const hp = 28 + hard * 12;
    const by = Math.max(280, Math.min(560, y || 380));
    return {
      x, y: by, w: 48, h: 18,
      vx: (i % 2 ? 1 : -1) * (1.0 + hard * 0.18),
      vy: 0, hp, max: hp, kind: "anguila", color: "#40e0d0",
      boss: false, shoot: 0, bob: Math.random() * 6.28, baseY: by,
      zapCd: 70 + i * 22, pulsezap: 0, telegraph: false,
    };
  }
  if (kind === "rana") {
    const hp = 24 + hard * 12;
    return {
      x, y, w: 34, h: 28,
      vx: 0, vy: 0, hp, max: hp, kind: "rana", color: "#4caf50",
      boss: false, shoot: 0, hopCd: 35 + i * 12, sitting: 0, hopWind: 0, telegraph: false,
    };
  }
  if (kind === "cangrejo") {
    const hp = 30 + hard * 14;
    return {
      x, y, w: 36, h: 24,
      vx: (i % 2 ? 1 : -1) * (1.5 + hard * 0.25),
      vy: 0, hp, max: hp, kind: "cangrejo", color: "#e07040",
      boss: false, shoot: 0, claws: false, clawCd: 40 + i * 10, clawWind: 0, clawSnap: 0, telegraph: false,
    };
  }
  if (kind === "gaviota") {
    const hp = 22 + hard * 10;
    const spawnY = Math.max(280, Math.min(480, (y || 360) + (i % 3) * 20));
    return {
      x, y: spawnY, w: 40, h: 28,
      vx: (i % 2 ? 1 : -1) * (1.8 + hard * 0.25),
      vy: -0.3, hp, max: hp, kind: "gaviota", color: "#f0f4f8",
      boss: false, shoot: 0, diveCd: 55 + i * 14, diving: false, telegraph: false,
      bob: Math.random() * 6.28, baseY: spawnY, wind: 0,
    };
  }
  if (kind === "murcielago") {
    const hp = 20 + hard * 10;
    const spawnY = Math.max(220, Math.min(420, (y || 280) + (i % 3) * 24));
    return {
      x, y: spawnY, w: 34, h: 26,
      vx: (i % 2 ? 1 : -1) * (1.6 + hard * 0.28),
      vy: -0.4, hp, max: hp, kind: "murcielago", color: "#4a3060",
      boss: false, shoot: 0, diveCd: 60 + i * 16, diving: false, telegraph: false,
      bob: Math.random() * 6.28, baseY: spawnY, wind: 0,
    };
  }
  if (kind === "arana") {
    const hp = 26 + hard * 12;
    return {
      x, y, w: 30, h: 22,
      vx: (i % 2 ? 1 : -1) * (1.2 + hard * 0.22),
      vy: 0, hp, max: hp, kind: "arana", color: "#2a1a18",
      boss: false, shoot: 0, dropCd: 90 + i * 20, dropping: false, telegraph: false,
    };
  }
  if (kind === "brasita") {
    const hp = 18 + hard * 8;
    const spawnY = Math.max(260, Math.min(520, (y || 360) + (i % 3) * 28));
    return {
      x, y: spawnY, w: 22, h: 22,
      vx: (i % 2 ? 1 : -1) * 0.9, vy: 0, hp, max: hp, kind: "brasita", color: "#ff6a20",
      boss: false, shoot: 0, bob: Math.random() * 6.28, baseY: spawnY, telegraph: false,
    };
  }
  if (kind === "escoria") {
    const hp = 34 + hard * 16;
    return {
      x, y, w: 32, h: 20,
      vx: (i % 2 ? 1 : -1) * (0.7 + hard * 0.15),
      vy: 0, hp, max: hp, kind: "escoria", color: "#c04010",
      boss: false, shoot: 0, telegraph: false,
    };
  }
  if (kind === "ufo") {
    const hp = 30 + hard * 12;
    const spawnY = Math.max(220, Math.min(480, (y || 280) + (i % 2) * 30));
    return {
      x, y: spawnY, w: 36, h: 22,
      vx: (i % 2 ? 1 : -1) * 0.8, vy: 0, hp, max: hp, kind: "ufo", color: "#7ee7ff",
      boss: false, shoot: 0, shootCd: 40 + i * 20, bob: Math.random() * 6.28, baseY: spawnY, telegraph: false,
    };
  }
  const hp = baby ? 16 : 26 + hard * 16;
  return {
    x, y, w: baby ? 22 : 30, h: baby ? 14 : 18,
    vx: (i % 2 ? 1 : -1) * (1.35 + hard * 0.3),
    vy: 0, hp, max: hp, kind: "cucaracho", color: "#6a3a12",
    boss: false, shoot: 0, evo: 0, baby,
    lungeCd: 70 + i * 15, lunge: 0, diveCd: 60, diving: false, telegraph: false, invuln: 0,
  };
}


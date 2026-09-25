
// Objetos mágicos de OHANA.
//
// Responsabilidades:
// - Generar 1–2 objetos deterministas por sala.
// - Recogerlos por proximidad.
// - Aplicar efectos temporales sin acoplarse al loop principal.
// - Pintar objetos, efectos y HUD.
// - Persistir/restaurar únicamente el estado necesario.
//
// API pública mantenida para game.js:
//   Magic.onRoom(game, roomId)
//   Magic.update(game)
//   Magic.draw(ctx, game, t)
//   Magic.onHurt(game, amount)
//   Magic.reset(game)
//   Magic.snapshot()
//   Magic.restore(snap)

import { showNotification } from "./notify.js";
import { sfx } from "../engine/audio.js";
import { ROOMS, ROOM_W } from "./map.js";

const TAU = Math.PI * 2;
const FPS = 60;

const CFG = Object.freeze({
  pickupRadius: 34,
  spawnAvoidX: 190,
  spawnAvoidY: 220,
  itemGapX: 140,
  itemGapY: 80,
  candidateMinWidth: 72,
  candidateMinY: 120,
  candidateMaxY: 860,
  placementTries: 32,
  magnetRadius: 520,
  magnetMinSpeed: 2.5,
  magnetMaxSpeed: 7.5,
  starHitCooldown: 18,
  shellIframes: 40,
  hudRefreshEvery: 8,
  itemCullMargin: 80,
});

const DEFS = Object.freeze({
  shell: Object.freeze({
    id: "shell",
    name: "Concha de Hoku",
    desc: "Burbuja: bloquea 3 golpes",
    color: "#7fe8ff",
    glow: "#bff6ff",
    hits: 3,
  }),

  feather: Object.freeze({
    id: "feather",
    name: "Pluma del Viento",
    desc: "+1 salto y caída suave · 20 s",
    color: "#b8f5c8",
    glow: "#eaffef",
    dur: 20 * FPS,
  }),

  hourglass: Object.freeze({
    id: "hourglass",
    name: "Reloj de Arena",
    desc: "Enemigos a cámara lenta · 10 s",
    color: "#ffd27a",
    glow: "#fff0c4",
    dur: 10 * FPS,
  }),

  magnet: Object.freeze({
    id: "magnet",
    name: "Imán de Cristal",
    desc: "Atrae los orbes · 25 s",
    color: "#ff7ad9",
    glow: "#ffd0f3",
    dur: 25 * FPS,
  }),

  star: Object.freeze({
    id: "star",
    name: "Estrella Ohana",
    desc: "Invencible y dañas al tocar · 8 s",
    color: "#ffe66a",
    glow: "#fffbd0",
    dur: 8 * FPS,
  }),

  fruit: Object.freeze({
    id: "fruit",
    name: "Fruta Dorada",
    desc: "Vida completa + 20 XP",
    color: "#ffb43a",
    glow: "#fff0b0",
  }),
});

const KINDS = Object.freeze([
  "shell",
  "feather",
  "hourglass",
  "magnet",
  "star",
  "fruit",
]);

const TIMED_KINDS = Object.freeze([
  "feather",
  "hourglass",
  "magnet",
  "star",
]);

// Estado del módulo.
let items = [];
let fx = Object.create(null);
let shellCrack = 0;
let featherBase = null;
let featherPlayer = null;
let featherEvo = null;

let lastGame = null;
let lastPlayer = null;
let frame = 0;

let hudEl = null;
let hudSig = "";
let resizeHooked = false;

const iconCache = Object.create(null);

// ---------- utilidades ----------

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function finite(n, fallback = 0) {
  return Number.isFinite(Number(n)) ? Number(n) : fallback;
}

function hash(str) {
  let h = 2166136261;
  const s = String(str ?? "");

  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }

  return h >>> 0;
}

function rng(seed) {
  let s = (seed >>> 0) || 1;

  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function playerCenter(p) {
  return {
    x: p.x + (p.w || 0) * 0.5,
    y: p.y + (p.h || 0) * 0.5,
  };
}

function emit(game, x, y, opts) {
  try {
    game?.fx?.emit?.(x, y, opts);
  } catch {
    /* FX no disponible */
  }
}

function numberPopup(game, x, y, text, color, crit = false) {
  try {
    game?.nums?.add?.(x, y, String(text), color, crit);
  } catch {
    /* HUD opcional */
  }
}

function play(n) {
  try {
    const btn = document.getElementById("btn-mute");

    if (btn && /^Mute/i.test(btn.textContent || "")) return;

    sfx(n);
  } catch {
    /* Audio no disponible */
  }
}

function roomScale(game) {
  if (!(ROOM_W > 0)) return 1;

  const w = finite(game?.worldW, ROOM_W);
  return w / ROOM_W || 1;
}

function portalRects(game, room) {
  const scale = roomScale(game);

  return (room?.portals || []).map((pt) => ({
    x: finite(pt.x) * scale,
    y: finite(pt.y) * scale,
    w: finite(pt.w) * scale,
    h: finite(pt.h) * scale,
  }));
}

function circleRectDistanceSq(x, y, rect) {
  const qx = clamp(x, rect.x, rect.x + rect.w);
  const qy = clamp(y, rect.y, rect.y + rect.h);

  const dx = x - qx;
  const dy = y - qy;

  return dx * dx + dy * dy;
}

// ---------- colocación ----------

function spotFree(game, room, x, y, radius = 18) {
  const platforms = Array.isArray(game?.platforms)
    ? game.platforms
    : [];

  for (const pl of platforms) {
    if (!pl) continue;

    const r = {
      x: finite(pl.x),
      y: finite(pl.y),
      w: finite(pl.w),
      h: finite(pl.h),
    };

    if (circleRectDistanceSq(x, y, r) < radius * radius) {
      return false;
    }
  }

  for (const pt of portalRects(game, room)) {
    const expanded = {
      x: pt.x - 42,
      y: pt.y - 72,
      w: pt.w + 84,
      h: pt.h + 114,
    };

    if (circleRectDistanceSq(x, y, expanded) < radius * radius) {
      return false;
    }
  }

  return true;
}

function chooseKinds(roomId) {
  const h = hash(roomId);
  const rooms = Object.keys(ROOMS).sort();

  let idx = rooms.indexOf(String(roomId));

  if (idx < 0) {
    idx = h % KINDS.length;
  }

  const kinds = [];

  const primary =
    KINDS[(idx + (h % KINDS.length)) % KINDS.length];

  if (roomId === "boss") {
    kinds.push("shell");
  }

  if (!kinds.includes(primary)) {
    kinds.push(primary);
  }

  const wantsSecond =
    roomId === "boss" ||
    h % 3 === 0;

  if (wantsSecond) {
    const offsets = [3, 4, 2, 1, 5];

    for (const off of offsets) {
      const candidate =
        KINDS[
          (idx + (h % KINDS.length) + off) %
          KINDS.length
        ];

      if (!kinds.includes(candidate)) {
        kinds.push(candidate);
        break;
      }
    }
  }

  return kinds.slice(0, 2);
}

function candidatePlatforms(game) {
  const worldH = finite(game?.worldH, 1000);

  const minY = CFG.candidateMinY;
  const maxY = Math.min(
    CFG.candidateMaxY,
    worldH - 120,
  );

  return (game?.platforms || []).filter((pl) => (
    pl &&
    finite(pl.w) >= CFG.candidateMinWidth &&
    finite(pl.y) >= minY &&
    finite(pl.y) <= maxY
  ));
}

function placeItems(game, roomId) {
  const room = ROOMS[roomId] || {};
  const p = game?.player;

  const spawn = p
    ? playerCenter(p)
    : { x: -9999, y: -9999 };

  const worldW = finite(game?.worldW, ROOM_W);
  const rand = rng(hash(String(roomId)));
  const candidates = candidatePlatforms(game);
  const kinds = chooseKinds(roomId);

  const out = [];
  const used = [];

  for (const kind of kinds) {
    let spot = null;

    for (
      let tries = 0;
      tries < CFG.placementTries && !spot;
      tries++
    ) {
      if (!candidates.length) break;

      const pl =
        candidates[Math.floor(rand() * candidates.length)];

      const x =
        pl.x +
        24 +
        rand() * Math.max(1, pl.w - 48);

      const y = pl.y - 30;

      if (x < 110 || x > worldW - 110) {
        continue;
      }

      if (
        Math.abs(x - spawn.x) < CFG.spawnAvoidX &&
        Math.abs(y - spawn.y) < CFG.spawnAvoidY
      ) {
        continue;
      }

      if (
        used.some(
          (u) =>
            Math.abs(u.x - x) < CFG.itemGapX &&
            Math.abs(u.y - y) < CFG.itemGapY,
        )
      ) {
        continue;
      }

      if (!spotFree(game, room, x, y, 18)) {
        continue;
      }

      spot = { x, y };
    }

    // Fallback determinista.
    if (!spot && candidates.length) {
      const ranked = candidates
        .map((pl) => {
          const x = pl.x + pl.w * 0.5;
          const y = pl.y - 30;

          const spawnDist = Math.hypot(
            x - spawn.x,
            y - spawn.y,
          );

          const usedPenalty = used.some(
            (u) =>
              Math.abs(u.x - x) < CFG.itemGapX &&
              Math.abs(u.y - y) < CFG.itemGapY,
          )
            ? 100000
            : 0;

          return {
            pl,
            x,
            y,
            score:
              pl.w +
              spawnDist * 0.08 -
              usedPenalty,
          };
        })
        .sort((a, b) => b.score - a.score);

      for (const c of ranked) {
        if (c.x < 110 || c.x > worldW - 110) {
          continue;
        }

        if (!spotFree(game, room, c.x, c.y, 18)) {
          continue;
        }

        spot = {
          x: c.x,
          y: c.y,
        };

        break;
      }
    }

    if (!spot) continue;

    used.push(spot);

    out.push({
      kind,
      x: spot.x,
      y: spot.y,
      taken: false,
      phase: rand() * TAU,
      born: frame,
    });
  }

  return out;
}

// ---------- efectos ----------

function feathered(p) {
  if (!p) return;

  if (featherPlayer !== p) {
    featherPlayer = p;
    featherBase = null;
    featherEvo = null;
  }

  if (
    featherBase == null ||
    featherEvo !== p.evo
  ) {
    featherBase =
      Math.max(0, finite(p.maxJumps, 0) - 1);

    featherEvo = p.evo;
  }

  p.maxJumps = featherBase + 1;
}

function unfeather(p) {
  if (!p) {
    featherBase = null;
    featherPlayer = null;
    featherEvo = null;
    return;
  }

  if (
    featherPlayer === p &&
    featherBase != null
  ) {
    p.maxJumps = Math.max(
      0,
      finite(
        p.maxJumps,
        featherBase + 1,
      ) - 1,
    );
  }

  featherBase = null;
  featherPlayer = null;
  featherEvo = null;
}

function activeDuration(kind) {
  return DEFS[kind]?.dur || 0;
}

function apply(game, kind, x, y) {
  const p = game?.player;
  const d = DEFS[kind];

  if (!p || !d) return false;

  if (kind === "shell") {
    fx.shell = d.hits;
    shellCrack = 0;
  } else if (kind === "fruit") {
    p.health = p.maxHealth;

    p.xp =
      Math.max(0, finite(p.xp, 0)) + 20;

    numberPopup(
      game,
      p.x,
      p.y - 16,
      "+20 XP",
      "#ffe66a",
    );

    numberPopup(
      game,
      p.x,
      p.y - 34,
      "VIDA MAX",
      "#7dff9a",
    );
  } else if (TIMED_KINDS.includes(kind)) {
    fx[kind] = d.dur;

    if (kind === "feather") {
      feathered(p);
    }

    if (kind === "hourglass") {
      game.enemySlow = d.dur;
    }
  } else {
    return false;
  }

  const cx =
    x == null
      ? p.x + (p.w || 0) * 0.5
      : x;

  const cy =
    y == null
      ? p.y + (p.h || 0) * 0.5
      : y;

  emit(game, cx, cy, {
    color: d.color,
    count: 26,
    size: 4.5,
    up: 2.2,
    speed: 3.6,
  });

  emit(game, cx, cy, {
    color: "#fff",
    count: 12,
    size: 3,
    up: 2.6,
    speed: 4,
    star: true,
  });

  numberPopup(
    game,
    cx,
    cy - 20,
    d.name,
    d.color,
  );

  try {
    showNotification(
      d.name.toUpperCase(),
      d.desc,
    );
  } catch {
    /* HUD opcional */
  }

  play(
    kind === "fruit"
      ? "heal"
      : "magic",
  );

  hudSig = "";

  return true;
}

function clearAll(game) {
  unfeather(lastPlayer);

  fx = Object.create(null);
  shellCrack = 0;

  if (game) {
    game.enemySlow = 0;
  }

  hudSig = "";

  renderHud(true);
}

function starHits(game, p) {
  const pad = 7;

  const bx = p.x - pad;
  const by = p.y - pad;

  const bw = p.w + pad * 2;
  const bh = p.h + pad * 2;

  const evo = clamp(
    Math.trunc(
      finite(p.evo, 0),
    ),
    0,
    4,
  );

  for (const e of game.enemies || []) {
    if (
      !e ||
      e.dying ||
      e.invuln > 0 ||
      !(e.hp > 0)
    ) {
      continue;
    }

    if (
      bx + bw < e.x ||
      bx > e.x + e.w ||
      by + bh < e.y ||
      by > e.y + e.h
    ) {
      continue;
    }

    if (
      e._magicHit &&
      frame - e._magicHit <
        CFG.starHitCooldown
    ) {
      continue;
    }

    e._magicHit = frame;

    let dmg = 30 + evo * 8;

    if (e.boss) {
      dmg = Math.ceil(dmg * 0.35);
    }

    e.hp -= dmg;

    const playerMid =
      p.x + p.w * 0.5;

    const enemyMid =
      e.x + e.w * 0.5;

    const dir =
      enemyMid >= playerMid
        ? 1
        : -1;

    e.vx =
      (e.boss ? 3 : 11) *
      dir;

    e.vy = Math.min(
      e.vy || 0,
      e.boss ? -1.5 : -5,
    );

    e.stun = Math.max(
      e.stun || 0,
      e.boss ? 8 : 22,
    );

    e.flash = Math.max(
      e.flash || 0,
      16,
    );

    numberPopup(
      game,
      e.x,
      e.y,
      dmg,
      "#ffe66a",
      dmg >= 45,
    );

    emit(
      game,
      e.x + e.w * 0.5,
      e.y + e.h * 0.5,
      {
        color: "#ffe66a",
        count: 10,
        size: 3.5,
        speed: 3.4,
        star: true,
      },
    );

    game.shake = Math.min(
      14,
      (game.shake || 0) + 3,
    );

    play("hit");
  }
}

// ---------- dibujo vectorial ----------

function starPath(
  ctx,
  cx,
  cy,
  r1,
  r2,
  n,
  rot,
) {
  ctx.beginPath();

  for (
    let i = 0;
    i < n * 2;
    i++
  ) {
    const r =
      i & 1
        ? r2
        : r1;

    const a =
      rot +
      (i * Math.PI) / n -
      Math.PI / 2;

    ctx.lineTo(
      cx + Math.cos(a) * r,
      cy + Math.sin(a) * r,
    );
  }

  ctx.closePath();
}

// Dibuja el icono centrado en (0,0).
function drawIcon(ctx, kind, t) {
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  const ol =
    "rgba(20,16,40,.85)";

  if (kind === "shell") {
    const g =
      ctx.createLinearGradient(
        0,
        -13,
        0,
        12,
      );

    g.addColorStop(
      0,
      "#e9fdff",
    );

    g.addColorStop(
      0.55,
      "#7fe0f5",
    );

    g.addColorStop(
      1,
      "#3a8fd0",
    );

    ctx.beginPath();

    ctx.moveTo(
      0,
      12,
    );

    ctx.bezierCurveTo(
      -18,
      6,
      -16,
      -12,
      0,
      -13,
    );

    ctx.bezierCurveTo(
      16,
      -12,
      18,
      6,
      0,
      12,
    );

    ctx.fillStyle = g;
    ctx.fill();

    ctx.strokeStyle = ol;
    ctx.lineWidth = 2.2;
    ctx.stroke();

    ctx.strokeStyle =
      "rgba(255,255,255,.75)";

    ctx.lineWidth = 1.4;

    for (
      let i = -2;
      i <= 2;
      i++
    ) {
      ctx.beginPath();

      ctx.moveTo(
        0,
        10,
      );

      ctx.quadraticCurveTo(
        i * 5,
        -2,
        i * 5.5,
        -11 +
          Math.abs(i) * 1.5,
      );

      ctx.stroke();
    }

    ctx.beginPath();

    ctx.moveTo(
      -5,
      11,
    );

    ctx.lineTo(
      0,
      15,
    );

    ctx.lineTo(
      5,
      11,
    );

    ctx.fillStyle =
      "#3a8fd0";

    ctx.fill();

    ctx.strokeStyle = ol;
    ctx.lineWidth = 1.6;
    ctx.stroke();

  } else if (kind === "feather") {

    ctx.save();
    ctx.rotate(-0.55);

    const g =
      ctx.createLinearGradient(
        -6,
        0,
        6,
        0,
      );

    g.addColorStop(
      0,
      "#8ce8a8",
    );

    g.addColorStop(
      0.5,
      "#f2fff5",
    );

    g.addColorStop(
      1,
      "#6fd4c6",
    );

    ctx.beginPath();

    ctx.moveTo(
      0,
      -15,
    );

    ctx.bezierCurveTo(
      10,
      -8,
      9,
      6,
      0,
      13,
    );

    ctx.bezierCurveTo(
      -9,
      6,
      -10,
      -8,
      0,
      -15,
    );

    ctx.fillStyle = g;
    ctx.fill();

    ctx.strokeStyle = ol;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle =
      "rgba(40,110,90,.7)";

    ctx.lineWidth = 1;

    for (
      let i = -10;
      i < 10;
      i += 4
    ) {
      ctx.beginPath();

      ctx.moveTo(
        0,
        i,
      );

      ctx.lineTo(
        -6,
        i - 4,
      );

      ctx.moveTo(
        0,
        i,
      );

      ctx.lineTo(
        6,
        i - 4,
      );

      ctx.stroke();
    }

    ctx.strokeStyle = ol;
    ctx.lineWidth = 1.8;

    ctx.beginPath();

    ctx.moveTo(
      0,
      -12,
    );

    ctx.lineTo(
      0,
      17,
    );

    ctx.stroke();

    ctx.restore();

  } else if (kind === "hourglass") {

    ctx.fillStyle =
      "#8a5a2b";

    ctx.strokeStyle = ol;
    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.roundRect(
      -11,
      -15,
      22,
      4,
      2,
    );

    ctx.fill();
    ctx.stroke();

    ctx.beginPath();

    ctx.roundRect(
      -11,
      11,
      22,
      4,
      2,
    );

    ctx.fill();
    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(
      -8,
      -11,
    );

    ctx.lineTo(
      8,
      -11,
    );

    ctx.quadraticCurveTo(
      8,
      -3,
      1.5,
      0,
    );

    ctx.quadraticCurveTo(
      8,
      3,
      8,
      11,
    );

    ctx.lineTo(
      -8,
      11,
    );

    ctx.quadraticCurveTo(
      -8,
      3,
      -1.5,
      0,
    );

    ctx.quadraticCurveTo(
      -8,
      -3,
      -8,
      -11,
    );

    ctx.closePath();

    ctx.fillStyle =
      "rgba(200,235,255,.55)";

    ctx.fill();
    ctx.stroke();

    const k =
      (t * 0.01) % 1;

    ctx.fillStyle =
      "#ffcf5a";

    ctx.beginPath();

    ctx.moveTo(
      -6 + k * 4,
      -8 + k * 6,
    );

    ctx.lineTo(
      6 - k * 4,
      -8 + k * 6,
    );

    ctx.lineTo(
      0,
      -1,
    );

    ctx.fill();

    ctx.beginPath();

    ctx.moveTo(
      -7,
      10,
    );

    ctx.lineTo(
      7,
      10,
    );

    ctx.lineTo(
      0,
      10 - 2 - k * 6,
    );

    ctx.fill();

    ctx.fillRect(
      -0.6,
      -1,
      1.2,
      10,
    );

  } else if (kind === "magnet") {

    const g =
      ctx.createLinearGradient(
        -12,
        -12,
        12,
        12,
      );

    g.addColorStop(
      0,
      "#ffd6f4",
    );

    g.addColorStop(
      0.5,
      "#ff7ad9",
    );

    g.addColorStop(
      1,
      "#9a4cff",
    );

    ctx.beginPath();

    ctx.moveTo(
      -12,
      12,
    );

    ctx.lineTo(
      -12,
      -1,
    );

    ctx.arc(
      0,
      -1,
      12,
      Math.PI,
      0,
    );

    ctx.lineTo(
      12,
      12,
    );

    ctx.lineTo(
      5,
      12,
    );

    ctx.lineTo(
      5,
      -1,
    );

    ctx.arc(
      0,
      -1,
      5,
      0,
      Math.PI,
      true,
    );

    ctx.lineTo(
      -5,
      12,
    );

    ctx.closePath();

    ctx.fillStyle = g;
    ctx.fill();

    ctx.strokeStyle = ol;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle =
      "#e8f6ff";

    ctx.fillRect(
      -12,
      7,
      7,
      5,
    );

    ctx.fillRect(
      5,
      7,
      7,
      5,
    );

    ctx.strokeRect(
      -12,
      7,
      7,
      5,
    );

    ctx.strokeRect(
      5,
      7,
      7,
      5,
    );

    ctx.strokeStyle =
      "rgba(255,255,255,.8)";

    ctx.lineWidth = 1.5;

    ctx.beginPath();

    ctx.arc(
      0,
      -1,
      9,
      Math.PI * 1.1,
      Math.PI * 1.45,
    );

    ctx.stroke();

  } else if (kind === "star") {

    const g =
      ctx.createRadialGradient(
        -3,
        -4,
        1,
        0,
        0,
        15,
      );

    g.addColorStop(
      0,
      "#fffef0",
    );

    g.addColorStop(
      0.5,
      "#ffe66a",
    );

    g.addColorStop(
      1,
      "#ff9f2a",
    );

    starPath(
      ctx,
      0,
      0,
      15,
      6.5,
      5,
      Math.sin(
        t * 0.05,
      ) * 0.15,
    );

    ctx.fillStyle = g;
    ctx.fill();

    ctx.strokeStyle = ol;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = ol;

    ctx.beginPath();

    ctx.arc(
      -3.5,
      -1,
      1.5,
      0,
      TAU,
    );

    ctx.arc(
      3.5,
      -1,
      1.5,
      0,
      TAU,
    );

    ctx.fill();

    ctx.strokeStyle = ol;
    ctx.lineWidth = 1.3;

    ctx.beginPath();

    ctx.arc(
      0,
      1.5,
      3,
      0.2,
      Math.PI - 0.2,
    );

    ctx.stroke();

  } else if (kind === "fruit") {

    const g =
      ctx.createRadialGradient(
        -4,
        -3,
        1,
        0,
        2,
        14,
      );

    g.addColorStop(
      0,
      "#fff6c0",
    );

    g.addColorStop(
      0.45,
      "#ffc93a",
    );

    g.addColorStop(
      1,
      "#d97a10",
    );

    ctx.beginPath();

    ctx.moveTo(
      0,
      -7,
    );

    ctx.bezierCurveTo(
      8,
      -13,
      15,
      -3,
      11,
      6,
    );

    ctx.bezierCurveTo(
      8,
      13,
      2,
      13,
      0,
      11,
    );

    ctx.bezierCurveTo(
      -2,
      13,
      -8,
      13,
      -11,
      6,
    );

    ctx.bezierCurveTo(
      -15,
      -3,
      -8,
      -13,
      0,
      -7,
    );

    ctx.fillStyle = g;
    ctx.fill();

    ctx.strokeStyle = ol;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle =
      "#6b3f10";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(
      0,
      -7,
    );

    ctx.quadraticCurveTo(
      1,
      -12,
      3,
      -14,
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(
      2,
      -11,
    );

    ctx.quadraticCurveTo(
      9,
      -16,
      12,
      -10,
    );

    ctx.quadraticCurveTo(
      6,
      -8,
      2,
      -11,
    );

    ctx.fillStyle =
      "#6fdc72";

    ctx.fill();

    ctx.strokeStyle = ol;
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.fillStyle =
      "rgba(255,255,255,.8)";

    ctx.beginPath();

    ctx.ellipse(
      -5,
      -2,
      2.2,
      3.5,
      -0.4,
      0,
      TAU,
    );

    ctx.fill();
  }
}

function drawItem(ctx, it, cam, t) {
  const d = DEFS[it.kind];

  if (!d) return;

  const bob =
    Math.sin(
      t * 0.06 +
      it.phase,
    ) * 5;

  const x =
    it.x - cam.x;

  const y =
    it.y -
    cam.y +
    bob;

  const pulse =
    0.72 +
    Math.sin(
      t * 0.09 +
      it.phase,
    ) * 0.28;

  const lifeIn = clamp(
    (frame -
      (it.born || frame)) /
      8,
    0,
    1,
  );

  ctx.save();

  // Sombra.
  ctx.globalAlpha =
    0.22 +
    lifeIn * 0.08;

  ctx.fillStyle =
    "#000";

  ctx.beginPath();

  ctx.ellipse(
    x,
    it.y - cam.y + 29,
    13 - bob * 0.5,
    3.5,
    0,
    0,
    TAU,
  );

  ctx.fill();

  // Halo.
  ctx.globalCompositeOperation =
    "lighter";

  const glow =
    ctx.createRadialGradient(
      x,
      y,
      1,
      x,
      y,
      38,
    );

  glow.addColorStop(
    0,
    d.glow,
  );

  glow.addColorStop(
    0.3,
    d.color + "99",
  );

  glow.addColorStop(
    1,
    d.color + "00",
  );

  ctx.globalAlpha =
    (0.46 +
      pulse * 0.18) *
    lifeIn;

  ctx.fillStyle = glow;

  ctx.beginPath();

  ctx.arc(
    x,
    y,
    38,
    0,
    TAU,
  );

  ctx.fill();

  // Anillo exterior.
  ctx.globalAlpha =
    0.34 *
    pulse *
    lifeIn;

  ctx.strokeStyle =
    d.glow;

  ctx.lineWidth = 1.2;

  ctx.beginPath();

  ctx.arc(
    x,
    y,
    22 +
      Math.sin(
        t * 0.05 +
        it.phase,
      ) * 2,
    0,
    TAU,
  );

  ctx.stroke();

  // Rayos.
  ctx.globalAlpha =
    0.16 +
    0.1 * pulse;

  ctx.fillStyle =
    d.glow;

  const rot =
    t * 0.015 +
    it.phase;

  for (
    let i = 0;
    i < 6;
    i++
  ) {
    const a =
      rot +
      (i * TAU) / 6;

    ctx.beginPath();

    ctx.moveTo(
      x,
      y,
    );

    ctx.lineTo(
      x +
        Math.cos(
          a - 0.11,
        ) *
          31,
      y +
        Math.sin(
          a - 0.11,
        ) *
          31,
    );

    ctx.lineTo(
      x +
        Math.cos(
          a + 0.11,
        ) *
          31,
      y +
        Math.sin(
          a + 0.11,
        ) *
          31,
    );

    ctx.closePath();
    ctx.fill();
  }

  ctx.globalCompositeOperation =
    "source-over";

  ctx.globalAlpha = 1;

  // Icono.
  ctx.translate(
    x,
    y,
  );

  ctx.scale(
    1.08,
    1.08,
  );

  drawIcon(
    ctx,
    it.kind,
    t,
  );

  ctx.restore();

  // Destellos.
  ctx.save();

  ctx.fillStyle =
    "#fff";

  for (
    let i = 0;
    i < 3;
    i++
  ) {
    const k =
      (
        t * 0.02 +
        i / 3 +
        it.phase
      ) % 1;

    const a =
      it.phase +
      i * 2.1;

    const sx =
      x +
      Math.cos(a) *
        (14 + k * 11);

    const sy =
      y +
      Math.sin(a) *
        (12 + k * 9) -
      k * 6;

    const s =
      Math.sin(
        k * Math.PI,
      ) * 3.2;

    if (s < 0.3) continue;

    ctx.globalAlpha =
      Math.sin(
        k * Math.PI,
      ) * lifeIn;

    starPath(
      ctx,
      sx,
      sy,
      s,
      s * 0.3,
      4,
      0,
    );

    ctx.fill();
  }

  ctx.restore();
}

function drawEffects(ctx, game, t) {
  const p = game.player;

  if (!p || p.dead) return;

  const cam =
    game.cam;

  const pc =
    playerCenter(p);

  const cx =
    pc.x - cam.x;

  const cy =
    pc.y - cam.y;

  const R =
    Math.max(
      p.w || 24,
      p.h || 24,
    ) * 0.5 + 14;

  if (fx.star > 0) {
    const blink =
      fx.star < 90 &&
      ((fx.star >> 3) & 1);

    const hue =
      (t * 6) % 360;

    ctx.save();

    ctx.globalCompositeOperation =
      "lighter";

    ctx.globalAlpha =
      blink
        ? 0.22
        : 0.48;

    const g =
      ctx.createRadialGradient(
        cx,
        cy,
        4,
        cx,
        cy,
        R + 18,
      );

    g.addColorStop(
      0,
      "hsla(" +
        hue +
        ",100%,86%,.95)",
    );

    g.addColorStop(
      1,
      "hsla(" +
        ((hue + 120) % 360) +
        ",100%,60%,0)",
    );

    ctx.fillStyle = g;

    ctx.beginPath();

    ctx.arc(
      cx,
      cy,
      R + 18,
      0,
      TAU,
    );

    ctx.fill();

    ctx.globalAlpha =
      blink
        ? 0.42
        : 0.92;

    ctx.fillStyle =
      "#fff8c0";

    for (
      let i = 0;
      i < 6;
      i++
    ) {
      const a =
        t * 0.12 +
        (i * TAU) / 6;

      starPath(
        ctx,
        cx +
          Math.cos(a) *
            (R + 2),
        cy +
          Math.sin(a) *
            (R * 0.86),
        4.5,
        1.8,
        5,
        a,
      );

      ctx.fill();
    }

    ctx.restore();

    if ((t & 3) === 0) {
      emit(
        game,
        pc.x,
        pc.y,
        {
          color:
            "hsl(" +
            hue +
            ",100%,70%)",
          count: 1,
          size: 2.5,
          speed: 1.2,
          star: true,
          life: 14,
        },
      );
    }
  }

  if (fx.shell > 0) {
    const wob =
      Math.sin(
        t * 0.1,
      ) * 1.5 +
      shellCrack * 0.3;

    const r =
      R + 4 + wob;

    ctx.save();

    const g =
      ctx.createRadialGradient(
        cx -
          r * 0.35,
        cy -
          r * 0.4,
        r * 0.1,
        cx,
        cy,
        r,
      );

    g.addColorStop(
      0,
      "rgba(255,255,255,.38)",
    );

    g.addColorStop(
      0.72,
      "rgba(127,232,255,.11)",
    );

    g.addColorStop(
      1,
      "rgba(127,232,255,.46)",
    );

    ctx.fillStyle = g;

    ctx.beginPath();

    ctx.arc(
      cx,
      cy,
      r,
      0,
      TAU,
    );

    ctx.fill();

    ctx.strokeStyle =
      shellCrack > 0
        ? "rgba(255,255,255,.98)"
        : "rgba(190,245,255,.82)";

    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle =
      "rgba(255,255,255,.8)";

    ctx.lineWidth = 2.5;

    ctx.beginPath();

    ctx.arc(
      cx,
      cy,
      r - 5,
      Math.PI * 1.1,
      Math.PI * 1.4,
    );

    ctx.stroke();

    const broken =
      3 - fx.shell;

    if (broken > 0) {
      const cracks = [
        [0.4, 1],
        [2.5, -1],
        [4.3, 1],
      ];

      ctx.strokeStyle =
        "rgba(230,250,255,.9)";

      ctx.lineWidth = 1.3;

      for (
        let i = 0;
        i <
          Math.min(
            cracks.length,
            broken,
          );
        i++
      ) {
        const [a, s] =
          cracks[i];

        const x0 =
          cx +
          Math.cos(a) *
            r;

        const y0 =
          cy +
          Math.sin(a) *
            r;

        const x1 =
          cx +
          Math.cos(
            a + 0.15 * s,
          ) *
            r *
            0.72;

        const y1 =
          cy +
          Math.sin(
            a + 0.15 * s,
          ) *
            r *
            0.72;

        ctx.beginPath();

        ctx.moveTo(
          x0,
          y0,
        );

        ctx.lineTo(
          x1,
          y1,
        );

        ctx.lineTo(
          cx +
            Math.cos(
              a - 0.1 * s,
            ) *
              r *
              0.5,
          cy +
            Math.sin(
              a - 0.1 * s,
            ) *
              r *
              0.5,
        );

        ctx.moveTo(
          x1,
          y1,
        );

        ctx.lineTo(
          cx +
            Math.cos(
              a + 0.35 * s,
            ) *
              r *
              0.55,
          cy +
            Math.sin(
              a + 0.35 * s,
            ) *
              r *
              0.55,
        );

        ctx.stroke();
      }
    }

    // Micro-reflejo.
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;

    ctx.beginPath();

    ctx.arc(
      cx - r * 0.18,
      cy - r * 0.18,
      r * 0.72,
      Math.PI * 1.05,
      Math.PI * 1.65,
    );

    ctx.stroke();

    ctx.restore();
  }

  if (
    fx.feather > 0 &&
    !p.grounded &&
    (t & 3) === 0
  ) {
    emit(
      game,
      p.x +
        p.w * 0.5 -
        p.facing * 8,
      p.y +
        p.h * 0.6,
      {
        color: "#dfffe8",
        count: 1,
        size: 2.4,
        speed: 0.6,
        life: 16,
        up: 0.2,
      },
    );
  }

  if (fx.magnet > 0) {
    ctx.save();

    ctx.strokeStyle =
      "rgba(255,122,217,.30)";

    ctx.lineWidth = 1.5;

    ctx.setLineDash([
      4,
      6,
    ]);

    ctx.lineDashOffset =
      -t * 0.6;

    ctx.beginPath();

    let shown = 0;

    for (
      const o of
        game.orbs || []
    ) {
      if (
        !o ||
        o.taken ||
        !o._mag
      ) {
        continue;
      }

      ctx.moveTo(
        cx,
        cy,
      );

      ctx.lineTo(
        o.x - cam.x,
        o.y - cam.y,
      );

      if (++shown >= 8) {
        break;
      }
    }

    if (shown) {
      ctx.stroke();
    }

    ctx.setLineDash([]);

    ctx.globalAlpha =
      0.18 +
      Math.sin(
        t * 0.1,
      ) * 0.06;

    ctx.beginPath();

    ctx.arc(
      cx,
      cy,
      CFG.magnetRadius,
      0,
      TAU,
    );

    ctx.stroke();

    ctx.restore();
  }

  if (fx.hourglass > 0) {
    const cv =
      ctx.canvas;

    const total =
      DEFS.hourglass.dur;

    const fadeIn =
      clamp(
        (total -
          fx.hourglass) /
          24,
        0,
        1,
      );

    const fadeOut =
      clamp(
        fx.hourglass /
          42,
        0,
        1,
      );

    const a =
      Math.min(
        1,
        fadeIn * fadeOut,
      );

    ctx.save();

    ctx.globalAlpha =
      0.11 * a;

    ctx.fillStyle =
      "#4a7dff";

    ctx.fillRect(
      -100,
      -100,
      cv.width + 200,
      cv.height + 200,
    );

    ctx.globalAlpha =
      0.18 * a;

    ctx.fillStyle =
      "#9fb9ff";

    ctx.fillRect(
      0,
      0,
      cv.width *
        (fx.hourglass /
          total),
      2,
    );

    ctx.restore();
  }
}
// ---------- depuración opcional ----------
//
// En consola:
//   window.__ohanaMagic.give("star")
//   window.__ohanaMagic.give("shell")
//   window.__ohanaMagic.state()
//   window.__ohanaMagic.items()
//   window.__ohanaMagic.active()
//   window.__ohanaMagic.tp(0)
//   window.__ohanaMagic.refresh()

if (
  typeof window !==
  "undefined"
) {
  window.__ohanaMagic = {

    give(kind) {
      if (
        !lastGame?.player ||
        !DEFS[kind]
      ) {
        return false;
      }

      const ok =
        apply(
          lastGame,
          kind,
        );

      renderHud(true);

      return ok;
    },

    items() {
      return items.map(
        (i) => ({
          kind:
            i.kind,

          x:
            Math.round(
              i.x,
            ),

          y:
            Math.round(
              i.y,
            ),

          taken:
            !!i.taken,
        }),
      );
    },

    active() {
      return {
        ...fx,
      };
    },

    tp(index = 0) {
      const i =
        Math.max(
          0,
          Math.trunc(
            finite(
              index,
              0,
            ),
          ),
        );

      const it =
        items[i];

      const p =
        lastGame?.player;

      if (
        !it ||
        !p
      ) {
        return false;
      }

      p.x =
        it.x -
        p.w * 0.5;

      p.y =
        it.y -
        p.h * 0.5;

      p.vx = 0;
      p.vy = 0;

      return true;
    },

    state() {
      const p =
        lastGame?.player;

      if (!p) {
        return null;
      }

      return {
        hp:
          p.health,

        max:
          p.maxHealth,

        xp:
          p.xp,

        evo:
          p.evo,

        jumps:
          p.maxJumps,

        slow:
          lastGame?.enemySlow ||
          0,

        foes:
          (
            lastGame?.enemies ||
            []
          ).map(
            (e) =>
              Math.round(
                e.hp,
              ),
          ),
      };
    },

    refresh() {
      if (!lastGame) {
        return [];
      }

      items =
        placeItems(
          lastGame,
          lastGame.roomId,
        );

      return this.items();
    },

    kinds:
      KINDS.slice(),

    defs:
      Object.fromEntries(
        KINDS.map(
          (k) => [
            k,
            {
              ...DEFS[k],
            },
          ],
        ),
      ),
  };
}

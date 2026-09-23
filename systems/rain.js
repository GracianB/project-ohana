// Beach rain + collectible umbrella. Damage via callback (hurtPlayer is local to game.js).
import { showNotification } from "./notify.js";

const DROP_COUNT = 90;
const DAMAGE_EVERY = 36; // ~1 HP every ~36 frames if raining without umbrella
const START_DELAY_MIN = 35;
const START_DELAY_MAX = 75;
const PICKUP_PAD = 16; // expand player AABB for generous pickup

// Solid left-beach sand (ground 0–600); pit gap is 600–880 — never spawn there.
const UMBRELLA_SPAWN = { x: 420, y: 768, w: 72, h: 52 };

function spawnDrops(w, h) {
  const drops = [];
  for (let i = 0; i < DROP_COUNT; i++) {
    drops.push({
      x: Math.random() * (w + 200) - 40,
      y: Math.random() * h,
      len: 8 + Math.random() * 12,
      spd: 9 + Math.random() * 8,
      drift: -1.2 - Math.random() * 1.4,
    });
  }
  return drops;
}

function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function spawnUmbrella() {
  return { x: UMBRELLA_SPAWN.x, y: UMBRELLA_SPAWN.y, w: UMBRELLA_SPAWN.w, h: UMBRELLA_SPAWN.h };
}

export const Rain = {
  active: false,
  drops: [],
  umbrella: null, // {x,y,w,h} or null
  hasUmbrella: false,
  tick: 0,
  _delay: 0,
  _inBeach: false,
  _grabNotify: false,

  start() {
    this.active = true;
    this.tick = 0;
    this.drops = spawnDrops(1600, 900);
    // Umbrella already spawned on beach enter; only create if somehow missing
    if (!this.hasUmbrella && !this.umbrella) {
      this.umbrella = spawnUmbrella();
    }
    if (!this._grabNotify) {
      this._grabNotify = true;
      try { showNotification("¡LLUEVE!", "Busca el paraguas rojo en la Costa", "sala"); } catch (_) {}
    }
  },

  stop() {
    this.active = false;
    this.drops = [];
    this.umbrella = null;
    this.hasUmbrella = false;
    this.tick = 0;
    this._delay = 0;
    this._grabNotify = false;
  },

  _tryPickup(p) {
    if (!this.umbrella || !p || p.dead || this.hasUmbrella) return;
    const pw = (p.w || 40) + PICKUP_PAD * 2;
    const ph = (p.h || 40) + PICKUP_PAD * 2;
    const box = { x: p.x - PICKUP_PAD, y: p.y - PICKUP_PAD, w: pw, h: ph };
    if (aabb(box, this.umbrella)) {
      this.hasUmbrella = true;
      this.umbrella = null;
      try { showNotification("PARAGUAS", "La lluvia ya no te hace daño", "item"); } catch (_) {}
    }
  },

  update(game, opts) {
    const onTickDamage = opts && opts.onTickDamage;
    const inBeach = game && game.roomId === "beach";

    if (!inBeach) {
      if (this.active || this.hasUmbrella || this.umbrella || this._inBeach) this.stop();
      this._inBeach = false;
      return;
    }

    if (!this._inBeach) {
      // Just entered beach: spawn umbrella immediately on solid ground, then delay rain
      this._inBeach = true;
      this._delay = START_DELAY_MIN + Math.floor(Math.random() * (START_DELAY_MAX - START_DELAY_MIN + 1));
      this._grabNotify = false;
      if (!this.hasUmbrella) this.umbrella = spawnUmbrella();
    }

    const p = game.player;
    // Pickup works before/during rain
    this._tryPickup(p);
    // Quiet tick so umbrella bob/ring animate before rain starts
    if (!this.active) this.tick++;

    if (!this.active) {
      if (this._delay > 0) {
        this._delay--;
        if (this._delay <= 0) this.start();
      }
      return;
    }

    this.tick++;
    const roomW = game.worldW || 1600;
    const roomH = game.worldH || 900;

    for (const d of this.drops) {
      d.y += d.spd;
      d.x += d.drift;
      if (d.y > roomH + 20) {
        d.y = -20 - Math.random() * 40;
        d.x = Math.random() * (roomW + 200) - 40;
      }
      if (d.x < -60) d.x = roomW + 40;
    }

    // Rain damage
    if (!this.hasUmbrella && p && !p.dead && (p.invuln || 0) <= 0 && onTickDamage) {
      if (this.tick % DAMAGE_EVERY === 0) onTickDamage(1);
    }
  },

  draw(ctx, cam) {
    if (!ctx || !cam) return;

    ctx.save();

    if (this.active) {
      ctx.strokeStyle = "rgba(160,210,255,.55)";
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      for (const d of this.drops) {
        const x = d.x - cam.x;
        const y = d.y - cam.y;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + d.drift * 0.6, y + d.len);
        ctx.stroke();
      }
      ctx.lineCap = "butt";
    }

    // World umbrella pickup (visible as soon as beach enter, even before rain)
    if (this.umbrella) {
      const u = this.umbrella;
      const bob = Math.sin((this.tick || 0) / 10) * 4;
      const x = u.x - cam.x;
      const y = u.y - cam.y + bob;
      const cx = x + u.w / 2;
      const cy = y + u.h / 2;
      // soft ground ring so it's obvious
      ctx.beginPath();
      ctx.ellipse(cx, y + u.h - 4 - bob, 28, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(126,231,255," + (0.22 + Math.sin((this.tick || 0) / 8) * 0.1) + ")";
      ctx.fill();
      drawUmbrellaIcon(ctx, cx, cy, 1.45);
    }

    ctx.restore();
  },

  /** Optional: call from render with player screen/world pos */
  drawPlayerHint(ctx, cam, player) {
    if (!this.hasUmbrella || !player || !ctx || !cam) return;
    const x = player.x - cam.x + (player.w || 20) / 2;
    const y = player.y - cam.y - 18;
    drawUmbrellaIcon(ctx, x, y, 0.55);
  },
};

function drawUmbrellaIcon(ctx, cx, cy, scale) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  // canopy
  ctx.fillStyle = "#e23b3d";
  ctx.beginPath();
  ctx.moveTo(-18, 2);
  ctx.quadraticCurveTo(-18, -16, 0, -18);
  ctx.quadraticCurveTo(18, -16, 18, 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.25)";
  ctx.beginPath();
  ctx.moveTo(-6, 0);
  ctx.quadraticCurveTo(-4, -12, 0, -14);
  ctx.quadraticCurveTo(2, -8, 0, 0);
  ctx.fill();
  // stem
  ctx.strokeStyle = "#c8a060";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.lineTo(0, 16);
  ctx.quadraticCurveTo(4, 20, 8, 16);
  ctx.stroke();
  ctx.restore();
}

export function startRain() { Rain.start(); }
export function stopRain() { Rain.stop(); }
export function updateRain(game, opts) { Rain.update(game, opts); }
export function drawRain(ctx, cam) { Rain.draw(ctx, cam); }

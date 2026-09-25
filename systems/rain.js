// Lluvia radiactiva del Alien Lab + paraguas. En la Costa no cae.
import { showNotification } from "./notify.js";

const ROOM = "lab";
const DROP_COUNT = 110;
const DAMAGE_EVERY = 36;
const START_DELAY_MIN = 35;
const START_DELAY_MAX = 75;
const PICKUP_PAD = 16;
// Suelo del Lab en y 810. El paraguas apoya ahí, a la izquierda.
const UMBRELLA_SPAWN = { x: 250, y: 748, w: 86, h: 62 };

function spawnDrops(w, h) {
  const drops = [];
  for (let i = 0; i < DROP_COUNT; i++) {
    drops.push({
      x: Math.random() * (w + 200) - 40,
      y: Math.random() * h,
      len: 10 + Math.random() * 16,
      spd: 10 + Math.random() * 8,
      drift: -0.4 - Math.random() * 0.8,
      hot: Math.random() < 0.18,
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
  umbrella: null,
  hasUmbrella: false,
  tick: 0,
  _delay: 0,
  _inRoom: false,
  _grabNotify: false,

  start() {
    this.active = true;
    this.tick = 0;
    this.drops = spawnDrops(1600, 900);
    if (!this.hasUmbrella && !this.umbrella) this.umbrella = spawnUmbrella();
    if (!this._grabNotify) {
      this._grabNotify = true;
      try { showNotification("LLUVIA", "Radiactiva. El paraguas está en el Lab", "sala"); } catch (_) {}
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
    const box = {
      x: p.x - PICKUP_PAD,
      y: p.y - PICKUP_PAD,
      w: (p.w || 40) + PICKUP_PAD * 2,
      h: (p.h || 40) + PICKUP_PAD * 2,
    };
    if (aabb(box, this.umbrella)) {
      this.hasUmbrella = true;
      this.umbrella = null;
      try { showNotification("PARAGUAS", "La lluvia ya no te toca", "item"); } catch (_) {}
    }
  },

  update(game, opts) {
    const onTickDamage = opts && opts.onTickDamage;
    const here = game && game.roomId === ROOM;

    if (!here) {
      if (this.active || this.hasUmbrella || this.umbrella || this._inRoom) this.stop();
      this._inRoom = false;
      return;
    }

    if (!this._inRoom) {
      this._inRoom = true;
      this._delay = START_DELAY_MIN + Math.floor(Math.random() * (START_DELAY_MAX - START_DELAY_MIN + 1));
      this._grabNotify = false;
      if (!this.hasUmbrella) this.umbrella = spawnUmbrella();
    }

    const p = game.player;
    this._tryPickup(p);
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
        d.y = -20 - Math.random() * 80;
        d.x = Math.random() * (roomW + 200) - 40;
      }
      if (d.x < -60) d.x = roomW + 40;
    }

    if (!this.hasUmbrella && p && !p.dead && (p.invuln || 0) <= 0 && onTickDamage) {
      if (this.tick % DAMAGE_EVERY === 0) onTickDamage(1);
    }
  },

  draw(ctx, cam) {
    if (!ctx || !cam) return;
    ctx.save();

    if (this.active) {
      const w = ctx.canvas.width;
      const h = ctx.canvas.height;
      const wash = ctx.createLinearGradient(0, 0, 0, h);
      wash.addColorStop(0, "rgba(140, 255, 70, 0.10)");
      wash.addColorStop(1, "rgba(40, 80, 10, 0.05)");
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, w, h);

      for (const d of this.drops) {
        const x = d.x - cam.x;
        const y = d.y - cam.y;
        ctx.strokeStyle = d.hot ? "rgba(220, 255, 120, 0.95)" : "rgba(120, 230, 60, 0.72)";
        ctx.lineWidth = d.hot ? 2.4 : 1.4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + d.drift * 1.4, y + d.len);
        ctx.stroke();
        if (d.hot) {
          ctx.fillStyle = "rgba(190, 255, 80, 0.9)";
          ctx.beginPath();
          ctx.arc(x + d.drift * 1.4, y + d.len, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    if (this.umbrella) {
      const u = this.umbrella;
      const bob = Math.sin((this.tick || 0) / 10) * 3;
      const x = u.x - cam.x;
      const y = u.y - cam.y + bob;
      const cx = x + u.w / 2;
      const cy = y + 22;
      ctx.beginPath();
      ctx.ellipse(cx, y + u.h - 6, 30, 7, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(180, 255, 60, 0.28)";
      ctx.fill();
      drawUmbrella(ctx, cx, cy, 1.15);
    }

    ctx.restore();
  },

  drawPlayerHint(ctx, cam, player) {
    if (!this.hasUmbrella || !player || !ctx || !cam) return;
    const face = player.facing || 1;
    const x = player.x - cam.x + (player.w || 24) / 2 + face * 6;
    const y = player.y - cam.y + 2;
    drawUmbrella(ctx, x, y, 1.05);
  },
};

function drawUmbrella(ctx, cx, cy, scale) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  const gores = 8;
  const R = 36;
  for (let i = 0; i < gores; i++) {
    const a0 = Math.PI + (i / gores) * Math.PI;
    const a1 = Math.PI + ((i + 1) / gores) * Math.PI;
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.arc(0, 4, R, a0, a1);
    ctx.closePath();
    ctx.fillStyle = i % 2 ? "#ffe14a" : "#f0a400";
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(0, 4, R, Math.PI, 0);
  ctx.strokeStyle = "#241c0e";
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.strokeStyle = "rgba(28, 22, 10, 0.55)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= gores; i++) {
    const a = Math.PI + (i / gores) * Math.PI;
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.lineTo(Math.cos(a) * R, 4 + Math.sin(a) * R);
    ctx.stroke();
  }
  ctx.fillStyle = "#fff8dc";
  ctx.beginPath();
  ctx.arc(0, 4, 3.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#3a2a18";
  ctx.lineWidth = 2.6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.lineTo(0, 30);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(7, 30, 7, Math.PI, 0.15, true);
  ctx.stroke();
  ctx.restore();
}

export function startRain() { Rain.start(); }
export function stopRain() { Rain.stop(); }
export function updateRain(game, opts) { Rain.update(game, opts); }
export function drawRain(ctx, cam) { Rain.draw(ctx, cam); }

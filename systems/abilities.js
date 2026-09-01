import { vfxSprite } from "../characters/sprites.js";

export const ABILITY_DEFS = {
  ukulele: { name: "Nota Ohana", key: "J", cd: 520, color: "#ffb347" },
  hula: { name: "Aro Hula", key: "K", cd: 1400, color: "#ff5ad5" },
  ohana: { name: "Pulso Ohana", key: "L", cd: 3200, color: "#ffd36a" },
  dash: { name: "Plasma 626", key: "J", cd: 480, color: "#6af" },
  claws: { name: "Garras", key: "K", cd: 700, color: "#9cf" },
  exp626: { name: "Ráfaga 626", key: "L", cd: 2600, color: "#49f" },
  shock: { name: "Chispa", key: "J", cd: 420, color: "#ffe14a" },
  quick: { name: "Ataque Rápido", key: "K", cd: 650, color: "#fff3a0" },
  thunder: { name: "Trueno", key: "L", cd: 2400, color: "#9cf" },
  breath: { name: "Bola de fuego", key: "J", cd: 540, color: "#ff6a2a" },
  wing: { name: "Aletazo", key: "K", cd: 800, color: "#f84" },
  rage: { name: "Ira del dragón", key: "L", cd: 3000, color: "#f30" },
  claw: { name: "Ovillo", key: "J", cd: 400, color: "#ff8ad4" },
  catdash: { name: "Salto Neko", key: "K", cd: 700, color: "#faf" },
  lives: { name: "Nueve vidas", key: "L", cd: 3400, color: "#fff" },
};

export function useAbility(game, index) {
  const p = game.player;
  if (!p || p.dead) return;
  const id = p.abilities[index];
  const def = ABILITY_DEFS[id];
  if (!def) return;
  const now = performance.now();
  p.cds = p.cds || {};
  if ((p.cds[id] || 0) > now) return;
  p.cds[id] = now + def.cd / (1 + p.evo * 0.12);
  const fn = CASTERS[id];
  if (fn) fn(game);
}

export function drawProjectile(ctx, pr, cam, t) {
  const x = pr.x - cam.x + pr.w / 2;
  const y = pr.y - cam.y + pr.h / 2;
  ctx.save();
  ctx.translate(x, y);
  const ang = Math.atan2(pr.vy || 0, pr.vx || 1);
  if (pr.spin) ctx.rotate(t * 0.22 + (pr.rot || 0));
  else ctx.rotate(ang);
  ctx.fillStyle = pr.color;
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1.4;
  const shape = pr.shape || "orb";
  const w = pr.w;
  const h = pr.h;
  const vfxName = shape === "flame" ? "vfx-flame" : shape === "note" ? "vfx-note" : (shape === "claw" || shape === "crescent" || shape === "slash") ? "vfx-slash" : null;
  const vfx = vfxName ? vfxSprite(vfxName) : null;
  if (vfx) {
    const s = Math.max(w, h) * 2.1;
    ctx.drawImage(vfx, -s / 2, -s / 2, s, s);
    ctx.restore();
    return;
  }
  ctx.save();
  ctx.globalAlpha = 0.32;
  ctx.beginPath();
  ctx.arc(0, 0, Math.max(w, h) * 0.72, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (shape === "note") {
    ctx.beginPath();
    ctx.ellipse(-2, 7, 6, 4.5, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(3, -12, 2.6, 20);
    ctx.beginPath();
    ctx.moveTo(5.6, -12);
    ctx.quadraticCurveTo(16, -8, 6, 0);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.7)";
    ctx.beginPath();
    ctx.ellipse(-4, 6, 2, 1.4, -0.4, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === "bolt") {
    ctx.beginPath();
    ctx.moveTo(-w / 2, 0);
    ctx.lineTo(w / 2, -h / 2);
    ctx.lineTo(w / 4, 0);
    ctx.lineTo(w / 2, h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(-w / 6, 0);
    ctx.lineTo(w / 3, -h / 5);
    ctx.lineTo(w / 8, 0);
    ctx.lineTo(w / 3, h / 5);
    ctx.fill();
  } else if (shape === "zap") {
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = pr.color;
    ctx.beginPath();
    ctx.moveTo(-w / 2, 0);
    ctx.lineTo(-w / 6, -h / 2);
    ctx.lineTo(w / 8, h / 3);
    ctx.lineTo(w / 2, 0);
    ctx.stroke();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.stroke();
  } else if (shape === "flame") {
    ctx.beginPath();
    ctx.moveTo(-w / 2, 0);
    ctx.quadraticCurveTo(0, -h, w / 2, 0);
    ctx.quadraticCurveTo(0, h * 0.55, -w / 2, 0);
    ctx.fill();
    ctx.fillStyle = "#ffe36a";
    ctx.beginPath();
    ctx.moveTo(-w / 5, 0);
    ctx.quadraticCurveTo(0, -h * 0.45, w / 4, 0);
    ctx.fill();
  } else if (shape === "ring") {
    ctx.lineWidth = 3.6;
    ctx.beginPath();
    ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
    ctx.strokeStyle = pr.color;
    ctx.stroke();
    ctx.fillStyle = pr.color;
    for (let i = 0; i < 6; i++) {
      const a = i * (Math.PI / 3) + t * 0.1;
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * w / 2, Math.sin(a) * w / 2, 2.4, 4, a, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (shape === "claw") {
    ctx.lineCap = "round";
    ctx.lineWidth = 2.8;
    ctx.strokeStyle = pr.color;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(-8, i * 7);
      ctx.quadraticCurveTo(4, i * 3, 14, i * 8);
      ctx.stroke();
    }
  } else if (shape === "yarn") {
    ctx.beginPath();
    ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, w / 3, 0, Math.PI * 1.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(1, -1, w / 5, 0.4, Math.PI * 1.8);
    ctx.stroke();
  } else if (shape === "heart") {
    ctx.beginPath();
    ctx.moveTo(0, h / 3);
    ctx.bezierCurveTo(-w / 2, -h / 6, -w / 3, -h / 2, 0, -h / 6);
    ctx.bezierCurveTo(w / 3, -h / 2, w / 2, -h / 6, 0, h / 3);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.55)";
    ctx.beginPath();
    ctx.arc(-w / 6, -h / 8, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === "leaf") {
    ctx.beginPath();
    ctx.moveTo(-w / 2, 0);
    ctx.quadraticCurveTo(0, -h, w / 2, 0);
    ctx.quadraticCurveTo(0, h, -w / 2, 0);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.6)";
    ctx.beginPath();
    ctx.moveTo(-w / 4, 0);
    ctx.lineTo(w / 4, 0);
    ctx.stroke();
  } else if (shape === "crescent") {
    ctx.beginPath();
    ctx.arc(0, 0, w / 2, -0.9, 0.9);
    ctx.arc(6, 0, w / 3, 1.1, -1.1, true);
    ctx.closePath();
    ctx.fill();
  } else if (shape === "wind") {
    ctx.lineWidth = 3;
    ctx.strokeStyle = pr.color;
    ctx.beginPath();
    ctx.arc(0, 0, w / 2, -0.8, 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-4, 2, w / 3, -0.6, 0.6);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(5, w / 2), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.55)";
    ctx.beginPath();
    ctx.arc(-2, -2, Math.max(2, w / 5), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawSlash(ctx, s, cam) {
  const k = s.life / s.max;
  const x = s.x - cam.x;
  const y = s.y - cam.y;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s.facing || 1, 1);
  const slashImg = vfxSprite("vfx-slash");
  if (slashImg) {
    const size = (s.w || 42) * 2.4 * (1.1 - k * 0.15);
    ctx.globalAlpha = Math.min(1, k * 1.3);
    ctx.drawImage(slashImg, 0, -size / 2, size, size);
    ctx.restore();
    return;
  }
  ctx.globalAlpha = Math.min(1, k * 1.4);
  ctx.strokeStyle = s.color;
  ctx.fillStyle = s.color;
  ctx.lineCap = "round";
  const r = (s.w || 42) * (1.25 - k * 0.2);
  ctx.save();
  ctx.globalAlpha = 0.22 * k;
  ctx.beginPath();
  ctx.arc(8, 0, r * 1.05, -1.2, 1);
  ctx.lineTo(8, 0);
  ctx.fill();
  ctx.restore();
  if (s.kind === "claws") {
    ctx.lineWidth = 3.2;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.arc(8, i * 10, r, -0.9, 0.7);
      ctx.stroke();
    }
  } else if (s.kind === "zap") {
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(4, -r * 0.7);
    ctx.lineTo(r * 0.4, -r * 0.15);
    ctx.lineTo(r * 0.15, r * 0.1);
    ctx.lineTo(r, r * 0.55);
    ctx.stroke();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.2;
    ctx.stroke();
  } else if (s.kind === "fan") {
    ctx.globalAlpha = k * 0.85;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(4, 0);
      ctx.quadraticCurveTo(r * 0.5, i * 10, r, i * 14);
      ctx.lineTo(r * 0.6, i * 6);
      ctx.closePath();
      ctx.fill();
    }
  } else if (s.kind === "leaf") {
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(6, 0, r, -1.1, 0.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(r * 0.55, -8, 5, 9, 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(r * 0.7, 10, 4, 8, -0.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(6, 2, r, -1.05, 0.85);
    ctx.stroke();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(8, 2, r * 0.72, -0.9, 0.7);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawBolt(ctx, b, cam, t) {
  const x1 = b.x1 - cam.x;
  const y1 = b.y1 - cam.y;
  const x2 = b.x2 - cam.x;
  const y2 = b.y2 - cam.y;
  const k = b.life / 14;
  ctx.save();
  ctx.globalAlpha = Math.max(0.3, k);
  ctx.strokeStyle = "#fffde0";
  ctx.lineWidth = 5 * k;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  const segs = 7;
  for (let i = 1; i <= segs; i++) {
    const u = i / segs;
    const jx = (Math.random() - 0.5) * 18 * (i < segs ? 1 : 0);
    const jy = (Math.random() - 0.5) * 18 * (i < segs ? 1 : 0);
    ctx.lineTo(x1 + (x2 - x1) * u + jx, y1 + (y2 - y1) * u + jy);
  }
  ctx.stroke();
  ctx.strokeStyle = "#7ecbff";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function shot(game, extra) {
  const p = game.player;
  const evo = p.evo || 0;
  game.projectiles.push({
    x: p.x + p.w / 2 + p.facing * 10,
    y: p.y + p.h * 0.35,
    vx: (extra.vx ?? 9) * p.facing,
    vy: extra.vy ?? 0,
    w: extra.w ?? 16,
    h: extra.h ?? 12,
    life: extra.life ?? 55,
    dmg: (extra.dmg ?? 16) * (1 + evo * 0.28),
    color: extra.color ?? "#fff",
    homing: extra.homing || false,
    spin: extra.spin || false,
    trail: extra.trail !== false,
    shape: extra.shape || "orb",
    owner: "player",
  });
}

function boom(game, color, n) {
  const p = game.player;
  game.fx.emit(p.x + p.w / 2, p.y + p.h / 2, { color, count: n || 16, size: 4, up: 1.2, speed: 3.2 });
}

function capEnemy(e, vx) {
  e.vx = Math.max(-4.2, Math.min(4.2, vx));
  e.stun = Math.max(e.stun || 0, 22);
}

const CASTERS = {
  ukulele(g) {
    shot(g, { color: "#ffb347", w: 22, h: 22, dmg: 18, vx: 10, spin: true, shape: "note" });
    if (g.player.evo >= 1) shot(g, { color: "#ffd36a", w: 16, h: 16, dmg: 10, vx: 8, vy: -2.6, spin: true, shape: "note" });
    if (g.player.evo >= 2) shot(g, { color: "#ff8a3a", w: 16, h: 16, dmg: 10, vx: 8, vy: 2.6, spin: true, shape: "note" });
    if (g.player.evo >= 3) shot(g, { color: "#fff1a8", w: 14, h: 14, dmg: 8, vx: 6, spin: true, shape: "leaf" });
    boom(g, "#ffb347", 10);
  },
  hula(g) {
    g.player.invuln = Math.max(g.player.invuln, 16);
    const n = 6 + g.player.evo;
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n;
      g.projectiles.push({
        x: g.player.x + g.player.w / 2,
        y: g.player.y + g.player.h / 2,
        vx: Math.cos(a) * 4.2,
        vy: Math.sin(a) * 4.2,
        w: 18, h: 18, life: 28, dmg: 11 + g.player.evo * 3,
        color: "#ff6ad5", shape: "ring", owner: "player", trail: false,
      });
    }
    boom(g, "#ff6ad5", 12);
  },
  ohana(g) {
    const heal = 22 + g.player.evo * 8;
    g.player.health = Math.min(g.player.maxHealth, g.player.health + heal);
    g.player.invuln = Math.max(g.player.invuln, 24);
    if (g.nums) g.nums.add(g.player.x, g.player.y, "+" + heal, "#6f6");
    boom(g, "#ffd36a", 16);
    for (let i = 0; i < 4 + g.player.evo; i++) {
      const a = (Math.PI * 2 * i) / (4 + g.player.evo);
      g.projectiles.push({
        x: g.player.x + g.player.w / 2, y: g.player.y + g.player.h / 2,
        vx: Math.cos(a) * 3.4, vy: Math.sin(a) * 3.4,
        w: 16, h: 16, life: 30, dmg: 10 + g.player.evo * 3,
        color: "#ffe66a", shape: "heart", owner: "player", spin: true,
      });
    }
    for (const e of g.enemies) {
      const dir = Math.sign(e.x - g.player.x) || 1;
      capEnemy(e, dir * 3.2);
      e.vy = -3;
    }
  },
  dash(g) {
    shot(g, { color: "#66ccff", w: 28, h: 12, dmg: 20, vx: 13, shape: "bolt" });
    if (g.player.evo >= 2) shot(g, { color: "#d6f4ff", w: 18, h: 10, dmg: 10, vx: 10, vy: -1.4, shape: "bolt" });
    boom(g, "#6af", 8);
  },
  claws(g) {
    g.player.vx = 13 * g.player.facing;
    g.player.invuln = Math.max(g.player.invuln, 10);
    shot(g, { color: "#9cf", w: 28, h: 16, dmg: 16, vx: 12, shape: "claw" });
    shot(g, { color: "#cfe", w: 22, h: 14, dmg: 10, vx: 9, vy: -2.2, shape: "claw" });
    if (g.player.evo >= 2) shot(g, { color: "#fff", w: 20, h: 12, dmg: 8, vx: 8, vy: 2.2, shape: "claw" });
    boom(g, "#9cf", 8);
  },
  exp626(g) {
    g.player.vx = 8 * g.player.facing;
    for (let i = -1; i <= 1; i++) shot(g, { color: "#49f", vy: i * 2.6, dmg: 18, w: 24, h: 12, shape: "bolt" });
    if (g.player.evo >= 3) shot(g, { color: "#e8f7ff", vx: 7, dmg: 12, w: 18, shape: "orb" });
    boom(g, "#49f", 14);
  },
  shock(g) {
    shot(g, { color: "#ffe14a", w: 30, h: 14, dmg: 19, vx: 13, shape: "zap" });
    if (g.player.evo >= 1) shot(g, { color: "#fff36a", w: 18, h: 10, dmg: 9, vx: 11, vy: -2.4, shape: "zap" });
    if (g.player.evo >= 3) shot(g, { color: "#fff", w: 16, h: 10, dmg: 8, vx: 9, vy: 2.4, shape: "zap" });
    boom(g, "#fff36a", 10);
  },
  quick(g) {
    g.player.vx = 16 * g.player.facing;
    g.player.invuln = Math.max(g.player.invuln, 10);
    shot(g, { color: "#fff3a0", vx: 15, dmg: 12, life: 20, w: 26, h: 10, shape: "bolt" });
    g.ghosts.push({ x: g.player.x, y: g.player.y, w: g.player.w, h: g.player.h, life: 10, color: "#ffe44a" });
  },
  thunder(g) {
    const target = nearest(g);
    const tx = target ? target.x + target.w / 2 : g.player.x + 200 * g.player.facing;
    const ty = target ? target.y : g.player.y;
    const dmg = 36 + g.player.evo * 10;
    g.bolts.push({ x1: g.player.x + g.player.w / 2, y1: g.player.y, x2: tx, y2: ty, life: 14, dmg });
    if (g.player.evo >= 2) {
      g.bolts.push({ x1: g.player.x + g.player.w / 2, y1: g.player.y - 8, x2: tx - 16, y2: ty + 10, life: 10, dmg: dmg * 0.4 });
    }
    if (target) {
      target.hp -= dmg;
      capEnemy(target, Math.sign(target.x - g.player.x) * 2);
      if (g.nums) g.nums.add(target.x, target.y, "" + dmg, "#9cf", true);
    }
    g.fx.emit(tx, ty, { color: "#fff36a", count: 16, size: 4, speed: 4, star: true });
  },
  breath(g) {
    shot(g, { color: "#ff6a2a", w: 26, h: 18, dmg: 20, vx: 9, shape: "flame" });
    if (g.player.evo >= 1) shot(g, { color: "#ff9a3a", w: 18, h: 14, dmg: 10, vx: 7, vy: -2, shape: "flame" });
    if (g.player.evo >= 2) shot(g, { color: "#ffd36a", w: 18, h: 14, dmg: 10, vx: 7, vy: 2, shape: "flame" });
    boom(g, "#ff6a2a", 10);
  },
  wing(g) {
    g.player.vy = -8;
    g.player.vx = 11 * g.player.facing;
    g.player.gliding = 40;
    shot(g, { color: "#ff8844", w: 28, h: 16, dmg: 14, vx: 9, shape: "wind" });
    if (g.player.evo >= 2) shot(g, { color: "#ffe36a", w: 20, h: 12, dmg: 8, vx: 7, vy: 1.6, shape: "wind" });
  },
  rage(g) {
    const n = 10;
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n;
      g.projectiles.push({
        x: g.player.x + g.player.w / 2, y: g.player.y + 8,
        vx: Math.cos(a) * 6.2, vy: Math.sin(a) * 6.2,
        w: 18, h: 16, life: 40, dmg: 16 + g.player.evo * 4,
        color: i % 2 ? "#ff4a20" : "#ffd36a", shape: "flame", owner: "player", trail: true,
      });
    }
    boom(g, "#f40", 16);
  },
  claw(g) {
    shot(g, { color: "#ff8ad4", vx: 11, w: 18, h: 18, dmg: 15, spin: true, shape: "yarn" });
    if (g.player.evo >= 1) shot(g, { color: "#ffb6e4", vx: 9, vy: -2.2, w: 14, h: 14, dmg: 8, spin: true, shape: "yarn" });
    if (g.player.evo >= 3) shot(g, { color: "#fff", vx: 7, vy: 2, w: 12, h: 12, dmg: 7, spin: true, shape: "crescent" });
    boom(g, "#ff8ad4", 8);
  },
  catdash(g) {
    g.player.vx = 14 * g.player.facing;
    g.player.vy = -5;
    g.player.invuln = Math.max(g.player.invuln, 12);
    shot(g, { color: "#ff8ad4", vx: 11, w: 22, h: 16, dmg: 12, shape: "crescent" });
    g.ghosts.push({ x: g.player.x, y: g.player.y, w: g.player.w, h: g.player.h, life: 10, color: "#ff8ad4" });
  },
  lives(g) {
    const heal = 36 + g.player.evo * 8;
    g.player.health = Math.min(g.player.maxHealth, g.player.health + heal);
    g.player.invuln = Math.max(g.player.invuln, 40);
    if (g.nums) g.nums.add(g.player.x, g.player.y, "+" + heal, "#6f6");
    boom(g, "#fff", 16);
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * 2 * i) / 6;
      g.projectiles.push({
        x: g.player.x + g.player.w / 2, y: g.player.y + g.player.h / 2,
        vx: Math.cos(a) * 2.6, vy: Math.sin(a) * 2.6,
        w: 14, h: 14, life: 34, dmg: 6, color: "#ff8ad4", shape: "heart", owner: "player", spin: true, trail: false,
      });
    }
  },
};

function nearest(g) {
  let best = null, d = 1e9;
  for (const e of g.enemies) {
    const dd = Math.hypot(e.x - g.player.x, e.y - g.player.y);
    if (dd < d) { d = dd; best = e; }
  }
  return best;
}

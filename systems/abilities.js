import { vfxSprite } from "../characters/sprites.js";

export const ABILITY_DEFS = {
  ukulele: { name: "Ukeleleazo", key: "J", cd: 480, color: "#ffb347" },
  hula: { name: "Hula-zarpazo", key: "K", cd: 1100, color: "#ff5ad5" },
  ohana: { name: "Rayo Ohana", key: "L", cd: 2600, color: "#ffd36a" },
  dash: { name: "Plasma Ñam", key: "J", cd: 440, color: "#6af" },
  claws: { name: "Arañazo", key: "K", cd: 620, color: "#9cf" },
  exp626: { name: "Ráfaga Ñam", key: "L", cd: 2400, color: "#49f" },
  shock: { name: "Chispa", key: "J", cd: 420, color: "#ffe14a" },
  quick: { name: "Ataque Rápido", key: "K", cd: 650, color: "#fff3a0" },
  thunder: { name: "¡Trueno!", key: "L", cd: 2400, color: "#9cf" },
  claw: { name: "Ovillo", key: "J", cd: 400, color: "#ff8ad4" },
  catdash: { name: "Ronroneo", key: "K", cd: 1000, color: "#ffb6e4" },
  lives: { name: "Rayo Michi", key: "L", cd: 2600, color: "#ff8ad4" },
  breath: { name: "Estornudo picante", key: "J", cd: 500, color: "#ff6a2a" },
  wing: { name: "Aletazo", key: "K", cd: 740, color: "#f84" },
  rage: { name: "Mucho fuego", key: "L", cd: 2700, color: "#f30" },
  acorn: { name: "Bellotazo", key: "J", cd: 380, color: "#c4783a" },
  scramble: { name: "Correbellota", key: "K", cd: 580, color: "#e8b07a" },
  nutstorm: { name: "Granizada de nueces", key: "L", cd: 2200, color: "#ffe6a0" },
  salt: { name: "Sal al cubo", key: "J", cd: 360, color: "#fff3c0" },
  ketchup: { name: "Chorro kétchup", key: "K", cd: 620, color: "#e23b3b" },
  fryer: { name: "¡A freír!", key: "L", cd: 2800, color: "#ffd36a" },
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
    dmg: (extra.dmg ?? 18) * (1 + evo * 0.32),
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

function ringNova(g, color, dmg, n) {
  const p = g.player;
  const cx = p.x + p.w / 2;
  const cy = p.y + p.h / 2;
  const count = n || 12 + p.evo;
  const reach = 8.4 + p.evo * 0.6;
  for (let i = 0; i < count; i++) {
    const a = (Math.PI * 2 * i) / count;
    g.projectiles.push({
      x: cx, y: cy,
      vx: Math.cos(a) * reach,
      vy: Math.sin(a) * reach,
      w: 20, h: 20, life: 40,
      dmg: (dmg || 14) + p.evo * 3,
      color, shape: "ring", owner: "player", trail: false,
    });
  }
  const rad = 170 + p.evo * 18;
  for (const e of g.enemies) {
    if (Math.hypot(e.x + e.w / 2 - cx, e.y + e.h / 2 - cy) < rad) {
      const hit = Math.round((dmg || 14) + p.evo * 3);
      e.hp -= hit;
      capEnemy(e, Math.sign(e.x - p.x) || 1 * 2.4);
      if (g.nums) g.nums.add(e.x, e.y, "" + hit, color, hit >= 30);
    }
  }
  boom(g, color, 18);
}

function skyStrike(g, color, dmg) {
  const p = g.player;
  const target = nearest(g);
  const tx = target ? target.x + target.w / 2 : p.x + 260 * p.facing;
  const ty = target ? target.y + target.h / 2 : p.y;
  const hit = Math.round((dmg || 38) + p.evo * 12);
  g.bolts.push({ x1: tx, y1: ty - 320, x2: tx, y2: ty, life: 18, dmg: hit });
  g.bolts.push({ x1: tx - 22, y1: ty - 220, x2: tx, y2: ty, life: 12, dmg: hit * 0.35 });
  g.bolts.push({ x1: tx + 22, y1: ty - 180, x2: tx, y2: ty, life: 10, dmg: hit * 0.25 });
  if (target) {
    target.hp -= hit;
    capEnemy(target, Math.sign(target.x - p.x) * 3);
    if (g.nums) g.nums.add(target.x, target.y, "" + hit, color || "#ffe66a", true);
  }
  g.fx.emit(tx, ty, { color: color || "#ffe66a", count: 28, size: 5, speed: 5, star: true, up: 2 });
  g.shake = Math.min(18, (g.shake || 0) + 8);
  g.flash = 8;
}

function capEnemy(e, vx) {
  e.vx = Math.max(-4.2, Math.min(4.2, vx));
  e.stun = Math.max(e.stun || 0, 22);
}

const CASTERS = {
  ukulele(g) {
    const evo = g.player.evo || 0;
    shot(g, { color: "#ffb347", w: 22, h: 22, dmg: 18, vx: 10, spin: true, shape: "note" });
    if (evo >= 1) shot(g, { color: "#ffd36a", w: 16, h: 16, dmg: 10, vx: 8, vy: -2.6, spin: true, shape: "note" });
    if (evo >= 2) shot(g, { color: "#ff8a3a", w: 16, h: 16, dmg: 10, vx: 8, vy: 2.6, spin: true, shape: "note" });
    if (evo >= 3) shot(g, { color: "#fff1a8", w: 14, h: 14, dmg: 8, vx: 6, spin: true, shape: "leaf" });
    if (evo >= 4) {
      shot(g, { color: "#ffd76a", w: 28, h: 28, dmg: 22, vx: 12, spin: true, shape: "note" });
      shot(g, { color: "#2ec9c0", w: 18, h: 18, dmg: 14, vx: 9, vy: -3.2, spin: true, shape: "leaf" });
      shot(g, { color: "#ff4d78", w: 18, h: 18, dmg: 14, vx: 9, vy: 3.2, spin: true, shape: "leaf" });
      boom(g, "#ffd76a", 22);
    } else boom(g, "#ffb347", 10);
  },
  hula(g) {
    const evo = g.player.evo || 0;
    g.player.invuln = Math.max(g.player.invuln, 18 + (evo >= 4 ? 8 : 0));
    ringNova(g, evo >= 4 ? "#ffd76a" : "#ff6ad5", evo >= 4 ? 22 : 15, evo >= 4 ? 18 : 14);
  },
  ohana(g) {
    const heal = 18 + g.player.evo * 6;
    g.player.health = Math.min(g.player.maxHealth, g.player.health + heal);
    g.player.invuln = Math.max(g.player.invuln, 20);
    if (g.nums) g.nums.add(g.player.x, g.player.y, "+" + heal, "#6f6");
    skyStrike(g, "#ffe66a", 42);
  },
  dash(g) {
    const evo = g.player.evo || 0;
    shot(g, { color: "#66ccff", w: 28, h: 12, dmg: 20, vx: 13, shape: "bolt" });
    if (evo >= 2) shot(g, { color: "#d6f4ff", w: 18, h: 10, dmg: 10, vx: 10, vy: -1.4, shape: "bolt" });
    if (evo >= 4) {
      shot(g, { color: "#9ef0ff", w: 40, h: 16, dmg: 28, vx: 16, shape: "bolt" });
      shot(g, { color: "#a064ff", w: 20, h: 20, dmg: 16, vx: 11, vy: -2.5, shape: "orb" });
      shot(g, { color: "#a064ff", w: 20, h: 20, dmg: 16, vx: 11, vy: 2.5, shape: "orb" });
      boom(g, "#9ef0ff", 20);
    } else boom(g, "#6af", 8);
  },
  claws(g) {
    const evo = g.player.evo || 0;
    g.player.vx = (10 + (evo >= 4 ? 4 : 0)) * g.player.facing;
    g.player.invuln = Math.max(g.player.invuln, 12 + (evo >= 4 ? 6 : 0));
    ringNova(g, evo >= 4 ? "#9ef0ff" : "#9cf", evo >= 4 ? 22 : 14, evo >= 4 ? 16 : 12);
  },
  exp626(g) {
    skyStrike(g, "#66ccff", 44);
  },
  shock(g) {
    const evo = g.player.evo || 0;
    shot(g, { color: "#ffe14a", w: 30, h: 14, dmg: 19, vx: 13, shape: "zap" });
    if (evo >= 1) shot(g, { color: "#fff36a", w: 18, h: 10, dmg: 9, vx: 11, vy: -2.4, shape: "zap" });
    if (evo >= 3) shot(g, { color: "#fff", w: 16, h: 10, dmg: 8, vx: 9, vy: 2.4, shape: "zap" });
    if (evo >= 4) {
      shot(g, { color: "#7ecbff", w: 48, h: 18, dmg: 30, vx: 16, shape: "zap" });
      shot(g, { color: "#fff6a0", w: 24, h: 24, dmg: 16, vx: 10, vy: -3, shape: "orb" });
      shot(g, { color: "#fff6a0", w: 24, h: 24, dmg: 16, vx: 10, vy: 3, shape: "orb" });
      boom(g, "#7ecbff", 24);
    } else boom(g, "#fff36a", 10);
  },
  quick(g) {
    const evo = g.player.evo || 0;
    g.player.vx = (12 + (evo >= 4 ? 4 : 0)) * g.player.facing;
    g.player.invuln = Math.max(g.player.invuln, 12 + (evo >= 4 ? 6 : 0));
    ringNova(g, evo >= 4 ? "#7ecbff" : "#fff36a", evo >= 4 ? 20 : 13, evo >= 4 ? 16 : 12);
  },
  thunder(g) {
    skyStrike(g, "#ffe14a", 48);
  },
  breath(g) {
    const evo = g.player.evo || 0;
    // Per-form identity for Dino J-ability (other chars use other casters)
    if (evo <= 0) {
      // Bebé: short sneeze puff
      shot(g, { color: "#b8f0c8", w: 14, h: 12, dmg: 11, vx: 6.5, life: 20, shape: "flame" });
      boom(g, "#9ae8b8", 6);
    } else if (evo <= 2) {
      // Dino / Pico: focused flame spit (Pico adds leaner secondaries)
      shot(g, { color: "#ff6a2a", w: 22 + evo * 3, h: 15 + evo, dmg: 17 + evo * 3, vx: 10, life: 38, shape: "flame" });
      if (evo >= 2) {
        shot(g, { color: "#2ec4b6", w: 14, h: 11, dmg: 11, vx: 9, vy: -2.2, life: 32, shape: "flame" });
        shot(g, { color: "#ffe66a", w: 12, h: 10, dmg: 9, vx: 8.5, vy: 2.0, life: 30, shape: "flame" });
      } else {
        shot(g, { color: "#ff9a3a", w: 16, h: 12, dmg: 9, vx: 8, vy: -1.6, life: 30, shape: "flame" });
      }
      boom(g, "#ff6a2a", 10 + evo);
    } else if (evo === 3) {
      // Rex: wide cone of clay-fire
      const cone = [
        { color: "#ff9a3a", vy: -3.4, vx: 7.6, dmg: 14 },
        { color: "#ff6a2a", vy: -1.2, vx: 8.8, dmg: 17 },
        { color: "#c96b2a", vy: 0.6, vx: 9.0, dmg: 18 },
        { color: "#ff4a20", vy: 2.4, vx: 8.2, dmg: 15 },
        { color: "#e89040", vy: 3.6, vx: 7.2, dmg: 13 },
      ];
      for (const c of cone) {
        shot(g, { color: c.color, w: 20, h: 15, dmg: c.dmg, vx: c.vx, vy: c.vy, life: 34, shape: "flame" });
      }
      boom(g, "#c96b2a", 16);
    } else {
      // GOD: emerald-gold comet beam + orbiting embers
      shot(g, { color: "#ffd84a", w: 64, h: 18, dmg: 42, vx: 17, life: 20, shape: "bolt" });
      shot(g, { color: "#fff1a0", w: 40, h: 10, dmg: 24, vx: 19, life: 16, shape: "bolt" });
      shot(g, { color: "#2ecf7a", w: 22, h: 22, dmg: 18, vx: 13, vy: -2.2, life: 18, shape: "flame" });
      shot(g, { color: "#2ecf7a", w: 22, h: 22, dmg: 18, vx: 13, vy: 2.2, life: 18, shape: "flame" });
      shot(g, { color: "#0f8a4a", w: 16, h: 16, dmg: 12, vx: 10, vy: -3.5, life: 14, shape: "orb" });
      shot(g, { color: "#0f8a4a", w: 16, h: 16, dmg: 12, vx: 10, vy: 3.5, life: 14, shape: "orb" });
      boom(g, "#ffd84a", 28);
    }
  },
  wing(g) {
    const evo = g.player.evo || 0;
    g.player.vy = -7 - (evo >= 4 ? 2.5 : 0);
    g.player.invuln = Math.max(g.player.invuln, 12 + (evo >= 4 ? 6 : 0));
    // GOD form already glides; Aletazo still grants a boosted hop-glide burst
    if (evo >= 4) g.player.gliding = Math.max(g.player.gliding || 0, 36);
    ringNova(g, evo >= 4 ? "#2ecf7a" : "#ff8844", 14 + evo + (evo >= 4 ? 8 : 0), 12 + (evo >= 3 ? 2 : 0) + (evo >= 4 ? 4 : 0));
  },
  rage(g) {
    skyStrike(g, "#ff4a20", 46);
  },
  claw(g) {
    const evo = g.player.evo || 0;
    shot(g, { color: "#ff8ad4", vx: 11, w: 18, h: 18, dmg: 15, spin: true, shape: "yarn" });
    if (evo >= 1) shot(g, { color: "#ffb6e4", vx: 9, vy: -2.2, w: 14, h: 14, dmg: 8, spin: true, shape: "yarn" });
    if (evo >= 3) shot(g, { color: "#fff", vx: 7, vy: 2, w: 12, h: 12, dmg: 7, spin: true, shape: "crescent" });
    if (evo >= 4) {
      shot(g, { color: "#e8e0ff", vx: 13, w: 24, h: 24, dmg: 20, spin: true, shape: "heart" });
      shot(g, { color: "#ff7ad8", vx: 10, vy: -3, w: 16, h: 16, dmg: 12, spin: true, shape: "yarn" });
      shot(g, { color: "#ff7ad8", vx: 10, vy: 3, w: 16, h: 16, dmg: 12, spin: true, shape: "yarn" });
      boom(g, "#ff7ad8", 20);
    } else boom(g, "#ff8ad4", 8);
  },
  catdash(g) {
    const evo = g.player.evo || 0;
    g.player.invuln = Math.max(g.player.invuln, 14 + (evo >= 4 ? 8 : 0));
    ringNova(g, evo >= 4 ? "#e8e0ff" : "#ff8ad4", evo >= 4 ? 20 : 13, evo >= 4 ? 16 : 12);
  },
  lives(g) {
    const heal = 16 + g.player.evo * 5;
    g.player.health = Math.min(g.player.maxHealth, g.player.health + heal);
    if (g.nums) g.nums.add(g.player.x, g.player.y, "+" + heal, "#6f6");
    skyStrike(g, "#ff8ad4", 40);
  },
  acorn(g) {
    shot(g, { color: "#c4783a", vx: 12, w: 18, h: 18, dmg: 17, spin: true, shape: "orb" });
    if (g.player.evo >= 1) shot(g, { color: "#e8b07a", vx: 10, vy: -2.2, w: 14, h: 14, dmg: 9, spin: true, shape: "orb" });
    if (g.player.evo >= 3) shot(g, { color: "#8a4a18", vx: 8, vy: 2.2, w: 12, h: 12, dmg: 8, spin: true, shape: "orb" });
    boom(g, "#c4783a", 8);
  },
  scramble(g) {
    g.player.invuln = Math.max(g.player.invuln, 12);
    ringNova(g, "#e8b07a", 13, 12);
  },
  nutstorm(g) {
    const target = nearest(g);
    const tx = target ? target.x + target.w / 2 : g.player.x + 200 * g.player.facing;
    const ty = target ? target.y : g.player.y;
    const dmg = 34 + g.player.evo * 10;
    g.bolts.push({ x1: g.player.x + g.player.w / 2, y1: g.player.y, x2: tx, y2: ty, life: 14, dmg });
    shot(g, { color: "#c4783a", vx: 9, vy: -3, w: 16, h: 16, dmg: 12, spin: true, shape: "orb" });
    shot(g, { color: "#8a4a18", vx: 9, vy: 3, w: 16, h: 16, dmg: 12, spin: true, shape: "orb" });
    if (target) {
      target.hp -= dmg;
      capEnemy(target, Math.sign(target.x - g.player.x) * 2);
      if (g.nums) g.nums.add(target.x, target.y, "" + dmg, "#e8b07a", true);
    }
    g.fx.emit(tx, ty, { color: "#ffe6a0", count: 16, size: 4, speed: 4, star: true });
  },
  salt(g) {
    const evo = g.player.evo || 0;
    shot(g, { color: "#fff3c0", vx: 11, w: 16, h: 16, dmg: 15, spin: true, shape: "yarn" });
    if (evo >= 1) shot(g, { color: "#ffe08a", vx: 9, vy: -2, w: 12, h: 12, dmg: 8, spin: true, shape: "yarn" });
    if (evo >= 4) {
      shot(g, { color: "#ff5a3a", vx: 14, w: 28, h: 20, dmg: 26, shape: "flame" });
      shot(g, { color: "#fff8e8", vx: 10, vy: -2.8, w: 14, h: 14, dmg: 12, spin: true, shape: "yarn" });
      shot(g, { color: "#fff8e8", vx: 10, vy: 2.8, w: 14, h: 14, dmg: 12, spin: true, shape: "yarn" });
      shot(g, { color: "#ffd76a", vx: 8, vy: -1.2, w: 12, h: 12, dmg: 10, spin: true, shape: "orb" });
      boom(g, "#ff5a3a", 22);
    } else boom(g, "#fff3c0", 8);
  },
  ketchup(g) {
    const evo = g.player.evo || 0;
    g.player.invuln = Math.max(g.player.invuln, 12 + (evo >= 4 ? 8 : 0));
    ringNova(g, evo >= 4 ? "#ff5a3a" : "#e23b3b", evo >= 4 ? 22 : 14, evo >= 4 ? 18 : 12);
  },
  fryer(g) {
    skyStrike(g, "#ffd36a", 42);
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

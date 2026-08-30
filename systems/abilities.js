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
  if (pr.spin) ctx.rotate(t * 0.18 + (pr.rot || 0));
  ctx.shadowBlur = 16;
  ctx.shadowColor = pr.color;
  ctx.fillStyle = pr.color;
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1.2;
  const shape = pr.shape || "orb";
  if (shape === "note") {
    ctx.beginPath();
    ctx.arc(0, 6, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(4, -10, 2.2, 16);
    ctx.beginPath();
    ctx.moveTo(6, -10);
    ctx.quadraticCurveTo(14, -6, 6, -1);
    ctx.fill();
  } else if (shape === "bolt") {
    ctx.beginPath();
    ctx.moveTo(-pr.w / 2, 0);
    ctx.lineTo(pr.w / 2, -pr.h / 2);
    ctx.lineTo(pr.w / 2 - 4, 0);
    ctx.lineTo(pr.w / 2, pr.h / 2);
    ctx.closePath();
    ctx.fill();
  } else if (shape === "flame") {
    ctx.beginPath();
    ctx.moveTo(-pr.w / 2, 0);
    ctx.quadraticCurveTo(0, -pr.h, pr.w / 2, 0);
    ctx.quadraticCurveTo(0, pr.h * 0.6, -pr.w / 2, 0);
    ctx.fill();
  } else if (shape === "ring") {
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, pr.w / 2, 0, Math.PI * 2);
    ctx.strokeStyle = pr.color;
    ctx.stroke();
  } else if (shape === "claw") {
    ctx.beginPath();
    ctx.moveTo(-6, -8); ctx.lineTo(10, 0); ctx.lineTo(-6, 8);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(5, pr.w / 2), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.55)";
    ctx.beginPath();
    ctx.arc(-2, -2, Math.max(2, pr.w / 5), 0, Math.PI * 2);
    ctx.fill();
  }
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
    shot(g, { color: "#ffb347", w: 18, h: 18, dmg: 18, vx: 10, spin: true, shape: "note" });
    if (g.player.evo >= 1) shot(g, { color: "#ffd36a", w: 12, h: 12, dmg: 10, vx: 8, vy: -2.2, spin: true, shape: "note" });
    if (g.player.evo >= 2) shot(g, { color: "#ff8a3a", w: 12, h: 12, dmg: 10, vx: 8, vy: 2.2, spin: true, shape: "note" });
    boom(g, "#ffb347", 12);
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
        w: 14, h: 14, life: 26, dmg: 11 + g.player.evo * 3,
        color: "#ff6ad5", shape: "ring", owner: "player",
      });
    }
    boom(g, "#ff6ad5", 18);
  },
  ohana(g) {
    g.player.health = Math.min(g.player.maxHealth, g.player.health + 22 + g.player.evo * 8);
    g.player.invuln = Math.max(g.player.invuln, 24);
    boom(g, "#ffd36a", 28);
    for (const e of g.enemies) {
      const dir = Math.sign(e.x - g.player.x) || 1;
      capEnemy(e, dir * 3.2);
      e.vy = -3;
    }
  },
  dash(g) {
    shot(g, { color: "#66ccff", w: 22, h: 10, dmg: 20, vx: 12, shape: "bolt" });
    boom(g, "#6af", 10);
  },
  claws(g) {
    g.player.vx = 13 * g.player.facing;
    g.player.invuln = Math.max(g.player.invuln, 10);
    shot(g, { color: "#9cf", w: 24, h: 10, dmg: 16, vx: 11, shape: "claw" });
    shot(g, { color: "#cfe", w: 16, h: 8, dmg: 10, vx: 9, vy: -1.6, shape: "claw" });
    boom(g, "#9cf", 10);
  },
  exp626(g) {
    g.player.vx = 8 * g.player.facing;
    for (let i = -1; i <= 1; i++) shot(g, { color: "#49f", vy: i * 2.4, dmg: 18, w: 20, shape: "bolt" });
    boom(g, "#49f", 20);
  },
  shock(g) {
    shot(g, { color: "#ffe14a", w: 26, h: 10, dmg: 19, vx: 13, shape: "bolt" });
    if (g.player.evo >= 1) shot(g, { color: "#fff36a", w: 14, h: 8, dmg: 9, vx: 11, vy: -2, shape: "bolt" });
    boom(g, "#fff36a", 14);
  },
  quick(g) {
    g.player.vx = 16 * g.player.facing;
    g.player.invuln = Math.max(g.player.invuln, 10);
    shot(g, { color: "#fff3a0", vx: 14, dmg: 12, life: 22, shape: "bolt" });
  },
  thunder(g) {
    const target = nearest(g);
    const tx = target ? target.x + target.w / 2 : g.player.x + 200 * g.player.facing;
    const ty = target ? target.y : g.player.y;
    g.bolts.push({ x1: g.player.x + g.player.w / 2, y1: g.player.y, x2: tx, y2: ty, life: 14, dmg: 36 + g.player.evo * 10 });
    if (target) { target.hp -= 36 + g.player.evo * 10; capEnemy(target, Math.sign(target.x - g.player.x) * 2); }
    g.fx.emit(tx, ty, { color: "#9cf", count: 26, size: 4, speed: 4 });
  },
  breath(g) {
    shot(g, { color: "#ff6a2a", w: 22, h: 16, dmg: 20, vx: 9, shape: "flame" });
    if (g.player.evo >= 1) shot(g, { color: "#ff9a3a", w: 14, h: 12, dmg: 10, vx: 7, vy: -1.8, shape: "flame" });
    if (g.player.evo >= 2) shot(g, { color: "#ffd36a", w: 14, h: 12, dmg: 10, vx: 7, vy: 1.8, shape: "flame" });
    boom(g, "#ff6a2a", 14);
  },
  wing(g) {
    g.player.vy = -8;
    g.player.vx = 11 * g.player.facing;
    g.player.gliding = 40;
    shot(g, { color: "#f84", w: 18, h: 10, dmg: 14, vx: 8, shape: "claw" });
  },
  rage(g) {
    const n = 10;
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n;
      g.projectiles.push({
        x: g.player.x + g.player.w / 2, y: g.player.y + 8,
        vx: Math.cos(a) * 6.2, vy: Math.sin(a) * 6.2,
        w: 16, h: 16, life: 40, dmg: 16 + g.player.evo * 4,
        color: "#ff4a20", shape: "flame", owner: "player",
      });
    }
    boom(g, "#f40", 24);
  },
  claw(g) {
    shot(g, { color: "#ff8ad4", vx: 11, w: 16, h: 16, dmg: 15, spin: true, shape: "orb" });
    if (g.player.evo >= 1) shot(g, { color: "#ffb6e4", vx: 9, vy: -2, w: 12, h: 12, dmg: 8, spin: true, shape: "orb" });
    boom(g, "#ff8ad4", 10);
  },
  catdash(g) {
    g.player.vx = 14 * g.player.facing;
    g.player.vy = -5;
    g.player.invuln = Math.max(g.player.invuln, 12);
    shot(g, { color: "#faf", vx: 10, dmg: 12, shape: "claw" });
  },
  lives(g) {
    g.player.health = Math.min(g.player.maxHealth, g.player.health + 36 + g.player.evo * 8);
    g.player.invuln = Math.max(g.player.invuln, 40);
    boom(g, "#fff", 26);
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

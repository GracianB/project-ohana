export const ABILITY_DEFS = {
  ukulele: { name: "Ukulele Blast", key: "J", cd: 700, color: "#ff8a3a" },
  hula: { name: "Hula Spin", key: "K", cd: 1100, color: "#ff5ad5" },
  ohana: { name: "Ohana Power", key: "L", cd: 2800, color: "#ffd36a" },
  dash: { name: "Alien Dash", key: "J", cd: 650, color: "#6af" },
  claws: { name: "Plasma Claws", key: "K", cd: 500, color: "#9cf" },
  exp626: { name: "Experiment 626", key: "L", cd: 2600, color: "#49f" },
  shock: { name: "Impactrueno", key: "J", cd: 600, color: "#ffe14a" },
  quick: { name: "Ataque Rápido", key: "K", cd: 500, color: "#fff3a0" },
  thunder: { name: "Thunder", key: "L", cd: 2400, color: "#9cf" },
  breath: { name: "Fire Breath", key: "J", cd: 800, color: "#ff6a2a" },
  wing: { name: "Wing Dash", key: "K", cd: 700, color: "#f84" },
  rage: { name: "Dragon Rage", key: "L", cd: 3000, color: "#f30" },
  claw: { name: "Claw Rush", key: "J", cd: 450, color: "#ff8ad4" },
  catdash: { name: "Cat Dash", key: "K", cd: 550, color: "#faf" },
  lives: { name: "Nine Lives", key: "L", cd: 3200, color: "#fff" },
};

export function useAbility(game, index) {
  const id = game.player.abilities[index];
  const def = ABILITY_DEFS[id];
  if (!def) return;
  const now = performance.now();
  game.player.cds = game.player.cds || {};
  if ((game.player.cds[id] || 0) > now) return;
  game.player.cds[id] = now + def.cd / (1 + game.player.evo * 0.15);
  const fn = CASTERS[id];
  if (fn) fn(game);
}

function proj(game, extra) {
  const p = game.player;
  game.projectiles.push({
    x: p.x + p.w / 2,
    y: p.y + p.h / 2,
    vx: (extra.vx ?? 8) * p.facing,
    vy: extra.vy ?? 0,
    w: extra.w ?? 14,
    h: extra.h ?? 10,
    life: extra.life ?? 50,
    dmg: extra.dmg ?? 18,
    color: extra.color ?? "#fff",
    homing: extra.homing || false,
    spin: extra.spin || false,
    owner: "player",
  });
}

const CASTERS = {
  ukulele(g) {
    proj(g, { color: "#ffb347", w: 16, h: 16, dmg: 16, spin: true });
    g.fx.emit(g.player.x, g.player.y, { color: "#ffb347", count: 10 });
  },
  hula(g) {
    g.player.invuln = 18;
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI * 2 * i) / 8;
      g.projectiles.push({
        x: g.player.x + g.player.w / 2,
        y: g.player.y + g.player.h / 2,
        vx: Math.cos(a) * 5,
        vy: Math.sin(a) * 5,
        w: 10, h: 10, life: 28, dmg: 12, color: "#ff6ad5", owner: "player",
      });
    }
  },
  ohana(g) {
    g.player.health = Math.min(g.player.maxHealth, g.player.health + 25);
    g.fx.emit(g.player.x, g.player.y, { color: "#ffd36a", count: 24, size: 4, up: 1 });
    for (const e of g.enemies) e.vx += Math.sign(e.x - g.player.x) * 8;
  },
  dash(g) {
    g.player.vx = 16 * g.player.facing;
    g.player.invuln = 12;
    g.fx.emit(g.player.x, g.player.y, { color: "#6af", count: 12 });
  },
  claws(g) {
    proj(g, { color: "#9cf", w: 22, h: 8, dmg: 22, vx: 11 });
  },
  exp626(g) {
    g.player.vx = 10 * g.player.facing;
    for (let i = -1; i <= 1; i++) proj(g, { color: "#49f", vy: i * 3, dmg: 20, w: 18 });
  },
  shock(g) {
    proj(g, { color: "#ffe14a", w: 28, h: 8, dmg: 20, vx: 12 });
    g.fx.emit(g.player.x + 20 * g.player.facing, g.player.y, { color: "#fff36a", count: 14 });
  },
  quick(g) {
    g.player.vx = 18 * g.player.facing;
    g.player.invuln = 10;
    proj(g, { color: "#fff3a0", vx: 14, dmg: 12, life: 18 });
  },
  thunder(g) {
    const target = nearest(g);
    const tx = target ? target.x : g.player.x + 180 * g.player.facing;
    const ty = target ? target.y : g.player.y;
    g.bolts.push({ x1: g.player.x, y1: g.player.y, x2: tx, y2: ty, life: 16, dmg: 40 });
    if (target) target.hp -= 40;
    g.fx.emit(tx, ty, { color: "#9cf", count: 20, size: 4 });
  },
  breath(g) {
    for (let i = 0; i < 5; i++) {
      proj(g, { color: "#ff6a2a", vx: 6 + i, vy: (Math.random() - 0.5) * 2, w: 18, h: 12, dmg: 14, life: 36 });
    }
  },
  wing(g) {
    g.player.vy = -8;
    g.player.vx = 12 * g.player.facing;
    g.player.gliding = 40;
  },
  rage(g) {
    for (let i = 0; i < 12; i++) {
      const a = (Math.PI * 2 * i) / 12;
      g.projectiles.push({
        x: g.player.x + g.player.w / 2, y: g.player.y,
        vx: Math.cos(a) * 7, vy: Math.sin(a) * 7,
        w: 16, h: 16, life: 50, dmg: 18, color: "#f40", owner: "player",
      });
    }
  },
  claw(g) {
    proj(g, { color: "#ff8ad4", vx: 10, w: 16, h: 8, dmg: 14 });
    proj(g, { color: "#ff8ad4", vx: 8, vy: -2, w: 12, h: 8, dmg: 10 });
  },
  catdash(g) {
    g.player.vx = 15 * g.player.facing;
    g.player.vy = -4;
    g.player.invuln = 12;
  },
  lives(g) {
    g.player.health = Math.min(g.player.maxHealth, g.player.health + 40);
    g.player.invuln = 50;
    g.fx.emit(g.player.x, g.player.y, { color: "#fff", count: 30, size: 3 });
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

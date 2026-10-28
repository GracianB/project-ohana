// V617 — Custodio del Infinito EXTREMO
// Mini-boss de Yomi con 3 fases claras, telegraphs fuertes, vulnerabilidades reales
// y patrones que recompensan el uso de J/K/L y el ghost.

import { chapterBossStart, chapterBossFinish } from './chapters-lunar-prism-embers.js';

export const YOMI_BOSS_ID = 'hub-yomi-boss-v617';
export const YOMI_BOSS = Object.freeze({ hp: 720, left: 10240, right: 11840, floor: 1134 });

const PATTERNS = Object.freeze(['drift', 'ping_volley', 'scan_ring', 'neural_pulse']);
const TAU = Math.PI * 2;

export function createYomiBoss(makeFoe, rng = () => 0.5, options = {}) {
  const arena = Object.freeze({ ...YOMI_BOSS, ...options.arena });
  const roomId = options.roomId || 'w1-yomi';
  const x = options.x ?? 11000;
  const e = makeFoe(x, arena.floor - 140, 'escoria', roomId, 992, { rng });
  e._chapterArena = arena;
  e.x = x; e.w = 160; e.h = 180; e.y = arena.floor - e.h;
  e.hp = e.max = arena.hp;
  e.miniBoss = true; e._yomiBoss = true;
  e._campaignOriginal = true; e.spawnIndex = 992;
  e._encounterSaveId = options.encounterId || YOMI_BOSS_ID;
  e.roomId = roomId; e.color = '#4ff0c8'; e.contactDmg = 0;
  e._custodian = {
    phase: 'intro', clock: 120, attack: 0, tier: 1, aim: 1,
    burst: 0, exposed: false, orbit: 0, compiling: 0
  };
  return e;
}

export function updateYomiBoss(e, g, hurt) {
  if (!e?._yomiBoss) return false;
  const b = e._custodian, p = g.player, arena = e._chapterArena || YOMI_BOSS;
  const previous = b.phase;
  if (e.invuln > 0) e.invuln--;
  e.x = Math.max(arena.left, Math.min(arena.right - e.w, e.x));
  e.y = arena.floor - e.h; e.vy = 0; e.grounded = true; e.vx = 0; e.telegraph = false;
  b.orbit = (b.orbit || 0) + 0.045 * (b.tier === 3 ? 1.8 : 1);
  if (!p || p.dead || e.hp <= 0) return true;
  if (!chapterBossStart(e, g, b)) return true;

  b.tier = e.hp <= e.max * 0.28 ? 3 : e.hp <= e.max * 0.58 ? 2 : 1;
  const dx = p.x + p.w / 2 - (e.x + e.w / 2);
  const visible = e.x + e.w > g.cam.x && e.x < g.cam.x + (g.viewW || 1100);

  if (b.phase === 'intro') {
    if (visible && Math.abs(dx) < 720) {
      if (--b.clock === 70) g.nums?.add?.(e.x, e.y - 60, 'CUSTODIO DEL INFINITO', '#4ff0c8', true);
      if (b.clock <= 0) { b.phase = 'rest'; b.clock = 60; b.aim = Math.sign(dx) || 1; }
    }
  } else if (b.phase === 'rest') {
    b.exposed = true;
    if (--b.clock <= 0 && visible && Math.abs(dx) < 980) {
      b.aim = Math.sign(dx) || 1;
      b.phase = 'warn';
      b.clock = b.tier === 3 ? 28 : b.tier === 2 ? 38 : 48;
      b.exposed = false;
    }
  } else if (b.phase === 'warn') {
    e.telegraph = true;
    if ((e.stun || 0) >= 20) {
      b.phase = 'rest'; b.clock = 90; b.exposed = true;
      g.nums?.add?.(e.x, e.y - 40, '¡COMPILACIÓN INTERRUMPIDA!', '#ffd56b', true);
    } else if (--b.clock <= 0) {
      b.phase = 'attack'; b.clock = 36; b.burst = 0; b.compiling = 0;
    }
  } else if (b.phase === 'attack') {
    e.lunge = b.clock;
    if (!b.burst) {
      if (b.attack === 1) {
        for (let k = -1; k <= 1; k++) {
          g.projectiles?.push?.({
            x: e.x + e.w / 2, y: e.y + 40,
            w: 18, h: 18, vx: b.aim * (5 + k * 1.8), vy: -2.5 - Math.abs(k),
            life: 140, dmg: b.tier === 3 ? 16 : 11, owner: 'enemy', shape: 'orb', color: '#4ff0c8'
          });
        }
      }
      if (b.attack === 2 && b.tier >= 2) e._scanRing = 30;
      if (b.attack === 3 && b.tier === 3) e._neuralPulse = 40;
      b.burst = 1;
    }
    if (b.attack === 0) { e.x += b.aim * 6.5; e.facing = b.aim; }
    if (Math.abs(dx) < e.w * 0.5 && Math.abs(p.y + p.h / 2 - (e.y + e.h / 2)) < e.h * 0.55) {
      hurt?.(b.tier === 3 ? 16 : 11, 'yomi-boss');
    }
    if (--b.clock <= 0) {
      b.phase = 'rest';
      b.clock = b.tier === 3 ? 32 : 50;
      b.attack = (b.attack + 1) % PATTERNS.length;
      b.burst = 0;
    }
  }
  chapterBossFinish(e, g, b, previous);
  return true;
}

export function drawYomiBoss(ctx, e, cam, t, reduceMotion = false) {
  if (!e?._yomiBoss) return false;
  const b = e._custodian;
  const x = e.x - cam.x, y = e.y - cam.y;
  ctx.save();
  ctx.translate(x + e.w / 2, y + e.h - 40);
  ctx.scale(b.aim || 1, 1);

  const float = reduceMotion ? 0 : Math.sin(t * 0.08) * 5;
  ctx.translate(0, float);

  ctx.fillStyle = b.tier === 3 ? 'rgba(42,36,104,0.9)' : 'rgba(13,20,48,0.85)';
  ctx.strokeStyle = '#4ff0c8'; ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(-32, -20); ctx.quadraticCurveTo(-48, 40, -30, 80);
  ctx.quadraticCurveTo(0, 90, 30, 80); ctx.quadraticCurveTo(48, 40, 32, -20);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  const stars = Math.max(3, Math.floor(10 * (e.hp / e.max)));
  for (let s = 0; s < stars; s++) {
    const ang = s * (TAU / stars) + b.orbit;
    const sx = Math.cos(ang) * 38, sy = -60 + Math.sin(ang) * 12;
    ctx.fillStyle = ['#eb554a','#5ad1ff','#ffe14a','#c9a8ff','#ff6a2a','#4cbf56','#f0b43a','#e0402a','#f2c1ff','#4ff0c8'][s % 10];
    ctx.beginPath(); ctx.arc(sx, sy, 3.5, 0, TAU); ctx.fill();
  }

  ctx.fillStyle = '#0d1430';
  ctx.beginPath(); ctx.ellipse(0, -40, 20, 22, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#4ff0c8'; ctx.stroke();
  ctx.fillStyle = b.exposed ? '#ffd56b' : '#4ff0c8';
  ctx.beginPath(); ctx.arc(-8, -42, 4, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(8, -42, 4, 0, TAU); ctx.fill();

  if (e.telegraph) {
    ctx.strokeStyle = '#ff7f6e'; ctx.lineWidth = 2.5; ctx.setLineDash([6, 5]);
    ctx.strokeRect(-70, -110, 140, 130); ctx.setLineDash([]);
  }
  if (b.exposed) {
    ctx.strokeStyle = 'rgba(79,240,200,0.7)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, 75 + Math.sin(t * 0.2) * 6, 0, TAU); ctx.stroke();
  }

  ctx.restore();
  return true;
}

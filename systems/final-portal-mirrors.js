// V618 · Corazón de Ohana: diez reflejos REALES alimentan una única luz.
// Usa el mismo motor de arte de los héroes que la partida: no caricaturas
// genéricas, capturas de pantalla ni sprites desconectados de sus formas.
import {ROSTER} from '../characters/roster.js';
import {drawCharacter} from '../characters/draw.js';
import {WORLD1_ORDER, WORLD1_THEMES} from './world1-rooms.js';

const TAU = Math.PI * 2;
const HEROES = new Map(ROSTER.map(hero => [hero.id, hero]));
const clamp = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));
const CORE = Object.freeze({x: 6500, y: 940, radius: 88});

export const FINAL_PORTALS = Object.freeze(WORLD1_ORDER.map((hero, i) => Object.freeze({
  hero, x: 900 + i * 560, y: 990, rx: 73, ry: 112
})));
export const FINAL_HEART = CORE;

// Each rescued voice joins the light when the player reaches its reflection.
// Pure calculation: no changes to progress, rewards, combat, or saved games.
export function finalMirrorCharge(portals = FINAL_PORTALS, player = null) {
  if (!player || !portals?.length) return 0;
  const x = Number(player.x) + (Number(player.w) || 0) / 2;
  if (!Number.isFinite(x)) return 0;
  return portals.reduce((sum, p) => sum + clamp((x - p.x + 130) / 330), 0) / portals.length;
}

function drawRealHero(ctx, heroId, t, reduced) {
  const hero = HEROES.get(heroId);
  if (!hero || !hero.forms?.length) return;
  const evo = hero.forms.length - 1;
  const form = hero.forms[evo], w = form.w, h = form.h;
  // A locally constructed actor is visual only; never mutate the actual player.
  const actor = {...hero, ...form, id: hero.id, evo, w, h,
    x: -w / 2, y: -h, vx: 0, vy: 0, grounded: true, facing: 1,
    invuln: 0, stun: 0, melee: 0, dead: false, health: form.hp,
    maxHealth: form.hp, _theatreHQ: true};
  ctx.save();
  ctx.translate(0, 48);
  const scale = Math.min(1.9, 91 / Math.max(1, h));
  ctx.scale(scale, scale);
  drawCharacter(ctx, actor, {x: 0, y: 0}, reduced ? 0 : t, {reduceMotion: reduced});
  ctx.restore();
}

function drawMirror(ctx, p, cam, t, player, reduced, progress) {
  const x = p.x - cam.x, y = p.y - cam.y;
  const hero = HEROES.get(p.hero), theme = WORLD1_THEMES[p.hero];
  if (!hero || !theme) return;
  const rx = p.rx || 73, ry = p.ry || 112;
  // Avoid drawing nine expensive character rigs outside the viewport.
  const width = ctx.canvas?.width || 1600;
  if (x < -rx - 80 || x > width + rx + 80) return;
  const px = player ? Number(player.x) + (Number(player.w) || 0) / 2 : -Infinity;
  const near = Math.abs(px - p.x) < 210;
  const active = clamp((px - p.x + 130) / 330);
  const pulse = reduced ? 0 : Math.sin(t * 0.043 + p.x * 0.03) * 0.06;
  ctx.save();
  ctx.translate(x, y);
  // A dark reflecting surface provides enough contrast for the actual hero.
  ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, TAU);
  ctx.fillStyle = '#11152e'; ctx.fill();
  ctx.save(); ctx.clip();
  const bg = ctx.createLinearGradient(0, -ry, 0, ry);
  bg.addColorStop(0, '#11132c'); bg.addColorStop(0.5, theme.color);
  bg.addColorStop(1, '#080c24');
  ctx.globalAlpha = 0.48; ctx.fillStyle = bg; ctx.fillRect(-rx, -ry, rx * 2, ry * 2);
  ctx.globalAlpha = 1;
  // A vertical reflection is an actor, not a simplified head or symbol.
  drawRealHero(ctx, p.hero, t, reduced);
  const reflection = ctx.createLinearGradient(-rx, -ry, rx, ry);
  reflection.addColorStop(0, 'rgba(255,255,255,0.24)');
  reflection.addColorStop(0.36, 'rgba(255,255,255,0.02)');
  reflection.addColorStop(1, 'rgba(255,255,255,0.06)');
  ctx.fillStyle = reflection; ctx.fillRect(-rx, -ry, rx * 2, ry * 2);
  ctx.restore();
  ctx.shadowColor = theme.color; ctx.shadowBlur = near ? 18 : 5 + active * 12;
  ctx.lineWidth = near ? 5 : 3;
  ctx.strokeStyle = near ? '#fff5cd' : theme.color;
  ctx.beginPath(); ctx.ellipse(0, 0, rx + 2, ry + 2, 0, 0, TAU); ctx.stroke();
  ctx.shadowBlur = 0;
  // Ten real names, even when the active player is also Kilo.
  ctx.font = 'bold 17px sans-serif'; ctx.textAlign = 'center';
  ctx.strokeStyle = '#101029'; ctx.lineWidth = 4;
  ctx.strokeText(hero.name, 0, ry + 28);
  ctx.fillStyle = '#fff5e6'; ctx.fillText(hero.name, 0, ry + 28);
  // Small resonance lights show how many voices already feed the core.
  ctx.beginPath(); ctx.arc(0, -ry - 15, 6 + pulse * 4, 0, TAU);
  ctx.fillStyle = active > 0.98 ? '#fff7d5' : theme.color; ctx.globalAlpha = .55 + active * .45; ctx.fill();
  ctx.restore();
}

function drawEnergyConduits(ctx, portals, cam, t, player, reduced) {
  const px = Number(player?.x) + (Number(player?.w) || 0) / 2;
  for (const [i, p] of portals.entries()) {
    const progress = Number.isFinite(px) ? clamp((px - p.x + 130) / 330) : 0;
    if (progress <= 0) continue;
    const sx = p.x - cam.x, sy = p.y - cam.y;
    const ex = CORE.x - cam.x, ey = CORE.y - cam.y;
    const width = ctx.canvas?.width || 1600;
    if (Math.max(sx, ex) < -240 || Math.min(sx, ex) > width + 240) continue;
    const col = WORLD1_THEMES[p.hero]?.color || '#fff';
    const arc = (i - (portals.length - 1) / 2) * 14;
    ctx.save(); ctx.globalAlpha = 0.18 + 0.54 * progress;
    ctx.lineWidth = 1.6 + progress * 1.4; ctx.strokeStyle = col;
    ctx.beginPath(); ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo((sx + ex) / 2, Math.min(sy, ey) - 170 - arc, ex, ey);
    ctx.stroke();
    if (!reduced) {
      const k = ((t * .004 + i * .083) % 1 + 1) % 1;
      const oneMinus = 1 - k;
      const bx = oneMinus * oneMinus * sx + 2 * k * oneMinus * ((sx + ex) / 2) + k * k * ex;
      const by = oneMinus * oneMinus * sy + 2 * k * oneMinus * (Math.min(sy, ey) - 170 - arc) + k * k * ey;
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(bx, by, 3.5, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
}

function drawHeart(ctx, cam, t, charge, reduced, state) {
  const x = CORE.x - cam.x, y = CORE.y - cam.y;
  if (x < -340 || x > (ctx.canvas?.width || 1600) + 340) return;
  const full = state?.victory || charge >= .999;
  const corruption = !!state?.bossActive && !state?.victory;
  const r = CORE.radius * (0.55 + charge * .55);
  const breathing = reduced ? 1 : 1 + Math.sin(t * .052) * .055;
  ctx.save();
  ctx.translate(x, y);
  const gradient = ctx.createRadialGradient(0, 0, 4, 0, 0, r * 1.75);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(.22, full ? '#fff6b7' : '#b1faff');
  gradient.addColorStop(.60, corruption ? '#ec5d9c' : '#75d7ff');
  gradient.addColorStop(1, 'rgba(91,111,212,0)');
  ctx.globalAlpha = .63 + .35 * charge;
  ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(0, 0, r * 1.75 * breathing, 0, TAU); ctx.fill();
  ctx.globalAlpha = 1;
  const colors = portalsColors();
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * TAU + (reduced ? 0 : t * .008);
    const orbit = r * (1.05 + 0.09 * Math.sin(i * 2));
    ctx.fillStyle = colors[i];
    ctx.beginPath(); ctx.arc(Math.cos(a) * orbit, Math.sin(a) * orbit * .67, 4 + charge * 3, 0, TAU); ctx.fill();
  }
  ctx.shadowColor = corruption ? '#fa519b' : '#f8e7ab';
  ctx.shadowBlur = 22 + 25 * charge;
  ctx.fillStyle = full ? '#fff8cf' : '#d6faff';
  ctx.beginPath(); ctx.arc(0, 0, 24 + 24 * charge, 0, TAU); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.textAlign = 'center'; ctx.font = 'bold 17px sans-serif';
  ctx.strokeStyle = '#111327'; ctx.lineWidth = 4;
  const message = state?.victory ? 'OHANA · FAMILIA REUNIDA'
    : corruption ? 'EL ECO QUIERE ROBAR LA LUZ'
    : full ? 'DIEZ VOCES · UNA SOLA LUZ'
    : 'LA LUZ RECUERDA';
  ctx.strokeText(message, 0, r + 43); ctx.fillStyle = '#fff5dc'; ctx.fillText(message, 0, r + 43);
  ctx.restore();
}
function portalsColors() { return WORLD1_ORDER.map(h => WORLD1_THEMES[h].color); }

// Render order: connections behind the portraits, portraits in their mirrors,
// living sphere last. Accessible descriptions belong in the story/HUD layer.
export function drawPortalMirrors(ctx, portals, cam, t, player, reduced = false, state = {}) {
  if (!Array.isArray(portals) || !portals.length) return;
  const charge = finalMirrorCharge(portals, player);
  drawEnergyConduits(ctx, portals, cam, t, player, reduced);
  for (const p of portals) drawMirror(ctx, p, cam, t, player, reduced, charge);
  drawHeart(ctx, cam, t, charge, reduced, state);
}

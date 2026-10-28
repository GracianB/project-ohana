// Dino campaign landing mechanics and chapter loop.
// V613 — Valle Fósil de Dino: pisotones colosales, placas fósiles y resonancia sísmica.
import {XP_NEED} from './xp.js';
import {drawDinoPlateV613, drawDinoAtmosphere} from './dino-chapter-art-v613.js';

export const DINO_CHAPTER_BOSS_ID = 'w1-dino-colossus-v1';
export const DINO_CHAPTER_ARENA = Object.freeze({ left: 8260, right: 9320, floor: 1134, hp: 640 });

export const dinoChapter = g => g?.roomDef?.id === 'w1-dino' && !!g.roomDef.growthChapter;
export const dinoBossDefeated = g => !!g.clearedEncounters?.['w1-dino']?.includes(DINO_CHAPTER_BOSS_ID);

export function dinoChapterReady(g) {
 return !dinoChapter(g) || !!g.world1Seals?.includes('dino') || (g.world1?.stations.every(s => s.done) && dinoBossDefeated(g));
}

export function dinoGrowth(g) {
 if (!dinoChapter(g) || !g.world1 || !g.player) return 0;
 const n = g.world1.stations.filter(s => s.done).length;
 const stage = Math.min(4, n);
 const floor = XP_NEED[stage] || 0;
 g.player.xp = Math.max(Number(g.player.xp) || 0, floor);
 return floor;
}

export function dinoLanding(g, s) {
 const w = g.world1, p = g.player;
 if (!g.roomDef?.dinoChapter) return true;
 const height = s.y - (w.dinoPeak ?? s.y), enough = height >= (s.dropHeight || 40);
 if (!enough) {
  if (!s.warnAt || w.tick - s.warnAt > 90) {
   s.warnAt = w.tick;
   g.nums?.add?.(s.x, s.y - 80, 'SUBE MÁS · USA LA CORNISA', '#fff0bd', true);
  }
  return false;
 }
 w.dinoLandings = (w.dinoLandings || 0) + 1;
 w.dinoImpact = { x: s.x, t: 32, height };
 // A deliberate impact opens nearby formations, without bypassing boss armour.
 for (const e of g.enemies || []) {
  if (!e.miniBoss && !e.boss && e.hp > 0 && Math.abs(e.x + e.w / 2 - s.x) < 280) {
   e.stun = Math.max(e.stun || 0, 25);
   e._shieldFacing = 0;
   e._guardBreak = Math.max(e._guardBreak || 0, 45);
   if (e._campaign) {
    e._campaign.active = Math.max(e._campaign.active || 0, 45);
    e._campaign.wind = 0;
   }
  }
 }
 g.fx?.emit?.(s.x, s.y - 8, { color: '#deedbc', count: g.reduceMotion ? 4 : 16, size: 5, up: 4, life: 28 });
 return true;
}

export function trackDinoAir(g) {
 if (!g.roomDef?.dinoChapter) return;
 const w = g.world1, p = g.player, foot = p.y + p.h;
 if (!p.grounded) w.dinoPeak = Math.min(w.dinoPeak ?? foot, foot); else w.dinoPeak = foot;
 if (w.dinoImpact?.t > 0) w.dinoImpact.t--;
}

export function dinoChapterAbility(g, p, index) {
 if (!g.roomDef?.dinoChapter || p?.id !== 'dino' || index !== 1 || p.grounded) return;
 p.vy = Math.max(13, p.vy || 0);
 p.vx *= 0.45;
 p.buffer = 0;
 g.world1.dinoDives = (g.world1.dinoDives || 0) + 1;
 g.world1.dinoDiveArmed = { actor: p, room: g.roomId };
 g.nums?.add?.(p.x + p.w / 2, p.y - 30, '↓ CAÍDA DE COLOSO', '#e5f3bc', true);
}

export function drawDinoPlate(ctx, s, cam, done, t, reduce) {
 drawDinoPlateV613(ctx, s, cam, t, reduce);
}

export function drawDinoImpact(ctx, g, cam) {
 const f = g.world1?.dinoImpact;
 if (!g.roomDef?.dinoChapter || !f?.t) return;
 ctx.save();
 ctx.globalAlpha = f.t / 32;
 ctx.strokeStyle = '#eff3c8';
 ctx.lineWidth = 3;
 ctx.beginPath();
 ctx.ellipse(f.x - cam.x, (f.y ?? 1134) - 3 - cam.y, 35 + (32 - f.t) * ((f.radius || 230) - 35) / 32, 8 + (32 - f.t) * 0.4, 0, 0, Math.PI * 2);
 ctx.stroke();
 ctx.restore();
}

// A dive is consumed on a real landing. Death/reload/room changes cannot carry it.
export function updateDinoDive(g) {
 if (!g.roomDef?.dinoChapter || !g.world1 || !g.player) return;
 const w = g.world1, p = g.player, armed = w.dinoDiveArmed;
 if (!armed) return;
 if (p.dead || armed.actor !== p || armed.room !== g.roomId) { w.dinoDiveArmed = null; return; }
 if (!p.grounded || w.wasGrounded) return;
 w.dinoDiveArmed = null;
 const x = p.x + p.w / 2, y = p.y + p.h, radius = 150 + Math.max(0, p.evo || 0) * 20;
 w.dinoImpact = { x, y, t: 32, radius };
 w.dinoQuakes = (w.dinoQuakes || 0) + 1;
 for (const e of g.enemies || []) {
  if (e.hp <= 0 || e.dying || Math.abs(e.y + e.h - y) > 65 || x + radius < e.x || x - radius > e.x + e.w) continue;
  if (!e.miniBoss && !e.boss) { e._shieldFacing = 0; e._guardBreak = Math.max(e._guardBreak || 0, 45); }
  const before = e.hp;
  g.onDinoLandingHit?.(e, 14 + (p.evo || 0) * 6);
  if (e.hp < before) w.dinoQuakeHits = (w.dinoQuakeHits || 0) + 1;
 }
 g.fx?.emit?.(x, y - 4, { color: '#deedbc', count: g.reduceMotion ? 4 : 12, size: 4, up: 3, life: 24 });
}

export function updateDinoChapter(g, hurt) {
 if (!dinoChapter(g) || !g.world1 || !g.player || g.player.dead) return;
 dinoGrowth(g);

 const p = g.player, w = g.world1;
 const litCount = w.stations.filter(s => s.done).length;

 // Nivel de resonancia sísmica
 if (w.dinoResonance === undefined) w.dinoResonance = litCount * 25;
 const minRes = litCount * 20;
 if (w.dinoResonance > minRes) w.dinoResonance = Math.max(minRes, w.dinoResonance - 0.04);

 // Pisotón en las placas fósiles
 if (p.grounded && !w.wasGrounded) {
  for (const s of w.stations) {
   if (s.kind !== 'fossil' || s.done) continue;
   const dx = Math.abs(s.x - (p.x + p.w / 2));
   const dy = Math.abs(s.y - (p.y + p.h));
   if (dx < 70 && dy < 25) {
    const success = dinoLanding(g, s);
    if (success) {
     s.done = true;
     w.dinoResonance = Math.min(100, (w.dinoResonance || 0) + 25);
     g.score = (g.score || 0) + 150;
     dinoGrowth(g);
     g.nums?.add?.(s.x, s.y - 90, '¡FÓSIL ANCESTRAL DESPIERTO!', '#b9f6ca', true);
     g.fx?.emit?.(s.x, s.y - 10, { color: '#69f0ae', count: 24, size: 4.5, life: 40 });
     g.save?.();
    }
   }
  }
 }
}

export function dinoObjective(g) {
 if (!dinoChapter(g) || g.world1?.sealed) return null;
 const stations = g.world1?.stations || [];
 const unlit = stations.find(s => !s.done);
 if (unlit) {
  const req = unlit.dropHeight || 40;
  return {
   x: unlit.x, y: unlit.y,
   label: unlit.name || 'Fósil dormido',
   action: `Sube a una cornisa alta y cae desde ${req}px (o pulsa K en el aire) para despertar la placa fósil.`
  };
 }
 if (stations.every(s => s.done)) {
  return {
   x: 8750, y: 1134,
   label: 'Coloso de Piedra Ancestral',
   action: 'Las cuatro placas vibran · esquiva sus embestidas sísmicas y ataca en su recuperación'
  };
 }
 return null;
}

export function drawDinoChapter(ctx, g, cam) {
 if (!dinoChapter(g)) return;
 const t = g.world1?.tick || 0, reduced = !!g.reduceMotion;

 // 1. Atmósfera prehistórica del Valle Fósil
 drawDinoAtmosphere(ctx, g, cam, t, reduced);

 // 2. Indicador HUD de Resonancia Sísmica
 const res = g.world1?.dinoResonance || 0;
 if (res > 0) {
  const vw = g.viewW || 1280, gx = vw - 220, gy = 52, gw = 180, gh = 16;
  ctx.save();
  ctx.fillStyle = 'rgba(20, 32, 24, 0.85)';
  ctx.strokeStyle = 'rgba(105, 240, 174, 0.6)';
  ctx.lineWidth = 1.2;
  if (ctx.roundRect) ctx.roundRect(gx - 10, gy - 18, gw + 20, gh + 26, 4);
  else ctx.rect(gx - 10, gy - 18, gw + 20, gh + 26);
  ctx.fill(); ctx.stroke();

  ctx.fillStyle = '#b9f6ca';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('RESONANCIA SÍSMICA ' + (res | 0) + '%', gx, gy - 5);

  ctx.fillStyle = 'rgba(10, 20, 14, 0.9)';
  if (ctx.roundRect) ctx.roundRect(gx, gy, gw, gh, 3); else ctx.rect(gx, gy, gw, gh);
  ctx.fill();

  const fillW = Math.max(0, Math.min(gw, gw * (res / 100)));
  const grad = ctx.createLinearGradient(gx, gy, gx + fillW, gy);
  grad.addColorStop(0, '#2e7d32');
  grad.addColorStop(0.6, '#00e676');
  grad.addColorStop(1, '#b9f6ca');
  ctx.fillStyle = grad;
  if (ctx.roundRect) ctx.roundRect(gx, gy, fillW, gh, 3); else ctx.rect(gx, gy, fillW, gh);
  ctx.fill();

  if (!reduced) {
   const sparkX = gx + fillW + Math.sin(t * 0.2) * 3;
   ctx.fillStyle = '#ffffff';
   ctx.beginPath(); ctx.arc(sparkX, gy + gh / 2, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
 }
}

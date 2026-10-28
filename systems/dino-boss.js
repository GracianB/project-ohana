import {chapterBossStart, chapterBossFinish} from './chapters-lunar-prism-embers.js';
// VALLE DE LOS GIGANTES — Coloso de Piedra Ancestral (Dino's personal mini boss).
// 100% vector Canvas drawing: colossal prehistoric stone T-Rex with amber-cracked armour.
// Three phases: seismic charge, amber boulder barrage, and colossal mega-slam eruption.
// V613: HUD holográfico prehistórico, pips de tier, flechas de telegrafía y fallas tectónicas.
export const DINO_BOSS_ID = 'hub-dino-boss-v1';
export const DINO_BOSS = Object.freeze({ hp: 480, left: 3120, right: 3990, floor: 1134 });
const PATTERNS = Object.freeze(['charge', 'boulder_barrage', 'quake_slam', 'fossil_eruption']);
const TAU = Math.PI * 2;

function _rr(c, x, y, w, h, r = 4) {
 if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h);
}

export function createDinoBoss(makeFoe, rng = () => 0.5, options = {}) {
 const arena = Object.freeze({ ...DINO_BOSS, ...options.arena }), roomId = options.roomId || 'hub', x = options.x ?? 3420;
 const e = makeFoe(x, arena.floor - 120, 'cangrejo', roomId, 995, { rng });
 e._chapterArena = arena; e._growthChapter = options.chapter || null;
 e.x = x; e.y = arena.floor - 120; e.w = e._growthChapter ? 180 : 140; e.h = e._growthChapter ? 170 : 120;
 e.hp = e.max = arena.hp; if (e._growthChapter) { e.damageTakenScale = 0; e.damageWindowRemaining = 0; }
 e.miniBoss = true; e._dinoBoss = true;
 e._campaignOriginal = true; e.spawnIndex = 995;
 e._encounterSaveId = options.encounterId || DINO_BOSS_ID;
 e.roomId = roomId; e.color = '#8d6e63'; e.contactDmg = 0;
 e._stoneColossus = { phase: 'intro', clock: 100, attack: 0, tier: 1, aim: 1, burst: 0, exposed: false, stomp: 0 };
 return e;
}

export function updateDinoBoss(e, g, hurt) {
 if (!e?._dinoBoss) return false;
 const b = e._stoneColossus, p = g.player, arena = e._chapterArena || DINO_BOSS, previous = b.phase;
 if (e.invuln > 0) e.invuln--;
 e.x = Math.max(arena.left, Math.min(arena.right - e.w, e.x));
 e.y = arena.floor - e.h; e.vy = 0; e.grounded = true; e.vx = 0; e.telegraph = false;
 if (!p || p.dead || e.hp <= 0) return true;
 if (!chapterBossStart(e, g, b)) return true;

 b.tier = e.hp <= e.max * 0.26 ? 3 : e.hp <= e.max * 0.60 ? 2 : 1;
 const dx = p.x + p.w / 2 - (e.x + e.w / 2);
 const visible = e.x + e.w > g.cam.x && e.x < g.cam.x + (g.viewW || 1100);
 if (b.stomp > 0) b.stomp--;
 if (e.sleep > 0) { e.sleep--; return true; }

 if (b.phase === 'intro') {
  if (visible && Math.abs(dx) < 700) {
   if (--b.clock === 60) g.nums?.add?.(e.x, e.y - 50, 'COLOSO DE PIEDRA — DESPIERTO', '#d7ccc8', true);
   if (b.clock <= 0) { b.phase = e._growthChapter ? 'warn' : 'rest'; b.clock = 50; b.aim = Math.sign(dx) || 1; }
  }
 } else if (b.phase === 'rest') {
  b.exposed = true;
  if ((--b.clock <= 0 || (e._growthChapter && e.damageWindowRemaining <= 0)) && visible && Math.abs(dx) < 950) {
   b.aim = Math.sign(dx) || 1; b.phase = 'warn'; b.clock = b.tier === 3 ? 32 : 48; b.exposed = false;
  }
 } else if (b.phase === 'warn') {
  e.telegraph = true; e.wind = b.clock;
  if ((e.stun || 0) >= 24 && !e._growthChapter) {
   b.phase = 'rest'; b.clock = 90; b.exposed = true; g.nums?.add?.(e.x, e.y - 30, '¡COLOSO ATURDIDO!', '#ffe082', true);
  } else if (--b.clock <= 0) {
   b.phase = 'attack'; b.clock = b.attack === 0 ? 30 : 24; b.burst = 0;
  }
 } else if (b.phase === 'attack') {
  e.lunge = b.clock;
  const fireBoulder = (vx, vy = -3, color = '#8d6e63') => {
   if ((g.projectiles?.length || 0) < 130) {
    g.projectiles.push({
     x: e.x + e.w / 2, y: e.y + e.h - 30, w: 28, h: 28,
     vx, vy, life: 150, dmg: b.tier === 3 ? 20 : 14,
     owner: 'enemy', shape: 'orb', color
    });
   }
  };
  if (!b.burst) {
   // Attack 0: charge stomp — contact damage + ground shake
   if (b.attack === 0) {
    b.stomp = 24;
    g.fx?.emit?.(e.x + e.w / 2, arena.floor - 12, { color: '#8d6e63', count: 16, size: 4, life: 30 });
   }
   // Attack 1: dual boulders
   if (b.attack === 1) {
    fireBoulder(b.aim * 7, -3);
    if (b.tier > 1) fireBoulder(-b.aim * 5, -2, '#bcaaa4');
    g.fx?.emit?.(e.x + e.w / 2, e.y + 40, { color: '#ffb300', count: 12, size: 3.5, life: 25 });
   }
   // Attack 2: quake slam — fan of 3 projectiles
   if (b.attack === 2) {
    for (let k = -1; k <= 1; k++) fireBoulder(b.aim * (5.5 + k * 2), -2.5 - Math.abs(k) * 1.5, '#a1887f');
    g.fx?.emit?.(e.x + e.w / 2, arena.floor - 8, { color: '#ffe082', count: 20, size: 4.5, life: 35 });
   }
   // Attack 3 (tier 3 only): fossil eruption — 5-way spread
   if (b.attack === 3 && (b.tier === 3 || e._growthChapter)) {
    const spread = b.tier === 3 ? 2 : 1;
    for (let k = -spread; k <= spread; k++) fireBoulder(k * 4, -4, '#ffb74d');
    g.fx?.emit?.(e.x + e.w / 2, e.y + 20, { color: '#ff6f00', count: 24, size: 5, life: 40 });
   }
   b.burst = 1;
  }
  // Charge locomotion
  if (b.attack === 0) {
   e.x += b.aim * 9.5; e.facing = b.aim;
   if (g.fx && b.clock % 3 === 0) {
    g.fx.emit(e.x + e.w / 2, e.y + e.h - 15, { color: '#a1887f', count: 4, size: 3, life: 20 });
   }
  }
  if (Math.abs(dx) < e.w * 0.55 && Math.abs(p.y + p.h / 2 - (e.y + e.h / 2)) < e.h * 0.6) {
   hurt?.(b.tier === 3 ? 20 : 15, 'dino-boss');
  }
  if (--b.clock <= 0) {
   b.phase = 'rest'; b.clock = b.tier === 3 ? 32 : 55; b.attack = (b.attack + 1) % PATTERNS.length; b.burst = 0;
  }
 }
 chapterBossFinish(e, g, b, previous);
 return true;
}

export function drawDinoBossSignals(ctx, e, cam, t = 0, reduced = false) {
 if (!e?._stoneColossus) return;
 const b = e._stoneColossus, x = e.x - cam.x, y = e.y - cam.y, cx = x + e.w / 2;
 const panW = 250, panH = 68, px = cx - panW / 2, py = Math.max(12, y - 105);

 ctx.save();
 // Borde decorativo de piedra y ámbar
 ctx.strokeStyle = 'rgba(109, 76, 65, 0.45)'; ctx.lineWidth = 1;
 for (let vb = 0; vb < 6; vb++) {
  const vbx = px + vb * (panW / 5);
  ctx.beginPath(); ctx.moveTo(vbx, py - 4); ctx.lineTo(vbx + 6, py); ctx.stroke();
 }

 // Panel holográfico de jade y arenisca
 ctx.fillStyle = 'rgba(28, 38, 32, 0.90)';
 ctx.strokeStyle = 'rgba(129, 199, 132, 0.65)'; ctx.lineWidth = 1.5;
 _rr(ctx, px, py, panW, panH, 5); ctx.fill(); ctx.stroke();

 // Pips de tier de piedra / ámbar
 const TIER_COL = ['#81c784', '#ffb74d', '#ff7043'];
 for (let i = 0; i < 3; i++) {
  ctx.fillStyle = i < b.tier ? TIER_COL[i] : '#1b2820';
  ctx.beginPath(); ctx.arc(px + 14 + i * 14, py + 12, 4.5, 0, TAU); ctx.fill();
  if (i < b.tier) {
   ctx.strokeStyle = 'rgba(255, 245, 157, 0.85)'; ctx.lineWidth = 1.2;
   ctx.beginPath(); ctx.arc(px + 14 + i * 14, py + 12, 4.5, 0, TAU); ctx.stroke();
  }
 }

 // Nombre del jefe
 ctx.fillStyle = '#e8f5e9'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
 ctx.fillText('COLOSO DE PIEDRA ANCESTRAL', cx, py + 15);

 // Barra de vida segmentada
 const barX = px + 10, barY = py + 26, barW = panW - 20, barH = 9;
 const hpRatio = Math.max(0, e.hp / e.max);
 ctx.fillStyle = 'rgba(12, 18, 14, 0.9)'; _rr(ctx, barX, barY, barW, barH, 3); ctx.fill();

 const gBar = ctx.createLinearGradient(barX, barY, barX + barW * hpRatio, barY);
 gBar.addColorStop(0, b.tier === 3 ? '#d84315' : b.tier === 2 ? '#ffb300' : '#4caf50');
 gBar.addColorStop(1, b.tier === 3 ? '#ff8a65' : '#ffe082');
 ctx.fillStyle = gBar; _rr(ctx, barX, barY, barW * hpRatio, barH, 3); ctx.fill();

 ctx.strokeStyle = 'rgba(200, 230, 201, 0.7)'; ctx.lineWidth = 1; _rr(ctx, barX, barY, barW, barH, 3); ctx.stroke();

 // Icono y aviso táctico
 const PHASE_INFO = {
  intro:  { icon: '◆', col: '#ffb74d', txt: 'DESPERTANDO COLOSO DE PIEDRA' },
  rest:   { icon: '◇', col: '#80cbc4', txt: '¡VULNERABLE! ATACA EN SU RECUPERACIÓN' },
  warn:   { icon: '▲', col: '#ff9800', txt: ['¡EMBESTIDA SÍSMICA! SALTA', 'LLUVIA DE ROCAS DE ÁMBAR', 'GOLPE MEGATERREMOTO · ONDA', 'ERUPCIÓN FÓSIL · COBERTURA'][b.attack] },
  attack: { icon: '■', col: '#ff5722', txt: 'DESCARGA SÍSMICA' }
 };
 const pi = PHASE_INFO[b.phase] || PHASE_INFO.intro;
 ctx.fillStyle = pi.col; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'left';
 ctx.fillText(pi.icon, px + 10, py + 52);
 ctx.fillStyle = 'rgba(241, 248, 233, 0.95)'; ctx.font = '10px monospace';
 ctx.fillText(pi.txt, px + 26, py + 52);

 // Telegraph direccional en el suelo
 if (b.phase === 'warn') {
  const floor = e._chapterArena?.floor ? e._chapterArena.floor - cam.y : 1134 - cam.y;
  ctx.strokeStyle = 'rgba(255, 152, 0, 0.8)'; ctx.lineWidth = 2.5; ctx.setLineDash([8, 6]);
  const dir = b.aim || 1;
  const tipX = cx + dir * (b.attack === 0 ? 330 : 260);
  ctx.beginPath(); ctx.moveTo(cx, floor - 8); ctx.lineTo(tipX, floor - 8); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(255, 152, 0, 0.9)';
  ctx.beginPath(); ctx.moveTo(tipX, floor - 8); ctx.lineTo(tipX - dir * 14, floor - 14); ctx.lineTo(tipX - dir * 14, floor - 2); ctx.closePath(); ctx.fill();
 }

 // Anillo telegraph en el cuerpo
 if (e.telegraph || b.exposed) {
  const tr = reduced ? 0 : Math.sin(t * 0.2) * 5;
  ctx.strokeStyle = b.exposed ? 'rgba(128, 203, 196, 0.8)' : 'rgba(255, 152, 0, 0.8)';
  ctx.lineWidth = 2.8;
  ctx.beginPath(); ctx.arc(cx, y + e.h / 2, 70 + tr, 0, TAU); ctx.stroke();
 }

 ctx.restore();
}

// ── Stone T-Rex vector drawing ────────────────────────────────────────────────
// Phase 1: solid grey granite · Phase 2: amber crack veins · Phase 3: eruption glow
function drawChapterColossus(ctx, e, t) {
 const b = e._stoneColossus, hot = b.tier === 3, stone = hot ? '#617267' : '#7c9185', rim = '#334f4c', light = '#b7c5a8', amber = hot ? '#ffc771' : '#dfd39c';
 ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = rim; ctx.lineWidth = 3;
 // Broad planted feet and curved haunches: the colossal silhouette has weight.
 for (const side of [-1, 1]) {
  ctx.fillStyle = side < 0 ? '#5c756d' : stone;
  ctx.beginPath(); ctx.moveTo(side * 25, -35); ctx.bezierCurveTo(side * 50, -10, side * 40, 13, side * 33, 22); ctx.quadraticCurveTo(side * 52, 29, side * 43, 38); ctx.lineTo(side * 9, 38); ctx.quadraticCurveTo(side * 9, 20, side * 18, 4); ctx.lineTo(side * 10, -20); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = light; ctx.lineWidth = 2; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(side * (15 + k * 8), 31); ctx.lineTo(side * (16 + k * 8), 37); ctx.stroke(); } ctx.strokeStyle = rim; ctx.lineWidth = 3;
 }
 // Tapered tail curls behind the torso with a heavy fossil club
 ctx.fillStyle = stone; ctx.beginPath(); ctx.moveTo(-34, -56); ctx.bezierCurveTo(-61, -59, -72, -44, -86, -77); ctx.bezierCurveTo(-90, -48, -71, -14, -26, -21); ctx.closePath(); ctx.fill(); ctx.stroke();
 ctx.fillStyle = stone; ctx.beginPath(); ctx.ellipse(-3, -47, 48, 49, -0.25, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
 ctx.fillStyle = '#a8b99d'; ctx.beginPath(); ctx.ellipse(14, -36, 25, 31, -0.3, 0, Math.PI * 2); ctx.fill();
 // Layered fossil plates catch the light around the neck and spine.
 for (let i = 0; i < 5; i++) {
  const x = -39 + i * 13, y = -75 - Math.sin(i * 0.7) * 15;
  ctx.fillStyle = i % 2 ? light : '#8ea394'; ctx.beginPath(); ctx.moveTo(x - 8, y + 14); ctx.quadraticCurveTo(x - 10, y - 15, x + 1, y - 20); ctx.quadraticCurveTo(x + 16, y - 7, x + 9, y + 13); ctx.closePath(); ctx.fill(); ctx.stroke();
 }
 // Heavy cranial shield, rounded muzzle and a separate articulated jaw.
 ctx.fillStyle = stone; ctx.beginPath(); ctx.moveTo(10, -69); ctx.bezierCurveTo(1, -108, 29, -126, 54, -113); ctx.quadraticCurveTo(67, -106, 66, -96); ctx.quadraticCurveTo(89, -97, 88, -76); ctx.quadraticCurveTo(82, -61, 59, -66); ctx.lineTo(40, -57); ctx.closePath(); ctx.fill(); ctx.stroke();
 ctx.fillStyle = '#526e64'; ctx.beginPath(); ctx.moveTo(42, -61); ctx.quadraticCurveTo(65, -48, 86, -62); ctx.lineTo(88, -74); ctx.quadraticCurveTo(62, -66, 42, -74); ctx.closePath(); ctx.fill(); ctx.stroke();
 ctx.fillStyle = '#eff0d3'; for (let i = 0; i < 5; i++) { const x = 48 + i * 7; ctx.beginPath(); ctx.moveTo(x, -71); ctx.lineTo(x + 3, -63); ctx.lineTo(x + 6, -72); ctx.fill(); }
 ctx.fillStyle = rim; ctx.beginPath(); ctx.ellipse(44, -91, 13, 10, -0.2, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = b.phase === 'warn' ? '#fff9d8' : amber; ctx.beginPath(); ctx.ellipse(46, -91, 7, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#263f3c'; ctx.fillRect(47, -95, 2, 8);
 ctx.strokeStyle = light; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(31, -103); ctx.quadraticCurveTo(43, -109, 57, -101); ctx.stroke(); ctx.fillStyle = rim; ctx.beginPath(); ctx.ellipse(78, -83, 3, 2, -0.3, 0, Math.PI * 2); ctx.fill();
 // Inlaid amber follows cracks through the armour; exposure opens the core.
 ctx.strokeStyle = amber; ctx.lineWidth = hot ? 3 : 2; ctx.beginPath(); ctx.moveTo(-29, -76); ctx.lineTo(-15, -56); ctx.lineTo(-23, -35); ctx.lineTo(-9, -13); ctx.moveTo(-15, -56); ctx.lineTo(4, -66); ctx.moveTo(20, -101); ctx.lineTo(27, -82); ctx.lineTo(18, -68); ctx.stroke();
 ctx.fillStyle = b.exposed ? '#fff4b6' : '#65867b'; ctx.strokeStyle = light; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(8, -38, 10, 14, -0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
 // Short forearms with ivory stone claws
 ctx.strokeStyle = rim; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(30, -51); ctx.quadraticCurveTo(49, -44, 45, -29); ctx.stroke(); ctx.strokeStyle = light; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(42, -30); ctx.lineTo(47, -25); ctx.moveTo(47, -32); ctx.lineTo(51, -27); ctx.stroke();
 if (b.phase === 'warn') { ctx.strokeStyle = amber; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(9, -39, 19 + Math.sin(t * 0.12) * 2, 0, Math.PI * 2); ctx.stroke(); }
 ctx.restore();
}

function _drawColossus(ctx, e, t) {
 if (e._growthChapter) { drawChapterColossus(ctx, e, t); return; }
 const b = e._stoneColossus;
 const tier = b.tier;
 const body = tier === 3 ? '#5d4037' : tier === 2 ? '#6d4c41' : '#4e342e';
 const accent = tier === 3 ? '#ff8f00' : tier === 2 ? '#ffca28' : '#a1887f';
 const crack = tier === 3 ? '#ff6f00' : tier === 2 ? '#ffd54f' : 'rgba(0,0,0,0)';
 const pulse = Math.sin(t * 0.12) * 3;

 // ── Tail ──
 ctx.fillStyle = body;
 ctx.beginPath();
 ctx.moveTo(-56, -28); ctx.lineTo(-90, -18); ctx.lineTo(-80, 8); ctx.lineTo(-46, -2);
 ctx.closePath(); ctx.fill();

 // ── Main body ──
 ctx.strokeStyle = accent; ctx.lineWidth = 3;
 ctx.beginPath();
 ctx.ellipse(0, -38, 52, 38, 0, 0, Math.PI * 2);
 ctx.fillStyle = body; ctx.fill(); ctx.stroke();

 // Amber crack veins on body (tier 2+)
 if (tier >= 2) {
  ctx.strokeStyle = crack; ctx.lineWidth = 2; ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(-30, -55); ctx.lineTo(-15, -25); ctx.lineTo(-28, -8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(20, -60); ctx.lineTo(30, -30); ctx.lineTo(18, -5); ctx.stroke();
 }

 // ── Dorsal plates (iconic dino spines) ──
 ctx.fillStyle = accent; ctx.strokeStyle = body; ctx.lineWidth = 1.5;
 const spines = [{ x: -32, h: 28 }, { x: -14, h: 38 }, { x: 4, h: 42 }, { x: 22, h: 36 }, { x: 38, h: 26 }];
 for (const sp of spines) {
  ctx.beginPath();
  ctx.moveTo(sp.x - 9, -68);
  ctx.lineTo(sp.x, -68 - sp.h - (tier === 3 ? pulse : 0));
  ctx.lineTo(sp.x + 9, -68);
  ctx.closePath(); ctx.fill(); ctx.stroke();
 }

 // ── Head (T-Rex shape: elongated snout, deep bite) ──
 ctx.fillStyle = body; ctx.strokeStyle = accent; ctx.lineWidth = 3;
 ctx.beginPath();
 ctx.moveTo(38, -52);    // neck join top
 ctx.lineTo(80, -38);    // top snout
 ctx.lineTo(96, -16);    // tip of snout
 ctx.lineTo(88, 4);      // lower jaw tip
 ctx.lineTo(60, 14);     // jaw underside
 ctx.lineTo(40, -6);     // throat
 ctx.lineTo(32, -26);    // neck join bottom
 ctx.closePath();
 ctx.fill(); ctx.stroke();

 // Teeth
 ctx.fillStyle = '#efebe9'; ctx.strokeStyle = 'transparent';
 for (let t2 = 0; t2 < 3; t2++) {
  const tx = 68 + t2 * 9, ty = 4 - t2 * 4;
  ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx - 4, ty + 10); ctx.lineTo(tx + 4, ty + 10); ctx.closePath(); ctx.fill();
 }

 // Amber eye
 const eyePulse = tier === 3 ? (1.2 + Math.sin(t * 0.18) * 0.3) : 1;
 ctx.fillStyle = tier === 3 ? '#ff6d00' : '#ffe082';
 ctx.beginPath(); ctx.arc(68, -28, 6 * eyePulse, 0, Math.PI * 2); ctx.fill();
 ctx.fillStyle = '#1a0800'; ctx.beginPath(); ctx.arc(70, -28, 3, 0, Math.PI * 2); ctx.fill();

 // ── Tiny arms ──
 ctx.fillStyle = body; ctx.strokeStyle = accent; ctx.lineWidth = 2;
 ctx.beginPath();
 ctx.moveTo(30, -20); ctx.lineTo(52, 0); ctx.lineTo(46, 16);
 ctx.stroke();

 // ── Legs ──
 ctx.lineWidth = 10;
 ctx.strokeStyle = body;
 ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(-22, 36); ctx.lineTo(-14, 36); ctx.stroke();
 ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(22, 36); ctx.lineTo(14, 36); ctx.stroke();

 // Phase 3: amber eruption aura
 if (tier === 3) {
  ctx.fillStyle = `rgba(255,143,0,${0.18 + Math.sin(t * 0.1) * 0.08})`;
  ctx.beginPath(); ctx.ellipse(0, -30, 70, 56, 0, 0, Math.PI * 2); ctx.fill();
 }
}

export function drawDinoBoss(ctx, e, cam, t, reduceMotion = false) {
 if (!e?._dinoBoss) return false;
 const b = e._stoneColossus;
 const x = e.x - cam.x, y = e.y - cam.y;
 ctx.save();
 ctx.translate(x + e.w / 2, y + e.h - (e._growthChapter ? 40 : 0));
 const flip = b.aim || 1; ctx.scale(flip, 1);

 _drawColossus(ctx, e, reduceMotion ? 0 : t);

 // Telegraph warning box
 if (e.telegraph) {
  ctx.strokeStyle = '#ffca28'; ctx.lineWidth = 2.5; ctx.setLineDash([6, 6]);
  ctx.strokeRect(-74, -128, 148, 132); ctx.setLineDash([]);
 }
 ctx.restore();

 // Dibujar siempre HUD táctico holográfico
 drawDinoBossSignals(ctx, e, cam, t, reduceMotion);
 return true;
}

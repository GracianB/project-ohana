// OHANA V467 · MUNDO 1 · Dirección del jefe final (Quimera Ohana).
// El cuerpo, las fases y los diez ataques viven en systems/fusion-boss.js. Este
// módulo es la CAPA DE DIRECCIÓN encima: hace la pelea cinematográfica, legible
// y JUSTA en la sala enorme (w1-final), sin tocar la lógica del jefe.
//   · Telegrafía cada ataque: rótulo con el héroe "robado", zonas de peligro en
//     el suelo y carril seguro garantizado.
//   · Equidad: tope de daño por ataque, gracia tras cada golpe y misericordia
//     (avisos más largos) si el jugador va muy tocado. Todo acotado.
//   · Arena: fondo gigante con la silueta fusionada de los diez + estatuas.
//   · Especiales de fase: bandas de cine, coro de ecos de los héroes.
//   · Derrota: diez luces vuelven a su héroe y se entrega el relevo a world1-cine.
//
// CÓMO ENGANCHARLO:
//   import * as W1B from "./world1-boss.js";   (o window.OhanaWorld1Boss)
//   al aparecer la Quimera      → g.world1Boss = W1B.createWorld1BossDirector(g.boss)
//   en hurtPlayer(dmg, src)     → dmg = W1B.world1BossFilterDamage(g, dmg)   (0 = ignorado)
//   cada tick (tras updateFusionBoss) → const ev = W1B.updateWorld1BossDirector(g)
//        ev === "defeated" → OhanaWorld1Cine.play(g, "bossDefeat")
//   dibujo antes del jefe       → W1B.drawWorld1BossBackdrop(ctx, g, cam, t)
//   dibujo tras el jefe         → W1B.drawWorld1BossTelegraphs(ctx, g, cam, t)
//   HUD / pantalla              → W1B.drawWorld1BossOverlay(ctx, g, W, H, t)
import { WORLD1_ORDER, WORLD1_THEMES, WORLD1_ARENA, WORLD1_FLOOR } from "./world1-rooms.js";
import { FUSION_ATTACKS, FUSION_SPECIALS, drawFusionAttackTelegraphs } from "./fusion-boss.js";
import { drawHeroEmblem, heroDisplayName } from "./world1-select.js";

export const BOSS_FAIRNESS = Object.freeze({ capPerAttack: 34, grace: 50, mercyHp: 0.3, mercyWarn: 22, maxMercy: 12 });
const num = (v, d = 0) => (Number.isFinite(v) ? v : d);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Frase de rótulo por ataque: de quién es el eco y cómo esquivarlo.
export const ATTACK_CARDS = Object.freeze({
  ola:       "Salta la ola cuando cruce el suelo",
  plasma:    "Cambia de altura: apunta a tu última posición",
  rayos:     "Sal de las columnas marcadas",
  medusas:   "Busca los huecos entre medusas",
  embestida: "Salta por encima o sube al balcón",
  aliento:   "Ponte detrás de la Quimera",
  terremoto: "Sal de la marca y salta la onda al caer",
  geiseres:  "Evita los círculos del suelo",
  ruedas:    "Salta las ruedas una a una",
  red:       "Sal del anillo antes de que se cierre"
});

export function createWorld1BossDirector(boss) {
  return { boss, t: 0, lastAttack: null, card: null, attackDmg: 0, grace: 0, mercy: 0, special: null, defeat: null, done: false, echoes: [], hitFlash: 0 };
}

function fusion(g) { const e = g?.boss; return e?._fusionBoss ? e : null; }

// Llamar desde hurtPlayer: devuelve el daño final permitido.
export function world1BossFilterDamage(g, dmg) {
  const d = g?.world1Boss, e = fusion(g); dmg = Math.max(0, num(dmg));
  if (!d || !e) return dmg;
  if (d.grace > 0 || d.defeat || e._fusion?.mode === "intro") return 0;
  const room = Math.max(0, BOSS_FAIRNESS.capPerAttack - d.attackDmg);
  const out = Math.min(dmg, room);
  d.attackDmg += out; if (out > 0) { d.grace = BOSS_FAIRNESS.grace; d.hitFlash = 12; }
  return out;
}

export function updateWorld1BossDirector(g) {
  if(g?.onlineAdventure&&g.coopAuthority===false){const d=g.world1Boss,b=g.boss?._fusion;if(d){if(d.grace>0)d.grace--;const key=b?.attack+':'+g.boss?.phase+':'+b?.step;if(d._coopAttack!==key){d._coopAttack=key;d.attackDmg=0;}}return null;}
  const d = g?.world1Boss; if (!d || d.done) return null;
  const e = fusion(g) || d.boss; if (!e) return null;
  const b = e._fusion || {}, p = g.player; d.t++;
  if (d.grace > 0) d.grace--; if (d.hitFlash > 0) d.hitFlash--;
  if (d.card && ++d.card.t >= d.card.max) d.card = null;
  // Nuevo ataque: rótulo + reinicio del tope de daño + misericordia acotada.
  if (b.mode === "warn" && b.attack && d.prevMode !== "warn") {
    d.lastAttack = b.attack; d.attackDmg = 0;
    const A = FUSION_ATTACKS[b.attack] || { hero: "kilo", name: b.attack };
    d.card = { t: 0, max: 80, hero: A.hero, name: A.name, tip: ATTACK_CARDS[b.attack] || "", color: WORLD1_THEMES[A.hero]?.color || "#fff" };
    const hurt = p && num(p.health) / Math.max(1, num(p.maxHealth, 100)) < BOSS_FAIRNESS.mercyHp;
    if (hurt && d.mercy < BOSS_FAIRNESS.maxMercy) { b.clock = num(b.clock) + BOSS_FAIRNESS.mercyWarn; d.mercy++; }
    g.onWorld1Beat?.("boss-attack", A.hero, b.attack);
  }
  d.prevMode = b.mode;
  // Especial de fase → coro de ecos (los diez emblemas giran alrededor).
  if (b.mode === "special" && b.special && !d.special) { d.attackDmg=0; d.card=null; d.special = { t: 0, id: b.special.id, name: b.special.name, line: b.special.line, phase: b.special.phase }; g.onWorld1Beat?.("boss-special", b.special.id); }
  if (d.special) { d.special.t++; if (b.mode !== "special") d.special = null; }
  // Derrota: 10 luces salen del cuerpo hacia las estatuas / el jugador.
  if (!d.defeat && (num(e.hp, 1) <= 0 || e.dying > 0)) {
    const ox = num(e.x) + num(e.w, 230) / 2, oy = num(e.y) + num(e.h, 290) / 2;
    d.defeat = { t: 0, max: g.reduceMotion ? 120 : 220, ox, oy, lights: WORLD1_ORDER.map((hero, i) => ({ hero, a: i / 10 * Math.PI * 2, tx: WORLD1_ARENA.left + 200 + i * ((WORLD1_ARENA.right - WORLD1_ARENA.left - 400) / 9), ty: WORLD1_FLOOR - 220 })) };
    if (e._fusion?.shots) e._fusion.shots.length = 0; // limpieza: nada te golpea tras ganar
    d.special=null; d.card=null; d.hitFlash=0;
    g.onWorld1Beat?.("boss-defeat");
  }
  if (d.defeat && ++d.defeat.t >= d.defeat.max) { d.done = true; g.world1Won = true; return "defeated"; }
  return null;
}

// Fondo de la sala enorme: la silueta gigante "cosida" con los diez emblemas.
const FRAME = Object.freeze(WORLD1_ORDER.map((hero, i) => { const a = -Math.PI / 2 + i / 10 * Math.PI * 2; return { hero, dx: Math.cos(a) * 520, dy: Math.sin(a) * 330 }; }));
export function drawWorld1BossBackdrop(ctx, g, cam, t = 0) {
  const e = fusion(g); if (!e && !g?.world1Boss) return;
  // Paralaje 0.6: el centro de la arena queda centrado cuando la cámara llega a ella.
  const sx = (WORLD1_ARENA.left + WORLD1_ARENA.right) / 2 * 0.6 + num(g?.viewW, 1600) * 0.2 - num(cam?.x) * 0.6, cy = 520 - num(cam?.y) * 0.4;
  const d = g.world1Boss, phase = num(e?.phase, 1), rot = (g.reduceMotion ? 0 : num(t) * 0.002);
  ctx.save(); ctx.globalAlpha = 0.14 + phase * 0.03;
  ctx.fillStyle = "#2a0f2e"; ctx.beginPath(); ctx.ellipse(sx, cy, 640, 420, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#ff7ad0"; ctx.lineWidth = 6; ctx.setLineDash([18, 14]); ctx.beginPath();
  FRAME.forEach((f, i) => { const a = rot; const x = sx + f.dx * Math.cos(a) - f.dy * Math.sin(a), y = cy + f.dx * Math.sin(a) + f.dy * Math.cos(a); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); ctx.stroke(); ctx.setLineDash([]);
  FRAME.forEach((f) => { const x = sx + f.dx * Math.cos(rot) - f.dy * Math.sin(rot), y = cy + f.dx * Math.sin(rot) + f.dy * Math.cos(rot); const freed = d?.defeat; drawHeroEmblem(ctx, f.hero, x, y, 170, freed ? WORLD1_THEMES[f.hero].color : "#6b2a5e", t); });
  ctx.restore();
}

// Telegrafías en coordenadas de mundo (se dibujan sobre el suelo de la arena).
export function drawWorld1BossTelegraphs(ctx, g, cam, t = 0) {
  const e = fusion(g); if (!e) return; const b = e._fusion || {};
  if (b.mode !== "warn") return;
  drawFusionAttackTelegraphs(ctx,e,cam,t,!!g.reduceMotion);
  // A safe marker is shown only for stationary, locked ground columns.
  const safe=safeLaneX(e,b);if(safe==null)return;
  ctx.save();ctx.fillStyle='#b5f2db';ctx.textAlign='center';ctx.font='700 12px sans-serif';
  ctx.fillRect(safe-num(cam?.x)-40,WORLD1_FLOOR-num(cam?.y)-4,80,4);
  ctx.fillText('SIN COLUMNA',safe-num(cam?.x),WORLD1_FLOOR-num(cam?.y)-17);ctx.restore();
}

export function safeLaneX(e, b) {
  const A = WORLD1_ARENA, ex = num(e.x) + num(e.w) / 2;
  if (b.attack === "rayos" || b.attack === "geiseres") {
    const marks=(b.marks||[]).filter(Number.isFinite).sort((x,y)=>x-y);if(!marks.length)return null;
    const target=clamp(num(b.target?.x,ex),A.left+60,A.right-60),candidates=[];
    let left=A.left+60;
    for(const mark of [...marks,A.right+20]){
      const right=Math.min(A.right-60,mark-80);
      if(right>=left)candidates.push(clamp(target,left,right));
      left=mark+80;
    }
    candidates.sort((x,y)=>Math.abs(x-target)-Math.abs(y-target));
    return candidates[0]??null;
  }

  return null;
}

function bars(ctx, W, H, k) { const h = H * 0.11 * clamp(k, 0, 1); ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, h); ctx.fillRect(0, H - h, W, h); }

// Keep World 1 boss health above the bottom ability bar and away from the
// minimap on normal desktop viewports. Fight prompts remain at screen top.
// Canvas text is invisible to assistive technology. Announce coarse HP bands
// (10% increments) rather than every hit, so screen readers are not flooded.
export function world1BossAccessibleText(e) {
  if(!e?._fusionBoss) return "";
  const phase = Math.max(1, Math.min(4, Math.floor(num(e.phase,1))));
  const health = Math.max(0, Math.min(100,
    Math.ceil(clamp(num(e.hp) / Math.max(1, num(e.max,1)),0,1)*10)*10));
  const b=e._fusion||{},hint=b.mode==='warn'?`${FUSION_ATTACKS[b.attack]?.name||''}. ${ATTACK_CARDS[b.attack]||''}.`:b.mode==='special'?`${b.special?.name||''}. Lee las zonas marcadas.`:b.mode==='rest'?'Núcleo abierto. Contraataca.':'';
  return `Quimera Ohana. Fase ${phase} de 4. Vida aproximada: ${health} por ciento.`+(hint?' '+hint:'');
}

// Only the final encounter may widen a compact viewport. The player and the
// Quimera's wing tips need room together; no actor or hitbox is rescaled.
export function quimeraCameraZoom(g,width,base=1.02){
 if(!g?.boss?._fusionBoss||g.world1Cine||!g.player||width>=700)return base;
 const p=g.player,b=g.boss,distance=Math.abs((p.x+p.w/2)-(b.x+b.w/2));
 return Math.min(base,.82,Math.max(.48,width/(distance+430)));
}

export function world1BossHealthLayout(W, H) {
  W = Math.max(320, num(W, 1280));
  H = Math.max(400, num(H, 720));
  const bw = Math.min(W * 0.52, 700);
  return {
    bw,
    bx: (W - bw) / 2,
    by: H - Math.max(120, Math.min(170, H * 0.165))
  };
}

export function drawWorld1BossOverlay(ctx, g, W, H, t = 0) {
  if(g.world1Cine || g.world1Boss?.done)return;
  const d = g?.world1Boss, e = fusion(g) || d?.boss; if (!d || !e) return;
  W = num(W, 1280); H = num(H, 720); const b = e._fusion || {};
  ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle";
  // Barra de vida con los tres cortes de fase y los diez colores.
  if (!d.defeat) {
    const {bw,bx,by} = world1BossHealthLayout(W,H);
    const k = clamp(num(e.hp) / Math.max(1, num(e.max, 1)), 0, 1);
    ctx.fillStyle = "rgba(10,6,20,.8)"; ctx.fillRect(bx - 4, by - 4, bw + 8, 22);
    WORLD1_ORDER.forEach((h, i) => { const x0 = bx + bw * i / 10, x1 = Math.min(bx + bw * k, bx + bw * (i + 1) / 10); if (x1 > x0) { ctx.fillStyle = WORLD1_THEMES[h].color; ctx.fillRect(x0, by, x1 - x0, 14); } });
    ctx.fillStyle = "#fff"; for (const c of [0.7, 0.45, 0.2]) ctx.fillRect(bx + bw * c - 1, by - 4, 2, 22);
    ctx.font = "bold 15px sans-serif"; ctx.fillText(`QUIMERA OHANA · FASE ${num(e.phase, 1)}/4`, W / 2, by - 16);
    if(b.mode==='rest'){ctx.fillStyle='#b5f2db';ctx.font='700 11px sans-serif';ctx.fillText('NÚCLEO ABIERTO · CONTRAATACA',W/2,by+30);}

  }
  // Rótulo de ataque (cinemático, breve): emblema del héroe imitado + consejo.
  if (d.card) {
    const c=d.card,a=Math.min(1,c.t/8,(c.max-c.t)/12),y=W<640?218:H*.16,cw=Math.min(560,W-24),left=(W-cw)/2;
    ctx.globalAlpha=a;ctx.fillStyle='rgba(10,6,20,.88)';ctx.fillRect(left,y-34,cw,68);
    ctx.fillStyle=c.color;ctx.fillRect(left,y+30,cw*(1-c.t/c.max),3);
    drawHeroEmblem(ctx,c.hero,left+28,y,36,c.color,t);
    ctx.font='700 '+(W<500?14:18)+'px sans-serif';ctx.fillText(c.name.toUpperCase(),W/2+14,y-10,cw-76);
    ctx.fillStyle='#fff';ctx.font='12px sans-serif';ctx.fillText(c.tip,W/2+14,y+13,cw-76);
    ctx.globalAlpha = 1;
  }
  // Especial: bandas + coro de los diez ecos girando + nombre de fase.
  if (d.special) {
    const s = d.special, k = Math.min(1, s.t / 20);
    ctx.globalAlpha=k;ctx.fillStyle='rgba(10,6,20,.86)';ctx.fillRect(16,W<640?184:H*.10,Math.max(0,W-32),54);
    ctx.fillStyle='#ffd79c';ctx.font='700 '+Math.min(20,Math.round(W/22))+'px sans-serif';ctx.fillText(s.name||'',W/2,(W<640?184:H*.10)+17);
    ctx.fillStyle='#fff1dc';ctx.font='12px sans-serif';
    const tip=s.id==='eco'?'Sal de las columnas antes del impacto':s.id==='erupcion'?'Haz caso a las bandas: salta la baja, evita la alta':'Salta los ecos bajos; pasa bajo los altos';
    ctx.fillText(tip,W/2,(W<640?184:H*.10)+39,Math.max(1,W-48));
  }
  // Derrota: destellos que vuelan a cada héroe.
  if (d.defeat) {
    const f = d.defeat, k = clamp(f.t / f.max, 0, 1); bars(ctx, W, H, Math.min(1, f.t / 20));
    ctx.globalAlpha = 0.25 * (1 - k); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
    f.lights.forEach((l, i) => { const ease = k * k * (3 - 2 * k), r = (1 - ease) * Math.min(W, H) * 0.12 + ease * Math.min(W, H) * 0.38, a = l.a + k * 2;
      const x = W / 2 + Math.cos(a) * r, y = H / 2 + Math.sin(a) * r * 0.6; ctx.fillStyle = WORLD1_THEMES[l.hero].color; ctx.beginPath(); ctx.arc(x, y, 10 + 6 * k, 0, Math.PI * 2); ctx.fill(); if (k > 0.5) drawHeroEmblem(ctx, l.hero, x, y - 40, 44 * (k - 0.5) * 2, WORLD1_THEMES[l.hero].color, t); });
    ctx.fillStyle = "#fff"; ctx.font = `bold ${Math.round(H * 0.05)}px sans-serif`; ctx.fillText("LA QUIMERA SE DESCOSE", W / 2, H * 0.08);
  }
  if (d.hitFlash > 0) { ctx.globalAlpha = d.hitFlash / 40; ctx.fillStyle = "#ff3a5a"; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
}

export function world1BossSnapshot(g) { const d = g?.world1Boss; return d ? { t: d.t, card: d.card?.name || null, attackDmg: d.attackDmg, grace: d.grace, mercy: d.mercy, special: d.special?.id || null, defeat: !!d.defeat, done: d.done } : null; }
export { FUSION_SPECIALS };

export const OhanaWorld1Boss = Object.freeze({ create: createWorld1BossDirector, filterDamage: world1BossFilterDamage, update: updateWorld1BossDirector, drawBackdrop: drawWorld1BossBackdrop, drawTelegraphs: drawWorld1BossTelegraphs, drawOverlay: drawWorld1BossOverlay, safeLaneX, snapshot: world1BossSnapshot, FAIRNESS: BOSS_FAIRNESS, CARDS: ATTACK_CARDS });
if (typeof globalThis !== "undefined") globalThis.OhanaWorld1Boss = OhanaWorld1Boss;

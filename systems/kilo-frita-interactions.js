// V371: Kilo + Frita — 3 interacciones nuevas por personaje y capa de "feeling"
// para J/K/L/U. Todo es cosmético (no cambia daño ni CD): anticipación breve,
// efecto visible 0,8-1,5 s, impacto con flash/hitstop pequeño y escala por forma.
// Solo rellenos planos: nada de gradientes por frame.
export const KF_IDS = Object.freeze(["kilo", "frita"]);
export const KF_KEYS = Object.freeze({ emote: "g", duo: "t" });
export const KF_DUO_PARTNER = Object.freeze({ kilo: "stitcho", frita: "pizza" });
export const KF_DUR = Object.freeze({ emote: 78, duo: 96, world: 56, cast: [56, 66, 84, 64], impact: 22 });
const MAX_ACTS = 10, MAX_IMPACTS = 12;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const isKF = (p) => !!p && KF_IDS.includes(p.id);
const evoOf = (p) => clamp(Math.floor(Number(p?.evo) || 0), 0, 4);
const now = (g) => Number(g?.t) || 0;

function state(g) {
  if (!g._kf) g._kf = { acts: [], impacts: [], lastCast: null, orbs: -1, hearts: -1, worldCd: 0, emoteCd: 0, duoCd: 0, room: null };
  return g._kf;
}
function push(g, act) {
  const s = state(g);
  if (act.unique) for (let i = s.acts.length - 1; i >= 0; i--) if (s.acts[i].type === act.type) s.acts.splice(i, 1);
  s.acts.push({ age: 0, ...act });
  while (s.acts.length > MAX_ACTS) s.acts.shift();
  return act;
}

// (b) Emote con G.
export function triggerKFEmote(g) {
  const p = g?.player, s = g && state(g);
  if (!isKF(p) || p.dead || s.emoteCd > 0) return false;
  s.emoteCd = 90;
  push(g, { type: p.id === "kilo" ? "hula" : "salero", id: p.id, evo: evoOf(p), life: KF_DUR.emote, unique: true });
  g.nums?.add(p.x + p.w / 2, p.y - 30, p.id === "kilo" ? "¡HULA, HULA!" : "¡AL PUNTO DE SAL!", p.id === "kilo" ? "#ff6b9a" : "#ffd36a", true);
  return true;
}
// (c) Interacción con su compañero con T.
export function triggerKFDuo(g) {
  const p = g?.player, s = g && state(g);
  if (!isKF(p) || p.dead || s.duoCd > 0) return false;
  s.duoCd = 150;
  push(g, { type: p.id === "kilo" ? "abrazo" : "brindis", id: p.id, partner: KF_DUO_PARTNER[p.id], evo: evoOf(p), face: p.facing === -1 ? -1 : 1, life: KF_DUR.duo, unique: true });
  g.nums?.add(p.x + p.w / 2, p.y - 34, p.id === "kilo" ? "OHANA = FAMILIA" : "¡COMBO MENÚ!", p.id === "kilo" ? "#ffd36a" : "#ff8a2a", true);
  return true;
}

export function installKiloFritaInteractions(g, { target = globalThis, canAct = () => true } = {}) {
  if (!target?.addEventListener || g._kfInstalled) return false;
  g._kfInstalled = true;
  target.addEventListener("keydown", (e) => {
    if (e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.target?.closest?.("input, textarea, select, [contenteditable='true']")) return;
    const k = String(e.key || "").toLowerCase();
    if (k !== KF_KEYS.emote && k !== KF_KEYS.duo) return;
    if (!isKF(g.player) || !canAct()) return;
    if (k === KF_KEYS.emote ? triggerKFEmote(g) : triggerKFDuo(g)) e.preventDefault();
  });
  return true;
}

function wrapHits(g) {
  const prev = g.onAbilityHit;
  if (prev && prev._kf) return;
  const fn = (e, d) => {
    try { prev?.(e, d); } finally { kfImpact(g, e, d); }
  };
  fn._kf = true;
  g.onAbilityHit = fn;
}
export function kfImpact(g, e, d) {
  const p = g?.player, s = g && state(g);
  if (!isKF(p) || !e || !s.lastCast || now(g) - s.lastCast.t > 110) return;
  if (s.impacts.length >= MAX_IMPACTS) s.impacts.shift();
  const big = s.lastCast.slot >= 2 || d >= 30;
  s.impacts.push({ x: (e.x || 0) + (e.w || 0) / 2, y: (e.y || 0) + (e.h || 0) / 2, age: 0, id: p.id, big, evo: evoOf(p), rot: (s.impacts.length * 1.7) % 6.28 });
  g.hitstop = Math.max(g.hitstop || 0, big ? 3 : 1);
  if (big) { g.flash = Math.max(g.flash || 0, 4); g.flashColor = p.id === "kilo" ? "#fff1b0" : "#ffe3a0"; }
  g.shake = Math.min(18, (g.shake || 0) + (big ? 2 : 1));
}

export function updateKiloFritaInteractions(g) {
  const p = g?.player;
  if (!g) return;
  const s = state(g);
  wrapHits(g);
  if (s.emoteCd > 0) s.emoteCd--;
  if (s.duoCd > 0) s.duoCd--;
  if (s.worldCd > 0) s.worldCd--;
  for (let i = s.acts.length - 1; i >= 0; i--) if (++s.acts[i].age >= s.acts[i].life) s.acts.splice(i, 1);
  for (let i = s.impacts.length - 1; i >= 0; i--) if (++s.impacts[i].age >= KF_DUR.impact) s.impacts.splice(i, 1);
  if (!isKF(p) || p.dead) { s.acts.length = 0; s.impacts.length = 0; s.orbs = -1; return; }
  // Lanzamientos J/K/L/U: una capa visual por cast.
  const c = p._cast;
  if (c && c !== s.lastCastRef) {
    s.lastCastRef = c;
    const slot = clamp(c.slot | 0, 0, 3);
    s.lastCast = { slot, t: now(g) };
    push(g, { type: "cast", id: p.id, slot, evo: evoOf(p), face: p.facing === -1 ? -1 : 1, life: Math.round(KF_DUR.cast[slot] * (1 + evoOf(p) * 0.06)), unique: false });
    if (slot < 2) g.hitstop = Math.max(g.hitstop || 0, 1);
  }
  // (a) Reacción al mundo: coger cristales / corazones.
  if (s.room !== g.roomId) { s.room = g.roomId; s.orbs = -1; }
  const orbs = (g.orbs || []).reduce((n, o) => n + (o.taken ? 1 : 0), 0);
  const hearts = (g.hearts || []).reduce((n, h) => n + (h.taken ? 1 : 0), 0);
  if (s.orbs >= 0 && (orbs > s.orbs || hearts > s.hearts) && s.worldCd <= 0) {
    const heart = hearts > s.hearts;
    s.worldCd = 40;
    push(g, { type: p.id === "kilo" ? "acorde" : "crujir", id: p.id, heart, evo: evoOf(p), life: KF_DUR.world, unique: true });
    g.nums?.add(p.x + p.w / 2, p.y - 26, p.id === "kilo" ? (heart ? "¡ALOHA, CORAZÓN!" : "¡CLIN-CLIN!") : (heart ? "¡CON KÉTCHUP!" : "¡CRUJIENTE!"), p.id === "kilo" ? "#7fe0c8" : "#ffd36a");
  }
  s.orbs = orbs; s.hearts = hearts;
}

// ---------- dibujo ----------
function star(ctx, x, y, r, rot) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) { const a = rot + i * Math.PI / 4, rr = i % 2 ? r * .42 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill();
}
function note(ctx, x, y, sz, col) {
  ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = Math.max(2, sz * .22);
  ctx.beginPath(); ctx.ellipse(x, y, sz * .55, sz * .4, -.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + sz * .48, y - sz * .1); ctx.lineTo(x + sz * .48, y - sz * 1.4); ctx.lineTo(x + sz, y - sz * 1.05); ctx.stroke();
}
function flower(ctx, x, y, r, col, rot) {
  ctx.fillStyle = col;
  for (let i = 0; i < 5; i++) { const a = rot + i * 1.2566; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * .55, y + Math.sin(a) * r * .55, r * .45, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = "#fff2ba"; ctx.beginPath(); ctx.arc(x, y, r * .35, 0, Math.PI * 2); ctx.fill();
}
function fry(ctx, x, y, len, rot, col = "#ffd36a") {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = "#8a4a10"; ctx.fillRect(-3.5, -len / 2 - 1.5, 7, len + 3);
  ctx.fillStyle = col; ctx.fillRect(-2.5, -len / 2, 5, len);
  ctx.restore();
}
function label(ctx, txt, x, y, col, size = 15) {
  ctx.font = "900 " + size + "px system-ui, sans-serif"; ctx.textAlign = "center"; ctx.lineJoin = "round";
  ctx.lineWidth = 5; ctx.strokeStyle = "#2a1630"; ctx.strokeText(txt, x, y);
  ctx.fillStyle = col; ctx.fillText(txt, x, y);
}
const fade = (a) => clamp(Math.min(a.age / 6, (a.life - a.age) / 14), 0, 1);

function drawCast(ctx, a, px, py, ph, t) {
  const k = a.age / a.life, sc = 1 + a.evo * .16, f = a.face, ant = a.age < 8;
  const al = fade(a);
  ctx.globalAlpha = al;
  if (a.id === "kilo") {
    if (a.slot === 0) { // Ukelele: rasgueo + ondas de sonido
      if (ant) { ctx.fillStyle = "#fff6c8"; star(ctx, px + f * 16, py - 4, 6 + a.age, a.age * .4); }
      ctx.strokeStyle = "#ffb347"; ctx.lineWidth = 4;
      for (let i = 0; i < 3; i++) {
        const r = (20 + (a.age - 6 - i * 6) * 3.2) * sc; if (r <= 0) continue;
        ctx.globalAlpha = al * clamp(1 - r / (190 * sc), 0, 1);
        ctx.beginPath(); ctx.arc(px, py, r, f > 0 ? -.7 : Math.PI - .7, f > 0 ? .7 : Math.PI + .7); ctx.stroke();
      }
      ctx.globalAlpha = al;
      for (let i = 0; i < 3; i++) note(ctx, px + f * (24 + a.age * 1.6 + i * 14) * sc, py - 20 - Math.sin(a.age * .2 + i) * 10 - i * 6, 7 * sc, ["#ffb347", "#ffd36a", "#ff7a3a"][i]);
      if (a.age > 6 && a.age < 40) label(ctx, "♪ ¡RASGUEO!", px, py - ph - 14 - a.age * .3, "#ffd36a", 13 + a.evo);
    } else if (a.slot === 1) { // Hula: aro giratorio + pétalos
      const R = (40 + a.evo * 7) * (ant ? a.age / 8 : 1);
      ctx.strokeStyle = "#ff5ad5"; ctx.lineWidth = 5;
      // The physical hoop is drawn around Kilo by characters/hula-depth.js.
      for (let i = 0; i < 6 + a.evo; i++) {
        const an = t * .12 + i * 6.283 / (6 + a.evo);
        flower(ctx, px + Math.cos(an) * R, py - 22 + Math.sin(an) * R * .55, 3 * sc, i % 2 ? "#ff6b9a" : "#ffe9a8", an);
      }
      if (a.age > 8 && a.age < 50) label(ctx, "¡HULA FLOTANTE!", px, py - ph - 12, "#ff6b9a", 13 + a.evo);
    } else if (a.slot === 2) { // Ohana: corazones que estallan en anillo
      const R = (ant ? 30 : 30 + (a.age - 8) * 4.2) * sc;
      ctx.strokeStyle = "#ffd36a"; ctx.lineWidth = 6 * (1 - k) + 1;
      ctx.beginPath(); ctx.arc(px, py, R, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 8; i++) { const an = i * .785 + k; ctx.fillStyle = i % 2 ? "#ff6b9a" : "#ffd36a"; star(ctx, px + Math.cos(an) * R, py + Math.sin(an) * R, 7 * sc, an); }
      if (a.age > 4 && a.age < 70) label(ctx, "O·H·A·N·A", px, py - ph - 18, "#fff2ba", 16 + a.evo * 2);
    } else { // U: girasol de anticipación
      const R = (a.age < 12 ? a.age * 3 : 36 + Math.sin(a.age * .3) * 4) * sc;
      flower(ctx, px, py - ph - 10, R * .45, "#ffd36a", a.age * .08);
      ctx.strokeStyle = "#ff6b9a"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(px, py, R + 10, 0, Math.PI * 2); ctx.stroke();
    }
  } else {
    if (a.slot === 0) { // Sal: salero que sacude + cono de granos
      const shake = ant ? Math.sin(a.age * 2.4) * 4 : 0;
      ctx.fillStyle = "#e8f4ff"; ctx.fillRect(px + f * 12 - 5 + shake, py - 22, 10, 14);
      ctx.fillStyle = "#9aa6b8"; ctx.fillRect(px + f * 12 - 5 + shake, py - 25, 10, 4);
      ctx.fillStyle = "#fff8e0";
      for (let i = 0; i < 10 + a.evo * 3; i++) {
        const d = (a.age - 6) * 5 * sc - i * 6; if (d < 0) continue;
        const sp = ((i * 37) % 11 - 5) * .07;
        ctx.fillRect(px + f * (18 + d), py - 14 + d * sp, 3, 3);
      }
      if (a.age > 6 && a.age < 42) label(ctx, "¡SAL GORDA!", px, py - ph - 12, "#fff8e0", 13 + a.evo);
    } else if (a.slot === 1) { // Kétchup: chorro en arco + salpicaduras
      ctx.strokeStyle = "#e23b3b"; ctx.lineWidth = (6 + a.evo) * (1 - k * .6);
      const len = Math.min(1, a.age / 14);
      ctx.beginPath(); ctx.moveTo(px + f * 12, py - 6);
      ctx.quadraticCurveTo(px + f * 60 * sc, py - 60 * sc * len, px + f * 110 * sc * len, py - 4); ctx.stroke();
      ctx.fillStyle = "#c81e1e";
      if (a.age > 14) for (let i = 0; i < 5; i++) { const r = (3 + i % 3 * 2) * sc * Math.min(1, (a.age - 14) / 8); ctx.beginPath(); ctx.arc(px + f * (100 + i * 9 - 18) * sc, py + 2 - (i % 2) * 6, r, 0, Math.PI * 2); ctx.fill(); }
      if (a.age > 8 && a.age < 52) label(ctx, "¡CHOF!", px + f * 70 * sc, py - 50 * sc, "#ff5a4a", 15 + a.evo);
    } else if (a.slot === 2) { // Freidora: burbujas de aceite + ondas de calor
      for (let i = 0; i < 6 + a.evo; i++) {
        const x = px + f * (60 + i * 30) * sc, rise = ((a.age * 1.6 + i * 9) % 50);
        ctx.fillStyle = i % 2 ? "#ffd36a" : "#ff9a3c"; ctx.globalAlpha = al * (1 - rise / 50);
        ctx.beginPath(); ctx.arc(x, py + ph * .4 - rise, 4 + (i % 3) * 2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = al; ctx.strokeStyle = "#ffcf7a"; ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) { const x = px + f * (50 + i * 50) * sc; ctx.beginPath(); for (let y = 0; y < 40; y += 5) ctx.lineTo(x + Math.sin(y * .3 + a.age * .4) * 4, py + ph * .4 - 10 - y); ctx.stroke(); }
      if (a.age > 4 && a.age < 70) label(ctx, "¡AL ACEITE!", px, py - ph - 16, "#ffd36a", 16 + a.evo * 2);
    } else { // U: chisporroteo inicial
      for (let i = 0; i < 10; i++) { const an = i * .628 + a.age * .05, r = (14 + a.age * 2) * sc; ctx.fillStyle = i % 2 ? "#ffd36a" : "#e82020"; star(ctx, px + Math.cos(an) * r, py + Math.sin(an) * r, 5 * sc, an); }
    }
  }
  ctx.globalAlpha = 1;
}

function drawAct(ctx, a, p, cam, t, drawActor, roster) {
  const px = p.x + p.w / 2 - cam.x, py = p.y + p.h / 2 - cam.y, ph = p.h, feet = p.y + p.h - cam.y;
  const al = fade(a), sc = 1 + a.evo * .16;
  if (a.type === "cast") return drawCast(ctx, a, px, py, ph, t);
  ctx.globalAlpha = al;
  if (a.type === "hula") { // Kilo G: falda hula + lei + notas
    const sway = Math.sin(a.age * .35) * 6;
    ctx.fillStyle = "#6cbf4a";
    for (let i = -4; i <= 4; i++) ctx.fillRect(px + i * 4 * sc + sway * (1 - Math.abs(i) / 5), feet - 14 * sc, 3, 12 * sc);
    for (let i = 0; i < 7; i++) flower(ctx, px - 14 * sc + i * 4.6 * sc, py - ph * .15 + Math.abs(i - 3) * 1.6, 3.4 * sc, i % 2 ? "#ff6b9a" : "#ffd36a", i);
    for (let i = 0; i < 4; i++) { const k = ((a.age + i * 18) % 60) / 60; note(ctx, px + Math.sin(k * 6 + i) * 30, py - ph * .4 - k * 50, 7, ["#ffd36a", "#ff6b9a", "#7fe0c8", "#ffb347"][i]); }
    label(ctx, "♪ HULA ♪", px, py - ph - 16 - Math.abs(sway), "#ff6b9a", 14 + a.evo);
  } else if (a.type === "salero") { // Frita G: salero gigante + lluvia de sal
    const sh = Math.sin(a.age * .9) * 7, sx = px + (p.facing === -1 ? -1 : 1) * (p.w * .5 + 16 * sc) + sh, sy = py - ph * 1.25 - 18 * sc;
    ctx.fillStyle = "#e8f4ff"; ctx.fillRect(sx - 10 * sc, sy, 20 * sc, 26 * sc);
    ctx.fillStyle = "#9aa6b8"; ctx.fillRect(sx - 10 * sc, sy - 7 * sc, 20 * sc, 7 * sc);
    ctx.fillStyle = "#2a1630"; label(ctx, "S", sx, sy + 19 * sc, "#2a6cd4", 12 * sc);
    ctx.fillStyle = "#fff8e0";
    for (let i = 0; i < 18; i++) { const k = ((a.age * 2 + i * 13) % 50); ctx.fillRect(sx - 14 * sc + (i * 29) % Math.round(28 * sc),  sy + 24 * sc + k * 1.4, 3, 3); }
    for (let i = 0; i < 3; i++) { ctx.fillStyle = "#ffe66a"; star(ctx, px + (i - 1) * 22, py - ph * .2 - ((a.age + i * 10) % 30), 5, a.age * .2 + i); }
    label(ctx, "¡AL PUNTO!", px, sy - 14 * sc, "#ffd36a", 14 + a.evo);
  } else if (a.type === "acorde") { // Kilo toca cristal/corazón
    const R = 10 + a.age * 1.4;
    ctx.strokeStyle = a.heart ? "#ff6b9a" : "#7fe0c8"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(px, py, R * sc, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 5; i++) { const an = i * 1.256 + a.age * .05; a.heart ? flower(ctx, px + Math.cos(an) * R * sc, py + Math.sin(an) * R * sc, 5, "#ff6b9a", an) : note(ctx, px + Math.cos(an) * R * sc, py + Math.sin(an) * R * sc - 4, 6, "#7fe0c8"); }
  } else if (a.type === "crujir") { // Frita toca cristal/corazón
    for (let i = 0; i < 8; i++) { const an = i * .785, r = (8 + a.age * 1.5) * sc; a.heart ? (ctx.fillStyle = "#e23b3b", ctx.beginPath(), ctx.arc(px + Math.cos(an) * r, py + Math.sin(an) * r, 4, 0, Math.PI * 2), ctx.fill()) : fry(ctx, px + Math.cos(an) * r, py + Math.sin(an) * r, 12, an + a.age * .2); }
    ctx.fillStyle = "#fff6c8"; star(ctx, px, py - ph * .5, 8 + Math.sin(a.age * .5) * 3, a.age * .1);
  } else if (a.type === "abrazo" || a.type === "brindis") {
    const partner = roster?.find?.((r) => r.id === a.partner);
    const k = a.age, f = a.face, inT = 18;
    const pw = (roster?.find?.((r) => r.id === a.partner)?.forms?.[a.evo]?.w) || 24, rest = (p.w + pw) * .5 + 14 * sc;
    const off = k < inT ? rest + 90 - 90 * (k / inT) : rest - (a.type === "abrazo" && k > 30 && k < 70 ? 10 * sc : 0);
    const ax = p.x + p.w / 2 + f * off;
    if (partner && typeof drawActor === "function") {
      const form = partner.forms?.[Math.min(a.evo, (partner.forms?.length || 1) - 1)] || partner;
      const w = form.w || 24, h = form.h || 32, hop = k > inT ? Math.abs(Math.sin(k * .25)) * 6 : 0;
      const actor = { ...partner, ...form, id: partner.id, evo: a.evo, x: ax - w / 2, y: p.y + p.h - h - hop, w, h, vx: 0, vy: 0, facing: -f, grounded: true, health: 1, maxHealth: 1, cds: {}, abilities: partner.abilities || [] };
      try { ctx.globalAlpha = al; drawActor(ctx, actor, cam, t); } catch {}
    } else { ctx.fillStyle = a.type === "abrazo" ? "#4a7bd4" : "#ff8a2a"; ctx.beginPath(); ctx.arc(ax - cam.x, py, 14, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = al;
    const mx = (px + ax - cam.x) / 2;
    if (a.type === "abrazo") {
      for (let i = 0; i < 4; i++) { const r = ((k * 1.2 + i * 14) % 56); ctx.fillStyle = i % 2 ? "#ff6b9a" : "#ff3f6c"; heart(ctx, mx + Math.sin(i * 2 + k * .1) * 14, py - ph * .5 - r, 6 + a.evo); }
      if (k > 50) for (let i = 0; i < 3; i++) note(ctx, mx - 20 + i * 20, py - ph - 6 - ((k + i * 8) % 24), 7, ["#ffd36a", "#7fe0c8", "#ffb347"][i]);
      label(ctx, k < 50 ? "¡ABRAZO OHANA!" : "♪ UKELELE A DÚO ♪", mx, py - ph - 30, "#ffd36a", 14 + a.evo);
    } else {
      const clink = k > 34 && k < 60;
      fry(ctx, mx - 10 + (clink ? 4 : 0), py - ph * .6, 18, .5, "#ffd36a");
      ctx.fillStyle = "#ffcf5a"; ctx.beginPath(); ctx.moveTo(mx + 4 - (clink ? 4 : 0), py - ph * .75); ctx.lineTo(mx + 20, py - ph * .3); ctx.lineTo(mx - 2, py - ph * .3); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#c81e1e"; ctx.beginPath(); ctx.arc(mx + 8, py - ph * .45, 2.5, 0, Math.PI * 2); ctx.fill();
      if (clink) { ctx.fillStyle = "#fff6c8"; star(ctx, mx, py - ph * .75, 10, k * .3); }
      if (k > 40) for (let i = 0; i < 6; i++) { const r = (k - 40) * 1.6; ctx.fillStyle = i % 2 ? "#e23b3b" : "#ffd36a"; ctx.beginPath(); ctx.arc(mx + Math.cos(i) * r, py - ph * .7 - Math.sin(i * 1.3) * r * .6, 3, 0, Math.PI * 2); ctx.fill(); }
      label(ctx, clink ? "¡CHIN-CHIN!" : "¡COMBO MENÚ!", mx, py - ph - 30, "#ff8a2a", 14 + a.evo);
    }
  }
  ctx.globalAlpha = 1;
}
function heart(ctx, x, y, r) {
  ctx.beginPath(); ctx.arc(x - r * .5, y, r * .55, Math.PI, 0); ctx.arc(x + r * .5, y, r * .55, Math.PI, 0);
  ctx.lineTo(x, y + r); ctx.closePath(); ctx.fill();
}

export function drawKiloFritaInteractions(ctx, g, cam, t, drawActor, roster) {
  const s = g?._kf, p = g?.player;
  if (!s || !p || !ctx || (!s.acts.length && !s.impacts.length)) return;
  ctx.save();
  try {
    for (const a of s.acts) drawAct(ctx, a, p, cam, t, drawActor, roster);
    for (const im of s.impacts) {
      const k = im.age / KF_DUR.impact, r = (im.big ? 18 : 11) * (1 + im.evo * .12) * (.6 + k * .8);
      ctx.globalAlpha = 1 - k;
      ctx.fillStyle = im.id === "kilo" ? (im.big ? "#fff1b0" : "#ffd36a") : (im.big ? "#ffe3a0" : "#ff5a4a");
      star(ctx, im.x - cam.x, im.y - cam.y, r, im.rot + k);
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(im.x - cam.x, im.y - cam.y, r * .3 * (1 - k), 0, Math.PI * 2); ctx.fill();
    }
  } finally { ctx.restore(); }
}

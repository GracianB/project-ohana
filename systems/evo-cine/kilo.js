// V372 · Cinemática de evolución de Kilo.
// Unidades: `t` en SEGUNDOS desde el inicio, igual que systems/evo-cinema.js
// ((performance.now() - t0) / 1000) y evolutionTiming(). El dibujo del
// personaje reutiliza drawCharacter (characters/draw.js) con un muñeco.
// Sin gradientes por frame: el halo es un único radial cacheado por contexto.
import { drawCharacter } from "../../characters/draw.js";
import { KILO_VISUAL_H } from "../../characters/art/kilo.js";
import { ROSTER } from "../../characters/roster.js";

export const EVO_CINE_DURATION = 4.5; // s
export const EVO_CINE_PHASES = Object.freeze({ charge: [0, 1.4], transform: [1.4, 2.6], reveal: [2.6, 4.5] });
export const KILO_FORM_NAMES = Object.freeze(["Kilo Bebé", "Kilo", "Kilo Ohana", "Super Kilo", "Kilo Flor Solar"]);
export const KILO_EVOLUTION_STORIES=Object.freeze([
 {motif:'home',sky:'#302442',line:'Una pequeña canción puede encontrar un hogar.'},
 {motif:'song',sky:'#51334b',line:'Aprendí esta canción para volver a encontrarte.'},
 {motif:'family',sky:'#263951',line:'Cuando bailamos juntos, nadie está solo.'},
 {motif:'guardian',sky:'#302b55',line:'Ahora me toca a mí cuidar de nuestra familia.'},
 {motif:'bloom',sky:'#67495f',line:'Todo el amor que recibimos vuelve a florecer.'}
]);
const COL = { bg: "#1b1030", bg2: "#2a1a44", sea: "#163a52", leaf: "#2f8a4a", leaf2: "#46b060", vein: "#1f5e33", gold: "#ffd36a", pink: "#ff6b9a", teal: "#7fe0c8", white: "#fff6e8", skirt: "#6cbf4a" };
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const easeOut = (k) => 1 - (1 - k) ** 3;
const easeBack = (k) => { const c = 1.7; return 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2; };

export function evoCinePhase(t) {
  if (t < EVO_CINE_PHASES.transform[0]) return "carga";
  if (t < EVO_CINE_PHASES.reveal[0]) return "transformacion";
  return "presentacion";
}
// Convención Ohana: formas 1..5 (1 = inicial). También acepta el nombre de forma del roster.
const formIndex = (f) => clamp(typeof f === "string" && !Number.isFinite(+f) ? Math.max(0, NAMES_REF().indexOf(f)) : Math.floor(Number(f) || 1) - 1, 0, 4);
function NAMES_REF() { return KILO_FORM_NAMES; }


// drawCharacter (rig.js, evolution.js, art/*.js) crea gradientes en cada frame.
// Envolvemos el ctx: create*Gradient devuelve un "gradiente plano" que guarda
// sus paradas y, al asignarse como fill/stroke, se convierte en el color central.
// Resultado: cero gradientes nativos creados durante la cinemática.
const FLAT = Symbol("flatGradient"), WRAP = new WeakMap();
function flatGradient() { const stops = []; return { [FLAT]: stops, addColorStop(o, c) { stops.push([+o || 0, String(c)]); } }; }
function flatColor(g) { const st = g[FLAT]; if (!st.length) return "rgba(0,0,0,0)"; st.sort((a, b) => a[0] - b[0]); return st[Math.floor((st.length - 1) / 2)][1]; }
export function flatCtx(ctx) {
  if (!ctx || typeof ctx !== "object") return ctx;
  if (WRAP.has(ctx)) return WRAP.get(ctx);
  const px = new Proxy(ctx, {
    get(o, k) {
      if (k === "createLinearGradient" || k === "createRadialGradient" || k === "createConicGradient") return flatGradient;
      const v = o[k]; return typeof v === "function" ? v.bind(o) : v;
    },
    set(o, k, v) { o[k] = v && v[FLAT] ? flatColor(v) : v; return true; },
  });
  WRAP.set(ctx, px); return px;
}
const haloCache = new WeakMap();
function halo(ctx) {
  let g = haloCache.get(ctx);
  if (!g && typeof ctx.createRadialGradient === "function") {
    g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, "rgba(255,230,140,.85)"); g.addColorStop(.45, "rgba(255,150,160,.35)"); g.addColorStop(1, "rgba(255,120,160,0)");
    haloCache.set(ctx, g);
  }
  return g || "rgba(255,220,140,.3)";
}
function leaf(ctx, x, y, len, rot, c1, c2) { // hoja tropical (monstera simplificada)
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = c1; ctx.beginPath(); ctx.ellipse(len * .5, 0, len * .5, len * .24, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = COL.bg; for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.ellipse(len * i * .22, len * .14, len * .05, len * .1, .5, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = c2; ctx.lineWidth = Math.max(1, len * .03); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len * .95, 0); ctx.stroke();
  ctx.restore();
}
function flower(ctx, x, y, r, col, rot) {
  ctx.fillStyle = col;
  for (let i = 0; i < 5; i++) { const a = rot + i * TAU / 5; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * .55, y + Math.sin(a) * r * .55, r * .45, 0, TAU); ctx.fill(); }
  ctx.fillStyle = COL.white; ctx.beginPath(); ctx.arc(x, y, r * .3, 0, TAU); ctx.fill();
}
function note(ctx, x, y, s, col) {
  ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = Math.max(1.5, s * .2);
  ctx.beginPath(); ctx.ellipse(x, y, s * .55, s * .4, -.4, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + s * .48, y - s * .1); ctx.lineTo(x + s * .48, y - s * 1.5); ctx.lineTo(x + s, y - s * 1.1); ctx.stroke();
}
function text(ctx, s, x, y, size, col) {
  ctx.font = "900 " + Math.round(size) + "px system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(3, size * .18); ctx.strokeStyle = "#2a1630"; ctx.strokeText(s, x, y); ctx.fillStyle = col; ctx.fillText(s, x, y);
}
function kiloActor(evo, pose) {
  const def = ROSTER.find((r) => r.id === "kilo") || ROSTER[0], f = def.forms?.[evo] || def;
  return { id: "kilo", evo, color: f.color || def.color, w: f.w || 24, h: f.h || 30, x: 0, y: 0, facing: 1, grounded: true, vx: 0, vy: 0, melee: 0, invuln: 0, visualScale: 1, _poseOverride: pose, _evoT: 0, health: 1, maxHealth: 1 };
}
/** Dibuja a Kilo (forma evo) con los pies en (fx, fy) y altura aproximada H px. */
function drawKilo(ctx, evo, fx, fy, H, t, pose, draw) {
  const p = kiloActor(evo, pose);
  const s = H / KILO_VISUAL_H[evo];
  p._kiloPerformance={kind:['entrance','relic','family','guardian','bloom'][evo],time:t};
  ctx.save(); ctx.translate(fx, fy); ctx.scale(s, s);
  p.x = -p.w / 2; p.y = -p.h;
  try { draw(flatCtx(ctx), p, { x: 0, y: 0 }, t * 60, { reduceMotion: false }); } catch { ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.w, p.h); }
  ctx.restore();
}

/**
 * Pinta un frame de la cinemática. `t` en segundos (0..EVO_CINE_DURATION).
 * fromForm/toForm: forma 1..5 (1 = inicial) o nombre de forma del roster.
 * opts.drawActor permite inyectar otro dibujante (tests).
 */
export function drawEvoCine(ctx, w, h, t, fromForm, toForm, opts = {}) {
  if (!ctx || !(w > 0) || !(h > 0)) return "none";
  const reduced=opts.reduceMotion===true || globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches===true;
  const actorDraw = opts.drawActor || drawCharacter;
  const draw=(ctx,p,cam,frame,options)=>actorDraw(ctx,p,cam,reduced?0:frame,{...options,reduceMotion:reduced});
  const from = formIndex(fromForm), to = toForm == null ? Math.min(4, from + 1) : formIndex(toForm);
  t = clamp(Number(t) || 0, 0, EVO_CINE_DURATION);
  const phase = evoCinePhase(t);
  const cx = w / 2, foot = h * .74, H = Math.min(h * .5, w * .42);
  const kC = seg(t, 0, 1.4), kT = seg(t, 1.4, 2.6), kR = seg(t, 2.6, 4.5);
  ctx.save();
  // fondo: atardecer en capas + mar
  const story=KILO_EVOLUTION_STORIES[to];
  ctx.fillStyle = story.sky; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = COL.bg2; ctx.fillRect(0, h * .35, w, h * .4);
  ctx.fillStyle = COL.sea; ctx.fillRect(0, h * .75, w, h * .25);
  ctx.fillStyle = "rgba(255,211,106,.25)"; ctx.beginPath(); ctx.arc(cx, h * .75, H * (.5 + kR * .4), Math.PI, 0); ctx.fill();
  if(story.motif==='family')for(let i=0;i<6;i++){
   const x=w*(.1+i*.16),y=h*(.4+(i%2)*.07);ctx.fillStyle=i%2?COL.pink:COL.gold;ctx.beginPath();ctx.ellipse(x,y,H*.025,H*.04,0,0,TAU);ctx.fill();ctx.strokeStyle=COL.gold;ctx.beginPath();ctx.moveTo(x,y-H*.04);ctx.lineTo(x,y-H*.13);ctx.stroke();
  }
  if(story.motif==='guardian'){ctx.strokeStyle=COL.teal;ctx.lineWidth=H*.035;ctx.beginPath();ctx.ellipse(cx,foot+8,H*.9,H*.12,0,Math.PI,TAU);ctx.stroke();}
  if(story.motif==='song')for(let i=0;i<3;i++)note(ctx,cx-H*.65+i*H*.65,foot-H*(.9+i*.1),H*.06,COL.gold);
  if(story.motif==='bloom')for(let i=0;i<7;i++)flower(ctx,w*(i+.5)/7,h*.76,H*.06,i%2?COL.pink:COL.gold,i);
  // hojas tropicales que se cierran (carga) y se abren (presentación)
  const close = phase === "presentacion" ? 1 - easeOut(kR) : easeOut(kC);
  for (let i = 0; i < 4; i++) {
    const left = i < 2, top = i % 2 === 0, L = Math.min(w, h) * (.3 + .04 * i);
    const sway = reduced?0:Math.sin(t * 2 + i) * .06;
    const bx = left ? -L * .25 + close * L * .25 : w + L * .25 - close * L * .25, by = top ? h * .05 : h * .95;
    const rot = (left ? 0 : Math.PI) + (top ? 1 : -1) * (left ? .5 : -.5) + sway;
    leaf(ctx, bx, by, L, rot, i % 2 ? COL.leaf : COL.leaf2, COL.vein);
  }
  // cuerdas de ukelele (vibran en la carga)
  const strings = reduced?0:phase === "carga" ? .35 : phase === "transformacion" ? (1-kT)*.35 : 0;
  if (strings > 0) {
    ctx.globalAlpha = strings * .8; ctx.strokeStyle = COL.gold; ctx.lineWidth = 2;
    for (let s = 0; s < 4; s++) {
      const y = h * (.3 + s * .1), amp = (6 + s * 2) * (1 - kT) * Math.sin(t * (22 + s * 5));
      ctx.beginPath(); ctx.moveTo(0, y); ctx.quadraticCurveTo(cx, y + amp, w, y); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  // halo (cacheado) detrás del personaje
  const hr = H * (phase === "carga" ? .4 + kC * .3 : phase === "transformacion" ? .75 + Math.sin(kT * Math.PI) * .5 : .8);
  ctx.save(); ctx.translate(cx, foot - H * .45); ctx.scale(hr, hr); ctx.fillStyle = halo(ctx); ctx.beginPath(); ctx.arc(0, 0, 1, 0, TAU); ctx.fill(); ctx.restore();
  if(phase!=='carga'){
   ctx.save();ctx.globalAlpha=reduced?.18:Math.sin(Math.min(1,kT)*Math.PI*.8)*.35;ctx.strokeStyle=to===4?COL.gold:COL.pink;
   for(let i=0;i<10;i++){const a=i*TAU/10+(reduced?0:t*.15),inner=H*.25,outer=H*(.75+kT*.5);ctx.lineWidth=i%2?2:4;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*inner,foot-H*.45+Math.sin(a)*inner);ctx.lineTo(cx+Math.cos(a)*outer,foot-H*.45+Math.sin(a)*outer);ctx.stroke();}ctx.restore();
  }

  if (phase === "carga") {
    // notas que convergen + falda hula que gira bajo Kilo
    for (let i = 0; i < 8; i++) {
      const a = i * TAU / 8 + t, r = H * (1.1 - kC * .75);
      note(ctx, cx + Math.cos(a) * r, foot - H * .45 + Math.sin(a) * r * .6, H * .06, [COL.gold, COL.pink, COL.teal][i % 3]);
    }
    drawKilo(ctx, from, cx, foot, H * .72, t, "idle", draw);
    text(ctx, "♪ ALOHA… ♪", cx, h * .14, Math.min(w, h) * .055 * (0.6 + kC * .4), COL.gold);
  } else if (phase === "transformacion") {
    // parpadeo forma vieja/nueva que acelera + guirnalda que gira y crece
    const reveal=easeOut(kT),sc=reduced?1:1+Math.sin(kT*Math.PI)*.035;
    ctx.globalAlpha=1-reveal;
    drawKilo(ctx,from,cx,foot,H*(.72-kT*.08)*sc,t,"idle",draw);
    ctx.globalAlpha=reveal;
    ctx.save();if(!reduced){ctx.beginPath();ctx.rect(cx-H,foot-H*1.2*easeOut(kT),H*2,H*1.3);ctx.clip();}
    drawKilo(ctx,to,cx,foot,H*(.85+.23*reveal)*sc,t,"victory",draw);ctx.restore();
    ctx.globalAlpha=1;
    const R = H * (.35 + kT * .45);
    for (let i = 0; i < 12; i++) { const a = i * TAU / 12 + t * 3; flower(ctx, cx + Math.cos(a) * R, foot - H * .45 + Math.sin(a) * R * .45, H * .05, i % 2 ? COL.pink : COL.gold, a); }
    // A continuous hand-to-hand phrase replaces flashing between bodies.
  } else {
    // presentación: nueva forma con rebote, guirnalda puesta, pétalos y título
    const k = reduced?1:easeOut(clamp(kR/.35,0,1));
    drawKilo(ctx, to, cx, foot, H * (1.04 + .04 * k), t, "victory", draw);
    // The real rig already wears its lei; keep the face clear at every size.
    for (let i = 0; i < 16; i++) {
      const fall = ((t * 60 * (.6 + (i % 5) * .1) + i * 37) % (h * 1.1));
      flower(ctx, (i * 97) % w, fall - h * .05, 5 + (i % 3) * 2, [COL.pink, COL.gold, COL.teal][i % 3], t + i);
    }
    for (let i = 0; i < 5; i++) note(ctx, cx + Math.cos(i * 1.3 + t) * H * .7, foot - H * (.7 + ((t * .5 + i * .2) % 1) * .5), H * .05, [COL.gold, COL.teal, COL.pink][i % 3]);
    const name = KILO_FORM_NAMES[to];
    ctx.globalAlpha = clamp(kR * 4, 0, 1);
    text(ctx, ["ALOHA","ENCUENTRA SU RITMO","BAILA CON SU FAMILIA","GUARDIANA DEL COMPÁS","LA ISLA FLORECE"][to], cx, h * .1, Math.min(w, h) * .035, COL.teal);
    text(ctx, "¡" + name.toUpperCase() + "!", cx, h * .18, Math.min(w, h) * .08 * (.8 + .2 * k), COL.gold);
    text(ctx, "Forma " + (to + 1) + " de 5", cx, h * .9, Math.min(w, h) * .035, COL.white);
    const words=story.line.split(' ');let line='',row=0;ctx.font=`600 ${Math.max(11,Math.min(w,h)*.027)}px sans-serif`;
    for(const word of words){const next=line?line+' '+word:word;if(ctx.measureText(next).width>w*.86){text(ctx,line,cx,h*.81+row*Math.min(w,h)*.035,Math.max(11,Math.min(w,h)*.027),COL.white);row++;line=word;}else line=next;}
    text(ctx,line,cx,h*.81+row*Math.min(w,h)*.035,Math.max(11,Math.min(w,h)*.027),COL.white);
    text(ctx,['J · NOTA SALTARINA','K · HULA LIBRE','L · GUARDIANES OHANA','I · REMATE ALOHA','P · A COMPÁS DEL SOL'][to],cx,h*.96,Math.max(11,Math.min(w,h)*.027),COL.gold);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  return phase;
}

// OHANA · Yomi IA · metamorfosis propia en partida (4 actos, 4 s).
// Canvas 2D, determinista, sin gradientes ni azar (ruido hash).
// Actos: 1 «¿hola?» (pregunta) → 2 «leer» (runas de código convergen)
// → 3 «compilar» (capullo de datos + un único destello suave) → 4 «despertar».
import {ROSTER} from '../../characters/roster.js';
import {drawEvolutionActor} from './real-actor.js';
export const EVO_CINE_DURATION = 4.0;
export const YOMI_EVO_ACTS = Object.freeze([
 Object.freeze({id:'question',start:0,end:.9}),
 Object.freeze({id:'read',start:.9,end:1.8}),
 Object.freeze({id:'compile',start:1.8,end:2.9}),
 Object.freeze({id:'awaken',start:2.9,end:4})
]);
export const YOMI_FLASH_AT = 2.35;
const TAU = Math.PI * 2, MINT = "#4ff0c8", CORAL = "#ff7f6e", GOLD = "#ffd56b", BG = "#071526";
const FORM_NAMES = ROSTER.find(r => r.id === 'yomi').forms.map(f => f.name);
const STARS = ["#eb554a","#5ad1ff","#ffe14a","#c9a8ff","#ff6a2a","#4cbf56","#f0b43a","#e0402a","#f2c1ff","#4ff0c8"];
const LINES = ["¿hola?", "leyendo a la familia…", "compilando recuerdos…", "nadie se queda atrás"];
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, Number(v) || 0));
const sm = v => { const k = cl(v); return k * k * (3 - 2 * k); };
const hn = i => { const x = Math.sin(i * 127.1 + 3.3) * 43758.5453; return x - Math.floor(x); };
const formName = f => FORM_NAMES[Math.max(0, Math.min(4, (f | 0) - 1))];

export function evoCinePhase(t) {
  t = Number(t) || 0;
  for (const a of YOMI_EVO_ACTS) if (t >= a.start && t < a.end) return a.id;
  return "awaken";
}
export function yomiEvoBeat(t = 0, from = 1, to = 2, reduced = false) {
 const time = cl(t, 0, EVO_CINE_DURATION), act = YOMI_EVO_ACTS.find(a => time < a.end) || YOMI_EVO_ACTS[3];
 return Object.freeze({ act: act.id, progress: sm((time - act.start) / (act.end - act.start)), time,
  from: cl(from, 1, 5), to: cl(to, 1, 5), reduced: !!reduced,
  runes: sm((time - .7) / 1.1), cocoon: sm((time - 1.8) / .4) * (1 - sm((time - YOMI_FLASH_AT) / .25)),
  flash: reduced ? 0 : Math.max(0, 1 - Math.abs(time - YOMI_FLASH_AT) / .18),
  reveal: sm((time - 2.4) / .6), nodes: cl(to, 1, 5) >= 5 ? 10 : cl(to, 1, 5) * 2 });
}
function rune(ctx, x, y, s, i, col) {
 // Code runes: brackets, slash, chevrons, dots — "magic" written as code.
 ctx.save(); ctx.translate(x, y); ctx.strokeStyle = col; ctx.lineWidth = Math.max(1, s * .16); ctx.lineCap = "round"; ctx.beginPath();
 switch (i % 5) {
  case 0: ctx.moveTo(-s * .2, -s * .5); ctx.lineTo(-s * .5, 0); ctx.lineTo(-s * .2, s * .5); ctx.moveTo(s * .2, -s * .5); ctx.lineTo(s * .5, 0); ctx.lineTo(s * .2, s * .5); break;
  case 1: ctx.moveTo(-s * .25, -s * .5); ctx.quadraticCurveTo(-s * .5, 0, -s * .25, s * .5); ctx.moveTo(s * .25, -s * .5); ctx.quadraticCurveTo(s * .5, 0, s * .25, s * .5); break;
  case 2: ctx.moveTo(s * .3, -s * .5); ctx.lineTo(-s * .3, s * .5); break;
  case 3: ctx.arc(0, 0, s * .35, 0, TAU); ctx.moveTo(-s * .5, 0); ctx.lineTo(s * .5, 0); break;
  default: ctx.moveTo(-s * .4, -s * .3); ctx.lineTo(s * .4, -s * .3); ctx.moveTo(-s * .4, s * .3); ctx.lineTo(s * .1, s * .3); break;
 }
 ctx.stroke(); ctx.restore();
}
export function drawEvoCine(ctx, w, h, t, fromForm = 1, toForm = 2, opts = {}) {
 const reduced = !!opts.reducedMotion, b = yomiEvoBeat(reduced ? 3.6 : t, fromForm, toForm, reduced);
 const K = h / 300, cx = w / 2, cy = h * .7, to = b.to | 0, T = reduced ? 0 : b.time;
 ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
 ctx.fillStyle = BG; ctx.fillRect(0, 0, w, h);
 // grid floor + distant stars (flat colours)
 ctx.strokeStyle = "#12304a"; ctx.lineWidth = 1;
 for (let i = -8; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(cx + i * 22 * K, cy + 8 * K); ctx.lineTo(cx + i * 70 * K, h); ctx.stroke(); }
 for (let j = 0; j < 5; j++) { const y = cy + 8 * K + j * j * 6 * K; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
 for (let i = 0; i < 26; i++) { ctx.globalAlpha = .25 + .35 * Math.abs(Math.sin(T * 1.3 + i)); ctx.fillStyle = i % 4 ? "#cfe8ff" : MINT; ctx.fillRect(hn(i) * w, hn(i + 40) * h * .55, 2 * K, 2 * K); }
 ctx.globalAlpha = 1;
 const fromS = 1.9 * K, toS = 2.3 * K;
 if (b.act === 'question') {
  // ACT 1 · a single question appears over the old form; the LED blinks.
  const k = b.progress;
  drawEvolutionActor(ctx, 'yomi', cx, cy, fromS, b.from, T * 60);
  ctx.globalAlpha = k; ctx.fillStyle = CORAL; ctx.font = `900 ${Math.round(34 * K)}px sans-serif`; ctx.textAlign = "center"; ctx.fillText("?", cx + 34 * K, cy - 92 * K - k * 8 * K);
  ctx.globalAlpha = 1;
 } else if (b.act === 'read') {
  // ACT 2 · runes of code converge into the core: Yomi reads the family.
  drawEvolutionActor(ctx, 'yomi', cx, cy, fromS, b.from, T * 60);
  for (let i = 0; i < 18; i++) {
   const a = i * TAU / 18 + T * .6, r = (180 - 130 * b.progress) * K;
   ctx.globalAlpha = .4 + .6 * b.progress; rune(ctx, cx + Math.cos(a) * r, cy - 50 * K + Math.sin(a) * r * .55, 12 * K, i, i % 3 ? MINT : GOLD);
  }
  ctx.globalAlpha = 1;
 } else if (b.act === 'compile') {
  // ACT 3 · data cocoon (hexagon), progress bar and one soft flash.
  const k = b.progress, R = (48 + 14 * Math.sin(k * Math.PI)) * K;
  if (b.time < YOMI_FLASH_AT) drawEvolutionActor(ctx, 'yomi', cx, cy, fromS, b.from, T * 60);
  else drawEvolutionActor(ctx, 'yomi', cx, cy, toS * (.85 + .15 * b.reveal), to, T * 60);
  ctx.save(); ctx.translate(cx, cy - 50 * K); ctx.rotate(T * .8);
  ctx.globalAlpha = .25 + .5 * b.cocoon; ctx.fillStyle = "#0d2a3a"; ctx.strokeStyle = MINT; ctx.lineWidth = 3 * K;
  ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i * TAU / 6; i ? ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R) : ctx.moveTo(Math.cos(a) * R, Math.sin(a) * R); } ctx.closePath();
  if (b.cocoon > .05) ctx.fill(); ctx.stroke(); ctx.restore();
  const bw = 160 * K; ctx.globalAlpha = 1; ctx.strokeStyle = MINT; ctx.lineWidth = 2 * K; ctx.strokeRect(cx - bw / 2, h * .2, bw, 10 * K);
  ctx.fillStyle = MINT; ctx.fillRect(cx - bw / 2 + 2, h * .2 + 2, (bw - 4) * k, 10 * K - 4);
  if (b.flash > 0) { ctx.globalAlpha = .55 * b.flash; ctx.fillStyle = "#eafffa"; ctx.fillRect(0, 0, w, h); }
  ctx.globalAlpha = 1;
 } else {
  // ACT 4 · awakening: the new form with family stars linked around it.
  const k = b.progress, bob = reduced ? 0 : Math.sin(T * 3) * 3 * K;
  const n = b.nodes, pts = [];
  for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + i * TAU / n + T * .2; pts.push([cx + Math.cos(a) * 140 * K, cy - 60 * K + Math.sin(a) * 70 * K]); }
  ctx.strokeStyle = GOLD; ctx.lineWidth = 1.5 * K; ctx.globalAlpha = .6 * k; ctx.beginPath();
  pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.stroke();
  pts.forEach(([x, y], i) => { ctx.globalAlpha = k; ctx.fillStyle = STARS[i % 10]; ctx.beginPath(); ctx.arc(x, y, 4 * K, 0, TAU); ctx.fill(); });
  ctx.globalAlpha = 1;
  drawEvolutionActor(ctx, 'yomi', cx, cy + bob, toS, to, T * 60);
  ctx.globalAlpha = sm(k * 2); ctx.textAlign = "center"; ctx.lineWidth = 6 * K; ctx.strokeStyle = BG;
  ctx.font = `900 ${Math.round(30 * K)}px sans-serif`; ctx.strokeText("¡" + formName(to) + "!", cx, h * .14); ctx.fillStyle = MINT; ctx.fillText("¡" + formName(to) + "!", cx, h * .14);
  ctx.font = `700 ${Math.round(14 * K)}px sans-serif`; ctx.lineWidth = 4 * K; ctx.strokeText("Forma " + b.from + " → " + to, cx, h * .14 + 22 * K); ctx.fillStyle = GOLD; ctx.fillText("Forma " + b.from + " → " + to, cx, h * .14 + 22 * K);
  ctx.globalAlpha = 1;
 }
 const li = YOMI_EVO_ACTS.findIndex(a => a.id === b.act);
 ctx.globalAlpha = .85; ctx.textAlign = "center"; ctx.fillStyle = "#bff9ea"; ctx.font = `600 ${Math.round(13 * K)}px monospace`;
 ctx.fillText("> " + LINES[li], cx, h * .93); ctx.globalAlpha = 1;
 ctx.restore();
}

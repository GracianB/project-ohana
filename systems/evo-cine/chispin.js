import {drawEvolutionActor} from './real-actor.js';
// Cinemática de evolución de Chispín: rayos. Sin gradientes.
// Fases: carga (0-1.5s), transformación (1.5-2.8s), presentación (2.8-4s).
export const EVO_CINE_DURATION = 4.5;
export const FORM_NAMES = ["Chispín Bebé", "Chispín", "Voltín", "Trueno Gordo", "Chispín Tormenta"]; // = roster evoNames
const formName = (f) => FORM_NAMES[Math.max(0, Math.min(FORM_NAMES.length - 1, (f | 0) - 1))] || "Chispín";
// rayo en zigzag determinista (sin random por frame)
function bolt(ctx, x1, y1, x2, y2, seed, segs = 8, jit = 18) {
  ctx.beginPath(); ctx.moveTo(x1, y1);
  for (let i = 1; i < segs; i++) {
    const k = i / segs, s = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
    const off = ((s - Math.floor(s)) - 0.5) * 2 * jit;
    ctx.lineTo(x1 + (x2 - x1) * k + off, y1 + (y2 - y1) * k + off * 0.4);
  }
  ctx.lineTo(x2, y2); ctx.stroke();
}
function chispin(ctx,x,y,s,glow,form,t){drawEvolutionActor(ctx,'chispin',x,y+35*s*(ctx._evoK||1),s*(ctx._evoK||1),form,t);}
export function drawEvoCine(ctx, w, h, t, fromForm = 1, toForm = 2) {
  const cx = w / 2, cy = h * 0.55, f = (t * 60) | 0;
  ctx._evoK = h / 300;
  ctx.save();
  ctx.fillStyle = "#0b1030"; ctx.fillRect(0, 0, w, h);
  if (t < 1.5) { // CARGA: chispas convergen
    const k = t / 1.5;
    ctx.strokeStyle = "#ffe866"; ctx.lineWidth = 2;
    const n = 3 + (k * 7 | 0);
    for (let i = 0; i < n; i++) {
      const a = i * 2.4 + t * 1.5, r = 260 * (1 - k) + 50;
      bolt(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, cx, cy, i + (f >> 3), 6, 12);
    }
    chispin(ctx, cx, cy, 1.6 + Math.sin(t * 30) * 0.03 * k, (f >> 2) & 1 && k > 0.6,fromForm,t);
  } else if (t < 2.8) { // TRANSFORMACIÓN: rayo del cielo + flash
    const k = (t - 1.5) / 1.3;
    if (k < 0.12) { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h); }
    ctx.strokeStyle = "#fff6a0"; ctx.lineWidth = 10 * (1 - k) + 3;
    bolt(ctx, cx, 0, cx, cy, f >> 2, 10, 30);
    ctx.lineWidth = 3; ctx.strokeStyle = "#7ee7ff";
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; bolt(ctx, cx, cy, cx + Math.cos(a) * 160 * k, cy + Math.sin(a) * 160 * k, i + (f >> 2), 5, 14); }
    ctx.strokeStyle = "#ffe866"; ctx.lineWidth = 4; ctx.globalAlpha = 1 - k;
    ctx.beginPath(); ctx.arc(cx, cy, 40 + k * 300, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
    chispin(ctx, cx, cy, 1.6 + k * 0.6, true,(k<.5?fromForm:toForm),t);
  } else { // PRESENTACIÓN
    const k = Math.min(1, (t - 2.8) / 0.5);
    ctx.strokeStyle = "#ffe866"; ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) bolt(ctx, cx - 120 + i * 80, cy + 80, cx - 100 + i * 80, cy - 90, i + (f >> 4), 5, 10);
    chispin(ctx, cx, cy, 2.2 + Math.sin(t * 4) * 0.04, false,toForm,t);
    ctx.globalAlpha = k; ctx.fillStyle = "#fff6a0"; ctx.font = "bold 34px sans-serif"; ctx.textAlign = "center";
    ctx.fillText(formName(toForm) + "!", cx, h * 0.18);
    ctx.font = "16px sans-serif"; ctx.fillStyle = "#7ee7ff"; ctx.fillText("Forma " + fromForm + " → " + toForm, cx, h * 0.18 + 28);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

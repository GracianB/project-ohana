// Cinemática de evolución de Pizza: queso fundido, pepperoni y horno/volcán. Sin gradientes ni Math.random.
// fromForm/toForm 1..5, t en segundos.
export const EVO_CINE_DURATION = 4.0;
export const FORM_NAMES = ["Porcioncita", "Pizza", "Pizza Picante", "Pizza Familiar", "Pizza Volcánica"]; // = roster evoNames
const clampF = (f) => Math.max(1, Math.min(5, f | 0 || 1));
const h01 = (i) => { const s = Math.sin(i * 91.7 + 3.1) * 43758.5453; return s - Math.floor(s); };
function slice(ctx, x, y, s, hot) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "#c8782e"; ctx.beginPath(); ctx.moveTo(-34, -26); ctx.quadraticCurveTo(0, -40, 34, -26); ctx.lineTo(0, 40); ctx.closePath(); ctx.fill(); // masa
  ctx.fillStyle = hot ? "#ffe9a0" : "#ffd27a"; ctx.beginPath(); ctx.moveTo(-28, -20); ctx.lineTo(28, -20); ctx.lineTo(0, 32); ctx.closePath(); ctx.fill(); // queso
  ctx.fillStyle = "#d8402e"; for (const [px, py] of [[-12, -10], [12, -8], [0, 10]]) { ctx.beginPath(); ctx.arc(px, py, 5, 0, 7); ctx.fill(); }
  ctx.fillStyle = "#2a1a10"; ctx.beginPath(); ctx.arc(-7, -2, 2.6, 0, 7); ctx.arc(7, -2, 2.6, 0, 7); ctx.fill();
  ctx.restore();
}
export function drawEvoCine(ctx, w, h, t, fromForm = 1, toForm) {
  const from = clampF(fromForm), to = clampF(toForm ?? from + 1);
  const k0 = h / 300, cx = w / 2, cy = h * 0.56, f = (t * 60) | 0;
  ctx.save();
  ctx.fillStyle = to === 5 ? "#2a0c08" : "#3a1e10"; ctx.fillRect(0, 0, w, h);
  if (t < 1.5) { // CARGA: pepperoni orbitando + hilos de queso hacia el centro
    const k = t / 1.5;
    ctx.strokeStyle = "#ffd27a"; ctx.lineWidth = 3 * k0;
    for (let i = 0; i < 8; i++) {
      const a = i * 0.785 + t * 2, r = (220 * (1 - k) + 60) * k0;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      ctx.quadraticCurveTo(cx + Math.cos(a + 0.6) * r * 0.5, cy + Math.sin(a + 0.6) * r * 0.5 + 10 * k0, cx, cy); ctx.stroke();
      ctx.fillStyle = "#d8402e"; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 7 * k0, 0, 7); ctx.fill();
    }
    slice(ctx, cx, cy, 1.5 * k0 * (1 + Math.sin(t * 25) * 0.02 * k), k > 0.6 && ((f >> 2) & 1));
  } else if (t < 2.8) { // TRANSFORMACIÓN: boca de horno y llamarada; volcán en forma 5
    const k = (t - 1.5) / 1.3;
    if (k < 0.1) { ctx.fillStyle = "#fff0c0"; ctx.fillRect(0, 0, w, h); }
    ctx.fillStyle = "#5a2a14"; ctx.beginPath(); ctx.arc(cx, cy + 20 * k0, 130 * k0, Math.PI, 0); ctx.fill(); // horno
    for (let i = 0; i < 12; i++) { // llamas planas
      const x = cx + (i - 5.5) * 20 * k0, hh = (40 + h01(i + (f >> 3)) * 60) * k0 * (0.4 + k);
      ctx.fillStyle = i % 2 ? "#ff8a2a" : "#ffd23a";
      ctx.beginPath(); ctx.moveTo(x - 9 * k0, cy + 30 * k0); ctx.lineTo(x, cy + 30 * k0 - hh); ctx.lineTo(x + 9 * k0, cy + 30 * k0); ctx.fill();
    }
    ctx.strokeStyle = "#ffd27a"; ctx.lineWidth = 4 * k0; ctx.globalAlpha = 1 - k; // anillo de queso
    ctx.beginPath(); ctx.arc(cx, cy, (40 + k * 260) * k0, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
    if (to === 5) { ctx.fillStyle = "#ff5a1a"; for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.35; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * 160 * k * k0, cy + Math.sin(a) * 160 * k * k0, 6 * k0, 0, 7); ctx.fill(); } }
    slice(ctx, cx, cy, (1.5 + k * 0.6) * k0, true);
  } else { // PRESENTACIÓN: lluvia de pepperoni + nombre
    const k = Math.min(1, (t - 2.8) / 0.5);
    for (let i = 0; i < 10; i++) {
      const x = w * h01(i), y = ((t - 2.8) * 140 * k0 + h01(i + 20) * h) % h;
      ctx.fillStyle = "#d8402e"; ctx.beginPath(); ctx.arc(x, y, 6 * k0, 0, 7); ctx.fill();
    }
    slice(ctx, cx, cy, (2.1 + Math.sin(t * 4) * 0.04) * k0, false);
    ctx.globalAlpha = k; ctx.textAlign = "center"; ctx.lineWidth = 4 * k0; ctx.strokeStyle = "#2a0c08";
    ctx.font = `bold ${30 * k0}px sans-serif`; ctx.fillStyle = "#ffd27a";
    const name = "¡" + FORM_NAMES[to - 1] + "!";
    ctx.strokeText(name, cx, h * 0.17); ctx.fillText(name, cx, h * 0.17);
    ctx.font = `${14 * k0}px sans-serif`; ctx.fillStyle = "#fff0c0";
    const sub = "Forma " + from + " → " + to; ctx.strokeText(sub, cx, h * 0.17 + 24 * k0); ctx.fillText(sub, cx, h * 0.17 + 24 * k0);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

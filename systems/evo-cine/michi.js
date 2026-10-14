// Cinemática de evolución de Michi: ovillos, nueve vidas, colas y luna. Sin gradientes, determinista.
// Fases: carga (0-1.6s), transformación (1.6-2.9s), presentación (2.9-4s).
export const EVO_CINE_DURATION = 4.0;
const FORM_NAMES = ["Michi", "Michi Ovillo", "Michi Luna", "Michi Nueve Vidas", "Michi Eclipse"];
const formName = (f) => FORM_NAMES[Math.max(0, Math.min(4, (f | 0) - 1))];
const FUR = ["#ffe3b8", "#ffc4e6", "#ffd0e8", "#c9b4ff", "#ffb3dc"], DARK = ["#e7b56a", "#d978b4", "#e888c0", "#7052bb", "#b8508f"];
const YARN = ["#ff8ad4", "#ffd24a", "#8ad8ff"], TAU = Math.PI * 2;
const ease = (k) => k * k * (3 - 2 * k), cl = (v) => Math.max(0, Math.min(1, v));

function heart(ctx, x, y, s, fill, line) {
  ctx.beginPath(); ctx.moveTo(x, y + s * 0.8);
  ctx.bezierCurveTo(x - s * 1.3, y - s * 0.1, x - s * 0.6, y - s * 1.1, x, y - s * 0.35);
  ctx.bezierCurveTo(x + s * 0.6, y - s * 1.1, x + s * 1.3, y - s * 0.1, x, y + s * 0.8);
  ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = Math.max(1, s * 0.18); ctx.strokeStyle = line; ctx.stroke();
}
function yarn(ctx, x, y, r, col, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = col; ctx.strokeStyle = "#5a2a4a"; ctx.lineWidth = Math.max(1, r * 0.14);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "rgba(90,42,74,.55)"; ctx.lineWidth = Math.max(1, r * 0.1);
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(0, 0, r * 0.85, r * 0.35, i * 1.05, 0, TAU); ctx.stroke(); }
  ctx.restore();
}
// Cola esponjosa simple (círculos solapados) para el abanico.
function tail(ctx, x, y, a, len, w, fur, dark, line, wav) {
  const N = 14; let px = x, py = y;
  const pts = [];
  for (let j = 0; j <= N; j++) { const u = j / N; pts.push([px, py, w * (1 - 0.45 * u) / 2, u]); const ang = a + Math.sin(wav - u * 2) * 0.35 * u; px += Math.cos(ang) * len / N; py += Math.sin(ang) * len / N; }
  for (const [col, add] of [[line, 2], [fur, 0]]) { ctx.fillStyle = col; ctx.beginPath(); for (const [qx, qy, r] of pts) { ctx.moveTo(qx + r + add, qy); ctx.arc(qx, qy, r + add, 0, TAU); } ctx.fill(); }
  ctx.fillStyle = dark; ctx.beginPath(); for (const [qx, qy, r, u] of pts) if (u > 0.74) { ctx.moveTo(qx + r, qy); ctx.arc(qx, qy, r, 0, TAU); } ctx.fill();
}
// Michi chibi con la paleta de characters/art/cat.js (PAL). Se dibuja aquí porque el render real usa gradientes.
const PAL = [
  { fur: "#ffe3b8", dark: "#e7b56a", belly: "#fff8ee", ear: "#ffb7c8", nose: "#ff8aa0", eye: "#3aa0e8", accent: "#7ec8ff" },
  { fur: "#ffc4e6", dark: "#d978b4", belly: "#fff2fa", ear: "#ff8fbf", nose: "#ff5c8a", eye: "#2d6fe0", accent: "#ffd24a" },
  { fur: "#ffd0e8", dark: "#e888c0", belly: "#fff", ear: "#ffb3d9", nose: "#ff5c8a", eye: "#3f8ef0", accent: "#fff4a8" },
  { fur: "#c9b4ff", dark: "#7052bb", belly: "#f4eeff", ear: "#a88cff", nose: "#ff7aa8", eye: "#f0d060", accent: "#ffe27a" },
  { fur: "#ffb3dc", dark: "#b8508f", belly: "#fff0f8", ear: "#ff7ac0", nose: "#ff3f7f", eye: "#7a4ae0", accent: "#4a2f8a" },
];
function michi(ctx, x, y, s, form, t) {
  const f = Math.max(0, Math.min(4, form - 1)), c = PAL[f], L = "#4a2f5a";
  const blink = (t % 2.3) < 0.1;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineWidth = 2; ctx.strokeStyle = L;
  const o = (fn) => { fn(); ctx.fill(); ctx.stroke(); };
  // patas + cuerpo
  ctx.fillStyle = c.fur;
  for (const d of [-1, 1]) o(() => { ctx.beginPath(); ctx.ellipse(d * 8, -3, 6, 4, 0, 0, TAU); });
  o(() => { ctx.beginPath(); ctx.ellipse(0, -15, 14, 13, 0, 0, TAU); });
  ctx.fillStyle = c.belly; ctx.beginPath(); ctx.ellipse(0, -12, 8, 8, 0, 0, TAU); ctx.fill();
  // collar + cascabel
  ctx.fillStyle = f === 4 ? "#7a4ae0" : "#ff5c8a"; ctx.fillRect(-11, -27, 22, 4); ctx.strokeRect(-11, -27, 22, 4);
  ctx.fillStyle = c.accent === "#4a2f8a" ? "#ffd24a" : c.accent; o(() => { ctx.beginPath(); ctx.arc(0, -22, 3.2, 0, TAU); });
  // orejas
  for (const d of [-1, 1]) {
    ctx.fillStyle = c.fur; o(() => { ctx.beginPath(); ctx.moveTo(d * 6, -52); ctx.lineTo(d * 17, -64); ctx.lineTo(d * 18, -44); ctx.closePath(); });
    ctx.fillStyle = c.ear; ctx.beginPath(); ctx.moveTo(d * 9, -51); ctx.lineTo(d * 15.5, -59); ctx.lineTo(d * 15.5, -48); ctx.closePath(); ctx.fill();
  }
  // cabeza
  ctx.fillStyle = c.fur; o(() => { ctx.beginPath(); ctx.ellipse(0, -40, 19, 16, 0, 0, TAU); });
  ctx.fillStyle = c.dark; for (const d of [-1, 0, 1]) { ctx.beginPath(); ctx.ellipse(d * 5, -54 + Math.abs(d), 1.6, 3.2, d * 0.3, 0, TAU); ctx.fill(); }
  // ojos grandes
  for (const d of [-1, 1]) {
    if (blink) { ctx.beginPath(); ctx.moveTo(d * 7 - 4, -40); ctx.quadraticCurveTo(d * 7, -37, d * 7 + 4, -40); ctx.stroke(); continue; }
    ctx.fillStyle = "#fff"; o(() => { ctx.beginPath(); ctx.ellipse(d * 7, -40, 4.6, 5.4, 0, 0, TAU); });
    ctx.fillStyle = c.eye; ctx.beginPath(); ctx.ellipse(d * 7, -39.5, 3.4, 4.4, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = "#1a1030"; ctx.beginPath(); ctx.ellipse(d * 7, -39.5, 1.6, 3, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(d * 7 - 1.4, -41.6, 1.3, 0, TAU); ctx.fill();
  }
  // mofletes, nariz, boca ω, bigotes
  ctx.fillStyle = "rgba(255,110,160,.45)"; for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(d * 13, -34, 3.4, 2, 0, 0, TAU); ctx.fill(); }
  ctx.fillStyle = c.nose; ctx.beginPath(); ctx.moveTo(-2, -35); ctx.lineTo(2, -35); ctx.lineTo(0, -33); ctx.closePath(); ctx.fill();
  ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-3.5, -31.5); ctx.quadraticCurveTo(-1.7, -29.5, 0, -32); ctx.quadraticCurveTo(1.7, -29.5, 3.5, -31.5); ctx.stroke();
  ctx.lineWidth = 1; for (const d of [-1, 1]) for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * 12, -34 + k); ctx.lineTo(d * 22, -35 + k * 3); ctx.stroke(); }
  // rasgos por forma
  if (f >= 2) { ctx.fillStyle = "#fff4a8"; ctx.beginPath(); ctx.arc(0, -50, 3.6, 0.6, TAU - 0.6); ctx.arc(1.6, -50, 2.8, TAU - 0.9, 0.9, true); ctx.fill(); }
  if (f >= 4) { ctx.fillStyle = "#ffd24a"; ctx.strokeStyle = L; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-8, -58); ctx.lineTo(-6, -66); ctx.lineTo(-2, -60); ctx.lineTo(0, -68); ctx.lineTo(2, -60); ctx.lineTo(6, -66); ctx.lineTo(8, -58); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  ctx.restore();
}

export function drawEvoCine(ctx, w, h, t, fromForm = 1, toForm = 2) {
  const K = h / 300, cx = w / 2, cy = h * 0.66, to = Math.max(1, Math.min(5, toForm | 0)), fi = to - 1;
  const moon = to >= 3, eclipse = to >= 5;
  ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.fillStyle = eclipse ? "#140a26" : "#1a1238"; ctx.fillRect(0, 0, w, h);
  // Estrellas fijas (deterministas).
  ctx.fillStyle = "#fff2fb";
  for (let i = 0; i < 24; i++) { const s = Math.sin(i * 91.7) * 43758.5; const r = s - Math.floor(s); ctx.globalAlpha = 0.35 + 0.4 * Math.abs(Math.sin(t * 2 + i)); ctx.beginPath(); ctx.arc((i * 137.5) % w, (r * h * 0.55), 1.3 * K, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#2c2050"; ctx.beginPath(); ctx.ellipse(cx, cy + 4 * K, 90 * K, 14 * K, 0, 0, TAU); ctx.fill();
  const hearts = (lit, y) => { for (let i = 0; i < 9; i++) { const x = cx + (i - 4) * 22 * K, on = i < lit; heart(ctx, x, y, (on ? 7.5 : 6) * K, on ? "#ff5c8a" : "#3a2c5a", on ? "#fff0f6" : "#5a4a7a"); } };
  if (t < 1.6) { // CARGA: ovillos orbitan y enrollan hilo; 9 vidas se encienden una a una
    const k = t / 1.6;
    hearts(Math.min(9, Math.floor(k * 10)), h * 0.16);
    for (let i = 0; i < 3; i++) {
      const a = t * 3.2 + i * TAU / 3, r = (110 - 50 * k) * K, x = cx + Math.cos(a) * r, y = cy - 36 * K + Math.sin(a) * r * 0.45;
      ctx.strokeStyle = YARN[i]; ctx.lineWidth = 2 * K; ctx.globalAlpha = 0.8;
      ctx.beginPath(); for (let j = 0; j <= 16; j++) { const aa = a - j * 0.18 * (0.4 + k); const rr = r * (1 - j * 0.015); const px = cx + Math.cos(aa) * rr, py = cy - 36 * K + Math.sin(aa) * rr * 0.45; j ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); ctx.globalAlpha = 1;
      if (Math.sin(a) < 0) yarn(ctx, x, y, 10 * K, YARN[i], a * 2);
    }
    michi(ctx, cx, cy, 1.9 * K * (1 + Math.sin(t * 28) * 0.012 * k), fromForm, t);
    for (let i = 0; i < 3; i++) { const a = t * 3.2 + i * TAU / 3; if (Math.sin(a) >= 0) yarn(ctx, cx + Math.cos(a) * (110 - 50 * k) * K, cy - 36 * K + Math.sin(a) * (110 - 50 * k) * K * 0.45, 10 * K, YARN[i], a * 2); }
  } else if (t < 2.9) { // TRANSFORMACIÓN: el hilo se desenrolla en espiral, flash, abanico de nueve colas, luna
    const k = (t - 1.6) / 1.3, e = ease(cl(k / 0.7));
    if (moon) { // luna detrás
      const R = 70 * K * ease(cl(k * 1.5)); ctx.fillStyle = "#fff4c8"; ctx.beginPath(); ctx.arc(cx, cy - 70 * K, R, 0, TAU); ctx.fill();
      if (eclipse) { ctx.fillStyle = "#140a26"; ctx.beginPath(); ctx.arc(cx + R * 0.35 * cl(k * 2), cy - 74 * K, R * 0.92, 0, TAU); ctx.fill(); }
    }
    ctx.lineWidth = 3 * K;
    for (let i = 0; i < 3; i++) { ctx.strokeStyle = YARN[i]; ctx.globalAlpha = 1 - k * 0.7; ctx.beginPath(); for (let j = 0; j <= 40; j++) { const u = j / 40, a = u * 9 + i * 2.1 + t * 2, r = (12 + u * 170 * (0.3 + k)) * K; const px = cx + Math.cos(a) * r, py = cy - 40 * K + Math.sin(a) * r * 0.6; j ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 - 0.55 + (i - 4) / 4 * 1.0; tail(ctx, cx - 18 * K, cy - 26 * K, a, 95 * K * e, 22 * K, FUR[fi], DARK[fi], "#4a2f5a", t * 5 + i); }
    michi(ctx, cx, cy, (1.9 + 0.5 * e) * K, k < 0.5 ? fromForm : to, t);
    if (k < 0.16) { ctx.globalAlpha = 1 - k / 0.16; ctx.fillStyle = "#fff6fb"; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1; }
    hearts(9, h * 0.16);
  } else { // PRESENTACIÓN
    const k = cl((t - 2.9) / 0.5), bob = Math.sin(t * 4) * 3 * K;
    if (moon) { ctx.fillStyle = "#fff4c8"; ctx.beginPath(); ctx.arc(cx, cy - 70 * K, 70 * K, 0, TAU); ctx.fill(); if (eclipse) { ctx.fillStyle = "#140a26"; ctx.beginPath(); ctx.arc(cx + 24 * K, cy - 74 * K, 64 * K, 0, TAU); ctx.fill(); ctx.strokeStyle = "#b78bff"; ctx.lineWidth = 3 * K; ctx.beginPath(); ctx.arc(cx, cy - 70 * K, 74 * K, 0, TAU); ctx.stroke(); } }
    for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 - 0.55 + (i - 4) / 4 * 1.0; tail(ctx, cx - 18 * K, cy - 26 * K + bob, a, 95 * K, 22 * K, FUR[fi], DARK[fi], "#4a2f5a", t * 3 + i); }
    michi(ctx, cx, cy + bob, 2.4 * K, to, t);
    for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + t; heart(ctx, cx + Math.cos(a) * 120 * K, cy - 60 * K + Math.sin(a) * 50 * K, 5 * K, "#ff8ad4", "#fff0f6"); }
    ctx.globalAlpha = k; ctx.textAlign = "center"; ctx.lineWidth = 6 * K; ctx.strokeStyle = "#3a1a4a";
    ctx.font = `900 ${Math.round(30 * K)}px sans-serif`; ctx.strokeText("¡" + formName(to) + "!", cx, h * 0.14); ctx.fillStyle = "#ffe6f5"; ctx.fillText("¡" + formName(to) + "!", cx, h * 0.14);
    ctx.font = `700 ${Math.round(14 * K)}px sans-serif`; ctx.lineWidth = 4 * K; ctx.strokeText("Forma " + fromForm + " → " + to, cx, h * 0.14 + 22 * K); ctx.fillStyle = "#c9b4ff"; ctx.fillText("Forma " + fromForm + " → " + to, cx, h * 0.14 + 22 * K);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

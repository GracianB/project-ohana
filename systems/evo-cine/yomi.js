// Cinemática de evolución de Yomi: tinta y sombras, mariposas lunares y abanico. Sin gradientes, determinista.
// Fases: carga (0-1.6s), transformación (1.6-2.9s), presentación (2.9-4s).
export const EVO_CINE_DURATION = 4.0;
const FORM_NAMES = ["Yomi", "Yomi Manga", "Yomi Grieta", "Yomi Devoralunas", "Yomi Umbral"];
const formName = (f) => FORM_NAMES[Math.max(0, Math.min(4, (f | 0) - 1))];
// Paleta de characters/art/yomi.js: [piel, túnica, farol, sombra].
const PAL = [["#f8e5b9", "#d78b69", "#f8b567", "#52364b"], ["#f1d5a5", "#c67d69", "#ffb35c", "#604066"], ["#f3cba5", "#ad6481", "#ed9f6b", "#6f467d"], ["#edd0bf", "#a74668", "#ff7580", "#7d3b71"], ["#fff0d4", "#8d3d67", "#ffd279", "#b9588f"]];
const TAU = Math.PI * 2, INK = "#1a0f1e", L = "#2a1424";
const ease = (k) => k * k * (3 - 2 * k), cl = (v) => Math.max(0, Math.min(1, v));
const hash = (i) => { const s = Math.sin(i * 127.1) * 43758.5453; return s - Math.floor(s); };

function butterfly(ctx, x, y, s, flap, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const o = 0.35 + Math.abs(Math.sin(flap)) * 0.65;
  ctx.fillStyle = col; ctx.strokeStyle = L; ctx.lineWidth = 0.8;
  for (const d of [-1, 1]) { ctx.save(); ctx.scale(d * o, 1);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(4, -8, 11, -6, 8, 1); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 1); ctx.bezierCurveTo(6, 3, 6, 8, 2, 7); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
  ctx.fillStyle = L; ctx.fillRect(-0.6, -3, 1.2, 9);
  ctx.restore();
}
function fan(ctx, x, y, R, open, col, line) {
  // Abanico plegable: 9 varillas, papel con franjas y una luna.
  const span = 0.25 + open * 2.3, a0 = -Math.PI / 2 - span / 2;
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = col; ctx.strokeStyle = line; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, R, a0, a0 + span); ctx.arc(0, 0, R * 0.35, a0 + span, a0, true); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.lineWidth = 1.2;
  for (let i = 0; i <= 8; i++) { const a = a0 + span * i / 8; ctx.beginPath(); ctx.moveTo(Math.cos(a) * R * 0.1, Math.sin(a) * R * 0.1); ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R); ctx.stroke(); }
  if (open > 0.5) { ctx.fillStyle = "#fff4c8"; ctx.globalAlpha = (open - 0.5) * 2; ctx.beginPath(); ctx.arc(0, -R * 0.68, R * 0.16, 0, TAU); ctx.fill(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(R * 0.06, -R * 0.7, R * 0.14, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
  ctx.restore();
}
function yomi(ctx, x, y, s, form, t) {
  const f = Math.max(0, Math.min(4, form - 1)), [skin, robe, lantern, shade] = PAL[f];
  const blink = (t % 2.7) < 0.1;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineWidth = 2; ctx.strokeStyle = L; ctx.lineJoin = "round";
  const o = (fn, c) => { ctx.fillStyle = c; ctx.beginPath(); fn(); ctx.fill(); ctx.stroke(); };
  // túnica acampanada + mangas
  o(() => { ctx.moveTo(-10, -30); ctx.quadraticCurveTo(-20, -8, -18, 0); ctx.lineTo(18, 0); ctx.quadraticCurveTo(20, -8, 10, -30); ctx.closePath(); }, robe);
  ctx.fillStyle = shade; ctx.fillRect(-18, -4, 36, 4);
  for (const d of [-1, 1]) o(() => { ctx.ellipse(d * 14, -18, 6, 9, d * 0.4, 0, TAU); }, robe);
  // obi + ofuda colgando
  o(() => { ctx.rect(-11, -20, 22, 5); }, shade);
  o(() => { ctx.rect(4, -16, 5, 9); }, "#fff5d8");
  // farolillo en la mano
  ctx.strokeStyle = L; ctx.beginPath(); ctx.moveTo(-17, -12); ctx.lineTo(-17, -6); ctx.stroke();
  o(() => { ctx.ellipse(-17, -1, 5, 6, 0, 0, TAU); }, lantern);
  ctx.fillStyle = "#fff4c8"; ctx.beginPath(); ctx.ellipse(-17, -1, 2, 3.5, 0, 0, TAU); ctx.fill();
  // cabeza: pelo oscuro con flequillo recto
  o(() => { ctx.ellipse(0, -44, 18, 17, 0, 0, TAU); }, shade);
  o(() => { ctx.ellipse(0, -41, 14, 13, 0, 0, TAU); }, skin);
  ctx.fillStyle = shade; ctx.beginPath(); ctx.moveTo(-15, -46); ctx.quadraticCurveTo(0, -64, 15, -46); ctx.lineTo(15, -44); for (let i = 4; i >= -4; i--) ctx.lineTo(i * 3.4, -46 + (i % 2 ? 3 : 0)); ctx.closePath(); ctx.fill();
  for (const d of [-1, 1]) o(() => { ctx.ellipse(d * 17, -36, 4, 12, d * 0.15, 0, TAU); }, shade);
  // ojos
  for (const d of [-1, 1]) {
    if (blink) { ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(d * 5.5 - 3, -39); ctx.quadraticCurveTo(d * 5.5, -37, d * 5.5 + 3, -39); ctx.stroke(); ctx.lineWidth = 2; continue; }
    ctx.fillStyle = L; ctx.beginPath(); ctx.ellipse(d * 5.5, -39, 2.8, 3.8, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = f >= 3 ? "#ff4466" : "#c9a0ff"; ctx.beginPath(); ctx.ellipse(d * 5.5, -38.2, 1.8, 2, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(d * 5.5 - 1, -40.2, 1, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = "rgba(255,120,150,.45)"; for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(d * 9.5, -34.5, 2.6, 1.5, 0, 0, TAU); ctx.fill(); }
  ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(0, -34, 1.8, 0.2, Math.PI - 0.2); ctx.stroke();
  // luna creciente en el pelo (forma 2+) y cuernitos de sombra (4+)
  if (f >= 1) { ctx.fillStyle = "#fff4c8"; ctx.beginPath(); ctx.arc(9, -56, 4, 0, TAU); ctx.fill(); ctx.fillStyle = shade; ctx.beginPath(); ctx.arc(10.8, -57, 3.4, 0, TAU); ctx.fill(); }
  if (f >= 3) for (const d of [-1, 1]) o(() => { ctx.moveTo(d * 8, -58); ctx.quadraticCurveTo(d * 12, -68, d * 15, -66); ctx.quadraticCurveTo(d * 12, -61, d * 12, -56); ctx.closePath(); }, shade);
  ctx.restore();
}

export function drawEvoCine(ctx, w, h, t, fromForm = 1, toForm = 2) {
  const K = h / 300, cx = w / 2, cy = h * 0.68, to = Math.max(1, Math.min(5, toForm | 0)), fi = to - 1;
  const [, robe, lantern, shade] = PAL[fi], BF = ["#fff4c8", "#c9a0ff", "#ffd279"];
  ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.fillStyle = "#120a1c"; ctx.fillRect(0, 0, w, h);
  // Luna fija al fondo + estrellas deterministas.
  ctx.fillStyle = "#fff2d0"; for (let i = 0; i < 20; i++) { ctx.globalAlpha = 0.3 + 0.35 * Math.abs(Math.sin(t * 1.7 + i)); ctx.beginPath(); ctx.arc(hash(i) * w, hash(i + 50) * h * 0.5, 1.2 * K, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 1;
  const moonR = 46 * K * (t < 1.6 ? 0.7 : 1);
  ctx.fillStyle = "#fff0c8"; ctx.beginPath(); ctx.arc(cx + 120 * K, h * 0.28, moonR, 0, TAU); ctx.fill();
  ctx.fillStyle = "#120a1c"; ctx.beginPath(); ctx.arc(cx + 120 * K + moonR * (t < 2.9 ? 0.5 : 0.25), h * 0.28 - 4 * K, moonR * 0.9, 0, TAU); ctx.fill();
  // Charco de sombra/tinta bajo Yomi.
  const pool = t < 1.6 ? 50 + 50 * (t / 1.6) : 100;
  ctx.fillStyle = INK; ctx.strokeStyle = "#5a3478"; ctx.lineWidth = 2 * K; ctx.beginPath(); ctx.ellipse(cx, cy + 3 * K, pool * K, 13 * K, 0, 0, TAU); ctx.fill(); ctx.stroke();
  if (t < 1.6) { // CARGA: gotas de tinta caen al charco, la sombra sube como llamas, abanico cerrado
    const k = t / 1.6;
    for (let i = 0; i < 10; i++) { const ph = ((t * 1.3 + hash(i)) % 1), x = cx + (hash(i + 9) - 0.5) * 260 * K * (1 - k * 0.5), y = h * 0.1 + ph * (cy - h * 0.1);
      ctx.fillStyle = shade; ctx.strokeStyle = "#c9a0ff"; ctx.lineWidth = 1.2 * K; ctx.beginPath(); ctx.moveTo(x, y - 9 * K); ctx.quadraticCurveTo(x + 5 * K, y, x, y + 4 * K); ctx.quadraticCurveTo(x - 5 * K, y, x, y - 9 * K); ctx.fill(); ctx.stroke(); }
    for (let i = 0; i < 7; i++) { const hh = (20 + 40 * k) * K * (0.6 + 0.4 * Math.abs(Math.sin(t * 5 + i * 1.3))); const x = cx + (i - 3) * 16 * K;
      ctx.fillStyle = i % 2 ? shade : "#3a2048"; ctx.strokeStyle = "#8a5ab0"; ctx.lineWidth = 1.4 * K; ctx.beginPath(); ctx.moveTo(x - 8 * K, cy); ctx.quadraticCurveTo(x, cy - hh * 1.2, x + 2 * K, cy - hh); ctx.quadraticCurveTo(x + 4 * K, cy - hh * 0.5, x + 8 * K, cy); ctx.fill(); ctx.stroke(); }
    yomi(ctx, cx, cy, 1.9 * K * (1 + Math.sin(t * 26) * 0.01 * k), fromForm, t);
    fan(ctx, cx + 32 * K, cy - 30 * K, 34 * K, 0.08, lantern, L);
    ctx.fillStyle = "#c9a0ff"; ctx.globalAlpha = k; ctx.textAlign = "center"; ctx.font = `700 ${Math.round(13 * K)}px sans-serif`; ctx.fillText("…la sombra despierta…", cx, h * 0.12); ctx.globalAlpha = 1;
  } else if (t < 2.9) { // TRANSFORMACIÓN: pincelada de tinta en espiral, flash, abanico se abre, mariposas lunares
    const k = (t - 1.6) / 1.3, e = ease(cl(k / 0.6));
    fan(ctx, cx, cy - 46 * K, 120 * K * e, e, robe, L);
    ctx.strokeStyle = "#6a3a88"; ctx.lineWidth = 9 * K * (1 - k * 0.6);
    ctx.beginPath(); for (let j = 0; j <= 50; j++) { const u = j / 50, a = u * 10 + t * 3, r = (10 + u * 150 * (0.4 + k)) * K; const px = cx + Math.cos(a) * r, py = cy - 46 * K + Math.sin(a) * r * 0.55; j ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke();
    yomi(ctx, cx, cy, (1.9 + 0.5 * e) * K, k < 0.5 ? fromForm : to, t);
    for (let i = 0; i < 9; i++) { const a = i * TAU / 9 + k * 2, r = (30 + k * 170) * K; butterfly(ctx, cx + Math.cos(a) * r, cy - 50 * K + Math.sin(a) * r * 0.55 - k * 30 * K, 1.6 * K, t * 14 + i, BF[i % 3]); }
    if (k < 0.15) { ctx.globalAlpha = 1 - k / 0.15; ctx.fillStyle = "#fff4e6"; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1; }
  } else { // PRESENTACIÓN
    const k = cl((t - 2.9) / 0.5), bob = Math.sin(t * 4) * 3 * K;
    fan(ctx, cx, cy - 46 * K + bob, 120 * K, 1, robe, L);
    yomi(ctx, cx, cy + bob, 2.4 * K, to, t);
    for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + t * 0.8; butterfly(ctx, cx + Math.cos(a) * 150 * K, cy - 70 * K + Math.sin(a) * 55 * K, 1.5 * K, t * 12 + i, BF[i % 3]); }
    ctx.globalAlpha = k; ctx.textAlign = "center"; ctx.lineWidth = 6 * K; ctx.strokeStyle = INK;
    ctx.font = `900 ${Math.round(30 * K)}px sans-serif`; ctx.strokeText("¡" + formName(to) + "!", cx, h * 0.14); ctx.fillStyle = lantern; ctx.fillText("¡" + formName(to) + "!", cx, h * 0.14);
    ctx.font = `700 ${Math.round(14 * K)}px sans-serif`; ctx.lineWidth = 4 * K; ctx.strokeText("Forma " + fromForm + " → " + to, cx, h * 0.14 + 22 * K); ctx.fillStyle = "#c9a0ff"; ctx.fillText("Forma " + fromForm + " → " + to, cx, h * 0.14 + 22 * K);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

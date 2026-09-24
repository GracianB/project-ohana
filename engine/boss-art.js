// ============================================================================
// REINA DEL NIDO · arte vectorial animado del jefe final (diseño original)
// ----------------------------------------------------------------------------
// Una reina-búho carmesí de plumas espinosas, corona de espinas con gema,
// ojos enormes y pico dorado.
//   Fase 1: posada en su nido de zarzas (se arrastra con él).
//   Fase 2: rompe el nido, despliega alas gigantes y vuela.
//   Fase 3: arde. Grietas incandescentes, ojos al blanco, esquirlas orbitando.
// Origen (0,0) = centro de la hitbox (110×130); los pies en y = +65.
// También dibuja la entrada cinematográfica (franjas + título) si e.introT > 0.
// ============================================================================

const TAU = Math.PI * 2;
const INK = "#1c0610";

function pal(phase) {
  if (phase >= 3) return { body: "#ff2a3c", dark: "#6a0616", light: "#ff8a7a", belly: "#ffd2a0", wing: "#b8102a", eye: "#fffbe8", pupil: "#ff3010", crown: "#ffd84a", glow: "#ffb030" };
  if (phase === 2) return { body: "#d81e3c", dark: "#5a0a1c", light: "#ff6f7a", belly: "#f7c3a8", wing: "#9a0f2a", eye: "#ffe25a", pupil: "#2a0406", crown: "#ffcf4a", glow: "#ff5a3a" };
  return { body: "#b8183a", dark: "#4a0818", light: "#ff5a70", belly: "#eab49c", wing: "#8a0c26", eye: "#ffcf3a", pupil: "#1c0406", crown: "#e8b83a", glow: "#ff3a3a" };
}

function line(ctx, w = 3.5, c = INK) { ctx.lineWidth = w; ctx.strokeStyle = c; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.stroke(); }
function grad(ctx, x, y, r, c, light, dark) {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.45, r * 0.1, x, y, r * 1.1);
  g.addColorStop(0, light); g.addColorStop(0.55, c); g.addColorStop(1, dark);
  return g;
}

/** Pluma alargada (para alas, cola y copete). */
function feather(ctx, x, y, len, w, ang, fill, tip) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(ang);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(w, len * 0.45, 0, len);
  ctx.quadraticCurveTo(-w, len * 0.45, 0, 0);
  ctx.fillStyle = fill; ctx.fill(); line(ctx, 2.4);
  if (tip) {
    ctx.beginPath(); ctx.ellipse(0, len * 0.86, w * 0.35, len * 0.14, 0, 0, TAU);
    ctx.fillStyle = tip; ctx.fill();
  }
  ctx.beginPath(); ctx.moveTo(0, len * 0.1); ctx.lineTo(0, len * 0.8); line(ctx, 1.2, "rgba(0,0,0,.35)");
  ctx.restore();
}

/** Ala completa: abanico de plumas desde el hombro. open 0..1, flap -1..1. */
function wing(ctx, side, open, flap, c, t, burning) {
  ctx.save();
  ctx.scale(side, 1);
  ctx.translate(34, -30);
  ctx.rotate(-0.25 - flap * 0.45 * open);
  const n = 7;
  for (let i = n - 1; i >= 0; i--) {
    const k = i / (n - 1);
    const ang = -Math.PI * 0.62 + k * (0.55 + open * 1.25);
    const len = 70 + open * (60 - Math.abs(k - 0.4) * 50) + (burning ? Math.sin(t * 0.3 + i) * 4 : 0);
    feather(ctx, 0, 0, len, 13 + open * 5, ang, i % 2 ? c.wing : c.body, burning ? c.glow : c.dark);
  }
  // hueso/arco del ala
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(24 + open * 20, -20 - open * 30, 40 + open * 60, -6 - open * 50);
  line(ctx, 7, c.dark); line(ctx, 3, c.body);
  ctx.restore();
}

/** Nido de zarzas (fase 1). */
function nest(ctx, t, moving, c) {
  ctx.save();
  ctx.translate(0, 52);
  const wob = moving ? Math.sin(t * 0.5) * 2 : 0;
  // cuenco
  ctx.beginPath();
  ctx.ellipse(0, 4 + wob * 0.3, 78, 22, 0, 0, TAU);
  ctx.fillStyle = "#3a1a10"; ctx.fill(); line(ctx, 3.5);
  // ramas entrelazadas
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * TAU;
    const x1 = Math.cos(a) * 76, y1 = Math.sin(a) * 16 + 4;
    const x2 = Math.cos(a + 0.9) * 70, y2 = Math.sin(a + 0.9) * 20 - 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo((x1 + x2) / 2, (y1 + y2) / 2 - 10, x2, y2);
    line(ctx, 4.5, i % 3 ? "#5a2c16" : "#2a1008");
  }
  // espinas
  ctx.fillStyle = "#1a0806";
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU + 0.2;
    const x = Math.cos(a) * 80, y = Math.sin(a) * 18 + 6;
    const d = Math.sign(x) || 1;
    ctx.beginPath(); ctx.moveTo(x, y - 3); ctx.lineTo(x + d * 10, y - 8); ctx.lineTo(x, y + 3); ctx.fill();
  }
  // huevos rojos brillantes asomando
  for (const [ex, ey] of [[-44, -4], [46, -2]]) {
    ctx.beginPath(); ctx.ellipse(ex, ey, 9, 11, 0, 0, TAU);
    ctx.fillStyle = grad(ctx, ex, ey, 11, "#ff4a5a", "#ffc0b0", "#8a0a1a"); ctx.fill(); line(ctx, 2.5);
    ctx.fillStyle = `rgba(255,220,120,${0.35 + Math.sin(t * 0.1 + ex) * 0.25})`;
    ctx.beginPath(); ctx.arc(ex - 2, ey - 3, 3, 0, TAU); ctx.fill();
  }
  if (moving) { // chispas al arrastrar
    ctx.fillStyle = "#ffcf6a";
    for (let i = 0; i < 5; i++) { const x = -70 + ((t * 7 + i * 31) % 140); ctx.fillRect(x, 20 + (i % 2) * 3, 3, 2); }
  }
  ctx.restore();
}

function eye(ctx, x, y, r, c, st) {
  // disco facial alrededor
  ctx.beginPath(); ctx.ellipse(x, y, r * 1.45, r * 1.4, 0, 0, TAU);
  ctx.fillStyle = c.belly; ctx.fill(); line(ctx, 2.6);
  const narrow = st.narrow || 0;
  ctx.save();
  ctx.beginPath(); ctx.ellipse(x, y, r, r * (1 - narrow * 0.55), 0, 0, TAU);
  ctx.fillStyle = c.eye; ctx.fill();
  ctx.shadowColor = c.eye; ctx.shadowBlur = st.phase >= 3 ? 18 : 8;
  line(ctx, 3);
  ctx.shadowBlur = 0;
  ctx.clip();
  const px = x + (st.lookX || 0) * r * 0.25, py = y + (st.lookY || 0) * r * 0.2;
  ctx.fillStyle = c.pupil;
  ctx.beginPath(); ctx.ellipse(px, py, r * (st.phase >= 3 ? 0.22 : 0.45), r * 0.8, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.4, r * 0.2, 0, TAU); ctx.fill();
  ctx.restore();
}

/** Cabeza: disco facial, ojos, pico, penachos y corona. */
function head(ctx, c, t, st) {
  const { phase } = st;
  ctx.save();
  ctx.translate(0, -58 + st.headY);
  ctx.rotate(st.headRot);
  // penachos (orejas de búho)
  for (const s of [-1, 1]) {
    const sway = Math.sin(t * 0.08 + s) * 0.08 + st.ruffle * 0.3 * s;
    feather(ctx, s * 26, -22, 38, 9, Math.PI + s * (0.55 + sway), c.body, c.dark);
    feather(ctx, s * 18, -26, 30, 7, Math.PI + s * (0.3 + sway), c.wing, null);
  }
  // cráneo
  ctx.beginPath();
  ctx.ellipse(0, 0, 44, 38, 0, 0, TAU);
  ctx.fillStyle = grad(ctx, 0, 0, 44, c.body, c.light, c.dark); ctx.fill(); line(ctx, 4);
  // plumas de la frente en V
  ctx.beginPath();
  ctx.moveTo(-34, -14); ctx.quadraticCurveTo(0, 8, 34, -14);
  line(ctx, 3, c.dark);
  // ojos
  eye(ctx, -17, -2, 12, c, st);
  eye(ctx, 17, -2, 12, c, st);
  // cejas furiosas
  ctx.beginPath();
  ctx.moveTo(-34, -22 + st.brow); ctx.lineTo(-6, -12);
  ctx.moveTo(34, -22 + st.brow); ctx.lineTo(6, -12);
  line(ctx, 6, INK);
  // pico (se abre)
  const open = st.beak;
  ctx.fillStyle = "#f0b830";
  ctx.beginPath();
  ctx.moveTo(-9, 10); ctx.quadraticCurveTo(0, 6, 9, 10);
  ctx.quadraticCurveTo(4, 22, 0, 26 - open * 4);
  ctx.quadraticCurveTo(-4, 22, -9, 10);
  ctx.fill(); line(ctx, 2.8);
  if (open > 0.05) {
    ctx.beginPath();
    ctx.moveTo(-8, 16 + open * 6); ctx.quadraticCurveTo(0, 14 + open * 18, 8, 16 + open * 6);
    ctx.quadraticCurveTo(0, 20 + open * 22, -8, 16 + open * 6);
    ctx.fillStyle = "#d89a20"; ctx.fill(); line(ctx, 2.4);
    // garganta encendida
    ctx.fillStyle = `rgba(255,${phase >= 3 ? 230 : 140},60,${0.5 + open * 0.5})`;
    ctx.beginPath(); ctx.ellipse(0, 17 + open * 8, 5 * open + 1, 4 * open + 1, 0, 0, TAU); ctx.fill();
  }
  // corona de espinas con gema
  ctx.save();
  ctx.translate(0, -36);
  ctx.fillStyle = c.crown;
  for (let i = -3; i <= 3; i++) {
    const h = 14 + (3 - Math.abs(i)) * 5 + (phase >= 3 ? Math.sin(t * 0.3 + i) * 2 : 0);
    ctx.beginPath(); ctx.moveTo(i * 8 - 5, 2); ctx.lineTo(i * 8, -h); ctx.lineTo(i * 8 + 5, 2); ctx.closePath();
    ctx.fill(); line(ctx, 2);
  }
  ctx.beginPath(); ctx.ellipse(0, 0, 32, 6, 0, 0, TAU); ctx.fill(); line(ctx, 2.2);
  ctx.beginPath(); ctx.ellipse(0, -2, 6, 7, 0, 0, TAU);
  ctx.fillStyle = phase >= 3 ? "#ffffff" : "#ff2a4a";
  ctx.shadowColor = "#ff4a6a"; ctx.shadowBlur = 12; ctx.fill(); ctx.shadowBlur = 0; line(ctx, 2);
  if (phase >= 3) { // corona en llamas
    for (let i = -2; i <= 2; i++) {
      const fh = 14 + Math.sin(t * 0.5 + i * 2) * 6;
      ctx.beginPath(); ctx.moveTo(i * 10 - 5, -10); ctx.quadraticCurveTo(i * 10, -10 - fh * 1.4, i * 10 + 5, -10);
      ctx.fillStyle = i % 2 ? "rgba(255,200,60,.85)" : "rgba(255,110,40,.85)"; ctx.fill();
    }
  }
  ctx.restore();
  ctx.restore();
}

/** Cuerpo: plumaje en escamas, pechera clara, grietas (fase 3). */
function body(ctx, c, t, st) {
  ctx.save();
  ctx.translate(0, st.bodyY);
  ctx.beginPath();
  ctx.ellipse(0, 0, 54, 50, 0, 0, TAU);
  ctx.fillStyle = grad(ctx, 0, 0, 54, c.body, c.light, c.dark); ctx.fill(); line(ctx, 4);
  // pechera
  ctx.save();
  ctx.beginPath(); ctx.ellipse(0, 10, 34, 36, 0, 0, TAU); ctx.clip();
  ctx.fillStyle = c.belly; ctx.fillRect(-40, -30, 80, 80);
  // escamas de pluma
  ctx.strokeStyle = "rgba(90,20,20,.45)"; ctx.lineWidth = 2;
  for (let r = 0; r < 5; r++) for (let i = -3; i <= 3; i++) {
    const x = i * 12 + (r % 2) * 6, y = -18 + r * 12;
    ctx.beginPath(); ctx.arc(x, y, 6, 0.15, Math.PI - 0.15); ctx.stroke();
  }
  ctx.restore();
  ctx.beginPath(); ctx.ellipse(0, 10, 34, 36, 0, 0, TAU); line(ctx, 2.6);
  if (st.phase >= 3) { // grietas de lava
    ctx.save();
    ctx.shadowColor = c.glow; ctx.shadowBlur = 10;
    const pulse = 0.6 + Math.sin(t * 0.25) * 0.4;
    ctx.strokeStyle = `rgba(255,${180 + pulse * 60},80,${0.7 + pulse * 0.3})`;
    ctx.lineWidth = 3;
    for (const pts of [[[-40, -20], [-28, -6], [-34, 10], [-22, 26]], [[36, -24], [26, -8], [34, 8], [24, 20]], [[-6, -40], [2, -30], [-4, -20]]]) {
      ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
}

function talons(ctx, c, t, st) {
  for (const s of [-1, 1]) {
    const x = s * 22, y = st.bodyY + 44;
    const reach = st.talonReach;
    ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x + s * 2, y + 10 + reach);
    line(ctx, 11, INK); line(ctx, 7, "#e0a830");
    for (let k = -1; k <= 1; k++) {
      ctx.beginPath();
      ctx.moveTo(x + s * 2, y + 10 + reach);
      ctx.quadraticCurveTo(x + s * 2 + k * 10, y + 16 + reach, x + s * 2 + k * 12, y + 22 + reach - Math.abs(k) * 3);
      line(ctx, 4.5, INK); line(ctx, 2.2, "#f4e6c8");
    }
  }
}

// ---------------------------------------------------------------------------
// Entrada cinematográfica (coordenadas de pantalla)
// ---------------------------------------------------------------------------
function introOverlay(ctx, e) {
  const total = e.introMax || 170;
  const k = 1 - e.introT / total;           // 0 → 1
  const bars = Math.min(1, Math.min(k * 5, (1 - k) * 6));
  const W = ctx.canvas.width, H = ctx.canvas.height;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.filter = "none";
  ctx.globalAlpha = 1;
  const bh = H * 0.11 * bars;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, bh); ctx.fillRect(0, H - bh, W, bh);
  // título tras el aterrizaje
  const tk = Math.max(0, Math.min(1, (k - 0.45) * 4)) * Math.min(1, (1 - k) * 6);
  if (tk > 0) {
    ctx.globalAlpha = tk;
    ctx.textAlign = "center";
    ctx.font = `900 ${Math.round(Math.min(64, W * 0.07))}px Fredoka, 'Baloo 2', system-ui, sans-serif`;
    ctx.lineWidth = 8; ctx.strokeStyle = "#2a0010";
    const y = H * 0.36;
    ctx.strokeText("REINA DEL NIDO", W / 2, y);
    const g = ctx.createLinearGradient(0, y - 50, 0, y);
    g.addColorStop(0, "#ffe27a"); g.addColorStop(1, "#ff3a4a");
    ctx.fillStyle = g; ctx.fillText("REINA DEL NIDO", W / 2, y);
    ctx.font = `700 ${Math.round(Math.min(20, W * 0.024))}px Outfit, system-ui, sans-serif`;
    ctx.fillStyle = "#ffd8c0";
    ctx.fillText("GUARDIANA DE LA CALDERA", W / 2, y + 26);
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Dibujo principal
// ---------------------------------------------------------------------------
export function drawBossQueen(ctx, e, t) {
  const phase = e.phase || 1;
  const c = pal(phase);
  const mode = e.mode || "idle";
  const tele = e.telegraph ? e.teleKind : "";
  const prog = e.windMax ? 1 - e.wind / e.windMax : 0;
  const intro = e.introT > 0;
  const roaring = intro && e.introT < 80 && e.introT > 20;

  // estado de pose
  const st = {
    phase, headY: Math.sin(t * 0.06) * 2, headRot: Math.sin(t * 0.03) * 0.05, beak: 0, brow: 0, narrow: 0,
    ruffle: 0, bodyY: -6 + Math.sin(t * 0.06) * 1.5, talonReach: 0, lookX: 0.3, lookY: 0.2,
  };
  let lean = 0, wingOpen = phase >= 2 ? 1 : 0.05, flapSpeed = phase >= 3 ? 0.5 : 0.28, flapAmp = phase >= 2 ? 1 : 0;
  if (tele === "charge" || mode === "charge") { lean = mode === "charge" ? 0.28 : 0.15 * prog; st.headY = 8; st.narrow = 0.6; st.brow = 4; st.ruffle = 1; wingOpen = Math.min(wingOpen, 0.3); }
  if (tele === "slam") { st.bodyY -= 10 * prog; wingOpen = 1; flapAmp = 0.2; st.beak = 0.3; }
  if (mode === "slam") { st.talonReach = 10; wingOpen = 0.6; st.narrow = 0.4; }
  if (tele === "swoop") { wingOpen = 1; flapAmp = 0.1; lean = -0.15 * prog; st.narrow = 0.5; }
  if (mode === "swoop") { lean = 0.5; wingOpen = 0.7; flapAmp = 0.2; st.talonReach = 8; }
  if (tele === "spit" || mode === "spit") { st.beak = mode === "spit" ? 0.8 + Math.sin(t * 0.8) * 0.2 : prog; st.headY = 4; lean = 0.08; }
  if (roaring) { st.beak = 1; st.brow = 5; st.ruffle = 1 + Math.sin(t * 0.8); wingOpen = Math.max(wingOpen, 0.5); flapAmp = 1; st.headRot = Math.sin(t * 0.9) * 0.06; }
  if (e.dying) { st.beak = 0.6; st.narrow = 0; st.lookY = -0.6; }

  const dyingMax = e.dyingMax || 120;
  ctx.save();
  if (intro && e.introDrop > 0) ctx.translate(0, -e.introDrop); // descenso
  if (e.dying) {
    const k = Math.max(0.12, e.dying / dyingMax);
    ctx.globalAlpha *= 0.3 + k * 0.7;
    ctx.scale(0.55 + k * 0.55, 0.55 + k * 0.55);
    ctx.rotate((dyingMax - e.dying) * 0.035);
  }
  if ((e.facing || 1) < 0) ctx.scale(-1, 1);
  ctx.rotate(lean);

  // aura de fase
  if (phase >= 2 && !e.dying) {
    const r = 110 + Math.sin(t * 0.1) * 8;
    const g = ctx.createRadialGradient(0, -20, 10, 0, -20, r);
    g.addColorStop(0, phase >= 3 ? "rgba(255,150,60,.35)" : "rgba(255,60,80,.22)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -20, r, 0, TAU); ctx.fill();
  }

  // cola de plumas
  for (let i = -2; i <= 2; i++) feather(ctx, i * 8, st.bodyY + 30, 44 + (2 - Math.abs(i)) * 8, 11, i * 0.22 + Math.sin(t * 0.1 + i) * 0.05, i % 2 ? c.wing : c.body, phase >= 3 ? c.glow : c.dark);

  // alas
  const flap = Math.sin(t * flapSpeed) * flapAmp;
  wing(ctx, -1, wingOpen, flap, c, t, phase >= 3);
  wing(ctx, 1, wingOpen, flap, c, t, phase >= 3);

  if (phase === 1 && !e.dying) nest(ctx, t, mode === "charge", c);
  else talons(ctx, c, t, st);

  body(ctx, c, t, st);
  head(ctx, c, t, st);

  // esquirlas de espina orbitando (fase 3)
  if (phase >= 3 && !e.dying) {
    for (let i = 0; i < 8; i++) {
      const a = t * 0.05 + (i / 8) * TAU;
      const x = Math.cos(a) * 100, y = -20 + Math.sin(a) * 44;
      ctx.save(); ctx.translate(x, y); ctx.rotate(a * 2);
      ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(4, 0); ctx.lineTo(0, 9); ctx.lineTo(-4, 0); ctx.closePath();
      ctx.fillStyle = i % 2 ? "#ffd84a" : "#2a0610"; ctx.fill(); line(ctx, 1.5, "#ff6a3a");
      ctx.restore();
    }
  }
  // plumas que caen al volar
  if (phase >= 2 && !e.dying) {
    for (let i = 0; i < 3; i++) {
      const k = ((t * 0.01 + i / 3) % 1);
      ctx.globalAlpha *= 1 - k * 0.8;
      feather(ctx, -60 + i * 50 + Math.sin(t * 0.05 + i) * 20, 20 + k * 80, 14, 4, Math.sin(t * 0.1 + i), c.wing, null);
      ctx.globalAlpha /= 1 - k * 0.8;
    }
  }
  // onda del rugido
  if (roaring) {
    const k = ((80 - e.introT) % 20) / 20;
    ctx.strokeStyle = `rgba(255,220,160,${1 - k})`;
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(0, -40, 40 + k * 140, 0, TAU); ctx.stroke();
  }
  ctx.restore();

  if (intro) introOverlay(ctx, e);
}

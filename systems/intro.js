// ============================================================================
// PROJECT OHANA · Intros (systems/intro.js)
// ----------------------------------------------------------------------------
// playTitleIntro(): intro cinematográfica de portada en #ohana-intro (~3.3 s).
// playIntro(kind, name, done, id): cinemática corta al pulsar Empezar /
//   Continuar (~1.8 s, saltable). API compatible con title.js.
// Ambas en canvas, con el mismo kit visual que la cinemática de evolución.
// ============================================================================
import {
  Particles, fullCanvas, loadFonts, reducedMotion, seg, clamp, lerp, easeOut, easeBack, easeInOut,
  drawRays, drawBackdrop, drawRing, drawTitle, rgba, tint, makeDummy, drawDummy, baseHeight,
  FONT_BODY, FONT_DISPLAY,
} from "./evo-cinema.js";
import { ROSTER } from "../characters/roster.js";
import { canonId } from "./save.js";
import { sfx } from "../engine/audio.js";

const CYAN = "#7ee7ff", GOLD = "#ffe66a", PINK = "#ff6aa8";

/** Iris: recorta un círculo creciente para descubrir lo que hay debajo. */
function iris(ctx, W, H, cx, cy, k) {
  if (k <= 0) return;
  const r = Math.hypot(W, H) * 0.62 * easeInOut(k);
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  const g = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, Math.max(1, r));
  g.addColorStop(0, "rgba(0,0,0,1)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Intro de portada
// ---------------------------------------------------------------------------
export function playTitleIntro() {
  const el = document.getElementById("ohana-intro");
  const finishClasses = () => {
    document.body.classList.remove("intro-playing");
    document.body.classList.add("intro-complete");
    el?.classList.remove("show");
    el?.setAttribute("aria-hidden", "true");
  };
  if (!el) return;
  if (el._played) return;
  el._played = true;
  el.innerHTML = '<canvas aria-hidden="true"></canvas><button class="oi-skip" type="button" aria-label="Saltar introducción">Saltar intro · Esc</button>';
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-label", "Introducción cinematográfica de Project Ohana");
  el.setAttribute("aria-hidden", "false");
  el.classList.add("show");
  document.body.classList.add("intro-playing");
  const fc = fullCanvas(el.querySelector("canvas"));
  const ctx = fc.ctx;
  const reduce = reducedMotion();
  const parts = new Particles();
  const pal = [CYAN, GOLD, PINK, "#ffffff"];
  const T = reduce
    ? { core: 0, ring: 0, word: 0, flash: 0.1, tag: 0.1, out: 0.7, end: 1.1 }
    : { core: 0.05, ring: 0.45, word: 0.6, flash: 1.25, tag: 1.3, out: 2.75, end: 3.35 }; // +1 s de final visible
  const letters = ["O", "H", "A", "N", "A"];
  const word = document.createElement("canvas");
  const wctx = word.getContext("2d");

  let t0 = 0, last = 0, raf = 0, skip = false, burst = false, revealed = false, done = false;

  function onResize() { fc.resize(); }
  addEventListener("resize", onResize);

  function layout() {
    const W = fc.W, H = fc.H;
    const size = Math.min(W * 0.17, H * 0.2, 170);
    return { W, H, cx: W / 2, cy: H * 0.46, size };
  }

  function drawIslandScene(t, L) {
    const { W, H, cx, cy } = L;
    const horizon = H * 0.74;
    const sunK = easeOut(seg(t, 0.15, 1.15));
    const seaK = seg(t, 0.1, 1.0);
    if (seaK <= 0) return;

    ctx.save();
    ctx.globalAlpha = 0.86 * seaK;

    const sea = ctx.createLinearGradient(0, horizon, 0, H);
    sea.addColorStop(0, "rgba(7,42,62,0.12)");
    sea.addColorStop(0.55, "rgba(5,28,46,0.62)");
    sea.addColorStop(1, "rgba(2,8,18,0.98)");
    ctx.fillStyle = sea;
    ctx.fillRect(0, horizon, W, H - horizon);

    if (sunK > 0) {
      const sr = Math.min(W, H) * (0.045 + sunK * 0.055);
      const sg = ctx.createRadialGradient(cx, horizon - sr * 0.35, 0, cx, horizon - sr * 0.35, sr * 2.8);
      sg.addColorStop(0, rgba(GOLD, 0.42 * sunK));
      sg.addColorStop(0.55, rgba(GOLD, 0.08 * sunK));
      sg.addColorStop(1, rgba(GOLD, 0));
      ctx.fillStyle = sg;
      ctx.fillRect(cx - sr * 3, horizon - sr * 3, sr * 6, sr * 6);

      ctx.fillStyle = GOLD;
      ctx.globalAlpha = 0.35 * sunK;
      ctx.beginPath();
      ctx.arc(cx, horizon - sr * 0.35, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 0.9 * seaK;
    ctx.fillStyle = "rgba(1,6,12,0.94)";
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, horizon + 40);
    ctx.quadraticCurveTo(W * 0.12, horizon - 24, W * 0.24, horizon + 10);
    ctx.quadraticCurveTo(W * 0.34, horizon + 34, W * 0.46, horizon - 6);
    ctx.quadraticCurveTo(W * 0.58, horizon - 34, W * 0.68, horizon + 6);
    ctx.quadraticCurveTo(W * 0.84, horizon + 30, W, horizon - 2);
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 0.18 * seaK;
    ctx.strokeStyle = CYAN;
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const yy = horizon + 20 + i * 20;
      const off = ((t * (16 + i * 5)) % (W + 220)) - 110;
      ctx.beginPath();
      ctx.moveTo(off, yy);
      ctx.lineTo(off + 120, yy);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawWord(L, t) {
    const { cx, cy, size } = L;
    ctx.save();
    ctx.font = "700 " + size + "px " + FONT_DISPLAY;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    const widths = letters.map((ch) => ctx.measureText(ch).width);
    const total = widths.reduce((a, b) => a + b, 0) + size * 0.04 * (letters.length - 1);
    // lienzo auxiliar para el brillo que barre las letras
    const pad = size * 0.4;
    const ww = Math.ceil((total + pad * 2) * fc.dpr), wh = Math.ceil(size * 1.6 * fc.dpr);
    if (word.width !== ww || word.height !== wh) { word.width = ww; word.height = wh; }
    wctx.setTransform(1, 0, 0, 1, 0, 0);
    wctx.clearRect(0, 0, ww, wh);
    wctx.setTransform(fc.dpr, 0, 0, fc.dpr, 0, 0);
    wctx.font = ctx.font;
    wctx.textBaseline = "middle";
    wctx.textAlign = "center";
    const grad = wctx.createLinearGradient(pad, 0, pad + total, 0);
    grad.addColorStop(0, CYAN); grad.addColorStop(0.55, GOLD); grad.addColorStop(1, PINK);
    let x = pad;
    const midY = size * 0.8;
    letters.forEach((ch, i) => {
      const k = reduce ? 1 : seg(t, T.word + i * 0.085, T.word + i * 0.085 + 0.42);
      const w = widths[i];
      if (k > 0) {
        const s = lerp(2.1, 1, easeBack(k));
        wctx.save();
        wctx.globalAlpha = clamp(k * 2.2, 0, 1);
        wctx.translate(x + w / 2, midY - (1 - easeOut(k)) * size * 0.25);
        wctx.scale(s, s);
        wctx.lineJoin = "round";
        wctx.lineWidth = size * 0.1;
        wctx.strokeStyle = "rgba(3,8,20,0.85)";
        wctx.strokeText(ch, 0, 0);
        wctx.fillStyle = grad;
        wctx.fillText(ch, 0, 0);
        wctx.restore();
      }
      x += w + size * 0.04;
    });
    // barrido de luz
    if (!reduce) {
      const sw = seg(t, T.word + 0.55, T.word + 1.15);
      if (sw > 0 && sw < 1) {
        const bx = lerp(-size, total + pad * 2 + size, easeInOut(sw));
        wctx.save();
        wctx.globalCompositeOperation = "source-atop";
        const lg = wctx.createLinearGradient(bx - size * 0.5, 0, bx + size * 0.5, size * 0.3);
        lg.addColorStop(0, "rgba(255,255,255,0)");
        lg.addColorStop(0.5, "rgba(255,255,255,0.85)");
        lg.addColorStop(1, "rgba(255,255,255,0)");
        wctx.fillStyle = lg;
        wctx.fillRect(0, 0, total + pad * 2, size * 1.6);
        wctx.restore();
      }
    }
    const dw = ww / fc.dpr, dh = wh / fc.dpr;
    ctx.shadowColor = "rgba(126,231,255,0.55)";
    ctx.shadowBlur = size * 0.35;
    ctx.drawImage(word, cx - dw / 2, cy - midY, dw, dh);
    ctx.restore();
  }

  function frame(now) {
    try {
    if (!t0) { t0 = now; last = now; }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    let t = (now - t0) / 1000;
    if (skip && t < T.out) { t0 -= (T.out - t) * 1000; t = T.out; }
    const L = layout();
    const { W, H, cx, cy, size } = L;
    ctx.save();
    ctx.clearRect(0, 0, W, H);

    // fondo
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#040a18"); bg.addColorStop(0.55, "#071427"); bg.addColorStop(1, "#040912");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    drawIslandScene(t, L);
    const flashK = reduce ? 0 : seg(t, T.flash, T.flash + 0.6);
    drawBackdrop(ctx, W, H, cx, cy, CYAN, 0, 0.6 + (1 - flashK) * (t > T.flash ? 0.5 : 0));
    drawRays(ctx, cx, cy, Math.hypot(W, H) * 0.7, CYAN, 0.28 * seg(t, T.ring, T.ring + 0.6), reduce ? 0 : t * 0.22, 16);
    if (!reduce) drawRays(ctx, cx, cy, Math.hypot(W, H) * 0.55, PINK, 0.22 * seg(t, T.ring + 0.2, T.ring + 0.8), -t * 0.16, 10);

    // partículas que convergen en el núcleo
    if (!reduce && t < T.flash - 0.1) {
      const n = Math.round(dt * 160);
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.max(W, H) * (0.5 + Math.random() * 0.2);
        parts.add({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, to: { x: cx, y: cy }, swirl: 700, max: 3,
          size: 1.4 + Math.random() * 2, kind: Math.random() < 0.6 ? "streak" : "dot", color: pal[(Math.random() * 4) | 0] });
      }
    }
    if (t >= T.flash && !burst) {
      burst = true;
      const n = reduce ? 0 : 70;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, sp = 300 + Math.random() * 700;
        const kind = i % 3 ? (i % 3 === 1 ? "streak" : "spark") : "star";
        parts.add({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 0.94, max: 0.8 + Math.random(),
          size: kind === "star" ? 4 + Math.random() * 6 : kind === "spark" ? 4 + Math.random() * 5 : 2, kind, rot: Math.random() * 6, vr: 4, color: pal[i % 4] });
      }
    }

    // núcleo y anillo-emblema
    const core = easeOut(seg(t, T.core, T.ring + 0.2));
    const ringK = easeBack(seg(t, T.ring, T.ring + 0.5));
    const R = size * 1.9 * ringK;
    if (core > 0) {
      const cr = size * (0.25 + 0.6 * core) * (1 - flashK * 0.3);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr * 2.2);
      g.addColorStop(0, "rgba(255,248,220," + 0.95 * (1 - seg(t, T.word, T.flash)) + ")");
      g.addColorStop(0.3, rgba(CYAN, 0.35));
      g.addColorStop(1, rgba(CYAN, 0));
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, cr * 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    if (R > 2) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.translate(cx, cy);
      ctx.rotate(reduce ? 0 : t * 0.9);
      const cols = [CYAN, GOLD, PINK];
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = cols[i];
        ctx.lineWidth = Math.max(2, size * 0.035);
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(0, 0, R, (i / 3) * Math.PI * 2 + 0.12, ((i + 1) / 3) * Math.PI * 2 - 0.12);
        ctx.stroke();
      }
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#ffffff";
      ctx.setLineDash([2, 10]);
      ctx.beginPath(); ctx.arc(0, 0, R * 1.12, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    parts.update(dt);
    parts.draw(ctx);

    // rótulos narrativos
    const islandK = reduce ? 0 : seg(t, 0.15, 0.85);
    if (islandK > 0) {
      ctx.save();
      ctx.globalAlpha = islandK * (1 - seg(t, 0.85, 1.15));
      drawTitle(ctx, "ISLA HOKU", cx, H * 0.16, Math.max(12, size * 0.16), "#d8ebff", {
        font: FONT_BODY, weight: 800, spacing: "0.42em", stroke: false, glow: "rgba(126,231,255,0.7)"
      });
      ctx.restore();
    }

    const omen = reduce ? 0 : seg(t, 1.55, 2.15);
    if (omen > 0) {
      ctx.save();
      ctx.globalAlpha = omen * (1 - seg(t, 2.15, 2.45));
      drawTitle(ctx, "DIEZ HÉROES · CINCO FORMAS", cx, H * 0.81, Math.max(13, size * 0.16), "#e7f4ff", {
        font: FONT_BODY, weight: 700, stroke: false, maxWidth: W * 0.88
      });
      ctx.restore();
    }

    const threat = reduce ? 0 : seg(t, 2.05, 2.7);
    if (threat > 0) {
      ctx.save();
      ctx.globalAlpha = threat;
      drawTitle(ctx, "EL NIDO HA DESPERTADO", cx, H * 0.88, Math.max(13, size * 0.15), PINK, {
        font: FONT_BODY, weight: 800, spacing: "0.16em", stroke: false, glow: "rgba(255,106,168,0.72)"
      });
      ctx.restore();
    }

    // rótulos
    const kick = reduce ? 1 : seg(t, T.word - 0.1, T.word + 0.3);
    if (kick > 0) {
      ctx.save();
      ctx.globalAlpha = kick;
      drawTitle(ctx, "PROJECT", cx, cy - size * 0.78, Math.max(13, size * 0.17), "#bfe0ff",
        { font: FONT_BODY, weight: 600, spacing: "0.6em", stroke: false, glow: "rgba(126,231,255,0.6)" });
      ctx.restore();
    }
    drawWord(L, t);
    if (!reduce) {
      drawRing(ctx, cx, cy, Math.hypot(W, H) * 0.6, seg(t, T.flash, T.flash + 0.9), "#ffffff", size * 0.06);
      drawRing(ctx, cx, cy, Math.hypot(W, H) * 0.45, seg(t, T.flash + 0.08, T.flash + 1), GOLD, size * 0.04);
    }
    const tag = reduce ? 1 : seg(t, T.tag, T.tag + 0.4);
    if (tag > 0) {
      ctx.save();
      ctx.globalAlpha = tag;
      drawTitle(ctx, "Cinco héroes. Un nido. Nadie se queda atrás.", cx, cy + size * 0.85 + (1 - easeOut(tag)) * 8,
        Math.max(13, size * 0.15), "#d6e6f6", { font: FONT_BODY, weight: 400, stroke: false, maxWidth: W * 0.9 });
      ctx.restore();
    }
    // destello
    const fa = reduce ? 0 : (t < T.flash ? Math.pow(seg(t, T.flash - 0.1, T.flash), 2) * 0.6 : 0.6 * Math.pow(1 - seg(t, T.flash, T.flash + 0.35), 2));
    if (fa > 0.001) {
      const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.hypot(W, H) * 0.7);
      fg.addColorStop(0, "rgba(255,255,255," + fa + ")");
      fg.addColorStop(1, "rgba(126,231,255," + fa * 0.25 + ")");
      ctx.fillStyle = fg;
      ctx.fillRect(0, 0, W, H);
    }

    // salida: iris que descubre la portada
    const outK = seg(t, T.out, T.end);
    if (outK > 0 && !revealed) { revealed = true; finishClasses(); }
    iris(ctx, W, H, cx, cy, outK);
    ctx.restore();
    if (t >= T.end) { end(); return; }
    raf = requestAnimationFrame(frame);
    } catch (err) { end(); }
  }

  function onSkip(e) {
    if (e.type === "keydown" && !["Enter", " ", "Escape"].includes(e.key)) return;
    if (e.type === "keydown") e.preventDefault();
    skip = true;
  }
  function end() {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    finishClasses();
    removeEventListener("resize", onResize);
    removeEventListener("keydown", onSkip);
    el.remove();
  }
  el.addEventListener("pointerdown", onSkip, { passive: true });
  addEventListener("keydown", onSkip);

  const go = () => {
    const wait = new Promise((r) => setTimeout(r, 120));
    Promise.race([loadFonts(), wait]).then(() => { raf = requestAnimationFrame(frame); });
  };
  go();
  // Red de seguridad
  setTimeout(() => { if (!done) end(); }, 7000);
}

// ---------------------------------------------------------------------------
// Cinemática corta al empezar (Empezar / Continuar)
// ---------------------------------------------------------------------------
export function playIntro(kind, name, done, id) {
  let el = document.getElementById("start-intro");
  if (!el) {
    el = document.createElement("div");
    el.id = "start-intro";
    el.innerHTML = '<canvas aria-hidden="true"></canvas><p class="intro-sr"></p>';
    document.body.appendChild(el);
  }
  const fc = el._fc || (el._fc = fullCanvas(el.querySelector("canvas")));
  fc.resize();
  const ctx = fc.ctx;
  const reduce = reducedMotion();
  const def = ROSTER.find((r) => r.id === id) || ROSTER.find((r) => r.forms && r.forms[0] && r.forms[0].name === name) || ROSTER[0];
  sfx("start");
  let evo = 0;
  if (kind === "resume") {
    try {
      const sv = JSON.parse(localStorage.getItem("ohana") || "null");
      if (sv && canonId(sv.id) === def.id) evo = clamp(Number(sv.evo) || 0, 0, 4);
    } catch (_) {}
  }
  const form = (def.forms && def.forms[evo]) || def;
  const color = form.color || def.color || CYAN;
  const light = tint(color, 0.55);
  const p = makeDummy(def.id, evo, color);
  p._poseOverride = "victory";
  const parts = new Particles();
  const title = String(form.name || name || "Ohana");
  const kicker = kind === "resume" ? "CONTINUAR" : "NUEVA PARTIDA";
  const sub = kind === "resume" ? "Se recupera tu forma y tu sala" : "Empiezas como bebé · Rumbo al Claro";
  el.querySelector(".intro-sr").textContent = kicker + ": " + title + ". " + sub;
  const T = reduce ? { in: 0.12, out: 0.35, end: 0.5 } : { in: 0.28, out: 0.7, end: 0.95 };

  let t0 = 0, last = 0, raf = 0, skip = false, finished = false, burst = false, started = false;
  function startGame() {
    if (started) return;
    started = true;
    try { if (done) done(); } catch (err) {}
  }

  function frame(now) {
    try {
    if (!t0) { t0 = now; last = now; }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    let t = (now - t0) / 1000;
    if (skip && t < T.out) { t0 -= (T.out - t) * 1000; t = T.out; }
    const W = fc.W, H = fc.H, cx = W / 2;
    const portrait = H > W * 1.1;
    const target = Math.min(H * (portrait ? 0.3 : 0.36), W * 0.5);
    const cy = H * 0.4;
    const footY = cy + target * 0.5;
    const outK = seg(t, T.out, T.end);
    const fade = 1 - easeInOut(outK);
    if (outK > 0) startGame();
    ctx.save();
    ctx.clearRect(0, 0, W, H);
    const inK = easeOut(seg(t, 0, 0.3));
    drawBackdrop(ctx, W, H, cx, cy, color, inK * fade, 0.7 * inK * fade);
    // cortinillas diagonales
    if (!reduce) {
      const wk = easeInOut(seg(t, 0, 0.45));
      ctx.save();
      ctx.globalAlpha = 0.18 * (1 - seg(t, 0.4, 0.9));
      ctx.fillStyle = light;
      ctx.translate(lerp(-W, W * 1.2, wk), 0);
      ctx.transform(1, 0, -0.35, 1, 0, 0);
      ctx.fillRect(0, 0, W * 0.18, H);
      ctx.restore();
    }
    drawRays(ctx, cx, cy, Math.hypot(W, H) * 0.7, color, 0.5 * inK * fade, reduce ? 0 : t * 0.35, 14);
    // personaje: cae y aterriza con onda
    const drop = reduce ? 1 : easeBack(seg(t, 0.12, T.in));
    const land = seg(t, T.in - 0.05, T.in + 0.5);
    if (!burst && t >= T.in - 0.05) {
      burst = true;
      if (!reduce) {
        for (let i = 0; i < 36; i++) {
          const a = -Math.PI * (0.05 + Math.random() * 0.9), sp = 200 + Math.random() * 500;
          parts.add({ x: cx, y: footY, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 600, drag: 0.97, max: 0.7 + Math.random() * 0.6,
            size: i % 2 ? 3 + Math.random() * 5 : 2, kind: i % 2 ? "star" : "dot", rot: Math.random() * 6, vr: 5,
            color: [color, light, "#ffffff"][i % 3] });
        }
      }
    }
    if (!reduce) drawRing(ctx, cx, footY, target * 1.3, land, light, target * 0.04, 0.22);
    const scale = target / baseHeight(def.id, evo);
    const yOff = (1 - drop) * -H * 0.5;
    const hg = ctx.createRadialGradient(cx, footY, 0, cx, footY, target * 0.6);
    hg.addColorStop(0, rgba(color, 0.45 * inK * fade)); hg.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = hg;
    ctx.beginPath(); ctx.ellipse(cx, footY, target * 0.6, target * 0.14, 0, 0, Math.PI * 2); ctx.fill();
    p._evoT = seg(t, T.in, T.out);
    ctx.save();
    ctx.globalAlpha = seg(t, 0.1, 0.25) * fade;
    drawDummy(ctx, p, cx, footY + yOff, scale * (1 + 0.1 * outK), t * 60);
    ctx.restore();
    parts.update(dt);
    ctx.save(); ctx.globalAlpha = fade; parts.draw(ctx); ctx.restore();
    // textos
    const tk = reduce ? 1 : seg(t, T.in - 0.1, T.in + 0.3);
    if (tk > 0) {
      const size = clamp(Math.min(W * (portrait ? 0.1 : 0.065), H * 0.085), 28, 88);
      const ty = footY + target * 0.1 + size * 1.05;
      ctx.save();
      ctx.globalAlpha = clamp(tk * 1.5, 0, 1) * fade;
      drawTitle(ctx, kicker, cx, ty - size * 0.8, Math.max(12, size * 0.26), tint(color, 0.6),
        { font: FONT_BODY, weight: 800, spacing: "0.34em", stroke: false, glow: color });
      ctx.save();
      ctx.translate(cx, ty);
      const s = lerp(1.35, 1, easeBack(tk));
      ctx.scale(s, s);
      drawTitle(ctx, title, 0, 0, size, ["#ffffff", light, color], { glow: rgba(color, 0.9), maxWidth: W * 0.9 / s });
      ctx.restore();
      ctx.globalAlpha = seg(t, T.in + 0.15, T.in + 0.5) * fade + (reduce ? fade : 0);
      drawTitle(ctx, sub, cx, ty + size * 0.8, Math.max(13, size * 0.24), GOLD, { font: FONT_BODY, weight: 700, stroke: false, maxWidth: W * 0.9 });
      ctx.restore();
    }
    ctx.restore();
    if (t >= T.end) { finish(); return; }
    raf = requestAnimationFrame(frame);
    } catch (err) { startGame(); finish(); }
  }

  function onSkip(e) {
    if (e.type === "keydown") {
      if (!["Enter", " ", "Escape"].includes(e.key)) return;
      e.preventDefault();
    }
    skip = true;
  }
  function finish() {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(raf);
    el.removeEventListener("pointerdown", onSkip);
    removeEventListener("keydown", onSkip);
    ctx.setTransform(fc.dpr, 0, 0, fc.dpr, 0, 0);
    ctx.clearRect(0, 0, fc.W, fc.H);
    el.classList.remove("show");
    startGame();
  }

  el.classList.add("show");
  startGame();
  el.addEventListener("pointerdown", onSkip, { passive: true });
  addEventListener("keydown", onSkip);
  raf = requestAnimationFrame(frame);
}

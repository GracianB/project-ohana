// ============================================================================
// PROJECT OHANA · Intros (systems/intro.js)
// ----------------------------------------------------------------------------
// playTitleIntro(): V43 OHANA MAGIC — familia, humor, amenaza y título (~6 s).
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
    document.body.classList.remove("intro-playing", "intro-pending");
    document.body.classList.add("intro-complete");
    el?.classList.remove("show");
    el?.setAttribute("aria-hidden", "true");
  };
  if (!el) {
    document.body.classList.remove("intro-pending");
    document.body.classList.add("intro-complete");
    return;
  }
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
    ? { family: 0, threat: 0.08, core: 0.12, ring: 0.14, word: 0.16, flash: 0.24, tag: 0.26, out: 0.72, end: 1.08 }
    : { family: 0.28, threat: 2.92, core: 3.78, ring: 3.92, word: 4.08, flash: 4.72, tag: 4.88, out: 5.52, end: 6.18 };
  const letters = ["O", "H", "A", "N", "A"];
  const word = document.createElement("canvas");
  const wctx = word.getContext("2d");

  const V43_INTRO_CAST = ["kilo","stitcho","chispin","cat","dragon","dino","frita","pizza","yomi","cuerno"];
  const introActors = Object.fromEntries(V43_INTRO_CAST.map((id) => {
    const def = ROSTER.find((r) => r.id === id) || ROSTER[0];
    const p = makeDummy(id, 0, def.color);
    p._poseOverride = "idle";
    return [id, p];
  }));
  el.dataset.v43Cast = String(V43_INTRO_CAST.length);
  let t0 = 0, last = 0, raf = 0, skip = false, burst = false, revealed = false, done = false;

  function onResize() { fc.resize(); }
  addEventListener("resize", onResize);

  function layout() {
    const W = fc.W, H = fc.H;
    const size = Math.min(W * 0.17, H * 0.2, 170);
    return { W, H, cx: W / 2, cy: H * 0.42, size };
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

    ctx.globalAlpha = 0.9 * seaK;
    ctx.fillStyle = "#071018";
    ctx.beginPath();
    ctx.moveTo(W * 0.16, horizon + 8);
    ctx.lineTo(W * 0.2, horizon - 90);
    ctx.quadraticCurveTo(W * 0.28, horizon - 40, W * 0.18, horizon + 8);
    ctx.moveTo(W * 0.82, horizon + 10);
    ctx.lineTo(W * 0.78, horizon - 110);
    ctx.quadraticCurveTo(W * 0.9, horizon - 50, W * 0.84, horizon + 10);
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


  function drawIntroActor(id, x, footY, targetH, tf, opts = {}) {
    const p = introActors[id];
    if (!p) return;
    const scale = targetH / Math.max(1, baseHeight(id, 0));
    p.facing = opts.facing || 1;
    p.grounded = opts.grounded !== false;
    p.vx = Number(opts.vx || 0);
    p.vy = Number(opts.vy || 0);
    p.melee = Number(opts.melee || 0);
    p._poseOverride = opts.pose || "";
    ctx.save();
    ctx.translate(x, footY);
    if (opts.alpha !== undefined) ctx.globalAlpha *= clamp(opts.alpha, 0, 1);
    if (opts.rotate) ctx.rotate(opts.rotate);
    drawDummy(ctx, p, 0, 0, scale, tf);
    ctx.restore();
  }

  function drawTinyBolt(x1, y1, x2, y2, k) {
    if (k <= 0) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = "rgba(255,232,86," + (0.30 + k * 0.70) + ")";
    ctx.lineWidth = 2.4;
    ctx.shadowColor = "#ffe85a";
    ctx.shadowBlur = 16;
    ctx.beginPath();
    for (let i = 0; i <= 7; i++) {
      const u = i / 7;
      const x = lerp(x1, x2, u);
      const y = lerp(y1, y2, u) + (i > 0 && i < 7 ? Math.sin(i * 9.7) * 6 * k : 0);
      if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawTinyRainbow(x, y, radius, k) {
    if (k <= 0) return;
    const cols = ["#ff7aa8","#ffd36a","#7ee7ff","#b78bff"];
    ctx.save();
    ctx.globalAlpha = 0.72 * k;
    ctx.lineCap = "round";
    cols.forEach((col, i) => {
      ctx.strokeStyle = col;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, radius + i * 5, Math.PI * 1.08, Math.PI * 1.92);
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawFamilyScene(t, L) {
    if (reduce || t < T.family || t >= T.core + 0.05) return;
    const { W, H } = L;
    const floor = H * 0.79;
    const tf = t * 60;
    const enter = easeOut(seg(t, T.family, T.family + 0.45));
    const threatIn = seg(t, T.threat, T.threat + 0.55);
    const familyAlpha = enter * (1 - threatIn);
    const heroH = clamp(Math.min(W, H) * 0.105, 58, 92);

    ctx.save();
    ctx.globalAlpha = familyAlpha;

    // Kilo keeps a pollen light afloat while the others do their own thing.
    const pollen = seg(t, 0.55, 1.10) * (1 - seg(t, 1.55, 1.80));
    drawIntroActor("kilo", W * 0.34, floor, heroH * 1.04, tf, { facing: 1, pose: pollen > .12 ? "victory" : "idle" });
    if (pollen > 0) {
      const px = W * 0.405, py = floor - heroH * 0.86 - Math.sin(t * 8) * 8;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = "#ffe66a";
      ctx.shadowColor = "#ffe66a";
      ctx.shadowBlur = 24;
      ctx.beginPath(); ctx.arc(px, py, 5 + pollen * 2, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // Chispín accidentally zaps Stitcho.
    const zap = Math.sin(clamp(seg(t, 0.92, 1.36), 0, 1) * Math.PI);
    drawIntroActor("stitcho", W * 0.51, floor + 2, heroH, tf, { facing: -1, pose: zap > .08 ? "attack" : "idle", melee: zap > .08 ? 10 : 0, rotate: -zap * .08 });
    drawIntroActor("chispin", W * 0.61, floor + 1, heroH * .93, tf, { facing: -1, pose: zap > .08 ? "victory" : "idle" });
    drawTinyBolt(W * .59, floor - heroH * .52, W * .525, floor - heroH * .50, zap);

    // Michi judges the entire situation from the foreground.
    const catLook = seg(t, 1.08, 1.72);
    drawIntroActor("cat", W * 0.72, floor + 3, heroH * .82, tf, { facing: catLook > .45 ? -1 : 1, pose: "idle" });

    // Frita chases a potato, Pizza bounces after it.
    const chase = seg(t, 1.38, 2.52);
    if (chase > 0 && chase < 1) {
      const px = lerp(W * 0.14, W * 0.82, easeInOut(chase));
      const py = floor - 12 - Math.abs(Math.sin(chase * Math.PI * 5)) * 18;
      ctx.fillStyle = "#e9bd55";
      ctx.strokeStyle = "#704b21";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(px, py, 10, 7, chase * 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      drawIntroActor("frita", px - 50, floor + 3, heroH * .82, tf, { facing: 1, vx: 6, pose: "run" });
      drawIntroActor("pizza", px - 105, floor - Math.abs(Math.sin(chase * Math.PI * 4)) * 18, heroH * .86, tf, { facing: 1, grounded: false, vy: -2, pose: "jump" });
    }

    // Dragón tries to look impressive. The tiny sneeze is... less impressive.
    const sneeze = Math.sin(clamp(seg(t, 1.72, 2.05), 0, 1) * Math.PI);
    drawIntroActor("dragon", W * .17, floor + 1, heroH * .98, tf, { facing: 1, pose: sneeze > .05 ? "attack" : "idle", melee: sneeze > .05 ? 8 : 0 });
    if (sneeze > 0) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = "rgba(255,126,58," + sneeze + ")";
      ctx.shadowColor = "#ff7e3a"; ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(W*.205, floor-heroH*.48);
      ctx.quadraticCurveTo(W*.225, floor-heroH*.70, W*.242, floor-heroH*.48);
      ctx.quadraticCurveTo(W*.225, floor-heroH*.38, W*.205, floor-heroH*.48);
      ctx.fill();
      ctx.restore();
    }

    // Yomi appears from a shadow that should not physically fit them.
    const yomiK = easeOut(seg(t, 1.92, 2.38));
    if (yomiK > 0) {
      ctx.save();
      ctx.globalAlpha *= .60 * yomiK;
      ctx.fillStyle = "#03040a";
      ctx.beginPath(); ctx.ellipse(W*.83, floor+6, 34*yomiK, 9, 0, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      drawIntroActor("yomi", W*.83, floor, heroH * .95, tf, { facing: -1, pose: "idle", alpha: yomiK });
    }

    // Cuerno manages a tiny rainbow. Dino arrives one beat too heavily.
    const rainbow = easeOut(seg(t, 2.02, 2.55)) * (1 - threatIn);
    drawIntroActor("cuerno", W*.90, floor+1, heroH*.78, tf, { facing: -1, pose: rainbow > .2 ? "victory" : "idle" });
    drawTinyRainbow(W*.887, floor-heroH*.74, 22, rainbow);

    const dinoK = easeOut(seg(t, 2.12, 2.68));
    drawIntroActor("dino", W*.075, floor+2, heroH*1.02, tf, { facing: 1, pose: dinoK > .68 ? "victory" : "idle", alpha: dinoK });
    if (dinoK > .72 && threatIn < .12) {
      const q = seg(dinoK, .72, 1);
      ctx.save();
      ctx.globalAlpha = .26 * q;
      ctx.strokeStyle = "#b8d57b";
      ctx.lineWidth = 2;
      for (let i=0;i<3;i++) {
        ctx.beginPath();
        ctx.moveTo(W*.075, floor+4);
        ctx.lineTo(W*(.075 + .035 + i*.018), floor+10+i*5);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore();

    // The Nido interrupts the joke. Everyone freezes and looks toward it.
    if (threatIn > 0) {
      const nx = W * .50, ny = H * .26;
      ctx.save();
      const glow = ctx.createRadialGradient(nx, ny, 0, nx, ny, Math.min(W,H)*.27);
      glow.addColorStop(0, "rgba(255,57,91," + (.28*threatIn) + ")");
      glow.addColorStop(.34, "rgba(142,22,56," + (.18*threatIn) + ")");
      glow.addColorStop(1, "rgba(4,7,14,0)");
      ctx.fillStyle = glow; ctx.fillRect(0,0,W,H);
      ctx.strokeStyle = "rgba(255,104,126," + (.55*threatIn) + ")";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#ff4968"; ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.moveTo(nx, ny - 40);
      ctx.bezierCurveTo(nx-28,ny-15,nx-26,ny+18,nx,ny+46);
      ctx.bezierCurveTo(nx+30,ny+12,nx+26,ny-18,nx,ny-40);
      ctx.stroke();
      ctx.restore();

      const lineupY = floor + 1;
      const ids = V43_INTRO_CAST;
      ids.forEach((id, i) => {
        const x = lerp(W*.18, W*.82, i/(ids.length-1));
        const h = heroH * (id==="dino" ? .82 : id==="cat" ? .72 : .76);
        drawIntroActor(id, x, lineupY, h, tf, { facing: x < nx ? 1 : -1, pose: "idle", alpha: threatIn });
      });
    }
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
    drawFamilyScene(t, L);
    const flashK = reduce ? 0 : seg(t, T.flash, T.flash + 0.6);
    const titleGlow = reduce ? 1 : seg(t, T.core - 0.12, T.core + 0.34);
    drawBackdrop(ctx, W, H, cx, cy, CYAN, 0, titleGlow * (0.6 + (1 - flashK) * (t > T.flash ? 0.5 : 0)));
    drawRays(ctx, cx, cy, Math.hypot(W, H) * 0.7, CYAN, 0.28 * seg(t, T.ring, T.ring + 0.6), reduce ? 0 : t * 0.22, 16);
    if (!reduce) drawRays(ctx, cx, cy, Math.hypot(W, H) * 0.55, PINK, 0.22 * seg(t, T.ring + 0.2, T.ring + 0.8), -t * 0.16, 10);

    // partículas que convergen en el núcleo
    if (!reduce && t >= T.core - 0.1 && t < T.flash - 0.1) {
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

    // V43: primero conocemos a la familia; el texto llega solo cuando el Nido rompe la calma.
    const threat = reduce ? 0 : seg(t, T.threat + 0.22, T.core - 0.04);
    if (threat > 0) {
      ctx.save();
      ctx.globalAlpha = threat * (1 - seg(t, T.core - 0.18, T.core + 0.02));
      drawTitle(ctx, "EL NIDO HA DESPERTADO", cx, H * 0.16, Math.max(13, size * 0.16), PINK, {
        font: FONT_BODY, weight: 800, spacing: "0.18em", stroke: false, glow: "rgba(255,106,168,0.78)"
      });
      drawTitle(ctx, "Y ESTA VEZ, VAN TODOS.", cx, H * 0.84, Math.max(12, size * 0.135), "#e7f4ff", {
        font: FONT_BODY, weight: 700, spacing: "0.12em", stroke: false, maxWidth: W * 0.88
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
      drawTitle(ctx, "Diez héroes. Cinco formas. Un nido. Nadie se queda atrás.", cx, cy + size * 0.85 + (1 - easeOut(tag)) * 8,
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
  setTimeout(() => { if (!done) end(); }, 8500);
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

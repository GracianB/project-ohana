import {drawEvolutionPresentation} from "./evo-cine/presentation.js";
import { drawCharacter } from "../characters/draw.js";
import { ROSTER } from "../characters/roster.js";
import { sfx } from "../engine/audio.js";
import { duckMusic } from "../engine/music.js";
import { evolutionTiming } from "./evolution-timing.js";
import { drawCuernoMetamorphosis } from "./cuerno-v93-metamorphosis.js";
import { EVOLUTION_CINEMA_PROFILES, EVOLUTION_STAGE_COPY, evolutionMessage } from "../characters/evolution.js";

import {
  FONT_DISPLAY, FONT_BODY, clamp, lerp, seg, easeOut, easeInOut, easeBack, reducedMotion, rgba, tint, loadFonts, fullCanvas, Particles, drawStar, drawSpark, drawRays, drawBackdrop, drawRing, drawTitle, baseHeight, makeDummy, drawDummy
} from "./cinema-kit.js";
import * as EvoCine_kilo from "./evo-cine/kilo.js";
import * as EvoCine_frita from "./evo-cine/frita.js";
import * as EvoCine_stitcho from "./evo-cine/stitcho.js";
import * as EvoCine_cuerno from "./evo-cine/cuerno.js";
import * as EvoCine_chispin from "./evo-cine/chispin.js";
import * as EvoCine_pizza from "./evo-cine/pizza.js";
import * as EvoCine_michi from "./evo-cine/michi.js";
import * as EvoCine_yomi from "./evo-cine/yomi.js";
import * as EvoCine_dino from "./evo-cine/dino.js";
import * as EvoCine_dragon from "./evo-cine/dragon.js";
const EVO_CINE_BY_ID = Object.freeze({ kilo: EvoCine_kilo, lilo: EvoCine_kilo, frita: EvoCine_frita, stitcho: EvoCine_stitcho, stitch: EvoCine_stitcho, cuerno: EvoCine_cuerno, chispin: EvoCine_chispin, pikachu: EvoCine_chispin, pizza: EvoCine_pizza, cat: EvoCine_michi, michi: EvoCine_michi, yomi: EvoCine_yomi, dino: EvoCine_dino, dragon: EvoCine_dragon });

export { FONT_DISPLAY, FONT_BODY, clamp, lerp, seg, easeOut, easeInOut, easeBack, reducedMotion, rgba, tint, loadFonts, fullCanvas, Particles, drawStar, drawSpark, drawRays, drawBackdrop, drawRing, drawTitle, baseHeight, makeDummy, drawDummy } from "./cinema-kit.js";

let stage = null;
let running = null;

function ensureStage() {
  if (stage) return stage;
  const el = document.getElementById("evo-stage") || document.createElement("div");
  el.id = "evo-stage";
  el.dataset.dialog = "show";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-labelledby", "evo-description");
  el.setAttribute("aria-live", "assertive");
  el.innerHTML = '<canvas aria-hidden="true"></canvas><p class="evo-sr" id="evo-description"></p><button type="button" class="evo-skip">Continuar · Esc</button>';
  if (!el.isConnected) document.body.appendChild(el);
  const fc = fullCanvas(el.querySelector("canvas"));
  stage = { el, fc, sr: el.querySelector(".evo-sr") };
  addEventListener("resize", () => { if (stage) stage.fc.resize(); });
  return stage;
}


const EVOLUTION_REVEAL_POSE = Object.freeze({
  kilo:"victory", stitcho:"attack", chispin:"attack", cat:"idle", dragon:"victory",
  dino:"attack", frita:"run", pizza:"jump", yomi:"idle", cuerno:"victory"
});

function drawEvolutionIdentity(ctx, id, profile, cx, cy, target, k, t, accent) {
  if (k <= 0.001) return;
  const motif = profile?.motif || "petals";
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = (0.12 + k * 0.34);
  ctx.strokeStyle = accent;
  ctx.fillStyle = rgba(accent, 0.12 + k * 0.08);
  ctx.lineWidth = Math.max(1.4, target * 0.012);
  const R = target * (0.56 + k * 0.22);
  const spin = t * (profile?.speed || 1) * 0.32;

  if (motif === "petals") {
    for (let i=0;i<7;i++){ctx.save();ctx.rotate(spin+i*Math.PI*2/7);ctx.beginPath();ctx.ellipse(0,-R*.62,target*.10,target*.24,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
  } else if (motif === "seams") {
    for (let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(-R*.9,i*target*.11);ctx.bezierCurveTo(-R*.25,i*target*.03,R*.28,-i*target*.07,R*.9,i*target*.10);ctx.stroke();}
  } else if (motif === "bolts") {
    for (let i=0;i<8;i++){ctx.save();ctx.rotate(spin+i*Math.PI/4);ctx.beginPath();ctx.moveTo(R*.25,0);ctx.lineTo(R*.48,-target*.07);ctx.lineTo(R*.40,target*.05);ctx.lineTo(R*.70,0);ctx.stroke();ctx.restore();}
  } else if (motif === "moons") {
    ctx.beginPath();ctx.arc(0,0,R*.74,0,Math.PI*2);ctx.stroke();
    ctx.globalCompositeOperation="source-over";ctx.fillStyle="rgba(3,5,12,.82)";ctx.beginPath();ctx.arc(R*.20,-R*.05,R*.63,0,Math.PI*2);ctx.fill();
  } else if (motif === "embers") {
    for (let i=0;i<6;i++){ctx.save();ctx.rotate(spin+i*Math.PI/3);ctx.beginPath();ctx.moveTo(R*.22,0);ctx.quadraticCurveTo(R*.55,-target*.20,R*.78,0);ctx.quadraticCurveTo(R*.54,target*.14,R*.22,0);ctx.stroke();ctx.restore();}
  } else if (motif === "shards") {
    for (let i=0;i<8;i++){ctx.save();ctx.rotate(i*Math.PI/4);ctx.beginPath();ctx.moveTo(R*.22,0);ctx.lineTo(R*.52,-target*.10);ctx.lineTo(R*.72,0);ctx.lineTo(R*.50,target*.10);ctx.closePath();ctx.stroke();ctx.restore();}
  } else if (motif === "salt") {
    for (let i=0;i<18;i++){const a=i*2.399+spin,r=R*(.25+(i%5)*.11);ctx.beginPath();ctx.arc(Math.cos(a)*r,Math.sin(a)*r,2+(i%3),0,Math.PI*2);ctx.fill();}
  } else if (motif === "cheese") {
    ctx.beginPath();ctx.arc(0,0,R*.72,0,Math.PI*2);ctx.stroke();
    for(let i=0;i<5;i++){const a=i*Math.PI*2/5+spin;ctx.beginPath();ctx.moveTo(Math.cos(a)*R*.3,Math.sin(a)*R*.3);ctx.quadraticCurveTo(Math.cos(a)*R*.62,Math.sin(a)*R*.62+target*.15,Math.cos(a)*R*.72,Math.sin(a)*R*.72);ctx.stroke();}
  } else if (motif === "ofuda") {
    for(let i=0;i<6;i++){const a=i*Math.PI*2/6-spin*.4;ctx.save();ctx.translate(Math.cos(a)*R*.72,Math.sin(a)*R*.45);ctx.rotate(a+Math.PI/2);ctx.strokeRect(-target*.045,-target*.12,target*.09,target*.24);ctx.restore();}
  } else {
    const cols=["#ff7aa8","#ffd36a","#7ee7ff","#b78bff"];
    for(let i=0;i<4;i++){ctx.strokeStyle=cols[i];ctx.beginPath();ctx.arc(0,target*.08,R*(.46+i*.08),Math.PI*1.08,Math.PI*1.92);ctx.stroke();}
  }
  ctx.restore();
}

export function playEvolution(detail = {}) {
  const st = ensureStage();
  if (running) running.stop(true);
  const cineMod = EVO_CINE_BY_ID[detail.id || "kilo"];
  if (!detail._classic && cineMod && typeof cineMod.drawEvoCine === "function" ) {
    if (playCharacterCine(st, detail, cineMod)) return;
  }

  const id = detail.id || "kilo";
  const evo = clamp(Number(detail.evo) || 1, 1, 4);
  const def = ROSTER.find((r) => r.id === id) || ROSTER[0];
  const newForm = (def.forms && def.forms[evo]) || {};
  const oldForm = (def.forms && def.forms[evo - 1]) || {};
  const finalForm = evo >= 4;
  const color = detail.color || newForm.color || def.color || "#7ee7ff";
  const designAccent = newForm.accent || newForm.color || def.color || color;
  const oldColor = oldForm.color || color;
  const cinemaProfile = EVOLUTION_CINEMA_PROFILES[def.id] || EVOLUTION_CINEMA_PROFILES.kilo;
  const accent = finalForm ? designAccent : (cinemaProfile.accent || color);
  const light = tint(accent, 0.55);
  const palette = finalForm ? [accent, light, "#ffffff", color] : [color, light, "#ffffff"];
  const toName = String(detail.toName || detail.name || newForm.name || "Nueva forma");
  const title = "¡" + toName.toUpperCase() + "!";
  const story = evolutionMessage(def.id, evo) || EVOLUTION_STAGE_COPY[evo] || EVOLUTION_STAGE_COPY[4] || { kicker: "EVOLUCIÓN" };
  const reduce = reducedMotion();

  const T = evolutionTiming({ reduced: reduce, finalForm });

  const pOld = makeDummy(def.id, evo - 1, oldColor);
  const pNew = makeDummy(def.id, evo, color);
  const finalEchoes = finalForm
    ? [0,1,2,3].map((stage) => makeDummy(def.id, stage, def.forms?.[stage]?.color || def.color || color))
    : [];
  pOld._poseOverride = "idle";
  const parts = new Particles();
  const { el, fc } = st;
  const ctx = fc.ctx;

  st.sr.textContent = "Evolución completada: " + toName + ". Nueva forma " + (evo + 1) + " de 5.";
  el.classList.add("show");
  el.classList.toggle("finale", finalForm);
  const staleLadder = el.querySelector(".form-ladder");
  if (staleLadder) staleLadder.remove();
  sfx("evoCharge");
  duckMusic(true);
  let fanfared = false;

  let t0 = performance.now();
  let last = t0;
  let raf = 0;
  let skipAt = -1;
  let flashed = false;
  let burstDone = false;
  let spawnAcc = 0;
  let sparkAcc = 0;
  let finished = false;
  let failSafe = 0;

  function layout() {
    const W = fc.W, H = fc.H;
    const portrait = H > W * 1.1;
    const target = Math.min(H * (portrait ? 0.34 : 0.4), W * (portrait ? 0.62 : 0.5));
    const cy = H * (portrait ? 0.38 : 0.37);
    return { W, H, cx: W / 2, cy, target, footY: cy + target * 0.5, portrait };
  }

  function burst(L) {
    const n = reduce ? 4 : finalForm ? 22 : 16;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = (reduce ? 160 : 420) + Math.random() * (finalForm ? 900 : 700);
      const kind = i % 3 === 0 ? "star" : i % 3 === 1 ? "streak" : "dot";
      const forward = Math.cos(a) > 0.2;
      parts.add({
        x: L.cx + Math.cos(a) * L.target * 0.62,
        y: L.cy + Math.sin(a) * L.target * 0.42,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        drag: kind === "streak" ? 0.93 : 0.95, g: kind === "star" ? 160 : 0,
        max: 0.9 + Math.random() * (finalForm ? 1.4 : 1.0),
        size: kind === "star" ? 5 + Math.random() * (L.target * 0.04) : kind === "streak" ? 2 + Math.random() * 2 : 2 + Math.random() * 3,
        rot: Math.random() * 6, vr: (Math.random() - 0.5) * 8,
        kind, color: palette[i % palette.length],
        behind: !forward,
      });
    }
  }



  function evolutionCamera(t, target) {
    if (reduce) return { dx:0, dy:0, rot:0, zoom:1 };
    const q = seg(t, T.charge, T.reveal + 0.55);
    const mode = cinemaProfile.camera || "orbit";
    if (mode === "spiral") return { dx:Math.sin(t*4.2)*target*.035*q, dy:Math.cos(t*3.4)*target*.018*q, rot:Math.sin(t*3.1)*.045*q, zoom:1 };
    if (mode === "snap") return { dx:Math.sin(t*8.0)*target*.018*q, dy:0, rot:0, zoom:1+Math.sin(q*Math.PI)*.055 };
    if (mode === "eclipse") return { dx:0, dy:-Math.sin(q*Math.PI)*target*.055, rot:-.018*q, zoom:1+q*.025 };
    if (mode === "sweep") return { dx:lerp(-target*.08,target*.04,easeInOut(q)), dy:-target*.018*q, rot:-.028*(1-q), zoom:1 };
    if (mode === "impact") return { dx:0, dy:lerp(-target*.075,0,easeOut(q)), rot:0, zoom:.96+.04*easeOut(q) };
    if (mode === "whip") return { dx:Math.sin(q*Math.PI*1.2)*target*.08, dy:0, rot:Math.sin(q*Math.PI)*.035, zoom:1 };
    if (mode === "roll") return { dx:0, dy:Math.sin(t*2.5)*target*.018, rot:Math.sin(q*Math.PI)*.055, zoom:.98+.03*q };
    if (mode === "pull") return { dx:0, dy:0, rot:0, zoom:1.08-.08*easeOut(q) };
    if (mode === "rise") return { dx:0, dy:-easeOut(q)*target*.075, rot:0, zoom:.97+.05*q };
    return { dx:Math.sin(t*2.1)*target*.028*q, dy:-Math.sin(t*1.5)*target*.018*q, rot:Math.sin(t*1.7)*.018*q, zoom:1 };
  }

  function drawFinalAscension(t, L) {
    if (!finalForm || reduce) return;
    const { W, H, cx, cy, target, footY } = L;
    const chargeK = easeOut(seg(t, 0.30, T.flash - 0.10));
    if (chargeK <= 0) return;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const beam = ctx.createLinearGradient(cx, cy - target * 1.2, cx, footY + target * 0.65);
    beam.addColorStop(0, rgba(accent, 0));
    beam.addColorStop(.22, rgba(light, 0.12 * chargeK));
    beam.addColorStop(.52, "rgba(255,255,255," + (0.08 + 0.20 * chargeK) + ")");
    beam.addColorStop(.82, rgba(accent, 0.15 * chargeK));
    beam.addColorStop(1, rgba(accent, 0));
    ctx.fillStyle = beam;
    ctx.fillRect(cx - target * .42, cy - target * 1.2, target * .84, target * 2.1);

    for (let i=0;i<4;i++) {
      const orbit = seg(t, .46 + i*.10, T.flash - .08);
      if (orbit <= 0) continue;
      ctx.globalAlpha = .11 + .20 * orbit;
      ctx.strokeStyle = i % 2 ? light : accent;
      ctx.lineWidth = Math.max(1.5, target * .012);
      ctx.beginPath();
      ctx.ellipse(
        cx,
        cy + Math.sin(t * 2.2 + i) * target * .08,
        target * (.40 + i*.09),
        target * (.16 + i*.035),
        t * (.22 + i*.03) + i,
        0, Math.PI*2
      );
      ctx.stroke();
    }
    ctx.restore();

    const converge = easeInOut(seg(t, 1.36, T.flash - .12));
    finalEchoes.forEach((echo, i) => {
      const appear = easeOut(seg(t, .40 + i*.22, .72 + i*.22));
      const vanish = 1 - seg(t, T.flash - .28, T.flash - .02);
      const alpha = appear * vanish;
      if (alpha <= .01) return;
      const angle = -Math.PI*.88 + i * (Math.PI*.59);
      const sx = cx + Math.cos(angle) * target * 1.00;
      const sy = cy + Math.sin(angle) * target * .48 + target * .30;
      const x = lerp(sx, cx, converge);
      const y = lerp(sy, footY, converge);
      const h = target * (.34 + i*.035) * (1 - converge*.18);
      echo._poseOverride = i % 2 ? "victory" : "idle";
      ctx.save();
      ctx.globalAlpha = alpha * (.58 + .30*(1-converge));
      drawDummy(ctx, echo, x, y, h / baseHeight(def.id, i), t*60 + i*17);
      ctx.restore();
    });

    const whiteK = Math.sin(seg(t, T.flash - .34, T.flash) * Math.PI);
    if (whiteK > .001) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = whiteK * .30;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, target * .92);
      g.addColorStop(0, "rgba(255,255,255,.95)");
      g.addColorStop(.30, rgba(light,.48));
      g.addColorStop(1, rgba(accent,0));
      ctx.fillStyle = g;
      ctx.fillRect(cx-target,cy-target,target*2,target*2);
      ctx.restore();
    }
  }

  function frame(now) {
    if (finished) return;
    try {
      const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    let t = (now - t0) / 1000;
    if (skipAt >= 0 && t < T.out) { t0 -= (T.out - t) * 1000; t = T.out; }
    const L = layout();
    const { W, H, cx, cy, target, footY } = L;
    const scale = target / baseHeight(def.id, evo);
    const tf = t * 60; // tiempo en "frames" como el juego

    ctx.save();
    ctx.clearRect(0, 0, W, H);

    const out = seg(t, T.out, T.end);
    const fade = 1 - easeInOut(out);

    const shakeK = reduce ? 0 : seg(t, T.flash, T.flash + (finalForm ? 0.6 : 0.42));
    if (shakeK > 0 && shakeK < 1) {
      const amp = (1 - shakeK) * (finalForm ? 8 : 6);
      ctx.translate((Math.random() - 0.5) * amp, (Math.random() - 0.5) * amp);
    }

    const dark = easeOut(seg(t, 0, T.dark)) * fade;
    const charge = seg(t, T.charge, T.flash);
    const revealK = seg(t, T.reveal, T.reveal + 0.5);
    drawBackdrop(ctx, W, H, cx, cy, accent, dark, (0.35 + charge * 0.5 + revealK * 0.4) * fade);
    if (!finalForm) {
      drawEvolutionIdentity(ctx, def.id, cinemaProfile, cx, cy, target * 1.08, clamp((charge * 0.20 + revealK * 0.24), 0, 0.28), t, accent);
    }
    // Cuerno V93: each biological leap earns an authored, bounded backdrop.
    if (def.id === "cuerno") drawCuernoMetamorphosis(ctx, {
      evo, t, timing:T, cx, cy, target, fade, reduce
    });
    drawFinalAscension(t, L);
    const rayA = (0.18 + charge * 0.18 + revealK * 0.24) * dark;
    const R = Math.hypot(W, H) * 0.75;
    const spin = reduce ? 0 : t * (0.25 + charge * 0.6 + revealK * 0.2);
    drawRays(ctx, cx, cy, R, accent, rayA * 0.07, spin, finalForm ? 6 : 5);
    if (!reduce) drawRays(ctx, cx, cy, R * 0.7, finalForm ? color : light, rayA * 0.025, -spin * 0.7, 4);

    if (!reduce && t < T.flash) {
      for (let i = 0; i < 2; i++) {
        const kk = ((t * (1.1 + charge * 2.5) + i / 3) % 1);
        const ring = 1 - kk; // hacia dentro
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = seg(t, T.oldIn, T.charge) * Math.sin(kk * Math.PI) * (0.22 + charge * 0.12);
        ctx.strokeStyle = i % 2 ? "#ffffff" : accent;
        ctx.lineWidth = 1.5 + charge * 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, target * (0.58 + ring * 0.42), target * (0.58 + ring * 0.42), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    if (!reduce && t > T.oldIn && t < T.flash - 0.08) {
      spawnAcc += dt * (40 + charge * 220) * (finalForm ? 1.5 : 1);
      while (spawnAcc > 1) {
        spawnAcc -= 1;
        const a = Math.random() * Math.PI * 2;
        const r = Math.max(W, H) * (0.45 + Math.random() * 0.25);
        parts.add({
          x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r,
          vx: 0, vy: 0, to: { x: cx, y: cy }, swirl: (Math.random() < 0.5 ? -1 : 1) * 900,
          max: 3, size: 1.6 + Math.random() * 2.4, kind: Math.random() < 0.5 ? "streak" : "dot",
          color: palette[(Math.random() * palette.length) | 0], behind: true,
        });
      }
    }
    if (t > T.reveal && t < T.out) {
      sparkAcc += dt * (reduce ? 6 : finalForm ? 40 : 24);
      while (sparkAcc > 1) {
        sparkAcc -= 1;
        const back = 0.25 + Math.random() * 0.7;
        parts.add({
          x: cx - target * back, y: cy + (Math.random() - 0.45) * target * 0.7,
          vx: -(40 + Math.random() * 90), vy: -24 - Math.random() * 50, drag: 0.99,
          max: 0.7 + Math.random() * 0.7,
          size: 3 + Math.random() * (target * 0.03), kind: "spark",
          color: palette[(Math.random() * palette.length) | 0], behind: true,
        });
      }
    }

    const covers = (p) => Math.abs(p.x - cx) < target * 0.36 && p.y < footY + 4 && p.y > cy - target * 0.8;
    const behindSpark = (p) => p.behind || covers(p) || p.x < cx;
    parts.update(dt);
    ctx.save();
    ctx.globalAlpha = fade;
    parts.draw(ctx, behindSpark);
    ctx.restore();

    const morphK = easeInOut(seg(t, T.charge, T.flash));
    const introK = easeOut(seg(t, T.oldIn, T.oldIn + 0.35));
    const cam = evolutionCamera(t, target);
    const box = target * 2.2;
    const bob = reduce ? 0 : Math.sin(t * 2.2) * target * 0.010;
    const centerY = footY + bob;

    ctx.save();
    ctx.globalAlpha = fade;

    const ground = ctx.createRadialGradient(cx, footY, 0, cx, footY, target * 0.72);
    ground.addColorStop(0, rgba(accent, 0.24));
    ground.addColorStop(1, rgba(accent, 0));
    ctx.fillStyle = ground;
    ctx.beginPath();
    ctx.ellipse(cx, footY, target * 0.72, target * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    if (t < T.flash) {
      const oldAlpha = (1 - morphK) * clamp(introK + 0.18, 0, 1);
      if (oldAlpha > 0.001) {
        const oldScale = scale * (0.96 + introK * 0.04) * (1 - morphK * 0.035);
        ctx.save();
        ctx.globalAlpha = oldAlpha;
        ctx.translate(cx + cam.dx, centerY + cam.dy);
        ctx.rotate(cam.rot * .65);
        ctx.scale(cam.zoom, cam.zoom);
        drawDummy(ctx, pOld, 0, 0, oldScale, tf);
        ctx.restore();
      }

      if (morphK > 0.001) {
        const grow = easeOut(morphK);
        const newAlpha = morphK;
        const newScale = scale * (0.76 + 0.24 * grow);
        ctx.save();
        ctx.globalAlpha = newAlpha;
        ctx.translate(cx + cam.dx, centerY + cam.dy);
        ctx.rotate(cam.rot);
        ctx.scale(cam.zoom, cam.zoom);
        drawDummy(ctx, pNew, 0, 0, newScale, tf);
        ctx.restore();
      }

      if (!reduce && morphK > 0.02) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 0.08 + morphK * 0.14;
        ctx.strokeStyle = accent;
        ctx.lineWidth = Math.max(1.5, target * 0.018);
        ctx.beginPath();
        ctx.arc(cx, cy, target * (0.72 + morphK * 0.22), -Math.PI * 0.92, Math.PI * 0.92);
        ctx.stroke();
        ctx.restore();
      }
    } else {
      const pop = reduce ? 1 : easeBack(revealK);
      const sc = scale * (finalForm ? (0.72 + 0.34 * pop) : (0.78 + 0.22 * pop));
      pNew._poseOverride = EVOLUTION_REVEAL_POSE[def.id] || "victory";
      pNew.melee = pNew._poseOverride === "attack" ? 10 : 0;
      pNew.grounded = pNew._poseOverride !== "jump";
      pNew.vy = pNew._poseOverride === "jump" ? -3 : 0;
      pNew.vx = pNew._poseOverride === "run" ? 4 : 0;

      ctx.save();
      ctx.globalAlpha = 0.98;
      ctx.translate(cx + cam.dx, centerY + cam.dy);
      ctx.rotate(cam.rot);
      ctx.scale(cam.zoom, cam.zoom);
      drawDummy(ctx, pNew, 0, 0, sc, tf);
      ctx.restore();

      if (!reduce) {
        const ringK = easeOut(seg(t, T.reveal, T.reveal + 0.65));
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = (1 - ringK) * 0.52;
        ctx.strokeStyle = light;
        ctx.lineWidth = Math.max(1.5, target * 0.018);
        ctx.beginPath();
        ctx.arc(cx, footY, target * (0.72 + ringK * 0.46), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
    ctx.restore();

    if (t >= T.flash && !flashed) { flashed = true; sfx("evoFlash"); }
    if (flashed && !fanfared && t >= T.reveal + 0.25) { fanfared = true; sfx(finalForm ? "evoFinalFanfare" : "evoFanfare"); }
    if (flashed && !burstDone) { burstDone = true; burst(L); }
    if (!reduce) {
      ctx.save();
      ctx.globalAlpha = fade;
      const dt2 = t - T.flash;
      const maxR = Math.hypot(W, H) * 0.42;
      drawRing(ctx, cx, footY, target * 0.95, seg(dt2, 0.0, 0.55), light, target * 0.014, 0.20);
      ctx.restore();
    }
    ctx.save();
    ctx.globalAlpha = fade;
    parts.draw(ctx, (p) => !behindSpark(p));
    ctx.restore();
    const flashA = reduce ? 0.14 * (1 - seg(t, T.flash, T.flash + 0.14)) * (t >= T.flash ? 1 : 0)
      : (t < T.flash
        ? Math.pow(seg(t, T.flash - 0.06, T.flash), 3) * 0.42
        : Math.pow(1 - seg(t, T.flash, T.flash + 0.16), 3) * 0.36);
    if (flashA > 0.001) {
      const fr = Math.hypot(W, H) * 0.7;
      const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, fr);
      fg.addColorStop(0, "rgba(255,255,255," + flashA + ")");
      fg.addColorStop(0.35, "rgba(255,255,255," + flashA * 0.85 + ")");
      fg.addColorStop(1, rgba(light, flashA * 0.5));
      ctx.fillStyle = fg;
      ctx.fillRect(-40, -40, W + 80, H + 80);
    }

    const txt = seg(t, T.reveal + (reduce ? 0 : 0.12), T.reveal + (reduce ? 0.2 : 0.55));
    if (txt > 0) {
      const base = Math.min(W * (L.portrait ? 0.105 : 0.07), H * 0.088, 100);
      const size = Math.max(30, base);
      const slam = reduce ? 1 : easeBack(txt);
      const ty = Math.min(H - size * 2.7, footY + target * 0.12 + size * 1.05);
      ctx.save();
      ctx.globalAlpha = clamp(txt * 2, 0, 1) * fade;
      drawTitle(ctx, finalForm ? "✦ FORMA FIRMA · ASCENSIÓN ✦" : "✦ " + story.kicker + " ✦", cx, ty - size * 0.82, Math.max(13, size * 0.3),
        tint(accent, 0.6), { font: FONT_BODY, weight: 800, spacing: "0.35em", stroke: false, glow: accent });
      ctx.save();
      ctx.translate(cx, ty);
      const s = lerp(1.6, 1, slam);
      ctx.scale(s, s);
      drawTitle(ctx, title, 0, 0, size, finalForm ? ["#fff6c8", accent, light] : ["#ffffff", light, accent],
        { maxWidth: W * 0.92 / s, glow: rgba(accent, 0.9) });
      ctx.restore();
      const sub = seg(t, T.reveal + 0.3, T.reveal + 0.7) * (reduce ? 0 : 1) + (reduce ? 1 : 0);
      ctx.globalAlpha = sub * fade;
      const y2 = ty + size * 0.85;
      const bw = Math.min(W * 0.5, size * 4) * easeOut(sub);
      const lg = ctx.createLinearGradient(cx - bw / 2, 0, cx + bw / 2, 0);
      lg.addColorStop(0, rgba(accent, 0)); lg.addColorStop(0.5, rgba(accent, 1)); lg.addColorStop(1, rgba(accent, 0));
      ctx.fillStyle = lg;
      ctx.fillRect(cx - bw / 2, y2 - 1, bw, 2);
      if (story.line) {
        drawTitle(ctx, story.line, cx, y2 + size * 0.27, Math.max(11, size * 0.22), light,
          { font: FONT_BODY, weight: 700, stroke: false, maxWidth: W * 0.86 });
      }
      drawTitle(ctx, finalForm ? "FORMA 5/5 · IDENTIDAD COMPLETA" : "FORMA " + (evo + 1) + "/5", cx, y2 + size * 0.58, Math.max(13, size * 0.28), "#ffffff",
        { font: FONT_BODY, weight: 800, spacing: "0.3em", stroke: false });
      const pipY = y2 + size * 0.92, pipR = Math.max(4, size * 0.07), gap = pipR * 3.2;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(cx + (i - 2) * gap, pipY, pipR, 0, Math.PI * 2);
        ctx.fillStyle = i <= evo ? (i === evo ? "#ffffff" : accent) : "rgba(255,255,255,0.18)";
        ctx.fill();
      }
      ctx.restore();
    }
    if (t > 0.65 && t < T.out) {
      ctx.save();
      ctx.globalAlpha = 0.5 * seg(t, 0.8, 1.2);
      drawTitle(ctx, "Toca o pulsa una tecla para continuar", cx, H - 22, 11, "#cfe0f2",
        { font: FONT_BODY, weight: 600, spacing: "0.16em", stroke: false });
      ctx.restore();
    }

    ctx.restore();
    if (t >= T.end) { finish(); return; }
    raf = requestAnimationFrame(frame);
    } catch (err) {
      console.error("[ohana] evolution cinema recovered from render error", { id: def.id, evo, err });
      finish(true);
    }
  }

  function onSkip(e) {
    const t = (performance.now() - t0) / 1000;
    if (t < 0.8 && e?.type!=="click") return;
    if (e && e.type === "keydown") { if (!["Escape","Enter"," "].includes(e.key)) return; e.preventDefault(); e.stopPropagation(); }
    if (skipAt < 0) skipAt = t;
  }

  function finish(silent) {
    if (finished) return;
    finished = true;
    if (failSafe) clearTimeout(failSafe);
    cancelAnimationFrame(raf);
    removeEventListener("keydown", onSkip, true);
    el.querySelector(".evo-skip").removeEventListener("click", onSkip);
    ctx.setTransform(fc.dpr, 0, 0, fc.dpr, 0, 0);
    ctx.clearRect(0, 0, fc.W, fc.H);
    el.classList.remove("show", "finale");
    duckMusic(false);
    running = null;
    if (!silent) {
      document.querySelectorAll(".game-notification.evo").forEach((n) => n.click());
      try { window.dispatchEvent(new CustomEvent("ohana-evolve-done", { detail: { id: def.id, evo } })); } catch (_) {}
    }
  }

  addEventListener("keydown", onSkip, true);
  el.querySelector(".evo-skip").addEventListener("click", onSkip);
  running = { stop: finish };
  loadFonts();
  failSafe = setTimeout(() => finish(true), Math.max(3500, (T.end + 1.5) * 1000));
  raf = requestAnimationFrame(frame);
}

if (!window.__ohanaEvoCinema) {
  window.__ohanaEvoCinema = true;
  addEventListener("ohana-evolve", (e) => playEvolution((e && e.detail) || {}));
}

// V372: cinemática propia de cada personaje (4 s). La ruta clásica queda como
// respaldo (error de render) y para movimiento reducido.
function playCharacterCine(st, detail, mod) {
  const id = detail.id || "kilo";
  const evo = clamp(Number(detail.evo) || 1, 1, 4);
  const def = ROSTER.find((r) => r.id === id) || ROSTER[0];
  const from = evo, to = evo + 1;            // formas 1..5 (evo 0..4 → +1)
  const dur = Number(mod.EVO_CINE_DURATION) || 4;
  const { el, fc } = st;
  const ctx = fc.ctx;
  const toName = String(detail.toName || detail.name || def.forms?.[evo]?.name || "Nueva forma");
  st.sr.textContent = "Evolución completada: " + toName + ". Nueva forma " + to + " de 5.";
  el.classList.add("show");
  el.classList.toggle("finale", evo >= 4);
  el.querySelector(".form-ladder")?.remove();
  sfx("evoCharge"); duckMusic(true);
  let t0 = performance.now(), raf = 0, finished = false, skipAt = -1, failSafe = 0, fanfare = false;
  function frame(now) {
    if (finished) return;
    let t = (now - t0) / 1000;
    if (skipAt >= 0) t = dur;
    try {
      ctx.save();
      ctx.setTransform(fc.dpr, 0, 0, fc.dpr, 0, 0);
      ctx.clearRect(0, 0, fc.W, fc.H);
      drawEvolutionPresentation(ctx, fc.W, fc.H, id, evo, Math.min(t, dur), reducedMotion());
      ctx.restore();
    } catch (err) {
      try { ctx.restore(); } catch (_) {}
      console.error("[ohana] per-character evo cine failed, classic fallback", { id, evo, err });
      finish(true); running = null; playClassic(); return;
    }
    if (!fanfare && t > dur * 0.6) { fanfare = true; sfx("evoFlash"); }
    if (t >= dur) { finish(); return; }
    raf = requestAnimationFrame(frame);
  }
  function onSkip(e) {
    if ((performance.now() - t0) < 800 && e?.type!=="click") return;
    if (e && e.type === "keydown") { if (!["Escape","Enter"," "].includes(e.key)) return; e.preventDefault(); e.stopPropagation(); }
    skipAt = 1;
  }
  function finish(silent) {
    if (finished) return;
    finished = true;
    clearTimeout(failSafe); cancelAnimationFrame(raf);
    removeEventListener("keydown", onSkip, true);
    el.querySelector(".evo-skip").removeEventListener("click", onSkip);
    ctx.setTransform(fc.dpr, 0, 0, fc.dpr, 0, 0);
    ctx.clearRect(0, 0, fc.W, fc.H);
    el.classList.remove("show", "finale");
    duckMusic(false);
    running = null;
    if (!silent) {
      document.querySelectorAll(".game-notification.evo").forEach((n) => n.click());
      try { window.dispatchEvent(new CustomEvent("ohana-evolve-done", { detail: { id: def.id, evo } })); } catch (_) {}
    }
  }
  function playClassic() { playEvolution({ ...detail, _classic: true }); }
  addEventListener("keydown", onSkip, true);
  el.querySelector(".evo-skip").addEventListener("click", onSkip);
  running = { stop: finish };
  failSafe = setTimeout(() => finish(), (dur + 2) * 1000);
  raf = requestAnimationFrame(frame);
  return true;
}

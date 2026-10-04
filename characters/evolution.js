// ============================================================================
// EVOLUTION · identidad visual de forma
// ----------------------------------------------------------------------------
// La forma 0 → 4 cambia lenguaje corporal, énfasis de silueta y firma visual.
// CONTRATO: solo presentación. No modifica hitbox, daño, alcance ni física.
// ============================================================================

const ALIAS = Object.freeze({
  lilo: "kilo",
  stitch: "stitcho",
  pikachu: "chispin",
  michi: "cat",
});

const IDS = Object.freeze([
  "kilo", "stitcho", "chispin", "cat", "dragon",
  "dino", "frita", "pizza", "yomi", "cuerno",
]);

export const EVOLUTION_STAGES = Object.freeze([
  Object.freeze({
    id: 0, name: "baby", scaleX: 0.94, scaleY: 0.95,
    sway: 0.86, bounce: 1.08, lean: 0.55, head: 0.80,
    arms: 0.88, legs: 0.92, air: 0.82, pulse: 0.85,
    ornament: 0.55,
  }),
  Object.freeze({
    id: 1, name: "base", scaleX: 1.00, scaleY: 1.00,
    sway: 0.98, bounce: 1.00, lean: 0.92, head: 0.94,
    arms: 1.00, legs: 1.00, air: 0.96, pulse: 1.00,
    ornament: 0.72,
  }),
  Object.freeze({
    id: 2, name: "evolved", scaleX: 1.035, scaleY: 1.045,
    sway: 1.06, bounce: 0.94, lean: 1.12, head: 1.08,
    arms: 1.08, legs: 1.08, air: 1.08, pulse: 1.18,
    ornament: 0.92,
  }),
  Object.freeze({
    id: 3, name: "high", scaleX: 1.085, scaleY: 1.075,
    sway: 1.14, bounce: 0.88, lean: 1.28, head: 1.16,
    arms: 1.18, legs: 1.14, air: 1.18, pulse: 1.38,
    ornament: 1.10,
  }),
  Object.freeze({
    id: 4, name: "god", scaleX: 1.13, scaleY: 1.12,
    sway: 1.22, bounce: 0.78, lean: 1.42, head: 1.24,
    arms: 1.28, legs: 1.22, air: 1.30, pulse: 1.65,
    ornament: 1.34,
  }),
]);

const CHARACTER_STYLES = Object.freeze({
  kilo:    Object.freeze({ kind: "petal", lean: -0.030, head: 0.020, swing: 1.08, float: 0.08 }),
  stitcho: Object.freeze({ kind: "stitch", lean:  0.040, head: -0.018, swing: 1.15, float: 0.02 }),
  chispin: Object.freeze({ kind: "bolt",  lean:  0.075, head: -0.028, swing: 1.25, float: 0.00 }),
  cat:     Object.freeze({ kind: "star",  lean: -0.018, head: 0.036, swing: 0.96, float: 0.10 }),
  dragon:  Object.freeze({ kind: "flame", lean:  0.020, head: -0.040, swing: 0.92, float: 0.18 }),
  dino:    Object.freeze({ kind: "shard", lean:  0.090, head: -0.050, swing: 0.78, float: -0.04 }),
  frita:   Object.freeze({ kind: "salt",  lean:  0.065, head: -0.022, swing: 1.12, float: 0.00 }),
  pizza:   Object.freeze({ kind: "cheese",lean: -0.055, head: 0.020, swing: 0.84, float: 0.06 }),
  yomi:    Object.freeze({ kind: "ofuda", lean:  0.012, head: 0.065, swing: 0.72, float: 0.22 }),
  cuerno:  Object.freeze({ kind: "horn",  lean: -0.030, head: -0.030, swing: 1.02, float: 0.14 }),
});

const CANON = (id) => {
  const key = String(id || "").toLowerCase();
  return ALIAS[key] || key;
};

export function evolutionProfile(pOrId, evoOverride) {
  const id = CANON(typeof pOrId === "string" ? pOrId : pOrId?.id);
  const evo = Math.max(0, Math.min(4, Math.round(Number(
    evoOverride ?? (typeof pOrId === "object" ? pOrId?.evo : 0)
  ) || 0)));
  const stage = EVOLUTION_STAGES[evo];
  const style = CHARACTER_STYLES[id] || CHARACTER_STYLES.kilo;
  return Object.freeze({
    ...stage,
    id,
    evo,
    kind: style.kind,
    characterLean: style.lean,
    characterHead: style.head,
    swing: style.swing,
    float: style.float,
  });
}

export function evolutionKey(id, evo = 0) {
  const p = evolutionProfile(id, evo);
  return p.id + ":e" + p.evo + ":" + p.kind + ":" + p.name;
}

export const EVOLUTION_SIGNATURES = Object.freeze(
  IDS.flatMap((id) => EVOLUTION_STAGES.map((stage) => evolutionKey(id, stage.id)))
);

export function applyEvolutionPose(pose, p) {
  if (!pose) return pose;
  const e = evolutionProfile(p, pose.form);
  const phase = Number(pose.t) || 0;
  const pulse = Math.sin(phase * 0.028 * e.pulse);
  const state = pose.state || "idle";
  const active = state === "run" || state === "attack" || state === "cast" || state === "jump" || state === "fall" || state === "glide";
  const combat = state === "attack" || state === "cast";

  const out = { ...pose };
  out.evolution = e;
  out.evolutionSignature = evolutionKey(e.id, e.evo);
  out.evolutionScaleX = e.scaleX;
  out.evolutionScaleY = e.scaleY;
  out.evolutionPulse = pulse;

  const body = active ? 1 : 0.62;
  out.bodyTilt = Number(out.bodyTilt || 0) + e.characterLean * e.lean * (0.70 + body * 0.30);
  out.headTilt = Number(out.headTilt || 0) + e.characterHead * e.head * (0.70 + pulse * 0.30);
  out.armSwing = Number(out.armSwing || 0) * e.arms * e.swing;
  out.legSwing = Number(out.legSwing || 0) * e.legs * e.swing;
  out.sway = Number(out.sway || 0) * e.sway;
  out.bounce = Number(out.bounce || 0) * e.bounce;

  if (pose.air) {
    out.stretch = Number(out.stretch || 0) + pulse * e.float * 0.08;
  }
  if (pose.land) {
    out.squash = Number(out.squash || 0) + Math.max(0, Number(pose.land) || 0) * (0.012 + e.evo * 0.004);
  }
  if (combat) {
    out.anticipation = Number(out.anticipation || 0) * (1 + e.evo * 0.035);
    out.impact = Number(out.impact || 0) * (1 + e.evo * 0.055);
  }

  return out;
}

function drawGlyph(ctx, kind, x, y, s, color, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.1, s * 0.12);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  switch (kind) {
    case "petal":
      ctx.ellipse(0, 0, s * 0.32, s * 0.62, -0.45, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "stitch":
      ctx.moveTo(-s * 0.52, -s * 0.18);
      ctx.lineTo(s * 0.52, s * 0.18);
      ctx.stroke();
      break;
    case "bolt":
      ctx.moveTo(-s * 0.25, -s * 0.62);
      ctx.lineTo(s * 0.10, -s * 0.06);
      ctx.lineTo(-s * 0.12, -s * 0.02);
      ctx.lineTo(s * 0.30, s * 0.62);
      ctx.lineTo(s * 0.10, s * 0.08);
      ctx.lineTo(s * 0.28, s * 0.04);
      ctx.closePath();
      ctx.fill();
      break;
    case "star":
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + i * Math.PI / 5;
        const rr = i % 2 ? s * 0.34 : s;
        i ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      ctx.closePath();
      ctx.fill();
      break;
    case "flame":
      ctx.moveTo(0, -s);
      ctx.quadraticCurveTo(-s * 0.72, -s * 0.20, -s * 0.34, s * 0.72);
      ctx.quadraticCurveTo(0, s, s * 0.40, s * 0.46);
      ctx.quadraticCurveTo(s * 0.72, 0, 0, -s);
      ctx.closePath();
      ctx.fill();
      break;
    case "shard":
      ctx.moveTo(0, -s);
      ctx.lineTo(s * 0.62, 0);
      ctx.lineTo(0, s);
      ctx.lineTo(-s * 0.62, 0);
      ctx.closePath();
      ctx.fill();
      break;
    case "salt":
      ctx.fillRect(-s * 0.24, -s * 0.24, s * 0.48, s * 0.48);
      break;
    case "cheese":
      ctx.moveTo(-s * 0.82, -s * 0.40);
      ctx.lineTo(s * 0.72, -s * 0.08);
      ctx.lineTo(-s * 0.30, s * 0.72);
      ctx.closePath();
      ctx.fill();
      break;
    case "ofuda":
      ctx.fillRect(-s * 0.34, -s * 0.68, s * 0.68, s * 1.36);
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = "#fff8df";
      ctx.fillRect(-s * 0.07, -s * 0.55, s * 0.14, s * 1.10);
      break;
    case "horn":
      ctx.moveTo(-s * 0.10, s * 0.70);
      ctx.quadraticCurveTo(-s * 0.38, -s * 0.28, 0, -s * 0.85);
      ctx.quadraticCurveTo(s * 0.38, -s * 0.28, s * 0.10, s * 0.70);
      ctx.closePath();
      ctx.fill();
      break;
  }
  ctx.restore();
}

export function drawEvolutionSignatureFX(ctx, p, H, pose, t) {
  const e = evolutionProfile(p, pose?.form);
  const active = Math.max(
    Number(pose?.speed) || 0,
    Number(pose?.cast) || 0,
    Number(pose?.atk) || 0,
    p?.dash > 0 ? Math.min(1, p.dash / 12) : 0,
    Number(pose?.land) || 0
  );
  const stage = e.evo;
  if (active < 0.06 && stage < 2) return;

  const color = p?.color || "#fff6c8";
  const pulse = 1 + Math.sin((Number(t) || 0) * 0.035 * e.pulse) * 0.08;
  const front = stage >= 2;
  const opacity = (0.10 + active * 0.26) * e.ornament;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = opacity;

  if (stage === 0) {
    for (let i = 0; i < 2; i++) {
      const a = (t * 0.025) + i * Math.PI;
      drawGlyph(ctx, e.kind, Math.cos(a) * H * 0.31, -H * 0.72 + Math.sin(a) * H * 0.10, H * 0.035, color, a);
    }
  } else if (stage === 1) {
    drawGlyph(ctx, e.kind, H * 0.27, -H * 0.77, H * 0.042, color, -0.2 + Math.sin(t * 0.04) * 0.06);
    drawGlyph(ctx, e.kind, -H * 0.27, -H * 0.77, H * 0.034, color, 0.2);
  } else if (stage === 2) {
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1.2, H * 0.014);
    ctx.beginPath();
    ctx.ellipse(0, -H * 0.60, H * 0.43 * pulse, H * 0.15, e.characterLean * 2.2, Math.PI * 0.12, Math.PI * 0.88);
    ctx.stroke();
    drawGlyph(ctx, e.kind, H * 0.34, -H * 0.74, H * 0.055, color, t * 0.035);
  } else if (stage === 3) {
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1.5, H * 0.020);
    for (let i = 0; i < 3; i++) {
      const x = (i - 1) * H * 0.18;
      ctx.beginPath();
      ctx.moveTo(x, -H * 0.80);
      ctx.lineTo(x + e.characterLean * H * 0.18, -H * (0.98 + (i % 2) * 0.06));
      ctx.stroke();
    }
    ctx.globalAlpha *= 0.82;
    ctx.beginPath();
    ctx.ellipse(0, -H * 0.54, H * 0.50 * pulse, H * 0.18, 0, 0, Math.PI * 2);
    ctx.stroke();
    drawGlyph(ctx, e.kind, H * 0.40, -H * 0.80, H * 0.065, color, t * 0.04);
  } else {
    ctx.globalAlpha *= 1.25;
    ctx.strokeStyle = "#fff8d6";
    ctx.lineWidth = Math.max(1.6, H * 0.022);
    ctx.beginPath();
    ctx.ellipse(0, -H * 0.67, H * 0.54 * pulse, H * 0.20, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha *= 0.72;
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * 2 * i) / 6 + t * 0.018;
      drawGlyph(ctx, e.kind, Math.cos(a) * H * 0.46, -H * 0.67 + Math.sin(a) * H * 0.20, H * 0.048, color, a);
    }
  }

  if (front && pose?.state === "attack" && (pose?.impact || 0) > 0.08) {
    const k = Math.min(1, pose.impact || 0);
    ctx.globalAlpha = Math.min(0.72, opacity * (1.5 + e.evo * 0.12));
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1.2, H * (0.010 + e.evo * 0.002));
    for (let i = 0; i < 2 + e.evo; i++) {
      const y = -H * (0.34 + i * 0.10);
      ctx.beginPath();
      ctx.moveTo(H * 0.10, y);
      ctx.lineTo(H * (0.28 + e.evo * 0.06) * k, y - H * 0.04);
      ctx.stroke();
    }
  }

  ctx.restore();
}

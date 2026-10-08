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
    id: 0, name: "baby", scaleX: 0.74, scaleY: 0.78,
    sway: 1.05, bounce: 1.28, lean: 0.42, head: 1.08,
    arms: 0.78, legs: 0.82, air: 0.74, pulse: 0.72,
    ornament: 0.42,
  }),
  Object.freeze({
    id: 1, name: "base", scaleX: 1.00, scaleY: 1.00,
    sway: 1.00, bounce: 1.00, lean: 0.92, head: 1.00,
    arms: 1.00, legs: 1.00, air: 1.00, pulse: 1.00,
    ornament: 0.78,
  }),
  Object.freeze({
    id: 2, name: "awakened", scaleX: 1.16, scaleY: 1.14,
    sway: 1.12, bounce: 0.90, lean: 1.22, head: 1.12,
    arms: 1.16, legs: 1.12, air: 1.16, pulse: 1.28,
    ornament: 1.05,
  }),
  Object.freeze({
    id: 3, name: "ascended", scaleX: 1.32, scaleY: 1.26,
    sway: 1.22, bounce: 0.82, lean: 1.42, head: 1.22,
    arms: 1.28, legs: 1.20, air: 1.28, pulse: 1.52,
    ornament: 1.28,
  }),
  Object.freeze({
    id: 4, name: "final", scaleX: 1.52, scaleY: 1.40,
    sway: 1.34, bounce: 0.70, lean: 1.68, head: 1.36,
    arms: 1.42, legs: 1.30, air: 1.46, pulse: 1.85,
    ornament: 1.62,
  }),
]);



export const EVOLUTION_COMBAT_STAGES = Object.freeze([
  Object.freeze({ id: 0, attack: 0.72, cast: 0.74, impact: 0.68, trail: 0.55, glow: 0.48, density: 0.62, snap: 0.78 }),
  Object.freeze({ id: 1, attack: 1.00, cast: 1.00, impact: 1.00, trail: 0.92, glow: 0.86, density: 0.92, snap: 1.00 }),
  Object.freeze({ id: 2, attack: 1.22, cast: 1.28, impact: 1.24, trail: 1.22, glow: 1.18, density: 1.16, snap: 1.16 }),
  Object.freeze({ id: 3, attack: 1.46, cast: 1.52, impact: 1.48, trail: 1.50, glow: 1.46, density: 1.38, snap: 1.32 }),
  Object.freeze({ id: 4, attack: 1.78, cast: 1.86, impact: 1.72, trail: 1.84, glow: 1.92, density: 1.66, snap: 1.48 }),
]);

export const EVOLUTION_FINAL_DESIGNS = Object.freeze({
  kilo:    Object.freeze({ motif: "petal",    silhouette: "crown",    span: 0.98, spin: 0.30, nodes: 7, accent: "#ffd36a", profile: "garden-crown" }),
  stitcho: Object.freeze({ motif: "seam",     silhouette: "cape",     span: 1.02, spin: -0.28, nodes: 6, accent: "#67ddff", profile: "nebula-cape" }),
  chispin: Object.freeze({ motif: "bolt",     silhouette: "mane",     span: 1.00, spin: 0.16, nodes: 8, accent: "#fff29a", profile: "storm-mane" }),
  cat:     Object.freeze({ motif: "eclipse",  silhouette: "crescent", span: 0.94, spin: 0.22, nodes: 7, accent: "#ffb8e8", profile: "eclipse-collar" }),
  dragon:  Object.freeze({ motif: "flame",    silhouette: "wing",     span: 1.16, spin: -0.14, nodes: 6, accent: "#ff8a45", profile: "solar-wing" }),
  dino:    Object.freeze({ motif: "crystal",  silhouette: "back",     span: 1.10, spin: 0.08, nodes: 8, accent: "#b8ef6b", profile: "crystal-spine" }),
  frita:   Object.freeze({ motif: "fries",    silhouette: "crest",    span: 1.04, spin: -0.20, nodes: 8, accent: "#fff1b3", profile: "crisp-crest" }),
  pizza:   Object.freeze({ motif: "crust",    silhouette: "ring",     span: 1.10, spin: 0.10, nodes: 7, accent: "#ffd84a", profile: "volcanic-ring" }),
  yomi:    Object.freeze({ motif: "maw",      silhouette: "mantle",   span: 1.04, spin: 0.00, nodes: 6, accent: "#ff5b78", profile: "devourer-mantle" }),
  cuerno:  Object.freeze({ motif: "aurora",   silhouette: "antler",     span: 1.12, spin: 0.18, nodes: 8, accent: "#f2c1ff", profile: "aurora-mane" }),
});
export const EVOLUTION_CINEMA_PROFILES = Object.freeze({
  kilo:    Object.freeze({ camera:"orbit",   bg:"#2b160f", accent:"#ffd36a", motif:"petals",  pulse:"bloom",   reveal:"sunrise", speed:1.00 }),
  stitcho: Object.freeze({ camera:"spiral",  bg:"#100d2b", accent:"#8f7bff", motif:"seams",   pulse:"nebula",  reveal:"rift",    speed:1.12 }),
  chispin:Object.freeze({ camera:"snap",     bg:"#09132f", accent:"#ffe14a", motif:"bolts",   pulse:"storm",   reveal:"strike",  speed:1.22 }),
  cat:     Object.freeze({ camera:"eclipse",  bg:"#120b27", accent:"#ffb6e4", motif:"moons",   pulse:"eclipse", reveal:"crescent",speed:0.92 }),
  dragon:  Object.freeze({ camera:"sweep",    bg:"#2a1007", accent:"#ff8a45", motif:"embers",  pulse:"flame",   reveal:"nova",    speed:1.08 }),
  dino:    Object.freeze({ camera:"impact",   bg:"#10220d", accent:"#b8ef6b", motif:"shards",  pulse:"quake",   reveal:"impact",  speed:0.94 }),
  frita:   Object.freeze({ camera:"whip",     bg:"#24170b", accent:"#fff1b3", motif:"salt",    pulse:"crisp",   reveal:"fry",     speed:1.18 }),
  pizza:   Object.freeze({ camera:"roll",     bg:"#281007", accent:"#ffd84a", motif:"cheese",  pulse:"oven",    reveal:"volcano", speed:0.92 }),
  yomi:    Object.freeze({ camera:"pull",     bg:"#170510", accent:"#ff2244", motif:"ofuda",   pulse:"maw",     reveal:"devour",  speed:0.82 }),
  cuerno:  Object.freeze({ camera:"rise",     bg:"#17102a", accent:"#f2c1ff", motif:"aurora",  pulse:"rainbow", reveal:"aurora",  speed:1.02 }),
});

export const EVOLUTION_STAGE_COPY = Object.freeze([
  Object.freeze({ kicker: "DESPERTAR", label: "Forma 1", tone: "Nace una nueva lectura del héroe." }),
  Object.freeze({ kicker: "EVOLUCIÓN", label: "Forma 2", tone: "El personaje ya no se mueve igual." }),
  Object.freeze({ kicker: "DESPERTAR", label: "Forma 3", tone: "La firma del personaje empieza a imponerse." }),
  Object.freeze({ kicker: "ASCENSO", label: "Forma 4", tone: "La silueta y el combate entran en otra liga." }),
  Object.freeze({ kicker: "FORMA FIRMA", label: "Forma 5", tone: "Esta es la identidad definitiva del personaje." }),
]);

export const EVOLUTION_MESSAGES = Object.freeze({
  kilo: [
    "El jardín despierta.",
    "Ohana responde al ritmo.",
    "Las raíces ya no pueden contenerlo.",
    "La flor solar abre su corona.",
  ],
  stitcho: [
    "Una costura se abre donde no debería.",
    "Stitcho descubre que las paredes también tienen cremallera.",
    "El Experimento Ñam aprende a doblar la habitación.",
    "Stitcho Nébula cose el vacío y se ríe al otro lado.",
  ],
  chispin: [
    "Descubre que su cola de muelle puede atrapar un rayo.",
    "Cada salto deja una firma de luz violeta.",
    "Aprende a dirigir nubes y relámpagos sin perder su sonrisa.",
    "La corona aurora despierta: Chispín ya no persigue la tormenta, la dirige.",
  ],
  cat: [
    "La sombra aprende a sonreír.",
    "La luna despierta bajo el pelaje.",
    "El eclipse empieza a cerrarse.",
    "Nueve vidas. Una sola silueta.",
  ],
  dragon: [
    "El fuego aprende a volar.",
    "Las alas encuentran su propio cielo.",
    "La llama toma forma de leyenda.",
    "El cielo acaba de ganar un dragón.",
  ],
  dino: [
    "El pequeño rugido se hace grande.",
    "La tierra empieza a sentir cada paso.",
    "El cuerpo pide espacio.",
    "Cuando pisa, la sala escucha.",
  ],
  frita: [
    "La sal empieza a chispear.",
    "El crujido se vuelve velocidad.",
    "La freidora alcanza temperatura de combate.",
    "Crujiente, rápida y peligrosamente dorada.",
  ],
  pizza: [
    "El queso empieza a estirarse.",
    "La masa entra en calor.",
    "El horno ya no puede contenerla.",
    "El volcán acaba de salir del horno.",
  ],
  yomi: [
    "El farol mira hacia el otro lado.",
    "La grieta empieza a respirar.",
    "Algo enorme mira desde dentro.",
    "La luna tiene una nueva razón para temer.",
  ],
  cuerno: [
    "El brillo encuentra un color.",
    "El arcoíris empieza a galopar.",
    "Las estrellas siguen la punta del cuerno.",
    "La aurora ya tiene dueño.",
  ],
});

export function evolutionMessage(id, evo) {
  const key = CANON(id);
  const stage = Math.max(1, Math.min(4, Math.round(Number(evo) || 1)));
  const copy = EVOLUTION_STAGE_COPY[stage] || EVOLUTION_STAGE_COPY[4];
  const lines = EVOLUTION_MESSAGES[key] || EVOLUTION_MESSAGES.kilo;
  return Object.freeze({
    ...copy,
    line: lines[stage - 1] || lines[lines.length - 1],
    stage,
  });
}

// Perfil anatómico visual por personaje.
// No altera la hitbox: solo modifica la lectura del cuerpo ya dibujado por cada art.
export const EVOLUTION_FORM_PROFILES = Object.freeze({
  kilo:    Object.freeze({ bodyX:[0.90,0.98,1.04,1.10,1.16], bodyY:[0.92,1.00,1.08,1.16,1.22], stance:[-0.015,0.00,0.035,0.060,0.085], lift:[0.00,0.00,0.006,0.010,0.016], combat:[0.86,0.98,1.08,1.18,1.30] }),
  stitcho: Object.freeze({ bodyX:[0.88,0.96,1.00,1.05,1.10], bodyY:[0.90,1.00,1.10,1.18,1.27], stance:[0.025,0.035,0.075,0.115,0.15], lift:[0.00,0.00,0.008,0.014,0.022], combat:[0.90,1.02,1.12,1.24,1.38] }),
  chispin:Object.freeze({ bodyX:[0.90,0.96,1.00,1.07,1.12], bodyY:[0.90,1.00,1.07,1.15,1.23], stance:[0.050,0.065,0.105,0.15,0.19], lift:[0.00,0.00,0.00,0.006,0.012], combat:[0.92,1.05,1.18,1.30,1.44] }),
  cat:     Object.freeze({ bodyX:[0.98,1.02,1.08,1.14,1.20], bodyY:[0.88,0.96,1.04,1.12,1.18], stance:[-0.015,-0.010,0.020,0.040,0.060], lift:[0.00,0.010,0.016,0.024,0.036], combat:[0.84,0.94,1.05,1.16,1.28] }),
  dragon:  Object.freeze({ bodyX:[0.86,0.94,1.00,1.08,1.15], bodyY:[0.92,1.03,1.12,1.22,1.32], stance:[0.020,0.025,0.055,0.085,0.12], lift:[0.00,0.00,0.010,0.022,0.038], combat:[0.90,1.04,1.16,1.30,1.46] }),
  dino:    Object.freeze({ bodyX:[0.94,1.00,1.08,1.15,1.23], bodyY:[0.96,1.04,1.10,1.18,1.27], stance:[0.055,0.065,0.090,0.12,0.15], lift:[0.00,0.00,0.00,0.004,0.008], combat:[0.96,1.08,1.20,1.34,1.50] }),
  frita:   Object.freeze({ bodyX:[0.78,0.88,0.94,1.00,1.08], bodyY:[0.94,1.04,1.13,1.23,1.33], stance:[0.035,0.045,0.075,0.11,0.145], lift:[0.00,0.00,0.004,0.010,0.018], combat:[0.90,1.04,1.16,1.30,1.44] }),
  pizza:   Object.freeze({ bodyX:[0.98,1.04,1.10,1.20,1.27], bodyY:[0.94,1.00,1.06,1.12,1.18], stance:[-0.035,-0.025,0.00,0.025,0.045], lift:[0.00,0.00,0.004,0.008,0.014], combat:[0.88,0.98,1.08,1.20,1.34] }),
  yomi:    Object.freeze({ bodyX:[0.90,0.96,1.00,1.05,1.11], bodyY:[0.98,1.05,1.13,1.22,1.31], stance:[0.00,0.010,0.030,0.060,0.090], lift:[0.014,0.020,0.028,0.036,0.048], combat:[0.90,1.02,1.14,1.28,1.42] }),
  cuerno:  Object.freeze({ bodyX:[0.92,1.00,1.05,1.11,1.18], bodyY:[0.90,0.98,1.06,1.14,1.23], stance:[-0.020,-0.015,0.010,0.040,0.070], lift:[0.008,0.010,0.016,0.024,0.034], combat:[0.86,0.98,1.08,1.20,1.34] }),
});

function formVisualProfile(id, evo) {
  const key = CANON(id);
  const profile = EVOLUTION_FORM_PROFILES[key] || EVOLUTION_FORM_PROFILES.kilo;
  const i = Math.max(0, Math.min(4, evo | 0));
  return Object.freeze({
    bodyX: profile.bodyX[i],
    bodyY: profile.bodyY[i],
    stance: profile.stance[i],
    lift: profile.lift[i],
    combat: profile.combat[i],
  });
}

const CHARACTER_STYLES = Object.freeze({
  kilo:    Object.freeze({ kind: "petal", lean: -0.030, head: 0.020, swing: 1.08, float: 0.08, combat: 0.92 }),
  stitcho: Object.freeze({ kind: "stitch", lean:  0.040, head: -0.018, swing: 1.15, float: 0.02, combat: 1.10 }),
  chispin: Object.freeze({ kind: "bolt",  lean:  0.075, head: -0.028, swing: 1.25, float: 0.00, combat: 1.18 }),
  cat:     Object.freeze({ kind: "star",  lean: -0.018, head: 0.036, swing: 0.96, float: 0.10, combat: 0.88 }),
  dragon:  Object.freeze({ kind: "flame", lean:  0.020, head: -0.040, swing: 0.92, float: 0.18, combat: 1.14 }),
  dino:    Object.freeze({ kind: "shard", lean:  0.090, head: -0.050, swing: 0.78, float: -0.04, combat: 1.24 }),
  frita:   Object.freeze({ kind: "salt",  lean:  0.065, head: -0.022, swing: 1.12, float: 0.00, combat: 1.06 }),
  pizza:   Object.freeze({ kind: "cheese",lean: -0.055, head: 0.020, swing: 0.84, float: 0.06, combat: 1.02 }),
  yomi:    Object.freeze({ kind: "ofuda", lean:  0.012, head: 0.065, swing: 0.72, float: 0.22, combat: 1.12 }),
  cuerno:  Object.freeze({ kind: "horn",  lean: -0.030, head: -0.030, swing: 1.02, float: 0.14, combat: 0.98 }),
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
  const combatStage = EVOLUTION_COMBAT_STAGES[evo];
  const style = CHARACTER_STYLES[id] || CHARACTER_STYLES.kilo;
  const finalDesign = EVOLUTION_FINAL_DESIGNS[id] || EVOLUTION_FINAL_DESIGNS.kilo;
  return Object.freeze({
    ...stage,
    id,
    evo,
    kind: style.kind,
    characterLean: style.lean,
    characterHead: style.head,
    swing: style.swing,
    float: style.float,
    combatCharacter: style.combat,
    finalDesign,
    visual: formVisualProfile(id, evo),
    combat: Object.freeze({
      attack: combatStage.attack * style.combat,
      cast: combatStage.cast * style.combat,
      impact: combatStage.impact * style.combat,
      trail: combatStage.trail * style.combat,
      glow: combatStage.glow * style.combat * formVisualProfile(id, evo).combat,
      density: combatStage.density,
      snap: combatStage.snap,
    }),
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
  out.evolutionCombat = e.combat;
  out.evolutionVisual = e.visual;

  const body = active ? 1 : 0.62;
  out.bodyTilt = Number(out.bodyTilt || 0) + e.characterLean * e.lean * (0.70 + body * 0.30);
  out.headTilt = Number(out.headTilt || 0) + e.characterHead * e.head * (0.70 + pulse * 0.30);
  out.armSwing = Number(out.armSwing || 0) * e.arms * e.swing;
  out.legSwing = Number(out.legSwing || 0) * e.legs * e.swing;
  out.sway = Number(out.sway || 0) * e.sway;
  out.bounce = Number(out.bounce || 0) * e.bounce;
  out.bodyWidth = e.visual.bodyX;
  out.bodyHeight = e.visual.bodyY;
  out.formStance = e.visual.stance;
  out.formLift = e.visual.lift;

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

export function drawEvolutionSilhouetteFX(ctx, p, H, pose, t, front = false) {
  const e = evolutionProfile(p, pose?.form);
  const stage = e.evo;
  if (stage < 0) return;

  const d = e.finalDesign;
  const color = p?.color || d.accent || "#fff6c8";
  const hot = d.accent || color;
  const k = [0.34, 0.52, 0.72, 0.88, 1][stage] || 1;
  const pulse = 1 + Math.sin((Number(t) || 0) * 0.028 * e.pulse) * 0.035;
  const S = H * d.span * k;

  ctx.save();
  ctx.globalCompositeOperation = front ? "source-over" : "lighter";
  ctx.globalAlpha = (front ? 0.88 : 0.74) * (0.55 + k);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  const fill = front ? withAlpha(color, 0.16 + stage * 0.025) : withAlpha(color, 0.12 + stage * 0.02);
  const stroke = hot;

  switch (d.silhouette) {
    case "crown":
      ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = Math.max(1.5, H * 0.018);
      ctx.beginPath();
      ctx.moveTo(-S*0.48,-H*0.58); ctx.lineTo(-S*0.34,-H*0.92); ctx.lineTo(-S*0.10,-H*0.66);
      ctx.lineTo(0,-H*1.02); ctx.lineTo(S*0.10,-H*0.66); ctx.lineTo(S*0.34,-H*0.92);
      ctx.lineTo(S*0.48,-H*0.58); ctx.closePath(); ctx.fill(); ctx.stroke();
      break;
    case "cape":
      ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = Math.max(1.4, H * 0.016);
      ctx.beginPath();
      ctx.moveTo(-S*0.30,-H*0.34);
      ctx.quadraticCurveTo(-S*0.62,-H*0.05,-S*0.54,H*0.03);
      ctx.quadraticCurveTo(0,-H*0.16,S*0.54,H*0.03);
      ctx.quadraticCurveTo(S*0.62,-H*0.05,S*0.30,-H*0.34);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      for(let i=-2;i<=2;i++){ ctx.beginPath(); ctx.moveTo(i*S*0.16,-H*0.28); ctx.lineTo(i*S*0.22,H*0.02); ctx.stroke(); }
      break;
    case "mane":
      ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = Math.max(1.3, H * 0.015);
      for(let i=0;i<9;i++){
        const a=-1.15+i*0.287;
        const x=Math.cos(a)*S*0.46, y=-H*0.56+Math.sin(a)*H*0.24;
        ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+Math.cos(a)*H*0.20,y+Math.sin(a)*H*0.20); ctx.lineTo(x+Math.cos(a)*H*0.05,y+Math.sin(a)*H*0.31); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      break;
    case "crescent":
      ctx.strokeStyle = stroke; ctx.lineWidth = Math.max(2, H * 0.035);
      ctx.beginPath(); ctx.arc(0,-H*0.43,S*0.55,-1.05,1.05); ctx.stroke();
      ctx.globalAlpha *= 0.55;
      ctx.beginPath(); ctx.arc(0,-H*0.43,S*0.40,1.95,4.30); ctx.stroke();
      break;
    case "wing":
      ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = Math.max(1.5, H * 0.018);
      for(const side of [-1,1]){
        ctx.beginPath();
        ctx.moveTo(side*S*0.20,-H*0.30);
        ctx.quadraticCurveTo(side*S*0.78,-H*0.72,side*S*0.72,-H*0.05);
        ctx.quadraticCurveTo(side*S*0.50,H*0.02,side*S*0.18,H*0.05);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(side*S*(0.30+i*0.12),-H*0.28);ctx.lineTo(side*S*(0.58+i*0.10),-H*(0.46-i*0.05));ctx.stroke();}
      }
      break;
    case "back":
      ctx.fillStyle=fill; ctx.strokeStyle=stroke; ctx.lineWidth=Math.max(1.4,H*0.017);
      for(let i=0;i<7;i++){
        const x=(i-3)*H*0.12, hh=H*(0.12+(i%3)*0.055);
        ctx.beginPath();ctx.moveTo(x-H*0.06,-H*0.10);ctx.lineTo(x,-H*(0.28+hh));ctx.lineTo(x+H*0.06,-H*0.10);ctx.closePath();ctx.fill();ctx.stroke();
      }
      break;
    case "crest":
      ctx.fillStyle=fill;ctx.strokeStyle=stroke;ctx.lineWidth=Math.max(1.3,H*0.015);
      for(let i=0;i<7;i++){
        const x=(i-3)*H*0.105, h=H*(0.18+(i%2)*0.07);
        ctx.beginPath();ctx.rect(x-H*0.028,-H*(0.42+h),H*0.056,h);ctx.fill();ctx.stroke();
      }
      break;
    case "ring":
      ctx.strokeStyle=stroke;ctx.lineWidth=Math.max(2,H*0.026);
      ctx.beginPath();ctx.ellipse(0,-H*0.40,S*0.60,S*0.20,0.12*Math.sin((Number(t)||0)*0.03),0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha*=0.45;ctx.lineWidth*=0.45;
      ctx.beginPath();ctx.ellipse(0,-H*0.40,S*0.46,S*0.14,-0.16*Math.sin((Number(t)||0)*0.03),0,Math.PI*2);ctx.stroke();
      break;
    case "antler":
      ctx.strokeStyle=stroke; ctx.lineWidth=Math.max(1.6,H*0.020);
      for (const side of [-1,1]) {
        ctx.beginPath();
        ctx.moveTo(side*S*0.08,-H*0.38);
        ctx.quadraticCurveTo(side*S*0.34,-H*0.72,side*S*0.42,-H*0.98);
        ctx.quadraticCurveTo(side*S*0.30,-H*0.80,side*S*0.18,-H*0.72);
        ctx.moveTo(side*S*0.28,-H*0.72); ctx.lineTo(side*S*0.52,-H*0.82);
        ctx.moveTo(side*S*0.34,-H*0.64); ctx.lineTo(side*S*0.56,-H*0.58);
        ctx.stroke();
      }
      break;
    case "mantle":
      ctx.fillStyle=fill;ctx.strokeStyle=stroke;ctx.lineWidth=Math.max(1.4,H*0.017);
      ctx.beginPath();ctx.moveTo(-S*0.38,-H*0.30);ctx.quadraticCurveTo(-S*0.72,-H*0.12,-S*0.42,H*0.10);ctx.quadraticCurveTo(0,H*0.25,S*0.42,H*0.10);ctx.quadraticCurveTo(S*0.72,-H*0.12,S*0.38,-H*0.30);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.globalAlpha*=0.55;
      for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(i*S*0.12,-H*0.20);ctx.lineTo(i*S*0.16,H*0.04);ctx.stroke();}
      break;
  }

  if (d.silhouette === "mane" && stage >= 4) {
    ctx.strokeStyle = hot; ctx.lineWidth = Math.max(1.4,H*0.017);
    for(let side of [-1,1]){
      ctx.beginPath();
      ctx.moveTo(side*S*0.12,-H*0.55);
      ctx.quadraticCurveTo(side*S*0.65,-H*0.95,side*S*0.52,-H*0.28);
      ctx.stroke();
    }
  }

  if (stage >= 3 && !front) {
    ctx.globalAlpha *= 0.48;
    ctx.strokeStyle = hot;
    ctx.lineWidth = Math.max(1,H*0.012);
    ctx.beginPath();ctx.ellipse(0,-H*0.28,S*0.62,S*0.11,0,0,Math.PI*2);ctx.stroke();
  }
  ctx.restore();
}

function withAlpha(color, a) {
  let h=String(color||"#ffffff").trim();
  if(/^#[0-9a-f]{3}$/i.test(h)) h="#"+h[1]+h[1]+h[2]+h[2]+h[3]+h[3];
  if(!/^#[0-9a-f]{6}$/i.test(h)) return "rgba(255,255,255,"+a+")";
  const n=parseInt(h.slice(1),16);
  return "rgba("+(n>>16)+","+((n>>8)&255)+","+(n&255)+","+a+")";
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
  if (active < 0.06) return;

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


export function drawEvolutionCombatFX(ctx, p, H, pose, t) {
  const e = evolutionProfile(p, pose?.form);
  if (pose?.state !== "attack" && pose?.state !== "cast") return;
  const impact = Math.max(0, Math.min(1, Number(pose?.impact) || 0));
  const atk = Math.max(0, Math.min(1, Number(pose?.atk) || 0));
  const k = Math.max(impact, atk * 0.55);
  if (k < 0.08) return;

  const d = e.finalDesign;
  const color = d.accent || p?.color || "#fff6c8";
  const reach = H * (0.34 + e.evo * 0.08) * (0.8 + e.combat.impact * 0.2);
  ctx.save();
  ctx.globalCompositeOperation="lighter";
  ctx.globalAlpha=Math.min(0.9, k * (0.28 + e.evo * 0.08));
  ctx.strokeStyle=color;
  ctx.lineCap="round";
  ctx.lineWidth=Math.max(2.4,H*(0.028+e.evo*0.008));

  const f=p?.facing||1;
  if(d.motif==="bolt"){
    for(let i=0;i<3+e.evo;i++){
      ctx.beginPath();ctx.moveTo(f*H*0.05,-H*(0.52-i*0.09));ctx.lineTo(f*(H*0.20+reach),-H*(0.48-i*0.10));ctx.stroke();
    }
  } else if(d.motif==="flame" || d.motif==="ember"){
    for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(f*H*0.18,-H*0.46,reach*(0.55+i*0.16),-0.9+i*0.15,0.9-i*0.15);ctx.stroke();}
  } else if(d.motif==="crystal"){
    for(let i=0;i<3+e.evo;i++){const x=f*(H*0.14+i*H*0.06);ctx.beginPath();ctx.moveTo(x,-H*0.44);ctx.lineTo(x+f*H*0.10,-H*(0.62-i*0.035));ctx.lineTo(x+f*H*0.17,-H*0.42);ctx.stroke();}
  } else if(d.motif==="maw"){
    ctx.beginPath();ctx.arc(f*H*0.20,-H*0.48,reach*0.78,-0.75,0.75);ctx.stroke();
    ctx.beginPath();ctx.moveTo(f*H*0.34,-H*0.55);ctx.lineTo(f*(H*0.34+reach*0.35),-H*0.62);ctx.moveTo(f*H*0.34,-H*0.41);ctx.lineTo(f*(H*0.34+reach*0.35),-H*0.34);ctx.stroke();
  } else if(d.motif==="fries" || d.motif==="salt"){
    for(let i=0;i<5;i++){const x=f*(H*0.10+i*H*0.07);ctx.beginPath();ctx.moveTo(x,-H*0.42);ctx.lineTo(x+f*H*0.10,-H*(0.66+(i%2)*0.08));ctx.stroke();}
  } else {
    for(let i=0;i<3+e.evo;i++){const a=-0.72+i*(1.44/(2+e.evo));ctx.beginPath();ctx.arc(f*H*0.18,-H*0.48,reach*(0.55+i*0.10),a,a+0.24);ctx.stroke();}
  }

  if(impact>0.22){
    ctx.globalAlpha*=0.7;
    ctx.strokeStyle="#fffdf0";
    ctx.beginPath();ctx.arc(f*(H*0.18+reach*0.9),-H*0.48,H*(0.06+impact*0.10),0,Math.PI*2);ctx.stroke();
  }
  ctx.restore();
}

/**
 * FX específico de la cinemática de evolución.
 * Solo presentación: no modifica estado, daño, hitboxes ni física.
 * Cada etapa conserva el glyph del héroe pero cambia su escala, órbita,
 * densidad y geometría para que el salto de forma se lea incluso como silueta.
 */
export function drawEvolutionCinemaFX(ctx, id, evo, cx, cy, H, t, color, strength = 1) {
  const e = evolutionProfile(id, evo);
  const stage = e.evo;
  const base = Math.max(1, H);
  const pulse = 1 + Math.sin((Number(t) || 0) * 0.045 * e.pulse) * 0.08;
  const power = Math.max(0, Math.min(1.35, Number(strength) || 0));
  if (power <= 0.01) return;

  const main = stage >= 4 ? "#ffd84a" : color || "#fff6c8";
  const hot = stage >= 4 ? "#fff4b5" : main;
  const orbit = base * (0.48 + stage * 0.045);
  const y = cy - base * 0.02;

  ctx.save();
  ctx.translate(cx, y);
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = power * (0.24 + stage * 0.075);

  if (stage === 0) {
    for (let i = 0; i < 2; i++) {
      const a = (Number(t) || 0) * 0.024 + i * Math.PI;
      const r = orbit * 0.58;
      drawGlyph(ctx, e.kind, Math.cos(a) * r, -base * 0.70 + Math.sin(a) * base * 0.08, base * 0.035, main, a);
    }
  } else if (stage === 1) {
    const drift = Math.sin((Number(t) || 0) * 0.04) * base * 0.025;
    drawGlyph(ctx, e.kind, -orbit * 0.52, -base * 0.72 + drift, base * 0.042, main, -0.24);
    drawGlyph(ctx, e.kind, orbit * 0.52, -base * 0.72 - drift, base * 0.042, hot, 0.24);

    ctx.strokeStyle = main;
    ctx.lineWidth = Math.max(1.4, base * 0.010);
    ctx.beginPath();
    ctx.ellipse(0, -base * 0.58, orbit * 0.92 * pulse, base * 0.12, 0, Math.PI * 0.16, Math.PI * 0.84);
    ctx.stroke();
  } else if (stage === 2) {
    ctx.strokeStyle = main;
    ctx.lineWidth = Math.max(1.6, base * 0.014);
    ctx.beginPath();
    ctx.ellipse(0, -base * 0.58, orbit * 1.05 * pulse, base * 0.16, e.characterLean * 1.8, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 3; i++) {
      const a = (Number(t) || 0) * (0.018 + i * 0.004) + i * (Math.PI * 2 / 3);
      const r = orbit * (0.80 + i * 0.10);
      drawGlyph(ctx, e.kind, Math.cos(a) * r, -base * 0.58 + Math.sin(a) * base * 0.16, base * (0.040 + i * 0.006), i === 1 ? hot : main, a);
    }
  } else if (stage === 3) {
    ctx.strokeStyle = main;
    ctx.lineWidth = Math.max(1.8, base * 0.018);

    for (let i = 0; i < 4; i++) {
      const a = -0.72 + i * 0.48 + Math.sin((Number(t) || 0) * 0.028 + i) * 0.035;
      const x0 = Math.cos(a) * orbit * 0.82;
      const y0 = -base * 0.40 + Math.sin(a) * base * 0.10;
      const x1 = Math.cos(a) * orbit * 1.22;
      const y1 = -base * (0.82 + (i % 2) * 0.10) + Math.sin(a) * base * 0.18;
      ctx.globalAlpha = power * (0.16 + i * 0.025);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }

    ctx.globalAlpha = power * 0.30;
    ctx.beginPath();
    ctx.ellipse(0, -base * 0.55, orbit * 1.20 * pulse, base * 0.20, 0, 0, Math.PI * 2);
    ctx.stroke();

    drawGlyph(ctx, e.kind, orbit * 1.10, -base * 0.78, base * 0.062, hot, (Number(t) || 0) * 0.038);
  } else {
    ctx.strokeStyle = hot;
    ctx.lineWidth = Math.max(2, base * 0.022);
    ctx.globalAlpha = power * 0.52;
    ctx.beginPath();
    ctx.ellipse(0, -base * 0.62, orbit * 1.28 * pulse, base * 0.23, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = power * 0.34;
    ctx.beginPath();
    ctx.arc(0, -base * 0.62, orbit * 0.74 * pulse, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 8; i++) {
      const a = (Number(t) || 0) * 0.020 + i * (Math.PI * 2 / 8);
      const r = orbit * (1.02 + 0.10 * Math.sin(i * 2.7));
      drawGlyph(ctx, e.kind, Math.cos(a) * r, -base * 0.62 + Math.sin(a) * base * 0.23, base * (0.045 + (i % 3) * 0.006), i % 2 ? main : hot, a);
    }

    ctx.globalAlpha = power * 0.24;
    ctx.fillStyle = hot;
    ctx.beginPath();
    ctx.arc(0, -base * 0.62, base * 0.055, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cinco marcas de progreso forman un sello visual común, con la etapa activa destacada.
  const meterR = orbit * 0.76;
  const meterY = base * 0.18;
  for (let i = 0; i < 5; i++) {
    const active = i <= stage;
    ctx.beginPath();
    ctx.arc((i - 2) * base * 0.085, meterY, base * (active && i === stage ? 0.022 : 0.014), 0, Math.PI * 2);
    ctx.globalAlpha = power * (active ? (i === stage ? 0.85 : 0.42) : 0.10);
    ctx.fillStyle = active ? (i === stage ? "#ffffff" : main) : "#ffffff";
    ctx.fill();
  }

  ctx.restore();
}


export function drawEvolutionDesignFX(ctx, p, H, pose, t, front = false) {
  const e = evolutionProfile(p, pose?.form);
  const stage = e.evo;
  if (stage < 0) return;

  const d = e.finalDesign;
  const color = p?.color || "#fff6c8";
  const hot = stage >= 4 ? "#fff7d0" : color;
  const strength = stage === 2 ? 0.34 : stage === 3 ? 0.58 : 0.86;
  const pulse = 1 + Math.sin((Number(t) || 0) * 0.032 * e.pulse) * 0.06;
  const span = H * d.span * (stage === 2 ? 0.72 : stage === 3 ? 0.88 : 1.0);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = strength * (front ? 0.68 : 0.82);
  ctx.translate(0, -H * 0.42);

  if (!front) {
    switch (d.motif) {
      case "petal":
        for (let i = 0; i < d.nodes; i++) {
          const a = (Number(t) || 0) * 0.018 + i * Math.PI * 2 / d.nodes;
          drawGlyph(ctx, "petal", Math.cos(a) * span * 0.36, Math.sin(a) * span * 0.16 - H * 0.18, H * (0.035 + stage * 0.007), i % 2 ? hot : color, a);
        }
        break;
      case "seam": {
        const tt = Number(t) || 0;
        const open = stage >= 4 ? (0.16 + (0.5 + 0.5 * Math.sin(tt * 0.028)) * 0.10) : 0.10;
        ctx.strokeStyle = hot;
        ctx.lineWidth = Math.max(1.2, H * (0.010 + stage * 0.002));
        for (let i = -2; i <= 2; i++) {
          const bx = i * H * 0.11;
          const tx = i * H * (0.16 + open) + Math.sin(tt * 0.025 + i) * H * 0.025;
          ctx.beginPath();
          ctx.moveTo(bx, -H * 0.06);
          ctx.lineTo(tx, -H * (0.46 + stage * 0.018));
          ctx.stroke();
          if (stage >= 3) {
            for (let j = 1; j <= 3; j++) {
              const u = j / 4;
              const x = bx + (tx - bx) * u;
              const y = -H * 0.06 + (-H * (0.46 + stage * 0.018) + H * 0.06) * u;
              ctx.beginPath();
              ctx.moveTo(x - H * 0.035, y - H * 0.012);
              ctx.lineTo(x, y + H * 0.010);
              ctx.lineTo(x + H * 0.035, y - H * 0.010);
              ctx.stroke();
            }
          }
        }
        if (stage >= 4) {
          ctx.save();
          ctx.globalAlpha *= 0.72;
          if (typeof ctx.createLinearGradient === "function") {
            const g = ctx.createLinearGradient(0, -H * 0.62, 0, H * 0.02);
            g.addColorStop(0, "rgba(103,221,255,0)");
            g.addColorStop(.48, "rgba(143,123,255,.28)");
            g.addColorStop(1, "rgba(240,140,255,0)");
            ctx.fillStyle = g;
          } else {
            ctx.fillStyle = "rgba(143,123,255,.18)";
          }
          ctx.beginPath();
          ctx.moveTo(-H * .18, -H * .08);
          ctx.lineTo(-H * .26, -H * .24);
          ctx.lineTo(-H * .34, -H * .43);
          ctx.lineTo(0, -H * .64);
          ctx.lineTo(H * .34, -H * .43);
          ctx.lineTo(H * .26, -H * .24);
          ctx.lineTo(H * .18, -H * .08);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
        break;
      }
      case "bolt":
        ctx.strokeStyle = hot;
        ctx.lineWidth = Math.max(1.5, H * 0.014);
        for (let i = 0; i < d.nodes; i++) {
          const x = (i - (d.nodes - 1) / 2) * H * 0.12;
          const h = span * (0.24 + (i % 3) * 0.035);
          ctx.beginPath();
          ctx.moveTo(x - H * 0.05, -H * 0.24);
          ctx.lineTo(x, -H * 0.24 - h);
          ctx.lineTo(x + H * 0.05, -H * 0.24);
          ctx.stroke();
        }
        break;
      case "eclipse":
        ctx.strokeStyle = hot;
        ctx.lineWidth = Math.max(1.3, H * 0.014);
        ctx.beginPath();
        ctx.arc(0, -H * 0.22, span * 0.46 * pulse, Math.PI * 0.18, Math.PI * 1.74);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, -H * 0.22, span * 0.62, -0.72, 0.72);
        ctx.stroke();
        break;
      case "flame":
        for (let i = 0; i < d.nodes; i++) {
          const x = (i - 2) * H * 0.20;
          const h = span * (0.22 + (i % 2) * 0.06);
          ctx.fillStyle = i % 2 ? hot : color;
          ctx.beginPath();
          ctx.moveTo(x, -H * 0.08);
          ctx.quadraticCurveTo(x - H * 0.08, -H * 0.24, x, -H * 0.24 - h);
          ctx.quadraticCurveTo(x + H * 0.08, -H * 0.24, x, -H * 0.08);
          ctx.fill();
        }
        break;
      case "crystal":
        for (let i = 0; i < d.nodes; i++) {
          const x = (i - (d.nodes - 1) / 2) * H * 0.11;
          const h = span * (0.20 + (i % 2) * 0.06);
          ctx.fillStyle = i % 2 ? hot : color;
          ctx.beginPath();
          ctx.moveTo(x, -H * 0.04);
          ctx.lineTo(x + H * 0.06, -H * 0.04 - h);
          ctx.lineTo(x, -H * 0.04 - h * 1.18);
          ctx.lineTo(x - H * 0.06, -H * 0.04 - h);
          ctx.closePath();
          ctx.fill();
        }
        break;
      case "fries":
        ctx.strokeStyle = hot;
        ctx.lineWidth = Math.max(2, H * 0.024);
        for (let i = 0; i < d.nodes; i++) {
          const x = (i - 3) * H * 0.11;
          ctx.beginPath();
          ctx.moveTo(x, -H * 0.04);
          ctx.lineTo(x + Math.sin((Number(t) || 0) * 0.02 + i) * H * 0.03, -H * (0.30 + (i % 3) * 0.06));
          ctx.stroke();
        }
        break;
      case "crust":
        ctx.strokeStyle = hot;
        ctx.lineWidth = Math.max(1.5, H * 0.018);
        ctx.beginPath();
        ctx.ellipse(0, -H * 0.17, span * 0.50 * pulse, H * 0.18, 0, Math.PI, Math.PI * 2);
        ctx.stroke();
        for (let i = 0; i < 4; i++) {
          const x = (i - 1.5) * H * 0.20;
          ctx.beginPath();
          ctx.moveTo(x, -H * 0.28);
          ctx.quadraticCurveTo(x + H * 0.08, -H * 0.48, x + H * 0.02, -H * 0.60);
          ctx.stroke();
        }
        break;
      case "maw":
        ctx.strokeStyle = hot;
        ctx.lineWidth = Math.max(1.5, H * 0.018);
        ctx.beginPath();
        ctx.arc(0, -H * 0.18, span * 0.38, 0, Math.PI * 2);
        ctx.stroke();
        for (let i = 0; i < d.nodes; i++) {
          const a = i * Math.PI * 2 / d.nodes;
          const x = Math.cos(a) * span * 0.42;
          const y = -H * 0.18 + Math.sin(a) * span * 0.28;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x * 1.12, y - H * 0.09);
          ctx.stroke();
        }
        break;
      case "aurora":
        for (let i = 0; i < 3; i++) {
          ctx.strokeStyle = ["#ff79c6","#8fdcff","#fff4a8"][i];
          ctx.lineWidth = Math.max(1.2, H * 0.012);
          ctx.beginPath();
          ctx.ellipse(0, -H * 0.20, span * (0.48 + i * 0.08), H * (0.18 + i * 0.025), d.spin * (i - 1), Math.PI * 1.04, Math.PI * 1.96);
          ctx.stroke();
        }
        break;
    }
  } else {
    // Capa frontal: emblema central + pequeños nodos. Evita tapar la cara completa.
    ctx.fillStyle = hot;
    ctx.globalAlpha *= 0.72;
    switch (d.motif) {
      case "petal":
        drawGlyph(ctx, "petal", 0, H * 0.02, H * 0.045, hot, Math.sin((Number(t) || 0) * 0.02) * 0.18);
        break;
      case "seam": {
        ctx.strokeStyle = hot; ctx.lineWidth = Math.max(1.1, H * 0.012);
        ctx.beginPath(); ctx.moveTo(-H * 0.17, -H * 0.01); ctx.lineTo(0, H * 0.10); ctx.lineTo(H * 0.17, -H * 0.01); ctx.stroke();
        if (stage >= 4) {
          ctx.globalAlpha *= .82;
          for (let i=-2;i<=2;i++) {
            const y = -H * .18 + i * H * .07;
            ctx.beginPath();
            ctx.moveTo(-H * .07,y-H*.012);
            ctx.lineTo(0,y+H*.012);
            ctx.lineTo(H * .07,y-H*.010);
            ctx.stroke();
          }
          ctx.fillStyle = "#fff7d0";
          ctx.beginPath(); ctx.arc(0, -H * .35, H * .025, 0, Math.PI * 2); ctx.fill();
        }
        break;
      }
      case "bolt":
        drawGlyph(ctx, "bolt", H * 0.20, -H * 0.02, H * 0.050, hot, d.spin);
        break;
      case "eclipse":
        ctx.strokeStyle = hot; ctx.lineWidth = Math.max(1.2, H * 0.012);
        ctx.beginPath(); ctx.arc(0, H * 0.02, H * 0.10, Math.PI * 0.2, Math.PI * 1.8); ctx.stroke();
        break;
      case "flame":
      case "crystal":
      case "fries":
      case "crust":
      case "maw":
      case "aurora":
        drawGlyph(ctx, d.motif === "crystal" ? "shard" : d.motif === "aurora" ? "horn" : e.kind, H * 0.18, -H * 0.02, H * 0.045, hot, d.spin);
        break;
    }
  }
  ctx.restore();
}

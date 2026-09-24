import { drawBossQueen } from "./boss-art.js";
import { drawFoeRig } from "./foe-rig.js";

const KIND_TINT = {
  pez: "#3aa8d8",
  libelula: "#4aba7a",
  mosquito: "#ff6a4a",
  phosquito: "#6ad0a8",
  avispa: "#f0c020",
  abeja: "#ffcc33",
  cucaracho: "#c45a18",
  medusa: "#ff8ad0",
  planta: "#7dca5a",
  anguila: "#40e0d0",
  rana: "#4caf50",
  cangrejo: "#e07040",
  gaviota: "#c8d4e0",
  murcielago: "#7a50a0",
  arana: "#8a5040",
  brasita: "#ff6a20",
  escoria: "#ff4020",
  ufo: "#7ee7ff",
  boss: "#f55",
};

export function drawEnemy(ctx, e, cam, t) {
  const x = e.x - cam.x;
  const y = e.y - cam.y;
  ctx.save();
  ctx.translate(x + e.w / 2, y + e.h / 2);
  // Hit feedback: flash blanco fuerte, luego rojo
  if (e.flash > 10) ctx.filter = "brightness(4.2) saturate(0.12)";
  else if (e.flash > 0) ctx.filter = "brightness(2.6) sepia(0.55) hue-rotate(-25deg)";
  else if (e.invuln > 0 && !e.boss) ctx.filter = "brightness(2.0)";
  ctx.fillStyle = "rgba(0,0,0,.28)";
  ctx.beginPath(); ctx.ellipse(0, e.h / 2 + 2, e.w * 0.4, 4, 0, 0, Math.PI * 2); ctx.fill();

  if (e.telegraph) drawTelegraph(ctx, e, t);
  if (e.elite) drawEliteAura(ctx, e, t);

  if (e.kind === "boss") drawBoss(ctx, e, t);
  else if (drawFoeRig(ctx, e, t)) { /* crawler / flyer / brute */ }
  else if (e.kind === "phosquito") drawPhosquito(ctx, e, t);
  else if (e.kind === "mosquito") drawMosquito(ctx, e, t);
  else if (e.kind === "planta") drawPlanta(ctx, e, t);
  else if (e.kind === "medusa") drawMedusa(ctx, e, t);
  else if (e.kind === "pez") drawFish(ctx, e, t);
  else if (e.kind === "libelula") drawLibelula(ctx, e, t);
  else if (e.kind === "abeja" || e.kind === "avispa") drawAbeja(ctx, e, t);
  else if (e.kind === "anguila") drawAnguila(ctx, e, t);
  else if (e.kind === "rana") drawRana(ctx, e, t);
  else if (e.kind === "cangrejo") drawCangrejo(ctx, e, t);
  else if (e.kind === "gaviota") drawGaviota(ctx, e, t);
  else if (e.kind === "murcielago") drawMurcielago(ctx, e, t);
  else if (e.kind === "arana") drawArana(ctx, e, t);
  else if (e.kind === "brasita") drawBrasita(ctx, e, t);
  else if (e.kind === "escoria") drawEscoria(ctx, e, t);
  else if (e.kind === "ufo") drawUfo(ctx, e, t);
  else drawCucaracho(ctx, e, t);

  ctx.filter = "none";
  // Overlay de golpe: blanco → rojo corto
  if (e.flash > 0) {
    const a = Math.min(0.72, e.flash / 14);
    ctx.globalAlpha = a;
    ctx.fillStyle = e.flash > 9 ? "#ffffff" : "#ff4040";
    ctx.beginPath();
    ctx.ellipse(0, 0, e.w * 0.52, e.h * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  drawHpBar(ctx, e);
  ctx.restore();
}

function telegraphColor(e) {
  if (e.kind === "boss") return ["rgba(255,40,40,.95)", "rgba(255,180,40,.55)"];
  if (e.kind === "abeja" || e.kind === "avispa") return ["rgba(255,220,60,.9)", "rgba(40,40,40,.45)"];
  if (e.kind === "mosquito" || e.kind === "phosquito") return ["rgba(255,70,50,.85)", "rgba(255,40,80,.4)"];
  if (e.kind === "libelula") return ["rgba(80,255,180,.8)", "rgba(40,200,255,.4)"];
  if (e.kind === "medusa" || e.kind === "anguila") return ["rgba(255,120,220,.85)", "rgba(80,230,220,.4)"];
  if (e.kind === "cucaracho") return ["rgba(255,90,40,.8)", "rgba(200,40,20,.4)"];
  if (e.kind === "gaviota") return ["rgba(200,220,255,.85)", "rgba(120,160,200,.4)"];
  if (e.kind === "murcielago") return ["rgba(160,80,220,.85)", "rgba(80,40,120,.4)"];
  if (e.kind === "arana") return ["rgba(180,100,80,.85)", "rgba(80,40,30,.4)"];
  if (e.kind === "brasita" || e.kind === "escoria") return ["rgba(255,120,40,.9)", "rgba(255,60,20,.45)"];
  if (e.kind === "ufo") return ["rgba(126,231,255,.9)", "rgba(80,180,255,.4)"];
  if (e.kind === "rana") return ["rgba(120,255,100,.95)", "rgba(80,200,60,.45)"];
  if (e.kind === "cangrejo") return ["rgba(255,160,60,.95)", "rgba(255,80,40,.45)"];
  return ["rgba(255,80,40,.75)", "rgba(255,160,80,.35)"];
}

function drawTelegraph(ctx, e, t) {
  const [c1, c2] = telegraphColor(e);
  const pulse = 1 + Math.sin(t * 0.55) * 0.18;
  const r = e.w * 0.95 * pulse;
  // Flash de relleno (muy legible)
  ctx.fillStyle = c2.replace(/,[\d.]+\)$/, ",.22)");
  ctx.beginPath(); ctx.arc(0, 0, r * 1.05, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = c1; ctx.lineWidth = 3.2;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = c2; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.arc(0, 0, r * 1.4 + Math.sin(t * 0.7) * 4, 0, Math.PI * 2); ctx.stroke();

  // Marcadores extra para foes nuevos (salto / zap / pinza / rayo)
  const k = e.kind;
  if (k === "rana") {
    // Anillo en el suelo + foreshadow del salto
    const gy = e.h * 0.55;
    ctx.strokeStyle = "rgba(120,255,100,.85)"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(0, gy, 18 + Math.sin(t * 0.6) * 4, 5, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "rgba(180,255,120,.35)";
    ctx.beginPath(); ctx.ellipse(0, gy, 12, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    // Chevrons hacia arriba (salto)
    ctx.strokeStyle = "rgba(255,255,120,.9)"; ctx.lineWidth = 2.2;
    for (let i = 0; i < 2; i++) {
      const yy = -e.h * 0.35 - i * 8 - (t % 10);
      ctx.beginPath();
      ctx.moveTo(-7, yy + 5); ctx.lineTo(0, yy); ctx.lineTo(7, yy + 5);
      ctx.stroke();
    }
  } else if (k === "anguila") {
    // Arco eléctrico + línea de aim al player (si hay aimX/aimY)
    ctx.strokeStyle = "rgba(255,120,220,.9)"; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.7 + Math.sin(t * 0.8) * 3, 0, Math.PI * 2); ctx.stroke();
    if (e.aimDx != null && e.aimDy != null) {
      const len = Math.hypot(e.aimDx, e.aimDy) || 1;
      const nx = (e.aimDx / len) * 36, ny = (e.aimDy / len) * 36;
      ctx.strokeStyle = "rgba(126,231,255,.85)"; ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(nx, ny); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255,100,200,.7)";
      ctx.beginPath(); ctx.arc(nx, ny, 4 + Math.sin(t * 0.7), 0, Math.PI * 2); ctx.fill();
    }
  } else if (k === "cangrejo") {
    // Pinzas: arcos laterales + marcador de suelo
    const sway = Math.sin(t * 0.7) * 3;
    ctx.strokeStyle = "rgba(255,140,60,.95)"; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.arc(-16, -4 + sway, 10, -0.6, 0.8); ctx.stroke();
    ctx.beginPath(); ctx.arc(16, -4 - sway, 10, Math.PI - 0.8, Math.PI + 0.6); ctx.stroke();
    ctx.fillStyle = "rgba(255,80,40,.45)";
    ctx.beginPath(); ctx.ellipse(0, e.h * 0.55, 20 + sway, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(255,200,80,.9)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, e.h * 0.55, 22, 5, 0, 0, Math.PI * 2); ctx.stroke();
  } else if (k === "ufo") {
    // Rayo hacia abajo + anillo de suelo
    const beamH = 34 + Math.sin(t * 0.5) * 4;
    const g = ctx.createLinearGradient(0, 6, 0, beamH);
    g.addColorStop(0, "rgba(126,231,255,.55)");
    g.addColorStop(1, "rgba(126,231,255,.05)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-8, 6); ctx.lineTo(8, 6); ctx.lineTo(16, beamH); ctx.lineTo(-16, beamH);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(180,255,255,.9)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, beamH, 16 + Math.sin(t * 0.6) * 3, 4, 0, 0, Math.PI * 2); ctx.stroke();
    // Luces parpadeo
    for (let i = -1; i <= 1; i++) {
      ctx.fillStyle = `rgba(255,220,80,${0.5 + 0.5 * Math.sin(t * 0.8 + i)})`;
      ctx.beginPath(); ctx.arc(i * 8, 4, 2.4, 0, Math.PI * 2); ctx.fill();
    }
  } else if (k === "gaviota") {
    // Dive foreshadow: flash + chevrons hacia abajo (~0.4s)
    ctx.fillStyle = "rgba(255,120,60,.28)";
    ctx.beginPath(); ctx.arc(0, 0, r * 1.15, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(255,200,120,.95)"; ctx.lineWidth = 2.6;
    for (let i = 0; i < 3; i++) {
      const yy = e.h * 0.2 + i * 9 + (t % 8);
      ctx.beginPath();
      ctx.moveTo(-8, yy); ctx.lineTo(0, yy + 6); ctx.lineTo(8, yy);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(200,220,255,.9)"; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.ellipse(0, e.h * 0.55, 16 + Math.sin(t * 0.6) * 3, 4, 0, 0, Math.PI * 2); ctx.stroke();
  } else if (k === "medusa") {
    // Pulse ring expandiendo antes del sting
    const pr = r * (0.85 + (1 - Math.cos(t * 0.45)) * 0.35);
    ctx.strokeStyle = "rgba(255,120,220,.95)"; ctx.lineWidth = 3.0;
    ctx.beginPath(); ctx.arc(0, 0, pr, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "rgba(190,245,255,.7)"; ctx.lineWidth = 2.0;
    ctx.beginPath(); ctx.arc(0, 0, pr * 1.35, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "rgba(255,140,220,.2)";
    ctx.beginPath(); ctx.arc(0, 0, pr * 0.55, 0, Math.PI * 2); ctx.fill();
  }
}

function drawEliteAura(ctx, e, t) {
  const pulse = 1 + Math.sin(t * 0.35) * 0.08;
  ctx.strokeStyle = "rgba(255,200,40,.95)";
  ctx.lineWidth = 4.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, e.w * 0.58 * pulse, e.h * 0.58 * pulse, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,60,40,.55)";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, e.w * 0.72 * pulse, e.h * 0.72 * pulse, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Corona pequeña
  ctx.fillStyle = "rgba(255,220,80,.9)";
  ctx.beginPath();
  ctx.moveTo(0, -e.h * 0.55 - 6);
  ctx.lineTo(-5, -e.h * 0.55 + 2);
  ctx.lineTo(5, -e.h * 0.55 + 2);
  ctx.closePath();
  ctx.fill();
}

function drawHpBar(ctx, e) {
  const bw = e.w;
  const bh = 5;
  const bx = -bw / 2;
  const by = -e.h / 2 - 12;
  const ratio = Math.max(0, e.hp / e.max);
  const tint = e.boss ? "#f55" : (e.elite ? "#ffd24a" : (KIND_TINT[e.kind] || "#5f5"));
  ctx.fillStyle = "rgba(0,0,0,.65)";
  roundRect(ctx, bx - 1, by - 1, bw + 2, bh + 2, 3);
  ctx.fill();
  if (ratio > 0) {
    ctx.fillStyle = tint;
    roundRect(ctx, bx, by, bw * ratio, bh, 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.28)";
    roundRect(ctx, bx, by, bw * ratio, bh * 0.4, 2);
    ctx.fill();
  }
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawCucaracho(ctx, e, t) {
  const evo = e.evo || 0;
  const leg = Math.sin(t / 4.2 + e.x * 0.08) * (4 + evo);
  const s = evo >= 2 ? 1.35 : evo ? 1.22 : 1;
  const squash = e.lunge > 0 ? 1.12 : evo >= 2 && e.diving ? 0.92 : 1;
  ctx.scale(s * (e.vx >= 0 ? 1 : -1), s * squash);

  // evo2 glow trail feel
  if (evo >= 2) {
    ctx.fillStyle = "rgba(255,60,30,.18)";
    ctx.beginPath(); ctx.ellipse(-10, 2, 22, 10, 0, 0, Math.PI * 2); ctx.fill();
    const flap = Math.sin(t / 2.1) * 10;
    // multi-wing
    for (let i = 0; i < 3; i++) {
      const ox = -16 + i * 5;
      const oy = -8 - i * 2;
      ctx.fillStyle = `rgba(255,${160 - i * 30},${100 - i * 20},${0.35 - i * 0.08})`;
      ctx.beginPath(); ctx.ellipse(ox, oy, 13 - i, 5.5 + flap * 0.18, -0.45 + i * 0.1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(8 + i * 2, oy - 1, 12 - i, 5 + flap * 0.16, 0.4 - i * 0.08, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = "rgba(255,140,80,.4)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(-14, -8, 13, 5.5 + flap * 0.18, -0.4, 0, Math.PI * 2); ctx.stroke();
  }

  // shell body with shine
  const shellDark = evo >= 2 ? "#8a1010" : evo ? "#5a1808" : "#3a2008";
  const shellMid = evo >= 2 ? "#c81818" : evo ? "#8a2010" : "#5a3010";
  const shellLite = evo >= 2 ? "#ff4020" : evo ? "#c44520" : "#7a4a18";
  const g = ctx.createRadialGradient(4, -2, 2, 0, 2, 16);
  g.addColorStop(0, shellLite);
  g.addColorStop(0.55, shellMid);
  g.addColorStop(1, shellDark);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(0, 3, 15, 8, 0, 0, Math.PI * 2); ctx.fill();
  // specular
  ctx.fillStyle = "rgba(255,220,180,.35)";
  ctx.beginPath(); ctx.ellipse(3, -1, 6, 2.4, -0.3, 0, Math.PI * 2); ctx.fill();
  // abdomen plate
  ctx.fillStyle = shellLite;
  ctx.beginPath(); ctx.ellipse(5, 1, 8, 6, 0.2, 0, Math.PI * 2); ctx.fill();
  // segments
  ctx.strokeStyle = "rgba(20,8,0,.4)"; ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.ellipse(-2 + i * 4, 3, 10 - i * 2, 6 - i, 0.1, 0.2, Math.PI - 0.2); ctx.stroke();
  }

  // antennae
  ctx.strokeStyle = evo >= 1 ? "#1a0804" : "#2a1408"; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(10, -2); ctx.quadraticCurveTo(14, -8 + Math.sin(t / 6) * 2, 18, -12);
  ctx.moveTo(12, 0); ctx.quadraticCurveTo(16, -4 + Math.cos(t / 5) * 2, 20, -8);
  ctx.stroke();

  // six legs with more motion
  ctx.strokeStyle = "#2a1408"; ctx.lineWidth = 2.2; ctx.lineCap = "round";
  const legs = [
    [-10, 6, -16, 13 + leg],
    [-4, 8, -8, 15 - leg * 0.8],
    [2, 8, 6, 15 + leg * 0.6],
    [8, 6, 14, 13 - leg],
    [-6, 4, -12, 10 + leg * 0.5],
    [6, 4, 12, 10 - leg * 0.5],
  ];
  ctx.beginPath();
  for (const L of legs) {
    ctx.moveTo(L[0], L[1]); ctx.lineTo(L[2], L[3]);
  }
  ctx.stroke();
  ctx.lineCap = "butt";

  // eyes — angrier on evo
  const eyeR = evo >= 1 ? 2.8 : 2.2;
  ctx.fillStyle = evo >= 2 ? "#ff2020" : evo ? "#ff8040" : "#111";
  ctx.fillRect(8, -3, eyeR, eyeR);
  ctx.fillRect(12, 0, eyeR, eyeR);
  if (evo >= 1) {
    ctx.fillStyle = "#fff";
    ctx.fillRect(8.5, -2.5, 1, 1);
    ctx.fillRect(12.5, 0.5, 1, 1);
  }
}

function drawPhosquito(ctx, e, t) {
  const flap = Math.sin(t / 2.4) * 12;
  const diving = e.diving || e.telegraph || (e.vy > 1.5);
  const s = (e.baby ? 0.78 : 1.15) * (diving ? 0.9 : 1);
  const stretch = diving ? 1.18 : 1;
  ctx.scale(s, s * stretch);

  // wing blur stacks
  for (let i = 0; i < 3; i++) {
    const a = 0.22 - i * 0.06;
    ctx.fillStyle = `rgba(180,255,240,${a})`;
    ctx.beginPath(); ctx.ellipse(-12 - i, -4 - i * 0.5, 13, 6 + flap * 0.22 + i, -0.35, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(8 + i, -6 - i * 0.5, 12, 5 + flap * 0.2 + i * 0.8, 0.28, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = "rgba(126,231,255,.55)"; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.ellipse(-12, -4, 13, 6 + flap * 0.2, -0.35, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(8, -6, 12, 5 + flap * 0.18, 0.28, 0, Math.PI * 2); ctx.stroke();

  // body gradient
  const bg = ctx.createLinearGradient(-6, -4, 8, 8);
  bg.addColorStop(0, "#3a8a5a");
  bg.addColorStop(1, "#1a4a30");
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.ellipse(0, 3, 9, 6.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(126,231,255,.35)";
  ctx.beginPath(); ctx.ellipse(1, 1, 5, 3, 0, 0, Math.PI * 2); ctx.fill();

  // eyes
  ctx.fillStyle = "#7ee7ff";
  ctx.beginPath(); ctx.arc(-2, 2, 2.4, 0, Math.PI * 2); ctx.arc(3, 2, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#111";
  ctx.beginPath(); ctx.arc(-2, 2, 1.1, 0, Math.PI * 2); ctx.arc(3, 2, 1.1, 0, Math.PI * 2); ctx.fill();

  // proboscis
  ctx.strokeStyle = "#1a4030"; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(8, 4); ctx.lineTo(20, 12); ctx.stroke();
  ctx.fillStyle = diving ? "#ff4040" : "#c81e1e";
  ctx.beginPath(); ctx.arc(20, 12, diving ? 3.2 : 2.4, 0, Math.PI * 2); ctx.fill();
  if (e.telegraph) {
    ctx.fillStyle = "rgba(126,231,255,.25)";
    ctx.beginPath(); ctx.arc(0, 0, 18 + Math.sin(t * 0.5) * 3, 0, Math.PI * 2); ctx.fill();
  }
}

function drawMosquito(ctx, e, t) {
  const flap = Math.sin(t / 1.9) * 13;
  const diving = e.diving || e.telegraph || (e.vy > 2);
  const s = (e.baby ? 0.95 : 1.45) * (diving ? 0.88 : 1);
  const stretch = diving ? 1.22 : 1;
  ctx.scale(s, s * stretch);

  // angry red aura when diving
  if (diving) {
    ctx.fillStyle = "rgba(255,40,30,.22)";
    ctx.beginPath(); ctx.arc(0, 2, 20 + Math.sin(t * 0.7) * 3, 0, Math.PI * 2); ctx.fill();
  }

  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = `rgba(255,180,160,${0.28 - i * 0.07})`;
    ctx.beginPath(); ctx.ellipse(-12 - i, -4 - i, 12, 5.5 + flap * 0.22, -0.35, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(8 + i, -6 - i, 11, 4.5 + flap * 0.2, 0.28, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = "rgba(255,100,60,.5)"; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.ellipse(-12, -4, 12, 5.5 + flap * 0.2, -0.35, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(8, -6, 11, 4.5 + flap * 0.18, 0.28, 0, Math.PI * 2); ctx.stroke();

  // dark silhouette body stroke
  ctx.strokeStyle = "rgba(20,0,0,.75)"; ctx.lineWidth = 3.2;
  ctx.beginPath(); ctx.ellipse(0, 3, 9.6, 7.1, 0, 0, Math.PI * 2); ctx.stroke();

  const bg = ctx.createLinearGradient(-4, -2, 6, 8);
  bg.addColorStop(0, "#6a2828");
  bg.addColorStop(1, "#2a1010");
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.ellipse(0, 3, 9, 6.5, 0, 0, Math.PI * 2); ctx.fill();

  // angry eyes
  ctx.fillStyle = "#ff6a4a";
  ctx.beginPath(); ctx.arc(-2, 2, 2.5, 0, Math.PI * 2); ctx.arc(3, 2, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#111";
  ctx.beginPath(); ctx.arc(-1.5, 2.3, 1.2, 0, Math.PI * 2); ctx.arc(3.5, 2.3, 1.2, 0, Math.PI * 2); ctx.fill();

  // longer blood proboscis
  const tip = diving ? 28 : 24;
  ctx.strokeStyle = "#2a1010"; ctx.lineWidth = 2.8;
  ctx.beginPath(); ctx.moveTo(8, 4); ctx.lineTo(tip, 16); ctx.stroke();
  ctx.fillStyle = "#ff2020";
  ctx.beginPath(); ctx.arc(tip, 16, diving ? 3.4 : 2.8, 0, Math.PI * 2); ctx.fill();
  if (diving) {
    ctx.fillStyle = "rgba(255,30,30,.5)";
    ctx.beginPath(); ctx.arc(tip, 16, 5, 0, Math.PI * 2); ctx.fill();
  }
}

function drawFish(ctx, e, t) {
  const bob = Math.sin(t / 7 + (e.bob || 0)) * 2;
  const dir = e.vx >= 0 ? 1 : -1;
  const thrash = Math.sin(t / 3.2 + (e.bob || 0)) * (e.dashSwim > 0 ? 5 : 2.5);
  const stretch = e.dashSwim > 0 ? 1.14 : 1;
  // pop underwater: draw larger than hitbox
  ctx.scale(dir * stretch * 1.4, (1 / Math.sqrt(stretch)) * 1.4);
  ctx.translate(0, bob);

  // thick underwater glow
  ctx.fillStyle = "rgba(80,220,255,.35)";
  ctx.beginPath(); ctx.ellipse(0, 0, 28, 18, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(180,250,255,.22)";
  ctx.beginPath(); ctx.ellipse(0, 0, 20, 12, 0, 0, Math.PI * 2); ctx.fill();

  // dark silhouette stroke
  ctx.strokeStyle = "rgba(5,20,40,.85)"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.ellipse(0, 0, 17, 10, 0, 0, Math.PI * 2); ctx.stroke();

  // iridescent body
  const g = ctx.createLinearGradient(-14, -8, 14, 8);
  g.addColorStop(0, "#1a6a98");
  g.addColorStop(0.35, "#3aa8d8");
  g.addColorStop(0.65, "#7ee7ff");
  g.addColorStop(1, "#2a88b8");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(0, 0, 16, 9, 0, 0, Math.PI * 2); ctx.fill();

  // thick bright outline so they pop
  ctx.strokeStyle = "rgba(200,255,255,.95)"; ctx.lineWidth = 2.8;
  ctx.beginPath(); ctx.ellipse(0, 0, 16, 9, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = "rgba(120,230,255,.7)"; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.ellipse(0, 0, 17.5, 10.2, 0, 0, Math.PI * 2); ctx.stroke();

  // scale shimmer rows
  for (let row = -1; row <= 1; row++) {
    for (let col = -2; col <= 2; col++) {
      const sx = col * 4.5 - 2;
      const sy = row * 3.2;
      const shimmer = 0.15 + 0.2 * Math.max(0, Math.sin(t / 5 + col + row * 2));
      ctx.strokeStyle = `rgba(255,255,255,${shimmer})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.arc(sx, sy, 2.2, 0.2, Math.PI - 0.2); ctx.stroke();
    }
  }

  // belly highlight
  ctx.fillStyle = "rgba(200,255,255,.4)";
  ctx.beginPath(); ctx.ellipse(2, 3, 9, 4, 0, 0, Math.PI * 2); ctx.fill();

  // tail thrash
  ctx.fillStyle = "#2a88b8";
  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.lineTo(-24 - (e.dashSwim > 0 ? 3 : 0), -9 + thrash);
  ctx.lineTo(-22, 0);
  ctx.lineTo(-24 - (e.dashSwim > 0 ? 3 : 0), 9 - thrash);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "rgba(5,20,40,.8)"; ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "rgba(126,231,255,.55)";
  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.lineTo(-20, -4 + thrash * 0.5);
  ctx.lineTo(-20, 4 - thrash * 0.5);
  ctx.closePath(); ctx.fill();

  // dorsal
  ctx.fillStyle = "#ff9a4a";
  ctx.beginPath();
  ctx.moveTo(-2, -8);
  ctx.lineTo(4, -17 + Math.sin(t / 5) * 2);
  ctx.lineTo(9, -7);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "rgba(255,220,160,.5)";
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(4, -14);
  ctx.lineTo(7, -7);
  ctx.closePath(); ctx.fill();

  // belly fin
  ctx.fillStyle = "#ffb06a";
  ctx.beginPath();
  ctx.moveTo(0, 7);
  ctx.lineTo(4, 14 + Math.sin(t / 5 + 1) * 1.5);
  ctx.lineTo(8, 6);
  ctx.closePath(); ctx.fill();

  // expressive eye
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(8, -2, 3.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#111";
  ctx.beginPath(); ctx.arc(9.2, -2, 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(9.8, -2.6, 0.7, 0, Math.PI * 2); ctx.fill();

  // gill
  ctx.strokeStyle = "rgba(20,60,90,.5)"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(4, 0, 5.5, -0.9, 0.9); ctx.stroke();
}

function drawLibelula(ctx, e, t) {
  const flap = Math.sin(t / 1.5) * 11;
  const dir = e.vx >= 0 ? 1 : -1;
  const tilt = Math.max(-0.35, Math.min(0.35, (e.vy || 0) * 0.04 + Math.sin((e.bob || 0)) * 0.08));
  const squash = e.telegraph ? 0.92 : e.darting ? 1.15 : 1;
  ctx.scale(dir * 1.4, 1.4);
  ctx.rotate(tilt * dir);
  ctx.scale(squash, 1 / Math.sqrt(squash));

  // iridescent wing veins (4 wings + blur)
  for (let i = 0; i < 2; i++) {
    const a = 0.4 - i * 0.12;
    drawWing(ctx, -10 - i, -9 - flap * 0.18 - i, 15, 5.5, -0.5, `rgba(160,255,220,${a})`, t);
    drawWing(ctx, 8 + i, -9 + flap * 0.18 - i, 15, 5.5, 0.5, `rgba(160,255,220,${a})`, t);
    drawWing(ctx, -8 - i, -2 + flap * 0.12, 13, 4.5, -0.35, `rgba(140,230,255,${a})`, t);
    drawWing(ctx, 6 + i, -2 - flap * 0.12, 13, 4.5, 0.35, `rgba(140,230,255,${a})`, t);
  }

  // dark silhouette around abdomen/thorax
  ctx.strokeStyle = "rgba(0,30,20,.8)"; ctx.lineWidth = 3.4;
  ctx.beginPath(); ctx.ellipse(0, 4, 5.2, 17, 0.08, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, -6, 5.8, 6.2, 0, 0, Math.PI * 2); ctx.stroke();

  const ab = ctx.createLinearGradient(0, -10, 0, 22);
  ab.addColorStop(0, "#4aba7a");
  ab.addColorStop(0.5, "#2a8a5a");
  ab.addColorStop(1, "#1a5a3a");
  ctx.fillStyle = ab;
  ctx.beginPath(); ctx.ellipse(0, 4, 4.5, 16, 0.08, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(10,40,30,.55)"; ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath(); ctx.moveTo(-3.5, -2 + i * 3.5); ctx.lineTo(3.5, -2 + i * 3.5); ctx.stroke();
  }
  ctx.fillStyle = "#3aaa6a";
  ctx.beginPath(); ctx.ellipse(0, -6, 5, 5.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(180,255,220,.35)";
  ctx.beginPath(); ctx.ellipse(0, -7, 3, 2.5, 0, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = "#2a6a4a";
  ctx.beginPath(); ctx.arc(0, -12, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(-3, -13, 2.8, 0, Math.PI * 2); ctx.arc(3, -13, 2.8, 0, Math.PI * 2); ctx.fill();
  const look = e.telegraph ? 0.6 : 0.2;
  ctx.fillStyle = "#111";
  ctx.beginPath(); ctx.arc(-3 + look, -13, 1.3, 0, Math.PI * 2); ctx.arc(3 + look, -13, 1.3, 0, Math.PI * 2); ctx.fill();
}

function drawWing(ctx, x, y, rx, ry, rot, fill, t) {
  ctx.fillStyle = fill;
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(100,220,180,.55)"; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); ctx.stroke();
  // veins
  ctx.strokeStyle = "rgba(80,200,160,.4)"; ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(rot) * rx * 0.8, y + Math.sin(rot) * ry * 0.8);
  ctx.moveTo(x - rx * 0.3, y);
  ctx.lineTo(x + rx * 0.2, y - ry * 0.6);
  ctx.stroke();
}


function drawAbeja(ctx, e, t) {
  // Bee-like: fuzzier yellow, rounder body, LARGER (~1.45); avispa maps here too
  const flap = Math.sin(t / 2.4) * 8;
  const diving = e.diving > 0 || e.charging > 0;
  const stretch = diving ? 1.2 : e.telegraph ? 0.9 : 1;
  const dir = e.vx >= 0 ? 1 : -1;
  ctx.scale(dir * 1.45, 1.45);
  ctx.scale(1, stretch);

  // soft yellow glow
  ctx.fillStyle = "rgba(255,220,80,.22)";
  ctx.beginPath(); ctx.arc(0, 4, 22 + Math.sin(t * 0.2) * 2, 0, Math.PI * 2); ctx.fill();

  // translucent wings
  for (let i = 0; i < 2; i++) {
    ctx.fillStyle = `rgba(255,255,230,${0.4 - i * 0.12})`;
    ctx.beginPath(); ctx.ellipse(-11 - i, -7 - i, 12, 5.5 + flap * 0.18, -0.45, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(9 + i, -7 - i, 12, 5.5 + flap * 0.18, 0.45, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = "rgba(180,160,60,.45)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(-11, -7, 12, 5.5 + flap * 0.15, -0.45, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(9, -7, 12, 5.5 + flap * 0.15, 0.45, 0, Math.PI * 2); ctx.stroke();

  // dark silhouette around rounder body
  ctx.strokeStyle = "rgba(20,10,0,.85)"; ctx.lineWidth = 3.6;
  ctx.beginPath(); ctx.ellipse(0, -1, 10.5, 9.5, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 11, 9.5, 11.5, 0, 0, Math.PI * 2); ctx.stroke();

  // fuzzy yellow thorax (rounder / fluffier)
  const tg = ctx.createRadialGradient(0, -2, 1, 0, 0, 12);
  tg.addColorStop(0, "#ffe066");
  tg.addColorStop(0.45, "#f0c020");
  tg.addColorStop(1, "#3a2a10");
  ctx.fillStyle = tg;
  ctx.beginPath(); ctx.ellipse(0, -1, 10, 9, 0, 0, Math.PI * 2); ctx.fill();
  // fluff dots
  ctx.fillStyle = "rgba(255,240,160,.4)";
  ctx.beginPath(); ctx.arc(-4, -3, 2.6, 0, Math.PI * 2); ctx.arc(3.5, -2, 2.2, 0, Math.PI * 2); ctx.arc(0, 1, 1.8, 0, Math.PI * 2); ctx.fill();

  // bold yellow/black striped round abdomen
  const pulse = e.telegraph ? 1 + Math.sin(t * 0.5) * 0.1 : 1;
  ctx.fillStyle = "#ffcc33";
  ctx.beginPath(); ctx.ellipse(0, 11, 9 * pulse, 11 * pulse, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#111";
  ctx.fillRect(-9, 5, 18, 3.4);
  ctx.fillRect(-8.5, 11, 17, 3.4);
  ctx.fillRect(-7.5, 17, 15, 3);
  ctx.fillStyle = "#ffe066";
  ctx.fillRect(-8, 8.4, 16, 2.4);
  ctx.fillRect(-7.5, 14.4, 15, 2.2);
  ctx.fillStyle = "rgba(255,255,200,.4)";
  ctx.beginPath(); ctx.ellipse(-2, 9, 3.5, 5.5, 0, 0, Math.PI * 2); ctx.fill();

  // round head
  ctx.fillStyle = "#2a1a08";
  ctx.beginPath(); ctx.arc(0, -10, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = diving || e.telegraph ? "#ff3030" : "#ffcc44";
  ctx.beginPath(); ctx.arc(-2.6, -11, 1.9, 0, Math.PI * 2); ctx.arc(2.6, -11, 1.9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#111";
  ctx.beginPath(); ctx.arc(-2.6, -10.5, 0.8, 0, Math.PI * 2); ctx.arc(2.6, -10.5, 0.8, 0, Math.PI * 2); ctx.fill();

  // stinger
  const stingLen = diving ? 36 : 26;
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.moveTo(-2.4, 20);
  ctx.lineTo(0, stingLen);
  ctx.lineTo(2.4, 20);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = diving ? "#ff2020" : "#c84010";
  ctx.beginPath(); ctx.arc(0, stingLen, diving ? 2.4 : 1.6, 0, Math.PI * 2); ctx.fill();
  if (diving) {
    ctx.strokeStyle = "rgba(255,180,40,.55)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 22); ctx.lineTo(0, stingLen + 3); ctx.stroke();
  }
}


function drawPlanta(ctx, e, t) {
  ctx.fillStyle = "#2a6a28";
  ctx.fillRect(-8, 10, 16, 16);
  ctx.fillStyle = "#3a8a30";
  ctx.beginPath(); ctx.ellipse(0, 12, 14, 6, 0, 0, Math.PI * 2); ctx.fill();
  if (!e.up) return;
  const chomp = Math.sin(t / 7) * 3;
  ctx.fillStyle = "#2f8a32";
  ctx.fillRect(-3, -8, 6, 22);
  ctx.fillStyle = "#e23b3d";
  ctx.beginPath(); ctx.ellipse(0, -16, 14, 12 + chomp * 0.2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff";
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 4 - 2, -16);
    ctx.lineTo(i * 4, -8 + (i % 2 ? 2 : 0));
    ctx.lineTo(i * 4 + 2, -16);
    ctx.fill();
  }
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(-5, -20, 3.2, 0, Math.PI * 2); ctx.arc(5, -20, 3.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#111";
  ctx.beginPath(); ctx.arc(-5, -20, 1.4, 0, Math.PI * 2); ctx.arc(5, -20, 1.4, 0, Math.PI * 2); ctx.fill();
}

function drawMedusa(ctx, e, t) {
  const pulse = Math.sin(t / 8 + e.x) * 0.16;
  const inflate = e.pulsezap > 0 ? 1 + (e.pulsezap / 20) * 0.25 : 1;
  ctx.scale(inflate, inflate);

  // stronger glow pulse
  const glowR = 24 + Math.sin(t / 6) * 4;
  ctx.fillStyle = "rgba(255,140,215,.2)";
  ctx.beginPath(); ctx.arc(0, -2, glowR, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(180,120,255,.12)";
  ctx.beginPath(); ctx.arc(0, -2, glowR * 1.35, 0, Math.PI * 2); ctx.fill();

  // bell
  const grad = ctx.createLinearGradient(0, -20, 0, 6);
  grad.addColorStop(0, "rgba(255,200,245,.95)");
  grad.addColorStop(0.5, "rgba(255,150,220,.75)");
  grad.addColorStop(1, "rgba(160,100,220,.5)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, -4, 17, 14 - pulse * 7, 0, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(190,245,255,.8)"; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.ellipse(0, -4, 17, 14 - pulse * 7, 0, Math.PI, 0); ctx.stroke();

  // biolum spots
  const spots = [[-8, -8], [0, -12], [8, -8], [-4, -4], [5, -5], [0, -6]];
  for (let i = 0; i < spots.length; i++) {
    const sp = spots[i];
    const tw = 0.35 + 0.35 * Math.sin(t / 5 + i * 1.3);
    ctx.fillStyle = `rgba(190,245,255,${tw})`;
    ctx.beginPath(); ctx.arc(sp[0], sp[1], 2.2, 0, Math.PI * 2); ctx.fill();
  }

  // inner core
  ctx.fillStyle = "rgba(190,245,255,.5)";
  ctx.beginPath(); ctx.arc(0, -6, 7, 0, Math.PI * 2); ctx.fill();

  // more tentacles (7)
  ctx.lineCap = "round";
  for (let i = -3; i <= 3; i++) {
    const tx = i * 4.5;
    const thick = 1.6 + (1 - Math.abs(i) / 3) * 0.8;
    ctx.strokeStyle = `rgba(255,${140 + Math.abs(i) * 15},${200 - Math.abs(i) * 10},${0.55 + (1 - Math.abs(i) / 3) * 0.25})`;
    ctx.lineWidth = thick;
    ctx.beginPath();
    ctx.moveTo(tx, -1);
    ctx.quadraticCurveTo(
      tx + Math.sin(t / 5.5 + i) * 6,
      12,
      tx + Math.sin(t / 4.5 + i * 0.8) * 9,
      26 + Math.abs(i)
    );
    ctx.stroke();
    // tip glow
    const tipX = tx + Math.sin(t / 4.5 + i * 0.8) * 9;
    const tipY = 26 + Math.abs(i);
    ctx.fillStyle = "rgba(255,180,255,.55)";
    ctx.beginPath(); ctx.arc(tipX, tipY, 1.8, 0, Math.PI * 2); ctx.fill();
  }
  ctx.lineCap = "butt";

  // eyes
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(-4.5, -6, 2.6, 0, Math.PI * 2); ctx.arc(4.5, -6, 2.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#221";
  ctx.beginPath(); ctx.arc(-4.5, -6, 1.2, 0, Math.PI * 2); ctx.arc(4.5, -6, 1.2, 0, Math.PI * 2); ctx.fill();
}


function drawAnguila(ctx, e, t) {
  const dir = e.vx >= 0 ? 1 : -1;
  const wave = Math.sin(t / 4 + (e.bob || 0));
  ctx.scale(dir * 1.35, 1.35);
  // glow
  ctx.fillStyle = e.telegraph || e.pulsezap > 0 ? "rgba(255,140,220,.35)" : "rgba(64,224,208,.28)";
  ctx.beginPath(); ctx.ellipse(0, 0, 28, 12, 0, 0, Math.PI * 2); ctx.fill();
  // wavy body segments
  const cols = e.telegraph ? ["#ff8ad0", "#40e0d0", "#7ee7ff"] : ["#1a8a80", "#40e0d0", "#7ee7ff"];
  for (let i = 0; i < 6; i++) {
    const sx = -18 + i * 7;
    const sy = Math.sin(t / 3.5 + i * 0.7) * 3.5;
    const r = 5.5 - i * 0.35;
    ctx.fillStyle = cols[i % 3];
    ctx.beginPath(); ctx.ellipse(sx, sy, r + 1, r * 0.75, wave * 0.15, 0, Math.PI * 2); ctx.fill();
  }
  // head
  ctx.fillStyle = "#2ab0a0";
  ctx.beginPath(); ctx.ellipse(18, wave * 1.5, 8, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(20, wave * 1.5 - 1, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = e.telegraph ? "#ff2080" : "#111";
  ctx.beginPath(); ctx.arc(20.6, wave * 1.5 - 1, 1.1, 0, Math.PI * 2); ctx.fill();
  // fin
  ctx.fillStyle = "rgba(126,231,255,.55)";
  ctx.beginPath();
  ctx.moveTo(-16, -2); ctx.quadraticCurveTo(-10, -10 + wave * 2, 4, -4); ctx.lineTo(0, 0); ctx.fill();
  if (e.pulsezap > 0) {
    ctx.strokeStyle = "rgba(255,140,220,.7)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(18, 0, 12 + Math.sin(t * 0.5) * 2, 0, Math.PI * 2); ctx.stroke();
  }
}

function drawRana(ctx, e, t) {
  const hop = e.vy < -1 ? 1.08 : e.sitting > 0 ? 0.92 : 1;
  const dir = e.vx >= 0 ? 1 : -1;
  ctx.scale(dir * 1.3, 1.3 * hop);
  // body
  const g = ctx.createRadialGradient(0, 0, 2, 0, 2, 16);
  g.addColorStop(0, "#8fd86a");
  g.addColorStop(0.6, "#4caf50");
  g.addColorStop(1, "#2a6a30");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(0, 2, 14, 11, 0, 0, Math.PI * 2); ctx.fill();
  // belly
  ctx.fillStyle = "rgba(200,255,180,.45)";
  ctx.beginPath(); ctx.ellipse(1, 5, 8, 5, 0, 0, Math.PI * 2); ctx.fill();
  // big eyes
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(-6, -8, 5.5, 0, Math.PI * 2); ctx.arc(6, -8, 5.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#2a6a30";
  ctx.beginPath(); ctx.arc(-6, -9, 5.2, Math.PI, 0); ctx.arc(6, -9, 5.2, Math.PI, 0); ctx.fill();
  ctx.fillStyle = e.telegraph ? "#ff4040" : "#111";
  ctx.beginPath(); ctx.arc(-5, -7, 2.2, 0, Math.PI * 2); ctx.arc(7, -7, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(-4.2, -7.8, 0.8, 0, Math.PI * 2); ctx.arc(7.8, -7.8, 0.8, 0, Math.PI * 2); ctx.fill();
  // legs
  ctx.strokeStyle = "#2a6a30"; ctx.lineWidth = 3; ctx.lineCap = "round";
  const leg = e.vy < -1 ? 4 : Math.sin(t / 5) * 2;
  ctx.beginPath();
  ctx.moveTo(-8, 8); ctx.quadraticCurveTo(-14, 10 + leg, -12, 14);
  ctx.moveTo(8, 8); ctx.quadraticCurveTo(14, 10 - leg, 12, 14);
  ctx.stroke();
  ctx.lineCap = "butt";
}

function drawCangrejo(ctx, e, t) {
  const dir = e.vx >= 0 ? 1 : -1;
  const claw = e.claws ? 1.15 : 1;
  ctx.scale(dir * 1.25, 1.25);
  // legs
  ctx.strokeStyle = "#a04020"; ctx.lineWidth = 2.4; ctx.lineCap = "round";
  const scuttle = Math.sin(t / 3.5 + e.x * 0.05) * 3;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(-6 + i * 5, 4); ctx.lineTo(-12 + i * 4, 10 + scuttle * (i % 2 ? 1 : -1));
    ctx.moveTo(6 - i * 5, 4); ctx.lineTo(12 - i * 4, 10 - scuttle * (i % 2 ? 1 : -1));
    ctx.stroke();
  }
  // body
  const g = ctx.createRadialGradient(0, 0, 2, 0, 2, 14);
  g.addColorStop(0, "#ff9a60");
  g.addColorStop(0.55, "#e07040");
  g.addColorStop(1, "#8a3010");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(0, 1, 14, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,200,160,.35)";
  ctx.beginPath(); ctx.ellipse(0, -1, 8, 4, 0, 0, Math.PI * 2); ctx.fill();
  // claws
  ctx.fillStyle = "#d06030";
  const cy = e.claws ? -10 : -4;
  ctx.beginPath(); ctx.ellipse(-14, cy, 6 * claw, 4 * claw, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(14, cy, 6 * claw, 4 * claw, 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#8a3010"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-14, cy); ctx.moveTo(10, 0); ctx.lineTo(14, cy); ctx.stroke();
  // eyes on stalks
  ctx.strokeStyle = "#8a3010"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-4, -4); ctx.lineTo(-5, -12); ctx.moveTo(4, -4); ctx.lineTo(5, -12); ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(-5, -13, 2.6, 0, Math.PI * 2); ctx.arc(5, -13, 2.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = e.claws ? "#ff2020" : "#111";
  ctx.beginPath(); ctx.arc(-5, -13, 1.2, 0, Math.PI * 2); ctx.arc(5, -13, 1.2, 0, Math.PI * 2); ctx.fill();
  ctx.lineCap = "butt";
}

function drawGaviota(ctx, e, t) {
  const flap = Math.sin(t / 3.2) * (e.diving ? 4 : 10);
  const dir = e.vx >= 0 ? 1 : -1;
  const dive = e.diving ? 1.12 : 1;
  ctx.scale(dir * 1.35, 1.35 * dive);
  // wings
  ctx.fillStyle = "rgba(240,245,255,.9)";
  ctx.beginPath();
  ctx.moveTo(-2, 0); ctx.quadraticCurveTo(-18, -6 - flap, -28, 2 - flap * 0.3); ctx.quadraticCurveTo(-14, 2, -2, 4); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(2, 0); ctx.quadraticCurveTo(18, -6 + flap, 28, 2 + flap * 0.3); ctx.quadraticCurveTo(14, 2, 2, 4); ctx.fill();
  ctx.strokeStyle = "rgba(160,180,200,.55)"; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(-2, 0); ctx.quadraticCurveTo(-18, -6 - flap, -28, 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(2, 0); ctx.quadraticCurveTo(18, -6 + flap, 28, 2); ctx.stroke();
  // body
  ctx.fillStyle = "#f0f4f8";
  ctx.beginPath(); ctx.ellipse(0, 2, 10, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#d8e0e8";
  ctx.beginPath(); ctx.ellipse(0, 4, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
  // head + beak
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(8, -2, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = e.telegraph || e.diving ? "#ff6030" : "#f0a020";
  ctx.beginPath(); ctx.moveTo(12, -2); ctx.lineTo(20, 0); ctx.lineTo(12, 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#111";
  ctx.beginPath(); ctx.arc(9, -3, 1.3, 0, Math.PI * 2); ctx.fill();
}

function drawMurcielago(ctx, e, t) {
  const flap = Math.sin(t / 2.2) * (e.diving ? 5 : 12);
  const dir = e.vx >= 0 ? 1 : -1;
  ctx.scale(dir * 1.3, 1.3);
  // silhouette wings
  ctx.fillStyle = "#2a1838";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-10, -8 - flap, -22, -2 - flap * 0.4);
  ctx.quadraticCurveTo(-16, 4, -8, 2);
  ctx.quadraticCurveTo(-4, 6, 0, 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(10, -8 + flap, 22, -2 + flap * 0.4);
  ctx.quadraticCurveTo(16, 4, 8, 2);
  ctx.quadraticCurveTo(4, 6, 0, 2);
  ctx.fill();
  // membrane highlight
  ctx.fillStyle = "rgba(120,80,160,.35)";
  ctx.beginPath(); ctx.ellipse(-12, -2 - flap * 0.3, 8, 5, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(12, -2 + flap * 0.3, 8, 5, 0.3, 0, Math.PI * 2); ctx.fill();
  // body
  ctx.fillStyle = "#3a2048";
  ctx.beginPath(); ctx.ellipse(0, 2, 7, 8, 0, 0, Math.PI * 2); ctx.fill();
  // ears
  ctx.fillStyle = "#4a3060";
  ctx.beginPath(); ctx.moveTo(-4, -6); ctx.lineTo(-6, -14); ctx.lineTo(-1, -7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(4, -6); ctx.lineTo(6, -14); ctx.lineTo(1, -7); ctx.fill();
  // eyes
  ctx.fillStyle = e.telegraph || e.diving ? "#ff4060" : "#ffcc44";
  ctx.beginPath(); ctx.arc(-2.5, 0, 1.8, 0, Math.PI * 2); ctx.arc(2.5, 0, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#111";
  ctx.beginPath(); ctx.arc(-2.5, 0.3, 0.7, 0, Math.PI * 2); ctx.arc(2.5, 0.3, 0.7, 0, Math.PI * 2); ctx.fill();
}

function drawArana(ctx, e, t) {
  const dir = e.vx >= 0 ? 1 : -1;
  const crawl = Math.sin(t / 3.8 + e.x * 0.1) * 3;
  ctx.scale(dir * 1.25, 1.25);
  // web thread when dropping
  if (e.dropping) {
    ctx.strokeStyle = "rgba(200,200,200,.55)"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, -40); ctx.stroke();
  }
  // legs
  ctx.strokeStyle = "#1a1010"; ctx.lineWidth = 2; ctx.lineCap = "round";
  const legs = [
    [-4, 0, -14, -6 + crawl], [-2, 2, -16, 2 - crawl], [0, 3, -14, 8 + crawl], [2, 2, -10, 12 - crawl],
    [4, 0, 14, -6 - crawl], [2, 2, 16, 2 + crawl], [0, 3, 14, 8 - crawl], [-2, 2, 10, 12 + crawl],
  ];
  ctx.beginPath();
  for (const L of legs) { ctx.moveTo(L[0], L[1]); ctx.lineTo(L[2], L[3]); }
  ctx.stroke();
  // abdomen
  ctx.fillStyle = "#2a1a18";
  ctx.beginPath(); ctx.ellipse(-4, 2, 8, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#4a2820";
  ctx.beginPath(); ctx.ellipse(-4, 1, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
  // cephalothorax
  ctx.fillStyle = "#3a2018";
  ctx.beginPath(); ctx.ellipse(6, 0, 6, 5, 0, 0, Math.PI * 2); ctx.fill();
  // eyes cluster
  ctx.fillStyle = e.telegraph ? "#ff4040" : "#ffcc40";
  ctx.beginPath();
  ctx.arc(7, -2, 1.4, 0, Math.PI * 2); ctx.arc(10, -1, 1.2, 0, Math.PI * 2);
  ctx.arc(7, 1, 1.1, 0, Math.PI * 2); ctx.arc(10, 1.5, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineCap = "butt";
}

function drawBrasita(ctx, e, t) {
  const pulse = 1 + Math.sin(t / 4 + (e.bob || 0)) * 0.12;
  ctx.scale(pulse * 1.2, pulse * 1.2);
  // outer glow
  const g = ctx.createRadialGradient(0, 0, 1, 0, 0, 16);
  g.addColorStop(0, "rgba(255,240,180,.9)");
  g.addColorStop(0.35, "rgba(255,140,40,.75)");
  g.addColorStop(0.7, "rgba(255,60,20,.35)");
  g.addColorStop(1, "rgba(255,40,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill();
  // core
  ctx.fillStyle = "#ffe8a0";
  ctx.beginPath(); ctx.arc(0, -1, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ff6a20";
  ctx.beginPath(); ctx.arc(0, 1, 7, 0, Math.PI * 2); ctx.fill();
  // flicker tips
  ctx.fillStyle = "rgba(255,200,80,.7)";
  for (let i = 0; i < 4; i++) {
    const a = t / 5 + i * 1.5;
    ctx.beginPath(); ctx.arc(Math.cos(a) * 8, Math.sin(a) * 8, 2, 0, Math.PI * 2); ctx.fill();
  }
}

function drawEscoria(ctx, e, t) {
  const hot = e.hp < e.max * 0.45;
  const dir = e.vx >= 0 ? 1 : -1;
  const crawl = Math.sin(t / 5 + e.x * 0.08) * 2;
  ctx.scale(dir * 1.25, 1.25);
  if (hot) {
    ctx.fillStyle = "rgba(255,80,20,.25)";
    ctx.beginPath(); ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2); ctx.fill();
  }
  // legs
  ctx.strokeStyle = hot ? "#ff6020" : "#6a2010"; ctx.lineWidth = 2.2; ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-8, 4); ctx.lineTo(-12, 10 + crawl);
  ctx.moveTo(0, 5); ctx.lineTo(0, 11 - crawl);
  ctx.moveTo(8, 4); ctx.lineTo(12, 10 + crawl);
  ctx.stroke();
  // shell
  const g = ctx.createRadialGradient(2, -2, 1, 0, 2, 14);
  g.addColorStop(0, hot ? "#ff9040" : "#e06030");
  g.addColorStop(0.5, hot ? "#ff4020" : "#c04010");
  g.addColorStop(1, "#4a1008");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(0, 1, 13, 8, 0, 0, Math.PI * 2); ctx.fill();
  // cracks / lava veins
  ctx.strokeStyle = hot ? "rgba(255,220,80,.8)" : "rgba(255,120,40,.45)"; ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-6, 0); ctx.lineTo(-2, -3); ctx.lineTo(4, 1); ctx.lineTo(8, -2);
  ctx.stroke();
  // eyes
  ctx.fillStyle = hot ? "#ffe060" : "#ff8040";
  ctx.beginPath(); ctx.arc(6, -1, 2, 0, Math.PI * 2); ctx.arc(10, 1, 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#111";
  ctx.beginPath(); ctx.arc(6.4, -1, 0.8, 0, Math.PI * 2); ctx.arc(10.3, 1, 0.7, 0, Math.PI * 2); ctx.fill();
  ctx.lineCap = "butt";
}

function drawUfo(ctx, e, t) {
  const bob = Math.sin(t / 8 + (e.bob || 0)) * 1.5;
  ctx.translate(0, bob);
  // beam when telegraph (reforzado; el anillo global también lo marca)
  if (e.telegraph) {
    ctx.fillStyle = "rgba(126,231,255,.32)";
    ctx.beginPath();
    ctx.moveTo(-8, 6); ctx.lineTo(8, 6); ctx.lineTo(18, 34); ctx.lineTo(-18, 34); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,180,.7)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(0, 34, 14, 3.5, 0, 0, Math.PI * 2); ctx.stroke();
  }
  // saucer body
  const g = ctx.createLinearGradient(0, -8, 0, 8);
  g.addColorStop(0, "#c8f0ff");
  g.addColorStop(0.45, "#7ee7ff");
  g.addColorStop(1, "#2a6a90");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(0, 2, 18, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(20,60,90,.6)"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(0, 2, 18, 6, 0, 0, Math.PI * 2); ctx.stroke();
  // dome
  ctx.fillStyle = "rgba(180,240,255,.85)";
  ctx.beginPath(); ctx.ellipse(0, -2, 8, 7, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.45)";
  ctx.beginPath(); ctx.ellipse(-2, -4, 3, 2.5, 0, 0, Math.PI * 2); ctx.fill();
  // lights
  for (let i = -2; i <= 2; i++) {
    const tw = 0.4 + 0.4 * Math.sin(t / 4 + i);
    ctx.fillStyle = `rgba(255,${180 + i * 10},80,${tw})`;
    ctx.beginPath(); ctx.arc(i * 6, 4, 1.8, 0, Math.PI * 2); ctx.fill();
  }
}

function drawBoss(ctx, e, t) {
  // Arte vectorial animado de la Reina del Nido (engine/boss-art.js)
  if (e.telegraph && !e.dying && !(e.introT > 0)) drawBossTelegraph(ctx, e, t);
  drawBossQueen(ctx, e, t);
  if (e.shockT > 0 && e.shockR) {
    ctx.strokeStyle = "rgba(255,120,40,.55)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, e.h / 2, Math.min(120, e.shockR * 0.55), 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawBossTelegraph(ctx, e, t) {
  const kind = e.teleKind || "";
  const prog = e.windMax ? e.wind / e.windMax : 0.5;
  const pulse = 1 + Math.sin(t * 0.5) * 0.1;
  const face = e.facing || 1;

  if (kind === "charge") {
    const len = 90 + prog * 140;
    ctx.fillStyle = "rgba(255,30,30," + (0.2 + prog * 0.35) + ")";
    ctx.fillRect(face > 0 ? 10 : -10 - len, e.h / 2 - 4, len, 14 * pulse);
    ctx.strokeStyle = "rgba(255,80,40,.9)";
    ctx.lineWidth = 2;
    ctx.strokeRect(face > 0 ? 10 : -10 - len, e.h / 2 - 4, len, 14 * pulse);
    ctx.fillStyle = "rgba(255,200,60,.85)";
    const tipX = face > 0 ? 10 + len : -10 - len;
    ctx.beginPath();
    ctx.moveTo(tipX, e.h / 2 + 3);
    ctx.lineTo(tipX + face * 16, e.h / 2 + 10);
    ctx.lineTo(tipX, e.h / 2 + 17);
    ctx.fill();
  } else if (kind === "slam") {
    const r = (40 + prog * 70) * pulse;
    ctx.strokeStyle = "rgba(255,100,40," + (0.45 + prog * 0.4) + ")";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, e.h / 2, r, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "rgba(255,60,20," + (0.12 + prog * 0.2) + ")";
    ctx.beginPath(); ctx.arc(0, e.h / 2, r * 0.7, 0, Math.PI * 2); ctx.fill();
  } else if (kind === "swoop") {
    ctx.strokeStyle = "rgba(255,80,120," + (0.5 + prog * 0.4) + ")";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.quadraticCurveTo(face * 50, 30, face * (70 + prog * 50), 50 + prog * 30);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,120,160,.7)";
    ctx.beginPath();
    ctx.arc(face * (70 + prog * 50), 50 + prog * 30, 6 * pulse, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "spit") {
    ctx.strokeStyle = "rgba(255,90,110," + (0.55 + prog * 0.35) + ")";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(face * 28, -4, 18 + prog * 16, 0, Math.PI * 2);
    ctx.stroke();
  }
}

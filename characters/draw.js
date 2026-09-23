import { drawBaby } from "./baby.js";
import { spriteFor } from "./sprites.js";

function glow(ctx, r, color, t, extra) {
  ctx.save();
  ctx.globalAlpha = 0.22 + Math.sin(t / 8) * 0.1;
  const g = ctx.createRadialGradient(0, 2, 3, 0, 2, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 2, r, 0, Math.PI * 2);
  ctx.fill();
  if (extra) {
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = color;
    for (let i = 0; i < extra; i++) {
      const a = t / 10 + i * ((Math.PI * 2) / extra);
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.42, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function oval(ctx, x, y, rx, ry, fill, stroke, lw) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw || 1.5;
    ctx.stroke();
  }
}

function eye(ctx, x, y, w, h, angry) {
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(x, y, w, h, angry ? -0.25 * Math.sign(x) : 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a0c08";
  ctx.beginPath();
  ctx.arc(x + w * 0.2, y + (angry ? 0.4 : 0), w * 0.48, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x - w * 0.22, y - h * 0.28, w * 0.2, 0, Math.PI * 2);
  ctx.fill();
  if (angry) {
    ctx.strokeStyle = "#1a0c08";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x - w, y - h * 1.1);
    ctx.lineTo(x + w * 0.4, y - h * 0.2);
    ctx.stroke();
  }
}

function star(ctx, x, y, r, fill) {
  ctx.fillStyle = fill || "#fff6a8";
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + i * ((Math.PI * 2) / 5);
    const b = a + Math.PI / 5;
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    ctx.lineTo(x + Math.cos(b) * r * 0.4, y + Math.sin(b) * r * 0.4);
  }
  ctx.closePath();
  ctx.fill();
}

function leaf(ctx, x, y, s, rot, fill) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot || 0);
  ctx.fillStyle = fill || "#3ecf7a";
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.quadraticCurveTo(s * 0.7, 0, 0, s);
  ctx.quadraticCurveTo(-s * 0.7, 0, 0, -s);
  ctx.fill();
  ctx.restore();
}

function shine(ctx, x, y, rx, ry) {
  ctx.fillStyle = "rgba(255,255,255,.32)";
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, -0.5, 0, Math.PI * 2);
  ctx.fill();
}

function limb(ctx, x1, y1, x2, y2, w, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

export function drawCharacter(ctx, p, cam, t) {
  const x = p.x - cam.x;
  const y = p.y - cam.y;
  const evo = Number(p.evo) || 0;
  const speed = Math.abs(p.vx || 0);
  const moving = !!p.grounded && speed > 0.55;
  const runT = t * (0.52 + speed * 0.16);
  const step = Math.sin(runT);
  const idle = p.grounded && !moving;
  const air = !p.grounded;
  const atk = p.melee > 0 ? (12 - p.melee) / 12 : 0;
  const hurt = (p.invuln || 0) > 0 || (p.hurtFlash || 0) > 0;
  const hurtFresh = (p.invuln || 0) > 18; // recoil fuerte al inicio
  const ascending = air && (p.vy || 0) < -1.2;
  const falling = air && (p.vy || 0) > 1.5;

  // Walk cycle + jump squash/stretch + hurt recoil (drawers leen p._anim)
  const bob = idle
    ? Math.sin(t * 0.1) * 1.8
    : moving
      ? Math.abs(step) * -2.2
      : ascending ? -2.4 : falling ? 2.0 : 0.6;
  const tilt = moving
    ? step * 0.07
    : air
      ? (ascending ? -0.09 : 0.11)
      : Math.sin(t * 0.08) * 0.03;
  let sx = 1;
  let sy = 1;
  if (ascending) { sx = 0.88; sy = 1.14; }       // stretch up
  else if (falling) { sx = 1.08; sy = 0.90; }    // squash fall
  else if (moving) { sx = 1 + step * 0.045; sy = 1 - step * 0.045; }
  else { sx = 1 + Math.sin(t * 0.1) * 0.02; sy = 1 - Math.sin(t * 0.1) * 0.02; }
  // Landing squash residual if just grounded after fall
  if (p.grounded && p._wasAir) { sx = 1.12; sy = 0.86; }
  p._wasAir = air;

  const recoil = hurtFresh ? 0.14 : hurt ? 0.05 : 0;
  const recoilX = hurtFresh ? -5 * (p.facing || 1) : 0;
  p._anim = {
    step, moving, idle, air, ascending, falling, hurt, hurtFresh,
    legL: moving ? step * 7 : (air ? (ascending ? -3 : 4) : Math.sin(t * 0.08) * 1.2),
    legR: moving ? -step * 7 : (air ? (ascending ? -3 : 4) : -Math.sin(t * 0.08) * 1.2),
    armL: moving ? -step * 5 : (atk ? -8 : Math.sin(t * 0.09) * 2),
    armR: moving ? step * 5 : (atk ? 10 : -Math.sin(t * 0.09) * 2),
  };

  // Hurt blink: flash but keep readable (no full vanish)
  if (hurt && (p.invuln || 0) > 0 && (p.invuln || 0) % 6 < 3 && (p.invuln || 0) < 40) {
    ctx.save();
    ctx.globalAlpha = 0.42;
  }
  ctx.save();
  ctx.translate(x + p.w / 2 + recoilX, y + p.h / 2 + bob);
  ctx.scale((p.facing || 1) * sx, sy);
  ctx.rotate(tilt + atk * 0.16 * (p.facing || 1) + recoil * -(p.facing || 1));
  if (hurtFresh) {
    ctx.fillStyle = "rgba(255,80,100,.22)";
    ctx.beginPath();
    ctx.ellipse(0, 0, p.w * 0.55, p.h * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  const spr = spriteFor(p.id, evo);
  if (spr) {
    ctx.fillStyle = "rgba(0,0,0,.32)";
    ctx.beginPath();
    ctx.ellipse(0, p.h / 2 + 2, p.w * 0.42, 4.2, 0, 0, Math.PI * 2);
    ctx.fill();
    if (evo >= 2) glow(ctx, p.w * (0.9 + evo * 0.28 + (evo >= 4 ? 0.55 : 0)), p.color, t, evo >= 4 ? 10 : (evo >= 3 ? 4 + evo : 0));
    if (p.evoBurst > 0) {
      const maxB = Math.max(1, p.evoBurstMax || 90);
      const k = Math.max(0, Math.min(1, p.evoBurst / maxB));
      const progress = 1 - k;
      const radius = Math.max(1, 10 + progress * 216);
      ctx.save();
      ctx.globalAlpha = k;
      ctx.strokeStyle = p.color || "#ffe66a";
      ctx.lineWidth = Math.max(0.5, 6 * k);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      p.evoBurst--;
    }
    const h = Math.max(40, p.h * 1.35 + evo * 2);
    const w = h;
    ctx.drawImage(spr, -w / 2, -h * 0.62, w, h);
    if (moving) {
      ctx.strokeStyle = "rgba(255,255,255,.22)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-6, h * 0.28);
      ctx.lineTo(-4 + step * 8, h * 0.42);
      ctx.moveTo(6, h * 0.28);
      ctx.lineTo(4 - step * 8, h * 0.42);
      ctx.stroke();
    }
    ctx.restore();
    if (hurt && (p.invuln || 0) > 0 && (p.invuln || 0) % 6 < 3 && (p.invuln || 0) < 40) ctx.restore();
    return;
  }
  if (evo === 0) {
    ctx.fillStyle = "rgba(0,0,0,.28)";
    ctx.beginPath();
    ctx.ellipse(0, p.h / 2 + 2, Math.max(8, p.w * 0.36), 3, 0, 0, Math.PI * 2);
    ctx.fill();
    const evo0Drawers = { lilo: drawLilo, stitch: drawStitch, dragon: drawDino, pikachu: drawPikachu };
    if (evo0Drawers[p.id]) {
      ctx.scale(0.86, 0.86);
      evo0Drawers[p.id](ctx, p, t, 0);
    } else {
      drawBaby(ctx, p, t);
    }
    if (hurt) {
      ctx.save();
      ctx.globalAlpha = 0.24;
      ctx.fillStyle = "#ff3030";
      ctx.beginPath();
      ctx.ellipse(0, 2, 14, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
    if (hurt && (p.invuln || 0) > 0 && (p.invuln || 0) % 6 < 3 && (p.invuln || 0) < 40) ctx.restore();
    return;
  }
  ctx.fillStyle = "rgba(0,0,0,.32)";
  ctx.beginPath();
  ctx.ellipse(0, p.h / 2 + 3, p.w * 0.42, 4.2, 0, 0, Math.PI * 2);
  ctx.fill();
  if (evo >= 2) glow(ctx, p.w * (0.9 + evo * 0.28 + (evo >= 4 ? 0.55 : 0)), p.color, t, evo >= 4 ? 10 : (evo >= 3 ? 4 + evo : 0));
  if (p.evoBurst > 0) {
    const maxB = Math.max(1, p.evoBurstMax || 90);
    const k = Math.max(0, Math.min(1, p.evoBurst / maxB));
    const progress = 1 - k;
    const radius = Math.max(1, 10 + progress * 216);
    ctx.save();
    ctx.globalAlpha = k;
    ctx.strokeStyle = p.color || "#ffe66a";
    ctx.lineWidth = Math.max(0.5, 6 * k);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    p.evoBurst--;
  }
  ctx.scale(0.92 + evo * 0.055, 0.92 + evo * 0.055);
  const drawers = { lilo: drawLilo, stitch: drawStitch, dragon: drawDino, pikachu: drawPikachu, cat: drawCat, frita: drawKetchup };
  (drawers[p.id] || drawLilo)(ctx, p, t, evo);
  if (hurt) {
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#ff3030";
    ctx.beginPath();
    ctx.ellipse(0, 2, 18 + evo * 2, 16 + evo * 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  if (hurt && (p.invuln || 0) > 0 && (p.invuln || 0) % 6 < 3 && (p.invuln || 0) < 40) ctx.restore();
}

function drawLilo(ctx, p, t, evo) {
  if (evo >= 4) { drawLiloGod(ctx, p, t); return; }
  // Kilo: chica clara — bun alto, flequillo, vestido A-line, piernas finas
  const anim = p._anim || {};
  const ceremonial = evo >= 3;
  const ohana = evo >= 2;
  const baby = evo === 0;
  const dress = ceremonial ? "#ffd36a" : ohana ? "#ff4d78" : baby ? "#ff9ab0" : "#e0142c";
  const dressTrim = ceremonial ? "#fff8d6" : "#fff";
  const skin = "#f3c4a0";
  const hair = ceremonial ? "#3a1608" : "#1a0c08";
  const ink = "#3a140c";
  const hem = ceremonial ? 24 : ohana ? 17 : baby ? 11 : 14;
  const dressH = ceremonial ? 26 : ohana ? 20 : baby ? 14 : 18;
  const headY = ceremonial ? -14 : baby ? -7 : -10;
  const bunY = ceremonial ? -28 : ohana ? -24 : baby ? -16 : -20;
  const legAmp = anim.legL || 0;
  const legAmpR = anim.legR || 0;
  const armL = anim.armL || 0;
  const armR = anim.armR || 0;

  if (ceremonial) {
    // Capa ceremonial ancha (silueta ≠ evo2)
    ctx.fillStyle = "rgba(255,200,90,.9)";
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.quadraticCurveTo(-34, 12, -26, 34);
    ctx.lineTo(26, 34);
    ctx.quadraticCurveTo(34, 12, 8, 0);
    ctx.fill();
    ctx.strokeStyle = "#c47a18";
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }

  // Piernas finas + zapatitos (walk cycle)
  ctx.strokeStyle = skin;
  ctx.lineWidth = 2.6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-5.5, dressH - 3);
  ctx.lineTo(-6.5 + legAmp * 0.15, dressH + 8 + Math.abs(legAmp) * 0.05);
  ctx.moveTo(5.5, dressH - 3);
  ctx.lineTo(6.5 + legAmpR * 0.15, dressH + 8 + Math.abs(legAmpR) * 0.05);
  ctx.stroke();
  ctx.fillStyle = ceremonial ? "#fff8d6" : "#2a1408";
  ctx.beginPath();
  ctx.ellipse(-7 + legAmp * 0.12, dressH + 9, 3.6, 1.9, 0, 0, Math.PI * 2);
  ctx.ellipse(7 + legAmpR * 0.12, dressH + 9, 3.6, 1.9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cabello: masa + bun ALTO + flequillo
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.ellipse(0, headY - 4, ceremonial ? 13 : 11.5, ceremonial ? 11 : 9.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Bun alto (firma)
  ctx.beginPath();
  ctx.ellipse(0, bunY, ceremonial ? 9 : 7.5, ceremonial ? 7 : 5.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, bunY - 4, 5.5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // Mechones laterales
  ctx.beginPath();
  ctx.ellipse(-11, headY + 1, 3.8, 8.5, 0.2, 0, Math.PI * 2);
  ctx.ellipse(11, headY + 1, 3.8, 8.5, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Cara redonda + flequillo por encima
  oval(ctx, 0, headY, ceremonial ? 10 : 8.8, ceremonial ? 9.5 : 8.4, skin, ink, 1.15);
  // Flequillo (bangs) — arco sobre la frente
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.moveTo(-8.5, headY - 4);
  ctx.quadraticCurveTo(-4, headY - 1.5, 0, headY - 3.5);
  ctx.quadraticCurveTo(4, headY - 1.5, 8.5, headY - 4);
  ctx.quadraticCurveTo(6, headY - 8, 0, headY - 9);
  ctx.quadraticCurveTo(-6, headY - 8, -8.5, headY - 4);
  ctx.fill();
  shine(ctx, -3, headY - 2.5, 2.6, 1.6);

  // Cara legible: ojos grandes + pupilas + brillo
  eye(ctx, -3.6, headY - 0.5, 2.7, 3.0);
  eye(ctx, 3.6, headY - 0.5, 2.7, 3.0);
  ctx.fillStyle = "rgba(255,120,140,.45)";
  ctx.beginPath();
  ctx.ellipse(-6.8, headY + 2.8, 2.3, 1.4, 0, 0, Math.PI * 2);
  ctx.ellipse(6.8, headY + 2.8, 2.3, 1.4, 0, 0, Math.PI * 2);
  ctx.fill();
  // Nariz + sonrisa claras
  ctx.fillStyle = "#c47a6a";
  ctx.beginPath();
  ctx.ellipse(0, headY + 2.2, 1.1, 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c47a6a";
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(0, headY + 3.8, 3.0, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Vestido A-line
  ctx.fillStyle = dress;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-9, 0);
  ctx.lineTo(9, 0);
  ctx.lineTo(hem, dressH);
  ctx.quadraticCurveTo(0, dressH + 3.5, -hem, dressH);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Panel tummy
  ctx.fillStyle = dressTrim;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-4, 4, 8, ceremonial ? 10 : 7, 2);
  else ctx.rect(-4, 4, 8, ceremonial ? 10 : 7);
  ctx.fill();
  if (ceremonial) {
    // Ribete dorado ceremonial
    ctx.strokeStyle = "#c47a18";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-hem + 2, dressH - 2);
    ctx.quadraticCurveTo(0, dressH + 1, hem - 2, dressH - 2);
    ctx.stroke();
  }

  // Brazos
  oval(ctx, -11 + armL * 0.08, 3, 3.2, 5, skin);
  oval(ctx, 11 + armR * 0.08, 3, 3.2, 5, skin);
  limb(ctx, -11, 5, -17 + armL * 0.2, 11 + Math.abs(armL) * 0.05, 2.8, skin);
  limb(ctx, 11, 5, 17 + armR * 0.2, 11 + Math.abs(armR) * 0.05, 2.8, skin);
  oval(ctx, -18 + armL * 0.2, 12, 2.8, 2.4, skin);
  oval(ctx, 18 + armR * 0.2, 12, 2.8, 2.4, skin);

  if (evo >= 1) {
    // Clip hoja en el bun
    ctx.fillStyle = "#2ec9c0";
    ctx.beginPath();
    ctx.ellipse(3, bunY - 2, 5.5, 2.8, 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  if (ohana) {
    // LEI de flores (cuello) — firma evo2
    const leiY = 2;
    const petals = ["#ff8ad4", "#ffe66a", "#ff6a8a", "#fff", "#ff8ad4"];
    for (let i = 0; i < 5; i++) {
      const a = -0.9 + i * 0.45;
      ctx.fillStyle = petals[i];
      ctx.beginPath();
      ctx.arc(Math.sin(a) * 11, leiY + Math.cos(a) * 2.5, 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffe66a";
      ctx.beginPath();
      ctx.arc(Math.sin(a) * 11, leiY + Math.cos(a) * 2.5, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
    // Corona de flores en bun
    ctx.fillStyle = "#ffd36a";
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.ellipse(i * 4.5, bunY - 5, 2.2, 3.6, i * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (ceremonial) {
    // Varita / ukulele estrella
    ctx.strokeStyle = "#c47a18";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(16, 4);
    ctx.lineTo(24, -30);
    ctx.stroke();
    star(ctx, 24, -34, 7, "#ffe66a");
  }
}

function drawKetchup(ctx, p, t, evo) {
  if (evo >= 4) { drawKetchupGod(ctx, p, t); return; }
  // Capitán Kétchup: tall fry stick + ketchup drip cape + captain hat
  const fry = evo >= 3 ? "#ffe08a" : "#f0b43a";
  const fryDark = evo >= 3 ? "#e8a028" : "#d49220";
  const ink = "#7a3a08";
  const ket = "#c81e1e";
  const stickH = evo >= 3 ? 30 : 26;
  const stickW = evo >= 2 ? 8 : 7;
  const drip = Math.sin(t / 10) * 1.2;

  // Ketchup cape / splash behind (grows with evo — silhouette width)
  if (evo >= 1) {
    ctx.fillStyle = ket;
    ctx.beginPath();
    ctx.moveTo(-stickW - 2, 2);
    ctx.quadraticCurveTo(-18 - evo * 2, 8 + drip, -10 - evo, stickH - 2);
    ctx.lineTo(stickW + 2, stickH - 4);
    ctx.quadraticCurveTo(6, 8, stickW + 2, 2);
    ctx.fill();
    // Drip blobs
    ctx.beginPath();
    ctx.ellipse(-12 - evo, stickH - 1 + drip, 3.5 + evo * 0.4, 4 + evo * 0.3, 0.2, 0, Math.PI * 2);
    ctx.ellipse(-4, stickH + 2, 2.8, 3.2, -0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Tall fry stick body — unique vertical silhouette
  ctx.fillStyle = fry;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-stickW, -6, stickW * 2, stickH, 5);
  else ctx.rect(-stickW, -6, stickW * 2, stickH);
  ctx.fill();
  ctx.stroke();
  // Fry ridges (grill marks)
  ctx.strokeStyle = fryDark;
  ctx.lineWidth = 1.1;
  for (let i = 0; i < 3; i++) {
    const yy = 2 + i * 6;
    ctx.beginPath();
    ctx.moveTo(-stickW + 2, yy);
    ctx.lineTo(stickW - 2, yy + 1);
    ctx.stroke();
  }
  // Salt crystals
  ctx.fillStyle = "#fff";
  for (let i = 0; i < 4 + evo; i++) {
    const sx = ((i * 7) % 11) - 5;
    const sy = 1 + ((i * 5) % 18);
    ctx.beginPath();
    ctx.arc(sx, sy, 1.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Little arms (tiny fry nubs)
  ctx.fillStyle = fry;
  oval(ctx, -stickW - 3, 6, 3.2, 2.4, fry, ink, 1);
  oval(ctx, stickW + 3, 6, 3.2, 2.4, fry, ink, 1);

  // Shoes / footer
  ctx.fillStyle = ket;
  ctx.beginPath();
  ctx.ellipse(-5, stickH - 2, 5, 2.6, 0, 0, Math.PI * 2);
  ctx.ellipse(5, stickH - 2, 5, 2.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Round head on top of fry
  oval(ctx, 0, -14, 9.5, 8.5, "#f4c2a8", ink, 1.15);
  shine(ctx, -3, -17, 3, 2);
  eye(ctx, -3.2, -15, 2.2, 2.4);
  eye(ctx, 3.2, -15, 2.2, 2.4);
  ctx.fillStyle = "rgba(255,120,120,.4)";
  ctx.beginPath();
  ctx.ellipse(-7, -12, 2.2, 1.4, 0, 0, Math.PI * 2);
  ctx.ellipse(7, -12, 2.2, 1.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c47a6a";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, -11, 2.6, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Captain hat (ketchup-bottle crown silhouette)
  ctx.fillStyle = ket;
  ctx.beginPath();
  ctx.moveTo(-11, -20);
  ctx.lineTo(11, -20);
  ctx.lineTo(9, -24);
  ctx.lineTo(-9, -24);
  ctx.closePath();
  ctx.fill();
  // Bottle tip / plume
  ctx.fillRect(-4, -32, 8, 9);
  ctx.beginPath();
  ctx.moveTo(-4, -32);
  ctx.lineTo(0, -38 - evo);
  ctx.lineTo(4, -32);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffe66a";
  ctx.fillRect(-2.5, -29, 5, 3);
  // Brim
  ctx.fillStyle = ink;
  ctx.fillRect(-13, -21, 26, 2.2);

  if (evo >= 2) {
    // Salt shaker badges
    ctx.fillStyle = "#fff";
    ctx.fillRect(-stickW - 1, 10, 5, 4);
    ctx.fillRect(stickW - 4, 10, 5, 4);
    ctx.fillStyle = ket;
    ctx.fillRect(-stickW, 10, 3, 2);
    ctx.fillRect(stickW - 3, 10, 3, 2);
  }
  if (evo >= 3) {
    // Extra-crispy glow fringe
    ctx.strokeStyle = "rgba(255,220,100,.85)";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-stickW - 4, -4);
    ctx.lineTo(-stickW - 8, 8);
    ctx.moveTo(stickW + 4, -4);
    ctx.lineTo(stickW + 8, 8);
    ctx.stroke();
    // Ketchup bottle held out
    ctx.fillStyle = ket;
    ctx.fillRect(16, -2, 5, 10);
    ctx.fillStyle = "#fff";
    ctx.fillRect(16.5, -2, 4, 3);
  }
}

function drawStitch(ctx, p, t, evo) {
  if (evo >= 4) { drawStitchGod(ctx, p, t); return; }
  // Experiment-626 blueprint — silueta ANGULAR inequívoca (NO koala).
  // Cabeza trapecio hard-edge, orejas V+muesca, ojos verticales, hocico corto + dientes,
  // torso hunched w>>h, brazos largos 3 garras, antenas.
  const anim = p._anim || {};
  const angry = evo >= 2;
  const tech = evo >= 3;
  const mini = evo === 0;
  // Navy experimento (evo0 soft blue, evo2 darker angry, evo3 + cyan tech)
  const blue = tech ? "#2a5ccc" : angry ? "#1a3a88" : mini ? "#6a9ee8" : "#1e4a9a";
  const blueDeep = tech ? "#163a8a" : angry ? "#0e2866" : mini ? "#4a7ec8" : "#163878";
  const belly = "#c8e8ff";
  const ink = "#0b1a44";
  const pink = "#f4b6c8";
  const clawCol = tech ? "#e0f8ff" : "#cfe9ff";
  const flap = Math.sin(t / 9) * (2.0 + evo * 0.45);
  const legL = anim.legL || 0;
  const legR = anim.legR || 0;
  const armSwing = anim.armL || 0;

  // ——— 1. OREJAS ENORMES en V (detrás) — tip ~ -55..-70, muesca exterior ———
  const earTip = tech ? -70 : angry ? -64 : mini ? -55 : -60;
  function ear626(side) {
    const s = side;
    const f = flap * s;
    const tipY = earTip + f;
    // Outer V polygon (hard edges)
    ctx.fillStyle = blue;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(s * 7, -6);                 // base inner
    ctx.lineTo(s * 11, -10);               // base mid
    ctx.lineTo(s * 22, tipY + 18);         // mid outer
    ctx.lineTo(s * 26, tipY + 6);          // notch bottom
    ctx.lineTo(s * 20, tipY + 10);         // notch in
    ctx.lineTo(s * 24, tipY);              // tip
    ctx.lineTo(s * 10, tipY + 22);         // inner ridge
    ctx.lineTo(s * 5, -4);                 // base top
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Pink interior (angular, not fluffy)
    ctx.fillStyle = pink;
    ctx.beginPath();
    ctx.moveTo(s * 9, -5);
    ctx.lineTo(s * 18, tipY + 20);
    ctx.lineTo(s * 20, tipY + 8);
    ctx.lineTo(s * 14, tipY + 16);
    ctx.lineTo(s * 8, -2);
    ctx.closePath();
    ctx.fill();
  }
  ear626(-1);
  ear626(1);

  // ——— 7. ANTENAS con tip (dishes en evo3) ———
  const antY = tech ? -42 : mini ? -30 : -36;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.0;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-5, -18);
  ctx.lineTo(-8, antY);
  ctx.moveTo(5, -18);
  ctx.lineTo(8, antY);
  ctx.stroke();
  if (tech) {
    // Dish tips
    ctx.fillStyle = "#7ef0ff";
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.1;
    for (const ax of [-8, 8]) {
      ctx.beginPath();
      ctx.ellipse(ax, antY - 1, 4.2, 2.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(ax, antY - 1, 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#7ef0ff";
    }
  } else {
    ctx.fillStyle = blue;
    ctx.beginPath();
    ctx.arc(-8, antY - 1, mini ? 2.0 : 2.6, 0, Math.PI * 2);
    ctx.arc(8, antY - 1, mini ? 2.0 : 2.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // ——— 5. PIERNAS cortas stance ANCHO ———
  ctx.strokeStyle = blue;
  ctx.lineWidth = mini ? 4.2 : 5.4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-11, 12);
  ctx.lineTo(-18 + legL * 0.12, 24);
  ctx.moveTo(11, 12);
  ctx.lineTo(18 + legR * 0.12, 24);
  ctx.stroke();
  ctx.fillStyle = blueDeep;
  ctx.beginPath();
  ctx.ellipse(-19 + legL * 0.1, 25, 5.8, 2.5, 0, 0, Math.PI * 2);
  ctx.ellipse(19 + legR * 0.1, 25, 5.8, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // ——— 5. CUERPO bajo/ancho hunched — trapecio aplastado (w >> h), NO bola ———
  const bw = tech ? 22 : angry ? 20 : mini ? 14 : 17; // half-width
  const bh = tech ? 11 : mini ? 7.5 : 9;              // half-height (mucho menor)
  const by = mini ? 7 : 8;
  ctx.fillStyle = blue;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.35;
  ctx.beginPath();
  // Shoulders forward / hunched trapezoid
  ctx.moveTo(-bw * 0.72, by - bh);          // shoulder L
  ctx.lineTo(bw * 0.72, by - bh);           // shoulder R
  ctx.lineTo(bw, by + bh * 0.35);           // hip flare R
  ctx.lineTo(bw * 0.55, by + bh);           // bottom R
  ctx.lineTo(-bw * 0.55, by + bh);          // bottom L
  ctx.lineTo(-bw, by + bh * 0.35);          // hip flare L
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Belly panel
  ctx.fillStyle = belly;
  ctx.beginPath();
  ctx.moveTo(-bw * 0.35, by - bh * 0.2);
  ctx.lineTo(bw * 0.35, by - bh * 0.2);
  ctx.lineTo(bw * 0.28, by + bh * 0.75);
  ctx.lineTo(-bw * 0.28, by + bh * 0.75);
  ctx.closePath();
  ctx.fill();

  // ——— 1. CABEZA ANGULAR / trapezoidal — SOLO moveTo/lineTo (cráneo polígono hard-edge) ———
  const hx = mini ? 11 : 14;       // jaw half-width (más ancho)
  const hTop = mini ? 7 : 9;       // top half-width (más estrecho)
  const hyTop = mini ? -18 : -20;  // top y
  const hyJaw = mini ? 1 : 2;      // jaw y
  const hyChin = mini ? 6 : 7;     // chin y (plano / leve V)
  ctx.fillStyle = blue;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-hTop, hyTop);                 // top-L
  ctx.lineTo(hTop, hyTop);                  // top-R
  ctx.lineTo(hx, hyJaw);                    // jaw-R (más ancho)
  ctx.lineTo(hx * 0.35, hyChin);            // chin-R
  ctx.lineTo(-hx * 0.35, hyChin);           // chin-L (plano / leve V)
  ctx.lineTo(-hx, hyJaw);                   // jaw-L
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // ——— 4. HOCICO corto marcado (trapecio saliente) ———
  ctx.fillStyle = belly;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(-6, hyJaw - 1);
  ctx.lineTo(6, hyJaw - 1);
  ctx.lineTo(5, hyChin + 1);
  ctx.lineTo(-5, hyChin + 1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Nose pad
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.moveTo(-2.2, hyJaw + 0.5);
  ctx.lineTo(2.2, hyJaw + 0.5);
  ctx.lineTo(1.4, hyJaw + 2.4);
  ctx.lineTo(-1.4, hyJaw + 2.4);
  ctx.closePath();
  ctx.fill();

  // ——— 4. DIENTES visibles SIEMPRE (2–4) ———
  const teethY = hyChin - 0.5;
  ctx.fillStyle = "#1a0a10";
  ctx.beginPath();
  ctx.moveTo(-6.5, teethY);
  ctx.lineTo(6.5, teethY);
  ctx.lineTo(5.5, teethY + (angry ? 5 : 3.2));
  ctx.lineTo(-5.5, teethY + (angry ? 5 : 3.2));
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff";
  const toothW = mini ? 1.6 : 2.1;
  const toothH = mini ? 2.2 : (angry ? 4.2 : 2.8);
  const teeth = angry ? [-5, -1.6, 1.6, 5] : mini ? [-2.8, 1.0] : [-4, -0.7, 2.6];
  for (const tx of teeth) {
    ctx.beginPath();
    ctx.moveTo(tx, teethY);
    ctx.lineTo(tx + toothW * 0.5, teethY + toothH);
    ctx.lineTo(tx + toothW, teethY);
    ctx.closePath();
    ctx.fill();
  }

  // ——— 3. OJOS óvalo negros GIGANTES casi verticales (rx pequeño, ry grande) ———
  const eyeRx = mini ? 3.6 : 4.5;
  const eyeRy = angry ? 9.5 : mini ? 7.2 : 9.0;
  const eyeY = mini ? -8 : -9;
  const eyeX = mini ? 5.2 : 6.5;
  ctx.fillStyle = angry ? "#ff1a2a" : "#0a0a12";
  ctx.beginPath();
  ctx.ellipse(-eyeX, eyeY, eyeRx, eyeRy, 0, 0, Math.PI * 2);
  ctx.ellipse(eyeX, eyeY, eyeRx, eyeRy, 0, 0, Math.PI * 2);
  ctx.fill();
  // White highlights
  ctx.fillStyle = "#fff";
  ctx.fillRect(-eyeX - 1.6, eyeY - eyeRy * 0.45, 2.2, 2.8);
  ctx.fillRect(eyeX - 0.4, eyeY - eyeRy * 0.45, 2.2, 2.8);
  // evo2+ angry brows in V
  if (angry) {
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-eyeX - eyeRx, eyeY - eyeRy * 0.95);
    ctx.lineTo(-eyeX + eyeRx * 0.3, eyeY - eyeRy * 0.25);
    ctx.moveTo(eyeX + eyeRx, eyeY - eyeRy * 0.95);
    ctx.lineTo(eyeX - eyeRx * 0.3, eyeY - eyeRy * 0.25);
    ctx.stroke();
  }
  if (tech) {
    ctx.strokeStyle = "#7ef0ff";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-eyeX - eyeRx - 1, eyeY - eyeRy - 1, (eyeX + eyeRx + 1) * 2, eyeRy * 2 + 2);
  }

  // ——— 6. BRAZOS LARGOS + 3 GARRAS por mano ———
  const clawY = angry ? -12 : mini ? 2 : 0;
  const clawX = angry ? 32 : mini ? 18 : 28;
  ctx.strokeStyle = blue;
  ctx.lineWidth = angry ? 5.2 : mini ? 3.6 : 4.4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-bw + 1, by - bh * 0.3);
  ctx.lineTo(-clawX + armSwing * 0.15, clawY);
  ctx.moveTo(bw - 1, by - bh * 0.3);
  ctx.lineTo(clawX + armSwing * 0.15, clawY);
  ctx.stroke();
  // Three distinct claw spikes per hand
  function claws626(side) {
    const cx = side * clawX + armSwing * 0.15;
    const cy = clawY;
    const len = angry ? 11 : mini ? 6 : 9;
    ctx.fillStyle = clawCol;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.0;
    const tips = [
      [side * len, -len * 0.85],
      [side * len * 1.05, -len * 0.15],
      [side * len * 0.85, len * 0.55],
    ];
    for (const [dx, dy] of tips) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + dx * 0.35, cy + dy * 0.2);
      ctx.lineTo(cx + dx, cy + dy);
      ctx.lineTo(cx + dx * 0.2, cy + dy * 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }
  claws626(-1);
  claws626(1);

  // ——— evo3 tech plates (hombros/pecho) — silueta sigue angular ———
  if (tech) {
    ctx.fillStyle = "#7ef0ff";
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.1;
    // Shoulder plates
    ctx.beginPath();
    ctx.moveTo(-bw * 0.85, by - bh);
    ctx.lineTo(-bw - 2, by - bh + 4);
    ctx.lineTo(-bw * 0.55, by - bh + 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bw * 0.85, by - bh);
    ctx.lineTo(bw + 2, by - bh + 4);
    ctx.lineTo(bw * 0.55, by - bh + 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Chest plate
    ctx.fillStyle = "#5ad4ff";
    ctx.beginPath();
    ctx.moveTo(0, by - bh * 0.5);
    ctx.lineTo(-5, by + 1);
    ctx.lineTo(0, by + 5);
    ctx.lineTo(5, by + 1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Energy veins
    ctx.strokeStyle = "rgba(126,240,255,.85)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-bw * 0.6, by + 2);
    ctx.lineTo(-bw - 4, by + 8);
    ctx.moveTo(bw * 0.6, by + 2);
    ctx.lineTo(bw + 4, by + 8);
    ctx.stroke();
  }
}
function drawPikachu(ctx, p, t, evo) {
  if (evo >= 4) { drawPikachuGod(ctx, p, t); return; }
  // Chispín: chibi redondo Ohana — orejas redondas con tip, cola zig-zag Ohana
  const anim = p._anim || {};
  const fat = evo >= 3;       // Trueno Gordo
  const volt = evo >= 2;      // Voltín
  const body = fat ? "#fff36a" : volt ? "#f0a020" : evo === 0 ? "#fff36a" : "#ffe44a";
  const ink = "#3a2208";
  const accent = "#2ec9c0";   // motivo Ohana (cyan) en vez de discos rojos clásicos
  const legL = anim.legL || 0;
  const legR = anim.legR || 0;
  const s = fat ? 1.15 : 1 + evo * 0.04;
  ctx.scale(s, s);

  if (volt) {
    // Chispas Ohana (hoja-rayo)
    ctx.strokeStyle = "rgba(46,201,192,.55)";
    ctx.lineWidth = 1.8;
    for (let i = 0; i < 3 + evo; i++) {
      const a = t / 7 + i * 1.2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * (16 + evo * 3), Math.sin(a) * (10 + evo * 2));
      ctx.stroke();
    }
  }

  // Cola zig-zag Ohana (única — crece con evo)
  const wag = Math.sin(t / 8) * 2;
  const tailScale = fat ? 1.5 : volt ? 1.25 : 1;
  ctx.save();
  ctx.translate(8, 8);
  ctx.scale(tailScale, tailScale);
  ctx.strokeStyle = body;
  ctx.lineWidth = fat ? 6.5 : 5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.lineTo(6 + wag * 0.2, -8);
  ctx.lineTo(2, 2);
  ctx.lineTo(12 + wag * 0.15, -4);
  ctx.lineTo(8, 8);
  ctx.lineTo(18, 2 + wag * 0.1);
  ctx.stroke();
  // Punta flare Ohana (cyan notch)
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(16, 0);
  ctx.lineTo(28, -8);
  ctx.lineTo(18, 8);
  ctx.lineTo(22, 10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Patitas
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(-7 + legL * 0.1, fat ? 18 : 15, fat ? 6 : 4.2, 3, 0, 0, Math.PI * 2);
  ctx.ellipse(7 + legR * 0.1, fat ? 18 : 15, fat ? 6 : 4.2, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cuerpo chibi MUY redondo (cabeza+cuerpo casi un blob)
  const bw = fat ? 18 : volt ? 14 : evo === 0 ? 11 : 12.5;
  const bh = fat ? 16 : volt ? 13 : evo === 0 ? 10 : 11.5;
  oval(ctx, 0, fat ? 6 : 5, bw, bh, body, ink, 1.3);
  oval(ctx, 0, fat ? 9 : 8, bw * 0.55, bh * 0.5, "rgba(255,255,255,.22)");

  // Brazos cortos
  oval(ctx, -bw + 2, 4, 3.2, 4, body);
  oval(ctx, bw - 2, 4, 3.2, 4, body);

  // Cabeza redonda pegada al cuerpo
  const hr = fat ? 14 : evo === 0 ? 10 : 11.5;
  oval(ctx, 0, -6, hr, hr * 0.95, body, ink, 1.3);
  shine(ctx, -4, -10, 3.8, 2.4);

  // Orejas REDONDAS con tip oscuro (no tall pointed)
  function roundEar(side) {
    const ex = side * (hr * 0.55);
    const ey = -hr * 0.9;
    const erx = volt ? 5.8 : 4.6;
    const ery = volt ? 7.8 : 6.2;
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(ex, ey, erx, ery, side * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.1;
    ctx.stroke();
    // Tip cap (rounded, not triangle)
    ctx.fillStyle = "#1a1208";
    ctx.beginPath();
    ctx.ellipse(ex + side * 0.4, ey - ery * 0.55, erx * 0.62, ery * 0.38, side * 0.15, 0, Math.PI * 2);
    ctx.fill();
    // Tiny Ohana spark on tip at volt+
    if (volt) {
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(ex + side * 0.3, ey - ery * 0.55, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  roundEar(-1);
  roundEar(1);

  // Mejillas: marcas Ohana (corazón / hoja / spark)
  ctx.fillStyle = accent;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    const cx = side * (fat ? 12 : 9.5);
    const cy = 0;
    ctx.moveTo(cx, cy + 2.5);
    ctx.quadraticCurveTo(cx - side * 3, cy - 1, cx, cy - 3);
    ctx.quadraticCurveTo(cx + side * 3, cy - 1, cx, cy + 2.5);
    ctx.fill();
  }
  if (volt) {
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = "rgba(46,201,192,.5)";
    ctx.beginPath();
    ctx.arc(-10, 0, 6, 0, Math.PI * 2);
    ctx.arc(10, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  eye(ctx, -4, -7, fat ? 3 : 2.5, fat ? 3.2 : 2.7);
  eye(ctx, 4, -7, fat ? 3 : 2.5, fat ? 3.2 : 2.7);
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.ellipse(0, -3, 1.2, 0.85, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a3208";
  ctx.lineWidth = 1.3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-2.6, -1);
  ctx.quadraticCurveTo(0, 2, 2.6, -1);
  ctx.stroke();

  if (fat) {
    // Barriguita + rayos laterales (silueta ancha ≠ Voltín)
    oval(ctx, 0, 10, 12, 8, "rgba(255,255,255,.25)");
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-18, -4); ctx.lineTo(-26, -14); ctx.lineTo(-16, -8); ctx.lineTo(-24, -2);
    ctx.moveTo(18, -4); ctx.lineTo(26, -14); ctx.lineTo(16, -8); ctx.lineTo(24, -2);
    ctx.stroke();
  } else if (volt) {
    ctx.strokeStyle = "#fff36a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-14, -8); ctx.lineTo(-20, -16); ctx.lineTo(-12, -10);
    ctx.stroke();
  }
}

function drawCatOLD_UNUSED(ctx, p, t, evo) {
  const body = evo >= 4 ? "#fffde8" : evo >= 3 ? "#fff36a" : evo >= 2 ? "#e0891c" : "#ffe44a";
  const ink = "#5a3208";
  const ear = evo >= 2 ? 36 : 30;

  if (evo >= 3) {
    ctx.strokeStyle = "rgba(255,240,120,.75)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 5 + evo; i++) {
      const a = t / 5 + i * 0.9;
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(Math.cos(a) * (22 + evo * 3), Math.sin(a) * (16 + evo));
      ctx.stroke();
    }
  }

  oval(ctx, 0, 6, evo >= 2 ? 18 : 15, evo >= 2 ? 16 : 13, body, ink, 1.4);
  shine(ctx, -5, 2, 5, 3);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(-8, -6);
  ctx.lineTo(-14, -ear);
  ctx.lineTo(-1, -8);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(8, -6);
  ctx.lineTo(14, -ear);
  ctx.lineTo(1, -8);
  ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.moveTo(-14, -ear);
  ctx.lineTo(-8, -ear);
  ctx.lineTo(-11, -ear + 8);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(14, -ear);
  ctx.lineTo(8, -ear);
  ctx.lineTo(11, -ear + 8);
  ctx.fill();

  eye(ctx, -5, 1, 2.6, 2.9, evo >= 3);
  eye(ctx, 5, 1, 2.6, 2.9, evo >= 3);
  ctx.fillStyle = "#e23";
  ctx.beginPath();
  ctx.arc(-12, 8, evo >= 2 ? 4.2 : 3.2, 0, Math.PI * 2);
  ctx.arc(12, 8, evo >= 2 ? 4.2 : 3.2, 0, Math.PI * 2);
  ctx.fill();
  oval(ctx, 0, 8, 1.6, 1.2, "#333");

  ctx.strokeStyle = evo >= 3 ? "#fff36a" : "#c90";
  ctx.lineWidth = evo >= 2 ? 5.2 : 4.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(14, 6);
  ctx.quadraticCurveTo(32, evo >= 2 ? -22 : -14, 24, 10);
  ctx.quadraticCurveTo(22, 20, evo >= 2 ? 38 : 30, 16);
  ctx.stroke();
  if (evo >= 2) {
    ctx.fillStyle = "#fff36a";
    ctx.beginPath();
    ctx.moveTo(36, 12);
    ctx.lineTo(48, 6);
    ctx.lineTo(40, 18);
    ctx.lineTo(44, 22);
    ctx.closePath();
    ctx.fill();
  }
  if (evo >= 4) {
    oval(ctx, 0, 4, 26, 22, "rgba(255,255,220,.28)");
    star(ctx, -18, -16, 4);
    star(ctx, 20, -12, 3);
  }
}

function drawDino(ctx, p, t, evo) {
  // Five unmistakable silhouettes — soft size via hitbox scale only.
  const unit = Math.max(10, Math.min(p.w || 14, p.h || 14));
  const s = unit / 18;
  ctx.scale(s, s);
  const bob = Math.sin(t / 9) * 0.55;
  ctx.translate(0, 1 + bob);
  if (evo >= 4) drawDinoGod(ctx, t);
  else if (evo >= 3) drawDinoRex(ctx, t);
  else if (evo >= 2) drawDinoPico(ctx, t);
  else if (evo >= 1) drawDinoRunner(ctx, t);
  else drawDinoBaby(ctx, t);
}

function dinoEye(ctx, x, y, w, h, angry) {
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(x, y, w, h, angry ? -0.2 * Math.sign(x || 1) : 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a0c08";
  ctx.beginPath();
  ctx.arc(x + w * 0.18, y + (angry ? 0.35 : 0), w * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x - w * 0.25, y - h * 0.3, w * 0.18, 0, Math.PI * 2);
  ctx.fill();
  if (angry) {
    ctx.strokeStyle = "#1a0c08";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - w, y - h * 1.15);
    ctx.lineTo(x + w * 0.45, y - h * 0.15);
    ctx.stroke();
  }
}

function dinoOval(ctx, x, y, rx, ry, fill, stroke, lw) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.1; ctx.stroke(); }
}

/** Evo 0 — Dino Bebé: round hatchling, stubby limbs, huge eyes. */
function drawDinoBaby(ctx, t) {
  const body = "#9ae8b8";
  const belly = "#e8fff0";
  const ink = "#2a5a40";
  const blush = "rgba(255,150,170,.45)";
  const wag = Math.sin(t / 8) * 1.6;

  // Tiny stub tail
  ctx.strokeStyle = body;
  ctx.lineWidth = 2.6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-4, 3);
  ctx.quadraticCurveTo(-7, 5 + wag * 0.3, -8.5, 3.5 + wag);
  ctx.stroke();

  // Stubby little legs (almost hidden under ball body)
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-2, 5); ctx.lineTo(-2.5, 7.5);
  ctx.moveTo(2.5, 5); ctx.lineTo(3, 7.5);
  ctx.stroke();
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(-2.6, 7.7, 1.8, 0.9, 0, 0, Math.PI * 2);
  ctx.ellipse(3.2, 7.7, 1.8, 0.9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Round potato body
  dinoOval(ctx, 0, 2.2, 7.2, 6.4, body, ink, 1.05);
  dinoOval(ctx, 0.4, 3.6, 4.2, 3.2, belly);

  // Egg-shell flake on back (hatchling cue)
  ctx.fillStyle = "#f4ffe8";
  ctx.strokeStyle = ink;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-3, -2);
  ctx.lineTo(-1, -5.5);
  ctx.lineTo(1.5, -2.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Big round head sitting on body
  dinoOval(ctx, 1.5, -3.2, 6.4, 5.6, body, ink, 1.05);
  dinoOval(ctx, 2.2, -2.2, 3.6, 2.8, belly);

  // HUGE cute eyes
  dinoEye(ctx, -0.5, -3.8, 2.4, 2.6);
  dinoEye(ctx, 4.2, -3.8, 2.4, 2.6);

  // Tiny nostrils + smile
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(5.8, -1.6, 0.4, 0, Math.PI * 2);
  ctx.arc(6.8, -1.6, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.arc(3.5, -0.6, 2.2, 0.15, Math.PI - 0.15);
  ctx.stroke();

  // Blush
  ctx.fillStyle = blush;
  ctx.beginPath();
  ctx.ellipse(-2.2, -1.4, 1.5, 0.9, 0, 0, Math.PI * 2);
  ctx.ellipse(5.8, -1.2, 1.5, 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** Evo 1 — Dino: bipedal runner, longer legs, small crest. */
function drawDinoRunner(ctx, t) {
  const green = "#5ecf6a";
  const belly = "#d8f8c8";
  const ink = "#1e4a22";
  const crest = "#3bb85a";
  const wag = Math.sin(t / 7) * 2.4;
  const stride = Math.sin(t / 5) * 1.2;

  // Horizontal balance tail
  ctx.strokeStyle = green;
  ctx.lineWidth = 3.4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-5, 3);
  ctx.quadraticCurveTo(-12, 5 + wag * 0.3, -15, 2 + wag);
  ctx.stroke();

  // Longer runner legs
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(-1.5, 4); ctx.lineTo(-3 + stride, 10.5);
  ctx.moveTo(3.5, 4); ctx.lineTo(5.5 - stride, 10.5);
  ctx.stroke();
  ctx.fillStyle = green;
  ctx.beginPath();
  ctx.ellipse(-3.2 + stride, 10.7, 2.6, 1.2, 0, 0, Math.PI * 2);
  ctx.ellipse(5.8 - stride, 10.7, 2.6, 1.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lean horizontal torso
  dinoOval(ctx, 1, 2.8, 7.0, 4.4, green, ink, 1.05);
  dinoOval(ctx, 1.2, 4.0, 4.0, 2.2, belly);

  // Stubby arms pumping
  ctx.strokeStyle = green;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-2, 1.2); ctx.lineTo(-5.5, 2.8 + stride * 0.4);
  ctx.moveTo(5, 1.2); ctx.lineTo(8.2, 2.5 - stride * 0.4);
  ctx.stroke();

  // Head on short neck
  dinoOval(ctx, 7.0, -2.4, 5.0, 4.2, green, ink, 1.05);
  dinoOval(ctx, 9.0, -1.4, 3.0, 2.0, belly);

  // Small 2-spike crest
  ctx.fillStyle = crest;
  ctx.beginPath();
  ctx.moveTo(4.2, -5); ctx.lineTo(5.2, -8.4); ctx.lineTo(6.5, -5); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(6.2, -5.2); ctx.lineTo(7.3, -9.0); ctx.lineTo(8.5, -5); ctx.fill();

  dinoEye(ctx, 6.0, -3.0, 1.55, 1.7);
  dinoEye(ctx, 9.0, -3.0, 1.55, 1.7);
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(10.6, -1.4, 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 0.95;
  ctx.beginPath();
  ctx.arc(8.4, -0.4, 1.4, 0.2, Math.PI - 0.2);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,140,160,.38)";
  ctx.beginPath();
  ctx.ellipse(5.2, -1.0, 1.2, 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** Evo 2 — Dino Pico: spiked / beak-ish, tall crest, lean teal. */
function drawDinoPico(ctx, t) {
  const green = "#2ec4b6";
  const belly = "#d0fff4";
  const ink = "#0e3a3a";
  const sail = "#7ef0d8";
  const horn = "#ffe66a";
  const wag = Math.sin(t / 6) * 3;

  // Long whip tail + blade tip
  ctx.strokeStyle = green;
  ctx.lineWidth = 3.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-4, 2);
  ctx.quadraticCurveTo(-11, 6 + wag * 0.2, -18, 1 + wag);
  ctx.stroke();
  ctx.fillStyle = sail;
  ctx.beginPath();
  ctx.moveTo(-16, 1 + wag);
  ctx.lineTo(-21, -2 + wag);
  ctx.lineTo(-17.5, 3.5 + wag);
  ctx.closePath();
  ctx.fill();

  // Tall lean legs
  ctx.strokeStyle = green;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(-1.5, 4); ctx.lineTo(-3, 10.5);
  ctx.moveTo(3.5, 4); ctx.lineTo(5, 10.5);
  ctx.stroke();
  ctx.fillStyle = green;
  ctx.beginPath();
  ctx.ellipse(-3.4, 10.7, 2.6, 1.2, 0, 0, Math.PI * 2);
  ctx.ellipse(5.4, 10.7, 2.6, 1.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Upright lean body
  dinoOval(ctx, 0.5, 2.5, 5.6, 6.6, green, ink, 1.1);
  dinoOval(ctx, 0.8, 4, 3.0, 3.2, belly);

  // Back sail spikes — signature
  ctx.fillStyle = sail;
  const sails = [
    [-3.2, -2.5, 4.2],
    [-0.6, -3.5, 6.2],
    [2.2, -2.8, 5.0],
  ];
  for (const [sx, sy, sh] of sails) {
    ctx.beginPath();
    ctx.moveTo(sx - 1.4, sy);
    ctx.lineTo(sx, sy - sh);
    ctx.lineTo(sx + 1.4, sy);
    ctx.closePath();
    ctx.fill();
  }

  // Arms
  ctx.strokeStyle = green;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-4.2, 0); ctx.lineTo(-7.2, 2.2);
  ctx.moveTo(4.2, 0); ctx.lineTo(7.2, 2.0);
  ctx.stroke();

  // High neck + beaked head
  dinoOval(ctx, 2.5, -5.5, 3.0, 3.4, green, ink, 1);
  dinoOval(ctx, 5.5, -7.2, 5.2, 4.0, green, ink, 1.1);
  // Beak wedge
  ctx.fillStyle = "#e8fff8";
  ctx.strokeStyle = ink;
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(8.5, -7.5);
  ctx.lineTo(14.5, -6.2);
  ctx.lineTo(8.8, -4.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Tall pico horn
  ctx.fillStyle = horn;
  ctx.beginPath();
  ctx.moveTo(4.0, -10);
  ctx.lineTo(5.4, -18);
  ctx.lineTo(7.2, -10.2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 0.8;
  ctx.stroke();

  dinoEye(ctx, 4.0, -7.6, 1.6, 1.8, true);
  dinoEye(ctx, 7.0, -7.6, 1.6, 1.8, true);

  // Soft teal ring
  ctx.strokeStyle = "rgba(46,196,182,.45)";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(2, -2, 11, 0, Math.PI * 2);
  ctx.stroke();
}

/** Evo 3 — Dino Rex: bulky predator, thick tail, jaws, clay/rust. */
function drawDinoRex(ctx, t) {
  const green = "#c96b2a";
  const belly = "#f0d0a8";
  const ink = "#3a1a08";
  const gum = "#6a2030";
  const tooth = "#f4ffe8";
  const ridge = "#e89040";
  const wag = Math.sin(t / 8) * 1.6;

  // Thick counterbalance tail
  ctx.strokeStyle = green;
  ctx.lineWidth = 5.4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-3, 2);
  ctx.quadraticCurveTo(-12, 4 + wag * 0.3, -17, 0 + wag);
  ctx.stroke();
  ctx.fillStyle = ridge;
  for (let i = 0; i < 3; i++) {
    const tx = -8 - i * 3;
    ctx.beginPath();
    ctx.moveTo(tx, 1 + wag * 0.2);
    ctx.lineTo(tx - 0.6, -2 + wag * 0.2);
    ctx.lineTo(tx + 1.4, 1.5 + wag * 0.2);
    ctx.fill();
  }

  // Tree-trunk legs
  ctx.strokeStyle = green;
  ctx.lineWidth = 4.6;
  ctx.beginPath();
  ctx.moveTo(-2, 4); ctx.lineTo(-3.5, 11);
  ctx.moveTo(4, 4); ctx.lineTo(5.8, 11);
  ctx.stroke();
  ctx.fillStyle = green;
  ctx.beginPath();
  ctx.ellipse(-4, 11.4, 3.6, 1.6, 0, 0, Math.PI * 2);
  ctx.ellipse(6.2, 11.4, 3.6, 1.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Heavy barrel body
  dinoOval(ctx, 1, 2.2, 8.4, 6.8, green, ink, 1.2);
  dinoOval(ctx, 1.4, 4, 4.8, 3.6, belly);

  // Tiny T-rex arms
  ctx.strokeStyle = green;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(2, 0); ctx.lineTo(0.5, 2.2);
  ctx.moveTo(4, 0); ctx.lineTo(5.2, 2);
  ctx.stroke();
  ctx.fillStyle = green;
  ctx.beginPath();
  ctx.arc(0.2, 2.5, 1.1, 0, Math.PI * 2);
  ctx.arc(5.4, 2.3, 1.1, 0, Math.PI * 2);
  ctx.fill();

  // HUGE head + snout
  dinoOval(ctx, 8.5, -4.5, 8.5, 6.4, green, ink, 1.25);
  dinoOval(ctx, 14.5, -3.2, 5.2, 3.6, green, ink, 1.1);
  dinoOval(ctx, 14.2, -2.2, 3.6, 2.2, belly);

  // Open jaw
  ctx.fillStyle = gum;
  ctx.beginPath();
  ctx.moveTo(10, -0.5);
  ctx.lineTo(18, 0.5);
  ctx.lineTo(12, 3.5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = tooth;
  for (let i = 0; i < 4; i++) {
    const tx = 11.5 + i * 1.7;
    ctx.beginPath();
    ctx.moveTo(tx, -0.2);
    ctx.lineTo(tx + 0.55, 1.8);
    ctx.lineTo(tx + 1.1, -0.2);
    ctx.fill();
  }

  // Brow crest
  ctx.fillStyle = ridge;
  ctx.beginPath();
  ctx.moveTo(4, -8);
  ctx.lineTo(7, -12.5);
  ctx.lineTo(10, -8.5);
  ctx.closePath();
  ctx.fill();

  dinoEye(ctx, 6.5, -5.5, 2.2, 2.4, true);
  dinoEye(ctx, 11.2, -5.2, 2.0, 2.2, true);

  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.ellipse(17.2, -3.6, 0.7, 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  // Heat shimmer dots
  ctx.fillStyle = "#ffb060";
  for (let i = 0; i < 3; i++) {
    const a = t / 10 + i * 2.1;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 12, Math.sin(a) * 7 - 2, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Evo 4 — DINO GOD: majestic winged kaiju/dragon god (gold + emerald). */
function drawDinoGod(ctx, t) {
  const gold = "#ffd84a";
  const goldLite = "#fff1a0";
  const emerald = "#2ecf7a";
  const emeraldDeep = "#0f8a4a";
  const belly = "#e8fff0";
  const ink = "#1a4a30";
  const flap = Math.sin(t / 5) * 0.36;
  const wag = Math.sin(t / 5) * 3.2;
  const pulse = 0.35 + Math.sin(t / 6) * 0.12;

  // Particle aura (orbiting embers)
  ctx.save();
  ctx.globalAlpha = pulse;
  dinoOval(ctx, 2, 0, 22, 16, "rgba(255,216,74,.35)");
  dinoOval(ctx, 2, 0, 16, 12, "rgba(46,207,122,.28)");
  ctx.restore();
  for (let i = 0; i < 8; i++) {
    const a = t / 5 + i * 0.785;
    const rr = 16 + (i % 3) * 3;
    ctx.fillStyle = i % 2 ? goldLite : emerald;
    ctx.globalAlpha = 0.55 + Math.sin(t / 4 + i) * 0.25;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * rr + 2, Math.sin(a) * rr * 0.65 - 1, 1.4 + (i % 2), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Twin dragon wings (signature silhouette — draw behind body)
  function wing(side) {
    const s = side;
    ctx.save();
    ctx.translate(s * 2, -2);
    ctx.rotate(s * (-0.55 + flap));
    // Membrane
    ctx.fillStyle = "rgba(46,207,122,.72)";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(s * 10, -14, s * 26, -18);
    ctx.quadraticCurveTo(s * 22, -4, s * 28, 6);
    ctx.quadraticCurveTo(s * 16, 4, s * 8, 8);
    ctx.quadraticCurveTo(s * 4, 2, 0, 0);
    ctx.fill();
    // Gold armor plating on wing leading edge
    ctx.strokeStyle = gold;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(s * 10, -14, s * 26, -18);
    ctx.stroke();
    // Wing fingers
    ctx.strokeStyle = emeraldDeep;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(s * 4, -2); ctx.lineTo(s * 22, -10);
    ctx.moveTo(s * 3, 1); ctx.lineTo(s * 24, -2);
    ctx.moveTo(s * 3, 4); ctx.lineTo(s * 22, 5);
    ctx.stroke();
    // Emerald gem on wing joint
    ctx.fillStyle = emerald;
    ctx.beginPath();
    ctx.arc(s * 3, -1, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = goldLite;
    ctx.beginPath();
    ctx.arc(s * 2.4, -1.6, 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  wing(-1);
  wing(1);

  // Comet tail (long ribbon + spark trail)
  ctx.strokeStyle = gold;
  ctx.lineWidth = 4.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-6, 2);
  ctx.quadraticCurveTo(-16, 10 + wag * 0.3, -28, 4 + wag);
  ctx.quadraticCurveTo(-34, -2 + wag, -30, -8 + wag);
  ctx.stroke();
  ctx.strokeStyle = emerald;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-8, 3);
  ctx.quadraticCurveTo(-18, 11 + wag * 0.3, -30, 5 + wag);
  ctx.stroke();
  // Comet tip flare
  ctx.fillStyle = goldLite;
  ctx.beginPath();
  ctx.moveTo(-30, -8 + wag);
  ctx.lineTo(-38, -12 + wag);
  ctx.lineTo(-28, -4 + wag);
  ctx.lineTo(-34, -2 + wag);
  ctx.closePath();
  ctx.fill();
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i % 2 ? emerald : goldLite;
    ctx.beginPath();
    ctx.arc(-22 - i * 3.5, 2 + wag * 0.4 + (i % 2), 1.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Powerful hind legs
  ctx.strokeStyle = gold;
  ctx.lineWidth = 3.6;
  ctx.beginPath();
  ctx.moveTo(-2, 6); ctx.lineTo(-4, 13);
  ctx.moveTo(5, 6); ctx.lineTo(7.5, 13);
  ctx.stroke();
  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.ellipse(-4.5, 13.5, 3.2, 1.5, 0, 0, Math.PI * 2);
  ctx.ellipse(8, 13.5, 3.2, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Emerald claw tips
  ctx.fillStyle = emerald;
  ctx.beginPath();
  ctx.arc(-6.5, 14, 1.1, 0, Math.PI * 2);
  ctx.arc(6, 14, 1.1, 0, Math.PI * 2);
  ctx.arc(10, 14, 1.1, 0, Math.PI * 2);
  ctx.fill();

  // Armored torso plates
  dinoOval(ctx, 2, 2.5, 9.5, 7.5, gold, ink, 1.3);
  // Emerald chest plate
  ctx.fillStyle = emeraldDeep;
  ctx.beginPath();
  ctx.moveTo(2, -2);
  ctx.lineTo(-4, 2);
  ctx.lineTo(-3, 8);
  ctx.lineTo(2, 10);
  ctx.lineTo(7, 8);
  ctx.lineTo(8, 2);
  ctx.closePath();
  ctx.fill();
  dinoOval(ctx, 2.2, 4, 5.2, 3.6, belly);
  // Glowing heart gem
  ctx.fillStyle = emerald;
  ctx.beginPath();
  ctx.ellipse(2.2, 2.5, 2.4, 2.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = goldLite;
  ctx.beginPath();
  ctx.ellipse(1.6, 1.6, 0.8, 1.0, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shoulder armor pads
  dinoOval(ctx, -7, -1, 3.5, 2.8, gold, ink, 1);
  dinoOval(ctx, 10, -1, 3.5, 2.8, gold, ink, 1);
  ctx.fillStyle = emerald;
  ctx.beginPath();
  ctx.arc(-7, -1, 1.4, 0, Math.PI * 2);
  ctx.arc(10, -1, 1.4, 0, Math.PI * 2);
  ctx.fill();

  // Forearms / claws out
  ctx.strokeStyle = gold;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(-7, 1); ctx.lineTo(-14, -4);
  ctx.moveTo(10, 1); ctx.lineTo(17, -5);
  ctx.stroke();
  ctx.fillStyle = emerald;
  for (const [cx, cy] of [[-15, -5], [-13, -2], [18, -6], [16, -3]]) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + (cx < 0 ? -3 : 3), cy - 2);
    ctx.lineTo(cx + (cx < 0 ? -1 : 1), cy + 2);
    ctx.closePath();
    ctx.fill();
  }

  // Noble elongated head
  dinoOval(ctx, 9, -6, 8.5, 6.2, gold, ink, 1.25);
  dinoOval(ctx, 14, -4.5, 5.5, 3.6, gold, ink, 1.1);
  dinoOval(ctx, 13.5, -3.5, 3.8, 2.4, belly);

  // Star crown (5-point celestial diadem)
  const crown = [[4.5, -10], [7, -14], [10, -16.5], [13, -14], [15.5, -10]];
  ctx.fillStyle = goldLite;
  for (const [hx, hy] of crown) {
    star(ctx, hx, hy, 2.8, goldLite);
  }
  // Center emerald star
  star(ctx, 10, -17.5, 4.2, emerald);
  star(ctx, 10, -17.5, 2.0, goldLite);

  // Horns flanking crown
  ctx.fillStyle = emeraldDeep;
  ctx.beginPath();
  ctx.moveTo(5, -9); ctx.lineTo(3, -18); ctx.lineTo(7.5, -10); ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(15, -9); ctx.lineTo(17, -18); ctx.lineTo(12.5, -10); ctx.closePath();
  ctx.fill();

  dinoEye(ctx, 6.5, -6.5, 2.2, 2.4);
  dinoEye(ctx, 12, -6.2, 2.0, 2.2);
  // Emerald iris glint
  ctx.fillStyle = emerald;
  ctx.beginPath();
  ctx.arc(7.2, -6.3, 0.7, 0, Math.PI * 2);
  ctx.arc(12.6, -6.0, 0.65, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.ellipse(17.5, -4.2, 0.7, 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.arc(12, -2.2, 2.0, 0.1, Math.PI - 0.1);
  ctx.stroke();

  // Floating energy rings (halo of power)
  ctx.save();
  ctx.strokeStyle = "rgba(255,216,74,.85)";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(2, 1, 18, 7, 0.15, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(46,207,122,.7)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(2, 1, 14, 5.5, -0.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawCat(ctx, p, t, evo) {
  if (evo >= 4) { drawCatGod(ctx, p, t); return; }
  // Michi: sitting cat — pointed ears + curled tail + whiskers (loaf silhouette)
  const fur = evo >= 3 ? "#ffd0ee" : evo >= 2 ? "#ff8ad4" : "#ffb6e4";
  const ink = "#5a2040";
  const pink = "#ff7ac2";
  const deep = "#ff4da0";
  const s = 1 + evo * 0.06;
  ctx.scale(s, s);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Curled cat tail (whips) — multi at GOD
  const tails = evo >= 4 ? 3 : 1;
  const tw = Math.sin(t / 12) * 3.5;
  for (let i = 0; i < tails; i++) {
    const off = (i - (tails - 1) / 2) * 9;
    ctx.strokeStyle = fur;
    ctx.lineWidth = 5.8;
    ctx.beginPath();
    ctx.moveTo(11, 16);
    ctx.quadraticCurveTo(28 + off, 12 + tw, 26 + off, -2 + tw);
    ctx.quadraticCurveTo(24 + off, -12 + tw, 14 + off, -10 + tw);
    ctx.stroke();
    ctx.fillStyle = evo >= 2 ? "#fff" : deep;
    ctx.beginPath();
    ctx.arc(14 + off, -10 + tw, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sitting loaf body
  oval(ctx, 0, 13, 12.5, 12, fur, ink, 1.3);
  oval(ctx, 0, 17, 7.5, 6, "rgba(255,255,255,.32)");
  // Front paws with toe beans
  ctx.fillStyle = fur;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.1;
  for (const px of [-6.5, 6.5]) {
    ctx.beginPath();
    ctx.ellipse(px, 22.5, 5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = pink;
  for (const px of [-6.5, 6.5]) {
    ctx.beginPath();
    ctx.ellipse(px, 22.5, 1.7, 1.15, 0, 0, Math.PI * 2);
    ctx.fill();
    // Tiny toe dots
    ctx.beginPath();
    ctx.arc(px - 2.2, 21.2, 0.7, 0, Math.PI * 2);
    ctx.arc(px + 2.2, 21.2, 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cat ears BEFORE head (wide base → pointed tip)
  function catEar(dir) {
    const bx = dir * 8.5;
    ctx.fillStyle = fur;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(bx - dir * 8.5, -13);
    ctx.lineTo(bx + dir * 2.5, -32);
    ctx.lineTo(bx + dir * 9.5, -14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = pink;
    ctx.beginPath();
    ctx.moveTo(bx - dir * 4.2, -14.5);
    ctx.lineTo(bx + dir * 2.2, -27.5);
    ctx.lineTo(bx + dir * 5.8, -14.5);
    ctx.closePath();
    ctx.fill();
  }
  catEar(-1);
  catEar(1);

  // Round head
  oval(ctx, 0, -6, 14.5, 12.8, fur, ink, 1.3);
  shine(ctx, -6, -11, 4.4, 2.8);

  // Tabby forehead M
  ctx.strokeStyle = deep;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -16.5); ctx.lineTo(0, -12);
  ctx.moveTo(-4.5, -16); ctx.lineTo(-3, -12.5);
  ctx.moveTo(4.5, -16); ctx.lineTo(3, -12.5);
  ctx.stroke();

  // Long whiskers
  ctx.strokeStyle = "rgba(90,32,64,.72)";
  ctx.lineWidth = 1.05;
  const wk = Math.sin(t / 18) * 0.9;
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(dir * 5, -3); ctx.lineTo(dir * 24, -8 + wk);
    ctx.moveTo(dir * 5, -1); ctx.lineTo(dir * 25, -1);
    ctx.moveTo(dir * 5, 1); ctx.lineTo(dir * 24, 6 - wk);
    ctx.stroke();
  }

  eye(ctx, -5.2, -7, 3.3, 3.9);
  eye(ctx, 5.2, -7, 3.3, 3.9);

  // Pink nose + ω mouth
  ctx.fillStyle = deep;
  ctx.beginPath();
  ctx.moveTo(0, -1.5);
  ctx.lineTo(-2.5, -3.5);
  ctx.lineTo(2.5, -3.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.15;
  ctx.beginPath();
  ctx.moveTo(0, -1.5); ctx.lineTo(0, 0.6);
  ctx.arc(-1.9, 0.6, 1.9, 0, Math.PI);
  ctx.moveTo(0, 0.6);
  ctx.arc(1.9, 0.6, 1.9, 0, Math.PI);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,120,180,.48)";
  ctx.beginPath();
  ctx.ellipse(-9.5, -3, 3.2, 2.1, 0, 0, Math.PI * 2);
  ctx.ellipse(9.5, -3, 3.2, 2.1, 0, 0, Math.PI * 2);
  ctx.fill();

  if (evo >= 2) {
    // Soft cloud ring
    ctx.strokeStyle = "rgba(255,180,220,.75)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, -6, 18, 0, Math.PI * 2);
    ctx.stroke();
    // Fluff cheek tufts
    ctx.fillStyle = fur;
    ctx.beginPath();
    ctx.ellipse(-14, -2, 3.5, 2.8, -0.3, 0, Math.PI * 2);
    ctx.ellipse(14, -2, 3.5, 2.8, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  if (evo >= 3) {
    for (let i = 0; i < 5; i++) {
      star(ctx, Math.cos(t / 10 + i * 1.2) * 20, Math.sin(t / 10 + i * 1.2) * 14 - 6, 2.4, "#fff");
    }
  }
}


/** Evo 4 — KILO GOD: island sun goddess — leaf wings, armor lei, sun crown. */
function drawLiloGod(ctx, p, t) {
  const dress = "#ffd76a";
  const dressDeep = "#e8a028";
  const skin = "#f3c4a0";
  const hair = "#2a1008";
  const ink = "#3a140c";
  const teal = "#2ec9c0";
  const coral = "#ff4d78";
  const flap = Math.sin(t / 8) * 0.12;

  // Solar aura
  ctx.save();
  ctx.globalAlpha = 0.4 + Math.sin(t / 7) * 0.1;
  oval(ctx, 0, -2, 42, 34, "rgba(255,215,106,.45)");
  oval(ctx, 0, -2, 28, 22, "rgba(255,120,140,.25)");
  ctx.restore();

  // Giant leaf wings
  function leafWing(side) {
    ctx.save();
    ctx.translate(side * 8, 2);
    ctx.rotate(side * (-0.85 + flap));
    leaf(ctx, side * 18, -6, 22, side * 0.2, "#2bb56a");
    leaf(ctx, side * 14, 8, 16, side * -0.35, "#7ee08a");
    leaf(ctx, side * 22, 2, 12, side * 0.5, teal);
    ctx.restore();
  }
  leafWing(-1);
  leafWing(1);

  // Energy rings around midriff
  ctx.strokeStyle = "rgba(255,244,180,.9)";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(0, 10, 26, 8, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(46,201,192,.75)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, 10, 20, 5.5, 0.2, 0, Math.PI * 2);
  ctx.stroke();

  // Flowing divine cape
  ctx.fillStyle = "rgba(255,200,80,.9)";
  ctx.beginPath();
  ctx.moveTo(-10, 0);
  ctx.quadraticCurveTo(-38, 14, -28, 40);
  ctx.lineTo(28, 40);
  ctx.quadraticCurveTo(38, 14, 10, 0);
  ctx.fill();
  // Cape armor plates
  ctx.fillStyle = dressDeep;
  for (const px of [-18, -6, 6, 18]) {
    ctx.beginPath();
    ctx.moveTo(px - 5, 18);
    ctx.lineTo(px, 12);
    ctx.lineTo(px + 5, 18);
    ctx.lineTo(px, 28);
    ctx.closePath();
    ctx.fill();
  }

  // Legs + golden sandals
  ctx.strokeStyle = skin;
  ctx.lineWidth = 3.8;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-8, 22); ctx.lineTo(-11, 34);
  ctx.moveTo(8, 22); ctx.lineTo(11, 34);
  ctx.stroke();
  ctx.fillStyle = dress;
  ctx.beginPath();
  ctx.ellipse(-11.5, 35, 5.5, 2.6, 0, 0, Math.PI * 2);
  ctx.ellipse(11.5, 35, 5.5, 2.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Exaggerated hair bun + twin puffs
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.ellipse(0, -28, 20, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-18, -26);
  ctx.quadraticCurveTo(-32, -52, -6, -30);
  ctx.quadraticCurveTo(0, -58, 6, -30);
  ctx.quadraticCurveTo(32, -52, 18, -26);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-14, -14, 5.5, 11, 0.2, 0, Math.PI * 2);
  ctx.ellipse(14, -14, 5.5, 11, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Tall floral crown (petal spikes + blossoms)
  for (let i = -3; i <= 3; i++) {
    const hx = i * 6.5;
    ctx.fillStyle = i % 2 ? coral : dress;
    ctx.beginPath();
    ctx.moveTo(hx - 3, -40);
    ctx.quadraticCurveTo(hx - 1, -50 - Math.abs(i) * 1.5, hx, -56 - Math.abs(i));
    ctx.quadraticCurveTo(hx + 1, -50 - Math.abs(i) * 1.5, hx + 3, -40);
    ctx.closePath();
    ctx.fill();
    // Blossom tip
    ctx.fillStyle = i % 2 ? teal : coral;
    ctx.beginPath();
    ctx.arc(hx, -54 - Math.abs(i), 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
  star(ctx, 0, -58, 5.0, "#fff8c8");

  // Face
  oval(ctx, 0, -16, 12, 11.5, skin, ink, 1.2);
  shine(ctx, -4, -20, 3.5, 2.2);
  eye(ctx, -4.5, -17, 2.8, 3.0);
  eye(ctx, 4.5, -17, 2.8, 3.0);
  ctx.fillStyle = "rgba(255,120,140,.5)";
  ctx.beginPath();
  ctx.ellipse(-8.5, -13, 2.8, 1.7, 0, 0, Math.PI * 2);
  ctx.ellipse(8.5, -13, 2.8, 1.7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c47a6a";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, -12, 3.6, 0.15, Math.PI - 0.15);
  ctx.stroke();

  // Armored A-line dress (layered plates)
  ctx.fillStyle = dress;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-12, -2);
  ctx.lineTo(12, -2);
  ctx.lineTo(26, 26);
  ctx.quadraticCurveTo(0, 32, -26, 26);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Chest armor panel
  ctx.fillStyle = "#fff8d6";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-7, 8);
  ctx.lineTo(0, 16);
  ctx.lineTo(7, 8);
  ctx.closePath();
  ctx.fill();
  star(ctx, 0, 7, 3.5, coral);

  // Lei of armor blossoms
  for (const [lx, ly, c] of [[-14, 2, coral], [-7, 0, teal], [0, -1, coral], [7, 0, teal], [14, 2, coral]]) {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(lx, ly, 3.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(lx, ly, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Arms + golden bracelets
  oval(ctx, -16, 4, 4, 6, skin);
  oval(ctx, 16, 4, 4, 6, skin);
  limb(ctx, -16, 8, -26, 16, 3.8, skin);
  limb(ctx, 16, 8, 26, 16, 3.8, skin);
  oval(ctx, -27, 17, 3.6, 3.2, skin);
  oval(ctx, 27, 17, 3.6, 3.2, skin);
  ctx.strokeStyle = dress;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(-16, 6, 5, 0, Math.PI * 2);
  ctx.arc(16, 6, 5, 0, Math.PI * 2);
  ctx.stroke();

  // Orbiting sun motes
  for (let i = 0; i < 7; i++) {
    const a = t / 7 + i * 0.9;
    star(ctx, Math.cos(a) * 34, Math.sin(a) * 22 - 4, 3.0, i % 2 ? "#fff8c8" : teal);
  }
}

/** Evo 4 — STITCHO GOD: apex experiment — energy plate armor, membrane sails, tech crown. */
function drawStitchGod(ctx, p, t) {
  const blue = "#2a6dff";
  const deep = "#0d2a8a";
  const plate = "#1a3cff";
  const plasma = "#7ef0ff";
  const ink = "#0b1a44";
  const belly = "#c8ecff";
  const flap = Math.sin(t / 6) * 0.32;
  const earFlap = Math.sin(t / 8) * 3.2;
  const pulse = 0.32 + Math.sin(t / 7) * 0.1;

  // Subtle plasma aura (silhouette is armor+sails, not rings alone)
  ctx.save();
  ctx.globalAlpha = pulse;
  oval(ctx, 0, 4, 36, 26, "rgba(42,109,255,.35)");
  ctx.restore();

  // === MEMBRANE SAIL-WINGS from back (flapping) ===
  function sail(side) {
    const s = side;
    ctx.save();
    ctx.translate(s * 4, -2);
    ctx.rotate(s * (-0.5 + flap));
    // Mast bone
    ctx.strokeStyle = plasma;
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(s * 12, -16);
    ctx.lineTo(s * 26, -10);
    ctx.stroke();
    // Membrane sail
    ctx.fillStyle = "rgba(80, 180, 255, .65)";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(s * 10, -20 - flap * 8, s * 26, -10);
    ctx.quadraticCurveTo(s * 20, 4, s * 10, 10);
    ctx.quadraticCurveTo(s * 4, 4, 0, 2);
    ctx.closePath();
    ctx.fill();
    // Ribs
    ctx.strokeStyle = "rgba(10, 40, 120, .85)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(s * 2, -1); ctx.lineTo(s * 14, -14);
    ctx.moveTo(s * 2, 1); ctx.lineTo(s * 22, -4);
    ctx.moveTo(s * 2, 3); ctx.lineTo(s * 14, 8);
    ctx.stroke();
    // Plasma tip
    ctx.fillStyle = plasma;
    ctx.beginPath();
    ctx.arc(s * 26, -10, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  sail(-1);
  sail(1);

  // Huge notched ears (identity) behind helmet
  ctx.fillStyle = blue;
  ctx.beginPath();
  ctx.moveTo(-14, -8);
  ctx.quadraticCurveTo(-40, -58 + earFlap, -2, -18);
  ctx.quadraticCurveTo(-18, -22, -14, -8);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(14, -8);
  ctx.quadraticCurveTo(40, -58 + earFlap, 2, -18);
  ctx.quadraticCurveTo(18, -22, 14, -8);
  ctx.fill();
  ctx.fillStyle = "#f4b6c8";
  ctx.beginPath();
  ctx.ellipse(-22, -34, 5, 11, -0.5, 0, Math.PI * 2);
  ctx.ellipse(22, -34, 5, 11, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff4a8a";
  ctx.beginPath();
  ctx.moveTo(-28, -50 + earFlap); ctx.lineTo(-38, -60 + earFlap); ctx.lineTo(-24, -54 + earFlap);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(28, -50 + earFlap); ctx.lineTo(38, -60 + earFlap); ctx.lineTo(24, -54 + earFlap);
  ctx.fill();

  // === TECH CROWN / HELMET (rings + antennae) ===
  ctx.fillStyle = plate;
  ctx.beginPath();
  ctx.ellipse(0, -18, 16, 8, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  // Halo rings as helmet crest
  ctx.strokeStyle = plasma;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(0, -26, 10, 4.5, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(160,100,255,.9)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, -30, 7, 3, 0.2, 0, Math.PI * 2);
  ctx.stroke();
  // Antennae pair with plasma orbs
  for (const [ax, ay] of [[-8, -36], [8, -36]]) {
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(ax * 0.3, -20);
    ctx.lineTo(ax, ay);
    ctx.stroke();
    ctx.fillStyle = plasma;
    ctx.beginPath();
    ctx.arc(ax, ay - 2, 3.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#a064ff";
    ctx.beginPath();
    ctx.arc(ax, ay - 2, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Legs
  ctx.strokeStyle = deep;
  ctx.lineWidth = 5.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-10, 20); ctx.lineTo(-16, 32);
  ctx.moveTo(10, 20); ctx.lineTo(16, 32);
  ctx.stroke();
  ctx.fillStyle = blue;
  ctx.beginPath();
  ctx.ellipse(-17, 33, 6, 3, 0, 0, Math.PI * 2);
  ctx.ellipse(17, 33, 6, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body
  oval(ctx, 0, 8, 20, 17, blue, ink, 1.5);
  oval(ctx, 0, 13, 12, 9, belly);

  // === SHOULDER + CHEST ENERGY PLATES ===
  // Shoulders
  ctx.fillStyle = plate;
  ctx.beginPath();
  ctx.ellipse(-16, 0, 7, 5, -0.3, 0, Math.PI * 2);
  ctx.ellipse(16, 0, 7, 5, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = plasma;
  ctx.beginPath();
  ctx.arc(-16, 0, 2.4, 0, Math.PI * 2);
  ctx.arc(16, 0, 2.4, 0, Math.PI * 2);
  ctx.fill();
  // Hex chest plate
  ctx.fillStyle = deep;
  ctx.beginPath();
  ctx.moveTo(0, -4);
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 3;
    ctx.lineTo(Math.cos(a) * 9, 5 + Math.sin(a) * 7);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = plasma;
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.fillStyle = plasma;
  ctx.beginPath();
  ctx.arc(0, 5, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#a064ff";
  ctx.beginPath();
  ctx.arc(0, 5, 1.6, 0, Math.PI * 2);
  ctx.fill();

  // Claw arms
  ctx.strokeStyle = blue;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-18, 4); ctx.lineTo(-34, -14);
  ctx.moveTo(18, 4); ctx.lineTo(34, -14);
  ctx.stroke();
  ctx.fillStyle = plasma;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * 34, -14);
    ctx.lineTo(side * 46, -26);
    ctx.lineTo(side * 38, -8);
    ctx.lineTo(side * 44, -4);
    ctx.lineTo(side * 36, -2);
    ctx.closePath();
    ctx.fill();
  }

  // Red god-eyes
  ctx.fillStyle = "#ff1a1a";
  ctx.beginPath();
  ctx.ellipse(-7.5, -2, 5.5, 7, 0, 0, Math.PI * 2);
  ctx.ellipse(7.5, -2, 5.5, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillRect(-9, -5, 2.6, 2.8);
  ctx.fillRect(6.5, -5, 2.6, 2.8);
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.ellipse(0, 7, 2.4, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-5.5, 11, 11, 3.2);
  ctx.fillStyle = "#fff";
  ctx.fillRect(-4.5, 9.8, 2.4, 3.6);
  ctx.fillRect(2.1, 9.8, 2.4, 3.6);

  // Small orbiting shards (accent)
  for (let i = 0; i < 5; i++) {
    const a = t / 6 + i * 1.25;
    ctx.fillStyle = i % 2 ? plasma : "#a064ff";
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 32, Math.sin(a) * 18 + 2, 2.0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Evo 4 — CHISPÍN GOD: thunder deity — bolt wings, mane crown, cheek orbs. */
function drawPikachuGod(ctx, p, t) {
  const body = "#ffe14a";
  const lite = "#fff6a0";
  const ink = "#3a2208";
  const tip = "#1a1208";
  const bolt = "#7ecbff";
  const flap = Math.sin(t / 7) * 0.15;

  // Thunder aura
  ctx.save();
  ctx.globalAlpha = 0.4 + Math.sin(t / 5) * 0.12;
  oval(ctx, 0, 2, 38, 28, "rgba(255,225,74,.5)");
  oval(ctx, 0, 2, 26, 18, "rgba(126,203,255,.3)");
  ctx.restore();

  // Twin lightning-bolt wings
  function boltWing(side) {
    ctx.save();
    ctx.translate(side * 6, 0);
    ctx.rotate(side * (-0.4 + flap));
    ctx.fillStyle = bolt;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(side * 12, -18);
    ctx.lineTo(side * 6, -8);
    ctx.lineTo(side * 22, -28);
    ctx.lineTo(side * 10, -4);
    ctx.lineTo(side * 28, 4);
    ctx.lineTo(side * 8, 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = lite;
    ctx.beginPath();
    ctx.moveTo(side * 2, -2);
    ctx.lineTo(side * 10, -14);
    ctx.lineTo(side * 5, -6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  boltWing(-1);
  boltWing(1);

  // Energy rings
  ctx.strokeStyle = "rgba(255,246,160,.9)";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(0, 6, 28, 10, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(126,203,255,.75)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, 6, 22, 7, 0.3, 0, Math.PI * 2);
  ctx.stroke();

  // Massive zigzag thunder cape/tail
  ctx.strokeStyle = body;
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(8, 14);
  ctx.lineTo(18, -6);
  ctx.lineTo(10, 12);
  ctx.lineTo(30, -4);
  ctx.lineTo(20, 16);
  ctx.lineTo(40, 6);
  ctx.stroke();
  ctx.fillStyle = bolt;
  ctx.beginPath();
  ctx.moveTo(36, 2);
  ctx.lineTo(52, -12);
  ctx.lineTo(38, 14);
  ctx.lineTo(44, 18);
  ctx.closePath();
  ctx.fill();

  // Legs
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(-10, 22, 5.5, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(10, 22, 5.5, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body + chest armor plate
  oval(ctx, 0, 10, 16, 14, body, ink, 1.4);
  ctx.fillStyle = tip;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-8, 8);
  ctx.lineTo(0, 18);
  ctx.lineTo(8, 8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = lite;
  ctx.beginPath();
  ctx.arc(0, 8, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Arms
  oval(ctx, -15, 8, 4.5, 5.5, body);
  oval(ctx, 15, 8, 4.5, 5.5, body);

  // Head
  oval(ctx, 0, -8, 15, 14, body, ink, 1.4);
  shine(ctx, -6, -14, 5, 3);

  // Lightning mane crown (exaggerated spikes)
  ctx.fillStyle = lite;
  const mane = [[-14, -18], [-8, -28], [-2, -34], [4, -36], [10, -32], [16, -22]];
  for (const [mx, my] of mane) {
    ctx.beginPath();
    ctx.moveTo(mx - 3, -12);
    ctx.lineTo(mx, my);
    ctx.lineTo(mx + 3, -12);
    ctx.closePath();
    ctx.fill();
  }
  // Blue tips on mane
  ctx.fillStyle = bolt;
  for (const [mx, my] of mane) {
    ctx.beginPath();
    ctx.moveTo(mx - 1.5, my + 4);
    ctx.lineTo(mx, my);
    ctx.lineTo(mx + 1.5, my + 4);
    ctx.closePath();
    ctx.fill();
  }

  // Tall god-ears with armor tips
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(-10, -16); ctx.lineTo(-14, -48); ctx.lineTo(-2, -16);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(10, -16); ctx.lineTo(14, -48); ctx.lineTo(2, -16);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = tip;
  ctx.beginPath();
  ctx.moveTo(-14, -48); ctx.lineTo(-5, -48); ctx.lineTo(-9, -36); ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(14, -48); ctx.lineTo(5, -48); ctx.lineTo(9, -36); ctx.closePath();
  ctx.fill();
  // Ear energy rings
  ctx.strokeStyle = bolt;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(-10, -30, 5, 0, Math.PI * 2);
  ctx.arc(10, -30, 5, 0, Math.PI * 2);
  ctx.stroke();

  // Black/gold cheek armor plates (not just red disks)
  for (const side of [-1, 1]) {
    ctx.fillStyle = tip;
    ctx.beginPath();
    ctx.ellipse(side * 14, 0, 8, 6.5, side * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = lite;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(side * 14, 0, 8, 6.5, side * 0.15, 0, Math.PI * 2);
    ctx.stroke();
    // Gold gem on plate
    ctx.fillStyle = lite;
    ctx.beginPath();
    ctx.arc(side * 14, 0, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e23b3d";
    ctx.beginPath();
    ctx.arc(side * 14, 0, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  eye(ctx, -5, -10, 3.0, 3.2);
  eye(ctx, 5, -10, 3.0, 3.2);
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.ellipse(0, -4, 1.5, 1.0, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a3208";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-3.5, -1.5);
  ctx.quadraticCurveTo(0, 2.5, 3.5, -1.5);
  ctx.stroke();

  // Orbiting sparks
  for (let i = 0; i < 6; i++) {
    const a = t / 5 + i * 1.05;
    ctx.strokeStyle = i % 2 ? lite : bolt;
    ctx.lineWidth = 2;
    const x = Math.cos(a) * 30;
    const y = Math.sin(a) * 18 - 2;
    ctx.beginPath();
    ctx.moveTo(x, y - 4);
    ctx.lineTo(x + 3, y);
    ctx.lineTo(x - 2, y + 2);
    ctx.lineTo(x + 4, y + 5);
    ctx.stroke();
  }
}

/** Evo 4 — MICHI GOD: celestial cat — upright/levitating, cloud wings, 3+ comet tails. */
function drawCatGod(ctx, p, t) {
  const fur = "#ff6ec8";
  const lite = "#ffd0ee";
  const ink = "#5a2040";
  const pink = "#ff7ac2";
  const deep = "#ff2a9a";
  const cloud = "#f4f0ff";
  const gold = "#ffe66a";
  const tw = Math.sin(t / 10) * 4;
  const flap = Math.sin(t / 7) * 0.18;
  const hover = Math.sin(t / 11) * 1.5;

  ctx.translate(0, hover - 4); // levitating lift

  // Soft celestial aura
  ctx.save();
  ctx.globalAlpha = 0.35 + Math.sin(t / 8) * 0.08;
  oval(ctx, 0, 2, 34, 26, "rgba(255,90,200,.35)");
  ctx.restore();

  // === CLOUD / STAR WINGS ===
  function cloudWing(side) {
    const s = side;
    ctx.save();
    ctx.translate(s * 6, -6);
    ctx.rotate(s * (-0.55 + flap));
    ctx.fillStyle = cloud;
    // Cloud puffs forming wing sail
    for (const [cx, cy, r] of [[8, -6, 7], [16, -12, 6], [22, -4, 7], [14, 4, 5.5], [6, 2, 5]]) {
      ctx.beginPath();
      ctx.arc(s * cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = pink;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(s * 14, -16, s * 24, -6);
    ctx.quadraticCurveTo(s * 16, 6, 0, 4);
    ctx.fill();
    ctx.globalAlpha = 1;
    star(ctx, s * 24, -10, 3.5, gold);
    ctx.restore();
  }
  cloudWing(-1);
  cloudWing(1);

  // === 3+ COMET TAILS ===
  for (let i = 0; i < 4; i++) {
    const off = (i - 1.5) * 10;
    ctx.strokeStyle = i % 2 ? lite : fur;
    ctx.lineWidth = 5.5 - (i % 2);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(8, 16);
    ctx.quadraticCurveTo(28 + off, 12 + tw, 36 + off, -4 + tw);
    ctx.quadraticCurveTo(34 + off, -16 + tw, 22 + off, -14 + tw);
    ctx.stroke();
    // Comet tip spark
    ctx.fillStyle = i % 2 ? gold : cloud;
    ctx.beginPath();
    ctx.arc(22 + off, -14 + tw, 2.8, 0, Math.PI * 2);
    ctx.fill();
    star(ctx, 22 + off, -14 + tw, 3.2, gold);
  }

  // UPRIGHT torso (standing/levitating — NOT loaf)
  oval(ctx, 0, 8, 11, 14, fur, ink, 1.3);
  oval(ctx, 0, 10, 6.5, 8, "rgba(255,255,255,.35)");

  // Collar / chest armor
  ctx.fillStyle = cloud;
  ctx.beginPath();
  ctx.ellipse(0, 0, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = gold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 10, 4, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Bell pendant
  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.arc(0, 6, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = deep;
  ctx.beginPath();
  ctx.arc(0, 7, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Floating hind paws (levitate cue)
  ctx.fillStyle = fur;
  for (const px of [-7, 7]) {
    ctx.beginPath();
    ctx.ellipse(px, 22, 5, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = pink;
  for (const px of [-7, 7]) {
    ctx.beginPath();
    ctx.ellipse(px, 22, 1.8, 1.1, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Tiny front paws held up
  oval(ctx, -12, 6, 3.5, 4, fur);
  oval(ctx, 12, 6, 3.5, 4, fur);

  // Pointed divine ears
  function godEar(dir) {
    const bx = dir * 9;
    ctx.fillStyle = fur;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(bx - dir * 9, -18);
    ctx.lineTo(bx + dir * 2, -44);
    ctx.lineTo(bx + dir * 11, -18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = pink;
    ctx.beginPath();
    ctx.moveTo(bx - dir * 4.5, -20);
    ctx.lineTo(bx + dir * 2, -38);
    ctx.lineTo(bx + dir * 6.5, -20);
    ctx.closePath();
    ctx.fill();
    star(ctx, bx + dir * 1.5, -42, 2.6, cloud);
  }
  godEar(-1);
  godEar(1);

  // Crescent + star crown
  ctx.fillStyle = cloud;
  ctx.beginPath();
  ctx.arc(0, -30, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.arc(3, -32, 7.5, 0, Math.PI * 2);
  ctx.fill();
  star(ctx, -7, -36, 3.4, gold);
  star(ctx, 8, -38, 2.6, gold);

  // Head (upright on torso)
  oval(ctx, 0, -12, 14, 13, fur, ink, 1.3);
  shine(ctx, -6, -17, 4.5, 2.8);
  // Forehead gem
  ctx.fillStyle = deep;
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(-3, -18);
  ctx.lineTo(0, -15);
  ctx.lineTo(3, -18);
  ctx.closePath();
  ctx.fill();

  // Whiskers
  ctx.strokeStyle = "rgba(255,240,250,.85)";
  ctx.lineWidth = 1.2;
  const wk = Math.sin(t / 16) * 1.1;
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(dir * 5, -8); ctx.lineTo(dir * 26, -14 + wk);
    ctx.moveTo(dir * 5, -5); ctx.lineTo(dir * 28, -5);
    ctx.moveTo(dir * 5, -2); ctx.lineTo(dir * 26, 4 - wk);
    ctx.stroke();
  }

  eye(ctx, -5.5, -13, 3.4, 4.0);
  eye(ctx, 5.5, -13, 3.4, 4.0);
  ctx.fillStyle = deep;
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(-2.8, -8.5);
  ctx.lineTo(2.8, -8.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.15;
  ctx.beginPath();
  ctx.moveTo(0, -6); ctx.lineTo(0, -3.5);
  ctx.arc(-2, -3.5, 2, 0, Math.PI);
  ctx.moveTo(0, -3.5);
  ctx.arc(2, -3.5, 2, 0, Math.PI);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,120,180,.5)";
  ctx.beginPath();
  ctx.ellipse(-10, -8, 3.2, 2.1, 0, 0, Math.PI * 2);
  ctx.ellipse(10, -8, 3.2, 2.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Orbiting stars
  for (let i = 0; i < 5; i++) {
    const a = t / 8 + i * 1.25;
    star(ctx, Math.cos(a) * 26, Math.sin(a) * 16 - 2, 2.6, i % 2 ? gold : cloud);
  }
}

/** Evo 4 — KÉtchup GOD: fry emperor — ketchup cape throne, salt armor, fry wings. */
function drawKetchupGod(ctx, p, t) {
  const fry = "#ffd76a";
  const fryDark = "#e8a028";
  const ket = "#e02020";
  const ketLite = "#ff5a5a";
  const ink = "#7a3a08";
  const salt = "#fff8e8";
  const drip = Math.sin(t / 9) * 2;
  const flap = Math.sin(t / 8) * 0.12;

  // Heat aura
  ctx.save();
  ctx.globalAlpha = 0.4 + Math.sin(t / 6) * 0.1;
  oval(ctx, 0, 4, 34, 28, "rgba(255,215,106,.45)");
  oval(ctx, 0, 4, 24, 18, "rgba(224,32,32,.28)");
  ctx.restore();

  // Salt-crystal / sculpted ketchup wings
  function crystalWing(side) {
    const s = side;
    ctx.save();
    ctx.translate(s * 6, 2);
    ctx.rotate(s * (-0.65 + flap));
    // Outer ketchup membrane
    ctx.fillStyle = "rgba(224,32,32,.55)";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(s * 12, -18, s * 28, -8);
    ctx.quadraticCurveTo(s * 22, 8, s * 10, 12);
    ctx.quadraticCurveTo(s * 4, 4, 0, 2);
    ctx.closePath();
    ctx.fill();
    // Salt crystal shards
    ctx.fillStyle = salt;
    ctx.strokeStyle = fry;
    ctx.lineWidth = 1.1;
    const shards = [[10, -10, 6], [18, -4, 5], [14, 4, 4.5], [22, -12, 4]];
    for (const [cx, cy, r] of shards) {
      ctx.beginPath();
      ctx.moveTo(s * cx, cy - r);
      ctx.lineTo(s * (cx + r * 0.7), cy);
      ctx.lineTo(s * cx, cy + r * 0.6);
      ctx.lineTo(s * (cx - r * 0.5), cy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = ketLite;
    ctx.beginPath();
    ctx.arc(s * 28, -6, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  crystalWing(-1);
  crystalWing(1);

  // Massive ketchup throne-cape
  ctx.fillStyle = ket;
  ctx.beginPath();
  ctx.moveTo(-10, -4);
  ctx.quadraticCurveTo(-40, 10 + drip, -32, 44);
  ctx.lineTo(32, 44);
  ctx.quadraticCurveTo(40, 10 + drip, 10, -4);
  ctx.fill();
  // Drip lobes
  for (const dx of [-22, -8, 8, 22]) {
    ctx.beginPath();
    ctx.ellipse(dx, 44 + drip * 0.5, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Cape gold trim
  ctx.strokeStyle = fry;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-10, -4);
  ctx.quadraticCurveTo(-36, 12, -28, 40);
  ctx.moveTo(10, -4);
  ctx.quadraticCurveTo(36, 12, 28, 40);
  ctx.stroke();

  // Energy ketchup rings
  ctx.strokeStyle = "rgba(255,90,90,.85)";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(0, 12, 24, 8, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,215,106,.75)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, 12, 18, 5.5, 0.25, 0, Math.PI * 2);
  ctx.stroke();

  // Tall multi-fry body (bundle of fries = armor)
  for (let i = -2; i <= 2; i++) {
    ctx.fillStyle = i % 2 ? fry : "#ffe08a";
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(i * 5 - 3.5, -8, 7, 36, 3.5);
    else ctx.rect(i * 5 - 3.5, -8, 7, 36);
    ctx.fill();
    ctx.stroke();
  }
  // Salt crystal armor flecks
  ctx.fillStyle = salt;
  for (let i = 0; i < 12; i++) {
    const sx = ((i * 11) % 19) - 9;
    const sy = ((i * 7) % 28) - 2;
    ctx.beginPath();
    ctx.arc(sx, sy, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Golden chest badge
  ctx.fillStyle = fry;
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.lineTo(-8, 10);
  ctx.lineTo(0, 20);
  ctx.lineTo(8, 10);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = ket;
  ctx.beginPath();
  ctx.arc(0, 10, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Shoes
  ctx.fillStyle = ketLite;
  ctx.beginPath();
  ctx.ellipse(-8, 30, 7, 3.2, 0, 0, Math.PI * 2);
  ctx.ellipse(8, 30, 7, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  oval(ctx, 0, -18, 11, 10, "#f4c2a8", ink, 1.2);
  shine(ctx, -3.5, -22, 3.5, 2.2);
  eye(ctx, -3.8, -19, 2.5, 2.7);
  eye(ctx, 3.8, -19, 2.5, 2.7);
  ctx.fillStyle = "rgba(255,120,120,.45)";
  ctx.beginPath();
  ctx.ellipse(-8, -15, 2.5, 1.5, 0, 0, Math.PI * 2);
  ctx.ellipse(8, -15, 2.5, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c47a6a";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(0, -14, 3, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Ornate ketchup-bottle emperor crown
  ctx.fillStyle = ket;
  ctx.beginPath();
  ctx.moveTo(-14, -26);
  ctx.lineTo(14, -26);
  ctx.lineTo(12, -32);
  ctx.lineTo(-12, -32);
  ctx.closePath();
  ctx.fill();
  // Bottle tip tower
  ctx.fillRect(-5, -44, 10, 13);
  ctx.beginPath();
  ctx.moveTo(-5, -44);
  ctx.lineTo(0, -56);
  ctx.lineTo(5, -44);
  ctx.closePath();
  ctx.fill();
  // Gold bands
  ctx.fillStyle = fry;
  ctx.fillRect(-5, -40, 10, 3);
  ctx.fillRect(-14, -28, 28, 2.5);
  // Crown jewels (salt crystals)
  ctx.fillStyle = salt;
  for (const jx of [-10, 0, 10]) {
    ctx.beginPath();
    ctx.moveTo(jx, -32);
    ctx.lineTo(jx - 2.5, -38);
    ctx.lineTo(jx + 2.5, -38);
    ctx.closePath();
    ctx.fill();
  }
  // Brim
  ctx.fillStyle = ink;
  ctx.fillRect(-16, -27, 32, 2.4);

  // Arms holding ketchup scepter
  oval(ctx, -14, 4, 4, 3, fry, ink, 1);
  oval(ctx, 14, 4, 4, 3, fry, ink, 1);
  ctx.strokeStyle = fryDark;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(16, 4);
  ctx.lineTo(28, -24);
  ctx.stroke();
  ctx.fillStyle = ket;
  ctx.fillRect(24, -36, 8, 14);
  ctx.fillStyle = salt;
  ctx.fillRect(25, -36, 6, 4);
  star(ctx, 28, -40, 4, fry);

  // Orbiting salt stars
  for (let i = 0; i < 6; i++) {
    const a = t / 7 + i * 1.05;
    star(ctx, Math.cos(a) * 28, Math.sin(a) * 18, 2.8, i % 2 ? salt : fry);
  }
}

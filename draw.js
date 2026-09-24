import { drawBaby } from "./baby.js";
import { formArt, silhouette } from "./sprites.js";

// ============================================================================
// SISTEMA DE DIBUJO CON SPRITES
// ============================================================================

// Sombra elíptica bajo los pies (coordenadas locales)
function drawShadow(ctx, x, y, rx, ry) {
  ctx.save();
  ctx.globalAlpha *= 0.28;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(x || 0, y || 0, Math.max(1, rx || 10), Math.max(1, ry || 3), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ============================================================================
// SISTEMA DE UTILIDADES AVANZADAS
// ============================================================================

/** Crea un degradado radial para efectos de luz */
function createRadialGradient(ctx, x, y, rInner, rOuter, colorInner, colorOuter) {
  const g = ctx.createRadialGradient(x, y, rInner, x, y, rOuter);
  g.addColorStop(0, colorInner);
  g.addColorStop(1, colorOuter);
  return g;
}
 

/** Halo radial que late */
function drawPulseGlow(ctx, x, y, r, color, t, speed = 10) {
  const k = 0.5 + Math.sin(t / speed) * 0.5;
  const rr = Math.max(2, r * (0.92 + k * 0.12));
  ctx.save();
  ctx.globalAlpha *= 0.18 + k * 0.14;
  const g = ctx.createRadialGradient(x, y, rr * 0.1, x, y, rr);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, rr, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Dibuja un aura de energía - VERSIÓN ÚNICA */
function drawEnergyAura(ctx, x, y, r, color, t, particleCount = 6) {
  // Aura base
  drawPulseGlow(ctx, x, y, r, color, t, 10);
  
  // Partículas orbitantes
  ctx.save();
  for (let i = 0; i < particleCount; i++) {
    const angle = t / 15 + (i / particleCount) * Math.PI * 2;
    const px = x + Math.cos(angle) * r * 0.7;
    const py = y + Math.sin(angle) * r * 0.5;
    const size = 2 + Math.sin(t / 5 + i) * 1;
    
    ctx.globalAlpha = 0.7 + Math.sin(t / 3 + i) * 0.3;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Brillo de partícula
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(px - size*0.3, py - size*0.3, size*0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}


/** Dibuja un ojo detallado con parpadeo */
function drawAdvancedEye(ctx, x, y, w, h, lookDir = {x: 0, y: 0}, blinkState = 0, style = "normal") {
  const blink = Math.max(0, Math.min(1, blinkState));
  const hMod = 1 - blink * 0.9;
  
  // Sombra del ojo
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.beginPath();
  ctx.ellipse(x + 1, y + 1, w, h * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Blanco del ojo
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(x, y, w, h * hMod, 0, 0, Math.PI * 2);
  ctx.fill();
  
  if (blink < 0.8) {
    // Iris
    const irisColor = style === "angry" ? "#c00" : style === "god" ? "#0af" : "#1a0c08";
    ctx.fillStyle = irisColor;
    ctx.beginPath();
    ctx.ellipse(x + lookDir.x * w * 0.3, y + lookDir.y * h * 0.3, w * 0.6, h * 0.6 * hMod, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupila
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(x + lookDir.x * w * 0.3, y + lookDir.y * h * 0.3, w * 0.35, 0, Math.PI * 2);
    ctx.fill();
    
    // Brillo
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x + lookDir.x * w * 0.3 - w*0.25, y + lookDir.y * h * 0.3 - h*0.25, w * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Párpado/párpado superior
  if (blink > 0) {
    ctx.fillStyle = style === "god" ? "#ffe" : "#f3c4a8";
    ctx.beginPath();
    ctx.ellipse(x, y - h * 0.3 * (1-blink), w, h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Dibuja una forma orgánica usando curvas de Bézier */
function drawOrganicShape(ctx, points, fill, stroke, lineWidth = 1.5) {
  if (points.length < 3) return;
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  
  for (let i = 0; i < points.length; i++) {
    const curr = points[i];
    const next = points[(i + 1) % points.length];
    const prev = points[(i - 1 + points.length) % points.length];
    
    // Calcular puntos de control para curva suave
    const cp1x = curr.x + (next.x - prev.x) * 0.15;
    const cp1y = curr.y + (next.y - prev.y) * 0.15;
    const cp2x = next.x - (points[(i + 2) % points.length].x - curr.x) * 0.15;
    const cp2y = next.y - (points[(i + 2) % points.length].y - curr.y) * 0.15;
    
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
  }
  
  ctx.closePath();
  
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

// ============================================================================
// FUNCIONES AUXILIARES ORIGINALES (mantenidas para compatibilidad)
// ============================================================================

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

// ============================================================================
// SISTEMA DE ANIMACIÓN MEJORADO
// ============================================================================

class AnimationState {
  constructor() {
    this.blinkTimer = 0;
    this.nextBlink = 100 + Math.random() * 200;
    this.breathPhase = Math.random() * Math.PI * 2;
    this.swayPhase = Math.random() * Math.PI * 2;
  }
  
  update() {
    this.blinkTimer++;
    if (this.blinkTimer > this.nextBlink) {
      this.blinkTimer = 0;
      this.nextBlink = 100 + Math.random() * 200;
      return true; // Parpadeo
    }
    return false;
  }
  
  getBreath(t) {
    return Math.sin(t / 20 + this.breathPhase) * 0.5;
  }
  
  getSway(t) {
    return Math.sin(t / 30 + this.swayPhase) * 0.03;
  }
}

const animStates = new Map();

function getAnimState(id) {
  if (!animStates.has(id)) {
    animStates.set(id, new AnimationState());
  }
  return animStates.get(id);
}

// ============================================================================
// FUNCIONES DE DIBUJO DE PERSONAJES MEJORADAS
// ============================================================================

/** Dibuja alas de cualquier tipo con animación de aleteo */
function drawWings(ctx, type, side, t, evo, flapIntensity = 1) {
  const flap = Math.sin(t / 6) * 0.3 * flapIntensity;
  const s = side;
  
  ctx.save();
  ctx.translate(s * 8, -5);
  ctx.rotate(s * (-0.6 + flap));
  
  switch(type) {
    case "feather": // Alas de plumas (Kilo)
      for (let i = 0; i < 3 + evo; i++) {
        const len = 20 + i * 8;
        ctx.fillStyle = i % 2 === 0 ? "#2bb56a" : "#7ee08a";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(s * len * 0.5, -len * 0.8, s * len, -i * 3);
        ctx.quadraticCurveTo(s * len * 0.6, len * 0.3, 0, i * 2);
        ctx.fill();
      }
      break;
      
    case "membrane": // Alas de membrana (Stitch)
      ctx.fillStyle = "rgba(80, 180, 255, .65)";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(s * 15, -20, s * 30, -10);
      ctx.quadraticCurveTo(s * 25, 8, s * 12, 12);
      ctx.closePath();
      ctx.fill();
      // Huesos
      ctx.strokeStyle = "rgba(10, 40, 120, .85)";
      ctx.lineWidth = 1.5;
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(s * (10 * i), -6 * i + 2);
        ctx.stroke();
      }
      break;
      
    case "lightning": // Alas de rayo (Chispín)
      ctx.strokeStyle = "#7ecbff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(s * 12, -18);
      ctx.lineTo(s * 6, -8);
      ctx.lineTo(s * 22, -28);
      ctx.lineTo(s * 10, -4);
      ctx.lineTo(s * 28, 4);
      ctx.stroke();
      ctx.fillStyle = "#fff6a8";
      ctx.fill();
      break;
      
    case "cloud": // Alas de nube (Michi)
      ctx.fillStyle = "#f4f0ff";
      for (const [cx, cy, r] of [[10, -8, 8], [20, -16, 7], [28, -6, 8]]) {
        ctx.beginPath();
        ctx.arc(s * cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
      
    case "dragon": // Alas de dragón (Dino)
      ctx.fillStyle = "rgba(46,207,122,.72)";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(s * 12, -18, s * 28, -20);
      ctx.quadraticCurveTo(s * 24, -6, s * 30, 8);
      ctx.quadraticCurveTo(s * 18, 6, s * 10, 10);
      ctx.closePath();
      ctx.fill();
      // Placas doradas
      ctx.strokeStyle = "#ffd84a";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(s * 12, -18, s * 28, -20);
      ctx.stroke();
      break;
      
    case "crystal": // Alas de cristal (Kétchup)
      ctx.fillStyle = "rgba(224,32,32,.55)";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(s * 14, -22, s * 32, -10);
      ctx.quadraticCurveTo(s * 26, 10, s * 12, 14);
      ctx.closePath();
      ctx.fill();
      // Cristales de sal
      ctx.fillStyle = "#fff8e8";
      for (const [cx, cy] of [[12, -12], [20, -6], [16, 6], [26, -16]]) {
        ctx.beginPath();
        ctx.moveTo(s * cx, cy - 5);
        ctx.lineTo(s * (cx + 4), cy);
        ctx.lineTo(s * cx, cy + 4);
        ctx.lineTo(s * (cx - 3), cy);
        ctx.closePath();
        ctx.fill();
      }
      break;
  }
  
  ctx.restore();
}

/** Dibuja una cola animada de diferentes tipos */
function drawTail(ctx, type, t, evo, size = 1) {
  const wag = Math.sin(t / 8) * 3 * size;
  
  ctx.save();
  ctx.translate(10, 5);
  
  switch(type) {
    case "cat":
      ctx.strokeStyle = "#ffb6e4";
      ctx.lineWidth = 5 * size;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(20, 10 + wag, 18, -8 + wag);
      ctx.quadraticCurveTo(16, -20 + wag, 6, -18 + wag);
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(6, -18 + wag, 3.5, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case "dragon":
      ctx.strokeStyle = "#5ecf6a";
      ctx.lineWidth = 4 * size;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-12, 8 + wag, -18, 2 + wag);
      ctx.stroke();
      if (evo >= 4) {
        // Llama en la punta
        ctx.fillStyle = "#ffd84a";
        ctx.beginPath();
        ctx.moveTo(-18, -6 + wag);
        ctx.lineTo(-24, -12 + wag);
        ctx.lineTo(-16, 4 + wag);
        ctx.fill();
      }
      break;
      
    case "lightning":
      ctx.strokeStyle = "#ffe44a";
      ctx.lineWidth = 6 * size;
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(8, -12);
      ctx.lineTo(4, 0);
      ctx.lineTo(16, -8);
      ctx.lineTo(10, 8);
      ctx.stroke();
      break;
  }
  
  ctx.restore();
}

/** Corona/Gorro según evolución */
function drawCrown(ctx, type, evo, t) {
  switch(type) {
    case "flower":
      for (let i = -2; i <= 2; i++) {
        const x = i * 7;
        ctx.fillStyle = i % 2 ? "#ff4d78" : "#ffd36a";
        ctx.beginPath();
        ctx.moveTo(x - 3, -35);
        ctx.quadraticCurveTo(x, -50 - Math.abs(i) * 2, x + 3, -35);
        ctx.closePath();
        ctx.fill();
      }
      star(ctx, 0, -52, 5, "#fff8c8");
      break;
      
    case "tech":
      // Corona tecnológica
      ctx.fillStyle = "#1a3cff";
      ctx.beginPath();
      ctx.ellipse(0, -25, 12, 5, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      // Anillos flotantes
      ctx.strokeStyle = "#7ef0ff";
      ctx.lineWidth = 2;
      for (let i = 0; i < 2; i++) {
        ctx.beginPath();
        ctx.ellipse(0, -30 - i * 6, 8 - i * 2, 3 - i, i * 0.2, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
      
    case "crystal":
      // Corona de cristales
      ctx.fillStyle = "#fff8e8";
      for (const x of [-10, 0, 10]) {
        ctx.beginPath();
        ctx.moveTo(x, -32);
        ctx.lineTo(x - 3, -42);
        ctx.lineTo(x + 3, -32);
        ctx.closePath();
        ctx.fill();
      }
      break;
  }
}

// ============================================================================
// PERSONAJES INDIVIDUALES MEJORADOS
// ============================================================================

function drawLiloEnhanced(ctx, p, t, evo) {
  if (evo >= 4) {
    drawLiloGodEnhanced(ctx, p, t);
    return;
  }
  
  const anim = getAnimState(p.id);
  const breath = anim.getBreath(t);
  const sway = anim.getSway(t);
  const blink = anim.update() ? 1 : 0;
  
  const ceremonial = evo >= 3;
  const ohana = evo >= 2;
  const baby = evo === 0;
  
  const dress = ceremonial ? "#ffd36a" : ohana ? "#ff4d78" : baby ? "#ff9ab0" : "#e0142c";
  const skin = "#f3c4a0";
  const hair = ceremonial ? "#3a1608" : "#1a0c08";
  
  // Sombra
  drawShadow(ctx, 0, 25 + breath, 20 + evo * 3, 8);
  
  // Capa ceremonial
  if (ceremonial) {
    ctx.fillStyle = "rgba(255,200,90,.9)";
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.quadraticCurveTo(-40, 15, -32, 45);
    ctx.lineTo(32, 45);
    ctx.quadraticCurveTo(40, 15, 10, 0);
    ctx.fill();
  }
  
  // Alas en evo 4
  if (evo >= 4) {
    drawWings(ctx, "feather", -1, t, evo);
    drawWings(ctx, "feather", 1, t, evo);
  }
  
  // Cuerpo con animación de respiración
  ctx.save();
  ctx.translate(0, breath);
  ctx.rotate(sway);
  
  // Piernas
  ctx.strokeStyle = skin;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-6, 15); ctx.lineTo(-7, 28);
  ctx.moveTo(6, 15); ctx.lineTo(7, 28);
  ctx.stroke();
  
  // Vestido con detalle
  ctx.fillStyle = dress;
  ctx.beginPath();
  ctx.moveTo(-10, 5);
  ctx.lineTo(10, 5);
  ctx.quadraticCurveTo(22, 25, 0, 30);
  ctx.quadraticCurveTo(-22, 25, -10, 5);
  ctx.fill();
  
  // Decoración del vestido
  if (ohana) {
    ctx.fillStyle = "#fff8d6";
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(-6, 20);
    ctx.lineTo(0, 28);
    ctx.lineTo(6, 20);
    ctx.closePath();
    ctx.fill();
  }
  
  // Brazos
  ctx.strokeStyle = skin;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-10, 8); ctx.lineTo(-18, 18);
  ctx.moveTo(10, 8); ctx.lineTo(18, 18);
  ctx.stroke();
  
  // Cabeza
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.ellipse(0, -12, 13, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Moño
  ctx.beginPath();
  ctx.ellipse(0, -28, 9, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Flequillo
  ctx.beginPath();
  ctx.moveTo(-10, -18);
  ctx.quadraticCurveTo(-5, -12, 0, -15);
  ctx.quadraticCurveTo(5, -12, 10, -18);
  ctx.fill();
  
  // Cara
  oval(ctx, 0, -8, 10, 9, skin);
  
  // Ojos mejorados
  drawAdvancedEye(ctx, -4, -8, 3, 3.2, {x: 0, y: 0.2}, blink);
  drawAdvancedEye(ctx, 4, -8, 3, 3.2, {x: 0, y: 0.2}, blink);
  
  // Sonrisa
  ctx.strokeStyle = "#c47a6a";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, -3, 3, 0.2, Math.PI - 0.2);
  ctx.stroke();
  
  // Corona
  if (evo >= 1) {
    drawCrown(ctx, "flower", evo, t);
  }
  
  // Lei
  if (ohana) {
    const colors = ["#ff8ad4", "#ffe66a", "#ff6a8a"];
    for (let i = 0; i < 5; i++) {
      const a = -0.8 + i * 0.4;
      ctx.fillStyle = colors[i % 3];
      ctx.beginPath();
      ctx.arc(Math.sin(a) * 12, 2 + Math.cos(a) * 2, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  ctx.restore();
}

function drawStitchEnhanced(ctx, p, t, evo) {
  if (evo >= 4) {
    drawStitchGodEnhanced(ctx, p, t);
    return;
  }
  
  const anim = getAnimState(p.id);
  const breath = anim.getBreath(t);
  const angry = evo >= 2;
  const tech = evo >= 3;
  
  const blue = tech ? "#2a5ccc" : angry ? "#1a3a88" : "#1e4a9a";
  const belly = "#c8e8ff";
  const pink = "#f4b6c8";
  
  // Sombra
  drawShadow(ctx, 0, 22, 18 + evo * 2, 7);
  
  // Aura en evos altas
  if (evo >= 2) {
    drawEnergyAura(ctx, 0, 0, 25 + evo * 3, tech ? "#7ef0ff" : "#75f3ff", t, 4 + evo);
  }
  
  ctx.save();
  ctx.translate(0, breath);
  
  // Orejas grandes (característica distintiva)
  const earFlap = Math.sin(t / 10) * 2;
  
  function drawEar(side) {
    const s = side;
    ctx.fillStyle = blue;
    ctx.beginPath();
    ctx.moveTo(s * 8, -5);
    ctx.lineTo(s * 22, -35 + earFlap);
    ctx.lineTo(s * 26, -25 + earFlap);
    ctx.lineTo(s * 18, -15);
    ctx.lineTo(s * 10, -5);
    ctx.closePath();
    ctx.fill();
    
    // Interior rosa
    ctx.fillStyle = pink;
    ctx.beginPath();
    ctx.moveTo(s * 10, -8);
    ctx.lineTo(s * 20, -30 + earFlap);
    ctx.lineTo(s * 14, -12);
    ctx.closePath();
    ctx.fill();
  }
  
  drawEar(-1);
  drawEar(1);
  
  // Cola
  if (evo >= 3) {
    drawTail(ctx, "cat", t, evo, 0.8);
  }
  
  // Cuerpo compacto
  ctx.fillStyle = blue;
  ctx.beginPath();
  ctx.ellipse(0, 8, 15 + evo, 12 + evo * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Panza
  ctx.fillStyle = belly;
  ctx.beginPath();
  ctx.ellipse(0, 10, 8, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Cabeza angular
  ctx.fillStyle = blue;
  ctx.beginPath();
  ctx.moveTo(-12, -8);
  ctx.lineTo(12, -8);
  ctx.lineTo(14, 5);
  ctx.lineTo(0, 8);
  ctx.lineTo(-14, 5);
  ctx.closePath();
  ctx.fill();
  
  // Ojos grandes y expresivos
  const eyeColor = angry ? "angry" : "normal";
  drawAdvancedEye(ctx, -5, -2, 4, 5, {x: 0, y: -0.2}, 0, eyeColor);
  drawAdvancedEye(ctx, 5, -2, 4, 5, {x: 0, y: -0.2}, 0, eyeColor);
  
  // Nariz
  ctx.fillStyle = "#1a3a5c";
  ctx.beginPath();
  ctx.moveTo(0, 3);
  ctx.lineTo(-3, 6);
  ctx.lineTo(3, 6);
  ctx.closePath();
  ctx.fill();
  
  // Dientes
  if (angry) {
    ctx.fillStyle = "#fff";
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 2.5, 7);
      ctx.lineTo(i * 2.5 + 1.5, 10);
      ctx.lineTo(i * 2.5 + 3, 7);
      ctx.closePath();
      ctx.fill();
    }
  }
  
  // Brazos con garras
  ctx.strokeStyle = blue;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-12, 5); ctx.lineTo(-22, 12);
  ctx.moveTo(12, 5); ctx.lineTo(22, 12);
  ctx.stroke();
  
  // Garras
  ctx.fillStyle = "#cfe9ff";
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const angle = -0.5 + i * 0.5;
      ctx.beginPath();
      ctx.moveTo(side * 22, 12);
      ctx.lineTo(
        side * 22 + Math.cos(angle) * 8,
        12 + Math.sin(angle) * 8
      );
      ctx.lineTo(
        side * 22 + Math.cos(angle - 0.3) * 5,
        12 + Math.sin(angle - 0.3) * 5
      );
      ctx.fill();
    }
  }
  
  // Antenas
  ctx.strokeStyle = "#1a3a5c";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-5, -8); ctx.lineTo(-8, -25);
  ctx.moveTo(5, -8); ctx.lineTo(8, -25);
  ctx.stroke();
  
  ctx.fillStyle = tech ? "#7ef0ff" : blue;
  ctx.beginPath();
  ctx.arc(-8, -25, 3, 0, Math.PI * 2);
  ctx.arc(8, -25, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Placas tech
  if (tech) {
    ctx.fillStyle = "#7ef0ff";
    ctx.fillRect(-5, 0, 10, 8);
    ctx.fillStyle = "#5ad4ff";
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.lineTo(-4, 6);
    ctx.lineTo(0, 10);
    ctx.lineTo(4, 6);
    ctx.closePath();
    ctx.fill();
  }
  
  ctx.restore();
}

function drawPikachuEnhanced(ctx, p, t, evo) {
  if (evo >= 4) {
    drawPikachuGodEnhanced(ctx, p, t);
    return;
  }
  
  const anim = getAnimState(p.id);
  const breath = anim.getBreath(t);
  const fat = evo >= 3;
  const volt = evo >= 2;
  
  const body = fat ? "#fff36a" : volt ? "#f0a020" : "#ffe44a";
  
  // Sombra
  drawShadow(ctx, 0, 18 + breath, 16 + evo * 2, 6);
  
  // Aura eléctrica
  if (volt) {
    drawEnergyAura(ctx, 0, 0, 20 + evo * 2, "#7ecbff", t, 5);
  }
  
  ctx.save();
  ctx.translate(0, breath);
  
  // Cola rayo
  drawTail(ctx, "lightning", t, evo);
  
  // Cuerpo
  ctx.fillStyle = body;
  const w = fat ? 20 : 14 + evo;
  const h = fat ? 16 : 12 + evo * 0.5;
  ctx.beginPath();
  ctx.ellipse(0, 8, w, h, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Cabeza
  ctx.beginPath();
  ctx.ellipse(0, -6, 13, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Orejas redondas con punta
  function drawEar(side) {
    const s = side;
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(s * 10, -18, 5, 10, s * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Punta oscura
    ctx.fillStyle = "#1a1208";
    ctx.beginPath();
    ctx.ellipse(s * 11, -26, 3, 4, s * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    if (volt) {
      ctx.fillStyle = "#2ec9c0";
      ctx.beginPath();
      ctx.arc(s * 10, -22, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  drawEar(-1);
  drawEar(1);
  
  // Mejillas eléctricas
  ctx.fillStyle = "#2ec9c0";
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * 12, 2);
    ctx.quadraticCurveTo(side * 15, -2, side * 12, -6);
    ctx.quadraticCurveTo(side * 9, -2, side * 12, 2);
    ctx.fill();
  }
  
  // Ojos
  drawAdvancedEye(ctx, -4, -6, 2.8, 3, {x: 0, y: 0}, 0);
  drawAdvancedEye(ctx, 4, -6, 2.8, 3, {x: 0, y: 0}, 0);
  
  // Nariz y boca
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.ellipse(0, -2, 1.2, 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = "#5a3208";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-2.5, 1);
  ctx.quadraticCurveTo(0, 3.5, 2.5, 1);
  ctx.stroke();
  
  // Rayos si volt
  if (volt) {
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const a = t / 5 + i * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 25, Math.sin(a) * 15);
      ctx.lineTo(Math.cos(a) * 30, Math.sin(a) * 20);
      ctx.stroke();
    }
  }
  
  ctx.restore();
}

function drawDinoEnhanced(ctx, p, t, evo) {
  if (evo >= 4) {
    drawDinoGodEnhanced(ctx, p, t);
    return;
  }
  
  const anim = getAnimState(p.id);
  const breath = anim.getBreath(t);
  
  const colors = [
    "#9ae8b8", // Baby
    "#5ecf6a", // Base
    "#2ec4b6", // Pico
    "#c96b2a", // Rex
    "#ffd84a"  // God
  ];
  
  const body = colors[evo] || colors[1];
  const belly = "#e8fff0";
  
  // Sombra
  drawShadow(ctx, 0, 20 + breath, 15 + evo * 3, 6);
  
  ctx.save();
  ctx.translate(0, breath);
  
  // Cola
  drawTail(ctx, "dragon", t, evo);
  
  // Patas
  ctx.strokeStyle = body;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-6, 12); ctx.lineTo(-7, 22);
  ctx.moveTo(6, 12); ctx.lineTo(7, 22);
  ctx.stroke();
  
  // Cuerpo según evolución
  if (evo === 0) {
    // Bebé redondo
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, 5, 10, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Cascarón de huevo
    ctx.fillStyle = "#f4ffe8";
    ctx.beginPath();
    ctx.moveTo(-4, -2);
    ctx.lineTo(0, -6);
    ctx.lineTo(4, -2);
    ctx.fill();
  } else if (evo === 1) {
    // Corredor bípedo
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(2, 5, 11, 7, 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // Cabeza alargada
    ctx.beginPath();
    ctx.ellipse(10, -3, 7, 5, 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (evo === 2) {
    // Pico con cresta
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, 6, 9, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Cresta dorsal
    ctx.fillStyle = "#7ef0d8";
    for (let i = 0; i < 3; i++) {
      const x = -3 + i * 3;
      ctx.beginPath();
      ctx.moveTo(x, -5);
      ctx.lineTo(x + 2, -12);
      ctx.lineTo(x + 4, -5);
      ctx.fill();
    }
    
    // Cabeza con pico
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(5, -8, 6, 5, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Pico
    ctx.fillStyle = "#e8fff8";
    ctx.beginPath();
    ctx.moveTo(9, -8);
    ctx.lineTo(15, -6);
    ctx.lineTo(10, -4);
    ctx.fill();
  } else if (evo === 3) {
    // Rex con mandíbulas
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(-2, 8, 13, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Cabeza enorme
    ctx.beginPath();
    ctx.ellipse(12, -2, 10, 8, 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Mandíbula abierta
    ctx.fillStyle = "#6a2030";
    ctx.beginPath();
    ctx.moveTo(8, 2);
    ctx.lineTo(22, 4);
    ctx.lineTo(12, 8);
    ctx.fill();
    
    // Dientes
    ctx.fillStyle = "#f4ffe8";
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(10 + i * 3, 3);
      ctx.lineTo(11 + i * 3, 6);
      ctx.lineTo(12 + i * 3, 3);
      ctx.fill();
    }
    
    // Cresta
    ctx.fillStyle = "#e89040";
    ctx.beginPath();
    ctx.moveTo(2, -10);
    ctx.lineTo(6, -16);
    ctx.lineTo(10, -10);
    ctx.fill();
  }
  
  // Ojos
  const eyeX = evo === 3 ? 8 : 3;
  const eyeY = evo === 3 ? -4 : -6;
  drawAdvancedEye(ctx, eyeX - 3, eyeY, 2.2, 2.4, {x: 0.2, y: 0}, 0, evo >= 2 ? "angry" : "normal");
  
  ctx.restore();
}

function drawCatEnhanced(ctx, p, t, evo) {
  if (evo >= 4) {
    drawCatGodEnhanced(ctx, p, t);
    return;
  }
  
  const anim = getAnimState(p.id);
  const breath = anim.getBreath(t);
  const sway = anim.getSway(t);
  
  const fur = evo >= 3 ? "#ffd0ee" : evo >= 2 ? "#ff8ad4" : "#ffb6e4";
  
  // Sombra
  drawShadow(ctx, 0, 20 + breath, 14 + evo * 2, 6);
  
  // Aura suave
  if (evo >= 2) {
    drawEnergyAura(ctx, 0, 0, 18 + evo * 2, "#ff7ad0", t, 4);
  }
  
  ctx.save();
  ctx.translate(0, breath);
  ctx.rotate(sway);
  
  // Cola
  drawTail(ctx, "cat", t, evo);
  
  // Cuerpo estilo "loaf"
  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.ellipse(0, 12, 13, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Panza blanca
  ctx.fillStyle = "rgba(255,255,255,.35)";
  ctx.beginPath();
  ctx.ellipse(0, 15, 7, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Patas delanteras
  ctx.fillStyle = fur;
  for (const x of [-7, 7]) {
    ctx.beginPath();
    ctx.ellipse(x, 20, 5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Almohadillas
    ctx.fillStyle = "#ff7ac2";
    ctx.beginPath();
    ctx.ellipse(x, 20, 2, 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = fur;
  }
  
  // Orejas puntiagudas
  function drawEar(side) {
    const s = side;
    ctx.fillStyle = fur;
    ctx.beginPath();
    ctx.moveTo(s * 8, -5);
    ctx.lineTo(s * 10, -22);
    ctx.lineTo(s * 14, -6);
    ctx.closePath();
    ctx.fill();
    
    // Interior
    ctx.fillStyle = "#ff7ac2";
    ctx.beginPath();
    ctx.moveTo(s * 9, -7);
    ctx.lineTo(s * 10, -18);
    ctx.lineTo(s * 12, -7);
    ctx.closePath();
    ctx.fill();
  }
  
  drawEar(-1);
  drawEar(1);
  
  // Cabeza
  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.ellipse(0, -6, 14, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Marca en la frente
  ctx.strokeStyle = "#ff4da0";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.lineTo(0, -10);
  ctx.moveTo(-4, -13);
  ctx.lineTo(-2, -10);
  ctx.moveTo(4, -13);
  ctx.lineTo(2, -10);
  ctx.stroke();
  
  // Bigotes
  ctx.strokeStyle = "rgba(255,240,250,.85)";
  ctx.lineWidth = 1.2;
  const wk = Math.sin(t / 15) * 0.8;
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const y = -5 + i * 2;
      ctx.beginPath();
      ctx.moveTo(side * 6, y);
      ctx.lineTo(side * 22, y - 3 + i * 2 + wk);
      ctx.stroke();
    }
  }
  
  // Ojos
  drawAdvancedEye(ctx, -5, -7, 3.2, 3.6, {x: 0, y: 0}, 0);
  drawAdvancedEye(ctx, 5, -7, 3.2, 3.6, {x: 0, y: 0}, 0);
  
  // Nariz y boca
  ctx.fillStyle = "#ff2a9a";
  ctx.beginPath();
  ctx.moveTo(0, -2);
  ctx.lineTo(-2.5, -4);
  ctx.lineTo(2.5, -4);
  ctx.closePath();
  ctx.fill();
  
  ctx.strokeStyle = "#5a2040";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, -2);
  ctx.lineTo(0, 0.5);
  ctx.arc(-1.8, 0.5, 1.8, 0, Math.PI);
  ctx.moveTo(0, 0.5);
  ctx.arc(1.8, 0.5, 1.8, 0, Math.PI);
  ctx.stroke();
  
  // Estrellas flotantes
  if (evo >= 3) {
    for (let i = 0; i < 4; i++) {
      const a = t / 10 + i * 1.5;
      star(ctx, Math.cos(a) * 20, Math.sin(a) * 12 - 2, 2.5, "#fff");
    }
  }
  
  ctx.restore();
}

function drawKetchupEnhanced(ctx, p, t, evo) {
  if (evo >= 4) {
    drawKetchupGodEnhanced(ctx, p, t);
    return;
  }
  
  const anim = getAnimState(p.id);
  const breath = anim.getBreath(t);
  
  const fry = evo >= 3 ? "#ffe08a" : "#f0b43a";
  const ket = "#c81e1e";
  
  // Sombra
  drawShadow(ctx, 0, 28 + breath, 12 + evo, 5);
  
  ctx.save();
  ctx.translate(0, breath);
  
  // Capa de ketchup
  if (evo >= 1) {
    ctx.fillStyle = ket;
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.quadraticCurveTo(-20, 15, -15, 35);
    ctx.lineTo(15, 35);
    ctx.quadraticCurveTo(20, 15, 8, 0);
    ctx.fill();
    
    // Gotas
    for (const x of [-12, 0, 12]) {
      ctx.beginPath();
      ctx.ellipse(x, 38 + Math.sin(t / 10 + x) * 2, 4, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Cuerpo de palito (múltiples si evo alta)
  const sticks = evo >= 3 ? 3 : 1;
  for (let i = 0; i < sticks; i++) {
    const offset = (i - (sticks-1)/2) * 6;
    ctx.fillStyle = i % 2 === 0 ? fry : "#ffe08a";
    
    ctx.save();
    ctx.translate(offset, 0);
    ctx.rotate(Math.sin(t / 20 + i) * 0.05);
    
    // Palito
    ctx.fillStyle = fry;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(-3.5, -8, 7, 32, 3.5);
    } else {
      ctx.rect(-3.5, -8, 7, 32);
    }
    ctx.fill();
    ctx.strokeStyle = "#7a3a08";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Marcas de fritura
    ctx.strokeStyle = "#e8a028";
    ctx.lineWidth = 1;
    for (let j = 0; j < 3; j++) {
      ctx.beginPath();
      ctx.moveTo(-2, -2 + j * 8);
      ctx.lineTo(2, -1 + j * 8);
      ctx.stroke();
    }
    
    // Sal
    ctx.fillStyle = "#fff8e8";
    for (let j = 0; j < 3; j++) {
      ctx.beginPath();
      ctx.arc(((j * 7) % 10) - 5, ((j * 5) % 24) - 4, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  // Cabeza
  oval(ctx, 0, -16, 10, 9, "#f4c2a8", "#7a3a08", 1.2);
  
  // Ojos
  drawAdvancedEye(ctx, -3.5, -17, 2.3, 2.5, {x: 0, y: 0}, 0);
  drawAdvancedEye(ctx, 3.5, -17, 2.3, 2.5, {x: 0, y: 0}, 0);
  
  // Sonrisa
  ctx.strokeStyle = "#c47a6a";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(0, -13, 2.8, 0.2, Math.PI - 0.2);
  ctx.stroke();
  
  // Gorro de capitán (botella de ketchup)
  ctx.fillStyle = ket;
  ctx.beginPath();
  ctx.moveTo(-11, -24);
  ctx.lineTo(11, -24);
  ctx.lineTo(9, -30);
  ctx.lineTo(-9, -30);
  ctx.closePath();
  ctx.fill();
  
  // Pico de la botella
  ctx.fillRect(-4, -42, 8, 14);
  ctx.beginPath();
  ctx.moveTo(-4, -42);
  ctx.lineTo(0, -54);
  ctx.lineTo(4, -42);
  ctx.closePath();
  ctx.fill();
  
  // Bandas doradas
  ctx.fillStyle = "#ffe66a";
  ctx.fillRect(-4, -38, 8, 3);
  ctx.fillRect(-11, -26, 22, 2.5);
  
  // Joyas
  ctx.fillStyle = "#fff8e8";
  for (const x of [-9, 0, 9]) {
    ctx.beginPath();
    ctx.moveTo(x, -30);
    ctx.lineTo(x - 2.5, -36);
    ctx.lineTo(x + 2.5, -36);
    ctx.closePath();
    ctx.fill();
  }
  
  // Brazos
  oval(ctx, -12, 2, 3.5, 2.8, fry, "#7a3a08", 1);
  oval(ctx, 12, 2, 3.5, 2.8, fry, "#7a3a08", 1);
  
  // Cetro en evo 3+
  if (evo >= 3) {
    ctx.strokeStyle = "#e8a028";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(14, 2);
    ctx.lineTo(26, -22);
    ctx.stroke();
    
    ctx.fillStyle = ket;
    ctx.fillRect(22, -34, 8, 14);
    ctx.fillStyle = "#fff8e8";
    ctx.fillRect(23, -34, 6, 4);
    star(ctx, 26, -38, 4, "#ffe66a");
  }
  
  ctx.restore();
}

// ============================================================================
// FORMAS GOD MEJORADAS
// ============================================================================

function drawLiloGodEnhanced(ctx, p, t) {
  const anim = getAnimState(p.id);
  const breath = anim.getBreath(t);
  
  // Aura solar masiva
  drawEnergyAura(ctx, 0, 0, 45, "#ffd76a", t, 8);
  
  // Alas de hojas gigantes
  drawWings(ctx, "feather", -1, t, 4, 1.2);
  drawWings(ctx, "feather", 1, t, 4, 1.2);
  
  ctx.save();
  ctx.translate(0, breath);
  
  // Corona floral radiante
  for (let i = 0; i < 7; i++) {
    const angle = t / 20 + (i / 7) * Math.PI * 2;
    const dist = 35 + Math.sin(t / 10 + i) * 3;
    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle) * dist * 0.6 - 40;
    
    ctx.fillStyle = i % 2 === 0 ? "#ff4d78" : "#2ec9c0";
    ctx.beginPath();
    ctx.moveTo(x, y - 8);
    ctx.lineTo(x + 5, y);
    ctx.lineTo(x, y + 8);
    ctx.lineTo(x - 5, y);
    ctx.closePath();
    ctx.fill();
    
    star(ctx, x, y, 3, "#fff8c8");
  }
  
  // Cuerpo divino
  ctx.fillStyle = "#ffd76a";
  ctx.beginPath();
  ctx.moveTo(-12, 0);
  ctx.lineTo(12, 0);
  ctx.quadraticCurveTo(28, 25, 0, 35);
  ctx.quadraticCurveTo(-28, 25, -12, 0);
  ctx.fill();
  
  // Armadura de oro
  ctx.fillStyle = "#fff8d6";
  ctx.beginPath();
  ctx.moveTo(0, 5);
  ctx.lineTo(-8, 18);
  ctx.lineTo(0, 32);
  ctx.lineTo(8, 18);
  ctx.closePath();
  ctx.fill();
  
  star(ctx, 0, 18, 5, "#ff4d78");
  
  // Brazos extendidos
  ctx.strokeStyle = "#f3c4a0";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-12, 8); ctx.lineTo(-28, 20);
  ctx.moveTo(12, 8); ctx.lineTo(28, 20);
  ctx.stroke();
  
  // Cabeza
  ctx.fillStyle = "#2a1008";
  ctx.beginPath();
  ctx.ellipse(0, -15, 18, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Pelo divino
  ctx.beginPath();
  ctx.moveTo(-20, -10);
  ctx.quadraticCurveTo(-40, -50, -5, -20);
  ctx.quadraticCurveTo(0, -65, 5, -20);
  ctx.quadraticCurveTo(40, -50, 20, -10);
  ctx.fill();
  
  // Cara
  oval(ctx, 0, -12, 12, 11, "#f3c4a8");
  
  // Ojos brillantes
  drawAdvancedEye(ctx, -5, -12, 3.5, 3.8, {x: 0, y: -0.1}, 0, "god");
  drawAdvancedEye(ctx, 5, -12, 3.5, 3.8, {x: 0, y: -0.1}, 0, "god");
  
  ctx.restore();
}

function drawStitchGodEnhanced(ctx, p, t) {
  const anim = getAnimState(p.id);
  const breath = anim.getBreath(t);
  
  // Aura de plasma
  drawEnergyAura(ctx, 0, 0, 40, "#7ef0ff", t, 10);
  
  // Alas de membrana
  drawWings(ctx, "membrane", -1, t, 4, 1.3);
  drawWings(ctx, "membrane", 1, t, 4, 1.3);
  
  ctx.save();
  ctx.translate(0, breath);
  
  // Corona tech flotante
  drawCrown(ctx, "tech", 4, t);
  
  // Cuerpo armadura
  ctx.fillStyle = "#2a6dff";
  ctx.beginPath();
  ctx.ellipse(0, 8, 22, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Placas de pecho
  ctx.fillStyle = "#1a3cff";
  ctx.beginPath();
  ctx.moveTo(0, -2);
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI/2 + i * Math.PI/3;
    ctx.lineTo(Math.cos(a) * 10, 8 + Math.sin(a) * 8);
  }
  ctx.closePath();
  ctx.fill();
  
  // Gema central
  ctx.fillStyle = "#7ef0ff";
  ctx.beginPath();
  ctx.arc(0, 8, 4, 0, Math.PI * 2);
  ctx.fill();
  
  // Brazos con garras de energía
  ctx.strokeStyle = "#2a6dff";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-20, 5); ctx.lineTo(-38, -15);
  ctx.moveTo(20, 5); ctx.lineTo(38, -15);
  ctx.stroke();
  
  // Garras de plasma
  ctx.fillStyle = "#7ef0ff";
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const angle = -0.8 + i * 0.8;
      ctx.beginPath();
      ctx.moveTo(side * 38, -15);
      ctx.lineTo(
        side * 38 + Math.cos(angle) * 15,
        -15 + Math.sin(angle) * 15
      );
      ctx.lineTo(
        side * 38 + Math.cos(angle - 0.3) * 8,
        -15 + Math.sin(angle - 0.3) * 8
      );
      ctx.fill();
    }
  }
  
  // Cabeza
  ctx.fillStyle = "#2a6dff";
  ctx.beginPath();
  ctx.moveTo(-14, -8);
  ctx.lineTo(14, -8);
  ctx.lineTo(16, 8);
  ctx.lineTo(0, 12);
  ctx.lineTo(-16, 8);
  ctx.closePath();
  ctx.fill();
  
  // Orejas enormes
  const earFlap = Math.sin(t / 8) * 4;
  ctx.fillStyle = "#2a6dff";
  ctx.beginPath();
  ctx.moveTo(-12, -5);
  ctx.quadraticCurveTo(-45, -60 + earFlap, -2, -15);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(12, -5);
  ctx.quadraticCurveTo(45, -60 + earFlap, 2, -15);
  ctx.fill();
  
  // Ojos rojos de dios
  drawAdvancedEye(ctx, -6, 0, 5.5, 6, {x: 0, y: -0.2}, 0, "god");
  drawAdvancedEye(ctx, 6, 0, 5.5, 6, {x: 0, y: -0.2}, 0, "god");
  
  // Dientes
  ctx.fillStyle = "#fff";
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 2.5, 8);
    ctx.lineTo(i * 2.5 + 1.5, 12);
    ctx.lineTo(i * 2.5 + 3, 8);
    ctx.fill();
  }
  
  ctx.restore();
}

function drawPikachuGodEnhanced(ctx, p, t) {
  const anim = getAnimState(p.id);
  const breath = anim.getBreath(t);
  
  // Aura de trueno
  drawEnergyAura(ctx, 0, 0, 42, "#ffe14a", t, 8);
  
  // Alas de rayo
  drawWings(ctx, "lightning", -1, t, 4, 1.2);
  drawWings(ctx, "lightning", 1, t, 4, 1.2);
  
  ctx.save();
  ctx.translate(0, breath);
  
  // Corona de rayos
  ctx.strokeStyle = "#7ecbff";
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    const a = t / 15 + (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 25, -35 + Math.sin(a) * 8);
    ctx.lineTo(Math.cos(a) * 35, -45 + Math.sin(a) * 10);
    ctx.lineTo(Math.cos(a) * 30, -30 + Math.sin(a) * 8);
    ctx.stroke();
  }
  
  // Cuerpo
  ctx.fillStyle = "#ffe14a";
  ctx.beginPath();
  ctx.ellipse(0, 10, 18, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Armadura de pecho
  ctx.fillStyle = "#1a1208";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-10, 10);
  ctx.lineTo(0, 22);
  ctx.lineTo(10, 10);
  ctx.closePath();
  ctx.fill();
  
  ctx.fillStyle = "#fff6a0";
  ctx.beginPath();
  ctx.arc(0, 10, 4, 0, Math.PI * 2);
  ctx.fill();
  
  // Cabeza
  ctx.beginPath();
  ctx.ellipse(0, -8, 16, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Orejas largas
  ctx.fillStyle = "#ffe14a";
  ctx.beginPath();
  ctx.moveTo(-10, -15);
  ctx.lineTo(-14, -50);
  ctx.lineTo(-4, -15);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(10, -15);
  ctx.lineTo(14, -50);
  ctx.lineTo(4, -15);
  ctx.closePath();
  ctx.fill();
  
  // Puntas negras
  ctx.fillStyle = "#1a1208";
  ctx.beginPath();
  ctx.moveTo(-14, -50);
  ctx.lineTo(-8, -50);
  ctx.lineTo(-11, -40);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(14, -50);
  ctx.lineTo(8, -50);
  ctx.lineTo(11, -40);
  ctx.closePath();
  ctx.fill();
  
  // Anillos en orejas
  ctx.strokeStyle = "#7ecbff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(-10, -32, 5, 0, Math.PI * 2);
  ctx.arc(10, -32, 5, 0, Math.PI * 2);
  ctx.stroke();
  
  // Mejillas armadura
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#1a1208";
    ctx.beginPath();
    ctx.ellipse(side * 14, 0, 9, 7, side * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "#ffe66a";
    ctx.beginPath();
    ctx.arc(side * 14, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "#e23b3d";
    ctx.beginPath();
    ctx.arc(side * 14, 0, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Ojos
  drawAdvancedEye(ctx, -5, -8, 3.5, 3.8, {x: 0, y: 0}, 0, "god");
  drawAdvancedEye(ctx, 5, -8, 3.5, 3.8, {x: 0, y: 0}, 0, "god");
  
  ctx.restore();
}

function drawDinoGodEnhanced(ctx, p, t) {
  const anim = getAnimState(p.id);
  const breath = anim.getBreath(t);
  
  // Aura dorada
  drawEnergyAura(ctx, 0, 0, 48, "#ffd84a", t, 10);
  
  // Alas de dragón
  drawWings(ctx, "dragon", -1, t, 4, 1.2);
  drawWings(ctx, "dragon", 1, t, 4, 1.2);
  
  ctx.save();
  ctx.translate(0, breath);
  
  // Corona de estrellas
  for (let i = 0; i < 5; i++) {
    const a = t / 20 + (i / 5) * Math.PI * 2;
    star(ctx, Math.cos(a) * 30, -40 + Math.sin(a) * 5, 5, "#ffd84a");
  }
  
  // Cuerpo majestuoso
  ctx.fillStyle = "#ffd84a";
  ctx.beginPath();
  ctx.ellipse(0, 8, 24, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Placas esmeralda
  ctx.fillStyle = "#2ecf7a";
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI/2 + i * Math.PI * 0.4;
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.lineTo(Math.cos(a - 0.3) * 20, 8 + Math.sin(a - 0.3) * 15);
    ctx.lineTo(Math.cos(a + 0.3) * 20, 8 + Math.sin(a + 0.3) * 15);
    ctx.closePath();
    ctx.fill();
  }
  
  // Gema central
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(0, 8, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2ecf7a";
  ctx.beginPath();
  ctx.arc(0, 8, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Brazos
  ctx.strokeStyle = "#ffd84a";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-20, 5); ctx.lineTo(-35, -10);
  ctx.moveTo(20, 5); ctx.lineTo(35, -10);
  ctx.stroke();
  
  // Garras esmeralda
  ctx.fillStyle = "#2ecf7a";
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const angle = -0.6 + i * 0.6;
      ctx.beginPath();
      ctx.moveTo(side * 35, -10);
      ctx.lineTo(
        side * 35 + Math.cos(angle) * 12,
        -10 + Math.sin(angle) * 12
      );
      ctx.lineTo(
        side * 35 + Math.cos(angle - 0.25) * 6,
        -10 + Math.sin(angle - 0.25) * 6
      );
      ctx.fill();
    }
  }
  
  // Cabeza regia
  ctx.fillStyle = "#ffd84a";
  ctx.beginPath();
  ctx.ellipse(8, -10, 14, 11, 0.1, 0, Math.PI * 2);
  ctx.fill();
  
  // Cuernos
  ctx.fillStyle = "#c96b2a";
  ctx.beginPath();
  ctx.moveTo(2, -18);
  ctx.lineTo(5, -35);
  ctx.lineTo(10, -20);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(14, -18);
  ctx.lineTo(18, -32);
  ctx.lineTo(22, -19);
  ctx.fill();
  
  // Ojos dorados
  drawAdvancedEye(ctx, 4, -12, 3.5, 3.8, {x: 0.2, y: -0.1}, 0, "god");
  drawAdvancedEye(ctx, 14, -10, 3.2, 3.5, {x: 0.2, y: -0.1}, 0, "god");
  
  // Aliento de fuego
  ctx.fillStyle = "rgba(255,100,50,0.6)";
  ctx.beginPath();
  ctx.moveTo(22, -5);
  ctx.quadraticCurveTo(45, -8, 55, 0);
  ctx.quadraticCurveTo(48, 8, 25, 5);
  ctx.fill();
  
  ctx.restore();
}

function drawCatGodEnhanced(ctx, p, t) {
  const anim = getAnimState(p.id);
  const breath = anim.getBreath(t);
  
  // Aura celestial
  drawEnergyAura(ctx, 0, 0, 40, "#ff6ec8", t, 8);
  
  // Alas de nube
  drawWings(ctx, "cloud", -1, t, 4, 1.1);
  drawWings(ctx, "cloud", 1, t, 4, 1.1);
  
  ctx.save();
  ctx.translate(0, breath - 5); // Levitación
  
  // Corona de luna y estrellas
  ctx.fillStyle = "#f4f0ff";
  ctx.beginPath();
  ctx.arc(0, -45, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff6ec8";
  ctx.beginPath();
  ctx.arc(5, -48, 8, 0, Math.PI * 2);
  ctx.fill();
  
  for (let i = 0; i < 5; i++) {
    const a = t / 15 + (i / 5) * Math.PI * 2;
    star(ctx, Math.cos(a) * 20, -45 + Math.sin(a) * 3, 3, "#ffe66a");
  }
  
  // Cuerpo erguido (no loaf)
  ctx.fillStyle = "#ff6ec8";
  ctx.beginPath();
  ctx.ellipse(0, 5, 14, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Collar divino
  ctx.fillStyle = "#f4f0ff";
  ctx.beginPath();
  ctx.ellipse(0, -8, 12, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = "#ffe66a";
  ctx.beginPath();
  ctx.arc(0, -6, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff2a9a";
  ctx.beginPath();
  ctx.arc(0, -5, 1.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Cabeza
  ctx.fillStyle = "#ff6ec8";
  ctx.beginPath();
  ctx.ellipse(0, -15, 15, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Orejas puntiagudas grandes
  ctx.fillStyle = "#ff6ec8";
  ctx.beginPath();
  ctx.moveTo(-10, -22);
  ctx.lineTo(-14, -48);
  ctx.lineTo(-4, -24);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(10, -22);
  ctx.lineTo(14, -48);
  ctx.lineTo(4, -24);
  ctx.closePath();
  ctx.fill();
  
  // Interior orejas
  ctx.fillStyle = "#ff7ac2";
  ctx.beginPath();
  ctx.moveTo(-9, -24);
  ctx.lineTo(-12, -42);
  ctx.lineTo(-5, -25);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(9, -24);
  ctx.lineTo(12, -42);
  ctx.lineTo(5, -25);
  ctx.closePath();
  ctx.fill();
  
  // Estrellas en orejas
  star(ctx, -10, -44, 2.5, "#f4f0ff");
  star(ctx, 10, -44, 2.5, "#f4f0ff");
  
  // Ojos brillantes
  drawAdvancedEye(ctx, -5, -15, 3.8, 4.2, {x: 0, y: 0}, 0, "god");
  drawAdvancedEye(ctx, 5, -15, 3.8, 4.2, {x: 0, y: 0}, 0, "god");
  
  // Gemas en frente
  ctx.fillStyle = "#ff2a9a";
  ctx.beginPath();
  ctx.moveTo(0, -28);
  ctx.lineTo(-3, -22);
  ctx.lineTo(0, -18);
  ctx.lineTo(3, -22);
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
}

function drawKetchupGodEnhanced(ctx, p, t) {
  const anim = getAnimState(p.id);
  const breath = anim.getBreath(t);
  
  // Aura de calor
  drawEnergyAura(ctx, 0, 0, 38, "#ffd76a", t, 8);
  
  // Alas de cristal
  drawWings(ctx, "crystal", -1, t, 4, 1.2);
  drawWings(ctx, "crystal", 1, t, 4, 1.2);
  
  ctx.save();
  ctx.translate(0, breath);
  
  // Trono de ketchup
  ctx.fillStyle = "#e02020";
  ctx.beginPath();
  ctx.moveTo(-15, 0);
  ctx.quadraticCurveTo(-50, 20, -40, 60);
  ctx.lineTo(40, 60);
  ctx.quadraticCurveTo(50, 20, 15, 0);
  ctx.fill();
  
  // Gotas cayendo
  for (const x of [-25, -8, 8, 25]) {
    const drip = Math.sin(t / 8 + x) * 3;
    ctx.beginPath();
    ctx.ellipse(x, 65 + drip, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Cuerpo de múltiples palitos dorados
  for (let i = -2; i <= 2; i++) {
    ctx.fillStyle = i % 2 === 0 ? "#ffd76a" : "#ffe08a";
    ctx.save();
    ctx.translate(i * 7, 0);
    ctx.rotate(Math.sin(t / 15 + i) * 0.08);
    
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(-4, -10, 8, 42, 4);
    } else {
      ctx.rect(-4, -10, 8, 42);
    }
    ctx.fill();
    ctx.strokeStyle = "#c47a18";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Sal brillante
    ctx.fillStyle = "#fff8e8";
    for (let j = 0; j < 4; j++) {
      ctx.beginPath();
      ctx.arc(((j * 5) % 12) - 6, ((j * 8) % 36) - 8, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  // Corona de emperador
  ctx.fillStyle = "#e02020";
  ctx.beginPath();
  ctx.moveTo(-16, -28);
  ctx.lineTo(16, -28);
  ctx.lineTo(14, -36);
  ctx.lineTo(-14, -36);
  ctx.closePath();
  ctx.fill();
  
  // Torre de botella
  ctx.fillRect(-6, -55, 12, 22);
  ctx.beginPath();
  ctx.moveTo(-6, -55);
  ctx.lineTo(0, -72);
  ctx.lineTo(6, -55);
  ctx.closePath();
  ctx.fill();
  
  // Cristales de sal en corona
  ctx.fillStyle = "#fff8e8";
  for (const x of [-12, 0, 12]) {
    ctx.beginPath();
    ctx.moveTo(x, -36);
    ctx.lineTo(x - 3, -45);
    ctx.lineTo(x + 3, -36);
    ctx.closePath();
    ctx.fill();
  }
  
  // Cabeza
  oval(ctx, 0, -20, 12, 11, "#f4c2a8", "#7a3a08", 1.2);
  
  // Ojos
  drawAdvancedEye(ctx, -4, -21, 2.8, 3, {x: 0, y: 0}, 0);
  drawAdvancedEye(ctx, 4, -21, 2.8, 3, {x: 0, y: 0}, 0);
  
  // Cetro real
  ctx.strokeStyle = "#e8a028";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(18, 5);
  ctx.lineTo(32, -28);
  ctx.stroke();
  
  ctx.fillStyle = "#e02020";
  ctx.fillRect(28, -42, 10, 16);
  ctx.fillStyle = "#fff8e8";
  ctx.fillRect(29, -42, 8, 5);
  star(ctx, 33, -46, 5, "#ffe66a");
  
  ctx.restore();
}

// ============================================================================
// RENDER DE PERSONAJES · pipeline único
// ----------------------------------------------------------------------------
// 1. Todos los personajes se anclan por los PIES (centro inferior de la hitbox)
//    → nadie flota ni se hunde en el suelo.
// 2. Altura visual por forma (bebé → GOD) independiente de la hitbox, así las
//    5 formas crecen de manera coherente aunque la hitbox sea pequeña (Dino).
// 3. Forma 0 = bebé chibi (baby.js); formas 1-4 = PNG de assets/sprites.
//    Si un PNG no ha cargado todavía, se usa el dibujo procedural normalizado.
// 4. Capas: sombra → aura/rayos → arte (squash & stretch) → flash → partículas.
// ============================================================================

const VISUAL_H = [36, 48, 58, 68, 80];
const CHAR_K = { lilo: 1.0, stitch: 0.95, pikachu: 0.92, cat: 0.9, dragon: 0.95, frita: 1.06 };
const MAX_RATIO = 1.9; // ancho máximo = 1.9 × alto (dragones muy anchos)

const FLAVOR = {
  lilo:    { kind: "petal", colors: ["#ff9ab0", "#ffd36a", "#ffffff"] },
  stitch:  { kind: "spark", colors: ["#7ef0ff", "#3fa8ff", "#ffffff"] },
  pikachu: { kind: "bolt",  colors: ["#fff36a", "#ffd000", "#ffffff"] },
  cat:     { kind: "star",  colors: ["#ffd0ee", "#fff6a8", "#c9a8ff"] },
  dragon:  { kind: "ember", colors: ["#ff7a2a", "#ffd84a", "#ff3b2a"] },
  frita:   { kind: "salt",  colors: ["#ffffff", "#fff3c4", "#ff4a3a"] },
};

// ---------------------------------------------------------------------------
// Normalizador de dibujos procedurales: los renderiza una vez fuera de pantalla,
// mide su caja real y así podemos escalarlos y apoyarlos en el suelo igual que
// un sprite.
// ---------------------------------------------------------------------------
const measured = new Map();
function measure(key, draw) {
  if (measured.has(key)) return measured.get(key);
  let box = { top: -24, bottom: 20, left: -20, right: 20 };
  try {
    const S = 320, O = 160;
    const c = document.createElement("canvas");
    c.width = S; c.height = S;
    const g = c.getContext("2d", { willReadFrequently: true });
    g.translate(O, O);
    draw(g);
    const d = g.getImageData(0, 0, S, S).data;
    let x0 = S, y0 = S, x1 = -1, y1 = -1;
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        if (d[(y * S + x) * 4 + 3] > 90) {
          if (x < x0) x0 = x; if (x > x1) x1 = x;
          if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
      }
    }
    if (x1 > x0 && y1 > y0) box = { top: y0 - O, bottom: y1 - O, left: x0 - O, right: x1 - O };
  } catch (_) {}
  measured.set(key, box);
  return box;
}

function stubPlayer(p, evo) {
  return {
    id: p.id, evo, color: p.color, w: p.w, h: p.h, facing: 1, vx: 0, vy: 0,
    grounded: true, melee: 0, invuln: 0,
    _anim: { step: 0, moving: false, idle: true, air: false, legL: 0, legR: 0, armL: 0, armR: 0 },
  };
}

const PROC = {
  lilo: drawLiloEnhanced, stitch: drawStitchEnhanced, dragon: drawDinoEnhanced,
  pikachu: drawPikachuEnhanced, cat: drawCatEnhanced, frita: drawKetchupEnhanced,
};
const PROC_GOD = {
  lilo: drawLiloGodEnhanced, stitch: drawStitchGodEnhanced, dragon: drawDinoGodEnhanced,
  pikachu: drawPikachuGodEnhanced, cat: drawCatGodEnhanced, frita: drawKetchupGodEnhanced,
};

/** Dibuja un procedural con los pies en (0,0) y altura H. */
function drawProceduralNormalized(ctx, p, t, evo, H) {
  let fn, key;
  if (evo === 0) {
    fn = (g, pp, tt) => drawBaby(g, pp, tt);
    key = "baby:" + p.id;
  } else {
    const f = (evo >= 4 ? PROC_GOD[p.id] : PROC[p.id]) || drawLiloEnhanced;
    fn = (g, pp, tt) => f(g, pp, tt, evo);
    key = "proc:" + p.id + ":" + evo;
  }
  const box = measure(key, (g) => fn(g, stubPlayer(p, evo), 0));
  const s = H / Math.max(8, box.bottom - box.top);
  ctx.save();
  ctx.scale(s, s);
  ctx.translate(-(box.left + box.right) / 2, -box.bottom);
  fn(ctx, p, t);
  ctx.restore();
}

/** "#rgb" | "#rrggbb" → rgba() con alfa. Otros formatos se devuelven tal cual. */
function withAlpha(color, a) {
  let h = String(color || "#ffffff").trim();
  if (/^#[0-9a-f]{3}$/i.test(h)) h = "#" + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  if (!/^#[0-9a-f]{6}$/i.test(h)) return color;
  const n = parseInt(h.slice(1), 16);
  return "rgba(" + (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
}

// ---------------------------------------------------------------------------
// Capas de efectos (coordenadas locales: pies en 0,0; arriba = y negativo)
// ---------------------------------------------------------------------------
function drawAura(ctx, H, color, t, evo) {
  const cy = -H * 0.5;
  const r = H * (0.5 + evo * 0.09) * (1 + Math.sin(t / 9) * 0.05);
  ctx.save();
  ctx.globalAlpha *= evo >= 4 ? 0.5 : 0.3;
  const g = ctx.createRadialGradient(0, cy, r * 0.1, 0, cy, r);
  g.addColorStop(0, withAlpha(color, 1));
  g.addColorStop(0.55, withAlpha(color, 0.33));
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGodRays(ctx, H, color, t) {
  const cy = -H * 0.55;
  const n = 10;
  ctx.save();
  ctx.translate(0, cy);
  ctx.rotate(t / 90);
  ctx.globalAlpha *= 0.16 + Math.sin(t / 14) * 0.05;
  ctx.fillStyle = color;
  for (let i = 0; i < n; i++) {
    ctx.rotate((Math.PI * 2) / n);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-H * 0.07, -H * 0.95);
    ctx.lineTo(H * 0.07, -H * 0.95);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawGroundRing(ctx, H, color, t) {
  const k = (t % 60) / 60;
  ctx.save();
  ctx.globalAlpha *= (1 - k) * 0.55;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, 0, H * (0.25 + k * 0.45), H * (0.06 + k * 0.1), 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawFlavor(ctx, id, H, t, evo, front) {
  const fl = FLAVOR[id];
  if (!fl || evo < 2) return;
  const n = evo * 2 + (evo >= 4 ? 4 : 0);
  ctx.save();
  for (let i = 0; i < n; i++) {
    const seed = i * 2.399;
    const a = t / (38 - evo * 4) + seed;
    const z = Math.sin(a);                 // profundidad: >0 delante
    if ((z > 0) !== front) continue;
    const rx = H * (0.42 + (i % 3) * 0.08);
    let x = Math.cos(a) * rx;
    let y = -H * 0.5 + Math.sin(a * 0.7 + seed) * H * 0.32;
    const col = fl.colors[i % fl.colors.length];
    const s = (1.4 + (i % 3) * 0.6) * (0.75 + 0.25 * (z + 1)) * (H / 48);
    ctx.globalAlpha = 0.55 + 0.4 * Math.abs(z);
    ctx.fillStyle = col;
    ctx.strokeStyle = col;
    if (fl.kind === "ember") {
      const life = ((t * 0.6 + i * 23) % (H * 1.1)) / (H * 1.1);
      y = -H * 0.2 - life * H * 0.95;
      x = Math.sin(t / 11 + i) * H * 0.35;
      ctx.globalAlpha = 0.85 * Math.sin(life * Math.PI);
      ctx.beginPath(); ctx.arc(x, y, s * 0.9, 0, Math.PI * 2); ctx.fill();
    } else if (fl.kind === "petal") {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a * 2);
      ctx.beginPath(); ctx.ellipse(0, 0, s * 1.4, s * 0.7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } else if (fl.kind === "bolt") {
      ctx.lineWidth = Math.max(1, s * 0.6);
      ctx.beginPath();
      ctx.moveTo(x - s, y - s * 2); ctx.lineTo(x + s * 0.4, y - s * 0.3);
      ctx.lineTo(x - s * 0.4, y + s * 0.3); ctx.lineTo(x + s, y + s * 2);
      ctx.stroke();
    } else if (fl.kind === "star") {
      star(ctx, x, y, s * 1.5, col);
    } else if (fl.kind === "salt") {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      ctx.fillRect(-s * 0.6, -s * 0.6, s * 1.2, s * 1.2);
      ctx.restore();
    } else {
      ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha *= 0.6; ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(x, y, s * 0.45, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

function drawDust(ctx, H, t, speed) {
  ctx.save();
  for (let i = 0; i < 3; i++) {
    const k = ((t * 0.07 * (1 + speed * 0.1) + i / 3) % 1);
    ctx.globalAlpha *= 1;
    ctx.globalAlpha = (1 - k) * 0.35;
    ctx.fillStyle = "#e8e2d0";
    ctx.beginPath();
    ctx.arc(-H * 0.22 - k * H * 0.35, -1 - k * 5, 1.5 + k * H * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawBurst(ctx, H, color, k) {
  // k: 1 → 0 durante la evolución
  const prog = 1 - k;
  ctx.save();
  ctx.globalAlpha *= k;
  ctx.strokeStyle = color || "#ffe66a";
  ctx.lineWidth = Math.max(0.5, 5 * k);
  ctx.beginPath();
  ctx.arc(0, -H * 0.5, Math.max(1, H * 0.3 + prog * H * 2.6), 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = Math.max(0.5, 2.5 * k);
  ctx.strokeStyle = "#fff";
  ctx.beginPath();
  ctx.arc(0, -H * 0.5, Math.max(1, H * 0.15 + prog * H * 1.6), 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

// ============================================================================
// FUNCIÓN PRINCIPAL EXPORTADA
// ============================================================================

export function drawCharacter(ctx, p, cam, t) {
  const evo = Math.max(0, Math.min(4, Math.round(Number(p.evo) || 0)));
  const facing = p.facing || 1;
  const footX = p.x + p.w / 2 - cam.x;
  const footY = p.y + p.h - cam.y;

  const speed = Math.abs(p.vx || 0);
  const moving = !!p.grounded && speed > 0.55;
  const air = !p.grounded;
  const idle = !!p.grounded && !moving;
  const ascending = air && (p.vy || 0) < -1.2;
  const falling = air && (p.vy || 0) > 1.5;
  const runT = t * (0.52 + speed * 0.16);
  const step = Math.sin(runT);
  const atk = p.melee > 0 ? Math.sin(Math.min(1, (12 - p.melee) / 12) * Math.PI) : 0;
  const hurt = (p.invuln || 0) > 0 || (p.hurtFlash || 0) > 0;
  const hurtFresh = (p.invuln || 0) > 18;

  // Tamaño visual de la forma (con "pop" al evolucionar)
  let H = VISUAL_H[evo] * (CHAR_K[p.id] || 1) * (p.visualScale || 1);
  const burstK = p.evoBurst > 0 ? Math.max(0, Math.min(1, p.evoBurst / Math.max(1, p.evoBurstMax || 90))) : 0;
  if (burstK > 0) H *= 1 + Math.sin((1 - burstK) * Math.PI * 3) * 0.08 * burstK;

  // Squash & stretch anclado en los pies
  let sx = 1, sy = 1;
  if (ascending) { sx = 0.9; sy = 1.1; }
  else if (falling) { sx = 1.05; sy = 0.95; }
  else if (moving) { sx = 1 + Math.abs(step) * 0.05; sy = 1 - Math.abs(step) * 0.05; }
  else { const b = Math.sin(t * 0.08); sx = 1 - b * 0.018; sy = 1 + b * 0.025; }
  if (p.grounded && p._wasAir) p._land = 8;
  p._wasAir = air;
  if (p._land > 0) {
    const k = p._land / 8;
    sx *= 1 + 0.16 * k; sy *= 1 - 0.14 * k;
    p._land--;
  }
  if (atk) { sx *= 1 + atk * 0.1; sy *= 1 - atk * 0.05; }

  const hop = moving ? -Math.abs(step) * H * 0.05 : 0;
  const tilt = moving ? 0.06 + step * 0.03 : air ? (ascending ? -0.06 : 0.08) : Math.sin(t * 0.05) * 0.015;
  const lunge = atk * H * 0.1;
  const recoilX = hurtFresh ? -H * 0.08 : 0;

  // Estado de animación para dibujadores procedurales (compatibilidad)
  p._anim = {
    step, moving, idle, air, ascending, falling, hurt, hurtFresh,
    legL: moving ? step * 7 : (air ? (ascending ? -3 : 4) : Math.sin(t * 0.08) * 1.2),
    legR: moving ? -step * 7 : (air ? (ascending ? -3 : 4) : -Math.sin(t * 0.08) * 1.2),
    armL: moving ? -step * 5 : (atk ? -8 : Math.sin(t * 0.09) * 2),
    armR: moving ? step * 5 : (atk ? 10 : -Math.sin(t * 0.09) * 2),
  };

  const color = p.color || "#ffffff";
  const art = formArt(p.id, evo);

  ctx.save();
  ctx.translate(footX, footY);

  // 1 · sombra (se queda en el suelo aunque salte el personaje en el sprite)
  drawShadow(ctx, 0, 0, H * 0.3 * (air ? 0.7 : 1), H * 0.06 * (air ? 0.7 : 1));

  ctx.scale(facing, 1);
  ctx.translate(recoilX + lunge, 0);

  // 2 · capas traseras
  if (evo >= 4) drawGodRays(ctx, H, color, t);
  if (evo >= 2) drawAura(ctx, H, color, t, evo);
  if (evo >= 3 && !air) drawGroundRing(ctx, H, color, t);
  drawFlavor(ctx, p.id, H, t, evo, false);
  if (moving) drawDust(ctx, H, t, speed);

  // 3 · personaje
  ctx.save();
  ctx.translate(0, hop);
  ctx.rotate(tilt + atk * 0.12);
  ctx.scale(sx, sy);
  if (art) {
    const img = art.img;
    const iw = img.width || img.naturalWidth, ih = img.height || img.naturalHeight;
    let h = H * art.sy;
    let w = h * (iw / ih) * art.sx;
    const maxW = H * MAX_RATIO;
    if (w > maxW) { h *= maxW / w; w = maxW; }
    ctx.drawImage(img, -w / 2, -h, w, h);
    // flash: daño (rojo parpadeante) o evolución (blanco)
    let flashCol = null, flashA = 0;
    if (burstK > 0.35) { flashCol = "#ffffff"; flashA = (burstK - 0.35) / 0.65 * 0.9; }
    else if (hurtFresh || (hurt && (p.invuln || 0) % 8 < 4)) { flashCol = "#ff3b4e"; flashA = hurtFresh ? 0.6 : 0.35; }
    if (flashCol) {
      const sil = silhouette(img, flashCol);
      if (sil) {
        ctx.save();
        ctx.globalAlpha *= flashA;
        ctx.drawImage(sil, -w / 2, -h, w, h);
        ctx.restore();
      }
    }
  } else {
    drawProceduralNormalized(ctx, p, t, evo, H);
    if (hurt && (hurtFresh || (p.invuln || 0) % 8 < 4)) {
      ctx.save();
      ctx.globalAlpha *= 0.25;
      ctx.fillStyle = "#ff3030";
      ctx.beginPath();
      ctx.ellipse(0, -H * 0.5, H * 0.45, H * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore();

  // 4 · capas delanteras
  drawFlavor(ctx, p.id, H, t, evo, true);
  if (burstK > 0) {
    drawBurst(ctx, H, color, burstK);
    p.evoBurst--;
  }

  ctx.restore();
}

import {drawThunderSeal,thunderBolt} from './chispa-stagecraft.js';
// OHANA V372 · Final con protagonista + compañero U reconocibles.
// Cada héroe tiene un "golpe final" propio (motivo vectorial plano) y una frase;
// el compañero U elegido entra corriendo y remata con SU motivo. Sin gradientes,
// sin shadowBlur y con un número fijo de piezas para que el final siga siendo ligero.
const TAU = Math.PI * 2;
export const ENDING_SIGNATURES = Object.freeze({
  kilo: Object.freeze({ motif: "notes", color: "#ffd36a", accent: "#ff7aa8", line: "¡OHANA SIGNIFICA FAMILIA!" }),
  stitcho: Object.freeze({ motif: "chaos", color: "#7ec8ff", accent: "#b78bff", line: "¡CAOS… PERO DEL BUENO!" }),
  chispin: Object.freeze({ motif: "bolts", color: "#ffe85a", accent: "#7ee7ff", line: "EL CIELO RUGE. MI FAMILIA DESCANSA." }),
  cat: Object.freeze({ motif: "moon", color: "#ffb6e4", accent: "#fff1b8", line: "NUEVE VIDAS, UNA FAMILIA." }),
  dragon: Object.freeze({ motif: "flame", color: "#ff8a45", accent: "#ffe08a", line: "¡RUGIDO DE AMANECER!" }),
  dino: Object.freeze({ motif: "quake", color: "#a6f08c", accent: "#ffe6a3", line: "¡PUM! ¡GANAMOS!" }),
  frita: Object.freeze({ motif: "fries", color: "#ffd84a", accent: "#ff6a3a", line: "¡VICTORIA CRUJIENTE!" }),
  pizza: Object.freeze({ motif: "cheese", color: "#ffc48e", accent: "#ff5a5a", line: "¡RACIÓN DE GLORIA!" }),
  yomi: Object.freeze({ motif: "ofuda", color: "#ff4466", accent: "#fff1d0", line: "LA SOMBRA TAMBIÉN VUELVE A CASA." }),
  cuerno: Object.freeze({ motif: "rainbow", color: "#d9c6ff", accent: "#7ee7ff", line: "¡DULCES SUEÑOS, HOKU!" }),
});
export function endingSignature(id) { return ENDING_SIGNATURES[id] || ENDING_SIGNATURES.kilo; }

/** Guion del dúo: tiempos fijos (segundos desde el inicio de la escena). */
export function duoBeat(t, reduce) {
  if (reduce) return { partnerIn: 1, heroMove: 1, partnerMove: 1, combo: 1, still: true };
  const s = (a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));
  return { partnerIn: s(0.55, 1.25), heroMove: s(0.15, 1.2), partnerMove: s(1.25, 2.2), combo: s(2.0, 3.3), still: false };
}

function star(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
    i ? ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath(); ctx.fill();
}

/**
 * Motivo de firma alrededor de (x,y). k = progreso 0..1, R = radio base,
 * dir = hacia dónde "dispara" (1 derecha, -1 izquierda). Máx. ~14 piezas.
 */
export function drawSignature(ctx, id, x, y, R, k, dir = 1, spin = 0) {
  if (k <= 0) return;
  const sig = endingSignature(id), e = Math.min(1, k * 3, (1 - k) * 4 + 0.35);
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, e));
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  switch (sig.motif) {
    case "notes":
      for (let i = 0; i < 7; i++) {
        const a = -Math.PI * 0.85 + i * 0.28 + spin * 0.4, r = R * (0.5 + k * 0.8);
        const nx = x + Math.cos(a) * r * dir, ny = y + Math.sin(a) * r;
        ctx.fillStyle = i % 2 ? sig.color : sig.accent; ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(nx, ny, 5, 3.6, -0.4, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.moveTo(nx + 4.5, ny); ctx.lineTo(nx + 4.5, ny - 15); ctx.lineTo(nx + 10, ny - 11); ctx.stroke();
      }
      break;
    case "chaos":
      ctx.strokeStyle = sig.color; ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) { const u = i / 40, a = u * TAU * 2.2 + spin * 3, r = R * u * (0.4 + k); i ? ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.7) : ctx.moveTo(x, y); }
      ctx.stroke();
      ctx.fillStyle = sig.accent;
      for (let i = 0; i < 5; i++) { const a = spin * 4 + i * TAU / 5; star(ctx, x + Math.cos(a) * R * (0.6 + k * 0.5), y + Math.sin(a) * R * 0.5, 5); }
      break;
    case "bolts": {
      drawThunderSeal(ctx,x,y-R*.35,R*.6,spin*60,false,k);
      for(let i=0;i<3;i++){
        const tx=x+dir*R*(.35+i*.32),ty=y+R*(.15+i*.12);
        thunderBolt(ctx,x,y-R*.35,tx,ty,.5+i*.15,spin*50,false);
      }
      break;
    }
    case "moon": {
      const my = y - R * (0.5 + k * 0.4), r = R * 0.34;
      ctx.fillStyle = sig.accent; ctx.beginPath(); ctx.arc(x, my, r, 0, TAU); ctx.fill();
      ctx.fillStyle = "#14203a"; ctx.beginPath(); ctx.arc(x + r * 0.45 * dir, my - r * 0.2, r * 0.85, 0, TAU); ctx.fill();
      ctx.strokeStyle = sig.color; ctx.lineWidth = 2;
      for (let i = 0; i < 9; i++) { const a = spin + i * TAU / 9; ctx.beginPath(); ctx.arc(x + Math.cos(a) * R * (0.9 + k * 0.3), y + Math.sin(a) * R * 0.45, 3, 0, TAU); ctx.stroke(); }
      break;
    }
    case "flame":
      for (let i = 0; i < 8; i++) {
        const u = (i / 8 + spin * 0.6) % 1, fx = x + dir * R * (0.2 + u * 1.5 * k), fy = y - Math.sin(u * Math.PI) * R * 0.35, s = 9 * (1 - u * 0.5);
        ctx.fillStyle = i % 2 ? sig.color : sig.accent;
        ctx.beginPath(); ctx.moveTo(fx, fy - s * 1.6); ctx.quadraticCurveTo(fx + s, fy, fx, fy + s); ctx.quadraticCurveTo(fx - s, fy, fx, fy - s * 1.6); ctx.fill();
      }
      break;
    case "quake":
      ctx.strokeStyle = sig.color;
      for (let i = 0; i < 4; i++) { const r = R * ((k + i * 0.25) % 1) * 1.4; ctx.lineWidth = 3 - i * 0.5; ctx.beginPath(); ctx.ellipse(x, y + R * 0.5, r, r * 0.22, 0, 0, TAU); ctx.stroke(); }
      ctx.fillStyle = sig.accent;
      for (let i = 0; i < 6; i++) { const rx = x + (i - 2.5) * R * 0.34, ry = y + R * 0.4 - Math.abs(Math.sin(k * Math.PI * 2 + i)) * R * 0.4; ctx.fillRect(rx - 3, ry - 3, 6, 6); }
      break;
    case "fries":
      for (let i = 0; i < 9; i++) {
        const a = -Math.PI / 2 + (i - 4) * 0.22, r = R * (0.3 + k * 0.9);
        ctx.save(); ctx.translate(x + Math.cos(a) * r, y + Math.sin(a) * r); ctx.rotate(a + Math.PI / 2 + spin);
        ctx.fillStyle = sig.color; ctx.strokeStyle = "#7a4a12"; ctx.lineWidth = 1.2;
        ctx.fillRect(-2.5, -9, 5, 18); ctx.strokeRect(-2.5, -9, 5, 18); ctx.restore();
      }
      break;
    case "cheese":
      ctx.strokeStyle = "#ffe08a"; ctx.lineWidth = 3;
      for (let i = 0; i < 5; i++) { const ex = x + dir * R * (0.4 + i * 0.22) * (0.4 + k), ey = y - R * 0.3 + i * 6; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo((x + ex) / 2, ey + R * 0.35 * Math.sin(k * Math.PI), ex, ey); ctx.stroke(); }
      ctx.fillStyle = sig.accent;
      for (let i = 0; i < 4; i++) { const a = spin * 2 + i * TAU / 4; ctx.beginPath(); ctx.arc(x + Math.cos(a) * R * 0.7, y - R * 0.5 + Math.sin(a) * R * 0.3, 5, 0, TAU); ctx.fill(); }
      break;
    case "ofuda":
      for (let i = 0; i < 8; i++) {
        const a = spin * 2 + i * TAU / 8, r = R * (0.5 + k * 0.5);
        ctx.save(); ctx.translate(x + Math.cos(a) * r, y - R * 0.3 + Math.sin(a) * r * 0.6); ctx.rotate(a + Math.PI / 2);
        ctx.fillStyle = sig.accent; ctx.strokeStyle = "#a64f5d"; ctx.lineWidth = 1.2;
        ctx.fillRect(-4, -10, 8, 20); ctx.strokeRect(-4, -10, 8, 20);
        ctx.fillStyle = sig.color; ctx.fillRect(-2, -5, 4, 8); ctx.restore();
      }
      break;
    case "rainbow": {
      const cols = ["#ff7aa8", "#ffd36a", "#a6f08c", "#7ee7ff", "#b78bff"];
      cols.forEach((c, i) => { ctx.strokeStyle = c; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y + R * 0.2, R * (0.6 + k * 0.6) - i * 5, Math.PI, Math.PI + Math.PI * Math.min(1, k * 1.4)); ctx.stroke(); });
      ctx.fillStyle = "#fff6d5"; star(ctx, x, y - R * (0.4 + k * 0.6), 7);
      break;
    }
  }
  ctx.restore();
}

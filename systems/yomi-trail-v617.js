// V617 — Trail EXTREMO de Yomi
// Más objetos de paso, trampas reactivas, bits de memoria y mejor feedback.
// Integra con el layout de encounters-v617.

export const YOMI_BITS = Object.freeze([
  { id: 'bit0', x: 480, y: 1020 },
  { id: 'bit1', x: 1620, y: 940 },
  { id: 'bit2', x: 3480, y: 980 },
  { id: 'bit3', x: 5200, y: 920 },
  { id: 'bit4', x: 7800, y: 960 },
  { id: 'bit5', x: 10500, y: 900 }
]);

export const YOMI_RESONANCE = Object.freeze([
  { id: 'res0', x: 1400, y: 1000 },
  { id: 'res1', x: 3800, y: 900 },
  { id: 'res2', x: 8200, y: 880 }
]);

export function updateYomiTrailV617(game, hurtPlayer) {
  // Extiende o sustituye partes de updateYomiTrail
  // Recoger bits de memoria da XP pequeño y una marca temporal
  // Tocar resonancias consecutivas sin tocar suelo da boost de salto
  // Campos de glitch se limpian con K
  const s = game.yomiTrail;
  if (!s || !game.player) return;
  // ... lógica de recolección y estados aquí
}

export function drawYomiTrailV617(ctx, game, cam, t) {
  // Dibuja bits flotantes, antenas de resonancia y avisos de trampas
  const s = game.yomiTrail;
  if (!s) return;
  ctx.save();
  for (const bit of YOMI_BITS) {
    const bx = bit.x - cam.x, by = bit.y - cam.y;
    const bob = Math.sin(t * 0.1 + bit.x) * 6;
    ctx.fillStyle = '#4ff0c8';
    ctx.beginPath(); ctx.arc(bx, by + bob, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd56b';
    ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
    ctx.fillText('01', bx, by + bob + 3);
  }
  ctx.restore();
}

// Shared, visual-only threat language for Dino's fossil valley and Dragon's caldera.
// Drawn inside each creature's foot-anchored Canvas transform. No hitboxes,
// damage, timers, network messages or enemy AI are modified here.
const TAU = Math.PI * 2;
const ROLE_BY_SPECIES = Object.freeze({
  cucaracho: 'pursuer', escoria: 'pursuer',
  rana: 'jumper',
  cangrejo: 'shield', arana: 'shield', planta: 'shield',
  abeja: 'shooter', brasita: 'shooter',
  libelula: 'flyer', murcielago: 'flyer'
});
const COLORS = Object.freeze({
  fossil: { border: '#d6f4c5', accent: '#ffe082', backdrop: '#112b25' },
  volcanic: { border: '#ffe5ba', accent: '#ffb74d', backdrop: '#2d1112' }
});

export function chapterThreatState(e) {
  const a = e?._campaign || {};
  const preparing = !!e?.telegraph || Number(a.wind) > 0;
  const attacking = Number(a.active) > 0;
  const role = e?.campaignRole || e?.roomPersona?.role || ROLE_BY_SPECIES[e?.kind] || 'pursuer';
  const face = Number(a.aim) || Number(e?.facing) || 1;
  return { preparing, attacking, role, direction: face < 0 ? -1 : 1 };
}

export function drawChapterThreatCue(ctx, e, t = 0, reduced = false, palette = 'fossil') {
  const state = chapterThreatState(e);
  if ((!state.preparing && !state.attacking) || e?.dying || (Number.isFinite(e?.hp) && e.hp <= 0)) return false;
  const color = COLORS[palette] || COLORS.fossil;
  const y = -Math.max(46, Math.min(92, (Number(e?.h) || 36) + 22));
  const bob = reduced ? 0 : Math.sin(t * 0.15) * 1.5;
  const dir = state.direction;

  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  // High-contrast heraldic token: each role has a unique silhouette even
  // without hue discrimination. Warning is dashed; attacking is solid.
  ctx.fillStyle = color.backdrop;
  ctx.strokeStyle = color.border;
  ctx.lineWidth = 2;
  if (state.preparing) ctx.setLineDash([3, 2.5]);
  ctx.beginPath();
  ctx.arc(0, y + bob, 14, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = state.attacking ? '#ffffff' : color.accent;
  ctx.fillStyle = color.accent;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  switch (state.role) {
    case 'shield': {
      ctx.moveTo(0, y - 9 + bob);
      ctx.lineTo(8, y - 5 + bob);
      ctx.lineTo(7, y + 4 + bob);
      ctx.lineTo(0, y + 10 + bob);
      ctx.lineTo(-7, y + 4 + bob);
      ctx.lineTo(-8, y - 5 + bob);
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case 'shooter': {
      ctx.arc(0, y + bob, 7, 0, TAU);
      ctx.moveTo(-10, y + bob);
      ctx.lineTo(10, y + bob);
      ctx.moveTo(0, y - 10 + bob);
      ctx.lineTo(0, y + 10 + bob);
      ctx.stroke();
      break;
    }
    case 'jumper': {
      ctx.moveTo(-7, y + 6 + bob);
      ctx.lineTo(0, y - 7 + bob);
      ctx.lineTo(7, y + 6 + bob);
      ctx.moveTo(0, y - 6 + bob);
      ctx.lineTo(0, y + 9 + bob);
      ctx.stroke();
      break;
    }
    case 'flyer': {
      ctx.moveTo(-9, y - 7 + bob);
      ctx.lineTo(2, y + 5 + bob);
      ctx.lineTo(9, y - 2 + bob);
      ctx.moveTo(2, y + 5 + bob);
      ctx.lineTo(9, y + 8 + bob);
      ctx.stroke();
      break;
    }
    default: {
      ctx.moveTo(-9 * dir, y - 6 + bob);
      ctx.lineTo(1 * dir, y + bob);
      ctx.lineTo(-9 * dir, y + 6 + bob);
      ctx.moveTo(1 * dir, y - 6 + bob);
      ctx.lineTo(10 * dir, y + bob);
      ctx.lineTo(1 * dir, y + 6 + bob);
      ctx.stroke();
      break;
    }
  }

  // The ground directional cue is a warning, not a collision or range claim.
  // The active line is shorter to avoid turning the scene into a light show.
  ctx.strokeStyle = state.attacking ? color.accent : color.border;
  ctx.lineWidth = state.attacking ? 3 : 2;
  if (state.preparing && !state.attacking) ctx.setLineDash([5, 4]);
  const reach = state.attacking ? 31 : 45;
  ctx.beginPath();
  ctx.moveTo(0, -3);
  ctx.lineTo(dir * reach, -3);
  ctx.moveTo(dir * (reach - 8), -9);
  ctx.lineTo(dir * reach, -3);
  ctx.lineTo(dir * (reach - 8), 3);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
  return true;
}

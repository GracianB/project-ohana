// A successful basic swing or J cast earns one petal, never one per target.
export function kiloPetals(game) {
  const p = game?.player, s = p?._kiloRhythm;
  if (p?.id !== 'kilo' || p.dead || !s || s.room !== game.roomId || game.t - s.t > 240 || game.t < s.t) return 0;
  return s.petals;
}

export function earnKiloPetal(game, attack) {
  const p = game?.player;
  if (p?.id !== 'kilo' || p.dead || !attack || attack.kiloPetalEarned) return false;
  attack.kiloPetalEarned = true;
  const petals = Math.min(3, kiloPetals(game) + 1);
  p._kiloRhythm = { petals, t: game.t, room: game.roomId };
  game.nums?.add(p.x + p.w / 2, p.y - 24, petals === 3 ? '¡A COMPÁS! K / L' : '♪'.repeat(petals), '#ffd36a');
  return true;
}

export function spendKiloPetals(game) {
  const petals = kiloPetals(game);
  if (game?.player) game.player._kiloRhythm = null;
  return petals;
}

export function drawKiloRhythm(ctx, game) {
  const p = game.player, count = kiloPetals(game);
  if (!count) return;
  ctx.save();
  const x = p.x + p.w / 2 - game.cam.x, y = p.y - game.cam.y - 18;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.ellipse(x + (i - 1) * 10, y, 3.5, 5, (i - 1) * .3, 0, Math.PI * 2);
    ctx.fillStyle = i < count ? '#ffd36a' : '#463b52'; ctx.fill();
    ctx.strokeStyle = '#fff1ce'; ctx.lineWidth = 1; ctx.stroke();
  }
  ctx.restore();
}

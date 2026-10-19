// Camera anticipation follows actual travel; dash direction is latched.
export function horizontalLook(player) {
  return player._dashGo > 0
    ? (player._dashFace || player.facing || 1) * 48
    : Math.sign(player.vx || 0) * 18;
}

// Pause/menu transitions discard queued intent, never active movement or damage.
export function clearBufferedActions(player) {
  if (!player) return;
  player.buffer = 0;
  player.dashBuf = 0;
  player.meleeBuf = 0;
}

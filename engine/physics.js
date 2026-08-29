// PROJECT OHANA · Physics Engine
export const Physics = {
  gravity: 0.62,
  terminalVelocity: 18,

  overlap(a, b) {
    return a.x < b.x + b.w &&
           a.x + a.w > b.x &&
           a.y < b.y + b.h &&
           a.y + a.h > b.y;
  },

  resolvePlayerPlatforms(player, platforms, dt) {
    player.onGround = false;
    const previousBottom = player.y + player.h - player.vy * dt;

    for (const platform of platforms) {
      if (!this.overlap(player, platform)) continue;

      if (player.vy >= 0 && previousBottom <= platform.y + 14) {
        player.y = platform.y - player.h;
        player.vy = 0;
        player.onGround = true;
      }
    }
  },

  applyGravity(entity, dt) {
    entity.vy += this.gravity * dt;
    entity.vy = Math.min(entity.vy, this.terminalVelocity);
  },

  distance(a, b) {
    const dx = (a.x + a.w / 2) - (b.x + b.w / 2);
    const dy = (a.y + a.h / 2) - (b.y + b.h / 2);
    return Math.sqrt(dx * dx + dy * dy);
  }
};

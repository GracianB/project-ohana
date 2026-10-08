// OHANA V85 - descend deliberately through one-way ledges.
// Only the thin platform supporting the player is ignored. Solids stay solid.
// Remember the specific platform while falling: the room rescue system must
// not teleport the hero onto the same ledge immediately after drop-through.
const SUPPORT_EPSILON = 5;

function overlapsHorizontally(a, b) {
  return a.x + a.w > b.x + 1 && a.x < b.x + b.w - 1;
}

export function beginPlatformDrop(player, platforms, down, wasGrounded) {
  if (!player) return null;
  if (!player._dropPlatform && down && wasGrounded) {
    const feet = player.y + player.h;
    const support = (platforms || []).find((plat) =>
      plat && plat.h <= 24 && plat.h > 0 &&
      overlapsHorizontally(player, plat) &&
      Math.abs(feet - plat.y) <= SUPPORT_EPSILON
    );
    if (support) {
      player._dropPlatform = { x: support.x, y: support.y, w: support.w, h: support.h };
    }
  }
  // The collision resolver skips thin ledges at/above this y in EVERY
  // substep, not just the first one. The lower platforms remain landable.
  return player._dropPlatform ? player._dropPlatform.y + 10 : null;
}

export function dropIgnoresPlatform(player, platform) {
  const target = player?._dropPlatform;
  return !!target && !!platform && platform.h <= 24 &&
    Math.abs(platform.y - target.y) <= 0.5 &&
    Math.abs(platform.x - target.x) <= 0.5 &&
    Math.abs(platform.w - target.w) <= 0.5;
}

export function advancePlatformDrop(player) {
  const target = player?._dropPlatform;
  if (!target) return;
  const feet = player.y + player.h;
  // Re-arm only once outside this ledge horizontally, after landing on
  // a genuinely lower support, or when jumping fully above it again.
  const leftSurface = !overlapsHorizontally(player, target);
  const aboveSurface = feet < target.y - SUPPORT_EPSILON;
  const landedBelow = !!player.grounded && feet > target.y + 18;
  if (leftSurface || aboveSurface || landedBelow) player._dropPlatform = null;
}

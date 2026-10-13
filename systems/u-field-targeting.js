// V323: Frita's repeating U-field pulses use the actual visible circular aura.
// This only selects targets. Combat damage is still applied by the host's hitEnemy.
export const FRITA_FIELD_RADIUS = 126;
export const FRITA_FIELD_MAX_TARGETS = 5;

export function selectFritaFieldTargets(enemies, x, y) {
  if (!Array.isArray(enemies) || !Number.isFinite(x) || !Number.isFinite(y)) return [];
  const r2 = FRITA_FIELD_RADIUS * FRITA_FIELD_RADIUS;
  return enemies.flatMap((enemy, index) => {
    if (!enemy || !Number.isFinite(enemy.x) || !Number.isFinite(enemy.y)) return [];
    const w = Number.isFinite(enemy.w) ? enemy.w : 0;
    const h = Number.isFinite(enemy.h) ? enemy.h : 0;
    const dx = enemy.x + w / 2 - x;
    const dy = enemy.y + h / 2 - y;
    const d2 = dx * dx + dy * dy;
    return Number.isFinite(d2) && d2 <= r2 ? [{enemy, index, d2}] : [];
  }).sort((a, b) => a.d2 - b.d2 || a.index - b.index)
    .slice(0, FRITA_FIELD_MAX_TARGETS)
    .map(({enemy}) => enemy);
}

 
// V325: an authored, stationary warning ring precedes each of these initial U
// hits. Only the host's normal hitEnemy path applies damage at the impact tick.
// V371: solo lo usa el U de Dragón (Pizza usa OHANA_U_WINDUP): 24 frames = 0,4 s.
export const SUPREME_LAUNCH_WINDUP = 24;
export const SUPREME_LAUNCH_RADII = Object.freeze({ dragon: 320, pizza: 430 });

export function selectSupremeLaunchTargets(enemies, hero, x, y) {
  const radius = SUPREME_LAUNCH_RADII[hero];
  if (!Number.isFinite(radius) || !Number.isFinite(x) || !Number.isFinite(y) || !Array.isArray(enemies)) return [];
  const r2 = radius * radius;
  return enemies.filter(enemy => {
    if (!enemy || ![enemy.x, enemy.y, enemy.w, enemy.h].every(Number.isFinite) ||
        enemy.w < 0 || enemy.h < 0) return false;
    const closestX = Math.max(enemy.x, Math.min(x, enemy.x + enemy.w));
    const closestY = Math.max(enemy.y, Math.min(y, enemy.y + enemy.h));
    const dx = closestX - x, dy = closestY - y;
    return dx * dx + dy * dy <= r2;
  });
}

// PROJECT OHANA · Safe gameplay state mutations
// One dependency-free boundary for critical numeric state.
// Initialization/reset assignments may remain local; runtime arithmetic goes here.

export function finiteOr(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function damageEnemy(enemy, amount) {
  if (!enemy) return false;
  const d = Number(amount);
  if (!Number.isFinite(d) || d <= 0) return false;
  enemy.hp = Math.max(0, finiteOr(enemy.hp, 0) - d);
  return true;
}

export function setPlayerHealth(player, value) {
  if (!player) return false;
  const max = Math.max(0, finiteOr(player.maxHealth, 0));
  player.health = Math.max(0, Math.min(max, finiteOr(value, 0)));
  return true;
}

export function healPlayer(player, amount) {
  if (!player) return false;
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return false;
  return setPlayerHealth(player, finiteOr(player.health, 0) + n);
}

export function damagePlayer(player, amount) {
  if (!player) return false;
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return false;
  return setPlayerHealth(player, finiteOr(player.health, 0) - n);
}

export function addPlayerXp(player, amount) {
  if (!player) return false;
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return false;
  player.xp = Math.max(0, finiteOr(player.xp, 0) + n);
  return true;
}

export function addScore(game, amount) {
  if (!game) return false;
  const n = Number(amount);
  if (!Number.isFinite(n) || n === 0) return false;
  game.score = Math.max(0, finiteOr(game.score, 0) + n);
  return true;
}

export function addKill(game, amount = 1) {
  if (!game) return false;
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return false;
  game.kills = Math.max(0, finiteOr(game.kills, 0) + n);
  return true;
}

export function addCombo(game, amount = 1) {
  if (!game) return 0;
  const n = Number(amount);
  if (!Number.isFinite(n) || n === 0) return Math.max(0, finiteOr(game.combo, 0));
  game.combo = Math.max(0, finiteOr(game.combo, 0) + n);
  return game.combo;
}

export function addEnemyHealth(enemy, amount, maxHealth = null) {
  if (!enemy) return false;
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return false;
  const max = maxHealth == null
    ? Math.max(0, finiteOr(enemy.max, finiteOr(enemy.hp, 0)) + n)
    : Math.max(0, finiteOr(maxHealth, 0));
  enemy.hp = Math.max(0, Math.min(max, finiteOr(enemy.hp, 0) + n));
  enemy.max = Math.max(finiteOr(enemy.max, 0), enemy.hp);
  return true;
}

export function scaleEnemyHealth(enemy, factor) {
  if (!enemy) return false;
  const n = Number(factor);
  if (!Number.isFinite(n) || n <= 0) return false;
  const next = Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, finiteOr(enemy.hp, 0) * n));
  enemy.hp = Math.round(next);
  enemy.max = Math.max(finiteOr(enemy.max, 0), enemy.hp);
  return true;
}

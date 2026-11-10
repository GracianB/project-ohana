// Combat logic with enhanced attack and overkill support
import { OVERKILL } from '../scripts/.overkill.js';

export function computeDamage(hero, enemy) {
  // Base attack power from hero.attack or fallback to first ability power
  const basePower = hero.attack?.power ?? (hero.abilities?.[0]?.power ?? 50);
  // Critical hit 10% chance
  const isCrit = Math.random() < 0.10;
  let damage = basePower * (isCrit ? 2 : 1);
  // Overkill mode: increase damage 1.5x and halve enemy health elsewhere
  if (OVERKILL === 'ON') {
    damage *= 1.5;
  }
  return {damage, isCrit};
}

export function applyDamage(enemy, dmg) {
  enemy.health -= dmg.damage;
  if (enemy.health < 0) enemy.health = 0;
}

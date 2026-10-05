import { combatTier } from "./combat-fx.js";

export function damageFeedback({ crit = false, boss = false, combo = 0 } = {}) {
  const comboValue = Math.max(0, Number(combo) || 0);
  const showNumber = !!crit || !!boss || (comboValue >= 4 && comboValue % 2 === 0);
  const tier = Math.max(combatTier(comboValue, crit), boss ? 2 : 0);
  const label = crit ? "CRÍTICO" : boss ? "IMPACTO" : "";
  return Object.freeze({ showNumber, tier, label });
}

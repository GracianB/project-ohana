import { combatTier } from "./combat-fx.js";

export function damageFeedback({ crit = false, boss = false, combo = 0 } = {}) {
  const comboValue = Math.max(0, Number(combo) || 0);
  const showNumber = !!crit || !!boss || (comboValue >= 4 && comboValue % 2 === 0);
  const tier = Math.max(combatTier(comboValue, crit), boss ? 2 : 0);
  const label = crit ? "CRÍTICO" : boss ? "IMPACTO" : "";
  return Object.freeze({ showNumber, tier, label });
}

// A blocked hit is not damage and must not look like a critical hit. Throttle
// sustained auras to one short notice rather than flooding the combat view.
export function showBlockedHit(game, enemy) {
  const tick=Number.isFinite(game?.t)?game.t:0;
  if(tick-(enemy._blockNoticeAt??-Infinity)<30)return;
  enemy._blockNoticeAt=tick;
  game.nums?.add?.(enemy.x,enemy.y-25,'BLINDADO','#c6e8ff',false);
  game.fx?.emit?.(enemy.x+enemy.w/2,enemy.y+enemy.h/2,{color:'#c6e8ff',count:3,size:2,life:12});
}

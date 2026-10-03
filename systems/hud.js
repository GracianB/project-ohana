function setAttribute(el, name, value) {
  if (el && el.getAttribute(name) !== String(value)) el.setAttribute(name, value);
}

export function progressState(value, max, text) {
  return {
    now: Math.round(Math.max(0, Math.min(100, value / Math.max(1, max) * 100))),
    text
  };
}

function syncProgress(el, state) {
  setAttribute(el, "aria-valuenow", state.now);
  setAttribute(el, "aria-valuetext", state.text);
}

export function syncHudStatus({ player, hp, xpPct, boss, document: doc = document }) {
  const hud = doc.getElementById("hud");
  if (!hud) return;
  syncProgress(hud.querySelector(".bar.hp"), progressState(player.health, player.maxHealth, `${hp} de ${player.maxHealth} puntos de salud`));
  syncProgress(hud.querySelector(".bar.xp"), progressState(xpPct, 100, player.evo >= 4 ? "Evolución máxima" : `${Math.round(xpPct)}% hasta la siguiente forma`));
  if (boss) syncProgress(doc.querySelector(".bar.boss"), progressState(boss.hp, boss.max, `${Math.max(0, Math.ceil(boss.hp))} de ${boss.max} puntos de salud`));
  setAttribute(doc.getElementById("form-pips"), "aria-label", `Forma ${player.evo + 1} de 5`);
  setAttribute(doc.getElementById("hud-avatar"), "aria-label", player.name);
  hud.querySelector(".hud-block.player")?.classList.toggle("hurt", player.health / Math.max(1, player.maxHealth) <= 0.28);
  const tint = player.color || "#7ee7ff";
  if (hud.style.getPropertyValue("--tint") !== tint) hud.style.setProperty("--tint", tint);
}


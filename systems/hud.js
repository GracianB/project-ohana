// HUD · detalles visuales que no toca game.js
// (game.js ya pinta barras, textos, pips y avatar en updateHUD()).
// Aquí solo: color de la forma actual como --tint y estado "hurt" con poca vida.
import { ROSTER } from "../characters/roster.js";

function currentForm(name) {
  for (const def of ROSTER) {
    const i = (def.forms || []).findIndex((f) => f.name === name);
    if (i >= 0) return def.forms[i];
  }
  return null;
}

function tick() {
  if (!document.body.classList.contains("playing")) return;
  const hud = document.getElementById("hud");
  if (!hud) return;

  const meta = document.getElementById("hud-meta")?.textContent || "";
  const m = meta.match(/HP\s+(\d+)\s*\/\s*(\d+)/);
  const block = hud.querySelector(".hud-block.player");
  if (block && m) block.classList.toggle("hurt", Number(m[1]) / Math.max(1, Number(m[2])) <= 0.28);

  const name = document.getElementById("hud-name")?.textContent || "";
  const tint = currentForm(name)?.color || "#7ee7ff";
  hud.style.setProperty("--tint", tint);
  document.getElementById("hud-avatar")?.style.setProperty("--tint", tint);
}

setInterval(tick, 150);

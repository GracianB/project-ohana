import { ROSTER } from "../characters/roster.js";

const TINT = {
  lilo: "#e23b3b",
  stitch: "#3d9bff",
  dragon: "#e23a1c",
  ardilla: "#c4783a",
  frita: "#f0b43a",
};

function tick() {
  if (!document.body.classList.contains("playing")) return;
  const hud = document.getElementById("hud");
  if (!hud) return;
  const meta = document.getElementById("hud-meta")?.textContent || "";
  const evo = document.getElementById("hud-evo")?.textContent || "";
  const name = document.getElementById("hud-name")?.textContent || "";
  const block = hud.querySelector(".hud-block.player");
  const m = meta.match(/HP\s+(\d+)\s*\/\s*(\d+)/);
  if (block && m) {
    const ratio = Number(m[1]) / Math.max(1, Number(m[2]));
    block.classList.toggle("hurt", ratio <= 0.28);
  }
  const fm = evo.match(/Forma\s+(\d)/);
  const level = fm ? Number(fm[1]) : 1; // 1..5
  const evoIdx = Math.max(0, Math.min(4, level - 1));
  const pips = document.querySelectorAll("#form-pips b");
  const def = ROSTER.find((r) => name.startsWith(r.name) || (r.evoNames && r.evoNames.includes(name)));
  const tint = (def && (TINT[def.id] || def.color)) || "#7ee7ff";
  for (let i = 0; i < pips.length; i++) {
    const filled = i <= evoIdx;
    const active = i === evoIdx;
    pips[i].classList.toggle("on", filled);
    pips[i].classList.toggle("active", active);
    if (active) {
      pips[i].style.background = tint;
      pips[i].style.borderColor = tint;
      pips[i].style.boxShadow = "0 0 12px " + tint;
    } else {
      pips[i].style.background = "";
      pips[i].style.borderColor = "";
      pips[i].style.boxShadow = "";
    }
  }
  hud.style.setProperty("--tint", tint);
  const av = document.getElementById("hud-avatar");
  if (av) av.style.setProperty("--tint", tint);
}
setInterval(tick, 120);

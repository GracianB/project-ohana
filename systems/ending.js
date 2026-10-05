export function showEnding(detail = {}) {
  let layer = document.getElementById("win-cinema");
  if (!layer) {
    layer = document.createElement("div");
    layer.id = "win-cinema";
    document.body.appendChild(layer);
  }
  if (!layer.querySelector(".win-card")) {
    layer.setAttribute("role", "dialog");
    layer.setAttribute("aria-modal", "true");
    layer.setAttribute("aria-labelledby", "win-title");
    layer.innerHTML =
      '<div class="win-wash"></div>' +
      '<div class="win-card">' +
        '<p class="win-kicker">Mundo 1 · Nido caído</p>' +
        '<h2 id="win-title">OHANA COMPLETADO</h2>' +
        '<p class="win-hero"></p>' +
        '<p class="win-score"></p>' +
        '<p class="win-jun">EL NIDO HA CAÍDO.</p>' +
        '<p class="win-sub">Nadie se queda atrás.</p>' +
        '<div class="win-actions">' +
          '<button type="button" id="win-continue">Continuar en este mundo</button>' +
          '<button type="button" id="win-repeat" class="ghost">Repetir el nido</button>' +
          '<button type="button" id="win-roster" class="ghost">Elegir personaje</button>' +
        "</div>" +
      "</div>";
    layer.querySelector("#win-continue").onclick = () => {
      layer.classList.remove("show");
      dispatchEvent(new CustomEvent("ohana-after", { detail: { action: "continue" } }));
    };
    layer.querySelector("#win-repeat").onclick = () => {
      layer.classList.remove("show");
      dispatchEvent(new CustomEvent("ohana-after", { detail: { action: "repeat" } }));
    };
    layer.querySelector("#win-roster").onclick = () => {
      layer.classList.remove("show");
      dispatchEvent(new CustomEvent("ohana-after", { detail: { action: "roster" } }));
    };
  }
  if (layer.classList.contains("show")) return;
  const hero = detail.hero || "Ohana";
  const form = detail.form || "forma final";
  const rank = detail.rank || "";
  const time = detail.time || "";
  const kills = Number.isFinite(Number(detail.kills)) ? Number(detail.kills) : 0;
  const best = detail.best && detail.best !== time ? " · mejor " + detail.best : "";
  const heroEl = layer.querySelector(".win-hero");
  if (heroEl) heroEl.textContent = hero + " · " + form;
  const score = layer.querySelector(".win-score");
  score.textContent = (rank ? "Claro " + rank + " · " : "") + (time ? time + " · " : "") + kills + " bajas" + best;
  layer.classList.add("show");
}

function watchVictory() {
  addEventListener("ohana-win", (e) => showEnding(e.detail || {}));
}

if (!window.__ohanaWinBound) {
  window.__ohanaWinBound = true;
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", watchVictory);
  else watchVictory();
}

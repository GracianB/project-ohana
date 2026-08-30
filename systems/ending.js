export function showEnding(detail = {}) {
  let layer = document.getElementById("win-cinema");
  if (!layer) {
    layer = document.createElement("div");
    layer.id = "win-cinema";
    layer.innerHTML =
      '<div class="win-wash"></div>' +
      '<div class="win-card">' +
        '<p class="win-kicker">Mundo 1 · Nido caído</p>' +
        '<h2>OHANA COMPLETA</h2>' +
        '<p class="win-score"></p>' +
        '<p class="win-jun">Ahora contacta a Jun xD</p>' +
        '<p class="win-sub">Versión definitiva. Nadie se queda atrás.</p>' +
        '<button type="button" id="win-close">Seguir en la isla</button>' +
      '</div>';
    document.body.appendChild(layer);
    layer.querySelector("#win-close").onclick = () => layer.classList.remove("show");
  }
  if (layer.classList.contains("show")) return;
  layer.querySelector(".win-score").textContent = detail.score ? ("Score " + detail.score) : "El nido ha caído";
  layer.classList.add("show");
}

function watchVictory() {
  const box = document.getElementById("notification-container") || document.body;
  const scan = () => {
    document.querySelectorAll(".game-notification h2").forEach((h) => {
      if (/VICTORIA|NIDO|JEFE/i.test(h.textContent || "")) {
        const p = h.parentElement && h.parentElement.querySelector("p");
        showEnding({ score: p ? p.textContent : "" });
      }
    });
  };
  new MutationObserver(scan).observe(box, { childList: true, subtree: true });
  addEventListener("ohana-win", (e) => showEnding(e.detail || {}));
}

if (!window.__ohanaWinBound) {
  window.__ohanaWinBound = true;
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", watchVictory);
  else watchVictory();
}

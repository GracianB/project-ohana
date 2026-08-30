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
  layer.querySelector(".win-score").textContent = "Score " + (detail.score || 0) + " · Kills " + (detail.kills || 0);
  layer.classList.add("show");
}

if (!window.__ohanaWinBound) {
  window.__ohanaWinBound = true;
  addEventListener("ohana-win", (e) => showEnding(e.detail || {}));
}

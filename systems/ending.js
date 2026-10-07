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
      '<div class="win-rift" aria-hidden="true"><i></i><i></i><i></i></div>' +
      '<div class="win-stars" aria-hidden="true"></div>' +
      '<div class="win-card">' +
        '<p class="win-kicker">Mundo 1 · La familia vuelve a casa</p>' +
        '<p class="win-act">EL NIDO SE ROMPE</p>' +
        '<h2 id="win-title">NADIE SE QUEDA ATRÁS</h2>' +
        '<p class="win-hero"></p>' +
        '<p class="win-score"></p>' +
        '<p class="win-jun">EL NIDO HA CAÍDO · LA REINA HA CAÍDO.</p>' +
        '<p class="win-sub">La oscuridad se abre. Las formas perdidas regresan a la luz. Hoku respira otra vez.</p>' +
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
  const stars = layer.querySelector(".win-stars");
  if (stars && !stars.childElementCount) {
    for (let i = 0; i < 28; i++) {
      const s = document.createElement("i");
      s.style.setProperty("--x", ((i * 37) % 100) + "%");
      s.style.setProperty("--y", ((i * 61) % 100) + "%");
      s.style.setProperty("--d", (i % 9) * 70 + "ms");
      stars.appendChild(s);
    }
  }
  layer.classList.remove("ending-phase-1", "ending-phase-2", "ending-phase-3");
  layer.classList.add("ending-phase-1");
  layer.classList.add("show");
  requestAnimationFrame(() => {
    layer.classList.remove("ending-phase-1");
    layer.classList.add("ending-phase-2");
  });
  window.setTimeout(() => {
    if (layer.classList.contains("show")) {
      layer.classList.remove("ending-phase-2");
      layer.classList.add("ending-phase-3");
    }
  }, matchMedia("(prefers-reduced-motion: reduce)").matches ? 40 : 1050);
}

function watchVictory() {
  addEventListener("ohana-win", (e) => showEnding(e.detail || {}));
}

if (!window.__ohanaWinBound) {
  window.__ohanaWinBound = true;
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", watchVictory);
  else watchVictory();
}

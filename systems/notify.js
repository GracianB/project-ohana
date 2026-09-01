function box() {
  let el = document.getElementById("notification-container");
  if (!el) {
    el = document.createElement("div");
    el.id = "notification-container";
    document.body.appendChild(el);
  }
  return el;
}

export function dismissNotifications() {
  document.querySelectorAll(".game-notification").forEach((el) => {
    if (el.classList.contains("closing")) return;
    el.classList.add("closing");
    setTimeout(() => el.remove(), 260);
  });
}

export function playEvolutionCinema(detail = {}) {
  let layer = document.getElementById("evo-cinema");
  if (!layer) {
    layer = document.createElement("div");
    layer.id = "evo-cinema";
    layer.innerHTML =
      '<div class="evo-wash"></div>' +
      '<div class="evo-ring r1"></div>' +
      '<div class="evo-ring r2"></div>' +
      '<div class="evo-ring r3"></div>' +
      '<div class="evo-copy">' +
        '<p class="evo-kicker">Evolución</p>' +
        '<h2 class="evo-name"></h2>' +
        '<p class="evo-stage"></p>' +
      '</div>';
    document.body.appendChild(layer);
  }
  const name = detail.name || "Nueva forma";
  const stage = Math.max(1, Math.min(5, Number(detail.evo || 0) + 1));
  layer.style.setProperty("--evo", detail.color || "#ffe66a");
  layer.querySelector(".evo-name").textContent = name;
  layer.querySelector(".evo-stage").textContent = "FORMA " + stage + " / 5";
  layer.classList.remove("play");
  void layer.offsetWidth;
  layer.classList.add("play");
  clearTimeout(layer._t);
  layer._t = setTimeout(() => layer.classList.remove("play"), 2100);
}

export function showNotification(title, message, kind) {
  const parent = box();
  while (parent.children.length > 2) parent.firstChild.remove();
  const type = kind || guessKind(title);
  if (type === "evo" && !/^FORMA\s+\d/i.test(String(title))) {
    const form = String(title).match(/FORMA\s+(\d)/i);
    playEvolutionCinema({
      name: String(message || title).replace(/^[¡!]+/, "").replace(/Evolución!?\s*/i, "").trim() || title,
      evo: form ? Number(form[1]) - 1 : 1,
      color: "#ffe66a",
    });
  }
  const el = document.createElement("div");
  el.className = "game-notification " + type;
  el.innerHTML =
    '<button class="notification-close" type="button" aria-label="Cerrar">✕</button>' +
    '<div class="badge">' + typeLabel(type) + "</div>" +
    "<h2>" + title + "</h2>" +
    "<p>" + (message || "") + "</p>" +
    "<small>Pulsa cualquier tecla o haz clic para cerrar</small>";
  parent.appendChild(el);
  const close = (ev) => {
    if (ev) ev.stopPropagation();
    if (el.classList.contains("closing")) return;
    el.classList.add("closing");
    setTimeout(() => el.remove(), 260);
  };
  el.querySelector(".notification-close").addEventListener("click", close);
  el.addEventListener("click", close);
  setTimeout(close, 5200);
}

function guessKind(title) {
  const t = String(title).toUpperCase();
  if (t.includes("EVO") || t.includes("MAX") || t.includes("FORMA")) return "evo";
  if (t.includes("VAC") || t.includes("DERROTA") || t.includes("CERRADO") || t.includes("PELIGRO")) return "hurt";
  if (t.includes("VICTORIA") || t.includes("OHANA") || t.includes("SALA") || t.includes("MAPA") || t.includes("NIDO")) return "sala";
  return "info";
}

function typeLabel(type) {
  if (type === "evo") return "✦ EVOLUCIÓN";
  if (type === "hurt") return "⚠ PELIGRO";
  if (type === "sala") return "⚑ SALA";
  return "• OHANA";
}

if (!window.__ohanaNotifyBound) {
  window.__ohanaNotifyBound = true;
  addEventListener("keydown", () => {
    if (document.querySelector(".game-notification")) dismissNotifications();
  }, true);
  addEventListener("pointerdown", (e) => {
    if (e.target.closest && e.target.closest("#top-actions, #ability-bar, #chars, .char-card, .touch-btn, #help, #map-overlay, #pause-overlay")) return;
    if (document.querySelector(".game-notification")) dismissNotifications();
  }, true);
  addEventListener("ohana-evolve", (e) => playEvolutionCinema(e.detail || {}));
}

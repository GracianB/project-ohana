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

export function showNotification(title, message, kind) {
  const parent = box();
  while (parent.children.length > 2) parent.firstChild.remove();
  const type = kind || guessKind(title);
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
  if (t.includes("EVO") || t.includes("MAX")) return "evo";
  if (t.includes("VAC") || t.includes("DERROTA") || t.includes("CERRADO") || t.includes("PELIGRO")) return "hurt";
  if (t.includes("VICTORIA") || t.includes("SALA") || t.includes("MAPA")) return "sala";
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
}

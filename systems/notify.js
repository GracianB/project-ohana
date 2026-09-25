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

let lastNote = { title: "", at: 0 };

export function showNotification(title, message, kind) {
  const now = performance.now();
  if (lastNote.title === title && now - lastNote.at < 900) return;
  lastNote = { title: String(title || ""), at: now };
  const parent = box();
  parent.replaceChildren();
  const type = kind || guessKind(title);
  const el = document.createElement("div");
  el.className = "game-notification " + type;
  const head = document.createElement("h2");
  head.textContent = title || "";
  el.appendChild(head);
  if (message) {
    const p = document.createElement("p");
    p.textContent = message;
    el.appendChild(p);
  }
  parent.appendChild(el);
  const close = () => {
    if (!el.isConnected || el.classList.contains("closing")) return;
    el.classList.add("closing");
    setTimeout(() => el.remove(), 220);
  };
  el.addEventListener("click", close);
  setTimeout(close, 2200);
}

function guessKind(title) {
  const t = String(title).toUpperCase();
  if (t.includes("EVO") || t.includes("MAX") || t.includes("FORMA")) return "evo";
  if (t.includes("VAC") || t.includes("DERROTA") || t.includes("CERRADO") || t.includes("PELIGRO")) return "hurt";
  if (t.includes("VICTORIA") || t.includes("OHANA") || t.includes("SALA") || t.includes("MAPA") || t.includes("NIDO")) return "sala";
  return "info";
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

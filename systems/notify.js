import { messageManager } from "./message-manager.js";

export function dismissNotifications() {
  messageManager.dismiss();
}

export function showNotification(title, message, kind, options = {}) {
  const type = kind || guessKind(title);
  return messageManager.show({
    type,
    title,
    text: message,
    duration: options.duration,
    priority: options.priority,
    key: options.key,
    dismissible: options.dismissible,
  });
}

export function setObjectiveMessage(text, done = false) {
  messageManager.setObjective(text, done);
}

export function clearObjectiveMessage() {
  messageManager.clearObjective();
}

export function showRoomMessage(title, text, options = {}) {
  return messageManager.show({
    type: "room",
    title,
    text,
    duration: options.duration ?? 4200,
    priority: options.priority ?? 50,
    key: options.key,
  });
}

function guessKind(title) {
  const t = String(title || "").toUpperCase();
  if (t.includes("EVO") || t.includes("MAX") || t.includes("FORMA")) return "evolution";
  if (t.includes("VICTORIA") || t.includes("OHANA") || t.includes("MAPA")) return "system";
  if (t.includes("NIDO") || t.includes("REINA")) return "boss";
  if (t.includes("VAC") || t.includes("DERROTA") || t.includes("CERRADO") || t.includes("PELIGRO")) return "error";
  return "info";
}

if (!globalThis.__ohanaMessageDismissBound) {
  globalThis.__ohanaMessageDismissBound = true;

  addEventListener("keydown", (event) => {
    if (event.key === "Escape") return;
    if (document.querySelector(".game-notification:not([data-persistent='1'])")) {
      dismissNotifications();
    }
  }, true);

  addEventListener("pointerdown", (event) => {
    if (
      event.target?.closest &&
      event.target.closest(
        "#top-actions, #ability-bar, #chars, .char-card, .touch-btn, #help, #map-overlay, #pause-overlay"
      )
    ) return;

    if (document.querySelector(".game-notification:not([data-persistent='1'])")) {
      dismissNotifications();
    }
  }, true);
}

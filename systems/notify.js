import {
  messageManager,
  showSystemMessage,
  showRoomMessage,
  showObjectiveMessage,
  showTutorialMessage,
  showCombatMessage,
  showBossMessage,
  showEvolutionMessage,
  showErrorMessage,
  setPersistentObjective,
  clearPersistentObjective,
} from "./message-manager.js";

export {
  messageManager,
  showSystemMessage,
  showRoomMessage,
  showObjectiveMessage,
  showTutorialMessage,
  showCombatMessage,
  showBossMessage,
  showEvolutionMessage,
  showErrorMessage,
  setPersistentObjective,
  clearPersistentObjective,
};

export function dismissNotifications() {
  messageManager.dismiss();
}

// Compatibility bridge for legacy callers. New code should use semantic functions above.
export function showNotification(title, message, kind, options = {}) {
  const legacyMap = {
    evo: showEvolutionMessage,
    sala: showRoomMessage,
    hurt: showErrorMessage,
    boss: showBossMessage,
    combat: showCombatMessage,
    tutorial: showTutorialMessage,
    objective: showObjectiveMessage,
    system: showSystemMessage,
    error: showErrorMessage,
  };
  const fn = legacyMap[String(kind || "").toLowerCase()] || showSystemMessage;
  return fn(title, message, options);
}

if (!globalThis.__ohanaMessageDismissBound) {
  globalThis.__ohanaMessageDismissBound = true;

  addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
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

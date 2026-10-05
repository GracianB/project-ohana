const POWERS = { j: 0, k: 1, l: 2 };
const MOVEMENT = new Set(["a", "d", "s", "w", " ", "arrowleft", "arrowright", "arrowup", "arrowdown"]);
const ACTIONS = { h: "attack", f: "attack", shift: "dash", e: "interact", r: "respawn" };

export function bindInput({ target, canvas, buttons = [], canAct, actions, isRunning = canAct }) {
  const keys = Object.create(null);
  const held = new Map();
  const listeners = [];
  const keyboardHeldAt = new Map();
  const KEYBOARD_STALE_MS = 1200;
  let keyboardWatchdog = null;

  function nowMs() {
    return typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : Date.now();
  }

  function scheduleKeyboardWatchdog() {
    if (keyboardWatchdog != null || typeof window === "undefined") return;
    keyboardWatchdog = window.setTimeout(() => {
      keyboardWatchdog = null;
      const now = nowMs();
      for (const [source, stamp] of keyboardHeldAt) {
        if (now - stamp > KEYBOARD_STALE_MS) {
          const key = held.get(source);
          held.delete(source);
          keyboardHeldAt.delete(source);
          if (key) keys[key] = [...held.values()].includes(key);
        }
      }
      if (keyboardHeldAt.size) scheduleKeyboardWatchdog();
    }, 400);
  }

  function listen(el, event, handler, options) {
    el.addEventListener(event, handler, options);
    listeners.push(() => el.removeEventListener(event, handler, options));
  }

  function normalize(key) {
    return String(key || "").toLowerCase();
  }

  function hold(key, source, down) {
    key = normalize(key);
    if (!MOVEMENT.has(key)) return;
    if (down) {
      held.set(source, key);
      if (String(source).startsWith("keyboard:")) {
        keyboardHeldAt.set(source, nowMs());
        scheduleKeyboardWatchdog();
      }
    } else {
      held.delete(source);
      if (String(source).startsWith("keyboard:")) keyboardHeldAt.delete(source);
    }
    keys[key] = [...held.values()].includes(key);
  }

  function releasePointerSources(pointerId = null) {
    for (const [source, key] of held) {
      if (!String(source).startsWith("pointer:")) continue;
      if (pointerId != null && source !== "pointer:" + pointerId) continue;
      held.delete(source);
      keys[key] = [...held.values()].includes(key);
    }
    for (const button of buttons) button.classList.remove("held");
  }

  function reset() {
    if (keyboardWatchdog != null && typeof window !== "undefined") {
      window.clearTimeout(keyboardWatchdog);
      keyboardWatchdog = null;
    }
    keyboardHeldAt.clear();
    held.clear();
    for (const key of Object.keys(keys)) keys[key] = false;
    for (const button of buttons) button.classList.remove("held");
  }

  function action(key) {
    if (!canAct()) return;
    if (key in POWERS) actions.power?.(POWERS[key]);
    else actions[ACTIONS[key]]?.();
  }

  listen(target, "keydown", (event) => {
    if (
      event.ctrlKey ||
      event.altKey ||
      event.metaKey ||
      event.target?.closest?.("input, textarea, select, [contenteditable='true']")
    ) return;

    const key = normalize(event.key);
    const shortcut =
      event.code === "Backquote" ||
      ["º", "ª", "?"].includes(key)
        ? "help"
        : { n: "mute", m: "map", escape: "escape" }[key];

    if (shortcut) {
      if (!event.repeat) actions[shortcut]?.();
      return;
    }

    if (!canAct()) return;

    if (MOVEMENT.has(key)) {
      event.preventDefault();
      hold(key, "keyboard:" + key, true);
    }

    if ((key in ACTIONS || key in POWERS) && !event.repeat) {
      event.preventDefault();
      action(key);
    }
  });

  listen(target, "keyup", (event) => {
    const key = normalize(event.key);
    if (!MOVEMENT.has(key)) return;
    event.preventDefault();
    hold(key, "keyboard:" + key, false);
  });

  listen(target, "pointerup", (event) => releasePointerSources(event.pointerId));
  listen(target, "pointercancel", (event) => releasePointerSources(event.pointerId));
  listen(target, "pointerleave", (event) => {
    if (event.buttons === 0) releasePointerSources(event.pointerId);
  });
  listen(target, "touchend", () => releasePointerSources());
  listen(target, "touchcancel", () => releasePointerSources());
  listen(target, "blur", reset);
  listen(target, "focus", reset);
  listen(target, "pagehide", reset);
  if (typeof document !== "undefined") listen(document, "visibilitychange", reset);

  if (canvas) {
    listen(canvas, "pointerdown", (event) => {
      if (canAct()) actions[event.button === 2 ? "dash" : "attack"]?.();
    });
    listen(canvas, "contextmenu", (event) => {
      if (isRunning()) event.preventDefault();
    });
  }

  for (const button of buttons) {
    const key = normalize(button.dataset.k);

    listen(button, "pointerdown", (event) => {
      if (!canAct()) return;
      event.preventDefault();
      button.setPointerCapture?.(event.pointerId);
      button.classList.add("held");

      if (MOVEMENT.has(key)) {
        hold(key, "pointer:" + event.pointerId, true);
      } else {
        action(key);
      }
    });

    const release = (event) => {
      releasePointerSources(event.pointerId);
      if (!keys[key]) button.classList.remove("held");
    };

    listen(button, "pointerup", release);
    listen(button, "pointercancel", release);
    listen(button, "lostpointercapture", release);
    listen(button, "click", (event) => {
      if (event.detail === 0 && !MOVEMENT.has(key)) action(key);
    });
  }

  return {
    keys,
    reset,
    destroy() {
      reset();
      listeners.forEach((remove) => remove());
    }
  };
}

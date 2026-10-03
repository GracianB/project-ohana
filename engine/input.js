const POWERS = { j: 0, k: 1, l: 2 };
const MOVEMENT = new Set(["a", "d", "s", "w", " ", "arrowleft", "arrowright", "arrowup", "arrowdown"]);
const ACTIONS = { h: "attack", f: "attack", shift: "dash", e: "interact", r: "respawn" };

export function bindInput({ target, canvas, buttons = [], canAct, actions, isRunning = canAct }) {
  const keys = Object.create(null);
  const held = new Map();
  const listeners = [];
  function listen(el, event, handler) {
    el.addEventListener(event, handler);
    listeners.push(() => el.removeEventListener(event, handler));
  }
  function hold(key, source, down) {
    if (down) held.set(source, key); else held.delete(source);
    keys[key] = [...held.values()].includes(key);
  }
  function reset() {
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
    if (event.ctrlKey || event.altKey || event.metaKey || event.target?.closest?.("input, textarea, select, [contenteditable='true']")) return;
    const key = event.key.toLowerCase();
    const shortcut = event.code === "Backquote" || ["º", "ª", "?"].includes(key) ? "help" : { n: "mute", m: "map", escape: "escape" }[key];
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
  listen(target, "keyup", (event) => hold(event.key.toLowerCase(), "keyboard:" + event.key.toLowerCase(), false));
  listen(target, "blur", reset);
  if (canvas) {
    listen(canvas, "pointerdown", (event) => {
      if (canAct()) actions[event.button === 2 ? "dash" : "attack"]?.();
    });
    listen(canvas, "contextmenu", (event) => { if (isRunning()) event.preventDefault(); });
  }
  for (const button of buttons) {
    const key = button.dataset.k;
    listen(button, "pointerdown", (event) => {
      if (!canAct()) return;
      event.preventDefault();
      button.setPointerCapture?.(event.pointerId);
      button.classList.add("held");
      if (MOVEMENT.has(key)) hold(key, event.pointerId, true);
      else action(key);
    });
    const release = (event) => {
      hold(key, event.pointerId, false);
      if (!keys[key]) button.classList.remove("held");
    };
    listen(button, "pointerup", release);
    listen(button, "pointercancel", release);
    listen(button, "lostpointercapture", release);
    listen(button, "click", (event) => { if (event.detail === 0 && !MOVEMENT.has(key)) action(key); });
  }
  return { keys, reset, destroy() { reset(); listeners.forEach((remove) => remove()); } };
}

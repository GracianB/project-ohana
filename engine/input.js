const POWERS = { j: 0, k: 1, l: 2, u: 3 };
const MOVEMENT = new Set(["a", "d", "s", "w", " ", "arrowleft", "arrowright", "arrowup", "arrowdown"]);
const ACTIONS = { h: "attack", f: "attack", shift: "dash", e: "interact", r: "respawn" };
const LEFT_KEYS = new Set(["a", "arrowleft"]);
const RIGHT_KEYS = new Set(["d", "arrowright"]);

export function bindInput({ target, canvas, buttons = [], canAct, actions, isRunning = canAct }) {
  const keys = Object.create(null);
  const held = new Map();
  const heldOrder = new Map();
  const pressed = new Set();
  const pointerButtons = new Map();
  const listeners = [];
  let pressSerial = 0;

  function listen(el, event, handler, options) {
    el.addEventListener(event, handler, options);
    listeners.push(() => el.removeEventListener(event, handler, options));
  }

  function normalize(key) {
    return String(key || "").toLowerCase();
  }

  // Prefer physical keyboard codes for movement so WASD remains WASD across
  // layouts. event.key stays as a compatibility/test fallback.
  function movementKey(event) {
    const codeMap = {
      KeyA: "a", KeyD: "d", KeyW: "w", KeyS: "s",
      ArrowLeft: "arrowleft", ArrowRight: "arrowright",
      ArrowUp: "arrowup", ArrowDown: "arrowdown", Space: " ",
    };
    return codeMap[event?.code] || normalize(event?.key);
  }

  function logicalDown(key) {
    for (const value of held.values()) if (value === key) return true;
    return false;
  }

  function hold(key, source, down) {
    key = normalize(key);
    if (!MOVEMENT.has(key)) return;

    if (down) {
      const sourceAlreadyHeld = held.has(source);
      const keyWasDown = logicalDown(key);
      if (!sourceAlreadyHeld || held.get(source) !== key) {
        held.set(source, key);
        heldOrder.set(source, ++pressSerial);
      }
      // Key repeat must never create a new logical press.
      if (!keyWasDown) pressed.add(key);
    } else {
      held.delete(source);
      heldOrder.delete(source);
    }
    keys[key] = logicalDown(key);
  }

  function axisX() {
    let bestOrder = -1;
    let axis = 0;
    for (const [source, key] of held) {
      const candidate = LEFT_KEYS.has(key) ? -1 : RIGHT_KEYS.has(key) ? 1 : 0;
      if (!candidate) continue;
      const order = heldOrder.get(source) || 0;
      if (order > bestOrder) {
        bestOrder = order;
        axis = candidate;
      }
    }
    return axis;
  }

  function consumePress(candidates) {
    const wanted = Array.isArray(candidates) ? candidates.map(normalize) : [normalize(candidates)];
    let hit = false;
    for (const key of wanted) {
      if (pressed.has(key)) hit = true;
      pressed.delete(key);
    }
    return hit;
  }

  function releasePointerSources(pointerId = null) {
    const touched = new Set();
    for (const [source, key] of [...held]) {
      if (!String(source).startsWith("pointer:")) continue;
      if (pointerId != null && source !== "pointer:" + pointerId) continue;
      held.delete(source);
      heldOrder.delete(source);
      touched.add(key);
    }
    if (pointerId == null) pointerButtons.clear();
    else pointerButtons.delete(pointerId);
    for (const key of touched) keys[key] = logicalDown(key);
    const activeButtons = new Set(pointerButtons.values());
    for (const button of buttons) button.classList.toggle("held", activeButtons.has(button));
  }

  function reset() {
    held.clear();
    heldOrder.clear();
    pressed.clear();
    pointerButtons.clear();
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

    const key = movementKey(event);
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
    const key = movementKey(event);
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
  if (typeof document !== "undefined") {
    listen(document, "visibilitychange", () => {
      if (document.hidden) reset();
    });
  }

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
      pointerButtons.set(event.pointerId, button);
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
    axisX,
    consumePress,
    reset,
    destroy() {
      reset();
      listeners.forEach((remove) => remove());
    }
  };
}

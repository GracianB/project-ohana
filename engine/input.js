const POWERS = { j: 0, k: 1, l: 2, u: 3, i: 4, p: 5 };
const MOVEMENT = new Set(["a", "d", "s", "w", " ", "arrowleft", "arrowright", "arrowup", "arrowdown"]);
const ACTIONS = { h: "attack", f: "attack", shift: "dash", e: "interact", r: "respawn" };
const LEFT_KEYS = new Set(["a", "arrowleft"]);
const RIGHT_KEYS = new Set(["d", "arrowright"]);

export function bindInput({ target, canvas, buttons = [], canAct, actions, isRunning = canAct, getGamepads = () => globalThis.navigator?.getGamepads?.() || [] }) {
  const keys = Object.create(null);
  const held = new Map();
  const heldOrder = new Map();
  const pressed = new Set();
  const pointerButtons = new Map();
  const listeners = [];
  let pressSerial = 0;
  let padAxis=0,padJumpHeld=false,padSuppress=false;
  let previousPad={jump:false,attack:false,dash:false};
  const padPressed=new Set();

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


  // V652: Standard Gamepad API, polled on the same physics ticks as keyboard
  // and touch. No timers or synthetic key events; button edges never repeat.
  function pollGamepad(){
    let candidates=[];
    try{candidates=Array.from(getGamepads?.()||[]);}catch(_){candidates=[];}
    const pad=candidates.find(p=>p&&p.connected!==false);
    if(!pad){padAxis=0;padJumpHeld=false;previousPad={jump:false,attack:false,dash:false};padSuppress=false;return;}
    const heldButton=i=>!!pad.buttons?.[i]?.pressed;
    const axis=Number(pad.axes?.[0]);
    const analog=Number.isFinite(axis)&&Math.abs(axis)>.22?Math.max(-1,Math.min(1,axis)):0;
    padAxis=(heldButton(14)?-1:heldButton(15)?1:analog);
    const now={jump:heldButton(0),attack:heldButton(1),dash:heldButton(2)};
    padJumpHeld=now.jump;
    if(padSuppress){
      if(!now.jump&&!now.attack&&!now.dash)padSuppress=false;
    }else{
      if(now.jump&&!previousPad.jump)padPressed.add('w');
      if(canAct()&&now.attack&&!previousPad.attack)actions.attack?.();
      if(canAct()&&now.dash&&!previousPad.dash)actions.dash?.();
    }
    previousPad=now;
  }

  function axisX() {
    pollGamepad();
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
    // A physical keyboard or touch direction wins while it is held.
    return bestOrder>=0?axis:padAxis;
  }

  function consumePress(candidates) {
    pollGamepad();
    const wanted = Array.isArray(candidates) ? candidates.map(normalize) : [normalize(candidates)];
    let hit = false;
    for (const key of wanted) {
      if (pressed.has(key)||padPressed.has(key)) hit = true;
      pressed.delete(key);padPressed.delete(key);
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
    for (const button of buttons) {
      const active = activeButtons.has(button);
      button.classList.toggle("held", active);
      button.setAttribute?.("aria-pressed", active ? "true" : "false");
    }
  }

  function reset() {
    held.clear();
    heldOrder.clear();
    pressed.clear();
    pointerButtons.clear();
    padPressed.clear();padAxis=0;padJumpHeld=false;padSuppress=true;
    previousPad={jump:false,attack:false,dash:false};
    for (const key of Object.keys(keys)) keys[key] = false;
    for (const button of buttons) {
      button.classList.remove("held");
      button.setAttribute?.("aria-pressed", "false");
    }
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
    // Always release a held direction. Modal controls still need their native
    // keyup (Space activates summary/buttons); gameplay must not cancel it.
    if (canAct()) event.preventDefault();
    hold(key, "keyboard:" + key, false);
  });

  listen(target, "pointerup", (event) => releasePointerSources(event.pointerId));
  listen(target, "pointercancel", (event) => releasePointerSources(event.pointerId));
  listen(target, "pointerleave", (event) => {
    if (event.buttons === 0) releasePointerSources(event.pointerId);
  });
  // Pointer Events already identify each finger independently. Legacy touch
  // cleanup is fallback-only; otherwise lifting one finger would clear all.
  if (typeof PointerEvent === "undefined") {
    listen(target, "touchend", () => releasePointerSources());
    listen(target, "touchcancel", () => releasePointerSources());
  }
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
      button.setAttribute?.("aria-pressed", "true");

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
    gamepadJumpHeld(){pollGamepad();return padJumpHeld;},
    reset,
    destroy() {
      reset();
      listeners.forEach((remove) => remove());
    }
  };
}

const DEFAULT_DURATION = {
  system: 2400,
  room: 4200,
  objective: 3200,
  tutorial: 5200,
  combat: 1800,
  boss: 5200,
  evolution: 5200,
  error: 2600,
};

const TYPE_ALIASES = {
  evo: "evolution",
  sala: "room",
  hurt: "error",
};

const PRIORITY = {
  system: 20,
  info: 30,
  objective: 40,
  room: 50,
  tutorial: 60,
  combat: 70,
  boss: 90,
  evolution: 100,
  error: 110,
};

const REDUCED_DURATION_FACTOR = 0.85;

export function messagePriority(type = "info") {
  return PRIORITY[type] ?? PRIORITY.info;
}

export function normalizeMessage(input = {}) {
  const requestedType = String(input.type || "info").toLowerCase();
  const type = TYPE_ALIASES[requestedType] || requestedType;
  const title = String(input.title || "").trim();
  const text = String(input.text ?? input.message ?? "").trim();
  const duration = Number.isFinite(Number(input.duration))
    ? Math.max(0, Number(input.duration))
    : (DEFAULT_DURATION[type] ?? DEFAULT_DURATION.system);

  return {
    type,
    title,
    text,
    duration,
    priority: Number.isFinite(Number(input.priority))
      ? Number(input.priority)
      : messagePriority(type),
    key: String(input.key || (type + "|" + title + "|" + text)),
    dismissible: input.dismissible !== false,
  };
}

export class MessageManager {
  constructor({ documentRef = globalThis.document, reducedMotion = () => false } = {}) {
    this.document = documentRef;
    this.reducedMotion = reducedMotion;
    this.current = null;
    this.objective = "";
    this.objectiveDone = false;
    this.timer = 0;
    this.lastKey = "";
    this.lastAt = 0;
    this.node = null;
  }

  mount() {
    if (!this.document) return null;

    let root = this.document.getElementById("notification-container");
    if (!root) {
      root = this.document.createElement("div");
      root.id = "notification-container";
      this.document.body.appendChild(root);
    }

    root.setAttribute("role", "status");
    root.setAttribute("aria-live", "polite");
    root.setAttribute("aria-atomic", "true");
    root.dataset.messageManager = "1";
    this.node = root;
    return root;
  }

  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = 0;
    }
  }

  dismiss() {
    this.clearTimer();
    if (!this.node) return;
    const current = this.node.querySelector(".game-notification");
    if (current) current.classList.add("closing");
    setTimeout(() => {
      this.renderFallback();
    }, 180);
    this.current = null;
  }

  setObjective(text, done = false) {
    this.objective = String(text || "").trim();
    this.objectiveDone = !!done;
    if (!this.current) this.renderFallback();
  }

  clearObjective() {
    this.objective = "";
    this.objectiveDone = false;
    if (!this.current) this.renderFallback();
  }

  show(input = {}) {
    const msg = normalizeMessage(input);
    if (!msg.title && !msg.text) return false;

    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    if (msg.key === this.lastKey && now - this.lastAt < 700) return false;

    if (this.current && this.current.priority > msg.priority) return false;

    this.lastKey = msg.key;
    this.lastAt = now;
    this.clearTimer();

    const root = this.mount();
    if (!root) return false;

    const existing = root.querySelector(".game-notification");
    if (existing) existing.classList.add("closing");

    const el = this.document.createElement("div");
    el.className = "game-notification " + msg.type;
    el.setAttribute("role", "status");
    el.dataset.messageKey = msg.key;

    if (msg.title) {
      const head = this.document.createElement("h2");
      head.textContent = msg.title;
      el.appendChild(head);
    }

    if (msg.text) {
      const p = this.document.createElement("p");
      p.textContent = msg.text;
      el.appendChild(p);
    }

    root.replaceChildren(el);
    this.current = msg;

    const duration = this.reducedMotion()
      ? msg.duration * REDUCED_DURATION_FACTOR
      : msg.duration;

    if (msg.dismissible) {
      el.addEventListener("click", () => this.dismiss(), { once: true });
    }

    if (duration > 0) {
      this.timer = setTimeout(() => {
        this.current = null;
        this.renderFallback();
      }, duration);
    }

    return true;
  }

  renderFallback() {
    const root = this.mount();
    if (!root) return;

    if (!this.objective) {
      root.replaceChildren();
      return;
    }

    const el = this.document.createElement("div");
    el.className = "game-notification objective" + (this.objectiveDone ? " done" : "");
    el.setAttribute("role", "status");
    el.dataset.persistent = "1";

    const head = this.document.createElement("h2");
    head.textContent = this.objectiveDone ? "OBJETIVO COMPLETO" : "OBJETIVO";
    el.appendChild(head);

    const p = this.document.createElement("p");
    p.textContent = this.objective;
    el.appendChild(p);

    root.replaceChildren(el);
    this.current = null;
  }
}

export const messageManager =
  new MessageManager({
    reducedMotion: () =>
      typeof document !== "undefined" &&
      document.body?.dataset?.experienceMotion === "reduced",
  });

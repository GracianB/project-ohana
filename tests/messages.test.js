import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  MessageManager,
  messagePriority,
  normalizeMessage,
} from "../systems/message-manager.js";

class FakeElement {
  constructor() {
    this.children = [];
    this.dataset = {};
    this.className = "";
    this.attributes = new Map();
    this.textContent = "";
    this.connected = true;
  }
  appendChild(child) { this.children.push(child); child.parentNode = this; return child; }
  replaceChildren(...children) { this.children = children; for (const child of children) child.parentNode = this; }
  querySelector(selector) {
    if (selector === ".game-notification") {
      return this.children.find((child) => String(child.className).includes("game-notification")) || null;
    }
    return null;
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  addEventListener() {}
  classList = {
    add: () => {},
  };
}

class FakeDocument {
  constructor() {
    this.nodes = new Map();
    this.body = new FakeElement();
    this.body.appendChild = (child) => {
      child.parentNode = this.body;
      if (child.id) this.nodes.set(child.id, child);
      this.body.children.push(child);
      return child;
    };
  }
  getElementById(id) { return this.nodes.get(id) || null; }
  createElement() { return new FakeElement(); }
}

test("prioridades: evolución > jefe > combate > sala > tutorial > objetivo", () => {
  assert.ok(messagePriority("evolution") > messagePriority("boss"));
  assert.ok(messagePriority("boss") > messagePriority("combat"));
  assert.ok(messagePriority("combat") > messagePriority("tutorial"));
  assert.ok(messagePriority("room") > messagePriority("tutorial"));
  assert.ok(messagePriority("tutorial") > messagePriority("objective"));
});

test("compatibilidad: tipos antiguos se normalizan al contrato nuevo", () => {
  assert.equal(normalizeMessage({ type: "sala", title: "Costa" }).type, "room");
  assert.equal(normalizeMessage({ type: "evo", title: "Forma 3" }).type, "evolution");
  assert.equal(normalizeMessage({ type: "hurt", title: "Daño" }).type, "error");
});

test("el manager conserva un único mensaje y rechaza uno de menor prioridad", () => {
  const documentRef = new FakeDocument();
  const manager = new MessageManager({ documentRef });

  assert.equal(manager.show({
    type: "boss",
    title: "REINA",
    text: "Despierta",
    duration: 0,
    key: "boss:intro",
  }), true);

  assert.equal(manager.show({
    type: "room",
    title: "VOLCÁN",
    text: "Sigue",
    duration: 0,
    key: "room:volcano",
  }), false);

  const root = manager.mount();
  assert.equal(root.children.length, 1);
  assert.match(root.children[0].className, /boss/);
});


test("tutorial: no vuelve la secuencia temporal ni los overlays retirados", () => {
  const source = fs.readFileSync(
    new URL("../systems/demo.js", import.meta.url),
    "utf8"
  );

  assert.doesNotMatch(source, /const STEPS\s*=\s*\[/);
  assert.doesNotMatch(source, /setTimeout\(play/);
  assert.match(source, /const KEY_HINTS\s*=\s*new Map/);
  assert.match(source, /showTutorialMessage/);
});


test("message accessibility: urgency changes the live region without changing the visual contract", () => {
  const source = fs.readFileSync(
    new URL("../systems/message-manager.js", import.meta.url),
    "utf8"
  );
  assert.match(source, /aria-live/);
  assert.match(source, /assertive/);
  assert.match(source, /prefers-reduced-motion/);
});

test("persistent objective recovers from a stale toast whose DOM was removed", () => {
  const documentRef = new FakeDocument();
  const manager = new MessageManager({ documentRef });
  manager.show({ type: "room", title: "Cocina", duration: 0 });
  manager.setObjective("Cliente esperando · quedan 15 s");
  const root = manager.mount();
  assert.match(root.children[0].className, /room/,
    "a live higher-priority toast must retain the slot");
  // Simulate the legacy cinematic removing a toast without dismiss().
  root.replaceChildren();
  manager.setObjective("Cliente esperando · quedan 14 s");
  assert.equal(manager.current, null);
  assert.equal(root.children.length, 1);
  assert.equal(root.children[0].dataset.persistent, "1");
  assert.match(root.children[0].children[1].textContent, /quedan 14 s/);
  assert.equal(root.attributes.get("aria-live"), "polite");
});

test("Pizza objective is restored after the player closes a higher-priority evolution toast", async () => {
  const manager = new MessageManager({ documentRef: new FakeDocument() });
  manager.setObjective("Cliente esperando · quedan 14 s");
  assert.equal(manager.node.children[0].dataset.persistent, "1");
  assert.equal(manager.show({
    type: "evolution", title: "NUEVA FORMA · 2/5", text: "Hilo de queso",
    key: "evolution:pizza:1", duration: 0,
  }), true);
  manager.setObjective("Cliente esperando · quedan 13 s");
  assert.match(manager.node.children[0].className, /evolution/);
  assert.equal(manager.node.children[0].dataset.persistent, undefined,
    "the priority evolution toast must own the single visible slot");
  manager.dismiss(); // equivalent to clicking the actual notification
  await new Promise(resolve => setTimeout(resolve, 205));
  assert.equal(manager.node.children[0].dataset.persistent, "1");
  assert.match(manager.node.children[0].children[1].textContent, /quedan 13 s/);
});

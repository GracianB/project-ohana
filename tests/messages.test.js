import test from "node:test";
import assert from "node:assert/strict";
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
    this.body = new FakeElement();
    this.nodes = new Map();
  }
  getElementById(id) { return this.nodes.get(id) || null; }
  createElement() { return new FakeElement(); }
}

test("prioridades: evolución > jefe > combate > tutorial > sala > objetivo", () => {
  assert.ok(messagePriority("evolution") > messagePriority("boss"));
  assert.ok(messagePriority("boss") > messagePriority("combat"));
  assert.ok(messagePriority("combat") > messagePriority("tutorial"));
  assert.ok(messagePriority("tutorial") > messagePriority("room"));
  assert.ok(messagePriority("room") > messagePriority("objective"));
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

import test from "node:test";
import assert from "node:assert/strict";
import { createFixedClock } from "../engine/clock.js";
import { bindInput } from "../engine/input.js";
import { createSaveStore, unpackSave } from "../systems/save.js";
import { progressState, syncHudStatus } from "../systems/hud.js";

function simulate(hz) {
  const clock = createFixedClock();
  const player = { x: 0, y: 0, vy: -12, ticks: 0 };
  for (let frame = 0; frame <= hz * 10; frame++) {
    clock.advance(frame * 1000 / hz, () => {
      player.x += 3;
      player.vy += 0.5;
      player.y += player.vy;
      player.ticks++;
    });
  }
  return player;
}

test("la física mantiene 60 pasos por segundo a 30, 60, 120 y 144 Hz", () => {
  const baseline = simulate(60);
  assert.equal(baseline.ticks, 600);
  for (const hz of [30, 120, 144]) assert.deepEqual(simulate(hz), baseline, `${hz} Hz`);
});

test("el reloj limita atrasos y no recupera tiempo tras una pausa", () => {
  const clock = createFixedClock();
  let ticks = 0;
  const update = () => ticks++;
  clock.advance(0, update);
  assert.equal(clock.advance(5000, update), 5);
  clock.reset();
  assert.equal(clock.advance(20000, update), 0);
  clock.advance(20000 + 1000 / 60, update);
  assert.equal(ticks, 6);
  assert.equal(clock.advance(NaN, update), 0);
});

class Element extends EventTarget {
  constructor(key) {
    super();
    this.dataset = { k: key };
    this.attrs = new Map();
    this.style = { getPropertyValue: (key) => this.attrs.get(key), setProperty: (key, value) => this.attrs.set(key, value) };
    const classes = new Set();
    this.classList = {
      add: (...tokens) => tokens.forEach((token) => classes.add(token)),
      remove: (...tokens) => tokens.forEach((token) => classes.delete(token)),
      contains: (token) => classes.has(token),
      toggle: (token, on) => on ? classes.add(token) : classes.delete(token)
    };
  }
  setAttribute(name, value) { this.attrs.set(name, String(value)); }
  getAttribute(name) { return this.attrs.get(name) ?? null; }
  setPointerCapture(id) { this.captured = id; }
}
function send(target, type, fields = {}) {
  const event = new Event(type, { cancelable: true });
  Object.assign(event, fields);
  target.dispatchEvent(event);
  return event;
}

function inputFixture() {
  const target = new EventTarget();
  const move = new Element("d");
  const interact = new Element("e");
  const canvas = new Element();
  let enabled = true;
  const calls = [];
  const input = bindInput({ target, canvas, buttons: [move, interact], canAct: () => enabled,
    actions: { interact: () => calls.push("interact"), attack: () => calls.push("attack"), escape: () => calls.push("escape") } });
  return { target, move, interact, canvas, calls, input, disable() { enabled = false; } };
}

test("perder foco limpia teclado y botones sin dejar movimiento atascado", () => {
  const f = inputFixture();
  send(f.target, "keydown", { key: "d" });
  send(f.move, "pointerdown", { pointerId: 1 });
  assert.equal(f.input.keys.d, true);
  send(f.target, "blur");
  assert.equal(f.input.keys.d, false);
  assert.equal(f.move.classList.contains("held"), false);
  f.input.destroy();
});

test("las entradas táctiles capturan el puntero y respetan pulsaciones simultáneas", () => {
  const f = inputFixture();
  send(f.move, "pointerdown", { pointerId: 1 });
  assert.equal(f.move.captured, 1);
  send(f.target, "keydown", { key: "d" });
  send(f.move, "pointercancel", { pointerId: 1 });
  assert.equal(f.input.keys.d, true);
  send(f.target, "keyup", { key: "d" });
  assert.equal(f.input.keys.d, false);
  send(f.move, "pointerdown", { pointerId: 2 });
  send(f.move, "lostpointercapture", { pointerId: 2 });
  assert.equal(f.input.keys.d, false);
  f.input.destroy();
});

test("E funciona en teclado y táctil, pero las acciones no se ejecutan en pausa", () => {
  const f = inputFixture();
  send(f.target, "keydown", { key: "e" });
  send(f.target, "keydown", { key: "e", repeat: true });
  send(f.interact, "pointerdown", { pointerId: 3 });
  assert.deepEqual(f.calls, ["interact", "interact"]);
  f.disable();
  send(f.interact, "pointerdown", { pointerId: 4 });
  send(f.canvas, "pointerdown", { button: 0 });
  send(f.target, "keydown", { key: "d" });
  send(f.target, "keydown", { key: "Escape" });
  assert.deepEqual(f.calls, ["interact", "interact", "escape"]);
  assert.notEqual(f.input.keys.d, true);
  f.input.destroy();
});

test("desvincular controles elimina sus escuchadores", () => {
  const f = inputFixture();
  f.input.destroy();
  send(f.target, "keydown", { key: "e" });
  send(f.interact, "pointerdown", { pointerId: 1 });
  assert.deepEqual(f.calls, []);
});

function memoryStorage() {
  const data = new Map();
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
}
const makeGame = () => ({ player: { id: "kilo", evo: 2, xp: 150, health: 80 }, roomId: "boss", visited: { hub: true, boss: true }, score: 12, kills: 4, won: true });

test("el guardado conserva victoria, salud y magia y no mezcla personajes", () => {
  const store = createSaveStore(memoryStorage());
  assert.equal(store.write(makeGame(), { snapshot: () => ({ shield: 20 }) }), true);
  const saved = store.read("kilo");
  assert.equal(saved.won, true);
  assert.equal(saved.hp, 80);
  assert.deepEqual(saved.magic, { shield: 20 });
  assert.equal(store.read("dino"), null);
});

test("el guardado no sustituye un punto de control por una partida vacía o muerta", () => {
  const store = createSaveStore(memoryStorage());
  store.write(makeGame());
  assert.equal(store.write({}), false);
  const dead = makeGame(); dead.player.dead = true;
  assert.equal(store.write(dead), false);
  assert.equal(store.read("kilo").hp, 80);
});

test("almacenamiento bloqueado y JSON corrupto no rompen la partida", () => {
  const broken = createSaveStore(() => { throw new Error("Storage blocked"); });
  assert.equal(broken.readRaw(), null);
  assert.equal(broken.write(makeGame()), false);
  const storage = memoryStorage();
  storage.setItem("ohana", "{malformed");
  assert.equal(createSaveStore(storage).read("kilo"), null);
  assert.equal(unpackSave({ id: "kilo", evo: 2.9 }, "kilo").evo, 2);
});

test("los valores accesibles de las barras se limitan entre 0 y 100", () => {
  assert.equal(progressState(-2, 100, "").now, 0);
  assert.equal(progressState(200, 100, "").now, 100);
  assert.equal(progressState(25, 50, "").now, 50);
});

test("el HUD sincroniza salud, experiencia, jefe y forma sin leer textos del DOM", () => {
  const elements = Object.fromEntries(["hud", "hp", "xp", "boss", "form-pips", "hud-avatar", "block"].map((id) => [id, new Element()]));
  elements.hud.querySelector = (selector) => ({ ".bar.hp": elements.hp, ".bar.xp": elements.xp, ".hud-block.player": elements.block })[selector];
  const doc = { getElementById: (id) => elements[id], querySelector: () => elements.boss };
  syncHudStatus({ document: doc, player: { health: 25, maxHealth: 100, evo: 2, name: "Kilo", color: "#fff" }, hp: 25, xpPct: 60, boss: { hp: 40, max: 80 } });
  assert.equal(elements.hp.getAttribute("aria-valuenow"), "25");
  assert.equal(elements.xp.getAttribute("aria-valuenow"), "60");
  assert.equal(elements.boss.getAttribute("aria-valuenow"), "50");
  assert.equal(elements["form-pips"].getAttribute("aria-label"), "Forma 3 de 5");
  assert.equal(elements.block.classList.contains("hurt"), true);
});

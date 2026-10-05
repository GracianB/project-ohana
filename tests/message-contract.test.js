import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const criticalFiles = [
  "../game.js",
  "../systems/demo.js",
  "../systems/boss-nido.js",
];

test("message contract: gameplay no llama directamente al legacy showNotification", () => {
  for (const relative of criticalFiles) {
    const source = fs.readFileSync(new URL(relative, import.meta.url), "utf8");
    assert.doesNotMatch(
      source,
      /\bshowNotification\s*\(/,
      relative + " todavía depende de showNotification()"
    );
  }
});

test("message contract: no vuelven los overlays de demo retirados", () => {
  const sources = [
    fs.readFileSync(new URL("../systems/demo.js", import.meta.url), "utf8"),
    fs.readFileSync(new URL("../index.html", import.meta.url), "utf8"),
    fs.readFileSync(new URL("../demo.css", import.meta.url), "utf8"),
  ].join("\n");

  assert.doesNotMatch(sources, /demo-ribbon|demo-obj|demo-tut/);
  assert.doesNotMatch(sources, /id=["']room-banner["']/);
});

test("message contract: existe un solo punto de render para notificaciones", () => {
  const source = fs.readFileSync(
    new URL("../systems/message-manager.js", import.meta.url),
    "utf8"
  );
  assert.equal((source.match(/replaceChildren\(el\)/g) || []).length, 2);
  assert.match(source, /className = "game-notification "/);
});

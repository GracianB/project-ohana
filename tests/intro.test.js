import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("intro visual: no reintroduce letterboxing mediante sombras internas", () => {
  const css = fs.readFileSync(
    new URL("../intro.css", import.meta.url),
    "utf8"
  );
  const block = css.match(/#ohana-intro\.show\s*\{[^}]*\}/)?.[0] || "";
  assert.doesNotMatch(block, /box-shadow/i);
});

test("intro visual: conserva skip accesible", () => {
  const source = fs.readFileSync(
    new URL("../systems/intro.js", import.meta.url),
    "utf8"
  );
  assert.match(source, /aria-label="Saltar introducción"/);
  assert.match(source, /key === "Escape"/);
});

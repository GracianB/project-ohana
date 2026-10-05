import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("HUD hierarchy: objectives persist down, transient messages stay above", () => {
  const css = fs.readFileSync(
    new URL("../style.css", import.meta.url),
    "utf8"
  );
  assert.match(css, /#notification-container:has\(\.game-notification\.objective\)/);
  assert.match(css, /bottom:\s*132px/);
  assert.match(css, /body\.boss-fight #notification-container:has\(\.game-notification:not\(\.objective\)\)/);
});

test("HUD hierarchy: retired room banner has no remaining dedicated rule", () => {
  const [style, hud] = [
    fs.readFileSync(new URL("../style.css", import.meta.url), "utf8"),
    fs.readFileSync(new URL("../hud.css", import.meta.url), "utf8"),
  ];
  assert.doesNotMatch(style, /#room-banner\s*\{/);
  assert.doesNotMatch(hud, /#room-banner/);
});

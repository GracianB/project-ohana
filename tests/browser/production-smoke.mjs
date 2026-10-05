import assert from "node:assert/strict";
import { chromium } from "playwright";

const url = process.env.PAGE_URL;
if (!url) throw new Error("PAGE_URL es obligatorio");

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];

page.on("pageerror", (error) => errors.push("pageerror: " + (error.stack || error.message)));
page.on("console", (message) => {
  if (message.type() === "error") errors.push("console: " + message.text());
});

try {
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForSelector("#btn-play", { state: "visible", timeout: 10000 });
  assert.match(await page.title(), /PROJECT OHANA/i);
  assert.equal(await page.evaluate(() => window.__OHANA_E2E), undefined, "harness E2E expuesto en producción");
  assert.equal(await page.locator("#game").count(), 1, "Canvas ausente en producción");

  await page.locator("#btn-play").click();
  await page.waitForTimeout(700);
  assert.notEqual(await page.locator("#hud").getAttribute("aria-hidden"), "true", "HUD no arranca en producción");
  assert.ok(await page.locator("#game").isVisible(), "Canvas no visible en producción");
  assert.equal(errors.length, 0, "errores de navegador en producción:\n" + errors.join("\n"));
} finally {
  await browser.close();
}

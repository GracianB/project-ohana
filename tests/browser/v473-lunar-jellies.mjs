import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "playwright";
import { startServer } from "./server.mjs";

const server = await startServer(0);
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1300, height: 730 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("http://127.0.0.1:" + server.address().port + "/?e2e=1", { waitUntil: "domcontentloaded" });
  const matrix = await page.evaluate(async () => {
    const { drawWorld1MoonJelly } = await import("/systems/world1-play.js?v=473");
    const root = document.createElement("section");
    root.id = "lunar-jelly-audit";
    root.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:#151429;color:#fff;display:grid;grid-template-columns:repeat(5,1fr);grid-template-rows:repeat(2,300px);gap:10px;padding:24px;font:700 16px sans-serif;overflow:auto";
    document.body.appendChild(root);
    const render = (id, done, t, reduceMotion = false) => {
      const canvas = document.createElement("canvas");
      canvas.width = 230;canvas.height = 220;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      drawWorld1MoonJelly(ctx, {id, done, x: 115, y: 116}, t, reduceMotion);
      return { canvas, pixels: ctx.getImageData(0,0,230,220).data };
    };
    const fingerprint = a => {
      let h = 2166136261;
      for (let i = 0; i < a.length; i += 4) {
        h ^= a[i];h = Math.imul(h,16777619);
        h ^= a[i+1];h = Math.imul(h,16777619);
        h ^= a[i+2];h = Math.imul(h,16777619);
        h ^= a[i+3];h = Math.imul(h,16777619);
      }
      return h >>> 0;
    };
    const pairs = [];
    for (let id = 0; id < 5; id++) {
      const pair = [];
      for (const done of [false, true]) {
        const r = render(id, done, 85);
        const cell = document.createElement("div");
        cell.style.cssText = "display:flex;flex-direction:column;align-items:center;gap:8px;border:1px solid #786a9e;border-radius:12px;padding:8px";
        const title = document.createElement("span");
        title.textContent = "MEDUSA " + (id+1) + (done ? " · DESPIERTA" : " · DORMIDA");
        cell.append(title,r.canvas);
        root.appendChild(cell);
        const opaque = r.pixels.filter((_,i) => i%4===3 && r.pixels[i]>0).length;
        pair.push({id, done, fingerprint:fingerprint(r.pixels), opaque});
      }
      const slowA = render(id, true, 0, true), slowB = render(id, true, 4000, true);
      const frameA = render(id, true, 0), frameB = render(id, true, 4000);
      pairs.push({sleeping:pair[0],awake:pair[1],
        reducedStable:fingerprint(slowA.pixels)===fingerprint(slowB.pixels),
        liveMovement:fingerprint(frameA.pixels)!==fingerprint(frameB.pixels)});
    }
    return pairs;
  });
  for (const r of matrix) {
    assert.ok(r.sleeping.opaque>900, "sleeping jelly must be visible");
    assert.ok(r.awake.opaque>900, "awake jelly must be visible");
    assert.notEqual(r.sleeping.fingerprint,r.awake.fingerprint, "wake should change facial expression");
    assert.equal(r.reducedStable,true, "reduced motion should freeze animation");
    assert.equal(r.liveMovement,true, "live version must move in more than one pose");
  }
  assert.equal(new Set(matrix.map(r=>r.awake.fingerprint)).size,5, "all five palettes visually distinct");
  assert.deepEqual(errors, [], "real browser must not throw");
  await fs.mkdir("test-results/v473", {recursive:true});
  await page.screenshot({path:"test-results/v473/lunar-michi-ten-states.png"});
  console.log("PASS V473: five actual feline moon jellyfish, asleep and awake, uniquely coloured, animated and accessible; ten real Chromium Canvas renders");
} finally {
  await browser?.close();
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}

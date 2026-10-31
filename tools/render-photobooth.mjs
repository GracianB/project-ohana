// V634 photobooth strips: renders every hero with the REAL OHANA rig
// (characters/draw.js + painted sprites) into an 8-frame horizontal strip:
// idle · blink-idle · run ×2 · jump · attack ×2 · victory.
// Usage: node tools/render-photobooth.mjs   -> assets/photobooth/<id>.webp
import fs from "node:fs/promises";
import { chromium } from "playwright";
import { startServer } from "../tests/browser/server.mjs";

const FRAME_W = 144, FRAME_H = 136, FRAMES = 8;
const server = await startServer(0);
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.route("**/__photobooth.html", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>booth</title>" }));
  await page.goto(`http://127.0.0.1:${server.address().port}/__photobooth.html`);
  const strips = await page.evaluate(async ({ FRAME_W, FRAME_H, FRAMES }) => {
    const { ROSTER } = await import("/characters/roster.js");
    const { drawCharacter } = await import("/characters/draw.js");
    // Wait until the painted sprites have decoded so strips use the real art.
    const cache = globalThis.__OHANA_SPRITES__?.cache;
    const deadline = performance.now() + 15000;
    while (cache && performance.now() < deadline) {
      const images = [...cache.values()].map((v) => v?.img || v).filter((v) => v instanceof HTMLImageElement);
      if (images.length && images.every((img) => img.complete)) break;
      await new Promise((r) => setTimeout(r, 100));
    }
    await new Promise((r) => setTimeout(r, 300));
    const plan = [["idle", 0], ["idle", 46], ["run", 8], ["run", 18], ["jump", 30], ["attack", 40], ["attack", 44], ["victory", 60]];
    const out = {};
    const TMP = 720, BASE = 2;
    for (const definition of ROSTER) {
      const frames = [];
      let minX = TMP, minY = TMP, maxX = 0, maxY = 0;
      plan.forEach(([pose, t], index) => {
        const form = definition.forms?.[1] || definition;
        const p = { ...definition, ...form, id: definition.id, evo: 1, color: form.color, w: form.w, h: form.h, vx: 0, vy: 0, grounded: true, facing: 1, melee: 0, invuln: 0, speed: form.speed, rng: () => 0.5 };
        p._rig = { sway: 0, swayV: 0, bounce: 0, bounceV: 0, blinkAt: index === 1 ? 0 : 999, blinkT: index === 1 ? 4 : 0, idleT: 0, flourishT: -1, flourishN: 0, atkMax: 0, phase: 0, land: 0, wasAir: false, lastT: t };
        if (pose === "run") { p.vx = form.speed || 3; p._rig.phase = t * 0.32; p._rig.sway = -0.6; }
        if (pose === "jump") { p.grounded = false; p.vy = -9; p._rig.bounce = -0.6; }
        if (pose === "attack") { p.melee = index === 5 ? 9 : 4; p._rig.atkMax = 12; }
        if (pose === "victory") { p._poseOverride = "victory"; p._evoT = 0.8; }
        const tmp = document.createElement("canvas");
        tmp.width = TMP; tmp.height = TMP;
        const c = tmp.getContext("2d", { willReadFrequently: true });
        c.translate(TMP / 2, TMP * 0.78 + (pose === "jump" ? -14 * BASE : 0));
        c.scale(BASE, BASE);
        p.x = -(form.w || 26) / 2; p.y = -(form.h || 34);
        drawCharacter(c, p, { x: 0, y: 0 }, t, {});
        const data = c.getImageData(0, 0, TMP, TMP).data;
        for (let y = 0; y < TMP; y += 2) for (let x = 0; x < TMP; x += 2) {
          if (data[(y * TMP + x) * 4 + 3] > 24) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
        }
        frames.push(tmp);
      });
      // One crop for all frames keeps the hero's size and feet steady.
      const floor = TMP * 0.78;
      maxY = Math.max(maxY, floor);
      const cw = maxX - minX + 1, ch = maxY - minY + 1;
      const fit = Math.min((FRAME_W * 0.9) / cw, (FRAME_H * 0.86) / ch);
      const canvas = document.createElement("canvas");
      canvas.width = FRAME_W * FRAMES; canvas.height = FRAME_H;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      frames.forEach((tmp, index) => {
        const dw = cw * fit, dh = ch * fit;
        const dx = index * FRAME_W + (FRAME_W - dw) / 2, dy = FRAME_H * 0.95 - dh;
        const groundY = dy + (floor - minY) * fit;
        ctx.save();
        ctx.beginPath(); ctx.rect(index * FRAME_W, 0, FRAME_W, FRAME_H); ctx.clip();
        ctx.fillStyle = "rgba(0,0,0,.28)";
        ctx.beginPath(); ctx.ellipse(index * FRAME_W + FRAME_W / 2, Math.min(groundY, FRAME_H - 4), Math.min(dw * 0.36, FRAME_W * 0.34), 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.drawImage(tmp, minX, minY, cw, ch, dx, dy, dw, dh);
        ctx.restore();
      });
      out[definition.id] = canvas.toDataURL("image/webp", 0.8);
    }
    return out;
  }, { FRAME_W, FRAME_H, FRAMES });
  await fs.mkdir("assets/photobooth", { recursive: true });
  let total = 0;
  for (const [id, url] of Object.entries(strips)) {
    const bytes = Buffer.from(url.split(",")[1], "base64");
    total += bytes.length;
    await fs.writeFile(`assets/photobooth/${id}.webp`, bytes);
    console.log(id, bytes.length, "bytes");
  }
  console.log("total", total, "bytes for", Object.keys(strips).length, "strips");
} finally {
  await browser.close();
  server.close();
}

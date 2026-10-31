// Lobby UX: invite link (?room=CODE) auto-fills join, share link + copy fallback,
// connection pill, ES/EN toggle, animated hero preview and 390x844 mobile layout.
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { startServer } from "./server.mjs";
import { createRoomService, RoomError } from "../../netlify/lib/room-service.mjs";

class MemoryStore {
  entries = new Map(); counter = 0;
  async getWithMetadata(key) { const v = this.entries.get(key); return v ? { data: structuredClone(v.data), etag: v.etag } : null; }
  async setJSON(key, data, options = {}) {
    const cur = this.entries.get(key);
    if ((options.onlyIfNew && cur) || (options.onlyIfMatch && (!cur || cur.etag !== options.onlyIfMatch))) return { modified: false };
    const etag = `"${++this.counter}"`; this.entries.set(key, { data: structuredClone(data), etag }); return { modified: true, etag };
  }
}
const service = createRoomService(new MemoryStore());
let offline = false;
async function wire(context) {
  await context.route("**/.netlify/functions/game", async (route) => {
    if (offline) return route.abort("internetdisconnected");
    try {
      const b = route.request().postDataJSON(); let data;
      switch (b.action) {
        case "create": data = await service.create(b.mode, b.arenaId); break;
        case "join": data = await service.join(b.roomId, b.identity); break;
        case "choose": data = await service.choose(b.roomId, b.identity, b.characterId); break;
        case "ready": data = await service.ready(b.roomId, b.identity, b.ready); break;
        case "poll": data = await service.poll(b.roomId, b.identity); break;
        case "disconnect": data = await service.disconnect(b.roomId, b.identity); break;
        default: throw new RoomError("UNKNOWN_ACTION", "Acción desconocida.");
      }
      await route.fulfill({ status: 200, headers: { "content-type": "application/json" }, body: JSON.stringify({ data }) });
    } catch (e) {
      await route.fulfill({ status: e.status || 500, headers: { "content-type": "application/json" }, body: JSON.stringify({ error: { code: e.code || "TEST_ERROR", message: e.message } }) });
    }
  });
}
const server = await startServer(0);
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
const shots = process.env.OHANA_SHOTS || "";
try {
  const hostCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const guestCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await wire(hostCtx); await wire(guestCtx);
  const host = await hostCtx.newPage(), guest = await guestCtx.newPage();
  const langCtx = await browser.newContext();
  const langPage = await langCtx.newPage();
  await langPage.goto(origin + "/multiplayer.html?lang=en");
  assert.equal(await langPage.evaluate(() => document.documentElement.lang), "en", "?lang=en selects English");
  assert.equal(await langPage.evaluate(() => localStorage.getItem("ohana-lobby-lang")), "en", "language choice is remembered");
  await langCtx.close();
  const errors = []; for (const p of [host, guest]) p.on("pageerror", (e) => errors.push(e.message));

  await host.goto(origin + "/multiplayer.html");
  if (shots) await host.screenshot({ path: shots + "/entrada-1280-es.png", fullPage: true });
  await host.locator('.mode-card[data-mode="versus"]').click();
  assert.equal(await host.locator("#room-mode").inputValue(), "versus", "Versus card selects the existing room mode control");
  assert.equal(await host.locator("#arena-choice").isVisible(), true, "Versus exposes arena selection");
  if (shots) await host.screenshot({ path: shots + "/entrada-1280-versus.png", fullPage: true });
  await host.locator('.mode-card[data-mode="adventure"]').click();
  assert.equal(await host.locator("#room-mode").inputValue(), "adventure");
  await host.getByRole("button", { name: "Crear sala" }).click();
  await host.locator("#room-code").waitFor();
  const code = (await host.locator("#room-code").innerText()).trim();
  assert.match(code, /^[A-HJ-NP-Z2-9]{6}$/);
  assert.match(host.url(), new RegExp(`[?&]room=${code}`), "lobby URL carries the room code");
  await host.locator("#share-url").waitFor({ state: "visible" });
  const link = await host.locator("#share-url").inputValue();
  assert.ok(link.endsWith(`/multiplayer.html?room=${code}`), "share link: " + link);
  assert.equal((await host.locator("#net-pill").innerText()).trim(), "Conectado");
  await host.getByRole("button", { name: "Seleccionar a Kilo", exact: true }).click();
  await host.waitForFunction(() => document.getElementById("lobby-portrait").dataset.pose, null, { timeout: 4000 });
  const poses = new Set(); for (let i = 0; i < 8; i++) { poses.add(await host.locator("#lobby-portrait").getAttribute("data-pose")); await host.waitForTimeout(450); }
  assert.ok(poses.size >= 2, "animated preview cycles poses: " + [...poses]);
  if (shots) await host.screenshot({ path: shots + "/seleccion-1280-kilo.png", fullPage: true });

  // Guest opens the invite link on a phone-sized screen.
  await guest.goto(origin + "/multiplayer.html");
  if (shots) await guest.screenshot({ path: shots + "/entrada-390-es.png", fullPage: true });
  await guest.goto(link);
  await guest.locator("#invite-banner").waitFor({ state: "visible" });
  assert.equal(await guest.locator("#room-input").inputValue(), code, "invite auto-fills the code");
  const overflow = await guest.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert.ok(overflow <= 1, "no horizontal overflow at 390px (entry): " + overflow);
  if (shots) await guest.screenshot({ path: shots + "/invite-mobile.png", fullPage: true });
  await guest.getByRole("button", { name: "Unirse" }).click();
  await guest.locator("#lobby").waitFor({ state: "visible" });
  const overflowLobby = await guest.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert.ok(overflowLobby <= 1, "no horizontal overflow at 390px (lobby): " + overflowLobby);
  await host.waitForFunction(() => /2\/2/.test(document.getElementById("lobby-status").textContent), null, { timeout: 6000 });

  // English toggle translates static and live lobby text.
  await guest.getByRole("button", { name: "Switch to English" }).click();
  await guest.waitForFunction(() => /Room \d\/2/.test(document.getElementById("lobby-status").textContent), null, { timeout: 4000 });
  assert.equal((await guest.locator("#lobby > h2").innerText()).trim(), "Choose your heroes");
  assert.equal((await guest.locator("#net-pill").innerText()).trim(), "Connected");
  assert.equal(await guest.evaluate(() => document.documentElement.lang), "en");
  assert.ok((await guest.locator("#share-url").inputValue()).includes("lang=en"));
  await guest.getByRole("button", { name: "Seleccionar a Stitcho", exact: true }).click();
  await guest.waitForFunction(() => document.getElementById("lobby-portrait").dataset.pose, null, { timeout: 4000 });
  if (shots) await guest.screenshot({ path: shots + "/seleccion-390-stitcho-en.png", fullPage: true });
  await guest.locator("#confirm-character").click();
  await guest.locator("#change-character").waitFor({ state: "visible", timeout: 4000 });
  await guest.locator("#change-character").click();
  await guest.locator("#confirm-character").waitFor({ state: "visible", timeout: 4000 });
  await guest.getByRole("button", { name: "Cambiar a español" }).click();
  await guest.waitForFunction(() => /Sala \d\/2/.test(document.getElementById("lobby-status").textContent), null, { timeout: 4000 });

  // Connection loss shows a clear status, and recovers on its own.
  offline = true;
  await host.waitForFunction(() => document.getElementById("net-pill").dataset.state === "reconnecting", null, { timeout: 12000 });
  offline = false;
  await host.waitForFunction(() => document.getElementById("net-pill").dataset.state === "connected", null, { timeout: 15000 });

  assert.deepEqual(errors, []);
  console.log("PASS · lobby UX: invite link, share, status pill, ES/EN, animated preview, 390px layout");
} finally {
  await browser.close(); server.close();
}

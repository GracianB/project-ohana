// V634 regression: a second player opening a NEW invite in a tab that already
// played a match must join the new room (not be bounced back into the old one).
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
const joins = [];
async function ctx(options = {}) {
  const context = await browser.newContext(options);
  await wire(context);
  // The engine page is out of scope here: a stub proves where the lobby sent us.
  await context.route(/\/index\.html\?online=1/, (route) => route.fulfill({ status: 200, headers: { "content-type": "text/html" }, body: "<!doctype html><title>engine</title><p id=engine>engine</p>" }));
  return context;
}
async function createRoom(page) {
  await page.goto(`${origin}/multiplayer.html`);
  await page.getByRole("button", { name: "Crear sala" }).click();
  await page.waitForFunction(() => /^[A-Z2-9]{6}$/.test(document.getElementById("room-code")?.textContent.trim() || ""));
  return (await page.locator("#room-code").innerText()).trim();
}
async function pickReady(page, hero) {
  await page.getByRole("button", { name: `Seleccionar a ${hero}`, exact: true }).click();
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: "Listo", exact: true }).click();
}
try {
  const host = await (await ctx()).newPage();
  const guestContext = await ctx({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const guest = await guestContext.newPage();
  const errors = [];
  guest.on("pageerror", (e) => errors.push(e.message));
  guest.on("request", (r) => { if (r.url().includes("functions/game") && r.method() === "POST") { const b = r.postDataJSON(); if (b.action === "join") joins.push({ roomId: b.roomId, hasIdentity: !!b.identity?.playerId }); } });

  // Round 1: a normal match in room A.
  const roomA = await createRoom(host);
  await pickReady(host, "Kilo");
  await guest.goto(`${origin}/multiplayer.html?room=${roomA}`);
  await guest.getByRole("button", { name: "Unirse" }).click();
  await guest.locator("#lobby").waitFor({ state: "visible" });
  await pickReady(guest, "Stitcho");
  await guest.waitForURL(/index\.html\?online=1/, { timeout: 10000 });
  console.log("PASS round 1 reaches the engine in room", roomA);

  // Round 2: someone creates room B and the guest opens the invite in the SAME tab.
  const host2 = await (await ctx()).newPage();
  const roomB = await createRoom(host2);
  joins.length = 0;
  await guest.goto(`${origin}/multiplayer.html?room=${roomB}`);
  await guest.waitForTimeout(1200);
  assert.match(guest.url(), /multiplayer\.html\?room=/, "the new invite must not bounce into the old match");
  assert.equal(await guest.locator("#entry").isVisible(), true);
  assert.equal(await guest.locator("#room-input").inputValue(), roomB);
  assert.equal(joins.some((j) => j.roomId === roomA), false, "the old room must not be silently rejoined");
  await guest.getByRole("button", { name: "Unirse" }).click();
  await guest.locator("#lobby").waitFor({ state: "visible" });
  assert.equal((await guest.locator("#room-code").innerText()).trim(), roomB);
  assert.deepEqual(joins.filter((j) => j.roomId === roomB).map((j) => j.hasIdentity), [false], "a new seat never sends the previous room's credentials");
  await host2.waitForFunction(() => /Conectad|Eligiendo|Elige/.test(document.querySelectorAll("#player-slots > *")[1]?.textContent || ""));
  assert.doesNotMatch(await host2.locator("#player-slots").innerText(), /Esperando conexión/);
  console.log("PASS same-tab invite to a new room joins", roomB, "instead of the old", roomA);

  await pickReady(host2, "Kilo");
  await pickReady(guest, "Dino");
  await guest.waitForURL(/index\.html\?online=1/, { timeout: 10000 });
  console.log("PASS round 2 reaches the engine together");

  // Returning to the lobby page without an invite offers a resume, never a redirect loop.
  await guest.goto(`${origin}/multiplayer.html`);
  await guest.locator("#resume-room").waitFor({ state: "visible" });
  assert.match(guest.url(), /multiplayer\.html$/);
  assert.equal((await guest.locator("#resume-room [data-room]").innerText()).trim(), roomB);
  await guest.getByRole("button", { name: "Crear sala" }).click();
  await guest.waitForFunction((old) => { const c = document.getElementById("room-code")?.textContent.trim() || ""; return /^[A-Z2-9]{6}$/.test(c) && c !== old; }, roomB);
  assert.equal(await guest.locator("#resume-room").isVisible(), false);
  console.log("PASS lobby page offers 'resume' and can start a fresh room");

  // And the resume button really resumes.
  const g3 = await (await ctx()).newPage();
  const h3 = await (await ctx()).newPage();
  const roomC = await createRoom(h3); await pickReady(h3, "Kilo");
  await g3.goto(`${origin}/multiplayer.html?room=${roomC}`); await g3.getByRole("button", { name: "Unirse" }).click();
  await g3.locator("#lobby").waitFor({ state: "visible" }); await pickReady(g3, "Dino");
  await g3.waitForURL(/online=1/);
  await g3.goto(`${origin}/multiplayer.html?room=${roomC}`);
  await g3.locator("#resume-room").waitFor({ state: "visible" });
  await g3.locator("#resume-room").click();
  await g3.waitForURL(/online=1/, { timeout: 10000 });
  console.log("PASS resume button returns to the running match");
  assert.deepEqual(errors, []);
  console.log("PASS v634 rejoin invite regression");
} finally {
  await browser.close();
  server.close();
}

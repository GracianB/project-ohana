import assert from "node:assert/strict";
import { chromium } from "playwright";
import { startServer } from "./server.mjs";
import { createRoomService, RoomError } from "../../netlify/lib/room-service.mjs";

class MemoryStore {
  entries = new Map();
  counter = 0;
  async getWithMetadata(key) { const value = this.entries.get(key); return value ? { data: structuredClone(value.data), etag: value.etag } : null; }
  async setJSON(key, data, options = {}) {
    const current = this.entries.get(key);
    if ((options.onlyIfNew && current) || (options.onlyIfMatch && (!current || current.etag !== options.onlyIfMatch))) return { modified: false };
    const etag = `"${++this.counter}"`;
    this.entries.set(key, { data: structuredClone(data), etag });
    return { modified: true, etag };
  }
}

const server = await startServer(4174);
const browser = await chromium.launch({ headless: true });
const store = new MemoryStore();
const service = createRoomService(store);
let host;
let roomId;

async function installFakeNetlify(context) {
  await context.route("**/.netlify/functions/game", async (route) => {
    try {
      const body = route.request().postDataJSON();
      let data;
      switch (body.action) {
        case "create": data = host = await service.create(); roomId = data.roomId; break;
        case "join": data = await service.join(body.roomId, body.identity); break;
        case "choose": data = await service.choose(body.roomId, body.identity, body.characterId); break;
        case "ready": data = await service.ready(body.roomId, body.identity, body.ready); break;
        case "move": data = await service.move(body.roomId, body.identity, body); break;
        case "signal": data = await service.signal(body.roomId, body.identity, body); break;
        case "poll": data = await service.poll(body.roomId, body.identity); break;
        case "disconnect": data = await service.disconnect(body.roomId, body.identity); break;
        default: throw new RoomError("UNKNOWN_ACTION", "Acción desconocida.");
      }
      await route.fulfill({ status: 200, headers: { "cache-control": "no-store", "content-type": "application/json" }, body: JSON.stringify({ data }) });
    } catch (error) {
      await route.fulfill({ status: error.status || 500, headers: { "cache-control": "no-store", "content-type": "application/json" }, body: JSON.stringify({ error: { code: error.code || "TEST_ERROR", message: error.message } }) });
    }
  });
}

const contexts = [];
try {
  const hostContext = await browser.newContext(); contexts.push(hostContext);
  const guestContext = await browser.newContext(); contexts.push(guestContext);
  await installFakeNetlify(hostContext); await installFakeNetlify(guestContext);
  const hostPage = await hostContext.newPage();
  const guestPage = await guestContext.newPage();
  const errors = [];
  for (const page of [hostPage, guestPage]) page.on("pageerror", (error) => errors.push(error.stack || error.message));

  await hostPage.goto("http://127.0.0.1:4174/multiplayer.html");
  await hostPage.getByRole("button", { name: "Crear sala" }).click();
  await hostPage.locator("#room-code").waitFor();
  roomId = await hostPage.locator("#room-code").innerText();
  await hostPage.getByRole("button", { name: "Seleccionar a Kilo", exact: true }).click();
  await hostPage.getByRole("button", { name: "Confirmar personaje" }).click();

  await guestPage.goto("http://127.0.0.1:4174/multiplayer.html");
  await guestPage.locator("#room-input").fill(roomId);
  await guestPage.getByRole("button", { name: "Unirse" }).click();
  await guestPage.getByRole("button", { name: "Seleccionar a Michi", exact: true }).click();
  await guestPage.getByRole("button", { name: "Confirmar personaje" }).click();

  await hostPage.waitForURL(/index\.html\?online=1/, { timeout: 7000 });
  await guestPage.waitForURL(/index\.html\?online=1/, { timeout: 7000 });

  for (const page of [hostPage, guestPage]) {
    const transferredSession = await page.evaluate(() => JSON.parse(sessionStorage.getItem("ohana-coop-session") || "null"));
    assert.equal(transferredSession?.originalEngine, true, "la sesión multiplayer debe conservar originalEngine al entrar en el motor oficial");
  }

  await hostPage.locator("#game").waitFor({ state: "visible", timeout: 5000 });
  await guestPage.locator("#game").waitFor({ state: "visible", timeout: 5000 });

  for (const [label, page] of [["host", hostPage], ["guest", guestPage]]) {
    await page.waitForFunction(() => document.body.dataset.onlineState === "connected" || document.body.dataset.onlineState === "error", null, { timeout: 7000 });
    const boot = await page.locator("body").evaluate((body) => ({
      mode: body.dataset.gameMode || "",
      state: body.dataset.onlineState || "",
      error: body.dataset.onlineError || "",
    }));
    assert.equal(boot.state, "connected", label + " online boot failed: " + (boot.error || "unknown"));
    assert.equal(boot.mode, "online", label + " must enter online game mode");
  }

  await hostPage.locator("#online-peer-badge").waitFor({ state: "visible", timeout: 3000 });
  await guestPage.locator("#online-peer-badge").waitFor({ state: "visible", timeout: 3000 });
  // V108: both real Chromium instances must exchange SDP through the SAME
  // fake Netlify room, then open direct SCTP pose + reliable action channels.
  for (const [label,page] of [["host",hostPage],["guest",guestPage]]) {
    await page.waitForFunction(()=>document.body.dataset.coopTransport==="direct",null,{timeout:30000});
    const verified=await page.evaluate(async()=>{
      const {onlineCoop}=await import("/systems/online-coop.js");
      return {active:onlineCoop.direct?.active,offer:!!onlineCoop.direct?.pc?.remoteDescription,
        fast:onlineCoop.direct?.poseChannel?.readyState,reliable:onlineCoop.direct?.eventChannel?.readyState};
    });
    assert.equal(verified.active,true,label+": WebRTC fast lane never opened "+JSON.stringify(verified));
    assert.equal(verified.offer,true,label+": WebRTC missing remote description");
    assert.equal(verified.fast,"open",label+": pose channel not open");
    assert.equal(verified.reliable,"open",label+": reliable channel not open");
  }


  // Two separate browser contexts can leave the host tab unfocused in CI.
  // Assert real server-side displacement, not a brittle absolute spawn x.
  await hostPage.bringToFront();
  const initial = await service.poll(roomId, host.identity);
  const initialHost = initial.players.find((player) => player.playerId === host.identity.playerId);
  assert.ok(initialHost && Number.isFinite(initialHost.x), "host missing valid initial position");

  const peerBefore=await guestPage.evaluate(async()=>{
    const {onlineCoop}=await import("/systems/online-coop.js");
    return onlineCoop.remote?.targetX??0;
  });
  await hostPage.keyboard.down("ArrowRight");
  // If the direct lane is real, guest sees a new pose during the next handful
  // of frames, without waiting for the Netlify 340ms/650ms HTTP cycle.
  await guestPage.waitForFunction(async before=>{
    const {onlineCoop}=await import("/systems/online-coop.js");
    return !!onlineCoop.direct?.active && onlineCoop.remote?.targetX>before+5 &&
      performance.now()-onlineCoop.lastDirectPoseAt<1200;
  },peerBefore,{timeout:2500});
  await hostPage.waitForTimeout(1250);
  await hostPage.keyboard.up("ArrowRight");

  let hostState = null;
  for (let attempt = 0; attempt < 12; attempt++) {
    const moved = await service.poll(roomId, host.identity);
    hostState = moved.players.find((player) => player.playerId === host.identity.playerId);
    if (hostState && hostState.x > initialHost.x + 12) break;
    await hostPage.waitForTimeout(250);
  }
  assert.ok(hostState && hostState.x > initialHost.x + 12,
    "host failed actual networked movement: start=" + initialHost.x +
    ", current=" + (hostState?.x ?? "absent"));
  assert.ok(hostState.x <= 2240 && hostState.x >= 0, "host escaped world bounds");

  await hostPage.keyboard.press("h");
  await hostPage.waitForTimeout(300);

  assert.deepEqual(errors, [], "las dos vistas deben renderizar sin errores");
  console.log("PASS · dos contextos reales entran al motor original de OHANA, sincronizan posición y ejecutan combate online.");
} finally {
  for (const context of contexts) await context.close();
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

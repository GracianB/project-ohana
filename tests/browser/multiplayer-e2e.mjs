import assert from "node:assert/strict";
import { chromium, firefox } from "playwright";
import { startServer } from "./server.mjs";
import { createRoomService, RoomError } from "../../netlify/lib/room-service.mjs";
import { createRtcConfigHandler } from "../../netlify/lib/rtc-config-service.mjs";

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

const server = await startServer(0);
const origin=`http://127.0.0.1:${server.address().port}`;
const browserName=process.env.OHANA_TEST_BROWSER||"chromium";
const lateIce=process.env.OHANA_TEST_LATE_ICE==="1";
const browserType=browserName==="firefox"?firefox:chromium;
// Two distinct browser contexts represent two simultaneously active devices,
// not background tabs fighting Chromium's animation throttling policies.
const browser = await browserType.launch({ headless: true, args: browserName==="chromium"?[
  "--disable-background-timer-throttling",
  "--disable-renderer-backgrounding",
  "--disable-backgrounding-occluded-windows"
]:[] });
const store = new MemoryStore();
const service = createRoomService(store);
const rtcStore=new MemoryStore();
const rtcConfigCalls=[];
const testIce={urls:"turns:turn.cloudflare.com:443?transport=tcp",username:"browser-test-user",credential:"browser-test-credential"};
const rtcHandler=createRtcConfigHandler({service,store:rtcStore,
 env:{OHANA_CF_TURN_KEY_ID:"browser-test-key-id",OHANA_CF_TURN_API_TOKEN:"server-test-token-not-for-browser"},
 fetchImpl:async()=>({ok:true,json:async()=>({iceServers:[{...testIce,urls:[testIce.urls]}]})})});
let host;
let roomId;
let candidateSignals=0;
const candidateSessions=new Set();

async function installLateIce(context){
  if(!lateIce)return;
  await context.addInitScript(()=>{
    const Native=window.RTCPeerConnection;
    // Real ICE/SCTP, with candidate signaling delayed past the SDP wait. Hide
    // gathered candidates from SDP so this test cannot pass without trickle ICE.
    window.RTCPeerConnection=class extends Native {
      lateReady=false;timers=new Set();
      get iceGatheringState(){return this.lateReady?super.iceGatheringState:"gathering";}
      get localDescription(){
        const d=super.localDescription;
        return d?new RTCSessionDescription({type:d.type,sdp:d.sdp.replace(/^a=(?:candidate:.*|end-of-candidates)\r?\n/gm,"")}):null;
      }
      set onicecandidate(fn){
        super.onicecandidate=event=>{
          if(!event.candidate)return;
          const timer=setTimeout(()=>{this.timers.delete(timer);this.lateReady=true;fn?.(event);},2500);
          this.timers.add(timer);
        };
      }
      close(){for(const timer of this.timers)clearTimeout(timer);this.timers.clear();super.close();}
    };
  });
}

async function installFakeNetlify(context) {
  // Exercise the real authenticated HTTP handler, not an UNKNOWN_ACTION fallback.
  // This verifies credential delivery to RTC; it does not claim a live TURN relay.
  await context.route("**/.netlify/functions/rtc-config",async route=>{
    const body=route.request().postDataJSON();rtcConfigCalls.push(body.identity?.playerId);
    // Add asynchronous response delay while leaving headroom below the 1.8s
    // production deadline on loaded CI runners. The unit test forces the exact
    // offer-before-config ordering without depending on wall-clock scheduling.
    if(body.identity?.playerId!==host?.identity?.playerId)await new Promise(resolve=>setTimeout(resolve,350));
    const response=await rtcHandler(new Request(route.request().url(),{method:"POST",body:JSON.stringify(body)}));
    await route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:await response.text()});
  });
  await context.route("**/.netlify/functions/game", async (route) => {
    try {
      const body = route.request().postDataJSON();
      if(body.action==="signal"&&body.payload?.kind==="candidates"){
        candidateSignals++;candidateSessions.add(body.payload.sid);
      }
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
  await installLateIce(hostContext);await installLateIce(guestContext);
  await installFakeNetlify(hostContext); await installFakeNetlify(guestContext);
  const hostPage = await hostContext.newPage();
  const guestPage = await guestContext.newPage();
  const errors = [];
  for (const page of [hostPage, guestPage]) page.on("pageerror", (error) => errors.push(error.stack || error.message));

  await hostPage.goto(origin+"/multiplayer.html");
  console.log(`multiplayer ${browserName}: lobby loaded${lateIce?" / late ICE":""}`);
  await hostPage.getByRole("button", { name: "Crear sala" }).click();
  await hostPage.locator("#room-code").waitFor();
  roomId = await hostPage.locator("#room-code").innerText();
  await hostPage.getByRole("button", { name: "Seleccionar a Kilo", exact: true }).click();
  await hostPage.getByRole("button", { name: "Confirmar personaje" }).click();

  await guestPage.goto(origin+"/multiplayer.html");
  await guestPage.locator("#room-input").fill(roomId);
  await guestPage.getByRole("button", { name: "Unirse" }).click();
  await guestPage.getByRole("button", { name: "Seleccionar a Michi", exact: true }).click();
  await guestPage.getByRole("button", { name: "Confirmar personaje" }).click();

  await hostPage.waitForURL(/index\.html\?online=1/, { waitUntil:"domcontentloaded",timeout:15000 });
  await guestPage.waitForURL(/index\.html\?online=1/, { waitUntil:"domcontentloaded",timeout:15000 });
  console.log("multiplayer: both players entered the original engine");

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
        credentialDelivered:onlineCoop.direct?.pc?.getConfiguration().iceServers.some(s=>s.username==="browser-test-user"&&s.credential==="browser-test-credential"),
        fast:onlineCoop.direct?.poseChannel?.readyState,reliable:onlineCoop.direct?.eventChannel?.readyState};
    });
    assert.equal(verified.active,true,label+": WebRTC fast lane never opened "+JSON.stringify(verified));
    assert.equal(verified.credentialDelivered,true,label+": authenticated TURN config never reached RTC");
    assert.equal(verified.offer,true,label+": WebRTC missing remote description");
    assert.equal(verified.fast,"open",label+": pose channel not open");
    assert.equal(verified.reliable,"open",label+": reliable channel not open");
  }
  console.log("multiplayer: both real WebRTC channels opened");


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

  // V109: simulate a real direct link loss while Netlify stays connected.
  // A fresh offer must rebuild BOTH data channels and the guest's answerer.
  const firstSession=await hostPage.evaluate(async()=>{
    const {onlineCoop}=await import("/systems/online-coop.js");
    const id=onlineCoop.direct?.sessionId;
    if(!onlineCoop.direct?.active||!id)throw Error("Cannot exercise RTC recovery without active direct link");
    onlineCoop.direct.close();
    onlineCoop.directRetryAt=0;
    return id;
  });
  // Firefox may run waitForFunction in a separate Playwright utility world.
  // Sample the actual game module directly and require a newly negotiated ID.
  let recoveredSession=null;
  for(let attempt=0;attempt<150;attempt++){
    recoveredSession=await hostPage.evaluate(async previous=>{
      const {onlineCoop}=await import("/systems/online-coop.js");
      const direct=onlineCoop.direct;
      return direct?.active&&direct.sessionId&&direct.sessionId!==previous
        ? direct.sessionId : null;
    },firstSession);
    if(recoveredSession)break;
    await hostPage.waitForTimeout(200);
  }
  assert.ok(recoveredSession,"host did not establish a fresh RTC session after link loss");
  await guestPage.waitForFunction(async sessionId=>{
    const {onlineCoop}=await import("/systems/online-coop.js");
    return onlineCoop.direct?.active&&onlineCoop.direct.sessionId===sessionId;
  },recoveredSession,{timeout:30000});
  assert.notEqual(recoveredSession,firstSession,"negotiation reused the damaged RTC session");
  // The HTTP transport badge changes only when a real fresh pose arrives.
  // Verify the new channels DELIVER data, not merely show readyState=open.
  // Observe the full state AT THE SAME MOMENT in each browser. Checking
  // first tab, switching focus, then sampling again creates false failures.
  const recovered=await Promise.all([hostPage,guestPage].map(async page=>{
    // Evaluate INSIDE the game's main world. waitForFunction can execute in a
    // Playwright utility world whose modules/globals do not represent the
    // actual on-screen game.
    let proof=null;
    for(let i=0;i<75;i++){
      proof=await page.evaluate(async expected=>{
        const {onlineCoop}=await import("/systems/online-coop.js");
        const direct=onlineCoop.direct;
        if(document.body.dataset.coopTransport!=="direct"||!direct?.active||
          direct.sessionId!==expected||direct.receivedSeq<1||
          onlineCoop.lastDirectPoseAt<=0||performance.now()-onlineCoop.lastDirectPoseAt>=1500)return null;
        return {mode:document.body.dataset.coopTransport,active:direct.active,
          session:direct.sessionId,receivedSeq:direct.receivedSeq,
          channels:[direct.poseChannel?.readyState,direct.eventChannel?.readyState]};
      },recoveredSession);
      if(proof)break;
      await page.waitForTimeout(200);
    }
    assert.ok(proof,"no live direct packet arrived in recovered browser");
    return proof;
  }));
  for(const state of recovered){
    assert.equal(state.mode,"direct","a browser never confirmed live RTC after recovery");
    assert.equal(state.active,true,"connection did not heal");
    assert.equal(state.session,recoveredSession,"unexpected RTC session after recovery");
    assert.ok(state.receivedSeq>0,"new negotiated channel delivered no poses");
    assert.deepEqual(state.channels,["open","open"],"both SCTP channels must recover");
  }

  // ICE can learn the other endpoint as peer-reflexive: an open bidirectional
  // channel need not wait for BOTH endpoints' delayed candidate batches.
  if(lateIce){
    assert.ok(candidateSessions.has(firstSession),"initial connection must use the late candidate signal path");
    assert.ok(candidateSessions.has(recoveredSession),"recovery must use the late candidate signal path");
  }

  assert.deepEqual(errors, [], "las dos vistas deben renderizar sin errores");
  console.log(`PASS · ${browserName}: dos jugadores, movimiento WebRTC y recuperación${lateIce?" con ICE tardío ("+candidateSignals+" señales)":""}.`);
} catch(error) {
  console.error("Multiplayer failed:",error);
  throw error;
} finally {
  for (const context of contexts) await context.close();
  await browser.close();
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
}

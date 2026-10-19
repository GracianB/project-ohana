import assert from "node:assert/strict";
import {ROSTER} from "../../characters/roster.js";
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
const hostCharacter=process.env.OHANA_TEST_HOST||"kilo";
const guestCharacter=process.env.OHANA_TEST_GUEST||"cat";
const selection=id=>{const hero=ROSTER.find(r=>r.id===id);if(!hero)throw Error("Unknown test hero "+id);return "Seleccionar a "+hero.name;};
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
  for (const page of [hostPage, guestPage]) page.on("pageerror", (error) => {errors.push(error.stack || error.message);console.error("BROWSER RUNTIME",error.stack||error.message);});

  await hostPage.goto(origin+"/multiplayer.html");
  console.log(`multiplayer ${browserName}: lobby loaded${lateIce?" / late ICE":""}`);
  await hostPage.getByRole("button", { name: "Crear sala" }).click();
  await hostPage.locator("#room-code").waitFor();
  roomId = await hostPage.locator("#room-code").innerText();
  await hostPage.getByRole("button", { name: selection(hostCharacter), exact: true }).click();
  await hostPage.getByRole("button", { name: "Confirmar personaje" }).click();

  await guestPage.goto(origin+"/multiplayer.html");
  await guestPage.locator("#room-input").fill(roomId);
  await guestPage.getByRole("button", { name: "Unirse" }).click();
  await guestPage.getByRole("button", { name: selection(guestCharacter), exact: true }).click();
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
  // Keep this transport/recovery stage independent of ambient enemy pressure.
  // Later fixtures still verify real replicated enemies and exact guest damage.
  for(const page of [hostPage,guestPage])await page.evaluate(async()=>{const {onlineCoop}=await import("/systems/online-coop.js");onlineCoop._combatGame.player.invuln=60000;});
  // V108: both real Chromium instances must exchange SDP through the SAME
  // fake Netlify room, then open direct SCTP pose + reliable action channels.
  for (const [label,page] of [["host",hostPage],["guest",guestPage]]) {
    await page.waitForFunction(()=>document.body.dataset.coopTransport==="direct",null,{timeout:30000}).catch(async error=>{console.error("RTC BOOT DIAGNOSTICS",label,JSON.stringify({errors,state:await page.evaluate(async()=>{const {onlineCoop:o}=await import("/systems/online-coop.js");return {hidden:document.hidden,body:document.body.className,phase:o.snapshot?.phase,enabled:o.enabled,active:o.direct?.active,attempted:o.directAttempted,ice:o.direct?.iceState,pc:o.direct?.pc?.connectionState,peer:!!o.remote?.playerId};})}));throw error;});
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

  console.log("multiplayer: authoritative movement and direct poses verified");
  // Recovery must begin from a quiet, already-verified transport state.
  // Injecting an unrelated H attack immediately before closing the channel
  // schedules heavy hero-specific combat/FX on Chromium and can starve the
  // next Playwright RPC. Actual guest hit and both U casts are asserted below.

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
  if(!recoveredSession){
    const clients=await Promise.all([hostPage,guestPage].map(page=>page.evaluate(async()=>{
      const {onlineCoop:o}=await import("/systems/online-coop.js");
      return {hidden:document.hidden,body:document.body.className,hp:o._combatGame?.player?.health,dead:o._combatGame?.player?.dead,state:o.snapshot?.phase,enabled:o.enabled,error:o.error,polling:o.polling,lastTick:o.lastGameTick,lastPoll:o.lastPoll,lastSnapshot:o.lastSnapshotAt,retryAfter:o.retryAfter,attempted:o.directAttempted,peer:!!o.remote?.playerId,now:performance.now()};
    })));
    const stored=[...store.entries.values()].map(e=>({phase:e.data.phase,players:e.data.players?.map(p=>({slot:p.slot,connected:p.connected,lastSeenAt:p.lastSeenAt}))}));
    console.error("RTC RECOVERY DIAGNOSTICS",JSON.stringify({errors,clients,stored,serverNow:Date.now()}));
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

  console.log("multiplayer: recovery negotiated and fresh channels delivered live poses");
  // V300: real channel deliveries must reconcile dynamic enemies and render native attacks.
  const mirroredId=await hostPage.evaluate(async()=>{
    const {onlineCoop}=await import('/systems/online-coop.js');
    const {makeFoe}=await import('/engine/foes.js');
    const game=onlineCoop._combatGame;
    const foe=makeFoe(1700,300,'phosquito',game.roomId,991,{rng:()=>.5});
    foe.spawnIndex=991;foe.hp=foe.max=500;game.enemies.push(foe);
    const {captureCombatFrame}=await import('/systems/coop-combat-mirror.js');
    const frame=captureCombatFrame(game,++onlineCoop.combatSequence,onlineCoop.combatEpoch);
    onlineCoop.direct.sendLatest('combat',frame);return foe._coopSyncId;
  });
  let mirrored=false;
  for(let i=0;i<50;i++){
    mirrored=await guestPage.evaluate(async id=>{
      const {onlineCoop}=await import('/systems/online-coop.js');
      return onlineCoop._combatGame.enemies.some(e=>e._coopSyncId===id&&e.kind==='phosquito');
    },mirroredId);
    if(mirrored)break;await guestPage.waitForTimeout(100);
  }
  assert.ok(mirrored,'guest never received the dynamically spawned host enemy');
  await hostPage.evaluate(async id=>{
    const {onlineCoop}=await import('/systems/online-coop.js');const game=onlineCoop._combatGame;
    game.enemies=game.enemies.filter(e=>e._coopSyncId!==id);
    const {captureCombatFrame}=await import('/systems/coop-combat-mirror.js');
    onlineCoop.direct.sendLatest('combat',captureCombatFrame(game,++onlineCoop.combatSequence,onlineCoop.combatEpoch));
    onlineCoop.lastEffectsSentAt=performance.now()+600;
    onlineCoop.direct.sendLatest('effects',{protocol:2,scope:onlineCoop.combatEpoch,frameNo:++onlineCoop.effectSequence,roomId:game.roomId,
      projectiles:[{x:500,y:300,w:12,h:12,vx:0,vy:0,life:100,max:100,shape:'orb',color:'#ff8de1'}],slashes:[],bolts:[]});
  },mirroredId);
  let reconciled=false;
  for(let i=0;i<50;i++){
    reconciled=await guestPage.evaluate(async id=>{
      const {onlineCoop}=await import('/systems/online-coop.js');const game=onlineCoop._combatGame;
      return !game.enemies.some(e=>e._coopSyncId===id)&&game.coopPeerEffects?.projectiles.some(p=>p.color==='#ff8de1');
    },mirroredId);
    if(reconciled)break;await guestPage.waitForTimeout(50);
  }
  assert.ok(reconciled,'enemy removal and actual native peer projectile were not delivered');
  // Isolate the guest-impact target before any persistent U fields are launched.
  {
    const id=await hostPage.evaluate(async()=>{const {onlineCoop}=await import('/systems/online-coop.js');const {makeFoe}=await import('/engine/foes.js');const {captureCombatFrame}=await import('/systems/coop-combat-mirror.js');const g=onlineCoop._combatGame,e=makeFoe(1700,300,'phosquito',g.roomId,992,{rng:()=>.5});e.spawnIndex=992;e.hp=e.max=500;e.stun=300;g.enemies.push(e);onlineCoop.direct.sendLatest('combat',captureCombatFrame(g,++onlineCoop.combatSequence,onlineCoop.combatEpoch));return e._coopSyncId;});
    // Avoid overlapping async-import rAF callbacks in background CI pages.
    // The time limit is still 3000 ms and only the host-authoritative enemy counts.
    const enemyDeadline=Date.now()+3000;let enemyMirrored=false;
    do{
      enemyMirrored=await guestPage.evaluate(async enemyId=>{
        const {onlineCoop}=await import('/systems/online-coop.js');
        return onlineCoop._combatGame.enemies.some(e=>e._coopSyncId===enemyId);
      },id);
      if(enemyMirrored)break;
      if(Date.now()<enemyDeadline)await guestPage.waitForTimeout(50);
    }while(Date.now()<enemyDeadline);
    assert.ok(enemyMirrored,'authoritative enemy not mirrored on guest within 3000ms');
    await guestPage.evaluate(async id=>{const {onlineCoop}=await import('/systems/online-coop.js');const {hitEnemy}=await import('/systems/abilities.js');const g=onlineCoop._combatGame,e=g.enemies.find(e=>e._coopSyncId===id);if(!hitEnemy(g,e,12,{hitstop:0,shake:0}))throw Error('Guest impact failed');},id);
    const impactDeadline=Date.now()+3000;let hitAcknowledged=false;
    do{
      hitAcknowledged=await hostPage.evaluate(async enemyId=>{
        const {onlineCoop}=await import('/systems/online-coop.js');
        return onlineCoop._combatGame.enemies.find(e=>e._coopSyncId===enemyId)?.hp===488;
      },id);
      if(hitAcknowledged)break;
      if(Date.now()<impactDeadline)await hostPage.waitForTimeout(50);
    }while(Date.now()<impactDeadline);
    if(!hitAcknowledged){
      const check=async page=>page.evaluate(async enemyId=>{
        const {onlineCoop:o}=await import('/systems/online-coop.js'),g=o._combatGame;
        const foe=g.enemies.find(e=>e._coopSyncId===enemyId);
        return {room:g.roomId,remoteWorld:o.remoteWorld,remoteId:o.remote?.characterId||null,
          foeHp:foe?.hp??null,foeVisit:foe?._coopVisit??null,
          directActive:o.direct?.active,eventChannel:o.direct?.eventChannel?.readyState,
          eventBuffered:o.direct?.eventChannel?.bufferedAmount,
          seenHits:o.seenHitEvents?.size??null,eventsReceived:o.lastDirectPoseAt||0};
      },id);
      const states=await Promise.allSettled([check(hostPage),check(guestPage)]);
      console.error('OHANA GUEST HIT DIAGNOSTICS',JSON.stringify({
        host:states[0].status==='fulfilled'?states[0].value:String(states[0].reason),
        guest:states[1].status==='fulfilled'?states[1].value:String(states[1].reason)}));
      throw new Error('guest 12-point hit not observed once on host within 3000ms');
    }
    await hostPage.waitForTimeout(250);
    assert.equal(await hostPage.evaluate(async id=>{const {onlineCoop}=await import('/systems/online-coop.js');const g=onlineCoop._combatGame,e=g.enemies.find(e=>e._coopSyncId===id),hp=e?.hp;g.enemies=g.enemies.filter(e=>e._coopSyncId!==id);return hp;},id),488,'guest damage must be applied once on the host');
  }
  console.log("multiplayer: enemy replication and authoritative guest impact verified");
  // V301: the teammate receives Kilo's real in-world U, without a fullscreen overlay.
  const hostU=await hostPage.evaluate(async()=>{
    const {onlineCoop}=await import('/systems/online-coop.js');
    const {useAbility,supremeOf}=await import('/systems/abilities.js');const game=onlineCoop._combatGame;
    game.player.cds[supremeOf(game.player.id).id]=0;if(!useAbility(game,3))throw Error("Actual U cast failed");onlineCoop.lastEffectsSentAt=0;onlineCoop.sendPeerEffects(game,true);
    if(document.querySelector('#supreme-cinema.show'))throw Error('U opened fullscreen cinema');
    const key=game._familyDuet?'familyDuet':game.player.id==='cat'?'michiDuet':game.player.id+'Duet';const state=game['_'+key];
    return {hero:game.player.id,key,partner:game.player.uPartner,originX:state?.originX};
  });
  let duetDelivered=false;
  for(let i=0;i<30;i++){
    duetDelivered=await guestPage.evaluate(async expected=>{
      const {onlineCoop}=await import('/systems/online-coop.js');const key=expected.key;const s=onlineCoop._combatGame.coopPeerEffects?.[key];const {familyDuetDefinition}=await import('/systems/family-duets.js');const {DEFAULT_U_PARTNERS}=await import('/systems/u-partners.js');const ally=key==='familyDuet'?familyDuetDefinition(s)?.ally:DEFAULT_U_PARTNERS[expected.hero];
      return !!s&&s.age>=0&&s.age<120&&(key!=='familyDuet'||s.hero===expected.hero)&&ally===expected.partner&&s.surprise===true&&s.originX===expected.originX&&onlineCoop.remote?.characterId===expected.hero;
    },hostU);
    if(duetDelivered)break;await guestPage.waitForTimeout(50);
  }
  assert.ok(duetDelivered,'Kilo duet never arrived over the live WebRTC channel');
  // Verify a real guest U travelling back to the host too.
  const guestInitialSend=await guestPage.evaluate(async()=>{
    const {onlineCoop}=await import('/systems/online-coop.js');const {useAbility,supremeOf}=await import('/systems/abilities.js');
    const g=onlineCoop._combatGame;g.player.cds[supremeOf(g.player.id).id]=0;
    if(!useAbility(g,3))throw Error('Guest U failed');
    const key=g._familyDuet?'familyDuet':g.player.id==='cat'?'michiDuet':g.player.id+'Duet';
    return {hero:g.player.id,key,partner:g.player.uPartner,originX:g['_'+key]?.originX,sent:onlineCoop.sendPeerEffects(g,true),duet:g._familyDuet?.hero||null,
      room:g.roomId,remoteWorld:onlineCoop.remoteWorld,active:onlineCoop.direct?.active,
      ally:g._familyDuet?.ally||null,duetAge:g._familyDuet?.age??null};
  });
  // Capture exact state on failure; timing limits remain strict.
  try{
    // E2E must sample the real game state, not launch overlapping async
    // import promises on requestAnimationFrame (which can be throttled in CI).
    // This is the same explicit polling used for host -> guest, with the
    // original 3-second delivery deadline preserved.
    const deadline=Date.now()+3000;
    let guestDuetDelivered=false;
    do {
      guestDuetDelivered=await hostPage.evaluate(async expected=>{
        const {onlineCoop}=await import('/systems/online-coop.js');
        const key=expected.key;
        const s=onlineCoop._combatGame.coopPeerEffects?.[key];const {familyDuetDefinition}=await import('/systems/family-duets.js');const {DEFAULT_U_PARTNERS}=await import('/systems/u-partners.js');const ally=key==='familyDuet'?familyDuetDefinition(s)?.ally:DEFAULT_U_PARTNERS[expected.hero];
        return !!s&&s.age>=0&&s.age<120&&(key!=='familyDuet'||s.hero===expected.hero)&&ally===expected.partner&&s.surprise===true&&s.originX===expected.originX&&onlineCoop.remote?.characterId===expected.hero;
      },guestInitialSend);
      if(guestDuetDelivered)break;
      if(Date.now()<deadline)await hostPage.waitForTimeout(50);
    }while(Date.now()<deadline);
    if(!guestDuetDelivered)throw new Error('Guest U echo not observed on host within 3000ms');
  }catch(error){
    const inspect=async page=>page.evaluate(async()=>{
      const {onlineCoop:o}=await import('/systems/online-coop.js'),g=o._combatGame,fx=g.coopPeerEffects;
      return {room:g.roomId,remoteWorld:o.remoteWorld,remoteId:o.remote?.characterId||null,
        directActive:o.direct?.active,poseChannel:o.direct?.poseChannel?.readyState,
        eventChannel:o.direct?.eventChannel?.readyState,
        poseBuffered:o.direct?.poseChannel?.bufferedAmount,
        eventBuffered:o.direct?.eventChannel?.bufferedAmount,
        lastFxAgeMs:Math.round(performance.now()-(o.lastPeerEffectsAt||0)),
        fxScope:fx?.scope||null,fxFrame:fx?.frameNo||null,fxHero:fx?.familyDuet?.hero||null,
        fxAge:fx?.familyDuet?.age??null,localDuet:g._familyDuet?.hero||null,
        localDuetAge:g._familyDuet?.age??null,sentSeq:o.effectSequence,
        reliableAccepted:o._reliableDuetSource===g._familyDuet,
        reliableLink:o._reliableDuetLink===o.direct};
    });
    const details=await Promise.allSettled([inspect(hostPage),inspect(guestPage)]);
    console.error('OHANA U GUEST TO HOST DIAGNOSTICS',JSON.stringify({
      guestInitialSend,host:details[0].status==='fulfilled'?details[0].value:String(details[0].reason),
      guest:details[1].status==='fulfilled'?details[1].value:String(details[1].reason)}));
    throw error;
  }
  console.log("multiplayer: bidirectional U echoes verified");
  // V304: three real Michi casts preserve the same visual effects on the peer.
  if(hostCharacter==='cat'){
    // Arm the guest before casting: normal peer FX snapshots expire after
    // 750 ms and may disappear before a post-cast Playwright wait starts.
    // Observe actual deserialized game state, preserving the 3-second budget.
    await guestPage.evaluate(async()=>{
      const {onlineCoop}=await import('/systems/online-coop.js');
      const proof={};
      const original=onlineCoop.receiveDirectEvent;
      window.__michiFxProof=proof;
      window.__michiFxRestore=()=>{onlineCoop.receiveDirectEvent=original;};
      onlineCoop.receiveDirectEvent=function(game,event){
        const outcome=original.call(this,game,event);
        if(event.kind==='effects'){
          const fx=game.coopPeerEffects?.michiFx||[];
          for(const item of fx){
            if(["yarn","purr","wisp"].includes(item.kind)&&!proof[item.kind])
              proof[item.kind]=structuredClone(item);
          }
        }
        return outcome;
      };
    });
    await hostPage.evaluate(async()=>{
      const {onlineCoop}=await import('/systems/online-coop.js');
      const {useAbility,updateAbilityFx}=await import('/systems/abilities.js');
      const {applyForm}=await import('/characters/roster.js');
      const g=onlineCoop._combatGame;
      // These real J/K/L multiplayer visuals require form 3 (index 2).
      // Earlier V304 predated progression gates and tried locked abilities
      // with Michito. Keep gameplay gating, evolve only this test fixture.
      g.player.evo=Math.max(2,g.player.evo|0);applyForm(g.player,{silent:true});
      for(const id of ['yarn','purr','ninetails'])g.player.cds[id]=0;
      for(const index of [0,1,2])if(!useAbility(g,index))
        throw Error('Michi cast failed slot '+index+' evo '+g.player.evo);
      updateAbilityFx(g);
      const {capturePeerEffects}=await import('/systems/coop-peer-effects.js');
      const sample=capturePeerEffects(g,onlineCoop.effectSequence+1,onlineCoop.combatEpoch);
      if(!['yarn','purr','wisp'].every(kind=>sample.michiFx.some(f=>f.kind===kind)))
        throw Error('Michi source J/K/L FX incomplete '+JSON.stringify(sample.michiFx));
      onlineCoop.lastEffectsSentAt=0;
      let accepted=onlineCoop.sendPeerEffects(g,true);
       // Retain the original real J/K/L casts. If SCTP is backpressured after
       // reconnection, wait for the game's bounded reliable retry, not a fake
       // peer effect or a longer expiration.
       for(let attempt=0;!accepted&&attempt<20;attempt++){
         await new Promise(resolve=>setTimeout(resolve,100));
         accepted=onlineCoop.sendPeerEffects(g,false);
       }
       if(!accepted)throw Error('Michi native reliable WebRTC FX stayed congested: '+JSON.stringify({
         direct:onlineCoop.direct?.active,room:onlineCoop.remoteWorld,
         eventBuffered:onlineCoop.direct?.eventChannel?.bufferedAmount,
         poseBuffered:onlineCoop.direct?.poseChannel?.bufferedAmount
       }));
    });
    try {
      await guestPage.waitForFunction(async()=>{
        const {onlineCoop}=await import('/systems/online-coop.js');
        const keys=['yarn','purr','wisp'];
        return keys.every(kind=>!!window.__michiFxProof?.[kind])||
          (onlineCoop.visualReceipts||[]).some(r=>r.hero==='cat'&&keys.every(kind=>r.effects.some(e=>e.kind===kind)));
      },null,{timeout:3000,polling:50});
      const captured=await guestPage.evaluate(async()=>{
        const keys=['yarn','purr','wisp'],proof=window.__michiFxProof||{};
        if(keys.every(kind=>!!proof[kind]))return proof;
        const {onlineCoop}=await import('/systems/online-coop.js');
        const receipt=(onlineCoop.visualReceipts||[]).findLast(r=>r.hero==='cat'&&
          keys.every(kind=>r.effects.some(e=>e.kind===kind)));
        return Object.fromEntries((receipt?.effects||[]).map(e=>[e.kind,e]));
      });
      assert.ok(['yarn','purr','wisp'].every(kind=>!!captured[kind]),
        'real guest deserialization missed one Michi J/K/L effect');
      assert.equal(Object.values(captured).every(f=>f.dmg===undefined&&f.target===undefined&&f.hitA===undefined),true,
        'Michi peer echoes must remain cosmetic');
    } finally {
      await guestPage.evaluate(()=>{window.__michiFxRestore?.();delete window.__michiFxRestore;delete window.__michiFxProof;});
    }
  }
  // V303: actual J/K/L casts, native FX and a direct delivery to the other player.
  if(hostCharacter==='chispin'){
    // Observe the real deserialized FX before casting. J/K are short lived;
    // waiting until after the host RPC can miss a valid WebRTC delivery.
    await guestPage.evaluate(async()=>{
      const {onlineCoop}=await import('/systems/online-coop.js');
      const proof={};
      const original=onlineCoop.receiveDirectEvent;
      window.__chispinFxProof=proof;
      window.__chispinFxRestore=()=>{onlineCoop.receiveDirectEvent=original;};
      onlineCoop.receiveDirectEvent=function(game,event){
        const outcome=original.call(this,game,event);
        if(event.kind==='effects'){
          const fx=game.coopPeerEffects?.chispinFx||[];
          for(const item of fx){
            if(["chain","trail","storm"].includes(item.kind)&&!proof[item.kind])
              proof[item.kind]=structuredClone(item);
          }
        }
        return outcome;
      };
    });
    await hostPage.evaluate(async()=>{
      const {onlineCoop}=await import('/systems/online-coop.js');
      const {useAbility,updateAbilityFx}=await import('/systems/abilities.js');
      const {applyForm}=await import('/characters/roster.js');
      const game=onlineCoop._combatGame;
      // Storm is the form-3 L slot; do not silently bypass the gate.
      game.player.evo=Math.max(2,game.player.evo|0);
      applyForm(game.player,{silent:true});
      for(const id of ['chain','blink','storm'])game.player.cds[id]=0;
      for(const index of [0,1,2])if(!useAbility(game,index))throw Error('Chispin cast failed slot '+index+' evo '+game.player.evo);
      updateAbilityFx(game);
      const {capturePeerEffects}=await import('/systems/coop-peer-effects.js');
      const sample=capturePeerEffects(game,onlineCoop.effectSequence+1,onlineCoop.combatEpoch);
      if(!['chain','trail','storm'].every(kind=>sample.chispinFx.some(f=>f.kind===kind)))
        throw Error('Chispin source J/K/L FX incomplete '+JSON.stringify(sample.chispinFx));
      onlineCoop.lastEffectsSentAt=0;
      let accepted=onlineCoop.sendPeerEffects(game,true);
       for(let attempt=0;!accepted&&attempt<20;attempt++){
         await new Promise(resolve=>setTimeout(resolve,100));
         accepted=onlineCoop.sendPeerEffects(game,false);
       }
       if(!accepted)throw Error('Chispin native reliable WebRTC FX stayed congested: '+JSON.stringify({
         direct:onlineCoop.direct?.active,room:onlineCoop.remoteWorld,
         eventBuffered:onlineCoop.direct?.eventChannel?.bufferedAmount,
         poseBuffered:onlineCoop.direct?.poseChannel?.bufferedAmount
       }));
    });
    // Preserve 3-second deadline and original purely cosmetic assertions.
    try {
      await guestPage.waitForFunction(async()=>{
        const {onlineCoop}=await import('/systems/online-coop.js');
        const keys=['chain','trail','storm'];
        return keys.every(kind=>!!window.__chispinFxProof?.[kind])||
          (onlineCoop.visualReceipts||[]).some(r=>r.hero==='chispin'&&keys.every(kind=>r.effects.some(e=>e.kind===kind)));
      },null,{timeout:3000,polling:50});
      const captured=await guestPage.evaluate(async()=>{
        const keys=['chain','trail','storm'],proof=window.__chispinFxProof||{};
        if(keys.every(kind=>!!proof[kind]))return proof;
        const {onlineCoop}=await import('/systems/online-coop.js');
        const receipt=(onlineCoop.visualReceipts||[]).findLast(r=>r.hero==='chispin'&&
          keys.every(kind=>r.effects.some(e=>e.kind===kind)));
        return Object.fromEntries((receipt?.effects||[]).map(e=>[e.kind,e]));
      });
      assert.ok(['chain','trail','storm'].every(kind=>!!captured[kind]),
        'native Chispin J/K/L effects were not all deserialized by guest');
      assert.equal(Object.values(captured).every(f=>f.dmg===undefined&&f.hit===undefined&&f.target===undefined),true,
        'native electrical echoes must never carry damaging state');
    } finally {
      await guestPage.evaluate(()=>{window.__chispinFxRestore?.();delete window.__chispinFxRestore;delete window.__chispinFxProof;});
    }
  }
  console.log("multiplayer: character-specific J/K/L effects verified");
  // Stitcho's storm is verified by the dedicated Stitcho Chromium/Firefox
  // scenarios. Injecting synthetic Stitcho effects into every other hero's
  // six-hero WebRTC run was redundant and could stall overloaded CI browsers.
  // Keep the original 12-second delivery budget, not 120 unbounded RPC calls.
  if(hostCharacter==='stitcho'){
  const sendStorm=()=>hostPage.evaluate(async()=>{
    const {onlineCoop}=await import('/systems/online-coop.js');
    const {capturePeerEffects}=await import('/systems/coop-peer-effects.js');
    if(!onlineCoop.direct?.active)return false;
    const g=onlineCoop._combatGame;const effects=capturePeerEffects(g,++onlineCoop.effectSequence,onlineCoop.combatEpoch);
    effects.stitchoDuet={x:300,y:900,age:45,evo:4,facing:1,bolts:[{x:330,y:850,life:10}]};
    onlineCoop.lastEffectsSentAt=performance.now()+600;return onlineCoop.direct.sendLatest('effects',effects);
  });
  let stormDelivered=false;
  const stormDeadline=Date.now()+12000;
  while(Date.now()<stormDeadline){
    await sendStorm();
    stormDelivered=await guestPage.evaluate(async()=>{
      const {onlineCoop}=await import('/systems/online-coop.js');return !!onlineCoop._combatGame.coopPeerEffects?.stitchoDuet;
    });if(stormDelivered)break;await guestPage.waitForTimeout(100);
  }
  assert.ok(stormDelivered,'V302 storm snapshot did not traverse WebRTC');
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

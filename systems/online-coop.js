import { ROSTER, applyForm } from "../characters/roster.js";
import { paintFit } from "../characters/look.js";
import { drawCharacter } from "../characters/draw.js";
import { coopRetryDelay,remoteMotionSample } from "./coop-resilience.js";
import { networkPacing, shouldSendPosition, roundtripEWMA } from "./coop-v103-pacing.js";
import { shouldUseSnapshot, peerNetworkHealth } from "./coop-v104-sync.js";
import { shouldFollowPeerRoom } from "./coop-v107-room-follow.js";
import { DirectPeerLink } from "./coop-v108-direct.js";
import { rtcFresh,rtcCanRetry,rtcReconnectDelay,rtcPreferDirectPose } from "./coop-v109-recovery.js";
import { remotePresenceCorrection } from "./coop-v95-presence.js";
import { drawDuoAltars } from "./duo-altar-art.js";
import { DUO_ALTARS,duoPlateState } from "../multiplayer/duo-altars.js";

const ENDPOINT = "/.netlify/functions/game";
// Adaptive pacing replaces fixed 125ms mutation + 180ms polling bursts.
const START_ROOM = "hub";
// Legacy stage values are only a fallback for old sessions; the actual game loads all 10 original rooms.
const STAGE_ROOMS = ["hub", "jungle", "volcano", "boss", "boss"];
const ENGINE_INITIAL = {
  0: { x: 420, y: 1070 },
  1: { x: 550, y: 1070 },
};

function finite(value, fallback) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function makeActionId(playerId, sequence) {
  return `online:${playerId}:${sequence}`;
}

async function post(body) {
  // A lost connection must not leave the entire engine waiting on one hung POST.
  const abort = new AbortController();
  const timeout = setTimeout(()=>abort.abort(), 10000);
  try{
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      cache: "no-store",
      signal: abort.signal,
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(()=>null);
    if (!response.ok || !data || data.error) {
      const error = new Error(data?.error?.message || "No se pudo sincronizar la partida online.");
      error.code = data?.error?.code || "SERVER_UNAVAILABLE";
      error.status = response.status;
      throw error;
    }
    return data.data;
  } catch(error) {
    if(error.name==="AbortError") {
      const timeoutError=new Error("La conexión tardó demasiado. Reintentando sin perder tu partida.");
      timeoutError.code="NETWORK_TIMEOUT";
      throw timeoutError;
    }
    throw error;
  } finally {clearTimeout(timeout);}
}

class OnlineCoop {
  constructor() {
    this.enabled = false;
    this.roomId = "";
    this.identity = null;
    this.selectedCharacterId = "";
    this.snapshot = null;
    this.remote = null;
    this.remoteWorld = "";
    this.sequence = 0;
    this.lastSend = 0;
    this.lastPoll = 0;
    this.lastSnapshotAt = 0;
    this.rttMs = 0;
    this.requestSamples = 0;
    this.outOfOrderPackets = 0;
    this.lastSentPose = null;
    this.polling = false;
    this.mutationBusy = false;
    this.pendingMutations = [];
    this.lastRoomId = "";
    this.lastLocalWorld = "";
    this.localRoomGraceUntil = 0;
    this.error = "";
    this.seenSignals = new Set();
    this.localStateSent = "";
    this.lastOrbSignals = new Set();
    this.retryFailures = 0;
    this.retryAfter = 0;
    this.nextDuoAt=0;
    this.duoApplied=new Set();
    this.reconnecting=false;
    this.resumeFailures=0;
    this.direct=null;
    this.directAttempted=false;
    this.lastDirectPoseAt=0;
    this.directConnectedAt=0;
    this.directRetryAt=0;
    this.directRetries=0;
  }

  readSession() {
    try {
      const saved = JSON.parse(sessionStorage.getItem("ohana-coop-session") || "null");
      if (!saved?.roomId || !saved?.identity?.playerId || !saved?.identity?.token) return null;
      return {
        roomId: saved.roomId,
        identity: saved.identity,
        characterId: saved.characterId || saved.selectedCharacterId || "",
        originalEngine: saved.originalEngine === true,
      };
    } catch (_) {
      return null;
    }
  }

  clearSession() {
    try { sessionStorage.removeItem("ohana-coop-session"); } catch (_) {}
  }

  async start(game, definition) {
    const session = this.readSession();
    if (!session || !definition) return false;

    this.direct?.close();
    this.direct=null;
    this.directAttempted=false;
    this.lastDirectPoseAt=0;
    this.directConnectedAt=0;
    this.directRetryAt=0;
    this.directRetries=0;
    this.enabled = true;
    this.roomId = session.roomId;
    this.identity = session.identity;
    this.selectedCharacterId = session.characterId || definition.id;
    this.snapshot = null;
    this.remote = null;
    this.remoteWorld = game.roomId;
    this.sequence = 0;
    this.lastSend = 0;
    this.lastPoll = 0;
    this.lastSnapshotAt = 0;
    this.rttMs = 0;
    this.requestSamples = 0;
    this.lastSentPose = null;
    this.error = "";
    this.mutationBusy = false;
    this.pendingPosition = null;
    this.pendingSignals = [];
    this.pendingMutations = [];
    this.seenSignals.clear();
    this.lastOrbSignals.clear();
    this.duoApplied.clear();
    this.nextDuoAt=0;
    this.localStateSent = "";
    this.retryFailures = 0;
    this.retryAfter = 0;
    this.lastRoomId = "";
    this.lastLocalWorld = "";
    this.localRoomGraceUntil = 0;
    this.reconnecting=false;
    this.resumeFailures=0;

    document.body.dataset.gameMode = "online";
    document.body.dataset.onlineRoom = this.roomId;
    document.body.dataset.onlineState = "connecting";
    delete document.body.dataset.onlineError;

    await this.poll(game, true);
    if (!this.snapshot) {
      this.enabled = false;
      document.body.dataset.onlineState = "error";
      document.body.dataset.onlineError = this.error || "initial-poll-failed";
      throw new Error(this.error || "No se pudo recuperar el estado inicial de la partida online.");
    }
    document.body.dataset.onlineState = "connected";

    // Online mode reuses the original OHANA room/physics/rendering.
    // The lobby's synthetic 1280×720 coordinates are never applied to it.
    const stageIndex = Math.max(0, Math.min(STAGE_ROOMS.length - 1, Number(this.snapshot?.combat?.campaign?.stageIndex) || 0));
    const initialRoom = this.snapshot?.players?.find((player) => player.isYou)?.worldRoomId
      || STAGE_ROOMS[stageIndex]
      || START_ROOM;

    try {
      game.loadRoom(initialRoom, "online");
    } catch (_) {
      game.loadRoom(START_ROOM, "online");
    }

    const local = game.player;
    const me = this.currentPlayer(this.snapshot);
    if (local && me) {
      const serverEvolution = Math.max(0, Math.min(4, Number(me.evolution) || 0));
      const serverXp = Math.max(0, Number(me.experience) || 0);
      local.evo = serverEvolution;
      local.xp = serverXp;
      applyForm(local, { silent: true });
      local.maxHealth = Math.max(1, Number(me.maxHealth) || local.maxHealth || 1);
      local.health = Math.max(0, Math.min(local.maxHealth, Number(me.health) || local.maxHealth));
      paintFit(local);
      const spawn = ENGINE_INITIAL[me.slot] || ENGINE_INITIAL[0];
      if (Number.isFinite(Number(me.x)) && Number.isFinite(Number(me.y)) &&
          Number(me.y) >= 900 && Number(me.y) <= 1200) {
        local.x = Number(me.x);
        local.y = Number(me.y);
      } else {
        local.x = spawn.x;
        local.y = spawn.y;
      }
      local.vx = 0;
      local.vy = 0;
      local.grounded = true;
    }

    await this.sendPosition(game, true);
    this.ensurePeerHud();
    this.setupDirect(game);
    return true;
  }

  ensurePeerHud() {
    if (!this.enabled || document.getElementById("online-peer-badge")) return;
    const badge = document.createElement("div");
    badge.id = "online-peer-badge";
    badge.textContent = "ONLINE · 2 JUGADORES";
    Object.assign(badge.style, {
      position: "fixed",
      top: "12px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: "60",
      padding: "7px 13px",
      borderRadius: "999px",
      border: "1px solid rgba(126,231,255,.34)",
      background: "rgba(7,18,38,.72)",
      color: "#dff9ff",
      font: "700 11px Outfit, sans-serif",
      letterSpacing: ".08em",
      pointerEvents: "none",
      backdropFilter: "none",
      boxShadow: "0 8px 28px rgba(0,0,0,.22)",
    });
    document.body.appendChild(badge);
  }

  // Network status is informational: keep it independent of FPS and physics.
  // Only mutate DOM text when the observed state actually changes.
  showNetworkHealth(){
    if(typeof document==="undefined"||!this.enabled)return;
    const badge=document.getElementById("online-peer-badge");
    if(!badge)return;
    const state=document.body.dataset.onlineState||"connected";
    const direct=rtcFresh(this.direct?.active,this.lastDirectPoseAt,this.directConnectedAt,performance.now(),this.direct?.lastPongAt);
    document.body.dataset.coopTransport=direct?"direct":"server";
    if(direct&&this.direct?.directRttMs>0)document.body.dataset.coopRttDirect=String(Math.round(this.direct.directRttMs));
    else delete document.body.dataset.coopRttDirect;
    let text=state==="waiting-peer"?"ONLINE · ESPERANDO COMPAÑERO":
      state==="reconnecting"?"ONLINE · RECONECTANDO":
      state==="error"?"ONLINE · SESIÓN NO DISPONIBLE":"ONLINE · 2 JUGADORES";
    if(state==="connected")text+=direct?" · DIRECTO WEBRTC":" · SERVIDOR (CON RETRASO)";
    if(direct&&this.direct?.directRttMs>0)text+=" · P2P "+Math.round(this.direct.directRttMs)+" ms";
    if(state==="connected"&&this.requestSamples>0){
      const ping=Math.max(0,Math.round(this.rttMs));
      const age=performance.now()-this.remote?.sampleAt;
      const quality=peerNetworkHealth(this.rttMs,Number.isFinite(age)?Math.max(0,age):0);
      text+=" · servidor "+ping+" ms";
      if(quality.quality==="late"||quality.quality==="lost")text+=" · SEÑAL RETRASADA";
      else if(quality.quality==="slow")text+=" · RED LENTA";
    }
    if(badge.textContent!==text)badge.textContent=text;
  }

  currentPlayer(snapshot) {
    return snapshot?.players?.find((player) => player.isYou) || null;
  }

  setupDirect(game){
    if(this.directAttempted||!this.enabled||!this.remote?.playerId||!this.identity)return;
    this.directAttempted=true;
    this.directRetryAt=performance.now()+rtcReconnectDelay(this.directRetries);
    const me=this.currentPlayer(this.snapshot);
    this.direct=new DirectPeerLink({
      initiator:me?.slot===0,
      relay:message=>void this.signal(game,"action",message),
      onPose:pose=>this.receiveDirectPose(pose),
      onEvent:event=>this.receiveDirectEvent(game,event),
      onState:connected=>{
        if(connected)this.directConnectedAt=performance.now();
        this.showNetworkHealth();
      }
    });
    this.direct.onMetrics=()=>this.showNetworkHealth();
    if(this.direct.available)void this.direct.start();
    this.showNetworkHealth();
  }

  repairDirect(game,now=performance.now()){
    if(!this.enabled||!this.remote?.playerId||!this.direct?.available)return false;
    const connected=rtcFresh(this.direct?.active,this.lastDirectPoseAt,this.directConnectedAt,now,this.direct?.lastPongAt);
    if(!rtcCanRetry({now,at:this.directRetryAt,hidden:typeof document!=="undefined"&&document.hidden,
      lobby:this.snapshot?.phase==="lobby",peer:!!this.remote?.playerId,connected}))return false;
    this.direct?.close();this.direct=null;
    this.directAttempted=false;
    this.lastDirectPoseAt=0;this.directConnectedAt=0;
    this.directRetries++;
    this.setupDirect(game);
    return true;
  }

  receiveDirectPose(pose){
    if(!this.remote||!this.enabled)return;
    const now=performance.now();
    const teleport=this.remoteWorld!==pose.room;
    const sample=remoteMotionSample(this.remote,pose.x,pose.y,now,teleport);
    Object.assign(this.remote,sample);
    if(sample.teleport){this.remote.x=pose.x;this.remote.y=pose.y;}
    this.remoteWorld=pose.room;
    this.remote.pose={vx:pose.vx,vy:pose.vy,grounded:pose.grounded,melee:pose.melee,dash:pose.dash};
    this.remote.facing=pose.facing;
    this.remote.evolution=pose.evo;
    this.lastDirectPoseAt=now;
    // A reconnected peer can send poses before its badge is refreshed by
    // another Netlify HTTP response. Restore DIRECT mode on the first packet.
    if(typeof document!=="undefined"&&document.body.dataset.coopTransport!=="direct")
      this.showNetworkHealth();
  }

  receiveDirectEvent(game,event){
    if(!this.enabled||!this.remote)return;
    if(event.kind==="room"){
      const destination=String(event.payload?.roomId||"");
      if(!/^(hub|beach|jungle|cave|lab|ridge|space|reef|volcano|boss)$/.test(destination))return;
      this.remoteWorld=destination;
      if(game.roomId!==destination){
        this.lastRoomId=destination;
        this.lastLocalWorld=destination;
        this.localRoomGraceUntil=performance.now()+1200;
        try{game.loadRoom?.(destination,"online-peer");}catch{}
      }
    }else if(event.kind==="action"){
      const action=event.payload?.action;
      if(!["attack","ability","dash"].includes(action))return;
      this.remote.actionKind=action;
      this.remote.abilitySlot=Number.isInteger(event.payload?.slot)?event.payload.slot:null;
      this.remote.actionUntil=performance.now()+(action==="ability"?420:action==="dash"?280:300);
      if(action==="attack"||action==="ability")this.remote.melee=action==="ability"?16:10;
      else this.remote.dash=18;
    }else if(event.kind==="state"&&["won","lost"].includes(event.payload?.state)){
      // Server still handles the definitive state; direct feedback is visual only.
      this.remote.actionKind=event.payload.state;
    }
  }

  updateRemote(snapshot, game) {
    const you = this.currentPlayer(snapshot);
    const remote = snapshot?.players?.find((player) => !player.isYou && player.connected && player.characterId);
    if (!remote) {
      this.remote = null;
      return;
    }

    const freshDirect=rtcPreferDirectPose(this.direct?.active,this.lastDirectPoseAt,this.directConnectedAt,performance.now(),this.direct?.lastPongAt);
    const worldRoom = (freshDirect?this.remoteWorld:remote.worldRoomId)||"hub";
    const previous = this.remote;
    const legacyCoord = !snapshot.engineMode && Number(remote.y) > 0 && Number(remote.y) <= 720;
    const spawn = ENGINE_INITIAL[remote.slot] || ENGINE_INITIAL[1];
    const targetX = legacyCoord ? (previous?.targetX ?? spawn.x) : finite(remote.x, previous?.targetX ?? spawn.x);
    const targetY = legacyCoord ? (previous?.targetY ?? spawn.y) : finite(remote.y, previous?.targetY ?? spawn.y);

    if (!previous || previous.playerId !== remote.playerId) {
      this.remote = {
        playerId: remote.playerId,
        characterId: remote.characterId,
        evolution: remote.evolution ?? 1,
        x: targetX,
        y: targetY,
        targetX,
        targetY,
        previousX:targetX,previousY:targetY,
        sampleAt:performance.now(),previousSampleAt:performance.now()-180,
        facing: remote.facing || 1,
        grounded: true,
        melee: 0,
        dash: 0,
        invuln: 0,
        slot: remote.slot,
        phase: Math.random() * 100,
        health: remote.health,
        maxHealth: remote.maxHealth,
        pose: structuredClone(remote.pose || { vx: 0, vy: 0, grounded: true, melee: 0, dash: 0 }),
        actionKind: null,
        abilitySlot: null,
        actionUntil: 0,
      };
    } else {
      if(!freshDirect){
        const sample=remoteMotionSample(this.remote,targetX,targetY,performance.now(),this.remoteWorld!==worldRoom);
        Object.assign(this.remote,sample);
        if(sample.teleport){this.remote.x=targetX;this.remote.y=targetY;}
      }
      this.remote.characterId = remote.characterId;
      this.remote.evolution = remote.evolution ?? this.remote.evolution ?? 1;
      if(!freshDirect)this.remote.facing = remote.facing || this.remote.facing || 1;
      this.remote.slot = remote.slot;
      this.remote.health = remote.health;
      this.remote.maxHealth = remote.maxHealth;
      if(!freshDirect)this.remote.pose = structuredClone(remote.pose || this.remote.pose || { vx: 0, vy: 0, grounded: true, melee: 0, dash: 0 });
    }

    this.remoteWorld = worldRoom;
    if (you && !you.isYou) return;
  }

  async poll(game, immediate = false) {
    if (!this.enabled || this.polling || !this.roomId || !this.identity) return;
    const now = performance.now();
    if (!immediate && now < this.retryAfter) return;
    const pacing=networkPacing(this.rttMs,this.retryFailures,this.snapshot?.phase==="lobby");
    if(!immediate && now-this.lastPoll<pacing.pollMs)return;
    // Mutation responses already contain a full snapshot, so a second poll
    // immediately after each move merely doubles Netlify Functions + Blob I/O.
    if(!immediate && now-this.lastSnapshotAt<pacing.pollMs)return;

    this.polling = true;
    this.lastPoll = now;
    try {
      const snapshot = await post({
        action: "poll",
        roomId: this.roomId,
        identity: this.identity,
      });
      this.recordNetworkReply(now);
      if(!shouldUseSnapshot(this.snapshot,snapshot)){
        this.outOfOrderPackets++;
        return;
      }
      const previousPeerRoom=this.remoteWorld;
      this.snapshot = snapshot;
      this.updateRemote(snapshot, game);
      this.sequence = Math.max(
        this.sequence,
        this.currentPlayer(snapshot)?.lastSequence || 0
      );
      this.clearRetry();
      if (snapshot.phase === "lobby") {
        // Other player may only be offline. Keep this world and session alive.
        // Server pauses combat until they return; do not redirect both to lobby.
        if(typeof document!=="undefined"){
          document.body.dataset.onlineState="waiting-peer";
          const badge=document.getElementById("online-peer-badge");
          if(badge)badge.textContent="ONLINE · ESPERANDO COMPAÑERO";
          this.showNetworkHealth();
        }
        return;
      }

      const remoteWorld = this.remote?.playerId ? this.remoteWorld : "";
      if (shouldFollowPeerRoom(previousPeerRoom,remoteWorld,game.roomId,now,this.localRoomGraceUntil)) {
        this.lastRoomId = remoteWorld;
        this.lastLocalWorld=remoteWorld;
        try {
          if (typeof game.loadRoom === "function") game.loadRoom(remoteWorld, "online-peer");
        } catch (_) {}
      }
    } catch (error) {
      if(error?.code==="DISCONNECTED") {
        if(await this.resumeSession())return;
      }
      if(error?.code==="INVALID_SESSION"||error?.code==="STALE_SESSION"||error?.code==="ROOM_EXPIRED"){
        this.failClosed(error);return;
      }
      this.markRetry(error);
    } finally {
      this.polling = false;
    }
  }

  failClosed(error){
    this.error=error?.message||"Sesión caducada";
    this.enabled=false;
    this.pendingMutations.length=0;
    this.direct?.close();this.direct=null;this.directAttempted=false;
    this.directConnectedAt=0;this.lastDirectPoseAt=0;
    this.clearSession();
    if(typeof document!=="undefined"){
      document.body.dataset.onlineState="error";
      document.body.dataset.onlineError=error?.code||"INVALID_SESSION";
      const badge=document.getElementById("online-peer-badge");
      if(badge)badge.textContent="ONLINE · SESIÓN NO DISPONIBLE";
      this.showNetworkHealth();
    }
    // No automatic redirect: lets players see the error and retry safely.
  }

  async resumeSession(){
    if(this.reconnecting||!this.enabled||!this.identity||!this.roomId)return false;
    this.reconnecting=true;
    try{
      const snapshot=await post({action:"join",roomId:this.roomId,identity:this.identity});
      if(!snapshot?.identity?.token||!snapshot?.identity?.playerId)throw new Error("No se pudo recuperar la identidad.");
      this.identity=snapshot.identity;
      this.snapshot=snapshot;
      this.updateRemote(snapshot);
      // A reconnect increments connectionEpoch; future requests need new credentials.
      try{
        sessionStorage.setItem("ohana-coop-session",JSON.stringify({
          roomId:this.roomId,identity:this.identity,
          characterId:this.selectedCharacterId,
          selectedCharacterId:this.selectedCharacterId,originalEngine:true
        }));
      }catch(_){}
      const latest=this.currentPlayer(snapshot)?.lastSequence||0;
      this.sequence=Math.max(this.sequence,latest);
      // Unacknowledged moves are obsolete; non-movement signals can safely be
      // reissued with fresh monotonic sequence IDs after the resumed connection.
      this.pendingMutations=this.pendingMutations.filter(item=>item.action!=="move").slice(-16)
        .map(item=>{
          const sequence=++this.sequence;
          return {...item,identity:this.identity,sequence,actionId:makeActionId(this.identity.playerId,sequence)};
        });
      this.resumeFailures=0;
      this.direct?.close();this.direct=null;this.directAttempted=false;this.lastDirectPoseAt=0;
      this.directConnectedAt=0;this.directRetryAt=0;this.directRetries=0;
      this.lastSentPose=null;
      this.clearRetry();
      return true;
    }catch(error){
      this.resumeFailures++;
      if(["INVALID_SESSION","STALE_SESSION","ROOM_EXPIRED"].includes(error.code))this.failClosed(error);
      else this.markRetry(error);
      return false;
    }finally{this.reconnecting=false;}
  }

  recordNetworkReply(started){
    const now=performance.now();
    this.lastSnapshotAt=now;
    this.rttMs=roundtripEWMA(this.rttMs,now-started);
    this.requestSamples++;
    if(typeof document!=="undefined"){
      document.body.dataset.coopRtt=String(Math.round(this.rttMs));
      document.body.dataset.coopMoveInterval=String(networkPacing(this.rttMs,this.retryFailures).moveMs);
      document.body.dataset.coopNetwork=peerNetworkHealth(this.rttMs).quality;
      document.body.dataset.coopOutOfOrder=String(this.outOfOrderPackets);
      this.showNetworkHealth();
    }
  }

  markRetry(error){
    this.error=error?.message||String(error);
    this.retryFailures=Math.min(6,(this.retryFailures||0)+1);
    this.retryAfter=performance.now()+coopRetryDelay(this.retryFailures);
    if(typeof document!=="undefined"){
      document.body.dataset.onlineState="reconnecting";
      const badge=document.getElementById("online-peer-badge");
      if(badge)badge.textContent="ONLINE · RECONECTANDO";
      this.showNetworkHealth();
    }
  }

  clearRetry(){
    this.error="";
    this.retryFailures=0;
    this.retryAfter=0;
    if(this.enabled&&typeof document!=="undefined"){
      const waiting=this.snapshot?.phase==="lobby";
      document.body.dataset.onlineState=waiting?"waiting-peer":"connected";
      const badge=document.getElementById("online-peer-badge");
      if(badge)badge.textContent=waiting?"ONLINE · ESPERANDO COMPAÑERO":"ONLINE · 2 JUGADORES";
      this.showNetworkHealth();
    }
  }

  enqueueMutation(body) {
    if (body.action === "move") {
      const nonMoves = this.pendingMutations.filter((item) => item.action !== "move");
      this.pendingMutations = [...nonMoves, body];
    } else {
      this.pendingMutations.push(body);
    }
    this.pendingMutations.sort((a, b) => Number(a.sequence || 0) - Number(b.sequence || 0));
    if (this.pendingMutations.length > 24) {
      const signals = this.pendingMutations.filter((item) => item.action !== "move");
      const latestMove = this.pendingMutations.find((item) => item.action === "move");
      this.pendingMutations = [...signals.slice(-20), ...(latestMove ? [latestMove] : [])].sort((a, b) => Number(a.sequence || 0) - Number(b.sequence || 0));
    }
  }

  async sendPosition(game, force = false) {
    if (!this.enabled || !game.player || game.player.dead || !this.roomId || !this.identity || this.snapshot?.phase==="lobby") return;
    const now=performance.now();
    const pacing=networkPacing(this.rttMs,this.retryFailures,this.snapshot?.phase==="lobby");
    const pose={
      action: "move",
      roomId: this.roomId,
      identity: this.identity,
      mode: "engine",
      positionX: finite(game.player.x, 420),
      positionY: finite(game.player.y, 1070),
      facing: game.player.facing || 1,
      evolution: Math.max(0, Math.min(4, Number(game.player.evo) || 0)),
      experience: finite(game.player.xp, 0),
      health: finite(game.player.health, 0),
      maxHealth: finite(game.player.maxHealth, 1),
      velocityX: finite(game.player.vx, 0),
      velocityY: finite(game.player.vy, 0),
      grounded: game.player.grounded !== false,
      melee: finite(game.player.melee, 0),
      dash: finite(game.player.dash, 0),
      worldRoomId: game.roomId || START_ROOM,
    };
    if(!shouldSendPosition(this.lastSentPose,pose,now-this.lastSend,pacing,force))return;
    const sequence=++this.sequence;
    this.lastSentPose=pose;
    this.lastSend=now;
    this.enqueueMutation({...pose,sequence,actionId:makeActionId(this.identity.playerId,sequence)});
    void this.drainMutations(game);
  }

  async drainMutations(game) {
    if (this.mutationBusy || this.reconnecting || this.snapshot?.phase==="lobby" || performance.now() < this.retryAfter) return;
    this.mutationBusy = true;
    try {
      while (this.enabled && this.roomId && this.identity && this.pendingMutations.length) {
        const body = this.pendingMutations.shift();
        try {
          const started=performance.now();
          const data = await post(body);
          if (data) {
            this.recordNetworkReply(started);
            if(shouldUseSnapshot(this.snapshot,data)){
              this.snapshot = data;
              this.updateRemote(data, game);
            }else this.outOfOrderPackets++;
          }
          this.clearRetry();
        } catch (error) {
          if(error?.code==="DISCONNECTED"){
            if(body.action!=="move")this.pendingMutations.unshift(body);
            if(await this.resumeSession())continue;
            break;
          }
          if(["STALE_SESSION","INVALID_SESSION","ROOM_EXPIRED"].includes(error?.code)){
            this.failClosed(error);break;
          }
          this.markRetry(error);
          if(body.action!=="move")this.pendingMutations.unshift(body);
          break;
        }
      }
    } finally {
      this.mutationBusy = false;
      // Never immediately reschedule failed requests: tick() uses retryAfter.
      // Retain important signals for a bounded backoff, not a microtask storm.
    }
  }

  async signal(game, signalKind, payload = {}) {
    if (!this.enabled || !this.roomId || !this.identity || this.snapshot?.phase==="lobby") return;
    // Action/room feedback is shown directly before the authoritative POST.
    // The RTC handshake itself is carried ONLY over Netlify, never recursively.
    if(signalKind==="action"&&payload.action!=="rtc")this.direct?.sendEvent("action",payload);
    else if(signalKind==="room"||signalKind==="state")this.direct?.sendEvent(signalKind,payload);
    const sequence = ++this.sequence;
    this.enqueueMutation({
      action: "signal",
      roomId: this.roomId,
      identity: this.identity,
      sequence,
      actionId: "online:" + this.identity.playerId + ":" + sequence,
      signalKind,
      payload: { ...payload, roomId: game.roomId || START_ROOM },
    });
    void this.drainMutations(game);
  }
  consumeSignals(game) {
    const events = this.snapshot?.combat?.events || [];
    for (const event of events) {
      if (event.kind !== "online-signal" || event.senderPlayerId === this.identity?.playerId) continue;
      // Room-change signals name a destination by definition.
      // RTC offers/answers can arrive while teammates are in different worlds.
      // Checking game.roomId first permanently loses their negotiation.
      const rtc=event.signalKind==="action"&&event.payload?.action==="rtc";
      if (!rtc && event.signalKind !== "room" && event.payload?.roomId !== game.roomId) continue;
      if (this.seenSignals.has(event.id)) continue;
      this.seenSignals.add(event.id);
      if (this.seenSignals.size > 128) this.seenSignals.delete(this.seenSignals.values().next().value);

      if(rtc){
        if(this.direct)void this.direct.signal(event.payload);
        continue;
      }
      if(event.signalKind === "duo-lit"){
        const roomId=String(event.payload?.roomId||"");
        if(roomId===game.roomId&&!this.duoApplied.has(roomId)){
          this.duoApplied.add(roomId);
          const p=game.player,amount=Math.max(0,Math.min(15,Number(event.payload?.heal)||0));
          if(p&&!p.dead&&amount)p.health=Math.min(p.maxHealth,p.health+amount);
          game.nums?.add?.(p.x+p.w*.5,p.y-25,"VÍNCULO OHANA +"+amount,"#fff1b6",true);
          game.fx?.emit?.(p.x+p.w*.5,p.y,{color:"#ffe2a5",count:14,size:3,star:true,up:1.3,life:20});
        }
        continue;
      }
      if (event.signalKind === "state") {
        const state = String(event.payload?.state || "");
        if (state === "lost") {
          this.localStateSent = "lost";
          try {
            game.player.dead = true;
            game.player.health = 0;
            game.won = false;
            window.dispatchEvent(new CustomEvent("ohana-online-state", {
              detail: { state: "lost", senderPlayerId: event.senderPlayerId },
            }));
          } catch (_) {}
        } else if (state === "won") {
          this.localStateSent = "won";
          try {
            window.dispatchEvent(new CustomEvent("ohana-online-state", {
              detail: { state: "won", senderPlayerId: event.senderPlayerId },
            }));
          } catch (_) {}
        }
        continue;
      }

      if (event.signalKind === "orb") {
        const x = finite(event.payload?.x, NaN);
        const y = finite(event.payload?.y, NaN);
        const xp = Math.max(0, finite(event.payload?.xp, 0));
        const roomKey = String(event.payload?.roomId || game.roomId || "hub");
        const orbKey = `${roomKey}:${Math.round(x)}:${Math.round(y)}`;
        this.lastOrbSignals.add(orbKey);
        if (Number.isFinite(x) && Number.isFinite(y)) {
          const orb = (game.orbs || []).find((item) => !item.taken && Math.hypot(item.x - x, item.y - y) < 42);
          if (orb) {
            orb.taken = true;
            if (xp > 0 && game.player && !game.player.dead) {
              game.player.xp = Math.max(0, Number(game.player.xp) || 0) + xp;
            }
            game.fx?.emit(orb.x, orb.y, { color: "#ffe66a", count: 12, size: 4, up: 1.8, star: true, life: 18 });
            game.nums?.add(orb.x, orb.y - 8, "XP", "#ffe66a");
          }
        }
        continue;
      }

      if (event.signalKind === "room") {
        const nextRoom = String(event.payload?.roomId || "");
        if (nextRoom && nextRoom !== game.roomId) {
          try { game.loadRoom(nextRoom, "online-peer"); } catch (_) {}
        }
        if (nextRoom) this.lastLocalWorld = nextRoom;
        this.remoteWorld = nextRoom || this.remoteWorld;
        continue;
      }

      if (event.signalKind === "action") {
        const action = event.payload?.action;
        if (!this.remote) continue;
        this.remote.actionKind = action;
        this.remote.abilitySlot = Number.isFinite(Number(event.payload?.slot)) ? Number(event.payload.slot) : null;
        this.remote.actionUntil = performance.now() + (action === "ability" ? 420 : action === "dash" ? 280 : 300);
        if (action === "attack" || action === "ability") {
          this.remote.melee = action === "ability" ? 16 : 10;
        } else if (action === "dash") {
          this.remote.dash = 18;
        }
      }

      if (event.signalKind === "hit") {
        this.applyRemoteHit(game, event.payload);
      }

      if (event.signalKind === "hurt") {
        const targetPlayerId = event.payload?.targetPlayerId;
        const health = Number(event.payload?.health);
        if (targetPlayerId && targetPlayerId !== this.identity?.playerId && this.remote?.playerId === targetPlayerId) {
          this.remote.invuln = Math.max(this.remote.invuln || 0, 24);
          if (Number.isFinite(health)) this.remote.health = Math.max(0, health);
        }
      }
    }
  }

  applyRemoteHit(game, payload) {
    if (!payload || !Array.isArray(game.enemies)) return;
    const targetId = String(payload.targetId || "");
    const kind = String(payload.kind || "");
    const x = finite(payload.x, 0);
    const y = finite(payload.y, 0);
    const damage = Math.max(0, finite(payload.damage, 0));
    if (!damage) return;

    let target = targetId
      ? game.enemies.find((enemy) => enemy && enemy.id === targetId && !enemy.dying)
      : null;

    if (!target) target = game.enemies
      .filter((enemy) => enemy && enemy.hp > 0 && !enemy.dying)
      .filter((enemy) => !kind || enemy.kind === kind)
      .sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];

    if (!target) {
      target = game.enemies
        .filter((enemy) => enemy && enemy.hp > 0 && !enemy.dying)
        .sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];
    }

    if (!target || Math.hypot(target.x - x, target.y - y) > 180) return;

    target.hp = Math.max(0, target.hp - damage);
    target.dying = Number(payload.dying) || target.dying || 0;
    target.invuln = Math.max(target.invuln || 0, 8);
    target.stun = Math.max(target.stun || 0, 8);
    target._hitT = 10;
    target._hitMax = 10;
    if (game.player && !game.player.dead) {
      game.player.xp = Math.max(0, Number(game.player.xp) || 0) + 1;
    }
    game.nums?.add(target.x, target.y, String(Math.round(damage)), "#9be7ff");
    game.fx?.emit(target.x + target.w / 2, target.y + target.h / 2, {
      color: "#9be7ff",
      count: 8,
      size: 3,
      star: true,
      speed: 2.2,
      life: 12,
    });
  }

  applyRemoteHurt(game, amount) {
    const player = game.player;
    if (!player || player.dead || player.invuln > 0) return;
    player.health = Math.max(0, player.health - amount);
    player.invuln = 24;
    player.flash = Math.max(player.flash || 0, 8);
  }

  tick(game) {
    if (!this.enabled) return;
    if(!this.directAttempted&&this.remote?.playerId)this.setupDirect(game);
    else this.repairDirect(game);
    this.direct?.sendPose(game);
    this.direct?.ping();
    if(typeof document!=="undefined"&&this.direct?.active){
      const connected=rtcFresh(this.direct.active,this.lastDirectPoseAt,this.directConnectedAt,performance.now(),this.direct?.lastPongAt);
      if(document.body.dataset.coopTransport!==(connected?"direct":"server"))this.showNetworkHealth();
    }
    void this.poll(game);

    const localState = game.player?.dead ? "lost" : game.won ? "won" : "";
    if (!localState && (this.localStateSent === "lost" || this.localStateSent === "won")) {
      this.localStateSent = "";
    }
    if (localState && localState !== this.localStateSent) {
      this.localStateSent = localState;
      void this.signal(game, "state", { state: localState });
    }

    const roomKey = String(game.roomId || "hub");
    const consumedOrbKeys = new Set(this.lastOrbSignals);
    for (const orb of game.orbs || []) {
      if (!orb.taken) continue;
      const key = `${roomKey}:${Math.round(orb.x)}:${Math.round(orb.y)}`;
      if (consumedOrbKeys.has(key)) continue;
      consumedOrbKeys.add(key);
      void this.signal(game, "orb", {
        x: orb.x,
        y: orb.y,
        xp: 4,
        roomId: game.roomId || START_ROOM,
      });
      if (consumedOrbKeys.size > 128) consumedOrbKeys.delete(consumedOrbKeys.values().next().value);
    }
    this.lastOrbSignals = consumedOrbKeys;

    if (game.roomId !== this.lastLocalWorld) {
      const firstWorld = !this.lastLocalWorld;
      this.lastLocalWorld = game.roomId;
      if (!firstWorld) {
        this.localRoomGraceUntil=performance.now()+1200;
        void this.signal(game, "room", {
          roomId: game.roomId,
          positionX: game.player?.x,
          positionY: game.player?.y,
          facing: game.player?.facing || 1,
        });
      }
    }
    void this.sendPosition(game);

    if (this.remote) {
      const now = performance.now();
      const correction = remotePresenceCorrection(this.remote, now);
      const blend=rtcPreferDirectPose(this.direct?.active,this.lastDirectPoseAt,this.directConnectedAt,now,this.direct?.lastPongAt)
        ?Math.max(.4,correction.blend):correction.blend;
      this.remote.x += (correction.x - this.remote.x) * blend;
      this.remote.y += (correction.y - this.remote.y) * blend;
      this.remote.signalOpacity = correction.opacity;
      this.remote.signalWeak = correction.stale;
      const pose = this.remote.pose || {};
      this.remote.melee = Math.max(0, this.remote.melee - 1);
      this.remote.dash = Math.max(0, this.remote.dash - 1);
      this.remote.invuln = Math.max(0, this.remote.invuln - 1);
      this.remote.grounded = pose.grounded !== false;
      this.remote.phase += correction.stale ? 0.08 : 0.7;
      if (this.remote.actionUntil && now > this.remote.actionUntil) {
        this.remote.actionKind = null;
        this.remote.abilitySlot = null;
      }
    }

    this.consumeSignals(game);
    const room=String(game.roomId||"");
    if(DUO_ALTARS[room]&&!this.snapshot?.duoAltars?.[room]&&this.remote&&
      this.remoteWorld===room&&game.player&&!game.player.dead){
      const now=performance.now();
      const local={x:game.player.x,y:game.player.y,health:game.player.health,connected:true,worldRoomId:room,lastSeenAt:0};
      const peer={x:this.remote.x,y:this.remote.y,health:this.remote.health,connected:true,worldRoomId:room,lastSeenAt:0};
      if(duoPlateState([local,peer],room,0,1)?.ready && now>=this.nextDuoAt){
        this.nextDuoAt=now+650;
        void this.signal(game,"duo",{roomId:room});
      }
    }
  }

  render(ctx, game, t) {
    if(!this.enabled)return;
    drawDuoAltars(ctx,game,this.remote?{...this.remote,worldRoomId:this.remoteWorld}:null,this.snapshot,t,!!game.reduceMotion);
    if (!this.remote || this.remoteWorld !== game.roomId) return;
    // Character vector artwork is expensive. Cull before invoking the entire
    // character renderer when the teammate is outside camera by a wide margin.
    const vx=this.remote.x-(game.cam?.x||0),vy=this.remote.y-(game.cam?.y||0);
    const vw=Number(game.viewW)||1280,vh=Number(game.viewH)||720;
    if(vx < -240 || vx > vw+240 || vy < -300 || vy > vh+300)return;
    const definition = ROSTER.find((item) => item.id === this.remote.characterId);
    if (!definition) return;
    const evo = Math.max(0, Math.min(4, Number(this.remote.evolution) || 0));
    const form = definition.forms?.[evo] || definition;
    const player = {
      ...definition,
      ...form,
      id: definition.id,
      x: this.remote.x,
      y: this.remote.y,
      w: form.w,
      h: form.h,
      vx: this.remote.signalWeak ? 0 : finite(this.remote.pose?.vx, 0),
      vy: this.remote.signalWeak ? 0 : finite(this.remote.pose?.vy, 0),
      facing: this.remote.facing || 1,
      grounded: this.remote.grounded,
      evo,
      melee: this.remote.melee,
      dash: this.remote.dash,
      invuln: this.remote.invuln,
      actionKind: this.remote.actionKind,
      abilitySlot: this.remote.abilitySlot,
      phase: this.remote.phase + t / 10,
      visualScale: 1,
    };
    ctx.save();
    if (this.remote.invuln > 0) ctx.globalAlpha = 0.72;
    if (this.remote.signalWeak) ctx.globalAlpha *= Math.max(.44, Math.min(1, this.remote.signalOpacity || 1));
    drawCharacter(ctx, player, game.cam, t);
    ctx.globalAlpha = 1;
    const px = player.x + player.w / 2 - game.cam.x;
    const py = player.y + player.h * 0.45 - game.cam.y;
    if (this.remote.actionKind === "ability") {
      ctx.save();
      ctx.globalAlpha = Math.max(0, (this.remote.actionUntil - performance.now()) / 420);
      ctx.strokeStyle = "#ffd36a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(px + player.facing * 26, py - 12, 18 + ((t * 4) % 18), -1.05, 1.05);
      ctx.stroke();
      ctx.restore();
    }
    ctx.font = "700 11px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#e5fbff";
    ctx.strokeStyle = "rgba(4,8,16,.84)";
    ctx.lineWidth = 3;
    ctx.strokeText("J2 · " + (definition.name || "Jugador"), player.x + player.w / 2 - game.cam.x, player.y - 10 - game.cam.y);
    ctx.fillText("J" + ((this.remote.slot ?? 1) + 1) + " · " + (definition.name || "Jugador") + (this.remote.signalWeak ? " · SEÑAL RETRASADA" : ""), player.x + player.w / 2 - game.cam.x, player.y - 10 - game.cam.y);
    const hp = Math.max(0, finite(this.remote.health, this.remote.maxHealth || 1));
    const maxHp = Math.max(1, finite(this.remote.maxHealth, 1));
    const barW = 58;
    const barX = player.x + player.w / 2 - barW / 2 - game.cam.x;
    const barY = player.y - 23 - game.cam.y;
    ctx.fillStyle = "rgba(3,8,16,.78)";
    ctx.fillRect(barX, barY, barW, 5);
    ctx.fillStyle = hp / maxHp > .45 ? "#7ee7a7" : "#ff8b8b";
    ctx.fillRect(barX, barY, barW * Math.max(0, Math.min(1, hp / maxHp)), 5);
    ctx.restore();
  }
}

export const onlineCoop = new OnlineCoop();

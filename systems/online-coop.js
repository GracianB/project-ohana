import {drawFamilyDuet} from './family-duets.js';
import {drawMichiDuet} from './michi-duet.js';
import {drawChispinDuet} from './chispin-duet.js';
import {drawStitchoDuet} from "./stitcho-duet.js";
import { ROSTER, applyForm } from "../characters/roster.js";
import { paintFit } from "../characters/look.js";
import { drawCharacter } from "../characters/draw.js";
import { coopRetryDelay,remoteMotionSample } from "./coop-resilience.js";
import { networkPacing, shouldSendPosition, roundtripEWMA } from "./coop-v103-pacing.js";
import { shouldUseSnapshot, peerNetworkHealth } from "./coop-v104-sync.js";
import { shouldFollowPeerRoom } from "./coop-v107-room-follow.js";
import {renderTravelDialog} from "./coop-travel-dialog-v604.js";
import { DirectPeerLink } from "./coop-v108-direct.js";
import { rtcFresh,rtcCanRetry,rtcReconnectDelay,rtcPreferDirectPose } from "./coop-v109-recovery.js";
import { remotePresenceCorrection } from "./coop-v95-presence.js";
import { drawDuoAltars } from "./duo-altar-art.js";
import {drawKiloDuet} from "./kilo-duet.js";
import {drawDinoPeerEffects} from "./dino-coop-effects.js";
import {applyDinoImpact,readDinoImpact} from "./coop-ability-hits.js";
import { drawMichiAbilityEcho,drawChispinAbilityEcho,drawKiloAbilityEcho,drawProjectile,drawSlash,drawBolt } from "./abilities.js";
import { drawChispinCloud } from "./chispin-cloud.js";
import { captureCombatFrame,applyCombatFrame,advanceMirroredEnemies,validCombatFrame,COMBAT_PROTOCOL,resetCombatMirror,sharedEnemyTarget } from "./coop-combat-mirror.js";
import { capturePeerEffects,applyPeerEffects,advancePeerEffects,sendPeerEffectsWithReliableDuet,captureFamilyDuetRelay } from "./coop-peer-effects.js";
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

async function post(body,timeoutMs=10000) {
  // A lost connection must not leave the entire engine waiting on one hung POST.
  const abort = new AbortController();
  const timeout = setTimeout(()=>abort.abort(), timeoutMs);
  try{
    const response = await fetch(body.action==="rtc-config"?"/.netlify/functions/rtc-config":ENDPOINT, {
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
    this._travelRequestKey = "";
    this._travelApplied = "";
    this._travelBusy = false;
    this._travelGame = null;
    this.error = "";
    this.seenSignals = new Set();
    this.seenHitEvents = new Set();
    this.localStateSent = "";
    this.lastOrbSignals = new Set();
    this.retryFailures = 0;
    this.retryAfter = 0;
    this.nextDuoAt=0;
    this.duoApplied=new Set();
    this.reconnecting=false;
    this.resumeFailures=0;
    this.direct=null;
    this.directSetupId=0;
    this.turnConfigStatus="loading";
    this.directAttempted=false;
    this.lastDirectPoseAt=0;
    this.directConnectedAt=0;
    this.directRetryAt=0;
    this.directRetries=0;
    this.lastCombatSentAt=0;this.combatSequence=0;
    this.lastCombatReceivedAt=0;this.lastCombatFrame=0;
    this.combatEpoch=globalThis.crypto?.randomUUID?.()||("world-"+Date.now());
    this.remoteCombatScope="";this.retiredCombatScopes=new Set();this.peerCombatProtocol=null;
    this.seenActionEvents=new Set();this.effectSequence=0;this.lastEffectsSentAt=0;this.lastCombatHealthAt=0;
    this.pendingVisualCombo=null;
    this._reliableDuetSource=null;this._reliableDuetLink=null;
    this._relayDuetSource=null;this._relayDuetHoldUntil=0;
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
    renderTravelDialog(null,null);
  }
  isConsentMode(){return this.enabled&&this.snapshot?.mode==='adventure';}
  requestTravel(game,destination){
    if(!this.isConsentMode()||!game?.roomId)return false;
    const key=game.roomId+'>'+destination;
    if(this._travelRequestKey===key||this._travelBusy||this.snapshot?.travel?.status==='pending')return false;
    this._travelRequestKey=key;this._travelGame=game;
    void post({action:'travel',roomId:this.roomId,identity:this.identity,
      decision:'propose',destination}).then(snapshot=>{
      if(snapshot&&(!this.snapshot||snapshot.revision>=this.snapshot.revision))this.snapshot=snapshot;
      this.syncTravel(game);
    }).catch(error=>{
      this._travelRequestKey='';
      game.nums?.add?.(game.player?.x||0,game.player?.y||0,error.message,'#f7ac9c');
    });
    return false;
  }
  async respondTravel(accept,voteId){
    if(this._travelBusy||!this.isConsentMode()||this.snapshot?.travel?.id!==voteId)return;
    this._travelBusy=true;
    try{
      const snapshot=await post({action:'travel',roomId:this.roomId,identity:this.identity,
        decision:accept?'accept':'reject',voteId});
      if(!this.snapshot||snapshot.revision>=this.snapshot.revision)this.snapshot=snapshot;
      this.syncTravel(this._travelGame);
    }catch(error){this.error=error.message;}
    finally{this._travelBusy=false;}
  }
  syncTravel(game){
    if(!this.isConsentMode()){renderTravelDialog(null,null);return;}
    this._travelGame=game||this._travelGame;
    const confirmed=this.snapshot?.lastTravel;
    if(confirmed?.id&&confirmed.id!==this._travelApplied){
      this._travelApplied=confirmed.id;
      this._travelRequestKey='';
      if(this._travelGame?.roomId===confirmed.from){
        try{this._travelGame.loadRoom?.(confirmed.to,'online-peer');}catch(_){}
      }
    }
    if(!this.snapshot?.travel)this._travelRequestKey='';
    renderTravelDialog(this.snapshot,this.identity?.playerId,
      id=>void this.respondTravel(true,id),id=>void this.respondTravel(false,id));
  }

  async start(game, definition) {
    const session = this.readSession();
    if (!session || !definition) return false;

    clearInterval(this.heartbeatTimer);this.heartbeatTimer=null;
    this.direct?.close();
    this.direct=null;
    this.directAttempted=false;
    this.lastDirectPoseAt=0;
    this.directConnectedAt=0;
    this.directRetryAt=0;
    this.directRetries=0;
    this.lastCombatSentAt=0;this.combatSequence=0;
    this.lastCombatReceivedAt=0;this.lastCombatFrame=0;
    this.combatEpoch=globalThis.crypto?.randomUUID?.()||("world-"+Date.now());
    this.remoteCombatScope="";this.retiredCombatScopes.clear();this.peerCombatProtocol=null;
    this.seenActionEvents.clear();this.effectSequence=0;this.lastEffectsSentAt=0;
    this.pendingVisualCombo=null;
    this._reliableDuetSource=null;this._reliableDuetLink=null;
    this._relayDuetSource=null;this._relayDuetHoldUntil=0;
    resetCombatMirror(game);game.coopPeerEffects=null;this._combatGame=game;
    game.coopRemoteEnemyBullets=[];
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
    this.seenHitEvents.clear();
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
    this.lastGameTick=performance.now();
    this.heartbeatTimer=setInterval(()=>this.networkHeartbeat(game),2500);
    this.heartbeatTimer?.unref?.();

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
    document.body.dataset.coopRoute=direct?(this.direct?.route||"unknown"):"server";
    document.body.dataset.coopTurnStatus=this.turnConfigStatus;
    const guest=this.currentPlayer(this.snapshot)?.slot===1;
    const synced=!guest||this.hasFreshCombat(this._combatGame||{});
    document.body.dataset.coopCombat=synced?"live":"waiting";
    if(direct&&this.direct?.directRttMs>0)document.body.dataset.coopRttDirect=String(Math.round(this.direct.directRttMs));
    else delete document.body.dataset.coopRttDirect;
    let text=state==="waiting-peer"?"ONLINE · ESPERANDO COMPAÑERO":
      state==="reconnecting"?"ONLINE · RECONECTANDO":
      state==="error"?"ONLINE · SESIÓN NO DISPONIBLE":"ONLINE · 2 JUGADORES";
    if(state==="connected")text+=direct?" · DIRECTO WEBRTC":" · SERVIDOR (CON RETRASO)";
    if(state==="connected"&&guest&&!synced)text+=" · COMBATE EN PAUSA";
    if(this.peerCombatProtocol!==null&&this.peerCombatProtocol!==COMBAT_PROTOCOL)text+=" · ACTUALIZA AMBOS JUEGOS";
    if(state==="connected"&&!direct&&this.directAttempted&&(!this.direct||["new","checking"].includes(this.direct.iceState)))
      text=text.replace("SERVIDOR (CON RETRASO)","CONECTANDO WEBRTC");
    if(direct&&this.direct?.route==="relay")text=text.replace("DIRECTO WEBRTC","WEBRTC · TURN");
    if(state==="connected"&&!direct&&this.direct?.iceState==="failed")text+=" · ICE FALLIDO"+(this.direct.iceServers.some(x=>String(x.urls).startsWith("turn"))?" · REVISAR TURN":" · TURN NECESARIO");
    if(this.turnConfigStatus==="unavailable"||this.turnConfigStatus==="rate-limited")text=text.replace("TURN NECESARIO","TURN TEMPORALMENTE NO DISPONIBLE");
    if(direct&&this.direct?.directRttMs>0)text+=" · "+(this.direct.route==="relay"?"TURN ":"P2P ")+Math.round(this.direct.directRttMs)+" ms";
    if(state==="connected"&&this.requestSamples>0){
      const ping=Math.max(0,Math.round(this.rttMs));
      const age=performance.now()-this.remote?.sampleAt;
      const quality=peerNetworkHealth(this.rttMs,Number.isFinite(age)?Math.max(0,age):0);
      text+=" · servidor "+ping+" ms";
      if(!direct&&(quality.quality==="late"||quality.quality==="lost"))text+=" · SEÑAL RETRASADA";
      else if(!direct&&quality.quality==="slow")text+=" · RED LENTA";
    }
    if(badge.textContent!==text)badge.textContent=text;
  }

  currentPlayer(snapshot) {
    return snapshot?.players?.find((player) => player.isYou) || null;
  }

  async setupDirect(game){
    if(this.directAttempted||!this.enabled||!this.remote?.playerId||!this.identity)return;
    this.directAttempted=true;
    const setupId=++this.directSetupId;
    this.turnConfigStatus="loading";
    this.directRetryAt=performance.now()+rtcReconnectDelay(this.directRetries);
    const roomId=this.roomId,identity=this.identity,peerId=this.remote.playerId;
    let iceServers=globalThis.OHANA_RTC_ICE_SERVERS;
    try {
      // Authenticated ephemeral TURN config. STUN remains available when unset.
      const config=await post({action:"rtc-config",roomId,identity},1800);
      if(Array.isArray(config?.iceServers)&&config.iceServers.length)iceServers=config.iceServers;
      if(setupId===this.directSetupId)this.turnConfigStatus=config?.status||"unavailable";
    } catch (error) {
      if(setupId===this.directSetupId)this.turnConfigStatus=error?.status===429?"rate-limited":"unavailable";
      // TURN is optional: do not disrupt the multiplayer HTTP fallback.
    }
    if(setupId!==this.directSetupId||!this.enabled||!this.directAttempted||this.roomId!==roomId||
       this.identity!==identity||this.remote?.playerId!==peerId)return;
    const me=this.currentPlayer(this.snapshot);
    this.direct=new DirectPeerLink({
      initiator:me?.slot===0,
      iceServers,
      relay:message=>void this.signal(game,"action",message),
      onPose:pose=>this.receiveDirectPose(pose),
      onEvent:event=>this.receiveDirectEvent(game,event),
      onState:connected=>{
        if(connected){
          this.directConnectedAt=performance.now();
          this.direct?.sendEvent("state",{state:"protocol",version:COMBAT_PROTOCOL});
        }
        this.showNetworkHealth();
      }
    });
    this.direct.onMetrics=()=>this.showNetworkHealth();
    this.direct.onRoute=()=>this.showNetworkHealth();
    this.direct.onIceStatus=({ice,turnConfigured})=>{
      if(typeof document==="undefined")return;
      document.body.dataset.coopIceState=ice;
      document.body.dataset.coopTurnConfigured=String(turnConfigured);
      this.showNetworkHealth();
    };
    if(this.direct.available)void this.direct.start();
    this.showNetworkHealth();
  }

  repairDirect(game,now=performance.now()){
    if(!this.enabled||!this.remote?.playerId||!this.direct?.available)return false;
    // Only slot 0 initiates offers. The guest preserves its answerer until the
    // new offer arrives, avoiding simultaneous teardown during slow signaling.
    if(!this.direct.initiator)return false;
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
    this.remote.pose={move:pose.move,vx:pose.vx,vy:pose.vy,grounded:pose.grounded,melee:pose.melee,dash:pose.dash};
    this.remote.facing=pose.facing;
    this.remote.evolution=pose.evo;
    this.remote.w=pose.w;this.remote.h=pose.h;
    this.remote.cloud=pose.cloud;this.remote.thrust=pose.thrust;this.remote.thrustFacing=pose.thrustFacing;
    this.lastDirectPoseAt=now;
    // A reconnected peer can send poses before its badge is refreshed by
    // another Netlify HTTP response. Restore DIRECT mode on the first packet.
    if(typeof document!=="undefined"&&document.body.dataset.coopTransport!=="direct")
      this.showNetworkHealth();
  }

  receiveDirectEvent(game,event){
    if(!this.enabled||!this.remote)return;
    if(event.kind==="room"){
      if(this.isConsentMode())return;
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
      this.applyPeerAction(game,event.payload);
    }else if(event.kind==="hit"){
      if(event.payload?.roomId===game.roomId)this.applySyncedHit(game,event.payload);
    }else if(event.kind==="combat"){
      this.receiveCombatFrame(game,event.payload);
    }else if(event.kind==="effects"){
      const frame=event.payload;
      const received=applyPeerEffects(game,frame);
      if(received)this.lastPeerEffectsAt=performance.now();
      // A queued SCTP send is NOT proof the other browser has displayed it.
      // Acknowledge only complete, validated, damage-free visual trios in the
      // current room/scope. Duplicates get an ack too if they were displayed.
      const state=game.coopPeerEffects;
      const trio=list=>Array.isArray(list)&&
        ["yarn","purr","wisp"].every(kind=>list.some(f=>f.kind===kind));
      const spark=list=>Array.isArray(list)&&
        ["chain","trail","storm"].every(kind=>list.some(f=>f.kind===kind));
      const valid=frame?.roomId===game.roomId&&state?.scope===frame.scope&&
        (trio(frame.michiFx)&&trio(state.michiFx)||
         spark(frame.chispinFx)&&spark(state.chispinFx));
      if(valid&&Number.isSafeInteger(frame.frameNo)&&frame.frameNo>0){
        this.direct?.sendEvent?.("state",{state:"fx-ack",
          scope:frame.scope,frameNo:frame.frameNo});
      }
    }else if(event.kind==="state"&&event.payload?.state==="fx-ack"){
      const ack=event.payload,pending=this.pendingVisualCombo;
      if(pending&&ack.scope===pending.scope&&
         ack.frameNo===pending.frame.frameNo&&
         pending.link===this.direct)this.pendingVisualCombo=null;
    }else if(event.kind==="state"&&event.payload?.state==="protocol"){
      this.peerCombatProtocol=Number.isInteger(event.payload.version)?event.payload.version:0;
    }else if(event.kind==="state"&&["won","lost"].includes(event.payload?.state)){
      // Server still handles the definitive state; direct feedback is visual only.
      this.remote.actionKind=event.payload.state;
    }
  }

  updateRemote(snapshot, game) {
    const you = this.currentPlayer(snapshot);
    const remote = snapshot?.players?.find((player) => !player.isYou && player.connected && player.characterId);
    if (!remote) {
      if(this.remote)this.resetDirectPeer();
      this.remote = null;
      return;
    }

    if(this.remote&&this.remote.playerId!==remote.playerId)this.resetDirectPeer();
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

  resetDirectPeer(){
    this.directSetupId++;
    this.direct?.close();this.direct=null;this.directAttempted=false;
    this.lastDirectPoseAt=0;this.directConnectedAt=0;this.directRetryAt=0;this.directRetries=0;
    this.pendingMutations=this.pendingMutations.filter(item=>item.payload?.action!=="rtc");
    this.lastCombatFrame=0;this.lastCombatReceivedAt=0;this.remoteCombatScope="";
    this.retiredCombatScopes.clear();this.peerCombatProtocol=null;
    this.pendingVisualCombo=null;
    if(this._combatGame){resetCombatMirror(this._combatGame);this._combatGame.coopPeerEffects=null;}
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
      this.syncTravel(game);
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
      if ((!this.isConsentMode()||this.snapshot?.lastTravel?.to===remoteWorld)&&shouldFollowPeerRoom(previousPeerRoom,remoteWorld,game.roomId,now,this.localRoomGraceUntil)) {
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
    clearInterval(this.heartbeatTimer);this.heartbeatTimer=null;
    this.enabled=false;
    renderTravelDialog(null,null);
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

  // 409 is not always a transient network failure. Replaying an already
  // rejected sequence can block newer signals and make recovery slower.
  classifyMutationError(error){
    const code=String(error?.code||"SERVER_UNAVAILABLE");
    if(typeof document!=="undefined")document.body.dataset.coopLastErrorCode=code.slice(0,48);
    if(code==="DUPLICATE_ACTION")return "drop";
    if(code==="NOT_READY"||code==="MATCH_STARTED")return "refresh";
    return "retry";
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
          const handling=this.classifyMutationError(error);
          if(handling==="drop"){
            // The server has already advanced beyond this sequence. The
            // rejected payload must not starve fresh movement and signaling.
            continue;
          }
          if(handling==="refresh"){
            // The game phase changed. Do not resend an invalid action.
            this.clearRetry();
            void this.poll(game,true);
            break;
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
    if(signalKind==="action"&&payload.action!=="rtc"){
      // Reuse this very same authenticated mutation as the reliable fallback
      // when a real U starts. Zero extra HTTP requests for ordinary casts.
      const duet=payload.action==="ability"&&payload.slot===3?game._familyDuet:null;
      if(duet){
        const start=captureFamilyDuetRelay(game,++this.effectSequence,this.combatEpoch);
        if(start){payload={...payload,duetStart:start};this._relayDuetSource=duet;}
      }
      payload={...payload,roomId:game.roomId||START_ROOM,syncId:makeActionId(this.identity.playerId,this.sequence+1)};
      this.direct?.sendEvent("action",payload);this.sendPeerEffects(game,true);
    }
    else if(signalKind==="room"||signalKind==="state")this.direct?.sendEvent(signalKind,payload);
    const sequence = ++this.sequence;
    if(signalKind==="hit"){
      payload={...payload,roomId:game.roomId||START_ROOM,syncId:makeActionId(this.identity.playerId,sequence)};
      this.direct?.sendEvent("hit",payload);
    }
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
      // The peer can publish SDP while our authenticated TURN lookup is pending.
      // Keep the event unseen so the next tick can process it after setup.
      if(rtc&&!this.direct)continue;
      if (!rtc && event.signalKind !== "room" && event.payload?.roomId !== game.roomId) continue;
      if (this.seenSignals.has(event.id)) continue;
      this.seenSignals.add(event.id);
      if (this.seenSignals.size > 128) this.seenSignals.delete(this.seenSignals.values().next().value);

      if(rtc){
        if(event.senderPlayerId!==this.remote?.playerId)continue;
        if(this.direct)void this.direct.signal(event.payload);
        continue;
      }
      if(event.signalKind==="combat"){
        if(event.senderSlot===0&&event.senderPlayerId===this.remote?.playerId)this.receiveCombatFrame(game,event.payload);
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
        if(this.isConsentMode())continue;
        const nextRoom = String(event.payload?.roomId || "");
        if (nextRoom && nextRoom !== game.roomId) {
          try { game.loadRoom(nextRoom, "online-peer"); } catch (_) {}
        }
        if (nextRoom) this.lastLocalWorld = nextRoom;
        this.remoteWorld = nextRoom || this.remoteWorld;
        continue;
      }

      if (event.signalKind === "action") {
        this.applyPeerAction(game,event.payload);
      }

      if (event.signalKind === "hit") {
        this.applySyncedHit(game, event.payload);
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

  applySyncedHit(game,payload){
    const id=typeof payload?.syncId==="string"?payload.syncId:"";
    if(id&&this.seenHitEvents.has(id))return;
    if(this.applyRemoteHit(game,payload)===false)return;
    if(id){
      this.seenHitEvents.add(id);
      if(this.seenHitEvents.size>192)this.seenHitEvents.delete(this.seenHitEvents.values().next().value);
    }
  }

  applyPeerAction(game,payload){
    if(!this.remote||!payload||!['attack','ability','dash'].includes(payload.action))return false;
    if(payload.roomId&&payload.roomId!==game.roomId)return false;
    if(payload.characterId&&payload.characterId!==this.remote.characterId)return false;
    const id=typeof payload.syncId==='string'?payload.syncId.slice(0,96):'';
    if(id&&this.seenActionEvents.has(id))return false;
    if(id){this.seenActionEvents.add(id);if(this.seenActionEvents.size>192)this.seenActionEvents.delete(this.seenActionEvents.values().next().value);}
    const action=payload.action;
    this.remote.actionKind=action;
    this.remote.abilitySlot=Number.isInteger(payload.slot)?Math.max(0,Math.min(5,payload.slot)):null;
    this.remote.actionUntil=performance.now()+(action==='ability'?420:action==='dash'?280:300);
    if(action==='dash')this.remote.dash=18;else this.remote.melee=action==='ability'?16:10;
    // Authenticated U echo: pure visual snapshot from the existing ability
    // event, validated exactly as direct snapshots. No remote damage.
    if(action==="ability"&&payload.slot===3&&payload.duetStart&&
       payload.characterId===this.remote.characterId&&
       payload.duetStart.familyDuet?.hero===this.remote.characterId&&
       payload.duetStart.familyDuet?.age<120&&
       applyPeerEffects(game,payload.duetStart)){
      this.lastPeerEffectsAt=performance.now();
      this._relayDuetHoldUntil=this.lastPeerEffectsAt+2100;
    }
    return true;
  }

  receiveCombatFrame(game,frame){
    if(this.currentPlayer(this.snapshot)?.slot!==1)return false;
    if(frame?.protocol!==COMBAT_PROTOCOL){this.peerCombatProtocol=0;return false;}
    if(frame.roomId!==game.roomId||!validCombatFrame(frame)||this.retiredCombatScopes.has(frame.scope))return false;
    if(this.remoteCombatScope===frame.scope&&frame.frameNo<=this.lastCombatFrame)return false;
    if(applyCombatFrame(game,frame)){
      if(this.remoteCombatScope&&this.remoteCombatScope!==frame.scope){
        this.retiredCombatScopes.add(this.remoteCombatScope);
        if(this.retiredCombatScopes.size>16)this.retiredCombatScopes.delete(this.retiredCombatScopes.values().next().value);
      }
      this.remoteCombatScope=frame.scope;this.peerCombatProtocol=COMBAT_PROTOCOL;
      this.lastCombatFrame=frame.frameNo;this.lastCombatReceivedAt=performance.now();return true;
    }
    return false;
  }

  sendPeerEffects(game,force=false){
    const now=performance.now();
    const duet=game._familyDuet||game._michiDuet||game._chispinDuet||game._stitchoDuet||game._kiloDuet;
    // Keep a bounded, validated, cosmetic-only J/K/L sample after a
    // transient reliable-channel rejection. An old epoch, room, peer link
    // or 2.5-second-old sample is discarded without touching combat state.
    const stale=p=>now-p.createdAt>2500||p.roomId!==game.roomId||
      p.scope!==this.combatEpoch||p.link!==this.direct;
    if(this.pendingVisualCombo&&stale(this.pendingVisualCombo))this.pendingVisualCombo=null;
    const fullCombo=frame=>{
      const has=(list,kinds)=>kinds.every(kind=>list?.some(f=>f?.kind===kind));
      return has(frame?.michiFx,['yarn','purr','wisp'])||
        has(frame?.chispinFx,['chain','trail','storm']);
    };
    if(force&&!this.pendingVisualCombo){
      const frame=capturePeerEffects(game,++this.effectSequence,this.combatEpoch);
      if(fullCombo(frame))this.pendingVisualCombo={
        frame,roomId:game.roomId,scope:this.combatEpoch,link:this.direct,createdAt:now
      };
    }
    if(!this.direct?.active||this.remoteWorld!==game.roomId){
      if(game._familyDuet&&this.enabled&&this.remoteWorld===game.roomId&&
         this._relayDuetSource!==game._familyDuet&&
         Number(game._familyDuet.age)<100&&this.snapshot?.phase!=="lobby"){
        this._relayDuetSource=game._familyDuet;
        void this.signal(game,"action",{action:"ability",slot:3,characterId:game.player?.id});
      }
      return false;
    }
    if(!force&&now-this.lastEffectsSentAt<200)return false;
    // A full J/K/L trio must be accepted by ordered SCTP, not only
    // the disposable pose lane. Retry at the existing game update tick.
    const saved=this.pendingVisualCombo;
    if(saved){
      const accepted=sendPeerEffectsWithReliableDuet(this.direct,saved.frame,true);
      // The existing 5 Hz budget applies to both successful and rejected
      // attempts: temporary SCTP congestion must never create a retry storm.
      this.lastEffectsSentAt=now;
      if(!accepted)return false;
      // Only the peer's explicit fx-ack clears the pending burst. A successful
      // local send may still be lost when the remote data channel reconnects.
      return true;
    }
    // Native U handshake and normal 5Hz FX retain their original behavior.
    const pendingDuet=!!duet&&(this._reliableDuetSource!==duet||this._reliableDuetLink!==this.direct);
    const frame=capturePeerEffects(game,++this.effectSequence,this.combatEpoch);
    const sent=sendPeerEffectsWithReliableDuet(this.direct,frame,force||pendingDuet,()=>{
      if(duet){this._reliableDuetSource=duet;this._reliableDuetLink=this.direct;}
    });
    if(sent)this.lastEffectsSentAt=now;
    return sent;
  }

  enemyTarget(game,enemy){
    if(!this.enabled||this.currentPlayer(this.snapshot)?.slot!==0||this.remoteWorld!==game.roomId||
      !this.remote||performance.now()-this.lastDirectPoseAt>=1200)return game.player;
    return sharedEnemyTarget(enemy,game.player,{...this.remote,w:this.remote.w||32,h:this.remote.h||48,dead:this.remote.health===0});
  }

  applyRemoteHit(game, payload) {
    if (!payload || !Array.isArray(game.enemies)) return false;
    const targetId = String(payload.targetId || "");
    const kind = String(payload.kind || "");
    const x = finite(payload.x, 0);
    const y = finite(payload.y, 0);
    const damage = Math.max(0, finite(payload.damage, 0));
    if (!damage || damage > 1000) return false;

    let target = Number.isSafeInteger(payload.targetSyncId)
      ?game.enemies.find(enemy=>enemy._coopSyncId===payload.targetSyncId&&enemy._coopVisit===payload.targetVisit&&!enemy.dying):null;
    if(Number.isSafeInteger(payload.targetSyncId)&&!target)return false;
    if(!target)target = targetId
      ? game.enemies.find((enemy) => enemy && enemy.id === targetId && !enemy.dying)
      : null;

    if (!target) target = game.enemies
      .filter((enemy) => enemy && enemy.hp > 0 && !enemy.dying)
      .filter((enemy) => !kind || enemy.kind === kind)
      .sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];

    if (!target || Math.hypot(target.x - x, target.y - y) > 180) return false;

    target.hp = Math.max(0, target.hp - damage);
    target.dying = Number(payload.dying) || target.dying || 0;
    target.invuln = Math.max(target.invuln || 0, 8);
    // Dino's authorized impulse is bounded and boss-limited at the host.
    // No metadata means the historical generic hit response for other heroes.
    const dinoImpact=payload.characterId==="dino"&&this.remote?.characterId==="dino"
      ?readDinoImpact(payload.dinoImpact):null;
    if(!dinoImpact)target.stun=Math.max(target.stun||0,8);
    else applyDinoImpact(target,dinoImpact);
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
    return true;
  }

  applyRemoteHurt(game, amount) {
    const player = game.player;
    if (!player || player.dead || player.invuln > 0) return;
    player.health = Math.max(0, player.health - amount);
    player.invuln = 24;
    player.flash = Math.max(player.flash || 0, 8);
  }

  advanceGuestCombat(game){
    if(this.hasFreshCombat(game))return advanceMirroredEnemies(game,performance.now()-this.lastCombatReceivedAt);
    return this.enabled&&this.currentPlayer(this.snapshot)?.slot===1;
  }

  hasFreshCombat(game){
    return this.enabled&&this.currentPlayer(this.snapshot)?.slot===1&&
      this.remoteWorld===game.roomId&&game._coopMirror&&
      performance.now()-this.lastCombatReceivedAt<750;
  }

  networkHeartbeat(game,now=performance.now()){
    if(!this.enabled||now-(this.lastGameTick||0)<2000)return false;
    // Keep the authenticated room alive while a hidden/paused view stops RAF.
    // Reuse paced poll; never advance physics or increase foreground requests.
    this.direct?.ping();void this.poll(game);
    if(typeof document==="undefined"||!document.hidden)this.repairDirect(game,now);
    return true;
  }

  tick(game) {
    if (!this.enabled) return;
    this.lastGameTick=performance.now();
    if(!this.directAttempted&&this.remote?.playerId)this.setupDirect(game);
    else this.repairDirect(game);
    this.direct?.sendPose(game);
    // Host's enemy motion and projectiles are visible to the guest at 5 Hz.
    // Zero extra Netlify requests; dropped frames never block gameplay.
    const combatNow=performance.now();
    if(this.currentPlayer(this.snapshot)?.slot===0&&this.remoteWorld===game.roomId&&
       combatNow-this.lastCombatSentAt>=(this.direct?.active?200:1000)&&this.snapshot?.phase!=="lobby"){
      const frame=captureCombatFrame(game,++this.combatSequence,this.combatEpoch);
      if(this.direct?.active){
        if(this.direct.sendLatest?.("combat",frame))this.lastCombatSentAt=combatNow;
      }else{
        this.lastCombatSentAt=combatNow;void this.signal(game,"combat",frame);
      }
    }
    this.sendPeerEffects(game);advancePeerEffects(game);
    // A one-shot authenticated U relay keeps the guest visible for the
    // actual 120-tick duet while RTC reconnects; ordinary FX still expire.
    if(performance.now()-(this.lastPeerEffectsAt||0)>750&&
       !(this._relayDuetHoldUntil>performance.now()&&game.coopPeerEffects?.familyDuet))
      game.coopPeerEffects=null;
    if(combatNow-this.lastCombatHealthAt>250){this.lastCombatHealthAt=combatNow;this.showNetworkHealth();}
    this.direct?.ping();
    void this.direct?.sampleRoute();
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
    const peerFx=game.coopPeerEffects;
    if(peerFx){
      if(peerFx.familyDuet&&this.remote?.characterId===peerFx.familyDuet.hero)drawFamilyDuet(ctx,peerFx.familyDuet,game.cam,t,drawCharacter,ROSTER,!!game.reduceMotion);
      if(this.remote?.characterId==="dino")drawDinoPeerEffects(ctx,peerFx.dinoFx,game.cam,t,!!game.reduceMotion);
      if(this.remote?.characterId==='cat'){drawMichiAbilityEcho(ctx,peerFx.michiFx,game.cam,t,{...this.remote,w:this.remote.w||24,h:this.remote.h||34});if(peerFx.michiDuet)drawMichiDuet(ctx,peerFx.michiDuet,game.cam,t,drawCharacter,ROSTER,!!game.reduceMotion);}
      if(this.remote?.characterId==='chispin')drawChispinAbilityEcho(ctx,peerFx.chispinFx,game.cam,t,this.remote);
      if(this.remote?.characterId==='chispin'&&peerFx.chispinDuet)drawChispinDuet(ctx,peerFx.chispinDuet,game.cam,t,drawCharacter,ROSTER,!!game.reduceMotion);
      if(this.remote?.characterId==='stitcho'&&peerFx.stitchoDuet)drawStitchoDuet(ctx,peerFx.stitchoDuet,game.cam,t,drawCharacter,ROSTER,!!game.reduceMotion);
      if(this.remote?.characterId==='kilo'){
        if(peerFx.kiloDuet)drawKiloDuet(ctx,peerFx.kiloDuet,game.cam,t,drawCharacter,ROSTER,!!game.reduceMotion);
        drawKiloAbilityEcho(ctx,peerFx.kiloFx,game.cam,t,{...this.remote,w:this.remote.w||24,h:this.remote.h||34});
      }
      for(const pr of peerFx.projectiles)drawProjectile(ctx,pr,game.cam,t);
      for(const slash of peerFx.slashes)drawSlash(ctx,slash,game.cam);
      for(const bolt of peerFx.bolts)drawBolt(ctx,bolt,game.cam,t);
    }
    if(this.hasFreshCombat(game)){
      for(const pr of game.coopRemoteEnemyBullets||[]){
        const vx=pr.x-(game.cam?.x||0),vy=pr.y-(game.cam?.y||0);
        if(vx>-200&&vx<(game.viewW||1280)+200&&vy>-200&&vy<(game.viewH||720)+200)
          drawProjectile(ctx,pr,game.cam,t);
      }
    }
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
      w: this.remote.w||form.w,
      h: this.remote.h||form.h,
      vx: this.remote.signalWeak ? 0 : finite(this.remote.pose?.vx, 0),
      vy: this.remote.signalWeak ? 0 : finite(this.remote.pose?.vy, 0),
      facing: this.remote.facing || 1,
      grounded: this.remote.grounded,
      evo,
      melee: this.remote.melee,
      dash: this.remote.dash,
      invuln: this.remote.invuln,
      _abilMove:this.remote.pose?.move||null,
      actionKind: this.remote.actionKind,
      abilitySlot: this.remote.abilitySlot,
      phase: this.remote.phase + t / 10,
      visualScale: 1,
      _familyDuetAge:peerFx?.familyDuet?.age||0,_familyDuetT:peerFx?.familyDuet?120-peerFx.familyDuet.age:0,
       _michiDuetAge:peerFx?.michiDuet?.age||0,_michiDuetT:peerFx?.michiDuet?120-peerFx.michiDuet.age:0,
      _chispinDuetAge:peerFx?.chispinDuet?.age||0,_chispinDuetT:peerFx?.chispinDuet?120-peerFx.chispinDuet.age:0,
      _stitchoDuetAge:peerFx?.stitchoDuet?.age||0,_stitchoDuetT:peerFx?.stitchoDuet?120-peerFx.stitchoDuet.age:0,
      _kiloDuetAge:peerFx?.kiloDuet?.age||0,_kiloDuetT:peerFx?.kiloDuet?120-peerFx.kiloDuet.age:0,
      _cloudActive:!!this.remote.cloud,_thrust:this.remote.thrust||0,_thrustFace:this.remote.thrustFacing||1,
    };
    ctx.save();
    if (this.remote.invuln > 0) ctx.globalAlpha = 0.72;
    if (this.remote.signalWeak) ctx.globalAlpha *= Math.max(.44, Math.min(1, this.remote.signalOpacity || 1));
    drawCharacter(ctx, player, game.cam, t, {reduceMotion:game.reduceMotion});
    drawChispinCloud(ctx,player,game.cam,t);
    ctx.globalAlpha = 1;
    const px = player.x + player.w / 2 - game.cam.x;
    const py = player.y + player.h * 0.45 - game.cam.y;
    if (this.remote.actionKind === "ability") {
      ctx.save();
      ctx.globalAlpha = Math.max(0, (this.remote.actionUntil - performance.now()) / 420);
      // Teammate's attack must carry character identity. This is a
      // cosmetic telegraph, never a second damage simulation.
      const hues={kilo:"#83dcff",stitcho:"#b8a5ff",chispin:"#fff187",
        cat:"#ffbe9d",dragon:"#ff926c",dino:"#7ee8a7",
        frita:"#ffcc73",pizza:"#ffa3b5",yomi:"#cbb2ff",cuerno:"#ff8de1"};
      const tone=hues[definition.id]||"#ffd36a";
      const slot=Math.max(0,Math.min(5,Number(this.remote.abilitySlot)||0));
      const originX=px+player.facing*(20+slot*7);
      const pulse=18+((t*4) % (15+slot*4));
      ctx.strokeStyle=tone;
      ctx.lineWidth=3+slot*.45;
      ctx.beginPath();
      ctx.arc(originX,py-12,pulse,-1.05,1.05);
      ctx.stroke();
      // Concentric pulse makes distant abilities legible on both displays.
      ctx.globalAlpha*=.55;
      ctx.beginPath();
      ctx.arc(originX,py-12,pulse+11+slot*2,-1.25,1.25);
      ctx.stroke();
      ctx.restore();
    }
    // V373: la constelación de Cuerno sube ~30 px sobre el cuerno; aparta nombre y vida.
    const cuernoLabelLift = (player.id || definition?.id) === "cuerno" ? 34 : 0;
    ctx.font = "700 11px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#e5fbff";
    ctx.strokeStyle = "rgba(4,8,16,.84)";
    ctx.lineWidth = 3;
    ctx.strokeText("J2 · " + (definition.name || "Jugador"), player.x + player.w / 2 - game.cam.x, player.y - 10 - cuernoLabelLift - game.cam.y);
    ctx.fillText("J" + ((this.remote.slot ?? 1) + 1) + " · " + (definition.name || "Jugador") + (this.remote.signalWeak ? " · SEÑAL RETRASADA" : ""), player.x + player.w / 2 - game.cam.x, player.y - 10 - cuernoLabelLift - game.cam.y);
    const hp = Math.max(0, finite(this.remote.health, this.remote.maxHealth || 1));
    const maxHp = Math.max(1, finite(this.remote.maxHealth, 1));
    const barW = 58;
    const barX = player.x + player.w / 2 - barW / 2 - game.cam.x;
    const barY = player.y - 23 - cuernoLabelLift - game.cam.y;
    ctx.fillStyle = "rgba(3,8,16,.78)";
    ctx.fillRect(barX, barY, barW, 5);
    ctx.fillStyle = hp / maxHp > .45 ? "#7ee7a7" : "#ff8b8b";
    ctx.fillRect(barX, barY, barW * Math.max(0, Math.min(1, hp / maxHp)), 5);
    ctx.restore();
  }
}

export const onlineCoop = new OnlineCoop();

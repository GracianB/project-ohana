import {findRoster} from '../../characters/roster.js';
import {adventureCamp,adventureRoleAllowed} from '../../multiplayer/adventure-roles.js';
import {mergeAdventureProgress} from '../../multiplayer/adventure-progress.js';
import {createVersus,advanceVersus,versusAction,setVersusInput,versusSnapshot} from './versus.mjs';
import {worldBounds} from "../../systems/world-bounds.js";
import {adjacentRoom,createTravelVote,castTravelVote,travelApproved,validDuelArena} from "../../multiplayer/match-rules-v604.js";
import { advanceCombat, createCombat, moveCombatPlayer, resolveCombatAction } from "./combat.mjs";
import { progressDuoRitual, duoPlateState, DUO_HOLD_MS } from "../../multiplayer/duo-altars.js";
import { isRtcCandidateSignal } from "../../systems/coop-v108-direct.js";
import { validCombatFrame } from "../../systems/coop-combat-mirror.js";

const ROOM_TTL_MS = 6 * 60 * 60 * 1000;
const MAX_RETRIES = 4;
const MOVE_MIN_INTERVAL_MS = 240;
const PLAYER_HEARTBEAT_MS = 4_000;
const PLAYER_STALE_MS = 15_000;
const ACTION_HISTORY_LIMIT = 128;
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export class RoomError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.name = "RoomError";
    this.code = code;
    this.status = status;
  }
}

export function makeRoomCode(random = Math.random) {
  let code = "";
  for (let i = 0; i < 6; i++) code += CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)];
  return code;
}

export function makeCredential(randomBytes = (size) => crypto.getRandomValues(new Uint8Array(size))) {
  const bytes = randomBytes(24);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function snapshot(room, viewerId) {
  return {
    roomId: room.code,
    phase: room.phase,
    revision: room.revision,
    tick: room.tick,
    players: room.players.map((player) => ({
      playerId: player.id,
      slot: player.slot,
      characterId: player.characterId,
      homeCharacterId:player.homeCharacterId||player.characterId,
      roleEpoch:player.roleEpoch||0,
      x: player.x,
      y: player.y,
      facing: player.facing,
      lastSequence: player.lastSequence,
      connected: player.connected,
      ready: !!player.ready,
      evolution: player.evolution ?? null,
      experience: player.experience ?? 0,
      combo: player.combo ?? 0,
      isYou: player.id === viewerId,
      health: player.health ?? null,
      maxHealth: player.maxHealth ?? null,
      dodgeUntil: player.dodgeUntil ?? 0,
      name: player.slot === 0 ? "Jugador 1" : "Jugador 2",
      worldRoomId: player.worldRoomId || "beach",
      pose: structuredClone(player.pose || { vx: 0, vy: 0, grounded: true, melee: 0, dash: 0 }),
    })),
    combat: room.combat ? structuredClone(room.combat) : null,
    engineMode: !!room.engineMode,
    mode: room.mode || 'classic',
    arenaId:room.arenaId||null,
    versus:versusSnapshot(room),
    adventureProgress:room.mode==='adventure'?structuredClone(room.adventureProgress||null):null,
    travel: room.mode==='adventure'?structuredClone(room.travel||null):null,
    lastTravel: room.mode==='adventure'?structuredClone(room.lastTravel||null):null,
    travelClosed: room.mode==='adventure'?structuredClone(room.travelClosed||null):null,
    duoAltars: structuredClone(room.duoAltars || {}),
    duoCharge: room.duoChannel ? { roomId:room.duoChannel.roomId, startedAt:room.duoChannel.startedAt, durationMs:DUO_HOLD_MS } : null,
    updatedAt: room.updatedAt,
  };
}

// Respect legitimate zero values, including the death state and the left edge.
// Using Number(value)||fallback resurrects players and snaps x=0 back to spawn.
function finitePayloadNumber(value,fallback,min,max){
  if(value==null||!Number.isFinite(Number(value)))return fallback;
  return Math.min(max,Math.max(min,Number(value)));
}

function validateCharacter(characterId) {
  const allowed = new Set(["kilo", "stitcho", "chispin", "cat", "dragon", "dino", "frita", "pizza", "yomi", "cuerno"]);
  if (!allowed.has(characterId)) throw new RoomError("INVALID_CHARACTER", "Elige un personaje de OHANA.");
}

function hasAction(player, actionId) {
  return player.actions.some((entry) => typeof entry === "string" ? entry === actionId : entry?.id === actionId);
}

// A vote belongs to two live connection epochs. If either peer goes away,
 // a stale approval must never carry over to their resumed session.
function closePendingTravel(room, reason, at) {
  if (room.mode !== 'adventure' || room.travel?.status !== 'pending') return false;
  room.travelClosed = { id: room.travel.id, reason, at };
  room.travel = null;
  return true;
}

function expireStalePlayers(room, now) {
  let changed = false;
  for (const player of room.players) {
    const lastSeen = Number(player.lastSeenAt ?? player.lastMoveAt ?? room.updatedAt ?? 0);
    if (player.connected && now - lastSeen > PLAYER_STALE_MS) {
      player.connected = false;
      changed = true;
    }
  }
  if (changed) closePendingTravel(room, 'disconnected', now);
  if (changed && room.phase === "playing") {
    room.phase = "lobby";
    if (room.combat && room.combat.pausedAt == null) room.combat.pausedAt = now;
    room.duoChannel = null;
  }
  return changed;
}

function resumeCombat(room, now) {
  const combat = room.combat;
  if (!combat || combat.pausedAt == null) return;
  const pausedFor = Math.max(0, now - combat.pausedAt);
  const shift = (object, key) => {
    if (Number.isFinite(object?.[key]) && object[key] > 0) object[key] += pausedFor;
  };
  shift(combat.scene, "startedAt");
  shift(combat.campaign, "stageStartedAt");
  for (const enemy of combat.enemies || []) {
    shift(enemy, "nextAttackAt");
    shift(enemy, "modeUntil");
  }
  shift(combat.boss, "attackAt");
  shift(combat.boss, "modeUntil");
  shift(combat, "lastTeamHitAt");
  for (const player of room.players) {
    shift(player, "lastComboAt");
    for (const ability of Object.keys(player.cooldowns || {})) shift(player.cooldowns, ability);
  }
  combat.pausedAt = null;
}

export function createRoomService(store, options = {}) {
  const now = options.now || Date.now;
  const code = options.makeCode || makeRoomCode;
  const credential = options.makeCredential || makeCredential;

  async function read(codeValue) {
    const codeKey = String(codeValue || "").toUpperCase();
    if (!/^[A-HJ-NP-Z2-9]{6}$/.test(codeKey)) throw new RoomError("INVALID_CODE", "El código debe tener seis caracteres.");
    const entry = await store.getWithMetadata(`room:${codeKey}`, { type: "json", consistency: "strong" });
    if (!entry?.data) throw new RoomError("ROOM_NOT_FOUND", "No encontramos esa sala. Revisa el código.", 404);
    if (now() - entry.data.updatedAt > ROOM_TTL_MS) throw new RoomError("ROOM_EXPIRED", "Esta sala ha caducado.", 410);
    return { room: entry.data, etag: entry.etag, key: `room:${codeKey}` };
  }

  async function mutate(codeValue, transform) {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const current = await read(codeValue);
      const next = structuredClone(current.room);
      const before = JSON.stringify(next);
      const timestamp = now();
      expireStalePlayers(next, timestamp);
      if(next.mode==='versus')advanceVersus(next,timestamp);
      else if (!next.engineMode) advanceCombat(next, timestamp);
      const result = transform(next);
      if (JSON.stringify(next) === before) return { room: current.room, result };
      next.revision += 1;
      next.tick += 1;
      next.updatedAt = now();
      const write = await store.setJSON(current.key, next, { onlyIfMatch: current.etag });
      if (write.modified) return { room: next, result };
      if (attempt < MAX_RETRIES - 1) {
        const backoff = Math.min(120, 18 * (2 ** attempt) + Math.random() * 28);
        await new Promise((resolve) => setTimeout(resolve, backoff));
      }
    }
    throw new RoomError("ROOM_BUSY", "La sala está recibiendo muchas acciones. Inténtalo otra vez.", 409);
  }

  function playerFrom(room, identity) {
    const player = room.players.find((entry) => entry.id === identity?.playerId);
    if (!player || !identity?.token || player.token !== identity.token) {
      throw new RoomError("INVALID_SESSION", "La sesión no es válida. Vuelve a entrar en la sala.", 401);
    }
    // A co-op connection epoch is mandatory, not merely advisory: old tabs
    // must not impersonate a player after their session was resumed.
    if ((['adventure','versus'].includes(room.mode) && (!Number.isSafeInteger(identity?.connectionEpoch) ||
        identity.connectionEpoch !== player.connectionEpoch)) ||
        (identity.connectionEpoch !== undefined && Number(identity.connectionEpoch) !== Number(player.connectionEpoch))) {
      throw new RoomError("STALE_SESSION", "Esta sesión se reanudó en otra pestaña o dispositivo.", 409);
    }
    return player;
  }

  return {
    async create(mode = 'classic', arenaId='w1-kilo') {
      if(!['classic','adventure','versus'].includes(mode))throw new RoomError('MODE_NOT_READY','Ese modo todavía no está disponible.',409);
      if(mode==='versus'&&!validDuelArena(arenaId))throw new RoomError('DUEL_ARENA_INVALID','Elige una de las diez salas.',400);
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        const roomCode = code();
        const room = {
          code: roomCode,
          phase: "lobby",
          mode,
          arenaId:mode==='versus'?arenaId:null,
          revision: 0,
          tick: 0,
          createdAt: now(),
          updatedAt: now(),
          players: [{ id: crypto.randomUUID(), token: credential(), connectionEpoch: 1, slot: 0, characterId: "", ready: false, x: 420, y: 1070, facing: 1, connected: true, lastSequence: 0, lastMoveAt: now(), lastSeenAt: now(), dodgeUntil: 0, pose: { vx: 0, vy: 0, grounded: true, melee: 0, dash: 0 }, worldRoomId: mode==='adventure'?"w1-kilo":"hub", actions: [] }],
        };
        const write = await store.setJSON(`room:${roomCode}`, room, { onlyIfNew: true });
        if (write.modified) return { ...snapshot(room, room.players[0].id), identity: { playerId: room.players[0].id, token: room.players[0].token, connectionEpoch: 1 } };
      }
      throw new RoomError("ROOM_BUSY", "No se pudo crear una sala ahora. Inténtalo otra vez.", 503);
    },

    async join(roomCode, resumeIdentity) {
      const identity = resumeIdentity && typeof resumeIdentity.playerId === "string" && typeof resumeIdentity.token === "string"
        ? { playerId: resumeIdentity.playerId, token: resumeIdentity.token }
        : { playerId: "", token: "" };
      const { room } = await mutate(roomCode, (state) => {
        const resume = state.players.find((player) => player.id === identity.playerId && player.token === identity.token);
        if (resume) {
          // Rejoining supersedes a previous tab's travel approval.
          closePendingTravel(state, 'reconnected', now());
          // The resumed browser receives a fresh bearer token. The previous
          // tab's credentials cannot simply omit connectionEpoch to return.
          if (['adventure','versus'].includes(state.mode)) resume.token = credential();
          resume.connectionEpoch = (resume.connectionEpoch || 0) + 1;
          resume.connected = true;
          resume.lastMoveAt = now();
          resume.lastSeenAt = now();
        } else {
          if (identity.playerId) throw new RoomError("INVALID_SESSION", "La sesión no se puede reanudar.", 401);
          if (state.players.length >= 2) throw new RoomError("ROOM_FULL", "La sala ya tiene dos jugadores.", 409);
          identity.playerId = crypto.randomUUID();
          identity.token = credential();
          state.players.push({ id: identity.playerId, token: identity.token, connectionEpoch: 1, slot: 1, characterId: "", ready: false, x: 880, y: 572, facing: -1, connected: true, lastSequence: 0, lastMoveAt: now(), lastSeenAt: now(), dodgeUntil: 0, worldRoomId: state.mode==='adventure'?"w1-kilo":"hub", actions: [] });
        }
        if (state.players.length === 2 && state.players.every((player) => player.connected && player.characterId && player.ready)) {
          // V102: reconnecting must never reset both avatars back to the start.
          // Spawn only before the very first combat initialization. In engine mode
          // the original OHANA ten-room world retains its real world positions.
          const firstStart = !state.combat && !state.versus && !state.engineMode;
          resumeCombat(state, now());
          state.phase = "playing";
          if (firstStart) for (const entry of state.players) {
            entry.worldRoomId = entry.worldRoomId || "hub";
            entry.x = entry.slot === 0 ? 420 : 550;
            entry.y = 1070;
            entry.facing = entry.slot === 0 ? 1 : -1;
            entry.pose = { vx: 0, vy: 0, grounded: true, melee: 0, dash: 0 };
          }
          if(state.mode==='versus'){if(!state.versus)createVersus(state,state.arenaId,now());if(state.versus.phase==='complete')state.phase='complete';}
          else state.combat ||= createCombat(state.players, now());
        }
      });
      const joined = room.players.find((player) => player.id === identity.playerId);
      if (!joined) {
        // mutate persists only successful transforms; throw before a room is claimed by a third participant.
        throw new RoomError("ROOM_FULL", "La sala ya tiene dos jugadores.", 409);
      }
      identity.token = joined.token;
      identity.connectionEpoch = joined.connectionEpoch;
      return { ...snapshot(room, joined.id), identity };
    },

    async choose(roomCode, identity, characterId) {
      validateCharacter(characterId);
      const { room } = await mutate(roomCode, (state) => {
        const player = playerFrom(state, identity);
        if (!player.connected) throw new RoomError("DISCONNECTED", "Reconecta la sesión antes de elegir.", 409);
        if (state.phase !== "lobby") throw new RoomError("MATCH_STARTED", "No se puede cambiar de personaje una vez iniciada la misión.", 409);
        player.characterId = characterId;
        if(state.mode==='adventure')player.homeCharacterId=characterId;
        player.ready = false;
        player.lastSeenAt = now();
      });
      return snapshot(room, identity.playerId);
    },

    async role(roomCode,identity,characterId,roleEpoch=0){
      validateCharacter(characterId);
      const {room}=await mutate(roomCode,state=>{
        const player=playerFrom(state,identity),time=now();
        if(state.mode!=='adventure')throw new RoomError('MODE_REQUIRED','El relevo es exclusivo de Aventura.',409);
        if(state.phase!=='playing'||state.players.some(p=>!p.connected))throw new RoomError('TEAM_NOT_READY','Los dos compañeros deben estar conectados.',409);
        if(!adventureRoleAllowed(player,player.worldRoomId,characterId))throw new RoomError('ROLE_INVALID','Elige al héroe de la sala o vuelve a tu personaje.',400);
        if(player.characterId===characterId)return;
        if(!Number.isSafeInteger(roleEpoch)||roleEpoch!==(player.roleEpoch||0))throw new RoomError('ROLE_CHANGED','El relevo ya cambió; actualiza la sala.',409);
        if(player.health!=null&&player.health<=0)throw new RoomError('ROLE_UNAVAILABLE','Espera a recuperarte antes del relevo.',409);
        if(player.pose?.grounded===false||!adventureCamp(player.worldRoomId,player.x,player.y,state.adventureProgress))throw new RoomError('CAMP_REQUIRED','Vuelve a la entrada o a un objetivo completado para cambiar.',409);
        if(time-(player.lastRoleAt||0)<1200)throw new RoomError('ROLE_COOLDOWN','Espera un momento antes de otro relevo.',409);
        const previous=findRoster(player.characterId).forms[Math.max(0,Math.min(4,player.evolution||0))];
        player.roleStates||={};player.roleStates[player.characterId]={evolution:player.evolution||0,experience:player.experience||0,health:player.health??previous.hp};
        const saved=player.roleStates[characterId]||{evolution:0,experience:0,health:findRoster(characterId).forms[0].hp};
        const form=findRoster(characterId).forms[saved.evolution];
        Object.assign(player,saved,{characterId,maxHealth:form.hp,health:Math.min(form.hp,saved.health),roleEpoch:(player.roleEpoch||0)+1,lastRoleAt:time,lastSeenAt:time});
      });return snapshot(room,identity.playerId);
    },

    async ready(roomCode, identity, requestedReady = true) {
      if (typeof requestedReady !== "boolean") throw new RoomError("INVALID_READY_STATE", "El estado de preparación no es válido.");
      const { room } = await mutate(roomCode, (state) => {
        const player = playerFrom(state, identity);
        if (!player.connected) throw new RoomError("DISCONNECTED", "Reconecta la sesión antes de prepararte.", 409);
        if (state.phase !== "lobby") throw new RoomError("MATCH_STARTED", "La misión ya ha empezado.", 409);
        if (!player.characterId) throw new RoomError("CHARACTER_REQUIRED", "Elige primero un personaje.");
        player.ready = requestedReady;
        player.lastSeenAt = now();
        if (state.players.length === 2 && state.players.every((entry) => entry.connected && entry.characterId && entry.ready)) {
          state.phase = "playing";
          for (const entry of state.players) entry.worldRoomId = entry.worldRoomId || "hub";
          if(state.mode==='versus'){if(!state.versus)createVersus(state,state.arenaId,now());if(state.versus.phase==='complete')state.phase='complete';}
          else state.combat ||= createCombat(state.players, now());
        }
      });
      return snapshot(room, identity.playerId);
    },

    async move(roomCode, identity, payload) {
      const seq = Number(payload?.sequence);
      if (!Number.isSafeInteger(seq) || seq < 1) throw new RoomError("INVALID_SEQUENCE", "La acción de movimiento no es válida.");
      const actionId = String(payload?.actionId || `${identity?.playerId || "player"}:${seq}`);
      if (actionId.length > 96) throw new RoomError("INVALID_ACTION_ID", "La acción de movimiento no es válida.");
      const engineMode = payload?.mode === "engine";
      const { room, result } = await mutate(roomCode, (state) => {
        const player = playerFrom(state, identity);
        if (!player.connected) throw new RoomError("DISCONNECTED", "Reconecta la sesión antes de moverte.", 409);
        const previous = player.actions.find((entry) => typeof entry === "object" && entry?.id === actionId);
        if (previous) {
          if (previous.sequence !== seq) throw new RoomError("DUPLICATE_ACTION", "El identificador ya pertenece a otra acción.", 409);
          return { accepted: !!previous.result?.accepted, cinematic: !!previous.result?.cinematic, replayed: true };
        }
        if (hasAction(player, actionId)) return { accepted: true, cinematic: false, replayed: true };
        if (seq <= player.lastSequence) throw new RoomError("DUPLICATE_ACTION", "Esta acción ya se recibió.", 409);
        if(state.mode==='versus'&&state.versus?.phase==='complete')return {accepted:false,cinematic:false,finished:true};
        if (state.phase !== "playing") throw new RoomError("NOT_READY", "La misión ya no está en curso.", 409);
        const currentTime = now();

        if(state.mode==='versus'){
          if(engineMode)throw new RoomError('AUTHORITATIVE_CONTROLS_REQUIRED','Esta arena recibe controles, no posiciones ni estadísticas.',409);
          setVersusInput(state,player,payload,currentTime);player.lastSequence=seq;player.lastSeenAt=currentTime;
          const moveResult={accepted:true,cinematic:false};player.actions=[...player.actions.slice(-(ACTION_HISTORY_LIMIT-1)),{id:actionId,sequence:seq,result:moveResult}];return{...moveResult,replayed:false};
        }
        if (engineMode) {
          state.engineMode = true;
          if (state.combat) {
            state.combat.scene = null;
            state.combat.enemies = [];
            state.combat.boss = null;
          }
          const selectedRoom=String(payload?.worldRoomId||player.worldRoomId||'beach');
          // The authenticated travel vote owns rooms in V604 adventure. A
          // forged position packet cannot teleport one player to another world.
          if(state.mode==='adventure'&&selectedRoom!==player.worldRoomId)
            throw new RoomError('TRAVEL_CONSENT_REQUIRED','Los dos jugadores deben aceptar el cambio de sala.',409);
          if(state.mode==='adventure'&&(player.roleEpoch||0)>0&&(payload.characterId!==player.characterId||payload.roleEpoch!==player.roleEpoch))throw new RoomError('ROLE_CHANGED','El personaje ha cambiado; actualiza los controles.',409);
          const bounds=worldBounds(selectedRoom)||worldBounds("beach");
          player.x = finitePayloadNumber(payload?.positionX,player.x,0,bounds.width);
          player.y = finitePayloadNumber(payload?.positionY,player.y,0,bounds.height);
          player.facing = Number(payload?.facing) < 0 ? -1 : 1;
          player.evolution = Math.max(0, Math.min(4, Math.floor(Number(payload?.evolution) || 0)));
          player.experience = Math.max(0, Number(payload?.experience) || 0);
          player.health = finitePayloadNumber(payload?.health,player.health??0,0,100000);
          player.maxHealth = finitePayloadNumber(payload?.maxHealth,player.maxHealth??1,1,100000);
          player.worldRoomId = String(payload?.worldRoomId || player.worldRoomId || "beach");
          if(state.mode==='adventure'&&payload.adventureProgress)state.adventureProgress=mergeAdventureProgress(state.adventureProgress,payload.adventureProgress,{roomId:selectedRoom,host:player.slot===0});
          player.pose = {
            vx: Math.max(-40, Math.min(40, Number(payload?.velocityX) || 0)),
            vy: Math.max(-60, Math.min(60, Number(payload?.velocityY) || 0)),
            grounded: payload?.grounded !== false,
            melee: Math.max(0, Math.min(30, Number(payload?.melee) || 0)),
            dash: Math.max(0, Math.min(30, Number(payload?.dash) || 0)),
          };
          player.lastSequence = seq;
          player.lastSeenAt = currentTime;
          // Leaving either plate breaks the continuous hold immediately.
          if (state.duoChannel && !duoPlateState(state.players,state.duoChannel.roomId,currentTime)?.ready) state.duoChannel=null;
          const moveResult = { accepted: true, cinematic: false };
          player.actions = [...player.actions.slice(-(ACTION_HISTORY_LIMIT - 1)), { id: actionId, sequence: seq, result: moveResult }];
          return { ...moveResult, replayed: false };
        }

        let x = Math.max(-1, Math.min(1, Number(payload?.x) || 0));
        let y = Math.max(-1, Math.min(1, Number(payload?.y) || 0));
        const directionLength = Math.hypot(x, y) || 1;
        x /= directionLength;
        y /= directionLength;
        if (currentTime - player.lastMoveAt < MOVE_MIN_INTERVAL_MS) return { accepted: false, throttled: true };
        const moved = moveCombatPlayer(state, player, x, y, currentTime);
        if (!moved) return { accepted: false, cinematic: true };
        player.lastSequence = seq;
        player.lastSeenAt = currentTime;
        const moveResult = { accepted: true, cinematic: false };
        player.actions = [...player.actions.slice(-(ACTION_HISTORY_LIMIT - 1)), { id: actionId, sequence: seq, result: moveResult }];
        return { ...moveResult, replayed: false };
      });
      return { ...snapshot(room, identity.playerId), accepted: result.accepted, cinematic: !!result.cinematic, replayed: !!result.replayed };
    },

    async action(roomCode, identity, payload, kind) {
      const seq = Number(payload?.sequence);
      if (!Number.isSafeInteger(seq) || seq < 1) throw new RoomError("INVALID_SEQUENCE", "La acción no es válida.");
      const actionId = String(payload?.actionId || "");
      if (!actionId || actionId.length > 96) throw new RoomError("INVALID_ACTION_ID", "La acción no es válida.");
      const { room, result } = await mutate(roomCode, (state) => {
        const player = playerFrom(state, identity);
        if (!player.connected) throw new RoomError("DISCONNECTED", "Reconecta la sesión antes de actuar.", 409);
        const previous = player.actions.find((entry) => typeof entry === "object" && entry?.id === actionId);
        if (previous) {
          if (previous.sequence !== seq) throw new RoomError("DUPLICATE_ACTION", "El identificador ya pertenece a otra acción.", 409);
          return { result: previous.result, replayed: true };
        }
        if (seq <= player.lastSequence || hasAction(player, actionId)) throw new RoomError("DUPLICATE_ACTION", "Esta acción ya se recibió.", 409);
        if(state.mode==='versus'&&state.versus?.phase==='complete')return {result:{accepted:false,finished:true},replayed:false};
        if (state.phase !== "playing") throw new RoomError("NOT_READY", "La misión ya no está en curso.", 409);
        player.lastSequence = seq;
        if(state.mode==='versus')setVersusInput(state,player,payload,now());
        const result = state.mode==='versus'?versusAction(state,player,kind,payload.slot):resolveCombatAction(state, player, { kind, slot: payload.slot }, now());
        player.lastSeenAt = now();
        if (result.accepted && state.combat?.events) {
          const actionEvent = state.combat.events.find((event) => event.id === result.eventId);
          if (actionEvent) Object.assign(actionEvent, {
            actionId,
            playerSlot: player.slot,
            actionKind: kind,
            abilitySlot: kind === "ability" ? Number(payload.slot) : null,
            abilityId: result.abilityId || null,
            targetId: result.target || null,
            damage: result.damage || 0,
            breakBonus: !!result.breakBonus,
          });
        }
        player.actions = [...player.actions.slice(-(ACTION_HISTORY_LIMIT - 1)), { id: actionId, sequence: seq, result }];
        return { result, replayed: false };
      });
      return { ...snapshot(room, identity.playerId), actionResult: result.result, replayed: result.replayed };
    },

    async travel(roomCode,identity,payload){
      const decision=String(payload?.decision||'');
      const destination=String(payload?.destination||'');
      const requestedId=String(payload?.voteId||'');
      const {room}=await mutate(roomCode,state=>{
        const player=playerFrom(state,identity);
        if(state.mode!=='adventure')throw new RoomError('MODE_REQUIRED','La votación es exclusiva de la aventura conjunta.',409);
        if(state.phase!=='playing'||state.players.length!==2||state.players.some(p=>!p.connected))
          throw new RoomError('TEAM_NOT_READY','Los dos compañeros deben estar conectados.',409);
        if(state.travel?.status==='pending'&&now()>=state.travel.createdAt+25000){
          state.travelClosed={id:state.travel.id,reason:'expired',at:now()};
          state.travel=null;
          // Persist the expired vote even if a delayed acceptance arrives.
          // Throwing here would abort the CAS transaction and restore it.
          if(decision!=='propose'){player.lastSeenAt=now();return;}
        }
        if(decision==='propose'){
          const from=String(player.worldRoomId||'');
          if(!adjacentRoom(from,destination))throw new RoomError('TRAVEL_DESTINATION_INVALID','Solo puedes avanzar a una sala adyacente.',400);
          if(state.players.some(p=>p.worldRoomId!==from))
            throw new RoomError('TEAM_ROOM_MISMATCH','Los compañeros deben estar en la misma sala.',409);
          if(state.travel?.status==='pending'){
            if(state.travel.from===from&&state.travel.to===destination)return;
            throw new RoomError('TRAVEL_ALREADY_PENDING','Hay una propuesta pendiente de respuesta.',409);
          }
          state.travel=createTravelVote({id:'travel:'+crypto.randomUUID(),from,to:destination,
            by:player.id,players:state.players.map(p=>p.id),now:now()});
        }else if(decision==='accept'||decision==='reject'){
          if(!state.travel||state.travel.id!==requestedId)throw new RoomError('TRAVEL_STALE','Esta propuesta ya no está disponible.',409);
          const voted=castTravelVote(state.travel,player.id,decision==='accept',now());
          if(voted.status==='approved'){
            if(!travelApproved(voted,voted.from,state.players.map(p=>p.id)))
              throw new RoomError('TRAVEL_INVALID','Falta la confirmación de un compañero.',409);
            if(state.players.some(p=>p.worldRoomId!==voted.from))
              throw new RoomError('TEAM_ROOM_MISMATCH','La partida cambió antes de confirmar.',409);
            for(const member of state.players){member.worldRoomId=voted.to;member.x=member.slot===0?420:550;member.y=1070;}
            state.lastTravel={id:voted.id,from:voted.from,to:voted.to,at:now()};
            state.travel=null;
            state.travelClosed=null;
          }else if(['rejected','expired'].includes(voted.status)){
            state.travelClosed={id:voted.id,reason:voted.status,at:now()};
            state.travel=null;
          }else state.travel=voted;
        }else throw new RoomError('TRAVEL_DECISION_INVALID','Acción de desplazamiento inválida.',400);
        player.lastSeenAt=now();
      });
      return snapshot(room,identity.playerId);
    },

    async signal(roomCode, identity, payload) {
      const seq = Number(payload?.sequence);
      if (!Number.isSafeInteger(seq) || seq < 1) throw new RoomError("INVALID_SEQUENCE", "La señal no es válida.");
      const actionId = String(payload?.actionId || "");
      const signalKind = String(payload?.signalKind || "");
      const permittedKinds=new Set(["action","hit","hurt","orb","room","state","duo","combat"]);
      const relayPayload=payload?.payload;
      const payloadBytes=JSON.stringify(relayPayload??{}).length;
      // V110: allow a larger payload only for structurally valid RTC SDP
      // fragments. Ordinary game action signals keep their original limit.
      const rtcFragment=signalKind==="action"&&relayPayload?.action==="rtc"&&
        ["offer","answer"].includes(relayPayload?.kind)&&
        typeof relayPayload?.sid==="string"&&/^[A-Za-z0-9._:-]{5,80}$/.test(relayPayload.sid)&&
        Number.isInteger(relayPayload?.part)&&Number.isInteger(relayPayload?.total)&&
        relayPayload.total>=1&&relayPayload.total<=4&&
        relayPayload.part>=0&&relayPayload.part<relayPayload.total&&
        typeof relayPayload?.data==="string"&&relayPayload.data.length>0&&
        relayPayload.data.length<=12000;
      const combat=signalKind==="combat"&&relayPayload?.protocol===2&&validCombatFrame(relayPayload);
      const maxSignalBytes=rtcFragment?12400:combat?11200:1800;
      const rtcCandidates=signalKind==="action"&&isRtcCandidateSignal(relayPayload);
      if(!actionId||actionId.length>96||!permittedKinds.has(signalKind)||payloadBytes>maxSignalBytes||
        (relayPayload?.action==="rtc"&&!rtcFragment&&!rtcCandidates)||(signalKind==="combat"&&!combat)){
        throw new RoomError("INVALID_SIGNAL","Señal inválida o demasiado grande.");
      }
      const { room } = await mutate(roomCode, (state) => {
        const player = playerFrom(state, identity);
        if(state.mode==='versus')throw new RoomError('AUTHORITATIVE_CONTROLS_REQUIRED','La arena resuelve el combate en el servidor.',409);
        if (!player.connected) throw new RoomError("DISCONNECTED", "Reconecta la sesión antes de enviar señales.", 409);
        if(signalKind==="combat"&&player.slot!==0)throw new RoomError("HOST_ONLY","Solo el anfitrión publica enemigos.",403);
        if(state.mode==='adventure'&&signalKind==='room'&&String(relayPayload?.roomId||'')!==player.worldRoomId)
          throw new RoomError('TRAVEL_CONSENT_REQUIRED','El cambio de sala necesita dos confirmaciones.',409);
        const previous = player.actions.find((entry) => typeof entry === "object" && entry?.id === actionId);
        if (previous) return;
        if (seq <= player.lastSequence || hasAction(player, actionId)) {
          throw new RoomError("DUPLICATE_ACTION", "Esta señal ya se recibió.", 409);
        }
        if (state.phase !== "playing") throw new RoomError("NOT_READY", "La misión ya no está en curso.", 409);

        state.engineMode = true;
        if (state.combat) {
          state.combat.scene = null;
          state.combat.enemies = [];
          state.combat.boss = null;
          const requestedRoom = String(payload?.payload?.roomId || "");
          // Server-owned puzzle: both real positions, one on each pad, same room.
          // Other signals retain their original relay contract.
          const duo = signalKind === "duo" ?
            progressDuoRitual(state, requestedRoom, now()) : null;
          const relay = signalKind !== "duo" || duo?.status === "lit";
          if(relay){
          const event = {
            id: `online:${now()}:${crypto.randomUUID()}`,
            kind: "online-signal",
            senderPlayerId: signalKind === "duo" ? null : player.id,
            senderSlot: player.slot,
            signalKind: signalKind === "duo" ? "duo-lit" : signalKind,
            payload: signalKind === "duo"
              ? {roomId:requestedRoom, name:duo.altar.name,heal:15}
              : structuredClone(payload?.payload || {}),
            at: now(),
          };
          state.combat.eventSequence = (state.combat.eventSequence || 0) + 1;
          state.combat.events.push(event);
          if (state.combat.events.length > 64) state.combat.events.splice(0, state.combat.events.length - 64);
          state.combat.lastEvent = event;
          }
        }

        player.lastSequence = seq;
        player.lastSeenAt = now();
        player.actions = [...player.actions.slice(-(ACTION_HISTORY_LIMIT - 1)), { id: actionId, sequence: seq, result: { accepted: true } }];
      });
      return snapshot(room, identity.playerId);
    },

    async poll(roomCode, identity) {
      // Fast path: the original engine uses this endpoint to observe its partner.
      // Reads should not invoke CAS writes, full JSON comparisons or combat
      // advancement on every request. Keep the 4s heartbeat and 15s expiry.
      const current=await read(roomCode);
      const viewer=playerFrom(current.room,identity);
      if(!viewer.connected)throw new RoomError("DISCONNECTED","Reconecta la sesión antes de consultar la sala.",409);
      if(current.room.engineMode) {
        const time=now();
        const lastSeen=Number(viewer.lastSeenAt??viewer.lastMoveAt??current.room.updatedAt??0);
        const stale=current.room.players.some(p=>p.connected&&time-Number(p.lastSeenAt??p.lastMoveAt??current.room.updatedAt??0)>PLAYER_STALE_MS);
        if(!stale&&time-lastSeen<PLAYER_HEARTBEAT_MS){
          return snapshot(current.room,viewer.id);
        }
      }
      const { room } = await mutate(roomCode, (state) => {
        const player = playerFrom(state, identity);
        if (!player.connected) throw new RoomError("DISCONNECTED", "Reconecta la sesión antes de consultar la sala.", 409);
        const currentTime = now();
        const lastSeen = Number(player.lastSeenAt ?? player.lastMoveAt ?? state.updatedAt ?? 0);
        if (currentTime - lastSeen >= PLAYER_HEARTBEAT_MS) player.lastSeenAt = currentTime;
      });
      const player = playerFrom(room, identity);
      return snapshot(room, player.id);
    },

    async disconnect(roomCode, identity) {
      const { room } = await mutate(roomCode, (state) => {
        const player = state.players.find((entry) => entry.id === identity?.playerId && entry.token === identity?.token);
        if (!player) throw new RoomError("INVALID_SESSION", "La sesión no es válida. Vuelve a entrar en la sala.", 401);
        if (identity.connectionEpoch !== player.connectionEpoch) return;
        player.connected = false;
        closePendingTravel(state, 'disconnected', now());
        // A disconnected partner breaks the ritual. Resuming cannot reuse a prior hold.
        state.duoChannel = null;
        if (state.phase === "playing") {
          state.phase = "lobby";
          if (state.combat && state.combat.pausedAt == null) state.combat.pausedAt = now();
        }
      });
      return snapshot(room, identity.playerId);
    },
  };
}

import {cleanRoomAlbums} from './room-album.js';
// Save v3 (reads v2). Ids viejos se canonizan para no romper partidas.
import {sanitizeUBonds} from "./u-partners.js";
import {WORLD1_IDS,cleanWorld1Seals,cleanWorld1Stations} from "./world1-rooms.js";
const SAVE_ROOMS=['hub','beach','jungle','cave','lab','ridge','space','reef','volcano','boss',...WORLD1_IDS];
export const ID_LEGACY = { lilo: "kilo", stitch: "stitcho", pikachu: "chispin" };

export function canonId(id) {
  return ID_LEGACY[id] || id || "";
}

function cleanProgress(raw,arrays=false){
 const result={};for(const id of SAVE_ROOMS){const v=raw?.[id];if(arrays&&Array.isArray(v))result[id]=[...new Set(v.filter(x=>typeof x==='string'&&x.startsWith(id+'-')&&x.length<80))].slice(0,64);else if(!arrays&&typeof v==='string'&&v.startsWith(id+'-')&&v.length<80)result[id]=v;}return result;
}
// V453: 100 personal items + 1 trophy + older room secrets exceed
// cleanProgress' 64-item cap. Maintain that strict cap for enemy/checkpoint
// state but validate full personal collections separately, per room.
function cleanSecrets(raw){
 const rooms=SAVE_ROOMS;
 const heroes=['kilo','stitcho','chispin','cat','dragon','dino','frita','pizza','yomi','cuerno'];
 const out={};
 for(const id of rooms){
  const entries=raw?.[id];if(!Array.isArray(entries))continue;
  out[id]=[...new Set(entries.filter(value=>{
   if(typeof value!=='string'||value.length>90)return false;
   if(value.startsWith(id+'-')&&/^[a-z0-9-]+$/i.test(value))return true;
   const m=/^hero-100:([a-z]+):(complete|0|[1-9][0-9]?)$/.exec(value);
   if(m)return heroes.includes(m[1]);
   // The Stitcho chapter occupies a separate single-player hub variant.
   if(id==='hub'&&/^stitcho-(?:spark|echo|star|trail-v1|combo-v1|fragment-[a-h])$/.test(value))return true;
   return false;
  }))].slice(0,256);
 }
 return out;
}
function cleanVisited(raw){const out={};for(const id of WORLD1_IDS)if(raw?.[id]===true)out[id]=true;return out;}
const SAVE_KEY = "ohana";
const SAVE_TMP_KEY = "ohana.tmp";
export function sanitizeDragonTrial(raw){
 if(!raw||!Array.isArray(raw.lit)||raw.lit.length!==3)return null;
 // Ordered rite: never trust a later ember without the previous ones.
 const lit=raw.lit.map(v=>v===true);
 for(let i=1;i<lit.length;i++)if(!lit[i-1])lit[i]=false;
 const count=lit.filter(Boolean).length;
 return {lit,count,completed:count===3,charge:0,active:Math.min(2,count)};
}

function finiteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function packSave(game, MagicMod) {
  const p = game && game.player;
  let magic = null;
  try {
    const api = MagicMod || (game && game.Magic);
    magic = api && api.snapshot ? api.snapshot() : null;
  } catch (e) { magic = null; }
  return {
    v: 3,
    roomAlbums: cleanRoomAlbums(game.roomAlbums),
    checkpoints: cleanProgress(game.checkpoints),
    clearedEncounters: cleanProgress(game.clearedEncounters,true),
    explored: cleanProgress(game.explored,true),
    secrets: cleanSecrets(game.secrets),
    roomId: game.roomId,
    visited: game.visited || { hub: true },
    score: game.score || 0,
    kills: game.kills || 0,
    won: !!game.won,
    world1Seals: cleanWorld1Seals(game.world1Seals),
    world1Stations: cleanWorld1Stations(game.world1Stations),
    world1Won: !!game.world1Won,
    world1Visited: cleanVisited(game.world1Visited),
    evo: p ? p.evo : 0,
    id: p ? canonId(p.id) : "",
    xp: p ? p.xp : 0,
    uExp: p ? Math.max(0,Math.min(200,Math.floor(finiteNumber(p.uExp)))) : 0,
    uBonds: p ? sanitizeUBonds(canonId(p.id),p.uBonds) : {},
    hp: p ? p.health : null,
    nineUsed: !!(p && p._nineUsed),
    dragonTrial: sanitizeDragonTrial(game.dragonTrial),
    magic,
    clearTicks: Math.max(0, finiteNumber(game.clearTicks)),
    best: sanitizeBest(game.best)
  };
}

export function clearRank(ticks) {
  const n = finiteNumber(ticks);
  if (n <= 8 * 60 * 60) return "S";
  if (n <= 14 * 60 * 60) return "A";
  if (n <= 22 * 60 * 60) return "B";
  return "C";
}

export function formatClear(ticks) {
  const total = Math.max(0, Math.floor(finiteNumber(ticks) / 60));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m + ":" + String(s).padStart(2, "0");
}

function sanitizeBest(raw) {
  if (!raw || typeof raw !== "object") return null;
  const ticks = Math.max(0, finiteNumber(raw.ticks));
  if (!ticks) return null;
  return {
    ticks,
    kills: Math.max(0, finiteNumber(raw.kills)),
    score: Math.max(0, finiteNumber(raw.score)),
    evo: Math.max(0, Math.min(4, Math.floor(finiteNumber(raw.evo)))),
    rank: ["S", "A", "B", "C"].includes(raw.rank) ? raw.rank : clearRank(ticks),
    id: canonId(raw.id)
  };
}

export function rememberBest(current, next) {
  const fresh = sanitizeBest(next);
  if (!fresh) return sanitizeBest(current);
  const prev = sanitizeBest(current);
  if (!prev || fresh.ticks < prev.ticks) return fresh;
  return prev;
}

/** Devuelve campos listos o null si el save no es de este personaje. */
export function unpackSave(raw, defId) {
  if (!raw || typeof raw !== "object") return null;
  if (raw.v != null && ![2,3].includes(raw.v)) return null;
  const id = canonId(raw.id);
  if (defId && id !== canonId(defId)) return null;
  const vis = raw.visited && typeof raw.visited === "object" && !Array.isArray(raw.visited) ? raw.visited : { hub: true };
  return {
    roomAlbums: cleanRoomAlbums(raw.roomAlbums),
    checkpoints: cleanProgress(raw.checkpoints),
    clearedEncounters: cleanProgress(raw.clearedEncounters,true),
    explored: cleanProgress(raw.explored,true),
    secrets: cleanSecrets(raw.secrets),
    roomId: typeof raw.roomId === "string" && raw.roomId ? raw.roomId : "hub",
    visited: vis,
    score: Math.max(0, finiteNumber(raw.score)),
    kills: Math.max(0, finiteNumber(raw.kills)),
    won: !!raw.won,
    world1Seals: cleanWorld1Seals(raw.world1Seals),
    world1Stations: cleanWorld1Stations(raw.world1Stations),
    world1Won: !!raw.world1Won,
    world1Visited: cleanVisited(raw.world1Visited),
    evo: Math.max(0, Math.min(4, Math.floor(finiteNumber(raw.evo)))),
    xp: Math.max(0, finiteNumber(raw.xp)),
    uExp: Math.max(0, Math.min(200,Math.floor(finiteNumber(raw.uExp)))),
    uBonds: sanitizeUBonds(id,raw.uBonds),
    hp: raw.hp == null ? null : Math.max(0, finiteNumber(raw.hp)),
    nineUsed: !!raw.nineUsed,
    dragonTrial: sanitizeDragonTrial(raw.dragonTrial),
    magic: raw.magic && typeof raw.magic === "object" ? raw.magic : null,
    id,
    clearTicks: Math.max(0, finiteNumber(raw.clearTicks)),
    best: sanitizeBest(raw.best)
  };
}

export function createSaveStore(storage = () => globalThis.localStorage) {
  const getStorage = typeof storage === "function" ? storage : () => storage;

  function parse(value) {
    if (typeof value !== "string" || !value) return null;
    try {
      const raw = JSON.parse(value);
      return raw && typeof raw === "object" && !Array.isArray(raw) &&
        (raw.v == null || [2,3].includes(raw.v)) && typeof raw.id === "string" && raw.id ? raw : null;
    } catch (_) { return null; }
  }

  function revision(raw) {
    return Number.isSafeInteger(raw?.revision) && raw.revision >= 0 ? raw.revision : 0;
  }

  return {
    readRaw() {
      try {
        const store = getStorage();
        const primary = parse(store.getItem(SAVE_KEY));
        const temporary = parse(store.getItem(SAVE_TMP_KEY));
        // Legacy saves have revision zero. A failed commit leaves the newer
        // staging checkpoint intact; stale staging must never replace primary.
        return revision(temporary) > revision(primary) ? temporary : primary || temporary;
      } catch (_) {
        return null;
      }
    },
    read(id) { return unpackSave(this.readRaw(), id); },
    clear() {
      try {
        const store = getStorage();
        store.removeItem(SAVE_TMP_KEY);
        store.removeItem(SAVE_KEY);
        return true;
      } catch (_) { return false; }
    },
    write(game, magic) {
      if (!game?.player || game.player.dead) return false;
      try {
        const store = getStorage();
        const latest = this.readRaw();
        const nextRevision = revision(latest) + 1;
        if (!Number.isSafeInteger(nextRevision)) return false;
        const raw = JSON.stringify({ ...packSave(game, magic), revision: nextRevision });
        store.setItem(SAVE_TMP_KEY, raw);
        store.setItem(SAVE_KEY, raw);
        try { store.removeItem?.(SAVE_TMP_KEY); } catch (_) {}
        return true;
      } catch (_) {
        return false;
      }
    }
  };
}

export const saveStore = createSaveStore();

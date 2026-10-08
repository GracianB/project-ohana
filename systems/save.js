// Save v2. Ids viejos se canonizan para no romper partidas.
export const ID_LEGACY = { lilo: "kilo", stitch: "stitcho", pikachu: "chispin" };

export function canonId(id) {
  return ID_LEGACY[id] || id || "";
}

const SAVE_KEY = "ohana";
const SAVE_TMP_KEY = "ohana.tmp";
export function sanitizeDragonTrial(raw){
 if(!raw||!Array.isArray(raw.lit)||raw.lit.length!==3)return null;
 const lit=raw.lit.map(v=>v===true);
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
    v: 2,
    roomId: game.roomId,
    visited: game.visited || { hub: true },
    score: game.score || 0,
    kills: game.kills || 0,
    won: !!game.won,
    evo: p ? p.evo : 0,
    id: p ? canonId(p.id) : "",
    xp: p ? p.xp : 0,
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
  if (raw.v != null && raw.v !== 2) return null;
  const id = canonId(raw.id);
  if (defId && id !== canonId(defId)) return null;
  const vis = raw.visited && typeof raw.visited === "object" && !Array.isArray(raw.visited) ? raw.visited : { hub: true };
  return {
    roomId: typeof raw.roomId === "string" && raw.roomId ? raw.roomId : "hub",
    visited: vis,
    score: Math.max(0, finiteNumber(raw.score)),
    kills: Math.max(0, finiteNumber(raw.kills)),
    won: !!raw.won,
    evo: Math.max(0, Math.min(4, Math.floor(finiteNumber(raw.evo)))),
    xp: Math.max(0, finiteNumber(raw.xp)),
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
    try { return JSON.parse(value); } catch (_) { return null; }
  }

  return {
    readRaw() {
      try {
        const store = getStorage();
        const primary = parse(store.getItem(SAVE_KEY));
        if (primary) return primary;
        return parse(store.getItem(SAVE_TMP_KEY));
      } catch (_) {
        return null;
      }
    },
    read(id) { return unpackSave(this.readRaw(), id); },
    write(game, magic) {
      if (!game?.player || game.player.dead) return false;
      const raw = JSON.stringify(packSave(game, magic));
      try {
        const store = getStorage();
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

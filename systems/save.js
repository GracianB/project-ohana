// Save v2. Ids viejos se canonizan para no romper partidas.
export const ID_LEGACY = { lilo: "kilo", stitch: "stitcho", pikachu: "chispin" };

export function canonId(id) {
  return ID_LEGACY[id] || id || "";
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
    magic
  };
}

/** Devuelve campos listos o null si el save no es de este personaje. */
export function unpackSave(raw, defId) {
  if (!raw || typeof raw !== "object") return null;
  const id = canonId(raw.id);
  if (defId && id !== canonId(defId)) return null;
  const vis = raw.visited && typeof raw.visited === "object" && !Array.isArray(raw.visited) ? raw.visited : { hub: true };
  return {
    roomId: raw.roomId || "hub",
    visited: vis,
    score: Math.max(0, Number(raw.score) || 0),
    kills: Math.max(0, Number(raw.kills) || 0),
    won: !!raw.won,
    evo: Math.max(0, Math.min(4, Number(raw.evo) || 0)),
    xp: Math.max(0, Number(raw.xp) || 0),
    hp: raw.hp == null ? null : Math.max(0, Number(raw.hp) || 0),
    nineUsed: !!raw.nineUsed,
    magic: raw.magic && typeof raw.magic === "object" ? raw.magic : null,
    id
  };
}

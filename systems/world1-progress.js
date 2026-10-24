// OHANA V468 · progreso global del Mundo 1 (sellos compartidos por toda la familia).
// Los sellos son de la isla, no de un héroe: se guardan aparte del save por personaje.
import { WORLD1_ORDER, cleanWorld1Seals } from "./world1-rooms.js";
export const WORLD1_SEALS_KEY = "ohana-w1-seals-v1";
export function readWorld1Seals(storage = globalThis.localStorage) {
  try { return cleanWorld1Seals(JSON.parse(storage?.getItem(WORLD1_SEALS_KEY) || "[]")); } catch (_) { return []; }
}
export function storeWorld1Seals(seals, storage = globalThis.localStorage) {
  const merged = cleanWorld1Seals([...readWorld1Seals(storage), ...(seals || [])]);
  try { storage?.setItem(WORLD1_SEALS_KEY, JSON.stringify(merged)); } catch (_) {}
  return merged;
}
// Una sala está abierta si es la primera o si la anterior ya tiene su sello.
export function world1RoomUnlocked(room, seals = []) {
  const s = new Set(cleanWorld1Seals(seals));
  if (room === "w1-final") return WORLD1_ORDER.every((h) => s.has(h));
  const i = WORLD1_ORDER.indexOf(String(room).slice(3));
  return i === 0 || (i > 0 && (s.has(WORLD1_ORDER[i - 1]) || s.has(WORLD1_ORDER[i])));
}
// Cada héroe empieza en SU sala si ya está abierta; si no, en la primera sala
// abierta sin sello. La carta elegida en la selección manda si está abierta.
export function world1StartRoom(heroId, seals = [], requested = null) {
  if (requested && world1RoomUnlocked(requested, seals)) return requested;
  const own = "w1-" + heroId;
  if (WORLD1_ORDER.includes(heroId) && world1RoomUnlocked(own, seals)) return own;
  const s = new Set(cleanWorld1Seals(seals));
  const next = WORLD1_ORDER.find((h) => !s.has(h));
  return next ? "w1-" + next : "w1-final";
}

// Chapter entry owns its protagonist. Retry/Continue in the same chapter keeps
// earned evolution; crossing into another chapter creates a fresh baby.
export function world1ChapterEntry(room, {hero, previousRoom, resume=false}={}) {
 const owner=String(room).startsWith('w1-')?String(room).slice(3):null;
 if(!WORLD1_ORDER.includes(owner))return null;
 return {hero:owner,reset:hero!==owner||(!resume&&previousRoom!==room)};
}

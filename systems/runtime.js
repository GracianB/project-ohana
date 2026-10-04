// PROJECT OHANA · Runtime budgets
// Shared collection limits and allocation-free compaction helpers.

export const MAX_RUNTIME_ENEMIES = 32;
export const MAX_RUNTIME_PROJECTILES = 128;
export const MAX_RUNTIME_GHOSTS = 48;
export const MAX_RUNTIME_ORBS = 64;
export const MAX_RUNTIME_BOLTS = 64;
export const MAX_RUNTIME_SLASHES = 6;
export const MAX_RUNTIME_SAFE = Number.MAX_SAFE_INTEGER;

export function pushRuntime(list, item, max) {
  if (!Array.isArray(list) || !item) return false;
  const cap = Math.max(1, Number(max) || 1);
  if (list.length >= cap) {
    list.splice(0, list.length - cap + 1);
  }
  list.push(item);
  return true;
}

export function compactRuntimeList(list, max) {
  if (!Array.isArray(list)) return [];
  const cap = Math.max(1, Number(max) || 1);
  let write = 0;

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (!item || typeof item !== "object") continue;
    list[write++] = item;
  }

  const start = Math.max(0, write - cap);
  if (start > 0) list.copyWithin(0, start, write);
  list.length = write - start;
  return list;
}

export function boundedFinite(value, fallback, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

// OHANA V365 · Bounded CanvasGradient cache.
// Keep gradients on the context that created them: never share Canvas resources
// between the game, title portraits, visual audit and multiplayer canvases.
const BY_CONTEXT = new WeakMap();
export const MAX_CACHED_GRADIENTS = 32;
export function cachedGradient(ctx, key, build) {
  let entries = BY_CONTEXT.get(ctx);
  if (!entries) {
    entries = new Map();
    BY_CONTEXT.set(ctx, entries);
  }
  if (entries.has(key)) return entries.get(key);
  const value = build();
  if (entries.size >= MAX_CACHED_GRADIENTS) entries.delete(entries.keys().next().value);
  entries.set(key, value);
  return value;
}

// OHANA · Optical stage, not gameplay geometry.
// The welcome renders each character's real V326 Canvas art at scale 1 and
// measures its non-transparent silhouette. Physics and evolution are untouched.
export const WELCOME_CAST_ORDER = Object.freeze([
  "dino", "dragon", "kilo", "stitcho", "chispin",
  "cat", "frita", "pizza", "yomi", "cuerno"
]);

export function welcomeCastSpot(id, width, floor, heroHeight) {
  const index = WELCOME_CAST_ORDER.indexOf(id);
  if (index < 0 || ![width, floor, heroHeight].every(Number.isFinite) || width <= 0) return null;
  const compact = width < 760;
  const columns = compact ? 5 : 10;
  const column = index % columns;
  const row = Math.floor(index / columns);
  return Object.freeze({
    x: width * (column + .5) / columns,
    foot: floor - (compact && row === 0 ? heroHeight * 1.42 : 0),
    slotWidth: width / columns,
    column, row, compact
  });
}

export function welcomeActorFit(bounds, targetHeight, slotWidth) {
  const w = Number(bounds?.width);
  const h = Number(bounds?.height);
  const offsetX = Number(bounds?.centerOffsetX);
  const bw = Number.isFinite(w) && w >= 8 ? w : 46;
  const bh = Number.isFinite(h) && h >= 8 ? h : 64;
  const target = Number.isFinite(targetHeight) ? Math.max(24, targetHeight) : 70;
  const width = Number.isFinite(slotWidth) ? Math.max(30, slotWidth) : 80;
  // Keep 12% air on both sides, including tails, wings and outlines.
  const scale = Math.max(.2, Math.min(5, target / bh, width * .88 / bw));
  return Object.freeze({
    scale,
    centerOffsetX: Number.isFinite(offsetX) ? offsetX : 0,
    paintedHeight: bh * scale,
    paintedWidth: bw * scale
  });
}

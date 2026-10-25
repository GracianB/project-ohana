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
  const desktop={dino:[.10,0,2],dragon:[.24,.8,1],kilo:[.43,.05,2],stitcho:[.35,1.45,0],chispin:[.57,.95,1],cat:[.68,1.8,0],frita:[.68,0,2],pizza:[.82,.7,1],yomi:[.91,1.8,0],cuerno:[.12,2,0]};
  const mobile={dino:[.18,0,2],dragon:[.12,1.3,1],kilo:[.50,0,2],stitcho:[.37,1.3,1],chispin:[.62,1.3,1],cat:[.50,2.6,0],frita:[.82,0,2],pizza:[.87,1.3,1],yomi:[.82,2.6,0],cuerno:[.18,2.6,0]};
  const [x,lift,row]=(compact?mobile:desktop)[id];
  return Object.freeze({x:width*x,foot:floor-heroHeight*lift,slotWidth:width*(compact?.20:.13),column:index,row,compact});
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

// V604 · Film blocking independent of collision, save data and hero art.
// V619 · Full family on stage. Story beats highlight a pair but never hide the rest.
export function welcomeSpotlightAllows(id, direction) {
  // Always allow the full cast. The speaking pair is emphasized by size and position,
  // but the other eight remain visible as the family watching.
  return true;
}
export function welcomeSpotlightSpot(id, base, width, floor, heroHeight, direction) {
  if (!base) return base;
  // No active story direction: keep the authored ten-character layout.
  if (!direction?.hero) return base;
  const stage = direction;
  const pair = typeof stage.partner === 'string' && stage.partner !== stage.hero;
  // Only nudge the speaking pair forward; everyone else keeps their stage mark.
  if (!pair || (id !== stage.hero && id !== stage.partner)) return base;
  const mobile = width < 760;
  const x = width * (id === stage.hero ? (mobile ? .37 : .39) : (mobile ? .67 : .63));
  return Object.freeze({ ...base, x, foot: floor - heroHeight * (id === stage.hero ? .04 : .12),
    slotWidth: width * (mobile ? .29 : .23), row: 0 });
}

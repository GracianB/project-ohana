// Measured Canvas anatomy, in art units, and intended visible heights in pixels.
// These four renderers already grow their geometry with each evolution.
// Multiplying generic evolution scale again makes babies tiny and adults huge.
export const CALIBRATED_HEIGHT = Object.freeze([55, 70, 85, 102, 120]);
// Dino & Dragón: one shared, larger growth curve (~+16%, smooth ×1.17–1.28
// steps). Same body size per form; they differ by silhouette (Dino wide and
// grounded, Dragón winged and hovering), never by an accidental scale jump.
// Hitboxes (roster w/h) are physical and intentionally unchanged.
export const DINO_DRAGON_HEIGHT = Object.freeze([64, 82, 100, 120, 140]);
// Dragón's measured height includes its raised wings; +8% keeps its BODY the
// same optical size as Dino's at every form instead of a shrunken torso.
export const DRAGON_WING_ALLOWANCE = 1.08;
export const HERO_HEIGHT_TARGET = Object.freeze({
  dino: DINO_DRAGON_HEIGHT,
  dragon: Object.freeze(DINO_DRAGON_HEIGHT.map(h => Math.round(h * DRAGON_WING_ALLOWANCE))),
});
export function heroHeightTarget(id, form) {
  const f = Math.max(0, Math.min(4, Math.round(Number(form) || 0)));
  return (HERO_HEIGHT_TARGET[id] || CALIBRATED_HEIGHT)[f];
}
export const CANVAS_ANATOMY_HEIGHT = Object.freeze({
  dino: Object.freeze([124.6, 104.1, 114.5, 128.1, 133.7]),
  dragon: Object.freeze([90.8, 109.9, 134.5, 152.3, 169]),
  yomi: Object.freeze([66, 86, 92, 98, 116]),
  pizza: Object.freeze([102, 107, 129, 135, 134]),
});
export const CALIBRATED_VISUAL_H = Object.freeze(Object.fromEntries(
  Object.entries(CANVAS_ANATOMY_HEIGHT).map(([id, heights]) => [id,
    Object.freeze(heights.map((height, form) => 100 * heroHeightTarget(id, form) / height)),
  ])
));

// Optical normalization of the remaining Canvas silhouettes; hitboxes stay physical.
export const OPTICAL_SCALE = Object.freeze({"kilo": [0.8594, 0.8537, 0.8854, 0.9189, 0.8451], "stitcho": [0.8594, 0.7955, 0.9444, 0.8793, 0.8571], "chispin": [1.10, 0.975, 0.865, 0.875, 0.935], "cat": [1.2222, 1.0769, 1.0625, 0.9027, 0.8889], "frita": [0.8088, 0.9211, 1.0, 1.1724, 0.916], "cuerno": [1.0185, 1.129, 1.0241, 1.0408, 1.0256]});

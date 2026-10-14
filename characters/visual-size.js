// Measured Canvas anatomy, in art units, and intended visible heights in pixels.
// These four renderers already grow their geometry with each evolution.
// Multiplying generic evolution scale again makes babies tiny and adults huge.
export const CALIBRATED_HEIGHT = Object.freeze([55, 70, 85, 102, 120]);
export const CANVAS_ANATOMY_HEIGHT = Object.freeze({
  dino: Object.freeze([119, 97, 109, 121, 130]),
  dragon: Object.freeze([88, 99, 119, 126, 140]),
  yomi: Object.freeze([66, 86, 92, 98, 116]),
  pizza: Object.freeze([102, 107, 129, 135, 134]),
});
export const CALIBRATED_VISUAL_H = Object.freeze(Object.fromEntries(
  Object.entries(CANVAS_ANATOMY_HEIGHT).map(([id, heights]) => [id,
    Object.freeze(heights.map((height, form) => 100 * CALIBRATED_HEIGHT[form] / height)),
  ])
));

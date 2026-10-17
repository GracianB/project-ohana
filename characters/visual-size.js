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

// Optical normalization of the remaining Canvas silhouettes; hitboxes stay physical.
export const OPTICAL_SCALE = Object.freeze({"kilo": [0.8594, 0.8537, 0.8854, 0.9189, 0.8451], "stitcho": [0.8594, 0.7955, 0.9444, 0.8793, 0.8571], "chispin": [1, 1, 1, 1, 1], "cat": [1.2222, 1.0769, 1.0625, 0.9027, 0.8889], "frita": [0.8088, 0.9211, 1.0, 1.1724, 0.916], "cuerno": [1.0185, 1.129, 1.0241, 1.0408, 1.0256]});

// ============================================================================
// PROJECT OHANA · ART REGISTRY
// Registro único y estable de renderers vectoriales.
// ============================================================================

import kilo from "./kilo.js";
import stitch from "./stitch.js";
import chispin from "./chispin.js";
import cat from "./cat.js";
import dragon from "./dragon.js";
import dino from "./dino.js";
import frita from "./frita.js";
import pizza from "./pizza.js";
import yomi from "./yomi.js";
import cuerno from "./cuerno.js";

const ART = Object.freeze({
  kilo,
  lilo: kilo,

  stitch,
  stitcho: stitch,

  chispin,
  pikachu: chispin,

  cat,
  michi: cat,

  dragon,
  dino,
  frita,
  pizza,
  yomi,
  cuerno
});

const FALLBACK_ID = "kilo";

export function getArt(id){
  const key = String(id ?? "")
    .trim()
    .toLowerCase();

  return ART[key] || ART[FALLBACK_ID];
}

export function hasArt(id){
  const key = String(id ?? "")
    .trim()
    .toLowerCase();

  return !!ART[key];
}

export const ART_IDS = Object.freeze(Object.keys(ART));

export { ART };

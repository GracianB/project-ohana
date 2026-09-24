// ============================================================================
// SPRITES · Project Ohana
// Los personajes ya son vectoriales (characters/art). Aquí solo quedan las
// imágenes de efectos y del jefe: assets/sprites/<nombre>.png
//   vfxSprite(name) -> HTMLImageElement | null (si aún no ha cargado)
// ============================================================================
const SPRITE_PATH = "assets/sprites/";
const cache = new Map();
const NAMES = ["vfx-slash", "vfx-flame", "vfx-note", "boss-1", "boss-2"];

function load(name) {
  let img = cache.get(name);
  if (!img) {
    img = new Image();
    img.decoding = "async";
    img.src = SPRITE_PATH + name + ".png";
    cache.set(name, img);
  }
  return img;
}

export function vfxSprite(name) {
  const img = load(name);
  return img.complete && img.naturalWidth > 0 ? img : null;
}

NAMES.forEach(load);

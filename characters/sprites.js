// ============================================================================
// SPRITES · Project Ohana
// Los personajes ya son vectoriales (characters/art). Aquí solo quedan las
// imágenes de efectos: assets/sprites/<nombre>.png
//   vfxSprite(name) -> HTMLImageElement | null (si aún no ha cargado)
// ============================================================================
const SPRITE_PATH = "assets/sprites/";
const cache = new Map();
const NAMES = ["vfx-slash", "vfx-flame", "vfx-note"];

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

const BODY_IDS = ["kilo", "stitcho", "chispin", "cat", "dragon", "dino", "frita", "pizza", "yomi"];
const BODY_POSES = ["idle", "run", "jump", "atk"];
const KILO_POSES = ["idle", "blink", "run1", "run2", "run3", "rise", "fall", "hit", "j", "k", "l", "hurt"];

export function paintedBody(id, pose) {
  const img = load("bodies/" + id + "-" + pose);
  return img.complete && img.naturalWidth > 0 ? img : null;
}

for (const id of BODY_IDS) for (const pose of BODY_POSES) load("bodies/" + id + "-" + pose);
for (const pose of KILO_POSES) load("bodies/kilo-" + pose);
NAMES.forEach(load);

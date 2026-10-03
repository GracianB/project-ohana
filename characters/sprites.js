// ============================================================================
// SPRITES · Project Ohana
// Los personajes de esta versión son vectoriales (characters/art).
// Aquí solo se piden PNG: tres efectos, y cuerpos pintados si look === "paint".
//   vfxSprite(name)    -> HTMLImageElement | null
//   paintedBody(id, pose) -> HTMLImageElement | null
// ============================================================================

const SPRITE_PATH = "assets/sprites/";
const cache = new Map();
const RETRY_DELAY_MS = 5000;

const NAMES = Object.freeze(["vfx-slash", "vfx-flame", "vfx-note"]);

const BODY_IDS = Object.freeze([
  "kilo", "stitcho", "chispin", "cat", "dragon", "dino", "frita", "pizza", "yomi", "cuerno",
]);
const BODY_POSES = Object.freeze(["idle", "run", "jump", "atk"]);
const KILO_POSES = Object.freeze(["idle", "blink", "run1", "run2", "run3", "rise", "fall", "hit", "j", "k", "l", "hurt"]);
const BODY_ALIASES = Object.freeze({
  lilo: "kilo",
  stitch: "stitcho",
  pikachu: "chispin",
  michi: "cat",
});
const POSES_BY_BODY = new Map(
  BODY_IDS.map((id) => [id, new Set(id === "kilo" ? [...BODY_POSES, ...KILO_POSES] : BODY_POSES)])
);

function load(name) {
  if (!name) return null;
  let entry = cache.get(name);
  const now = Date.now();
  if (entry && entry.image) {
    if (!entry.image.complete || entry.image.naturalWidth > 0) return entry.image;
    entry.image = null;
    entry.retryAt = now + RETRY_DELAY_MS;
  }
  if (entry && entry.retryAt > now) return null;
  if (typeof Image === "undefined") return null;

  let img;
  try { img = new Image(); }
  catch (_) { return null; }

  entry = { image: img, retryAt: 0 };
  cache.set(name, entry);
  img.decoding = "async";
  img.onload = () => {
    if (cache.get(name) === entry) entry.retryAt = 0;
  };
  img.onerror = () => {
    if (cache.get(name) === entry) {
      entry.image = null;
      entry.retryAt = Date.now() + RETRY_DELAY_MS;
    }
  };
  try { img.src = SPRITE_PATH + name + ".png"; }
  catch (_) {
    entry.image = null;
    entry.retryAt = Date.now() + RETRY_DELAY_MS;
    return null;
  }
  return img;
}

function ready(name) {
  const img = load(name);
  return img && img.complete && img.naturalWidth > 0 ? img : null;
}

export function vfxSprite(name) {
  return NAMES.includes(name) ? ready(name) : null;
}

export function paintedBody(id, pose) {
  const canonicalId = BODY_ALIASES[id] || id;
  const poses = POSES_BY_BODY.get(canonicalId);
  if (!poses || !poses.has(pose)) return null;
  return ready("bodies/" + canonicalId + "-" + pose);
}

NAMES.forEach(load);

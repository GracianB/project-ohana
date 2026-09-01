const cache = new Map();

const FORM = {
  lilo: [1, 1, 2, 2, 4],
  stitch: [1, 1, 2, 2, 4],
  pikachu: [1, 1, 1, 1, 1],
  dragon: [0, 1, 2, 2, 2],
  cat: [0, 1, 2, 4, 4],
};

function load(key) {
  let img = cache.get(key);
  if (!img) {
    img = new Image();
    img.src = "assets/sprites/" + key + ".png";
    cache.set(key, img);
  }
  return img;
}

export function preloadSprites() {
  Object.entries(FORM).forEach(([id, row]) => {
    new Set(row).forEach((stage) => load(id + "-" + stage));
  });
  ["vfx-slash", "vfx-flame", "vfx-note"].forEach((name) => load(name));
}

export function spriteFor(id, evo) {
  const row = FORM[id] || FORM.lilo;
  const stage = row[Math.max(0, Math.min(4, Number(evo) || 0))];
  const img = load(id + "-" + stage);
  return img.complete && img.naturalWidth > 0 ? img : null;
}

export function vfxSprite(name) {
  const img = load(name);
  return img.complete && img.naturalWidth > 0 ? img : null;
}

preloadSprites();

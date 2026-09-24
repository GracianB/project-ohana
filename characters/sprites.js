// ============================================================================
// SPRITES · Project Ohana
// ----------------------------------------------------------------------------
// Carga los PNG con transparencia de assets/sprites/<nombre>.png, los recorta
// a su contenido real (para que TODOS apoyen los pies en el suelo y midan lo
// que deben) y prepara variantes teñidas en caché (forma 3, GOD, flash).
//
// API pública:
//   formArt(id, evo)      -> { img, sx, sy, tintKey } | null   (arte de esa forma)
//   silhouette(img, col)  -> canvas con la silueta rellena de un color (flash)
//   spriteFor(id, evo)    -> canvas | null   (compatibilidad)
//   vfxSprite(name)       -> HTMLImageElement | null  (enemigos / habilidades)
//   drawSprite(ctx, img, x, y, h, opts)
//   preloadSprites()
// ============================================================================

const SPRITE_PATH = "assets/sprites/";
const raw = new Map();      // nombre -> HTMLImageElement
const trimmed = new Map();  // nombre -> canvas recortado
const variants = new Map(); // clave -> canvas teñido

// ---------------------------------------------------------------------------
// Qué PNG usa cada una de las 5 formas (índice = evo 0..4).
//   null  -> bebé procedural (baby.js), el estilo "cría chibi" del juego
//   tint  -> variante teñida para que dos formas no sean el mismo dibujo
//   sx/sy -> deformación de silueta (p. ej. "Trueno Gordo" más ancho)
// ---------------------------------------------------------------------------
const FORMS = {
  lilo: [
    null,
    { src: "lilo-1" },
    { src: "lilo-2" },
    { src: "lilo-2", tint: { color: "#ffd36a", mode: "color", a: 0.6 } }, // Super Kilo: dorada
    { src: "lilo-4" },
  ],
  stitch: [
    null,
    { src: "stitch-1" },
    { src: "stitch-2" },
    { src: "stitch-2", tint: { color: "#2f8cff", mode: "screen", a: 0.55 } }, // Experimento Ñam: tech
    { src: "stitch-4" },
  ],
  pikachu: [
    null,
    { src: "pikachu-1" },
    { src: "pikachu-1", tint: { color: "#ff9a1f", mode: "multiply", a: 0.55 } }, // Voltín: naranja
    { src: "pikachu-1", sx: 1.22, sy: 0.94 },                                 // Trueno Gordo: ancho
    { src: "pikachu-1", tint: { color: "#ffe45a", mode: "screen", a: 0.35 } },  // GOD: luminoso
  ],
  cat: [
    null,
    { src: "cat-0" },
    { src: "cat-1" },
    { src: "cat-2" }, // Nueve vidas: gata lunar
    { src: "cat-4" },
  ],
  dragon: [
    null,
    { src: "dragon-0" },
    { src: "dragon-1" },
    { src: "dragon-2" },
    { src: "dragon-2", tint: { color: "#ffd84a", mode: "color", a: 0.5 } }, // GOD: dragón dorado
  ],
  frita: [
    null,
    { src: "frita-1" },
    { src: "frita-2" },
    { src: "frita-0" }, // Extra Crujiente: nugget gordo
    { src: "frita-4" },
  ],
};

const VFX = ["vfx-slash", "vfx-flame", "vfx-note", "boss-1", "boss-2", "ardilla-0", "ardilla-1", "ardilla-2", "ardilla-4"];

function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return c;
}

function load(name) {
  let img = raw.get(name);
  if (!img) {
    img = new Image();
    img.decoding = "async";
    img.onload = () => trim(name);
    img.src = SPRITE_PATH + name + ".png";
    raw.set(name, img);
  }
  return img;
}

const ready = (img) => !!img && img.complete && img.naturalWidth > 0;

/** Recorta el PNG a su caja de píxeles visibles (+2px de margen). */
function trim(name) {
  if (trimmed.has(name)) return trimmed.get(name);
  const img = raw.get(name);
  if (!ready(img)) return null;
  const w = img.naturalWidth, h = img.naturalHeight;
  let out = img;
  try {
    const c = makeCanvas(w, h);
    const g = c.getContext("2d", { willReadFrequently: true });
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, w, h).data;
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (d[(y * w + x) * 4 + 3] > 24) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
      }
    }
    if (x1 >= x0 && y1 >= y0) {
      x0 = Math.max(0, x0 - 2); y0 = Math.max(0, y0 - 2);
      x1 = Math.min(w - 1, x1 + 2); y1 = Math.min(h - 1, y1 + 2);
      const cw = x1 - x0 + 1, ch = y1 - y0 + 1;
      const t = makeCanvas(cw, ch);
      t.getContext("2d").drawImage(img, x0, y0, cw, ch, 0, 0, cw, ch);
      out = t;
    }
  } catch (_) {
    // file:// o CORS: usamos la imagen tal cual
  }
  trimmed.set(name, out);
  return out;
}

function base(name) {
  const img = load(name);
  if (!ready(img)) return null;
  return trim(name);
}

/** Variante teñida conservando detalle y transparencia. */
function tinted(name, tint) {
  const key = name + "|" + tint.color + "|" + tint.mode + "|" + tint.a;
  if (variants.has(key)) return variants.get(key);
  const src = base(name);
  if (!src) return null;
  const c = makeCanvas(src.width, src.height);
  const g = c.getContext("2d");
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = tint.mode || "source-atop";
  g.globalAlpha = tint.a == null ? 0.5 : tint.a;
  g.fillStyle = tint.color;
  g.fillRect(0, 0, c.width, c.height);
  // devolver la transparencia original
  g.globalCompositeOperation = "destination-in";
  g.globalAlpha = 1;
  g.drawImage(src, 0, 0);
  variants.set(key, c);
  return c;
}

/** Silueta sólida (flash de daño / evolución). */
export function silhouette(img, color) {
  if (!img) return null;
  let map = variants.get(img);
  if (!map) { map = new Map(); variants.set(img, map); }
  if (map.has(color)) return map.get(color);
  const c = makeCanvas(img.width || img.naturalWidth, img.height || img.naturalHeight);
  const g = c.getContext("2d");
  g.drawImage(img, 0, 0);
  g.globalCompositeOperation = "source-in";
  g.fillStyle = color;
  g.fillRect(0, 0, c.width, c.height);
  map.set(color, c);
  return c;
}

export function preloadSprites() {
  Object.values(FORMS).forEach((row) => row.forEach((f) => f && load(f.src)));
  VFX.forEach(load);
}

/** Arte de la forma: imagen lista + deformación. null = usar bebé/procedural. */
export function formArt(id, evo) {
  const e = Math.max(0, Math.min(4, Math.round(Number(evo) || 0)));
  const row = FORMS[id];
  const f = row && row[e];
  if (!f) return null;
  const img = f.tint ? tinted(f.src, f.tint) : base(f.src);
  if (!img) return null;
  return { img, sx: f.sx || 1, sy: f.sy || 1 };
}

export function spriteFor(id, evo) {
  const a = formArt(id, evo);
  return a ? a.img : null;
}

export function vfxSprite(name) {
  const img = load(name);
  return ready(img) ? img : null;
}

/** Dibuja un sprite con los pies en (x, y) y altura h. opts: { flip, alpha } */
export function drawSprite(ctx, img, x, y, h, opts = {}) {
  if (!img) return false;
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  if (!iw || !ih) return false;
  const w = h * (iw / ih);
  ctx.save();
  if (opts.alpha != null) ctx.globalAlpha *= opts.alpha;
  ctx.translate(x, y);
  if (opts.flip) ctx.scale(-1, 1);
  ctx.drawImage(img, -w / 2, -h, w, h);
  ctx.restore();
  return true;
}

export function isSpriteLoaded(id, evo = 1) {
  return !!spriteFor(id, evo);
}

preloadSprites();

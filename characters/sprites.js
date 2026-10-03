// ============================================================================
// SPRITES · Project Ohana
// Gestión robusta de sprites PNG.
//
// API pública:
//   vfxSprite(name)          -> HTMLImageElement | null
//   paintedBody(id, pose)    -> HTMLImageElement | null
//
// Características:
//   - Caché centralizada.
//   - Carga lazy.
//   - Precarga de VFX.
//   - Alias de personajes.
//   - Validación estricta de IDs/poses.
//   - Control de estados de carga.
//   - Evita peticiones duplicadas.
//   - Reintento automático tras errores.
//   - Normalización segura de entradas.
//   - Protección frente a Image inexistente.
//   - Compatible con el código existente.
// ============================================================================

const SPRITE_PATH = "assets/sprites/";
const RETRY_DELAY_MS = 5000;

const NAMES = Object.freeze([
  "vfx-slash",
  "vfx-flame",
  "vfx-note",
]);

const BODY_IDS = Object.freeze([
  "kilo",
  "stitcho",
  "chispin",
  "cat",
  "dragon",
  "dino",
  "frita",
  "pizza",
  "yomi",
  "cuerno",
]);

const BODY_POSES = Object.freeze([
  "idle",
  "run",
  "jump",
  "atk",
]);

const KILO_POSES = Object.freeze([
  "idle",
  "blink",
  "run1",
  "run2",
  "run3",
  "rise",
  "fall",
  "hit",
  "j",
  "k",
  "l",
  "hurt",
]);

const BODY_ALIASES = Object.freeze({
  lilo: "kilo",
  stitch: "stitcho",
  pikachu: "chispin",
  michi: "cat",
});

const POSES_BY_BODY = new Map(
  BODY_IDS.map((id) => {
    const poses =
      id === "kilo"
        ? [...BODY_POSES, ...KILO_POSES]
        : [...BODY_POSES];

    return [id, new Set(poses)];
  })
);

const VFX_NAMES = new Set(NAMES);
const VALID_BODY_IDS = new Set(BODY_IDS);
const cache = new Map();

function normalizeString(value) {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
}

function canonicalBodyId(id) {
  const normalized = normalizeString(id);
  return BODY_ALIASES[normalized] || normalized;
}

function spritePath(name) {
  return SPRITE_PATH + name + ".png";
}

function canUseImage() {
  return typeof Image !== "undefined";
}

function createImage() {
  if (!canUseImage()) return null;

  try {
    return new Image();
  } catch (_) {
    return null;
  }
}

function load(name) {
  const normalized = normalizeString(name);

  if (!normalized) return null;

  const now = Date.now();
  let entry = cache.get(normalized);

  if (entry) {
    const img = entry.image;

    if (
      img &&
      (!img.complete || img.naturalWidth > 0)
    ) {
      return img;
    }

    if (img && img.complete && img.naturalWidth === 0) {
      entry.image = null;
      entry.state = "error";
      entry.lastErrorAt = now;

      if (!entry.retryAt || entry.retryAt <= now) {
        entry.retryAt = now + RETRY_DELAY_MS;
      }
    }

    if (entry.retryAt > now) {
      return null;
    }
  }

  if (!canUseImage()) {
    return null;
  }

  const img = createImage();

  if (!img) {
    cache.set(normalized, {
      image: null,
      state: "error",
      retryAt: now + RETRY_DELAY_MS,
      lastErrorAt: now,
      src: spritePath(normalized),
    });

    return null;
  }

  entry = {
    image: img,
    state: "loading",
    retryAt: 0,
    lastErrorAt: 0,
    src: spritePath(normalized),
  };

  cache.set(normalized, entry);

  try {
    img.decoding = "async";
  } catch (_) {
    // Entornos que no permiten modificar decoding.
  }

  img.onload = () => {
    if (cache.get(normalized) !== entry) return;

    entry.state = "ready";
    entry.retryAt = 0;
    entry.lastErrorAt = 0;
  };

  img.onerror = () => {
    if (cache.get(normalized) !== entry) return;

    entry.image = null;
    entry.state = "error";
    entry.lastErrorAt = Date.now();
    entry.retryAt = entry.lastErrorAt + RETRY_DELAY_MS;
  };

  try {
    img.src = entry.src;
  } catch (_) {
    entry.image = null;
    entry.state = "error";
    entry.lastErrorAt = Date.now();
    entry.retryAt = entry.lastErrorAt + RETRY_DELAY_MS;
    return null;
  }

  return img;
}

function ready(name) {
  const normalized = normalizeString(name);

  if (!normalized) return null;

  const img = load(normalized);

  if (!img) return null;

  return (
    img.complete &&
    img.naturalWidth > 0 &&
    img.naturalHeight > 0
  )
    ? img
    : null;
}

export function vfxSprite(name) {
  const normalized = normalizeString(name);

  if (!VFX_NAMES.has(normalized)) {
    return null;
  }

  return ready(normalized);
}

export function paintedBody(id, pose) {
  const canonicalId = canonicalBodyId(id);
  const normalizedPose = normalizeString(pose);

  if (!VALID_BODY_IDS.has(canonicalId)) {
    return null;
  }

  const poses = POSES_BY_BODY.get(canonicalId);

  if (!poses || !poses.has(normalizedPose)) {
    return null;
  }

  return ready(
    "bodies/" +
    canonicalId +
    "-" +
    normalizedPose
  );
}

for (const name of NAMES) {
  load(name);
}

if (typeof globalThis !== "undefined") {
  globalThis.__OHANA_SPRITES__ = Object.freeze({
    cache,
    names: NAMES,
    bodyIds: BODY_IDS,
    bodyPoses: BODY_POSES,
    kiloPoses: KILO_POSES,
    aliases: BODY_ALIASES,
  });
}

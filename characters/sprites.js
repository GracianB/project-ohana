// ============================================================================
// SISTEMA DE SPRITES PREMIUM - Project Ohana
// ============================================================================

const SPRITE_PATH = 'assets/sprites/';

// Configuración optimizada para sprites de 204.8x256 (1024/5)
const SPRITE_CONFIG = {
  stitch:   { file: 'stitch-sprites.png',   frameW: 204.8, frameH: 256, anchor: { x: 0.5, y: 0.78 } },
  lilo:     { file: 'lilo-sprites.png',       frameW: 204.8, frameH: 256, anchor: { x: 0.5, y: 0.82 } },
  pikachu:  { file: 'pikachu-sprites.png',    frameW: 204.8, frameH: 256, anchor: { x: 0.5, y: 0.75 } },
  dragon:   { file: 'dragon-sprites.png',     frameW: 204.8, frameH: 256, anchor: { x: 0.5, y: 0.72 } },
  cat:      { file: 'cat-sprites.png',        frameW: 204.8, frameH: 256, anchor: { x: 0.5, y: 0.85 } },
  frita:    { file: 'ketchup-sprites.png',    frameW: 204.8, frameH: 256, anchor: { x: 0.5, y: 0.80 } }
};

// Cache de imágenes
const imageCache = new Map();

/** Carga un sprite */
export function loadSprite(characterId) {
  const config = SPRITE_CONFIG[characterId];
  if (!config) return Promise.resolve(null);
  
  const path = SPRITE_PATH + config.file;
  
  if (imageCache.has(path)) {
    return Promise.resolve(imageCache.get(path));
  }
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(path, img);
      resolve(img);
    };
    img.onerror = () => resolve(null);
    img.src = path;
  });
}

/** Precarga todos los sprites */
export async function preloadAllSprites(onProgress) {
  const ids = Object.keys(SPRITE_CONFIG);
  const total = ids.length;
  
  for (let i = 0; i < total; i++) {
    await loadSprite(ids[i]);
    if (onProgress) onProgress((i + 1) / total);
  }
  
  return true;
}

/** Obtiene datos de un frame específico */
export function getSpriteFrame(characterId, evolution) {
  const config = SPRITE_CONFIG[characterId];
  if (!config) return null;
  
  const img = imageCache.get(SPRITE_PATH + config.file);
  if (!img?.complete) return null;
  
  const evo = Math.min(Math.max(0, evolution), 4);
  
  return {
    image: img,
    sx: evo * config.frameW,
    sy: 0,
    sw: config.frameW,
    sh: config.frameH,
    anchor: config.anchor
  };
}

/** Verifica si está cargado */
export function isSpriteLoaded(characterId) {
  const config = SPRITE_CONFIG[characterId];
  if (!config) return false;
  const img = imageCache.get(SPRITE_PATH + config.file);
  return img?.complete === true;
}

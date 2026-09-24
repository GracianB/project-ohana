// ============================================================================
// SISTEMA DE SPRITES - Project Ohana
// Reemplaza dibujos procedurales con imágenes de pixel art
// ============================================================================

const SPRITE_PATH = 'assets/sprites/';

// Configuración de cada personaje
const SPRITE_CONFIG = {
  stitch: {
    file: 'stitch-sprites.png',
    width: 204.8,  // 1024 / 5
    height: 256,
    evolutions: 5,
    anchor: { x: 0.5, y: 0.8 } // Punto de anclaje para posicionamiento
  },
  lilo: {
    file: 'lilo-sprites.png',
    width: 204.8,
    height: 256,
    evolutions: 5,
    anchor: { x: 0.5, y: 0.85 }
  },
  pikachu: {
    file: 'pikachu-sprites.png',
    width: 204.8,
    height: 256,
    evolutions: 5,
    anchor: { x: 0.5, y: 0.8 }
  },
  dragon: {
    file: 'dragon-sprites.png',
    width: 204.8,
    height: 256,
    evolutions: 5,
    anchor: { x: 0.5, y: 0.75 }
  },
  cat: {
    file: 'cat-sprites.png',
    width: 204.8,
    height: 256,
    evolutions: 5,
    anchor: { x: 0.5, y: 0.9 }
  },
  frita: {
    file: 'ketchup-sprites.png',
    width: 204.8,
    height: 256,
    evolutions: 5,
    anchor: { x: 0.5, y: 0.85 }
  }
};

// Cache de imágenes cargadas
const imageCache = new Map();
const loadingPromises = new Map();

/**
 * Carga una imagen y la guarda en caché
 */
function loadImage(src) {
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src));
  }
  
  if (loadingPromises.has(src)) {
    return loadingPromises.get(src);
  }
  
  const promise = new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, img);
      loadingPromises.delete(src);
      resolve(img);
    };
    img.onerror = () => {
      loadingPromises.delete(src);
      reject(new Error(`Failed to load: ${src}`));
    };
    img.src = src;
  });
  
  loadingPromises.set(src, promise);
  return promise;
}

/**
 * Precarga todos los sprites del juego
 */
export async function preloadAllSprites() {
  const promises = Object.values(SPRITE_CONFIG).map(config => 
    loadImage(SPRITE_PATH + config.file)
  );
  
  try {
    await Promise.all(promises);
    console.log('✅ All sprites loaded successfully');
    return true;
  } catch (err) {
    console.error('❌ Error loading sprites:', err);
    return false;
  }
}

/**
 * Obtiene un sprite específico para un personaje y evolución
 */
export function spriteFor(characterId, evolution) {
  const config = SPRITE_CONFIG[characterId];
  if (!config) return null;
  
  const img = imageCache.get(SPRITE_PATH + config.file);
  if (!img || !img.complete) return null;
  
  return {
    image: img,
    sx: evolution * config.width,  // Posición X en el sprite sheet
    sy: 0,                          // Posición Y (siempre 0 en horizontal)
    sw: config.width,               // Ancho del frame
    sh: config.height,              // Alto del frame
    anchor: config.anchor
  };
}

/**
 * Dibuja un sprite en el canvas
 */
export function drawSprite(ctx, sprite, x, y, width, height, flip = false) {
  if (!sprite || !sprite.image) return false;
  
  ctx.save();
  
  if (flip) {
    ctx.translate(x + width, y);
    ctx.scale(-1, 1);
    ctx.drawImage(
      sprite.image,
      sprite.sx, sprite.sy, sprite.sw, sprite.sh,
      0, 0, width, height
    );
  } else {
    ctx.drawImage(
      sprite.image,
      sprite.sx, sprite.sy, sprite.sw, sprite.sh,
      x - width * sprite.anchor.x, 
      y - height * sprite.anchor.y,
      width, 
      height
    );
  }
  
  ctx.restore();
  return true;
}

/**
 * Verifica si los sprites están listos
 */
export function spritesReady() {
  for (const config of Object.values(SPRITE_CONFIG)) {
    const img = imageCache.get(SPRITE_PATH + config.file);
    if (!img || !img.complete) return false;
  }
  return true;
}

/**
 * Obtiene el progreso de carga (0-1)
 */
export function getLoadProgress() {
  const total = Object.keys(SPRITE_CONFIG).length;
  let loaded = 0;
  
  for (const config of Object.values(SPRITE_CONFIG)) {
    const img = imageCache.get(SPRITE_PATH + config.file);
    if (img && img.complete) loaded++;
  }
  
  return loaded / total;
}

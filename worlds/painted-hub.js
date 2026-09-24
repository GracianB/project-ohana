// Claro pintado. Solo con el aspecto Realista. El mapa de líneas no se toca.
import { ROOMS } from "../systems/map.js";
import { getLook, PAINT_WORLD } from "../characters/look.js";

const SRC = {
  bg: "assets/worlds/hub-bg.jpg",
  ground: "assets/worlds/hub-ground.png",
  plate: "assets/worlds/hub-plate.png",
  catapult: "assets/worlds/hub-catapult.png",
};
const cache = new Map();

function img(name) {
  let el = cache.get(name);
  if (!el) {
    el = new Image();
    el.decoding = "async";
    el.src = SRC[name];
    cache.set(name, el);
  }
  return el.complete && el.naturalWidth > 0 ? el : null;
}

export function paintedHubOn(roomId) {
  return getLook() === "paint" && roomId === "hub" && !!img("bg");
}

function tile(ctx, art, x, y, w, visH, lift, cam) {
  const tileW = visH * (art.naturalWidth / art.naturalHeight);
  let left = x;
  const end = x + w;
  const top = y - lift;
  while (left < end - 0.5) {
    const dw = Math.min(tileW, end - left);
    const sw = art.naturalWidth * (dw / tileW);
    ctx.drawImage(art, 0, 0, sw, art.naturalHeight, left - cam.x, top - cam.y, dw, visH);
    left += dw;
  }
}

/** Fondo, suelo, plataformas y la catapulta del Claro, alineados a la colisión. */
export function drawPaintedHub(ctx, cam, worldW, worldH, viewW, viewH) {
  const room = ROOMS.hub;
  const bg = img("bg");
  // El cuadro cubre la pantalla, no la sala entera. Si no, los árboles salen gigantes.
  if (bg && viewW && viewH) {
    const cover = Math.max(viewW / bg.naturalWidth, viewH / bg.naturalHeight) * 1.28;
    const dw = bg.naturalWidth * cover;
    const dh = bg.naturalHeight * cover;
    ctx.drawImage(bg, (viewW - dw) / 2 - cam.x * 0.035, (viewH - dh) / 2 - cam.y * 0.03, dw, dh);
  } else if (bg) {
    ctx.drawImage(bg, -cam.x, -cam.y, worldW || 1600, worldH || 900);
  }
  const ground = img("ground");
  const plate = img("plate");
  for (const p of room.plats) {
    const x = p[0] * PAINT_WORLD, y = p[1] * PAINT_WORLD, w = p[2] * PAINT_WORLD, h = p[3] * PAINT_WORLD;
    const thick = p[3] > 40;
    const art = thick ? ground : plate;
    if (!art) continue;
    const visH = thick ? 108 : 74;
    const lift = thick ? 36 : 22;
    tile(ctx, art, x, y, w, visH, lift, cam);
  }
  const cat = img("catapult");
  const portal = (room.portals || []).find((p) => p.type === "catapult");
  if (cat && portal) {
    const ih = 190;
    const iw = ih * (cat.naturalWidth / cat.naturalHeight);
    const foot = (portal.y + portal.h) * PAINT_WORLD;
    const cx = (portal.x + portal.w / 2) * PAINT_WORLD;
    ctx.drawImage(cat, cx - iw / 2 - cam.x, foot - ih - cam.y, iw, ih);
  }
}

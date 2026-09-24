// Claro pintado. Solo con el aspecto Realista. El mapa de líneas no se toca.
import { ROOMS } from "../systems/map.js";
import { getLook } from "../characters/look.js";

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
export function drawPaintedHub(ctx, cam) {
  const room = ROOMS.hub;
  const bg = img("bg");
  if (bg) ctx.drawImage(bg, -cam.x, -cam.y, 1600, 900);
  const ground = img("ground");
  const plate = img("plate");
  for (const p of room.plats) {
    const [x, y, w, h] = p;
    const thick = h > 40;
    const art = thick ? ground : plate;
    if (!art) continue;
    const visH = thick ? h + 46 : Math.max(54, h + 36);
    // La hierba ocupa el borde de arriba. Los pies caen en esa línea, no en la tierra.
    const lift = thick ? 34 : Math.round(visH * 0.30);
    tile(ctx, art, x, y, w, visH, lift, cam);
  }
  const cat = img("catapult");
  const portal = (room.portals || []).find((p) => p.type === "catapult");
  if (cat && portal) {
    const ih = 124;
    const iw = ih * (cat.naturalWidth / cat.naturalHeight);
    const foot = portal.y + portal.h;
    ctx.drawImage(cat, portal.x + portal.w / 2 - iw / 2 - cam.x, foot - ih - cam.y, iw, ih);
  }
}

import {memoryBenefits,startMemoryCelebration,MEMORY_REWARDS} from './memory-rewards-v2.js';
// OHANA V467 · MUNDO 1 · Coleccionables unificados (objetos + álbumes = UNO).
// Antes había dos sistemas: "100 objetos por sala" (ohana-room-albums-v1) y
// "100 álbumes personales" (ohana-hero-100-v1:<héroe>). Ahora cada sala grande
// del Mundo 1 tiene UN álbum de 100 cromos (10 páginas × 10) y cada objeto que
// recoges en la sala pega su cromo. Un contador, una interfaz, una reliquia.
//
// MIGRACIÓN SEGURA: al cargar se leen las dos claves antiguas y se UNEN (nunca
// se borran ni se sobrescriben). Lo ya recogido aparece pegado en el álbum.
// Mapa: sala antigua → héroe (ROOM_RELICS) y colección personal → mismo héroe.
//
// CÓMO ENGANCHARLO:
//   import * as W1C from "./world1-collect.js";   (o window.OhanaWorld1Collect)
//   al iniciar partida      → W1C.loadWorld1Collect(g)          // migra y deja g.world1Collect
//   al entrar en sala w1-*  → W1C.enterWorld1Collect(g)         // coloca 100 objetos
//   cada tick               → W1C.updateWorld1Collect(g)
//   dibujo de mundo         → W1C.drawWorld1Collect(ctx, g, cam, t)
//   HUD                     → W1C.drawWorld1CollectHud(ctx, g, W, H)
//   tecla álbum (p.ej. "B") → W1C.toggleWorld1Album(g);  dibujo → W1C.drawWorld1Album(ctx, g, W, H, t)
//   g.save() puede incluir W1C.world1CollectSnapshot(g).
import { WORLD1_ORDER, WORLD1_THEMES, WORLD1_FLOOR, WORLD1_ROOMS } from "./world1-rooms.js";
import { ROOM_RELICS, ALBUM_ROOMS } from "./room-album.js";

export const W1_COLLECT_KEY = "ohana-w1-collect-v1";
export const OLD_ROOM_ALBUM_KEY = "ohana-room-albums-v1";
export const OLD_HERO_KEY = (hero) => "ohana-hero-100-v1:" + hero;
export const ALBUM_SIZE = 100, PAGE_SIZE = 10;
export const PAGE_TITLES = Object.freeze(["Primeros pasos", "Amigos del camino", "Juegos", "Merienda", "Sueños", "Música", "Aventuras", "Secretos", "Familia", "La canción"]);

const okId = (n) => Number.isInteger(n) && n >= 0 && n < ALBUM_SIZE;
const num = (v, d = 0) => (Number.isFinite(v) ? v : d);
const ids = (a) => [...new Set((Array.isArray(a) ? a : []).filter(okId))].sort((x, y) => x - y);
const roomFor = (hero) => "w1-" + hero;
const heroOfRoom = (id) => (typeof id === "string" && id.startsWith("w1-") && WORLD1_ORDER.includes(id.slice(3)) ? id.slice(3) : null);

export function cleanWorld1Collect(raw) {
  const out = { v: 1, rooms: {}, migrated: !!raw?.migrated };
  for (const hero of WORLD1_ORDER) {
    const r = raw?.rooms?.[hero]; const found = ids(r?.found);
    out.rooms[hero] = { found, relic: found.length === ALBUM_SIZE && r?.relic === true };
  }
  return out;
}
export function mergeWorld1Collect(a, b) {
  const A = cleanWorld1Collect(a), B = cleanWorld1Collect(b);
  for (const hero of WORLD1_ORDER) {
    const found = ids([...A.rooms[hero].found, ...B.rooms[hero].found]);
    A.rooms[hero] = { found, relic: found.length === ALBUM_SIZE && (A.rooms[hero].relic || B.rooms[hero].relic || found.length === ALBUM_SIZE) };
  }
  A.migrated = A.migrated || B.migrated;
  return A;
}

function readJSON(storage, key) { try { const s = storage?.getItem?.(key); return s ? JSON.parse(s) : null; } catch (_) { return null; } }

// Lee el progreso antiguo de ambos sistemas y lo traduce al álbum unificado.
export function migrateOldCollect(storage = globalThis.localStorage, g = null) {
  const rooms = {};
  const add = (hero, list, relic) => { if (!WORLD1_ORDER.includes(hero)) return; const r = rooms[hero] ||= { found: [], relic: false }; r.found.push(...ids(list)); r.relic = r.relic || !!relic; };
  const oldAlbums = { ...(readJSON(storage, OLD_ROOM_ALBUM_KEY) || {}), ...(g?.roomAlbums || {}) };
  for (const room of ALBUM_ROOMS) { const v = oldAlbums[room]; if (v) add(ROOM_RELICS[room]?.[0], v.found, v.relic); }
  for (const hero of WORLD1_ORDER) {
    const v = readJSON(storage, OLD_HERO_KEY(hero)); if (v) add(hero, v.ids, v.complete);
    // Respaldo: marcas hero-100 guardadas en g.secrets por la versión anterior.
    for (const list of Object.values(g?.secrets || {})) if (Array.isArray(list)) for (const k of list) {
      const m = typeof k === "string" && k.match(/^hero-100:([a-z]+):(\d+)$/); if (m && m[1] === hero) add(hero, [Number(m[2])], false);
    }
  }
  return cleanWorld1Collect({ rooms, migrated: true });
}

export function loadWorld1Collect(g, storage = g?.personalCollectionStorage || globalThis.localStorage) {
  const saved = cleanWorld1Collect(readJSON(storage, W1_COLLECT_KEY) || g?.world1Collect || {});
  const merged = mergeWorld1Collect(saved, migrateOldCollect(storage, g)); // la unión nunca pierde nada
  merged.migrated = true;
  if (g) { g.world1Collect = merged; g.world1CollectUI ||= { open: false, page: 0, toast: null }; }
  persist(g, storage, merged);
  return merged;
}

function persist(g, storage = g?.personalCollectionStorage || globalThis.localStorage, data = g?.world1Collect) {
  if (!data) return false;
  try { const merged = mergeWorld1Collect(readJSON(storage, W1_COLLECT_KEY) || {}, data); if (g) g.world1Collect = merged; storage?.setItem?.(W1_COLLECT_KEY, JSON.stringify(merged)); } catch (_) { return false; }
  g?.onWorld1CollectChange?.();
  return true;
}

function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let s = seed >>> 0 || 1; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }

// 100 objetos por sala: 10 por página; cada página vive en una franja de la sala.
// 70 en el suelo / repisas bajas (camino), 30 "reto" (repisas, cerca de estaciones o en el aire a un salto).
export function world1CollectPlacements(room) {
  if (!room?.plats?.length) return [];
  const W = Math.max(1000, num(room.width, 9600)), r = rng(hash("collect:" + room.id));
  const ledges = room.plats.filter((p) => p[3] <= 40 && p[2] >= 90);
  const stations = room.seal?.stations || [];
  const band = (W - 600) / PAGE_SIZE;
  return Array.from({ length: ALBUM_SIZE }, (_, id) => {
    const page = Math.floor(id / PAGE_SIZE), k = id % PAGE_SIZE, challenge = k >= 7;
    let x = 300 + page * band + (k + 0.5) / PAGE_SIZE * band;
    const floor=room.plats.filter(p=>p[3]>40&&x>=p[0]-14&&x<=p[0]+p[2]+14).sort((a,b)=>a[1]-b[1])[0];
    let y = (floor?.[1]??WORLD1_FLOOR) - 34 - (k % 3 === 1 ? 46 : 0);
    if (challenge) {
      const inBand = ledges.filter((p) => p[0] + p[2] > 300 + page * band && p[0] < 300 + (page + 1) * band);
      if (inBand.length) { const p = inBand[k % inBand.length]; x = p[0] + 20 + r() * Math.max(1, p[2] - 40); y = p[1] - 32; }
      else if (stations.length) { const s = stations[(page + k) % stations.length]; x = num(s.x, x) + (k - 8) * 70; y = WORLD1_FLOOR - 190; }
      else y = WORLD1_FLOOR - 170;
    }
    x = Math.round(Math.max(60, Math.min(W - 60, num(x, 300)))); y = Math.round(num(y, WORLD1_FLOOR - 34));
    return { id, page, x, y, challenge };
  });
}

export function enterWorld1Collect(g) {
  const hero = heroOfRoom(g?.roomId);
  if (!g.world1Collect) loadWorld1Collect(g);
  g.world1CollectItems = hero ? world1CollectPlacements(g.roomDef || WORLD1_ROOMS[g.roomId]) : [];
  g.world1CollectHero = hero;
  return g.world1CollectItems.length;
}

export function world1AlbumFor(g, hero) { return g?.world1Collect?.rooms?.[hero] || { found: [], relic: false }; }
export function countsByHero(g) { const o = {}; for (const h of WORLD1_ORDER) o[h] = world1AlbumFor(g, h).found.length; return o; }
export function world1CollectTotal(g) { let n = 0; for (const h of WORLD1_ORDER) n += world1AlbumFor(g, h).found.length; return { found: n, total: ALBUM_SIZE * WORLD1_ORDER.length }; }
export function pageDone(album, page) { const s = new Set(album.found); for (let i = 0; i < PAGE_SIZE; i++) if (!s.has(page * PAGE_SIZE + i)) return false; return true; }

export function takeWorld1Item(g, id) {
  const hero = g?.world1CollectHero; if (!hero || !okId(id)) return false;
  const a = g.world1Collect.rooms[hero]; if (a.found.includes(id)) return false;
  a.found.push(id); a.found.sort((x, y) => x - y);
  g.score = num(g.score) + 10;
  const th = WORLD1_THEMES[hero], page = Math.floor(id / PAGE_SIZE), p = g.player, ui = (g.world1CollectUI ||= { open: false, page: 0, toast: null });
  // The HUD counter updates for every item; reserve words for meaningful beats.
  g.fx?.emit?.(num(p?.x) + num(p?.w) / 2, num(p?.y), {color:th.color,count:g.reduceMotion?2:5,size:2,life:18,up:1});
  if (a.found.length === 1) g.nums?.add?.(num(p?.x), num(p?.y) - 20, "PRIMER RECUERDO · ÁLBUM 1/100", th.color, false);
  if (pageDone(a, page)) { ui.toast = { t: 0, max: 150, text: `Página ${page + 1} completa · ${PAGE_TITLES[page]}`, color: th.color }; g.onWorld1Beat?.("album-page", hero, page); if (p) p.health = Math.min(num(p.maxHealth, p.health), num(p.health) + 10); }
  if (a.found.length === ALBUM_SIZE && !a.relic) { a.relic = true; ui.toast = { t: 0, max: 240, text: `¡Álbum completo! Reliquia: ${th.relic}`, color: "#fff1b5", big: true }; g.onWorld1Beat?.("album-relic", hero); startMemoryCelebration(g,hero); }
  if([25,50].includes(a.found.length)){ui.toast={t:0,max:180,text:a.found.length===25?'BRÚJULA · Los recuerdos aparecen en tu mapa':'IMÁN · Recoges recuerdos desde más lejos',color:th.color};g.onWorld1Beat?.('album-unlock',hero,a.found.length);}
  persist(g); g.save?.();
  return true;
}

export function updateWorld1Collect(g) {
  const p = g?.player, ui = g?.world1CollectUI;
  if (ui?.toast && ++ui.toast.t >= ui.toast.max) ui.toast = null;
  if (!p || p.dead || !g.world1CollectHero || ui?.open) return;
  const a = g.world1Collect.rooms[g.world1CollectHero], have = new Set(a.found);
  const benefit=memoryBenefits(a.found.length),rx=benefit.magnet?58:26,ry=benefit.magnet?62:34;
  const px = num(p.x) + num(p.w, 24) / 2, py = num(p.y) + num(p.h, 30) / 2;
  for (const it of g.world1CollectItems || []) if (!have.has(it.id) && Math.abs(px - it.x) < rx && Math.abs(py - it.y) < ry) takeWorld1Item(g, it.id);
}

export function toggleWorld1Album(g, open) { const ui = (g.world1CollectUI ||= { open: false, page: 0, toast: null }); ui.open = open ?? !ui.open; g.renderDirty = true; return ui.open; }
export function world1AlbumKey(g, key) { const ui = g.world1CollectUI; if (!ui?.open) return false; if (key === "ArrowRight") ui.page = (ui.page + 1) % PAGE_SIZE; else if (key === "ArrowLeft") ui.page = (ui.page + PAGE_SIZE - 1) % PAGE_SIZE; else if (key === "Escape" || key === "b" || key === "B") ui.open = false; else return false; g.renderDirty = true; return true; }

// One page of the real persistent collection, shared by the accessible panel.
export function world1AlbumView(g) {
  const hero = g.world1CollectHero || WORLD1_ORDER[0], th = WORLD1_THEMES[hero];
  const album = world1AlbumFor(g, hero), found = new Set(album.found);
  const page = Math.max(0, Math.min(9, Number(g.world1CollectUI?.page) || 0));
  return {hero, title:"Álbum de " + th.short, count:found.size, page,
    heading:`Página ${page + 1}/10 · ${PAGE_TITLES[page]}`,
    complete:pageDone(album,page), relic:album.relic ? th.relic : null,
    cards:Array.from({length:PAGE_SIZE},(_,i)=>({id:page * PAGE_SIZE + i,found:found.has(page * PAGE_SIZE + i)}))};
}
export function syncWorld1Album(g, doc = globalThis.document) {
  const root = doc?.getElementById("world1-album");if(!root)return;
  const open = !!(g.running && g.world1CollectHero && g.world1CollectUI?.open);
  if(root.classList.contains("open") !== open)root.classList.toggle("open",open);
  if(!open)return;
  const view = world1AlbumView(g), key = [view.hero,view.page,world1AlbumFor(g,view.hero).found.join(","),view.relic].join(":");
  if(root.dataset.view === key)return;root.dataset.view = key;
  root.querySelector("h2").textContent = view.title;
  root.querySelector(".album-count").textContent = `${view.count}/100 recuerdos · colección opcional`;
  root.querySelector(".album-page-title").textContent = view.heading + (view.complete ? " ✓" : "");
  root.querySelector(".album-reward").textContent = view.relic ? "Reliquia conseguida: " + view.relic + " · Firma permanente: " + MEMORY_REWARDS[view.hero][2] : "Cada página: +10 vida · 25: brújula en el mapa · 50: imán de recuerdos · 100: celebración propia y firma visual permanente.";
  let replay=root.querySelector('[data-memory-replay]');
  if(!replay){replay=doc.createElement('button');replay.type='button';replay.dataset.memoryReplay='true';replay.textContent='Ver mi celebración';root.querySelector('.album-reward').after(replay);replay.onclick=()=>{toggleWorld1Album(g,false);startMemoryCelebration(g,g.world1CollectHero,true);};}
  replay.hidden=!view.relic;
  const grid=root.querySelector("ol");
  grid.replaceChildren(...view.cards.map(card=>{
    const li=doc.createElement("li");li.className=card.found?"found":"pending";
    li.textContent=card.found?"✦ " + (card.id+1):"?";
    li.setAttribute("aria-label","Recuerdo " + (card.id+1) + (card.found?" conseguido":" pendiente"));return li;
  }));
}

// Cromo: el emblema reducido es un rombo con el color del héroe; los "reto" tienen borde.
export function drawWorld1Collect(ctx, g, cam, t = 0) {
  const hero = g?.world1CollectHero; if (!hero) return;
  const a = g.world1Collect.rooms[hero], have = new Set(a.found), c = WORLD1_THEMES[hero].color;
  const vw = num(g.viewW, 1600), vh = num(g.viewH, 1000), cx = num(cam?.x), cy = num(cam?.y);
  ctx.save(); ctx.fillStyle = c; ctx.strokeStyle = "#fff5dc"; ctx.lineWidth = 1.5;
  for (const it of g.world1CollectItems || []) {
    if (have.has(it.id)) continue;
    const x = it.x - cx, y = it.y - cy + Math.sin(num(t) * 0.06 + it.id) * 3;
    if (x < -20 || x > vw + 20 || y < -20 || y > vh + 20) continue;
    if(hero==='kilo'&&g.roomDef?.kiloEncounterVersion){
      // A little petal carries the tune; XP keeps its separate gold diamond.
      ctx.save();ctx.translate(x,y);ctx.rotate(g.reduceMotion?-.2:Math.sin(num(t)*.025+it.id)*.14-.2);
      ctx.fillStyle=it.challenge?'#f5d892':'#efb7b0';ctx.strokeStyle='#655c58';ctx.lineWidth=1.4;
      ctx.beginPath();ctx.moveTo(-10,6);ctx.bezierCurveTo(-15,-5,-2,-16,9,-13);ctx.bezierCurveTo(17,0,5,13,-10,6);ctx.fill();ctx.stroke();
      ctx.strokeStyle='#fff5dd';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-8,6);ctx.quadraticCurveTo(0,0,8,-10);ctx.stroke();
      ctx.fillStyle='#58745a';ctx.beginPath();ctx.ellipse(-8,9,5,2.5,-.5,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fff5d8';ctx.beginPath();ctx.arc(2,-3,2,0,Math.PI*2);ctx.fill();
      ctx.restore();continue;
    }
    // A small paper card reads as a memory, distinct from an XP crystal.
    ctx.fillStyle = "#f6ecd8";ctx.strokeStyle = c;ctx.lineWidth = it.challenge ? 2.5 : 1.5;
    ctx.beginPath();ctx.roundRect(x - 7,y - 10,14,20,3);ctx.fill();ctx.stroke();
    ctx.fillStyle = c;ctx.fillRect(x - 4,y - 6,8,8);
    ctx.fillStyle = "#4a3d55";ctx.fillRect(x - 3,y + 5,6,1.5);
  }
  ctx.restore();
}

export function drawWorld1CollectHud(ctx, g, W, H, options = {}) {
  const hero = g?.world1CollectHero; const ui = g?.world1CollectUI; W = num(W, 1280); H = num(H, 720);
  ctx.save(); ctx.textBaseline = "middle";
  if (hero && options.badge !== false) {
    const a = g.world1Collect.rooms[hero], th = WORLD1_THEMES[hero], n = a.found.length, page = Math.min(9, Math.floor(n / PAGE_SIZE));
    const x = W - 250, y = 18; ctx.fillStyle = "rgba(18,13,36,.72)"; ctx.fillRect(x, y, 232, 44);
    ctx.fillStyle = th.color; ctx.fillRect(x, y + 40, 232 * n / ALBUM_SIZE, 4);
    ctx.font = "bold 16px sans-serif"; ctx.textAlign = "left"; ctx.fillText(`✦ ${n}/100`, x + 10, y + 14);
    ctx.fillStyle = "#e8dcff"; ctx.font = "12px sans-serif"; ctx.fillText(`Álbum de ${th.short} · ${a.relic ? "reliquia ✓" : "pág. " + (page + 1) + " " + PAGE_TITLES[page]}`, x + 10, y + 31);
  }
  if (ui?.toast) { const k = ui.toast; ctx.globalAlpha = Math.min(1, (k.max - k.t) / 30, k.t / 10); ctx.textAlign = "center"; ctx.fillStyle = k.color; ctx.font = `bold ${k.big ? 30 : 20}px sans-serif`; ctx.fillText(k.text, W / 2, H * 0.2,W*.86); }
  ctx.restore();
}

// Interfaz del álbum: 10 páginas; muestra la del héroe de la sala (o la elegida).
export function drawWorld1Album(ctx, g, W, H, t = 0) {
  const ui = g?.world1CollectUI; if (!ui?.open) return;
  W = num(W, 1280); H = num(H, 720);
  const hero = g.world1CollectHero || WORLD1_ORDER[0], th = WORLD1_THEMES[hero], a = world1AlbumFor(g, hero), have = new Set(a.found);
  const tot = world1CollectTotal(g);
  ctx.save(); ctx.fillStyle = "rgba(10,8,22,.86)"; ctx.fillRect(0, 0, W, H);
  const bw = Math.min(W * 0.8, 900), bh = Math.min(H * 0.78, 560), bx = (W - bw) / 2, by = (H - bh) / 2;
  ctx.fillStyle = "#f6ecd8"; ctx.fillRect(bx, by, bw, bh); ctx.fillStyle = th.tint; ctx.fillRect(bx, by, bw, 54); ctx.fillRect(bx + bw / 2 - 2, by + 54, 4, bh - 54);
  ctx.fillStyle = "#1e1838"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "bold 22px sans-serif";
  ctx.fillText(`Álbum de ${th.short} · ${a.found.length}/100   (Mundo 1: ${tot.found}/${tot.total})`, W / 2, by + 27);
  for (let side = 0; side < 2; side++) {
    const page = (ui.page + side) % PAGE_SIZE, px = bx + side * bw / 2 + 24, pw = bw / 2 - 48, py = by + 74;
    ctx.fillStyle = "#3a3160"; ctx.font = "bold 16px sans-serif"; ctx.fillText(`${page + 1} · ${PAGE_TITLES[page]}${pageDone(a, page) ? " ✓" : ""}`, px + pw / 2, py);
    const cw = pw / 5, ch = (bh - 130) / 2;
    for (let i = 0; i < PAGE_SIZE; i++) {
      const id = page * PAGE_SIZE + i, cx = px + (i % 5) * cw, cy = py + 24 + Math.floor(i / 5) * ch;
      ctx.strokeStyle = "#b9a98a"; ctx.lineWidth = 1.5; ctx.strokeRect(cx + 4, cy + 4, cw - 8, ch - 8);
      if (have.has(id)) { ctx.fillStyle = th.color; ctx.fillRect(cx + 6, cy + 6, cw - 12, ch - 12); ctx.fillStyle = "#1e1838"; ctx.font = "bold 13px sans-serif"; ctx.fillText(String(id + 1), cx + cw / 2, cy + ch - 18); ctx.beginPath(); const mx = cx + cw / 2, my = cy + ch / 2 - 6; ctx.moveTo(mx, my - 14); ctx.lineTo(mx + 10, my); ctx.lineTo(mx, my + 14); ctx.lineTo(mx - 10, my); ctx.closePath(); ctx.fill(); }
      else { ctx.fillStyle = "#b9a98a"; ctx.font = "13px sans-serif"; ctx.fillText("?", cx + cw / 2, cy + ch / 2); }
    }
  }
  ctx.fillStyle = "#e8dcff"; ctx.font = "14px sans-serif"; ctx.fillText("← → pasar página · B / Esc cerrar" + (a.relic ? " · Reliquia: " + th.relic : ""), W / 2, by + bh + 22);
  ctx.restore();
}

export function world1CollectSnapshot(g) { const hero = g?.world1CollectHero; const a = hero ? world1AlbumFor(g, hero) : null; return { hero, count: a?.found.length || 0, total: ALBUM_SIZE, relic: !!a?.relic, all: world1CollectTotal(g), open: !!g?.world1CollectUI?.open }; }

export const OhanaWorld1Collect = Object.freeze({ load: loadWorld1Collect, migrate: migrateOldCollect, clean: cleanWorld1Collect, merge: mergeWorld1Collect, placements: world1CollectPlacements, enter: enterWorld1Collect, update: updateWorld1Collect, take: takeWorld1Item, draw: drawWorld1Collect, drawHud: drawWorld1CollectHud, drawAlbum: drawWorld1Album, toggle: toggleWorld1Album, key: world1AlbumKey, countsByHero, total: world1CollectTotal, snapshot: world1CollectSnapshot, KEY: W1_COLLECT_KEY });
if (typeof globalThis !== "undefined") globalThis.OhanaWorld1Collect = OhanaWorld1Collect;

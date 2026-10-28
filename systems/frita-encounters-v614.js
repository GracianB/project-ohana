// V614 — Mercado Dorado de Frita: ruta canónica de 14400px, 3 géiseres de fritura,
// 3 abismos de aceite hirviendo, pasillos balísticos despejados y 5 especies de comiditas.
import {FRITA_BOSS_ID, FRITA_BOSS} from './frita-boss.js';
const FLOOR = 1134;

export const FRITA_CHAPTER_BOSS_ID = FRITA_BOSS_ID;
export const FRITA_CHAPTER_ARENA = Object.freeze({ left: 8260, right: 9320, floor: 1134, hp: 640 });

const CAST_ROLES = Object.freeze({
 cangrejo:  'pursuer',
 gaviota:   'flyer',
 brasita:   'shooter',
 rana:      'jumper',
 cucaracho: 'shield'
});

export function authorFritaEncounters(room) {
 if (room.hero !== 'frita') return room;
 room.fritaEncounterVersion = 614;
 room.width = 14400;

 // Mantener estaciones de géiser canónicas del tema
 const vents = room.seal.stations.filter(s => s.kind === 'geyser');
 room.seal.altar = { x: 13920, y: FLOOR };

 // Geometría y referencias V614
 room.fritaArena = FRITA_CHAPTER_ARENA;

 // ── Suelo y Abismos de Aceite Hirviendo ────────────────────────────────────
 const floor = [
  [0, FLOOR, 1080, 126],
  [1340, FLOOR, 1520, 126],
  [3060, FLOOR, 2040, 126],
  [5400, FLOOR, 640, 126],
  [6310, FLOOR, 3290, 126],
  [9600, FLOOR, 4800, 126] // Contrato de v2-adventure.test.js
 ];

 // Abismos de aceite hirviendo en las fallas naturales
 room.hazards = [
  { id: 'frita-oil-0', x: 1080, y: FLOOR - 20, w: 260, h: 380, type: 'death', label: 'FREIDORA PROFUNDA I', color: '#ff8f00', heroEscape: 'frita' },
  { id: 'frita-oil-1', x: 2860, y: FLOOR - 20, w: 200, h: 380, type: 'death', label: 'CALDERO DE ACEITE',   color: '#ff6f00', heroEscape: 'frita' },
  { id: 'frita-oil-2', x: 5100, y: FLOOR - 20, w: 300, h: 380, type: 'death', label: 'FOSO DE FRITURA',     color: '#e65100', heroEscape: 'frita' }
 ];

 // Cornisas de toldos diner, letreros de neón y pasarelas del mercado
 const shelves = [
  // Puentes de salto sobre las 3 grietas
  [1090, FLOOR - 65, 240], [2870, FLOOR - 70, 180], [5110, FLOOR - 65, 280],

  // Sector 0 — Paseo de la bahía (x: 0 – 2400)
  [380, 1054, 200], [680, 974, 190], [980, 894, 200],
  [1280, 974, 180], [1560, 894, 200], [1840, 824, 190], [2140, 934, 180],

  // Sector 1 — Puestos crujientes (x: 2400 – 4800)
  [2580, 1034, 210], [2860, 954, 200], [3140, 874, 200],
  [4180, 874, 190], [4440, 794, 200],

  // Sector 2 — Fuentes de aceite (x: 4800 – 7200)
  [5000, 1034, 200], [5260, 934, 200],
  [6540, 894, 190], [6840, 814, 200],

  // Sector 3 — Bazar de especias (x: 7200 – 9600)
  [7420, 1034, 200], [7700, 934, 190], [7980, 834, 210],
  [8260, 894, 200], [8560, 794, 200], [8860, 714, 190], [9080, 794, 200],

  // Pre-arena
  [9340, 1004, 220], [9520, 924, 200]
 ];

 const expPlats = (room.plats || []).filter(p => p[0] >= 9600 && p[1] < FLOOR);
 const combined = [...floor, ...expPlats, ...shelves.map(s => [...s, 22])];

 // Contrato estricto de world1-frita-geyser-corridor.test.js:
 // Ninguna plataforma en el pasillo de cada géiser (entre vent.x y vent.prize.x con margen 94)
 // a una altura y > FLOOR - 590 y y < FLOOR.
 room.plats = combined.filter((p, idx) => {
  if (idx === 0) return true; // keep floor
  const [px, py, pw] = p;
  if (py >= FLOOR || py <= FLOOR - 590) return true;
  for (const vent of vents) {
   if (!vent.prize) continue;
   const corridorOverlap = px < Math.max(vent.x, vent.prize.x) + 94 && px + pw > Math.min(vent.x, vent.prize.x) - 94;
   if (corridorOverlap) return false;
  }
  return true;
 });

 // ── Fauna y Encuentros ───────────────────────────────────────────────────────
 // 5 especies de comiditas con roles complementarios:
 // cangrejo (pursuer), gaviota (flyer), brasita (shooter), rana (jumper), cucaracho (shield).
 const cast = [
  // ─ Grupo 0 (Paseo de la bahía, x: 1050 – 2400) ─
  [1120, 'cangrejo',  52, 0],
  [1520, 'brasita',   54, 0],
  [1940, 'cucaracho', 56, 0],
  [2380, 'rana',      58, 0],

  // ─ Grupo 1 (Puestos crujientes, x: 2600 – 4400) ─
  [2720, 'gaviota',   78, 1],
  [3120, 'cangrejo',  80, 1],
  [3500, 'cucaracho', 82, 1],
  [3880, 'brasita',   86, 1],

  // ─ Grupo 2 (Fuentes de aceite, x: 5000 – 6800) ─
  [5120, 'rana',      102, 2],
  [5380, 'gaviota',   106, 2],
  [5720, 'cangrejo',  110, 2],
  [6420, 'cucaracho', 114, 2],

  // ─ Grupo 3 (Bazar de especias, x: 7200 – 8050) ─
  [7420, 'brasita',   126, 3],
  [7680, 'gaviota',   128, 3],
  [7880, 'cangrejo',  132, 3],
  [8020, 'rana',      134, 3],

  // ─ Pre-arena sentinels (Antes del Rey Crujiente) ─
  [8240, 'cucaracho', 142, 4],
  [8380, 'gaviota',   144, 4],
  [8520, 'cangrejo',  148, 4]
 ];

 const expFoes = (room.foes || []).filter(f => f[4]?.expedition).map(f => {
  const [x, y, kind, boss, data] = f;
  return [x, y, kind, boss, { ...data, homeX: data.homeX ?? x, leash: data.leash ?? { left: Math.max(9000, x - 400), right: Math.min(14200, x + 400) } }];
 });

 const authored = cast.map(([x, kind, hp, stage], i) => {
  const role = CAST_ROLES[kind], air = role === 'flyer' || role === 'shooter';
  const y = air ? (stage === 1 ? FLOOR - 240 : stage === 2 ? FLOOR - 270 : FLOOR - 210) : FLOOR - 40;
  return [x, y, kind, false, {
   role, chapterHP: hp, variant: i % 3,
   name: {
    cangrejo:  'Cangrejo crujiente',
    gaviota:   'Gaviota ladrona',
    brasita:   'Gota de fritura',
    rana:      'Rana rebozada',
    cucaracho: 'Escarabajo de cartón'
   }[kind],
   fritaEncounter: true, stage, authoredEncounter: stage,
   anchorFloor: air ? undefined : FLOOR, anchorY: y, homeX: x,
   leash: { left: Math.max(600, x - 440), right: Math.min(13800, x + 480) },
   flightBand: air ? { top: y - 130, bottom: y + 190 } : undefined
  }];
 });

 room.foes = [...authored, ...expFoes];

 // ── Orbes de esencia dorada — 25 orbes ──────────────────────────────────────
 room.orbs = [];
 for (const [x, y] of [
  // Sector 0
  [680, 1089], [880, 1089], [1100, 850], [1280, 929], [1560, 849], [1840, 775], [2140, 885],
  // Sector 1
  [2580, 989], [2860, 905], [3140, 825], [3600, 720], [4180, 825], [4440, 745],
  // Sector 2
  [5000, 989], [5260, 885], [5600, 750], [6540, 845], [6840, 765],
  // Sector 3
  [7420, 989], [7700, 885], [7980, 785], [8260, 845], [8560, 745],
  // Pre-arena
  [8860, 665], [9340, 955]
 ]) room.orbs.push([x, y]);

 return room;
}

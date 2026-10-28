// V615 — Puerto del Horno de Pizza: ruta canónica de 14400px, 1 horno refractario central,
// 3 comensales trattoria respetando walking-budget, 3 fosos de salsa marinara y 5 especies culinarias.
import {PIZZA_BOSS_ID, PIZZA_BOSS} from './pizza-boss.js';
const FLOOR = 1134;

export const PIZZA_CHAPTER_BOSS_ID = PIZZA_BOSS_ID;
export const PIZZA_CHAPTER_ARENA = Object.freeze({ left: 8260, right: 9320, floor: 1134, hp: 640 });

const CAST_ROLES = Object.freeze({
 pez:      'jumper',
 cangrejo: 'shield',
 anguila:  'shooter',
 medusa:   'flyer',
 gaviota:  'pursuer'
});

export function authorPizzaEncounters(room) {
 if (room.hero !== 'pizza') return room;
 room.pizzaEncounterVersion = 615;
 room.width = 14400;

 // Mantener estaciones canónicas que satisfacen el contrato de reparto y walking budget
 room.seal.altar = { x: 13920, y: FLOOR };

 // Geometría y referencias V615
 room.pizzaArena = PIZZA_CHAPTER_ARENA;

 // ── Suelo y Abismos de Salsa Marinara y Queso Fundido ──────────────────────
 const floor = [
  [0, FLOOR, 1080, 126],
  [1330, FLOOR, 1690, 126],
  [3320, FLOOR, 1340, 126],
  [4840, FLOOR, 1540, 126],
  [6660, FLOOR, 2940, 126],
  [9600, FLOOR, 4800, 126] // Contrato de v2-adventure.test.js
 ];

 // Abismos de pomodoro hirviendo y queso volcánico
 room.hazards = [
  { id: 'pizza-sauce-0', x: 1080, y: FLOOR - 20, w: 250, h: 380, type: 'death', label: 'FOSO DE SALSA MARINARA', color: '#b71c1c', heroEscape: 'pizza' },
  { id: 'pizza-sauce-1', x: 3020, y: FLOOR - 20, w: 300, h: 380, type: 'death', label: 'CALDERO DE POMODORO',    color: '#c62828', heroEscape: 'pizza' },
  { id: 'pizza-sauce-2', x: 6380, y: FLOOR - 20, w: 280, h: 380, type: 'death', label: 'CORRIENTE DE QUESO',     color: '#e64a19', heroEscape: 'pizza' }
 ];

 // Cornisas de trattorias, tejados mediterráneos y pasarelas de reparto
 const shelves = [
  // Puentes de cruce sobre las 3 grietas
  [1090, FLOOR - 65, 230], [3030, FLOOR - 70, 280], [6390, FLOOR - 65, 260],

  // Sector 0 — Muelle del Horno (x: 0 – 3000)
  [380, 1054, 200], [680, 974, 190], [980, 894, 200],
  [1480, 1034, 190], [1720, 954, 200], [2280, 1014, 200], [2560, 934, 190], [2840, 854, 200],

  // Sector 1 — Calle de la Masa hacia Cliente 1 (x: 3000 – 4800, Cliente 1 en 4080)
  [3420, 1034, 200], [3680, 954, 210], [3920, 874, 200],
  [4340, 1014, 200], [4580, 934, 190],

  // Sector 2 — Paseo del Queso hacia Cliente 2 (x: 4800 – 6600, Cliente 2 en 5680)
  [4960, 1034, 210], [5240, 954, 200], [5500, 874, 200],
  [5860, 1014, 200], [6120, 934, 190],

  // Sector 3 — Plaza Trattoria hacia Cliente 3 (x: 6600 – 9600, Cliente 3 en 7280)
  [6780, 1034, 200], [7040, 954, 200],
  [7480, 1014, 200], [7760, 934, 210], [8040, 854, 200],
  [8340, 914, 190], [8620, 834, 200], [8900, 754, 200], [9180, 834, 190],

  // Pre-arena
  [9340, 1004, 220], [9520, 924, 200]
 ];

 const expPlats = (room.plats || []).filter(p => p[0] >= 9600 && p[1] < FLOOR);
 room.plats = [...floor, ...expPlats, ...shelves.map(s => [...s, 22])];

 // ── Fauna y Encuentros ───────────────────────────────────────────────────────
 // 5 especies culinarias con roles complementarios:
 // pez (jumper), cangrejo (shield), anguila (shooter), medusa (flyer), gaviota (pursuer).
 const cast = [
  // ─ Sector 0 (Muelle del Horno, x: 800 – 2800) ─
  [850,  'pez',      50, 0],
  [1450, 'cangrejo', 54, 0],
  [1800, 'anguila',  56, 0],
  [2400, 'medusa',   58, 0],
  [2750, 'gaviota',  62, 0],

  // ─ Sector 1 (Calle de la Masa, x: 3200 – 4600) ─
  [3350, 'pez',      76, 1],
  [3750, 'cangrejo', 80, 1],
  [4150, 'gaviota',  82, 1],
  [4550, 'anguila',  86, 1],

  // ─ Sector 2 (Paseo del Queso, x: 4900 – 6300) ─
  [5050, 'medusa',   100, 2],
  [5350, 'pez',      104, 2],
  [5750, 'cangrejo', 108, 2],
  [6150, 'anguila',  112, 2],

  // ─ Sector 3 (Plaza Trattoria, x: 6700 – 8500) ─
  [6850, 'gaviota',  122, 3],
  [7150, 'pez',      126, 3],
  [7650, 'cangrejo', 130, 3],
  [8150, 'medusa',   134, 3],
  [8450, 'anguila',  138, 3],

  // ─ Pre-arena sentinels (Antes del Chef Magmático) ─
  [8850, 'gaviota',  144, 4],
  [9150, 'pez',      148, 4],
  [9450, 'cangrejo', 152, 4]
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
    pez:      'Pez pomodoro',
    cangrejo: 'Cangrejo calzone',
    anguila:  'Anguila mozzarella',
    medusa:   'Medusa de orégano',
    gaviota:  'Gaviota pizzera'
   }[kind],
   pizzaEncounter: true, stage, authoredEncounter: stage,
   anchorFloor: air ? undefined : FLOOR, anchorY: y, homeX: x,
   leash: { left: Math.max(600, x - 440), right: Math.min(13800, x + 480) },
   flightBand: air ? { top: y - 130, bottom: y + 190 } : undefined
  }];
 });

 room.foes = [...authored, ...expFoes];

 // ── Orbes de esencia de albahaca y parmesano — 25 orbes ─────────────────────
 room.orbs = [];
 for (const [x, y] of [
  // Sector 0
  [500, 1089], [780, 1089], [980, 849], [1480, 989], [1720, 905], [2280, 965], [2560, 885],
  // Sector 1
  [3420, 989], [3680, 905], [3920, 825], [4340, 965], [4580, 885],
  // Sector 2
  [4960, 989], [5240, 905], [5500, 825], [5860, 965], [6120, 885],
  // Sector 3
  [6780, 989], [7040, 905], [7480, 965], [7760, 885], [8040, 805],
  // Pre-arena
  [8340, 865], [8620, 785], [9340, 955]
 ]) room.orbs.push([x, y]);

 return room;
}

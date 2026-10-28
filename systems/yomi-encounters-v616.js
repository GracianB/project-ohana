// V616 — Observatorio Astral de Yomi: ruta canónica de 14400px, 4 terminales cuánticos,
// 3 abismos de vacío astral con puentes de luz de fibra óptica, 25 orbes y 5 especies de fauna estelar.
import {YOMI_BOSS_ID, YOMI_BOSS} from './yomi-boss.js';
const FLOOR = 1134;

export const YOMI_CHAPTER_BOSS_ID = YOMI_BOSS_ID;
export const YOMI_CHAPTER_ARENA = Object.freeze({ left: 8260, right: 9320, floor: 1134, hp: 640 });

const CAST_ROLES = Object.freeze({
 ufo:        'gunner',
 phosquito:  'flyer',
 brasita:    'shooter',
 medusa:     'shield',
 murcielago: 'pursuer'
});

export function authorYomiEncounters(room) {
 if (room.hero !== 'yomi') return room;
 room.yomiEncounterVersion = 616;
 room.width = 14400;

 // Mantener los 4 nodos canónicos de sincronía
 room.seal.altar = { x: 13920, y: FLOOR };

 // Geometría y referencias V616
 room.yomiArena = YOMI_CHAPTER_ARENA;

 // ── Suelo y Abismos de Vacío Astral ────────────────────────────────────────
 const floor = [
  [0, FLOOR, 1100, 126],
  [1380, FLOOR, 1680, 126],
  [3340, FLOOR, 2880, 126],
  [6500, FLOOR, 940, 126],
  [7640, FLOOR, 1960, 126],
  [9600, FLOOR, 4800, 126] // Contrato de v2-adventure.test.js
 ];

 // Abismos de vacío cósmico donde se disuelve la luz
 room.hazards = [
  { id: 'yomi-void-0', x: 1100, y: FLOOR - 20, w: 280, h: 380, type: 'death', label: 'VACÍO CUÁNTICO I',       color: '#0d1430', heroEscape: 'yomi' },
  { id: 'yomi-void-1', x: 3060, y: FLOOR - 20, w: 280, h: 380, type: 'death', label: 'ABISMO DE FIBRA ÓPTICA', color: '#1a237e', heroEscape: 'yomi' },
  { id: 'yomi-void-2', x: 6220, y: FLOOR - 20, w: 280, h: 380, type: 'death', label: 'FALLA DE MEMORIA',       color: '#0a1026', heroEscape: 'yomi' }
 ];

 // Pasarelas de fibra óptica, miradores estelares y repisas del observatorio
 const shelves = [
  // Puentes de luz sobre las 3 grietas del abismo
  [1110, FLOOR - 65, 260], [3070, FLOOR - 70, 260], [6230, FLOOR - 65, 260],

  // Sector 0 — Antena de bienvenida (x: 0 – 2400, hacia Nodo 0 en 2400)
  [380, 1054, 200], [680, 974, 190], [980, 894, 200],
  [1480, 1034, 200], [1740, 954, 190], [2020, 874, 200], [2280, 1014, 190],

  // Sector 1 — Bosque de datos (x: 2400 – 4000, hacia Nodo 1 en 4000)
  [2580, 1034, 210], [2860, 954, 200],
  [3420, 1034, 200], [3680, 954, 200], [3920, 874, 210],

  // Sector 2 — Sala de servidores (x: 4000 – 5600, hacia Nodo 2 en 5600)
  [4180, 1034, 200], [4440, 954, 190], [4720, 874, 200],
  [5000, 1014, 200], [5260, 934, 200], [5500, 854, 210],

  // Sector 3 — Jardín de constelaciones (x: 5600 – 7200, hacia Nodo 3 en 7200)
  [5780, 1034, 200], [6040, 954, 190],
  [6580, 1014, 200], [6840, 934, 200], [7080, 854, 200],

  // Sector 4 — Red neuronal hacia pre-arena (x: 7200 – 9600)
  [7420, 1034, 200], [7700, 954, 200], [7980, 874, 210],
  [8260, 914, 190], [8540, 834, 200], [8820, 754, 200], [9100, 834, 190],

  // Pre-arena
  [9340, 1004, 220], [9520, 924, 200]
 ];

 const expPlats = (room.plats || []).filter(p => p[0] >= 9600 && p[1] < FLOOR);
 room.plats = [...floor, ...expPlats, ...shelves.map(s => [...s, 22])];

 // ── Fauna y Encuentros ───────────────────────────────────────────────────────
 // 5 especies de fauna astral con roles complementarios:
 // ufo (gunner), phosquito (flyer), brasita (shooter), medusa (shield), murcielago (pursuer).
 const cast = [
  // ─ Sector 0 (Antena de bienvenida, x: 800 – 2200) ─
  [860,  'ufo',        50, 0],
  [1460, 'phosquito',  54, 0],
  [1760, 'brasita',    56, 0],
  [2160, 'murcielago', 58, 0],

  // ─ Sector 1 (Bosque de datos, x: 2500 – 3900) ─
  [2600, 'medusa',     76, 1],
  [2980, 'ufo',        80, 1],
  [3480, 'phosquito',  82, 1],
  [3840, 'murcielago', 86, 1],

  // ─ Sector 2 (Sala de servidores, x: 4200 – 5500) ─
  [4300, 'brasita',    100, 2],
  [4680, 'medusa',     104, 2],
  [5120, 'ufo',        108, 2],
  [5440, 'phosquito',  112, 2],

  // ─ Sector 3 (Jardín de constelaciones, x: 5700 – 7100) ─
  [5820, 'murcielago', 122, 3],
  [6140, 'brasita',    126, 3],
  [6680, 'medusa',     130, 3],
  [7040, 'ufo',        134, 3],

  // ─ Sector 4 / Pre-arena (Red neuronal, x: 7400 – 9500) ─
  [7520, 'phosquito',  138, 4],
  [7880, 'murcielago', 142, 4],
  [8340, 'ufo',        146, 4],
  [8780, 'medusa',     150, 4]
 ];

 const expFoes = (room.foes || []).filter(f => f[4]?.expedition).map(f => {
  const [x, y, kind, boss, data] = f;
  return [x, y, kind, boss, { ...data, homeX: data.homeX ?? x, leash: data.leash ?? { left: Math.max(9000, x - 400), right: Math.min(14200, x + 400) } }];
 });

 const authored = cast.map(([x, kind, hp, stage], i) => {
  const role = CAST_ROLES[kind], air = role === 'flyer' || role === 'gunner' || role === 'shooter';
  const y = air ? (stage === 1 ? FLOOR - 240 : stage === 2 ? FLOOR - 270 : FLOOR - 210) : FLOOR - 40;
  return [x, y, kind, false, {
   role, chapterHP: hp, variant: i % 3,
   name: {
    ufo:        'Sonda de curiosidad',
    phosquito:  'Bit libélula',
    brasita:    'Chispa cuántica',
    medusa:     'Medusa de fibra óptica',
    murcielago: 'Centinela de bits'
   }[kind],
   yomiEncounter: true, stage, authoredEncounter: stage,
   anchorFloor: air ? undefined : FLOOR, anchorY: y, homeX: x,
   leash: { left: Math.max(600, x - 440), right: Math.min(13800, x + 480) },
   flightBand: air ? { top: y - 130, bottom: y + 190 } : undefined
  }];
 });

 room.foes = [...authored, ...expFoes];

 // ── Orbes de esencia cuántica y constelaciones — 25 orbes ───────────────────
 room.orbs = [];
 for (const [x, y] of [
  // Sector 0
  [500, 1089], [780, 1089], [980, 849], [1480, 989], [1740, 905], [2020, 825], [2280, 965],
  // Sector 1
  [2580, 989], [2860, 905], [3420, 989], [3680, 905], [3920, 825],
  // Sector 2
  [4180, 989], [4440, 905], [4720, 825], [5000, 965], [5260, 885], [5500, 805],
  // Sector 3
  [5780, 989], [6040, 905], [6580, 965], [6840, 885], [7080, 805],
  // Pre-arena
  [7420, 989], [9340, 955]
 ]) room.orbs.push([x, y]);

 return room;
}

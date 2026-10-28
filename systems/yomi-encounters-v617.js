// V617 — Encuentros y layout EXTREMO del Observatorio de Yomi
// Más plataformas interesantes, pozos con puentes reactivos, trampas, objetos de paso,
// fauna mejor posicionada y roles más claros.

import { YOMI_BOSS_ID, YOMI_BOSS } from './yomi-boss.js';

const FLOOR = 1134;

export const YOMI_CHAPTER_BOSS_ID = YOMI_BOSS_ID;
export const YOMI_CHAPTER_ARENA = Object.freeze({ left: 10240, right: 11840, floor: 1134, hp: 720 });

export function authorYomiEncounters(room) {
  if (room.hero !== 'yomi') return room;
  room.yomiEncounterVersion = 617;
  room.width = 14400;

  room.seal.altar = { x: 13920, y: FLOOR };
  room.yomiArena = YOMI_CHAPTER_ARENA;

  // Suelo principal con más interrupciones
  const floor = [
    [0, FLOOR, 980, 126],
    [1280, FLOOR, 1520, 126],
    [3100, FLOOR, 2480, 126],
    [5880, FLOOR, 1120, 126],
    [7200, FLOOR, 2200, 126],
    [9600, FLOOR, 4800, 126]
  ];

  // Pozos de vacío más peligrosos y anchos
  room.hazards = [
    { id: 'yomi-void-0', x: 980,  y: FLOOR - 30, w: 300, h: 420, type: 'death', label: 'VACÍO CUÁNTICO', color: '#0d1430', heroEscape: 'yomi' },
    { id: 'yomi-void-1', x: 2800, y: FLOOR - 30, w: 300, h: 420, type: 'death', label: 'FALLA DE MEMORIA', color: '#1a237e', heroEscape: 'yomi' },
    { id: 'yomi-void-2', x: 5600, y: FLOOR - 30, w: 320, h: 420, type: 'death', label: 'ABISMO DE COMPILACIÓN', color: '#0a1026', heroEscape: 'yomi' }
  ];

  // Plataformas más interesantes + puentes de fibra
  const shelves = [
    // Puentes sobre pozos (se pueden desactivar temporalmente si se desea)
    [990, FLOOR - 70, 280], [2810, FLOOR - 75, 280], [5610, FLOOR - 70, 300],

    // Sector inicial — ascenso con anillos
    [320, 1054, 180], [620, 984, 170], [920, 914, 160],
    [1420, 1044, 200], [1720, 974, 180], [2020, 904, 170],

    // Sector medio — plataformas móviles (marcar como _moving en motor si se soporta)
    [3400, 1024, 220], [3720, 944, 200], [4040, 864, 190],
    [4360, 984, 210], [4680, 904, 180],

    // Pre-arena — anillos planetarios
    [7600, 1024, 200], [7920, 944, 190], [8240, 864, 200],
    [8560, 944, 180], [8880, 864, 190], [9200, 984, 200],
    [10400, 1004, 220], [10720, 924, 200], [11040, 844, 190]
  ];

  const expPlats = (room.plats || []).filter(p => p[0] >= 9600 && p[1] < FLOOR);
  room.plats = [...floor, ...expPlats, ...shelves.map(s => [...s, 22])];

  // Fauna con roles más claros y mejor distribución
  const cast = [
    [720,  'ufo',        55, 0],
    [1280, 'phosquito',  58, 0],
    [1680, 'brasita',    62, 0],
    [2100, 'murcielago', 66, 0],

    [3200, 'medusa',     82, 1],
    [3600, 'ufo',        86, 1],
    [4000, 'phosquito',  90, 1],
    [4400, 'murcielago', 94, 1],

    [5000, 'brasita',    108, 2],
    [5400, 'medusa',     112, 2],
    [5800, 'ufo',        116, 2],

    [7400, 'murcielago', 130, 3],
    [7800, 'brasita',    134, 3],
    [8200, 'medusa',     138, 3],
    [8600, 'phosquito',  142, 3],

    [10000,'ufo',        150, 4],
    [10400,'murcielago', 154, 4],
    [10800,'brasita',    158, 4]
  ];

  const roles = { ufo: 'gunner', phosquito: 'flyer', brasita: 'shooter', medusa: 'shield', murcielago: 'pursuer' };
  const names = {
    ufo: 'Sonda de Curiosidad',
    phosquito: 'Bit Libélula',
    brasita: 'Chispa Cuántica',
    medusa: 'Medusa de Fibra',
    murcielago: 'Centinela de Bits'
  };

  const authored = cast.map(([x, kind, hp, stage], i) => {
    const role = roles[kind];
    const air = role === 'flyer' || role === 'gunner' || role === 'shooter';
    const y = air ? FLOOR - (220 + stage * 20) : FLOOR - 42;
    return [x, y, kind, false, {
      role, chapterHP: hp, variant: i % 3,
      name: names[kind],
      yomiEncounter: true, stage, authoredEncounter: stage,
      homeX: x,
      leash: { left: Math.max(400, x - 480), right: Math.min(13800, x + 520) },
      flightBand: air ? { top: y - 140, bottom: y + 180 } : undefined
    }];
  });

  room.foes = authored;

  // Más orbes y bits de memoria
  room.orbs = [
    [420, 1089], [720, 1089], [1020, 949], [1520, 999], [1820, 929],
    [3300, 999], [3700, 929], [4100, 859], [4500, 969],
    [5100, 999], [5500, 929], [5900, 859],
    [7500, 999], [7900, 929], [8300, 859], [8700, 929],
    [10100, 969], [10500, 899], [10900, 829]
  ].map(([x, y]) => [x, y]);

  return room;
}

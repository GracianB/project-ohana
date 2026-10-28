// V613 — Valle Fósil de Dino: ruta canónica de 14400px, 4 placas fósiles ancestrales,
// 3 abismos de fango prehistórico, cornisas de salto colosal y fauna de 5 especies.
import {DINO_CHAPTER_BOSS_ID, DINO_CHAPTER_ARENA} from './dino-chapter.js';
const FLOOR = 1134;

export const DINO_PLATES_V613 = Object.freeze([
 { id: 0, x: 2480, y: FLOOR, kind: 'fossil', dropHeight: 40,  order: 0, name: 'Fósil I · Valle de Helechos',   lesson: 'Primer pisotón. Salta y cae desde el escalón para despertar la placa.' },
 { id: 1, x: 4080, y: FLOOR, kind: 'fossil', dropHeight: 80,  order: 1, name: 'Fósil II · Cascada de Jade',    lesson: 'Segundo pisotón. Usa la cornisa media o K en el aire para ganar peso.' },
 { id: 2, x: 5680, y: FLOOR, kind: 'fossil', dropHeight: 120, order: 2, name: 'Fósil III · Caverna de Ámbar',  lesson: 'Tercer pisotón. Salto alto desde los monolitos para fracturar el suelo.' },
 { id: 3, x: 7280, y: FLOOR, kind: 'fossil', dropHeight: 180, order: 3, name: 'Fósil IV · Cúspide Ancestral', lesson: 'Cuarto pisotón. Caída colosal desde la cumbre: el Coloso de Piedra despierta.' }
].map(Object.freeze));

const CAST_ROLES = Object.freeze({
 cucaracho: 'pursuer',
 rana:      'jumper',
 cangrejo:  'shield',
 libelula:  'flyer',
 abeja:     'shooter'
});

export function authorDinoEncounters(room) {
 if (room.hero !== 'dino') return room;
 room.dinoEncounterVersion = 613;
 room.width = 14400;

 // Sincronizar estaciones con las 4 placas fósiles canónicas
 room.seal.stations = DINO_PLATES_V613.map(b => ({ ...b }));
 room.seal.altar = { x: 13920, y: FLOOR };

 // Geometría y referencias V613
 room.dinoArena = DINO_CHAPTER_ARENA;

 // ── Suelo y Abismos de Fango Geotérmico ─────────────────────────────────────
 const floor = [
  [0, FLOOR, 2150, 126],
  [2340, FLOOR, 2310, 126],
  [4850, FLOOR, 2160, 126],
  [7180, FLOOR, 2420, 126],
  [9600, FLOOR, 4800, 126] // Contrato de v2-adventure.test.js
 ];

 // Abismos de brea y fango prehistórico
 room.hazards = [
  { id: 'dino-mud-0', x: 2150, y: FLOOR - 20, w: 190, h: 380, type: 'death', label: 'ABISMO DE FANGO I',   color: '#3e2723', heroEscape: 'dino' },
  { id: 'dino-mud-1', x: 4650, y: FLOOR - 20, w: 200, h: 380, type: 'death', label: 'GÉISER DE BREA',      color: '#2e1c14', heroEscape: 'dino' },
  { id: 'dino-mud-2', x: 7010, y: FLOOR - 20, w: 170, h: 380, type: 'death', label: 'FALLA GEOTÉRMICA',    color: '#4e342e', heroEscape: 'dino' }
 ];

 // Cornisas de basalto, peldaños de arenisca y monolitos de salto
 const shelves = [
  // Puentes de salto sobre las 3 grietas
  [2160, FLOOR - 65, 170], [4660, FLOOR - 70, 180], [7160, FLOOR - 65, 170],

  // Sector 0 — Garganta de los Fósiles hacia Fósil I (x: 0 – 2480, dropHeight: 40)
  [380, 1054, 200], [680, 974, 190], [980, 894, 200],
  [1280, 974, 180], [1560, 894, 200], [1840, 824, 190],
  [2140, 934, 180],
  // Cornisa sobre Fósil I (dropHeight: 40 → ledge a FLOOR-70 y FLOOR-110)
  [2340, FLOOR - 75, 160], [2420, FLOOR - 110, 150],

  // Sector 1 — Meseta de Jade hacia Fósil II (x: 2480 – 4080, dropHeight: 80)
  [2680, 1034, 210], [2960, 954, 200], [3240, 874, 200],
  [3520, 934, 190], [3780, 854, 210],
  // Cornisas sobre Fósil II (dropHeight: 80 → ledges a FLOOR-120 y FLOOR-170)
  [3940, FLOOR - 130, 170], [4020, FLOOR - 180, 160], [4240, 874, 180],

  // Sector 2 — Caverna de Ámbar hacia Fósil III (x: 4080 – 5680, dropHeight: 120)
  [5000, 1034, 200], [5260, 934, 200], [5500, 834, 210],
  // Cornisas sobre Fósil III (dropHeight: 120 → ledges a FLOOR-180 y FLOOR-230)
  [5540, FLOOR - 170, 170], [5620, FLOOR - 220, 170],
  [5860, 914, 190], [6140, 814, 200], [6440, 724, 210], [6740, 834, 180],

  // Sector 3 — Cúspide Ancestral hacia Fósil IV (x: 5680 – 7280, dropHeight: 180)
  [7420, 1034, 200], [7680, 934, 190], [7960, 834, 210],
  // Cornisas de caída colosal sobre Fósil IV (dropHeight: 180 → ledges a FLOOR-240 y FLOOR-300)
  [7120, FLOOR - 230, 170], [7200, FLOOR - 290, 180],
  [8260, 894, 200], [8560, 794, 200], [8860, 714, 190], [9080, 794, 200],

  // Sector 4 — Cráter de jade (pre-arena, x: 9200 – 9600)
  [9340, 1004, 220], [9520, 924, 200]
 ];

 const expPlats = (room.plats || []).filter(p => p[0] >= 9600 && p[1] < FLOOR);
 room.plats = [...floor, ...expPlats, ...shelves.map(s => [...s, 22])];

 // Preserve approach ledges but keep a clear fall shaft over each fossil.
 // Shelves used to catch the plunge before it reached the actual plate.
 for(const p of room.plats)if(p[3]<=40){
  const plate=room.seal.stations.find(st=>p[0]<st.x+90&&p[0]+p[2]>st.x-90);
  if(plate)p[0]=plate.x-p[2]-100;
 }

 // ── Fauna y Encuentros ───────────────────────────────────────────────────────
 // 5 especies prehistóricas con roles complementarios:
 // cucaracho (pursuer), rana (jumper), cangrejo (shield), libelula (flyer), abeja (shooter).
 const cast = [
  // ─ Grupo 0 (Garganta de los Fósiles, x: 1050 – 2400) ─
  [1120, 'cucaracho', 52, 0],
  [1540, 'abeja',     54, 0],
  [1980, 'cangrejo',  56, 0],
  [2380, 'rana',      58, 0],

  // ─ Grupo 1 (Meseta de Jade, x: 2600 – 4000) ─
  [2740, 'libelula',  78, 1],
  [3140, 'cucaracho', 80, 1],
  [3520, 'cangrejo',  82, 1],
  [3880, 'abeja',     86, 1],

  // ─ Grupo 2 (Caverna de Ámbar, x: 5000 – 5600) ─
  [5100, 'rana',      102, 2],
  [5320, 'libelula',  106, 2],
  [5480, 'cucaracho', 110, 2],
  [5640, 'cangrejo',  114, 2],

  // ─ Grupo 3 (Cúspide Ancestral, x: 6200 – 8050) ─
  [6320, 'abeja',     126, 3],
  [6780, 'libelula',  128, 3],
  [7440, 'cucaracho', 132, 3],
  [7780, 'rana',      134, 3],
  [8020, 'cangrejo',  136, 3],

  // ─ Pre-arena sentinels (Antes del Coloso de Piedra) ─
  [8240, 'cangrejo',  142, 4],
  [8380, 'libelula',  144, 4],
  [8520, 'cucaracho', 148, 4]
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
    cucaracho: 'Trilobite acorazado',
    rana:      'Anuro primigenio',
    cangrejo:  'Ammonite de roca',
    libelula:  'Meganeura gigante',
    abeja:     'Avispa jurásica'
   }[kind],
   dinoEncounter: true, stage, authoredEncounter: stage,
   anchorFloor: air ? undefined : FLOOR, anchorY: y, homeX: x,
   leash: { left: Math.max(600, x - 440), right: Math.min(13800, x + 480) },
   flightBand: air ? { top: y - 130, bottom: y + 190 } : undefined
  }];
 });

 room.foes = [...authored, ...expFoes];

 // ── Orbes de esencia fósil — 25 orbes ──────────────────────────────────────
 room.orbs = [];
 for (const [x, y] of [
  // Sector 0
  [680, 1089], [880, 1089], [1100, 850], [1280, 929], [1560, 849], [1840, 775], [2140, 885],
  // Sector 1
  [2420, 989], [2680, 989], [2960, 905], [3240, 825], [3520, 885], [3780, 805], [4020, 885],
  // Sector 2
  [4420, 829], [5000, 989], [5260, 885], [5500, 785], [5620, 865], [6140, 765], [6440, 675],
  // Sector 3
  [7200, 790], [7680, 885], [7960, 785],
  // Pre-arena
  [8520, 749]
 ]) room.orbs.push([x, y]);

 return room;
}

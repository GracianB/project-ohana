// OHANA V467 · MUNDO 1 · La Ruta de los Diez.
// Diez salas grandes (una por héroe) encadenadas de oeste a este y una sala
// final todavía mayor con la Quimera Ohana. Datos puros: sin DOM ni Math.random.
// Las salas antiguas (Claro, Costa, Jungla…) pasan a ser el MUNDO 2.

// V470: de momento el juego termina en el Mundo 1. El código del Mundo 2 sigue
// intacto, pero sus salas quedan cerradas ("en construcción") en el modo solo.
export const WORLD2_OPEN = false;
export const WORLD2_LOCK_TEXT = "Mundo 2 — en construcción";
export function world2Locked(id, state = {}) {
  if (WORLD2_OPEN || !state.solo || state.e2e) return false;
  return typeof id === "string" && !Object.hasOwn(WORLD1_ROOMS, id);
}
export const WORLD1_ROOM_W = 9600;
export const WORLD1_FINAL_W = 12000;
export const WORLD1_ROOM_H = 1260;
export const WORLD1_FLOOR = 1134;
export const WORLD1_ARENA = Object.freeze({ left: 7000, right: 11800, start: 6800 });

// Orden de la ruta: cada sala abre la siguiente al despertar su sello.
export const WORLD1_ORDER = Object.freeze(["kilo","stitcho","chispin","cat","cuerno","dragon","dino","frita","pizza","yomi"]);
export const WORLD1_IDS = Object.freeze([...WORLD1_ORDER.map((h) => "w1-" + h), "w1-final"]);
export const WORLD1_HERO_ROOMS = Object.freeze(WORLD1_ORDER.map((h) => "w1-" + h));

// world = índice de WORLDS (cielo base) · seal = interacción única de la sala.
export const WORLD1_THEMES = Object.freeze({
  kilo:    { name: "Claro de Kilo",            short: "Kilo",      world: 6, color: "#ffacc2", tint: "#ff8fb1", relic: "Canción del hogar",     seal: "serenata",   cast: ["cucaracho","phosquito","planta","rana"],        sectors: ["Puerta aloha","Campo de hibiscos","Escenario del ukelele","Lago de las guirnaldas","Senda de los cocos","Altar de la canción"] },
  stitcho: { name: "Astillero de Stitcho",     short: "Stitcho",   world: 4, color: "#67ddff", tint: "#3f8cff", relic: "Corazón galáctico",     seal: "reparar",    cast: ["ufo","phosquito","cucaracho","arana"],          sectors: ["Muelle cosido","Chatarrería azul","Grúas de plasma","Taller del caos","Hangar estrellado","Altar del experimento"] },
  chispin: { name: "Santuario del Trueno",     short: "Chispín",   world: 9, color: "#fff29a", tint: "#ffd84a", relic: "Relámpago dorado",      seal: "cadena",     cast: ["gaviota","murcielago","phosquito","rana"],      sectors: ["Puerta de nubes","Campo de pararrayos","Puente del chispazo","Pico tormenta","Valle del arcoíris","Altar del trueno"] },
  cat:     { name: "Jardín Lunar de Michi",    short: "Michi",     world: 3, color: "#ceb2ff", tint: "#b98cff", relic: "Luna soñadora",         seal: "medusas",    cast: ["medusa","phosquito","ufo","murcielago"],        sectors: ["Umbral del sueño","Estanque de lunas","Bosque de medusas","Observatorio gatuno","Mar de estrellas","Altar del sueño"] },
  cuerno:  { name: "Bosque Prisma de Cuerno",  short: "Cuerno",    world: 8, color: "#eccbff", tint: "#d6a8ff", relic: "Aurora viva",           seal: "prismas",    cast: ["arana","murcielago","planta","phosquito"],      sectors: ["Claro de cristal","Arboleda aurora","Espejos del alba","Cueva del eco","Sendero arcoíris","Altar del prisma"] },
  dragon:  { name: "Caldera del Dragón",       short: "Dragón",    world: 2, color: "#ff905d", tint: "#ff5a3c", relic: "Brasa del hogar",       seal: "braseros",   cast: ["escoria","brasita","planta","rana"],            sectors: ["Camino de ceniza","Río de lava","Forja ancestral","Nido de wyverns","Cráter rojo","Altar del fuego"] },
  dino:    { name: "Valle Fósil de Dino",      short: "Dino",      world: 1, color: "#b8ef6b", tint: "#6fd38b", relic: "Fósil de la familia",   seal: "pisotones",  cast: ["rana","abeja","libelula","arana"],              sectors: ["Helechos gigantes","Cascada de jade","Huesos del T-rex","Nidos de saurópodo","Barro dormido","Altar del fósil"] },
  frita:   { name: "Mercado Dorado de Frita",  short: "Frita",     world: 0, color: "#ffe9a8", tint: "#ffc23a", relic: "Banquete dorado",       seal: "geiseres",   cast: ["cangrejo","gaviota","brasita","rana"],          sectors: ["Paseo de la bahía","Puestos crujientes","Fuentes de aceite","Bazar de especias","Cúpula del banquete","Altar dorado"] },
  pizza:   { name: "Puerto del Horno de Pizza", short: "Pizza",    world: 5, color: "#ffd36a", tint: "#ff9d4a", relic: "Horno estelar",         seal: "reparto",    cast: ["pez","cangrejo","anguila","medusa"],            sectors: ["Horno del puerto","Muelle de la masa","Calle del queso","Plaza hambrienta","Faro de la albahaca","Altar del horno"] },
  yomi:    { name: "Observatorio de Yomi",     short: "Yomi",      world: 3, color: "#8fe9ff", tint: "#5fd0ff", relic: "Constelación eterna",   seal: "sincronia",  cast: ["ufo","phosquito","brasita","medusa"],           sectors: ["Antena de bienvenida","Bosque de datos","Sala de servidores","Jardín de constelaciones","Red neuronal","Altar de la IA"] }
});

// Explicación jugable de cada sello (se muestra al entrar y en el HUD de sala).
export const WORLD1_SEALS = Object.freeze({
  serenata:  { title: "Serenata de las flores",  verb: "Quédate quieto sobre cada hibisco para rasguear su nota", count: 4 },
  reparar:   { title: "Reparar la nave",         verb: "Lleva cada pieza (tócala) hasta su taller marcado",       count: 3 },
  cadena:    { title: "Cadena de truenos",       verb: "Toca un pararrayos y alcanza el siguiente antes de que se descargue", count: 4 },
  medusas:   { title: "Medusas lunares",         verb: "Salta y toca en el aire cada medusa dormida",             count: 5 },
  prismas:   { title: "Alinear los prismas",     verb: "Activa los prismas en el orden I · II · III",             count: 3 },
  braseros:  { title: "Encender los braseros",   verb: "Golpea cada brasero apagado",                             count: 4 },
  pisotones: { title: "Despertar los fósiles",   verb: "Cae desde un salto sobre cada placa fósil",               count: 3 },
  geiseres:  { title: "Patatas en las nubes",    verb: "Pisa un géiser de aceite y atrapa la patata dorada de arriba", count: 3 },
  reparto:   { title: "Reparto caliente",        verb: "Recoge la pizza del horno y llévala a los clientes antes de que se enfríe", count: 3 },
  sincronia: { title: "Sincronizar la red",      verb: "Toca cada nodo de datos mientras parpadea en verde",      count: 4 }
});

// Pseudo-aleatorio estable por cadena (las salas no cambian entre partidas).
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let s = seed >>> 0 || 1; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }

// Vocabulario de plataformas deliberadamente escaso: el suelo es el camino.
// Cada sector tiene como mucho un motivo de 0–3 repisas bajas (80 px por escalón).
const MOTIFS = Object.freeze([
  [],
  [[300, 1054, 260]],
  [[220, 1054, 240], [560, 974, 240]],
  [[260, 1054, 220], [600, 974, 220], [940, 1054, 220]]
]);

export function buildWorld1HeroRoom(hero) {
  const theme = WORLD1_THEMES[hero];
  if (!theme) throw new Error("Unknown World 1 hero: " + hero);
  const id = "w1-" + hero, idx = WORLD1_ORDER.indexOf(hero), r = rng(hash(id));
  const W = WORLD1_ROOM_W, sw = W / theme.sectors.length;
  const plats = [[0, WORLD1_FLOOR, W, 126]];
  const motifPlan = [1, 2, 0, 3, 1, 0];
  theme.sectors.forEach((_, i) => { for (const [dx, y, w] of MOTIFS[motifPlan[(i + idx) % motifPlan.length]]) plats.push([Math.round(i * sw + dx + r() * 120), y, w, 22]); });
  const sectors = theme.sectors.map((name, i) => ({ id: `${id}-${i}`, name, x: i * sw, w: sw, role: ["explore","combat","platform","secret","rest","explore"][i] }));
  const checkpoints = sectors.map((s, i) => ({ id: s.id, x: Math.round(s.x + (i ? 140 : 220)), y: WORLD1_FLOOR, sector: i }));
  // Pocos enemigos y legibles: dos por sector intermedio, con rol de campaña.
  const roles = ["pursuer","jumper","flyer","shield","gunner"];
  const foes = [];
  for (let i = 1; i < sectors.length - 1; i++) {
    for (let k = 0; k < 2; k++) {
      const role = roles[(i * 2 + k + idx) % roles.length];
      const kind = theme.cast[(i + k) % theme.cast.length];
      const x = Math.round(sectors[i].x + 420 + k * 640 + r() * 120);
      const y = role === "flyer" ? 900 : WORLD1_FLOOR - 40;
      foes.push([x, y, kind, i === 4 && k === 1, { role, name: theme.short + " · eco " + (foes.length + 1), anchorY: y }]);
    }
  }
  const orbs = [];
  for (let i = 0; i < sectors.length; i++) orbs.push([Math.round(sectors[i].x + 800), 1040], [Math.round(sectors[i].x + 1250), 980]);
  const stations = sealStations(hero, theme, sectors);
  const prev = idx > 0 ? "w1-" + WORLD1_ORDER[idx - 1] : null;
  const next = idx < WORLD1_ORDER.length - 1 ? "w1-" + WORLD1_ORDER[idx + 1] : "w1-final";
  return {
    id, name: theme.name, short: theme.short, world: theme.world, color: theme.color,
    world1: true, worldNumber: 1, hero, signatureCharacter: hero,
    width: W, height: WORLD1_ROOM_H,
    doors: { left: prev, right: next, up: null, down: null },
    hint: WORLD1_SEALS[theme.seal].title + ": " + WORLD1_SEALS[theme.seal].verb + ". El sello abre la salida del este.",
    plats, foes, orbs, sectors, checkpoints, hazards: [], upExit: null,
    seal: { kind: theme.seal, stations, altar: { x: W - 520, y: WORLD1_FLOOR } },
    portals: hero === "kilo" ? [{ type: "blackhole", x: 560, y: WORLD1_FLOOR - 96, w: 96, h: 96, dest: "hub", label: "Mundo 2 · en construcción", locked: true }] : []
  };
}

// Las estaciones de cada sello se reparten por los sectores 1–4 para que la
// sala entera se recorra; las aéreas quedan a un salto del suelo.
function sealStations(hero, theme, sectors) {
  const at = (sector, f) => Math.round(sectors[sector].x + sectors[sector].w * f);
  const floor = WORLD1_FLOOR;
  switch (theme.seal) {
    case "serenata": return [1, 2, 3, 4].map((s, i) => ({ id: i, x: at(s, .5), y: floor, kind: "flower", note: i }));
    case "reparar": return [1, 2, 4].map((s, i) => ({ id: i, x: at(s, .3), y: floor, kind: "part", target: { x: at(s, .3) + 520, y: floor } }));
    case "cadena": return [1, 2, 2, 3].map((s, i) => ({ id: i, x: at(s, i === 2 ? .85 : .35), y: floor, kind: "rod" }));
    case "medusas": return [1, 2, 3, 3, 4].map((s, i) => ({ id: i, x: at(s, i === 3 ? .8 : .45), y: floor - 140, kind: "jelly" }));
    // Readable I → II → III pilgrimage, west to east, without forced backtracking.
    case "prismas": return [{ s: 1, order: 0 }, { s: 3, order: 1 }, { s: 4, order: 2 }].map((d, i) => ({ id: i, x: at(d.s, .5), y: floor, kind: "prism", order: d.order }));
    case "braseros": return [1, 2, 3, 4].map((s, i) => ({ id: i, x: at(s, .6), y: floor, kind: "brazier" }));
    case "pisotones": return [1, 3, 4].map((s, i) => ({ id: i, x: at(s, .55), y: floor, kind: "fossil" }));
    case "geiseres": return [1, 2, 4].map((s, i) => ({ id: i, x: at(s, .5), y: floor, kind: "geyser", prize: { x: at(s, .5), y: floor - 470 } }));
    case "reparto": return [{ id: 0, x: at(1, .2), y: floor, kind: "oven" }, ...[1, 2, 3].map((s, i) => ({ id: i + 1, x: at(s + 1, .55), y: floor, kind: "guest" }))];
    case "sincronia": return [1, 2, 3, 4].map((s, i) => ({ id: i, x: at(s, .5), y: floor, kind: "node", phase: i * 23 }));
    default: return [];
  }
}

// Sala final: una procesión con los diez héroes en estatua y una arena enorme.
export function buildWorld1FinalRoom() {
  const W = WORLD1_FINAL_W, A = WORLD1_ARENA;
  const plats = [[0, WORLD1_FLOOR, W, 126],
    // Arena casi limpia: dos repisas laterales y un balcón central para esquivar.
    [A.left + 500, 974, 300, 22], [A.right - 800, 974, 300, 22], [(A.left + A.right) / 2 - 200, 854, 400, 22]];
  const names = ["Puerta de los diez", "Procesión de estatuas", "Puente de los ecos", "Umbral de la Quimera", "Corazón de Ohana", "Trono roto"];
  const sw = W / names.length;
  const sectors = names.map((name, i) => ({ id: `w1-final-${i}`, name, x: i * sw, w: sw, role: i >= 4 ? "combat" : "explore" }));
  const checkpoints = [0, 1, 2, 3].map((i) => ({ id: sectors[i].id, x: Math.round(sectors[i].x + 200), y: WORLD1_FLOOR, sector: i }));
  const statues = WORLD1_ORDER.map((hero, i) => ({ hero, x: 900 + i * 560, y: WORLD1_FLOOR }));
  return {
    id: "w1-final", name: "Corazón de Ohana", short: "Corazón", world: 7, color: "#ffd6f2",
    world1: true, worldNumber: 1, hero: null, signatureCharacter: "kilo",
    width: W, height: WORLD1_ROOM_H,
    doors: { left: "w1-yomi", right: "hub", up: null, down: null },
    hint: "Recorre la procesión de los diez. Al final te espera la Quimera Ohana, hecha con los ecos de toda la familia.",
    plats, foes: [], orbs: statues.map((s) => [s.x, 980]), sectors, checkpoints, hazards: [], upExit: null,
    boss: true, fusionBoss: true, arena: { ...A }, statues,
    portals: []
  };
}

export const WORLD1_ROOMS = Object.freeze(Object.fromEntries([
  ...WORLD1_ORDER.map((h) => ["w1-" + h, buildWorld1HeroRoom(h)]),
  ["w1-final", buildWorld1FinalRoom()]
]));

export function isWorld1Room(id) { return typeof id === "string" && Object.hasOwn(WORLD1_ROOMS, id); }
export function heroForWorld1Room(id) { return WORLD1_ROOMS[id]?.hero || null; }
export function world1RoomForHero(hero) { return WORLD1_ORDER.includes(hero) ? "w1-" + hero : null; }

// Grafo explícito: una ruta principal y dos puentes con el Mundo 2.
export function world1Graph() {
  const edges = [];
  for (let i = 0; i < WORLD1_IDS.length - 1; i++) edges.push({ a: WORLD1_IDS[i], b: WORLD1_IDS[i + 1], type: "door", gate: "seal" });
  edges.push({ a: "w1-kilo", b: "hub", type: "vortex", gate: null });
  edges.push({ a: "hub", b: "w1-kilo", type: "vortex", gate: null });
  edges.push({ a: "w1-final", b: "hub", type: "door", gate: "boss" });
  return { nodes: [...WORLD1_IDS], edges };
}

// ¿Puede cruzar la puerta? Las salas de héroe exigen su propio sello; la sala
// final exige los diez y su salida al Mundo 2 exige vencer a la Quimera.
export function world1DoorOpen(fromId, dir, state = {}) {
  const room = WORLD1_ROOMS[fromId]; if (!room) return true;
  const seals = new Set(state.seals || []);
  if (dir === "left") return !(room.fusionBoss && state.bossActive);
  if (dir !== "right") return true;
  if (room.fusionBoss) return !!state.won;
  return seals.has(room.hero);
}
export function world1SealsComplete(seals = []) { const s = new Set(seals); return WORLD1_ORDER.every((h) => s.has(h)); }
export function cleanWorld1Seals(raw) { return Array.isArray(raw) ? [...new Set(raw.filter((h) => WORLD1_ORDER.includes(h)))] : []; }

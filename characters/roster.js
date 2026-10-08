// ============================================================================
// ROSTER · 10 personajes × 5 formas
// Stats, habilidades y pasiva. El arte vive en characters/art/<id>.js.
// Los id antiguos se resuelven con aliasId(): pikachu → chispin, stitch → stitcho.
// w/h son la hitbox. No se han tocado.
// ============================================================================

const ACTIVE = ["kilo", "stitcho", "chispin", "cat", "dragon", "dino", "frita", "pizza", "yomi", "cuerno"];

const ALIAS = {
  pikachu: "chispin",
  stitch: "stitcho",
  michi: "cat",
  lilo: "kilo",
};

export function aliasId(id) {
  const key = String(id || "").toLowerCase();
  return ALIAS[key] || key;
}

export const ALL_ROSTER = [
  {
    id: "kilo", name: "Kilo", role: "control", tag: "Ukulele y polen",
    color: "#e23b3d",
    speed: 3.6, jumpPower: 11.4, maxJumps: 1, health: 80, w: 20, h: 28,
    abilities: ["ukulele", "hula", "ohana"],
    passive: { id: "float", name: "Hula flotante", desc: "Mantén salto en el aire para caer despacio. En Kilo Flor Solar, vuela un momento. El polen se recarga en el suelo." },
    evoNames: ["Kilo Bebé", "Kilo", "Kilo Ohana", "Super Kilo", "Kilo Flor Solar"],
    forms: [
      { name: "Kilo Bebé", color: "#ff9ab0", speed: 3.6, jump: 11.4, jumps: 1, hp: 80, w: 20, h: 28 },
      { name: "Kilo", color: "#e23b3d", speed: 4.0, jump: 12.2, jumps: 1, hp: 100, w: 24, h: 34 },
      { name: "Kilo Ohana", color: "#ff4d78", speed: 4.5, jump: 13.0, jumps: 2, hp: 125, w: 28, h: 42 },
      { name: "Super Kilo", color: "#ffd36a", speed: 5.1, jump: 13.8, jumps: 2, hp: 155, w: 32, h: 48 },
      { name: "Kilo Flor Solar", color: "#ff6b9a", speed: 6.2, jump: 15.2, jumps: 3, hp: 210, w: 36, h: 52, aura: true, glide: true },
    ],
  },
  {
    id: "stitcho", name: "Stitcho", role: "acrobata", tag: "Plasma y paredes",
    color: "#2f6bff",
    speed: 4.4, jumpPower: 11.0, maxJumps: 2, health: 90, w: 24, h: 24,
    abilities: ["plasma", "rollo", "caos"],
    passive: { id: "climb", name: "Trepador", desc: "Se agarra a las paredes y trepa por ellas." },
    evoNames: ["Mini Stitcho", "Stitcho", "Stitcho Bravo", "Experimento Ñam", "Stitcho Nébula"],
    forms: [
      { name: "Mini Stitcho", color: "#7fb4ff", speed: 4.4, jump: 11.0, jumps: 2, hp: 90, w: 24, h: 24 },
      { name: "Stitcho", color: "#2f6bff", speed: 4.9, jump: 11.8, jumps: 2, hp: 110, w: 28, h: 30 },
      { name: "Stitcho Bravo", color: "#1c3fd1", speed: 5.5, jump: 12.6, jumps: 3, hp: 135, w: 34, h: 32 },
      { name: "Experimento Ñam", color: "#35d7ff", speed: 6.2, jump: 13.5, jumps: 3, hp: 165, w: 38, h: 40 },
      { name: "Stitcho Nébula", color: "#8f7bff", speed: 7.4, jump: 15.0, jumps: 4, hp: 220, w: 42, h: 46, aura: true },
    ],
  },
  {
    id: "chispin", name: "Chispín", role: "asalto", tag: "Cadena y chispa",
    color: "#ffd83a",
    speed: 4.8, jumpPower: 12.2, maxJumps: 2, health: 78, w: 22, h: 22,
    abilities: ["chain", "blink", "storm"],
    passive: { id: "spark", name: "Chispa veloz", desc: "Tras correr un segundo va más rápido y deja chispas que dañan." },
    evoNames: ["Chispín Bebé", "Chispín", "Voltín", "Trueno Gordo", "Chispín Tormenta"],
    forms: [
      { name: "Chispín Bebé", color: "#fff06a", speed: 4.8, jump: 12.2, jumps: 2, hp: 78, w: 22, h: 22 },
      { name: "Chispín", color: "#ffd83a", speed: 5.3, jump: 12.9, jumps: 2, hp: 95, w: 26, h: 28 },
      { name: "Voltín", color: "#ffa024", speed: 5.9, jump: 13.6, jumps: 3, hp: 115, w: 28, h: 36 },
      { name: "Trueno Gordo", color: "#ffe45a", speed: 6.5, jump: 14.4, jumps: 3, hp: 140, w: 40, h: 38 },
      { name: "Chispín Tormenta", color: "#5fd8ff", speed: 7.6, jump: 15.8, jumps: 4, hp: 190, w: 40, h: 48, aura: true },
    ],
  },
  {
    id: "cat", name: "Michi", role: "esquiva", tag: "Nueve vidas",
    color: "#ffb6e4",
    speed: 5.0, jumpPower: 12.0, maxJumps: 2, health: 72, w: 22, h: 22,
    abilities: ["yarn", "purr", "ninetails"],
    passive: { id: "ninelives", name: "Nueve vidas", desc: "Sobrevive una vez por sala a un golpe mortal." },
    evoNames: ["Michito", "Michi", "Nube rosa", "Michi Luna", "Michi Eclipse"],
    forms: [
      { name: "Michito", color: "#ffd0ee", speed: 5.0, jump: 12.0, jumps: 2, hp: 72, w: 22, h: 22 },
      { name: "Michi", color: "#ffb6e4", speed: 5.5, jump: 12.7, jumps: 2, hp: 90, w: 28, h: 26 },
      { name: "Nube rosa", color: "#ff7ad0", speed: 6.1, jump: 13.4, jumps: 3, hp: 110, w: 32, h: 30 },
      { name: "Michi Luna", color: "#b594ff", speed: 6.7, jump: 14.2, jumps: 3, hp: 135, w: 36, h: 34 },
      { name: "Michi Eclipse", color: "#ff8fcf", speed: 7.8, jump: 15.6, jumps: 4, hp: 185, w: 40, h: 42, aura: true },
    ],
  },
  {
    id: "dragon", name: "Dragón", role: "zona", tag: "Alas y meteoro",
    color: "#e8452f",
    speed: 4.5, jumpPower: 11.4, maxJumps: 2, health: 80, w: 20, h: 22,
    abilities: ["breath", "gust", "meteor"],
    passive: { id: "glide", name: "Alas", desc: "Mantén salto en el aire para planear. En la forma final, vuela." },
    evoNames: ["Dragoncito", "Dragón", "Dragón Alado", "Dragón Real", "Dragón Celestial"],
    forms: [
      { name: "Dragoncito", color: "#ff8a74", speed: 4.5, jump: 11.4, jumps: 2, hp: 80, w: 20, h: 22 },
      { name: "Dragón", color: "#e8452f", speed: 4.9, jump: 12.0, jumps: 2, hp: 105, w: 24, h: 28 },
      { name: "Dragón Alado", color: "#ff6a2a", speed: 5.5, jump: 13.0, jumps: 2, hp: 130, w: 28, h: 34 },
      { name: "Dragón Real", color: "#c7331f", speed: 5.9, jump: 13.4, jumps: 3, hp: 165, w: 34, h: 40 },
      { name: "Dragón Celestial", color: "#ffd84a", speed: 6.6, jump: 14.8, jumps: 3, hp: 220, w: 40, h: 46, aura: true, glide: true },
    ],
  },
  {
    id: "dino", name: "Dino", role: "tanque", tag: "Mordisco y pisotón",
    color: "#4cbf56",
    speed: 4.0, jumpPower: 11.0, maxJumps: 1, health: 100, w: 24, h: 26,
    abilities: ["bite", "charge", "quake"],
    passive: { id: "pound", name: "Pisotón", desc: "Pulsa ↓ en el aire para caer en picado con onda de choque." },
    evoNames: ["Dino Bebé", "Dino", "Dino Pico", "Dino Rex", "Dino Coloso"],
    forms: [
      { name: "Dino Bebé", color: "#8ee07a", speed: 4.0, jump: 11.0, jumps: 1, hp: 100, w: 22, h: 24 },
      { name: "Dino", color: "#4cbf56", speed: 4.3, jump: 11.6, jumps: 1, hp: 130, w: 26, h: 30 },
      { name: "Dino Pico", color: "#2ea8a0", speed: 4.8, jump: 12.2, jumps: 2, hp: 160, w: 30, h: 34 },
      { name: "Dino Rex", color: "#3f8f3a", speed: 5.1, jump: 12.6, jumps: 2, hp: 200, w: 38, h: 42 },
      { name: "Dino Coloso", color: "#c8f04a", speed: 6.0, jump: 14.0, jumps: 3, hp: 260, w: 42, h: 48, aura: true },
    ],
  },
  {
    id: "frita", name: "Frita", role: "carrera", tag: "Resbalón y kétchup",
    color: "#f0b43a",
    speed: 4.6, jumpPower: 11.4, maxJumps: 2, health: 85, w: 18, h: 28,
    abilities: ["salt", "ketchup", "fryer"],
    passive: { id: "slide", name: "Resbalón", desc: "Pulsa ↓ mientras corres para deslizarte y arrollar enemigos." },
    evoNames: ["Palito", "Frita", "Capitán Kétchup", "Extra Crujiente", "Frita Centella"],
    forms: [
      { name: "Palito", color: "#ffe8a0", speed: 4.6, jump: 11.4, jumps: 2, hp: 85, w: 18, h: 28 },
      { name: "Frita", color: "#f0b43a", speed: 5.2, jump: 12.1, jumps: 3, hp: 105, w: 22, h: 32 },
      { name: "Capitán Kétchup", color: "#d42020", speed: 5.8, jump: 12.8, jumps: 3, hp: 125, w: 26, h: 36 },
      { name: "Extra Crujiente", color: "#ffda70", speed: 6.5, jump: 13.6, jumps: 4, hp: 150, w: 30, h: 42 },
      { name: "Frita Centella", color: "#e82020", speed: 7.5, jump: 15.0, jumps: 4, hp: 200, w: 34, h: 50, aura: true },
    ],
  },
  {
    id: "pizza", name: "Pizza", role: "rebote", tag: "Queso y horno",
    color: "#ffb43a",
    speed: 4.5, jumpPower: 11.8, maxJumps: 2, health: 88, w: 22, h: 26,
    abilities: ["pepperoni", "cheese", "oven"],
    passive: { id: "bounce", name: "Queso elástico", desc: "Caer sobre un enemigo lo aplasta y te hace rebotar." },
    evoNames: ["Porcioncita", "Pizza", "Pizza Picante", "Pizza Familiar", "Pizza Volcánica"],
    forms: [
      { name: "Porcioncita", color: "#ffd27a", speed: 4.5, jump: 11.8, jumps: 2, hp: 88, w: 22, h: 26 },
      { name: "Pizza", color: "#ffb43a", speed: 5.0, jump: 12.4, jumps: 2, hp: 108, w: 26, h: 30 },
      { name: "Pizza Picante", color: "#ff5a2a", speed: 5.6, jump: 13.1, jumps: 3, hp: 130, w: 30, h: 34 },
      { name: "Pizza Familiar", color: "#ffcc4a", speed: 6.0, jump: 13.6, jumps: 3, hp: 165, w: 38, h: 40 },
      { name: "Pizza Volcánica", color: "#ffe27a", speed: 7.2, jump: 15.2, jumps: 4, hp: 210, w: 40, h: 46, aura: true },
    ],
  },
  {
    id: "yomi", name: "Yomi", role: "espectro", tag: "Ofuda y paso hueco",
    color: "#e8c090",
    speed: 4.4, jumpPower: 12.0, maxJumps: 2, health: 84, w: 26, h: 36,
    abilities: ["ofuda", "sleeve", "maw"],
    passive: { id: "hollow", name: "Paso hueco", desc: "Cae más rápido. En el aire, pulsa salto para un paso espectral." },
    evoNames: ["Farol", "Yomi", "Yomi Manga", "Yomi Grieta", "Yomi Devoralunas"],
    forms: [
      { name: "Farol", color: "#f4e2c4", speed: 4.4, jump: 12.0, jumps: 2, hp: 84, w: 26, h: 36 },
      { name: "Yomi", color: "#e8c090", speed: 4.8, jump: 12.6, jumps: 2, hp: 104, w: 28, h: 40 },
      { name: "Yomi Manga", color: "#d09060", speed: 5.3, jump: 13.2, jumps: 2, hp: 126, w: 30, h: 42 },
      { name: "Yomi Grieta", color: "#c4503a", speed: 5.8, jump: 13.8, jumps: 3, hp: 150, w: 32, h: 44 },
      { name: "Yomi Devoralunas", color: "#ff4466", speed: 6.6, jump: 14.8, jumps: 3, hp: 196, w: 36, h: 48, aura: true },
    ],
  },
  {
    id: "cuerno", name: "Cuerno", role: "luz", tag: "Cuerno viviente → Unicornio negro alado",
    color: "#f2c1ff",
    speed: 6.0, jumpPower: 14.6, maxJumps: 2, health: 86, w: 22, h: 26,
    abilities: ["gleam", "gallop", "rainbow"],
    passive: { id: "punta", name: "Impulso innato", desc: "El más rápido de OHANA. Corre sin activar poderes, salta más alto y transforma cada aterrizaje en impulso de luz." },
    evoNames: ["Cuernín · Semilla", "Destello · Naciente", "Potro Iris", "Unicornio Estelar", "Unicornio Negro"],
    forms: [
      { name: "Cuernín · Semilla", color: "#ffe0f4", speed: 6.0, jump: 14.6, jumps: 2, hp: 86, w: 22, h: 26 },
      { name: "Destello · Naciente", color: "#f2c1ff", speed: 6.7, jump: 15.4, jumps: 2, hp: 104, w: 24, h: 30 },
      { name: "Potro Iris", color: "#c9b6ff", speed: 7.4, jump: 16.2, jumps: 3, hp: 124, w: 26, h: 34 },
      { name: "Unicornio Estelar", color: "#9ad7ff", speed: 8.4, jump: 17.4, jumps: 3, hp: 150, w: 28, h: 38 },
      { name: "Unicornio Negro", color: "#252132", speed: 9.6, jump: 18.6, jumps: 4, hp: 198, w: 32, h: 44, aura: true },
    ],
  },
];

export const ROSTER = ACTIVE.map((id) => ALL_ROSTER.find((r) => r.id === id)).filter(Boolean);

export function findRoster(id) {
  const key = aliasId(id);
  return ALL_ROSTER.find((r) => r.id === key) || null;
}

function clearEvoTween(p) {
  p.evoTween = 0;
  p.evoFromW = p.evoFromH = p.evoToW = p.evoToH = undefined;
}

export function applyForm(p, opts = {}) {
  const evo = Number(p.evo || 0);
  p.evo = evo;
  const f = (p.forms && p.forms[evo]) || null;
  if (!f) return;

  const prevW = p.w;
  const prevH = p.h;
  const hadSize = Number.isFinite(prevW) && Number.isFinite(prevH) && prevW > 0 && prevH > 0;
  const fromName = p.name;

  p.name = f.name;
  p.color = f.color;
  p.speed = f.speed;
  p.jumpPower = f.jump;
  p.maxJumps = f.jumps;
  p.maxHealth = f.hp;
  p.health = f.hp;
  p.glide = !!f.glide;

  if (opts.silent || evo === 0 || !hadSize) {
    p.w = f.w;
    p.h = f.h;
    clearEvoTween(p);
  } else {
    p.evoFromW = prevW;
    p.evoFromH = prevH;
    p.evoToW = f.w;
    p.evoToH = f.h;
    p.w = prevW;
    p.h = prevH;
    p.evoTween = 1;
  }

  if (opts.silent || evo === 0) return;
  const burstFrames = evo >= 4 ? 140 : 90;
  p.evoBurstMax = burstFrames;
  p.evoBurst = burstFrames;
  try {
    window.dispatchEvent(new CustomEvent("ohana-evolve", {
      detail: { id: p.id, evo: p.evo, color: p.color, fromName, toName: f.name, name: f.name },
    }));
  } catch (_) {}
}

export function tickEvoTween(p, dtFrames = 1) {
  if (!p || !p.evoTween) return;
  const oldH = p.h;
  const span = (Number(p.evo) || 0) >= 4 ? 42 : 40;
  p.evoTween = Math.max(0, p.evoTween - (dtFrames / span));
  const u = 1 - p.evoTween;
  const s = u * u * (3 - 2 * u);
  const toW = p.evoToW;
  const toH = p.evoToH;
  const fromW = p.evoFromW;
  const fromH = p.evoFromH;
  p.w = fromW + (toW - fromW) * s;
  p.h = fromH + (toH - fromH) * s;
  if (p.h > oldH) p.y -= (p.h - oldH);
  if (p.evoTween <= 0) {
    p.w = toW;
    p.h = toH;
    clearEvoTween(p);
  }
}
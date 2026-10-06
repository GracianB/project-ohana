// PROJECT OHANA · ORIGINAL CAST RECOVERY
// Exact character definitions from the original cast snapshot (70b998be).
// These are preserved separately from the current 10-character World 1 roster.

const LILO = {
  id: "lilo",
  name: "Lilo",
  role: "Exploradora de la isla",
  description: "Ágil, valiente y capaz de convertir cualquier expedición en una aventura.",
  colors: { primary: "#ef6277", secondary: "#ffd39b", glow: "#ffb25c" },
  stats: { maxHealth: 110, maxEnergy: 112, speed: 5.55, jumpPower: 13.9, abilityPower: 1 },
  abilities: {
    special: { name: "Ola de Aloha", cost: 15, cooldown: 720, range: 215, color: "#ffab5f" },
    ultimate: { name: "Ohana Unida", cost: 42, cooldown: 4200, range: 360, color: "#ffe29a", requiredEvolutionStage: 1 }
  },
  evolution: {
    forms: [
      { name: "Lilo", level: 1, bonuses: {} },
      { name: "Lilo Guardiana", level: 3, bonuses: { maxHealth: 20, maxEnergy: 14, speed: 0.22, abilityPower: 0.2 }, unlocks: ["ultimate"] },
      { name: "Lilo Estelar", level: 6, bonuses: { maxHealth: 18, maxEnergy: 18, speed: 0.3, abilityPower: 0.3 } }
    ]
  }
};

export default LILO;


const STITCH = {
  id: "stitch",
  name: "Stitch",
  role: "Experimento 626",
  description: "Resistente, impredecible y sorprendentemente bueno protegiendo a su ohana.",
  colors: { primary: "#258fe6", secondary: "#f27d9f", glow: "#75f3ff" },
  stats: { maxHealth: 125, maxEnergy: 100, speed: 5.2, jumpPower: 13, abilityPower: 1.12 },
  abilities: {
    special: { name: "Pulso Alienígena", cost: 15, cooldown: 700, range: 230, color: "#9d7cff" },
    ultimate: { name: "Caos 626", cost: 45, cooldown: 3900, range: 390, color: "#75f3ff", requiredEvolutionStage: 1 }
  },
  evolution: {
    forms: [
      { name: "Stitch", level: 1, bonuses: {} },
      { name: "Stitch Centinela", level: 3, bonuses: { maxHealth: 24, maxEnergy: 12, speed: 0.18, abilityPower: 0.25 }, unlocks: ["ultimate"] },
      { name: "Stitch Galáctico", level: 6, bonuses: { maxHealth: 22, maxEnergy: 16, speed: 0.22, abilityPower: 0.35 } }
    ]
  }
};

export default STITCH;


const DRAGON = {
  id: "dragon",
  name: "Dragón de Milán",
  role: "Guardián volcánico",
  description: "Potencia bruta y un corazón cálido, aunque su aliento no sea precisamente discreto.",
  colors: { primary: "#63c976", secondary: "#d9a46e", glow: "#b9ff75" },
  stats: { maxHealth: 145, maxEnergy: 90, speed: 4.75, jumpPower: 12.4, abilityPower: 1.28 },
  abilities: {
    special: { name: "Aliento Esmeralda", cost: 18, cooldown: 880, range: 265, color: "#b9ff75" },
    ultimate: { name: "Corazón de Volcán", cost: 48, cooldown: 4600, range: 430, color: "#ff995c", requiredEvolutionStage: 1 }
  },
  evolution: {
    forms: [
      { name: "Dragón de Milán", level: 1, bonuses: {} },
      { name: "Dragón de Jade", level: 3, bonuses: { maxHealth: 28, maxEnergy: 12, speed: 0.16, abilityPower: 0.3 }, unlocks: ["ultimate"] },
      { name: "Dragón Solar", level: 6, bonuses: { maxHealth: 30, maxEnergy: 14, speed: 0.2, abilityPower: 0.4 } }
    ]
  }
};

export default DRAGON;


const KAWAII_CAT = {
  id: "kawaii-cat",
  name: "Gato Kawaii",
  role: "Explorador cósmico",
  description: "Pequeño, rapidísimo y con una tolerancia sospechosamente alta al caos.",
  colors: { primary: "#f68bb9", secondary: "#fff0f7", glow: "#ffb6df" },
  stats: { maxHealth: 92, maxEnergy: 132, speed: 6.05, jumpPower: 14.6, abilityPower: 0.95 },
  abilities: {
    special: { name: "Zarpazo Prisma", cost: 13, cooldown: 620, range: 205, color: "#ffb6df" },
    ultimate: { name: "Nyan Nova", cost: 40, cooldown: 3600, range: 345, color: "#f5b8ff", requiredEvolutionStage: 1 }
  },
  evolution: {
    forms: [
      { name: "Gato Kawaii", level: 1, bonuses: {} },
      { name: "Gato Nebulosa", level: 3, bonuses: { maxHealth: 15, maxEnergy: 22, speed: 0.28, abilityPower: 0.18 }, unlocks: ["ultimate"] },
      { name: "Gato Supernova", level: 6, bonuses: { maxHealth: 18, maxEnergy: 24, speed: 0.34, abilityPower: 0.28 } }
    ]
  }
};

export default KAWAII_CAT;


export const ORIGINAL_CAST = Object.freeze([LILO, STITCH, DRAGON, KAWAII_CAT]);

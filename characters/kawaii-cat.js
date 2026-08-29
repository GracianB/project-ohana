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

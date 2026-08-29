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

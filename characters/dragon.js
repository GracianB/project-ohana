const DRAGON = {
  id: "dragon",
  name: "Dino",
  role: "Dino de bolsillo",
  description: "Un dino pequeñito al extremo: tierno, ágil y con más energía de la que cabe en su cuerpo.",
  colors: { primary: "#5ecf6a", secondary: "#d8f8c8", glow: "#c8ff7a" },
  stats: { maxHealth: 90, maxEnergy: 90, speed: 3.8, jumpPower: 10.6, abilityPower: 1.05 },
  abilities: {
    special: { name: "Aliento Esmeralda", cost: 18, cooldown: 880, range: 265, color: "#b9ff75" },
    ultimate: { name: "Rugido Pico", cost: 48, cooldown: 4600, range: 430, color: "#7ee08a", requiredEvolutionStage: 1 }
  },
  evolution: {
    forms: [
      { name: "Dino Bebé", level: 1, bonuses: {} },
      { name: "Dino", level: 3, bonuses: { maxHealth: 18, maxEnergy: 10, speed: 0.2, abilityPower: 0.2 }, unlocks: ["ultimate"] },
      { name: "Dino Pico", level: 6, bonuses: { maxHealth: 20, maxEnergy: 12, speed: 0.25, abilityPower: 0.3 } }
    ]
  }
};

export default DRAGON;

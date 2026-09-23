const DRAGON = {
  id: "dragon",
  name: "Dino",
  role: "Dino de bolsillo",
  description: "Cinco formas inconfundibles: bebécito ovalado, bipedo clásico, crestado Pico, Rex de mandíbulas y GOD alado.",
  colors: { primary: "#5ecf6a", secondary: "#d8f8c8", glow: "#d4ff6a" },
  stats: { maxHealth: 90, maxEnergy: 90, speed: 3.8, jumpPower: 10.6, abilityPower: 1.15 },
  abilities: {
    special: { name: "Aliento Esmeralda", cost: 18, cooldown: 880, range: 280, color: "#b9ff75" },
    ultimate: { name: "Rugido Pico", cost: 48, cooldown: 4600, range: 460, color: "#7ee08a", requiredEvolutionStage: 1 }
  },
  evolution: {
    forms: [
      { name: "Dino Bebé", level: 1, bonuses: {}, look: "blob ovalado, un cuernito, ojos enormes" },
      { name: "Dino", level: 3, bonuses: { maxHealth: 18, maxEnergy: 10, speed: 0.2, abilityPower: 0.2 }, unlocks: ["ultimate"], look: "bípedo horizontal, cresta suave" },
      { name: "Dino Pico", level: 6, bonuses: { maxHealth: 20, maxEnergy: 12, speed: 0.25, abilityPower: 0.3 }, look: "vela dorsal + cuerno alto" },
      { name: "Dino Rex", level: 9, bonuses: { maxHealth: 24, maxEnergy: 14, speed: 0.2, abilityPower: 0.35 }, look: "mandíbulas enormes, brazos minúsculos" },
      { name: "DINO GOD", level: 12, bonuses: { maxHealth: 28, maxEnergy: 16, speed: 0.3, abilityPower: 0.45 }, look: "alas, corona dorada, aura" }
    ]
  }
};

export default DRAGON;

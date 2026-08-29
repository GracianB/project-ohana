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

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

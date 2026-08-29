
export const JungleWorld = {
  id: "jungle",
  name: "Selva Oculta",
  theme: "dense-jungle",
  sky: ["#0c3540", "#1d735c", "#89b85b"],
  ocean: "#155d5f",
  ground: "#5d5a3e",
  grass: "#1c8a58",
  ambient: "jungle",
  enemyTypes: ["crawler", "guardian"],

  generateDecoration(generator, x, y) {
    return {
      type: generator.choose(["palm", "flower", "rock", "vine", "fern"]),
      x, y
    };
  },

  renderAtmosphere(ctx, W, H, time) {
    ctx.fillStyle = "rgba(116,222,140,.08)";
    for (let i = 0; i < 10; i++) {
      const x = (i * 137 + time * .015) % W;
      const y = 90 + (i * 71) % 330;
      ctx.beginPath();
      ctx.arc(x, y, 3 + (i % 4), 0, Math.PI * 2);
      ctx.fill();
    }
  }
};

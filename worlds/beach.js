
export const BeachWorld = {
  id: "beach",
  name: "Costa Kai",
  theme: "tropical",
  sky: ["#167fc9", "#6ed2e8", "#f4d790"],
  ocean: "#1689a5",
  ground: "#d8b26b",
  grass: "#4f9b62",
  ambient: "ocean",
  enemyTypes: ["crawler"],

  generateDecoration(generator, x, y) {
    const choices = ["palm", "rock", "flower", "shell"];
    return {
      type: generator.choose(choices),
      x, y
    };
  },

  renderAtmosphere(ctx, W, H, time) {
    ctx.fillStyle = "rgba(255,238,170,.12)";
    ctx.beginPath();
    ctx.arc(W * .78, 110, 95 + Math.sin(time * .001) * 4, 0, Math.PI * 2);
    ctx.fill();
  }
};

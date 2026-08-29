
export const VolcanoWorld = {
  id: "volcano",
  name: "Monte Infernal",
  theme: "volcanic",
  sky: ["#30151d", "#8c3426", "#e0793e"],
  ocean: "#522126",
  ground: "#392e32",
  grass: "#71382d",
  ambient: "volcano",
  enemyTypes: ["crawler", "guardian"],

  generateDecoration(generator, x, y) {
    return {
      type: generator.choose(["rock", "lava-rock", "crystal"]),
      x, y
    };
  },

  renderAtmosphere(ctx, W, H, time) {
    ctx.fillStyle = "rgba(255,124,52,.12)";
    for (let i = 0; i < 18; i++) {
      const x = (i * 97 + time * .02) % W;
      const y = H - 280 - ((i * 43) % 160);
      ctx.beginPath();
      ctx.arc(x, y, 2 + i % 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};

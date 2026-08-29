
export const SpaceWorld = {
  id: "space",
  name: "Órbita Desconocida",
  theme: "cosmic",
  sky: ["#02030d", "#11143c", "#30235c"],
  ocean: "#05061c",
  ground: "#1d2244",
  grass: "#7a65d1",
  ambient: "space",
  enemyTypes: ["drone", "guardian"],

  generateDecoration(generator, x, y) {
    return {
      type: generator.choose(["space-rock", "crystal", "beacon"]),
      x, y
    };
  },

  renderAtmosphere(ctx, W, H, time) {
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 55; i++) {
      const x = (i * 211 + 17) % W;
      const y = (i * 97 + 29) % (H * .75);
      const pulse = 1 + Math.sin(time * .002 + i) * .5;
      ctx.globalAlpha = .25 + (i % 4) * .15;
      ctx.fillRect(x, y, pulse, pulse);
    }
    ctx.globalAlpha = 1;
  }
};

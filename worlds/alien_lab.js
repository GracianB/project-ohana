
export const AlienLabWorld = {
  id: "alien_lab",
  name: "Laboratorio X-626",
  theme: "alien-tech",
  sky: ["#071426", "#12345a", "#244b6d"],
  ocean: "#0a3144",
  ground: "#182b3a",
  grass: "#38d9d4",
  ambient: "laboratory",
  enemyTypes: ["drone", "guardian"],

  generateDecoration(generator, x, y) {
    return {
      type: generator.choose(["terminal", "pipe", "crystal", "alien-pod"]),
      x, y
    };
  },

  renderAtmosphere(ctx, W, H, time) {
    ctx.strokeStyle = "rgba(69,239,245,.16)";
    ctx.lineWidth = 1;
    const shift = (time * .03) % 60;

    for (let x = -60 + shift; x < W; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + W * .2, H);
      ctx.stroke();
    }
  }
};

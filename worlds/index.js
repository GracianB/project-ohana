export const WORLDS = [
  { id: "beach", name: "Isla Kauai", ground: "#d9b36a", groundTop: "#4a8c52", sky: ["#6ec7ff", "#e8f6ff"] },
  { id: "jungle", name: "Jungla", ground: "#2f6b2a", groundTop: "#6bd35a", sky: ["#17331a", "#3d7a36"] },
  { id: "volcano", name: "Volcan", ground: "#3a1a12", groundTop: "#ff5a12", sky: ["#2a0808", "#8a2208"] },
  { id: "space", name: "Espacio", ground: "#1a1a28", groundTop: "#6a3cff", sky: ["#050510", "#12122a"] },
  { id: "lab", name: "Alien Lab", ground: "#1c2430", groundTop: "#3cf", sky: ["#0b1218", "#163040"] }
];

export function renderWorld(ctx, world, cam, t, W, H) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, world.sky[0]);
  g.addColorStop(1, world.sky[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  if (world.id === "beach") {
    ctx.fillStyle = "#4aa3e8";
    ctx.fillRect(0, H * 0.62, W, H);
    ctx.fillStyle = "rgba(255,255,255,.7)";
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.ellipse((i * 280 + t * 0.2) % W, 70 + i * 16, 40, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (world.id === "jungle") {
    for (let i = 0; i < 10; i++) {
      const x = ((i * 160 - cam.x * 0.4) % (W + 160));
      ctx.fillStyle = "#163816";
      ctx.fillRect(x, H * 0.2, 28, H);
      ctx.fillStyle = "#2f7a2c";
      ctx.beginPath();
      ctx.arc(x + 14, H * 0.22, 36, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (world.id === "volcano") {
    ctx.fillStyle = "#2a0c08";
    for (let i = 0; i < 4; i++) {
      const x = ((i * 320 - cam.x * 0.2) % (W + 320));
      ctx.beginPath();
      ctx.moveTo(x, H * 0.7);
      ctx.lineTo(x + 90, H * 0.3);
      ctx.lineTo(x + 180, H * 0.7);
      ctx.fill();
    }
    ctx.fillStyle = "#ff5a12";
    ctx.globalAlpha = 0.5;
    ctx.fillRect(0, H * 0.72, W, 16);
    ctx.globalAlpha = 1;
  }

  if (world.id === "space") {
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 70; i++) ctx.fillRect((i * 97 + cam.x * 0.05) % W, (i * 53) % H, 2, 2);
    ctx.fillStyle = "#6a3cff";
    ctx.beginPath();
    ctx.arc(W * 0.75, 120, 40, 0, Math.PI * 2);
    ctx.fill();
  }

  if (world.id === "lab") {
    ctx.fillStyle = "#102028";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#1e3a48";
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
  }
}

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
  if (world.id === "beach") drawBeach(ctx, cam, t, W, H);
  if (world.id === "jungle") drawJungle(ctx, cam, t, W, H);
  if (world.id === "volcano") drawVolcano(ctx, cam, t, W, H);
  if (world.id === "space") drawSpace(ctx, cam, t, W, H);
  if (world.id === "lab") drawLab(ctx, cam, t, W, H);
}

function drawBeach(ctx, cam, t, W, H) {
  ctx.fillStyle = "#4aa3e8";
  ctx.fillRect(0, H * 0.62, W, H);
}

function drawJungle(ctx, cam, t, W, H) {
  ctx.fillStyle = "rgba(20,60,20,.35)";
  ctx.fillRect(0, 0, W, H);
}

function drawVolcano(ctx, cam, t, W, H) {
  ctx.fillStyle = "#ff5a12";
  ctx.globalAlpha = 0.4;
  ctx.fillRect(0, H * 0.72, W, 18);
  ctx.globalAlpha = 1;
}

function drawSpace(ctx, cam, t, W, H) {
  ctx.fillStyle = "#fff";
  for (let i = 0; i < 40; i++) ctx.fillRect((i * 97) % W, (i * 53) % H, 2, 2);
}

function drawLab(ctx, cam, t, W, H) {
  ctx.fillStyle = "#102028";
  ctx.fillRect(0, 0, W, H);
}

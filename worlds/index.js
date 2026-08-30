export const WORLDS = [
  { id: "beach", name: "Isla Kauai", ground: "#d9b36a", sky: ["#6ec7ff", "#e8f6ff"] },
  { id: "jungle", name: "Jungla", ground: "#2f6b2a", sky: ["#17331a", "#3d7a36"] },
  { id: "volcano", name: "Volcán", ground: "#3a1a12", sky: ["#2a0808", "#8a2208"] },
  { id: "space", name: "Espacio", ground: "#1a1a28", sky: ["#050510", "#12122a"] },
  { id: "lab", name: "Alien Lab", ground: "#1c2430", sky: ["#0b1218", "#163040"] },
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
  ctx.fillStyle = "#3b90d0";
  for (let i = 0; i < 8; i++) {
    const x = ((i * 220 - cam.x * 0.3) % (W + 220)) - 40;
    ctx.beginPath();
    ctx.ellipse(x, H * 0.64 + Math.sin(t / 20 + i) * 4, 80, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(255,255,255,.7)";
  for (let i = 0; i < 5; i++) {
    const x = ((i * 280 - cam.x * 0.15 + t * 0.2) % (W + 200));
    ctx.beginPath();
    ctx.ellipse(x, 70 + i * 16, 40, 14, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 6; i++) {
    const x = ((i * 260 - cam.x * 0.6) % (W + 200));
    ctx.fillStyle = "#6b3";
    ctx.fillRect(x + 18, H * 0.52, 8, 90);
    ctx.fillStyle = "#2a7a28";
    ctx.beginPath();
    ctx.moveTo(x + 22, H * 0.52);
    ctx.lineTo(x - 20, H * 0.62);
    ctx.lineTo(x + 64, H * 0.62);
    ctx.fill();
  }
}

function drawJungle(ctx, cam, t, W, H) {
  ctx.fillStyle = "rgba(20,60,20,.35)";
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 12; i++) {
    const x = ((i * 140 - cam.x * 0.4) % (W + 160));
    ctx.fillStyle = i % 2 ? "#1d4a1c" : "#163816";
    ctx.fillRect(x, H * 0.2, 28, H);
    ctx.fillStyle = "#2f7a2c";
    ctx.beginPath();
    ctx.arc(x + 14, H * 0.22, 40, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(80,180,80,.15)";
  for (let i = 0; i < 20; i++) {
    ctx.fillRect(((i * 90 + t) % W), (i * 37 + t * 0.4) % H, 3, 8);
  }
}

function drawVolcano(ctx, cam, t, W, H) {
  ctx.fillStyle = "#2a0c08";
  for (let i = 0; i < 5; i++) {
    const x = ((i * 300 - cam.x * 0.25) % (W + 300));
    ctx.beginPath();
    ctx.moveTo(x, H * 0.7);
    ctx.lineTo(x + 90, H * 0.28);
    ctx.lineTo(x + 180, H * 0.7);
    ctx.fill();
  }
  ctx.fillStyle = "#ff5a12";
  ctx.globalAlpha = 0.55 + Math.sin(t / 8) * 0.15;
  ctx.fillRect(0, H * 0.72, W, 18);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(40,20,10,.5)";
  for (let i = 0; i < 10; i++) {
    const x = (i * 130 + t * 0.3) % W;
    ctx.beginPath();
    ctx.ellipse(x, 80 + (i % 4) * 20, 30, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSpace(ctx, cam, t, W, H) {
  ctx.fillStyle = "#fff";
  for (let i = 0; i < 80; i++) {
    const x = (i * 97 + cam.x * 0.05) % W;
    const y = (i * 53) % H;
    ctx.globalAlpha = 0.4 + ((i * 13) % 10) / 20;
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#6a3cff";
  ctx.beginPath();
  ctx.arc(W * 0.75, 120, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c84";
  ctx.beginPath();
  ctx.arc(W * 0.2, 180, 22, 0, Math.PI * 2);
  ctx.fill();
}

function drawLab(ctx, cam, t, W, H) {
  ctx.fillStyle = "#102028";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#1e3a48";
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let i = 0; i < 6; i++) {
    const x = ((i * 220 - cam.x * 0.3) % (W + 220));
    ctx.fillStyle = `rgba(80,220,255,${0.15 + Math.sin(t / 12 + i) * 0.1})`;
    ctx.fillRect(x, 80, 70, 40);
    ctx.fillStyle = "#2a4";
    ctx.fillRect(x + 20, 200, 12, 180);
  }
}

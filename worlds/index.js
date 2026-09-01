export const WORLDS = [
  { id: "beach", name: "Isla Kauai", ground: "#d7a45a", groundTop: "#4fa35c", sky: ["#4eb4ff", "#ffe7c4"] },
  { id: "jungle", name: "Jungla", ground: "#245522", groundTop: "#63c85a", sky: ["#0d1f0e", "#2c6a2a"] },
  { id: "volcano", name: "Volcán", ground: "#3a1610", groundTop: "#ff6a22", sky: ["#180505", "#7a1c08"] },
  { id: "space", name: "Espacio", ground: "#161628", groundTop: "#7a5cff", sky: ["#050510", "#17143a"] },
  { id: "lab", name: "Alien Lab", ground: "#15202a", groundTop: "#3ee0ff", sky: ["#071018", "#163646"] }
];

export function renderWorld(ctx, world, cam, t, W, H) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, world.sky[0]);
  g.addColorStop(1, world.sky[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  if (world.id === "beach") drawBeach(ctx, cam, t, W, H);
  else if (world.id === "jungle") drawJungle(ctx, cam, t, W, H);
  else if (world.id === "volcano") drawVolcano(ctx, cam, t, W, H);
  else if (world.id === "space") drawSpace(ctx, cam, t, W, H);
  else if (world.id === "lab") drawLab(ctx, cam, t, W, H);
}

function drawBeach(ctx, cam, t, W, H) {
  ctx.fillStyle = "rgba(255,220,120,.22)";
  ctx.beginPath(); ctx.arc(W * 0.78, 90, 70, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.62)";
  for (let i = 0; i < 3; i++) {
    const x = ((i * 420 - cam.x * 0.1 + t * 0.18) % (W + 180));
    ctx.beginPath(); ctx.ellipse(x, 64 + (i % 3) * 16, 50, 16, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = "#3ea0e0"; ctx.fillRect(0, H * 0.56, W, H);
  ctx.fillStyle = "#2f86c8";
  for (let i = 0; i < 5; i++) {
    const x = ((i * 280 - cam.x * 0.22) % (W + 190)) - 40;
    ctx.beginPath(); ctx.ellipse(x, H * 0.58 + Math.sin(t / 16 + i) * 5, 92, 12, 0, 0, Math.PI * 2); ctx.fill();
  }
  for (let i = 0; i < 4; i++) {
    const x = ((i * 360 - cam.x * 0.5) % (W + 220));
    ctx.fillStyle = "#6a3b22"; ctx.fillRect(x + 20, H * 0.46, 10, 120);
    ctx.fillStyle = "#1f7a3a";
    ctx.beginPath(); ctx.moveTo(x + 25, H * 0.46); ctx.lineTo(x - 30, H * 0.58); ctx.lineTo(x + 80, H * 0.58); ctx.fill();
  }
}

function drawJungle(ctx, cam, t, W, H) {
  ctx.fillStyle = "rgba(8,30,10,.38)"; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 7; i++) {
    const x = ((i * 210 - cam.x * 0.32) % (W + 140));
    ctx.fillStyle = i % 2 ? "#163816" : "#0f2a10";
    ctx.fillRect(x, H * 0.1, 34, H);
    ctx.fillStyle = "#247a32";
    ctx.beginPath(); ctx.arc(x + 17, H * 0.14, 48, 0, Math.PI * 2); ctx.fill();
  }
}

function drawVolcano(ctx, cam, t, W, H) {
  ctx.fillStyle = "#220808";
  for (let i = 0; i < 3; i++) {
    const x = ((i * 420 - cam.x * 0.2) % (W + 300));
    ctx.beginPath(); ctx.moveTo(x, H * 0.7); ctx.lineTo(x + 100, H * 0.22); ctx.lineTo(x + 200, H * 0.7); ctx.fill();
  }
  ctx.fillStyle = "#ff4a10";
  ctx.globalAlpha = 0.42 + Math.sin(t / 8) * 0.12;
  ctx.fillRect(0, H * 0.68, W, 24);
  ctx.globalAlpha = 1;
}

function drawSpace(ctx, cam, t, W, H) {
  ctx.fillStyle = "#fff";
  for (let i = 0; i < 28; i++) {
    ctx.globalAlpha = 0.4 + ((i * 13) % 10) / 20;
    ctx.fillRect((i * 97 + cam.x * 0.04) % W, (i * 53) % H, 2, 2);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(180,140,255,.22)";
  ctx.beginPath(); ctx.arc(W * 0.78, 128, 78, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#6a3cff";
  ctx.beginPath(); ctx.arc(W * 0.78, 128, 46, 0, Math.PI * 2); ctx.fill();
}

function drawLab(ctx, cam, t, W, H) {
  ctx.fillStyle = "#0c171e"; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(40,80,100,.28)";
  for (let x = 0; x < W; x += 64) ctx.fillRect(x, 0, 1, H);
  for (let i = 0; i < 4; i++) {
    const x = ((i * 320 - cam.x * 0.26) % (W + 230));
    ctx.fillStyle = "rgba(80,220,255,.16)";
    ctx.fillRect(x, 70, 86, 46);
    ctx.fillStyle = "#1d4"; ctx.fillRect(x + 30, 210, 14, 200);
  }
}

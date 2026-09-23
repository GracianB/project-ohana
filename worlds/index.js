// Ohana — world rendering · MAX visual pass (Fase 3+)
// Richer, layered, parallax backgrounds per world. Same public API:
//   WORLDS[]  ·  renderWorld(ctx, world, cam, t, W, H)
// Each world adds `edge` (platform glow accent) used by the platform draw.

export const WORLDS = [
  { id: "beach",   name: "Isla Hoku", ground: "#c9964e", groundTop: "#6bb86a", edge: "#8fe0a6", sky: ["#1b6fd6", "#57b8ef", "#ffe7bd"] },
  { id: "jungle",  name: "Jungla",    ground: "#245522", groundTop: "#63c85a", edge: "#a6f07a", sky: ["#07160a", "#123a18", "#2f6a2e"] },
  { id: "volcano", name: "Volcán",    ground: "#3a1610", groundTop: "#ff6a22", edge: "#ffb04a", sky: ["#120303", "#3a0c06", "#7a1c08"] },
  { id: "space",   name: "Espacio",   ground: "#161628", groundTop: "#7a5cff", edge: "#9a7cff", sky: ["#03030c", "#0b0a24", "#191542"] },
  { id: "lab",     name: "Alien Lab", ground: "#15202a", groundTop: "#3ee0ff", edge: "#7af3ff", sky: ["#050d13", "#0a1a24", "#123646"] },
  { id: "aquatic", name: "Abismo",    ground: "#062038", groundTop: "#1a7a9a", edge: "#4ec8e8", sky: ["#010c1c", "#042848", "#0a4a78"] },
  { id: "grove",   name: "Claro",     ground: "#3a6a32", groundTop: "#7ec85a", edge: "#b8f090", sky: ["#6eb8e8", "#a8d8f0", "#e8f4c8"] }
];

// deterministic pseudo-random for stable star/particle fields
function pr(i) { const s = Math.sin(i * 127.1 + 43.7) * 43758.5; return s - Math.floor(s); }

export function renderWorld(ctx, world, cam, t, W, H) {
  const sky = world.sky || ["#0a0a12", "#161630"];
  const g = ctx.createLinearGradient(0, 0, 0, H);
  if (sky.length >= 3) {
    g.addColorStop(0, sky[0]); g.addColorStop(0.55, sky[1]); g.addColorStop(1, sky[2]);
  } else { g.addColorStop(0, sky[0]); g.addColorStop(1, sky[1]); }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  if (world.id === "beach") drawBeach(ctx, cam, t, W, H);
  else if (world.id === "jungle") drawJungle(ctx, cam, t, W, H);
  else if (world.id === "volcano") drawVolcano(ctx, cam, t, W, H);
  else if (world.id === "space") drawSpace(ctx, cam, t, W, H);
  else if (world.id === "lab") drawLab(ctx, cam, t, W, H);
  else if (world.id === "aquatic") drawAquatic(ctx, cam, t, W, H);
  else if (world.id === "grove") drawGrove(ctx, cam, t, W, H);

  // subtle global top vignette to seat the HUD
  const tv = ctx.createLinearGradient(0, 0, 0, 160);
  tv.addColorStop(0, "rgba(0,0,0,.22)"); tv.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = tv; ctx.fillRect(0, 0, W, 160);
}

/* ─────────────────────────  BEACH · Isla Hoku  ───────────────────────── */
function drawBeach(ctx, cam, t, W, H) {
  // sun — layered glow + warm core
  const sx = W * 0.78, sy = 108;
  const outer = ctx.createRadialGradient(sx, sy, 8, sx, sy, 210);
  outer.addColorStop(0, "rgba(255,248,210,.98)");
  outer.addColorStop(0.22, "rgba(255,230,150,.55)");
  outer.addColorStop(0.55, "rgba(255,200,110,.18)");
  outer.addColorStop(1, "rgba(255,190,100,0)");
  ctx.fillStyle = outer; ctx.beginPath(); ctx.arc(sx, sy, 210, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,252,235,.98)"; ctx.beginPath(); ctx.arc(sx, sy, 36, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,236,160,.55)"; ctx.beginPath(); ctx.arc(sx, sy, 52, 0, Math.PI * 2); ctx.fill();

  // distant island silhouettes (far parallax)
  for (let i = 0; i < 6; i++) {
    const x = ((i * 480 - cam.x * 0.05) % (W + 480)) - 140;
    const y = H * 0.48;
    ctx.fillStyle = i % 2 ? "rgba(55,105,135,.36)" : "rgba(70,125,155,.42)";
    ctx.beginPath();
    ctx.moveTo(x, y + 40);
    ctx.quadraticCurveTo(x + 90, y - 70, x + 180, y - 10);
    ctx.quadraticCurveTo(x + 260, y - 55, x + 340, y + 40);
    ctx.closePath(); ctx.fill();
  }

  // soft clouds
  for (let i = 0; i < 7; i++) {
    const x = ((i * 340 - cam.x * 0.1 + t * 0.18) % (W + 320)) - 140;
    const y = 48 + (i % 3) * 32;
    const a = 0.55 - (i % 3) * 0.12;
    ctx.fillStyle = "rgba(255,255,255," + a + ")";
    cloud(ctx, x, y, 54 + (i % 2) * 26);
  }

  // sand strip ABOVE the ocean — water starts below sand
  const sandY = H * 0.52;
  const oceanY = sandY + 58;
  const sandG = ctx.createLinearGradient(0, sandY, 0, oceanY);
  sandG.addColorStop(0, "#e8c078");
  sandG.addColorStop(0.55, "#d4a858");
  sandG.addColorStop(1, "#c8964a");
  ctx.fillStyle = sandG; ctx.fillRect(0, sandY, W, oceanY - sandY);

  // sand grain / ripples
  ctx.fillStyle = "rgba(255,230,180,.22)";
  for (let i = 0; i < 10; i++) {
    const yy = sandY + 8 + i * 5 + Math.sin(t / 40 + i) * 1.5;
    ctx.fillRect(0, yy, W, 1.5);
  }

  // ocean with depth gradient
  const og = ctx.createLinearGradient(0, oceanY, 0, H);
  og.addColorStop(0, "#6ec8ef");
  og.addColorStop(0.35, "#3a9ed4");
  og.addColorStop(1, "#185a96");
  ctx.fillStyle = og; ctx.fillRect(0, oceanY, W, H - oceanY);

  // sun reflection column on water
  ctx.fillStyle = "rgba(255,246,210,.30)";
  for (let i = 0; i < 9; i++) {
    const yy = oceanY + 14 + i * 16;
    const ww = 100 - i * 8 + Math.sin(t / 8 + i) * 10;
    ctx.globalAlpha = 0.55 - i * 0.045;
    ctx.fillRect(sx - ww / 2, yy, ww, 3.5);
  }
  ctx.globalAlpha = 1;

  // animated wave bands
  for (let i = 0; i < 8; i++) {
    const x = ((i * 280 - cam.x * 0.2 + t * 0.35) % (W + 240)) - 80;
    const yy = oceanY + 28 + i * 22 + Math.sin(t / 14 + i) * 5;
    ctx.fillStyle = "rgba(210,240,255," + (0.18 + (i % 3) * 0.06) + ")";
    ctx.beginPath(); ctx.ellipse(x, yy, 110 - i * 4, 8, 0, 0, Math.PI * 2); ctx.fill();
  }

  // foam / shoreline where sand meets water
  ctx.fillStyle = "rgba(255,255,255,.55)";
  for (let i = 0; i < 14; i++) {
    const x = ((i * 140 - cam.x * 0.35 + t * 0.6) % (W + 160)) - 40;
    const bob = Math.sin(t / 10 + i * 0.9) * 3;
    ctx.beginPath();
    ctx.ellipse(x, oceanY + bob, 48 + (i % 3) * 10, 5 + (i % 2), 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // wet sand sheen just above foam
  const wet = ctx.createLinearGradient(0, oceanY - 10, 0, oceanY + 4);
  wet.addColorStop(0, "rgba(180,150,100,0)");
  wet.addColorStop(1, "rgba(120,170,200,.28)");
  ctx.fillStyle = wet; ctx.fillRect(0, oceanY - 10, W, 14);

  // shells & rocks on sand (land only)
  for (let i = 0; i < 14; i++) {
    const wx = pr(i + 40) * 1600;
    if (wx > 600 && wx < 900) continue;
    const x = wx - cam.x * 0.55;
    const y = sandY + 18 + pr(i + 50) * 28;
    if (i % 3 === 0) {
      ctx.fillStyle = "rgba(90,80,70,.55)";
      ctx.beginPath(); ctx.ellipse(x, y, 5 + pr(i) * 4, 3 + pr(i + 1) * 2, 0.3, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = i % 2 ? "rgba(240,220,200,.7)" : "rgba(255,180,160,.65)";
      ctx.beginPath(); ctx.ellipse(x, y, 4, 3, -0.4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(200,140,120,.5)"; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(x - 2, y); ctx.quadraticCurveTo(x, y - 2, x + 2, y); ctx.stroke();
    }
  }

  // palms ONLY on land — never in pit gap
  const palmSpots = [90, 260, 480, 980, 1180, 1420];
  for (let i = 0; i < palmSpots.length; i++) {
    const wx = palmSpots[i];
    const x = wx - cam.x * 0.55;
    palm(ctx, x, sandY + 4, t + i * 7, i);
  }

  // drifting light motes above sand / sky
  ctx.fillStyle = "rgba(255,250,220,.55)";
  for (let i = 0; i < 18; i++) {
    const x = (pr(i) * W + t * (0.15 + pr(i) * 0.25)) % W;
    const y = (pr(i + 9) * sandY + Math.sin(t / 18 + i) * 10) % sandY;
    ctx.globalAlpha = 0.22 + pr(i + 3) * 0.4;
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.globalAlpha = 1;
}
function cloud(ctx, x, y, r) {
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.48, 0, 0, Math.PI * 2);
  ctx.ellipse(x + r * 0.72, y + 3, r * 0.62, r * 0.38, 0, 0, Math.PI * 2);
  ctx.ellipse(x - r * 0.68, y + 5, r * 0.58, r * 0.34, 0, 0, Math.PI * 2);
  ctx.ellipse(x + r * 0.15, y - r * 0.28, r * 0.45, r * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();
}
function palm(ctx, x, baseY, t, seed) {
  const s = seed || 0;
  const lean = (s % 2 ? 1 : -1) * (6 + (s % 3) * 3);
  const tipX = x + lean;
  const tipY = baseY - 148 - (s % 3) * 8;

  ctx.fillStyle = "rgba(80,50,20,.22)";
  ctx.beginPath();
  ctx.ellipse(x + lean * 0.4, baseY + 4, 28, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#7a4a28";
  ctx.lineCap = "round";
  for (let seg = 0; seg < 5; seg++) {
    const y0 = baseY - seg * 30;
    const y1 = baseY - (seg + 1) * 30;
    const x0 = x + lean * (seg / 5);
    const x1 = x + lean * ((seg + 1) / 5);
    ctx.lineWidth = 12 - seg * 1.4;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(x0 + 3, (y0 + y1) / 2, x1, y1);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(50,28,12,.35)";
  ctx.lineWidth = 1.5;
  for (let k = 0; k < 6; k++) {
    const by = baseY - 18 - k * 22;
    const bx = x + lean * ((baseY - by) / 150);
    ctx.beginPath();
    ctx.moveTo(bx - 5, by);
    ctx.lineTo(bx + 5, by + 2);
    ctx.stroke();
  }

  const nLeaves = 7;
  for (let a = 0; a < nLeaves; a++) {
    const ang = -Math.PI / 2 + (a - (nLeaves - 1) / 2) * 0.42 + Math.sin(t / 18 + a + s) * 0.07;
    const len = 72 + (a % 3) * 10;
    const midX = tipX + Math.cos(ang) * len * 0.45;
    const midY = tipY + Math.sin(ang) * len * 0.45;
    const endX = tipX + Math.cos(ang) * len;
    const endY = tipY + Math.sin(ang) * len + 16;
    ctx.strokeStyle = "#146832";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.quadraticCurveTo(midX, midY, endX, endY);
    ctx.stroke();
    ctx.strokeStyle = "#2cb85a";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.quadraticCurveTo(midX - 2, midY - 2, endX - 2, endY - 3);
    ctx.stroke();
  }

  if (s % 2 === 0) {
    ctx.fillStyle = "#5a3a18";
    for (let c = 0; c < 3; c++) {
      const cx = tipX + (c - 1) * 7;
      const cy = tipY + 10 + (c % 2) * 4;
      ctx.beginPath(); ctx.arc(cx, cy, 4.5, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.lineCap = "butt";
}

/* ─────────────────────────  GROVE · Claro Ohana (hub)  ───────────────────────── */
function drawGrove(ctx, cam, t, W, H) {
  // soft warm sun wash (no ocean)
  const sx = W * 0.72, sy = 90;
  const sun = ctx.createRadialGradient(sx, sy, 6, sx, sy, 180);
  sun.addColorStop(0, "rgba(255,250,210,.95)");
  sun.addColorStop(0.35, "rgba(255,230,150,.35)");
  sun.addColorStop(1, "rgba(255,220,140,0)");
  ctx.fillStyle = sun; ctx.beginPath(); ctx.arc(sx, sy, 180, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,252,230,.9)"; ctx.beginPath(); ctx.arc(sx, sy, 28, 0, Math.PI * 2); ctx.fill();

  // distant soft hills
  for (let i = 0; i < 4; i++) {
    const x = ((i * 420 - cam.x * 0.06) % (W + 420)) - 100;
    const y = H * 0.52;
    ctx.fillStyle = i % 2 ? "rgba(70,130,70,.28)" : "rgba(90,150,85,.34)";
    ctx.beginPath();
    ctx.moveTo(x, y + 60);
    ctx.quadraticCurveTo(x + 100, y - 50, x + 210, y + 10);
    ctx.quadraticCurveTo(x + 300, y - 40, x + 400, y + 60);
    ctx.closePath(); ctx.fill();
  }

  // far tree silhouettes (parallax)
  for (let i = 0; i < 10; i++) {
    const x = ((i * 180 - cam.x * 0.14) % (W + 200)) - 40;
    const trunkH = 70 + (i % 3) * 18;
    const base = H * 0.58;
    ctx.fillStyle = "rgba(40,70,35,.45)";
    ctx.fillRect(x + 18, base - trunkH, 10, trunkH);
    ctx.beginPath();
    ctx.arc(x + 23, base - trunkH - 8, 28 + (i % 3) * 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 8, base - trunkH + 10, 20, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 38, base - trunkH + 12, 18, 0, Math.PI * 2); ctx.fill();
  }

  // mid trees (clearer)
  for (let i = 0; i < 7; i++) {
    const x = ((i * 260 - cam.x * 0.28) % (W + 280)) - 60;
    const base = H * 0.62;
    const trunkH = 110 + (i % 2) * 30;
    ctx.fillStyle = "#4a3420";
    ctx.fillRect(x + 22, base - trunkH, 14, trunkH);
    ctx.fillStyle = i % 2 ? "#2e6a28" : "#3a8030";
    ctx.beginPath(); ctx.arc(x + 29, base - trunkH - 10, 42, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 8, base - trunkH + 18, 30, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 50, base - trunkH + 16, 28, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(140,210,90,.35)";
    ctx.beginPath(); ctx.arc(x + 20, base - trunkH - 18, 18, 0, Math.PI * 2); ctx.fill();
  }

  // grass meadow band
  const grassY = H * 0.58;
  const gg = ctx.createLinearGradient(0, grassY, 0, H);
  gg.addColorStop(0, "#6eb84e");
  gg.addColorStop(0.4, "#4a9038");
  gg.addColorStop(1, "#2e6028");
  ctx.fillStyle = gg; ctx.fillRect(0, grassY, W, H - grassY);

  // grass blades
  ctx.strokeStyle = "rgba(90,180,70,.55)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 40; i++) {
    const x = ((i * 48 - cam.x * 0.4 + t * 0.08) % (W + 60));
    const sway = Math.sin(t / 16 + i) * 3;
    ctx.beginPath();
    ctx.moveTo(x, grassY + 8 + (i % 5) * 6);
    ctx.quadraticCurveTo(x + sway, grassY - 6, x + sway * 1.4, grassY - 18 - (i % 3) * 4);
    ctx.stroke();
  }

  // soft clouds
  for (let i = 0; i < 5; i++) {
    const x = ((i * 360 - cam.x * 0.08 + t * 0.12) % (W + 300)) - 120;
    const y = 40 + (i % 3) * 28;
    ctx.fillStyle = "rgba(255,255,255," + (0.5 - (i % 3) * 0.1) + ")";
    cloud(ctx, x, y, 48 + (i % 2) * 20);
  }

  // floating light motes (fireflies / pollen)
  for (let i = 0; i < 22; i++) {
    const x = (pr(i) * W - cam.x * 0.2 + t * (0.1 + pr(i) * 0.2) + W) % W;
    const y = grassY * 0.35 + pr(i + 5) * (grassY * 0.55) + Math.sin(t / 20 + i) * 12;
    ctx.fillStyle = "rgba(255,255,180," + (0.25 + pr(i + 2) * 0.5) + ")";
    ctx.beginPath(); ctx.arc(x, y, 1.4 + pr(i) * 1.6, 0, Math.PI * 2); ctx.fill();
  }

  // soft edge vignette (warm, not abyss)
  const vg = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.25, W / 2, H * 0.45, H * 0.85);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(20,40,10,.18)");
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
}

/* ─────────────────────────  JUNGLE  ───────────────────────── */
function drawJungle(ctx, cam, t, W, H) {
  // depth wash
  ctx.fillStyle = "rgba(4,20,8,.42)"; ctx.fillRect(0, 0, W, H);

  // four canopy layers, back → front (denser)
  const layers = [
    { p: 0.08, col: "#081c0a", r: 52, y: 0.14, step: 130 },
    { p: 0.18, col: "#0c280f", r: 68, y: 0.12, step: 170 },
    { p: 0.32, col: "#143a18", r: 86, y: 0.09, step: 220 },
    { p: 0.5,  col: "#1e5224", r: 102, y: 0.05, step: 280 },
  ];
  for (const L of layers) {
    ctx.fillStyle = L.col;
    for (let i = -1; i < W / L.step + 2; i++) {
      const x = ((i * L.step - cam.x * L.p) % (W + L.step * 2));
      ctx.fillRect(x + L.r * 0.4, H * L.y, 28, H);
      ctx.beginPath(); ctx.arc(x + L.r * 0.5, H * L.y, L.r, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x - L.r * 0.25, H * L.y + 22, L.r * 0.72, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + L.r * 1.15, H * L.y + 18, L.r * 0.68, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + L.r * 0.2, H * L.y - 20, L.r * 0.5, 0, Math.PI * 2); ctx.fill();
    }
  }

  // hanging vines
  ctx.strokeStyle = "rgba(30,90,40,.55)";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  for (let i = 0; i < 8; i++) {
    const x = ((i * 200 - cam.x * 0.35) % (W + 180));
    const sway = Math.sin(t / 22 + i) * 10;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.quadraticCurveTo(x + sway, H * 0.25, x + sway * 0.5, H * 0.42 + (i % 3) * 20);
    ctx.stroke();
  }
  ctx.lineCap = "butt";

  // green god rays (stronger)
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 6; i++) {
    const x = (i * 300 + 80 - cam.x * 0.05 + Math.sin(t / 50 + i) * 12) % (W + 220);
    const grd = ctx.createLinearGradient(x, 0, x - 100, H);
    grd.addColorStop(0, "rgba(180,255,140,.14)");
    grd.addColorStop(0.5, "rgba(140,230,100,.05)");
    grd.addColorStop(1, "rgba(180,255,150,0)");
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 80, 0); ctx.lineTo(x - 50, H); ctx.lineTo(x - 170, H); ctx.fill();
  }
  ctx.restore();

  // floating spores (denser)
  for (let i = 0; i < 28; i++) {
    const x = (pr(i) * W - cam.x * 0.3 + t * 0.15) % W;
    const y = (pr(i + 5) * H + Math.sin(t / 24 + i) * 14) % H;
    ctx.fillStyle = "rgba(180,240,150," + (0.2 + pr(i + 2) * 0.45) + ")";
    ctx.beginPath(); ctx.arc((x + W) % W, y, 1.5 + pr(i) * 1.8, 0, Math.PI * 2); ctx.fill();
  }

  // ground mist
  const mist = ctx.createLinearGradient(0, H * 0.7, 0, H);
  mist.addColorStop(0, "rgba(40,80,40,0)");
  mist.addColorStop(1, "rgba(20,50,25,.35)");
  ctx.fillStyle = mist; ctx.fillRect(0, H * 0.7, W, H * 0.3);
}

/* ─────────────────────────  VOLCANO  ───────────────────────── */
function drawVolcano(ctx, cam, t, W, H) {
  // distant volcano silhouettes with glowing craters
  for (let i = 0; i < 4; i++) {
    const x = ((i * 420 - cam.x * 0.12) % (W + 420)) - 120;
    const peak = H * (0.2 + (i % 3) * 0.04), base = H * 0.74;
    ctx.fillStyle = i % 2 ? "#1a0604" : "#240a06";
    ctx.beginPath(); ctx.moveTo(x, base); ctx.lineTo(x + 140, peak); ctx.lineTo(x + 280, base); ctx.closePath(); ctx.fill();
    // lava crown + glow
    const glow = 0.55 + Math.sin(t / 7 + i) * 0.25;
    ctx.fillStyle = "rgba(255,100,20," + glow + ")";
    ctx.beginPath(); ctx.moveTo(x + 118, peak + 8); ctx.lineTo(x + 140, peak - 14); ctx.lineTo(x + 162, peak + 8); ctx.fill();
    const crater = ctx.createRadialGradient(x + 140, peak + 4, 2, x + 140, peak + 4, 40);
    crater.addColorStop(0, "rgba(255,180,40," + (0.5 * glow) + ")");
    crater.addColorStop(1, "rgba(255,80,0,0)");
    ctx.fillStyle = crater; ctx.beginPath(); ctx.arc(x + 140, peak + 4, 40, 0, Math.PI * 2); ctx.fill();
  }

  // lava rivers (simple streaks)
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 3; i++) {
    const x = ((i * 380 - cam.x * 0.2) % (W + 300));
    const pulse = 0.35 + Math.sin(t / 8 + i) * 0.12;
    ctx.strokeStyle = "rgba(255,90,20," + pulse + ")";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x, H * 0.45);
    ctx.quadraticCurveTo(x + 30, H * 0.58, x - 10, H * 0.78);
    ctx.stroke();
  }

  // lava haze at bottom (intense)
  const lg = ctx.createLinearGradient(0, H * 0.55, 0, H);
  lg.addColorStop(0, "rgba(255,74,16,0)");
  lg.addColorStop(0.5, "rgba(255,80,20," + (0.22 + Math.sin(t / 9) * 0.06) + ")");
  lg.addColorStop(1, "rgba(255,50,10," + (0.4 + Math.sin(t / 9) * 0.1) + ")");
  ctx.fillStyle = lg; ctx.fillRect(0, H * 0.55, W, H * 0.45);
  ctx.restore();

  // rising embers (more)
  for (let i = 0; i < 36; i++) {
    const life = (t * (0.6 + pr(i) * 0.8) + pr(i) * 900) % 900;
    const x = (pr(i) * W + Math.sin(life / 40 + i) * 24 - cam.x * 0.2 + W) % W;
    const y = H - (life / 900) * H;
    const sz = 1.8 + pr(i + 3) * 2.2;
    ctx.fillStyle = "rgba(255," + (100 + ((i * 37) % 120)) + ",30," + (0.75 - life / 1200) + ")";
    ctx.fillRect(x, y, sz, sz);
  }

  // smoke plumes (darker / thicker)
  ctx.fillStyle = "rgba(28,14,12,.55)";
  for (let i = 0; i < 5; i++) {
    const x = ((i * 320 - cam.x * 0.1 + t * 0.08) % (W + 280));
    cloud(ctx, x, 55 + Math.sin(t / 28 + i) * 14, 58 + (i % 2) * 16);
  }
  ctx.fillStyle = "rgba(50,30,24,.35)";
  for (let i = 0; i < 4; i++) {
    const x = ((i * 360 - cam.x * 0.08 + t * 0.05) % (W + 300));
    cloud(ctx, x + 40, 90 + Math.sin(t / 35 + i) * 12, 70);
  }
}

/* ─────────────────────────  SPACE  ───────────────────────── */
function drawSpace(ctx, cam, t, W, H) {
  // nebula clouds (richer)
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  const neb = [
    ["rgba(120,80,255,.28)", 0.55, 0.32, 280],
    ["rgba(50,160,255,.20)", 0.22, 0.58, 240],
    ["rgba(255,80,180,.16)", 0.82, 0.62, 220],
    ["rgba(80,255,200,.10)", 0.4, 0.75, 180],
  ];
  for (const [c, fx, fy, r] of neb) {
    const nx = (W * fx - cam.x * 0.04 + Math.sin(t / 80) * 8 + W) % W;
    const ny = H * fy;
    const rg = ctx.createRadialGradient(nx, ny, 8, nx, ny, r);
    rg.addColorStop(0, c); rg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(nx, ny, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // parallax stars (three depths)
  for (let i = 0; i < 70; i++) {
    const depth = i % 3 === 0 ? 0.03 : i % 3 === 1 ? 0.07 : 0.12;
    const x = (i * 67 + cam.x * depth) % W;
    const y = (i * 49 + pr(i) * 40) % (H * 0.95);
    const tw = 0.35 + Math.abs(Math.sin(t / 10 + i)) * 0.65;
    ctx.fillStyle = "rgba(255,255,255," + tw + ")";
    const s = i % 7 === 0 ? 2.8 : i % 4 === 0 ? 2 : 1.3;
    ctx.fillRect((x + W) % W, y, s, s);
  }

  // distant galaxy smear
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = "rgba(160,140,255,.08)";
  ctx.beginPath();
  ctx.ellipse(W * 0.35, H * 0.28, 180, 28, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ringed planet (larger / more detail)
  const px = W * 0.82, py = 118;
  const pg = ctx.createRadialGradient(px - 18, py - 18, 4, px, py, 58);
  pg.addColorStop(0, "#c8b0ff"); pg.addColorStop(0.5, "#7a50e0"); pg.addColorStop(1, "#3a1a90");
  ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(px, py, 52, 0, Math.PI * 2); ctx.fill();
  // atmosphere rim
  ctx.strokeStyle = "rgba(180,200,255,.35)"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(px, py, 54, 0, Math.PI * 2); ctx.stroke();
  // rings
  ctx.strokeStyle = "rgba(210,190,255,.6)"; ctx.lineWidth = 7;
  ctx.save(); ctx.translate(px, py); ctx.rotate(-0.48); ctx.scale(1, 0.32);
  ctx.beginPath(); ctx.arc(0, 0, 82, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = "rgba(160,140,220,.35)"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, 94, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();

  // moon
  ctx.fillStyle = "#a8b0c8";
  ctx.beginPath(); ctx.arc(W * 0.18, 160, 14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(60,70,90,.4)";
  ctx.beginPath(); ctx.arc(W * 0.18 - 4, 158, 4, 0, Math.PI * 2); ctx.fill();

  // shooting star (periodic, brighter trail)
  const cyc = (t % 420) / 420;
  if (cyc < 0.16) {
    const sxp = W * (0.08 + cyc * 5.5), syp = 60 + cyc * 400;
    const trail = ctx.createLinearGradient(sxp, syp, sxp - 60, syp - 28);
    trail.addColorStop(0, "rgba(220,250,255,.95)");
    trail.addColorStop(1, "rgba(120,180,255,0)");
    ctx.strokeStyle = trail; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(sxp, syp); ctx.lineTo(sxp - 60, syp - 28); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.9)";
    ctx.beginPath(); ctx.arc(sxp, syp, 2.5, 0, Math.PI * 2); ctx.fill();
  }
}

/* ─────────────────────────  LAB  ───────────────────────── */
function drawLab(ctx, cam, t, W, H) {
  ctx.fillStyle = "#061018"; ctx.fillRect(0, 0, W, H);

  // perspective grid (stronger cyan)
  ctx.strokeStyle = "rgba(60,224,255,.16)"; ctx.lineWidth = 1;
  for (let x = -(cam.x * 0.2 % 64); x < W; x += 64) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 50; y < H; y += 52) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  // floor glow band
  const floorG = ctx.createLinearGradient(0, H * 0.65, 0, H);
  floorG.addColorStop(0, "rgba(40,200,255,0)");
  floorG.addColorStop(1, "rgba(40,200,255,.12)");
  ctx.fillStyle = floorG; ctx.fillRect(0, H * 0.65, W, H * 0.35);

  // glowing tubes / monitors (parallax)
  for (let i = 0; i < 5; i++) {
    const x = ((i * 310 - cam.x * 0.28) % (W + 280)) - 50;
    const pulse = 0.5 + Math.sin(t / 6 + i) * 0.3;
    // tube frame
    ctx.fillStyle = "rgba(20,40,55,.7)";
    ctx.fillRect(x - 4, 50, 98, 230);
    ctx.fillStyle = "rgba(80,220,255,.12)"; ctx.fillRect(x, 56, 90, 218);
    ctx.strokeStyle = "rgba(122,243,255," + (0.35 + pulse * 0.25) + ")";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, 56, 90, 218);
    // liquid
    const bub = ctx.createLinearGradient(0, 70, 0, 260);
    bub.addColorStop(0, "rgba(80,230,255," + (0.12 * pulse) + ")");
    bub.addColorStop(1, "rgba(40,180,220," + (0.45 * pulse) + ")");
    ctx.fillStyle = bub; ctx.fillRect(x + 8, 70, 74, 190);
    // specimen (alien blob)
    const sy = 160 + Math.sin(t / 11 + i) * 42;
    ctx.fillStyle = "rgba(180,255,220,.85)";
    ctx.beginPath(); ctx.ellipse(x + 45, sy, 12, 16, Math.sin(t / 20 + i) * 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,100,180,.7)";
    ctx.beginPath(); ctx.arc(x + 41, sy - 4, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 50, sy - 2, 2.5, 0, Math.PI * 2); ctx.fill();
    // tube bubbles
    for (let b = 0; b < 4; b++) {
      const by = 250 - ((t * 0.8 + b * 40 + i * 20) % 170);
      ctx.strokeStyle = "rgba(180,240,255,.4)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(x + 25 + b * 12, by, 2 + (b % 2), 0, Math.PI * 2); ctx.stroke();
    }
  }

  // hanging cables / pipes
  ctx.strokeStyle = "rgba(80,160,180,.35)";
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i++) {
    const x = ((i * 280 - cam.x * 0.15) % (W + 200));
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(x + 20, 40, x - 30, 80, x + 10, 120);
    ctx.stroke();
  }

  // data motes / hologram sparks
  ctx.fillStyle = "rgba(122,243,255,.55)";
  for (let i = 0; i < 24; i++) {
    const x = (pr(i) * W - cam.x * 0.25 + t * 0.45 + W) % W;
    const y = (pr(i + 4) * H + Math.sin(t / 15 + i) * 8) % H;
    ctx.globalAlpha = 0.2 + pr(i) * 0.55;
    ctx.fillRect(x, y, 2 + (i % 3 === 0 ? 2 : 0), 2);
  }
  ctx.globalAlpha = 1;

  // scanline flicker
  ctx.fillStyle = "rgba(80,220,255," + (0.03 + Math.sin(t / 4) * 0.015) + ")";
  for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
}

/* ─────────────────────────  AQUATIC · Abismo  ───────────────────────── */
export function drawAquatic(ctx, cam, t, W, H) {
  // FULL underwater — deep blue wall-to-wall (covers any sky feel)
  const deep = ctx.createLinearGradient(0, 0, 0, H);
  deep.addColorStop(0, "rgba(4,40,78,.55)");
  deep.addColorStop(0.35, "rgba(2,28,62,.72)");
  deep.addColorStop(0.7, "rgba(1,16,42,.85)");
  deep.addColorStop(1, "rgba(0,6,22,.92)");
  ctx.fillStyle = deep;
  ctx.fillRect(0, 0, W, H);

  // distant reef silhouettes (parallax back)
  for (let i = 0; i < 6; i++) {
    const x = ((i * 320 - cam.x * 0.08) % (W + 320)) - 80;
    const y = H * 0.55 + (i % 3) * 20;
    ctx.fillStyle = i % 2 ? "rgba(10,50,70,.4)" : "rgba(8,40,60,.5)";
    ctx.beginPath();
    ctx.moveTo(x, H);
    ctx.lineTo(x + 20, y);
    ctx.quadraticCurveTo(x + 60, y - 40, x + 100, y + 10);
    ctx.quadraticCurveTo(x + 140, y - 50, x + 180, y);
    ctx.lineTo(x + 220, H);
    ctx.closePath(); ctx.fill();
  }

  // mid coral / rock formations
  for (let i = 0; i < 8; i++) {
    const x = ((i * 220 - cam.x * 0.22) % (W + 240)) - 50;
    const h = 60 + (i % 4) * 28;
    const cols = ["#8a3a58", "#c45a40", "#3a8a6a", "#d47830", "#6a3a88"];
    ctx.fillStyle = cols[i % cols.length];
    ctx.globalAlpha = 0.55;
    // branching coral
    ctx.beginPath();
    ctx.moveTo(x, H);
    ctx.lineTo(x + 8, H - h);
    ctx.lineTo(x + 22, H - h * 0.7);
    ctx.lineTo(x + 18, H);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 10, H - h, 10 + (i % 3) * 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 28, H - h * 0.55, 8, 0, Math.PI * 2); ctx.fill();
    // brain coral blob
    if (i % 2 === 0) {
      ctx.fillStyle = cols[(i + 2) % cols.length];
      ctx.beginPath();
      ctx.ellipse(x + 50, H - 18, 28, 16, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  // god rays from surface (strong)
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 7; i++) {
    const x = ((i * 240 + 40 - cam.x * 0.04) % (W + 260));
    const sway = Math.sin(t / 35 + i * 0.9) * 22;
    const grd = ctx.createLinearGradient(x + sway, 0, x + sway - 80, H);
    grd.addColorStop(0, "rgba(140,230,255,.18)");
    grd.addColorStop(0.4, "rgba(80,190,255,.07)");
    grd.addColorStop(1, "rgba(30,100,180,0)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.moveTo(x + sway, 0);
    ctx.lineTo(x + sway + 70, 0);
    ctx.lineTo(x + sway - 40, H);
    ctx.lineTo(x + sway - 160, H);
    ctx.fill();
  }

  // caustic light ripples on mid/floor
  for (let i = 0; i < 12; i++) {
    const cx = ((i * 160 - cam.x * 0.15 + t * 0.4) % (W + 180)) - 40;
    const cy = H * 0.45 + (i % 4) * 55 + Math.sin(t / 12 + i) * 8;
    const ca = ctx.createRadialGradient(cx, cy, 2, cx, cy, 50);
    ca.addColorStop(0, "rgba(160,240,255,.14)");
    ca.addColorStop(0.5, "rgba(100,200,255,.05)");
    ca.addColorStop(1, "rgba(60,150,220,0)");
    ctx.fillStyle = ca;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 55 + Math.sin(t / 10 + i) * 10, 14, Math.sin(t / 18 + i) * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // distant fish schools (simple ellipses)
  for (let s = 0; s < 3; s++) {
    const bx = ((t * (0.35 + s * 0.1) + s * 400 - cam.x * 0.1) % (W + 300)) - 80;
    const by = H * (0.28 + s * 0.12);
    ctx.fillStyle = "rgba(100,180,220," + (0.2 + s * 0.08) + ")";
    for (let f = 0; f < 7; f++) {
      const fx = bx + f * 14 + Math.sin(t / 8 + f + s) * 6;
      const fy = by + Math.sin(f + t / 10) * 10 + (f % 3) * 5;
      ctx.beginPath();
      ctx.ellipse(fx, fy, 7, 3, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // dense rising bubbles
  for (let i = 0; i < 48; i++) {
    const life = (t * (0.45 + pr(i) * 0.7) + pr(i) * 800) % 800;
    const x = (pr(i) * W + Math.sin(life / 30 + i) * 20 - cam.x * 0.16 + W) % W;
    const y = H - (life / 800) * (H + 50);
    const r = 1.2 + pr(i + 2) * 4;
    const a = Math.max(0, 0.6 - life / 1300);
    ctx.strokeStyle = "rgba(180,230,255," + a + ")";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(200,240,255," + (a * 0.35) + ")";
    ctx.beginPath();
    ctx.arc(x - r * 0.28, y - r * 0.28, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  // swaying kelp / seaweed (dense, anchored bottom)
  for (let i = 0; i < 14; i++) {
    const x = ((i * 140 - cam.x * 0.38) % (W + 180)) - 30;
    const base = H - 4;
    const sway = Math.sin(t / 16 + i * 0.65) * 18;
    const tall = 130 + (i % 4) * 35;
    ctx.strokeStyle = i % 2 ? "#1a6a48" : "#0c4834";
    ctx.lineWidth = 5 + (i % 3);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, base);
    ctx.quadraticCurveTo(x + sway * 0.5, base - tall * 0.5, x + sway, base - tall);
    ctx.stroke();
    // secondary frond
    ctx.strokeStyle = "#2a9a62";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, base);
    ctx.quadraticCurveTo(x + sway * 0.3 - 8, base - tall * 0.45, x + sway * 0.7 - 12, base - tall * 0.85);
    ctx.stroke();
    // leaf tips
    for (let k = 0; k < 4; k++) {
      const ly = base - 30 - k * (tall / 5);
      const lx = x + sway * (0.25 + k * 0.2);
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.quadraticCurveTo(lx + 20 + Math.sin(t / 12 + k + i) * 5, ly - 10, lx + 32, ly + 2);
      ctx.stroke();
    }
  }
  ctx.lineCap = "butt";

  // plankton / particulate (dense)
  for (let i = 0; i < 36; i++) {
    const x = (pr(i) * W - cam.x * 0.2 + t * 0.1 + W) % W;
    const y = (pr(i + 7) * H + Math.sin(t / 20 + i) * 12) % H;
    ctx.fillStyle = "rgba(140,220,255," + (0.15 + pr(i + 3) * 0.4) + ")";
    ctx.fillRect(x, y, 1.5 + pr(i) * 1.5, 1.5 + pr(i) * 1.5);
  }

  // depth vignette — dark blue pressure at edges & top/bottom
  const vig = ctx.createRadialGradient(W / 2, H * 0.4, H * 0.15, W / 2, H * 0.45, H * 0.85);
  vig.addColorStop(0, "rgba(0,10,30,0)");
  vig.addColorStop(0.55, "rgba(0,15,40,.15)");
  vig.addColorStop(1, "rgba(0,5,20,.55)");
  ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);

  // top surface shimmer (looking up toward light)
  const surf = ctx.createLinearGradient(0, 0, 0, H * 0.22);
  surf.addColorStop(0, "rgba(60,160,220,.28)");
  surf.addColorStop(0.5, "rgba(40,120,180,.1)");
  surf.addColorStop(1, "rgba(20,60,100,0)");
  ctx.fillStyle = surf; ctx.fillRect(0, 0, W, H * 0.22);
}

// Ohana — world rendering · MAX visual pass (Fase 3)
// Richer, layered, parallax backgrounds per world. Same public API:
//   WORLDS[]  ·  renderWorld(ctx, world, cam, t, W, H)
// Each world adds `edge` (platform glow accent) used by the platform draw.

export const WORLDS = [
  { id: "beach",   name: "Isla Hoku", ground: "#d7a45a", groundTop: "#4fa35c", edge: "#8fe0a6", sky: ["#1b6fd6", "#57b8ef", "#ffe7bd"] },
  { id: "jungle",  name: "Jungla",    ground: "#245522", groundTop: "#63c85a", edge: "#a6f07a", sky: ["#07160a", "#123a18", "#2f6a2e"] },
  { id: "volcano", name: "Volcán",    ground: "#3a1610", groundTop: "#ff6a22", edge: "#ffb04a", sky: ["#120303", "#3a0c06", "#7a1c08"] },
  { id: "space",   name: "Espacio",   ground: "#161628", groundTop: "#7a5cff", edge: "#9a7cff", sky: ["#03030c", "#0b0a24", "#191542"] },
  { id: "lab",     name: "Alien Lab", ground: "#15202a", groundTop: "#3ee0ff", edge: "#7af3ff", sky: ["#050d13", "#0a1a24", "#123646"] }
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

  // subtle global top vignette to seat the HUD
  const tv = ctx.createLinearGradient(0, 0, 0, 160);
  tv.addColorStop(0, "rgba(0,0,0,.22)"); tv.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = tv; ctx.fillRect(0, 0, W, 160);
}

/* ─────────────────────────  BEACH · Isla Hoku  ───────────────────────── */
function drawBeach(ctx, cam, t, W, H) {
  // sun with layered glow
  const sx = W * 0.8, sy = 118;
  const sun = ctx.createRadialGradient(sx, sy, 10, sx, sy, 150);
  sun.addColorStop(0, "rgba(255,247,214,.95)");
  sun.addColorStop(0.35, "rgba(255,226,150,.5)");
  sun.addColorStop(1, "rgba(255,214,140,0)");
  ctx.fillStyle = sun; ctx.beginPath(); ctx.arc(sx, sy, 150, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,250,230,.95)"; ctx.beginPath(); ctx.arc(sx, sy, 40, 0, Math.PI * 2); ctx.fill();

  // distant island silhouettes (far parallax)
  ctx.fillStyle = "rgba(70,120,150,.35)";
  for (let i = 0; i < 4; i++) {
    const x = ((i * 520 - cam.x * 0.06) % (W + 520)) - 120;
    const y = H * 0.52;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 150, y - 90, x + 300, y); ctx.fill();
  }

  // soft clouds (parallax)
  for (let i = 0; i < 5; i++) {
    const x = ((i * 360 - cam.x * 0.12 + t * 0.22) % (W + 300)) - 120;
    const y = 60 + (i % 3) * 34;
    const a = 0.5 - (i % 3) * 0.12;
    ctx.fillStyle = "rgba(255,255,255," + a + ")";
    cloud(ctx, x, y, 60 + (i % 2) * 22);
  }

  // ocean
  const oceanY = H * 0.56;
  const og = ctx.createLinearGradient(0, oceanY, 0, H);
  og.addColorStop(0, "#4fb0e6"); og.addColorStop(1, "#1c6ba8");
  ctx.fillStyle = og; ctx.fillRect(0, oceanY, W, H);
  // sun reflection glimmer column
  ctx.fillStyle = "rgba(255,246,210,.28)";
  for (let i = 0; i < 7; i++) {
    const yy = oceanY + 10 + i * 18;
    const ww = 90 - i * 8 + Math.sin(t / 8 + i) * 8;
    ctx.fillRect(sx - ww / 2, yy, ww, 4);
  }
  // wave highlight bands
  for (let i = 0; i < 6; i++) {
    const x = ((i * 300 - cam.x * 0.22) % (W + 220)) - 60;
    ctx.fillStyle = "rgba(210,240,255,.30)";
    ctx.beginPath(); ctx.ellipse(x, oceanY + 24 + Math.sin(t / 15 + i) * 6, 100, 9, 0, 0, Math.PI * 2); ctx.fill();
  }

  // palms (near parallax)
  for (let i = 0; i < 4; i++) {
    const x = ((i * 380 - cam.x * 0.42) % (W + 260)) - 40;
    palm(ctx, x + 20, oceanY - 6, t + i);
  }
  // drifting light motes
  ctx.fillStyle = "rgba(255,250,220,.5)";
  for (let i = 0; i < 14; i++) {
    const x = (pr(i) * W + t * (0.2 + pr(i) * 0.3)) % W;
    const y = (pr(i + 9) * oceanY + Math.sin(t / 20 + i) * 8) % oceanY;
    ctx.globalAlpha = 0.25 + pr(i + 3) * 0.4; ctx.fillRect(x, y, 2, 2);
  }
  ctx.globalAlpha = 1;
}
function cloud(ctx, x, y, r) {
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.5, 0, 0, Math.PI * 2);
  ctx.ellipse(x + r * 0.7, y + 4, r * 0.66, r * 0.4, 0, 0, Math.PI * 2);
  ctx.ellipse(x - r * 0.7, y + 5, r * 0.6, r * 0.36, 0, 0, Math.PI * 2);
  ctx.fill();
}
function palm(ctx, x, baseY, t) {
  ctx.strokeStyle = "#6a3b22"; ctx.lineWidth = 10; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x, baseY); ctx.quadraticCurveTo(x + 8, baseY - 80, x + 2, baseY - 150); ctx.stroke();
  const tx = x + 2, ty = baseY - 150;
  ctx.strokeStyle = "#1f8a3e"; ctx.lineWidth = 8;
  for (let a = 0; a < 6; a++) {
    const ang = -Math.PI / 2 + (a - 2.5) * 0.5 + Math.sin(t / 20 + a) * 0.06;
    ctx.beginPath(); ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(tx + Math.cos(ang) * 40, ty + Math.sin(ang) * 40, tx + Math.cos(ang) * 78, ty + Math.sin(ang) * 78 + 14);
    ctx.stroke();
  }
  ctx.lineCap = "butt";
}

/* ─────────────────────────  JUNGLE  ───────────────────────── */
function drawJungle(ctx, cam, t, W, H) {
  // depth wash
  ctx.fillStyle = "rgba(6,26,10,.35)"; ctx.fillRect(0, 0, W, H);
  // three canopy layers, back → front
  const layers = [
    { p: 0.12, col: "#0c240f", r: 60, y: 0.16, step: 150 },
    { p: 0.26, col: "#123a17", r: 74, y: 0.12, step: 200 },
    { p: 0.46, col: "#1c5222", r: 92, y: 0.08, step: 260 },
  ];
  for (const L of layers) {
    ctx.fillStyle = L.col;
    for (let i = -1; i < W / L.step + 2; i++) {
      const x = ((i * L.step - cam.x * L.p) % (W + L.step * 2));
      ctx.fillRect(x + L.r * 0.4, H * L.y, 26, H);
      ctx.beginPath(); ctx.arc(x + L.r * 0.5, H * L.y, L.r, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x - L.r * 0.2, H * L.y + 20, L.r * 0.7, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + L.r * 1.1, H * L.y + 16, L.r * 0.66, 0, Math.PI * 2); ctx.fill();
    }
  }
  // god rays
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 4; i++) {
    const x = (i * 360 + 120 - cam.x * 0.05) % (W + 200);
    const grd = ctx.createLinearGradient(x, 0, x - 90, H);
    grd.addColorStop(0, "rgba(180,255,150,.10)"); grd.addColorStop(1, "rgba(180,255,150,0)");
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 70, 0); ctx.lineTo(x - 40, H); ctx.lineTo(x - 150, H); ctx.fill();
  }
  ctx.restore();
  // floating spores
  for (let i = 0; i < 18; i++) {
    const x = (pr(i) * W - cam.x * 0.3 + t * 0.15) % W;
    const y = (pr(i + 5) * H + Math.sin(t / 24 + i) * 14) % H;
    ctx.fillStyle = "rgba(180,240,150," + (0.2 + pr(i + 2) * 0.4) + ")";
    ctx.beginPath(); ctx.arc((x + W) % W, y, 1.6 + pr(i) * 1.4, 0, Math.PI * 2); ctx.fill();
  }
}

/* ─────────────────────────  VOLCANO  ───────────────────────── */
function drawVolcano(ctx, cam, t, W, H) {
  // distant volcano silhouettes with glowing craters
  for (let i = 0; i < 3; i++) {
    const x = ((i * 460 - cam.x * 0.14) % (W + 460)) - 130;
    const peak = H * 0.24, base = H * 0.72;
    ctx.fillStyle = "#1e0705";
    ctx.beginPath(); ctx.moveTo(x, base); ctx.lineTo(x + 130, peak); ctx.lineTo(x + 260, base); ctx.closePath(); ctx.fill();
    // lava crown
    const glow = 0.5 + Math.sin(t / 7 + i) * 0.2;
    ctx.fillStyle = "rgba(255,110,30," + glow + ")";
    ctx.beginPath(); ctx.moveTo(x + 108, peak + 6); ctx.lineTo(x + 130, peak - 8); ctx.lineTo(x + 152, peak + 6); ctx.fill();
  }
  // lava haze at bottom
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  const lg = ctx.createLinearGradient(0, H * 0.6, 0, H);
  lg.addColorStop(0, "rgba(255,74,16,0)");
  lg.addColorStop(1, "rgba(255,90,20," + (0.32 + Math.sin(t / 9) * 0.08) + ")");
  ctx.fillStyle = lg; ctx.fillRect(0, H * 0.6, W, H * 0.4);
  ctx.restore();
  // rising embers
  for (let i = 0; i < 22; i++) {
    const life = (t * (0.6 + pr(i) * 0.7) + pr(i) * 900) % 900;
    const x = (pr(i) * W + Math.sin(life / 40 + i) * 20 - cam.x * 0.2 + W) % W;
    const y = H - (life / 900) * H;
    ctx.fillStyle = "rgba(255," + (120 + ((i * 37) % 100)) + ",40," + (0.7 - life / 1300) + ")";
    ctx.fillRect(x, y, 2.4, 2.4);
  }
  // smoke plumes
  ctx.fillStyle = "rgba(30,16,14,.5)";
  for (let i = 0; i < 4; i++) {
    const x = ((i * 360 - cam.x * 0.1) % (W + 260));
    cloud(ctx, x, 70 + Math.sin(t / 30 + i) * 10, 54);
  }
}

/* ─────────────────────────  SPACE (space/ridge/reef world)  ───────────────────────── */
function drawSpace(ctx, cam, t, W, H) {
  // nebula clouds
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  const neb = [["rgba(120,80,255,.20)", 0.55, 0.34], ["rgba(60,180,255,.16)", 0.28, 0.6], ["rgba(255,90,190,.12)", 0.8, 0.68]];
  for (const [c, fx, fy] of neb) {
    const nx = (W * fx - cam.x * 0.05 + W) % W, ny = H * fy;
    const rg = ctx.createRadialGradient(nx, ny, 10, nx, ny, 260);
    rg.addColorStop(0, c); rg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(nx, ny, 260, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  // parallax stars (two depths, twinkle)
  for (let i = 0; i < 46; i++) {
    const depth = i % 2 ? 0.04 : 0.09;
    const x = (i * 71 + cam.x * depth) % W;
    const y = (i * 53) % (H * 0.9);
    const tw = 0.4 + Math.abs(Math.sin(t / 12 + i)) * 0.6;
    ctx.fillStyle = "rgba(255,255,255," + tw + ")";
    const s = i % 5 === 0 ? 2.4 : 1.4;
    ctx.fillRect((x + W) % W, y, s, s);
  }
  // ringed planet
  const px = W * 0.8, py = 132;
  const pg = ctx.createRadialGradient(px - 16, py - 16, 6, px, py, 52);
  pg.addColorStop(0, "#b79bff"); pg.addColorStop(1, "#5330c8");
  ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(px, py, 46, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(200,180,255,.55)"; ctx.lineWidth = 6;
  ctx.save(); ctx.translate(px, py); ctx.rotate(-0.5); ctx.scale(1, 0.34);
  ctx.beginPath(); ctx.arc(0, 0, 74, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  // shooting star (periodic)
  const cyc = (t % 480) / 480;
  if (cyc < 0.14) {
    const sxp = W * (0.1 + cyc * 5), syp = 80 + cyc * 380;
    ctx.strokeStyle = "rgba(180,240,255,.8)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(sxp, syp); ctx.lineTo(sxp - 46, syp - 22); ctx.stroke();
  }
}

/* ─────────────────────────  LAB  ───────────────────────── */
function drawLab(ctx, cam, t, W, H) {
  ctx.fillStyle = "#08141b"; ctx.fillRect(0, 0, W, H);
  // perspective grid floor glow
  ctx.strokeStyle = "rgba(60,224,255,.14)"; ctx.lineWidth = 1;
  for (let x = -(cam.x * 0.2 % 64); x < W; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 60; y < H; y += 56) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  // glowing tubes / monitors (parallax)
  for (let i = 0; i < 4; i++) {
    const x = ((i * 340 - cam.x * 0.3) % (W + 260)) - 60;
    const pulse = 0.5 + Math.sin(t / 6 + i) * 0.3;
    // tube
    ctx.fillStyle = "rgba(80,220,255,.10)"; ctx.fillRect(x, 60, 90, 210);
    ctx.strokeStyle = "rgba(122,243,255,.4)"; ctx.strokeRect(x, 60, 90, 210);
    const bub = ctx.createLinearGradient(0, 80, 0, 260);
    bub.addColorStop(0, "rgba(122,243,255," + (0.15 * pulse) + ")");
    bub.addColorStop(1, "rgba(122,243,255," + (0.4 * pulse) + ")");
    ctx.fillStyle = bub; ctx.fillRect(x + 8, 80, 74, 180);
    // floating specimen dot
    ctx.fillStyle = "rgba(190,250,255,.8)";
    ctx.beginPath(); ctx.arc(x + 45, 170 + Math.sin(t / 12 + i) * 40, 8, 0, Math.PI * 2); ctx.fill();
  }
  // data motes
  ctx.fillStyle = "rgba(122,243,255,.5)";
  for (let i = 0; i < 16; i++) {
    const x = (pr(i) * W - cam.x * 0.25 + t * 0.4 + W) % W;
    const y = (pr(i + 4) * H) % H;
    ctx.globalAlpha = 0.2 + pr(i) * 0.5; ctx.fillRect(x, y, 2, 2);
  }
  ctx.globalAlpha = 1;
}

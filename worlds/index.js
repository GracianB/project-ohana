// Ohana — world rendering · MAX visual pass (Fase 3)
// Richer, layered, parallax backgrounds per world. Same public API:
//   WORLDS[]  ·  renderWorld(ctx, world, cam, t, W, H)
// Each world adds `edge` (platform glow accent) used by the platform draw.

export const WORLDS = [
  { id: "beach",   name: "Isla Hoku", ground: "#c9964e", groundTop: "#6bb86a", edge: "#8fe0a6", sky: ["#1b6fd6", "#57b8ef", "#ffe7bd"] },
  { id: "jungle",  name: "Jungla",    ground: "#245522", groundTop: "#63c85a", edge: "#a6f07a", sky: ["#07160a", "#123a18", "#2f6a2e"] },
  { id: "volcano", name: "Volcán",    ground: "#3a1610", groundTop: "#ff6a22", edge: "#ffb04a", sky: ["#120303", "#3a0c06", "#7a1c08"] },
  { id: "space",   name: "Espacio",   ground: "#161628", groundTop: "#7a5cff", edge: "#9a7cff", sky: ["#03030c", "#0b0a24", "#191542"] },
  { id: "lab",     name: "Alien Lab", ground: "#15202a", groundTop: "#3ee0ff", edge: "#7af3ff", sky: ["#050d13", "#0a1a24", "#123646"] },
  { id: "aquatic", name: "Abismo",    ground: "#0a2a48", groundTop: "#2a8ab8", edge: "#5ad4ff", sky: ["#021428", "#0a3a68", "#1460a0"] }
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

  // subtle global top vignette to seat the HUD
  const tv = ctx.createLinearGradient(0, 0, 0, 160);
  tv.addColorStop(0, "rgba(0,0,0,.22)"); tv.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = tv; ctx.fillRect(0, 0, W, 160);
}

/* ─────────────────────────  BEACH · Isla Hoku  ───────────────────────── */
function drawBeach(ctx, cam, t, W, H) {
  // sun — layered glow + warm core
  const sx = W * 0.78, sy = 108;
  const outer = ctx.createRadialGradient(sx, sy, 8, sx, sy, 190);
  outer.addColorStop(0, "rgba(255,248,210,.98)");
  outer.addColorStop(0.22, "rgba(255,230,150,.55)");
  outer.addColorStop(0.55, "rgba(255,200,110,.18)");
  outer.addColorStop(1, "rgba(255,190,100,0)");
  ctx.fillStyle = outer; ctx.beginPath(); ctx.arc(sx, sy, 190, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,252,235,.98)"; ctx.beginPath(); ctx.arc(sx, sy, 36, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,236,160,.55)"; ctx.beginPath(); ctx.arc(sx, sy, 52, 0, Math.PI * 2); ctx.fill();

  // distant island silhouettes (far parallax)
  for (let i = 0; i < 5; i++) {
    const x = ((i * 480 - cam.x * 0.05) % (W + 480)) - 140;
    const y = H * 0.48;
    ctx.fillStyle = i % 2 ? "rgba(55,105,135,.32)" : "rgba(70,125,155,.38)";
    ctx.beginPath();
    ctx.moveTo(x, y + 40);
    ctx.quadraticCurveTo(x + 90, y - 70, x + 180, y - 10);
    ctx.quadraticCurveTo(x + 260, y - 55, x + 340, y + 40);
    ctx.closePath(); ctx.fill();
  }

  // soft clouds
  for (let i = 0; i < 6; i++) {
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
  for (let i = 0; i < 7; i++) {
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

  // shells & rocks on sand (land only, skip pit gap visually via world x)
  for (let i = 0; i < 12; i++) {
    const wx = pr(i + 40) * 1600;
    if (wx > 600 && wx < 900) continue; // never in pit gap
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

  // palms ONLY on land — anchored world spots at beach pit shores
  // left shore ~0–600, right ~880–1600; never in gap 620–860
  const palmSpots = [90, 260, 480, 980, 1180, 1420];
  for (let i = 0; i < palmSpots.length; i++) {
    const wx = palmSpots[i];
    const x = wx - cam.x * 0.55;
    palm(ctx, x, sandY + 4, t + i * 7, i);
  }

  // drifting light motes above sand / sky
  ctx.fillStyle = "rgba(255,250,220,.55)";
  for (let i = 0; i < 16; i++) {
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

  // soft shadow on sand
  ctx.fillStyle = "rgba(80,50,20,.22)";
  ctx.beginPath();
  ctx.ellipse(x + lean * 0.4, baseY + 4, 28, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // natural trunk (tapered segments + bark rings)
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
  // bark notches
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

  // fronds / leaves
  const nLeaves = 7;
  for (let a = 0; a < nLeaves; a++) {
    const ang = -Math.PI / 2 + (a - (nLeaves - 1) / 2) * 0.42 + Math.sin(t / 18 + a + s) * 0.07;
    const len = 72 + (a % 3) * 10;
    const midX = tipX + Math.cos(ang) * len * 0.45;
    const midY = tipY + Math.sin(ang) * len * 0.45;
    const endX = tipX + Math.cos(ang) * len;
    const endY = tipY + Math.sin(ang) * len + 16;
    // darker underside
    ctx.strokeStyle = "#146832";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.quadraticCurveTo(midX, midY, endX, endY);
    ctx.stroke();
    // bright top edge
    ctx.strokeStyle = "#2cb85a";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.quadraticCurveTo(midX - 2, midY - 2, endX - 2, endY - 3);
    ctx.stroke();
  }

  // optional coconuts
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

/* ─────────────────────────  AQUATIC · Abismo  ───────────────────────── */
export function drawAquatic(ctx, cam, t, W, H) {
  // deep underwater wash over the sky gradient
  const wash = ctx.createLinearGradient(0, 0, 0, H);
  wash.addColorStop(0, "rgba(8,40,80,.35)");
  wash.addColorStop(0.45, "rgba(4,30,70,.55)");
  wash.addColorStop(1, "rgba(2,12,40,.75)");
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, H);

  // god rays from above
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 5; i++) {
    const x = ((i * 280 + 80 - cam.x * 0.05) % (W + 240));
    const sway = Math.sin(t / 40 + i) * 18;
    const grd = ctx.createLinearGradient(x + sway, 0, x + sway - 70, H);
    grd.addColorStop(0, "rgba(120,220,255,.12)");
    grd.addColorStop(0.55, "rgba(80,180,255,.04)");
    grd.addColorStop(1, "rgba(40,120,200,0)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.moveTo(x + sway, 0);
    ctx.lineTo(x + sway + 56, 0);
    ctx.lineTo(x + sway - 50, H);
    ctx.lineTo(x + sway - 140, H);
    ctx.fill();
  }
  ctx.restore();

  // rising bubbles (parallax)
  for (let i = 0; i < 28; i++) {
    const life = (t * (0.4 + pr(i) * 0.6) + pr(i) * 700) % 700;
    const x = (pr(i) * W + Math.sin(life / 35 + i) * 16 - cam.x * 0.18 + W) % W;
    const y = H - (life / 700) * (H + 40);
    const r = 1.4 + pr(i + 2) * 3.2;
    ctx.strokeStyle = "rgba(180,230,255," + (0.55 - life / 1400) + ")";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(200,240,255," + (0.18 - life / 4000) + ")";
    ctx.beginPath();
    ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  // swaying kelp / seaweed on the seabed
  for (let i = 0; i < 9; i++) {
    const x = ((i * 190 - cam.x * 0.35) % (W + 200)) - 40;
    const base = H - 8;
    const sway = Math.sin(t / 18 + i * 0.7) * 14;
    ctx.strokeStyle = i % 2 ? "#1a6a48" : "#0e4a38";
    ctx.lineWidth = 5 + (i % 3);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, base);
    ctx.quadraticCurveTo(x + sway * 0.6, base - 70, x + sway, base - 140 - (i % 3) * 20);
    ctx.stroke();
    // leaf tips
    ctx.strokeStyle = "#2a9a62";
    ctx.lineWidth = 3;
    for (let k = 0; k < 3; k++) {
      const ly = base - 40 - k * 36;
      const lx = x + sway * (0.3 + k * 0.25);
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.quadraticCurveTo(lx + 18 + Math.sin(t / 14 + k) * 4, ly - 8, lx + 28, ly + 4);
      ctx.stroke();
    }
  }
  ctx.lineCap = "butt";

  // drifting plankton motes
  ctx.fillStyle = "rgba(140,220,255,.45)";
  for (let i = 0; i < 16; i++) {
    const x = (pr(i) * W - cam.x * 0.22 + t * 0.12 + W) % W;
    const y = (pr(i + 7) * H + Math.sin(t / 22 + i) * 10) % H;
    ctx.globalAlpha = 0.2 + pr(i + 3) * 0.45;
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.globalAlpha = 1;
}

// BAHÍA DE LOS HIBISCOS (KILO BAY) — Procedural vector backdrop for Kilo's personal world.
// 100% vector Canvas drawing inspired by the Yomi Observatory visual standard:
// 8 parallax layers — deep oceanic twilight sky, the Great Solar Moon with pulsating halo,
// CONSTELACIÓN OHANA (celestial cosmic ukulele and star lines), distant volcanic ridges
// with bioluminescent cyan waterfalls, sacred Tiki shrines with neon hibiscus lanterns,
// floating solar ancestral orbs, tropical banyans & palms, and animated solar notes/petals.
// Zero external bitmaps.

function _tikiShrine(ctx, x, y, w, h, t, reduceMotion) {
  const roofH = h * 0.42;
  const pillarW = Math.max(4, w * 0.08);

  // Sacred Polynesian thatched roof (triangular pitch)
  ctx.fillStyle = '#11222c';
  ctx.beginPath();
  ctx.moveTo(x - w * 0.6, y);
  ctx.lineTo(x, y - roofH);
  ctx.lineTo(x + w * 0.6, y);
  ctx.closePath();
  ctx.fill();

  // Roof crest ridge beam
  ctx.fillStyle = '#1c3644';
  ctx.fillRect(x - w * 0.65, y - 4, w * 1.3, 5);

  // Tiki Totem Pillars
  ctx.fillStyle = '#142834';
  ctx.fillRect(x - w * 0.35, y, pillarW, h - roofH);
  ctx.fillRect(x + w * 0.35 - pillarW, y, pillarW, h - roofH);

  // Platform deck
  ctx.fillStyle = '#1c3644';
  ctx.fillRect(x - w * 0.45, y + h - roofH - 4, w * 0.9, 6);

  // Central Tiki guardian silhouette
  const tikX = x, tikY = y + (h - roofH) * 0.35;
  ctx.fillStyle = '#0d1a22';
  ctx.fillRect(tikX - 7, tikY - 14, 14, 28);
  // Tiki carved eye slits (glowing amber)
  const eyeGlow = reduceMotion ? 0.7 : 0.6 + Math.sin(t * 0.08 + x * 0.01) * 0.3;
  ctx.fillStyle = `rgba(255, 196, 64, ${eyeGlow})`;
  ctx.fillRect(tikX - 5, tikY - 8, 3, 2);
  ctx.fillRect(tikX + 2, tikY - 8, 3, 2);
  // Tiki mouth
  ctx.fillRect(tikX - 4, tikY + 2, 8, 2);

  // Hanging Neon Hibiscus Lantern
  const lantX = x + w * 0.45;
  const lantY = y + 16;
  const swing = reduceMotion ? 0 : Math.sin(t * 0.06 + x * 0.02) * 3;

  // Cord
  ctx.strokeStyle = '#3a4c58';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(lantX - swing * 0.5, y);
  ctx.lineTo(lantX + swing, lantY);
  ctx.stroke();

  // Outer radial light bloom
  const bloomR = 24;
  const bloom = ctx.createRadialGradient(lantX + swing, lantY, 2, lantX + swing, lantY, bloomR);
  bloom.addColorStop(0, 'rgba(255, 100, 150, 0.45)');
  bloom.addColorStop(0.5, 'rgba(255, 180, 70, 0.20)');
  bloom.addColorStop(1, 'rgba(255, 120, 100, 0)');
  ctx.fillStyle = bloom;
  ctx.beginPath();
  ctx.arc(lantX + swing, lantY, bloomR, 0, Math.PI * 2);
  ctx.fill();

  // Neon core
  ctx.fillStyle = '#ff5588';
  ctx.fillRect(lantX + swing - 4, lantY - 5, 8, 10);
  ctx.fillStyle = '#fff4a0';
  ctx.fillRect(lantX + swing - 2, lantY - 3, 4, 6);
}

function _solarOrb(ctx, x, y, r, alpha, t) {
  const grad = ctx.createRadialGradient(x, y, r * 0.15, x, y, r);
  grad.addColorStop(0, `rgba(255, 250, 220, ${alpha})`);
  grad.addColorStop(0.4, `rgba(255, 175, 60, ${alpha * 0.75})`);
  grad.addColorStop(0.8, `rgba(240, 98, 146, ${alpha * 0.35})`);
  grad.addColorStop(1, 'rgba(240, 98, 146, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // Diamond spark in center
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
  ctx.fillRect(x - 1.5, y - 4, 3, 8);
  ctx.fillRect(x - 4, y - 1.5, 8, 3);
}

function _banyanTree(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#0f2029';

  // Broad ancient trunk
  ctx.beginPath();
  ctx.moveTo(-18, 0);
  ctx.bezierCurveTo(-14, -40, -32, -90, -10, -140);
  ctx.bezierCurveTo(0, -90, 24, -40, 22, 0);
  ctx.closePath();
  ctx.fill();

  // Sprawling canopy lobes
  const lobes = [
    [-60, -150, 48, 32],
    [-20, -175, 54, 36],
    [30, -165, 50, 34],
    [70, -145, 42, 28],
    [5, -195, 46, 30]
  ];
  for (const [lx, ly, rx, ry] of lobes) {
    ctx.beginPath();
    ctx.ellipse(lx, ly, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Hanging aerial roots
  ctx.strokeStyle = '#162e3b';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    const rx = -40 + i * 20;
    ctx.beginPath();
    ctx.moveTo(rx, -135);
    ctx.quadraticCurveTo(rx + (i % 2 ? 4 : -4), -65, rx + (i % 2 ? -2 : 2), 0);
    ctx.stroke();
  }

  ctx.restore();
}

function _bioluminescentWaterfall(ctx, x, topY, height, width, t, reduceMotion) {
  // Cascading cyan bioluminescent stream
  const flow = reduceMotion ? 0 : (t * 0.08) % 12;

  // Outer glow
  ctx.fillStyle = 'rgba(64, 240, 220, 0.16)';
  ctx.fillRect(x - width * 0.8, topY, width * 1.6, height);

  // Stream core
  ctx.fillStyle = 'rgba(100, 255, 235, 0.65)';
  ctx.fillRect(x - width * 0.5, topY, width, height);

  // Shimmering flow streaks
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  for (let y = topY + flow; y < topY + height; y += 16) {
    ctx.fillRect(x - width * 0.25, y, width * 0.5, 6);
  }

  // Splash mist pool at bottom
  const mistGrad = ctx.createRadialGradient(x, topY + height, 4, x, topY + height, width * 3);
  mistGrad.addColorStop(0, 'rgba(80, 250, 230, 0.5)');
  mistGrad.addColorStop(0.6, 'rgba(64, 200, 210, 0.2)');
  mistGrad.addColorStop(1, 'rgba(64, 200, 210, 0)');
  ctx.fillStyle = mistGrad;
  ctx.beginPath();
  ctx.ellipse(x, topY + height, width * 3, width * 1.2, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function drawKiloBayBackdrop(ctx, cam, t, viewportW, viewportH, reduceMotion = false) {
  const w = viewportW || 1100;
  const h = viewportH || 700;
  const cam0 = cam?.x || 0;

  ctx.save();

  // ── Layer 0: Deep Celestial Oceanic Dusk/Dawn Sky ──────────────────────────
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, '#091122');     // Cosmic midnight indigo
  skyGrad.addColorStop(0.28, '#112c48');  // Royal oceanic twilight
  skyGrad.addColorStop(0.55, '#1e5466');  // Tropical cyan teal dusk
  skyGrad.addColorStop(0.76, '#b84464');  // Radiant hibiscus coral
  skyGrad.addColorStop(0.88, '#e88238');  // Amber sunset glow
  skyGrad.addColorStop(1, '#fac040');     // Golden dawn horizon
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // ── Layer 1: The Great Celestial Solar Moon ("El Sol Eterno de Ohana") ────
  const sunX = ((w * 0.76 - cam0 * 0.015) % (w * 2) + w * 2) % (w * 2) - w * 0.5;
  const sunY = h * 0.22;
  const haloPulse = reduceMotion ? 0 : Math.sin(t * 0.08) * 8;

  // Outer radiant aura
  ctx.fillStyle = 'rgba(255, 140, 50, 0.12)';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 105 + haloPulse, 0, Math.PI * 2);
  ctx.fill();

  // Mid golden corona
  ctx.fillStyle = 'rgba(255, 200, 70, 0.20)';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 82 + haloPulse * 0.5, 0, Math.PI * 2);
  ctx.fill();

  // 12 Gentle solar flare rays rotating
  ctx.save();
  ctx.translate(sunX, sunY);
  const flareRot = reduceMotion ? 0 : t * 0.006;
  ctx.rotate(flareRot);
  ctx.fillStyle = 'rgba(255, 235, 140, 0.10)';
  for (let i = 0; i < 12; i++) {
    ctx.rotate(Math.PI / 6);
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(0, -96);
    ctx.lineTo(10, 0);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Solar Core (Multi-stop radial gradient)
  const sunGrad = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, 62);
  sunGrad.addColorStop(0, '#ffffff');
  sunGrad.addColorStop(0.35, '#fff6a8');
  sunGrad.addColorStop(0.70, '#ffb300');
  sunGrad.addColorStop(0.92, '#ff6d00');
  sunGrad.addColorStop(1, 'rgba(255, 109, 0, 0)');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 62, 0, Math.PI * 2);
  ctx.fill();

  // ── Layer 2: CONSTELACIÓN OHANA (Celestial Cosmic Ukulele & Hibiscus) ─────
  // 10 starlight nodes tracing the celestial Ukulele of Ohana
  const kiloStars = [
    { x: 0.15, y: 0.26 }, // 0: Lower bout left
    { x: 0.21, y: 0.30 }, // 1: Lower bout bottom
    { x: 0.27, y: 0.26 }, // 2: Lower bout right
    { x: 0.25, y: 0.20 }, // 3: Waist right
    { x: 0.17, y: 0.20 }, // 4: Waist left
    { x: 0.21, y: 0.24 }, // 5: Soundhole / Bridge
    { x: 0.21, y: 0.14 }, // 6: Neck lower
    { x: 0.21, y: 0.08 }, // 7: Neck upper / Nut
    { x: 0.18, y: 0.04 }, // 8: Headstock peg left
    { x: 0.24, y: 0.04 }  // 9: Headstock peg right
  ];

  ctx.save();
  // Constellation glowing lines
  ctx.strokeStyle = 'rgba(120, 240, 255, 0.55)';
  ctx.lineWidth = 1.2;

  // Ukulele body loop (0 -> 1 -> 2 -> 3 -> 4 -> 0)
  ctx.beginPath();
  ctx.moveTo(kiloStars[0].x * w, kiloStars[0].y * h);
  for (let i = 1; i <= 4; i++) {
    ctx.lineTo(kiloStars[i].x * w, kiloStars[i].y * h);
  }
  ctx.closePath();
  ctx.stroke();

  // Spokes to central soundhole star (5)
  ctx.strokeStyle = 'rgba(255, 215, 100, 0.40)';
  const cxU = kiloStars[5].x * w, cyU = kiloStars[5].y * h;
  for (let i = 0; i <= 4; i++) {
    ctx.beginPath();
    ctx.moveTo(kiloStars[i].x * w, kiloStars[i].y * h);
    ctx.lineTo(cxU, cyU);
    ctx.stroke();
  }

  // Ukulele neck & headstock (waist -> neck -> pegs)
  ctx.strokeStyle = 'rgba(120, 240, 255, 0.65)';
  ctx.beginPath();
  ctx.moveTo(cxU, cyU);
  ctx.lineTo(kiloStars[6].x * w, kiloStars[6].y * h);
  ctx.lineTo(kiloStars[7].x * w, kiloStars[7].y * h);
  ctx.lineTo(kiloStars[8].x * w, kiloStars[8].y * h);
  ctx.moveTo(kiloStars[7].x * w, kiloStars[7].y * h);
  ctx.lineTo(kiloStars[9].x * w, kiloStars[9].y * h);
  ctx.stroke();

  // Draw bright starlight nodes
  for (const s of kiloStars) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.arc(s.x * w, s.y * h, 2.4, 0, Math.PI * 2);
    ctx.fill();
    // Soft starlight cyan glow
    ctx.fillStyle = 'rgba(120, 240, 255, 0.45)';
    ctx.beginPath();
    ctx.arc(s.x * w, s.y * h, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Glowing Constellation Label
  ctx.fillStyle = 'rgba(180, 240, 255, 0.60)';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('CONSTELACIÓN OHANA · EL UKELELE CÓSMICO', kiloStars[0].x * w - 10, kiloStars[1].y * h + 18);
  ctx.restore();

  // ── Layer 3: Far Parallax Volcanic Ridges & Bioluminescent Waterfalls ─────
  const farOff = ((cam0 * 0.06) % (w * 1.8) + w * 1.8) % (w * 1.8);
  ctx.fillStyle = '#0f202c';

  // Jagged Ko'olau-style volcanic peaks
  const peaks = [
    [0.05, 0.50, 260, 200],
    [0.26, 0.44, 320, 240],
    [0.48, 0.48, 280, 220],
    [0.68, 0.42, 340, 250],
    [0.88, 0.47, 300, 230],
    [1.08, 0.45, 310, 240],
    [1.28, 0.49, 290, 220],
    [1.48, 0.43, 330, 250]
  ];

  for (const [rx, ry, pw, ph] of peaks) {
    const px = rx * w * 1.8 - farOff;
    const base = h * 0.85;
    ctx.beginPath();
    ctx.moveTo(px - pw * 0.5, base);
    ctx.lineTo(px, ry * h);
    ctx.lineTo(px + pw * 0.5, base);
    ctx.closePath();
    ctx.fill();
  }

  // Cascading Bioluminescent Waterfalls from mountain cliffs
  const falls = [
    [0.26, 0.48, 140, 6],
    [0.68, 0.46, 160, 7],
    [1.08, 0.49, 130, 6]
  ];
  for (const [fx, fy, fh, fw] of falls) {
    const x = fx * w * 1.8 - farOff;
    _bioluminescentWaterfall(ctx, x, fy * h, fh, fw, t, reduceMotion);
  }

  // ── Layer 4: Floating Solar Ancestral Orbs (Mid Parallax) ────────────────
  const orbOff = ((cam0 * 0.16) % (w * 1.6) + w * 1.6) % (w * 1.6);
  const orbData = [
    [0.08, 0.36, 26, 0.55],
    [0.25, 0.42, 22, 0.45],
    [0.42, 0.34, 30, 0.60],
    [0.58, 0.45, 20, 0.40],
    [0.75, 0.38, 28, 0.52],
    [0.92, 0.41, 24, 0.48]
  ];
  for (const [rx, ry, r, alpha] of orbData) {
    const ox = rx * w * 1.6 - orbOff;
    const bob = reduceMotion ? 0 : Math.sin(t * 0.09 + rx * 8) * 10;
    _solarOrb(ctx, ox, ry * h + bob, r, alpha, t);
  }

  // ── Layer 5: Sacred Tiki Shrines & Neon Hibiscus Lanterns (Near-Mid) ─────
  const shrineOff = ((cam0 * 0.28) % (w * 1.5) + w * 1.5) % (w * 1.5);
  const shrineData = [
    [0.10, 0.68, 85, 120],
    [0.38, 0.65, 95, 130],
    [0.64, 0.70, 80, 115],
    [0.92, 0.66, 90, 125]
  ];
  for (const [rx, ry, sw, sh] of shrineData) {
    const sx = rx * w * 1.5 - shrineOff;
    _tikiShrine(ctx, sx, ry * h, sw, sh, t, reduceMotion);
  }

  // ── Layer 6: Ancient Royal Banyans & Coconut Palms (Near Parallax) ───────
  const banyanOff = ((cam0 * 0.40) % (w * 1.4) + w * 1.4) % (w * 1.4);
  const banyanData = [
    [0.04, 0.82, 0.85],
    [0.32, 0.84, 0.95],
    [0.55, 0.80, 0.80],
    [0.82, 0.85, 1.05]
  ];
  for (const [rx, ry, scale] of banyanData) {
    const bx = rx * w * 1.4 - banyanOff;
    _banyanTree(ctx, bx, ry * h, scale);
  }

  // ── Layer 7: Animated Solar Notes & Hibiscus Stardust Particles ──────────
  if (!reduceMotion) {
    for (let i = 0; i < 22; i++) {
      const px = (((i * 149 + cam0 * 0.55 + t * 0.65) % (w * 1.1)) + w * 1.1) % (w * 1.1);
      const py = h * 0.22 + (((i * 83 + t * (0.35 + (i % 4) * 0.08)) % (h * 0.62)) + h * 0.04);
      const noteAlpha = 0.45 + Math.sin(t * 0.12 + i) * 0.35;

      if (i % 3 === 0) {
        // Floating celestial music note (♪ or ♫)
        ctx.fillStyle = `rgba(255, 230, 140, ${noteAlpha})`;
        ctx.font = '12px sans-serif';
        ctx.fillText(i % 2 ? '♪' : '♫', px, py);
      } else {
        // Glowing solar spark wisp
        const sparkR = 1.4 + (i % 3) * 0.6;
        ctx.fillStyle = `rgba(255, 190, 80, ${noteAlpha})`;
        ctx.beginPath();
        ctx.arc(px, py, sparkR, 0, Math.PI * 2);
        ctx.fill();
        // Soft trailing glow
        ctx.fillStyle = `rgba(255, 100, 150, ${noteAlpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(px - 3, py + 2, sparkR * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}

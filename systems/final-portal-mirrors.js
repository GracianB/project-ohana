// systems/final-portal-mirrors.js
// V618 — Portales/Espejos de la Sala Final EXTREMO
// Los miembros de la familia aparecen dentro de los óvalos haciendo muecas,
// como atrapados. Vector puro, determinista, sin Math.random en arte.
// Posiciones alineadas con las estatuas de world1-rooms.js (900 + i*560).

const TAU = Math.PI * 2;

const FAMILY = Object.freeze({
  michi:    { name: 'Michicornio', base: '#c9a8ff', eye: '#5a3d7a', accent: '#f2c1ff', ears: true },
  cuerno:   { name: 'Cuerno',      base: '#4ff0c8', eye: '#0d4a3a', accent: '#e0f7fa', horns: true },
  kilo:     { name: 'Kilo',        base: '#ffe14a', eye: '#8a5a1a', accent: '#fff6c8', crown: true },
  stitcho:  { name: 'Stitcho',     base: '#5ad1ff', eye: '#1a4a7a', accent: '#b3e5fc', antenna: true },
  chispin:  { name: 'Chispín',     base: '#ffe14a', eye: '#7a5a00', accent: '#fff9c4', spark: true },
  cat:      { name: 'Michi',       base: '#ffb6e4', eye: '#7a3d6a', accent: '#f8bbd0', ears: true },
  dragon:   { name: 'Dragón',      base: '#ff8a3a', eye: '#5a2a00', accent: '#ffe0b2', horns: true },
  dino:     { name: 'Dino',        base: '#c8f04a', eye: '#3a5a1a', accent: '#e6ee9c', snout: true },
  frita:    { name: 'Frita',       base: '#ffd36a', eye: '#7a4a1a', accent: '#fff3e0', hat: true },
  pizza:    { name: 'Pizza',       base: '#ff8a2a', eye: '#7a2a1a', accent: '#ffccbc', hat: true },
  yomi:     { name: 'Yomi',        base: '#ce93d8', eye: '#4a148c', accent: '#e1bee7', void: true }
});

function hn(i) {
  const x = Math.sin(i * 127.1 + 11.7) * 43758.5453;
  return x - Math.floor(x);
}

function drawFace(ctx, fam, t, intensity, looking) {
  const phase = Math.sin(t * 0.11 + intensity);
  const blink = Math.abs(Math.sin(t * 0.18 + intensity * 2)) > 0.92;
  const open = Math.sin(t * 0.15 + intensity) > 0.35;

  ctx.fillStyle = fam.base;
  ctx.beginPath();
  ctx.ellipse(0, -8, 30, 36, 0, 0, TAU);
  ctx.fill();

  if (fam.ears) {
    ctx.fillStyle = fam.accent;
    ctx.beginPath(); ctx.moveTo(-28, -28); ctx.lineTo(-18, -48); ctx.lineTo(-8, -26); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(28, -28); ctx.lineTo(18, -48); ctx.lineTo(8, -26); ctx.closePath(); ctx.fill();
  }
  if (fam.horns) {
    ctx.strokeStyle = fam.accent; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-14, -38); ctx.quadraticCurveTo(-22, -58, -10, -62); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(14, -38); ctx.quadraticCurveTo(22, -58, 10, -62); ctx.stroke();
  }
  if (fam.crown) {
    ctx.fillStyle = fam.accent;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 12 - 6, -40);
      ctx.lineTo(i * 12, -52);
      ctx.lineTo(i * 12 + 6, -40);
      ctx.closePath(); ctx.fill();
    }
  }

  if (!blink) {
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(-11, -16, 8, 9, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(11, -16, 8, 9, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = fam.eye;
    const lookX = looking * 3;
    ctx.beginPath(); ctx.arc(-11 + lookX, -16, 4, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(11 + lookX, -16, 4, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-13 + lookX, -18, 1.6, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(9 + lookX, -18, 1.6, 0, TAU); ctx.fill();
  } else {
    ctx.strokeStyle = fam.eye; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(-16, -16); ctx.lineTo(-6, -16); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, -16); ctx.lineTo(16, -16); ctx.stroke();
  }

  ctx.strokeStyle = fam.eye; ctx.lineWidth = 2.6;
  ctx.beginPath();
  if (open && intensity > 0.4) {
    ctx.moveTo(-10, 8);
    ctx.quadraticCurveTo(0, 22 + phase * 4, 10, 8);
  } else if (phase > 0.3) {
    ctx.moveTo(-9, 6);
    ctx.quadraticCurveTo(0, 14, 9, 6);
  } else {
    ctx.moveTo(-8, 10);
    ctx.quadraticCurveTo(0, 6, 8, 10);
  }
  ctx.stroke();
}

export function drawPortalMirrors(ctx, portals, cam, t, player, reduced = false) {
  if (!portals?.length) return;

  for (const p of portals) {
    const x = p.x - cam.x;
    const y = p.y - cam.y;
    const fam = FAMILY[p.hero] || FAMILY.kilo;
    const intensity = hn(p.x * 0.013 + t * 0.02);
    const near = player ? Math.hypot(player.x + player.w / 2 - p.x, player.y + player.h / 2 - p.y) < 220 : false;
    const looking = near ? Math.sign(player.x + player.w / 2 - p.x) : Math.sin(t * 0.08 + p.x) * 0.6;

    ctx.save();
    ctx.translate(x, y);

    const g = ctx.createLinearGradient(-p.rx, -p.ry, p.rx, p.ry);
    g.addColorStop(0, 'rgba(180,210,255,0.12)');
    g.addColorStop(0.5, 'rgba(220,240,255,0.22)');
    g.addColorStop(1, 'rgba(140,180,220,0.10)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.rx || 72, p.ry || 112, 0, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = near ? '#fff6c8' : 'rgba(255,255,255,0.45)';
    ctx.lineWidth = near ? 4 : 2.5;
    ctx.stroke();

    if (!reduced) {
      ctx.globalAlpha = 0.18;
      ctx.strokeStyle = '#80deea';
      ctx.lineWidth = 1;
      for (let i = -4; i <= 4; i++) {
        const yy = i * 18 + Math.sin(t * 0.12 + i) * 2;
        ctx.beginPath();
        ctx.moveTo(-p.rx * 0.7, yy);
        ctx.lineTo(p.rx * 0.7, yy);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    const scale = near ? 1.08 : 1;
    ctx.save();
    ctx.scale(scale, scale);
    drawFace(ctx, fam, t, intensity + (near ? 0.4 : 0), looking);
    ctx.restore();

    if (near && !reduced) {
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = fam.base;
      ctx.beginPath();
      ctx.ellipse(-28, 18, 10, 7, -0.4, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(28, 18, 10, 7, 0.4, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }
}

// Posiciones alineadas con las estatuas de la procesión (world1-rooms.js)
// x = 900 + i * 560, y centrado sobre el suelo (WORLD1_FLOOR = 1134)
export const FINAL_PORTALS = Object.freeze([
  { hero: 'kilo',     x: 900,  y: 990, rx: 70, ry: 110 },
  { hero: 'stitcho',  x: 1460, y: 990, rx: 72, ry: 112 },
  { hero: 'chispin',  x: 2020, y: 990, rx: 68, ry: 108 },
  { hero: 'cat',      x: 2580, y: 990, rx: 70, ry: 110 },
  { hero: 'cuerno',   x: 3140, y: 990, rx: 72, ry: 112 },
  { hero: 'dragon',   x: 3700, y: 990, rx: 74, ry: 114 },
  { hero: 'dino',     x: 4260, y: 990, rx: 70, ry: 110 },
  { hero: 'frita',    x: 4820, y: 990, rx: 68, ry: 108 },
  { hero: 'pizza',    x: 5380, y: 990, rx: 70, ry: 110 },
  { hero: 'yomi',     x: 5940, y: 990, rx: 72, ry: 112 }
]);

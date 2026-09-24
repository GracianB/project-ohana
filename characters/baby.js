function blush(ctx, x, y, s) {
  const k = s || 1;
  ctx.fillStyle = "rgba(255,120,150,.6)";
  ctx.beginPath();
  ctx.ellipse(x - 6 * k, y, 3.2 * k, 2.1 * k, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 6 * k, y, 3.2 * k, 2.1 * k, 0, 0, Math.PI * 2);
  ctx.fill();
}

function wobble(t) {
  return Math.sin(t / 9) * 0.08;
}

export function drawBaby(ctx, p, t) {
  const run = Math.abs(p.vx || 0) > 0.5;
  ctx.rotate(wobble(t) + (run ? Math.sin(t * 0.45) * 0.12 : 0));
  ctx.scale(0.82, 0.82);
  const id = p.id;
  if (id === "stitch") babyTiko(ctx, t);
  else if (id === "cat") babyMichi(ctx, t);
  else if (id === "dragon") babyKoa(ctx, t);
  else if (id === "frita") babyFrita(ctx, t);
  else if (id === "pikachu") babyChispin(ctx, t);
  else babyLani(ctx, t);
}

function babyChispin(ctx, t) {
  // Chispín Bebé — chibi redondo, orejas redondas con tip, mejillas spark
  const bob = Math.sin(t / 9) * 1.1;
  ctx.translate(0, 3 + bob);
  const body = "#ffe44a";
  const accent = "#2ec9c0";
  const ink = "#3a2208";
  // cola espiral + punta estrella
  ctx.strokeStyle = body;
  ctx.lineWidth = 3.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(5, 6);
  ctx.quadraticCurveTo(12, 2, 10, -4);
  ctx.stroke();
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(10, -6);
  ctx.lineTo(14, -10);
  ctx.lineTo(11, -4);
  ctx.lineTo(15, -3);
  ctx.closePath();
  ctx.fill();
  // blob cuerpo
  ctx.fillStyle = body;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(0, 5, 9, 8.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // orejas hoja redondeadas
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(-4, -4);
  ctx.quadraticCurveTo(-10, -16, -3, -18);
  ctx.quadraticCurveTo(0, -10, -1, -4);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(4, -4);
  ctx.quadraticCurveTo(10, -16, 3, -18);
  ctx.quadraticCurveTo(0, -10, 1, -4);
  ctx.fill();
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.ellipse(-4, -15, 2.2, 3, -0.3, 0, Math.PI * 2);
  ctx.ellipse(4, -15, 2.2, 3, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // ojos
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-2.8, 2, 2.4, 0, Math.PI * 2);
  ctx.arc(2.8, 2, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.arc(-2.4, 2.3, 1.15, 0, Math.PI * 2);
  ctx.arc(3.1, 2.3, 1.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-3, 1.5, 0.55, 0, Math.PI * 2);
  ctx.arc(2.5, 1.5, 0.55, 0, Math.PI * 2);
  ctx.fill();
  // mejillas Ohana cyan (hoja/corazón)
  ctx.fillStyle = accent;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(s * 6.5, 7);
    ctx.quadraticCurveTo(s * 4, 4.5, s * 6.5, 3.5);
    ctx.quadraticCurveTo(s * 9, 4.5, s * 6.5, 7);
    ctx.fill();
  }
  blush(ctx, 0, 7.5, 0.55);
  ctx.strokeStyle = "#5a3208";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.arc(0, 5.5, 2, 0.2, Math.PI - 0.2);
  ctx.stroke();
}

function babyLani(ctx, t) {
  // Kilo Bebé — bun alto, flequillo, vestidito A-line, cara legible
  const bob = Math.sin(t / 10) * 1.2;
  ctx.translate(0, 4 + bob);
  const dress = "#ff6a8a";
  const skin = "#f4c2a8";
  const hair = "#1a0c08";
  ctx.fillStyle = dress;
  ctx.beginPath();
  ctx.moveTo(-5, 6);
  ctx.lineTo(5, 6);
  ctx.lineTo(9, 17);
  ctx.quadraticCurveTo(0, 19, -9, 17);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillRect(-2.2, 8, 4.4, 2.6);
  ctx.strokeStyle = skin;
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-4, 16); ctx.lineTo(-5, 19.5);
  ctx.moveTo(4, 16); ctx.lineTo(5, 19.5);
  ctx.stroke();
  ctx.fillStyle = "#2a1408";
  ctx.beginPath();
  ctx.ellipse(-5.2, 20, 2.3, 1.2, 0, 0, Math.PI * 2);
  ctx.ellipse(5.2, 20, 2.3, 1.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.arc(0, -6, 8.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, -14, 5.5, 4.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(0, -4, 7.2, 0, Math.PI * 2);
  ctx.fill();
  // flequillo
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.moveTo(-6.5, -6);
  ctx.quadraticCurveTo(-3, -3.5, 0, -5.5);
  ctx.quadraticCurveTo(3, -3.5, 6.5, -6);
  ctx.quadraticCurveTo(4, -9, 0, -10);
  ctx.quadraticCurveTo(-4, -9, -6.5, -6);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-2.8, -4.5, 2.5, 0, Math.PI * 2);
  ctx.arc(2.8, -4.5, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a1408";
  ctx.beginPath();
  ctx.arc(-2.4, -4.1, 1.25, 0, Math.PI * 2);
  ctx.arc(3.2, -4.1, 1.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-3.1, -5, 0.55, 0, Math.PI * 2);
  ctx.arc(2.5, -5, 0.55, 0, Math.PI * 2);
  ctx.fill();
  blush(ctx, 0, -1.2, 0.85);
  ctx.strokeStyle = "#c47a6a";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(0, -0.2, 2.0, 0.25, Math.PI - 0.25);
  ctx.stroke();
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.ellipse(-7, 8, 2.1, 2.8, 0.2, 0, Math.PI * 2);
  ctx.ellipse(7, 8, 2.1, 2.8, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2ec9c0";
  ctx.beginPath();
  ctx.ellipse(2, -15, 3.5, 1.8, 0.4, 0, Math.PI * 2);
  ctx.fill();
}

function babyTiko(ctx, t) {
  // Mini Experiment-626 — misma silueta angular en miniatura (NO koala).
  const flap = Math.sin(t / 7) * 2.8;
  ctx.translate(0, 3);
  const blue = "#6a9ee8";
  const blueDeep = "#1e4a9a";
  const belly = "#c8e8ff";
  const ink = "#0b1a44";
  const pink = "#f7c0d0";
  const clawCol = "#cfe9ff";

  // Orejas V ENORMES + muesca (detrás), tip alto
  function ear(side) {
    const s = side;
    const tipY = -28 + flap * s * 0.35;
    ctx.fillStyle = blue;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(s * 4, -3);
    ctx.lineTo(s * 7, -6);
    ctx.lineTo(s * 13, tipY + 10);
    ctx.lineTo(s * 15, tipY + 3);   // notch bottom
    ctx.lineTo(s * 11, tipY + 6);   // notch in
    ctx.lineTo(s * 14, tipY);       // tip
    ctx.lineTo(s * 6, tipY + 12);
    ctx.lineTo(s * 3, -2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = pink;
    ctx.beginPath();
    ctx.moveTo(s * 5, -2);
    ctx.lineTo(s * 10, tipY + 11);
    ctx.lineTo(s * 11, tipY + 5);
    ctx.lineTo(s * 7, tipY + 9);
    ctx.closePath();
    ctx.fill();
  }
  ear(-1);
  ear(1);

  // Antenas + bolitas
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-3, -10); ctx.lineTo(-4.5, -18);
  ctx.moveTo(3, -10); ctx.lineTo(4.5, -18);
  ctx.stroke();
  ctx.fillStyle = blue;
  ctx.beginPath();
  ctx.arc(-4.5, -18.5, 1.6, 0, Math.PI * 2);
  ctx.arc(4.5, -18.5, 1.6, 0, Math.PI * 2);
  ctx.fill();

  // Piernas cortas stance ancho
  ctx.strokeStyle = blue;
  ctx.lineWidth = 3.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-5, 10); ctx.lineTo(-8, 15);
  ctx.moveTo(5, 10); ctx.lineTo(8, 15);
  ctx.stroke();
  ctx.fillStyle = blueDeep;
  ctx.beginPath();
  ctx.ellipse(-8.5, 15.5, 3.2, 1.4, 0, 0, Math.PI * 2);
  ctx.ellipse(8.5, 15.5, 3.2, 1.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cuerpo hunched bajo/ancho (trapecio, no bola)
  ctx.fillStyle = blue;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.05;
  ctx.beginPath();
  ctx.moveTo(-7, 3);
  ctx.lineTo(7, 3);
  ctx.lineTo(9, 8);
  ctx.lineTo(5.5, 12);
  ctx.lineTo(-5.5, 12);
  ctx.lineTo(-9, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = belly;
  ctx.beginPath();
  ctx.moveTo(-3.5, 5);
  ctx.lineTo(3.5, 5);
  ctx.lineTo(2.8, 10.5);
  ctx.lineTo(-2.8, 10.5);
  ctx.closePath();
  ctx.fill();

  // Cabeza trapecio angular (SOLO lineTo)
  ctx.fillStyle = blue;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(-5.5, -12);   // top-L (estrecho)
  ctx.lineTo(5.5, -12);    // top-R
  ctx.lineTo(8.5, -1);     // jaw-R (ancho)
  ctx.lineTo(3, 4);        // chin-R
  ctx.lineTo(-3, 4);       // chin-L plano
  ctx.lineTo(-8.5, -1);    // jaw-L
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Hocico corto trapecio
  ctx.fillStyle = belly;
  ctx.beginPath();
  ctx.moveTo(-3.5, 0);
  ctx.lineTo(3.5, 0);
  ctx.lineTo(2.8, 4.5);
  ctx.lineTo(-2.8, 4.5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.moveTo(-1.3, 0.6);
  ctx.lineTo(1.3, 0.6);
  ctx.lineTo(0.8, 2.0);
  ctx.lineTo(-0.8, 2.0);
  ctx.closePath();
  ctx.fill();

  // Dientes siempre (2 pequeños cute)
  ctx.fillStyle = "#1a0a10";
  ctx.fillRect(-3.2, 3.5, 6.4, 2.0);
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(-2.4, 3.5); ctx.lineTo(-1.5, 5.6); ctx.lineTo(-0.6, 3.5);
  ctx.moveTo(0.6, 3.5); ctx.lineTo(1.5, 5.6); ctx.lineTo(2.4, 3.5);
  ctx.fill();

  // Ojos verticales gigantes
  ctx.fillStyle = "#0a0a12";
  ctx.beginPath();
  ctx.ellipse(-3.4, -5.5, 2.6, 5.0, 0, 0, Math.PI * 2);
  ctx.ellipse(3.4, -5.5, 2.6, 5.0, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillRect(-4.2, -7.8, 1.3, 1.6);
  ctx.fillRect(2.6, -7.8, 1.3, 1.6);

  blush(ctx, 0, 1.5, 0.7);

  // Brazos + 3 garras mini
  ctx.strokeStyle = blue;
  ctx.lineWidth = 2.4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-8, 5); ctx.lineTo(-13, 7);
  ctx.moveTo(8, 5); ctx.lineTo(13, 7);
  ctx.stroke();
  ctx.fillStyle = clawCol;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 0.8;
  for (const side of [-1, 1]) {
    const cx = side * 13;
    const cy = 7;
    for (const [dx, dy] of [[side * 4, -3.2], [side * 4.5, 0.2], [side * 3.5, 2.8]]) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + dx * 0.3, cy + dy * 0.2);
      ctx.lineTo(cx + dx, cy + dy);
      ctx.lineTo(cx + dx * 0.15, cy + dy * 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }
}
function babyFrita(ctx, t) {
  const bob = Math.sin(t / 8) * 1.4;
  ctx.translate(0, 2 + bob);
  const fry = "#ffe08a";
  const ket = "#c81e1e";
  // tiny ketchup drip behind
  ctx.fillStyle = ket;
  ctx.beginPath();
  ctx.moveTo(-5, 4);
  ctx.quadraticCurveTo(-10, 10, -4, 16);
  ctx.lineTo(4, 15);
  ctx.quadraticCurveTo(2, 8, 4, 4);
  ctx.fill();
  // tall fry stick
  ctx.fillStyle = fry;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-4.5, -4, 9, 18, 4);
  else ctx.rect(-4.5, -4, 9, 18);
  ctx.fill();
  // grill mark
  ctx.strokeStyle = "#f0b43a";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-3, 4); ctx.lineTo(3, 5);
  ctx.stroke();
  // salt
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-2, 2, 0.8, 0, Math.PI * 2);
  ctx.arc(1.5, 7, 0.8, 0, Math.PI * 2);
  ctx.fill();
  // head
  ctx.fillStyle = "#f4c2a8";
  ctx.beginPath();
  ctx.arc(0, -8, 6.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-2.2, -8.5, 1.9, 0, Math.PI * 2);
  ctx.arc(2.2, -8.5, 1.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.arc(-1.9, -8.3, 0.95, 0, Math.PI * 2);
  ctx.arc(2.5, -8.3, 0.95, 0, Math.PI * 2);
  ctx.fill();
  blush(ctx, 0, -5.5, 0.7);
  ctx.strokeStyle = "#c47a2a";
  ctx.lineWidth = 1.15;
  ctx.beginPath();
  ctx.arc(0, -5, 1.7, 0.2, Math.PI - 0.2);
  ctx.stroke();
  // mini captain hat
  ctx.fillStyle = ket;
  ctx.fillRect(-5.5, -13, 11, 3);
  ctx.fillRect(-2.5, -18, 5, 5);
  ctx.fillStyle = "#ffe66a";
  ctx.fillRect(-1.5, -16.5, 3, 2);
}

function babyKoa(ctx, t) {
  // Evo 0 — unmistakable hatchling: egg-blob body, sprout horn, no long snout.
  const bob = Math.sin(t / 9) * 1.1;
  const wag = Math.sin(t / 5) * 2.8;
  ctx.translate(0, 2 + bob);
  const green = "#ff8a74"; // escamas rojizas (misma paleta que Dino adulto)
  const belly = "#fff0c4";
  const ink = "#6a1a12";
  const sprout = "#ffc23a";

  // Tiny curled stub tail (not a whip)
  ctx.strokeStyle = green;
  ctx.lineWidth = 2.8;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-4, 6);
  ctx.quadraticCurveTo(-7, 8 + wag * 0.2, -6.5, 4 + wag);
  ctx.stroke();

  // Egg / potato body — rounder than any later form
  ctx.fillStyle = green;
  ctx.beginPath();
  ctx.ellipse(0, 5.5, 8.4, 7.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = belly;
  ctx.beginPath();
  ctx.ellipse(0.4, 7.2, 5, 4.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pudgy feet (no long legs)
  ctx.fillStyle = green;
  ctx.beginPath();
  ctx.ellipse(-3.5, 12.5, 2.6, 1.4, 0, 0, Math.PI * 2);
  ctx.ellipse(3.5, 12.5, 2.6, 1.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nub arms
  ctx.strokeStyle = green;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-7, 5); ctx.lineTo(-9, 7);
  ctx.moveTo(7, 5); ctx.lineTo(9, 7);
  ctx.stroke();

  // Head is almost the same blob (no long neck / snout silhouette)
  ctx.fillStyle = green;
  ctx.beginPath();
  ctx.ellipse(1.5, -1.5, 7.2, 6.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = belly;
  ctx.beginPath();
  ctx.ellipse(2.4, 0.4, 3.6, 2.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Single sprout horn (baby marker)
  ctx.fillStyle = sprout;
  ctx.beginPath();
  ctx.moveTo(0.2, -6.5);
  ctx.lineTo(1.4, -12);
  ctx.lineTo(3.2, -6.2);
  ctx.closePath();
  ctx.fill();
  // Leaf tip on sprout
  ctx.beginPath();
  ctx.ellipse(1.5, -12.4, 1.6, 1.1, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // Oversized eyes
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(0.2, -2, 2.8, 3.2, 0, 0, Math.PI * 2);
  ctx.ellipse(4.4, -2, 2.8, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a0c08";
  ctx.beginPath();
  ctx.arc(0.6, -1.6, 1.35, 0, Math.PI * 2);
  ctx.arc(4.8, -1.6, 1.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-0.1, -2.5, 0.65, 0, Math.PI * 2);
  ctx.arc(4.1, -2.5, 0.65, 0, Math.PI * 2);
  ctx.fill();

  blush(ctx, 2, 1.4, 0.85);

  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.1;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(2.6, 1.6, 1.8, 0.2, Math.PI - 0.2);
  ctx.stroke();
}

function babyMichi(ctx, t) {
  const bob = Math.sin(t / 11) * 1.1;
  const tw = Math.sin(t / 9) * 3;
  ctx.translate(0, 3 + bob);
  const fur = "#ffd0ee";
  const ink = "#5a2040";
  const deep = "#ff4da0";

  // curled tail
  ctx.strokeStyle = fur;
  ctx.lineWidth = 4.4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(7, 10);
  ctx.quadraticCurveTo(17, 8 + tw, 15, -2 + tw);
  ctx.stroke();
  ctx.fillStyle = deep;
  ctx.beginPath();
  ctx.arc(15, -2 + tw, 2.3, 0, Math.PI * 2);
  ctx.fill();

  // loaf body
  ctx.fillStyle = fur;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(0, 9, 7.2, 6.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  for (const px of [-3.5, 3.5]) {
    ctx.fillStyle = fur;
    ctx.beginPath();
    ctx.ellipse(px, 13.8, 2.9, 2.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = deep;
    ctx.beginPath();
    ctx.ellipse(px, 14.1, 1.05, 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ears before head
  function ear(dir) {
    ctx.fillStyle = fur;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(dir * 1.2, -8);
    ctx.lineTo(dir * 6.5, -19);
    ctx.lineTo(dir * 10, -6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = deep;
    ctx.beginPath();
    ctx.moveTo(dir * 3.5, -8);
    ctx.lineTo(dir * 6.2, -15.5);
    ctx.lineTo(dir * 8, -7.5);
    ctx.closePath();
    ctx.fill();
  }
  ear(-1);
  ear(1);

  ctx.fillStyle = fur;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, -1, 9.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,.32)";
  ctx.beginPath();
  ctx.ellipse(-4, -5, 3, 2, -0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(-3.2, -0.5, 2.6, 3.1, 0, 0, Math.PI * 2);
  ctx.ellipse(3.2, -0.5, 2.6, 3.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a0e1e";
  ctx.beginPath();
  ctx.arc(-2.8, 0, 1.55, 0, Math.PI * 2);
  ctx.arc(3.6, 0, 1.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-3.4, -0.8, 0.65, 0, Math.PI * 2);
  ctx.arc(3, -0.8, 0.65, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = deep;
  ctx.beginPath();
  ctx.moveTo(0, 3.4);
  ctx.lineTo(-1.7, 2);
  ctx.lineTo(1.7, 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 0.85;
  ctx.beginPath();
  ctx.moveTo(0, 3.4); ctx.lineTo(0, 4.5);
  ctx.arc(-1.15, 4.5, 1.15, 0, Math.PI);
  ctx.moveTo(0, 4.5);
  ctx.arc(1.15, 4.5, 1.15, 0, Math.PI);
  ctx.stroke();

  ctx.strokeStyle = "rgba(90,32,64,.65)";
  ctx.lineWidth = 0.85;
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(dir * 4, 2); ctx.lineTo(dir * 13, 0.2);
    ctx.moveTo(dir * 4, 3.6); ctx.lineTo(dir * 13, 4.2);
    ctx.stroke();
  }
  blush(ctx, 0, 2.5, 0.85);
}


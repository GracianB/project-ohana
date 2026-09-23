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
  else if (id === "pikachu") babyPika(ctx, t);
  else babyLani(ctx, t);
}

function babyPika(ctx, t) {
  const bob = Math.sin(t / 9) * 1.1;
  ctx.translate(0, 3 + bob);
  const body = "#ffe44a";
  const tip = "#222";
  // stubby tail zig
  ctx.strokeStyle = body;
  ctx.lineWidth = 3.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(6, 6);
  ctx.lineTo(11, 0);
  ctx.lineTo(9, 6);
  ctx.lineTo(14, 3);
  ctx.stroke();
  // round body
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, 5, 8.5, 7.6, 0, 0, Math.PI * 2);
  ctx.fill();
  // tall ears with black tips
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(-5, -6);
  ctx.lineTo(-7, -20);
  ctx.lineTo(-1, -6);
  ctx.moveTo(5, -6);
  ctx.lineTo(7, -20);
  ctx.lineTo(1, -6);
  ctx.fill();
  ctx.fillStyle = tip;
  ctx.beginPath();
  ctx.moveTo(-7, -20); ctx.lineTo(-3.5, -20); ctx.lineTo(-5.2, -14); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(7, -20); ctx.lineTo(3.5, -20); ctx.lineTo(5.2, -14); ctx.fill();
  // eyes
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-2.8, 2, 2.2, 0, Math.PI * 2);
  ctx.arc(2.8, 2, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.arc(-2.4, 2.2, 1.05, 0, Math.PI * 2);
  ctx.arc(3.1, 2.2, 1.05, 0, Math.PI * 2);
  ctx.fill();
  // red cheeks
  ctx.fillStyle = "#e23b3b";
  ctx.beginPath();
  ctx.arc(-6.5, 6, 2.1, 0, Math.PI * 2);
  ctx.arc(6.5, 6, 2.1, 0, Math.PI * 2);
  ctx.fill();
  blush(ctx, 0, 7, 0.6);
}

function babyLani(ctx, t) {
  const bob = Math.sin(t / 10) * 1.2;
  ctx.translate(0, 4 + bob);
  const dress = "#ff6a8a";
  const skin = "#f4c2a8";
  const hair = "#1a0c08";
  // little A-line dress
  ctx.fillStyle = dress;
  ctx.beginPath();
  ctx.moveTo(-5, 6);
  ctx.lineTo(5, 6);
  ctx.lineTo(8, 16);
  ctx.quadraticCurveTo(0, 18, -8, 16);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillRect(-2.2, 8, 4.4, 2.6);
  // stubby legs + shoes
  ctx.strokeStyle = skin;
  ctx.lineWidth = 2.4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-4, 15); ctx.lineTo(-5, 18);
  ctx.moveTo(4, 15); ctx.lineTo(5, 18);
  ctx.stroke();
  ctx.fillStyle = "#2a1408";
  ctx.beginPath();
  ctx.ellipse(-5.2, 18.5, 2.4, 1.3, 0, 0, Math.PI * 2);
  ctx.ellipse(5.2, 18.5, 2.4, 1.3, 0, 0, Math.PI * 2);
  ctx.fill();
  // hair bun mass
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.arc(0, -8, 9.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, -14, 6, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // face
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(0, -5, 7.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-3.0, -6, 2.6, 0, Math.PI * 2);
  ctx.arc(3.0, -6, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a1408";
  ctx.beginPath();
  ctx.arc(-2.6, -5.6, 1.25, 0, Math.PI * 2);
  ctx.arc(3.4, -5.6, 1.25, 0, Math.PI * 2);
  ctx.fill();
  blush(ctx, 0, -2.0, 0.9);
  ctx.strokeStyle = "#c47a6a";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(0, -1.2, 2.1, 0.25, Math.PI - 0.25);
  ctx.stroke();
  // tiny arms
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.ellipse(-7, 8, 2.2, 3, 0.2, 0, Math.PI * 2);
  ctx.ellipse(7, 8, 2.2, 3, -0.2, 0, Math.PI * 2);
  ctx.fill();
}

function babyTiko(ctx, t) {
  const flap = Math.sin(t / 7) * 3.2;
  ctx.translate(0, 3);
  const blue = "#6bb6ff";
  const ear = "#7ec8ff";
  // huge baby ears
  ctx.fillStyle = ear;
  ctx.beginPath();
  ctx.moveTo(-5, -4);
  ctx.quadraticCurveTo(-17, -28 + flap, 0, -8);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(5, -4);
  ctx.quadraticCurveTo(17, -28 + flap, 0, -8);
  ctx.fill();
  ctx.fillStyle = "#f7c0d0";
  ctx.beginPath();
  ctx.ellipse(-10, -16, 2.6, 5.5, -0.3, 0, Math.PI * 2);
  ctx.ellipse(10, -16, 2.6, 5.5, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // tiny antennae
  ctx.fillStyle = "#0b1a44";
  ctx.beginPath();
  ctx.moveTo(-4, -10); ctx.lineTo(-5, -18); ctx.lineTo(-2, -9); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(4, -10); ctx.lineTo(5, -18); ctx.lineTo(2, -9); ctx.fill();
  // tubby body
  ctx.fillStyle = blue;
  ctx.beginPath();
  ctx.arc(0, 4, 9.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e9f7ff";
  ctx.beginPath();
  ctx.ellipse(0, 7, 5.4, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // stubby feet
  ctx.fillStyle = blue;
  ctx.fillRect(-4, 12, 2.6, 3.2);
  ctx.fillRect(1.4, 12, 2.6, 3.2);
  // big eyes
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.ellipse(-3.8, 1.2, 3.2, 3.7, 0, 0, Math.PI * 2);
  ctx.ellipse(3.8, 1.2, 3.2, 3.7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillRect(-4.6, -0.4, 1.5, 1.7);
  ctx.fillRect(2.6, -0.4, 1.5, 1.7);
  blush(ctx, 0, 4.2, 0.85);
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.ellipse(0, 6.8, 2.3, 1.15, 0, 0, Math.PI * 2);
  ctx.fill();
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
  const green = "#9ae8b8";
  const belly = "#f0ffe4";
  const ink = "#1e4a22";
  const sprout = "#3bb85a";

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


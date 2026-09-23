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
  ctx.fillStyle = "#ffe44a";
  ctx.beginPath();
  ctx.ellipse(0, 4, 8.2, 7.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.moveTo(-6, -8);
  ctx.lineTo(-8, -18);
  ctx.lineTo(-3, -8);
  ctx.moveTo(6, -8);
  ctx.lineTo(8, -18);
  ctx.lineTo(3, -8);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-2.6, 2, 2.1, 0, Math.PI * 2);
  ctx.arc(2.6, 2, 2.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.arc(-2.3, 2.2, 1, 0, Math.PI * 2);
  ctx.arc(2.9, 2.2, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e23b3b";
  ctx.beginPath();
  ctx.arc(-6, 6, 1.8, 0, Math.PI * 2);
  ctx.arc(6, 6, 1.8, 0, Math.PI * 2);
  ctx.fill();
}

function babyLani(ctx, t) {
  const bob = Math.sin(t / 10) * 1.2;
  ctx.translate(0, 4 + bob);
  ctx.fillStyle = "#ff6a8a";
  ctx.beginPath();
  ctx.ellipse(0, 11, 6.2, 5.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillRect(-2.2, 8, 4.4, 2.4);
  ctx.fillStyle = "#1a0c08";
  ctx.beginPath();
  ctx.arc(0, -7, 10.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f4c2a8";
  ctx.beginPath();
  ctx.arc(0, -5, 8.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-3.2, -6, 2.8, 0, Math.PI * 2);
  ctx.arc(3.2, -6, 2.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a1408";
  ctx.beginPath();
  ctx.arc(-2.8, -5.6, 1.35, 0, Math.PI * 2);
  ctx.arc(3.6, -5.6, 1.35, 0, Math.PI * 2);
  ctx.fill();
  blush(ctx, 0, -2.2, 0.9);
  ctx.strokeStyle = "#c47a6a";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(0, -1.4, 2.2, 0.25, Math.PI - 0.25);
  ctx.stroke();
  ctx.strokeStyle = "#1a0c08";
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-5, 10);
  ctx.lineTo(-6, 14);
  ctx.moveTo(5, 10);
  ctx.lineTo(6, 14);
  ctx.stroke();
}

function babyTiko(ctx, t) {
  const flap = Math.sin(t / 7) * 3;
  ctx.translate(0, 3);
  ctx.fillStyle = "#7ec8ff";
  ctx.beginPath();
  ctx.moveTo(-5, -4);
  ctx.quadraticCurveTo(-16, -26 + flap, 0, -8);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(5, -4);
  ctx.quadraticCurveTo(16, -26 + flap, 0, -8);
  ctx.fill();
  ctx.fillStyle = "#f7c0d0";
  ctx.beginPath();
  ctx.ellipse(-10, -16, 2.4, 5, -0.25, 0, Math.PI * 2);
  ctx.ellipse(10, -16, 2.4, 5, 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6bb6ff";
  ctx.beginPath();
  ctx.arc(0, 4, 9.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e9f7ff";
  ctx.beginPath();
  ctx.ellipse(0, 7, 5.2, 3.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.ellipse(-3.6, 1.2, 3.1, 3.6, 0, 0, Math.PI * 2);
  ctx.ellipse(3.6, 1.2, 3.1, 3.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillRect(-4.4, -0.4, 1.4, 1.6);
  ctx.fillRect(2.4, -0.4, 1.4, 1.6);
  blush(ctx, 0, 4, 0.85);
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.ellipse(0, 6.6, 2.2, 1.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6bb6ff";
  ctx.fillRect(-3, 12, 2.4, 3);
  ctx.fillRect(0.6, 12, 2.4, 3);
}

function babyFrita(ctx, t) {
  const bob = Math.sin(t / 8) * 1.4;
  ctx.translate(0, 2 + bob);
  ctx.fillStyle = "#ffe08a";
  ctx.beginPath();
  ctx.roundRect(-4.5, -2, 9, 16, 4);
  ctx.fill();
  ctx.fillStyle = "#f0b43a";
  ctx.beginPath();
  ctx.roundRect(-4.5, 8, 9, 6, 3);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-2.2, 2, 1.8, 0, Math.PI * 2);
  ctx.arc(2.2, 2, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.arc(-1.9, 2.2, 0.9, 0, Math.PI * 2);
  ctx.arc(2.5, 2.2, 0.9, 0, Math.PI * 2);
  ctx.fill();
  blush(ctx, 0, 5, 0.7);
  ctx.strokeStyle = "#c47a2a";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 6.2, 1.8, 0.2, Math.PI - 0.2);
  ctx.stroke();
}

function babyKoa(ctx, t) {
  // Tiny baby dino (evo 0) — cute green oval, stubby legs, big eyes
  const bob = Math.sin(t / 9) * 1.0;
  const wag = Math.sin(t / 6) * 2.4;
  ctx.translate(0, 3 + bob);
  const green = "#7ee08a";
  const belly = "#e8ffd8";
  const ink = "#1e4a22";

  // Tiny tail
  ctx.strokeStyle = green;
  ctx.lineWidth = 2.6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-5, 4);
  ctx.quadraticCurveTo(-9, 5 + wag * 0.3, -10.5, 2 + wag);
  ctx.stroke();

  // Body oval
  ctx.fillStyle = green;
  ctx.beginPath();
  ctx.ellipse(0, 5, 7.2, 6.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = belly;
  ctx.beginPath();
  ctx.ellipse(0.6, 6.4, 4, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tiny legs
  ctx.strokeStyle = green;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-2.5, 9);
  ctx.lineTo(-3, 12);
  ctx.moveTo(2.5, 9);
  ctx.lineTo(3, 12);
  ctx.stroke();
  ctx.fillStyle = green;
  ctx.beginPath();
  ctx.ellipse(-3.2, 12.2, 1.8, 0.9, 0, 0, Math.PI * 2);
  ctx.ellipse(3.2, 12.2, 1.8, 0.9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Little stubby arms
  ctx.strokeStyle = green;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-6, 4);
  ctx.lineTo(-7.5, 6);
  ctx.moveTo(6, 4);
  ctx.lineTo(7.5, 6);
  ctx.stroke();

  // Head bump / round snout area (same oval-ish head on body)
  ctx.fillStyle = green;
  ctx.beginPath();
  ctx.ellipse(2.5, -1, 5.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = belly;
  ctx.beginPath();
  ctx.ellipse(4.2, 0.2, 2.8, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tiny crest
  ctx.fillStyle = "#3bb85a";
  ctx.beginPath();
  ctx.moveTo(0.5, -5);
  ctx.lineTo(1.5, -9);
  ctx.lineTo(3, -5);
  ctx.fill();

  // Big cute eyes
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(1.2, -1.6, 2.4, 2.8, 0, 0, Math.PI * 2);
  ctx.ellipse(4.6, -1.6, 2.4, 2.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a0c08";
  ctx.beginPath();
  ctx.arc(1.5, -1.3, 1.15, 0, Math.PI * 2);
  ctx.arc(4.9, -1.3, 1.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(0.9, -2.2, 0.55, 0, Math.PI * 2);
  ctx.arc(4.3, -2.2, 0.55, 0, Math.PI * 2);
  ctx.fill();

  blush(ctx, 2.5, 1.2, 0.7);

  // Tiny smile
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(3.6, 1.4, 1.5, 0.2, Math.PI - 0.2);
  ctx.stroke();
}

function babyMichi(ctx, t) {
  const bob = Math.sin(t / 11) * 1.1;
  const tw = Math.sin(t / 9) * 3;
  ctx.translate(0, 3 + bob);
  const fur = "#ffd0ee";
  const ink = "#5a2040";
  const deep = "#ff4da0";

  // curled tail behind
  ctx.strokeStyle = fur;
  ctx.lineWidth = 4.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(7, 10);
  ctx.quadraticCurveTo(16, 8 + tw, 14, -1 + tw);
  ctx.stroke();
  ctx.fillStyle = deep;
  ctx.beginPath();
  ctx.arc(14, -1 + tw, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // little body
  ctx.fillStyle = fur;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(0, 9, 7, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // paws
  for (const px of [-3.5, 3.5]) {
    ctx.fillStyle = fur;
    ctx.beginPath();
    ctx.ellipse(px, 13.5, 2.8, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = deep;
    ctx.beginPath();
    ctx.ellipse(px, 13.8, 1, 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // cat ears (wide base) BEFORE head
  function ear(dir) {
    ctx.fillStyle = fur;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(dir * 1, -8);
    ctx.lineTo(dir * 6, -18);
    ctx.lineTo(dir * 9.5, -6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = deep;
    ctx.beginPath();
    ctx.moveTo(dir * 3.5, -8);
    ctx.lineTo(dir * 6, -15);
    ctx.lineTo(dir * 7.8, -7.5);
    ctx.closePath();
    ctx.fill();
  }
  ear(-1);
  ear(1);

  // round head
  ctx.fillStyle = fur;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, -1, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // shine
  ctx.fillStyle = "rgba(255,255,255,.30)";
  ctx.beginPath();
  ctx.ellipse(-4, -5, 3, 2, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // big eyes
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(-3.2, -0.5, 2.5, 3, 0, 0, Math.PI * 2);
  ctx.ellipse(3.2, -0.5, 2.5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a0e1e";
  ctx.beginPath();
  ctx.arc(-2.8, 0, 1.5, 0, Math.PI * 2);
  ctx.arc(3.6, 0, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-3.4, -0.8, 0.6, 0, Math.PI * 2);
  ctx.arc(3, -0.8, 0.6, 0, Math.PI * 2);
  ctx.fill();

  // pink nose + tiny mouth
  ctx.fillStyle = deep;
  ctx.beginPath();
  ctx.moveTo(0, 3.4);
  ctx.lineTo(-1.6, 2);
  ctx.lineTo(1.6, 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, 3.4); ctx.lineTo(0, 4.4);
  ctx.arc(-1.1, 4.4, 1.1, 0, Math.PI);
  ctx.moveTo(0, 4.4);
  ctx.arc(1.1, 4.4, 1.1, 0, Math.PI);
  ctx.stroke();

  // whiskers
  ctx.strokeStyle = "rgba(90,32,64,.6)";
  ctx.lineWidth = 0.8;
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(dir * 4, 2); ctx.lineTo(dir * 12, 0.5);
    ctx.moveTo(dir * 4, 3.5); ctx.lineTo(dir * 12, 4);
    ctx.stroke();
  }

  blush(ctx, 0, 2.5, 0.85);
}

// Cuerno · una bolita con un cuerno. No es un caballo: el cuerno es el personaje.

const COAT = ["#fff6ea", "#ffe9f6", "#f7e7ff", "#e7f4ff", "#fff8d8"];
const HORN = ["#f2c1ff", "#ffb0e0", "#ffe14a", "#9ad7ff", "#fff"];
const MANE = ["#ffb7d8", "#d9a6ff", "#8fd0ff", "#ffe14a", "#fff"];

function horn(ctx, len, color, wobble) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3.4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  for (let i = 1; i <= 7; i++) {
    const k = i / 7;
    const side = i % 2 ? 1 : -1;
    ctx.lineTo(side * (2.2 + k * 2.4) + wobble, -k * len);
  }
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(wobble * 0.4, -len, 2.6 + len * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function draw(ctx, pose, R) {
  const f = Math.max(0, Math.min(4, pose.form | 0));
  const t = pose.t;
  const god = f === 4;
  const run = pose.state === "run";
  const bob = Math.sin(t * 0.08) * 2 + (run ? -Math.abs(Math.cos(pose.phase)) * 3 : pose.breath);
  const step = run ? Math.sin(pose.phase) : 0;
  const coat = COAT[f];
  const hornC = HORN[f];
  const mane = MANE[f];
  const len = 16 + f * 7;

  ctx.save();
  ctx.translate(0, bob);

  if (god) R.halo(ctx, 0, -46, 22, t, "#fff6c8");

  const leg = (x, phase) => {
    ctx.save();
    ctx.translate(x, -6);
    ctx.rotate(phase * 0.45);
    R.ellipse(ctx, 0, 8, 4.2, 7, R.darken(coat, 0.08));
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(0, 14, 4.4, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  leg(-10, step);
  leg(-4, -step);
  leg(6, step);
  leg(12, -step);

  R.ellipse(ctx, 0, -22, 18 + f, 14 + f * 0.6, coat);
  R.blush(ctx, -10, -20, 3.2, "#ffb7d5");
  R.blush(ctx, 12, -20, 3.2, "#ffb7d5");

  ctx.fillStyle = mane;
  ctx.beginPath();
  ctx.ellipse(-6, -30, 8, 5, -0.4, 0, Math.PI * 2);
  ctx.ellipse(4, -32, 6, 4, 0.3, 0, Math.PI * 2);
  ctx.fill();

  const mood = pose.state === "hurt" || pose.state === "dead" ? "closed" : pose.state === "attack" ? "happy" : "normal";
  R.eye(ctx, -5, -24, 3.6, pose, { iris: "#5a3a78", mood });
  R.eye(ctx, 7, -24, 3.8, pose, { iris: "#5a3a78", mood });

  ctx.save();
  ctx.translate(2, -34 - f);
  ctx.rotate(-0.15 + (pose.state === "attack" ? pose.atk * 0.4 : 0));
  horn(ctx, len, hornC, Math.sin(t * 0.12) * 0.6);
  ctx.restore();

  if (pose.state === "cast" || god) R.sparkle(ctx, 8, -34 - len, 3 + f);
  if (f >= 2) R.star(ctx, 16, -18, 3.2, mane);
  ctx.restore();
}

export default { id: "cuerno", draw };

// Yomi · farol. El papel se raja y salen fauces. Flota, no anda.
const PAPER = ["#f4e2c4", "#f0d2a4", "#e8c090", "#c9846a", "#2a121c"];
const INK = ["#3a2418", "#4a2018", "#6a1830", "#ff4466", "#ffd0dc"];
const FLAME = ["#ffb15a", "#ff8a3a", "#ff5a2a", "#ff2244", "#ffe14a"];

function draw(ctx, pose, R) {
  const f = Math.max(0, Math.min(4, pose.form | 0));
  const t = pose.t || 0;
  const god = f === 4;
  const dread = f >= 3;
  const castSlot = pose.state === "cast" ? pose.castSlot : -1;
  const open = pose.state === "attack" ? pose.atk : castSlot === 2 ? 0.6 + pose.cast * 0.4 : god ? 0.22 : 0.04;
  const paper = PAPER[f];
  const ink = INK[f];
  const flame = FLAME[f];
  const bob = Math.sin(t * 0.07) * 3 + (pose.breath || 0);
  const h = 52 + f * 4;
  const w = 24 + f * 2;

  ctx.save();
  ctx.translate(0, bob - 8);
  if (god) R.halo(ctx, 0, -h * 0.4, 26, t, flame);

  R.tail(ctx, 0, 10, 30 + f * 3, Math.PI / 2, (k) => Math.sin(t * 0.16 + k * 3) * 4, 8, 2, god ? "#ff4466" : "#2a1848");

  ctx.save();
  ctx.translate(-w * 0.8, -h * 0.35);
  ctx.rotate(-0.5 + Math.sin(t * 0.08) * 0.1);
  R.ellipse(ctx, 0, 12, 16, 8, R.darken(paper, 0.2));
  ctx.restore();
  ctx.save();
  ctx.translate(w * 0.9, -h * 0.4);
  ctx.rotate(0.45);
  R.ellipse(ctx, 0, 10, 18, 9, paper);
  ctx.restore();

  R.ellipse(ctx, 0, -h * 0.42, w, h * 0.48, paper);
  R.celShade(ctx, 0, -h * 0.42, w, h * 0.48, paper, 0.14);
  ctx.strokeStyle = R.darken(paper, 0.35);
  ctx.lineWidth = 1.2;
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.2 + i * 8, w * 0.8, 2.4, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  const eyeY = -h * 0.62;
  const mood = pose.state === "hurt" || pose.state === "dead" ? "closed" : "normal";
  R.eye(ctx, -7, eyeY, dread ? 5.6 : 4.4, pose, { iris: god ? "#ffe14a" : "#1a1020", mood });
  R.eye(ctx, 10, eyeY, dread ? 6.2 : 4.8, pose, { iris: god ? "#ffe14a" : "#1a1020", mood });
  if (dread) R.eye(ctx, 2, eyeY - 11, 3.2, pose, { iris: flame, mood });

  const mouthW = 8 + open * 14;
  ctx.fillStyle = god ? "#140208" : ink;
  ctx.beginPath();
  ctx.ellipse(3, eyeY + 14, mouthW * 0.5, 3 + open * 9, 0.08, 0, Math.PI * 2);
  ctx.fill();
  if (open > 0.15 || dread) {
    ctx.fillStyle = "#fff6ea";
    for (let i = 0; i < (god ? 6 : 4); i++) {
      const tx = 3 - mouthW * 0.35 + i * 4;
      ctx.beginPath();
      ctx.moveTo(tx, eyeY + 12);
      ctx.lineTo(tx + 2, eyeY + 16 + open * 5);
      ctx.lineTo(tx + 4, eyeY + 12);
      ctx.fill();
    }
  }

  ctx.fillStyle = flame;
  ctx.beginPath();
  ctx.moveTo(-5, 18);
  ctx.quadraticCurveTo(0, 34 + Math.sin(t * 0.2) * 3, 5, 18);
  ctx.fill();
  if (f >= 2) R.star(ctx, w + 4, -h * 0.2, 3.6, flame);
  if (pose.flourish > 0) R.sparkle(ctx, w, -h, 3 + pose.flourish * 2, flame);
  ctx.restore();
}

export default { id: "yomi", draw };

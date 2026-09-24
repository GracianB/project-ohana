// Yomi · farol yokai. No es una niña: es una máscara de papel que flota.
// Al evolucionar el papel se raja y dentro hay fauces.

const PAPER = ["#f4e2c4", "#f0d2a4", "#e8c090", "#c9846a", "#2a121c"];
const INK = ["#3a2418", "#4a2018", "#6a1830", "#ff4466", "#ffd0dc"];
const FLAME = ["#ffb15a", "#ff8a3a", "#ff5a2a", "#ff2244", "#ffe14a"];

function rib(ctx, x, y, w, h, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.3;
  ctx.globalAlpha = 0.45;
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.ellipse(x, y - h * 0.5 + (h * i) / 4, w * 0.92, 3.2, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function draw(ctx, pose, R) {
  const f = Math.max(0, Math.min(4, pose.form | 0));
  const t = pose.t;
  const dread = f >= 3;
  const god = f === 4;
  const paper = PAPER[f];
  const ink = INK[f];
  const flame = FLAME[f];
  const run = pose.state === "run";
  const bob = Math.sin(t * 0.07) * 3.2 + (run ? -Math.abs(Math.cos(pose.phase)) * 2 : pose.breath);
  const open = pose.state === "attack" ? pose.atk : pose.state === "cast" ? 0.7 : god ? 0.25 + Math.sin(t * 0.1) * 0.08 : 0;
  const h = 46 + f * 4;
  const w = 22 + f * 2;

  ctx.save();
  ctx.translate(0, bob - 6);

  R.tail(ctx, 0, 8, 28 + f * 4, Math.PI / 2,
    (k) => Math.sin(t * 0.16 + k * 3) * 3 + pose.sway * 2, 7, 1.5, god ? "#ff4466" : "#2a1848");

  const sleeve = pose.state === "attack" ? -0.4 + pose.atk * 1.6 : Math.sin(t * 0.05) * 0.25;
  ctx.save();
  ctx.translate(-w * 0.7, -h * 0.35);
  ctx.rotate(-0.6 + sleeve * 0.3 + pose.sway * 0.2);
  R.ellipse(ctx, 0, 10, 16, 8, R.darken(paper, 0.25));
  ctx.restore();
  ctx.save();
  ctx.translate(w * 0.85, -h * 0.4);
  ctx.rotate(0.5 - sleeve);
  R.ellipse(ctx, 0, 8, 18, 9, paper);
  ctx.restore();

  R.ellipse(ctx, 0, -h * 0.45, w, h * 0.5, paper);
  rib(ctx, 0, -h * 0.15, w, h, R.darken(paper, 0.35));

  if (dread) {
    ctx.globalAlpha = 0.55 + open * 0.4;
    ctx.fillStyle = flame;
    ctx.beginPath();
    ctx.ellipse(2, -h * 0.35, w * 0.45, h * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  const eyeY = -h * 0.62;
  const mood = pose.state === "hurt" || pose.state === "dead" ? "closed" : "normal";
  R.eye(ctx, -6, eyeY, dread ? 5.5 : 4.2, pose, { iris: god ? "#ffe14a" : "#1a1020", mood });
  R.eye(ctx, 10, eyeY, dread ? 6.2 : 4.6, pose, { iris: god ? "#ffe14a" : "#1a1020", mood });
  if (dread) R.eye(ctx, 2, eyeY - 12, 3.4, pose, { iris: flame, mood });

  const mouthW = 10 + open * 16 + (god ? 6 : 0);
  ctx.fillStyle = god ? "#140208" : ink;
  ctx.beginPath();
  ctx.ellipse(4, eyeY + 14, mouthW * 0.55, 3 + open * 10, 0.1, 0, Math.PI * 2);
  ctx.fill();
  if (open > 0.2 || dread) {
    ctx.fillStyle = "#fff6ea";
    const teeth = god ? 6 : 4;
    for (let i = 0; i < teeth; i++) {
      const tx = 4 - mouthW * 0.4 + (i * mouthW * 0.8) / teeth;
      ctx.beginPath();
      ctx.moveTo(tx, eyeY + 12);
      ctx.lineTo(tx + 2, eyeY + 12 + 4 + open * 6);
      ctx.lineTo(tx + 4, eyeY + 12);
      ctx.fill();
    }
  }

  ctx.fillStyle = R.darken(paper, 0.45);
  ctx.fillRect(-8, -h * 0.95, 16, 6);
  ctx.strokeStyle = god ? "#ffd84a" : "#6a3a18";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -h * 0.98, 10 + f, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();

  if (f >= 2) R.star(ctx, w + 6, -h * 0.2, 4, flame);
  if (pose.flourish > 0 && !dread) R.sparkle(ctx, w + 4, -h, 3 + pose.flourish * 3);
  ctx.restore();
}

export default { id: "yomi", draw };

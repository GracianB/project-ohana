// Yomi · chica anime. Adorable de bebé. En GOD la sonrisa no cierra.
const PAL = [
  { skin: "#ffd2c2", hair: "#2a1848", cloth: "#ff7ab8", ribbon: "#fff4a8", eye: "#5b3dd6" },
  { skin: "#ffd0c4", hair: "#3a1860", cloth: "#ff5aa8", ribbon: "#ffe14a", eye: "#6a3cff" },
  { skin: "#ffc8be", hair: "#4a1470", cloth: "#ff3d98", ribbon: "#fff", eye: "#7a48ff" },
  { skin: "#f0b8b4", hair: "#1a0828", cloth: "#c41858", ribbon: "#ff4a6a", eye: "#ff3355" },
  { skin: "#e8b0b8", hair: "#120414", cloth: "#ffd6f0", ribbon: "#ff2040", eye: "#ff2244" },
];

function bow(ctx, R, x, y, s, color) {
  R.ellipse(ctx, x - s, y, s * 0.85, s * 0.55, color, { line: false });
  R.ellipse(ctx, x + s, y, s * 0.85, s * 0.55, color, { line: false });
  R.ellipse(ctx, x, y, s * 0.35, s * 0.35, R.darken(color, 0.15), { line: false });
}

function draw(ctx, pose, R) {
  const f = pose.form | 0;
  const c = PAL[f] || PAL[0];
  const t = pose.t;
  const dread = f >= 3;
  const god = f === 4;
  const run = pose.state === "run";
  const air = pose.state === "jump" || pose.state === "fall" || pose.state === "glide";
  const headR = [28, 25, 23, 24, 26][f];
  const bodyH = [20, 26, 30, 32, 34][f];
  const legL = [14, 18, 20, 20, 18][f];
  const hipY = -legL;
  const bodyY = hipY - bodyH * 0.55;
  const headY = hipY - bodyH - headR * 0.72;
  const sw = run ? Math.sin(pose.phase) : 0;
  let legA = sw * 0.85;
  let legB = -sw * 0.85;
  if (air) { legA = pose.vy < 0 ? -0.7 : 0.4; legB = pose.vy < 0 ? 0.2 : -0.45; }
  let armA = -sw * 0.9;
  let armB = sw * 0.9;
  if (pose.state === "attack") armA = -1.2 + pose.atk * 3.1;
  if (pose.state === "cast") { armA = 2.6; armB = 2.3; }
  if (pose.state === "hurt") { armA = -1.4; armB = 1.3; }
  if (pose.state === "dead") { armA = 0.4; armB = -0.3; legA = 0.2; legB = -0.2; }
  const bob = run ? -Math.abs(Math.cos(pose.phase)) * 3.2 : pose.breath * 1.4;
  const mood = pose.state === "hurt" || pose.state === "dead" ? "closed"
    : pose.state === "attack" ? (dread ? "grin" : "angry")
    : dread && pose.state === "idle" ? "grin"
    : "happy";

  ctx.save();
  ctx.translate(0, bob);

  // lazo que arrastra, como una cola
  const rib = 22 + f * 3;
  R.tail(ctx, -8, bodyY, rib, Math.PI * 0.85,
    (k) => Math.sin(t * 0.14 + k * 2.4) * 2 + pose.sway * 2, 5, 2.2, c.ribbon);

  R.swingLimb(ctx, -5, hipY, legL, legB, 4, 7, c.skin);
  R.swingLimb(ctx, -7, bodyY - 4, 14 + f, armB, -4, 5, c.skin);

  // falda
  R.ellipse(ctx, 0, bodyY + 4, 16 + f, 11 + f * 0.4, c.cloth);
  R.ellipse(ctx, 1, bodyY - 2, 11, bodyH * 0.42, R.lighten(c.cloth, 0.25), { line: false, shade: false });

  R.swingLimb(ctx, 5, hipY, legL, legA, 4, 7, c.skin);

  ctx.save();
  ctx.translate(1, headY + pose.bounce);
  ctx.rotate(pose.state === "hurt" ? -0.3 : run ? 0.08 : Math.sin(t * 0.04) * 0.05);

  // coletas
  const flick = Math.sin(t * 0.12) * 3 + pose.sway * 6;
  R.ellipse(ctx, -headR * 0.15, -headR * 0.2, headR * 1.05, headR * 0.95, c.hair);
  R.blob(ctx, [[-headR * 0.2, -4], [-headR * 1.15, 8 + flick], [-headR * 0.7, 18 + flick]], c.hair, { line: false });
  R.blob(ctx, [[headR * 0.55, -2], [headR * 1.25, 10 - flick * 0.4], [headR * 0.85, 20 - flick * 0.3]], c.hair, { line: false });
  bow(ctx, R, headR * 0.95, -headR * 0.55, 6 + (f === 4 ? 2 : 0), c.ribbon);

  // cara
  R.ellipse(ctx, headR * 0.12, 2, headR * 0.78, headR * 0.82, c.skin);
  const eyeR = headR * (dread ? 0.3 : 0.34);
  R.eye(ctx, headR * 0.05, -2, eyeR, pose, { iris: c.eye, mood: pose.state === "attack" && dread ? "angry" : mood === "closed" ? "closed" : "normal", lash: true });
  R.eye(ctx, headR * 0.55, -1, eyeR * 0.92, pose, { iris: c.eye, mood: "normal", lash: true });
  if (!dread) R.blush(ctx, headR * 0.72, headR * 0.28, 5);
  if (dread) {
    // tercer ojo
    ctx.save();
    ctx.translate(headR * 0.28, -headR * 0.55);
    R.eye(ctx, 0, 0, eyeR * 0.7, pose, { iris: god ? "#ffd84a" : "#ff4466", mood: "normal" });
    ctx.restore();
  }
  const mouthMood = god ? "roar" : dread ? "grin" : (pose.state === "attack" ? "open" : "smile");
  R.mouth(ctx, headR * 0.38, headR * 0.32, headR * (god ? 0.55 : 0.4), mouthMood, { inside: god ? "#2a0410" : "#6b1f2e" });
  ctx.restore();

  R.swingLimb(ctx, 8, bodyY - 2, 15 + f, armA, 4, 5.5, c.skin);

  if (f >= 2) R.star(ctx, headR * 0.2, headY - headR - 8, 5, c.ribbon);
  if (god) R.halo(ctx, 4, headY - headR * 1.15, headR * 0.85, t);
  if (pose.flourish > 0 && !dread) {
    const k = Math.sin(pose.flourish * Math.PI);
    R.sparkle(ctx, 24, headY - 8 - k * 12, 4 + k * 3);
  }
  ctx.restore();
}

export default { id: "yomi", draw };

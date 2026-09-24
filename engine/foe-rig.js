// Poses de los tres bichos "de héroe": idle, walk, telegraph, die.
// El resto de kinds no pasa por aquí (siguen en enemies.js).

function limb(ctx, x1, y1, x2, y2, w, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
function blob(ctx, x, y, rx, ry, color, rot) {
  ctx.save();
  ctx.translate(x, y);
  if (rot) ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, Math.max(0.4, rx), Math.max(0.4, ry), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
function eye(ctx, x, y, r, look, shut) {
  if (shut) {
    ctx.strokeStyle = "#1a1020";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(x - r, y);
    ctx.lineTo(x + r, y);
    ctx.stroke();
    return;
  }
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1020";
  ctx.beginPath();
  ctx.arc(x + (look || 0), y + r * 0.1, r * 0.45, 0, Math.PI * 2);
  ctx.fill();
}

export function foePose(e) {
  if (!e) return "idle";
  if (e.hp <= 0 || (e.dying > 0 && e.deathHold)) return "die";
  if (e.telegraph || e.clawWind > 0 || e.diving) return "telegraph";
  if (Math.abs(e.vx || 0) > 0.35 || e.lunge > 0) return "walk";
  return "idle";
}

function drawCucaracho(ctx, e, t, pose) {
  const walk = pose === "walk" ? Math.sin(t * 0.45) : Math.sin(t * 0.08) * 0.25;
  const shell = e.color || "#c45a18";
  const dark = "#3a1808";
  const die = pose === "die";
  const tel = pose === "telegraph";
  ctx.save();
  if (die) ctx.rotate(0.9);
  if (tel) ctx.translate(4, -2);
  limb(ctx, -6, 3, -14 - walk * 6, die ? 2 : 12, 2.4, dark);
  limb(ctx, -1, 4, -4 + walk * 5, die ? 1 : 13, 2.2, dark);
  limb(ctx, 4, 3, 12 + walk * 6, die ? 2 : 12, 2.4, dark);
  limb(ctx, 8, 2, 16 - walk * 4, die ? 0 : 11, 2, dark);
  blob(ctx, 0, 2, 12, 7, dark);
  blob(ctx, 0, 0, 11, 6.2, shell);
  blob(ctx, 1, 2, 6, 3, "#e08a3a");
  blob(ctx, 10, tel ? -3 : -1, 5.4, 4.4, shell);
  eye(ctx, 12, tel ? -4 : -2, 1.8, tel ? 0.7 : 0.25, die);
  ctx.strokeStyle = dark;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(12, -6);
  ctx.quadraticCurveTo(16, tel ? -16 : -12, 18, tel ? -8 : -9);
  ctx.moveTo(9, -5);
  ctx.quadraticCurveTo(6, -13, 4, -10);
  ctx.stroke();
  if (tel) {
    ctx.strokeStyle = "#ffb070";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(14, 1);
    ctx.lineTo(20, 4);
    ctx.moveTo(14, 3);
    ctx.lineTo(20, 6);
    ctx.stroke();
  }
  if ((e.evo || 0) >= 2) {
    ctx.globalAlpha = 0.55;
    blob(ctx, -2, -8 + walk * 2, 9, 3.5, "#6a3a12", -0.4);
    blob(ctx, 2, -7 - walk * 2, 8, 3, "#6a3a12", 0.3);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function drawMosquito(ctx, e, t, pose) {
  const flap = pose === "die" ? 0.2 : Math.sin(t * (pose === "telegraph" ? 1.1 : 0.6));
  const body = e.color || "#ff6a4a";
  const dark = "#6a140c";
  ctx.save();
  if (pose === "die") ctx.rotate(1.2);
  if (pose === "telegraph") ctx.rotate(0.45);
  ctx.save();
  ctx.globalAlpha = pose === "die" ? 0.2 : 0.5;
  blob(ctx, -2, -9, 14, 4.2 + flap * 2.4, "#f4fff8", -0.35 + flap * 0.2);
  blob(ctx, 2, -7, 11, 3.4 + flap * 1.4, "#dff8ff", 0.4);
  ctx.restore();
  blob(ctx, -7, 3, 8, 4.2, dark);
  blob(ctx, -7, 3, 6.6, 3.2, body);
  blob(ctx, 4, 0, 5.2, 4.4, body);
  blob(ctx, 10, -1, 4, 3.4, body);
  eye(ctx, 11.2, -2, 1.7, pose === "telegraph" ? 0.6 : 0.2, pose === "die");
  ctx.strokeStyle = dark;
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.moveTo(14, 0);
  ctx.lineTo(pose === "telegraph" ? 22 : 18, pose === "telegraph" ? 7 : 3);
  ctx.stroke();
  if (pose === "idle") {
    ctx.globalAlpha = 0.35;
    blob(ctx, 0, 6, 4, 1.2, "#000");
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function drawCangrejo(ctx, e, t, pose) {
  const walk = pose === "walk" ? Math.sin(t * 0.28) : 0;
  const shell = e.color || "#e07040";
  const dark = "#6a2410";
  const open = pose === "telegraph" ? 12 : pose === "die" ? 2 : 5;
  ctx.save();
  if (pose === "die") { ctx.rotate(Math.PI); ctx.translate(0, -4); }
  limb(ctx, -8, 5, -16 - walk * 4, 13, 2.6, dark);
  limb(ctx, -3, 6, -8 + walk * 3, 14, 2.3, dark);
  limb(ctx, 3, 6, 8 - walk * 3, 14, 2.3, dark);
  limb(ctx, 8, 5, 16 + walk * 4, 13, 2.6, dark);
  blob(ctx, 0, 2, 15, 8, dark);
  blob(ctx, 0, 0, 14, 7.2, shell);
  ctx.strokeStyle = "rgba(255,220,160,.4)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(0, -1, 8, 4, 0, Math.PI, 0);
  ctx.stroke();
  limb(ctx, -5, -5, -6, pose === "die" ? -4 : -13, 1.7, dark);
  limb(ctx, 5, -5, 6, pose === "die" ? -4 : -13, 1.7, dark);
  eye(ctx, -6, pose === "die" ? -4 : -14, 2.2, 0.3, pose === "die");
  eye(ctx, 6, pose === "die" ? -4 : -14, 2.2, -0.2, pose === "die");
  ctx.strokeStyle = dark;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(12, 1);
  ctx.lineTo(20, -open * 0.35);
  ctx.moveTo(12, 3);
  ctx.lineTo(20, open * 0.45);
  ctx.moveTo(-12, 1);
  ctx.lineTo(-18, open * 0.2);
  ctx.stroke();
  ctx.restore();
}

const DRAW = {
  cucaracho: drawCucaracho,
  mosquito: drawMosquito,
  cangrejo: drawCangrejo,
};

export function drawFoeRig(ctx, e, t) {
  const fn = DRAW[e.kind];
  if (!fn) return false;
  const pose = foePose(e);
  const s = Math.max(0.75, Math.min(1.8, (e.w || 30) / 34));
  ctx.save();
  ctx.scale((e.vx || 0) >= 0 ? s : -s, s);
  if (pose === "walk") ctx.translate(0, Math.sin(t * 0.5) * 0.6);
  if (pose === "idle") ctx.translate(0, Math.sin(t * 0.12) * 0.8);
  fn(ctx, e, t || 0, pose);
  ctx.restore();
  return true;
}

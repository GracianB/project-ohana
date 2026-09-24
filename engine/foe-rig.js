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
function eye(ctx, x, y, r, look, shut, iris) {
  if (shut) {
    ctx.strokeStyle = "#1a1020";
    ctx.lineWidth = Math.max(1.6, r * 0.4);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - r, y);
    ctx.quadraticCurveTo(x, y + r * 0.45, x + r, y);
    ctx.stroke();
    return;
  }
  ctx.fillStyle = "#fff8ee";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1a1020";
  ctx.lineWidth = Math.max(1, r * 0.22);
  ctx.stroke();
  const lx = (look || 0) * r * 0.45;
  ctx.fillStyle = iris || "#1a1020";
  ctx.beginPath();
  ctx.arc(x + lx, y + r * 0.12, r * 0.48, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x - r * 0.32, y - r * 0.32, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
}

export function foePose(e) {
  if (!e) return "idle";
  if (e.hp <= 0 || (e.dying > 0 && e.deathHold)) return "die";
  if (e.telegraph || e.clawWind > 0 || e.diving || e.hopWind > 0) return "telegraph";
  if (e.lunge > 0 || e.clawSnap > 0) return "lunge";
  if (Math.abs(e.vx || 0) > 0.35) return "walk";
  return "idle";
}

function drawCucaracho(ctx, e, t, pose) {
  const cycle = pose === "walk" ? Math.sin(t * 0.55) : pose === "lunge" ? 0.7 : Math.sin(t * 0.08) * 0.25;
  const shell = e.color || "#c45a18";
  const dark = "#3a1808";
  const die = pose === "die";
  const tel = pose === "telegraph";
  const evo = e.evo || 0;
  const iris = evo >= 2 ? "#ff2020" : "#1a1020";
  ctx.save();
  if (die) ctx.rotate(0.9);
  if (tel) ctx.translate(3, -1);
  const legs = [[-11, 2, -17, 12], [-5, 3, -7, 13], [1, 3, 7, 13], [7, 2, 14, 11]];
  legs.forEach((L, i) => {
    const amp = pose === "walk" ? 11 : pose === "lunge" ? 5 : 1.6;
    limb(ctx, L[0], L[1], L[2] + cycle * (i % 2 ? amp : -amp), die ? 1 : L[3], 2.5, dark);
  });
  blob(ctx, -7, 2, 9, 6.4, dark);
  blob(ctx, -6, 1, 8, 5.5, shell);
  ctx.strokeStyle = "rgba(40,12,0,.5)";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.arc(-9, 1, 4.5, 0.5, 2.5);
  ctx.stroke();
  blob(ctx, 7, tel ? -1 : 1, 7.4, 6.2, dark);
  blob(ctx, 7, tel ? -2 : 0, 6.5, 5.4, evo >= 2 ? "#e23b20" : shell);
  const er = tel ? 3.2 : 2.8;
  eye(ctx, 5, tel ? -3.2 : -1.6, er, tel ? 0.9 : 0.4, die, iris);
  eye(ctx, 10.2, tel ? -3.6 : -2, er + 0.25, tel ? 1 : 0.45, die, iris);
  ctx.strokeStyle = dark;
  ctx.lineWidth = 1.8;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(12, 2);
  ctx.lineTo(tel ? 18 : 15.5, tel ? 6 : 4);
  ctx.moveTo(11, 3.2);
  ctx.lineTo(tel ? 16 : 14.5, tel ? 7 : 5);
  ctx.stroke();
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(9, -5);
  ctx.quadraticCurveTo(14, tel ? -16 : -13, 16, tel ? -8 : -10);
  ctx.moveTo(6, -4.5);
  ctx.quadraticCurveTo(3, -12, 1, -9);
  ctx.stroke();
  if (evo >= 2 && !die) {
    ctx.globalAlpha = 0.55;
    blob(ctx, -4, -8 + cycle * 2, 10, 3.6, "#6a3a12", -0.4);
    blob(ctx, 2, -7 - cycle * 2, 9, 3.2, "#6a3a12", 0.3);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function drawMosquito(ctx, e, t, pose) {
  const rate = pose === "telegraph" ? 1.5 : pose === "walk" ? 1.1 : 0.32;
  const flap = pose === "die" ? 0.15 : Math.sin(t * rate);
  const body = e.color || "#ff6a4a";
  const dark = "#6a140c";
  ctx.save();
  if (pose === "die") ctx.rotate(1.2);
  if (pose === "telegraph") ctx.rotate(0.45);
  ctx.save();
  ctx.globalAlpha = pose === "die" ? 0.2 : 0.5;
  blob(ctx, -2, -9, 14, 3.2 + Math.abs(flap) * 7, "#f4fff8", -0.5 + flap * 0.55);
  blob(ctx, 2, -7, 11, 2.6 + Math.abs(flap) * 5, "#dff8ff", 0.45 - flap * 0.4);
  ctx.restore();
  blob(ctx, -7, 3, 8, 4.2, dark);
  blob(ctx, -7, 3, 6.6, 3.2, body);
  blob(ctx, 4, 0, 5.2, 4.4, body);
  blob(ctx, 10, -1, 5.2, 4.2, body);
  eye(ctx, 9, -2.4, 2.6, pose === "telegraph" ? 0.8 : 0.35, pose === "die", "#3a0810");
  eye(ctx, 13, -2.1, 2.3, pose === "telegraph" ? 0.9 : 0.4, pose === "die", "#3a0810");
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
  const step = pose === "walk" ? Math.sin(t * 0.48) : pose === "lunge" ? 1 : 0;
  const shell = e.color || "#e07040";
  const dark = "#6a2410";
  const open = pose === "telegraph" || pose === "lunge" ? 14 : pose === "die" ? 2 : 4;
  ctx.save();
  if (pose === "die") { ctx.rotate(Math.PI); ctx.translate(0, -4); }
  limb(ctx, -8, 5, -16 - step * 9, 13, 2.6, dark);
  limb(ctx, -3, 6, -8 + step * 7, 14, 2.3, dark);
  limb(ctx, 3, 6, 8 - step * 7, 14, 2.3, dark);
  limb(ctx, 8, 5, 16 + step * 9, 13, 2.6, dark);
  blob(ctx, 0, 2, 15, 8, dark);
  blob(ctx, 0, 0, 14, 7.2, shell);
  ctx.strokeStyle = "rgba(255,220,160,.4)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(0, -1, 8, 4, 0, Math.PI, 0);
  ctx.stroke();
  limb(ctx, -5, -5, -6, pose === "die" ? -4 : -13, 1.7, dark);
  limb(ctx, 5, -5, 6, pose === "die" ? -4 : -13, 1.7, dark);
  eye(ctx, -6, pose === "die" ? -4 : -15, 3.1, 0.35, pose === "die", "#1a1020");
  eye(ctx, 6, pose === "die" ? -4 : -15, 3.1, -0.25, pose === "die", "#1a1020");
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
  const s = Math.max(1, Math.min(1.9, (e.h || 18) / 15));
  ctx.save();
  ctx.scale((e.vx || 0) >= 0 ? s : -s, s);
  const tt = t || 0;
  if (pose === "walk") {
    const hop = Math.abs(Math.sin(tt * 0.5));
    ctx.translate(0, -hop * 2.8);
    ctx.rotate(Math.sin(tt * 0.5) * 0.07);
  } else if (pose === "lunge") {
    ctx.translate(6, -1);
    ctx.scale(1.16, 0.82);
  } else if (pose === "telegraph") {
    const k = 0.5 + Math.sin(tt * 0.8) * 0.5;
    ctx.translate(2, k);
    ctx.scale(1 + k * 0.06, 1 - k * 0.1);
  } else if (pose === "die") {
    ctx.translate(0, 3);
  } else {
    const b = Math.sin(tt * 0.12);
    ctx.translate(0, b * 0.9);
    ctx.scale(1 + b * 0.02, 1 - b * 0.03);
  }
  if ((e.flash || 0) > 6) ctx.translate(-4, 1);
  fn(ctx, e, tt, pose);
  ctx.restore();
  return true;
}

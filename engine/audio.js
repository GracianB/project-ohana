let ctx;
function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}
function tone(f0, f1, dur, vol, wave) {
  const a = ac();
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = wave || "square";
  o.connect(g); g.connect(a.destination);
  const now = a.currentTime;
  o.frequency.setValueAtTime(f0, now);
  if (f1) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), now + dur);
  g.gain.setValueAtTime(vol, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + dur);
  o.start(now); o.stop(now + dur);
}
export function sfx(type) {
  if (type === "jump") tone(280, 420, 0.12, 0.07, "square");
  else if (type === "land") tone(140, 80, 0.08, 0.04, "triangle");
  else if (type === "dash") tone(220, 520, 0.1, 0.06, "sawtooth");
  else if (type === "slash") tone(360, 180, 0.08, 0.05, "square");
  else if (type === "hit") tone(180, 70, 0.16, 0.08, "sawtooth");
  else if (type === "crit") tone(420, 140, 0.18, 0.09, "square");
  else if (type === "evo") tone(220, 880, 0.4, 0.09, "triangle");
  else if (type === "orb") tone(660, 990, 0.12, 0.06, "sine");
  else if (type === "heal") tone(520, 780, 0.16, 0.05, "sine");
  else if (type === "hurt") tone(140, 50, 0.22, 0.09, "square");
  else if (type === "win") {
    const a = ac(); const o = a.createOscillator(); const g = a.createGain();
    o.type = "triangle"; o.connect(g); g.connect(a.destination);
    const now = a.currentTime;
    o.frequency.setValueAtTime(392, now);
    o.frequency.setValueAtTime(523, now + 0.12);
    o.frequency.setValueAtTime(659, now + 0.24);
    g.gain.setValueAtTime(0.08, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    o.start(now); o.stop(now + 0.5);
  }
  else if (type === "door") tone(240, 360, 0.12, 0.04, "triangle");
  else if (type === "locked") tone(90, 60, 0.18, 0.06, "square");
  else if (type === "pause") tone(200, 160, 0.08, 0.03, "sine");
  else if (type === "start") tone(330, 660, 0.2, 0.05, "triangle");
}

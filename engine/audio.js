let ctx;
function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}
export function sfx(type) {
  const a = ac();
  const o = a.createOscillator();
  const g = a.createGain();
  o.connect(g); g.connect(a.destination);
  const now = a.currentTime;
  if (type === "jump") { o.type = "square"; o.frequency.setValueAtTime(280, now); o.frequency.exponentialRampToValueAtTime(420, now + 0.08); g.gain.setValueAtTime(0.07, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.12); o.start(now); o.stop(now + 0.12); }
  else if (type === "hit") { o.type = "sawtooth"; o.frequency.setValueAtTime(180, now); o.frequency.exponentialRampToValueAtTime(70, now + 0.14); g.gain.setValueAtTime(0.08, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.16); o.start(now); o.stop(now + 0.16); }
  else if (type === "evo") { o.type = "triangle"; o.frequency.setValueAtTime(220, now); o.frequency.exponentialRampToValueAtTime(880, now + 0.35); g.gain.setValueAtTime(0.09, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.4); o.start(now); o.stop(now + 0.4); }
  else if (type === "orb") { o.type = "sine"; o.frequency.setValueAtTime(660, now); o.frequency.exponentialRampToValueAtTime(990, now + 0.1); g.gain.setValueAtTime(0.06, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.12); o.start(now); o.stop(now + 0.12); }
  else if (type === "hurt") { o.type = "square"; o.frequency.setValueAtTime(140, now); o.frequency.exponentialRampToValueAtTime(50, now + 0.2); g.gain.setValueAtTime(0.09, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.22); o.start(now); o.stop(now + 0.22); }
  else if (type === "win") { o.type = "triangle"; o.frequency.setValueAtTime(392, now); o.frequency.setValueAtTime(523, now + 0.12); o.frequency.setValueAtTime(659, now + 0.24); g.gain.setValueAtTime(0.08, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.5); o.start(now); o.stop(now + 0.5); }
}

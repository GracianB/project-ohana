// ============================================================================
// AUDIO · efectos sintetizados con WebAudio (sin ficheros)
// sfx(nombre) toca un efecto. setMuted(bool) silencia todo (lo llama game.js).
// Cada efecto es una pequeña "receta" de osciladores, ruido y envolventes.
// ============================================================================
let ctx = null, master = null, noiseBuf = null, muted = false;
const lastPlay = new Map(); // anti-spam por efecto

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 18; comp.ratio.value = 4;
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(comp); comp.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1.2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function setMuted(on) {
  muted = !!on;
  if (master) master.gain.value = muted ? 0 : 0.9;
}
export function isMuted() { return muted; }

// --- primitivas -------------------------------------------------------------
/** Tono con barrido de frecuencia. at = retardo (s). */
function tone(f0, f1, dur, vol, wave = "sine", at = 0, opt = {}) {
  const a = ac(); if (!a) return;
  const t = a.currentTime + at;
  const o = a.createOscillator(), g = a.createGain();
  o.type = wave;
  o.frequency.setValueAtTime(f0, t);
  if (f1) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  if (opt.detune) o.detune.value = opt.detune;
  const atk = opt.attack || 0.005;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + atk);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let node = o;
  if (opt.vibrato) {
    const lfo = a.createOscillator(), lg = a.createGain();
    lfo.frequency.value = opt.vibrato; lg.gain.value = f0 * 0.03;
    lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(t + dur);
  }
  node.connect(g); g.connect(master);
  o.start(t); o.stop(t + dur + 0.02);
}

/** Ráfaga de ruido filtrado (golpes, viento, chisporroteo). */
function noise(dur, vol, at = 0, opt = {}) {
  const a = ac(); if (!a) return;
  const t = a.currentTime + at;
  const s = a.createBufferSource(); s.buffer = noiseBuf;
  const f = a.createBiquadFilter();
  f.type = opt.type || "bandpass";
  f.frequency.setValueAtTime(opt.f0 || 1200, t);
  if (opt.f1) f.frequency.exponentialRampToValueAtTime(opt.f1, t + dur);
  f.Q.value = opt.q || 1;
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + (opt.attack || 0.005));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(master);
  s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
}

/** Arpegio de notas (Hz). */
function arp(notes, step, dur, vol, wave = "triangle", at = 0) {
  notes.forEach((n, i) => tone(n, 0, dur, vol, wave, at + i * step));
}
/** Acorde (varias notas a la vez, con brillo). */
function chord(notes, dur, vol, wave = "triangle", at = 0) {
  notes.forEach((n) => { tone(n, 0, dur, vol, wave, at, { attack: 0.02 }); tone(n * 2, 0, dur * 0.7, vol * 0.25, "sine", at, { attack: 0.02 }); });
}
const N = (semi) => 440 * Math.pow(2, semi / 12); // semitonos desde La4

// --- banco de efectos ---------------------------------------------------------
const BANK = {
  // movimiento
  jump: () => { tone(300, 520, 0.12, 0.07, "square"); tone(600, 900, 0.08, 0.02, "sine"); },
  land: () => noise(0.08, 0.08, 0, { type: "lowpass", f0: 600 }),
  dash: () => { noise(0.18, 0.1, 0, { f0: 800, f1: 3000, q: 0.7 }); tone(220, 520, 0.1, 0.03, "sawtooth"); },
  // combate
  slash: () => noise(0.12, 0.12, 0, { f0: 3000, f1: 900, q: 1.2 }),
  hit: () => { tone(200, 70, 0.14, 0.1, "square"); noise(0.08, 0.1, 0, { type: "lowpass", f0: 1500 }); },
  crit: () => { tone(520, 140, 0.2, 0.1, "square"); noise(0.12, 0.12, 0, { f0: 2500 }); tone(1200, 0, 0.1, 0.04, "sine", 0.02); },
  hurt: () => { tone(160, 60, 0.25, 0.1, "square"); tone(120, 50, 0.25, 0.06, "sawtooth", 0.02); },
  kill: () => { tone(500, 1200, 0.1, 0.05, "square"); noise(0.2, 0.08, 0, { f0: 1800, f1: 400 }); },
  // recogidas
  orb: () => { tone(N(7) * 2, 0, 0.09, 0.06, "sine"); tone(N(12) * 2, 0, 0.14, 0.06, "sine", 0.06); },
  heal: () => arp([N(3), N(7), N(10), N(15)], 0.06, 0.18, 0.05, "sine"),
  magic: () => { arp([N(12), N(16), N(19), N(24), N(28)], 0.05, 0.3, 0.05, "triangle"); noise(0.5, 0.03, 0.05, { type: "highpass", f0: 5000 }); },
  block: () => { tone(900, 600, 0.18, 0.06, "sine", 0, { vibrato: 18 }); noise(0.1, 0.05, 0, { type: "highpass", f0: 4000 }); },
  // mundo / UI
  door: () => { tone(240, 360, 0.14, 0.05, "triangle"); noise(0.2, 0.03, 0, { f0: 500, f1: 1500 }); },
  locked: () => { tone(110, 90, 0.12, 0.08, "square"); tone(110, 80, 0.14, 0.08, "square", 0.14); },
  pause: () => tone(400, 300, 0.1, 0.04, "sine"),
  ui: () => tone(N(19), 0, 0.05, 0.04, "sine"),
  select: () => { tone(N(12), 0, 0.07, 0.05, "triangle"); tone(N(19), 0, 0.1, 0.05, "triangle", 0.05); },
  start: () => { arp([N(0), N(4), N(7), N(12)], 0.07, 0.25, 0.06, "triangle"); noise(0.6, 0.03, 0.1, { f0: 800, f1: 5000 }); },
  // objetivo cumplido / sala nueva / aviso
  objective: () => { arp([N(7), N(11), N(14)], 0.08, 0.2, 0.06, "square"); chord([N(19), N(23), N(26)], 0.6, 0.035, "triangle", 0.26); },
  room: () => { tone(N(0), 0, 0.3, 0.035, "sine"); tone(N(7), 0, 0.4, 0.035, "sine", 0.1); },
  alert: () => { tone(N(-5), 0, 0.14, 0.07, "square"); tone(N(-5), 0, 0.14, 0.07, "square", 0.2); tone(N(-8), 0, 0.3, 0.07, "square", 0.4); },
  boss: () => { tone(90, 45, 1.2, 0.12, "sawtooth"); noise(1.2, 0.08, 0, { type: "lowpass", f0: 400, f1: 120 }); tone(135, 60, 1.0, 0.06, "square", 0.1); },
  win: () => { arp([N(0), N(4), N(7), N(12), N(16)], 0.1, 0.35, 0.07, "triangle"); chord([N(12), N(16), N(19), N(24)], 1.4, 0.05, "triangle", 0.55); },
  // evolución (la cinemática llama a cada fase en su momento)
  evo: () => BANK.evoCharge(),
  evoCharge: () => { tone(120, 900, 1.3, 0.05, "sawtooth", 0, { attack: 0.3 }); tone(180, 1350, 1.3, 0.03, "square", 0, { attack: 0.3 }); noise(1.3, 0.05, 0, { f0: 300, f1: 6000, q: 2, attack: 0.4 }); },
  evoFlash: () => { noise(0.9, 0.2, 0, { type: "lowpass", f0: 3000, f1: 200 }); tone(80, 40, 0.8, 0.16, "sine"); tone(1600, 400, 0.4, 0.05, "square"); },
  evoFanfare: () => { arp([N(0), N(4), N(7), N(12)], 0.09, 0.3, 0.07, "square"); chord([N(12), N(16), N(19)], 1.6, 0.06, "triangle", 0.38); arp([N(24), N(28), N(31)], 0.06, 0.25, 0.03, "sine", 0.4); },
  godFanfare: () => { arp([N(0), N(4), N(7), N(11), N(14)], 0.1, 0.4, 0.07, "square"); chord([N(12), N(16), N(19), N(23)], 2.4, 0.07, "triangle", 0.5); chord([N(24), N(28), N(31)], 2.0, 0.03, "sine", 0.6); noise(2, 0.03, 0.5, { type: "highpass", f0: 6000 }); },
  // portada
  title: () => { chord([N(-12), N(-5), N(0)], 2.2, 0.05, "triangle"); arp([N(12), N(16), N(19), N(24), N(19), N(16)], 0.16, 0.5, 0.035, "sine", 0.3); },
  whoosh: () => noise(0.5, 0.08, 0, { f0: 300, f1: 3000, q: 0.8, attack: 0.15 }),

  // --- habilidades (id de ABILITY_DEFS) ---
  plasma: () => { for (let i = 0; i < 3; i++) tone(1400, 300, 0.09, 0.05, "square", i * 0.07); },
  rollo: () => { noise(0.4, 0.08, 0, { type: "lowpass", f0: 700, f1: 300 }); tone(160, 120, 0.4, 0.04, "sawtooth"); },
  caos: () => { tone(200, 900, 0.3, 0.06, "square", 0, { vibrato: 12 }); tone(900, 200, 0.3, 0.05, "square", 0.3); noise(0.6, 0.05, 0, { f0: 1500 }); },
  chain: () => { noise(0.25, 0.12, 0, { type: "highpass", f0: 2500 }); tone(2000, 300, 0.2, 0.05, "sawtooth", 0, { vibrato: 40 }); },
  blink: () => { tone(300, 2400, 0.12, 0.06, "sine"); tone(2400, 600, 0.12, 0.04, "sine", 0.12); },
  storm: () => { noise(1.0, 0.14, 0, { type: "lowpass", f0: 900, f1: 120 }); tone(70, 40, 0.8, 0.08, "sawtooth"); },
  bite: () => { noise(0.07, 0.14, 0, { type: "lowpass", f0: 1200 }); tone(260, 90, 0.12, 0.09, "square", 0.02); },
  charge: () => { tone(80, 160, 0.5, 0.09, "sawtooth"); noise(0.5, 0.08, 0, { type: "lowpass", f0: 500 }); },
  quake: () => { tone(60, 30, 1.0, 0.16, "sine"); noise(1.0, 0.14, 0, { type: "lowpass", f0: 400, f1: 80 }); },
  salt: () => { for (let i = 0; i < 5; i++) noise(0.05, 0.07, i * 0.035, { type: "highpass", f0: 5000 }); },
  ketchup: () => { noise(0.25, 0.12, 0, { type: "lowpass", f0: 800, f1: 200 }); tone(200, 90, 0.2, 0.05, "sine"); },
  fryer: () => { noise(1.1, 0.07, 0, { type: "highpass", f0: 3000, attack: 0.1 }); tone(150, 300, 0.4, 0.04, "sawtooth"); },
  ukulele: () => arp([N(7), N(11), N(14)], 0.05, 0.3, 0.06, "triangle"),
  hula: () => noise(0.5, 0.07, 0, { f0: 600, f1: 2000, q: 1.5 }),
  ohana: () => chord([N(0), N(4), N(7), N(12)], 1.2, 0.05, "sine"),
  yarn: () => { tone(500, 800, 0.15, 0.05, "triangle"); tone(800, 500, 0.15, 0.04, "triangle", 0.15); },
  purr: () => { tone(55, 60, 0.9, 0.12, "sawtooth", 0, { vibrato: 22 }); tone(N(12), 0, 0.3, 0.03, "sine", 0.3); },
  ninetails: () => arp([N(12), N(15), N(19), N(22), N(24), N(27), N(31), N(34), N(36)], 0.04, 0.2, 0.03, "sine"),
  breath: () => noise(0.6, 0.12, 0, { f0: 700, f1: 300, q: 0.6, attack: 0.05 }),
  gust: () => noise(0.5, 0.1, 0, { f0: 500, f1: 2500, q: 0.8, attack: 0.08 }),
  meteor: () => { tone(1200, 100, 0.8, 0.06, "sawtooth"); noise(0.9, 0.1, 0.4, { type: "lowpass", f0: 600, f1: 100 }); },
  pepperoni: () => { tone(400, 700, 0.1, 0.05, "square"); noise(0.2, 0.04, 0, { f0: 2000 }); },
  cheese: () => { tone(200, 700, 0.35, 0.06, "sine", 0, { vibrato: 8 }); },
  oven: () => { noise(1.0, 0.08, 0, { type: "lowpass", f0: 1200, f1: 400, attack: 0.2 }); tone(90, 70, 1.0, 0.05, "sawtooth"); },
  // pasivos
  pound: () => { tone(70, 35, 0.6, 0.15, "sine"); noise(0.5, 0.12, 0, { type: "lowpass", f0: 500, f1: 100 }); },
  slide: () => noise(0.35, 0.06, 0, { f0: 1500, f1: 700, q: 0.8 }),
  bounce: () => tone(200, 600, 0.15, 0.07, "sine"),
  climb: () => tone(700, 900, 0.04, 0.02, "square"),
  spark: () => noise(0.08, 0.04, 0, { type: "highpass", f0: 6000 }),
  lives: () => { arp([N(12), N(7), N(12), N(19)], 0.08, 0.3, 0.06, "triangle"); },
};

/** Toca un efecto por nombre (ignora nombres desconocidos). */
export function sfx(type) {
  if (muted) return;
  const fn = BANK[type];
  if (!fn) return;
  const now = performance.now();
  if (now - (lastPlay.get(type) || 0) < 45) return; // evita apilar el mismo sonido
  lastPlay.set(type, now);
  try { fn(); } catch (_) { /* audio no disponible */ }
}

export const SFX_NAMES = Object.keys(BANK);

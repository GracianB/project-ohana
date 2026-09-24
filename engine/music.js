// ============================================================================
// MÚSICA · secuenciador procedural con WebAudio (composiciones originales)
// ----------------------------------------------------------------------------
// playMusic("costa") → cambia de tema con fundido. Cada tema define tempo,
// escala, progresión de acordes, capas (pad, bajo, arpegio, melodía,
// percusión) y un "instrumento" para la melodía. Las melodías se generan una
// vez con una semilla fija (siempre suenan igual) a partir de los acordes.
// Comparte contexto y bus maestro con engine/audio.js (el mute afecta a todo).
// ============================================================================
import { audioGraph } from "./audio.js";

const LOOKAHEAD = 0.15;   // s que se programan por adelantado
const TICK_MS = 30;
const MUSIC_VOL = 0.26;

// ---------------------------------------------------------------------------
// Temas. Notas en semitonos relativos a la tónica (root, en MIDI).
// chords: [grado en semitonos, "maj"|"min"|"sus"|"dim"] por compás.
// drums: 16 pasos por compás: k = bombo, s = caja, h = charles, o = abierto.
// ---------------------------------------------------------------------------
const THEMES = {
  title: {
    bpm: 84, root: 60, scale: "major", swing: 0,
    chords: [[0, "maj"], [9, "min"], [5, "maj"], [7, "sus"]],
    pad: 0.5, bass: "..x.....x.......", arp: "x.x.x.x.x.x.x.x.", arpInst: "bell",
    melody: { rhythm: "x.....x...x.....", inst: "flute", oct: 12, seed: 7 },
    drums: null,
  },
  claro: {
    bpm: 112, root: 55, scale: "major", swing: 0.12,
    chords: [[0, "maj"], [9, "min"], [5, "maj"], [7, "maj"]],
    pad: 0.25, bass: "x...x.x.x...x.x.", arp: null,
    melody: { rhythm: "x.x...x.x.x.x...", inst: "pluck", oct: 12, seed: 11 },
    drums: { k: "x.......x.......", s: "....x.......x...", h: "..x...x...x...x." },
  },
  costa: {
    bpm: 104, root: 53, scale: "major", swing: 0.18,
    chords: [[0, "maj"], [5, "maj"], [7, "maj"], [5, "maj"]],
    pad: 0.2, bass: "x..x..x.x..x..x.", arp: "x.xx.xx.x.xx.xx.", arpInst: "uke",
    melody: { rhythm: "x...x.x...x.x.x.", inst: "flute", oct: 12, seed: 23 },
    drums: { k: "x.....x...x.....", s: "....x.......x...", h: "hhhhhhhhhhhhhhhh" },
  },
  jungla: {
    bpm: 118, root: 50, scale: "dorian", swing: 0.1,
    chords: [[0, "min"], [10, "maj"], [5, "maj"], [7, "min"]],
    pad: 0.15, bass: "x..x...xx..x..x.", arp: "x.x.xx.x.x.xx.x.", arpInst: "marimba",
    melody: { rhythm: "x..x..x.x.....x.", inst: "marimba", oct: 12, seed: 31 },
    drums: { k: "x..x....x..x....", s: "....x..x....x...", h: "x.x.x.x.x.x.x.xx" },
  },
  caldera: {
    bpm: 128, root: 52, scale: "minor", swing: 0,
    chords: [[0, "min"], [8, "maj"], [3, "maj"], [10, "maj"]],
    pad: 0.3, bass: "x.xxx.xxx.xxx.xx", arp: null,
    melody: { rhythm: "x...x...x.x.x...", inst: "lead", oct: 12, seed: 43 },
    drums: { k: "x...x...x...x...", s: "....x.......x..x", h: "..x...x...x...x." },
  },
  cumbre: {
    bpm: 96, root: 57, scale: "minor", swing: 0,
    chords: [[0, "min"], [5, "min"], [10, "maj"], [3, "maj"]],
    pad: 0.45, bass: "x.......x.......", arp: "x.xx.xx.x.xx.xx.", arpInst: "synth",
    melody: { rhythm: "x.......x...x...", inst: "flute", oct: 12, seed: 59 },
    drums: { k: "x.........x.....", s: "....x.......x...", h: "x.x.x.x.x.x.x.x." },
  },
  cueva: {
    bpm: 88, root: 48, scale: "minor", swing: 0,
    chords: [[0, "min"], [8, "maj"], [5, "min"], [7, "min"]],
    pad: 0.4, bass: "x.......x...x...", arp: "x...x...x...x...", arpInst: "bell",
    melody: { rhythm: "x.....x.........", inst: "bell", oct: 24, seed: 67 },
    drums: { k: "x.......x.......", s: null, h: "....x.......x..." },
  },
  abismo: {
    bpm: 76, root: 50, scale: "minor", swing: 0,
    chords: [[0, "min"], [10, "maj"], [8, "maj"], [7, "sus"]],
    pad: 0.55, bass: "x...........x...", arp: "x..x..x..x..x..x", arpInst: "bell",
    melody: { rhythm: "x.......x.......", inst: "flute", oct: 12, seed: 71 },
    drums: null,
  },
  jefe: {
    bpm: 148, root: 52, scale: "phrygian", swing: 0,
    chords: [[0, "min"], [1, "maj"], [0, "min"], [10, "min"]],
    pad: 0.3, bass: "xxx.xxx.xx.xxx.x", arp: "xxxxxxxxxxxxxxxx", arpInst: "synth",
    melody: { rhythm: "x..x..x.x..x..x.", inst: "lead", oct: 12, seed: 97 },
    drums: { k: "x..x..x.x..x..x.", s: "....x.......x...", h: "xxxxxxxxxxxxxxxx" },
  },
  jefe3: {
    bpm: 166, root: 52, scale: "phrygian", swing: 0,
    chords: [[0, "min"], [1, "maj"], [3, "maj"], [1, "maj"]],
    pad: 0.35, bass: "xxxxxxxxxxxxxxxx", arp: "xxxxxxxxxxxxxxxx", arpInst: "synth",
    melody: { rhythm: "x.xx.xx.x.xx.xxx", inst: "lead", oct: 12, seed: 101 },
    drums: { k: "x.x.x.x.x.x.x.x.", s: "....x..x....x.xx", h: "xxxxxxxxxxxxxxxx" },
  },
  victoria: {
    bpm: 100, root: 60, scale: "major", swing: 0.08,
    chords: [[0, "maj"], [5, "maj"], [9, "min"], [7, "maj"]],
    pad: 0.4, bass: "x...x...x...x...", arp: "x.x.x.x.x.x.x.x.", arpInst: "bell",
    melody: { rhythm: "x.x.x...x.x.x...", inst: "flute", oct: 12, seed: 5 },
    drums: { k: "x.......x.......", s: "....x.......x...", h: "..x...x...x...x." },
  },
};

// Sala → tema
const ROOM_THEME = {
  hub: "claro", beach: "costa", jungle: "jungla", cave: "cueva", lab: "cueva",
  ridge: "cumbre", space: "cumbre", reef: "abismo", volcano: "caldera", boss: "jefe",
};
export function themeForRoom(id) { return ROOM_THEME[id] || "claro"; }

const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
};
const CHORD = { maj: [0, 4, 7], min: [0, 3, 7], sus: [0, 5, 7], dim: [0, 3, 6] };
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

// ---------------------------------------------------------------------------
// Melodía determinista: notas de acorde en tiempos fuertes, pasos de escala
// en los débiles, frase de 4 compases que se repite con variación.
// ---------------------------------------------------------------------------
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}
function buildMelody(th) {
  const m = th.melody;
  const R = rng(m.seed);
  const scale = SCALES[th.scale];
  const bars = th.chords.length * 2; // frase + variación
  const out = [];
  let deg = 7; // índice en escala extendida (tónica +1 octava)
  const ext = [];
  for (let o = -1; o < 3; o++) for (const s of scale) ext.push(s + o * 12);
  const nearest = (semi) => { let bi = 0; for (let i = 0; i < ext.length; i++) if (Math.abs(ext[i] - semi) < Math.abs(ext[bi] - semi)) bi = i; return bi; };
  for (let b = 0; b < bars; b++) {
    const [cr, cq] = th.chords[b % th.chords.length];
    const tones = CHORD[cq].map((x) => x + cr);
    const variation = b >= th.chords.length;
    for (let s = 0; s < 16; s++) {
      if (m.rhythm[s] !== "x" || (variation && s === 14 && R() < 0.5)) { out.push(null); continue; }
      const strong = s % 4 === 0;
      if (strong) {
        // salta a la nota del acorde más cercana
        const target = tones[Math.floor(R() * tones.length)] + 12;
        const cand = [nearest(target), nearest(target + 12), nearest(target - 12)];
        cand.sort((a, c) => Math.abs(a - deg) - Math.abs(c - deg));
        deg = cand[0];
      } else {
        deg += R() < 0.5 ? 1 : -1;
        if (R() < 0.2) deg += R() < 0.5 ? 2 : -2;
      }
      deg = Math.max(4, Math.min(ext.length - 4, deg));
      // la última nota de la frase vuelve a la tónica
      if (b === bars - 1 && s >= 12) deg = nearest(12);
      out.push(ext[deg]);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Instrumentos
// ---------------------------------------------------------------------------
function voice(g, dest, t, freq, dur, vol, kind) {
  const { ctx } = g;
  const env = ctx.createGain();
  env.connect(dest);
  const oscs = [];
  const add = (type, f, v, det = 0) => {
    const o = ctx.createOscillator();
    o.type = type; o.frequency.value = f; o.detune.value = det;
    const gg = ctx.createGain(); gg.gain.value = v;
    o.connect(gg); gg.connect(env); oscs.push(o);
    return o;
  };
  let atk = 0.005, rel = dur;
  switch (kind) {
    case "pluck": add("triangle", freq, 1); add("sine", freq * 2, 0.35); rel = Math.min(dur, 0.35); break;
    case "uke": add("triangle", freq, 1); add("square", freq, 0.08); rel = 0.22; break;
    case "marimba": add("sine", freq, 1); add("sine", freq * 4, 0.25); rel = 0.28; break;
    case "bell": add("sine", freq, 1); add("sine", freq * 2.76, 0.3); add("sine", freq * 5.4, 0.1); rel = Math.max(0.6, dur); break;
    case "flute": { atk = 0.04; const o = add("sine", freq, 1); add("triangle", freq, 0.3);
      const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 5.5; lg.gain.value = freq * 0.012;
      l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur + 0.1); break; }
    case "lead": atk = 0.01; add("square", freq, 0.55); add("sawtooth", freq, 0.35, 7); break;
    case "synth": add("sawtooth", freq, 0.5); add("square", freq / 2, 0.3); rel = Math.min(dur, 0.18); break;
    case "bass": add("triangle", freq, 1); add("square", freq, 0.15); rel = Math.min(dur, 0.4); break;
    case "pad": atk = 0.35; add("sawtooth", freq, 0.35, -8); add("sawtooth", freq, 0.35, 8); add("triangle", freq / 2, 0.4); break;
    default: add("sine", freq, 1);
  }
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(vol, t + atk);
  if (kind === "pad") { env.gain.setValueAtTime(vol, t + dur - 0.3); }
  env.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(atk + 0.02, rel));
  for (const o of oscs) { o.start(t); o.stop(t + Math.max(atk + 0.05, rel) + 0.05); }
}

function drum(g, dest, t, type, vol) {
  const { ctx, noiseBuf } = g;
  if (type === "k") {
    const o = ctx.createOscillator(), e = ctx.createGain();
    o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.14);
    e.gain.setValueAtTime(vol, t); e.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.connect(e); e.connect(dest); o.start(t); o.stop(t + 0.22);
    return;
  }
  const s = ctx.createBufferSource(); s.buffer = noiseBuf;
  const f = ctx.createBiquadFilter(), e = ctx.createGain();
  const dur = type === "s" ? 0.14 : type === "o" ? 0.16 : 0.04;
  f.type = type === "s" ? "bandpass" : "highpass";
  f.frequency.value = type === "s" ? 1800 : 7000;
  e.gain.setValueAtTime(vol * (type === "s" ? 0.8 : 0.35), t);
  e.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(e); e.connect(dest);
  s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  if (type === "s") {
    const o = ctx.createOscillator(), oe = ctx.createGain();
    o.type = "triangle"; o.frequency.value = 190;
    oe.gain.setValueAtTime(vol * 0.35, t); oe.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    o.connect(oe); oe.connect(dest); o.start(t); o.stop(t + 0.1);
  }
}

// ---------------------------------------------------------------------------
// Reproductor
// ---------------------------------------------------------------------------
let current = null;   // { name, th, melody, bus, step, next, timer }
let wanted = null;
let duck = 1;

function startTheme(name) {
  const g = audioGraph();
  if (!g) return;
  const th = THEMES[name];
  if (!th) return;
  const { ctx, master } = g;
  const bus = ctx.createGain();
  bus.gain.setValueAtTime(0.0001, ctx.currentTime);
  bus.gain.exponentialRampToValueAtTime(MUSIC_VOL * duck, ctx.currentTime + 1.2);
  // un poco de "sala" con un delay suave
  const dl = ctx.createDelay(0.5), fb = ctx.createGain(), wet = ctx.createGain();
  dl.delayTime.value = (60 / th.bpm) * 0.75; fb.gain.value = 0.25; wet.gain.value = 0.18;
  bus.connect(master); bus.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(master);
  const st = { name, th, melody: buildMelody(th), bus, step: 0, next: ctx.currentTime + 0.1, g };
  st.timer = setInterval(() => schedule(st), TICK_MS);
  current = st;
}

function stopTheme(st, fade = 1) {
  if (!st) return;
  clearInterval(st.timer);
  const { ctx } = st.g;
  try {
    st.bus.gain.cancelScheduledValues(ctx.currentTime);
    st.bus.gain.setValueAtTime(Math.max(0.0001, st.bus.gain.value), ctx.currentTime);
    st.bus.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + fade);
  } catch (_) {}
  setTimeout(() => { try { st.bus.disconnect(); } catch (_) {} }, fade * 1000 + 300);
}

function schedule(st) {
  const { ctx } = st.g;
  const th = st.th;
  const sixteenth = 60 / th.bpm / 4;
  while (st.next < ctx.currentTime + LOOKAHEAD) {
    const s = st.step % 16;
    const bar = Math.floor(st.step / 16);
    const [cr, cq] = th.chords[bar % th.chords.length];
    const chord = CHORD[cq].map((x) => x + cr);
    let t = st.next;
    if (th.swing && s % 2 === 1) t += sixteenth * th.swing;
    const barLen = sixteenth * 16;
    // pad: un acorde por compás
    if (th.pad && s === 0) for (const n of chord) voice(st.g, st.bus, t, hz(th.root + n), barLen, 0.05 * th.pad, "pad");
    // bajo
    if (th.bass && th.bass[s] === "x") voice(st.g, st.bus, t, hz(th.root - 12 + (s % 8 === 6 ? chord[2] : chord[0])), sixteenth * 2, 0.16, "bass");
    // arpegio
    if (th.arp && th.arp[s] === "x") {
      const n = chord[(st.step) % chord.length] + 12 + (Math.floor(s / 4) % 2 ? 12 : 0);
      voice(st.g, st.bus, t, hz(th.root + n), sixteenth * 1.5, 0.05, th.arpInst || "pluck");
    }
    // melodía
    const mn = st.melody[st.step % st.melody.length];
    if (mn != null) {
      let len = 1; while (len < 6 && st.melody[(st.step + len) % st.melody.length] == null) len++;
      voice(st.g, st.bus, t, hz(th.root + th.melody.oct + mn), sixteenth * len * 0.95, 0.075, th.melody.inst);
    }
    // percusión
    if (th.drums) {
      if (th.drums.k && th.drums.k[s] === "x") drum(st.g, st.bus, t, "k", 0.5);
      if (th.drums.s && th.drums.s[s] === "x") drum(st.g, st.bus, t, "s", 0.3);
      if (th.drums.h && th.drums.h[s] !== ".") drum(st.g, st.bus, t, th.drums.h[s] === "o" ? "o" : "h", 0.25);
    }
    st.step++;
    st.next += sixteenth;
  }
}

/** Cambia al tema indicado (null = silencio). No hace nada si ya suena. */
export function playMusic(name) {
  wanted = name;
  if (current && current.name === name) return;
  const old = current;
  current = null;
  stopTheme(old, 0.9);
  if (name) startTheme(name);
}
export function stopMusic() { playMusic(null); }
export function currentMusic() { return current ? current.name : null; }

/** Baja la música (pausa, cinemáticas) o la devuelve a su nivel. */
export function duckMusic(on) {
  duck = on ? 0.35 : 1;
  if (!current) return;
  const { ctx } = current.g;
  try {
    current.bus.gain.cancelScheduledValues(ctx.currentTime);
    current.bus.gain.setTargetAtTime(MUSIC_VOL * duck, ctx.currentTime, 0.25);
  } catch (_) {}
}

// Los navegadores no dejan sonar sin gesto: si se pidió música antes, arranca
// con la primera interacción.
function unlock() {
  const g = audioGraph();
  if (g && wanted && !current) startTheme(wanted);
}
addEventListener("pointerdown", unlock, { capture: true });
addEventListener("keydown", unlock, { capture: true });

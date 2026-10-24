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
let musicLevel = 1;
try {
  const saved = globalThis.localStorage?.getItem("ohana-music-volume");
  if (saved !== null && saved !== undefined && Number.isFinite(Number(saved))) musicLevel = Math.max(0, Math.min(1, Number(saved)));
} catch (_) {}
export function musicVolume() { return musicLevel; }
export function setMusicVolume(value) {
  if (!Number.isFinite(Number(value))) return musicLevel;
  musicLevel = Math.max(0, Math.min(1, Number(value)));
  try { globalThis.localStorage?.setItem("ohana-music-volume", String(musicLevel)); } catch (_) {}
  if (current) {
    const { ctx } = current.g;
    current.bus.gain.cancelScheduledValues(ctx.currentTime);
    current.bus.gain.setTargetAtTime(MUSIC_VOL * duck * musicLevel, ctx.currentTime, 0.08);
  }
  return musicLevel;
}

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
  lab: {
    bpm: 102, root: 56, scale: "minor", swing: 0,
    chords: [[0, "min"], [7, "maj"], [3, "maj"], [10, "min"]],
    pad: 0.32, bass: "x..x..x.x..x..x.", arp: "x.x.x.x.x.x.x.x.", arpInst: "synth",
    melody: { rhythm: "x...x.x...x.x...", inst: "bell", oct: 12, seed: 81 },
    drums: { k: "x.......x.......", s: "....x.......x...", h: "x.x.x.x.x.x.x.x." },
  },
  orbita: {
    bpm: 90, root: 58, scale: "minor", swing: 0,
    chords: [[0, "min"], [5, "min"], [8, "maj"], [3, "maj"]],
    pad: 0.5, bass: "x.......x...x...", arp: "x...x...x...x...", arpInst: "bell",
    melody: { rhythm: "x.....x...x.....", inst: "flute", oct: 24, seed: 89 },
    drums: { k: "x...........x...", s: null, h: "....x.......x..." },
  },
  victoria: {
    bpm: 100, root: 60, scale: "major", swing: 0.08,
    chords: [[0, "maj"], [5, "maj"], [9, "min"], [7, "maj"]],
    pad: 0.4, bass: "x...x...x...x...", arp: "x.x.x.x.x.x.x.x.", arpInst: "bell",
    melody: { rhythm: "x.x.x...x.x.x...", inst: "flute", oct: 12, seed: 5 },
    drums: { k: "x.......x.......", s: "....x.......x...", h: "..x...x...x...x." },
  },
};

// Ten authored variations, one identity per World 1 room. Legacy scores stay intact.
const WORLD1_SCORES = {
 kilo:['claro',106,55,[0,2,4,2,1,0,4,2]],
 stitcho:['lab',116,50,[0,4,2,5,3,1,4,0]],
 chispin:['cumbre',128,62,[0,2,5,4,2,6,4,1]],
 cat:['orbita',82,57,[0,4,3,1,5,3,2,0]],
 cuerno:['cueva',92,60,[0,2,4,6,5,3,1,0]],
 dragon:['caldera',120,48,[0,3,2,5,4,2,1,0]],
 dino:['jungla',100,43,[0,0,3,2,4,1,3,0]],
 frita:['costa',124,58,[0,2,1,4,3,5,2,0]],
 pizza:['costa',114,53,[0,1,4,2,5,4,1,0]],
 yomi:['abismo',88,59,[0,3,5,2,6,4,1,0]]
};
for(const [hero,[base,bpm,root,motif]] of Object.entries(WORLD1_SCORES)){
 THEMES['w1-'+hero]={...THEMES[base],bpm,root,motif,swing:hero==='frita'?.14:THEMES[base].swing,
  melody:{...THEMES[base].melody},chords:THEMES[base].chords.map(chord=>[...chord])};
}
export function world1MusicProfile(hero){
 const theme=THEMES['w1-'+hero];return theme?{name:'w1-'+hero,bpm:theme.bpm,root:theme.root,motif:[...theme.motif]}:null;
}

// Sala → tema
const ROOM_THEME = {
  hub: "claro", beach: "costa", jungle: "jungla", cave: "cueva",
  ridge: "cumbre", space: "orbita", reef: "abismo", volcano: "caldera", boss: "jefe", lab: "lab",
};
export function themeForRoom(id) { return id==="w1-final"?"jefe":THEMES[id]?id:ROOM_THEME[id] || "claro"; }

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
const MOTIFS={title:[0,2,4,2,1,0,4,2],claro:[0,2,4,2,1,0,4,2],victoria:[0,2,4,5,4,2,1,0],costa:[0,1,2,4,2,1,4,2],jungla:[0,2,3,4,2,3,1,0],jefe:[0,1,0,4,3,1,4,0],jefe3:[0,1,3,4,3,1,4,0]};
function buildMelody(th){
 const name=Object.keys(THEMES).find(k=>THEMES[k]===th),motif=th.motif||MOTIFS[name]||[0,2,1,4,3,2,1,0],scale=SCALES[th.scale],out=[];
 for(let bar=0;bar<th.chords.length*4;bar++){
  const [root,quality]=th.chords[bar%th.chords.length],tones=CHORD[quality].map(n=>n+root);
  let phraseNote=0;
  for(let step=0;step<16;step++){
   if(th.melody.rhythm[step]!=='x'||(bar%4===3&&step>12)){out.push(null);continue;}
   const degree=motif[(phraseNote+++(bar%4)*2)%motif.length],answer=bar%8>=4;
   let note=scale[degree]+(answer&&degree<2?12:0);
   if(step%4===0){const choices=tones.flatMap(n=>[n-12,n,n+12]).filter(n=>n>=0&&n<=16);note=choices.reduce((a,b)=>Math.abs(b-note)<Math.abs(a-note)?b:a,choices[0]);}
   if(bar%4===3&&step>=12)note=0;
   out.push(note);
  }
 }
 return out;
}
export function musicPhrase(name){return THEMES[name]?buildMelody(THEMES[name]):[];}
export function musicArrangement(bar,boss=false){
 const section=Math.floor((((bar%16)+16)%16)/4);
 return {melody:[.86,1,1,.82][section],bass:[.65,.85,1,.7][section],arp:[.55,.8,1,.45][section],drums:boss?[.85,1,1,.8][section]:[.45,.7,.8,.4][section]};
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
    case "bell": add("sine", freq, 1); add("sine", freq * 2.76, 0.12); add("sine", freq * 5.4, 0.04); rel = Math.max(0.6, dur); break;
    case "flute": { atk = 0.04; const o = add("sine", freq, 1); add("triangle", freq, 0.3);
      const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 5.5; lg.gain.value = freq * 0.004;
      l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur + 0.1); break; }
    case "lead": atk = 0.01; add("triangle", freq, 0.8); add("sawtooth", freq, 0.16, 3); break;
    case "synth": add("triangle", freq, 0.7); add("sine", freq / 2, 0.3); rel = Math.min(dur, 0.18); break;
    case "bass": add("triangle", freq, 1); add("square", freq, 0.15); rel = Math.min(dur, 0.4); break;
    case "pad": atk = 0.35; add("triangle", freq, 0.3, -4); add("sine", freq, 0.3, 4); add("triangle", freq / 2, 0.4); break;
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
  if (musicLevel === 0) bus.gain.setValueAtTime(0, ctx.currentTime);
  else bus.gain.exponentialRampToValueAtTime(MUSIC_VOL * duck * musicLevel, ctx.currentTime + 1.2);
  // un poco de "sala" con un delay suave
  const dl = ctx.createDelay(0.5), fb = ctx.createGain(), wet = ctx.createGain();
  dl.delayTime.value = (60 / th.bpm) * 0.75; fb.gain.value = 0.25; wet.gain.value = 0.18;
  const tone=ctx.createBiquadFilter();tone.type='lowpass';tone.frequency.value=name.startsWith('jefe')?6200:4200;tone.Q.value=.5;
  bus.connect(tone);tone.connect(master);tone.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(master);
  const st = { name, th, melody: buildMelody(th), bus, nodes: [bus, tone, dl, fb, wet], step: 0, next: ctx.currentTime + 0.1, g };
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
  setTimeout(() => {
    for (const node of st.nodes || [st.bus]) {
      try { node.disconnect(); } catch (_) {}
    }
  }, fade * 1000 + 300);
}

function schedule(st,horizon) {
  const { ctx } = st.g;
  const th = st.th;
  const sixteenth = 60 / th.bpm / 4;
  while (st.next < (horizon??ctx.currentTime + LOOKAHEAD)) {
    const s = st.step % 16;
    const bar = Math.floor(st.step / 16);
    const [cr, cq] = th.chords[bar % th.chords.length];
    const chord = CHORD[cq].map((x) => x + cr);
    const mix=musicArrangement(bar,st.name.startsWith("jefe"));
    let t = st.next;
    if (th.swing && s % 2 === 1) t += sixteenth * th.swing;
    const barLen = sixteenth * 16;
    // pad: un acorde por compás
    if (th.pad && s === 0) for (const n of chord) voice(st.g, st.bus, t, hz(th.root + n), barLen, 0.05 * th.pad, "pad");
    // bajo
    if (th.bass && th.bass[s] === "x") voice(st.g, st.bus, t, hz(th.root - 12 + (s % 8 === 6 ? chord[2] : chord[0])), sixteenth * 2, 0.13 * mix.bass, "bass");
    // arpegio
    if (th.arp && th.arp[s] === "x") {
      const n = chord[(st.step) % chord.length] + 12 + (Math.floor(s / 4) % 2 ? 12 : 0);
      voice(st.g, st.bus, t, hz(th.root + n), sixteenth * 1.5, 0.045 * mix.arp, th.arpInst || "pluck");
    }
    // melodía
    const mn = st.melody[st.step % st.melody.length];
    if (mn != null) {
      let len = 1; while (len < 6 && st.melody[(st.step + len) % st.melody.length] == null) len++;
      voice(st.g, st.bus, t, hz(th.root + th.melody.oct + mn), sixteenth * len * 0.95, 0.082 * mix.melody, th.melody.inst);
    }
    // percusión
    if (th.drums) {
      if (th.drums.k && th.drums.k[s] === "x") drum(st.g, st.bus, t, "k", 0.38 * mix.drums);
      if (th.drums.s && th.drums.s[s] === "x") drum(st.g, st.bus, t, "s", 0.22 * mix.drums);
      if (th.drums.h && th.drums.h[s] !== ".") drum(st.g, st.bus, t, th.drums.h[s] === "o" ? "o" : "h", 0.15 * mix.drums);
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
    current.bus.gain.setTargetAtTime(MUSIC_VOL * duck * musicLevel, ctx.currentTime, 0.25);
  } catch (_) {}
}

// Los navegadores no dejan sonar sin gesto: si se pidió música antes, arranca
// con la primera interacción.
function unlock() {
  const g = audioGraph();
  if (g && wanted && !current) startTheme(wanted);
}
if (typeof addEventListener === "function") {
  addEventListener("pointerdown", unlock, { capture: true });
  addEventListener("keydown", unlock, { capture: true });
}

/** Short, deterministic audition through the same score and voices as the game. */
export async function renderMusicPreview(name='title',seconds=12){
 if(!THEMES[name])throw new Error('Unknown music theme');
 seconds=Math.max(2,Math.min(30,Number(seconds)||12));
 const ctx=new OfflineAudioContext(2,Math.ceil(seconds*44100),44100),bus=ctx.createGain();
 bus.gain.value=MUSIC_VOL;const tone=ctx.createBiquadFilter();tone.type='lowpass';tone.frequency.value=name.startsWith('jefe')?6200:4200;tone.Q.value=.5;bus.connect(tone);tone.connect(ctx.destination);
 const noiseBuf=ctx.createBuffer(1,44100,44100),noise=noiseBuf.getChannelData(0),random=rng(42);
 for(let i=0;i<noise.length;i++)noise[i]=random()*2-1;
 const th=THEMES[name];schedule({name,th,melody:buildMelody(th),bus,step:0,next:.1,g:{ctx,noiseBuf}},seconds-.5);
 return ctx.startRendering();
}

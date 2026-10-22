// OHANA V467 · MUNDO 1 · Cinemáticas con UNA sola historia.
// Intro → (por sala) llegada + despertar del héroe → aparición de la Quimera →
// caída de la Quimera → final que reúne a los diez y abre el Mundo 2.
// Historia: el Eco robó la canción de cada héroe y los dispersó por diez salas.
// Cada sala restaura a uno; la Quimera es la unión corrupta de todos. Al vencerla
// las diez luces vuelven a casa y, más allá del Corazón, esperan las salas
// antiguas: el Mundo 2.
//
// CÓMO ENGANCHARLO:
//   import * as W1Cine from "./world1-cine.js";   (o window.OhanaWorld1Cine)
//   W1Cine.playWorld1Cine(g, "intro")                 // al empezar Mundo 1
//   W1Cine.playWorld1Cine(g, "roomEnter", "dino")     // al entrar en w1-dino (1.ª vez)
//   W1Cine.playWorld1Cine(g, "awaken", "dino")        // tras awardSeal (onWorld1Beat "seal")
//   W1Cine.playWorld1Cine(g, "bossIntro")             // al aparecer la Quimera
//   W1Cine.playWorld1Cine(g, "bossDefeat") → al acabar encadena "ending" solo
//   cada tick: if (W1Cine.updateWorld1Cine(g)) return;   // true = cinemática activa (pausa el juego)
//   tecla saltar: W1Cine.skipWorld1Cine(g)
//   dibujo final: W1Cine.drawWorld1Cine(ctx, g, W, H, t, { drawActor })
//   g.onWorld1CineEnd?.(id) se llama al terminar cada escena (p.ej. ending → abrir Mundo 2).
// Sin degradados por fotograma, sin Math.random, geometría finita, textos en español.
import { WORLD1_ORDER, WORLD1_THEMES, WORLD1_SEALS } from "./world1-rooms.js";
import { WORLD1_ROOM_STORY, FUSION_STORY, WORLD1_ENDING, WORLD1_TITLE, WORLD1_PREMISE } from "./world1-story.js";
import { drawHeroEmblem, heroDisplayName } from "./world1-select.js";

const num = (v, d = 0) => (Number.isFinite(v) ? v : d);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ALL = WORLD1_ORDER;

// Disposición de los héroes en cada plano.
//  scatter: dispersos por el cielo · circle: reunidos · one: protagonista · fused: cosidos
export function buildWorld1Scene(id, hero = null, ctx = {}) {
  const th = hero ? WORLD1_THEMES[hero] : null, name = hero ? heroDisplayName(hero) : "", seals = new Set(ctx.seals || []);
  const restored = ALL.filter((h) => seals.has(h));
  switch (id) {
    case "intro": return [
      { dur: 200, bg: "#1a1030", color: "#ffd6f2", layout: "circle", heroes: ALL, kicker: "Ohana · la familia", title: "Diez héroes, una canción", line: "En Ohana cada héroe guardaba una nota. Juntas sonaban a hogar." },
      { dur: 190, bg: "#12081f", color: "#ff7ad0", layout: "fused", heroes: ALL, kicker: "Una noche…", title: "EL ECO", line: "Una sombra que solo sabe copiar robó las diez notas para hacerse un cuerpo." },
      { dur: 200, bg: "#0e0a1c", color: "#cfc4ff", layout: "scatter", heroes: ALL, kicker: "Sin su canción", title: "Dispersos", line: "Los héroes se apagaron y cayeron, cada uno en una sala lejana y enorme." },
      { dur: 220, bg: "#1e1838", color: WORLD1_THEMES.kilo.color, layout: "one", heroes: ["kilo"], kicker: WORLD1_TITLE, title: "Despierta el primer sello", line: WORLD1_PREMISE }
    ];
    case "roomEnter": return th ? [
      { dur: 170, bg: "#140f26", color: th.color, layout: "one", heroes: [hero], dim: true, kicker: `Sala ${ALL.indexOf(hero) + 1} de 10 · ${th.name}`, title: `${name}, sin su canción`, line: WORLD1_ROOM_STORY[hero]?.enter || "" },
      { dur: 140, bg: "#140f26", color: th.color, layout: "one", heroes: [hero], dim: true, kicker: "Sello: " + (WORLD1_SEALS[th.seal]?.title || ""), title: "Lo que hay que hacer", line: (WORLD1_SEALS[th.seal]?.verb || "") + "." }
    ] : [];
    case "awaken": {
      if (!th) return [];
      const next = ALL[ALL.indexOf(hero) + 1];
      return [
        { dur: 170, bg: "#1e1838", color: th.color, layout: "one", heroes: [hero], burst: true, kicker: "Sello despertado", title: `¡${name} ha vuelto!`, line: WORLD1_ROOM_STORY[hero]?.seal || "" },
        { dur: 160, bg: "#1a1030", color: th.color, layout: "circle", heroes: ALL, lit: [...new Set([...restored, hero])], kicker: `Familia ${new Set([...restored, hero]).size}/10`, title: `${th.relic} recuperada`,
          line: next ? `Al este se abre el camino hacia ${heroDisplayName(next)}. Alguien más te espera.` : "Los diez sellos brillan. El camino lleva al Corazón de Ohana." }
      ];
    }
    case "bossIntro": return [
      { dur: 170, bg: "#12081f", color: "#ffd6f2", layout: "circle", heroes: ALL, lit: ALL, kicker: "Corazón de Ohana", title: "Diez estatuas, diez sellos", line: FUSION_STORY.procession },
      { dur: 150, bg: "#0d0516", color: "#ff7ad0", layout: "converge", heroes: ALL, kicker: "El Eco", title: FUSION_STORY.intro[0], line: FUSION_STORY.intro[1] },
      { dur: 190, bg: "#0d0516", color: "#ff3a8a", layout: "fused", heroes: ALL, shake: true, kicker: "Jefe final del Mundo 1", title: FUSION_STORY.intro[2], line: "Tiene la voz de todos… pero ninguna suena a hogar. Esquiva sus ecos y golpéala entre ataques." }
    ];
    case "bossDefeat": return FUSION_STORY.fall.map((line, i) => ({ dur: 150, bg: i === 2 ? "#1e1838" : "#12081f", color: i === 2 ? "#ffe9a8" : "#ffd6f2", layout: i === 0 ? "fused" : i === 1 ? "burst" : "circle", heroes: ALL, lit: i ? ALL : [], shake: i === 0, kicker: "La Quimera cae", title: ["Se sueltan las costuras", "Diez luces, diez héroes", "Ohana"][i], line }));
    case "ending": return [
      { dur: 220, bg: "#1e1838", color: "#ffe9a8", layout: "circle", heroes: ALL, lit: ALL, dance: true, kicker: WORLD1_ENDING.kicker, title: WORLD1_ENDING.act, line: "Kilo rasguea, Chispín ríe en truenos, Dragón calienta el banquete de Frita y Pizza." },
      { dur: 200, bg: "#1a1030", color: "#ffacc2", layout: "line", heroes: ALL, lit: ALL, kicker: "Juntos", title: WORLD1_ENDING.title, line: "Michi sueña, Cuerno pinta la aurora, Dino pisa fuerte, Stitcho cose la nave y Yomi vigila las estrellas." },
      { dur: 240, bg: "#0e0a1c", color: "#8fe9ff", layout: "portal", heroes: ALL, lit: ALL, kicker: "Pero…", title: "Más allá del Corazón", line: "Yomi: «Detecto un eco más antiguo. Viene de las islas de siempre… el MUNDO 2»." },
      { dur: 200, bg: "#000000", color: "#ffd6f2", layout: "none", heroes: [], kicker: "Fin del Mundo 1", title: "Continuará en el MUNDO 2", line: WORLD1_ENDING.sub }
    ];
    default: return [];
  }
}

export function playWorld1Cine(g, id, hero = null) {
  const shots = buildWorld1Scene(id, hero, { seals: g?.world1Seals });
  if (!shots.length) return false;
  if (g.reduceMotion) for (const s of shots) s.dur = Math.round(s.dur * 0.7);
  g.world1Cine = { id, hero, shots, i: 0, t: 0, total: 0, fade: 0 };
  g.onWorld1Beat?.("cine", id, hero); g.resetInput?.();
  return true;
}
export function world1CineActive(g) { return !!g?.world1Cine; }
export function skipWorld1Cine(g) { const c = g?.world1Cine; if (!c) return false; if (c.t < 20) return false; if (c.i < c.shots.length - 1) { c.i++; c.t = 0; } else endScene(g); return true; }
function endScene(g) { const c = g.world1Cine; g.world1Cine = null; g.resetInput?.(); g.onWorld1CineEnd?.(c.id, c.hero); if (c.id === "bossDefeat") playWorld1Cine(g, "ending"); }

export function updateWorld1Cine(g) {
  const c = g?.world1Cine; if (!c) return false;
  c.t++; c.total++;
  const s = c.shots[c.i]; if (!s || c.t >= num(s.dur, 120)) { if (c.i < c.shots.length - 1) { c.i++; c.t = 0; } else endScene(g); }
  if (c.total > 6000) endScene(g); // finito pase lo que pase
  g.renderDirty = true;
  return true;
}

const STARS = Array.from({ length: 80 }, (_, i) => [((i * 7919) % 997) / 997, ((i * 6271) % 983) / 983, 1 + (i % 3)]);
function heroPos(layout, i, n, W, H, k, t) {
  const cx = W / 2, cy = H * 0.5, R = Math.min(W, H) * 0.3, a = i / Math.max(1, n) * Math.PI * 2 - Math.PI / 2;
  switch (layout) {
    case "scatter": { const sx = ((i * 0.37 + 0.11) % 1) * W * 0.86 + W * 0.07, sy = ((i * 0.61 + 0.23) % 1) * H * 0.5 + H * 0.18; return [sx + Math.sin(t * 0.01 + i) * 6, sy + k * 30, 0.85]; }
    case "converge": { const e = k * k; return [cx + Math.cos(a) * R * (1.3 - e), cy + Math.sin(a) * R * 0.6 * (1.3 - e), 1 - e * 0.4]; }
    case "fused": { const r = R * 0.28; return [cx + Math.cos(a + t * 0.01) * r, cy + Math.sin(a + t * 0.01) * r * 0.7, 0.75]; }
    case "burst": { const e = Math.min(1, k * 1.4); return [cx + Math.cos(a) * R * 0.2 * (1 - e) + Math.cos(a) * R * e, cy + Math.sin(a) * R * 0.6 * e, 0.8 + e * 0.3]; }
    case "line": return [W * (0.08 + 0.84 * (i + 0.5) / n), H * 0.62 + Math.sin(t * 0.08 + i) * 6, 1];
    case "portal": return [W * (0.1 + 0.5 * (i + 0.5) / n) + k * W * 0.08, H * 0.64, 0.9];
    case "one": return [cx, cy, 2.4];
    default: return [cx + Math.cos(a) * R, cy + Math.sin(a) * R * 0.55, 1];
  }
}
function wrap(ctx, text, maxW) { const words = String(text || "").split(" "), out = []; let line = ""; for (const w of words) { const n = line ? line + " " + w : w; if (ctx.measureText(n).width > maxW && line) { out.push(line); line = w; } else line = n; } if (line) out.push(line); return out.slice(0, 3); }

export function drawWorld1Cine(ctx, g, W, H, t = 0, { drawActor = null } = {}) {
  const c = g?.world1Cine; if (!c) return;
  const s = c.shots[c.i]; if (!s) return;
  W = Math.max(1, num(W, 1280)); H = Math.max(1, num(H, 720)); t = num(t);
  const k = clamp(c.t / Math.max(1, s.dur), 0, 1), fadeIn = Math.min(1, c.t / 18), fadeOut = Math.min(1, (s.dur - c.t) / 18), reduce = !!g.reduceMotion;
  const shake = s.shake && !reduce ? Math.sin(c.t * 1.7) * 6 * (1 - k) : 0;
  ctx.save(); ctx.translate(shake, 0);
  ctx.fillStyle = s.bg || "#120d24"; ctx.fillRect(-10, 0, W + 20, H);
  ctx.fillStyle = "#fff"; for (const [x, y, r] of STARS) { ctx.globalAlpha = 0.25 + 0.35 * (reduce ? 0.5 : 0.5 + 0.5 * Math.sin(t * 0.03 + x * 30)); ctx.fillRect(x * W, y * H, r, r); }
  // Halo plano del color del plano (círculos concéntricos, sin degradado).
  ctx.fillStyle = s.color; for (let i = 3; i >= 1; i--) { ctx.globalAlpha = (s.burst ? 0.09 : 0.05) * i * fadeIn; ctx.beginPath(); ctx.arc(W / 2, H * 0.5, Math.min(W, H) * (0.12 + 0.1 * (4 - i)) * (s.burst ? 0.8 + k * 0.5 : 1), 0, Math.PI * 2); ctx.fill(); }
  if (s.layout === "portal") { ctx.globalAlpha = fadeIn; ctx.strokeStyle = "#8fe9ff"; ctx.lineWidth = 8; const r = Math.min(W, H) * 0.2; ctx.beginPath(); ctx.ellipse(W * 0.82, H * 0.5, r * 0.7, r * (0.9 + 0.05 * Math.sin(t * 0.06)), 0, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = "#2a1f4a"; ctx.fill(); ctx.fillStyle = "#8fe9ff"; ctx.font = `bold ${Math.round(H * 0.035)}px sans-serif`; ctx.textAlign = "center"; ctx.fillText("MUNDO 2", W * 0.82, H * 0.5); }
  // Héroes.
  const lit = new Set(s.lit || (s.layout === "one" ? s.heroes : [])), n = s.heroes.length;
  s.heroes.forEach((h, i) => {
    const [x, y, sc] = heroPos(s.layout, i, n, W, H, k, reduce ? 0 : t), on = lit.has(h) && !s.dim;
    const col = s.layout === "fused" ? "#ff3a8a" : on ? WORLD1_THEMES[h].color : "#4a3f72";
    const size = Math.min(W, H) * 0.12 * num(sc, 1);
    ctx.globalAlpha = fadeIn * fadeOut * (s.layout === "fused" ? 0.85 : 1);
    const hop = s.dance && !reduce ? Math.abs(Math.sin(t * 0.09 + i)) * 14 : 0;
    if (drawActor && on && s.layout !== "fused") { try { drawActor(ctx, h, x, y + size * 0.5 - hop, size / 60); return; } catch (_) {} }
    drawHeroEmblem(ctx, h, x, y - hop, size, col, reduce ? 0 : t);
    if (s.dim && s.layout === "one") { ctx.globalAlpha = 0.5 * fadeIn; ctx.fillStyle = s.bg; ctx.fillRect(x - size, y - size * 0.8 + size * 1.6 * k * 0.6, size * 2, size * 1.6 * (1 - k * 0.6)); }
  });
  if (s.layout === "fused") { ctx.globalAlpha = fadeIn * 0.9; ctx.strokeStyle = "#ffd6f2"; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.arc(W / 2, H * 0.5, Math.min(W, H) * 0.13, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = "#ff3a8a"; ctx.beginPath(); ctx.arc(W / 2 - 18, H * 0.47, 7, 0, Math.PI * 2); ctx.arc(W / 2 + 18, H * 0.47, 7, 0, Math.PI * 2); ctx.fill(); }
  // Bandas de cine.
  const bh = H * 0.1; ctx.globalAlpha = 1; ctx.fillStyle = "#000"; ctx.fillRect(-10, 0, W + 20, bh); ctx.fillRect(-10, H - bh, W + 20, bh);
  // Textos: rótulo, título y frase con máquina de escribir.
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.globalAlpha = fadeIn * fadeOut;
  ctx.fillStyle = s.color; ctx.font = `bold ${Math.round(H * 0.024)}px sans-serif`; ctx.fillText(String(s.kicker || "").toUpperCase(), W / 2, bh * 0.5);
  ctx.fillStyle = "#fff"; ctx.font = `bold ${Math.round(H * 0.06)}px sans-serif`; ctx.fillText(s.title || "", W / 2, H * 0.19);
  ctx.font = `${Math.round(H * 0.03)}px sans-serif`; ctx.fillStyle = "#f4ecff";
  const shown = String(s.line || "").slice(0, reduce ? 999 : Math.floor(c.t * 1.6));
  wrap(ctx, shown, W * 0.8).forEach((ln, i, arr) => ctx.fillText(ln, W / 2, H - bh - 18 - (arr.length - 1 - i) * H * 0.04 - H * 0.03));
  ctx.globalAlpha = 0.6; ctx.fillStyle = "#cfc4ff"; ctx.font = `${Math.round(H * 0.018)}px sans-serif`; ctx.fillText(`${c.i + 1}/${c.shots.length} · Espacio para continuar`, W / 2, H - bh * 0.5);
  ctx.restore();
}

export function world1CineSnapshot(g) { const c = g?.world1Cine; return c ? { id: c.id, hero: c.hero, shot: c.i, shots: c.shots.length, t: c.t } : null; }
export const WORLD1_SCENES = Object.freeze(["intro", "roomEnter", "awaken", "bossIntro", "bossDefeat", "ending"]);

export const OhanaWorld1Cine = Object.freeze({ scenes: WORLD1_SCENES, build: buildWorld1Scene, play: playWorld1Cine, update: updateWorld1Cine, skip: skipWorld1Cine, draw: drawWorld1Cine, active: world1CineActive, snapshot: world1CineSnapshot });
if (typeof globalThis !== "undefined") globalThis.OhanaWorld1Cine = OhanaWorld1Cine;

import {drawFamilyActor,tryFamilyActorAdapter} from './family-actor.js';
import {holdAdventureFinalScene} from '../multiplayer/adventure-finale.js';
import {KEEPSAKES,drawKeepsake} from './keepsakes.js';
import {drawChapterBossV2} from './chapter-boss-art-v2.js';
import {drawQuimeraCreature} from './quimera-art.js';
import {drawCraftedScene} from '../worlds/ohana-crafted-scenes.js';
import {drawHarborWelcome} from '../worlds/ohana-environments.js';
// OHANA V467 · MUNDO 1 · Cinemáticas con UNA sola historia.
// Intro → (por sala) llegada + despertar del héroe → aparición de la Quimera →
// diez recuerdos → caída de la Quimera → reencuentro de la familia.
// Historia: el Eco robó la canción de cada héroe y los dispersó por diez salas.
// Cada sala restaura a uno; la Quimera es la unión corrupta de todos. Al vencerla
// las diez luces y sus objetos personales vuelven a casa.
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
//   g.onWorld1CineEnd?.(id) se llama al terminar cada escena (p.ej. ending → reencuentro).
// Sin degradados por fotograma, sin Math.random, geometría finita, textos en español.
import { WORLD1_ORDER, WORLD1_THEMES, WORLD1_SEALS } from "./world1-rooms.js";
import { WORLD1_ROOM_STORY, FUSION_STORY, WORLD1_ENDING, WORLD1_TITLE, WORLD1_PREMISE } from "./world1-story.js";
import { heroDisplayName } from "./world1-select.js";

const num = (v, d = 0) => (Number.isFinite(v) ? v : d);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ALL = WORLD1_ORDER;

// Disposición de los héroes en cada plano.
//  scatter: dispersos por el cielo · circle: reunidos · one: protagonista · fused: cosidos
export function buildWorld1Scene(id, hero = null, ctx = {}) {
  const th = hero ? WORLD1_THEMES[hero] : null, name = hero ? heroDisplayName(hero) : "", seals = new Set(ctx.seals || []);
  const restored = ALL.filter((h) => seals.has(h));
  switch (id) {
    case "keepsakeIntro": return [{dur:230,bg:'#132239',color:th.color,layout:'keeper',heroes:[hero],lit:[hero],kicker:'EL ECO GUARDÓ ALGO TUYO',title:KEEPSAKES[hero].guardian,line:KEEPSAKES[hero].name+'. El guardián ha evolucionado. Espera su apertura y recupéralo.'}];
    case "keepsakeRescue": return [{dur:250,bg:'#183448',color:th.color,layout:'keepsake',heroes:[hero],lit:[hero],dance:true,kicker:'ESTO NO ERA UN TESORO CUALQUIERA',title:KEEPSAKES[hero].name,line:KEEPSAKES[hero].memory}];
    case "intro": return [
      { dur: 200, bg: "#1a1030", color: "#ffd6f2", layout: "circle", heroes: ALL, lit: ALL, kicker: "Ohana · la familia", title: "Diez héroes, una canción", line: "En Ohana cada héroe guardaba una nota. Juntas sonaban a hogar." },
      { dur: 190, bg: "#12081f", color: "#ff7ad0", layout: "fused", heroes: ALL, kicker: "Una noche…", title: "EL ECO", line: "Una sombra que solo sabe copiar robó las diez notas para hacerse un cuerpo." },
      { dur: 200, bg: "#0e0a1c", color: "#cfc4ff", layout: "scatter", heroes: ALL, lit: ALL, kicker: "Sin su canción", title: "Dispersos", line: "Los héroes se apagaron y cayeron, cada uno en una sala lejana y enorme." },
      { dur: 220, bg: "#1e1838", color: WORLD1_THEMES.kilo.color, layout: "one", heroes: ["kilo"], kicker: WORLD1_TITLE, title: "Despierta el primer sello", line: WORLD1_PREMISE }
    ];
    case "roomEnter": return th ? [
      { dur: 230, bg: "#140f26", color: th.color, layout: ["kilo","stitcho","chispin","cat","cuerno","dragon","dino","pizza","frita","yomi"].includes(hero)?"arrival":"one", heroes: [hero], dim: false, kicker: `Sala ${ALL.indexOf(hero) + 1} de 10 · ${th.name}`, title: `${name}, sin su canción`, line: hero==='kilo'?'Recupera cuatro notas para crecer y vence al Tambor. I se prepara con tres ataques H o J que acierten.':hero==='stitcho'?'Transporta cada pieza hasta su módulo. Usa la bola K en el raíl y termina de reparar la nave antes de vencer a Glitch.':hero==='chispin'?'Conecta las cuatro antenas. J corta los arcos y K los cruza. Crece y vence al Titán de Trueno.':hero==='frita'?'Pisa los géiseres listos y dirige el vuelo hacia cada premio. J corrige una vez la trayectoria. Crece y vence al Rey Crujiente.':hero==='yomi'?'Acércate a los cuatro terminales durante AHORA. J prolonga una ventana activa y K contiene disparos. Vence al Custodio.':hero==='pizza'?'Recoge una pizza caliente. Cada cliente abre un horno más cercano para el siguiente reparto. Entrega las tres y vence al Chef Magmático.':hero==='dino'?'Aterriza desde la altura indicada sobre las cuatro placas. Las cornisas dan impulso; K en el aire acelera la caída. Después vence al Coloso.':hero==='cat'?'Salta para despertar las cinco medusas y usarlas como apoyos. Crece y vence al Oráculo Medusaluna.':hero==='cuerno'?'J en el espejo del alba. Sigue los prismas I, II y III; la Bestia Prisma guarda la salida.':hero==='dragon'?'Enciende los cuatro braseros con J. Salta en las térmicas para ascender y vence al Guardián Ígneo.':(WORLD1_SEALS[th.seal]?.verb || "") + "." }
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
      { dur: 240, bg: "#0e0a1c", color: "#8fe9ff", layout: "circle", heroes: ALL, lit: ALL, kicker: "De vuelta a casa", title: "Lo que hace un hogar", line: "Una tabla, un peluche, un huevo todavía dormido. Quimera no pudo quedarse con lo que los une." },
      { dur: 200, bg: "#000000", color: "#ffd6f2", layout: "none", heroes: [], kicker: "Fin del Mundo 1", title: "LA FAMILIA ESTÁ COMPLETA", line: "Cada voz ha vuelto. Cada recuerdo tiene de nuevo un hogar." }
    ];
    default: return [];
  }
}

export function playWorld1Cine(g, id, hero = null) {
  if(g.onlineAdventure&&g.world1Cine&&(g.world1Cine.id!==id||g.world1Cine.hero!==hero)){g._pendingWorld1Cine={id,hero};return true;}
  if(g.canWorld1CineStart&&!g.canWorld1CineStart()){
    if(g._pendingWorld1Cine&&(g._pendingWorld1Cine.id!==id||g._pendingWorld1Cine.hero!==hero))return false;
    g._pendingWorld1Cine={id,hero};g.resetInput?.();return true;
  }
  g._pendingWorld1Cine=null;
  const shots = buildWorld1Scene(id, hero, { seals: g?.world1Seals });
  if (!shots.length) return false;
  if (g.reduceMotion) for (const s of shots) s.dur = Math.round(s.dur * 0.7);
  g.world1Cine = { id, hero, shots, i: 0, t: 0, total: 0, fade: 0 };
  g.onWorld1Beat?.("cine", id, hero); g.resetInput?.();
  return true;
}
export function world1CineActive(g) { return !!(g?.world1Cine||g?._pendingWorld1Cine); }
export function flushWorld1CineQueue(g){
 const pending=g?._pendingWorld1Cine;if(!pending||g.world1Cine||(g.canWorld1CineStart&&!g.canWorld1CineStart()))return false;
 g._pendingWorld1Cine=null;return playWorld1Cine(g,pending.id,pending.hero);
}
export function world1CinePresentation(g) {
  const c = g?.world1Cine, s = c?.shots[c.i];
  if (!s) return null;
  const reading = !g.reduceMotion && !c.revealed && c.t * 1.6 < String(s.line || "").length;
  const last = c.i === c.shots.length - 1;
  return {key: c.id + ":" + c.i, title: s.title, line: s.line,
    canAdvance: c.t >= 20&&!(last&&g._coopFinalWaiting),
    button: last&&g._coopFinalWaiting?'Esperando al compañero':reading ? "Mostrar texto" : last && c.id !== "bossDefeat" ? "Volver al juego" : "Continuar"};
}
export function skipWorld1Cine(g) {
  const c = g?.world1Cine, view = world1CinePresentation(g);
  if (!view?.canAdvance) return false;
  // First reveal a sentence that is still being typed; never throw it away.
  if (view.button === "Mostrar texto") { c.revealed = true; return true; }
  if (c.i < c.shots.length - 1) { c.i++; c.t = 0; c.revealed = false; }
  else endScene(g);
  return true;
}
// The story remains drawn on Canvas; expose its full text and one real button
// so touch and assistive technology can advance the same production sequence.
export function syncWorld1CineControls(g, doc = globalThis.document, visible = true) {
  const root = doc?.getElementById("world1-cine-controls");
  if (!root) return;
  const view = g.running ? world1CinePresentation(g) : null;
  const active = !!view;
  if (doc.body.classList.contains("world1-story") !== active) doc.body.classList.toggle("world1-story", active);
  const show = active && visible, wasHidden = root.hidden, ownedFocus = root.contains(doc.activeElement);
  root.hidden = !show;
  if (!show) {
    if (ownedFocus) doc.getElementById("game")?.focus({preventScroll:true});
    return;
  }
  const button = root.querySelector("button");
  if (root.dataset.scene !== view.key) {
    root.dataset.scene = view.key;
    root.querySelector("p").textContent = view.title + ". " + view.line;
  }
  if (button.textContent !== view.button) button.textContent = view.button;
  button.setAttribute("aria-disabled", String(!view.canAdvance));
  if (wasHidden) button.focus({preventScroll:true});
}
function endScene(g) { const c = g.world1Cine;if(!c)return;if(holdAdventureFinalScene(g,c))return; g.world1Cine = null; g.resetInput?.(); g.onWorld1CineEnd?.(c.id, c.hero); if (c.id === "bossDefeat"&&(!g.onlineAdventure||g.coopAuthority)) playWorld1Cine(g, "ending"); }

export function updateWorld1Cine(g) {
  const c = g?.world1Cine; if (!c) return false;
  c.t++; c.total++;
  const s = c.shots[c.i]; if (!s || c.t >= num(s.dur, 120)) { if (c.i < c.shots.length - 1) { c.i++; c.t = 0; c.revealed = false; } else endScene(g); }
  if (c.total > 6000) endScene(g); // finito pase lo que pase
  g.renderDirty = true;
  return true;
}

const STARS = Array.from({ length: 80 }, (_, i) => [((i * 7919) % 997) / 997, ((i * 6271) % 983) / 983, 1 + (i % 3)]);
function heroPos(layout, i, n, W, H, k, t) {
  const cx = W / 2, cy = H * 0.5, R = Math.min(W, H) * 0.3, a = i / Math.max(1, n) * Math.PI * 2 - Math.PI / 2;
  switch (layout) {
    case "scatter": { const sx = ((i * 0.37 + 0.11) % 1) * W * 0.86 + W * 0.07, sy = ((i * 0.61 + 0.23) % 1) * H * 0.45 + H * 0.22; return [sx + Math.sin(t * 0.01 + i) * 6, sy + k * 20, 1.05]; }
    case "converge": { const e = k * k; return [cx + Math.cos(a) * R * (1.3 - e), cy + Math.sin(a) * R * 0.6 * (1.3 - e), 1 - e * 0.4]; }
    case "fused": { const r = R * 0.28; return [cx + Math.cos(a + t * 0.01) * r, cy + Math.sin(a + t * 0.01) * r * 0.7, 0.75]; }
    case "burst": { const e = Math.min(1, k * 1.4); return [cx + Math.cos(a) * R * 0.2 * (1 - e) + Math.cos(a) * R * e, cy + Math.sin(a) * R * 0.6 * e, 0.8 + e * 0.3]; }
    case "line": return [W * (0.08 + 0.84 * (i + 0.5) / n), H * 0.62 + Math.sin(t * 0.08 + i) * 6, 1];
    case "portal": return [W * (0.1 + 0.5 * (i + 0.5) / n) + k * W * 0.08, H * 0.64, 0.9];
    case "arrival": return [W*(.25+.3*Math.min(1,k*2)),H*.6-Math.sin(Math.min(1,k*2)*Math.PI)*30,2.8];
    case "one": return [cx, cy, 2.4];
    default: return [cx + Math.cos(a) * R, cy + Math.sin(a) * R * 0.55, 1];
  }
}
function wrap(ctx, text, maxW) { const words = String(text || "").split(" "), out = []; let line = ""; for (const w of words) { const n = line ? line + " " + w : w; if (ctx.measureText(n).width > maxW && line) { out.push(line); line = w; } else line = n; } if (line) out.push(line); return out; }

export function world1CineTextLayout(ctx, shot, W, H) {
  const width = W * 0.86;
  let titleSize = Math.max(16, Math.round(Math.min(H * 0.06, W * 0.085)));
  ctx.font = `bold ${titleSize}px sans-serif`;
  let titleLines = wrap(ctx, shot.title, width);
  while (titleSize > 14 && titleLines.length > 2) {
    ctx.font = `bold ${--titleSize}px sans-serif`;
    titleLines = wrap(ctx, shot.title, width);
  }
  let bodySize = Math.max(13, Math.round(Math.min(H * 0.03, W * 0.05)));
  const maxLines = W < H ? 4 : 3;
  ctx.font = `${bodySize}px sans-serif`;
  let lines = wrap(ctx, shot.line, width);
  while (lines.length > maxLines && bodySize > 12) {
    ctx.font = `${--bodySize}px sans-serif`;
    lines = wrap(ctx, shot.line, width);
  }
  return {titleSize, titleLines, bodySize, lines, width};
}

export function drawWorld1Cine(ctx, g, W, H, t = 0, { drawActor = null } = {}) {
  const c = g?.world1Cine; if (!c) return;
  const s = c.shots[c.i]; if (!s) return;
  W = Math.max(1, num(W, 1280)); H = Math.max(1, num(H, 720)); t = num(t);
  const k = clamp(c.t / Math.max(1, s.dur), 0, 1), fadeIn = Math.min(1, c.t / 18), fadeOut = Math.min(1, (s.dur - c.t) / 18), reduce = !!g.reduceMotion;
  const shake = s.shake && !reduce ? Math.sin(c.t * 1.7) * 6 * (1 - k) : 0;
  ctx.save(); ctx.globalAlpha=1;ctx.globalCompositeOperation="source-over";ctx.shadowBlur=0;ctx.filter="none";ctx.translate(shake, 0);
  ctx.fillStyle = s.bg || "#120d24"; ctx.fillRect(-10, 0, W + 20, H);
  if(s.layout==='arrival'){
   if(c.hero==='kilo')drawHarborWelcome(ctx,W,H,reduce?0:t,reduce);
   else drawCraftedScene(ctx,{roomDef:{hero:c.hero},reduceMotion:reduce},{x:0,y:1134-H*.72},t,W,H);
   ctx.fillStyle='#102c3a99';ctx.fillRect(0,H*.12,W,H*.18);ctx.fillRect(0,H*.75,W,H*.16);
  }
  ctx.fillStyle = "#fff"; for (const [x, y, r] of STARS) { ctx.globalAlpha = 0.25 + 0.35 * (reduce ? 0.5 : 0.5 + 0.5 * Math.sin(t * 0.03 + x * 30)); ctx.fillRect(x * W, y * H, r, r); }
  // Halo plano del color del plano (círculos concéntricos, sin degradado).
  ctx.fillStyle = s.color; for (let i = 3; i >= 1; i--) { ctx.globalAlpha = (s.burst ? 0.09 : 0.05) * i * fadeIn; ctx.beginPath(); ctx.arc(W / 2, H * 0.5, Math.min(W, H) * (0.12 + 0.1 * (4 - i)) * (s.burst ? 0.8 + k * 0.5 : 1), 0, Math.PI * 2); ctx.fill(); }
  if (s.layout === "portal") { ctx.globalAlpha = fadeIn; ctx.strokeStyle = "#8fe9ff"; ctx.lineWidth = 8; const r = Math.min(W, H) * 0.2; ctx.beginPath(); ctx.ellipse(W * 0.82, H * 0.5, r * 0.7, r * (0.9 + 0.05 * Math.sin(t * 0.06)), 0, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = "#2a1f4a"; ctx.fill(); ctx.fillStyle = "#8fe9ff"; ctx.font = `bold ${Math.round(H * 0.035)}px sans-serif`; ctx.textAlign = "center"; ctx.fillText("MUNDO 2", W * 0.82, H * 0.48); ctx.font = `bold ${Math.round(H * 0.022)}px sans-serif`; ctx.fillText("en construcción", W * 0.82, H * 0.54); }
  const actor=(...args)=>{
    if(tryFamilyActorAdapter(args[0],drawActor,...args.slice(1)))return;
    return drawFamilyActor(...args.slice(0,5),reduce?0:t,args[5]||{},reduce);
  };
  // Héroes: el adaptador por defecto dibuja los mismos actores de la partida.
  const lit = new Set(s.lit || (["one","arrival"].includes(s.layout) ? s.heroes : [])), n = s.heroes.length;
  (["fused","keeper","keepsake"].includes(s.layout)?[]:s.heroes).forEach((h, i) => {
    const [x, y, sc] = heroPos(s.layout, i, n, W, H, k, reduce ? 0 : t), on = lit.has(h) && !s.dim;
    const size = Math.min(W, H) * 0.12 * num(sc, 1);
    ctx.globalAlpha = fadeIn * fadeOut * (s.layout === "fused" ? 0.85 : 1);
    const hop = s.dance && !reduce ? Math.abs(Math.sin(t * 0.09 + i)) * 14 : 0;
    if(!on)ctx.globalAlpha*=.45;
    actor(ctx,h,x,y+size*.5-hop,size/60,
      s.layout==='arrival'
        ? {pose:reduce?'idle':k<.45?'run':k<.7?'cast':'victory',form:0}
        : {pose:on?(s.dance?'victory':'idle'):'idle',form:0});
    ctx.globalAlpha=fadeIn*fadeOut;
    if (s.dim && s.layout === "one") { ctx.globalAlpha = 0.5 * fadeIn; ctx.fillStyle = s.bg; ctx.fillRect(x - size, y - size * 0.8 + size * 1.6 * k * 0.6, size * 2, size * 1.6 * (1 - k * 0.6)); }
  });
  if(s.layout==='fused'){
    ctx.save();ctx.globalAlpha=fadeIn;ctx.translate(W/2,H*.74);const scale=Math.min(W/680,H/660);ctx.scale(scale,scale);
    drawQuimeraCreature(ctx,{x:-115,y:-290,w:230,h:290,phase:c.id==='bossDefeat'?4:1,hp:c.id==='bossDefeat'?0:1,_fusion:{mode:'rest'}},{x:0,y:0},t,reduce);ctx.restore();
  }
  if(['keeper','keepsake'].includes(s.layout)){
   // Star/halo alpha must never leak into the two foreground actors.
   ctx.globalAlpha=fadeIn*fadeOut;ctx.shadowBlur=0;ctx.filter='none';
   const hero=c.hero,data=KEEPSAKES[hero],height=Math.min(H*.37,W*.34),foot=H*.65;
   actor(ctx,hero,W*.34,foot,height/60,{form:4,pose:s.layout==='keepsake'?'victory':'idle'});
   if(s.layout==='keeper'){
    const e=g.finalGauntlet?.guardian;if(e){ctx.save();const k=Math.min(H*.4,W*.36)/e.h;ctx.translate(W*.67,foot);ctx.scale(k,k);drawChapterBossV2(ctx,{...e,x:-e.w/2,y:-e.h,flash:0,invuln:0},{x:0,y:0},t,reduce);ctx.restore();}
    drawKeepsake(ctx,hero,W*.54,foot+14,Math.min(70,H*.12),{ghost:true});
   }else drawKeepsake(ctx,hero,W*.64,foot+12,Math.min(145,H*.28));
  }
  // Bandas de cine.
  const bh = H * 0.1; ctx.globalAlpha = 1; ctx.fillStyle = "#000"; ctx.fillRect(-10, 0, W + 20, bh); ctx.fillRect(-10, H - bh, W + 20, bh);
  const textLayout = world1CineTextLayout(ctx, s, W, H);
  // Textos: rótulo, título y frase con máquina de escribir.
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.globalAlpha = fadeIn * fadeOut;
  ctx.fillStyle = s.color; ctx.font = `bold ${Math.round(H * 0.024)}px sans-serif`; ctx.fillText(String(s.kicker || "").toUpperCase(), W / 2, bh * 0.5, W * 0.92);
  ctx.fillStyle = "#fff"; ctx.font = `bold ${textLayout.titleSize}px sans-serif`; textLayout.titleLines.forEach((line,i,lines) => ctx.fillText(line, W / 2, H * 0.19 + (i - (lines.length - 1) / 2) * textLayout.titleSize * 1.2, textLayout.width));
  ctx.font = `${textLayout.bodySize}px sans-serif`; ctx.fillStyle = "#f4ecff";
  const shown = String(s.line || "").slice(0, reduce || c.revealed ? 999 : Math.floor(c.t * 1.6));
  wrap(ctx, shown, textLayout.width).forEach((ln, i, arr) => ctx.fillText(ln, W / 2, H - bh - 18 - (arr.length - 1 - i) * textLayout.bodySize * 1.35 - textLayout.bodySize, textLayout.width));
  ctx.globalAlpha = 0.6; ctx.fillStyle = "#cfc4ff"; ctx.font = `${Math.round(H * 0.018)}px sans-serif`; ctx.fillText(`${c.i + 1}/${c.shots.length} · Enter o Espacio`, W / 2, H - bh * 0.5);
  ctx.restore();
}

export function world1CineSnapshot(g) { const c = g?.world1Cine; return c ? { id: c.id, hero: c.hero, shot: c.i, shots: c.shots.length, t: c.t } : null; }
export const WORLD1_SCENES = Object.freeze(["intro", "roomEnter", "awaken", "keepsakeIntro", "keepsakeRescue", "bossIntro", "bossDefeat", "ending"]);

export const OhanaWorld1Cine = Object.freeze({ scenes: WORLD1_SCENES, build: buildWorld1Scene, play: playWorld1Cine, update: updateWorld1Cine, skip: skipWorld1Cine, draw: drawWorld1Cine, active: world1CineActive, snapshot: world1CineSnapshot });
if (typeof globalThis !== "undefined") globalThis.OhanaWorld1Cine = OhanaWorld1Cine;

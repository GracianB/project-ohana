import {drawFamilyActor,tryFamilyActorAdapter} from './family-actor.js';
import {drawMirrorPortrait} from './final-portal-mirrors.js';
import {cleanKeepsakes,drawKeepsake,KEEPSAKES} from './keepsakes.js';
import {drawTheatreStage} from './theatre-stage.js';
import {drawQuimeraCreature} from './quimera-art.js';
import {heroHeightTarget} from '../characters/visual-size.js';
import {cachedGradient} from './canvas-gradient-cache.js';

// OHANA V467 · MUNDO 1 · Selección de héroe personalizada.
// Sin islas en pareja: cada héroe tiene su propia carta-portal enlazada a SU sala
// grande (w1-<héroe>), con su silueta, su color, su frase y el estado del sello.
// Al final de la fila, el portal del Corazón de Ohana (Quimera) se abre con los diez.
//
// CÓMO ENGANCHARLO (lo hace el dueño del cableado):
//   import { createWorld1Select, world1SelectKey, world1SelectPointer,
//            drawWorld1Select } from "./world1-select.js";
//   const sel = createWorld1Select({ seals: g.world1Seals, counts: OhanaWorld1Collect.countsByHero(g) });
//   keydown → const r = world1SelectKey(sel, e.key); if (r?.action === "enter") goRoom(r.room, r.hero);
//   click   → const r = world1SelectPointer(sel, x, y, true);  (move → false para hover)
//   frame   → drawWorld1Select(ctx, W, H, t, sel, { drawActor })   // drawActor(ctx, heroId, x, y, scale) opcional
// También disponible como window.OhanaWorld1Select. Sin degradados por fotograma,
// sin Math.random, geometría finita.
import { WORLD1_ORDER, WORLD1_THEMES, WORLD1_SEALS, cleanWorld1Seals } from "./world1-rooms.js";
import { findRoster } from "../characters/roster.js";

export const WORLD1_TAGLINES = Object.freeze({
  kilo:    "La canción del hogar empieza contigo.",
  stitcho: "Ningún experimento se queda atrás.",
  chispin: "Un chispazo, mil carcajadas.",
  cat:     "Sueña fuerte: las medusas te escuchan.",
  cuerno:  "Ordena la aurora, pinta el bosque.",
  dragon:  "Fuego que calienta, no que asusta.",
  dino:    "Un pisotón y la tierra recuerda.",
  frita:   "Crujiente por fuera, valiente por dentro.",
  pizza:   "Reparto exprés de sonrisas con queso.",
  yomi:    "La IA de la familia ya está despierta."
});

const num = (v, d = 0) => (Number.isFinite(v) ? v : d);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function heroDisplayName(hero) {
  try { const r = findRoster(hero); if (r?.name) return r.name; } catch (_) {}
  return WORLD1_THEMES[hero]?.short || hero;
}

// Datos de cada carta (puros, sin DOM): para HUD, menú HTML o lienzo.
export function world1SelectCards({ seals = [], counts = {},keepsakes=[] } = {}) {
  const done = new Set(cleanWorld1Seals(seals));
  const cards = WORLD1_ORDER.map((hero, i) => {
    const th = WORLD1_THEMES[hero];
    const unlocked = i === 0 || done.has(hero) || done.has(WORLD1_ORDER[i - 1]);
    return {
      hero, index: i, room: "w1-" + hero, name: heroDisplayName(hero), roomName: th.name,
      color: th.color, tint: th.tint, tagline: WORLD1_TAGLINES[hero], relic: th.relic,
      seal: WORLD1_SEALS[th.seal]?.title || "", sealed: done.has(hero), unlocked,
      found: clamp(Math.floor(num(counts[hero])), 0, 100),keepsakeRecovered:cleanKeepsakes(keepsakes).includes(hero)
    };
  });
  const all = WORLD1_ORDER.every((h) => done.has(h));
  cards.push({ hero: null, index: WORLD1_ORDER.length, room: "w1-final", name: "Corazón de Ohana", roomName: "La Quimera Ohana",
    color: "#ffd6f2", tint: "#ff7ad0", tagline: all ? (cleanKeepsakes(keepsakes).length===10?"Los recuerdos están a salvo. Ahora, Quimera.":"Diez guardianes evolucionados custodian lo que perdiste. Recupéralo antes de Quimera.") : "Despierta los diez sellos para abrirlo.",
    relic: "", seal: "Jefe final", sealed: false, unlocked: all, found: 0, final: true,keepsakes:cleanKeepsakes(keepsakes).length });
  return cards;
}

export function createWorld1Select({ seals = [], counts = {}, start = null,keepsakes=[] } = {}) {
  const cards = world1SelectCards({ seals, counts,keepsakes });
  let index = start ? cards.findIndex((c) => c.hero === start || c.room === start) : -1;
  if (index < 0) { index = cards.findIndex((c) => c.unlocked && !c.sealed && !c.final); if (index < 0) index = 0; }
  return { cards, index, hover: -1, t: 0, pulse: 0, deny: 0, rects: [] };
}
export function refreshWorld1Select(sel, opts) { const i = sel.index; sel.cards = world1SelectCards(opts); sel.index = clamp(i, 0, sel.cards.length - 1); return sel; }

const COLS = 6;
// Shared hit-box geometry for Canvas rendering, pointer input and browser QA.
// A portal's geometry must not be guessed from an obsolete grid layout.
export function world1SelectCardRects(sel,W,H){return layout(sel,W,H);}
function layout(sel,W,H){
 const compact=W<600,cols=5,gap=compact?5:9,margin=compact?9:22;
 const finalH=compact?42:48,bottom=10;
 const h=Math.min(68,Math.max(35,(H*.36-finalH-24)/2));sel.columns=cols;
 // Anchor all eleven portals to the visible bottom edge, including short phones.
 const rowH=h+8,baseY=H-bottom-finalH-8-2*rowH;
 sel.rects=sel.cards.map((card,i)=>card.final
  ? {x:margin,y:H-bottom-finalH,w:W-margin*2,h:finalH}
  : {x:margin+(i%cols)*((W-margin*2-gap*4)/5+gap),y:baseY+Math.floor(i/5)*rowH,w:(W-margin*2-gap*4)/5,h});
 return sel.rects;
}

function choose(sel) {
  const c = sel.cards[sel.index];
  if (!c?.unlocked) { sel.deny = 24; return { action: "locked", card: c, message: c?.final ? "Faltan sellos por despertar." : "Despierta antes el sello de " + heroDisplayName(WORLD1_ORDER[c.index - 1]) + "." }; }
  sel.pulse = 30;
  return { action: "enter", room: c.room, hero: c.hero || "kilo", card: c };
}

export function world1SelectKey(sel, key) {
  const n = sel.cards.length;
  if (key === "ArrowRight" || key === "d") sel.index = (sel.index + 1) % n;
  else if (key === "ArrowLeft" || key === "a") sel.index = (sel.index + n - 1) % n;
  else if (key === "ArrowDown" || key === "s") sel.index = Math.min(n - 1, sel.index + (sel.columns || COLS));
  else if (key === "ArrowUp" || key === "w") sel.index = Math.max(0, sel.index - (sel.columns || COLS));
  else if (key === "Enter" || key === " " || key === "j") return choose(sel);
  else if (key === "Escape") return { action: "back" };
  return { action: "move", card: sel.cards[sel.index] };
}

export function world1SelectPointer(sel, x, y, click = false) {
  const i = sel.rects.findIndex((r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
  sel.hover = i;
  if (i < 0) return null;
  sel.index = i;
  return click ? choose(sel) : { action: "move", card: sel.cards[i] };
}

// Emblema-silueta propio de cada héroe (también lo usan las cinemáticas).
// Dibujo con caminos simples centrado en (x,y), tamaño s ≈ alto total.
export function drawHeroEmblem(ctx, hero, x, y, s, color = "#fff", t = 0) {
  x = num(x); y = num(y); s = Math.max(1, num(s, 40)); t = num(t);
  const u = s / 100, bob = Math.sin(t * 0.05 + (WORLD1_ORDER.indexOf(hero) + 1)) * 3 * u;
  ctx.save(); ctx.translate(x, y + bob); ctx.fillStyle = color;
  const body = (rx, ry, oy = 0) => { ctx.beginPath(); ctx.ellipse(0, oy * u, rx * u, ry * u, 0, 0, Math.PI * 2); ctx.fill(); };
  const tri = (a, b, c, d, e, f) => { ctx.beginPath(); ctx.moveTo(a * u, b * u); ctx.lineTo(c * u, d * u); ctx.lineTo(e * u, f * u); ctx.closePath(); ctx.fill(); };
  switch (hero) {
    case "kilo": body(26, 32, 10); body(22, 20, -30); tri(-6, -48, 0, -62, 6, -48); ctx.beginPath(); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 + t * 0.01; ctx.ellipse(Math.cos(a) * 9 * u + 18 * u, -44 * u + Math.sin(a) * 9 * u, 6 * u, 4 * u, a, 0, Math.PI * 2); } ctx.fill(); ctx.fillRect(22 * u, -4 * u, 30 * u, 7 * u); break;
    case "stitcho": body(28, 26, 16); body(26, 22, -22); tri(-20, -30, -58, -58, -14, -14); tri(20, -30, 58, -58, 14, -14); tri(-10, 40, -18, 50, -2, 42); tri(10, 40, 18, 50, 2, 42); break;
    case "chispin": body(34, 30, 14); body(24, 20, -26); tri(-14, -38, -30, -70, -4, -42); tri(14, -38, 30, -70, 4, -42); ctx.beginPath(); ctx.moveTo(30 * u, 10 * u); ctx.lineTo(54 * u, -6 * u); ctx.lineTo(46 * u, 6 * u); ctx.lineTo(62 * u, 0); ctx.lineTo(40 * u, 22 * u); ctx.closePath(); ctx.fill(); break;
    case "cat": body(24, 22, 14); body(22, 19, -22); tri(-18, -32, -12, -54, -4, -36); tri(18, -32, 12, -54, 4, -36); tri(-3, -38, 0, -66, 3, -38); for (let i = 0; i < 3; i++) { ctx.fillRect((-14 + i * 12) * u, 30 * u, 4 * u, (16 + Math.sin(t * 0.08 + i) * 5) * u); } break;
    case "cuerno": body(30, 24, 12); body(18, 16, -24); tri(-4, -36, 6, -76, 8, -34); ctx.fillRect(-26 * u, 28 * u, 8 * u, 22 * u); ctx.fillRect(18 * u, 28 * u, 8 * u, 22 * u); tri(-30, 4, -54, -6, -32, 16); break;
    case "dragon": body(26, 28, 12); body(18, 15, -28); tri(-18, -6, -66, -44, -24, 18); tri(18, -6, 66, -44, 24, 18); tri(-8, -38, -14, -56, -2, -40); tri(8, -38, 14, -56, 2, -40); break;
    case "dino": body(30, 28, 14); body(22, 18, -26); for (let i = 0; i < 5; i++) tri(-26 + i * 10, -14 - (i % 2) * 4 - 26, -21 + i * 10, -54 + Math.abs(i - 2) * 6, -16 + i * 10, -40); tri(24, 26, 58, 40, 22, 40); break;
    case "frita": ctx.fillRect(-26 * u, -8 * u, 52 * u, 50 * u); for (let i = 0; i < 5; i++) ctx.fillRect((-22 + i * 10) * u, (-40 - (i % 2) * 10) * u, 6 * u, 36 * u); body(10, 10, 52); break;
    case "pizza": tri(-36, -34, 36, -34, 0, 48); body(36, 8, -36); body(22, 16, -48); break;
    case "yomi": body(26, 30, 10); body(24, 22, -26); ctx.fillRect(-1.5 * u, -66 * u, 3 * u, 20 * u); body(5, 5, -68); ctx.save(); ctx.globalAlpha *= 0.45; ctx.beginPath(); ctx.arc(0, -10 * u, 44 * u, 0, Math.PI * 2); ctx.lineWidth = 3 * u; ctx.strokeStyle = color; ctx.stroke(); ctx.restore(); break;
    default: body(30, 36, 0); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + t * 0.02; ctx.beginPath(); ctx.arc(Math.cos(a) * 44 * u, Math.sin(a) * 44 * u, 5 * u, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
const STARS = Array.from({ length: 60 }, (_, i) => [((i * 7919) % 997) / 997, ((i * 104729) % 991) / 991, 1 + (i % 3)]);

export function drawWorld1Select(ctx,W,H,t,sel,{drawActor=null,reduceMotion=false,previewForm=0}={}){
 const actor=(...args)=>{
  if(tryFamilyActorAdapter(args[0],drawActor,...args.slice(1)))return;
  return drawFamilyActor(...args.slice(0,5),reduceMotion?0:t,args[5]||{},reduceMotion);
 };

 W=Math.max(1,num(W,1280));H=Math.max(1,num(H,720));const compact=W<600,cur=sel.cards[sel.index]||sel.cards[0],rects=layout(sel,W,H),time=reduceMotion?0:t;
 if(sel.pulse>0)sel.pulse--;if(sel.deny>0)sel.deny--;
 ctx.save();drawTheatreStage(ctx,W,H,cur.hero||'yomi',time,{reduceMotion});
 // Featured hero is the scene's subject; evolution changes its visible scale.
 const foot=rects[0].y-18,base=Math.min(foot-H*.24,W*(compact?.78:.52));
 const ratio=cur.hero?Math.min(1.1,heroHeightTarget(cur.hero,previewForm)/180):1;
 const height=base*(.48+ratio*.52),cx=W*.50;
 if(cur.hero)actor(ctx,cur.hero,cx,foot,height/64,{form:previewForm,pose:reduceMotion?'idle':({kilo:'idle',stitcho:'wall',chispin:'jump',cat:'idle',cuerno:'victory',dragon:'glide',dino:'victory',frita:'victory',pizza:'victory',yomi:'cast'}[cur.hero]),performance:cur.hero==='kilo'?'dance':null});
 if(cur.hero&&cur.keepsakeRecovered){drawKeepsake(ctx,cur.hero,cx+Math.min(W*.17,160),foot,Math.min(100,base*.30));ctx.textAlign='center';ctx.fillStyle='#fff0c8';ctx.font='11px Outfit,sans-serif';ctx.fillText(KEEPSAKES[cur.hero].name,cx+Math.min(W*.17,160),foot+17,Math.min(150,W*.3));}
 if(!cur.hero){
  // The finale preview shows the ten imprisoned actors, not empty ovals.
  for(let i=0;i<10;i++){
   const side=i<5?-1:1,row=i%5,rx=Math.min(26,W*.052),ry=rx*1.35;
   const mx=cx+side*W*.38,my=foot-base*.92+row*base*.19;
   ctx.save();ctx.beginPath();ctx.ellipse(mx,my,rx,ry,0,0,Math.PI*2);
   ctx.fillStyle='#193046';ctx.fill();ctx.strokeStyle=sel.cards[i].color;ctx.lineWidth=1.5;ctx.stroke();ctx.clip();
   ctx.translate(mx,my);drawMirrorPortrait(ctx,sel.cards[i].hero,rx-1,ry-1,time,{reduced:reduceMotion});ctx.restore();
  }
 }
 if(!cur.hero) {ctx.save();ctx.translate(cx,foot);const k=base/590;ctx.scale(k,k);drawQuimeraCreature(ctx,{x:-115,y:-290,w:230,h:290,hp:100,phase:4,_fusion:{mode:'rest'}},{x:0,y:0},time,reduceMotion);ctx.restore();}
 ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillStyle='#fff1ca';ctx.font=`600 ${compact?12:16}px Outfit,sans-serif`;ctx.fillText(`${String(cur.index+1).padStart(2,'0')} / ${cur.final?'EL CORAZÓN':'DIEZ HISTORIAS'}`,compact?16:28,compact?H*.135:112,W*.52);
 ctx.fillStyle='#e2ead8';ctx.font=`${compact?10:12}px Outfit,sans-serif`;ctx.fillText(cur.roomName,compact?16:28,compact?H*.185:140,W*.65);
 // Final mirror room card at the bottom. Locked until the ten seals are done.
 const frame=rects[10],finalCard=sel.cards[10],focusF=sel.index===10,hoverF=sel.hover===10;
 if(frame&&finalCard){
  const locked=!finalCard.unlocked, seals=sel.cards.filter(c=>c.sealed).length;
  ctx.save();
  ctx.fillStyle=focusF?'#f3e0c0':hoverF?'#3a2a4a':'#1a1228e8';
  roundRect(ctx,frame.x,frame.y,frame.w,frame.h,14);ctx.fill();
  ctx.strokeStyle=focusF?'#fff0c7':locked?'#7a6a88':'#ffd6f2';ctx.lineWidth=focusF?2.4:1.4;ctx.stroke();
  // Oval portals suggesting the trapped family
  const colors=['#ffe14a','#5ad1ff','#ffb6e4','#4ff0c8','#ff8a3a','#c8f04a','#ffd36a','#ff8a2a','#ce93d8','#c9a8ff'];
  for(let i=0;i<10;i++){
   const ox=frame.x+18+i*((frame.w-36)/9), oy=frame.y+frame.h*.32;
   ctx.beginPath();ctx.ellipse(ox,oy,4,6,0,0,Math.PI*2);
   ctx.fillStyle=locked?colors[i]+'55':colors[i]+'cc';ctx.fill();
   ctx.strokeStyle=locked?'#9aa':'#fff6c8';ctx.lineWidth=.8;ctx.stroke();
  }
  ctx.textAlign='center';ctx.fillStyle=focusF?'#352642':locked?'#c8b8d0':'#fff1e0';
  ctx.font=`700 ${compact?11:14}px Outfit,sans-serif`;
  ctx.fillText(locked?`✦ ESPEJOS · ${seals}/10`:'✦ CORAZÓN · ENTRAR',frame.x+frame.w/2,frame.y+frame.h-8,frame.w-12);
  ctx.restore();
 }
 // Two low casting rails: large hit areas, names and real animated silhouettes.
 sel.cards.slice(0,10).forEach((card,i)=>{
  const r=rects[i],focus=i===sel.index,hover=i===sel.hover,x=r.x+r.w/2,y=r.y+r.h*.72;
  ctx.save();ctx.fillStyle=focus?'#e8d5a7':hover?'#324d60f2':'#102433e8';roundRect(ctx,r.x,r.y,r.w,r.h,compact?9:12);ctx.fill();ctx.strokeStyle=focus?'#fff0c7':hover?card.color:'#a7c4bb44';ctx.lineWidth=focus?2:1;ctx.stroke();
  ctx.globalAlpha=card.unlocked?1:.55;
  actor(ctx,card.hero,x,y-4,Math.min(r.h*.62,r.w*.7)/64,{miniature:true,animationOffset:i*2,form:card.sealed?1:0,pose:reduceMotion?'idle':((time+i*19)%300>250?'victory':'idle'),performance:card.hero==='kilo'?'dance':null});
  ctx.fillStyle=focus?'#233c49':'#f4e6c7';ctx.font=`600 ${compact?9:12}px Outfit,sans-serif`;ctx.fillText(card.name,x,r.y+r.h-10,r.w-8);
  ctx.font=`700 ${compact?9:11}px sans-serif`;ctx.fillStyle=focus?'#345657':'#d2c59f';ctx.textAlign='right';ctx.fillText(card.sealed?'✓':card.unlocked?'':'◇',r.x+r.w-7,r.y+12);ctx.textAlign='center';ctx.restore();
 });
 ctx.restore();
}

export const OhanaWorld1Select = Object.freeze({ cards: world1SelectCards, create: createWorld1Select, refresh: refreshWorld1Select, key: world1SelectKey, pointer: world1SelectPointer, draw: drawWorld1Select, emblem: drawHeroEmblem, taglines: WORLD1_TAGLINES, name: heroDisplayName });
if (typeof globalThis !== "undefined") globalThis.OhanaWorld1Select = OhanaWorld1Select;

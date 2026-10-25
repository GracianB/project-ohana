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
export function world1SelectCards({ seals = [], counts = {} } = {}) {
  const done = new Set(cleanWorld1Seals(seals));
  const cards = WORLD1_ORDER.map((hero, i) => {
    const th = WORLD1_THEMES[hero];
    const unlocked = i === 0 || done.has(hero) || done.has(WORLD1_ORDER[i - 1]);
    return {
      hero, index: i, room: "w1-" + hero, name: heroDisplayName(hero), roomName: th.name,
      color: th.color, tint: th.tint, tagline: WORLD1_TAGLINES[hero], relic: th.relic,
      seal: WORLD1_SEALS[th.seal]?.title || "", sealed: done.has(hero), unlocked,
      found: clamp(Math.floor(num(counts[hero])), 0, 100)
    };
  });
  const all = WORLD1_ORDER.every((h) => done.has(h));
  cards.push({ hero: null, index: WORLD1_ORDER.length, room: "w1-final", name: "Corazón de Ohana", roomName: "La Quimera Ohana",
    color: "#ffd6f2", tint: "#ff7ad0", tagline: all ? "Los diez juntos. Es la hora." : "Despierta los diez sellos para abrirlo.",
    relic: "", seal: "Jefe final", sealed: false, unlocked: all, found: 0, final: true });
  return cards;
}

export function createWorld1Select({ seals = [], counts = {}, start = null } = {}) {
  const cards = world1SelectCards({ seals, counts });
  let index = start ? cards.findIndex((c) => c.hero === start || c.room === start) : -1;
  if (index < 0) { index = cards.findIndex((c) => c.unlocked && !c.sealed && !c.final); if (index < 0) index = 0; }
  return { cards, index, hover: -1, t: 0, pulse: 0, deny: 0, rects: [] };
}
export function refreshWorld1Select(sel, opts) { const i = sel.index; sel.cards = world1SelectCards(opts); sel.index = clamp(i, 0, sel.cards.length - 1); return sel; }

const COLS = 6;
function layout(sel,W,H){
 const compact=W<600,cx=W/2,cy=H*.47,rx=W*(compact?.39:.40),ry=H*.24;
 sel.columns=5;
 sel.rects=sel.cards.map((card,i)=>{
  const final=!!card.final,a=-Math.PI/2+(i+.5)*Math.PI*2/10;
  const x=final?cx:cx+Math.cos(a)*rx,y=final?H*.78:cy+Math.sin(a)*ry;
  const w=compact?(final?44:48):Math.min(100,W*.12),h=compact?(final?60:71):89;
  return {x:x-w/2,y:y-h*.72,w,h};
 });return sel.rects;
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
 W=Math.max(1,num(W,1280));H=Math.max(1,num(H,720));t=num(t);sel.t++;
 if(sel.pulse>0)sel.pulse--;if(sel.deny>0)sel.deny--;
 const cur=sel.cards[sel.index]||sel.cards[0],compact=W<600,cx=W/2,cy=H*.47;
 const rects=layout(sel,W,H),time=reduceMotion?0:t;
 ctx.save();
 ctx.fillStyle=cachedGradient(ctx,`family-garden:${W}:${H}`,()=>{const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#182945');g.addColorStop(.55,'#355b68');g.addColorStop(1,'#162e3c');return g;});ctx.fillRect(0,0,W,H);
 // The family inhabits one garden, with paths, terraces and a shared hearth.
 for(let layer=0;layer<3;layer++){
  ctx.fillStyle=['#385e69','#294f58','#214149'][layer];ctx.beginPath();ctx.moveTo(0,H);
  ctx.bezierCurveTo(W*.08,H*(.44+layer*.08),W*.36,H*(.52+layer*.08),W*.5,H*(.59+layer*.07));
  ctx.bezierCurveTo(W*.68,H*(.43+layer*.09),W*.87,H*(.48+layer*.1),W,H*(.59+layer*.1));ctx.lineTo(W,H);ctx.fill();
 }
 for(let i=0;i<32;i++){
  const x=((i*7919)%997)/997*W,y=H*.18+((i*317)%991)/991*H*.55;
  ctx.globalAlpha=reduceMotion?.45:.28+Math.sin(time*.025+i)*.2;ctx.fillStyle='#ffe6ad';ctx.beginPath();ctx.arc(x,y,1.2+(i%2)*.6,0,Math.PI*2);ctx.fill();
 }
 ctx.globalAlpha=1;
 ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff0ca';ctx.font=`600 ${Math.min(28,W*.055)}px sans-serif`;
 ctx.fillText('El jardín de los diez',cx,H*.055,W*.9);
 ctx.fillStyle='#cfe1df';ctx.font=`${compact?11:13}px sans-serif`;
 ctx.fillText(`${sel.cards.filter(c=>c.sealed).length}/10 canciones recuperadas · cada puerta tiene su héroe`,cx,H*.105,W*.94);
 // Winding route joins the actual chapter choices in order.
 ctx.lineWidth=compact?3:5;ctx.strokeStyle='#8ca08a';ctx.beginPath();
 for(let i=0;i<10;i++){const r=rects[i],x=r.x+r.w/2,y=r.y+r.h*.8;if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.stroke();
 ctx.strokeStyle='#ead6a0';ctx.lineWidth=1.2;ctx.setLineDash([2,7]);ctx.stroke();ctx.setLineDash([]);
 // A lit stage grows from roots and stone, rather than a giant avatar tile.
 ctx.fillStyle='#122c39';ctx.beginPath();ctx.ellipse(cx,cy+H*.14,W*(compact?.22:.17),H*.055,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#b2bc9e';ctx.beginPath();ctx.ellipse(cx,cy+H*.12,W*(compact?.21:.16),H*.037,0,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#f5e4ae';ctx.lineWidth=2;ctx.stroke();
 const actorHeight=Math.min(H*.27,W*(compact?.26:.18)),foot=cy+H*.12;
 // Changing heroes changes the portal's silhouette and stage props.
 const vista=cur.hero;
 ctx.save();ctx.translate(cx,foot);ctx.globalAlpha=.4;ctx.strokeStyle=cur.color;ctx.fillStyle=cur.tint;ctx.lineWidth=3;
 if(vista==='dragon'){ctx.beginPath();ctx.moveTo(-110,0);ctx.bezierCurveTo(-125,-140,-38,-175,-20,-95);ctx.bezierCurveTo(15,-180,115,-160,112,0);ctx.closePath();ctx.fill();}
 else if(vista==='dino'){for(let i=-2;i<=2;i++){ctx.beginPath();ctx.ellipse(i*36,3,22,80-Math.abs(i)*12,-i*.1,Math.PI,Math.PI*2);ctx.stroke();}}
 else if(vista==='yomi'||vista==='stitcho'){ctx.beginPath();ctx.arc(0,-44,actorHeight*.76,Math.PI,Math.PI*2);ctx.stroke();for(let i=-1;i<=1;i++)ctx.strokeRect(i*52-14,-100,28,54);}
 else {for(let side of [-1,1]){ctx.beginPath();ctx.moveTo(side*88,4);ctx.bezierCurveTo(side*75,-50,side*110,-92,side*68,-134);ctx.stroke();for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(side*(70+i*9),-70-i*18,20,8,side*.5,0,Math.PI*2);ctx.fill();}}}
 ctx.restore();
 const poses={kilo:'idle',stitcho:'wall',chispin:'jump',cat:'idle',cuerno:'victory',dragon:'glide',dino:'victory',frita:'run',pizza:'victory',yomi:'cast'};
 if(drawActor&&cur.hero)drawActor(ctx,cur.hero,cx,foot,actorHeight/64,{form:previewForm,pose:reduceMotion?'idle':poses[cur.hero],performance:cur.hero==='kilo'?'dance':null});
 else drawHeroEmblem(ctx,null,cx,foot-actorHeight*.5,actorHeight*.7,'#ffe2b7',time);
 ctx.fillStyle='#fff0ca';ctx.font=`600 ${compact?16:21}px sans-serif`;ctx.fillText(cur.name,cx,foot+H*.065,W*.44);
 // Small living companions occupy the path. All hit regions stay explicit.
 sel.cards.forEach((card,i)=>{
  const r=rects[i],x=r.x+r.w/2,y=r.y+r.h*.76,focus=i===sel.index,form=card.sealed?2:0;
  ctx.save();ctx.globalAlpha=card.unlocked?1:.63;
  ctx.fillStyle=focus?'#f2dba7':'#608b87';ctx.strokeStyle=focus?'#fff4d7':'#b4c7b1';ctx.lineWidth=focus?2.5:1;
  ctx.beginPath();ctx.ellipse(x,y,r.w*.43,r.h*.12,0,0,Math.PI*2);ctx.fill();ctx.stroke();
  if(card.hero&&drawActor){const phase=(time+i*23)%240,pose=reduceMotion?'idle':phase<40&&i%3===0?'victory':phase>190&&i%3===1?'run':'idle';
   drawActor(ctx,card.hero,x,y-2,Math.min(r.w*.64,r.h*.64)/64,{form,pose,performance:card.hero==='kilo'?'dance':null});
  }else drawHeroEmblem(ctx,null,x,y-r.h*.33,r.h*.4,card.color,time);
  ctx.fillStyle=focus?'#fff4ca':'#d8e8df';ctx.font=`600 ${compact?9:11}px sans-serif`;ctx.fillText(card.final?'Corazón':card.name,x,y+r.h*.22,r.w*1.25);
  if(!card.unlocked){ctx.strokeStyle='#ecdab6';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x+r.w*.3,y-r.h*.6,3.5,Math.PI,Math.PI*2);ctx.stroke();ctx.fillStyle='#ecdab6';ctx.fillRect(x+r.w*.3-4,y-r.h*.6,8,6);}
  else if(card.sealed){ctx.fillStyle='#fff3b9';ctx.font='bold 12px sans-serif';ctx.fillText('✓',x+r.w*.35,y-r.h*.6);}
  ctx.restore();
 });
 // Footer is one legible instruction area; the dossier retains stats/forms.
 ctx.fillStyle='#142c3fe8';roundRect(ctx,8,H*.83,W-16,H*.155,14);ctx.fill();
 ctx.fillStyle='#ffe8b6';ctx.font=`600 ${compact?12:16}px sans-serif`;ctx.fillText(cur.tagline,cx,H*.865,W*.92);
 ctx.fillStyle='#c7dcd9';ctx.font=`${compact?10:12}px sans-serif`;ctx.fillText(cur.roomName,cx,H*.91,W*.92);
 ctx.fillText(cur.final?'Los diez sellos abren el Corazón':`${cur.sealed?'✓ Canción recuperada · ':''}${cur.found}/100 recuerdos · ${cur.unlocked?'Entrar con Intro o tocar otra vez':'Capítulo por despertar'}`,cx,H*.95,W*.92);
 ctx.restore();
}

export const OhanaWorld1Select = Object.freeze({ cards: world1SelectCards, create: createWorld1Select, refresh: refreshWorld1Select, key: world1SelectKey, pointer: world1SelectPointer, draw: drawWorld1Select, emblem: drawHeroEmblem, taglines: WORLD1_TAGLINES, name: heroDisplayName });
if (typeof globalThis !== "undefined") globalThis.OhanaWorld1Select = OhanaWorld1Select;

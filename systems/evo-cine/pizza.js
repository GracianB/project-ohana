// Pizza & Frita · Cinemática de evolución de Pizza: «Horno de leña».
// Pizza es la TRICOLOR italiana (tomate, mozzarella, albahaca) y ELÁSTICA:
// de noche en la trattoria del Puerto, amasa y lanza su masa al aire, una pala
// de madera la mete en el horno de leña, el horno ruge y el queso burbujea y se
// estira fuera de la boca, y la puerta revienta: sale la nueva forma entre
// albahaca y pepperoni. En la forma 5 el horno se agrieta como un volcán.
// Cuatro actos deterministas (hash fijo, sin azar), sin gradientes: el arte
// real se aplana con un proxy de contexto. t en segundos; formas en base 1.
import pizzaArt from "../../characters/art/pizza.js";
import { R } from "../../characters/rig.js";
import { CANVAS_ANATOMY_HEIGHT, heroHeightTarget } from "../../characters/visual-size.js";

export const EVO_CINE_DURATION = 4.5;
export const EVO_CINE_PHASES = Object.freeze({ knead: [0, 1.1], oven: [1.1, 2.2], bubble: [2.2, 3.1], reveal: [3.1, 4.5] });
export const FORM_NAMES = Object.freeze(["Porcioncita", "Pizza", "Pizza Picante", "Pizza Familiar", "Pizza Volcánica"]); // = roster evoNames
export const PIZZA_CINE_PALETTE = Object.freeze({
  night: ["#1a0f16", "#2a1418", "#3a1c18"], brick: "#8a3a26", brick2: "#6e2c1e", mortar: "#4a1e16",
  mouth: "#140806", fire: "#ff7a1a", fire2: "#ffd23a", cheese: "#ffd35e", basil: "#3f9a3a", tomato: "#e0452c",
  cream: "#fff4dc", wood: "#a8743e", wood2: "#7a5028", flour: "#fff8ec", lava: "#ff5a1a",
});
const P = PIZZA_CINE_PALETTE;
const TAU = Math.PI * 2;
const clampF = (f) => Math.max(1, Math.min(5, (f | 0) || 1));
export const formName = (f) => FORM_NAMES[clampF(f) - 1];
const hash = (n) => { const s = Math.sin(n * 12.9898 + 4.1) * 43758.5453; return s - Math.floor(s); };
const clamp01 = (k) => Math.max(0, Math.min(1, k));
const seg = (t, a, b) => clamp01((t - a) / (b - a));
const ease = (k) => { k = clamp01(k); return k * k * (3 - 2 * k); };
const out = (k) => 1 - (1 - clamp01(k)) ** 3;
export function evoCinePhase(t) {
  for (const [name, [a, b]] of Object.entries(EVO_CINE_PHASES)) if (t >= a && t < b) return name;
  return "reveal";
}

const FLAT = Symbol("flatGradient");
function flatGradient() { const stops = []; return { [FLAT]: true, stops, addColorStop(o, c) { stops.push([o, c]); } }; }
const flatColor = (g) => (g.stops.length ? g.stops[Math.min(g.stops.length - 1, g.stops.length >> 1)][1] : P.cheese);
const WRAP = new WeakMap();
function flatCtx(ctx) {
  if (WRAP.has(ctx)) return WRAP.get(ctx);
  const px = new Proxy(ctx, {
    get(o, k) {
      if (k === "createLinearGradient" || k === "createRadialGradient" || k === "createConicGradient") return flatGradient;
      const v = o[k]; return typeof v === "function" ? v.bind(o) : v;
    },
    set(o, k, v) { o[k] = v && v[FLAT] ? flatColor(v) : v; return true; },
  });
  WRAP.set(ctx, px); return px;
}
function pose(form, t, extra = {}) {
  return { form, state: "idle", t: t * 60, phase: t * 9, breath: Math.sin(t * 3) * 0.5, blink: 0, look: { x: 0.2, y: 0 }, sway: 0, bounce: 0,
    atk: 0, flourish: 0, flourishN: 0, cast: 0, castSlot: 0, speed: 0, air: false, reduceMotion: false, facing: 1, land: 0, ...extra };
}
/** Real Pizza art at its in-game proportion for that form. */
function drawPizza(ctx, form0, x, y, h, t, extra, rot = 0) {
  const f = Math.max(0, Math.min(4, form0 | 0));
  const s = h * heroHeightTarget("pizza", f) / 140 / CANVAS_ANATOMY_HEIGHT.pizza[f];
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  try { pizzaArt.draw(flatCtx(ctx), pose(f, t, extra), R); }
  catch { ctx.fillStyle = P.cheese; ctx.beginPath(); ctx.moveTo(-30, -80); ctx.lineTo(30, -80); ctx.lineTo(0, 0); ctx.fill(); }
  ctx.restore();
}

function trattoria(ctx, w, h, gy, u, t, heat, volcanic) {
  const sky = volcanic && heat > 0.6 ? ["#1c0806", "#2e0c08", "#4a140a"] : P.night;
  ctx.fillStyle = sky[2]; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 3; i++) { ctx.fillStyle = sky[i]; ctx.fillRect(0, gy * i / 3 * 0.6, w, gy * 0.2 + 1); }
  // brick wall courses
  for (let r = 0; r < 9; r++) {
    const y = gy * 0.58 + r * 14 * u - 40 * u;
    if (y > gy) break;
    for (let c = -1; c < w / (34 * u) + 1; c++) {
      ctx.fillStyle = (r + c) % 3 ? P.brick2 : P.brick;
      ctx.globalAlpha = 0.35; ctx.fillRect(c * 34 * u + (r % 2) * 17 * u, y, 32 * u, 12 * u); ctx.globalAlpha = 1;
    }
  }
  // string of festoon lights (port at night)
  ctx.strokeStyle = "#3a2420"; ctx.lineWidth = 1.5 * u; ctx.beginPath(); ctx.moveTo(0, 40 * u);
  ctx.quadraticCurveTo(w / 2, 80 * u, w, 40 * u); ctx.stroke();
  for (let i = 0; i < 14; i++) {
    const k = (i + 0.5) / 14, x = k * w, y = 40 * u + 4 * k * (1 - k) * 40 * u;
    const on = 0.6 + 0.4 * Math.sin(t * 3 + i * 1.7);
    ctx.globalAlpha = on; ctx.fillStyle = [P.tomato, P.cream, P.basil][i % 3];
    ctx.beginPath(); ctx.arc(x, y + 5 * u, 3.6 * u, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // wooden counter floor
  ctx.fillStyle = P.wood2; ctx.fillRect(0, gy, w, h - gy);
  ctx.fillStyle = P.wood; ctx.fillRect(0, gy, w, 5 * u);
  for (let i = 0; i < 8; i++) { ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fillRect(i * w / 8, gy + 5 * u, 2 * u, h - gy); }
}

function oven(ctx, cx, gy, u, t, heat, open, volcanic) {
  // t is the cine clock (used to tell the slam-shut door from the burst)
  const ow = 170 * u, oh = 150 * u, top = gy - oh;
  // dome
  ctx.fillStyle = volcanic && heat > 0.5 ? "#4a1a14" : "#7a3220";
  ctx.beginPath(); ctx.moveTo(cx - ow, gy); ctx.quadraticCurveTo(cx - ow, top, cx, top); ctx.quadraticCurveTo(cx + ow, top, cx + ow, gy); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = P.mortar; ctx.lineWidth = 2 * u;
  for (let r = 1; r < 5; r++) { ctx.beginPath(); ctx.arc(cx, gy, ow * r / 5 + 10 * u, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); }
  // chimney + smoke
  ctx.fillStyle = "#5a2418"; ctx.fillRect(cx + ow * 0.35, top - 26 * u, 24 * u, 50 * u);
  for (let i = 0; i < 5; i++) {
    const life = (t * 0.35 + i / 5) % 1;
    ctx.globalAlpha = (1 - life) * 0.4; ctx.fillStyle = "#6a5a5a";
    ctx.beginPath(); ctx.arc(cx + ow * 0.35 + 12 * u + Math.sin(life * 6 + i) * 8 * u, top - 30 * u - life * 80 * u, (8 + life * 16) * u, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // mouth with fire
  const mw = 80 * u, mh = 62 * u;
  ctx.fillStyle = P.mouth; ctx.beginPath(); ctx.moveTo(cx - mw, gy); ctx.quadraticCurveTo(cx - mw, gy - mh * 1.3, cx, gy - mh * 1.3); ctx.quadraticCurveTo(cx + mw, gy - mh * 1.3, cx + mw, gy); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 9; i++) {
    const x = cx + (i - 4) * 16 * u, fh = (16 + hash(i + Math.floor(t * 8)) * 20 + heat * 34) * u;
    ctx.fillStyle = i % 2 ? P.fire : P.fire2; ctx.globalAlpha = 0.85;
    ctx.beginPath(); ctx.moveTo(x - 9 * u, gy); ctx.quadraticCurveTo(x - 4 * u, gy - fh * 0.6, x + Math.sin(t * 9 + i) * 3 * u, gy - fh); ctx.quadraticCurveTo(x + 4 * u, gy - fh * 0.6, x + 9 * u, gy); ctx.fill();
  }
  ctx.globalAlpha = 1;
  if (heat > 0) { ctx.globalAlpha = 0.25 * heat; ctx.fillStyle = P.fire2; ctx.beginPath(); ctx.arc(cx, gy - mh * 0.6, mh * (1.2 + heat * 0.6), 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
  // volcanic fissures across the dome
  if (volcanic && heat > 0.4) {
    ctx.strokeStyle = P.lava; ctx.lineWidth = 3 * u; ctx.lineCap = "round"; ctx.globalAlpha = clamp01((heat - 0.4) / 0.4);
    for (let i = 0; i < 5; i++) {
      const a = Math.PI * (1.1 + i * 0.2), r0 = ow * 0.55, r1 = ow * 0.95;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, gy + Math.sin(a) * r0 * 0.9);
      ctx.lineTo(cx + Math.cos(a + 0.06) * (r0 + r1) / 2, gy + Math.sin(a + 0.06) * (r0 + r1) / 2 * 0.9);
      ctx.lineTo(cx + Math.cos(a - 0.03) * r1, gy + Math.sin(a - 0.03) * r1 * 0.9); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  // iron door (slides away when it bursts open)
  if (open < 1 || t < 3.1) {
    const burst = t >= 3.1;
    const dx = open * (burst ? 140 : 165) * u, dr = open * (burst ? 0.9 : 0.12);
    ctx.save(); ctx.translate(cx + dx, gy - mh * 0.62); ctx.rotate(dr);
    // cast-iron oven door: copper rim, riveted bands, glowing vent, wooden handle
    const dw = mw * 0.92, top = -mh * 0.66, bot = mh * 0.62;
    if (open > 0 && !burst) ctx.scale(0.82, 0.82);            // resting against the wall, a bit smaller in perspective
    const doorPath = () => { ctx.beginPath(); ctx.moveTo(-dw, bot); ctx.quadraticCurveTo(-dw, top, 0, top); ctx.quadraticCurveTo(dw, top, dw, bot); ctx.closePath(); };
    ctx.fillStyle = "#3a3236"; doorPath(); ctx.fill();
    ctx.strokeStyle = "#c8743a"; ctx.lineWidth = 4 * u; ctx.stroke();       // copper rim
    ctx.fillStyle = "#4a4044"; for (const y of [bot - mh * .22, top + mh * .55]) ctx.fillRect(-dw * .9, y, dw * 1.8, 7 * u);   // iron bands
    ctx.fillStyle = "#d8a070"; for (const y of [bot - mh * .22, top + mh * .55]) for (let k = -3; k <= 3; k++) { ctx.beginPath(); ctx.arc(k * dw * .26, y + 3.5 * u, 2 * u, 0, TAU); ctx.fill(); }
    ctx.fillStyle = "#1a0c08"; ctx.fillRect(-18 * u, top + mh * .2, 36 * u, 10 * u);       // vent slot
    ctx.fillStyle = heat > 0.2 ? "#ffb23a" : "#7a3a1a"; for (let k = 0; k < 3; k++) ctx.fillRect(-15 * u + k * 11 * u, top + mh * .2 + 2 * u, 8 * u, 6 * u);
    ctx.fillStyle = "#9a9aa4"; ctx.fillRect(-20 * u, -2 * u, 4 * u, 10 * u); ctx.fillRect(16 * u, -2 * u, 4 * u, 10 * u);
    ctx.fillStyle = "#8a5a30"; ctx.fillRect(-18 * u, 6 * u, 36 * u, 8 * u);                // wooden grip
    ctx.fillStyle = "#b07a44"; ctx.fillRect(-18 * u, 6 * u, 36 * u, 2.5 * u);
    ctx.restore();
  }
}

function peel(ctx, x, y, u, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = P.wood; ctx.strokeStyle = "#3a2410"; ctx.lineWidth = 2 * u;
  ctx.beginPath(); ctx.moveTo(-44 * u, 0); ctx.lineTo(44 * u, 0); ctx.lineTo(36 * u, 9 * u); ctx.lineTo(-36 * u, 9 * u); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillRect(40 * u, 2 * u, 120 * u, 6 * u); ctx.strokeRect(40 * u, 2 * u, 120 * u, 6 * u);
  ctx.restore();
}

function flour(ctx, w, h, u, t, k) {
  ctx.fillStyle = P.flour;
  for (let i = 0; i < 40; i++) {
    const x = hash(i) * w + Math.sin(t * 2 + i) * 10 * u, y = h * (0.9 - ((t * 0.3 + hash(i + 7)) % 1) * 0.8);
    ctx.globalAlpha = 0.5 * k; ctx.beginPath(); ctx.arc(x, y, (1 + hash(i + 3) * 2) * u, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function cheeseStrings(ctx, cx, gy, u, t, k, volcanic) {
  ctx.lineCap = "round";
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI + (i + 0.5) * Math.PI / 7, len = (60 + hash(i) * 70) * k * u;
    const x0 = cx + Math.cos(a) * 60 * u, y0 = gy - 40 * u + Math.sin(a) * 40 * u;
    const x1 = cx + Math.cos(a) * (60 * u + len), y1 = gy - 40 * u + Math.sin(a) * (40 * u + len * 0.7) + Math.sin(t * 5 + i) * 6 * u;
    ctx.strokeStyle = volcanic ? P.lava : P.cheese; ctx.lineWidth = (6 - i % 3) * u;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + 24 * u * k, x1, y1); ctx.stroke();
    ctx.fillStyle = volcanic ? P.fire2 : "#fff0a8"; ctx.beginPath(); ctx.arc(x1, y1, 4 * u, 0, TAU); ctx.fill();
  }
  // bubbles popping
  for (let i = 0; i < 10; i++) {
    const life = (t * 1.6 + hash(i + 40)) % 1, x = cx + (hash(i + 20) - 0.5) * 150 * u, y = gy - 20 * u - life * 70 * u;
    ctx.globalAlpha = (1 - life) * k; ctx.strokeStyle = volcanic ? P.fire2 : "#fff4c0"; ctx.lineWidth = 2 * u;
    ctx.beginPath(); ctx.arc(x, y, (3 + life * 7) * u, 0, TAU); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function confetti(ctx, w, h, u, t, k) {
  for (let i = 0; i < 34; i++) {
    const x = hash(i) * w + Math.sin(t * 2.4 + i) * 16 * u, y = ((t - 3.1) * (80 + hash(i + 5) * 90) * u + hash(i + 9) * h * 0.4) % (h * 0.95);
    ctx.save(); ctx.translate(x, y); ctx.rotate(t * 3 + i); ctx.globalAlpha = k;
    if (i % 3 === 0) { ctx.fillStyle = P.tomato; ctx.beginPath(); ctx.arc(0, 0, 5 * u, 0, TAU); ctx.fill(); ctx.fillStyle = "#8a1a14"; ctx.beginPath(); ctx.arc(1.5 * u, -1 * u, 1.2 * u, 0, TAU); ctx.fill(); }
    else { ctx.fillStyle = i % 3 === 1 ? P.basil : "#5ab84a"; ctx.beginPath(); ctx.ellipse(0, 0, 6 * u, 3 * u, 0, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function title(ctx, w, h, u, from, to, k) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.font = `bold ${Math.round(32 * u)}px Fredoka, sans-serif`;
  ctx.fillStyle = "#2a0c08"; ctx.fillText("¡" + formName(to) + "!", w / 2 + 2 * u, h * 0.13 + 2 * u);
  ctx.fillStyle = to === 5 ? "#ff8a3a" : P.cheese; ctx.fillText("¡" + formName(to) + "!", w / 2, h * 0.13);
  ctx.font = `${Math.round(15 * u)}px Outfit, sans-serif`; ctx.fillStyle = P.cream;
  ctx.strokeStyle = "#1a0806"; ctx.lineWidth = 3 * u; ctx.strokeText("Forma " + from + " → " + to, w / 2, h * 0.13 + 24 * u);
  ctx.fillText("Forma " + from + " → " + to, w / 2, h * 0.13 + 24 * u);
  ctx.restore();
}

/** @param opts {reducedMotion?:boolean} — reduced shows one calm reveal frame. */
export function drawEvoCine(ctx, w, h, t, fromForm = 1, toForm, opts = {}) {
  const reduced = !!opts.reducedMotion;
  const from = clampF(fromForm), to = clampF(toForm ?? from + 1), volcanic = to === 5;
  t = reduced ? 4.2 : Math.max(0, Math.min(EVO_CINE_DURATION, Number(t) || 0));
  const u = h / 300, cx = w / 2, gy = h * 0.8, ch = h * 0.4;
  const knead = seg(t, 0, 1.1), ovenK = seg(t, 1.1, 2.2), bubble = seg(t, 2.2, 3.1), reveal = seg(t, 3.1, 4.5);
  const heat = t < 1.1 ? 0.1 : t < 2.2 ? 0.2 + 0.5 * ovenK : t < 3.1 ? 0.7 + 0.3 * bubble : 1 - 0.5 * reveal;
  // door: leaning open (1) while she kneads and slides in, slams at 2.0–2.2, bursts at 3.1
  const open = t < 2.0 ? 1 : t < 3.1 ? 1 - ease(seg(t, 2.0, 2.2)) : out(seg(t, 3.1, 3.4));
  const shake = !reduced && t > 2.2 && t < 3.1 ? Math.sin(t * 60) * 3 * u * bubble : 0;
  ctx.save();
  trattoria(ctx, w, h, gy, u, t, heat, volcanic);
  ctx.translate(shake, 0);
  oven(ctx, cx, gy, u, t, heat, open, volcanic);
  if (t < 1.1) {                                          // 1 · amasado: la masa vuela y gira
    const toss = Math.abs(Math.sin(knead * Math.PI * 2));
    flour(ctx, w, h, u, t, 0.5 + knead * 0.5);
    drawPizza(ctx, from - 1, cx - 110 * u, gy, ch, t, { state: "victory" });
    ctx.save(); ctx.translate(cx - 104 * u, gy - ch * 1.1 - toss * 46 * u); ctx.scale(1, 0.32 + 0.1 * Math.cos(t * 12));
    ctx.fillStyle = P.cream; ctx.strokeStyle = "#c89a5a"; ctx.lineWidth = 3 * u;
    ctx.beginPath(); ctx.arc(0, 0, (26 + knead * 10) * u, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore();
  } else if (t < 2.2) {                                   // 2 · a la pala y al horno
    const slide = ease(ovenK);
    const px = cx - 110 * u + slide * 110 * u, py = gy - 8 * u - Math.sin(slide * Math.PI) * 30 * u;
    peel(ctx, px - 30 * u, py + 4 * u, u, -0.05 + slide * 0.05);
    drawPizza(ctx, from - 1, px, py, ch * (1 - 0.45 * slide), t, { state: "fall", vy: 2 }, -0.2 * slide);
    flour(ctx, w, h, u, t, 1 - slide);
  } else if (t < 3.1) {                                   // 3 · burbujeo: el queso desborda
    cheeseStrings(ctx, cx, gy, u, t, ease(bubble), volcanic);
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 20); ctx.fillStyle = volcanic ? P.lava : P.fire2;
    ctx.beginPath(); ctx.arc(cx, gy - 40 * u, (14 + bubble * 18) * u, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
  } else {                                                // 4 · ¡al punto!: la puerta revienta
    if (!reduced && t < 3.28) { ctx.globalAlpha = 0.6 * (1 - seg(t, 3.1, 3.28)); ctx.fillStyle = "#fff6dc"; ctx.fillRect(-10, 0, w + 20, h); ctx.globalAlpha = 1; }
    const pop = reduced ? 1 : out(seg(t, 3.12, 3.6));
    const jy = reduced ? 0 : Math.sin(seg(t, 3.12, 3.7) * Math.PI) * 60 * u;
    // steam swirl rings
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = 0.35 * (1 - reveal * 0.6); ctx.strokeStyle = P.cream; ctx.lineWidth = 3 * u;
      ctx.beginPath(); ctx.arc(cx, gy - ch * 0.5 - jy, (40 + i * 26 + pop * 30) * u, Math.PI * (1.1 + i * 0.3 + t), Math.PI * (1.7 + i * 0.3 + t)); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    peel(ctx, cx - 30 * u, gy - 2 * u, u, 0);
    const state = reduced ? {} : t < 3.7 ? { state: "jump", vy: -4 } : { state: "victory" };
    drawPizza(ctx, to - 1, cx, gy - 6 * u - jy, ch * (0.8 + 0.4 * pop), t, state);
    confetti(ctx, w, h, u, t, reduced ? 1 : ease(seg(t, 3.15, 3.5)));
  }
  ctx.restore();
  title(ctx, w, h, u, from, to, reduced ? 1 : ease(seg(t, 3.3, 3.75)));
  return evoCinePhase(t);
}
export default { id: "pizza", drawEvoCine, EVO_CINE_DURATION, FORM_NAMES };

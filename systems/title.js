import { ROSTER } from "../characters/roster.js";
import { canonId, saveStore } from "./save.js";
import { createFixedClock } from "../engine/clock.js";
import { drawCharacter } from "../characters/draw.js";
import { CUERNO_VISUAL_H } from "../characters/art/cuerno.js";
import { getLook, setLook } from "../characters/look.js";
import { playIntro, playTitleIntro } from "./intro.js";
import { sfx } from "../engine/audio.js";
import { playMusic } from "../engine/music.js";
import { motionProfile } from "../characters/rig.js";
import { difficulty } from "../characters/signature.js";
import { masteryOf } from "./hero-mastery.js";

// Jingle de portada al primer toque/tecla (los navegadores no dejan sonar antes).
let titleJingle = false;
function jingle() {
if (titleJingle || document.body.classList.contains("playing")) return;
titleJingle = true;
sfx("title");
if (!document.body.classList.contains("playing")) setTimeout(() => { if (!document.body.classList.contains("playing")) playMusic("title"); }, 1800);
}
addEventListener("pointerdown", jingle, { capture: true });
addEventListener("keydown", jingle, { capture: true });

const ROLES = { kilo: "Kilo Bebé", lilo: "Kilo Bebé", stitcho: "Mini Stitcho", stitch: "Mini Stitcho", dragon: "Dragoncito", chispin: "Chispín Bebé", pikachu: "Chispín Bebé", cat: "Michito", frita: "Palito", dino: "Dino Bebé", pizza: "Porcioncita", yomi: "Farol", cuerno: "Cuernín" };
const HERO_LINES = {
kilo: "Corrientes de polen, flotación y vuelo solar en las formas altas.",
stitcho: "Paredes, agarre, trepa y vaults para dominar rutas verticales.",
chispin: "Cloudstep: puede correr sobre nubes eléctricas y convertir altura en velocidad.",
cat: "Moon Pounce, nueve vidas y movilidad felina para corregir saltos imposibles.",
dragon: "Batidas extra, planeo y vuelo: el aire es una ruta, no una caída.",
dino: "Pisotón sísmico, ruptura de grietas y rebote colosal tras el impacto.",
frita: "Deslizamiento encadenado y carriles de impulso que conservan velocidad.",
pizza: "Rebotes sobre enemigos y respiraderos de horno convertidos en trampolines.",
yomi: "Paso Hueco: desplazamiento espectral e intangibilidad durante la fase.",
cuerno: "Aterrizajes fuertes proyectan puentes Aurora temporales hacia delante."
};
const VISUAL_H = [36, 48, 58, 68, 80];
const CHAR_K = { kilo: 1.0, lilo: 1.0, stitcho: 0.95, stitch: 0.95, chispin: 0.92, pikachu: 0.92, cat: 0.92, dragon: 1.0, frita: 1.04, dino: 1.0, pizza: 0.98, yomi: 0.96, cuerno: 1.0 };

// V47A · envelope visual real, no hitbox. Las formas altas necesitan espacio
// para alas, cola, cuernos, aura y FX que no están representados por form.w/h.
const PORTRAIT_ENVELOPE = Object.freeze({
kilo:    [1.00,1.08,1.18,1.30,1.52],
stitcho: [1.00,1.05,1.12,1.22,1.34],
chispin: [1.00,1.05,1.12,1.20,1.34],
cat:     [1.00,1.05,1.12,1.20,1.34],
dragon:  [1.00,1.08,1.22,1.38,1.62],
dino:    [1.00,1.06,1.14,1.28,1.42],
frita:   [1.00,1.04,1.10,1.20,1.34],
pizza:   [1.00,1.04,1.10,1.22,1.36],
yomi:    [1.00,1.08,1.16,1.28,1.46],
cuerno:  [0.70,0.98,1.10,1.43,1.77],
});
// V75 · Geometry-led aspect ratios, not the collision width/height. F3 wings
// and F4's high pinions sit outside the hitbox. Baby to adult must grow visibly.
export const CUERNO_PORTRAIT_ASPECT = Object.freeze([.66,.81,1.16,1.52,1.60]);
export const CUERNO_PORTRAIT_GROWTH = Object.freeze([.68,.77,.86,.94,1.00]);


function portraitFit(def, evo, bw, bh, hero) {
const form = def.forms?.[evo] || {};
const baseH = def.id==="cuerno"?CUERNO_VISUAL_H[evo]:VISUAL_H[evo]*(CHAR_K[def.id]||1);
const envelope = PORTRAIT_ENVELOPE[def.id]?.[evo] || (1 + evo * .09);
const geometryAspect = Math.max(.70, Math.min(1.45, Number(form.w || 28) / Math.max(1, Number(form.h || 32))));
const visualAspect = def.id==="cuerno" ? CUERNO_PORTRAIT_ASPECT[evo] : Math.max(.72, geometryAspect * envelope);
const safeW = bw * (hero ? (evo >= 4 ? .72 : .82) : .72);
const safeH = bh * (hero ? (def.id==="cuerno"?.79:evo>=4?.70:.80) : .72);
// A coherent progression, not five independent 'fill the frame' portraits.
const growth = def.id==="cuerno" ? CUERNO_PORTRAIT_GROWTH[evo] : 1;
const byHeight = safeH * growth / Math.max(1, baseH * envelope);
const byWidth = safeW / Math.max(1, baseH * visualAspect);
const scale = Math.max(.34, Math.min(byHeight, byWidth));
const foot = bh * (hero ? (evo >= 3 ? .88 : .90) : .86);
return { scale, foot, visualAspect, envelope };
}
const TITLE_E2E = new URLSearchParams(location.search).has("e2e");
const ROSTER_BY_ID = new Map(ROSTER.map((def, index) => [def.id, { def, index }]));
let selectedId = "kilo";
let tick = 0;
let raf = 0;
let portraitCanvases = [];
const portraitClock = createFixedClock({ stepMs: 1000 / 24, maxSteps: 1 });
// V80 · Draw only active + two neighbours; idle secondary cards at 8 fps.
export const CAROUSEL_FRAME_BUDGET = Object.freeze({ activeStep: 2, neighbourStep: 6, maxAnimated: 3 });
const carouselPerf = { active:0, neighbours:0, skipped:0, resizes:0 };
if (TITLE_E2E) window.__OHANA_CAROUSEL_PERF = carouselPerf;

const HERO_SHOWCASE = Object.freeze({
kilo:    ["idle","victory","idle"],
stitcho: ["idle","attack","victory"],
chispin: ["idle","cast","victory"],
cat:     ["idle","attack","victory"],
dragon:  ["idle","jump","victory"],
dino:    ["idle","attack","victory"],
frita:   ["run","attack","victory"],
pizza:   ["jump","idle","victory"],
yomi:    ["idle","attack","idle"],
cuerno:  ["idle","victory","jump"],
});

function readSave() { return saveStore.readRaw(); }

function paintPortraits(now = performance.now()) {
if (document.hidden || document.body.classList.contains("playing") ||
    !document.body.classList.contains("intro-complete")) {
  raf = 0; portraitClock.reset(); return;
}
portraitClock.advance(now, () => {
  tick += 2;
  for (const cv of portraitCanvases) {
    const card = cv._card || cv.closest(".char-card");
    if (!card) continue;
    const hero = card.classList.contains("selected");
    const neighbour = card.classList.contains("is-prev") || card.classList.contains("is-next");
    if (!hero && !neighbour) { carouselPerf.skipped++; continue; }
    const step = hero ? CAROUSEL_FRAME_BUDGET.activeStep : CAROUSEL_FRAME_BUDGET.neighbourStep;
    if (!cv._forcePaint && tick - (cv._lastPaintTick ?? -Infinity) < step) {
      carouselPerf.skipped++; continue;
    }
    cv._forcePaint = false; cv._lastPaintTick = tick;
    if (hero) carouselPerf.active++; else carouselPerf.neighbours++;
    const entry = ROSTER_BY_ID.get(cv.dataset.id);
    if (!entry) continue;
    const { def, index: idx } = entry;
    const c = cv._ctx || (cv._ctx = cv.getContext("2d", { alpha:true }));
    fitCanvas(cv);
    const dpr = cv._dpr || 1;
    const bw = cv.width / dpr, bh = cv.height / dpr;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, cv.width, cv.height);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const qaEvo = TITLE_E2E && Number.isInteger(window.__OHANA_TITLE_EVO_OVERRIDE)
      ? Math.max(0, Math.min(4, window.__OHANA_TITLE_EVO_OVERRIDE))
      : null;
    const evo = hero ? (qaEvo ?? (Math.floor(tick / 220) % 5)) : 1;
    if (cv._evo === undefined) cv._evo = evo;
    if (cv._evo !== evo) { cv._burst = 90; cv._evo = evo; }
    cv._burst = Math.max(0, (cv._burst || 0) - 2);
    cv._atk = Math.max(0, (cv._atk || 0) - 2);
    if (hero && tick % 640 === 0) cv._atk = 14;
    const form = (def.forms && def.forms[evo]) || { w: 28, h: 28, color: def.color };
    const at = tick * 0.5 + idx * 24;
    const profile = motionProfile(def);
    const showcaseT = (at + idx * 28) % 360;
    const showcasePhase = showcaseT % 120;
    const showcaseSlot = Math.floor(showcaseT / 120) % 3;
    const casting = hero && showcasePhase >= 72 && showcasePhase < 98;
    const attacking = hero && showcasePhase >= 103 && showcasePhase < 115;
    const personality = HERO_SHOWCASE[def.id] || HERO_SHOWCASE.kilo;
    const poseIndex = showcasePhase < 44 ? 0 : showcasePhase < 88 ? 1 : 2;
    let showcasePose = hero ? personality[poseIndex] : "idle";
    let showcaseMove = null;
    let stitchoBeat = "", cuernoBeat = "", cuernoMagicSlot = -1;
    if (hero && def.id === "cuerno" && TITLE_E2E) {
      const choice = window.__OHANA_TITLE_CUERNO_BEAT;
      if (["curious","shy","prance","stargaze","sneeze","bow"].includes(choice)) {
        cuernoBeat = choice;
        showcasePose = "idle";
      }
    }
    if (hero && def.id === "cuerno" && TITLE_E2E) {
      const forcedMagic = window.__OHANA_TITLE_CUERNO_MAGIC;
      if (Number.isInteger(forcedMagic) && forcedMagic >= 0 && forcedMagic <= 3) {
        showcasePose = "cast";
        cuernoMagicSlot = forcedMagic;
      }
    }
    // V69 QA-only posture audit, never an input in normal gameplay.
    if (hero && def.id === "cuerno" && TITLE_E2E &&
      ["victory","hurt","dead"].includes(window.__OHANA_TITLE_CUERNO_STATE))
      showcasePose = window.__OHANA_TITLE_CUERNO_STATE;
    if (hero && def.id === "stitcho") {
      const forced = TITLE_E2E && Number.isInteger(window.__OHANA_TITLE_STITCHO_PHASE)
        ? Math.max(0, Math.min(119, window.__OHANA_TITLE_STITCHO_PHASE))
        : showcasePhase;
      if (forced < 26) { showcasePose = "idle"; stitchoBeat = "smirk"; }
      else if (forced < 48) { showcasePose = "wall"; showcaseMove = "climb"; stitchoBeat = "wall-peek"; }
      else if (forced < 72) { showcasePose = "run"; showcaseMove = "roll"; stitchoBeat = "plasma-roll"; }
      else if (forced < 96) { showcasePose = "attack"; stitchoBeat = "claw-swipe"; }
      else { showcasePose = "victory"; stitchoBeat = "nebula-laugh"; }
    }
    const bob = Math.sin(tick * 0.03 * profile.pace + idx + profile.sway) * (hero ? 4.5 : 2);
    const sway = Math.sin(tick * 0.02 * profile.pace + idx * 1.3) * 0.035 * profile.sway;
    const showcaseSpeed = Math.max(0.6, Math.min(2.8, (form.speed || def.speed || 4) * 0.38));
    const dummy = {
      id: def.id,
      x: -16,
      y: -32,
      w: 32,
      h: 32,
      facing: 1,
      grounded: true,
      vx: casting || attacking ? 0 : (hero ? showcaseSpeed : 0.4),
      evo,
      color: form.color || def.color,
      melee: attacking ? Math.max(1, 10 - (showcasePhase - 103)) : (cv._atk || 0),
      evoBurst: cv._burst || 0,
      evoBurstMax: 90,
      visualScale: 1,
      _poseOverride: showcasePose,
      _move: showcaseMove,
      _cuernoBeat: cuernoBeat,
      _cuernoMagicSlot: cuernoMagicSlot,
    };
    if (hero && def.id === "cuerno") {
      cv.dataset.cuernoBeat = cuernoBeat;
      cv.dataset.cuernoMagic = String(cuernoMagicSlot);
      cv.dataset.cuernoState = showcasePose;
      if (card) { card.dataset.cuernoBeat = cuernoBeat; card.dataset.cuernoMagic = String(cuernoMagicSlot); card.dataset.cuernoState=showcasePose; }
    } else {
      delete cv.dataset.cuernoBeat;
      delete cv.dataset.cuernoMagic;
      delete cv.dataset.cuernoState;
      if (card) { delete card.dataset.cuernoBeat; delete card.dataset.cuernoMagic; delete card.dataset.cuernoState; }
    }
    if (hero && def.id === "stitcho") {
      cv.dataset.stitchoBeat = stitchoBeat;
      card.dataset.stitchoBeat = stitchoBeat;
    } else {
      delete cv.dataset.stitchoBeat;
      if (card) delete card.dataset.stitchoBeat;
    }
    if (showcasePose === "jump") {
      dummy.grounded = false;
      dummy.vy = -3;
    }
    if (showcasePose === "run") dummy.vx = def.id === "stitcho" ? 0 : Math.max(dummy.vx, showcaseSpeed * 1.35);
    if (casting) {
      const abilityId = def.abilities && def.abilities[showcaseSlot];
      dummy._cast = {
        slot: showcaseSlot,
        id: abilityId,
        form: evo,
        t: at - (showcasePhase - 72),
      };
    }
    const fit = portraitFit(def, evo, bw, bh, hero);
    dummy.visualScale = fit.scale;
    const footY = fit.foot;
    const paintKey = evo + "|" + (hero ? 1 : 0) + "|" + cv.width + "|" + cv.height;
    if (cv._lastPaintKey !== paintKey) {
      cv._lastPaintKey = paintKey;
      cv.dataset.evo = String(evo);
      cv.dataset.fitScale = fit.scale.toFixed(4);
      cv.dataset.fitEnvelope = fit.envelope.toFixed(2);
      if (def.id === "cuerno") cv.dataset.cuernoGrowth = CUERNO_PORTRAIT_GROWTH[evo].toFixed(2);
      else delete cv.dataset.cuernoGrowth;
      card.dataset.evo = String(evo);
      const shadow = c.createRadialGradient(0, 0, 8, 0, 0, Math.max(36, bw * 0.42));
      shadow.addColorStop(0, hero ? (def.id==="cuerno"&&evo===4 ? "rgba(177, 148, 236, 0.52)" : "rgba(255, 214, 120, 0.72)") : "rgba(0,0,0,0.35)");
      shadow.addColorStop(1, "rgba(0,0,0,0)");
      cv._glow = shadow;
    }
    c.save();
    c.translate(bw / 2, footY);
    c.scale(1, 0.22);
    const glow = cv._glow;
    c.fillStyle = glow;
    c.beginPath();
    c.arc(0, 0, Math.max(36, bw * 0.42), 0, Math.PI * 2);
    c.fill();
    c.restore();
    c.save();
    c.translate(bw / 2, footY + bob * (bh / 220));
    if (hero) c.rotate(sway);
    drawCharacter(c, dummy, { x: 0, y: 0 }, at);
    c.restore();
    const roleText = hero ? ((def.evoNames && def.evoNames[evo]) || form.name || def.name) : def.name;
    if (cv._lastRoleText !== roleText) {
      const role = card.querySelector(".role");
      if (role) role.textContent = roleText;
      cv._lastRoleText = roleText;
    }
    const railKey = hero ? evo : -1;
    if (cv._lastRailKey !== railKey) {
      cv._railDots ||= [...card.querySelectorAll(".form-rail i")];
      cv._railDots.forEach((dot, n) => {
        dot.classList.toggle("on", hero && n <= evo);
        dot.classList.toggle("now", hero && n === evo);
      });
      cv._lastRailKey = railKey;
    }
  }
});
raf = requestAnimationFrame(paintPortraits);
}

function fitCanvas(cv) {
if (!cv._sizeDirty && cv._dpr) return;
const box = cv.parentElement || cv;
const w = Math.max(40, Math.round(box.clientWidth));
const h = Math.max(40, Math.round(box.clientHeight));
const maxDpr = w * h > 120000 ? 1.25 : 1.5;
const dpr = Math.min(maxDpr, window.devicePixelRatio || 1);
const W = Math.round(w * dpr), H = Math.round(h * dpr);
if (cv.width !== W || cv.height !== H) {
  cv.width = W; cv.height = H;
  cv._lastPaintKey = ""; cv._glow = null;
  carouselPerf.resizes++;
}
cv._dpr = dpr; cv._sizeDirty = false;
}

function selectionStatus() {
const wrap = document.getElementById("chars");
if (!wrap) return null;

let el = wrap.querySelector(".character-selection-status");
if (!el) {
  el = document.createElement("p");
  el.className = "character-selection-status visually-hidden";
  el.setAttribute("role", "status");
  el.setAttribute("aria-live", "polite");
  el.setAttribute("aria-atomic", "true");
  wrap.appendChild(el);
}
return el;
}

function mark(id) {
selectedId = id;
const cards = [...document.querySelectorAll("#chars-grid .char-card")];
const ids = cards.map((el) => el.dataset.id);
const i = Math.max(0, ids.indexOf(id));
const prev2 = ids[(i - 2 + ids.length) % ids.length];
const prev = ids[(i - 1 + ids.length) % ids.length];
const next = ids[(i + 1) % ids.length];
const next2 = ids[(i + 2) % ids.length];

cards.forEach((el) => {
  const cv = el.querySelector("canvas");
  if (cv) { cv._forcePaint = true; cv._sizeDirty = true; cv._lastPaintTick = -Infinity; }
  const selected = el.dataset.id === id;
  const visible = [id, prev, next, prev2, next2].includes(el.dataset.id);
  el.classList.toggle("selected", selected);
  el.classList.toggle("is-prev2", el.dataset.id === prev2 && ids.length > 3);
  el.classList.toggle("is-prev", el.dataset.id === prev && ids.length > 1);
  el.classList.toggle("is-next", el.dataset.id === next && ids.length > 2);
  el.classList.toggle("is-next2", el.dataset.id === next2 && ids.length > 3);
  el.tabIndex = visible ? 0 : -1;
  el.setAttribute("aria-hidden", String(!visible));
  el.setAttribute("aria-pressed", String(selected));
  if (selected) el.setAttribute("aria-current", "true");
  else el.removeAttribute("aria-current");

  const def = ROSTER.find((item) => item.id === el.dataset.id);
  if (def) {
    const form = def.forms?.[0]?.name || "Forma inicial";
    el.setAttribute(
      "aria-label",
      (selected ? "Seleccionado: " : "") +
      def.name + ". " + form + ". " +
      "Dificultad " + (difficulty(def.id) === 1 ? "fácil" : difficulty(def.id) === 3 ? "difícil" : "media")
    );
  }
});

const selectedDef = ROSTER.find((item) => item.id === id);
if (selectedDef) {
  const heroName = document.getElementById("selected-hero-name");
  const heroForm = document.getElementById("selected-hero-form");
  const heroDifficulty = document.getElementById("selected-hero-difficulty");
  const heroLine = document.getElementById("selected-hero-line");
  const rank = difficulty(selectedDef.id);
  if (heroName) heroName.textContent = selectedDef.name;
  if (heroForm) heroForm.textContent = selectedDef.evoNames?.[0] || selectedDef.forms?.[0]?.name || "Forma inicial";
  if (heroDifficulty) heroDifficulty.textContent = "Dificultad " + (rank === 1 ? "fácil" : rank === 3 ? "difícil" : "media");
  const mastery = masteryOf(selectedDef.id);
  if (heroLine) {
    heroLine.textContent = (HERO_LINES[selectedDef.id] || mastery.desc || "Cinco formas. Tres poderes. Una identidad propia.") + " · " + mastery.name;
    heroLine.setAttribute("data-mastery", mastery.id);
  }
  const menu = document.getElementById("char-select");
  menu?.style.setProperty("--hero-tint", selectedDef.color);
  if (menu) {
    menu.dataset.hero = selectedDef.id;
    menu.dataset.heroName = selectedDef.name;
  }
  dispatchEvent(new CustomEvent("ohana-title-hero", { detail: { id:selectedDef.id, color:selectedDef.color, name:selectedDef.name } }));
}
const status = selectionStatus();
if (status && selectedDef) {
  status.textContent =
    "Personaje seleccionado: " + selectedDef.name +
    ". " + (selectedDef.forms?.[0]?.name || "Forma inicial") +
    ". Usa las flechas para cambiar.";
}

const focused = document.activeElement;
if (focused?.classList.contains("char-card") && focused.getAttribute("aria-hidden") === "true") {
  cards[i]?.focus();
}
syncDots();
}

function stepRoster(dir) {
const ids = [...document.querySelectorAll("#chars-grid .char-card")].map((el) => el.dataset.id);
if (!ids.length) return;
const i = Math.max(0, ids.indexOf(selectedId));
mark(ids[(i + dir + ids.length) % ids.length]);
sfx("ui");
}

function buildDots() {
const grid = document.getElementById("chars-grid");
const wrap = document.getElementById("chars");
if (!grid || !wrap || wrap.querySelector(".chars-dots")) return;
const dots = document.createElement("div");
dots.className = "chars-dots";
dots.setAttribute("aria-hidden", "true");
grid.querySelectorAll(".char-card").forEach((el) => {
  const i = document.createElement("i");
  i.dataset.id = el.dataset.id;
  const def = ROSTER.find((r) => r.id === el.dataset.id);
  if (def) i.style.setProperty("--dot", def.color);
  dots.appendChild(i);
});
wrap.appendChild(dots);
let tm = 0;
grid.addEventListener("scroll", () => {
  clearTimeout(tm);
  tm = setTimeout(syncDots, 60);
}, { passive: true });
}

function syncDots() {
const dots = document.querySelector("#chars .chars-dots");
if (!dots) return;
dots.querySelectorAll("i").forEach((i) => i.classList.toggle("on", i.dataset.id === selectedId));
}

function startSelected() {
dispatchEvent(new CustomEvent("ohana-start", { detail: { id: selectedId } }));
}

function begin(kind) {
const def = ROSTER.find((r) => r.id === selectedId);
const name = def ? def.name : "Ohana";
if (kind === "new") {
  try {
    localStorage.removeItem("ohana");
    localStorage.removeItem("ohana-resume");
  } catch (e) {}
}
if (kind === "resume") {
  try { localStorage.setItem("ohana-resume", "1"); } catch (e) {}
}
playIntro(kind, name, startSelected, selectedId);
}

function applyLook() {
const paint = getLook() === "paint";
document.querySelectorAll(".look-switch button").forEach((b) => {
  const on = b.dataset.look === (paint ? "paint" : "vector");
  b.classList.toggle("on", on);
  b.setAttribute("aria-pressed", on ? "true" : "false");
});
document.querySelectorAll(".portrait").forEach((box) => {
  const hasPaintedArt = !!box.querySelector("img.portrait-art");
  box.classList.toggle("has-art", paint && hasPaintedArt);
});
}

function mountLook(wrap) { wrap?.querySelector(".look-switch")?.remove(); }

function enhance() {
const wrap = document.getElementById("chars");
if (!wrap || !wrap.querySelector(".char-card")) {
  setTimeout(enhance, 60);
  return;
}
wrap.querySelectorAll(".char-card").forEach((el) => {
  const def = ROSTER.find((r) => r.id === el.dataset.id);
  if (!def) return;
  el.style.setProperty("--tint", def.color);
  if (!el.querySelector("canvas")) {
    el.insertAdjacentHTML("afterbegin", '<div class="portrait"><canvas data-id="' + def.id + '" width="420" height="320"></canvas></div>');
    const title = el.querySelector("h3");
    if (title) title.textContent = def.name;
    const role = el.querySelector(".role");
    if (role) {
      const rank = difficulty(def.id);
      const label = rank === 1 ? "Fácil" : rank === 3 ? "Difícil" : "Media";
      role.textContent = label;
      role.classList.remove("r1", "r2", "r3");
      role.classList.add("r" + rank);
    }
  }
  if (!el.querySelector(".form-rail")) {
    const rail = document.createElement("span");
    rail.className = "form-rail";
    rail.setAttribute("aria-hidden", "true");
    rail.innerHTML = "<i></i><i></i><i></i><i></i><i></i>";
    el.appendChild(rail);
  }
  el.addEventListener("pointerdown", () => mark(def.id));
  el.addEventListener("pointerenter", () => { if (selectedId !== def.id) sfx("ui"); });
});
portraitCanvases = [...wrap.querySelectorAll(".char-card canvas")];
portraitCanvases.forEach((cv, index) => {
  cv.dataset.order = String(index); cv._card = cv.closest(".char-card");
  cv._sizeDirty = true; cv._forcePaint = true;
});
addEventListener("resize", () => portraitCanvases.forEach(cv => {
  cv._sizeDirty = true; cv._forcePaint = true;
}), {passive:true});
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && !raf && !document.body.classList.contains("playing"))
    raf = requestAnimationFrame(paintPortraits);
});
mountLook(wrap);
applyLook();
buildDots();
const prevBtn = document.getElementById("roster-prev");
const nextBtn = document.getElementById("roster-next");
if (prevBtn) prevBtn.onclick = () => stepRoster(-1);
if (nextBtn) nextBtn.onclick = () => stepRoster(1);
mark(selectedId);
const play = document.getElementById("btn-play");
const neu = document.getElementById("btn-new");
if (play) play.onclick = () => begin("new");
if (neu) neu.onclick = () => begin("new");
addEventListener("ohana-select", (e) => {
  if (!document.body.classList.contains("playing") && ROSTER.some((r) => r.id === e.detail?.id)) mark(e.detail.id);
});
function refreshContinue() {
  const save = readSave();
  const cont = document.getElementById("btn-continue");
  if (!cont) return;
  const id = save && canonId(save.id);
  if (id && ROSTER.some((r) => r.id === id)) {
    cont.classList.remove("hidden");
    cont.disabled = false;
    cont.onclick = () => { selectedId = id; mark(id); begin("resume"); };
  } else {
    cont.classList.add("hidden");
    cont.disabled = true;
  }
}
refreshContinue();
addEventListener("keydown", (e) => {
  if (document.body.classList.contains("playing")) return;
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    if (!document.body.classList.contains("intro-complete")) return;
    e.preventDefault();
    stepRoster(e.key === "ArrowLeft" ? -1 : 1);
    return;
  }
  if (e.key !== "Enter" || e.repeat || document.activeElement?.closest("button, a")) return;
  if (document.querySelector("#start-intro.show") || document.querySelector("[data-dialog].open, [data-dialog].show")) return;
  const save = readSave();
  const id = save && canonId(save.id);
  if (id && ROSTER.some((r) => r.id === id)) {
    selectedId = id;
    mark(id);
    begin("resume");
  } else begin("new");
});
const mo = new MutationObserver(() => {
  if (!document.body.classList.contains("playing") && !raf) paintPortraits();
  if (!document.body.classList.contains("playing")) refreshContinue();
});
mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });
paintPortraits();
}
function armMenu() {
const play = document.getElementById("btn-play");
const neu = document.getElementById("btn-new");
if (play) play.onclick = () => begin("new");
if (neu) neu.onclick = () => begin("new");
}
armMenu();
// V36: la portada tiene una entrada cinematográfica real. El selector se activa después del reveal.
playTitleIntro();
enhance();

function paintDifficulty() {
let cur = "normal";
try { cur = localStorage.getItem("ohana-difficulty") || "normal"; } catch (e) {}
document.querySelectorAll("#difficulty button").forEach((b) => {
  const on = b.dataset.diff === cur;
  b.classList.toggle("on", on);
  b.setAttribute("aria-pressed", on ? "true" : "false");
});
}
const diff = document.getElementById("difficulty");
if (diff) {
diff.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  try { localStorage.setItem("ohana-difficulty", b.dataset.diff); } catch (err) {}
  paintDifficulty();
});
paintDifficulty();
}

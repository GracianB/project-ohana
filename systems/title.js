import { ROSTER } from "../characters/roster.js";
import { canonId, saveStore } from "./save.js";
import { createFixedClock } from "../engine/clock.js";
import { drawCharacter } from "../characters/draw.js";
import { getLook, setLook } from "../characters/look.js";
import { playIntro, playTitleIntro } from "./intro.js?v=ohana-210";
import { sfx } from "../engine/audio.js";
import { playMusic } from "../engine/music.js";
import { motionProfile } from "../characters/rig.js";
import { difficulty } from "../characters/signature.js";

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
  kilo: "Equilibrio, curiosidad y una última forma capaz de volar.",
  stitcho: "Control, agarre a paredes y ascensos imposibles.",
  chispin: "Velocidad pura, chispas y presión constante.",
  cat: "Una segunda oportunidad y movilidad espectral.",
  dragon: "Planeo, dominio aéreo y vuelo en la forma final.",
  dino: "Peso, embestida y ondas de impacto.",
  frita: "Carrera, deslizamiento y caos a ras de suelo.",
  pizza: "Rebotes, golpes de caída y horno desatado.",
  yomi: "Paso espectral, caída rápida y remates oscuros.",
  cuerno: "Carga frontal, aguante y recuperación."
};
const VISUAL_H = [36, 48, 58, 68, 80];
const CHAR_K = { kilo: 1.0, lilo: 1.0, stitcho: 0.95, stitch: 0.95, chispin: 0.92, pikachu: 0.92, cat: 0.92, dragon: 1.0, frita: 1.04, dino: 1.0, pizza: 0.98, yomi: 0.96, cuerno: 1.0 };
let selectedId = "kilo";
let tick = 0;
let raf = 0;
const portraitClock = createFixedClock({ stepMs: 1000 / 30, maxSteps: 1 });

function readSave() { return saveStore.readRaw(); }

function paintPortraits(now = performance.now()) {
  if (document.body.classList.contains("playing")) {
    raf = 0;
    portraitClock.reset();
    return;
  }
  portraitClock.advance(now, () => {
    tick += 2;
    let idx = 0;
    document.querySelectorAll(".char-card canvas").forEach((cv) => {
      const def = ROSTER.find((r) => r.id === cv.dataset.id);
      if (!def) { idx++; return; }
      const c = cv.getContext("2d", { alpha: true });
      fitCanvas(cv);
      const dpr = cv._dpr || 1;
      const bw = cv.width / dpr, bh = cv.height / dpr;
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, cv.width, cv.height);
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      const card = cv.closest(".char-card");
      const hero = card && card.classList.contains("selected");
      const evo = hero ? Math.floor(tick / 220) % 5 : 1;
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
      };
      if (casting) {
        const abilityId = def.abilities && def.abilities[showcaseSlot];
        dummy._cast = {
          slot: showcaseSlot,
          id: abilityId,
          form: evo,
          t: at - (showcasePhase - 72),
        };
      }
      const want = Math.min(bh * (hero ? 0.82 : 0.76), bw * (hero ? 0.9 : 0.82));
      dummy.visualScale = want / (VISUAL_H[evo] * (CHAR_K[def.id] || 1));
      const footY = bh * (hero ? 0.9 : 0.86);
      c.save();
      c.translate(bw / 2, footY);
      c.scale(1, 0.22);
      const glow = c.createRadialGradient(0, 0, 8, 0, 0, Math.max(36, bw * 0.42));
      glow.addColorStop(0, hero ? "rgba(255, 214, 120, 0.72)" : "rgba(0,0,0,0.35)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
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
      const role = card && card.querySelector(".role");
      if (role) {
        const en = (def.evoNames && def.evoNames[evo]) || form.name || def.name;
        role.textContent = hero ? en : def.name;
      }
      const rail = card && card.querySelector(".form-rail");
      if (rail) {
        rail.querySelectorAll("i").forEach((dot, n) => {
          dot.classList.toggle("on", hero && n <= evo);
          dot.classList.toggle("now", hero && n === evo);
        });
      }
      idx++;
    });
  });
  raf = requestAnimationFrame(paintPortraits);
}

function fitCanvas(cv) {
  const box = cv.parentElement || cv;
  const w = Math.max(40, Math.round(box.clientWidth));
  const h = Math.max(40, Math.round(box.clientHeight));
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const W = Math.round(w * dpr), H = Math.round(h * dpr);
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  cv._dpr = dpr;
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
    const selected = el.dataset.id === id;
    const visible = [id, prev, next].includes(el.dataset.id);
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
    if (heroLine) heroLine.textContent = HERO_LINES[selectedDef.id] || "Cinco formas. Tres poderes. Una identidad propia.";
    document.getElementById("char-select")?.style.setProperty("--hero-tint", selectedDef.color);
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

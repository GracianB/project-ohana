import { ROSTER } from "../characters/roster.js";
import { canonId } from "./save.js";
import { drawCharacter } from "../characters/draw.js";
import { getLook, setLook } from "../characters/look.js";
import { playIntro, playTitleIntro } from "./intro.js";
import { sfx } from "../engine/audio.js";
import { playMusic } from "../engine/music.js";
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
const VISUAL_H = [36, 48, 58, 68, 80];
const CHAR_K = { kilo: 1.0, lilo: 1.0, stitcho: 0.95, stitch: 0.95, chispin: 0.92, pikachu: 0.92, cat: 0.92, dragon: 1.0, frita: 1.04, dino: 1.0, pizza: 0.98, yomi: 0.96, cuerno: 1.0 };
let selectedId = "kilo";
let tick = 0;
let raf = 0;

function readSave() {
  try { return JSON.parse(localStorage.getItem("ohana") || "null"); } catch (e) { return null; }
}

function paintPortraits() {
  if (document.body.classList.contains("playing")) {
    raf = 0;
    return;
  }
  tick++;
  if (tick % 2 === 0) {
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
      // Slower evolution cycle (~2.8s per form)
      const evo = Math.floor(tick / 170) % 5;
      // Evolve burst when the form changes
      if (cv._evo === undefined) cv._evo = evo;
      if (cv._evo !== evo) { cv._burst = 90; cv._evo = evo; }
      cv._burst = Math.max(0, (cv._burst || 0) - 2);
      // Occasional little attack flash, phase-shifted per card
      cv._atk = Math.max(0, (cv._atk || 0) - 2);
      if ((tick + idx * 47) % 380 === 0) cv._atk = 12;
      const form = (def.forms && def.forms[evo]) || { w: 28, h: 28, color: def.color };
      const at = tick * 0.5 + idx * 24;                 // half-speed, staggered
      const bob = Math.sin(tick * 0.03 + idx) * 4;      // gentle float
      const sway = Math.sin(tick * 0.02 + idx * 1.3) * 0.05;
      const dummy = {
        id: def.id,
        x: -16,
        y: -32,
        w: 32,
        h: 32,
        facing: 1,
        grounded: true,
        vx: 0.4,                                        // idle, not running
        evo,
        color: form.color || def.color,
        melee: cv._atk || 0,
        evoBurst: cv._burst || 0,
        evoBurstMax: 90,
        visualScale: 1,
      };
      // Altura objetivo: bebé ~60 % del retrato → GOD ~80 %, limitada por el ancho
      const want = Math.min(bh * (0.6 + 0.05 * evo), bw * (0.5 + 0.05 * evo));
      dummy.visualScale = want / (VISUAL_H[evo] * (CHAR_K[def.id] || 1));
      const footY = bh * 0.86;
      c.save();
      c.translate(bw / 2, footY + bob * (bh / 128));
      c.rotate(sway);
      // drawCharacter ancla los pies en (x + w/2, y + h)
      drawCharacter(c, dummy, { x: 0, y: 0 }, at);
      c.restore();
      const role = cv.closest(".char-card")?.querySelector(".role");
      if (role) role.textContent = (def.evoNames && def.evoNames[evo]) || form.name || def.name;
      idx++;
    });
  }
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

function mark(id) {
  selectedId = id;
  const cards = [...document.querySelectorAll("#chars-grid .char-card")];
  const ids = cards.map((el) => el.dataset.id);
  const i = Math.max(0, ids.indexOf(id));
  const prev = ids[(i - 1 + ids.length) % ids.length];
  const next = ids[(i + 1) % ids.length];
  cards.forEach((el) => {
    el.classList.toggle("selected", el.dataset.id === id);
    el.classList.toggle("is-prev", el.dataset.id === prev && ids.length > 1);
    el.classList.toggle("is-next", el.dataset.id === next && ids.length > 2);
  });
  syncDots();
}

function stepRoster(dir) {
  const ids = [...document.querySelectorAll("#chars-grid .char-card")].map((el) => el.dataset.id);
  if (!ids.length) return;
  const i = Math.max(0, ids.indexOf(selectedId));
  mark(ids[(i + dir + ids.length) % ids.length]);
  sfx("ui");
}

/** Puntos del carrusel (móvil): reflejan la tarjeta centrada. */
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
  const card = document.querySelector('#chars .char-card[data-id="' + selectedId + '"]');
  if (card) card.click();
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
  document.querySelectorAll(".portrait").forEach((box) => box.classList.toggle("has-art", paint));
}

function mountLook(wrap) {
  const old = wrap.querySelector(".look-switch");
  if (old) old.remove();
  setLook("vector");
}

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
      el.insertAdjacentHTML("afterbegin", '<div class="portrait"><canvas data-id="' + def.id + '" width="212" height="128"></canvas></div>');
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
  wrap.querySelectorAll(".char-card").forEach((el) => {
    el.addEventListener("click", () => {}, true);
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
    if (e.key !== "Enter") return;
    if (document.getElementById("ohana-intro") || document.querySelector("#start-intro.show")) return;
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
playTitleIntro();
enhance();

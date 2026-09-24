import { ROSTER } from "../characters/roster.js";
import { drawCharacter } from "../characters/draw.js";
import { playIntro } from "./intro.js";

const ROLES = { lilo: "Kilo Bebé", stitch: "Mini Stitcho", dragon: "Cría Mucho", pikachu: "Chispín Bebé", cat: "Michito", frita: "Palito" };
let selectedId = "lilo";
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
      c.clearRect(0, 0, cv.width, cv.height);
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
        y: -16,
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
        visualScale: 1.15,
      };
      c.save();
      c.translate(cv.width / 2, cv.height / 2 + 14 + bob);
      c.rotate(sway);
      c.scale(0.98, 0.98);
      drawCharacter(c, dummy, { x: 0, y: 0 }, at);
      c.restore();
      const role = cv.closest(".char-card")?.querySelector(".role");
      if (role) role.textContent = (def.evoNames && def.evoNames[evo]) || form.name || def.name;
      idx++;
    });
  }
  raf = requestAnimationFrame(paintPortraits);
}

function mark(id) {
  selectedId = id;
  document.querySelectorAll(".char-card").forEach((el) => el.classList.toggle("selected", el.dataset.id === id));
}

function startSelected() {
  const card = document.querySelector('#chars .char-card[data-id="' + selectedId + '"]');
  if (card) card.click();
}

function begin(kind) {
  const def = ROSTER.find((r) => r.id === selectedId);
  const name = def && def.forms && def.forms[0] ? def.forms[0].name : "Ohana";
  if (kind === "new") {
    try {
      localStorage.removeItem("ohana");
      localStorage.removeItem("ohana-resume");
    } catch (e) {}
  }
  if (kind === "resume") {
    try { localStorage.setItem("ohana-resume", "1"); } catch (e) {}
  }
  playIntro(kind, name, startSelected);
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
      const role = document.createElement("div");
      role.className = "role";
      role.textContent = ROLES[def.id] || "Bebé";
      const title = el.querySelector("h3");
      if (title) {
        title.textContent = (def.forms && def.forms[0] && def.forms[0].name) || def.name;
        title.after(role);
      }
    }
    el.addEventListener("pointerdown", () => mark(def.id));
  });
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
    if (save && save.id && ROSTER.some((r) => r.id === save.id)) {
      cont.classList.remove("hidden");
      cont.disabled = false;
      cont.onclick = () => { selectedId = save.id; mark(save.id); begin("resume"); };
    } else {
      cont.classList.add("hidden");
      cont.disabled = true;
    }
  }
  refreshContinue();
  addEventListener("keydown", (e) => {
    if (document.body.classList.contains("playing")) return;
    if (e.key !== "Enter") return;
    const save = readSave();
    if (save && save.id && ROSTER.some((r) => r.id === save.id)) {
      selectedId = save.id;
      mark(save.id);
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
enhance();

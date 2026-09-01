import { ROSTER } from "../characters/roster.js";
import { drawCharacter } from "../characters/draw.js";
import { playIntro } from "./intro.js";

const ROLES = { lilo: "Bebé Ohana", stitch: "626 bebé", dragon: "Cría", ardilla: "Bellotita", frita: "Palito" };
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
    document.querySelectorAll(".char-card canvas").forEach((cv) => {
      const def = ROSTER.find((r) => r.id === cv.dataset.id);
      if (!def) return;
      const c = cv.getContext("2d", { alpha: true });
      c.clearRect(0, 0, cv.width, cv.height);
      const evo = Math.floor(tick / 70) % 5;
      const form = (def.forms && def.forms[evo]) || { w: 28, h: 28, color: def.color };
      const dummy = {
        id: def.id,
        x: cv.width / 2 - 16,
        y: cv.height / 2 - 8,
        w: 32,
        h: 32,
        facing: 1,
        grounded: true,
        vx: 0,
        evo,
        color: form.color || def.color,
        melee: 0,
      };
      c.save();
      c.translate(cv.width / 2, cv.height / 2 + 6);
      c.scale(0.78, 0.78);
      dummy.x = -16;
      dummy.y = -16;
      drawCharacter(c, dummy, { x: 0, y: 0 }, tick);
      c.restore();
      const role = cv.closest(".char-card")?.querySelector(".role");
      if (role) role.textContent = (def.evoNames && def.evoNames[evo]) || form.name || def.name;
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
      el.insertAdjacentHTML("afterbegin", '<div class="portrait"><canvas data-id="' + def.id + '" width="196" height="118"></canvas></div>');
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
      cont.onclick = () => { selectedId = save.id; mark(save.id); begin("resume"); };
    } else {
      cont.classList.add("hidden");
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

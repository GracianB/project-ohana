import { ROSTER } from "../characters/roster.js";
import { drawBaby } from "../characters/baby.js";

const ROLES = { lilo: "Bebé Ohana", stitch: "626 bebé", pikachu: "Pichu", dragon: "Cría", cat: "Gatito" };
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
      c.save();
      c.translate(cv.width / 2, cv.height / 2 + 10);
      drawBaby(c, { id: def.id }, tick);
      c.restore();
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
      const stats = document.createElement("div");
      stats.className = "stats";
      stats.innerHTML = "<i>empieza bebé</i><i>5 formas</i>";
      el.appendChild(stats);
    }
    el.addEventListener("pointerdown", () => mark(def.id));
  });
  mark(selectedId);
  const play = document.getElementById("btn-play");
  const neu = document.getElementById("btn-new");
  if (play) play.onclick = () => { try { localStorage.removeItem("ohana"); } catch (e) {} startSelected(); };
  if (neu) neu.onclick = () => { try { localStorage.removeItem("ohana"); } catch (e) {} startSelected(); };
  const save = readSave();
  const cont = document.getElementById("btn-continue");
  if (save && save.id && cont) {
    cont.classList.remove("hidden");
    cont.onclick = () => { selectedId = save.id; mark(save.id); startSelected(); };
  }
  addEventListener("keydown", (e) => {
    if (document.body.classList.contains("playing")) return;
    if (e.key === "Enter") startSelected();
  });
  const mo = new MutationObserver(() => {
    if (!document.body.classList.contains("playing") && !raf) paintPortraits();
  });
  mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  paintPortraits();
}
enhance();

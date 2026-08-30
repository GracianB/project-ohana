import { ROSTER } from "../characters/roster.js";
import { drawCharacter } from "../characters/draw.js";

const ROLES = { lilo: "Corazón", stitch: "Caos 626", pikachu: "Rayo", dragon: "Dragón", cat: "Neko" };
let selectedId = "lilo";
let tick = 0;

function readSave() {
  try { return JSON.parse(localStorage.getItem("ohana") || "null"); } catch (e) { return null; }
}

function paintPortraits() {
  tick++;
  document.querySelectorAll(".char-card canvas").forEach((cv) => {
    const def = ROSTER.find((r) => r.id === cv.dataset.id);
    if (!def) return;
    const c = cv.getContext("2d");
    c.clearRect(0, 0, cv.width, cv.height);
    const dummy = { ...def, x: 0, y: 0, vx: 0, vy: 0, facing: 1, grounded: true, evo: 0, w: def.w, h: def.h };
    drawCharacter(c, dummy, { x: -cv.width / 2 + dummy.w / 2, y: -cv.height / 2 + dummy.h / 2 - 8 }, tick);
  });
  requestAnimationFrame(paintPortraits);
}

function mark(id) {
  selectedId = id;
  document.querySelectorAll(".char-card").forEach((el) => el.classList.toggle("selected", el.dataset.id === id));
}

function clickStart(id) {
  const btn = document.querySelector('#chars .char-card[data-id="' + id + '"]');
  if (btn) btn.click();
}

function enhance() {
  const wrap = document.getElementById("chars");
  if (!wrap) return;
  const oldClick = new Map();
  wrap.querySelectorAll(".char-card").forEach((el) => {
    oldClick.set(el.dataset.id, el);
  });
  wrap.innerHTML = ROSTER.map((c, i) => {
    return '<button class="char-card" data-id="' + c.id + '" style="--tint:' + c.color + '">' +
      '<div class="portrait"><canvas data-id="' + c.id + '" width="196" height="118"></canvas></div>' +
      '<h3>' + c.name + '</h3>' +
      '<div class="role">' + (ROLES[c.id] || "Ohana") + '</div>' +
      '<small>' + c.evoNames.join(" → ") + '</small>' +
      '<div class="stats"><i>HP ' + c.health + '</i><i>SPD ' + c.speed + '</i><i>' + c.maxJumps + ' jump</i></div>' +
      '<div class="hint">tecla ' + (i + 1) + '</div></button>';
  }).join("");

  wrap.querySelectorAll(".char-card").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (el.classList.contains("selected")) {
        const ghost = oldClick.get(el.dataset.id);
        if (ghost) {
          wrap.appendChild(ghost);
          ghost.style.display = "none";
          ghost.click();
        }
      } else mark(el.dataset.id);
    });
  });
  mark(selectedId);

  const play = document.getElementById("btn-play");
  const neu = document.getElementById("btn-new");
  const startSel = () => {
    const card = wrap.querySelector('.char-card[data-id="' + selectedId + '"]');
    if (card) {
      card.classList.add("selected");
      card.click();
      card.click();
    }
  };
  if (play) play.onclick = startSel;
  if (neu) neu.onclick = startSel;

  const save = readSave();
  const cont = document.getElementById("btn-continue");
  if (save && save.id && cont) {
    cont.classList.remove("hidden");
    cont.onclick = () => {
      selectedId = save.id;
      startSel();
    };
  }

  addEventListener("keydown", (e) => {
    if (document.body.classList.contains("playing")) return;
    if (e.key === "Enter") startSel();
  });

  paintPortraits();
}

if (document.readyState === "loading") addEventListener("DOMContentLoaded", () => setTimeout(enhance, 50));
else setTimeout(enhance, 50);

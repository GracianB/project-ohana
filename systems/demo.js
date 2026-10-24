import { showTutorialMessage, setPersistentObjective } from "./notify.js";
import { formatObjective, objectiveForRoom } from "./objectives.js";

const HINTS = {
  move: {
    title: "MOVERSE",
    text: "A/D para avanzar y retroceder. W salta y S baja por las rutas.",
  },
  attack: {
    title: "ATAQUE",
    text: "H ataca. Encadena golpes cuando tengas espacio y no pierdas de vista al enemigo.",
  },
  ability: {
    title: "PODERES",
    text: "Prueba J para usar tu primer poder. Las siguientes formas añadirán habilidades a la barra inferior.",
  },
  interact: {
    title: "PORTALES",
    text: "E confirma el viaje en vórtices y catapultas. Nunca te llevan por sorpresa. Las formas despiertan automáticamente con tu experiencia.",
  },
  map: {
    title: "MAPA",
    text: "M abre el mapa. Úsalo para orientarte, no para vivir dentro de él.",
  },
  dash: {
    title: "DASH",
    text: "Shift hace dash. Úsalo para cruzar huecos y salir de ataques peligrosos.",
  },
  evolution: {
    title: "EVOLUCIÓN",
    text: "Los cristales dan XP. Al llenar la barra evolucionas automáticamente y desbloqueas nuevas habilidades.",
  },
};

const KEY_HINTS = new Map([
  ["a", "move"], ["d", "move"], ["w", "move"], ["s", "move"],
  ["h", "attack"],
  ["j", "ability"], ["k", "ability"], ["l", "ability"], ["i", "ability"], ["p", "ability"], ["u", "ability"],
  ["e", "interact"],
  ["m", "map"],
  ["shift", "dash"],
]);

function overlaysBlockHints() {
  return document.body.classList.contains("world1-story") || !!document.querySelector(
    "#world1-album.open, #pause-overlay.open, #map-overlay.open, #help.open, #evo-stage.show, #win-cinema.show"
  );
}

function paintGoal(detail) {
  const objective = objectiveForRoom(detail?.id, detail);
  if (!objective) return;
  setPersistentObjective(
    formatObjective(objective),
    !!objective.completed
  );
}

function boot() {
  let playing = false;
  let lastRoom=null;
  let evolutionHintShown = false;
  const seen = new Set();

  const showPowerHint = (key) => {
    if (!playing || overlaysBlockHints()) return;
    const slot = [...document.querySelectorAll(".ability-slot")].find(
      el => el.querySelector(".key")?.textContent?.trim().toLowerCase() === key
    );
    if (!slot) return;
    const locked = slot.classList.contains("locked");
    const token = "power:" + slot.dataset.id + ":" + locked;
    if (seen.has(token)) return;
    const name = slot.querySelector(".name")?.textContent || "Poder";
    const shown = showTutorialMessage(locked ? "PODER POR DESCUBRIR" : key.toUpperCase() + " · " + name,
      locked ? name + ": sigue recogiendo cristales. Despertará automáticamente al llegar a esa forma."
        : slot.title || name,
      {key: "tutorial:" + token});
    if (shown !== false) seen.add(token);
  };

  const showHint = (id) => {
    if (!playing || seen.has(id) || overlaysBlockHints()) return;
    const hint = HINTS[id];
    if (!hint) return;

    const shown = showTutorialMessage(hint.title, hint.text, {
      key: "tutorial:" + id,
    });
    if (shown !== false) seen.add(id);
  };

  const onKeyDown = (event) => {
    if (event.repeat) return;
    const key = String(event.key || "").toLowerCase();
    const id = KEY_HINTS.get(key);
    if (id === "ability") showPowerHint(key);
    else if (id) showHint(id);
  };

  const onPointerDown = (event) => {
    const key = String(
      event.target?.closest?.(".touch-btn")?.dataset?.k || ""
    ).toLowerCase();
    const id = KEY_HINTS.get(key);
    if (id === "ability") showPowerHint(key);
    else if (id) showHint(id);
  };

  const mo = new MutationObserver(() => {
    const next = document.body.classList.contains("playing");
    if (next === playing) return;

    playing = next;
    seen.clear();
    evolutionHintShown = false;

    if (playing) {
      if(lastRoom)paintGoal(lastRoom);
    } else {
      setPersistentObjective("");
    }
  });

  mo.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
  });

  addEventListener("ohana-power-used",event=>showPowerHint(String(event.detail?.key||"").toLowerCase()));
  addEventListener("keydown", onKeyDown, true);
  document.addEventListener("pointerdown", onPointerDown, true);

  addEventListener("ohana-room", (event) => {
    const detail = event.detail || {};
    lastRoom=detail;
    paintGoal(detail);

    if (
      playing &&
      !evolutionHintShown &&
      detail.id &&
      detail.id !== "hub"
    ) {
      evolutionHintShown = true;
      setTimeout(() => showHint("evolution"), 500);
    }
  });
}

boot();

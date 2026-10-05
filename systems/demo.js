import { showTutorialMessage, setPersistentObjective } from "./notify.js";

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
    text: "J, K y L usan habilidades desbloqueadas por tu evolución. U reserva el supremo para la forma 5.",
  },
  interact: {
    title: "PORTALES",
    text: "E activa portales y catapultas. También puede iniciar una evolución manual cuando corresponda.",
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

import { formatObjective, objectiveForRoom } from "./objectives.js";



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
  let evolutionHintShown = false;
  const seen = new Set();

  const showHint = (id) => {
    if (!playing || seen.has(id) || overlaysBlockHints()) return;
    const hint = HINTS[id];
    if (!hint) return;

    seen.add(id);
    showTutorialMessage(hint.title, hint.text, {
      key: "tutorial:" + id,
    });
  };

  const onKeyDown = (event) => {
    if (event.repeat) return;
    const key = String(event.key || "").toLowerCase();
    const id = KEY_HINTS.get(key);
    if (id) showHint(id);
  };

  const onPointerDown = (event) => {
    const key = String(event.target?.closest?.(".touch-btn")?.dataset?.k || "").toLowerCase();
    const id = KEY_HINTS.get(key);
    if (id) showHint(id);
  };

  const mo = new MutationObserver(() => {
    const next = document.body.classList.contains("playing");
    if (next === playing) return;

    playing = next;
    seen.clear();
    evolutionHintShown = false;

    if (playing) {
      setPersistentObjective("Explora el Claro y abre la ruta hacia la costa.");
    } else {
      setPersistentObjective("");
    }
  });

  mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  addEventListener("keydown", onKeyDown, true);
  document.addEventListener("pointerdown", onPointerDown, true);

  addEventListener("ohana-room", (event) => {
    const detail = event.detail || {};
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

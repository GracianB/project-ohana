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

const GOALS = {
  hub: { text: "Recoge los cristales y sigue por la costa hacia el este.", done: (d) => !!d.visited.beach },
  beach: { text: "Cruza el hueco y continúa hacia la jungla.", done: (d) => !!d.visited.jungle },
  jungle: { text: "Busca la bajada central y entra en la caldera cuando tengas la forma necesaria.", done: (d) => !!d.visited.volcano },
  volcano: { text: "Sigue hacia la derecha. La entrada del Nido está al final de la ruta.", done: (d) => !!d.visited.boss },
  boss: { text: "Derrota a la Reina del Nido.", done: (d) => !!d.won },
  cave: { text: "Ve hacia el laboratorio por la izquierda y consigue la forma necesaria.", done: (d) => !!d.visited.lab },
  lab: { text: "Vuelve a la cueva por la salida de la derecha.", done: (d) => !!d.visited.cave },
  ridge: { text: "Sube hacia la órbita y descubre la ruta que conecta con el agua.", done: (d) => !!d.visited.space },
  space: { text: "Entra en el vórtice de la derecha para bajar al arrecife.", done: (d) => !!d.visited.reef },
  reef: { text: "Recoge los cristales del agua y vuelve a la costa por arriba.", done: (d) => !!d.visited.beach }
};

const KEY_HINTS = new Map([
  ["a", "move"], ["d", "move"], ["w", "move"], ["s", "move"],
  ["h", "attack"],
  ["j", "ability"], ["k", "ability"], ["l", "ability"], ["u", "ability"],
  ["e", "interact"],
  ["m", "map"],
  ["shift", "dash"],
]);

function overlaysBlockHints() {
  return !!document.querySelector(
    "#pause-overlay.open, #map-overlay.open, #help.open, #evo-stage.show, #win-cinema.show"
  );
}

function paintGoal(detail) {
  const goal = GOALS[detail?.id];
  if (!goal) return;
  setPersistentObjective(goal.text, goal.done(detail));
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

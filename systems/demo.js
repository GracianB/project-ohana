import { showNotification, setObjectiveMessage } from "./notify.js";

const STEPS = [
  { id: "move", title: "MOVERSE", text: "WASD para moverte. H ataca. J, K y L desbloquean poderes. U usa el supremo en forma 5. E usa portales." },
  { id: "orb", title: "EVOLUCIÓN", text: "Los orbes amarillos dan XP. Cuando llenas la barra, evolucionas automáticamente." },
  { id: "evo", title: "CINCO FORMAS", text: "Cada personaje tiene cinco formas. Evoluciona para abrir nuevas habilidades y rutas." },
  { id: "map", title: "RUMBO", text: "M abre el mapa. Explora las salas, reúne fuerzas y llega hasta el Nido." },
  { id: "boss", title: "EL NIDO", text: "Jungla ↓ Caldera → Reina. Llega preparado y usa J, K y L según la situación." }
];

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

function paintGoal(detail) {
  const goal = GOALS[detail?.id];
  if (!goal) return;
  const done = goal.done(detail);
  setObjectiveMessage(goal.text, done);
}

function boot() {
  let step = 0;
  let playing = false;
  let timer = 0;

  const play = () => {
    if (!document.body.classList.contains("playing")) return;
    if (step < STEPS.length) {
      const item = STEPS[step++];
      showNotification(item.title, item.text, "tutorial", {
        key: "tutorial:" + item.id,
        duration: 5200,
        priority: 60
      });
      timer = setTimeout(play, 5800);
    }
  };

  const mo = new MutationObserver(() => {
    const next = document.body.classList.contains("playing");
    if (next === playing) return;
    playing = next;
    clearTimeout(timer);
    if (playing) {
      step = 0;
      setObjectiveMessage("Explora el Claro y abre la ruta hacia la costa.");
      timer = setTimeout(play, 1000);
    }
  });

  mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });

  addEventListener("ohana-room", (e) => {
    paintGoal(e.detail || {});
  });
}

boot();

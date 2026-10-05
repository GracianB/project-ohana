const HINTS = {
  "Claro Ohana": "Objetivo: recoge orbes. ESTE = Costa. Centro + salto = Cumbre.",
  "Costa Hoku": "No caigas al hueco del centro. ESTE pide forma 3.",
  "Jungla Alta": "Hueco del centro ABAJO = Caldera. Pide forma 4.",
  "Cueva Azul": "OESTE = Lab. ESTE = Claro.",
  "Alien Lab": "Sala cerrada. Solo se sale por ESTE.",
  "Cumbre": "Hueco ABAJO = Claro. ESTE = Órbita.",
  "Órbita": "Hueco ABAJO = Claro. No hay piso extra abajo.",
  "Caldera": "ESTE = Nido del jefe. OESTE = Jungla.",
  "Nido Final": "Derrota a la Reina. Después puedes seguir explorando o repetir el nido.",
  "Arrecife Abismo": "Explora el agua. ARRIBA vuelve a la Costa. E usa el portal."
};

const STEPS = [
  { id: "move", text: "WASD o controles táctiles para moverte. H ataca, J K L son poderes. E usa portales." },
  { id: "orb", text: "Los orbes amarillos dan XP. Al llenar la barra evolucionas automáticamente." },
  { id: "evo", text: "5 formas: bebé → base → evo → final → GOD." },
  { id: "map", text: "M abre el mapa. Visita las 8 salas y el nido te llama." },
  { id: "boss", text: "Jungla ↓ Caldera → ESTE jefe. J K L son poderes distintos." }
];

function ensure() {
  if (document.getElementById("demo-ribbon")) return;
  const ribbon = document.createElement("div");
  ribbon.id = "demo-ribbon";
  ribbon.innerHTML = "<b>MUNDO 1</b><span>Isla Hoku · contrato cerrado</span>";
  document.body.appendChild(ribbon);
  const obj = document.createElement("div");
  obj.id = "demo-obj";
  obj.textContent = "Explora el Claro.";
  document.body.appendChild(obj);
  const tut = document.createElement("div");
  tut.id = "demo-tut";
  document.body.appendChild(tut);
}

function showTut(text) {
  const el = document.getElementById("demo-tut");
  if (!el) return;
  el.textContent = text;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 4200);
}

const GOALS = {
  hub: { text: "Objetivo: abre la Costa por el este.", done: (d) => !!d.visited.beach },
  beach: { text: "Objetivo: no caigas al pozo. La jungla pide forma 3.", done: (d) => !!d.visited.jungle },
  jungle: { text: "Objetivo: baja a la Caldera. Pide forma 4.", done: (d) => !!d.visited.volcano },
  volcano: { text: "Objetivo: entra al Nido por el este.", done: (d) => !!d.visited.boss },
  boss: { text: "Objetivo: derrota a la Reina.", done: (d) => !!d.won },
  cave: { text: "Objetivo: el Lab está al oeste. Pide forma 2.", done: (d) => !!d.visited.lab },
  lab: { text: "Objetivo: sal por el este. No hay otra puerta.", done: (d) => !!d.visited.cave },
  ridge: { text: "Objetivo: la Órbita está al este.", done: (d) => !!d.visited.space },
  space: { text: "Objetivo: el vórtice secreto baja al Arrecife.", done: (d) => !!d.visited.reef },
  reef: { text: "Objetivo: sube y vuelve a la Costa.", done: (d) => !!d.visited.beach }
};

function paintGoal(detail) {
  const obj = document.getElementById("demo-obj");
  if (!obj || !detail) return;
  const goal = GOALS[detail.id];
  if (!goal) return;
  const done = goal.done(detail);
  obj.textContent = (done ? "Hecho · " : "") + goal.text;
  obj.classList.toggle("done", done);
}

function tick() {
  if (!document.body.classList.contains("playing")) return;
  const world = document.getElementById("hud-world")?.textContent || "";
  const obj = document.getElementById("demo-obj");
  if (obj && !obj.dataset.live && HINTS[world]) obj.textContent = HINTS[world];
}

function boot() {
  ensure();
  let step = 0;
  let playing = false;
  let timer = 0;
  const play = () => {
    if (!document.body.classList.contains("playing")) return;
    if (step < STEPS.length) {
      showTut(STEPS[step].text);
      step++;
      timer = setTimeout(play, 5200);
    }
  };
  const mo = new MutationObserver(() => {
    const next = document.body.classList.contains("playing");
    if (next === playing) return;
    playing = next;
    clearTimeout(timer);
    if (playing) {
      ensure();
      const ribbon = document.getElementById("demo-ribbon");
      if (ribbon) {
        ribbon.classList.remove("gone");
        clearTimeout(ribbon._hide);
        ribbon._hide = setTimeout(() => ribbon.classList.add("gone"), 2600);
      }
      step = 0;
      timer = setTimeout(play, 800);
    }
  });
  mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  addEventListener("ohana-room", (e) => {
    const obj = document.getElementById("demo-obj");
    if (obj) obj.dataset.live = "1";
    paintGoal(e.detail || {});
  });
  setInterval(tick, 400);
}

boot();

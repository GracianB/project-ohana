const HINTS = {};

const STEPS = [
  { id: "move", text: "WASD para moverte. H ataca. J desde el principio, K en forma 2, L en forma 3, U el supremo en forma 5. E usa portales." },
  { id: "orb", text: "Los orbes amarillos dan XP. Al llenar la barra evolucionas automáticamente." },
  { id: "evo", text: "5 formas: bebé → base → evo → final → GOD." },
  { id: "map", text: "M abre el mapa. Visita las 8 salas y el nido te llama." },
  { id: "boss", text: "Jungla ↓ Caldera → ESTE jefe. J K L son poderes distintos." }
];

function ensure() {
  if (document.getElementById("demo-ribbon")) return;
  const ribbon = document.createElement("div");
  ribbon.id = "demo-ribbon";
  ribbon.innerHTML = "<b>MUNDO 1</b><span>Isla Hoku</span>";
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
  hub: { text: "Recoge los cristales. La costa está a la derecha.", done: (d) => !!d.visited.beach },
  beach: { text: "No caigas al hueco. La jungla, a la derecha, pide la forma 3.", done: (d) => !!d.visited.jungle },
  jungle: { text: "El hueco del centro baja a la caldera. Pide la forma 4.", done: (d) => !!d.visited.volcano },
  volcano: { text: "La Reina está a la derecha.", done: (d) => !!d.visited.boss },
  boss: { text: "Derrota a la Reina del Nido.", done: (d) => !!d.won },
  cave: { text: "El laboratorio está a la izquierda. Pide la forma 2.", done: (d) => !!d.visited.lab },
  lab: { text: "Solo se sale por la derecha, de vuelta a la cueva.", done: (d) => !!d.visited.cave },
  ridge: { text: "La órbita está a la derecha. El hueco baja al claro.", done: (d) => !!d.visited.space },
  space: { text: "El vórtice de la derecha baja al arrecife.", done: (d) => !!d.visited.reef },
  reef: { text: "Recoge los cristales del agua. Arriba vuelves a la costa.", done: (d) => !!d.visited.beach }
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

function tick() {}

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

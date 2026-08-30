const HINTS = {
  "Claro Ohana": "Objetivo: recoge orbes. ESTE = Costa. Centro + salto = Cumbre.",
  "Costa Kauai": "No caigas al hueco del centro. ESTE pide forma 3.",
  "Jungla Alta": "Hueco del centro ABAJO = Caldera. Pide forma 4.",
  "Cueva Azul": "OESTE = Lab. ESTE = Claro.",
  "Alien Lab": "Sala cerrada. Solo se sale por ESTE.",
  "Cumbre": "Hueco ABAJO = Claro. ESTE = Órbita.",
  "Orbita": "Hueco ABAJO = Claro. No hay piso extra abajo.",
  "Caldera": "ESTE = Nido del jefe. OESTE = Jungla.",
  "Nido Final": "Tumba al nido. No es fácil. Al caer: contacta a Jun."
};

const STEPS = [
  { id: "move", text: "Muévete con WASD. Shift = dash. F = golpe." },
  { id: "orb", text: "Los orbes amarillos dan XP. Llena la barra y pulsa E." },
  { id: "evo", text: "5 formas: bebé → base → evo → final → GOD." },
  { id: "map", text: "M abre el mapa. Visita las 8 salas y el nido te llama." },
  { id: "boss", text: "Jungla ↓ Caldera → ESTE jefe. J K L son poderes distintos." }
];

function ensure() {
  if (document.getElementById("demo-ribbon")) return;
  const ribbon = document.createElement("div");
  ribbon.id = "demo-ribbon";
  ribbon.innerHTML = "<b>DEMO</b><span>Mundo 1 · Kauai</span>";
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

function tick() {
  if (!document.body.classList.contains("playing")) return;
  const world = document.getElementById("hud-world")?.textContent || "";
  const obj = document.getElementById("demo-obj");
  if (obj && HINTS[world]) obj.textContent = HINTS[world];
}

function boot() {
  ensure();
  let step = 0;
  const play = () => {
    if (!document.body.classList.contains("playing")) return;
    if (step < STEPS.length) {
      showTut(STEPS[step].text);
      step++;
      setTimeout(play, 5200);
    }
  };
  const mo = new MutationObserver(() => {
    if (document.body.classList.contains("playing")) {
      ensure();
      step = 0;
      setTimeout(play, 800);
    }
  });
  mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  setInterval(tick, 400);
}

boot();

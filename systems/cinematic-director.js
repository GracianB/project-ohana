// PROJECT OHANA V36 · Cinematic Director
// Coordinates high-level narrative beats without touching simulation state.
const reduce = () => {
  try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (_) { return false; }
};

let timer = 0;
function layer() {
  let el = document.getElementById("cinematic-beat");
  if (el) return el;
  el = document.createElement("div");
  el.id = "cinematic-beat";
  el.setAttribute("aria-live", "polite");
  el.setAttribute("aria-hidden", "true");
  el.innerHTML =
    '<div class="cb-bars" aria-hidden="true"></div>' +
    '<div class="cb-vignette" aria-hidden="true"></div>' +
    '<div class="cb-grain" aria-hidden="true"></div>' +
    '<div class="cb-copy"><p class="cb-kicker"></p><h2></h2><p class="cb-line"></p></div>';
  document.body.appendChild(el);
  return el;
}

function play({ type = "story", kicker = "", title = "", line = "", duration = 1700 } = {}) {
  const el = layer();
  clearTimeout(timer);
  el.className = type;
  el.querySelector(".cb-kicker").textContent = kicker;
  el.querySelector("h2").textContent = title;
  el.querySelector(".cb-line").textContent = line;
  el.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => el.classList.add("show"));
  timer = setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.setAttribute("aria-hidden", "true"), reduce() ? 20 : 520);
  }, reduce() ? Math.min(700, duration) : duration);
}

addEventListener("ohana-death", (event) => {
  const detail = event.detail || {};
  const lost = detail.reason === "void";
  const online = detail.reason === "online";
  play({
    type: "death",
    kicker: lost ? "ENTRE MUNDOS" : online ? "OHANA · 2 JUGADORES" : "OHANA",
    title: lost ? "EL VACÍO TE RECLAMA" : online ? "LA FAMILIA CAE JUNTA" : "TODAVÍA NO",
    line: lost ? "Algo viene a buscarte." : "Nadie se queda atrás. Ni siquiera aquí.",
    duration: 2500,
  });
});

addEventListener("ohana-boss-fall", () => {
  play({
    type: "boss-fall",
    kicker: "FINAL · EL NIDO",
    title: "LA REINA CAE",
    line: "La oscuridad se rompe.",
    duration: 2200,
  });
});

addEventListener("ohana-evolve", (event) => {
  const d = event.detail || {};
  document.body.classList.toggle("cinema-final-evolution", !!d.final);
});
addEventListener("ohana-evolve-done", () => {
  document.body.classList.remove("cinema-final-evolution");
});

export const cinematicDirector = { play };

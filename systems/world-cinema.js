const RM = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

const ROOM_CINEMA = {
  hub: ["ISLA HOKU", "CLARO OHANA", "Aquí empieza la familia."],
  beach: ["CAPÍTULO II", "COSTA HOKU", "El mar abre el camino."],
  jungle: ["CAPÍTULO III", "JUNGLA ALTA", "La isla empieza a defenderse."],
  cave: ["CAPÍTULO IV", "CUEVA AZUL", "Bajo Hoku también hay memoria."],
  lab: ["CAPÍTULO V", "ALIEN LAB", "Algo llegó antes que nosotros."],
  ridge: ["CAPÍTULO VI", "CUMBRE", "Por encima de las nubes."],
  space: ["CAPÍTULO VII", "ÓRBITA", "Hoku no termina en el cielo."],
  reef: ["CAPÍTULO VIII", "ARRECIFE ABISMO", "Donde la luz aprende a nadar."],
  volcano: ["CAPÍTULO IX", "CALDERA", "La última puerta arde."],
  boss: ["FINAL", "EL NIDO", "La Reina ha despertado."]
};

let timer = 0;
function layer() {
  let el = document.getElementById("world-cinema");
  if (el) return el;
  el = document.createElement("div");
  el.id = "world-cinema";
  el.setAttribute("aria-live", "polite");
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = '<div class="wc-bars"></div><div class="wc-vignette"></div><div class="wc-copy"><p class="wc-kicker"></p><h2></h2><p class="wc-line"></p></div><div class="wc-rule"></div>';
  document.body.appendChild(el);
  return el;
}
function play(detail={}) {
  const meta = ROOM_CINEMA[detail.id];
  if (!meta || detail.repeat) return;
  const el = layer();
  clearTimeout(timer);
  el.querySelector(".wc-kicker").textContent = meta[0];
  el.querySelector("h2").textContent = meta[1];
  el.querySelector(".wc-line").textContent = meta[2];
  el.className = detail.id === "boss" ? "boss" : "";
  el.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => el.classList.add("show"));
  timer = setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.setAttribute("aria-hidden", "true"), RM() ? 20 : 650);
  }, RM() ? 900 : detail.id === "boss" ? 3000 : 2200);
}
addEventListener("ohana-cinema-room", e => play(e.detail || {}));

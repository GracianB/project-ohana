const RM = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

const ROOM_CINEMA = {
  hub: { n: "01", act: "ISLA HOKU", title: "CLARO OHANA", line: "Aquí empieza la familia." },
  beach: { n: "02", act: "CAPÍTULO II", title: "COSTA HOKU", line: "El mar abre el camino." },
  jungle: { n: "03", act: "CAPÍTULO III", title: "JUNGLA ALTA", line: "La isla empieza a defenderse." },
  cave: { n: "04", act: "CAPÍTULO IV", title: "CUEVA AZUL", line: "Bajo Hoku también hay memoria." },
  lab: { n: "05", act: "CAPÍTULO V", title: "ALIEN LAB", line: "Algo llegó antes que nosotros." },
  ridge: { n: "06", act: "CAPÍTULO VI", title: "CUMBRE", line: "Por encima de las nubes." },
  space: { n: "07", act: "CAPÍTULO VII", title: "ÓRBITA", line: "Hoku no termina en el cielo." },
  reef: { n: "08", act: "CAPÍTULO VIII", title: "ARRECIFE ABISMO", line: "Donde la luz aprende a nadar." },
  volcano: { n: "09", act: "CAPÍTULO IX", title: "CALDERA", line: "La última puerta arde." },
  boss: { n: "10", act: "FINAL", title: "EL NIDO", line: "La Reina ha despertado." }
};

let timer = 0;
function layer() {
  let el = document.getElementById("world-cinema");
  if (el) return el;
  el = document.createElement("div");
  el.id = "world-cinema";
  el.setAttribute("aria-live", "polite");
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = '<div class="wc-bars"></div><div class="wc-vignette"></div><div class="wc-grid"></div><div class="wc-copy"><p class="wc-index"></p><p class="wc-kicker"></p><h2></h2><p class="wc-line"></p></div><div class="wc-rule"></div>';
  document.body.appendChild(el);
  return el;
}
function play(detail={}) {
  const meta = ROOM_CINEMA[detail.id];
  if (!meta || detail.repeat) return;
  const el = layer();
  clearTimeout(timer);
  el.querySelector(".wc-index").textContent = meta.n + " / 10";
  el.querySelector(".wc-kicker").textContent = meta.act;
  el.querySelector("h2").textContent = meta.title;
  el.querySelector(".wc-line").textContent = meta.line;
  el.className = "room-" + detail.id + (detail.id === "boss" ? " boss" : "");
  el.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => el.classList.add("show"));
  timer = setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.setAttribute("aria-hidden", "true"), RM() ? 20 : 650);
  }, RM() ? 900 : detail.id === "boss" ? 3000 : 2200);
}
addEventListener("ohana-cinema-room", e => play(e.detail || {}));

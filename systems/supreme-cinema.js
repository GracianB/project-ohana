// PROJECT OHANA V37 · SUPREME CINEMA
// Short, non-blocking signature reveal for U. Gameplay keeps moving underneath.
const reduced = () => {
  try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (_) { return false; }
};

let hideTimer = 0;
let settleTimer = 0;
let generation = 0;

function clearCinemaTimers() {
  clearTimeout(hideTimer);
  clearTimeout(settleTimer);
  hideTimer = 0;
  settleTimer = 0;
}

function mount() {
  let el = document.getElementById("supreme-cinema");
  if (el) return el;
  el = document.createElement("section");
  el.id = "supreme-cinema";
  el.setAttribute("aria-live", "polite");
  el.setAttribute("aria-hidden", "true");
  el.dataset.state = "idle";
  el.dataset.generation = "0";
  el.innerHTML =
    '<div class="sc-bars" aria-hidden="true"></div>' +
    '<div class="sc-wash" aria-hidden="true"></div>' +
    '<div class="sc-motif" aria-hidden="true"><i></i><i></i><i></i><i></i></div>' +
    '<div class="sc-copy">' +
      '<p class="sc-kicker">U · SUPREMA</p>' +
      '<h2></h2>' +
      '<p class="sc-line"></p>' +
      '<p class="sc-text"></p>' +
      '<div class="sc-meta"><span class="sc-flow"></span><span class="sc-assist"></span></div>' +
    '</div>';
  document.body.appendChild(el);
  return el;
}

function play(detail = {}) {
  const el = mount();
  clearCinemaTimers();
  const token = ++generation;
  const kind = String(detail.kind || "bloom").replace(/[^a-z0-9-]/gi, "");
  el.className = "kind-" + kind;
  el.style.setProperty("--supreme", detail.color || "#ffe66a");
  el.querySelector("h2").textContent = detail.name || "SUPREMA";
  el.querySelector(".sc-line").textContent = detail.line || "";
  el.querySelector(".sc-text").textContent = detail.text || "";
  const flow = el.querySelector(".sc-flow");
  const assist = el.querySelector(".sc-assist");
  const flowText = detail.flow ? detail.flow + " · x" + Number(detail.multiplier || 1).toFixed(2) : "";
  flow.textContent = flowText;
  flow.hidden = !flowText;
  const assistText = detail.assist ? "OHANA ASSIST · " + String(detail.assist).toUpperCase() : "";
  assist.textContent = assistText;
  assist.hidden = !assistText;
  el.setAttribute("aria-hidden", "false");
  el.dataset.state = "active";
  el.dataset.generation = String(token);
  el.classList.remove("show");
  void el.offsetWidth;
  el.classList.add("show");

  const visibleFor = reduced() ? 1400 : 2200;
  el.dataset.duration = String(visibleFor);
  hideTimer = setTimeout(() => {
    if (token !== generation) return;
    el.dataset.state = "leaving";
    el.classList.remove("show");
    settleTimer = setTimeout(() => {
      if (token !== generation) return;
      el.setAttribute("aria-hidden", "true");
      el.dataset.state = "idle";
    }, reduced() ? 30 : 380);
  }, visibleFor);
}

if (!window.__ohanaSupremeCinema) {
  window.__ohanaSupremeCinema = true;
  addEventListener("ohana-supreme", (event) => play(event?.detail || {}));
}

export const supremeCinema = { play };

export function playIntro(kind, name, done) {
  let el = document.getElementById("start-intro");
  if (!el) {
    el = document.createElement("div");
    el.id = "start-intro";
    el.innerHTML =
      '<div class="intro-wash"></div>' +
      '<div class="intro-card">' +
        '<p class="intro-kicker"></p>' +
        '<h2 class="intro-title"></h2>' +
        '<p class="intro-sub"></p>' +
      '</div>';
    document.body.appendChild(el);
  }
  el.querySelector(".intro-kicker").textContent = kind === "resume" ? "Continuar" : "Nueva partida";
  el.querySelector(".intro-title").textContent = name || "Ohana";
  el.querySelector(".intro-sub").textContent = kind === "resume" ? "Se recupera tu forma y sala" : "Empiezas como bebé";
  el.classList.remove("show");
  void el.offsetWidth;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => {
    el.classList.remove("show");
    if (done) done();
  }, 1300);
}

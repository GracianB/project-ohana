/**
 * Cinemática corta al empezar (1.5–3s). Skippable con click/tecla.
 * API: playIntro(kind, name, done) — compatible con title.js
 */
export function playIntro(kind, name, done) {
  let el = document.getElementById("start-intro");
  if (!el) {
    el = document.createElement("div");
    el.id = "start-intro";
    el.innerHTML =
      '<div class="intro-wash"></div>' +
      '<div class="intro-wipe"></div>' +
      '<div class="intro-ring" aria-hidden="true"></div>' +
      '<div class="intro-card">' +
        '<p class="intro-kicker"></p>' +
        '<h2 class="intro-title"></h2>' +
        '<p class="intro-sub"></p>' +
        '<p class="intro-skip">Click o tecla para saltar</p>' +
      '</div>';
    document.body.appendChild(el);
  }

  const reduce = (() => {
    try {
      return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    } catch (_) {
      return false;
    }
  })();

  el.querySelector(".intro-kicker").textContent = kind === "resume" ? "Continuar" : "Nueva partida";
  el.querySelector(".intro-title").textContent = name || "Ohana";
  el.querySelector(".intro-sub").textContent =
    kind === "resume" ? "Se recupera tu forma y sala" : "Empiezas como bebé · Rumbo al Claro";

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    clearTimeout(el._t);
    el.classList.remove("show");
    el.classList.add("out");
    el.removeEventListener("pointerdown", onSkip);
    window.removeEventListener("keydown", onKey);
    setTimeout(() => {
      el.classList.remove("out");
      if (done) done();
    }, reduce ? 120 : 280);
  };

  const onSkip = () => finish();
  const onKey = (ev) => {
    if (ev.key === "Enter" || ev.key === " " || ev.key === "Escape") {
      ev.preventDefault();
      finish();
    }
  };

  el.classList.remove("show", "out");
  void el.offsetWidth;
  el.classList.add("show");
  el.addEventListener("pointerdown", onSkip, { passive: true });
  window.addEventListener("keydown", onKey);

  // 1.5–2.6s window; reduced-motion shorter but still readable
  const ms = reduce ? 900 : 2200;
  clearTimeout(el._t);
  el._t = setTimeout(finish, ms);
}

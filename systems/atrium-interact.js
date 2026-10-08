// Atrium pointer. Wakes a hero under the orb and selects on click.
// Selection still goes through the existing ohana-select event.
const stage = document.getElementById("char-select");
const grid = document.getElementById("chars-grid");
if (stage && grid) {
  const orb = document.createElement("div");
  orb.id = "atrium-orb";
  orb.setAttribute("aria-hidden", "true");
  const plate = document.createElement("div");
  plate.id = "atrium-name";
  plate.setAttribute("aria-hidden", "true");
  document.body.append(orb, plate);

  const fine = window.matchMedia("(pointer:fine)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function cards() {
    return [...grid.querySelectorAll(".char-card")];
  }

  function layout() {
    const list = cards();
    if (!list.length) return;
    const n = list.length;
    const selected = list.findIndex((el) => el.classList.contains("selected"));
    const origin = selected < 0 ? 0 : selected;
    const radius = Math.min(stage.clientWidth * 0.34, 280);
    list.forEach((el, i) => {
      const delta = ((i - origin + n) % n);
      const signed = delta > n / 2 ? delta - n : delta;
      const ang = signed * (108 / Math.max(1, n - 1));
      el.style.setProperty("--ang", ang + "deg");
      el.style.setProperty("--rad", radius + "px");
      el.setAttribute("aria-hidden", "false");
    });
    stage.classList.add("atrium-on");
  }

  function wake(el) {
    cards().forEach((card) => card.classList.toggle("is-awake", card === el));
    orb.classList.toggle("hot", !!el);
    if (!el) {
      plate.classList.remove("on");
      return;
    }
    const name = el.querySelector("h3")?.textContent || el.dataset.id || "";
    plate.textContent = name;
    plate.classList.add("on");
  }

  function hit(x, y) {
    const stack = document.elementsFromPoint(x, y);
    return stack.find((node) => node.classList?.contains("char-card")) || null;
  }

  stage.addEventListener("pointermove", (e) => {
    if (!fine) return;
    orb.style.left = e.clientX + "px";
    orb.style.top = e.clientY + "px";
    plate.style.left = e.clientX + "px";
    plate.style.top = (e.clientY - 28) + "px";
    orb.classList.add("on");
    wake(hit(e.clientX, e.clientY));
  });
  stage.addEventListener("pointerleave", () => {
    orb.classList.remove("on");
    wake(null);
  });
  stage.addEventListener("pointerdown", (e) => {
    const el = hit(e.clientX, e.clientY);
    if (!el?.dataset.id) return;
    dispatchEvent(new CustomEvent("ohana-select", { detail: { id: el.dataset.id } }));
    wake(el);
  });

  const obs = new MutationObserver(layout);
  obs.observe(grid, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  addEventListener("resize", layout);
  const boot = () => { if (cards().length) layout(); else setTimeout(boot, 120); };
  boot();
  if (reduced) orb.style.transition = "none";
}

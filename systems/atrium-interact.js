// Atrium stage. The family answers the pointer. Art stays in the character files.
const stage = document.getElementById("char-select");
const grid = document.getElementById("chars-grid");
if (stage && grid) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer:fine)").matches;
  const cv = document.createElement("canvas");
  cv.id = "atrium-fx";
  const orb = document.createElement("div");
  orb.id = "atrium-orb";
  orb.setAttribute("aria-hidden", "true");
  const plate = document.createElement("div");
  plate.id = "atrium-plate";
  plate.innerHTML = "<b></b><span></span>";
  document.body.append(cv, orb, plate);
  const ctx = cv.getContext("2d");
  const sparks = [];
  const pointer = { x: innerWidth / 2, y: innerHeight / 2, on: false };
  let awake = null;

  function cards() { return [...grid.querySelectorAll(".char-card")]; }
  function muted() { return document.getElementById("btn-mute")?.getAttribute("aria-pressed") === "true"; }
  function colorOf(el) {
    const sw = el.querySelector(".swatch");
    return sw ? getComputedStyle(sw).backgroundColor : "rgb(158,231,255)";
  }
  function tone(freq, ms, gain) {
    if (muted() || reduced) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ac = tone.ac || (tone.ac = new AC());
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + ms / 1000);
    o.connect(g); g.connect(ac.destination);
    o.start(); o.stop(ac.currentTime + ms / 1000);
  }
  function burst(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 1.2 + Math.random() * 3.4;
      sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1.2, life: 1, color });
    }
  }
  function layout() {
    const list = cards();
    if (!list.length) return;
    const n = list.length;
    const selected = Math.max(0, list.findIndex((el) => el.classList.contains("selected")));
    const radius = Math.min(stage.clientWidth * 0.38, 320);
    list.forEach((el, i) => {
      const delta = (i - selected + n) % n;
      const signed = delta > n / 2 ? delta - n : delta;
      const ang = signed * (128 / Math.max(1, n - 1));
      el.style.setProperty("--ang", ang.toFixed(2) + "deg");
      el.style.setProperty("--rad", (radius + Math.abs(signed) * 6) + "px");
      el.style.setProperty("--bob", (i * 0.17) + "s");
      el.setAttribute("aria-hidden", "false");
    });
    stage.classList.add("atrium-on");
  }
  function wake(el) {
    if (awake === el) return;
    awake = el;
    cards().forEach((card) => card.classList.toggle("is-awake", card === el));
    orb.classList.toggle("hot", !!el);
    const name = plate.querySelector("b");
    const line = plate.querySelector("span");
    if (!el) { plate.classList.remove("on"); return; }
    name.textContent = el.querySelector("h3")?.textContent || el.dataset.id || "";
    line.textContent = el.querySelector(".role")?.textContent || "La familia te ve";
    plate.classList.add("on");
    const r = el.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height * 0.45, colorOf(el), 14);
    tone(520 + cards().indexOf(el) * 28, 90, 0.03);
  }
  function hit(x, y) {
    return document.elementsFromPoint(x, y).find((node) => node.classList?.contains("char-card")) || null;
  }
  function cheer() {
    cards().forEach((card) => {
      card.classList.remove("is-cheer");
      void card.offsetWidth;
      card.classList.add("is-cheer");
    });
    burst(pointer.x, pointer.y, "rgb(255,214,140)", 28);
    tone(660, 120, 0.04);
    setTimeout(() => tone(880, 140, 0.03), 70);
  }
  stage.addEventListener("pointermove", (e) => {
    pointer.x = e.clientX; pointer.y = e.clientY; pointer.on = fine;
    orb.style.left = e.clientX + "px";
    orb.style.top = e.clientY + "px";
    plate.style.left = e.clientX + "px";
    plate.style.top = (e.clientY - 18) + "px";
    orb.classList.add("on");
    if (Math.random() < 0.45) sparks.push({ x: e.clientX, y: e.clientY, vx: (Math.random() - 0.5) * 0.6, vy: -0.4, life: 0.7, color: "rgba(190,240,255,.9)" });
    wake(hit(e.clientX, e.clientY));
  });
  stage.addEventListener("pointerleave", () => { pointer.on = false; orb.classList.remove("on"); wake(null); });
  stage.addEventListener("pointerdown", (e) => {
    const el = hit(e.clientX, e.clientY);
    if (!el?.dataset.id) return;
    dispatchEvent(new CustomEvent("ohana-select", { detail: { id: el.dataset.id } }));
    wake(el);
    cheer();
  });
  new MutationObserver(layout).observe(grid, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  addEventListener("resize", () => { cv.width = innerWidth; cv.height = innerHeight; layout(); });
  cv.width = innerWidth; cv.height = innerHeight;
  const boot = () => cards().length ? layout() : setTimeout(boot, 120);
  boot();
  (function frame() {
    if (!reduced && ctx) {
      ctx.clearRect(0, 0, cv.width, cv.height);
      if (pointer.on) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(190,240,255,.25)";
        ctx.lineWidth = 1;
        ctx.arc(pointer.x, pointer.y, 18 + Math.sin(performance.now() / 180) * 3, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.03; p.life -= 0.02;
        if (p.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6 + p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    requestAnimationFrame(frame);
  })();
}

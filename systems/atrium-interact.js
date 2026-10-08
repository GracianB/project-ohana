// The family plays back. Character paint stays in characters/.
const stage = document.getElementById("char-select");
const grid = document.getElementById("chars-grid");
if (stage && grid) {
  const LINES = {
    kilo: ["¡Polen!", "Te guardo sitio", "Ukulele listo"],
    stitcho: ["¡Pared!", "Plasma on", "Te trepo"],
    chispin: ["¡Chispa!", "Cadena lista", "Bzz"],
    cat: ["Miau", "Nueve vidas", "Sombra"],
    dragon: ["¡Fuego suave!", "Ala", "Meteoro"],
    dino: ["¡Pisotón!", "Grrr", "Te cubro"],
    frita: ["¡Kétchup!", "Resbalón", "Corre"],
    pizza: ["¡Horno!", "Queso", "Rebote"],
    yomi: ["Ofuda", "Paso hueco", "Shhh"],
    cuerno: ["¡Arcoíris!", "Galope", "Brillo"]
  };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer:fine)").matches;
  const cv = document.createElement("canvas");
  cv.id = "atrium-fx";
  const orb = document.createElement("div");
  orb.id = "atrium-orb";
  const plate = document.createElement("div");
  plate.id = "atrium-plate";
  plate.innerHTML = "<b></b><span></span>";
  const banner = document.createElement("div");
  banner.id = "atrium-banner";
  banner.textContent = "OHANA";
  document.body.append(cv, orb, plate, banner);
  const ctx = cv.getContext("2d");
  const sparks = [];
  const ripples = [];
  const greeted = new Set();
  const pointer = { x: innerWidth * .5, y: innerHeight * .4, on: false };
  let awake = null;
  let gagAt = 0, lastAtriumFrame = 0, pointerPending = false, fxRaf = 0;
  const ATRIUM_FRAME_INTERVAL_MS = 65; // ~15fps animated lines; heroes have separate budgets.

  const cards = () => [...grid.querySelectorAll(".char-card")];
  const muted = () => document.getElementById("btn-mute")?.getAttribute("aria-pressed") === "true";
  const colorOf = (el) => getComputedStyle(el.querySelector(".swatch") || el).backgroundColor || "rgb(190,240,255)";
  function tone(freq, ms, gain) {
    if (muted() || reduced) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ac = tone.ac || (tone.ac = new AC());
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "triangle";
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + ms / 1000);
    o.connect(g); g.connect(ac.destination);
    o.start(); o.stop(ac.currentTime + ms / 1000);
  }
  function burst(x, y, color, n, up) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 1 + Math.random() * 4;
      sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - (up || 1), life: 1, color });
    }
  }
  function center(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height * .42 };
  }
  function gag(el, text) {
    const g = document.createElement("div");
    g.className = "atrium-gag";
    g.textContent = text;
    const c = center(el);
    g.style.left = c.x + "px";
    g.style.top = (c.y - 36) + "px";
    document.body.append(g);
    setTimeout(() => g.remove(), 1500);
  }
  function layout() {
    const list = cards();
    if (!list.length) return;
    const n = list.length;
    const selected = Math.max(0, list.findIndex((el) => el.classList.contains("selected")));
    const radius = Math.min(stage.clientWidth * .4, 340);
    list.forEach((el, i) => {
      const signed = ((i - selected + n) % n);
      const d = signed > n / 2 ? signed - n : signed;
      el.style.setProperty("--ang", (d * (136 / Math.max(1, n - 1))).toFixed(2) + "deg");
      el.style.setProperty("--rad", (radius + Math.abs(d) * 8) + "px");
      el.style.setProperty("--bob", (i * .15) + "s");
      el.setAttribute("aria-hidden", "false");
    });
    stage.classList.add("atrium-on");
  }
  function lean() {
    cards().forEach((el) => {
      const c = center(el);
      const dx = (pointer.x - c.x) / 28;
      const dy = (pointer.y - c.y) / 36;
      el.style.setProperty("--leanx", Math.max(-14, Math.min(14, dx)).toFixed(1) + "px");
      el.style.setProperty("--leany", Math.max(-10, Math.min(10, dy)).toFixed(1) + "px");
    });
  }
  function wake(el) {
    if (awake === el) return;
    awake = el;
    cards().forEach((card) => card.classList.toggle("is-awake", card === el));
    orb.classList.toggle("hot", !!el);
    if (!el) { plate.classList.remove("on"); return; }
    plate.querySelector("b").textContent = el.querySelector("h3")?.textContent || "";
    const bag = LINES[el.dataset.id] || ["¡Hey!"];
    plate.querySelector("span").textContent = bag[0];
    plate.classList.add("on");
    const c = center(el);
    burst(c.x, c.y, colorOf(el), 16, 1.4);
    el.classList.add("is-hop");
    setTimeout(() => el.classList.remove("is-hop"), 420);
    gag(el, bag[Math.floor(Math.random() * bag.length)]);
    tone(480 + cards().indexOf(el) * 32, 80, .035);
    if (!greeted.has(el.dataset.id)) {
      greeted.add(el.dataset.id);
      if (greeted.size === cards().length) {
        banner.classList.add("on");
        burst(innerWidth / 2, innerHeight * .42, "rgb(255,220,140)", 48, 2);
        tone(523, 140, .05); setTimeout(() => tone(659, 160, .04), 90); setTimeout(() => tone(784, 200, .04), 180);
        setTimeout(() => banner.classList.remove("on"), 1400);
      }
    }
  }
  function hit(x, y) {
    return document.elementsFromPoint(x, y).find((n) => n.classList && n.classList.contains("char-card")) || null;
  }
  function waveFrom(el) {
    const list = cards();
    const i = list.indexOf(el);
    list.forEach((card, k) => {
      const dist = Math.min(Math.abs(k - i), list.length - Math.abs(k - i));
      setTimeout(() => {
        card.classList.add("is-wave");
        const c = center(card);
        burst(c.x, c.y, colorOf(card), 8, .6);
        setTimeout(() => card.classList.remove("is-wave"), 360);
      }, dist * 70);
    });
  }
  // At most one DOM/layout update per display frame, regardless of pointer Hz.
  stage.addEventListener("pointermove", (e) => {
    pointer.x = e.clientX; pointer.y = e.clientY; pointer.on = fine;
    if (pointerPending) return;
    pointerPending = true;
    requestAnimationFrame(() => {
      pointerPending = false;
      if (document.body.classList.contains("playing") || document.visibilityState === "hidden") return;
      orb.style.left = pointer.x + "px"; orb.style.top = pointer.y + "px";
      plate.style.left = pointer.x + "px"; plate.style.top = (pointer.y - 16) + "px";
      orb.classList.add("on");
      if (Math.random() < .4) sparks.push({ x: pointer.x, y: pointer.y, vx: (Math.random()-.5)*.8, vy: -.5, life:.65, color:"rgba(200,245,255,.95)" });
      lean();
      wake(hit(pointer.x, pointer.y));
    });
  }, { passive:true });
  stage.addEventListener("pointerleave", () => { pointer.on = false; orb.classList.remove("on"); wake(null); });
  stage.addEventListener("pointerdown", (e) => {
    const el = hit(e.clientX, e.clientY);
    if (!el || !el.dataset.id) return;
    dispatchEvent(new CustomEvent("ohana-select", { detail: { id: el.dataset.id } }));
    ripples.push({ x: e.clientX, y: e.clientY, r: 8, life: 1 });
    wake(el);
    waveFrom(el);
    tone(698, 110, .04);
  });
  new MutationObserver(layout).observe(grid, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  addEventListener("resize", () => { cv.width = innerWidth; cv.height = innerHeight; layout(); });
  cv.width = innerWidth; cv.height = innerHeight;
  const boot = () => cards().length ? layout() : setTimeout(boot, 120);
  boot();
  setInterval(() => {
    if (reduced || document.body.classList.contains("playing")) return;
    const list = cards().filter((el) => !el.classList.contains("selected"));
    if (!list.length || performance.now() - gagAt < 2400) return;
    const el = list[Math.floor(Math.random() * list.length)];
    const bag = LINES[el.dataset.id] || ["..."];
    gag(el, bag[Math.floor(Math.random() * bag.length)]);
    el.classList.add("is-hop");
    setTimeout(() => el.classList.remove("is-hop"), 420);
    gagAt = performance.now();
  }, 2600);
  function frame(now) {
    fxRaf = 0;
    // Do not even schedule callbacks while the game is playing or tab is hidden.
    // visibilitychange and the playing class mutation restart the scene later.
    if (reduced || !ctx || document.body.classList.contains("playing") ||
        document.visibilityState === "hidden") return;
    if (lastAtriumFrame && now - lastAtriumFrame < ATRIUM_FRAME_INTERVAL_MS) {
      fxRaf = requestAnimationFrame(frame);
      return;
    }
    lastAtriumFrame = now;
    ctx.clearRect(0, 0, cv.width, cv.height);
    const list = cards();
    // Compute rectangles once per painted frame, never again for the ten lines.
    const centers = list.map(center);
    ctx.lineWidth = 1;
    for (let i = 0; i < list.length; i++) {
        const a = centers[i];
        const b = centers[(i + 1) % list.length];
        ctx.strokeStyle = "rgba(190,230,255,.16)";
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      if (awake) {
        const c = centers[list.indexOf(awake)] || center(awake);
        ctx.strokeStyle = "rgba(255,220,150,.55)";
        ctx.beginPath(); ctx.moveTo(pointer.x, pointer.y); ctx.lineTo(c.x, c.y); ctx.stroke();
      }
      const sel = list.find((el) => el.classList.contains("selected"));
      if (sel) {
        const c = centers[list.indexOf(sel)] || center(sel);
        for (let i = 0; i < 6; i++) {
          const a = now / 700 + i;
          ctx.fillStyle = "rgba(255,220,150,.8)";
          ctx.beginPath();
          ctx.arc(c.x + Math.cos(a) * 70, c.y + Math.sin(a * 1.3) * 28, 2.2, 0, 7);
          ctx.fill();
        }
      }
      ripples.forEach((r) => {
        ctx.strokeStyle = "rgba(255,214,140," + r.life + ")";
        ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, 7); ctx.stroke();
        r.r += 6; r.life -= .03;
      });
      for (let i = ripples.length - 1; i >= 0; i--) if (ripples[i].life <= 0) ripples.splice(i, 1);
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.x += p.vx; p.y += p.vy; p.vy += .035; p.life -= .018;
        if (p.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.5 + p.life * 1.6, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
    fxRaf = requestAnimationFrame(frame);
  }
  function resumeFx() {
    if (reduced || fxRaf || document.body.classList.contains("playing") ||
        document.visibilityState === "hidden") return;
    lastAtriumFrame = 0;
    fxRaf = requestAnimationFrame(frame);
  }
  document.addEventListener("visibilitychange", resumeFx);
  new MutationObserver(resumeFx).observe(document.body, {
    attributes: true, attributeFilter: ["class"]
  });
  resumeFx();
}

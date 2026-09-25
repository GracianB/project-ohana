// Cinematic animated backdrop for the PROJECT OHANA title screen.
// Self-contained: parallax stars, bioluminescent island silhouette,
// drifting spores, aurora ribbons and a pointer-reactive spotlight.
// Respects prefers-reduced-motion and pauses while the game is playing.

const cv = document.getElementById("title-fx");
if (cv) {
  const ctx = cv.getContext("2d", { alpha: true });
  const RMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduce = RMQ.matches;
  try { RMQ.addEventListener("change", (e) => { reduce = e.matches; }); } catch (_) {}

  let W = 0, H = 0, dpr = 1;
  let stars = [], spores = [], islands = [];
  const pointer = { x: 0.5, y: 0.35, tx: 0.5, ty: 0.35 };
  let raf = 0, t = 0;

  function rand(a, b) { return a + Math.random() * (b - a); }

  function build() {
    stars = [];
    const n = Math.round((W * H) / 9000);
    for (let i = 0; i < n; i++) {
      const depth = Math.random();
      stars.push({
        x: Math.random(), y: Math.random() * 0.82,
        r: 0.5 + depth * 1.8,
        tw: rand(0, Math.PI * 2),
        sp: 0.6 + depth * 1.6,
        hue: Math.random() < 0.5 ? "126,231,255" : (Math.random() < 0.5 ? "255,230,140" : "255,150,200"),
      });
    }
    spores = [];
    const m = Math.round((W * H) / 42000);
    for (let i = 0; i < m; i++) {
      spores.push({
        x: Math.random(), y: Math.random(),
        r: rand(1.4, 4.2),
        vx: rand(-0.06, 0.06), vy: rand(-0.16, -0.04),
        life: Math.random(),
        hue: Math.random() < 0.6 ? "126,231,255" : "255,214,120",
      });
    }
    // Layered island silhouettes across the bottom.
    islands = [
      { cx: 0.28, w: 0.62, h: 0.20, col: "6,20,30", y: 1.0 },
      { cx: 0.74, w: 0.52, h: 0.16, col: "8,26,36", y: 1.0 },
      { cx: 0.5, w: 0.9, h: 0.12, col: "4,14,22", y: 1.03 },
    ];
  }

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = cv.clientWidth || window.innerWidth;
    H = cv.clientHeight || window.innerHeight;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  function island(is) {
    const cx = is.cx * W, baseY = is.y * H, w = is.w * W, h = is.h * H;
    ctx.beginPath();
    ctx.moveTo(cx - w / 2, baseY);
    // rolling ridge with two humps
    ctx.bezierCurveTo(cx - w * 0.3, baseY - h, cx - w * 0.12, baseY - h * 0.7, cx, baseY - h * 0.95);
    ctx.bezierCurveTo(cx + w * 0.16, baseY - h * 1.15, cx + w * 0.34, baseY - h * 0.55, cx + w / 2, baseY);
    ctx.closePath();
    ctx.fillStyle = "rgb(" + is.col + ")";
    ctx.fill();
  }

  function frame() {
    if (document.body.classList.contains("playing")) { raf = 0; return; }
    t += reduce ? 0 : 1;
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;
    ctx.clearRect(0, 0, W, H);

    // Aurora ribbons.
    if (!reduce) {
      for (let a = 0; a < 2; a++) {
        const yy = H * (0.16 + a * 0.12);
        const grad = ctx.createLinearGradient(0, yy - 60, 0, yy + 90);
        const c = a === 0 ? "126,231,255" : "255,120,180";
        grad.addColorStop(0, "rgba(" + c + ",0)");
        grad.addColorStop(0.5, "rgba(" + c + ",0.10)");
        grad.addColorStop(1, "rgba(" + c + ",0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, yy);
        for (let x = 0; x <= W; x += 40) {
          const y = yy + Math.sin(x / 220 + t / (60 + a * 20) + a) * (26 + a * 10);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, yy + 120); ctx.lineTo(0, yy + 120);
        ctx.closePath(); ctx.fill();
      }
    }

    // Stars.
    for (const s of stars) {
      const px = (s.x + (pointer.x - 0.5) * 0.02 * s.sp) * W;
      const py = s.y * H;
      const tw = reduce ? 0.8 : 0.55 + Math.sin(t / 22 * s.sp + s.tw) * 0.45;
      ctx.globalAlpha = tw;
      ctx.fillStyle = "rgba(" + s.hue + ",1)";
      ctx.beginPath(); ctx.arc(px, py, s.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Big moon with pointer-reactive halo.
    // En pantallas estrechas la luna se aparta del título (esquina superior).
    const narrow = W < 700;
    const mR = narrow ? 46 : Math.min(92, H * 0.11);
    const mx = W * 0.5, my = H * 0.16;
    const halo = ctx.createRadialGradient(mx, my, 8, mx, my, mR * 2.6);
    halo.addColorStop(0, "rgba(255,240,190,0.5)");
    halo.addColorStop(0.35, "rgba(255,220,140,0.18)");
    halo.addColorStop(1, "rgba(126,231,255,0)");
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(mx, my, mR * 2.6, 0, Math.PI * 2); ctx.fill();
    const mg = ctx.createRadialGradient(mx - mR * 0.24, my - mR * 0.24, mR * 0.1, mx, my, mR * 1.03);
    mg.addColorStop(0, "#fff8e0"); mg.addColorStop(0.55, "#f2d590"); mg.addColorStop(1, "#c9a24a");
    ctx.fillStyle = mg;
    ctx.beginPath(); ctx.arc(mx, my, mR, 0, Math.PI * 2); ctx.fill();
    const reflect = ctx.createRadialGradient(mx, H * 0.78, 4, mx, H * 0.78, mR * 3.2);
    reflect.addColorStop(0, "rgba(255,236,180,0.28)");
    reflect.addColorStop(1, "rgba(255,236,180,0)");
    ctx.fillStyle = reflect;
    ctx.beginPath(); ctx.ellipse(mx, H * 0.8, mR * 2.4, mR * 0.55, 0, 0, Math.PI * 2); ctx.fill();

    // Spores drifting up.
    for (const sp of spores) {
      if (!reduce) {
        sp.x += sp.vx / W * 60; sp.y += sp.vy / H * 60;
        sp.life += 0.006;
      }
      if (sp.y < -0.05) { sp.y = 1.05; sp.x = Math.random(); }
      if (sp.x < -0.05) sp.x = 1.05; if (sp.x > 1.05) sp.x = -0.05;
      const px = sp.x * W, py = sp.y * H;
      const a = 0.25 + Math.sin(sp.life * 4) * 0.2;
      const g = ctx.createRadialGradient(px, py, 0, px, py, sp.r * 3);
      g.addColorStop(0, "rgba(" + sp.hue + "," + Math.max(0, a) + ")");
      g.addColorStop(1, "rgba(" + sp.hue + ",0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(px, py, sp.r * 3, 0, Math.PI * 2); ctx.fill();
    }

    // Water shimmer band.
    const wl = ctx.createLinearGradient(0, H * 0.72, 0, H);
    wl.addColorStop(0, "rgba(20,120,150,0)");
    wl.addColorStop(1, "rgba(12,60,90,0.35)");
    ctx.fillStyle = wl;
    ctx.fillRect(0, H * 0.72, W, H * 0.28);
    if (!reduce) {
      ctx.strokeStyle = "rgba(150,230,255,0.10)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const yy = H * (0.8 + i * 0.035);
        ctx.beginPath();
        for (let x = 0; x <= W; x += 30) ctx.lineTo(x, yy + Math.sin(x / 90 + t / 30 + i) * 3);
        ctx.stroke();
      }
    }

    // Islands (parallax shift with pointer).
    ctx.save();
    ctx.translate((pointer.x - 0.5) * -18, 0);
    for (const is of islands) island(is);
    ctx.restore();

    // Pointer spotlight.
    const sx = pointer.x * W, sy = pointer.y * H;
    const spot = ctx.createRadialGradient(sx, sy, 0, sx, sy, Math.max(W, H) * 0.5);
    spot.addColorStop(0, "rgba(126,231,255,0.06)");
    spot.addColorStop(0.4, "rgba(126,231,255,0.02)");
    spot.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = spot;
    ctx.fillRect(0, 0, W, H);

    raf = requestAnimationFrame(frame);
  }

  function kick() { if (!raf && !document.body.classList.contains("playing")) frame(); }

  addEventListener("pointermove", (e) => {
    pointer.tx = e.clientX / window.innerWidth;
    pointer.ty = Math.min(0.7, e.clientY / window.innerHeight);
  }, { passive: true });
  addEventListener("resize", resize);
  const mo = new MutationObserver(kick);
  mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });

  resize();
  kick();
}

// V372 · Selector de personajes mejorado.
// Capa encima del selector actual (game.js pinta #chars-grid .char-card y
// title.js pinta los retratos en canvas). No sustituye input: solo escucha
// pointerenter/pointerleave/focus/blur y el evento "ohana-select" que ya existe.
//
// Estadísticas: el roster NO tiene stats explícitas. Se derivan de datos reales:
//   VIDA = forms[i].hp · VELOCIDAD = forms[i].speed · SALTO = forms[i].jump
//   SALTOS = forms[i].jumps · DIFICULTAD = difficulty(id) (characters/signature.js, 1-3)
// Cada barra muestra forma inicial (forms[0]) y final (forms[4]), normalizadas
// contra el máximo de la forma final en todo el roster.
import { drawCharacter } from "../characters/draw.js";
import { difficulty } from "../characters/signature.js";

export const SELECT_STAT_KEYS = Object.freeze([
  ["vida", "Vida", "hp"], ["velocidad", "Velocidad", "speed"], ["salto", "Salto", "jump"], ["saltos", "Saltos", "jumps"],
]);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

/** Stats derivadas del roster real: { [id]: { vida:{base,final,b,f}, …, dificultad:{value,f} } }. */
export function selectStats(roster, diff = difficulty) {
  const out = {}, max = {};
  for (const [k, , field] of SELECT_STAT_KEYS) max[k] = Math.max(1e-9, ...roster.map((c) => num((c.forms?.at(-1) || c)[field])));
  for (const c of roster) {
    const f0 = c.forms?.[0] || c, f4 = c.forms?.at(-1) || c, s = {};
    for (const [k, , field] of SELECT_STAT_KEYS) {
      const base = num(f0[field]), fin = num(f4[field]);
      s[k] = { base, final: fin, b: clamp(base / max[k], 0, 1), f: clamp(fin / max[k], 0, 1) };
    }
    const d = clamp(num(diff(c.id)) || 2, 1, 3);
    s.dificultad = { value: d, f: d / 3 };
    out[c.id] = s;
  }
  return out;
}

// ---------- dibujo en canvas (preview / modo canvas opcional) ----------
const easeBack = (k) => { const c = 1.7; return 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2; };
function actor(def, evo, pose) {
  const f = def.forms?.[evo] || def;
  return { id: def.id, evo, color: f.color || def.color, w: f.w || 24, h: f.h || 30, x: 0, y: 0, facing: 1, grounded: true, vx: 0, vy: 0, melee: 0, invuln: 0, visualScale: 1, _poseOverride: pose, _evoT: 0, health: 1, maxHealth: 1 };
}
function bar(ctx, x, y, w, h, b, f, col, label) {
  ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = col; ctx.globalAlpha = .45; ctx.fillRect(x, y, w * f, h);
  ctx.globalAlpha = 1; ctx.fillRect(x, y, w * b, h);
  ctx.fillStyle = "#fff"; ctx.font = "700 " + Math.round(h * 1.1) + "px system-ui, sans-serif"; ctx.textAlign = "left"; ctx.textBaseline = "bottom";
  ctx.fillText(label, x, y - 1);
}
/**
 * Dibuja una tarjeta. t en segundos. state: "idle" | "hover" | "selected".
 * enter: 0..1 progreso de entrada. opts.drawActor para inyectar (tests).
 */
export function drawSelectCard(ctx, w, h, t, def, stats, state = "idle", enter = 1, opts = {}) {
  const draw = opts.drawActor || drawCharacter;
  const k = easeBack(clamp(enter, 0, 1));
  ctx.save();
  ctx.translate(0, (1 - k) * h * .4); ctx.globalAlpha = clamp(enter * 1.5, 0, 1);
  const hot = state !== "idle";
  ctx.fillStyle = hot ? "#3a2650" : "#241a36"; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = def.color || "#888"; ctx.fillRect(0, 0, w, 5); if (hot) { ctx.fillRect(0, h - 4, w, 4); ctx.fillRect(0, 0, 3, h); ctx.fillRect(w - 3, 0, 3, h); }
  // escenario: foco plano
  ctx.globalAlpha *= state === "selected" ? .5 : .25; ctx.fillStyle = def.color || "#fff";
  ctx.beginPath(); ctx.ellipse(w / 2, h * .55, w * .34, h * .05, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = clamp(enter * 1.5, 0, 1);
  // personaje: idle respira; hover salta y se gira; selected: pose victoria + giro + anillo
  const evo = state === "selected" ? 4 : 1;
  const p = actor(def, evo, state === "selected" ? "victory" : state === "hover" ? "run" : "idle");
  const bob = state === "hover" ? -Math.abs(Math.sin(t * 7)) * h * .05 : state === "selected" ? -Math.abs(Math.sin(t * 4)) * h * .03 : Math.sin(t * 2 + def.id.length) * h * .008;
  const s = (h * (state === "selected" ? .3 : .4)) / (p.h * 1.9) * (hot ? 1.08 : 1);
  ctx.save(); ctx.translate(w / 2, h * .55 + bob); ctx.scale(s * (state === "hover" ? (Math.sin(t * 3.5) >= 0 ? 1 : -1) : 1), s * (1 + Math.sin(t * 2) * .015));
  p.x = -p.w / 2; p.y = -p.h;
  try { draw(ctx, p, { x: 0, y: 0 }, t * 60, {}); } catch { ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.w, p.h); }
  ctx.restore();
  if (state === "selected") {
    ctx.strokeStyle = def.color || "#fff"; ctx.lineWidth = 3;
    const r = w * (.25 + (t * .8 % 1) * .25); ctx.globalAlpha = 1 - (t * .8 % 1);
    ctx.beginPath(); ctx.ellipse(w / 2, h * .55, r, r * .25, 0, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
    for (let i = 0; i < 6; i++) { const a = t * 2 + i * 1.047; ctx.fillStyle = i % 2 ? "#fff6c8" : def.color; ctx.fillRect(w / 2 + Math.cos(a) * w * .32 - 2, h * .32 + Math.sin(a) * h * .12 - 2, 4, 4); }
  }
  // nombre + barras
  ctx.fillStyle = "#fff"; ctx.font = "900 " + Math.round(h * .07) + "px system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.fillText(def.name, w / 2, h * .66);
  const rows = [...SELECT_STAT_KEYS.map(([key, label]) => [label, stats[key].b, stats[key].f]), ["Manejo", stats.dificultad.f, stats.dificultad.f]];
  const bh = Math.max(3, h * .022), x0 = w * .1, bw = w * .8;
  rows.forEach(([label, b, f], i) => {
    const grow = clamp(enter * 1.4 - i * .08, 0, 1);
    bar(ctx, x0, h * .72 + i * h * .055, bw, bh, b * grow, f * grow, i === 4 ? "#ff8a6a" : def.color || "#7fe0c8", label);
  });
  ctx.restore();
}
/** Pantalla completa (grid 5x2) con entrada escalonada. t en segundos. */
export function drawSelectScreen(ctx, w, h, t, roster, { hoverId = null, selectedId = null, stats = selectStats(roster), drawActor } = {}) {
  ctx.fillStyle = "#140c22"; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#ffd36a"; ctx.font = "900 " + Math.round(h * .05) + "px system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.fillText("ELIGE A TU OHANA", w / 2, h * .08);
  const cols = 5, rows = Math.ceil(roster.length / cols), pad = w * .012, cw = (w - pad * (cols + 1)) / cols, ch = (h * .88 - pad * (rows + 1)) / rows;
  roster.forEach((def, i) => {
    const x = pad + (i % cols) * (cw + pad), y = h * .11 + pad + Math.floor(i / cols) * (ch + pad);
    const state = def.id === selectedId ? "selected" : def.id === hoverId ? "hover" : "idle";
    ctx.save(); ctx.translate(x, y); ctx.beginPath(); ctx.rect(0, 0, cw, ch); ctx.clip();
    drawSelectCard(ctx, cw, ch, t, def, stats[def.id], state, clamp((t - i * .06) / .5, 0, 1), { drawActor });
    ctx.restore();
  });
}

// ---------- capa DOM sobre el selector existente ----------
const CSS = `
#chars-grid .char-card{--ss-delay:0s;animation:ssEnter .55s cubic-bezier(.2,1.4,.4,1) backwards;animation-delay:var(--ss-delay)}
#chars-grid .char-card .portrait canvas{animation:ssIdle 2.4s ease-in-out infinite;animation-delay:var(--ss-delay);transform-origin:50% 90%}
#chars-grid .char-card.ss-hover .portrait canvas{animation:ssHover .6s ease-in-out infinite}
#chars-grid .char-card.ss-pick .portrait canvas{animation:ssPick .7s cubic-bezier(.2,1.6,.4,1) 1}
#chars-grid .char-card.ss-hover{box-shadow:0 0 0 2px var(--tint,#fff) inset}
#chars-grid .char-card{position:relative}
.ss-stats{display:none;position:absolute;left:6px;right:6px;bottom:calc(100% + 6px);gap:2px;padding:5px 7px;border-radius:8px;background:rgba(6,12,24,.86);color:#e8f4ff;font:700 10px system-ui,sans-serif;text-align:left;pointer-events:none;z-index:3}
#chars-grid .char-card.selected .ss-stats,#chars-grid .char-card.ss-hover .ss-stats{display:grid}
@media (max-height:600px){.ss-stats{font-size:9px;gap:1px;padding:3px 6px}.ss-bar{height:4px}}
.ss-stat{display:grid;grid-template-columns:5.6em 1fr;align-items:center;gap:4px}
.ss-bar{position:relative;height:5px;background:rgba(0,0,0,.35);border-radius:3px;overflow:hidden}
.ss-bar i,.ss-bar b{position:absolute;left:0;top:0;bottom:0;width:0;transition:width .6s cubic-bezier(.2,1.2,.4,1)}
.ss-bar i{background:var(--tint,#7fe0c8);opacity:.4}.ss-bar b{background:var(--tint,#7fe0c8)}
@keyframes ssEnter{from{opacity:0;transform:translateY(24px) scale(.92)}to{opacity:1;transform:none}}
@keyframes ssIdle{0%,100%{transform:translateY(0) scaleY(1)}50%{transform:translateY(-2px) scaleY(1.015)}}
@keyframes ssHover{0%,100%{transform:translateY(0) rotate(0)}30%{transform:translateY(-7px) rotate(-3deg)}60%{transform:translateY(-3px) rotate(3deg)}}
@keyframes ssPick{0%{transform:scale(1)}35%{transform:scale(1.18) translateY(-10px) rotate(-6deg)}70%{transform:scale(.96)}100%{transform:scale(1)}}
@media (prefers-reduced-motion:reduce){#chars-grid .char-card,#chars-grid .char-card .portrait canvas{animation:none!important}}`;

export function statsHTML(s) {
  const rows = [...SELECT_STAT_KEYS.map(([k, label]) => [label, s[k].b, s[k].f, s[k].base + " → " + s[k].final]), ["Manejo", s.dificultad.f, s.dificultad.f, ["", "Fácil", "Media", "Difícil"][s.dificultad.value]]];
  return '<span class="ss-stats" aria-hidden="true">' + rows.map(([l, b, f, title]) =>
    '<span class="ss-stat" title="' + title + '"><span>' + l + '</span><span class="ss-bar"><i data-w="' + Math.round(f * 100) + '"></i><b data-w="' + Math.round(b * 100) + '"></b></span></span>').join("") + "</span>";
}

/**
 * Monta la capa sobre las .char-card ya pintadas. Idempotente.
 * Devuelve unmount(). No llama a preventDefault ni cambia la selección.
 */
export function mountSelectScreen({ grid, roster, doc = globalThis.document, win = globalThis } = {}) {
  if (!grid || !doc || !Array.isArray(roster)) return () => {};
  if (grid._ssUnmount) return grid._ssUnmount;
  if (!doc.getElementById("ss-style")) { const st = doc.createElement("style"); st.id = "ss-style"; st.textContent = CSS; doc.head?.appendChild(st); }
  const stats = selectStats(roster), offs = [];
  const on = (el, ev, fn) => { el.addEventListener(ev, fn); offs.push(() => el.removeEventListener(ev, fn)); };
  [...grid.querySelectorAll(".char-card")].forEach((el, i) => {
    const s = stats[el.dataset.id]; if (!s) return;
    el.style.setProperty("--ss-delay", (i * 0.05).toFixed(2) + "s");
    if (!el.querySelector(".ss-stats")) {
      el.insertAdjacentHTML("beforeend", statsHTML(s));
      const fill = () => el.querySelectorAll(".ss-bar [data-w]").forEach((b) => { b.style.width = b.dataset.w + "%"; });
      (win.requestAnimationFrame || ((f) => f()))(() => setTimeout(fill, 120 + i * 50));
    }
    const hot = () => el.classList.add("ss-hover"), cold = () => el.classList.remove("ss-hover");
    on(el, "pointerenter", hot); on(el, "pointerleave", cold); on(el, "focus", hot); on(el, "blur", cold);
  });
  const pick = (e) => {
    const el = grid.querySelector('.char-card[data-id="' + e.detail?.id + '"]'); if (!el) return;
    el.classList.remove("ss-pick"); void el.offsetWidth; el.classList.add("ss-pick");
    setTimeout(() => el.classList.remove("ss-pick"), 750);
  };
  win.addEventListener?.("ohana-select", pick); offs.push(() => win.removeEventListener?.("ohana-select", pick));
  const unmount = () => { offs.splice(0).forEach((f) => f()); grid.querySelectorAll(".ss-stats").forEach((n) => n.remove()); delete grid._ssUnmount; };
  grid._ssUnmount = unmount;
  return unmount;
}

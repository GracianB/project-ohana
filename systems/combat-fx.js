// ============================================================================
// OHANA · Combat FX
// Impactos visuales deterministas. Presentación pura: no cambia daño, física,
// hitboxes ni estado de combate.
// ============================================================================
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const easeOut = (k) => 1 - Math.pow(1 - clamp(k, 0, 1), 3);

export function combatTier(combo = 1, crit = false) {
  if (crit || combo > 12) return 4;
  if (combo > 7) return 3;
  if (combo > 3) return 2;
  if (combo > 1) return 1;
  return 0;
}

export class CombatFX {
  constructor() {
    this.items = [];
  }

  add(x, y, color = "#ffffff", opts = {}) {
    const tier = clamp(Number(opts.tier) || 0, 0, 4);
    const max = 14 + tier * 5;
    this.items.push({
      x, y,
      color,
      tier,
      life: max,
      max,
      dir: opts.dir >= 0 ? 1 : -1,
      label: opts.label || "",
      seed: Number(opts.seed) || 0,
    });
    if (this.items.length > 40) this.items.splice(0, this.items.length - 40);
  }

  clear() {
    this.items.length = 0;
  }

  update() {
    for (const item of this.items) item.life--;
    this.items = this.items.filter((item) => item.life > 0);
  }

  render(ctx, cam) {
    if (!ctx) return;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const item of this.items) {
      const u = 1 - item.life / item.max;
      const e = easeOut(u);
      const fade = 1 - u;
      const x = item.x - cam.x;
      const y = item.y - cam.y;
      const span = 12 + item.tier * 7;
      const alpha = fade * (0.64 + item.tier * 0.08);

      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 1.6 + item.tier * 0.55;

      ctx.beginPath();
      ctx.arc(x, y, span * (0.25 + e * 0.9), 0, Math.PI * 2);
      ctx.stroke();

      const rays = 4 + item.tier * 2;
      for (let i = 0; i < rays; i++) {
        const a = (Math.PI * 2 * i) / rays + item.seed * 0.17;
        const inner = span * (0.25 + e * 0.22);
        const outer = span * (0.72 + e * (0.65 + item.tier * 0.10));
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * inner, y + Math.sin(a) * inner);
        ctx.lineTo(x + Math.cos(a) * outer, y + Math.sin(a) * outer);
        ctx.stroke();
      }

      if (item.tier >= 2) {
        ctx.globalAlpha = alpha * 0.72;
        const dir = item.dir;
        for (let i = 0; i < 2 + item.tier; i++) {
          const yy = y + (i - (item.tier + 1) / 2) * 5;
          const len = (18 + item.tier * 9) * e;
          ctx.beginPath();
          ctx.moveTo(x + dir * 3, yy);
          ctx.lineTo(x + dir * (len + 6), yy - (i - 1) * 1.5);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = alpha * 0.9;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(x, y, Math.max(2.2, 4.6 - e * 2.4), 0, Math.PI * 2);
      ctx.fill();

      if (item.label && item.tier >= 2 && u < 0.78) {
        ctx.globalAlpha = Math.min(0.96, (0.78 - u) * 1.8);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "800 " + (11 + item.tier * 2) + "px Outfit,sans-serif";
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(4,8,16,.88)";
        ctx.strokeText(item.label, x, y - 20 - e * 10);
        ctx.fillStyle = item.color;
        ctx.fillText(item.label, x, y - 20 - e * 10);
      }
    }
    ctx.restore();
  }
}

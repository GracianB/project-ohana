const MAX = 72;

function unit(seed) {
  const value = Math.sin(Number(seed) * 12.9898 + 78.233) * 43758.5453123;
  return value - Math.floor(value);
}

function finite(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export class ParticleSystem {
  constructor() { this.items = []; this.sequence = 0; }

  clear() {
    this.items.length = 0;
    this.sequence = 0;
  }

  emit(x, y, opts = {}) {
    let n = finite(opts.count ?? 6, 6);
    n = Math.max(0, Math.min(10, Math.floor(n)));
    if (!n) return;
    const overflow = this.items.length + n - MAX;
    if (overflow > 0) this.items.splice(0, overflow);

    const ox = finite(x, 0);
    const oy = finite(y, 0);
    const angle = opts.angle == null ? null : finite(opts.angle, 0);
    const spread = Math.max(0, finite(opts.spread, Math.PI * 2));
    const speed = finite(opts.speed ?? 2.4, 2.4);
    const up = finite(opts.up, 0);
    const life = Math.max(1, Math.round(finite(opts.life, 22)));
    const size = Math.max(0, finite(opts.size, 3));
    const gravity = finite(opts.gravity, 0.05);
    const seed = ox * 17.31 + oy * 7.91 + this.sequence++ * 53.17 + n * 0.73;

    for (let i = 0; i < n; i++) {
      const a = angle != null
        ? angle + (unit(seed + i * 3.17) - 0.5) * spread
        : unit(seed + i * 7.31) * Math.PI * 2;
      const s = speed * (0.35 + unit(seed + i * 11.73));
      this.items.push({
        x: ox, y: oy,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - up,
        life,
        max: life,
        size: size * (0.6 + unit(seed + i * 19.21) * 0.7),
        color: opts.color ?? "#fff",
        gravity,
        star: !!opts.star
      });
    }
  }

  burst(x, y, color) {
    this.emit(x, y, { color, count: 8, size: 3, up: 1.2, speed: 3, life: 20 });
    this.emit(x, y, { color: "#fff", count: 4, size: 2, up: 1.6, speed: 3.4, life: 14, star: true });
  }

  dust(x, y) {
    this.emit(x, y, { color: "#d8c7a4", count: 3, size: 2, up: 0.3, speed: 1.4, life: 14, gravity: 0.08 });
  }

  spark(x, y, color) {
    this.emit(x, y, { color, count: 6, size: 2, up: 0.8, speed: 3.4, life: 12, gravity: 0.02, star: true });
  }

  update() {
    const list = this.items;
    let w = 0;
    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.99;
      p.life--;
      if (p.life > 0) list[w++] = p;
    }
    list.length = w;
  }

  render(ctx, cam) {
    const list = this.items;
    ctx.save();
    const baseAlpha = ctx.globalAlpha;
    try {
      for (let i = 0; i < list.length; i++) {
        const p = list[i];
        const a = p.life / p.max;
        const sx = p.x - cam.x;
        const sy = p.y - cam.y;
        ctx.globalAlpha = baseAlpha * a;
        ctx.fillStyle = p.color;
        const s = p.size * (0.6 + a * 0.5);
        if (p.star) {
          ctx.fillRect(sx - s, sy - 0.6, s * 2, 1.2);
          ctx.fillRect(sx - 0.6, sy - s, 1.2, s * 2);
        } else {
          ctx.fillRect(sx - s, sy - s, s * 2, s * 2);
        }
      }
    } finally {
      ctx.restore();
    }
  }
}

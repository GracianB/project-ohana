export class ParticleSystem {
  constructor() { this.items = []; }

  emit(x, y, opts = {}) {
    const n = opts.count ?? 8;
    for (let i = 0; i < n; i++) {
      const a = opts.angle != null ? opts.angle + (Math.random() - 0.5) * (opts.spread ?? Math.PI * 2) : Math.random() * Math.PI * 2;
      const s = (opts.speed ?? 2.4) * (0.35 + Math.random());
      this.items.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - (opts.up ?? 0),
        life: opts.life ?? 40,
        max: opts.life ?? 40,
        size: (opts.size ?? 3) * (0.6 + Math.random() * 0.7),
        color: opts.color ?? "#fff",
        gravity: opts.gravity ?? 0.05,
        glow: opts.glow !== false,
        circle: opts.circle !== false
      });
    }
  }

  burst(x, y, color) {
    this.emit(x, y, { color, count: 22, size: 4, up: 1.6, speed: 3.4, life: 36, glow: true });
  }

  dust(x, y) {
    this.emit(x, y, { color: "#d8c7a4", count: 8, size: 2.4, up: 0.4, speed: 1.6, life: 22, gravity: 0.08, glow: false });
  }

  spark(x, y, color) {
    this.emit(x, y, { color, count: 16, size: 2.2, up: 0.8, speed: 4.2, life: 18, gravity: 0.02 });
  }

  update() {
    this.items = this.items.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.99;
      p.life--;
      return p.life > 0;
    });
  }

  render(ctx, cam) {
    for (const p of this.items) {
      const a = p.life / p.max;
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      if (p.glow) {
        ctx.shadowBlur = 12 * a;
        ctx.shadowColor = p.color;
      }
      if (p.circle) {
        ctx.beginPath();
        ctx.arc(p.x - cam.x, p.y - cam.y, p.size * (0.5 + a * 0.5), 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(p.x - cam.x, p.y - cam.y, p.size, p.size);
      }
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
  }
}

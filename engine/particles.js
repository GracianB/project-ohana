export class ParticleSystem {
  constructor() { this.items = []; }
  emit(x, y, opts = {}) {
    const n = opts.count ?? 8;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = (opts.speed ?? 2) * (0.4 + Math.random());
      this.items.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - (opts.up ?? 0),
        life: opts.life ?? 40,
        max: opts.life ?? 40,
        size: opts.size ?? 3,
        color: opts.color ?? "#fff",
        gravity: opts.gravity ?? 0.05,
        circle: opts.circle !== false
      });
    }
  }
  update() {
    this.items = this.items.filter((p) => {
      p.x += p.vx; p.y += p.vy; p.vy += p.gravity; p.life--;
      return p.life > 0;
    });
  }
  render(ctx, cam) {
    for (const p of this.items) {
      ctx.globalAlpha = p.life / p.max;
      ctx.fillStyle = p.color;
      if (p.circle) {
        ctx.beginPath();
        ctx.arc(p.x - cam.x, p.y - cam.y, p.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      } else ctx.fillRect(p.x - cam.x, p.y - cam.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }
}

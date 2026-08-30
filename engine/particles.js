const MAX = 160;

export class ParticleSystem {
  constructor() { this.items = []; }

  emit(x, y, opts = {}) {
    let n = opts.count ?? 8;
    const room = MAX - this.items.length;
    if (room <= 0) {
      this.items.splice(0, n);
    } else if (n > room) n = room;
    for (let i = 0; i < n; i++) {
      const a = opts.angle != null ? opts.angle + (Math.random() - 0.5) * (opts.spread ?? Math.PI * 2) : Math.random() * Math.PI * 2;
      const s = (opts.speed ?? 2.4) * (0.35 + Math.random());
      this.items.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - (opts.up ?? 0),
        life: opts.life ?? 28,
        max: opts.life ?? 28,
        size: (opts.size ?? 3) * (0.6 + Math.random() * 0.7),
        color: opts.color ?? "#fff",
        gravity: opts.gravity ?? 0.05,
        star: !!opts.star
      });
    }
  }

  burst(x, y, color) {
    this.emit(x, y, { color, count: 14, size: 3.4, up: 1.4, speed: 3.2, life: 26 });
    this.emit(x, y, { color: "#fff", count: 8, size: 2, up: 2, speed: 4, life: 18, star: true });
  }

  dust(x, y) {
    this.emit(x, y, { color: "#d8c7a4", count: 5, size: 2, up: 0.3, speed: 1.4, life: 16, gravity: 0.08 });
  }

  spark(x, y, color) {
    this.emit(x, y, { color, count: 10, size: 2, up: 0.8, speed: 3.8, life: 14, gravity: 0.02, star: true });
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
    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      const a = p.life / p.max;
      const sx = p.x - cam.x;
      const sy = p.y - cam.y;
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      const s = p.size * (0.6 + a * 0.5);
      if (p.star) {
        ctx.fillRect(sx - s, sy - 0.6, s * 2, 1.2);
        ctx.fillRect(sx - 0.6, sy - s, 1.2, s * 2);
      } else {
        ctx.fillRect(sx - s, sy - s, s * 2, s * 2);
      }
    }
    ctx.globalAlpha = 1;
  }
}

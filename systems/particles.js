export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  burst(x, y, options = {}) {
    const count = options.count || 12;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * (options.speed || 4);

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: options.life || 500,
        maxLife: options.life || 500,
        size: 2 + Math.random() * 4,
        color: options.color || "#6ef4ff"
      });
    }
  }

  update(dt) {
    const ms = dt * 16.67;

    for (const particle of this.particles) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 0.08 * dt;
      particle.life -= ms;
    }

    this.particles = this.particles.filter(p => p.life > 0);
  }

  draw(ctx, cameraX = 0) {
    for (const p of this.particles) {
      const alpha = p.life / p.maxLife;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x - cameraX, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

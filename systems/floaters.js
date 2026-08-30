export class Floaters {
  constructor() { this.items = []; }
  add(x, y, text, color) {
    this.items.push({ x, y, text, color: color || "#fff", life: 40 });
  }
  update() {
    this.items = this.items.filter((f) => {
      f.y -= 1.2; f.life--; return f.life > 0;
    });
  }
  render(ctx, cam) {
    ctx.font = "700 16px Outfit,sans-serif"; ctx.textAlign = "center";
    for (const f of this.items) {
      ctx.globalAlpha = f.life / 40;
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x - cam.x, f.y - cam.y);
    }
    ctx.globalAlpha = 1;
  }
}

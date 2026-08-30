export class Floaters {
  constructor() { this.items = []; }
  add(x, y, text, color, crit) {
    this.items.push({ x, y, text, color: color || "#fff", life: crit ? 52 : 40, max: crit ? 52 : 40, crit: !!crit });
  }
  update() {
    this.items = this.items.filter((f) => {
      f.y -= f.crit ? 1.6 : 1.2; f.life--; return f.life > 0;
    });
  }
  render(ctx, cam) {
    ctx.textAlign = "center";
    for (const f of this.items) {
      ctx.globalAlpha = f.life / f.max;
      ctx.fillStyle = f.color;
      ctx.font = (f.crit ? "800 22px" : "700 16px") + " Outfit,sans-serif";
      if (f.crit) { ctx.shadowColor = "#ffe66a"; ctx.shadowBlur = 10; }
      ctx.fillText(f.text, f.x - cam.x, f.y - cam.y);
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
  }
}

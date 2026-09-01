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
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const f of this.items) {
      const x = f.x - cam.x;
      const y = f.y - cam.y;
      ctx.globalAlpha = Math.max(0, f.life / f.max);
      ctx.font = (f.crit ? "800 22px" : "800 16px") + " Outfit,sans-serif";
      ctx.lineJoin = "round";
      ctx.lineWidth = f.crit ? 5 : 4;
      ctx.strokeStyle = "rgba(6,8,14,.86)";
      ctx.strokeText(f.text, x, y);
      ctx.fillStyle = f.color;
      if (f.crit) { ctx.shadowColor = "#ffe66a"; ctx.shadowBlur = 12; }
      ctx.fillText(f.text, x, y);
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }
}

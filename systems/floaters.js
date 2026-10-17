const MAX_FLOATERS = 96;

export class Floaters {
  constructor() { this.items = []; }
  add(x, y, text, color, crit) {
    if (!Number.isFinite(Number(x)) || !Number.isFinite(Number(y))) return false;
    const life = crit ? 52 : 40;
    // Only combine fresh numeric hits at the same impact. Labels and rewards
    // retain their own identity, and older hits never jump back to the target.
    const label = String(text ?? "");
    const amount = /^\d+(?:\.\d+)?$/.test(label) ? Number(label) : null;
    const recent = amount !== null && this.items.findLast(f =>
      f.amount !== null && f.color === (color || "#fff") && f.crit === !!crit &&
      f.max - f.life <= 6 && Math.abs(f.anchorX - Number(x)) < 24 && Math.abs(f.anchorY - Number(y)) < 24);
    if (recent) {
      recent.amount += amount;
      recent.text = String(Math.round(recent.amount * 10) / 10);
      return true;
    }
    if (this.items.length >= MAX_FLOATERS) this.items.splice(0, this.items.length - MAX_FLOATERS + 1);
    this.items.push({
      x: Number(x),
      y: Number(y),
      anchorX: Number(x), anchorY: Number(y), amount,
      text: String(text ?? ""),
      color: color || "#fff",
      life,
      max: life,
      crit: !!crit
    });
    return true;
  }
  update() {
    let write = 0;
    for (const f of this.items) {
      f.y -= f.crit ? 1.6 : 1.2;
      if (--f.life > 0) this.items[write++] = f;
    }
    this.items.length = write;
  }
  render(ctx, cam, reduceMotion = false) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const occupied = [];
    for (const f of this.items) {
      const x = f.x - cam.x;
      let y = (reduceMotion ? f.anchorY : f.y) - cam.y;
      ctx.font = (f.crit ? "800 22px" : "800 16px") + " Outfit,sans-serif";
      const width = (ctx.measureText?.(f.text)?.width || f.text.length * (f.crit ? 14 : 10)) + 12;
      // Position in screen space without changing the impact or simulation.
      // Descending Y guarantees a single bounded pass, even at the pool limit.
      for (const prior of occupied) {
        if (Math.abs(prior.x - x) < (prior.width + width) / 2 && Math.abs(prior.y - y) < 25) y = prior.y - 26;
      }
      const at = occupied.findIndex(p => p.y < y);
      occupied.splice(at < 0 ? occupied.length : at, 0, {x,y,width});
      ctx.globalAlpha = Math.max(0, f.life / f.max);
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

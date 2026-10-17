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
    // Each impact ages exactly once, including the frame when it expires.
    // In-place stable compaction avoids allocating a fresh effect array at 60Hz.
    const items=this.items;
    let write=0;
    for(let i=0;i<items.length;i++){
      const item=items[i];
      item.life--;
      if(item.life>0)items[write++]=item;
    }
    items.length=write;
  }

  render(ctx, cam, reduceMotion = false) {
    if (!ctx) return;
    ctx.save();
    try {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (const item of this.items) {
        const progress = 1 - item.life / item.max;
        const ease = easeOut(progress);
        const x = item.x - cam.x, y = item.y - cam.y;
        const span = 14 + item.tier * 6;
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = Math.max(0, (1 - progress) * .86);
        ctx.strokeStyle = item.color;
        ctx.fillStyle = item.color;
        ctx.lineWidth = 2 + item.tier * .45;
        if (reduceMotion) {
          // A steady impact mark: no orbiting shards, scale pulses or flashes.
          ctx.beginPath();
          ctx.moveTo(x-span*.5,y);ctx.lineTo(x,y-span*.5);
          ctx.lineTo(x+span*.5,y);ctx.lineTo(x,y+span*.5);ctx.closePath();ctx.stroke();
          continue;
        }
        // One directional brush stroke follows the strike, rather than a
        // full circle covering the target. The second stroke is its afterimage.
        const start = item.dir > 0 ? -1.1 : Math.PI-1.1;
        ctx.beginPath();ctx.arc(x,y,span*(.5+ease*.8),start,start+1.5);ctx.stroke();
        ctx.globalAlpha *= .45;ctx.lineWidth = 1.2;
        ctx.beginPath();ctx.arc(x-item.dir*4,y+3,span*(.8+ease*.7),start+.15,start+1);ctx.stroke();
        ctx.globalAlpha = Math.max(0,(1-progress)*.75);
        const rays = 3 + Math.min(3,item.tier);
        for(let i=0;i<rays;i++){
          const angle = i*Math.PI*2/rays+item.seed*.17;
          const distance = span*(.35+ease*1.2);
          const sx=x+Math.cos(angle)*distance,sy=y+Math.sin(angle)*distance;
          const radius=(item.tier>=3?3:2)*(1-progress);
          ctx.beginPath();ctx.moveTo(sx-radius,sy);ctx.lineTo(sx,sy-radius*1.8);
          ctx.lineTo(sx+radius,sy);ctx.lineTo(sx,sy+radius*1.8);ctx.closePath();ctx.fill();
        }
        if(progress<.22){
          ctx.globalAlpha=(1-progress/.22)*.7;
          ctx.fillStyle="#fff5d0";ctx.beginPath();ctx.arc(x,y,3+item.tier*.5,0,Math.PI*2);ctx.fill();
        }
      }
    } finally {ctx.restore();}
  }
}

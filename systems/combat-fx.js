const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const easeOut = (k) => 1 - Math.pow(1 - clamp(k, 0, 1), 3);

export function combatTier(combo = 1, crit = false) {
  if (crit || combo > 12) return 4;
  if (combo > 7) return 3;
  if (combo > 3) return 2;
  if (combo > 1) return 1;
  return 0;
}

// Each fighter leaves a different mark. The points are in unit coordinates.
const MARKS = {
  kilo: ['#ffd36a', [[-.8,.5],[-.35,.5],[-.35,-.8],[.58,-.95],[.58,-.58],[-.35,-.42]]],
  stitcho: ['#72b8ff', [[-.75,-.46],[.55,-.46],[.85,0],[.55,.46],[-.75,.46],[-.9,0],[-.75,-.46]]],
  chispin: ['#fff27a', [[-.4,-.9],[.34,-.26],[-.1,-.15],[.54,.78],[-.55,.23],[-.18,.09],[-.4,-.9]]],
  cat: ['#f4a4ef', [[-.75,.48],[-.52,-.48],[-.3,.2],[-.03,-.7],[.18,.2],[.53,-.5],[.73,.48],[0,.74],[-.75,.48]]],
  dragon: ['#ff8750', [[-.68,.53],[-.8,-.05],[-.45,.17],[-.12,-.88],[.21,-.32],[.62,-.56],[.77,.15],[.4,.68],[-.68,.53]]],
  dino: ['#c8ee74', [[-.84,-.52],[-.36,-.65],[-.07,-.28],[.3,-.61],[.74,-.38],[.64,.42],[.12,.61],[-.12,.18],[-.46,.65],[-.84,.2],[-.84,-.52]]],
  frita: ['#ffe2a1', [[-.64,.69],[-.81,-.24],[-.55,-.77],[-.18,-.35],[.13,-.82],[.47,-.36],[.77,-.58],[.61,.6],[-.64,.69]]],
  pizza: ['#ff9e66', [[-.82,-.54],[.74,0],[-.82,.54],[-.68,.12],[-.66,-.12],[-.82,-.54]]],
  yomi: ['#ffc186', [[-.43,-.82],[.37,-.78],[.49,.55],[0,.83],[-.54,.56],[-.43,-.82],[.25,-.32],[-.25,-.12],[.22,.18],[-.19,.41]]],
  cuerno: ['#ede3ff', [[-.91,.41],[.86,-.33],[.18,.47],[-.34,.68],[-.91,.41]]],
  nacar: ['#81ffde', [[-.88,.08],[-.68,-.52],[-.2,-.74],[.49,-.56],[.87,.08],[.68,.32],[.42,.27],[.2,.67],[0,.3],[-.27,.62],[-.45,.27],[-.88,.08]]],
  ia: ['#76ffe1', [[-.83,-.5],[-.36,-.5],[-.13,-.1],[.42,-.1],[.78,-.56],[.78,.56],[.42,.22],[-.13,.22],[-.37,.62],[-.83,.62]]],
};

export function attackImpact(game, target, {x, y, dir, color, crit = false} = {}) {
  const player=game.player;
  if(!game.combatFx || !player || !target)return;
  const centerX=target.x+target.w/2,centerY=target.y+target.h/2;
  const horizontal=dir||Math.sign(centerX-player.x-player.w/2)||player.facing||1;
  const contactX=Number.isFinite(x)?clamp(x,target.x,target.x+target.w):centerX-horizontal*target.w*.22;
  const contactY=Number.isFinite(y)?clamp(y,target.y,target.y+target.h):centerY;
  if(!Number.isFinite(contactX+contactY))return;
  game.combatFx.add(contactX,contactY,color||player.color,{
    hero:player.id,dir:horizontal,tier:combatTier(game.combo,crit),seed:game.combo,
  });
}

function mark(ctx,points,x,y,size,dir,angle){
  const cos=Math.cos(angle),sin=Math.sin(angle);
  ctx.beginPath();
  points.forEach(([px,py],i)=>{
    const xx=x+dir*size*(px*cos-py*sin),yy=y+size*(px*sin+py*cos);
    if(i)ctx.lineTo(xx,yy);else ctx.moveTo(xx,yy);
  });
  ctx.stroke();
}

export function drawHeroAttackGlyph(ctx,hero,x,y,size,dir=1,angle=0){
  if(!Object.hasOwn(MARKS,hero))return;
  const [accent,points]=MARKS[hero];
  ctx.strokeStyle=accent;
  mark(ctx,points,x,y,size,dir,angle);
}

function drawAttackMark(ctx,item,x,y,progress,reduceMotion,data){
  const [accent,points]=data;
  const fade=1-progress,slot=item.slot;
  const size=(slot<0?11:9+slot*1.45)+item.tier*1.1;
  const ease=reduceMotion?0:easeOut(progress);
  ctx.lineWidth=2;
  ctx.strokeStyle=accent;ctx.globalAlpha=fade*.9;
  mark(ctx,points,x,y,size*(.73+ease*.44),item.dir,0);
  if(reduceMotion)return;
  // Echoes follow the cast direction. Close contact stays tight, defensive
  // powers expand sideways and the three late powers climb away from the hero.
  const travel=(6+Math.max(0,slot)*3)*ease;
  const offsetY=slot>=3?travel*.65:0;
  const offsetX=slot===1?0:item.dir*travel;
  ctx.strokeStyle=item.color;ctx.lineWidth=1.2;
  ctx.globalAlpha=fade*.53;
  mark(ctx,points,x+offsetX,y-offsetY,size*(.89+ease*.51),item.dir,ease*.25);
  if(slot>=2 || item.tier>=2){
    ctx.strokeStyle=accent;ctx.globalAlpha=fade*.32;
    mark(ctx,points,x-offsetX*.48,y+offsetY*.35,size*(1+ease*.55),item.dir,-ease*.22);
  }
}
export class CombatFX {
  constructor() {
    this.items = [];
  }

  add(x, y, color = "#ffffff", opts = {}) {
    const tier = clamp(Number(opts.tier) || 0, 0, 4);
    const slot = Number.isInteger(opts.slot)?opts.slot:-1;
    const max = slot>=0?12+slot*2:14+tier*5;
    this.items.push({
      x, y,
      color, slot, hero:opts.hero,
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
        const identity=Object.hasOwn(MARKS,item.hero)?MARKS[item.hero]:null;
        if(identity){
          drawAttackMark(ctx,item,x,y,progress,reduceMotion,identity);
          continue;
        }
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

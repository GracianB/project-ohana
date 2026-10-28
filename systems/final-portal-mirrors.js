import {drawCharacter} from '../characters/draw.js';
import {findRoster} from '../characters/roster.js';
import {heroHeightTarget} from '../characters/visual-size.js';
// systems/final-portal-mirrors.js
// V618 — Portales/Espejos de la Sala Final EXTREMO
// The actual family actors live inside clipped oval glass. Offscreen mirrors
// are culled before their animated Canvas portraits are rendered.
// Posiciones alineadas con las estatuas de world1-rooms.js (900 + i*560).

const TAU = Math.PI * 2;

export function drawPortalMirrors(ctx, portals, cam, t, player, reduced = false) {
  if (!portals?.length) return;

  for (const p of portals) {
    const x = p.x - cam.x;
    const y = p.y - cam.y;
    const viewport=ctx.canvas?.width/Math.max(.01,Math.abs(ctx.getTransform?.().a||1));
    if(Number.isFinite(viewport)&&(x+(p.rx||72)<0||x-(p.rx||72)>viewport))continue;
    const near = player ? Math.hypot(player.x + player.w / 2 - p.x, player.y + player.h / 2 - p.y) < 220 : false;
    const looking = near ? Math.sign(player.x + player.w / 2 - p.x) : Math.sin(t * 0.08 + p.x) * 0.6;

    ctx.save();
    ctx.translate(x, y);

    const g = ctx.createLinearGradient(-p.rx, -p.ry, p.rx, p.ry);
    g.addColorStop(0, 'rgba(180,210,255,0.12)');
    g.addColorStop(0.5, 'rgba(220,240,255,0.22)');
    g.addColorStop(1, 'rgba(140,180,220,0.10)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.rx || 72, p.ry || 112, 0, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = near ? '#fff6c8' : 'rgba(255,255,255,0.45)';
    ctx.lineWidth = near ? 4 : 2.5;
    ctx.stroke();

    if (!reduced) {
      ctx.globalAlpha = 0.18;
      ctx.strokeStyle = '#80deea';
      ctx.lineWidth = 1;
      for (let i = -4; i <= 4; i++) {
        const yy = i * 18 + Math.sin(t * 0.12 + i) * 2;
        ctx.beginPath();
        ctx.moveTo(-p.rx * 0.7, yy);
        ctx.lineTo(p.rx * 0.7, yy);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // Render the actual vector actor, clipped INSIDE the glass. No proxy faces.
    const def=findRoster(p.hero),form=def?.forms?.[1];
    if(form){
      ctx.save();ctx.beginPath();ctx.ellipse(0,0,p.rx||72,p.ry||112,0,0,TAU);ctx.clip();
      ctx.translate(0,(p.ry||112)*.72);ctx.shadowBlur=0;ctx.filter='none';ctx.globalAlpha=1;
      const actor={id:p.hero,evo:1,color:form.color||def.color,w:form.w,h:form.h,x:-form.w/2,y:-form.h,
        facing:looking<0?-1:1,grounded:true,vx:0,vy:0,health:form.hp,maxHealth:form.hp,
        visualScale:(p.ry||112)*(['dragon','dino','cuerno','yomi'].includes(p.hero)?1.15:1.5)/heroHeightTarget(p.hero,1),invuln:0,
        _poseOverride:near?'victory':'idle',_introForceCanvas:true,_duetActor:true,_theatreHQ:true};
      drawCharacter(ctx,actor,{x:0,y:0},reduced?0:t,{reduceMotion:reduced});ctx.restore();
    }

    ctx.restore();
  }
}

// Posiciones alineadas con las estatuas de la procesión (world1-rooms.js)
// x = 900 + i * 560, y centrado sobre el suelo (WORLD1_FLOOR = 1134)
export const FINAL_PORTALS = Object.freeze([
  { hero: 'kilo',     x: 900,  y: 990, rx: 70, ry: 110 },
  { hero: 'stitcho',  x: 1460, y: 990, rx: 72, ry: 112 },
  { hero: 'chispin',  x: 2020, y: 990, rx: 68, ry: 108 },
  { hero: 'cat',      x: 2580, y: 990, rx: 70, ry: 110 },
  { hero: 'cuerno',   x: 3140, y: 990, rx: 72, ry: 112 },
  { hero: 'dragon',   x: 3700, y: 990, rx: 74, ry: 114 },
  { hero: 'dino',     x: 4260, y: 990, rx: 70, ry: 110 },
  { hero: 'frita',    x: 4820, y: 990, rx: 68, ry: 108 },
  { hero: 'pizza',    x: 5380, y: 990, rx: 70, ry: 110 },
  { hero: 'yomi',     x: 5940, y: 990, rx: 72, ry: 112 }
]);

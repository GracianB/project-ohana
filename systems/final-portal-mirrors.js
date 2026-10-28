// systems/final-portal-mirrors.js
// V618 — Portales/Espejos de la Sala Final EXTREMO
// Los miembros de la familia aparecen dentro de los óvalos haciendo muecas,
// como atrapados. Vector puro, determinista, sin Math.random en arte.
// Posiciones alineadas con las estatuas de world1-rooms.js (900 + i*560).

const TAU = Math.PI * 2;

const FAMILY = Object.freeze({
  michi:    { name: 'Michicornio', base: '#c9a8ff', eye: '#5a3d7a', accent: '#f2c1ff', ears: true },
  cuerno:   { name: 'Cuerno',      base: '#4ff0c8', eye: '#0d4a3a', accent: '#e0f7fa', horns: true },
  kilo:     { name: 'Kilo',        base: '#ffe14a', eye: '#8a5a1a', accent: '#fff6c8', crown: true },
  stitcho:  { name: 'Stitcho',     base: '#5ad1ff', eye: '#1a4a7a', accent: '#b3e5fc', antenna: true },
  chispin:  { name: 'Chispín',     base: '#ffe14a', eye: '#7a5a00', accent: '#fff9c4', spark: true },
  cat:      { name: 'Michi',       base: '#ffb6e4', eye: '#7a3d6a', accent: '#f8bbd0', ears: true },
  dragon:   { name: 'Dragón',      base: '#ff8a3a', eye: '#5a2a00', accent: '#ffe0b2', horns: true },
  dino:     { name: 'Dino',        base: '#c8f04a', eye: '#3a5a1a', accent: '#e6ee9c', snout: true },
  frita:    { name: 'Frita',       base: '#ffd36a', eye: '#7a4a1a', accent: '#fff3e0', hat: true },
  pizza:    { name: 'Pizza',       base: '#ff8a2a', eye: '#7a2a1a', accent: '#ffccbc', hat: true },
  yomi:     { name: 'Yomi',        base: '#ce93d8', eye: '#4a148c', accent: '#e1bee7', void: true }
});

const ACTING = Object.freeze({
  kilo:['cast','victory'], stitcho:['attack','jump'], chispin:['cast','attack'],
  cat:['glide','victory'], cuerno:['victory','cast'], dragon:['glide','attack'],
  dino:['attack','victory'], frita:['run','victory'], pizza:['jump','attack'],
  yomi:['cast','glide']
});

function hn(i) {
  const x = Math.sin(i * 127.1 + 11.7) * 43758.5453;
  return x - Math.floor(x);
}

function drawFace(ctx, fam, t, intensity, looking) {
  const phase = Math.sin(t * 0.11 + intensity);
  const blink = Math.abs(Math.sin(t * 0.18 + intensity * 2)) > 0.92;
  const open = Math.sin(t * 0.15 + intensity) > 0.35;

  ctx.fillStyle = fam.base;
  ctx.beginPath();
  ctx.ellipse(0, -8, 30, 36, 0, 0, TAU);
  ctx.fill();

  if (fam.ears) {
    ctx.fillStyle = fam.accent;
    ctx.beginPath(); ctx.moveTo(-28, -28); ctx.lineTo(-18, -48); ctx.lineTo(-8, -26); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(28, -28); ctx.lineTo(18, -48); ctx.lineTo(8, -26); ctx.closePath(); ctx.fill();
  }
  if (fam.horns) {
    ctx.strokeStyle = fam.accent; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-14, -38); ctx.quadraticCurveTo(-22, -58, -10, -62); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(14, -38); ctx.quadraticCurveTo(22, -58, 10, -62); ctx.stroke();
  }
  if (fam.crown) {
    ctx.fillStyle = fam.accent;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 12 - 6, -40);
      ctx.lineTo(i * 12, -52);
      ctx.lineTo(i * 12 + 6, -40);
      ctx.closePath(); ctx.fill();
    }
  }

  if (!blink) {
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(-11, -16, 8, 9, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(11, -16, 8, 9, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = fam.eye;
    const lookX = looking * 3;
    ctx.beginPath(); ctx.arc(-11 + lookX, -16, 4, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(11 + lookX, -16, 4, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-13 + lookX, -18, 1.6, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(9 + lookX, -18, 1.6, 0, TAU); ctx.fill();
  } else {
    ctx.strokeStyle = fam.eye; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(-16, -16); ctx.lineTo(-6, -16); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, -16); ctx.lineTo(16, -16); ctx.stroke();
  }

  ctx.strokeStyle = fam.eye; ctx.lineWidth = 2.6;
  ctx.beginPath();
  if (open && intensity > 0.4) {
    ctx.moveTo(-10, 8);
    ctx.quadraticCurveTo(0, 22 + phase * 4, 10, 8);
  } else if (phase > 0.3) {
    ctx.moveTo(-9, 6);
    ctx.quadraticCurveTo(0, 14, 9, 6);
  } else {
    ctx.moveTo(-8, 10);
    ctx.quadraticCurveTo(0, 6, 8, 10);
  }
  ctx.stroke();
}

export function drawPortalMirrors(ctx, portals, cam, t, player, reduced = false, drawHero = null) {
  if (!portals?.length) return;

  for (const p of portals) {
    const x = p.x - cam.x;
    const y = p.y - cam.y;
    const fam = FAMILY[p.hero] || FAMILY.kilo;
    const intensity = hn(p.x * 0.013 + t * 0.02);
    const near = player ? Math.hypot(player.x + player.w / 2 - p.x, player.y + player.h / 2 - p.y) < 220 : false;
    const looking = near ? Math.sign(player.x + player.w / 2 - p.x) : Math.sin(t * 0.08 + p.x) * 0.6;

    ctx.save();
    ctx.translate(x, y);

    const rx=p.rx||72, ry=p.ry||112;
    const g = ctx.createLinearGradient(-rx, -ry, rx, ry);
    g.addColorStop(0, 'rgba(180,210,255,0.08)');
    g.addColorStop(0.48, 'rgba(220,240,255,0.12)');
    g.addColorStop(1, 'rgba(140,180,220,0.06)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, TAU);
    ctx.fill();

    // Two restrained rims make the oval read as a framed mirror, not a
    // floating UI token. The warm edge wakes up when the player approaches.
    ctx.strokeStyle = near ? '#fff6c8' : 'rgba(226,239,255,0.58)';
    ctx.lineWidth = near ? 4 : 2.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0,0,rx-6,ry-6,0,-Math.PI*.78,-Math.PI*.18);
    ctx.strokeStyle=near?'rgba(255,255,230,.72)':'rgba(255,255,255,.24)';
    ctx.lineWidth=1.25;
    ctx.stroke();

    if (!reduced) {
      const scan=ctx.createLinearGradient(-rx,0,rx,0);
      scan.addColorStop(0,'rgba(255,255,255,0)');
      scan.addColorStop(.5,'rgba(255,255,255,.08)');
      scan.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=scan;
      for (let i = -3; i <= 3; i++) {
        const yy = i * 25 + Math.sin(t * 0.045 + i) * 2;
        ctx.fillRect(-rx*.68,yy,rx*1.36,1);
      }
    }

    // Show the actual family member inside the glass. The former floating
    // face read as an emoji because it omitted the body and canonical art.
    // Clip the complete, animated Canvas character to the oval so the portal
    // keeps its reflection treatment while the silhouette stays recognizable.
    if (drawHero) {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(0, 4, rx * 0.78, ry * 0.82, 0, 0, TAU);
      ctx.clip();
      // Character-tinted depth light sits behind the sprite; a different
      // signature motif gives each mirror its own identity at a glance.
      const halo=ctx.createRadialGradient(0,-20,8,0,-20,ry*.72);
      halo.addColorStop(0,fam.base+'55');
      halo.addColorStop(.58,fam.base+'20');
      halo.addColorStop(1,'rgba(8,20,42,0)');
      ctx.fillStyle=halo;
      ctx.fillRect(-rx*.8,-ry*.8,rx*1.6,ry*1.7);
      drawSignature(ctx,p.hero,fam,t,reduced);
      const bob = reduced ? 0 : Math.sin(t * 0.055 + p.x * 0.01) * 3;
      const faceDirection=player?Math.sign(player.x+player.w*.5-p.x)||-1:-1;
      const posePair=ACTING[p.hero]||['idle','idle'];
      drawHero(ctx,p.hero,0,ry*.72+bob,near?1.12:1,t,near,faceDirection,posePair,reduced,ry*1.64);

      // A soft diagonal sheen belongs to the glass foreground, so the art
      // stays readable while the family still feels reflected in the lens.
      ctx.globalCompositeOperation='screen';
      const sheen=ctx.createLinearGradient(-rx*.72,-ry*.7,rx*.34,ry*.68);
      sheen.addColorStop(0,'rgba(255,255,255,.13)');
      sheen.addColorStop(.22,'rgba(255,255,255,.035)');
      sheen.addColorStop(.5,'rgba(255,255,255,0)');
      sheen.addColorStop(1,'rgba(255,255,255,.025)');
      ctx.fillStyle=sheen;
      ctx.fillRect(-rx,-ry,rx*2,ry*2);
      ctx.globalCompositeOperation='source-over';
      ctx.strokeStyle='rgba(255,255,255,.18)';
      ctx.lineWidth=1.1;
      ctx.beginPath();
      ctx.ellipse(-rx*.49,-ry*.13,rx*.1,ry*.43,-.33,-1.22,1.18);
      ctx.stroke();
      ctx.restore();
    } else {
      const scale = near ? 1.08 : 1;
      ctx.save();
      ctx.scale(scale, scale);
      drawFace(ctx, fam, t, intensity + (near ? 0.4 : 0), looking);
      ctx.restore();
    }

    if (near && !reduced) {
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = fam.base;
      ctx.beginPath();
      ctx.ellipse(-28, 18, 10, 7, -0.4, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(28, 18, 10, 7, 0.4, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }
}

function drawSignature(ctx,hero,fam,t,reduced){
  const phase=reduced?0:t*.035, pulse=reduced?1:.88+Math.sin(t*.07)*.12;
  ctx.save();ctx.globalAlpha=.58;ctx.strokeStyle=fam.accent;ctx.fillStyle=fam.accent;ctx.lineWidth=2.2;
  const ellipse=(rx,ry,a=0,b=TAU)=>{ctx.beginPath();ctx.ellipse(0,0,rx,ry,phase*.12,a,b);ctx.stroke();};
  switch(hero){
    case 'kilo': ellipse(46,24,-.5,Math.PI*1.25);ellipse(39,33,Math.PI*.05,Math.PI*1.65);break; // hula
    case 'stitcho': for(let i=0;i<3;i++){const a=phase+i*TAU/3;ctx.beginPath();ctx.arc(Math.cos(a)*42,Math.sin(a)*33,4+i,0,TAU);ctx.fill();}ellipse(48,38);break; // orbiting ship lights
    case 'chispin': ctx.beginPath();ctx.moveTo(-48,14);ctx.lineTo(-20,-12);ctx.lineTo(-7,2);ctx.lineTo(14,-30);ctx.lineTo(3,0);ctx.lineTo(30,-5);ctx.lineTo(48,-28);ctx.stroke();break;
    case 'cat': for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(-8+i*8,8,36+i*9,-1.3+phase*.15,1.1+phase*.15);ctx.stroke();}break; // lunar tails
    case 'cuerno': ellipse(49,72,-.78,.42);ellipse(57,84,Math.PI-.42,Math.PI+.78);ctx.beginPath();ctx.moveTo(0,-84);ctx.lineTo(-8,-68);ctx.lineTo(0,-52);ctx.lineTo(8,-68);ctx.closePath();ctx.fill();break;
    case 'dragon': for(const dir of [-1,1]){ctx.beginPath();ctx.moveTo(0,22);ctx.quadraticCurveTo(dir*20,-52,dir*60,-54);ctx.quadraticCurveTo(dir*39,0,0,22);ctx.stroke();}break; // wings
    case 'dino': for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(-30+i*20,25+(i%2)*5,4,0,TAU);ctx.fill();}ellipse(53,40);break; // fossil track
    case 'frita': ctx.beginPath();ctx.ellipse(0,0,48,36,0,phase,phase+Math.PI*1.6);ctx.stroke();for(let i=0;i<3;i++){const x=-30+i*30;ctx.beginPath();ctx.moveTo(x,56);ctx.quadraticCurveTo(x-8,42,x,30);ctx.quadraticCurveTo(x+8,18,x,7);ctx.stroke();}break; // steam and oil curl
    case 'pizza': for(let i=0;i<4;i++){const a=phase+i*TAU/4;ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,48,a,a+TAU/8);ctx.closePath();ctx.stroke();}break; // spinning slices
    case 'yomi': for(let i=0;i<5;i++){const a=phase+i*TAU/5,x=Math.cos(a)*48,y=Math.sin(a)*54;ctx.beginPath();ctx.arc(x,y,2.5,0,TAU);ctx.fill();ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(Math.cos(a+TAU/5)*48,Math.sin(a+TAU/5)*54);ctx.stroke();}break; // constellation
  }
  ctx.globalAlpha*=pulse;ctx.restore();
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

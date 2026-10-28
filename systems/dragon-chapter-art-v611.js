// V611 — Caldera del Dragón: arte vectorial puro para las 5 especies volcánicas,
// braseros ancestrales de la forja, corrientes térmicas y atmósfera de magma.
const TAU=Math.PI*2;

function _rr(c,x,y,w,h,r=4){if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);}

export function drawDragonCreature(ctx,e,cam,t,reduced=false){
 if(!e||e.roomId!=='w1-dragon'&&!e._dragonEncounter&&!e.roomPersona?.dragonEncounter)return false;
 const kind=e.kind||e._species;
 if(!['escoria','brasita','planta','rana','murcielago'].includes(kind))return false;

 const x=e.x+e.w/2-cam.x,y=e.y+e.h-cam.y,facing=e.facing||1;
 const hurt=e.invuln>0||e.stun>4;
 const step=reduced?0:Math.sin((t*0.14)+(e.spawnIndex||0)*1.3);

 ctx.save();
 ctx.translate(x,y);
 ctx.scale(facing,1);
 ctx.lineCap='round';ctx.lineJoin='round';

 if(kind==='escoria'){
  // ── Salamandra de escoria (pursuer) ──
  // Cuerpo bajo reptante de magma con coraza de roca negra y vientre brillante
  ctx.fillStyle='#1c1012';ctx.strokeStyle='#ff5722';ctx.lineWidth=2;
  ctx.beginPath();ctx.ellipse(0,-16,28,14,-0.05,0,TAU);ctx.fill();ctx.stroke();

  // Vientre de lava
  ctx.fillStyle='#ff9100';
  ctx.beginPath();ctx.ellipse(0,-12,18,6,0,0,TAU);ctx.fill();

  // Patas reptantes
  for(const side of [-1,1]){
   const legX=side*16,legSwing=side*step*5;
   ctx.strokeStyle='#211214';ctx.lineWidth=4;
   ctx.beginPath();ctx.moveTo(legX,-12);ctx.lineTo(legX+side*8+legSwing,-4);ctx.stroke();
   ctx.fillStyle='#ffab40';ctx.beginPath();ctx.arc(legX+side*8+legSwing,-3,2.5,0,TAU);ctx.fill();
  }

  // Cabeza con fauces ígneas
  ctx.fillStyle='#2b1114';ctx.strokeStyle='#ff6e40';ctx.lineWidth=1.8;
  ctx.beginPath();ctx.ellipse(22,-19,10,7,0.15,0,TAU);ctx.fill();ctx.stroke();

  // Ojo de ascua
  ctx.fillStyle=hurt?'#fff':'#ffe57f';ctx.beginPath();ctx.arc(24,-21,3,0,TAU);ctx.fill();
  ctx.fillStyle='#bf360c';ctx.beginPath();ctx.arc(25,-21,1.2,0,TAU);ctx.fill();

  // Cresta dorsal de brasas
  for(let i=-2;i<=2;i++){
   const px=i*9,py=-26-Math.abs(i)*2;
   ctx.fillStyle=i%2===0?'#ff3d00':'#ff9100';
   ctx.beginPath();ctx.moveTo(px-3,-22);ctx.lineTo(px,py);ctx.lineTo(px+3,-22);ctx.fill();
  }

  // Cola llameante
  const tailSway=Math.sin(t*0.2)*4;
  ctx.strokeStyle='#ff6e40';ctx.lineWidth=3.5;
  ctx.beginPath();ctx.moveTo(-22,-15);ctx.quadraticCurveTo(-34,-18+tailSway,-42,-12+tailSway);ctx.stroke();
  ctx.fillStyle='#ffab40';ctx.beginPath();ctx.arc(-42,-12+tailSway,3.5,0,TAU);ctx.fill();

 }else if(kind==='brasita'){
  // ── Chispa flotante de magma (shooter) ──
  // Esfera ígnea levitante con núcleo ardiente y corona de llamas
  const bob=reduced?0:Math.sin(t*0.12)*6;
  ctx.translate(0,bob-18);

  // Resplandor radial
  const glow=ctx.createRadialGradient(0,0,4,0,0,24);
  glow.addColorStop(0,'rgba(255,235,59,0.7)');
  glow.addColorStop(0.5,'rgba(255,87,34,0.4)');
  glow.addColorStop(1,'rgba(255,87,34,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,24,0,TAU);ctx.fill();

  // Núcleo esférico de roca fundida
  ctx.fillStyle='#ff5722';ctx.strokeStyle='#ffe082';ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(0,0,13,0,TAU);ctx.fill();ctx.stroke();

  // Grietas de fuego blanco
  ctx.strokeStyle='#fff9c4';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(-7,-4);ctx.lineTo(0,-1);ctx.lineTo(6,-6);ctx.moveTo(-3,5);ctx.lineTo(4,3);ctx.stroke();

  // Ojos brillantes
  ctx.fillStyle='#fff';
  ctx.beginPath();ctx.arc(-4,-3,2.5,0,TAU);ctx.arc(4,-3,2.5,0,TAU);ctx.fill();
  ctx.fillStyle='#d84315';
  ctx.beginPath();ctx.arc(-3.5,-3,1.2,0,TAU);ctx.arc(4.5,-3,1.2,0,TAU);ctx.fill();

  // Chispas orbitales
  for(let i=0;i<3;i++){
   const ang=(t*0.08)+i*(TAU/3);
   const ox=Math.cos(ang)*19,oy=Math.sin(ang)*11;
   ctx.fillStyle=i===0?'#fff59d':'#ff7043';
   ctx.beginPath();ctx.arc(ox,oy,2.2,0,TAU);ctx.fill();
  }

 }else if(kind==='planta'){
  // ── Flor de basalto acorazada (shield) ──
  // Pétalos rígidos de piedra volcánica que protegen un núcleo de fuego
  ctx.translate(0,-6);
  // Tallo de roca
  ctx.strokeStyle='#261715';ctx.lineWidth=7;
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-20);ctx.stroke();

  // Base de raíces calientes
  ctx.fillStyle='#3e2723';ctx.strokeStyle='#ff7043';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.ellipse(0,0,16,6,0,0,TAU);ctx.fill();ctx.stroke();

  // Pétalos coraza de basalto (escudo)
  for(let i=-2;i<=2;i++){
   const ang=i*0.35,px=Math.sin(ang)*22,py=-26-Math.cos(ang)*16;
   ctx.fillStyle='#1f1315';ctx.strokeStyle='#ff5722';ctx.lineWidth=2;
   ctx.beginPath();ctx.moveTo(0,-20);ctx.lineTo(px-4,py);ctx.lineTo(px+4,py);ctx.closePath();
   ctx.fill();ctx.stroke();
  }

  // Núcleo ardiente central
  ctx.fillStyle='#ffab00';ctx.strokeStyle='#fff';ctx.lineWidth=1.2;
  ctx.beginPath();ctx.arc(0,-24,8,0,TAU);ctx.fill();ctx.stroke();
  ctx.fillStyle='#d50000';ctx.beginPath();ctx.arc(0,-24,4,0,TAU);ctx.fill();

 }else if(kind==='rana'){
  // ── Sapo ígneo (jumper) ──
  // Cuadrúpedo rechoncho de magma, ancas poderosas cargadas para el salto
  const jumpAir=e.vy<-0.5;
  ctx.fillStyle='#2e1511';ctx.strokeStyle='#ff6d00';ctx.lineWidth=2.2;
  ctx.beginPath();ctx.ellipse(0,-16,19,13,-0.08,0,TAU);ctx.fill();ctx.stroke();

  // Manchas de lava incandescente en el lomo
  for(let m=-1;m<=1;m++){
   ctx.fillStyle='#ff9100';ctx.beginPath();ctx.arc(m*8,-20,3,0,TAU);ctx.fill();
  }

  // Ancas traseras dobladas
  ctx.strokeStyle='#1a0a07';ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(-12,-14);ctx.lineTo(-21,-6+(jumpAir?8:0));ctx.lineTo(-14,-1);ctx.stroke();
  ctx.beginPath();ctx.moveTo(12,-14);ctx.lineTo(21,-6+(jumpAir?8:0));ctx.lineTo(14,-1);ctx.stroke();

  // Ojos saltones dorados
  ctx.fillStyle='#ffb300';ctx.beginPath();ctx.arc(10,-24,4,0,TAU);ctx.fill();
  ctx.fillStyle='#212121';ctx.beginPath();ctx.arc(11,-24,1.8,0,TAU);ctx.fill();

 }else if(kind==='murcielago'){
  // ── Wyvern / Murciélago de ceniza (flyer) ──
  // Alas membranosas de lava, vuelo ondulante
  const flap=reduced?0:Math.sin(t*0.22)*12;
  ctx.translate(0,-22+Math.sin(t*0.1)*4);

  // Cuerpo delgado
  ctx.fillStyle='#1c0e12';ctx.strokeStyle='#ff5722';ctx.lineWidth=2;
  ctx.beginPath();ctx.ellipse(0,0,10,13,0,0,TAU);ctx.fill();ctx.stroke();

  // Alas de murciélago de magma
  for(const side of [-1,1]){
   ctx.save();ctx.scale(side,1);
   ctx.fillStyle='rgba(255,87,34,0.75)';ctx.strokeStyle='#ffab40';ctx.lineWidth=2;
   ctx.beginPath();
   ctx.moveTo(6,-3);
   ctx.quadraticCurveTo(24,-22+flap,38,-14+flap);
   ctx.lineTo(31,6+flap*0.5);
   ctx.lineTo(21,1);
   ctx.lineTo(12,8+flap*0.4);
   ctx.closePath();
   ctx.fill();ctx.stroke();
   ctx.restore();
  }

  // Ojos rojos penetrantes
  ctx.fillStyle='#ff1744';
  ctx.beginPath();ctx.arc(4,-4,2.5,0,TAU);ctx.arc(-2,-4,2.5,0,TAU);ctx.fill();
 }

 ctx.restore();
 return true;
}

export function drawDragonBrazier(ctx,s,cam,t,reduced=false){
 const x=s.x-cam.x,y=s.y-cam.y,done=!!s.done;

 ctx.save();
 // Pedestal de piedra volcánica
 ctx.fillStyle='#2c1b18';ctx.strokeStyle='#4e342e';ctx.lineWidth=3;
 ctx.beginPath();
 ctx.moveTo(x-38,y);ctx.lineTo(x-24,y-44);ctx.lineTo(x+24,y-44);ctx.lineTo(x+38,y);
 ctx.closePath();ctx.fill();ctx.stroke();

 // Runas de fuego en el fuste
 ctx.strokeStyle=done?'#ffab40':'#5d4037';ctx.lineWidth=1.8;
 for(let r=-1;r<=1;r++){
  ctx.beginPath();
  ctx.moveTo(x+r*14-4,y-20);ctx.lineTo(x+r*14,y-32);ctx.lineTo(x+r*14+4,y-20);
  ctx.stroke();
 }

 // Copa del brasero
 ctx.fillStyle='#3e2723';ctx.strokeStyle=done?'#ff6d00':'#6d4c41';ctx.lineWidth=3;
 ctx.beginPath();
 ctx.moveTo(x-46,y-44);ctx.bezierCurveTo(x-36,y-76,x+36,y-76,x+46,y-44);
 ctx.closePath();ctx.fill();ctx.stroke();

 // Carbones incandescentes en la copa
 ctx.fillStyle=done?'#ff3d00':'#21120f';
 ctx.beginPath();ctx.ellipse(x,y-56,36,9,0,0,TAU);ctx.fill();

 // Fuego sagrado cuando está encendido
 if(done){
  const flameSwirl=reduced?0:Math.sin(t*0.14)*5;
  const flameSwirl2=reduced?0:Math.cos(t*0.18)*6;

  // Llama exterior naranja
  ctx.fillStyle='#ff6d00';
  ctx.beginPath();
  ctx.moveTo(x-30,y-58);
  ctx.quadraticCurveTo(x-38+flameSwirl,y-104,x-6+flameSwirl,y-128);
  ctx.quadraticCurveTo(x+18+flameSwirl2,y-96,x+30,y-58);
  ctx.closePath();ctx.fill();

  // Llama intermedia amarilla
  ctx.fillStyle='#ffeb3b';
  ctx.beginPath();
  ctx.moveTo(x-20,y-58);
  ctx.quadraticCurveTo(x-22+flameSwirl2,y-94,x+flameSwirl,y-116);
  ctx.quadraticCurveTo(x+14+flameSwirl,y-88,x+20,y-58);
  ctx.closePath();ctx.fill();

  // Corazón blanco de llama
  ctx.fillStyle='#fffde7';
  ctx.beginPath();
  ctx.moveTo(x-10,y-58);
  ctx.quadraticCurveTo(x-10+flameSwirl*0.5,y-84,x,y-98);
  ctx.quadraticCurveTo(x+10+flameSwirl*0.5,y-80,x+10,y-58);
  ctx.closePath();ctx.fill();

  // Chispas ascendentes
  if(!reduced){
   for(let k=0;k<4;k++){
    const rise=((t*0.05+k*0.25)%1);
    const sx=x+Math.sin(t*0.1+k)*18;
    const sy=y-70-rise*60;
    ctx.fillStyle='#fff9c4';ctx.globalAlpha=1-rise;
    ctx.beginPath();ctx.arc(sx,sy,2.5,0,TAU);ctx.fill();
   }
   ctx.globalAlpha=1;
  }
 }

 // Rótulo
 ctx.fillStyle=done?'#ffcc80':'#8d6e63';
 ctx.font='bold 12px sans-serif';ctx.textAlign='center';
 ctx.fillText(done?'FUEGO ANCESTRAL ✓':'J · ENCIENDE EL BRASERO',x,y-145);

 ctx.restore();
}

export function drawDragonThermal(ctx,vent,cam,t,reduced=false){
 const x=vent.x-cam.x,y=vent.y-cam.y;
 ctx.save();

 // Fosa de magma en el suelo
 ctx.fillStyle='#371c17';ctx.beginPath();ctx.ellipse(x,y-5,vent.w/2,16,0,0,TAU);ctx.fill();
 ctx.strokeStyle='#ff6d00';ctx.lineWidth=2;ctx.stroke();
 ctx.fillStyle='#ff3d00';ctx.beginPath();ctx.ellipse(x,y-5,vent.w/2-10,9,0,0,TAU);ctx.fill();

 // Columna térmica de calor ascendente
 for(let i=0;i<5;i++){
  const rise=reduced?i/5:((t*0.007+i/5)%1);
  const yy=y-rise*vent.h;
  const sway=Math.sin(t*0.08+i)*12;
  const alpha=0.55*(1-rise);
  ctx.strokeStyle='#ffab40';ctx.lineWidth=2.2;ctx.globalAlpha=alpha;
  ctx.beginPath();
  ctx.moveTo(x-38+sway,yy);
  ctx.bezierCurveTo(x-15+sway,yy-16,x+15+sway,yy+16,x+38+sway,yy);
  ctx.stroke();

  // Partículas ascendentes de ceniza incandescente
  ctx.fillStyle='#ffe082';ctx.beginPath();
  ctx.arc(x+sway*1.2,yy-10,2.5,0,TAU);ctx.fill();
 }
 ctx.globalAlpha=1;

 // Aviso
 ctx.fillStyle='#ffab40';ctx.font='bold 11px sans-serif';ctx.textAlign='center';
 ctx.fillText('TÉRMICA · SALTA PARA ASCENDER',x,y-42);

 ctx.restore();
}

export function drawDragonAtmosphere(ctx,g,cam,t,reduced=false){
 const W=g.viewW||1280,H=g.viewH||720;
 ctx.save();

 // 1. Resplandor rojo/naranja del volcán en la base
 const heatGlow=ctx.createLinearGradient(0,H-160,0,H);
 heatGlow.addColorStop(0,'rgba(255,87,34,0)');
 heatGlow.addColorStop(1,'rgba(191,54,12,0.18)');
 ctx.fillStyle=heatGlow;ctx.fillRect(0,H-160,W,160);

 // 2. Cenizas y ascuas flotantes
 if(!reduced){
  const seed=Math.floor(cam.x/200);
  for(let i=0;i<18;i++){
   const phase=(t*0.03+i*13.7+seed)%100;
   const px=((i*113+phase*25)%W);
   const py=H-((phase*14+i*43)%H);
   const size=1.5+(i%3)*0.8;
   const flicker=0.35+Math.sin(t*0.1+i)*0.25;
   ctx.fillStyle=i%2===0?'#ff9100':'#ffab40';
   ctx.globalAlpha=flicker;
   ctx.beginPath();ctx.arc(px,py,size,0,TAU);ctx.fill();
  }
 }

 ctx.restore();
}

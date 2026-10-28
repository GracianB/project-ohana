// V612 — Caldera del Dragón: arte vectorial completo, 5 especies volcánicas,
// braseros ancestrales de la forja, corrientes térmicas y atmósfera volcánica.
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
  // ── Salamandra de lava (pursuer) — versión colosal ──
  // Escala factor x1.4 respecto al original
  const sc=1.4;
  ctx.save();ctx.scale(sc,sc);

  // Cuerpo principal de roca negra volcánica
  ctx.fillStyle=hurt?'#ffffff':'#1c1012';
  ctx.strokeStyle='#ff5722';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.ellipse(0,-16,28,14,-0.05,0,TAU);ctx.fill();ctx.stroke();

  // Vientre de lava incandescente con textura de grietas
  const bellyGrad=ctx.createRadialGradient(0,-12,2,0,-12,18);
  bellyGrad.addColorStop(0,'#ffcc00');
  bellyGrad.addColorStop(0.5,'#ff9100');
  bellyGrad.addColorStop(1,'rgba(255,87,34,0)');
  ctx.fillStyle=bellyGrad;
  ctx.beginPath();ctx.ellipse(0,-12,18,7,0,0,TAU);ctx.fill();
  // Grietas de lava en el vientre
  ctx.strokeStyle='rgba(255,220,0,0.7)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(-12,-13);ctx.lineTo(-4,-10);ctx.lineTo(2,-14);ctx.moveTo(5,-11);ctx.lineTo(12,-13);ctx.stroke();

  // 4 patas con garras y swing animado
  const legPairs=[[-18,-12,-1],[18,-12,1],[-14,-8,-1],[14,-8,1]];
  for(let li=0;li<4;li++){
   const [lx,ly,side]=legPairs[li];
   const swing=side*step*(li<2?6:4);
   ctx.strokeStyle='#211214';ctx.lineWidth=4.5;
   ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(lx+side*10+swing,-4);ctx.stroke();
   // Garra
   ctx.strokeStyle='#3d1a10';ctx.lineWidth=2;
   const cx2=lx+side*10+swing,cy2=-4;
   for(let g2=0;g2<3;g2++){
    const ga=(-0.4+g2*0.4);
    ctx.beginPath();ctx.moveTo(cx2,cy2);ctx.lineTo(cx2+Math.cos(ga)*7,cy2+Math.sin(ga)*4+3);ctx.stroke();
   }
  }

  // Cresta dorsal de 5 espinas de piedra con puntas incandescentes
  for(let i=-2;i<=2;i++){
   const px=i*9,py=-28-Math.abs(i)*2.5-(i===0?3:0);
   // Espina de roca
   ctx.fillStyle='#2c1810';ctx.strokeStyle='#5d2a18';ctx.lineWidth=1.5;
   ctx.beginPath();ctx.moveTo(px-4,-22);ctx.lineTo(px,py-4);ctx.lineTo(px+4,-22);ctx.fill();ctx.stroke();
   // Punta incandescente
   const tipColor=i%2===0?'#ff6d00':'#ffab40';
   ctx.fillStyle=tipColor;
   ctx.beginPath();ctx.arc(px,py,2.5,0,TAU);ctx.fill();
  }

  // Cabeza acorazada con dos cuernos
  ctx.fillStyle=hurt?'#fff8':'#2b1114';ctx.strokeStyle='#ff6e40';ctx.lineWidth=2;
  ctx.beginPath();ctx.ellipse(22,-20,12,8,0.15,0,TAU);ctx.fill();ctx.stroke();
  // Cuernos
  ctx.fillStyle='#1a0805';ctx.strokeStyle='#ff5722';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(26,-26);ctx.quadraticCurveTo(32,-36,28,-40);ctx.lineTo(24,-26);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(30,-25);ctx.quadraticCurveTo(38,-33,36,-37);ctx.lineTo(32,-24);ctx.fill();ctx.stroke();

  // Lengua bífida de fuego
  const tonguePhase=Math.sin(t*0.3)*3;
  ctx.strokeStyle='#ff1744';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(33,-19);ctx.lineTo(38,-17+tonguePhase);ctx.stroke();
  ctx.beginPath();ctx.moveTo(38,-17+tonguePhase);ctx.lineTo(42,-14);ctx.moveTo(38,-17+tonguePhase);ctx.lineTo(42,-21);ctx.stroke();

  // Ojo de ascua
  ctx.fillStyle=hurt?'#ffffff':'#ffe57f';ctx.beginPath();ctx.arc(24,-22,3.5,0,TAU);ctx.fill();
  ctx.fillStyle='#bf360c';ctx.beginPath();ctx.arc(25,-22,1.5,0,TAU);ctx.fill();

  // Cola llameante
  const tailSway=Math.sin(t*0.2)*5;
  ctx.strokeStyle='#ff6e40';ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(-22,-15);ctx.quadraticCurveTo(-36,-18+tailSway,-46,-12+tailSway);ctx.stroke();
  ctx.fillStyle='#ffab40';ctx.beginPath();ctx.arc(-46,-12+tailSway,4,0,TAU);ctx.fill();

  // Efecto de daño: marcas X blancas
  if(hurt){
   ctx.strokeStyle='rgba(255,255,255,0.9)';ctx.lineWidth=2.5;
   for(const [hx,hy] of [[-10,-18],[0,-28],[10,-18]]){
    ctx.beginPath();ctx.moveTo(hx-4,hy-4);ctx.lineTo(hx+4,hy+4);ctx.moveTo(hx+4,hy-4);ctx.lineTo(hx-4,hy+4);ctx.stroke();
   }
  }

  ctx.restore();// restore scale

 }else if(kind==='brasita'){
  // ── Chispa flotante (shooter) — radio 18 ──
  const bob=reduced?0:Math.sin(t*0.12)*6;
  ctx.translate(0,bob-18);

  // Resplandor radial mejorado (doble capa)
  const glow2=ctx.createRadialGradient(0,0,2,0,0,38);
  glow2.addColorStop(0,'rgba(255,235,59,0.6)');
  glow2.addColorStop(0.4,'rgba(255,140,0,0.35)');
  glow2.addColorStop(1,'rgba(255,87,34,0)');
  ctx.fillStyle=glow2;ctx.beginPath();ctx.arc(0,0,38,0,TAU);ctx.fill();

  const glow=ctx.createRadialGradient(0,0,4,0,0,28);
  glow.addColorStop(0,'rgba(255,235,59,0.8)');
  glow.addColorStop(0.5,'rgba(255,87,34,0.5)');
  glow.addColorStop(1,'rgba(255,87,34,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,28,0,TAU);ctx.fill();

  // Anillo de lava giratorio (fina elipse rotada)
  const ringAngle=(t*0.06)%(TAU);
  ctx.save();ctx.rotate(ringAngle);
  ctx.strokeStyle='rgba(255,160,0,0.75)';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.ellipse(0,0,22,8,0,0,TAU);ctx.stroke();
  ctx.restore();

  // Núcleo esférico — radio 18
  ctx.fillStyle='#ff5722';ctx.strokeStyle='#ffe082';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.arc(0,0,18,0,TAU);ctx.fill();ctx.stroke();

  // Grietas de fuego blanco
  ctx.strokeStyle='#fff9c4';ctx.lineWidth=1.8;
  ctx.beginPath();ctx.moveTo(-10,-5);ctx.lineTo(0,-1);ctx.lineTo(8,-8);ctx.moveTo(-4,7);ctx.lineTo(6,4);ctx.moveTo(-6,0);ctx.lineTo(-2,6);ctx.stroke();

  // Boca / fauces que se abren al disparar
  const mouthOpen=!!(e.shooting)||reduced?0.4:Math.abs(Math.sin(t*0.15))*0.5;
  ctx.fillStyle='#1a0500';
  ctx.beginPath();ctx.ellipse(0,7,6,3+mouthOpen*4,0,0,TAU);ctx.fill();
  if(mouthOpen>0.2){
   ctx.fillStyle='#ff3d00';
   ctx.beginPath();ctx.ellipse(0,8,4,2+mouthOpen*3,0,0,TAU);ctx.fill();
  }

  // Ojos brillantes
  ctx.fillStyle='#fff';
  ctx.beginPath();ctx.arc(-5,-4,3,0,TAU);ctx.arc(5,-4,3,0,TAU);ctx.fill();
  ctx.fillStyle='#d84315';
  ctx.beginPath();ctx.arc(-4.5,-4,1.5,0,TAU);ctx.arc(5.5,-4,1.5,0,TAU);ctx.fill();

  // 5 chispas orbitales
  for(let i=0;i<5;i++){
   const ang=(t*0.08)+i*(TAU/5);
   const dist=24+(i%2)*4;
   const ox=Math.cos(ang)*dist,oy=Math.sin(ang)*dist*0.6;
   ctx.fillStyle=i%2===0?'#fff59d':'#ff7043';
   ctx.beginPath();ctx.arc(ox,oy,2.5,0,TAU);ctx.fill();
  }

 }else if(kind==='planta'){
  // ── Flor de basalto (shield) — 7 pétalos, raíces, núcleo pulsante ──
  ctx.translate(0,-6);

  // Tentáculos de raíz en el suelo (3 curvas bezier izq/der)
  const rootPhase=Math.sin(t*0.04)*4;
  ctx.strokeStyle='#3e2723';ctx.lineWidth=3.5;
  for(const side of [-1,1]){
   for(let ri=0;ri<3;ri++){
    const rx=side*(14+ri*10),ry=-2;
    ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(side*8,ry-6+ri*3,rx+side*5,ry-3,rx,ry+4+ri*2);ctx.stroke();
   }
  }

  // Tallo de roca
  ctx.strokeStyle='#261715';ctx.lineWidth=8;
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-22);ctx.stroke();

  // Base de raíces calientes
  ctx.fillStyle='#3e2723';ctx.strokeStyle='#ff7043';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.ellipse(0,0,18,7,0,0,TAU);ctx.fill();ctx.stroke();

  // 7 pétalos con animación abre/cierra y textura de líneas de piedra
  const petalOpen=Math.sin(t*0.05)*0.18;
  for(let i=0;i<7;i++){
   const ang=(i/7)*TAU-Math.PI/2+petalOpen;
   const px=Math.sin(ang)*24,py=-26-Math.cos(ang)*18;
   ctx.fillStyle='#1f1315';ctx.strokeStyle='#ff5722';ctx.lineWidth=2;
   ctx.beginPath();ctx.moveTo(0,-22);ctx.lineTo(px-4,py);ctx.lineTo(px+4,py);ctx.closePath();
   ctx.fill();ctx.stroke();
   // Líneas de textura de piedra en el pétalo
   ctx.strokeStyle='rgba(80,30,20,0.7)';ctx.lineWidth=0.8;
   ctx.beginPath();ctx.moveTo(px*0.3,-22+(py+22)*0.3);ctx.lineTo(px,py);ctx.stroke();
  }

  // Núcleo ardiente con segundo anillo interior
  const coreR=8+Math.sin(t*0.1)*1.5;
  ctx.fillStyle='#ffab00';ctx.strokeStyle='#fff';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(0,-26,coreR,0,TAU);ctx.fill();ctx.stroke();
  // Segundo anillo interior pulsante
  const innerR=4+Math.sin(t*0.15+1)*1;
  ctx.fillStyle='#d50000';ctx.beginPath();ctx.arc(0,-26,innerR,0,TAU);ctx.fill();
  ctx.strokeStyle='rgba(255,200,0,0.6)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,-26,coreR*1.3,0,TAU);ctx.stroke();

 }else if(kind==='rana'){
  // ── Sapo ígneo (jumper) — 4 patas, boca abierta, verrugas, cabeza plana ──
  const jumpAir=e.vy<-0.5;

  // Cabeza plana y ancha
  ctx.fillStyle='#2e1511';ctx.strokeStyle='#ff6d00';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.ellipse(0,-26,22,8,0,0,TAU);ctx.fill();ctx.stroke();

  // Ojos saltones en pedúnculos
  for(const side of [-1,1]){
   ctx.fillStyle='#1a0a05';ctx.strokeStyle='#ff6d00';ctx.lineWidth=1.5;
   ctx.beginPath();ctx.arc(side*16,-32,5,0,TAU);ctx.fill();ctx.stroke();
   ctx.fillStyle='#ffb300';ctx.beginPath();ctx.arc(side*16,-33,4,0,TAU);ctx.fill();
   ctx.fillStyle='#212121';ctx.beginPath();ctx.arc(side*16.5,-33,1.8,0,TAU);ctx.fill();
  }

  // Boca abierta al saltar
  if(jumpAir){
   ctx.fillStyle='#500000';ctx.strokeStyle='#ff6d00';ctx.lineWidth=2;
   ctx.beginPath();ctx.ellipse(0,-22,14,8,0,0,TAU);ctx.fill();ctx.stroke();
   ctx.fillStyle='#ff2200';ctx.beginPath();ctx.ellipse(0,-22,10,5,0,0,TAU);ctx.fill();
  }

  // Cuerpo principal rechoncho
  ctx.fillStyle='#2e1511';ctx.strokeStyle='#ff6d00';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.ellipse(0,-12,22,15,-0.08,0,TAU);ctx.fill();ctx.stroke();

  // Manchas de lava incandescente en el lomo
  ctx.fillStyle='#ff9100';
  for(let m=-2;m<=2;m++){
   ctx.beginPath();ctx.arc(m*7,-16,3.5,0,TAU);ctx.fill();
  }

  // Verrugas (5 pequeños círculos) en el dorso
  ctx.fillStyle='#3a1a10';ctx.strokeStyle='#ff5722';ctx.lineWidth=1;
  for(const [wx,wy] of [[-14,-18],[14,-18],[-7,-22],[7,-22],[0,-25]]){
   ctx.beginPath();ctx.arc(wx,wy,2.5,0,TAU);ctx.fill();ctx.stroke();
  }

  // 2 patas delanteras
  const frontSpread=jumpAir?18:10;
  ctx.strokeStyle='#1a0a07';ctx.lineWidth=4.5;
  for(const side of [-1,1]){
   ctx.beginPath();ctx.moveTo(side*16,-10);ctx.lineTo(side*(18+frontSpread),-4);ctx.lineTo(side*(22+frontSpread),2);ctx.stroke();
  }

  // 2 patas traseras con geometría de rana
  const backSpread=jumpAir?16:0;
  for(const side of [-1,1]){
   ctx.beginPath();
   ctx.moveTo(side*14,-8);
   ctx.lineTo(side*22,-4+backSpread);
   ctx.lineTo(side*16,2+backSpread);
   ctx.stroke();
  }

 }else if(kind==='murcielago'){
  // ── Wyvern de brasas (flyer) — alas enormes, 3 huesos, cabeza con cuernos ──
  const flap=reduced?0:Math.sin(t*0.22)*16;
  ctx.translate(0,-22+Math.sin(t*0.1)*4);

  // Alas grandes (span ~80) con 3 huesos por ala y venas de brasa
  for(const side of [-1,1]){
   ctx.save();ctx.scale(side,1);

   // Membrana principal
   ctx.fillStyle='rgba(255,87,34,0.7)';ctx.strokeStyle='#ffab40';ctx.lineWidth=2;
   ctx.beginPath();
   ctx.moveTo(8,-2);
   ctx.quadraticCurveTo(30,-28+flap,46,-18+flap);  // hueso 1
   ctx.lineTo(38,8+flap*0.4);
   ctx.quadraticCurveTo(34,-8+flap*0.3,30,6);       // hueso 2
   ctx.lineTo(24,10+flap*0.3);
   ctx.quadraticCurveTo(22,-4+flap*0.2,16,10);       // hueso 3
   ctx.closePath();
   ctx.fill();ctx.stroke();

   // 3 huesos de dedo
   ctx.strokeStyle='rgba(200,100,0,0.6)';ctx.lineWidth=1.5;
   ctx.beginPath();ctx.moveTo(8,-2);ctx.lineTo(46,-18+flap);ctx.stroke();
   ctx.beginPath();ctx.moveTo(8,-2);ctx.lineTo(38,8+flap*0.4);ctx.stroke();
   ctx.beginPath();ctx.moveTo(8,-2);ctx.lineTo(24,10+flap*0.3);ctx.stroke();

   // Venas de brasa en la membrana
   ctx.strokeStyle='rgba(255,200,50,0.35)';ctx.lineWidth=1;
   for(let vi=0;vi<3;vi++){
    const t2=vi/3;
    ctx.beginPath();ctx.moveTo(8+t2*14,-2+t2*4);ctx.lineTo(40-t2*6,-14+flap*(0.3+t2*0.2));ctx.stroke();
   }

   ctx.restore();
  }

  // Cola larga como látigo con onda
  const tailWave=Math.sin(t*0.18)*8;
  ctx.strokeStyle='#cc4400';ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(-6,5);ctx.bezierCurveTo(-18,15+tailWave,-30,12,-38,18+tailWave*0.5);ctx.stroke();
  // Punta de cola
  ctx.fillStyle='#ff6d00';ctx.beginPath();ctx.arc(-38,18+tailWave*0.5,3.5,0,TAU);ctx.fill();

  // Cuerpo delgado
  ctx.fillStyle='#1c0e12';ctx.strokeStyle='#ff5722';ctx.lineWidth=2;
  ctx.beginPath();ctx.ellipse(0,0,10,14,0,0,TAU);ctx.fill();ctx.stroke();

  // Cabeza dragónica triangular con cuernos
  ctx.fillStyle='#2a0f0a';ctx.strokeStyle='#ff6e40';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-8,-14);ctx.lineTo(12,-14);ctx.lineTo(16,-6);ctx.lineTo(-4,-4);ctx.closePath();
  ctx.fill();ctx.stroke();

  // 2 pequeños cuernos en la cabeza
  ctx.fillStyle='#1a0500';ctx.strokeStyle='#ff5722';ctx.lineWidth=1.2;
  ctx.beginPath();ctx.moveTo(-4,-14);ctx.lineTo(-6,-22);ctx.lineTo(-2,-14);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(4,-14);ctx.lineTo(6,-22);ctx.lineTo(8,-14);ctx.fill();ctx.stroke();

  // Ojos con pupila vertical que brilla rojo/dorado
  ctx.fillStyle='#ff1744';
  ctx.beginPath();ctx.arc(4,-10,3,0,TAU);ctx.arc(-2,-10,3,0,TAU);ctx.fill();
  ctx.fillStyle='#220000';
  ctx.beginPath();ctx.ellipse(4,-10,1,2.5,0,0,TAU);ctx.ellipse(-2,-10,1,2.5,0,0,TAU);ctx.fill();
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

 // Runas en el fuste que pulsan si done
 const runeAlpha=done?(0.5+Math.sin(t*0.12)*0.4):0.25;
 ctx.globalAlpha=runeAlpha;
 ctx.strokeStyle=done?'#ffab40':'#7d5a50';ctx.lineWidth=1.8;
 for(let r=-1;r<=1;r++){
  ctx.beginPath();
  ctx.moveTo(x+r*14-4,y-20);ctx.lineTo(x+r*14,y-32);ctx.lineTo(x+r*14+4,y-20);
  ctx.stroke();
  // Segunda runa horizontal
  ctx.beginPath();ctx.moveTo(x+r*14-4,y-26);ctx.lineTo(x+r*14+4,y-26);ctx.stroke();
 }
 ctx.globalAlpha=1;

 // Copa del brasero
 ctx.fillStyle='#3e2723';ctx.strokeStyle=done?'#ff6d00':'#6d4c41';ctx.lineWidth=3;
 ctx.beginPath();
 ctx.moveTo(x-46,y-44);ctx.bezierCurveTo(x-36,y-76,x+36,y-76,x+46,y-44);
 ctx.closePath();ctx.fill();ctx.stroke();

 // Lava derritiéndose por los lados — 3 puntos de goteo
 if(done&&!reduced){
  for(let d=0;d<3;d++){
   const drip=((t*0.03+d*0.33)%1);
   const dx2=x+(d-1)*22;
   const dy1=y-56,dy2=y-44+drip*30;
   ctx.strokeStyle=`rgba(255,${80+d*30},0,${0.7-drip*0.5})`;ctx.lineWidth=3-d*0.5;
   ctx.beginPath();ctx.moveTo(dx2,dy1);ctx.bezierCurveTo(dx2+4,dy1+8,dx2-4,dy1+16,dx2,dy2);ctx.stroke();
   // Gota en la punta
   ctx.fillStyle=`rgba(255,${60+d*20},0,${0.8-drip*0.6})`;
   ctx.beginPath();ctx.arc(dx2,dy2,2.5-drip*1.5,0,TAU);ctx.fill();
  }
 }

 // Carbones incandescentes en la copa
 ctx.fillStyle=done?'#ff3d00':'#21120f';
 ctx.beginPath();ctx.ellipse(x,y-56,36,9,0,0,TAU);ctx.fill();

 // Fuego sagrado cuando está encendido — 5 capas dramáticas
 if(done){
  const flameSwirl=reduced?0:Math.sin(t*0.14)*6;
  const flameSwirl2=reduced?0:Math.cos(t*0.18)*7;
  const flameSwirl3=reduced?0:Math.sin(t*0.22+1)*5;

  // Capa 1: llama exterior naranja
  ctx.fillStyle='#ff6d00';
  ctx.beginPath();ctx.moveTo(x-30,y-58);
  ctx.quadraticCurveTo(x-40+flameSwirl,y-110,x-8+flameSwirl,y-136);
  ctx.quadraticCurveTo(x+20+flameSwirl2,y-102,x+30,y-58);
  ctx.closePath();ctx.fill();

  // Capa 2: naranja intenso
  ctx.fillStyle='#ff9100';
  ctx.beginPath();ctx.moveTo(x-24,y-58);
  ctx.quadraticCurveTo(x-28+flameSwirl2,y-98,x+flameSwirl3,y-122);
  ctx.quadraticCurveTo(x+16+flameSwirl,y-92,x+24,y-58);
  ctx.closePath();ctx.fill();

  // Capa 3: amarilla intermedia
  ctx.fillStyle='#ffeb3b';
  ctx.beginPath();ctx.moveTo(x-18,y-58);
  ctx.quadraticCurveTo(x-20+flameSwirl,y-90,x+flameSwirl2*0.7,y-112);
  ctx.quadraticCurveTo(x+12+flameSwirl*0.8,y-84,x+18,y-58);
  ctx.closePath();ctx.fill();

  // Capa 4: amarillo claro
  ctx.fillStyle='#fff176';
  ctx.beginPath();ctx.moveTo(x-12,y-58);
  ctx.quadraticCurveTo(x-12+flameSwirl3*0.5,y-82,x+flameSwirl*0.4,y-104);
  ctx.quadraticCurveTo(x+10+flameSwirl2*0.4,y-78,x+12,y-58);
  ctx.closePath();ctx.fill();

  // Capa 5: corazón blanco
  ctx.fillStyle='#fffde7';
  ctx.beginPath();ctx.moveTo(x-8,y-58);
  ctx.quadraticCurveTo(x-7+flameSwirl*0.3,y-80,x,y-96);
  ctx.quadraticCurveTo(x+8+flameSwirl*0.3,y-76,x+8,y-58);
  ctx.closePath();ctx.fill();

  // Humo ascendente — 3 puffs a diferentes alturas
  if(!reduced){
   for(let k=0;k<3;k++){
    const rise=((t*0.04+k*0.33)%1);
    const sy=y-100-rise*80;
    const sw=14+rise*20;
    const alpha=0.25*(1-rise);
    ctx.fillStyle=`rgba(80,40,20,${alpha})`;
    ctx.beginPath();ctx.ellipse(x+(k-1)*8,sy,sw,sw*0.6,0,0,TAU);ctx.fill();
   }
  }

  // Chispas ascendentes
  if(!reduced){
   for(let k=0;k<5;k++){
    const rise=((t*0.05+k*0.2)%1);
    const sx=x+Math.sin(t*0.1+k)*22;
    const sy=y-70-rise*70;
    ctx.fillStyle='#fff9c4';ctx.globalAlpha=1-rise;
    ctx.beginPath();ctx.arc(sx,sy,2.5,0,TAU);ctx.fill();
   }
   ctx.globalAlpha=1;
  }
 }

 // Rótulo
 ctx.fillStyle=done?'#ffcc80':'#8d6e63';
 ctx.font='bold 12px sans-serif';ctx.textAlign='center';
 ctx.fillText(done?'FUEGO ANCESTRAL ✓':'J · ENCIENDE EL BRASERO',x,y-152);

 ctx.restore();
}

export function drawDragonThermal(ctx,vent,cam,t,reduced=false){
 const x=vent.x-cam.x,y=vent.y-cam.y;
 ctx.save();

 // Fosa de magma en el suelo con brillo intenso
 const lavaGlow=ctx.createRadialGradient(x,y-5,4,x,y-5,vent.w/2+10);
 lavaGlow.addColorStop(0,'rgba(255,150,0,0.6)');
 lavaGlow.addColorStop(0.6,'rgba(255,60,0,0.3)');
 lavaGlow.addColorStop(1,'rgba(200,30,0,0)');
 ctx.fillStyle=lavaGlow;ctx.beginPath();ctx.ellipse(x,y-5,vent.w/2+10,22,0,0,TAU);ctx.fill();

 ctx.fillStyle='#371c17';ctx.beginPath();ctx.ellipse(x,y-5,vent.w/2,16,0,0,TAU);ctx.fill();
 ctx.strokeStyle='#ff6d00';ctx.lineWidth=2.5;ctx.stroke();
 ctx.fillStyle='#ff3d00';ctx.beginPath();ctx.ellipse(x,y-5,vent.w/2-10,9,0,0,TAU);ctx.fill();
 // Núcleo brillante
 ctx.fillStyle='#ffcc00';ctx.beginPath();ctx.ellipse(x,y-5,vent.w/2-22,4,0,0,TAU);ctx.fill();

 // Efecto de calor: líneas horizontales onduladas (heat haze)
 if(!reduced){
  for(let hi=0;hi<6;hi++){
   const hFrac=hi/6;
   const hy=y-vent.h*hFrac;
   const hAlpha=0.15*(1-hFrac);
   const sway=Math.sin(t*0.06+hi*1.3)*14;
   ctx.strokeStyle=`rgba(255,160,40,${hAlpha})`;ctx.lineWidth=1;
   ctx.beginPath();
   ctx.moveTo(x-vent.w/2,hy);
   ctx.bezierCurveTo(x-vent.w/4+sway,hy-8,x+vent.w/4-sway,hy+8,x+vent.w/2,hy);
   ctx.stroke();
  }
 }

 // Columna térmica de calor ascendente
 for(let i=0;i<6;i++){
  const rise=reduced?i/6:((t*0.007+i/6)%1);
  const yy=y-rise*vent.h;
  const sway=Math.sin(t*0.08+i)*14;
  const alpha=0.55*(1-rise);
  ctx.strokeStyle='#ffab40';ctx.lineWidth=2.5;ctx.globalAlpha=alpha;
  ctx.beginPath();
  ctx.moveTo(x-40+sway,yy);
  ctx.bezierCurveTo(x-16+sway,yy-18,x+16+sway,yy+18,x+40+sway,yy);
  ctx.stroke();

  // Partículas de brasa que espiralan hacia arriba
  const spiralAngle=t*0.05+i*1.2;
  const spiralX=x+Math.cos(spiralAngle)*(12*(1-rise));
  ctx.fillStyle='#ffe082';ctx.beginPath();
  ctx.arc(spiralX,yy-8,2.5*(1-rise*0.6),0,TAU);ctx.fill();
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

 // 1. Resplandor del río de lava en la base (gradiente más intenso)
 const heatGlow=ctx.createLinearGradient(0,H-200,0,H);
 heatGlow.addColorStop(0,'rgba(255,87,34,0)');
 heatGlow.addColorStop(0.5,'rgba(200,60,0,0.12)');
 heatGlow.addColorStop(1,'rgba(191,54,12,0.28)');
 ctx.fillStyle=heatGlow;ctx.fillRect(0,H-200,W,200);

 // 2. Columnas volcánicas en el fondo (3 siluetas trapezoidales oscuras)
 const cols=[
  {rx:0.15,w:80,h:260},{rx:0.5,w:100,h:320},{rx:0.82,w:70,h:220}
 ];
 const camOff=(cam.x*0.15)%W; // paralaje suave
 for(const col of cols){
  const bx=((col.rx*W-camOff)%W+W)%W;
  const by=H-col.h;
  ctx.fillStyle='rgba(15,6,4,0.6)';
  ctx.beginPath();
  ctx.moveTo(bx-col.w*0.4,H);
  ctx.lineTo(bx-col.w*0.5,by);
  ctx.lineTo(bx+col.w*0.5,by);
  ctx.lineTo(bx+col.w*0.4,H);
  ctx.closePath();ctx.fill();
  // Corona de la columna ligeramente iluminada por lava
  ctx.fillStyle='rgba(255,80,10,0.12)';
  ctx.beginPath();ctx.ellipse(bx,by,col.w*0.6,18,0,0,TAU);ctx.fill();
 }

 // 3. Cenizas y ascuas flotantes
 if(!reduced){
  const seed=Math.floor(cam.x/200);
  for(let i=0;i<22;i++){
   const phase=(t*0.03+i*13.7+seed)%100;
   const px=((i*113+phase*25)%W);
   const py=H-((phase*14+i*43)%H);
   const size=1.2+(i%3)*0.7;
   const flicker=0.3+Math.sin(t*0.1+i)*0.3;
   ctx.fillStyle=i%2===0?'#ff9100':'#ffab40';
   ctx.globalAlpha=flicker;
   ctx.beginPath();ctx.arc(px,py,size,0,TAU);ctx.fill();
  }

  // 4. Ceniza oscura cayendo desde arriba
  for(let i=0;i<14;i++){
   const ashPhase=(t*0.02+i*7.3+seed*0.1)%100;
   const apx=((i*157+ashPhase*18)%W);
   const apy=(ashPhase*12)%H;
   const aAlpha=0.18+Math.sin(t*0.07+i)*0.1;
   ctx.fillStyle='rgba(30,15,10,'+aAlpha+')';
   ctx.beginPath();ctx.arc(apx,apy,1.5+(i%2)*0.8,0,TAU);ctx.fill();
  }
 }

 ctx.globalAlpha=1;
 ctx.restore();
}

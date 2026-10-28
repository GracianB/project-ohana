// Bosque Prisma de Cuerno: fauna de cristal, Prismas sagrados I-II-III y Espejo del Alba.
// Arte vectorial en Canvas de alta calidad (mismo estándar que V606/V607/V608/V609).
// Solo presentación: lee el estado real sin tocar física ni daño.
const TAU=Math.PI*2,INK='#18222d',GOLD='#ffe07a',PURPLE='#b388ff',AQUA='#64ffda',EMERALD='#69f0ae';

function fill(c,color,draw,width=1.8){c.beginPath();draw();c.closePath();c.fillStyle=color;c.fill();if(width){c.strokeStyle=INK;c.lineWidth=width;c.stroke();}}
function stroke(c,color,width,draw){c.beginPath();draw();c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function ellipse(c,x,y,rx,ry,color,rotation=0,width=1.6){fill(c,color,()=>c.ellipse(x,y,rx,ry,rotation,0,TAU),width);}
function gradient(c,x,y,w,h,a,b,d){const g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,a);if(d)g.addColorStop(.5,b);g.addColorStop(1,d||b);return g;}
function roundRect(c,x,y,w,h,r=4){if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);}

function eye(c,x,y,r,aim=1,{hurt=false,glow='#ffe082'}={}){
 if(hurt){stroke(c,INK,2,()=>{c.moveTo(x-r,y);c.lineTo(x+r,y);});return;}
 ellipse(c,x,y,r,r*1.05,'#ffffff',0,1.4);
 ellipse(c,x+aim*r*.22,y,r*.52,r*.68,glow,0,0);
 ellipse(c,x+aim*r*.26,y,r*.25,r*.44,'#121b24',0,0);
 ellipse(c,x-r*.18,y-r*.3,r*.22,r*.22,'#ffffff',0,0);
}

// ─ Escarabajo de cristal (cangrejo): caparazón facetado de amatista y escudos de selenita
function drawCrystalBeetle(c,s){
 const {time,active,hurt,aim}=s;
 const p=Math.sin(time*.1)*2;
 // Patas de cuarzo articuladas (3 a cada lado)
 for(const side of [-1,1]){
  for(let i=0;i<3;i++){
   const ry=-14+i*6;
   stroke(c,'#6a488e',2.4,()=>{
    c.moveTo(side*12,ry);c.lineTo(side*24,ry-6);c.lineTo(side*30,ry+6);
   });
   ellipse(c,side*30,ry+6,2,2,GOLD,0,0);
  }
 }
 // Caparazón facetado de amatista (romboidal)
 fill(c,gradient(c,-24,-36,48,32,'#d1b3ff','#8e5db8','#3f2066'),()=>{
  c.moveTo(0,-36);c.lineTo(24,-20);c.lineTo(18,-4);c.lineTo(-18,-4);c.lineTo(-24,-20);
 },2.2);
 // Facetas interiores reflectantes
 stroke(c,'#f3e5ff',1.4,()=>{
  c.moveTo(0,-36);c.lineTo(0,-4);
  c.moveTo(0,-20);c.lineTo(24,-20);
  c.moveTo(0,-20);c.lineTo(-24,-20);
 });
 // Cabeza acorazada
 fill(c,'#4a2e6e',()=>c.ellipse(aim*4,-24,11,9,0,0,TAU),2);
 eye(c,aim*6,-26,4,aim,{hurt,glow:AQUA});
 // Pinzas de cuarzo frontal
 for(const side of [-1,1]){
  stroke(c,GOLD,2.4,()=>{
   c.moveTo(aim*12+side*4,-22);c.lineTo(aim*18+side*8,-16);c.lineTo(aim*22+side*2,-22);
  });
 }
 if(active)ellipse(c,aim*22,-22,3,3,EMERALD,0,0);
}

// ─ Libélula prisma (libelula): planeador aéreo con 4 alas iridiscentes que refractan luz
function drawPrismDragonfly(c,s){
 const {time,active,hurt,aim}=s;
 const flap=Math.sin(time*.4)*10;
 // 4 alas de prisma translúcidas
 for(const side of [-1,1]){
  for(const pair of [0,1]){
   c.save();c.translate(side*4,-20+pair*8);
   c.rotate(side*(.35+pair*.1)+flap*.04*side);
   fill(c,pair?'rgba(100,255,218,0.55)':'rgba(255,224,130,0.55)',()=>{
    c.ellipse(side*17,-6,20,6,side*-.25,0,TAU);
   },1.2);
   stroke(c,'#ffffff',1,()=>{c.moveTo(0,0);c.lineTo(side*26,-7);});
   c.restore();
  }
 }
 // Abdomen largo y segmentado con esferas de arcoíris
 for(let seg=0;seg<5;seg++){
  const colors=['#ff8a80','#ffd180','#ffff8d','#b9f6ca','#80d8ff'];
  ellipse(c,-aim*seg*6,-16+seg*2,4-seg*.4,4-seg*.4,colors[seg],0,1.2);
 }
 // Tórax y cabeza
 ellipse(c,0,-22,8,8,'#455a64',0,1.8);
 eye(c,aim*3,-24,4.2,aim,{hurt,glow:GOLD});
 if(active)stroke(c,GOLD,2,()=>{c.moveTo(aim*4,-18);c.lineTo(aim*10,-12);});
}

// ─ Araña de cuarzo (arana): acechadora ágil de patas facetadas
function drawQuartzSpider(c,s){
 const {time,step,active,hurt,aim}=s;
 // 8 patas de selenita
 for(const side of [-1,1]){
  for(let i=0;i<4;i++){
   const ry=-10-i*3,legStep=step*side*(i%2?-1:1)*4;
   stroke(c,'#37474f',2.2,()=>{
    c.moveTo(side*6,ry);c.lineTo(side*16+legStep,ry-8);c.lineTo(side*22+legStep,ry+2);
   });
  }
 }
 // Abdomen de selenita brillante
 fill(c,gradient(c,-12,-26,24,20,'#e0f7fa','#80deea','#00838f'),()=>c.ellipse(0,-13,12,10,0,0,TAU),2);
 stroke(c,'#ffffff',1.2,()=>{c.moveTo(-6,-16);c.lineTo(6,-10);c.moveTo(-6,-10);c.lineTo(6,-16);});
 // Cefalotórax y ojos múltiples
 fill(c,'#263238',()=>c.ellipse(0,-25,7,6,0,0,TAU),1.6);
 for(const ex of [-4,-1,2,5]){
  ellipse(c,ex,-25,1.4,1.4,active?EMERALD:GOLD,0,0);
 }
}

// ─ Murciélago aurora (murcielago): planeador de caverna con alas de seda verde y violeta
function drawAuroraBat(c,s){
 const {time,active,hurt,aim}=s;
 const flap=Math.sin(time*.22)*11;
 for(const side of [-1,1]){
  c.save();c.translate(side*3,-18);c.rotate(side*(.2+flap*.035));
  fill(c,gradient(c,0,0,side*30,-14,'#69f0ae','#3f51b5','#1a237e'),()=>{
   c.moveTo(0,0);c.lineTo(side*28,-14);c.quadraticCurveTo(side*22,5,side*16,8);c.quadraticCurveTo(side*9,4,0,0);
  },1.8);
  stroke(c,GOLD,1.2,()=>{c.moveTo(0,0);c.lineTo(side*22,-10);});
  ellipse(c,side*28,-14,2.5,2.5,AQUA,0,0);
  c.restore();
 }
 fill(c,gradient(c,-8,-28,16,22,'#9fa8da','#3949ab','#1a237e'),()=>c.ellipse(0,-14,8,11,0,0,TAU),2);
 for(const side of [-1,1]){
  fill(c,'#283593',()=>{c.moveTo(side*2,-22);c.lineTo(side*7,-37);c.lineTo(side*9,-21);},1.4);
 }
 eye(c,-3,-14,3.2,aim,{hurt,glow:GOLD});
 eye(c,3,-14,3.2,aim,{hurt,glow:GOLD});
}

// ─ Flor de prisma (planta): flor centinela que rota y dispara semillas de luz
function drawPrismFlower(c,s){
 const {time,active,hurt,aim}=s;
 const spin=time*.06;
 // Tallo de cristal verde
 stroke(c,'#2e7d32',3,()=>{c.moveTo(0,0);c.quadraticCurveTo(aim*6,-12,0,-24);});
 // Hojas laterales de cuarzo
 for(const side of [-1,1]){
  fill(c,'#81c784',()=>{
   c.moveTo(side*2,-10);c.quadraticCurveTo(side*16,-18,side*12,-8);c.closePath();
  },1.4);
 }
 // Pétalos de prisma rotatorios (5 pétalos)
 for(let p=0;p<5;p++){
  const a=p*TAU/5+spin;
  const px=Math.cos(a)*14,py=-24+Math.sin(a)*10;
  fill(c,['#f48fb1','#ce93d8','#90caf9','#80cbc4','#ffe082'][p],()=>{
   c.ellipse(px,py,6,4,a,0,TAU);
  },1.2);
 }
 // Núcleo dorado centellante
 fill(c,GOLD,()=>c.ellipse(0,-24,6,6,0,0,TAU),1.6);
 eye(c,aim*2,-24,3.2,aim,{hurt,glow:'#ffffff'});
 if(active)ellipse(c,aim*8,-24,3,3,'#ffffff',0,0);
}

const DRAW_MAP={
 cangrejo:drawCrystalBeetle,
 libelula:drawPrismDragonfly,
 arana:drawQuartzSpider,
 murcielago:drawAuroraBat,
 planta:drawPrismFlower
};

export function drawCuernoCreature(c,e,cam,t,reduced=false){
 if(e.roomId!=='w1-cuerno'||!e.roomPersona?.cuernoEncounter||e.boss||e.miniBoss)return false;
 const drawFn=DRAW_MAP[e.kind];
 if(!drawFn)return false;
 const a=e._campaign||{},time=reduced?0:t,phase=time*.19+(e.spawnIndex||0),run=Math.abs(e.vx||0)>.4;
 const active=(a.active||0)>0,hurt=e.invuln>0||e.stun>5;
 const step=run?Math.sin(phase):0,aim=a.aim||Math.sign(e.vx)||1;
 const flying=e.campaignRole==='flyer'||e.campaignRole==='shooter';
 const height=Math.max(50,Math.min(96,e.h||56)),scale=height/56;

 c.save();
 c.translate(e.x+e.w/2-cam.x,e.y+e.h-cam.y);
 c.scale(scale*aim,scale);
 c.globalAlpha=e.dying?Math.max(0,Math.min(1,e.dying/28)):1;
 c.lineJoin='round';c.lineCap='round';

 if(flying)c.translate(0,reduced?0:Math.sin(time*.1)*3);
 else if(run)c.translate(0,-Math.abs(step)*2);

 if((a.wind||0)>0){c.translate(-aim*2,2);c.scale(1.05,.95);}
 else if(active)c.rotate(aim*.08);
 else if(hurt)c.rotate(-aim*.14);

 drawFn(c,{time,step,active,hurt,aim});

 c.restore();
 return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRISMAS SAGRADOS I, II Y III (Estaciones del sello)
// ─────────────────────────────────────────────────────────────────────────────

const PRISM_TITLES=['PRISMA I · CUARZO DE LA AURORA','PRISMA II · AMATISTA DEL ECO','PRISMA III · ESMERALDA CELESTIAL'];
const PRISM_COLORS=['#ffd54f','#ba68c8','#4db6ac'];

export function drawCuernoPrism(ctx,s,cam,t=0,reduced=false){
 const x=s.x-cam.x,y=s.y-cam.y,done=!!s.done,order=s.order||0;
 const time=reduced?0:t;
 const float=reduced?0:Math.sin(time*0.06+order)*4;
 const col=PRISM_COLORS[order%PRISM_COLORS.length];

 ctx.save();
 ctx.lineJoin='round';ctx.lineCap='round';

 // 1. Pedestal de roca antigua con musgo de aurora
 fill(ctx,gradient(ctx,x-34,y-24,68,24,'#4e6b5a','#2d4438','#13201a'),()=>{
  ctx.moveTo(x-32,y);ctx.lineTo(x-24,y-24);ctx.lineTo(x+24,y-24);ctx.lineTo(x+32,y);
 },2);

 // Runas talladas en el pedestal
 ctx.strokeStyle=done?col:'rgba(160,200,180,0.5)';ctx.lineWidth=1.2;
 for(let k=-16;k<=16;k+=16){
  ctx.beginPath();
  ctx.moveTo(x+k-4,y-14);ctx.lineTo(x+k,y-8);ctx.lineTo(x+k+4,y-14);
  ctx.stroke();
 }

 // 2. Obelisco flotante de cristal tallado facetado
 const py=y-74+float;
 const h=done?col:['#e1bee7','#b2dfdb','#fff9c4'][order];

 // Cristal facetado exterior
 fill(ctx,gradient(ctx,x-24,py-40,48,70,'#ffffff',h,'#37474f'),()=>{
  ctx.moveTo(x,py-42);ctx.lineTo(x+22,py-10);ctx.lineTo(x+14,py+26);ctx.lineTo(x-14,py+26);ctx.lineTo(x-22,py-10);
 },2.2);

 // Facetas y líneas de refracción interiores
 ctx.strokeStyle='#ffffff';ctx.lineWidth=1.3;
 ctx.beginPath();
 ctx.moveTo(x,py-42);ctx.lineTo(x-6,py+2);ctx.lineTo(x+14,py+26);
 ctx.moveTo(x-22,py-10);ctx.lineTo(x-6,py+2);ctx.lineTo(x+22,py-10);
 ctx.stroke();

 // Gema interior giratoria
 if(done){
  const spin=time*0.08;
  const gx=x+Math.cos(spin)*6,gy=py+Math.sin(spin)*4;
  ellipse(ctx,gx,gy,5,7,col,spin,1);
  ellipse(ctx,gx,gy,2,2,'#ffffff',0,0);
 }

 // 3. Haces de luz refractada en abanico arcoíris (si está alineado)
 if(done&&!reduced){
  const rainbow=['#ff8a80','#ffd180','#ffff8d','#b9f6ca','#80d8ff','#ea80fc'];
  for(let i=0;i<6;i++){
   const ang=-Math.PI*0.45+(i*Math.PI*0.18)+Math.sin(time*0.05+i)*0.08;
   const blen=160+Math.sin(time*0.08+i)*25;
   const bg=ctx.createLinearGradient(x,py,x+Math.cos(ang)*blen,py+Math.sin(ang)*blen);
   bg.addColorStop(0,'rgba(255,255,255,0.85)');
   bg.addColorStop(0.4,rainbow[i]+'aa');
   bg.addColorStop(1,'rgba(255,255,255,0)');
   ctx.strokeStyle=bg;ctx.lineWidth=2.5;
   ctx.beginPath();ctx.moveTo(x,py);ctx.lineTo(x+Math.cos(ang)*blen,py+Math.sin(ang)*blen);ctx.stroke();
  }
 }

 // 4. Cartel identificador
 const tagY=y-145;
 ctx.fillStyle=done?col:'#2d4438';
 ctx.font='bold 11px monospace';ctx.textAlign='center';
 ctx.fillText((PRISM_TITLES[order%PRISM_TITLES.length])+(done?' ✓':''),x,tagY);
 if(!done){
  ctx.fillStyle='rgba(100,160,130,0.8)';ctx.font='10px monospace';
  ctx.fillText('ACTIVA EN ORDEN I → II → III',x,tagY+13);
 }

 ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// ESPEJO DEL ALBA (DAWN MIRROR)
// ─────────────────────────────────────────────────────────────────────────────
export function drawCuernoDawnMirror(ctx,mirror,cam,t=0,reduced=false,restored=false){
 const x=mirror.x-cam.x,y=mirror.y-cam.y;
 const time=reduced?0:t;
 const pulse=reduced?0:Math.sin(time*0.08)*3;

 ctx.save();
 ctx.lineJoin='round';ctx.lineCap='round';

 // 1. Pedestal de piedra viva del alba
 fill(ctx,gradient(ctx,x-36,y-26,72,26,'#455a4e','#26382e','#111c16'),()=>{
  ctx.moveTo(x-34,y);ctx.lineTo(x-24,y-26);ctx.lineTo(x+24,y-26);ctx.lineTo(x+34,y);
 },2.2);

 // 2. Marco botánico de ramas y cuarzo que sostienen el espejo
 ctx.strokeStyle='#5d7a69';ctx.lineWidth=5;
 ctx.beginPath();ctx.moveTo(x-24,y-24);ctx.quadraticCurveTo(x-8,y-50,x,y-96);ctx.stroke();
 ctx.beginPath();ctx.moveTo(x+24,y-24);ctx.quadraticCurveTo(x+8,y-50,x,y-96);ctx.stroke();

 // Flores de aurora en el marco
 for(const sx of [-1,1]){
  ellipse(ctx,x+sx*18,y-44,4,4,restored?GOLD:'#a5d6a7',0,1);
 }

 // 3. Óvalo del Espejo del Alba
 const my=y-116+pulse*0.4;
 const fillCol=restored?'#fff9d6':'#cfd8dc';
 fill(ctx,gradient(ctx,x-34,my-46,68,92,fillCol,restored?'#ffe082':'#90a4ae','#37474f'),()=>{
  ctx.ellipse(x,my,34,46,0.18,0,TAU);
 },3);

 // Reflejos facetados en el cristal
 ctx.strokeStyle='#ffffff';ctx.lineWidth=2;
 ctx.beginPath();
 ctx.moveTo(x-14,my-28);ctx.lineTo(x+14,my-4);
 ctx.moveTo(x-8,my+4);ctx.lineTo(x+18,my+26);
 ctx.stroke();

 // Haz de luz solar dorada cuando está restaurado
 if(restored&&!reduced){
  const beam=ctx.createLinearGradient(x,my,x+300,my-80);
  beam.addColorStop(0,'rgba(255,245,180,0.9)');
  beam.addColorStop(0.5,'rgba(255,224,130,0.45)');
  beam.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=beam;
  ctx.beginPath();
  ctx.moveTo(x,my-14);ctx.lineTo(x+300,my-100);ctx.lineTo(x+300,my-60);ctx.lineTo(x,my+14);
  ctx.closePath();ctx.fill();

  // Partículas solares danzando en el haz
  ctx.fillStyle='#ffffff';
  for(let i=0;i<5;i++){
   const px=x+40+((time*1.2+i*55)%250);
   const py=my-20-((time*0.4+i*20)%40);
   ctx.beginPath();ctx.arc(px,py,1.8,0,TAU);ctx.fill();
  }
 }

 // Cartel
 const tagY=y-178;
 ctx.fillStyle=restored?GOLD:'#37474f';
 ctx.font='bold 11px monospace';ctx.textAlign='center';
 ctx.fillText(restored?'ESPEJO DEL ALBA · RESTAURADO ✓':'ESPEJO DEL ALBA (PULSA J)',x,tagY);

 ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// ATMÓSFERA DEL BOSQUE PRISMA: HACES DE LUZ Y AURORAS
// ─────────────────────────────────────────────────────────────────────────────
export function drawCuernoAtmosphere(ctx,g,cam,t=0,reduced=false){
 if(!ctx)return;
 ctx.save();

 const vw=g.viewW||1280;
 const time=reduced?0:t;

 // 1. Haces de luz crepuscular en abanico (God rays)
 const rayColors=['rgba(255,240,170,0.07)','rgba(178,255,220,0.06)','rgba(225,190,255,0.07)'];
 for(let r=0;r<3;r++){
  const rx=(r*420)-(cam.x*0.2)%420;
  const rayGrad=ctx.createLinearGradient(rx,0,rx+160,500);
  rayGrad.addColorStop(0,rayColors[r]);
  rayGrad.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=rayGrad;
  ctx.beginPath();
  ctx.moveTo(rx,0);ctx.lineTo(rx+80,0);ctx.lineTo(rx+240,540);ctx.lineTo(rx+100,540);
  ctx.closePath();ctx.fill();
 }

 // 2. Auroras boreales superiores en el dosel
 const wav1=reduced?0:Math.sin(time*0.02)*30;
 const wav2=reduced?0:Math.cos(time*0.024)*35;
 const aur=ctx.createLinearGradient(0,30,0,240);
 aur.addColorStop(0,'rgba(105,240,174,0)');
 aur.addColorStop(0.5,'rgba(128,222,234,0.14)');
 aur.addColorStop(0.8,'rgba(206,147,216,0.16)');
 aur.addColorStop(1,'rgba(255,255,255,0)');
 ctx.fillStyle=aur;
 ctx.beginPath();
 ctx.moveTo(-40,140+wav1);
 ctx.bezierCurveTo(vw*.35,80+wav2,vw*.65,200+wav1,vw+40,120+wav2);
 ctx.lineTo(vw+40,0);ctx.lineTo(-40,0);ctx.closePath();ctx.fill();

 ctx.restore();
}

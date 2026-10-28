// Jardín Lunar de Michi: fauna astral, medusas sagradas y altar del sueño.
// Arte vectorial en Canvas de alta calidad (mismo nivel que V606/V607/V608).
// Solo presentación: lee el estado real sin tocar física ni daño.
const TAU=Math.PI*2,INK='#1a0d2e',PEARL='#f5e6ff',MOON='#fff4c8',LILAC='#c9a8f7',TEAL='#7af0e0';

function fill(c,color,draw,width=1.8){c.beginPath();draw();c.closePath();c.fillStyle=color;c.fill();if(width){c.strokeStyle=INK;c.lineWidth=width;c.stroke();}}
function stroke(c,color,width,draw){c.beginPath();draw();c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function ellipse(c,x,y,rx,ry,color,rotation=0,width=1.6){fill(c,color,()=>c.ellipse(x,y,rx,ry,rotation,0,TAU),width);}
function gradient(c,x,y,w,h,a,b,d){const g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,a);if(d)g.addColorStop(.5,b);g.addColorStop(1,d||b);return g;}
function roundRect(c,x,y,w,h,r=4){if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);}

function eye(c,x,y,r,aim=1,{hurt=false,glow=MOON}={}){
 if(hurt){stroke(c,INK,2,()=>{c.moveTo(x-r,y);c.lineTo(x+r,y);});return;}
 ellipse(c,x,y,r,r*1.05,'#fffcef',0,1.4);
 ellipse(c,x+aim*r*.22,y,r*.52,r*.68,glow,0,0);
 ellipse(c,x+aim*r*.26,y,r*.25,r*.44,'#100c1c',0,0);
 ellipse(c,x-r*.18,y-r*.3,r*.22,r*.22,'#ffffff',0,0);
}

// ─ Medusa lunar (medusa): medusa felina con campana nacarada y tentáculos bioluminiscentes
function drawLunarJellyFoe(c,s){
 const {time,active,hurt,aim}=s;
 const pulse=Math.sin(time*.08)*0.07,float=Math.sin(time*.05)*3;
 const bell=1+pulse;
 // Tentáculos serpenteantes (5 filamentos)
 for(let k=-2;k<=2;k++){
  const wave=Math.sin(time*.1+k*1.5)*6,reach=32+(k%2?4:0)+(active?5:0);
  stroke(c,k===0?MOON:PEARL,k===0?4:2.8,()=>{
   c.moveTo(k*11*bell,float);
   c.bezierCurveTo(k*10*bell+wave*.5,float+10,k*6+wave,-k*2+reach*.6,k*5+wave*1.2,reach+float);
  });
  ellipse(c,k*5+wave*1.2,reach+float,2,2.5,active?MOON:PEARL,0,0);
 }
 // Orejas de gato integradas en la campana
 for(const side of [-1,1]){
  const flick=Math.sin(time*.12+side)*.5;
  fill(c,LILAC,()=>{
   c.moveTo(side*11,float-22);c.quadraticCurveTo(side*22,float-44,side*27,float-50+flick);
   c.quadraticCurveTo(side*35,float-28,side*26,float-12);c.closePath();
  },1.6);
  // triángulo interior rosado
  fill(c,'#ffbde0',()=>{
   c.moveTo(side*17,float-28);c.lineTo(side*25,float-43+flick);c.lineTo(side*25,float-22);c.closePath();
  },0);
 }
 // Campana nacarada
 const half=32*bell;
 c.globalAlpha=hurt?.7:.92;
 fill(c,gradient(c,-half,float-40,half*2,40,PEARL,LILAC,'#a07ec8'),()=>{
  c.moveTo(-half,float);
  c.bezierCurveTo(-half-3,float-18,-20,float-40,0,float-41);
  c.bezierCurveTo(20,float-40,half+3,float-18,half,float);
  c.quadraticCurveTo(0,float+5,-half,float);
 },2.2);
 c.globalAlpha=.3;ellipse(c,-9,float-24,11,4,'#ffffff',-.3,0);c.globalAlpha=1;
 // Mini cuernito lunar
 fill(c,MOON,()=>{c.moveTo(-4,float-36);c.lineTo(0,float-52);c.lineTo(4,float-36);},1.4);
 // Ojos somnolientas/despiertas
 const blink=active&&((time+13)%180<6);
 for(const side of[-1,1]){
  const ex=side*13,ey=float-16;
  if(!active||blink){stroke(c,INK,2,()=>{c.moveTo(ex-4,ey);c.quadraticCurveTo(ex,ey+3,ex+4,ey);});}
  else{eye(c,ex,ey,3.8,aim,{hurt,glow:TEAL});}
 }
 if(active)ellipse(c,0,float-8,6,3,TEAL,.0,0);
}

// ─ Phosquito astral (phosquito): insecto brillante con alas prismáticas
function drawAstralGnat(c,s){
 const {time,active,hurt,aim}=s;
 const buzz=Math.sin(time*.4)*7;
 // Cuatro alas prismáticas translúcidas
 for(const side of[-1,1]){
  c.save();c.translate(side*4,-20);c.rotate(side*.35+buzz*.04*side);
  fill(c,'rgba(200,180,255,0.55)',()=>c.ellipse(side*14,-7,15,5,side*-.25,0,TAU),1.2);
  stroke(c,LILAC,1,()=>{c.moveTo(0,0);c.lineTo(side*20,-9);});
  c.restore();
 }
 // Abdomen perlado con banda iridiscente
 fill(c,gradient(c,-11,-24,22,22,PEARL,LILAC,'#7c5faa'),()=>c.ellipse(0,-12,10,12,0,0,TAU),2.2);
 stroke(c,MOON,1.8,()=>c.ellipse(0,-12,13,5,buzz*.02,0,TAU));
 // Cabeza y antenas
 ellipse(c,0,-26,7,7,'#b096d8',0,1.8);
 for(const side of[-1,1]){
  stroke(c,'#c8a0f0',1.4,()=>{c.moveTo(side*4,-29);c.quadraticCurveTo(side*9,-38,side*7,-42);});
  ellipse(c,side*7,-42,2,2,MOON,0,0);
 }
 eye(c,aim*2,-26,3.8,aim,{hurt,glow:'#d0ffee'});
 // Aguijón astral inferior
 stroke(c,'#4d3870',2.2,()=>{c.moveTo(0,-2);c.lineTo(-aim*3,7);});
 stroke(c,LILAC,active?2.8:1.6,()=>{c.moveTo(-aim*3,7);c.lineTo(-aim*7,13);});
 if(active)ellipse(c,-aim*7,13,2.5,2.5,TEAL,0,0);
}

// ─ UFO cristalino (ufo): platillo giratorio con prismas de luna
function drawCrystalSaucer(c,s){
 const {time,active,hurt,aim}=s;
 const spin=time*.07,hover=Math.sin(time*.06)*2;
 // Cúpula superior
 fill(c,gradient(c,-16,-36+hover,32,20,PEARL,LILAC,'#7a5fa0'),()=>{
  c.ellipse(0,-28+hover,16,11,0,0,TAU);
 },1.8);
 // Prismas giratorios en la cúpula
 for(let p=0;p<3;p++){
  const ang=p*TAU/3+spin,px=Math.cos(ang)*9,py=-28+hover+Math.sin(ang)*4;
  ellipse(c,px,py,3,5,['#c8f0ff','#ffd6f8','#ffe8a0'][p],ang,0);
 }
 // Cuerpo del platillo (lenticular)
 fill(c,gradient(c,-28,-20+hover,56,16,'#8a6cb8','#4a2e6e','#200e38'),()=>{
  c.ellipse(0,-12+hover,28,8,0,0,TAU);
 },2.2);
 stroke(c,LILAC,2,()=>c.ellipse(0,-12+hover,28,8,0,0,TAU));
 // Anillos de energía giratorios
 stroke(c,active?MOON:LILAC+'88',1.4,()=>c.ellipse(0,-12+hover,28,4,spin,0,TAU));
 // Luces de emisión inferiores (4 orbes en anillo)
 for(let i=0;i<4;i++){
  const a=i*TAU/4+spin*.5,lx=Math.cos(a)*20,ly=-6+hover+Math.sin(a)*3;
  ellipse(c,lx,ly,3,3,active?TEAL:MOON,0,0);
 }
 // Haz tractor inferior
 if(active){
  const hg=c.createLinearGradient(0,-4+hover,0,18+hover);
  hg.addColorStop(0,'rgba(122,240,224,0.6)');hg.addColorStop(1,'rgba(122,240,224,0)');
  c.fillStyle=hg;c.beginPath();c.moveTo(-10,-4+hover);c.lineTo(10,-4+hover);c.lineTo(20,18+hover);c.lineTo(-20,18+hover);c.closePath();c.fill();
 }
}

// ─ Murciélago de nácaro (murcielago): saltador nocturno con alas tornasoladas
function drawNacarBat(c,s){
 const {time,active,hurt,aim}=s;
 const flap=Math.sin(time*.22)*10;
 // Alas de membrana iridiscente
 for(const side of[-1,1]){
  c.save();c.translate(side*3,-18);c.rotate(side*(.2+flap*.035));
  fill(c,gradient(c,0,0,side*30,-14,LILAC,'#4a2e6e','#1a0c2a'),()=>{
   c.moveTo(0,0);c.lineTo(side*28,-14);c.quadraticCurveTo(side*22,5,side*16,8);c.quadraticCurveTo(side*9,4,0,0);
  },1.8);
  stroke(c,PEARL,1.4,()=>{c.moveTo(0,0);c.lineTo(side*22,-10);c.moveTo(0,0);c.lineTo(side*14,4);});
  ellipse(c,side*28,-14,2,2,MOON,0,0);
  c.restore();
 }
 // Cuerpo peludo lavanda
 fill(c,gradient(c,-9,-28,18,24,'#c0a0e0','#5a3e80','#26143e'),()=>c.ellipse(0,-14,8,11,0,0,TAU),2);
 // Orejas puntiagudas con joya lunar interior
 for(const side of[-1,1]){
  fill(c,'#7a5a9e',()=>{c.moveTo(side*2,-22);c.lineTo(side*8,-38);c.lineTo(side*10,-21);},1.4);
  ellipse(c,side*6,-31,2,2,MOON,0,0);
 }
 eye(c,-3,-14,3.2,aim,{hurt,glow:TEAL});
 eye(c,3,-14,3.2,aim,{hurt,glow:TEAL});
 if(active)stroke(c,MOON,2,()=>{c.moveTo(-3,-7);c.lineTo(0,-3);c.lineTo(3,-7);});
}

// ─ Araña del velo (arana): depredadora ágil que se descuelga de hilos lunares
function drawVeilSpider(c,s){
 const {time,step,active,hurt,aim}=s;
 const dangle=Math.sin(time*.06)*3;
 // Hilo de seda lunar (cuelga de arriba)
 stroke(c,PEARL,1,()=>{c.moveTo(0,-42+dangle);c.lineTo(0,-28+dangle);});
 // Ocho patas articuladas (4 a cada lado)
 for(const side of[-1,1]){
  for(let i=0;i<4;i++){
   const rootY=-12-i*3,legSwing=step*side*(i%2?-1:1)*4;
   stroke(c,'#4a2e6e',2.4,()=>{
    c.moveTo(side*7,rootY);c.lineTo(side*16+legSwing,rootY-8+legSwing*.5);c.lineTo(side*22+legSwing,rootY+2);
   });
  }
 }
 // Abdomen globoso (tornasolado)
 fill(c,gradient(c,-14,-28+dangle,28,22,'#9a78c8','#4a2860','#1e0a28'),()=>c.ellipse(0,-14+dangle,13,11,0,0,TAU),2.2);
 // Patrón de luna en el abdomen
 stroke(c,PEARL,1.4,()=>{c.arc(0,-14+dangle,7,0,TAU);});
 // Cefalotórax pequeño
 fill(c,'#2e1644',()=>c.ellipse(0,-27+dangle,8,7,0,0,TAU),1.8);
 // 8 ojos en dos filas
 for(const ex of[-5,-2,2,5]){
  ellipse(c,ex,-27+dangle,1.5,1.5,active?TEAL:MOON,0,0);
 }
 // Quelíceros (mandíbulas)
 for(const side of[-1,1]){
  stroke(c,'#c8a0f0',1.6,()=>{c.moveTo(side*3,-30+dangle);c.lineTo(side*6,-34+dangle);});
  if(hurt)ellipse(c,side*6,-34+dangle,2,2,'#ff6060',0,0);
 }
}

const DRAW_MAP={
 medusa:drawLunarJellyFoe,
 phosquito:drawAstralGnat,
 ufo:drawCrystalSaucer,
 murcielago:drawNacarBat,
 arana:drawVeilSpider
};

export function drawCatCreature(c,e,cam,t,reduced=false){
 if(e.roomId!=='w1-cat'||!e.roomPersona?.catEncounter||e.boss||e.miniBoss)return false;
 const drawFn=DRAW_MAP[e.kind];
 if(!drawFn)return false;
 const a=e._campaign||{},time=reduced?0:t,phase=time*.19+(e.spawnIndex||0),run=Math.abs(e.vx||0)>.4;
 const active=(a.active||0)>0,hurt=e.invuln>0||e.stun>5;
 const step=run?Math.sin(phase):0,aim=a.aim||Math.sign(e.vx)||1;
 const flying=e.campaignRole==='flyer'||e.campaignRole==='gunner';
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
// MEDUSAS SAGRADAS DEL JARDÍN LUNAR (estaciones del sello)
// ─────────────────────────────────────────────────────────────────────────────

const JELLY_PALS=Object.freeze([
 {bell:'#c8aafa',rim:'#f5d9ff',ear:'#ffbfdc',ink:'#47315f',glow:'#ffeead'},
 {bell:'#a5cbff',rim:'#e3f5ff',ear:'#f7bddd',ink:'#314e71',glow:'#ffe6a0'},
 {bell:'#eeabe7',rim:'#fff0fc',ear:'#ffcbdb',ink:'#673759',glow:'#ffe7af'},
 {bell:'#baa5f4',rim:'#e9e0ff',ear:'#ffc3e3',ink:'#4a3c73',glow:'#fff0c2'},
 {bell:'#acdce2',rim:'#eaffed',ear:'#ffbcd8',ink:'#355c68',glow:'#ffe9b5'}
]);

const JELLY_NAMES=['MEDUSA I · FAROLUNA','MEDUSA II · LINTERNA','MEDUSA III · VELO','MEDUSA IV · ESPEJO','MEDUSA V · CORAZÓN'];

export function drawCatMoonJelly(ctx,s,cam,t=0,reduced=false){
 const id=Math.max(0,Math.trunc(Number(s.id)||0)),done=!!s.done;
 const pal=JELLY_PALS[id%JELLY_PALS.length];
 const time=reduced?0:(Number.isFinite(t)?t:0);
 const pulse=reduced?0:Math.sin(time*.075+id*1.9);
 const bell=1+pulse*.07;
 const float=reduced?0:Math.sin(time*.048+id*1.35)*5;
 const x=(Number(s.x)||0)-cam.x,y=(Number(s.y)||0)-cam.y+float;
 const ink=pal.ink;

 ctx.save();

 // Tentáculos (5 filamentos)
 for(let k=-2;k<=2;k++){
  const rootX=x+k*12*bell;
  const wave=reduced?0:Math.sin(time*.095+k*1.4+id)*(done?9:5);
  const reach=40+(k%2===0?6:0)+(done?4:0);
  ctx.lineWidth=k===0?5:3.7;ctx.strokeStyle=k===0?pal.glow:pal.rim;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(rootX,y-2);
  ctx.bezierCurveTo(rootX+wave*.65,y+14,rootX+k*4-wave,y+reach*.7,rootX+wave*1.3+k*2,y+reach);
  ctx.stroke();
  ctx.fillStyle=done?pal.glow:pal.ear;
  ctx.beginPath();ctx.arc(rootX+wave*1.3+k*2,y+reach,2.5,0,TAU);ctx.fill();
 }

 // Orejas felinas
 for(const side of[-1,1]){
  const flick=reduced?0:Math.sin(time*.11+id+side)*2.5;
  ctx.beginPath();ctx.moveTo(x+side*12,y-27);
  ctx.quadraticCurveTo(x+side*24,y-52,x+side*29,y-58+flick);
  ctx.quadraticCurveTo(x+side*38,y-32,x+side*30,y-15);
  ctx.closePath();ctx.fillStyle=pal.bell;ctx.fill();
  ctx.strokeStyle=ink;ctx.lineWidth=2;ctx.stroke();
  ctx.beginPath();ctx.moveTo(x+side*20,y-33);ctx.lineTo(x+side*28,y-49+flick);ctx.lineTo(x+side*28,y-24);
  ctx.closePath();ctx.fillStyle=pal.ear;ctx.fill();
 }

 // Campana principal
 const half=38*bell;
 ctx.globalAlpha=done?.98:.84;
 ctx.beginPath();ctx.moveTo(x-half,y);
 ctx.bezierCurveTo(x-half-4,y-22,x-22,y-46,x,y-47);
 ctx.bezierCurveTo(x+22,y-46,x+half+4,y-22,x+half,y);
 ctx.quadraticCurveTo(x,y+6+pulse*1.7,x-half,y);
 ctx.closePath();ctx.fillStyle=pal.bell;ctx.fill();
 ctx.strokeStyle=done?pal.glow:pal.rim;ctx.lineWidth=2.8;ctx.stroke();
 ctx.globalAlpha=.3;
 ctx.beginPath();ctx.ellipse(x-10,y-28,12,4.5,-.3,0,TAU);ctx.fillStyle='#fff';ctx.fill();
 ctx.globalAlpha=1;

 // Cuerno lunar central
 ctx.beginPath();ctx.moveTo(x-5,y-42);ctx.lineTo(x,y-63);ctx.lineTo(x+5,y-42);
 ctx.closePath();ctx.fillStyle=pal.glow;ctx.fill();
 ctx.strokeStyle=ink;ctx.lineWidth=1.6;ctx.stroke();

 // Ojos
 const blinking=!reduced&&done&&((time+id*39)%190<7);
 for(const side of[-1,1]){
  const eyeX=x+side*14,eyeY=y-19;
  if(!done||blinking){
   ctx.strokeStyle=ink;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(eyeX-5,eyeY);
   ctx.quadraticCurveTo(eyeX,eyeY+(done?2:4),eyeX+5,eyeY);ctx.stroke();
  }else{
   ctx.fillStyle=pal.glow;ctx.beginPath();ctx.arc(eyeX,eyeY,4.5,0,TAU);ctx.fill();
   ctx.fillStyle='#1a0c2e';ctx.beginPath();ctx.arc(eyeX,eyeY,2.2,0,TAU);ctx.fill();
   ctx.fillStyle='rgba(255,255,255,.75)';ctx.beginPath();ctx.arc(eyeX-1.5,eyeY-1.5,1.2,0,TAU);ctx.fill();
  }
 }

 // Halo de aura cuando está despierta
 if(done&&!reduced){
  const aura=ctx.createRadialGradient(x,y-28,8,x,y-28,56);
  aura.addColorStop(0,'rgba(200,170,250,0.18)');aura.addColorStop(1,'rgba(200,170,250,0)');
  ctx.fillStyle=aura;ctx.beginPath();ctx.arc(x,y-28,56,0,TAU);ctx.fill();
 }

 // Cartel identificador
 const tagY=y-80-(done?12:0);
 ctx.fillStyle=done?pal.glow:ink+'cc';
 ctx.font=`bold 11px monospace`;ctx.textAlign='center';
 ctx.fillText((JELLY_NAMES[id%JELLY_NAMES.length])+(done?' ✓':''),x,tagY);
 if(!done){
  ctx.fillStyle='rgba(220,200,255,0.7)';ctx.font='10px monospace';
  ctx.fillText('SALTA HACIA ELLA EN EL AIRE',x,tagY+14);
 }

 ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// PUENTE DE CRISTAL LUNAR (activado al despertar la medusa sagrada)
// ─────────────────────────────────────────────────────────────────────────────
export function drawCatCrystalBridge(ctx,s,cam,t=0,reduced=false){
 const x=(Number(s.x)||0)-cam.x-78,y=(Number(s.y)||0)-cam.y+26;
 const w=156,h=16;
 ctx.save();

 // Cristal lunar facetado translúcido
 const grad=ctx.createLinearGradient(x,y,x+w,y+h);
 grad.addColorStop(0,'rgba(180,140,255,0.78)');
 grad.addColorStop(0.5,'rgba(235,215,255,0.94)');
 grad.addColorStop(1,'rgba(140,210,255,0.78)');
 ctx.fillStyle=grad;
 roundRect(ctx,x,y,w,h,6);
 ctx.fill();

 ctx.strokeStyle='#ffffff';ctx.lineWidth=1.5;
 roundRect(ctx,x,y,w,h,6);ctx.stroke();

 // Runas de selenita grabadas
 ctx.strokeStyle='rgba(255,245,190,0.85)';ctx.lineWidth=1.2;
 for(let i=24;i<w-20;i+=32){
  const rx=x+i,ry=y+8+(reduced?0:Math.sin(t*0.08+i)*1.5);
  ctx.beginPath();ctx.moveTo(rx-5,ry);ctx.lineTo(rx,ry-4);ctx.lineTo(rx+5,ry);ctx.lineTo(rx,ry+4);ctx.closePath();
  ctx.stroke();
 }

 // Gemas en los extremos del puente
 ctx.fillStyle='#fff4a8';
 for(const gx of [x+8,x+w-8]){
  ctx.beginPath();ctx.arc(gx,y+8,3.5,0,TAU);ctx.fill();
  ctx.strokeStyle='#4a2868';ctx.lineWidth=1;ctx.stroke();
 }

 // Partículas ascendentes de polvo estelar
 if(!reduced){
  ctx.fillStyle='rgba(255,235,170,0.65)';
  for(let p=0;p<4;p++){
   const px=x+20+((t*0.4+p*37)%(w-40));
   const py=y-4-((t*0.6+p*23)%28);
   ctx.beginPath();ctx.arc(px,py,1.5,0,TAU);ctx.fill();
  }
 }

 ctx.restore();
}

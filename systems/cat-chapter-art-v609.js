// Jardín Lunar de Michi: fauna astral, medusas sagradas, altar del sueño,
// eclipse dinámico, nebulosas, colonias de medusas fantasma, corales bioluminiscentes,
// vórtices abisales en pozos, decoraciones de plataformas y fitoplancton cósmico.
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

// ─ Medusa lunar (medusa): medusa cósmica con campana nacarada y tentáculos bioluminiscentes
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
 // Aletas de velo translúcido lateral y ropalios marginales
 for(const side of [-1,1]){
  const flutter=Math.sin(time*.12+side*1.2)*3;
  fill(c,'rgba(195,160,240,0.45)',()=>{
   c.moveTo(side*16*bell,float-16);
   c.bezierCurveTo(side*34*bell,float-28+flutter,side*36*bell,float-4+flutter,side*18*bell,float+4);
   c.closePath();
  },1.4);
  ellipse(c,side*30*bell,float-12+flutter,2.2,2.2,MOON,0,0);
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
 // Canales radiales luminosos
 for(let r=-1;r<=1;r++){
  stroke(c,'rgba(255,255,255,0.45)',1.2,()=>{
   c.moveTo(0,float-36);c.quadraticCurveTo(r*14,float-20,r*18*bell,float-2);
  });
 }
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

 // Aletas de velo translúcido sagrado y ropalios marginales
 for(const side of[-1,1]){
  const ripple=reduced?0:Math.sin(time*.11+id+side)*3;
  ctx.beginPath();ctx.moveTo(x+side*14,y-24);
  ctx.bezierCurveTo(x+side*38,y-44+ripple,x+side*44,y-14+ripple,x+side*22,y+2);
  ctx.closePath();ctx.fillStyle=pal.ear+'99';ctx.fill();
  ctx.strokeStyle=pal.rim;ctx.lineWidth=1.8;ctx.stroke();
  ctx.beginPath();ctx.arc(x+side*34,y-26+ripple,2.5,0,TAU);
  ctx.fillStyle=done?pal.glow:pal.ear;ctx.fill();
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

 // Cuerno lunar central y diadema de perlas
 ctx.beginPath();ctx.moveTo(x-5,y-42);ctx.lineTo(x,y-63);ctx.lineTo(x+5,y-42);
 ctx.closePath();ctx.fillStyle=pal.glow;ctx.fill();
 ctx.strokeStyle=ink;ctx.lineWidth=1.6;ctx.stroke();
 for(const side of[-1,1]){
  ctx.beginPath();ctx.arc(x+side*14,y-42,3.2,0,TAU);
  ctx.fillStyle=done?pal.glow:pal.ear;ctx.fill();
  ctx.strokeStyle=ink;ctx.lineWidth=1;ctx.stroke();
 }

 // Canales radiales sagrados
 for(let r=-2;r<=2;r++){
  ctx.beginPath();ctx.moveTo(x,y-44);
  ctx.quadraticCurveTo(x+r*11*bell,y-22,x+r*15*bell,y);
  ctx.strokeStyle=done?'rgba(255,255,255,0.45)':'rgba(255,255,255,0.2)';ctx.lineWidth=1.2;ctx.stroke();
 }

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
  // Pulso bioluminiscente a lo largo del puente
  const bPulse=Math.sin(t*0.08)*0.25+0.45;
  ctx.globalAlpha=bPulse;
  const glow=ctx.createLinearGradient(x,y+4,x+w,y+4);
  glow.addColorStop(0,'rgba(122,240,224,0)');
  glow.addColorStop(0.5,'rgba(122,240,224,0.35)');
  glow.addColorStop(1,'rgba(122,240,224,0)');
  ctx.fillStyle=glow;
  roundRect(ctx,x,y+2,w,h-2,4);ctx.fill();
  ctx.globalAlpha=1;
 }

 ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// TRAMPAS DE SEDA ASTRAL Y TELARAÑAS DEL VELO
// ─────────────────────────────────────────────────────────────────────────────
export function drawCatTrap(ctx,trap,cam,t=0,reduced=false){
 const x=trap.x-cam.x,y=trap.y-cam.y,w=trap.w||90,h=trap.h||70;
 ctx.save();

 // Voluta de niebla en la base
 const wave=reduced?0:Math.sin(t*0.06+trap.x)*4;
 const grad=ctx.createLinearGradient(x,y,x,y+h);
 grad.addColorStop(0,'rgba(210,180,255,0.05)');
 grad.addColorStop(0.7,'rgba(180,140,240,0.35)');
 grad.addColorStop(1,'rgba(140,90,210,0.65)');
 ctx.fillStyle=grad;
 ctx.beginPath();
 ctx.moveTo(x-10,y+h);
 ctx.bezierCurveTo(x+w*.3,y+wave,x+w*.7,y+wave,x+w+10,y+h);
 ctx.closePath();ctx.fill();

 // Hilos de seda lunar tensados entre las rocas
 ctx.strokeStyle='rgba(245,235,255,0.72)';
 ctx.lineWidth=1.4;
 const strands=[
  [x,y+10,x+w,y+h-10],
  [x+w,y+15,x,y+h-15],
  [x+w*.5,y,x+w*.5,y+h],
  [x+10,y+h*.5,x+w-10,y+h*.5]
 ];
 for(const [x1,y1,x2,y2] of strands){
  ctx.beginPath();ctx.moveTo(x1,y1);
  const mx=(x1+x2)/2+(reduced?0:Math.sin(t*0.1+x1)*3);
  const my=(y1+y2)/2+(reduced?0:Math.cos(t*0.1+y1)*3);
  ctx.quadraticCurveTo(mx,my,x2,y2);
  ctx.stroke();
 }

 // Anillos concéntricos de telaraña astral
 ctx.strokeStyle='rgba(220,190,255,0.55)';ctx.lineWidth=1;
 for(let r=12;r<=36;r+=12){
  ctx.beginPath();
  ctx.ellipse(x+w*.5,y+h*.5,r,r*.7,0,0,TAU);
  ctx.stroke();
 }

 // Rocío de perlas lunares atrapadas en la red
 ctx.fillStyle='#ffe7a8';
 for(let i=0;i<4;i++){
  const a=i*TAU/4+t*0.02;
  const px=x+w*.5+Math.cos(a)*22,py=y+h*.5+Math.sin(a)*15;
  ctx.beginPath();ctx.arc(px,py,2,0,TAU);ctx.fill();
 }

 ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// ATMÓSFERA CELESTIAL: ECLIPSE DINÁMICO, AURORAS ABISALES, NEBULOSAS,
// COLONIAS DE MEDUSAS FANTASMA, CORALES BIOLUMINISCENTES Y FITOPLANCTON
// ─────────────────────────────────────────────────────────────────────────────
export function drawCatAtmosphere(ctx,g,cam,t=0,reduced=false){
 if(!ctx)return;
 ctx.save();
 const vw=g.viewW||1280;
 const vh=g.viewH||720;

 // ── ECLIPSE DINÁMICO: luna oscureciendo el sol con corona pulsante ─────────
 const eclX=vw*.62,eclY=88;
 const moonR=38,sunR=36;
 // Corona solar pulsante (rayos de luz difusa alrededor del eclipse)
 if(!reduced){
  const coronaPulse=Math.sin(t*0.015)*0.12+0.32;
  // Halo exterior difuso
  const corona=ctx.createRadialGradient(eclX,eclY,moonR,eclX,eclY,moonR+65);
  corona.addColorStop(0,'rgba(255,220,140,'+coronaPulse+')');
  corona.addColorStop(0.3,'rgba(255,180,100,'+(coronaPulse*0.6)+')');
  corona.addColorStop(0.6,'rgba(200,120,255,'+(coronaPulse*0.3)+')');
  corona.addColorStop(1,'rgba(140,80,200,0)');
  ctx.fillStyle=corona;
  ctx.beginPath();ctx.arc(eclX,eclY,moonR+65,0,TAU);ctx.fill();
  // Rayos de corona asimétricos (prominencias solares)
  ctx.globalAlpha=coronaPulse*0.7;
  for(let r=0;r<8;r++){
   const ang=r*TAU/8+t*0.004;
   const rayLen=28+Math.sin(t*0.02+r*2.1)*14;
   const rw=3+Math.sin(t*0.03+r)*1.5;
   ctx.beginPath();
   ctx.moveTo(eclX+Math.cos(ang)*(moonR+4),eclY+Math.sin(ang)*(moonR+4));
   ctx.lineTo(eclX+Math.cos(ang-0.06)*(moonR+rayLen),eclY+Math.sin(ang-0.06)*(moonR+rayLen));
   ctx.lineTo(eclX+Math.cos(ang+0.06)*(moonR+rayLen),eclY+Math.sin(ang+0.06)*(moonR+rayLen));
   ctx.closePath();
   ctx.fillStyle=r%2?'rgba(255,210,120,0.35)':'rgba(220,160,255,0.3)';
   ctx.fill();
  }
  ctx.globalAlpha=1;
 }
 // Disco solar (detrás de la luna) — anillo fino visible
 ctx.beginPath();ctx.arc(eclX,eclY,sunR+3,0,TAU);
 ctx.fillStyle='rgba(255,200,100,0.18)';ctx.fill();
 // Disco lunar opaco (la luna cubre el sol)
 const moonGrad=ctx.createRadialGradient(eclX-6,eclY-6,2,eclX,eclY,moonR);
 moonGrad.addColorStop(0,'#1e1230');moonGrad.addColorStop(0.7,'#0d0618');moonGrad.addColorStop(1,'#060210');
 ctx.beginPath();ctx.arc(eclX,eclY,moonR,0,TAU);
 ctx.fillStyle=moonGrad;ctx.fill();
 // Cráteres lunares sutiles
 ctx.globalAlpha=0.12;
 ctx.fillStyle='#2a1840';
 ctx.beginPath();ctx.arc(eclX-12,eclY-8,6,0,TAU);ctx.fill();
 ctx.beginPath();ctx.arc(eclX+8,eclY+4,4.5,0,TAU);ctx.fill();
 ctx.beginPath();ctx.arc(eclX-3,eclY+12,3.5,0,TAU);ctx.fill();
 ctx.globalAlpha=1;

 // ── OSCURECIMIENTO GENERAL: velo abisal que se intensifica con el eclipse ──
 const darkPulse=reduced?0.08:0.06+Math.sin(t*0.012)*0.03;
 ctx.fillStyle='rgba(8,2,18,'+darkPulse+')';
 ctx.fillRect(0,0,vw,vh);

 // ── AURORAS ABISALES más profundas y dinámicas ────────────────────────────
 const cur1=reduced?0:Math.sin(t*0.025)*35;
 const cur2=reduced?0:Math.cos(t*0.02)*40;

 const auroraGrad=ctx.createLinearGradient(0,40,0,260);
 auroraGrad.addColorStop(0,'rgba(140,90,220,0)');
 auroraGrad.addColorStop(0.35,'rgba(160,100,240,0.18)');
 auroraGrad.addColorStop(0.6,'rgba(80,200,190,0.22)');
 auroraGrad.addColorStop(1,'rgba(100,60,200,0)');
 ctx.fillStyle=auroraGrad;

 ctx.beginPath();
 ctx.moveTo(-60,180+cur1);
 ctx.bezierCurveTo(vw*.3,100+cur2,vw*.7,240+cur1,vw+60,140+cur2);
 ctx.lineTo(vw+60,0);ctx.lineTo(-60,0);
 ctx.closePath();ctx.fill();

 // Segunda cortina de aurora en contra-fase (más intensa)
 const auroraGrad2=ctx.createLinearGradient(0,80,0,320);
 auroraGrad2.addColorStop(0,'rgba(200,120,255,0)');
 auroraGrad2.addColorStop(0.5,'rgba(220,140,200,0.16)');
 auroraGrad2.addColorStop(1,'rgba(60,150,230,0)');
 ctx.fillStyle=auroraGrad2;

 ctx.beginPath();
 ctx.moveTo(-60,220-cur2);
 ctx.bezierCurveTo(vw*.35,160-cur1,vw*.65,280-cur2,vw+60,200-cur1);
 ctx.lineTo(vw+60,0);ctx.lineTo(-60,0);
 ctx.closePath();ctx.fill();

 // ── NEBULOSAS DE FONDO: nubes de gas cósmico en capas ─────────────────────
 if(!reduced){
  for(let n=0;n<3;n++){
   const nx=vw*(0.15+n*0.3)+Math.sin(t*0.008+n*2)*40;
   const ny=140+n*60+Math.cos(t*0.01+n)*20;
   const nr=80+n*20;
   const nebula=ctx.createRadialGradient(nx,ny,0,nx,ny,nr);
   const cols=['rgba(160,100,240,0.07)','rgba(80,180,200,0.06)','rgba(200,120,180,0.05)'];
   nebula.addColorStop(0,cols[n]);nebula.addColorStop(1,'rgba(0,0,0,0)');
   ctx.fillStyle=nebula;
   ctx.beginPath();ctx.arc(nx,ny,nr,0,TAU);ctx.fill();
  }
 }

 // ── COLONIAS DE MEDUSAS FANTASMA: siluetas translúcidas en el fondo ───────
 if(!reduced){
  ctx.globalAlpha=0.12;
  for(let m=0;m<7;m++){
   const mx=((t*0.08+m*197)%(vw+200))-100;
   const my=180+Math.sin(t*0.025+m*1.8)*60+(m%3)*40;
   const ms=0.4+m%3*0.15;
   const mPulse=Math.sin(t*0.06+m*2.3)*0.03;
   ctx.save();ctx.translate(mx,my);ctx.scale(ms+mPulse,ms+mPulse);
   // Mini campana fantasma
   ctx.beginPath();ctx.moveTo(-14,0);
   ctx.bezierCurveTo(-16,-10,-6,-20,0,-20);ctx.bezierCurveTo(6,-20,16,-10,14,0);
   ctx.quadraticCurveTo(0,4,-14,0);
   ctx.fillStyle=m%2?'#c8b0f0':'#90d8e0';ctx.fill();
   // Mini tentáculos fantasma
   for(let tk=-1;tk<=1;tk++){
    const tw=Math.sin(t*0.08+m+tk)*3;
    ctx.beginPath();ctx.moveTo(tk*6,2);ctx.quadraticCurveTo(tk*5+tw,12,tk*4+tw*1.5,18);
    ctx.strokeStyle=m%2?'#c8b0f0':'#90d8e0';ctx.lineWidth=1.2;ctx.stroke();
   }
   ctx.restore();
  }
  ctx.globalAlpha=1;
 }

 // ── COLUMNAS DE BURBUJAS ASCENDENTES desde el fondo oceánico ──────────────
 if(!reduced){
  ctx.globalAlpha=0.3;
  for(let col=0;col<5;col++){
   const baseX=vw*(0.12+col*0.2);
   for(let b=0;b<4;b++){
    const bAge=((t*0.5+col*43+b*67)%180);
    const bx=baseX+Math.sin(bAge*0.08+col)*8;
    const by=vh-bAge*2.5;
    const br=1.5+Math.sin(bAge*0.1+b)*0.8;
    if(by>40){
     ctx.beginPath();ctx.arc(bx,by,br,0,TAU);
     ctx.fillStyle=col%2?'rgba(122,240,224,0.5)':'rgba(200,160,255,0.4)';
     ctx.fill();
    }
   }
  }
  ctx.globalAlpha=1;
 }

 // ── ESTRELLAS DE FONDO: campo estelar estático con centelleo ───────────────
 if(!reduced){
  ctx.globalAlpha=0.55;
  for(let s=0;s<20;s++){
   const sx=(s*311.7)%vw,sy=(s*173.3)%(vh*0.45);
   const twinkle=0.4+Math.sin(t*0.04+s*3.7)*0.5;
   ctx.globalAlpha=Math.max(0,Math.min(1,twinkle));
   ctx.fillStyle=s%4===0?'#ffe8a0':s%4===1?'#d8f0ff':s%4===2?'#ffcbe8':'#c8f0e0';
   ctx.beginPath();ctx.arc(sx,sy,s%3===0?1.8:1.1,0,TAU);ctx.fill();
   // Cruz estelar en las más brillantes
   if(s%5===0&&twinkle>0.6){
    ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=0.5;
    ctx.beginPath();ctx.moveTo(sx-3,sy);ctx.lineTo(sx+3,sy);ctx.moveTo(sx,sy-3);ctx.lineTo(sx,sy+3);ctx.stroke();
   }
  }
  ctx.globalAlpha=1;
 }

 // ── FITOPLANCTON CÓSMICO: esporas bioluminiscentes (más cantidad y variedad)
 if(!reduced){
  ctx.globalAlpha=0.45;
  for(let i=0;i<18;i++){
   const seed=i*137.5;
   const fx=((t*0.15+seed)%(vw+80))-40;
   const fy=60+Math.sin(t*0.03+seed)*50+(seed%200);
   const fr=1.2+Math.sin(t*0.06+i)*0.6;
   ctx.fillStyle=i%4===0?'#7af0e0':i%4===1?'#deb3ff':i%4===2?'#ffe6aa':'#ff9ed0';
   ctx.beginPath();ctx.arc(fx,fy,fr,0,TAU);ctx.fill();
   // Estela corta de la espora
   if(i%3===0){
    ctx.globalAlpha=0.2;
    ctx.beginPath();ctx.moveTo(fx,fy);ctx.lineTo(fx-4,fy+2);ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=0.6;ctx.stroke();
    ctx.globalAlpha=0.45;
   }
  }
  ctx.globalAlpha=1;
 }

 // ── CORALES BIOLUMINISCENTES en la franja inferior del viewport ────────────
 if(!reduced){
  const coralY=vh-30;
  ctx.globalAlpha=0.18;
  for(let c=0;c<6;c++){
   const cx=vw*(0.08+c*0.17);
   const ch=22+c%3*8;
   const sway=Math.sin(t*0.04+c*1.4)*2;
   // Rama principal
   ctx.beginPath();ctx.moveTo(cx,coralY);
   ctx.quadraticCurveTo(cx+sway,coralY-ch*0.6,cx+sway*1.5,coralY-ch);
   ctx.strokeStyle=c%3===0?'#ff8ecf':c%3===1?'#7af0e0':'#deb3ff';ctx.lineWidth=3;ctx.stroke();
   // Ramas laterales
   for(let br=-1;br<=1;br+=2){
    ctx.beginPath();ctx.moveTo(cx+sway*0.5,coralY-ch*0.5);
    ctx.quadraticCurveTo(cx+br*8+sway,coralY-ch*0.7,cx+br*10+sway*1.2,coralY-ch*0.85);
    ctx.lineWidth=1.8;ctx.stroke();
   }
   // Punta luminosa
   ctx.beginPath();ctx.arc(cx+sway*1.5,coralY-ch,2.5,0,TAU);
   ctx.fillStyle=ctx.strokeStyle;ctx.fill();
  }
  ctx.globalAlpha=1;
 }

 // ── ALGAS/KELP ondulando en los bordes de plataformas (franja inferior) ────
 if(!reduced){
  ctx.globalAlpha=0.14;
  for(let k=0;k<8;k++){
   const kx=vw*(0.05+k*0.13);
   const kh=30+k%3*10;
   const kBase=vh-15;
   for(let seg=0;seg<4;seg++){
    const segH=kh/4;
    const sway=Math.sin(t*0.05+k+seg*0.8)*4*(seg+1)/4;
    const sy1=kBase-seg*segH,sy2=kBase-(seg+1)*segH;
    ctx.beginPath();ctx.moveTo(kx,sy1);ctx.quadraticCurveTo(kx+sway,sy1-segH*0.5,kx+sway,sy2);
    ctx.strokeStyle=k%2?'#60c0a0':'#80a0d0';ctx.lineWidth=2.5-seg*0.4;ctx.stroke();
   }
  }
  ctx.globalAlpha=1;
 }

 ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// VÓRTICES DE CORRIENTE ABISAL EN LOS POZOS (efecto visual de salvación)
// ─────────────────────────────────────────────────────────────────────────────
export function drawCatPitVortex(ctx,hazard,cam,t=0,reduced=false){
 if(!ctx||!hazard)return;
 const x=hazard.x-cam.x,y=hazard.y-cam.y,w=hazard.w,h=hazard.h;
 const cx=x+w/2,cy=y+h*0.35;
 ctx.save();

 // Corriente ascendente luminosa dentro del pozo
 if(!reduced){
  const upFlow=ctx.createLinearGradient(cx,y+h,cx,y);
  upFlow.addColorStop(0,'rgba(122,240,224,0)');
  upFlow.addColorStop(0.4,'rgba(122,240,224,0.12)');
  upFlow.addColorStop(0.7,'rgba(180,140,255,0.08)');
  upFlow.addColorStop(1,'rgba(180,140,255,0)');
  ctx.fillStyle=upFlow;
  ctx.fillRect(x+8,y,w-16,h);

  // Espirales de corriente
  ctx.globalAlpha=0.35;
  for(let s=0;s<3;s++){
   const spiralT=t*0.06+s*TAU/3;
   const sr=12+s*4+Math.sin(t*0.03+s)*3;
   const sy=cy+Math.sin(t*0.04+s*2)*30;
   ctx.beginPath();
   for(let a=0;a<TAU*1.5;a+=0.15){
    const px=cx+Math.cos(a+spiralT)*sr*(1-a/(TAU*3));
    const py=sy-a*6;
    if(a===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
   }
   ctx.strokeStyle=s%2?'#7af0e0':'#c495ff';
   ctx.lineWidth=1.5;ctx.stroke();
  }

  // Partículas ascendentes (burbujas de energía)
  ctx.globalAlpha=0.5;
  for(let p=0;p<6;p++){
   const pAge=((t*0.8+p*47)%120);
   const px=cx+Math.sin(pAge*0.12+p*1.3)*w*0.25;
   const py=y+h-pAge*2.5;
   if(py>y&&py<y+h){
    ctx.fillStyle=p%2?'#7af0e0':'#deb3ff';
    ctx.beginPath();ctx.arc(px,py,1.5+Math.sin(pAge*0.1)*0.6,0,TAU);ctx.fill();
   }
  }
 }

 // Borde luminoso superior del pozo (indicador visual de zona segura)
 ctx.globalAlpha=0.6;
 const edgeGlow=ctx.createLinearGradient(x,y-6,x,y+12);
 edgeGlow.addColorStop(0,hazard.color||'#c495ff');
 edgeGlow.addColorStop(1,'rgba(0,0,0,0)');
 ctx.fillStyle=edgeGlow;
 ctx.fillRect(x,y-4,w,16);

 ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// DECORACIONES AMBIENTALES: FORMACIONES DE CORAL, ALGAS Y CRISTALES EN PLATAFORMAS
// ─────────────────────────────────────────────────────────────────────────────
export function drawCatPlatformDecor(ctx,plat,cam,t=0,reduced=false){
 if(!ctx||!plat)return;
 const [px,py,pw,ph]=plat;
 if(ph>30)return; // Solo decorar plataformas (no el suelo)
 const x=px-cam.x,y=py-cam.y,w=pw;
 const seed=(px*7+py*13)%1000;

 ctx.save();

 // Musgo bioluminiscente en el borde de la plataforma
 ctx.globalAlpha=reduced?0.1:0.22;
 for(let m=0;m<Math.min(5,w/40);m++){
  const mx=x+10+m*(w/5)+((seed+m*31)%20);
  const mh=4+((seed+m*17)%6);
  const sway=reduced?0:Math.sin(t*0.04+seed+m)*1.5;
  ctx.beginPath();ctx.moveTo(mx,y);
  ctx.quadraticCurveTo(mx+sway,y-mh,mx+3+sway,y-1);
  ctx.strokeStyle=(seed+m)%3===0?'#7af0e0':(seed+m)%3===1?'#c8a0f7':'#ffe6aa';
  ctx.lineWidth=2;ctx.stroke();
 }

 // Cristales lunares ocasionales (solo en algunas plataformas)
 if(seed%5===0&&!reduced){
  const cx=x+w*0.6+(seed%30);
  ctx.globalAlpha=0.35;
  ctx.beginPath();
  ctx.moveTo(cx,y);ctx.lineTo(cx-3,y-12);ctx.lineTo(cx+1,y-14);ctx.lineTo(cx+4,y-10);ctx.closePath();
  ctx.fillStyle='#d8c0ff';ctx.fill();
  ctx.strokeStyle='#f0e8ff';ctx.lineWidth=0.8;ctx.stroke();
  // Brillo en la punta del cristal
  ctx.globalAlpha=0.5+Math.sin(t*0.05+seed)*0.3;
  ctx.beginPath();ctx.arc(cx+1,y-14,1.5,0,TAU);
  ctx.fillStyle='#fff8e0';ctx.fill();
 }

 ctx.globalAlpha=1;
 ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// ESTELA DE POLVO DE ESTRELLAS DE MICHI AL CORRER Y SALTAR
// ─────────────────────────────────────────────────────────────────────────────
export function drawCatStardust(ctx,p,cam,t=0,reduced=false){
 if(!p||reduced)return;
 const px=p.x+p.w/2-cam.x,py=p.y+p.h-cam.y;
 const moving=Math.abs(p.vx||0)>0.8||!p.grounded;
 if(!moving)return;

 ctx.save();
 const count=p.grounded?3:5;
 for(let i=0;i<count;i++){
  const lag=((t*0.3+i*13)%24);
  const spread=Math.sin(t*0.2+i*1.7)*8;
  const sx=px-Math.sign(p.vx||1)*(lag*4)-spread;
  const sy=py-4-lag*1.8;
  const alpha=Math.max(0,1-lag/24)*0.65;

  ctx.globalAlpha=alpha;
  ctx.fillStyle=i%2?'#ffe6aa':'#deb3ff';
  ctx.beginPath();
  ctx.arc(sx,sy,1.6+Math.sin(i)*0.8,0,TAU);
  ctx.fill();

  // Pequeña cruz estelar en el destello
  if(i===0){
   ctx.strokeStyle='#ffffff';ctx.lineWidth=0.8;
   ctx.beginPath();
   ctx.moveTo(sx-3,sy);ctx.lineTo(sx+3,sy);
   ctx.moveTo(sx,sy-3);ctx.lineTo(sx,sy+3);
   ctx.stroke();
  }
 }
 ctx.restore();
}

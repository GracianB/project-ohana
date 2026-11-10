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

// ─────────────────────────────────────────────────────────────────────────────
// FAUNA ASTRAL DEL JARDÍN LUNAR (Enemigos Vectoriales Orgánicos de Alta Fidelidad)
// ─────────────────────────────────────────────────────────────────────────────

// ─ Medusa lunar (medusa): Aurelia astral con campana translúcida viva, velos orales ondulantes y ropalios
function drawLunarJellyFoe(c,s){
 const {time,active,hurt,aim}=s;
 // Pulsación natatoria orgánica asimétrica: contracción elástica rápida, relajación fluida prolongada
 const cycle=(time*.08)%TAU;
 // Fractional powers of negative sine yield NaN and break Canvas gradients.
 const swim=Math.sin(cycle);
 const pulse=swim>0?Math.pow(swim,1.8)*.14:-Math.pow(-swim,1.2)*.08;
 const float=Math.sin(time*.05)*4,bellW=1+pulse,bellH=1-pulse*.7;

 // 1. Velos orales internos (manubrio rizado) que ondean con retardo hidrodinámico
 for(const side of[-1,1]){
  for(let layer=0;layer<2;layer++){
   const vPhase=time*.1+side*1.2+layer*1.5;
   const w1=Math.sin(vPhase)*5,w2=Math.sin(vPhase-.8)*8;
   fill(c,layer?'rgba(215,190,255,0.4)':'rgba(165,130,240,0.5)',()=>{
    c.moveTo(side*6*bellW,float-14);
    c.bezierCurveTo(side*12*bellW+w1,float+4,side*16+w2,float+18,side*8+w2,float+28);
    c.quadraticCurveTo(side*4+w1,float+14,0,float-10);
   },1);
  }
 }

 // 2. Siete tentáculos filamentosos largos con física de retraso ondulatorio
 for(let k=-3;k<=3;k++){
  const tPhase=time*.11+k*1.1,reach=36+Math.abs(k)*3+(active?8:0);
  const w1=Math.sin(tPhase)*7,w2=Math.sin(tPhase-1.2)*11;
  const col=k===0?MOON:k%2===0?PEARL:'#d9bbf5';
  stroke(c,col,k===0?3.2:2.2,()=>{
   c.moveTo(k*8*bellW,float);
   c.bezierCurveTo(k*7*bellW+w1*.4,float+10,k*5+w1,float+reach*.55,k*4+w2,float+reach);
  });
  // Fotóforo perlado en el extremo
  ellipse(c,k*4+w2,float+reach,2.2,2.5,active?TEAL:MOON,0,0);
 }

 // 3. Campana translúcida multicapa (exumbrela + subumbrela)
 const half=30*bellW,topY=float-38*bellH;
 c.save();
 c.globalAlpha=hurt?.7:.94;
 // Exumbrela nacarada con degradado bioluminiscente
 fill(c,gradient(c,-half,topY,half*2,38*bellH,'#f6edff',LILAC,'#5a338c'),()=>{
  c.moveTo(-half,float);
  c.bezierCurveTo(-half-4,float-18*bellH,-18,topY,0,topY);
  c.bezierCurveTo(18,topY,half+4,float-18*bellH,half,float);
  // Margen festoneado de 8 lóbulos (lauras / lappets marginales)
  for(let l=4;l>=-4;l--){
   const lx=(l/4)*half,ly=float+(l%2===0?3:0);
   c.quadraticCurveTo(lx+(half/8),float-2,lx,ly);
  }
 },2.2);

 // Subumbrela interna bioluminiscente (halo translúcido)
 c.globalAlpha=.35;
 fill(c,gradient(c,-half*.7,topY+6,half*1.4,26*bellH,'#7af0e0',LILAC,'#2a104a'),()=>{
  c.ellipse(0,float-14*bellH,half*.7,16*bellH,0,0,TAU);
 },0);
 c.restore();

 // 4. Canales radiales gastrovasculares iluminados (8 radios)
 for(let r=-3;r<=3;r++){
  const rx=(r/3.5)*half*.85;
  stroke(c,'rgba(255,255,255,0.5)',1.1,()=>{
   c.moveTo(0,topY+4);
   c.quadraticCurveTo(rx*.4,float-20*bellH,rx,float-2);
  });
 }

 // 5. Órganos sensoriales marginales (8 ropalios con gemas de estatolito)
 for(let rop=-3;rop<=3;rop+=2){
  const ropX=(rop/3)*half*.92;
  ellipse(c,ropX,float,1.8,1.8,active?TEAL:MOON,0,0);
 }

 // 6. Órgano apical coronal y gema de stardust
 ellipse(c,0,topY-2,3.8,4.5,MOON,0,1.4);
 ellipse(c,0,topY-2,1.8,2.2,TEAL,0,0);
 for(const sp of[-1,1]){
  stroke(c,'rgba(255,255,255,0.75)',1.2,()=>{
   c.moveTo(sp*4,topY+2);c.quadraticCurveTo(sp*8,topY-6,sp*5,topY-11);
  });
 }

 // 7. Ojos astrales expresivos
 const blink=active&&((time+17)%190<6);
 for(const side of[-1,1]){
  const ex=side*12*bellW,ey=float-15*bellH;
  if(!active||blink){
   stroke(c,INK,2,()=>{c.moveTo(ex-4,ey);c.quadraticCurveTo(ex,ey+3,ex+4,ey);});
  }else{
   eye(c,ex,ey,3.8,aim,{hurt,glow:TEAL});
  }
 }

 // Aura de ataque al enfurecerse
 if(active){
  c.save();c.globalAlpha=.45+Math.sin(time*.2)*.25;
  stroke(c,TEAL,2,()=>{c.ellipse(0,float-18*bellH,half+6,24*bellH,0,0,TAU);});
  c.restore();
 }
}

// ─ Phosquito astral (phosquito): libélula de sifonóforo con 4 alas de difracción prismática y lanceta estelar
function drawAstralGnat(c,s){
 const {time,active,hurt,aim}=s;
 const buzz=Math.sin(time*.7)*14; // Aleteo de altísima frecuencia
 const hoverY=Math.sin(time*.14)*3;

 // 1. Cuatro alas de cristal de difracción prismática (pares anterior y posterior independientes)
 for(const side of[-1,1]){
  // Ala anterior (larga, esbelta, con venación celérica)
  c.save();c.translate(side*5,-22+hoverY);c.rotate(side*(.25+buzz*.03));
  fill(c,'rgba(215,225,255,0.65)',()=>{
   c.moveTo(0,0);
   c.bezierCurveTo(side*12,-16,side*28,-14,side*30,-3);
   c.quadraticCurveTo(side*18,8,0,0);
  },1.2);
  // Venación prismática
  stroke(c,LILAC,0.9,()=>{
   c.moveTo(0,0);c.lineTo(side*26,-4);
   c.moveTo(side*12,-8);c.lineTo(side*16,3);
   c.moveTo(side*20,-6);c.lineTo(side*23,1);
  });
  c.restore();

  // Ala posterior (secundaria, desfasada para flujo aerodinámico)
  c.save();c.translate(side*3,-18+hoverY);c.rotate(side*(.45-buzz*.025));
  fill(c,'rgba(190,205,255,0.45)',()=>{
   c.moveTo(0,0);
   c.bezierCurveTo(side*10,-9,side*22,-6,side*20,6);
   c.quadraticCurveTo(side*10,8,0,0);
  },1.1);
  c.restore();
 }

 // 2. Abdomen de sifonóforo segmentado en 5 cámaras de bioluminiscencia
 for(let seg=0;seg<5;seg++){
  const sy=-8+seg*4.5+hoverY,radX=9-seg*1.4,radY=3.2;
  const col=seg%2===0?PEARL:LILAC;
  fill(c,gradient(c,-radX,sy-radY,radX*2,radY*2,col,'#6a4c9c','#24103c'),()=>{
   c.ellipse(0,sy,radX,radY,0,0,TAU);
  },1.4);
  // Anillo de energía estelar
  stroke(c,seg===0?TEAL:MOON,1.1,()=>c.ellipse(0,sy,radX*.8,radY*.6,0,0,TAU));
 }

 // 3. Tórax esbelto de selenita
 fill(c,gradient(c,-8,-24+hoverY,16,14,PEARL,LILAC,'#4a2870'),()=>{
  c.ellipse(0,-18+hoverY,7,8,0,0,TAU);
 },1.8);

 // 4. Cabeza, grandes ojos facetados y antenas plumosas
 ellipse(c,0,-27+hoverY,6.5,6.5,'#b8a0e0',0,1.6);
 eye(c,aim*2,-27+hoverY,3.6,aim,{hurt,glow:TEAL});

 // Antenas plumosas con fotóforos terminales
 for(const side of[-1,1]){
  const antSway=Math.sin(time*.2+side)*2;
  stroke(c,'#d4bbf5',1.2,()=>{
   c.moveTo(side*3,-31+hoverY);
   c.bezierCurveTo(side*8,-38+hoverY,side*(10+antSway),-44+hoverY,side*(8+antSway),-48+hoverY);
  });
  // Plumas laterales
  for(let p=0;p<3;p++){
   stroke(c,'rgba(255,255,255,0.7)',0.8,()=>{
    c.moveTo(side*(5+p),-36-p*3+hoverY);c.lineTo(side*(9+p*2),-38-p*3+hoverY);
   });
  }
  ellipse(c,side*(8+antSway),-48+hoverY,2,2,MOON,0,0);
 }

 // 5. Patitas cristalinas replegadas bajo el tórax
 for(const side of[-1,1]){
  for(let l=0;l<2;l++){
   stroke(c,'#6a4890',1.4,()=>{
    c.moveTo(side*3,-16+l*4+hoverY);
    c.lineTo(side*7,-11+l*4+hoverY);
    c.lineTo(side*4,-6+l*4+hoverY);
   });
  }
 }

 // 6. Lanceta estelar inferior (aguijón astral)
 stroke(c,'#402860',2.4,()=>{c.moveTo(0,14+hoverY);c.lineTo(-aim*3,22+hoverY);});
 stroke(c,active?TEAL:MOON,active?2.8:1.8,()=>{c.moveTo(-aim*3,22+hoverY);c.lineTo(-aim*6,30+hoverY);});
 if(active){
  ellipse(c,-aim*6,30+hoverY,3,3,TEAL,0,0);
  // Destello de carga estelar
  for(let k=0;k<3;k++){
   const a=k*TAU/3+time*.2;
   ellipse(c,-aim*6+Math.cos(a)*5,30+hoverY+Math.sin(a)*5,1.2,1.2,'#ffffff',0,0);
  }
 }
}

// ─ UFO cristalino (ufo): cronómetro astronómico flotante con anillos contrarrotatorios y haz tractor
function drawCrystalSaucer(c,s){
 const {time,active,hurt,aim}=s;
 const spin=time*.06,hover=Math.sin(time*.06)*3;

 // 1. Haz tractor gravitatorio volumétrico inferior
 if(active){
  c.save();
  const beamH=34;
  const hg=c.createLinearGradient(0,-6+hover,0,beamH+hover);
  hg.addColorStop(0,'rgba(122,240,224,0.6)');
  hg.addColorStop(0.4,'rgba(195,165,255,0.35)');
  hg.addColorStop(1,'rgba(122,240,224,0)');
  c.fillStyle=hg;
  c.beginPath();
  c.moveTo(-12,-6+hover);c.lineTo(12,-6+hover);
  c.lineTo(26,beamH+hover);c.lineTo(-26,beamH+hover);
  c.closePath();c.fill();

  // Ondas gravitatorias descendentes animadas dentro del haz
  for(let w=0;w<3;w++){
   const wy=((time*.06+w/3)%1)*beamH;
   const wSpread=12+(wy/beamH)*12;
   stroke(c,'rgba(255,255,255,0.5)',1.2,()=>{
    c.ellipse(0,-6+hover+wy,wSpread,wSpread*.25,0,0,TAU);
   });
  }
  c.restore();
 }

 // 2. Espejos y prismas orbitales flotantes que giran alrededor del platillo
 for(let p=0;p<4;p++){
  const ang=p*TAU/4+spin;
  const px=Math.cos(ang)*34,py=-14+hover+Math.sin(ang)*8;
  const prismCols=['#c8f0ff','#ffd6f8','#ffe8a0','#bbf5dd'];
  fill(c,prismCols[p],()=>{
   c.moveTo(px,py-4);c.lineTo(px+3,py);c.lineTo(px,py+4);c.lineTo(px-3,py);
  },.8);
 }

 // 3. Cúpula superior de selenita con núcleo levitante visible
 fill(c,gradient(c,-16,-38+hover,32,22,PEARL,LILAC,'#6a4890'),()=>{
  c.ellipse(0,-28+hover,16,13,0,0,TAU);
 },1.8);

 // Núcleo octaédrico levitante en el interior de la cúpula
 const coreBob=Math.sin(time*.12)*2;
 fill(c,gradient(c,-5,-32+hover+coreBob,10,10,'#ffffff',TEAL,'#3a1a60'),()=>{
  c.moveTo(0,-34+hover+coreBob);c.lineTo(5,-28+hover+coreBob);c.lineTo(0,-22+hover+coreBob);c.lineTo(-5,-28+hover+coreBob);
 },1.1);

 // 4. Casco lenticular principal (platillo biselado)
 fill(c,gradient(c,-30,-22+hover,60,20,'#9a78cc','#4e3076','#1a0a2c'),()=>{
  c.ellipse(0,-13+hover,30,9,0,0,TAU);
 },2.2);
 stroke(c,LILAC,1.8,()=>c.ellipse(0,-13+hover,30,9,0,0,TAU));

 // 5. Anillo ecuatorial con engranajes rúnicos contrarrotatorios
 stroke(c,active?MOON:'rgba(215,190,255,0.7)',1.4,()=>{
  c.ellipse(0,-13+hover,30,4.5,-spin*.7,0,TAU);
 });
 for(let notch=0;notch<6;notch++){
  const na=notch*TAU/6-spin*.7;
  const nx=Math.cos(na)*29,ny=-13+hover+Math.sin(na)*4.2;
  ellipse(c,nx,ny,1.6,1.6,active?TEAL:MOON,0,0);
 }

 // 6. Ojo de navegación astral central y luces emisoras inferiores
 eye(c,0,-14+hover,3.8,aim,{hurt,glow:active?TEAL:MOON});
 for(let i=0;i<5;i++){
  const a=i*TAU/5+spin;
  const lx=Math.cos(a)*22,ly=-7+hover+Math.sin(a)*3.5;
  ellipse(c,lx,ly,2.4,2.4,active?TEAL:MOON,0,0);
 }
}

// ─ Manta cósmica de nácar (murcielago): volador etéreo con alas ondulantes de seda y cola estelar bifurcada
function drawNacarBat(c,s){
 const {time,active,hurt,aim}=s;
 // Ondulación hidrodinámica/aerodinámica que recorre la envergadura del ala
 const flapCycle=time*.2;
 const flap=Math.sin(flapCycle)*12;
 const bodyHover=Math.sin(flapCycle-.5)*3;

 // 1. Cola bifurcada celestial con perlas luminosas en las puntas (flota en la corriente)
 for(const side of[-1,1]){
  const tailSway=Math.sin(time*.12+side*.8)*5;
  stroke(c,LILAC,1.6,()=>{
   c.moveTo(side*2,-6+bodyHover);
   c.bezierCurveTo(side*5,6+bodyHover,side*8+tailSway,18+bodyHover,side*6+tailSway,28+bodyHover);
  });
  ellipse(c,side*6+tailSway,28+bodyHover,2.5,2.5,active?TEAL:MOON,0,0);
 }

 // 2. Alas etéreas de nácar multicapa con puntales de hueso de selenita
 for(const side of[-1,1]){
  c.save();
  c.translate(side*4,-18+bodyHover);
  c.rotate(side*(.15+flap*.035));

  // Membrana del ala con gradiente nácar
  fill(c,gradient(c,0,-16,side*34,32,PEARL,LILAC,'#32164e'),()=>{
   c.moveTo(0,0);
   // Borde de ataque con curvatura elegante
   c.bezierCurveTo(side*14,-18+flap*.15,side*28,-14,side*34,-8);
   // Borde de fuga festoneado de 3 lóbulos
   c.quadraticCurveTo(side*28,8,side*22,4);
   c.quadraticCurveTo(side*16,10,side*11,5);
   c.quadraticCurveTo(side*5,7,0,0);
  },1.8);

  // Puntales de hueso luminosos (3 nervaduras de soporte)
  stroke(c,'rgba(255,255,255,0.75)',1.3,()=>{
   c.moveTo(0,0);c.lineTo(side*34,-8);
   c.moveTo(0,0);c.lineTo(side*22,4);
   c.moveTo(0,0);c.lineTo(side*11,5);
  });
  // Garra estelar en el vértice del ala
  ellipse(c,side*34,-8,2.2,2.2,MOON,0,0);
  c.restore();
 }

 // 3. Cuerpo esbelto aterciopelado de lavanda astral
 fill(c,gradient(c,-9,-30+bodyHover,18,26,'#d0b4f5','#6c4a96','#24103c'),()=>{
  c.ellipse(0,-15+bodyHover,8.5,12,0,0,TAU);
 },2.2);

 // Constelación estelar en el lomo (3 nodos conectados)
 for(let n=0;n<3;n++){
  const ny=-22+n*6+bodyHover;
  ellipse(c,0,ny,1.4,1.4,'#ffffff',0,0);
  if(n<2)stroke(c,'rgba(255,255,255,0.5)',0.8,()=>{c.moveTo(0,ny);c.lineTo(0,ny+6);});
 }

 // 4. Orejas puntiagudas estilizadas con resonadores de selenita
 for(const side of[-1,1]){
  fill(c,'#7c58a6',()=>{
   c.moveTo(side*2,-24+bodyHover);
   c.lineTo(side*8,-42+bodyHover);
   c.lineTo(side*10,-22+bodyHover);
  },1.4);
  // Resonador interno lunar
  ellipse(c,side*6,-33+bodyHover,2,2.5,MOON,0,0);
 }

 // 5. Ojos somnolientos o vigilantes
 eye(c,-3.5,-16+bodyHover,3.4,aim,{hurt,glow:active?TEAL:MOON});
 eye(c,3.5,-16+bodyHover,3.4,aim,{hurt,glow:active?TEAL:MOON});

 // 6. Mandíbula y colmillitos tiernos al rugir
 if(active){
  stroke(c,MOON,2,()=>{
   c.moveTo(-3,-9+bodyHover);c.lineTo(0,-5+bodyHover);c.lineTo(3,-9+bodyHover);
  });
 }
}

// ─ Araña del velo (arana): tejedora de cristal y seda astral con 8 patas multiarticuladas y abdomen de gema facetada
function drawVeilSpider(c,s){
 const {time,step,active,hurt,aim}=s;
 // Suspensión elástica en hilo de seda: balanceo pendular suave y rebote
 const pendular=Math.sin(time*.07)*4;
 const bob=Math.sin(time*.14)*3;
 const totalY=bob;

 // 1. Hilo de seda lunar trenzado (desciende desde lo alto)
 stroke(c,'rgba(255,255,255,0.75)',1.2,()=>{
  c.moveTo(pendular*.5,-48+totalY);c.lineTo(0,-28+totalY);
 });

 // 2. Ocho patas de cristal multiarticuladas (4 a cada lado) con cinemática de gateo viva
 for(const side of[-1,1]){
  for(let i=0;i<4;i++){
   const legPhase=time*.16+i*1.1+(side>0?Math.PI:0);
   const legReach=step*side*5+Math.sin(legPhase)*4;
   const rootY=-12-i*3.5+totalY;
   const kneeX=side*(14+i*2)+legReach*.6,kneeY=rootY-10-i*1.5+legReach*.4;
   const footX=side*(22+i*3)+legReach,footY=rootY+4+i*1.2;

   // Artejo fémur
   stroke(c,'#583480',2.4,()=>{
    c.moveTo(side*7,rootY);c.lineTo(kneeX,kneeY);
   });
   // Artejo tibia y tarso
   stroke(c,side===1&&i%2===0?LILAC:'#402064',1.8,()=>{
    c.moveTo(kneeX,kneeY);c.lineTo(footX,footY);
   });
   // Rodillera de cristal
   ellipse(c,kneeX,kneeY,1.6,1.6,PEARL,0,0);
   // Uña tarsal brillante
   ellipse(c,footX,footY,1.2,1.2,active?TEAL:MOON,0,0);
  }
 }

 // 3. Abdomen facetado de joya amatista-ópalo
 fill(c,gradient(c,-15,-28+totalY,30,26,'#b08ce8','#542c7c','#1e0830'),()=>{
  c.ellipse(0,-14+totalY,14,12,0,0,TAU);
 },2.4);

 // Facetas cristalinas sobre el abdomen
 for(let f=0;f<4;f++){
  const fa=f*TAU/4+Math.PI/4;
  stroke(c,'rgba(255,255,255,0.4)',1,()=>{
   c.moveTo(0,-14+totalY);
   c.lineTo(Math.cos(fa)*12,-14+totalY+Math.sin(fa)*9);
  });
 }
 // Emblema lunar central en el abdomen
 stroke(c,MOON,1.6,()=>c.arc(0,-14+totalY,6.5,0,TAU));
 ellipse(c,0,-14+totalY,3,3,TEAL,0,0);

 // 4. Cefalotórax acorazado
 fill(c,'#34164c',()=>c.ellipse(0,-28+totalY,8.5,7.5,0,0,TAU),2);

 // 5. Ocho ojos de diamante dispuestos en dos arcos
 for(const ex of[-5,-2,2,5]){
  ellipse(c,ex,-30+totalY,1.5,1.5,active?TEAL:MOON,0,0);
  ellipse(c,ex*.7,-27+totalY,1.2,1.2,active?TEAL:'#ffffff',0,0);
 }

 // 6. Quelíceros (mandíbulas) y pedipalpos sensoriales
 for(const side of[-1,1]){
  // Pedipalpo delantero
  stroke(c,PEARL,1.4,()=>{
   c.moveTo(side*4,-30+totalY);c.lineTo(side*7,-35+totalY);c.lineTo(side*5,-38+totalY);
  });
  // Quelícero de selenita
  stroke(c,active?TEAL:'#c8a0f0',1.8,()=>{
   c.moveTo(side*3,-32+totalY);c.lineTo(side*6,-36+totalY);
  });
  if(hurt)ellipse(c,side*6,-36+totalY,2,2,'#ff6060',0,0);
 }

 // Red astral tejida bajo las garras en emboscada activa
 if(active){
  c.save();c.globalAlpha=.55+Math.sin(time*.2)*.25;
  stroke(c,TEAL,1.2,()=>{
   for(let p=0;p<5;p++){
    const pa=p*TAU/5;
    c.moveTo(0,10+totalY);c.lineTo(Math.cos(pa)*20,10+totalY+Math.sin(pa)*12);
   }
  });
  c.restore();
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

 // Aura bioluminiscente nocturna: los enemigos brillan en la oscuridad
 const auraR=36+(active?14:0);
 const auraGlow=c.createRadialGradient(0,-24,0,0,-24,auraR);
 const glowCol=e.kind==='medusa'?'122,240,224':e.kind==='phosquito'?'180,140,255':e.kind==='platillo'?'255,180,220':e.kind==='murcielago'?'160,210,255':'215,160,255';
 const alphaVal=reduced?0.24:0.20+Math.sin(time*0.08+(e.spawnIndex||0))*0.08+(active?0.16:0);
 auraGlow.addColorStop(0,'rgba('+glowCol+','+alphaVal+')');
 auraGlow.addColorStop(0.5,'rgba('+glowCol+','+(alphaVal*0.5)+')');
 auraGlow.addColorStop(1,'rgba(0,0,0,0)');
 c.fillStyle=auraGlow;
 c.beginPath();
 c.arc(0,-24,auraR,0,TAU);
 c.fill();

 drawFn(c,{time,step,active,hurt,aim});

 // Ojos y fotóforos bioluminiscentes que resaltan en la oscuridad
 if(!hurt){
  c.fillStyle='#ffffff';
  c.beginPath();
  c.arc(aim*2,-27,1.2,0,TAU);
  c.fill();
 }

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

 // Diadema sagrada de ropalios y perlas estelares (corona celestial de 5 agujas de selenita)
 for(let sp=-2;sp<=2;sp++){
  const spireH=sp===0?18:Math.abs(sp)===1?13:9;
  const sx=x+sp*9;
  ctx.beginPath();ctx.moveTo(sx-2.5,y-44);ctx.lineTo(sx,y-44-spireH);ctx.lineTo(sx+2.5,y-44);
  ctx.closePath();ctx.fillStyle=done?pal.glow:pal.rim;ctx.fill();
  ctx.strokeStyle=ink;ctx.lineWidth=1.2;ctx.stroke();
  // Perla en la cúspide
  ctx.beginPath();ctx.arc(sx,y-44-spireH,2.2,0,TAU);
  ctx.fillStyle=done?'#ffffff':pal.glow;ctx.fill();
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
// ATMÓSFERA CELESTIAL: AURORAS ABISALES, NEBULOSAS, COLONIAS DE MEDUSAS FANTASMA,
// CORALES BIOLUMINISCENTES, BURBUJAS OCEÁNICAS Y FITOPLANCTON
// ─────────────────────────────────────────────────────────────────────────────
export function drawCatAtmosphere(ctx,g,cam,t=0,reduced=false){
 if(!ctx)return;
 ctx.save();
 const vw=g.viewW||1280;
 const vh=g.viewH||720;

 // ── OSCURECIMIENTO GENERAL: velo abisal que se intensifica con el eclipse ──
 const darkPulse=reduced?0.08:0.06+Math.sin(t*0.012)*0.03;
 ctx.fillStyle='rgba(8,2,18,'+darkPulse+')';
 ctx.fillRect(0,0,vw,vh);

 // ── ECLIPSE LUNAR DINÁMICO MÓVIL Y RAYOS CELESTIALES ────────────────────
 // El eclipse se desplaza majestuosamente por la bóveda astral y modula la luz del reino
 const driftRate=0.0025;
 const drift=reduced?0:(t*driftRate)%TAU;
 const eclipX=(vw*0.5)+Math.cos(drift)*(vw*0.38);
 const eclipY=95+Math.sin(drift)*28;
 const eclipR=44;
 const cycleRate=0.012;
 const eclipseCycle=reduced?0.5:(Math.sin(t*cycleRate)+1)*0.5;

 // 1. Cono de luz celestial y rayos proyectados desde el eclipse hacia el escenario
 const rayAngle=Math.PI*0.5+Math.cos(drift)*0.22;
 const rayLength=vh*1.15;
 const rayAlpha=reduced?0.12:0.07+(1-eclipseCycle)*0.16+Math.sin(t*0.04)*0.03;
 const lightCone=ctx.createLinearGradient(eclipX,eclipY,eclipX,vh);
 lightCone.addColorStop(0,'rgba(200,245,255,'+(rayAlpha*1.6)+')');
 lightCone.addColorStop(0.35,'rgba(170,145,255,'+rayAlpha+')');
 lightCone.addColorStop(0.75,'rgba(122,240,224,'+(rayAlpha*0.5)+')');
 lightCone.addColorStop(1,'rgba(10,4,28,0)');
 ctx.fillStyle=lightCone;
 ctx.beginPath();
 ctx.moveTo(eclipX-22,eclipY);
 ctx.lineTo(eclipX+Math.cos(rayAngle-0.34)*rayLength,vh);
 ctx.lineTo(eclipX+Math.cos(rayAngle+0.34)*rayLength,vh);
 ctx.lineTo(eclipX+22,eclipY);
 ctx.closePath();
 ctx.fill();

 // 2. Corona exterior resplandeciente del eclipse
 const coronaR=eclipR*(1.7+(1-eclipseCycle)*0.8);
 const coronaGrad=ctx.createRadialGradient(eclipX,eclipY,eclipR*0.7,eclipX,eclipY,coronaR);
 coronaGrad.addColorStop(0,'rgba(255,248,225,0.92)');
 coronaGrad.addColorStop(0.25,'rgba(122,240,224,0.65)');
 coronaGrad.addColorStop(0.55,'rgba(190,130,255,0.32)');
 coronaGrad.addColorStop(0.85,'rgba(140,90,240,0.10)');
 coronaGrad.addColorStop(1,'rgba(0,0,0,0)');
 ctx.fillStyle=coronaGrad;
 ctx.beginPath();
 ctx.arc(eclipX,eclipY,coronaR,0,TAU);
 ctx.fill();

 // 3. Disco lunar oscuro del eclipse que oculta el núcleo astral
 const moonOffsetX=(eclipseCycle-0.5)*14;
 const moonOffsetY=(eclipseCycle-0.5)*7;
 ctx.fillStyle='#090314';
 ctx.beginPath();
 ctx.arc(eclipX+moonOffsetX,eclipY+moonOffsetY,eclipR,0,TAU);
 ctx.fill();
 ctx.strokeStyle='rgba(122,240,224,0.65)';
 ctx.lineWidth=1.8;
 ctx.stroke();

 // 4. Anillo de diamante y destello de luz estelar en el borde
 if(eclipseCycle<0.75){
  const ringAng=drift+Math.PI*0.25;
  const ringX=eclipX+Math.cos(ringAng)*eclipR;
  const ringY=eclipY+Math.sin(ringAng)*eclipR;
  const ringGlow=ctx.createRadialGradient(ringX,ringY,0,ringX,ringY,24);
  ringGlow.addColorStop(0,'#ffffff');
  ringGlow.addColorStop(0.3,'rgba(255,240,185,0.9)');
  ringGlow.addColorStop(0.7,'rgba(122,240,224,0.38)');
  ringGlow.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=ringGlow;
  ctx.beginPath();
  ctx.arc(ringX,ringY,24,0,TAU);
  ctx.fill();
  ctx.strokeStyle='#ffffff';
  ctx.lineWidth=1.4;
  ctx.beginPath();
  ctx.moveTo(ringX-10,ringY);ctx.lineTo(ringX+10,ringY);
  ctx.moveTo(ringX,ringY-10);ctx.lineTo(ringX,ringY+10);
  ctx.stroke();
 }

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

 // ── ILUMINACIÓN BIOLUMINISCENTE DINÁMICA DEL FONDO AL PASAR EL JUGADOR ─────
 if(g?.player&&cam){
  const p=g.player;
  const plx=(p.x||0)+(p.w||24)*0.5-cam.x;
  const ply=(p.y||0)+(p.h||26)*0.5-cam.y;
  if(plx>-180&&plx<vw+180&&ply>-180&&ply<vh+180){
   const pulseLight=reduced?1:1+Math.sin(t*0.08)*0.14;
   const heroR=(120+(p.evo||0)*22)*pulseLight;
   const heroGlow=ctx.createRadialGradient(plx,ply,0,plx,ply,heroR);
   heroGlow.addColorStop(0,'rgba(122,240,224,0.32)');
   heroGlow.addColorStop(0.35,'rgba(190,140,255,0.18)');
   heroGlow.addColorStop(0.75,'rgba(80,200,240,0.06)');
   heroGlow.addColorStop(1,'rgba(0,0,0,0)');
   ctx.fillStyle=heroGlow;
   ctx.beginPath();
   ctx.arc(plx,ply,heroR,0,TAU);
   ctx.fill();

   // Estela de luz bioluminiscente en el suelo al desplazarse
   if(!reduced&&(Math.abs(p.vx||0)>1||Math.abs(p.vy||0)>1)){
    const trailX=plx-(p.facing||1)*26;
    const trailY=ply+(p.grounded?12:20);
    const trailGlow=ctx.createRadialGradient(trailX,trailY,0,trailX,trailY,68);
    trailGlow.addColorStop(0,'rgba(122,240,224,0.22)');
    trailGlow.addColorStop(0.6,'rgba(200,160,255,0.07)');
    trailGlow.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=trailGlow;
    ctx.beginPath();
    ctx.arc(trailX,trailY,68,0,TAU);
    ctx.fill();
   }
  }
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

// ─────────────────────────────────────────────────────────────────────────────
// FONDO DEL SANTUARIO DEL ALTAR Y ARENA DEL ORÁCULO MEDUSALUNA
// ─────────────────────────────────────────────────────────────────────────────
export function drawCatBossArena(ctx,g,cam,t=0,reduced=false){
 if(!ctx||!g)return;
 const vw=g.viewW||1280,vh=g.viewH||720;
 const arenaLeft=8260-cam.x,arenaRight=9320-cam.x;
 const altarX=8790-cam.x,floor=1134-cam.y;

 // Solo dibujar si la cámara está en la proximidad del altar
 if(arenaRight<-100||arenaLeft>vw+100)return;

 ctx.save();

 // 1. Halo místico del santuario (resplandor ascendente desde el altar, sin eclipse secundario)
 const coronaPulse=reduced?0.4:0.35+Math.sin(t*0.02)*0.15;
 const bgGlow=ctx.createRadialGradient(altarX,floor-220,40,altarX,floor-220,380);
 bgGlow.addColorStop(0,'rgba(66,232,208,'+(coronaPulse*0.28)+')');
 bgGlow.addColorStop(0.4,'rgba(140,90,240,'+(coronaPulse*0.18)+')');
 bgGlow.addColorStop(0.8,'rgba(20,8,40,'+(coronaPulse*0.1)+')');
 bgGlow.addColorStop(1,'rgba(0,0,0,0)');
 ctx.fillStyle=bgGlow;
 ctx.fillRect(altarX-400,floor-520,800,520);

 // Rayos de starlight proyectados desde el santuario hacia el cenit
 if(!reduced){
  ctx.globalAlpha=0.18;
  for(let i=-3;i<=3;i++){
   const rayX=altarX+i*90;
   const grad=ctx.createLinearGradient(rayX,floor,rayX+i*20,floor-480);
   grad.addColorStop(0,'rgba(122,240,224,0.4)');
   grad.addColorStop(0.5,'rgba(220,180,255,0.25)');
   grad.addColorStop(1,'rgba(140,80,220,0)');
   ctx.fillStyle=grad;
   ctx.beginPath();
   ctx.moveTo(rayX-16,floor);ctx.lineTo(rayX+16,floor);
   ctx.lineTo(rayX+i*20+28,floor-480);ctx.lineTo(rayX+i*20-28,floor-480);
   ctx.closePath();ctx.fill();
  }
  ctx.globalAlpha=1;
 }

 // 2. Círculos de runas celestiales concéntricas en el suelo del altar
 ctx.save();
 ctx.translate(altarX,floor-8);
 ctx.scale(1,0.28);
 const runeSpin=reduced?0:t*0.008;
 ctx.strokeStyle='rgba(215,180,255,0.45)';ctx.lineWidth=2.5;
 ctx.beginPath();ctx.arc(0,0,260,0,TAU);ctx.stroke();
 ctx.strokeStyle='rgba(122,240,224,0.35)';ctx.lineWidth=1.5;
 ctx.beginPath();ctx.arc(0,0,180,0,TAU);ctx.stroke();

 // Glifos rúnicos giratorios
 for(let r=0;r<12;r++){
  const a=r*TAU/12+runeSpin;
  const rx=Math.cos(a)*220,ry=Math.sin(a)*220;
  ctx.fillStyle=r%3===0?'#ffe8a0':r%3===1?'#7af0e0':'#deb3ff';
  ctx.beginPath();ctx.arc(rx,ry,4,0,TAU);ctx.fill();
 }
 ctx.restore();

 // 3. Monolitos de cristal estelar en las fronteras de la arena (8260 y 9320)
 for(const mx of [arenaLeft,arenaRight]){
  const mh=180;
  const my=floor-mh;
  const mGrad=ctx.createLinearGradient(mx-14,my,mx+14,floor);
  mGrad.addColorStop(0,'rgba(235,220,255,0.85)');
  mGrad.addColorStop(0.5,'rgba(180,140,240,0.7)');
  mGrad.addColorStop(1,'rgba(80,45,130,0.9)');
  ctx.fillStyle=mGrad;
  ctx.beginPath();
  ctx.moveTo(mx,my);ctx.lineTo(mx+16,my+24);ctx.lineTo(mx+12,floor);
  ctx.lineTo(mx-12,floor);ctx.lineTo(mx-16,my+24);
  ctx.closePath();ctx.fill();
  ctx.strokeStyle='#ffffff';ctx.lineWidth=1.5;ctx.stroke();

  // Haz de luz de confinamiento cuando el boss está activo
  if(!reduced){
   ctx.strokeStyle='rgba(180,140,255,0.4)';ctx.lineWidth=2;
   if(ctx.setLineDash)ctx.setLineDash([8,6]);
   ctx.beginPath();ctx.moveTo(mx,my);ctx.lineTo(mx,my-300);ctx.stroke();
   if(ctx.setLineDash)ctx.setLineDash([]);
   // Gema flotante en la punta del monolito
   const gemPulse=Math.sin(t*0.06+mx)*4;
   ctx.fillStyle='#ffe7a8';
   ctx.beginPath();ctx.arc(mx,my-14+gemPulse,5,0,TAU);ctx.fill();
  }
 }

 ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// PERLAS DE SELENITA (objetos coleccionables y de recarga sagrada)
// ─────────────────────────────────────────────────────────────────────────────
export function drawCatPearl(ctx,pearl,cam,t=0,reduced=false){
 if(!ctx||!pearl||pearl.taken)return;
 const x=pearl.x-cam.x,y=pearl.y-cam.y;
 const pulse=reduced?0:Math.sin(t*0.07+pearl.id*1.5);
 const floatY=y+(reduced?0:pulse*4);
 const r=pearl.r||10;

 ctx.save();

 // Halo exterior
 ctx.globalAlpha=reduced?0.25:0.35+pulse*0.12;
 const halo=ctx.createRadialGradient(x,floatY,r*0.5,x,floatY,r*2.4);
 halo.addColorStop(0,'rgba(255,245,210,0.8)');
 halo.addColorStop(0.5,'rgba(200,160,255,0.4)');
 halo.addColorStop(1,'rgba(122,240,224,0)');
 ctx.fillStyle=halo;
 ctx.beginPath();ctx.arc(x,floatY,r*2.4,0,TAU);ctx.fill();

 // Perla nacarada
 ctx.globalAlpha=0.95;
 const grad=ctx.createRadialGradient(x-r*0.3,floatY-r*0.3,1,x,floatY,r);
 grad.addColorStop(0,'#ffffff');
 grad.addColorStop(0.35,'#fbf0ff');
 grad.addColorStop(0.75,'#e0c2ff');
 grad.addColorStop(1,'#9b72c9');
 ctx.fillStyle=grad;
 ctx.beginPath();ctx.arc(x,floatY,r,0,TAU);ctx.fill();
 ctx.strokeStyle='#ffffff';ctx.lineWidth=1.2;ctx.stroke();

 // Destellos de brillo
 ctx.fillStyle='#ffffff';
 ctx.beginPath();ctx.arc(x-r*0.32,floatY-r*0.32,2,0,TAU);ctx.fill();

 // Anillo orbital de polvo estelar
 if(!reduced){
  ctx.save();
  ctx.translate(x,floatY);
  ctx.rotate(t*0.04+pearl.id);
  ctx.strokeStyle='rgba(255,235,170,0.7)';ctx.lineWidth=1;
  ctx.beginPath();ctx.ellipse(0,0,r*1.6,r*0.6,0,0,TAU);ctx.stroke();
  ctx.fillStyle='#ffe8a0';
  ctx.beginPath();ctx.arc(r*1.6,0,1.8,0,TAU);ctx.fill();
  ctx.restore();
 }

 ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// CORRIENTES ABISALES ASCENDENTES (géiseres gravitatorios sobre los pozos)
// ─────────────────────────────────────────────────────────────────────────────
export function drawCatUpdraft(ctx,updraft,cam,t=0,reduced=false){
 if(!ctx||!updraft)return;
 const x=updraft.x-cam.x,y=updraft.y-cam.y,w=updraft.w,h=updraft.h;
 const cx=x+w/2;
 ctx.save();

 // Haz de corriente translúcida ascendente
 const grad=ctx.createLinearGradient(cx,y+h,cx,y);
 grad.addColorStop(0,'rgba(122,240,224,0)');
 grad.addColorStop(0.3,'rgba(122,240,224,0.14)');
 grad.addColorStop(0.7,'rgba(180,140,255,0.16)');
 grad.addColorStop(1,'rgba(235,210,255,0)');
 ctx.fillStyle=grad;
 ctx.fillRect(x+6,y,w-12,h);

 // Líneas de corriente que fluyen hacia arriba
 if(!reduced){
  ctx.globalAlpha=0.45;
  for(let i=0;i<4;i++){
   const lx=x+15+i*(w/4)+Math.sin(t*0.05+i)*6;
   const lOffset=((t*1.2+i*35)%h);
   const ly=y+h-lOffset;
   ctx.strokeStyle=i%2===0?'#7af0e0':'#deb3ff';
   ctx.lineWidth=1.6;
   ctx.beginPath();
   ctx.moveTo(lx,ly);
   ctx.quadraticCurveTo(lx+Math.sin(ly*0.05)*8,ly-18,lx,ly-32);
   ctx.stroke();
  }

  // Burbujas ascendentes
  ctx.globalAlpha=0.6;
  for(let b=0;b<5;b++){
   const bAge=((t*0.9+b*47)%h);
   const bx=cx+Math.sin(bAge*0.06+b)*w*0.32;
   const by=y+h-bAge;
   ctx.fillStyle=b%2===0?'#7af0e0':'#fff5c0';
   ctx.beginPath();ctx.arc(bx,by,1.5+Math.sin(bAge*0.1)*0.6,0,TAU);ctx.fill();
  }
 }

 ctx.restore();
}

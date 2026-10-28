// Santuario del Trueno de Chispín: fauna voltaica, antenas sagradas y arcos de tormenta.
// Arte vectorial en Canvas de alta calidad (mismo nivel de acabado que Claro V606 y Astillero V607).
// Solo presentación: lee el estado real de combate y simulación sin tocar física ni daño.
const TAU=Math.PI*2,INK='#121020',GOLD='#ffd74a',CYAN='#67ddff',PURPLE='#b38cff';

function fill(c,color,draw,width=1.8){c.beginPath();draw();c.closePath();c.fillStyle=color;c.fill();if(width){c.strokeStyle=INK;c.lineWidth=width;c.stroke();}}
function stroke(c,color,width,draw){c.beginPath();draw();c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function ellipse(c,x,y,rx,ry,color,rotation=0,width=1.6){fill(c,color,()=>c.ellipse(x,y,rx,ry,rotation,0,TAU),width);}
function gradient(c,x,y,w,h,a,b,d){const g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,a);if(d)g.addColorStop(.5,b);g.addColorStop(1,d||b);return g;}
function roundRect(c,x,y,w,h,r=4){if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);}

function eye(c,x,y,r,aim=1,{hurt=false,angry=false,glow='#ffe066'}={}){
 if(hurt){stroke(c,INK,2,()=>{c.moveTo(x-r,y);c.lineTo(x+r,y);});return;}
 ellipse(c,x,y,r,r*1.05,'#fffceb',0,1.4);
 ellipse(c,x+aim*r*.22,y,r*.52,r*.68,glow,0,0);
 ellipse(c,x+aim*r*.26,y,r*.25,r*.44,'#100c1c',0,0);
 ellipse(c,x-r*.18,y-r*.3,r*.22,r*.22,'#ffffff',0,0);
 if(angry)stroke(c,INK,1.8,()=>{c.moveTo(x-r*1.1,y-r*1.1);c.lineTo(x+r,y-r*.6);});
}

// ─ Gaviota de tormenta (gaviota): planeador aéreo con plumas de rayo
function drawStormGull(c,s){
 const {time,step,wind,active,hurt,aim}=s;
 const flap=Math.sin(time*.28)*12;
 // Cola de abanico posterior
 fill(c,gradient(c,-24,-24,20,16,'#ffd74a','#cfc6e6','#8a80a8'),()=>{
  c.moveTo(-8,-16);c.lineTo(-24,-24);c.lineTo(-20,-10);c.lineTo(-26,-4);c.lineTo(-8,-10);
 },1.6);
 // Alas de tormenta articuladas con puntas de rayo doradas
 for(const side of [-1,1]){
  c.save();c.translate(side*3,-20);
  c.rotate(side*.3+flap*.04*side+(active?side*.25:0));
  fill(c,gradient(c,0,0,side*36,-18,'#ffffff','#d6cff2','#ffd74a'),()=>{
   c.moveTo(0,0);c.lineTo(side*22,-14);c.lineTo(side*38,-8);
   // Plumas de rayo dentadas
   c.lineTo(side*32,-2);c.lineTo(side*24,6);c.lineTo(side*12,8);c.lineTo(0,0);
  },2);
  stroke(c,GOLD,1.8,()=>{c.moveTo(side*12,-8);c.lineTo(side*36,-8);});
  c.restore();
 }
 // Cuerpo aerodinámico blanco/lavanda
 fill(c,gradient(c,-14,-32,28,26,'#ffffff','#e2ddf8','#9c90be'),()=>{
  c.moveTo(-12,-16);c.quadraticCurveTo(-14,-32,8,-28);c.quadraticCurveTo(18,-24,18,-14);c.quadraticCurveTo(8,-4,-12,-16);
 },2.2);
 // Pecho dorado eléctrico
 stroke(c,GOLD,2,()=>{c.moveTo(4,-24);c.lineTo(14,-16);c.lineTo(6,-8);});
 // Cabeza y pico depredador
 ellipse(c,14,-22,9,8,'#ffffff',0,1.8);
 eye(c,16,-24,4.2,aim,{hurt,angry:wind||active,glow:GOLD});
 fill(c,'#ffb028',()=>{
  c.moveTo(20,-24);c.lineTo(33,-20);c.lineTo(20,-16);
 },1.6);
 if(active)stroke(c,'#fff8aa',2.5,()=>{c.moveTo(33,-20);c.lineTo(44,-20);c.lineTo(39,-26);});
}

// ─ Murciélago voltaico (murcielago): saltador y planeador nocturno
function drawVoltBat(c,s){
 const {time,step,wind,active,hurt,aim}=s;
 const flap=Math.sin(time*.22)*10;
 // Alas de membrana con venas conductoras doradas
 for(const side of [-1,1]){
  c.save();c.translate(side*3,-18);
  c.rotate(side*(.2+flap*.035));
  fill(c,gradient(c,0,0,side*32,-16,'#553e78','#2c1e48','#140c26'),()=>{
   c.moveTo(0,0);c.lineTo(side*30,-16);c.quadraticCurveTo(side*24,6,side*17,9);c.quadraticCurveTo(side*10,5,0,0);
  },2);
  stroke(c,GOLD,1.6,()=>{c.moveTo(0,0);c.lineTo(side*24,-11);c.moveTo(0,0);c.lineTo(side*16,4);});
  ellipse(c,side*30,-16,2,2,GOLD,0,0);
  c.restore();
 }
 // Cuerpo peludo púrpura
 fill(c,gradient(c,-10,-28,20,24,'#8f70bd','#49346d','#1e1233'),()=>c.ellipse(0,-14,9,12,0,0,TAU),2.2);
 // Orejas de radar puntiagudas con aros dorados
 for(const side of [-1,1]){
  fill(c,'#63478c',()=>{c.moveTo(side*2,-23);c.lineTo(side*8,-38);c.lineTo(side*10,-21);},1.6);
  stroke(c,GOLD,1.4,()=>{c.moveTo(side*4,-25);c.lineTo(side*7,-34);});
 }
 eye(c,-4,-14,3.5,aim,{hurt,angry:wind,glow:'#ffe066'});
 eye(c,4,-14,3.5,aim,{hurt,angry:wind,glow:'#ffe066'});
 if(active)stroke(c,'#fff6aa',2.2,()=>{c.moveTo(-3,-6);c.lineTo(0,-2);c.lineTo(3,-6);});
}

// ─ Phosquito relámpago (phosquito): insectoide zumbador con aguja estática
function drawPlasmaGnat(c,s){
 const {time,wind,active,hurt,aim}=s;
 const buzz=Math.sin(time*.4)*8;
 // Cuatro alas vibrantes translúcidas
 for(const side of [-1,1]){
  c.save();c.translate(side*4,-22);c.rotate(side*.4+buzz*.05*side);
  fill(c,'rgba(255,235,130,0.5)',()=>{c.ellipse(side*13,-8,16,6,side*-.3,0,TAU);},1.3);
  stroke(c,'#ffffff',1,()=>{c.moveTo(0,0);c.lineTo(side*22,-10);});
  c.restore();
 }
 // Abdomen/bombilla de plasma dorado
 fill(c,gradient(c,-12,-24,24,22,'#fff8ba','#f5c038','#8f5c0c'),()=>c.ellipse(0,-13,11,13,0,0,TAU),2.2);
 stroke(c,GOLD,2,()=>c.ellipse(0,-13,14,6,buzz*.02,0,TAU));
 eye(c,aim*3,-15,4.5,aim,{hurt,angry:wind,glow:'#ffffff'});
 // Aguja estática de descarga
 stroke(c,'#4d3868',2.4,()=>{c.moveTo(0,-3);c.lineTo(-aim*4,7);});
 stroke(c,GOLD,active?3:1.8,()=>{c.moveTo(-aim*4,7);c.lineTo(-aim*8,14);});
 if(active)ellipse(c,-aim*8,14,2.5,2.5,'#ffffff',0,0);
}

// ─ Rana de trueno (rana): sapo acorazado con saco eléctrico inflable
function drawThunderToad(c,s){
 const {time,step,wind,active,hurt,aim}=s;
 const throat=(active||wind)?(Math.sin(time*.25)+1)*4:0;
 // Patas traseras musculosas plegadas
 for(const side of [-1,1]){
  fill(c,'#664b22',()=>{
   c.moveTo(side*10,-10);c.quadraticCurveTo(side*28,-22,side*24,-4);c.lineTo(side*14,-2);
  },2.2);
  ellipse(c,side*22,-3,6,3,'#4a3414',0,1.2);
 }
 // Caparazón / lomo broncíneo con glifos de trueno
 fill(c,gradient(c,-24,-34,48,32,'#e8b652','#8a5e1e','#382408'),()=>{
  c.moveTo(-22,-12);c.bezierCurveTo(-26,-36,26,-36,22,-12);c.quadraticCurveTo(0,-4,-22,-12);
 },2.4);
 stroke(c,GOLD,2,()=>{
  c.moveTo(-12,-22);c.lineTo(-4,-28);c.lineTo(4,-20);c.lineTo(12,-26);
 });
 // Saco gular inflable en el pecho
 fill(c,gradient(c,-12,-16,24,18+throat,'#fff099','#e5a82e','#70480a'),()=>{
  c.ellipse(0,-8,11+throat*.8,7+throat,0,0,TAU);
 },1.8);
 // Ojos saltones dorados
 ellipse(c,-10,-28,6,6,'#4a3414',0,1.8);
 ellipse(c,10,-28,6,6,'#4a3414',0,1.8);
 eye(c,-10,-28,4,aim,{hurt,angry:wind,glow:GOLD});
 eye(c,10,-28,4,aim,{hurt,angry:wind,glow:GOLD});
 if(active)stroke(c,'#fff8c0',2.5,()=>{c.moveTo(-16,-4);c.lineTo(0,4);c.lineTo(16,-4);});
}

// ─ Avispa voltaica (avispa): avispa veloz con aguijón electrificado
function drawSparkWasp(c,s){
 const {time,wind,active,hurt,aim}=s;
 const flap=Math.sin(time*.45)*9;
 // Alas aerodinámicas dobles
 for(const side of [-1,1]){
  c.save();c.translate(side*3,-22);c.rotate(side*.3+flap*.04*side);
  fill(c,'rgba(240,248,255,0.6)',()=>{c.ellipse(side*16,-8,19,5,side*-.2,0,TAU);},1.4);
  stroke(c,CYAN,1.2,()=>{c.moveTo(0,0);c.lineTo(side*26,-9);});
  c.restore();
 }
 // Abdomen cónico rayado con bandas de advertencia oro y obsidiana
 fill(c,gradient(c,-8,-28,16,28,'#ffd74a','#302244','#120a1c'),()=>{
  c.moveTo(-8,-22);c.lineTo(8,-22);c.lineTo(3,-2);c.lineTo(0,4);c.lineTo(-3,-2);
 },2.2);
 stroke(c,GOLD,2.2,()=>{c.moveTo(-7,-18);c.lineTo(7,-18);c.moveTo(-5,-10);c.lineTo(5,-10);});
 // Tórax y cabeza
 ellipse(c,0,-24,8,7,'#26183a',0,1.8);
 ellipse(c,0,-32,6,6,'#1a102b',0,1.8);
 eye(c,-3,-32,3,aim,{hurt,angry:wind,glow:GOLD});
 eye(c,3,-32,3,aim,{hurt,angry:wind,glow:GOLD});
 // Aguijón de descarga
 stroke(c,'#ffffff',2.4,()=>{c.moveTo(0,4);c.lineTo(-aim*2,12);});
 if(active)ellipse(c,-aim*2,12,3,3,CYAN,0,0);
}

const DRAW_MAP={
 gaviota:drawStormGull,
 murcielago:drawVoltBat,
 phosquito:drawPlasmaGnat,
 rana:drawThunderToad,
 avispa:drawSparkWasp
};

export function drawChispinCreature(c,e,cam,t,reduced=false){
 if(e.roomId!=='w1-chispin'||!e.roomPersona?.chispinEncounter||e.boss||e.miniBoss)return false;
 const drawFn=DRAW_MAP[e.kind];
 if(!drawFn)return false;
 const a=e._campaign||{},time=reduced?0:t,phase=time*.19+(e.spawnIndex||0),run=Math.abs(e.vx||0)>.4;
 const wind=(a.wind||0)>0,active=(a.active||0)>0,hurt=e.invuln>0||e.stun>5;
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

 if(wind){c.translate(-aim*2,2);c.scale(1.05,.95);}
 else if(active)c.rotate(aim*.08);
 else if(hurt)c.rotate(-aim*.14);

 drawFn(c,{time,step,wind,active,hurt,aim});

 c.restore();
 return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// PARARRAYOS / ANTENAS SAGRADAS DE LA TORMENTA
// ─────────────────────────────────────────────────────────────────────────────

const ROD_TITLES=[
 'ANTENA I · PARARRAYOS DEL UMBRAL',
 'ANTENA II · BOBINA DE LAS NUBES',
 'ANTENA III · CONDUCTOR DE TORMENTA',
 'ANTENA IV · CÚSPIDE DEL ARCOÍRIS'
];

export function drawChispinRod(c,s,cam,t=0,reduced=false){
 const x=s.x-cam.x,y=s.y-cam.y,done=!!s.done,time=reduced?0:t;
 const id=Number(s.id)||0,title=ROD_TITLES[id%ROD_TITLES.length];

 c.save();
 c.lineJoin='round';c.lineCap='round';

 // 1. Pedestal de mármol clásico del Santuario
 fill(c,gradient(c,x-48,y-24,96,24,'#f2ecdb','#c5bba6','#827763'),()=>{
  c.moveTo(x-46,y);c.lineTo(x-38,y-24);c.lineTo(x+38,y-24);c.lineTo(x+46,y);
 },2.4);
 // Placa de bronce y pernos de tierra
 fill(c,'#b57b3e',()=>{c.rect(x-32,y-18,64,6);},1.2);
 stroke(c,INK,1.4,()=>{
  for(let k=-24;k<=24;k+=12){c.moveTo(x+k,y-18);c.lineTo(x+k+4,y-12);}
 });

 // 2. Fuste acanalado con anillos aisladores de cerámica
 fill(c,gradient(c,x-16,y-104,32,80,'#f7e28b','#d49b39','#6e4a12'),()=>{
  roundRect(c,x-14,y-100,28,78,4);
 },2.2);

 // Anillos aisladores cerámicos de alta tensión
 for(let k=0;k<5;k++){
  const ry=y-34-k*14;
  fill(c,k%2?'#ffffff':'#384c68',()=>c.ellipse(x,ry,18,5,0,0,TAU),1.6);
  stroke(c,done?GOLD:'#e8c878',1.4,()=>c.ellipse(x,ry,18,5,0,0,TAU));
 }

 // 3. Corona del pararrayos: esfera electrostática y horquilla de rayos
 const crownY=y-112;
 // Horquilla dorada
 fill(c,'#f5c242',()=>{
  c.moveTo(x-24,crownY-26);c.lineTo(x-18,crownY);c.lineTo(x+18,crownY);c.lineTo(x+24,crownY-26);
  c.lineTo(x+18,crownY-22);c.lineTo(x+12,crownY-4);c.lineTo(x-12,crownY-4);c.lineTo(x-18,crownY-22);
 },2);

 // Esfera giratoria de plasma
 const spin=time*0.12;
 fill(c,done?'#ffffff':(time%6<3?'#ffe878':'#d6a030'),()=>c.ellipse(x,crownY-14,9,9,0,0,TAU),1.6);
 if(done){
  ellipse(c,x,crownY-14,14,14,'rgba(255,215,74,0.45)',0,0);
  // Anillo de rotación
  stroke(c,CYAN,1.6,()=>c.ellipse(x,crownY-14,16,6,spin,0,TAU));
 }

 // Aguja central al cielo
 stroke(c,INK,3.5,()=>{c.moveTo(x,crownY-4);c.lineTo(x,crownY-42);});
 stroke(c,done?'#ffffff':GOLD,2.4,()=>{c.moveTo(x,crownY-4);c.lineTo(x,crownY-42);});
 ellipse(c,x,crownY-44,3,3,done?CYAN:GOLD,0,1);

 // 4. Si está conectada: columna de haz celestial hacia las nubes + ondas expansivas
 if(done&&!reduced){
  c.save();
  // Haz central ascendente
  const beam=c.createLinearGradient(x,crownY-44,x,crownY-220);
  beam.addColorStop(0,'rgba(255,255,255,0.9)');
  beam.addColorStop(0.3,'rgba(255,225,90,0.7)');
  beam.addColorStop(1,'rgba(103,221,255,0)');
  c.fillStyle=beam;
  c.fillRect(x-5,crownY-220,10,176);

  // Arcos de radiofrecuencia hacia la atmósfera
  for(let i=0;i<3;i++){
   const pulse=(time*0.06+i*0.33)%1,rad=20+pulse*48,alpha=1-pulse;
   c.strokeStyle='rgba(255,215,74,'+alpha+')';c.lineWidth=2;
   c.beginPath();c.arc(x,crownY-44,rad,-Math.PI*.85,-Math.PI*.15);c.stroke();
  }
  c.restore();
 }

 // 5. Cartel flotante / Diagnóstico de la Antena
 const tagY=y-156;
 fill(c,done?'rgba(16,36,44,0.92)':'rgba(24,20,38,0.92)',()=>{
  roundRect(c,x-105,tagY-22,210,38,6);
 },2);
 stroke(c,done?'#68f0b0':GOLD,1.8,()=>{
  roundRect(c,x-105,tagY-22,210,38,6);
 });

 c.textAlign='center';
 c.font='900 11px Outfit, sans-serif';
 c.fillStyle=done?'#a8ffdc':'#fff3b0';
 c.fillText(title,x,tagY-6);

 c.font='800 10px Outfit, sans-serif';
 if(done){
  c.fillStyle='#68f0b0';
  c.fillText('ANTENA SINCRONIZADA ✓ · RED ACTIVA',x,tagY+9);
 }else{
  c.fillStyle='#ffd74a';
  c.fillText('CONTACTO O PULSA J PARA CONECTAR',x,tagY+9);
 }

 c.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// ARCOS ELÉCTRICOS DE TORMENTA (TESLA GATES)
// ─────────────────────────────────────────────────────────────────────────────

export function drawChispinArcGate(c,gate,state,cam,t=0,reduced=false){
 const x=gate.x-cam.x,y=gate.y-cam.y,w=gate.w,h=gate.h,time=reduced?0:t;

 c.save();
 c.lineJoin='round';c.lineCap='round';

 // 1. Monolitos de granito y bronce a izquierda y derecha
 for(const side of [0,w]){
  const px=x+side;
  fill(c,gradient(c,px-12,y-h,24,h,'#36324d','#1a152e','#0d0a17'),()=>{
   roundRect(c,px-11,y-h,22,h,4);
  },2.4);

  // Aisladores cerámicos de porcelana en los pilares
  for(let k=1;k<=4;k++){
   const py=y-h*k/5;
   fill(c,'#ffd74a',()=>c.ellipse(px,py,12,4,0,0,TAU),1.2);
  }

  // Cúpula superior con baliza de advertencia
  const beaconColor=state==='active'?'#ff4d5a':state==='warn'?'#ffb038':state==='silenced'?'#67ddff':'#5aff9e';
  ellipse(c,px,y-h-8,7,7,beaconColor,0,1.8);
  ellipse(c,px,y-h-8,3,3,'#ffffff',0,0);
 }

 // 2. Viga/Conductor superior entre los dos monolitos
 fill(c,'#261f38',()=>{c.rect(x-8,y-h-4,w+16,8);},1.8);
 stroke(c,GOLD,1.5,()=>{c.moveTo(x-6,y-h);c.lineTo(x+w+6,y-h);});

 // 3. Descarga de plasma / Arco eléctrico central según el estado
 if(state==='active'){
  // Arco eléctrico letal activo
  const count=reduced?3:5;
  for(let k=1;k<=count;k++){
   const baseH=h*k/(count+1);
   stroke(c,'#ffffff',3,()=>{
    c.moveTo(x,y-baseH);
    for(let step=1;step<=3;step++){
     const jx=x+w*step/4,jy=y-baseH+(Math.sin(time*0.5+k*3+step*2)*14);
     c.lineTo(jx,jy);
    }
    c.lineTo(x+w,y-baseH);
   });
   stroke(c,GOLD,1.6,()=>{
    c.moveTo(x,y-baseH);
    for(let step=1;step<=3;step++){
     const jx=x+w*step/4,jy=y-baseH-(Math.cos(time*0.6+k*2+step)*12);
     c.lineTo(jx,jy);
    }
    c.lineTo(x+w,y-baseH);
   });
  }
 }else if(state==='warn'){
  // Filamentos de pre-aviso
  stroke(c,'#ff9c38',2,()=>{
   c.moveTo(x,y-h*0.5);
   c.quadraticCurveTo(x+w/2,y-h*0.5+Math.sin(time*0.4)*12,x+w,y-h*0.5);
  });
 }else if(state==='silenced'){
  // Chispas residuales cortocircuitadas
  if(!reduced){
   for(let k=0;k<3;k++){
    const sx=x+w*0.25+k*w*0.25,sy=y-h*0.4+Math.sin(time*0.3+k)*10;
    stroke(c,CYAN,1.8,()=>{c.moveTo(sx-4,sy);c.lineTo(sx+4,sy);});
   }
  }
 }

 // 4. Panel holográfico informativo superior
 const tagY=y-h-62;
 fill(c,state==='active'?'rgba(44,12,18,0.92)':state==='warn'?'rgba(44,28,10,0.92)':state==='silenced'?'rgba(12,32,46,0.92)':'rgba(12,38,24,0.92)',()=>{
  roundRect(c,x+w/2-115,tagY-20,230,36,6);
 },2);

 const borderColor=state==='active'?'#ff4d5a':state==='warn'?'#ffb038':state==='silenced'?CYAN:'#5aff9e';
 stroke(c,borderColor,1.8,()=>{
  roundRect(c,x+w/2-115,tagY-20,230,36,6);
 });

 c.textAlign='center';
 c.font='900 11px Outfit, sans-serif';
 c.fillStyle=state==='active'?'#ff949c':state==='warn'?'#ffe294':state==='silenced'?'#a4eeff':'#b2ffcc';
 c.fillText(
  state==='active'?'¡PELIGRO · ARCO ELÉCTRICO ACTIVO!':
  state==='warn'?'AVISO · EL ARCO VA A CERRARSE':
  state==='silenced'?'ARCO CORTOCIRCUITADO CON J':
  'PASO ABIERTO · CIRCUITO LIBRE',
  x+w/2,tagY-5
 );

 c.font='800 10px Outfit, sans-serif';
 c.fillStyle='#ffffff';
 c.fillText('PULSA J PARA CORTAR · K PARA CRUZAR EN RAYO',x+w/2,tagY+9);

 c.restore();
}

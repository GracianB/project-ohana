// Astillero de Stitcho: criaturas del astillero, drones mecánicos y fauna bio-alienígena.
// Arte vectorial en Canvas de alta calidad (mismo nivel de acabado que Claro de Kilo V606).
// Solo presentación: lee el estado real de combate (wind, active, hurt, aim) sin tocar física.
const TAU=Math.PI*2,INK='#122332',CYAN='#67ddff',PURPLE='#b38cff';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));

function fill(c,color,draw,width=1.8){c.beginPath();draw();c.closePath();c.fillStyle=color;c.fill();if(width){c.strokeStyle=INK;c.lineWidth=width;c.stroke();}}
function stroke(c,color,width,draw){c.beginPath();draw();c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function ellipse(c,x,y,rx,ry,color,rotation=0,width=1.6){fill(c,color,()=>c.ellipse(x,y,rx,ry,rotation,0,TAU),width);}
function gradient(c,x,y,w,h,a,b,d){const g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,a);if(d)g.addColorStop(.5,b);g.addColorStop(1,d||b);return g;}

function eye(c,x,y,r,aim=1,{hurt=false,angry=false,glow='#67ddff'}={}){
 if(hurt){stroke(c,INK,2,()=>{c.moveTo(x-r,y);c.lineTo(x+r,y);});return;}
 ellipse(c,x,y,r,r*1.05,'#fff9e6',0,1.4);
 ellipse(c,x+aim*r*.22,y,r*.52,r*.68,glow,0,0);
 ellipse(c,x+aim*r*.26,y,r*.25,r*.44,'#091a28',0,0);
 ellipse(c,x-r*.18,y-r*.3,r*.22,r*.22,'#ffffff',0,0);
 if(angry)stroke(c,INK,1.8,()=>{c.moveTo(x-r*1.1,y-r*1.1);c.lineTo(x+r,y-r*.6);});
}

function limb(c,x,y,ex,ey,tx,ty,col,w=3.2){
 stroke(c,INK,w+2.8,()=>{c.moveTo(x,y);c.quadraticCurveTo(ex,ey,tx,ty);});
 stroke(c,col,w,()=>{c.moveTo(x,y);c.quadraticCurveTo(ex,ey,tx,ty);});
}

// ─ Escarabajo del muelle (cucaracho): blindaje cobalto con circuitos cian
function drawScrapBeetle(c,s){
 const {step,wind,active,hurt,aim}=s;
 for(const side of [-1,1])for(let k=0;k<3;k++){
  const a=step*(k%2?-1:1)*3.5,x=side*(10+k*5),yy=-18+k*5;
  limb(c,x,yy,side*(24+k*3),yy+4-a,side*(29+k*4),-1+Math.abs(a)*2.5,'#2c5670',3.2);
 }
 // Caparazón cobalto segmentado con brillo metálico
 fill(c,gradient(c,-24,-48,48,42,'#85d5f2','#367399','#1c3b52'),()=>{
  c.moveTo(-22,-26);c.bezierCurveTo(-28,-48,22,-50,26,-27);c.quadraticCurveTo(24,-8,0,-6);c.quadraticCurveTo(-20,-8,-22,-26);
 },2.4);
 // Placas y circuitos de chatarra luminosa
 stroke(c,CYAN,1.5,()=>{c.moveTo(-16,-34);c.lineTo(-4,-42);c.lineTo(8,-36);c.lineTo(18,-40);});
 stroke(c,'#a9efff',1,()=>{c.moveTo(-12,-24);c.lineTo(0,-29);c.lineTo(14,-22);});
 // Cabeza y mandíbulas
 ellipse(c,14,-28,11,11,'#2c5670',0,2);
 eye(c,15,-30,5,aim,{hurt,angry:wind,glow:CYAN});
 for(const side of [-1,1]){
  stroke(c,INK,2,()=>{c.moveTo(17,-36);c.quadraticCurveTo(24+side*3,-46-(wind?4:0),28+side*4,-42);});
  ellipse(c,28+side*4,-42,2,2,CYAN,0,1);
 }
 if(active)stroke(c,'#e0f8ff',2.5,()=>{c.moveTo(-18,-46);c.quadraticCurveTo(0,-56,20,-46);});
}

// ─ Tejedora de cables (arana): cuerpo bio-mecánico, 8 patas de cable
function drawCableSpider(c,s){
 const {step,wind,active,hurt,aim}=s;
 for(const side of [-1,1])for(let k=0;k<4;k++){
  const stride=step*(k%2?-1:1)*3,bx=side*(6+k*4),by=-14+k*2;
  const kx=bx+side*(14+k*3)+stride,ky=-26-(side<0?2:0);
  const fx=bx+side*(24+k*4)+stride*1.2,fy=-1-Math.max(0,-stride);
  limb(c,bx,by,kx,ky,fx,fy,k%2?'#3a6b88':'#224760',2.8);
 }
 // Abdomen alienígena púrpura/cobalto
 fill(c,gradient(c,-20,-38,40,32,'#cfa6ff','#6b42a6','#281845'),()=>{
  c.moveTo(-18,-22);c.bezierCurveTo(-26,-38,-8,-44,0,-36);c.bezierCurveTo(8,-44,26,-38,18,-22);c.quadraticCurveTo(0,-12,-18,-22);
 },2.2);
 // Marcas luminosas de cruz
 stroke(c,PURPLE,2,()=>{c.moveTo(0,-38);c.lineTo(0,-16);c.moveTo(-10,-27);c.lineTo(10,-27);});
 // Cefalotórax y múltiples ojos
 ellipse(c,4,-18,9,8,'#1c3850',0,1.8);
 eye(c,6,-20,3.5,aim,{hurt,angry:wind,glow:'#ff9ce6'});
 eye(c,2,-18,2.5,aim,{hurt,angry:wind,glow:'#7ae7ff'});
 if(active)stroke(c,'#ffbded',2,()=>{c.moveTo(8,-12);c.lineTo(14,-6);c.moveTo(2,-12);c.lineTo(-2,-6);});
}

// ─ Chispa del astillero (phosquito): dron insectoide de plasma
function drawPlasmaFlyer(c,s){
 const {time,wind,active,hurt,aim}=s;
 const flap=Math.sin(time*.35)*9;
 // Alas translúcidas bio-eléctricas
 for(const side of [-1,1]){
  c.save();c.translate(side*4,-24);c.rotate(side*.4+flap*.04*side);
  fill(c,'rgba(103,221,255,0.45)',()=>{c.ellipse(side*12,-6,16,6,side*-.3,0,TAU);},1.3);
  stroke(c,'#cff5ff',1.2,()=>{c.moveTo(0,0);c.lineTo(side*22,-8);});
  c.restore();
 }
 // Núcleo esférico de plasma con contenedor
 fill(c,gradient(c,-12,-26,24,24,'#d8f8ff','#58cce8','#144b68'),()=>c.ellipse(0,-14,11,13,0,0,TAU),2.2);
 // Anillo orbital de energía
 stroke(c,CYAN,2,()=>c.ellipse(0,-14,15,6,flap*.02,0,TAU));
 eye(c,aim*3,-15,4.5,aim,{hurt,angry:wind,glow:'#fff8aa'});
 // Aguijón de descarga
 stroke(c,'#345c75',2.5,()=>{c.moveTo(0,-3);c.lineTo(-aim*4,6);});
 stroke(c,CYAN,active?3:1.5,()=>{c.moveTo(-aim*4,6);c.lineTo(-aim*8,12);});
}

// ─ Dron de inspección (ufo): vigilante esférico con lente escáner
function drawUfoDrone(c,s){
 const {time,wind,active,hurt,aim}=s;
 const bob=Math.sin(time*.12)*3;
 c.translate(0,bob);
 // Disco exterior metálico
 fill(c,gradient(c,-24,-30,48,26,'#7ecbee','#346582','#183548'),()=>{
  c.ellipse(0,-16,23,9,0,0,TAU);
 },2.4);
 // Cúpula superior de vidrio
 fill(c,gradient(c,-12,-36,24,20,'#d5f6ff','#62bde0','#246884'),()=>{
  c.arc(0,-18,12,Math.PI,0);
 },1.8);
 // Luces perimetrales
 for(let i=-2;i<=2;i++){
  const lx=i*8,ly=-14+Math.abs(i)*1.5;
  ellipse(c,lx,ly,2,2,(time*4+i)%5<2?CYAN:'#1a3e54',0,0.8);
 }
 // Gran ojo/lente escáner central
 eye(c,aim*4,-17,5.5,aim,{hurt,angry:wind,glow:active?'#ff5975':CYAN});
 // Antena superior
 stroke(c,'#2c546e',2,()=>{c.moveTo(0,-30);c.lineTo(0,-38);});
 ellipse(c,0,-39,2.5,2.5,wind?'#ffdd77':CYAN,0,1);
}

// ─ Vigía nocturno (murcielago): murciélago alienígena con alas de radar
function drawAcrobatBat(c,s){
 const {time,step,wind,active,hurt,aim}=s;
 const flap=Math.sin(time*.2)*12;
 // Alas membranosas con nervaduras cian
 for(const side of [-1,1]){
  c.save();c.translate(side*3,-18);
  const rot=side*(.25+flap*.035);
  c.rotate(rot);
  fill(c,'#241a38',()=>{
   c.moveTo(0,0);c.lineTo(side*28,-14);c.quadraticCurveTo(side*22,4,side*16,8);c.quadraticCurveTo(side*10,5,0,0);
  },2);
  stroke(c,PURPLE,1.4,()=>{c.moveTo(0,0);c.lineTo(side*20,-10);c.moveTo(0,0);c.lineTo(side*14,4);});
  c.restore();
 }
 // Cuerpo y orejas de radar puntiagudas
 fill(c,gradient(c,-10,-28,20,24,'#826aa8','#42335e','#1d1430'),()=>c.ellipse(0,-14,8,11,0,0,TAU),2);
 for(const side of [-1,1]){
  fill(c,'#4f3875',()=>{c.moveTo(side*2,-22);c.lineTo(side*7,-35);c.lineTo(side*8,-20);},1.4);
  stroke(c,CYAN,1,()=>{c.moveTo(side*4,-24);c.lineTo(side*6,-31);});
 }
 eye(c,-3,-14,3,aim,{hurt,angry:wind,glow:'#ffd080'});
 eye(c,3,-14,3,aim,{hurt,angry:wind,glow:'#ffd080'});
 if(active)stroke(c,'#fff0aa',2,()=>{c.moveTo(-3,-8);c.lineTo(0,-5);c.lineTo(3,-8);});
}

const DRAW_MAP={
 cucaracho:drawScrapBeetle,
 arana:drawCableSpider,
 phosquito:drawPlasmaFlyer,
 ufo:drawUfoDrone,
 murcielago:drawAcrobatBat
};

export function drawStitchoCreature(c,e,cam,t,reduced=false){
 if(e.roomId!=='w1-stitcho'||!e.roomPersona?.stitchoEncounter||e.boss||e.miniBoss)return false;
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

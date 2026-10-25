import {drawCraftedScene} from './ohana-crafted-scenes.js';
// Authored environment vocabulary. Geometry is decorative: collision belongs
// to the room layout and never changes because a scene happens to be drawn.
export const OHANA_PLACES=Object.freeze({
 kilo:{name:'Bahía de los hibiscos',sky:'#b7ded8',far:'#679d92',mid:'#3c756c',light:'#ffe4a0',ink:'#244b49',kind:'cove',offset:430,steps:[0,80,0],strategy:'Las flores son pausas seguras: despeja al enemigo cercano antes de detenerte a tocar. Usa las repisas para atacar desde arriba.'},
 stitcho:{name:'Astillero de las estrellas',sky:'#13233c',far:'#1b3856',mid:'#315e77',light:'#a6f0ee',ink:'#112d43',kind:'dock',offset:500,steps:[0,80,160],strategy:'Lleva una pieza cada vez. La ruta baja es directa; las grúas y plataformas permiten evitar a los perseguidores durante el transporte.'},
 chispin:{name:'Templo de las nubes',sky:'#b8dff3',far:'#728cb1',mid:'#adbed0',light:'#ffecad',ink:'#334560',kind:'storm',offset:530,steps:[80,0,80],strategy:'Conecta la antena más próxima y conserva esa posición como avance. Ataca a los voladores desde una repisa antes de cruzar a la siguiente.'},
 cat:{name:'Laguna de la luna',sky:'#30264f',far:'#67547e',mid:'#8d78a0',light:'#ffe9c8',ink:'#322c51',kind:'moon',offset:390,steps:[0,80,160],strategy:'Despierta las medusas con saltos cortos y corrige en el aire. Las plataformas del estanque dan altura sin exigir una forma avanzada.'},
 cuerno:{name:'Bosque de las auroras',sky:'#1f414d',far:'#3b7778',mid:'#669d8d',light:'#f0d8ff',ink:'#203e4b',kind:'forest',offset:450,steps:[0,80,80],strategy:'Sigue los prismas I, II y III. El recorrido superior sirve para explorar; la ruta del suelo permite completar el orden sin dar vueltas.'},
 dragon:{name:'Forja del amanecer',sky:'#442b3b',far:'#88504b',mid:'#bd7153',light:'#ffcd91',ink:'#402b35',kind:'forge',offset:510,steps:[0,160,80],strategy:'Enciende los braseros desde una distancia segura. Las terrazas permiten separar enemigos antes de bajar a por cada fuego.'},
 dino:{name:'Cañón de los gigantes',sky:'#c3b18b',far:'#8e856c',mid:'#b29b74',light:'#f3e5b5',ink:'#4c5347',kind:'canyon',offset:450,steps:[0,80,0],strategy:'Gana altura y cae sobre las placas fósiles. Usa los escalones del cañón para preparar el aterrizaje y evita caer entre varios enemigos.'},
 frita:{name:'Mercado de los vientos',sky:'#d4b68b',far:'#a47b66',mid:'#c79869',light:'#ffe5a2',ink:'#654d44',kind:'market',offset:1050,steps:[0,80,0],strategy:'Pisa el géiser y corrige hacia la patata durante el vuelo. Su columna queda libre; las rutas de mercado son alternativas para buscar recuerdos.'},
 pizza:{name:'Puerto de los hornos',sky:'#bb98a4',far:'#805c76',mid:'#b88078',light:'#ffe0a3',ink:'#523c55',kind:'oven',offset:470,steps:[0,0,80],strategy:'Con pizza caliente, prioriza la ruta del suelo y el cliente pendiente más cercano. Explora los tejados entre entregas para no gastar calor.'},
 yomi:{name:'Observatorio de las mareas',sky:'#182e4d',far:'#355570',mid:'#537d91',light:'#c8edee',ink:'#162d46',kind:'astral',offset:560,steps:[80,0,160],strategy:'Espera junto al terminal a que aparezca AHORA. Las repisas ofrecen cobertura frente a disparos y una ruta hacia los recuerdos altos.'}
});
const TAU=Math.PI*2;
function oval(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();}
function stroke(c,points,color,width=3){c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
function shape(c,points,color){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
function tree(c,x,y,p,conifer=false){
 c.fillStyle=p.ink;c.fillRect(x-5,y-110,10,110);
 if(conifer){for(let n=0;n<3;n++)shape(c,[[x,y-190+n*38],[x+48-n*7,y-100+n*32],[x-48+n*7,y-100+n*32]],p.mid);}
 else{stroke(c,[[x,y-100],[x+12,y-175]],p.ink,9);for(const side of [-1,1])for(let n=0;n<3;n++)shape(c,[[x+12,y-175],[x+side*(52+n*15),y-155+n*17],[x+side*33,y-182+n*13]],p.mid);}
}
function pavilion(c,x,y,p,kind,t){
 if(kind==='cove'||kind==='forest'){tree(c,x-65,y,p,kind==='forest');tree(c,x+100,y-4,p,kind==='forest');
  if(kind==='cove'){c.fillStyle=p.mid;c.fillRect(x-35,y-105,92,88);shape(c,[[x-52,y-106],[x+12,y-151],[x+74,y-106]],p.light);c.fillStyle=p.ink;c.fillRect(x,y-67,24,50);}
  else for(let i=0;i<3;i++)shape(c,[[x+i*25,y-50-i*12],[x+i*25+15,y-8],[x+i*25-9,y-8]],['#d5a7db','#a8d6bd',p.light][i]);
 }else if(kind==='dock'){
  stroke(c,[[x-85,y],[x-85,y-190],[x+75,y-190],[x+75,y]],p.mid,14);
  stroke(c,[[x-85,y-190],[x+75,y-140],[x-85,y-100]],p.light,2);
  const bob=Math.sin(t*.02)*4;stroke(c,[[x+20,y-190],[x+20,y-95+bob]],p.light,2);
  oval(c,x+20,y-77+bob,47,12,p.mid);oval(c,x+20,y-88+bob,25,18,p.light);
 }else if(kind==='storm'){
  for(const side of [-1,1]){c.fillStyle=p.mid;c.fillRect(x+side*68-9,y-130,18,130);shape(c,[[x+side*68-25,y-130],[x+side*68,y-161],[x+side*68+25,y-130]],p.light);}
  stroke(c,[[x-69,y-130],[x,y-155],[x+69,y-130]],p.light,6);
  oval(c,x,y-171,12,12,p.light);
 }else if(kind==='moon'){
  oval(c,x,y-12,110,15,p.mid);oval(c,x,y-15,83,10,p.far);
  for(let i=-1;i<=1;i++){stroke(c,[[x+i*40,y-15],[x+i*40,y-65]],p.mid,3);oval(c,x+i*40,y-68,17,8,p.light);}
  c.strokeStyle=p.light;c.lineWidth=5;c.beginPath();c.arc(x+65,y-138,27,.2,Math.PI*1.75);c.stroke();
 }else if(kind==='forge'){
  shape(c,[[x-100,y],[x-60,y-90],[x+20,y-110],[x+96,y]],p.ink);
  shape(c,[[x-26,y-46],[x,y-95],[x+25,y-46]],p.light);
  stroke(c,[[x-65,y-10],[x-30,y-26],[x+20,y-12],[x+66,y-23]],'#ffb378',3);
  for(let i=0;i<3;i++)oval(c,x+i*18-18,y-130-i*27,12+i*4,18+i*2,p.far);
 }else if(kind==='canyon'){
  for(let i=0;i<4;i++){c.strokeStyle=p.light;c.lineWidth=9;c.beginPath();c.ellipse(x-55+i*34,y-8,24,78-i*9,-.1,Math.PI,TAU);c.stroke();}
  oval(c,x+65,y-9,43,18,p.mid);
 }else if(kind==='market'){
  c.fillStyle=p.mid;c.fillRect(x-62,y-84,124,84);c.fillStyle=p.ink;c.fillRect(x-72,y-104,144,20);
  for(let i=0;i<6;i++){c.fillStyle=i%2?p.light:'#bd7160';c.fillRect(x-72+i*24,y-104,24,31);}
  for(let i=0;i<4;i++)oval(c,x-40+i*26,y-49,10,12,p.light);
 }else if(kind==='oven'){
  c.fillStyle=p.mid;c.beginPath();c.arc(x,y-12,83,Math.PI,TAU);c.lineTo(x+83,y);c.lineTo(x-83,y);c.fill();
  c.fillStyle=p.ink;c.beginPath();c.arc(x,y-5,34,Math.PI,TAU);c.lineTo(x+34,y);c.lineTo(x-34,y);c.fill();
  c.fillStyle=p.light;c.fillRect(x-17,y-17,34,4);c.fillStyle=p.mid;c.fillRect(x+44,y-151,22,76);
 }else if(kind==='astral'){
  c.fillStyle=p.mid;c.fillRect(x-65,y-85,130,85);c.beginPath();c.arc(x,y-85,65,Math.PI,TAU);c.fill();
  stroke(c,[[x-10,y-146],[x+36,y-189],[x+72,y-176]],p.light,7);
  for(let i=-1;i<=1;i++){c.fillStyle=p.light;c.fillRect(x+i*36-7,y-62,14,28);}
 }
}
export function drawOhanaPlace(c,g,cam,t,W,H){
 if(drawCraftedScene(c,g,cam,t,W,H))return;
 const p=OHANA_PLACES[g.roomDef?.hero];if(!p)return;
 const ground=1134-(cam.y||0),time=g.reduceMotion?0:t;
 c.save();
 // Long silhouettes and a calm middle plane establish distance without hiding play.
 c.globalAlpha=.55;
 const offset=(cam.x||0)*.15;
 for(let i=Math.floor(offset/700)-1;i<Math.floor((offset+W)/700)+2;i++){
  const x=i*700-offset;
  if(p.kind==='cove'){
   c.fillStyle=p.far;c.beginPath();c.moveTo(x,H*.75);c.bezierCurveTo(x+80,H*.28,x+270,H*.25,x+390,H*.62);c.bezierCurveTo(x+520,H*.35,x+670,H*.4,x+760,H*.75);c.fill();
  }else shape(c,[[x,H*.65],[x+210,H*.26],[x+360,H*.47],[x+540,H*.22],[x+760,H*.65]],p.far);
 }
 c.globalAlpha=.18;c.fillStyle=p.sky;c.fillRect(0,0,W,H);c.globalAlpha=1;
 // Places are beside the route, with a low-contrast empty combat lane in front.
 const start=Math.floor((cam.x||0)/1450);
 for(let i=start;i<=start+Math.ceil(W/1450)+1;i++){
  const x=i*1450+750-(cam.x||0);if(x<-200||x>W+220)continue;
  c.save();c.globalAlpha=.64;pavilion(c,x,ground,p,p.kind,time+i*17);c.restore();
 }
 if(p.kind==='cove'){
  // A garden promenade leads into a wooden music stage at the final encounter.
  c.globalAlpha=.45;
  for(let worldX=Math.floor((cam.x||0)/210)*210;worldX<(cam.x||0)+W+210;worldX+=210){
   const x=worldX-(cam.x||0);stroke(c,[[x,ground-2],[x+4,ground-26]],'#538c76',3);
   for(let j=0;j<5;j++)oval(c,x+4+Math.cos(j*TAU/5)*6,ground-28+Math.sin(j*TAU/5)*6,5,4,'#e4a1a5');
   oval(c,x+4,ground-28,3,3,'#ffe4a0');
  }
  const stage=8750-(cam.x||0);
  if(stage>-600&&stage<W+600){
   c.globalAlpha=.65;c.fillStyle='#6f655a';c.fillRect(stage-330,ground-8,660,8);
   stroke(c,[[stage-300,ground],[stage-300,ground-240],[stage+300,ground-240],[stage+300,ground]],'#718c7b',12);
   stroke(c,[[stage-300,ground-240],[stage,ground-200],[stage+300,ground-240]],'#edce97',3);
   for(let j=0;j<9;j++)oval(c,stage-270+j*67.5,ground-235+Math.sin(j/8*Math.PI)*32,6,9,j%2?'#e3b5ad':'#e4d1a3');
  }
 }
 // Wind/steam/fireflies are sparse and never solid collision objects.
 c.globalAlpha=.5;
 for(let i=0;i<12;i++){
  const x=((i*173+time*.16-(cam.x||0)*.25)%Math.max(1,W+60)+W+60)%(W+60)-30;
  const y=H*.35+(i%4)*H*.12+Math.sin(time*.015+i)*6;
  oval(c,x,y,2,2,p.light);
 }
 c.restore();
}
export function drawHarborWelcome(c,W,H,t=0,reduce=false){
 const time=reduce?0:t;
 c.fillStyle='#e5d4af';c.fillRect(0,0,W,H);
 c.fillStyle='#b5d9d3';c.fillRect(0,H*.29,W,H*.71);
 oval(c,W*.79,H*.2,Math.min(W,H)*.13,Math.min(W,H)*.13,'#fff3c9');
 // Layered coastal islands, warm sky and a connected boardwalk.
 for(let layer=0;layer<3;layer++){
  c.fillStyle=['#8eb8ac','#61958a','#376f68'][layer];
  c.beginPath();c.moveTo(0,H);
  for(let x=0;x<=W+40;x+=40)c.lineTo(x,H*(.35+layer*.15)+Math.sin(x/W*8+layer*1.8)*H*.035);
  c.lineTo(W,H);c.fill();
 }
 c.globalAlpha=.3;c.strokeStyle='#fff3d5';c.lineWidth=1.5;
 for(let i=0;i<11;i++){const y=H*.42+i*H*.05,x=(Math.sin(time*.005+i)*10);stroke(c,[[W*.08+x,y],[W*.23+x,y]],'#fff3d5',1.5);}
 c.globalAlpha=1;
 const p={ink:'#315b55',mid:'#4f8c74',light:'#f5d5a0'};
 tree(c,W*.035,H*.9,p);tree(c,W*.97,H*.88,p);
 for(let i=0;i<5;i++){const x=W*(.12+i*.19),y=H*.78+Math.sin(i)*H*.03;oval(c,x,y,W*.075,H*.025,'#cfb283');}
 stroke(c,[[W*.12,H*.79],[W*.33,H*.77],[W*.52,H*.8],[W*.72,H*.77],[W*.9,H*.8]],'#b49571',7);
 for(let i=0;i<7;i++){const x=W*(.18+i*.11),y=H*.27+Math.sin(time*.02+i)*3;stroke(c,[[x-6,y],[x,y-3],[x+6,y]],'#467c78',1.5);}
}

export function drawFamilyWelcomeBackdrop(c,W,H,floor){
 drawHarborWelcome(c,W,H,0,true);
 // A generous sand promenade under the cast replaces the flat dark stage.
 c.fillStyle='#a9c79a';c.fillRect(0,floor-8,W,H-floor+8);
 c.fillStyle='#ead5a6';c.beginPath();c.moveTo(0,floor-19);
 c.bezierCurveTo(W*.25,floor-36,W*.65,floor+16,W,floor-24);
 c.lineTo(W,floor+40);c.bezierCurveTo(W*.7,floor+64,W*.3,floor+14,0,floor+36);c.fill();
 // The family home, a little jetty and boat belong to the scenery, not UI.
 const scale=Math.min(W/1100,H/700),x=W*.2,y=floor-H*.22;
 c.save();c.translate(x,y);c.scale(scale,scale);
 c.fillStyle='#568376';c.fillRect(-68,-72,136,76);
 shape(c,[[-86,-72],[0,-125],[86,-72]],'#f2d49a');
 c.fillStyle='#2b5853';c.fillRect(-13,-39,26,43);c.fillStyle='#ffe7a3';c.fillRect(-48,-48,22,23);c.fillRect(28,-48,22,23);
 stroke(c,[[-92,6],[92,6]],'#b08e65',7);c.restore();
 const bx=W*.5,by=floor-H*.21;
 shape(c,[[bx-38,by],[bx+44,by],[bx+24,by+19],[bx-20,by+19]],'#e7bd80');
 stroke(c,[[bx,by],[bx,by-72]],'#46665b',3);
 shape(c,[[bx+4,by-71],[bx+4,by-8],[bx+39,by-8]],'#fff3cf');
 // Lantern line gives the whole scene a shared place and keeps the actors clear.
 stroke(c,[[W*.03,H*.21],[W*.3,H*.31],[W*.65,H*.29],[W*.97,H*.17]],'#5a7b68',2);
 for(let i=0;i<8;i++){
  const xx=W*(.09+i*.115),yy=H*(.24+.055*Math.sin(i/7*Math.PI));
  stroke(c,[[xx,yy-12],[xx,yy]],'#557667',1.5);
  oval(c,xx,yy+8,6,9,i%2?'#efbb8c':'#f6dfa0');
 }
}

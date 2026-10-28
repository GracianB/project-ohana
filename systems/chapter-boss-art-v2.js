import {drawKiloGuardian} from './kilo-chapter-art-v606.js';
import {drawStitchoGuardian} from './stitcho-chapter-art-v607.js';
import {chapterBossMind} from './chapter-boss-v2.js';
const TAU=Math.PI*2,INK='#192a40';
const PALETTES={kilo:['#987059','#f0d3a0','#4a7766'],stitcho:['#466d93','#b5ebeb','#977ae3'],chispin:['#8178ac','#fff0a1','#8bc4dc'],cat:['#967db0','#f0d6ec','#b8c5ee'],cuerno:['#668f88','#e4e9bc','#c2ace6'],dragon:['#92545e','#ffd092','#d78363'],dino:['#718971','#ebe0b7','#b7ce97'],frita:['#c19765','#fff0ba','#d28a7c'],pizza:['#bf805e','#f7deb0','#c6534f'],yomi:['#7a9daa','#ecedc9','#9edbd2']};
function shape(c,col,fn,lw=2.6){if(typeof col==='string'&&/^#[0-9a-f]{6}$/i.test(col)&&col!==INK){const g=c.createLinearGradient(-60,-210,70,5);g.addColorStop(0,'#fff0cc');g.addColorStop(.20,col);g.addColorStop(1,'#26374e');c.fillStyle=g;}else c.fillStyle=col;c.strokeStyle=INK;c.lineWidth=lw;c.beginPath();fn();c.closePath();c.fill();c.stroke();}
function oval(c,x,y,rx,ry,col,rot=0){const g=c.createLinearGradient(x-rx,y-ry,x+rx,y+ry);g.addColorStop(0,'#fff2d0');g.addColorStop(.22,col);g.addColorStop(1,col===INK?INK:'#384252');shape(c,g,()=>c.ellipse(x,y,rx,ry,rot,0,TAU));}
function line(c,col,w,fn){c.strokeStyle=col;c.lineWidth=w;c.beginPath();fn();c.stroke();}
function limb(c,x,y,ex,ey,hx,hy,col,w){line(c,INK,w+5,()=>{c.moveTo(x,y);c.quadraticCurveTo(ex,ey,hx,hy);});line(c,col,w,()=>{c.moveTo(x,y);c.quadraticCurveTo(ex,ey,hx,hy);});oval(c,ex,ey,w*.56,w*.52,col);}
function eye(c,x,y,r,aim,angry){oval(c,x,y,r,r*1.18,'#fff8dc');c.fillStyle=INK;c.beginPath();c.ellipse(x+aim*r*.22,y+1,r*.4,r*.66,0,0,TAU);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(x-r*.18,y-r*.35,r*.2,0,TAU);c.fill();line(c,INK,3,()=>{c.moveTo(x-r,y-r*1.35+(angry?3:0));c.quadraticCurveTo(x,y-r*1.9,x+r,y-r*1.35-(angry?2:0));});}
function face(c,x,y,w,aim,warn){eye(c,x-w*.22,y,Math.max(4,w*.105),aim,warn);eye(c,x+w*.22,y,Math.max(4,w*.105),aim,warn);line(c,INK,2.4,()=>{c.moveTo(x-w*.16,y+w*.25);c.quadraticCurveTo(x,y+w*(warn?.14:.35),x+w*.16,y+w*.25);});}
function wing(c,x,y,side,span,lift,col){shape(c,col,()=>{c.moveTo(x,y);c.bezierCurveTo(x+side*span*.3,y-35-lift*30,x+side*span*.9,y-95-lift*35,x+side*span,y-85-lift*20);c.quadraticCurveTo(x+side*span*.86,y-25,x+side*span*.56,y+14);c.quadraticCurveTo(x+side*span*.22,y-15,x,y);});for(let k=1;k<=3;k++)line(c,'#fff2cc',1.5,()=>{c.moveTo(x,y);c.quadraticCurveTo(x+side*span*.4,y-15-k*13,x+side*span*(.45+k*.15),y-15-k*18-lift*20);});}
export function drawChapterBossV2(c,e,cam,t,reduced=false){
 if(!e.miniBoss||!e.roomId?.startsWith('w1-'))return false;
 const id=e.gauntletBoss||e.roomId.slice(3),P=PALETTES[id],b=chapterBossMind(e);if(!P||!b)return false;
 if(id==='kilo'&&!e.gauntletBoss)return drawKiloGuardian(c,e,cam,t,reduced);
 if(id==='stitcho'&&!e.gauntletBoss&&e._stitchoGuardianV607)return drawStitchoGuardian(c,e,cam,t,reduced);
 const time=reduced?0:t,warn=b.phase==='warn',attack=['attack','strike'].includes(b.phase),rest=b.phase==='rest',aim=b.aim||1,
  age=b.clock??b.timer??0,lift=warn?Math.max(0,Math.min(1,1-age/(b.rhythm?.warn||60))):attack?1:0,flap=reduced?0:Math.sin(time*.07),step=reduced?0:Math.sin(time*.15),scale=e.h/180;
 c.save();c.translate(e.x+e.w/2-cam.x,e.y+e.h-cam.y);c.scale(scale,scale);c.lineCap='round';c.lineJoin='round';
 if(e.flash>0){c.globalAlpha=.9;c.translate(5,3);c.rotate(-.045);}
 if(e.evolved)drawEvolvedRear(c,id,P,time,reduced,warn);
 // Feet, real elbow joints, torso and face share the same state, not a
 // generic screen shake. A threatening silhouette remains readable at rest.
 const feet=id==='frita'?[-56,-28,28,56]:id==='stitcho'?[-65,-35,35,65]:[-32,32];
 for(const [i,x] of feet.entries()){
  const swing=attack?step*6*(i%2?-1:1):0;
  limb(c,x*.65,-49,x*.95,-26,x+swing,-8,P[0],id==='dino'?20:12);
  oval(c,x+swing,-7,id==='dino'?25:19,8,P[2]);
  for(let k=-1;k<=1;k++)line(c,P[1],1.4,()=>{c.moveTo(x+swing+k*6,-10);c.lineTo(x+swing+k*6+2,-3);});
 }
 if(['chispin','dragon','cuerno','yomi'].includes(id))for(const side of [-1,1])wing(c,side*27,-87,side,id==='dragon'?99:88,(warn?lift:flap*.25),side<0?P[0]:P[2]);
 if(['cat','dragon','cuerno','dino'].includes(id)){
  const count=id==='cat'?3:1;
  for(let i=0;i<count;i++)line(c,INK,14-i*2,()=>{c.moveTo(-35,-51);c.bezierCurveTo(-95,-40,-111,-91-i*16,-76+flap*5,-107-i*12);});
  for(let i=0;i<count;i++)line(c,P[2],9-i*2,()=>{c.moveTo(-35,-51);c.bezierCurveTo(-95,-40,-111,-91-i*16,-76+flap*5,-107-i*12);});
 }
 if(id==='kilo'){
  shape(c,P[0],()=>{c.moveTo(-54,-138);c.bezierCurveTo(-66,-97,-62,-50,-45,-25);c.quadraticCurveTo(0,-9,45,-25);c.bezierCurveTo(62,-50,66,-97,54,-138);});
  for(let k=-4;k<=4;k++)line(c,P[1],1.6,()=>{c.moveTo(k*12,-133);c.lineTo((k+1)*10,-30);c.lineTo((k+1)*12,-133);});
  oval(c,0,-137,55,18,P[1]);oval(c,0,-33,50,10,P[0]);
  face(c,0,-91,67,aim,warn);
  for(const side of [-1,1]){const hy=warn?-100-lift*55:attack?-102:-75;limb(c,side*44,-100,side*72,-95,side*79,hy,P[2],12);line(c,P[1],6,()=>{c.moveTo(side*79,hy);c.lineTo(side*64,hy-30);});oval(c,side*64,hy-31,19,12,P[1]);}
 }else if(id==='stitcho'){
  oval(c,0,-79,55,49,P[0]);oval(c,0,-82,30,30,P[2]);oval(c,0,-82,17,17,warn?'#ffbd91':'#a6f4e9');
  shape(c,P[0],()=>{c.moveTo(-49,-143);c.bezierCurveTo(-60,-185,54,-191,49,-143);c.lineTo(38,-116);c.quadraticCurveTo(0,-100,-38,-116);});
  shape(c,INK,()=>{c.moveTo(-39,-153);c.quadraticCurveTo(0,-171,39,-153);c.lineTo(33,-128);c.quadraticCurveTo(0,-116,-33,-128);});face(c,0,-143,68,aim,warn);
  for(let side of [-1,1]){limb(c,side*40,-99,side*80,-94-lift*20,side*(83+attack*10),-65-lift*65,P[0],15);for(let k=-1;k<=1;k++)line(c,P[1],4,()=>{c.moveTo(side*83,-65-lift*65);c.quadraticCurveTo(side*110,-75-lift*65,side*(105+k*6),-94-lift*65);});line(c,P[2],5,()=>{c.moveTo(side*30,-173);c.quadraticCurveTo(side*46,-206,side*56,-190);});oval(c,side*56,-190,7,7,P[1]);}
 }else if(id==='chispin'){
  oval(c,0,-88,47,61,P[0]);oval(c,0,-79,28,37,P[1]);oval(c,0,-144,39,29,P[2]);face(c,0,-146,61,aim,warn);
  for(const side of [-1,1]){limb(c,side*34,-103,side*64,-100-lift*25,side*67,-78-lift*70,P[0],13);oval(c,side*67,-78-lift*70,18,19,P[1]);line(c,P[1],4,()=>{c.moveTo(side*20,-165);c.bezierCurveTo(side*38,-199,side*60,-198,side*53,-176);});for(let k=0;k<3;k++){line(c,P[1],2,()=>{c.moveTo(side*(24+k*9),-54);c.lineTo(side*(33+k*9),-65);c.lineTo(side*(23+k*9),-77);});}}
 }else if(id==='cat'){
  oval(c,0,-75,46,49,P[0]);oval(c,0,-71,28,34,P[1]);
  for(const side of [-1,1])shape(c,P[2],()=>{c.moveTo(side*12,-151);c.quadraticCurveTo(side*39,-202,side*46,-185);c.lineTo(side*43,-131);});
  oval(c,0,-133,49,38,P[0]);oval(c,0,-119,25,17,P[1]);face(c,0,-139,71,aim,warn);
  c.fillStyle=P[1];c.beginPath();c.arc(0,-163,12,0,TAU);c.fill();
  for(let side of [-1,1]){limb(c,side*33,-92,side*57,-98-lift*12,side*(61+attack*15),-67-lift*49,P[0],15);oval(c,side*(61+attack*15),-67-lift*49,19,14,P[1]);for(let k=-1;k<=1;k++)line(c,P[1],1.8,()=>{c.moveTo(side*28,-121);c.quadraticCurveTo(side*55,-122+k*5,side*67,-132+k*8);});}
 }else if(id==='cuerno'||id==='dragon'||id==='dino'){
  oval(c,0,-73,id==='dino'?65:53,id==='dino'?54:44,P[0]);oval(c,5,-72,id==='dino'?41:30,35,P[1]);
  const headX=id==='dino'?17:13,headY=id==='dino'?-127:-142;
  oval(c,headX-5,-108,24,40,P[0]);oval(c,headX+9,headY,38,29,P[0]);oval(c,headX+33,headY+13,27,16,P[1]);
  // Dino is shown in profile: a single visible eye and a dark nostril.
  eye(c,headX+7,headY-3,10,aim,warn);
  if(id==='dino'){c.fillStyle=INK;c.beginPath();c.ellipse(headX+43,headY+12,3.2,2.1,-.2,0,TAU);c.fill();}
  else eye(c,headX+30,headY-5,7,aim,warn);
  for(let k=0;k<5;k++)shape(c,P[2],()=>{c.moveTo(-44+k*17,-93-Math.sin(k/4*Math.PI)*28);c.quadraticCurveTo(-45+k*17,-128-Math.sin(k/4*Math.PI)*22,-31+k*17,-103-Math.sin(k/4*Math.PI)*23);});
  for(const side of [-1,1]){limb(c,side*37,-93,side*61,-96-lift*15,side*(62+attack*13),-63-lift*38,P[0],id==='dino'?20:12);oval(c,side*(62+attack*13),-63-lift*38,19,12,P[1]);}
  if(id==='cuerno')for(let side of [-1,1]){line(c,P[1],6,()=>{c.moveTo(13+side*14,-162);c.bezierCurveTo(side*30,-187,side*25,-204,side*42,-210);});for(let k=0;k<3;k++)line(c,P[2],3,()=>{c.moveTo(side*(29+k*4),-181-k*8);c.lineTo(side*(46+k*7),-191-k*8);});}
  if(id==='dragon')for(let k=0;k<3;k++)shape(c,P[1],()=>{c.moveTo(k*14,-161);c.lineTo(k*14-5,-193+k*6);c.lineTo(k*14+13,-163);});
  if(id==='dino')for(let k=0;k<4;k++){line(c,P[2],3,()=>{c.moveTo(-36+k*20,-109);c.quadraticCurveTo(-33+k*20,-76,-40+k*20,-49);});}
 }else if(id==='frita'){
  oval(c,0,-77,65,44,P[0]);oval(c,0,-91,51,25,P[1]);
  for(const side of [-1,1]){limb(c,side*46,-81,side*77,-94-lift*15,side*89,-99-lift*24,P[0],14);shape(c,P[1],()=>{const x=side*89,y=-99-lift*24;c.moveTo(x-15,y+15);c.bezierCurveTo(x-38,y-22,x-12,y-44,x,y-22);c.bezierCurveTo(x+20,y-47,x+40,y-4,x+14,y+16);});line(c,P[0],8,()=>{c.moveTo(side*22,-103);c.lineTo(side*29,-145);});eye(c,side*29,-147,13,aim,warn);}
  shape(c,P[1],()=>{c.moveTo(-27,-150);c.lineTo(-32,-182);c.lineTo(-12,-170);c.lineTo(0,-198);c.lineTo(14,-170);c.lineTo(32,-182);c.lineTo(27,-150);});face(c,0,-89,55,aim,warn);
 }else if(id==='pizza'){
  oval(c,0,-87,56,55,P[0]);shape(c,P[1],()=>{c.moveTo(-36,-108);c.quadraticCurveTo(0,-87,36,-108);c.lineTo(43,-28);c.quadraticCurveTo(0,-12,-43,-28);});
  oval(c,0,-143,36,30,P[0]);face(c,0,-147,56,aim,warn);
  for(let side of [-1,1])limb(c,side*42,-108,side*69,-91-lift*20,side*71,-68-lift*50,P[0],14);
  line(c,'#cfad83',7,()=>{c.moveTo(74,-32-lift*50);c.lineTo(84,-173-lift*25);});oval(c,84,-175-lift*25,24,34,'#d7b188');
  shape(c,'#f4edda',()=>{c.moveTo(-28,-164);c.lineTo(-31,-183);c.bezierCurveTo(-58,-197,-24,-218,-12,-202);c.bezierCurveTo(0,-225,31,-213,26,-200);c.bezierCurveTo(60,-204,52,-175,28,-179);c.lineTo(28,-164);});
  for(let k=0;k<3;k++)oval(c,0,-83+k*18,3.5,3.5,P[2]);
 }else if(id==='yomi'){
  oval(c,0,-80,46,55,P[0]);oval(c,0,-79,30,33,P[1]);oval(c,0,-79,16,18,P[2]);
  for(let k=0;k<8;k++){const a=k*TAU/8+time*.012;oval(c,Math.cos(a)*22,-79+Math.sin(a)*26,3,3,P[2]);}
  oval(c,0,-142,42,32,P[0]);shape(c,INK,()=>{c.moveTo(-30,-152);c.quadraticCurveTo(0,-169,30,-152);c.lineTo(28,-129);c.quadraticCurveTo(0,-116,-28,-129);});face(c,0,-143,55,aim,warn);
  for(const side of [-1,1]){limb(c,side*34,-103,side*61,-94-lift*25,side*65,-66-lift*55,P[0],14);oval(c,side*65,-66-lift*55,13,17,P[1]);line(c,P[1],3,()=>{c.moveTo(side*26,-163);c.quadraticCurveTo(side*46,-190,side*33,-195);});}
  line(c,P[2],3,()=>{c.ellipse(0,-179,35,8,-.15,0,TAU);});
 }
 // Surface anatomy belongs to the creature: plate seams, fur, tendons,
 // ropes and hand-carved tools. It does not replace its silhouette with FX.
 if(id==='kilo'){
  for(let yy of [-128,-38]){line(c,P[1],5,()=>c.ellipse(0,yy,53,11,0,0,TAU));line(c,P[2],1.3,()=>c.ellipse(0,yy-3,53,11,0,Math.PI,TAU));}
  for(let k=-3;k<=3;k++){oval(c,k*14,-137+Math.cos(k*.4)*10,2,2,'#eac590');line(c,'#b98a63',1,()=>{c.moveTo(k*12,-111);c.bezierCurveTo(k*12-5,-96,k*12+5,-78,k*12,-58);});}
  for(const side of [-1,1])for(let k=0;k<3;k++)shape(c,['#4f8d72','#93b887','#d3cf96'][k],()=>{const x=side*(26+k*6),y=-151-k*6;c.moveTo(x,y+7);c.quadraticCurveTo(x+side*18,y-14,x+side*25,y-5);c.quadraticCurveTo(x+side*13,y+9,x,y+7);},1.4);
 }else if(id==='stitcho'){
  for(let side of [-1,1]){oval(c,side*43,-106,17,15,P[0]);oval(c,side*43,-106,10,9,P[1]);oval(c,side*43,-106,4,4,P[2]);
   shape(c,P[0],()=>{c.moveTo(side*22,-165);c.quadraticCurveTo(side*53,-167,side*49,-140);c.lineTo(side*37,-133);c.lineTo(side*32,-154);},1.8);
   for(let k=0;k<3;k++)oval(c,side*(28+k*8),-154+k*7,2,2,'#efcd91');
   line(c,P[2],3,()=>{c.moveTo(side*22,-119);c.bezierCurveTo(side*18,-100,side*44,-89,side*26,-59);});
   line(c,P[1],1.3,()=>{c.moveTo(side*30,-112);c.lineTo(side*39,-94);c.lineTo(side*27,-66);});
  }
  for(let k=0;k<10;k++){const a=k*TAU/10+time*.008;oval(c,Math.cos(a)*25,-82+Math.sin(a)*25,2.4,2.4,P[1]);}
  line(c,'#9ec9d8',2,()=>{c.moveTo(-31,-43);c.quadraticCurveTo(0,-25,31,-43);});
 }else if(id==='chispin'){
  for(const side of [-1,1]){for(let k=0;k<4;k++){const x=side*(44+k*12),y=-94-k*9-lift*10;oval(c,x,y,7,11,k%2?P[0]:P[1],side*.55);}
   line(c,P[2],2,()=>{c.moveTo(side*32,-91);c.bezierCurveTo(side*52,-111,side*83,-115-lift*12,side*105,-147-lift*20);});
   for(let k=0;k<4;k++)shape(c,P[1],()=>{c.moveTo(side*(18+k*9),-124);c.quadraticCurveTo(side*(24+k*11),-145-k*5,side*(31+k*9),-123);},1.2);
  }
  for(let k=0;k<4;k++)line(c,P[2],2,()=>{c.moveTo(-24,-54-k*12);c.quadraticCurveTo(0,-42-k*12,24,-54-k*12);});
 }else if(id==='cat'){
  shape(c,P[2],()=>{c.moveTo(-36,-115);c.quadraticCurveTo(-25,-94,-5,-105);c.lineTo(0,-92);c.lineTo(8,-105);c.quadraticCurveTo(26,-94,38,-115);c.quadraticCurveTo(0,-102,-36,-115);},1.5);
  oval(c,0,-106,7,10,P[1]);c.fillStyle='#7761a3';c.beginPath();c.arc(3,-109,5,0,TAU);c.fill();
  for(const side of [-1,1]){for(let k=0;k<3;k++)line(c,P[1],1.2,()=>{c.moveTo(side*19,-121+k*3);c.quadraticCurveTo(side*47,-123+k*5,side*61,-132+k*10);});
   shape(c,P[1],()=>{c.moveTo(side*21,-150);c.quadraticCurveTo(side*31,-180,side*36,-173);c.lineTo(side*37,-153);},1.3);
   for(let k=0;k<3;k++)line(c,P[2],1.6,()=>{c.moveTo(side*(48+k*5),-55-lift*49);c.lineTo(side*(50+k*5),-64-lift*49);});
  }
  c.fillStyle='#b06f9a';c.beginPath();c.moveTo(-5,-126);c.quadraticCurveTo(0,-119,5,-126);c.quadraticCurveTo(0,-131,-5,-126);c.fill();
 }else if(id==='cuerno'){
  for(let side of [-1,1])for(let k=0;k<5;k++){
   const x=side*(32+k*11),y=-93-k*9-lift*10;
   shape(c,[P[1],P[2],'#9ccfb5'][k%3],()=>{c.moveTo(x,y);c.bezierCurveTo(x+side*9,y-24,x+side*18,y-26,x+side*14,y-7);c.quadraticCurveTo(x+side*8,y+9,x,y);},1.1);
  }
  for(let k=0;k<5;k++)line(c,[P[2],P[1],'#afd8c6'][k%3],4,()=>{c.moveTo(-8,-155-k*3);c.bezierCurveTo(-45,-143-k*3,-8,-120,-37,-113+k*5);});
  for(const side of [-1,1]){line(c,P[1],2,()=>{c.moveTo(side*23,-44);c.quadraticCurveTo(side*42,-49,side*48,-30);});oval(c,side*35,-35,5,7,P[2]);}
 }else if(id==='dragon'){
  for(let row=0;row<4;row++)for(let k=0;k<4;k++){
   const x=-33+k*17+(row%2)*6,y=-103+row*14;
   line(c,row%2?'#dc9d79':P[2],1.4,()=>{c.moveTo(x,y);c.quadraticCurveTo(x+7,y+12,x+14,y);});
  }
  for(let side of [-1,1])for(let k=0;k<3;k++){line(c,P[0],3,()=>{c.moveTo(side*34,-85);c.quadraticCurveTo(side*(70+k*9),-100-k*13-lift*12,side*(103-k*12),-147+k*10-lift*12);});}
  c.fillStyle=INK;for(let k=0;k<2;k++){c.beginPath();c.ellipse(39+k*12,-124-k,3,2,.3,0,TAU);c.fill();}
  for(let k=0;k<5;k++)shape(c,'#f6e4bb',()=>{const x=24+k*6;c.moveTo(x,-114);c.lineTo(x+3,-106);c.lineTo(x+6,-115);},1);
 }else if(id==='dino'){
  // An ancestral fossil mask has broad brow plates, tusks and weathered
  // cheek ridges. The eyes stay visible beneath the stone, not inside a blob.
  shape(c,'#b4b99a',()=>{c.moveTo(-5,-151);c.bezierCurveTo(11,-176,47,-171,53,-143);c.lineTo(46,-128);c.lineTo(30,-137);c.lineTo(16,-129);c.lineTo(1,-134);},2);
  eye(c,13,-142,9,aim,warn);eye(c,36,-143,8,aim,warn);
  for(const side of [-1,1])shape(c,P[1],()=>{const x=21+side*26;c.moveTo(x,-134);c.bezierCurveTo(x+side*19,-157,x+side*22,-163,x+side*17,-167);c.quadraticCurveTo(x+side*3,-150,x-3,-130);},1.8);
  for(let row=0;row<3;row++)for(let k=-1;k<=1;k++){
   const x=k*22+(row%2)*8,y=-94+row*20;
   shape(c,k%2?'#a5b396':'#8e9e81',()=>{c.moveTo(x-10,y-7);c.quadraticCurveTo(x,y-15,x+11,y-7);c.lineTo(x+8,y+7);c.quadraticCurveTo(x,y+13,x-10,y+5);},1.1);
   line(c,P[1],1,()=>{c.moveTo(x-6,y-6);c.lineTo(x+2,y-8);});
  }
  for(let k=0;k<5;k++)line(c,'#485e55',1.5,()=>{c.moveTo(-47+k*20,-105);c.lineTo(-52+k*20,-94);c.lineTo(-44+k*20,-85);});
 }else if(id==='frita'){
  for(let k=0;k<5;k++)line(c,'#a17c5d',2,()=>{c.moveTo(-50+k*25,-101);c.quadraticCurveTo(-65+k*30,-75,-46+k*23,-48);});
  line(c,P[1],3,()=>c.ellipse(0,-83,56,32,0,Math.PI*1.07,Math.PI*1.9));
  for(let k=0;k<10;k++){const a=Math.PI+k*Math.PI/9;oval(c,Math.cos(a)*56,-76+Math.sin(a)*35,2,2,'#e7d1a0');}
  shape(c,P[1],()=>{c.moveTo(-27,-63);c.quadraticCurveTo(0,-51,27,-63);c.lineTo(29,-31);c.quadraticCurveTo(0,-15,-29,-31);},1.5);
  oval(c,0,-38,9,12,P[2]);for(const side of [-1,1])line(c,P[1],2,()=>{c.moveTo(side*77,-101-lift*24);c.quadraticCurveTo(side*89,-119-lift*24,side*98,-107-lift*24);});
 }else if(id==='pizza'){
  for(let k=-2;k<=2;k++)line(c,'#bdab8a',1.5,()=>{c.moveTo(k*10,-81);c.quadraticCurveTo(k*14,-48,k*12,-27);});
  for(let k=0;k<4;k++)line(c,'#b3987b',1.2,()=>{c.moveTo(72+k*7,-197-lift*25);c.quadraticCurveTo(66+k*7,-175-lift*25,74+k*7,-153-lift*25);});
  for(let side of [-1,1])shape(c,'#5c4043',()=>{c.moveTo(side*2,-135);c.bezierCurveTo(side*13,-146,side*19,-132,side*26,-139);c.quadraticCurveTo(side*25,-123,side*2,-130);},1);
  line(c,'#d4c8b2',1.6,()=>{c.moveTo(-20,-187);c.lineTo(-17,-171);c.moveTo(-4,-190);c.lineTo(-2,-173);c.moveTo(13,-188);c.lineTo(15,-171);});
  for(let k=0;k<3;k++)shape(c,'#efc680',()=>{const x=-43+k*13;c.moveTo(x,-59);c.quadraticCurveTo(x+5,-62,x+7,-53);c.lineTo(x+6,-36-k*5);c.quadraticCurveTo(x+2,-28-k*4,x,-37-k*4);},1);
 }else if(id==='yomi'){
  for(let side of [-1,1])for(let k=0;k<4;k++){
   const x=side*(37+k*13),y=-113-k*8-lift*10;
   shape(c,k%2?P[1]:P[2],()=>{c.moveTo(x,y);c.quadraticCurveTo(x+side*19,y-23,x+side*27,y-17);c.lineTo(x+side*15,y+9);c.quadraticCurveTo(x+side*8,y+13,x,y);},1.5);
   line(c,P[0],1,()=>{c.moveTo(x+side*6,y);c.lineTo(x+side*19,y-11);});
  }
  for(let side of [-1,1]){shape(c,P[1],()=>{c.moveTo(side*23,-166);c.lineTo(side*43,-190);c.quadraticCurveTo(side*45,-164,side*31,-156);},1.8);oval(c,side*41,-99,12,12,P[1]);oval(c,side*41,-99,5,5,P[2]);}
  line(c,INK,2.5,()=>{c.moveTo(0,-79);c.lineTo(9,-91);c.moveTo(0,-79);c.lineTo(-10,-81);});
  for(let k=0;k<5;k++)line(c,P[1],1.5,()=>{c.moveTo(-28+k*14,-54);c.lineTo(-31+k*15,-34);});
 }
 // Damage reveals a few persistent cracks; it never flashes over the face.
 if(e.hp<e.max*.6&&['dino','stitcho','yomi','cuerno'].includes(id))for(let k=0;k<(e.hp<e.max*.3?3:1);k++)line(c,INK,1.5,()=>{const x=-25+k*20;c.moveTo(x,-109);c.lineTo(x+6,-97);c.lineTo(x-2,-89);});
 // Small highlights follow muscles/plates; the rim never hides the eyes.
 line(c,P[1],2,()=>{c.moveTo(-25,-115);c.quadraticCurveTo(-48,-105,-39,-83);});
 if(rest){c.fillStyle='#cbefcf';c.beginPath();c.arc(0,-52,4,0,TAU);c.fill();}
 if(e.evolved)drawEvolvedFront(c,id,P,time,reduced,warn);
 c.restore();return true;
}

function drawEvolvedRear(c,id,P,t,reduce,warn){
 const beat=reduce?0:Math.sin(t*.045);
 if(id==='kilo'){
  for(const side of [-1,1]){line(c,INK,16,()=>{c.moveTo(side*41,-88);c.bezierCurveTo(side*110,-122,side*66,-199,side*103,-235);});line(c,P[2],10,()=>{c.moveTo(side*41,-88);c.bezierCurveTo(side*110,-122,side*66,-199,side*103,-235);});for(let k=0;k<5;k++){oval(c,side*(81+k%2*12),-144-k*17,17,6,P[1],side*(.3+k*.16));}}
 }else if(id==='stitcho'){
  for(const side of [-1,1])for(let k=0;k<3;k++){const x=side*(72+k*13),y=-35-k*39;limb(c,side*39,-79,x,-108-k*21,x+side*18,y,P[0],8);oval(c,x+side*18,y,13,7,P[1]);}
  oval(c,0,-140,72,71,P[2]);oval(c,0,-142,58,58,P[0]);for(let k=0;k<10;k++){const a=k*TAU/10;oval(c,Math.cos(a)*65,-142+Math.sin(a)*65,7,7,P[1]);}
 }else if(id==='chispin'){
  for(const side of [-1,1])for(let k=0;k<2;k++){wing(c,side*34,-100+k*36,side,128-k*18,beat*.12,P[k?0:2]);for(let j=0;j<4;j++)oval(c,side*(71+j*12),-164+k*48+j*14,5,9,P[1],side*.5);}
 }else if(id==='cat'){
  for(let k=0;k<9;k++){const side=k%2?-1:1,x=side*(51+k*4),y=-28-k*7;line(c,INK,12,()=>{c.moveTo(side*22,-40);c.bezierCurveTo(x*1.7,-19,x*1.5,-132-k*6,x+beat*4,-152-k*3);});line(c,P[k%2],7,()=>{c.moveTo(side*22,-40);c.bezierCurveTo(x*1.7,-19,x*1.5,-132-k*6,x+beat*4,-152-k*3);});}
 }else if(id==='cuerno'){
  for(const side of [-1,1])for(let k=0;k<3;k++){line(c,INK,9-k,()=>{c.moveTo(18+side*12,-151);c.bezierCurveTo(side*75,-188,side*(64+k*16),-237-k*9,side*(99+k*15),-247-k*9);});line(c,P[1],5-k,()=>{c.moveTo(18+side*12,-151);c.bezierCurveTo(side*75,-188,side*(64+k*16),-237-k*9,side*(99+k*15),-247-k*9);});}
 }else if(id==='dragon'){
  for(const side of [-1,1]){wing(c,side*32,-120,side,147,beat*.1,P[0]);for(let k=0;k<4;k++)shape(c,P[1],()=>{const x=side*(72+k*20);c.moveTo(x,-151+k*12);c.lineTo(x+side*12,-174+k*13);c.lineTo(x+side*19,-141+k*12);});}
 }else if(id==='dino'){
  for(let k=-3;k<=3;k++)shape(c,P[k%2?1:2],()=>{const x=k*24;c.moveTo(x-19,-103);c.bezierCurveTo(x-26,-166,x-12,-226-Math.abs(k)*4,x,-240+Math.abs(k)*7);c.bezierCurveTo(x+24,-217,x+24,-167,x+16,-104);});
 }else if(id==='frita'){
  oval(c,0,-93,95,91,P[0]);for(let k=-3;k<=3;k++){oval(c,k*22,-166+Math.abs(k)*13,19,27,P[1],k*.12);line(c,P[2],2,()=>{c.moveTo(k*22-6,-170+Math.abs(k)*13);c.lineTo(k*22+6,-161+Math.abs(k)*13);});}
 }else if(id==='pizza'){
  oval(c,0,-91,81,83,P[0]);for(const side of [-1,1]){line(c,INK,10,()=>{c.moveTo(side*60,-116);c.lineTo(side*91,-155);c.lineTo(side*91,-209);});line(c,P[1],6,()=>{c.moveTo(side*60,-116);c.lineTo(side*91,-155);c.lineTo(side*91,-209);});oval(c,side*91,-210,14,8,P[2]);}
 }else if(id==='yomi'){
  for(const side of [-1,1])for(let k=0;k<6;k++){shape(c,k%2?P[1]:P[2],()=>{c.moveTo(side*24,-81);c.lineTo(side*(125-k*7),-211+k*25+beat*3);c.quadraticCurveTo(side*(137-k*7),-154+k*20,side*(59-k*4),-39);});line(c,P[0],1,()=>{c.moveTo(side*28,-83);c.lineTo(side*(114-k*7),-188+k*25);});}
 }
}
function drawEvolvedFront(c,id,P,t,reduce,warn){
 // Riveted/engraved collar joins the upgraded body to its original anatomy.
 for(const side of [-1,1])for(let k=0;k<3;k++){
  const x=side*(30+k*13),y=-105-k*9;
  shape(c,P[k%2?0:1],()=>{c.moveTo(x-10,y-11);c.quadraticCurveTo(x+17,y-16,x+15,y+7);c.quadraticCurveTo(x-1,y+15,x-10,y+5);});oval(c,x+2,y,2.5,2.5,P[2]);
 }
 if(id==='kilo'){for(let k=-3;k<=3;k++){line(c,P[2],3,()=>{c.moveTo(k*14,-126);c.bezierCurveTo(k*17,-103,k*12,-69,k*15,-38);});}oval(c,0,-139,37,10,P[1]);}
 if(id==='stitcho'){for(const side of [-1,1]){oval(c,side*66,-62,27,29,P[2]);for(let k=0;k<4;k++)line(c,P[1],2,()=>{c.moveTo(side*66-17,-79+k*9);c.lineTo(side*66+17,-79+k*9);});}}
 if(id==='chispin'){for(const side of [-1,1])for(let k=0;k<4;k++){c.strokeStyle=P[1];c.lineWidth=2;c.beginPath();c.ellipse(side*56,-101-k*8,21,7,-side*.3,0,TAU);c.stroke();}}
 if(id==='cat'){shape(c,P[1],()=>{c.moveTo(-43,-148);c.quadraticCurveTo(0,-177,43,-148);c.lineTo(37,-133);c.quadraticCurveTo(0,-153,-37,-133);});for(const side of [-1,1])shape(c,P[2],()=>{c.moveTo(side*30,-125);c.lineTo(side*47,-145);c.lineTo(side*50,-101);});}
 if(id==='cuerno'){for(const side of [-1,1])for(let k=0;k<4;k++){oval(c,side*(44+k*8),-88+k*12,12,21,P[1],side*.6);}}
 if(id==='dragon'){for(let k=0;k<5;k++)shape(c,P[k%2?1:2],()=>{c.moveTo(-27,-94+k*14);c.quadraticCurveTo(4,-79+k*14,33,-94+k*14);c.lineTo(27,-81+k*14);c.quadraticCurveTo(0,-68+k*14,-26,-81+k*14);});}
 if(id==='dino'){shape(c,P[1],()=>{c.moveTo(-20,-147);c.quadraticCurveTo(13,-180,52,-151);c.lineTo(57,-132);c.quadraticCurveTo(18,-146,-14,-127);});for(const side of [-1,1]){oval(c,side*69,-58,28,23,P[0]);for(let k=0;k<3;k++)line(c,P[1],3,()=>{c.moveTo(side*69-15+k*14,-70);c.lineTo(side*69-15+k*14,-51);});}}
 if(id==='frita'){for(const side of [-1,1]){oval(c,side*88,-98,25,34,P[0],side*.5);line(c,P[1],3,()=>{c.moveTo(side*88,-121);c.quadraticCurveTo(side*114,-103,side*94,-77);});}}
 if(id==='pizza'){shape(c,P[2],()=>{c.moveTo(-28,-101);c.quadraticCurveTo(0,-122,28,-101);c.lineTo(31,-61);c.quadraticCurveTo(0,-44,-31,-61);});for(let k=0;k<5;k++){line(c,INK,3,()=>{c.moveTo(-21+k*10,-99);c.lineTo(-21+k*10,-64);});}for(let k=0;k<3;k++)oval(c,-15+k*14,-75,5,7,P[1]);}
 if(id==='yomi'){for(let k=-2;k<=2;k++)shape(c,P[k%2?1:2],()=>{const x=k*17;c.moveTo(x-12,-68);c.lineTo(x+12,-70);c.lineTo(x+17,-14);c.lineTo(x,-3);c.lineTo(x-15,-17);});}
}

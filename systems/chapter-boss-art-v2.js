import {chapterBossMind} from './chapter-boss-v2.js';
const TAU=Math.PI*2,INK='#192a40';
const PALETTES={kilo:['#987059','#f0d3a0','#4a7766'],stitcho:['#466d93','#b5ebeb','#977ae3'],chispin:['#8178ac','#fff0a1','#8bc4dc'],cat:['#967db0','#f0d6ec','#b8c5ee'],cuerno:['#668f88','#e4e9bc','#c2ace6'],dragon:['#92545e','#ffd092','#d78363'],dino:['#718971','#ebe0b7','#b7ce97'],frita:['#c19765','#fff0ba','#d28a7c'],pizza:['#bf805e','#f7deb0','#c6534f'],yomi:['#7a9daa','#ecedc9','#9edbd2']};
function shape(c,col,fn,lw=2.6){c.fillStyle=col;c.strokeStyle=INK;c.lineWidth=lw;c.beginPath();fn();c.closePath();c.fill();c.stroke();}
function oval(c,x,y,rx,ry,col,rot=0){const g=c.createLinearGradient(x-rx,y-ry,x+rx,y+ry);g.addColorStop(0,'#fff2d0');g.addColorStop(.22,col);g.addColorStop(1,col===INK?INK:'#384252');shape(c,g,()=>c.ellipse(x,y,rx,ry,rot,0,TAU));}
function line(c,col,w,fn){c.strokeStyle=col;c.lineWidth=w;c.beginPath();fn();c.stroke();}
function limb(c,x,y,ex,ey,hx,hy,col,w){line(c,INK,w+5,()=>{c.moveTo(x,y);c.quadraticCurveTo(ex,ey,hx,hy);});line(c,col,w,()=>{c.moveTo(x,y);c.quadraticCurveTo(ex,ey,hx,hy);});oval(c,ex,ey,w*.56,w*.52,col);}
function eye(c,x,y,r,aim,angry){oval(c,x,y,r,r*1.18,'#fff8dc');c.fillStyle=INK;c.beginPath();c.ellipse(x+aim*r*.22,y+1,r*.4,r*.66,0,0,TAU);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(x-r*.18,y-r*.35,r*.2,0,TAU);c.fill();line(c,INK,3,()=>{c.moveTo(x-r,y-r*1.35+(angry?3:0));c.quadraticCurveTo(x,y-r*1.9,x+r,y-r*1.35-(angry?2:0));});}
function face(c,x,y,w,aim,warn){eye(c,x-w*.22,y,Math.max(4,w*.105),aim,warn);eye(c,x+w*.22,y,Math.max(4,w*.105),aim,warn);line(c,INK,2.4,()=>{c.moveTo(x-w*.16,y+w*.25);c.quadraticCurveTo(x,y+w*(warn?.14:.35),x+w*.16,y+w*.25);});}
function wing(c,x,y,side,span,lift,col){shape(c,col,()=>{c.moveTo(x,y);c.bezierCurveTo(x+side*span*.3,y-35-lift*30,x+side*span*.9,y-95-lift*35,x+side*span,y-85-lift*20);c.quadraticCurveTo(x+side*span*.86,y-25,x+side*span*.56,y+14);c.quadraticCurveTo(x+side*span*.22,y-15,x,y);});for(let k=1;k<=3;k++)line(c,'#fff2cc',1.5,()=>{c.moveTo(x,y);c.quadraticCurveTo(x+side*span*.4,y-15-k*13,x+side*span*(.45+k*.15),y-15-k*18-lift*20);});}
export function drawChapterBossV2(c,e,cam,t,reduced=false){
 if(!e.miniBoss||!e.roomId?.startsWith('w1-'))return false;
 const id=e.roomId.slice(3),P=PALETTES[id],b=chapterBossMind(e);if(!P||!b)return false;
 const time=reduced?0:t,warn=b.phase==='warn',attack=['attack','strike'].includes(b.phase),rest=b.phase==='rest',aim=b.aim||1,
  age=b.clock??b.timer??0,lift=warn?Math.min(1,1-age/60):attack?1:0,flap=reduced?0:Math.sin(time*.07),step=reduced?0:Math.sin(time*.15),scale=e.h/180;
 c.save();c.translate(e.x+e.w/2-cam.x,e.y+e.h-cam.y);c.scale(scale,scale);c.lineCap='round';c.lineJoin='round';
 if(e.flash>0)c.globalAlpha=.82;
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
  eye(c,headX+7,headY-3,10,aim,warn);eye(c,headX+30,headY-5,7,aim,warn);
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
 // Small highlights follow muscles/plates; the rim never hides the eyes.
 line(c,P[1],2,()=>{c.moveTo(-25,-115);c.quadraticCurveTo(-48,-105,-39,-83);});
 if(rest){c.fillStyle='#cbefcf';c.beginPath();c.arc(0,-52,4,0,TAU);c.fill();}
 c.restore();return true;
}

// The Astillero cast is built from articulated salvage machinery. Rendering
// reads the same warning/impact states as combat; it never grants gameplay.
const TAU=Math.PI*2,INK='#102d42',PALE='#e5fff2',CYAN='#8de9e7',AMBER='#f4c486';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function metal(c,x,y,w,h,light='#b3e3e0',body='#538eaa',dark='#23465e'){
 const g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,light);g.addColorStop(.23,body);g.addColorStop(.78,body);g.addColorStop(1,dark);return g;
}
function shape(c,col,fn,lw=1.8){c.fillStyle=col;c.strokeStyle=INK;c.lineWidth=lw;c.beginPath();fn();c.closePath();c.fill();if(lw)c.stroke();}
function oval(c,x,y,rx,ry,col,rot=0,lw=1.7){shape(c,col,()=>c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot,0,TAU),lw);}
function line(c,col,w,fn){c.strokeStyle=col;c.lineWidth=w;c.beginPath();fn();c.stroke();}
function plate(c,x,y,w,h,col,r=5,lw=1.7){shape(c,col,()=>c.roundRect(x,y,w,h,r),lw);}
function bolt(c,x,y,r=2.3){oval(c,x,y,r,r,'#c7e6df',0,.8);line(c,'#42677b',.8,()=>{c.moveTo(x-r*.5,y);c.lineTo(x+r*.5,y);});}
function limb(c,x,y,ex,ey,hx,hy,col,w=6){
 line(c,INK,w+3,()=>{c.moveTo(x,y);c.lineTo(ex,ey);c.lineTo(hx,hy);});
 line(c,col,w,()=>{c.moveTo(x,y);c.lineTo(ex,ey);c.lineTo(hx,hy);});
 line(c,'#c1e6df',Math.max(1,w*.23),()=>{c.moveTo(x-1,y-1);c.lineTo(ex-1,ey-1);});
 oval(c,ex,ey,w*.62,w*.62,'#39627c',0,1);bolt(c,ex,ey,w*.31);
}
function eye(c,x,y,rx,ry,aim=1,hurt=false,warn=false){
 oval(c,x,y,rx+1.8,ry+1.8,'#173c52',0,1.3);
 if(hurt){line(c,AMBER,2.2,()=>{c.moveTo(x-rx*.7,y-2);c.lineTo(x+rx*.7,y+2);});return;}
 oval(c,x,y,rx,ry,metal(c,x-rx,y-ry,rx*2,ry*2,'#f5fff0',warn?'#ffe09d':'#9af1ec',warn?'#b38a65':'#4f9db5'),0,0);
 oval(c,x+aim*rx*.2,y+1,rx*.35,ry*.66,'#133449',0,0);
 oval(c,x-rx*.22,y-ry*.35,rx*.16,ry*.15,'#fffbed',0,0);
}
function slots(c,x,y,n,spacing,col='#24475d',vertical=false){
 for(let k=0;k<n;k++)plate(c,x+(vertical?0:k*spacing),y+(vertical?k*spacing:0),vertical?10:3,vertical?3:10,col,1.5,.7);
}
function claw(c,x,y,side,spread,col='#8abac7',size=1){
 c.save();c.translate(x,y);c.scale(side*size,size);
 oval(c,0,0,10,10,metal(c,-10,-10,20,20,'#d5f3e6',col,'#375b75'),0,1.8);
 for(const s of [-1,1]){
  const yy=s*(8+spread*9);
  shape(c,metal(c,0,-15,28,29,'#d5eee1',col,'#2a4c67'),()=>{c.moveTo(-1,s*5);c.quadraticCurveTo(13,yy+s*9,27,yy);c.lineTo(22,yy-s*8);c.quadraticCurveTo(11,yy+s*1,5,s*1);},1.6);
  line(c,'#e5f6de',1,()=>{c.moveTo(5,s*7);c.quadraticCurveTo(15,yy+s*3,22,yy);});
 }
 bolt(c,0,0,3);c.restore();
}
function shadow(c,x,y,rx,ry,alpha=.28){c.save();c.globalAlpha=alpha;oval(c,x,y,rx,ry,'#08283d',0,0);c.restore();}
function ventLight(c,x,y,col,lit=true){plate(c,x-4,y-2,8,4,lit?col:'#2b4d62',2,.7);}

/** A six-armed dock salvager with a legible two-eye visor and shuttered heart. */
export function drawStitchoGuardian(c,e,cam,t=0,reduced=false){
 if(!e||e.gauntletBoss||e.roomId!=='w1-stitcho'||!e._stitchoGuardianV607)return false;
 const b=e._glitch||{},phase=b.phase||'waiting',tier=clamp(b.tier||1,1,3),warn=phase==='warn',attack=phase==='attack',rest=phase==='rest';
 const time=reduced?0:t,aim=b.aim||1,pattern=b.attack||0,step=reduced?0:Math.sin(time*.13),breath=reduced?0:Math.sin(time*.035);
 const preparing=warn?clamp(1-(b.clock||0)/(b.warnMax||60),0,1):attack?1:0;
 const open=rest?1:warn&&pattern===2?preparing*.4:attack&&pattern===2?.75:.06;
 const scale=clamp((e.h||180)/180,.6,2),hurt=(e.flash||0)>0||(e._hitT||0)>0;
 c.save();c.translate(e.x+e.w/2-cam.x,e.y+e.h-cam.y);c.scale(scale,scale);c.lineCap='round';c.lineJoin='round';
 if(hurt){c.translate(-aim*3,2);c.rotate(-aim*.025);}
 shadow(c,0,-2,91,13,.35);
 // Four rubberized crawler feet carry the complete chassis. Their pistons
 // compress during wind-up and each foot keeps a real contact with the floor.
 for(const side of [-1,1])for(let k=0;k<2;k++){
  const xx=side*(37+k*27),stride=phase==='step'||attack&&pattern===1?step*(k?1:-1)*7:0,fold=warn?preparing*6:0;
  limb(c,side*(26+k*12),-48,side*(42+k*19),-24+fold,xx+stride,-11,'#6599ae',k?12:14);
  plate(c,xx-19+stride,-14,39,15,metal(c,xx-20,-14,40,16,'#9ecac9','#3e657c','#173e54'),5,2);
  for(let j=0;j<4;j++)line(c,'#173b50',2,()=>{c.moveTo(xx-12+j*8+stride,-11);c.lineTo(xx-14+j*8+stride,-2);});
  ventLight(c,xx+stride,-9,k?'#e9bd82':'#8ae3da',!warn||preparing<.7);
 }
 // Back-mounted coolant reservoirs and cables establish the dock-machine
 // silhouette rather than decorating a generic round enemy.
 for(const side of [-1,1]){
  plate(c,side*53-13,-144,26,72,metal(c,side*53-13,-144,26,72,'#b5dfd7','#496e91','#203f60'),12,2.3);
  for(let k=0;k<4;k++)line(c,'#b6d3d7',2,()=>{c.moveTo(side*53-12,-128+k*13);c.lineTo(side*53+12,-128+k*13);});
  line(c,INK,8,()=>{c.moveTo(side*45,-137);c.bezierCurveTo(side*82,-166,side*84,-94,side*48,-90);});
  line(c,side<0?'#bc8db2':'#9bc7b4',4,()=>{c.moveTo(side*45,-137);c.bezierCurveTo(side*82,-166,side*84,-94,side*48,-90);});
 }
 // Rear tools have real telescopic joints and differing jobs: capacitors
 // above, welding fans at the sides and recovery claws near the floor.
 for(const side of [-1,1])for(let k=0;k<2;k++){
  const rootY=-118+k*41,lift=pattern===2?(1-k)*preparing*38:pattern===0?preparing*(k?18:-12):0;
  const hx=side*(85+k*12+(attack?8:0)),hy=-122+k*59-lift;
  limb(c,side*43,rootY,side*(74+k*5),rootY-7-lift*.5,hx,hy,k?'#8f83ac':'#6fa8b8',k?9:10);
  if(k){
   c.save();c.translate(hx,hy);c.rotate(side*(warn?-.4:.2));plate(c,-11,-9,23,18,metal(c,-11,-9,23,18,'#c7e9dd','#7a99b0','#3d5a7c'),5,1.7);
   for(let n=-1;n<=1;n++){line(c,'#3f5b79',3,()=>{c.moveTo(0,n*4);c.lineTo(side*19,n*8);});oval(c,side*20,n*8,3,2.4,warn?'#f5ce8d':'#96e1dd',0,.8);}c.restore();
  }else{
   plate(c,hx-11,hy-18,22,35,metal(c,hx-11,hy-18,22,35,'#d0e9df','#566e99','#284866'),7,1.9);
   plate(c,hx-6,hy-10,12,21,warn&&pattern===2?'#f4cf94':'#a5c5df',4,1);
   for(let n=0;n<3;n++)line(c,'#385b78',1.4,()=>{c.moveTo(hx-8,hy-8+n*7);c.lineTo(hx+8,hy-8+n*7);});
   bolt(c,hx,hy-14,2);
  }
 }
 // Heavy torso, bolted rib and sliding iris doors. In recovery the warm
 // inner reactor is visible from both sides, making the damage window clear.
 shape(c,metal(c,-58,-139,116,112,'#abd4d5','#527e9e','#284866'),()=>{c.moveTo(-44,-140);c.quadraticCurveTo(0,-153,44,-140);c.lineTo(58,-93);c.lineTo(44,-40);c.quadraticCurveTo(0,-24,-44,-40);c.lineTo(-58,-93);},3);
 shape(c,'#203e59',()=>{c.moveTo(-31,-126);c.lineTo(31,-126);c.lineTo(43,-91);c.lineTo(28,-50);c.lineTo(-28,-50);c.lineTo(-43,-91);},1.6);
 oval(c,0,-88,30,35,'#19344d',0,2);
 oval(c,0,-88,23,27,metal(c,-24,-116,48,55,'#fff5c5',rest?'#f5c78b':'#a28ec2',rest?'#bd7d72':'#53658f'),0,2);
 oval(c,0,-88,12+open*4,17+open*3,rest?'#fff1be':warn?'#f0ae8b':'#a4dfdf',0,1.3);
 for(const side of [-1,1]){
  const slide=12+open*23;
  shape(c,metal(c,side*slide-14,-123,29,74,'#b9d9dd','#4b7898','#2d4e6c'),()=>{c.moveTo(side*(slide-10),-123);c.lineTo(side*(slide+17),-115);c.lineTo(side*(slide+21),-69);c.lineTo(side*(slide+2),-50);c.lineTo(side*(slide-9),-58);c.quadraticCurveTo(side*(slide-17),-85,side*(slide-10),-123);},2);
  line(c,'#cce7df',1.7,()=>{c.moveTo(side*(slide+5),-112);c.lineTo(side*(slide+10),-73);});
  for(let k=0;k<3;k++)ventLight(c,side*(slide+8),-104+k*11,rest?'#f2d39a':CYAN,rest||k<tier);
 }
 for(const [x,y] of [[-38,-129],[38,-129],[-46,-91],[46,-91],[-31,-48],[31,-48]])bolt(c,x,y,3.1);
 // A broad helmet visor carries exactly two readable eyes. Rivets, reactor
 // lights and antenna lamps have separate material and cannot read as eyes.
 c.save();c.translate(0,breath*.6-(warn?preparing*2:0));
 shape(c,metal(c,-47,-194,94,61,'#c1e4df','#5c83a5','#2a4868'),()=>{c.moveTo(-43,-151);c.bezierCurveTo(-61,-188,-32,-205,0,-203);c.bezierCurveTo(35,-205,61,-186,43,-151);c.quadraticCurveTo(0,-133,-43,-151);},2.8);
 plate(c,-37,-183,74,34,'#132e45',12,2);
 eye(c,-16,-166,9.5,8.7,aim,hurt,warn);eye(c,16,-166,9.5,8.7,aim,hurt,warn);
 line(c,'#7da6b9',3,()=>{c.moveTo(-32,-185);c.quadraticCurveTo(0,-199,32,-185);});
 line(c,INK,2,()=>{c.moveTo(-9,-143);c.quadraticCurveTo(0,rest?-137:-140,9,-143);});
 for(const side of [-1,1]){
  oval(c,side*44,-168,10,13,'#294b68',0,1.7);bolt(c,side*44,-168,4);
  limb(c,side*28,-193,side*34,-211,side*49,-208,'#6896ac',3.7);
  plate(c,side*49-5,-213,10,10,warn?AMBER:'#92e2df',3,1.5);
 }
 for(let k=0;k<3;k++)plate(c,-9+k*7,-198,4,5,k<tier?'#edca91':'#476b84',1,.5);
 c.restore();
 // The front pair is the iconic grappling rig. Charging encloses the core;
 // recovery drops the claws and exposes the reactor, before the next warning.
 for(const side of [-1,1]){
  const reach=pattern===1?preparing*13:rest?-8:preparing*7;
  const hx=side*(76+reach),hy=rest?-58:pattern===1?-95:pattern===2?-103-preparing*16:-84-preparing*26;
  limb(c,side*45,-111,side*(74+reach*.3),-112-(warn?preparing*8:0),hx,hy,'#85b7bf',15);
  claw(c,hx,hy,side,rest?.9:warn&&pattern===1?.05:.35+preparing*.4,'#8fb9c6',1.22);
 }
 if(tier>=2){
  for(const side of [-1,1])line(c,tier===3?'#f4c3aa':'#c6a8ce',1.8,()=>{c.moveTo(side*41,-122);c.lineTo(side*34,-108);c.lineTo(side*42,-99);c.lineTo(side*35,-84);});
  if(tier===3&&!reduced)for(let k=0;k<3;k++){c.save();c.globalAlpha=.45+.2*Math.sin(time*.1+k);line(c,'#dfb5d3',1.5,()=>{c.moveTo(-28+k*27,-130);c.lineTo(-34+k*30,-138);c.lineTo(-24+k*28,-142);});c.restore();}
 }
 c.restore();return true;
}

function saucer(c,s){
 const {time,wind,active,hurt,aim,reduced}=s,tilt=wind?-.07:active?.13:reduced?0:Math.sin(time*.045)*.025;
 c.save();c.rotate(tilt);
 for(const side of [-1,1]){
  limb(c,side*16,-18,side*25,-8,side*31,-4,'#688da4',3.7);
  plate(c,side*31-5,-6,10,5,'#344f68',2,1);
 }
 oval(c,0,-30,35,11,metal(c,-36,-42,72,22,'#c0e7df','#6093af','#345276'),0,2.2);
 shape(c,metal(c,-24,-61,48,38,'#c5ece5','#76b8bd','#426c92'),()=>{c.moveTo(-25,-32);c.bezierCurveTo(-23,-68,23,-68,25,-32);c.quadraticCurveTo(0,-20,-25,-32);},2);
 oval(c,0,-44,16,13,'#1f4059',0,1.4);eye(c,3,-45,10,9,aim,hurt,wind);
 oval(c,0,-30,36,7,'#6b829f',0,1.6);
 for(let k=-2;k<=2;k++)oval(c,k*12,-29+Math.abs(k),2.6,2.4,k===0&&wind?AMBER:k%2?'#e4bc94':'#a2e8d8',0,.8);
 for(const side of [-1,1]){
  plate(c,side*27-6,-34,12,8,'#334f6b',3,1.1);
  const nozzle=active?7:wind?4:0;plate(c,side*27-3,-27,6,8+nozzle,'#bcd5d1',2,1);
 }
 c.restore();
}
function mosquito(c,s){
 const {time,wind,active,hurt,aim,reduced}=s,flutter=reduced?0:Math.sin(time*.44)*.25;
 for(const side of [-1,1]){
  c.save();c.translate(-4,-35);c.rotate(side*(.18+flutter));c.globalAlpha=.85;
  oval(c,side*24,-13,22,8,'#b5e5e3',side*.35,1.1);oval(c,side*21,-1,17,6,'#97c9d5',-side*.2,1);
  for(let k=0;k<3;k++)line(c,'#6899b2',.7,()=>{c.moveTo(0,0);c.lineTo(side*(22+k*7),-19+k*4);});c.restore();
 }
 c.save();c.rotate(active?-.2:wind?.14:0);
 oval(c,-9,-23,13,23,metal(c,-22,-48,26,48,'#d4cfdf','#8e86b3','#4a557f'),-.22,1.9);
 plate(c,-19,-38,16,29,'#2d4568',5,1.3);
 for(let k=0;k<4;k++)plate(c,-16,-34+k*6,10,3,k<(wind?4:2)?'#e4c295':'#658899',1,0);
 oval(c,4,-40,11,11,'#6ca5b5',0,1.8);oval(c,14,-46,13,12,'#a4d7d3',.15,1.9);
 eye(c,18,-48,5.7,6,aim,hurt,wind);
 line(c,INK,3,()=>{c.moveTo(25,-45);c.quadraticCurveTo(34,-45,38,-51+(active?-5:0));});
 line(c,'#b1d6d2',1.2,()=>{c.moveTo(26,-46);c.quadraticCurveTo(33,-46,37,-52+(active?-5:0));});
 for(let k=0;k<3;k++)for(const side of [-1,1])limb(c,2,-33+k*7,14+side*6,-24+k*7,9+side*11,-10+k*5,'#5e819b',1.7);
 for(const side of [-1,1]){line(c,'#5c819c',1.5,()=>{c.moveTo(11+side*3,-55);c.quadraticCurveTo(11+side*12,-69,21+side*9,-64);});oval(c,21+side*9,-64,2,2,AMBER,0,.7);}
 c.restore();
}
function beetle(c,s){
 const {step,wind,active,hurt,aim}=s;
 for(const side of [-1,1])for(let k=0;k<3;k++){
  const walk=step*(k%2?-1:1)*3;
  limb(c,side*(11+k*4),-25+k*5,side*(24+k*3),-15+walk,side*(33+k*4),-1-Math.max(0,walk),'#547b93',3.8);
  plate(c,side*(33+k*4)-4,-3-Math.max(0,walk),8,4,'#304e65',1.6,1);
 }
 oval(c,-6,-30,26,25,metal(c,-31,-57,55,52,'#b8e0da','#528499','#30536e'),-.08,2.4);
 for(const side of [-1,1])shape(c,metal(c,side<0?-31:-7,-57,31,48,'#bdded3',side<0?'#7ca6b0':'#4d7f98','#24475e'),()=>{c.moveTo(-7,-54);c.bezierCurveTo(-7+side*27,-57,-7+side*32,-24,-7+side*8,-9);c.quadraticCurveTo(-4,-30,-7,-54);},1.8);
 line(c,'#c9d7b9',1.2,()=>{c.moveTo(-13,-48);c.quadraticCurveTo(-25,-35,-17,-20);});
 for(const side of [-1,1])for(let k=0;k<2;k++)bolt(c,-7+side*(10+k*5),-41+k*16,1.8);
 // A broad armoured brow is a physical shield, attached to the head and
 // mandibles. Its warm seam clearly points at the protected front.
 oval(c,15,-31,14,16,'#466e87',.1,1.8);
 shape(c,metal(c,4,-53,31,30,'#ecd9b0','#a7a890','#536a7c'),()=>{c.moveTo(4,-39);c.quadraticCurveTo(8,-56,27,-48);c.quadraticCurveTo(39,-41,31,-27);c.lineTo(8,-29);},2.1);
 eye(c,19,-33,5,4.7,aim,hurt,wind);
 for(const side of [-1,1]){
  line(c,'#3e5c74',2,()=>{c.moveTo(15,-46);c.lineTo(17+side*8,-58-(wind?3:0));});oval(c,17+side*8,-58-(wind?3:0),2.3,2.3,AMBER,0,.8);
 }
 for(const side of [-1,1])shape(c,'#a9c8c3',()=>{c.moveTo(25,-24);c.quadraticCurveTo(37,-28,37,-19+side*5);c.lineTo(29,-17+side*2);},1.5);
 if(active)line(c,'#d1e6d1',1.8,()=>{c.moveTo(-23,-55);c.quadraticCurveTo(-4,-64,10,-52);});
}
function spider(c,s){
 const {step,wind,active,hurt,aim}=s,fold=wind?5:0;
 for(const side of [-1,1])for(let k=0;k<4;k++){
  const spread=18+k*4,walk=step*(k%2?-1:1)*4,yy=-27+k*4+fold;
  limb(c,side*12,yy,side*(27+k*3),yy-12+(active?-7:0)+walk,side*(spread+21),-2-Math.max(0,walk),'#8d8aac',3.1);
  line(c,'#e3c7b0',1.3,()=>{c.moveTo(side*(spread+21),-2-Math.max(0,walk));c.lineTo(side*(spread+26),-2-Math.max(0,walk));});
 }
 oval(c,-8,-32+fold,22,20,metal(c,-30,-55,46,42,'#e1c7d6','#9d83ac','#4e577d'),-.14,2.2);
 shape(c,'#566b8b',()=>{c.moveTo(-27,-35+fold);c.quadraticCurveTo(-8,-57+fold,10,-37+fold);c.lineTo(7,-25+fold);c.quadraticCurveTo(-8,-15+fold,-26,-25+fold);},1.4);
 for(let k=0;k<3;k++)ventLight(c,-18+k*10,-31+fold,'#dec99e',k<2||wind);
 oval(c,15,-34+fold,14,12,'#89bec2',.1,1.9);
 for(const side of [-1,1])eye(c,16+side*6,-36+fold,4.8,5,aim,hurt,wind);
 for(const side of [-1,1]){
  limb(c,21,-26+fold,30,-21+fold,29+side*3,-15+fold,'#aac8cc',2.5);
  line(c,'#31546e',2,()=>{c.moveTo(9+side*7,-45+fold);c.lineTo(8+side*10,-53+fold);});
 }
}
function bat(c,s){
 const {time,wind,active,hurt,aim,reduced}=s,flap=reduced?0:Math.sin(time*.19)*.25,raise=wind?-.3:active?.15:flap;
 for(const side of [-1,1]){
  c.save();c.translate(side*8,-33);c.rotate(side*raise);
  shape(c,metal(c,side<0?-49:0,-53,49,56,'#c6b7d1','#817ba9','#414a72'),()=>{c.moveTo(0,0);c.quadraticCurveTo(side*20,-39,side*47,-37);c.quadraticCurveTo(side*51,-13,side*42,-3);c.quadraticCurveTo(side*32,-17,side*26,3);c.quadraticCurveTo(side*17,-12,side*10,9);c.lineTo(0,5);},1.8);
  for(let k=0;k<3;k++)line(c,k===0?'#d3c6ca':'#aaa0c2',1.3,()=>{c.moveTo(0,0);c.quadraticCurveTo(side*(16+k*7),-23,side*(20+k*13),k?-1:-34);});
  oval(c,side*27,-25,3,3,'#c8c6ce',0,1);c.restore();
 }
 oval(c,0,-28,14,24,metal(c,-15,-52,30,49,'#b4d2d0','#637d9d','#334b6f'),0,2);
 oval(c,0,-22,8,11,'#ba9caa',0,1.1);plate(c,-4,-29,8,15,'#d9c591',3,1);
 for(const side of [-1,1]){
  shape(c,metal(c,side<0?-21:5,-72,17,33,'#b9cdd0','#7f86aa','#38536e'),()=>{c.moveTo(side*5,-44);c.quadraticCurveTo(side*13,-73,side*21,-65);c.lineTo(side*17,-39);},1.7);
  shape(c,'#c6a9b8',()=>{c.moveTo(side*10,-46);c.lineTo(side*17,-61);c.lineTo(side*15,-44);},.8);
  limb(c,side*7,-9,side*11,-2,side*14,0,'#89a7b9',2.3);
 }
 oval(c,0,-42,20,16,metal(c,-21,-58,42,33,'#c9dcd4','#839db6','#465a82'),0,2);
 for(const side of [-1,1])eye(c,side*8,-43,5.8,6,aim,hurt,wind);
 shape(c,'#17364d',()=>{c.moveTo(-9,-34);c.quadraticCurveTo(0,-29,9,-34);c.quadraticCurveTo(0,-23,-9,-34);},1);
 for(const side of [-1,1])shape(c,'#f1e7c6',()=>{c.moveTo(side*5,-33);c.lineTo(side*4,-27);c.lineTo(side*1,-32);},.6);
}
/** Five distinct body plans, with no generic role weapon drawn over them. */
export function drawStitchoCreature(c,e,cam,t=0,reduced=false){
 if(!e||e.roomId!=='w1-stitcho'||!e.roomPersona?.stitchoEncounter||e.miniBoss||e.boss)return false;
 const species={ufo:saucer,phosquito:mosquito,cucaracho:beetle,arana:spider,murcielago:bat}[e.kind];if(!species)return false;
 const a=e._campaign||{},wind=(a.wind||0)>0||!!e.telegraph,active=(a.active||0)>0||e.lunge>0,hurt=(e.flash||0)>0||(e._hitT||0)>0;
 const time=reduced?0:t,aim=Math.sign(e.vx)||a.aim||e._shieldFacing||1,scale=clamp((e.h||60)/72,.65,1.4);
 const s={time,wind,active,hurt,aim:1,reduced,step:!reduced&&Math.abs(e.vx||0)>.3?Math.sin(time*.19+(e.spawnIndex||0)):0};
 c.save();c.translate(e.x+e.w/2-cam.x,e.y+e.h-cam.y);c.scale(scale*aim,scale);c.lineCap='round';c.lineJoin='round';
 if(e.dying)c.globalAlpha=clamp(e.dying/28,0,1);
 if(hurt){c.rotate(-.11);c.translate(-2,1);}else if(wind){c.translate(-2,2);c.scale(1.04,.96);}else if(active&&e.kind==='cucaracho')c.rotate(.09);
 if(e.campaignRole!=='flyer')shadow(c,0,0,e.kind==='arana'?32:26,4,.28);
 species(c,s);
 if(wind){c.save();c.globalAlpha=.6;for(const side of [-1,1]){line(c,AMBER,2,()=>{c.moveTo(side*30,-56);c.lineTo(side*35,-61);});}c.restore();}
 c.restore();
 if(e.hp>0&&e.hp<e.max){const x=e.x-cam.x,y=e.y-cam.y-10;c.save();plate(c,x,y,e.w,4,'#193d52',2,0);plate(c,x,y,e.w*clamp(e.hp/e.max,0,1),4,'#a8dbcf',2,0);c.restore();}
 return true;
}

function moduleBody(c,id,released,done,time,reduced){
 const lit=done?'#b6ecc9':released?'#f0d29b':'#849aad';
 if(id===0){
  // Fusion cell: ceramic ribs protect a warm light column, with an actual
  // plug and retaining handles. It is visibly a repairable part, not a coin.
  for(const side of [-1,1]){line(c,'#517a91',5,()=>{c.moveTo(side*18,-28);c.lineTo(side*28,-33);c.lineTo(side*28,-62);c.lineTo(side*18,-66);});line(c,'#bad7d4',1.5,()=>{c.moveTo(side*26,-36);c.lineTo(side*26,-58);});}
  plate(c,-19,-77,38,61,metal(c,-19,-77,38,61,'#d6e9df','#739bb3','#3d5e7e'),9,2.1);
  plate(c,-11,-69,22,46,'#2b4861',7,1.4);plate(c,-6,-64,12,35,metal(c,-6,-64,12,35,'#fff4c5',lit,'#7b8990'),4,1);
  for(let k=0;k<3;k++)line(c,'#b6cdce',2.3,()=>{c.moveTo(-17,-60+k*15);c.lineTo(17,-60+k*15);});
  plate(c,-10,-18,20,12,'#698ba2',3,1.6);for(let k=0;k<3;k++)plate(c,-7+k*5,-7,3,7,AMBER,1,.6);
  bolt(c,-13,-72,2);bolt(c,13,-23,2);
 }else if(id===1){
  // Gyroscope: three nested metal gimbals and a central balanced spindle.
  c.save();c.translate(0,-46);c.rotate(reduced?-.17:Math.sin(time*.027)*.12);
  for(const [angle,rx,ry,col] of [[-.35,34,26,'#759bb7'],[.48,28,35,'#b9a0bc'],[-.1,18,32,'#d4c298']]){
   c.save();c.rotate(angle);line(c,INK,8,()=>c.ellipse(0,0,rx,ry,0,0,TAU));line(c,col,5,()=>c.ellipse(0,0,rx,ry,0,0,TAU));for(const side of [-1,1])bolt(c,side*rx,0,2.5);c.restore();
  }
  oval(c,0,0,12,17,metal(c,-12,-17,24,34,'#e4f4e6',lit,'#5e7d92'),0,2);
  line(c,'#2d4a68',6,()=>{c.moveTo(0,-37);c.lineTo(0,37);});line(c,'#c9d6cc',2,()=>{c.moveTo(-1,-36);c.lineTo(-1,36);});c.restore();
  plate(c,-22,-9,44,10,'#64859b',4,1.7);bolt(c,-14,-4,2);bolt(c,14,-4,2);
 }else{
  // Engine pump: asymmetrical impeller, exhaust duct and copper feed hoses.
  for(const side of [-1,1]){line(c,INK,7,()=>{c.moveTo(side*19,-50);c.bezierCurveTo(side*39,-66,side*45,-22,side*28,-16);});line(c,side<0?'#cda58f':'#9bb9b5',4,()=>{c.moveTo(side*19,-50);c.bezierCurveTo(side*39,-66,side*45,-22,side*28,-16);});}
  plate(c,-29,-74,58,65,metal(c,-29,-74,58,65,'#c7dcd4','#5e8ba3','#2e506e'),11,2.2);
  oval(c,0,-42,24,24,'#254b63',0,2);oval(c,0,-42,18,18,'#162e45',0,1);
  const turn=reduced?0:released?time*.025:0;
  for(let k=0;k<5;k++){c.save();c.translate(0,-42);c.rotate(k*TAU/5+turn);shape(c,lit,()=>{c.moveTo(0,-3);c.bezierCurveTo(2,-17,17,-19,17,-10);c.quadraticCurveTo(15,-2,2,3);},1);c.restore();}
  bolt(c,0,-42,5);plate(c,-20,-85,40,15,'#668199',4,1.8);
  for(let k=0;k<4;k++)plate(c,-14+k*8,-83,4,10,'#26475e',2,.7);
  for(const side of [-1,1]){bolt(c,side*22,-65,2.2);bolt(c,side*22,-17,2.2);plate(c,side*22-8,-9,16,10,'#8e9fa8',3,1.4);}
 }
}
function dock(c,id,done,active,released,time,reduced){
 const accent=done?'#b4edc8':released?'#f2d09c':'#a7ccdc';
 shadow(c,0,1,60,11,.32);
 shape(c,metal(c,-56,-26,112,33,'#a2c5c7','#476f89','#243f5d'),()=>{c.moveTo(-57,-5);c.lineTo(-43,-27);c.lineTo(43,-27);c.lineTo(57,-5);c.lineTo(47,5);c.lineTo(-47,5);},2.2);
 for(let k=-2;k<=2;k++)line(c,k%2?AMBER:'#3f5c71',3,()=>{c.moveTo(k*18-6,-17);c.lineTo(k*18+4,-7);});
 for(const side of [-1,1]){
  plate(c,side*40-6,-78,12,60,metal(c,side*40-6,-78,12,60,'#b2d6d1','#5d8da3','#315671'),4,1.8);
  bolt(c,side*40,-68,2.3);bolt(c,side*40,-29,2.3);
  const grip=done?29:released?40:33;
  limb(c,side*40,-45,side*(grip+6),-44,side*grip,-49,'#8baebb',4.4);
  oval(c,side*grip,-49,5.5,8,'#456d85',0,1.4);
  ventLight(c,side*40,-57,accent,done||active||!reduced&&Math.sin(time*.05+side)>0);
 }
 plate(c,-29,-18,58,16,'#233f57',4,1.3);for(let k=0;k<3;k++)ventLight(c,-16+k*16,-10,accent,done||k<=id);
 if(done){
  c.save();c.translate(0,-59);line(c,accent,3,()=>{c.moveTo(-11,-1);c.lineTo(-3,7);c.lineTo(13,-11);});c.restore();
 }else if(!released){
  // The holding bracket makes the release action visible. It vanishes when
  // the actual mechanism releases, rather than masquerading as a locked coin.
  plate(c,-20,-96,40,12,'#2c4e66',4,1.4);
  const icons=id===0?'J':id===1?'J ↑':'K';c.fillStyle=PALE;c.font='700 10px Outfit,sans-serif';c.textAlign='center';c.fillText(icons,0,-87);
 }
}
export const STITCHO_WORKSHOP_NAMES=Object.freeze(['Celda de fusión','Giroscopio de navegación','Turbina del hogar']);
/** Repair modules and receiving docks share physical material and sockets. */
export function drawStitchoWorkshop(c,s,cam,t=0,{reduced=false,active=false,progress=0,label,caption,carried=false}={}){
 if(!s||s.kind!=='part')return false;
 const id=clamp(s.id|0,0,2),done=!!s.done,released=!!s.released||done,time=reduced?0:t;
 const x=s.x-cam.x,y=s.y-cam.y,target=s.target||s;
 c.save();c.lineCap='round';c.lineJoin='round';
 // A compact receiving gantry is drawn at the destination; it is a machine
 // socket with matching connectors, not another abstract collection marker.
 c.save();c.translate(target.x-cam.x,target.y-cam.y);dock(c,id,done,active,released,time,reduced);
 if(done)moduleBody(c,id,true,true,time,reduced);
 c.textAlign='center';c.font='600 10px Outfit,sans-serif';c.lineWidth=3;c.strokeStyle='#123049';c.strokeText(done?'MÓDULO CONECTADO':'PUERTO '+(id+1),0,25,190);c.fillStyle=done?'#c6f6d7':'#c2e4e4';c.fillText(done?'MÓDULO CONECTADO':'PUERTO '+(id+1),0,25,190);c.restore();
 if(!done&&!carried&&!s.carrying){
  c.save();c.translate(x,y);dock(c,id,false,active,released,time,reduced);moduleBody(c,id,released,false,time,reduced);
  if(!released){
   for(const side of [-1,1])line(c,'#6a8ca3',3,()=>{c.moveTo(side*24,-81);c.lineTo(side*26,-35);});
  }
  c.restore();
 }
 const tx=done?target.x-cam.x:x,ty=done?target.y-cam.y:y;
 const title=label||STITCHO_WORKSHOP_NAMES[id];c.textAlign='center';c.textBaseline='middle';c.font='600 12px Outfit,sans-serif';
 const w=clamp(c.measureText(title).width+24,110,230);
 plate(c,tx-w/2,ty-132,w,25,done?'#264f53':'#173a53',7,1.3);c.fillStyle=done?'#c4f3d3':'#e1efdf';c.fillText((done?'✓ ':'')+title,tx,ty-119,w-12);
 if(caption){
  c.font='500 10px Outfit,sans-serif';c.lineWidth=3;c.strokeStyle='#102d43';c.strokeText(caption,tx,ty+43,260);c.fillStyle='#d8ece4';c.fillText(caption,tx,ty+43,260);
 }
 if(progress>0&&!done){plate(c,tx-36,ty-99,72,4,'#1b344e',2,0);plate(c,tx-36,ty-99,72*clamp(progress,0,1),4,AMBER,2,0);}
 c.restore();return true;
}

/** The actual carried component, reusing its workshop anatomy at hand size. */
export function drawStitchoCarriedPart(c,id,x,y,t=0,reduced=false){
 c.save();c.translate(x,y);c.scale(.38,.38);c.lineCap='round';c.lineJoin='round';
 moduleBody(c,clamp(id|0,0,2),true,false,reduced?0:t,reduced);c.restore();
}

/** The family lander comes back to life one connected subsystem at a time. */
export function drawStitchoShip(c,g,cam,t=0,reduced=false){
 if(g?.roomId!=='w1-stitcho'||!g.roomDef?.stitchoEncounterVersion)return false;
 const parts=g.world1?.stations||[],count=parts.filter(s=>s.done).length,ready=count===3,time=reduced?0:t;
 c.save();c.translate(12020-cam.x,1134-cam.y);c.lineCap='round';c.lineJoin='round';
 shadow(c,0,-1,142,16,.3);
 // Piston landing gear, a swept tail and the two rear engines remain behind
 // the cream-coloured hull. The visual never covers a platform above it.
 for(const x of [-82,-13,80]){
  limb(c,x*.82,-42,x,-25,x+9,-9,'#7295a5',8);
  plate(c,x-8,-10,35,9,'#35576f',4,1.8);bolt(c,x+6,-6,2.3);
 }
 shape(c,metal(c,66,-125,64,97,'#afcdd0','#6485a4','#2e506f'),()=>{c.moveTo(65,-57);c.lineTo(101,-130);c.quadraticCurveTo(118,-125,112,-70);c.lineTo(127,-48);},2.3);
 plate(c,94,-77,35,33,metal(c,94,-77,35,33,'#c5d9d0','#6e93a7','#365978'),10,2);
 oval(c,127,-60,9,15,'#28465d',0,1.7);oval(c,130,-60,5,10,ready?'#f5c38a':'#657f92',0,1.2);
 if(ready&&!reduced){
  for(let k=0;k<3;k++)shape(c,k%2?'#f4d8a3':'#c8e9d1',()=>{const length=8+Math.sin(time*.13+k)*3;c.moveTo(135,-69+k*7);c.quadraticCurveTo(145+length,-64+k*6,135,-62+k*7);},0);
 }
 shape(c,metal(c,-132,-83,264,66,'#e2e5d0','#a1b9b7','#4e788c'),()=>{c.moveTo(-132,-43);c.bezierCurveTo(-102,-90,10,-106,109,-71);c.quadraticCurveTo(141,-49,117,-27);c.bezierCurveTo(48,-6,-76,-9,-132,-43);},2.7);
 shape(c,'#426c80',()=>{c.moveTo(-123,-41);c.bezierCurveTo(-41,-37,56,-38,124,-49);c.quadraticCurveTo(135,-29,104,-23);c.bezierCurveTo(20,-8,-66,-18,-123,-41);},1.8);
 line(c,'#f4edd4',2,()=>{c.moveTo(-110,-47);c.bezierCurveTo(-67,-76,13,-81,63,-68);});
 // A real cockpit, control wheel and two seats are visible through the glass.
 shape(c,metal(c,-69,-133,119,74,'#c6eee1','#71b1be','#375f81'),()=>{c.moveTo(-71,-73);c.bezierCurveTo(-65,-136,21,-157,51,-79);c.quadraticCurveTo(-7,-51,-71,-73);},2.5);
 shape(c,'#294f67',()=>{c.moveTo(-59,-76);c.quadraticCurveTo(-50,-110,-25,-119);c.lineTo(-25,-70);},1.1);
 shape(c,'#3d667c',()=>{c.moveTo(-18,-122);c.quadraticCurveTo(22,-125,38,-80);c.lineTo(-18,-71);},1.1);
 for(const x of [-40,11]){
  plate(c,x-9,-94,18,22,'#b29a9d',6,1.3);plate(c,x-12,-75,25,9,'#8b7e94',4,1.2);
 }
 oval(c,-48,-77,8,8,'#39647a',0,1.5);line(c,'#b8d2ce',1.5,()=>{c.moveTo(-56,-77);c.lineTo(-40,-77);c.moveTo(-48,-85);c.lineTo(-48,-69);});
 c.save();c.globalAlpha=.44;line(c,'#eaffef',4,()=>{c.moveTo(-51,-113);c.quadraticCurveTo(-20,-138,12,-118);});line(c,'#eaffef',2,()=>{c.moveTo(-50,-103);c.lineTo(-42,-107);});c.restore();
 // Matching sockets describe the three repairs without another collection
 // counter: their shape and warm/cool power states mirror the carried parts.
 for(let k=0;k<3;k++){
  const x=-60+k*55,done=!!parts[k]?.done;plate(c,x-19,-48,38,23,'#2b4b62',7,1.4);
  if(k===0){plate(c,x-7,-44,14,15,done?'#f0c992':'#547286',3,1);for(let n=0;n<2;n++)line(c,'#bed1c6',1,()=>{c.moveTo(x-7,-40+n*6);c.lineTo(x+7,-40+n*6);});}
  else if(k===1){line(c,done?'#c9b0ca':'#64788e',3,()=>c.ellipse(x,-36,11,7,-.3,0,TAU));line(c,done?'#dfcea7':'#5e7488',2,()=>c.ellipse(x,-36,6,10,.4,0,TAU));}
  else {oval(c,x,-36,9,9,done?'#b8d8c4':'#577386',0,1);for(let n=0;n<3;n++)line(c,'#334d66',1.7,()=>{const a=n*TAU/3;c.moveTo(x,-36);c.lineTo(x+Math.cos(a)*7,-36+Math.sin(a)*7);});}
  ventLight(c,x,-22,done?'#c3f0c6':'#496d81',true);
 }
 for(const [x,y] of [[-97,-41],[91,-54],[84,-27],[-92,-30]])bolt(c,x,y,2.4);
 c.textAlign='center';c.font='600 12px Outfit,sans-serif';const title=ready?'LA NAVE ESTÁ LISTA PARA VOLVER':'NAVE DEL HOGAR · '+count+'/3 SISTEMAS';
 const tw=c.measureText(title).width+22;plate(c,-tw/2,-167,tw,24,ready?'#244d50':'#173b54',7,1.1);c.fillStyle=ready?'#c8f1ce':'#e0ead9';c.fillText(title,0,-151);
 c.restore();return true;
}

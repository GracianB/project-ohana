// The three discoveries in each chapter have the same authored object in the
// expedition and in the final ritual. Rendering never grants their progress.
const TAU=Math.PI*2,INK='#192d40';
export const EXPEDITION_ART=Object.freeze({
 kilo:{name:'Carillón de las nubes',color:'#efc68b',dark:'#885b68',light:'#fff2c8'},
 stitcho:{name:'Batería del astillero',color:'#72d7cf',dark:'#33477a',light:'#d9fff1'},
 chispin:{name:'Conductor de tormenta',color:'#f1d373',dark:'#725076',light:'#fff8cc'},
 cat:{name:'Luna del sueño',color:'#cca4eb',dark:'#66518f',light:'#fff0f6'},
 cuerno:{name:'Cometa de la aurora',color:'#9bd6bd',dark:'#59649b',light:'#fff0d8'},
 dragon:{name:'Nido de brasa',color:'#eea16e',dark:'#754256',light:'#ffe9b7'},
 dino:{name:'Corazón fósil',color:'#b9ce8f',dark:'#526660',light:'#f1eed0'},
 frita:{name:'Especia del mercado',color:'#efbd6b',dark:'#95616b',light:'#fff0c9'},
 pizza:{name:'Cena del farero',color:'#e5a474',dark:'#86596b',light:'#fff0ca'},
 yomi:{name:'Archivo de las voces',color:'#8acbd8',dark:'#3c5b84',light:'#ddfbef'}
});
const num=(v,d=0)=>Number.isFinite(v)?v:d;
function shape(c,color,fn,width=2){c.beginPath();fn();c.closePath();c.fillStyle=color;c.fill();if(width){c.strokeStyle=INK;c.lineWidth=width;c.stroke();}}
function line(c,color,width,fn){c.beginPath();fn();c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function oval(c,x,y,rx,ry,color,angle=0,width=1.5){shape(c,color,()=>c.ellipse(x,y,rx,ry,angle,0,TAU),width);}
function panel(c,x,y,w,h,color,r=6,width=2){shape(c,color,()=>c.roundRect(x,y,w,h,r),width);}
function gradient(c,x,y,w,h,a,b,d){const g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,a);if(d)g.addColorStop(.48,b);g.addColorStop(1,d||b);return g;}
function star(c,x,y,r,color,turn=0){shape(c,color,()=>{for(let i=0;i<8;i++){const a=turn+i*TAU/8,rr=i%2?r*.4:r;i?c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr):c.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}},1.3);}
function rivets(c,points,color){for(const [x,y]of points){oval(c,x,y,2.5,2.5,color,0,.8);line(c,INK,.7,()=>{c.moveTo(x-1,y);c.lineTo(x+1,y);});}}
function flame(c,x,y,size,pal,beat=0){c.save();c.translate(x,y);c.scale(size,size);shape(c,pal.color,()=>{c.moveTo(0,-28-beat*2);c.bezierCurveTo(-1,-11,-21,-13,-15,2);c.bezierCurveTo(-10,18,16,17,18,1);c.quadraticCurveTo(18,-8,8,-15);c.quadraticCurveTo(9,-4,3,-4);c.quadraticCurveTo(-2,-11,0,-28-beat*2);});shape(c,pal.light,()=>{c.moveTo(1,-11);c.bezierCurveTo(-12,0,-5,12,3,10);c.quadraticCurveTo(13,5,1,-11);},0);c.restore();}

export function drawExpeditionArtifact(c,hero,x,y,size=100,{index=0,active=true,done=false,windowOpen=true,t=0,reduced=false}={}){
 const p=EXPEDITION_ART[hero];if(!p)return false;
 const clock=reduced?0:num(t),beat=reduced?0:Math.sin(clock*.055+index*1.7),lit=done||active;
 c.save();c.translate(num(x),num(y));const scale=Math.max(.1,num(size,100))/100;c.scale(scale,scale);c.lineJoin='round';c.lineCap='round';
 const metal=gradient(c,-32,-76,58,92,p.light,p.color,p.dark),glass=gradient(c,-26,-62,49,76,'#f1fcf7',p.color,p.dark);
 // A small grounded shadow and fitted socket give even a floating discovery
 // a clear physical location. The outline stays readable when still locked.
 oval(c,0,34,38,7,'#0e23344d',0,0);
 if(lit){c.save();c.globalAlpha=done?.23:.13;oval(c,0,-15,47+beat*2,55,p.color,0,0);c.restore();}
 if(hero==='kilo'){
  for(const side of[-1,1]){shape(c,p.dark,()=>{c.moveTo(side*38,26);c.lineTo(side*32,-73);c.quadraticCurveTo(side*27,-84,side*20,-77);c.lineTo(side*24,26);},2);oval(c,side*31,27,14,5,p.color);}
  shape(c,metal,()=>{c.moveTo(-43,-70);c.quadraticCurveTo(0,-101,43,-70);c.lineTo(39,-60);c.quadraticCurveTo(0,-78,-39,-60);});
  for(let k=-1;k<=1;k++){const yy=-36+Math.abs(k)*7+(lit?beat*(k+2)*1.2:0);line(c,p.dark,2,()=>{c.moveTo(k*18,-68);c.lineTo(k*18,yy);});c.save();c.translate(k*18,yy);shape(c,metal,()=>{c.moveTo(-9,-12);c.quadraticCurveTo(-12,-30,0,-31);c.quadraticCurveTo(12,-30,9,-12);c.lineTo(15,0);c.quadraticCurveTo(0,9,-15,0);});oval(c,0,1,14,4,p.dark);oval(c,0,5,3,4,p.light);line(c,p.light,1.7,()=>{c.moveTo(-6,-22);c.quadraticCurveTo(-8,-13,-7,-8);});c.restore();}
  shape(c,'#9bb69c',()=>{c.moveTo(-15,-82);c.quadraticCurveTo(-30,-102,-34,-84);c.quadraticCurveTo(-25,-75,-15,-82);});star(c,2,-83,8,p.light,-Math.PI/2);
 }else if(hero==='stitcho'){
  for(const side of[-1,1]){panel(c,side*27-7,-58,14,76,p.dark,6);oval(c,side*28,-48,8,5,p.color);line(c,p.light,2,()=>{c.moveTo(side*29,-36);c.lineTo(side*29,-7);});}
  shape(c,glass,()=>{c.moveTo(-20,-66);c.quadraticCurveTo(0,-77,20,-66);c.lineTo(22,12);c.quadraticCurveTo(0,26,-22,12);});
  for(let k=0;k<4;k++){c.save();c.globalAlpha=.48;oval(c,0,-48+k*16,23,7,p.light,-.12,1.1);c.restore();}
  shape(c,p.light,()=>{c.moveTo(5,-50);c.lineTo(-10,-21);c.lineTo(1,-21);c.lineTo(-5,1);c.lineTo(14,-29);c.lineTo(3,-29);},1.2);
  panel(c,-26,-76,52,15,metal,5);panel(c,-29,14,58,14,p.dark,5);rivets(c,[[-19,-69],[19,-69],[-19,21],[19,21]],p.light);
  for(const side of[-1,1]){line(c,p.dark,3,()=>{c.moveTo(side*33,-49);c.bezierCurveTo(side*50,-66,side*49,-26,side*34,-16);});oval(c,side*35,-17,5,5,p.color);}
 }else if(hero==='chispin'){
  panel(c,-33,14,66,17,p.dark,7);panel(c,-24,2,48,17,metal,5);
  for(let k=0;k<4;k++)oval(c,0,-4-k*10,16,5,k%2?p.dark:p.color,0,1.6);
  for(const side of[-1,1]){line(c,INK,8,()=>{c.moveTo(side*7,-38);c.quadraticCurveTo(side*31,-39,side*28,-68);});line(c,p.color,4,()=>{c.moveTo(side*7,-38);c.quadraticCurveTo(side*31,-39,side*28,-68);});oval(c,side*28,-72,8,7,metal);}
  oval(c,0,-59,17,18,glass);star(c,0,-60,10,p.light,-Math.PI/2);
  if(lit){line(c,p.light,2.5,()=>{c.moveTo(-27,-77);c.lineTo(-14,-87);c.lineTo(-9,-78);c.lineTo(7,-91);c.lineTo(14,-79);c.lineTo(27,-77);});}
  rivets(c,[[-24,22],[24,22]],p.light);
 }else if(hero==='cat'){
  panel(c,-27,18,54,12,p.dark,5);oval(c,0,14,31,10,metal);
  for(const side of[-1,1])shape(c,p.color,()=>{c.moveTo(side*6,12);c.bezierCurveTo(side*34,-4,side*51,-34,side*32,-51);c.quadraticCurveTo(side*41,-15,side*6,12);},1.8);
  c.save();c.translate(0,beat*2);shape(c,gradient(c,-25,-76,50,65,p.light,p.color),()=>{c.moveTo(20,-77);c.bezierCurveTo(-42,-94,-48,-11,14,-12);c.bezierCurveTo(-16,-22,-15,-62,20,-77);},2.2);
  star(c,15,-49,12,p.light,-Math.PI/2);oval(c,-20,-41,3,3,'#fff9ed',0,0);line(c,'#fff9ed',2,()=>{c.moveTo(-21,-62);c.quadraticCurveTo(-35,-44,-28,-31);});c.restore();
  for(let k=-1;k<=1;k++){line(c,p.dark,1,()=>{c.moveTo(k*13,9);c.lineTo(k*13,-10-Math.abs(k)*4);});oval(c,k*13,-13-Math.abs(k)*4,3,5,p.light);}
 }else if(hero==='cuerno'){
  for(const side of[-1,1]){shape(c,metal,()=>{c.moveTo(side*69,40);c.bezierCurveTo(side*82,6,side*78,-26,side*72,-37);c.lineTo(side*58,-36);c.quadraticCurveTo(side*71,10,side*53,40);});oval(c,side*62,39,23,7,p.dark);shape(c,p.light,()=>{c.moveTo(side*73,-37);c.lineTo(side*68,-66);c.lineTo(side*58,-37);},1.6);}
  for(let k=0;k<5;k++)line(c,['#edb6d2','#f5dca3','#c7e2af','#a6dedd','#c1b8e7'][k],6,()=>c.ellipse(0,-29,64+k*3.5,65+k*3.5,0,Math.PI,TAU));
  star(c,0,-109,14,p.light,-Math.PI/2);for(const side of[-1,1])star(c,side*45,-91,6,p.light);
  for(let k=-1;k<=1;k++)oval(c,k*21,-22+beat*2,3.4,3.4,p.light,0,.8);
 }else if(hero==='dragon'){
  for(let k=0;k<5;k++){c.save();c.translate((k-2)*12,17-Math.abs(k-2)*3);c.rotate((k-2)*.15);panel(c,-24,-3,48,10,k%2?p.dark:'#93614e',5,1.5);c.restore();}
  shape(c,glass,()=>{c.moveTo(0,-72);c.bezierCurveTo(-29,-53,-31,-4,-15,5);c.quadraticCurveTo(0,15,17,5);c.bezierCurveTo(34,-12,23,-57,0,-72);});
  for(const side of[-1,1])shape(c,p.dark,()=>{c.moveTo(side*14,-51);c.quadraticCurveTo(side*35,-65,side*41,-37);c.quadraticCurveTo(side*28,-44,side*24,-25);},1.5);
  line(c,p.light,3,()=>{c.moveTo(-12,-54);c.quadraticCurveTo(-21,-33,-15,-21);});
  flame(c,1,-20,.7,p,beat);star(c,0,-74,6,p.light,-Math.PI/2);
  for(let k=0;k<3;k++)oval(c,-22+k*20,27,6,3,p.color,0,1);
 }else if(hero==='dino'){
  shape(c,gradient(c,-65,-30,124,60,'#a4b49b','#75897d','#3a5154'),()=>{c.moveTo(-68,16);c.lineTo(-57,-5);c.lineTo(-33,-26);c.lineTo(5,-34);c.lineTo(41,-21);c.lineTo(65,1);c.lineTo(69,21);c.quadraticCurveTo(0,40,-68,16);});
  oval(c,0,-1,44,18,p.dark,-.05,2);oval(c,0,-7,34,16,metal,-.05,1.6);
  shape(c,p.light,()=>{c.moveTo(0,-9);c.bezierCurveTo(-29,-21,-22,-47,-6,-39);c.quadraticCurveTo(0,-35,0,-29);c.bezierCurveTo(17,-55,37,-23,0,-9);},1.6);
  line(c,p.dark,2,()=>{c.moveTo(-48,11);c.lineTo(-30,16);c.lineTo(-19,9);c.moveTo(23,20);c.lineTo(37,9);c.lineTo(51,14);});
  for(const side of[-1,1])for(let k=0;k<3;k++)oval(c,side*(26+k*5),-11-k*3,5-k,2.8,p.light,side*.55,1);
 }else if(hero==='frita'){
  c.save();c.translate(0,beat*3);shape(c,glass,()=>{c.moveTo(-23,-59);c.bezierCurveTo(-52,-55,-39,-8,-13,-5);c.lineTo(-11,8);c.lineTo(11,8);c.lineTo(14,-5);c.bezierCurveTo(43,-10,51,-54,23,-59);c.closePath();});
  for(const side of[-1,1])line(c,p.dark,1.6,()=>{c.moveTo(side*13,7);c.lineTo(side*16,24);});panel(c,-21,20,42,15,metal,5);
  panel(c,-22,-67,44,13,p.dark,4);panel(c,-15,-76,30,12,metal,3);oval(c,0,-34,21,14,p.light,0,1.5);
  for(let k=-1;k<=1;k++){shape(c,['#be704f','#d59b58','#8d9c65'][k+1],()=>{c.moveTo(k*10,-40);c.quadraticCurveTo(k*10+9,-32,k*10,-25);c.quadraticCurveTo(k*10-7,-32,k*10,-40);},.8);}
  line(c,'#fff8e3',2.3,()=>{c.moveTo(-25,-53);c.quadraticCurveTo(-35,-41,-26,-22);});c.restore();
 }else if(hero==='pizza'){
  panel(c,-36,16,72,11,p.dark,5);oval(c,0,12,41,10,metal,0,2);
  shape(c,glass,()=>{c.moveTo(-35,10);c.bezierCurveTo(-36,-18,-24,-39,0,-41);c.bezierCurveTo(25,-39,37,-17,35,10);c.quadraticCurveTo(0,25,-35,10);});
  oval(c,0,-44,8,5,p.dark);oval(c,0,-49,5,5,p.color);line(c,p.light,2.7,()=>{c.moveTo(-22,-23);c.quadraticCurveTo(-25,-9,-24,-4);});
  shape(c,p.light,()=>{c.moveTo(-16,-10);c.lineTo(13,-25);c.lineTo(17,-6);c.closePath();},1.2);line(c,'#b47456',3,()=>{c.moveTo(-16,-10);c.lineTo(13,-25);});oval(c,5,-15,3,3,'#bc7068',0,.5);
  for(let k=0;k<2;k++)line(c,p.light,1.5,()=>{c.moveTo(-8+k*17,-59);c.bezierCurveTo(-17+k*17,-65,2+k*17,-69,-6+k*17,-76);});
 }else if(hero==='yomi'){
  panel(c,-39,15,78,15,p.dark,7);panel(c,-29,3,58,15,metal,5);
  for(const side of[-1,1]){shape(c,gradient(c,side*4,-63,side*39,69,p.light,p.color,p.dark),()=>{c.moveTo(side*2,-55);c.quadraticCurveTo(side*22,-76,side*39,-62);c.lineTo(side*40,-6);c.quadraticCurveTo(side*20,-16,side*2,-2);});
   for(let k=0;k<4;k++)line(c,p.light,1.5,()=>{c.moveTo(side*8,-44+k*9);c.quadraticCurveTo(side*19,-53+k*9,side*31,-46+k*9);});
   panel(c,side*35-5,-72,10,76,p.dark,3,1.4);oval(c,side*35,-65,2,2,windowOpen?p.light:'#c98f9e',0,0);}
  line(c,p.dark,3,()=>{c.moveTo(0,-57);c.lineTo(0,-2);});oval(c,0,-73,13,11,glass);star(c,0,-74,7,windowOpen?p.light:'#c98f9e',-Math.PI/2);
 }
 if(done){c.save();c.globalAlpha=.8;star(c,36,-59,7,p.light,-Math.PI/2);c.restore();}
 if(!lit){c.save();c.globalAlpha=.3;oval(c,0,-20,37,43,'#536477',0,0);c.restore();}
 c.restore();return true;
}

export function drawExpeditionSupport(c,hero,x,y,{t=0,reduced=false,source=false}={}){
 const p=EXPEDITION_ART[hero];if(!p)return;c.save();c.translate(num(x),num(y));c.lineJoin='round';c.lineCap='round';
 if(hero==='dragon'||hero==='frita'){
  const isVent=hero==='dragon';oval(c,0,-7,59,16,p.dark,0,2.3);oval(c,0,-11,44,10,p.color,0,1.7);
  for(let k=-2;k<=2;k++)line(c,INK,3,()=>{c.moveTo(k*12-3,-14);c.lineTo(k*12+3,-7);});
  if(!isVent){shape(c,p.dark,()=>{c.moveTo(-37,-14);c.lineTo(-32,-40);c.lineTo(30,-40);c.lineTo(37,-14);});for(let k=0;k<3;k++)line(c,p.light,2,()=>{c.moveTo(-29,-21-k*6);c.lineTo(28,-21-k*6);});panel(c,-36,-49,72,12,p.color,5);}
  else for(let k=0;k<3;k++){const u=reduced?(k+.5)/3:((num(t)*.008+k/3)%1);c.save();c.globalAlpha=.65*(1-u);line(c,p.light,2.8,()=>{c.moveTo(-30,-17-u*120);c.bezierCurveTo(-8,-35-u*120,9,1-u*120,30,-17-u*120);});c.restore();}
 }else if(hero==='pizza'&&source){
  shape(c,gradient(c,-52,-83,104,85,p.color,p.dark),()=>{c.moveTo(-52,0);c.lineTo(-52,-32);c.bezierCurveTo(-49,-104,49,-104,52,-32);c.lineTo(52,0);});
  shape(c,'#253544',()=>{c.moveTo(-32,-1);c.lineTo(-32,-28);c.bezierCurveTo(-31,-65,31,-65,32,-28);c.lineTo(32,-1);});
  for(const side of[-1,1])for(let k=0;k<3;k++)line(c,p.light,2,()=>{c.moveTo(side*39,-13-k*17);c.lineTo(side*50,-13-k*17);});
  flame(c,0,-18,.63,p,reduced?0:Math.sin(num(t)*.1));panel(c,-59,-3,118,11,p.dark,4);oval(c,0,-76,7,5,p.light);
 }
 c.restore();
}

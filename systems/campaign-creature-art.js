import {drawKiloCreature} from './kilo-chapter-art-v606.js';
import {drawStitchoCreature} from './stitcho-chapter-art-v607.js';
import {drawChispinCreature} from './chispin-chapter-art-v608.js';
import {drawCatCreature} from './cat-chapter-art-v609.js';
import {drawFaunaMorph} from './fauna-morphs.js';
import {drawChapterSpecies,drawChapterSpeciesCue} from './chapter-species-v604.js';
// Ten locally authored fauna families. Role equipment is drawn separately;
// silhouettes, limbs and anticipation come from the actual combat state.
const TAU=Math.PI*2,INK='#243044';
export const CHAPTER_FAUNA=Object.freeze({
 kilo:{name:'Cangrejos del tambor',body:'#bf805d',light:'#f0c386',dark:'#7c4e4b'},
 stitcho:{name:'Chatarrines',body:'#548da9',light:'#b1e0e7',dark:'#2e516e'},
 chispin:{name:'Polillas del trueno',body:'#b39bc3',light:'#fff0ac',dark:'#655b91'},
 cat:{name:'Farolunas',body:'#b397d0',light:'#f4d9ed',dark:'#715c9b'},
 cuerno:{name:'Escarabajos del musgo',body:'#76a68a',light:'#d2deb0',dark:'#466d69'},
 dragon:{name:'Salamandras de escoria',body:'#78617c',light:'#ffb67b',dark:'#3c344e'},
 dino:{name:'Corazas fósiles',body:'#92a683',light:'#eee0ad',dark:'#526c61'},
 frita:{name:'Bandidos de palomita',body:'#e9bd7e',light:'#fff0b9',dark:'#a07361'},
 pizza:{name:'Diablillos de masa',body:'#dcaa80',light:'#ffe1ad',dark:'#97635a'},
 yomi:{name:'Grullas de papel astral',body:'#8bbed0',light:'#ebf1d8',dark:'#506d91'}
});
function oval(c,x,y,rx,ry,col,a=0){c.fillStyle=col;if(rx>12&&ry>9){const g=c.createLinearGradient(x-rx,y-ry,x+rx,y+ry);g.addColorStop(0,'#f8e6c7');g.addColorStop(.28,col);g.addColorStop(1,INK);c.fillStyle=g;}c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),a,0,TAU);c.fill();c.stroke();}
function path(c,col,points){c.fillStyle=col;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();c.stroke();}
function line(c,col,w,fn){c.strokeStyle=col;c.lineWidth=w;c.beginPath();fn();c.stroke();}
function eyes(c,x,y,space,wind,hurt){
 c.strokeStyle=INK;c.lineWidth=1.5;
 for(const side of [-1,1]){
  if(hurt){line(c,INK,1.7,()=>{c.moveTo(x+side*space-3,y-1);c.lineTo(x+side*space+3,y+1);});continue;}
  oval(c,x+side*space,y,4.2,wind?4:5.2,'#fff9df');
  oval(c,x+side*space+(wind?1:0),y+1,1.8,2.7,INK);
  c.fillStyle='#fff';c.beginPath();c.arc(x+side*space-1,y-1,1,0,TAU);c.fill();
 }
}
export function drawCampaignCreature(c,e,cam,t,reduced=false){
 if(drawKiloCreature(c,e,cam,t,reduced))return true;
 if(drawStitchoCreature(c,e,cam,t,reduced))return true;
 if(drawChispinCreature(c,e,cam,t,reduced))return true;
 if(drawCatCreature(c,e,cam,t,reduced))return true;
 const hero=String(e.roomId||'').replace('w1-',''),P=CHAPTER_FAUNA[hero];
 if(!P||!e.campaignRole||e.boss||e.miniBoss)return false;
 const a=e._campaign||{},time=reduced?0:t,phase=time*.19+(e.spawnIndex||0),run=Math.abs(e.vx||0)>.4,
  wind=(a.wind||0)>0,active=(a.active||0)>0,hurt=e.invuln>0||e.stun>5,
  step=run?Math.sin(phase):0,face=Math.sign(e.vx)||a.aim||1;
 const height=Math.max(58,Math.min(108,e.h||58)),scale=height/64;
 c.save();c.translate(e.x+e.w/2-cam.x,e.y+e.h-cam.y);c.scale(scale*face,scale);
 c.globalAlpha=e.dying?Math.max(0,Math.min(1,e.dying/28)):1;c.lineJoin='round';c.lineCap='round';c.lineWidth=1.8;c.strokeStyle=INK;
 if(e.campaignRole==='flyer')c.translate(0,reduced?0:Math.sin(time*.08)*2);
 else if(run)c.translate(0,-Math.abs(step)*2);
 if(wind){c.translate(-2,2);c.scale(1.06,.94);}else if(active)c.rotate(.1);else if(hurt)c.rotate(-.12);
 const morphed=drawChapterSpecies(c,e,{time,step,wind,hurt,reduced},P)||drawFaunaMorph(c,e.campaignRole,P,{wind,hurt,time,step,hero,reduced});
 if(!morphed){
 // Grounded creatures articulate contact, knee and foot independently.
 if(!['cat','yomi'].includes(hero)&&e.campaignRole!=='flyer')for(const side of [-1,1])for(let back=0;back<2;back++){
  const root=side*(12+back*5),swing=step*(back?-1:1)*4;
  line(c,back?P.dark:INK,back?3:4,()=>{c.moveTo(root,-21);c.lineTo(root+side*8,-10-Math.max(0,swing));c.lineTo(root+side*13+swing,-2-Math.max(0,-swing));});
  line(c,P.light,2,()=>{c.moveTo(root+side*11+swing,-1-Math.max(0,-swing));c.lineTo(root+side*16+swing,-1-Math.max(0,-swing));});
 }
 c.strokeStyle=INK;c.lineWidth=1.8;
 if(hero==='kilo'){
  for(let side of [-1,1]){line(c,P.dark,4,()=>{c.moveTo(side*17,-26);c.quadraticCurveTo(side*32,-36,side*31,-44+step*2);});oval(c,side*31,-44+step*2,7,6,P.body);}
  oval(c,0,-28,22,20,P.body);oval(c,-3,-40,20,8,P.light);
  for(let i=-2;i<=2;i++)line(c,P.dark,1,()=>{c.moveTo(i*7,-43);c.lineTo(i*8,-37);});
  line(c,P.light,2,()=>{c.moveTo(-18,-22);c.quadraticCurveTo(0,-15,18,-22);});eyes(c,5,-29,7,wind,hurt);
 }else if(hero==='stitcho'){
  oval(c,0,-29,22,18,P.dark);oval(c,0,-32,20,16,P.body);
  c.fillStyle=P.light;c.beginPath();c.roundRect(-15,-40,30,17,7);c.fill();c.stroke();eyes(c,2,-33,7,wind,hurt);
  for(let i=0;i<3;i++)oval(c,-13+i*12,-17,2,2,'#ffd39b');
  for(let side of [-1,1]){line(c,P.light,2,()=>{c.moveTo(side*12,-44);c.lineTo(side*19,-55+(wind?-3:0));});oval(c,side*19,-55,3.3,3.3,'#a8f0d8');}
 }else if(hero==='chispin'){
  for(let side of [-1,1])for(let k=0;k<2;k++)oval(c,side*(19+k*5),-34+k*13,12,17,P.light,side*(.55+(reduced?0:Math.sin(time*.3)*.2)));
  oval(c,0,-28,11,21,P.body);for(let k=0;k<3;k++)line(c,P.dark,2,()=>{c.moveTo(-8,-21-k*6);c.lineTo(8,-21-k*6);});
  oval(c,1,-43,14,12,P.light);eyes(c,4,-44,5,wind,hurt);
  for(let side of [-1,1])line(c,P.dark,2,()=>{c.moveTo(side*6,-53);c.quadraticCurveTo(side*15,-65,side*18,-57);});
 }else if(hero==='cat'){
  for(let i=0;i<6;i++){const x=-18+i*7;line(c,i%2?P.body:P.light,2.4,()=>{c.moveTo(x,-23);c.bezierCurveTo(x-6,-17,x+Math.sin(time*.08+i)*7,-9,x+Math.sin(time*.08+i)*5,-2);});}
  c.fillStyle=P.body;c.beginPath();c.moveTo(-24,-24);c.bezierCurveTo(-28,-58,23,-65,25,-24);c.quadraticCurveTo(0,-14,-24,-24);c.fill();c.stroke();
  oval(c,-8,-43,9,4,P.light,-.4);eyes(c,4,-33,6,wind,hurt);
  for(let i=-2;i<=2;i++)oval(c,i*9,-22,4,3,P.light);
 }else if(hero==='cuerno'){
  oval(c,-5,-28,24,20,P.dark);oval(c,-7,-34,23,19,P.body);oval(c,-10,-37,15,12,P.light);
  line(c,P.dark,1.7,()=>{c.moveTo(-12,-47);c.bezierCurveTo(-28,-33,-11,-22,-3,-33);c.bezierCurveTo(2,-42,-10,-45,-13,-37);});
  oval(c,16,-29,12,12,P.body);eyes(c,19,-31,4.5,wind,hurt);
  for(let side of [-1,1]){line(c,P.dark,2,()=>{c.moveTo(15+side*6,-38);c.quadraticCurveTo(9+side*16,-51,9+side*18,-54);});oval(c,9+side*18,-54,6,2.5,P.light,side*.7);}
 }else if(hero==='dragon'){
  line(c,P.dark,9,()=>{c.moveTo(-14,-24);c.bezierCurveTo(-42,-12,-43,-39,-28,-43);});
  oval(c,0,-25,24,15,P.body);oval(c,19,-37,14,13,P.dark);oval(c,24,-32,11,6,P.body);
  for(let i=0;i<6;i++){const x=-21+i*6;path(c,P.light,[[x,-38],[x+3,-47+(i%2)*4],[x+7,-36]]);}
  eyes(c,20,-39,5,wind,hurt);line(c,P.light,1.3,()=>{c.moveTo(-17,-24);c.lineTo(-7,-29);c.lineTo(2,-22);c.lineTo(12,-26);});
 }else if(hero==='dino'){
  oval(c,-4,-27,25,21,P.dark);oval(c,-6,-32,24,20,P.body);
  for(let i=-2;i<=2;i++){line(c,P.light,5,()=>{c.moveTo(i*8-8,-47);c.quadraticCurveTo(i*8+4,-34,i*8-2,-17);});}
  oval(c,20,-25,13,11,P.body);eyes(c,23,-29,4.5,wind,hurt);
  for(let side of [-1,1])path(c,P.light,[[20+side*7,-34],[20+side*11,-44],[20+side*3,-38]]);
 }else if(hero==='frita'){
  for(let i=0;i<5;i++)oval(c,(i-2)*8,-38-(i%2)*9,10,12,P.light);
  oval(c,0,-26,19,20,P.body);path(c,'#465d83',[[-18,-27],[18,-27],[14,-8],[-14,-8]]);
  line(c,'#f8e2a0',2,()=>{c.moveTo(-12,-24);c.lineTo(0,-14);c.lineTo(12,-24);});eyes(c,3,-39,6,wind,hurt);
 }else if(hero==='pizza'){
  oval(c,-1,-27,24,18,P.body);oval(c,9,-39,17,14,P.light);
  for(let side of [-1,1])path(c,P.dark,[[8+side*11,-47],[8+side*22,-58],[8+side*17,-36]]);
  for(let i=0;i<3;i++)oval(c,-16+i*10,-22,3,2,'#ad6952');eyes(c,12,-40,6,wind,hurt);
  c.fillStyle='#fdf5dc';c.beginPath();c.roundRect(-6,-58,28,7,3);c.fill();c.stroke();for(let i=0;i<3;i++)oval(c,2+i*7,-61,5,5,'#fdf5dc');
 }else if(hero==='yomi'){
  for(let side of [-1,1])path(c,side<0?P.body:P.light,[[0,-29],[side*32,-47-(reduced?0:Math.sin(time*.12)*4)],[side*24,-20],[side*7,-11]]);
  path(c,P.body,[[-11,-34],[6,-44],[20,-32],[9,-14],[-5,-9]]);
  path(c,P.light,[[6,-44],[20,-32],[35,-31],[19,-24]]);
  line(c,P.dark,1,()=>{c.moveTo(-11,-34);c.lineTo(9,-14);c.moveTo(6,-44);c.lineTo(4,-25);});eyes(c,13,-34,4,wind,hurt);
  for(let i=0;i<3;i++)path(c,P.light,[[-6-i*5,-13-i*2],[-20-i*5,-3],[-8-i*5,-5-i*2]]);
 }
 if(e.campaignRole==='flyer'&&!['chispin','cat','yomi'].includes(hero))for(let side of [-1,1]){
  c.save();c.globalAlpha=.55;c.strokeStyle=P.light;c.lineWidth=1.3;
  oval(c,side*24,-39,15,7,P.light,side*(reduced?-.25:Math.sin(time*.25)*.5));c.restore();
 }
 // Hero-specific surface anatomy: segmented shell, feathers, gills or armour.
 c.strokeStyle=P.dark;c.lineWidth=1.1;
 if(['dino','cuerno','kilo'].includes(hero))for(let k=-2;k<=2;k++){c.beginPath();c.moveTo(k*8,-40);c.quadraticCurveTo(k*10+5,-30,k*8,-17);c.stroke();}
 if(['chispin','yomi'].includes(hero))for(let side of [-1,1])for(let k=0;k<3;k++){c.strokeStyle=P.dark;c.beginPath();c.moveTo(side*9,-31);c.lineTo(side*(21+k*4),-45+k*7);c.stroke();}
 if(hero==='dragon')for(let k=-2;k<=1;k++){c.fillStyle=P.light;c.beginPath();c.moveTo(k*7,-35);c.lineTo(k*7+4,-44);c.lineTo(k*7+8,-33);c.fill();c.stroke();}
 if(hero==='stitcho'){c.strokeStyle=P.light;c.lineWidth=2;c.beginPath();c.moveTo(-18,-40);c.quadraticCurveTo(-11,-50,0,-46);c.stroke();c.fillStyle='#f1be91';c.fillRect(-16,-22,4,3);c.fillRect(10,-22,4,3);}
 if(['frita','pizza'].includes(hero)){c.strokeStyle=P.dark;c.beginPath();c.moveTo(2,-29);c.quadraticCurveTo(10,-22,18,-29);c.stroke();}
 if(hero==='cat'){c.strokeStyle=P.light;for(let side of [-1,1]){c.beginPath();c.moveTo(side*15,-28);c.quadraticCurveTo(side*38,-23,side*39,-32);c.stroke();}}
 }
 if(wind)drawChapterSpeciesCue(c,e,time,reduced);
 c.restore();
 if(e.hp<e.max&&e.hp>0){const x=e.x-cam.x,y=e.y-cam.y-10;c.save();c.fillStyle='#1b2b40';c.fillRect(x,y,e.w,4);c.fillStyle=P.light;c.fillRect(x,y,e.w*Math.max(0,e.hp/e.max),4);c.restore();}
 return true;
}

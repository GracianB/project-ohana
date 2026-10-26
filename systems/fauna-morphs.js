// Role is visible in anatomy, not an icon strapped to the same body.
export const faunaMorph=role=>({shield:'carapace',shooter:'spitter',gunner:'spitter',jumper:'leaper',flyer:'winged',burrower:'burrower',pursuer:'native',captain:'native'}[role]||'native');
const TAU=Math.PI*2,I='#243044';
function line(c,col,w,fn){c.beginPath();fn();c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.stroke();}
function shape(c,col,fn){c.beginPath();fn();c.closePath();c.fillStyle=col;c.fill();c.strokeStyle=I;c.lineWidth=1.8;c.stroke();}
function oval(c,x,y,rx,ry,col,a=0){const g=c.createLinearGradient(x-rx,y-ry,x+rx,y+ry);g.addColorStop(0,'#f2e6c7');g.addColorStop(.3,col);g.addColorStop(1,'#35465d');shape(c,g,()=>c.ellipse(x,y,rx,ry,a,0,TAU));}
function eyes(c,x,y,space,wind,hurt){for(const side of [-1,1]){if(hurt){line(c,I,2,()=>{c.moveTo(x+side*space-4,y-2);c.lineTo(x+side*space+4,y+2);});continue;}oval(c,x+side*space,y,4.6,wind?4.2:5.5,'#fff4cf');c.fillStyle=I;c.beginPath();c.ellipse(x+side*space+1,y+.5,2.1,3.2,0,0,TAU);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(x+side*space-1,y-2,1.1,0,TAU);c.fill();}}
export function drawFaunaMorph(c,role,P,{wind=false,hurt=false,time=0,step=0,hero='',reduced=false}={}){
 const morph=faunaMorph(role);if(morph==='native')return false;
 if(morph==='carapace'){
  // Six jointed feet, inset head and a segmented convex shell.
  for(const side of [-1,1])for(let k=0;k<3;k++){const x=side*(10+k*6),swing=step*(k%2?3:-3);line(c,I,4,()=>{c.moveTo(x,-20);c.lineTo(x+side*13,-13+swing);c.lineTo(x+side*20+swing,-2);});line(c,P.light,1.5,()=>{c.moveTo(x+side*20+swing,-2);c.lineTo(x+side*24+swing,-2);});}
  oval(c,-4,-30,28,25,P.body,-.1);oval(c,-8,-36,20,15,P.light,-.25);for(let k=-2;k<=2;k++)line(c,P.dark,1.7,()=>{c.moveTo(-9+k*9,-52);c.quadraticCurveTo(k*13,-31,-7+k*10,-11);});
  oval(c,22,-24,13,12,P.body);eyes(c,25,-27,4.5,wind,hurt);line(c,P.light,2,()=>{c.moveTo(17,-38);c.quadraticCurveTo(29,-45,35,-32);});
  for(let k=0;k<5;k++){c.fillStyle=P.dark;c.beginPath();c.arc(-23+k*9,-23+Math.sin(k)*4,1.2,0,TAU);c.fill();}
 }else if(morph==='leaper'){
  // A sprung pelvis, huge folded hind legs and splayed finger pads.
  for(const side of [-1,1]){oval(c,side*20,-19,13,19,P.dark,side*.7);line(c,I,5,()=>{c.moveTo(side*14,-11);c.quadraticCurveTo(side*38,-5,side*28,-2);});for(let k=0;k<3;k++)line(c,P.light,2.4,()=>{c.moveTo(side*25,-2);c.lineTo(side*(31+k*4),-1-k%2*3);});}
  oval(c,0,-27,21,23,P.body);oval(c,0,-24,13,14,P.light);oval(c,0,-47,25,14,P.body);
  for(const side of [-1,1]){oval(c,side*14,-53,9,9,P.light);line(c,P.dark,4,()=>{c.moveTo(side*15,-32);c.quadraticCurveTo(side*27,-25,side*24,-10);});}
  eyes(c,2,-53,13,wind,hurt);line(c,I,1.7,()=>{c.moveTo(-13,-41);c.quadraticCurveTo(0,-34,15,-42);});for(let k=-1;k<=1;k++)oval(c,k*9,-25,2.3,4,P.body);
 }else if(morph==='spitter'){
  // A beetle abdomen, long articulated neck and an organic cannon-mouth.
  for(const side of [-1,1])for(let k=0;k<2;k++)line(c,P.dark,3,()=>{const x=side*(11+k*6);c.moveTo(x,-20);c.lineTo(x+side*8,-10);c.lineTo(x+side*14+step*(k?3:-3),-1);});
  oval(c,-9,-26,25,21,P.body,-.2);line(c,P.light,3,()=>{c.moveTo(-27,-31);c.quadraticCurveTo(-10,-50,7,-35);});
  for(let k=0;k<4;k++)line(c,P.dark,1.3,()=>{c.moveTo(-26+k*8,-40);c.quadraticCurveTo(-29+k*10,-25,-23+k*8,-12);});
  line(c,I,17,()=>{c.moveTo(6,-29);c.quadraticCurveTo(15,-34,12,-51);});line(c,P.body,12,()=>{c.moveTo(6,-29);c.quadraticCurveTo(15,-34,12,-51);});oval(c,18,-52,17,13,P.light);oval(c,31,-48,12,8,P.body);oval(c,38,-48,5,5,P.dark);eyes(c,18,-55,5.5,wind,hurt);
  for(const side of [-1,1])line(c,P.dark,2,()=>{c.moveTo(13+side*7,-61);c.quadraticCurveTo(9+side*16,-73,6+side*18,-68);});
  if(wind)oval(c,38,-48,3,3,'#fff0a8');
 }else if(morph==='winged'){
  const flap=reduced?0:Math.sin(time*.26)*.38;
  for(const side of [-1,1])for(let k=0;k<2;k++){
   c.save();c.translate(side*7,-33);c.rotate(side*(flap+k*.24));shape(c,k?P.body:P.light,()=>{c.moveTo(0,5);c.bezierCurveTo(side*7,-14,side*28,-35,side*38,-29);c.bezierCurveTo(side*43,-7,side*27,13,side*8,12);});
   for(let j=0;j<3;j++)line(c,P.dark,1,()=>{c.moveTo(0,5);c.quadraticCurveTo(side*(16+j*3),-8,side*(22+j*5),-23+j*9);});c.restore();
  }
  oval(c,0,-27,10,21,P.body);for(let k=0;k<4;k++)line(c,P.dark,1.5,()=>{c.moveTo(-7,-17-k*6);c.lineTo(7,-17-k*6);});oval(c,2,-47,13,12,P.light);eyes(c,4,-49,5,wind,hurt);
  for(const side of [-1,1]){line(c,P.dark,2,()=>{c.moveTo(side*5,-57);c.quadraticCurveTo(side*13,-71,side*19,-66);});line(c,P.body,2,()=>{c.moveTo(side*6,-13);c.lineTo(side*14,-4);});}
 }else if(morph==='burrower'){
  for(let k=4;k>=0;k--){const x=-27+k*13,y=-17-Math.sin(k*.6+time*.07)*3;oval(c,x,y,12,15,k%2?P.body:P.dark);line(c,P.light,1.4,()=>{c.moveTo(x-5,y-9);c.quadraticCurveTo(x+6,y-11,x+7,y+2);});}
  oval(c,29,-24,17,16,P.body);eyes(c,32,-28,6,wind,hurt);for(const side of [-1,1]){line(c,P.dark,5,()=>{c.moveTo(20,-13);c.quadraticCurveTo(29,0,40,-6+side*2);});line(c,P.light,2,()=>{c.moveTo(35,-6+side*2);c.lineTo(45,-12+side*2);});}
 }
 // The biome lives in skin details, so anatomy can vary within one room.
 if(hero==='stitcho'){for(const x of [-12,7,20])oval(c,x,-27,1.7,1.7,'#dbb188');}
 if(['dino','dragon','cuerno'].includes(hero)){for(let k=-1;k<=1;k++)line(c,P.light,1,()=>{c.moveTo(k*9-4,-34);c.lineTo(k*9+3,-28);c.lineTo(k*9-1,-23);});}
 return true;
}

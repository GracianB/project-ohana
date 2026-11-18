import {drawLivingEclipse} from './quimera-eclipse.js';
// A quiet sanctuary behind the fight. No high-contrast decoration at floor level.
import {WORLD1_ORDER,WORLD1_THEMES} from './world1-rooms.js';
const TAU=Math.PI*2;
export function drawQuimeraSanctum(c,{x,y,phase=1,time=0,freed=false,reduce=false,width=1600,height=1000,player,cam,boss,arena}){
 c.save();const tick=reduce?0:time;
 const sky=c.createLinearGradient(0,0,0,height);sky.addColorStop(0,'#07101f');sky.addColorStop(.6,'#173447');sky.addColorStop(1,'#254553');c.fillStyle=sky;c.fillRect(0,0,width,height);
 const halo=c.createRadialGradient(x,y,35,x,y,Math.min(width*.7,600));halo.addColorStop(0,freed?'#a6bcb344':'#698f9c44');halo.addColorStop(.55,'#3c747c16');halo.addColorStop(1,'#0b233000');c.fillStyle=halo;c.fillRect(0,0,width,height);
 // Drifting nebulae bend toward the hero, using only three broad color fields.
 for(let i=0;i<3;i++){
  const drift=reduce?0:Math.sin(tick*.002+i)*width*.035,px=width*(.22+i*.29)+drift,py=height*(.24+i*.13);
  const cloud=c.createRadialGradient(px,py,5,px,py,width*.42);cloud.addColorStop(0,['#30567424','#5260811f','#4c817526'][i]);cloud.addColorStop(1,'#1c375000');c.fillStyle=cloud;c.fillRect(0,0,width,height);
 }
 // The eclipsed moon is negative space, with a quiet crescent on its upper edge.
 const radius=Math.min(230,width*.23,height*.3);
 c.fillStyle='#8eaeb11c';c.beginPath();c.arc(x,y,radius+8,0,TAU);c.fill();const moon=c.createLinearGradient(x-radius,y-radius,x+radius,y+radius);moon.addColorStop(0,'#e0ecce');moon.addColorStop(.32,'#9bc2b4');moon.addColorStop(.7,'#588992');moon.addColorStop(1,'#23485f');c.fillStyle=moon;c.globalAlpha=.28+phase*.025;c.beginPath();c.arc(x,y,radius,0,TAU);c.fill();c.globalAlpha=1;const shadow=c.createRadialGradient(x-radius*.1,y-radius*.2,radius*.05,x,y,radius);shadow.addColorStop(0,'#234251');shadow.addColorStop(.7,'#152c40');shadow.addColorStop(1,'#0b1d31');c.fillStyle=shadow;c.beginPath();c.arc(x+radius*.09,y+radius*.14,radius*.97,0,TAU);c.fill();
 drawLivingEclipse(c,{x,y,radius,phase,time,freed,reduce,player,cam,boss,arena});
 // Depth layers are large silhouettes, rather than a polygonal constellation.
 for(let layer=0;layer<2;layer++)for(let side of[-1,1]){
  const px=x+side*(radius+90+layer*180),base=height*.92,h=height*(.73-layer*.12),w=36+layer*19;
  c.fillStyle=layer?'#0b1b2b':'#0d2030';c.beginPath();c.moveTo(px-w,base);c.lineTo(px-w*.7,base-h);c.quadraticCurveTo(px+side*70,base-h-75,px+side*111,base-h-84);c.quadraticCurveTo(px+side*48,base-h-27,px+w*.7,base-h+75);c.lineTo(px+w,base);c.closePath();c.fill();
 }
 // Suspended moonstone fragments establish depth between the pillars and eye.
 for(let i=0;i<9;i++){
  const px=width*(.08+i*.105)+Math.sin(i*7)*17,py=height*(.23+(i%3)*.18)+(reduce?0:Math.sin(tick*.009+i)*5),w=16+(i%3)*11;
  c.globalAlpha=.15;c.fillStyle='#739397';c.beginPath();c.moveTo(px-w,py);c.quadraticCurveTo(px,py-7,px+w,py);c.lineTo(px+w*.6,py+8);c.lineTo(px-w*.75,py+10);c.closePath();c.fill();c.fillStyle='#10283d';c.beginPath();c.moveTo(px-w*.75,py+10);c.lineTo(px-w*.2,py+38);c.lineTo(px+w*.2,py+22);c.lineTo(px+w*.6,py+8);c.closePath();c.fill();
 }
 c.globalAlpha=1;
 for(let i=0;i<10;i++){
  const angle=Math.PI+(i+.5)*Math.PI/10,rx=radius+55,px=x+Math.cos(angle)*rx,py=y+Math.sin(angle)*rx*.77;
  const col=WORLD1_THEMES[WORLD1_ORDER[i]].color;
  c.globalAlpha=freed?.65:.22;c.fillStyle=col;c.beginPath();c.moveTo(px,py-9);c.quadraticCurveTo(px+8,py+4,px,py+13);c.quadraticCurveTo(px-8,py+4,px,py-9);c.fill();
 }
 c.globalAlpha=.22;c.fillStyle='#bdd7d3';for(let i=0;i<22;i++){const px=(i*173.31)%width,py=(i*87.19+height-tick*.09)%height*.8;c.beginPath();c.ellipse(px,py,1,1.8,0,0,TAU);c.fill();}
 c.restore();
}

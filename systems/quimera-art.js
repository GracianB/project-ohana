// The Echo wears one obsidian body. Ten stolen voices feed its exposed sternum;
// each attack articulates the organ that actually emits the danger.
import {WORLD1_ORDER,WORLD1_THEMES} from './world1-rooms.js';
const TAU=Math.PI*2,num=(v,d=0)=>Number.isFinite(v)?v:d,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,num(v)));
const ORGANS={ola:'paw',plasma:'core',rayos:'crown',medusas:'wing',embestida:'horn',aliento:'jaw',terremoto:'paw',geiseres:'paw',ruedas:'tail',red:'core'};
const HEROES={ola:'kilo',plasma:'stitcho',rayos:'chispin',medusas:'cat',embestida:'cuerno',aliento:'dragon',terremoto:'dino',geiseres:'frita',ruedas:'pizza',red:'yomi'};
export function quimeraPose(e,t=0,reduce=false){
 const b=e._fusion||{},phase=clamp(e.phase||1,1,4),dead=e.hp<=0||e.dying>0,time=reduce?0:num(t);
 const warning=b.mode==='warn'?clamp(1-num(b.clock)/Math.max(1,num(b.warnMax,72))):0;
 const strike=['attack','strike','special','charge','leap'].includes(b.mode)?1:0;
 return {phase,time,breathe:reduce?0:Math.sin(time*.045)*1.7,warning,strike,hurt:e.flash>0?1:0,dead,spread:(phase-1)/3,
  organ:ORGANS[b.attack]||'core',color:WORLD1_THEMES[HEROES[b.attack]]?.color||'#ffbe77',open:b.mode==='rest'?1:b.mode==='special'?.7:.18,
  gait:reduce?0:b.mode==='charge'?Math.sin(time*.65):0};
}
// Sculpted living creature: soft material boundaries, no outlined armor panels.
export function drawQuimeraCreature(c,e,cam={x:0,y:0},t=0,reduce=false){
 const p=quimeraPose(e,t,reduce),b=e._fusion||{},time=p.time;
 const formed=b.mode==='intro'?clamp(1-num(b.clock)/Math.max(1,num(b.introMax,260))):1;
 const phase=p.spread,breath=p.breathe,cast=p.warning,hit=p.strike;
 const palette=[null,['#7c91a0','#35495d','#101d32'],['#9293b5','#4c4d73','#171d39'],['#b29cc7','#555477','#171d37'],['#d3b6d5','#6b5e86','#1d2441']][p.phase];
 const grad=(x,y,r,colors)=>{const g=c.createRadialGradient(x-r*.25,y-r*.32,1,x,y,r);colors.forEach((v,i)=>g.addColorStop(i/(colors.length-1),v));return g;};
 const shape=(fill,fn)=>{c.fillStyle=fill;c.beginPath();fn();c.closePath();c.fill();};
 const oval=(x,y,rx,ry,fill,rot=0)=>shape(fill,()=>c.ellipse(x,y,rx,ry,rot,0,TAU));
 const curve=(color,width,fn)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();fn();c.stroke();};
 const skin=(x,y,r,light=0)=>grad(x,y,r,light?['#a9b8bd',palette[0],palette[1]]:palette);
 c.save();c.translate(num(e.x)-num(cam.x)+num(e.w,230)/2,num(e.y)-num(cam.y)+num(e.h,290));c.scale(e.facing===1?-1:1,1);
 c.globalAlpha*=formed;c.lineCap='round';c.lineJoin='round';
 oval(4,3,128,14,grad(4,3,130,['#03081799','#03081700']));
 c.translate(p.hurt?5:hit?-5:0,p.dead?35:breath+cast*3);c.rotate(p.dead?-.23:b.mode==='charge'?-.12:0);
 // A muscular tail curls in depth; its luminous fin is tissue, not a blade.
 c.save();c.translate(61,-79);c.rotate(Math.sin(time*.025)*.08+(p.organ==='tail'?cast*.3:0));
 curve('#111b32',29,()=>{c.moveTo(-2,2);c.bezierCurveTo(99,48,147,-5,114,-100);});
 curve('#455a72',17,()=>{c.moveTo(0,-3);c.bezierCurveTo(94,28,133,-8,114,-100);});
 shape(grad(117,-94,35,['#c6dfe0','#7890ac','#293b5d']),()=>{c.moveTo(112,-76);c.bezierCurveTo(79,-95,94,-124,125,-138);c.quadraticCurveTo(116,-107,138,-98);c.quadraticCurveTo(127,-91,112,-76);});
 c.restore();
 // Translucent membranes fold from a thick, curved shoulder. No wireframe ribs.
 for(const side of [1,-1]){
  c.save();c.translate(side*46,-178);c.scale(side,1);
  c.rotate(-.1-phase*.08+Math.sin(time*.033+side)*.035-(p.organ==='wing'?cast*.12:0));
  const span=109+phase*35;
  const wing=c.createLinearGradient(20,-125,span+40,40);wing.addColorStop(0,'#b0b9d0');wing.addColorStop(.26,'#6c7399');wing.addColorStop(.65,'#323e64');wing.addColorStop(1,'#192b4600');
  shape(wing,()=>{c.moveTo(-8,34);c.bezierCurveTo(9,-66,span-38,-114,span+13,-156);c.quadraticCurveTo(span-5,-70,span+40,-2);c.quadraticCurveTo(span+9,-23,span+1,25);c.quadraticCurveTo(70,-7,38,54);c.quadraticCurveTo(16,26,-8,34);});
  const edge=c.createLinearGradient(0,0,span,-150);edge.addColorStop(0,'#526680');edge.addColorStop(.65,'#9bacc0');edge.addColorStop(1,'#e0d7d4');
  curve(edge,7,()=>{c.moveTo(0,24);c.bezierCurveTo(16,-63,span-29,-114,span+13,-156);});
  for(let fold=0;fold<3;fold++){
   const fx=span-12-fold*28;
   shape('#0c1c3922',()=>{c.moveTo(span+10,-145);c.quadraticCurveTo(fx-27,-42,fx-10,26);c.quadraticCurveTo(fx-19,-45,span+10,-145);});
  }
  // Small luminous pores follow the membrane rather than dividing it into cells.
  c.globalAlpha*=.4+phase*.25;
  for(let i=0;i<8;i++){const x=35+i*11,y=-26-i*9;oval(x,y,1.4+i*.12,1.4+i*.12,'#d5e6ed');}
  c.restore();
 }
 // Rear legs sit in shadow behind a continuous flank.
 for(const side of [1,-1]){
  c.save();c.translate(side*55,-54);c.rotate(side*p.gait*.12);
  oval(0,-17,35,50,skin(0,-22,58),side*.3);
  shape(skin(0,16,42),()=>{c.moveTo(-22,-8);c.quadraticCurveTo(-25,17,-33,35);c.bezierCurveTo(-47,50,-19,58,14,51);c.quadraticCurveTo(32,47,23,31);c.lineTo(24,-10);});
  for(let i=0;i<3;i++)shape(grad(-23+i*17,45,15,['#f3e9d0','#a8a9a7','#5f7182']),()=>{let x=-26+i*17;c.moveTo(x,39);c.quadraticCurveTo(x-7,46,x-6,56);c.quadraticCurveTo(x+6,53,x+9,41);});
  c.restore();
 }
 // Pear-shaped thorax and raised shoulders build an animal silhouette.
 shape(skin(-5,-165,120),()=>{c.moveTo(-35,-246);c.bezierCurveTo(-102,-253,-110,-184,-88,-118);c.bezierCurveTo(-71,-56,56,-56,84,-116);c.bezierCurveTo(113,-185,81,-240,29,-244);});
 oval(-39,-191,45,61,skin(-43,-207,77),-.28);
 oval(50,-174,39,64,skin(39,-197,75),.24);
 oval(7,-121,54,54,grad(4,-125,66,['#687d8b','#354d63','#19283f']));
 // A soft pale breast grows around the exposed heart.
 shape(grad(-4,-167,74,['#cad4cb','#768b9b','#263950']),()=>{c.moveTo(-28,-223);c.quadraticCurveTo(0,-213,32,-224);c.quadraticCurveTo(55,-176,27,-128);c.lineTo(0,-102);c.lineTo(-24,-130);c.quadraticCurveTo(-51,-169,-28,-223);});
 // Long mane tufts have rounded roots and flowing tapered ends.
 for(const side of [-1,1])for(let i=4;i>=0;i--){
  const x=side*(33+i*7),y=-230+i*13,sway=Math.sin(time*.028+i)* (2+phase*5);
  shape(grad(x,y,45,['#9ca9b8','#4e637e','#253b57']),()=>{c.moveTo(x-side*13,y-17);c.bezierCurveTo(x+side*25,y-27,x+side*(30+phase*11)+sway,y+23,x+side*18+sway,y+49);c.quadraticCurveTo(x+side*13,y+14,x-side*10,y+18);});
 }
 // Forelegs articulate from the shoulder with weighted, rounded paws.
 for(const side of [1,-1]){
  const lift=p.organ==='paw'?cast*.34:cast*.07;
  c.save();c.translate(side*70,-190);c.rotate(side*(.08+lift-hit*.12)+(side===1?-.12:.05)+Math.sin(time*.03+side)*.018);
  shape(skin(-6,47,86),()=>{c.moveTo(-20,-14);c.bezierCurveTo(-47,-4,-40,35,-28,63);c.quadraticCurveTo(-23,87,-31,116);c.bezierCurveTo(-47,143,4,149,30,131);c.quadraticCurveTo(33,119,23,105);c.quadraticCurveTo(38,69,29,38);c.quadraticCurveTo(26,-11,-20,-14);});
  oval(-9,21,14,31,grad(-12,15,40,['#acb9bd88','#778da433','#405b7200']),-.3);
  for(let k=0;k<3;k++){
   const x=-24+k*18;
   oval(x+5,123,12,14,skin(x+3,119,24));
   shape(grad(x,137,18,['#f2ead7','#b9b6b3','#697f93']),()=>{c.moveTo(x-3,130);c.quadraticCurveTo(x-10,138,x-5,150);c.quadraticCurveTo(x+5,144,x+9,131);});
  }
  c.restore();
 }
 // The heart is an organic vertical aperture, with a bright recovery iris.
 const heartY=-165,open=p.open,hr=21+open*6+phase*3;
 oval(0,heartY,hr+7,48,'#101c35');
 oval(0,heartY,hr,42,grad(-2,heartY,44,[open>.5?'#f0ffe7':'#fff0db',open>.5?'#85e4ca':p.color,'#4c477c']));
 oval(-4,heartY-5,5+open*3,28,grad(-4,heartY-7,30,['#ffffff','#d9ffe499','#dcfff000']));
 // Ten captive lights are nestled in the fur, not connected by drawn lines.
 WORLD1_ORDER.forEach((hero,i)=>{const side=i<5?-1:1,j=i%5,x=side*(33+j*4),y=-209+j*19,col=WORLD1_THEMES[hero].color;
  oval(x,y,3.2,4.5,grad(x,y,5,[HEROES[b.attack]===hero?'#ffffff':col,col,'#243751']));
 });
 // Long feline muzzle, connected neck, and asymmetric brow sell a living face.
 c.save();c.translate(-14-(p.organ==='horn'?cast*10:0),-236-(p.organ==='crown'?cast*7:0));
 c.rotate(p.organ==='jaw'?-cast*.1:p.dead?.2:-.025);
 oval(4,7,43,48,skin(-5,-7,63));
 for(const side of [1,-1]){
  // Curved horns emerge behind soft ears; the final phase lengthens their roots.
  shape(grad(side*33,-67,49,['#e8e2cf','#aab0b2','#546b84']),()=>{c.moveTo(side*20,-31);c.bezierCurveTo(side*42,-52,side*31,-82,side*(57+phase*7),-102-phase*10);c.quadraticCurveTo(side*44,-68,side*48,-47);c.quadraticCurveTo(side*43,-26,side*20,-31);});
  shape(skin(side*35,-20,34),()=>{c.moveTo(side*21,-24);c.quadraticCurveTo(side*39,-54,side*56,-50);c.quadraticCurveTo(side*56,-21,side*37,-8);});
  shape('#35455e',()=>{c.moveTo(side*33,-23);c.lineTo(side*48,-42);c.quadraticCurveTo(side*46,-23,side*38,-18);});
 }
 if(p.phase>=3)for(const side of [-1,1])for(let i=0;i<4;i++){
  const x=side*(31+i*4),y=-35+i*15,flow=Math.sin(time*.04+i)*3;
  shape(grad(x,y,34,['#d7ccdc','#8e91b2','#45557b00']),()=>{c.moveTo(x-side*10,y-7);c.bezierCurveTo(x+side*13,y-14,x+side*29+flow,y+11,x+side*22+flow,y+33);c.quadraticCurveTo(x+side*12,y+9,x-side*8,y+13);});
 }
 shape(skin(-14,-36,64),()=>{c.moveTo(-35,-38);c.bezierCurveTo(-25,-61,23,-62,37,-38);c.quadraticCurveTo(50,-7,29,17);c.quadraticCurveTo(5,31,-30,15);c.quadraticCurveTo(-51,-6,-35,-38);});
 // Brow ridges cast one broad shadow instead of graphic black outlines.
 for(const side of [-1,1]){
  const x=side*22;
  oval(x,-19,18,11,'#14213a',side*-.15);
  if(!p.dead){
   shape(grad(x,-19,20,['#fffad1','#e3bb79','#a77359']),()=>{c.moveTo(x-14,-22-side*2);c.quadraticCurveTo(x,-24,x+14,-22+side*2);c.quadraticCurveTo(x+4,-13,x-10,-15);});
   oval(x-3,-20,2,6,'#152036');oval(x-6,-22,2,1.3,'#ffffff');
  }
  shape(skin(x,-32,31),()=>{c.moveTo(x-18,-38+side*5);c.quadraticCurveTo(x,-36,x+17,-38-side*5);c.lineTo(x+14,-25-side*5);c.quadraticCurveTo(x,-30,x-15,-25+side*5);});
  shape(skin(side*26,-4,31),()=>{c.moveTo(side*21,-16);c.quadraticCurveTo(side*49,-13,side*45,15);c.lineTo(side*30,33);c.quadraticCurveTo(side*33,10,side*15,6);});
 }
 const jaw=p.organ==='jaw'?cast*5+hit*12:hit?4:0;
 shape(skin(-18,17+jaw,44),()=>{c.moveTo(-42,15+jaw);c.quadraticCurveTo(-15,9,23,15+jaw);c.quadraticCurveTo(22,40+jaw,-13,43+jaw);c.quadraticCurveTo(-38,39+jaw,-42,15+jaw);});
 if(jaw>2)oval(-16,19+jaw*.5,27,6+jaw*.4,'#131d32');
 // Two overlapping muzzle pads avoid a flat polygonal snout.
 shape(grad(-24,0,38,['#b5c3c2','#7e96a1','#415d77']),()=>{c.moveTo(-25,-9);c.quadraticCurveTo(-50,-10,-47,12);c.quadraticCurveTo(-45,25,-20,23);c.quadraticCurveTo(-6,19,-10,7);});
 shape(grad(3,0,32,['#a8babd','#6e8b9d','#3b5875']),()=>{c.moveTo(-8,-5);c.quadraticCurveTo(21,-7,26,10);c.quadraticCurveTo(26,25,1,25);c.quadraticCurveTo(-13,22,-13,8);});
 shape(grad(-18,1,15,['#4a5b6d','#17283e','#101a2e']),()=>{c.moveTo(-30,-1);c.quadraticCurveTo(-18,-7,-5,0);c.quadraticCurveTo(-15,12,-21,9);});
 curve('#3b5069',1.2,()=>{c.moveTo(-19,9);c.lineTo(-20,16);c.quadraticCurveTo(-31,19,-35,14);});
 for(const side of [-1,1])shape(grad(side*22,22,16,['#fff1d4','#b8c0c1','#6f859b']),()=>{c.moveTo(side*22-4,17);c.quadraticCurveTo(side*22-9,31,side*22-3,36+jaw*.25);c.quadraticCurveTo(side*22+3,29,side*22+5,18);});
 // One luminous forehead crest; no crown full of intersecting spikes.
 shape(grad(-2,-49,35,['#ece3d3','#b1a2b6','#52617f']),()=>{c.moveTo(-12,-37);c.quadraticCurveTo(-14,-65,-1,-80-phase*12);c.quadraticCurveTo(3,-57,12,-40);c.quadraticCurveTo(1,-25,-12,-37);});
 c.restore();
 // The prison dissolves into soft wisps in the final phase.
 if(p.phase===4)for(const side of [-1,1])for(let i=0;i<3;i++){
  const x=side*(99+i*15),y=-152-i*36+Math.sin(time*.024+i)*4;
  oval(x,y,7-i,18+i*3,grad(x,y,27,['#c8b3e355','#8b9cc322','#899db900']),side*.3);
 }
 c.restore();
}

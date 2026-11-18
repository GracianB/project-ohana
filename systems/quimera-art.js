// A hollow, predatory silhouette holds ten captive voices;
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
export function quimeraArticulation(e,t=0,reduce=false){
 const p=quimeraPose(e,t,reduce),b=e._fusion||{},w=p.warning*p.warning*(3-2*p.warning),release=b.mode==='attack'?Math.sin(Math.PI*(1-clamp(num(b.clock)/30))):0;
 return{coil:w,recoil:release*11,lean:b.mode==='charge'?.2:b.mode==='leap'?-.14:p.organ==='core'?w*.1:w*.045,arm:p.organ==='paw'?w*.62:p.organ==='core'?w*.4:p.organ==='tail'?w*.18:w*.09,head:p.organ==='jaw'?-w*.17:p.organ==='crown'?w*.08:-.05,mantle:w*(p.organ==='wing'?.24:.08),idle:reduce?0:Math.sin(p.time*.033)*.018};
}
// Hand-shaped silhouettes and broad light planes; the hollow chest is the focal point.
export function drawQuimeraCreature(c,e,cam={x:0,y:0},t=0,reduce=false){
 const p=quimeraPose(e,t,reduce),a=quimeraArticulation(e,t,reduce),b=e._fusion||{},T=p.time,S=p.spread,W=p.warning;
 const formed=b.mode==='intro'?clamp(1-num(b.clock)/Math.max(1,num(b.introMax,260))):1;
 const recoil=a.recoil;
 const bend=a.lean;
 const breath=p.breathe,flow=Math.sin(T*.025),dark='#0b1428',rim=p.phase>=3?'#a1abbc':'#738398';
 const path=(fill,fn)=>{c.fillStyle=fill;c.beginPath();fn();c.closePath();c.fill();};
 const oval=(x,y,rx,ry,col,rot=0)=>path(col,()=>c.ellipse(x,y,rx,ry,rot,0,TAU));
 const linear=(x,y,xx,yy,stops)=>{const g=c.createLinearGradient(x,y,xx,yy);stops.forEach(([at,col])=>g.addColorStop(at,col));return g;};
 const glow=(x,y,r,col)=>{const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'#76e8e000');return g;};
 const line=(col,width,fn)=>{c.strokeStyle=col;c.lineWidth=width;c.beginPath();fn();c.stroke();};
 const flesh=linear(-100,-230,100,-60,[[0,'#48516b'],[.28,'#2a2d46'],[.65,'#171c32'],[1,'#090e1e']]);
 c.save();c.translate(num(e.x)-num(cam.x)+num(e.w,230)/2,num(e.y)-num(cam.y)+num(e.h,290));c.scale(e.facing===1?-1:1,1);c.globalAlpha*=formed;c.lineJoin='round';c.lineCap='round';
 oval(2,4,119,11,'#050c1b80');
 c.translate(recoil+(p.hurt?7:0),p.dead?37:breath);c.rotate(p.dead?.26:bend);
 // A low, long tail dissolves into three independent currents.
 for(let i=2;i>=0;i--){
  const k=i*13;
  path(linear(30,-85,181,-150,[[0,'#233b54'],[.7,'#304d67'],[1,'#688f9b00']]),()=>{c.moveTo(38,-89+k*.3);c.bezierCurveTo(136,-27,184,-58,172-k,-155+flow*(5+i));c.bezierCurveTo(198-k,-69,146,3,39,-62+k*.3);});
 }
 // The mantle is a torn, flowing mass, not a symmetrical pair of bat wings.
 for(const side of [1,-1]){
  c.save();c.translate(side*35,-202);c.scale(side,1);c.rotate(flow*.025-side*.06-a.mantle);
  const sweep=13+S*22;
  path(linear(0,-95,154,83,[[0,'#8994a9'],[.14,'#465270'],[.42,'#292d49'],[.82,'#141a30'],[1,'#0d203900']]),()=>{
   c.moveTo(-18,14);c.bezierCurveTo(6,-67,79,-98,161+sweep,-120);c.bezierCurveTo(111,-75,118,-31,183,-8);c.quadraticCurveTo(144,-12,127,3);c.quadraticCurveTo(151,35,162,50);c.quadraticCurveTo(109,14,100,26);c.quadraticCurveTo(125,65,113+flow*6,93);c.bezierCurveTo(102,60,63,60,52,32);c.quadraticCurveTo(32,55,19,75);c.quadraticCurveTo(24,30,-18,14);
  });
  // Two broad tissue highlights describe a fold without outlining every edge.
  path('#8bb8bd24',()=>{c.moveTo(8,-13);c.quadraticCurveTo(58,-70,139,-99);c.quadraticCurveTo(65,-50,81,-4);c.quadraticCurveTo(47,-30,8,-13);});
  path('#07142d77',()=>{c.moveTo(24,-8);c.quadraticCurveTo(89,-44,128,9);c.quadraticCurveTo(98,-4,92,25);c.quadraticCurveTo(72,4,24,-8);});
  if(p.phase>=3)for(let i=0;i<3;i++){
   const x=83+i*23,y=14+i*12;
   path(linear(x,y,x+8,y+63,[[0,'#9bdad666'],[1,'#6dc8d000']]),()=>{c.moveTo(x,y);c.quadraticCurveTo(x+22,y+26,x+flow*9,y+67);c.quadraticCurveTo(x+8,y+26,x-5,y+4);});
  }
  c.restore();
 }
 // An offset haunch and grounded toes anchor the otherwise spectral silhouette.
 for(const side of [1,-1]){
  c.save();c.translate(side*(side===1?59:44),-49);c.rotate(side*p.gait*.15);
  path(flesh,()=>{c.moveTo(-26,-44);c.quadraticCurveTo(31,-72,35,-12);c.quadraticCurveTo(24,9,29,30);c.quadraticCurveTo(43,47,9,50);c.lineTo(-33,50);c.quadraticCurveTo(-39,36,-19,27);c.quadraticCurveTo(-43,-9,-26,-44);});
  for(let i=0;i<3;i++)path('#c4d2c5',()=>{let x=-29+i*18;c.moveTo(x,42);c.quadraticCurveTo(x-9,48,x-12,57);c.quadraticCurveTo(x+4,56,x+9,42);});
  c.restore();
 }
 // Broad chest, narrow waist; shoulders remain continuous with the long forelimbs.
 path(flesh,()=>{c.moveTo(-29,-246);c.bezierCurveTo(-89,-237,-99,-170,-75,-114);c.quadraticCurveTo(-57,-50,4,-58);c.quadraticCurveTo(66,-52,81,-119);c.bezierCurveTo(99,-176,73,-232,32,-244);});
 path(linear(-61,-202,44,-83,[[0,'#7a9aab'],[.3,'#3c6079'],[1,'#11203c']]),()=>{c.moveTo(-37,-231);c.quadraticCurveTo(-83,-219,-69,-153);c.quadraticCurveTo(-40,-114,-33,-87);c.quadraticCurveTo(-16,-111,-22,-155);c.quadraticCurveTo(-13,-194,-37,-231);});
 // A dark aperture eats the chest; thin light gathers only when it can be hit.
 oval(0,-161,36+p.open*5,56,'#071223',-.1);
 const heart=p.open>.5?'#bff7d9':p.color;
 oval(-2,-161,30,47,glow(-2,-161,51,p.open>.5?'#5dc8b866':'#bd73b044'));
 c.save();c.translate(-2,-161);c.rotate(-.12);c.scale(1,.96);
 for(let i=0;i<2;i++){
  const flip=i?1:-1;c.save();c.scale(flip,1);
  path(linear(-8,-45,20,42,[[0,rim],[.5,'#406b82'],[1,'#1b3656']]),()=>{c.moveTo(2,-51);c.bezierCurveTo(44,-43,43,21,4,51);c.quadraticCurveTo(25,4,2,-51);});
  c.restore();
 }
 path(linear(-8,-27,12,27,[[0,'#f2f1d2'],[.32,heart],[1,'#499fa2']]),()=>{c.moveTo(-4,-31);c.quadraticCurveTo(17,-5,8,12);c.lineTo(-2,33);c.quadraticCurveTo(-16,3,-4,-31);});
 c.restore();
 // Fur separates into long, deliberate clumps with a quiet rim on the lit side.
 for(const side of [1,-1])for(let i=3;i>=0;i--){
  const x=side*(31+i*10),y=-234+i*19,lag=Math.sin(T*.035+i)*3;
  path(linear(x-13,y-13,x+side*22,y+52,[[0,side<0?'#73829d':'#494d6b'],[.38,'#253f59'],[1,'#0d2038']]),()=>{c.moveTo(x-side*13,y-18);c.bezierCurveTo(x+side*26,y-20,x+side*30+lag,y+11,x+side*19+lag,y+50);c.quadraticCurveTo(x+side*7,y+20,x-side*15,y+19);});
 }
 // Unequal forearms: the near arm reaches forward, the other braces its weight.
 for(const side of [1,-1]){
  const raise=a.arm;
  c.save();c.translate(side*66,-194);c.rotate(side*(raise-p.strike*.13)+(side<0?.17:-.16)+Math.sin(T*.035+side)*.025);
  path(linear(-24,0,28,136,[[0,side<0?'#648799':'#344f6c'],[.42,'#27435d'],[1,'#111f36']]),()=>{c.moveTo(-16,-14);c.bezierCurveTo(-43,-6,-39,38,-24,59);c.quadraticCurveTo(-17,82,-32,115);c.quadraticCurveTo(-45,140,-20,143);c.quadraticCurveTo(8,150,29,129);c.quadraticCurveTo(24,106,27,86);c.quadraticCurveTo(40,39,21,1);c.quadraticCurveTo(8,-19,-16,-14);});
  path('#8db5bf30',()=>{c.moveTo(-16,0);c.quadraticCurveTo(-33,21,-14,58);c.quadraticCurveTo(-19,23,-6,11);});
  for(let i=0;i<3;i++){
   const x=-25+i*18;
   path('#c4d2c5',()=>{c.moveTo(x,125);c.bezierCurveTo(x-12,139,x-16,154,x-9,160);c.quadraticCurveTo(x+2,148,x+10,130);});
  }
  c.restore();
 }
 // Small openings in the shoulder mass expose the imprisoned light as phases split.
 if(p.phase>=2)for(const side of[-1,1])for(let i=0;i<3;i++){
  const x=side*(64+i*4),y=-176+i*17;c.save();c.globalAlpha*=.18+p.open*.12;
  path(p.color,()=>{c.moveTo(x,y-8);c.quadraticCurveTo(x+side*10,y-3,x+side*3,y+11);c.quadraticCurveTo(x-side*3,y+1,x,y-8);});c.restore();
 }
 // Ten embedded teardrops, subtly lit. They never become a string of buttons.
 WORLD1_ORDER.forEach((hero,i)=>{
  const side=i<5?-1:1,j=i%5,x=side*(39+j*5),y=-218+j*21;
  const active=HEROES[b.attack]===hero,col=WORLD1_THEMES[hero].color;
  c.globalAlpha*=active?.95:.35;
  path(col,()=>{c.moveTo(x,y-4);c.quadraticCurveTo(x+4,y+2,x,y+6);c.quadraticCurveTo(x-4,y+2,x,y-4);});
  c.globalAlpha/=active?.95:.35;
 });
 // A swept-back crown and long hollow mask replace the smiling animal muzzle.
 c.save();c.translate(-16-(p.organ==='horn'?W*11:0),-228-(p.organ==='crown'?W*8:0));c.rotate(p.dead?.3:a.head+a.idle);
 for(const side of [1,-1]){
  path(linear(side*20,-20,side*62,-111,[[0,'#3b596c'],[.45,'#b5c7c5'],[1,'#e6e8d5']]),()=>{c.moveTo(side*18,-24);c.bezierCurveTo(side*46,-50,side*26,-85,side*(66+S*14),-113-S*12);c.bezierCurveTo(side*48,-85,side*65,-50,side*37,-16);});
  // Sweeping cheek fins taper backwards; no separate spherical cheeks.
  path(flesh,()=>{c.moveTo(side*25,-21);c.quadraticCurveTo(side*61,-54,side*73,-43);c.quadraticCurveTo(side*50,-15,side*49,22);c.quadraticCurveTo(side*34,10,side*25,-21);});
 }
 const mask=linear(-42,-60,33,38,[[0,'#e2e5cf'],[.28,'#c4d0c5'],[.56,'#88a6ab'],[1,'#3c617a']]);
 path(mask,()=>{c.moveTo(-24,-54);c.quadraticCurveTo(8,-70,31,-45);c.quadraticCurveTo(43,-24,26,1);c.lineTo(15,17);c.quadraticCurveTo(4,39,-15,47);c.quadraticCurveTo(-36,29,-39,5);c.quadraticCurveTo(-54,-30,-24,-54);});
 // One continuous dark eye socket lies under the pronounced mask brow.
 path('#0a1930',()=>{c.moveTo(-38,-26);c.quadraticCurveTo(-19,-25,-11,-15);c.quadraticCurveTo(7,-24,31,-24);c.lineTo(23,-8);c.quadraticCurveTo(2,-10,-9,-4);c.quadraticCurveTo(-25,-13,-35,-9);});
 if(!p.dead)for(const side of [-1,1]){
  const x=side<0?-26:13,blink=reduce?0:Math.max(0,1-Math.abs((T%410)-390)/8);
  c.save();c.translate(x,-16);c.scale(1,Math.max(.12,1-blink));c.translate(-x,16);
  path('#d3f7dd',()=>{c.moveTo(x-8,-19);c.lineTo(x+9,-16);c.lineTo(x+2,-11);c.lineTo(x-7,-14);});
  oval(x,-16,1.8,3.5,'#253046');oval(x-3,-17,1.2,.8,'#faf0d5');c.restore();
 }
 // Broken porcelain recesses give the mask depth without wire engravings.
 for(const side of[-1,1])path('#37425a',()=>{const x=side*27;c.moveTo(x,-40);c.quadraticCurveTo(x+side*10,-33,x+side*5,-24);c.quadraticCurveTo(x-side*2,-31,x,-40);});
 // Long, solid cheek planes and a narrow split, rather than a cartoon mouth.
 path('#24425b',()=>{c.moveTo(-29,-3);c.quadraticCurveTo(-25,18,-13,34);c.lineTo(-10,9);c.lineTo(-20,-6);});
 const jaw=p.organ==='jaw'?W*8+p.strike*15:p.strike?4:0;
 path('#08172c',()=>{c.moveTo(-12,6);c.quadraticCurveTo(-1,1,17,4);c.lineTo(7,22+jaw);c.lineTo(-13,40+jaw*.3);c.quadraticCurveTo(-6,24,-12,6);});
 path('#c4d2c5',()=>{c.moveTo(-1,7);c.lineTo(7,4);c.quadraticCurveTo(7,19,0,24);});
 path('#9cb9bb',()=>{c.moveTo(-21,-50);c.quadraticCurveTo(-12,-72,-4,-88-S*14);c.quadraticCurveTo(8,-58,12,-47);c.lineTo(-4,-31);});
 if(jaw>3)for(let i=0;i<2;i++)path('#c6c9be',()=>{const x=4+i*8;c.moveTo(x,12);c.lineTo(x+4,8);c.quadraticCurveTo(x+4,24+jaw*.25,x-2,28+jaw*.25);});
 // A short chestward beard dissolves with follow-through, not a fixed jaw plate.
 path(linear(-10,27,6,82,[[0,'#608699'],[1,'#31557600']]),()=>{c.moveTo(-23,29);c.quadraticCurveTo(-8,49,11,32);c.quadraticCurveTo(10,64,21+flow*5,80);c.quadraticCurveTo(-9,69,-23,29);});
 c.restore();
 // The last phase unbinds a crescent behind the shoulders, never across the face.
 if(p.phase>=3)for(let i=0;i<(p.phase===4?5:2);i++){
  const side=i%2?1:-1,x=side*(106+(i>>1)*22),y=-160-(i>>1)*47;
  c.save();c.translate(x,y+Math.sin(T*.025+i)*4);c.rotate(side*.3);
  path(linear(-7,-19,10,21,[[0,'#c8d7cd'],[.4,'#688b9f'],[1,'#203e5d']]),()=>{c.moveTo(-3,-20);c.quadraticCurveTo(14,-3,2,21);c.lineTo(-8,8);c.quadraticCurveTo(1,-2,-3,-20);});
  c.restore();
 }
 c.restore();
}

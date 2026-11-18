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
export const QUIMERA_MATERIALS=Object.freeze([null,{rim:'#71838c',mid:'#3b5967',shade:'#243546',horn:'#e3dfc2'},{rim:'#85859c',mid:'#4c526f',shade:'#28283f',horn:'#d8d5d0'},{rim:'#758e9a',mid:'#3d596b',shade:'#20283f',horn:'#d5e1d1'},{rim:'#9b8da2',mid:'#514761',shade:'#211f36',horn:'#eee1c1'}].map(v=>v&&Object.freeze(v)));
// Smooth anatomical masses, lit cavities and independent joints. No wire outlines.
export function drawQuimeraCreature(c,e,cam={x:0,y:0},t=0,reduce=false){
 const p=quimeraPose(e,t,reduce),a=quimeraArticulation(e,t,reduce),b=e._fusion||{},T=p.time,S=p.spread,W=p.warning,M=QUIMERA_MATERIALS[p.phase];
 const formed=b.mode==='intro'?clamp(1-num(b.clock)/Math.max(1,num(b.introMax,260))):1;
 const path=(fill,fn)=>{c.fillStyle=fill;c.beginPath();fn();c.closePath();c.fill();};
 const oval=(x,y,rx,ry,col,rot=0)=>path(col,()=>c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),rot,0,TAU));
 const linear=(x,y,xx,yy,stops)=>{const g=c.createLinearGradient(x,y,xx,yy);stops.forEach(([at,col])=>g.addColorStop(at,col));return g;};
 const radial=(x,y,r,stops)=>{const g=c.createRadialGradient(x-r*.25,y-r*.3,0,x,y,r);stops.forEach(([at,col])=>g.addColorStop(at,col));return g;};
 const skin=linear(-90,-220,85,-45,[[0,M.rim],[.2,M.mid],[.52,M.shade],[1,'#10192d']]);
 const bone=linear(-40,-65,39,40,[[0,'#dfdfc5'],[.25,'#b5c8bf'],[.6,'#748e97'],[1,'#344b65']]);
 const active=organ=>p.organ===organ&&(W>0||p.strike);
 const glow=(x,y,r,color)=>oval(x,y,r,r,radial(x,y,r,[[0,color],[1,'#819fba00']]));
 c.save();c.translate(num(e.x)-num(cam.x)+num(e.w,230)/2,num(e.y)-num(cam.y)+num(e.h,290));c.scale(e.facing===1?-1:1,1);c.globalAlpha*=formed;
 if(b.mode==='intro'){c.beginPath();c.rect(-300,-420*formed,600,435*formed+2);c.clip();}
 const unravel=p.dead?clamp(num(e.dying)/Math.max(1,num(e.dyingMax,150))):0;
 if(p.dead){for(let i=0;i<10;i++){const angle=i*TAU/10,rr=60+unravel*120;oval(Math.cos(angle)*rr,-155+Math.sin(angle)*rr*.6-unravel*70,3,7,WORLD1_THEMES[WORLD1_ORDER[i]].color,angle);}c.globalAlpha*=1-unravel*.85;}
 // Contact stays anchored while the torso breathes, recoils and coils.
 oval(0,4,111,10,'#03091588');
 c.translate(a.recoil+(p.hurt?5:0),p.dead?35:p.breathe);c.rotate(p.dead?.24:a.lean);
 // Long muscular tail, with a travelling fold rather than stacked outlines.
 path(linear(25,-68,187,-129,[[0,'#24364c'],[.55,'#4c6978'],[1,'#92a9a300']]),()=>{c.moveTo(28,-89);c.bezierCurveTo(100,-48,181,-42,164,-122);c.quadraticCurveTo(158,-153,181,-168+Math.sin(T*.027)*8-(p.organ==='tail'?W*42:0));c.bezierCurveTo(158,-129,218,-36,126,-29);c.quadraticCurveTo(71,-24,28,-62);});
 // A mantle of staggered membrane fingers unfurls through the four phases.
 for(const side of[1,-1]){
  c.save();c.translate(side*44,-211);c.scale(side,1);c.rotate(-.035+Math.sin(T*.022+side)*.025-a.mantle-(p.organ==='wing'?W*.13:0));
  for(let i=3;i>=0;i--){const span=92+i*21+S*36,lag=Math.sin(T*.026-i*.65)*7,tipY=-119+i*45;
   path(linear(0,-45,span,tipY+45,[[0,'#385169'],[.4,i%2?'#464c6b':'#555c78'],[.75,'#24253f'],[1,'#111b3000']]),()=>{c.moveTo(-16,8);c.bezierCurveTo(29,-53,span-56,tipY-18,span,tipY+lag);c.quadraticCurveTo(span-40,tipY+19,span-25,tipY+55);c.bezierCurveTo(span-53,tipY+33,59,65,8,54);});
   path('#a0b8b921',()=>{c.moveTo(5,0);c.quadraticCurveTo(span*.55,tipY*.8,span-9,tipY+lag+3);c.quadraticCurveTo(span*.58,tipY*.62,32,22);});
  }
  if(p.phase>=2)for(let i=0;i<p.phase;i++){const xx=104+i*17,yy=-85+i*43;path(linear(xx,yy,xx+4,yy+64,[[0,'#87bab65c'],[1,'#6587ad00']]),()=>{c.moveTo(xx,yy);c.bezierCurveTo(xx+28,yy+25,xx+8+Math.sin(T*.035+i)*10,yy+45,xx+18,yy+69);c.quadraticCurveTo(xx-15,yy+33,xx,yy);});}
  c.restore();
 }
 // Digitigrade haunches: the knee, hock and toes carry separate curved volumes.
 for(const side of[1,-1]){
  c.save();c.translate(side*(side<0?46:57),-60);c.rotate(side*p.gait*.12);
  oval(0,-1,32,46,skin,side*.2);
  path(linear(-18,-3,24,65,[[0,'#344858'],[.5,'#1c293e'],[1,'#455b69']]),()=>{c.moveTo(-21,-6);c.quadraticCurveTo(35,-12,25,26);c.quadraticCurveTo(6,40,18,48);c.quadraticCurveTo(31,62,4,64);c.lineTo(-29,64);c.quadraticCurveTo(-42,54,-16,44);c.quadraticCurveTo(-6,25,-21,-6);});
  for(let i=0;i<3;i++){const xx=-25+i*15;oval(xx,58,11,7,'#405969');path('#b7c7bd',()=>{c.moveTo(xx-6,58);c.quadraticCurveTo(xx-13,65,xx-14,69);c.quadraticCurveTo(xx-2,68,xx+3,59);});}
  c.restore();
 }
 // Pear-shaped ribcage, narrow belly, and a cool reflected rim.
 path(skin,()=>{c.moveTo(-30,-246);c.bezierCurveTo(-101,-240,-105,-167,-72,-112);c.quadraticCurveTo(-44,-55,2,-56);c.quadraticCurveTo(66,-49,82,-121);c.bezierCurveTo(103,-188,75,-244,27,-248);});
 path('#a8c9bf24',()=>{c.moveTo(-35,-238);c.bezierCurveTo(-82,-218,-91,-177,-64,-136);c.quadraticCurveTo(-76,-200,-35,-238);});
 // The open chest is a spherical abyss with light visibly recessed inside it.
 const opening=p.open,heart=opening>.5?'#c0ead2':p.color;
 oval(-3,-164,43,61,'#101c30',-.1);oval(-4,-164,34+opening*3,51,'#040c1b',-.1);
 c.save();c.beginPath();c.ellipse(-4,-164,33,50,-.1,0,TAU);c.clip();
 glow(-7,-167,43,opening>.5?'#7bd8bb99':'#a88fc177');
 for(let i=0;i<5;i++){const phase=T*.017+i*TAU/5,x=-5+Math.sin(phase)*17,y=-166+Math.cos(phase)*24;oval(x,y,3,8,'#a4d9ce55',phase);}
 oval(-7,-165,13+W*3,23,radial(-7,-165,26,[[0,'#f0edcc'],[.25,heart],[.62,'#678fa1'],[1,'#314760']]),-.14);
 oval(-11,-175,4,7,'#ecf6d69c',-.25);c.restore();
 // Protective ribs peel away during recovery, leaving the vulnerability clear.
 for(const side of[-1,1])for(let i=0;i<3;i++){
  const y=-209+i*35,xx=side*(29+opening*7);path(linear(xx,y,side*48,y+24,[[0,'#a3b7b7'],[.4,'#516f80'],[1,'#263b52']]),()=>{c.moveTo(xx,y-7);c.quadraticCurveTo(side*61,y+10,side*38,y+36);c.quadraticCurveTo(side*(45-opening*10),y+14,xx,y-7);});
 }
 // Shoulder fur follows through at a different rhythm from the membrane.
 for(const side of[1,-1])for(let i=3;i>=0;i--){const xx=side*(37+i*11),yy=-242+i*19,lag=Math.sin(T*.032-i*.6)*3;
  path(linear(xx,yy,xx+side*23,yy+58,[[0,side<0?'#839da3':'#526780'],[.42,'#344d63'],[1,'#14243b']]),()=>{c.moveTo(xx-side*14,yy-11);c.bezierCurveTo(xx+side*25,yy-14,xx+side*29+lag,yy+14,xx+side*20+lag,yy+54);c.quadraticCurveTo(xx+side*4,yy+18,xx-side*17,yy+17);});
 }
 // Upper arm, forearm and broad curled hand articulate as one continuous limb.
 for(const side of[1,-1]){
  c.save();c.translate(side*(70+S*6),-196);c.rotate(side*((side<0?a.arm:a.arm*.48)-p.strike*.13)+(side<0?.18:-.16)+Math.sin(T*.031+side)*.025);
  path(linear(-28,0,24,138,[[0,side<0?'#668693':'#3f5b73'],[.35,'#30485d'],[.7,'#1a2c43'],[1,'#4b6474']]),()=>{c.moveTo(-15,-17);c.bezierCurveTo(-47,-10,-41,30,-25,53);c.quadraticCurveTo(-17,76,-30,100);c.bezierCurveTo(-51,128,-32,149,-9,145);c.quadraticCurveTo(27,147,29,122);c.quadraticCurveTo(18,101,26,80);c.bezierCurveTo(45,33,31,-15,9,-19);c.quadraticCurveTo(-4,-22,-15,-17);});
  oval(-15,29,11,26,'#b2c5bf14',-.2);oval(-6,120,24,19,'#263e54');
  for(let i=0;i<3;i++){const grip=p.organ==='paw'?W*7:W*2,xx=-23+i*17+grip*(1-i);oval(xx,127,8,11,'#4a6372',-.25);path(linear(xx,129,xx-6,159,[[0,'#d8dbc4'],[1,'#718d99']]),()=>{c.moveTo(xx-5,129);c.bezierCurveTo(xx-14,138,xx-14,153,xx-7,159-grip);c.quadraticCurveTo(xx-5,146,xx+5,133);});}
  if(active('paw'))glow(-6,115,26,p.color+'55');c.restore();
 }
 // Captive voices are sunk into shoulder tissue, with only the speaking one bright.
 WORLD1_ORDER.forEach((hero,i)=>{const side=i<5?-1:1,j=i%5,xx=side*(39+j*5),yy=-218+j*21,lit=HEROES[b.attack]===hero;c.save();c.globalAlpha*=lit?.85:.22;oval(xx,yy,2.6,5,WORLD1_THEMES[hero].color,-side*.2);c.restore();});
 // A feline-draconic skull: round brow and muzzle emerge from a deep mane.
 c.save();c.translate(-16-(p.organ==='horn'?W*11:0),-230-(p.organ==='crown'?W*8:0));c.rotate(p.dead?.3:a.head+a.idle);
 const jaw=p.organ==='jaw'?W*9+p.strike*14:p.strike?3:0;
 for(const side of[1,-1]){
  // Swept antlers grow organically from a thick root, never a straight triangle.
  path(linear(side*20,-18,side*62,-111,[[0,'#354f62'],[.34,'#8ea8ac'],[.7,'#c4d0be'],[1,M.horn]]),()=>{c.moveTo(side*18,-22);c.bezierCurveTo(side*45,-39,side*31,-78,side*(64+S*13),-112-S*10);c.bezierCurveTo(side*46,-78,side*64,-49,side*35,-13);c.quadraticCurveTo(side*23,-9,side*18,-22);});
  for(let i=2;i>=0;i--)path(linear(side*25,-24,side*66,40,[[0,'#53677c'],[1,'#17263d']]),()=>{const yy=-29+i*17;c.moveTo(side*25,yy);c.quadraticCurveTo(side*(57+i*6),yy-20,side*(67+i*5),yy-12);c.quadraticCurveTo(side*47,yy+9,side*(51+i*2),yy+34);c.quadraticCurveTo(side*30,yy+22,side*25,yy);});
 }
 // Splintered crown unfurls into an asymmetric rack in later movements.
 if(p.phase>=2)for(let i=0;i<p.phase-1;i++){
  const xx=26+i*10,top=-79-i*13;
  path(linear(xx,-32,xx+20,top,[[0,'#3b536b'],[.5,'#889fa5'],[1,'#cbd2bb']]),()=>{c.moveTo(xx,-30);c.bezierCurveTo(xx+33,-44,xx+6,top+14,xx+25,top);c.quadraticCurveTo(xx+14,top+20,xx+31,-47);c.quadraticCurveTo(xx+37,-27,xx,-19);});
 }
 // Shadow behind the jaw separates it from the upper muzzle when breathing fire.
 oval(-12,18+jaw*.6,25,27+jaw*.2,'#071124',-.17);
 path(linear(-30,10,17,63,[[0,'#758f99'],[.55,'#3a556d'],[1,'#1b314e']]),()=>{c.moveTo(-34,7);c.quadraticCurveTo(-12,25,18,12);c.quadraticCurveTo(24,34+jaw,-13,49+jaw*.6);c.quadraticCurveTo(-31,40+jaw*.4,-34,7);});
 path(bone,()=>{c.moveTo(-25,-55);c.bezierCurveTo(0,-68,27,-55,32,-33);c.quadraticCurveTo(37,-6,19,9);c.quadraticCurveTo(8,25,-15,24);c.quadraticCurveTo(-43,18,-44,-6);c.bezierCurveTo(-51,-29,-44,-48,-25,-55);});
 // Curved cheek volumes wrap under the brow; the left muzzle leads the silhouette.
 oval(-26,-1,17,18,linear(-40,-10,-14,20,[[0,'#c4d1c3'],[.5,'#829fa3'],[1,'#3f5f75']]),-.3);
 path('#273c55',()=>{c.moveTo(-39,-27);c.quadraticCurveTo(-26,-36,-10,-21);c.quadraticCurveTo(7,-32,30,-25);c.quadraticCurveTo(23,-11,5,-11);c.quadraticCurveTo(-6,-6,-17,-14);c.quadraticCurveTo(-34,-10,-39,-27);});
 const gaze=b.target?clamp((b.target.x-(e.x+e.w/2))*(e.facing===1?-1:1)/160,-2.5,2.5):0;
 const blink=reduce?0:Math.max(0,1-Math.abs((T%410)-390)/8);
 if(!p.dead)for(const side of[-1,1]){const xx=side<0?-27:13;c.save();c.translate(xx,-20);c.scale(1,Math.max(.1,1-blink));oval(0,0,8,2.7,active('crown')?'#f6e0b1':'#c2eed7',side*.12);oval(-1+gaze,0,1.5,4,'#13253a');oval(-3,-1.5,1.5,1,'#faf5d3');c.restore();}
 // Heavy eyelids cast a soft overhang; no engraved network over the face.
 path('#819e9f',()=>{c.moveTo(-41,-29);c.quadraticCurveTo(-24,-42,-9,-25);c.quadraticCurveTo(-25,-23,-38,-20);});
 path('#9eb5ad',()=>{c.moveTo(-7,-25);c.quadraticCurveTo(15,-40,32,-27);c.quadraticCurveTo(14,-23,-4,-17);});
 oval(-17,-41,9,13,'#e4e4c421',-.3);
 for(const side of[-1,1])path('#233c55',()=>{const xx=side*26;c.moveTo(xx,-12);c.quadraticCurveTo(xx+side*16,-9,xx+side*11,9);c.quadraticCurveTo(xx+side*4,0,xx,-12);});
 // A short broad muzzle, nostrils and long curved fangs make the face predatory.
 oval(-26,12,15,9,linear(-43,5,-10,25,[[0,'#bac9ba'],[.5,'#7c9a9d'],[1,'#3a596e']]),-.08);
 path('#26374a',()=>{c.moveTo(-39,6);c.quadraticCurveTo(-32,3,-25,8);c.quadraticCurveTo(-33,14,-39,6);});
 for(const [xx,len]of[[-35,19],[-12,14]])path(linear(xx,14,xx,37,[[0,'#ebe5cb'],[1,'#8a9fa7']]),()=>{c.moveTo(xx-3,15);c.quadraticCurveTo(xx-4,25+jaw*.25,xx+3,15+len+jaw*.2);c.quadraticCurveTo(xx+5,22,xx+5,13);});
 if(active('jaw'))glow(-17,27+jaw*.4,17,p.color+'77');
 if(active('crown'))glow(-3,-60,26,p.color+'55');
 path(linear(-10,-68,12,-30,[[0,'#bacbbd'],[1,'#4f7886']]),()=>{c.moveTo(-17,-46);c.quadraticCurveTo(-7,-64,-4,-79-S*10);c.quadraticCurveTo(5,-67,10,-47);c.quadraticCurveTo(1,-34,-17,-46);});
 if(active('crown'))for(const side of[-1,1]){oval(side*26,-33,3+W*2,8+W*6,p.color,side*.3);}
 // Beard and throat frills trail behind the head's smaller idle movement.
 for(let i=0;i<3;i++)path(linear(-18+i*8,31,-7+i*12,78,[[0,'#506e82'],[1,'#34597800']]),()=>{const xx=-23+i*12;c.moveTo(xx,31);c.quadraticCurveTo(xx+14,49,xx+8,76+Math.sin(T*.03+i)*4);c.quadraticCurveTo(xx-7,59,xx,31);});
 c.restore();
 // Later phases release asymmetric fragments, drifting behind the shoulders.
 if(p.phase>=3)for(let i=0;i<(p.phase===4?7:3);i++){const side=i%2?1:-1,xx=side*(107+(i>>1)*19),yy=-150-(i>>1)*40;c.save();c.translate(xx,yy+Math.sin(T*.023+i)*5);c.rotate(side*.3+Math.sin(T*.016+i)*.1);path(linear(-9,-22,9,22,[[0,'#c2cdbd'],[.45,'#65889b'],[1,'#203d5c']]),()=>{c.moveTo(-3,-22);c.bezierCurveTo(17,-8,13,9,1,23);c.quadraticCurveTo(-11,13,-7,6);c.quadraticCurveTo(0,-8,-3,-22);});c.restore();}
 c.restore();
}

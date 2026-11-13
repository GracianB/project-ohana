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
export function drawQuimeraCreature(c,e,cam={x:0,y:0},t=0,reduce=false){
 const p=quimeraPose(e,t,reduce),b=e._fusion||{},formed=b.mode==='intro'?clamp(1-num(b.clock)/Math.max(1,num(b.introMax,260))):1;
 const ink='#101322',bone='#dbd1b4',plate='#343a50',edge='#7b8796',accent=p.color;
 const path=(fill,fn,w=2)=>{c.beginPath();fn();c.closePath();c.fillStyle=fill;c.fill();if(w){c.strokeStyle=ink;c.lineWidth=w;c.stroke();}};
 const line=(col,w,fn)=>{c.beginPath();fn();c.strokeStyle=col;c.lineWidth=w;c.stroke();};
 const oval=(x,y,rx,ry,col,rot=0)=>path(col,()=>c.ellipse(x,y,rx,ry,rot,0,TAU),1.4);
 c.save();c.translate(num(e.x)-num(cam.x)+num(e.w,230)/2,num(e.y)-num(cam.y)+num(e.h,290));c.scale(e.facing===1?-1:1,1);
 c.globalAlpha*=formed;c.lineCap='round';c.lineJoin='round';
 oval(0,3,128,14,'#070c2077');
 c.translate(p.hurt?7:p.strike?-7:p.warning*4,p.dead?31:p.breathe+p.warning*5);c.rotate(p.dead?-.24:p.hurt?.04:b.mode==='charge'?-.08:0);
 // A sinuous armored tail ends in the same broken blade as the crown.
 c.save();c.translate(57,-77);c.rotate((reduce?0:Math.sin(p.time*.035)*.06)+(p.organ==='tail'?p.warning*.4:0));
 path('#222b41',()=>{c.moveTo(-10,-17);c.bezierCurveTo(92,13,122,-25,116,-89);c.bezierCurveTo(141,-28,112,36,0,26);});
 for(let i=0;i<5;i++)line(edge,2,()=>{c.moveTo(22+i*18,-1-i*4);c.lineTo(25+i*18,18-i*6);});
 path(bone,()=>{c.moveTo(106,-73);c.lineTo(111,-114);c.lineTo(134,-94);c.lineTo(119,-61);});c.restore();
 // Two structural wings grow from scapulae, with one elbow and three fingers.
 for(const side of [1,-1]){
  const spread=40+p.spread*43+(p.organ==='wing'?p.warning*22:0);
  c.save();c.translate(side*54,-189);c.scale(side,1);c.rotate(-.12-p.spread*.13+(reduce?0:Math.sin(p.time*.04+side)*.025));
  path('#23283f',()=>{c.moveTo(-9,24);c.lineTo(22,-41);c.lineTo(spread,-102);c.lineTo(spread+43,-134);c.lineTo(spread+34,-63);c.lineTo(spread+76,15);c.quadraticCurveTo(spread+43,-8,spread+28,36);c.quadraticCurveTo(50,9,14,49);});
  const membrane=c.createLinearGradient(0,-70,110,25);membrane.addColorStop(0,'#45445f');membrane.addColorStop(1,p.phase>=3?'#694b61':'#30364b');
  path(membrane,()=>{c.moveTo(13,13);c.lineTo(spread+28,-81);c.lineTo(spread+57,8);c.quadraticCurveTo(spread+31,0,spread+22,24);c.quadraticCurveTo(40,9,13,35);},1);
  for(let i=0;i<3;i++)line(edge,2.5,()=>{c.moveTo(6,21);c.lineTo(spread+24,-76);c.lineTo(spread+54-i*20,10+i*9);});
  path(bone,()=>{c.moveTo(spread+25,-90);c.lineTo(spread+43,-134);c.lineTo(spread+39,-94);});
  if(p.organ==='wing'&&(p.warning||p.strike))line(accent,3,()=>{c.moveTo(6,21);c.lineTo(spread+24,-76);c.lineTo(spread+53,11);});
  c.restore();
 }
 // Powerful haunches, angular ankle armor and three planted claws per paw.
 for(const side of [1,-1]){
  c.save();c.translate(side*55,-58);c.rotate(side*p.gait*.13);
  oval(0,-9,34,46,'#333b50',side*.2);
  path(plate,()=>{c.moveTo(-22,3);c.lineTo(-32,40);c.lineTo(-41,51);c.quadraticCurveTo(-4,67,31,51);c.lineTo(24,12);});
  for(let k=0;k<3;k++)path(bone,()=>{const x=-29+k*19;c.moveTo(x,45);c.lineTo(x-8,60);c.lineTo(x+10,57);c.lineTo(x+12,46);},1);
  line(edge,2,()=>{c.moveTo(-18,-15);c.lineTo(10,-30);c.lineTo(23,-9);});c.restore();
 }
 const armor=c.createLinearGradient(-90,-210,90,-55);armor.addColorStop(0,'#647183');armor.addColorStop(.45,'#353e54');armor.addColorStop(1,'#1b2338');
 path(armor,()=>{c.moveTo(-36,-238);c.quadraticCurveTo(-96,-226,-95,-166);c.lineTo(-72,-77);c.quadraticCurveTo(0,-48,73,-84);c.lineTo(95,-170);c.quadraticCurveTo(93,-223,37,-237);});
 // Interlocking ribs open away from the core during a genuine recovery.
 for(const side of [-1,1])for(let i=0;i<4;i++){
  const x=side*(25+p.open*8+p.spread*10+i*2),y=-199+i*27;
  path(i%2?'#475267':'#596477',()=>{c.moveTo(x,y-14);c.lineTo(side*(72-i*5),y-23);c.lineTo(side*(78-i*6),y-3);c.lineTo(x,y+11);});
  line('#a3a9a4',1,()=>{c.moveTo(x,y-10);c.lineTo(side*(67-i*5),y-17);});
 }
 path(ink,()=>{c.moveTo(0,-208);c.lineTo(29+p.open*7,-161);c.lineTo(0,-106);c.lineTo(-29-p.open*7,-161);});
 c.save();c.translate(0,-160);c.scale(.85+p.spread*.35,.85+p.spread*.35);c.translate(0,160);
 const core=c.createRadialGradient(0,-160,2,0,-160,33);core.addColorStop(0,p.dead?'#7e7485':'#fff1cc');core.addColorStop(.4,p.open>.5?'#7ce6d1':accent);core.addColorStop(1,'#6d3d69');
 path(core,()=>{c.moveTo(0,-194);c.lineTo(21,-163);c.lineTo(0,-122);c.lineTo(-21,-163);},1.5);
 line('#fff1cb',1.7,()=>{c.moveTo(0,-185);c.lineTo(-8,-162);c.lineTo(0,-132);});
 c.restore();
 // Ten visible shards; the selected stolen voice alone lights its channels.
 WORLD1_ORDER.forEach((hero,i)=>{
  const side=i<5?-1:1,j=i%5,x=side*(56+Math.sin(j*.8)*10),y=-218+j*26,col=WORLD1_THEMES[hero].color;
  const active=HEROES[b.attack]===hero;
  path(active?col:'#242b40',()=>{c.moveTo(x,y-7);c.lineTo(x+6,y);c.lineTo(x,y+8);c.lineTo(x-6,y);},1);
  line(active?col:'#81889a',1.2,()=>{c.moveTo(x,y);c.lineTo(side*24,-160);});
 });
 // Forearms visibly brace, cast or recoil; the low stance sells the weight.
 for(const side of [1,-1]){
  const raise=p.organ==='paw'?p.warning*.6:p.organ==='core'?p.warning*.2:0;
  c.save();c.translate(side*78,-190);c.rotate(side*(.08+raise-p.strike*.14));
  path('#475165',()=>{c.moveTo(-19,-7);c.quadraticCurveTo(-37,29,-25,59);c.lineTo(-22,102);c.quadraticCurveTo(0,119,23,102);c.lineTo(28,46);c.lineTo(19,-6);});
  path('#727d89',()=>{c.moveTo(-23,34);c.lineTo(0,19);c.lineTo(28,35);c.lineTo(18,60);c.lineTo(-20,63);});
  path('#2b344b',()=>{c.moveTo(-23,80);c.lineTo(-30,126);c.quadraticCurveTo(0,140,34,121);c.lineTo(21,81);});
  for(let k=0;k<3;k++)path(bone,()=>{const x=-21+k*18;c.moveTo(x,118);c.lineTo(x-7,142);c.lineTo(x+10,136);c.lineTo(x+11,117);},1);
  if(p.organ==='paw')line(accent,2.5,()=>{c.moveTo(0,53);c.lineTo(-2,116);});c.restore();
 }
 // A single leonine head, heavy jaw and broken crown replace the old prop pile.
 c.save();c.translate(-7-(p.organ==='horn'?p.warning*12:0),-219-(p.organ==='crown'?p.warning*8:0));
 c.rotate(p.organ==='jaw'?-p.warning*.1:p.dead?.22:0);
 for(const side of [1,-1]){
  path('#454d62',()=>{c.moveTo(side*27,-18);c.lineTo(side*62,-63);c.lineTo(side*69,-23);c.lineTo(side*44,21);});
  path(bone,()=>{c.moveTo(side*30,-38);c.quadraticCurveTo(side*36,-85,side*64,-104);c.lineTo(side*54,-66);c.lineTo(side*65,-73);c.quadraticCurveTo(side*57,-40,side*40,-27);});
  line('#8c817c',1.5,()=>{c.moveTo(side*39,-41);c.lineTo(side*54,-82);});
 }
 path('#515d70',()=>{c.moveTo(-39,-52);c.quadraticCurveTo(2,-77,44,-46);c.lineTo(52,-7);c.lineTo(30,32);c.lineTo(-18,34);c.lineTo(-54,4);});
 // Mane plates overlap the neck, keeping the skull connected to the spine.
 for(const side of [-1,1])for(let i=0;i<3;i++)path(i%2?'#353e54':'#77818b',()=>{const x=side*(36+i*4),y=-21+i*16;c.moveTo(x,y-12);c.lineTo(x+side*24,y+18);c.lineTo(x-side*6,y+12);});
 for(const side of [-1,1]){
  const x=side*23,y=-21;
  path(ink,()=>{c.moveTo(x-14,y-6);c.lineTo(x+15,y-10);c.lineTo(x+11,y+7);c.lineTo(x-11,y+6);},1);
  if(!p.dead){path('#ffe3a0',()=>{c.moveTo(x-11,y-3);c.lineTo(x+11,y-6);c.lineTo(x+8,y+3);c.lineTo(x-8,y+3);},0);oval(x-2,y-1,2,6,ink);}
  line('#92979a',3,()=>{c.moveTo(x-14,y-9);c.lineTo(x+13,y-13);});
 }
 const jaw=p.organ==='jaw'?(p.warning*6+p.strike*13):p.strike?5:0;
 path('#20283c',()=>{c.moveTo(-43,5);c.lineTo(28,8);c.lineTo(24,30+jaw);c.lineTo(-25,34+jaw);c.lineTo(-52,22);});
 path('#8d969b',()=>{c.moveTo(-41,-2);c.lineTo(-4,-4);c.lineTo(30,6);c.lineTo(16,18);c.lineTo(-30,17);c.lineTo(-55,6);});
 path(ink,()=>{c.moveTo(-38,-2);c.lineTo(-13,-1);c.lineTo(-21,9);c.lineTo(-35,7);},1);
 for(let i=0;i<4;i++)path(bone,()=>{const x=-35+i*16;c.moveTo(x,17);c.lineTo(x+4,25+jaw*.25);c.lineTo(x+8,16);},.8);
 if(p.organ==='jaw'&&(p.warning||p.strike))line(accent,3,()=>{c.moveTo(-38,27+jaw*.4);c.lineTo(15,28+jaw*.4);});
 path(p.phase>=3?'#e2bc8d':'#8f969a',()=>{c.moveTo(-11,-51);c.lineTo(0,-84-p.spread*13);c.lineTo(13,-51);c.lineTo(0,-34);});
 if(p.organ==='crown')line(accent,2.5,()=>{c.moveTo(-39,-41);c.lineTo(-52,-79);c.moveTo(39,-41);c.lineTo(52,-79);});
 c.restore();
 // Phase damage is structural, not a palette swap: plates split around the heart.
 if(p.phase>=2)for(const side of [-1,1])line('#e6b994',1.8,()=>{c.moveTo(side*21,-205);c.lineTo(side*35,-185);c.lineTo(side*28,-169);c.lineTo(side*41,-142);});
 if(p.phase>=3)for(const side of [-1,1]){
  path('#181e32',()=>{c.moveTo(side*46,-134);c.lineTo(side*60,-110);c.lineTo(side*38,-83);c.lineTo(side*33,-113);});
  line('#daaa88',1.7,()=>{c.moveTo(side*46,-134);c.lineTo(side*60,-110);c.lineTo(side*38,-83);});
 }
 if(p.phase>=3)line('#efc18a',2,()=>{c.moveTo(35,-82);c.lineTo(21,-97);c.lineTo(29,-114);});
 if(p.phase===4)for(let i=0;i<4;i++){
  const side=i%2?-1:1,x=side*(103+(i>>1)*22),y=-125-(i>>1)*53;
  c.save();c.translate(x,y+(reduce?0:Math.sin(p.time*.04+i)*3));c.rotate(side*.25);
  path('#566174',()=>{c.moveTo(-8,-14);c.lineTo(10,-6);c.lineTo(5,17);c.lineTo(-9,7);});
  line('#edc394',1.5,()=>{c.moveTo(-5,-9);c.lineTo(4,-4);c.lineTo(1,10);});c.restore();
 }
 if(p.phase===4)for(const side of [-1,1])path('#e7c798',()=>{c.moveTo(side*18,-191);c.lineTo(side*37,-207);c.lineTo(side*33,-171);},1);
 c.restore();
}

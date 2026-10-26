// Quimera: one living, articulated creature. Decorative geometry never changes
// the combat hitbox. Four anatomically continuous metamorphoses, not hero props.
const TAU=Math.PI*2;
function shape(c,fill,fn,width=2.5){c.beginPath();fn();c.closePath();c.fillStyle=fill;c.fill();if(width){c.strokeStyle='#161d35';c.lineWidth=width;c.stroke();}}
function oval(c,x,y,rx,ry,fill,angle=0){shape(c,fill,()=>c.ellipse(x,y,rx,ry,angle,0,TAU));}
function line(c,col,w,fn){c.strokeStyle=col;c.lineWidth=w;c.beginPath();fn();c.stroke();}
function material(c,x,y,r,light,mid,dark){const g=c.createRadialGradient(x-r*.35,y-r*.45,2,x,y,r);g.addColorStop(0,light);g.addColorStop(.45,mid);g.addColorStop(1,dark);return g;}
export function quimeraPose(e,t=0,reduce=false){
 const b=e._fusion||{},phase=Math.max(1,Math.min(4,e.phase||1)),clock=b.clock||0;
 const warning=b.mode==='warn'?Math.max(0,Math.min(1,(100-clock)/65)):0,strike=['attack','strike','special','charge','leap'].includes(b.mode)?1:0;
 return {phase,time:reduce?0:t,breathe:reduce?0:Math.sin(t*.045)*2.6,warning,strike,hurt:(e.flash||0)>0?1:0,dead:e.hp<=0||e.dying>0,spread:(phase-1)/3};
}
export function drawQuimeraCreature(c,e,cam,t=0,reduce=false){
 const p=quimeraPose(e,t,reduce),b=e._fusion||{},formed=b.mode==='intro'?Math.max(0,Math.min(1,1-b.clock/Math.max(1,b.introMax))):1;
 const x=e.x-cam.x+e.w/2,foot=e.y-cam.y+e.h;
 c.save();c.translate(x,foot);c.scale(e.facing===1?-1:1,1);c.globalAlpha*=formed;c.lineJoin='round';c.lineCap='round';
 oval(c,0,2,145,19,'#080d2480');
 // Spine bends at its pelvis; the forebody braces before a strike.
 c.translate(p.hurt?12:p.strike?-14:p.warning*9,p.dead?24:p.breathe+p.warning*10);c.rotate(p.dead?-.13:p.hurt?.065:p.strike?-.055:0);
 const shell=material(c,-20,-200,170,'#92b7ba','#406078','#202d4e'),skin=material(c,0,-120,110,'#b1cbc0','#719c9c','#344b69');
 // Segmented muscular tail, rooted in the sacrum, with overlapping scutes.
 c.save();c.translate(65,-105);c.rotate(reduce?-.08:Math.sin(p.time*.025)*.07);
 shape(c,shell,()=>{c.moveTo(-10,-20);c.bezierCurveTo(102,-85,147,-14,172,-85);c.bezierCurveTo(203,-132,237,-95,214,-67);c.bezierCurveTo(193,-9,94,31,0,29);});
 for(let i=0;i<8;i++){const xx=28+i*23,yy=-27-i*i*.65;line(c,'#bed3ca',2,()=>{c.moveTo(xx,yy-8);c.quadraticCurveTo(xx+13,yy+1,xx+8,yy+24);});}
 shape(c,'#d6c9a3',()=>{c.moveTo(196,-81);c.quadraticCurveTo(234,-141,240,-117);c.quadraticCurveTo(247,-88,218,-64);});c.restore();
 // Wing shoulders remain visible in phase I; each later phase opens the
 // same elbow/wrist skeleton and finally exposes a translucent inner membrane.
 for(const side of [1,-1]){
  c.save();c.translate(side*59,-233);c.scale(side,1);c.rotate(-.17-p.spread*.25+(reduce?0:Math.sin(p.time*.035)*.045));
  const reach=68+p.spread*100;
  shape(c,material(c,80,-64,180,'#a9a9cb','#656381','#303653'),()=>{c.moveTo(-4,16);c.bezierCurveTo(35,-35,55,-103,reach,-160);c.bezierCurveTo(reach+44,-109,reach+78,-50,reach+64,10);c.quadraticCurveTo(reach+28,-13,reach+5,40);c.quadraticCurveTo(65,8,23,65);c.lineTo(-4,16);});
  for(let k=0;k<4;k++){const ex=reach+55-k*29,ey=7+k*13;line(c,'#bcc8c8',5-k*.65,()=>{c.moveTo(2,4);c.quadraticCurveTo(reach*.72,-104+k*24,ex,ey);});line(c,'#252b49',1.3,()=>{c.moveTo(5,8);c.quadraticCurveTo(reach*.7,-86+k*22,ex-5,ey+6);});}
  for(let k=0;k<9;k++){const xx=25+k*13,yy=-33-Math.sin(k*.33)*44;line(c,'#d6bbcf55',1,()=>{c.moveTo(xx,yy);c.quadraticCurveTo(xx+15,yy+10,xx+24,yy+27);});}
  if(p.phase===4){c.globalAlpha*=.65;shape(c,'#aee3d0',()=>{c.moveTo(19,17);c.quadraticCurveTo(reach,-124,reach+43,-18);c.quadraticCurveTo(94,8,35,43);},1);}
  oval(c,4,8,18,22,shell);c.restore();
 }
 // Weight-bearing hind legs, separate knee and ankle; planted claws.
 for(const side of [1,-1]){
  c.save();c.translate(side*61,-83);c.rotate(side*(p.warning*.08-p.strike*.1));
  oval(c,0,-7,36,57,material(c,0,-10,67,'#acbdb5','#607c8b','#26364f'),side*.2);oval(c,side*9,31,24,31,material(c,side*9,26,38,'#d7dbbd','#8fa8a0','#456078'));
  shape(c,material(c,-3,48,65,'#a4b8af','#536d84','#273451'),()=>{c.moveTo(-19,29);c.quadraticCurveTo(-32,57,-37,79);c.bezierCurveTo(-20,91,26,91,43,78);c.quadraticCurveTo(26,52,20,31);});
  for(let k=0;k<3;k++)shape(c,'#e4d8b6',()=>{const xx=-21+k*21;c.moveTo(xx,73);c.quadraticCurveTo(xx-5,94,xx+8,87);c.lineTo(xx+14,75);},1.5);
  line(c,'#bfd1c3',2,()=>{c.moveTo(-17,-26);c.quadraticCurveTo(5,-41,23,-20);});c.restore();
 }
 // Pear-shaped chest overlaps the pelvic joint rather than floating above it.
 shape(c,shell,()=>{c.moveTo(-48,-269);c.bezierCurveTo(-105,-243,-112,-169,-91,-110);c.bezierCurveTo(-68,-58,57,-57,91,-114);c.bezierCurveTo(119,-176,94,-244,48,-269);});
 shape(c,skin,()=>{c.moveTo(-30,-238);c.bezierCurveTo(-66,-207,-65,-145,-38,-113);c.quadraticCurveTo(0,-89,43,-115);c.bezierCurveTo(66,-163,57,-217,30,-238);});
 for(let k=0;k<6;k++){const yy=-219+k*19;line(c,'#d0d8c4',2,()=>{c.moveTo(-31-k%2*7,yy);c.quadraticCurveTo(0,yy+13,35+k%2*5,yy);});}
 // Ten borrowed souls are embedded as mineral seams, not orbiting baubles.
 const colors=['#efaaa7','#a2cfe5','#e9ce87','#cab1dc','#a0d5c7'];
 for(const side of [-1,1])for(let k=0;k<5;k++){
  const xx=side*(63+Math.sin(k)*8),yy=-240+k*27;
  shape(c,material(c,xx,yy,22,'#e8e8d4',colors[k],'#354360'),()=>{c.moveTo(xx-13,yy-13);c.quadraticCurveTo(xx+8,yy-21,xx+15,yy);c.quadraticCurveTo(xx+2,yy+19,xx-12,yy+11);},1.5);
  line(c,'#f6ead055',1,()=>{c.moveTo(xx-8,yy-7);c.lineTo(xx+4,yy+5);});
 }
 // The heart is a physical split sternum, progressively exposed.
 if(p.phase>=2){shape(c,'#22223f',()=>{c.moveTo(-12,-227);c.lineTo(17,-216);c.lineTo(9,-183);c.lineTo(-19,-192);});oval(c,0,-205,7+p.spread*7,12+p.spread*7,material(c,0,-205,26,'#fff4c8','#d8ad9b','#8b557f'));}
 // The carapace physically opens at the clavicle as the stolen core wakes.
 if(p.phase>=2)for(const side of [-1,1]){
  c.save();c.translate(side*68,-237);c.rotate(side*(p.phase-1)*.16);
  shape(c,material(c,side*13,-8,48,'#d2d9c3','#718c99','#344361'),()=>{c.moveTo(-19,20);c.quadraticCurveTo(-32,-26,side*38,-55);c.quadraticCurveTo(side*58,-8,19,31);});
  for(let k=0;k<4;k++)line(c,'#e2d6b2',1.3,()=>{c.moveTo(-10+k*8,9);c.lineTo(side*25+k*3,-27);});c.restore();
 }
 // Fine pores, scars and nested plate edges follow the chest curvature.
 for(const side of [-1,1])for(let k=0;k<16;k++){
  const xx=side*(42+Math.sin(k*.8)*8),yy=-221+k*7;
  line(c,k%3?'#283b5666':'#d8e0ca99',1,()=>{c.moveTo(xx,yy);c.quadraticCurveTo(xx+side*6,yy-2,xx+side*8,yy+3);});
 }
 // Long forearms hang from the clavicle; wrists tense before casting.
 for(const side of [1,-1]){
  c.save();c.translate(side*87,-225);c.rotate(side*(.12+p.warning*.48-p.strike*.7));
  oval(c,side*8,30,24,49,material(c,side*8,18,60,'#c7cbb3','#718e94','#34425e'),-side*.18);oval(c,side*16,69,19,19,material(c,side*16,64,25,'#e3ddbd','#a2b6a8','#52697c'));
  shape(c,material(c,side*31,100,58,'#a0b4ae','#506d83','#273452'),()=>{c.moveTo(side*16-18,66);c.quadraticCurveTo(side*40-30,112,side*40-22,128);c.quadraticCurveTo(side*40,141,side*40+23,125);c.lineTo(side*16+18,67);});
  for(let k=0;k<3;k++){const xx=side*39-18+k*17;shape(c,'#ddd4ba',()=>{c.moveTo(xx,119);c.quadraticCurveTo(xx-10,157,xx+4,148);c.lineTo(xx+11,125);},1.5);}
  for(let k=0;k<3;k++)line(c,'#a7c4be',2,()=>{c.moveTo(side*11-12+k*9,9);c.lineTo(side*17-12+k*9,43);});c.restore();
 }
 // Interlocking collar scales and recessed sternum channels catch real light.
 for(const side of [-1,1])for(let k=0;k<4;k++){
  const xx=side*(24+k*12),yy=-245+k*12;
  shape(c,material(c,xx,yy,20,'#dae0c5','#8ca79f','#3f5a71'),()=>{c.moveTo(xx-10,yy-12);c.quadraticCurveTo(xx+13,yy-8,xx+12,yy+8);c.quadraticCurveTo(xx-1,yy+15,xx-10,yy);},1.3);
 }
 for(let k=0;k<4;k++){const yy=-177+k*18;line(c,'#28405b80',3,()=>{c.moveTo(-19,yy);c.quadraticCurveTo(0,yy+11,21,yy);});line(c,'#e2e3c877',1,()=>{c.moveTo(-16,yy+3);c.quadraticCurveTo(0,yy+13,18,yy+3);});}
 // Neck connects jaw to chest. Crown is grown bone, never a copied halo.
 oval(c,0,-263,40,48,shell);c.save();c.translate(p.strike?-10:0,-p.warning*7);
 for(const side of [1,-1]){
  shape(c,material(c,side*51,-318,70,'#b5cbc4','#658993','#2c405b'),()=>{c.moveTo(side*30,-318);c.bezierCurveTo(side*65,-367,side*105,-359,side*126,-386);c.bezierCurveTo(side*115,-330,side*80,-294,side*41,-291);});
  line(c,'#cbd8c8',2,()=>{c.moveTo(side*44,-313);c.quadraticCurveTo(side*85,-336,side*113,-366);});
  shape(c,material(c,side*50,-375,68,'#fff0c7','#c9bc98','#736e75'),()=>{c.moveTo(side*29,-342);c.quadraticCurveTo(side*62,-385,side*(55+p.spread*20),-419-p.spread*20);c.quadraticCurveTo(side*92,-378,side*47,-332);});
 }
 shape(c,material(c,-5,-309,85,'#d6d7c0','#8ba9a6','#415674'),()=>{c.moveTo(-46,-338);c.bezierCurveTo(-81,-310,-60,-264,-37,-250);c.quadraticCurveTo(0,-229,41,-253);c.bezierCurveTo(70,-273,77,-320,44,-338);c.quadraticCurveTo(0,-360,-46,-338);});
 // Heavy brows frame separate sclera, iris, pupil and catchlight.
 for(const side of [-1,1]){
  oval(c,side*27,-300,21,15,'#18253c',side*.13);
  oval(c,side*27-2,-299,14,p.dead?2:10,p.phase>=3?'#f5c7a5':'#d7e4d1',side*.13);
  if(!p.dead){oval(c,side*27-5,-299,6,9,'#8d637d');oval(c,side*27-7,-299,2.5,7,'#141d32');oval(c,side*27-8,-303,2,2,'#fff6dc');}
  line(c,'#3c5268',7,()=>{c.moveTo(side*9,-319+p.warning*5);c.quadraticCurveTo(side*28,-329,side*47,-316);});
  for(let k=0;k<3;k++)line(c,'#bdc9b7',1.5,()=>{c.moveTo(side*(40+k*5),-281);c.lineTo(side*(46+k*5),-273);});
 }
 oval(c,0,-278,16,10,'#3d4b60');line(c,'#233149',3,()=>{c.moveTo(-27,-261);c.quadraticCurveTo(0,-263+(p.strike?16:0),29,-263);});
 for(const side of [-1,1])shape(c,'#f3e0bb',()=>{c.moveTo(side*19,-263);c.quadraticCurveTo(side*22,-245,side*29,-259);},1);
 // Phase III reveals the branching forehead organ, phase IV its inner eye.
 shape(c,material(c,0,-367,65,'#fff2cc','#c4bd9e','#747782'),()=>{c.moveTo(-12,-339);c.quadraticCurveTo(-22,-382,-9,-407);c.lineTo(0,-389);c.lineTo(13,-411-p.spread*12);c.quadraticCurveTo(27,-372,15,-339);});
 if(p.phase>=3){for(const side of [-1,1])line(c,'#cfb7c5',4,()=>{c.moveTo(side*9,-356);c.quadraticCurveTo(side*33,-376,side*29,-396);});}
 // Branches are grown bone with asymmetric tips and incised grain.
 if(p.phase>=3)for(const side of [-1,1]){
  shape(c,material(c,side*28,-384,56,'#f9e7c4','#b6a6a4','#635b79'),()=>{c.moveTo(side*11,-357);c.quadraticCurveTo(side*44,-381,side*32,-415);c.lineTo(side*43,-403);c.lineTo(side*54,-421);c.quadraticCurveTo(side*57,-381,side*22,-351);},1.8);
 }
 for(const side of [-1,1])for(let k=0;k<5;k++)line(c,'#756e7b77',1,()=>{c.moveTo(side*(35+k*3),-350-k*8);c.lineTo(side*(45+k*2),-353-k*8);});
 for(const side of [-1,1]){line(c,'#e1d6bb',2,()=>{c.moveTo(side*15,-287);c.quadraticCurveTo(side*30,-278,side*46,-286);});oval(c,side*6,-279,2.3,1.5,'#142238');}
 if(p.phase===4)oval(c,0,-329,6,11,'#fff0bd');
 c.restore();
 if(p.hurt){c.globalAlpha*=.3;line(c,'#ffe5ce',5,()=>{c.moveTo(-80,-232);c.quadraticCurveTo(-116,-159,-77,-106);});}
 c.restore();
}

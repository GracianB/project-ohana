import {drawMichiDetails,drawMichiNeon,drawMichiGrimoire} from './michi-details.js';
import {michiActing,michiChoreography,michiPawCycle} from './michi-acting.js';
// Five anatomical metamorphoses. Pose-only art: never changes simulation or hitboxes.
const TAU=Math.PI*2;
const number=(v,d=0)=>Number.isFinite(v)?v:d;
const clamp=v=>Math.max(0,Math.min(1,number(v)));
export const REBEL_SILHOUETTES=Object.freeze(['kitten-quadruped','winged-glider','onyx-mouse','wizard-lynx','floating-cat-ghost']);
// Art-space envelopes include lifted paws, ear tufts, soul-lights and wings.
export const REBEL_ART_HEIGHT=Object.freeze([100,135,98,158,150]);
function tools(c){
 const stroke=(color,w,fn)=>{c.beginPath();fn();c.strokeStyle=color;c.lineWidth=w;c.stroke();};
 const shape=(color,fn,edge='#111827')=>{c.beginPath();fn();c.closePath();c.fillStyle=color;c.fill();if(edge){c.strokeStyle=edge;c.lineWidth=1.7;c.stroke();}};
 const oval=(x,y,rx,ry,color,rotation=0)=>{c.beginPath();c.ellipse(x,y,rx,ry,rotation,0,TAU);c.fillStyle=color;c.fill();};
 return{c,stroke,shape,oval};
}
function face(a,p,{x=0,y=-50,size=1,fur='#45516b',kind='kitten',accent='#ff725f'}={}){
 const{c,shape,stroke,oval}=a;c.save();c.translate(x+p.look*1.5+(p.inspect||0)*2,y+(p.groom||0)*3+p.breath);c.rotate(p.state==='hurt'?.13:p.state==='victory'?-.1:Math.sin(p.t*.032)*.025+p.ear+(p.inspect||0)*.06-(p.groom||0)*.08);c.scale(size,size);
 const lynx=kind==='lynx',panther=kind==='panther',royal=kind==='royal';
 // Ear notch, amber slit eyes, cheek scar and piercing identify the same cat.
 const ear=lynx?-40:panther?-21:kind==='glider'?-36:-30+p.threat*8;
 shape(fur,()=>{if(kind==='kitten'){c.moveTo(-23,-5);c.quadraticCurveTo(-26,-17,-23,-29);c.lineTo(-17,-24);c.lineTo(-13,-27);c.quadraticCurveTo(-10,-22,-6,-17);c.quadraticCurveTo(7,-23,16,-15);c.quadraticCurveTo(23,-31,27,-28);c.lineTo(26,-5);c.bezierCurveTo(37,8,20,22,3,21);c.bezierCurveTo(-17,24,-32,13,-23,-5);return;}if(panther){c.moveTo(-23,-5);c.quadraticCurveTo(-32,-26,-20,-24);c.quadraticCurveTo(-14,-23,-13,-16);c.quadraticCurveTo(5,-22,17,-15);c.quadraticCurveTo(28,-31,32,-20);c.lineTo(27,-3);c.quadraticCurveTo(35,14,13,18);c.quadraticCurveTo(-7,24,-26,9);return;}c.moveTo(-22,-7);c.lineTo(-24,ear);c.lineTo(-17,ear+5);c.lineTo(-13,ear-1);c.lineTo(-6,-18);c.quadraticCurveTo(7,-23,15,-16);c.lineTo(27,ear-1);c.lineTo(25,-3);c.quadraticCurveTo(panther?35:28,13,13,18);c.quadraticCurveTo(-4,23,-23,9);c.lineTo(-30,3);c.lineTo(-22,0);});
 for(const side of[-1,1])shape(kind==='ghost'?'#c3a9dc':'#b5728a',()=>{c.moveTo(side*22,ear+7);c.lineTo(side*14,-12);c.lineTo(side*21,-10);});
 if(lynx)for(const side of[-1,1]){stroke('#97e5df',2,()=>{c.moveTo(side*24,-34);c.lineTo(side*27,-48);c.moveTo(side*23,-35);c.lineTo(side*19,-45);});shape('#8ab4c1',()=>{c.moveTo(side*23,1);c.lineTo(side*35,12);c.lineTo(side*20,10);});}
 if(kind==='kitten')shape('#9aa5b5',()=>{c.moveTo(-15,-15);c.quadraticCurveTo(-4,-32,0,-20);c.quadraticCurveTo(9,-27,14,-19);c.quadraticCurveTo(6,-13,1,-9);c.quadraticCurveTo(-6,-15,-15,-15);},null);
 else if(kind==='ghost')shape('#e3fff0',()=>{c.moveTo(-16,-17);c.quadraticCurveTo(-4,-31,2,-20);c.quadraticCurveTo(8,-25,17,-20);c.quadraticCurveTo(11,-12,3,-12);c.quadraticCurveTo(-5,-16,-16,-17);},null);
 else if(!panther)shape(royal?'#e3d0a2':'#7d8b9e',()=>{c.moveTo(-17,-17);c.lineTo(-6,panther?-22:-29);c.lineTo(-5,-19);c.lineTo(7,panther?-23:-28);c.lineTo(4,-19);c.lineTo(18,-20);c.lineTo(5,-9);c.lineTo(-5,-12);c.lineTo(-9,-5);});
 if(lynx||royal)shape(royal?'#524460':'#283f54',()=>{c.moveTo(-21,-7);c.lineTo(-8,-14);c.lineTo(0,-5);c.lineTo(9,-13);c.lineTo(23,-7);c.lineTo(17,7);c.lineTo(0,1);c.lineTo(-18,7);});
 const blink=p.state==='dead'||(!p.still&&Math.sin(p.t*.043)>.994);
 for(const side of[-1,1]){const ex=side*11,ey=-1+side;
  if(blink)stroke('#f4d28e',2,()=>{c.moveTo(ex-5,ey);c.lineTo(ex+5,ey+side);});
  else{oval(ex,ey,kind==='ghost'?8:kind==='kitten'?8:7,kind==='ghost'?5.5:kind==='kitten'?7:4.6,'#ecd48b',side*.1);oval(ex+p.look*2,ey+p.lookY*1.4,1.5,4,'#131a2b');oval(ex+2,ey-1.6,kind==='kitten'?1.7:.9,kind==='kitten'?1.7:.9,'#fff5d2');stroke('#101728',2,()=>{c.moveTo(ex-7,ey-(kind==='kitten'?8:5)-side);c.lineTo(ex+6,ey-(kind==='kitten'?8:4)+side);});}
 }
 if(p.gesture>.1&&(panther||kind==='ghost')){oval(3,12,8,4+p.gesture*8,'#263147');oval(4,16,4,p.gesture*3,'#cd91a4');}
 if(p.threat>.4){shape('#283347',()=>{c.moveTo(-3,10);c.quadraticCurveTo(7,5,17,11);c.quadraticCurveTo(8,24,-3,10);},null);for(const x of[2,11])shape('#f1e2cc',()=>{c.moveTo(x,11);c.lineTo(x+4,11);c.lineTo(x+2,17);},null);}
 oval(2,9,panther?13:9,6,panther?'#202326':royal?'#c6bda8':kind==='ghost'?'#dcf2de':'#9ba6b8');shape('#1c2435',()=>{c.moveTo(-2,5);c.lineTo(5,5);c.lineTo(1,9);});stroke('#172031',1.2,()=>{c.moveTo(1,10);c.quadraticCurveTo(7,15,13,10);});
 if(royal)for(const side of[-1,1])shape('#fff0d5',()=>{c.moveTo(side*9,12);c.lineTo(side*14,12);c.lineTo(side*11,panther?25:21);});
 if(kind==='kitten'){for(const side of[-1,1])oval(side*20,8,4,2,'#d992a7');oval(1,6,2.5,1.5,'#d89ca9');}
 for(const side of[-1,1])for(let k=0;k<2;k++)stroke(kind==='ghost'?'#638d96':'#b0b9cd',.9,()=>{c.moveTo(side*17,8+k*4);c.lineTo(side*(30+k*2),5+k*7);});
 stroke('#df999d',1.4,()=>{c.moveTo(18,-8);c.lineTo(14,5);});c.beginPath();c.arc(-23,-17,3,0,TAU);c.strokeStyle='#e9d8b2';c.lineWidth=1.7;c.stroke();
 if(royal)shape('#efcc83',()=>{c.moveTo(-17,-24);c.lineTo(-18,-38);c.lineTo(-7,-31);c.lineTo(1,-47);c.lineTo(9,-32);c.lineTo(22,-39);c.lineTo(18,-24);c.lineTo(0,-19);});
 c.restore();
}
function scarf(a,x,y,color='#d54d54',length=21,sway=0){const{c,shape,stroke}=a;shape(color,()=>{c.moveTo(x-17,y-6);c.quadraticCurveTo(x,y+4,x+18,y-5);c.lineTo(x+6,y+9);c.lineTo(x-4,y+15);c.lineTo(x-10,y+5);c.lineTo(x-length,y+9+sway);});stroke('#ffab81',1,()=>{c.moveTo(x-11,y-3);c.lineTo(x+1,y+3);});}
function tail(a,p,{x=-15,y=-20,tipX=-48,tipY=-50,color='#45516b',accent='#ff725f',width=8}={}){const{c,stroke}=a,sw=Math.sin(p.t*.06)*3+(p.tailLag||0);stroke('#101727',width+3,()=>{c.moveTo(x,y);c.bezierCurveTo(tipX-15,y+6,tipX-12,tipY+10,tipX,tipY+sw);});stroke(color,width,()=>{c.moveTo(x,y);c.bezierCurveTo(tipX-15,y+6,tipX-12,tipY+10,tipX,tipY+sw);});stroke(accent,Math.max(2,width*.4),()=>{c.moveTo(tipX-8,tipY+8+sw);c.quadraticCurveTo(tipX-7,tipY,tipX,tipY+sw);});}
function paw(a,p,x,y,width=7,color='#66768d',long=false){const{c,oval,stroke}=a;oval(x,y,width,4.5,color);for(let k=0;k<3;k++)stroke('#d6dedf',long?1.5:.8,()=>{c.moveTo(x+width-2,y-2+k*2);c.lineTo(x+width+(long?10:1),y-4+k*3);});}
function kitten(a,p){const{c,shape,oval}=a;
 tail(a,p,{tipX:-39,tipY:-42,width:7});
 // Small four-legged rascal: big head, compact rump, oversized front paws.
 oval(-12,-20,23,16,'#4b5971',-.12);oval(-5,-15,16,8,'#758399',.1);shape('#253244',()=>{c.moveTo(-29,-25);c.quadraticCurveTo(-10,-36,11,-22);c.lineTo(4,-11);c.lineTo(-23,-12);});
 for(const [x,phase]of[[-25,0],[-10,Math.PI],[7,Math.PI],[22,0]]){const gait=michiPawCycle(p,phase,5,4),step=(p.air?(x>0?7:-5):gait.step)+(x===22?p.strike*15:0),lift=p.air?9:(x===22?p.strike*18:0)+gait.lift;if(x===22&&p.groom>.15){shape('#46536d',()=>{c.moveTo(18,-23);c.quadraticCurveTo(31,-17,27,-20-p.groom*8);c.lineTo(22,-23-p.groom*8);c.quadraticCurveTo(23,-16,18,-23);});continue;}c.save();c.translate(0,-lift);shape('#46536d',()=>{c.moveTo(x-4,-20);c.lineTo(x+3,-18);c.lineTo(x+4+step,-3);c.lineTo(x-5+step,-3);});paw(a,p,x+step,0,8,'#8290a3',x===22&&p.strike>.1);oval(x+step+1,1,2.4,1.4,'#e7b9c6');c.restore();}
 drawMichiDetails(a,p,0);
 face(a,p,{x:13+p.strike*4,y:-46,size:1.09});if(p.groom){paw(a,p,24,-20-p.groom*9,6);if(p.groom>.4)oval(20,-26,2,3,'#df94a7');};scarf(a,9,-27,'#e36c82',19,p.run*2);

}
function glider(a,p){const{c,shape,stroke,oval}=a,air=p.state!=='dead',beat=p.still?0:Math.sin(p.t*(p.wing==='ascend'?.25:.09)),fold=(air?(p.wing==='ascend'?.83+beat*.17:p.wing==='descend'?.55:.9+beat*.08):.36)+(p.wingFlare||0);
 c.translate(0,p.still?-8:-8+Math.sin(p.t*.07)*2);c.rotate(p.still?0:Math.min(.1,Math.abs(p.vx)*.012));
 // A lean, long-legged bat-cat. The membranes articulate from the shoulders.
 for(const side of[-1,1]){const tip=side*(46+fold*25),lift=-69-fold*26;
  shape('#30344e',()=>{c.moveTo(side*10,-49);c.quadraticCurveTo(side*25,-76,tip,lift);c.quadraticCurveTo(tip-side*14,lift+7,tip-side*8,lift+24);c.quadraticCurveTo(side*48,-68,side*40,-41);c.quadraticCurveTo(side*31,-48,side*27,-34);c.quadraticCurveTo(side*22,-43,side*18,-29);c.closePath();});
  shape('#604768',()=>{c.moveTo(side*16,-51);c.lineTo(tip-side*10,lift+12);c.quadraticCurveTo(side*38,-58,side*29,-42);},null);
  for(let rib=0;rib<3;rib++)stroke('#b68391',.75,()=>{c.moveTo(side*12,-49);c.quadraticCurveTo(side*(26+rib*7),-57-rib*8,tip-side*(12+rib*9),lift+19+rib*9);});
  stroke('#ec8b78',1.4,()=>{c.moveTo(side*10,-49);c.lineTo(tip,lift);c.moveTo(side*10,-49);c.lineTo(side*40,-41);});
  for(let i=0;i<4;i++)oval(side*(23+i*7),-56-i*5,1,1.6,i%2?'#e9dfbc':'#8dd7c6');
  shape('#b8b9c7',()=>{c.moveTo(tip,lift);c.lineTo(tip+side*3,lift-7);c.lineTo(tip+side*4,lift+6);});
 }
 tail(a,p,{x:-7,y:-20,tipX:-34,tipY:-5,width:5,color:'#343f5c',accent:'#ff957a'});
 shape('#35435d',()=>{c.moveTo(-12,-54);c.lineTo(15,-52);c.lineTo(10,-24);c.lineTo(-8,-21);c.lineTo(-17,-35);});
 shape('#1e293c',()=>{c.moveTo(-13,-52);c.lineTo(0,-43);c.lineTo(12,-53);c.lineTo(18,-36);c.lineTo(5,-23);c.lineTo(-13,-28);});
 for(const side of[-1,1]){const step=p.run*side*5,x=side*10+step;c.save();if(air){c.translate(side*3,-13);c.rotate(side*-.32);}stroke('#172034',8,()=>{c.moveTo(side*6,-26);c.lineTo(side*13,-15);c.lineTo(x,-2);});stroke('#60758e',5,()=>{c.moveTo(side*6,-26);c.lineTo(side*13,-15);c.lineTo(x,-2);});paw(a,p,x,0,6);c.restore();stroke('#35435d',6,()=>{c.moveTo(side*11,-47);c.lineTo(side*(21+p.strike*16+(side>0?p.cast*7:0)),-27-p.cast*13-p.strike*5);});paw(a,p,side*(21+p.strike*16+(side>0?p.cast*7:0)),-27-p.cast*13-p.strike*5,5);}
 drawMichiDetails(a,p,1);
 face(a,p,{x:1,y:-62,size:.76,fur:'#3f4d68',kind:'glider'});scarf(a,0,-47,'#df595b',31,Math.sin(p.t*.07)*4);
}
function pantherHead(a,p){const{c,shape,stroke,oval}=a;
 c.save();c.translate(31+p.strike*6,-44-p.strike*2+p.breath*.4);c.scale(.88,.88);c.rotate(p.still?0:p.look*.035);
 // Rounded ears and a broad, smooth cranium: no kitten forelock or saber fangs.
 for(const [x,y]of[[-15,-17],[13,-18]]){oval(x,y,7,8,'#080a0c',x*.012);oval(x,y+1,3.5,4.5,'#23272a',x*.012);}
 shape('#090b0d',()=>{c.moveTo(-23,-6);c.bezierCurveTo(-22,-21,-7,-24,9,-19);c.bezierCurveTo(20,-17,20,-4,26,2);c.quadraticCurveTo(33,7,25,12);c.bezierCurveTo(18,15,13,22,0,18);c.quadraticCurveTo(-21,17,-23,-6);},'#343c42');
 shape('#151a1e',()=>{c.moveTo(-19,-9);c.quadraticCurveTo(-15,-19,-5,-18);c.quadraticCurveTo(-8,-8,-19,-1);},null);
 const blink=p.state==='dead'||(!p.still&&Math.sin(p.t*.043)>.994);for(const [x,y]of[[-9,-3],[9,-4]]){if(blink)stroke('#acac93',1.2,()=>{c.moveTo(x-5,y);c.quadraticCurveTo(x,y+2,x+5,y);});else{oval(x,y,6,4,'#ecd48b',-.12);oval(x+p.look*.9,y,1.5,4,'#131a2b');oval(x+1.5,y-1,1,1,'#fff5d2');stroke('#050608',2,()=>{c.moveTo(x-7,y-3);c.quadraticCurveTo(x,y-6+p.threat*2,x+6,y-3);});}}
 if(p.gesture>.2){oval(16,14,7,2+p.gesture*5,'#020304');oval(15,17,3,2,'#9a777c');}
 oval(17,9,10,6,'#151a1d');oval(23,7,5,3,'#030405');stroke('#4d5559',.8,()=>{c.moveTo(20,5);c.quadraticCurveTo(23,4,26,6);});stroke('#030405',1.3,()=>{c.moveTo(21,10);c.quadraticCurveTo(17,16,10,13);});
 for(let i=0;i<3;i++)stroke('#657078',.6,()=>{c.moveTo(21,11+i);c.lineTo(34,9+i*4);});
 stroke('#777277',.7,()=>{c.moveTo(14,-1);c.lineTo(12,6);});c.beginPath();c.arc(-20,-14,2.3,0,TAU);c.strokeStyle='#b7a88a';c.lineWidth=1;c.stroke();
 c.restore();
}
function panther(a,p){const{c,shape,stroke,oval}=a;c.translate(0,p.threat*2-p.gesture-(p.state==='run'?Math.abs(p.run)*2:0));
 // Low stalking melanistic cat; layered haunches and shoulders drive the gait.
 stroke('#30383c',8,()=>{c.moveTo(-27,-29);c.bezierCurveTo(-51,-18,-73,-26,-64-p.tailLag*.25,-48+p.tailLag*.7+(p.still?0:Math.sin(p.t*.045)*2));});stroke('#07090b',6,()=>{c.moveTo(-27,-29);c.bezierCurveTo(-51,-18,-73,-26,-64-p.tailLag*.25,-48+p.tailLag*.7+(p.still?0:Math.sin(p.t*.045)*2));});
 for(const [x,phase,front]of[[-25,0,false],[-11,Math.PI,false],[17,Math.PI,true],[30,0,true]]){const gait=michiPawCycle(p,phase+(front?.35:0),9,5),step=p.air?(front?8:-6):gait.step,reach=front?p.strike*18:0,lift=p.air?10:(front?p.strike*12:0)+gait.lift;
  c.save();c.translate(0,-lift);shape(front?'#101418':'#080b0e',()=>{c.moveTo(x-7,-34);c.bezierCurveTo(x+11,-36,x+10,-20,x+3,-14);c.quadraticCurveTo(x+1+step+reach,-7,x+7+step+reach,-4);c.quadraticCurveTo(x+7+step+reach,1,x-6+step+reach,-2);c.quadraticCurveTo(x-8+step+reach,-11,x-7,-18);c.quadraticCurveTo(x-12,-26,x-7,-34);},'#30383d');oval(x+step+reach,-1,8,3.8,'#0b0e11');for(let i=0;i<3;i++)stroke(p.strike>.2&&front?'#b9c4c7':'#394146',.7,()=>{c.moveTo(x+step+reach+2+i*2,-2);c.lineTo(x+step+reach+3+i*2+(p.strike>.2&&front?4:0),0);});c.restore();
 }
 shape('#080b0e',()=>{c.moveTo(-39,-37);c.bezierCurveTo(-38,-52,-21,-57,-3,-49);c.bezierCurveTo(5,-45,13,-50,23,-47);c.quadraticCurveTo(35,-43,32,-29);c.bezierCurveTo(19,-19,5,-23,-6,-23);c.quadraticCurveTo(-34,-21,-39,-37);},'#333d44');
 shape('#141a1e',()=>{c.moveTo(-30,-44);c.bezierCurveTo(-17,-53,-10,-44,1,-43);c.quadraticCurveTo(13,-47,25,-42);c.bezierCurveTo(8,-43,-1,-36,-10,-39);c.quadraticCurveTo(-22,-43,-30,-38);},null);
 stroke('#46525a',.8,()=>{c.moveTo(-31,-45);c.bezierCurveTo(-17,-52,-8,-44,0,-44);c.moveTo(18,-43);c.quadraticCurveTo(25,-39,25,-31);});
 // Ghost rosettes remain barely visible within a genuinely black coat.
 for(let i=0;i<4;i++){const x=-23+i*10;stroke('#040608',1.4,()=>{c.moveTo(x-3,-35);c.quadraticCurveTo(x-5,-42,x+2,-40);c.moveTo(x+4,-38);c.lineTo(x+3,-34);});}
 pantherHead(a,p);scarf(a,19,-32,'#77313c',16,p.run*2);
}
function lynx(a,p){const{c,shape,stroke,oval}=a;
 // Upright digitigrade spectre, long ear tufts and asymmetric crescent gauntlets.
 for(let i=0;i<2;i++)tail(a,p,{x:-9,y:-29,tipX:-48-i*13,tipY:-65+i*28,color:'#254455',accent:'#85ebd7',width:5});
 for(const side of[-1,1]){const gait=michiPawCycle(p,side<0?Math.PI:0,5,4),x=side*(12+p.strike*4)+gait.step,lift=p.air?(side>0?17:10):gait.lift;c.save();c.translate(0,-lift);shape('#30475a',()=>{c.moveTo(side*7,-34);c.lineTo(side*19,-24);c.lineTo(side*10,-13);c.lineTo(x+side*6,-3);c.lineTo(x-side*5,-3);c.lineTo(side*3,-20);});paw(a,p,x,0,7,'#86b1b9');c.restore();}
 shape('#302b4b',()=>{c.moveTo(-17,-72);c.lineTo(21,-69);c.lineTo(14,-44);c.lineTo(4,-30);c.lineTo(-13,-38);c.lineTo(-22,-58);});
 shape('#628f9b',()=>{c.moveTo(-16,-66);c.lineTo(-2,-52);c.lineTo(16,-67);c.lineTo(9,-44);c.lineTo(-2,-38);c.lineTo(-14,-48);});
 drawMichiDetails(a,p,3);
 for(const side of[-1,1]){const reach=side>0?p.strike*24+p.curious*6:0,x=side*(28+reach),y=-39-p.cast*12-p.gesture*side*10-p.strike*side*9+(side<0?p.offhand:0);stroke('#172838',10,()=>{c.moveTo(side*16,-65);c.lineTo(side*23,-52);c.lineTo(x,y);});stroke('#42687b',7,()=>{c.moveTo(side*16,-65);c.lineTo(side*23,-52);c.lineTo(x,y);});
  c.save();c.translate(x,y);c.rotate((p.state==='cast'?p.cast*.6:0)*side+p.strike*side*.45);c.translate(-x,-y);if(side>0){const tx=x+12+p.cast*10,ty=y-39-p.strike*6;stroke('#1b2639',5,()=>{c.moveTo(x-3,y+9);c.lineTo(tx,ty);});stroke('#ba8fce',2.4,()=>{c.moveTo(x-3,y+9);c.lineTo(tx,ty);});shape('#eeefba',()=>{for(let i=0;i<10;i++){const q=-Math.PI/2+i*Math.PI/5,r=i%2?3.5:8;if(i===0)c.moveTo(tx+Math.cos(q)*r,ty+Math.sin(q)*r);else c.lineTo(tx+Math.cos(q)*r,ty+Math.sin(q)*r);}},'#685985');const theta=(p.state==='cast'?p.cast*.6:0)+p.strike*.45;p.castOrigin={x:x+Math.cos(theta)*(tx-x)-Math.sin(theta)*(ty-y),y:y+Math.sin(theta)*(tx-x)+Math.cos(theta)*(ty-y)};}else drawMichiGrimoire(a,p,x,y);paw(a,p,x,y+3,6,'#65969f',true);c.restore();
 }
 face(a,p,{x:0,y:-83,size:.8,fur:'#3c6073',kind:'lynx',accent:'#8ae8dc'});scarf(a,-1,-65,'#b95e74',54,Math.sin(p.t*.05)*5);
 c.save();c.translate(p.look,-120+p.breath);c.rotate(p.still?0:p.ear*.3-p.turn*.08+p.land*.06);c.scale(.6,.6);c.translate(0,112);shape('#302b51',()=>{c.moveTo(-24,-112);c.quadraticCurveTo(-13,-142,-10,-166);c.quadraticCurveTo(0,-177,25,-153);c.lineTo(9,-156);c.quadraticCurveTo(5,-138,24,-112);},'#111e31');shape('#69598c',()=>{c.moveTo(-19,-120);c.lineTo(-15,-130);c.quadraticCurveTo(0,-123,17,-128);c.lineTo(21,-118);},null);shape('#4d3b70',()=>{c.moveTo(-18,-119);c.quadraticCurveTo(-9,-145,-10,-163);c.lineTo(-5,-161);c.quadraticCurveTo(-7,-137,2,-119);},null);oval(0,-112,36,6,'#43365f',-.04);stroke('#b7a2d5',1.4,()=>{c.moveTo(-32,-111);c.quadraticCurveTo(0,-104,32,-113);});oval(-4,-141,5,6,'#ece7b6');oval(-1,-144,4.5,5.5,'#302b51');c.restore();
}
function ghost(a,p){const{c,shape,stroke,oval}=a;
 // Compact mischievous spirit: a big expressive head over a tiny curled soul.
 const float=p.still?0:Math.sin(p.t*.046)*3,reach=p.curious*10+p.cast*12+p.strike*20;
 c.save();c.globalAlpha=(Number.isFinite(c.globalAlpha)?c.globalAlpha:1)*p.ghostFade;c.translate(-p.vx*.28,-17+float);c.scale(1+Math.min(.05,Math.abs(p.vx)*.005),1-Math.min(.04,Math.abs(p.vx)*.004));c.rotate(p.still?0:Math.max(-.09,Math.min(.09,-p.vx*.018))+p.gesture*.06);
 for(let i=0;i<9;i++){const side=i<4?-1:1,k=i%5,w=p.still?0:Math.sin(p.t*.055+i)*4+p.tailLag*.25;
  c.save();c.globalAlpha=.2+k*.06;stroke(i%2?'#88fff0':'#c8a6ff',3.5-k*.3,()=>{c.moveTo(side*10,-34+k*2);c.bezierCurveTo(side*(28+k*3),-48+k*5,side*(33+k*3),-18+k*3+w,side*(17+k*5),-14-k*3+w);});c.restore();
 }
 c.save();c.globalAlpha=.9;
 shape('#a9e6e0',()=>{c.moveTo(-18,-60);c.quadraticCurveTo(0,-71,18,-60);c.bezierCurveTo(25,-45,10,-34,19,-25);c.quadraticCurveTo(23,-21,29,-28);c.bezierCurveTo(31,-7,9,-7,3,-15);c.quadraticCurveTo(-1,-6,-2,-8);c.quadraticCurveTo(-4,-16,-8,-18);c.quadraticCurveTo(-23,-14,-21,-30);c.bezierCurveTo(-27,-41,-19,-48,-18,-60);},'#3a6680');
 shape('#e2ffdf',()=>{c.moveTo(-7,-53);c.quadraticCurveTo(11,-58,10,-44);c.quadraticCurveTo(3,-31,13,-21);c.quadraticCurveTo(-2,-28,-7,-21);c.quadraticCurveTo(-1,-35,-10,-42);},null);c.restore();
 // Detached paws wave, reach toward discoveries and wind up the real cast.
 for(const side of[-1,1]){const x=side*(27+(side>0?reach:0)),y=-37+(side>0?p.lookY*6:0)+(p.still?0:Math.sin(p.t*.05+side)*3)-p.gesture*side*13;
  c.save();c.translate(x,y);c.rotate(side*.2+p.strike*side*.7);shape('#caffec',()=>{c.moveTo(-7,-4);c.quadraticCurveTo(-11,-13,-5,-10);c.lineTo(-1,-5);c.quadraticCurveTo(1,-15,4,-10);c.lineTo(5,-4);c.quadraticCurveTo(13,-8,10,0);c.quadraticCurveTo(8,10,0,8);c.quadraticCurveTo(-12,6,-7,-4);},'#527c90');oval(1,1,3.5,2.5,'#81c5c3');for(const x of[-4,1,6])oval(x,-3,1.1,1.2,'#a4e6dc');c.restore();
 }
 drawMichiDetails(a,p,4);
 face(a,p,{x:p.strike*5,y:-73,size:1.1,fur:'#c0f4e7',kind:'ghost'});scarf(a,0,-52,'#c65b9a',30,p.still?0:Math.sin(p.t*.07)*6);
 shape('#d2e4bf',()=>{c.moveTo(0,-51);c.lineTo(5,-45);c.lineTo(0,-38);c.lineTo(-5,-45);},'#466b7a');oval(0,-45,1.7,3,'#f3ffd3');
 // A cheeky fang and an occasional tongue, staying below the expressive muzzle.
 shape('#f5ffe0',()=>{c.moveTo(10,-57);c.lineTo(14,-58);c.lineTo(12,-52);},null);
 if(p.gesture>.55){oval(7,-55,2.6,4,'#ed96c5');stroke('#466c80',1.4,()=>{c.moveTo(-18,-77);c.lineTo(-7,-74);});}
 if(p.friend>.1){c.save();c.globalAlpha=p.friend*.6;stroke('#e3f8db',1.1,()=>{c.moveTo(22,-70);c.quadraticCurveTo(30,-78,35,-71);});c.restore();}
 c.restore();
}
function mouse(a,p){
 const{c,shape,stroke,oval}=a;const run=p.run,hop=p.air?-5:Math.abs(run)*2;
 c.save();c.translate(0,-hop);c.rotate(p.air?-.08:0);
 stroke('#34333b',3,()=>{c.moveTo(-20,-13);c.bezierCurveTo(-49,-9,-48,-38,-31,-34);c.bezierCurveTo(-18,-30,-43,-20,-46,-25);});
 oval(-5,-18,24,16,'#080a0e');oval(-10,-22,16,9,'#15191e');
 for(let i=0;i<24;i++)stroke(i%3?'#1d2228':'#303238',.7,()=>{const x=-24+(i%6)*5,y=-24+Math.floor(i/6)*5;c.moveTo(x,y);c.quadraticCurveTo(x+2,y-2,x+4,y-1);});
 for(const side of[-1,1]){const x=side*14+run*(side<0?6:-6);oval(x,-3,6,3,'#24252c');stroke('#090b10',4,()=>{c.moveTo(side*12,-15);c.lineTo(x,-5);});}
 c.save();c.translate(15+p.look,-25+p.breath);c.rotate(p.ear*.3+p.lean*.25);
 for(const side of[-1,1]){oval(side*12,-14,12,13,'#0b0d12');oval(side*12,-14,8,9,'#55414a');oval(side*12-2,-17,3,4,'#73606a');}
 shape('#080a0d',()=>{c.moveTo(-14,-4);c.bezierCurveTo(-21,-25,14,-28,20,-7);c.lineTo(30,5);c.quadraticCurveTo(13,20,-7,10);});
 for(const side of[-1,1]){oval(side*8+4,-3,5,6,'#ecd48b');oval(side*8+5+p.look,-3,1.5,4,'#07090d');oval(side*8+3,-5,1.2,1.6,'#fff7dc');}
 oval(28,5,3,2.5,'#b37e87');for(const side of[-1,1])for(let i=0;i<3;i++)stroke('#88908c',.8,()=>{c.moveTo(20,8);c.lineTo(22+side*(15+i*3),5+i*4);});
 if(p.gesture>.4)oval(22,12,2,3,'#d499a5');c.restore();
 scarf(a,9,-17,'#a24b52',12,run*3);stroke('#d9b76d',1.2,()=>c.arc(27,-44,2.5,0,TAU));c.restore();
}
const RIGS=[kitten,glider,mouse,lynx,ghost];
export function drawRebelCat(c,pose={}){
 const form=Math.max(0,Math.min(4,Math.round(number(Number(pose.form))))),state=pose.state||'idle',still=!!pose.reduceMotion||state==='dead';
 const p={state,still,t:still?0:number(pose.t),phase:still?0:number(pose.phase),atk:still?.5:clamp(pose.atk),cast:still?.5:clamp(pose.cast),look:Math.max(-1,Math.min(1,number(pose.look?.x))),power:Math.max(0,Math.min(5,Math.trunc(number(pose.michiPowerIndex,number(pose.castSlot)))))};
 Object.assign(p,michiActing(pose,form),michiChoreography(pose,form));p.look=p.lookX;p.inspect=0;p.groom=0;
 const welcome=state==='idle'&&!still?pose.michiWelcome||{}:{};p.inspect=Math.max(clamp(welcome.inspect),p.curious*.5);p.groom=Math.max(clamp(welcome.groom),form===0?p.gesture:0);p.look=Math.max(-1,Math.min(1,p.look-clamp(welcome.sideeye)*.6));
 p.run=state==='run'?Math.sin(p.phase*.95):0;p.air=['jump','fall','glide'].includes(state);p.strike=p.extension;const a=tools(c);
 c.save();c.lineCap='round';c.lineJoin='round';
 const bob=state==='jump'?-5:state==='fall'?3:state==='glide'?-4:state==='hurt'?5:state==='victory'?-7:Math.sin(p.t*.07+form)*.8;
 c.translate(p.reach,bob);c.scale(1+p.widen,1-p.compress);c.rotate(p.lean);c.rotate(state==='dead'?.7:state==='hurt'?-.12:state==='wall'?-.17:p.run*.025);c.scale(1,state==='jump'?1.04:state==='fall'?.95:1);
 if(form===2)c.scale(.62,.62);
 if(form===4)c.scale(.55,.55);
 RIGS[form](a,p);drawMichiNeon(a,p,form);
 if(state==='cast'){const x=p.castOrigin?.x??(form===2?45:form===4?42:28),y=p.castOrigin?.y??(form===0?-26:form===2?-34:-40),color=['#f49a82','#f1b998','#aebfc4','#d5b8ff','#c4ffee'][form];
  if(p.power===0){a.oval(x,y,5,5,color);a.stroke(color,1.3,()=>{c.moveTo(x-3,y);c.bezierCurveTo(x-18,y+15,x+9,y+21,x+14,y+5);});}
  else if(p.power===1){for(let i=0;i<3;i++)a.stroke(color,1.4,()=>{c.arc(x-10,y,9+i*7+p.cast*4,-.9,.9);});}
  else if(p.power===2){for(let i=0;i<5;i++)a.stroke(color,1.5,()=>{c.moveTo(x-6,y+8);c.quadraticCurveTo(x+18,y-24+i*8,x+29,y-17+i*9);});}
  else for(let i=0;i<3;i++)a.stroke(color,1.7,()=>{c.moveTo(x+i*7,y+5);c.quadraticCurveTo(x+i*7+7+p.cast*5,y-2-p.power,x+i*7+3,y-12-p.power);});
 }
 c.restore();
}

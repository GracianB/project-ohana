// Five anatomical metamorphoses. Pose-only art: never changes simulation or hitboxes.
const TAU=Math.PI*2;
const number=(v,d=0)=>Number.isFinite(v)?v:d;
const clamp=v=>Math.max(0,Math.min(1,number(v)));
export const REBEL_SILHOUETTES=Object.freeze(['kitten-quadruped','winged-glider','sabre-panther','spectral-lynx','nine-tail-sovereign']);
// Art-space envelopes include lifted paws, ear tufts, crown and unfolded wings.
export const REBEL_ART_HEIGHT=Object.freeze([86,112,98,140,157]);
function tools(c){
 const stroke=(color,w,fn)=>{c.beginPath();fn();c.strokeStyle=color;c.lineWidth=w;c.stroke();};
 const shape=(color,fn,edge='#111827')=>{c.beginPath();fn();c.closePath();c.fillStyle=color;c.fill();if(edge){c.strokeStyle=edge;c.lineWidth=1.7;c.stroke();}};
 const oval=(x,y,rx,ry,color,rotation=0)=>{c.beginPath();c.ellipse(x,y,rx,ry,rotation,0,TAU);c.fillStyle=color;c.fill();};
 return{c,stroke,shape,oval};
}
function face(a,p,{x=0,y=-50,size=1,fur='#45516b',kind='kitten',accent='#ff725f'}={}){
 const{c,shape,stroke,oval}=a;c.save();c.translate(x+p.look*1.5+(p.inspect||0)*2,y+(p.groom||0)*3);c.rotate(p.state==='hurt'?.13:p.state==='victory'?-.1:Math.sin(p.t*.032)*.025+(p.inspect||0)*.06-(p.groom||0)*.08);c.scale(size,size);
 const lynx=kind==='lynx',panther=kind==='panther',royal=kind==='royal';
 // Ear notch, amber slit eyes, cheek scar and piercing identify the same cat.
 const ear=lynx?-40:panther?-21:kind==='glider'?-36:-30;
 shape(fur,()=>{c.moveTo(-22,-7);c.lineTo(-24,ear);c.lineTo(-17,ear+5);c.lineTo(-13,ear-1);c.lineTo(-6,-18);c.quadraticCurveTo(7,-23,15,-16);c.lineTo(27,ear-1);c.lineTo(25,-3);c.quadraticCurveTo(panther?35:28,13,13,18);c.quadraticCurveTo(-4,23,-23,9);c.lineTo(-30,3);c.lineTo(-22,0);});
 for(const side of[-1,1])shape('#b5728a',()=>{c.moveTo(side*22,ear+7);c.lineTo(side*14,-12);c.lineTo(side*21,-10);});
 if(lynx)for(const side of[-1,1]){stroke('#97e5df',2,()=>{c.moveTo(side*24,-34);c.lineTo(side*27,-48);c.moveTo(side*23,-35);c.lineTo(side*19,-45);});shape('#8ab4c1',()=>{c.moveTo(side*23,1);c.lineTo(side*35,12);c.lineTo(side*20,10);});}
 shape(royal?'#e3d0a2':panther?'#555077':'#7d8b9e',()=>{c.moveTo(-17,-17);c.lineTo(-6,panther?-22:-29);c.lineTo(-5,-19);c.lineTo(7,panther?-23:-28);c.lineTo(4,-19);c.lineTo(18,-20);c.lineTo(5,-9);c.lineTo(-5,-12);c.lineTo(-9,-5);});
 if(lynx||royal)shape(royal?'#524460':'#283f54',()=>{c.moveTo(-21,-7);c.lineTo(-8,-14);c.lineTo(0,-5);c.lineTo(9,-13);c.lineTo(23,-7);c.lineTo(17,7);c.lineTo(0,1);c.lineTo(-18,7);});
 const blink=p.state==='dead'||(!p.still&&Math.sin(p.t*.043)>.994);
 for(const side of[-1,1]){const ex=side*11,ey=-1+side;
  if(blink)stroke('#f4d28e',2,()=>{c.moveTo(ex-5,ey);c.lineTo(ex+5,ey+side);});
  else{oval(ex,ey,kind==='kitten'?6.5:7,kind==='kitten'?5:4.6,'#ecd48b',side*.1);oval(ex+p.look,ey,1.5,4,'#131a2b');oval(ex+2,ey-1.6,.9,.9,'#fff5d2');stroke('#101728',2,()=>{c.moveTo(ex-7,ey-5-side);c.lineTo(ex+6,ey-4+side);});}
 }
 oval(2,9,panther?13:9,6,royal?'#c6bda8':'#9ba6b8');shape('#1c2435',()=>{c.moveTo(-2,5);c.lineTo(5,5);c.lineTo(1,9);});stroke('#172031',1.2,()=>{c.moveTo(1,10);c.quadraticCurveTo(7,15,13,10);});
 if(panther||royal)for(const side of[-1,1])shape('#fff0d5',()=>{c.moveTo(side*9,12);c.lineTo(side*14,12);c.lineTo(side*11,panther?25:21);});
 for(const side of[-1,1])for(let k=0;k<2;k++)stroke('#b0b9cd',.9,()=>{c.moveTo(side*17,8+k*4);c.lineTo(side*(30+k*2),5+k*7);});
 stroke('#df999d',1.4,()=>{c.moveTo(18,-8);c.lineTo(14,5);});c.beginPath();c.arc(-23,-17,3,0,TAU);c.strokeStyle='#e9d8b2';c.lineWidth=1.7;c.stroke();
 if(royal)shape('#efcc83',()=>{c.moveTo(-17,-24);c.lineTo(-18,-38);c.lineTo(-7,-31);c.lineTo(1,-47);c.lineTo(9,-32);c.lineTo(22,-39);c.lineTo(18,-24);c.lineTo(0,-19);});
 c.restore();
}
function scarf(a,x,y,color='#d54d54',length=21,sway=0){const{c,shape,stroke}=a;shape(color,()=>{c.moveTo(x-17,y-6);c.quadraticCurveTo(x,y+4,x+18,y-5);c.lineTo(x+6,y+9);c.lineTo(x-4,y+15);c.lineTo(x-10,y+5);c.lineTo(x-length,y+9+sway);});stroke('#ffab81',1,()=>{c.moveTo(x-11,y-3);c.lineTo(x+1,y+3);});}
function tail(a,p,{x=-15,y=-20,tipX=-48,tipY=-50,color='#45516b',accent='#ff725f',width=8}={}){const{c,stroke}=a,sw=Math.sin(p.t*.06)*3;stroke('#101727',width+3,()=>{c.moveTo(x,y);c.bezierCurveTo(tipX-15,y+6,tipX-12,tipY+10,tipX,tipY+sw);});stroke(color,width,()=>{c.moveTo(x,y);c.bezierCurveTo(tipX-15,y+6,tipX-12,tipY+10,tipX,tipY+sw);});stroke(accent,Math.max(2,width*.4),()=>{c.moveTo(tipX-8,tipY+8+sw);c.quadraticCurveTo(tipX-7,tipY,tipX,tipY+sw);});}
function paw(a,p,x,y,width=7,color='#66768d',long=false){const{c,oval,stroke}=a;oval(x,y,width,4.5,color);for(let k=0;k<3;k++)stroke('#d6dedf',long?1.5:.8,()=>{c.moveTo(x+width-2,y-2+k*2);c.lineTo(x+width+(long?10:1),y-4+k*3);});}
function kitten(a,p){const{c,shape,oval}=a;
 tail(a,p,{tipX:-39,tipY:-42,width:7});
 // Small four-legged rascal: big head, compact rump, oversized front paws.
 oval(-12,-21,23,15,'#46536d',-.12);shape('#253244',()=>{c.moveTo(-29,-25);c.quadraticCurveTo(-10,-36,11,-22);c.lineTo(4,-11);c.lineTo(-23,-12);});
 for(const [x,phase]of[[-25,0],[-10,Math.PI],[7,Math.PI],[22,0]]){const step=p.run?Math.sin(p.phase*2+phase)*4:0;shape('#46536d',()=>{c.moveTo(x-4,-20);c.lineTo(x+3,-18);c.lineTo(x+4+step,-3);c.lineTo(x-5+step,-3);});paw(a,p,x+step,0,7);}
 face(a,p,{x:13,y:-43,size:.9});if(p.groom)paw(a,p,24,-20-p.groom*9,6);scarf(a,9,-26,'#dd5457',23,p.run*2);
 if(p.state==='attack')paw(a,p,28+p.atk*14,-17,8,'#718197',true);
}
function glider(a,p){const{c,shape,stroke,oval}=a,fold=p.state==='glide'?1:p.state==='jump'?.85:.55+Math.sin(p.t*.1)*.08;
 // A lean, long-legged bat-cat. The membranes articulate from the shoulders.
 for(const side of[-1,1]){const tip=side*(46+fold*25),lift=-69-fold*26;
  shape('#30344e',()=>{c.moveTo(side*10,-49);c.quadraticCurveTo(side*25,-76,tip,lift);c.lineTo(tip-side*8,lift+24);c.quadraticCurveTo(side*48,-69,side*40,-41);c.quadraticCurveTo(side*24,-49,side*18,-29);c.closePath();});
  stroke('#ec8b78',1.4,()=>{c.moveTo(side*10,-49);c.lineTo(tip,lift);c.moveTo(side*10,-49);c.lineTo(side*40,-41);});
  shape('#b8b9c7',()=>{c.moveTo(tip,lift);c.lineTo(tip+side*3,lift-7);c.lineTo(tip+side*4,lift+6);});
 }
 tail(a,p,{x:-7,y:-20,tipX:-34,tipY:-5,width:5,color:'#343f5c',accent:'#ff957a'});
 shape('#35435d',()=>{c.moveTo(-12,-54);c.lineTo(15,-52);c.lineTo(10,-24);c.lineTo(-8,-21);c.lineTo(-17,-35);});
 shape('#1e293c',()=>{c.moveTo(-13,-52);c.lineTo(0,-43);c.lineTo(12,-53);c.lineTo(18,-36);c.lineTo(5,-23);c.lineTo(-13,-28);});
 for(const side of[-1,1]){const step=p.run*side*5,x=side*10+step;stroke('#172034',8,()=>{c.moveTo(side*6,-26);c.lineTo(side*13,-15);c.lineTo(x,-2);});stroke('#60758e',5,()=>{c.moveTo(side*6,-26);c.lineTo(side*13,-15);c.lineTo(x,-2);});paw(a,p,x,0,6);stroke('#35435d',6,()=>{c.moveTo(side*11,-47);c.lineTo(side*(21+p.atk*5),-27-p.cast*13);});paw(a,p,side*(21+p.atk*5),-27-p.cast*13,5);}
 face(a,p,{x:1,y:-62,size:.76,fur:'#3f4d68',kind:'glider'});scarf(a,0,-47,'#df595b',31,Math.sin(p.t*.07)*4);
}
function panther(a,p){const{c,shape,stroke,oval}=a;
 // Low horizontal predator; three heavy tails counterbalance broad shoulders.
 for(let i=0;i<3;i++)tail(a,p,{x:-24,y:-29,tipX:-57-i*5,tipY:-29-i*16,color:i%2?'#645781':'#3f3c60',accent:'#be9ee9',width:6});
 shape('#38344f',()=>{c.moveTo(-36,-42);c.quadraticCurveTo(-15,-66,15,-48);c.quadraticCurveTo(34,-47,32,-26);c.lineTo(-29,-18);c.quadraticCurveTo(-42,-26,-36,-42);});
 shape('#6b5a88',()=>{c.moveTo(-31,-43);c.lineTo(-18,-54);c.lineTo(-11,-46);c.lineTo(2,-52);c.lineTo(15,-41);c.lineTo(-5,-36);c.lineTo(-23,-31);});
 for(const [x,phase,front]of[[-28,0,false],[-12,Math.PI,false],[19,Math.PI,true],[34,0,true]]){const step=p.run?Math.sin(p.phase*2+phase)*7:0,reach=front&&p.state==='attack'?p.atk*18:0;
  shape(front?'#51466a':'#3a3652',()=>{c.moveTo(x-6,-32);c.quadraticCurveTo(x+9,-30,x+3,-17);c.lineTo(x+8+step+reach,-4);c.lineTo(x-7+step+reach,-3);c.lineTo(x-10,-17);});paw(a,p,x+step+reach,0,front?10:7,'#8b7ca0',front);
 }
 face(a,p,{x:27,y:-57,size:.85,fur:'#44405e',kind:'panther'});scarf(a,22,-38,'#c35a68',29,p.run*3);
 for(let i=0;i<3;i++)stroke('#b39ae0',1.8,()=>{c.moveTo(-20+i*8,-37);c.lineTo(-26+i*8,-24);});
}
function lynx(a,p){const{c,shape,stroke,oval}=a;
 // Upright digitigrade spectre, long ear tufts and asymmetric crescent gauntlets.
 for(let i=0;i<2;i++)tail(a,p,{x:-9,y:-29,tipX:-48-i*13,tipY:-65+i*28,color:'#254455',accent:'#85ebd7',width:5});
 for(const side of[-1,1]){const x=side*(12+p.run*4);shape('#30475a',()=>{c.moveTo(side*7,-34);c.lineTo(side*19,-24);c.lineTo(side*10,-13);c.lineTo(x+side*6,-3);c.lineTo(x-side*5,-3);c.lineTo(side*3,-20);});paw(a,p,x,0,7,'#86b1b9');}
 shape('#293c50',()=>{c.moveTo(-17,-72);c.lineTo(21,-69);c.lineTo(14,-44);c.lineTo(4,-30);c.lineTo(-13,-38);c.lineTo(-22,-58);});
 shape('#83bbb9',()=>{c.moveTo(-16,-66);c.lineTo(-2,-52);c.lineTo(16,-67);c.lineTo(9,-44);c.lineTo(-2,-38);c.lineTo(-14,-48);});
 for(const side of[-1,1]){const reach=side>0?p.atk*17:0,x=side*(28+reach),y=-39-p.cast*12;stroke('#172838',10,()=>{c.moveTo(side*16,-65);c.lineTo(side*23,-52);c.lineTo(x,y);});stroke('#42687b',7,()=>{c.moveTo(side*16,-65);c.lineTo(side*23,-52);c.lineTo(x,y);});
  shape('#b7eee0',()=>{c.moveTo(x-7,y-14);c.quadraticCurveTo(x+21,y-27,x+13,y+12);c.quadraticCurveTo(x+11,y-8,x-7,y-3);});paw(a,p,x,y+3,6,'#65969f',true);
 }
 face(a,p,{x:0,y:-83,size:.8,fur:'#3c6073',kind:'lynx',accent:'#8ae8dc'});scarf(a,-1,-65,'#b95e74',54,Math.sin(p.t*.05)*5);
}
function sovereign(a,p){const{c,shape,stroke,oval}=a;
 // Exactly nine broad, individually rooted tails form the final crown silhouette.
 for(let i=0;i<9;i++){const angle=-Math.PI+(i+1)*Math.PI/10,x=Math.cos(angle)*77,y=-43-Math.sin((i+1)*Math.PI/10)*81,wave=Math.sin(p.t*.045+i)*2;
  shape(i%2?'#635576':'#4c4669',()=>{c.moveTo(-9,-35);c.bezierCurveTo(x*.7,-60,x-13,y+10,x,y-10+wave);c.bezierCurveTo(x+16,y+5,x*.9,-23,0,-23);});stroke('#e7c98e',1.5,()=>{c.moveTo(x-4,y+7);c.lineTo(x,y-5+wave);c.lineTo(x+5,y+9);});
 }
 for(const side of[-1,1]){const flap=p.state==='glide'?-7:Math.sin(p.t*.08)*3;shape('#555b7c',()=>{c.moveTo(side*13,-63);c.quadraticCurveTo(side*35,-95+flap,side*73,-109+flap);c.lineTo(side*55,-81);c.lineTo(side*65,-88);c.lineTo(side*43,-65);c.lineTo(side*48,-67);c.lineTo(side*26,-48);});for(let k=0;k<3;k++)stroke('#d6d0d7',3-k*.5,()=>{c.moveTo(side*(20+k*3),-64+k*4);c.lineTo(side*(64-k*13),-100+k*14+flap);});stroke('#f2d5a0',1.5,()=>{c.moveTo(side*15,-63);c.quadraticCurveTo(side*38,-98+flap,side*73,-109+flap);});}
 shape('#33354d',()=>{c.moveTo(-32,-48);c.quadraticCurveTo(-23,-76,9,-63);c.quadraticCurveTo(28,-66,30,-33);c.lineTo(-29,-22);c.closePath();});
 shape('#5c5578',()=>{c.moveTo(-25,-47);c.quadraticCurveTo(-10,-65,15,-55);c.lineTo(21,-31);c.lineTo(4,-23);c.lineTo(-15,-29);});
 for(const [x,phase]of[[-24,0],[-9,Math.PI],[17,Math.PI],[33,0]]){const step=p.run?Math.sin(p.phase*2+phase)*5:0,front=x>0;shape(front?'#53526e':'#343850',()=>{c.moveTo(x-7,-35);c.quadraticCurveTo(x+13,-37,x+7,-22);c.lineTo(x+(front?3:-6),-13);c.quadraticCurveTo(x+4+step,-9,x+8+step,-4);c.lineTo(x-8+step,-3);c.lineTo(x-10,-17);c.closePath();});stroke('#8f89a5',1,()=>{c.moveTo(x+3,-28);c.lineTo(x-1,-16);});paw(a,p,x+step,0,9,'#b2a7b0',true);}
 // A collar of angular fur joins the head to the chest, not a floating aura.
 shape('#b9b5c8',()=>{c.moveTo(1,-93);c.lineTo(27,-90);c.lineTo(43,-68);c.lineTo(32,-69);c.lineTo(39,-50);c.lineTo(25,-54);c.lineTo(19,-36);c.lineTo(10,-48);c.lineTo(-1,-43);c.lineTo(-8,-61);c.lineTo(-14,-67);c.lineTo(-3,-75);});
 face(a,p,{x:16,y:-87,size:.98,fur:'#4b4c67',kind:'royal'});scarf(a,16,-64,'#cd6572',34,Math.sin(p.t*.04)*2);
 shape('#f0cf88',()=>{c.moveTo(15,-61);c.lineTo(23,-53);c.lineTo(16,-41);c.lineTo(9,-53);});
 if(p.state==='attack')paw(a,p,46+p.atk*17,-19,11,'#ddd1ba',true);
}
const RIGS=[kitten,glider,panther,lynx,sovereign];
export function drawRebelCat(c,pose={}){
 const form=Math.max(0,Math.min(4,Math.round(number(Number(pose.form))))),state=pose.state||'idle',still=!!pose.reduceMotion||state==='dead';
 const p={state,still,t:still?0:number(pose.t),phase:still?0:number(pose.phase),atk:still?.5:clamp(pose.atk),cast:still?.5:clamp(pose.cast),look:Math.max(-1,Math.min(1,number(pose.look?.x))),power:Math.max(0,Math.min(5,Math.trunc(number(pose.michiPowerIndex,number(pose.castSlot)))))};
 const welcome=state==='idle'&&!still?pose.michiWelcome||{}:{};p.inspect=clamp(welcome.inspect);p.groom=clamp(welcome.groom);p.look=Math.max(-1,Math.min(1,p.look-clamp(welcome.sideeye)*.6));
 p.run=state==='run'?Math.sin(p.phase*2):0;const a=tools(c);
 c.save();c.lineCap='round';c.lineJoin='round';
 const bob=state==='jump'?-5:state==='fall'?3:state==='glide'?-4:state==='hurt'?5:state==='victory'?-7:Math.sin(p.t*.07+form)*.8;
 c.translate(state==='attack'?p.atk*(form===2?14:7):0,bob);c.rotate(state==='dead'?.7:state==='hurt'?-.12:state==='wall'?-.17:p.run*.025);c.scale(1,state==='jump'?1.04:state==='fall'?.95:1);
 RIGS[form](a,p);
 if(state==='cast'){const x=form===2?45:form===4?42:28,y=form===0?-26:form===2?-34:form===3?-49:-40;for(let i=0;i<3;i++){const dx=x+i*7; a.stroke(['#f49a82','#f1b998','#b49aea','#93e8dc','#f4d398'][form],1.5,()=>{c.moveTo(dx,y+5);c.quadraticCurveTo(dx+7+p.cast*5,y-2-p.power,dx+3,y-12-p.power);});}}
 c.restore();
}

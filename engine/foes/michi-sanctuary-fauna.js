// Five distinct silhouettes. Uses the campaign role's real windup/active state.
const TAU=Math.PI*2;
export function drawSanctuaryFauna(c,e,t=0,reduced=false){
 const kind=e.roomPersona?.michiSpecies;if(!kind)return false;const T=reduced?0:t,wind=(e._campaign?.wind||0)>0,active=(e._campaign?.active||0)>0;
 const oval=(x,y,rx,ry,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();};
 const eye=(x,y)=>{oval(x,y,2,3,wind?'#f9c392':'#dfedd5');oval(x+.5,y,1,2,'#263344');};
 c.save();c.scale((e.vx||e._campaign?.aim||1)<0?-1:1,1);if(e.flash>0)c.globalAlpha*=.65;
 const shell=wind?'#a87980':'#4f7d7a';
 if(kind==='weaver'){for(const side of[-1,1])for(let i=0;i<3;i++){c.strokeStyle='#8ca394';c.lineWidth=3;c.beginPath();c.moveTo(side*8,-4+i*4);c.quadraticCurveTo(side*(20+i*2),-12+i*8+Math.sin(T*.13+i)*2,side*26,13+i);c.stroke();}oval(0,-2,14,15,shell);oval(0,9,10,8,'#304b61');eye(-4,7);eye(4,7);}
 else if(kind==='moth'){for(const side of[-1,1]){c.save();c.rotate(side*Math.sin(T*.13)*.08);oval(side*17,-7,17,24,'#9982a6');oval(side*20,10,12,15,'#c4a5b0');oval(side*18,-8,5,8,'#e5d5b0');c.restore();}oval(0,0,8,20,'#394b60');eye(-3,-7);eye(3,-7);}
 else if(kind==='snail'){oval(-6,-2,20,20,'#7c8795');oval(-6,-2,13,13,'#b6b5ad');oval(-6,-2,7,8,'#667b84');oval(5,16,26,8,shell);oval(21,6,10,14,'#7ca396');eye(17,-4);eye(25,-4);}
 else if(kind==='seed'){for(let i=0;i<4;i++){const a=i*TAU/4+Math.sin(T*.04)*.1;c.save();c.rotate(a);oval(0,-18,8,19,'#96ada0');c.restore();}oval(0,0,15,17,'#b7a78c');oval(0,0,9,10,'#435d69');eye(-4,-2);eye(4,-2);}
 else{oval(0,-7,23,18,'#a8c7cf');for(let i=-2;i<=2;i++){c.fillStyle='#b7b3d4';c.beginPath();c.moveTo(i*7,4);c.quadraticCurveTo(i*7+Math.sin(T*.08+i)*7,20,i*7-3,29);c.quadraticCurveTo(i*7-8,16,i*7-3,4);c.fill();}eye(-7,-9);eye(7,-9);}
 if(wind){c.fillStyle='#f2d19a';c.beginPath();c.moveTo(0,-37);c.lineTo(4,-30);c.lineTo(0,-26);c.lineTo(-4,-30);c.fill();}
 if(active)oval(0,27,15,3,'#e3b69d55');c.restore();return true;
}

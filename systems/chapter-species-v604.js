// V604. Anatomía por especie real, uniforme por mundo, lectura por rol.
// Solo dibujo local: NO toca IA, hitbox, daño, RNG ni guardado.
import {speciesProfile} from './enemy-species.js';
const TAU=Math.PI*2,INK='#253245';
export const CHAPTER_SPECIES=Object.freeze(['cucaracho','cangrejo','rana','planta','phosquito','mosquito','abeja','avispa','libelula','gaviota','murcielago','arana','pez','anguila','medusa','ufo','brasita','escoria']);
const oval=(c,x,y,rx,ry,col,r=0)=>{c.strokeStyle=INK;c.lineWidth=2;c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,r,0,TAU);c.fill();c.stroke();};
const path=(c,pts,col)=>{c.fillStyle=col;c.strokeStyle=INK;c.lineWidth=2;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();c.stroke();};
const stroke=(c,pts,col=INK,w=2)=>{c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
const eye=(c,x,y,wind,hurt)=>{if(hurt){stroke(c,[[x-4,y],[x+4,y+2]],INK,2);return;}oval(c,x,y,5,5.6,'#fff9e5');oval(c,x+(wind?2:1),y+1,2.1,2.8,INK);c.fillStyle='#fff';c.beginPath();c.arc(x-1,y-2,1.3,0,TAU);c.fill();};
export const speciesArtVariant=(kind,spawnIndex=0)=>CHAPTER_SPECIES.includes(kind)?((Math.abs(Number(spawnIndex)||0)%3)+1):0;
export function drawChapterSpecies(c,e,{time=0,step=0,wind=false,hurt=false,reduced=false}={},P={}){
 const kind=e?.kind;if(!CHAPTER_SPECIES.includes(kind))return false;
 const col=speciesProfile(kind).color,glow=P.light||'#fff2ce',shade=P.dark||INK,phase=reduced?0:Math.sin(time*.27+(e.spawnIndex||0));
 c.save();c.lineJoin='round';c.lineCap='round';
 if(['cucaracho','arana','rana','planta','cangrejo','escoria'].includes(kind))for(const side of [-1,1])stroke(c,[[side*11,-19],[side*(22+step*5),-8],[side*(29+step*6),1]],shade,5);
 if(['mosquito','phosquito','abeja','avispa','libelula'].includes(kind)){
   for(const side of [-1,1]){oval(c,side*19,-44+phase*3,21,7,'#e7f8ec',side*(.45+phase*.16));
     if(kind==='libelula')oval(c,side*16,-26-phase*2,22,6,'#9de9dd',side*.38);}
   oval(c,-4,-28,kind==='libelula'?9:13,kind==='libelula'?25:18,col);
   oval(c,10,-40,10,11,glow);
   for(let i=0;i<3;i++)stroke(c,[[-15,-37+i*8],[3,-37+i*8]],shade,['abeja','avispa'].includes(kind)?4:1.6);
   if(kind==='mosquito'||kind==='phosquito')stroke(c,[[19,-41],[30,-37]],shade,3);
   if(kind==='avispa')path(c,[[-13,-13],[-5,4],[1,-13]],glow);
   if(kind==='libelula')stroke(c,[[-6,-13],[-7,5]],shade,3);
   stroke(c,[[13,-50],[19,-63],[25,-62]],shade,2);eye(c,10,-41,wind,hurt);
 }else if(kind==='cangrejo'){
   oval(c,0,-26,25,17,col);oval(c,0,-32,19,7,glow);
   for(const side of [-1,1]){stroke(c,[[side*17,-26],[side*31,-34]],shade,5);oval(c,side*35,-38,11,9,col);
     path(c,[[side*34,-38],[side*40,-52],[side*47,-40]],glow);
     stroke(c,[[side*10,-35],[side*11,-49]],shade,3);eye(c,side*11,-49,wind,hurt);}
 }else if(kind==='cucaracho'){
   oval(c,-4,-28,22,23,shade);oval(c,-3,-30,20,21,col);
   stroke(c,[[-3,-49],[-3,-10]],shade,2);for(let j=0;j<3;j++)stroke(c,[[-18,-36+j*8],[10,-36+j*8]],glow,1.4);
   oval(c,12,-40,10,11,col);eye(c,13,-43,wind,hurt);
   for(const s of [-1,1])stroke(c,[[14,-52],[14+s*8,-62],[14+s*13,-63]],shade,2);
 }else if(kind==='rana'){
   oval(c,0,-26,25,18,col);oval(c,1,-35,24,18,col);
   for(const s of [-1,1]){oval(c,s*14,-49,9,10,col);eye(c,s*14,-50,wind,hurt);
     stroke(c,[[s*17,-18],[s*31,-11],[s*(30+step*4),0]],shade,5);}
   stroke(c,[[-10,-29],[0,-25],[10,-29]],shade,2);
 }else if(kind==='planta'){
   stroke(c,[[0,0],[0,-42]],shade,8);
   for(const s of [-1,1]){path(c,[[0,-31],[s*35,-44],[s*18,-16]],col);stroke(c,[[0,-29],[s*25,-35]],glow,2);}
   oval(c,0,-46,21,19,col);
   for(let j=-1;j<=1;j++)path(c,[[j*10,-58],[j*10-4,-73],[j*10+8,-61]],glow);
   eye(c,-8,-47,wind,hurt);eye(c,9,-47,wind,hurt);
 }else if(kind==='arana'){
   for(const s of [-1,1])for(let j=0;j<3;j++)stroke(c,[[s*12,-30],[s*(24+j*4),-43-j*2],[s*(32+j*5),-5+j*4]],shade,3);
   oval(c,-4,-27,23,19,col);oval(c,15,-36,13,12,glow);
   eye(c,9,-38,wind,hurt);eye(c,19,-38,wind,hurt);
   path(c,[[16,-26],[12,-19],[22,-21]],'#fff6ea');
 }else if(kind==='pez'){
   path(c,[[-10,-30],[-38,-48],[-36,-12]],col);
   oval(c,0,-30,28,18,col);path(c,[[-7,-44],[3,-56],[13,-44]],glow);
   for(let j=0;j<3;j++)stroke(c,[[-6+j*7,-26],[-4+j*7,-15]],shade,1.5);
   eye(c,15,-34,wind,hurt);oval(c,28,-26,4,3,glow);
 }else if(kind==='anguila'){
   c.lineCap='round';c.beginPath();c.moveTo(-28,-6);c.bezierCurveTo(-40,-53,9,-5,5,-45);c.bezierCurveTo(7,-61,22,-56,31,-47);
   c.strokeStyle=shade;c.lineWidth=20;c.stroke();c.strokeStyle=col;c.lineWidth=14;c.stroke();
   oval(c,28,-47,13,10,col);eye(c,30,-51,wind,hurt);
   for(let j=0;j<3;j++)path(c,[[-26+j*14,-14],[-20+j*14,-28],[-15+j*14,-14]],glow);
 }else if(kind==='medusa'){
   for(let j=-3;j<=3;j++){const x=j*7;stroke(c,[[x,-20],[x+phase*5,-9],[x-phase*7,3]],j%2?col:glow,3);}
   oval(c,0,-32,28,22,col);oval(c,0,-39,21,12,glow);
   eye(c,-9,-31,wind,hurt);eye(c,10,-31,wind,hurt);
 }else if(kind==='ufo'){
   c.save();c.globalAlpha=.26;path(c,[[-9,-20],[9,-20],[20,2],[-20,2]],col);c.restore();
   oval(c,0,-39,18,17,glow);oval(c,0,-30,34,11,col);
   for(let j=-2;j<=2;j++)oval(c,j*10,-28,3,3,j%2?glow:'#8ee8fd');
   eye(c,0,-43,wind,hurt);
 }else if(kind==='gaviota'){
   for(const s of [-1,1])path(c,[[0,-32],[s*30,-55+phase*6],[s*41,-31],[s*11,-20]],'#e5eef0');
   oval(c,0,-29,14,21,col);oval(c,8,-45,14,14,'#fff8e6');
   path(c,[[18,-46],[32,-42],[18,-38]],'#eaa846');eye(c,10,-48,wind,hurt);
 }else if(kind==='murcielago'){
   for(const s of [-1,1]){path(c,[[s*8,-29],[s*27,-58+phase*7],[s*42,-38],[s*29,-23],[s*21,-35]],col);
     stroke(c,[[s*10,-30],[s*28,-52+phase*6]],glow,1.6);}
   oval(c,0,-31,18,19,col);
   for(const s of [-1,1])path(c,[[s*6,-46],[s*16,-65],[s*18,-42]],glow);
   eye(c,-7,-35,wind,hurt);eye(c,7,-35,wind,hurt);
 }else if(kind==='brasita'){
   path(c,[[-20,-13],[-23,-38],[-5,-63],[1,-48],[14,-69],[23,-43],[18,-12]],col);
   oval(c,0,-27,16,17,glow);eye(c,-6,-33,wind,hurt);eye(c,7,-33,wind,hurt);
 }else if(kind==='escoria'){
   oval(c,0,-26,27,23,shade);
   path(c,[[-23,-44],[-13,-62],[0,-46],[12,-65],[28,-39],[24,-16],[-22,-14]],col);
   for(let j=0;j<3;j++)stroke(c,[[-17+j*13,-38],[-8+j*12,-24],[-13+j*13,-15]],glow,2.5);
   eye(c,9,-39,wind,hurt);
 }
 // Armor and weapons reveal role without changing the creature's silhouette.
 if(e.campaignRole==='shield'){oval(c,-29,-26,10,17,glow);stroke(c,[[-29,-36],[-29,-17]],shade,2);}
 else if(['gunner','shooter'].includes(e.campaignRole)){oval(c,30,-22,7,7,glow);stroke(c,[[20,-22],[38,-22]],shade,3);}
 else if(e.campaignRole==='captain')path(c,[[-15,-57],[0,-70],[15,-57]],glow);
 if(e.elite)path(c,[[-8,-69],[0,-78],[8,-69]],'#fff1bf');
 c.restore();return true;
}
// Species-specific readable attack anticipation: no target rays or debug lines.
export function drawChapterSpeciesCue(c,e,time=0,reduced=false){
 if(!e?.telegraph||e.sleep>0||e.stun>5)return false;
 c.save();const col=speciesProfile(e.kind).color,role=e.campaignRole||'';
 c.globalAlpha=.55;c.fillStyle=col;c.beginPath();
 c.ellipse(0,1,['flyer','jumper'].includes(role)?26:22,3.5,0,0,TAU);c.fill();
 c.globalAlpha=.92;c.strokeStyle='#fff8d8';c.lineWidth=2.5;c.beginPath();
 if(['flyer','jumper'].includes(role)) {c.moveTo(-15,-48);c.quadraticCurveTo(0,-62-(reduced?0:Math.sin(time*.25)*4),15,-48);}
 else if(role==='shield'){c.moveTo(-27,-39);c.quadraticCurveTo(-33,-50,-25,-61);}
 else c.arc(27,-39,7+(reduced?0:Math.sin(time*.18)*2),0,TAU);
 c.stroke();c.restore();return true;
}

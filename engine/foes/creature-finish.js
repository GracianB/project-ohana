// Small anatomical marks attached to the body, never floating UI or attack rays.
// Shared species retain their identity when encountered in another hero's realm.
const INSECTS=new Set(['cucaracho','abeja','avispa','mosquito','phosquito','libelula','arana']);
export function drawCreatureFinish(c,e){
 if(e.boss||e.miniBoss||e.hp<=0)return;
 const k=e.kind,r=Math.max(7,Math.min(21,e.w*.25)),h=Math.max(5,Math.min(14,e.h*.2));
 c.save();c.lineCap='round';c.lineWidth=1;c.strokeStyle='#172c44aa';
 if(INSECTS.has(k)){
  // Curved shell sutures and a narrow specular rim read as a solid carapace.
  c.beginPath();c.moveTo(-r*.85,h*.2);c.quadraticCurveTo(-r*.25,-h*.85,r*.45,-h*.1);c.stroke();
  c.strokeStyle='#fff2d077';c.beginPath();c.moveTo(-r*.72,-h*.12);c.quadraticCurveTo(-r*.3,-h*.8,r*.12,-h*.65);c.stroke();
 }else if(['pez','anguila','rana','escoria'].includes(k)){
  for(let row=0;row<2;row++)for(let i=0;i<3;i++){const x=-r*.8+i*r*.48+row*2,y=h*.1+row*3;c.beginPath();c.arc(x,y,2,.1,Math.PI-.1);c.stroke();}
 }else if(k==='planta'){
  c.strokeStyle='#e6ffd388';for(const side of [-1,1]){c.beginPath();c.moveTo(side*r*.2,h);c.quadraticCurveTo(side*r*.6,h*.2,side*r,h*.1);c.stroke();}
 }else if(['gaviota','murcielago'].includes(k)){
  for(const side of [-1,1])for(let i=0;i<3;i++){c.beginPath();c.moveTo(side*(r*.4+i*3),h*.1+i);c.quadraticCurveTo(side*(r*.7+i*3),h*.5+i,side*(r+i*3),h*.2+i);c.stroke();}
 }else if(k==='cangrejo'){
  c.beginPath();c.moveTo(-r,h*.3);c.quadraticCurveTo(0,-h*.7,r,h*.3);c.stroke();
  for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(i*r*.5,h*.1);c.lineTo(i*r*.65,h*.65);c.stroke();}
 }else if(k==='medusa'){
  c.strokeStyle='#fff1fa88';c.beginPath();c.ellipse(-r*.3,-h*.65,r*.45,h*.2,-.3,0,Math.PI*2);c.stroke();
 }else if(k==='ufo'){
  c.strokeStyle='#c4fff080';c.beginPath();c.ellipse(0,h*.3,r,h*.28,0,0,Math.PI);c.stroke();
 }else if(k==='brasita'){
  c.strokeStyle='#fff7b899';c.beginPath();c.moveTo(-r*.4,h*.4);c.quadraticCurveTo(-r*.6,-h*.3,0,-h*.9);c.stroke();
 }
 c.restore();
}

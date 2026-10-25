import {cachedGradient} from '../systems/canvas-gradient-cache.js';
const TAU=Math.PI*2;
function dome(c,x,y,r){
 c.fillStyle='#a6c3cd';c.strokeStyle='#678798';c.lineWidth=3;c.beginPath();c.moveTo(x-r,y);c.bezierCurveTo(x-r,y-r*1.4,x+r,y-r*1.4,x+r,y);c.closePath();c.fill();c.stroke();
 c.strokeStyle='#cbe2df';c.lineWidth=2;for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(x+i*r*.45,y);c.quadraticCurveTo(x+i*r*.8,y-r*.7,x,y-r*1.04);c.stroke();}
 c.fillStyle='#cbdad5';c.beginPath();c.roundRect(x-r-9,y,2*r+18,15,5);c.fill();c.stroke();
}
export function drawYomiDawn(c,cam,t,W,H,reduce=false){
 const time=reduce?0:t,ground=1134-cam.y;c.save();c.globalAlpha=1;c.filter='none';c.globalCompositeOperation='source-over';
 c.fillStyle=cachedGradient(c,'yomi-dawn-'+H,()=>{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#7996b5');g.addColorStop(.52,'#bed8dc');g.addColorStop(1,'#e0e6cd');return g;});c.fillRect(0,0,W,H);
 c.fillStyle='#edf1d9';c.beginPath();c.ellipse(W*.76,H*.24,69,69,0,0,TAU);c.fill();c.strokeStyle='#d5e6d6';c.lineWidth=10;c.beginPath();c.ellipse(W*.76,H*.24,105,20,-.28,0,TAU);c.stroke();
 for(let i=0;i<32;i++){const x=((i*163-cam.x*.025)%(W+80)+W+80)%(W+80)-40,y=45+(i*97)%Math.max(1,H*.55);c.fillStyle=i%3?'#eff3df':'#c4eee0';c.beginPath();c.arc(x,y,1.2+i%2,0,TAU);c.fill();}
 // Broad glass research domes follow the terrain without becoming colliders.
 for(let layer=0;layer<2;layer++){const par=.12+layer*.18,span=760;
  for(let i=Math.floor(cam.x*par/span)-1;i<Math.ceil((cam.x*par+W)/span)+1;i++){const x=i*span-cam.x*par;c.globalAlpha=layer?.85:.42;dome(c,x,H*.7+layer*65,100+layer*30);}}
 c.globalAlpha=1;
 for(let i=Math.floor(cam.x/1250)-1;i<Math.ceil((cam.x+W)/1250)+1;i++){
  const x=i*1250+730-cam.x,y=ground;
  dome(c,x,y-55,105);c.fillStyle='#a0b9bd';c.fillRect(x-115,y-48,230,48);
  c.strokeStyle='#5e8193';c.lineWidth=8;c.beginPath();c.moveTo(x+165,y);c.lineTo(x+165,y-115);c.lineTo(x+200,y-150);c.stroke();
  c.save();c.translate(x+204,y-153);c.rotate(-.36);c.fillStyle='#b9d5d7';c.strokeStyle='#5e8193';c.lineWidth=3;c.beginPath();c.roundRect(-40,-15,90,30,8);c.fill();c.stroke();c.fillStyle='#4b7389';c.beginPath();c.ellipse(50,0,8,16,0,0,TAU);c.fill();c.restore();
  c.strokeStyle='#9bbabe';c.lineWidth=2;c.beginPath();c.moveTo(x-115,y-10);c.bezierCurveTo(x-170,y-78,x-205,y-120,x-280,y-107);c.stroke();
  const phase=reduce?.5:(time*.006+i*.27)%1,px=x-115-phase*165,py=y-10-Math.sin(phase*Math.PI*.8)*110;c.fillStyle='#e5f0c6';c.beginPath();c.arc(px,py,4,0,TAU);c.fill();
  for(let k=0;k<3;k++){const xx=x-160-k*27;c.strokeStyle='#7d9f8f';c.lineWidth=2;c.beginPath();c.moveTo(xx,y);c.quadraticCurveTo(xx-14,y-22,xx+3,y-38);c.stroke();c.fillStyle='#bed5b3';c.beginPath();c.ellipse(xx-2,y-29,9,4,-.6,0,TAU);c.fill();}
 }
 c.restore();
}

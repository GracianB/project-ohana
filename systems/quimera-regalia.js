// Cosmetic articulation only: every danger remains owned by fusion-boss geometry.
import {WORLD1_ORDER,WORLD1_THEMES} from './world1-rooms.js';
const TAU=Math.PI*2;
export function drawQuimeraSanctum(c,{x,y,phase=1,time=0,freed=false,reduce=false}){
 c.save();c.translate(x,y);c.lineCap='round';
 const tick=reduce?0:time;
 // A static architectural frame keeps moving attacks visually separate.
 for(const side of [-1,1]){
  c.fillStyle='#101a30';c.strokeStyle='#526078';c.lineWidth=2;
  c.beginPath();c.moveTo(side*490,340);c.lineTo(side*490,-120);c.quadraticCurveTo(side*480,-320,side*145,-395);c.lineTo(side*160,-367);c.quadraticCurveTo(side*448,-280,side*450,-110);c.lineTo(side*450,340);c.closePath();c.fill();c.stroke();
  for(let i=0;i<4;i++){c.strokeStyle='#65718b';c.beginPath();c.moveTo(side*450,-80+i*105);c.lineTo(side*490,-99+i*105);c.stroke();}
 }
 for(let i=0;i<10;i++){
  const a=Math.PI+(i+.5)*Math.PI/10,x=Math.cos(a)*385,y=Math.sin(a)*305+50;
  const col=WORLD1_THEMES[WORLD1_ORDER[i]].color;
  c.fillStyle='#19243c';c.strokeStyle=freed?col:'#7e758a';c.lineWidth=2;
  c.beginPath();c.moveTo(x,y-26);c.lineTo(x+17,y);c.lineTo(x,y+26);c.lineTo(x-17,y);c.closePath();c.fill();c.stroke();
  c.globalAlpha=freed?.8:.18+phase*.08;
  c.strokeStyle=col;c.beginPath();c.moveTo(x,y+22);c.quadraticCurveTo(x*.6,y+80,0,160);c.stroke();
  c.globalAlpha=1;
 }
 // Slow ascending fragments, never over the floor or used as danger signals.
 c.fillStyle='#b5bbcf';c.globalAlpha=.28;
 for(let i=0;i<18;i++){const x=Math.sin(i*47)*415,y=180-((i*43+tick*.15)%470);c.fillRect(x,y,2,4);}
 c.restore();
}

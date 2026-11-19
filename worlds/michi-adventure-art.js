import nacar from '../characters/art/nacar.js';
import {adventureHas,passageVisible} from '../systems/michi-adventure.js';
const TAU=Math.PI*2;
const oval=(c,x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();};
export function drawMichiPaw(c,x,y,size=10,col='#ead9b8',angle=0){c.save();c.translate(x,y);c.rotate(angle);oval(c,0,size*.2,size*.42,size*.34,col);for(let i=0;i<4;i++){const a=-Math.PI*.85+i*.73;oval(c,Math.cos(a)*size*.58,Math.sin(a)*size*.6,size*.17,size*.22,col);}c.restore();}
export function drawMichiMemory(c,x,y,page,t=0,reduced=false){
 c.save();c.translate(x,y+(reduced?0:Math.sin(t*.03+page)*2));c.rotate(reduced?0:Math.sin(t*.018+page)*.08);
 const colors=['#e5a8a0','#d4bd92','#d6ce9f','#a3dcd0','#bdb5d9','#ecd09c','#92d9e3','#e4becb','#b9d5bb','#efe3bf'];
 c.fillStyle=colors[page%10];
 if(page===0){c.fillRect(-7,-5,14,6);c.fillRect(2,0,5,10);} // scarf
 else if(page===2||page===7)drawMichiPaw(c,0,0,10,colors[page]);
 else if(page===3||page===6){oval(c,0,-2,9,7,colors[page]);for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(i*5,2);c.quadraticCurveTo(i*6-3,8,i*5,12);c.lineTo(i*5+2,8);c.fill();}}
 else if(page===5){c.fillRect(-6,-8,12,16);oval(c,0,-10,8,3,'#d9ba8e');oval(c,0,0,2,5,'#fff0ce');}
 else{c.beginPath();c.moveTo(0,-11);c.quadraticCurveTo(11,-2,7,7);c.quadraticCurveTo(0,12,-7,7);c.quadraticCurveTo(-11,-2,0,-11);c.fill();oval(c,-2,-3,2,3,'#fff5dc');}
 c.restore();
}
export function drawMichiAdventure(c,g,cam,t,W,H){
 const r=g.roomDef?.michiSanctuary;if(!r?.adventure)return;const T=g.reduceMotion?0:t;
 c.save();
 for(const a of r.passages){if(!a.walkThrough&&!a.secret)continue;const x=a.x-cam.x,y=a.floor-cam.y;if(x< -150||x>W+150||y< -150||y>H+150)continue;
  if(a.walkThrough){c.fillStyle='#405d60';c.fillRect(x-3,y-100,6,100);c.fillStyle='#ead8b0';c.beginPath();c.moveTo(x-42,y-105);c.lineTo(x+32,y-105);c.lineTo(x+50,y-89);c.lineTo(x+32,y-73);c.lineTo(x-42,y-73);c.closePath();c.fill();c.textAlign='center';c.font='600 10px sans-serif';c.fillStyle='#253d4c';c.fillText(a.id.includes('arena')?'POLILLA →':'SENDERO →',x,y-85,82);}
  else if(!passageVisible(g,a)){for(let i=0;i<4;i++)drawMichiPaw(c,x-90+i*25,y-8,5,'#8cb5a477',.25);}
 }
 const sign=r.adventure.bossSign,x=sign.x-cam.x,y=sign.floor-cam.y;
 if(x> -200&&x<W+200){c.fillStyle='#1b3645';c.fillRect(x-130,y-157,260,75);c.fillStyle='#e8d3a9';c.textAlign='center';c.font='700 15px sans-serif';c.fillText(sign.label,x,y-131);c.font='11px sans-serif';c.fillText('Cinco faroles · guardiana del sello',x,y-108);}
 for(const q of r.garden.mechanisms.filter(q=>['chime','rescue','race','guard','ocean'].includes(q.kind))){const xx=q.x-cam.x,yy=q.floor-cam.y;if(xx< -150||xx>W+150||yy< -100||yy>H+100)continue;
  if(q.kind==='chime'){
   c.fillStyle='#735768';c.fillRect(xx-42,yy-32,84,32);oval(c,xx,yy-53+Math.sin(T*.025+q.note)*2,16,20,adventureHas(g,'hollow')?'#edd9a4':'#b9c9b5');
   c.fillStyle='#394b56';c.beginPath();
   if(q.note===2){for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rad=i%2?4:10;c.lineTo(xx+Math.cos(a)*rad,yy-54+Math.sin(a)*rad);}}
   else if(q.note===0){c.arc(xx,yy-54,9,.8,5.5);c.quadraticCurveTo(xx-2,yy-54,xx+6,yy-47);}
   else{c.moveTo(xx-7,yy-47);c.quadraticCurveTo(xx-12,yy-62,xx+9,yy-64);c.quadraticCurveTo(xx+11,yy-49,xx-7,yy-47);}
   c.fill();c.textAlign='center';c.font='600 10px sans-serif';c.fillStyle='#ead6b2';c.fillText(['LUNA','HOJA','ESTRELLA'][q.note],xx,yy-12);
  }
  if(q.kind==='ocean'&&!g.onlineAdventure&&adventureHas(g,'tide'))drawOceanPassage(c,xx,yy-5,T,'PASO AL FONDO MARINO');
  if(q.kind==='rescue'){c.save();c.translate(xx,yy-4);c.scale(.8,.8);nacar.draw(c,{form:1,state:'idle',t:T,reduceMotion:g.reduceMotion,look:{x:0,y:0}});c.restore();}

  if(q.kind==='guard'){c.fillStyle='#536e74';c.fillRect(xx-18,yy-45,36,45);oval(c,xx,yy-54,16,24,g._michiLampCooldown>0?'#71878a':'#ecd09c');drawMichiPaw(c,xx,yy-51,8,'#faf0ce');}
  if(q.kind==='race'){for(let i=0;i<5;i++)oval(c,xx+i*22,yy-65+Math.sin(T*.045+i)*8,2,4,'#e4d6a6');drawMichiPaw(c,xx,yy-10,14,'#a7cfb9');}
 }
 if(g._michiLampGuard>0&&g.player){const p=g.player;oval(c,p.x+p.w/2-cam.x,p.y+p.h/2-cam.y,p.w*.85,p.h*.75,'#b8e6cf33');}
 if(g._michiRace?.active){const time=Math.max(0,Math.ceil((r.adventure.race.limit-g._michiRace.t)/60));c.textAlign='center';c.font='600 13px sans-serif';c.fillStyle='#f0dfac';c.fillText('LUCIÉRNAGAS · '+time+' s · hacia el farol del este',W/2,115,Math.max(1,W-28));}
 c.restore();
}

export function drawOceanPassage(c,x,y,t,label){
 c.save();
 c.translate(x,y);
 c.strokeStyle='#7fd8cb';
 c.lineWidth=3;
 c.beginPath();
 c.ellipse(0,-35,27,34,0,0,TAU);
 c.stroke();
 for(let i=0;i<8;i++){
  const phase=(i/8+t*.012)%1;
  oval(c,Math.sin(phase*TAU)*16,-10-phase*48,2+phase*2,3+phase*2,'#bdeee688');
 }
 c.fillStyle='#e3f7e9';
 c.textAlign='center';
 c.font='600 11px sans-serif';
 c.fillText(label,0,-81);
 c.restore();
}

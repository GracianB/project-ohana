import {ROSTER} from '../characters/roster.js';
import {drawChapterVista} from '../worlds/chapter-vistas.js';
export const MEMORY_REWARDS=Object.freeze({
 kilo:['El concierto de las flores','Una canción florece para toda la familia.','Pétalos del hogar'],
 stitcho:['La nave vuelve a respirar','Las cien chispas encienden el corazón galáctico.','Órbita de plasma'],
 chispin:['La sinfonía del trueno','Cada rayo encuentra su voz en la tormenta.','Chispas doradas'],
 cat:['El sueño de las cien lunas','Los recuerdos se convierten en compañeros de sueño.','Lunas guardianas'],
 cuerno:['El nacimiento de la aurora','Cien colores despiertan un cielo nuevo.','Estela de aurora'],
 dragon:['El fuego que guarda el hogar','Las brasas se reúnen en un dragón de luz.','Ascuas ancestrales'],
 dino:['La memoria de la montaña','El valle despierta al escuchar tus cien pasos.','Hojas de ámbar'],
 frita:['El banquete de las nubes','Cada especia encuentra su sitio en la mesa.','Confeti de especias'],
 pizza:['La cena de los cien faros','El puerto entero se reúne alrededor de tu horno.','Albahaca estelar'],
 yomi:['El archivo de la familia','Cien recuerdos. Ninguna voz olvidada.','Aves de memoria']
});
export function memoryBenefits(count){return {compass:count>=25,magnet:count>=50,celebration:count===100};}
export function startMemoryCelebration(g,hero,replay=false){
 const album=g.world1Collect?.rooms?.[hero];if(!album?.relic||album.found.length!==100||!MEMORY_REWARDS[hero]||g.relicScene)return false;
 g.relicScene={kind:'memory-v2',hero,room:g.roomId,age:0,duration:540,replay};
 g.onRelicBegin?.();g.resetInput?.();g.onWorld1Beat?.('album-ceremony',hero);return true;
}
export function drawMemoryAura(c,g,cam,t){
 const p=g.player,album=g.world1Collect?.rooms?.[p?.id];if(!p||p.dead||!album?.relic)return;
 const id=p.id,colors={kilo:'#ffb6cc',stitcho:'#8bddf3',chispin:'#ffe19b',cat:'#d8bded',cuerno:'#d5c6e8',dragon:'#ffba83',dino:'#c5d6a1',frita:'#f7d49c',pizza:'#b6dcab',yomi:'#c4ece2'},col=colors[id];
 c.save();c.fillStyle=col;c.strokeStyle=col;c.lineWidth=1.3;
 for(let i=0;i<4;i++){
  const a=i*Math.PI/2+(g.reduceMotion?0:t*.025),r=22+i*2,x=p.x+p.w/2-cam.x+Math.cos(a)*r,y=p.y+p.h*.5-cam.y+Math.sin(a)*r*.65;
  c.globalAlpha=.5;
  if(['yomi','cuerno'].includes(id)){c.beginPath();c.moveTo(x-5,y);c.lineTo(x,y+3);c.lineTo(x+5,y-4);c.stroke();}
  else if(['kilo','dino','pizza'].includes(id)){c.beginPath();c.ellipse(x,y,5,2.5,a,0,Math.PI*2);c.fill();}
  else{c.beginPath();c.arc(x,y,2.5,0,Math.PI*2);c.fill();}
 }c.restore();
}
export function drawMemoryCelebration(c,g,W,H,draw){
 const s=g.relicScene,id=s.hero,copy=MEMORY_REWARDS[id],hero=ROSTER.find(r=>r.id===id),seconds=s.age/60,k=Math.min(1,s.age/90),reduced=g.reduceMotion;
 const skies={stitcho:['#101a35','#31617c'],dragon:['#432f4e','#cf8e70'],cat:['#302c55','#9a88ba'],yomi:['#203f58','#92bbb8']},sky=skies[id]||['#325365','#d4bc93'];
 c.save();const bg=c.createLinearGradient(0,0,0,H);bg.addColorStop(0,sky[0]);bg.addColorStop(1,sky[1]);c.fillStyle=bg;c.fillRect(0,0,W,H);
 drawChapterVista(c,{roomDef:{hero:id,composition:true},reduceMotion:reduced},{x:0,y:0},s.age,W,H);
 c.fillStyle='#183346';c.globalAlpha=.48;c.beginPath();c.ellipse(W*.5,H*.8,W*.38,H*.09,0,0,Math.PI*2);c.fill();c.globalAlpha=1;
 const f=hero.forms[4],pose=seconds<1.5?'idle':seconds<5?'cast':'victory';
 const actor={...f,id,evo:4,x:-f.w/2,y:-f.h,w:f.w,h:f.h,grounded:true,facing:1,vx:pose==='run'?3:0,vy:0,invuln:0,melee:0,_poseOverride:pose,_cast:pose==='cast'?{slot:3,t:Math.max(0,s.age-12)}:null};
 if(id==='kilo')actor._kiloPerformance={kind:'dance',time:seconds};
 c.save();c.translate(W*.5,H*.8);const sc=Math.min(W/490,H/360);c.scale(sc,sc);draw(c,actor,{x:0,y:0},reduced?60:s.age,{reduceMotion:reduced});c.restore();
 // Every collected memory participates in the event, spiralling into the
 // family's emblem and then into the hero's permanent signature trail.
 c.fillStyle=hero.color;c.strokeStyle='#fff1c9';c.lineWidth=1.5;
 for(let i=0;i<100;i++){
  const a=i*Math.PI*2/100+(reduced?0:seconds*.23),radius=Math.min(W*.37,H*.31)*(1-k*.35),wave=reduced?0:Math.sin(seconds*1.7+i)*5;
  const x=W*.5+Math.cos(a)*radius,y=H*.52+Math.sin(a)*radius*.7+wave;
  c.save();c.translate(x,y);c.rotate(a);c.globalAlpha=.35+Math.min(.6,k);
  if(['yomi','cuerno'].includes(id)){c.beginPath();c.moveTo(-5,-2);c.lineTo(0,3);c.lineTo(6,-3);c.stroke();}
  else if(id==='dragon'||id==='chispin'){c.beginPath();c.moveTo(0,-5);c.lineTo(3,0);c.lineTo(0,5);c.lineTo(-3,0);c.closePath();c.fill();}
  else {c.beginPath();c.ellipse(0,0,4,2.2,0,0,Math.PI*2);c.fill();}
  c.restore();
 }
 c.textAlign='center';c.fillStyle='#fff1c9';c.font=`bold ${Math.max(20,Math.min(38,W*.045))}px sans-serif`;c.fillText(copy[0],W/2,H*.12,W*.9);
 c.font=`${Math.max(12,Math.min(20,W*.028))}px sans-serif`;c.fillText(copy[1],W/2,H*.19,W*.9);
 c.fillText('100/100 · '+copy[2]+' desbloqueada',W/2,H*.9,W*.9);
 c.font='12px sans-serif';c.fillText('Tu firma te acompaña en la sala · Repite esta escena desde el álbum',W/2,H*.95,W*.92);
 c.restore();
}

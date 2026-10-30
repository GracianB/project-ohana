import {EXPEDITION_ART,drawExpeditionArtifact} from './expedition-art-v630.js';
import {KEEPSAKE_ORDER} from './keepsakes.js';
const TAU=Math.PI*2,FLOOR=1134;
function oval(c,x,y,rx,ry,color,width=0){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=color;c.fill();if(width){c.strokeStyle='#122a40';c.lineWidth=width;c.stroke();}}

// Called in the local coordinates of the mirror. Its floor objects and energy
// are views of real ritual state; looking at a core cannot activate it.
export function drawRitualCore(c,portal,g,t=0,reduced=false){
 const hero=portal.hero,quimera=hero==='quimera',pal=EXPEDITION_ART[hero]||{color:'#e8d7c1',light:'#fff2ce',dark:'#6b688b'};
 const v=g.finalGauntlet,found=!!v?.found?.includes(hero),collected=quimera?(v?.found?.length===10?[0,1,2]:[]):v?.resonances?.[hero]||[];
 const active=v?.hero===hero,phase=active?v.phase:'waiting',summon=phase==='summoning'?Math.min(1,(v.summonTicks||0)/48):0;
 const count=found?3:collected.length,power=count/3,clock=reduced?0:t;
 const rx=portal.rx-6,ry=portal.ry-6;
 c.save();c.beginPath();c.ellipse(0,0,rx,ry,0,0,TAU);c.clip();
 const radiance=c.createRadialGradient(-18,-20,3,0,0,98);radiance.addColorStop(0,pal.light);radiance.addColorStop(.24,pal.color);radiance.addColorStop(.62,pal.dark);radiance.addColorStop(1,'#152a4000');
 c.save();c.globalAlpha=.55+power*.35;oval(c,0,-7,85+summon*13,96+summon*15,radiance);c.restore();
 // Four sculpted petals carry the chapter's original four awakenings. The
 // three floor discoveries supply the moving light inside that structure.
 for(let k=0;k<4;k++){
  const angle=k*TAU/4-Math.PI/4;c.save();c.rotate(angle);c.beginPath();c.moveTo(-13,-58);c.bezierCurveTo(-34,-80,-18,-104,0,-112);c.bezierCurveTo(19,-104,32,-80,13,-58);c.quadraticCurveTo(0,-77,-13,-58);c.fillStyle=pal.dark;c.fill();c.strokeStyle=pal.color;c.lineWidth=2;c.stroke();
  oval(c,0,-91,4,8,pal.light);c.restore();
 }
 for(let k=0;k<3;k++){
  c.save();c.rotate(clock*.008*(k%2?-1:1)+k*TAU/3);c.scale(1,.6+k*.07);c.beginPath();c.ellipse(0,0,59+k*6,59+k*6,0,0,TAU);c.strokeStyle=k<count?pal.light:pal.dark;c.lineWidth=k<count?3:1.2;c.stroke();c.restore();
 }
 const kernel=c.createRadialGradient(-9,-17,1,0,-8,43+summon*12);kernel.addColorStop(0,'#ffffff');kernel.addColorStop(.2,pal.light);kernel.addColorStop(.58,pal.color);kernel.addColorStop(1,pal.dark);
 c.save();c.globalAlpha=.78+power*.22;oval(c,0,-8,35+power*8+summon*12,42+power*6+summon*14,kernel,2);c.restore();
 oval(c,-12,-27,11,5,'#ffffff99');
 for(let k=0;k<9;k++){
  const angle=k*TAU/9+clock*.014,radius=48+(k%3)*11;
  oval(c,Math.cos(angle)*radius,Math.sin(angle)*radius-8,k<count*3?2.8:1.3,k<count*3?2.8:1.3,k<count*3?pal.light:pal.color);
 }
 c.fillStyle='#fff0d2';c.font='700 12px Outfit,sans-serif';c.textAlign='center';c.fillText(found?'RECUERDO A SALVO':quimera?(v?.found?.length||0)+'/10 VOCES':count+'/3 RESONANCIAS',0,105);
 c.restore();

 const floor=FLOOR-portal.y-14;
 if(!quimera)for(let index=0;index<3;index++){
  const x=(index-1)*78,done=found||collected.includes(index),pickup=v?.lastPickup,age=pickup?.hero===hero&&pickup.index===index?(v.tick-pickup.at):999;
  const progress=!reduced&&age>=0&&age<36?age/36:1;
  c.save();oval(c,x,floor+1,29,6,done?pal.color+'99':'#0c243d',1.5);oval(c,x,floor,20,3,done?pal.light:pal.dark);
  if(found)drawExpeditionArtifact(c,hero,x,floor-5,48,{index,active:true,done:true,t:clock,reduced});
  else if(!done)drawExpeditionArtifact(c,hero,x,floor-5,48,{index,active,done:false,t:clock,reduced});
  else if(progress<1){const ease=progress*progress*(3-2*progress);drawExpeditionArtifact(c,hero,x*(1-ease),floor-5-(floor+20)*ease,48*(1-ease*.7),{index,active:true,done:true,t:clock,reduced});}
  c.restore();
 }
 if(active&&phase==='gathering'){
  c.fillStyle=pal.light;c.font='700 11px Outfit,sans-serif';c.textAlign='center';c.fillText(quimera?'E · ELIGE TU HÉROE':count===3?'E · ELIGE TU HÉROE':'REÚNE LOS TRES OBJETOS',0,-portal.ry-22);
 }
 if(quimera){
  for(const [index,id]of KEEPSAKE_ORDER.entries()){
   const angle=index*TAU/10-Math.PI/2,x=Math.cos(angle)*80,y=Math.sin(angle)*94;
   oval(c,x,y,4,4,v?.found?.includes(id)?EXPEDITION_ART[id].color:'#3c5368',1);
  }
  c.fillStyle='#f6e5cc';c.font='700 12px Outfit,sans-serif';c.textAlign='center';c.fillText('QUIMERA',0,153);
 }
 return {hero,core:true,objects:quimera?0:3,energized:count,found,phase};
}

import {drawMemoryCelebration} from './memory-rewards-v2.js';
import {ROOM_RELICS} from './room-album.js';
import {ROSTER} from '../characters/roster.js';
export function drawRelicCinema(ctx,g,w,h,draw){
 const s=g.relicScene;if(!s)return;if(s.kind==='memory-v2'){drawMemoryCelebration(ctx,g,w,h,draw);return;}const [owner,name,color]=ROOM_RELICS[s.room],seconds=s.age/60,reduced=g.reduceMotion;
 ctx.save();ctx.fillStyle='#20192e';ctx.fillRect(0,0,w,h);ctx.fillStyle='#593e64';ctx.fillRect(0,h*.55,w,h*.45);
 ctx.fillStyle='#f7d99a';ctx.beginPath();ctx.arc(w*.5,h*.58,Math.min(w,h)*.24,Math.PI,0);ctx.fill();
 ctx.fillStyle='#304c55';ctx.beginPath();ctx.moveTo(0,h*.72);ctx.quadraticCurveTo(w*.25,h*.64,w*.5,h*.72);ctx.quadraticCurveTo(w*.75,h*.8,w,h*.7);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();
 for(const side of [-1,1]){const x=w*(side<0?.13:.87),y=h*.7;ctx.strokeStyle='#233942';ctx.lineWidth=Math.max(5,w*.006);ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x-side*12,y-h*.1,x+side*8,y-h*.23);ctx.stroke();ctx.fillStyle='#233942';for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(x+side*8+Math.cos(i*1.6)*20,y-h*.23+Math.sin(i*1.6)*8,Math.min(w,h)*.07,7,i*.8,0,Math.PI*2);ctx.fill();}}
 const f=ROSTER.find(x=>x.id===owner),form=owner==='kilo'?1:2,actor={id:owner,evo:form,x:-12,y:-28,w:24,h:28,grounded:true,facing:1,vx:0,vy:0,health:1,invuln:0,color:f?.color,_poseOverride:seconds<2?'idle':seconds<8?'cast':'victory',_cast:{id:owner==='kilo'?'ukulele':'',slot:0,t:0},_kiloPerformance:owner==='kilo'?{kind:'relic',time:reduced?0:seconds}:null};
 const together=seconds>=6,scale=Math.min(w*.006,h*.004);
 ctx.save();ctx.translate(w*(together?.62:.5),h*.74);ctx.scale(scale,scale);draw(ctx,actor,{x:0,y:0},reduced?0:s.age,{reduceMotion:reduced});ctx.restore();
 if(together){const pairs={kilo:'stitcho',stitcho:'kilo',frita:'pizza',pizza:'frita',cat:'cuerno',cuerno:'cat',dragon:'dino',dino:'dragon',chispin:'yomi',yomi:'chispin'},id=g.player?.id===owner?pairs[owner]:g.player.id;
  const guest={id,evo:g.player?.id===id?g.player.evo:1,x:-12,y:-28,w:24,h:28,health:1,invuln:0,hurtFlash:0,melee:0,vx:0,vy:0,grounded:true,facing:1,_poseOverride:seconds>8?'victory':'idle',visualScale:1};ctx.save();ctx.globalAlpha=reduced?1:Math.min(1,seconds-6);ctx.translate(w*.28,h*.75);ctx.scale(scale*.8,scale*.8);draw(ctx,guest,{x:0,y:0},reduced?0:s.age,{reduceMotion:reduced});ctx.restore();}
 // Notes travel outward towards the remembered family, never over the face.
 ctx.fillStyle=color;for(let i=0;i<8;i++){const phase=reduced?i/8:(seconds*.08+i/8)%1,x=w*.5+(i%2?1:-1)*phase*w*.38,y=h*.65-phase*h*.33;ctx.beginPath();ctx.ellipse(x,y,4,3,-.3,0,Math.PI*2);ctx.fill();ctx.fillRect(x+3,y-13,2,13);}
 const lines=s.room==='hub'?['Había una canción esperando en cada rincón.','Kilo la aprendió con todos los recuerdos que trajiste.','Ohana es saber que siempre hay alguien escuchando.']:['Cada rincón guardaba un recuerdo.','Los encontraste. Ahora forman parte de tu familia.','Nadie se queda atrás. Nadie se olvida.'];
 ctx.textAlign='center';ctx.fillStyle=color;ctx.font=`700 ${Math.max(16,Math.min(30,w*.045))}px sans-serif`;ctx.fillText(name,w/2,h*.14);
 ctx.fillStyle='#fff2da';ctx.font=`500 ${Math.max(12,Math.min(20,w*.026))}px sans-serif`;
 const line=lines[Math.min(2,Math.floor(seconds/3.4))];
 // Wrap the story for narrow touch displays.
 const words=line.split(' ');let text='',row=0;for(const word of words){const next=text?text+' '+word:word;if(ctx.measureText(next).width>w*.85){ctx.fillText(text,w/2,h*.84+row*25);row++;text=word;}else text=next;}ctx.fillText(text,w/2,h*.84+row*25);
 ctx.fillStyle=color;ctx.fillRect(w*.1,h*.96,w*.8*Math.min(1,s.age/600),3);ctx.restore();
}

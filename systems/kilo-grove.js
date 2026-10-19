import {movePlatform,drawPlatformRail} from './moving-platforms.js';
const SONG='hub-aloha-song';
export function installKiloGrove(room){
 room.plats=[
  [0,1134,1190,126],[1290,1134,1050,126],[2440,1134,1760,126],[160,1054,250,22],[270,960,330,22],
  [690,880,260,22],[990,730,270,22],
  [2150,894,260,22],[2220,780,255,22],[2490,974,250,22],[2620,1054,220,22],
  [3180,814,260,22],[3000,574,260,22],[2720,334,260,22],[2850,14,300,22],[3650,960,260,22]
 ];
 if(room.checkpoints&&!room.checkpoints.some(c=>c.id==='hub-guardian'))room.checkpoints.push({id:'hub-guardian',x:3000,y:1134,sector:2});
 room.upExit={x:2850,w:300,dest:'ridge'};
 room.hazards=[1190,2340].map((x,i)=>({id:`hub-abyss-${i}`,x,y:1100,w:100,h:360,type:'death',dest:null,label:'ABISMO MORTAL',color:'#ff8e86'}));
 room.orbs=[[390,910],[1110,675],[1440,665],[1850,665],[2260,835],[3120,515],[2820,275],[3780,905]];
 room.hint='Toca las flores con J si eres Kilo, o usa E junto al instrumento. La balsa cruza el claro; la flor ascensor sube al mirador.';
}
export function enterKiloGrove(g){
 if(g.roomId!=='hub'||(g.player?.id==='stitcho'&&g.personalAdventureSolo)){g.kiloGrove=null;return;}
 const lifts=[
  {axis:'x',x:1430,y:894,span:540,period:360},
  {axis:'y',x:2850,y:1054,span:960,period:480}
 ].map(m=>{m.start=Number(g.t)||0;const platform={x:m.x,y:m.y,w:m.axis==='y'?240:190,h:22,_campaignLift:true};g.platforms.push(platform);return {platform,motion:m};});
 g.kiloGrove={lifts,shrine:{x:980,y:1094},song:!!g.secrets?.hub?.includes(SONG),pulse:0,source:null};
 g.kiloGrove.fragile=g.platforms.filter(p=>p.h<40&&!p._campaignLift&&[690,2150,2490].includes(p.x)).map(p=>{p._crumbles=true;return {platform:p,age:0,restore:0,w:p.w,x:p.x};});
}
function near(g,range=140){const s=g.kiloGrove,p=g.player;return !!s&&!!p&&!p.dead&&Math.hypot(p.x+p.w/2-s.shrine.x,p.y+p.h/2-s.shrine.y)<range;}
function sing(g,source){
 const s=g.kiloGrove;if(!s)return false;
 s.pulse=100;s.source=source;
 if(!s.song){s.song=true;g.secrets||={};g.secrets.hub||=[];if(!g.secrets.hub.includes(SONG)){g.secrets.hub.push(SONG);g.score=(g.score||0)+300;g.player.xp=(g.player.xp||0)+12;g.save?.();}}
 g.nums?.add?.(s.shrine.x,s.shrine.y-70,source==='kilo'?'¡EL CLARO CANTA CONTIGO!':'¡MELODÍA DEL CLARO!','#ffe6a3',true);return true;
}
export function groveAbility(g,p,index){
 if(p.id!=='kilo'||![0,1].includes(index)||!near(g,280))return false;
 const s=g.kiloGrove;
 if(index===0&&(p.facing||1)*(s.shrine.x-(p.x+p.w/2))<0)return false;
 return sing(g,'kilo');
}
export function interactGrove(g){return near(g)?sing(g,'instrument'):false;}
export function grovePrompt(g){return near(g)?g.player.id==='kilo'?'J · canta al claro / E · ukelele':'E · toca el ukelele del claro':'';}
export function updateKiloGrove(g){
 const s=g.kiloGrove;if(!s)return;s.pulse=Math.max(0,s.pulse-1);
 for(const l of s.lifts)movePlatform(g,l.platform,l.motion);
 for(const f of s.fragile||[]){
  if(f.restore>0){if(--f.restore===0){f.platform.w=f.w;f.age=0;}continue;}
  const p=g.player,standing=p?.grounded&&Math.abs(p.y+p.h-f.platform.y)<4&&p.x+p.w>f.x&&p.x<f.x+f.w;
  if(standing||f.age>0)f.age++;
  if(f.age>=45){f.platform.w=0;f.restore=240;}
 }
 // The owner's song turns the flower into an updraft: an optional mastery shortcut.
 const p=g.player;
 if(s.song&&p?.id==='kilo'&&!p.grounded&&Math.abs(p.x+p.w/2-980)<55&&p.y>650&&p.y<1090&&p.vy>-.8&&!p._dropWasHeld){p.vy=-3.2;p._pmove='float';}
}
export function drawKiloGrove(ctx,g,cam,t){
 const s=g.kiloGrove;if(!s)return;
 for(const l of s.lifts)drawPlatformRail(ctx,l.platform,l.motion,cam);
 for(const f of s.fragile||[])if(!f.restore){ctx.save();ctx.strokeStyle=f.age?'#ffd36a':'#e9bdad';ctx.lineWidth=2;const x=f.x-cam.x,y=f.platform.y-cam.y;for(let i=0;i<3;i++){const xx=x+f.w*(i+1)/4;ctx.beginPath();ctx.moveTo(xx-4,y+3);ctx.lineTo(xx+3,y+10);ctx.lineTo(xx-3,y+19);ctx.stroke();}ctx.restore();}
 for(const xx of [3050,3750]){const x=xx-cam.x,y=1134-cam.y;ctx.save();ctx.fillStyle='#765544';ctx.fillRect(x-5,y-142,10,142);ctx.fillStyle='#e9b584';ctx.beginPath();ctx.ellipse(x,y-142,15,10,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#f2cc99';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y-125);ctx.lineTo(x+48,y-105);ctx.stroke();ctx.fillStyle='#bc6c80';ctx.beginPath();ctx.moveTo(x+8,y-121);ctx.lineTo(x+40,y-108);ctx.lineTo(x+12,y-84);ctx.closePath();ctx.fill();ctx.restore();}
 const x=s.shrine.x-cam.x,y=s.shrine.y-cam.y;
 ctx.save();ctx.strokeStyle='#665542';ctx.lineWidth=5;ctx.fillStyle='#ddbb77';ctx.beginPath();ctx.ellipse(x,y+15,27,18,-.3,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.fillStyle='#68513c';ctx.beginPath();ctx.arc(x,y+13,6,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(x+12,y+4);ctx.lineTo(x+37,y-35);ctx.stroke();
 if(s.song||s.pulse){ctx.strokeStyle='#ffe8a6';ctx.lineWidth=2;for(let i=0;i<4;i++){const yy=y-12-i*30,xx=x+Math.sin((g.reduceMotion?0:t)*.04+i)*24;ctx.beginPath();ctx.arc(xx,yy,4,0,Math.PI*2);ctx.stroke();}}
 ctx.font='600 12px sans-serif';ctx.textAlign='center';ctx.fillStyle='#ffefbf';ctx.fillText('EL UKELELE DEL CLARO',x,y+55);ctx.restore();
}
export function groveSnapshot(g){const s=g.kiloGrove;return s?{song:s.song,source:s.source,lifts:s.lifts.map(l=>({axis:l.motion.axis,x:l.platform.x,y:l.platform.y,w:l.platform.w,h:l.platform.h}))}:null;}

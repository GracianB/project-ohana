import {movePlatform,drawPlatformRail} from './moving-platforms.js';
const SONG='hub-aloha-song';
export function installKiloGrove(room){
 room.plats=[
  [0,1134,4200,126],[160,1054,250,22],[270,960,330,22],
  [690,880,260,22],[990,730,270,22],[1320,720,260,22],[1740,720,260,22],
  [2150,894,260,22],[2220,780,255,22],[2490,974,250,22],[2620,1054,220,22],
  [3180,814,260,22],[3000,574,260,22],[2720,334,260,22],[2850,14,300,22],[3650,960,260,22]
 ];
 room.upExit={x:2850,w:300,dest:'ridge'};
 room.orbs=[[390,910],[1110,675],[1440,665],[1850,665],[2260,835],[3120,515],[2820,275],[3780,905]];
 room.hint='Toca las flores con J si eres Kilo, o usa E junto al instrumento. La balsa cruza el claro; la flor ascensor sube al mirador.';
}
export function enterKiloGrove(g){
 if(g.roomId!=='hub'){g.kiloGrove=null;return;}
 const lifts=[
  {axis:'x',x:1430,y:894,span:540,period:420},
  {axis:'y',x:2850,y:1054,span:960,period:1080}
 ].map(m=>{m.start=Number(g.t)||0;const platform={x:m.x,y:m.y,w:m.axis==='y'?240:190,h:22,_campaignLift:true};g.platforms.push(platform);return {platform,motion:m};});
 g.kiloGrove={lifts,shrine:{x:980,y:1094},song:!!g.secrets?.hub?.includes(SONG),pulse:0,source:null};
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
 // The owner's song turns the flower into an updraft: an optional mastery shortcut.
 const p=g.player;
 if(s.song&&p?.id==='kilo'&&!p.grounded&&Math.abs(p.x+p.w/2-980)<55&&p.y>650&&p.y<1090&&p.vy>-.8&&!p._dropWasHeld){p.vy=-3.2;p._pmove='float';}
}
export function drawKiloGrove(ctx,g,cam,t){
 const s=g.kiloGrove;if(!s)return;
 for(const l of s.lifts)drawPlatformRail(ctx,l.platform,l.motion,cam);
 const x=s.shrine.x-cam.x,y=s.shrine.y-cam.y;
 ctx.save();ctx.strokeStyle='#665542';ctx.lineWidth=5;ctx.fillStyle='#ddbb77';ctx.beginPath();ctx.ellipse(x,y+15,27,18,-.3,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.fillStyle='#68513c';ctx.beginPath();ctx.arc(x,y+13,6,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(x+12,y+4);ctx.lineTo(x+37,y-35);ctx.stroke();
 if(s.song||s.pulse){ctx.strokeStyle='#ffe8a6';ctx.lineWidth=2;for(let i=0;i<4;i++){const yy=y-12-i*30,xx=x+Math.sin((g.reduceMotion?0:t)*.04+i)*24;ctx.beginPath();ctx.arc(xx,yy,4,0,Math.PI*2);ctx.stroke();}}
 ctx.font='600 12px sans-serif';ctx.textAlign='center';ctx.fillStyle='#ffefbf';ctx.fillText('EL UKELELE DEL CLARO',x,y+55);ctx.restore();
}
export function groveSnapshot(g){const s=g.kiloGrove;return s?{song:s.song,source:s.source,lifts:s.lifts.map(l=>({axis:l.motion.axis,x:l.platform.x,y:l.platform.y,w:l.platform.w,h:l.platform.h}))}:null;}

import {tidyPlatforms} from "./platform-layout.js";
export function enterCampaignExploration(g){
 const r=g.roomDef;if(!r||r.boss){g.campaignExploration=null;return;}
 const branches=[1,3].filter(i=>i<r.sectors.length).map((n,i)=>{
  const s=r.sectors[n],x=s.x+620;
  for(let j=0;j<3;j++)g.platforms.push({x:x+j*140,y:734-j*80,w:260,h:22});
  const platform={x:x+80,y:974,w:170,h:22,_campaignLift:true};g.platforms.push(platform);
  return {id:`${r.id}-secret-${i}`,x:x+390,y:540,platform,baseY:974,phase:i*Math.PI,found:false};
 });
 g.platforms=tidyPlatforms(g.platforms);
 g.campaignExploration={branches,shortcut:false};
}
export function updateCampaignExploration(g){
 const state=g.campaignExploration,p=g.player,r=g.roomDef;if(!state||!p||p.dead)return;
 const t=Number(g.t)||0;
 for(const b of state.branches){
  const pl=b.platform,old=pl.y;pl.y=b.baseY-Math.max(0,Math.sin(t*.012+b.phase))*220;
  if(p.grounded&&p.x+p.w>pl.x&&p.x<pl.x+pl.w&&Math.abs(p.y+p.h-old)<3)p.y+=pl.y-old;
  g.secrets||={};const found=g.secrets[r.id]||=[];b.found=found.includes(b.id);
  if(!b.found&&Math.hypot(p.x+p.w/2-b.x,p.y+p.h/2-b.y)<55){
   found.push(b.id);b.found=true;g.score=(g.score||0)+450;p.xp=(p.xp||0)+18;g.nums?.add?.(b.x,b.y-30,'SECRETO · +450','#fff1a6',true);g.save?.();
  }
 }
 // Reaching the far side opens a permanent high return route for this run/save.
 const key=`${r.id}-shortcut`;
 if(p.x>r.width-240&&!state.shortcut){const found=g.secrets[r.id]||=[];if(!found.includes(key))found.push(key);}
 if(!state.shortcut&&g.secrets?.[r.id]?.includes(key)){
  state.shortcut=true;for(let x=3500;x<r.width-250;x+=340)g.platforms.push({x,y:654,w:300,h:22,_campaignReturn:true});
  for(let y=1054;y>=654;y-=80)g.platforms.push({x:r.width-400,y,w:240,h:22,_campaignReturn:true});
  g.platforms=tidyPlatforms(g.platforms);
  g.nums?.add?.(p.x,p.y-40,'ATAJO DEL REGRESO ABIERTO','#a9ffe6',true);g.save?.();
 }
}
export function drawCampaignExploration(ctx,g,cam,t){
 const s=g.campaignExploration;if(!s)return;ctx.save();
 for(const b of s.branches){const x=b.x-cam.x,y=b.y-cam.y;if(b.found||x<-40||x>1600)continue;
  ctx.fillStyle='#ffe7a7';ctx.strokeStyle='#fff8d5';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y-17);ctx.lineTo(x+12,y);ctx.lineTo(x,y+17);ctx.lineTo(x-12,y);ctx.closePath();ctx.fill();ctx.stroke();
  if(!g.reduceMotion){ctx.globalAlpha=.3;ctx.beginPath();ctx.arc(x,y,24+Math.sin(t*.07)*4,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
 }
 const sector=g.roomDef.sectors.find(z=>g.player.x>=z.x&&g.player.x<z.x+z.w);
 if(sector){ctx.fillStyle='#e9f5dcb3';ctx.font='600 13px sans-serif';ctx.textAlign='left';ctx.fillText(sector.name,22,Math.max(35,(g.viewH||720)-24));}
 ctx.restore();
}

import {healPlayer} from './mutations.js';
const MECHANISMS=Object.freeze({
 hub:{glyph:'✦',name:'Farol familiar',color:'#ffedac',action:'glide'},
 beach:{glyph:'≈',name:'Marea saltarina',color:'#8beeff',action:'tide'},
 jungle:{glyph:'❧',name:'Liana del dosel',color:'#bafa8b',action:'vine'},
 cave:{glyph:'◇',name:'Cristal resonante',color:'#b4b5ff',action:'crystal'},
 lab:{glyph:'⇥',name:'Carril magnético',color:'#8fffea',action:'rail'},
 ridge:{glyph:'↟',name:'Corriente de altura',color:'#ecf8ff',action:'wind'},
 space:{glyph:'✧',name:'Impulso orbital',color:'#dec5ff',action:'orbit'},
 reef:{glyph:'○',name:'Burbuja de coral',color:'#ffaedd',action:'bubble'},
 volcano:{glyph:'♨',name:'Respiradero ancestral',color:'#ffbf86',action:'vent'}
});
export function mechanismForBiome(roomId){return MECHANISMS[roomId]||null;}
export function triggerBiomeMechanism(g,m){
 const p=g?.player;if(!p||p.dead||!m||m.cd>0)return false;
 const factor=Math.sign(p.facing||1)||1;
 m.cd=420;m.used=(m.used||0)+1;m.flash=28;
 switch(m.action){
  case 'tide':p.vx=factor*Math.max(10,Math.abs(p.vx||0));p.vy=-Math.max(11,p.jumpPower||11);break;
  case 'vine':p.vy=-Math.max(16,p.jumpPower||11);p.vx*=.7;break;
  case 'crystal':healPlayer(p,Math.min(10,4+(p.evo||0)*2));p.vy=-Math.max(10,p.jumpPower||10);break;
  case 'rail':p.vx=factor*15;p.invuln=Math.max(p.invuln||0,12);p.vy=-5;break;
  case 'wind':p.vy=-17;p.vx=factor*5;break;
  case 'orbit':p.vy=-13;p.vx=factor*9;break;
  case 'bubble':healPlayer(p,5);p.vy=-14;break;
  case 'vent':p.vy=-16;p.jumps=0;break;
  default:p.vy=-10;
 }
 p.grounded=false;
 g.fx?.emit?.(m.x,m.y-18,{color:m.color,count:g.reduceMotion?3:11,size:3,speed:2.6,life:18});
 g.nums?.add?.(m.x,m.y-43,m.name.toUpperCase(),m.color,false);
 return true;
}
export function enterCampaignExploration(g){
 const r=g.roomDef;if(!r||r.boss){g.campaignExploration=null;return;}
 const branches=[1,3].filter(i=>i<r.sectors.length).map((n,i)=>{
  const s=r.sectors[n],x=s.x+620;
  for(let j=0;j<3;j++)g.platforms.push({x:x+j*140,y:734-j*80,w:260,h:22});
  const platform={x:x+80,y:974,w:170,h:22,_campaignLift:true};g.platforms.push(platform);
  return {id:`${r.id}-secret-${i}`,x:x+390,y:540,platform,baseY:974,phase:i*Math.PI,found:false};
 });
 const def=mechanismForBiome(r.id);
 const mechanisms=def?(r.sectors.length===3?[0,1]:[1,3]).filter(n=>n<r.sectors.length).map((n,i)=>{
  const sector=r.sectors[n],x=sector.x+Math.min(sector.w-140,sector.w*.58);
  const floor=(g.platforms||[]).filter(pl=>pl.h>40&&x>=pl.x+30&&x<=pl.x+pl.w-30).sort((a,b)=>b.y-a.y)[0];
  return floor?{...def,id:r.id+'-mechanism-'+i,x,y:floor.y,cd:0,flash:0,used:0}:null;
 }).filter(Boolean):[];
 g.campaignExploration={branches,shortcut:false,mechanisms};
}
export function updateCampaignExploration(g){
 const state=g.campaignExploration,p=g.player,r=g.roomDef;if(!state||!p||p.dead)return;
 const t=Number(g.t)||0;
 for(const m of state.mechanisms||[]){
  m.cd=Math.max(0,m.cd-1);m.flash=Math.max(0,m.flash-1);
  const mid=p.x+p.w/2,feet=p.y+p.h;
  if(p.grounded&&Math.abs(mid-m.x)<45&&Math.abs(feet-m.y)<12&&m.cd===0)
   triggerBiomeMechanism(g,m);
 }
 for(const b of state.branches){
  const pl=b.platform,old=pl.y;pl.y=b.baseY-Math.max(0,Math.sin(t*.012+b.phase))*220;
  if(p.grounded&&p.x+p.w>pl.x&&p.x<pl.x+pl.w&&Math.abs(p.y+p.h-old)<3)p.y+=pl.y-old;
  g.secrets||={};const found=(g.secrets[r.id]||=[]);b.found=found.includes(b.id);
  if(!b.found&&Math.hypot(p.x+p.w/2-b.x,p.y+p.h/2-b.y)<55){
   found.push(b.id);b.found=true;g.score=(g.score||0)+450;p.xp=(p.xp||0)+18;g.nums?.add?.(b.x,b.y-30,'SECRETO · +450','#fff1a6',true);g.save?.();
  }
 }
 // Reaching the far side opens a permanent high return route for this run/save.
 const key=`${r.id}-shortcut`;
 if(p.x>r.width-240&&!state.shortcut){g.secrets||={};const found=(g.secrets[r.id]||=[]);if(!found.includes(key))found.push(key);}
 if(!state.shortcut&&g.secrets?.[r.id]?.includes(key)){
  state.shortcut=true;for(let x=3500;x<r.width-250;x+=340)g.platforms.push({x,y:654,w:300,h:22,_campaignReturn:true});
  for(let y=1054;y>=654;y-=80)g.platforms.push({x:r.width-400,y,w:240,h:22,_campaignReturn:true});
  g.nums?.add?.(p.x,p.y-40,'ATAJO DEL REGRESO ABIERTO','#a9ffe6',true);g.save?.();
 }
}
export function drawCampaignExploration(ctx,g,cam,t){
 const s=g.campaignExploration;if(!s)return;ctx.save();
 for(const m of s.mechanisms||[]){
  const x=m.x-cam.x,y=m.y-cam.y;if(x<-90||x>(g.viewW||1280)+90)continue;
  const pulse=g.reduceMotion?0:Math.sin(t*.08)*3;
  ctx.save();ctx.globalAlpha=m.cd?.48:1;
  ctx.fillStyle=m.color;ctx.strokeStyle='#26485c';ctx.lineWidth=3;
  ctx.beginPath();ctx.arc(x,y-18-pulse,20,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.fillStyle='#193649';ctx.font='900 22px sans-serif';ctx.textAlign='center';
  ctx.fillText(m.glyph,x,y-10-pulse);
  ctx.fillStyle='#edf3de';ctx.font='700 11px sans-serif';
  ctx.fillText(m.name,x,y-55);ctx.restore();
 }
 for(const b of s.branches){const x=b.x-cam.x,y=b.y-cam.y;if(b.found||x<-40||x>1600)continue;
  ctx.fillStyle='#ffe7a7';ctx.strokeStyle='#fff8d5';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y-17);ctx.lineTo(x+12,y);ctx.lineTo(x,y+17);ctx.lineTo(x-12,y);ctx.closePath();ctx.fill();ctx.stroke();
  if(!g.reduceMotion){ctx.globalAlpha=.3;ctx.beginPath();ctx.arc(x,y,24+Math.sin(t*.07)*4,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
 }
 const sector=g.roomDef.sectors.find(z=>g.player.x>=z.x&&g.player.x<z.x+z.w);
 if(sector){ctx.fillStyle='#e9f5dcb3';ctx.font='600 13px sans-serif';ctx.textAlign='left';ctx.fillText(sector.name,22,Math.max(35,(g.viewH||720)-24));}
 ctx.restore();
}

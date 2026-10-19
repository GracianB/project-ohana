export const CAMPAIGN_ROLES=Object.freeze(['pursuer','shield','shooter','jumper','flyer','burrower','gunner','captain']);
const cx=e=>e.x+e.w/2,cy=e=>e.y+e.h/2;
export function campaignRole(room,index){return CAMPAIGN_ROLES[(index+['beach','jungle','cave','lab','ridge','space','reef','volcano'].indexOf(room)*3+24)%8];}
export function updateCampaignEnemy(e,g,hurt){
 if(!e.campaignRole)return false;
 const p=g.player,role=e.campaignRole;if(!p||p.dead)return true;
 const dx=cx(p)-cx(e),dy=cy(p)-cy(e),dir=Math.sign(dx)||1,dist=Math.hypot(dx,dy),a=e._campaign||={age:0,wind:0,cd:40,active:0,aim:1};a.age++;
 const visible=e.x+e.w>g.cam.x&&e.x<g.cam.x+(g.viewW||1000)&&e.y+e.h>g.cam.y&&e.y<g.cam.y+(g.viewH||720);
 if(!visible&&dist>1100){e.vx=0;return true;}
 const variant=e.roomPersona?.variant||0,pace=[.85,1,1.12,.95][variant%4],reach=[1,.85,1.15,1.05][variant%4];
 const shoot=(vx,vy,damage=12)=>{if(g.projectiles.length<160)g.projectiles.push({x:cx(e),y:cy(e),vx,vy,w:12,h:12,life:140,dmg:damage,owner:'enemy',color:e.elite?'#ffb882':'#ef9db1'});};
 if(e.sleep>0||e.stun>5){e.sleep=Math.max(0,(e.sleep||0)-1);a.wind=0;a.active=0;e.telegraph=false;e.vx=0;}
 else if(a.wind>0){
  a.wind--;e.telegraph=true;e.vx*=.7;
  if(!a.wind){e.telegraph=false;a.active=24;a.cd=role==='captain'?130:85;
   if(role==='shooter')shoot(a.aim*5,-.3);
   if(role==='gunner'){shoot(a.aim*3,-5);shoot(a.aim*4.5,-2.5);}
   if(role==='jumper'){e.vy=-10;e.vx=a.aim*6;e.grounded=false;}
   if(role==='flyer'){e.vx=a.aim*8;e.vy=Math.max(-5,Math.min(6,a.dy*.045));}
   if(role==='burrower'){e.vx=a.aim*10;e.vy=-5;}
   if(role==='pursuer'||role==='shield')e.vx=a.aim*(role==='shield'?6:8)*pace;
   if(role==='captain')for(const ally of g.enemies)if(ally!==e&&!ally.boss&&Math.hypot(cx(ally)-cx(e),cy(ally)-cy(e))<400)ally.aggro=100;
  }
 }else if(a.active>0){a.active--;if(role==='captain'||role==='shooter'||role==='gunner')e.vx*=.8;}
 else{
  a.cd--;e.telegraph=false;
  const range=['shooter','gunner','captain'].includes(role)?300:role==='flyer'?230:role==='jumper'?170:90;
  e.vx=dist<650?dir*(Math.abs(dx)>range*reach?2.2*pace:Math.abs(dx)<range*.6?-pace:0):0;
  if(role==='shield')e.vx*=.6;
  if(visible&&dist<650&&Math.abs(dy)<280&&e.aiAttackPermit!==false&&a.cd<=0){a.wind=(role==='gunner'?52:role==='burrower'?46:36)+variant*4;a.aim=dir;a.dy=dy;e.telegraph=true;g.fx?.emit?.(cx(e),e.y,{color:'#fff1b5',count:3,size:2,life:12});}
 }
 e._shieldFacing=role==='shield'&&!a.active&&!a.wind?dir:0;
 const flying=role==='flyer',oldFeet=e.y+e.h;
 if(flying){if(!a.active)e.vy=Math.max(-2,Math.min(2,(p.y-80-e.y)*.02));}
 else e.vy=Math.min(14,(e.vy||0)+.5);
 e.x+=e.vx||0;e.y+=e.vy||0;e.grounded=false;
 if(!flying&&e.vy>=0)for(const floor of g.platforms)if(e.x+e.w>floor.x&&e.x<floor.x+floor.w&&oldFeet<=floor.y+2&&e.y+e.h>=floor.y){e.y=floor.y-e.h;e.vy=0;e.grounded=true;break;}
 e.x=Math.max(0,Math.min(g.worldW-e.w,e.x));if(e.y>g.worldH+100){e.hp=0;e.fell=true;}
 if(a.active>0&&Math.abs(cx(p)-cx(e))<(p.w+e.w)/2&&Math.abs(cy(p)-cy(e))<(p.h+e.h)/2)hurt(e.elite?18:12,'¡EMBOSCADA!');
 return true;
}
export function drawCampaignEnemy(ctx,e,cam){
 if(!e.campaignRole)return;const x=cx(e)-cam.x,y=e.y-cam.y-12;ctx.save();ctx.fillStyle=e.elite?'#ffd69c':'#dcf1e7';ctx.strokeStyle='#243e52';ctx.lineWidth=2;ctx.font='bold 13px sans-serif';ctx.textAlign='center';
 const glyph={pursuer:'»',shield:'▰',shooter:'↗',jumper:'↑',flyer:'⌁',burrower:'⇡',gunner:'✹',captain:'⚑'}[e.campaignRole];ctx.fillText(glyph,x,y);
 if(e.roomPersona){ctx.strokeStyle=e.roomPersona.color;ctx.lineWidth=3;for(let i=0;i<=e.roomPersona.variant;i++){ctx.beginPath();ctx.moveTo(x-8+i*5,y+6);ctx.lineTo(x-6+i*5,y+10);ctx.stroke();}if(e.telegraph){ctx.fillStyle=e.roomPersona.color;ctx.font='bold 10px sans-serif';ctx.fillText(e.roomPersona.name,x,y-15);}}
 if(e.telegraph){const a=e._campaign,dir=a?.aim||1;ctx.strokeStyle='#ffe9a8';ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(x,y+e.h/2+12);ctx.lineTo(x+dir*150,y+e.h/2+12);ctx.stroke();}
 if(e._shieldFacing){ctx.strokeStyle='#b6edff';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x+e._shieldFacing*e.w*.6,y+18);ctx.lineTo(x+e._shieldFacing*e.w*.6,y+e.h+8);ctx.stroke();}ctx.restore();
}

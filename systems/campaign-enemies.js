export const CAMPAIGN_ROLES=Object.freeze(['pursuer','shield','shooter','jumper','flyer','burrower','gunner','captain']);
// World-space aimed volleys retain the full enemy windup and never home in
// after firing. Gunners produce a dodgeable fan; shooters lead moving heroes.
export function campaignVolley(role,foe,hero,elite=false){
 const lead=Math.max(-90,Math.min(90,(hero.vx||0)*15));
 const dx=hero.x+hero.w/2+lead-(foe.x+foe.w/2),dy=hero.y+hero.h/2-(foe.y+foe.h/2);
 const aim=Math.atan2(dy,dx),angles=role==='gunner'?[-.22,0,.22]:elite?[-.09,.09]:[0],speed=role==='gunner'?5:5.8;
 return angles.map(offset=>({vx:Math.cos(aim+offset)*speed,vy:Math.sin(aim+offset)*speed}));
}
const cx=e=>e.x+e.w/2,cy=e=>e.y+e.h/2;
// A shield only protects its front, and stops protecting when attacking.
export function shieldBlocksHit(e,p){
 if(!e||!p||e.campaignRole!=='shield'||!e._shieldFacing||e.hp<=0||e.dying)return false;
 const side=cx(p)-cx(e),level=Math.abs(cy(p)-cy(e));
 return side*e._shieldFacing>0&&level<e.h+Math.max(30,p.h*.5);
}
export function campaignRole(room,index){return CAMPAIGN_ROLES[(index+['beach','jungle','cave','lab','ridge','space','reef','volcano'].indexOf(room)*3+24)%8];}
export function updateCampaignEnemy(e,g,hurt){
 if(!e.campaignRole)return false;
 if(e.invuln>0)e.invuln--;
 const p=g.player,role=e.campaignRole;if(!p||p.dead)return true;
 const dx=cx(p)-cx(e),dy=cy(p)-cy(e),dir=Math.sign(dx)||1,dist=Math.hypot(dx,dy),a=e._campaign||={age:0,wind:0,cd:40,active:0,aim:1};a.age++;
 e._shieldImpact=Math.max(0,(e._shieldImpact||0)-1);
 const visible=e.x+e.w>g.cam.x&&e.x<g.cam.x+(g.viewW||1000)&&e.y+e.h>g.cam.y&&e.y<g.cam.y+(g.viewH||720);
 if(!visible&&dist>1100){e.vx=0;return true;}
 const variant=e.roomPersona?.variant||0,pace=[.85,1,1.12,.95][variant%4],reach=[1,.85,1.15,1.05][variant%4];
 // Feed the articulated creature rigs the actual combat state, not a cosmetic clock.
 e.wind=a.wind;e.lunge=a.active;e.hopWind=role==='jumper'?a.wind:0;
 if(e.kind==='planta'){e.up=true;e.plantWind=a.wind;e.shoot=a.active?24:0;}
 if(role==='flyer')e.diving=a.active>0;
 const shoot=(vx,vy,damage=12)=>{if(g.projectiles.length<160)g.projectiles.push({x:cx(e),y:cy(e),vx,vy,w:12,h:12,life:140,dmg:damage,owner:'enemy',color:e.elite?'#ffb882':'#ef9db1'});};
 if(e.sleep>0||e.stun>5){e.sleep=Math.max(0,(e.sleep||0)-1);a.wind=0;a.active=0;a.volley=null;e.telegraph=false;e.vx=0;}
 else if(a.wind>0){
  a.wind--;e.telegraph=true;e.vx*=.7;
  if(!a.wind){e.telegraph=false;a.active=24;a.cd=role==='captain'?130:85;
   if(role==='shooter'||role==='gunner'){
    for(const bolt of a.volley||campaignVolley(role,e,p,!!e.elite))shoot(bolt.vx,bolt.vy,e.elite?15:12);
    a.volley=null;
   }
   if(role==='jumper'){e.vy=-10;e.vx=a.aim*6;e.grounded=false;}
   if(e.roomPersona?.special&&e.kind==='cangrejo'){shoot(a.aim*4,0,14);e.vx=0;e.vy=0;}
   if(role==='flyer'){e.vx=a.aim*8;e.vy=Math.max(-5,Math.min(6,a.dy*.045));}
   if(role==='burrower'){e.vx=a.aim*10;e.vy=-5;}
   if(role==='pursuer'||role==='shield')e.vx=a.aim*(role==='shield'?6:8);
   if(role==='captain'){
    for(const ally of g.enemies)if(ally!==e&&!ally.boss&&Math.hypot(cx(ally)-cx(e),cy(ally)-cy(e))<450)
     ally.aggro=Math.max(ally.aggro||0,100);
    g.fx?.emit?.(cx(e),cy(e),{color:'#ffd598',count:8,size:3,life:22});
   }
  }
 }else if(a.active>0){a.active--;if(role==='captain'||role==='shooter'||role==='gunner')e.vx*=.8;}
 else{
  a.cd--;e.telegraph=false;
  const range=['shooter','gunner','captain'].includes(role)?300:role==='flyer'?230:role==='jumper'?170:90;
  e.vx=dist<650?dir*(Math.abs(dx)>range*reach?2.2*pace:Math.abs(dx)<range*.6?-pace:0):0;
  if(role==='shield')e.vx*=.6;
  if(visible&&dist<690&&Math.abs(dy)<320&&e.aiAttackPermit!==false&&a.cd<=0){a.wind=role==='gunner'?54:role==='burrower'?46:role==='shooter'?42:36;a.aim=dir;a.dy=dy;
    a.volley=['shooter','gunner'].includes(role)?campaignVolley(role,e,p,!!e.elite):null;
    e.telegraph=true;g.fx?.emit?.(cx(e),e.y,{color:'#fff1b5',count:3,size:2,life:12});}
 }
 e._shieldFacing=role==='shield'&&!a.active&&!a.wind?dir:0;
 const flying=role==='flyer',oldFeet=e.y+e.h;
 if(flying){if(!a.active)e.vy=Math.max(-2,Math.min(2,(p.y-80-e.y)*.02));}
 else e.vy=Math.min(14,(e.vy||0)+.5);
 e.x+=e.vx||0;e.y+=e.vy||0;e.grounded=false;
 if(!flying&&e.vy>=0)for(const floor of g.platforms)if(e.x+e.w>floor.x&&e.x<floor.x+floor.w&&oldFeet<=floor.y+2&&e.y+e.h>=floor.y){e.y=floor.y-e.h;e.vy=0;e.grounded=true;break;}
 const band=flying?e.roomPersona?.flightBand:null;
 if(band){e.y=Math.max(band.top,Math.min(band.bottom-e.h,e.y));if((e.y===band.top&&e.vy<0)||(e.y===band.bottom-e.h&&e.vy>0))e.vy=0;}
 e.x=Math.max(0,Math.min(g.worldW-e.w,e.x));if(e.y>g.worldH+100){e.hp=0;e.fell=true;}
 if(a.active>0&&Math.abs(cx(p)-cx(e))<(p.w+e.w)/2&&Math.abs(cy(p)-cy(e))<(p.h+e.h)/2)hurt(e.elite?18:12,'¡EMBOSCADA!');
 return true;
}
export function drawCampaignEnemy(ctx,e,cam){
 if(!e.campaignRole)return;const x=cx(e)-cam.x,y=e.y-cam.y-12;ctx.save();ctx.fillStyle=e.elite?'#ffd69c':'#dcf1e7';ctx.strokeStyle='#243e52';ctx.lineWidth=2;ctx.font='bold 13px sans-serif';ctx.textAlign='center';
 const glyph={pursuer:'»',shield:'▰',shooter:'↗',jumper:'↑',flyer:'⌁',burrower:'⇡',gunner:'✹',captain:'⚑'}[e.campaignRole];ctx.fillText(glyph,x,y);
 if(e.roomPersona?.special){ctx.fillStyle=e.roomPersona.color;ctx.font='bold 12px sans-serif';ctx.fillText(e.roomPersona.name,x,y-15);}
 if(e.telegraph){const a=e._campaign,dir=a?.aim||1;ctx.strokeStyle='#ffe9a8';ctx.setLineDash([5,5]);
  const rays=a?.volley?.length?a.volley:[{vx:dir,vy:0}];
  for(const ray of rays){const length=Math.hypot(ray.vx,ray.vy)||1;
   ctx.beginPath();ctx.moveTo(x,y+e.h/2+12);
   ctx.lineTo(x+ray.vx/length*220,y+e.h/2+12+ray.vy/length*220);ctx.stroke();}
  ctx.setLineDash([]);
 }
 if(e._shieldFacing){ctx.strokeStyle=e._shieldImpact>0?'#fff9d7':'#b6edff';ctx.lineWidth=e._shieldImpact>0?8:5;
  ctx.beginPath();ctx.moveTo(x+e._shieldFacing*e.w*.6,y+18);ctx.lineTo(x+e._shieldFacing*e.w*.6,y+e.h+8);ctx.stroke();
 }ctx.restore();
}

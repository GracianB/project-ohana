import {readCombatDifficulty} from './combat-difficulty.js';
export const CAMPAIGN_ROLES=Object.freeze(['pursuer','shield','shooter','jumper','flyer','burrower','gunner','captain']);
// World-space aimed volleys retain the full enemy windup and never home in
// after firing. Gunners produce a dodgeable fan; shooters lead moving heroes.
export function campaignVolley(role,foe,hero,elite=false,profile=readCombatDifficulty()){
 const distance=Math.hypot(hero.x-foe.x,hero.y-foe.y);
 const anticipation=Math.min(profile.lead*2.5,distance/5.8*.6);
 const lead=Math.max(-180,Math.min(180,(hero.vx||0)*anticipation));
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
 // Growing creatures retain their support point when their hitbox changes.
 if(g.roomDef?.composition&&e.grounded){const foot=e.y+e.h,support=(g.platforms||[]).find(pl=>e.x+e.w>pl.x&&e.x<pl.x+pl.w&&Math.abs(foot-pl.y)<14);if(support)e.y=support.y-e.h;}
 const p=g.player,role=e.campaignRole;if(!p||p.dead)return true;
 const dx=cx(p)-cx(e),dy=cy(p)-cy(e),dir=Math.sign(dx)||1,dist=Math.hypot(dx,dy),a=e._campaign||={age:0,wind:0,cd:40,active:0,aim:1};a.age++;
 e._guardBreak=Math.max(0,(e._guardBreak||0)-1);
 e._shieldImpact=Math.max(0,(e._shieldImpact||0)-1);
 const visible=e.x+e.w>g.cam.x&&e.x<g.cam.x+(g.viewW||1000)&&e.y+e.h>g.cam.y&&e.y<g.cam.y+(g.viewH||720);
 if(!visible&&dist>1100){e.vx=0;return true;}
 const difficulty=g.combatDifficulty||readCombatDifficulty();
 const variant=e.roomPersona?.variant||0,pace=[.85,1,1.12,.95][variant%4],reach=[1,.85,1.15,1.05][variant%4];
 // Feed the articulated creature rigs the actual combat state, not a cosmetic clock.
 e.wind=a.wind;e.lunge=a.active;e.hopWind=role==='jumper'?a.wind:0;
 if(e.kind==='planta'){e.up=true;e.plantWind=a.wind;e.shoot=a.active?24:0;}
 if(role==='flyer')e.diving=a.active>0;
 const shoot=(vx,vy,damage=12)=>{if(g.projectiles.length<160)g.projectiles.push({x:cx(e),y:cy(e),vx,vy,w:12,h:12,life:140,dmg:damage,owner:'enemy',color:e.elite?'#ffb882':'#ef9db1'});};
 if(e.sleep>0||e.stun>5){e.sleep=Math.max(0,(e.sleep||0)-1);a.wind=0;a.active=0;a.volley=null;e.telegraph=false;e.vx=0;}
 else if(a.wind>0){
  a.wind--;e.telegraph=true;e.vx*=.7;
  if(!a.wind){e.telegraph=false;a.active=24;a.cd=Math.round((role==='captain'?130:85)*difficulty.cooldown);
   if(role==='shooter'||role==='gunner'){
    for(const bolt of a.volley||campaignVolley(role,e,p,!!e.elite,difficulty))shoot(bolt.vx,bolt.vy,e.elite?15:12);
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
  if(e.aiIntent==='RETREAT')e.vx=-dir*2.4*pace;
  else if(e.aiIntent==='FLANK'){
   const target=cx(p)+(e.aiFlankDir||-dir)*Math.max(110,range*.8);
   e.vx=Math.abs(target-cx(e))>35?Math.sign(target-cx(e))*2.6*pace:0;
  }else if(e.aiIntent==='HOLD')e.vx*=.45;
  e.vx*=difficulty.pace;
  if(role==='shield')e.vx*=.6;
  const attackRange={pursuer:180,shield:155,jumper:280,burrower:310,flyer:460,shooter:690,gunner:690,captain:440}[role]||180;
  const verticalRange=['pursuer','shield'].includes(role)?100:320;
  if(visible&&dist<attackRange&&Math.abs(dy)<verticalRange&&e.aiAttackPermit!==false&&a.cd<=0){a.wind=Math.round((role==='gunner'?54:role==='burrower'?46:role==='shooter'?42:36)*difficulty.windup);a.aim=dir;a.dy=dy;
    a.volley=['shooter','gunner'].includes(role)?campaignVolley(role,e,p,!!e.elite,difficulty):null;
    e.telegraph=true;g.fx?.emit?.(cx(e),e.y,{color:'#fff1b5',count:3,size:2,life:12});}
 }
 e._shieldFacing=role==='shield'&&!a.active&&!a.wind&&!e._guardBreak?dir:0;
 const flying=role==='flyer',oldFeet=e.y+e.h;
 if(flying){if(!a.active)e.vy=Math.max(-2,Math.min(2,(p.y-(e.aiAirPressure>.45?130:80)-e.y)*.02));}
 else e.vy=Math.min(14,(e.vy||0)+.5);
 // Raised chapter banks are real solids for creatures as well as the hero.
 // Ground creatures stop at a face and can make a short hop; they never sink
 // into a bank and die underneath the level.
 let nextX=e.x+(e.vx||0);
 if(!flying&&g.roomDef?.composition)for(const wall of g.platforms||[]){
  if(wall.h<=40||oldFeet<=wall.y+2||e.y>=wall.y+wall.h||nextX+e.w<=wall.x||nextX>=wall.x+wall.w)continue;
  nextX=e.x+e.w/2<wall.x+wall.w/2?wall.x-e.w:wall.x+wall.w;
  if(e.grounded&&!a.wind&&!a.active&&!(e.sleep>0)&&!(e.stun>5)){e.vy=-9;e.grounded=false;}
  e.vx=0;break;
 }
 e.x=nextX;e.y+=e.vy||0;e.grounded=false;
 if(!flying&&e.vy>=0)for(const floor of g.platforms)if(e.x+e.w>floor.x&&e.x<floor.x+floor.w&&oldFeet<=floor.y+2&&e.y+e.h>=floor.y){e.y=floor.y-e.h;e.vy=0;e.grounded=true;break;}
 const band=flying?e.roomPersona?.flightBand:null;
 if(band){e.y=Math.max(band.top,Math.min(band.bottom-e.h,e.y));if((e.y===band.top&&e.vy<0)||(e.y===band.bottom-e.h&&e.vy>0))e.vy=0;}
 e.x=Math.max(0,Math.min(g.worldW-e.w,e.x));if(e.y>g.worldH+100){e.hp=0;e.fell=true;}

 return true;
}
export function drawCampaignEnemy(ctx,e,cam){
 if(!e.campaignRole)return;const x=cx(e)-cam.x,y=e.y-cam.y-12;ctx.save();ctx.fillStyle=e.elite?'#ffd69c':'#dcf1e7';ctx.strokeStyle='#243e52';ctx.lineWidth=2;ctx.font='bold 13px sans-serif';ctx.textAlign='center';
 const room=String(e.roomId||'').replace('w1-','');
 const palette={kilo:'#a8d38b',stitcho:'#8cd5ed',chispin:'#f7d483',cat:'#deb1ed',cuerno:'#e5b9d5',dragon:'#ed9e76',dino:'#b0c991',frita:'#f2c277',pizza:'#e88d78',yomi:'#94dfd3'};
 const trim=palette[room]||'#acd3dd',bodyY=e.y-cam.y,face=e._campaign?.aim||Math.sign(e.vx)||1;
 ctx.lineCap='round';ctx.lineJoin='round';
 // Equipment is attached to the creature, not a floating debug-role glyph.
 if(['shooter','gunner'].includes(e.campaignRole)){
  const wx=x+face*e.w*.45,wy=bodyY+e.h*.47;
  ctx.strokeStyle='#354654';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(wx-face*8,wy+6);ctx.lineTo(wx+face*14,wy-2);ctx.stroke();
  ctx.strokeStyle=trim;ctx.lineWidth=3;ctx.stroke();
  for(let k=0;k<(e.campaignRole==='gunner'?2:1);k++){
   ctx.fillStyle=trim;ctx.strokeStyle='#354654';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(wx+face*13,wy-2+k*7,8,5,-face*.2,0,Math.PI*2);ctx.fill();ctx.stroke();
   ctx.fillStyle='#263f50';ctx.beginPath();ctx.ellipse(wx+face*18,wy-2+k*7,2,3,0,0,Math.PI*2);ctx.fill();
  }
 }
 if(e.campaignRole==='captain'){
  ctx.strokeStyle='#50616a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-e.w*.45,bodyY+e.h*.7);ctx.lineTo(x-e.w*.45,bodyY-16);ctx.stroke();
  ctx.fillStyle=trim;ctx.beginPath();ctx.moveTo(x-e.w*.45,bodyY-16);ctx.quadraticCurveTo(x+4,bodyY-20,x+16,bodyY-10);ctx.lineTo(x+6,bodyY-3);ctx.lineTo(x-e.w*.45,bodyY-6);ctx.fill();
 }

 if(e.roomPersona?.special){ctx.fillStyle=e.roomPersona.color;ctx.font='bold 12px sans-serif';ctx.fillText(e.roomPersona.name,x,y-15);}
 // Anticipation belongs to the creature: planted feet, gathering energy at
 // its weapon, and a compact floor shadow. No world-spanning aiming rays.
 if(e.telegraph){
  const a=e._campaign,dir=a?.aim||1,pulse=.65+.25*Math.sin((a?.age||0)*.35);
  const handX=x+dir*e.w*.48,handY=e.y-cam.y+e.h*.4;
  ctx.globalAlpha=pulse;ctx.fillStyle=e.roomPersona?.color||'#ffd9b0';
  ctx.beginPath();ctx.arc(handX,handY,4+Math.min(5,(a?.wind||0)*.08),0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=.25;ctx.beginPath();ctx.ellipse(x,e.y-cam.y+e.h+3,e.w*.65,4,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
 }

 if(e._shieldFacing){
  const sx=x+e._shieldFacing*e.w*.58,sy=bodyY+e.h*.5,sw=Math.max(7,e.w*.22),sh=Math.max(16,e.h*.45);
  ctx.fillStyle=e._shieldImpact>0?'#fff9d7':trim;ctx.strokeStyle='#354654';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(sx-sw,sy-sh);ctx.quadraticCurveTo(sx,sy-sh-6,sx+sw,sy-sh);ctx.lineTo(sx+sw,sy+sh*.2);ctx.quadraticCurveTo(sx+sw*.6,sy+sh*.8,sx,sy+sh);ctx.quadraticCurveTo(sx-sw*.8,sy+sh*.6,sx-sw,sy+sh*.2);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle='#fff7d8';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(sx,sy-sh+3);ctx.lineTo(sx,sy+sh-5);ctx.stroke();

 }ctx.restore();
}

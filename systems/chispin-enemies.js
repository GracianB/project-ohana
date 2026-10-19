// Chispín-exclusive enemy behaviors. Reuses the ten existing combat
// archetypes as requested (no eleventh map, no duplicate physics engine) but
// adds an electric tell, charged shot or shield pulse to each role.
const tint=Object.freeze({
 pursuer:'#ffe58a',flyer:'#aeebff',shield:'#c8b6ff',
 gunner:'#ffc5f3',jumper:'#c6ffdf'
});
const kind=e=>e?.roomPersona?.role||'pursuer';
export function enterChispinEnemies(g){
 if(!g.chispinStorm)return;
 for(const e of g.enemies||[]){
  if(e._chispinBoss||!e.roomPersona?.name)continue;
  e._chispinMob={role:kind(e),phase:(e.spawnIndex||0)*23,charging:false,
   next:130+(e.spawnIndex||0)*19,spent:0};
 }
}
export function updateChispinEnemies(g,hurt){
 if(!g.chispinStorm||!g.player||g.player.dead)return;
 const tick=g.t||0,p=g.player;
 for(const e of g.enemies||[]){
  const m=e._chispinMob;if(!m||e.hp<=0||e.dying||e.fell)continue;
  const dx=p.x+p.w/2-(e.x+e.w/2),dy=p.y+p.h/2-(e.y+e.h/2);
  const dist=Math.hypot(dx,dy),role=m.role;
  if(dist>760){m.charging=false;continue;}
  const wind=tick>=m.next-34&&tick<m.next;
  m.charging=wind;
  if(tick<m.next)continue;
  m.next=tick+(role==='gunner'?170:role==='flyer'?185:200);
  if(role==='gunner'||role==='flyer'){
   if((g.projectiles?.length||0)>110)continue;
   const speed=role==='gunner'?6.4:5.2,mag=Math.max(1,dist);
   g.projectiles?.push?.({x:e.x+e.w/2,y:e.y+e.h/2,w:12,h:12,
    vx:dx/mag*speed,vy:dy/mag*speed,life:110,owner:'enemy',
    dmg:role==='gunner'?10:7,color:tint[role],shape:'orb'});
   m.spent++;
  }else if(role==='shield'){
   // Defense counterplay: visible concentric wind-up; the shield is harmless
   // outside a 92px radius and can't land a rapid series of stacked hits.
   if(dist<92&&!(p.invuln>0))hurt?.(7,'PULSO MAGNÉTICO');
   m.spent++;
  }else if(role==='jumper'||role==='pursuer'){
   // Charged patrols move a short predictable burst toward the player.
   e.x+=Math.sign(dx)*Math.min(38,Math.abs(dx)*.22);
   m.spent++;
  }
 }
}
export function drawChispinEnemies(ctx,g,cam,t){
 if(!g.chispinStorm)return;
 ctx.save();
 for(const e of g.enemies||[]){
  const m=e._chispinMob;if(!m||e.hp<=0||e.dying||e.fell)continue;
  const x=e.x+e.w*.5-cam.x,y=e.y+e.h*.5-cam.y;
  if(x<-90||x>(g.viewW||1600)+90||y<-90||y>(g.viewH||950)+90)continue;
  const color=tint[m.role]||'#fff0a2',offset=g.reduceMotion?0:Math.sin(t*.13+(m.phase||0))*4;
  ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.globalAlpha=m.charging?.9:.37;
  // Circuit-board crackle makes the archetype readable from its effects.
  ctx.beginPath();ctx.moveTo(x-25,y-12);ctx.lineTo(x-16,y-25-offset);
  ctx.lineTo(x-8,y-21-offset);ctx.lineTo(x,y-35-offset);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x+14,y-24);ctx.lineTo(x+26,y-40+offset);
  ctx.lineTo(x+20,y-42+offset);ctx.lineTo(x+37,y-53+offset);ctx.stroke();
  if(m.charging){
   ctx.globalAlpha=.7;ctx.setLineDash([5,6]);ctx.beginPath();
   ctx.arc(x,y,Math.max(35,e.w*.65)+(t%28)*.5,0,Math.PI*2);ctx.stroke();
   ctx.setLineDash([]);
  }
  ctx.globalAlpha=1;
 }
 ctx.restore();
}

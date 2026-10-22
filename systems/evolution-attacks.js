import {HERO_POWERS,beginHeroPower,updateHeroPowers,drawHeroPowers} from "./hero-combos.js";
// World-space attacks. Rendering never applies damage; guests are not enemies.
const TAU=Math.PI*2;
const center=e=>({x:e.x+e.w/2,y:e.y+e.h/2});
const alive=e=>e&&e.hp>0&&!e.dying&&!e.fell;
const tier=p=>Math.max(0,Math.min(4,Number(p.evo)||0));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const THEMES={
 kilo:['#ffd994','petal','Semillas del aloha','Jardín del sol','fan','garden'],
 stitcho:['#83eaff','ship','Costura de plasma','Flota 626','cross','fleet'],
 chispin:['#fff07b','bolt','Muelle relámpago','Cielo de tormenta','chain','thunder'],
 cat:['#f9b5ed','moon','Zarpazo lunar','Constelación felina','pounce','orbit'],
 dragon:['#ff9961','flame','Cometa de fuego','Alas del volcán','comet','eruption'],
 dino:['#c3ef91','fossil','Pisotón fósil','Estampida ancestral','quake','stampede'],
 frita:['#ffe6a1','salt','Abanico crujiente','Festival de freidoras','fan','fryer'],
 pizza:['#ffc774','slice','Porción boomerang','Rueda de porciones','return','orbit'],
 yomi:['#d5bcff','seal','Runa de código','Lluvia de respuestas','cross','spirits'],
 cuerno:['#d7f9fa','prism','Lanza de aurora','Lluvia de constelaciones','lance','constellation']
};
const DESCRIPTIONS={
 fan:'Abanico que busca enemigos y abre espacio a media distancia.',garden:'Flores que anuncian y repiten sus impactos alrededor de los enemigos.',
 cross:'Ráfaga abierta con un disparo central para acertar de frente.',fleet:'Cinco naves persiguen blancos y disparan láseres durante varios segundos.',
 chain:'Proyectiles eléctricos que buscan y atraviesan varios enemigos.',thunder:'Seis descargas escalonadas anuncian dónde golpearán.',
 pounce:'Tres garras lunares barren la zona frente a Michi.',orbit:'Una rueda de proyectiles gira alrededor del héroe antes de salir disparada.',
 comet:'Cometas que buscan un blanco y explotan al impactar.',eruption:'Seis focos de fuego brotan en oleadas bajo los enemigos.',
 quake:'Cuatro impactos fósiles sacuden posiciones enemigas tras un aviso.',stampede:'Estampida de proyectiles fósiles que atraviesa varios blancos.',
 return:'Porciones que salen en abanico y regresan hacia Pizza.',fryer:'Seis freidoras marcan el terreno y lanzan géiseres repetidos.',
 spirits:'Cinco espíritus sonrientes persiguen y atacan enemigos.',lance:'Abanico de lanzas de aurora que perfora hasta cuatro enemigos.',
 constellation:'Seis estrellas señalan el terreno antes de descargar aurora.'
};
export const POWER_LEVELS=Object.freeze([0,1,2,0,3,4]);
export function extraAbility(id,index){
 const d=THEMES[id];if(!d||![4,5].includes(index))return null;
 return {id:`${id}_${index===4?'ascend':'finale'}`,key:index===4?'I':'P',name:HERO_POWERS[id][index===4?0:1],color:d[0],cd:index===4?3600:7200,
  desc:HERO_POWERS[id][index===4?2:3]};
}
export function powerAbility(p,index,defs,supreme){return index===3?supreme:index>3?extraAbility(p.id,index):defs[p.abilities?.[index]];}
function state(g){
 if(!g._evolutionAttacks||g._evolutionAttacks.owner!==g.player||g._evolutionAttacks.room!==g.roomId)
  g._evolutionAttacks={owner:g.player,room:g.roomId,age:0,shots:[],fields:[],drones:[],beams:[],guest:null};
 return g._evolutionAttacks;
}
function targets(g,x,y,range=850){return (g.enemies||[]).filter(alive).filter(e=>Math.hypot(center(e).x-x,center(e).y-y)<=range).sort((a,b)=>Math.hypot(center(a).x-x,center(a).y-y)-Math.hypot(center(b).x-x,center(b).y-y));}
function shot(s,p,id,x,y,vx,vy,damage,kind='normal'){
 if(s.shots.length>=100)return;
 s.shots.push({id,x,y,vx,vy,damage,kind,age:0,life:100,r:kind==='comet'?14:7,hit:new Set(),origin:p});
}
export function summonDanceFleet(g){
 const s=state(g),p=g.player,n=1+tier(p),c=center(p);
 s.drones=s.drones.filter(d=>!d.dance);
 for(let i=0;i<n;i++)s.drones.push({id:'stitcho',x:c.x+(i-(n-1)/2)*38,y:c.y-85,age:0,life:150+12*tier(p),index:i,count:n,dance:true,next:18+i*5});
}
// The ally has an actual formation target, not a fixed screen offset. Pure
// geometry so the behavior can be tested without a DOM, renderer or RNG.
export function companionGoal(ally,hero,target=null,tick=0,reduced=false){
 const face=Math.sign(hero.facing||1)||1,c=center(hero);
 if(!target)return {
  x:c.x-face*(78+(reduced?0:Math.sin(tick*.045)*14)),
  y:hero.y+hero.h-(reduced?0:Math.abs(Math.sin(tick*.09))*8),
  engaged:false
 };
 const q=center(target),dir=Math.sign(q.x-ally.x)||face;
 return {x:q.x-dir*52,y:target.y+target.h-10,engaged:true};
}
export const DUET_ECHOES=Object.freeze({
 'kilo+stitcho':{mode:'garden',label:'DÚO A COMPÁS',heal:3,radius:95},
 'frita+pizza':{mode:'fryer',label:'FIESTA DEL HORNO',heal:0,radius:115},
 'dino+dragon':{mode:'quake',label:'GIGANTES EN MARCHA',heal:0,radius:118},
 'cat+cuerno':{mode:'constellation',label:'JARDÍN LUNAR',heal:3,radius:108},
 'chispin+yomi':{mode:'thunder',label:'PORTAL DE TRUENO',heal:0,radius:105}
});
export function duetEcho(hero,ally){
 const key=[hero,ally].sort().join('+');
 return DUET_ECHOES[key]||{mode:'burst',label:'ENLACE OHANA',heal:0,radius:82};
}
export function startBattleCompanion(g,id,power=1){
 if(!THEMES[id]||!g.player)return false;
 const s=state(g),p=g.player,c=center(p);
 s.guest={id,x:c.x-(p.facing||1)*110,y:p.y+p.h,age:0,life:360,power,next:35,face:p.facing||1,attack:0,air:false,motion:'idle',vx:0,vy:0,
  lastCast:p._cast?.t??null,supportCd:0,echoes:0};
 g._assist={heroId:id,heroName:id,t:360};
 return true;
}
export function castEvolutionAttack(g,index){
 const p=g.player,d=THEMES[p.id],s=state(g),e=tier(p),c=center(p),face=p.facing||1;
 beginHeroPower(g,index,s);
 p._cast={slot:index,t:g.t,id:extraAbility(p.id,index).id,form:e};
 p._powerPerformance={index,start:g.t};
 g.nums?.add?.(c.x,p.y-36,extraAbility(p.id,index).name,d[0],true);
}
function beam(s,id,x,y,to){s.beams.push({id,x,y,tx:to.x,ty:to.y,life:10});}
export function updateEvolutionAttacks(g,hit,heal){
 const p=g.player;if(!p)return;const s=state(g);if(p.dead){s.shots=[];s.fields=[];s.drones=[];s.beams=[];s.guest=null;s.moves=[];s.oil=[];p._finisherActive=false;g._assist=null;return;}
 updateHeroPowers(g,s,hit,id=>THEMES[id][0]);
 s.age++;s.beams=s.beams.filter(b=>--b.life>0);
 const e=tier(p),c=center(p);
 for(const d of s.drones){
  d.age++;d.life--;const list=targets(g,d.x,d.y,720),target=list[d.index%Math.max(1,list.length)];
  const goal=target?center(target):c,tx=goal.x+(d.index-(d.count-1)/2)*44,ty=goal.y-90;
  d.x+=(tx-d.x)*.08;d.y+=(ty-d.y)*.08;
  if(--d.next<=0&&target){d.next=36;const t=center(target);beam(s,d.id,d.x,d.y,t);
   const landed=hit(g,target,(9+e*3)*(Number(p._flowPower)||1),{color:THEMES[d.id][0],parts:4,hitstop:0,noCharge:!!d.noCharge});
   if(d.dance&&landed&&s.lastDanceHeal!==Math.floor(s.age/24)){heal(p,2+e);s.lastDanceHeal=Math.floor(s.age/24);}
  }
 }
 s.drones=s.drones.filter(d=>d.life>0).slice(-24);
 for(const f of s.fields){
  f.age++;if(f.age<0)continue;f.life--;
  if(f.age===f.next){
   for(const target of targets(g,f.x,f.y,f.r))hit(g,target,f.damage,{color:THEMES[f.id][0],kx:Math.sign(center(target).x-f.x)*4,ky:-3,hitstop:0,noCharge:!!f.noCharge});
   f.strikeAt=f.age;
   if(['garden','eruption','fryer'].includes(f.mode))f.next+=30;
   g.fx?.emit?.(f.x,f.y,{color:THEMES[f.id][0],count:6,size:3,speed:2,life:16});
  }
 }
 s.fields=s.fields.filter(f=>f.life>0);
 for(const b of s.shots){
  b.age++;b.life--;const ox=b.x,oy=b.y;
  if(b.kind==='return'&&b.age>24){b.vx+=(c.x-b.x)*.015;b.vy+=(c.y-b.y)*.015;}
  if(['chain','stampede','fan','comet'].includes(b.kind)){
   const t=targets(g,b.x,b.y,480).find(v=>!b.hit.has(v));
   if(t){const q=center(t),a=Math.atan2(q.y-b.y,q.x-b.x);b.vx=b.vx*.91+Math.cos(a)*1.1;b.vy=b.vy*.91+Math.sin(a)*1.1;}
  }
  if(b.kind==='orbit'&&b.age<65){
   const a=Math.atan2(b.vy,b.vx)+b.age*.085,r=38+b.age*2;
   b.x=c.x+Math.cos(a)*r;b.y=c.y+Math.sin(a)*r*.65;
  }else{b.x+=b.vx;b.y+=b.vy;}
  for(const t of targets(g,b.x,b.y,90)){
   if(b.hit.has(t))continue;const q=center(t),dx=b.x-ox,dy=b.y-oy,u=clamp(((q.x-ox)*dx+(q.y-oy)*dy)/(dx*dx+dy*dy||1),0,1);
   if(Math.hypot(q.x-ox-u*dx,q.y-oy-u*dy)>b.r+Math.max(t.w,t.h)*.5)continue;
   b.hit.add(t);hit(g,t,b.damage,{color:THEMES[b.id][0],parts:5,hitstop:0,noCharge:!!b.noCharge});
   if(b.kind==='comet')s.fields.push({id:b.id,x:b.x,y:b.y,age:0,life:25,r:80,damage:b.damage*.6,mode:'burst',next:1});
   if(!['lance','chain','return','stampede'].includes(b.kind)||b.hit.size>=4){b.life=0;break;}
  }
 }
 s.shots=s.shots.filter(b=>b.life>0);
 const a=s.guest;
 if(a){
  a.age++;a.life--;a.attack=Math.max(0,a.attack-1);
  a.supportCd=Math.max(0,(a.supportCd||0)-1);
  // Prefer the threat harassing the player, then the nearest enemy.
  const nearby=targets(g,c.x,c.y,950);
  const target=nearby.find(e=>(e.elite||e.aiAttackPermit)&&Math.hypot(center(e).x-c.x,center(e).y-c.y)<520)||nearby[0];
  const q=target?center(target):c,goal=companionGoal(a,p,target,a.age,!!g.reduceMotion);
  const ox=a.x,oy=a.y,dx=goal.x-a.x,dy=goal.y-a.y;
  const speed=goal.engaged?Math.abs(dx)>230?13:9:10;
  a.x+=clamp(dx,-speed,speed);
  a.y+=clamp(dy,-10,10);
  a.vx=a.x-ox;a.vy=a.y-oy;
  a.air=Math.abs(a.vy)>2||Math.abs(a.y-(p.y+p.h))>28;
  a.motion=Math.abs(a.vx)>1?'run':goal.engaged?'ready':'idle';
  if(Math.abs(a.vx)>0.5)a.face=Math.sign(a.vx);
  else if(target)a.face=q.x>=a.x?1:-1;
  else a.face=p.facing||1;
  // U now listens to the hero: an actual J/K/L/I/P cast signals a short
  // paired follow-up, once per cast and at most once per second.
  const cast=p._cast;
  if(cast&&cast.slot!==3&&cast.t!==a.lastCast){
   a.lastCast=cast.t;
   if(a.supportCd===0&&target&&Math.hypot(q.x-a.x,q.y-a.y)<400){
    const echo=duetEcho(p.id,a.id);
    const dmg=(7+e*2)*Math.min(1.35,Number(a.power)||1);
    s.fields.push({id:a.id,x:q.x,y:q.y,age:0,life:28,
      r:echo.radius,damage:dmg,mode:echo.mode,next:11,noCharge:true});
    beam(s,a.id,c.x,c.y,{x:a.x,y:a.y-25});
    a.supportCd=66;a.attack=14;a.echoes++;
    if(echo.heal)heal(p,echo.heal);
    g.nums?.add?.(a.x,a.y-42,echo.label,THEMES[a.id][0],false);
   }
  }
  if(--a.next<=0&&target&&Math.hypot(q.x-a.x,q.y-(a.y-25))<240){
   a.next=36;a.attack=14;
   const damage=(15+e*5)*a.power,sy=a.y-28;
   if(['stitcho','chispin'].includes(a.id)){
    const chain=a.id==='chispin'?targets(g,q.x,q.y,190).slice(0,2+Math.floor(e/2)):[target];
    let from={x:a.x,y:sy};for(const victim of chain){const dest=center(victim);beam(s,a.id,from.x,from.y,dest);hit(g,victim,damage,{color:THEMES[a.id][0],parts:5,hitstop:0});from=dest;}
   }else if(['cat','dino','dragon'].includes(a.id)){
    s.fields.push({id:a.id,x:q.x,y:q.y,age:0,life:32,r:a.id==='dino'?120:85,damage,mode:a.id==='cat'?'pounce':'burst',next:8});
   }else{
    const angle=Math.atan2(q.y-sy,q.x-a.x),kind=a.id==='pizza'?'return':a.id==='cuerno'?'lance':'fan';
    for(let i=-1;i<=1;i++)shot(s,p,a.id,a.x,sy,Math.cos(angle+i*.14)*11,Math.sin(angle+i*.14)*11,damage*.6,kind);
   }
  }
  if(g._assist)g._assist.t=a.life;
  if(a.life<=0){s.guest=null;g._assist=null;}
 }
}
function glyph(ctx,id,x,y,r,t){
 const [color,shape]=THEMES[id];ctx.save();ctx.translate(x,y);ctx.rotate(t*.04);ctx.fillStyle=color;ctx.strokeStyle='#263446';ctx.lineWidth=1.5;ctx.beginPath();
 if(shape==='bolt'){ctx.moveTo(1,-r);ctx.lineTo(-r,2);ctx.lineTo(0,1);ctx.lineTo(-1,r);ctx.lineTo(r,-2);ctx.lineTo(1,-1);}
 else if(shape==='slice'){ctx.moveTo(0,-r);ctx.lineTo(r,r);ctx.quadraticCurveTo(0,r*1.3,-r,r);}
 else if(shape==='moon'){ctx.arc(0,0,r,.5,5.8);ctx.quadraticCurveTo(-r*.4,0,r*Math.cos(.5),r*Math.sin(.5));}
 else if(shape==='seal'){ctx.rect(-r*.5,-r,r,r*2);}
 else if(shape==='petal'){ctx.ellipse(0,0,r*.5,r,0,0,TAU);}
 else if(shape==='flame'){ctx.moveTo(0,-r);ctx.bezierCurveTo(r*.2,-r*.2,r*1.3,r*.2,r*.5,r*.8);ctx.bezierCurveTo(-r*.9,r*1.4,-r,-r*.2,-r*.35,-r*.3);ctx.quadraticCurveTo(-r*.2,r*.3,0,-r);}
 else if(shape==='fossil'){ctx.ellipse(0,-r*.2,r,r*.75,0,0,TAU);ctx.moveTo(-r*.4,r*.2);ctx.lineTo(-r*.4,r);ctx.lineTo(r*.4,r);ctx.lineTo(r*.4,r*.2);}
 else if(shape==='salt'){ctx.rect(-r*.45,-r*.65,r*.9,r*1.3);}
 else if(shape==='prism'){ctx.moveTo(0,-r);ctx.lineTo(r*.65,0);ctx.lineTo(0,r);ctx.lineTo(-r*.65,0);}
 else if(shape==='ship'){ctx.moveTo(r,0);ctx.lineTo(-r,-r*.65);ctx.lineTo(-r*.45,0);ctx.lineTo(-r,r*.65);}
 else{for(let i=0;i<5;i++){const a=i*TAU/5;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);ctx.lineTo(Math.cos(a+.6)*r*.4,Math.sin(a+.6)*r*.4);}}
 ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
}
export function drawPowerEmblem(ctx,id,x,y,r,t=0){if(THEMES[id])glyph(ctx,id,x,y,r,t);}
function drawField(ctx,f,cam,t,reduced){
 const x=f.x-cam.x,y=f.y-cam.y,color=THEMES[f.id][0];
 const since=f.strikeAt==null?Infinity:f.age-f.strikeAt,impact=since<14?1-since/14:0;
 ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;
 ctx.globalAlpha=.25+impact*.6;ctx.lineWidth=impact?3:1.5;
 ctx.setLineDash(impact?[]:[6,5]);ctx.beginPath();ctx.arc(x,y,f.r,0,TAU);ctx.stroke();ctx.setLineDash([]);
 if(f.mode==='pounce'){
  for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(x-f.r*.65,y-28+i*18);ctx.quadraticCurveTo(x,y-45+i*18,x+f.r*.65,y-12+i*18);ctx.stroke();}
 }else if(['thunder','constellation'].includes(f.mode)){
  for(let i=0;i<4;i++)glyph(ctx,f.id,x+Math.cos(i*TAU/4)*f.r*.7,y+Math.sin(i*TAU/4)*f.r*.7,7,reduced?0:t);
  if(impact){ctx.globalAlpha=impact;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x,y-f.r-130);ctx.lineTo(x-12,y-70);ctx.lineTo(x+10,y-75);ctx.lineTo(x,y);ctx.stroke();}
 }else if(['eruption','fryer'].includes(f.mode)){
  if(impact){ctx.globalAlpha=impact;for(let i=-2;i<=2;i++)glyph(ctx,f.id,x+i*13,y-Math.sin((i+3)*.5)*90*impact,10+impact*9,reduced?0:t);}
  else{ctx.beginPath();ctx.ellipse(x,y,22,7,0,0,TAU);ctx.stroke();}
 }else if(f.mode==='garden'){
  for(let i=0;i<5;i++){const a=i*TAU/5;ctx.globalAlpha=.55+impact*.4;glyph(ctx,f.id,x+Math.cos(a)*f.r*.65,y+Math.sin(a)*f.r*.65,8+impact*7,reduced?0:t);}
 }else{
  ctx.beginPath();ctx.ellipse(x,y,f.r*(1-impact*.5),f.r*.3,0,0,TAU);ctx.stroke();
  for(let i=0;i<3;i++)glyph(ctx,f.id,x+(i-1)*f.r*.5,y-impact*30,8+impact*8,reduced?0:t);
 }
 ctx.restore();
}
function drawDrone(ctx,d,cam,t,reduced){
 const x=d.x-cam.x,y=d.y-cam.y;
 ctx.save();ctx.strokeStyle='#273652';ctx.lineWidth=2;
 if(d.id==='yomi'){
  ctx.fillStyle='#ede0c9';ctx.beginPath();ctx.moveTo(x-13,y+12);ctx.quadraticCurveTo(x-20,y-22,x,y-22);ctx.quadraticCurveTo(x+20,y-22,x+13,y+12);ctx.lineTo(x+6,y+7);ctx.lineTo(x,y+14);ctx.lineTo(x-7,y+7);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#3d345d';for(const side of [-1,1]){ctx.beginPath();ctx.ellipse(x+side*5,y-6,2.5,4,0,0,TAU);ctx.fill();}
  ctx.strokeStyle='#c592ba';ctx.beginPath();ctx.arc(x,y+2,4,0,Math.PI);ctx.stroke();
 }else{
  ctx.fillStyle=THEMES[d.id][0];ctx.beginPath();ctx.ellipse(x,y,20,7,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#d5faff';ctx.beginPath();ctx.ellipse(x,y-5,10,8,0,Math.PI,TAU);ctx.fill();ctx.stroke();
  for(let i=0;i<3;i++){ctx.fillStyle=i===(reduced?1:Math.floor(t/6)%3)?'#fff6ae':'#6267b6';ctx.beginPath();ctx.arc(x-10+i*10,y+1,2,0,TAU);ctx.fill();}
 }ctx.restore();
}
export function drawEvolutionAttacks(ctx,g,cam,t,drawActor,roster){
 const s=g._evolutionAttacks;if(!s||s.owner!==g.player||s.room!==g.roomId)return;
 drawHeroPowers(ctx,g,cam);
 ctx.save();
 for(const f of s.fields)if(f.age>=0)drawField(ctx,f,cam,t,!!g.reduceMotion);
 ctx.globalAlpha=1;
 for(const b of s.shots)glyph(ctx,b.id,b.x-cam.x,b.y-cam.y,b.r+3,g.reduceMotion?0:t);
 for(const d of s.drones)drawDrone(ctx,d,cam,t,!!g.reduceMotion);
 for(const b of s.beams){ctx.globalAlpha=b.life/10;ctx.strokeStyle=THEMES[b.id][0];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(b.x-cam.x,b.y-cam.y);ctx.lineTo(b.tx-cam.x,b.ty-cam.y);ctx.stroke();glyph(ctx,b.id,b.tx-cam.x,b.ty-cam.y,10,t);}
 ctx.globalAlpha=1;const a=s.guest;
 if(a){const def=roster.find(r=>r.id===a.id),e=tier(g.player),f=def?.forms[e];if(f){
  const x=a.x-cam.x,y=a.y-cam.y;
  const alpha=Math.min(1,a.age/16,a.life/18);
  // Shadow / pulse / visible partner movement make proximity and attack readable.
  ctx.globalAlpha=alpha*.38;ctx.fillStyle='#102d39';ctx.beginPath();ctx.ellipse(x,y,Math.max(12,f.w*.3),6,0,0,TAU);ctx.fill();
  ctx.globalAlpha=alpha;
  if(a.attack){ctx.strokeStyle=THEMES[a.id][0];ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(x,y-f.h*.5,Math.max(26,f.w*.6)+(14-a.attack)*1.4,0,TAU);ctx.stroke();}
  const bob=g.reduceMotion?0:a.motion==='run'?Math.sin(a.age*.42)*5:Math.sin(a.age*.10)*2;
  drawActor(ctx,{...def,...f,id:a.id,evo:e,x:a.x-f.w/2,y:a.y-f.h-bob,facing:a.face,
   vx:a.vx||0,vy:a.vy||0,grounded:!a.air,
   _poseOverride:a.attack?'attack':a.motion==='run'?'run':'idle',
   _duetActor:true,_introForceCanvas:true,visualScale:.88},cam,t,{reduceMotion:!!g.reduceMotion});
 }}
 ctx.restore();
}

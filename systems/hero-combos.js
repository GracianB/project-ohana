import {drawHeroAttackGlyph,drawAttackWindow} from './combat-fx.js';
const mid=e=>({x:e.x+e.w/2,y:e.y+e.h/2});
const living=e=>e&&e.hp>0&&!e.dying&&!e.fell;
const close=(g,x,y,r)=>g.enemies.filter(living).filter(e=>Math.hypot(mid(e).x-x,mid(e).y-y)<r);
export const HERO_POWERS=Object.freeze({
 nacar:['Salto de espuma','Marea de estrellas','Sube de un impulso y deja una burbuja que estalla donde arrancaste.','Una marea protege el entorno con impactos repetidos.'],
 kilo:['Remate aloha','A compás del sol','Acierta tres ataques H o J en cualquier orden; cuando ponga I LISTO, pulsa I: paso evasivo y golpe ascendente.','Carga 100 causando daño real; pulsa P para lanzar y al ritmo de sus tres señales para ampliar ondas y daño.'],
 stitcho:['Rebote 626','Flota cruzada','Rebota hacia el siguiente enemigo al acertar con paso acrobático de plasma.','La flota 626 bombardea la zona señalada con rayos orbitales de plasma.'],
 chispin:['Carrera relámpago','Tormenta enlazada','Cruza enemigos y conecta las marcas de J.','Detona las marcas y encadena descargas.'],
 cat:['Garra ascendente','Cacería lunar','Zarpazo aéreo que rebota al acertar.','Persigue tus presas y termina con una caída lunar.'],
 dragon:['Picado del cometa','Vuelo volcánico','Pica y recupera altura al golpear.','Dirige el vuelo y deja una estela de fuego.'],
 dino:['Carga fósil','Estampida ancestral','Prepara una carga pesada y remata con una onda fósil al frente.','Encadena tres saltos y golpes de suelo.'],
 frita:['Derrape de aceite','Freidora exprés','Deslízate dejando aceite en el recorrido.','Enciende tus pistas de aceite y acaba con una explosión.'],
 pizza:['Porción de regreso','Rueda de pizza','La porción golpea en la ida y la vuelta. Cógela al regresar para cerrar el recorrido.','Conduce la rueda y lanza porciones al terminar.'],
 yomi:['Paso de farol','Tres ecos de lumbre','Avanza protegida y deja un sello que arde al terminar. Registra el punto de partida.','Tres sellos arden en los puntos guardados con I. Sin un paso previo, salen desde el punto del lanzamiento.'], ia:['Salto de datos','Tres respuestas','Cruza protegido y enlaza los enemigos analizados que quedan por delante.','Tres réplicas se activan en puntos guardados por I. Sin un salto previo, parten del lugar del lanzamiento.'],
 cuerno:['Lanza de aurora','Arco de constelaciones','Carga atravesando una fila de enemigos.','Salta sobre un arco y deja caer lanzas tras de ti.'],
});
// [wind-up, active until, lifetime, speed, lead, radius, damage]
const REMATES={
 nacar:[4,19,26,10,19,64,33], stitcho:[2,24,30,12,22,48,32],
 chispin:[2,16,22,16,26,44,30], cat:[3,20,28,9,20,52,36],
 dragon:[4,23,32,12,25,55,39], dino:[6,22,32,12,30,70,42],
 frita:[2,24,30,13,19,46,30], yomi:[5,18,26,12,23,52,34],
 ia:[2,15,22,16,22,46,30], cuerno:[5,22,30,15,37,57,43],
};
const liftOff={cat:-9,dragon:9,nacar:-6};
const prismLine=(g,c,m,hit)=>{
 const reach=220;
 for(const e of close(g,c.x,c.y,reach+45)){
  const q=mid(e),dx=(q.x-c.x)*m.face;
  if(dx>=0&&dx<reach&&Math.abs(q.y-c.y)<24+e.h*.5)hit(e,q);
 }
};

export function beginHeroPower(g,index,s){
 const p=g.player,id=p.id,c=mid(p),face=p.facing||1,final=index===5;
 const move={id,index,age:0,life:final?120:24,face,start:c,hit:new Set(),beats:new Set(),bonus:0,phase:0};
 if(id==='kilo'&&!final){move.speed=10+(Number(p.evo)||0)*.5;p.invuln=Math.max(p.invuln||0,10);p.vx=face*3;}
 if(!final&&REMATES[id])move.life=REMATES[id][2];
 if(final){p._finisherActive=true;move.life=id==='stitcho'?100:['yomi','ia'].includes(id)?96:120;}
 else if(id==='pizza'){
  s.shots.push({id,x:c.x,y:c.y,vx:face*12,vy:0,damage:35,kind:'return',remate:true,age:0,life:100,r:12,hit:new Set(),origin:p});move.life=1;
 }else if(!final&&Object.hasOwn(liftOff,id)){p.vy=liftOff[id];p.grounded=false;}
 if(['yomi','ia'].includes(id)&&!final){p._spectralCuts||=[];p._spectralCuts.push({x:c.x,y:c.y,face});p._spectralCuts=p._spectralCuts.slice(-3);}
 if(id==='cat'&&final)move.prey=close(g,c.x,c.y,800).filter(e=>e._lunarMarkUntil>(g.t||0));
 if(['yomi','ia'].includes(id)&&final)move.cuts=(p._spectralCuts||[]).map(v=>({...v}));
 s.moves||=[];s.moves.push(move);return move;
}
export function rhythmPress(g){
 const m=g._evolutionAttacks?.moves?.find(m=>m.id==='kilo'&&m.index===5);if(!m)return false;
 const next=[30,60,90].find(t=>Math.abs(m.age-t)<=8&&!m.beats.has(t));
 if(next){m.beats.add(next);m.bonus++;g.nums?.add?.(g.player.x,g.player.y-25,'¡A COMPÁS!','#fff0b1',true);}return true;
}
export function updateHeroPowers(g,s,hit,color){
 const p=g.player;s.moves||=[];p._finisherActive=s.moves.some(m=>m.index===5);
 const strike=(m,e,damage)=>{
  if(m.hit.has(e))return false;
  const landed=hit(g,e,damage,{color:color(m.id),kx:m.face*5,ky:-4,hitstop:0});
  if(!landed)return false;
  m.hit.add(e);
  if(m.index===4||m.id==='kilo'){
   m.impacts||=[];if(m.impacts.length<16)m.impacts.push({...mid(e),life:12});
  }
  if(m.id==='cat')e._lunarMarkUntil=(g.t||0)+360;
  if(m.id==='stitcho'&&m.index===4){
   const origin=mid(p),next=close(g,origin.x,origin.y,400).find(v=>!m.hit.has(v));
   p.vy=-8;p.grounded=false;m.face=next?(Math.sign(mid(next).x-origin.x)||m.face):-m.face;
  }
  if(['cat','dragon'].includes(m.id)&&m.index===4){
   p.vy=m.id==='dragon'?-12:-11;p.grounded=false;p.jumps=Math.max(0,(p.jumps||0)-1);
  }
  if(m.id==='dino'&&!e.boss){e.vx=m.face*11;e.vy=-2;}
  return true;
 };
 const pulse=(m,x,y,r,damage)=>{
  m.contact={x,y,r,age:m.age};
  if(m.index===5&&(m.id==='dino'||m.id==='cat'&&m.age>=85))m.visualBeat=m.age;
  for(const e of close(g,x,y,r))strike(m,e,damage);
 };
 const field=(m,x,y,r,damage,mode='burst',delay=12)=>{
  if(m.index===5)m.visualBeat=m.age;
  s.fields.push({id:m.id,x,y,age:0,life:delay+20,r,damage,mode,next:delay,noCharge:m.index===5});
 };
 for(const m of s.moves){m.age++;m.life--;m.impacts=(m.impacts||[]).filter(v=>--v.life>0);const c=mid(p),a=m.age,final=m.index===5;
  if(!final){
   if(m.id==='pizza')continue;
   if(m.id==='kilo'){
    p.vx=m.face*(a<6?3:m.speed);
    if(a>=7&&a<=20)pulse(m,c.x+m.face*25,c.y,70,48+(Number(p.evo)||0)*8);
    continue;
   }
   const [windup,active,,speed,lead,radius,damage]=REMATES[m.id];
   const live=a>=windup&&a<=active;
   if(live||a<windup)p.vx=m.face*(live?speed:speed*.35);
   else if(a===active+1)p.vx*=.48;
   const x=c.x+m.face*lead;
   if(!live)continue;
   if(m.id==='yomi'||m.id==='ia')p.invuln=Math.max(p.invuln||0,2);
   const first=m.hit.size;
   if(m.id==='nacar'&&a===windup)field(m,m.start.x,m.start.y,76,19,'constellation',8);
   if(m.id==='dino'&&a===active)field(m,x,c.y,88,22,'quake',5);
   if(m.id==='yomi'&&a===active)field(m,x,c.y,64,21,'pounce',8);
   if(m.id==='ia'&&a===windup)prismLine(g,c,m,(e,q)=>{
    if(!(e._yomiMarkUntil>g.t)||!strike(m,e,damage+22))return;
    s.beams.push({id:m.id,x:c.x,y:c.y,tx:q.x,ty:q.y,life:10});
   });
   pulse(m,x,c.y,radius,damage);
   if(m.id==='chispin'){
    for(const e of close(g,c.x,c.y,260)){
     if(!(e._chispaMarkUntil>(g.t||0))||!strike(m,e,38))continue;
     const q=mid(e);s.beams.push({id:m.id,x:c.x,y:c.y,tx:q.x,ty:q.y,life:10});
    }
   }
   if(m.id==='frita'&&a%5===0){
    s.oil||=[];s.oil.push({x:c.x,y:p.y+p.h,life:480});s.oil=s.oil.slice(-32);
   }
   if(m.hit.size>first)m.visualBeat=a;
   if(!m.trace)m.trace=[];
   if(a%2===0){m.trace.push({x:c.x,y:c.y});if(m.trace.length>8)m.trace.shift();}
  }else if(m.id==='kilo'){
   if([39,69,99].includes(a)){m.hit.clear();m.pulseAge=a;m.pulseRadius=210+m.bonus*45;pulse(m,c.x,c.y,m.pulseRadius,36+m.bonus*12);field(m,c.x,c.y,m.pulseRadius,12,'garden',1);}
  }else if(m.id==='stitcho'){
   if(a%20===1){const x=m.start.x+m.face*260,y=m.start.y;for(const side of [-1,1])s.drones.push({id:'stitcho',x:x+side*220,y:y-160,age:0,life:38,index:side===1?1:0,count:2,next:8,noCharge:true});field(m,x,y,150,38,'burst',18);}
  }else if(m.id==='chispin'){
   if(a%20===1){const list=close(g,c.x,c.y,900).sort((u,v)=>(v._chispaMarkUntil||0)-(u._chispaMarkUntil||0));let from=c;for(const e of list.slice(0,3+(Number(p.evo)||0))){const q=mid(e),marked=e._chispaMarkUntil>(g.t||0);s.beams.push({id:m.id,x:from.x,y:from.y,tx:q.x,ty:q.y,life:10});field(m,q.x,q.y,55,marked?70:32,'thunder',8);e._chispaMarkUntil=0;from=q;}}
  }else if(m.id==='cat'){
   if(a<85){const target=(m.prey||[]).find(living)||close(g,c.x,c.y,600).find(e=>!m.hit.has(e));if(target){const q=mid(target);p.vx=Math.sign(q.x-c.x)*12;if(a%24===1)p.vy=-9;pulse(m,c.x,c.y,70,48);}}
   else {p.vy=Math.max(p.vy||0,10);if(p.grounded||a===119){pulse(m,c.x,c.y,220,65);m.life=0;}}
  }else if(m.id==='dragon'){
   p.vy=-2+Math.sin(a*.12)*2;p.grounded=false;p.vx=(p.facing||m.face)*8;
   if(a%10===0)field(m,c.x,p.y+p.h,70,25,'eruption',8);
  }else if(m.id==='nacar'){
   p.vx*=.92;if([12,40,68,96].includes(a)){m.hit.clear();field(m,c.x,c.y,220,36,'constellation',14);}
  }else if(m.id==='dino'){
   p.vx=(p.facing||m.face)*8;if([1,40,80].includes(a)){p.vy=-10;p.grounded=false;m.phase++;}
   if(a%40===32){m.hit.clear();pulse(m,c.x,p.y+p.h,180,56);field(m,c.x,p.y+p.h,180,18,'quake',1);}
  }else if(m.id==='frita'){
   p.vx=(p.facing||m.face)*13;if(a===1)for(const oil of s.oil||[])field(m,oil.x,oil.y-30,95,44,'fryer',8);
   pulse(m,c.x,c.y,65,38);if(a===119)field(m,c.x,c.y,210,85,'fryer',1);
  }else if(m.id==='pizza'){
   p.vx=(p.facing||m.face)*11;pulse(m,c.x,c.y,Math.max(65,p.w),45);
   if(a===119)m.visualBeat=a;
   if(a===119)for(let i=-2;i<=2;i++)s.shots.push({id:m.id,x:c.x,y:c.y,vx:Math.cos(i*.3)*m.face*12,vy:Math.sin(i*.3)*10,damage:40,noCharge:true,kind:'return',age:0,life:75,r:12,hit:new Set(),origin:p});
  }else if(['yomi','ia'].includes(m.id)){
   if([12,40,68].includes(a)){const cut=m.cuts[Math.floor(a/28)]||{...m.start,face:m.face};field(m,cut.x+cut.face*80,cut.y,130,72,'pounce',12);s.beams.push({id:m.id,x:cut.x,y:cut.y,tx:cut.x+cut.face*190,ty:cut.y,life:18});}
  }else if(m.id==='cuerno'){
   if(a===1){p.vy=-12;p.grounded=false;}p.vx=m.face*6;
   if(a%12===0){const below=close(g,c.x,c.y+120,450).filter(e=>Math.abs(mid(e).x-c.x)<100).sort((u,v)=>Math.abs(mid(u).y-c.y)-Math.abs(mid(v).y-c.y))[0];field(m,c.x,below?mid(below).y:p.y+p.h+80,85,45,'constellation',18);}
  }
 }
 s.moves=s.moves.filter(m=>m.life>0);s.oil=(s.oil||[]).filter(o=>--o.life>0);p._finisherActive=s.moves.some(m=>m.index===5);
}

const TAU=2*Math.PI;
function drawKiloPower(ctx,g,cam,m,x,y,p){
 ctx.strokeStyle=m.index===5?'#fff1b5':'#b6f5ed';ctx.lineWidth=3;ctx.globalAlpha=.6;ctx.beginPath();
 if(m.index===5){
   const beats=[30,60,90],next=beats.find(v=>v>=m.age-8&&!m.beats.has(v)),ready=next!==undefined&&Math.abs(next-m.age)<=8;
   ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle='#183e48';ctx.fillRect(x-68,y-103,136,45);
   ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillStyle=ready?'#fff0a2':'#d9e5df';ctx.fillText(ready?'P — ¡AHORA!':'SIGUE EL COMPÁS',x,y-86);
   beats.forEach((beat,i)=>{const bx=x+(i-1)*34,hit=m.beats.has(beat),miss=m.age>beat+8&&!hit;
    ctx.fillStyle=hit?'#b6f5cd':miss?'#ac8494':'#efe4c0';ctx.beginPath();ctx.arc(bx,y-70,hit?5:3,0,Math.PI*2);ctx.fill();
    if(!hit&&!miss){ctx.strokeStyle='#ffe492';ctx.lineWidth=2;ctx.beginPath();ctx.arc(bx,y-70,5+Math.min(22,Math.abs(beat-m.age)*.55),0,Math.PI*2);ctx.stroke();}
   });
   const flash=m.age-(m.pulseAge??-100);if(flash>=0&&flash<14){ctx.globalAlpha=(1-flash/14)*.7;ctx.strokeStyle='#fff0a2';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,p.y+p.h-cam.y,m.pulseRadius,m.pulseRadius*.24,0,0,Math.PI*2);ctx.stroke();}
   ctx.beginPath();
  }
 else{
   const strike=m.age>=7&&m.age<=20,reach=strike?70:34,tx=x+m.face*25;
   ctx.globalAlpha=strike?.85:.5;ctx.strokeStyle=strike?'#ffe39a':'#e9a5bd';ctx.lineWidth=strike?4:2;
   ctx.ellipse(tx,y,reach*.65,reach,strike?m.face*.3:0,m.face>0?-1.4:1.74,m.face>0?1.4:4.54);
   for(let i=0;i<5;i++){
    const u=i/4,xx=x-m.face*(18+u*50),yy=y+Math.sin(u*Math.PI)*12;
    ctx.fillStyle=i%2?'#ffd998':'#efb1bd';ctx.fillRect(xx,yy,4,2);
   }
   if(strike){
    ctx.stroke();
    ctx.globalAlpha=g.reduceMotion?.64:.42+(20-m.age)*.032;ctx.lineWidth=2.3;
    drawHeroAttackGlyph(ctx,'kilo',tx+m.face*29,y-24,13,m.face,-.25);
    ctx.beginPath();
   }
  }
 ctx.stroke();
 for(const impact of m.impacts||[]){
  ctx.globalAlpha=impact.life/12;ctx.strokeStyle='#fff0b1';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);
  ctx.quadraticCurveTo((x+impact.x-cam.x)/2,y-40,impact.x-cam.x,impact.y-cam.y);ctx.stroke();
 }
}

function drawRemateWake(ctx,m,cam){
 const trace=m.trace;
 if(!trace||trace.length<2)return;
 const local=trace.map(p=>[p.x-cam.x,p.y-cam.y]);
 const count=local.length;
 const palette={
  stitcho:'#80dfff',chispin:'#fff18a',cat:'#ffb5e6',
  dragon:'#ff8855',dino:'#c3ee88',frita:'#ffca70',nacar:'#8fffdb',
  yomi:'#ffc392',ia:'#aef9f5',cuerno:'#e2cfff',
 };
 ctx.strokeStyle=palette[m.id];ctx.fillStyle=palette[m.id];ctx.lineWidth=1.8;
 for(let i=1;i<count;i++){
  const [x,y]=local[i-1],[xx,yy]=local[i],phase=i/count;
  if(Math.hypot(xx-x,yy-y)>68)continue;
  ctx.globalAlpha=phase*.64;
  ctx.beginPath();
  switch(m.id){
   case 'chispin':
    ctx.moveTo(x,y);ctx.lineTo((x+xx)*.5,(y+yy)*.5+(i%2?10:-10));ctx.lineTo(xx,yy);break;
   case 'stitcho':
    ctx.ellipse(xx,yy,9+phase*6,5+phase*3,.6,0,TAU);break;
   case 'cat':
    for(const gap of [-6,0,6]){
     ctx.moveTo(x,y+gap);ctx.quadraticCurveTo((x+xx)*.5,yy+gap-12,xx,yy+gap);
    }
    break;
   case 'dragon':
    ctx.moveTo(x,y+8);ctx.quadraticCurveTo(xx-m.face*13,yy-18,xx,yy);break;
   case 'dino':
    ctx.moveTo(x,y+12);ctx.lineTo((x+xx)*.5,yy+16);ctx.lineTo(xx,yy+9);break;
   case 'frita':
    ctx.moveTo(x,y+11);ctx.quadraticCurveTo((x+xx)*.5,yy+19,xx,yy+12);break;
   case 'nacar':
    ctx.arc(xx,yy+5,4+phase*4,0,TAU);break;
   case 'yomi':
    ctx.rect(xx-3,yy-6,6,12);break;
   case 'ia':
    ctx.moveTo(x,y);ctx.lineTo(xx,y);ctx.lineTo(xx,yy);break;
   case 'cuerno':
    ctx.moveTo(x,y-6);ctx.lineTo(xx,yy);ctx.lineTo(x,y+6);break;
  }
  ctx.stroke();
 }
}

function drawBurstMotion(ctx,m,x,y,reduced,cam){
 const tuning=REMATES[m.id];if(!tuning)return;
 const [windup,active,,,lead,r]=tuning;
 const cx=x+m.face*lead;
 if(m.age<windup){
  drawAttackWindow(ctx,{x:cx,y,radius:r,color:'#d7f7e9',remaining:windup-m.age,total:windup});
 }else if(m.contact&&m.age<=active){
  const q=m.contact;
  ctx.strokeStyle='#f5fff2';ctx.lineWidth=1.8;ctx.globalAlpha=.58;
  const a=m.face>0?-1.1:Math.PI-1.1;
  ctx.beginPath();ctx.arc(q.x-cam.x,q.y-cam.y,q.r,a,a+2.2);ctx.stroke();
 }
 if(!reduced&&m.age<=active+4)drawRemateWake(ctx,m,cam);
 for(const impact of m.impacts||[]){
  ctx.globalAlpha=impact.life/12;ctx.lineWidth=2;
  drawHeroAttackGlyph(ctx,m.id,impact.x-cam.x,impact.y-cam.y,
   reduced?12:12+(12-impact.life)*1.18,m.face);
 }
}

function drawFinalRhythm(ctx,p,m,x,y,reduced,cam){
 const since=m.visualBeat==null?Infinity:m.age-m.visualBeat;
 const burst=Math.max(0,1-since/11);
 const contact=m.contact;
 if(contact&&m.age-contact.age<=4){
  const cx=contact.x-cam.x,cy=contact.y-cam.y;
  ctx.globalAlpha=.27;ctx.strokeStyle='#fff5cd';ctx.lineWidth=1.35;
  ctx.beginPath();ctx.arc(cx,cy,contact.r,0,TAU);ctx.stroke();
 }
 const foot=y+p.h*.5;
 // These marks celebrate the cadence; actual targets are drawn by field/beam FX.
 ctx.globalAlpha=.42+burst*.39;ctx.lineWidth=1.55;
 for(let i=0;i<3;i++){
  const offset=i-1;
  const sweep=reduced?0:burst*7;
  drawHeroAttackGlyph(ctx,m.id,x+offset*(21+sweep),foot+Math.abs(offset)*2,
    4+burst*3,m.face,0);
 }
 if(reduced||!burst)return;
 ctx.globalAlpha=burst*.76;ctx.lineWidth=2;
 drawHeroAttackGlyph(ctx,m.id,x-m.face*20,y-25-burst*9,11,m.face,0);
}

export function drawHeroPowers(ctx,g,cam){
 const s=g._evolutionAttacks,p=g.player;if(!s||!p)return;
 ctx.save();
 try{
  for(const o of s.oil||[]){
   ctx.fillStyle='#e6b75d77';ctx.beginPath();ctx.ellipse(o.x-cam.x,o.y-cam.y-2,35,5,0,0,TAU);ctx.fill();
  }
  const x=p.x+p.w/2-cam.x,y=p.y+p.h/2-cam.y;
  for(const m of s.moves||[]){
   ctx.save();
   if(m.id==='kilo')drawKiloPower(ctx,g,cam,m,x,y,p);
   else if(m.index===4)drawBurstMotion(ctx,m,x,y,!!g.reduceMotion,cam);
   else drawFinalRhythm(ctx,p,m,x,y,!!g.reduceMotion,cam);
   ctx.restore();
  }
 }finally{ctx.restore();}
}

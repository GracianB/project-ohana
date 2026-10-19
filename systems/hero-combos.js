const mid=e=>({x:e.x+e.w/2,y:e.y+e.h/2});
const living=e=>e&&e.hp>0&&!e.dying&&!e.fell;
const close=(g,x,y,r)=>g.enemies.filter(living).filter(e=>Math.hypot(mid(e).x-x,mid(e).y-y)<r);
export const HERO_POWERS=Object.freeze({
 kilo:['Paso de hula','A compás del sol','Deslízate y golpea al terminar.','Pulsa P al llegar cada uno de los tres pulsos.'],
 stitcho:['Rebote 626','Flota cruzada','Rebota hacia el siguiente enemigo al acertar.','La flota cruza la zona que señalas al mirar.'],
 chispin:['Carrera relámpago','Tormenta enlazada','Cruza enemigos y conecta las marcas de J.','Detona las marcas y encadena descargas.'],
 cat:['Garra ascendente','Cacería lunar','Zarpazo aéreo que rebota al acertar.','Persigue tus presas y termina con una caída lunar.'],
 dragon:['Picado del cometa','Vuelo volcánico','Pica y recupera altura al golpear.','Dirige el vuelo y deja una estela de fuego.'],
 dino:['Carga fósil','Estampida ancestral','Arrastra enemigos ligeros durante la carga.','Encadena tres saltos y golpes de suelo.'],
 frita:['Derrape de aceite','Freidora exprés','Deslízate dejando aceite en el recorrido.','Enciende tus pistas de aceite y acaba con una explosión.'],
 pizza:['Porción de regreso','Rueda de pizza','La porción regresa hacia tu posición actual.','Conduce la rueda y lanza porciones al terminar.'],
 yomi:['Paso del umbral','Tres ecos','Atraviesa enemigos y recuerda el recorrido del corte.','Los espíritus repiten tus tres últimos cortes.'],
 cuerno:['Lanza de aurora','Arco de constelaciones','Carga atravesando una fila de enemigos.','Salta sobre un arco y deja caer lanzas tras de ti.'],
});
export function beginHeroPower(g,index,s){
 const p=g.player,id=p.id,c=mid(p),face=p.facing||1,final=index===5;
 const move={id,index,age:0,life:final?120:24,face,start:c,hit:new Set(),beats:new Set(),bonus:0,phase:0};
 if(final){p._finisherActive=true;move.life=id==='stitcho'?100:id==='yomi'?96:120;}
 else if(id==='pizza'){
  s.shots.push({id,x:c.x,y:c.y,vx:face*12,vy:0,damage:35,kind:'return',age:0,life:100,r:12,hit:new Set(),origin:p});move.life=1;
 }else if(id==='cat'||id==='dragon'){p.vy=id==='cat'?-9:9;p.grounded=false;move.life=32;}
 if(id==='yomi'&&!final){p._spectralCuts||=[];p._spectralCuts.push({x:c.x,y:c.y,face});p._spectralCuts=p._spectralCuts.slice(-3);}
 if(id==='cat'&&final)move.prey=close(g,c.x,c.y,800).filter(e=>e._lunarMarkUntil>(g.t||0));
 if(id==='yomi'&&final)move.cuts=(p._spectralCuts||[]).map(v=>({...v}));
 s.moves||=[];s.moves.push(move);return move;
}
export function rhythmPress(g){
 const m=g._evolutionAttacks?.moves?.find(m=>m.id==='kilo'&&m.index===5);if(!m)return false;
 const next=[30,60,90].find(t=>Math.abs(m.age-t)<=8&&!m.beats.has(t));
 if(next){m.beats.add(next);m.bonus++;g.nums?.add?.(g.player.x,g.player.y-25,'¡A COMPÁS!','#fff0b1',true);}return true;
}
export function updateHeroPowers(g,s,hit,color){
 const p=g.player;s.moves||=[];p._finisherActive=s.moves.some(m=>m.index===5);
 const pulse=(m,x,y,r,damage,once=true)=>{for(const e of close(g,x,y,r)){
  if(once&&m.hit.has(e))continue;const landed=hit(g,e,damage,{color:color(m.id),kx:m.face*5,ky:-4,hitstop:0});
  if(!landed)continue;m.hit.add(e);
  if(m.id==='cat')e._lunarMarkUntil=(g.t||0)+360;
  if(m.id==='stitcho'&&m.index===4){p.vy=-7;p.grounded=false;m.face=Math.sign(mid(close(g,x,y,400).find(v=>v!==e)||p).x-x)||-m.face;}
  if(['cat','dragon'].includes(m.id)&&m.index===4){p.vy=-11;p.grounded=false;p.jumps=Math.max(0,(p.jumps||0)-1);}
  if(m.id==='dino'&&!e.boss){e.vx=m.face*11;e.vy=-2;}
 }};
 const field=(m,x,y,r,damage,mode='burst',delay=12)=>s.fields.push({id:m.id,x,y,age:0,life:delay+20,r,damage,mode,next:delay,noCharge:m.index===5});
 for(const m of s.moves){m.age++;m.life--;const c=mid(p),a=m.age,final=m.index===5;
  if(!final){
   if(m.id!=='pizza'){
    p.vx=m.face*(m.id==='cuerno'?13:m.id==='frita'?12:m.id==='kilo'?8:10);
    if(m.id==='yomi')p.invuln=Math.max(p.invuln||0,2);
    if(m.id==='kilo'){if(a===20)pulse(m,c.x+m.face*40,c.y,100,48);}
    else pulse(m,c.x+m.face*20,c.y,Math.max(p.w*.65,48),m.id==='cuerno'?42:32);
    if(m.id==='chispin')for(const e of close(g,c.x,c.y,260))if(e._chispaMarkUntil>(g.t||0)&&!m.hit.has(e)){pulse(m,mid(e).x,mid(e).y,45,38);}
    if(m.id==='frita'&&a%6===0){s.oil||=[];s.oil.push({x:c.x,y:p.y+p.h,life:480});s.oil=s.oil.slice(-32);}
   }
  }else if(m.id==='kilo'){
   if([22,52,82].includes(a))g.nums?.add?.(p.x,p.y-35,'P · ¡AHORA!','#ffefa2',true);
   if([36,66,96].includes(a)){m.hit.clear();pulse(m,c.x,c.y,210+m.bonus*45,36+m.bonus*12);field(m,c.x,c.y,210+m.bonus*45,12,'garden',1);}
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
  }else if(m.id==='dino'){
   p.vx=(p.facing||m.face)*8;if([1,40,80].includes(a)){p.vy=-10;p.grounded=false;m.phase++;}
   if(a%40===32){m.hit.clear();pulse(m,c.x,p.y+p.h,180,56);field(m,c.x,p.y+p.h,180,18,'quake',1);}
  }else if(m.id==='frita'){
   p.vx=(p.facing||m.face)*13;if(a===1)for(const oil of s.oil||[])field(m,oil.x,oil.y-30,95,44,'fryer',8);
   pulse(m,c.x,c.y,65,38);if(a===119)field(m,c.x,c.y,210,85,'fryer',1);
  }else if(m.id==='pizza'){
   p.vx=(p.facing||m.face)*11;pulse(m,c.x,c.y,Math.max(65,p.w),45);
   if(a===119)for(let i=-2;i<=2;i++)s.shots.push({id:m.id,x:c.x,y:c.y,vx:Math.cos(i*.3)*m.face*12,vy:Math.sin(i*.3)*10,damage:40,noCharge:true,kind:'return',age:0,life:75,r:12,hit:new Set(),origin:p});
  }else if(m.id==='yomi'){
   if([12,40,68].includes(a)){const cut=m.cuts[Math.floor(a/28)]||{...m.start,face:m.face};field(m,cut.x+cut.face*80,cut.y,130,72,'pounce',12);s.beams.push({id:m.id,x:cut.x,y:cut.y,tx:cut.x+cut.face*190,ty:cut.y,life:18});}
  }else if(m.id==='cuerno'){
   if(a===1){p.vy=-12;p.grounded=false;}p.vx=m.face*6;
   if(a%12===0){const below=close(g,c.x,c.y+120,450).filter(e=>Math.abs(mid(e).x-c.x)<100).sort((u,v)=>Math.abs(mid(u).y-c.y)-Math.abs(mid(v).y-c.y))[0];field(m,c.x,below?mid(below).y:p.y+p.h+80,85,45,'constellation',18);}
  }
 }
 s.moves=s.moves.filter(m=>m.life>0);s.oil=(s.oil||[]).filter(o=>--o.life>0);p._finisherActive=s.moves.some(m=>m.index===5);
}
export function drawHeroPowers(ctx,g,cam){
 const s=g._evolutionAttacks;if(!s)return;ctx.save();
 for(const o of s.oil||[]){ctx.fillStyle='#e6b75d77';ctx.beginPath();ctx.ellipse(o.x-cam.x,o.y-cam.y-2,35,5,0,0,Math.PI*2);ctx.fill();}
 for(const m of s.moves||[]){const p=g.player,x=p.x+p.w/2-cam.x,y=p.y+p.h/2-cam.y;ctx.strokeStyle=m.index===5?'#fff1b5':'#b6f5ed';ctx.lineWidth=3;ctx.globalAlpha=.6;ctx.beginPath();
  if(m.id==='pizza'||m.id==='stitcho')ctx.arc(x,y,Math.max(p.w,p.h)*.65,0,Math.PI*2);
  else if(m.id==='kilo'&&m.index===5){const r=60+((m.age%30)/30)*90;ctx.ellipse(x,p.y+p.h-cam.y,r,r*.24,0,0,Math.PI*2);ctx.font='bold 16px sans-serif';ctx.fillStyle='#fff2c6';ctx.textAlign='center';ctx.fillText('P · A COMPÁS',x,y-75);}
  else{ctx.moveTo(x-m.face*70,y+15);ctx.quadraticCurveTo(x-m.face*30,y-30,x+m.face*40,y);}ctx.stroke();
 }ctx.restore();
}

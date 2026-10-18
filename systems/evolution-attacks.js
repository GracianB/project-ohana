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
 dragon:['#ff9961','flame','Cometa de fuego','Alas del volcán','comet','garden'],
 dino:['#c3ef91','fossil','Pisotón fósil','Estampida ancestral','quake','stampede'],
 frita:['#ffe6a1','salt','Abanico crujiente','Festival de freidoras','fan','garden'],
 pizza:['#ffc774','slice','Porción boomerang','Rueda de porciones','return','orbit'],
 yomi:['#d5bcff','seal','Corte del umbral','Desfile de espíritus','cross','fleet'],
 cuerno:['#d7f9fa','prism','Lanza de aurora','Lluvia de constelaciones','lance','thunder']
};
export const POWER_LEVELS=Object.freeze([0,1,2,0,3,4]);
export function extraAbility(id,index){
 const d=THEMES[id];if(!d||![4,5].includes(index))return null;
 return {id:`${id}_${index===4?'ascend':'finale'}`,key:index===4?'I':'P',name:d[index===4?2:3],color:d[0],cd:index===4?3600:7200,
  desc:index===4?'Ataque propio de la cuarta forma. Mejora en la forma final.':'Ataque final: despliega todo el poder de esta evolución.'};
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
export function startBattleCompanion(g,id,power=1){
 if(!THEMES[id]||!g.player)return false;
 const s=state(g),p=g.player,c=center(p);
 s.guest={id,x:c.x-(p.facing||1)*110,y:p.y+p.h,age:0,life:360,power,next:35,face:p.facing||1,attack:0};
 g._assist={heroId:id,heroName:id,t:360};
 return true;
}
export function castEvolutionAttack(g,index){
 const p=g.player,d=THEMES[p.id],s=state(g),e=tier(p),c=center(p),face=p.facing||1;
 const mode=d[index===4?4:5],damage=((index===4?22:30)+(e-3)*7)*(Number(p._flowPower)||1);
 const n=index===4?5+(e-3)*2:9;
 if(['fleet'].includes(mode)){
  for(let i=0;i<5;i++)s.drones.push({id:p.id,x:c.x+(i-2)*40,y:c.y-100,age:0,life:220,index:i,count:5,next:12+i*5});
 }else if(['garden','quake','thunder'].includes(mode)){
  const enemies=targets(g,c.x,c.y,900),count=mode==='quake'?4:6;
  for(let i=0;i<count;i++){
   const target=enemies[i%Math.max(1,enemies.length)],at=target?center(target):{x:c.x+face*(65+i*85),y:c.y};
   s.fields.push({id:p.id,x:at.x,y:at.y,age:-i*8,life:mode==='garden'?170:48,r:mode==='quake'?85:65,damage,mode,next:24});
  }
 }else if(mode==='pounce'){
  const end=clamp(c.x+face*(180+e*15),20,(g.worldW||3000)-20);
  s.fields.push({id:p.id,x:(c.x+end)/2,y:c.y,age:0,life:32,r:Math.abs(end-c.x)/2+30,damage:damage*1.5,mode:'pounce',next:10});
 }else{
  for(let i=0;i<n;i++){
   const a=mode==='orbit'?i*TAU/n:mode==='cross'?(i-(n-1)/2)*.22:(i-(n-1)/2)*.13;
   shot(s,p,p.id,c.x,c.y,Math.cos(a)*face*(mode==='lance'?15:9),Math.sin(a)*9,damage,mode);
  }
 }
 p._cast={slot:index===4?0:2,t:g.t,id:extraAbility(p.id,index).id,form:e};
 g.nums?.add?.(c.x,p.y-36,extraAbility(p.id,index).name,d[0],true);
}
function beam(s,id,x,y,to){s.beams.push({id,x,y,tx:to.x,ty:to.y,life:10});}
export function updateEvolutionAttacks(g,hit,heal){
 const p=g.player;if(!p)return;const s=state(g);if(p.dead){s.shots=[];s.fields=[];s.drones=[];s.beams=[];s.guest=null;g._assist=null;return;}
 s.age++;s.beams=s.beams.filter(b=>--b.life>0);
 const e=tier(p),c=center(p);
 for(const d of s.drones){
  d.age++;d.life--;const list=targets(g,d.x,d.y,720),target=list[d.index%Math.max(1,list.length)];
  const goal=target?center(target):c,tx=goal.x+(d.index-(d.count-1)/2)*44,ty=goal.y-90;
  d.x+=(tx-d.x)*.08;d.y+=(ty-d.y)*.08;
  if(--d.next<=0&&target){d.next=36;const t=center(target);beam(s,d.id,d.x,d.y,t);
   const landed=hit(g,target,(9+e*3)*(Number(p._flowPower)||1),{color:THEMES[d.id][0],parts:4,hitstop:0});
   if(d.dance&&landed&&s.lastDanceHeal!==Math.floor(s.age/24)){heal(p,2+e);s.lastDanceHeal=Math.floor(s.age/24);}
  }
 }
 s.drones=s.drones.filter(d=>d.life>0).slice(-24);
 for(const f of s.fields){
  f.age++;if(f.age<0)continue;f.life--;
  if(f.age===f.next){
   for(const target of targets(g,f.x,f.y,f.r))hit(g,target,f.damage,{color:THEMES[f.id][0],kx:Math.sign(center(target).x-f.x)*4,ky:-3,hitstop:0});
   if(f.mode==='garden')f.next+=30;
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
   b.hit.add(t);hit(g,t,b.damage,{color:THEMES[b.id][0],parts:5,hitstop:0});
   if(b.kind==='comet')s.fields.push({id:b.id,x:b.x,y:b.y,age:0,life:25,r:80,damage:b.damage*.6,mode:'burst',next:1});
   if(!['lance','chain','return','stampede'].includes(b.kind)||b.hit.size>=4){b.life=0;break;}
  }
 }
 s.shots=s.shots.filter(b=>b.life>0);
 const a=s.guest;
 if(a){
  a.age++;a.life--;a.attack=Math.max(0,a.attack-1);
  const target=targets(g,c.x,c.y,950)[0],q=target?center(target):c;
  const tx=q.x-(p.facing||1)*70,ty=target?target.y+target.h:p.y+p.h;
  a.x+=clamp(tx-a.x,-7,7);a.y+=(ty-a.y)*.13;a.face=q.x>=a.x?1:-1;
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
 else if(shape==='slice'){ctx.moveTo(0,-r);ctx.lineTo(r,r);ctx.lineTo(-r,r);}
 else if(shape==='moon'){ctx.arc(0,0,r,.5,5.8);ctx.quadraticCurveTo(-r*.4,0,r*Math.cos(.5),r*Math.sin(.5));}
 else if(shape==='seal'){ctx.rect(-r*.5,-r,r,r*2);}
 else{for(let i=0;i<5;i++){const a=i*TAU/5;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);ctx.lineTo(Math.cos(a+.6)*r*.4,Math.sin(a+.6)*r*.4);}}
 ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
}
export function drawEvolutionAttacks(ctx,g,cam,t,drawActor,roster){
 const s=g._evolutionAttacks;if(!s||s.owner!==g.player||s.room!==g.roomId)return;
 ctx.save();
 for(const f of s.fields){if(f.age<0)continue;const x=f.x-cam.x,y=f.y-cam.y,warn=f.age<f.next;
  ctx.globalAlpha=warn?.32:.7;ctx.strokeStyle=THEMES[f.id][0];ctx.lineWidth=warn?2:4;ctx.setLineDash(warn?[6,5]:[]);ctx.beginPath();ctx.ellipse(x,y,f.r,Math.max(12,f.r*.35),0,0,TAU);ctx.stroke();ctx.setLineDash([]);
  for(let i=0;i<5;i++){const a=i*TAU/5;glyph(ctx,f.id,x+Math.cos(a)*f.r*.7,y+Math.sin(a)*f.r*.25,8,g.reduceMotion?0:t);}
 }
 ctx.globalAlpha=1;
 for(const b of s.shots)glyph(ctx,b.id,b.x-cam.x,b.y-cam.y,b.r+3,g.reduceMotion?0:t);
 for(const d of s.drones){const x=d.x-cam.x,y=d.y-cam.y;ctx.fillStyle=THEMES[d.id][0];ctx.strokeStyle='#273652';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y,20,7,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#d5faff';ctx.beginPath();ctx.ellipse(x,y-5,10,8,0,Math.PI,TAU);ctx.fill();ctx.stroke();for(let i=0;i<3;i++){ctx.fillStyle=i===Math.floor(t/6)%3?'#fff6ae':'#6267b6';ctx.beginPath();ctx.arc(x-10+i*10,y+1,2,0,TAU);ctx.fill();}}
 for(const b of s.beams){ctx.globalAlpha=b.life/10;ctx.strokeStyle=THEMES[b.id][0];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(b.x-cam.x,b.y-cam.y);ctx.lineTo(b.tx-cam.x,b.ty-cam.y);ctx.stroke();glyph(ctx,b.id,b.tx-cam.x,b.ty-cam.y,10,t);}
 ctx.globalAlpha=1;const a=s.guest;
 if(a){const def=roster.find(r=>r.id===a.id),e=tier(g.player),f=def?.forms[e];if(f){ctx.globalAlpha=Math.min(1,a.age/16,a.life/18);drawActor(ctx,{...def,...f,id:a.id,evo:e,x:a.x-f.w/2,y:a.y-f.h,facing:a.face,vx:a.attack?0:a.face*4,vy:0,grounded:true,_poseOverride:a.attack?'attack':'run',_duetActor:true,_introForceCanvas:true,visualScale:.85},cam,t,{reduceMotion:!!g.reduceMotion});}}
 ctx.restore();
}

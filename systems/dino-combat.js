// Project OHANA · Dino-specific combat animation, isolated from the shared engine.
import { drawDinoFossilForecast, drawDinoRollingShell } from "./dino-stagecraft.js";
// Injecting helpers keeps the original cast/update contracts and JS budget intact.
export function createDinoEffects(ops) {
 const { nearestEnemy, canHit, cx, cy, solidAt, circleHit, hitEnemy, boom,
   add, clamp, inView, groundBelow } = ops;
 const TAU = Math.PI * 2;
 // The U is its own gameplay system; the shared ability engine only calls in.
 const cap = (v,a,b) => Math.max(a,Math.min(b,v));
 const visibleTargets = (g) => (g.enemies || []).filter(e => canHit(e) && inView(g,e));
 const chooseFossilTarget = (g,x,y,p,idx) => {
   const list = visibleTargets(g).sort((a,b) =>
     Math.hypot(cx(a)-x,cy(a)-y)-Math.hypot(cx(b)-x,cy(b)-y));
   const e = list.length ? list[idx%Math.min(5,list.length)] : null;
   const rawX = e ? cx(e) : cx(p)+(p.facing||1)*(80+idx*54);
   const lead = e ? cap((Number(e.vx)||0)*7,-52,52) : 0;
   const tx = cap(rawX+lead,22,(g.worldW||1600)-22);
   const ty = e ? cy(e) : p.y+p.h;
   const floor = groundBelow(g,tx,ty) ?? (e ? e.y+e.h : p.y+p.h);
   return {x:tx,y:floor};
 };
 return {
   castUltimate(g,p,enemies,dmg,color) {
     // Keep the original immediate Colossus hit and boss handling. New
     // aftershocks follow, rather than multiplying one-frame screen damage.
     for(const e of enemies) hitEnemy(g,e,dmg*1.06,{
       kx:Math.sign(cx(e)-cx(p))*15,ky:-12,stun:62,
       color,crit:true,shake:2,parts:8
     });
     const span=260;
     p._specialT=Math.max(Number(p._specialT)||0,span);
     p._specialTitanT=Math.max(Number(p._specialTitanT)||0,span);
     p._specialArmorT=Math.max(Number(p._specialArmorT)||0,span);
     p.invuln=Math.max(Number(p.invuln)||0,72);
     g._dinoUltimate={beats:5,version:77,remaining:span};
     add({kind:"dinoColossus",x:cx(p),y:cy(p),life:span,max:span,
       nextPulse:28,nextFossil:34,beat:0,stones:0,
       dmg:dmg*.17,color:color||"#c8f04a",evo:cap(Number(p.evo)||0,0,4)});
     g.nums?.add?.(cx(p),p.y-50,"¡DESPIERTA, COLOSO!","#eaffb5",true);
     g.shake=Math.min(18,(g.shake||0)+9);
     boom(g,cx(p),p.y+p.h,"#eaffb5",9,{up:1.6,star:true});
   },
   update: {
 dinoColossus(g,f,p){
   if(--f.life<=0){if(g._dinoUltimate)g._dinoUltimate.remaining=0;return false;}
   f.x=cx(p);f.y=cy(p);
   const elapsed=f.max-f.life;
   const maxStones=g.reduceMotion?3:Math.min(8,4+f.evo);
   if(--f.nextPulse<=0){
     f.nextPulse=34;
     f.beat++;
     const range=245+f.evo*46;
     for(const e of visibleTargets(g)){
       if(Math.hypot(cx(e)-f.x,cy(e)-f.y)>range+Math.max(e.w,e.h)*.5)continue;
       hitEnemy(g,e,f.dmg,{kx:Math.sign(cx(e)-f.x)*5,ky:-6,stun:21,
         color:"#bbff97",hitstop:0,shake:0,parts:3});
     }
     if(!g.reduceMotion)g.shake=Math.min(10,(g.shake||0)+2);
     boom(g,f.x,p.y+p.h,"#c6fa87",g.reduceMotion?2:5,{speed:1.6,up:.6});
   }
   if(elapsed>=37&&f.stones<maxStones&&--f.nextFossil<=0){
     const dest=chooseFossilTarget(g,f.x,f.y,p,f.stones);
     const dir=f.stones%2===0?1:-1;
     const spawnY=Math.min((g.cam?.y||0)-48,dest.y-225);
     const vx=dir*(1.8+f.evo*.18);
     const time=Math.max(16,(dest.y-spawnY)/11);
     add({kind:"dinoFossil",x:dest.x-vx*time,y:spawnY,
       vx,vy:11,landX:dest.x,landY:dest.y,
       r:10+f.evo*1.2,dmg:f.dmg*1.22,R:48+f.evo*6,
       life:120,age:0,rot:f.stones*.93});
     const frames=cap(Math.round(time),18,48);
     add({kind:"dinoFossilMark",x:dest.x,y:dest.y,life:frames,max:frames});
     f.stones++;
     f.nextFossil=g.reduceMotion?45:25;
   }
   if(g._dinoUltimate)g._dinoUltimate.remaining=f.life;
   return true;
 },
 dinoFossil(g,f) {
   if(--f.life<=0)return false;
   f.rot+=.08;f.age++;
   f.x+=f.vx;f.y+=f.vy;
   const enemy=(g.enemies||[]).some(e=>canHit(e)&&circleHit(f.x,f.y,f.r*.85,e));
   const terrain=f.y+f.r>=f.landY-3;
   if(!enemy&&!terrain)return f.y<(g.worldH||900)+100;
   const y=terrain?Math.min(f.y,f.landY):f.y;
   // One finite area impact; no persistent damage loops or boss executions.
   for(const e of (g.enemies||[])){
     if(!canHit(e)||Math.hypot(cx(e)-f.x,cy(e)-y)>f.R+Math.max(e.w,e.h)*.5)continue;
     hitEnemy(g,e,f.dmg,{kx:Math.sign(cx(e)-f.x)*6,ky:-6,stun:20,
       color:"#d1ffa0",shake:1,hitstop:0,parts:4});
   }
   add({kind:"dinoFossilBlast",x:f.x,y,life:17,max:17,r:f.R});
   boom(g,f.x,y,"#c7ff95",g.reduceMotion?3:7,{up:1.3,star:true});
   g.shake=Math.min(13,(g.shake||0)+(g.reduceMotion?1:3));
   return false;
 },
 dinoFossilMark(g,f){return --f.life>0;},
 dinoFossilBlast(g,f){return --f.life>0;},

dinoSpit(g,f) {
 if(f.delay>0){f.delay--;return true;}
 if(--f.life<=0)return false;
 const range=590+f.evo*55;
 if(!f.target||!canHit(f.target)||Math.hypot(cx(f.target)-f.x,cy(f.target)-f.y)>range*1.5)
   f.target=nearestEnemy(g,f.x,f.y,range,null,f.face);
 if((f.wallDodge||0)>0) f.wallDodge--;
 if(f.target && !(f.wallDodge>0)){
   // Lead airborne / running enemies slightly so spit curves *to* them,
   // without unfair teleporting or sudden 180-degree snaps.
   const v=7.5+f.evo*.62;
   const distance=Math.hypot(cx(f.target)-f.x,cy(f.target)-f.y);
   const lookahead=cap(distance/v*.32,0,8);
   const tx=cx(f.target)+cap(Number(f.target.vx)||0,-8,8)*lookahead;
   const ty=cy(f.target)+cap(Number(f.target.vy)||0,-7,7)*lookahead;
   const dx=tx-f.x,dy=ty-f.y,d=Math.hypot(dx,dy)||1;
   const k=.11+f.evo*.018;
   f.vx+=((dx/d)*v-f.vx)*k;f.vy+=((dy/d)*v-f.vy)*k;
 }else f.vy+=Math.sin(f.age*.1)*.035;
 const speed=Math.hypot(f.vx,f.vy),limit=10.5+f.evo*.62;
 if(speed>limit){f.vx*=limit/speed;f.vy*=limit/speed;}
 f.trail.push({x:f.x,y:f.y});
 const maxTrail=g.reduceMotion?3:7;
 if(f.trail.length>maxTrail)f.trail.shift();
 // Swept collision: a 12 px cartoon globule must not tunnel through a
 // 6 px enemy or a narrow wall at high speed.
 const steps=Math.min(5,Math.max(1,Math.ceil(Math.hypot(f.vx,f.vy)/Math.max(3,f.radius*.55))));
 for(let step=0;step<steps;step++){
   const nx=f.x+f.vx/steps,ny=f.y+f.vy/steps;
   if(solidAt(g,nx,ny)){
     // One goofy boing, then a splat: deterministic and no infinite loops.
     if(!(f.bounces>0) && f.life>14){
       f.bounces=1;
       f.vx=-f.vx*.82;
       f.vy=-f.vy*.52-1.4;
       f.wallDodge=16;
       f.target=null;
       boom(g,f.x,f.y,"#fff6bb",3,{size:2,speed:1.25});
       return true;
     }
     boom(g,f.x,f.y,f.color,4,{size:2.4,speed:1.3});
     add({kind:"dinoSplat",x:f.x,y:f.y,life:12,max:12,color:f.color,radius:f.radius});
     return false;
   }
   f.x=nx;f.y=ny;
   for(const e of g.enemies||[]){
     if(!canHit(e)||!circleHit(f.x,f.y,f.radius,e))continue;
     hitEnemy(g,e,f.dmg,{kx:Math.sign(f.vx)*6,ky:-3,stun:18,color:f.color,shake:1,hitstop:1,parts:5});
     if(f.evo>=3)for(const other of g.enemies||[]){
       if(other===e||!canHit(other)||Math.hypot(cx(other)-f.x,cy(other)-f.y)>23+f.evo*4)continue;
       hitEnemy(g,other,f.dmg*.34,{kx:3*f.face,ky:-2,stun:9,color:f.color,shake:0,hitstop:0,parts:3});
     }
     boom(g,f.x,f.y,f.color,7,{size:2.8,star:true,speed:1.8});
     add({kind:"dinoSplat",x:f.x,y:f.y,life:18,max:18,color:f.color,radius:f.radius});
     return false;
   }
 }
 return f.x>-30&&f.x<(g.worldW||1600)+30&&f.y>-120&&f.y<(g.worldH||900)+80;
},
dinoSplat(g,f){return --f.life>0;},
dinoSkyfall(g,f,p){
 if(f.next-->0)return true;
 const enemies=(g.enemies||[]).filter(e=>canHit(e)&&inView(g,e))
   .sort((a,b)=>Math.abs(cx(a)-f.origin)-Math.abs(cx(b)-f.origin));
 const target=enemies.length?enemies[f.i%enemies.length]:null;
 const rawX=target?cx(target):f.origin+f.face*(85+f.i*55);
 // Predict a limited amount of enemy movement during the descent.
 const lead=target?clamp((Number(target.vx)||0)*9,-68,68):0;
 const tx=clamp(rawX+lead,32,(g.worldW||1600)-32);
 const enemyY=target?cy(target):p.y+p.h;
 // Every warning points to the actual terrain under its projected impact.
 const ty=groundBelow(g,tx,enemyY)??enemyY;
 const startY=Math.min((g.cam?.y||0)-70,ty-245);
 const travel=Math.max(1,(ty-startY)/10.5);
 const dir=f.i%2===0?1:-1,vx=dir*(1.45+f.evo*.13);
 add({kind:"meteor",dino:true,x:tx-vx*travel,y:startY,vx,vy:10.5,
   r:11+f.evo*1.25+(f.i%3)*1.5,dmg:f.dmg,R:f.radius,life:175,rot:f.i*1.31});
 const duration=Math.min(65,Math.max(22,Math.round(travel)));
 add({kind:"dinoWarning",x:tx,y:ty,life:duration,max:duration});
 f.i++;f.next=9+(f.i%3)*3;return f.i<f.n;
},
dinoWarning(g,f){return --f.life>0;},
   },
   draw: {
dinoColossus(ctx,f,cam,t,g,p){
  const x=f.x-(cam?.x||0), y=f.y-(cam?.y||0),fade=cap(f.life/24,0,1);
  const phase=(f.max-f.life)/f.max;
  ctx.save();ctx.globalCompositeOperation="lighter";
  ctx.strokeStyle="#cbff9a";ctx.lineWidth=3;ctx.globalAlpha=.38*fade;
  for(let i=0;i<3;i++){
    const a=(phase*5-i/3)%1,rr=35+a*(125+f.evo*24);
    if(a<=0)continue;
    ctx.globalAlpha=(1-a)*fade*.38;
    ctx.beginPath();ctx.ellipse(x,y+18,rr,rr*.32,0,0,TAU);ctx.stroke();
  }
  const scale=1+.12*Math.sin(t*.085);
  ctx.globalAlpha=(.09+.05*Math.sin(t*.11))*fade;
  ctx.fillStyle="#ddffad";ctx.beginPath();
  ctx.ellipse(x,y,38*scale,51*scale,0,0,TAU);ctx.fill();
  ctx.restore();
},
dinoFossil(ctx,f,cam,t){
  const x=f.x-(cam?.x||0),y=f.y-(cam?.y||0);
  ctx.save();
  const sp=Math.hypot(f.vx,f.vy)||1,ex=x-f.vx/sp*46,ey=y-f.vy/sp*46;
  const grad=ctx.createLinearGradient(ex,ey,x,y);
  grad.addColorStop(0,"rgba(130,250,135,0)");
  grad.addColorStop(1,"rgba(245,255,165,.92)");
  ctx.strokeStyle=grad;ctx.lineWidth=f.r*1.25;ctx.lineCap="round";
  ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(x,y);ctx.stroke();
  ctx.translate(x,y);ctx.rotate(f.rot);
  ctx.fillStyle="#556645";ctx.strokeStyle="#d9ff9c";ctx.lineWidth=2;
  ctx.beginPath();
  for(let i=0;i<7;i++){const a=i*TAU/7,r=f.r*(.86+(i%3)*.08);
    if(i===0)ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);
    else ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);
  }
  ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle="#fff4b2";ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(-f.r*.4,-f.r*.32);
  ctx.lineTo(-f.r*.02,0);ctx.lineTo(f.r*.42,f.r*.14);ctx.stroke();
  ctx.restore();
},
dinoFossilMark(ctx,f,cam,t,g){drawDinoFossilForecast(ctx,f,cam,t,!!g?.reduceMotion);},
dinoFossilBlast(ctx,f,cam,t){
  const x=f.x-(cam?.x||0),y=f.y-(cam?.y||0);
  const k=1-f.life/f.max;
  ctx.save();ctx.globalAlpha=(1-k)*.78;
  ctx.strokeStyle="#d9ffad";ctx.lineWidth=4*(1-k)+1;
  ctx.beginPath();ctx.ellipse(x,y,f.r*(.34+k*.9),f.r*(.17+k*.5),0,0,TAU);ctx.stroke();
  ctx.restore();
},
dinoSpit(ctx,f,cam,t){
 if(f.delay>0)return;
 const ox=cam?.x||0,oy=cam?.y||0,x=f.x-ox,y=f.y-oy;
 for(let i=0;i<f.trail.length;i++){
   const q=f.trail[i],a=(i+1)/(f.trail.length+1);
   ctx.globalAlpha=a*.3;ctx.fillStyle=f.color;ctx.beginPath();
   ctx.arc(q.x-ox,q.y-oy,f.radius*a*.7,0,TAU);ctx.fill();
 }
 ctx.globalAlpha=1;
 const wobble=Math.sin(t*.25+f.evo)*.13;
 if(f.bounces>0){ctx.strokeStyle="#fff4ad";ctx.globalAlpha=.64;ctx.lineWidth=1.5;
   ctx.beginPath();ctx.arc(x,y,f.radius*1.26,0,TAU);ctx.stroke();ctx.globalAlpha=1;}
 ctx.fillStyle=f.color;ctx.strokeStyle="#3a794b";ctx.lineWidth=1.7;
 ctx.beginPath();ctx.ellipse(x,y,f.radius*(1+wobble),f.radius*(1-wobble),0,0,TAU);ctx.fill();ctx.stroke();
 for(const dx of [-.31,.31]){
   ctx.fillStyle="#fffef0";ctx.beginPath();ctx.arc(x+dx*f.radius,y-f.radius*.2,f.radius*.23,0,TAU);ctx.fill();
   const pupilDrift=Math.max(-1,Math.min(1,f.vx/10))*f.radius*.055;
   const blink=Math.sin(t*.13+f.evo*2.2)> .993 ? .16 : 1;
   ctx.fillStyle="#274632";ctx.beginPath();
   ctx.ellipse(x+dx*f.radius+pupilDrift,y-f.radius*.2,f.radius*.1,f.radius*.11*blink,0,0,TAU);ctx.fill();
 }
 ctx.strokeStyle="#3a794b";ctx.lineWidth=1.3;ctx.lineCap="round";
 ctx.beginPath();ctx.arc(x,y+f.radius*.23,f.radius*.27,.1,Math.PI-.1);ctx.stroke();
 ctx.fillStyle="#fffbe6";ctx.beginPath();ctx.arc(x-f.radius*.42,y-f.radius*.5,f.radius*.17,0,TAU);ctx.fill();
},
dinoSplat(ctx,f,cam){
 const x=f.x-(cam?.x||0),y=f.y-(cam?.y||0),u=1-f.life/f.max;
 ctx.globalAlpha=.65*(1-u);ctx.strokeStyle=f.color;ctx.lineWidth=2.5;
 ctx.beginPath();ctx.ellipse(x,y,f.radius*(1+u*2.2),f.radius*(.6+u),0,0,TAU);ctx.stroke();
},
dinoWarning(ctx,f,cam,t,g){drawDinoFossilForecast(ctx,f,cam,t,!!g?.reduceMotion);},
   },
   drawRollShell(ctx,p,cam,t,g){drawDinoRollingShell(ctx,p,cam,t,!!g?.reduceMotion);}
 };
}

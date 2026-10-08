// Project OHANA · Dino-specific combat animation, isolated from the shared engine.
// Injecting helpers keeps the original cast/update contracts and JS budget intact.
export function createDinoEffects(ops) {
 const { nearestEnemy, canHit, cx, cy, solidAt, circleHit, hitEnemy, boom,
   add, clamp, inView } = ops;
 const TAU = Math.PI * 2;
 return {
   update: {
dinoSpit(g,f) {
 if(f.delay>0){f.delay--;return true;}
 if(--f.life<=0)return false;
 if(!f.target||!canHit(f.target))f.target=nearestEnemy(g,f.x,f.y,590+f.evo*55,null,f.face);
 if(f.target){
   const dx=cx(f.target)-f.x,dy=cy(f.target)-f.y,d=Math.hypot(dx,dy)||1;
   const v=7.5+f.evo*.62,k=.11+f.evo*.018;
   f.vx+=((dx/d)*v-f.vx)*k;f.vy+=((dy/d)*v-f.vy)*k;
 }else f.vy+=Math.sin(f.age*.1)*.035;
 const speed=Math.hypot(f.vx,f.vy),limit=10.5+f.evo*.62;
 if(speed>limit){f.vx*=limit/speed;f.vy*=limit/speed;}
 f.trail.push({x:f.x,y:f.y});if(f.trail.length>7)f.trail.shift();
 const nx=f.x+f.vx,ny=f.y+f.vy;
 if(solidAt(g,nx,ny)){boom(g,f.x,f.y,f.color,5,{size:2.4,speed:1.4});return false;}
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
 return f.x>-30&&f.x<(g.worldW||1600)+30&&f.y>-120&&f.y<(g.worldH||900)+80;
},
dinoSplat(g,f){return --f.life>0;},
dinoSkyfall(g,f,p){
 if(f.next-->0)return true;
 const enemies=(g.enemies||[]).filter(e=>canHit(e)&&inView(g,e))
   .sort((a,b)=>Math.abs(cx(a)-f.origin)-Math.abs(cx(b)-f.origin));
 const target=enemies.length?enemies[f.i%enemies.length]:null;
 const tx=target?cx(target):clamp(f.origin+f.face*(85+f.i*55),32,(g.worldW||1600)-32);
 const ty=target?cy(target):p.y+p.h;
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
 ctx.fillStyle=f.color;ctx.strokeStyle="#3a794b";ctx.lineWidth=1.7;
 ctx.beginPath();ctx.ellipse(x,y,f.radius*(1+wobble),f.radius*(1-wobble),0,0,TAU);ctx.fill();ctx.stroke();
 for(const dx of [-.31,.31]){
   ctx.fillStyle="#fffef0";ctx.beginPath();ctx.arc(x+dx*f.radius,y-f.radius*.2,f.radius*.23,0,TAU);ctx.fill();
   ctx.fillStyle="#274632";ctx.beginPath();ctx.arc(x+dx*f.radius+f.face*.5,y-f.radius*.2,f.radius*.1,0,TAU);ctx.fill();
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
dinoWarning(ctx,f,cam){
 const x=f.x-(cam?.x||0),y=f.y-(cam?.y||0),k=Math.max(0,Math.min(1,f.life/f.max));
 ctx.globalAlpha=.22+.3*(1-k);ctx.strokeStyle="#bdfc96";ctx.lineWidth=2.3;
 ctx.beginPath();ctx.ellipse(x,y,20+(1-k)*12,5+(1-k)*3,0,0,TAU);ctx.stroke();
 ctx.beginPath();ctx.moveTo(x-6,y);ctx.lineTo(x+6,y);ctx.stroke();
},
   },
   drawRollShell(ctx, p, cam, t) {
const x = cx(p) - (cam?.x || 0), y = cy(p) - (cam?.y || 0);
const r = Math.max(p.w, p.h) * 0.78;
ctx.save(); ctx.globalAlpha = 0.8; ctx.strokeStyle = "#ebffac";
ctx.lineWidth = 2.4; ctx.lineJoin = "round";
for (let i = 0; i < 8; i++) {
 const a = i * TAU / 8 + t * 0.18;
 const nx = Math.cos(a), ny = Math.sin(a);
 ctx.beginPath(); ctx.moveTo(x + nx * r * 0.8, y + ny * r * 0.8);
 ctx.lineTo(x + nx * (r + 9), y + ny * (r + 9));
 ctx.lineTo(x + Math.cos(a + 0.3) * r * 0.8, y + Math.sin(a + 0.3) * r * 0.8);
 ctx.stroke();
}
ctx.restore();
}
 };
}

// Finite, host-authored reinforcement waves and personal support-star pickups.
import{WORLD1_ARENA as A,WORLD1_FLOOR as F}from'./world1-rooms.js';
export const QUIMERA_PRESSURE=Object.freeze({aliveCap:2,phaseQuota:[0,1,2,2,3],spawnWarning:72,starHeal:8,starLife:900,starCap:6});
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),TAU=Math.PI*2;
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
export function quimeraPressureState(e){
 const b=e?._fusion;if(!b)return null;
 return b.pressure||=( {phase:0,t:0,spawned:0,next:120,serial:0,starSerial:0,minions:[],stars:[],notice:0} );
}
function dropStar(q,x,y){
 if(q.stars.length>=QUIMERA_PRESSURE.starCap)q.stars.shift();q.stars.push({id:++q.starSerial,x:clamp(x,A.left+50,A.right-50),y:Math.min(y,F-38),vy:0,life:QUIMERA_PRESSURE.starLife,age:0});
}
export function collectQuimeraStars(g){
 const e=g?.boss,q=e?._fusion?.pressure,p=g?.player;if(!q||!p||p.dead||e.hp<=0)return 0;
 if(g._quimeraStarPocket?.boss!==e)g._quimeraStarPocket={boss:e,taken:new Set(),burst:0,chain:0};
 const pocket=g._quimeraStarPocket;if(pocket.burst>0)pocket.burst--;let n=0;
 for(const s of q.stars){
  if(s.life<=0||pocket.taken.has(s.id)||Math.hypot(clamp(s.x,p.x,p.x+p.w)-s.x,clamp(s.y,p.y,p.y+p.h)-s.y)>24)continue;
  pocket.taken.add(s.id);pocket.burst=28;pocket.chain=((pocket.chain||0)+1)%3;n++;
  if(Number.isFinite(p.health)&&Number.isFinite(p.maxHealth))p.health=Math.min(p.maxHealth,p.health+QUIMERA_PRESSURE.starHeal);
  p.invuln=Math.max(p.invuln||0,18);
  // Only nearby ordinary projectiles disperse. Columns and phase specials remain.
  const near=(e._fusion.shots||[]).filter(z=>z.life>0&&!z.hit&&!['bolt','geyser','beam','meteor','echo'].includes(z.k)&&Math.hypot(z.x-s.x,z.y-s.y)<180).sort((a,b)=>Math.hypot(a.x-s.x,a.y-s.y)-Math.hypot(b.x-s.x,b.y-s.y));
  for(const z of near.slice(0,2)){z.life=0;if(g.onlineAdventure&&g.coopAuthority===false)(g._coopFinalConsumed||=new Set()).add('q:'+(e._coopSyncId||0)+':'+z.id);}
  if(g.quimeraArena&&pocket.chain===0){if((g.quimeraArena.shield||0)<90)g.quimeraArena.shieldSource='constellation';g.quimeraArena.shield=Math.max(g.quimeraArena.shield||0,90);g.quimeraArena.shieldBurst=28;}
  if(g.quimeraArena)g.quimeraArena.message={text:pocket.chain===0?'CONSTELACIÓN · Tres estrellas te protegen de un golpe':'ESTRELLA ALIADA · Hasta 8 de vida · Constelación '+pocket.chain+'/3',life:150};
 }
 return n;
}
export function updateQuimeraPressure(e,g,helpers={}){
 if(g?.roomId!=='w1-final'||!Array.isArray(g.enemies))return;
 const q=quimeraPressureState(e),p=g.player,b=e._fusion;if(!p||!q)return;
 if(e.hp<=0||p.dead){for(const m of q.minions)m.hp=0;q.minions=[];q.stars=[];return;}
 if(g.onlineAdventure&&g.coopAuthority===false){collectQuimeraStars(g);return;}
 if(q.phase!==e.phase){
  for(const m of q.minions)m.hp=0;q.minions=[];q.phase=e.phase;q.t=0;q.spawned=0;q.next=e.phase===1?120:80;
  // A phase gift rewards reaching the next movement; it is not auto-collected.
  q.giftPending=true;
 }
 for(const m of q.minions)if(m.hp<=0&&!m._starDropped){m._starDropped=true;dropStar(q,m.x+m.w/2,m.y+m.h*.5);g.fx?.emit?.(m.x+m.w/2,m.y+m.h/2,{color:'#b29cbf',count:8,size:2,life:22});}
 q.minions=q.minions.filter(m=>m.hp>0);
 if(['intro','special'].includes(b.mode)){for(const m of q.minions){m.mode='wait';m.vx=0;}return;}
 if(q.giftPending){dropStar(q,p.x+p.w/2+(p.x<(A.left+A.right)/2?260:-260),F-90);q.giftPending=false;}
 q.t++;
 for(const s of q.stars){s.age++;s.life--;s.vy=Math.min(2,s.vy+.06);s.y=Math.min(F-38,s.y+s.vy);}q.stars=q.stars.filter(s=>s.life>0);
 const quota=QUIMERA_PRESSURE.phaseQuota[e.phase]||0;
 if(q.spawned<quota&&q.minions.length<QUIMERA_PRESSURE.aliveCap&&q.t>=q.next){
  const serial=++q.serial,flying=serial%2===0,side=serial%2?1:-1,h=flying?36:42;let x=clamp(p.x+side*460,A.left+60,A.right-100);if(Math.abs(x-p.x)<280)x=clamp(p.x-side*460,A.left+60,A.right-100);
  const m={id:'quimera-echo-'+serial,kind:flying?'eclipse-watcher':'eclipse-hunter',_quimeraMinion:true,roomId:'w1-final',x,y:F-h-(flying?170:0),w:38,h,hp:flying?38+e.phase*5:44+e.phase*7,max:flying?38+e.phase*5:44+e.phase*7,vx:0,vy:0,facing:-side,age:0,mode:'spawn',clock:QUIMERA_PRESSURE.spawnWarning,cooldown:70,serial,attackDamage:9+Math.floor(e.phase/2),contactDmg:0,color:flying?'#b59acc':'#8aa6b2',_coopSyncId:100000+serial,_coopVisit:Math.floor(g.coopRoomVisit||0)};
  q.minions.push(m);g.enemies.push(m);q.spawned++;q.next=q.t+180;
 }
 for(const m of q.minions){
  m.age++;if(m.invuln>0)m.invuln--;if(m.stun>0){m.x=clamp(m.x+(m.vx||0),A.left,A.right-m.w);m.vx*=.7;continue;}
  const peers=[p,g.coopRemote].filter(a=>a&&!a.dead&&Number.isFinite(a.x));peers.sort((a,b)=>Math.abs(a.x-m.x)-Math.abs(b.x-m.x));const target=peers[0]||p,px=target.x+(target.w||32)/2,py=target.y+(target.h||48)/2;
  const flying=m.kind==='eclipse-watcher';if(!['wind','dash','leap'].includes(m.mode))m.facing=Math.sign(px-m.x)||m.facing;
  if(m.mode==='spawn'){if(--m.clock<=0)m.mode='wait';continue;}
  if(m.mode==='wind'){
   if(--m.clock<=0){
    if(flying){
     const dx=m.target.x-(m.x+m.w/2),dy=m.target.y-(m.y+m.h/2),len=Math.hypot(dx,dy)||1;
     if(b.shots.length<90){b.shotSerial=(b.shotSerial||0)+1;b.shots.push({id:b.shotSerial,k:'orb',x:m.x+m.w/2,y:m.y+m.h/2,vx:dx/len*4.7,vy:dy/len*4.7,r:11,life:125,dmg:8+Math.floor(e.phase/2),col:'#ba97d0',source:'Vigía del eclipse'});}
     if(e.phase>=3&&b.shots.length<90){const angle=Math.atan2(dy,dx)+.20;b.shotSerial=(b.shotSerial||0)+1;b.shots.push({id:b.shotSerial,k:'orb',x:m.x+m.w/2,y:m.y+m.h/2,vx:Math.cos(angle)*4.7,vy:Math.sin(angle)*4.7,r:11,life:125,dmg:8+Math.floor(e.phase/2),col:'#ba97d0',source:'Vigía del eclipse'});}
     m.mode='wait';m.cooldown=130;
    }else if(e.phase>=3){m.mode='leap';m.hitDash=false;m.clock=26;m.leapFrom=m.x;m.leapTo=clamp(m.target.x-m.w/2,m.x-330,m.x+330);m.leapTo=clamp(m.leapTo,A.left,A.right-m.w);m.vx=0;}
    else{m.mode='dash';m.hitDash=false;m.clock=15;m.vx=Math.sign(m.target.x-m.x)*8.4;}
   }continue;
  }
  if(m.mode==='leap'){
   const k=1-(--m.clock)/26;m.x=m.leapFrom+(m.leapTo-m.leapFrom)*k;m.y=F-m.h-Math.sin(Math.PI*k)*115;m.facing=Math.sign(m.leapTo-m.leapFrom)||m.facing;
   if(!m.hitDash&&overlap(m,p)){m.hitDash=true;helpers.hurtPlayer?.(m.attackDamage,'Acechador del eclipse');}
   if(m.clock<=0){m.mode='wait';m.cooldown=125;m.y=F-m.h;}continue;
  }
  if(m.mode==='dash'){
   m.x=clamp(m.x+m.vx,A.left,A.right-m.w);
   if(!m.hitDash&&overlap(m,p)){m.hitDash=true;helpers.hurtPlayer?.(m.attackDamage,'Acechador del eclipse');}
   if(--m.clock<=0){m.mode='wait';m.cooldown=110;m.vx=0;}continue;
  }
  m.cooldown=Math.max(0,m.cooldown-1);
  if(flying){m.y=F-205+Math.sin(m.age*.025+m.serial)*14;m.vx=Math.sign(px-m.x)*.65;}else{m.y=F-m.h;m.vx=Math.abs(px-m.x)>120?Math.sign(px-m.x)*1.4:0;}
  m.x=clamp(m.x+m.vx,A.left,A.right-m.w);
  const occupied=q.minions.some(other=>other!==m&&['wind','dash','leap'].includes(other.mode));
  if(m.cooldown<=0&&b.mode==='rest'&&!occupied){m.mode='wind';m.clock=flying?48:42;m.target={x:px,y:py};m.vx=0;}
 }
 if(collectQuimeraStars(g)>0)helpers.beep?.(g._quimeraStarPocket.chain===0?'pickup':'orb');
}
// Watcher warnings use the locked target; filled footprints
// stay quiet and never imply a damaging beam across the arena.
export function drawQuimeraMinion(c,m,cam,t=0,reduce=false){
 if(!m||m.hp<=0)return;const T=reduce?0:t,watcher=m.kind==='eclipse-watcher',spawn=m.mode==='spawn',warn=m.mode==='wind',x=m.x+m.w/2-(cam.x||0),y=m.y+m.h/2-(cam.y||0),TA=Math.PI*2;
 const oval=(x,y,rx,ry,color,angle=0)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,angle,0,TA);c.fill();};
 c.save();
 if(warn&&m.target){
  const tx=x,floor=F-(cam.y||0),k=1-clamp(m.clock/(watcher?48:42),0,1);
  if(!watcher){oval(tx,floor-2,27+9*k,6,'#d3af8640');for(const side of[-1,1])oval(tx+side*17,floor-3,4,2,'#e8c79588',side*.3);}
  else{const tx=m.target.x-(cam.x||0),ty=m.target.y-(cam.y||0);for(let i=0;i<4;i++){const a=i*TA/4;oval(tx+Math.cos(a)*19,ty+Math.sin(a)*19,2,4,'#d6b6c588',a);}}
 }
 // The floor shadow stays at the actual landing plane, separate from the body.
 oval(x,F-(cam.y||0)-2,watcher?18:23,4,spawn?'#080e2022':'#080e2066');
 c.translate(x,y);c.scale(m.facing===1?-1:1,1);c.globalAlpha*=spawn?.18+Math.max(0,1-m.clock/72)*.65:1;
 const coat=c.createLinearGradient(-23,-20,22,24);coat.addColorStop(0,m.flash>0?'#b8a4b9':'#57617a');coat.addColorStop(.4,'#242c46');coat.addColorStop(1,'#0a1022');
 const path=(fill,fn)=>{c.fillStyle=fill;c.beginPath();fn();c.closePath();c.fill();};
 if(watcher){
  // Detached feather shells surround a spherical iris; no shared humanoid mask.
  for(const side of[-1,1])for(let i=2;i>=0;i--){const flutter=Math.sin(T*.045+i)*3;path(i===0?'#827193aa':'#45415f99',()=>{c.moveTo(side*(13+i*2),-10+i*6);c.bezierCurveTo(side*(24+i*5),-24+flutter,side*(38+i*3),-15+i*8,side*(29+i*3),6+i*5);c.quadraticCurveTo(side*24,1+i*5,side*15,15);});}
  oval(0,0,18,21,coat);oval(-1,-2,14,12,'#bbb7bf');oval(-2,-2,warn?8:7,10,warn?'#c392a7':'#727b9c');oval(-3,-2,warn?2:3,8,'#11172b');oval(-5,-6,2,2,'#e1e4d7');
  for(let i=0;i<3;i++)path('#6c638799',()=>{const xx=-9+i*9;c.moveTo(xx,17);c.quadraticCurveTo(xx+Math.sin(T*.035+i)*7,27,xx-4,33);c.quadraticCurveTo(xx+8,26,xx+5,15);});
  path('#404764',()=>{c.moveTo(-19,-9);c.quadraticCurveTo(0,-33,19,-9);c.lineTo(12,-14);c.quadraticCurveTo(0,-25,-12,-14);});
 }else{
  // Low shoulder, forward muzzle, ears and four paws read as a stalking beast.
  if(warn)c.scale(1.12,.83);if(m.mode==='dash'||m.mode==='leap')c.rotate(-.12);
  path('#3b455f',()=>{c.moveTo(13,6);c.bezierCurveTo(31,10,34,-2,26,-12);c.bezierCurveTo(41,3,35,20,13,14);});
  oval(2,6,22,13,coat,-.1);oval(-10,0,14,15,coat,-.3);
  path('#414b65',()=>{c.moveTo(-21,-4);c.lineTo(-24,-21);c.lineTo(-13,-12);c.lineTo(-3,-20);c.lineTo(-1,-2);});
  path(warn?'#c3b9bd':'#a1aab4',()=>{c.moveTo(-23,-8);c.quadraticCurveTo(-10,-15,-3,-6);c.lineTo(-10,6);c.lineTo(-26,8);c.lineTo(-30,2);});
  path('#11192e',()=>{c.moveTo(-25,-5);c.lineTo(-17,-2);c.lineTo(-8,-6);c.lineTo(-13,1);c.lineTo(-24,1);});oval(-21,-3,2.5,1.3,warn?'#f1c8a1':'#bfd8cb');oval(-29,2,2,1.5,'#0c152a');
  for(let i=0;i<4;i++){const xx=-16+i*11,gait=reduce||warn?0:Math.sin(T*(m.mode==='dash'?.4:.1)+i*Math.PI)*3;oval(xx+gait,18,5,4,i%2?'#7e8c9d':'#59677e',-.15);}
  for(let i=0;i<3;i++)path('#718199',()=>{c.moveTo(-2+i*6,-5);c.lineTo(0+i*6,-13+i*2);c.lineTo(5+i*6,-3);});
 }
 if(spawn){c.globalAlpha*=.7;for(let i=0;i<6;i++){const a=i*TA/6+(reduce?0:T*.025);oval(Math.cos(a)*28,Math.sin(a)*24,2,4,'#ad8aba',a);}}
 if(warn){for(let i=0;i<3;i++)oval(-10+i*10,-32,2,3,'#edcfa0');}
 for(let i=0;i<4;i++)oval(-10+i*7,watcher?39:27,2,2.5,m.hp/m.max>i/4?'#a8b6bd':'#26334a');
 c.restore();
}
export function drawQuimeraStars(c,g,cam,t=0,reduce=false){
 const q=g?.boss?._fusion?.pressure;if(!q||g.boss.hp<=0)return;const taken=g._quimeraStarPocket?.taken;
 c.save();for(const s of q.stars){if(s.life<=0||taken?.has(s.id))continue;const x=s.x-(cam.x||0),y=s.y-(cam.y||0)+(reduce?0:Math.sin(t*.06+s.id)*3);const halo=c.createRadialGradient(x,y,1,x,y,26);halo.addColorStop(0,'#f8d99455');halo.addColorStop(1,'#f8d99400');c.fillStyle=halo;c.beginPath();c.ellipse(x,y,26,26,0,0,TAU);c.fill();c.fillStyle='#f1dfad';c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*TAU/10,r=i%2?5:12;i?c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r):c.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}c.closePath();c.fill();c.fillStyle='#664869';c.beginPath();c.ellipse(x-3,y-1,1,1.6,0,0,TAU);c.ellipse(x+3,y-1,1,1.6,0,0,TAU);c.fill();}
 const pocket=g._quimeraStarPocket;if(pocket?.chain>0&&g.player){const p=g.player,x=p.x+p.w/2-(cam.x||0),y=p.y-12-(cam.y||0);for(let i=0;i<3;i++){c.fillStyle=i<pocket.chain?'#dfce9c':'#555367';c.beginPath();c.moveTo(x-12+i*12,y-3);c.lineTo(x-9+i*12,y);c.lineTo(x-12+i*12,y+3);c.lineTo(x-15+i*12,y);c.closePath();c.fill();}}
 if(pocket?.burst>0){const p=g.player,x=p.x+p.w/2-(cam.x||0),y=p.y+p.h/2-(cam.y||0),k=1-pocket.burst/28;c.globalAlpha=1-k;c.fillStyle='#efdaa5';for(let i=0;i<7;i++){const a=i*TAU/7,rr=reduce?28:15+k*45;c.beginPath();c.ellipse(x+Math.cos(a)*rr,y+Math.sin(a)*rr,2,4,a,0,TAU);c.fill();}}
 c.restore();
}

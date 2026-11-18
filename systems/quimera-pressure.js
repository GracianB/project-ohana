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
 if(g._quimeraStarPocket?.boss!==e)g._quimeraStarPocket={boss:e,taken:new Set(),burst:0};
 const pocket=g._quimeraStarPocket;if(pocket.burst>0)pocket.burst--;let n=0;
 for(const s of q.stars){
  if(s.life<=0||pocket.taken.has(s.id)||Math.hypot(p.x+p.w/2-s.x,p.y+p.h*.5-s.y)>42)continue;
  pocket.taken.add(s.id);pocket.burst=28;n++;
  if(Number.isFinite(p.health)&&Number.isFinite(p.maxHealth))p.health=Math.min(p.maxHealth,p.health+QUIMERA_PRESSURE.starHeal);
  p.invuln=Math.max(p.invuln||0,18);
  // Only nearby ordinary projectiles disperse. Columns and phase specials remain.
  const near=(e._fusion.shots||[]).filter(z=>!['bolt','geyser','beam','meteor','echo'].includes(z.k)&&Math.hypot(z.x-s.x,z.y-s.y)<180).sort((a,b)=>Math.hypot(a.x-s.x,a.y-s.y)-Math.hypot(b.x-s.x,b.y-s.y));
  for(const z of near.slice(0,2))z.life=0;
  if(g.quimeraArena)g.quimeraArena.message={text:'ESTRELLA ALIADA · Recuperas hasta 8 de vida y dispersas ecos cercanos',life:150};
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
  const flying=m.kind==='eclipse-watcher';m.facing=Math.sign(px-m.x)||m.facing;
  if(m.mode==='spawn'){if(--m.clock<=0)m.mode='wait';continue;}
  if(m.mode==='wind'){
   if(--m.clock<=0){
    if(flying){
     const dx=m.target.x-(m.x+m.w/2),dy=m.target.y-(m.y+m.h/2),len=Math.hypot(dx,dy)||1;
     if(b.shots.length<90){b.shotSerial=(b.shotSerial||0)+1;b.shots.push({id:b.shotSerial,k:'orb',x:m.x+m.w/2,y:m.y+m.h/2,vx:dx/len*4.7,vy:dy/len*4.7,r:11,life:125,dmg:8+Math.floor(e.phase/2),col:'#ba97d0',source:'Vigía del eclipse'});}
     m.mode='wait';m.cooldown=130;
    }else{m.mode='dash';m.hitDash=false;m.clock=15;m.vx=Math.sign(m.target.x-m.x)*8.4;}
   }continue;
  }
  if(m.mode==='dash'){
   m.x=clamp(m.x+m.vx,A.left,A.right-m.w);
   if(!m.hitDash&&overlap(m,p)){m.hitDash=true;helpers.hurtPlayer?.(m.attackDamage,'Acechador del eclipse');}
   if(--m.clock<=0){m.mode='wait';m.cooldown=110;m.vx=0;}continue;
  }
  m.cooldown=Math.max(0,m.cooldown-1);
  if(flying){m.y=F-205+Math.sin(m.age*.025+m.serial)*14;m.vx=Math.sign(px-m.x)*.65;}else{m.y=F-m.h;m.vx=Math.abs(px-m.x)>120?Math.sign(px-m.x)*1.4:0;}
  m.x=clamp(m.x+m.vx,A.left,A.right-m.w);
  const occupied=q.minions.some(other=>other!==m&&['wind','dash'].includes(other.mode));
  if(m.cooldown<=0&&b.mode==='rest'&&!occupied){m.mode='wind';m.clock=flying?48:42;m.target={x:px,y:py};m.vx=0;}
 }
 collectQuimeraStars(g);
}
export function drawQuimeraMinion(c,m,cam,t=0,reduce=false){
 if(!m||m.hp<=0)return;const x=m.x+m.w/2-(cam.x||0),y=m.y+m.h/2-(cam.y||0),T=reduce?0:t,spawn=m.mode==='spawn',warn=m.mode==='wind';
 c.save();c.translate(x,y);c.scale(m.facing===1?-1:1,1);c.globalAlpha=spawn?.2+Math.max(0,1-m.clock/72)*.6:1;
 const coat=c.createLinearGradient(-20,-20,20,23);coat.addColorStop(0,m.flash>0?'#97869f':'#42516d');coat.addColorStop(.5,'#1b203a');coat.addColorStop(1,'#0a1023');
 c.fillStyle=coat;c.beginPath();c.moveTo(-17,8);c.bezierCurveTo(-29,-8,-10,-29,11,-19);c.quadraticCurveTo(26,-13,20,9);c.lineTo(26,25);c.quadraticCurveTo(4,15,-15,25);c.quadraticCurveTo(-10,14,-17,8);c.fill();
 c.fillStyle=warn?'#e1c4c8':'#b8bbc4';c.beginPath();c.moveTo(-12,-11);c.quadraticCurveTo(2,-20,15,-9);c.lineTo(7,9);c.lineTo(0,14);c.lineTo(-11,4);c.closePath();c.fill();
 c.fillStyle='#14243c';c.beginPath();c.moveTo(-10,-7);c.lineTo(-1,-3);c.lineTo(10,-8);c.lineTo(6,0);c.lineTo(-7,1);c.closePath();c.fill();
 c.fillStyle=warn?'#ffcda3':'#bce6dc';c.beginPath();c.ellipse(-5,-4,2,1,0,0,TAU);c.ellipse(5,-4,2,1,0,0,TAU);c.fill();
 if(m.kind==='eclipse-watcher')for(const side of[-1,1]){c.fillStyle='#71618888';c.beginPath();c.moveTo(side*14,-6);c.quadraticCurveTo(side*31,-24+Math.sin(T*.06)*3,side*32,4);c.quadraticCurveTo(side*22,-1,side*23,15);c.lineTo(side*13,6);c.closePath();c.fill();}
 if(spawn){c.globalAlpha=.5;c.fillStyle='#ad8aba';for(let i=0;i<5;i++){const a=i*TAU/5+T*.025;c.beginPath();c.ellipse(Math.cos(a)*26,Math.sin(a)*20,2,4,a,0,TAU);c.fill();}}
 if(warn){c.globalAlpha=.7;c.fillStyle='#edcfa0';for(let i=0;i<3;i++){c.beginPath();c.ellipse(-15+i*15,-28-Math.sin(T*.08+i)*2,2,3,0,0,TAU);c.fill();}}
 for(let i=0;i<4;i++){c.fillStyle=m.hp/m.max>(i/4)?'#a8b6bd':'#26334a';c.beginPath();c.ellipse(-10+i*7,31,2,2.5,0,0,TAU);c.fill();}
 c.restore();
}
export function drawQuimeraStars(c,g,cam,t=0,reduce=false){
 const q=g?.boss?._fusion?.pressure;if(!q||g.boss.hp<=0)return;const taken=g._quimeraStarPocket?.taken;
 c.save();for(const s of q.stars){if(s.life<=0||taken?.has(s.id))continue;const x=s.x-(cam.x||0),y=s.y-(cam.y||0)+(reduce?0:Math.sin(t*.06+s.id)*3);const halo=c.createRadialGradient(x,y,1,x,y,26);halo.addColorStop(0,'#f8d99455');halo.addColorStop(1,'#f8d99400');c.fillStyle=halo;c.beginPath();c.ellipse(x,y,26,26,0,0,TAU);c.fill();c.fillStyle='#f1dfad';c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*TAU/10,r=i%2?5:12;i?c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r):c.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}c.closePath();c.fill();c.fillStyle='#664869';c.beginPath();c.ellipse(x-3,y-1,1,1.6,0,0,TAU);c.ellipse(x+3,y-1,1,1.6,0,0,TAU);c.fill();}
 const pocket=g._quimeraStarPocket;if(pocket?.burst>0){const p=g.player,x=p.x+p.w/2-(cam.x||0),y=p.y+p.h/2-(cam.y||0),k=1-pocket.burst/28;c.globalAlpha=1-k;c.fillStyle='#efdaa5';for(let i=0;i<7;i++){const a=i*TAU/7,rr=reduce?28:15+k*45;c.beginPath();c.ellipse(x+Math.cos(a)*rr,y+Math.sin(a)*rr,2,4,a,0,TAU);c.fill();}}
 c.restore();
}

import {drawSanctuaryLantern} from '../worlds/michi-sanctuary-art.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function updateSanctuaryBoss(e,g,hurt){
 const b=e._astralCat,p=g.player,A=e._chapterArena;
 if(e.invuln>0)e.invuln--;e.wind=0;e.lunge=0;e.telegraph=false;e.vx=0;e.vy=0;e.y=A.floor-e.h;
 if(!p||p.dead||e.hp<=0)return true;
 if(!g.world1?.stations.every(s=>s.done)||p.evo<4){b.phase='intro';b.clock=65;e.damageTakenScale=0;return true;}
 const visible=Math.abs(p.x-e.x)<1100&&Math.abs(p.y-e.y)<650;
 b.tier=e.hp<e.max*.3?3:e.hp<e.max*.65?2:1;
 const warn=()=>{b.phase='warn';b.clock=58;b.exposed=false;b.aim=Math.sign(p.x+p.w/2-e.x-e.w/2)||1;b.pattern=['silk_charge','pollen_fan','lantern_rain'][b.attack];
  b.targetX=p.x+p.w/2;b.targetY=p.y+p.h/2;
  const angle=Math.atan2(p.y+p.h/2-(e.y+e.h*.5),p.x+p.w/2-(e.x+e.w/2));
  b.rays=Array.from({length:b.tier===3?5:3},(_,i)=>{const offset=(i-(b.tier===3?2:1))*.23;return{vx:Math.cos(angle+offset)*5.8,vy:Math.sin(angle+offset)*5.8};});
  const target=b.targetX;b.columns=[-150,0,150].map(d=>clamp(target+d,A.left+35,A.right-35));e.damageTakenScale=0;
 };
 if(b.phase==='intro'){e.damageTakenScale=0;if(visible&&--b.clock<=0)warn();}
 else if(b.phase==='rest'){b.exposed=true;e.damageTakenScale=e.damageWindowRemaining>0?1:0;if(--b.clock<=0&&visible){warn();}}
 else if(b.phase==='warn'){e.telegraph=true;e.wind=b.clock;e.damageTakenScale=0;if(--b.clock<=0){b.phase='attack';b.clock=b.attack===0?32:24;b.burst=0;}}
 else if(b.phase==='attack'){
  e.damageTakenScale=0;e.lunge=b.clock;
  const shot=(x,y,vx,vy,w=14,h=14)=>{if(g.projectiles.length<130)g.projectiles.push({x:x-w/2,y:y-h/2,vx,vy,w,h,owner:'enemy',dmg:b.tier===3?17:13,life:110,color:'#e7a394'});};
  if(!b.burst){if(b.attack===1)for(const v of b.rays)shot(e.x+e.w/2,e.y+e.h*.5,v.vx,v.vy);
   if(b.attack===2)for(const x of b.columns)shot(x,A.floor-340,0,7.5,18,24);b.burst=1;b.attacksExecuted=(b.attacksExecuted||0)+1;}
  if(b.attack===0){e.x=clamp(e.x+b.aim*(b.tier===3?8:6),A.left,A.right-e.w);if(p.x+p.w>e.x&&p.x<e.x+e.w&&p.y+p.h>e.y&&p.y<e.y+e.h)hurt?.(16,'CARGA DE SEDA');}
  if(--b.clock<=0){b.phase='rest';b.clock=88;b.exposed=true;b.attack=(b.attack+1)%3;e.damageWindowRemaining=180;e.damageTakenScale=1;}
 }
 e.stun=Math.min(e.stun||0,2);e._campaign={wind:e.wind,active:e.lunge,aim:b.aim};return true;
}
export function drawSanctuaryBoss(c,e,cam,t,reduced){
 const b=e._astralCat,x=e.x+e.w/2-cam.x,y=e.y+e.h-cam.y,flap=reduced?0:Math.sin(t*.065)*(b.phase==='attack'?13:5);
 c.save();c.translate(x,y);c.lineWidth=2;c.strokeStyle='#102a34';
 for(const side of[-1,1])for(let wing=0;wing<2;wing++){c.fillStyle=wing?'#537f7c':'#80998b';c.beginPath();c.moveTo(side*12,-65);c.bezierCurveTo(side*(87-wing*10),-184+wing*45+flap,side*102,-37+wing*18,side*12,-35);c.closePath();c.fill();c.stroke();c.strokeStyle='#d8d1ac';c.beginPath();c.moveTo(side*17,-66);c.quadraticCurveTo(side*43,-108+flap,side*75,-116+wing*37);c.stroke();c.strokeStyle='#102a34';}
 c.fillStyle='#344e50';c.beginPath();c.ellipse(0,-71,22,53,0,0,Math.PI*2);c.fill();
 c.fillStyle='#e9dfbc';c.beginPath();c.ellipse(0,-116,23,20,0,0,Math.PI*2);c.fill();
 for(const side of[-1,1]){c.fillStyle='#102a34';c.beginPath();c.ellipse(side*8,-118,4,7,side*.2,0,Math.PI*2);c.fill();c.strokeStyle='#e9dfbc';c.beginPath();c.moveTo(side*10,-130);c.quadraticCurveTo(side*38,-164,side*43,-146);c.stroke();c.moveTo(side*13,-28);c.lineTo(side*29,-3);c.stroke();}
 drawSanctuaryLantern(c,0,-56,b.phase==='rest',t,true);c.restore();
}
export function drawSanctuarySignals(c,e,cam){
 const b=e._astralCat;if(b.phase!=='warn')return;const x=e.x+e.w/2-cam.x,y=e.y+e.h*.5-cam.y,A=e._chapterArena;
 c.save();c.strokeStyle='#e7a394';c.fillStyle='#e7a394';c.lineWidth=2;c.setLineDash([7,5]);
 if(b.attack===0){const distance=b.tier===3?256:192;c.strokeRect(e.x-cam.x+(b.aim<0?-distance:0),A.floor-cam.y-e.h,e.w+distance,e.h);}
 else if(b.attack===1)for(const r of b.rays||sanctuaryFan(e,b)){c.beginPath();c.moveTo(x,y);c.lineTo(x+r.vx*55,y+r.vy*55);c.stroke();}
 else for(const col of b.columns||[-150,0,150].map(d=>clamp((b.targetX||e.x)+d,A.left+35,A.right-35))){c.beginPath();c.moveTo(col-cam.x,A.floor-340-cam.y);c.lineTo(col-cam.x,A.floor-cam.y);c.stroke();c.fillRect(col-cam.x-9,A.floor-4-cam.y,18,4);}
 c.setLineDash([]);c.restore();
}

function sanctuaryFan(e,b){const a=Math.atan2(b.targetY-e.y-e.h*.5,b.targetX-e.x-e.w/2),n=b.tier===3?5:3;return Array.from({length:n},(_,i)=>({vx:Math.cos(a+(i-(n-1)/2)*.23)*5.8,vy:Math.sin(a+(i-(n-1)/2)*.23)*5.8}));}

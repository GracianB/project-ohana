import {drawMichiMothGuardian} from '../worlds/michi-moth-guardian.js';
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
 return drawMichiMothGuardian(c,e,cam,t,reduced,drawSanctuaryLantern);
}

export function drawSanctuarySignals(c,e,cam){
 const b=e._astralCat;if(b.phase!=='warn')return;const x=e.x+e.w/2-cam.x,y=e.y+e.h*.5-cam.y,A=e._chapterArena;
 c.save();c.fillStyle='#e7a394';
 const mark=(xx,yy,rx,ry)=>{c.beginPath();c.ellipse(xx,yy,rx,ry,0,0,Math.PI*2);c.fill();};
 const progress=1-Math.max(0,b.clock)/58;c.globalAlpha=.18+progress*.35;
 if(b.attack===0){const distance=b.tier===3?256:192;for(let i=0;i<5;i++)mark(x+b.aim*distance*(i+.5)/5,A.floor-cam.y-4,16,5);}
 else if(b.attack===1){for(const ray of b.rays||sanctuaryFan(e,b))mark(x+ray.vx*38,y+ray.vy*38,9,9);}
 else for(const col of b.columns||[]){mark(col-cam.x,A.floor-cam.y-4,17,6);mark(col-cam.x,A.floor-340-cam.y,8,12);}
 c.globalAlpha=1;for(let i=0;i<3;i++){c.fillStyle=progress>i/3?'#f1d6a7':'#637d83';mark(x-10+i*10,e.y-cam.y-16,2,3);}c.restore();
}

function sanctuaryFan(e,b){const a=Math.atan2(b.targetY-e.y-e.h*.5,b.targetX-e.x-e.w/2),n=b.tier===3?5:3;return Array.from({length:n},(_,i)=>({vx:Math.cos(a+(i-(n-1)/2)*.23)*5.8,vy:Math.sin(a+(i-(n-1)/2)*.23)*5.8}));}

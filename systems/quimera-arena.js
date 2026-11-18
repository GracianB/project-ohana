// Player-operated final-arena devices. No XP, health, form or boss-phase grants.
import{WORLD1_ARENA as A,WORLD1_FLOOR as F}from'./world1-rooms.js';
export const QUIMERA_ANCHORS=Object.freeze([
 {id:'west',x:A.left+650,label:'Prisma de la marea',dir:1},
 {id:'heart',x:(A.left+A.right)/2,label:'Prisma del corazón',dir:1},
 {id:'east',x:A.right-650,label:'Prisma del regreso',dir:-1}
]);
const key=id=>'w1-final-eclipse-'+id;
const saved=g=>g.secrets?.['w1-final']||[];
export function quimeraArenaState(g){
 if(g?.roomId!=='w1-final'||!g.player)return null;
 if(!g.quimeraArena||g.quimeraArena.boss!==g.boss)g.quimeraArena={boss:g.boss,t:0,shield:0,shieldBurst:0,cooldowns:{},awakened:[],message:null};
 return g.quimeraArena;
}
function unfold(g,q){
 if(!Array.isArray(g.platforms))return;
 for(let i=0;i<3;i++){
  const id=q.id+'-'+i;if(g.platforms.some(p=>p.quimeraStep===id))continue;
  g.platforms.push({x:q.x+q.dir*(-210+i*135)-(q.dir<0?130:0),y:F-100*(i+1),w:130,h:18,oneWay:true,quimeraStep:id});
 }
}
function nearest(g){
 const p=g?.player;if(!p||p.dead||g.roomId!=='w1-final'||!g.boss?._fusionBoss||g.boss.hp<=0||g.boss._fusion?.mode==='intro')return null;
 return QUIMERA_ANCHORS.find(q=>Math.abs(p.x+p.w/2-q.x)<84&&Math.abs(p.y+p.h-F)<90)||null;
}
export function quimeraArenaPrompt(g){
 const q=nearest(g);if(!q)return g?.roomId==='w1-final'?g.quimeraArena?.message?.text||null:null;const cooldown=g.quimeraArena?.cooldowns[q.id]||0;
 return cooldown>0?`${g.quimeraArena?.shield>0?'ESCUDO 1 GOLPE · '+Math.ceil(g.quimeraArena.shield/60)+' s · ':q.label.toUpperCase()+' · '}recarga ${Math.ceil(cooldown/60)} s`:`E · activar ${q.label} · escudo y camino lunar`;
}
export function interactQuimeraArena(g){
 const q=nearest(g),s=quimeraArenaState(g);if(!q||!s)return false;if(s.cooldowns[q.id]>0)return true;
 g.secrets||={};const list=g.secrets['w1-final']||=[];if(!list.includes(key(q.id))){list.push(key(q.id));g.save?.();}
 s.cooldowns[q.id]=600;s.shield=180;s.shieldBurst=26;s.message={text:'PRISMA DESPIERTO · Un golpe absorbido. El camino lunar permanece.',life:210};unfold(g,q);
 g.fx?.emit?.(q.x,F-60,{color:'#a5e4d8',count:g.reduceMotion?3:14,size:2,life:30});return true;
}
export function updateQuimeraArena(g){
 const s=quimeraArenaState(g);if(!s)return;s.t++;
 for(const q of QUIMERA_ANCHORS){s.cooldowns[q.id]=Math.max(0,(s.cooldowns[q.id]||0)-1);if(saved(g).includes(key(q.id)))unfold(g,q);}
 s.awakened=QUIMERA_ANCHORS.filter(q=>saved(g).includes(key(q.id))).map(q=>q.id);
 if(s.shield>0)s.shield--;if(s.shieldBurst>0)s.shieldBurst--;if(s.message&&--s.message.life<=0)s.message=null;
 const p=g.player;if(p.dead||g.boss?.hp<=0){s.shield=0;return;}
 // The current supports a deliberate jump; it never launches a grounded player.
 if(!p.grounded)for(const q of QUIMERA_ANCHORS)if(s.awakened.includes(q.id)&&Math.abs(p.x+p.w/2-(q.x+q.dir*260))<75&&p.y+p.h>F-370&&p.y<F)p.vy=Math.min(p.vy,-3.7);
}
export function absorbQuimeraArenaHit(g,damage){
 const s=g?.quimeraArena;if(!(damage>0)||g?.roomId!=='w1-final'||s?.boss!==g.boss||!(s.shield>0))return false;
 s.shield=0;s.shieldBurst=28;s.message={text:'EL PRISMA TE PROTEGE · Escudo consumido',life:150};
 if(g.world1Boss)g.world1Boss.grace=Math.max(g.world1Boss.grace||0,20);return true;
}
export function drawQuimeraArena(c,g,cam,t=0,reduce=false){
 if(g?.roomId!=='w1-final')return;const s=g.quimeraArena,T=reduce?0:t;
 c.save();c.lineCap='round';c.lineJoin='round';
 for(const q of QUIMERA_ANCHORS){
  const x=q.x-(cam.x||0),y=F-(cam.y||0),awake=saved(g).includes(key(q.id)),cool=s?.cooldowns[q.id]||0;
  // Short physical plinth, floating moon seed and a slow field around it.
  const stone=c.createLinearGradient(x-30,y-35,x+30,y);stone.addColorStop(0,'#75969d');stone.addColorStop(1,'#1c364e');c.fillStyle=stone;c.beginPath();c.moveTo(x-28,y);c.lineTo(x-20,y-23);c.quadraticCurveTo(x,y-34,x+20,y-23);c.lineTo(x+28,y);c.closePath();c.fill();
  c.save();c.translate(x,y-65+Math.sin(T*.035+q.x)*3);c.rotate(Math.sin(T*.018)*.08);c.fillStyle=cool?'#607b8e':awake?'#c0f0dc':'#a4c1bd';c.beginPath();c.moveTo(0,-25);c.quadraticCurveTo(20,-4,8,16);c.lineTo(0,25);c.lineTo(-8,16);c.quadraticCurveTo(-20,-4,0,-25);c.fill();c.fillStyle='#284c65';c.beginPath();c.moveTo(0,-13);c.lineTo(6,2);c.lineTo(0,13);c.lineTo(-6,2);c.closePath();c.fill();c.restore();
  c.strokeStyle=awake?'#a7dccb77':'#809b9a33';c.lineWidth=1.5;c.beginPath();c.ellipse(x,y-3,48,9,0,0,Math.PI*2);c.stroke();
  if(awake){
   const wx=x+q.dir*260;c.globalAlpha=.2;c.strokeStyle='#b3e9d9';for(let i=0;i<5;i++){const yy=y-((T*1.4+i*67)%350);c.beginPath();c.moveTo(wx-22,yy+12);c.quadraticCurveTo(wx,yy-8,wx+22,yy+12);c.stroke();}c.globalAlpha=1;
  }
 }
 // Steps receive their own moonstone skin over the shared collision platform.
 for(const p of g.platforms||[])if(p.quimeraStep){const x=p.x-(cam.x||0),y=p.y-(cam.y||0);c.fillStyle='#547d8b';c.fillRect(x,y,p.w,p.h);c.fillStyle='#b2dfcc';c.fillRect(x,y,p.w,3);c.fillStyle='#203f58';c.beginPath();c.moveTo(x+12,y+p.h);c.lineTo(x+p.w*.5,y+p.h+21);c.lineTo(x+p.w-12,y+p.h);c.fill();}
 const p=g.player;if(p&&s?.shield>0&&g.boss?.hp>0){const x=p.x+p.w/2-(cam.x||0),y=p.y+p.h*.5-(cam.y||0);c.strokeStyle='#b7f1d9';c.globalAlpha=.6;c.lineWidth=1.5;c.beginPath();c.ellipse(x,y,p.w*.85,p.h*.7,Math.sin(T*.025)*.08,0,Math.PI*2);c.stroke();}
 c.restore();
}

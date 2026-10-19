// Chispín's original final foe, independent of Hoku's Queen and Stitcho's core.
// Its combat HP/death passes through the normal shared enemy pipeline.
export const CHISPIN_BOSS_ID='hub-chispin-tempest-v1';
export const CHISPIN_BOSS=Object.freeze({hp:520,left:3160,right:4040,floor:1134});
export const CHISPIN_PATTERNS=Object.freeze(['LÍNEA RELÁMPAGO','BARRIDO DE IONES','CARGA MAGNÉTICA','CORONA DE RAYOS']);
export function createChispinBoss(makeFoe,rng=()=>.5){
 const e=makeFoe(3550,970,'cangrejo','hub',998,{rng});
 e.x=3550;e.y=CHISPIN_BOSS.floor-110;e.w=138;e.h=110;
 e.hp=e.max=CHISPIN_BOSS.hp;
 e.miniBoss=true;e._chispinBoss=true;e._campaignOriginal=true;
 e.spawnIndex=998;e._encounterSaveId=CHISPIN_BOSS_ID;e.roomId='hub';
 e.contactDmg=0;e.color='#fff5ac';
 e._tempest={phase:'intro',clock:95,attack:0,tier:1,aim:1,emitted:0,
  interruptible:true,markedX:3550};
 return e;
}
export function updateChispinBoss(e,g,hurt){
 if(!e?._chispinBoss)return false;
 const b=e._tempest,p=g.player;
 if(e.invuln>0)e.invuln--;
 e.x=Math.max(CHISPIN_BOSS.left,Math.min(CHISPIN_BOSS.right-e.w,e.x));
 e.y=CHISPIN_BOSS.floor-e.h;e.vy=0;e.vx=0;e.grounded=true;e.telegraph=false;
 if(!p||p.dead||e.hp<=0)return true;
 b.tier=e.hp<e.max*.3?3:e.hp<e.max*.63?2:1;
 const dx=p.x+p.w/2-(e.x+e.w/2),dist=Math.abs(dx);
 const near=dist<850&&e.x+e.w>g.cam.x-200&&e.x<g.cam.x+(g.viewW||1100)+200;
 const bolt=(x,y,vx,vy)=>{
  if(!Array.isArray(g.projectiles)||g.projectiles.length>=125)return;
  g.projectiles.push({x,y,w:20,h:20,vx,vy,life:135,
    dmg:b.tier===3?20:12,owner:'enemy',shape:'orb',color:'#ffe87c'});
 };
 if((e.sleep||0)>0){e.sleep--;return true;}
 if(b.phase==='intro'){
  if(near&&--b.clock<=0){b.phase='rest';b.clock=80;}
 }else if(b.phase==='rest'){
  if(near&&--b.clock<=0){
   b.phase='warn';b.clock=b.tier===3?39:62;
   b.aim=Math.sign(dx)||1;
   b.markedX=Math.max(CHISPIN_BOSS.left+24,Math.min(CHISPIN_BOSS.right-24,p.x+p.w/2));
   b.emitted=0;
  }
 }else if(b.phase==='warn'){
  e.telegraph=true;e.wind=b.clock;
  if(b.interruptible&&(e.stun||0)>=23){
   b.phase='rest';b.clock=105;b.emitted=0;
   g.nums?.add?.(e.x,e.y-45,'¡DESCARGA INTERRUMPIDA!','#c6ff9e',true);
  }else if(--b.clock<=0){b.phase='attack';b.clock=b.attack===2?32:21;b.emitted=0;}
 }else if(b.phase==='attack'){
  if(b.emitted===0){
   if(b.attack===0){
    // The warning fixes the strike location: move away, don't guess.
    for(const v of [-1,0,1])bolt(b.markedX+v*37,CHISPIN_BOSS.floor-390,0,8+v*.2);
   }else if(b.attack===1){
    bolt(e.x+e.w/2,e.y+52,b.aim*6,0);
    if(b.tier>1)bolt(e.x+e.w/2,e.y+30,-b.aim*4,-1.2);
   }else if(b.attack===3){
    for(const [vx,vy] of [[-6,0],[6,0],[-4,-4],[4,-4],[0,-7]])bolt(e.x+e.w/2,e.y+43,vx,vy);
   }
   b.emitted=1;
  }
  if(b.attack===2){
   e.x=Math.max(CHISPIN_BOSS.left,Math.min(CHISPIN_BOSS.right-e.w,e.x+b.aim*(b.tier===3?11:7)));
   if(Math.abs(p.x+p.w/2-(e.x+e.w/2))<(p.w+e.w)/2&&
      Math.abs(p.y+p.h/2-(e.y+e.h/2))<(p.h+e.h)/2)
     hurt?.(b.tier===3?22:15,'CARGA MAGNÉTICA');
  }
  if(--b.clock<=0){
   b.phase='rest';b.clock=b.tier===3?39:75;
   b.attack=(b.attack+1)%CHISPIN_PATTERNS.length;
  }
 }
 // The normal stun system decides when the boss is vulnerable.
 e.stun=Math.min(e.stun||0,2);
 return true;
}
export function drawChispinBossBody(ctx,e,cam,t=0,reduced=false){
 if(!e?._chispinBoss||e.hp<=0)return false;
 const b=e._tempest,cx=e.x+e.w/2-cam.x,cy=e.y+e.h/2-cam.y;
 const time=reduced?0:t;
 ctx.save();ctx.translate(cx,cy);
 ctx.fillStyle='rgba(0,19,45,.55)';ctx.beginPath();ctx.ellipse(0,e.h/2-4,76,13,0,0,Math.PI*2);ctx.fill();
 // Four independent magnetic pylons follow the three encounter phases.
 for(let arm=0;arm<4;arm++){
  const a=arm*Math.PI/2+time*.015*(b.tier>=3?2:1),r=66+(b.phase==='warn'?8:0);
  const x=Math.cos(a)*r,y=Math.sin(a)*r*.65;
  ctx.strokeStyle='#17447a';ctx.lineWidth=11;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(x,y);ctx.stroke();
  ctx.strokeStyle='#9de7ff';ctx.lineWidth=3;ctx.stroke();
  ctx.fillStyle=arm%2?'#f4abff':'#ffe981';ctx.beginPath();ctx.arc(x,y,11,0,Math.PI*2);ctx.fill();
 }
 ctx.fillStyle='#143b67';ctx.strokeStyle='#c4f7ff';ctx.lineWidth=5;
 ctx.beginPath();ctx.moveTo(-49,-39);ctx.lineTo(0,-63);ctx.lineTo(51,-38);
 ctx.lineTo(58,29);ctx.lineTo(0,52);ctx.lineTo(-56,24);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.fillStyle=b.tier===3?'#ffacdb':b.tier===2?'#d8c2ff':'#fff0a7';
 ctx.beginPath();ctx.arc(0,-7,32,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#07203d';ctx.beginPath();ctx.ellipse(0,-6,19,25,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(b.aim*5,-10,8,13,0,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#fff1a2';ctx.lineWidth=3;
 for(let i=0;i<b.tier;i++){
  const a=time*.06+i*2.3;
  ctx.beginPath();ctx.arc(0,-6,49+i*10,a,a+1.3);ctx.stroke();
 }
 if(b.phase==='warn'&&!reduced){
  ctx.strokeStyle='#fff7dc';ctx.globalAlpha=.5+.4*Math.sin(t*.19);
  ctx.beginPath();ctx.arc(0,0,87,0,Math.PI*2);ctx.stroke();
 }
 ctx.restore();return true;
}
export function drawChispinBossSignals(ctx,e,cam,t=0){
 if(!e?._chispinBoss||e.hp<=0)return;
 const b=e._tempest,x=e.x+e.w/2-cam.x,y=e.y-cam.y,floor=CHISPIN_BOSS.floor-cam.y;
 ctx.save();ctx.textAlign='center';
 ctx.fillStyle='#071c3d';ctx.fillRect(x-125,y-79,250,52);
 ctx.fillStyle='#fef2bf';ctx.font='bold 12px sans-serif';ctx.fillText('OJO DE LA TORMENTA · FASE '+b.tier+'/3',x,y-59);
 ctx.fillStyle='#44628a';ctx.fillRect(x-110,y-48,220,9);
 ctx.fillStyle='#ffe48c';ctx.fillRect(x-110,y-48,220*Math.max(0,e.hp/e.max),9);
 if(b.phase==='warn'){
  ctx.strokeStyle='#f9e789';ctx.lineWidth=5;ctx.setLineDash([10,8]);ctx.beginPath();
  if(b.attack===0){const lx=b.markedX-cam.x;ctx.moveTo(lx,floor-370);ctx.lineTo(lx,floor);}
  else if(b.attack===2){ctx.moveTo(x,floor-6);ctx.lineTo(x+b.aim*300,floor-6);}
  else{ctx.moveTo(x-290,floor-26);ctx.lineTo(x+290,floor-26);}
  ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#fff5d0';ctx.font='bold 12px sans-serif';
  ctx.fillText(CHISPIN_PATTERNS[b.attack],x,y-90);
 }else if(b.phase==='rest'){
  ctx.fillStyle='#a9ffe5';ctx.font='bold 12px sans-serif';ctx.fillText('NÚCLEO EXPUESTO',x,y-90);
 }
 ctx.restore();
}

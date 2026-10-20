// BOSQUE DEL PRISMA — Bestia Prisma Celestial (Cuerno's personal mini boss).
// 100% vector Canvas drawing: colossal crystalline beast with branching prism antlers, glass hooves and rainbow light refractions.
// Three phases: prism horn rush, refraction laser barrage, and rainbow supernova cascade.
export const CUERNO_BOSS_ID='hub-cuerno-boss-v1';
export const CUERNO_BOSS=Object.freeze({hp:480,left:3120,right:3990,floor:1134});
const PATTERNS=Object.freeze(['charge','prism_barrage','horn_slam','aurora_supernova']);

export function createCuernoBoss(makeFoe,rng=()=>.5){
 const e=makeFoe(3420,1000,'cangrejo','hub',991,{rng});
 e.x=3420;e.y=CUERNO_BOSS.floor-102;e.w=126;e.h=102;
 e.hp=e.max=CUERNO_BOSS.hp;
 e.miniBoss=true;e._cuernoBoss=true;
 e._campaignOriginal=true;e.spawnIndex=991;
 e._encounterSaveId=CUERNO_BOSS_ID;
 e.roomId='hub';e.color='#80cbc4';e.contactDmg=0;
 e._prismBeast={phase:'intro',clock:100,attack:0,tier:1,aim:1,burst:0,exposed:false};
 return e;
}

export function updateCuernoBoss(e,g,hurt){
 if(!e?._cuernoBoss)return false;
 const b=e._prismBeast,p=g.player;
 if(e.invuln>0)e.invuln--;
 e.x=Math.max(CUERNO_BOSS.left,Math.min(CUERNO_BOSS.right-e.w,e.x));
 e.y=CUERNO_BOSS.floor-e.h;e.vy=0;e.grounded=true;e.vx=0;e.telegraph=false;
 if(!p||p.dead||e.hp<=0)return true;

 b.tier=e.hp<=e.max*.26?3:e.hp<=e.max*.60?2:1;
 const dx=p.x+p.w/2-(e.x+e.w/2);
 const visible=e.x+e.w>g.cam.x&&e.x<g.cam.x+(g.viewW||1100);
 if(e.sleep>0){e.sleep--;return true;}

 if(b.phase==='intro'){
  if(visible&&Math.abs(dx)<670){
   if(--b.clock===60)g.nums?.add?.(e.x,e.y-40,'BESTIA PRISMA CELESTIAL · DESPIERTA','#80cbc4',true);
   if(b.clock<=0){b.phase='rest';b.clock=50;}
  }
 }else if(b.phase==='rest'){
  b.exposed=true;
  if(--b.clock<=0&&visible&&Math.abs(dx)<900){b.aim=Math.sign(dx)||1;b.phase='warn';b.clock=b.tier===3?35:50;b.exposed=false;}
 }else if(b.phase==='warn'){
  e.telegraph=true;e.wind=b.clock;
  if((e.stun||0)>=24){b.phase='rest';b.clock=90;b.exposed=true;g.nums?.add?.(e.x,e.y-30,'¡BESTIA PRISMA ATURDIDA!','#b2dfdb',true);}
  else if(--b.clock<=0){b.phase='attack';b.clock=b.attack===0?28:20;b.burst=0;}
 }else if(b.phase==='attack'){
  e.lunge=b.clock;
  const launchPrismShard=(direction,speed=6)=>{
   if((g.projectiles?.length||0)<130){
    g.projectiles.push({x:e.x+e.w/2,y:e.y+e.h-22,w:22,h:22,vx:direction*speed,vy:-1.5,life:140,dmg:b.tier===3?18:13,owner:'enemy',shape:'orb',color:'#80cbc4'});
   }
  };
  if(!b.burst){
   if(b.attack===2){launchPrismShard(b.aim,7);if(b.tier>1)launchPrismShard(-b.aim,5);}
   if(b.attack===1){
    for(let side of [-1,1]){
     if((g.projectiles?.length||0)<130){
      g.projectiles.push({x:e.x+e.w/2,y:e.y+20,w:20,h:20,vx:side*5.2,vy:-3.8,life:120,dmg:14,owner:'enemy',shape:'orb',color:'#80deea'});
     }
    }
   }
   if(b.attack===3&&b.tier===3){
    for(let k=-2;k<=2;k++){
     if((g.projectiles?.length||0)<130){
      g.projectiles.push({x:e.x+e.w/2,y:e.y+30,w:18,h:18,vx:k*3.4,vy:-4,life:130,dmg:15,owner:'enemy',shape:'orb',color:'#b2dfdb'});
     }
    }
   }
   b.burst=1;
  }
  if(b.attack===0){e.x+=b.aim*8.4;e.facing=b.aim;}
  if(Math.abs(p.x+p.w/2-(e.x+e.w/2))<e.w*0.5&&Math.abs(p.y+p.h/2-(e.y+e.h/2))<e.h*0.55){
   hurt?.(b.tier===3?19:14,'cuerno-boss');
  }
  if(--b.clock<=0){b.phase='rest';b.clock=b.tier===3?35:55;b.attack=(b.attack+1)%PATTERNS.length;b.burst=0;}
 }
 return true;
}

export function drawCuernoBoss(ctx,e,cam,t){
 if(!e?._cuernoBoss)return false;
 const b=e._prismBeast,x=e.x-cam.x,y=e.y-cam.y;
 ctx.save();
 ctx.translate(x+e.w/2,y+e.h);
 const flip=b.aim||1;ctx.scale(flip,1);

 // Prismatic crystal body
 ctx.fillStyle=b.tier===3?'#004d40':'#00695c';
 ctx.strokeStyle='#80cbc4';
 ctx.lineWidth=3.5;
 ctx.beginPath();
 ctx.ellipse(0,-45,54,40,0,0,Math.PI*2);
 ctx.fill();
 ctx.stroke();

 // Crystalline Antlers
 ctx.strokeStyle='#b2dfdb';ctx.lineWidth=4;
 ctx.beginPath();
 ctx.moveTo(25,-60);ctx.lineTo(45,-95);
 ctx.moveTo(35,-78);ctx.lineTo(25,-90);
 ctx.moveTo(40,-85);ctx.lineTo(55,-92);
 ctx.stroke();

 // Aurora Core
 const pulse=Math.sin(t*0.14)*4;
 ctx.fillStyle=b.tier===3?'#ffffff':'#80cbc4';
 ctx.beginPath();
 ctx.arc(12,-45,12+pulse,0,Math.PI*2);
 ctx.fill();

 // Eye
 ctx.fillStyle='#e0f2f1';
 ctx.beginPath();
 ctx.arc(36,-50,3.5,0,Math.PI*2);
 ctx.fill();

 // Telegraph warning
 if(e.telegraph){
  ctx.strokeStyle='#80cbc4';
  ctx.lineWidth=2.5;
  ctx.setLineDash([6,6]);
  ctx.strokeRect(-65,-105,130,110);
 }
 ctx.restore();

 // Accessible Boss Health Bar
 const barW=140,barH=9,bx=x+e.w/2-barW/2,by=y-24;
 ctx.fillStyle='rgba(5,20,18,0.85)';
 ctx.fillRect(bx-2,by-2,barW+4,barH+4);
 const ratio=Math.max(0,e.hp/e.max);
 ctx.fillStyle=b.tier===3?'#00bfa5':b.tier===2?'#26a69a':'#80cbc4';
 ctx.fillRect(bx,by,barW*ratio,barH);
 ctx.strokeStyle='#b2dfdb';
 ctx.lineWidth=1.2;
 ctx.strokeRect(bx-2,by-2,barW+4,barH+4);

 ctx.fillStyle='#e0f2f1';
 ctx.font='bold 10px sans-serif';
 ctx.textAlign='center';
 ctx.fillText(`BESTIA PRISMA · FASE ${b.tier} (${Math.ceil(e.hp)} PV)`,x+e.w/2,by-6);
 return true;
}

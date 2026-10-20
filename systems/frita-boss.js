// MERCADO DORADO — Rey Crujiente (Frita's personal mini boss).
// 100% vector Canvas drawing: colossal golden crustacean chef king with crown of fries and sizzling oil cauldrons.
// Three phases: sizzling dash, boiling bubble spray, and crisp explosion overdrive.
export const FRITA_BOSS_ID='hub-frita-boss-v1';
export const FRITA_BOSS=Object.freeze({hp:480,left:3120,right:3990,floor:1134});
const PATTERNS=Object.freeze(['charge','bubble_spray','fryer_slam','crisp_overdrive']);

export function createFritaBoss(makeFoe,rng=()=>.5){
 const e=makeFoe(3420,1000,'cangrejo','hub',994,{rng});
 e.x=3420;e.y=FRITA_BOSS.floor-102;e.w=126;e.h=102;
 e.hp=e.max=FRITA_BOSS.hp;
 e.miniBoss=true;e._fritaBoss=true;
 e._campaignOriginal=true;e.spawnIndex=994;
 e._encounterSaveId=FRITA_BOSS_ID;
 e.roomId='hub';e.color='#ffb300';e.contactDmg=0;
 e._crispyKing={phase:'intro',clock:100,attack:0,tier:1,aim:1,burst:0,exposed:false};
 return e;
}

export function updateFritaBoss(e,g,hurt){
 if(!e?._fritaBoss)return false;
 const b=e._crispyKing,p=g.player;
 if(e.invuln>0)e.invuln--;
 e.x=Math.max(FRITA_BOSS.left,Math.min(FRITA_BOSS.right-e.w,e.x));
 e.y=FRITA_BOSS.floor-e.h;e.vy=0;e.grounded=true;e.vx=0;e.telegraph=false;
 if(!p||p.dead||e.hp<=0)return true;

 b.tier=e.hp<=e.max*.26?3:e.hp<=e.max*.60?2:1;
 const dx=p.x+p.w/2-(e.x+e.w/2);
 const visible=e.x+e.w>g.cam.x&&e.x<g.cam.x+(g.viewW||1100);
 if(e.sleep>0){e.sleep--;return true;}

 if(b.phase==='intro'){
  if(visible&&Math.abs(dx)<670){
   if(--b.clock===60)g.nums?.add?.(e.x,e.y-40,'REY CRUJIENTE · DESPIERTO','#ffd54f',true);
   if(b.clock<=0){b.phase='rest';b.clock=50;}
  }
 }else if(b.phase==='rest'){
  b.exposed=true;
  if(--b.clock<=0&&visible&&Math.abs(dx)<900){b.aim=Math.sign(dx)||1;b.phase='warn';b.clock=b.tier===3?35:50;b.exposed=false;}
 }else if(b.phase==='warn'){
  e.telegraph=true;e.wind=b.clock;
  if((e.stun||0)>=24){b.phase='rest';b.clock=90;b.exposed=true;g.nums?.add?.(e.x,e.y-30,'¡REY CRUJIENTE ATURDIDO!','#fff59d',true);}
  else if(--b.clock<=0){b.phase='attack';b.clock=b.attack===0?28:20;b.burst=0;}
 }else if(b.phase==='attack'){
  e.lunge=b.clock;
  const launchOilWave=(direction,speed=6)=>{
   if((g.projectiles?.length||0)<130){
    g.projectiles.push({x:e.x+e.w/2,y:e.y+e.h-22,w:22,h:20,vx:direction*speed,vy:-1,life:140,dmg:b.tier===3?18:13,owner:'enemy',shape:'orb',color:'#ffb300'});
   }
  };
  if(!b.burst){
   if(b.attack===2){launchOilWave(b.aim,7);if(b.tier>1)launchOilWave(-b.aim,5);}
   if(b.attack===1){
    for(let side of [-1,1]){
     if((g.projectiles?.length||0)<130){
      g.projectiles.push({x:e.x+e.w/2,y:e.y+20,w:20,h:20,vx:side*5.2,vy:-3.5,life:120,dmg:14,owner:'enemy',shape:'orb',color:'#ffd54f'});
     }
    }
   }
   if(b.attack===3&&b.tier===3){
    for(let k=-2;k<=2;k++){
     if((g.projectiles?.length||0)<130){
      g.projectiles.push({x:e.x+e.w/2,y:e.y+30,w:18,h:18,vx:k*3.4,vy:-4,life:130,dmg:15,owner:'enemy',shape:'orb',color:'#ffeb3b'});
     }
    }
   }
   b.burst=1;
  }
  if(b.attack===0){e.x+=b.aim*8.2;e.facing=b.aim;}
  if(Math.abs(p.x+p.w/2-(e.x+e.w/2))<e.w*0.5&&Math.abs(p.y+p.h/2-(e.y+e.h/2))<e.h*0.55){
   hurt?.(b.tier===3?19:14,'frita-boss');
  }
  if(--b.clock<=0){b.phase='rest';b.clock=b.tier===3?35:55;b.attack=(b.attack+1)%PATTERNS.length;b.burst=0;}
 }
 return true;
}

export function drawFritaBoss(ctx,e,cam,t){
 if(!e?._fritaBoss)return false;
 const b=e._crispyKing,x=e.x-cam.x,y=e.y-cam.y;
 ctx.save();
 ctx.translate(x+e.w/2,y+e.h);
 const flip=b.aim||1;ctx.scale(flip,1);

 // Golden crustacean body
 ctx.fillStyle=b.tier===3?'#e65100':'#f57c00';
 ctx.strokeStyle='#ffe082';
 ctx.lineWidth=3.5;
 ctx.beginPath();
 ctx.ellipse(0,-45,54,40,0,0,Math.PI*2);
 ctx.fill();
 ctx.stroke();

 // Golden Crown of Fries
 ctx.fillStyle='#ffeb3b';
 ctx.strokeStyle='#f57f17';ctx.lineWidth=2;
 for(let i=-2;i<=2;i++){
  ctx.fillRect(i*14-6,-85,12,32-Math.abs(i)*4);
  ctx.strokeRect(i*14-6,-85,12,32-Math.abs(i)*4);
 }

 // Sizzling bubbles
 const pulse=Math.sin(t*0.14)*4;
 ctx.fillStyle=b.tier===3?'#ffff00':'#ffd54f';
 ctx.beginPath();
 ctx.arc(15,-45,12+pulse,0,Math.PI*2);
 ctx.fill();

 // Golden Claws
 ctx.fillStyle='#ffb300';
 ctx.beginPath();
 ctx.arc(48,-25,18,0,Math.PI*2);
 ctx.fill();
 ctx.stroke();

 // Eye
 ctx.fillStyle='#212121';
 ctx.beginPath();
 ctx.arc(38,-50,3.5,0,Math.PI*2);
 ctx.fill();

 // Telegraph warning
 if(e.telegraph){
  ctx.strokeStyle='#ffd54f';
  ctx.lineWidth=2.5;
  ctx.setLineDash([6,6]);
  ctx.strokeRect(-65,-105,130,110);
 }
 ctx.restore();

 // Accessible Boss Health Bar
 const barW=140,barH=9,bx=x+e.w/2-barW/2,by=y-24;
 ctx.fillStyle='rgba(25,15,5,0.85)';
 ctx.fillRect(bx-2,by-2,barW+4,barH+4);
 const ratio=Math.max(0,e.hp/e.max);
 ctx.fillStyle=b.tier===3?'#d50000':b.tier===2?'#ff6d00':'#ffca28';
 ctx.fillRect(bx,by,barW*ratio,barH);
 ctx.strokeStyle='#ffe082';
 ctx.lineWidth=1.2;
 ctx.strokeRect(bx-2,by-2,barW+4,barH+4);

 ctx.fillStyle='#fffde7';
 ctx.font='bold 10px sans-serif';
 ctx.textAlign='center';
 ctx.fillText(`REY CRUJIENTE · FASE ${b.tier} (${Math.ceil(e.hp)} PV)`,x+e.w/2,by-6);
 return true;
}

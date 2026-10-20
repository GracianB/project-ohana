// LOS JARDINES DE LA LUNA — Espíritu Astral Felino (Michi's personal mini boss).
// 100% vector Canvas drawing: colossal astral celestial feline with twin moon tails.
// Three phases: shadow pounce, dream orb barrage, and full eclipse overload.
export const MICHI_BOSS_ID='hub-michi-boss-v1';
export const MICHI_BOSS=Object.freeze({hp:480,left:3120,right:3990,floor:1134});
const PATTERNS=Object.freeze(['pounce','dream_barrage','crescent_strike','eclipse_overload']);

export function createMichiBoss(makeFoe,rng=()=>.5){
 const e=makeFoe(3420,1000,'cangrejo','hub',997,{rng});
 e.x=3420;e.y=MICHI_BOSS.floor-96;e.w=118;e.h=96;
 e.hp=e.max=MICHI_BOSS.hp;
 e.miniBoss=true;e._michiBoss=true;
 e._campaignOriginal=true;e.spawnIndex=997;
 e._encounterSaveId=MICHI_BOSS_ID;
 e.roomId='hub';e.color='#e5c2ff';e.contactDmg=0;
 e._astralCat={phase:'intro',clock:100,attack:0,tier:1,aim:1,burst:0,exposed:false};
 return e;
}

export function updateMichiBoss(e,g,hurt){
 if(!e?._michiBoss)return false;
 const b=e._astralCat,p=g.player;
 if(e.invuln>0)e.invuln--;
 e.x=Math.max(MICHI_BOSS.left,Math.min(MICHI_BOSS.right-e.w,e.x));
 e.y=MICHI_BOSS.floor-e.h;e.vy=0;e.grounded=true;e.vx=0;e.telegraph=false;
 if(!p||p.dead||e.hp<=0)return true;

 b.tier=e.hp<=e.max*.26?3:e.hp<=e.max*.60?2:1;
 const dx=p.x+p.w/2-(e.x+e.w/2);
 const visible=e.x+e.w>g.cam.x&&e.x<g.cam.x+(g.viewW||1100);
 if(e.sleep>0){e.sleep--;return true;}

 if(b.phase==='intro'){
  if(visible&&Math.abs(dx)<670){
   if(--b.clock===60)g.nums?.add?.(e.x,e.y-40,'ESPÍRITU ASTRAL FELINO · DESPIERTO','#e5c2ff',true);
   if(b.clock<=0){b.phase='rest';b.clock=50;}
  }
 }else if(b.phase==='rest'){
  b.exposed=true;
  if(--b.clock<=0&&visible&&Math.abs(dx)<900){b.aim=Math.sign(dx)||1;b.phase='warn';b.clock=b.tier===3?35:50;b.exposed=false;}
 }else if(b.phase==='warn'){
  e.telegraph=true;e.wind=b.clock;
  if((e.stun||0)>=24){b.phase='rest';b.clock=90;b.exposed=true;g.nums?.add?.(e.x,e.y-30,'¡ESPÍRITU ATURDIDO!','#ffd6fa',true);}
  else if(--b.clock<=0){b.phase='attack';b.clock=b.attack===0?28:20;b.burst=0;}
 }else if(b.phase==='attack'){
  e.lunge=b.clock;
  const astralWave=(direction,speed=6)=>{
   if((g.projectiles?.length||0)<130){
    g.projectiles.push({x:e.x+e.w/2,y:e.y+e.h-22,w:22,h:16,vx:direction*speed,vy:0,life:140,dmg:b.tier===3?18:13,owner:'enemy',shape:'orb',color:'#e5c2ff'});
   }
  };
  if(!b.burst){
   if(b.attack===2){astralWave(b.aim,6.5);if(b.tier>1)astralWave(-b.aim,4.5);}
   if(b.attack===1){
    for(let side of [-1,1]){
     if((g.projectiles?.length||0)<130){
      g.projectiles.push({x:e.x+e.w/2,y:e.y+20,w:20,h:20,vx:side*5,vy:-3,life:120,dmg:14,owner:'enemy',shape:'orb',color:'#ffb6e4'});
     }
    }
   }
   if(b.attack===3){
    // Lunar eclipse starlight barrage from above
    for(let i=-1;i<=1;i++){
     const sx=p.x+i*80;
     g.fx?.emit?.(sx,p.y-120,{color:'#e5c2ff',count:8,size:3,star:true,life:30});
     if((g.projectiles?.length||0)<130){
      g.projectiles.push({x:sx,y:e.y-180,w:18,h:32,vx:0,vy:8,life:90,dmg:b.tier===3?22:15,owner:'enemy',shape:'orb',color:'#ffcbf2'});
     }
    }
   }
   b.burst=1;
  }
  if(b.attack===0){
   e.x=Math.max(MICHI_BOSS.left,Math.min(MICHI_BOSS.right-e.w,e.x+b.aim*(b.tier===3?9.5:6.2)));
   if(Math.abs(dx)<(e.w+p.w)/2&&Math.abs(p.y+p.h/2-e.y-e.h/2)<(p.h+e.h)/2){
    hurt?.(b.tier===3?22:16,'ZARPAZO ASTRAL');
   }
  }
  if(--b.clock<=0){b.phase='rest';b.clock=b.tier===3?38:70;b.attack=(b.attack+1)%PATTERNS.length;b.exposed=true;}
 }
 e.stun=Math.min(e.stun||0,2);
 e._campaign={wind:e.wind,active:e.lunge,aim:b.aim};
 return true;
}

export function drawMichiBossSignals(ctx,e,cam,t=0,reduced=false){
 if(!e?._michiBoss)return;
 const x=e.x+e.w/2-cam.x,y=e.y-cam.y;
 if(e.telegraph){
  ctx.save();
  ctx.strokeStyle='rgba(229,194,255,0.7)';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.arc(x,y+e.h/2,65+(reduced?0:Math.sin(t*0.2)*8),0,Math.PI*2);ctx.stroke();
  ctx.restore();
 }
}

export function drawMichiBossBody(ctx,e,cam,t=0,reduced=false){
 if(!e?._michiBoss)return;
 const x=e.x-cam.x,y=e.y-cam.y,b=e._astralCat;
 ctx.save();ctx.translate(x+e.w/2,y+e.h);

 // Colossal astral feline body
 ctx.fillStyle='#231238';ctx.strokeStyle='#e5c2ff';ctx.lineWidth=3;
 ctx.beginPath();
 ctx.moveTo(-44,0);ctx.lineTo(-38,-e.h*0.7);ctx.lineTo(-18,-e.h*0.95);ctx.lineTo(18,-e.h*0.95);ctx.lineTo(38,-e.h*0.7);ctx.lineTo(44,0);
 ctx.closePath();ctx.fill();ctx.stroke();

 // Pointed feline ears
 ctx.fillStyle='#361852';ctx.strokeStyle='#ffb6e4';ctx.lineWidth=2;
 for(const side of [-1,1]){
  ctx.beginPath();
  ctx.moveTo(side*18,-e.h*0.95);ctx.lineTo(side*32,-e.h*1.22);ctx.lineTo(side*6,-e.h*0.95);
  ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#ffc0eb';ctx.beginPath();
  ctx.moveTo(side*16,-e.h*0.98);ctx.lineTo(side*26,-e.h*1.16);ctx.lineTo(side*10,-e.h*0.98);
  ctx.closePath();ctx.fill();
 }

 // Central star core (glowing lunar crescent)
 const corePulse=reduced?0:Math.sin(t*0.15)*4;
 ctx.fillStyle=b.exposed?'#fff0fc':'#d89eff';
 ctx.beginPath();ctx.arc(0,-e.h*0.5,18+corePulse,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.stroke();

 // Crescent forehead crest
 ctx.strokeStyle='#ffe6a3';ctx.lineWidth=3;
 ctx.beginPath();ctx.arc(0,-e.h*0.82,10,Math.PI*0.3,Math.PI*1.7);ctx.stroke();

 // Twin astral tails swishing behind
 const tailSwish=reduced?0:Math.sin(t*0.12)*14;
 ctx.strokeStyle='#d6a8ff';ctx.lineWidth=4;
 ctx.beginPath();ctx.moveTo(-25,-e.h*0.3);ctx.quadraticCurveTo(-55+tailSwish,-e.h*0.7,-45,-e.h*1.05);ctx.stroke();
 ctx.beginPath();ctx.moveTo(25,-e.h*0.3);ctx.quadraticCurveTo(55-tailSwish,-e.h*0.7,45,-e.h*1.05);ctx.stroke();

 // Starlight whisker wisps
 ctx.strokeStyle='rgba(255,230,250,0.8)';ctx.lineWidth=1.5;
 for(const side of [-1,1]){
  ctx.beginPath();ctx.moveTo(side*12,-e.h*0.58);ctx.lineTo(side*38,-e.h*0.62);ctx.stroke();
  ctx.beginPath();ctx.moveTo(side*12,-e.h*0.52);ctx.lineTo(side*36,-e.h*0.48);ctx.stroke();
 }

 // Stardust aura in high tiers
 if(!reduced&&b.tier>=2){
  ctx.strokeStyle='#f8d0ff';ctx.lineWidth=1.5;
  for(let i=0;i<4;i++){
   const sa=i*Math.PI*0.5+t*0.18;
   ctx.beginPath();ctx.moveTo(0,-e.h*0.5);ctx.lineTo(Math.cos(sa)*32,-e.h*0.5+Math.sin(sa)*32);ctx.stroke();
  }
 }

 ctx.restore();
}

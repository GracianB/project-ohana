// OBSERVATORIO ASTRAL — Guía del Más Allá (Yomi's personal mini boss).
// 100% vector Canvas drawing: colossal ethereal spirit guardian with floating kitsune mask, ghost wisps and spectral blades.
// Three phases: shadow phantom strike, spirit wisp vortex, and ethereal void domain.
export const YOMI_BOSS_ID='hub-yomi-boss-v1';
export const YOMI_BOSS=Object.freeze({hp:480,left:3120,right:3990,floor:1134});
const PATTERNS=Object.freeze(['charge','wisp_vortex','phantom_slash','void_domain']);

export function createYomiBoss(makeFoe,rng=()=>.5){
 const e=makeFoe(3420,1000,'cangrejo','hub',992,{rng});
 e.x=3420;e.y=YOMI_BOSS.floor-102;e.w=126;e.h=102;
 e.hp=e.max=YOMI_BOSS.hp;
 e.miniBoss=true;e._yomiBoss=true;
 e._campaignOriginal=true;e.spawnIndex=992;
 e._encounterSaveId=YOMI_BOSS_ID;
 e.roomId='hub';e.color='#ab47bc';e.contactDmg=0;
 e._spiritGuide={phase:'intro',clock:100,attack:0,tier:1,aim:1,burst:0,exposed:false};
 return e;
}

export function updateYomiBoss(e,g,hurt){
 if(!e?._yomiBoss)return false;
 const b=e._spiritGuide,p=g.player;
 if(e.invuln>0)e.invuln--;
 e.x=Math.max(YOMI_BOSS.left,Math.min(YOMI_BOSS.right-e.w,e.x));
 e.y=YOMI_BOSS.floor-e.h;e.vy=0;e.grounded=true;e.vx=0;e.telegraph=false;
 if(!p||p.dead||e.hp<=0)return true;

 b.tier=e.hp<=e.max*.26?3:e.hp<=e.max*.60?2:1;
 const dx=p.x+p.w/2-(e.x+e.w/2);
 const visible=e.x+e.w>g.cam.x&&e.x<g.cam.x+(g.viewW||1100);
 if(e.sleep>0){e.sleep--;return true;}

 if(b.phase==='intro'){
  if(visible&&Math.abs(dx)<670){
   if(--b.clock===60)g.nums?.add?.(e.x,e.y-40,'GUÍA DEL MÁS ALLÁ · DESPIERTO','#ba68c8',true);
   if(b.clock<=0){b.phase='rest';b.clock=50;}
  }
 }else if(b.phase==='rest'){
  b.exposed=true;
  if(--b.clock<=0&&visible&&Math.abs(dx)<900){b.aim=Math.sign(dx)||1;b.phase='warn';b.clock=b.tier===3?35:50;b.exposed=false;}
 }else if(b.phase==='warn'){
  e.telegraph=true;e.wind=b.clock;
  if((e.stun||0)>=24){b.phase='rest';b.clock=90;b.exposed=true;g.nums?.add?.(e.x,e.y-30,'¡GUÍA DEL MÁS ALLÁ ATURDIDO!','#e1bee7',true);}
  else if(--b.clock<=0){b.phase='attack';b.clock=b.attack===0?28:20;b.burst=0;}
 }else if(b.phase==='attack'){
  e.lunge=b.clock;
  const launchWispOrb=(direction,speed=6)=>{
   if((g.projectiles?.length||0)<130){
    g.projectiles.push({x:e.x+e.w/2,y:e.y+e.h-22,w:22,h:22,vx:direction*speed,vy:-1.5,life:140,dmg:b.tier===3?18:13,owner:'enemy',shape:'orb',color:'#ba68c8'});
   }
  };
  if(!b.burst){
   if(b.attack===2){launchWispOrb(b.aim,7);if(b.tier>1)launchWispOrb(-b.aim,5);}
   if(b.attack===1){
    for(let side of [-1,1]){
     if((g.projectiles?.length||0)<130){
      g.projectiles.push({x:e.x+e.w/2,y:e.y+20,w:20,h:20,vx:side*5.2,vy:-3.8,life:120,dmg:14,owner:'enemy',shape:'orb',color:'#ce93d8'});
     }
    }
   }
   if(b.attack===3&&b.tier===3){
    for(let k=-2;k<=2;k++){
     if((g.projectiles?.length||0)<130){
      g.projectiles.push({x:e.x+e.w/2,y:e.y+30,w:18,h:18,vx:k*3.4,vy:-4,life:130,dmg:15,owner:'enemy',shape:'orb',color:'#ea80fc'});
     }
    }
   }
   b.burst=1;
  }
  if(b.attack===0){e.x+=b.aim*8.4;e.facing=b.aim;}
  if(Math.abs(p.x+p.w/2-(e.x+e.w/2))<e.w*0.5&&Math.abs(p.y+p.h/2-(e.y+e.h/2))<e.h*0.55){
   hurt?.(b.tier===3?19:14,'yomi-boss');
  }
  if(--b.clock<=0){b.phase='rest';b.clock=b.tier===3?35:55;b.attack=(b.attack+1)%PATTERNS.length;b.burst=0;}
 }
 return true;
}

export function drawYomiBoss(ctx,e,cam,t){
 if(!e?._yomiBoss)return false;
 const b=e._spiritGuide,x=e.x-cam.x,y=e.y-cam.y;
 ctx.save();
 ctx.translate(x+e.w/2,y+e.h);
 const flip=b.aim||1;ctx.scale(flip,1);

 // Spectral ghost robe body
 ctx.fillStyle=b.tier===3?'#4a148c':'#6a1b9a';
 ctx.strokeStyle='#e1bee7';
 ctx.lineWidth=3.5;
 ctx.beginPath();
 ctx.moveTo(-45,0);
 ctx.quadraticCurveTo(-50,-80,0,-90);
 ctx.quadraticCurveTo(50,-80,45,0);
 ctx.quadraticCurveTo(20,-15,0,0);
 ctx.quadraticCurveTo(-20,-15,-45,0);
 ctx.closePath();
 ctx.fill();
 ctx.stroke();

 // Kitsune ghost mask
 ctx.fillStyle='#ffffff';
 ctx.strokeStyle='#ba68c8';ctx.lineWidth=2;
 ctx.beginPath();
 ctx.moveTo(0,-75);
 ctx.lineTo(25,-95);
 ctx.lineTo(15,-60);
 ctx.lineTo(0,-50);
 ctx.lineTo(-15,-60);
 ctx.lineTo(-25,-95);
 ctx.closePath();
 ctx.fill();
 ctx.stroke();

 // Ethereal eye slits
 ctx.fillStyle='#ab47bc';
 ctx.fillRect(-10,-68,6,3);
 ctx.fillRect(4,-68,6,3);

 // Floating Will-o'-the-wisp core
 const pulse=Math.sin(t*0.14)*4;
 ctx.fillStyle=b.tier===3?'#ffffff':'#ea80fc';
 ctx.beginPath();
 ctx.arc(0,-35,12+pulse,0,Math.PI*2);
 ctx.fill();

 // Telegraph warning
 if(e.telegraph){
  ctx.strokeStyle='#ea80fc';
  ctx.lineWidth=2.5;
  ctx.setLineDash([6,6]);
  ctx.strokeRect(-65,-105,130,110);
 }
 ctx.restore();

 // Accessible Boss Health Bar
 const barW=140,barH=9,bx=x+e.w/2-barW/2,by=y-24;
 ctx.fillStyle='rgba(15,8,25,0.85)';
 ctx.fillRect(bx-2,by-2,barW+4,barH+4);
 const ratio=Math.max(0,e.hp/e.max);
 ctx.fillStyle=b.tier===3?'#d500f9':b.tier===2?'#ab47bc':'#7e57c2';
 ctx.fillRect(bx,by,barW*ratio,barH);
 ctx.strokeStyle='#e1bee7';
 ctx.lineWidth=1.2;
 ctx.strokeRect(bx-2,by-2,barW+4,barH+4);

 ctx.fillStyle='#f3e5f5';
 ctx.font='bold 10px sans-serif';
 ctx.textAlign='center';
 ctx.fillText(`GUÍA DEL MÁS ALLÁ · FASE ${b.tier} (${Math.ceil(e.hp)} PV)`,x+e.w/2,by-6);
 return true;
}

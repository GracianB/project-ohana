import {CHISPIN_CHAPTER_BOSS_ID} from './chispin-chapter.js';
// ISLAS DEL RELÁMPAGO — Titán de Trueno (Chispín's personal mini boss).
// 100% vector Canvas drawing: colossal brass & copper dynamo automaton.
// Three phases: floor ground-arcs, floating plasma coils, and full storm overload.
export const CHISPIN_BOSS_ID='hub-chispin-titan-v1';
export const CHISPIN_BOSS=Object.freeze({hp:480,left:3120,right:3990,floor:1134});
const PATTERNS=Object.freeze(['ground_arc','charge','plasma_burst','storm_overload']);

export function createChispinBoss(makeFoe,rng=()=>.5,options={}){
 const arena=Object.freeze({...CHISPIN_BOSS,...options.arena}),roomId=options.roomId||'hub',x=options.x??3420;
 const chapter=options.encounterId===CHISPIN_CHAPTER_BOSS_ID;
 const e=makeFoe(x,arena.floor-96,'cangrejo',roomId,998,{rng});
 e._chispinArena=arena;e._chispinChapter=chapter;
 e.x=x;e.w=chapter?150:118;e.h=chapter?132:96;e.y=arena.floor-e.h;
 e.hp=e.max=arena.hp;
 if(chapter){e.damageTakenScale=0;e.damageWindowRemaining=0;}
 e.miniBoss=true;e._chispinBoss=true;
 e._campaignOriginal=true;e.spawnIndex=998;
 e._encounterSaveId=options.encounterId||CHISPIN_BOSS_ID;
 e.roomId=roomId;e.color='#ffe45a';e.contactDmg=0;
 e._titan={phase:'intro',clock:100,attack:0,tier:1,aim:1,burst:0,exposed:false};
 return e;
}

export function updateChispinBoss(e,g,hurt){
 if(!e?._chispinBoss)return false;
 const b=e._titan,p=g.player,arena=e._chispinArena||CHISPIN_BOSS,chapter=e._chispinChapter,previousPhase=b.phase;
 if(e.invuln>0)e.invuln--;
 e.x=Math.max(arena.left,Math.min(arena.right-e.w,e.x));
 e.y=arena.floor-e.h;e.vy=0;e.grounded=true;e.vx=0;e.telegraph=false;
 if(!p||p.dead||e.hp<=0)return true;

 b.tier=e.hp<=e.max*.26?3:e.hp<=e.max*.60?2:1;
 const dx=p.x+p.w/2-(e.x+e.w/2);
 const visible=e.x+e.w>g.cam.x&&e.x<g.cam.x+(g.viewW||1100);
 if(e.sleep>0){e.sleep--;return true;}

 if(b.phase==='intro'){
  if(chapter&&g.world1&&(g.world1.stations.some(s=>!s.done)||p.evo<4))return true;
  if(visible&&Math.abs(dx)<670){
   if(--b.clock===60)g.nums?.add?.(e.x,e.y-40,'TITÁN DE TRUENO · REACTIVADO','#ffe45a',true);
   if(b.clock<=0){b.phase=chapter?'warn':'rest';b.clock=50;b.aim=Math.sign(dx)||1;}
  }
 }else if(b.phase==='rest'){
  b.exposed=true;
  if((--b.clock<=0||chapter&&e.damageWindowRemaining<=0)&&visible&&Math.abs(dx)<900){b.aim=Math.sign(dx)||1;b.phase='warn';b.clock=b.tier===3?35:50;b.exposed=false;if(chapter&&b.attack===3)b.stormX=[-110,0,110].map(offset=>Math.max(arena.left+20,Math.min(arena.right-20,p.x+p.w/2+offset)));}
 }else if(b.phase==='warn'){
  e.telegraph=true;e.wind=b.clock;
  if((e.stun||0)>=24&&!chapter){b.phase='rest';b.clock=90;b.exposed=true;g.nums?.add?.(e.x,e.y-30,'¡DESCARGA CORTADA!','#fff39e',true);}
  else if(--b.clock<=0){b.attacksExecuted=(b.attacksExecuted||0)+1;b.phase='attack';b.clock=b.attack===1?28:20;b.burst=0;}
 }else if(b.phase==='attack'){
  e.lunge=b.clock;
  const boltWave=(direction,speed=6)=>{
   if((g.projectiles?.length||0)<130){
    g.projectiles.push({x:e.x+e.w/2,y:e.y+e.h-22,w:22,h:16,vx:direction*speed,vy:0,life:140,dmg:b.tier===3?18:13,owner:'enemy',shape:'orb',color:'#ffe45a'});
   }
  };
  if(!b.burst){
   if(b.attack===0){boltWave(b.aim,6.5);if(b.tier>1)boltWave(-b.aim,4.5);}
   if(b.attack===2){
    for(let side of [-1,1]){
     if((g.projectiles?.length||0)<130){
      g.projectiles.push({x:e.x+e.w/2,y:e.y+20,w:20,h:20,vx:side*5,vy:-3,life:120,dmg:14,owner:'enemy',shape:'orb',color:'#ffd43f'});
     }
    }
   }
   if(b.attack===3){
    // Storm barrage from sky
    for(let i=-1;i<=1;i++){
     const sx=chapter?b.stormX[i+1]:p.x+i*80;
     g.fx?.emit?.(sx,p.y-120,{color:'#ffe45a',count:8,size:3,star:true,life:30});
     if((g.projectiles?.length||0)<130){
      g.projectiles.push({x:chapter?sx-9:sx,y:e.y-180,w:18,h:32,vx:0,vy:8,life:90,dmg:b.tier===3?22:15,owner:'enemy',shape:'orb',color:'#fff187'});
     }
    }
   }
   b.burst=1;
  }
  if(b.attack===1){
   e.x=Math.max(arena.left,Math.min(arena.right-e.w,e.x+b.aim*(b.tier===3?9.5:6)));
   if(Math.abs(dx)<(e.w+p.w)/2&&Math.abs(p.y+p.h/2-e.y-e.h/2)<(p.h+e.h)/2){
    hurt?.(b.tier===3?22:16,'EMBESTIDA VOLTAICA');
   }
  }
  if(--b.clock<=0){b.phase='rest';b.clock=b.tier===3?38:70;b.attack=(b.attack+1)%PATTERNS.length;b.exposed=true;}
 }
 if(chapter){if(b.phase==='rest'&&previousPhase!=='rest')e.damageWindowRemaining=160;e.damageTakenScale=b.phase==='rest'&&e.damageWindowRemaining>0?1:0;}
 e.stun=Math.min(e.stun||0,2);
 e._campaign={wind:e.wind,active:e.lunge,aim:b.aim};
 return true;
}

export function drawChispinBossSignals(ctx,e,cam,t=0,reduced=false){
 if(!e?._chispinBoss)return;
 const x=e.x+e.w/2-cam.x,y=e.y-cam.y,b=e._titan;
 ctx.save();ctx.textAlign='center';ctx.fillStyle='#19283f';ctx.fillRect(x-135,y-82,270,56);
 ctx.fillStyle='#fff1a4';ctx.font='bold 13px sans-serif';ctx.fillText('TITÁN DE TRUENO · '+b.tier+'/3',x,y-63);
 ctx.fillStyle='#455267';ctx.fillRect(x-120,y-52,240,8);ctx.fillStyle='#ffe45a';ctx.fillRect(x-120,y-52,240*Math.max(0,e.hp/e.max),8);
 ctx.fillStyle='#eaf6ff';ctx.font='11px sans-serif';ctx.fillText(b.phase==='rest'?'NÚCLEO ABIERTO · ATACA':b.phase==='intro'?'CUATRO ANTENAS · FORMA FINAL':'BLINDADO · ESQUIVA',x,y-32);
 if(e._chispinChapter&&b.phase==='warn'){
  const floor=e._chispinArena.floor-cam.y;ctx.strokeStyle='#ffe6a0';ctx.lineWidth=3;ctx.setLineDash([8,6]);
  if(b.attack===3){for(const sx of b.stormX||[]){ctx.beginPath();ctx.moveTo(sx-cam.x,floor-300);ctx.lineTo(sx-cam.x,floor);ctx.stroke();}}
  else{ctx.beginPath();ctx.moveTo(x,floor-12);ctx.lineTo(x+b.aim*(b.attack===1?350:270),floor-12);ctx.stroke();}
  ctx.setLineDash([]);ctx.fillStyle='#fff5c4';ctx.font='bold 12px sans-serif';ctx.fillText(['SALTA EL ARCO','CRUZA O ESQUIVA LA CARGA','ALÉJATE DE LAS BOBINAS','SAL DE LAS TRES COLUMNAS'][b.attack],x,y-97);
 }
 ctx.restore();
 if(e.telegraph){
  ctx.save();
  ctx.strokeStyle='rgba(255,228,90,0.7)';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.arc(x,y+e.h/2,65+(reduced?0:Math.sin(t*0.2)*8),0,Math.PI*2);ctx.stroke();
  ctx.restore();
 }
}

export function drawChispinBossBody(ctx,e,cam,t=0,reduced=false){
 if(!e?._chispinBoss)return;
 const x=e.x-cam.x,y=e.y-cam.y,b=e._titan;
 ctx.save();ctx.translate(x+e.w/2,y+e.h);if(e._chispinChapter)ctx.scale(e.w/90,1);

 // Heavy copper/brass automaton chassis
 ctx.fillStyle='#2f1e44';ctx.strokeStyle='#ffe45a';ctx.lineWidth=3;
 ctx.beginPath();
 ctx.moveTo(-45,0);ctx.lineTo(-40,-e.h*0.7);ctx.lineTo(-20,-e.h);ctx.lineTo(20,-e.h);ctx.lineTo(40,-e.h*0.7);ctx.lineTo(45,0);
 ctx.closePath();ctx.fill();ctx.stroke();

 if(e._chispinChapter){
  // Copper automaton: face, armour, vents and moving pistons follow the actual
  // windup/charge/recovery. Keep the chassis aligned with its real body bounds.
  ctx.strokeStyle='#18182a';ctx.lineWidth=1.8;
  ctx.fillStyle='#655061';ctx.fillRect(-28,-e.h*.77,56,27);ctx.strokeRect(-28,-e.h*.77,56,27);
  ctx.fillStyle='#15243a';ctx.fillRect(-23,-e.h*.75,46,15);
  ctx.fillStyle=b.phase==='rest'?'#a0ffe1':b.phase==='warn'?'#ffbe77':'#f9e76d';
  for(const side of [-1,1]){ctx.beginPath();ctx.ellipse(side*13,-e.h*.75+7,6,4,0,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='#24253a';for(let i=-12;i<=12;i+=6)ctx.fillRect(i,-e.h*.77+20,3,3);
  for(const side of [-1,1]){
   ctx.fillStyle='#9d673f';ctx.fillRect(side<0?-38:26,-e.h*.53,12,37);ctx.strokeRect(side<0?-38:26,-e.h*.53,12,37);
   const lift=b.phase==='warn'?-10:b.phase==='attack'?5:reduced?0:Math.sin(t*.07+side)*2;
   ctx.strokeStyle='#18182a';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(side*35,-e.h*.62);ctx.lineTo(side*40,-e.h*.38+lift);ctx.stroke();
   ctx.strokeStyle='#daa354';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(side*35,-e.h*.62);ctx.lineTo(side*40,-e.h*.38+lift);ctx.stroke();
   ctx.fillStyle='#594958';ctx.fillRect(side*26-7,-19,14,19);ctx.strokeStyle='#18182a';ctx.lineWidth=1.5;ctx.strokeRect(side*26-7,-19,14,19);
   for(const yy of [-e.h*.82,-e.h*.25]){ctx.fillStyle='#ffe899';ctx.beginPath();ctx.arc(side*25,yy,2.5,0,Math.PI*2);ctx.fill();ctx.stroke();}
  }
  ctx.fillStyle='#241f34';ctx.fillRect(-17,-e.h*.25,34,12);ctx.strokeStyle='#b58b5d';ctx.lineWidth=1;
  for(let i=-12;i<=12;i+=6){ctx.beginPath();ctx.moveTo(i,-e.h*.25+2);ctx.lineTo(i,-e.h*.25+10);ctx.stroke();}
 }

 // Central dynamo core (glowing yellow/orange)
 const corePulse=reduced?0:Math.sin(t*0.15)*4;
 ctx.fillStyle=b.exposed?'#ffea78':'#d68a28';
 ctx.beginPath();ctx.arc(0,-e.h*0.5,18+corePulse,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.stroke();

 // Shoulder Tesla coils
 for(const side of [-1,1]){
  ctx.fillStyle='#b86a24';ctx.fillRect(side*38-6,-e.h*0.9,12,24);
  ctx.strokeStyle='#ffe45a';ctx.strokeRect(side*38-6,-e.h*0.9,12,24);
  ctx.fillStyle='#fff084';ctx.beginPath();ctx.arc(side*38,-e.h*0.9-4,6,0,Math.PI*2);ctx.fill();
 }

 // Horn / Lightning rod crest
 ctx.strokeStyle='#ffe45a';ctx.lineWidth=3.5;
 ctx.beginPath();ctx.moveTo(0,-e.h);ctx.lineTo(0,-e.h-22);ctx.stroke();
 ctx.fillStyle='#fff9a6';ctx.beginPath();ctx.arc(0,-e.h-24,5,0,Math.PI*2);ctx.fill();

 // Spark discharge in high tier
 if(!reduced&&b.tier>=2){
  ctx.strokeStyle='#ffe45a';ctx.lineWidth=1.5;
  for(let i=0;i<3;i++){
   const sa=i*Math.PI*2/3+t*0.2;
   ctx.beginPath();ctx.moveTo(0,-e.h*0.5);ctx.lineTo(Math.cos(sa)*32,-e.h*0.5+Math.sin(sa)*32);ctx.stroke();
  }
 }

 ctx.restore();
}

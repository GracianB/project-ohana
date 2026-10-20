// OBSERVATORIO ASTRAL — Yomi's solo campaign chapter inside the expanded Claro.
// Spirit draft updrafts, torii astral barriers, glowing soul lanterns, spirit beacons
// and the celestial throne arena with Guía del Más Allá.
// Unique mechanic: yomiAbility near a draft → OFRENDA ESPIRITUAL (phases through
// one barrier and grants brief invulnerability with a spirit-orb shield).
import {movePlatform,drawPlatformRail} from './moving-platforms.js';
import {createYomiBoss,YOMI_BOSS_ID} from './yomi-boss.js';

const SAVE_KEY='yomi-trail-v1';
const FRAGMENT_PREFIX='yomi-soul-';

export const YOMI_BEACONS=Object.freeze([
 Object.freeze({id:'yomi-threshold',x:440, y:1074,label:'ESPÍRITU',need:0,line:'El farol astral enciende su llama violeta en el umbral espiritual.'}),
 Object.freeze({id:'yomi-torii',    x:1720,y:1090,label:'TORII',    need:2,line:'Las corrientes del más allá elevan a las almas errantes en silencio.'}),
 Object.freeze({id:'yomi-throne',   x:3080,y:1084,label:'ASTRAL',   need:4,line:'¡El Guía del Más Allá despierta en el Trono Astral eterno!'})
]);

// ── 8 soul lanterns on unique positions ──────────────────────────────────────
export const YOMI_SOULS=Object.freeze([
 Object.freeze({id:'a',x:270, y:1008}),  // Sector 0 — torii bridge
 Object.freeze({id:'b',x:520, y:918}),   // Sector 0 — second gate
 Object.freeze({id:'c',x:860, y:808}),   // Sector 0 — upper spirit ledge
 Object.freeze({id:'d',x:1530,y:758}),   // Sector 1 — gallery crystal
 Object.freeze({id:'e',x:1850,y:708}),   // Sector 1 — second gallery
 Object.freeze({id:'f',x:2700,y:818}),   // Sector 2 — nebula rock
 Object.freeze({id:'g',x:2900,y:418}),   // Sector 2 — high nebula shelf
 Object.freeze({id:'h',x:3780,y:1075})   // Sector 3 — throne altar
]);

// ── 4 spirit draft updrafts ───────────────────────────────────────────────────
export const YOMI_DRAFTS=Object.freeze([
 Object.freeze({x:1130,y:1134,force:17.0,shieldTicks:90,color:'#ba68c8'}),
 Object.freeze({x:1680,y:1134,force:16.8,shieldTicks:80,color:'#ce93d8'}),
 Object.freeze({x:2340,y:1134,force:17.2,shieldTicks:90,color:'#ba68c8'}),
 Object.freeze({x:2810,y:1134,force:17.0,shieldTicks:80,color:'#ce93d8'})
]);

// ── 3 torii astral barriers ───────────────────────────────────────────────────
export const YOMI_BARRIERS=Object.freeze([
 Object.freeze({x:1470,y:1134,w:58,height:162,offset:0}),
 Object.freeze({x:2510,y:1134,w:58,height:162,offset:50}),
 Object.freeze({x:2840,y:1134,w:58,height:162,offset:100})
]);

export const YOMI_ACTS=Object.freeze([
 'EL UMBRAL DE LOS ESPÍRITUS','LOS SENDEROS DE TORII','EL SANTUARIO DE LAS ALMAS',
 'EL GUÍA DEL MÁS ALLÁ','LA CONSTELACIÓN ETERNA'
]);

const inRange=(p,x,y,r)=>!!p&&Math.hypot(p.x+p.w/2-x,p.y+p.h/2-y)<r;
const read  =(g)=>new Set(g.secrets?.hub||[]);
function persist(g,key){g.secrets||={};g.secrets.hub||=[];if(g.secrets.hub.includes(key))return false;g.secrets.hub.push(key);g.save?.();return true;}

export function enterYomiTrail(g){
 if(g.roomId!=='hub'||g.player?.id!=='yomi'||g.personalAdventureSolo===false){g.yomiTrail=null;return;}
 const saved=read(g),complete=saved.has(SAVE_KEY),cleared=(g.clearedEncounters?.hub||[]).includes(YOMI_BOSS_ID);
 const index=complete?YOMI_BEACONS.length:Math.max(0,YOMI_BEACONS.findIndex(b=>!saved.has(b.id)));

 // Floating spirit platform drifts — slow, ethereal oscillations
 const lifts=[
  {axis:'x',x:1020,y:880,span:240,period:310},
  {axis:'y',x:1560,y:800,span:200,period:340},
  {axis:'x',x:2450,y:760,span:260,period:320},
  {axis:'y',x:2790,y:650,span:310,period:360}
 ].map((motion,i)=>{
  motion.start=Number(g.t)||0;motion.phase=i*.72;
  const platform={x:motion.x,y:motion.y,w:195,h:22,_campaignLift:true};
  return {motion,platform};
 });
 for(const item of lifts)if(!g.platforms.includes(item.platform))g.platforms.push(item.platform);

 g.yomiTrail={
  saved,complete,index:index<0?YOMI_BEACONS.length:index,
  bossDefeated:cleared,banner:0,bannerText:'',bannerSub:'',lifts,
  barrierPhase:[0,0,0],altarLit:complete,altarAge:0,
  act:cleared?4:Math.min(3,index<0?3:index),
  draftCooldown:[0,0,0,0],shield:0
 };
}

export function updateYomiTrail(game,hurtPlayer){
 const s=game.yomiTrail,p=game.player;if(!s||!p||p.dead)return;
 for(const item of s.lifts)movePlatform(item.platform,item.motion,game.t,p);
 if(s.banner>0)s.banner--;
 if(s.shield>0){s.shield--;if(p.invuln<s.shield)p.invuln=Math.max(p.invuln,s.shield);}

 // Spirit drafts
 for(let i=0;i<YOMI_DRAFTS.length;i++){
  const dr=YOMI_DRAFTS[i];if(s.draftCooldown[i]>0){s.draftCooldown[i]--;continue;}
  const dx=Math.abs(p.x+p.w/2-dr.x);
  if(dx<52&&p.y<dr.y&&p.y>dr.y-310){
   p.vy=Math.max(-dr.force,p.vy-1.1);p.grounded=false;
   if(game.t%5===0)game.fx?.emit?.(p.x+p.w/2,p.y+p.h,{color:dr.color,count:2,up:4.5,size:3.5,life:30});
  }
 }

 // Astral barriers (phase through when shield active)
 for(let i=0;i<YOMI_BARRIERS.length;i++){
  const bar=YOMI_BARRIERS[i];if(s.barrierPhase[i]>0){s.barrierPhase[i]--;continue;}
  if(s.shield>0)continue;  // phasing through
  const near=Math.abs(p.x+p.w/2-bar.x)<bar.w+28&&p.y+p.h>bar.y-bar.height&&p.y<bar.y;
  if(near){if(p.x+p.w/2<bar.x)p.x=bar.x-bar.w/2-p.w;else p.x=bar.x+bar.w/2;p.vx=0;}
 }

 // Collect soul lanterns
 for(const soul of YOMI_SOULS){
  const key=FRAGMENT_PREFIX+soul.id;
  if(!s.saved.has(key)&&inRange(p,soul.x,soul.y,40)){
   persist(game,key);s.saved.add(key);
   game.nums?.add?.(soul.x,soul.y-28,'+1 LINTERNA DEL ALMA','#e1bee7',true);
   game.fx?.emit?.(soul.x,soul.y,{color:'#ce93d8',count:12,up:4.5,size:3.5,life:32});
  }
 }

 // Beacons
 for(let i=0;i<YOMI_BEACONS.length;i++){
  const b=YOMI_BEACONS[i];
  if(!s.saved.has(b.id)&&inRange(p,b.x,b.y,65)){
   const collected=[...s.saved].filter(k=>k.startsWith(FRAGMENT_PREFIX)).length;
   if(collected>=b.need){
    persist(game,b.id);s.saved.add(b.id);
    s.index=i+1;s.act=Math.min(4,i+1);
    s.banner=190;s.bannerText=b.label+' ENCENDIDO';s.bannerSub=b.line;
    game.fx?.emit?.(b.x,b.y,{color:'#ce93d8',count:18,up:6.5,size:5,life:48});
   }
  }
 }

 const arenaX=3420,bossDefeated=(game.clearedEncounters?.hub||[]).includes(YOMI_BOSS_ID);
 if(!bossDefeated&&!game.enemies.some(e=>e._yomiBoss)&&Math.abs(p.x-arenaX)<800){
  const boss=createYomiBoss((x,y,k,r,idx,extra)=>game.createEnemy?.(x,y,k,r,idx,extra)||{x,y,w:110,h:120,hp:480,max:480});
  game.enemies.push(boss);
 }
 if(!s.bossDefeated&&bossDefeated){
  s.bossDefeated=true;s.act=4;
  s.banner=210;s.bannerText='¡GUÍA DEL MÁS ALLÁ DERROTADO!';
  s.bannerSub='El Altar Astral ha despertado — reclama la Constelación Eterna.';
 }

 const altarX=3780,altarY=1100;
 if(s.bossDefeated&&!s.complete&&inRange(p,altarX,altarY,70)){
  persist(game,SAVE_KEY);s.complete=true;s.altarLit=true;s.altarAge=0;
  s.banner=250;s.bannerText='¡RELIQUIA: CONSTELACIÓN ETERNA!';
  s.bannerSub='Yomi ha encendido la constelación eterna de la familia.';
  p._heroHundredBonus='CONSTELACIÓN ETERNA';game.roomAlbums?.hub?.relic?.();
 }
 if(s.altarLit)s.altarAge=(s.altarAge||0)+1;
}

// OFRENDA ESPIRITUAL: near a draft → spirit shield (phase barriers + brief invuln)
// Near a barrier → open it via astral seal
export function yomiAbility(game,player,index){
 const s=game.yomiTrail;if(!s||!player)return;
 for(let i=0;i<YOMI_DRAFTS.length;i++){
  const dr=YOMI_DRAFTS[i];if(s.draftCooldown[i]>0)continue;
  if(Math.abs(player.x+player.w/2-dr.x)<110&&player.y<dr.y&&player.y>dr.y-380){
   s.draftCooldown[i]=180;s.shield=dr.shieldTicks;
   player.vy=-dr.force;player.grounded=false;
   game.nums?.add?.(dr.x,dr.y-70,'¡OFRENDA ESPIRITUAL!','#e1bee7',true);
   game.fx?.emit?.(dr.x,dr.y,{color:dr.color,count:22,up:7,size:5.5,life:48});
  }
 }
 for(let i=0;i<YOMI_BARRIERS.length;i++){
  const bar=YOMI_BARRIERS[i];if(s.barrierPhase[i]>0)continue;
  if(Math.abs(player.x+player.w/2-bar.x)<110&&Math.abs(player.y-bar.y)<bar.height+90){
   s.barrierPhase[i]=200;
   game.nums?.add?.(bar.x,bar.y-bar.height/2,'¡SELLO ASTRAL!','#e1bee7',true);
   game.fx?.emit?.(bar.x,bar.y-bar.height/2,{color:'#ce93d8',count:16,up:5,size:5,life:40});
  }
 }
}

export function drawYomiTrail(ctx,game,cam,t){
 const s=game.yomiTrail;if(!s)return;
 ctx.save();
 for(const item of s.lifts)drawPlatformRail(ctx,item.platform,item.motion,cam);

 // Spirit draft columns
 for(let i=0;i<YOMI_DRAFTS.length;i++){
  const dr=YOMI_DRAFTS[i];
  const dx=dr.x-cam.x,dy=dr.y-cam.y;
  const shielding=s.draftCooldown[i]>0;
  ctx.fillStyle='#4a148c';
  ctx.beginPath();ctx.moveTo(dx-34,dy);ctx.lineTo(dx-18,dy-20);ctx.lineTo(dx+18,dy-20);ctx.lineTo(dx+34,dy);ctx.closePath();ctx.fill();
  const pulse=Math.sin(t*.18+dr.x)*(shielding?14:6);
  const colH=shielding?210:140;
  const dG=ctx.createLinearGradient(dx,dy-20,dx,dy-colH+pulse);
  dG.addColorStop(0,`rgba(${shielding?'206,147,216':'186,104,200'},${shielding?.85:.55})`);dG.addColorStop(1,'rgba(186,104,200,0)');
  ctx.fillStyle=dG;
  ctx.beginPath();ctx.moveTo(dx-18,dy-20);ctx.lineTo(dx-(shielding?28:18),dy-colH+pulse);ctx.lineTo(dx+(shielding?28:18),dy-colH+pulse);ctx.lineTo(dx+18,dy-20);ctx.closePath();ctx.fill();
  if(shielding){ctx.fillStyle='rgba(225,190,231,0.9)';ctx.font='bold 8px sans-serif';ctx.textAlign='center';ctx.fillText('SHIELD',dx,dy-colH-8);}
 }

 // Torii astral barriers
 for(let i=0;i<YOMI_BARRIERS.length;i++){
  const bar=YOMI_BARRIERS[i],phased=s.barrierPhase[i]>0||s.shield>0;
  const bx=bar.x-cam.x,by=bar.y-cam.y;
  if(phased){
   ctx.strokeStyle='rgba(206,147,216,0.3)';ctx.lineWidth=1.5;ctx.setLineDash([4,4]);
   ctx.strokeRect(bx-bar.w/2,by-bar.height,bar.w,bar.height);ctx.setLineDash([]);
  }else{
   // Torii gate shape
   ctx.fillStyle='rgba(74,20,140,0.82)';ctx.strokeStyle='#ce93d8';ctx.lineWidth=2;
   ctx.fillRect(bx-bar.w/2,by-bar.height,bar.w,bar.height);ctx.strokeRect(bx-bar.w/2,by-bar.height,bar.w,bar.height);
   // Top crossbeam
   ctx.fillRect(bx-bar.w/2-8,by-bar.height+6,bar.w+16,8);
   ctx.fillRect(bx-bar.w/2-4,by-bar.height+20,bar.w+8,6);
   // Spirit seal orb
   ctx.fillStyle='#e1bee7';ctx.beginPath();ctx.arc(bx,by-bar.height/2,10,0,Math.PI*2);ctx.fill();
   ctx.fillStyle='#7b1fa2';ctx.beginPath();ctx.arc(bx,by-bar.height/2,5,0,Math.PI*2);ctx.fill();
   ctx.fillStyle='#e1bee7';ctx.font='bold 8px sans-serif';ctx.textAlign='center';ctx.fillText('J/K',bx,by-bar.height/2+22);
  }
 }

 // Soul lantern collectibles
 for(const soul of YOMI_SOULS){
  const key=FRAGMENT_PREFIX+soul.id;if(s.saved.has(key))continue;
  const sx=soul.x-cam.x,sy=soul.y-cam.y;
  const bob=Math.sin(t*.09+soul.x)*.5*7;
  ctx.strokeStyle='rgba(130,60,180,0.7)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(sx,sy-24+bob);ctx.lineTo(sx,sy-10+bob);ctx.stroke();
  ctx.fillStyle='#ce93d8';ctx.strokeStyle='#e1bee7';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.ellipse(sx,sy,8,12,0,0,Math.PI*2);ctx.fill();ctx.stroke();
  const gAlpha=0.4+Math.sin(t*.12+soul.x)*.2;
  ctx.fillStyle=`rgba(206,147,216,${gAlpha})`;ctx.beginPath();ctx.arc(sx,sy,18,0,Math.PI*2);ctx.fill();
 }

 // Spirit beacons (stone torii pillars)
 for(const b of YOMI_BEACONS){
  const active=s.saved.has(b.id);
  const bx=b.x-cam.x,by=b.y-cam.y;
  // Left pillar
  ctx.fillStyle='#4a148c';ctx.fillRect(bx-18,by-55,10,55);
  // Right pillar
  ctx.fillRect(bx+8,by-55,10,55);
  // Crossbeam
  ctx.fillRect(bx-24,by-58,48,8);
  // Spirit orb
  ctx.fillStyle=active?'#ce93d8':'#7b1fa2';
  ctx.beginPath();ctx.arc(bx,by-70,12,0,Math.PI*2);ctx.fill();
  if(active){
   ctx.fillStyle='rgba(206,147,216,0.28)';ctx.beginPath();ctx.arc(bx,by-70,28+Math.sin(t*.14)*4,0,Math.PI*2);ctx.fill();
  }
  ctx.fillStyle=active?'#e1bee7':'#ba68c8';ctx.font='bold 8px sans-serif';ctx.textAlign='center';ctx.fillText(b.label,bx,by-6);
 }

 // Astral altar
 {
  const ax=3780-cam.x,ay=1100-cam.y;
  ctx.fillStyle='#4a148c';ctx.fillRect(ax-48,ay-22,96,22);
  ctx.fillStyle='#7b1fa2';ctx.fillRect(ax-34,ay-42,68,20);
  ctx.fillStyle=s.altarLit?'#e040fb':'#9c27b0';
  ctx.beginPath();ctx.arc(ax,ay-58,26,0,Math.PI*2);ctx.fill();
  if(s.altarLit){
   const age=s.altarAge||0;
   ctx.fillStyle=`rgba(224,64,251,${0.25+Math.sin(age*.08)*.1})`;ctx.beginPath();ctx.arc(ax,ay-58,48+Math.sin(age*.1)*8,0,Math.PI*2);ctx.fill();
  }
 }

 if(s.banner>0&&s.bannerText){
  const alpha=Math.min(1,s.banner/30);
  ctx.fillStyle=`rgba(12,4,24,${0.88*alpha})`;ctx.fillRect(160,44,760,58);
  ctx.strokeStyle=`rgba(206,147,216,${alpha})`;ctx.lineWidth=2;ctx.strokeRect(160,44,760,58);
  ctx.globalAlpha=alpha;
  ctx.fillStyle='#e1bee7';ctx.font='bold 17px sans-serif';ctx.textAlign='center';ctx.fillText(s.bannerText,540,72);
  ctx.fillStyle='#ce93d8';ctx.font='12px sans-serif';ctx.fillText(s.bannerSub,540,92);
  ctx.globalAlpha=1;
 }
 ctx.restore();
}

export function yomiTrailSnapshot(g){
 return{active:!!g.yomiTrail,complete:g.yomiTrail?.complete||false,act:g.yomiTrail?.act||0,souls:[...g.yomiTrail?.saved||[]].filter(k=>k.startsWith(FRAGMENT_PREFIX)).length};
}

import {pizzaBaked} from './pizza-chapter.js';
import {XP_NEED} from './xp.js';
export const NEXT_CHAPTERS=Object.freeze({
 pizza:{bossId:'w1-pizza-chef-v1',name:'Chef Magmático',color:'#f3d3ac',state:'_magmaChef',patterns:['SALTA LA CARRERA DEL CHEF','ESQUIVA EL QUESO','SALTA EL GOLPE DE PALA','BUSCA EL HUECO DEL ABANICO']},
 dino:{bossId:'w1-dino-colossus-v1',name:'Coloso de Piedra Ancestral',color:'#dce9b8',state:'_stoneColossus',patterns:['SALTA LA EMBESTIDA','ESQUIVA LAS ROCAS','SALTA LA ONDA FÓSIL','BUSCA EL HUECO DEL ABANICO']},
 cat:{bossId:'w1-cat-astral-v1',name:'Oráculo Medusaluna',color:'#e6c4f1',state:'_astralCat',patterns:['ESQUIVA EL ZARPAZO','SEPARA LOS ORBES','SALTA LA MEDIA LUNA','SAL DE LAS COLUMNAS']},
 cuerno:{bossId:'w1-cuerno-prism-v1',name:'Bestia Prisma',color:'#c8e7bd',state:'_prismBeast',patterns:['ESQUIVA LA CARGA','CAMBIA DE ALTURA','SALTA EL ABANICO','BUSCA EL HUECO ENTRE PRISMAS']},
 dragon:{bossId:'w1-dragon-igneous-v1',name:'Guardián del Núcleo Ígneo',color:'#ffc594',state:'_igneousDragon',patterns:['ESQUIVA LA CARGA','APÁRTATE DE LA LAVA','SALTA LA ONDA','CAMBIA DE ALTURA']}
});
export const NEXT_ARENA=Object.freeze({left:8260,right:9320,floor:1134,hp:640});
export const DAWN_MIRROR=Object.freeze({id:'w1-cuerno-dawn-mirror-v1',x:1000,y:1134});
export const DRAGON_THERMALS=Object.freeze([3050,4750,6450].map(x=>Object.freeze({x,y:1134,h:470,w:136})));
export function nextChapter(g){const hero=g?.roomDef?.growthChapter;return NEXT_CHAPTERS[hero]?hero:null;}
export const mirrorRestored=g=>!!g.secrets?.['w1-cuerno']?.includes(DAWN_MIRROR.id);
export function nextChapterGrowth(g){
 const hero=nextChapter(g),w=g?.world1,p=g?.player;if(!hero||!w||!p)return 0;
 const n=w.stations.filter(s=>s.done).length;
 const stage=w.sealed?4:hero==='pizza'?Math.min(4,n+(pizzaBaked(g)?1:0)):hero==='cat'?[0,1,2,3,3,4][Math.min(5,n)]:hero==='cuerno'?Math.min(4,n+(mirrorRestored(g)?1:0)):Math.min(4,n);
 const floor=XP_NEED[stage]||0;p.xp=Math.max(Number(p.xp)||0,floor);return floor;
}
export function nextChapterReady(g){
 const hero=nextChapter(g);if(!hero)return true;
 if(g.world1Seals?.includes(hero))return true;
 return !!g.world1?.stations.every(s=>s.kind==='oven'||s.done)&&(hero!=='cuerno'||mirrorRestored(g))&&!!g.clearedEncounters?.[g.roomDef.id]?.includes(NEXT_CHAPTERS[hero].bossId);
}
export function nextChapterAbility(g,p,index){
 const hero=nextChapter(g);if(!hero||p?.id!==hero||index!==0||!g.world1)return;
 if(hero==='cuerno'&&!mirrorRestored(g)&&Math.abs(p.x+p.w/2-DAWN_MIRROR.x)<210&&Math.abs(p.y+p.h-1134)<180){
  g.secrets||={};const found=g.secrets['w1-cuerno']||=[];found.push(DAWN_MIRROR.id);g.score=(g.score||0)+150;nextChapterGrowth(g);
  g.nums?.add?.(DAWN_MIRROR.x,1030,'EL ESPEJO DEVUELVE EL ALBA · K DESPIERTA','#fff0bd',true);g.save?.();
 }
 if(hero==='dragon')for(const s of g.world1.stations){const dx=s.x-p.x-p.w/2;if(!s.done&&Math.abs(dx)<270&&dx*(p.facing||1)>-30&&Math.abs(p.y+p.h-s.y)<160)s.flameUntil=g.world1.tick+25;}
}
export function updateNextChapter(g){
 const hero=nextChapter(g),p=g?.player,w=g?.world1;if(!hero||!p||p.dead||!w)return;
 nextChapterGrowth(g);
 if(hero==='cat'){
  g.platforms||=[];
  for(const s of w.stations)if(s.done&&!g.platforms.some(pl=>pl._michiBridge===s.id))g.platforms.push({x:s.x-78,y:s.y+26,w:156,h:16,_michiBridge:s.id});
 }
 if(hero==='dragon'&&p.evo>=1&&!p.grounded)for(const vent of DRAGON_THERMALS)if(Math.abs(p.x+p.w/2-vent.x)<vent.w/2&&p.y+p.h<vent.y-18&&p.y+p.h>vent.y-vent.h){p.vy=Math.max(-10,(p.vy||0)-.8);p.coyote=0;w.thermalFrames=(w.thermalFrames||0)+1;}
}
export function nextChapterObjective(g){
 const hero=nextChapter(g),w=g?.world1;if(!hero||!w||w.sealed)return null;
 if(hero==='cuerno'&&!mirrorRestored(g))return {x:DAWN_MIRROR.x,y:1134,label:'Espejo del alba',action:'Acércate y pulsa J para devolver la luz al bosque. Después sigue los prismas I → II → III'};
 if(w.stations.every(s=>s.kind==='oven'||s.done))return {x:8750,y:1134,label:NEXT_CHAPTERS[hero].name,action:'La sala está restaurada. Esquiva el ataque anunciado y golpea durante la recuperación'};
 return null;
}
export function drawNextChapter(ctx,g,cam,t){
 const hero=nextChapter(g);if(!hero)return;ctx.save();ctx.textAlign='center';
 if(hero==='cuerno'){
  const x=DAWN_MIRROR.x-cam.x,y=1134-cam.y,done=mirrorRestored(g);ctx.strokeStyle='#6f8e7c';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x-26,y);ctx.quadraticCurveTo(x-5,y-28,x,y-90);ctx.stroke();
  ctx.fillStyle=done?'#fff5c9':'#d5e7df';ctx.strokeStyle='#779c99';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y-110,32,43,.2,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.strokeStyle='#f9f6db';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-12,y-131);ctx.lineTo(x+12,y-104);ctx.stroke();
  if(done){ctx.strokeStyle='#fff0b6';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y-110);ctx.lineTo(x+270,y-160);ctx.stroke();}
  ctx.fillStyle='#284c45';ctx.font='bold 12px sans-serif';ctx.fillText(done?'LUZ DEL ALBA RESTAURADA':'ESPEJO DEL ALBA · J',x,y-175);
 }
 if(hero==='dragon')for(const vent of DRAGON_THERMALS){const x=vent.x-cam.x,y=vent.y-cam.y;if(x<-120||x>(g.viewW||1280)+120)continue;
  ctx.fillStyle='#6d625b';ctx.beginPath();ctx.ellipse(x,y-5,72,15,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ffc791';ctx.lineWidth=2;
  for(let i=0;i<5;i++){const rise=g.reduceMotion?i/5:((t*.006+i/5)%1),yy=y-rise*vent.h;ctx.globalAlpha=.65*(1-rise);ctx.beginPath();ctx.moveTo(x-35,yy);ctx.bezierCurveTo(x-15,yy-14,x+15,yy+14,x+35,yy);ctx.stroke();}ctx.globalAlpha=1;
  ctx.fillStyle='#594a42';ctx.font='bold 12px sans-serif';ctx.fillText('TÉRMICA · SALTA PARA ASCENDER',x,y-45);
 }
 ctx.restore();
}
export function chapterBossStart(e,g,b){
 const hero=e._growthChapter;if(!hero)return true;
 e.x=Math.max(NEXT_ARENA.left,Math.min(NEXT_ARENA.right-e.w,e.x));e.y=NEXT_ARENA.floor-e.h;
 if(b.phase==='intro'&&g.world1&&(g.world1.stations.some(s=>s.kind!=='oven'&&!s.done)||(hero==='cuerno'&&!mirrorRestored(g))||g.player.evo<4))return false;
 return true;
}
export function chapterBossFinish(e,g,b,previous){
 const hero=e._growthChapter;if(!hero)return;
 if(b.phase==='warn'&&previous!=='warn'){
  b.columns=[-110,0,110].map(dx=>Math.max(NEXT_ARENA.left+20,Math.min(NEXT_ARENA.right-20,g.player.x+g.player.w/2+dx)));
  if(hero==='dragon'&&g.player.y+g.player.h/2<e.y-60){const a=Math.atan2(g.player.y+g.player.h/2-(e.y+35),g.player.x+g.player.w/2-(e.x+e.w/2));b.airRays=[-.18,0,.18].map(d=>({vx:Math.cos(a+d)*5.5,vy:Math.sin(a+d)*5.5}));}else b.airRays=null;
 }
 if(b.phase==='attack'&&previous!=='attack'){
  b.attacksExecuted=(b.attacksExecuted||0)+1;
  for(const ray of b.airRays||[])if(g.projectiles.length<130)g.projectiles.push({x:e.x+e.w/2,y:e.y+35,w:14,h:14,...ray,owner:'enemy',dmg:16,life:150,color:'#ffd3a3'});
 }
 if(b.phase==='rest'&&previous!=='rest')e.damageWindowRemaining=160;
 e.damageTakenScale=b.phase==='rest'&&e.damageWindowRemaining>0?1:0;
 e.stun=Math.min(e.stun||0,2);e.x=Math.max(NEXT_ARENA.left,Math.min(NEXT_ARENA.right-e.w,e.x));e.y=NEXT_ARENA.floor-e.h;
}
export function drawChapterBossHud(ctx,e,cam){
 const def=NEXT_CHAPTERS[e._growthChapter];if(!def||e.hp<=0)return;const b=e[def.state],x=e.x+e.w/2-cam.x,y=e.y-cam.y;
 ctx.save();ctx.textAlign='center';ctx.fillStyle='#18323f';ctx.fillRect(x-145,y-90,290,60);ctx.fillStyle=def.color;ctx.font='bold 12px sans-serif';ctx.fillText(def.name.toUpperCase()+' · '+b.tier+'/3',x,y-70);
 ctx.fillStyle='#526473';ctx.fillRect(x-128,y-60,256,7);ctx.fillStyle=def.color;ctx.fillRect(x-128,y-60,256*Math.max(0,e.hp/e.max),7);
 ctx.fillStyle='#f4f6df';ctx.font='11px sans-serif';ctx.fillText(b.phase==='rest'?'RECUPERACIÓN · ATACA':'PROTEGIDO · ESQUIVA',x,y-39);
 if(b.phase==='warn'){
  ctx.strokeStyle=def.color;ctx.lineWidth=3;ctx.setLineDash([7,6]);
  if(e._growthChapter==='cat'&&b.attack===3)for(const col of b.columns||[]){ctx.beginPath();ctx.moveTo(col-cam.x,NEXT_ARENA.floor-cam.y-300);ctx.lineTo(col-cam.x,NEXT_ARENA.floor-cam.y);ctx.stroke();}
  else if(b.airRays)for(const ray of b.airRays){ctx.beginPath();ctx.moveTo(x,y+35);ctx.lineTo(x+ray.vx*50,y+35+ray.vy*50);ctx.stroke();}
  else{ctx.beginPath();ctx.moveTo(x,NEXT_ARENA.floor-cam.y-10);ctx.lineTo(x+(b.aim||1)*300,NEXT_ARENA.floor-cam.y-10);ctx.stroke();}
  ctx.setLineDash([]);ctx.font='bold 12px sans-serif';ctx.fillText(b.airRays?'CAMBIA DE ALTURA · ABANICO':def.patterns[b.attack],x,y-104);
 }
 ctx.restore();
}

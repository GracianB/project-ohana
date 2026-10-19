// Ten personal 100-piece collections, each scoped to a hero and a playable room.
// Progress uses the existing per-hero save's secrets; shared room albums remain
// intact and available outside the personal single-player route.
import {roomAlbumPlacements} from './room-album.js';
export const HERO_COLLECTIONS=Object.freeze({
 kilo:{room:'hub',title:'La melodía de las cien flores',color:'#ffe2ac',bonus:'CANCIÓN DEL HOGAR'},
 stitcho:{room:'hub',title:'Las cien chispas del caos',color:'#8cecff',bonus:'CORAZÓN GALÁCTICO'},
 chispin:{room:'hub',title:'Los cien rayos del trueno',color:'#fff2a3',bonus:'CORONA DE TORMENTA'},
 cat:{room:'cave',title:'Los cien sueños de Michi',color:'#e5c2ff',bonus:'LUNA SOÑADORA'},
 dragon:{room:'volcano',title:'Las cien brasas ancestrales',color:'#ffac83',bonus:'DRAGÓN CELESTIAL'},
 dino:{room:'boss',title:'Los cien fósiles de Dino',color:'#c5f5a2',bonus:'GUARDIÁN ANTIGUO'},
 frita:{room:'beach',title:'Las cien recetas del mar',color:'#fff3ac',bonus:'BANQUETE DORADO'},
 pizza:{room:'reef',title:'Las cien perlas del horno',color:'#ffcca2',bonus:'HORNO ESTELAR'},
 yomi:{room:'space',title:'Las cien estrellas perdidas',color:'#f5bedc',bonus:'CONSTELACIÓN ETERNA'},
 cuerno:{room:'ridge',title:'Los cien prismas del bosque',color:'#d5c8ff',bonus:'AURORA VIVA'}
});
// The 100th discovery is an authored relic, not another tiny random diamond.
// It appears at the entrance altar only after the other 99 memories are found.
export const HERO_FINAL_OBJECTS=Object.freeze({
 kilo:'Ukelele del Hogar',
 stitcho:'Corazón Galáctico',
 chispin:'Núcleo de Tormenta',
 cat:'Ovillo de Luna',dragon:'Brasa Primigenia',dino:'Fósil del Primer Gigante',
 frita:'Salero de Mareas',pizza:'Perla del Horno',yomi:'Estrella del Regreso',
 cuerno:'Prisma de Aurora'
});
const personalKey=hero=>'ohana-hero-100-v1:'+hero;
function readPersonal(g,hero){
 try{
  const storage=g.personalCollectionStorage||globalThis.localStorage;
  const raw=JSON.parse(storage?.getItem(personalKey(hero))||'{}');
  const ids=Array.isArray(raw.ids)?raw.ids.filter(id=>Number.isInteger(id)&&id>=0&&id<100):[];
  return {ids:new Set(ids),complete:raw.complete===true&&new Set(ids).size===100};
 }catch{return {ids:new Set(),complete:false};}
}
function writePersonal(g,s){
 try{
  const storage=g.personalCollectionStorage||globalThis.localStorage;
  storage?.setItem(personalKey(s.hero),JSON.stringify({
   v:1,ids:[...s.collected].sort((a,b)=>a-b),complete:!!s.complete
  }));
  return true;
 }catch{return false;}
}
const mark=(hero,id)=>'hero-100:'+hero+':'+id;
const prize=(hero)=>'hero-100:'+hero+':complete';
const center=p=>[p.x+p.w/2,p.y+p.h/2];
const inRange=(p,item)=>Math.abs(p.x+p.w/2-item.x)<27&&Math.abs(p.y+p.h/2-item.y)<33;
function save(g,key){g.secrets||={};g.secrets[g.roomId]||=[];const found=g.secrets[g.roomId];if(found.includes(key))return false;found.push(key);g.save?.();return true;}
export function enterHeroCollection(g){
 const p=g.player,def=HERO_COLLECTIONS[p?.id];
 if(!def||g.personalAdventureSolo===false||def.room!==g.roomId||!g.roomDef){g.heroCollection=null;return;}
 const store=new Set(g.secrets?.[g.roomId]||[]);
 const personal=readPersonal(g,p.id);
 // A previously earned Kilo hub relic remains earned, not a reset.
 if(p.id==='kilo'&&g.roomAlbums?.hub?.relic&&g.roomAlbums.hub.found.length===100){
  for(let i=0;i<100;i++)store.add(mark(p.id,i));
  store.add(prize(p.id));
 }
 const items=roomAlbumPlacements(g.roomDef);
 // The altar sits on the starting platform, near enough for E/mobile taps,
 // never on a generated ledge, an abyss or underneath a boss hitbox.
 const start=g.roomDef.checkpoints?.[0]||{x:180,y:1134};
 items[99]={...items[99],x:Math.max(110,start.x+115),y:start.y-61,
   challenge:true,final:true,name:HERO_FINAL_OBJECTS[p.id]};
 const collected=new Set(items.filter(i=>store.has(mark(p.id,i.id))||personal.ids.has(i.id)).map(i=>i.id));
 const complete=collected.size===100&&(store.has(prize(p.id))||personal.complete);
 g.heroCollection={hero:p.id,def,items,collected,complete,pulse:0,scene:0,display:0};
 // Keep the existing shared album placements and cinematic behavior for
 // compatibility; its renderer hides duplicate diamonds in personal chapters.
 if(complete)p._heroHundredBonus=def.bonus;
 if(collected.size)writePersonal(g,g.heroCollection);
}
export function takeHeroCollectionItem(g,id){
 const s=g.heroCollection,p=g.player;
 if(!s||!Number.isInteger(id)||id<0||id>=100||s.collected.has(id))return false;
 // The relic really is memory #100. An old pre-V455 save containing an
 // out-of-order #99 remains readable, but no new run can claim it early.
 if(id===99&&s.collected.size!==99)return false;
 s.collected.add(id);g.score=(g.score||0)+12;
 writePersonal(g,s);
 save(g,mark(s.hero,id));
 if(s.collected.size===100)completeHeroCollection(g);
 return true;
}
function completeHeroCollection(g){
 const s=g.heroCollection,p=g.player;
 if(!s||s.complete||s.collected.size!==100)return false;
 s.complete=true;s.scene=240;s.pulse=180;
 writePersonal(g,s);
 if(save(g,prize(s.hero))){
  g.score=(g.score||0)+1200;p.xp=(p.xp||0)+150;
  if(Number.isFinite(p.maxHealth))p.health=p.maxHealth;
  p.invuln=Math.max(0,p.invuln||0,120);
  g.shake=Math.max(0,g.shake||0,12);
  g.flash=Math.max(0,g.flash||0,24);
  g.nums?.add?.(p.x,p.y-55,'¡100/100 · '+s.def.bonus+'!',s.def.color,true);
  g.fx?.emit?.(p.x+p.w/2,p.y+p.h/2,{color:s.def.color,count:g.reduceMotion?12:55,size:5,star:true,life:65});
  g.save?.();
 }
 p._heroHundredBonus=s.def.bonus;
 return true;
}
export function updateHeroCollection(g){
 const s=g.heroCollection,p=g.player;if(!s||!p||p.dead)return;
 if(s.scene>0)s.scene--;if(s.pulse>0)s.pulse--;
 if(s.complete)return;
 let changed=0;
 for(const item of s.items){if(s.collected.has(item.id)||!inRange(p,item))continue;
  if(item.final&&s.collected.size!==99)continue;
  if(takeHeroCollectionItem(g,item.id))changed++;
 }
 if(changed&&s.collected.size<100)g.nums?.add?.(p.x,p.y-25,s.collected.size+'/100 · '+s.def.title,s.def.color,false);
 if(s.collected.size===99&&!s.collected.has(99)&&!s.altarShown){
  s.altarShown=true;
  g.nums?.add?.(p.x,p.y-70,'OBJETO Nº 100 · REGRESA AL ALTAR DE ENTRADA',s.def.color,true);
 }
}
export function drawHeroCollection(ctx,g,cam,t){
 const s=g.heroCollection;if(!s)return;
 ctx.save();const w=g.viewW||1600,h=g.viewH||1000;
 ctx.fillStyle=s.def.color;ctx.strokeStyle='#fff3e6';ctx.lineWidth=1.2;
 for(const i of s.items){
  if(s.collected.has(i.id))continue;
  const x=i.x-cam.x,y=i.y-cam.y;if(x<-70||y<-90||x>w+70||y>h+80)continue;
  const bob=g.reduceMotion?0:Math.sin(t*.09+i.id*.63)*3;
  if(i.final){
   const unlocked=s.collected.size===99;
   ctx.save();ctx.translate(x,y+bob);ctx.globalAlpha=unlocked?1:.36;
   // Each hero's final relic uses a different icon and color. A floating
   // altar with a heart/electric core is deliberately NOT a regular pickup.
   ctx.fillStyle='#0d3558';ctx.strokeStyle=s.def.color;ctx.lineWidth=3;
   ctx.beginPath();ctx.ellipse(0,33,38,10,0,0,Math.PI*2);ctx.fill();ctx.stroke();
   ctx.strokeStyle=unlocked?s.def.color:'#8195a7';
   ctx.beginPath();ctx.arc(0,0,21,0,Math.PI*2);ctx.stroke();
   ctx.fillStyle=s.def.color;ctx.beginPath();
   if(s.hero==='stitcho'){
    ctx.moveTo(0,17);ctx.bezierCurveTo(-38,-9,-15,-28,0,-12);
    ctx.bezierCurveTo(15,-28,38,-9,0,17);
   }else if(s.hero==='chispin'){
    ctx.moveTo(6,-26);ctx.lineTo(-13,3);ctx.lineTo(0,3);
    ctx.lineTo(-8,26);ctx.lineTo(19,-8);ctx.lineTo(5,-8);
   }else{
    for(let n=0;n<10;n++){const a=n*Math.PI/5-Math.PI/2,r=n%2?10:23;
     const xx=Math.cos(a)*r,yy=Math.sin(a)*r;
     if(n===0)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy);}
   }
   ctx.closePath();ctx.fill();ctx.textAlign='center';ctx.font='bold 12px sans-serif';
   ctx.fillStyle='#fff6dc';ctx.fillText(unlocked?'✦ '+i.name:'RECUERDO FINAL · 99/100',0,-36);
   ctx.restore();
   continue;
  }
  ctx.beginPath();ctx.moveTo(x,y-7+bob);ctx.lineTo(x+6,y+bob);ctx.lineTo(x,y+7+bob);ctx.lineTo(x-6,y+bob);ctx.closePath();ctx.fill();
  if(i.challenge)ctx.stroke();
 }
 // Per-character status: one modest line, never a modal on each pickup.
 ctx.fillStyle='rgba(9,21,35,.72)';ctx.fillRect(18,210,250,39);
 ctx.fillStyle=s.def.color;ctx.font='bold 12px sans-serif';ctx.textAlign='left';
 ctx.fillText(s.complete?s.def.bonus:s.collected.size===99?'ALTAR FINAL · '+HERO_FINAL_OBJECTS[s.hero]:s.def.title,26,225);
 ctx.font='11px sans-serif';ctx.fillText(s.collected.size+'/100 · '+(s.complete?'RELIQUIA CONSEGUIDA':'RECUERDOS PERSONALES'),26,240);
 if(s.complete){
  const p=g.player,x=p.x+p.w/2-cam.x,y=p.y+p.h/2-cam.y;
  ctx.strokeStyle=s.def.color;ctx.globalAlpha=.5;ctx.lineWidth=2;
  ctx.beginPath();ctx.ellipse(x,y,Math.max(22,p.w*.9),Math.max(34,p.h*.7),0,0,Math.PI*2);ctx.stroke();
  ctx.globalAlpha=1;
 }
 if(s.scene>0){
  const fade=Math.min(1,s.scene/40,(240-s.scene)/30);
  ctx.globalAlpha=Math.max(0,fade)*.92;ctx.fillStyle='#071d31';ctx.fillRect(w*.17,h*.12,w*.66,88);
  ctx.fillStyle=s.def.color;ctx.textAlign='center';
  ctx.font='bold 25px sans-serif';ctx.fillText('¡CIEN RECUERDOS COMPLETOS!',w*.5,h*.12+38);
  ctx.font='bold 17px sans-serif';ctx.fillText(HERO_FINAL_OBJECTS[s.hero]+' · '+s.def.bonus,w*.5,h*.12+64);ctx.globalAlpha=1;
 }
 ctx.restore();
}
export function heroCollectionSnapshot(g){
 const s=g.heroCollection;return s?{hero:s.hero,room:g.roomId,count:s.collected.size,total:100,complete:s.complete,reward:s.def.bonus,scene:s.scene}:null;
}

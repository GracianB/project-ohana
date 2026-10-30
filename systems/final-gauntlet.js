import {findRoster} from '../characters/roster.js';
// Ten earned rematches, ten physical keepsakes, then the final Quimera.
// No network/model calls. Position is sampled when a warning commits.
import {KEEPSAKES,KEEPSAKE_ORDER,readKeepsakes,mergeKeepsakes,persistKeepsakes,drawKeepsake} from './keepsakes.js';
import {WORLD1_ARENA,WORLD1_FLOOR} from './world1-rooms.js';
import {readCombatDifficulty} from './combat-difficulty.js';
import {guardianRhythm,guardianTechnique} from './guardian-techniques.js';
import {updateSoloFinalRitual} from './final-ritual.js';
const TAU=Math.PI*2,A=WORLD1_ARENA,F=WORLD1_FLOOR,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const tips={tide:'Salta las ondas. En el aire, esquiva la nota que apunta a tu posición.',crossfire:'La descarga apunta una vez: cambia de altura después del aviso.',lightning:'Las columnas marcan dónde caerá el rayo. Busca el hueco y usa tu rapidez.',moons:'Las lunas se abren en abanico. Pasa entre ellas y acércate al descansar.',charge:'Provoca la embestida y sal de su trayectoria. Castiga la frenada.',fire:'El suelo arde, pero las brasas también buscan el cielo. Cambia de altura.',quake:'Despega cuando caiga el coloso. Sus placas se abren después del aterrizaje.',geysers:'Lee las bocas del suelo. Salta hacia el espacio libre.',discs:'Las ruedas pasan a dos alturas. Salta la baja y deja pasar la alta.',prism:'La línea recuerda tu altura al avisar. Cambia de altura antes del destello.'};
export function gauntletReady(g){return (g.finalGauntlet?.found||mergeKeepsakes(g.keepsakes,readKeepsakes(g.keepsakeStorage))).length===10&&(!g.finalRitualEnabled||g.finalGauntlet?.phase==='complete');}
function makeGuardian(hero,g){
 const d=KEEPSAKES[hero],rhythm=guardianRhythm(readCombatDifficulty(g?.roomId)),hp=Math.round((hero==='dino'?940:hero==='cuerno'?740:820)*rhythm.health);
 return {x:9270,y:F-224,w:184,h:224,hp,max:hp,kind:'keeper',roomId:'w1-final',miniBoss:true,gauntletBoss:hero,evolved:true,
 color:d.color,vx:0,vy:0,invuln:0,stun:0,flash:0,contactDmg:0,damageTakenScale:0,_combatHealthScaled:true,
 _encounterSaveId:'keepsake-'+hero,[d.key]:{phase:'idle',clock:65,aim:-1,turn:0,attack:0,tick:0,target:null}};
}
function beginDuel(g,v){
 const hero=KEEPSAKE_ORDER.find(h=>!v.found.includes(h));if(!hero){v.phase='complete';if(!g.finalRitualEnabled)g.onGauntletHero?.('kilo');return;}
 v.hero=hero;v.phase='intro';v.guardian=makeGuardian(hero,g);v.object={x:9360,y:F-15};g.enemies=(g.enemies||[]).filter(e=>!e.gauntletBoss);g.enemies.push(v.guardian);g.projectiles=[];g.onGauntletHero?.(g.finalRitualEnabled?v.fighter:hero);const requested=g.playWorld1Cine?.('keepsakeIntro',hero);
 if(!requested&&!g.world1Cine)v.phase='fight';
}
export function updateFinalGauntlet(g){
 if(g.roomId!=='w1-final'||!g.player||g.player.dead||g.world1Won||g.onlineAdventure&&g.coopAuthority===false)return false;
 if(!KEEPSAKE_ORDER.every(h=>g.world1Seals?.includes(h)))return false;
 let v=g.finalGauntlet;if(!v)v=g.finalGauntlet={found:mergeKeepsakes(g.keepsakes,readKeepsakes(g.keepsakeStorage)),phase:'dormant',hero:null,guardian:null,object:null,tick:0};
 v.tick++;
 if(g.finalRitualEnabled){
  const ritual=updateSoloFinalRitual(g,v);
  if(ritual==='complete')return true;
  if(ritual==='duel')beginDuel(g,v);
 }else{
  if(v.found.length===10){if(v.phase!=='complete'){v.phase='complete';g.onGauntletHero?.('kilo');}return true;}
  if(v.phase==='dormant')beginDuel(g,v);
 }
 const p=g.player;if(v.phase==='fight'){
  p.x=clamp(p.x,A.left+550,A.right-550-p.w);
  if(v.guardian?.hp<=0){v.phase='released';g.projectiles=(g.projectiles||[]).filter(pr=>!pr.gauntlet);v.guardian.telegraph=false;g.onGauntletBeat?.('released',v.hero);}
 }
 const collectors=[p,...(g.onlineAdventure&&g.coopRemote&&!g.coopRemote.dead&&g.coopRemote.health>0?[{...g.coopRemote,w:findRoster(g.coopRemote.characterId)?.forms[g.coopRemote.evolution||0]?.w||60,h:findRoster(g.coopRemote.characterId)?.forms[g.coopRemote.evolution||0]?.h||80}]:[])];
 if(v.phase==='released'&&collectors.some(p=>Math.abs(p.x+p.w/2-v.object.x)<75&&Math.abs(p.y+p.h/2-(v.object.y-40))<115)){
  const fresh=!v.found.includes(v.hero);if(fresh){v.found.push(v.hero);g.keepsakes=[...v.found];g.keepsakeSavePending=!persistKeepsakes(v.found,g.keepsakeStorage);g.onGauntletAward?.(v.hero);}
  v.phase='rescue';const requested=g.playWorld1Cine?.('keepsakeRescue',v.hero);if(!requested&&!g.world1Cine)v.phase='dormant';const checkpoint=g.save?.();if(checkpoint||v.found.every(id=>readKeepsakes(g.keepsakeStorage).includes(id)))g.keepsakeSavePending=false;
 }
 return false;
}
export function gauntletCineEnded(g,id){const v=g.finalGauntlet;if(!v)return;if(id==='keepsakeIntro'&&v.phase==='intro')v.phase='fight';if(id==='keepsakeRescue'&&v.phase==='rescue')v.phase='dormant';}
export function resolveGuardianProjectileContact(pr,player,hurt){
 if(!pr.gauntlet)return false;
 if(player.invuln<=0)hurt(pr.dmg,'-'+Math.round(pr.dmg));
 if(!['prism','lightning','geysers','ember'].includes(pr.gauntlet))pr.life=0;
 return true;
}
function shoot(g,e,kind,x,y,vx,vy,w=18,h=w,life=130,dmg=19){if((g.projectiles?.length||0)>=150)return;g.projectiles.push({x,y,vx,vy,w,h,life,dmg,owner:'enemy',color:KEEPSAKES[e.gauntletBoss].color,gauntlet:kind,gauntletHero:e.gauntletBoss});}
function volley(e,g,b,fan=3,speed=6,spread=.22){
 const angle=Math.atan2(b.target.y-(e.y+e.h*.4),b.target.x-(e.x+e.w/2)),pace=b.rhythm?.shot||1;
 for(let i=0;i<fan;i++){const a=angle+(i-(fan-1)/2)*spread;shoot(g,e,'orb',e.x+e.w/2,e.y+e.h*.4,Math.cos(a)*speed*pace,Math.sin(a)*speed*pace);}
}
function waves(e,g,b,speed=7){for(const side of [-1,1])shoot(g,e,'wave',e.x+e.w/2,F-39,side*speed*(b.rhythm?.shot||1),0,47,27,170,23);}
function discs(e,g,b,high=true){for(const side of [-1,1]){shoot(g,e,'disc',e.x+e.w/2,F-43,side*(high?7:9)*(b.rhythm?.shot||1),0,44,32,160,22);if(high)shoot(g,e,'disc',e.x+e.w/2,F-155,side*5.5*(b.rhythm?.shot||1),0,40,30,160,22);}}
function fire(e,g,b){
 const d=KEEPSAKES[e.gauntletBoss],p=b.target,v=b.attack;
 switch(d.pattern){
 case 'tide':if(v!==1)waves(e,g,b,v===2?6.2:7);volley(e,g,b,v===1?3:1,v===1?7:6);break;
 case 'crossfire':volley(e,g,b,v===0?3:v===1?1:5,v===1?8:6.5,v===2?.32:.22);break;
 case 'lightning':case 'geysers':for(const xx of b.marks)shoot(g,e,d.pattern,xx-b.columnWidth/2,F-(d.pattern==='geysers'?300:500),0,0,b.columnWidth,d.pattern==='geysers'?260:470,32,24);if(v===1&&d.pattern==='lightning')volley(e,g,b,1,6);break;
 case 'moons':volley(e,g,b,v===1?1:5,v===1?8:5,v===2?.34:.22);break;
 case 'charge':if(v===2){waves(e,g,b,7);volley(e,g,b,3,5.8);}else e.vx=b.aim*b.chargeSpeed;break;
 case 'fire':volley(e,g,b,v===1?1:v===2?5:3,v===1?8:5.8);if(v!==1)shoot(g,e,'ember',p.x-65,F-36,0,0,100,22,100,19);break;
 case 'quake':if(v===1)waves(e,g,b,6);break;
 case 'discs':discs(e,g,b,v!==1);if(v===2)volley(e,g,b,1,6);break;
 case 'prism':for(const yy of b.beamYs)shoot(g,e,'prism',A.left+550,yy-15,0,0,A.right-A.left-1100,30,28,25);if(v===2)volley(e,g,b,3,5);break;
 }
}
function commitWarning(e,g,b,p,rhythm){
 const pattern=KEEPSAKES[e.gauntletBoss].pattern;
 b.phase='warn';b.clock=rhythm.warn;b.turn++;b.technique=guardianTechnique(pattern,b.turn);b.attack=b.technique.variant;b.rhythm=rhythm;
 b.aim=Math.sign(p.x+p.w/2-e.x-e.w/2)||-1;
 b.target={x:p.x+p.w/2+clamp((p.vx||0)*rhythm.lead,-80,80),y:p.y+p.h/2};
 const offsets=b.attack===1?[0]:b.attack===2?[-150,150]:[-190,0,200];
 b.marks=offsets.map(x=>clamp(x+b.target.x,A.left+610,A.right-610));b.columnWidth=b.attack===1?100:38;
 b.beamYs=b.attack===1?[b.target.y,b.target.y-135]:[b.attack===2?F-38:b.target.y];
 b.chargeSpeed=(b.attack===1?15:12)*rhythm.shot;
 b.chargePath=pattern==='charge'&&b.attack!==2?{from:e.x+e.w/2,to:clamp(e.x+b.aim*b.chargeSpeed*58,A.left+600,A.right-600-e.w)+e.w/2,y:F}:null;
 e._guardianDrowse=0;e._sleepUntil=0;e.damageTakenScale=0;e.telegraph=true;e.vx=0;
}
function guardianInView(e,g){return !g.cam||!Number.isFinite(g.viewW)||(e.x+e.w>g.cam.x+20&&e.x<g.cam.x+g.viewW-20);}
export function updateGauntletGuardian(e,g,hurt){
 if(!e.gauntletBoss)return false;if(e.hp<=0)return true;
 const d=KEEPSAKES[e.gauntletBoss],b=e[d.key],p=g.player;if(!p||p.dead||g.finalGauntlet?.phase!=='fight')return true;
 const rhythm=guardianRhythm(readCombatDifficulty(g.roomId));b.tick++;if(e.invuln>0)e.invuln--;e.stun=Math.min(4,e.stun||0);
 if(b.phase==='rest'){
  // Close a distant camping position, but keep the committed warning still.
  const asleep=e._guardianDrowse>0&&e.damageWindowRemaining>0;
  if(asleep){e._guardianDrowse--;e.vx=0;}
  const gap=p.x+p.w/2-e.x-e.w/2;if(!asleep)e.vx=Math.abs(gap)>470?Math.sign(gap)*rhythm.pace:0;
  e.x=clamp(e.x+e.vx,A.left+600,A.right-600-e.w);
  if((!asleep&&--b.clock<=0)||e.damageWindowRemaining<=0)commitWarning(e,g,b,p,rhythm);
 }else if(b.phase==='idle'){if(guardianInView(e,g)&&--b.clock<=0){b.phase='rest';b.clock=rhythm.firstRest;e.damageWindowRemaining=rhythm.window;e._guardianOpening=(e._guardianOpening||0)+1;}}
 else if(b.phase==='warn'){if(--b.clock<=0){b.phase='attack';b.clock=58;fire(e,g,b);}}
 else if(b.phase==='attack'){
  b.clock--;const age=58-b.clock;
  if(d.pattern==='charge'&&b.attack!==2){e.x=clamp(e.x+b.aim*b.chargeSpeed,A.left+600,A.right-600-e.w);if(Math.abs(p.x+p.w/2-e.x-e.w/2)<e.w*.65+p.w*.4&&Math.abs(p.y+p.h-e.y-e.h)<130)hurt(25,'Embestida de la aurora');}
  if(d.pattern==='quake'){e.y=F-e.h-Math.sin(Math.min(1,age/38)*Math.PI)*170;if(age===38)waves(e,g,b,b.attack===2?9:8);if(age===52&&b.attack===2)waves(e,g,b,5.5);}
  if(age===22&&b.attack===1&&['crossfire','moons','fire'].includes(d.pattern))volley(e,g,b,1,7);
  if(age===26&&b.attack===2&&d.pattern==='tide')waves(e,g,b,8);
  if(age===28&&b.attack===2&&['crossfire','moons'].includes(d.pattern))volley(e,g,b,3,6,.3);
  if(b.clock<=0){b.phase='rest';b.clock=rhythm.rest;e.vx=0;e.y=F-e.h;e.damageWindowRemaining=rhythm.window;e._guardianOpening=(e._guardianOpening||0)+1;e._guardianDrowse=0;e._sleepUntil=0;}
 }
 e.telegraph=b.phase==='warn';e.damageTakenScale=b.phase==='rest'&&e.damageWindowRemaining>0?1:0;
 return true;
}
export function gauntletSnapshot(g){const v=g.finalGauntlet;if(!v)return null;const e=v.guardian,b=e?e[KEEPSAKES[v.hero]?.key]:null;return {phase:v.phase,hero:v.hero,fighter:v.fighter||null,resonances:v.resonances?Object.fromEntries(Object.entries(v.resonances).map(([hero,items])=>[hero,[...items]])):null,summonTicks:v.summonTicks||0,found:[...v.found],object:v.object?{...v.object}:null,savePending:!!g.keepsakeSavePending,guardian:e?{x:e.x,y:e.y,w:e.w,h:e.h,hp:e.hp,max:e.max,phase:b?.phase,clock:b?.clock,target:b?.target?{...b.target}:null,marks:b?.marks?[...b.marks]:[],pattern:KEEPSAKES[v.hero].pattern,technique:b?.technique?{...b.technique}:null,beamYs:b?.beamYs?[...b.beamYs]:[],chargePath:b?.chargePath?{...b.chargePath}:null,columnWidth:b?.columnWidth,windowRemaining:e.damageWindowRemaining}:null};}
// World geometry follows the exact camera transform used by bodies and shots.
export function drawGauntletWorld(c,g,cam,t=0){
 const v=g.finalGauntlet;if(!v||v.phase==='complete'||g.world1Cine||g._pendingWorld1Cine)return;const d=KEEPSAKES[v.hero];if(!d)return;
 if(v.object){const x=v.object.x-cam.x,y=v.object.y-cam.y;c.save();
 c.fillStyle='#1c3044';c.fillRect(x-46,y-6,92,16);c.strokeStyle=d.color;c.lineWidth=2;c.strokeRect(x-46,y-6,92,16);drawKeepsake(c,v.hero,x,y-8,65,{ghost:v.phase!=='released'});
 if(v.phase!=='released'){c.strokeStyle=d.color+'99';c.lineWidth=1.5;c.beginPath();c.ellipse(x,y-48,50,65,0,Math.PI,TAU);c.stroke();}}
 const b=v.guardian?.[d.key];if(b?.phase==='warn'){
  c.strokeStyle=d.color;c.fillStyle=d.color+'33';c.lineWidth=2;
  if(b.marks&&['lightning','geysers'].includes(d.pattern)){const width=b.columnWidth||34,height=d.pattern==='lightning'?500:300,reach=d.pattern==='lightning'?470:260;for(const xx of b.marks)c.fillRect(xx-cam.x-width/2,F-cam.y-height,width,reach);}
  else if(d.pattern==='prism'&&(b.beamYs?.length||b.target)){for(const yy of b.beamYs?.length?b.beamYs:[b.target.y])c.fillRect(A.left+550-cam.x,yy-cam.y-15,A.right-A.left-1100,30);}
  else if(d.pattern==='charge'&&b.chargePath){
   const path=b.chargePath,pad=v.guardian.w*.65,left=Math.min(path.from,path.to)-pad-cam.x,width=Math.abs(path.to-path.from)+pad*2,foot=path.y-cam.y;
   c.fillRect(left,foot-130,width,130);c.fillStyle=d.color;c.fillRect(left,foot-5,width,5);
   const tip=path.to-cam.x,dir=Math.sign(path.to-path.from)||1;c.beginPath();c.moveTo(tip,foot-12);c.lineTo(tip-dir*20,foot-25);c.lineTo(tip-dir*20,foot-8);c.closePath();c.fill();
  }else{c.beginPath();c.ellipse(v.guardian.x+v.guardian.w/2-cam.x,F-cam.y-4,100,13,0,0,TAU);c.stroke();}
 }
 c.restore();
}
export function gauntletPresentation(g){
 const v=g?.finalGauntlet;if(!v||v.phase==='complete'||g.world1Cine||g._pendingWorld1Cine)return null;
 const d=KEEPSAKES[v.hero],e=v.guardian;if(!d||!e)return null;const b=e[d.key]||{},released=v.phase==='released',open=v.phase==='fight'&&b.phase==='rest'&&(e.damageWindowRemaining??1)>0;
 const phase=released?'released':open?'opening':b.phase==='warn'?'warning':b.phase==='attack'?'attack':'ready';
 const status=released?'RELICARIO ABIERTO':open?'APERTURA · ATACA AHORA':phase==='warning'?'AVISO · ESQUIVA':phase==='attack'?'EVITA EL ATAQUE':'OBSERVA AL GUARDIÁN';
 const approach=b.phase==='idle'&&!guardianInView(e,g);
 const objectDirection=v.object&&g.player?Math.sign(v.object.x-g.player.x-g.player.w/2):0,objectDistance=v.object&&g.player?Math.abs(v.object.x-g.player.x-g.player.w/2):0;
 const cue=approach?'Acércate al guardián, a tu '+(e.x>g.player?.x?'derecha':'izquierda')+'. El combate empieza cuando entra en pantalla.':released?(objectDistance<75?'Toca el relicario para recuperar '+d.name:'El relicario está a tu '+(objectDirection>0?'derecha':'izquierda')+'. Acércate y recoge '+d.name):open?'Su defensa está abierta. Acércate y ataca antes de que se recupere.':b.technique?.cue||tips[d.pattern];
 return {guardian:d.guardian,object:d.name,color:d.color,phase,status,cue,move:b.technique?.name||'',found:v.found.length,hp:Math.max(0,e.hp),max:Math.max(1,e.max),open};
}
function hudLines(c,text,width){const lines=[];let line='';for(const word of String(text).split(/\s+/)){const next=line?line+' '+word:word;if(line&&c.measureText(next).width>width){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);return lines;}
// Real line wrapping keeps instructions readable on phones; never squeeze a
// complete sentence into a 180px fillText maxWidth.
export function gauntletHudLayout(c,p,W,H){
 const short=H<500&&W>=700,compact=W<1000&&!short,margin=short?Math.max(230,W*.28):compact?12:W*.24;
 const width=W-margin*2,top=short?12:compact?190:92,inner=width-28,titleSize=short?13:16,bodySize=short?11:12;
 c.font=`700 ${titleSize}px Outfit,sans-serif`;const title=hudLines(c,p.guardian.toUpperCase(),inner);
 c.font='700 11px Outfit,sans-serif';const move=p.move&&['warning','attack'].includes(p.phase)?hudLines(c,p.move,inner):[];
 c.font=`${bodySize}px Outfit,sans-serif`;const cue=hudLines(c,p.cue,inner);
 const titleHeight=title.length*(titleSize+3),moveHeight=move.length*15,cueHeight=cue.length*(bodySize+4),height=16+titleHeight+8+moveHeight+cueHeight+10+7+23;
 return {x:margin,y:top,w:width,h:height,title,move,cue,titleSize,bodySize,titleY:top+14,titleHeight,moveY:top+14+titleHeight+5,cueY:top+14+titleHeight+8+moveHeight,cueHeight,barY:top+height-36,statusY:top+height-18};
}
export function drawGauntletHud(c,g,W,H){
 const p=gauntletPresentation(g);if(!p)return;c.save();const L=gauntletHudLayout(c,p,W,H);
 c.textAlign='left';c.textBaseline='top';c.fillStyle='#102234ed';c.beginPath();c.roundRect(L.x,L.y,L.w,L.h,14);c.fill();c.fillStyle=p.color;c.font=`700 ${L.titleSize}px Outfit,sans-serif`;L.title.forEach((line,i)=>c.fillText(line,L.x+14,L.titleY+i*(L.titleSize+3)));
 c.fillStyle='#edce9c';c.font='700 11px Outfit,sans-serif';L.move.forEach((line,i)=>c.fillText(line,L.x+14,L.moveY+i*15));
 c.fillStyle='#eee7d5';c.font=`${L.bodySize}px Outfit,sans-serif`;L.cue.forEach((line,i)=>c.fillText(line,L.x+14,L.cueY+i*(L.bodySize+4)));
 c.fillStyle='#203b4d';c.fillRect(L.x+14,L.barY,L.w-28,7);c.fillStyle=p.color;c.fillRect(L.x+14,L.barY,(L.w-28)*Math.min(1,p.hp/p.max),7);
 c.fillStyle='#e9d9b9';c.font='700 10px Outfit,sans-serif';c.fillText(p.found+'/10 · '+p.status,L.x+14,L.statusY);c.restore();
}
export function gauntletAccessibleText(g){
 const p=gauntletPresentation(g);if(!p)return '';const health=Math.ceil(p.hp/p.max*4)*25;
 return `${p.guardian}. ${p.found} de 10 recuerdos a salvo. ${p.status}. ${p.move&&['warning','attack'].includes(p.phase)?p.move+'. ':''}${p.cue}${p.phase==='released'?'':` Vida del guardián: ${health} por ciento.`}`;
}
// Kept for art fixtures and integrations that draw without a separate camera.
export function drawFinalGauntlet(c,g,cam,W,H,t=0){drawGauntletWorld(c,g,cam,t);drawGauntletHud(c,g,W,H);}
export function drawGauntletProjectile(c,pr,cam,t=0,reduced=false){
 if(!pr.gauntlet)return false;const x=pr.x-cam.x,y=pr.y-cam.y,clock=reduced?0:t;
 c.save();c.fillStyle=pr.color;c.strokeStyle='#fff0c7';c.lineWidth=2;c.lineJoin='round';c.lineCap='round';
 if(['prism','lightning','geysers'].includes(pr.gauntlet)){
  // The faint enclosure still marks the complete authoritative danger band.
  // Material, branching and volume replace a solid yellow rectangle.
  c.fillStyle='#102b3ce0';c.fillRect(x,y,pr.w,pr.h);
  const gradient=c.createLinearGradient(x,y,x+(pr.gauntlet==='prism'?0:pr.w),y+(pr.gauntlet==='prism'?pr.h:0));
  gradient.addColorStop(0,pr.color+'44');gradient.addColorStop(.46,pr.color+'bb');gradient.addColorStop(.55,'#fff6d6dd');gradient.addColorStop(1,pr.color+'44');c.fillStyle=gradient;c.fillRect(x,y,pr.w,pr.h);
  c.beginPath();c.rect(x,y,pr.w,pr.h);c.clip();
  if(pr.gauntlet==='lightning'){
   for(let branch=0;branch<3;branch++){
    c.strokeStyle=branch===1?'#fff8df':pr.color;c.lineWidth=branch===1?3.2:1.8;c.beginPath();
    for(let k=0;k<=12;k++){const xx=x+pr.w*(.2+branch*.28)+Math.sin(k*2.3+clock*.16+branch)*pr.w*.13,yy=y+k*pr.h/12;k?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.stroke();
   }
  }else if(pr.gauntlet==='prism'){
   for(let k=0;k<Math.min(40,Math.ceil(pr.w/85));k++){
    const xx=x+28+k*85,half=pr.h*.43;c.beginPath();c.moveTo(xx,y+2);c.lineTo(xx+24,y+pr.h/2);c.lineTo(xx,y+pr.h-2);c.lineTo(xx-24,y+pr.h/2);c.closePath();c.fillStyle=k%2?pr.color+'aa':'#f0ffe88c';c.fill();
    c.strokeStyle='#fff8e0';c.lineWidth=1;c.beginPath();c.moveTo(xx-half,y+pr.h/2);c.lineTo(xx+half,y+pr.h/2);c.stroke();
   }
  }else{
   for(let k=0;k<6;k++){
    const u=reduced?(k+.5)/6:(clock*.015+k/6)%1,yy=y+pr.h*(1-u),radius=pr.w*(.21+u*.12);
    c.beginPath();c.ellipse(x+pr.w*(.5+Math.sin(u*8+k)*.12),yy,radius,pr.h*.09,Math.sin(u*5)*.3,0,TAU);c.fillStyle=k%2?'#fff1c8aa':pr.color+'bb';c.fill();c.strokeStyle='#fff7dd99';c.lineWidth=1.2;c.stroke();
   }
  }
 }else if(pr.gauntlet==='orb'&&pr.gauntletHero){drawGuardianNote(c,pr,x,y,clock);}
 else if(pr.gauntlet==='wave'){
  c.translate(x+pr.w/2,y+pr.h/2);c.scale((pr.vx<0?-1:1)*pr.w/2,pr.h/2);c.lineWidth=.1;
  c.beginPath();c.moveTo(-.95,.8);c.bezierCurveTo(-.4,.56,-.5,-.8,.12,-.88);c.bezierCurveTo(.86,-1,.95,-.22,.45,.02);c.quadraticCurveTo(.59,-.54,.19,-.52);c.bezierCurveTo(-.1,-.5,.07,.58,.97,.77);c.closePath();c.fillStyle=pr.color;c.fill();c.strokeStyle='#fff5d4';c.stroke();
  c.beginPath();c.moveTo(-.73,.65);c.bezierCurveTo(-.2,.37,-.2,-.62,.28,-.65);c.strokeStyle='#fff9e5';c.lineWidth=.13;c.stroke();
 }else{
  c.translate(x+pr.w/2,y+pr.h/2);c.scale(pr.w/2,pr.h/2);c.beginPath();c.ellipse(0,0,.96,.96,0,0,TAU);c.fillStyle=pr.gauntlet==='disc'?'#c88c53':pr.color;c.fill();c.strokeStyle='#fff0c7';c.lineWidth=.1;c.stroke();
  if(pr.gauntlet==='disc'){
   c.beginPath();c.ellipse(0,0,.77,.77,0,0,TAU);c.fillStyle='#f4d187';c.fill();c.save();c.rotate(clock*.14);
   for(let k=0;k<4;k++){c.beginPath();c.ellipse(Math.cos(k*TAU/4)*.43,Math.sin(k*TAU/4)*.43,.16,.16,0,0,TAU);c.fillStyle='#b85c58';c.fill();c.beginPath();c.ellipse(Math.cos(k*TAU/4+.6)*.57,Math.sin(k*TAU/4+.6)*.57,.09,.13,.4,0,TAU);c.fillStyle='#779864';c.fill();}c.restore();
  }
 }
 c.restore();return true;
}

// Compact, readable shot anatomy stays within its physical projectile box.
function drawGuardianNote(c,pr,x,y,t){
 c.translate(x+pr.w/2,y+pr.h/2);c.scale(pr.w/2,pr.h/2);c.lineWidth=.16;c.lineJoin='round';c.lineCap='round';
 const hero=pr.gauntletHero;c.fillStyle=pr.color;c.strokeStyle='#fff0d0';
 if(hero==='kilo'){
  c.beginPath();c.ellipse(-.25,.45,.43,.29,-.25,0,TAU);c.fill();c.stroke();c.beginPath();c.moveTo(.1,.44);c.lineTo(.1,-.8);c.quadraticCurveTo(.8,-.65,.6,-.16);c.stroke();
 }else if(hero==='cat'){
  c.rotate(Math.sin(t*.05)*.2);c.beginPath();c.moveTo(.62,-.65);c.bezierCurveTo(-.95,-1.1,-1.1,1,.65,.72);c.bezierCurveTo(-.1,.55,-.15,-.42,.62,-.65);c.fill();c.stroke();
 }else if(hero==='dragon'){
  c.rotate(Math.atan2(pr.vy,pr.vx)+Math.PI/2);c.beginPath();c.moveTo(0,-.98);c.bezierCurveTo(.13,-.2,.9,-.1,.65,.6);c.bezierCurveTo(.35,1,-.65,1,-.67,.4);c.quadraticCurveTo(-.4,.05,0,-.98);c.fill();c.stroke();c.fillStyle='#fff0cb';c.beginPath();c.ellipse(0,.45,.22,.37,0,0,TAU);c.fill();
 }else if(hero==='stitcho'){
  c.rotate(t*.045);c.beginPath();for(let i=0;i<6;i++){const a=i*TAU/6,r=i%2?.7:.93;i?c.lineTo(Math.cos(a)*r,Math.sin(a)*r):c.moveTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();c.fill();c.stroke();c.strokeStyle='#6c75c9';c.lineWidth=.24;c.beginPath();c.moveTo(-.48,-.2);c.lineTo(.15,-.2);c.lineTo(-.1,.45);c.lineTo(.55,.12);c.stroke();
 }else if(hero==='cuerno'){
  c.rotate(t*.035);const colors=['#edaccb','#a8d9b8','#f8df9c','#bac9ed'];for(let i=0;i<4;i++){c.fillStyle=colors[i];c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(i*TAU/4)*.94,Math.sin(i*TAU/4)*.94);c.lineTo(Math.cos((i+1)*TAU/4)*.94,Math.sin((i+1)*TAU/4)*.94);c.closePath();c.fill();}c.beginPath();c.moveTo(0,-.94);c.lineTo(.94,0);c.lineTo(0,.94);c.lineTo(-.94,0);c.closePath();c.stroke();
 }else if(hero==='yomi'){
  c.rotate(Math.sin(t*.06)*.12);c.beginPath();c.moveTo(-.85,-.65);c.quadraticCurveTo(-.25,-.95,0,-.55);c.quadraticCurveTo(.3,-.95,.85,-.65);c.lineTo(.85,.7);c.quadraticCurveTo(.25,.4,0,.8);c.quadraticCurveTo(-.3,.4,-.85,.7);c.closePath();c.fill();c.stroke();c.strokeStyle='#fff6d3';c.beginPath();c.moveTo(0,-.55);c.lineTo(0,.75);c.moveTo(-.65,-.25);c.lineTo(-.2,-.2);c.moveTo(.2,-.2);c.lineTo(.65,-.25);c.moveTo(-.65,.2);c.lineTo(-.2,.25);c.moveTo(.2,.25);c.lineTo(.65,.2);c.stroke();
 }else{
  c.beginPath();c.moveTo(.15,-.95);c.lineTo(-.6,.12);c.lineTo(-.02,.08);c.lineTo(-.25,.95);c.lineTo(.68,-.22);c.lineTo(.13,-.17);c.closePath();c.fill();c.stroke();
 }
}

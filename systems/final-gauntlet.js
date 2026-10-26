// Ten earned rematches, ten physical keepsakes, then the final Quimera.
// No network/model calls. Position is sampled when a warning commits.
import {KEEPSAKES,KEEPSAKE_ORDER,readKeepsakes,rememberKeepsake,drawKeepsake} from './keepsakes.js';
import {WORLD1_ARENA,WORLD1_FLOOR} from './world1-rooms.js';
import {readCombatDifficulty} from './combat-difficulty.js';
const TAU=Math.PI*2,A=WORLD1_ARENA,F=WORLD1_FLOOR,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const tips={tide:'Salta las ondas. En el aire, esquiva la nota que apunta a tu posición.',crossfire:'La descarga apunta una vez: cambia de altura después del aviso.',lightning:'Las columnas marcan dónde caerá el rayo. Busca el hueco y usa tu rapidez.',moons:'Las lunas se abren en abanico. Pasa entre ellas y acércate al descansar.',charge:'Provoca la embestida y sal de su trayectoria. Castiga la frenada.',fire:'El suelo arde, pero las brasas también buscan el cielo. Cambia de altura.',quake:'Despega cuando caiga el coloso. Sus placas se abren después del aterrizaje.',geysers:'Lee las bocas del suelo. Salta hacia el espacio libre.',discs:'Las ruedas pasan a dos alturas. Salta la baja y deja pasar la alta.',prism:'La línea recuerda tu altura al avisar. Cambia de altura antes del destello.'};
export function gauntletReady(g){return (g.finalGauntlet?.found||readKeepsakes(g.keepsakeStorage)).length===10;}
function makeGuardian(hero){
 const d=KEEPSAKES[hero],hp=hero==='dino'?940:hero==='cuerno'?740:820;
 return {x:9270,y:F-224,w:184,h:224,hp,max:hp,kind:'keeper',roomId:'w1-final',miniBoss:true,gauntletBoss:hero,evolved:true,
 color:d.color,vx:0,vy:0,invuln:0,stun:0,flash:0,contactDmg:0,damageTakenScale:0,_combatHealthScaled:true,
 _encounterSaveId:'keepsake-'+hero,[d.key]:{phase:'idle',clock:65,aim:-1,turn:0,attack:0,tick:0,target:null}};
}
function beginDuel(g,v){
 const hero=KEEPSAKE_ORDER.find(h=>!v.found.includes(h));if(!hero){v.phase='complete';g.onGauntletHero?.('kilo');return;}
 v.hero=hero;v.phase='intro';v.guardian=makeGuardian(hero);v.object={x:9360,y:F-15};g.enemies=(g.enemies||[]).filter(e=>!e.gauntletBoss);g.enemies.push(v.guardian);g.projectiles=[];g.onGauntletHero?.(hero);const requested=g.playWorld1Cine?.('keepsakeIntro',hero);
 if(!requested&&!g.world1Cine)v.phase='fight';
}
export function updateFinalGauntlet(g){
 if(g.roomId!=='w1-final'||!g.player||g.player.dead||g.world1Won)return false;
 if(!KEEPSAKE_ORDER.every(h=>g.world1Seals?.includes(h)))return false;
 let v=g.finalGauntlet;if(!v)v=g.finalGauntlet={found:readKeepsakes(g.keepsakeStorage),phase:'dormant',hero:null,guardian:null,object:null,tick:0};
 if(v.found.length===10){if(v.phase!=='complete'){v.phase='complete';g.onGauntletHero?.('kilo');}return true;}
 v.tick++;if(v.phase==='dormant')beginDuel(g,v);
 const p=g.player;if(v.phase==='fight'){
  p.x=clamp(p.x,A.left+550,A.right-550-p.w);
  if(v.guardian?.hp<=0){v.phase='released';g.projectiles=(g.projectiles||[]).filter(pr=>!pr.gauntlet);v.guardian.telegraph=false;g.onGauntletBeat?.('released',v.hero);}
 }
 if(v.phase==='released'&&Math.abs(p.x+p.w/2-v.object.x)<75&&Math.abs(p.y+p.h/2-(v.object.y-40))<115){
  const fresh=!v.found.includes(v.hero);if(fresh){v.found.push(v.hero);rememberKeepsake(v.hero,g.keepsakeStorage);g.onGauntletAward?.(v.hero);}
  v.phase='rescue';const requested=g.playWorld1Cine?.('keepsakeRescue',v.hero);if(!requested&&!g.world1Cine)v.phase='dormant';g.save?.();
 }
 return false;
}
export function gauntletCineEnded(g,id){const v=g.finalGauntlet;if(!v)return;if(id==='keepsakeIntro'&&v.phase==='intro')v.phase='fight';if(id==='keepsakeRescue'&&v.phase==='rescue')v.phase='dormant';}
function shoot(g,e,kind,x,y,vx,vy,w=18,h=w,life=130,dmg=19){if((g.projectiles?.length||0)>=150)return;g.projectiles.push({x,y,vx,vy,w,h,life,dmg,owner:'enemy',color:KEEPSAKES[e.gauntletBoss].color,gauntlet:kind});}
function volley(e,g,b,fan=3,speed=6){const angle=Math.atan2(b.target.y-(e.y+e.h*.4),b.target.x-(e.x+e.w/2));for(let i=0;i<fan;i++){const a=angle+(i-(fan-1)/2)*.22;shoot(g,e,'orb',e.x+e.w/2,e.y+e.h*.4,Math.cos(a)*speed,Math.sin(a)*speed);}}
function fire(e,g,b){
 const d=KEEPSAKES[e.gauntletBoss],x=e.x+e.w/2,p=b.target;
 switch(d.pattern){
 case 'tide':for(const side of [-1,1])shoot(g,e,'wave',x,F-39,side*7,0,47,27,150,23);volley(e,g,b,1);break;
 case 'crossfire':volley(e,g,b,b.turn%2?3:5,6.5);break;
 case 'lightning':case 'geysers':for(const xx of b.marks)shoot(g,e,d.pattern,xx-17,F-(d.pattern==='geysers'?300:500),0,0,34,d.pattern==='geysers'?260:470,25,24);break;
 case 'moons':volley(e,g,b,5,5);break;
 case 'charge':e.vx=b.aim*12;break;
 case 'fire':volley(e,g,b,3,5.8);shoot(g,e,'ember',p.x-65,F-36,0,0,100,22,90,19);break;
 case 'quake':break;
 case 'discs':for(const side of [-1,1]){shoot(g,e,'disc',x,F-43,side*7,0,44,32,150,22);shoot(g,e,'disc',x,F-155,side*5.5,0,40,30,150,22);}break;
 case 'prism':shoot(g,e,'prism',A.left+550,p.y-15,0,0,A.right-A.left-1100,30,22,25);break;
 }
}
export function updateGauntletGuardian(e,g,hurt){
 if(!e.gauntletBoss)return false;if(e.hp<=0)return true;
 const d=KEEPSAKES[e.gauntletBoss],b=e[d.key],p=g.player;if(!p||p.dead||g.finalGauntlet?.phase!=='fight')return true;
 const difficulty=readCombatDifficulty(g.roomId);b.tick++;if(e.invuln>0)e.invuln--;e.stun=Math.min(4,e.stun||0);e.telegraph=b.phase==='warn';e.damageTakenScale=b.phase==='rest'?1:0;
 if(b.phase==='rest'){
  e.vx*=.75;if(--b.clock<=0){b.phase='warn';b.clock=difficulty.budget>=4?43:58;b.turn++;b.attack=(b.turn-1)%3;b.aim=Math.sign(p.x-e.x)||-1;b.target={x:p.x+p.w/2+clamp((p.vx||0)*8,-70,70),y:p.y+p.h/2};
   b.marks=[b.target.x-190,b.target.x,b.target.x+200].map(x=>clamp(x,A.left+580,A.right-580));}
 }else if(b.phase==='idle'){if(--b.clock<=0){b.phase='rest';b.clock=100;e.damageWindowRemaining=190;}}
 else if(b.phase==='warn'){if(--b.clock<=0){b.phase='attack';b.clock=58;fire(e,g,b);}}
 else if(b.phase==='attack'){
  b.clock--;const age=58-b.clock;
  if(d.pattern==='charge'){e.x=clamp(e.x+e.vx,A.left+600,A.right-600-e.w);if(Math.abs(p.x+p.w/2-e.x-e.w/2)<e.w*.65+p.w*.4&&Math.abs(p.y+p.h-e.y-e.h)<130)hurt(25,'Embestida de la aurora');}
  if(d.pattern==='quake'){e.y=F-e.h-Math.sin(Math.min(1,age/38)*Math.PI)*170;if(age===38){for(const side of [-1,1])shoot(g,e,'wave',e.x+e.w/2,F-41,side*8,0,52,28,150,25);}}
  if(age===24&&['tide','crossfire','moons','fire'].includes(d.pattern)&&e.hp<e.max*.55)volley(e,g,b,d.pattern==='moons'?3:1,5.5);
  if(b.clock<=0){b.phase='rest';b.clock=difficulty.budget>=4?92:125;e.vx=0;e.y=F-e.h;e.damageWindowRemaining=205;}
 }
 return true;
}
export function gauntletSnapshot(g){const v=g.finalGauntlet;if(!v)return null;const e=v.guardian,b=e?e[KEEPSAKES[v.hero]?.key]:null;return {phase:v.phase,hero:v.hero,found:[...v.found],object:v.object?{...v.object}:null,guardian:e?{x:e.x,y:e.y,w:e.w,h:e.h,hp:e.hp,max:e.max,phase:b?.phase,clock:b?.clock,target:b?.target?{...b.target}:null,marks:b?.marks?[...b.marks]:[],pattern:KEEPSAKES[v.hero].pattern}:null};}
export function drawFinalGauntlet(c,g,cam,W,H,t=0){
 const v=g.finalGauntlet;if(!v||v.phase==='complete'||g.world1Cine)return;const d=KEEPSAKES[v.hero];if(!d)return;
 const x=v.object.x-cam.x,y=v.object.y-cam.y;c.save();
 // A real object sits in a little reliquary until the guardian releases it.
 c.fillStyle='#1c3044';c.fillRect(x-46,y-6,92,16);c.strokeStyle=d.color;c.lineWidth=2;c.strokeRect(x-46,y-6,92,16);drawKeepsake(c,v.hero,x,y-8,65,{ghost:v.phase!=='released'});
 if(v.phase!=='released'){c.strokeStyle=d.color+'99';c.lineWidth=1.5;c.beginPath();c.ellipse(x,y-48,50,65,0,Math.PI,TAU);c.stroke();}
 const b=v.guardian?.[d.key];if(b?.phase==='warn'){
  c.strokeStyle=d.color;c.fillStyle=d.color+'33';c.lineWidth=2;
  if(b.marks&&['lightning','geysers'].includes(d.pattern))for(const xx of b.marks){c.fillRect(xx-cam.x-22,F-cam.y-480,44,480);}
  else if(d.pattern==='prism'){c.fillRect(A.left+550-cam.x,b.target.y-cam.y-6,A.right-A.left-1100,12);}
  else{c.beginPath();c.ellipse(v.guardian.x+v.guardian.w/2-cam.x,F-cam.y-4,d.pattern==='charge'?210:100,13,0,0,TAU);c.stroke();}
 }
 c.textAlign='center';c.fillStyle='#102234ed';c.beginPath();c.roundRect(W*.24,92,W*.52,70,14);c.fill();c.fillStyle=d.color;c.font='700 16px Outfit,sans-serif';c.fillText(d.guardian.toUpperCase(),W/2,116,W*.48);c.fillStyle='#eee7d5';c.font='12px Outfit,sans-serif';c.fillText(v.phase==='released'?'Recoge '+d.name+' · acércate al relicario':tips[d.pattern],W/2,139,W*.48);
 if(v.guardian?.hp>0){c.fillStyle='#203b4d';c.fillRect(W*.3,165,W*.4,7);c.fillStyle=d.color;c.fillRect(W*.3,165,W*.4*v.guardian.hp/v.guardian.max,7);}
 c.fillStyle='#e9d9b9';c.font='11px Outfit,sans-serif';c.fillText(`${v.found.length}/10 recuerdos personales a salvo · ${b?.phase==='rest'?'APERTURA: ATACA AHORA':v.phase==='released'?'RELICARIO ABIERTO':'LEE EL AVISO'}`,W/2,190);c.restore();
}
export function drawGauntletProjectile(c,pr,cam,t=0){if(!pr.gauntlet)return false;const x=pr.x-cam.x,y=pr.y-cam.y;c.save();c.fillStyle=pr.color;c.strokeStyle='#fff0c7';c.lineWidth=2;
 if(['prism','lightning','geysers'].includes(pr.gauntlet)){c.globalAlpha=.7;c.fillRect(x,y,pr.w,pr.h);c.fillStyle='#fff3cd';c.fillRect(x+pr.w*.4,y,Math.max(2,pr.w*.18),pr.h);}
 else{c.translate(x+pr.w/2,y+pr.h/2);if(pr.gauntlet==='disc')c.rotate(t*.14);c.beginPath();c.ellipse(0,0,pr.w/2,pr.h/2,0,0,TAU);c.fill();c.stroke();if(pr.gauntlet==='disc'){c.fillStyle='#a85f66';for(let k=0;k<3;k++){c.beginPath();c.arc(Math.cos(k*TAU/3)*10,Math.sin(k*TAU/3)*7,4,0,TAU);c.fill();}}}
 c.restore();return true;}

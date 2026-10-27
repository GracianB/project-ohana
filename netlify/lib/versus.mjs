// Server-owned arena simulation. Clients submit controls, never hits, XP or winners.
import{findRoster}from'../../characters/roster.js';
import{WORLD1_THEMES,WORLD1_ARENA,WORLD1_FLOOR}from'../../systems/world1-rooms.js';
import{createDuel,awardDuelEvent,validDuelArena}from'../../multiplayer/match-rules-v604.js';
import{KEEPSAKES}from'../../systems/keepsakes.js';
import{updateGauntletGuardian}from'../../systems/final-gauntlet.js';
import{damageEnemy}from'../../systems/mutations.js';
const LEFT=WORLD1_ARENA.left+550,RIGHT=WORLD1_ARENA.right-550,FLOOR=WORLD1_FLOOR,STEP=1000/60;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),center=e=>({x:e.x+e.w/2,y:e.y+e.h/2}),alive=e=>e.hp>0;
const hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const distance=(a,b)=>Math.hypot(center(a).x-center(b).x,center(a).y-center(b).y);
function event(v,type,text,extra={}){v.events.push({id:++v.serial,type,text,tick:v.tick,...extra});v.events=v.events.slice(-36);}
function form(a){return findRoster(a.characterId).forms[a.evo];}
function resize(a,heal=false){const f=form(a),feet=a.y+a.h,old=a.maxHp||f.hp;a.w=f.w;a.h=f.h;a.y=feet-a.h;a.maxHp=f.hp;a.hp=heal?f.hp:Math.min(f.hp,a.hp+Math.max(0,f.hp-old));}
function foe(v,i){const hero=v.arenaId.slice(3),kind=WORLD1_THEMES[hero].cast[i],role=['pursuer','shooter','shield','flyer','jumper'][i];return{id:'foe-'+i,kind,campaignRole:role,roomId:v.arenaId,x:8100+i*560,y:FLOOR-(role==='flyer'?210:58),w:46,h:58,hp:90,max:90,vx:0,vy:0,phase:'rest',clock:90+i*20,turn:0,respawnAt:0,invuln:0};}
function boss(v){const hero=v.arenaId.slice(3),d=KEEPSAKES[hero];return{id:'guardian',kind:'keeper',roomId:v.arenaId,gauntletBoss:hero,miniBoss:true,evolved:false,x:9270,y:FLOOR-194,w:170,h:194,hp:540,max:540,vx:0,vy:0,contactDmg:0,damageTakenScale:0,_combatHealthScaled:true,respawnAt:0,[d.key]:{phase:'idle',clock:90,aim:-1,turn:0,attack:0,tick:0,target:null}};}
export function createVersus(room,arenaId,now){
 if(!validDuelArena(arenaId))throw Error('DUEL_ARENA_INVALID');
 const v={...createDuel(arenaId,room.players.map(p=>p.id)),tick:0,lastAt:now,carry:0,serial:0,shotSerial:0,events:[],receipts:[],shots:[],actors:[],foes:[]};
 v.actors=room.players.map((p,i)=>{const f=findRoster(p.characterId).forms[0];return{id:p.id,slot:p.slot,characterId:p.characterId,x:i?9940:8520,y:FLOOR-f.h,w:f.w,h:f.h,hp:f.hp,maxHp:f.hp,evo:0,xp:0,vx:0,vy:0,facing:i?-1:1,grounded:true,jumps:0,input:{x:0,y:0,jump:false},inputAt:now,lastJump:false,invuln:90,stun:0,charge:0,cds:{},respawnAt:0};});
 v.foes=Array.from({length:5},(_,i)=>foe(v,i));v.boss=boss(v);room.versus=v;room.combat=null;sync(room);event(v,'start','Primero en conseguir tres eliminaciones. La fauna permite evolucionar.');return v;
}
function sync(room){const v=room.versus;for(const p of room.players){const a=v.actors.find(a=>a.id===p.id);Object.assign(p,{x:a.x,y:a.y,evolution:a.evo,experience:a.xp,health:a.hp,maxHealth:a.maxHp,worldRoomId:v.arenaId});Object.assign(v.fighters[a.id],{hp:a.hp,maxHp:a.maxHp,evo:a.evo,xp:a.xp});}}
function award(v,a,kind,target){const id='combat:'+v.tick+':'+(++v.serial);const next=awardDuelEvent({...v,events:v.receipts},{id,actor:a.id,target,kind,confirmed:true});v.fighters=next.fighters;v.receipts=next.events; // receipts are separately bounded from visual events
 if(next.winner){v.phase='complete';v.winner=next.winner;event(v,'victory',findRoster(a.characterId).name+' gana la partida.',{actor:a.id});}
 const state=v.fighters[a.id],before=a.evo;a.xp=state.xp;a.evo=state.evo;
 if(a.evo!==before){resize(a);a.invuln=Math.max(a.invuln,45);event(v,'evolution',findRoster(a.characterId).evoNames[a.evo],{actor:a.id,evo:a.evo});}
}
function damage(v,target,n,actor=null){
 if(!alive(target)||(target.invuln||0)>0)return false;const before=target.hp;
 if(target.miniBoss){damageEnemy(target,n);}else target.hp=Math.max(0,target.hp-n);
 const dealt=before-target.hp;if(!(dealt>0))return false;target.flash=10;
 if(target.slot!=null){target.invuln=30;if(!target.hp){target.respawnAt=v.tick+120;target.vx=target.vy=0;event(v,'knockout',findRoster(target.characterId).name+' volverá en dos segundos.',{actor:actor?.id,target:target.id});if(actor&&actor.id!==target.id)award(v,actor,'opponent',target.id);else v.fighters[target.id].deaths++;}}
 else if(!target.hp){target.respawnAt=v.tick+(target.miniBoss?1200:600);if(actor)award(v,actor,target.miniBoss?'miniBoss':'enemy');event(v,'enemy',target.miniBoss?'Guardián derrotado · +180 XP':'Criatura derrotada · +35 XP',{actor:actor?.id,target:target.id});}
 if(actor)actor.charge=Math.min(100,actor.charge+dealt*.3);return true;
}
function targets(v,a){return[...v.actors.filter(b=>b.id!==a.id),...v.foes,v.boss].filter(alive);}
function strike(v,a,r,n,{all=false,stun=0}={}){for(const t of targets(v,a)){const dx=center(t).x-center(a).x;if(!all&&dx*a.facing< -t.w*.5)continue;if(distance(a,t)>r)continue;if(damage(v,t,n,a)&&stun){if(t.miniBoss){if(t.damageWindowRemaining>0&&t._guardianDrowseOpening!==t._guardianOpening){t._guardianDrowseOpening=t._guardianOpening;t._guardianDrowse=18;}}else t.stun=Math.min(24,stun);}}}
function shot(v,a,angle,n,speed=9,pierce=false){if(v.shots.length>=100)return;const c=center(a);v.shots.push({id:++v.shotSerial,x:c.x-8,y:c.y-8,w:16,h:16,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:120,dmg:n,owner:a.id,hero:a.characterId,color:findRoster(a.characterId).color,pierce,hit:[]});}
function fire(v,a,count=1,n=18,speed=9){for(let i=0;i<count;i++)shot(v,a,(a.facing>0?0:Math.PI)+(i-(count-1)/2)*.18,n,speed);}
export function versusAction(room,player,kind,slot){
 const v=room.versus,a=v?.actors.find(a=>a.id===player.id);if(!a||v.phase!=='running'||!alive(a)||room.players.some(p=>!p.connected))return{accepted:false};
 if(!['attack','ability','dodge'].includes(kind))return{accepted:false};
 const key=kind==='attack'?'H':kind==='dodge'?'D':['J','K','L','U','I','P'][slot];if(!key)return{accepted:false};if((a.cds[key]||0)>v.tick)return{accepted:false,cooldown:true};
 if(kind==='ability'&&a.evo<[0,1,2,0,3,4][slot])return{accepted:false,locked:true};
 if(key==='P'&&a.charge<100)return{accepted:false,charge:true};
 const id=a.characterId,level=a.evo,f=form(a),cd={H:20,D:55,J:36,K:150,L:260,U:900,I:240,P:0};a.cds[key]=v.tick+Math.round(cd[key]*(findRoster(id).identity?.cooldown||1));a.cast={key,tick:v.tick};
 if(key==='H'){strike(v,a,78,Math.round((14+level*4)*(findRoster(id).identity?.melee||1)));}
 else if(key==='J'){
  if(id==='dino')strike(v,a,95,22+level*5);
  fire(v,a,id==='stitcho'?3:id==='cuerno'?3:1,18+level*5,id==='chispin'?12:9);
 }else if(key==='D'){a.dash=10;a.dashSpeed=a.facing*11;a.invuln=Math.max(a.invuln,9);}
 else if(key==='K'){
  if(['stitcho','chispin','cuerno','dino','frita'].includes(id)){a.dash=id==='chispin'?9:18;a.dashSpeed=a.facing*(id==='cuerno'?15:id==='chispin'?18:11);a.invuln=Math.max(a.invuln,id==='chispin'?12:5);}
  else if(id==='kilo'){a.flight=a.flight?0:240+level*30;a.vy=-2;}
  else if(id==='cat'){strike(v,a,220,12+level*3,{all:true,stun:24});}
  else if(id==='yomi'){for(const p of v.shots)if(p.owner!==a.id&&distance(a,p)<300+45*level)p.life=0;for(const t of targets(v,a))if(distance(a,t)<300+45*level)t.markUntil=v.tick+240;}
  else if(id==='pizza'){for(const t of targets(v,a))if(distance(a,t)<300){t.slow=90;damage(v,t,14+level*3,a);}}
  else if(id==='dragon'){a.vy=-f.jump*.9;a.grounded=false;strike(v,a,180,18+level*4,{all:true});}
 }else if(key==='L'){
  if(id==='kilo'||id==='cat')a.hp=Math.min(a.maxHp,a.hp+12+level*3);
  for(const t of targets(v,a))if(distance(a,t)<370){const n=38+level*9;const landed=damage(v,t,id==='yomi'&&t.markUntil>v.tick?n*1.5:n,a);if(id==='yomi'&&landed&&t.markUntil>v.tick){t.markUntil=0;a.hp=Math.min(a.maxHp,a.hp+6);}}
 }else if(key==='I'){a.dash=20;a.dashSpeed=a.facing*12;a.invuln=Math.max(a.invuln,10);fire(v,a,3,28+level*5,10);}
 else if(key==='P'){a.charge=0;fire(v,a,7,50+level*5,12);strike(v,a,300,65,{all:true});}
 else if(key==='U'){const ids=['kilo','stitcho','chispin','cat','cuerno','dragon','dino','frita','pizza','yomi'];a.companion={id:ids[(ids.indexOf(id)+1+v.tick%8)%10],life:480,next:1};}
 event(v,'action',findRoster(id).name+' · '+key,{actor:a.id,key});if(v.phase==='complete')room.phase='complete';sync(room);return{accepted:true,key};
}
export function setVersusInput(room,player,input,now){
 const a=room.versus?.actors.find(a=>a.id===player.id);if(!a)return;
 a.input={x:clamp(Number(input.x)||0,-1,1),y:clamp(Number(input.y)||0,-1,1),jump:input.jump===true};a.inputAt=now;
}
function physics(a){
 const f=form(a),input=a.input;if(a.invuln>0)a.invuln--;if(a.flash>0)a.flash--;if(a.stun>0)a.stun--;if(a.slow>0)a.slow--;
 if(!a.stun){
  if(input.x)a.facing=Math.sign(input.x);
  if(a.dash>0){a.dash--;a.vx=a.dashSpeed;}else a.vx=input.x*f.speed*(a.slow>0?.5:1);
  if(input.jump&&!a.lastJump&&a.jumps<f.jumps&&!a.flight){a.vy=-f.jump;a.jumps++;a.grounded=false;}
  if(a.flight>0){a.flight--;a.grounded=false;a.vy=input.y*6;a.vx=input.x*6;}
 }else a.vx*=.8;
 a.lastJump=input.jump;a.previousFeet=a.y+a.h;if(!a.flight)a.vy=Math.min(14,a.vy+.5);a.x=clamp(a.x+a.vx,LEFT,RIGHT-a.w);a.y=Math.max(300,a.y+a.vy);
 if(a.y+a.h>=FLOOR){a.y=FLOOR-a.h;a.vy=0;a.grounded=true;a.jumps=0;}
}
function updateFoe(v,e){
 if(!alive(e))return;const candidates=v.actors.filter(alive);if(!candidates.length)return;const p=candidates.sort((a,b)=>distance(e,a)-distance(e,b))[0],dir=Math.sign(center(p).x-center(e).x)||1;
 if(e.stun>0){e.stun--;return;}if(e.flash>0)e.flash--;
 if(e.phase==='rest'){
  const gap=distance(e,p);e.vx=gap>250?dir*1.6:gap<110?-dir:0;e.x=clamp(e.x+e.vx,LEFT,RIGHT-e.w);
  if(--e.clock<=0&&gap<750){e.phase='warn';e.clock=45;e.target={...center(p)};e.aim=dir;}
 }else if(e.phase==='warn'){
  if(--e.clock<=0){e.phase='attack';e.clock=24;
   if(['shooter','flyer'].includes(e.campaignRole)){const c=center(e),angle=Math.atan2(e.target.y-c.y,e.target.x-c.x);v.shots.push({id:++v.shotSerial,x:c.x,y:c.y,w:14,h:14,vx:Math.cos(angle)*5,vy:Math.sin(angle)*5,life:150,dmg:9,owner:'enemy',hero:v.arenaId.slice(3),color:'#eac3a0'});}
   else{e.vx=e.aim*5;if(e.campaignRole==='jumper')e.vy=-9;}
  }
 }else{e.clock--;e.x=clamp(e.x+e.vx,LEFT,RIGHT-e.w);for(const a of v.actors)if(alive(a)&&hit(a,e))damage(v,a,9);if(e.clock<=0){e.phase='rest';e.clock=110;e.vx=0;}}
 if(e.campaignRole==='flyer'){e.y=FLOOR-210+Math.sin(v.tick*.04)*25;}else{e.vy=Math.min(12,e.vy+.5);e.y=Math.min(FLOOR-e.h,e.y+e.vy);if(e.y===FLOOR-e.h)e.vy=0;}
 e.telegraph=e.phase==='warn';e.wind=e.telegraph?e.clock:0;e.lunge=e.phase==='attack'?e.clock:0;
}
function tick(room){const v=room.versus;v.tick++;
 for(const a of v.actors){if(a.companion?.life>0&&alive(a)){a.companion.life--;if(--a.companion.next<=0){const buddy={...a,characterId:a.companion.id,x:a.x-a.facing*75,y:FLOOR-a.h};fire(v,buddy,2,16+a.evo*3,8);a.companion.next=45;}}if(!alive(a)){if(v.tick>=a.respawnAt){a.hp=a.maxHp;a.x=a.slot?10400:7900;a.y=FLOOR-a.h;a.invuln=120;a.vx=a.vy=0;a.input={x:0,y:0,jump:false};}continue;}physics(a);if(a.dash>0&&v.tick%8===0)strike(v,a,76,12+a.evo*3);}
 for(let i=0;i<v.foes.length;i++){const e=v.foes[i];if(!alive(e)&&v.tick>=e.respawnAt)v.foes[i]=foe(v,i);else updateFoe(v,e);}
 if(!alive(v.boss)&&v.tick>=v.boss.respawnAt)v.boss=boss(v);
 if(alive(v.boss)){
  const p=v.actors.filter(alive).sort((a,b)=>distance(v.boss,a)-distance(v.boss,b))[0];if(p){const g={roomId:v.arenaId,player:p,enemies:[v.boss],projectiles:v.shots,finalGauntlet:{phase:'fight'}};const before=v.shots.length;updateGauntletGuardian(v.boss,g,n=>damage(v,p,n));for(const pr of v.shots.slice(before)){pr.id=++v.shotSerial;pr.owner='enemy';pr.hero=pr.gauntletHero;}v.boss.x=clamp(v.boss.x,LEFT,RIGHT-v.boss.w);}
 }
 for(const a of v.actors)if(alive(a)&&a.vy>0)for(const target of targets(v,a)){if(a.previousFeet<=target.y+Math.min(20,target.h*.4)&&hit(a,target)&&damage(v,target,18+a.evo*5,a)){a.vy=-9;a.jumps=Math.max(0,a.jumps-1);break;}}
 for(const pr of v.shots){if(--pr.life<=0)continue;pr.x+=pr.vx;pr.y+=pr.vy;const attacker=v.actors.find(a=>a.id===pr.owner);const list=attacker?targets(v,attacker):v.actors.filter(alive);for(const t of list){pr.hit||=[];const persistent=['prism','lightning','geysers','ember'].includes(pr.gauntlet);if((!persistent&&pr.hit.includes(t.id))||!hit(pr,t))continue;if(damage(v,t,pr.dmg,attacker)){if(!persistent)pr.hit.push(t.id);if(!pr.pierce&&!persistent)pr.life=0;}if(pr.life<=0)break;}}
 v.shots=v.shots.filter(p=>p.life>0&&p.x>LEFT-100&&p.x<RIGHT+100).slice(-100);
}
export function advanceVersus(room,now){
 const v=room.versus;if(!v)return;const elapsed=clamp(now-v.lastAt,0,250);v.lastAt=now;
 if(room.phase!=='playing'||room.players.some(p=>!p.connected)||v.phase!=='running'){sync(room);return;}
 for(const a of v.actors)if(now-a.inputAt>300)a.input={x:0,y:0,jump:false};
 v.carry+=elapsed;for(let n=0;v.carry>=STEP&&n<15&&v.phase==='running';n++){tick(room);v.carry-=STEP;}sync(room);
 if(v.phase==='complete')room.phase='complete';
}
export function versusSnapshot(room){if(!room.versus)return null;const v=structuredClone(room.versus);for(const a of v.actors){delete a.input;delete a.inputAt;delete a.lastJump;}delete v.carry;delete v.lastAt;return v;}

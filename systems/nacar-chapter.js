import {applyChapterXpFloor,XP_NEED} from './xp.js';
const near=(p,x,y,r=88)=>Math.hypot(p.x+p.w/2-x,p.y+p.h/2-y)<r;
export const NACAR_BOSS_ID='w1-nacar-anemone-v1';
export const pearlOpen=(tick,s)=>((tick+(s.phase||0))%180)<100;
export const nacarChapter=g=>!!g?.roomDef?.nacarChapter;
const saved=g=>g.secrets?.['w1-nacar']||[];
function remember(g,id){g.secrets||={};const a=g.secrets['w1-nacar']||=[];if(!a.includes(id))a.push(id);g.save?.();}
export function enterNacarChapter(g){if(!nacarChapter(g))return;g._nacarCurrents={west:!saved(g).includes('w1-nacar-valve-west'),east:saved(g).includes('w1-nacar-valve-east')};g.world1.sealed=saved(g).includes('w1-nacar-home');applyChapterXpFloor(g,XP_NEED[Math.min(4,g.world1.stations.filter(s=>s.done).length)]);}
export const nacarDiscovered=(g,id)=>saved(g).includes('w1-nacar-discovery-'+id);

export function nacarDiscoveryAvailable(g,discovery){
 return !discovery.requires || nacarDiscovered(g,discovery.requires);
}

function discoveryPrompt(g,discovery){
 if(!nacarDiscoveryAvailable(g,discovery))return 'Sigue el eco de la tripulación';
 if(discovery.kind==='refuge'){
  if(nacarDiscovered(g,discovery.id))return 'El refugio ya te ha prestado su luz';
  if(g.player.health>=g.player.maxHealth)return 'Refugio · tienes toda la vida';
  return 'E · recuperar vida';
 }
 return 'E · '+(discovery.kind==='shortcut'?'cruzar ': 'escuchar ')+discovery.name;
}

function useDiscovery(g,discovery){
 if(!nacarDiscoveryAvailable(g,discovery))return true;
 const player=g.player;
 if(discovery.kind==='shortcut'){
  player.x=discovery.toX-player.w/2;
  player.y=discovery.toY-player.h/2;
  player.vx=0;
  player.vy=0;
  g.resetInput?.();
  return true;
 }
 const key='w1-nacar-discovery-'+discovery.id;
 if(discovery.kind==='refuge'){
  if(nacarDiscovered(g,discovery.id)||player.health>=player.maxHealth)return true;
  player.health=Math.min(player.maxHealth,player.health+Math.ceil(player.maxHealth*.35));
  remember(g,key);
  g.showOceanDiscovery?.(discovery.name,'La espuma recupera parte de tu vida.');
  return true;
 }
 if(!nacarDiscovered(g,discovery.id))remember(g,key);
 g.showOceanDiscovery?.(discovery.name,discovery.line);
 return true;
}

export const nacarRouteAvailable=(g,route)=>!route.afterVictory||g.world1?.sealed===true;

export function activeNacarRoute(g){
 const run=g.world1?.swimRoute;
 if(!run||!nacarChapter(g))return null;
 const route=g.roomDef.swimRoutes?.find(r=>r.id===run.id);
 return route?{run,route}:null;
}

function useSwimRoute(g,route){
 const previous=activeNacarRoute(g);
 if(previous?.run.id===route.id){
  g.world1.swimRoute=null;
  return true;
 }
 g.world1.swimRoute={id:route.id,ring:0,started:g.world1.tick};
 g.showOceanDiscovery?.(route.name,'Cruza los aros iluminados en orden. Puedes volver al inicio para abandonar la prueba.');
 return true;
}

function updateSwimRoute(g){
 const active=activeNacarRoute(g);
 if(!active)return;
 const {run,route}=active;
 const elapsed=g.world1.tick-run.started;
 if(g.player?.dead||elapsed>=route.limit){
  g.world1.swimRoute=null;
  if(!g.player?.dead)g.showOceanDiscovery?.(route.name,'Se apagaron los aros. Puedes volver a intentarlo desde el inicio.');
  return;
 }
 const [x,y]=route.rings[run.ring];
 if(!near(g.player,x,y,44))return;
 run.ring++;
 if(run.ring<route.rings.length){
  g.onWorld1Beat?.('station','nacar');
  return;
 }
 g.world1.swimRoute=null;
 const isFast=elapsed<=route.fast;
 const times=g.nacarTimes||={};
 const best=!times[route.id]||elapsed<times[route.id];
 if(best)times[route.id]=Math.max(1,elapsed);
 const finished='course-'+route.id;
 const record=finished+'-gold';
 if(!nacarDiscovered(g,finished))remember(g,'w1-nacar-discovery-'+finished);
 if(isFast&&!nacarDiscovered(g,record))remember(g,'w1-nacar-discovery-'+record);
 if(best)g.save?.();
 const result=isFast?'Marca de oro':'Ruta completada';
 g.showOceanDiscovery?.(route.name,result+' · '+(elapsed/60).toFixed(1)+' s'+(best?' · Récord personal':''));
}

export function nacarInteraction(g){
 if(!nacarChapter(g)||!g.player||g.player.dead)return null;
 const p=g.player;
 if(!g.onlineAdventure){
  const route=g.roomDef.swimRoutes?.find(r=>nacarRouteAvailable(g,r)&&near(p,r.x,r.y,62));
  if(route)return{kind:'course',route};
  const discovery=g.roomDef.discoveries?.find(d=>
   (d.kind!=='shortcut'||nacarDiscoveryAvailable(g,d))&&near(p,d.x,d.y,72));
  if(discovery)return{kind:'discovery',discovery};
  if(g.roomDef.oceanExits?.some(exit=>near(p,exit.x,exit.y,112)))return{kind:'return'};
 }
 for(const valve of g.roomDef.tides)if(near(p,valve.x,valve.y))return{kind:'valve',valve};
 const pearl=g.world1?.stations.find(s=>!s.done&&near(p,s.x,s.y));
 return pearl?{kind:'pearl',pearl}:null;
}

export function nacarPrompt(g){
 const interaction=nacarInteraction(g);
 if(!interaction)return null;
 if(interaction.kind==='course'){
  const {route}=interaction;
  return activeNacarRoute(g)?.run.id===route.id?'E · parar la prueba':'E · nadar '+route.name;
 }
 if(interaction.kind==='discovery')return discoveryPrompt(g,interaction.discovery);
 if(interaction.kind==='return')return 'E · volver al jardín de Michi';
 if(interaction.kind==='valve')return 'E · invertir la corriente';
 return pearlOpen(g.world1.tick,interaction.pearl)
  ?'E · escuchar '+interaction.pearl.name
  :'Espera a que la perla se abra';
}

export function interactNacar(g){
 const interaction=nacarInteraction(g);
 if(!interaction)return false;
 if(interaction.kind==='course')return useSwimRoute(g,interaction.route);
 if(interaction.kind==='discovery')return useDiscovery(g,interaction.discovery);
 if(interaction.kind==='return')return g.loadRoom?.('w1-cat','ocean-return')===true;
 if(interaction.kind==='valve'){
  const id=interaction.valve.id;
  g._nacarCurrents[id]=!g._nacarCurrents[id];
  const key='w1-nacar-valve-'+id;
  g.secrets||={};
  const discoveries=g.secrets['w1-nacar']||=[];
  const index=discoveries.indexOf(key);
  if(index>=0)discoveries.splice(index,1);
  else discoveries.push(key);
  g.save?.();
  return true;
 }
 const station=interaction.pearl;
 if(!pearlOpen(g.world1.tick,station))return true;
 station.done=true;
 g.world1Stations||={};
 g.world1Stations['w1-nacar']=g.world1.stations.filter(s=>s.done).map(s=>s.id);
 if(!station._scored){
  g.score=(g.score||0)+150;
  station._scored=true;
 }
 applyChapterXpFloor(g,XP_NEED[Math.min(4,g.world1Stations['w1-nacar'].length)]);
 g.onWorld1Beat?.('station','nacar');
 g.save?.();
 return true;
}
export function nacarObjective(g){if(!nacarChapter(g))return null;const active=activeNacarRoute(g);if(active){const [x,y]=active.route.rings[active.run.ring];return{x,y,label:active.route.name,action:'Cruza el aro '+(active.run.ring+1)+' de '+active.route.rings.length};}const s=g.world1?.stations.find(s=>!s.done);if(s)return{x:s.x,y:s.y,label:s.name,action:'Nada hasta la perla y pulsa E / Usar cuando brille'};if(!g.world1.sealed)return{x:9550,y:1440,label:'Anémona del silencio',action:'Esquiva el aviso y ataca durante su apertura'};return{x:10800,y:1775,label:'Volver con Michi',action:'La marea está a salvo. Pulsa E / Usar en la corriente del este'};}
export function updateNacarChapter(g){if(!nacarChapter(g))return false;const w=g.world1;updateSwimRoute(g);for(const v of g.roomDef.tides){const a=v.area,up=g._nacarCurrents?.[v.id];for(const shot of g.projectiles||[])if(shot.owner==='enemy'&&shot.x>a.x&&shot.x<a.x+a.w&&shot.y>a.y&&shot.y<a.y+a.h)shot.vy=up?-4:4;}
 if(!w.sealed&&w.stations.every(s=>s.done)&&g.clearedEncounters?.['w1-nacar']?.includes(NACAR_BOSS_ID)){w.sealed=true;remember(g,'w1-nacar-home');g.playWorld1Cine?.('nacarVictory','nacar');}return true;}
// Profiles are local to the ocean. Main campaign movement and other heroes use their normal physics.
export const NACAR_SWIM_PROFILES=Object.freeze([
 {up:5.2,down:5.0,steer:.43,tide:1.0},    // Gota: easy to place in a ring.
 {up:6.4,down:5.3,steer:.29,tide:1.1},    // Nácar: strong upward pulse.
 {up:5.8,down:6.3,steer:.48,tide:.52},    // Brújula: holds course across currents.
 {up:7.0,down:5.8,steer:.26,tide:1.28},   // Aurora: rides the current for speed.
 {up:6.3,down:7.1,steer:.31,tide:.74},    // Abisal: dives fastest.
].map(Object.freeze));

export function swimNacar(g,p,up,down){
 if(!nacarChapter(g)||p.dead)return;
 const form=Math.min(4,Math.max(0,p.evo|0));
 const profile=NACAR_SWIM_PROFILES[form];
 const target=up===down?0:up?-profile.up:profile.down;
 p.vy=((Number.isFinite(p.vy)?p.vy:0)*(1-profile.steer))+target*profile.steer;
 for(const {id,area} of g.roomDef.tides){
  if(p.x+p.w>area.x&&p.x<area.x+area.w&&p.y+p.h>area.y&&p.y<area.y+area.h){
   p.vy+=(g._nacarCurrents?.[id]?-1:1)*profile.tide;
  }
 }
 p.vy=Math.max(-9,Math.min(9,p.vy));
 if(Math.abs(p.vy)<.045)p.vy=0;
 p.buffer=0;
 p.jumps=0;
 p.coyote=0;
 if(p.y<100){p.y=100;p.vy=Math.max(0,p.vy);}
}
export function createNacarBoss(makeFoe,rng){const e=makeFoe(9500,1430,'medusa','w1-nacar',998,{rng});Object.assign(e,{x:9500,y:1430,w:130,h:135,hp:520,max:520,miniBoss:true,_encounterSaveId:NACAR_BOSS_ID,_nacarBoss:{phase:'rest',clock:90,attack:0,tier:1},damageTakenScale:0});return e;}
const bossSweepDirection=enemy=>enemy._nacarBoss.tx<enemy.x?1:-1;
export const NACAR_ATTACK_NAMES=Object.freeze(['Abanico de esporas','Lluvia de pólipos','Corona de aguijones','Marea cruzada']);

export function nacarBossPattern(enemy){
 const {attack,tier,tx,ty}=enemy._nacarBoss;
 const x=enemy.x+enemy.w/2,y=enemy.y+enemy.h/2;
 if(attack===3){
  const direction=bossSweepDirection(enemy);
  const source=direction>0?8840:10480;
  const gap=Math.max(1,Math.min(5,Math.round((ty-1090)/105)));
  return Array.from({length:8},(_,i)=>i).filter(i=>i!==gap&&i!==gap+1)
   .map(i=>({x:source,y:1090+i*105,angle:direction>0?0:Math.PI}));
 }
 if(attack===1)return [-1,0,1].map(i=>({x:tx+i*150,y:Math.max(150,ty-360),angle:Math.PI/2}));
 const count=attack===0?5+tier*2:6;
 const aim=Math.atan2(ty-y,tx-x);
 return Array.from({length:count},(_,i)=>({x,y,angle:attack===0?aim+(i-(count-1)/2)*.18:i*Math.PI*2/count}));
}

export function updateNacarBoss(e,g){const b=e._nacarBoss;if(!b)return false;e.vx=0;e.vy=0;e.stun=0;if(e.hp<=0)return true;const p=g.player;if(!p||p.dead||!g.world1?.stations.every(s=>s.done)){e.damageTakenScale=0;return true;}b.tier=e.hp<e.max*.3?3:e.hp<e.max*.65?2:1;if(Math.abs(p.x-e.x)>1500)return true;
 if(--b.clock>0){if(b.phase==='rest')e.damageTakenScale=e.damageWindowRemaining>0?1:0;return true;}
 if(b.phase==='rest'){b.phase='warn';b.clock=65;b.tx=p.x+p.w/2;b.ty=p.y+p.h/2;e.damageTakenScale=0;}
 else if(b.phase==='warn'){
  b.phase='attack';
  b.clock=32;
  for(const shot of nacarBossPattern(e)){
   if(g.projectiles.length>=120)break;
   g.projectiles.push({x:shot.x,y:shot.y,vx:Math.cos(shot.angle)*5.2,vy:Math.sin(shot.angle)*5.2,w:16,h:16,life:b.attack===3?340:150,dmg:12+b.tier*2,owner:'enemy',color:'#d7a7d1'});
  }
 }
 else{b.phase='rest';b.clock=105;b.attack=(b.attack+1)%(b.tier>=2?4:3);e.damageWindowRemaining=180;e.damageTakenScale=1;}return true;
}

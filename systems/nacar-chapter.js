import {applyChapterXpFloor,XP_NEED} from './xp.js';
const near=(p,x,y,r=88)=>Math.hypot(p.x+p.w/2-x,p.y+p.h/2-y)<r;
export const NACAR_BOSS_ID='w1-nacar-anemone-v1';
export const pearlOpen=(tick,s)=>((tick+(s.phase||0))%180)<100;
export const nacarChapter=g=>!!g?.roomDef?.nacarChapter;
const saved=g=>g.secrets?.['w1-nacar']||[];
function remember(g,id){g.secrets||={};const a=g.secrets['w1-nacar']||=[];if(!a.includes(id))a.push(id);g.save?.();}
export function enterNacarChapter(g){if(!nacarChapter(g))return;g._nacarCurrents={west:!saved(g).includes('w1-nacar-valve-west'),east:saved(g).includes('w1-nacar-valve-east')};g.world1.sealed=saved(g).includes('w1-nacar-home');applyChapterXpFloor(g,XP_NEED[Math.min(4,g.world1.stations.filter(s=>s.done).length)]);}
export function nacarInteraction(g){if(!nacarChapter(g)||!g.player)return null;const p=g.player;for(const v of g.roomDef.tides)if(near(p,v.x,v.y))return{kind:'valve',...v};const s=g.world1?.stations.find(s=>!s.done&&near(p,s.x,s.y));return s?{...s,kind:'pearl'}:null;}
export function nacarPrompt(g){const q=nacarInteraction(g);if(!q)return null;return q.kind==='valve'?'E · invertir la corriente':pearlOpen(g.world1.tick,q)?'E · escuchar '+q.name:'Espera a que la perla se abra';}
export function interactNacar(g){const q=nacarInteraction(g);if(!q)return false;if(q.kind==='valve'){g._nacarCurrents[q.id]=!g._nacarCurrents[q.id];const key='w1-nacar-valve-'+q.id;g.secrets||={};const a=g.secrets['w1-nacar']||=[];const i=a.indexOf(key);if(i>=0)a.splice(i,1);else a.push(key);g.save?.();return true;}
 const s=g.world1.stations.find(s=>s.id===q.id);if(!pearlOpen(g.world1.tick,s))return true;s.done=true;g.world1Stations||={};g.world1Stations['w1-nacar']=g.world1.stations.filter(s=>s.done).map(s=>s.id);if(!s._scored){g.score=(g.score||0)+150;s._scored=true;}applyChapterXpFloor(g,XP_NEED[Math.min(4,g.world1.stations.filter(s=>s.done).length)]);g.onWorld1Beat?.('station','nacar');g.save?.();return true;
}
export function nacarObjective(g){if(!nacarChapter(g))return null;const s=g.world1?.stations.find(s=>!s.done);if(s)return{x:s.x,y:s.y,label:s.name,action:'Nada hasta la perla y pulsa E / Usar cuando brille'};if(!g.world1.sealed)return{x:9550,y:1440,label:'Anémona del silencio',action:'Esquiva el aviso y ataca durante su apertura'};return{x:10880,y:1780,label:'Volver con Michi',action:'La marea está a salvo. Sigue hacia la salida del este'};}
export function updateNacarChapter(g){if(!nacarChapter(g))return false;const w=g.world1;for(const v of g.roomDef.tides){const a=v.area,up=g._nacarCurrents?.[v.id];for(const shot of g.projectiles||[])if(shot.owner==='enemy'&&shot.x>a.x&&shot.x<a.x+a.w&&shot.y>a.y&&shot.y<a.y+a.h)shot.vy=up?-4:4;}
 if(!w.sealed&&w.stations.every(s=>s.done)&&g.clearedEncounters?.['w1-nacar']?.includes(NACAR_BOSS_ID)){w.sealed=true;remember(g,'w1-nacar-home');g.playWorld1Cine?.('nacarVictory','nacar');}return true;}
// Same movement rules for keyboard and touch. No air timer or involuntary sinking.
export function swimNacar(g,p,jump,down){if(!nacarChapter(g)||p.dead)return;p.vy=Math.max(-5,Math.min(5,(p.vy||0)*.8+(jump?-1.8:down?1.8:-.18)));p.buffer=0;p.jumps=0;p.coyote=0;p.grounded=false;for(const v of g.roomDef.tides){const a=v.area;if(p.x+p.w>a.x&&p.x<a.x+a.w&&p.y+p.h>a.y&&p.y<a.y+a.h)p.vy=Math.max(-6,Math.min(6,p.vy+(g._nacarCurrents?.[v.id]?-1.1:1.1)));}if(p.y<100){p.y=100;p.vy=Math.max(0,p.vy);}}
export function createNacarBoss(makeFoe,rng){const e=makeFoe(9500,1430,'medusa','w1-nacar',998,{rng});Object.assign(e,{x:9500,y:1430,w:130,h:135,hp:520,max:520,miniBoss:true,_encounterSaveId:NACAR_BOSS_ID,_nacarBoss:{phase:'rest',clock:90,attack:0,tier:1},damageTakenScale:0});return e;}
export function updateNacarBoss(e,g){const b=e._nacarBoss;if(!b)return false;e.vx=0;e.vy=0;e.stun=0;if(e.hp<=0)return true;const p=g.player;if(!p||p.dead||!g.world1?.stations.every(s=>s.done)){e.damageTakenScale=0;return true;}b.tier=e.hp<e.max*.3?3:e.hp<e.max*.65?2:1;if(Math.abs(p.x-e.x)>1500)return true;
 if(--b.clock>0){if(b.phase==='rest')e.damageTakenScale=e.damageWindowRemaining>0?1:0;return true;}
 if(b.phase==='rest'){b.phase='warn';b.clock=65;b.tx=p.x+p.w/2;b.ty=p.y+p.h/2;e.damageTakenScale=0;}
 else if(b.phase==='warn'){b.phase='attack';b.clock=32;const x=e.x+e.w/2,y=e.y+e.h/2,a=Math.atan2(b.ty-y,b.tx-x),n=b.attack===0?5+b.tier*2:b.attack===1?3:6;for(let i=0;i<n;i++){const angle=b.attack===0?a+(i-(n-1)/2)*.18:b.attack===1?Math.PI/2:i*Math.PI*2/n;const xx=b.attack===1?b.tx+(i-1)*150:x,yy=b.attack===1?Math.max(150,b.ty-360):y;if((g.projectiles||[]).length<120)g.projectiles.push({x:xx,y:yy,vx:Math.cos(angle)*5.2,vy:Math.sin(angle)*5.2,w:16,h:16,life:150,dmg:12+b.tier*2,owner:'enemy',color:'#d7a7d1'});}}
 else{b.phase='rest';b.clock=105;b.attack=(b.attack+1)%3;e.damageWindowRemaining=180;e.damageTakenScale=1;}return true;
}

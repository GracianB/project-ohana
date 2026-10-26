// Authenticated host state and two-person scene barriers for the final act.
import {KEEPSAKE_ORDER,KEEPSAKES} from '../systems/keepsakes.js';
const scenes=new Set(['keepsakeIntro','keepsakeRescue','bossIntro','bossDefeat','ending']);
const phases=new Set(['dormant','intro','fight','released','rescue','complete']);
const finite=(n,lo,hi)=>typeof n==='number'&&Number.isFinite(n)&&n>=lo&&n<=hi;
function bounded(value,depth=0,key=''){
 if(depth>9)return false;if(value===null||typeof value==='boolean')return true;
 if(typeof value==='number')return Number.isFinite(value)&&Math.abs(value)<=(key==='seed'?0xffffffff:1e9);
 if(typeof value==='string')return value.length<=512;
 if(Array.isArray(value))return value.length<=128&&value.every(v=>bounded(v,depth+1));
 if(value&&typeof value==='object')return Object.keys(value).length<=96&&Object.entries(value).every(([k,v])=>!['__proto__','constructor','prototype'].includes(k)&&k.length<=96&&bounded(v,depth+1,k));return false;
}
const clean=value=>{try{const text=JSON.stringify(value);if(text.length>40000)return null;const parsed=JSON.parse(text);return bounded(parsed)?parsed:null;}catch{return null;}};
export function finaleEnemy(enemy){
 if(!enemy)return null;const keys=['x','y','w','h','hp','max','vx','vy','kind','boss','miniBoss','gauntletBoss','evolved','_fusionBoss','phase','contactDmg','damageWindowRemaining','damageTakenScale','_guardianOpening','_coopSyncId','_coopVisit','telegraph','teleKind','invuln','flash','dying','dyingMax','facing'];
 const out=Object.fromEntries(keys.filter(k=>enemy[k]!==undefined).map(k=>[k,enemy[k]]));
 if(enemy.gauntletBoss)out[KEEPSAKES[enemy.gauntletBoss]?.key]=enemy[KEEPSAKES[enemy.gauntletBoss]?.key];
 if(enemy._fusionBoss)out._fusion=enemy._fusion;
 return clean(out);
}
export function validFinaleEnemy(e){
 return e===null||!!e&&finite(e.x,-4096,20000)&&finite(e.y,-4096,20000)&&finite(e.w,1,1024)&&finite(e.h,1,1024)&&finite(e.hp,0,100000)&&finite(e.max,1,100000)&&e.hp<=e.max&&
 ((e._fusionBoss===true&&e.kind==='boss')||(KEEPSAKE_ORDER.includes(e.gauntletBoss)&&e.kind==='keeper'))&&!!clean(e);
}
export function mergeAdventureFinale(previous,payload,{host=false,playerId,players=[]}={}){
 const old=previous||{found:[],phase:'dormant',hero:null,guardian:null,boss:null,cue:null,seen:[],finished:[],won:false,revision:0};
 if(!payload||!playerId||!players.includes(playerId))return old;
 const next=structuredClone(old);
 if(host&&payload.state){
  const p=payload.state;if(!phases.has(p.phase)||!Array.isArray(p.found)||!validFinaleEnemy(p.guardian)||!validFinaleEnemy(p.boss))return old;
  if(p.hero!==null&&!KEEPSAKE_ORDER.includes(p.hero))return old;
  if(!old.found.every((h,i)=>p.found[i]===h)||p.found.length<old.found.length||p.found.length>old.found.length+1)return old;
  if(!p.found.every((h,i)=>h===KEEPSAKE_ORDER[i]))return old;
  if(p.found.length>old.found.length&&(p.hero!==KEEPSAKE_ORDER[old.found.length]||p.phase!=='rescue'||p.guardian?.gauntletBoss!==p.hero||p.guardian.hp!==0))return old;
  const cue=p.cue;
  if(cue&&(!scenes.has(cue.scene)||typeof cue.id!=='string'||! /^[\w:-]{4,96}$/.test(cue.id)||cue.hero!==null&&!KEEPSAKE_ORDER.includes(cue.hero)))return old;
  if(cue&&cue.id!==old.cue?.id&&((cue.scene==='keepsakeIntro'&&(cue.hero!==p.hero||p.phase!=='intro'))||(cue.scene==='keepsakeRescue'&&(cue.hero!==p.hero||p.phase!=='rescue'||!p.found.includes(p.hero)))||(['bossIntro','bossDefeat','ending'].includes(cue.scene)&&p.found.length!==10)))return old;
  if(cue&&old.cue&&cue.id!==old.cue.id&&(!players.every(id=>old.cue.ready.includes(id))||old.seen.includes(cue.id)))return old;
  if(cue&&cue.id!==old.cue?.id){if(old.cue)next.finished=[...(old.finished||[]),old.cue.id].slice(-64);next.cue={...cue,ready:[]};next.seen=[...old.seen,cue.id].slice(-64);}
  if(old.cue&&!players.every(id=>old.cue.ready.includes(id))&&(p.phase!==old.phase||p.found.length!==old.found.length))return old;
  const shots=Array.isArray(p.shots)?p.shots:[];if(shots.length>48||shots.some(s=>!Number.isSafeInteger(s.id)||!finite(s.x,-4096,20000)||!finite(s.y,-4096,20000)||!finite(s.w,1,6000)||!finite(s.h,1,2000)||!finite(s.life,0,1000)||!finite(s.dmg,0,1000)||!finite(s.vx,-60,60)||!finite(s.vy,-60,60)))return old;
  const guardian=finaleEnemy(p.guardian),boss=finaleEnemy(p.boss);
  Object.assign(next,{found:[...p.found],phase:p.phase,hero:p.hero,guardian,boss,director:clean(p.director||null),shots:clean(shots)||[]});
  next.won=old.won||p.won===true&&p.found.length===10&&boss?.hp===0;
 }
 if(payload.ready&&next.cue?.id===payload.ready&&!next.cue.ready.includes(playerId))next.cue.ready.push(playerId);
 next.complete=!!old.complete||!!next.won&&next.cue?.scene==='ending'&&players.every(id=>next.cue.ready.includes(id));
 if(JSON.stringify(next)!==JSON.stringify(old))next.revision++;
 return next;
}
const cues=new WeakMap(),shotIds=new WeakMap();let shotSerial=0;
function finaleShots(g){return (g.projectiles||[]).filter(p=>p.owner==='enemy'&&p.life>0).slice(0,48).map(p=>{if(!shotIds.has(p))shotIds.set(p,++shotSerial);return Object.fromEntries(['x','y','w','h','vx','vy','life','dmg','gauntlet','gauntletHero','color'].filter(k=>p[k]!==undefined).map(k=>[k,p[k]]).concat([['id',shotIds.get(p)]]));});}
export function adventureFinalePayload(g){
 if(!g?.onlineAdventure||g.roomId!=='w1-final')return null;
 const payload={ready:g._coopFinalReady||null};
 if(!g.coopAuthority&&g.world1Cine&&g._coopFinalCue?.scene===g.world1Cine.id&&!cues.has(g.world1Cine))cues.set(g.world1Cine,{...g._coopFinalCue});
 if(g.coopAuthority){const v=g.finalGauntlet;
  const cine=g.world1Cine;
  if(cine&&scenes.has(cine.id)){if(!cues.has(cine)){cues.set(cine,{id:globalThis.crypto.randomUUID(),scene:cine.id,hero:cine.hero||null});g._coopFinalReady=null;g._coopFinalWaiting=false;}g._coopFinalCue=cues.get(cine);}
  payload.state={found:v?.found||g.keepsakes||[],phase:v?.phase||'dormant',hero:v?.hero||null,guardian:finaleEnemy(v?.guardian||null),boss:finaleEnemy(g.boss?._fusionBoss?g.boss:null),won:!!g.world1Won,cue:g._coopFinalCue||null,shots:finaleShots(g),director:g.world1Boss?Object.fromEntries(['card','special','defeat','done','echoes','t'].map(k=>[k,g.world1Boss[k]])):null};
 }
 return payload;
}
export function holdAdventureFinalScene(g,cine){
 if(!g?.onlineAdventure||g.roomId!=='w1-final'||!scenes.has(cine.id))return false;
 adventureFinalePayload(g);
 const cue=cues.get(cine)||g._coopFinalCue;if(!cue||cue.scene!==cine.id)return true;
 if(g.coopFinaleState?.finished?.includes(cue.id)){g._coopFinalWaiting=false;return false;}
 g._coopFinalReady=cue.id;
 const canonical=g.coopFinaleState?.cue,players=g.coopFinalPlayerIds||[];
 const waiting=canonical?.id!==cue.id||players.length!==2||!players.every(id=>canonical.ready.includes(id))||g.coopFinalDisconnected;
 g._coopFinalWaiting=waiting;return !!waiting;
}
export function applyAdventureFinale(g,state,{host=false,players=[]}={}){
 if(!g?.onlineAdventure||g.roomId!=='w1-final'||!state)return false;
 if((g._coopFinalRevision??-1)>state.revision)return false;
 const previousState=g.coopFinaleState,fresh=g._coopFinalRevision!==state.revision;
 g._coopFinalRevision=state.revision;g.coopFinaleState=state;g.coopFinalPlayerIds=players.map(p=>p.playerId);g.coopFinalDisconnected=players.some(p=>!p.connected);
 // Final rescues belong to the room, never to the browser's solo profile.
 g.keepsakes=[...state.found];
 if(!host&&previousState)for(const hero of state.found)if(!previousState.found.includes(hero))g.onGauntletAward?.(hero);
 if(state.won)g.coopFinalWon=true;
 if(host&&g.finalGauntlet&&g.finalGauntlet.found.length>=state.found.length)return true;
 if(host&&g.finalGauntlet){g.world1Cine=null;g._pendingWorld1Cine=null;g._coopFinalCue=null;g._coopFinalReady=null;g.enemies=[];g.boss=null;}
 const v=g.finalGauntlet||={found:[],phase:'dormant',hero:null};
 Object.assign(v,{found:[...state.found],phase:state.phase,hero:state.hero,guardian:null,object:state.hero?{x:9360,y:1119}:null});
 if(fresh){g.coopFinalShots=(state.shots||[]).filter(s=>!g._coopFinalConsumed?.has('g:'+s.id)).map(s=>({...s}));g._coopFinalPacketAt=globalThis.performance?.now?.()||0;}
 const spec=state.boss||state.guardian;
 if(spec){let enemy=g.enemies?.find(e=>spec._fusionBoss?e._fusionBoss:e.gauntletBoss===spec.gauntletBoss);if(!enemy)enemy={};if(fresh||!enemy.kind)Object.assign(enemy,structuredClone(spec),{roomId:'w1-final'});if(enemy._fusion)enemy._fusion.shots=(enemy._fusion.shots||[]).filter(s=>!g._coopFinalConsumed?.has('q:'+(enemy._coopSyncId||0)+':'+s.id));g.enemies=[enemy];if(spec._fusionBoss){g.boss=enemy;g.world1Boss||=g.createCoopBossDirector?.(enemy);if(g.world1Boss&&state.director)Object.assign(g.world1Boss,structuredClone(state.director));}else{v.guardian=enemy;g.boss=null;}}
 const cue=state.cue;
 if(cue&&g._coopFinalCue?.id!==cue.id){
  // The engine's existing queue owns overlapping evolution/entry films.
  g._coopFinalCue={id:cue.id,scene:cue.scene,hero:cue.hero};g._coopFinalReady=null;g._coopFinalWaiting=false;
  g.playWorld1Cine?.(cue.scene,cue.hero);if(g.world1Cine?.id===cue.scene)cues.set(g.world1Cine,{...g._coopFinalCue});
 }
 return true;
}

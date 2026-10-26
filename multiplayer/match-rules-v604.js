// V604 · Two future modes over the same authored World 1.
// Pure state only. Only authenticated server events may be fed to these reducers.
import {WORLD1_ORDER} from '../systems/world1-rooms.js';
export const OHANA_MODES=Object.freeze({VERSUS:'versus',ADVENTURE:'adventure'});
export const DUEL_ARENAS=Object.freeze(WORLD1_ORDER.map(hero=>'w1-'+hero));
export const DUEL_XP=Object.freeze({enemy:35,elite:70,miniBoss:180,opponent:150});
export const DUEL_THRESHOLDS=Object.freeze([0,85,190,320,480]);
export const TRAVEL_VOTE_TTL_MS=25_000;
const validPlayer=id=>typeof id==='string'&&/^[a-zA-Z0-9_-]{2,80}$/.test(id);
export function validMode(value){return value===OHANA_MODES.VERSUS||value===OHANA_MODES.ADVENTURE;}
export function validDuelArena(value){return DUEL_ARENAS.includes(value);}
export function adjacentRoom(from,to){
 const ids=['hub',...DUEL_ARENAS,'w1-final'],a=ids.indexOf(from),b=ids.indexOf(to);
 return a>=0&&b>=0&&Math.abs(a-b)===1;
}
export function duelLevel(xp){
 const value=Math.max(0,Number.isFinite(xp)?xp:0);
 let evo=0;for(let i=1;i<DUEL_THRESHOLDS.length;i++)if(value>=DUEL_THRESHOLDS[i])evo=i;
 return evo;
}
export function createDuel(arenaId,players){
 if(!validDuelArena(arenaId))throw Error('DUEL_ARENA_INVALID');
 if(!Array.isArray(players)||players.length!==2||players.some(id=>!validPlayer(id))||new Set(players).size!==2)throw Error('DUEL_PLAYERS_INVALID');
 return {mode:'versus',arenaId,phase:'running',fighters:Object.fromEntries(players.map(id=>[id,{xp:0,evo:0,hp:100,maxHp:100,kills:0,deaths:0,enemyKills:0,bossKills:0,score:0}])),events:[],round:1};
}
export function awardDuelEvent(match,{id,actor,target,kind,confirmed=false}={}){
 if(match?.mode!=='versus'||!confirmed||typeof id!=='string'||!/^[\w:-]{4,90}$/.test(id))return match;
 if(match.events.includes(id)||!Object.hasOwn(match.fighters,actor)||!Object.hasOwn(DUEL_XP,kind))return match;
 if(kind==='opponent'&&(target===actor||!Object.hasOwn(match.fighters,target)))return match;
 if(match.phase!=='running')return match;
 const next={...match,fighters:Object.fromEntries(Object.entries(match.fighters).map(([id,f])=>[id,{...f}])),events:[...match.events,id].slice(-128)};
 const player=next.fighters[actor],xp=DUEL_XP[kind];
 player.xp+=xp;player.evo=duelLevel(player.xp);player.score+=xp;
 if(kind==='opponent'){player.kills++;next.fighters[target].deaths++;}
 else if(kind==='miniBoss')player.bossKills++;
 else player.enemyKills++;
 if(player.kills>=3){next.phase='complete';next.winner=actor;}
 return next;
}
export function duelHud(match,playerId){
 const p=match?.fighters?.[playerId];if(!p)return null;
 const next=DUEL_THRESHOLDS[p.evo+1]??null;
 return Object.freeze({playerId,room:match.arenaId,form:p.evo+1,xp:p.xp,
  nextFormXP:next,kills:p.kills,deaths:p.deaths,enemyKills:p.enemyKills,
  bossKills:p.bossKills,score:p.score,win:match.winner===playerId});
}
export function createTravelVote({id,from,to,by,players,now=0}={}){
 if(typeof id!=='string'||!/^[\w:-]{4,90}$/.test(id))throw Error('TRAVEL_ID_INVALID');
 if(!adjacentRoom(from,to))throw Error('TRAVEL_DESTINATION_INVALID');
 if(!Array.isArray(players)||players.length!==2||players.some(p=>!validPlayer(p))||new Set(players).size!==2||!players.includes(by))throw Error('TRAVEL_PLAYERS_INVALID');
 if(!Number.isFinite(now)||now<0)throw Error('TRAVEL_TIME_INVALID');
 return {id,from,to,players:[...players],accepted:[by],rejected:[],createdAt:now,status:'pending'};
}
export function castTravelVote(vote,by,accept,now=0){
 if(!vote||vote.status!=='pending'||!vote.players.includes(by))return vote;
 if(!Number.isFinite(now)||now<vote.createdAt||now>=vote.createdAt+TRAVEL_VOTE_TTL_MS)return {...vote,status:'expired'};
 if(vote.rejected.includes(by)||(accept===true&&vote.accepted.includes(by)))return vote;
 if(accept!==true&&accept!==false)return vote;
 const accepted=accept?[...vote.accepted,by]:vote.accepted.filter(id=>id!==by);
 const rejected=accept?vote.rejected:[...vote.rejected,by];
 return {...vote,accepted,rejected,status:rejected.length?'rejected':accepted.length===vote.players.length?'approved':'pending'};
}
export function travelApproved(vote,room,players){
 return vote?.status==='approved'&&vote.from===room&&Array.isArray(players)&&
  players.length===2&&players.every(id=>vote.accepted.includes(id));
}
export function travelPrompt(vote,localId){
 if(!vote||vote.status!=='pending')return null;
 return Object.freeze({destination:vote.to,requestedByMe:vote.accepted.includes(localId),
  canAccept:vote.players.includes(localId)&&!vote.accepted.includes(localId),
  expiresAt:vote.createdAt+TRAVEL_VOTE_TTL_MS});
}
